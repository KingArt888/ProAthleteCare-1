(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const DASH_I18N = {
    uk: {
      title: "My Dashboard",
      back: "← Назад",
      showInsights: "Показати детальну аналітику",
      hideInsights: "Сховати детальну аналітику",
      exec: "EXECUTION CENTER",
      readiness: "Готовність",
      dailyExecution: "Щоденне виконання",
      dailyGood: "Щоденний процес іде добре.",
      dailyPending: "Заверши щоденні задачі для кращих рекомендацій.",
      leftToGoal: "Залишилось до 100%",
      yesterday: "Вчорашній snapshot",
      checklist: "TODAY CHECKLIST",
      weeklyKicker: "WEEKLY PERFORMANCE",
      weeklyTitle: "Тижнева картина",
      weeklyHintGood: "Стабільний тиждень. Продовжуйте за планом.",
      weeklyHintWarn: "Є ризики в тижневій динаміці. Контролюйте відновлення.",
      weeklyTraining: "Тренувальний тиждень",
      weeklyNutrition: "Тиждень харчування",
      weeklyLoad: "Тижневе навантаження",
      weeklyDistance: "Загальна дистанція",
      weeklyCalories: "Калорії",
      weeklyPain: "Тренд болю",
      weeklyWellness: "Тиждень самопочуття",
      insufficientData: "недостатньо даних",
      loadUnder: "недотрен",
      loadOptimal: "оптимально",
      loadHigh: "високий ACWR",
      painImproving: "покращення",
      painStable: "стабільно",
      painWorse: "погіршення",
      consultDoctor: "Погіршення болю за тиждень: зверніться до лікаря.",
      rehabProtocol: "Високий/погіршуючийся біль: режим REHAB, реабілітаційні вправи та медичний контроль.",
      painGood: "добре",
      painWarning: "увага",
      painBad: "погано",
      fillWellness: "Заповнити самопочуття",
      logLoad: "Додати навантаження",
      goTraining: "До тренування",
      updateInjury: "Оновити травму",
      dailyWellness: "Щоденне самопочуття",
      dailyLoad: "Щоденне навантаження",
      dailyWeight: "Щоденна вага",
      dailyPower: "Power-тест (2 рази/тиждень)",
      dailyNutrition: "Щоденне харчування",
      weeklyCompletion: "Тижневе виконання",
      trainingReport: "Звіт тренування",
      trainingProgressCard: "Прогрес тренування",
      profile: "Профіль",
      pending: "очікує",
      doneAll: "Всі щоденні задачі виконані",
      trainingProgress: "Прогрес тренування",
      noData: "немає даних",
      microcycleLock: "Оберіть мікроцикл у тижневому плані, щоб розблокувати",
      offseasonLock: "Міжсезоння: оберіть хоча б один REST (вихідний) у тижневому плані",
      highRisk: "ВИСОКИЙ РИЗИК",
      moderate: "ПОМІРНИЙ",
      safe: "БЕЗПЕЧНО",
      week: "Тиждень",
      user: "Користувач",
      season: "Сезон",
      date: "Дата",
      noPain: "Біль не зафіксовано"
      ,
      dayStreak: "Серія днів",
      weekStreak: "Серія тижнів",
      riskLine: "Ризик травми",
      injuryShort: "Травма",
      modeGain: "набір маси",
      modeAthletic: "підтримка",
      modeControl: "контроль ваги",
      startHint: "Натисніть, щоб ввести, почати аналіз",
      powerLock: "Замок: доступно лише у MD-4 та MD-1",
      powerTarget6: "Ціль: 6 стрибків (MD-4)",
      powerTarget4: "Ціль: 4 стрибки (MD-1)",
      powerOffseason: "Off/Post-season: перший або останній тренувальний день",
      trainingWeekNum: "тренувань",
      dailyRecoEasy: "Стандартне тренування або дивіться Daily Individual.",
      dailyRecoControl: "Контрольне навантаження: тримайте обсяг і техніку.",
      dailyRecoRehab: "Режим REHAB: знизьте інтенсивність і пріоритет відновлення."
    },
    en: {
      title: "My Dashboard",
      back: "← Back",
      showInsights: "Show detailed insights",
      hideInsights: "Hide detailed insights",
      exec: "EXECUTION CENTER",
      readiness: "Readiness",
      dailyExecution: "Daily execution",
      dailyGood: "Daily flow is on track.",
      dailyPending: "Complete pending daily tasks for better recommendations.",
      leftToGoal: "Left to 100%",
      yesterday: "Yesterday snapshot",
      checklist: "TODAY CHECKLIST",
      weeklyKicker: "WEEKLY PERFORMANCE",
      weeklyTitle: "Weekly picture",
      weeklyHintGood: "Stable week. Keep following the plan.",
      weeklyHintWarn: "There are weekly risk flags. Control recovery.",
      weeklyTraining: "Training week",
      weeklyNutrition: "Nutrition week",
      weeklyLoad: "Load week",
      weeklyDistance: "Total distance",
      weeklyCalories: "Calories",
      weeklyPain: "Pain trend",
      weeklyWellness: "Wellness week",
      insufficientData: "insufficient data",
      loadUnder: "undertrained",
      loadOptimal: "optimal",
      loadHigh: "high ACWR",
      painImproving: "improving",
      painStable: "stable",
      painWorse: "worse",
      consultDoctor: "Pain is worsening this week: consult a doctor.",
      rehabProtocol: "High or worsening pain: switch to REHAB, use rehabilitation exercises, and seek medical supervision.",
      painGood: "good",
      painWarning: "warning",
      painBad: "bad",
      fillWellness: "Fill wellness",
      logLoad: "Log load",
      goTraining: "Go to training",
      updateInjury: "Update injury",
      dailyWellness: "Daily wellness",
      dailyLoad: "Daily load",
      dailyWeight: "Daily weight",
      dailyPower: "Power Test (2x/week)",
      dailyNutrition: "Daily nutrition",
      weeklyCompletion: "Weekly completion",
      trainingReport: "Training report",
      trainingProgressCard: "Training Progress",
      profile: "Profile",
      pending: "pending",
      doneAll: "All daily tasks completed",
      trainingProgress: "Training progress",
      noData: "no data",
      microcycleLock: "Choose microcycle in Weekly to unlock",
      offseasonLock: "Off-season: choose at least one REST day in Weekly",
      highRisk: "HIGH RISK",
      moderate: "MODERATE",
      safe: "SAFE",
      week: "Week",
      user: "User",
      season: "Season",
      date: "Date",
      noPain: "No pain reported"
      ,
      dayStreak: "Day streak",
      weekStreak: "Week streak",
      riskLine: "Injury risk",
      injuryShort: "Injury",
      modeGain: "muscle gain",
      modeAthletic: "athletic form",
      modeControl: "weight control",
      startHint: "Tap to Enter and Start analysis",
      powerLock: "Locked: available only on MD-4 and MD-1",
      powerTarget6: "Target: 6 jumps (MD-4)",
      powerTarget4: "Target: 4 jumps (MD-1)",
      powerOffseason: "Off/Post-season: first or last training day",
      trainingWeekNum: "sessions",
      dailyRecoEasy: "Standard training or open Daily Individual.",
      dailyRecoControl: "Controlled load: keep volume and technique stable.",
      dailyRecoRehab: "REHAB mode: reduce intensity and prioritize recovery."
    },
    de: {
      title: "Mein Dashboard",
      back: "← Zurück",
      showInsights: "Detaillierte Insights anzeigen",
      hideInsights: "Detaillierte Insights ausblenden",
      exec: "EXECUTION CENTER",
      readiness: "Bereitschaft",
      dailyExecution: "Tagesausführung",
      dailyGood: "Der Tagesablauf ist im Plan.",
      dailyPending: "Schließe offene Tagesaufgaben für bessere Empfehlungen ab.",
      leftToGoal: "Bis 100% verbleibend",
      yesterday: "Snapshot von gestern",
      checklist: "HEUTIGE CHECKLISTE",
      weeklyKicker: "WÖCHENTLICHE PERFORMANCE",
      weeklyTitle: "Wochenübersicht",
      weeklyHintGood: "Stabile Woche. Weiter nach Plan.",
      weeklyHintWarn: "Wochenrisiken erkannt. Regeneration kontrollieren.",
      weeklyTraining: "Trainingswoche",
      weeklyNutrition: "Ernährungswoche",
      weeklyLoad: "Wochenbelastung",
      weeklyDistance: "Gesamtdistanz",
      weeklyCalories: "Kalorien",
      weeklyPain: "Schmerztrend",
      weeklyWellness: "Wohlbefindenswoche",
      insufficientData: "unzureichende daten",
      loadUnder: "unterbelastet",
      loadOptimal: "optimal",
      loadHigh: "hoher ACWR",
      painImproving: "verbessert",
      painStable: "stabil",
      painWorse: "verschlechtert",
      consultDoctor: "Schmerz verschlechtert sich diese Woche: Arzt kontaktieren.",
      rehabProtocol: "Hoher oder sich verschlechternder Schmerz: in den REHAB-Modus wechseln, Reha-Übungen durchführen und medizinisch überwachen.",
      painGood: "gut",
      painWarning: "warnung",
      painBad: "schlecht",
      fillWellness: "Wellness ausfüllen",
      logLoad: "Belastung eintragen",
      goTraining: "Zum Training",
      updateInjury: "Verletzung aktualisieren",
      dailyWellness: "Tägliches Wohlbefinden",
      dailyLoad: "Tägliche Belastung",
      dailyWeight: "Tägliches Gewicht",
      dailyPower: "Power-Test (2x/Woche)",
      dailyNutrition: "Tägliche Ernährung",
      weeklyCompletion: "Wöchentliche Ausführung",
      trainingReport: "Trainingsbericht",
      trainingProgressCard: "Trainingsfortschritt",
      profile: "Profil",
      pending: "offen",
      doneAll: "Alle Tagesaufgaben erledigt",
      trainingProgress: "Trainingsfortschritt",
      noData: "keine Daten",
      microcycleLock: "Wähle einen Mikrozyklus in Weekly, um zu entsperren",
      offseasonLock: "Off-season: wähle mindestens einen REST-Tag in Weekly",
      highRisk: "HOHES RISIKO",
      moderate: "MITTEL",
      safe: "SICHER",
      week: "Woche",
      user: "Benutzer",
      season: "Saison",
      date: "Datum",
      noPain: "Keine Schmerzen gemeldet"
      ,
      dayStreak: "Tage-Serie",
      weekStreak: "Wochen-Serie",
      riskLine: "Verletzungsrisiko",
      injuryShort: "Verletzung",
      modeGain: "Muskelaufbau",
      modeAthletic: "athletische Form",
      modeControl: "Gewichtskontrolle",
      startHint: "Tippen, um Analyse zu starten",
      powerOffseason: "Off/Post-season: erster oder letzter Trainingstag",
      trainingWeekNum: "einheiten",
      dailyRecoEasy: "Standardtraining oder Daily Individual öffnen.",
      dailyRecoControl: "Belastung kontrollieren: Volumen und Technik stabil halten.",
      dailyRecoRehab: "REHAB-Modus: Intensität senken und Erholung priorisieren."
    },
    es: {
      title: "Mi Dashboard",
      back: "← Atrás",
      showInsights: "Mostrar análisis detallado",
      hideInsights: "Ocultar análisis detallado",
      exec: "EXECUTION CENTER",
      readiness: "Preparación",
      dailyExecution: "Ejecución diaria",
      dailyGood: "El flujo diario va bien.",
      dailyPending: "Completa tareas diarias pendientes para mejores recomendaciones.",
      leftToGoal: "Falta para 100%",
      yesterday: "Resumen de ayer",
      checklist: "CHECKLIST DE HOY",
      weeklyKicker: "RENDIMIENTO SEMANAL",
      weeklyTitle: "Resumen semanal",
      weeklyHintGood: "Semana estable. Sigue el plan.",
      weeklyHintWarn: "Hay riesgos semanales. Controla recuperación.",
      weeklyTraining: "Semana de entrenamiento",
      weeklyNutrition: "Semana de nutrición",
      weeklyLoad: "Carga semanal",
      weeklyDistance: "Distancia total",
      weeklyCalories: "Calorías",
      weeklyPain: "Tendencia de dolor",
      weeklyWellness: "Semana de bienestar",
      insufficientData: "datos insuficientes",
      loadUnder: "carga baja",
      loadOptimal: "óptimo",
      loadHigh: "ACWR alto",
      painImproving: "mejorando",
      painStable: "estable",
      painWorse: "empeorando",
      consultDoctor: "El dolor empeora esta semana: consulta con un médico.",
      rehabProtocol: "Dolor alto o en empeoramiento: cambiar a modo REHAB, realizar ejercicios de rehabilitación y control médico.",
      painGood: "bien",
      painWarning: "alerta",
      painBad: "mal",
      fillWellness: "Completar bienestar",
      logLoad: "Registrar carga",
      goTraining: "Ir al entrenamiento",
      updateInjury: "Actualizar lesión",
      dailyWellness: "Bienestar diario",
      dailyLoad: "Carga diaria",
      dailyWeight: "Peso diario",
      dailyPower: "Test de potencia (2x/semana)",
      dailyNutrition: "Nutrición diaria",
      weeklyCompletion: "Cumplimiento semanal",
      trainingReport: "Reporte de entrenamiento",
      trainingProgressCard: "Progreso de entrenamiento",
      profile: "Perfil",
      pending: "pendiente",
      doneAll: "Todas las tareas diarias completadas",
      trainingProgress: "Progreso de entrenamiento",
      noData: "sin datos",
      microcycleLock: "Elige microciclo en Weekly para desbloquear",
      offseasonLock: "Off-season: elige al menos un día REST en Weekly",
      highRisk: "RIESGO ALTO",
      moderate: "MODERADO",
      safe: "SEGURO",
      week: "Semana",
      user: "Usuario",
      season: "Temporada",
      date: "Fecha",
      noPain: "Sin dolor reportado"
      ,
      dayStreak: "Racha de días",
      weekStreak: "Racha de semanas",
      riskLine: "Riesgo de lesión",
      injuryShort: "Lesión",
      modeGain: "ganancia muscular",
      modeAthletic: "forma atlética",
      modeControl: "control de peso",
      startHint: "Pulsa para iniciar el análisis",
      powerOffseason: "Off/Post-season: primer o último día de entrenamiento",
      trainingWeekNum: "sesiones",
      dailyRecoEasy: "Entrenamiento estándar o abre Daily Individual.",
      dailyRecoControl: "Carga controlada: mantén volumen y técnica estables.",
      dailyRecoRehab: "Modo REHAB: baja intensidad y prioriza recuperación."
    },
    ru: {
      title: "Мой Dashboard",
      back: "← Назад",
      showInsights: "Показать детальную аналитику",
      hideInsights: "Скрыть детальную аналитику",
      exec: "EXECUTION CENTER",
      readiness: "Готовность",
      dailyExecution: "Ежедневное выполнение",
      dailyGood: "Дневной процесс идет по плану.",
      dailyPending: "Закройте ежедневные задачи для более точных рекомендаций.",
      leftToGoal: "Осталось до 100%",
      yesterday: "Снимок за вчера",
      checklist: "ЧЕКЛИСТ НА СЕГОДНЯ",
      weeklyKicker: "НЕДЕЛЬНАЯ ДИНАМИКА",
      weeklyTitle: "Картина недели",
      weeklyHintGood: "Стабильная неделя. Продолжайте по плану.",
      weeklyHintWarn: "Есть недельные риски. Контролируйте восстановление.",
      weeklyTraining: "Тренировочная неделя",
      weeklyNutrition: "Неделя питания",
      weeklyLoad: "Недельная нагрузка",
      weeklyDistance: "Общая дистанция",
      weeklyCalories: "Калории",
      weeklyPain: "Тренд боли",
      weeklyWellness: "Неделя самочувствия",
      insufficientData: "недостаточно данных",
      loadUnder: "недотрен",
      loadOptimal: "оптимально",
      loadHigh: "высокий ACWR",
      painImproving: "улучшение",
      painStable: "стабильно",
      painWorse: "ухудшение",
      consultDoctor: "Боль ухудшается за неделю: обратитесь к врачу.",
      rehabProtocol: "Высокая или ухудшающаяся боль: перейти в режим REHAB, выполнять реабилитационные упражнения и находиться под медицинским контролем.",
      painGood: "хорошо",
      painWarning: "внимание",
      painBad: "плохо",
      fillWellness: "Заполнить самочувствие",
      logLoad: "Добавить нагрузку",
      goTraining: "К тренировке",
      updateInjury: "Обновить травму",
      dailyWellness: "Ежедневное самочувствие",
      dailyLoad: "Ежедневная нагрузка",
      dailyWeight: "Ежедневный вес",
      dailyPower: "Power-тест (2 раза/неделя)",
      dailyNutrition: "Ежедневное питание",
      weeklyCompletion: "Недельное выполнение",
      trainingReport: "Отчет по тренировке",
      trainingProgressCard: "Прогресс тренировки",
      profile: "Профиль",
      pending: "ожидает",
      doneAll: "Все ежедневные задачи выполнены",
      trainingProgress: "Прогресс тренировки",
      noData: "нет данных",
      microcycleLock: "Выберите микроцикл в Weekly для разблокировки",
      offseasonLock: "Off-season: выберите минимум один REST-день в Weekly",
      highRisk: "ВЫСОКИЙ РИСК",
      moderate: "УМЕРЕННЫЙ",
      safe: "БЕЗОПАСНО",
      week: "Неделя",
      user: "Пользователь",
      season: "Сезон",
      date: "Дата",
      noPain: "Боль не зафиксирована"
      ,
      dayStreak: "Серия дней",
      weekStreak: "Серия недель",
      riskLine: "Риск травмы",
      injuryShort: "Травма",
      modeGain: "набор массы",
      modeAthletic: "поддержка",
      modeControl: "контроль веса",
      startHint: "Нажмите, чтобы начать анализ",
      powerOffseason: "Off/Post-season: первый или последний тренировочный день",
      trainingWeekNum: "сессий",
      dailyRecoEasy: "Стандартная тренировка или откройте Daily Individual.",
      dailyRecoControl: "Контрольная нагрузка: держите объем и технику.",
      dailyRecoRehab: "Режим REHAB: снизьте интенсивность и приоритет восстановлению."
    },
    pt: {
      title: "Meu Dashboard",
      back: "← Voltar",
      showInsights: "Mostrar análise detalhada",
      hideInsights: "Ocultar análise detalhada",
      exec: "EXECUTION CENTER",
      readiness: "Prontidão",
      dailyExecution: "Execução diária",
      dailyGood: "O fluxo diário está no caminho certo.",
      dailyPending: "Complete tarefas diárias pendentes para melhores recomendações.",
      leftToGoal: "Falta para 100%",
      yesterday: "Resumo de ontem",
      checklist: "CHECKLIST DE HOJE",
      weeklyKicker: "PERFORMANCE SEMANAL",
      weeklyTitle: "Panorama semanal",
      weeklyHintGood: "Semana estável. Continue o plano.",
      weeklyHintWarn: "Há riscos semanais. Controle a recuperação.",
      weeklyTraining: "Semana de treino",
      weeklyNutrition: "Semana de nutrição",
      weeklyLoad: "Carga semanal",
      weeklyDistance: "Distância total",
      weeklyCalories: "Calorias",
      weeklyPain: "Tendência de dor",
      weeklyWellness: "Semana de bem-estar",
      insufficientData: "dados insuficientes",
      loadUnder: "subcarga",
      loadOptimal: "ótimo",
      loadHigh: "ACWR alto",
      painImproving: "melhorando",
      painStable: "estável",
      painWorse: "piorando",
      consultDoctor: "Dor piorando nesta semana: procure um médico.",
      rehabProtocol: "Dor alta ou em piora: mudar para modo REHAB, fazer exercícios de reabilitação e manter supervisão médica.",
      painGood: "bom",
      painWarning: "atenção",
      painBad: "ruim",
      fillWellness: "Preencher bem-estar",
      logLoad: "Registrar carga",
      goTraining: "Ir para treino",
      updateInjury: "Atualizar lesão",
      dailyWellness: "Bem-estar diário",
      dailyLoad: "Carga diária",
      dailyWeight: "Peso diário",
      dailyPower: "Teste de potência (2x/semana)",
      dailyNutrition: "Nutrição diária",
      weeklyCompletion: "Execução semanal",
      trainingReport: "Relatório de treino",
      trainingProgressCard: "Progresso do treino",
      profile: "Perfil",
      pending: "pendente",
      doneAll: "Todas as tarefas diárias concluídas",
      trainingProgress: "Progresso do treino",
      noData: "sem dados",
      microcycleLock: "Escolha microciclo no Weekly para desbloquear",
      offseasonLock: "Off-season: escolha pelo menos um dia REST no Weekly",
      highRisk: "ALTO RISCO",
      moderate: "MODERADO",
      safe: "SEGURO",
      week: "Semana",
      user: "Usuário",
      season: "Temporada",
      date: "Data",
      noPain: "Sem dor registrada"
      ,
      dayStreak: "Sequência de dias",
      weekStreak: "Sequência de semanas",
      riskLine: "Risco de lesão",
      injuryShort: "Lesão",
      modeGain: "ganho muscular",
      modeAthletic: "forma atlética",
      modeControl: "controle de peso",
      startHint: "Toque para iniciar análise",
      powerOffseason: "Off/Post-season: primeiro ou último dia de treino",
      trainingWeekNum: "sessões",
      dailyRecoEasy: "Treino padrão ou abra o Daily Individual.",
      dailyRecoControl: "Carga controlada: mantenha volume e técnica estáveis.",
      dailyRecoRehab: "Modo REHAB: reduza intensidade e priorize recuperação."
    }
  };

  function lang(){
    const raw = String(localStorage.getItem("pac_lang") || "").toLowerCase();
    if (raw === "ua") return "uk";
    return DASH_I18N[raw] ? raw : "uk";
  }
  function ti(k){
    const l = lang();
    return DASH_I18N[l]?.[k] ?? DASH_I18N.en[k] ?? k;
  }
  Object.assign(DASH_I18N.uk, {
    modeTrain: "ТРЕЙН",
    modeLight: "ЛАЙТ",
    modeRehab: "РЕХАБ",
    modeRest: "РЕСТ",
    loadCollect: "ЗБІР ІНФОРМАЦІЇ"
  });
  Object.assign(DASH_I18N.en, {
    modeTrain: "TRAIN",
    modeLight: "LIGHT",
    modeRehab: "REHAB",
    modeRest: "REST",
    loadCollect: "DATA COLLECTION"
  });
  Object.assign(DASH_I18N.de, {
    modeTrain: "TRAINING",
    modeLight: "LEICHT",
    modeRehab: "REHAB",
    modeRest: "RUHE",
    loadCollect: "DATENERFASSUNG"
  });
  Object.assign(DASH_I18N.es, {
    modeTrain: "ENTRENO",
    modeLight: "LIGERO",
    modeRehab: "REHAB",
    modeRest: "DESCANSO",
    loadCollect: "RECOLECCIÓN"
  });
  Object.assign(DASH_I18N.ru, {
    modeTrain: "ТРЕНИРОВКА",
    modeLight: "ЛЕГКИЙ",
    modeRehab: "РЕХАБ",
    modeRest: "ОТДЫХ",
    loadCollect: "СБОР ДАННЫХ"
  });
  Object.assign(DASH_I18N.pt, {
    modeTrain: "TREINO",
    modeLight: "LEVE",
    modeRehab: "REHAB",
    modeRest: "DESCANSO",
    loadCollect: "COLETA DE DADOS"
  });
  Object.assign(DASH_I18N.uk, {
    syncCenter: "SYNC CENTER",
    syncTitleManual: "Ручна синхронізація",
    syncReady: "Готово до синку.",
    syncInProgress: "Синхронізація...",
    syncComplete: "Синхронізацію завершено.",
    syncFailed: "Помилка синхронізації. Спробуйте ще.",
    syncLast: "Останній синк",
    syncFreshness: "Свіжість",
    syncConnected: "Підключення",
    syncToday: "СИНК СЬОГОДНІ",
    syncRiskLabel: "Ризик",
    syncModeLabel: "Режим",
    syncSourceLabel: "Джерело",
    syncSourceManual: "Ручне",
    syncSourceConnected: "Підключене",
    syncSourceMixed: "Змішане",
    syncAdviceTitle: "ЧОМУ + РЕКОМЕНДАЦІЇ",
    syncSteps: "кроки",
    syncFreshnessWellness: "самопочуття",
    syncFreshnessLoad: "навантаження",
    syncFreshnessInjury: "травма",
    syncFreshnessConnected: "підключене",
    rxpKicker: "ВІДНОВЛЕННЯ × ПОТУЖНІСТЬ",
    rxpTitleRed: "Пріоритет відновлення",
    rxpTitleYellow: "Розумний день навантаження",
    rxpTitleGreen: "Готовий до тренування",
    rxpActionRecovery: "ВІДНОВЛЕННЯ",
    rxpActionControl: "КОНТРОЛЬ",
    rxpActionGo: "ГО",
    rxpRecoveryLabel: "Відновлення",
    rxpPowerLabel: "Потужність (ЦНС)",
    rxpActionLabel: "Дія"
  });
  Object.assign(DASH_I18N.en, {
    syncCenter: "SYNC CENTER",
    syncTitleManual: "Manual-first sync",
    syncReady: "Ready to sync.",
    syncInProgress: "Sync in progress...",
    syncComplete: "Sync complete.",
    syncFailed: "Sync failed. Try again.",
    syncLast: "Last sync",
    syncFreshness: "Freshness",
    syncConnected: "Connected",
    syncToday: "SYNC TODAY",
    syncRiskLabel: "Risk",
    syncModeLabel: "Mode",
    syncSourceLabel: "Source",
    syncSourceManual: "Manual",
    syncSourceConnected: "Connected",
    syncSourceMixed: "Mixed",
    syncAdviceTitle: "WHY + RECOMMENDATIONS",
    syncSteps: "steps",
    syncFreshnessWellness: "wellness",
    syncFreshnessLoad: "load",
    syncFreshnessInjury: "injury",
    syncFreshnessConnected: "connected",
    rxpKicker: "RECOVERY × POWER",
    rxpTitleRed: "Recovery priority",
    rxpTitleYellow: "Smart load day",
    rxpTitleGreen: "Ready to train",
    rxpActionRecovery: "RECOVERY",
    rxpActionControl: "CONTROL",
    rxpActionGo: "GO",
    rxpRecoveryLabel: "Recovery",
    rxpPowerLabel: "Power (CNS)",
    rxpActionLabel: "Action"
  });
  Object.assign(DASH_I18N.de, {
    syncCenter: "SYNC CENTER",
    syncTitleManual: "Manuelle Synchronisierung",
    syncReady: "Bereit zum Sync.",
    syncInProgress: "Synchronisierung läuft...",
    syncComplete: "Synchronisierung abgeschlossen.",
    syncFailed: "Synchronisierung fehlgeschlagen. Erneut versuchen.",
    syncLast: "Letzter Sync",
    syncFreshness: "Aktualität",
    syncConnected: "Verbunden",
    syncToday: "HEUTE SYNCHRONISIEREN",
    syncRiskLabel: "Risiko",
    syncModeLabel: "Modus",
    syncSourceLabel: "Quelle",
    syncSourceManual: "Manuell",
    syncSourceConnected: "Verbunden",
    syncSourceMixed: "Gemischt",
    syncAdviceTitle: "WARUM + EMPFEHLUNGEN",
    syncSteps: "schritte",
    syncFreshnessWellness: "wellness",
    syncFreshnessLoad: "belastung",
    syncFreshnessInjury: "verletzung",
    syncFreshnessConnected: "verbunden",
    rxpKicker: "REGENERATION × POWER",
    rxpTitleRed: "Regeneration priorisieren",
    rxpTitleYellow: "Smarter Belastungstag",
    rxpTitleGreen: "Bereit für Training",
    rxpActionRecovery: "REGENERATION",
    rxpActionControl: "KONTROLLE",
    rxpActionGo: "GO",
    rxpRecoveryLabel: "Regeneration",
    rxpPowerLabel: "Power (ZNS)",
    rxpActionLabel: "Aktion"
  });
  Object.assign(DASH_I18N.es, {
    syncCenter: "SYNC CENTER",
    syncTitleManual: "Sincronización manual",
    syncReady: "Listo para sincronizar.",
    syncInProgress: "Sincronizando...",
    syncComplete: "Sincronización completada.",
    syncFailed: "Error de sincronización. Inténtalo de nuevo.",
    syncLast: "Última sincronización",
    syncFreshness: "Actualidad",
    syncConnected: "Conectado",
    syncToday: "SINCRONIZAR HOY",
    syncRiskLabel: "Riesgo",
    syncModeLabel: "Modo",
    syncSourceLabel: "Fuente",
    syncSourceManual: "Manual",
    syncSourceConnected: "Conectado",
    syncSourceMixed: "Mixto",
    syncAdviceTitle: "POR QUÉ + RECOMENDACIONES",
    syncSteps: "pasos",
    syncFreshnessWellness: "bienestar",
    syncFreshnessLoad: "carga",
    syncFreshnessInjury: "lesión",
    syncFreshnessConnected: "conectado",
    rxpKicker: "RECUPERACIÓN × POTENCIA",
    rxpTitleRed: "Prioridad: recuperación",
    rxpTitleYellow: "Día de carga inteligente",
    rxpTitleGreen: "Listo para entrenar",
    rxpActionRecovery: "RECUPERACIÓN",
    rxpActionControl: "CONTROL",
    rxpActionGo: "GO",
    rxpRecoveryLabel: "Recuperación",
    rxpPowerLabel: "Potencia (SNC)",
    rxpActionLabel: "Acción"
  });
  Object.assign(DASH_I18N.ru, {
    syncCenter: "SYNC CENTER",
    syncTitleManual: "Ручная синхронизация",
    syncReady: "Готово к синхронизации.",
    syncInProgress: "Синхронизация...",
    syncComplete: "Синхронизация завершена.",
    syncFailed: "Ошибка синхронизации. Попробуйте снова.",
    syncLast: "Последний синк",
    syncFreshness: "Актуальность",
    syncConnected: "Подключение",
    syncToday: "СИНК СЕГОДНЯ",
    syncRiskLabel: "Риск",
    syncModeLabel: "Режим",
    syncSourceLabel: "Источник",
    syncSourceManual: "Ручное",
    syncSourceConnected: "Подключенное",
    syncSourceMixed: "Смешанное",
    syncAdviceTitle: "ПОЧЕМУ + РЕКОМЕНДАЦИИ",
    syncSteps: "шаги",
    syncFreshnessWellness: "самочувствие",
    syncFreshnessLoad: "нагрузка",
    syncFreshnessInjury: "травма",
    syncFreshnessConnected: "подключенное",
    rxpKicker: "ВОССТАНОВЛЕНИЕ × МОЩНОСТЬ",
    rxpTitleRed: "Приоритет восстановления",
    rxpTitleYellow: "Умный день нагрузки",
    rxpTitleGreen: "Готов к тренировке",
    rxpActionRecovery: "ВОССТАНОВЛЕНИЕ",
    rxpActionControl: "КОНТРОЛЬ",
    rxpActionGo: "ГО",
    rxpRecoveryLabel: "Восстановление",
    rxpPowerLabel: "Мощность (ЦНС)",
    rxpActionLabel: "Действие"
  });
  Object.assign(DASH_I18N.pt, {
    syncCenter: "SYNC CENTER",
    syncTitleManual: "Sincronização manual",
    syncReady: "Pronto para sincronizar.",
    syncInProgress: "Sincronizando...",
    syncComplete: "Sincronização concluída.",
    syncFailed: "Falha na sincronização. Tente novamente.",
    syncLast: "Último sync",
    syncFreshness: "Atualidade",
    syncConnected: "Conectado",
    syncToday: "SINCRONIZAR HOJE",
    syncRiskLabel: "Risco",
    syncModeLabel: "Modo",
    syncSourceLabel: "Fonte",
    syncSourceManual: "Manual",
    syncSourceConnected: "Conectado",
    syncSourceMixed: "Misto",
    syncAdviceTitle: "POR QUÊ + RECOMENDAÇÕES",
    syncSteps: "passos",
    syncFreshnessWellness: "wellness",
    syncFreshnessLoad: "carga",
    syncFreshnessInjury: "lesão",
    syncFreshnessConnected: "conectado",
    rxpKicker: "RECUPERAÇÃO × POTÊNCIA",
    rxpTitleRed: "Prioridade de recuperação",
    rxpTitleYellow: "Dia de carga inteligente",
    rxpTitleGreen: "Pronto para treinar",
    rxpActionRecovery: "RECUPERAÇÃO",
    rxpActionControl: "CONTROLE",
    rxpActionGo: "GO",
    rxpRecoveryLabel: "Recuperação",
    rxpPowerLabel: "Potência (SNC)",
    rxpActionLabel: "Ação"
  });
  Object.assign(DASH_I18N.uk, {
    syncReceived: "Ваші дані отримані",
    syncButtonSyncing: "СИНХРОНІЗАЦІЯ...",
    syncOverlaySub: "Збираємо ваші дані та готуємо рішення на сьогодні.",
    syncOverlayFailedDetail: "Не вдалося завершити синк. Спробуйте ще раз.",
    syncOverlaySuccessDetail: "Показуємо, що отримано з телефону, що бракує, і рішення на сьогодні.",
    syncResultStatusLabel: "Статус",
    syncResultReceivedLabel: "Отримано",
    syncResultMissingLabel: "Бракує",
    syncResultModeLabel: "Режим",
    syncResultRiskLabel: "Ризик",
    syncResultTrainingLabel: "Тренування",
    syncResultBreathLabel: "Дихання",
    syncResultOk: "УСПІХ",
    syncResultFailed: "ПОМИЛКА",
    syncResultNoConnected: "нема підключених даних",
    syncResultNothing: "нічого",
    syncResultSteps: "кроки",
    syncFieldRpe: "RPE",
    syncFieldDuration: "Тривалість",
    syncFieldDistance: "Дистанція",
    syncClose: "OK",
    breathHigh: "4-7-8, 5 циклів",
    breathMid: "box breathing 4-4-4-4, 3 хв",
    breathLow: "coherent breathing 5с/5с, 2 хв",
    trainingLineRehab: "Rehab-блок + low impact (15-25 хв)",
    trainingLineRest: "Recovery day (мобільність + Z1)",
    trainingLineLight: "Light day (-30% об'єм, без спринтів)",
    trainingLineDefault: "Тренування за планом (контроль інтенсивності)"
  });
  Object.assign(DASH_I18N.en, {
    syncReceived: "Your data has been received",
    syncButtonSyncing: "SYNCING...",
    syncOverlaySub: "Collecting your data and preparing today's decision.",
    syncOverlayFailedDetail: "Sync could not be completed. Please try again.",
    syncOverlaySuccessDetail: "Showing what was received from your phone, what is missing, and today's decision.",
    syncResultStatusLabel: "Status",
    syncResultReceivedLabel: "Received",
    syncResultMissingLabel: "Missing",
    syncResultModeLabel: "Mode",
    syncResultRiskLabel: "Risk",
    syncResultTrainingLabel: "Training",
    syncResultBreathLabel: "Breathing",
    syncResultOk: "OK",
    syncResultFailed: "FAILED",
    syncResultNoConnected: "no connected data",
    syncResultNothing: "nothing",
    syncResultSteps: "steps",
    syncFieldRpe: "RPE",
    syncFieldDuration: "Duration",
    syncFieldDistance: "Distance",
    syncClose: "OK",
    breathHigh: "4-7-8, 5 cycles",
    breathMid: "box breathing 4-4-4-4, 3 min",
    breathLow: "coherent breathing 5s/5s, 2 min",
    trainingLineRehab: "Rehab block + low impact (15-25 min)",
    trainingLineRest: "Recovery day (mobility + Z1)",
    trainingLineLight: "Light day (-30% volume, no sprints)",
    trainingLineDefault: "Train as planned (intensity control)"
  });
  Object.assign(DASH_I18N.de, {
    syncReceived: "Ihre Daten wurden empfangen",
    syncButtonSyncing: "SYNCHRONISIERT...",
    syncOverlaySub: "Wir sammeln Ihre Daten und bereiten die heutige Entscheidung vor.",
    syncOverlayFailedDetail: "Synchronisierung konnte nicht abgeschlossen werden. Bitte erneut versuchen.",
    syncOverlaySuccessDetail: "Wir zeigen, was vom Telefon empfangen wurde, was fehlt und die heutige Entscheidung.",
    syncResultStatusLabel: "Status",
    syncResultReceivedLabel: "Empfangen",
    syncResultMissingLabel: "Fehlt",
    syncResultModeLabel: "Modus",
    syncResultRiskLabel: "Risiko",
    syncResultTrainingLabel: "Training",
    syncResultBreathLabel: "Atmung",
    syncResultOk: "OK",
    syncResultFailed: "FEHLER",
    syncResultNoConnected: "keine verbundenen Daten",
    syncResultNothing: "nichts",
    syncResultSteps: "schritte",
    syncFieldRpe: "RPE",
    syncFieldDuration: "Dauer",
    syncFieldDistance: "Distanz",
    syncClose: "OK",
    breathHigh: "4-7-8, 5 Zyklen",
    breathMid: "box breathing 4-4-4-4, 3 Min",
    breathLow: "coherent breathing 5s/5s, 2 Min",
    trainingLineRehab: "Rehab-Block + low impact (15-25 Min)",
    trainingLineRest: "Recovery day (Mobilität + Z1)",
    trainingLineLight: "Light day (-30% Volumen, keine Sprints)",
    trainingLineDefault: "Training wie geplant (Intensitätskontrolle)"
  });
  Object.assign(DASH_I18N.es, {
    syncReceived: "Tus datos fueron recibidos",
    syncButtonSyncing: "SINCRONIZANDO...",
    syncOverlaySub: "Recopilamos tus datos y preparamos la decisión para hoy.",
    syncOverlayFailedDetail: "No se pudo completar la sincronización. Inténtalo de nuevo.",
    syncOverlaySuccessDetail: "Mostramos lo recibido del teléfono, lo que falta y la decisión de hoy.",
    syncResultStatusLabel: "Estado",
    syncResultReceivedLabel: "Recibido",
    syncResultMissingLabel: "Faltante",
    syncResultModeLabel: "Modo",
    syncResultRiskLabel: "Riesgo",
    syncResultTrainingLabel: "Entrenamiento",
    syncResultBreathLabel: "Respiración",
    syncResultOk: "OK",
    syncResultFailed: "FALLÓ",
    syncResultNoConnected: "sin datos conectados",
    syncResultNothing: "nada",
    syncResultSteps: "pasos",
    syncFieldRpe: "RPE",
    syncFieldDuration: "Duración",
    syncFieldDistance: "Distancia",
    syncClose: "OK",
    breathHigh: "4-7-8, 5 ciclos",
    breathMid: "box breathing 4-4-4-4, 3 min",
    breathLow: "coherent breathing 5s/5s, 2 min",
    trainingLineRehab: "Bloque rehab + low impact (15-25 min)",
    trainingLineRest: "Recovery day (movilidad + Z1)",
    trainingLineLight: "Light day (-30% volumen, sin sprints)",
    trainingLineDefault: "Entrena según el plan (control de intensidad)"
  });
  Object.assign(DASH_I18N.ru, {
    syncReceived: "Ваши данные получены",
    syncButtonSyncing: "СИНХРОНИЗАЦИЯ...",
    syncOverlaySub: "Собираем ваши данные и готовим решение на сегодня.",
    syncOverlayFailedDetail: "Не удалось завершить синк. Попробуйте еще раз.",
    syncOverlaySuccessDetail: "Показываем, что получено с телефона, чего не хватает и решение на сегодня.",
    syncResultStatusLabel: "Статус",
    syncResultReceivedLabel: "Получено",
    syncResultMissingLabel: "Не хватает",
    syncResultModeLabel: "Режим",
    syncResultRiskLabel: "Риск",
    syncResultTrainingLabel: "Тренировка",
    syncResultBreathLabel: "Дыхание",
    syncResultOk: "OK",
    syncResultFailed: "ОШИБКА",
    syncResultNoConnected: "нет подключенных данных",
    syncResultNothing: "ничего",
    syncResultSteps: "шаги",
    syncFieldRpe: "RPE",
    syncFieldDuration: "Длительность",
    syncFieldDistance: "Дистанция",
    syncClose: "OK",
    breathHigh: "4-7-8, 5 циклов",
    breathMid: "box breathing 4-4-4-4, 3 мин",
    breathLow: "coherent breathing 5с/5с, 2 мин",
    trainingLineRehab: "Rehab-блок + low impact (15-25 мин)",
    trainingLineRest: "Recovery day (мобилити + Z1)",
    trainingLineLight: "Light day (-30% объем, без спринтов)",
    trainingLineDefault: "Тренировка по плану (контроль интенсивности)"
  });
  Object.assign(DASH_I18N.pt, {
    syncReceived: "Seus dados foram recebidos",
    syncButtonSyncing: "SINCRONIZANDO...",
    syncOverlaySub: "Coletando seus dados e preparando a decisão de hoje.",
    syncOverlayFailedDetail: "Não foi possível concluir o sync. Tente novamente.",
    syncOverlaySuccessDetail: "Mostramos o que foi recebido do telefone, o que falta e a decisão de hoje.",
    syncResultStatusLabel: "Status",
    syncResultReceivedLabel: "Recebido",
    syncResultMissingLabel: "Faltando",
    syncResultModeLabel: "Modo",
    syncResultRiskLabel: "Risco",
    syncResultTrainingLabel: "Treino",
    syncResultBreathLabel: "Respiração",
    syncResultOk: "OK",
    syncResultFailed: "FALHA",
    syncResultNoConnected: "sem dados conectados",
    syncResultNothing: "nada",
    syncResultSteps: "passos",
    syncFieldRpe: "RPE",
    syncFieldDuration: "Duração",
    syncFieldDistance: "Distância",
    syncClose: "OK",
    breathHigh: "4-7-8, 5 ciclos",
    breathMid: "box breathing 4-4-4-4, 3 min",
    breathLow: "coherent breathing 5s/5s, 2 min",
    trainingLineRehab: "Bloco rehab + low impact (15-25 min)",
    trainingLineRest: "Recovery day (mobilidade + Z1)",
    trainingLineLight: "Light day (-30% volume, sem sprints)",
    trainingLineDefault: "Treine conforme o plano (controle de intensidade)"
  });
  function modeBadgeLabel(modeRaw){
    const mode = String(modeRaw || "").toUpperCase();
    if (mode === "REHAB") return ti("modeRehab");
    if (mode === "LIGHT") return ti("modeLight");
    if (mode === "REST" || mode === "OFF" || mode === "RECOVERY") return ti("modeRest");
    if (mode === "TRAIN") return ti("modeTrain");
    return mode || ti("modeTrain");
  }
  function localizePainLocation(raw){
    const src = String(raw || "").trim().toLowerCase();
    if (!src) return "";
    const map = {
      "коліно праве": { uk: "коліно праве", en: "right knee", de: "rechtes knie", es: "rodilla derecha", ru: "правое колено", pt: "joelho direito" },
      "правое колено": { uk: "коліно праве", en: "right knee", de: "rechtes knie", es: "rodilla derecha", ru: "правое колено", pt: "joelho direito" },
      "right knee": { uk: "коліно праве", en: "right knee", de: "rechtes knie", es: "rodilla derecha", ru: "правое колено", pt: "joelho direito" },
      "коліно ліве": { uk: "коліно ліве", en: "left knee", de: "linkes knie", es: "rodilla izquierda", ru: "левое колено", pt: "joelho esquerdo" },
      "левое колено": { uk: "коліно ліве", en: "left knee", de: "linkes knie", es: "rodilla izquierda", ru: "левое колено", pt: "joelho esquerdo" },
      "left knee": { uk: "коліно ліве", en: "left knee", de: "linkes knie", es: "rodilla izquierda", ru: "левое колено", pt: "joelho esquerdo" },
      "праве плече": { uk: "праве плече", en: "right shoulder", de: "rechte schulter", es: "hombro derecho", ru: "правое плечо", pt: "ombro direito" },
      "ліве плече": { uk: "ліве плече", en: "left shoulder", de: "linke schulter", es: "hombro izquierdo", ru: "левое плечо", pt: "ombro esquerdo" },
      "поперек": { uk: "поперек", en: "lower back", de: "unterer rücken", es: "zona lumbar", ru: "поясница", pt: "lombar" },
      "гомілкостоп": { uk: "гомілкостоп", en: "ankle", de: "sprunggelenk", es: "tobillo", ru: "голеностоп", pt: "tornozelo" },
      "стегно": { uk: "стегно", en: "hip", de: "hüfte", es: "cadera", ru: "бедро", pt: "quadril" },
      "привідні м'язи": { uk: "привідні м'язи", en: "adductors", de: "adduktoren", es: "aductores", ru: "приводящие мышцы", pt: "adutores" },
      "приводящие мышцы": { uk: "привідні м'язи", en: "adductors", de: "adduktoren", es: "aductores", ru: "приводящие мышцы", pt: "adutores" },
      "adductors": { uk: "привідні м'язи", en: "adductors", de: "adduktoren", es: "aductores", ru: "приводящие мышцы", pt: "adutores" }
    };
    const l = lang();
    return map[src]?.[l] || String(raw || "");
  }

  function pad2(n){ return String(n).padStart(2,"0"); }
  function fmtDate(d){
    try {
      const dt = (d instanceof Date) ? d : new Date(d);
      if (isNaN(dt.getTime())) return "-";
      return `${pad2(dt.getDate())}.${pad2(dt.getMonth()+1)}.${dt.getFullYear()}`;
    } catch { return "-"; }
  }
  function todayId(){
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  }

  function weekRangeFromCoreWeekId(weekId){
    const raw = String(weekId || "");
    const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    const start = m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date();
    if (!m) {
      const d = new Date();
      const day = d.getDay();
      const mondayDiff = (day + 6) % 7;
      start.setDate(d.getDate() - mondayDiff);
    }
    start.setHours(0,0,0,0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23,59,59,999);
    const toId = (dt) => `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,"0")}-${String(dt.getDate()).padStart(2,"0")}`;
    return { start, end, startId: toId(start), endId: toId(end) };
  }

  function getIsoWeekNumber(dtLike){
    const dt = new Date(dtLike);
    if (isNaN(dt.getTime())) return 1;
    const d = new Date(Date.UTC(dt.getFullYear(), dt.getMonth(), dt.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  }

  function dayName(d){
    const namesMap = {
      uk: ["Нд","Пн","Вт","Ср","Чт","Пт","Сб"],
      en: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],
      de: ["So","Mo","Di","Mi","Do","Fr","Sa"],
      es: ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"],
      ru: ["Вс","Пн","Вт","Ср","Чт","Пт","Сб"],
      pt: ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"]
    };
    const names = namesMap[lang()] || namesMap.en;
    const dt = (d instanceof Date) ? d : new Date(d);
    const i = isNaN(dt.getTime()) ? null : dt.getDay();
    return (i == null) ? "-" : names[i];
  }

  function weekStartFromDateId(id){
    const m = String(id || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return null;
    const dt = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    if (isNaN(dt.getTime())) return null;
    const day = dt.getDay();
    const mondayDiff = (day + 6) % 7;
    dt.setDate(dt.getDate() - mondayDiff);
    const y = dt.getFullYear();
    const mo = String(dt.getMonth() + 1).padStart(2, "0");
    const da = String(dt.getDate()).padStart(2, "0");
    return `${y}-${mo}-${da}`;
  }

  function calcDailyStreak(progressRows){
    const byDate = new Map();
    (progressRows || []).forEach((r) => {
      const id = String(r?.dateId || "");
      if (!id) return;
      const pct = Math.max(0, Math.min(100, Number(r?.progressPct || 0)));
      byDate.set(id, Math.max(pct, byDate.get(id) || 0));
    });
    let streak = 0;
    const cur = new Date();
    cur.setHours(0, 0, 0, 0);
    for (let i = 0; i < 180; i += 1) {
      const id = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, "0")}-${String(cur.getDate()).padStart(2, "0")}`;
      if ((byDate.get(id) || 0) >= 50) streak += 1;
      else break;
      cur.setDate(cur.getDate() - 1);
    }
    return streak;
  }

  function calcWeeklyStreak(progressRows){
    const map = new Map();
    (progressRows || []).forEach((r) => {
      const id = String(r?.dateId || "");
      const ws = weekStartFromDateId(id);
      if (!ws) return;
      const pct = Math.max(0, Math.min(100, Number(r?.progressPct || 0)));
      if (!map.has(ws)) map.set(ws, new Map());
      const dayMap = map.get(ws);
      dayMap.set(id, Math.max(pct, dayMap.get(id) || 0));
    });
    const weekDone = new Map();
    map.forEach((dayMap, ws) => {
      let filled = 0;
      dayMap.forEach((pct) => { if (pct >= 50) filled += 1; });
      weekDone.set(ws, filled >= 5);
    });

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const curDay = now.getDay();
    const mondayDiff = (curDay + 6) % 7;
    now.setDate(now.getDate() - mondayDiff);
    let streak = 0;
    for (let i = 0; i < 52; i += 1) {
      const ws = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      if (weekDone.get(ws)) streak += 1;
      else break;
      now.setDate(now.getDate() - 7);
    }
    return streak;
  }

  function toNum(x){
    const n = Number(x);
    return Number.isFinite(n) ? n : null;
  }
  function fixMojibakeText(value){
    const raw = String(value ?? "").trim();
    if (!raw) return "";
    if (!/[ÐÑÃâ]|ï¿½/.test(raw)) return raw;
    try {
      return decodeURIComponent(escape(raw));
    } catch {
      return raw;
    }
  }
  function safeList(arr, max = 4){
    const a = Array.isArray(arr) ? arr : [];
    const seen = new Set();
    const out = [];
    for (const item of a) {
      const text = fixMojibakeText(item);
      if (!text) continue;
      const key = text.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(text);
      if (out.length >= max) break;
    }
    return out;
  }
  function escapeHtml(s){
    return String(s ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }
  function animateNumber(el, to, opts = {}) {
    if (!el || to == null || !Number.isFinite(to)) {
      if (el) el.textContent = "-";
      return;
    }
    const { from = 0, duration = 700, decimals = 0, suffix = "", easing = (t) => 1 - Math.pow(1 - t, 3) } = opts;
    const start = performance.now();
    const diff = to - from;
    function frame(now) {
      const t = Math.min(1, (now - start) / duration);
      const v = from + diff * easing(t);
      el.textContent = v.toFixed(decimals) + suffix;
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  function renderList(el, arr){
    if (!el) return;
    const items = safeList(arr, 6);
    el.innerHTML = items.length ? items.map(x => `<div class="ud-li">${escapeHtml(x)}</div>`).join("") : "-";
  }
  function fmtDateTime(v){
    const dt = (v instanceof Date) ? v : new Date(v);
    if (isNaN(dt.getTime())) return "-";
    return `${fmtDate(dt)} ${pad2(dt.getHours())}:${pad2(dt.getMinutes())}`;
  }

  const syncState = {
    pending: false,
    startedAt: null,
    source: "manual",
    hydrated: false,
    timer: null
  };
  let connectedSyncCache = null;
  let __dashboardFirstPaintDone = false;
  let __dashboardLoaderShownAtMs = Date.now();
  let __dashboardLoaderHideTimer = null;
  let __dashboardLoaderFallbackTimer = null;

  function setDashboardLoaderText(text){
    const el = $("udLoaderText");
    if (!el || !text) return;
    el.textContent = String(text);
  }

  function showDashboardLoader(text){
    const root = $("udPageLoader");
    if (!root) return;
    if (text) setDashboardLoaderText(text);
    root.classList.remove("is-hidden");
    root.setAttribute("aria-hidden", "false");
    root.setAttribute("aria-busy", "true");
    __dashboardLoaderShownAtMs = Date.now();
  }

  function hideDashboardLoader(force = false){
    const root = $("udPageLoader");
    if (!root) return;
    if (__dashboardLoaderHideTimer) {
      clearTimeout(__dashboardLoaderHideTimer);
      __dashboardLoaderHideTimer = null;
    }
    const minVisibleMs = 320;
    const waitMs = force ? 0 : Math.max(0, minVisibleMs - (Date.now() - __dashboardLoaderShownAtMs));
    __dashboardLoaderHideTimer = setTimeout(() => {
      root.classList.add("is-hidden");
      root.setAttribute("aria-hidden", "true");
      root.setAttribute("aria-busy", "false");
      __dashboardLoaderHideTimer = null;
    }, waitMs);
  }

  function revealCardsFallback(){
    if (lang() === "uk") {
      setDashboardLoaderText("Дані ще синхронізуються. Будь ласка, зачекайте...");
    } else {
      setDashboardLoaderText("Data is still syncing. Please wait...");
    }
  }

  function armDashboardLoaderFallback(){
    if (__dashboardLoaderFallbackTimer) {
      clearTimeout(__dashboardLoaderFallbackTimer);
      __dashboardLoaderFallbackTimer = null;
    }
    __dashboardLoaderFallbackTimer = setTimeout(() => {
      if (__dashboardFirstPaintDone) return;
      revealCardsFallback();
    }, 9000);
  }

  async function readConnectedSync(userId){
    if (!window.db || !userId) return null;
    try {
      const snap = await window.db.collection("users").doc(userId).get();
      if (!snap.exists) return null;
      const cs = snap.data()?.connectedSync || null;
      connectedSyncCache = cs;
      return cs;
    } catch {
      return connectedSyncCache;
    }
  }

  function sourceFromDoc(doc){
    const candidates = [
      doc?.source,
      doc?.provider,
      doc?.device,
      doc?.origin,
      doc?.meta?.source,
      doc?.meta?.provider
    ].filter(Boolean).map((x) => String(x).toLowerCase());
    const external = ["whoop", "garmin", "polar", "healthkit", "apple", "googlefit", "fitbit", "oura", "strava"];
    if (candidates.some((x) => external.some((p) => x.includes(p)))) return "connected";
    return "manual";
  }

  function detectSyncSource(signals){
    const docs = [signals?.wellness, signals?.load, signals?.injury, signals?.weight, signals?.power].filter(Boolean);
    const hasConnectedSync =
      Number.isFinite(Number(connectedSyncCache?.stepsToday || 0)) ||
      Number.isFinite(Number(signals?.connected?.stepsToday || 0)) ||
      String(connectedSyncCache?.source || "").toLowerCase() === "connected" ||
      String(signals?.connected?.source || "").toLowerCase() === "connected";
    if (!docs.length) return hasConnectedSync ? "connected" : "manual";
    let ext = 0;
    let man = 0;
    docs.forEach((d) => {
      if (sourceFromDoc(d) === "connected") ext += 1;
      else man += 1;
    });
    if (hasConnectedSync) ext += 1;
    if (ext > 0 && man > 0) return "mixed";
    if (ext > 0) return "connected";
    return "manual";
  }

  function timestampMs(doc){
    if (!doc) return null;
    if (Array.isArray(doc?.history) && doc.history.length) {
      const last = doc.history[doc.history.length - 1] || {};
      if (typeof last?.timestamp === "number") {
        return last.timestamp;
      }
      if (typeof last?.date === "string") {
        const th = new Date(last.date).getTime();
        if (Number.isFinite(th)) return th;
      }
    }
    const ts = doc?.timestamp;
    if (typeof ts === "number") return ts;
    if (typeof ts === "string") {
      const t = new Date(ts).getTime();
      return Number.isFinite(t) ? t : null;
    }
    if (ts?.toDate) {
      const t = ts.toDate().getTime();
      return Number.isFinite(t) ? t : null;
    }
    if (typeof doc?.date === "string") {
      const t = new Date(doc.date).getTime();
      return Number.isFinite(t) ? t : null;
    }
    return null;
  }

  function ageLabel(ms){
    if (!Number.isFinite(ms)) return "—";
    const diff = Math.max(0, Date.now() - ms);
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 48) return `${hrs}h`;
    const days = Math.floor(hrs / 24);
    return `${days}d`;
  }

  function freshnessText(signals){
    if (!signals) return `${ti("syncFreshness")}: —`;
    const wm = timestampMs(signals.wellness);
    const lm = timestampMs(signals.load);
    const im = timestampMs(signals.injury);
    const cm = timestampMs(signals?.connected || { timestamp: connectedSyncCache?.syncedAt });
    const parts = [];
    if (wm != null) parts.push(`${ti("syncFreshnessWellness")} ${ageLabel(wm)}`);
    if (lm != null) parts.push(`${ti("syncFreshnessLoad")} ${ageLabel(lm)}`);
    if (im != null) parts.push(`${ti("syncFreshnessInjury")} ${ageLabel(im)}`);
    if (cm != null) parts.push(`${ti("syncFreshnessConnected")} ${ageLabel(cm)}`);
    return `${ti("syncFreshness")}: ${parts.length ? parts.join(" • ") : "—"}`;
  }

  function renderSyncCenter(core, options = {}){
    const status = String(options.status || "ready");
    const signals = options.signals || null;
    const risk = toNum(core?.risk);
    const mode = String(core?.mode || "-");
    const reasons = safeList(core?.reasons, 4);
    const recs = safeList(core?.recommendations, 4);
    const advice = safeList([...(reasons || []), ...(recs || [])], 8);

    if ($("syncRisk")) $("syncRisk").textContent = risk == null ? "-" : `${Math.round(risk)}/100`;
    if ($("syncMode")) $("syncMode").textContent = mode;
    if ($("syncSource")) {
      $("syncSource").textContent = syncState.source === "connected"
        ? ti("syncSourceConnected")
        : syncState.source === "mixed"
          ? ti("syncSourceMixed")
          : ti("syncSourceManual");
    }
    const adviceHtml = advice.length
      ? advice.map((x) => `<div class="ud-li">${escapeHtml(x)}</div>`).join("")
      : "—";
    if ($("syncAdvice")) $("syncAdvice").innerHTML = adviceHtml;
    // Backward compatibility for stale cached HTML.
    if ($("syncWhy")) $("syncWhy").innerHTML = adviceHtml;
    if ($("syncAction")) $("syncAction").innerHTML = adviceHtml;

    if ($("syncStatus")) {
      if (status === "syncing") $("syncStatus").textContent = ti("syncInProgress");
      else if (status === "ok") $("syncStatus").textContent = ti("syncComplete");
      else if (status === "failed") $("syncStatus").textContent = ti("syncFailed");
      else $("syncStatus").textContent = ti("syncReady");
    }
    if ($("syncFreshness")) $("syncFreshness").textContent = freshnessText(signals);
    if ($("syncConnected")) {
      const steps = Number(signals?.connected?.stepsToday || connectedSyncCache?.stepsToday || 0);
      const provider = String(signals?.connected?.provider || connectedSyncCache?.provider || "phone").toLowerCase();
      $("syncConnected").textContent = steps > 0
        ? `${ti("syncConnected")}: ${provider} • ${ti("syncSteps")} ${Math.round(steps)}`
        : `${ti("syncConnected")}: —`;
    }
  }

  async function persistSyncSnapshot(userId, core, signals, status, errorMessage = "") {
    if (!window.db || !userId) return;
    const now = Date.now();
    const payload = {
      uid: userId,
      userId,
      type: "SYNC_RUN",
      status,
      startedAtMs: Number(syncState.startedAt || now),
      finishedAtMs: now,
      startedAt: new Date(Number(syncState.startedAt || now)).toISOString(),
      finishedAt: new Date(now).toISOString(),
      source: syncState.source || "manual",
      risk: Number(core?.risk ?? 0),
      mode: String(core?.mode || "TRAIN"),
      traffic: String(core?.traffic || "green"),
      reasons: safeList(core?.reasons, 6),
      recommendations: safeList(core?.recommendations, 6),
      acwr: toNum(core?.breakdown?.load?.acwr),
      error: String(errorMessage || ""),
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };

    await Promise.all([
      window.db.collection("athlete_reports").add(payload),
      window.db.collection("users").doc(userId).set({
      syncMeta: {
          status,
          source: payload.source,
          lastSyncAtMs: now,
          lastSyncAt: payload.finishedAt,
          lastRisk: payload.risk,
          lastMode: payload.mode,
          error: payload.error
        },
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true })
    ]);

    if ($("syncLastAt")) $("syncLastAt").textContent = `${ti("syncLast")}: ${fmtDateTime(now)}`;
  }

  async function hydrateSyncMeta(userId){
    if (!window.db || !userId || syncState.hydrated) return;
    try {
      const snap = await window.db.collection("users").doc(userId).get();
      if (!snap.exists) return;
      const meta = snap.data()?.syncMeta || null;
      if (!meta) return;
      syncState.hydrated = true;
      if ($("syncLastAt")) $("syncLastAt").textContent = `${ti("syncLast")}: ${fmtDateTime(meta.lastSyncAtMs || meta.lastSyncAt)}`;
      if ($("syncRisk")) $("syncRisk").textContent = Number.isFinite(Number(meta.lastRisk)) ? `${Math.round(Number(meta.lastRisk))}/100` : "—";
      if ($("syncMode")) $("syncMode").textContent = String(meta.lastMode || "—");
      const src = String(meta.source || "manual").toLowerCase();
      if ($("syncSource")) {
        $("syncSource").textContent = src === "connected"
          ? ti("syncSourceConnected")
          : src === "mixed"
            ? ti("syncSourceMixed")
            : ti("syncSourceManual");
      }
      if ($("syncStatus")) {
        $("syncStatus").textContent = String(meta.status || "").toLowerCase() === "ok"
          ? ti("syncComplete")
          : String(meta.status || "").toLowerCase() === "failed"
            ? ti("syncFailed")
            : ti("syncReady");
      }
    } catch (e) {
      console.warn("sync meta hydrate failed:", e);
    }
  }

  function setSyncBtnState(disabled, text){
    if (!$("syncTodayBtn")) return;
    $("syncTodayBtn").disabled = !!disabled;
    if (text) $("syncTodayBtn").textContent = text;
    else $("syncTodayBtn").textContent = ti("syncToday");
  }

  function suggestBreathing(core, signals){
    const stress = toNum(signals?.wellness?.stress);
    const risk = toNum(core?.risk) ?? 0;
    if ((stress != null && stress >= 7) || risk >= 70) return ti("breathHigh");
    if (risk >= 55) return ti("breathMid");
    return ti("breathLow");
  }

  function trainingLine(core){
    const mode = String(core?.mode || "TRAIN").toUpperCase();
    if (mode === "REHAB") return ti("trainingLineRehab");
    if (mode === "REST") return ti("trainingLineRest");
    if (mode === "LIGHT") return ti("trainingLineLight");
    return ti("trainingLineDefault");
  }

  function openSyncOverlay() {
    const root = $("syncOverlay");
    if (!root) return;
    root.classList.add("is-open");
    root.setAttribute("aria-hidden", "false");
    if ($("syncOverlayTitle")) $("syncOverlayTitle").textContent = ti("syncInProgress");
    if ($("syncOverlaySub")) $("syncOverlaySub").textContent = ti("syncOverlaySub");
    if ($("syncOverlaySpinner")) $("syncOverlaySpinner").style.display = "";
    if ($("syncOverlayResult")) $("syncOverlayResult").style.display = "none";
  }

  function closeSyncOverlay() {
    const root = $("syncOverlay");
    if (!root) return;
    root.classList.remove("is-open");
    root.setAttribute("aria-hidden", "true");
  }

  function buildMissingFields(signals){
    const out = [];
    const ld = signals?.load || {};
    const cd = signals?.connected || {};
    const todayKey = todayId();
    const loadDate = String(ld?.date || "");
    const hasTodayLoad = loadDate === todayKey;
    const rpe = Number(ld?.rpe || 0);
    const duration = Number(ld?.duration || 0);
    const connectedDistance = Number(cd?.distanceKm || 0);
    const connectedSteps = Number(cd?.stepsToday || 0);
    const distance = Number(ld?.distance || connectedDistance || (connectedSteps > 0 ? connectedSteps * 0.00078 : 0));
    if (!hasTodayLoad || !(rpe >= 1 && rpe <= 10)) out.push(ti("syncFieldRpe"));
    if (!hasTodayLoad || !(duration > 0)) out.push(ti("syncFieldDuration"));
    if (!hasTodayLoad || !(distance > 0)) out.push(ti("syncFieldDistance"));
    return out;
  }

  function showSyncOverlayResult(core, signals, failed = false){
    if ($("syncOverlayTitle")) $("syncOverlayTitle").textContent = failed ? ti("syncFailed") : ti("syncReceived");
    if ($("syncOverlaySub")) {
      $("syncOverlaySub").textContent = failed
        ? ti("syncOverlayFailedDetail")
        : ti("syncOverlaySuccessDetail");
    }
    if ($("syncOverlaySpinner")) $("syncOverlaySpinner").style.display = "none";
    if ($("syncOverlayResult")) $("syncOverlayResult").style.display = "";
    if ($("syncResultStatus")) $("syncResultStatus").textContent = failed ? ti("syncResultFailed") : ti("syncResultOk");
    if ($("syncResultReceived")) {
      const steps = Number(signals?.connected?.stepsToday || connectedSyncCache?.stepsToday || 0);
      $("syncResultReceived").textContent = failed ? "—" : (steps > 0 ? `${ti("syncResultSteps")} ${steps}` : ti("syncResultNoConnected"));
    }
    if ($("syncResultMissing")) {
      const missing = failed ? [] : buildMissingFields(signals);
      $("syncResultMissing").textContent = missing.length ? missing.join(", ") : ti("syncResultNothing");
    }
    if ($("syncResultMode")) $("syncResultMode").textContent = String(core?.mode || "—");
    if ($("syncResultRisk")) $("syncResultRisk").textContent = Number.isFinite(Number(core?.risk)) ? `${Math.round(Number(core.risk))}/100` : "—";
    if ($("syncResultTraining")) $("syncResultTraining").textContent = failed ? "—" : trainingLine(core);
    if ($("syncResultBreath")) $("syncResultBreath").textContent = failed ? "—" : suggestBreathing(core, signals);
    const tips = failed ? [] : safeList(core?.recommendations, 2);
    if ($("syncResultTips")) $("syncResultTips").innerHTML = tips.map((x) => `<div>${escapeHtml(x)}</div>`).join("");
  }

  async function runSyncToday(){
    if (syncState.pending) return;
    syncState.pending = true;
    syncState.startedAt = Date.now();
    const uid = window.firebase?.auth?.().currentUser?.uid || null;
    if (uid) await readConnectedSync(uid);
    syncState.source = detectSyncSource(__lastSignals);
    openSyncOverlay();
    renderSyncCenter(__lastCore, { status: "syncing", signals: __lastSignals });
    setSyncBtnState(true, ti("syncButtonSyncing"));
    if (syncState.timer) {
      clearTimeout(syncState.timer);
      syncState.timer = null;
    }
    syncState.timer = setTimeout(async () => {
      if (!syncState.pending) return;
      syncState.pending = false;
      setSyncBtnState(false);
      renderSyncCenter(__lastCore, { status: "failed", signals: __lastSignals });
      showSyncOverlayResult(__lastCore || {}, __lastSignals || {}, true);
      if (uid) {
        try {
          await persistSyncSnapshot(uid, __lastCore || {}, __lastSignals || {}, "failed", "sync timeout");
        } catch (_) {}
      }
    }, 15000);
    if (typeof window.refreshAthleteCore === "function") {
      window.refreshAthleteCore();
      return;
    }
    syncState.pending = false;
    if (syncState.timer) {
      clearTimeout(syncState.timer);
      syncState.timer = null;
    }
    setSyncBtnState(false);
    renderSyncCenter(__lastCore, { status: "failed", signals: __lastSignals });
    showSyncOverlayResult(__lastCore || {}, __lastSignals || {}, true);
  }

  async function patchMissingSourceInCollection(uid, collectionName, limitN = 40){
    if (!window.db || !uid) return 0;
    let changed = 0;
    const snap = await window.db.collection(collectionName).where("userId", "==", uid).limit(limitN).get();
    if (snap.empty) return 0;
    const batch = window.db.batch();
    snap.forEach((doc) => {
      const d = doc.data() || {};
      if (!d.source) {
        batch.set(doc.ref, { source: "manual", updatedAt: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
        changed += 1;
      }
    });
    if (changed > 0) await batch.commit();
    return changed;
  }

  async function runManualSourceBackfill(uid){
    if (!uid || !window.db) return;
    const key = `pac_source_backfill_v1_${uid}`;
    if (localStorage.getItem(key) === "done") return;
    try {
      await Promise.all([
        patchMissingSourceInCollection(uid, "wellness_reports", 50),
        patchMissingSourceInCollection(uid, "load_season_reports", 50),
        patchMissingSourceInCollection(uid, "injuries", 50),
        patchMissingSourceInCollection(uid, "weight_history", 50)
      ]);

      // power_tests stored in subcollection
      try {
        const pSnap = await window.db.collection("power_tests").doc(uid).collection("tests").limit(50).get();
        if (!pSnap.empty) {
          const pBatch = window.db.batch();
          let pChanged = 0;
          pSnap.forEach((doc) => {
            const d = doc.data() || {};
            if (!d.source) {
              pBatch.set(doc.ref, { source: "manual", updatedAt: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
              pChanged += 1;
            }
          });
          if (pChanged > 0) await pBatch.commit();
        }
      } catch (_) {}

      localStorage.setItem(key, "done");
    } catch (e) {
      console.warn("manual source backfill skipped:", e);
    }
  }

  function dateIdFromAny(v){
    if (!v) return null;
    if (typeof v === "string") {
      const m = v.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (m) return `${m[1]}-${m[2]}-${m[3]}`;
      const dt = new Date(v);
      if (!isNaN(dt.getTime())) return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,"0")}-${String(dt.getDate()).padStart(2,"0")}`;
      return null;
    }
    if (typeof v === "number") {
      const dt = new Date(v);
      if (!isNaN(dt.getTime())) return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,"0")}-${String(dt.getDate()).padStart(2,"0")}`;
      return null;
    }
    if (v?.toDate) {
      const dt = v.toDate();
      return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,"0")}-${String(dt.getDate()).padStart(2,"0")}`;
    }
    return null;
  }
  function docDateId(doc){
    if (!doc) return null;
    return dateIdFromAny(doc.date) || dateIdFromAny(doc.timestamp) || dateIdFromAny(doc.createdAt) || dateIdFromAny(doc.updatedAt);
  }
  function isTodayDoc(doc){
    const d = docDateId(doc);
    return !!d && d === todayId();
  }

  function getWeightPair(signals){
    const list = Array.isArray(signals?.weightRecent) ? signals.weightRecent.slice() : [];
    list.sort((a,b)=> String(a?.date || "").localeCompare(String(b?.date || "")));
    const curr = list.length ? list[list.length - 1] : (signals?.weight || null);
    const prev = list.length >= 2 ? list[list.length - 2] : null;

    const currKg = toNum(curr?.weight ?? curr?.kg ?? curr?.bodyMass ?? curr?.value);
    const prevKg = toNum(prev?.weight ?? prev?.kg ?? prev?.bodyMass ?? prev?.value);
    const currDate = curr?.date || (curr?.timestamp?.toDate ? curr.timestamp.toDate().toISOString().slice(0,10) : null) || null;

    return { currKg, prevKg, currDate };
  }
  function classifyDelta(currKg, prevKg){
    if (currKg == null || prevKg == null) return { mode:"-", delta:null };
    const delta = currKg - prevKg;
    if (Math.abs(delta) < 0.3) return { mode:"MAINTAIN", delta };
    if (delta < -0.3) return { mode:"CUT", delta };
    return { mode:"GAIN", delta };
  }

  function cnsFromSignals(signals){
    if (typeof window.calcCnsReadiness === "function") {
      const out = window.calcCnsReadiness(signals);
      return { score: toNum(out?.score), label: out?.label || "-" };
    }
    const w = signals?.wellness || null;
    const sleep = toNum(w?.sleep);
    const ready = toNum(w?.readiness ?? w?.ready);
    const stress = toNum(w?.stress);
    const soreness = toNum(w?.soreness);
    const parts = [];
    if (sleep != null) parts.push(sleep * 10);
    if (ready != null) parts.push(ready * 10);
    if (stress != null) parts.push(100 - stress * 10);
    if (soreness != null) parts.push(100 - soreness * 10);
    if (!parts.length) return { score:null, label:"-" };
    const score = Math.round(parts.reduce((a,b)=>a+b,0) / parts.length);
    const label = score >= 80 ? "HIGH" : score >= 60 ? "MODERATE" : "LOW";
    return { score, label };
  }

  function getACWR(core, signals){
    const v = core?.breakdown?.load?.acwr ?? core?.breakdown?.acwr ?? core?.acwr ?? signals?.load?.acwr ?? signals?.load?.ACWR ?? signals?.load?.ratio ?? null;
    return toNum(v);
  }

  function loadJumpHistory(){
    const key = "pac_jump_history_v1";
    try {
      const raw = localStorage.getItem(key);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch { return []; }
  }
  function powerStatusFromHistory(){
    const hist = loadJumpHistory();
    if (!hist.length) return { score:null, label:"NO TEST", why:[] };
    const last3 = hist.slice(-3);
    const avgs = last3.map(t => Number(t?.avg_cm)).filter(Number.isFinite);
    const fats = last3.map(t => Number(t?.fatigue_pct)).filter(Number.isFinite);
    const avg = avgs.length ? avgs.reduce((a,b)=>a+b,0) / avgs.length : null;
    const fatigue = fats.length ? fats.reduce((a,b)=>a+b,0) / fats.length : 0;
    let score = 80;
    score -= Math.min(35, fatigue * 1.2);
    score = Math.max(0, Math.min(100, Math.round(score)));
    const label = score >= 75 ? "READY" : score >= 55 ? "UNDER LOAD" : "FATIGUED";
    const why = [];
    if (Number.isFinite(fatigue)) why.push(`Fatigue ${fatigue.toFixed(0)}%`);
    if (avg != null) why.push(`Avg jump ${avg.toFixed(1)} cm`);
    return { score, label, why };
  }

  function moduleCompletion(core, signals, dailyInfo){
    const dayStatus = String(core?.breakdown?.plannedDayStatus || "TRAIN").toUpperCase();
    const restLike = dayStatus === "REST" || dayStatus === "OFF" || dayStatus === "RECOVERY";
    const weightDate = getWeightPair(signals).currDate;

    const trainingLocked = !dailyInfo?.microcycleSelected;
    const trainingBadge = modeBadgeLabel(String(core?.mode || dayStatus || "TRAIN"));
    const acwrDay = getACWR(core, signals);
    const loadRecentArr = Array.isArray(signals?.loadRecent) ? signals.loadRecent : [];
    const validLoadCount7d = loadRecentArr.filter((x) => Number(x?.duration || 0) > 0 && Number(x?.rpe || 0) > 0).length;
    const todayLoad = signals?.load || {};
    const todayLoadIsToday = isTodayDoc(todayLoad);
    const connectedSteps = Number(signals?.connected?.stepsToday || 0);
    const connectedDistance = Number(signals?.connected?.distanceKm || (connectedSteps > 0 ? connectedSteps * 0.00078 : 0));
    const loadRpe = Number(todayLoad?.rpe || 0);
    const loadDuration = Number(todayLoad?.duration || 0);
    const loadDistance = Number(todayLoad?.distance || connectedDistance || 0);
    const hasConnectedOnly = !todayLoadIsToday && (connectedSteps > 0 || connectedDistance > 0);
    const loadFieldCount = [
      loadRpe >= 1 && loadRpe <= 10,
      loadDuration > 0,
      loadDistance > 0,
    ].filter(Boolean).length;
    let dailyLoadPct = 0;
    if (todayLoadIsToday) dailyLoadPct = Math.round((loadFieldCount / 3) * 100);
    else if (hasConnectedOnly) dailyLoadPct = 34;
    let dailyLoadBadge = "";
    if (hasConnectedOnly) {
      dailyLoadBadge = `connected ${Math.round(connectedSteps)} steps`;
    } else if (validLoadCount7d < 3) dailyLoadBadge = ti("loadCollect");
    else if (Number.isFinite(acwrDay) && acwrDay >= 1.5) dailyLoadBadge = ti("loadHigh");
    else if (Number.isFinite(acwrDay) && acwrDay < 0.8) dailyLoadBadge = ti("loadUnder");
    else dailyLoadBadge = ti("loadOptimal");
    if (Number.isFinite(acwrDay) && acwrDay > 0 && acwrDay < 3 && validLoadCount7d >= 3) {
      dailyLoadBadge = `${dailyLoadBadge} • ACWR ${acwrDay.toFixed(2)}`;
    }
    const startHint = ti("startHint");
    const modules = [
      { name: ti("dailyWellness"), pct: isTodayDoc(signals?.wellness) ? 100 : 0, href: "wellness.html", hint: startHint },
      { name: ti("dailyWeight"), pct: (weightDate && weightDate === todayId()) ? 100 : 0, href: "weight-control.html#body-params-section", hint: startHint },
      { name: ti("dailyNutrition"), pct: Math.max(0, Math.min(100, Number(dailyInfo?.nutritionPct || 0))), href: "weight-control.html#diet-section", hint: startHint },
      {
        name: ti("trainingProgressCard"),
        badge: trainingBadge,
        pct: trainingLocked ? 0 : (restLike ? 100 : Math.max(0, Math.min(100, Number(dailyInfo?.trainingProgressPct ?? (dailyInfo?.trainingDone ? 100 : 0))))),
        href: "daily-individual.html#daily-exercise-list",
        locked: trainingLocked,
        lockToWeekly: true,
        lockHint: dailyInfo?.microcycleLockHint || ti("microcycleLock"),
        hint: startHint
      },
      { name: ti("dailyLoad"), badge: dailyLoadBadge, pct: dailyLoadPct, href: "load-season.html", hint: startHint },
      {
        name: ti("dailyPower"),
        pct: Number(dailyInfo?.powerPct || 0),
        href: "power.html",
        hint: dailyInfo?.powerHint || "",
        locked: Boolean(dailyInfo?.powerLocked),
        lockHint: dailyInfo?.powerLockHint || ti("powerLock")
      }
    ];

    return modules.map((m) => ({ ...m, pct: Math.max(0, Math.min(100, Math.round(m.pct))) }));
  }

  function checklistFromModules(modules){
    const out = [];
    modules.forEach((m) => { if (m.pct < 100) out.push(`${m.name}: ${ti("pending")}`); });
    if (!out.length) out.push(ti("doneAll"));
    return out.slice(0, 5);
  }

  function renderWeeklyPerformance(weekly){
    if ($("udWeeklyKicker")) $("udWeeklyKicker").textContent = ti("weeklyKicker");
    const total = Math.max(0, Math.min(100, Number(weekly?.overallPct || 0)));
    if ($("udWeeklyTitle")) $("udWeeklyTitle").textContent = `${ti("weeklyTitle")} ${Math.round(total)}%`;
    const nutritionPct = Math.max(0, Math.min(100, Number(weekly?.nutritionPct || 0)));
    const weekNo = Math.max(1, Number(weekly?.weekNumber || 1));
    if ($("udWeeklySub")) $("udWeeklySub").textContent = `${ti("week")} #${weekNo} • ${ti("weeklyNutrition")}: ${nutritionPct}%`;
    if ($("udWeeklyRingFg")) $("udWeeklyRingFg").style.strokeDashoffset = String(ringOffsetFromPct(total));
    if ($("udWeeklyRingLabel")) $("udWeeklyRingLabel").textContent = `${Math.round(total)}%`;

    const painPct = Math.max(0, Math.min(100, Number(weekly?.painPct ?? 0)));
    const painStatus = String(weekly?.painStatusKey || "painGood");
    const painBad = painStatus === "painBad";
    const painWarning = painStatus === "painWarning";
    const painHref = weekly?.injuryHref || "injury.html";
    const painLoc = localizePainLocation(weekly?.painLocation || "");
    const painSuffix = painLoc ? ` • ${painLoc}` : "";
    const nutritionMode = String(weekly?.nutritionModeKey || "modeAthletic");
    const injuryStatus = String(weekly?.injuryStatusKey || "painGood");
    const loadName = ti("weeklyLoad");
    const nutritionModeLabel = String(ti(nutritionMode) || "").toUpperCase();
    const trainingModeLabel = modeBadgeLabel(String(weekly?.trainingModeLabel || "TRAIN"));
    let loadModeLabel = String(ti(weekly?.loadStatusKey || "insufficientData") || "").toUpperCase();
    const loadAcwr = Number(weekly?.loadAcwr);
    if (Number.isFinite(loadAcwr) && loadAcwr > 0 && loadAcwr < 3 && String(weekly?.loadStatusKey || "") !== "insufficientData") {
      loadModeLabel = `${loadModeLabel} • ACWR ${loadAcwr.toFixed(2)}`;
    }
    if (String(weekly?.loadStatusKey || "") !== "insufficientData") {
      loadModeLabel = `${loadModeLabel} • ${String(ti(injuryStatus) || "").toUpperCase()}`;
    }
    const modules = [
      {
        name: `${ti("weeklyTraining")}: ${Math.max(0, Number(weekly?.trainingCount || 0))} ${ti("trainingWeekNum")}`,
        badge: trainingModeLabel,
        pct: Math.round(Number(weekly?.trainingPct || 0)),
        href: "weekly-individual.html#weekly-plan-form"
      },
      {
        name: ti("weeklyNutrition"),
        badge: nutritionModeLabel,
        pct: Math.round(Number(weekly?.nutritionPct || 0)),
        href: "weight-control.html#nutrition-week-section"
      },
      {
        name: loadName,
        badge: loadModeLabel,
        pct: Math.round(Number(weekly?.loadPct || 0)),
        href: "load-season.html",
        danger: Boolean(weekly?.loadDanger),
        warning: Boolean(weekly?.loadWarning) && !Boolean(weekly?.loadDanger)
      },
      {
        name: `${ti("weeklyWellness")}: ${ti(weekly?.wellnessStatusKey || "insufficientData")}`,
        pct: Math.round(Number(weekly?.wellnessPct || 0)),
        href: "wellness.html",
        danger: Boolean(weekly?.wellnessDanger),
        warning: Boolean(weekly?.wellnessWarning) && !Boolean(weekly?.wellnessDanger)
      },
      {
        name: `${ti("weeklyPain")}: ${Number(weekly?.painAvg || 0).toFixed(1)}/10 • ${ti(weekly?.painTrendKey || "painStable")}${painSuffix}`,
        pct: painPct,
        href: painHref,
        danger: painBad,
        warning: painWarning && !painBad
      }
    ];

    const wrap = $("udWeeklyProgressList");
    if (wrap) {
      wrap.innerHTML = modules.map((m) => `
        <div class="ud-progress-item ud-progress-item--click ${m.danger ? "is-danger" : ""} ${m.warning ? "is-warning" : ""}" role="button" tabindex="0" data-href="${escapeHtml(m.href || "")}">
          <div class="ud-progress-top">
            <div class="ud-progress-name">${escapeHtml(m.name)}</div>
            <div class="ud-progress-val">${m.badge ? `<span class="ud-mini-badge">${escapeHtml(m.badge)}</span> ` : ""}${Math.max(0, Math.min(100, Number(m.pct) || 0))}%</div>
          </div>
          <div class="ud-progress-track"><div class="ud-progress-bar ${m.danger ? "ud-progress-bar--danger" : ""} ${m.warning ? "ud-progress-bar--warning" : ""}" style="width:${Math.max(0, Math.min(100, Number(m.pct) || 0))}%;"></div></div>
        </div>
      `).join("");

      wrap.querySelectorAll(".ud-progress-item--click").forEach((el) => {
        const href = el.getAttribute("data-href");
        if (!href) return;
        const go = () => { window.location.href = href; };
        el.addEventListener("click", go);
        el.addEventListener("keydown", (ev) => {
          if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); go(); }
        });
      });
    }

    const warn = Boolean(weekly?.doctorAlert);
    const riskScore = Math.max(0, Math.min(100, Number(weekly?.risk || 0)));
    const riskLine = `${ti("riskLine")}: ${riskScore}/100`;
    if ($("udWeeklyHint")) $("udWeeklyHint").textContent = `${warn ? ti("rehabProtocol") : ti("weeklyHintGood")} • ${riskLine}`;
    if ($("udWeeklyHint")) $("udWeeklyHint").style.color = warn ? "#ff8f8f" : "";
  }

  function ringOffsetFromPct(pct){
    const clamped = Math.max(0, Math.min(100, Number(pct) || 0));
    const circleLen = 327;
    return circleLen - (circleLen * clamped) / 100;
  }

  function extractFocusGoals(core, signals) {
    const fromCore = Array.isArray(core?.breakdown?.focus?.goals) ? core.breakdown.focus.goals : [];
    const fromSignals = Array.isArray(signals?.goals) ? signals.goals : [];
    const fromProfile = Array.isArray(signals?.profile?.goals) ? signals.profile.goals : [];
    const uniq = new Set();
    [...fromCore, ...fromSignals, ...fromProfile].forEach((x) => {
      const v = String(x || "").trim();
      if (v) uniq.add(v);
    });
    return Array.from(uniq);
  }

  function renderExecutionCenter(core, signals, dailyInfo){
    const modules = moduleCompletion(core, signals, dailyInfo);
    const total = Math.round(modules.reduce((acc, m) => acc + m.pct, 0) / Math.max(modules.length, 1));

    if ($("udRingFg")) $("udRingFg").style.strokeDashoffset = String(ringOffsetFromPct(total));
    if ($("udRingLabel")) $("udRingLabel").textContent = `${total}%`;
    if ($("udCompletionTitle")) $("udCompletionTitle").textContent = `${ti("dailyExecution")} ${total}%`;
    const dayStreak = Number(dailyInfo?.dayStreak || 0);
    const subMain = total >= 80 ? ti("dailyGood") : ti("dailyPending");
    const mode = String(core?.mode || "-");
    const modePill = $("udModePill");
    if (modePill) {
      modePill.style.display = "none";
    }
    const focusGoals = extractFocusGoals(core, signals);
    const pillsHost = $("udDailyStatusPills");
    if (pillsHost) {
      let focusPill = $("udFocusPill");
      if (!focusPill) {
        focusPill = document.createElement("span");
        focusPill.id = "udFocusPill";
        focusPill.className = "ud-pill";
        focusPill.style.border = "1px solid rgba(255,199,44,.42)";
        focusPill.style.background = "rgba(255,199,44,.14)";
        focusPill.style.color = "#FFC72C";
        pillsHost.appendChild(focusPill);
      }
      if (focusGoals.length) {
        focusPill.style.display = "inline-flex";
        const visible = focusGoals.slice(0, 2);
        const extra = focusGoals.length > 2 ? ` +${focusGoals.length - 2}` : "";
        focusPill.textContent = `FOCUS: ${visible.join(" + ")}${extra}`;
        focusPill.title = focusGoals.join(", ");
      } else {
        focusPill.style.display = "none";
      }
    }
    if ($("udCompletionSub")) $("udCompletionSub").textContent = `${subMain} • ${ti("dayStreak")}: ${dayStreak}`;
    if ($("udTodoHint")) $("udTodoHint").textContent = `${ti("leftToGoal")}: ${Math.max(0, 100 - total)}%`;

    const progressWrap = $("udProgressList");
    if (progressWrap) {
      progressWrap.innerHTML = modules.map((m) => `
        <div class="ud-progress-item ud-progress-item--click ${m.locked ? "is-locked" : ""}" role="button" tabindex="0" data-href="${escapeHtml(m.href || "")}" data-locked="${m.locked ? "1" : "0"}" data-lock-weekly="${m.lockToWeekly ? "1" : "0"}">
          <div class="ud-progress-top">
            <div class="ud-progress-name">${m.locked ? "🔒 " : ""}${escapeHtml(m.name)}</div>
            <div class="ud-progress-val">${m.badge ? `<span class="ud-mini-badge">${escapeHtml(m.badge)}</span> ` : ""}${m.pct}%</div>
          </div>
          <div class="ud-progress-track"><div class="ud-progress-bar" style="width:${m.pct}%;"></div></div>
          ${m.hint && m.pct <= 0 ? `<div class="ud-mini" style="margin-top:6px;">${escapeHtml(m.hint)}</div>` : ""}
          ${m.locked ? `<div class="ud-mini" style="margin-top:6px;">${escapeHtml(m.lockHint || "")}</div>` : ""}
        </div>
      `).join("");

      progressWrap.querySelectorAll(".ud-progress-item--click").forEach((el) => {
        const href = el.getAttribute("data-href");
        const locked = el.getAttribute("data-locked") === "1";
        const lockToWeekly = el.getAttribute("data-lock-weekly") === "1";
        if (!href) return;
        const go = () => {
          if (locked && lockToWeekly) {
            window.location.href = "weekly-individual.html";
            return;
          }
          if (locked) return;
          window.location.href = href;
        };
        el.addEventListener("click", go);
        el.addEventListener("keydown", (ev) => {
          if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); go(); }
        });
      });
    }

    if ($("udYesterdaySummary")) {
      const yPct = Math.max(0, Math.min(100, Number(dailyInfo?.yesterdayTotalPct || 0)));
      const yText = dailyInfo?.yesterdayShort || ti("noData");
      $("udYesterdaySummary").textContent = `${ti("yesterday")}: ${yPct}% • ${yText}`;
    }
  }

  function renderRecoveryPowerWidget(signals){
    const rRaw = Number(signals?.wellness?.readiness ?? signals?.wellness?.ready);
    const r = Number.isFinite(rRaw) ? Math.round(rRaw * 10) : null;
    const p = powerStatusFromHistory();
    const recBand = r == null ? "unknown" : r >= 75 ? "green" : r >= 55 ? "yellow" : "red";
    const powBand = p.score == null ? "yellow" : p.score >= 75 ? "green" : p.score >= 55 ? "yellow" : "red";
    const scoreBandRank = { unknown:0, green:1, yellow:2, red:3 };
    const overall = scoreBandRank[recBand] >= scoreBandRank[powBand] ? recBand : powBand;

    if ($("rxpPill")) {
      $("rxpPill").dataset.traffic = overall === "red" ? "red" : overall === "yellow" ? "yellow" : "green";
      $("rxpPill").textContent = overall === "red" ? "HIGH" : overall === "yellow" ? "MOD" : "OK";
    }
    if ($("rxpTitle")) $("rxpTitle").textContent = overall === "red" ? ti("rxpTitleRed") : overall === "yellow" ? ti("rxpTitleYellow") : ti("rxpTitleGreen");
    if ($("rxpSub")) $("rxpSub").textContent = `${ti("rxpRecoveryLabel")} ${r == null ? "-" : `${r}%`} • ${ti("rxpPowerLabel")} ${p.label}`;
    if ($("rxpRecovery")) $("rxpRecovery").textContent = r == null ? "-" : `${r}%`;
    if ($("rxpPower")) $("rxpPower").textContent = p.label;
    if ($("rxpAction")) $("rxpAction").textContent = overall === "red" ? ti("rxpActionRecovery") : overall === "yellow" ? ti("rxpActionControl") : ti("rxpActionGo");
    renderList($("rxpWhy"), p.why);
  }

  function render(core, signals){
    const now = new Date();
    const traffic = String(core?.traffic || "green");
    const mode = String(core?.mode || "TRAIN");
    const risk = toNum(core?.risk);
    const dayStatus = String(core?.breakdown?.plannedDayStatus || "TRAIN");
    const cns = cnsFromSignals(signals);

    if ($("udSub")) $("udSub").textContent = `${dayName(now)} • ${fmtDate(now)} • updated ${fmtDate(signals?.fetchedAt || now)}`;
    if ($("udTodayTitle")) $("udTodayTitle").textContent = dayStatus;

    const authUser = window.firebase?.auth?.().currentUser;
    const authName = authUser?.displayName || (authUser?.email ? authUser.email.split("@")[0] : "Athlete");
    const trainingProgress = String(core?.__trainingProgressLabel || `${ti("trainingProgress")}: 0%`);
    if ($("udTodayMeta")) $("udTodayMeta").textContent = `${ti("week")}: ${core?.weekId || "-"} • ${trainingProgress} • ${ti("user")}: ${authName}`;

    if ($("udMode")) $("udMode").textContent = mode;
    animateNumber($("udRisk"), risk, { duration: 800, suffix: "/100" });
    if ($("udCns")) {
      animateNumber($("udCns"), cns.score, { duration: 900, suffix: "/100" });
      setTimeout(() => { if ($("udCns")) $("udCns").textContent += ` • ${cns.label}`; }, 920);
    }
    if ($("udDailyReco")) {
      const reco = mode === "REHAB" || traffic === "red"
        ? ti("dailyRecoRehab")
        : (traffic === "yellow" ? ti("dailyRecoControl") : ti("dailyRecoEasy"));
      $("udDailyReco").textContent = reco;
    }

    renderExecutionCenter(core, signals, core?.__dailyInfo || null);
    renderRecoveryPowerWidget(signals);

    if (!__dashboardFirstPaintDone) {
      __dashboardFirstPaintDone = true;
      if (__dashboardLoaderFallbackTimer) {
        clearTimeout(__dashboardLoaderFallbackTimer);
        __dashboardLoaderFallbackTimer = null;
      }
      hideDashboardLoader(false);
    }

    document.querySelectorAll(".ud-card").forEach((el, i) => {
      setTimeout(() => el.classList.add("is-visible"), i * 80);
    });
  }

  async function fetchTodayTrainingInfo(userId, core, signals){
    const out = {
      trainingDone: false,
      trainingProgressPct: 0,
      trainingProgressLabel: `${ti("trainingProgress")}: 0%`,
      nutritionPct: 0,
      weeklyCompletionPct: 0,
      weekly: null,
      yesterdayTotalPct: 0,
      yesterdayShort: ti("noData"),
      microcycleSelected: false
      ,
      dayStreak: 0,
      weekStreak: 0
      ,
      powerPct: 0
      ,
      powerLocked: true,
      powerHint: "",
      powerLockHint: ""
    };

    try {
      if (!window.db || !userId) return out;
      let nutritionModeKey = "modeAthletic";
      const weekId = String(core?.weekId || "");
      let weekMicrocycle = {};
      let weekMicrocycleMode = "";
      const dayKeyToIdx = (key) => {
        const m = String(key || "").match(/day(\d+)/i);
        if (!m) return null;
        const raw = Number(m[1]);
        if (!Number.isFinite(raw)) return null;
        if (raw >= 0 && raw <= 6) return raw;      // day0..day6
        if (raw >= 1 && raw <= 7) return raw - 1;  // day1..day7
        return null;
      };

      if (weekId) {
        let weekData = null;
        const wp = await window.db.collection("weekly_plans").doc(`${userId}_${weekId}`).get();
        if (wp.exists) {
          weekData = wp.data() || {};
        } else {
          // No personal weekly plan yet: treat microcycle as not selected.
          // Do not infer selection state from published templates.
          weekData = null;
        }

        if (weekData) {
          const micro = weekData.microcycle || {};
          weekMicrocycle = micro;
          weekMicrocycleMode = String(weekData.microcycleMode || "").toUpperCase();

          const normalized = {};
          Object.keys(micro).forEach((key) => {
            const idx = dayKeyToIdx(key);
            if (idx === null) return;
            normalized[idx] = String(micro[key] || "").toUpperCase();
          });
          const statuses = Object.values(normalized);
          const hasAny = statuses.length > 0;
          const hasMatch = statuses.some((v) => v === "MATCH");
          const hasRest = statuses.some((v) => v === "REST" || v === "OFF" || v === "RECOVERY");

          if (weekMicrocycleMode === "OFFSEASON") {
            out.microcycleSelected = hasAny && hasRest;
            out.microcycleLockHint = out.microcycleSelected ? "" : ti("offseasonLock");
          } else {
            out.microcycleSelected = hasAny && hasMatch;
            out.microcycleLockHint = out.microcycleSelected ? "" : ti("microcycleLock");
          }
        }
      }

      const jsDay = new Date().getDay();
      const todayIdx = jsDay === 0 ? 6 : jsDay - 1;
      const microVals = Object.keys(weekMicrocycle || {}).reduce((acc, key) => {
        const idx = dayKeyToIdx(key);
        if (idx === null) return acc;
        acc[idx] = String(weekMicrocycle[key] || "").toUpperCase();
        return acc;
      }, {});
      const matchIdxs = Object.keys(microVals).map((k) => Number(k)).filter((k) => microVals[k] === "MATCH");
      const hasMicroValues = Object.keys(microVals).length > 0;
      const isOffseason = hasMicroValues && Object.values(microVals).every((v) => v !== "MATCH");
      const trainLikeIdxs = Object.keys(microVals).map((k) => Number(k)).filter((k) => {
        const st = microVals[k];
        return st && st !== "REST" && st !== "OFF" && st !== "MATCH";
      }).sort((a, b) => a - b);
      let powerRequired = 0;
      if (!isOffseason && matchIdxs.length) {
        const unlockMd4 = matchIdxs.some((m) => (m - todayIdx) === 4);
        const unlockMd1 = matchIdxs.some((m) => (m - todayIdx) === 1);
        if (unlockMd4) powerRequired = 6;
        if (unlockMd1) powerRequired = 4;
      } else if (trainLikeIdxs.length) {
        const first = trainLikeIdxs[0];
        const last = trainLikeIdxs[trainLikeIdxs.length - 1];
        if (todayIdx === first) powerRequired = 6;
        else if (todayIdx === last) powerRequired = 4;
      }
      out.powerLocked = powerRequired <= 0;
      out.powerLockHint = isOffseason ? ti("powerOffseason") : ti("powerLock");
      out.powerHint = powerRequired === 6 ? ti("powerTarget6") : (powerRequired === 4 ? ti("powerTarget4") : "");

      let progressSnap = null;
      try {
        progressSnap = await window.db
          .collection("athlete_daily_progress")
          .where("uid", "==", userId)
          .orderBy("dateId", "desc")
          .limit(140)
          .get();
      } catch {
        // Fallback for projects without composite index yet.
        progressSnap = await window.db.collection("athlete_daily_progress").where("uid", "==", userId).get();
      }
      const allProgressRows = [];
      const tId = todayId();
      const yDate = new Date();
      yDate.setDate(yDate.getDate() - 1);
      const yId = `${yDate.getFullYear()}-${String(yDate.getMonth()+1).padStart(2,"0")}-${String(yDate.getDate()).padStart(2,"0")}`;

      let bestProgress = null;
      let yProgress = null;
      progressSnap.forEach((doc) => {
        const data = doc.data() || {};
        allProgressRows.push(data);
        const dId = String(data.dateId || "");
        if (dId === tId) {
          if (!bestProgress || Number(data.updatedAt?.toMillis?.() || 0) > Number(bestProgress.updatedAt?.toMillis?.() || 0)) {
            bestProgress = data;
          }
        }
        if (dId === yId) {
          if (!yProgress || Number(data.updatedAt?.toMillis?.() || 0) > Number(yProgress.updatedAt?.toMillis?.() || 0)) {
            yProgress = data;
          }
        }
      });
      out.dayStreak = calcDailyStreak(allProgressRows);
      out.weekStreak = calcWeeklyStreak(allProgressRows);

      try {
        const powerSnap = await window.db
          .collection("power_tests")
          .doc(userId)
          .collection("tests")
          .orderBy("createdAtMs", "desc")
          .limit(20)
          .get();
        let bestTodayCount = 0;
        powerSnap.forEach((doc) => {
          const d = doc.data() || {};
          const dateStr = String(d?.date || "");
          if (dateStr && dateStr.slice(0, 10) === tId) {
            bestTodayCount = Math.max(bestTodayCount, Math.max(0, Number(d?.count || 0)));
          }
        });
        if (out.powerLocked) out.powerPct = 0;
        else if (powerRequired > 0) out.powerPct = Math.max(0, Math.min(100, Math.round((bestTodayCount / powerRequired) * 100)));
        else out.powerPct = bestTodayCount > 0 ? 100 : 0;
      } catch {}

      const weekIdNow = String(core?.weekId || "");
      const weekRows = [];
      if (weekIdNow) {
        progressSnap.forEach((doc) => {
          const data = doc.data() || {};
          if (String(data.weekId || "") === weekIdNow) weekRows.push(data);
        });
      }

      const wr = weekRangeFromCoreWeekId(core?.weekId);
      const weekly = {
        trainingPct: out.weeklyCompletionPct || 0,
        trainingModeLabel: modeBadgeLabel(String(core?.mode || "TRAIN")),
        nutritionPct: 0,
        loadPct: 0,
        microcyclePct: out.microcycleSelected ? 100 : 0,
        totalDistanceKm: 0,
        eatenKcal: 0,
        targetKcal: 0,
        painAvg: Number(signals?.injury?.pain || 0) || 0,
        painLocation: String(signals?.injury?.location || ""),
        painTrendKey: "painStable",
        painStatusKey: "painGood",
        painPct: 0,
        wellnessPct: 0,
        wellnessWarning: true,
        wellnessDanger: false,
        wellnessStatusKey: "insufficientData",
        loadStatusKey: "insufficientData",
        loadWarning: true,
        loadDanger: false,
        injuryHref: "injury.html",
        doctorAlert: false,
        overallPct: 0,
        risk: Number(core?.risk || 0) || 0,
        weekStreak: out.weekStreak,
        nutritionModeKey,
        injuryStatusKey: "painGood",
        trainingCount: 0,
        weekNumber: getIsoWeekNumber(wr.start)
      };

      if (weekIdNow) {
        const pctByDay = {};
        weekRows.forEach((r) => {
          const idx = Number(r?.dayIdx);
          if (Number.isInteger(idx) && idx >= 0 && idx <= 6) {
            pctByDay[idx] = Math.max(0, Math.min(100, Number(r.progressPct) || 0));
          }
        });
        let requiredDays = Object.keys(microVals)
          .map((k) => Number(k))
          .filter((x) => Number.isInteger(x) && x >= 0 && x <= 6)
          .filter((idx) => {
            const st = String(microVals[idx] || "").toUpperCase();
            return st === "TRAIN" || st === "MATCH" || st === "LIGHT" || st === "REHAB";
          });
        if (!requiredDays.length) requiredDays = [0,1,2,3,4,5,6];
        const sum = requiredDays.reduce((acc, idx) => acc + (pctByDay[idx] ?? 0), 0);
        weekly.trainingPct = requiredDays.length ? Math.round(sum / requiredDays.length) : 0;
        weekly.trainingCount = requiredDays.length;
        out.weeklyCompletionPct = weekly.trainingPct;
      }

      try {
        const planDoc = await window.db.collection("athlete_plans").doc(userId).get();
        if (planDoc.exists) {
          const pd = planDoc.data() || {};
          const modeRaw = String(pd?.analysis?.modeCode || pd?.analysis?.mode || "").toLowerCase();
          if (modeRaw.includes("mg") || modeRaw.includes("gain")) nutritionModeKey = "modeGain";
          else if (modeRaw.includes("wl") || modeRaw.includes("control") || modeRaw.includes("loss")) nutritionModeKey = "modeControl";
          else nutritionModeKey = "modeAthletic";
          weekly.nutritionModeKey = nutritionModeKey;
          const pctFromPlan = (planObj) => {
            const plan = planObj || {};
            const allMeals = []
              .concat(Array.isArray(plan.brf) ? plan.brf : [])
              .concat(Array.isArray(plan.lnc) ? plan.lnc : [])
              .concat(Array.isArray(plan.din) ? plan.din : []);
            if (!allMeals.length) return null;
            const eaten = allMeals.filter((m) => Boolean(m?.eaten)).length;
            return Math.max(0, Math.min(100, Math.round((eaten / allMeals.length) * 100)));
          };

          let dailyPct = null;
          if (pd.weeklyPlan && typeof pd.weeklyPlan === "object" && pd.weeklyPlan[tId]) {
            dailyPct = pctFromPlan(pd.weeklyPlan[tId]);
          }
          if (dailyPct === null && String(pd.activeDayId || "") === tId) {
            dailyPct = pctFromPlan(pd.plan || {});
          }
          if (dailyPct === null && String(pd.serverDateId || "") === tId) {
            dailyPct = pctFromPlan(pd.plan || {});
          }
          if (dailyPct !== null) out.nutritionPct = dailyPct;
        }
      } catch {}

      try {
        const dailyDoc = await window.db.collection("athlete_nutrition_daily").doc(`${userId}_${tId}`).get();
        if (dailyDoc.exists) {
          const d = dailyDoc.data() || {};
          out.nutritionPct = Math.max(0, Math.min(100, Number(d.completionPct || out.nutritionPct || 0)));
        }
      } catch {}

      try {
        let nutSnap = null;
        let nutSnapUid = null;
        try {
          nutSnap = await window.db
            .collection("athlete_nutrition_daily")
            .where("userId", "==", userId)
            .where("date", ">=", wr.startId)
            .where("date", "<=", wr.endId)
            .get();
        } catch {
          nutSnap = await window.db.collection("athlete_nutrition_daily").where("userId", "==", userId).get();
        }
        // Compatibility: some rows are stored under `uid` instead of `userId`.
        try {
          nutSnapUid = await window.db
            .collection("athlete_nutrition_daily")
            .where("uid", "==", userId)
            .where("date", ">=", wr.startId)
            .where("date", "<=", wr.endId)
            .get();
        } catch {
          try {
            nutSnapUid = await window.db.collection("athlete_nutrition_daily").where("uid", "==", userId).get();
          } catch {
            nutSnapUid = null;
          }
        }
        let nDone = 0;
        let nTotal = 0;
        let kcalEaten = 0;
        let kcalTarget = 0;
        const seenNutIds = new Set();
        const processNutDoc = (doc) => {
          const d = doc.data() || {};
          const dk = doc.id || `${d.date || ""}_${d.userId || d.uid || ""}`;
          if (seenNutIds.has(dk)) return;
          seenNutIds.add(dk);
          const id = String(d.date || "");
          if (id >= wr.startId && id <= wr.endId) {
            nTotal += 1;
            const p = Math.max(0, Math.min(100, Number(d.completionPct || 0)));
            nDone += p / 100;
            kcalEaten += Math.max(0, Number(d.eatenKcal || 0));
            kcalTarget += Math.max(0, Number(d.targetKcal || 0));
            if (id === tId) {
              out.nutritionPct = Math.max(out.nutritionPct, p);
            }
          }
        };
        nutSnap?.forEach(processNutDoc);
        nutSnapUid?.forEach(processNutDoc);
        weekly.eatenKcal = kcalEaten;
        weekly.targetKcal = kcalTarget;
        const pctByChecks = nTotal ? Math.round((nDone / 7) * 100) : 0;
        weekly.nutritionPct = Math.max(0, Math.min(100, pctByChecks));
        if (!nTotal) {
          const dayOfWeek = new Date().getDay();
          const daysSinceMonday = ((dayOfWeek + 6) % 7) + 1;
          const fallback = Math.round((Math.max(0, Number(out.nutritionPct || 0)) / Math.max(1, daysSinceMonday)));
          weekly.nutritionPct = Math.max(0, Math.min(100, fallback));
        }
      } catch {}

      try {
        let loadSnap = null;
        try {
          loadSnap = await window.db
            .collection("load_season_reports")
            .where("userId", "==", userId)
            .where("date", ">=", wr.startId)
            .where("date", "<=", wr.endId)
            .get();
        } catch {
          loadSnap = await window.db.collection("load_season_reports").where("userId", "==", userId).get();
        }
        let loadDays = 0;
        let dist = 0;
        loadSnap.forEach((doc) => {
          const d = doc.data() || {};
          const id = String(d.date || "");
          if (id >= wr.startId && id <= wr.endId) {
            loadDays += 1;
            dist += Math.max(0, Number(d.distance || 0));
          }
        });
        weekly.loadPct = Math.round((loadDays / 7) * 100);
        weekly.totalDistanceKm = dist;
        const acwr = Number(core?.breakdown?.load?.acwr ?? core?.acwr ?? signals?.load?.acwr ?? signals?.load?.ACWR ?? null);
        weekly.loadAcwr = Number.isFinite(acwr) ? acwr : null;
        if (loadDays < 3) {
          weekly.loadStatusKey = "insufficientData";
          weekly.loadWarning = true;
          weekly.loadDanger = false;
        } else if (Number.isFinite(acwr) && acwr >= 1.5) {
          weekly.loadStatusKey = "loadHigh";
          weekly.loadWarning = false;
          weekly.loadDanger = true;
        } else if (Number.isFinite(acwr) && acwr < 0.8) {
          weekly.loadStatusKey = "loadUnder";
          weekly.loadWarning = true;
          weekly.loadDanger = false;
        } else {
          weekly.loadStatusKey = "loadOptimal";
          weekly.loadWarning = false;
          weekly.loadDanger = false;
        }
      } catch {}

      try {
        const ws = Array.isArray(signals?.wellnessRecent) ? signals.wellnessRecent : [];
        const daySet = new Set();
        ws.forEach((w) => {
          const id = String(w?.date || dateIdFromAny(w?.timestamp) || "");
          if (id && id >= wr.startId && id <= wr.endId) daySet.add(id);
        });
        const filledDays = daySet.size;
        weekly.wellnessPct = Math.round((filledDays / 7) * 100);
        if (filledDays < 3) {
          weekly.wellnessStatusKey = "insufficientData";
          weekly.wellnessWarning = true;
          weekly.wellnessDanger = false;
        } else {
          weekly.wellnessStatusKey = "loadOptimal";
          weekly.wellnessWarning = false;
          weekly.wellnessDanger = false;
        }
      } catch {}

      try {
        const injSnap = await window.db.collection("injuries").where("userId", "==", userId).get();
        const pts = [];
        let chosenInjuryId = "";
        let chosenPain = -1;
        injSnap.forEach((doc) => {
          const d = doc.data() || {};
          const hist = Array.isArray(d.history) ? d.history : [];
          hist.forEach((h) => {
            const id = String(h?.date || "");
            const p = Number(h?.pain);
            if (id && id >= wr.startId && id <= wr.endId && Number.isFinite(p)) {
              pts.push({ id, pain: Math.max(0, Math.min(10, p)) });
            }
          });
          const topPain = Number(d?.pain ?? 0);
          if (Number.isFinite(topPain) && topPain > chosenPain) {
            chosenPain = topPain;
            chosenInjuryId = doc.id;
          }
        });
        pts.sort((a,b) => a.id.localeCompare(b.id));
        if (pts.length) {
          const avg = pts.reduce((acc, x) => acc + x.pain, 0) / pts.length;
          weekly.painAvg = avg;
          const delta = pts[pts.length - 1].pain - pts[0].pain;
          if (delta > 0.7) weekly.painTrendKey = "painWorse";
          else if (delta < -0.7) weekly.painTrendKey = "painImproving";
          else weekly.painTrendKey = "painStable";
          const isWorse = weekly.painTrendKey === "painWorse";
          const painNow = pts[pts.length - 1].pain;
          weekly.painPct = Math.max(0, Math.min(100, Math.round(painNow * 10)));
          if (painNow >= 5 || (painNow >= 4 && isWorse)) weekly.painStatusKey = "painBad";
          else if (painNow >= 3 || isWorse) weekly.painStatusKey = "painWarning";
          else weekly.painStatusKey = "painGood";
          weekly.doctorAlert = weekly.painStatusKey === "painBad";
          weekly.injuryStatusKey = weekly.painStatusKey;
          const top = pts[pts.length - 1];
          if (top) weekly.painAvg = top.pain;
        } else {
          const painNow = Math.max(0, Math.min(10, Number(signals?.injury?.pain || 0) || 0));
          weekly.painAvg = painNow;
          weekly.painPct = Math.max(0, Math.min(100, Math.round(painNow * 10)));
          if (painNow >= 5) weekly.painStatusKey = "painBad";
          else if (painNow >= 3) weekly.painStatusKey = "painWarning";
          else weekly.painStatusKey = "painGood";
          weekly.injuryStatusKey = weekly.painStatusKey;
          weekly.doctorAlert = weekly.painStatusKey === "painBad";
        }
        weekly.injuryHref = chosenInjuryId ? `injury.html?injuryId=${encodeURIComponent(chosenInjuryId)}` : "injury.html";
      } catch {}

      weekly.overallPct = Math.round((weekly.trainingPct + weekly.nutritionPct + weekly.loadPct + weekly.wellnessPct) / 4);
      out.weekly = weekly;

      const yWell = docDateId(signals?.wellness) === yId ? 100 : 0;
      const yLoad = docDateId(signals?.load) === yId ? 100 : 0;
      const yWeight = (getWeightPair(signals).currDate === yId) ? 100 : 0;
      const yTrain = Math.max(0, Math.min(100, Number(yProgress?.progressPct || 0)));
      out.yesterdayTotalPct = Math.round((yWell + yLoad + yWeight + yTrain) / 4);
      out.yesterdayShort = `wellness ${yWell}%, load ${yLoad}%, weight ${yWeight}%, training ${yTrain}%`;

      if (bestProgress) {
        const pct = Math.max(0, Math.min(100, Number(bestProgress.progressPct) || 0));
        out.trainingDone = pct >= 100;
        out.trainingProgressPct = pct;
        out.trainingProgressLabel = `${ti("trainingProgress")}: ${pct}%`;
        return out;
      }

      let snap = null;
      try {
        snap = await window.db
          .collection("athlete_reports")
          .where("uid", "==", userId)
          .orderBy("timestamp", "desc")
          .limit(20)
          .get();
      } catch {
        snap = await window.db.collection("athlete_reports").where("uid", "==", userId).get();
      }
      const todayReports = [];
      snap.forEach((doc) => {
        const data = doc.data() || {};
        const dId = dateIdFromAny(data.timestamp);
        if (dId === tId) todayReports.push(data);
      });

      const isRest = String(core?.breakdown?.plannedDayStatus || "TRAIN").toUpperCase() === "REST";
      if (isRest) {
        out.trainingDone = true;
        out.trainingProgressPct = 100;
        out.trainingProgressLabel = `${ti("trainingProgress")}: rest day`;
        return out;
      }

      if (todayReports.length > 0) {
        out.trainingDone = true;
        out.trainingProgressPct = 100;
        out.trainingProgressLabel = `${ti("trainingProgress")}: 100%`;
      } else {
        out.trainingProgressLabel = `${ti("trainingProgress")}: 0%`;
      }

      return out;
    } catch {
      return out;
    }
  }

  function dailyInfoCacheKey(userId, core){
    const uid = String(userId || "");
    const weekId = String(core?.weekId || "");
    const dayId = todayId();
    return `${uid}|${weekId}|${dayId}`;
  }

  async function fetchTodayTrainingInfoCached(userId, core, signals, opts = {}){
    const force = Boolean(opts && opts.force);
    const key = dailyInfoCacheKey(userId, core);
    const now = Date.now();
    const ttlMs = 25000;

    if (
      !force &&
      __dailyInfoCacheValue &&
      __dailyInfoCacheKey === key &&
      (now - __dailyInfoCacheAtMs) < ttlMs
    ) {
      return __dailyInfoCacheValue;
    }

    if (!force && __dailyInfoInFlight && __dailyInfoInFlight.key === key) {
      return __dailyInfoInFlight.promise;
    }

    const promise = fetchTodayTrainingInfo(userId, core, signals)
      .then((result) => {
        __dailyInfoCacheKey = key;
        __dailyInfoCacheAtMs = Date.now();
        __dailyInfoCacheValue = result;
        return result;
      })
      .finally(() => {
        if (__dailyInfoInFlight && __dailyInfoInFlight.key === key) {
          __dailyInfoInFlight = null;
        }
      });

    __dailyInfoInFlight = { key, promise };
    return promise;
  }

  let __lastCore = null;
  let __lastSignals = null;
  let __lastDailyInfo = null;
  let __coreReadySeq = 0;
  let __dashRefreshTimer = null;
  let __dashRefreshInFlight = false;
  let __dashLastRefreshMs = 0;
  let __sourceBackfillTimer = null;
  let __dailyInfoCacheKey = "";
  let __dailyInfoCacheAtMs = 0;
  let __dailyInfoCacheValue = null;
  let __dailyInfoInFlight = null;

  async function refreshDashboardNow(reason = "manual") {
    const uid = window.firebase?.auth?.().currentUser?.uid || null;
    if (!uid) return;
    if (__dashRefreshInFlight) return;
    const now = Date.now();
    if (now - __dashLastRefreshMs < 700) return;

    __dashRefreshInFlight = true;
    try {
      if (typeof window.refreshAthleteCore === "function") {
        await window.refreshAthleteCore();
      } else if (__lastCore && __lastSignals) {
        const dailyInfo = await fetchTodayTrainingInfoCached(uid, __lastCore, __lastSignals);
        __lastCore.__dailyInfo = dailyInfo;
        __lastCore.__trainingProgressLabel = dailyInfo?.trainingProgressLabel || `${ti("trainingProgress")}: 0%`;
        __lastDailyInfo = dailyInfo;
        render(__lastCore, __lastSignals);
        renderWeeklyPerformance(dailyInfo?.weekly || null);
      }
      __dashLastRefreshMs = Date.now();
    } catch (e) {
      console.warn(`dashboard refresh failed (${reason}):`, e?.message || e);
    } finally {
      __dashRefreshInFlight = false;
    }
  }

  function scheduleDashboardRefresh(delayMs = 180, reason = "scheduled") {
    if (__dashRefreshTimer) clearTimeout(__dashRefreshTimer);
    __dashRefreshTimer = setTimeout(() => {
      __dashRefreshTimer = null;
      refreshDashboardNow(reason).catch(() => {});
    }, Math.max(0, Number(delayMs || 0)));
  }

  function scheduleManualSourceBackfill(uid, delayMs = 2600) {
    if (!uid) return;
    if (__sourceBackfillTimer) clearTimeout(__sourceBackfillTimer);
    __sourceBackfillTimer = setTimeout(() => {
      __sourceBackfillTimer = null;
      runManualSourceBackfill(uid).catch(() => {});
    }, Math.max(0, Number(delayMs || 0)));
  }

  function initDashboardControls(){
    if ($("udBackBtn")) $("udBackBtn").textContent = ti("back");
    if ($("udToggleInsights")) $("udToggleInsights").textContent = ti("showInsights");
    if ($("udYesterdaySummary")) $("udYesterdaySummary").textContent = `${ti("yesterday")}: —`;
    if ($("syncKicker")) $("syncKicker").textContent = ti("syncCenter");
    if ($("syncTitle")) $("syncTitle").textContent = ti("syncTitleManual");
    if ($("syncStatus")) $("syncStatus").textContent = ti("syncReady");
    if ($("syncLastAt")) $("syncLastAt").textContent = `${ti("syncLast")}: —`;
    if ($("syncFreshness")) $("syncFreshness").textContent = `${ti("syncFreshness")}: —`;
    if ($("syncConnected")) $("syncConnected").textContent = `${ti("syncConnected")}: —`;
    if ($("syncTodayBtn")) $("syncTodayBtn").textContent = ti("syncToday");
    if ($("syncRiskLabel")) $("syncRiskLabel").textContent = ti("syncRiskLabel");
    if ($("syncModeLabel")) $("syncModeLabel").textContent = ti("syncModeLabel");
    if ($("syncSourceLabel")) $("syncSourceLabel").textContent = ti("syncSourceLabel");
    if ($("syncSource")) $("syncSource").textContent = ti("syncSourceManual");
    if ($("syncAdviceTitle")) $("syncAdviceTitle").textContent = ti("syncAdviceTitle");
    if ($("rxpKicker")) $("rxpKicker").textContent = ti("rxpKicker");
    if ($("rxpRecoveryLabel")) $("rxpRecoveryLabel").textContent = ti("rxpRecoveryLabel");
    if ($("rxpPowerLabel")) $("rxpPowerLabel").textContent = ti("rxpPowerLabel");
    if ($("rxpActionLabel")) $("rxpActionLabel").textContent = ti("rxpActionLabel");
    if ($("syncResultLabelStatus")) $("syncResultLabelStatus").textContent = ti("syncResultStatusLabel");
    if ($("syncResultLabelReceived")) $("syncResultLabelReceived").textContent = ti("syncResultReceivedLabel");
    if ($("syncResultLabelMissing")) $("syncResultLabelMissing").textContent = ti("syncResultMissingLabel");
    if ($("syncResultLabelMode")) $("syncResultLabelMode").textContent = ti("syncResultModeLabel");
    if ($("syncResultLabelRisk")) $("syncResultLabelRisk").textContent = ti("syncResultRiskLabel");
    if ($("syncResultLabelTraining")) $("syncResultLabelTraining").textContent = ti("syncResultTrainingLabel");
    if ($("syncResultLabelBreath")) $("syncResultLabelBreath").textContent = ti("syncResultBreathLabel");
    if ($("syncOverlayClose")) $("syncOverlayClose").textContent = ti("syncClose");

    const kickers = document.querySelectorAll(".ud-kicker");
    if (kickers[0]) kickers[0].textContent = ti("exec");
    if (kickers[1]) kickers[1].textContent = ti("weeklyKicker");

    document.querySelectorAll(".ud-actions a").forEach((a) => {
      const href = a.getAttribute("href") || "";
      if (href.includes("wellness")) a.textContent = ti("fillWellness");
      else if (href.includes("load-season")) a.textContent = ti("logLoad");
      else if (href.includes("daily-individual")) a.textContent = ti("goTraining");
      else if (href.includes("injury")) a.textContent = ti("updateInjury");
    });

    if ($("udBackBtn") && !$("udBackBtn").dataset.bound) {
      const params=new URLSearchParams(location.search),targetUid=params.get('userId');
      const delegated=Boolean(targetUid&&targetUid!==window.firebase?.auth?.().currentUser?.uid&&(params.get('fromCoach')==='1'||params.get('fromAdmin')==='1'||params.get('asAdmin')==='1'));
      $("udBackBtn").hidden=!delegated;
      $("udBackBtn").addEventListener("click", () => {
        window.location.href = params.get('fromCoach')==='1'?"coach-dashboard.html":"../admin.html";
      });
      $("udBackBtn").dataset.bound = "1";
    }
    if($('udProfileLink')){const params=new URLSearchParams(location.search),out=new URLSearchParams();for(const key of ['userId','fromCoach','fromAdmin','asAdmin','coachId'])if(params.has(key))out.set(key,params.get(key));$('udProfileLink').href='profile.html'+(out.size?'?'+out:'');$('udProfileLink').textContent=lang()==='uk'?(out.has('userId')?'Дані атлета':'Мої дані'):(out.has('userId')?'Athlete data':'My data');}

    if ($("udToggleInsights") && !$("udToggleInsights").dataset.bound) {
      $("udToggleInsights").addEventListener("click", () => {
        const insights = $("udInsights");
        if (!insights) return;
        const willOpen = insights.hasAttribute("hidden");
        if (willOpen) insights.removeAttribute("hidden");
        else insights.setAttribute("hidden", "");
        $("udToggleInsights").textContent = willOpen ? ti("hideInsights") : ti("showInsights");
        $("udToggleInsights").setAttribute("aria-expanded", willOpen ? "true" : "false");
      });
      $("udToggleInsights").dataset.bound = "1";
    }

    if ($("syncTodayBtn") && !$("syncTodayBtn").dataset.bound) {
      $("syncTodayBtn").addEventListener("click", () => {
        runSyncToday().catch((e) => console.warn("sync run failed:", e));
      });
      $("syncTodayBtn").dataset.bound = "1";
    }
    if ($("syncOverlayClose") && !$("syncOverlayClose").dataset.bound) {
      $("syncOverlayClose").addEventListener("click", closeSyncOverlay);
      $("syncOverlayClose").dataset.bound = "1";
    }
  }

  document.addEventListener("athletecore:ready", async (e) => {
    const core = e?.detail?.core || null;
    const signals = e?.detail?.signals || null;
    if (!core || !signals) return;

    if (__dashboardFirstPaintDone && !syncState.pending && (Date.now() - __dashLastRefreshMs) < 7000) {
      return;
    }

    const userId = e?.detail?.userId || window.firebase?.auth?.().currentUser?.uid || null;
    const fallbackTrainingLabel = `${ti("trainingProgress")}: 0%`;
    const seedDailyInfo = (core?.__dailyInfo && typeof core.__dailyInfo === "object")
      ? core.__dailyInfo
      : (__lastDailyInfo && typeof __lastDailyInfo === "object" ? __lastDailyInfo : null);

    const seq = ++__coreReadySeq;
    const tasks = await Promise.allSettled([
      userId ? readConnectedSync(userId) : Promise.resolve(null),
      fetchTodayTrainingInfoCached(userId, core, signals, { force: syncState.pending })
    ]);
    if (seq !== __coreReadySeq) return;

    syncState.source = detectSyncSource(signals);

    const dailyInfoResult = tasks[1];
    const dailyInfo = (dailyInfoResult && dailyInfoResult.status === "fulfilled" && dailyInfoResult.value)
      ? dailyInfoResult.value
      : seedDailyInfo;

    core.__dailyInfo = dailyInfo;
    core.__trainingProgressLabel = String(dailyInfo?.trainingProgressLabel || fallbackTrainingLabel);
    __lastCore = core;
    __lastSignals = signals;
    __lastDailyInfo = dailyInfo;
    __dashLastRefreshMs = Date.now();

    render(core, signals);
    renderWeeklyPerformance(dailyInfo?.weekly || null);
    renderSyncCenter(core, { status: syncState.pending ? "ok" : "ready", signals });

    const syncUserId = userId || window.firebase?.auth?.().currentUser?.uid || null;
    if (syncState.pending && syncUserId) {
      if (syncState.timer) {
        clearTimeout(syncState.timer);
        syncState.timer = null;
      }
      try {
        await persistSyncSnapshot(syncUserId, core, signals, "ok");
      } catch (err) {
        console.warn("sync persist failed:", err);
        try {
          await persistSyncSnapshot(syncUserId, core, signals, "failed", String(err?.message || err || "persist failed"));
        } catch (_) {}
        renderSyncCenter(core, { status: "failed", signals });
        showSyncOverlayResult(core, signals, true);
      }
      syncState.pending = false;
      setSyncBtnState(false);
      showSyncOverlayResult(core, signals, false);
    } else if (syncUserId) {
      hydrateSyncMeta(syncUserId).catch(() => {});
    }
  });

  window.addEventListener("load", () => {
    const loaderTextByLang = {
      uk: "Синхронізуємо метрики спортсмена і готуємо дашборд.",
      en: "Syncing athlete metrics and building dashboard.",
      de: "Athletenmetriken werden synchronisiert, Dashboard wird vorbereitet.",
      es: "Sincronizando métricas del atleta y preparando el panel.",
      ru: "Синхронизируем метрики спортсмена и готовим дашборд.",
      pt: "Sincronizando métricas do atleta e preparando o dashboard."
    };
    const subTextByLang = {
      uk: "Завантажуємо AthleteCore...",
      en: "Loading AthleteCore...",
      de: "AthleteCore wird geladen...",
      es: "Cargando AthleteCore...",
      ru: "Загружаем AthleteCore...",
      pt: "Carregando AthleteCore..."
    };
    const activeLang = lang();
    const loaderText = loaderTextByLang[activeLang] || loaderTextByLang.uk;
    showDashboardLoader(loaderText);
    armDashboardLoaderFallback();
    const udSubEl = $("udSub");
    if (udSubEl) {
      const currentSub = String(udSubEl.textContent || "").trim();
      if (!currentSub || currentSub === "..." || /^(?:loading|завантаж|загрузка|lädt|cargando|carregando)/i.test(currentSub)) {
        udSubEl.textContent = subTextByLang[activeLang] || subTextByLang.uk;
      }
    }
    initDashboardControls();
    setSyncBtnState(false);
    renderSyncCenter(__lastCore, { status: "ready", signals: __lastSignals });
    const authUid = window.firebase?.auth?.().currentUser?.uid || null;
    if (authUid) {
      hydrateSyncMeta(authUid).catch(() => {});
      scheduleManualSourceBackfill(authUid);
    }
    if (window.firebase?.auth && typeof window.firebase.auth === "function") {
      window.firebase.auth().onAuthStateChanged((user) => {
        const uid = user?.uid || null;
        if (uid) {
          hydrateSyncMeta(uid).catch(() => {});
          scheduleManualSourceBackfill(uid);
          if (__dashboardFirstPaintDone) {
            scheduleDashboardRefresh(220, "auth");
          }
        }
      });
    }
  });

  window.addEventListener("pageshow", () => {
    scheduleDashboardRefresh(120, "pageshow");
  });
  window.addEventListener("focus", () => {
    scheduleDashboardRefresh(120, "focus");
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      scheduleDashboardRefresh(120, "visibility");
    }
  });
  window.addEventListener("storage", (ev) => {
    const key = String(ev?.key || "");
    if (key === "pac_nutrition_updated_at" || key === "pac_training_updated_at") {
      scheduleDashboardRefresh(120, `storage:${key}`);
    }
  });
  window.addEventListener("pac:nutrition-updated", () => {
    scheduleDashboardRefresh(100, "nutrition-event");
  });

  window.addEventListener("pac:lang-changed", () => {
    initDashboardControls();
    if (__lastCore && __lastSignals) {
      __lastCore.__dailyInfo = __lastDailyInfo;
      __lastCore.__trainingProgressLabel = __lastDailyInfo?.trainingProgressLabel || `${ti("trainingProgress")}: 0%`;
      render(__lastCore, __lastSignals);
      renderWeeklyPerformance(__lastDailyInfo?.weekly || null);
      renderSyncCenter(__lastCore, { status: "ready", signals: __lastSignals });
    }
  });
})();
