// coach-week-editor.js — ProAtletCare (Coach Templates Editor)


// ===== Week helpers (for history strip + consistent weekId) =====
function _iso(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + day;
}

function _parseIsoLocal(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const m = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const d = Number(m[3]);
  const dt = new Date(y, mo, d);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function mondayOf(dateStr) {
  const d = _parseIsoLocal(dateStr) || new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  const dow = (d.getDay() === 0) ? 6 : d.getDay() - 1; // Mon=0..Sun=6
  d.setDate(d.getDate() - dow);
  return _iso(d);
}

function sundayOfMonday(monISO) {
  const d = _parseIsoLocal(monISO) || new Date(monISO);
  if (isNaN(d.getTime())) return monISO;
  d.setDate(d.getDate() + 6);
  return _iso(d);
}

// weekId беремо з URL ?weekId=YYYY-MM-DD
function getWeekIdFromUrl() {
  const u = new URL(window.location.href);
  const raw = u.searchParams.get("weekId");
  return raw ? mondayOf(raw) : null; // ✅ навіть якщо прийшла неділя — робимо понеділок
}


// твоя функція getWeekID() лишається (fallback)
function getWeekID() {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return _iso(monday);
}

let currentWeekId = getWeekIdFromUrl() || getWeekID();
const STORAGE_KEY = `weeklyPlanData_${currentWeekId}`;

const _ctxQs = new URLSearchParams(window.location.search);
const _ctxAsAdmin = _ctxQs.get("asAdmin") === "1";
const _ctxCoachId = (_ctxQs.get("coachId") || "").trim();

function coachContextParams() {
  if (_ctxAsAdmin && _ctxCoachId) {
    return `asAdmin=1&coachId=${encodeURIComponent(_ctxCoachId)}`;
  }
  return "";
}
function templateOwnerCoachId() {
  if (_ctxAsAdmin && _ctxCoachId) return _ctxCoachId;
  return String(firebase.auth().currentUser?.uid || "").trim();
}
function coachTemplateDocId(weekId) {
  const ownerCoachId = templateOwnerCoachId();
  return ownerCoachId ? `${ownerCoachId}_${weekId}` : String(weekId || "");
}

function coachContextQuery(prefix = "&") {
  const p = coachContextParams();
  return p ? `${prefix}${p}` : "";
}

function applyCoachPlannerNavContext() {
  const p = coachContextParams();
  const withP = (base) => p ? `${base}?${p}` : base;

  const navDash = document.getElementById("cwe-nav-dashboard");
  const navWeek = document.getElementById("cwe-nav-week");
  const navDate = document.getElementById("cwe-nav-date");
  const navAdmin = document.getElementById("cwe-nav-admin-panel");

  if (navDash) navDash.href = withP("coach-dashboard.html");
  if (navWeek) {
    const base = `coach-week-editor.html?weekId=${encodeURIComponent(currentWeekId)}`;
    navWeek.href = p ? `${base}&${p}` : base;
  }
  if (navDate) navDate.href = withP("coach-date-plan.html");
  if (navAdmin) navAdmin.style.display = window.isAdmin ? "" : "none";
}


// ✅ якщо в URL випадково старий тиждень — підставляємо поточний
(function fixOldWeekId(){
  const u = new URL(window.location.href);
  const raw = u.searchParams.get("weekId");

  // якщо weekId є, але він дуже старий (більше ~120 днів) — скидаємо на поточний
  if (raw) {
    const mon = mondayOf(raw);
    const nowMon = getWeekID();
    const diffDays = (new Date(nowMon) - new Date(mon)) / (1000*60*60*24);

    if (diffDays > 120) { // 4 місяці назад = “дуже старе”
      currentWeekId = nowMon;
      u.searchParams.set("weekId", nowMon); 
      history.replaceState({}, "", u.toString());
    }
  } else {
    // якщо weekId нема — додаємо
    u.searchParams.set("weekId", currentWeekId);
    history.replaceState({}, "", u.toString());
  }

  window.currentWeekId = currentWeekId; // для дебагу
})();

let activeMode = (_ctxQs.get("mode") === "custom") ? "custom" : "standard"; // standard | custom
// ========= AUTO-SAVE (debounce) для draft =========
let _draftSaveTimer = null;
function scheduleDraftSave(reason = "") {
  clearTimeout(_draftSaveTimer);
  _draftSaveTimer = setTimeout(() => {
    saveDraftToTemplates().catch((e) => console.error("saveDraftToTemplates error:", reason, e));
  }, 350);
}

// Compat: старі виклики з weekly-individual
function syncPlanDataToFirebase() {
  scheduleDraftSave("planData");
}
function syncMicrocycleToFirebase() {
  scheduleDraftSave("microcycle");
}
// ===============================
// NOTIFICATIONS helpers (coach-week-editor)
// ===============================
async function createGlobalNotification({ title, text, weekId, mode, type = "PLAN_READY" }) {
  try {
    // ✅ 1 doc per (type + weekId + mode) → працює для різних мікроциклів
    const safeMode = (mode || "DEFAULT").toString().replace(/\s+/g, "_");
    const id = `${type}_${weekId}_${safeMode}`;

    const monday = new Date(`${weekId}T00:00:00`);
    if (isNaN(monday.getTime())) throw new Error("Invalid weekId (expected YYYY-MM-DD)");

    const sundayEvening = new Date(monday);
    sundayEvening.setDate(monday.getDate() + 6);
    sundayEvening.setHours(19, 0, 0, 0);

    const ref = db.collection("global_notifications").doc(id);

    await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);

      const payload = {
        type,
        title: title || "Update",
        text: text || "",
        weekId: weekId || null,
        mode: mode || null,

        // show only after this moment
        notifyAt: firebase.firestore.Timestamp.fromDate(sundayEvening),

        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      };

      // ✅ createdAt ставимо тільки 1 раз (коли документа ще нема)
      if (!snap.exists) {
        tx.set(ref, {
          ...payload,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
      } else {
        tx.set(ref, payload, { merge: true });
      }
    });

  } catch (e) {
    console.warn("createGlobalNotification failed:", e);
  }
}






/**
 * 2. FIREBASE AUTH ІНІЦІАЛІЗАЦІЯ
 */
firebase.auth().onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = 'regist.html';
    return;
  }


  const meSnap = await db.collection('users').doc(user.uid).get().catch(() => null);
  const me = (meSnap && meSnap.exists) ? (meSnap.data() || {}) : {};
  const rawRole = String(me.role || '').toLowerCase();
  const role = rawRole === 'trainer' ? 'coach' : rawRole;

  window.isAdmin = (user.email === "kulyk015@gmail.com") || role === 'admin';
  window.isCoach = role === 'coach';
  window.canEditWeek = !!(window.isAdmin || window.isCoach);

  if (_ctxAsAdmin && _ctxCoachId && !window.isAdmin) {
    alert(_weekUi("accessDenied"));
    window.location.href = '../platform.html';
    return;
  }

  if (!window.canEditWeek) {
    alert(_weekUi("accessDenied"));
    window.location.href = '../platform.html';
    return;
  }

if (!window.isAdmin) {
    const btnApplyAll = document.getElementById('btn-apply-all');
    if (btnApplyAll) btnApplyAll.style.display = 'none';
  }
  applyCoachPlannerNavContext();
  // показ тижня зверху
  const info = document.getElementById("coach-week-info");
  if (info) info.textContent = `${_weekUi("weekEditor")}: ${currentWeekId} | ${_weekUi("mode")}: ${activeMode.toUpperCase()}`;

  // підключаємо кнопки
  bindCoachButtons();
  setModeButtonsVisual();

  // вантажимо draft
  await loadDraftFromTemplates();
});



/**
 * 3. ФУНКЦІЇ СИНХРОНІЗАЦІЇ
 */
function getMicrocycleFromUI() {
  const micro = {};
  document.querySelectorAll('.activity-type-select').forEach((sel, idx) => {
    micro[`day${idx}`] = sel.value; // MATCH/TRAIN/REST
  });
  return micro;
}

function modeFromMicrocycle(micro) {
  const matchCount = Object.keys(micro || {}).filter((key) => String(micro[key] || "").toUpperCase() === "MATCH").length;
  return matchCount >= 2 ? "custom" : "standard";
}

function syncActiveModeToMicrocycle(micro) {
  const resolvedMode = modeFromMicrocycle(micro);
  if (activeMode !== resolvedMode) {
    activeMode = resolvedMode;
    setModeButtonsVisual();
    updateModeInUrl();
  }
  return resolvedMode;
}

function setMicrocycleToUI(micro) {
  document.querySelectorAll('.activity-type-select').forEach((sel, idx) => {
    const key = `day${idx}`;
    if (micro && micro[key]) sel.value = micro[key];
  });
}

function getPlanDataFromLocal() {
  const data = window.PACExerciseTask.ensurePlan(JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return data;
}

function setPlanDataToLocal(planData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(window.PACExerciseTask.ensurePlan(planData || {})));
}

async function loadDraftFromTemplates() {
  try {
    const ref = db.collection('week_templates_drafts').doc(coachTemplateDocId(currentWeekId));
    const snap = await ref.get();

    if (!snap.exists) {
      // пустий драфт: просто оновити кольори
      setPlanDataToLocal({});
      setMicrocycleToUI({});
      updateCycleColors();
      return;
    }

    const data = snap.data() || {};
    const block = data[activeMode] || {};

    setPlanDataToLocal(block.planData || {});
    setMicrocycleToUI(block.microcyclePreview || {});
    updateCycleColors();

    const info = document.getElementById("coach-week-info");
    if (info) info.textContent = `${_weekUi("weekEditor")}: ${currentWeekId} | ${_weekUi("mode")}: ${activeMode.toUpperCase()} | ${_weekUi("draftLoaded")} ✅`;

  } catch (e) {
    console.error("loadDraftFromTemplates error:", e);
  }
}

async function saveDraftToTemplates() {
  const microcyclePreview = getMicrocycleFromUI();
  const planData = getPlanDataFromLocal();
  const resolvedMode = syncActiveModeToMicrocycle(microcyclePreview);

  await db.collection('week_templates_drafts').doc(coachTemplateDocId(currentWeekId)).set({
    ownerCoachId: templateOwnerCoachId(),
    [resolvedMode]: {
      microcyclePreview,
      planData
    },
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  }, { merge: true });

  const info = document.getElementById("coach-week-info");
  if (info) info.textContent = `${_weekUi("savedDraft")} ✅ | ${_weekUi("week")}: ${currentWeekId} | ${_weekUi("mode")}: ${resolvedMode.toUpperCase()}`;
}

async function publishTemplates() {
  const microcyclePreview = getMicrocycleFromUI();
  const resolvedMode = syncActiveModeToMicrocycle(microcyclePreview);
  await saveDraftToTemplates();

  const draftSnap = await db.collection('week_templates_drafts').doc(coachTemplateDocId(currentWeekId)).get();
  const draft = draftSnap.exists ? draftSnap.data() : {};
  const block = (draft && draft[resolvedMode]) ? draft[resolvedMode] : null;

  if (!block || !block.planData || Object.keys(block.planData).length === 0) {
    alert(_weekUi("draftEmpty"));
    return;
  }

  const publishPayload = {};
  if (draft.standard) publishPayload.standard = draft.standard;
  if (draft.custom) publishPayload.custom = draft.custom;

  await db.collection('week_templates_published').doc(coachTemplateDocId(currentWeekId)).set({
  ownerCoachId: templateOwnerCoachId(),
  ...publishPayload,
  mode: resolvedMode,
  planData: block.planData,
  microcyclePreview: block.microcyclePreview || {}, // ✅ додали
  publishedAt: firebase.firestore.FieldValue.serverTimestamp(),
  publishedBy: firebase.auth().currentUser?.uid || null
}, { merge: true });
// ✅ GLOBAL notification: "Sunday plan ready"
if (window.isAdmin) {
  await createGlobalNotification({
    type: "PLANS_PREPARED",
    title: "Плани на тиждень підготовлені ✅",
    text: "Оберіть день матчу / ігровий мікроцикл, щоб отримати персональний розклад тренувань.",
    weekId: currentWeekId,
    mode: resolvedMode
  });
}





  alert(`${_weekUi("published")} ✅ (${resolvedMode})`);
}

function chooseModeForAthlete(userData) {
  const matchDays =
    Array.isArray(userData?.matchDays) ? userData.matchDays :
    Array.isArray(userData?.matchesThisWeek) ? userData.matchesThisWeek.map(m => m.dayIndex).filter(v => v !== undefined) :
    [];

  const sport = String(userData?.sportType || userData?.sport || "").trim().toLowerCase();
  const sportProfile =
    (["basketball", "volleyball", "handball", "tennis"].includes(sport)) ? "COURT_MD" :
    (["athletics", "other"].includes(sport)) ? "INDIVIDUAL_ENDURANCE" :
    "TEAM_MD";

  if (matchDays.length === 0) return "standard";

  if (sportProfile === "INDIVIDUAL_ENDURANCE") {
    return matchDays.length === 1 ? "standard" : "custom";
  }

  if (matchDays.length === 1 && (matchDays[0] === 5 || matchDays[0] === 6)) return "standard";
  return "custom";
}
async function applyPublishedTemplateToAllAthletes() {
  if (!window.isAdmin) {
    alert(_weekUi("onlyAdminApplyAll"));
    return;
  }

  // 1) беремо published doc
  const pubSnap = await db.collection('week_templates_published').doc(coachTemplateDocId(currentWeekId)).get();
  if (!pubSnap.exists) {
    alert(_weekUi("publishFirst"));
    return;
  }
  const pub = pubSnap.data() || {};

  // 2) ВАЖЛИВО: підтримка двох форматів:
  // - простий (як зараз): pub.planData + pub.microcyclePreview
  // - майбутній: pub.standard / pub.custom
  const standardBlock = pub.standard || { planData: pub.planData || {}, microcyclePreview: pub.microcyclePreview || {} };
  const customBlock   = pub.custom   || { planData: pub.planData || {}, microcyclePreview: pub.microcyclePreview || {} };

  // 3) список атлетів (беремо users)
  async function loadUserDocsPaged() {
    const PAGE_SIZE = 400;
    const MAX_USERS = 5000;
    const docs = [];
    let lastDoc = null;

    while (docs.length < MAX_USERS) {
      let query = db.collection("users").limit(PAGE_SIZE);
      if (lastDoc) query = query.startAfter(lastDoc);

      const snap = await query.get();
      if (snap.empty) break;

      docs.push(...snap.docs);
      lastDoc = snap.docs[snap.docs.length - 1] || null;

      if (snap.size < PAGE_SIZE) break;
    }

    if (docs.length >= MAX_USERS) {
      console.warn("applyPublishedTemplateToAllAthletes: users list truncated", { limit: MAX_USERS });
    }
    return docs.slice(0, MAX_USERS);
  }
  const userDocs = await loadUserDocsPaged();

  const pickModeForUser = (planDocData, userData) => {
    const explicit = String(planDocData?.microcycleMode || planDocData?.sourceTemplateMode || '').toUpperCase();
    if (explicit === 'CUSTOM') return 'custom';
    if (explicit === 'STANDARD') return 'standard';
    if (explicit === 'OFFSEASON') return 'standard';
    return chooseModeForAthlete(userData);
  };

  let batch = db.batch();
  let ops = 0;

  for (const u of userDocs) {
    const uid = u.id;
    const userData = u.data() || {};

    // пропускаємо технічні/порожні профілі (за потреби)
    // якщо у тебе є поле role, можна так:
    // if (userData.role !== 'athlete') return;

    const ref = db.collection('weekly_plans').doc(`${uid}_${currentWeekId}`);
    const existingSnap = await ref.get();
    const existingData = existingSnap.exists ? (existingSnap.data() || {}) : {};

    const mode = pickModeForUser(existingData, userData);
    const block = (mode === 'custom') ? customBlock : standardBlock;


    // Keep athlete-selected microcycle/state. Update only exercise plan data.
    batch.set(ref, {
      userId: uid,
      weekId: currentWeekId,
      sourceTemplateWeekId: currentWeekId,
      sourceTemplateMode: mode,
      planData: block.planData || {},
      lastCoachEditAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });





    ops++;
    if (ops >= 450) {
      // безпечніше за 500
      await batch.commit();
      batch = db.batch();
      ops = 0;
    }
  }

  if (ops > 0) await batch.commit();

  alert(`✅ ${_weekUi("appliedAll")}`);
}
// ===============================
// HTML escape helper (XSS safe)
// ===============================
function escapeHtml(input) {
  if (input == null) return "";
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function bindCoachButtons() {
  const btnStd = document.getElementById("mode-standard");
  const btnCus = document.getElementById("mode-custom");
  const btnSave = document.getElementById("btn-save-draft");
  const btnPub = document.getElementById("btn-publish");
  const btnApplyAll = document.getElementById("btn-apply-all");


  if (btnStd) btnStd.onclick = async () => {
    activeMode = "standard";
    setModeButtonsVisual();
    updateModeInUrl();
    await loadDraftFromTemplates();
  };

  if (btnCus) btnCus.onclick = async () => {
    activeMode = "custom";
    setModeButtonsVisual();
    updateModeInUrl();
    await loadDraftFromTemplates();
  };

  if (btnSave) btnSave.onclick = async () => {
    await saveDraftToTemplates();
  };

  if (btnPub) btnPub.onclick = async () => {
    await publishTemplates();
  };
    if (btnApplyAll) btnApplyAll.onclick = async () => {
  await applyPublishedTemplateToAllAthletes();
};
  // ВАЖЛИВО: форма не має робити submit
  const form = document.getElementById("weekly-plan-form");
  if (form) form.addEventListener("submit", (e) => e.preventDefault());
}



/**
 * 4. ТВОЯ ОРИГІНАЛЬНА ЛОГІКА ДИЗАЙНУ ТА ЦИКЛІВ
 */
const COLOR_MAP = {
    'MD': { status: 'MD', colorClass: 'color-red' },
    'MD+1': { status: 'MD+1', colorClass: 'color-dark-green' }, 
    'MD+2': { status: 'MD+2', colorClass: 'color-green' }, 
    'MD-1': { status: 'MD-1', colorClass: 'color-yellow' }, 
    'MD-2': { status: 'MD-2', colorClass: 'color-deep-green' }, 
    'MD-3': { status: 'MD-3', colorClass: 'color-orange' }, 
    'MD-4': { status: 'MD-4', colorClass: 'color-blue' }, 
    'REST': { status: 'REST', colorClass: 'color-neutral' }, 
    'TRAIN': { status: 'TRAIN', colorClass: 'color-dark-grey' }, 
};

function _weekLang() {
  const raw = String(localStorage.getItem("pac_lang") || "").toLowerCase();
  if (raw === "ua") return "uk";
  return ["uk", "en", "de", "es", "ru", "pt"].includes(raw) ? raw : "en";
}

function _weekT(key) {
  const L = {
    uk: { dayShort: ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "НД"], stagePre: "Розминка", stageMain: "Основне тренування", stagePost: "Заминка", rest: "ВІДПОЧИНОК", add: "Додати", select: "Вибрати", coachOnlyPlan: "Тільки тренер може планувати вправи", coachOnlyEdit: "Тільки тренер може змінювати програму" },
    en: { dayShort: ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"], stagePre: "Pre-Training", stageMain: "Main Training", stagePost: "Post-Training", rest: "REST", add: "Add", select: "Select", coachOnlyPlan: "Only coach can plan exercises", coachOnlyEdit: "Only coach can edit the program" },
    de: { dayShort: ["MO", "DI", "MI", "DO", "FR", "SA", "SO"], stagePre: "Vor dem Training", stageMain: "Haupttraining", stagePost: "Nach dem Training", rest: "RUHE", add: "Hinzufügen", select: "Auswählen", coachOnlyPlan: "Nur der Trainer kann Übungen planen", coachOnlyEdit: "Nur der Trainer kann das Programm ändern" },
    es: { dayShort: ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"], stagePre: "Pre-entrenamiento", stageMain: "Entrenamiento principal", stagePost: "Post-entrenamiento", rest: "DESCANSO", add: "Agregar", select: "Elegir", coachOnlyPlan: "Solo el entrenador puede planificar ejercicios", coachOnlyEdit: "Solo el entrenador puede editar el programa" },
    ru: { dayShort: ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"], stagePre: "Разминка", stageMain: "Основная тренировка", stagePost: "Заминка", rest: "ОТДЫХ", add: "Добавить", select: "Выбрать", coachOnlyPlan: "Только тренер может планировать упражнения", coachOnlyEdit: "Только тренер может изменять программу" },
    pt: { dayShort: ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"], stagePre: "Pré-treino", stageMain: "Treino principal", stagePost: "Pós-treino", rest: "DESCANSO", add: "Adicionar", select: "Selecionar", coachOnlyPlan: "Somente o treinador pode planejar exercícios", coachOnlyEdit: "Somente o treinador pode editar o programa" }
  };
  const lang = _weekLang();
  return (L[lang] && L[lang][key]) || L.en[key] || key;
}

function _weekUi(key) {
  const lang = _weekLang();
  const M = {
    uk: {
      docTitle: "Планер тижня тренера | ProAthleteCare",
      pageTitle: "Планер тижня тренера: Планування мікроциклу",
      pageSubtitle: "Ваш тижневий план, цикли навантаження та шаблони завдань.",
      weeks: "ТИЖНІ",
      weekMiniLabel: "Неділя",
      btnStandard: "СТАНДАРТ",
      btnCustom: "КАСТОМ",
      btnSaveDraft: "Зберегти чернетку",
      btnPublish: "Опублікувати",
      btnApplyAll: "Застосувати до ВСІХ",
      thDay: "День",
      dayMon: "Пн",
      dayTue: "Вт",
      dayWed: "Ср",
      dayThu: "Чт",
      dayFri: "Пт",
      daySat: "Сб",
      daySun: "Нд",
      mdStatus: "MD Status",
      activity: "Активність",
      optTrain: "Тренування",
      optMatch: "Матч",
      optRest: "Відпочинок",
      templatesTitle: "📝 Налаштування Шаблонів Вправ",
      templatesNote: "❗ Тут ви вказуєте категорію і кількість вправ для MD-статусу дня.",
      saveMain: "Зберегти тижневий план та шаблони",
      modalTitle: "Вибір вправи",
      filterTitle: "Фільтр за якістю навантаження:",
      addSelected: "Додати вибрані"
      ,
      accessDenied: "Доступ заборонено.",
      weekEditor: "Редактор тижня",
      mode: "Режим",
      week: "Тиждень",
      draftLoaded: "Чернетку завантажено",
      savedDraft: "Чернетку збережено",
      draftEmpty: "Чернетка порожня. Спочатку натисніть Save draft.",
      published: "Опубліковано",
      onlyAdminApplyAll: "Тільки адмін може застосувати для всіх.",
      publishFirst: "Спочатку натисніть Publish (published template не знайдено).",
      appliedAll: "Застосовано до всіх атлетів за поточний тиждень."
    },
    en: {
      docTitle: "Coach Weekly Planner | ProAthleteCare",
      pageTitle: "Coach Weekly Planner: Microcycle Planning",
      pageSubtitle: "Your weekly plan, load cycles and task templates.",
      weeks: "WEEKS",
      weekMiniLabel: "Sunday",
      btnStandard: "STANDARD",
      btnCustom: "CUSTOM",
      btnSaveDraft: "Save draft",
      btnPublish: "Publish",
      btnApplyAll: "Apply to ALL",
      thDay: "Day",
      dayMon: "Mon",
      dayTue: "Tue",
      dayWed: "Wed",
      dayThu: "Thu",
      dayFri: "Fri",
      daySat: "Sat",
      daySun: "Sun",
      mdStatus: "MD Status",
      activity: "Activity",
      optTrain: "Training",
      optMatch: "Match",
      optRest: "Rest",
      templatesTitle: "📝 Exercise Template Settings",
      templatesNote: "❗ Set category and number of exercises for each MD-status day.",
      saveMain: "Save Weekly Plan and Templates",
      modalTitle: "Exercise selection",
      filterTitle: "Load quality filter:",
      addSelected: "Add selected",
      accessDenied: "Access denied.",
      accessDenied: "Access denied.",
      weekEditor: "Week Editor",
      mode: "Mode",
      week: "Week",
      draftLoaded: "Draft loaded",
      savedDraft: "Saved draft",
      draftEmpty: "Draft is empty. Click Save draft first.",
      published: "Published",
      onlyAdminApplyAll: "Only admin can apply to all.",
      publishFirst: "Click Publish first (published template not found).",
      appliedAll: "Applied to all athletes for current week."
    },
    de: {
      docTitle: "Trainer Wochenplaner | ProAthleteCare",
      pageTitle: "Trainer Wochenplaner: Mikrozyklus-Planung",
      pageSubtitle: "Dein Wochenplan, Belastungszyklen und Aufgaben-Templates.",
      weeks: "WOCHEN",
      weekMiniLabel: "Sonntag",
      btnStandard: "STANDARD",
      btnCustom: "CUSTOM",
      btnSaveDraft: "Entwurf speichern",
      btnPublish: "Veröffentlichen",
      btnApplyAll: "Für ALLE anwenden",
      thDay: "Tag",
      dayMon: "Mo",
      dayTue: "Di",
      dayWed: "Mi",
      dayThu: "Do",
      dayFri: "Fr",
      daySat: "Sa",
      daySun: "So",
      mdStatus: "MD Status",
      activity: "Aktivität",
      optTrain: "Training",
      optMatch: "Spiel",
      optRest: "Ruhe",
      templatesTitle: "📝 Übungsvorlagen",
      templatesNote: "❗ Kategorie und Anzahl der Übungen pro MD-Status festlegen.",
      saveMain: "Wochenplan und Vorlagen speichern",
      modalTitle: "Übung auswählen",
      filterTitle: "Filter nach Belastungsqualität:",
      addSelected: "Ausgewählte hinzufügen",
      accessDenied: "Zugriff verweigert.",
      accessDenied: "Zugriff verweigert.",
      weekEditor: "Wocheneditor",
      mode: "Modus",
      week: "Woche",
      draftLoaded: "Entwurf geladen",
      savedDraft: "Entwurf gespeichert",
      draftEmpty: "Entwurf ist leer. Zuerst Save draft klicken.",
      published: "Veröffentlicht",
      onlyAdminApplyAll: "Nur Admin kann auf alle anwenden.",
      publishFirst: "Zuerst Publish klicken (Template nicht gefunden).",
      appliedAll: "Für alle Athleten der aktuellen Woche angewendet."
    },
    es: {
      docTitle: "Planificador semanal del coach | ProAthleteCare",
      pageTitle: "Planificador semanal del coach: Microciclo",
      pageSubtitle: "Tu plan semanal, ciclos de carga y plantillas de tareas.",
      weeks: "SEMANAS",
      weekMiniLabel: "Domingo",
      btnStandard: "ESTÁNDAR",
      btnCustom: "CUSTOM",
      btnSaveDraft: "Guardar borrador",
      btnPublish: "Publicar",
      btnApplyAll: "Aplicar a TODOS",
      thDay: "Día",
      dayMon: "Lun",
      dayTue: "Mar",
      dayWed: "Mié",
      dayThu: "Jue",
      dayFri: "Vie",
      daySat: "Sáb",
      daySun: "Dom",
      mdStatus: "MD Status",
      activity: "Actividad",
      optTrain: "Entrenamiento",
      optMatch: "Partido",
      optRest: "Descanso",
      templatesTitle: "📝 Configuración de plantillas de ejercicios",
      templatesNote: "❗ Define categoría y cantidad de ejercicios por estado MD.",
      saveMain: "Guardar plan semanal y plantillas",
      modalTitle: "Selección de ejercicio",
      filterTitle: "Filtro por calidad de carga:",
      addSelected: "Añadir seleccionados",
      accessDenied: "Acceso denegado.",
      accessDenied: "Acceso denegado.",
      weekEditor: "Editor semanal",
      mode: "Modo",
      week: "Semana",
      draftLoaded: "Borrador cargado",
      savedDraft: "Borrador guardado",
      draftEmpty: "El borrador está vacío. Primero pulsa Save draft.",
      published: "Publicado",
      onlyAdminApplyAll: "Solo admin puede aplicar para todos.",
      publishFirst: "Primero pulsa Publish (plantilla no encontrada).",
      appliedAll: "Aplicado a todos los atletas para la semana actual."
    },
    ru: {
      docTitle: "Недельный планер тренера | ProAthleteCare",
      pageTitle: "Недельный планер тренера: Планирование микроцикла",
      pageSubtitle: "Ваш недельный план, циклы нагрузки и шаблоны задач.",
      weeks: "НЕДЕЛИ",
      weekMiniLabel: "Воскресенье",
      btnStandard: "СТАНДАРТ",
      btnCustom: "КАСТОМ",
      btnSaveDraft: "Сохранить черновик",
      btnPublish: "Опубликовать",
      btnApplyAll: "Применить для ВСЕХ",
      thDay: "День",
      dayMon: "Пн",
      dayTue: "Вт",
      dayWed: "Ср",
      dayThu: "Чт",
      dayFri: "Пт",
      daySat: "Сб",
      daySun: "Вс",
      mdStatus: "MD Status",
      activity: "Активность",
      optTrain: "Тренировка",
      optMatch: "Матч",
      optRest: "Отдых",
      templatesTitle: "📝 Настройки шаблонов упражнений",
      templatesNote: "❗ Укажите категорию и количество упражнений для статуса MD.",
      saveMain: "Сохранить недельный план и шаблоны",
      modalTitle: "Выбор упражнения",
      filterTitle: "Фильтр по качеству нагрузки:",
      addSelected: "Добавить выбранные",
      accessDenied: "Доступ запрещён.",
      accessDenied: "Доступ запрещён.",
      weekEditor: "Редактор недели",
      mode: "Режим",
      week: "Неделя",
      draftLoaded: "Черновик загружен",
      savedDraft: "Черновик сохранён",
      draftEmpty: "Черновик пуст. Сначала нажмите Save draft.",
      published: "Опубликовано",
      onlyAdminApplyAll: "Только админ может применить для всех.",
      publishFirst: "Сначала нажмите Publish (шаблон не найден).",
      appliedAll: "Применено ко всем атлетам на текущую неделю."
    },
    pt: {
      docTitle: "Planejador semanal do coach | ProAthleteCare",
      pageTitle: "Planejador semanal do coach: Microciclo",
      pageSubtitle: "Seu plano semanal, ciclos de carga e modelos de tarefas.",
      weeks: "SEMANAS",
      weekMiniLabel: "Domingo",
      btnStandard: "PADRÃO",
      btnCustom: "CUSTOM",
      btnSaveDraft: "Salvar rascunho",
      btnPublish: "Publicar",
      btnApplyAll: "Aplicar para TODOS",
      thDay: "Dia",
      dayMon: "Seg",
      dayTue: "Ter",
      dayWed: "Qua",
      dayThu: "Qui",
      dayFri: "Sex",
      daySat: "Sáb",
      daySun: "Dom",
      mdStatus: "MD Status",
      activity: "Atividade",
      optTrain: "Treino",
      optMatch: "Jogo",
      optRest: "Descanso",
      templatesTitle: "📝 Configuração de modelos de exercícios",
      templatesNote: "❗ Defina categoria e quantidade de exercícios por status MD.",
      saveMain: "Salvar plano semanal e modelos",
      modalTitle: "Seleção de exercício",
      filterTitle: "Filtro por qualidade de carga:",
      addSelected: "Adicionar selecionados",
      accessDenied: "Acesso negado.",
      accessDenied: "Acesso negado.",
      weekEditor: "Editor semanal",
      mode: "Modo",
      week: "Semana",
      draftLoaded: "Rascunho carregado",
      savedDraft: "Rascunho salvo",
      draftEmpty: "Rascunho vazio. Clique Save draft primeiro.",
      published: "Publicado",
      onlyAdminApplyAll: "Somente admin pode aplicar para todos.",
      publishFirst: "Clique em Publish primeiro (template não encontrado).",
      appliedAll: "Aplicado para todos os atletas na semana atual."
    }
  };
  return (M[lang] && M[lang][key]) || M.en[key] || key;
}

function _exerciseCanonicalKey(raw) {
  const s = String(raw || "").trim();
  const m = s.match(/\(([^)]+)\)\s*$/);
  if (!m || !m[1]) return s;
  const left = s.replace(/\s*\([^)]+\)\s*$/, "").trim();
  const right = m[1].trim();
  const hasCyr = (v) => /[\u0400-\u04FF]/.test(String(v || ""));
  // Use bracket value only for real bilingual names (different scripts).
  if (left && right && hasCyr(left) !== hasCyr(right)) return right;
  return s;
}

function setModeButtonsVisual() {
  const btnStd = document.getElementById("mode-standard");
  const btnCus = document.getElementById("mode-custom");
  if (btnStd) btnStd.style.opacity = activeMode === "standard" ? "1" : ".6";
  if (btnCus) btnCus.style.opacity = activeMode === "custom" ? "1" : ".6";
}

function updateModeInUrl() {
  const u = new URL(window.location.href);
  u.searchParams.set("mode", activeMode);
  history.replaceState({}, "", u.toString());
}

const EXERCISE_I18N = {
  de: {
    "Back Squat": "Kniebeuge mit Langhantel",
    "RDL": "Rumaenisches Kreuzheben",
    "Leg Press": "Beinpresse",
    "Box Jumps": "Boxspruenge",
    "Leg Extensions": "Beinstrecker",
    "Hamstring Curl": "Beinbeuger",
    "Bench Press": "Bankdruecken",
    "Dumbbell Row": "Kurzhantelrudern",
    "Push-ups": "Liegestuetze",
    "Overhead Press": "Schulterdruecken",
    "Pull-ups/Lat Pulldown": "Klimmzuege/Latzug",
    "Lateral Raises": "Seitheben",
    "Incline Dumbbell Press": "Schraegbank Kurzhantel-Press",
    "Elbow Plank": "Unterarmstuetz",
    "Side Plank": "Seitstuetz",
    "Russian Twist": "Russian Twist",
    "Farmer's Walk": "Farmer's Walk",
    "Glute Bridge": "Glute Bridge",
    "Dead Bug": "Dead Bug",
    "Bird-Dog": "Bird-Dog",
    "Shoulder Taps": "Shoulder Taps",
    "Hip Circles": "Hueftkreisen",
    "Cat-Cow Stretch": "Cat-Cow",
    "Hip Flexor Stretch": "Hueftbeuger-Dehnung",
    "Hamstring Stretch": "Hamstring-Dehnung",
    "Figure-Four Stretch": "Figure-Four Stretch",
    "Belly Breathing": "Bauchatmung",
    "Calves": "Waden (Foam Roll)",
    "Adductors": "Adduktoren (Foam Roll)",
    "Plantar Fascia": "Plantarfaszie (Ball)",
    "Bike Easy Flush 20-30 min": "Leichtes Bike 20-30 Min",
    "Brisk Walk 25-40 min": "Zuegiges Gehen 25-40 Min"
  },
  es: {
    "Back Squat": "Sentadilla trasera",
    "RDL": "Peso muerto rumano",
    "Leg Press": "Prensa de piernas",
    "Box Jumps": "Saltos al cajon",
    "Leg Extensions": "Extensiones de cuadriceps",
    "Hamstring Curl": "Curl femoral",
    "Bench Press": "Press de banca",
    "Dumbbell Row": "Remo con mancuerna",
    "Push-ups": "Flexiones",
    "Overhead Press": "Press militar",
    "Pull-ups/Lat Pulldown": "Dominadas/Jalon al pecho",
    "Lateral Raises": "Elevaciones laterales",
    "Incline Dumbbell Press": "Press inclinado con mancuernas",
    "Elbow Plank": "Plancha de codos",
    "Side Plank": "Plancha lateral",
    "Russian Twist": "Giro ruso",
    "Farmer's Walk": "Paseo del granjero",
    "Glute Bridge": "Puente de gluteos",
    "Dead Bug": "Dead Bug",
    "Bird-Dog": "Bird-Dog",
    "Shoulder Taps": "Toques de hombro",
    "Hip Circles": "Circulos de cadera",
    "Cat-Cow Stretch": "Estiramiento gato-vaca",
    "Hip Flexor Stretch": "Estiramiento de flexor de cadera",
    "Hamstring Stretch": "Estiramiento de isquios",
    "Figure-Four Stretch": "Estiramiento figura 4",
    "Belly Breathing": "Respiracion diafragmatica",
    "Calves": "Gemelos (foam roll)",
    "Adductors": "Aductores (foam roll)",
    "Plantar Fascia": "Fascia plantar (pelota)",
    "Bike Easy Flush 20-30 min": "Bici suave 20-30 min",
    "Brisk Walk 25-40 min": "Caminata rapida 25-40 min"
  },
  ru: {
    "Back Squat": "Back Squat",
    "RDL": "RDL",
    "Leg Press": "Leg Press",
    "Box Jumps": "Box Jumps",
    "Leg Extensions": "Leg Extensions",
    "Hamstring Curl": "Hamstring Curl",
    "Bench Press": "Bench Press",
    "Dumbbell Row": "Dumbbell Row",
    "Push-ups": "Push-ups",
    "Overhead Press": "Overhead Press",
    "Pull-ups/Lat Pulldown": "Pull-ups/Lat Pulldown",
    "Lateral Raises": "Lateral Raises",
    "Incline Dumbbell Press": "Incline Dumbbell Press",
    "Elbow Plank": "Elbow Plank",
    "Side Plank": "Side Plank",
    "Russian Twist": "Russian Twist",
    "Farmer's Walk": "Farmer's Walk",
    "Glute Bridge": "Glute Bridge",
    "Dead Bug": "Dead Bug",
    "Bird-Dog": "Bird-Dog",
    "Shoulder Taps": "Shoulder Taps",
    "Hip Circles": "Hip Circles",
    "Cat-Cow Stretch": "Cat-Cow Stretch",
    "Hip Flexor Stretch": "Hip Flexor Stretch",
    "Hamstring Stretch": "Hamstring Stretch",
    "Figure-Four Stretch": "Figure-Four Stretch",
    "Belly Breathing": "Belly Breathing",
    "Calves": "Calves (foam roll)",
    "Adductors": "Adductors (foam roll)",
    "Plantar Fascia": "Plantar Fascia (ball)",
    "Bike Easy Flush 20-30 min": "Bike Easy Flush 20-30 min",
    "Brisk Walk 25-40 min": "Brisk Walk 25-40 min"
  },
  pt: {
    "Back Squat": "Agachamento com barra",
    "RDL": "Levantamento romeno",
    "Leg Press": "Leg Press",
    "Box Jumps": "Saltos na caixa",
    "Leg Extensions": "Extensao de joelho",
    "Hamstring Curl": "Flexora",
    "Bench Press": "Supino reto",
    "Dumbbell Row": "Remada com halter",
    "Push-ups": "Flexoes",
    "Overhead Press": "Desenvolvimento",
    "Pull-ups/Lat Pulldown": "Barra fixa/Puxada alta",
    "Lateral Raises": "Elevacao lateral",
    "Incline Dumbbell Press": "Supino inclinado com halteres",
    "Elbow Plank": "Prancha no cotovelo",
    "Side Plank": "Prancha lateral",
    "Russian Twist": "Russian Twist",
    "Farmer's Walk": "Farmer's Walk",
    "Glute Bridge": "Ponte de gluteo",
    "Dead Bug": "Dead Bug",
    "Bird-Dog": "Bird-Dog",
    "Shoulder Taps": "Toques no ombro",
    "Hip Circles": "Circulos de quadril",
    "Cat-Cow Stretch": "Cat-Cow",
    "Hip Flexor Stretch": "Alongamento do flexor do quadril",
    "Hamstring Stretch": "Alongamento de isquiotibiais",
    "Figure-Four Stretch": "Alongamento Figure-Four",
    "Belly Breathing": "Respiracao diafragmatica",
    "Calves": "Panturrilhas (liberacao miofascial)",
    "Adductors": "Adutores (liberacao miofascial)",
    "Plantar Fascia": "Fascia plantar (bola)",
    "Bike Easy Flush 20-30 min": "Bike leve 20-30 min",
    "Brisk Walk 25-40 min": "Caminhada rapida 25-40 min"
  }
};

function localizeExerciseName(raw) {
  const lang = _weekLang();
  const src = String(raw || "");
  if (lang === "uk") return src;
  const key = _exerciseCanonicalKey(src);
  const mapped = EXERCISE_I18N[lang]?.[key];
  if (mapped) return mapped;
  if (lang === "en") return key;
  return key;
}

function applyWeekEditorI18n() {
  document.documentElement.lang = _weekLang();
  document.title = _weekUi("docTitle");
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set("cwe-title", _weekUi("pageTitle"));
  set("cwe-subtitle", _weekUi("pageSubtitle"));
  set("cwe-weeks-label", _weekUi("weeks"));
  set("btn-save-draft", _weekUi("btnSaveDraft"));
  set("btn-publish", _weekUi("btnPublish"));
  set("btn-apply-all", _weekUi("btnApplyAll"));
  set("mode-standard", _weekUi("btnStandard"));
  set("mode-custom", _weekUi("btnCustom"));
  set("cwe-th-day", _weekUi("thDay"));
  set("cwe-md-status-label", _weekUi("mdStatus"));
  set("cwe-activity-label", _weekUi("activity"));
  set("cwe-templates-title", _weekUi("templatesTitle"));
  set("cwe-templates-note", _weekUi("templatesNote"));
  set("cwe-save-main", _weekUi("saveMain"));
  set("modal-title-context", _weekUi("modalTitle"));
  set("cwe-filter-title", _weekUi("filterTitle"));

  const addSel = document.getElementById("add-selected-btn");
  if (addSel) {
    const m = String(addSel.textContent || "").match(/\((\d+)\)/);
    addSel.textContent = `${_weekUi("addSelected")} (${m ? m[1] : "0"})`;
  }

  const th = document.querySelectorAll(".weekly-table thead th");
  if (th.length >= 8) {
    th[1].textContent = _weekUi("dayMon");
    th[2].textContent = _weekUi("dayTue");
    th[3].textContent = _weekUi("dayWed");
    th[4].textContent = _weekUi("dayThu");
    th[5].textContent = _weekUi("dayFri");
    th[6].textContent = _weekUi("daySat");
    th[7].textContent = _weekUi("daySun");
  }

  document.querySelectorAll(".activity-type-select").forEach((sel) => {
    const oTrain = sel.querySelector('option[value="TRAIN"]');
    const oMatch = sel.querySelector('option[value="MATCH"]');
    const oRest = sel.querySelector('option[value="REST"]');
    if (oTrain) oTrain.textContent = _weekUi("optTrain");
    if (oMatch) oMatch.textContent = _weekUi("optMatch");
    if (oRest) oRest.textContent = _weekUi("optRest");
  });
}

function updateCycleColors() {
    const activitySelects = document.querySelectorAll('.activity-type-select');
    const dayCells = document.querySelectorAll('#md-colors-row .cycle-day');
    const dayNamesShort = _weekT('dayShort');
    
    let activityTypes = Array.from(activitySelects).map(s => s.value);
    let dayStatuses = new Array(7).fill('TRAIN');
    const matchIndices = activityTypes.map((t, idx) => t === 'MATCH' ? idx : -1).filter(i => i !== -1);
    const selectedSport = String(document.getElementById('set-sport')?.value || '').trim().toLowerCase();
    const sportProfile =
      (["basketball", "volleyball", "handball", "tennis"].includes(selectedSport)) ? "COURT_MD" :
      (["athletics", "other"].includes(selectedSport)) ? "INDIVIDUAL_ENDURANCE" :
      "TEAM_MD";
    const matchWindow = (sportProfile === "COURT_MD")
      ? { preMax: 4, postMax: 2 }
      : (sportProfile === "INDIVIDUAL_ENDURANCE")
        ? { preMax: 2, postMax: 1 }
        : { preMax: 4, postMax: 2 };
    const statusByDiff = (diff) => {
      if (!Number.isFinite(diff) || diff === 0) return null;
      if (diff < 0 && diff >= -matchWindow.preMax) return `MD${diff}`;
      if (diff > 0 && diff <= matchWindow.postMax) return `MD+${diff}`;
      return null;
    };

    for (let i = 0; i < 7; i++) {
        if (activityTypes[i] === 'MATCH') { dayStatuses[i] = 'MD'; continue; }
        let minDiff = Infinity;
        let bestStatus = 'TRAIN';
        matchIndices.forEach(mIdx => {
            for (let offset of [-7, 0, 7]) {
                let diff = i - (mIdx + offset);
                const candidate = statusByDiff(diff);
                if (candidate) {
                    if (Math.abs(diff) < Math.abs(minDiff)) {
                        minDiff = diff;
                        bestStatus = candidate;
                    }
                }
            }
        });
        dayStatuses[i] = bestStatus;
    }

    dayStatuses.forEach((status, idx) => {
        const isRest = activityTypes[idx] === 'REST';
        const finalStatus = isRest ? 'REST' : status;
        const style = COLOR_MAP[finalStatus] || COLOR_MAP['TRAIN'];
        
        const mdEl = dayCells[idx]?.querySelector('.md-status');
        if (mdEl) {
            mdEl.textContent = finalStatus;
            Object.values(COLOR_MAP).forEach(m => mdEl.classList.remove(m.colorClass));
            mdEl.classList.add(style.colorClass);
        }
        
        const titleEl = document.getElementById(`md-title-${idx}`);
        if (titleEl) {
            titleEl.innerHTML = `<span class="md-status-label ${style.colorClass}">${finalStatus}</span> (${dayNamesShort[idx]})`;
        }
        renderExercisesByStatus(idx, finalStatus);
    });
}

function renderExercisesByStatus(dayIndex, status) {
  
  const container = document.querySelector(`.task-day-container[data-day-index="${dayIndex}"]`);
  if (!container) return;

  const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');

  // ✅ підтримка двох форматів:
  // 1) { exercises: [] }
  // 2) [ { exercises: [] }, { exercises: [] } ]
  const rawPlan = data[`status_plan_${status}`];

  const planObj = Array.isArray(rawPlan)
    ? (rawPlan[0] || { exercises: [] })   // беремо 1-й варіант як базовий
    : (rawPlan || { exercises: [] });

  const exercises = Array.isArray(planObj.exercises) ? planObj.exercises : [];

  if (status === 'REST') {
    container.innerHTML = `<div style="text-align:center; padding:20px; color:#777;">${_weekT('rest')}</div>`;
    return;
  }

  let html = '<div class="generated-exercises-list">';
  const stages = [
    { key: 'Pre-Training', label: _weekT('stagePre') },
    { key: 'Main Training', label: _weekT('stageMain') },
    { key: 'Post-Training', label: _weekT('stagePost') }
  ];
  stages.forEach(({ key: stage, label }) => {
    const stageExs = exercises.filter(ex => ex.stage === stage);

    html += `<div class="stage-label" style="font-size:0.7rem; color:#d4af37; margin-top:10px;">${escapeHtml(label)}</div>`;

    stageExs.forEach(ex => {
      html += `
        <div class="exercise-item" style="display:flex; justify-content:space-between; background:#111; margin:2px 0; padding:5px;">
          <span style="font-size:0.8rem;">${escapeHtml(localizeExerciseName(ex.name))}</span>
          <button
            type="button"
            class="remove-ex-btn"
            data-status="${status}"
            data-name="${encodeURIComponent(ex.name)}"
            style="color:red; background:none; border:none; cursor:pointer;"
          >x</button>
        </div>`;
    });

    html += `
      <button
        type="button"
        class="add-manual-btn"
        data-status="${status}"
        data-stage="${stage}"
        style="width:100%; border:1px dashed #444; background:none; color:#aaa; margin-top:5px; cursor:pointer;"
      >+ ${_weekT('add')}</button>`;
  });

  html += '</div>';
  container.innerHTML = html;

  container.querySelectorAll('.remove-ex-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const st = btn.dataset.status;
      const name = decodeURIComponent(btn.dataset.name || "");
      removeExerciseFromStatus(st, name);
    });
  });

  container.querySelectorAll('.add-manual-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const st = btn.dataset.status;
      const stage = btn.dataset.stage;
      openExerciseModal(st, stage);
    });
  });
}



/**
 * 5. ВИБІР ВПРАВ З EXERCISE_LIBRARY
 */
function coachModalZoneLabel(zoneKey) {
    const raw = String(zoneKey || "").replace(/_/g, " ").trim();
    if (!raw) return "";
    return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function coachFormatExerciseZonesCompact(ex) {
    const primary = Array.isArray(ex?.primaryZones) ? ex.primaryZones.filter(Boolean) : [];
    const secondary = Array.isArray(ex?.secondaryZones) ? ex.secondaryZones.filter(Boolean) : [];
    if (!primary.length && !secondary.length) return "";
    const parts = [];
    if (primary.length) parts.push(`P: ${primary.map(coachModalZoneLabel).join(", ")}`);
    if (secondary.length) parts.push(`S: ${secondary.map(coachModalZoneLabel).join(", ")}`);
    return parts.join(" • ");
}

window.openExerciseModal = function (status, stage) {
    window.currentAddStatus = status;
    window.currentAddStage = stage;

    const modal = document.getElementById('exercise-selection-modal');
    const list = document.getElementById('exercise-list-container');
    if (!modal || !list) return;

    list.innerHTML = '';
    const stageData = EXERCISE_LIBRARY[stage];

    if (stageData) {
        for (const categoryName in stageData) {
            const category = stageData[categoryName];

            const catHeader = document.createElement('div');
            catHeader.className = "modal-category-header";
            catHeader.textContent = categoryName;
            list.appendChild(catHeader);

            const exercises = Array.isArray(category?.exercises) ? category.exercises : [];
            if (!exercises.length && categoryName === "Football Tactical Drills") {
                const empty = document.createElement('div');
                empty.className = "modal-exercise-item";
                empty.innerHTML = `<div class="modal-exercise-meta"><span class="modal-exercise-name">No tactical drills imported yet</span><span class="modal-exercise-zones">Import the exported Drill Canvas JSON, then select it here.</span></div><button type="button" class="gold-button modal-exercise-add-btn" data-pac-import-drill-json>Import JSON</button>`;
                list.appendChild(empty);
            }

            exercises.forEach(ex => {
                const item = document.createElement('div');
                item.className = "modal-exercise-item";

                const meta = document.createElement('div');
                meta.className = "modal-exercise-meta";

                const nameSpan = document.createElement('span');
                nameSpan.className = "modal-exercise-name";
                nameSpan.textContent = localizeExerciseName(ex.name);
                meta.appendChild(nameSpan);

                const zonesTxt = coachFormatExerciseZonesCompact(ex);
                if (zonesTxt) {
                    const zonesSpan = document.createElement('span');
                    zonesSpan.className = "modal-exercise-zones";
                    zonesSpan.textContent = zonesTxt;
                    meta.appendChild(zonesSpan);
                }

                const btn = document.createElement('button');
                btn.type = "button";
                btn.className = "gold-button modal-exercise-add-btn";
                btn.textContent = _weekT('select');
                btn.title = _weekT('select');

                // ✅ БЕЗ inline onclick → апострофи НЕ ламають код
                btn.addEventListener('click', () => {
                    addExerciseToStatus(btn, ex.name, stage, categoryName);
                });

                item.appendChild(meta);
                item.appendChild(btn);
                list.appendChild(item);
            });
        }
    }

    modal.style.display = 'flex';
};

window.addEventListener("pac:drill-library-updated", () => {
    const modal = document.getElementById('exercise-selection-modal');
    if (modal?.style?.display === 'flex' && window.currentAddStatus && window.currentAddStage) {
        window.openExerciseModal(window.currentAddStatus, window.currentAddStage);
    }
});


window.addExerciseToStatus = function(btn, name, stage, category) {
  if (!window.canEditWeek) {
    alert(_weekT('coachOnlyPlan'));
    return;
  }

  const status = window.currentAddStatus;
  const exTemplate = EXERCISE_LIBRARY[stage][category].exercises.find(e => e.name === name);

  if (exTemplate) {
    let data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
const key = `status_plan_${status}`;

if (!data[key]) {
  data[key] = { exercises: [] };
}

// якщо формат масив — пишемо в [0]
if (Array.isArray(data[key])) {
  if (!data[key][0]) data[key][0] = { exercises: [] };
  if (!Array.isArray(data[key][0].exercises)) data[key][0].exercises = [];
  data[key][0].exercises.push({ ...exTemplate, planItemId: window.PACExerciseTask.newItemId(), stage, category });
} else {
  if (!Array.isArray(data[key].exercises)) data[key].exercises = [];
  data[key].exercises.push({ ...exTemplate, planItemId: window.PACExerciseTask.newItemId(), stage, category });
}

localStorage.setItem(STORAGE_KEY, JSON.stringify(window.PACExerciseTask.ensurePlan(data)));


    updateCycleColors();

    // ✅ тільки збереження програми тренера
    syncPlanDataToFirebase();

    btn.textContent = 'OK';
    btn.disabled = true;
  }
};



window.removeExerciseFromStatus = function(status, name) {
  // ✅ Захист: тільки тренер
  if (!window.canEditWeek) {
    alert(_weekT('coachOnlyEdit'));
    return;
  }

  let data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
const key = `status_plan_${status}`;

if (!data[key]) return;

if (Array.isArray(data[key])) {
  if (!data[key][0]) return;
  data[key][0].exercises = (data[key][0].exercises || []).filter(e => e.name !== name);
} else {
  data[key].exercises = (data[key].exercises || []).filter(e => e.name !== name);
}

localStorage.setItem(STORAGE_KEY, JSON.stringify(window.PACExerciseTask.ensurePlan(data)));

    updateCycleColors();

    // ✅ зберігаємо тренерську програму
    syncPlanDataToFirebase();
  }




function closeExerciseModal() {
    const modal = document.getElementById('exercise-selection-modal');
    if (modal) modal.style.display = 'none';
}

/**
 * 6. СЛУХАЧІ ТА СТАРТ
 */
document.addEventListener('DOMContentLoaded', () => {
  applyWeekEditorI18n();
  const closeX = document.querySelector('.close-modal-btn');
  if (closeX) closeX.onclick = closeExerciseModal;

  document.querySelectorAll('.activity-type-select').forEach(sel => {
    sel.addEventListener('change', () => {
      updateCycleColors();
      syncMicrocycleToFirebase();
    });
  });

  initMiniWeekHistory(); // ✅ один раз
});









window.addEventListener("pac:lang-changed", () => {
  applyWeekEditorI18n();
  updateCycleColors();
  initMiniWeekHistory();
});

function initMiniWeekHistory() {
  const list = document.getElementById("week-mini-list");
  const label = document.getElementById("week-mini-label");
  const btnPrev = document.getElementById("week-mini-prev");
  const btnNext = document.getElementById("week-mini-next");
  if (!list) return;

  const localISO = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + day;
  };

  const selectedMon = mondayOf(currentWeekId) || mondayOf(localISO(new Date()));
  const selectedSunISO = sundayOfMonday(selectedMon);
  const todayMon = mondayOf(localISO(new Date()));

  const u = new URL(window.location.href);
  const qsStart = u.searchParams.get("miniStartMonth");
  const lsStart = localStorage.getItem("cweMiniStartMonth");
  const baseStartStr = qsStart || lsStart || (localISO(new Date()).slice(0, 7) + "-01");
  const baseStartDate = _parseIsoLocal(baseStartStr) || new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const startMonth = new Date(baseStartDate.getFullYear(), baseStartDate.getMonth(), 1);

  const localeMap = { uk: 'uk-UA', en: 'en-US', de: 'de-DE', es: 'es-ES', ru: 'ru-RU', pt: 'pt-PT' };
  const lang = _weekLang();
  const locale = localeMap[lang] || 'en-US';
  const dayNamesMap = {
    uk: ['\u041f\u043d','\u0412\u0442','\u0421\u0440','\u0427\u0442','\u041f\u0442','\u0421\u0431','\u041d\u0434'],
    en: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
    de: ['Mo','Di','Mi','Do','Fr','Sa','So'],
    es: ['Lun','Mar','Mi\u00e9','Jue','Vie','S\u00e1b','Dom'],
    ru: ['\u041f\u043d','\u0412\u0442','\u0421\u0440','\u0427\u0442','\u041f\u0442','\u0421\u0431','\u0412\u0441'],
    pt: ['Seg','Ter','Qua','Qui','Sex','S\u00e1b','Dom']
  };
  const dayNames = dayNamesMap[lang] || dayNamesMap.en;
  const monthFmt = new Intl.DateTimeFormat(locale, { month: 'short', year: 'numeric' });

  const isMobileMini = window.innerWidth <= 760;
  const monthCount = isMobileMini ? 1 : 3;
  const months = Array.from({ length: monthCount }, (_, idx) =>
    new Date(startMonth.getFullYear(), startMonth.getMonth() + idx, 1)
  );

  if (btnPrev && !btnPrev.dataset.bound) {
    btnPrev.dataset.bound = "1";
    btnPrev.addEventListener("click", () => {
      const sm = _parseIsoLocal(localStorage.getItem("cweMiniStartMonth") || baseStartStr) || startMonth;
      const next = new Date(sm.getFullYear(), sm.getMonth() - 1, 1);
      const nextISO = _iso(next);
      localStorage.setItem("cweMiniStartMonth", nextISO);
      const url = new URL(window.location.href);
      url.searchParams.set("miniStartMonth", nextISO);
      history.replaceState({}, "", url.toString());
      initMiniWeekHistory();
    });
  }
  if (btnNext && !btnNext.dataset.bound) {
    btnNext.dataset.bound = "1";
    btnNext.addEventListener("click", () => {
      const sm = _parseIsoLocal(localStorage.getItem("cweMiniStartMonth") || baseStartStr) || startMonth;
      const next = new Date(sm.getFullYear(), sm.getMonth() + 1, 1);
      const nextISO = _iso(next);
      localStorage.setItem("cweMiniStartMonth", nextISO);
      const url = new URL(window.location.href);
      url.searchParams.set("miniStartMonth", nextISO);
      history.replaceState({}, "", url.toString());
      initMiniWeekHistory();
    });
  }

  list.innerHTML = '';
  list.style.display = 'grid';
  list.style.gridTemplateColumns = isMobileMini ? '1fr' : 'repeat(3, minmax(0, 1fr))';
  list.style.gap = '10px';
  list.style.overflowX = 'hidden';
  list.style.overflowY = 'visible';
  list.style.whiteSpace = 'normal';
  list.style.width = '100%';

  let activeBtn = null;

  months.forEach((mDate) => {
    const y = mDate.getFullYear();
    const mo = mDate.getMonth();
    const mStart = new Date(y, mo, 1);
    const mEnd = new Date(y, mo + 1, 0);

    const firstMon = new Date(mStart);
    while (firstMon.getDay() !== 1) firstMon.setDate(firstMon.getDate() - 1);
    const lastSun = new Date(mEnd);
    while (lastSun.getDay() !== 0) lastSun.setDate(lastSun.getDate() + 1);

    const card = document.createElement('div');
    card.style.cssText = 'border:1px solid #2a2a2a;border-radius:12px;background:linear-gradient(180deg,#131417,#0e0f12);padding:8px;box-shadow:inset 0 1px 0 rgba(255,255,255,.04);';

    const title = document.createElement('div');
    title.textContent = monthFmt.format(mDate).toUpperCase();
    title.style.cssText = 'color:#f4c62d;font-weight:900;font-size:0.92rem;letter-spacing:0.3px;margin-bottom:6px;';
    card.appendChild(title);

    const head = document.createElement('div');
    head.style.cssText = 'display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-bottom:4px;padding:2px 0;border-bottom:1px solid #23262b;';
    dayNames.forEach((dn) => {
      const h = document.createElement('div');
      h.textContent = dn;
      h.style.cssText = 'color:#8f8f8f;font-size:0.68rem;font-weight:800;text-align:center;';
      head.appendChild(h);
    });
    card.appendChild(head);

    for (let d = new Date(firstMon); d <= lastSun; d.setDate(d.getDate() + 7)) {
      const mon = new Date(d);
      const sun = new Date(d);
      sun.setDate(sun.getDate() + 6);
      if (sun.getMonth() !== mo) continue;

      const monISO = _iso(mon);
      const isSelected = monISO === selectedMon;
      const isCurrent = monISO === todayMon;
      const isFuture = new Date(monISO + 'T00:00:00') > new Date(todayMon + 'T00:00:00');

      const borderColor = isCurrent ? '#35b86a' : (isFuture ? '#f0c438' : '#6e4b24');
      const rowBg = isCurrent
        ? 'linear-gradient(180deg, rgba(37,130,68,.42), rgba(18,74,39,.26))'
        : (isFuture
          ? 'linear-gradient(180deg, rgba(194,141,24,.35), rgba(130,92,12,.20))'
          : 'linear-gradient(180deg, rgba(98,66,30,.32), rgba(58,39,19,.20))');
      const dayTextColor = isCurrent ? '#dbffe7' : (isFuture ? '#fff1c7' : '#e2cda8');

      const row = document.createElement('button');
      row.type = 'button';
      row.style.cssText =
        'width:100%;display:grid;grid-template-columns:repeat(7,1fr);gap:4px;align-items:center;' +
        'border:1px solid ' + borderColor + ';' +
        'background:' + rowBg + ';' +
        'border-radius:7px;padding:4px 4px;margin-bottom:4px;cursor:pointer;';

      for (let j = 0; j < 7; j++) {
        const day = new Date(mon);
        day.setDate(mon.getDate() + j);
        const inMonth = day.getMonth() === mo;
        const isSunday = j === 6;
        const cell = document.createElement('div');
        cell.textContent = String(day.getDate()).padStart(2, '0');
        cell.style.cssText =
          'text-align:center;font-size:0.78rem;font-weight:700;color:' +
          (inMonth ? dayTextColor : '#6a6a6a') + ';' +
          (isSunday && isCurrent ? 'text-shadow:0 0 6px rgba(72,220,127,.7);' : '');
        row.appendChild(cell);
      }

      row.addEventListener('click', () => {
        localStorage.setItem("cweMiniStartMonth", _iso(startMonth));
        const base = 'coach-week-editor.html?weekId=' + monISO + '&miniStartMonth=' + _iso(startMonth);
        window.location.href = base + coachContextQuery("&");
      });
      if (isSelected) {
        activeBtn = row;
        row.style.boxShadow = '0 0 0 1px rgba(255,255,255,.22) inset';
      }
      card.appendChild(row);
    }

    list.appendChild(card);
  });

  if (label) label.textContent = _weekUi('weekMiniLabel') + ': ' + selectedSunISO;

  setTimeout(() => {
    if (activeBtn) activeBtn.scrollIntoView({ behavior:'smooth', inline:'nearest', block:'nearest' });
  }, 50);
}




