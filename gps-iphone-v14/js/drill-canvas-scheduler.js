(function (root, make) {
  const api = make();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.PACDrillScheduler = api;
})(typeof globalThis === "undefined" ? this : globalThis, function () {
  "use strict";
  const number = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const unique = (values) => [...new Set((values || []).filter(Boolean).map(String))];

  function dependencyIds(action = {}) {
    return unique([...(action.dependencies || []), action.afterActionId, action.afterPossessionActionId, action.afterGroupActionId]);
  }

  function detectCycles(actions = []) {
    const graph = new Map(actions.map((action) => [String(action.actionId), dependencyIds(action)]));
    const active = new Set(), done = new Set(), stack = [], cycles = [];
    function visit(id) {
      if (active.has(id)) {
        cycles.push([...stack.slice(Math.max(0, stack.indexOf(id))), id]);
        return;
      }
      if (done.has(id) || !graph.has(id)) return;
      active.add(id);
      stack.push(id);
      graph.get(id).forEach(visit);
      stack.pop();
      active.delete(id);
      done.add(id);
    }
    graph.forEach((_, id) => visit(id));
    return cycles;
  }

  function scheduleActionGraph(actions = [], options = {}) {
    const ordered = actions.map((action, index) => ({ ...action, _index: index }))
      .sort((left, right) => number(left.authoredOrder, left._index) - number(right.authoredOrder, right._index) || left._index - right._index);
    const byId = new Map();
    ordered.forEach((action, rank) => {
      action.actionId = String(action.actionId || "");
      if (!action.actionId || byId.has(action.actionId)) {
        throw new Error(action.actionId ? `Duplicate actionId: ${action.actionId}` : `Missing actionId at rank ${rank}`);
      }
      action.rank = rank;
      byId.set(action.actionId, action);
    });

    const invalidDependencies = [];
    const previousByLane = new Map();
    ordered.forEach((action) => {
      const valid = [];
      dependencyIds(action).forEach((id) => {
        const dependency = byId.get(id);
        const receptionBarrier = (action.receptionDependencies || []).includes(id) && id !== action.actionId;
        if (!dependency || (dependency.rank >= action.rank && !receptionBarrier)) {
          invalidDependencies.push({ actionId: action.actionId, dependencyId: id, reason: dependency ? "not-previous" : "missing" });
        } else valid.push(id);
      });
      unique(action.laneIds || [action.actorId]).forEach((laneId) => {
        const previousId = previousByLane.get(laneId);
        if (previousId && previousId !== action.actionId) valid.push(previousId);
        previousByLane.set(laneId, action.actionId);
      });
      action.dependencies = unique(valid);
    });

    const indegree = new Map(ordered.map((action) => [action.actionId, action.dependencies.length]));
    const children = new Map(ordered.map((action) => [action.actionId, []]));
    ordered.forEach((action) => action.dependencies.forEach((id) => children.get(id).push(action.actionId)));
    const ready = ordered.filter((action) => !indegree.get(action.actionId));
    const topological = [];
    while (ready.length) {
      ready.sort((left, right) => left.rank - right.rank);
      const action = ready.shift();
      topological.push(action);
      children.get(action.actionId).forEach((id) => {
        indegree.set(id, indegree.get(id) - 1);
        if (!indegree.get(id)) ready.push(byId.get(id));
      });
    }
    if (topological.length !== ordered.length) throw new Error("Scenario action graph contains a cycle");

    const ends = new Map();
    const scheduled = topological.map((action) => {
      const dependencyEnd = Math.max(0, ...action.dependencies.map((id) => number(ends.get(id))));
      const phaseStart = Math.max(0, number(action.phaseStart));
      const absolute = action.manualTimelineStart === true || action.startMode === "absolute";
      const authoredFloor = absolute
        ? Math.max(phaseStart, number(action.requestedStart, number(action.start)))
        : Math.max(phaseStart, number(action.startFloor));
      const start = Math.max(authoredFloor, dependencyEnd);
      const duration = Math.max(number(options.minimumDuration, .01), number(action.duration, .01));
      const result = { ...action, start, duration, end: start + duration };
      ends.set(action.actionId, result.end);
      return result;
    });
    return { scheduled, invalidDependencies, duration: Math.max(0, ...scheduled.map((action) => action.end)) };
  }

  function buildPossessionTimeline(actions = [], initialOwnerId = "") {
    let ownerId = String(initialOwnerId || "");
    const events = [], violations = [];
    actions.slice().sort((a, b) => number(a.start) - number(b.start)).forEach((action) => {
      const type = String(action.type || "").toLowerCase();
      if (type === "pass") {
        if (ownerId && action.actorId && ownerId !== String(action.actorId)) violations.push({ actionId: action.actionId, reason: "passer-not-owner" });
        if (action.actorTeam && action.receiverTeam && action.actorTeam !== action.receiverTeam) violations.push({ actionId: action.actionId, reason: "cross-team-pass" });
        events.push({ at: number(action.start), mode: "in_flight", ownerId: "" });
        ownerId = String(action.receiverId || "");
        events.push({ at: number(action.end, number(action.start) + number(action.duration)), mode: ownerId ? "owned" : "loose", ownerId });
      } else if (type === "ruck") {
        events.push({ at: number(action.start), mode: "ruck", ownerId: "" });
        ownerId = String(action.releaseOwnerId || "");
        events.push({ at: number(action.end, number(action.start) + number(action.duration)), mode: ownerId ? "owned" : "loose", ownerId });
      } else if (type === "grubber") {
        if (ownerId && action.actorId && ownerId !== String(action.actorId)) violations.push({ actionId: action.actionId, reason: "kicker-not-owner" });
        ownerId = "";
        events.push({ at: number(action.start), mode: "loose", ownerId: "" });
        const receiverId = String(action.receiverId || "");
        if (receiverId) {
          ownerId = receiverId;
          events.push({ at: number(action.end, number(action.start) + number(action.duration)), mode: "owned", ownerId });
        }
      } else if (["pickup", "catch", "recover"].includes(type)) {
        ownerId = String(action.actorId || action.receiverId || "");
        events.push({ at: number(action.end, number(action.start) + number(action.duration)), mode: ownerId ? "owned" : "loose", ownerId });
      }
    });
    return { initialOwnerId: String(initialOwnerId || ""), events, finalOwnerId: ownerId, violations };
  }

  function possessionAt(timeline, time) {
    let result = { mode: timeline.initialOwnerId ? "owned" : "loose", ownerId: timeline.initialOwnerId || "" };
    (timeline.events || []).forEach((event) => { if (event.at <= number(time) + 1e-6) result = { mode: event.mode, ownerId: event.ownerId }; });
    return result;
  }

  function solveMovingReception(input = {}) {
    const origin = input.passOrigin;
    const speed = Math.max(1e-6, number(input.ballSpeed));
    const earliest = Math.max(0, number(input.passEarliestStart));
    if (!origin) return null;
    for (const segment of (input.receiverSegments || []).slice().sort((a, b) => number(a.start) - number(b.start))) {
      const start = Math.max(earliest, number(segment.start));
      const end = Math.max(start, number(segment.end, start));
      if (!segment.from || !segment.to || end <= start) continue;
      const pointAt = (time) => {
        const ratio = Math.max(0, Math.min(1, (time - number(segment.start)) / Math.max(1e-6, number(segment.end) - number(segment.start))));
        return {
          x: number(segment.from.x) + (number(segment.to.x) - number(segment.from.x)) * ratio,
          y: number(segment.from.y) + (number(segment.to.y) - number(segment.from.y)) * ratio
        };
      };
      const delta = (time) => {
        const point = pointAt(time);
        return Math.hypot(point.x - number(origin.x), point.y - number(origin.y)) - speed * (time - earliest);
      };
      let left = start;
      let leftDelta = delta(left);
      for (let sample = 1; sample <= 80; sample += 1) {
        const right = start + (end - start) * sample / 80;
        const rightDelta = delta(right);
        if (leftDelta >= 0 && rightDelta <= 0) {
          let low = left, high = right;
          for (let iteration = 0; iteration < 40; iteration += 1) {
            const mid = (low + high) / 2;
            if (delta(mid) > 0) low = mid;
            else high = mid;
          }
          const receptionAt = (low + high) / 2;
          const point = pointAt(receptionAt);
          const flightDuration = Math.hypot(point.x - number(origin.x), point.y - number(origin.y)) / speed;
          return { point, passStart: receptionAt - flightDuration, receptionAt, flightDuration, segmentId: segment.id || "" };
        }
        left = right;
        leftDelta = rightDelta;
      }
    }
    return null;
  }

  function compactPhases(phases = []) {
    let cursor = 0;
    const compacted = phases.map((phase) => {
      const contentDuration = Math.max(.01, ...((phase.actionEnds || []).map((end) => number(end) - number(phase.start))));
      const duration = phase.manualDuration ? Math.max(contentDuration, number(phase.duration, 1)) : contentDuration;
      const start = phase.manualTimelineStart ? Math.max(cursor, number(phase.start)) : cursor;
      cursor = start + duration;
      return { ...phase, start, duration };
    });
    return { phases: compacted, duration: cursor };
  }

  function maximumLaneGap(actions = []) {
    const laneEnds = new Map();
    let maximum = 0;
    actions.slice().sort((a, b) => number(a.start) - number(b.start) || number(a.authoredOrder) - number(b.authoredOrder)).forEach((action) => {
      unique(action.laneIds || [action.actorId]).forEach((laneId) => {
        if (laneEnds.has(laneId) && action.startMode !== "absolute" && String(action.type || "").toLowerCase() !== "pause") {
          maximum = Math.max(maximum, Math.max(0, number(action.start) - laneEnds.get(laneId)));
        }
        laneEnds.set(laneId, Math.max(number(laneEnds.get(laneId)), number(action.end, number(action.start) + number(action.duration))));
      });
    });
    return maximum;
  }

  function rollbackGroupTransaction(frame = {}, transactionId = "") {
    const transaction = (frame.transactions || []).find((item) => item.transactionId === transactionId);
    if (!transaction) return { ...frame, removed: false };
    const actionIds = new Set(transaction.actionIds || []);
    const objects = { ...(frame.objects || {}) };
    Object.entries(transaction.positionsBefore || {}).forEach(([id, position]) => {
      objects[id] = { ...(objects[id] || {}), position: { ...position } };
    });
    return {
      ...frame,
      ballOwnerId: transaction.ballOwnerBefore || "",
      clips: (frame.clips || []).filter((clip) => !actionIds.has(clip.actionId) && clip.transactionId !== transactionId),
      objects,
      removed: true,
      transactions: (frame.transactions || []).filter((item) => item.transactionId !== transactionId)
    };
  }

  function buildDefaultRugbyGroups(players = [], options = {}) {
    const teamVariant = String(options.teamVariant || "black");
    const phaseId = String(options.phaseId || "");
    const byNumber = new Map((players || []).map((player) => [number(player.number), String(player.id || "")]).filter((entry) => entry[0] && entry[1]));
    const specs = [
      { name: "Pod 1", kind: "pod", numbers: [1, 2, 3] },
      { name: "Pod 2", kind: "pod", numbers: [4, 5, 6] },
      { name: "Pod 3", kind: "pod", numbers: [7, 8] },
      { name: "Fan", kind: "fan", numbers: [9, 10, 11, 12, 13, 14, 15] }
    ];
    return specs.map((spec, index) => ({
      id: String(options.idPrefix || "rugby_group") + `_${teamVariant}_${phaseId || "phase"}_${index + 1}`,
      name: spec.name,
      kind: spec.kind,
      teamVariant,
      phaseId,
      playerIds: spec.numbers.map((shirt) => byNumber.get(shirt)).filter(Boolean),
      shirtNumbers: [...spec.numbers],
      leaderId: ""
    }));
  }

  return Object.freeze({
    buildDefaultRugbyGroups,
    buildPossessionTimeline,
    compactPhases,
    dependencyIds,
    detectCycles,
    maximumLaneGap,
    possessionAt,
    rollbackGroupTransaction,
    scheduleActionGraph,
    solveMovingReception
  });
});
