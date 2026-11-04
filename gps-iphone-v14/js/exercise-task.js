/* Shared plan/execution boundary. No persistence, GPS lifecycle or inferred actuals. */
(function (root) {
  "use strict";
  const number = (...values) => {
    for (const v of values) {
      if (v == null || v === "" || typeof v === "boolean") continue;
      const n = Number(v);
      if (Number.isFinite(n) && n >= 0) return n;
    }
    return null;
  };
  const positive = (...values) => { const n = number(...values); return n > 0 ? n : null; };
  const copy = (v) => v == null ? null : JSON.parse(JSON.stringify(v));
  function hash(value) {
    let h = 2166136261;
    for (const c of value) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
    return (h >>> 0).toString(16);
  }
  function validId(value) { return typeof value === "string" && /^[a-zA-Z0-9_-]{1,128}$/.test(value); }
  function newItemId() { return `item-${root.crypto.randomUUID()}`; }
  function legacyItemId(ex) {
    return `legacy-${hash(JSON.stringify([ex.stage || "", ex.exerciseId || ex.id || ex.drillId || ex.videoKey || "", ex.name || ""]))}`;
  }
  function sourceId(ex) {
    const placeholder = /тут|your[_ -]?video|placeholder|^none$|^null$/i;
    const explicit = ex.exerciseId || ex.id || ex.drillId;
    if (explicit && !(explicit === ex.videoKey && placeholder.test(String(explicit)))) return String(explicit);
    if (ex.videoKey && !placeholder.test(String(ex.videoKey))) return String(ex.videoKey);
    return `exercise-${hash(JSON.stringify([ex.stage || '', ex.name || '', ex.category || '']))}`;
  }
  // IDs are added only to the in-memory plan; callers own their existing save path.
  // Legacy keys remain attached so a saved plan can still read its old progress.
  function ensureItems(exercises) {
    if (!Array.isArray(exercises)) return exercises;
    const used = new Set();
    const stageCounts = {};
    for (const ex of exercises || []) {
      if (!ex || typeof ex !== "object") continue;
      ex.exerciseId = sourceId(ex);
      const stage = String(ex.stage || "").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
      const index = stageCounts[stage] || 0;
      stageCounts[stage] = index + 1;
      if (!validId(ex.planItemId) || used.has(ex.planItemId)) {
        const base = legacyItemId(ex);
        let id = base, suffix = 1;
        while (used.has(id)) id = `${base}-${++suffix}`;
        ex.planItemId = id;
        ex.legacyProgressKey = `${stage}_${index}_${String(ex.name || "").slice(0, 40).replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
      }
      used.add(ex.planItemId);
    }
    return exercises;
  }
  function ensurePlan(planData) {
    for (const value of Object.values(planData || {})) {
      for (const variant of Array.isArray(value) ? value : [value]) ensureItems(variant?.exercises);
    }
    return planData;
  }
  function resolve(ex = {}, context = {}) {
    const coach=ex.coachRunningPlan||{};
    const nested = ex.tacticalDrill?.exerciseObject || {};
    const engine = ex.timingEngine || nested.timingEngine || ex.tacticalDrill?.timingEngine || {};
    const timer = ex.timer || nested.timer || {};
    const cfg = ex.intervalSettings || nested.intervalSettings || engine.intervalSettings || {};
    const p = ex.prescription && typeof ex.prescription === "object" ? ex.prescription : nested.prescription || {};
    const measurements = [ex.measurements, nested.measurements, ex.tacticalDrill?.measurements].flatMap(v => Array.isArray(v) ? v : []);
    const runningTarget = ex.runningTarget || nested.runningTarget || engine.runningTarget || ex.tacticalDrill?.runningTarget || measurements.find(m => m?.runningTarget)?.runningTarget || null;
    const speedTarget = ex.speedTarget || nested.speedTarget || engine.speedTarget || ex.tacticalDrill?.speedTarget || measurements.find(m => m?.speedTarget)?.speedTarget || null;
    const text = [ex.type, ex.category, ex.subcategory, ex.quality, ex.name].join(" ").toLowerCase();
    const drill = Boolean(ex.drillId || ex.tacticalDrill || String(ex.videoKey || "").startsWith("drill:"));
    const timedDrill = drill && /aerobic|running|tempo|interval|metabolic|conditioning|hiit|high intensity|speed|sprint|agility/.test(text);
    const mode = ex.executionMode === "gym" ? "gym" : ex.executionMode === "running" || runningTarget || speedTarget || timedDrill || /\brunning\b|\bsprint\b|\brun\b|біг|спринт/.test(text) ? "running" : "gym";
    const blocks = positive(coach.blocks,timer.blocks, cfg.sets) ?? 1;
    const rounds = positive(coach.rounds,timer.rounds,cfg.rounds) ?? ((positive(timer.sets)||1)/blocks);
    const sets = coach.rounds!=null?blocks*rounds:positive(timer.sets) ?? (Object.keys(cfg).length ? blocks * rounds : positive(p.sets, ex.sets, ex.setsCount, ex.prescriptionSets));
    let workSec = positive(coach.workSec,timer.workSec, timer.workSeconds, cfg.workSeconds, p.timedSeconds,
      p.repsUnit === "sec" ? p.reps : null, ex.workSec, ex.durationSec, ex.durationSeconds, ex.holdSec,
      mode === "running" && !drill ? ex.duration : null, mode === "running" && sets === 1 ? runningTarget?.totalWorkSec : null);
    const restSec = number(coach.restSec,timer.restSec, timer.restSeconds, cfg.restSeconds, ex.restSec, ex.pauseSec, ex.rest);
    const routeRows=motionEstimates(ex.playerSeriesTotals?ex:ex.tacticalDrill||{});
    const marked=routeRows.filter(row=>row.isTarget),active=routeRows.filter(row=>row.distanceM>0||row.workSec>0);
    const selectedPlayer=coach.playerId;
    const routePlayer=selectedPlayer?routeRows.find(row=>row.playerId===selectedPlayer):marked.length===1?marked[0]:active.length===1?active[0]:routeRows.length===1?routeRows[0]:null;
    const distanceM = number(coach.distanceM,routePlayer?.distanceM) ?? positive(runningTarget?.targetDistanceM, speedTarget?.targetDistanceM, ex.distanceMeters, ex.targetDistanceM)
      ?? (positive(runningTarget?.targetDistanceKm) != null ? runningTarget.targetDistanceKm * 1000 : null);
    const routeWorkSec=positive(routePlayer?.workSec),routeRepeats=positive(routePlayer?.repetitions)||1;
    const routeIntervalSec=routeWorkSec==null?null:routeWorkSec/routeRepeats;
    const distancePerSeriesM=coach.distanceM!=null?(coach.distanceBasis==='per-series'?coach.distanceM:sets>0?coach.distanceM/sets:null):routePlayer?.distanceM!=null?routePlayer.distanceM/routeRepeats:distanceM!=null&&sets>0?distanceM/sets:null;
    const totalDistanceM=distancePerSeriesM!=null&&sets>0?distancePerSeriesM*sets:distanceM;
    const estimatedWorkSec=routeIntervalSec!=null?Math.ceil(routeIntervalSec):distancePerSeriesM>0?Math.ceil(distancePerSeriesM/(10/3.6)):null;
    const automaticWork=mode==='running'&&drill&&coach.workSec==null&&estimatedWorkSec!=null&&(routeIntervalSec!=null||routePlayer?.distanceM>0||workSec==null);
    if(automaticWork)workSec=estimatedWorkSec;
    const timingNeedsReview=false;
    const prepSec=number(coach.prepSec,timer.prepSec,timer.preparationSeconds,cfg.preparationSeconds)||0;
    const between=number(coach.restBetweenSetsSec,timer.restBetweenSets,cfg.restBetweenSets)||0;
    const totalRestSec=sets>0?Math.max(0,sets-blocks)*(restSec||0)+Math.max(0,blocks-1)*between:null;
    const totalDurationSec=sets>0&&workSec!=null?prepSec+sets*workSec+totalRestSec:null;
    const missing = [];
    if(timingNeedsReview)missing.push('runningTimingReview');
    if (sets != null && !Number.isInteger(sets)) missing.push("integerSets");
    if (mode === "running" && workSec == null) missing.push("workSec");
    if (sets == null) missing.push("sets");
    if (sets > 1 && restSec == null) missing.push("restSec");
    const itemId = validId(ex.planItemId) ? ex.planItemId : legacyItemId(ex);
    const exerciseId = sourceId(ex);
    const unit = mode === "running" ? "sec" : p.repsUnit || (positive(p.reps, ex.reps) != null ? "reps" : workSec != null ? "sec" : "reps");
    const reps = unit === "sec" ? null : positive(p.reps, ex.reps, ex.repsCount, ex.prescriptionReps);
    if (mode === "gym" && workSec == null && reps == null) missing.push("reps");
    return {
      schemaVersion: 1, mode, planItemId: itemId, exerciseId, exerciseName: String(ex.name || ''),
      context: { userId: context.userId || null, weekId: context.weekId || null,
        dayIdx: context.dayIdx ?? null, variantKey: context.variantKey || null, variantIndex: context.variantIndex ?? null,routePlayerId:context.routePlayerId||null },
      // sessionId/executionId are minted once at start by the execution owner in parts 4–6.
      sessionId: context.sessionId || null, executionId: context.executionId || null,
      planned: { sets, reps, loadKg: number(ex.loadKg, ex.weightKg, ex.weight, ex.kg, ex.load),
        trainingPercent1RM: number(ex.trainingPercent1RM),
        workSec, restSec, rounds, blocks,
        prepSec: number(coach.prepSec,timer.prepSec, timer.preparationSeconds, cfg.preparationSeconds),
        restBetweenSetsSec: number(coach.restBetweenSetsSec,timer.restBetweenSets, cfg.restBetweenSets),
        playerId:selectedPlayer||routePlayer?.playerId||null,routeSource:routePlayer?.distanceM!=null?routePlayer.source:null,routeRepetitions:routePlayer?.repetitions||null,routeByLoad:copy(routePlayer?.byLoad||null),routeActionCounts:copy(routePlayer?.actionCounts||null),distanceSource:coach.distanceM!=null?'coach':'diagram',diagramDistanceM:number(routePlayer?.distanceM),routeMode:routePlayer?'individual':routeRows.length>1?'group':null,routeWorkSec,routeIntervalSec,timingNeedsReview,estimatedWorkSec,distancePerSeriesM,totalDistanceM,totalRestSec,totalDurationSec,workIsEstimate:automaticWork,estimateSource:routeIntervalSec!=null?'authored-speeds':'10-kmh',timingSource:coach.workSec!=null?'coach':automaticWork?'estimated-route':drill?'saved-drill-settings':'plan',
        distanceM, cueEverySec: number(runningTarget?.cueEverySec),
        runningTarget: copy(runningTarget), speedTarget: copy(speedTarget) },
      actual: {}, missing, ready: missing.length === 0
    };
  }
  function toGPS(task) {
    if (task?.mode !== "running" || !task.ready) throw new Error("INCOMPLETE_RUNNING_TASK");
    const p = task.planned;
    // Current GPS engine accepts flat rounds/workSec/restSec. Series and cues stay
    // in task.planned for the execution bridge in part 5; this function performs no start.
    return { task: copy(task), intervalSettings: { rounds: p.sets, workSec: p.workSec, restSec: p.restSec ?? 0 } };
  }
  function seriesTotals(drill={}){
    const source=drill.playerSeriesTotals||drill.exerciseStructure?.playerSeriesTotals||drill.exerciseObject?.playerSeriesTotals;
    if(!Array.isArray(source))return [];
    const objects=drill.objects||[],clips=drill.motionClips||drill.exerciseStructure?.motionClips||[];
    const linked=new Set(objects.filter(o=>o.meta?.kind==='text'&&o.meta.linkedPlayerSeriesId).map(o=>String(o.meta.linkedPlayerSeriesId)));
    for(const o of objects){if(o.meta?.kind==='player'&&o.meta.seriesTextObjectId&&objects.some(t=>t.meta?.id===o.meta.seriesTextObjectId&&t.meta.kind==='text'))linked.add(String(o.meta.id));}
    return source.slice(0,100).filter(row=>row&&validId(String(row.playerId))).map(row=>{
      const byLoad={},actionCounts={};
      for(const key of ['sprint','hspd','acceleration','deceleration','recovery','run']){
        const distance=number(row.byLoad?.[key]);if(distance!=null)byLoad[key]=distance;
        const count=number(row.actionCounts?.[key]);if(count!=null)actionCounts[key]=count;
      }
      if(actionCounts.deceleration==null){const own=clips.filter(c=>c.objectId===row.playerId);if(own.length){const dcc=own.filter(c=>[c.segmentType,c.motionLoad,c.pattern,c.motionProfile].some(v=>/^(deceleration|decelerate|dcc|dec)$/.test(String(v||'').toLowerCase())));actionCounts.deceleration=new Set(dcc.map(c=>c.actionId||c.sourceObjectId||c.id||c)).size;}}
      return{playerId:String(row.playerId),playerNumber:number(row.playerNumber),repetitions:positive(row.repetitions),distanceM:number(row.distanceM),durationSeconds:number(row.durationSeconds),byLoad,actionCounts,isTarget:row.isTarget===true||linked.has(String(row.playerId))};
    });
  }
  function motionEstimates(drill={}){
    const totals=seriesTotals(drill);
    if(Array.isArray(totals)&&totals.length){
      return totals.slice(0,100).filter(row=>row&&validId(String(row.playerId))).map(row=>({
        playerId:String(row.playerId),name:String(row.playerNumber||row.playerId),source:'saved-diagram-series',
        distanceM:number(row.distanceM),workSec:number(row.durationSeconds),waitSec:null,startSec:0,endSec:null,
        repetitions:positive(row.repetitions),isTarget:row.isTarget,byLoad:copy(row.byLoad),actionCounts:copy(row.actionCounts)
      }));
    }
    const players=(drill.objects||[]).map(item=>item.meta||{}).filter(meta=>meta.kind==='player');
    const ids=new Set(players.map(player=>player.id));
    const cycleSec=Math.max(0,...(drill.motionClips||[]).filter(clip=>ids.has(clip.objectId)).map(clip=>(Number(clip.start)||0)+(Number(clip.duration)||0)));
    return players.map(player=>{
      const clips=(drill.motionClips||[]).filter(clip=>clip.objectId===player.id&&Number(clip.duration)>0&&Number(clip.start)>=0&&!/pause|wait|hold/.test(clip.pattern||''));
      const spans=clips.map(clip=>[Number(clip.start),Number(clip.start)+Number(clip.duration)]).sort((a,b)=>a[0]-b[0]);
      const merged=[];for(const span of spans){const last=merged.at(-1);if(last&&span[0]<=last[1])last[1]=Math.max(last[1],span[1]);else merged.push([...span]);}
      const workSec=merged.reduce((sum,[a,b])=>sum+b-a,0),startSec=merged[0]?.[0]??0,endSec=merged.at(-1)?.[1]??0;
      const distances=clips.map(clip=>number(clip.distanceM));
      return{playerId:String(player.id),name:String(player.label||player.name||player.playerNumber||player.id),source:'animation-estimate',startSec,endSec,workSec,waitSec:Math.max(0,cycleSec-workSec),
        distanceM:clips.length&&distances.every(d=>d!=null)?distances.reduce((a,b)=>a+b,0):null};
    });
  }
  function editRunningPlan(planData,context,planItemId,values,expected){
    const next=copy(planData),variantList=next?.[`status_plan_${context.variantKey}`],variant=Array.isArray(variantList)?variantList[context.variantIndex]:context.variantIndex===0?variantList:null;
    if(!variant?.exercises)throw Error('PLAN_NOT_FOUND');
    if(!variant.exercises.some(item=>item.planItemId===planItemId)){const normalized=copy(variant.exercises);ensureItems(normalized);const index=normalized.findIndex(item=>item.planItemId===planItemId);if(index>=0)variant.exercises[index]=normalized[index];}
    const ex=variant.exercises.find(item=>item.planItemId===planItemId);if(!ex)throw Error('EXERCISE_NOT_FOUND');
    if(expected!=null&&JSON.stringify(ex.coachRunningPlan||null)!==expected)throw Error('PLAN_CHANGED_REOPEN');
    const input={};for(const key of ['workSec','restSec','rounds','blocks','prepSec','restBetweenSetsSec']){const v=values[key];if(!Number.isInteger(v)||v<(['workSec','rounds','blocks'].includes(key)?1:0)||v>86400)throw Error('INVALID_RUNNING_PLAN');input[key]=v;}
    if(input.rounds*input.blocks>500||typeof values.playerId!=='string'||values.playerId.length>128)throw Error('INVALID_RUNNING_PLAN');
    const metres=values.distanceM===undefined?ex.coachRunningPlan?.distanceM:values.distanceM;if(metres!=null&&(typeof metres!=='number'||!Number.isFinite(metres)||metres<0||metres>1000000))throw Error('INVALID_RUNNING_DISTANCE');
    if(metres!=null){input.distanceM=metres;if(values.distanceBasis==='per-series')input.distanceBasis='per-series';else if(values.distanceBasis===undefined&&ex.coachRunningPlan?.distanceBasis==='per-series')input.distanceBasis='per-series';}input.playerId=values.playerId;ex.coachRunningPlan=input;
    if(Array.isArray(values.playerSeriesTotals))ex.playerSeriesTotals=seriesTotals({playerSeriesTotals:values.playerSeriesTotals});
    return next;
  }
  const api = { resolve, ensureItems, ensurePlan, newItemId, toGPS, motionEstimates, seriesTotals, editRunningPlan };
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.PACExerciseTask = api;
})(globalThis);
