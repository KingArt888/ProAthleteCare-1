(function () {
  const db = firebase.firestore();
  const COL_WEIGHT = "weight_history";
  // Nutrition menus are owner reports, not coach training prescriptions.
  const COL_PLAN = "athlete_nutrition_daily";
  async function clearNutritionMenu(){if(currentUserId)await db.collection(COL_PLAN).doc(currentUserId+'_menu').set({userId:currentUserId,type:'nutrition_menu',nutritionMenu:null},{merge:true});}

  window.currentAnalysis = null;
  window.latestHistoryArray = [];

  let currentDailyPlan = { brf: [], lnc: [], din: [] };
  let activeTab = "brf";
  let selectedSpeed = "Easy";
  let speedExplicitlyChosen = false;
  let weightChart = null;
  let currentUserId = null;
  let isDelegatedReadOnly = false;
  let savePlanTimer = null;
  let weeklyPlan = {};
  let activeDayId = null;
  let weeklyStatuses = {};
  let selectedGoalMode = "auto";
  let currentSportType = "";
  let currentSportProfile = "TEAM_MD";
  let latestPlanDateId = "";
  let savingWeight = false;
  let nutritionPreferences = {diet:'any',exclude:[]};

  function canWriteWeightData({ notify = true } = {}) {
    if (!isDelegatedReadOnly) return true;
    if (notify) alert(t("readOnlyDelegated"));
    return false;
  }

  function applyDelegatedReadOnlyUi() {
    const isLocked = Boolean(isDelegatedReadOnly);
    const selectors = [
      "#weight-form input",
      "#weight-form button",
      "#get-diet-plan-btn",
      "#weight-goal-mode",
      ".speed-selector .speed-btn",
      "#diet-tab-content button",
      "#diet-week-days button",
      "#stats-inputs input",
      "#stats-inputs button"
    ];
    selectors.forEach((sel) => {
      document.querySelectorAll(sel).forEach((el) => {
        if ("disabled" in el) el.disabled = isLocked;
        el.style.opacity = isLocked ? "0.6" : "";
        el.style.cursor = isLocked ? "not-allowed" : "";
      });
    });
  }

  function normalizeSportType(raw) {
    const s = String(raw || "").trim().toLowerCase();
    if (!s) return "";
    if (s === "soccer") return "football";
    return s;
  }

  function sportProfileFromType(raw) {
    const sport = normalizeSportType(raw);
    if (["football", "futsal", "rugby", "hockey"].includes(sport)) return "TEAM_MD";
    if (["basketball", "volleyball", "handball", "tennis"].includes(sport)) return "COURT_MD";
    if (["athletics", "other"].includes(sport)) return "INDIVIDUAL_ENDURANCE";
    return "TEAM_MD";
  }

  function setSportContext(rawSport) {
    currentSportType = normalizeSportType(rawSport);
    currentSportProfile = sportProfileFromType(currentSportType);
  }
  function getMatchWindowBySportProfile(profile = currentSportProfile) {
    const p = String(profile || "TEAM_MD").toUpperCase();
    if (p === "COURT_MD") return { preMax: 4, postMax: 2 };
    if (p === "INDIVIDUAL_ENDURANCE") return { preMax: 2, postMax: 1 };
    return { preMax: 4, postMax: 2 };
  }
  function statusByMatchDiff(diff, profile = currentSportProfile) {
    if (!Number.isFinite(diff) || diff === 0) return null;
    const w = getMatchWindowBySportProfile(profile);
    if (diff < 0 && diff >= -w.preMax) return `MD${diff}`;
    if (diff > 0 && diff <= w.postMax) return `MD+${diff}`;
    return null;
  }

  function resolveTargetUid(selfUid) {
    const fromWindow = String(window.currentUserId || "").trim();
    if (fromWindow) return fromWindow;

    try {
      const qs = new URLSearchParams(window.location.search);
      const viewUserId = String(qs.get("userId") || "").trim();
      const delegated =
        qs.get("fromCoach") === "1" ||
        qs.get("fromAdmin") === "1" ||
        qs.get("asAdmin") === "1";
      if (delegated && viewUserId) return viewUserId;
    } catch {}

    return String(selfUid || "").trim();
  }

  const scanKeyForUid = (uid) => `weight_last_scan_date_${String(uid || "guest").trim()}`;
  const setScanMarker = (uid, value) => {
    if (!uid) return;
    localStorage.setItem(scanKeyForUid(uid), String(value || ""));
  };
  const clearScanMarker = (uid) => {
    if (uid) localStorage.removeItem(scanKeyForUid(uid));
    localStorage.removeItem("weight_last_scan_date"); // legacy compatibility
  };

  function resetWeightState() {
    nutritionPreferences = {diet:'any',exclude:[]};
    window.currentAnalysis = null;
    window.latestHistoryArray = [];
    currentDailyPlan = { brf: [], lnc: [], din: [] };
    weeklyPlan = {};
    activeDayId = null;
    weeklyStatuses = {};
    selectedGoalMode = "auto";
    latestPlanDateId = "";
    activeTab = "brf";
    selectedSpeed = "Easy";
    speedExplicitlyChosen = false;
    setSportContext("");
    if (savePlanTimer) {
      clearTimeout(savePlanTimer);
      savePlanTimer = null;
    }
  }

  const I18N = {
    uk: {
      title: "Weight Control | ProAthleteCare",
      tagline: "Професійний супровід атлета онлайн",
      loading: "Завантаження...",
      pageTitle: "Weight Control: Аналітика складу тіла",
      bodyTitle: "Параметри тіла",
      age: "ВІК", height: "ЗРІСТ", birth: "Дата народження", birthPh: "ДД/ММ/РРРР",
      hcm: "Зріст (см)", cweight: "Поточна вага (кг)", saveAnalyze: "Зберегти та проаналізувати",
      scanTitle: "Composition Scan", nutritionTitle: "Скільки часу у вас є на приготування?",
      nutritionSelectedPrefix: "Ви обрали",
      nutritionWeeklyPlan: "Тижневий план харчування",
      speedEasy: "Швидко", speedMid: "Збалансовано", speedHard: "Детально",
      recoPh: "Введіть дані, щоб отримати рекомендацію...", genPlan: "Згенерувати меню на тиждень",
      brf: "Сніданок", lnc: "Обід", din: "Вечеря",
      chart: "Графік прогресу", history: "Історія вимірів (натисніть для перегляду)",
      histLoad: "Завантаження історії...", histEmpty: "Записів ще немає",
      noScan: "Очікуємо сьогоднішній скан", analytics: "PAC Analytics", kcalLeft: "Калорій залишилось",
      water: "Вода", p: "Білки", f: "Жири", c: "Вуглеводи", today: "СЬОГОДНІ", last: "ОСТАННІЙ ЗАПИС",
      modeMg: "НАБІР М'ЯЗОВОЇ МАСИ", modeAf: "АТЛЕТИЧНА ФОРМА", modeWl: "КОНТРОЛЬ ВАГИ",
      fillAlert: "Будь ласка, заповніть вагу, зріст і дату народження.",
      scanFirst: "Спочатку зробіть аналіз складу тіла.",
      delRecQ: "Видалити цей запис?", delRecErr: "Не вдалося видалити запис.",
      resetQ: "Видалити поточний план і згенерувати новий?", resetBtn: "Скинути план дня",
      saved: "Збережено", left: "Залишок", up: "вгору", down: "вниз", stable: "стабільно",
      done: "Готово", del: "Видалити",
      profileErr: "Не вдалося зберегти профіль.", histErr: "Помилка завантаження історії.",
      saveHistErr: "Помилка збереження аналізу.", planLoadErr: "Помилка завантаження плану.",
      planSaveErr: "Помилка збереження плану.", birthHint: "Використайте формат ДД/ММ/РРРР", meal: "Страва",
      nutritionWeekTitle: "Огляд харчування за тиждень",
      nutritionWeekTotal: "Виконання за 7 днів",
      nutritionWeekEmpty: "Поки немає тижневих даних по харчуванню.",
      goalTitle: "Режим цілі",
      goalAuto: "Авто (зі скану)",
      goalLoss: "Схуднення",
      goalAthletic: "Атлетична форма",
      goalGain: "Набір",
      dayPlanTitle: "План дня",
      dayPlanHint: "Тижневий план формується одразу на 7 днів.",
      dayStatus: "Статус",
      shoppingTitle: "Список покупок на тиждень",
      shoppingSub: "Автоматично за меню та режимом.",
      shoppingEmpty: "Згенеруйте тижневе меню, щоб побачити список покупок.",
      shoppingFor: "Список для режиму",
      shoppingKg: "кг",
      shoppingL: "л",
      shoppingPcs: "шт",
      shoppingPortions: "порц.",
      shoppingWeekTotals: "Підсумок тижня",
      shoppingPlanned: "Заплановано",
      shoppingTarget: "Ціль",
      shoppingUnknown: "Позиції без точної кількості",
      shoppingUnknownEmpty: "Усі позиції розраховані за кількістю.",
      dayKcal: "Калорії (план/ціль)",
      statusMatch: "Матч-день",
      statusRecovery: "Відновлення",
      statusTrain: "Тренування",
      readOnlyDelegated: "Режим тільки для читання: перегляд делегованого атлета.",
      accessDeniedAthlete: "Немає доступу до цього атлета."
    },
    en: {
      title: "Weight Control | ProAthleteCare",
      tagline: "Professional athlete support online",
      loading: "Loading...",
      pageTitle: "Weight Control: Body Composition Analytics",
      bodyTitle: "Body Parameters",
      age: "AGE", height: "HEIGHT", birth: "Birthdate", birthPh: "DD/MM/YYYY",
      hcm: "Height (cm)", cweight: "Current weight (kg)", saveAnalyze: "Save and analyze",
      scanTitle: "Composition Scan", nutritionTitle: "How much time do you have for cooking?",
      nutritionSelectedPrefix: "Selected",
      nutritionWeeklyPlan: "Weekly nutrition plan",
      speedEasy: "Fast", speedMid: "Balanced", speedHard: "Detailed",
      recoPh: "Enter your data to get recommendations...", genPlan: "Generate weekly menu",
      brf: "Breakfast", lnc: "Lunch", din: "Dinner",
      chart: "Progress Chart", history: "History logs (tap to view)",
      histLoad: "Loading history...", histEmpty: "No records yet",
      noScan: "Waiting for today's scan", analytics: "PAC Analytics", kcalLeft: "Kcal remaining",
      water: "Water", p: "Protein", f: "Fat", c: "Carbs", today: "TODAY", last: "LAST RECORD",
      modeMg: "MUSCLE GAIN", modeAf: "ATHLETIC FORM", modeWl: "WEIGHT CONTROL",
      fillAlert: "Please fill in weight, height and birthdate.", scanFirst: "Run body composition analysis first.",
      delRecQ: "Delete this record?", delRecErr: "Could not delete record.",
      resetQ: "Delete current plan and generate a new one?", resetBtn: "Reset daily plan",
      saved: "Saved", left: "Left", up: "up", down: "down", stable: "stable", done: "Done", del: "Delete",
      profileErr: "Could not save profile.", histErr: "Failed to load history.", saveHistErr: "Failed to save analysis.",
      planLoadErr: "Failed to load plan.", planSaveErr: "Failed to save plan.", birthHint: "Use DD/MM/YYYY format", meal: "Meal",
      nutritionWeekTitle: "Weekly nutrition review",
      nutritionWeekTotal: "7-day completion",
      nutritionWeekEmpty: "No weekly nutrition data yet.",
      goalTitle: "Goal mode",
      goalAuto: "Auto (from scan)",
      goalLoss: "Weight loss",
      goalAthletic: "Athletic form",
      goalGain: "Muscle gain",
      dayPlanTitle: "Day plan",
      dayPlanHint: "Weekly menu is generated instantly for 7 days.",
      dayStatus: "Status",
      shoppingTitle: "Weekly shopping list",
      shoppingSub: "Auto-built from menu and goal mode.",
      shoppingEmpty: "Generate weekly menu to see shopping list.",
      shoppingFor: "List for mode",
      shoppingKg: "kg",
      shoppingL: "l",
      shoppingPcs: "pcs",
      shoppingPortions: "portions",
      shoppingWeekTotals: "Week totals",
      shoppingPlanned: "Planned",
      shoppingTarget: "Target",
      shoppingUnknown: "Items without exact quantity",
      shoppingUnknownEmpty: "All items were parsed with quantities.",
      dayKcal: "Calories (planned/target)",
      statusMatch: "Match day",
      statusRecovery: "Recovery",
      statusTrain: "Training",
      readOnlyDelegated: "Read-only mode: viewing delegated athlete.",
      accessDeniedAthlete: "Access denied for this athlete."
    }
  };
  I18N.de = { ...I18N.en, tagline: "Professionelle Athletenbetreuung online", pageTitle: "Weight Control: Körperzusammensetzung", bodyTitle: "Körperparameter", birth: "Geburtsdatum", hcm: "Größe (cm)", cweight: "Aktuelles Gewicht (kg)", saveAnalyze: "Speichern und analysieren", nutritionTitle: "Wie viel Zeit hast du zum Kochen?", nutritionSelectedPrefix: "Ausgewählt", nutritionWeeklyPlan: "Wöchentlicher Ernährungsplan", speedEasy: "Schnell", speedMid: "Ausgewogen", speedHard: "Detailliert", recoPh: "Daten eingeben, um Empfehlungen zu erhalten...", genPlan: "Plan erhalten", brf: "Frühstück", lnc: "Mittagessen", din: "Abendessen", chart: "Fortschrittsdiagramm", history: "Verlauf (zum Anzeigen klicken)", histLoad: "Verlauf wird geladen...", histEmpty: "Noch keine Einträge", noScan: "Warte auf heutigen Scan", kcalLeft: "Kcal verbleibend", f: "Fett", c: "Kohlenh.", last: "LETZTER EINTRAG", modeMg: "MUSKELAUFBAU", modeAf: "ATHLETISCHE FORM", modeWl: "GEWICHTSKONTROLLE", fillAlert: "Bitte Gewicht, Größe und Geburtsdatum ausfüllen.", scanFirst: "Bitte zuerst Körperanalyse durchführen.", delRecQ: "Diesen Eintrag löschen?", delRecErr: "Eintrag konnte nicht gelöscht werden.", resetQ: "Aktuellen Plan löschen und neu erstellen?", resetBtn: "Tagesplan zurücksetzen", left: "Rest", up: "hoch", down: "runter", done: "Fertig", profileErr: "Profil konnte nicht gespeichert werden.", histErr: "Verlauf konnte nicht geladen werden.", saveHistErr: "Analyse konnte nicht gespeichert werden.", planLoadErr: "Plan konnte nicht geladen werden.", planSaveErr: "Plan konnte nicht gespeichert werden.", meal: "Mahlzeit", nutritionWeekTitle: "Wochen-Check Ernährung", nutritionWeekTotal: "7-Tage-Erfüllung", nutritionWeekEmpty: "Noch keine Wochenwerte zur Ernährung." };
  I18N.es = { ...I18N.en, tagline: "Acompañamiento profesional del atleta online", pageTitle: "Weight Control: Análisis corporal", bodyTitle: "Parámetros corporales", birth: "Fecha de nacimiento", hcm: "Altura (cm)", cweight: "Peso actual (kg)", saveAnalyze: "Guardar y analizar", nutritionTitle: "¿Cuánto tiempo tienes para cocinar?", nutritionSelectedPrefix: "Seleccionado", nutritionWeeklyPlan: "Plan nutricional semanal", speedEasy: "Rápido", speedMid: "Equilibrado", speedHard: "Detallado", recoPh: "Introduce tus datos para recibir recomendaciones...", genPlan: "Obtener plan", brf: "Desayuno", lnc: "Almuerzo", din: "Cena", chart: "Gráfico de progreso", history: "Historial (pulsa para ver)", histLoad: "Cargando historial...", histEmpty: "Aún no hay registros", noScan: "Esperando el escaneo de hoy", kcalLeft: "Kcal restantes", p: "Prote", c: "Carbos", last: "ÚLTIMO REGISTRO", modeMg: "GANANCIA MUSCULAR", modeAf: "FORMA ATLÉTICA", modeWl: "CONTROL DE PESO", fillAlert: "Completa peso, altura y fecha de nacimiento.", scanFirst: "Primero realiza el análisis corporal.", delRecQ: "¿Eliminar este registro?", delRecErr: "No se pudo eliminar el registro.", resetQ: "¿Eliminar plan actual y generar uno nuevo?", resetBtn: "Reiniciar plan diario", left: "Restante", up: "arriba", down: "abajo", done: "Hecho", profileErr: "No se pudo guardar el perfil.", histErr: "No se pudo cargar el historial.", saveHistErr: "No se pudo guardar el análisis.", planLoadErr: "No se pudo cargar el plan.", planSaveErr: "No se pudo guardar el plan.", meal: "Comida", nutritionWeekTitle: "Revisión nutricional semanal", nutritionWeekTotal: "Cumplimiento 7 días", nutritionWeekEmpty: "Aún no hay datos semanales de nutrición." };
  I18N.ru = { ...I18N.en, tagline: "Профессиональное сопровождение атлета онлайн", pageTitle: "Weight Control: Аналитика состава тела", bodyTitle: "Параметры тела", age: "ВОЗРАСТ", height: "РОСТ", birth: "Дата рождения", hcm: "Рост (см)", cweight: "Текущий вес (кг)", saveAnalyze: "Сохранить и анализировать", nutritionTitle: "Сколько времени у вас есть на приготовление?", nutritionSelectedPrefix: "Выбрано", nutritionWeeklyPlan: "Недельный план питания", speedEasy: "Быстро", speedMid: "Сбалансировано", speedHard: "Детально", recoPh: "Введите данные, чтобы получить рекомендации...", genPlan: "Получить план", brf: "Завтрак", lnc: "Обед", din: "Ужин", chart: "График прогресса", history: "История измерений (нажмите для просмотра)", histLoad: "Загрузка истории...", histEmpty: "Записей пока нет", noScan: "Ожидаем сегодняшний скан", kcalLeft: "Ккал осталось", p: "Белки", f: "Жиры", c: "Углев.", today: "СЕГОДНЯ", last: "ПОСЛЕДНЯЯ ЗАПИСЬ", modeMg: "НАБОР МЫШЕЧНОЙ МАССЫ", modeAf: "АТЛЕТИЧЕСКАЯ ФОРМА", modeWl: "КОНТРОЛЬ ВЕСА", fillAlert: "Пожалуйста, заполните вес, рост и дату рождения.", scanFirst: "Сначала выполните анализ состава тела.", delRecQ: "Удалить эту запись?", delRecErr: "Не удалось удалить запись.", resetQ: "Удалить текущий план и сгенерировать новый?", resetBtn: "Сбросить план дня", left: "Остаток", up: "вверх", down: "вниз", done: "Готово", profileErr: "Не удалось сохранить профиль.", histErr: "Не удалось загрузить историю.", saveHistErr: "Не удалось сохранить анализ.", planLoadErr: "Не удалось загрузить план.", planSaveErr: "Не удалось сохранить план.", meal: "Блюдо", nutritionWeekTitle: "Недельный обзор питания", nutritionWeekTotal: "Выполнение за 7 дней", nutritionWeekEmpty: "Пока нет недельных данных по питанию." };
  I18N.pt = { ...I18N.en, tagline: "Acompanhamento profissional do atleta online", pageTitle: "Weight Control: Análise da composição corporal", bodyTitle: "Parâmetros corporais", age: "IDADE", height: "ALTURA", birth: "Data de nascimento", hcm: "Altura (cm)", cweight: "Peso atual (kg)", saveAnalyze: "Salvar e analisar", nutritionTitle: "Quanto tempo você tem para cozinhar?", nutritionSelectedPrefix: "Selecionado", nutritionWeeklyPlan: "Plano alimentar semanal", speedEasy: "Rápido", speedMid: "Equilibrado", speedHard: "Detalhado", recoPh: "Insira seus dados para receber recomendações...", genPlan: "Obter plano", brf: "Café da manhã", lnc: "Almoço", din: "Jantar", chart: "Gráfico de progresso", history: "Histórico (toque para ver)", histLoad: "Carregando histórico...", histEmpty: "Ainda sem registros", noScan: "Aguardando escaneamento de hoje", kcalLeft: "Kcal restantes", p: "Prote", f: "Gord", c: "Carbo", last: "ÚLTIMO REGISTRO", modeMg: "GANHO MUSCULAR", modeAf: "FORMA ATLÉTICA", modeWl: "CONTROLE DE PESO", fillAlert: "Preencha peso, altura e data de nascimento.", scanFirst: "Faça primeiro a análise corporal.", delRecQ: "Excluir este registro?", delRecErr: "Não foi possível excluir o registro.", resetQ: "Excluir plano atual e gerar novo?", resetBtn: "Resetar plano diário", left: "Restante", up: "subindo", down: "descendo", done: "Concluído", profileErr: "Não foi possível salvar o perfil.", histErr: "Falha ao carregar histórico.", saveHistErr: "Falha ao salvar análise.", planLoadErr: "Falha ao carregar plano.", planSaveErr: "Falha ao salvar plano.", meal: "Refeição", nutritionWeekTitle: "Revisão semanal da nutrição", nutritionWeekTotal: "Cumprimento de 7 dias", nutritionWeekEmpty: "Ainda não há dados semanais de nutrição." };
  Object.assign(I18N.de, {
    shoppingWeekTotals: "Wochenbilanz",
    shoppingPlanned: "Geplant",
    shoppingTarget: "Ziel",
    shoppingUnknown: "Positionen ohne exakte Menge",
    shoppingUnknownEmpty: "Alle Positionen wurden mit Mengen erkannt.",
    dayKcal: "Kalorien (geplant/Ziel)"
  });
  Object.assign(I18N.es, {
    shoppingWeekTotals: "Resumen semanal",
    shoppingPlanned: "Planificado",
    shoppingTarget: "Objetivo",
    shoppingUnknown: "Ítems sin cantidad exacta",
    shoppingUnknownEmpty: "Todos los ítems se calcularon con cantidades.",
    dayKcal: "Calorías (plan/objetivo)"
  });
  Object.assign(I18N.ru, {
    shoppingWeekTotals: "Итоги недели",
    shoppingPlanned: "Запланировано",
    shoppingTarget: "Цель",
    shoppingUnknown: "Позиции без точного количества",
    shoppingUnknownEmpty: "Все позиции рассчитаны с количеством.",
    dayKcal: "Калории (план/цель)"
  });
  Object.assign(I18N.pt, {
    shoppingWeekTotals: "Resumo semanal",
    shoppingPlanned: "Planejado",
    shoppingTarget: "Meta",
    shoppingUnknown: "Itens sem quantidade exata",
    shoppingUnknownEmpty: "Todos os itens foram calculados com quantidades.",
    dayKcal: "Calorias (planejado/meta)"
  });
  Object.assign(I18N.de, {
    readOnlyDelegated: "Nur-Lese-Modus: Delegierter Athlet wird angezeigt.",
    accessDeniedAthlete: "Kein Zugriff auf diesen Athleten."
  });
  Object.assign(I18N.es, {
    readOnlyDelegated: "Modo de solo lectura: viendo atleta delegado.",
    accessDeniedAthlete: "Acceso denegado para este atleta."
  });
  Object.assign(I18N.ru, {
    readOnlyDelegated: "Режим только чтения: просмотр делегированного атлета.",
    accessDeniedAthlete: "Нет доступа к этому атлету."
  });
  Object.assign(I18N.pt, {
    readOnlyDelegated: "Modo somente leitura: visualizando atleta delegado.",
    accessDeniedAthlete: "Acesso negado para este atleta."
  });

  const SCAN_I18N = {
    en: {
      scanPanelTitle: "Composition Scan Insights",
      scanBmi: "BMI",
      scanRecommendation: "Recommendation",
      scanCurrentState: "Current Status",
      scanHydration: "Hydration",
      scanExtras: "Additional Recommendations",
      scanAwaiting: "Your personalized scan insights will appear here after analysis.",
      scanRecoLow: "BMI is below target range. Add a moderate calorie surplus and focus on strength work.",
      scanRecoNormal: "BMI is in the working range. Keep nutrition balanced and recovery consistent.",
      scanRecoHigh: "BMI is above target range. Control calories, keep protein high, and maintain daily activity.",
      scanWaterInfo: "Water target: {water} L/day. Spread intake evenly through the day.",
      scanTipProtein: "Protein target: about {protein} g/day.",
      scanTipSleep: "Sleep 7-9 hours daily to improve recovery.",
      scanTipTiming: "Run scans at the same time of day for cleaner comparisons.",
      scanTipTrendUp: "Weight increased vs previous record: review calorie balance.",
      scanTipTrendDown: "Weight decreased vs previous record: monitor energy and recovery.",
      scanTipTrendStable: "Weight is stable: current plan is working."
    },
    uk: {
      scanPanelTitle: "Інсайти Composition Scan",
      scanBmi: "ІМТ",
      scanRecommendation: "Рекомендація",
      scanCurrentState: "Поточний стан",
      scanHydration: "Гідратація",
      scanExtras: "Додаткові рекомендації",
      scanAwaiting: "Після аналізу тут з'являться персональні інсайти.",
      scanRecoLow: "ІМТ нижче цільового діапазону. Додайте помірний профіцит калорій і фокус на силовій роботі.",
      scanRecoNormal: "ІМТ у робочому діапазоні. Тримайте збалансоване харчування і стабільне відновлення.",
      scanRecoHigh: "ІМТ вище цільового діапазону. Контролюйте калорії, тримайте високий білок і щоденну активність.",
      scanWaterInfo: "Ціль по воді: {water} л/день. Розподіляйте споживання рівномірно протягом дня.",
      scanTipProtein: "Ціль по білку: близько {protein} г/день.",
      scanTipSleep: "Сон 7-9 годин щодня покращує відновлення.",
      scanTipTiming: "Робіть скани в один і той самий час доби для точнішого порівняння.",
      scanTipTrendUp: "Вага зросла відносно попереднього запису: перегляньте калорійний баланс.",
      scanTipTrendDown: "Вага знизилась відносно попереднього запису: контролюйте енергію та відновлення.",
      scanTipTrendStable: "Вага стабільна: поточний план працює."
    },
    de: {
      scanPanelTitle: "Composition-Scan Einblicke",
      scanBmi: "BMI",
      scanRecommendation: "Empfehlung",
      scanCurrentState: "Aktueller Status",
      scanHydration: "Hydration",
      scanExtras: "Zusätzliche Empfehlungen",
      scanAwaiting: "Nach der Analyse erscheinen hier deine personalisierten Scan-Einblicke.",
      scanRecoLow: "Der BMI liegt unter dem Zielbereich. Füge einen moderaten Kalorienüberschuss hinzu und fokussiere Krafttraining.",
      scanRecoNormal: "Der BMI liegt im Zielbereich. Halte die Ernährung ausgewogen und die Regeneration konstant.",
      scanRecoHigh: "Der BMI liegt über dem Zielbereich. Kontrolliere Kalorien, halte Protein hoch und bleibe täglich aktiv.",
      scanWaterInfo: "Wasserziel: {water} L/Tag. Verteile die Trinkmenge gleichmäßig über den Tag.",
      scanTipProtein: "Proteinziel: etwa {protein} g/Tag.",
      scanTipSleep: "7-9 Stunden Schlaf pro Tag verbessern die Regeneration.",
      scanTipTiming: "Führe Scans zur besseren Vergleichbarkeit immer zur gleichen Tageszeit durch.",
      scanTipTrendUp: "Gewicht im Vergleich zum letzten Eintrag gestiegen: Kalorienbilanz prüfen.",
      scanTipTrendDown: "Gewicht im Vergleich zum letzten Eintrag gesunken: Energie und Regeneration beobachten.",
      scanTipTrendStable: "Gewicht ist stabil: der aktuelle Plan funktioniert."
    },
    es: {
      scanPanelTitle: "Información del Composition Scan",
      scanBmi: "IMC",
      scanRecommendation: "Recomendación",
      scanCurrentState: "Estado actual",
      scanHydration: "Hidratación",
      scanExtras: "Recomendaciones adicionales",
      scanAwaiting: "Tus insights personalizados aparecerán aquí después del análisis.",
      scanRecoLow: "El IMC está por debajo del rango objetivo. Añade un superávit calórico moderado y prioriza trabajo de fuerza.",
      scanRecoNormal: "El IMC está dentro del rango de trabajo. Mantén nutrición equilibrada y recuperación constante.",
      scanRecoHigh: "El IMC está por encima del rango objetivo. Controla calorías, mantén proteína alta y actividad diaria.",
      scanWaterInfo: "Objetivo de agua: {water} L/día. Reparte la ingesta de forma uniforme durante el día.",
      scanTipProtein: "Objetivo de proteína: alrededor de {protein} g/día.",
      scanTipSleep: "Dormir 7-9 horas al día mejora la recuperación.",
      scanTipTiming: "Haz los escaneos a la misma hora para comparaciones más limpias.",
      scanTipTrendUp: "El peso subió respecto al registro anterior: revisa el balance calórico.",
      scanTipTrendDown: "El peso bajó respecto al registro anterior: controla energía y recuperación.",
      scanTipTrendStable: "El peso está estable: el plan actual funciona."
    },
    ru: {
      scanPanelTitle: "Инсайты Composition Scan",
      scanBmi: "ИМТ",
      scanRecommendation: "Рекомендация",
      scanCurrentState: "Текущий статус",
      scanHydration: "Гидратация",
      scanExtras: "Дополнительные рекомендации",
      scanAwaiting: "После анализа здесь появятся персональные инсайты.",
      scanRecoLow: "ИМТ ниже целевого диапазона. Добавьте умеренный профицит калорий и акцент на силовой работе.",
      scanRecoNormal: "ИМТ в рабочем диапазоне. Держите питание сбалансированным и восстановление стабильным.",
      scanRecoHigh: "ИМТ выше целевого диапазона. Контролируйте калории, держите высокий белок и ежедневную активность.",
      scanWaterInfo: "Цель по воде: {water} л/день. Распределяйте прием равномерно в течение дня.",
      scanTipProtein: "Цель по белку: около {protein} г/день.",
      scanTipSleep: "Сон 7-9 часов в сутки улучшает восстановление.",
      scanTipTiming: "Проводите сканы в одно и то же время суток для более чистого сравнения.",
      scanTipTrendUp: "Вес вырос относительно предыдущей записи: проверьте калорийный баланс.",
      scanTipTrendDown: "Вес снизился относительно предыдущей записи: контролируйте энергию и восстановление.",
      scanTipTrendStable: "Вес стабилен: текущий план работает."
    },
    pt: {
      scanPanelTitle: "Insights do Composition Scan",
      scanBmi: "IMC",
      scanRecommendation: "Recomendação",
      scanCurrentState: "Estado atual",
      scanHydration: "Hidratação",
      scanExtras: "Recomendações adicionais",
      scanAwaiting: "Os seus insights personalizados aparecem aqui após a análise.",
      scanRecoLow: "O IMC está abaixo da faixa-alvo. Adicione um superávit calórico moderado e foque no treino de força.",
      scanRecoNormal: "O IMC está na faixa de trabalho. Mantenha a nutrição equilibrada e a recuperação consistente.",
      scanRecoHigh: "O IMC está acima da faixa-alvo. Controle calorias, mantenha proteína alta e atividade diária.",
      scanWaterInfo: "Meta de água: {water} L/dia. Distribua a ingestão de forma equilibrada ao longo do dia.",
      scanTipProtein: "Meta de proteína: cerca de {protein} g/dia.",
      scanTipSleep: "Durma 7-9 horas por dia para melhorar a recuperação.",
      scanTipTiming: "Faça os scans no mesmo horário para comparações mais limpas.",
      scanTipTrendUp: "O peso aumentou em relação ao registro anterior: reveja o balanço calórico.",
      scanTipTrendDown: "O peso diminuiu em relação ao registro anterior: monitore energia e recuperação.",
      scanTipTrendStable: "Peso estável: o plano atual está funcionando."
    }
  };
  ["uk", "en", "de", "es", "ru", "pt"].forEach((l) => {
    I18N[l] = { ...(I18N[l] || {}), ...(SCAN_I18N.en || {}), ...(SCAN_I18N[l] || {}) };
  });

  const lang = () => {
    const raw = String(localStorage.getItem("pac_lang") || "").toLowerCase();
    if (raw === "ua") return "uk";
    if (I18N[raw]) return raw;
    return "uk";
  };
  const t = (k) => I18N[lang()]?.[k] ?? I18N.en[k] ?? k;
  const tf = (k, vars = {}) => Object.keys(vars).reduce((acc, key) => acc.replace(new RegExp(`\\{${key}\\}`, "g"), String(vars[key])), String(t(k)));
  const setText = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
  const perfNow = () => (typeof performance !== "undefined" && typeof performance.now === "function") ? performance.now() : Date.now();
  const nextUiFrame = () => new Promise((resolve) => {
    if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") {
      window.requestAnimationFrame(() => resolve());
      return;
    }
    setTimeout(resolve, 0);
  });
  function computeBtnLabel() {
    const labels = {
      uk: "Розрахунок...",
      en: "Calculating...",
      de: "Berechnung...",
      es: "Calculando...",
      ru: "Расчет...",
      pt: "Calculando..."
    };
    return labels[lang()] || labels.uk;
  }
  function setDietComputeState(isBusy) {
    const busy = Boolean(isBusy);
    const viewport = document.querySelector(".hologram-viewport");
    if (viewport) viewport.classList.toggle("is-computing", busy);
    const planBtn = document.getElementById("get-diet-plan-btn");
    if (planBtn) {
      planBtn.disabled = busy;
      planBtn.style.opacity = busy ? "0.75" : "1";
      planBtn.style.cursor = busy ? "wait" : "pointer";
      planBtn.textContent = busy ? computeBtnLabel() : t("genPlan");
    }
  }
  function speedLabelByValue(s) {
    const key = s === "Hard" ? "speedHard" : (s === "Medium" ? "speedMid" : "speedEasy");
    return t(key);
  }
  function updateNutritionTitle() {
    const titleEl = document.getElementById("weight-card-nutrition-title");
    if (!titleEl) return;
    if (!speedExplicitlyChosen) {
      titleEl.textContent = t("nutritionTitle");
      return;
    }
    const mode = effectiveGoalMode(window.currentAnalysis?.modeCode);
    titleEl.textContent = `${t("nutritionSelectedPrefix")}: ${speedLabelByValue(selectedSpeed)} • ${goalModeLabel(mode)} • ${t("nutritionWeeklyPlan")}`;
  }
  const locale = () => ({ uk: "uk-UA", en: "en-US", de: "de-DE", es: "es-ES", ru: "ru-RU", pt: "pt-PT" }[lang()] || "en-US");
  const fix = (s) => { const raw = String(s || ""); if (!/[ÐÑÃâ]/.test(raw)) return raw; try { return decodeURIComponent(escape(raw)); } catch { return raw; } };
  const dietI18n = () => (window.PACDietI18n && typeof window.PACDietI18n === "object" ? window.PACDietI18n : null);
  function renderRecipePreferences(){
    const words=({
      uk:['Харчові вподобання','Застосовуються при генерації нового меню. Перевіряй склад на упаковці; сліди алергенів не визначаються.','Тип харчування','Змішане','Вегетаріанське','Рослинне','Виключити інгредієнти','Молоко','Риба','Яйця','Соя','Глютен / овес','Горіхи','Для цих обмежень і часу приготування бракує страв. Зміни час або обмеження; меню не змінено.'],
      en:['Food preferences','Apply when generating a new menu. Check product labels; allergen traces are not assessed.','Diet type','Mixed','Vegetarian','Plant-based','Exclude ingredients','Milk','Fish','Eggs','Soy','Gluten / oats','Nuts','Not enough meals for these restrictions and preparation time. Change time or restrictions; your menu was not changed.'],
      de:['Ernährungsvorlieben','Gelten bei der Erstellung eines neuen Menüs. Produktetiketten prüfen; Allergenspuren werden nicht erfasst.','Ernährungsweise','Gemischt','Vegetarisch','Pflanzlich','Zutaten ausschließen','Milch','Fisch','Eier','Soja','Gluten / Hafer','Nüsse','Nicht genug Gerichte für diese Einschränkungen und Zubereitungszeit. Zeit oder Einschränkungen ändern; das Menü wurde nicht geändert.'],
      es:['Preferencias alimentarias','Se aplican al generar un menú nuevo. Revisa las etiquetas; no se evalúan trazas de alérgenos.','Tipo de alimentación','Mixta','Vegetariana','Vegetal','Excluir ingredientes','Leche','Pescado','Huevos','Soja','Gluten / avena','Frutos secos','No hay suficientes platos para estas restricciones y tiempo. Cambia el tiempo o las restricciones; el menú no se modificó.'],
      ru:['Пищевые предпочтения','Применяются при создании нового меню. Проверяй этикетки; следы аллергенов не определяются.','Тип питания','Смешанное','Вегетарианское','Растительное','Исключить ингредиенты','Молоко','Рыба','Яйца','Соя','Глютен / овёс','Орехи','Недостаточно блюд для этих ограничений и времени. Измени время или ограничения; меню не изменено.'],
      pt:['Preferências alimentares','Aplicam-se ao gerar um novo menu. Confira os rótulos; vestígios de alergénios não são avaliados.','Tipo de alimentação','Mista','Vegetariana','Vegetal','Excluir ingredientes','Leite','Peixe','Ovos','Soja','Glúten / aveia','Nozes','Não há pratos suficientes para estas restrições e tempo. Altere o tempo ou as restrições; o menu não foi alterado.']
    })[lang()];
    let host=document.getElementById('nutrition-preferences');
    if(!host){host=document.createElement('details');host.id='nutrition-preferences';document.getElementById('get-diet-plan-btn')?.before(host);}
    const open=host.open;host.replaceChildren();host.open=open;host.className='nutrition-preferences';
    const summary=document.createElement('summary');summary.textContent=words[0];host.append(summary);
    const note=document.createElement('p');note.textContent=words[1];host.append(note);
    const count=document.createElement('p');count.id='nutrition-recipe-count';count.setAttribute('aria-live','polite');
    const updateCount=()=>{const all=window.PACSportRecipes?.meals()||[];count.textContent=({uk:'Відповідних страв у бібліотеці',en:'Matching meals in the library',de:'Passende Gerichte in der Bibliothek',es:'Platos compatibles en la biblioteca',ru:'Подходящих блюд в библиотеке',pt:'Pratos compatíveis na biblioteca'})[lang()]+`: ${all.filter(m=>window.PACSportRecipes.allows(m,nutritionPreferences)).length} / ${all.length}`;};
    updateCount();host.append(count);
    const label=document.createElement('label');label.textContent=words[2];label.htmlFor='nutrition-diet';
    const select=document.createElement('select');select.id='nutrition-diet';['any','vegetarian','vegan'].forEach((v,i)=>{const o=document.createElement('option');o.value=v;o.textContent=words[3+i];select.append(o);});select.value=nutritionPreferences.diet;select.disabled=isDelegatedReadOnly;select.onchange=()=>{nutritionPreferences.diet=select.value;updateCount();};host.append(label,select);
    const fieldset=document.createElement('fieldset'),legend=document.createElement('legend');legend.textContent=words[6];fieldset.append(legend);
    ['milk','fish','egg','soy','gluten','nuts'].forEach((key,i)=>{const label=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.value=key;input.checked=nutritionPreferences.exclude.includes(key);input.disabled=isDelegatedReadOnly;input.onchange=()=>{nutritionPreferences.exclude=[...fieldset.querySelectorAll('input:checked')].map(x=>x.value);updateCount();};label.append(input,document.createTextNode(words[7+i]));fieldset.append(label);});host.append(fieldset);host.dataset.noMeals=words[13];
  }
  const recipeText = () => ({
    uk:['Рецепт і склад','хв','г','Орієнтовні значення; залежать від продуктів. Маса круп, м’яса та риби — після приготування, вівсянки — суха. Враховуй алергії. Калорійність має відповідати цілі та навантаженню, а не бути мінімальною.'],
    en:['Recipe and ingredients','min','g','Approximate values; products vary. Weigh grains, meat and fish cooked, oats dry. Consider allergies. Energy intake should match your goal and training, rather than be as low as possible.'],
    de:['Rezept und Zutaten','Min.','g','Nährwerte sind Schätzungen und produktabhängig. Getreide, Fleisch und Fisch gegart, Haferflocken trocken wiegen. Allergien beachten. Die Energiezufuhr sollte zu Ziel und Training passen, nicht möglichst niedrig sein.'],
    es:['Receta e ingredientes','min','g','Valores aproximados según el producto. Pesa cereales, carne y pescado cocidos, avena seca. Ten en cuenta las alergias. La energía debe ajustarse a tu objetivo y entrenamiento, no ser la mínima posible.'],
    ru:['Рецепт и состав','мин','г','Значения примерные и зависят от продуктов. Крупы, мясо и рыбу взвешивай готовыми, овсянку — сухой. Учитывай аллергии. Калорийность должна соответствовать цели и нагрузке, а не быть минимальной.'],
    pt:['Receita e ingredientes','min','g','Valores aproximados, variam por produto. Pese cereais, carne e peixe cozidos, aveia seca. Considere alergias. A energia deve corresponder ao objetivo e treino, em vez de ser a menor possível.']
  }[lang()] || ['Recipe and ingredients','min','g','Approximate nutrition.']);
  const mealName = (meal) => {
    const api = dietI18n();
    if (api && typeof api.pickName === "function") return fix(api.pickName(meal, lang()));
    return fix(meal?.name || t("meal"));
  };
  function inferPieceGram(nameEn) {
    const txt = String(nameEn || "").toLowerCase();
    if (txt.includes("egg")) return 60;
    if (txt.includes("pepper")) return 120;
    if (txt.includes("toast")) return 35;
    if (txt.includes("pancake") || txt.includes("fritter")) return 55;
    return 80;
  }
  function defaultPortionBySlot(slot) {
    if (slot === "lnc") return 430;
    if (slot === "din") return 360;
    return 280;
  }
  function parsePortionFromName(nameEn, slot = "brf") {
    const txt = String(nameEn || "");
    const match = txt.match(/\((\d+(?:[.,]\d+)?)\s*(kg|g|ml|l|pcs?|pc|шт)\)|\b(\d+(?:[.,]\d+)?)\s*(kg|g|ml|l|pcs?|pc|шт)\b/i);
    if (match) {
      const rawVal = Number(String(match[1] || match[3] || "0").replace(",", "."));
      const rawUnit = String(match[2] || match[4] || "").toLowerCase();
      if (Number.isFinite(rawVal) && rawVal > 0) {
        if (rawUnit === "kg") return { value: rawVal, unit: "kg", gramsApprox: Math.round(rawVal * 1000), source: "name" };
        if (rawUnit === "g") return { value: Math.round(rawVal), unit: "g", gramsApprox: Math.round(rawVal), source: "name" };
        if (rawUnit === "l") return { value: Number(rawVal.toFixed(2)), unit: "l", gramsApprox: Math.round(rawVal * 1000), source: "name" };
        if (rawUnit === "ml") return { value: Math.round(rawVal), unit: "ml", gramsApprox: Math.round(rawVal), source: "name" };
        if (rawUnit === "pc" || rawUnit === "pcs" || rawUnit === "шт") {
          const grams = Math.round(rawVal * inferPieceGram(nameEn));
          return { value: Math.round(rawVal), unit: "pcs", gramsApprox: grams, source: "name" };
        }
      }
    }

    const def = defaultPortionBySlot(slot);
    return { value: def, unit: "g", gramsApprox: def, source: "default" };
  }
  function roundUnitValue(value, unit) {
    const v = Math.max(0, Number(value || 0));
    if (unit === "kg" || unit === "l") return Number(v.toFixed(2));
    if (unit === "ml" || unit === "g" || unit === "pcs") return Math.round(v);
    return Number(v.toFixed(2));
  }
  function portionLabel(meal) {
    const unit = String(meal?.portionUnit || "");
    const value = Number(meal?.portionValue || 0);
    const grams = Number(meal?.portionGrams || 0);
    if (!unit || !value) return "";
    if (unit === "pcs" && grams > 0) return `${Math.round(value)} pcs (~${Math.round(grams)} g)`;
    return `${roundUnitValue(value, unit)} ${unit === 'g' ? recipeText()[2] : unit}`;
  }
  function mealLabelWithPortion(meal) {
    const base = mealName(meal);
    const portion = portionLabel(meal);
    return portion ? `${base} • ${portion}` : base;
  }
  function mealNameLc(meal) {
    return String(mealNameEn(meal) || mealName(meal) || "").toLowerCase();
  }
  function isProfessionalMeal(meal, { status = "TRAIN", slot = "brf" } = {}) {
    const s = mealNameLc(meal);
    const hardBlock = [
      "ramen", "borscht", "zrazy", "cabbage rolls", "moussaka",
      "sausage", "bacon", "hearts", "liver", "pork", "wine",
      "chakhokhbili", "aspic", "fried", "burger", "pie", "pastry", "pilaf", "kebab"
    ];
    if (hardBlock.some((x) => s.includes(x))) return false;

    if (slot === "brf") {
      const brfBlock = ["burger", "kebab", "lasagna", "pilaf"];
      if (brfBlock.some((x) => s.includes(x))) return false;
    }

    const mdStrict = ["cream", "sour cream", "beans", "lentil", "chickpeas", "fatty", "deep", "heavy"];
    if ((status === "MD" || status === "MD-1") && mdStrict.some((x) => s.includes(x))) return false;

    return true;
  }
  function isHeavyMealForPreMatch(meal) {
    const s = mealNameLc(meal);
    const blocked = [
      "borscht", "ramen", "moussaka", "lasagna", "cabbage rolls", "zrazy",
      "pork", "bacon", "sausage", "cream", "sour cream",
      "fried", "deep", "beans", "chickpeas", "lentil", "fatty", "wine"
    ];
    return blocked.some((w) => s.includes(w));
  }
  function isMatchFuelMeal(meal) {
    const s = mealNameLc(meal);
    const preferred = [
      "oat", "rice", "pasta", "potato", "toast", "lavash", "quinoa", "bulgur",
      "chicken", "turkey", "tuna", "salmon", "cod", "hake", "pollock",
      "egg", "yogurt", "kefir", "banana", "apple"
    ];
    return preferred.some((w) => s.includes(w));
  }
  const todayId = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
  const fmtDate = (id) => { const m = String(id || "").match(/^(\d{4})-(\d{2})-(\d{2})$/); if (!m) return id || ""; return new Intl.DateTimeFormat(locale(), { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(+m[1], +m[2]-1, +m[3])); };
  const fmtShort = (id) => { const m = String(id || "").match(/^(\d{4})-(\d{2})-(\d{2})$/); return m ? `${m[3]}.${m[2]}` : (id || ""); };
  const dayShort = (id) => {
    const m = String(id || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return "--";
    const d = new Date(+m[1], +m[2] - 1, +m[3]);
    try {
      return new Intl.DateTimeFormat(locale(), { weekday: "short" }).format(d).replace(".", "");
    } catch {
      return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()];
    }
  };
  const currentWeekId = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const mondayDiff = (now.getDay() + 6) % 7;
    now.setDate(now.getDate() - mondayDiff);
    return getDateId(now);
  };
  function weekDatesByWeekId(weekId = currentWeekId()) {
    const m = String(weekId || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return [];
    const monday = new Date(+m[1], +m[2] - 1, +m[3]);
    if (Number.isNaN(monday.getTime())) return [];
    const days = [];
    for (let i = 0; i < 7; i += 1) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push(getDateId(d));
    }
    return days;
  }
  function statusNutritionPreset(statusRaw) {
    const SPORT_STATUS_PRESETS = {
      TEAM_MD: {
        MD:    { kcal: 1.08, p: 1.0,  f: 0.92, c: 1.2 },
        "MD-1":{ kcal: 1.03, p: 1.0,  f: 0.95, c: 1.1 },
        "MD+1":{ kcal: 0.94, p: 1.1,  f: 1.0,  c: 0.9 },
        "MD+2":{ kcal: 0.94, p: 1.1,  f: 1.0,  c: 0.9 },
        REST:  { kcal: 0.90, p: 1.1,  f: 1.0,  c: 0.84 },
        REHAB: { kcal: 0.92, p: 1.15, f: 1.0,  c: 0.86 },
        LIGHT: { kcal: 0.95, p: 1.05, f: 1.0,  c: 0.92 },
        TRAIN: { kcal: 1.00, p: 1.0,  f: 1.0,  c: 1.0 }
      },
      COURT_MD: {
        MD:    { kcal: 1.05, p: 1.0,  f: 0.94, c: 1.12 },
        "MD-1":{ kcal: 1.01, p: 1.0,  f: 0.96, c: 1.05 },
        "MD+1":{ kcal: 0.95, p: 1.08, f: 1.0,  c: 0.92 },
        "MD+2":{ kcal: 0.96, p: 1.05, f: 1.0,  c: 0.94 },
        REST:  { kcal: 0.91, p: 1.08, f: 1.0,  c: 0.86 },
        REHAB: { kcal: 0.93, p: 1.12, f: 1.0,  c: 0.88 },
        LIGHT: { kcal: 0.96, p: 1.03, f: 1.0,  c: 0.94 },
        TRAIN: { kcal: 1.00, p: 1.0,  f: 1.0,  c: 1.0 }
      },
      INDIVIDUAL_ENDURANCE: {
        MD:    { kcal: 1.10, p: 0.98, f: 0.88, c: 1.28 },
        "MD-1":{ kcal: 1.05, p: 1.0,  f: 0.92, c: 1.18 },
        "MD+1":{ kcal: 0.95, p: 1.08, f: 1.0,  c: 0.95 },
        "MD+2":{ kcal: 0.98, p: 1.04, f: 1.0,  c: 1.0 },
        REST:  { kcal: 0.90, p: 1.05, f: 1.0,  c: 0.82 },
        REHAB: { kcal: 0.93, p: 1.12, f: 1.0,  c: 0.9 },
        LIGHT: { kcal: 0.96, p: 1.03, f: 1.0,  c: 0.96 },
        TRAIN: { kcal: 1.02, p: 1.0,  f: 0.96, c: 1.08 }
      }
    };
    const statusLabel = (st) => {
      if (st === "MD") return t("statusMatch");
      if (st === "REST" || st === "REHAB" || st === "MD+1" || st === "MD+2") return t("statusRecovery");
      return t("statusTrain");
    };

    const st = String(statusRaw || "TRAIN").toUpperCase();
    const profileKey = SPORT_STATUS_PRESETS[currentSportProfile] ? currentSportProfile : "TEAM_MD";
    const profileMap = SPORT_STATUS_PRESETS[profileKey];
    const preset = profileMap[st] || profileMap.TRAIN || { kcal: 1.0, p: 1.0, f: 1.0, c: 1.0 };
    return { ...preset, label: statusLabel(st) };
  }
  function effectiveGoalMode(baseModeCode) {
    if (selectedGoalMode && selectedGoalMode !== "auto") return selectedGoalMode;
    return String(baseModeCode || "af").toLowerCase();
  }
  function adjustedAnalysisByGoal(baseAnalysis) {
    const base = normAnalysis(baseAnalysis);
    if (!base) return null;

    const mode = effectiveGoalMode(base.baseModeCode || base.modeCode);
    const out = { ...base, baseModeCode:base.baseModeCode || base.modeCode, baseTargetKcal:Number(base.baseTargetKcal || base.targetKcal), modeCode: mode };

    const kcalMul = mode === "mg" ? 1.1 : mode === "wl" ? 0.88 : 1.0;
    out.targetKcal = Math.max(1200, Math.round(out.baseTargetKcal * kcalMul));

    let ratios = { p: 0.30, f: 0.25, c: 0.45 };
    if (mode === "wl") ratios = { p: 0.35, f: 0.30, c: 0.35 };
    if (mode === "mg") ratios = { p: 0.30, f: 0.25, c: 0.45 };

    out.p = Math.round((out.targetKcal * ratios.p) / 4);
    out.f = Math.round((out.targetKcal * ratios.f) / 9);
    out.c = Math.round((out.targetKcal * ratios.c) / 4);
    return out;
  }
  async function loadWeeklyStatuses(weekId = currentWeekId()) {
    const days = weekDatesByWeekId(weekId);
    const next = {};
    days.forEach((id) => { next[id] = "TRAIN"; });
    if (!currentUserId || !weekId) return next;

    try {
      const doc = await db.collection("weekly_plans").doc(`${currentUserId}_${weekId}`).get();
      if (doc.exists) {
        const micro = doc.data()?.microcycle || {};
        const activity = days.map((_, idx) => String(micro[`day${idx}`] || "TRAIN").toUpperCase());
        const matchIdx = activity
          .map((v, idx) => (v === "MATCH" || v === "MD") ? idx : -1)
          .filter((v) => v >= 0);
        const isFinalStatus = (raw) => /^MD(?:[+-]\d+)?$/.test(raw) || ["TRAIN", "REST", "LIGHT", "REHAB"].includes(raw);

        days.forEach((id, idx) => {
          const raw = String(activity[idx] || "TRAIN").toUpperCase();
          if (isFinalStatus(raw)) {
            next[id] = raw;
            return;
          }
          if (raw === "REST") {
            next[id] = "REST";
            return;
          }
          if (raw === "MATCH") {
            next[id] = "MD";
            return;
          }

          let best = "TRAIN";
          let minAbs = Infinity;
          matchIdx.forEach((m) => {
            [-7, 0, 7].forEach((offset) => {
              const diff = idx - (m + offset);
              const candidate = statusByMatchDiff(diff, currentSportProfile);
              if (candidate) {
                const abs = Math.abs(diff);
                if (abs < minAbs) {
                  minAbs = abs;
                  best = candidate;
                }
              }
            });
          });

          next[id] = best;
        });
      }
    } catch (e) {
      console.warn("weekly statuses fallback:", e?.message || e);
    }
    return next;
  }
  function parseBirth(raw) {
    const s = String(raw || "").trim();
    let m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) { const d = new Date(+m[1], +m[2]-1, +m[3]); return Number.isNaN(d.getTime()) ? null : d; }
    m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (m) { const d = new Date(+m[3], +m[2]-1, +m[1]); return Number.isNaN(d.getTime()) ? null : d; }
    return null;
  }
  function age(raw) {
    const bd = parseBirth(raw); if (!bd) return null;
    const n = new Date(); let a = n.getFullYear() - bd.getFullYear();
    const md = n.getMonth() - bd.getMonth();
    if (md < 0 || (md === 0 && n.getDate() < bd.getDate())) a -= 1;
    return a >= 0 ? a : null;
  }
  const normBirthInput = (raw) => {
    const bd = parseBirth(raw); if (!bd) return "";
    return `${String(bd.getDate()).padStart(2, "0")}/${String(bd.getMonth()+1).padStart(2, "0")}/${bd.getFullYear()}`;
  };

  window.calculateAge = (raw) => { const a = age(raw); return a == null ? "--" : a; };

  function applyI18n() {
    renderRecipePreferences();
    const disclaimer=document.querySelector('[data-pac-disclaimer="weight"]');
    if(disclaimer)disclaimer.textContent=({uk:'Орієнтовні розрахунки та приклади харчування для фітнесу. Це не вимірювання складу тіла та не індивідуальне призначення дієтолога.',en:'Estimated calculations and example fitness meals. This is not a body composition measurement or an individual dietitian prescription.',de:'Geschätzte Berechnungen und Mahlzeitenbeispiele für Fitness. Keine Messung der Körperzusammensetzung und keine individuelle Ernährungsverordnung.',es:'Cálculos estimados y ejemplos de comidas para fitness. No es una medición de composición corporal ni una dieta individual prescrita.',ru:'Ориентировочные расчёты и примеры питания для фитнеса. Это не измерение состава тела и не индивидуальное назначение диетолога.',pt:'Cálculos estimados e exemplos de refeições para fitness. Não é uma medição da composição corporal nem uma prescrição alimentar individual.'})[lang()];
    document.title = t("title");
    setText("weight-tagline", t("tagline"));
    setText("weight-main-title", t("pageTitle"));
    setText("weight-card-body-title", t("bodyTitle"));
    setText("weight-label-age", t("age"));
    setText("weight-label-height", t("height"));
    setText("weight-label-birthdate", t("birth"));
    setText("weight-label-height-cm", t("hcm"));
    setText("weight-label-current-weight", t("cweight"));
    setText("weight-btn-save-analyze", t("saveAnalyze"));
    setText("weight-card-scan-title", t("scanTitle"));
    updateNutritionTitle();
    setText("weight-speed-easy", t("speedEasy"));
    setText("weight-speed-medium", t("speedMid"));
    setText("weight-speed-hard", t("speedHard"));
    setText("weight-goal-title", t("goalTitle"));
    setText("weight-goal-auto", t("goalAuto"));
    setText("weight-goal-wl", t("goalLoss"));
    setText("weight-goal-af", t("goalAthletic"));
    setText("weight-goal-mg", t("goalGain"));
    const goalSel = document.getElementById("weight-goal-mode");
    if (goalSel) goalSel.value = selectedGoalMode;
    setText("get-diet-plan-btn", t("genPlan"));
    setText("diet-active-day-title", t("dayPlanTitle"));
    setText("diet-active-day-hint", t("dayPlanHint"));
    setText("btn-brf", t("brf"));
    setText("btn-lnc", t("lnc"));
    setText("btn-din", t("din"));
    setText("weight-chart-title", t("chart"));
    setText("weight-history-summary", t("history"));
    setText("nutrition-week-title", t("nutritionWeekTitle"));
    setText("shopping-list-title", t("shoppingTitle"));
    setText("shopping-list-sub", t("shoppingSub"));

    const top = document.getElementById("athlete-recommendation-box");
    if (top && !window.currentAnalysis) top.textContent = t("recoPh");
    const hist = document.getElementById("weight-history-list");
    if (hist && !hist.children.length) hist.innerHTML = `<div style="color:#444; font-size:11px; text-align:center; padding:10px;">${t("histLoad")}</div>`;

    const b = document.getElementById("user-birthdate");
    if (b) b.placeholder = t("birthPh");

    const userName = document.getElementById("user-name");
    if (userName && (!userName.textContent || /loading|заван/i.test(userName.textContent))) userName.textContent = t("loading");
    renderScanExplain(window.currentAnalysis ? normAnalysis(window.currentAnalysis) : null, window.latestHistoryArray || []);
    renderNutritionWeekSummary(window.__nutritionWeekRows || []);
    renderWeekDayBar();
    renderShoppingList();
  }

  function getDateId(dt) {
    const d = (dt instanceof Date) ? dt : new Date(dt);
    if (isNaN(d.getTime())) return "";
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }
  function getWeekBounds() {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const day = now.getDay();
    const mondayDiff = (day + 6) % 7;
    const start = new Date(now);
    start.setDate(now.getDate() - mondayDiff);
    const days = [];
    for (let i = 0; i < 7; i += 1) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d);
    }
    return days;
  }
  function weekdayShort(d) {
    const localeMap = { uk: "uk-UA", en: "en-US", de: "de-DE", es: "es-ES", ru: "ru-RU", pt: "pt-PT" };
    const locale = localeMap[lang()] || "en-US";
    try {
      return new Intl.DateTimeFormat(locale, { weekday: "short" }).format(d).replace(".", "");
    } catch {
      return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()];
    }
  }
  function renderNutritionWeekSummary(rows) {
    const grid = document.getElementById("nutrition-week-grid");
    const sub = document.getElementById("nutrition-week-sub");
    if (!grid || !sub) return;
    if(window.PACFoodDiaryCore&&(rows||[]).some(r=>r.foodDiary||r.actualNutrition?.version===1)){
      const byDate=new Map((rows||[]).map(r=>[r.date,r]));
      const values=getWeekBounds().map(d=>{const r=byDate.get(getDateId(d));return {day:weekdayShort(d),kcal:r?Number(r.foodDiary?window.PACFoodDiaryCore.project(r.planConsumed||{},r.foodDiary.entries||{}).kcal:r.actualNutrition?.kcal??r.eatenKcal):null};});
      sub.textContent=`${window.PACFoodDiaryText('consumed',lang())}: ≈ ${Math.round(values.reduce((n,v)=>n+(v.kcal||0),0))} kcal`;
      grid.replaceChildren();for(const v of values){const cell=document.createElement('div');cell.className='nutrition-week-day';const day=document.createElement('strong');day.textContent=v.day;const value=document.createElement('span');value.textContent=v.kcal===null?'—':Math.round(v.kcal)+' kcal';cell.append(day,value);grid.append(cell);}return;
    }

    const map = new Map();
    (Array.isArray(rows) ? rows : []).forEach((r) => {
      const id = String(r?.date || "");
      if (!id) return;
      const pct = Math.max(0, Math.min(100, Number(r?.completionPct || 0)));
      map.set(id, Math.max(pct, map.get(id) || 0));
    });

    const days = getWeekBounds();
    const values = days.map((d) => ({ id: getDateId(d), day: weekdayShort(d), pct: map.get(getDateId(d)) || 0 }));
    const weeklyPct = Math.round(values.reduce((acc, x) => acc + x.pct, 0) / 7);
    sub.textContent = `${t("nutritionWeekTotal")}: ${weeklyPct}%`;

    const hasData = values.some((v) => v.pct > 0);
    if (!hasData) {
      grid.innerHTML = `<div class="nutrition-week-empty" id="nutrition-week-empty">${t("nutritionWeekEmpty")}</div>`;
      return;
    }

    grid.innerHTML = values.map((v) => `
      <div class="nutrition-week-day ${v.pct >= 70 ? "is-good" : ""}" title="${v.id}">
        <strong>${v.day}</strong>
        <span>${v.pct}%</span>
      </div>
    `).join("");
  }
  async function loadNutritionWeekSummary() {
    if (!currentUserId) return;
    try {
      const days = getWeekBounds().map(getDateId);
      const startId = days[0];
      const endId = days[6];
      let snap = null;
      try {
        snap = await db
          .collection("athlete_nutrition_daily")
          .where("userId", "==", currentUserId)
          .where("date", ">=", startId)
          .where("date", "<=", endId)
          .get();
      } catch {
        snap = await db.collection("athlete_nutrition_daily").where("userId", "==", currentUserId).get();
      }
      const rows = [];
      snap.forEach((doc) => {
        const d = doc.data() || {};
        const id = String(d.date || "");
        if (id >= startId && id <= endId) rows.push(d);
      });
      window.__nutritionWeekRows = rows;
      renderNutritionWeekSummary(rows);
    } catch {
      window.__nutritionWeekRows = [];
      renderNutritionWeekSummary([]);
    }
  }
  const DAY_SLOTS = ["brf", "lnc", "din"];
  const SLOT_SHARE = { brf: 0.33, lnc: 0.37, din: 0.30 };

  function sumPlanNutrients(plan, { onlyEaten = false } = {}) {
    const out = { k: 0, p: 0, f: 0, c: 0 };
    DAY_SLOTS.forEach((slot) => {
      const rows = Array.isArray(plan?.[slot]) ? plan[slot] : [];
      rows.forEach((m) => {
        if (onlyEaten && !m?.eaten) return;
        out.k += Number(m?.kcal || 0);
        out.p += Number(m?.p || 0);
        out.f += Number(m?.f || 0);
        out.c += Number(m?.c || 0);
      });
    });
    return out;
  }
  function activeDayTargets(an) {
    const meta = currentDailyPlan?._meta || {};
    return {
      k: Math.max(0, Number(meta.targetKcal || an?.targetKcal || 0)),
      p: Math.max(0, Number(meta.targetP || an?.p || 0)),
      f: Math.max(0, Number(meta.targetF || an?.f || 0)),
      c: Math.max(0, Number(meta.targetC || an?.c || 0))
    };
  }
  function dayTotalsById(dayId, fallbackAnalysis) {
    const plan = sanitizePlan(weeklyPlan?.[dayId] || {});
    const planned = sumPlanNutrients(plan);
    const meta = plan?._meta || {};
    return {
      targetKcal: Math.max(0, Number(meta.targetKcal || fallbackAnalysis?.targetKcal || 0)),
      plannedKcal: Math.max(0, Math.round(Number(meta.plannedKcal || planned.k || 0))),
      targetP: Math.max(0, Number(meta.targetP || fallbackAnalysis?.p || 0)),
      targetF: Math.max(0, Number(meta.targetF || fallbackAnalysis?.f || 0)),
      targetC: Math.max(0, Number(meta.targetC || fallbackAnalysis?.c || 0)),
      plannedP: Math.max(0, Math.round(Number(meta.plannedP || planned.p || 0))),
      plannedF: Math.max(0, Math.round(Number(meta.plannedF || planned.f || 0))),
      plannedC: Math.max(0, Math.round(Number(meta.plannedC || planned.c || 0)))
    };
  }

  const shoppingUnitLabel = (unit) => {
    if (unit === "kg") return t("shoppingKg");
    if (unit === "l") return t("shoppingL");
    if (unit === "pcs") return t("shoppingPcs");
    return t("shoppingPortions");
  };
  const goalModeLabel = (mode) => {
    if (mode === "wl") return t("goalLoss");
    if (mode === "mg") return t("goalGain");
    if (mode === "af") return t("goalAthletic");
    return t("goalAuto");
  };
  const ingredientI18n = {
    chicken: { uk: "Куряче філе", en: "Chicken", de: "Hähnchen", es: "Pollo", ru: "Курица", pt: "Frango" },
    turkey: { uk: "Індичка", en: "Turkey", de: "Pute", es: "Pavo", ru: "Индейка", pt: "Peru" },
    beef: { uk: "Яловичина", en: "Beef", de: "Rind", es: "Ternera", ru: "Говядина", pt: "Carne bovina" },
    fish: { uk: "Риба / морепродукти", en: "Fish / seafood", de: "Fisch / Meeresfrüchte", es: "Pescado / mariscos", ru: "Рыба / морепродукты", pt: "Peixe / frutos do mar" },
    eggs: { uk: "Яйця", en: "Eggs", de: "Eier", es: "Huevos", ru: "Яйца", pt: "Ovos" },
    dairy: { uk: "Молочні продукти", en: "Dairy", de: "Milchprodukte", es: "Lácteos", ru: "Молочные продукты", pt: "Laticínios" },
    grains: { uk: "Крупи / паста", en: "Grains / pasta", de: "Getreide / Pasta", es: "Cereales / pasta", ru: "Крупы / паста", pt: "Grãos / massa" },
    vegetables: { uk: "Овочі", en: "Vegetables", de: "Gemüse", es: "Verduras", ru: "Овощи", pt: "Vegetais" },
    fruits: { uk: "Фрукти", en: "Fruits", de: "Obst", es: "Frutas", ru: "Фрукты", pt: "Frutas" }
  };
  const ingredientRules = [
    { key: "chicken", re: /\b(chicken|fillet|breast)\b/i, unit: "kg", qty: 0.16 },
    { key: "turkey", re: /\b(turkey|ham)\b/i, unit: "kg", qty: 0.16 },
    { key: "beef", re: /\b(beef|veal)\b/i, unit: "kg", qty: 0.16 },
    { key: "fish", re: /\b(fish|tuna|salmon|trout|hake|cod|pollock|mackerel|sardines|shrimp|mussels|squid)\b/i, unit: "kg", qty: 0.16 },
    { key: "eggs", re: /\b(egg|eggs)\b/i, unit: "pcs", qty: 1 },
    { key: "dairy", re: /\b(cottage|cheese|mozzarella|ricotta|feta|yogurt|kefir|skyr)\b/i, unit: "kg", qty: 0.2 },
    { key: "grains", re: /\b(oat|oatmeal|rice|buckwheat|bulgur|couscous|quinoa|millet|polenta|semolina|pasta|bread|toast|lavash)\b/i, unit: "kg", qty: 0.08 },
    { key: "vegetables", re: /\b(vegetables|salad|broccoli|spinach|zucchini|cucumber|tomato|tomatoes|pepper|eggplant|asparagus|carrot)\b/i, unit: "kg", qty: 0.2 },
    { key: "fruits", re: /\b(apple|pear|banana|berries|blueberries|lemon|avocado)\b/i, unit: "kg", qty: 0.15 }
  ];
  function ingredientLabelByKey(key) {
    const l = lang();
    return ingredientI18n[key]?.[l] || ingredientI18n[key]?.en || key;
  }
  function mealNameEn(meal) {
    const api = dietI18n();
    if (api && typeof api.normalizeMeal === "function") {
      const normalized = api.normalizeMeal(meal || {});
      return fix(normalized?.name_en || normalized?.name || "");
    }
    return fix(meal?.name_en || meal?.name || "");
  }
  function splitMealParts(raw) {
    const s = String(raw || "")
      .replace(/\s*[+/]\s*/g, " | ")
      .replace(/\bwith\b/gi, " | ")
      .replace(/\band\b/gi, " | ");
    return s.split("|").map((x) => x.trim()).filter(Boolean);
  }
  function normalizeQtyUnit(qty, unit) {
    const amount = Number(String(qty || "0").replace(",", "."));
    const u = String(unit || "").toLowerCase();
    if (!Number.isFinite(amount) || amount <= 0) return null;
    if (u === "g") return { qty: amount / 1000, unit: "kg" };
    if (u === "kg") return { qty: amount, unit: "kg" };
    if (u === "ml") return { qty: amount / 1000, unit: "l" };
    if (u === "l") return { qty: amount, unit: "l" };
    if (u === "pcs" || u === "pc" || u === "шт") return { qty: amount, unit: "pcs" };
    if (u.includes("egg")) return { qty: amount, unit: "pcs" };
    return null;
  }
  function extractQuantity(part) {
    const txt = String(part || "");
    const checks = [
      /\((\d+(?:[.,]\d+)?)\s*(kg|g|ml|l|pcs?|pc|шт)\)/i,
      /\b(\d+(?:[.,]\d+)?)\s*(kg|g|ml|l|pcs?|pc|шт)\b/i,
      /\b(\d+(?:[.,]\d+)?)\s*(eggs?)\b/i
    ];
    for (const re of checks) {
      const m = txt.match(re);
      if (!m) continue;
      const parsed = normalizeQtyUnit(m[1], m[2]);
      if (parsed) return parsed;
    }
    return null;
  }
  function cleanIngredientText(part) {
    return String(part || "")
      .replace(/\([^)]*\)/g, " ")
      .replace(/\b\d+(?:[.,]\d+)?\s*(kg|g|ml|l|pcs?|pc|шт|eggs?)\b/gi, " ")
      .replace(/[,:;()[\]/+.-]/g, " ")
      .replace(/\b(with|and|plus|in|on|for|the|a|an)\b/gi, " ")
      .replace(/\s{2,}/g, " ")
      .trim();
  }
  function toTitleCase(text) {
    return String(text || "")
      .toLowerCase()
      .replace(/(^|\s)([a-zа-яіїєґ])/giu, (m, p1, p2) => `${p1}${p2.toUpperCase()}`)
      .trim();
  }
  function mealScaleFactor(meal, slot) {
    if (meal?.recipeId) return Math.max(0.1, Number(meal.recipeScale) || 1);
    const parsed = parsePortionFromName(mealNameEn(meal), slot);
    const base = Math.max(1, Number(parsed.gramsApprox || 0));
    const planned = Math.max(1, Number(meal?.portionGrams || base));
    if (!Number.isFinite(base) || !Number.isFinite(planned)) return 1;
    return Math.max(0.6, Math.min(1.8, planned / base));
  }
  function shoppingPlanDays() {
    return weekDatesByWeekId(currentWeekId()).filter(day=>DAY_SLOTS.some(slot=>Array.isArray(weeklyPlan?.[day]?.[slot])&&weeklyPlan[day][slot].length));
  }
  function buildShoppingListRows() {
    const days = shoppingPlanDays();
    if (!days.length) return { parsed: [], unknown: [] };

    const parsedMap = new Map();
    const unknownMap = new Map();
    const addParsed = (name, unit, qty) => {
      const safeName = String(name || "").trim();
      if (!safeName) return;
      const safeUnit = unit || "portion";
      const safeQty = Math.max(0, Number(qty || 0));
      if (!safeQty) return;
      const key = `${safeName}__${safeUnit}`;
      const prev = parsedMap.get(key) || { name: safeName, unit: safeUnit, qty: 0 };
      prev.qty += safeQty;
      parsedMap.set(key, prev);
    };
    const addUnknown = (name) => {
      const key = String(name || "").trim();
      if (!key) return;
      unknownMap.set(key, (unknownMap.get(key) || 0) + 1);
    };

    days.forEach((dayId) => {
      const plan = weeklyPlan[dayId] || {};
      DAY_SLOTS.forEach((slot) => {
        const meals = Array.isArray(plan?.[slot]) ? plan[slot] : [];
        meals.forEach((m) => {
          if (m.recipeId && Array.isArray(m.ingredients)) {
            const scale = mealScaleFactor(m, slot);
            m.ingredients.forEach(i => addParsed(i.names?.[lang()] || i.names?.en || i.key, 'g', Number(i.grams) * scale));
            return;
          }
          const enName = mealNameEn(m) || mealName(m);
          const parts = splitMealParts(enName);
          const scale = mealScaleFactor(m, slot);
          let matched = 0;

          parts.forEach((part) => {
            const qty = extractQuantity(part);
            const clean = cleanIngredientText(part).toLowerCase();
            if (!clean && !qty) return;

            const rule = ingredientRules.find((x) => x.re.test(clean));
            if (rule) {
              const unit = qty?.unit || rule.unit || "portion";
              const amount = (qty?.qty || rule.qty || 1) * scale;
              addParsed(ingredientLabelByKey(rule.key), unit, amount);
              matched += 1;
              return;
            }

            if (qty && clean) {
              addParsed(toTitleCase(clean), qty.unit, qty.qty * scale);
              matched += 1;
            }
          });

          if (!matched) addUnknown(mealName(m));
        });
      });
    });

    const parsed = [...parsedMap.values()]
      .sort((a, b) => b.qty - a.qty)
      .map((row) => ({
        ...row,
        qty: row.unit === "pcs" ? Math.max(1, Math.round(row.qty)) : Number(row.qty.toFixed(2))
      }));

    const unknown = [...unknownMap.entries()]
      .map(([name, qty]) => ({ name, unit: "portion", qty }))
      .sort((a, b) => b.qty - a.qty);

    return { parsed, unknown };
  }
  function weeklyMacroSummary() {
    const weekId = currentWeekId();
    const days = weekDatesByWeekId(weekId);
    const fallback = normAnalysis(window.currentAnalysis) || {};
    return days.reduce((acc, dayId) => {
      if (!weeklyPlan?.[dayId]) return acc;
      const day = dayTotalsById(dayId, fallback);
      acc.plannedKcal += Number(day.plannedKcal || 0);
      acc.targetKcal += Number(day.targetKcal || 0);
      return acc;
    }, { plannedKcal: 0, targetKcal: 0 });
  }
  function renderShoppingList() {
    const box = document.getElementById("shopping-list-box");
    const sub = document.getElementById("shopping-list-sub");
    const summary = document.getElementById("shopping-week-summary");
    if (!box || !sub) return;

    const week=weekDatesByWeekId(currentWeekId()),days=shoppingPlanDays();
    const words=({
      uk:['Період','Враховано днів меню','Сума запланованих інгредієнтів за вказані дні, без фактичних перекусів із щоденника. Крупи, м’ясо й риба в рецептах зважуються готовими; вівсянка — сухою. Це не автоматичний перерахунок у вагу сирих продуктів.'],
      en:['Period','Menu days included','Planned ingredients summed for these days, excluding actual diary snacks. Recipe grains, meat and fish are weighed cooked; oats dry. This does not automatically convert to raw grocery weights.'],
      de:['Zeitraum','Berücksichtigte Menütage','Summe der geplanten Zutaten dieser Tage, ohne zusätzliche Tagebuch-Snacks. Getreide, Fleisch und Fisch gegart wiegen, Haferflocken trocken. Keine automatische Umrechnung in rohe Einkaufsgewichte.'],
      es:['Periodo','Días de menú incluidos','Suma de ingredientes previstos para estos días, sin tentempiés del diario. Cereales, carne y pescado se pesan cocidos; avena seca. No se convierten automáticamente a peso en crudo.'],
      ru:['Период','Учтено дней меню','Сумма запланированных ингредиентов за эти дни, без фактических перекусов дневника. Крупы, мясо и рыба взвешиваются готовыми; овсянка — сухой. Это не автоматический пересчёт в вес сырых продуктов.'],
      pt:['Período','Dias de menu incluídos','Soma dos ingredientes planeados para estes dias, sem lanches do diário. Cereais, carne e peixe são pesados cozidos; aveia seca. Não há conversão automática para peso cru de compra.']
    })[lang()];
    sub.textContent=`${words[0]}: ${fmtDate(week[0])} – ${fmtDate(week[6])} · ${words[1]}: ${days.length} / 7`;
    sub.dataset.menuDays=String(days.length);
    let note=document.getElementById('shopping-weight-note');if(!note){note=document.createElement('p');note.id='shopping-weight-note';note.className='nutrition-week-sub';sub.after(note);}note.textContent=words[2];

    const totals = weeklyMacroSummary();
    if (summary) {
      summary.innerHTML = `<div style="display:flex; flex-wrap:wrap; gap:10px; font-size:11px; color:#ddd; margin-top:6px;">
        <span style="color:#FFC72C; font-weight:700;">${t("shoppingWeekTotals")}:</span>
        <span>${t("shoppingPlanned")}: <strong style="color:#fff;">${Math.round(totals.plannedKcal)} kcal</strong></span>
        <span>${t("shoppingTarget")}: <strong style="color:#fff;">${Math.round(totals.targetKcal)} kcal</strong></span>
      </div>`;
    }

    const rows = buildShoppingListRows();
    if (!rows.parsed.length && !rows.unknown.length) {
      box.innerHTML = `<div class="nutrition-week-empty">${t("shoppingEmpty")}</div>`;
      return;
    }

    const escapeText=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const parsedHtml = rows.parsed.map((r) => {
      let qtyText = "";
      if (r.unit === "kg") qtyText = `${Math.round(Number(r.qty || 0) * 1000)} g`;
      else if (r.unit === "l") qtyText = `${Math.round(Number(r.qty || 0) * 1000)} ml`;
      else if (r.unit === "pcs") qtyText = `${Math.round(Number(r.qty || 0))} ${t("shoppingPcs")}`;
      else if (r.unit === "g") qtyText = `${Math.round(Number(r.qty || 0))} ${recipeText()[2]}`;
      else if (r.unit === "ml") qtyText = `${Math.round(Number(r.qty || 0))} ml`;
      else qtyText = `${Number(r.qty || 0).toFixed(1)} ${t("shoppingPortions")}`;
      return `<div style="display:flex; justify-content:space-between; gap:10px; padding:7px 0; border-bottom:1px solid #1b1b1b;">
        <span style="color:#ddd; font-size:12px;">${escapeText(r.name)}</span>
        <strong style="color:#FFC72C; font-size:12px;">~ ${qtyText}</strong>
      </div>`;
    }).join("");

    const unknownHtml = rows.unknown.length
      ? `<div style="margin-top:10px; padding-top:10px; border-top:1px dashed #2a2a2a;">
          <div style="font-size:11px; color:#FFC72C; margin-bottom:6px;">${t("shoppingUnknown")}</div>
          ${rows.unknown.map((r) => `<div style="display:flex; justify-content:space-between; gap:10px; padding:6px 0; border-bottom:1px solid #171717;">
            <span style="color:#888; font-size:11px;">${escapeText(r.name)}</span>
            <strong style="color:#888; font-size:11px;">${r.qty} ${t("shoppingPortions")}</strong>
          </div>`).join("")}
        </div>`
      : `<div style="margin-top:10px; font-size:11px; color:#777;">${t("shoppingUnknownEmpty")}</div>`;

    box.innerHTML = parsedHtml + unknownHtml;
  }

  function applyBirthMask() {
    const input = document.getElementById("user-birthdate");
    if (!input) return;
    input.type = "text";
    input.placeholder = t("birthPh");
    input.addEventListener("input", (e) => {
      let v = e.target.value.replace(/\D/g, "").slice(0, 8);
      if (v.length >= 5) v = `${v.slice(0,2)}/${v.slice(2,4)}/${v.slice(4)}`;
      else if (v.length >= 3) v = `${v.slice(0,2)}/${v.slice(2)}`;
      e.target.value = v;
    });
  }

  function modeByBmi(bmi) {
    if (bmi < 20.5) return { code: "mg", color: "#00BFFF", mod: 1.15, p: 0.25, f: 0.25, c: 0.50 };
    if (bmi < 25.5) return { code: "af", color: "#FFC72C", mod: 1.0, p: 0.30, f: 0.25, c: 0.45 };
    return { code: "wl", color: "#DA3E52", mod: 0.8, p: 0.35, f: 0.25, c: 0.40 };
  }
  function modeLabel(code) { if (code === "mg") return t("modeMg"); if (code === "wl") return t("modeWl"); return t("modeAf"); }
  function normMode(raw) { const v = String(raw || "").toLowerCase(); if (v.includes("muscle") || v.includes("м") || v.includes("мыш")) return "mg"; if (v.includes("loss") || v.includes("вес") || v.includes("контроль")) return "wl"; return "af"; }
  function normAnalysis(a) {
    if (!a || typeof a !== "object") return null;
    const code = a.modeCode || normMode(a.mode);
    const out = { ...a, modeCode: code, statusColor: a.statusColor || modeByBmi(Number(a.bmi || 0)).color, weight: Number(a.weight || 0), bmi: Number(a.bmi || 0), age: Number(a.age || 0), targetKcal: Number(a.targetKcal || 0), water: Number(a.water || 0), p: Number(a.p || 0), f: Number(a.f || 0), c: Number(a.c || 0) };
    if (!out.water && out.weight) out.water = Number((out.weight * 0.035).toFixed(1));
    return out;
  }

  function totals(an) {
    const actual=window.PACFoodDiary?.projection();
    const eaten = actual ? {k:actual.kcal,p:actual.p,f:actual.f,c:actual.c} : sumPlanNutrients(currentDailyPlan, { onlyEaten: true });
    const targets = activeDayTargets(an);
    const left = {
      k: Math.max(0, Math.round(targets.k - eaten.k)),
      p: Math.max(0, Math.round(targets.p - eaten.p)),
      f: Math.max(0, Math.round(targets.f - eaten.f)),
      c: Math.max(0, Math.round(targets.c - eaten.c))
    };
    if(actual)for(const k of ['p','f','c'])if(actual.unknown[k])left[k]=null;
    if(window.PACFoodDiary&&!window.PACFoodDiary.isReady())for(const k of ['k','p','f','c'])left[k]=null;
    return { eaten, left, targets };
  }

  function updateFooter(an, left, targets = null) {
    const totalEl = document.getElementById("total-daily-kcal");
    const leftEl = document.getElementById("calories-left");
    const bjuEl = document.getElementById("bju-left-display");
    if (!an) {
      if (totalEl) totalEl.textContent = "";
      if (leftEl) leftEl.textContent = "";
      if (bjuEl) bjuEl.textContent = "";
      return;
    }
    const goal = targets || activeDayTargets(an);
    if (totalEl) totalEl.textContent = `${t("saved")}: ${Math.round(goal.k)} kcal`;
    if (leftEl) leftEl.textContent = `${t("left")}: ${left.k??'—'} kcal`;
    if (bjuEl) bjuEl.textContent = `${t("p")}: ${left.p??'—'}g | ${t("f")}: ${left.f??'—'}g | ${t("c")}: ${left.c??'—'}g`;
  }

  function diffHtml(list) {
    if (!Array.isArray(list) || list.length < 2) return "";
    const cur = Number(list[0]?.weight || 0);
    const prev = Number(list[1]?.weight || 0);
    if (!cur || !prev) return "";
    const d = Number((cur - prev).toFixed(1));
    if (d > 0) return `<div style="color:#DA3E52; font-size:11px; font-weight:700;">+${d} kg ${t("up")}</div>`;
    if (d < 0) return `<div style="color:#00FF7F; font-size:11px; font-weight:700;">${d} kg ${t("down")}</div>`;
    return `<div style="color:#666; font-size:11px;">0.0 kg ${t("stable")}</div>`;
  }

  function animateValue(node, start, end, duration, suffix = "", decimals = 1) {
    if (!node) return;
    let st = null;
    const step = (ts) => {
      if (!st) st = ts;
      const p = Math.min((ts - st) / duration, 1);
      node.textContent = `${Number(start + ((end - start) * p)).toFixed(decimals)}${suffix}`;
      if (p < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }


  function getWeightTrendCode(list) {
    if (!Array.isArray(list) || list.length < 2) return "stable";
    const cur = Number(list[0]?.weight || 0);
    const prev = Number(list[1]?.weight || 0);
    if (!cur || !prev) return "stable";
    const d = Number((cur - prev).toFixed(1));
    if (d > 0.2) return "up";
    if (d < -0.2) return "down";
    return "stable";
  }

  function renderScanExplain(an, list) {
    const box = document.getElementById("weight-scan-explain");
    if (!box) return;
    if (!an) {
      box.innerHTML = `<div class="scan-explain"><div class="scan-explain-empty">${t("scanAwaiting")}</div></div>`;
      return;
    }

    const bmi = Number(an.bmi || 0).toFixed(1);
    const water = Number(an.water || 0).toFixed(1);
    const recommendationText = Number(an.bmi || 0) < 20.5 ? t("scanRecoLow") : (Number(an.bmi || 0) < 25.5 ? t("scanRecoNormal") : t("scanRecoHigh"));
    const trendCode = getWeightTrendCode(list);
    const trendText = trendCode === "up" ? t("scanTipTrendUp") : (trendCode === "down" ? t("scanTipTrendDown") : t("scanTipTrendStable"));
    const tips = [
      tf("scanTipProtein", { protein: Math.round(Number(an.p || 0)) }),
      t("scanTipSleep"),
      t("scanTipTiming"),
      trendText
    ];

    box.innerHTML = `
      <div class="scan-explain">
        <div class="scan-explain-title">${t("scanPanelTitle")}</div>
        <div class="scan-explain-grid">
          <div class="scan-explain-metric"><span>${t("scanBmi")}</span><strong>${bmi}</strong></div>
          <div class="scan-explain-metric"><span>${t("scanCurrentState")}</span><strong>${modeLabel(an.modeCode)}</strong></div>
          <div class="scan-explain-metric"><span>${t("scanHydration")}</span><strong>\uD83D\uDCA7 ${water} L</strong></div>
        </div>
        <div class="scan-explain-section">
          <h4>${t("scanRecommendation")}</h4>
          <p>${recommendationText}</p>
        </div>
        <div class="scan-explain-section">
          <h4>${t("scanExtras")}</h4>
          <p>${tf("scanWaterInfo", { water })}</p>
          <ul class="scan-explain-list">${tips.map((tip) => `<li>${tip}</li>`).join("")}</ul>
        </div>
      </div>`;
  }

  function updateUI() {
    if(currentUserId)window.PACFoodDiary?.connect({uid:currentUserId,authUid:firebase.auth().currentUser?.uid,date:activeDayId||todayId(),readOnly:isDelegatedReadOnly,plan:currentDailyPlan,targetKcal:activeDayTargets(window.currentAnalysis||{}).k,slot:activeTab,changed:updateUI,dateChanged:date=>{activeDayId=date;currentDailyPlan=sanitizePlan(weeklyPlan[date]||{});renderMealList();updateUI();}});
    if(window.PACFoodDiary?.isReady())renderMealList();
    const an = window.currentAnalysis ? normAnalysis(window.currentAnalysis) : null;
    const list = window.latestHistoryArray || [];
    const w = an?.weight || Number(list[0]?.weight || 0) || null;
    const bmi = an?.bmi || Number(list[0]?.bmi || 0) || null;
    const color = an?.statusColor || "#FFC72C";

    const top = document.getElementById("athlete-recommendation-box");
    if (top) {
      if (an) {
        const { left, targets } = totals(an);
        top.innerHTML = `<div style="background:#000; padding:18px; border-radius:15px; border:1px solid #FFC72C; box-shadow:0 0 10px rgba(255,199,44,0.1);"><div style="font-size:10px; color:${an.statusColor}; text-transform:uppercase; font-weight:700; margin-bottom:12px;">${t("analytics")} | ${modeLabel(an.modeCode)}</div><div style="display:flex; justify-content:space-between; align-items:flex-end; gap:10px;"><div><div class="kcal-anim" style="font-size:36px; color:#fff; font-weight:900; line-height:1;">0</div><div style="font-size:11px; color:#FFC72C; font-weight:600; margin-top:5px;">${t("kcalLeft")}</div></div><div style="text-align:right;"><div style="font-size:18px; color:#fff; font-weight:800;">\uD83D\uDCA7 ${Number(an.water || 0).toFixed(1)}L</div></div></div><div style="display:flex; gap:10px; margin-top:20px; padding-top:15px; border-top:1px solid #1a1a1a;"><div style="flex:1; text-align:center;"><div style="font-size:8px; color:#666;">${t("p")}</div><div class="p-anim" style="font-size:14px; color:#fff; font-weight:800;">0g</div></div><div style="flex:1; text-align:center;"><div style="font-size:8px; color:#666;">${t("f")}</div><div class="f-anim" style="font-size:14px; color:#fff; font-weight:800;">0g</div></div><div style="flex:1; text-align:center;"><div style="font-size:8px; color:#666;">${t("c")}</div><div class="c-anim" style="font-size:14px; color:#fff; font-weight:800;">0g</div></div></div></div>`;
        for(const [selector,key,suffix]of [['.kcal-anim','k',''],['.p-anim','p','g'],['.f-anim','f','g'],['.c-anim','c','g']]){const node=top.querySelector(selector);if(left[key]===null)node.textContent='—';else animateValue(node,0,left[key],700,suffix,0);}
        updateFooter(an, left, targets);
      } else {
        top.innerHTML = `<div style="padding:25px; text-align:center; color:#555; border:1px dashed #333; border-radius:15px; background:rgba(255,199,44,0.02);"><div style="font-size:11px; letter-spacing:1px; font-weight:600;">${t("noScan")}</div></div>`;
        updateFooter(null);
      }
    }

    const circle = document.getElementById("fat-percentage-value");
    if (circle) {
      circle.innerHTML = `<div style="text-align:center;"><span style="font-size:9px; color:#666; display:block; letter-spacing:1px; font-weight:700;">${an ? t("today") : t("last")}</span><span class="w-anim" style="font-size:34px; color:#FFC72C; font-weight:bold; line-height:1;">0</span><div style="height:14px; margin:2px 0;">${diffHtml(list)}</div><span style="font-size:11px; color:${color}; display:block; font-weight:600;">BMI: ${bmi ? Number(bmi).toFixed(1) : "--"}</span></div>`;
      if (w != null) animateValue(circle.querySelector(".w-anim"), 0, Number(w), 1000, "kg", 1);
    }
    renderScanExplain(an, list);
    renderWeekDayBar();
    renderShoppingList();
  }
  function renderProfile(height, birth) {
    const ageEl = document.getElementById("display-age");
    const hEl = document.getElementById("display-height");
    const a = age(birth);
    if (ageEl) ageEl.textContent = a == null ? "--" : String(a);
    if (hEl) hEl.textContent = `${Number(height)} cm`;
    const display = document.getElementById("stats-display");
    const inputs = document.getElementById("stats-inputs");
    if (display) display.style.display = "block";
    if (inputs) inputs.style.display = "none";
  }

  window.enableEditStats = function () {
    const display = document.getElementById("stats-display");
    const inputs = document.getElementById("stats-inputs");
    if (display) display.style.display = "none";
    if (inputs) inputs.style.display = "flex";
  };

  window.autoSaveProfile = async function () {
    if (!currentUserId) return;
    if (!canWriteWeightData()) return;
    const hEl = document.getElementById("user-height");
    const bEl = document.getElementById("user-birthdate");
    if (!hEl || !bEl) return;
    const h = Number(hEl.value || 0);
    const b = String(bEl.value || "").trim();
    if (!h || !b) return;

    try {
      await db.collection("users").doc(currentUserId).set({ height: h, birthdate: b }, { merge: true });
      clearTimeout(window.profileTimer);
      window.profileTimer = setTimeout(() => renderProfile(h, b), 250);
    } catch (e) {
      console.error("profile save", e);
      alert(t("profileErr"));
    }
  };

  window.loadBaseData = async function () {
    if (!currentUserId) return;
    try {
      const doc = await db.collection("users").doc(currentUserId).get();
      if (!doc.exists) return;
      const data = doc.data() || {};
      const hEl = document.getElementById("user-height");
      const bEl = document.getElementById("user-birthdate");
      if (hEl && data.height) hEl.value = Number(data.height);
      if (bEl && data.birthdate) bEl.value = normBirthInput(data.birthdate);
      setSportContext(data.sportType || data.sport || data?.onboarding?.summary?.sport || "");
      if (data.height && data.birthdate) renderProfile(Number(data.height), String(data.birthdate));
    } catch (e) {
      console.error("load base", e);
      setSportContext("");
    }
  };

  const scanFormVisible = (v) => { const card = document.querySelector(".form-card"); if (card) card.style.display = v ? "block" : "none"; };
  const planControlsVisible = (v) => {
    const sel = document.querySelector(".speed-selector");
    const btn = document.getElementById("get-diet-plan-btn");
    if (sel) sel.style.display = v ? "flex" : "none";
    if (btn) btn.style.display = v ? "block" : "none";
  };
  const tabsVisible = (v) => { const tabs = document.getElementById("diet-tabs-wrapper"); if (tabs) tabs.style.display = v ? "block" : "none"; };
  const setAuthPending = (pending) => {
    const on = Boolean(pending);
    if (document.body) document.body.classList.toggle("weight-auth-pending", on);
    const bodySection = document.getElementById("body-params-section");
    const dietSection = document.getElementById("diet-section");
    if (bodySection) bodySection.style.visibility = on ? "hidden" : "visible";
    if (dietSection) dietSection.style.visibility = on ? "hidden" : "visible";
  };

  async function onAnalyze(e) {
    if (e) e.preventDefault();
    if (savingWeight || !currentUserId) return;
    if (!canWriteWeightData()) return;
    const w = Number(document.getElementById("weight-value")?.value || 0);
    const h = Number(document.getElementById("user-height")?.value || 0);
    const b = String(document.getElementById("user-birthdate")?.value || "").trim();
    const a = age(b);
    if (!Number.isFinite(w) || w <= 0 || !Number.isFinite(h) || h <= 0 || a == null) {
      alert(`${t("fillAlert")} ${t("birthHint")}`);
      return;
    }

    const bmi = Number((w / ((h / 100) ** 2)).toFixed(1));
    const mode = modeByBmi(bmi);
    const bmr = (10 * w) + (6.25 * h) - (5 * a) + 5;
    const kcal = Math.round(bmr * 1.55 * mode.mod);

    const analysis = {
      modeCode: mode.code,
      statusColor: mode.color,
      weight: w,
      bmi,
      age: a,
      targetKcal: kcal,
      water: Number((w * 0.035).toFixed(1)),
      p: Math.round((kcal * mode.p) / 4),
      f: Math.round((kcal * mode.f) / 9),
      c: Math.round((kcal * mode.c) / 4)
    };

    savingWeight = true;
    const submit=document.getElementById('weight-btn-save-analyze');if(submit)submit.disabled=true;
    const owner=currentUserId;
    try {
    if (!await saveHistory(w, bmi, analysis)) return;
    if (owner !== currentUserId || firebase.auth().currentUser?.uid !== owner) return;
    window.currentAnalysis = analysis;
    setScanMarker(currentUserId, todayId());
    weeklyPlan = {};
    activeDayId = null;
    scanFormVisible(false);
    planControlsVisible(true);
    tabsVisible(false);
    renderWeekDayBar();
    renderShoppingList();

    await loadHistory();
    updateUI();
    window.dispatchEvent(new CustomEvent('pac:profile-updated',{detail:{userId:owner}}));
    } finally { savingWeight=false;if(submit)submit.disabled=isDelegatedReadOnly; }
  }

  async function saveHistory(weight, bmi, analysis) {
    if (!currentUserId) return;
    if (!canWriteWeightData({ notify: false })) return;
    try {
      const id = `${currentUserId}_${todayId()}`;
      await db.collection(COL_WEIGHT).doc(id).set({ userId: currentUserId, source: "manual", date: todayId(), weight, bmi, analysis: normAnalysis(analysis), timestamp: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
      return true;
    } catch (e) {
      console.error("save history", e);
      alert(t("saveHistErr"));
      return false;
    }
  }

  function applyScanState() {
    const latest = Array.isArray(window.latestHistoryArray) ? window.latestHistoryArray[0] : null;
    const markerToday = Boolean(currentUserId) && localStorage.getItem(scanKeyForUid(currentUserId)) === todayId();
    const planToday = latestPlanDateId === todayId();
    const hasTodayScan = (latest && latest.date === todayId()) || markerToday || planToday;
    if (hasTodayScan) {
      const latestAnalysis = latest && latest.analysis ? latest.analysis : null;
      window.currentAnalysis = normAnalysis(latestAnalysis || window.currentAnalysis);
      setScanMarker(currentUserId, todayId());
      if (window.currentAnalysis) {
        scanFormVisible(false);
        planControlsVisible(true);
      } else {
        scanFormVisible(true);
        planControlsVisible(false);
      }
    } else {
      clearScanMarker(currentUserId);
      scanFormVisible(true);
      planControlsVisible(Boolean(window.currentAnalysis));
    }
  }

  async function loadHistory({ refreshUi = true } = {}) {
    if (!currentUserId) return;
    const box = document.getElementById("weight-history-list");
    if (box) box.innerHTML = `<div style="color:#444; font-size:11px; text-align:center; padding:10px;">${t("histLoad")}</div>`;

    try {
      const snap = await db.collection(COL_WEIGHT).where("userId", "==", currentUserId).orderBy("date", "desc").limit(20).get();
      if (snap.empty) {
        window.latestHistoryArray = [];
        if (box) box.innerHTML = `<div style="color:#444; font-size:11px; text-align:center; padding:10px;">${t("histEmpty")}</div>`;
        if (weightChart) {
          weightChart.data.labels = [];
          weightChart.data.datasets[0].data = [];
          weightChart.update("none");
        }
        if (refreshUi) {
          applyScanState();
          updateUI();
        }
        return;
      }

      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      window.latestHistoryArray = docs;

      if (weightChart) {
        const chartDocs = [...docs].reverse();
        weightChart.data.labels = chartDocs.map((r) => fmtShort(r.date));
        weightChart.data.datasets[0].data = chartDocs.map((r) => Number(r.weight || 0));
        weightChart.update("none");
      }

      if (box) {
        box.innerHTML = docs.map((r) => `
          <div style="display:flex; justify-content:space-between; align-items:center; gap:10px; padding:10px 0; border-bottom:1px solid #1a1a1a;">
            <div style="flex:1; min-width:0;">
              <div style="color:#fff; font-size:12px; font-weight:600;">${fmtDate(r.date)}</div>
              <div style="color:#666; font-size:9px;">BMI: ${r.bmi ? Number(r.bmi).toFixed(1) : "--"}</div>
            </div>
            <div style="flex:0 0 auto; color:#FFC72C; font-weight:800; font-size:14px;">${r.weight ? Number(r.weight).toFixed(1) : "--"} kg</div>
            <button onclick="window.deleteWeightRecord('${r.id}')" title="${t("del")}" style="background:transparent; border:none; color:#DA3E52; cursor:pointer; font-size:16px; line-height:1; padding:4px 8px;">×</button>
          </div>`).join("");
      }

      if (refreshUi) {
        applyScanState();
        updateUI();
      }
    } catch (e) {
      console.error("history", e);
      if (box) box.innerHTML = `<div style="color:#DA3E52; font-size:11px; text-align:center; padding:10px;">${t("histErr")}</div>`;
    }
  }

  window.deleteWeightRecord = async function (id) {
    if (!canWriteWeightData()) return;
    if (!confirm(t("delRecQ"))) return;
    try {
      await db.collection(COL_WEIGHT).doc(id).delete();
      await clearNutritionMenu();
      window.currentAnalysis = null;
      currentDailyPlan = { brf: [], lnc: [], din: [] };
      tabsVisible(false);
      planControlsVisible(true);
      scanFormVisible(true);
      await loadHistory();
      updateUI();
    } catch (e) {
      console.error("delete record", e);
      alert(t("delRecErr"));
    }
  };
  const normSpeed = (s) => (s === "Hard" ? "Hard" : (s === "Medium" ? "Medium" : "Easy"));
  const speedBtnId = (s) => (s === "Hard" ? "weight-speed-hard" : (s === "Medium" ? "weight-speed-medium" : "weight-speed-easy"));

  function applySpeedUi(s) {
    document.querySelectorAll(".speed-selector .speed-btn").forEach((b) => {
      b.style.background = "#222";
      b.style.color = "#fff";
      b.classList.remove("active");
    });
    const btn = document.getElementById(speedBtnId(s));
    if (btn) {
      btn.style.background = "#FFC72C";
      btn.style.color = "#000";
      btn.classList.add("active");
    }
  }

  window.setSpeed = function (s) {
    selectedSpeed = normSpeed(s);
    speedExplicitlyChosen = true;
    applySpeedUi(selectedSpeed);
    updateNutritionTitle();
  };

  const sanitizeMeal = (m) => {
    const raw = m && typeof m === "object" ? m : {};
    const api = dietI18n();
    const normalized = (api && typeof api.normalizeMeal === "function") ? api.normalizeMeal(raw) : raw;
    const portion = parsePortionFromName(String(normalized?.name_en || normalized?.name || ""), "brf");
    return {
      ...normalized,
      uid: normalized.uid || Math.random().toString(36).slice(2),
      name: fix(normalized.name || t("meal")),
      eaten: Boolean(normalized.eaten),
      kcal: Number(normalized.kcal || Math.round((Number(normalized.p || 0) * 4) + (Number(normalized.f || 0) * 9) + (Number(normalized.c || 0) * 4))),
      portionUnit: String(normalized.portionUnit || portion.unit || "g"),
      portionValue: Number(normalized.portionValue || portion.value || 0),
      portionGrams: Number(normalized.portionGrams || portion.gramsApprox || 0)
    };
  };
  const sanitizeMeta = (meta) => {
    const m = meta && typeof meta === "object" ? meta : {};
    return {
      status: String(m.status || "TRAIN").toUpperCase(),
      weekId: String(m.weekId || currentWeekId()),
      targetKcal: Math.max(0, Number(m.targetKcal || m.dayKcal || 0)),
      plannedKcal: Math.max(0, Number(m.plannedKcal || 0)),
      targetP: Math.max(0, Number(m.targetP || 0)),
      targetF: Math.max(0, Number(m.targetF || 0)),
      targetC: Math.max(0, Number(m.targetC || 0)),
      plannedP: Math.max(0, Number(m.plannedP || 0)),
      plannedF: Math.max(0, Number(m.plannedF || 0)),
      plannedC: Math.max(0, Number(m.plannedC || 0))
    };
  };
  const sanitizePlan = (p) => {
    const out = {
      brf: (p?.brf || []).map(sanitizeMeal),
      lnc: (p?.lnc || []).map(sanitizeMeal),
      din: (p?.din || []).map(sanitizeMeal)
    };
    if (p?._meta && typeof p._meta === "object") out._meta = sanitizeMeta(p._meta);
    return out;
  };

  function isPreferredMeal(meal) {
    const label = String(mealName(meal) || "").toLowerCase();
    const avoid = [
      "borscht", "борщ", "голуб", "cabbage roll", "chakhokhbili", "чахохб",
      "zrazy", "зраз", "ramen", "рамен", "заливн"
    ];
    return !avoid.some((x) => label.includes(x));
  }

  function applyMealScale(meal, scale, slot) {
    const safeScale = Math.max(0.8, Math.min(1.35, Number(scale || 1)));
    const next = sanitizeMeal(meal);
    const parsed = parsePortionFromName(mealNameEn(next), slot);
    const baseUnit = String(next.portionUnit || parsed.unit || "g");
    const baseValue = Number(next.portionValue || parsed.value || defaultPortionBySlot(slot));
    const baseGrams = Number(next.portionGrams || parsed.gramsApprox || defaultPortionBySlot(slot));

    next.kcal = Math.max(0, Math.round(Number(next.kcal || 0) * safeScale));
    next.p = Math.max(0, Math.round(Number(next.p || 0) * safeScale));
    next.f = Math.max(0, Math.round(Number(next.f || 0) * safeScale));
    next.c = Math.max(0, Math.round(Number(next.c || 0) * safeScale));
    next.portionUnit = baseUnit;
    next.portionValue = roundUnitValue(baseValue * safeScale, baseUnit);
    next.portionGrams = Math.max(0, Math.round(baseGrams * safeScale));
    if (next.recipeId) next.recipeScale = (Number(next.recipeScale) || 1) * safeScale;
    return next;
  }
  function pickMealsByTarget(key, target, speed, usedMealKeys = new Set(), options = {}) {
    const src = (Array.isArray(dietDatabase?.[key]) ? dietDatabase[key] : []).filter(m=>!window.PACSportRecipes || window.PACSportRecipes.allows(m,nutritionPreferences));
    if (!src.length) throw Object.assign(new Error('No matching recipes'),{code:'nutrition-empty'});
    let pool = src.filter((x) => String(x.speed || "") === speed);
    if (!pool.length) throw Object.assign(new Error('No matching preparation time'),{code:'nutrition-empty'});

    const status = String(options?.status || "TRAIN").toUpperCase();
    const slot = String(options?.slot || "brf");
    const proPool = pool.filter((m) => isProfessionalMeal(m, { status, slot }));
    if (proPool.length) pool = proPool;

    if (status === "MD" || status === "MD-1") {
      const lean = pool.filter((m) => !isHeavyMealForPreMatch(m));
      if (lean.length >= 3) pool = lean;

      const fuel = pool.filter((m) => isMatchFuelMeal(m));
      if (fuel.length >= 3) pool = fuel;
    }
    if (status === "MD+1" || status === "MD+2") {
      const recoveryPool = pool.filter((m) => !isHeavyMealForPreMatch(m));
      if (recoveryPool.length >= 3) pool = recoveryPool;
    }

    const preferred = pool.filter(isPreferredMeal);
    if (preferred.length >= 12) {
      const fallback = pool.filter((x) => !isPreferredMeal(x)).slice(0, 6);
      pool = [...preferred, ...fallback];
    }

    const unused=pool.filter(m=>!usedMealKeys.has(mealNameEn(m).toLowerCase()));
    if(unused.length)pool=unused;
    const candidates = pool
      .map((x) => sanitizeMeal({ ...x, uid: null, eaten: false }))
      .filter((x) => Number(x.kcal || 0) > 0);
    if (!candidates.length) return [];

    const slotKcal = Math.max(0, Number(target?.kcal || 0));
    const desiredMealCount = (() => {
      // Keep generation fast on web: default 2 meals, 3 only for hard/high-calorie slots.
      if (!pool.every(m=>m.recipeId) && selectedSpeed === "Hard" && slotKcal >= 620) return 3;
      return 2;
    })();
    const desiredPerMeal = Math.max(1, desiredMealCount) ? (slotKcal / Math.max(1, desiredMealCount)) : slotKcal;

    const candidatesWithKey = candidates.map((m) => ({
      ...m,
      __keyName: mealNameEn(m).toLowerCase()
    }));

    // Limit search space to keep UI responsive while preserving quality.
    const searchLimit = selectedSpeed === "Hard" ? 16 : 12;
    const searchPool = [...candidatesWithKey]
      .sort((a, b) => {
        const aMacro = Math.abs(Number(a.p || 0) - (Number(target?.p || 0) / Math.max(1, desiredMealCount)))
          + Math.abs(Number(a.f || 0) - (Number(target?.f || 0) / Math.max(1, desiredMealCount)))
          + Math.abs(Number(a.c || 0) - (Number(target?.c || 0) / Math.max(1, desiredMealCount)));
        const bMacro = Math.abs(Number(b.p || 0) - (Number(target?.p || 0) / Math.max(1, desiredMealCount)))
          + Math.abs(Number(b.f || 0) - (Number(target?.f || 0) / Math.max(1, desiredMealCount)))
          + Math.abs(Number(b.c || 0) - (Number(target?.c || 0) / Math.max(1, desiredMealCount)));
        const aScore = Math.abs(Number(a.kcal || 0) - desiredPerMeal) + (aMacro * 1.2) + (usedMealKeys.has(a.__keyName) ? 120 : 0);
        const bScore = Math.abs(Number(b.kcal || 0) - desiredPerMeal) + (bMacro * 1.2) + (usedMealKeys.has(b.__keyName) ? 120 : 0);
        return aScore - bScore;
      })
      .slice(0, searchLimit);

    const evalCombo = (combo) => {
      const sum = combo.reduce((acc, m) => ({
        k: acc.k + Number(m.kcal || 0),
        p: acc.p + Number(m.p || 0),
        f: acc.f + Number(m.f || 0),
        c: acc.c + Number(m.c || 0)
      }), { k: 0, p: 0, f: 0, c: 0 });

      const kcalDiff = Math.abs(sum.k - Number(target?.kcal || 0));
      const pDiff = Math.abs(sum.p - Number(target?.p || 0));
      const fDiff = Math.abs(sum.f - Number(target?.f || 0));
      const cDiff = Math.abs(sum.c - Number(target?.c || 0));
      const macroKcalPenalty = (pDiff * 4) + (fDiff * 9) + (cDiff * 4);

      const repeatPenalty = combo.reduce((acc, m) => {
        return acc + (usedMealKeys.has(m.__keyName) ? 140 : 0);
      }, 0);

      const countPenalty = Math.abs(combo.length - desiredMealCount) * 70;
      return { sum, score: kcalDiff + (macroKcalPenalty * 0.12) + repeatPenalty + countPenalty };
    };

    let best = null;
    const pick = (combo) => {
      const ranked = evalCombo(combo);
      if (!best || ranked.score < best.score) best = { combo, ...ranked };
    };
    const comboStart = perfNow();
    const comboBudgetMs = selectedSpeed === "Hard" ? 15 : 9;
    const overBudget = () => (perfNow() - comboStart) >= comboBudgetMs;

    for (let i = 0; i < searchPool.length; i += 1) {
      if (overBudget()) break;
      pick([searchPool[i]]);
    }
    if (desiredMealCount >= 2 && searchPool.length > 1) {
      outerPair:
      for (let i = 0; i < searchPool.length; i += 1) {
        if (overBudget()) break outerPair;
        for (let j = i + 1; j < searchPool.length; j += 1) {
          if (overBudget()) break outerPair;
          const a = searchPool[i];
          const b = searchPool[j];
          if (a.__keyName === b.__keyName) continue;
          pick([a, b]);
        }
      }
    }
    if (desiredMealCount >= 3 && searchPool.length > 2) {
      const pool3 = searchPool.slice(0, Math.min(searchPool.length, 14));
      outerTri:
      for (let i = 0; i < pool3.length; i += 1) {
        if (overBudget()) break outerTri;
        for (let j = i + 1; j < pool3.length; j += 1) {
          if (overBudget()) break outerTri;
          for (let k = j + 1; k < pool3.length; k += 1) {
            if (overBudget()) break outerTri;
            const a = pool3[i];
            const b = pool3[j];
            const c = pool3[k];
            const keys = new Set([
              a.__keyName,
              b.__keyName,
              c.__keyName
            ]);
            if (keys.size < 3) continue;
            pick([a, b, c]);
          }
        }
      }
    }
    const out = (best?.combo || [searchPool[0]]).map((m) => sanitizeMeal({ ...m, uid: null, eaten: false }));
    const baseK = Math.max(1, out.reduce((acc, m) => acc + Number(m.kcal || 0), 0));
    const desiredK = Math.max(0, Number(target?.kcal || 0));
    const scale = desiredK > 0 ? desiredK / baseK : 1;
    const scaled = out.map((m) => applyMealScale(m, scale, slot));

    // Never invent calories/carbs to close a target gap: recipes must match their ingredients.
    if (scaled.length && !scaled.some(m => m.recipeId)) {
      const afterK = scaled.reduce((acc, m) => acc + Number(m.kcal || 0), 0);
      const deltaK = Math.round(desiredK - afterK);
      if (Math.abs(deltaK) >= 5) {
        scaled[scaled.length - 1].kcal = Math.max(0, Math.round(Number(scaled[scaled.length - 1].kcal || 0) + deltaK));
        const deltaC = Math.round(deltaK / 4);
        scaled[scaled.length - 1].c = Math.max(0, Math.round(Number(scaled[scaled.length - 1].c || 0) + deltaC));
      }
    }
    scaled.forEach((m) => usedMealKeys.add(mealNameEn(m).toLowerCase()));
    return scaled;
  }
  function setActiveDay(dayId, { forceSave = false } = {}) {
    const day = String(dayId || "");
    if (!day || !weeklyPlan[day]) return;
    activeDayId = day;
    currentDailyPlan = sanitizePlan(weeklyPlan[day] || {});
    weeklyPlan[day] = currentDailyPlan;
    renderWeekDayBar();
    switchDietTab(activeTab);
    updateUI();
    if (forceSave) savePlan();
  }

  function renderWeekDayBar() {
    const box = document.getElementById("diet-week-days");
    const statusEl = document.getElementById("diet-active-day-status");
    const dateEl = document.getElementById("diet-active-day-date");
    const kcalEl = document.getElementById("diet-active-day-kcal");
    if (!box) return;

    const days = weekDatesByWeekId(currentWeekId());
    if (!days.length) {
      box.innerHTML = "";
      if (statusEl) statusEl.textContent = "—";
      if (dateEl) dateEl.textContent = "—";
      if (kcalEl) kcalEl.textContent = "—";
      return;
    }

    if (!activeDayId) activeDayId = days.includes(todayId())?todayId():days[0];

    box.innerHTML = days.map((id) => {
      const active = id === activeDayId;
      const status = String(weeklyStatuses[id] || "TRAIN").toUpperCase();
      return `<button type="button" data-day-id="${id}" class="speed-btn"
        style="min-width:72px; padding:8px 10px; border:1px solid ${active ? "#FFC72C" : "#333"}; background:${active ? "rgba(255,199,44,0.14)" : "#111"}; color:${active ? "#FFC72C" : "#aaa"}; border-radius:8px; font-size:10px; font-weight:700; cursor:pointer;">
        <div>${dayShort(id)}</div>
        <div style="font-size:9px; opacity:.85;">${status}</div>
      </button>`;
    }).join("");

    box.querySelectorAll("[data-day-id]").forEach((btn) => {
      btn.addEventListener("click", () => setActiveDay(btn.getAttribute("data-day-id"), { forceSave: true }));
    });

    if (statusEl) {
      const st = String(weeklyStatuses[activeDayId] || "TRAIN").toUpperCase();
      const preset = statusNutritionPreset(st);
      statusEl.textContent = `${t("dayStatus")}: ${st} • ${preset.label}`;
    }
    if (dateEl) dateEl.textContent = fmtDate(activeDayId);
    if (kcalEl) {
      const day = dayTotalsById(activeDayId, normAnalysis(window.currentAnalysis) || {});
      kcalEl.textContent = `${t("dayKcal")}: ${Math.round(day.plannedKcal)} / ${Math.round(day.targetKcal)} kcal`;
    }
  }

  async function buildWeeklyPlanFromAnalysis(baseAnalysis) {
    const source = normAnalysis(baseAnalysis);
    if (!source) return {};

    const days = weekDatesByWeekId(currentWeekId());
    const out = {};
    const usedBySlot = { brf: new Set(), lnc: new Set(), din: new Set() };

    for (let dayIndex = 0; dayIndex < days.length; dayIndex += 1) {
      const id = days[dayIndex];
      const st = String(weeklyStatuses[id] || "TRAIN").toUpperCase();
      const preset = statusNutritionPreset(st);
      const dayKcal = Math.max(1200, Math.round(Number(source.targetKcal || 0) * preset.kcal));
      const baseP = Number(source.p || Math.round((dayKcal * 0.30) / 4));
      const baseF = Number(source.f || Math.round((dayKcal * 0.25) / 9));
      const baseC = Number(source.c || Math.round((dayKcal * 0.45) / 4));

      const dayTargets = {
        kcal: dayKcal,
        p: Math.max(0, Math.round(baseP * preset.p)),
        f: Math.max(0, Math.round(baseF * preset.f)),
        c: Math.max(0, Math.round(baseC * preset.c))
      };

      const brf = pickMealsByTarget("breakfasts", {
        kcal: dayTargets.kcal * SLOT_SHARE.brf,
        p: dayTargets.p * SLOT_SHARE.brf,
        f: dayTargets.f * SLOT_SHARE.brf,
        c: dayTargets.c * SLOT_SHARE.brf
      }, selectedSpeed, usedBySlot.brf, { status: st, slot: "brf" });
      const lnc = pickMealsByTarget("lunches", {
        kcal: dayTargets.kcal * SLOT_SHARE.lnc,
        p: dayTargets.p * SLOT_SHARE.lnc,
        f: dayTargets.f * SLOT_SHARE.lnc,
        c: dayTargets.c * SLOT_SHARE.lnc
      }, selectedSpeed, usedBySlot.lnc, { status: st, slot: "lnc" });
      const din = pickMealsByTarget("dinners", {
        kcal: dayTargets.kcal * SLOT_SHARE.din,
        p: dayTargets.p * SLOT_SHARE.din,
        f: dayTargets.f * SLOT_SHARE.din,
        c: dayTargets.c * SLOT_SHARE.din
      }, selectedSpeed, usedBySlot.din, { status: st, slot: "din" });

      const planned = sumPlanNutrients({ brf, lnc, din });
      out[id] = {
        brf,
        lnc,
        din,
        _meta: {
          status: st,
          weekId: currentWeekId(),
          sportType: currentSportType || null,
          sportProfile: currentSportProfile || "TEAM_MD",
          targetKcal: Math.round(dayTargets.kcal),
          plannedKcal: Math.round(planned.k),
          targetP: Math.round(dayTargets.p),
          targetF: Math.round(dayTargets.f),
          targetC: Math.round(dayTargets.c),
          plannedP: Math.round(planned.p),
          plannedF: Math.round(planned.f),
          plannedC: Math.round(planned.c)
        }
      };
      await nextUiFrame();
    }

    return out;
  }

  window.generateWeeklyPlan = async function () {
    if (!canWriteWeightData()) return;
    if(window.PACFoodDiary&&!await window.PACFoodDiary.capturePlan())return;
    const an = normAnalysis(window.currentAnalysis);
    if (!an || typeof dietDatabase === "undefined") {
      alert(t("scanFirst"));
      return;
    }

    const adjusted = adjustedAnalysisByGoal(an);
    if (!adjusted) return;
    window.currentAnalysis = adjusted;
    setDietComputeState(true);
    try {
      weeklyStatuses = await loadWeeklyStatuses(currentWeekId());
      weeklyPlan = await buildWeeklyPlanFromAnalysis(adjusted);

      const days = weekDatesByWeekId(currentWeekId());
      activeDayId = days.includes(todayId()) ? todayId() : days[0];
      currentDailyPlan = sanitizePlan(weeklyPlan[activeDayId] || { brf: [], lnc: [], din: [] });
      weeklyPlan[activeDayId] = currentDailyPlan;

      planControlsVisible(true);
      tabsVisible(true);
      renderWeekDayBar();
      switchDietTab("brf");
      updateUI();
      await savePlan();
    } catch(error) {
      if(error.code==='nutrition-empty')alert(document.getElementById('nutrition-preferences')?.dataset.noMeals || 'No matching recipes');
      else {console.error('generate menu',error);alert(t('planSaveErr'));}
    } finally {
      setDietComputeState(false);
    }
  };

  function renderMealList() {
    const box = document.getElementById("diet-tab-content");
    if (!box) return;
    const meals = currentDailyPlan[activeTab] || [];
    if (!meals.length) {
      box.innerHTML = `<div style="color:#555; font-size:12px; padding:10px 0;">${t("histEmpty")}</div>`;
      return;
    }

    box.replaceChildren();
    const text=recipeText();
    for(const m of meals){
      const recorded=window.PACFoodDiary?.isReady()?window.PACFoodDiary.planState(m.uid):null;if(recorded!==null)m.eaten=recorded;
      const row=document.createElement('article');row.className='recipe-card';
      const main=document.createElement('div');main.className='recipe-main';
      const title=document.createElement('h3');title.textContent=mealLabelWithPortion(m);
      const macros=document.createElement('p');macros.className='recipe-macros';macros.textContent=`${t('p')}: ${m.p} · ${t('f')}: ${m.f} · ${t('c')}: ${m.c} · ≈ ${m.kcal} kcal`;
      main.append(title,macros);
      if(m.recipeId && Array.isArray(m.ingredients)){
        const details=document.createElement('details'),summary=document.createElement('summary');summary.textContent=`${text[0]} · ${m.minutes} ${text[1]}`;details.append(summary);
        const list=document.createElement('ul'),scale=mealScaleFactor(m,activeTab);
        for(const i of m.ingredients){const li=document.createElement('li');li.textContent=`${i.names?.[lang()]||i.names?.en||i.key}: ${Math.round(Number(i.grams)*scale)} ${text[2]}`;list.append(li);}
        const steps=document.createElement('p');steps.textContent=m.instructions?.[lang()]||m.instructions?.en||'';details.append(list,steps);main.append(details);
      }
      const button=document.createElement('button');button.type='button';button.className='recipe-done';button.textContent=t('done');button.setAttribute('aria-pressed',String(Boolean(m.eaten)));button.disabled=isDelegatedReadOnly||Boolean(window.PACFoodDiary&&(!window.PACFoodDiary.isReady()||window.PACFoodDiary.isBusy()));button.addEventListener('click',()=>window.toggleMealStatus(m.uid));
      row.append(main,button);box.append(row);
    }
    const note=document.createElement('p');note.className='recipe-note';note.textContent=text[3];box.append(note);
    const reset=document.createElement('button');reset.type='button';reset.className='recipe-reset';reset.textContent=t('resetBtn');reset.disabled=isDelegatedReadOnly;reset.addEventListener('click',()=>window.resetDailyPlan());box.append(reset);
  }

  async function savePlan() {
    if (!currentUserId || !window.currentAnalysis) return;
    if (!canWriteWeightData({ notify: false })) return;
    try {
      const weekId = currentWeekId();
      const cleanWeek = {};
      Object.keys(weeklyPlan || {}).forEach((dayId) => {
        cleanWeek[dayId] = sanitizePlan(weeklyPlan[dayId]);
      });

      if (!activeDayId) {
        const days = weekDatesByWeekId(weekId);
        activeDayId = days.includes(todayId()) ? todayId() : days[0];
      }
      if (activeDayId && !cleanWeek[activeDayId]) cleanWeek[activeDayId] = sanitizePlan(currentDailyPlan);

      const cleanPlan = sanitizePlan(weeklyPlan[activeDayId] || currentDailyPlan);
      await db.collection(COL_PLAN).doc(currentUserId+'_menu').set({userId:currentUserId,type:'nutrition_menu',nutritionMenu:{
        plan: cleanPlan, // backward compatibility
        weeklyPlan: cleanWeek,
        analysis: normAnalysis(window.currentAnalysis),
        sportType: currentSportType || null,
        sportProfile: currentSportProfile || "TEAM_MD",
        selectedSpeed,
        selectedGoalMode,
        nutritionPreferences,
        activeDayId,
        serverWeekId: weekId,
        serverDateId: todayId(),
        serverDate: new Date().toDateString()
      }});

      const allMeals = []
        .concat(Array.isArray(cleanPlan.brf) ? cleanPlan.brf : [])
        .concat(Array.isArray(cleanPlan.lnc) ? cleanPlan.lnc : [])
        .concat(Array.isArray(cleanPlan.din) ? cleanPlan.din : []);
      const actual=window.PACFoodDiary?.projection();
      const done = DAY_SLOTS.reduce((n,slot)=>n+(cleanPlan[slot]||[]).filter(m=>m.eaten||actual?.replacedSlots.includes(slot)).length,0);
      const completionPct = allMeals.length ? Math.round((done / allMeals.length) * 100) : 0;
      const eatenKcal = allMeals
        .filter((m) => Boolean(m?.eaten))
        .reduce((acc, m) => acc + Math.max(0, Number(m?.kcal || 0)), 0);
      const dayMeta = sanitizePlan(weeklyPlan[activeDayId] || cleanPlan)?._meta || {};
      const targetKcal = Math.max(0, Number(dayMeta.targetKcal || window.currentAnalysis?.targetKcal || 0));
      const nutritionDate = activeDayId || todayId();
      await db.collection("athlete_nutrition_daily").doc(`${currentUserId}_${nutritionDate}`).set({
        userId: currentUserId,
        date: nutritionDate,
        planConsumed:Object.fromEntries(DAY_SLOTS.map(slot=>[slot,(cleanPlan[slot]||[]).filter(m=>m.eaten).map(m=>({uid:m.uid||'',eaten:true,kcal:m.kcal??null,p:m.p??null,f:m.f??null,c:m.c??null}))])),
        completionPct,
        ...(!window.PACFoodDiary||actual?{eatenKcal:actual?.kcal??eatenKcal}:{}),
        ...(actual?{actualNutrition:{version:1,kcal:actual.kcal,p:actual.p,f:actual.f,c:actual.c,unknown:actual.unknown}}:{}),
        targetKcal,
        selectedSpeed,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      try {
        localStorage.setItem("pac_nutrition_updated_at", String(Date.now()));
      } catch {}
      try {
        window.dispatchEvent(new CustomEvent("pac:nutrition-updated", { detail: { date: nutritionDate, pct: completionPct } }));
      } catch {}
      await loadNutritionWeekSummary();
      renderShoppingList();
    } catch (e) {
      console.error("save plan", e);
      alert(t("planSaveErr"));
    }
  }

  async function loadPlan({ refreshUi = true } = {}) {
    if (!currentUserId) return;
    try {
      const menus=await db.collection(COL_PLAN).where('userId','==',currentUserId).where('type','==','nutrition_menu').get();
      const menu=menus.docs.find(d=>d.id===currentUserId+'_menu');let data;
      if(menu){data=menu.data().nutritionMenu;if(!data)return;}
      else {try{const legacy=await db.collection('athlete_plans').doc(currentUserId).get();const old=legacy.exists?legacy.data():null;if(!old||(!Array.isArray(old.plan?.brf)&&!Object.values(old.weeklyPlan||{}).some(day=>Array.isArray(day?.brf))))return;data=old;}catch{return;}}
      latestPlanDateId = String(data.serverDateId || "");
      const prefs=data.nutritionPreferences||{};
      nutritionPreferences={diet:['any','vegetarian','vegan'].includes(prefs.diet)?prefs.diet:'any',exclude:Array.isArray(prefs.exclude)?prefs.exclude.filter(x=>['milk','fish','egg','soy','gluten','nuts'].includes(x)):[]};
      renderRecipePreferences();
      if (latestPlanDateId === todayId() && data.analysis) {
        setScanMarker(currentUserId, todayId());
      }
      if (data.sportType || data.sportProfile) {
        setSportContext(data.sportType || "");
        if (String(data.sportProfile || "").toUpperCase()) {
          const p = String(data.sportProfile || "").toUpperCase();
          if (["TEAM_MD", "COURT_MD", "INDIVIDUAL_ENDURANCE"].includes(p)) currentSportProfile = p;
        }
      }
      const goalRaw = String(data.selectedGoalMode || "auto").toLowerCase();
      selectedGoalMode = ["auto", "wl", "af", "mg"].includes(goalRaw) ? goalRaw : "auto";

      const weekId = currentWeekId();
      const hasWeekPlan = data.weeklyPlan && typeof data.weeklyPlan === "object" && String(data.serverWeekId || "") === weekId;

      if (hasWeekPlan) {
        weeklyPlan = {};
        Object.keys(data.weeklyPlan).forEach((dayId) => {
          weeklyPlan[dayId] = sanitizePlan(data.weeklyPlan[dayId]);
        });
        activeDayId = String(data.activeDayId || "");
      } else {
        const fallback = sanitizePlan(data.plan || {});
        const originalDay=/^\d{4}-\d{2}-\d{2}$/.test(data.serverDateId||'')?data.serverDateId:todayId();
        weeklyPlan = { [originalDay]: fallback };
        activeDayId = originalDay;
      }

      if (!weeklyStatuses || !Object.keys(weeklyStatuses).length) {
        weeklyStatuses = await loadWeeklyStatuses(currentWeekId());
      }

      const days = weekDatesByWeekId(currentWeekId());
      const today = todayId();
      if (days.includes(today) && weeklyPlan[today]) {
        activeDayId = today;
      } else if (!activeDayId || !weeklyPlan[activeDayId]) {
        activeDayId = Object.keys(weeklyPlan)[0] || days[0];
      }

      currentDailyPlan = sanitizePlan(weeklyPlan[activeDayId] || { brf: [], lnc: [], din: [] });
      weeklyPlan[activeDayId] = currentDailyPlan;
      window.currentAnalysis = normAnalysis(data.analysis || window.currentAnalysis);
      selectedSpeed = normSpeed(data.selectedSpeed || selectedSpeed);
      speedExplicitlyChosen = true;

      const goalSelect = document.getElementById("weight-goal-mode");
      if (goalSelect) goalSelect.value = selectedGoalMode;
      if (refreshUi) {
        planControlsVisible(true);
        tabsVisible(true);
        applySpeedUi(selectedSpeed);
        updateNutritionTitle();
        renderWeekDayBar();
        renderShoppingList();
        updateUI();
        switchDietTab(activeTab);
      }
    } catch (e) {
      // Background load should fail silently and not block UX with modal alerts.
      console.warn("load plan skipped:", e?.message || e);
    }
  }

  window.toggleMealStatus = async function (uid) {
    if (!canWriteWeightData()) return;
    const arr = currentDailyPlan[activeTab] || [];
    const meal = arr.find((x) => x.uid === uid);
    if (!meal) return;
    if(window.PACFoodDiary){await window.PACFoodDiary.togglePlan(meal,activeTab);renderMealList();updateUI();return;}
    meal.eaten = !meal.eaten;
    if (activeDayId) weeklyPlan[activeDayId] = currentDailyPlan;
    renderMealList();
    updateUI();
    if (savePlanTimer) clearTimeout(savePlanTimer);
    savePlanTimer = setTimeout(() => { savePlan(); }, 900);
  };

  window.resetDailyPlan = async function () {
    if (!canWriteWeightData()) return;
    if (!confirm(t("resetQ"))) return;
    try {
      if(window.PACFoodDiary&&!await window.PACFoodDiary.capturePlan())return;
      await clearNutritionMenu();
      currentDailyPlan = { brf: [], lnc: [], din: [] };
      weeklyPlan = {};
      activeDayId = null;
      tabsVisible(false);
      planControlsVisible(true);
      renderWeekDayBar();
      renderShoppingList();
      updateUI();
    } catch (e) {
      console.error("reset", e);
      alert(t("planLoadErr"));
    }
  };

  function switchDietTab(id) {
    activeTab = id;
    ["brf", "lnc", "din"].forEach((tab) => {
      const b = document.getElementById(`btn-${tab}`);
      if (!b) return;
      b.style.color = tab === id ? "#FFC72C" : "#9a9a9a";
      b.style.borderBottom = tab === id ? "2px solid #FFC72C" : "2px solid transparent";
    });
    renderMealList();
  }
  window.switchDietTab = switchDietTab;

  function initChart() {
    const canvas = document.getElementById("weightChart");
    if (!canvas) return;
    if (weightChart) weightChart.destroy();

    const ctx = canvas.getContext("2d");
    const grad = ctx.createLinearGradient(0, 0, 0, 320);
    grad.addColorStop(0, "rgba(255, 199, 44, 0.15)");
    grad.addColorStop(1, "rgba(255, 199, 44, 0)");

    weightChart = new Chart(ctx, {
      type: "line",
      data: { labels: [], datasets: [{ data: [], borderColor: "#FFC72C", borderWidth: 3, fill: true, backgroundColor: grad, tension: 0.35, pointRadius: 0 }] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { position: "right", grid: { color: "rgba(255,255,255,0.04)" }, ticks: { color: "#666", font: { size: 10 } } },
          x: { grid: { display: false }, ticks: { color: "#666", font: { size: 10 } } }
        },
        plugins: { legend: { display: false } }
      }
    });

    if (Array.isArray(window.latestHistoryArray) && window.latestHistoryArray.length) {
      const rows = [...window.latestHistoryArray].reverse();
      weightChart.data.labels = rows.map((r) => fmtShort(r.date));
      weightChart.data.datasets[0].data = rows.map((r) => Number(r.weight || 0));
      weightChart.update("none");
    }
  }

  function bindUi() {
    const form = document.getElementById("weight-form");
    if (form) form.addEventListener("submit", onAnalyze);
    const planBtn = document.getElementById("get-diet-plan-btn");
    if (planBtn) planBtn.addEventListener("click", window.generateWeeklyPlan);
    const goalSel = document.getElementById("weight-goal-mode");
    if (goalSel) {
      goalSel.value = selectedGoalMode;
      goalSel.addEventListener("change", () => {
        const raw = String(goalSel.value || "auto").toLowerCase();
        selectedGoalMode = ["auto", "wl", "af", "mg"].includes(raw) ? raw : "auto";
        renderShoppingList();
        updateNutritionTitle();
      });
    }
    ["brf", "lnc", "din"].forEach((id) => { const b = document.getElementById(`btn-${id}`); if (b) b.onclick = () => switchDietTab(id); });
    const e = document.getElementById("weight-speed-easy");
    const m = document.getElementById("weight-speed-medium");
    const h = document.getElementById("weight-speed-hard");
    if (e) e.onclick = () => window.setSpeed("Easy");
    if (m) m.onclick = () => window.setSpeed("Medium");
    if (h) h.onclick = () => window.setSpeed("Hard");
    applySpeedUi(selectedSpeed);
  }

  function applyHashFocus() {
    const raw = String(window.location.hash || "").replace(/^#/, "");
    if (!raw) return;
    const target = document.getElementById(raw);
    if (!target) return;
    setTimeout(() => {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      const prev = target.style.boxShadow;
      const prevTr = target.style.transition;
      target.style.transition = "box-shadow 0.25s ease";
      target.style.boxShadow = "0 0 0 2px rgba(255,199,44,0.85), 0 0 24px rgba(255,199,44,0.25)";
      setTimeout(() => {
        target.style.boxShadow = prev || "";
        target.style.transition = prevTr || "";
      }, 1800);
    }, 120);
  }

  firebase.auth().onAuthStateChanged(async (user) => {
    if (document.readyState === 'loading') await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve, { once:true }));
    setAuthPending(true);
    if (!user) {
      window.PACFoodDiary?.disconnect();
      isDelegatedReadOnly = false;
      currentUserId = null;
      window.currentUserId = null;
      resetWeightState();
      applyDelegatedReadOnlyUi();
      setAuthPending(false);
      return;
    }

    const scope = (typeof window.pacResolveDelegatedContext === "function")
      ? await window.pacResolveDelegatedContext(user, { db })
      : {
          allowed: true,
          effectiveUserId: String(resolveTargetUid(user.uid)).trim(),
          backHref: "coach-dashboard.html"
        };
    if (!scope.allowed) {
      alert(t("accessDeniedAthlete"));
      window.location.href = scope.backHref || "coach-dashboard.html";
      return;
    }
    if (typeof window.pacRenderDelegatedIndicator === "function") {
      window.pacRenderDelegatedIndicator(scope);
    }

    const resolvedUid = String(scope.effectiveUserId || user.uid).trim();
    isDelegatedReadOnly = Boolean(scope.isDelegated && String(scope.authUid || user.uid).trim() !== resolvedUid);
    currentUserId = resolvedUid;
    window.currentUserId = resolvedUid;
    applyDelegatedReadOnlyUi();
    resetWeightState();
    renderRecipePreferences();
    const markerToday = localStorage.getItem(scanKeyForUid(currentUserId)) === todayId();
    scanFormVisible(!markerToday);
    planControlsVisible(markerToday);
    tabsVisible(false);

    try {
      await window.loadBaseData();
      const historyPromise = loadHistory({ refreshUi: false }).catch((e) => {
        console.warn("history preload skipped:", e?.message || e);
      });
      weeklyStatuses = await loadWeeklyStatuses(currentWeekId());
      await loadPlan({ refreshUi: false });
      await loadNutritionWeekSummary();
      await historyPromise;
      applyScanState();
      const hasPlan = Boolean(activeDayId && weeklyPlan[activeDayId]);
      tabsVisible(hasPlan);
      applySpeedUi(selectedSpeed);
      updateNutritionTitle();
      switchDietTab(activeTab);
      updateUI();
    } catch (e) {
      console.error("weight init failed:", e);
    } finally {
      setAuthPending(false);
    }
  });

  document.addEventListener("DOMContentLoaded", () => {
    setAuthPending(true);
    applyDelegatedReadOnlyUi();
    if (typeof dietDatabase !== "undefined" && dietDatabase) {
      const api = dietI18n();
      if (api && typeof api.normalizeDietDatabase === "function") api.normalizeDietDatabase(dietDatabase);
      ["breakfasts", "lunches", "dinners"].forEach((k) => Array.isArray(dietDatabase[k]) && dietDatabase[k].forEach((m) => {
        if (!m.name) m.name = fix(m.name_uk || m.name_en || t("meal"));
        if (typeof m.kcal !== "number") m.kcal = Math.round((Number(m.p || 0) * 4) + (Number(m.f || 0) * 9) + (Number(m.c || 0) * 4));
      }));
    }

    applyI18n();
    applyBirthMask();
    initChart();
    bindUi();

    const box = document.getElementById("weight-history-list");
    if (box) box.innerHTML = `<div style="color:#444; font-size:11px; text-align:center; padding:10px;">${t("histLoad")}</div>`;
    applyHashFocus();
  });

  window.addEventListener("pac:lang-changed", async () => {
    applyI18n();
    applyBirthMask();
    applySpeedUi(selectedSpeed);
    if (weightChart && Array.isArray(window.latestHistoryArray) && window.latestHistoryArray.length) {
      const rows = [...window.latestHistoryArray].reverse();
      weightChart.data.labels = rows.map((r) => fmtShort(r.date));
      weightChart.update("none");
    }
    renderMealList();
    updateUI();
    await loadHistory();
    await loadNutritionWeekSummary();
  });
  window.addEventListener('pac:nutrition-updated',event=>{if(event.detail?.userId===currentUserId)loadNutritionWeekSummary();});
})();
