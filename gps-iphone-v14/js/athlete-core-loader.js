// athlete-core-loader.js — ProAtletCare (v1.1 FULL)
// ✅ fixes:
// 1) where("userId" == uid) instead of where("uid")
// 2) no limit() without orderBy (щоб не пропускати найновіший)
// 3) правильний uid у Weekly admin view (window.currentUserId)
// 4) fallback на date якщо timestamp відсутній
// 5) events: athletecore:signals + athletecore:ready
// ✅ upgrade v1.1:
// 6) fetchRecentByUserId (28d) for wellness/load -> wellnessRecent/loadRecent
// 7) athletecore:ready detail now includes { userId, weekId, core, signals }

(function () {
  const CORE_CACHE_TTL_MS = 20000;
  const journalLoads=new Map();
  function readJournalLoads(userId){
    const cached=journalLoads.get(userId);if(cached&&Date.now()-cached.at<CORE_CACHE_TTL_MS)return cached.promise;
    const promise=(window.db||firebase.firestore()).collection('load_season_reports').where('userId','==',userId).get().then(snapshot=>window.PACSessionJournal.project(snapshot.docs.map(doc=>({id:doc.id,data:doc.data()}))));
    journalLoads.set(userId,{at:Date.now(),promise});promise.catch(()=>journalLoads.delete(userId));return promise;
  }
  window.addEventListener('pac:journal-synced',()=>journalLoads.clear());
  let __runCoreInFlight = null;
  let __lastCorePacket = null;
  let __lastCoreAtMs = 0;
  let __runCoreVersion = 0;

  // ---------- helpers ----------
  function _isoLocal(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function _parseIsoLocal(dateStr) {
    const m = String(dateStr || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return null;
    const dt = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    return Number.isNaN(dt.getTime()) ? null : dt;
  }

  function isoMondayFrom(dateStr) {
    const d = _parseIsoLocal(dateStr) || new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    const dow = (d.getDay() === 0) ? 6 : d.getDay() - 1; // Mon=0..Sun=6
    d.setDate(d.getDate() - dow);
    return _isoLocal(d);
  }

const SEASON_LOAD_ZONES = {
  PRESEASON:  { min: 0.9, max: 1.5 },
  INSEASON:   { min: 0.8, max: 1.2 },
  CONGESTED:  { min: 0.7, max: 1.1 },
  OFFSEASON:  { min: 0.6, max: 1.0 },
  RETURN:     { min: 0.6, max: 0.9 }
};

  function getWeekID() {
    const d = new Date();
    const dow = (d.getDay() === 0) ? 6 : d.getDay() - 1;
    d.setDate(d.getDate() - dow);
    return _isoLocal(d);
  }

  function getWeekIdFromUrl() {
    const u = new URL(window.location.href);
    const raw = u.searchParams.get("weekId");
    return raw ? isoMondayFrom(raw) : null;
  }

  function getUidFromContext() {
    // 1) Weekly/other pages можуть явно встановити target uid
    if (window.currentUserId) return window.currentUserId;

    // 2) Coach/Admin delegated view via URL (?userId=...&fromCoach=1 / fromAdmin=1 / asAdmin=1)
    try {
      const u = new URL(window.location.href);
      const qs = u.searchParams;
      const delegated = qs.get("fromCoach") === "1" || qs.get("fromAdmin") === "1" || qs.get("asAdmin") === "1";
      const targetUserId = qs.get("userId");
      if (delegated && targetUserId) return targetUserId;
    } catch (_) {}

    // 3) fallback: залогінений користувач
    const u = firebase.auth().currentUser;
    return u ? u.uid : null;
  }

  function pickBestTimestamp(d) {
    // Найкраще: Firestore Timestamp
    if (d?.timestamp?.toDate) return d.timestamp.toDate().getTime();

    // якщо timestamp як number або string
    if (typeof d?.timestamp === "number") return d.timestamp;
    if (typeof d?.timestamp === "string") {
      const t = new Date(d.timestamp).getTime();
      if (!isNaN(t)) return t;
    }

    // fallback: date (YYYY-MM-DD)
    if (typeof d?.date === "string") {
      const t = new Date(d.date).getTime();
      if (!isNaN(t)) return t;
    }

    // fallback: createdAt/updatedAt якщо колись додаси
    if (d?.createdAt?.toDate) return d.createdAt.toDate().getTime();
    if (d?.updatedAt?.toDate) return d.updatedAt.toDate().getTime();

    return 0;
  }

  async function fetchLatestByUserId(collectionName, userId) {
    if(collectionName==='load_season_reports'){try{const rows=(await readJournalLoads(userId)).knownRows;return rows.at(-1)||null;}catch(e){console.warn('[AthleteCore] journal unavailable',e);return null;}}
    try {
      // Fast path: indexed latest-doc queries (no full collection scan)
      const orderCandidates = ["timestamp", "updatedAt", "createdAt", "date"];
      for (const field of orderCandidates) {
        try {
          const fastSnap = await db
            .collection(collectionName)
            .where("userId", "==", userId)
            .orderBy(field, "desc")
            .limit(1)
            .get();
          if (!fastSnap.empty) {
            const doc = fastSnap.docs[0];
            return doc?.data ? (doc.data() || null) : null;
          }
        } catch (_) {
          // Field/index may not exist in some projects; continue to fallback paths.
        }
      }

      const snap = await db
        .collection(collectionName)
        .where("userId", "==", userId)
        .get();

      if (snap.empty) return null;

      let best = null;
      let bestTs = -1;

      snap.forEach((doc) => {
        const d = doc.data() || {};
        const t = pickBestTimestamp(d);
        if (t > bestTs) {
          bestTs = t;
          best = d;
        }
      });

      return best;
    } catch (e) {
      console.warn(`[AthleteCore] fetchLatestByUserId failed: ${collectionName}`, e);
      return null;
    }
  }
  async function fetchLatestPowerTest(userId) {
  try {
    // твій реальний шлях:
    const snap = await db
      .collection("power_tests")
      .doc(userId)
      .collection("tests")
      .orderBy("createdAtMs", "desc")
      .limit(1)
      .get();

    if (snap.empty) return null;

    const doc = snap.docs[0];
    return { _id: doc.id, ...doc.data() };
  } catch (e) {
    console.warn("[AthleteCore] fetchLatestPowerTest failed", e);
    return null;
  }
}

  function normalizeInjury(raw) {
  if (!raw) return null;

  const history = Array.isArray(raw.history) ? raw.history : [];

  // у тебе pain лежить саме тут:
  const last = history.length ? history[history.length - 1] : null;

  const pain = Number(
    raw.pain ??
    raw.painLevel ??
    raw.pain_score ??
    (last?.pain ?? 0)
  ) || 0;

  const location =
    raw.location ??
    raw.bodyPart ??
    raw.area ??
    null;

  const date =
    raw.date ??
    raw.updatedAt ??
    raw.createdAt ??
    raw.timestamp ??
    (last?.date ?? null);

  // ✅ важливо: raw першим, нормалізоване — після (щоб не перезатерлось)
  return {
    ...raw,
    pain,
    location,
    date,
    history
  };
}
function normalizeWellness(raw) {
  if (!raw) return null;

  const scores = raw.scores || {};

  // helper: шукає число і в raw, і в scores
  const pickNum = (...keys) => {
    for (const k of keys) {
      const v =
        raw[k] ?? scores[k] ?? null;

      const n = Number(v);
      if (Number.isFinite(n)) return n;
    }
    return null;
  };

  const sleep    = pickNum("sleep", "sleepScore", "sleep_quality", "sleepQuality");
  const stress   = pickNum("stress", "stressScore", "stress_level", "stressLevel");
  let readiness  = pickNum("readiness", "ready", "readinessScore", "readiness_level", "overall", "total");
  const soreness = pickNum("soreness", "sore", "muscleSoreness", "sorenessScore");

  // ✅ КЛЮЧОВЕ: readiness = 0 у тебе означає "не задано"
  if (readiness === 0 && (sleep !== null || stress !== null)) {
    readiness = null;
  }

  return {
    ...raw,
    sleep,
    stress,
    readiness,
    soreness,
    date: raw.date ?? raw.updatedAt ?? raw.createdAt ?? raw.timestamp ?? null,
  };
}
function powerSummary(power) {
  if (!power) return null;
  return {
    date: power.date || null,
    count: Number(power.count || 0),
    best_cm: Number(power.best_cm ?? 0),
    avg_cm: Number(power.avg_cm ?? 0),
    fatigue_pct: Number(power.fatigue_pct ?? 0),
    improve_pct: Number(power.improve_pct ?? 0),
  };
}





  async function fetchLatestByUserIdOrUid(collectionName, userId) {
  // 1) основний шлях: userId
  const a = await fetchLatestByUserId(collectionName, userId);
  if (a) return a;

  // 2) fallback: uid
  try {
    const uidOrderCandidates = ["timestamp", "updatedAt", "createdAt", "date"];
    for (const field of uidOrderCandidates) {
      try {
        const fastSnap = await db
          .collection(collectionName)
          .where("uid", "==", userId)
          .orderBy(field, "desc")
          .limit(1)
          .get();
        if (!fastSnap.empty) {
          const doc = fastSnap.docs[0];
          return doc?.data ? (doc.data() || null) : null;
        }
      } catch (_) {}
    }

    const snap = await db.collection(collectionName).where("uid", "==", userId).get();
    if (snap.empty) return null;
    let best = null, bestTs = -1;
    snap.forEach((doc) => {
      const d = doc.data() || {};
      const t = pickBestTimestamp(d);
      if (t > bestTs) { bestTs = t; best = d; }
    });
    return best;
  } catch (e) {
    console.warn(`[AthleteCore] fetchLatestByUserIdOrUid failed: ${collectionName}`, e);
    return null;
  }
}

  // =========================
  // POWER (CMJ) — latest from per-user collection
  // Path: power_tests/{uid}/tests/{docId}
  // =========================
  async function fetchLatestPower(uid) {
    try {
      const db = window.db || firebase.firestore();
      const snap = await db
        .collection("power_tests")
        .doc(uid)
        .collection("tests")
        .orderBy("createdAtMs", "desc")
        .limit(1)
        .get();

      if (snap.empty) return null;
      const doc = snap.docs[0];
      return { _id: doc.id, ...(doc.data() || {}) };
    } catch (e) {
      console.warn("[AthleteCore] fetchLatestPower failed", e);
      return null;
    }
  }

  async function fetchRecentByUserId(collectionName, userId, daysBack = 28, hardCap = 160) {
    if(collectionName==='load_season_reports'){
      const end=new Date(),start=new Date();start.setDate(start.getDate()-daysBack);
      const date=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      try{return (await readJournalLoads(userId)).knownRows.filter(row=>row.date>=date(start)&&row.date<=date(end)).slice(-hardCap);}catch(e){console.warn('[AthleteCore] journal unavailable',e);return [];}
    }
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysBack);
    const cutoffTs = cutoff.getTime();

    try {
      // ВАРІАНТ 1: швидко (може попросити індекс)
      try {
        const snap = await db
          .collection(collectionName)
          .where("userId", "==", userId)
          .orderBy("timestamp", "desc")
          .limit(hardCap)
          .get();

        if (snap.empty) return [];

        const arr = [];
        snap.forEach((doc) => {
          const d = doc.data() || {};
          const t = pickBestTimestamp(d);
          if (t >= cutoffTs) arr.push(d);
        });

        // від старого до нового
        arr.sort((a, b) => pickBestTimestamp(a) - pickBestTimestamp(b));
        return arr;
      } catch (e1) {
        // ВАРІАНТ 2: fallback без orderBy (надійно)
        const snap = await db
          .collection(collectionName)
          .where("userId", "==", userId)
          .get();

        if (snap.empty) return [];

        const arr = [];
        snap.forEach((doc) => {
          const d = doc.data() || {};
          const t = pickBestTimestamp(d);
          if (t >= cutoffTs) arr.push(d);
        });

        arr.sort((a, b) => pickBestTimestamp(a) - pickBestTimestamp(b));
        return arr.slice(-hardCap); // hard cap на випадок дуже великих колекцій
      }
    } catch (e2) {
      console.warn(`[AthleteCore] fetchRecentByUserId failed: ${collectionName}`, e2);
      return [];
    }
  }

  function normalizeConnected(raw) {
    if (!raw) return null;
    const stepsToday = Number(raw.stepsToday ?? raw.steps ?? 0) || 0;
    const distanceKm = Number(raw.distanceKm ?? raw.connectedDistanceKm ?? raw.distance ?? 0) || 0;
    const hrvMs = Number(raw.hrvMs ?? raw.hrv ?? 0) || 0;
    const restingHr = Number(raw.restingHr ?? raw.rhr ?? 0) || 0;
    const sleepHours = Number(raw.sleepHours ?? raw.sleepDurationHours ?? 0) || 0;
    const recoveryScore = Number(raw.recoveryScore ?? raw.recovery ?? 0) || 0;
    const strainScore = Number(raw.strainScore ?? raw.strain ?? 0) || 0;
    return {
      ...raw,
      source: "connected",
      stepsToday,
      distanceKm,
      hrvMs,
      restingHr,
      sleepHours,
      recoveryScore,
      strainScore,
      timestamp: raw.timestamp || raw.syncedAt || raw.updatedAt || null,
    };
  }

  async function fetchLatestConnected(userId) {
    try {
      const [connectedDaily, userSnap] = await Promise.all([
        fetchLatestByUserId("connected_daily", userId),
        db.collection("users").doc(userId).get().catch(() => null),
      ]);
      const fromDaily = normalizeConnected(connectedDaily);
      const fromUser = normalizeConnected(userSnap?.exists ? (userSnap.data()?.connectedSync || null) : null);
      const tDaily = pickBestTimestamp(fromDaily || {});
      const tUser = pickBestTimestamp(fromUser || {});
      if (!fromDaily && !fromUser) return null;
      if (tUser > tDaily) return fromUser;
      return fromDaily || fromUser;
    } catch (e) {
      console.warn("[AthleteCore] fetchLatestConnected failed", e);
      return null;
    }
  }

  async function fetchUserProfile(userId) {
    try {
      const snap = await db.collection("users").doc(userId).get();
      if (!snap.exists) return null;
      const d = snap.data() || {};
      const goals = Array.isArray(d.goals)
        ? d.goals.map((x) => String(x || "").trim()).filter(Boolean)
        : [];
      return {
        sportType: d.sportType || d.sport || null,
        seasonPhase: d.seasonPhase || d.season || null,
        playerPosition: d.playerPosition || d.position || null,
        goals,
      };
    } catch (e) {
      console.warn("[AthleteCore] fetchUserProfile failed", e);
      return null;
    }
  }

  function emitCorePacket(packet) {
    if (!packet) return;
    const { userId, weekId, core, signals } = packet;
    if (signals) {
      window.__athleteSignals = signals;
      window.__athleteCoreUserId = String(userId || "");
      document.dispatchEvent(
        new CustomEvent("athletecore:signals", { detail: signals })
      );
    }
    if (core) {
      window.__core = core;
      window.__athleteCore = core;
      window.__athleteCoreUserId = String(userId || "");
      document.dispatchEvent(
        new CustomEvent("athletecore:ready", {
          detail: { userId, weekId, core, signals },
        })
      );
    }
  }

  async function runCore(opts = {}) {
    const force = Boolean(opts && opts.force);
    if (!force && __lastCorePacket && (Date.now() - __lastCoreAtMs) < CORE_CACHE_TTL_MS) {
      emitCorePacket(__lastCorePacket);
      return __lastCorePacket;
    }
    if (__runCoreInFlight) return __runCoreInFlight;

    __runCoreInFlight = (async () => {
      const userId = getUidFromContext();
      const weekId = getWeekIdFromUrl() || getWeekID();

      if (!userId) {
        console.warn("[AthleteCore] userId not ready yet");
        return null;
      }

      const runVersion = ++__runCoreVersion;
      const [
        wellness,
        injury,
        load,
        weight,
        power,
        connectedDaily,
        userSnap
      ] = await Promise.all([
        fetchLatestByUserId("wellness_reports", userId),
        fetchLatestByUserIdOrUid("injuries", userId),
        fetchLatestByUserId("load_season_reports", userId),
        fetchLatestByUserId("weight_history", userId),
        fetchLatestPowerTest(userId),
        fetchLatestByUserId("connected_daily", userId),
        db.collection("users").doc(userId).get().catch(() => null),
      ]);

      const userData = userSnap?.exists ? (userSnap.data() || {}) : {};
      const profile = {
        sportType: userData.sportType || userData.sport || null,
        seasonPhase: userData.seasonPhase || userData.season || null,
        playerPosition: userData.playerPosition || userData.position || null,
        goals: Array.isArray(userData.goals)
          ? userData.goals.map((x) => String(x || "").trim()).filter(Boolean)
          : [],
      };

      const connectedFromDaily = normalizeConnected(connectedDaily);
      const connectedFromUser = normalizeConnected(userData.connectedSync || null);
      const tDaily = pickBestTimestamp(connectedFromDaily || {});
      const tUser = pickBestTimestamp(connectedFromUser || {});
      const connected = (!connectedFromDaily && !connectedFromUser)
        ? null
        : (tUser > tDaily ? connectedFromUser : (connectedFromDaily || connectedFromUser));

      const prevSignals = (__lastCorePacket && __lastCorePacket.userId === userId)
        ? (__lastCorePacket.signals || null)
        : null;
      const seedWellnessRecent = Array.isArray(prevSignals?.wellnessRecent) ? prevSignals.wellnessRecent : [];
      const seedLoadRecent = Array.isArray(prevSignals?.loadRecent) ? prevSignals.loadRecent : [];
      const seedWeightRecent = Array.isArray(prevSignals?.weightRecent) ? prevSignals.weightRecent : [];

      const normalizedInjury = normalizeInjury(injury);
      const normalizedWellness = normalizeWellness(wellness);

      window.__wellnessData = normalizedWellness;
      window.__injuryData = normalizedInjury;
      window.__loadData = load;

      const signalsPacket = {
        userId,
        uid: userId,
        weekId,
        wellness: normalizedWellness,
        injury: normalizedInjury,
        load,
        weight,
        power,
        connected,
        profile,
        goals: Array.isArray(profile.goals) ? profile.goals : [],
        wellnessRecent: seedWellnessRecent,
        loadRecent: seedLoadRecent,
        weightRecent: seedWeightRecent,
        fetchedAt: new Date().toISOString(),
      };

      let core = null;
      if (!window.AthleteCore || typeof window.AthleteCore.calculate !== "function") {
        console.warn("[AthleteCore] AthleteCore.calculate not found yet (signals saved)");
      } else {
        core = window.AthleteCore.calculate(userId, {
          userId,
          uid: userId,
          weekId,
          wellness: normalizedWellness,
          injury: normalizedInjury,
          load,
          weight,
          power,
          connected,
          profile,
          goals: Array.isArray(profile.goals) ? profile.goals : [],
          wellnessRecent: seedWellnessRecent,
          loadRecent: seedLoadRecent,
          weightRecent: seedWeightRecent,
          signals: signalsPacket,
        });
      }

      const packet = { userId, weekId, core, signals: signalsPacket };
      __lastCorePacket = packet;
      __lastCoreAtMs = Date.now();
      emitCorePacket(packet);

      // Background enrichment: heavy 28-day history should not block first paint.
      Promise.all([
        fetchRecentByUserId("wellness_reports", userId, 28),
        fetchRecentByUserId("load_season_reports", userId, 28),
        fetchRecentByUserId("weight_history", userId, 28),
      ]).then((recentRows) => {
        if (runVersion !== __runCoreVersion) return;
        const wellnessRecent = Array.isArray(recentRows?.[0]) ? recentRows[0] : [];
        const loadRecent = Array.isArray(recentRows?.[1]) ? recentRows[1] : [];
        const weightRecent = Array.isArray(recentRows?.[2]) ? recentRows[2] : [];

        const sameLengths =
          wellnessRecent.length === seedWellnessRecent.length &&
          loadRecent.length === seedLoadRecent.length &&
          weightRecent.length === seedWeightRecent.length;
        const latestTs = (arr) => {
          if (!Array.isArray(arr) || !arr.length) return 0;
          return pickBestTimestamp(arr[arr.length - 1] || {});
        };
        const sameNewest =
          latestTs(wellnessRecent) === latestTs(seedWellnessRecent) &&
          latestTs(loadRecent) === latestTs(seedLoadRecent) &&
          latestTs(weightRecent) === latestTs(seedWeightRecent);
        if (sameLengths && sameNewest) return;

        const nextSignals = {
          ...signalsPacket,
          wellnessRecent,
          loadRecent,
          weightRecent,
          fetchedAt: new Date().toISOString(),
        };

        let nextCore = core;
        if (window.AthleteCore && typeof window.AthleteCore.calculate === "function") {
          nextCore = window.AthleteCore.calculate(userId, {
            userId,
            uid: userId,
            weekId,
            wellness: normalizedWellness,
            injury: normalizedInjury,
            load,
            weight,
            power,
            connected,
            profile,
            goals: Array.isArray(profile.goals) ? profile.goals : [],
            wellnessRecent,
            loadRecent,
            weightRecent,
            signals: nextSignals,
          });
        }

        const nextPacket = { userId, weekId, core: nextCore, signals: nextSignals };
        __lastCorePacket = nextPacket;
        __lastCoreAtMs = Date.now();
        emitCorePacket(nextPacket);
      }).catch((e) => {
        console.warn("[AthleteCore] recent enrichment failed", e);
      });

      return packet;
    })();

    try {
      return await __runCoreInFlight;
    } finally {
      __runCoreInFlight = null;
    }
  }

  // ---------- запуск ----------
  firebase.auth().onAuthStateChanged((user) => {
    if (!user) return;

    // ✅ трошки зачекаємо, щоб Weekly встиг виставити window.currentUserId
    setTimeout(runCore, 80);
  });

  // ручний перерахунок
  window.refreshAthleteCore = (opts) => runCore(opts);
})();
