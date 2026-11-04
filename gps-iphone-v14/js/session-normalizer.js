/* Independent, read-only session adapter. No Firebase, DOM, clock or storage access.
 * Input: raw data with id, { id, data }, or a Firestore-like snapshot with data().
 * Helpers consume normalizeSessions() output; normalizeSession() retains diagnostics.
 * Calendar analytics require asOf YYYY-MM-DD; reportTimezone defaults explicitly to UTC.
 * confirmedDates asserts fully ingested days (including rest); observations alone do
 * not prove complete history. Partial sums are exposed with provisional=true.
 * CommonJS: require('./session-normalizer'); browser: window.PACSessionNormalizer.
 */
(function (root) {
  "use strict";

  const SOURCES = ["manual", "measured", "imported", "estimated", "unavailable"];
  const STATUSES = ["draft", "completed", "deleted"];
  const FIELDS = ["rpe", "duration", "distance", "maxSpeed", "speedZones"];
  const UNITS = { rpe: "1-10", duration: "min", distance: "km", maxSpeed: "km/h", speedZones: "zones" };
  const FACTORS = { duration: { min: 1, s: 1 / 60, h: 60 }, distance: { km: 1, m: 0.001 }, maxSpeed: { "km/h": 1, "m/s": 3.6 } };

  function str(value) { return typeof value === "string" && value.trim() ? value.trim() : null; }
  function number(value, legacy) {
    if (legacy && typeof value === "string" && value.trim()) value = Number(value);
    return typeof value === "number" && Number.isFinite(value) ? value : null;
  }
  function validDate(value) {
    return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
      && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
  }
  function instant(value) {
    if (value == null) return null;
    try {
      let ms;
      if (value instanceof Date) ms = value.getTime();
      else if (typeof value.toMillis === "function") ms = value.toMillis();
      else if (typeof value.toDate === "function") ms = value.toDate().getTime();
      else if (typeof value === "number") ms = value;
      else if (typeof value === "object" && Number.isFinite(value.seconds ?? value._seconds)) {
        ms = (value.seconds ?? value._seconds) * 1000 + (value.nanoseconds ?? value._nanoseconds ?? 0) / 1e6;
      } else if (typeof value === "string" && validDate(value.slice(0, 10)) && /T.*(?:Z|[+-]\d{2}:\d{2})$/.test(value)) ms = Date.parse(value);
      return Number.isFinite(ms) ? new Date(ms).toISOString() : null;
    } catch (_) { return null; }
  }
  function formatter(timezone) {
    return new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" });
  }
  function dateAt(timestamp, timezone) {
    const parts = formatter(timezone).formatToParts(new Date(timestamp));
    const part = (type) => parts.find((p) => p.type === type).value;
    return `${part("year")}-${part("month")}-${part("day")}`;
  }
  function unavailable(field, legacy) {
    return { value: null, unit: UNITS[field] || "AU", source: "unavailable", recordedAt: null, provider: null,
      quality: { status: "unknown", validation: "none" }, legacy: !!legacy };
  }
  function zones(value) {
    if (!value || !str(value.definitionVersion) || !Array.isArray(value.zones) || !value.zones.length || value.zones.length > 20) return null;
    const ids = new Set();
    const rows = [];
    for (const z of value.zones) {
      if (!z || !str(z.id) || ids.has(z.id)) return null;
      const min = number(z.minKmh), max = z.maxKmh === null ? null : number(z.maxKmh);
      const distance = number(z.distanceKm), seconds = number(z.seconds);
      if (min === null || min < 0 || (max === null ? z.maxKmh !== null : max <= min)
        || distance === null || distance < 0 || seconds === null || seconds < 0) return null;
      const previous = rows[rows.length - 1];
      if (previous && (previous.maxKmh === null || min < previous.maxKmh)) return null;
      ids.add(z.id);
      rows.push({ id: z.id, minKmh: min, maxKmh: max, distanceKm: distance, seconds });
    }
    return { definitionVersion: value.definitionVersion, zones: rows };
  }
  function metric(raw, field, legacy, legacySource, issues) {
    const result = unavailable(field, legacy);
    if (raw == null) return result;
    const input = legacy ? { value: raw, unit: UNITS[field], source: legacySource } : raw;
    if (!input || typeof input !== "object" || Array.isArray(input)) { issues.push(`${field}:invalid_metric`); return result; }
    const source = SOURCES.includes(input.source) ? input.source : "unavailable";
    const quality = input.quality || {};
    result.source = source;
    result.recordedAt = instant(input.recordedAt);
    result.provider = str(input.provider);
    result.quality = {
      status: ["unknown", "ok", "partial", "rejected"].includes(quality.status) ? quality.status : "unknown",
      validation: ["none", "client", "server"].includes(quality.validation) ? quality.validation : "none"
    };
    if (input.value == null) { result.source = "unavailable"; return result; }
    if (result.quality.status === "rejected") { issues.push(`${field}:rejected`); result.source = "unavailable"; return result; }
    if (!legacy && source === "unavailable") { issues.push(`${field}:missing_source`); return result; }
    if (field === "speedZones") {
      result.value = input.unit === "zones" ? zones(input.value) : null;
    } else {
      const n = number(input.value, legacy);
      const factor = FACTORS[field] ? FACTORS[field][input.unit] : input.unit === UNITS[field] ? 1 : undefined;
      const value = n === null || factor === undefined ? null : n * factor;
      result.value = value !== null && Number.isFinite(value) && value >= 0 && (field !== "rpe" || (value >= 1 && value <= 10)) ? value : null;
    }
    if (result.value === null) { issues.push(`${field}:invalid_value_or_unit`); result.source = "unavailable"; }
    return result;
  }
  function separatePlannedActual(data, legacy, issues) {
    if (!data || typeof data !== "object") throw new TypeError("Expected session data");
    if (legacy === undefined) legacy = data.schemaVersion === undefined || data.schemaVersion === 1;
    const planned = {}, actual = {};
    issues = issues || [];
    for (const field of FIELDS) {
      planned[field] = metric(legacy ? null : data.planned?.[field], field, false, null, issues);
      actual[field] = metric(legacy ? data[field] : data.actual?.[field], field, legacy, data.source, issues);
    }
    return { planned, actual };
  }
  function deriveLoad(actual, revision) {
    const result = unavailable("sessionLoad");
    result.formula = "duration_min*rpe:v1";
    result.inputRevision = revision;
    if (actual.rpe.value !== null && actual.duration.value !== null) {
      const value = actual.rpe.value * actual.duration.value;
      if (Number.isFinite(value)) {
        result.value = value;
        result.source = "estimated";
        result.quality = { status: [actual.rpe, actual.duration].every((m) => m.quality.status === "ok") ? "ok" : "partial", validation: "client" };
      }
    }
    return result;
  }

  function normalizeSession(record, options) {
    options = options || {};
    if (!record || typeof record !== "object" || Array.isArray(record)) throw new TypeError("Expected a session record");
    const data = typeof record.data === "function" ? record.data() : record.data && typeof record.data === "object" ? record.data : record;
    if (!data || typeof data !== "object" || Array.isArray(data)) throw new TypeError("Expected document data");
    const errors = [], issues = [];
    const version = data.schemaVersion === undefined ? 1 : data.schemaVersion;
    const legacy = version === 1;
    if (version !== 1 && version !== 2) errors.push("unsupported_schema_version");
    let docId = str(options.docId) || str(record.id);
    const suffix = docId && /^(.*)_(\d{4}-\d{2}-\d{2})$/.exec(docId);
    const userId = str(data.userId) || str(data.uid) || (legacy && suffix ? str(suffix[1]) : null);
    if (!legacy && !str(data.userId)) errors.push("missing_userId");
    const date = data.date === undefined && legacy && suffix ? suffix[2] : data.date;
    if (!docId && legacy && userId && validDate(date)) docId = `${userId}_${date}`;
    const sessionId = legacy && docId ? `legacy:${docId}` : str(data.sessionId);
    if (!userId || !sessionId) errors.push("missing_identity");
    if (data.uid != null && data.uid !== userId) errors.push("owner_mismatch");
    if (docId && userId && (legacy ? docId !== `${userId}_${date}` : docId !== `${userId}_${sessionId}`)) errors.push("document_id_mismatch");
    const status = data.status === undefined && legacy ? "completed" : data.status;
    if (!validDate(date) && status !== "deleted") errors.push("invalid_event_date");
    if (!STATUSES.includes(status)) errors.push("invalid_status");
    const revision = legacy && data.revision === undefined ? 0 : data.revision;
    if (!Number.isInteger(revision) || revision < (legacy ? 0 : 1)) errors.push("invalid_revision");
    const timezone = str(data.timezone);
    let validTimezone = !!timezone;
    try { if (timezone) formatter(timezone); } catch (_) { validTimezone = false; }
    const timePrecision = legacy ? "day" : data.timePrecision;
    const startedAt = legacy ? null : instant(data.startedAt), endedAt = legacy ? null : instant(data.endedAt);
    if (!legacy && status !== "deleted" && (!validTimezone || !["day", "instant"].includes(timePrecision))) errors.push("invalid_time_context");
    if (!legacy && timePrecision === "instant") {
      if (!startedAt || (data.endedAt != null && !endedAt) || (status === "completed" && !endedAt)) errors.push("invalid_event_time");
      if (startedAt && endedAt && endedAt < startedAt) errors.push("end_before_start");
      if (startedAt && validTimezone && dateAt(startedAt, timezone) !== date) errors.push("event_date_mismatch");
    }
    if (!legacy && timePrecision === "day" && (data.startedAt != null || data.endedAt != null)) errors.push("day_precision_has_time");
    const parts = separatePlannedActual(data, legacy, issues);
    const sessionLoad = deriveLoad(parts.actual, revision);
    if (!legacy && data.sessionLoad != null && (data.sessionLoad.inputRevision !== revision
      || data.sessionLoad.value !== sessionLoad.value || data.sessionLoad.formula !== sessionLoad.formula)) issues.push("sessionLoad:cache_mismatch");
    const gps = data.gps || {}, context = data.context || {}, origin = data.origin || {};
    return {
      schemaVersion: version, userId, sessionId, docId, revision, status: STATUSES.includes(status) ? status : "draft",
      date: validDate(date) ? date : null, timezone: validTimezone ? timezone : null, timePrecision,
      startedAt, endedAt, createdAt: instant(data.createdAt), updatedAt: instant(data.updatedAt),
      timestamp: instant(data.timestamp), lastMutationId: str(data.lastMutationId),
      aggregationStatus: data.aggregationStatus === "superseded" ? "superseded" : "active",
      planned: parts.planned, actual: parts.actual, sessionLoad,
      context: { weekId: str(context.weekId), dayIdx: Number.isInteger(context.dayIdx) ? context.dayIdx : null, planRef: str(context.planRef), progressRef: str(context.progressRef) },
      gps: { mode: str(gps.mode) || "none", routeStatus: str(gps.routeStatus) || "none", routeRef: str(gps.routeRef), routeHash: str(gps.routeHash),
        routeRevision: Number.isInteger(gps.routeRevision) ? gps.routeRevision : 0, processingVersion: str(gps.processingVersion),
        validPointCount: number(gps.validPointCount), gapSeconds: number(gps.gapSeconds) },
      origin: { provider: str(origin.provider), externalActivityId: str(origin.externalActivityId), importFingerprint: str(origin.importFingerprint) },
      feedbackRef: str(data.feedbackRef), legacyRef: legacy && docId ? `load_season_reports/${docId}` : str(data.legacyRef),
      replacementIds: Array.isArray(data.replacementIds) ? data.replacementIds.filter((id) => str(id)) : [],
      normalization: { legacy, valid: errors.length === 0, errors, issues }
    };
  }

  function stable(value) {
    if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
    if (value && typeof value === "object") return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stable(value[key])}`).join(",")}}`;
    return JSON.stringify(value);
  }
  // Deduplicate by owner + immutable session ID, never by date. Conflicting equal
  // revisions are quarantined, not arbitrarily selected; diagnostics remain visible.
  function normalizeSessions(records) {
    if (!Array.isArray(records)) throw new TypeError("Expected an array of records");
    const indexed = new Map(), invalid = [];
    for (const record of records) {
      const row = normalizeSession(record);
      if (!row.userId || !row.sessionId || !Number.isInteger(row.revision)) { invalid.push(row); continue; }
      const key = JSON.stringify([row.userId, row.sessionId]);
      const old = indexed.get(key);
      if (!old || row.revision > old.revision) indexed.set(key, row);
      else if (row.revision === old.revision && stable(row) !== stable(old)) {
        row.normalization.valid = false;
        row.normalization.errors.push("duplicate_revision_conflict");
        indexed.set(key, row);
      }
    }
    const result = [...indexed.values(), ...invalid];
    // A legacy day-total may already contain a new same-day activity. Refuse to
    // double count until the legacy split/supersession is explicitly resolved.
    const days = new Map();
    for (const row of filterActiveSessions(result)) {
      const key = JSON.stringify([row.userId, row.date]);
      const group = days.get(key) || [];
      group.push(row); days.set(key, group);
    }
    for (const group of days.values()) {
      if (group.some((s) => s.normalization.legacy) && group.some((s) => !s.normalization.legacy)) {
        for (const row of group) {
          row.normalization.valid = false;
          row.normalization.errors.push("legacy_overlap_requires_resolution");
        }
      }
    }
    return result;
  }
  function filterActiveSessions(sessions) {
    return sessions.filter((s) => s.normalization.valid && s.status === "completed" && s.aggregationStatus !== "superseded");
  }
  function selected(sessions, options) {
    const rows = options?.userId ? sessions.filter((s) => s.userId === options.userId) : sessions;
    if (new Set(rows.map((s) => s.userId).filter(Boolean)).size > 1) throw new RangeError("Select one userId before aggregation");
    return filterActiveSessions(rows);
  }
  function eventDate(session, reportTimezone) {
    return session.timePrecision === "instant" && session.startedAt ? dateAt(session.startedAt, reportTimezone) : session.date;
  }
  function groupSessionsByDate(sessions, options) {
    const timezone = options?.reportTimezone || "UTC";
    formatter(timezone); // Reject invalid report zones even for empty input.
    if (options?.asOf !== undefined && !validDate(options.asOf)) throw new RangeError("Invalid asOf date");
    const groups = Object.create(null);
    for (const session of selected(sessions, options)) {
      const date = eventDate(session, timezone);
      if (options?.asOf && date > options.asOf) continue;
      (groups[date] || (groups[date] = [])).push(session);
    }
    return groups;
  }
  function getDataQuality(sessions) {
    const active = filterActiveSessions(sessions);
    const known = active.filter((s) => s.sessionLoad.value !== null);
    return { sessionCount: active.length, knownLoadSessions: known.length, missingLoadSessions: active.length - known.length,
      uncertainSessions: active.filter((s) => s.sessionLoad.quality.status !== "ok" || s.normalization.issues.length > 0).length,
      invalidSessions: sessions.filter((s) => !s.normalization.valid).length,
      excludedSessions: sessions.length - active.length,
      coverage: active.length ? known.length / active.length : null };
  }
  function calculateDailySessionLoad(sessions, options) {
    const groups = groupSessionsByDate(sessions, options);
    if (Object.keys(groups).length > 1) throw new RangeError("Expected sessions from one report day");
    const rows = Object.values(groups).flat(), quality = getDataQuality(rows);
    const known = rows.filter((s) => s.sessionLoad.value !== null);
    const sum = known.reduce((total, s) => total + s.sessionLoad.value, 0);
    quality.overflow = !Number.isFinite(sum);
    return { sessionLoad: rows.length && !quality.missingLoadSessions && !quality.overflow ? sum : null,
      knownSessionLoad: known.length && !quality.overflow ? sum : null, quality };
  }
  function dayOffset(date, days) { return new Date(Date.parse(date) + days * 86400000).toISOString().slice(0, 10); }
  function calculateACWR(sessions, options) {
    options = options || {};
    if (!validDate(options.asOf)) throw new RangeError("asOf must be YYYY-MM-DD (inclusive report day)");
    const groups = groupSessionsByDate(sessions, options);
    const confirmed = new Set(options.confirmedDates || []);
    if ([...confirmed].some((date) => !validDate(date))) throw new RangeError("Invalid confirmed date");
    const invalid = sessions.filter((s) => (!options.userId || s.userId === options.userId) && !s.normalization.valid);
    // A rejected record must not disappear into a claimed complete/rest day.
    for (const row of invalid) {
      if (row.date) {
        const date = row.timePrecision === "instant" && row.startedAt ? dateAt(row.startedAt, options.reportTimezone || "UTC") : row.date;
        confirmed.delete(date);
      }
    }
    function windowSummary(days) {
      const dates = Array.from({ length: days }, (_, i) => dayOffset(options.asOf, i - days + 1));
      const rows = dates.flatMap((date) => groups[date] || []);
      const quality = getDataQuality(rows);
      const known = rows.filter((s) => s.sessionLoad.value !== null);
      const confirmedDays = dates.filter((date) => confirmed.has(date) && !(groups[date] || []).some((s) => s.sessionLoad.value === null)).length;
      const sum = known.length ? known.reduce((total, s) => total + s.sessionLoad.value, 0) : confirmedDays === days ? 0 : null;
      const overflow = sum !== null && !Number.isFinite(sum);
      return { sum: overflow ? null : sum, overflow,
        days, observedDays: dates.filter((date) => groups[date]?.length).length, confirmedDays,
        unconfirmedDates: dates.filter((date) => !confirmed.has(date)), ...quality };
    }
    const acute = windowSummary(7), chronic = windowSummary(28);
    const acute7 = acute.sum, chronicLoad = chronic.sum === null ? null : chronic.sum / 4;
    const ratio = acute7 !== null && chronicLoad > 0 ? acute7 / chronicLoad : null;
    return { acute7, chronic: chronicLoad, acwr: Number.isFinite(ratio) ? ratio : null,
      provisional: invalid.length > 0 || chronic.overflow || chronic.confirmedDays < 28 || chronic.missingLoadSessions > 0 || chronic.uncertainSessions > 0,
      invalidSessionIds: invalid.map((s) => s.sessionId),
      coverage: { acute, chronic }, asOf: options.asOf, reportTimezone: options.reportTimezone || "UTC", calculationVersion: "calendar-acwr:v1" };
  }
  // Flat rows match AthleteCore.calculate's load/loadRecent input shape. Only
  // complete load inputs are projected; omissions remain explicit. The existing
  // Core still has rolling-clock windows and null coercion: this is NOT integration.
  function toAthleteCoreInput(sessions, options) {
    const groups = groupSessionsByDate(sessions, options);
    const rows = Object.keys(groups).sort().flatMap((date) => groups[date]
      .slice().sort((a, b) => (a.startedAt || "").localeCompare(b.startedAt || "") || a.sessionId.localeCompare(b.sessionId))
      .map((s) => ({ session: s, date })));
    const loadRecent = rows.filter(({ session: s }) => s.sessionLoad.value !== null).map(({ session: s, date }) => ({
      userId: s.userId, sessionId: s.sessionId, date, duration: s.actual.duration.value, rpe: s.actual.rpe.value,
      distance: s.actual.distance.value, sessionLoad: s.sessionLoad.value,
      ...(s.startedAt ? { timestamp: Date.parse(s.startedAt) } : {})
    }));
    return { load: loadRecent[loadRecent.length - 1] || null, loadRecent,
      omittedSessionIds: rows.filter(({ session: s }) => s.sessionLoad.value === null).map(({ session: s }) => s.sessionId),
      quality: getDataQuality(rows.map((row) => row.session)) };
  }

  const api = { normalizeSession, normalizeSessions, separatePlannedActual, filterActiveSessions, groupSessionsByDate,
    calculateDailySessionLoad, getDataQuality, calculateACWR, toAthleteCoreInput };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else if (root) root.PACSessionNormalizer = api;
})(typeof window !== "undefined" ? window : null);
