/* Session v2 Phase 1: pure decisions + explicitly injected transactional adapter.
 * No Firebase import/config, implicit adapter, listeners, UI or persistence.
 * Only a memory test adapter ships with this phase. Actor IDs here are supplied
 * test principals, NOT authentication or a replacement for Firebase Rules.
 * Create sessionId once, persist it with the command, reuse on every retry.
 * Idempotency covers the latest mutation only; older replays conflict safely.
 * No v1 writes, GPS lifecycle writes, deletes or cross-document feedback writes.
 */
(function (root) {
  "use strict";
  const N = typeof module !== "undefined" && module.exports ? require("./session-normalizer.js") : root?.PACSessionNormalizer;
  const FIELDS = ["date", "timezone", "timePrecision", "startedAt", "endedAt", "status", "planned", "actual", "context"];
  const METRICS = ["rpe", "duration", "distance", "maxSpeed", "speedZones"];
  const SOURCES = ["manual", "measured", "imported", "estimated", "unavailable"];

  function fail(code) { const error = new Error(code); error.code = code; throw error; }
  // Deliberately JSON-like and detached: no mutable SDK objects, undefined,
  // non-finite values, accessors or prototype keys in write commands.
  function copy(value) {
    if (value === null || typeof value === "string" || typeof value === "boolean") return value;
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (value instanceof Date && Number.isFinite(value.getTime())) return value.toISOString();
    if (Array.isArray(value)) return value.map(copy);
    if (!value || typeof value !== "object" || ![Object.prototype, null].includes(Object.getPrototypeOf(value))) fail("INVALID_DATA");
    const result = {};
    for (const key of Object.keys(value)) {
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (["__proto__", "constructor", "prototype"].includes(key) || descriptor.get || descriptor.set) fail("INVALID_DATA");
      result[key] = copy(value[key]);
    }
    return result;
  }
  function canonical(value) {
    if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
    if (value && typeof value === "object") return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(",")}}`;
    return JSON.stringify(value);
  }
  function object(value) { if (!value || typeof value !== "object" || Array.isArray(value)) fail("INVALID_DATA"); }
  function keys(value, allowed) {
    object(value);
    if (Object.keys(value).some((key) => !allowed.includes(key))) fail("FIELD_NOT_ALLOWED");
  }
  function principal(value) {
    if (typeof value !== "string" || !/^[A-Za-z0-9_-]{1,128}$/.test(value)) fail("INVALID_OWNER");
    return value;
  }
  function identifier(value, code) {
    // Session IDs omit underscores, so userId_sessionId is unambiguous even
    // when a user ID contains underscores. Dates are never session IDs we mint.
    if (typeof value !== "string" || !/^[A-Za-z0-9][A-Za-z0-9-]{0,127}$/.test(value)) fail(code);
    return value;
  }
  function sessionDocumentId(userId, sessionId) { return `${principal(userId)}_${identifier(sessionId, "INVALID_SESSION_ID")}`; }
  function createSessionId(uuidFactory) {
    const generator = uuidFactory || (() => {
      if (!globalThis.crypto || typeof globalThis.crypto.randomUUID !== "function") fail("SECURE_ID_GENERATOR_REQUIRED");
      return globalThis.crypto.randomUUID();
    });
    const uuid = generator();
    if (typeof uuid !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid)) fail("INVALID_GENERATED_ID");
    return `s-${uuid.toLowerCase()}`;
  }
  function clock(value) {
    const validString = typeof value === "string" && /T.*(?:Z|[+-]\d{2}:\d{2})$/.test(value);
    if (!(value instanceof Date) && !validString) fail("INVALID_CLOCK");
    const date = new Date(value);
    if (!Number.isFinite(date.getTime())) fail("INVALID_CLOCK");
    return date.toISOString();
  }
  function assertOwner(data, actorId, docId) {
    principal(actorId);
    if (!data || (data.userId ?? data.uid) !== actorId || (data.uid != null && data.uid !== actorId)
      || !docId.startsWith(`${actorId}_`)) fail("OWNER_MISMATCH");
    // Read compatibility is broader than IDs minted by this phase. Do not reject
    // an existing v2 ID just because it contains an underscore.
    if (data.schemaVersion === 2 && (typeof data.sessionId !== "string" || data.sessionId.includes("/")
      || `${actorId}_${data.sessionId}` !== docId)) fail("OWNER_MISMATCH");
  }
  function validateMetric(input) {
    if (input === null) return; // Explicit clear; normalizer emits unavailable.
    keys(input, ["value", "unit", "source", "recordedAt", "provider", "quality"]);
    if (!("value" in input) || !SOURCES.includes(input.source)) fail("INVALID_METRIC");
    if ((input.value === null) !== (input.source === "unavailable")) fail("INVALID_METRIC");
    if (input.quality !== undefined) {
      keys(input.quality, ["status", "validation"]);
      if (input.quality.status !== undefined && !["unknown", "ok", "partial", "rejected"].includes(input.quality.status)) fail("INVALID_METRIC");
      if (input.quality.validation !== undefined && !["none", "client"].includes(input.quality.validation)) fail("UNTRUSTED_VALIDATION");
    }
  }
  function validatePatch(patch, creating) {
    keys(patch, FIELDS);
    if (!Object.keys(patch).length) fail("EMPTY_PATCH");
    if (patch.status !== undefined && !["draft", "completed"].includes(patch.status)) fail("UNSUPPORTED_LIFECYCLE");
    for (const key of ["actual", "planned"]) {
      if (patch[key] !== undefined) {
        keys(patch[key], METRICS);
        if (!creating && !Object.keys(patch[key]).length) fail("EMPTY_PATCH");
        Object.values(patch[key]).forEach(validateMetric);
      }
    }
    if (patch.context !== undefined) {
      // Cross-document refs need a separate ownership/transaction design.
      keys(patch.context, ["weekId", "dayIdx"]);
      if (patch.context.weekId !== undefined && patch.context.weekId !== null && typeof patch.context.weekId !== "string") fail("INVALID_CONTEXT");
      if (patch.context.dayIdx !== undefined && patch.context.dayIdx !== null
        && (!Number.isInteger(patch.context.dayIdx) || patch.context.dayIdx < 0 || patch.context.dayIdx > 6)) fail("INVALID_CONTEXT");
    }
  }
  function mergeFields(current, patch) {
    const result = copy(current);
    for (const key of Object.keys(patch)) {
      if (["actual", "planned", "context"].includes(key)) result[key] = { ...(result[key] || {}), ...copy(patch[key]) };
      else result[key] = copy(patch[key]);
    }
    return result;
  }
  function metricData(metric) {
    return { value: copy(metric.value), unit: metric.unit, source: metric.source, recordedAt: metric.recordedAt,
      provider: metric.provider, quality: copy(metric.quality) };
  }
  function validateAndDerive(document, docId, now) {
    const candidate = copy(document);
    delete candidate.sessionLoad; // Never let a client/stale cache supply the load.
    const normalized = N.normalizeSession({ id: docId, data: candidate });
    if (!normalized.normalization.valid || normalized.normalization.issues.length) fail("INVALID_SESSION");
    if (normalized.actual.rpe.value !== null && normalized.actual.duration.value !== null && normalized.sessionLoad.value === null) fail("LOAD_OVERFLOW");
    const result = copy(candidate);
    for (const part of ["planned", "actual"]) {
      result[part] = Object.fromEntries(METRICS.map((field) => [field, metricData(normalized[part][field])]));
    }
    result.startedAt = normalized.startedAt;
    result.endedAt = normalized.endedAt;
    result.sessionLoad = { ...metricData(normalized.sessionLoad), formula: normalized.sessionLoad.formula,
      inputRevision: result.revision, recordedAt: now };
    return result;
  }
  function signature(kind, docId, mutationId, payload) {
    identifier(mutationId, "INVALID_MUTATION_ID");
    // Equality receipt, not a cryptographic signature. One latest command only,
    // bounded in size, stored with the same session (no new history collection).
    const value = canonical({ kind, docId, mutationId, payload });
    if (value.length > 32768) fail("COMMAND_TOO_LARGE");
    return value;
  }
  function replay(current, mutationId, receipt) {
    if (current.lastMutationId !== mutationId) return false;
    if (current.lastMutationSignature !== receipt) fail("IDEMPOTENCY_KEY_REUSE");
    return true;
  }
  function decision(document, write) { return { document: copy(document), write }; }

  function prepareCreate(command, existing) {
    const { actorId, sessionId, mutationId } = command;
    const docId = sessionDocumentId(actorId, sessionId);
    const input = copy(command.input);
    validatePatch(input, true);
    const receipt = signature("create", docId, mutationId, input);
    if (existing) {
      assertOwner(existing, actorId, docId);
      if (existing.schemaVersion !== 2) fail("LEGACY_READ_ONLY");
      if (existing.status === "deleted") fail("SESSION_DELETED");
      if (replay(existing, mutationId, receipt)) return decision(existing, false);
      fail("SESSION_EXISTS");
    }
    const now = clock(command.now);
    const defaults = { schemaVersion: 2, userId: actorId, sessionId, status: "draft", timePrecision: "day", startedAt: null, endedAt: null,
      actual: {}, planned: {}, context: {}, gps: { mode: "none", routeStatus: "none", routeRef: null, routeHash: null, routeRevision: 0 },
      origin: { provider: null, externalActivityId: null, importFingerprint: null }, feedbackRef: null, legacyRef: null };
    const candidate = mergeFields(defaults, input);
    Object.assign(candidate, { revision: 1, createdAt: now, updatedAt: now, lastMutationId: mutationId, lastMutationSignature: receipt });
    return decision(validateAndDerive(candidate, docId, now), true);
  }
  function preparePatch(command, existing) {
    const { actorId, sessionId, mutationId, expectedRevision } = command;
    const docId = sessionDocumentId(actorId, sessionId);
    if (!existing) fail("SESSION_NOT_FOUND");
    assertOwner(existing, actorId, docId);
    if (existing.schemaVersion !== 2) fail("LEGACY_READ_ONLY");
    if (existing.status === "deleted") fail("SESSION_DELETED");
    if (!Number.isSafeInteger(expectedRevision) || expectedRevision < 1) fail("INVALID_REVISION");
    const patch = copy(command.patch);
    validatePatch(patch);
    const receipt = signature("patch", docId, mutationId, { expectedRevision, patch });
    if (replay(existing, mutationId, receipt)) return decision(existing, false);
    if (!Number.isSafeInteger(existing.revision) || existing.revision !== expectedRevision) fail("REVISION_CONFLICT");
    if (!Number.isSafeInteger(existing.revision + 1)) fail("INVALID_REVISION");
    const now = clock(command.now);
    const candidate = mergeFields(existing, patch);
    Object.assign(candidate, { revision: existing.revision + 1, updatedAt: now, lastMutationId: mutationId, lastMutationSignature: receipt });
    return decision(validateAndDerive(candidate, docId, now), true);
  }

  function createSessionRepository({ actorId, adapter, now, uuidFactory }) {
    principal(actorId);
    if (!N || !adapter || !["read", "list", "transact"].every((key) => typeof adapter[key] === "function") || typeof now !== "function") fail("EXPLICIT_TEST_ADAPTER_AND_CLOCK_REQUIRED");
    function normalizeOwned(entry) {
      assertOwner(entry.data, actorId, entry.id);
      return N.normalizeSession(entry);
    }
    async function write(kind, command) {
      const docId = sessionDocumentId(actorId, command.sessionId);
      const data = copy(command); // Freeze command meaning across async retries.
      keys(data, kind === "create" ? ["sessionId", "mutationId", "input"] : ["sessionId", "mutationId", "expectedRevision", "patch"]);
      const result = await adapter.transact(docId, (existing) => (kind === "create" ? prepareCreate : preparePatch)({ ...data, actorId, now: now() }, existing));
      return { document: copy(result.document), normalized: normalizeOwned({ id: docId, data: result.document }), replayed: !result.write };
    }
    return Object.freeze({
      newSessionId: () => createSessionId(uuidFactory),
      async read(docId) {
        if (typeof docId !== "string" || !docId.startsWith(`${actorId}_`) || docId.includes("/")) fail("OWNER_MISMATCH");
        const data = await adapter.read(docId);
        return data ? normalizeOwned({ id: docId, data }) : null;
      },
      async list() {
        const entries = await adapter.list(actorId);
        entries.forEach((entry) => assertOwner(entry.data, actorId, entry.id));
        return N.normalizeSessions(entries);
      },
      create: (command) => write("create", command),
      patch: (command) => write("patch", command)
    });
  }
  function journalMetric(value, unit, source, now) {
    return value == null ? {value:null,unit,source:"unavailable"} : {value,unit,source,recordedAt:now,provider:"daily-journal",quality:{status:"partial",validation:"client"}};
  }
  function journalSummary(record) {
    const a=record.actual || {}, running=record.kind==="running", p=running?record.task.planned||{}:{...record.task.planned,...a.effectivePrescription};
    const sets=running?(a.runningIntervals||[]):(a.strengthSets||[]);
    if(!Array.isArray(sets)||sets.length>500)fail("INVALID_EXECUTION");
    const count=value=>typeof value==="number"&&Number.isFinite(value)&&value>=0;
    for(const row of sets){
      if(!row||typeof row!=="object")fail("INVALID_EXECUTION");
      if(running){if(!Number.isInteger(row.round)||row.round<1||!count(row.workSec)||row.distanceM!=null&&!count(row.distanceM))fail("INVALID_EXECUTION");}
      else if(!Number.isInteger(row.setIndex)||row.setIndex<1||row.loadKg!=null&&!count(row.loadKg)||row.reps!=null&&(!Number.isInteger(row.reps)||row.reps<0)||!count(row.workSec))fail("INVALID_EXECUTION");
    }
    const sides=!running?(p.sideTotal|| (sets.some(row=>row.side!=null)?2:1)):1;
    const plannedCount=Number(p.sets)||null, targetReps=Number(p.reps)||null;
    const actualReps=running?null:sets.reduce((sum,row)=>sum+(row.reps||0),0);
    const workSec=running?sets.reduce((sum,row)=>sum+row.workSec,0):null;
    const expectedWork=running&&plannedCount&&p.workSec>0?plannedCount*p.workSec:null;
    const distance=running&&a.gps?.hasMeasurements===true&&count(a.distanceM)?a.distanceM:null;
    const workDistance=running&&sets.length&&sets.every(row=>count(row.distanceM))?sets.reduce((sum,row)=>sum+row.distanceM,0):null;
    const pace=workDistance>0&&workSec>0?workSec/(workDistance/1000):null;
    const pct=(actual,target)=>target>0&&actual!=null?Math.round(actual/target*100):null;
    const countPct=pct(sets.length,plannedCount==null?null:plannedCount*sides),repsPct=pct(actualReps,targetReps&&plannedCount?targetReps*plannedCount*sides:null),timePct=pct(workSec,expectedWork),distancePct=pct(workDistance,p.totalDistanceM??p.distanceM);
    const goalMet=a.status!=="stopped"&&a.strengthMode!=="test3"&&countPct>=100&&(running?timePct>=100&&(!((p.totalDistanceM??p.distanceM)>0)||distancePct>=100):targetReps>0?repsPct>=100:p.workSec>0&&sets.every(row=>row.workSec>=p.workSec));
    return {executionId:record.executionId,kind:record.kind,mode:a.strengthMode||"running",planItemId:record.task.planItemId,goalMet:Boolean(goalMet),
      exerciseId:record.task.exerciseId,name:String(record.task.exerciseName||"").slice(0,220),endedAt:record.endedAt,status:a.status||"completed",
      plannedCount:plannedCount==null?null:plannedCount*sides,recordedCount:sets.length,
      countPct,repsPct,timePct,distancePct,paceSecPerKm:pace,
      paceDeltaSecPerKm:pace!=null&&p.runningTarget?.paceSecPerKm>0?pace-p.runningTarget.paceSecPerKm:null,
      distanceKm:distance==null?null:distance/1000,durationMin:running&&count(a.activeMs)?a.activeMs/60000:null,
      route:record.route||null};
  }
  // Dedicated handoff commands deliberately do not widen generic patch permissions.
  function prepareExecution(command, existing, existingExecution) {
    const {actorId,record}=command, now=clock(command.now);principal(actorId);
    const value=copy(record);keys(value,["userId","executionId","date","timezone","kind","task","actual","startedAt","endedAt","route"]);
    identifier(value.executionId,"INVALID_EXECUTION_ID");
    if(value.userId!==actorId||value.task?.context?.userId!==actorId)fail("OWNER_MISMATCH");
    if(!["gym","running"].includes(value.kind)||value.task.mode!==value.kind)fail("INVALID_EXECUTION");
    const sessionId=`daily-${value.date}`,docId=sessionDocumentId(actorId,sessionId),receipt=canonical(value);
    if(receipt.length>180000)fail("EXECUTION_TOO_LARGE");
    if(value.route){keys(value.route,["path","sha256","bytes"]);if(value.route.path!==`training-routes/${actorId}/${value.executionId}.json`||!/^[a-f0-9]{64}$/.test(value.route.sha256)||!Number.isInteger(value.route.bytes)||value.route.bytes<1||value.route.bytes>20*1024*1024)fail("INVALID_ROUTE");}
    if(existing)assertOwner(existing,actorId,docId);
    if(existingExecution){if(existingExecution.userId!==actorId||existingExecution.sessionId!==sessionId||existingExecution.signature!==receipt)fail("EXECUTION_CONFLICT");return {...decision(existing,false),execution:copy(existingExecution)};}
    if(existing?.executionIndex?.[value.executionId])fail("ORPHANED_EXECUTION_INDEX");
    const summary=journalSummary(value),index={...(existing?.executionIndex||{}),[value.executionId]:summary};
    if(Object.keys(index).length>250)fail("SESSION_TOO_LARGE");
    const rows=Object.values(index),runs=rows.filter(row=>row.kind==="running");
    const actual={distance:journalMetric(runs.length&&runs.every(row=>row.distanceKm!=null)?runs.reduce((sum,row)=>sum+row.distanceKm,0):null,"km","measured",now)};
    if(existing?.actual?.duration?.source!=="manual")actual.duration=journalMetric(rows.length===1&&runs.length===1?runs[0].durationMin:null,"min","measured",now);
    const input={date:value.date,timezone:value.timezone,timePrecision:"day",status:"completed",actual,
      context:{weekId:value.task.context.weekId||null,dayIdx:value.task.context.dayIdx??null}};
    const base=existing?preparePatch({actorId,sessionId,mutationId:`save-${value.executionId}`,expectedRevision:existing.revision,patch:input,now},existing):prepareCreate({actorId,sessionId,mutationId:`save-${value.executionId}`,input,now},null);
    base.document.executionIndex=index;base.document.origin.provider="daily";
    return {...base,execution:{userId:actorId,sessionId,executionId:value.executionId,signature:receipt,payload:value,summary}};
  }
  function prepareFeedback(command, existing) {
    const {actorId,date,timezone,rpe,duration,stars,comment,context}=command,now=clock(command.now),sessionId=`daily-${date}`;
    if(!Number.isInteger(rpe)||rpe<1||rpe>10||!Number.isFinite(duration)||duration<=0||duration>1440||!Number.isInteger(stars)||stars<0||stars>5||typeof comment!=="string"||comment.length>4000)fail("INVALID_FEEDBACK");
    const input={date,timezone,timePrecision:"day",status:"completed",context,
      actual:{rpe:journalMetric(rpe,"1-10","manual",now),duration:journalMetric(duration,"min","manual",now)}};
    const mutationId=command.mutationId||`feedback-${date}-${rpe}-${duration}-${stars}`;
    const base=existing?preparePatch({actorId,sessionId,mutationId,expectedRevision:existing.revision,patch:input,now},existing):prepareCreate({actorId,sessionId,mutationId,input,now},null);
    base.document.feedbackRef=`athlete_reports/${actorId}_${sessionId}`;
    base.document.origin.provider="daily";
    return {...base,feedback:{uid:actorId,userId:actorId,sessionId,date,weekId:context.weekId,dayIdx:context.dayIdx,rpe,stars,comment,updatedAt:now,reportType:"training_feedback"}};
  }
  function prepareLegacyResolution(command,legacy,daily) {
    const {actorId,date,choice}=command,now=clock(command.now),legacyId=`${actorId}_${date}`;
    if(!legacy||(legacy.userId??legacy.uid)!==actorId||legacy.date!==date||legacy.schemaVersion===2)fail("INVALID_LEGACY_RESOLUTION");
    if(!["same","separate"].includes(choice))fail("INVALID_LEGACY_RESOLUTION");
    if(legacy.aggregationStatus==="superseded")return{write:false};
    const actual={};
    for(const [key,unit] of [["duration","min"],["rpe","1-10"],["distance","km"]]){
      const n=Number(legacy[key]);if(legacy[key]!=null&&Number.isFinite(n)&&n>=0&&(key!=="rpe"||n>=1&&n<=10))actual[key]=journalMetric(n,unit,"manual",now);
    }
    const sessionId=choice==="same"?`daily-${date}`:`manual-${date}-legacy`,docId=sessionDocumentId(actorId,sessionId);
    let result;
    if(choice==="same"){
      if(!daily)fail("SESSION_NOT_FOUND");
      for(const key of Object.keys(actual))if(daily.actual?.[key]?.value!=null)delete actual[key];
      result=Object.keys(actual).length?preparePatch({actorId,sessionId,mutationId:`resolve-${date}`,expectedRevision:daily.revision,patch:{actual},now},daily):decision(daily,false);
    }else result=prepareCreate({actorId,sessionId,mutationId:`legacy-${date}`,input:{date,timezone:command.timezone,timePrecision:"day",status:"completed",actual},now},null);
    result.document.legacyRef=`load_season_reports/${legacyId}`;
    return{write:true,docId,document:result.document,legacy:{...copy(legacy),aggregationStatus:"superseded",replacementIds:[sessionId]}};
  }
  const api = { createSessionId, sessionDocumentId, prepareCreate, preparePatch, createSessionRepository, prepareExecution, prepareFeedback, prepareLegacyResolution };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else if (root) root.PACSessionRepository = api;
})(typeof window !== "undefined" ? window : null);
