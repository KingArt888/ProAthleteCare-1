(function () {
  const TARGETS = {
    weekly: "pac-weekly-drill-library",
    library: "pac-exercise-drill-library"
  };
  const LOCAL_DRILL_KEY = "pac_imported_drill_library";
  let remoteDrills = [];

  function roleAllowsDrillLibrary(profile = {}) {
    const role = String(profile.role || "").toLowerCase();
    const email = String(profile.email || firebase.auth()?.currentUser?.email || "").toLowerCase();
    return role === "coach" || role === "admin" || profile.isSuper === true || email === "kulyk015@gmail.com";
  }

  function setDrillPanelsVisible(visible) {
    document.querySelectorAll("[data-coach-admin-only].pac-drill-library-panel").forEach((panel) => {
      panel.style.display = visible ? "" : "none";
    });
  }

  async function currentUserCanUseDrillLibrary(user) {
    if (!user || !window.firebase?.firestore) return false;
    try {
      const snap = await firebase.firestore().collection("users").doc(user.uid).get();
      return roleAllowsDrillLibrary(snap.exists ? (snap.data() || {}) : {});
    } catch (e) {
      console.warn("[PAC Drill Library] role check failed:", e?.message || e);
      return false;
    }
  }

  async function initForUser(user) {
    const host = Object.values(TARGETS).map((id) => document.getElementById(id)).find(Boolean);
    if (!host && !window.EXERCISE_LIBRARY) return;
    wireImportJson();
    const localDrills = loadLocalDrills();
    if (host && localDrills.length) render(host, localDrills);
    if (window.EXERCISE_LIBRARY && localDrills.length) injectIntoExerciseLibrary(localDrills);
    if (!window.firebase?.firestore) {
      setDrillPanelsVisible(Boolean(localDrills.length));
      return;
    }
    const allowed = await currentUserCanUseDrillLibrary(user);
    setDrillPanelsVisible(allowed || Boolean(localDrills.length));
    if (!allowed) return;

    firebase.firestore().collection("drill_canvases")
      .where("savedToExerciseLibrary", "==", true)
      .limit(48)
      .onSnapshot((snap) => {
        const drills = [];
        snap.forEach((doc) => {
          const data = doc.data() || {};
          drills.push({ id: doc.id, ...data });
        });
        remoteDrills = drills;
        const allDrills = mergeDrills(loadLocalDrills(), remoteDrills);
        allDrills.sort((a, b) => {
          const av = typeof a.updatedAt?.toMillis === "function" ? a.updatedAt.toMillis() : Date.parse(a.updatedAt || "") || 0;
          const bv = typeof b.updatedAt?.toMillis === "function" ? b.updatedAt.toMillis() : Date.parse(b.updatedAt || "") || 0;
          return bv - av;
        });
        if (host) render(host, allDrills);
        if (window.EXERCISE_LIBRARY) injectIntoExerciseLibrary(allDrills);
      }, () => {
        const localDrills = loadLocalDrills();
        if (host) render(host, localDrills);
        if (window.EXERCISE_LIBRARY) injectIntoExerciseLibrary(localDrills);
      });
  }

  function init() {
    setDrillPanelsVisible(false);
    if (!window.firebase?.auth) return;
    firebase.auth().onAuthStateChanged((user) => {
      initForUser(user);
    });
  }

  function drillSport(drill = {}) {
    const explicit = drill.sport || drill.exerciseStructure?.sport || drill.exerciseObject?.sport || drill.fieldLayout?.sport;
    if (explicit) return String(explicit).toLowerCase() === "rugby" ? "rugby" : "football";
    return /rugby/i.test(String(drill.category || "") + String(drill.fieldImage || ""))
      || (drill.objects || []).some(item => item.meta?.inventoryKind === "rugby-ball" || item.meta?.formationSport === "rugby") ? "rugby" : "football";
  }

  function render(host, drills) {
    if (!drills.length) {
      host.innerHTML = `<div class="pac-drill-empty">No saved tactical drills yet. <button type="button" data-pac-import-drill-json>Import JSON</button></div>`;
      return;
    }
    host.innerHTML = `
      <div class="pac-drill-sport-tabs" role="group" aria-label="Sport filter">${["all","football","rugby"].map(sport => `<button type="button" data-library-sport="${sport}" aria-pressed="${(host.dataset.sportFilter || "all") === sport}">${sport === "all" ? "All" : sport === "rugby" ? "Rugby" : "Football"}</button>`).join("")}</div>
      <div class="pac-drill-strip">
        ${drills.filter(d => !host.dataset.sportFilter || host.dataset.sportFilter === "all" || drillSport(d) === host.dataset.sportFilter).map((d) => `
          <article class="pac-drill-card">
            <span>${drillSport(d) === "rugby" ? "Rugby" : "Football"} · ${escapeHtml(typeLabel(d.drillType))} &middot; ${escapeHtml(d.mdStatus || "TRAIN")}</span>
            <strong>${escapeHtml(d.title || "Untitled drill")}</strong>
            <small>${escapeHtml(d.category || "Football Tactical")} &middot; ${escapeHtml(d.intensity || "medium")} &middot; ${escapeHtml(d.duration || d.timingEngine?.duration || 30)}s</small>
            <div class="pac-drill-actions">
              <a href="drill-player.html?id=${encodeURIComponent(d.id)}&v=20260603-daily-meter-sync">Athlete mode</a>
              <a href="drill-canvas-editor.html?id=${encodeURIComponent(d.id)}">Edit</a>
            </div>
          </article>
        `).join("")}
      </div>`;
  }

  function wireImportJson() {
    if (document.body?.dataset.pacDrillImportWired === "1") return;
    if (document.body) document.body.dataset.pacDrillImportWired = "1";
    document.addEventListener("click", (event) => {
      const btn = event.target?.closest?.("[data-pac-import-drill-json]");
      if (!btn) return;
      event.preventDefault();
      let input = document.getElementById("pac-drill-json-import-file");
      if (!input) {
        input = document.createElement("input");
        input.id = "pac-drill-json-import-file";
        input.type = "file";
        input.accept = "application/json,.json";
        input.hidden = true;
        document.body.appendChild(input);
        input.addEventListener("change", () => {
          importJsonFile(input.files?.[0]);
          input.value = "";
        });
      }
      input.click();
    });
  }

  function loadLocalDrills() {
    try {
      const parsed = window.PACDrillLocalStorage ? window.PACDrillLocalStorage.read() : JSON.parse(localStorage.getItem(LOCAL_DRILL_KEY) || "[]");
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch {
      return [];
    }
  }

  function saveLocalDrills(drills) {
    try {
      if (window.PACDrillLocalStorage) window.PACDrillLocalStorage.write(drills || []);
      else localStorage.setItem(LOCAL_DRILL_KEY, JSON.stringify(drills || []));
    } catch (err) {
      console.warn("[PAC Drill Library] local import save failed:", err?.message || err);
      throw err;
    }
  }

  function mergeDrills(local, remote) {
    const map = new Map();
    [...(local || []), ...(remote || [])].forEach((drill) => {
      if (!drill) return;
      const key = String(drill.id || drill.drillId || drill.localId || drill.title || Math.random());
      map.set(key, { ...drill, id: String(drill.id || drill.drillId || key) });
    });
    return [...map.values()];
  }

  function normalizeImportedDrill(payload = {}) {
    const id = String(payload.id || payload.drillId || payload.exerciseObject?.drillId || "").trim() || `local_${Date.now()}`;
    return {
      ...payload,
      id,
      savedToExerciseLibrary: true,
      libraryTargets: ["coach_week_editor", "exercise_library"],
      updatedAt: payload.updatedAt || new Date().toISOString(),
      title: payload.title || payload.exerciseObject?.title || payload.exerciseObject?.name || "Imported tactical drill"
    };
  }

  function importPayload(payload) {
    const drill = normalizeImportedDrill(payload);
    const next = mergeDrills([drill], loadLocalDrills());
    saveLocalDrills(next);
    const allDrills = mergeDrills(next, remoteDrills);
    Object.values(TARGETS).forEach((id) => {
      const host = document.getElementById(id);
      if (host) render(host, allDrills);
    });
    if (window.EXERCISE_LIBRARY) injectIntoExerciseLibrary(allDrills);
    window.dispatchEvent(new CustomEvent("pac:drill-library-updated", { detail: { count: allDrills.length, imported: true } }));
    return drill;
  }

  function importJsonFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        importPayload(JSON.parse(String(reader.result || "{}")));
      } catch (err) {
        console.warn("[PAC Drill Library] JSON import failed:", err?.message || err);
        alert("Could not import this drill JSON.");
      }
    };
    reader.readAsText(file);
  }

  function injectIntoExerciseLibrary(drills) {
    if (!window.EXERCISE_LIBRARY || !Array.isArray(drills)) return;
    ["Pre-Training", "Main Training", "Post-Training"].forEach((stage) => {
      window.EXERCISE_LIBRARY[stage] = window.EXERCISE_LIBRARY[stage] || {};
      Object.values(window.EXERCISE_LIBRARY[stage]).forEach((category) => {
        if (!Array.isArray(category?.exercises)) return;
        category.exercises = category.exercises.filter((item) => {
          if (item?.pacDrillLibraryItem) return false;
          if (String(item?.videoKey || "").startsWith("drill:")) return false;
          if (String(item?.type || "") === "drill_canvas") return false;
          return true;
        });
      });
      drills.forEach((drill) => {
        const ex = toExercise(drill);
        const category = drillLibraryCategory(drill);
        window.EXERCISE_LIBRARY[stage][category] = window.EXERCISE_LIBRARY[stage][category] || {
          qualities: drillCategoryQualities(category, drill),
          exercises: []
        };
        const list = window.EXERCISE_LIBRARY[stage][category].exercises;
        const drillId = String(drill.id || drill.drillId || ex.drillId || "");
        const exName = String(ex.name || ex.title || drill.title || "").trim().toLowerCase();
        const idx = list.findIndex((item) => {
          if (drillId && String(item.drillId || "") === drillId) return true;
          return String(item.name || item.title || "").trim().toLowerCase() === exName;
        });
        const nextExercise = { ...ex, category, pacDrillLibraryItem: true };
        if (idx >= 0) list[idx] = nextExercise;
        else list.push(nextExercise);
      });
    });
    window.dispatchEvent(new CustomEvent("pac:drill-library-updated", { detail: { count: drills.length } }));
  }

  function drillLibraryCategory(drill = {}) {
    return drillSport(drill) === "rugby"
      ? (isIntervalDrill(drill) ? "Rugby Intervals" : "Rugby Tactical Drills")
      : (isIntervalDrill(drill) ? "High Intensity Intervals" : "Football Tactical Drills");
  }

  function drillCategoryQualities(category, drill = {}) {
    if (category === "High Intensity Intervals") return ["Intervals", "Tabata", "Conditioning"];
    const quality = drill.criteria?.quality || drill.category || "Tactical";
    return ["Speed", "Activation", quality].filter(Boolean);
  }

  function isIntervalDrill(drill = {}) {
    const cfg = drill.exerciseObject?.intervalSettings || drill.intervalSettings || drill.timingEngine?.intervalSettings || {};
    const text = [
      drill.category,
      drill.subcategory,
      drill.criteria?.category,
      drill.criteria?.subcategory,
      drill.criteria?.quality,
      drill.criteria?.loadType,
      drill.exerciseObject?.category,
      drill.exerciseObject?.subcategory,
      drill.exerciseObject?.quality,
      Array.isArray(drill.tags) ? drill.tags.join(" ") : ""
    ].join(" ").toLowerCase();
    return Boolean(
      runningTargetFromDrill(drill) ||
      /interval|tabata|aerobic|anaerobic|repeated sprint|conditioning|metabolic|high intensity|hiit/.test(text) ||
      (Number(cfg.rounds || 0) > 1 && Number(cfg.restSeconds || 0) > 0 && /conditioning|metabolic|speed|sprint/.test(text))
    );
  }

  function runningTargetFromDrill(drill = {}) {
    const direct = drill.runningTarget
      || drill.timingEngine?.runningTarget
      || drill.exerciseStructure?.runningTarget
      || drill.exerciseObject?.runningTarget
      || drill.exerciseObject?.timingEngine?.runningTarget;
    if (direct && typeof direct === "object") return direct;
    const zone = (Array.isArray(drill.measurements) ? drill.measurements : []).find((m) => m?.runningTarget);
    return zone?.runningTarget || null;
  }

  function speedTargetFromDrill(drill = {}) {
    const direct = drill.speedTarget
      || drill.timingEngine?.speedTarget
      || drill.exerciseStructure?.speedTarget
      || drill.exerciseObject?.speedTarget
      || drill.exerciseObject?.timingEngine?.speedTarget;
    if (direct && typeof direct === "object") return direct;
    const zone = (Array.isArray(drill.measurements) ? drill.measurements : []).find((m) => m?.speedTarget);
    return zone?.speedTarget || null;
  }

  function toExercise(drill) {
    const fieldLayout = resolveFieldLayout(drill);
    const runningTarget = runningTargetFromDrill(drill);
    const speedTarget = speedTargetFromDrill(drill);
    if (drill.exerciseObject && typeof drill.exerciseObject === "object") {
      const timingEngine = drill.exerciseObject.timingEngine || drill.timingEngine || {};
      const intervalSettings = drill.exerciseObject.intervalSettings || timingEngine.intervalSettings || drill.timingEngine?.intervalSettings || {};
      const timer = drill.exerciseObject.timer || intervalTimerFromSettings(intervalSettings);
      const prescription = drill.exerciseObject.prescription || {
        sets: timer.sets || 1,
        reps: timer.workSec || drill.duration || 30,
        repsUnit: "sec",
        timedSeconds: timer.workSec || drill.duration || 30
      };
      return {
        ...drill.exerciseObject,
        sport: drillSport(drill),
        name: drill.exerciseObject.name || drill.exerciseObject.title || drill.title || "Untitled tactical drill",
        videoKey: `drill:${drill.id}`,
        drillId: drill.id,
        fieldLayout,
        tacticalDrill: drill,
        coachGuided: drill.exerciseObject.coachGuided !== false,
        duration: drill.exerciseObject.duration || drill.duration || timingEngine.duration || 30,
        prescription,
        timer,
        intervalSettings,
        runningTarget,
        speedTarget,
        timingEngine: {
          ...timingEngine,
          intervalSettings,
          runningTarget,
          speedTarget
        },
        guidedIntervalWorkout: drill.exerciseObject.guidedIntervalWorkout || drill.exports?.guidedIntervalWorkout || {
          type: "guided_interval_workout",
          precision: "single-master-clock",
          duration: drill.duration || timingEngine.duration || 30,
          intervalSettings,
          events: drill.exerciseStructure?.timingLayers || []
        },
        timingLayers: drill.exerciseObject.timingLayers || drill.exerciseStructure?.timingLayers || [],
        audioLayers: drill.exerciseObject.audioLayers || drill.exerciseStructure?.audioLayers || [],
        animationLayers: drill.exerciseObject.animationLayers || drill.exerciseStructure?.animationLayers || []
      };
    }
    return {
      sport: drillSport(drill),
      name: drill.title || "Untitled tactical drill",
      title: drill.title || "Untitled tactical drill",
      description: `Interactive ProAthleteCare ${drillSport(drill)} drill with field layout, movement phases, animation, timing, and audio cues.`,
      category: drill.category || (drillSport(drill) === "rugby" ? "Rugby Tactical" : "Football Tactical"),
      subcategory: drill.subcategory || drill.criteria?.subcategory || "",
      quality: drill.criteria?.quality || drill.category || (drillSport(drill) === "rugby" ? "Rugby Tactical" : "Football Tactical"),
      mdStatus: drill.mdStatus || "TRAIN",
      intensity: drill.intensity || "medium",
      duration: drill.duration || drill.timingEngine?.duration || 30,
      prescription: prescriptionFromDrill(drill),
      timer: timerFromDrill(drill),
      intervalSettings: drill.timingEngine?.intervalSettings || {},
      runningTarget,
      speedTarget,
      timingEngine: {
        ...(drill.timingEngine || {}),
        runningTarget,
        speedTarget
      },
      guidedIntervalWorkout: drill.exports?.guidedIntervalWorkout || {
        type: "guided_interval_workout",
        precision: "single-master-clock",
        duration: drill.duration || drill.timingEngine?.duration || 30,
        intervalSettings: drill.timingEngine?.intervalSettings || {},
        events: drill.exerciseStructure?.timingLayers || []
      },
      criteria: drill.criteria || drill.exerciseStructure?.criteria || {},
      loadType: drill.criteria?.loadType || "",
      goal: drill.criteria?.goal || "",
      riskLevel: drill.criteria?.riskLevel || "",
      distanceMeters: drill.criteria?.distanceMeters || 0,
      playerCount: drill.criteria?.playerCount || 1,
      surface: drill.criteria?.surface || "",
      equipment: drill.criteria?.equipment || [],
      positionTags: drill.criteria?.positionTags || [],
      injuryTags: drill.criteria?.injuryTags || [],
      tags: Array.isArray(drill.tags) ? drill.tags : ["football", "tactical_drill"],
      videoKey: `drill:${drill.id}`,
      drillId: drill.id,
      fieldLayout,
      tacticalDrill: drill,
      animationLayers: drill.exerciseStructure?.animationLayers || [],
      audioLayers: drill.exerciseStructure?.audioLayers || [],
      timingLayers: drill.exerciseStructure?.timingLayers || [],
      inventoryObjects: drill.exerciseStructure?.inventoryObjects || [],
      movementPhases: drill.exerciseStructure?.movementPhases || []
    };
  }

  function intervalTimerFromSettings(cfg = {}) {
    const blocks = Math.max(1, Number(cfg.sets || 1) || 1);
    const rounds = Math.max(1, Number(cfg.rounds || 1) || 1);
    return {
      sets: Math.max(1, Math.round(blocks * rounds)),
      workSec: Math.max(1, Math.round(Number(cfg.workSeconds || 0) || 30)),
      restSec: Math.max(0, Math.round(Number(cfg.restSeconds || 0) || 0)),
      prepSec: Math.max(0, Math.round(Number(cfg.preparationSeconds || 0) || 0)),
      restBetweenSets: Math.max(0, Math.round(Number(cfg.restBetweenSets || 0) || 0)),
      rounds,
      blocks,
      source: "drill_canvas_interval_settings"
    };
  }

  function timerFromDrill(drill = {}) {
    return drill.exerciseObject?.timer || intervalTimerFromSettings(drill.timingEngine?.intervalSettings || {});
  }

  function prescriptionFromDrill(drill = {}) {
    const timer = timerFromDrill(drill);
    return drill.exerciseObject?.prescription || {
      sets: timer.sets || 1,
      reps: timer.workSec || drill.duration || 30,
      repsUnit: "sec",
      timedSeconds: timer.workSec || drill.duration || 30
    };
  }

  function resolveFieldLayout(drill = {}) {
    const imageUrl = drill.fieldImageUrl
      || drill.fieldLayout?.imageUrl
      || drill.exerciseStructure?.fieldLayout?.imageUrl
      || drill.exerciseObject?.fieldLayout?.imageUrl
      || "";
    return {
      ...(drill.fieldLayout || drill.exerciseStructure?.fieldLayout || drill.exerciseObject?.fieldLayout || {}),
      imageUrl,
      hasUploadedField: Boolean(imageUrl || drill.fieldImageData)
    };
  }

  function typeLabel(type) {
    return String(type || "template").replace(/_/g, " ").toUpperCase();
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[<>&"]/g, (m) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[m]));
  }

  window.PAC_DRILL_LIBRARY = {
    importPayload,
    importJsonFile,
    loadLocalDrills,
    saveLocalDrills,
    mergeDrills
  };

  document.addEventListener("DOMContentLoaded", init);
})();
