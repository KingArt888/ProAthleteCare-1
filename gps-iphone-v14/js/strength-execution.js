/* Local strength journal. Account scoped; never reads the ownerless legacy map.
   Pure records + explicit storage. Remote reconciliation belongs to Session v2. */
(function (root) {
  'use strict';
  const clone = v => JSON.parse(JSON.stringify(v));
  const exerciseKey = id => `exercise:${String(id)}`;
  function num(v) { if (v == null || String(v).trim() === '' || typeof v === 'boolean') return null; const n = Number(v); return Number.isFinite(n) ? n : null; }
  function kg(v) { const n = num(v); if (n == null || n < 0 || n > 2000) throw Error('INVALID_LOAD'); return n; }
  function estimate(load, reps) {
    if (!(load > 0) || !Number.isInteger(reps) || reps < 1 || reps > 15) return null;
    if (reps === 1) return load;
    return Math.round(load * (1 + reps / 30) * 10) / 10;
  }
  function eligible(ex = {}, task = {}) {
    if (task.mode !== 'gym' || task.planned?.workSec != null && task.planned?.reps == null || ex.strengthTestEligible === false) return false;
    const text = [ex.name, ex.category, ex.quality, ...(Array.isArray(ex.tags) ? ex.tags : [])].join(' ').toLowerCase();
    if (/rehab|injur|pain|isometr|unilateral|single[ -](leg|arm)|plyo|jump|sprint|ballistic|реаб|травм|ізометр/.test(text)) return false;
    return ex.strengthTestEligible === true || /barbell.*(squat|deadlift|bench|row)|conventional deadlift|присідання.*штанг|жим.*штанг|станова тяга/i.test(text);
  }
  function contextKey(task, date) {
    return JSON.stringify([date, task.context.weekId, task.context.dayIdx, task.context.variantKey, task.context.variantIndex, task.planItemId]);
  }
  function createStore(storage, userId, uuid = () => root.crypto.randomUUID(), now = () => Date.now()) {
    if (typeof userId !== 'string' || !userId) throw Error('OWNER_REQUIRED');
    const key = `pac_di_strength_v1:${encodeURIComponent(userId)}`;
    function read() {
      const raw = storage.getItem(key);
      if (!raw) return { schemaVersion: 1, userId, drafts: {}, executions: {}, performance: {}, daySessions: {} };
      let data; try { data = JSON.parse(raw); } catch { throw Error('INVALID_LOCAL_DATA'); }
      if (data.schemaVersion !== 1 || data.userId !== userId || !data.drafts || !data.executions || !data.performance || !data.daySessions) throw Error('INVALID_LOCAL_DATA');
      return data;
    }
    function write(data) { storage.setItem(key, JSON.stringify(data)); }
    function assertOwner(run) { if (run.userId !== userId || run.task.context.userId !== userId) throw Error('OWNER_MISMATCH'); }
    function start(task, date, mode = 'workout', options = {}) {
      if (task.mode !== 'gym' || task.context.userId !== userId) throw Error('OWNER_MISMATCH');
      const data = read(), draftKey = contextKey(task, date), previous = data.drafts[draftKey];
      if (!options.fresh && previous && !['completed', 'stopped'].includes(previous.status)) {
        assertOwner(previous);
        const restored = clone(previous);
        if (restored.activeSince != null) { restored.activeSince = null; restored.recovered = true; }
        // Correct pre-unification drafts only before any confirmed result exists.
        // Never reinterpret already recorded reps as seconds or the reverse.
        if (restored.mode === 'workout' && restored.rows.length === 0 && typeof options.timed === 'boolean') {
          restored.timed = options.timed;
          restored.plannedWorkSec = task.planned.workSec ?? options.workSec ?? null;
          restored.targets = restored.targets.map(() => task.planned.reps ?? options.reps ?? null);
        }
        restored.phase = 'paused';
        return restored;
      }
      const dayKey = JSON.stringify([date, task.context.weekId, task.context.dayIdx]);
      const sessionId = data.daySessions[dayKey] || `s-${uuid()}`;
      data.daySessions[dayKey] = sessionId;
      const executionId = `exec-${uuid()}`;
      const timed = options.timed ?? (task.planned.workSec != null && task.planned.reps == null);
      const sets = mode === 'test3' ? 3 : Math.max(1, Math.round(task.planned.sets || options.sets || 1));
      if (!['workout','test3'].includes(mode) || sets > 200 || ![1,2].includes(options.sideTotal || 1)) throw Error('INVALID_PLAN');
      if (mode === 'test3' && !options.eligible) throw Error('TEST_NOT_ELIGIBLE');
      const run = { schemaVersion: 1, userId, sessionId, executionId, draftKey, date, mode, timezone:Intl.DateTimeFormat().resolvedOptions().timeZone,
        task: clone(task), status: 'in-progress', phase: 'ready', createdAt: now(),
        index: 1, side: 0, sideTotal: options.sideTotal || 1, targets: mode === 'test3' ? [8,5,3] : Array(sets).fill(task.planned.reps ?? options.reps ?? null),
        timed, plannedWorkSec: task.planned.workSec ?? options.workSec ?? null,
        prescriptionSource: task.planned.prescriptionSource || (task.planned.sets != null && (task.planned.reps != null || task.planned.workSec != null) ? 'plan' : 'legacy-derived'),
        rows: [], pending: { loadKg: null, reps: null },
        activeMs: 0, activeSince: null, startedAt: null, recovered: false, sync: { status: 'local-only' } };
      run.task.sessionId = sessionId; run.task.executionId = executionId;
      data.drafts[draftKey] = clone(run); write(data); return run;
    }
    function save(run) { assertOwner(run); const data = read(); data.drafts[run.draftKey] = clone(run); write(data); }
    function checkpoint(run) {
      if (run.activeSince != null) { run.activeMs += Math.max(0, now() - run.activeSince); run.activeSince = now(); }
      save(run);
    }
    function startSet(run, options = {}) {
      assertOwner(run);
      if (run.status !== 'in-progress') throw Error('EXECUTION_CLOSED');
      if (run.activeSince != null) return;
      if (!run.timed || run.pending.loadKg != null) kg(run.pending.loadKg);
      if (run.mode === 'test3' && (!(run.pending.loadKg > 0) || run.pending.loadKg < (run.rows.at(-1)?.loadKg || 0))) throw Error('TEST_LOAD_PROGRESSION');
      const last = run.rows.at(-1);
      if (last && last.elapsedBetweenSetsSec == null) {
        last.elapsedBetweenSetsSec = Math.max(0, Math.round((now() - last.endedAt) / 100) / 10);
        if(last.setIndex!==run.index){
          const planned=Number(options.plannedRestSec??run.task.planned.restSec);
          last.rest={plannedSec:Number.isFinite(planned)&&planned>=0?planned:null,elapsedSec:last.elapsedBetweenSetsSec,
            timerCompletionPct:planned>0?Math.min(100,Math.round(last.elapsedBetweenSetsSec/planned*100)):null,
            startSource:options.startSource==='automatic-rest-signal'?'automatic-rest-signal':'athlete-button',
            actualAdherencePct:null,quality:'app-clock-only'};
        }
      }
      if(!run.startedAt)run.workStartSource=options.startSource==='automatic-rest-signal'?'automatic-rest-signal':'athlete-button';
      run.phase = 'active'; run.startedAt ||= now(); run.activeSince = now(); save(run);
    }
    function pause(run) {
      if (run.activeSince != null) { run.activeMs += Math.max(0, now() - run.activeSince); run.activeSince = null; }
      run.phase = 'paused'; save(run);
    }
    function record(run, input) {
      assertOwner(run);
      const rowKey = `${run.index}:${run.side}`;
      if (run.rows.some(row => row.key === rowKey)) return false;
      if (run.status !== 'in-progress' || !run.startedAt) throw Error('SET_NOT_STARTED');
      const loadKg = run.timed && input.loadKg == null ? null : kg(input.loadKg);
      const reps = run.timed ? null : num(input.reps);
      if (!run.timed && (!Number.isInteger(reps) || reps < 0 || reps > 1000)) throw Error('INVALID_REPS');
      if (run.mode === 'test3' && (!(loadKg > 0) || loadKg < (run.rows.at(-1)?.loadKg || 0))) throw Error('TEST_LOAD_PROGRESSION');
      const workMs = run.activeMs + (run.activeSince == null ? 0 : Math.max(0, now() - run.activeSince));
      run.rows.push({ key: rowKey, setIndex: run.index, side: run.sideTotal > 1 ? run.side + 1 : null,
        loadKg, reps, targetReps: run.targets[run.index - 1], startedAt: run.startedAt, endedAt: now(),
        workSec: Math.round(workMs / 100) / 10, source: 'manual', durationSource: 'measured',
        durationQuality: run.recovered ? 'partial' : run.workStartSource==='automatic-rest-signal'?'inferred-start':'client',
        workStartSource:run.workStartSource||'athlete-button',loadBasis: 'total-external', estimated1RM: estimate(loadKg, reps) });
      run.rows.at(-1).repsSource = run.timed ? null : input.repsSource === 'confirmed-plan' ? 'confirmed-plan' : 'manual';
      run.activeMs = 0; run.activeSince = null; run.startedAt = null;
      run.pending.reps = null; delete run.pending.repsSource; run.phase = 'rest'; save(run); return true;
    }
    function advance(run) {
      if (!run.rows.some(row => row.key === `${run.index}:${run.side}`)) throw Error('SET_NOT_RECORDED');
      if (run.side + 1 < run.sideTotal) run.side++; else { run.side = 0; run.index++; }
      run.phase = 'ready'; save(run);
    }
    function addBuild(run) {
      if (run.mode !== 'test3' || run.phase !== 'ready' || run.index !== run.targets.length) throw Error('BUILD_NOT_AVAILABLE');
      run.targets.splice(run.index - 1, 0, 5); save(run);
    }
    function performance(exerciseId) { return clone(read().performance[exerciseKey(exerciseId)] || {}); }
    function reference(exerciseId, loadKg, reps = 1) {
      const load = kg(loadKg), r = num(reps);
      const value = estimate(load, r); if (value == null) throw Error('INVALID_REFERENCE');
      const data = read(), key = exerciseKey(exerciseId), p = data.performance[key] || {};
      p.referenceMax = { value, unit: 'kg', source: r === 1 ? 'manual' : 'estimated', formula: r === 1 ? null : 'Epley',
        basis: { loadKg: load, reps: r }, recordedAt: now() };
      data.performance[key] = p; write(data); return clone(p.referenceMax);
    }
    function setPercent(exerciseId, percent) {
      const p = num(percent); if (p != null && (!(p > 0) || p > 100)) throw Error('INVALID_PERCENT');
      const data = read(), key = exerciseKey(exerciseId); data.performance[key] ||= {}; data.performance[key].trainingPercent1RM = p; data.performance[key].percentUpdatedAt=now(); write(data);
    }
    function finish(run, stopped = false) {
      assertOwner(run); const data = read();
      if (data.executions[run.executionId]) return clone(data.executions[run.executionId]);
      if (!stopped && run.rows.length !== run.targets.length * run.sideTotal) throw Error('INCOMPLETE_EXECUTION');
      const done = clone(run); done.status = stopped ? 'stopped' : 'completed'; done.phase = done.status;
      done.endedAt = now(); done.activeSince = null;
      const key = exerciseKey(done.task.exerciseId), p = data.performance[key] || {};
      const validRows = done.rows.filter(row => row.loadKg != null && row.reps > 0);
      if (validRows.length) {
        p.last = { ...clone(validRows.at(-1)), executionId: done.executionId, mode: done.mode };
        const candidates = [...(p.best ? [p.best] : []), ...validRows.map(row => ({ ...row, executionId: done.executionId, mode: done.mode }))];
        p.best = clone(candidates.sort((a,b) => (b.estimated1RM || b.loadKg) - (a.estimated1RM || a.loadKg) || b.loadKg - a.loadKg || b.reps - a.reps)[0]);
        if (done.mode === 'workout') { p.lastWorkLoadKg = validRows.at(-1).loadKg; p.lastWorkAt = validRows.at(-1).endedAt; }
      }
      const final = done.rows.at(-1);
      if (!stopped && done.mode === 'test3' && final?.reps === 3 && final.loadKg > 0 && done.rows.every(row => row.reps > 0)) {
        done.testResult = { value: final.estimated1RM, unit: 'kg', source: 'estimated', formula: 'Epley',
          basis: { loadKg: final.loadKg, reps: 3 }, recordedAt: done.endedAt, executionId: done.executionId };
        p.referenceMax = clone(done.testResult);
      }
      done.task.actual = { strengthMode: done.mode, strengthSets: clone(done.rows), recordedSets: done.rows.length,
        completedSets: done.rows.filter(row => row.reps > 0 || row.reps == null && row.workSec > 0).length,
        totalReps: done.timed ? null : done.rows.reduce((sum,row) => sum + row.reps, 0),
        volumeKg: done.timed || done.rows.some(row => row.loadKg == null) ? null : done.rows.reduce((sum,row) => sum + row.loadKg * row.reps, 0),
        activeWorkSec: Math.round(done.rows.reduce((sum,row) => sum + row.workSec, 0) * 10) / 10,
        testResult: done.testResult || null, status: done.status, sync: { status: 'local-only' } };
      data.performance[key] = p; data.executions[done.executionId] = done;
      delete data.drafts[done.draftKey]; write(data); return clone(done);
    }
    function importProfiles(profiles){const data=read();for(const profile of profiles){if(profile.userId!==userId)throw Error('OWNER_MISMATCH');const key=exerciseKey(profile.exerciseId),old=data.performance[key]||{},p=profile.performance||{};
      if(p.last&&(!old.last||p.last.endedAt>old.last.endedAt))old.last=clone(p.last);
      if(p.best&&(!old.best||(p.best.estimated1RM||p.best.loadKg)>(old.best.estimated1RM||old.best.loadKg)))old.best=clone(p.best);
      if(p.referenceMax&&(!old.referenceMax||p.referenceMax.recordedAt>old.referenceMax.recordedAt))old.referenceMax=clone(p.referenceMax);
      if((p.percentUpdatedAt||0)>(old.percentUpdatedAt||0)){old.trainingPercent1RM=p.trainingPercent1RM;old.percentUpdatedAt=p.percentUpdatedAt;}
      if(p.lastWorkAt>(old.lastWorkAt||0)){old.lastWorkLoadKg=p.lastWorkLoadKg;old.lastWorkAt=p.lastWorkAt;}
      data.performance[key]=old;}write(data);}
    function markSynced(executionId){const data=read();if(data.executions[executionId]){data.executions[executionId].sync={status:'synced'};write(data);}}
    return { key, read, start, save, checkpoint, startSet, pause, record, advance, addBuild, performance, reference, setPercent, finish, importProfiles, markSynced };
  }
  const api = { createStore, estimate, eligible };
  if (typeof module === 'object' && module.exports) module.exports = api; else root.PACStrengthExecution = api;
})(globalThis);
