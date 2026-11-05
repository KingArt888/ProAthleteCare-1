// daily-individual.js — ProAtletCare (PREMIUM FINAL WITH LOCAL LOGO)

(function() {
    const STAGES_LIST = ['Pre-Training', 'Main Training', 'Post-Training'];
    let selectedRPE = 0;
    let selectedStars = 0;
    let players = {};
    const playerVideoIds = {};
    const exerciseTimers = {};
    let activeExerciseTimerId = null;
    let exerciseFlowOrder = [];
    let CURRENT_UID = null;
    let CURRENT_SCOPE = null;
    let CURRENT_WEEK_ID = null;
    let CURRENT_DAY_IDX = null;
    let CURRENT_DAY_STATUS = "TRAIN";
    let CURRENT_VARIANT_KEY = null;
    let CURRENT_VARIANT_INDEX = null;
    let CURRENT_USER_DATA = {};
    let CURRENT_TOTAL_EXERCISES = 0;
    let DONE_EXERCISES_MAP = {};
    let CURRENT_SPORT_PROFILE = "TEAM_MD";
    let exerciseMetaById = {};
    let exerciseMetaByKey = {};
    const ELITE_PERF_KEY = "pac_di_elite_perf_v1";
    const ELITE_EXEC = {
      open: false,
      exId: null,
      setIndex: 1,
      totalSets: 1,
      workSec: 0,
      restSec: 0,
      leftSec: 0,
      phase: "idle", // idle | preset | active | rest | complete
      intervalId: null,
      autoStartTimer: null,
      repIntervalId: null,
      completeDelayTimer: null,
      repTarget: 0,
      repDone: 0,
      repTickMs: 0,
      sideMode: false,
      sideIndex: 0,
      sideTotal: 1,
      currentLoadKg: null,
      roleMap: [],
      setDurations: [],
      paused: false,
      voiceMuted: false
    };
    const drillCanvasTargetCache = {};
    let ELITE_YT_PLAYER = null;
    let ELITE_YT_VIDEO_ID = "";
    const ELITE_MEDIA = { key: "", token: 0, timeout: null };
    const ELITE_STRENGTH = { store: null, run: null, error: "", checkpoint: null };
    const ELITE_REST_AUDIO = { context: null, nodes: new Set(), seen: new Set(), deadline: 0 };
    const ELITE_RUNNING = { live: null, loading: false, error: "", envelope: null };
    const RUNNING_AUDIO_GUIDE = window.PACRunningAudioGuide?.create();
    let DAILY_JOURNAL=null,DAILY_JOURNAL_UID=null;
    let coachVoiceCache = null;
    let coachVoiceCacheLang = "";
    let lastCoachSpeakSig = "";
    let lastCoachSpeakAt = 0;

    function normalizeDailySportType(raw) {
      const s = String(raw || "").trim().toLowerCase();
      if (!s) return "";
      if (s === "soccer") return "football";
      return s;
    }
    function dailySportProfileFromType(raw) {
      const sport = normalizeDailySportType(raw);
      if (["football", "futsal", "rugby", "hockey"].includes(sport)) return "TEAM_MD";
      if (["basketball", "volleyball", "handball", "tennis"].includes(sport)) return "COURT_MD";
      if (["athletics", "other"].includes(sport)) return "INDIVIDUAL_ENDURANCE";
      return "TEAM_MD";
    }
    function dailyMatchWindow(profile = CURRENT_SPORT_PROFILE) {
      const p = String(profile || "TEAM_MD").toUpperCase();
      if (p === "COURT_MD") return { preMax: 4, postMax: 2 };
      if (p === "INDIVIDUAL_ENDURANCE") return { preMax: 2, postMax: 1 };
      return { preMax: 4, postMax: 2 };
    }
    function dailyStatusByDiff(diff, profile = CURRENT_SPORT_PROFILE) {
      if (!Number.isFinite(diff) || diff === 0) return null;
      const w = dailyMatchWindow(profile);
      if (diff < 0 && diff >= -w.preMax) return `MD${diff}`;
      if (diff > 0 && diff <= w.postMax) return `MD+${diff}`;
      return null;
    }

    const DAILY_I18N = {
      uk: {
        title: "Daily Individual | ProAthleteCare",
        tagline: "Онлайн-тренінг та професійний супровід атлетів",
        pageTitle: "🔥 Ваш Індивідуальний План",
        loading: "Завантаження...",
        loadingProfile: "Завантаження профілю атлета...",
        loadingPlan: "Завантаження плану тренування...",
        athlete: "Атлет",
        hello: "Привіт",
        todayPrefix: "Сьогодні",
        coachAdvice: "Порада тренера:",
        personal: "ПЕРСОНАЛЬНО",
        restDay: "ДЕНЬ ВІДПОЧИНКУ",
        done: "Done",
        sets: "SETS",
        reps: "REPS",
        secShort: "СЕК",
        timerStart: "ВИКОНУВАТИ",
        timerStop: "СТОП",
        timerStopped: "ПАУЗА",
        timerDone: "ЗАВЕРШЕНО",
        timerWork: "РОБОТА",
        timerRest: "ПАУЗА",
        timerSet: "ПІДХІД",
        timerSecShort: "с",
        voiceGo: "Почали",
        voiceRest: "Пауза",
        voiceNext: "Наступна вправа",
        voiceDone: "Вправа завершена",
        voiceGreatJob: "Гарна робота. Заповни RPE.",
        rpeTitle: "RPE (Складність)",
        ratingTitle: "Оцінка тренування",
        commentPlaceholder: "Коментар...",
        chooseRpe: "Оберіть RPE",
        daySummaryTitle: "Підсумок тренування",
        daySummaryDone: "Виконано вправ",
        daySummaryMinutes: "Час тренування",
        daySummaryFocus: "Фокус дня",
        daySummaryEmpty: "Ще немає завершених вправ.",
        weeklyMinutesTitle: "Тижневий обсяг",
        weeklyMinutesTotal: "Разом хвилин",
        weeklyMinutesFocus: "Фокус тижня",
        weeklyMinutesEmpty: "Поки немає завершених вправ за цей тиждень.",
        weeklyMinutesHint: "Хвилини рахуються з відмічених вправ.",
        weeklyMinUnit: "хв",
        stagePre: "Підготовка",
        stageMain: "Основна частина",
        stagePost: "Відновлення",
        eliteTitle: "Режим виконання",
        eliteClose: "Закрити",
        eliteTopSet: "TOP SET",
        eliteSet: "ПІДХІД",
        eliteTarget: "ЦІЛЬ",
        eliteRestAfter: "ВІДПОЧИНОК ПІСЛЯ",
        eliteTodayLoad: "СЬОГОДНІШНЯ ВАГА",
        eliteRange: "Діапазон",
        eliteLastTime: "МИНУЛИЙ РАЗ",
        eliteBest: "КРАЩИЙ",
        eliteStartSet: "ПОЧАТИ ПІДХІД",
        eliteCompleteSet: "ЗАВЕРШИТИ ПІДХІД",
        elitePause: "ПАУЗА",
        elitePlay: "ПЛЕЙ",
        elitePaused: "На паузі",
        eliteAutoStartIn: "Автостарт через",
        eliteNextExercise: "НАСТУПНА ВПРАВА",
        elitePrevious: "ПОПЕРЕДНЯ",
        eliteNext: "НАСТУПНА",
        eliteSide: "СТОРОНА",
        elitePerSide: "на сторону",
        eliteFocus: "ФОКУС",
        eliteReadiness: "ГОТОВНІСТЬ",
        eliteFatigue: "ВТОМА",
        eliteHydration: "ГІДРАЦІЯ",
        elitePlannedSets: "ЗАПЛАНОВАНІ ПІДХОДИ",
        eliteAutoreg: "АВТОРЕГУЛЯЦІЯ",
        eliteRoleWarmup: "Розігрів",
        eliteRoleBuild: "Підвідний",
        eliteRoleTop: "Топ-сет",
        eliteRoleBackoff: "Back-off",
        eliteBodyweight: "Вага тіла / техніка",
        eliteGood: "Добрий стан",
        eliteModerate: "Помірно",
        eliteLow: "Низько",
        eliteOnTrack: "Все по плану",
        eliteDone: "Вправу завершено",
        md: "День гри! Максимальна концентрація. Тільки цільові рухи.",
        mdp1: "Відновлення: акцент на мобільності та легкому русі.",
        mdm1: "Активація: короткі вибухові рухи, робота над швидкістю.",
        train: "Стандартне тренування: якість понад усе.",
        rest: "Повне відновлення. Тіло будується під час спокою.",
        statusTrain: "ТРЕНУВАННЯ",
        statusRest: "ВІДПОЧИНОК",
        accessDeniedAthlete: "Немає доступу до цього атлета."
      },
      en: {
        title: "Daily Individual | ProAthleteCare",
        tagline: "Professional athlete support online",
        pageTitle: "🔥 Your Individual Plan",
        loading: "Loading...",
        loadingProfile: "Loading athlete profile...",
        loadingPlan: "Loading training plan...",
        athlete: "Athlete",
        hello: "Hello",
        todayPrefix: "Today",
        coachAdvice: "Coach advice:",
        personal: "PERSONAL",
        restDay: "REST DAY",
        done: "Done",
        sets: "SETS",
        reps: "REPS",
        secShort: "SEC",
        timerStart: "EXECUTE",
        timerStop: "STOP",
        timerStopped: "PAUSED",
        timerDone: "COMPLETE",
        timerWork: "WORK",
        timerRest: "REST",
        timerSet: "SET",
        timerSecShort: "s",
        voiceGo: "Go",
        voiceRest: "Rest",
        voiceNext: "Next exercise",
        voiceDone: "Exercise complete",
        voiceGreatJob: "Great work. Log your RPE.",
        rpeTitle: "RPE (Difficulty)",
        ratingTitle: "Training rating",
        commentPlaceholder: "Comment...",
        chooseRpe: "Choose RPE",
        daySummaryTitle: "Session Summary",
        daySummaryDone: "Completed exercises",
        daySummaryMinutes: "Training time",
        daySummaryFocus: "Session focus",
        daySummaryEmpty: "No completed exercises yet.",
        weeklyMinutesTitle: "Weekly Volume",
        weeklyMinutesTotal: "Total Minutes",
        weeklyMinutesFocus: "Weekly Focus",
        weeklyMinutesEmpty: "No completed exercises for this week yet.",
        weeklyMinutesHint: "Minutes are calculated from completed exercises.",
        weeklyMinUnit: "min",
        stagePre: "Pre-Training",
        stageMain: "Main Training",
        stagePost: "Post-Training",
        eliteTitle: "Execution Mode",
        eliteClose: "Close",
        eliteTopSet: "TOP SET",
        eliteSet: "SET",
        eliteTarget: "TARGET",
        eliteRestAfter: "REST AFTER",
        eliteTodayLoad: "TODAY'S LOAD",
        eliteRange: "Range",
        eliteLastTime: "LAST TIME",
        eliteBest: "BEST",
        eliteStartSet: "START SET",
        eliteCompleteSet: "COMPLETE SET",
        elitePause: "PAUSE",
        elitePlay: "PLAY",
        elitePaused: "Paused",
        eliteAutoStartIn: "Auto start in",
        eliteNextExercise: "NEXT EXERCISE",
        elitePrevious: "PREVIOUS",
        eliteNext: "NEXT",
        eliteSide: "SIDE",
        elitePerSide: "per side",
        eliteFocus: "FOCUS",
        eliteReadiness: "READINESS",
        eliteFatigue: "FATIGUE",
        eliteHydration: "HYDRATION",
        elitePlannedSets: "PLANNED SETS",
        eliteAutoreg: "AUTO REGULATION",
        eliteRoleWarmup: "Warm-up",
        eliteRoleBuild: "Build-up",
        eliteRoleTop: "Top set",
        eliteRoleBackoff: "Back-off",
        eliteBodyweight: "Bodyweight / technique",
        eliteGood: "Good to go",
        eliteModerate: "Moderate",
        eliteLow: "Low",
        eliteOnTrack: "You're on track",
        eliteDone: "Exercise complete",
        md: "Match day. Maximum focus, only target actions.",
        mdp1: "Recovery day: mobility and easy movement.",
        mdm1: "Activation day: short explosive work and speed prep.",
        train: "Regular training day: quality over quantity.",
        rest: "Full recovery. Body adapts during rest.",
        statusTrain: "TRAIN",
        statusRest: "REST",
        accessDeniedAthlete: "Access denied for this athlete."
      },
      de: {}, es: {}, ru: {}, pt: {}
    };
    DAILY_I18N.de = { ...DAILY_I18N.en, tagline: "Professionelle Athletenbetreuung online", pageTitle: "🔥 Dein individueller Plan", loadingProfile: "Athletenprofil wird geladen...", loadingPlan: "Trainingsplan wird geladen...", hello: "Hallo", todayPrefix: "Heute", coachAdvice: "Trainerhinweis:", personal: "PERSÖNLICH", rpeTitle: "RPE (Schwierigkeit)", ratingTitle: "Trainingsbewertung", commentPlaceholder: "Kommentar...", chooseRpe: "RPE wählen" };
    DAILY_I18N.es = { ...DAILY_I18N.en, tagline: "Acompañamiento profesional del atleta online", pageTitle: "🔥 Tu plan individual", loadingProfile: "Cargando perfil del atleta...", loadingPlan: "Cargando plan de entrenamiento...", hello: "Hola", todayPrefix: "Hoy", coachAdvice: "Consejo del entrenador:", personal: "PERSONAL", rpeTitle: "RPE (Dificultad)", ratingTitle: "Valoración del entrenamiento", commentPlaceholder: "Comentario...", chooseRpe: "Elige RPE" };
    DAILY_I18N.ru = { ...DAILY_I18N.en, tagline: "Профессиональное сопровождение атлета онлайн", pageTitle: "🔥 Ваш индивидуальный план", loadingProfile: "Загрузка профиля атлета...", loadingPlan: "Загрузка тренировочного плана...", hello: "Привет", todayPrefix: "Сегодня", coachAdvice: "Совет тренера:", personal: "ПЕРСОНАЛЬНО", rpeTitle: "RPE (Сложность)", ratingTitle: "Оценка тренировки", commentPlaceholder: "Комментарий...", chooseRpe: "Выберите RPE" };
    DAILY_I18N.pt = { ...DAILY_I18N.en, tagline: "Acompanhamento profissional do atleta online", pageTitle: "🔥 Seu plano individual", loadingProfile: "Carregando perfil do atleta...", loadingPlan: "Carregando plano de treino...", hello: "Olá", todayPrefix: "Hoje", coachAdvice: "Conselho do treinador:", personal: "PESSOAL", rpeTitle: "RPE (Dificuldade)", ratingTitle: "Avaliação do treino", commentPlaceholder: "Comentário...", chooseRpe: "Escolha o RPE" };
    Object.assign(DAILY_I18N.de, { stagePre: "Vorbereitung", stageMain: "Hauptteil", stagePost: "Nachbereitung", sets: "SÄTZE", reps: "WDH", done: "Fertig", restDay: "RUHETAG", statusTrain: "TRAINING", statusRest: "ERHOLUNG", accessDeniedAthlete: "Kein Zugriff auf diesen Athleten." });
    Object.assign(DAILY_I18N.es, { stagePre: "Pre-entreno", stageMain: "Entreno principal", stagePost: "Post-entreno", sets: "SERIES", reps: "REPS", done: "Hecho", restDay: "DÍA DE DESCANSO", statusTrain: "ENTRENO", statusRest: "DESCANSO", accessDeniedAthlete: "Acceso denegado para este atleta." });
    Object.assign(DAILY_I18N.ru, { stagePre: "Подготовка", stageMain: "Основная часть", stagePost: "Заминка", sets: "ПОДХОДЫ", reps: "ПОВТОРЫ", done: "Готово", restDay: "ДЕНЬ ОТДЫХА", statusTrain: "ТРЕНИРОВКА", statusRest: "ОТДЫХ", accessDeniedAthlete: "Нет доступа к этому атлету." });
    Object.assign(DAILY_I18N.pt, { stagePre: "Pré-treino", stageMain: "Treino principal", stagePost: "Pós-treino", sets: "SÉRIES", reps: "REPS", done: "Feito", restDay: "DIA DE DESCANSO", statusTrain: "TREINO", statusRest: "DESCANSO", accessDeniedAthlete: "Acesso negado para este atleta." });
    Object.assign(DAILY_I18N.de, {
      voiceGo: "Los",
      voiceRest: "Pause",
      voiceNext: "Nächste Übung",
      voiceDone: "Übung beendet",
      voiceGreatJob: "Starke Arbeit. Trage jetzt dein RPE ein.",
      daySummaryTitle: "Trainingsübersicht",
      daySummaryDone: "Abgeschlossene Übungen",
      daySummaryMinutes: "Trainingszeit",
      daySummaryFocus: "Tagesfokus",
      daySummaryEmpty: "Noch keine Übungen abgeschlossen.",
      weeklyMinutesTitle: "Wochenvolumen",
      weeklyMinutesTotal: "Gesamtminuten",
      weeklyMinutesFocus: "Wochenfokus",
      weeklyMinutesEmpty: "Für diese Woche sind noch keine Übungen abgeschlossen.",
      weeklyMinutesHint: "Minuten werden aus abgeschlossenen Übungen berechnet.",
      weeklyMinUnit: "min"
    });
    Object.assign(DAILY_I18N.es, {
      voiceGo: "Vamos",
      voiceRest: "Descanso",
      voiceNext: "Siguiente ejercicio",
      voiceDone: "Ejercicio completado",
      voiceGreatJob: "Buen trabajo. Ahora registra tu RPE.",
      daySummaryTitle: "Resumen de sesión",
      daySummaryDone: "Ejercicios completados",
      daySummaryMinutes: "Tiempo de entrenamiento",
      daySummaryFocus: "Enfoque del día",
      daySummaryEmpty: "Aún no hay ejercicios completados.",
      weeklyMinutesTitle: "Volumen Semanal",
      weeklyMinutesTotal: "Minutos Totales",
      weeklyMinutesFocus: "Enfoque Semanal",
      weeklyMinutesEmpty: "Aún no hay ejercicios completados esta semana.",
      weeklyMinutesHint: "Los minutos se calculan desde los ejercicios completados.",
      weeklyMinUnit: "min"
    });
    Object.assign(DAILY_I18N.ru, {
      voiceGo: "Поехали",
      voiceRest: "Отдых",
      voiceNext: "Следующее упражнение",
      voiceDone: "Упражнение завершено",
      voiceGreatJob: "Отличная работа. Заполни RPE.",
      daySummaryTitle: "Итог тренировки",
      daySummaryDone: "Завершено упражнений",
      daySummaryMinutes: "Время тренировки",
      daySummaryFocus: "Фокус дня",
      daySummaryEmpty: "Пока нет завершённых упражнений.",
      weeklyMinutesTitle: "Недельный объём",
      weeklyMinutesTotal: "Всего минут",
      weeklyMinutesFocus: "Фокус недели",
      weeklyMinutesEmpty: "За эту неделю пока нет завершённых упражнений.",
      weeklyMinutesHint: "Минуты считаются по отмеченным упражнениям.",
      weeklyMinUnit: "мин"
    });
    Object.assign(DAILY_I18N.pt, {
      voiceGo: "Vamos",
      voiceRest: "Descanso",
      voiceNext: "Próximo exercício",
      voiceDone: "Exercício concluído",
      voiceGreatJob: "Bom trabalho. Regista agora o teu RPE.",
      daySummaryTitle: "Resumo da sessão",
      daySummaryDone: "Exercícios concluídos",
      daySummaryMinutes: "Tempo de treino",
      daySummaryFocus: "Foco do dia",
      daySummaryEmpty: "Ainda não há exercícios concluídos.",
      weeklyMinutesTitle: "Volume Semanal",
      weeklyMinutesTotal: "Minutos Totais",
      weeklyMinutesFocus: "Foco da Semana",
      weeklyMinutesEmpty: "Ainda não há exercícios concluídos esta semana.",
      weeklyMinutesHint: "Os minutos são calculados a partir dos exercícios concluídos.",
      weeklyMinUnit: "min"
    });
    Object.assign(DAILY_I18N.de, { md: "Spieltag. Maximaler Fokus, nur zielgerichtete Aktionen.", mdp1: "Regenerationstag: Mobilität und lockere Bewegung.", mdm1: "Aktivierungstag: kurze explosive Arbeit und Speed-Vorbereitung.", train: "Normaler Trainingstag: Qualität vor Quantität.", rest: "Volle Regeneration. Der Körper passt sich in der Erholung an." });
    Object.assign(DAILY_I18N.es, { md: "Día de partido. Máximo enfoque y solo acciones clave.", mdp1: "Día de recuperación: movilidad y movimiento ligero.", mdm1: "Día de activación: trabajo explosivo corto y preparación de velocidad.", train: "Día de entrenamiento regular: calidad por encima de cantidad.", rest: "Recuperación completa. El cuerpo se adapta durante el descanso." });
    Object.assign(DAILY_I18N.ru, { md: "День матча. Максимальная концентрация и только целевые действия.", mdp1: "День восстановления: мобильность и легкое движение.", mdm1: "День активации: короткая взрывная работа и подготовка скорости.", train: "Обычный тренировочный день: качество важнее количества.", rest: "Полное восстановление. Тело адаптируется во время отдыха." });
    Object.assign(DAILY_I18N.pt, { md: "Dia de jogo. Foco máximo e apenas ações-chave.", mdp1: "Dia de recuperação: mobilidade e movimento leve.", mdm1: "Dia de ativação: trabalho explosivo curto e preparação de velocidade.", train: "Dia normal de treino: qualidade acima da quantidade.", rest: "Recuperação total. O corpo adapta-se durante o descanso." });

    const EXERCISE_NAME_FALLBACKS = {
      "Динамічні випади з поворотом": { en: "Dynamic Lunges with Rotation", de: "Dynamic Lunges with Rotation", es: "Dynamic Lunges with Rotation", pt: "Dynamic Lunges with Rotation" },
      "Рух 'Світч-Кік'": { en: "Switch Kick", de: "Switch Kick", es: "Switch Kick", pt: "Switch Kick" },
      "Розкриття грудної клітки лежачи": { en: "Lying Thoracic Opener", de: "Lying Thoracic Opener", es: "Lying Thoracic Opener", pt: "Lying Thoracic Opener" },
      "Розтяжка задньої поверхні стегна лежачи з ременем": { en: "Supine Hamstring Strap Stretch", de: "Supine Hamstring Strap Stretch", es: "Supine Hamstring Strap Stretch", pt: "Supine Hamstring Strap Stretch" },
      "YTWL для плечей": { en: "YTWL Shoulder Series", de: "YTWL Shoulder Series", es: "YTWL Shoulder Series", pt: "YTWL Shoulder Series" },
      "Болгарські присідання": { en: "Bulgarian Split Squat", de: "Bulgarian Split Squat", es: "Bulgarian Split Squat", pt: "Bulgarian Split Squat" },
      "Terminal Knee Extension (TKE) з резинкою": { en: "Band Terminal Knee Extension (TKE)", de: "Band Terminal Knee Extension (TKE)", es: "Band Terminal Knee Extension (TKE)", pt: "Band Terminal Knee Extension (TKE)" },
      "Step-Down контроль (низька платформа)": { en: "Controlled Step-Down (Low Box)", de: "Controlled Step-Down (Low Box)", es: "Controlled Step-Down (Low Box)", pt: "Controlled Step-Down (Low Box)" },
      "Face Pull з резинкою": { en: "Band Face Pull", de: "Band Face Pull", es: "Band Face Pull", pt: "Band Face Pull" },
      "Тяга верхнього блоку вузьким хватом": { en: "Close-Grip Lat Pulldown", de: "Close-Grip Lat Pulldown", es: "Close-Grip Lat Pulldown", pt: "Close-Grip Lat Pulldown" },
      "Розтяжка грудних м'язів у дверному отворі": { en: "Doorway Chest Stretch", de: "Doorway Chest Stretch", es: "Doorway Chest Stretch", pt: "Doorway Chest Stretch" },
      "Розтяжка квадрицепсів стоячи": { en: "Standing Quad Stretch", de: "Standing Quad Stretch", es: "Standing Quad Stretch", pt: "Standing Quad Stretch" },
      "Розтяжка трицепса і плечей": { en: "Triceps and Shoulder Stretch", de: "Triceps and Shoulder Stretch", es: "Triceps and Shoulder Stretch", pt: "Triceps and Shoulder Stretch" },
      "Розтяжка гомілковостопного суглоба": { en: "Ankle Mobility Stretch", de: "Ankle Mobility Stretch", es: "Ankle Mobility Stretch", pt: "Ankle Mobility Stretch" },
      "Рол для квадрицепсів": { en: "Foam Roll for Quads", de: "Foam Roll for Quads", es: "Foam Roll for Quads", pt: "Foam Roll for Quads" },
      "Рол для задньої поверхні стегна": { en: "Foam Roll for Hamstrings", de: "Foam Roll for Hamstrings", es: "Foam Roll for Hamstrings", pt: "Foam Roll for Hamstrings" },
      "Рол для верхньої частини спини": { en: "Foam Roll for Upper Back", de: "Foam Roll for Upper Back", es: "Foam Roll for Upper Back", pt: "Foam Roll for Upper Back" },
      "Рол для середньої частини спини": { en: "Foam Roll for Mid Back", de: "Foam Roll for Mid Back", es: "Foam Roll for Mid Back", pt: "Foam Roll for Mid Back" },
      "Рол для нижньої частини спини": { en: "Foam Roll for Lower Back", de: "Foam Roll for Lower Back", es: "Foam Roll for Lower Back", pt: "Foam Roll for Lower Back" },
      "Рол для підколінних сухожиль": { en: "Foam Roll for Hamstring Tendons", de: "Foam Roll for Hamstring Tendons", es: "Foam Roll for Hamstring Tendons", pt: "Foam Roll for Hamstring Tendons" }
    };
    const EXERCISE_SPEECH_ALIASES = {
      "dynamic dead bug": { uk: "Динамічний дед баг", en: "Dynamic Dead Bug", ru: "Динамический дед баг", de: "Dynamischer Dead Bug", es: "Dead Bug dinámico", pt: "Dead Bug dinâmico" },
      "dead bug": { uk: "Дед баг", en: "Dead Bug", ru: "Дед баг", de: "Dead Bug", es: "Dead Bug", pt: "Dead Bug" },
      "dynamic arm raises": { uk: "Динамічні підйоми рук", en: "Dynamic Arm Raises", ru: "Динамические подъёмы рук", de: "Dynamische Armhebungen", es: "Elevaciones dinámicas de brazos", pt: "Elevações dinâmicas de braços" },
      "arm raises": { uk: "Підйоми рук", en: "Arm Raises", ru: "Подъёмы рук", de: "Armhebungen", es: "Elevaciones de brazos", pt: "Elevações de braços" },
      "bench side plank": { uk: "Бокова планка на лавці", en: "Bench Side Plank", ru: "Боковая планка на скамье", de: "Seitstütz auf der Bank", es: "Plancha lateral en banco", pt: "Prancha lateral no banco" },
      "side plank": { uk: "Бокова планка", en: "Side Plank", ru: "Боковая планка", de: "Seitstütz", es: "Plancha lateral", pt: "Prancha lateral" },
      "copenhagen plank": { uk: "Копенгагенська планка", en: "Copenhagen Plank", ru: "Копенгагенская планка", de: "Kopenhagener Plank", es: "Plancha Copenhague", pt: "Prancha Copenhagen" },
      "bulgarian split squat": { uk: "Болгарські присідання", en: "Bulgarian Split Squat", ru: "Болгарские выпады", de: "Bulgarian Split Squat", es: "Sentadilla búlgara", pt: "Agachamento búlgaro" },
      "split squat": { uk: "Спліт-присідання", en: "Split Squat", ru: "Сплит-присед", de: "Split Squat", es: "Sentadilla dividida", pt: "Agachamento dividido" },
      "lunge": { uk: "Випад", en: "Lunge", ru: "Выпад", de: "Ausfallschritt", es: "Zancada", pt: "Afundo" },
      "lunges": { uk: "Випади", en: "Lunges", ru: "Выпады", de: "Ausfallschritte", es: "Zancadas", pt: "Afundos" },
      "bird dog": { uk: "Берд-дог", en: "Bird Dog", ru: "Бёрд-дог", de: "Bird Dog", es: "Bird Dog", pt: "Bird Dog" },
      "glute bridge": { uk: "Ягідний міст", en: "Glute Bridge", ru: "Ягодичный мост", de: "Glute Bridge", es: "Puente de glúteos", pt: "Ponte de glúteos" },
      "hip bridge": { uk: "Тазовий міст", en: "Hip Bridge", ru: "Тазовый мост", de: "Hüftbrücke", es: "Puente de cadera", pt: "Ponte de quadril" },
      "wall sit": { uk: "Стільчик біля стіни", en: "Wall Sit", ru: "Стульчик у стены", de: "Wandsitz", es: "Sentadilla isométrica en pared", pt: "Cadeira na parede" },
      "step up": { uk: "Крок на платформу", en: "Step Up", ru: "Шаг на платформу", de: "Step-up", es: "Subida al cajón", pt: "Subida no banco" },
      "step down": { uk: "Контрольований крок вниз", en: "Step Down", ru: "Контролируемый шаг вниз", de: "Step-down", es: "Bajada controlada", pt: "Descida controlada" }
    };
    function diLang() {
      const raw = String(localStorage.getItem("pac_lang") || "").toLowerCase();
      if (raw === "ua") return "uk";
      if (DAILY_I18N[raw]) return raw;
      return "uk";
    }
    function ti(k) {
      const l = diLang();
      return DAILY_I18N[l]?.[k] ?? DAILY_I18N.en[k] ?? k;
    }
    function escapeHtml(value) {
      return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    }
    function stageLabel(s) {
      const map = { "Pre-Training": "stagePre", "Main Training": "stageMain", "Post-Training": "stagePost" };
      const key = map[s];
      return key ? ti(key) : s;
    }
    function hasCyrillic(text) {
      return /[\u0400-\u04FF]/.test(String(text || ""));
    }
    function fixMojibake(text) {
      const raw = String(text || "");
      if (!raw) return "";
      if (!/[ÐÑÃâ]/.test(raw)) return raw;
      try {
        return decodeURIComponent(escape(raw));
      } catch (_) {
        return raw;
      }
    }
    function splitBilingualName(rawName) {
      const raw = fixMojibake(rawName).trim();
      const match = raw.match(/^(.+?)\s*\(([^()]{2,})\)\s*$/);
      if (!match) return null;
      const left = match[1].trim();
      const right = match[2].trim();
      if (!left || !right) return null;
      // Treat as bilingual only when scripts differ (e.g. "Планка ... (Elbow Plank)").
      if (hasCyrillic(left) === hasCyrillic(right)) return null;
      return { left, right };
    }
    function pickLocalizedValue(map, lang) {
      if (!map || typeof map !== "object") return "";
      return String(map[lang] || map.en || map.uk || map.ru || map.de || map.es || map.pt || "").trim();
    }
    function resolveExerciseName(ex, lang = diLang()) {
      const raw = fixMojibake(ex?.name || "").trim();
      const mapped = fixMojibake(pickLocalizedValue(ex?.name_i18n, lang));
      if (mapped) {
        // Backward-compat for old saved i18n where "(...)" part replaced full EN name.
        if (raw && !splitBilingualName(raw) && /\(([^()]{2,})\)\s*$/.test(raw) && !hasCyrillic(raw)) {
          return raw;
        }
        if (!((lang !== "uk" && lang !== "ru") && hasCyrillic(mapped))) return mapped;
      }

      if (!raw) return "—";

      const alias = EXERCISE_NAME_FALLBACKS[raw]?.[lang];
      if (alias) return alias;

      const bi = splitBilingualName(raw);
      if (bi) return (lang === "uk" || lang === "ru") ? bi.left : bi.right;

      if ((lang !== "uk" && lang !== "ru") && hasCyrillic(raw)) return "";
      return raw;
    }
    function normalizeExerciseSpeechKey(name) {
      return String(name || "")
        .toLowerCase()
        .replace(/[^0-9a-zа-яіїєґёäöüßáéíóúñçãõàâêôû\s-]/gi, " ")
        .replace(/[_-]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    }
    function resolveExerciseNameForSpeech(ex, lang = diLang()) {
      const base = fixMojibake(ex?.name_i18n?.[lang] || resolveExerciseName(ex, lang) || "").trim();
      const enBase = fixMojibake(resolveExerciseName(ex, "en") || "").trim();
      const fallback = fixMojibake(ex?.name || "").trim();
      let out = base || enBase || fallback;
      if (!out) return "";

      out = out.replace(/\s*[\(\[].*?[\)\]]\s*/g, " ").replace(/\s+/g, " ").trim();
      const key = normalizeExerciseSpeechKey(out);
      const keyEn = normalizeExerciseSpeechKey(enBase || fallback);
      const byKey = EXERCISE_SPEECH_ALIASES[key]?.[lang];
      if (byKey) return byKey;
      const byKeyEn = EXERCISE_SPEECH_ALIASES[keyEn]?.[lang];
      if (byKeyEn) return byKeyEn;
      return out;
    }
    function eliteAnnounceExerciseName(meta) {
      const ex=meta?.exercise||{},lang=diLang(),name=resolveExerciseNameForSpeech(ex,lang);
      const translated=Boolean(String(ex.name_i18n?.[lang]||'').trim())
        || Object.values(EXERCISE_SPEECH_ALIASES).some(values=>values[lang]===name)
        || Object.values(EXERCISE_NAME_FALLBACKS).some(values=>values[lang]===name);
      const englishFallback=lang!=='en'&&!translated&&!hasCyrillic(name)&&name===resolveExerciseNameForSpeech(ex,'en');
      eliteSpeak(name,{interrupt:true,lang:speechLangForDaily(englishFallback?'en':lang)});
    }
    function resolveExerciseDescription(ex, lang = diLang()) {
      const mapped = fixMojibake(pickLocalizedValue(ex?.description_i18n, lang));
      if (mapped) {
        if (!((lang !== "uk" && lang !== "ru") && hasCyrillic(mapped))) return mapped;
      }

      const raw = fixMojibake(ex?.description || "").trim();
      if (!raw) return "";
      if ((lang !== "uk" && lang !== "ru") && hasCyrillic(raw)) return "";
      return raw;
    }
    function recommendationLabel(lang = diLang()) {
      const m = {
        uk: "Рекомендація",
        en: "Recommendation",
        de: "Empfehlung",
        es: "Recomendación",
        ru: "Рекомендация",
        pt: "Recomendação"
      };
      return m[lang] || m.en;
    }
    function descriptionLabel(lang = diLang()) {
      const m = {
        uk: "Опис",
        en: "Description",
        de: "Beschreibung",
        es: "Descripción",
        ru: "Описание",
        pt: "Descrição"
      };
      return m[lang] || m.en;
    }
    function techniqueLabel(lang = diLang()) {
      const m = {
        uk: "Техніка",
        en: "Technique",
        de: "Technik",
        es: "Técnica",
        ru: "Техника",
        pt: "Técnica"
      };
      return m[lang] || m.en;
    }
    function detectExerciseKind(ex) {
      const name = resolveExerciseName(ex, "en").toLowerCase();
      const tags = Array.isArray(ex?.tags) ? ex.tags.map(t => String(t).toLowerCase()) : [];
      const has = (...arr) => arr.some(x => name.includes(x) || tags.includes(x));
      if (has("stretch", "mobility", "opener")) return "mobility";
      if (has("bridge", "glute", "clam", "hip")) return "glute";
      if (has("plank", "dead bug", "bird-dog", "core", "superman")) return "core";
      if (has("squat", "split squat", "lunge")) return "lower_strength";
      if (has("jump", "plyo")) return "power";
      if (has("press", "push")) return "push";
      if (has("row", "pull", "lat")) return "pull";
      if (has("roll", "foam")) return "release";
      if (has("rehab", "tke", "step-down", "wall sit")) return "rehab";
      return "general";
    }

    function detectIsometricExercise(ex) {
      const name = resolveExerciseName(ex, "en").toLowerCase();
      const tags = Array.isArray(ex?.tags) ? ex.tags.map(t => String(t).toLowerCase()) : [];
      const text = `${name} ${String(ex?.description || "").toLowerCase()} ${String(ex?.technique || "").toLowerCase()}`;
      const has = (...arr) => arr.some(x => text.includes(x) || tags.includes(x));
      return has(
        "isometric", "iso", "hold", "plank", "side plank", "wall sit", "dead hang",
        "static", "bridge hold", "hollow hold", "l-sit", "farmers hold", "carry hold",
        "утрим", "статич", "планк", "изометр", "статик", "удерж"
      );
    }

    function detectSideExercise(ex) {
      const name = resolveExerciseName(ex, "en").toLowerCase();
      const tags = Array.isArray(ex?.tags) ? ex.tags.map(t => String(t).toLowerCase()) : [];
      const text = `${name} ${String(ex?.description || "").toLowerCase()} ${String(ex?.technique || "").toLowerCase()}`;
      const has = (...arr) => arr.some(x => text.includes(x) || tags.includes(x));
      return has(
        "side", "left", "right", "other side", "single side", "unilateral", "single-leg", "single leg", "single arm",
        "split squat", "lunge", "cossack", "step-up", "step up", "dead bug", "bird-dog", "bird dog",
        "одност", "сторона", "ліва", "права", "unilateral"
      );
    }
    // Якщо в Firestore не задано sets/reps, підставляємо адекватні дефолти за типом вправи.
    function resolveExercisePrescription(ex, stage, lang = diLang()) {
      const task = window.PACExerciseTask.resolve(ex);
      if (task.mode === "running") {
        return { sets: task.planned.sets ?? "—", reps: task.planned.workSec ?? "—", repsUnit: "sec", timedSeconds: task.planned.workSec ?? 0 };
      }
      if (ex?.prescription && typeof ex.prescription === "object" && !isDrillExercise(ex)) {
        const p = ex.prescription;
        return { sets: p.sets ?? ex.sets ?? "—", reps: p.timedSeconds ?? p.reps ?? "—",
          repsUnit: p.repsUnit || (p.timedSeconds ? "sec" : "reps"), timedSeconds: Number(p.timedSeconds || (p.repsUnit === "sec" ? p.reps : 0)) || 0 };
      }
      const num = (v) => {
        const n = Number(v);
        return Number.isFinite(n) && n > 0 ? String(Math.round(n)) : "";
      };

      if (isDrillExercise(ex)) {
        const direct = ex?.prescription || ex?.tacticalDrill?.exerciseObject?.prescription;
        if (direct?.sets || direct?.reps || direct?.timedSeconds) {
          return {
            sets: num(direct.sets) || "1",
            reps: num(direct.timedSeconds || direct.reps) || "30",
            repsUnit: String(direct.repsUnit || "sec"),
            timedSeconds: Number(direct.timedSeconds || direct.reps || 30) || 30
          };
        }
        const timer = timerFromDrillExercise(ex);
        return {
          sets: String(timer.sets || 1),
          reps: String(timer.workSec || Math.max(1, Number(ex?.duration || 30) || 30)),
          repsUnit: "sec",
          timedSeconds: Number(timer.workSec || ex?.duration || 30) || 30
        };
      }

      const parsePattern = (value) => {
        const s = String(value || "").trim();
        if (!s) return { sets: "", reps: "", seconds: "" };

        // Випадки типу: 3x12 / 3 × 12 / 3х12
        let m = s.match(/(\d{1,2})\s*[xх×]\s*(\d{1,3})/i);
        if (m) {
          const hasSeconds = /(?:sec|secs|second|seconds|сек|секунд|секунди)\b/i.test(s);
          return { sets: m[1], reps: m[2], seconds: hasSeconds ? m[2] : "" };
        }

        // Випадки типу: 3 sets of 12 reps / 3 підходи по 12 повторень
        m = s.match(/(\d{1,2})\s*(?:sets?|set|підход\w*|подход\w*|s[äa]tze|series|s[ée]ries)\s*(?:of|по)?\s*(\d{1,3})\s*(?:reps?|rep|повтор\w*|wdh)/i);
        if (m) return { sets: m[1], reps: m[2], seconds: "" };

        const setsMatch = s.match(/(\d{1,2})\s*(?:sets?|set|підход\w*|подход\w*|s[äa]tze|series|s[ée]ries)/i);
        const repsMatch = s.match(/(\d{1,3})\s*(?:reps?|rep|повтор\w*|wdh)/i);
        const secMatch = s.match(/(\d{1,3})\s*(?:sec|secs|second|seconds|сек|секунд|секунди)\b/i);

        return {
          sets: setsMatch ? setsMatch[1] : "",
          reps: repsMatch ? repsMatch[1] : "",
          seconds: secMatch ? secMatch[1] : ""
        };
      };

      const fromPattern = parsePattern(ex?.prescription || ex?.scheme || ex?.plan || "");

      // Для узгодженості UI з текстом вправи беремо числа з будь-якого доступного опису.
      const descCandidates = [
        fixMojibake(pickLocalizedValue(ex?.description_i18n, lang)),
        fixMojibake(pickLocalizedValue(ex?.description_i18n, "uk")),
        fixMojibake(pickLocalizedValue(ex?.description_i18n, "en")),
        fixMojibake(ex?.description || "")
      ];
      const fromDescription = descCandidates
        .map(parsePattern)
        .find(p => p.sets || p.reps || p.seconds) || { sets: "", reps: "", seconds: "" };

      const isIsometric = detectIsometricExercise(ex);
      let sets = num(ex?.sets) || num(ex?.setsCount) || num(ex?.prescriptionSets) || fromPattern.sets || fromDescription.sets;
      let reps = num(ex?.reps) || num(ex?.repsCount) || num(ex?.prescriptionReps) || fromPattern.reps || fromDescription.reps;
      let timedSeconds = num(ex?.holdSec) || num(ex?.workSec) || num(ex?.durationSec) || fromPattern.seconds || fromDescription.seconds;

      if (isIsometric && !timedSeconds) timedSeconds = "30";

      if (!sets && timedSeconds) sets = "2";

      if (sets && (reps || timedSeconds)) {
        const showReps = timedSeconds || reps;
        return {
          sets,
          reps: showReps,
          repsUnit: timedSeconds ? "sec" : "reps",
          timedSeconds: timedSeconds ? Number(timedSeconds) : 0
        };
      }

      const kind = detectExerciseKind(ex);
      const fallback = {
        mobility:       stage === "Pre-Training" ? { sets: "2", reps: "8" } : { sets: "2", reps: "10" },
        glute:          stage === "Main Training" ? { sets: "4", reps: "8" } : { sets: "3", reps: "10" },
        core:           { sets: "3", reps: "8" },
        lower_strength: { sets: "4", reps: "6" },
        power:          { sets: "4", reps: "4" },
        push:           stage === "Main Training" ? { sets: "4", reps: "8" } : { sets: "3", reps: "10" },
        pull:           stage === "Main Training" ? { sets: "4", reps: "8" } : { sets: "3", reps: "10" },
        release:        { sets: "2", reps: "8" },
        rehab:          { sets: "3", reps: "12" },
        general:        stage === "Main Training" ? { sets: "3", reps: "10" } : { sets: "2", reps: "8" }
      };

      const f = fallback[kind] || fallback.general;
      if (isIsometric) {
        return { sets: sets || "3", reps: timedSeconds || "30", repsUnit: "sec", timedSeconds: Number(timedSeconds || 30) };
      }
      return { sets: sets || f.sets, reps: reps || f.reps, repsUnit: "reps", timedSeconds: 0 };
    }

    function resolveExerciseTimerConfig(ex, exPrescription, stage) {
      const task = window.PACExerciseTask.resolve(ex);
      if (task.mode === "running") {
        const p = task.planned;
        return task.ready ? { sets: p.sets, workSec: p.workSec, restSec: p.restSec ?? 0,
          prepSec: p.prepSec, restBetweenSets: p.restBetweenSetsSec, rounds: p.rounds, blocks: p.blocks } : null;
      }
      if (task.ready && ex?.timer && task.planned.workSec != null) {
        return { sets: task.planned.sets, workSec: task.planned.workSec, restSec: task.planned.restSec ?? 0 };
      }
      if (isDrillExercise(ex)) {
        return timerFromDrillExercise(ex);
      }
      const sets = Math.max(1, Number(exPrescription?.sets || ex?.sets || 2) || 1);
      const reps = Math.max(1, Number(exPrescription?.reps || ex?.reps || 8) || 8);
      const timedSeconds = Number(exPrescription?.timedSeconds || 0);
      const kind = detectExerciseKind(ex);

      const repTempoSecByKind = {
        mobility: 4,
        release: 4,
        rehab: 4,
        glute: 3,
        core: 3,
        lower_strength: 3,
        push: 3,
        pull: 3,
        power: 2,
        general: 3
      };
      const defaultRestByKind = {
        mobility: 15,
        release: 15,
        rehab: 20,
        glute: 20,
        core: 20,
        lower_strength: 35,
        push: 30,
        pull: 30,
        power: 45,
        general: 25
      };

      let workSec = timedSeconds > 0
        ? timedSeconds
        : Math.round(reps * (repTempoSecByKind[kind] || repTempoSecByKind.general));

      // Clamp to practical bounds for voice-guided flow.
      workSec = Math.max(8, Math.min(120, Number(workSec) || 8));

      const byStageRest =
        stage === "Post-Training" ? 15 :
        stage === "Pre-Training" ? 20 :
        null;

      const restSec = task.planned.restSec ?? Math.max(
        5,
        Number(ex?.restSec || ex?.pauseSec || byStageRest || defaultRestByKind[kind] || defaultRestByKind.general) || 20
      );

      return {
        sets: Math.round(sets),
        workSec: Math.round(workSec),
        restSec: Math.round(restSec)
      };
    }

    function speechLangForDaily(l = diLang()) {
      if (l === "uk") return "uk-UA";
      if (l === "ru") return "ru-RU";
      if (l === "de") return "de-DE";
      if (l === "es") return "es-ES";
      if (l === "pt") return "pt-PT";
      return "en-US";
    }

    function speechProfileForLangCode(langCode) {
      const base = String(langCode || "").toLowerCase().split("-")[0];
      const profiles = {
        uk: { rate: 0.93, pitch: 0.98, hints: ["ukrain", "укра"] },
        ru: { rate: 0.92, pitch: 0.98, hints: ["russian", "русс"] },
        de: { rate: 0.92, pitch: 0.98, hints: ["german", "deutsch"] },
        es: { rate: 0.96, pitch: 1.02, hints: ["spanish", "españ"] },
        pt: { rate: 0.95, pitch: 1.0, hints: ["portugu", "brasil"] },
        en: { rate: 0.94, pitch: 1.0, hints: ["english", "united states", "great britain"] }
      };
      return profiles[base] || profiles.en;
    }

    function resolveCoachVoice(langCode) {
      try {
        if (!("speechSynthesis" in window)) return null;
        const target = String(langCode || "").toLowerCase();
        if (coachVoiceCache && coachVoiceCacheLang === target) return coachVoiceCache;

        const voices = window.speechSynthesis.getVoices() || [];
        if (!voices.length) return null;
        const base = target.split("-")[0];
        const profile = speechProfileForLangCode(target);
        const hints = Array.isArray(profile?.hints) ? profile.hints : [];
        const ranked = voices
          .filter(v=>String(v?.lang||'').toLowerCase().replace('_','-').split('-')[0]===base)
          .map((v) => {
            const lang = String(v?.lang || "").toLowerCase();
            const name = String(v?.name || "").toLowerCase();
            let score = 0;
            if (lang === target) score += 60;
            else if (lang.startsWith(base)) score += 35;
            if (name.includes("neural") || name.includes("natural")) score += 20;
            if (name.includes("enhanced") || name.includes("premium")) score += 25;
            if (name.includes("google") || name.includes("microsoft")) score += 12;
            if (hints.some(h => name.includes(h))) score += 18;
            if (v?.default) score += 8;
            return { v, score };
          })
          .sort((a, b) => b.score - a.score);

        coachVoiceCache = ranked.length ? ranked[0].v : null;
        coachVoiceCacheLang = target;
        return coachVoiceCache;
      } catch (_) {
        return null;
      }
    }

    function coachSpeak(text, opts = {}) {
      try {
        if (!("speechSynthesis" in window)) return;
        const msg = String(text || "").trim();
        if (!msg) return;

        const interrupt = opts.interrupt !== false;
        const langCode = opts.lang || speechLangForDaily();
        const profile = speechProfileForLangCode(langCode);
        const now = Date.now();
        const sig = `${langCode}|${msg}`;
        if (sig === lastCoachSpeakSig && now - lastCoachSpeakAt < 250) return;
        lastCoachSpeakSig = sig;
        lastCoachSpeakAt = now;

        const u = new SpeechSynthesisUtterance(msg);
        u.lang = langCode;
        const voice = resolveCoachVoice(u.lang);
        if (voice) u.voice = voice;
        u.rate = Number(opts.rate || profile?.rate || 0.94);
        u.pitch = 1;
        u.volume = 1;
        if (interrupt) window.speechSynthesis.cancel();
        window.speechSynthesis.speak(u);
      } catch (_) {}
    }

    try {
      if ("speechSynthesis" in window && typeof window.speechSynthesis.addEventListener === "function") {
        window.speechSynthesis.addEventListener("voiceschanged", () => {
          coachVoiceCache = null;
          coachVoiceCacheLang = "";
        });
      }
    } catch (_) {}

    function timerLabelText(state) {
      const phase = state.phase === "work" ? ti("timerWork") : ti("timerRest");
      return `${ti("timerSet")} ${state.setIndex}/${state.totalSets} • ${phase}: ${state.left}${ti("timerSecShort")}`;
    }

    function timerUiSet(exId, labelText, isRunning) {
      const lbl = document.getElementById(`timer-label-${exId}`);
      const btn = document.getElementById(`timer-btn-${exId}`);
      if (lbl) lbl.textContent = labelText;
      if (btn) btn.textContent = isRunning ? ti("timerStop") : ti("timerStart");
    }

    function isExerciseDoneUi(exId) {
      const cb = document.getElementById(`done-${exId}`);
      return !!cb?.checked;
    }

    function setExerciseDoneUi(exId, exKey, done) {
      const card = document.getElementById(`card-${exId}`);
      const cb = document.getElementById(`done-${exId}`);
      if (cb) cb.checked = !!done;
      if (card) card.style.opacity = done ? "0.2" : "1";
      if (typeof window.toggleExerciseDone === "function" && exKey) {
        window.toggleExerciseDone(exKey, !!done);
      }
    }

    function revealExerciseCard(exId) {
      const card = document.getElementById(`card-${exId}`);
      if (!card) return;
      const stageContent = card.closest("[data-stage-content]");
      if (stageContent && stageContent.style.display === "none") {
        stageContent.style.display = "block";
      }
      card.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    function focusKindLabel(kind, lang = diLang()) {
      const map = {
        uk: { mobility: "Мобільність", glute: "Сідниці", core: "Кор", lower_strength: "Силові ноги", power: "Потужність", push: "Поштовх", pull: "Тяга", release: "МФР", rehab: "Реабілітація", general: "Загально" },
        en: { mobility: "Mobility", glute: "Glute", core: "Core", lower_strength: "Lower Strength", power: "Power", push: "Push", pull: "Pull", release: "Release", rehab: "Rehab", general: "General" },
        de: { mobility: "Mobilität", glute: "Gluteus", core: "Core", lower_strength: "Unterkörper Kraft", power: "Explosivität", push: "Drücken", pull: "Ziehen", release: "Release", rehab: "Reha", general: "Allgemein" },
        es: { mobility: "Movilidad", glute: "Glúteos", core: "Core", lower_strength: "Fuerza Tren Inferior", power: "Potencia", push: "Empuje", pull: "Tirón", release: "Liberación", rehab: "Rehab", general: "General" },
        ru: { mobility: "Мобильность", glute: "Ягодичные", core: "Кор", lower_strength: "Сила Низ", power: "Мощность", push: "Жим", pull: "Тяга", release: "МФР", rehab: "Реабилитация", general: "Общее" },
        pt: { mobility: "Mobilidade", glute: "Glúteos", core: "Core", lower_strength: "Força Membros Inferiores", power: "Potência", push: "Empurrar", pull: "Puxar", release: "Liberação", rehab: "Reabilitação", general: "Geral" }
      };
      return (map[lang] && map[lang][kind]) || (map.en[kind]) || kind;
    }

    function estimateExerciseMinutes(meta) {
      if (!meta) return 0;
      const sets = Math.max(1, Number(meta?.timer?.sets || meta?.prescription?.sets || 1) || 1);
      const timed = String(meta?.prescription?.repsUnit || "") === "sec";
      const workSec = Math.max(3, Number(meta?.timer?.workSec || 0) || (timed ? Math.max(8, Number(meta?.prescription?.timedSeconds || meta?.prescription?.reps || 20) || 20) : 20));
      const restSec = Math.max(0, Number(meta?.timer?.restSec || 0) || 0);
      const prepPerSet = timed ? 3 : 5;
      const totalSec = (sets * workSec) + (Math.max(0, sets - 1) * restSec) + (sets * prepPerSet);
      return Math.max(0.1, totalSec / 60);
    }

    function buildCurrentDayMinutesSummary() {
      let total = 0;
      const focus = {};
      Object.entries(DONE_EXERCISES_MAP || {}).forEach(([exKey, done]) => {
        if (!done) return;
        const meta = exerciseMetaByKey[exKey];
        if (!meta) return;
        const min = estimateExerciseMinutes(meta);
        total += min;
        const kind = detectExerciseKind(meta.exercise || {});
        focus[kind] = (focus[kind] || 0) + min;
      });
      const roundedFocus = {};
      Object.entries(focus).forEach(([k, v]) => {
        roundedFocus[k] = Math.round(v * 10) / 10;
      });
      return {
        totalMinutes: Math.round(total * 10) / 10,
        focusMinutes: roundedFocus
      };
    }

    function goToFeedbackForm(focusComment = true) {
      const box = document.getElementById("user-feedback-container");
      if (!box) return;
      box.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => {
        const input = document.getElementById("coach-comment");
        if (focusComment && input) {
          try { input.focus({ preventScroll: true }); } catch { input.focus(); }
        }
      }, 260);
    }

    function findFirstUndoneExerciseId() {
      for (let i = 0; i < exerciseFlowOrder.length; i++) {
        const row = exerciseFlowOrder[i];
        if (!row?.exId) continue;
        if (!isExerciseDoneUi(row.exId)) return row.exId;
      }
      return null;
    }

    function findNextUndoneExerciseId(currentExId) {
      const idx = exerciseFlowOrder.findIndex(x => x.exId === currentExId);
      if (idx < 0) return findFirstUndoneExerciseId();
      for (let i = idx + 1; i < exerciseFlowOrder.length; i++) {
        const row = exerciseFlowOrder[i];
        if (!row) continue;
        if (!isExerciseDoneUi(row.exId)) return row.exId;
      }
      for (let i = 0; i < idx; i++) {
        const row = exerciseFlowOrder[i];
        if (!row) continue;
        if (!isExerciseDoneUi(row.exId)) return row.exId;
      }
      return null;
    }

    function findPrevExerciseId(currentExId) {
      const idx = exerciseFlowOrder.findIndex(x => x.exId === currentExId);
      if (idx <= 0) return null;
      for (let i = idx - 1; i >= 0; i--) {
        const row = exerciseFlowOrder[i];
        if (row?.exId) return row.exId;
      }
      return null;
    }

    function findNextExerciseId(currentExId) {
      const idx = exerciseFlowOrder.findIndex(x => x.exId === currentExId);
      if (idx < 0) return null;
      for (let i = idx + 1; i < exerciseFlowOrder.length; i++) {
        const row = exerciseFlowOrder[i];
        if (row?.exId) return row.exId;
      }
      return null;
    }

    function stopExerciseCoachTimer(exId, stoppedByUser = false) {
      const st = exerciseTimers[exId];
      if (!st) return;
      if (st.intervalId) clearInterval(st.intervalId);
      if (activeExerciseTimerId === exId) activeExerciseTimerId = null;
      if (stoppedByUser && "speechSynthesis" in window) {
        try { window.speechSynthesis.cancel(); } catch (_) {}
      }
      delete exerciseTimers[exId];
      timerUiSet(exId, stoppedByUser ? ti("timerStopped") : ti("timerDone"), false);
    }

    function stopAllExerciseCoachTimers(stoppedByUser = false) {
      Object.keys(exerciseTimers).forEach((id) => stopExerciseCoachTimer(id, stoppedByUser));
    }

    window.toggleExerciseCoachTimer = function(exId, exKey, totalSets, workSec, restSec, autoNext) {
      const existing = exerciseTimers[exId];
      if (existing) {
        stopExerciseCoachTimer(exId, true);
        return;
      }

      // Keep voice/timer strictly in sync: only one active timer at a time.
      stopAllExerciseCoachTimers(true);

      const state = {
        exId,
        totalSets: Math.max(1, Number(totalSets) || 1),
        workSec: Math.max(3, Number(workSec) || 3),
        restSec: Math.max(5, Number(restSec) || 5),
        setIndex: 1,
        phase: "work",
        left: Math.max(3, Number(workSec) || 3),
        exKey: String(exKey || ""),
        autoNext: !!autoNext,
        intervalId: null
      };

      exerciseTimers[exId] = state;
      activeExerciseTimerId = exId;
      timerUiSet(exId, timerLabelText(state), true);
      coachSpeak(`${ti("voiceGo")} ${state.setIndex}/${state.totalSets}`);

      state.intervalId = setInterval(() => {
        state.left -= 1;

        if (state.left > 0 && state.phase === "work" && state.left <= 3) {
          coachSpeak(String(state.left));
        }

        if (state.left <= 0) {
          if (state.phase === "work") {
            if (state.setIndex >= state.totalSets) {
              const nextExId = state.autoNext ? findNextUndoneExerciseId(exId) : null;
              coachSpeak(nextExId ? `${ti("voiceDone")}. ${ti("voiceNext")}` : ti("voiceDone"));
              stopExerciseCoachTimer(exId, false);
              setExerciseDoneUi(exId, state.exKey, true);
              if (nextExId) {
                revealExerciseCard(nextExId);
                setTimeout(() => {
                  const next = exerciseFlowOrder.find(x => x.exId === nextExId);
                  if (!next) return;
                  const btn = document.getElementById(`timer-btn-${nextExId}`);
                  if (btn) btn.click();
                }, 1200);
              }
              return;
            }
            state.phase = "rest";
            state.left = state.restSec;
            timerUiSet(exId, timerLabelText(state), true);
            coachSpeak(ti("voiceRest"));
            return;
          }

          state.setIndex += 1;
          state.phase = "work";
          state.left = state.workSec;
          timerUiSet(exId, timerLabelText(state), true);
          coachSpeak(`${ti("voiceGo")} ${state.setIndex}/${state.totalSets}`);
          return;
        }

        timerUiSet(exId, timerLabelText(state), true);
      }, 1000);
    }

    function toNumSafe(v) {
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    }

    function clampNum(v, min, max) {
      const n = Number(v);
      if (!Number.isFinite(n)) return min;
      return Math.max(min, Math.min(max, n));
    }

    function roundToStep(v, step = 2.5) {
      const n = Number(v);
      if (!Number.isFinite(n)) return null;
      const s = Math.max(0.1, Number(step) || 2.5);
      return Math.round(n / s) * s;
    }

    function loadElitePerfMap() {
      try {
        if (!CURRENT_UID) return {};
        const raw = localStorage.getItem(`${ELITE_PERF_KEY}:${encodeURIComponent(CURRENT_UID)}`);
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === "object" ? parsed : {};
      } catch {
        return {};
      }
    }

    function saveElitePerfMap(next) {
      try {
        if (CURRENT_UID) localStorage.setItem(`${ELITE_PERF_KEY}:${encodeURIComponent(CURRENT_UID)}`, JSON.stringify(next || {}));
      } catch {}
    }

    function getElitePerf(exKey) {
      const meta = exerciseMetaByKey[exKey];
      if (meta?.task?.mode === "gym" && CURRENT_UID) {
        try {
          const p = eliteStrengthStore().performance(meta.task.exerciseId);
          return { lastLoadKg: p.last?.loadKg, lastReps: p.last?.reps, bestLoadKg: p.best?.loadKg,
            bestReps: p.best?.reps, updatedAt: p.last?.endedAt, referenceMax: p.referenceMax,
            lastMode: p.last?.mode, lastWorkLoadKg: p.lastWorkLoadKg, trainingPercent1RM: p.trainingPercent1RM };
        } catch { return {}; }
      }
      const map = loadElitePerfMap();
      const alias = exerciseMetaByKey[exKey]?.exercise?.legacyProgressKey;
      const row = map[String(exKey || "")] || (alias ? map[alias] : null);
      return row && typeof row === "object" ? row : {};
    }

    function saveElitePerf(exKey, patch) {
      if (!exKey) return;
      const map = loadElitePerfMap();
      const prev = getElitePerf(exKey);
      map[String(exKey)] = {
        ...prev,
        ...(patch || {}),
        updatedAt: Date.now()
      };
      saveElitePerfMap(map);
    }

    function getEliteMeta(exId = ELITE_EXEC.exId) {
      return exId ? exerciseMetaById[exId] : null;
    }

    function applyDrillTargetsToExercise(ex = {}, drill = {}) {
      if (!ex || !drill) return false;
      const runningTarget = runningTargetFromExercise(ex) || targetFromDrillCanvas(drill, "runningTarget");
      const speedTarget = speedTargetFromExercise(ex) || targetFromDrillCanvas(drill, "speedTarget");
      let changed = false;
      if (runningTarget && !ex.runningTarget) {
        ex.runningTarget = runningTarget;
        changed = true;
      }
      if (speedTarget && !ex.speedTarget) {
        ex.speedTarget = speedTarget;
        changed = true;
      }
      if (Array.isArray(drill.measurements) && !Array.isArray(ex.measurements)) {
        ex.measurements = drill.measurements;
        changed = true;
      }
      if (!ex.tacticalDrill || !Object.keys(ex.tacticalDrill || {}).length) {
        ex.tacticalDrill = drill;
        changed = true;
      }
      if (!ex.timingEngine && drill.timingEngine) {
        ex.timingEngine = drill.timingEngine;
        changed = true;
      } else if (ex.timingEngine && drill.timingEngine) {
        ex.timingEngine.runningTarget = ex.timingEngine.runningTarget || runningTarget || drill.timingEngine.runningTarget;
        ex.timingEngine.speedTarget = ex.timingEngine.speedTarget || speedTarget || drill.timingEngine.speedTarget;
      }
      return changed;
    }

    async function loadDrillCanvasForExercise(ex = {}) {
      const drillId = drillIdFromExercise(ex);
      if (!drillId) return null;
      if (drillCanvasTargetCache[drillId]) return drillCanvasTargetCache[drillId];
      const local = localSavedDrillFromExercise(ex);
      if (local) {
        drillCanvasTargetCache[drillId] = local;
        return local;
      }
      if (!window.firebase?.firestore) return null;
      try {
        const snap = await firebase.firestore().collection("drill_canvases").doc(drillId).get();
        if (!snap.exists) return null;
        const drill = { id: snap.id, ...(snap.data() || {}) };
        drillCanvasTargetCache[drillId] = drill;
        return drill;
      } catch (err) {
        console.warn("[PAC Daily] drill target load failed:", err?.message || err);
        return null;
      }
    }

    async function hydrateEliteDrillTargets(meta) {
      if (!meta?.exercise || !isDrillExercise(meta.exercise)) return;
      const drill = await loadDrillCanvasForExercise(meta.exercise);
      if (!drill || meta.frameTaskSummary) return;
      const changed = applyDrillTargetsToExercise(meta.exercise, drill);
      meta.motionEstimates=window.PACExerciseTask.motionEstimates(drill.playerSeriesTotals||drill.exerciseStructure?.playerSeriesTotals?drill:meta.exercise.playerSeriesTotals?meta.exercise:drill);
      if(meta.task?.mode==='running')meta.task=window.PACExerciseTask.resolve(meta.exercise,meta.task.context);
      if (ELITE_EXEC.open && meta.exId === ELITE_EXEC.exId) {
        renderEliteExecutionOverlay();
      }
    }

    function eliteRoleForSet(setIndex, totalSets) {
      const i = Math.max(1, Number(setIndex) || 1);
      const t = Math.max(1, Number(totalSets) || 1);
      if (i === 1) return "warmup";
      if (t >= 4 && i === 2) return "top";
      if (t <= 3 && i === 2) return "top";
      if (i >= Math.max(3, t - 1)) return "backoff";
      return "build";
    }

    function eliteRoleLabel(role) {
      const map = {
        warmup: ti("eliteRoleWarmup"),
        build: ti("eliteRoleBuild"),
        top: ti("eliteRoleTop"),
        backoff: ti("eliteRoleBackoff")
      };
      return map[role] || ti("eliteRoleBuild");
    }

    function eliteBuildRoleMap(totalSets) {
      const out = [];
      const t = Math.max(1, Number(totalSets) || 1);
      for (let i = 1; i <= t; i++) out.push(eliteRoleForSet(i, t));
      return out;
    }

    function estimateEliteE1RM(loadKg, reps) {
      const load = toNumSafe(loadKg);
      const r = toNumSafe(reps);
      if (load == null || r == null || load <= 0 || r <= 0) return null;
      if (!Number.isInteger(r) || r > 15) return null;
      return r === 1 ? load : Math.round((load * (1 + r / 30)) * 10) / 10;
    }

    function readCurrentSignals() {
      const fromWellness = CURRENT_USER_DATA?.lastWellness || CURRENT_USER_DATA?.wellness || {};
      const take = (...keys) => {
        for (const k of keys) {
          const v1 = toNumSafe(CURRENT_USER_DATA?.[k]);
          if (v1 != null) return v1;
          const v2 = toNumSafe(fromWellness?.[k]);
          if (v2 != null) return v2;
        }
        return null;
      };
      return {
        readiness: take("readiness", "ready", "readinessScore"),
        stress: take("stress", "stressScore"),
        soreness: take("soreness", "sorenessScore", "muscleSoreness"),
        acwr: toNumSafe(CURRENT_USER_DATA?.currentACWR ?? CURRENT_USER_DATA?.acwr)
      };
    }

    function baseExerciseLoadKg(meta) {
      const ex = meta?.exercise || {};
      const fromExercise = toNumSafe(ex?.loadKg ?? ex?.weightKg ?? ex?.weight ?? ex?.kg ?? ex?.load);
      if (fromExercise != null && fromExercise >= 0) return fromExercise;
      const perf = getElitePerf(meta?.exKey);
      const percent = toNumSafe(ex.trainingPercent1RM ?? perf.trainingPercent1RM);
      if (perf.referenceMax?.value > 0 && percent > 0 && percent <= 100) return perf.referenceMax.value * percent / 100;
      const fromPerf = toNumSafe(meta?.task?.mode === "gym" ? perf?.lastWorkLoadKg : perf?.lastLoadKg ?? perf?.bestLoadKg);
      return (fromPerf != null && fromPerf >= 0) ? fromPerf : null;
    }

    function eliteRecommendedLoad(meta, setIndex, totalSets) {
      const base = baseExerciseLoadKg(meta);
      if (base == null) return { hasLoad: false, load: null, min: null, max: null, step: 2.5 };

      const role = eliteRoleForSet(setIndex, totalSets);
      let mod = 1;
      if (role === "warmup") mod *= 0.78;
      if (role === "build") mod *= 0.9;
      if (role === "backoff") mod *= 0.92;

      const ds = String(CURRENT_DAY_STATUS || "").toUpperCase();
      if (ds === "MD-1" || ds === "MD" || ds === "MD+1" || ds === "REST") mod *= 0.94;
      if (ds === "REHAB" || ds === "LIGHT") mod *= 0.9;

      const s = readCurrentSignals();
      if (s.readiness != null && s.readiness <= 4.5) mod *= 0.94;
      if (s.readiness != null && s.readiness >= 8) mod *= 1.02;
      if (s.stress != null && s.stress >= 7) mod *= 0.96;
      if (s.soreness != null && s.soreness >= 7) mod *= 0.95;
      if (s.acwr != null && s.acwr >= 1.4) mod *= 0.94;

      mod = clampNum(mod, 0.7, 1.1);
      const step = base >= 60 ? 2.5 : 1;
      const load = roundToStep(base * mod, step);
      return {
        hasLoad: true,
        load,
        min: roundToStep(load * 0.97, step),
        max: roundToStep(load * 1.03, step),
        step
      };
    }

    function eliteVideoSrc(videoId, autoplay = false) {
      if (!videoId) return "about:blank";
      const clean = encodeURIComponent(String(videoId));
      return `https://www.youtube-nocookie.com/embed/${clean}?autoplay=${autoplay ? "1" : "0"}&mute=1&controls=0&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&cc_load_policy=0&fs=0&disablekb=1&start=1`;
    }

    function eliteFocusCue(meta) {
      const full = String(exerciseTechnique(meta?.exercise || {}, meta?.stage || "Main Training") || "").trim();
      if (!full) return "";
      const first = full.split(/[.!?]/).map(x => x.trim()).filter(Boolean)[0];
      return first || full;
    }

    function eliteSetProgressHtml(total, current, phase) {
      const t = Math.max(1, Number(total) || 1);
      const c = Math.max(1, Number(current) || 1);
      let html = "";
      for (let i = 1; i <= t; i++) {
        let cls = "pending";
        if (i < c) cls = "done";
        if (i === c && phase !== "complete") cls = "current";
        if (phase === "complete") cls = "done";
        html += `<span class="di-elite-pr ${cls}"></span>`;
      }
      return html;
    }

    function eliteReadinessCard(readiness) {
      const r = toNumSafe(readiness);
      if (r == null) return { score: "7.2/10", label: ti("eliteGood") };
      if (r >= 7.5) return { score: `${r.toFixed(1)}/10`, label: ti("eliteGood") };
      if (r >= 5.5) return { score: `${r.toFixed(1)}/10`, label: ti("eliteModerate") };
      return { score: `${r.toFixed(1)}/10`, label: ti("eliteLow") };
    }

    function eliteHydrationPct() {
      const v = toNumSafe(CURRENT_USER_DATA?.hydrationPct ?? CURRENT_USER_DATA?.hydration);
      if (v != null) return clampNum(v, 35, 100);
      return 65;
    }

    function eliteVoicePack() {
      const l = diLang();
      const pack = {
        uk: { ready: "Готовий", firstRep: "Перше повторення", go: "Почали", rest: "Відпочинок", otherSide: "Інша сторона", seconds: "секунд", workPrefix: "Робота" },
        en: { ready: "Ready", firstRep: "First repetition", go: "Go", rest: "Rest", otherSide: "Other side", seconds: "seconds", workPrefix: "Work" },
        ru: { ready: "Готовься", firstRep: "Первое повторение", go: "Поехали", rest: "Отдых", otherSide: "Другая сторона", seconds: "секунд", workPrefix: "Работа" },
        de: { ready: "Bereit", firstRep: "Erste Wiederholung", go: "Los geht's", rest: "Pause", otherSide: "Seitenwechsel", seconds: "Sekunden", workPrefix: "Arbeit" },
        es: { ready: "Listo", firstRep: "Primera repetición", go: "Vamos", rest: "Descanso", otherSide: "Cambia de lado", seconds: "segundos", workPrefix: "Trabajo" },
        pt: { ready: "Pronto", firstRep: "Primeira repetição", go: "Vamos", rest: "Descanso", otherSide: "Troca o lado", seconds: "segundos", workPrefix: "Trabalho" }
      };
      return pack[l] || pack.en;
    }

    function eliteSpeakSeconds(sec) {
      const s = Math.max(1, Number(sec) || 1);
      return String(s);
    }

    function eliteSpeechAmount(n,uk,en){
      const tail=Math.abs(n)%100,last=tail%10;
      const units={ru:{minute:['минута','минуты','минут'],second:['секунда','секунды','секунд'],kilometre:['километр','километра','километров']},de:{minute:['Minute','Minuten'],second:['Sekunde','Sekunden'],kilometre:['Kilometer','Kilometer']},es:{minute:['minuto','minutos'],second:['segundo','segundos'],kilometre:['kilómetro','kilómetros']},pt:{minute:['minuto','minutos'],second:['segundo','segundos'],kilometre:['quilómetro','quilómetros']}};
      const lang=diLang(),forms=lang==='uk'?uk:units[lang]?.[en[0]]||en;
      return `${n} ${forms[lang==='uk'||lang==='ru'?(tail>=11&&tail<=14?2:last===1?0:last>=2&&last<=4?1:2):n===1?0:1]}`;
    }
    function eliteSpeechDuration(seconds){
      const m=Math.floor(seconds/60),s=seconds%60;
      return [m?eliteSpeechAmount(m,['хвилина','хвилини','хвилин'],['minute','minutes']):'',s||!m?eliteSpeechAmount(s,['секунда','секунди','секунд'],['second','seconds']):''].filter(Boolean).join(' ');
    }

    function eliteIsTimed(meta) {
      return String(meta?.prescription?.repsUnit || "") === "sec";
    }

    function eliteResolveRestSec(meta, setIndex = ELITE_EXEC.setIndex) {
      if (meta?.task?.mode === "running") {
        const p = meta.task.planned;
        return p.blocks > 1 && p.rounds > 0 && setIndex % p.rounds === 0 && p.restBetweenSetsSec != null
          ? p.restBetweenSetsSec : p.restSec ?? 0;
      }
      if (meta?.task?.planned?.restSec != null) return meta.task.planned.restSec;
      const base = Math.max(5, Number(meta?.timer?.restSec || ELITE_EXEC.restSec) || 20);
      const total = Math.max(1, Number(ELITE_EXEC.totalSets || meta?.timer?.sets || meta?.prescription?.sets || 1) || 1);
      const rec = eliteRecommendedLoad(meta, setIndex, total);
      if (rec?.hasLoad) return base;
      // For bodyweight/technique movements, keep flow tighter.
      if (eliteIsTimed(meta)) return Math.max(8, Math.min(base, 15));
      return Math.max(6, Math.min(base, 10));
    }

    function eliteTargetReps(meta) {
      if (!meta || eliteIsTimed(meta)) return 0;
      if (eliteHasStrengthRun(meta)) return ELITE_STRENGTH.run.targets[ELITE_STRENGTH.run.index - 1] || 0;
      const reps = Math.round(Number(meta?.prescription?.reps || 0));
      if (!Number.isFinite(reps) || reps <= 0) return 0;
      return Math.min(60, reps);
    }

    function eliteRepTickMs(meta) {
      const r = eliteTargetReps(meta);
      if (!r) return 0;
      if (r <= 6) return 2600;
      if (r <= 10) return 2200;
      if (r <= 16) return 1800;
      return 1400;
    }

    function eliteHasDualSide(meta) {
      return !!meta && detectSideExercise(meta?.exercise || {});
    }

    function eliteCurrentSideText() {
      if (!ELITE_EXEC.sideMode || ELITE_EXEC.sideTotal <= 1) return "";
      return `${ti("eliteSide")} ${ELITE_EXEC.sideIndex + 1}/${ELITE_EXEC.sideTotal}`;
    }

    function eliteSetDurationSec(meta, setIndex = ELITE_EXEC.setIndex) {
      const idx = Math.max(1, Number(setIndex) || 1) - 1;
      const arr = Array.isArray(ELITE_EXEC.setDurations) ? ELITE_EXEC.setDurations : [];
      const v = Number(arr[idx]);
      if (Number.isFinite(v) && v > 0) return Math.round(v);
      return Math.max(8, Number(meta?.timer?.workSec || ELITE_EXEC.workSec || 30) || 30);
    }

    function eliteBuildSetDurations(meta, totalSets) {
      const out = [];
      const t = Math.max(1, Number(totalSets) || 1);
      if (!eliteIsTimed(meta)) return out;
      if (meta?.task?.planned?.workSec > 0) return Array.from({ length: t }, () => meta.task.planned.workSec);

      const perf = getElitePerf(meta?.exKey);
      const fromPerf = toNumSafe(perf?.nextIsoSec);
      const fromPlan = toNumSafe(meta?.timer?.workSec || meta?.prescription?.timedSeconds || meta?.prescription?.reps);
      const base = Math.max(20, Math.min(120, Number(fromPerf ?? fromPlan ?? 30) || 30));
      const isSide = detectSideExercise(meta?.exercise || {});
      const alt = Math.max(20, base - 5);
      for (let i = 0; i < t; i++) out.push(isSide ? (i % 2 === 0 ? base : alt) : base);
      return out;
    }

    function eliteQueueSpeak(lines = []) {
      const queue = Array.isArray(lines) ? lines.map(x => String(x || "").trim()).filter(Boolean) : [];
      if (!queue.length) return;
      queue.forEach((line, idx) => eliteSpeak(line, { interrupt: idx === 0 }));
    }

    function eliteAnnounceSetStart(meta) {
      if (meta?.task?.mode === "gym") return;
      const p = eliteVoicePack();
      eliteSpeak(p.go, { interrupt: true });
    }

    function eliteAnnounceRest(meta) {
      const restSec = ELITE_EXEC.phase==='rest'?ELITE_EXEC.leftSec:eliteResolveRestSec(meta);
      if(restSec>5)eliteSpeak(eliteVoicePack().rest+'. '+eliteSpeechAmount(restSec,['секунда','секунди','секунд'],['second','seconds']), { interrupt: true });
    }

    function eliteStartRepCounter(meta) {
      if (eliteHasStrengthRun(meta)) return; // A voice cadence is not a measured repetition.
      const target = ELITE_EXEC.repTarget || eliteTargetReps(meta);
      if (!target) return;
      const tick = Math.max(900, Number(ELITE_EXEC.repTickMs || eliteRepTickMs(meta)) || 2200);
      ELITE_EXEC.repTickMs = tick;
      ELITE_EXEC.repIntervalId = setInterval(() => {
        ELITE_EXEC.repDone = Math.min(target, Number(ELITE_EXEC.repDone || 0) + 1);
        eliteSpeak(String(ELITE_EXEC.repDone), { interrupt: false });
        if (ELITE_EXEC.repDone >= target) {
          eliteClearRuntimeTimers();
          ELITE_EXEC.completeDelayTimer = setTimeout(() => {
            ELITE_EXEC.completeDelayTimer = null;
            if (!ELITE_EXEC.open || ELITE_EXEC.phase !== "active") return;
            eliteCompleteSetAndContinue();
          }, 420);
          return;
        }
        renderEliteExecutionOverlay();
      }, tick);
    }

    function runningWord(key) {
      const uk = {
        set: "СЕРІЯ",
        pace: "ТЕМП",
        lap: "КОЛО",
        distance: "ДИСТАНЦІЯ",
        laps: "КІЛЬКІСТЬ КІЛ",
        cue: "СИГНАЛ",
        work: "робота",
        seriesShort: "сер.",
        seriesRest: "відпочинок серії",
        time: "час",
        target: "Ціль",
        inTime: "за",
        perimeter: "периметр"
      };
      const en = {
        set: "SERIES",
        pace: "PACE",
        lap: "LAP",
        distance: "DISTANCE",
        laps: "LAPS",
        cue: "CUE",
        work: "work",
        seriesShort: "ser.",
        seriesRest: "series rest",
        time: "time",
        target: "Target",
        inTime: "in",
        perimeter: "perimeter"
      };
      const map = diLang() === "uk" ? uk : en;
      return map[key] || en[key] || key;
    }

    function runningEliteLabels() {
      return {
        set: eliteUi("ІНТЕРВАЛ", "INTERVAL"),
        target: diLang() === "uk" ? "РОБОТА" : "WORK",
        rest: diLang() === "uk" ? "ВІДПОЧИНОК" : "REST",
        last: runningWord("distance"),
        best: diLang() === "uk" ? "СЕРІЇ" : "SERIES",
        load: runningWord("cue")
      };
    }

    function speedEliteLabels() {
      return diLang() === "uk"
        ? { set: "СЕРІЯ", target: "ЗОНА", rest: "ПОВТОРИ", last: "МЕТРИ", best: "ЕКСПОЗИЦІЯ", load: "РОЗБІГ / ГАЛЬМО" }
        : { set: "SERIES", target: "ZONE", rest: "REPS", last: "METERS", best: "EXPOSURE", load: "BUILD / BRAKE" };
    }

    function runningFocusText(r = {}) {
      if (diLang() === "uk") {
        return `${runningWord("target")} ${r.target} ${runningWord("inTime")} ${r.total}. ${runningWord("pace")} ${r.pace}. ${runningWord("lap")} ${r.lap}. ${runningWord("cue")} ${r.cue}.`;
      }
      return `Target ${r.target} in ${r.total}. Pace ${r.pace}. Lap ${r.lap}. Cue ${r.cue}.`;
    }

    function speedFocusText(s = {}) {
      if (diLang() === "uk") {
        return `${s.type}. Зона ${s.zone}. Ціль ${s.target}. Експозиція ${s.exposure}.`;
      }
      return `${s.type}. Zone ${s.zone}. Target ${s.target}. Exposure ${s.exposure}.`;
    }

    function eliteUi(uk, en) { return diLang() === "uk" ? uk : en; }

    function dailyJournalClient(){
      const auth=window.firebase?.auth?.();
      if(!auth?.currentUser||auth.currentUser.uid!==CURRENT_UID||!window.PACSessionJournal)return null;
      if(!DAILY_JOURNAL||DAILY_JOURNAL_UID!==CURRENT_UID){
        const uid=CURRENT_UID;DAILY_JOURNAL_UID=uid;
        DAILY_JOURNAL=window.PACSessionJournal.createClient({db:firebase.firestore(),auth,storage:firebase.storage(),localStorage,
          onStatus:status=>{
            if(CURRENT_UID!==uid)return;
            const label=document.getElementById('daily-journal-status');
            if(label)label.textContent=status.state==='synced'?eliteUi("Синхронізовано з акаунтом.","Synced to your account."):
              status.state==='syncing'?eliteUi("Синхронізація…","Syncing…"):eliteUi("Є локальні записи, що очікують синхронізації.","Local records are waiting to sync.");
            if(status.state==='synced'){window.dispatchEvent(new CustomEvent('pac:journal-synced'));renderDailyJournal().catch(()=>{});}
          }});
      }
      return DAILY_JOURNAL;
    }
    function dailySyncStrength(run){
      const client=dailyJournalClient();if(!client)return;
      client.enqueueExecution(window.PACSessionJournal.strengthRecord(run)).then(()=>{
        if(CURRENT_UID===run.userId)eliteStrengthStore().markSynced(run.executionId);
      }).catch(()=>{});
    }
    function dailySyncProfile(meta){
      const client=dailyJournalClient();if(client)client.profile(meta.task.exerciseId,eliteStrengthStore().performance(meta.task.exerciseId)).catch(()=>{});
    }
    async function renderDailyJournal(){
      if(!window.PACSessionJournal||!window.firebase?.auth?.().currentUser)return;
      let host=document.getElementById('daily-session-journal');
      if(!host){host=document.createElement('section');host.id='daily-session-journal';host.style.cssText='margin-top:24px;padding:16px;border:1px solid #3a3219;border-radius:12px;color:#ccc';
        host.innerHTML=`<details><summary style="cursor:pointer;color:#d4af37">${eliteUi("Журнал тренувань","Training journal")}</summary><p id="daily-journal-status" role="status"></p><button type="button" id="daily-journal-retry">${eliteUi("Синхронізувати","Sync now")}</button><div id="daily-journal-list"></div></details>`;
        (document.getElementById('user-feedback-container')||document.querySelector('main')||document.body).append(host);
        host.querySelector('button').addEventListener('click',()=>dailyJournalClient()?.flush().catch(()=>{}));
      }
      const uid=CURRENT_UID,auth=firebase.auth(),reader=DAILY_JOURNAL||window.PACSessionJournal.createClient({db:firebase.firestore(),auth,storage:firebase.storage(),localStorage});
      const data=await reader.list(uid);if(CURRENT_UID!==uid)return;
      const list=host.querySelector('#daily-journal-list');list.replaceChildren();
      for(const entry of data.records.filter(entry=>entry.data.schemaVersion===2).sort((a,b)=>b.data.date.localeCompare(a.data.date)).slice(0,20)){
        const details=document.createElement('details'),summary=document.createElement('summary');summary.textContent=`${entry.data.date} · ${Object.keys(entry.data.executionIndex||{}).length} ${eliteUi("виконань","executions")}`;details.append(summary);
        for(const row of Object.values(entry.data.executionIndex||{})){
          const line=document.createElement('p');line.textContent=`${row.name||row.exerciseId}: ${row.recordedCount}/${row.plannedCount??'—'} · ${row.countPct==null?'—':row.countPct+'%'}${row.distancePct==null?'':` · ${eliteUi("дистанція","distance")}: ${row.distancePct}%`}${row.paceDeltaSecPerKm==null?'':` · Δ ${Math.round(row.paceDeltaSecPerKm)} s/km`}`;details.append(line);
        }
        const more=document.createElement('button');more.type='button';more.textContent=eliteUi("Фактичні підходи / інтервали","Actual sets / intervals");
        more.addEventListener('click',async()=>{more.disabled=true;try{
          const rows=await reader.executions(entry.data.sessionId,uid);if(CURRENT_UID!==uid)return;
          for(const record of rows){const p=document.createElement('pre');p.style.cssText='white-space:pre-wrap;font-size:.78rem';const a=record.payload.actual;
            p.textContent=(a.strengthSets||a.runningIntervals||[]).map(row=>row.setIndex?`#${row.setIndex}${row.side?`/${row.side}`:''}: ${row.loadKg??'—'} kg × ${row.reps??`${row.workSec}s`}${row.rest?`\n  ${eliteUi('Пауза: план','Rest: planned')} ${row.rest.plannedSec??'—'} s · ${eliteUi('за годинником застосунку','app clock')} ${row.rest.elapsedSec} s · ${eliteUi('відлік виконано','timer completed')} ${row.rest.timerCompletionPct??'—'}%\n  ${eliteUi('Фактичний початок роботи не підтверджений датчиком.','Actual work start is not sensor-confirmed.')}`:''}`:`#${row.round}: ${row.workSec}s · ${row.distanceM??'—'} m`).join('\n');details.append(p);
            if(record.payload.route){const route=document.createElement('button');route.type='button';route.textContent=eliteUi("Завантажити маршрут","Download route");route.addEventListener('click',async()=>{const url=await firebase.storage().ref(record.payload.route.path).getDownloadURL();const blob=await(await fetch(url)).blob();const link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download=`${record.executionId}.json`;link.click();setTimeout(()=>URL.revokeObjectURL(link.href),1000);});details.append(route);}
          }
        }catch{more.disabled=false;}});details.append(more);list.append(details);
      }
    }
    function initDailyJournal(){
      const client=dailyJournalClient();if(!client)return;
      const uid=CURRENT_UID;
      renderDailyJournal().catch(()=>{});
      client.profiles(uid).then(profiles=>{if(CURRENT_UID===uid)eliteStrengthStore().importProfiles(profiles);}).catch(()=>{});
      try{for(const run of Object.values(eliteStrengthStore().read().executions))if(run.sync?.status!=='synced')dailySyncStrength(run);}catch{}
      client.flush().catch(()=>{});
    }
    window.addEventListener('online',()=>dailyJournalClient()?.flush().catch(()=>{}));

    function elitePrepareRunning(meta) {
      if(!meta.task.ready){ELITE_RUNNING.live=null;ELITE_RUNNING.loading=false;ELITE_RUNNING.error=eliteUi('Для старту потрібні кількість серій, час роботи та відпочинок. Тренер задає їх у персональному завданні.','Series count, work and rest are required to start. Your coach sets them in the personal assignment.');renderEliteExecutionOverlay();window.PACDailyRunning.prepare(meta.task,setup=>{if(getEliteMeta()!==meta||!ELITE_EXEC.open||meta.task.ready)return;ELITE_RUNNING.setupLive=setup;eliteRenderRunningFieldSetup(setup);},true).catch(()=>{});return;}
      ELITE_RUNNING.setupLive=null;ELITE_RUNNING.loading=true; ELITE_RUNNING.live=null;ELITE_RUNNING.error="";ELITE_RUNNING.gpsFailed=false;ELITE_RUNNING.envelope=null;
      window.PACDailyRunning.prepare({...meta.task,soundEnabled:!ELITE_EXEC.voiceMuted}, live=>{
        if(!ELITE_EXEC.open||getEliteMeta()!==meta)return;
        for(const cue of RUNNING_AUDIO_GUIDE?.update(live)||[]){
          if(cue.kind==='rest')eliteSpeak(eliteVoicePack().rest+'. '+eliteSpeechAmount(cue.seconds,['секунда','секунди','секунд'],['second','seconds']),{interrupt:true});
          if(cue.kind==='kilometre'){
            const labels={uk:['Загальний час','Останній кілометр'],en:['Total time','Last kilometre'],ru:['Общее время','Последний километр'],de:['Gesamtzeit','Letzter Kilometer'],es:['Tiempo total','Último kilómetro'],pt:['Tempo total','Último quilómetro']}[diLang()]||['Total time','Last kilometre'];
            const lap=cue.lapSeconds==null?'':' '+labels[1]+': '+eliteSpeechDuration(cue.lapSeconds)+'.';
            eliteSpeak(eliteSpeechAmount(cue.kilometres,['кілометр','кілометри','кілометрів'],['kilometre','kilometres'])+'. '+labels[0]+': '+eliteSpeechDuration(cue.totalSeconds)+'.'+lap,{interrupt:true});
          }
        }
        const justFinished=live.state==='finished'&&ELITE_RUNNING.live?.state!=='finished';
        ELITE_RUNNING.live=live;ELITE_RUNNING.loading=false;
        if(live.state==='ready'){ELITE_EXEC.phase='idle';ELITE_EXEC.paused=false;ELITE_EXEC.setIndex=1;meta.task.actual={};meta.task.sessionId=null;meta.task.executionId=null;ELITE_RUNNING.envelope=null;}
        if(['running','paused','finished'].includes(live.state)){
          ELITE_EXEC.paused=live.state==='paused';ELITE_EXEC.leftSec=live.remainingSec;
          ELITE_EXEC.setIndex=Math.max(1,live.round);ELITE_EXEC.totalSets=meta.task.planned.sets;
          ELITE_EXEC.phase=live.state==='finished'?'complete':live.phase==='work'?'active':live.phase==='prep'?'preset':'rest';
          ELITE_EXEC.setIndex=Math.max(1,live.round||1);ELITE_EXEC.leftSec=live.remainingSec;
          const session=live.session;
          if(session?.dailyTask){meta.task.sessionId=session.sessionId;meta.task.executionId=session.dailyTask.executionId;meta.task.planned=live.state==='finished'?window.PACExerciseTask.resolve(meta.exercise,meta.task.context).planned:session.dailyTask.planned;ELITE_EXEC.totalSets=meta.task.planned.sets;}
          if(live.state==='finished'){
            ELITE_RUNNING.envelope=window.PACDailyRunning.result();
            meta.task.actual={runningIntervals:session.runningIntervals,completedIntervals:session.completedRounds,
              distanceM:session.gps.hasMeasurements?session.distanceMeters:null,activeMs:session.activeMs,
              gps:session.gps,quality:session.quality,routeRef:session.routeRef,programCompleted:session.completedRounds===session.dailyTask.planned.sets,
              sync:{status:live.localSaved?'local-only':'pending-local'}};
            if(live.localSaved&&ELITE_RUNNING.queuedId!==session.dailyTask.executionId&&window.PACSessionJournal&&window.PACSessionRepository){
              const client=dailyJournalClient();if(client){
                const record=window.PACSessionJournal.runningRecord(ELITE_RUNNING.envelope),{gpsLocalSessionId,...raw}=record;
                const decision=window.PACSessionRepository.prepareExecution({actorId:CURRENT_UID,record:raw,now:new Date().toISOString()},null,null);
                ELITE_RUNNING.queuedId=session.dailyTask.executionId;
                setExerciseDoneUi(meta.exId,meta.exKey,decision.execution.summary.goalMet);
                client.enqueueExecution(record).catch(()=>{});
              }
            }
          }
        }
        renderEliteExecutionOverlay();
        if(justFinished&&!document.getElementById('di-running-result').open)document.getElementById('di-running-result').showModal();
      }).catch(()=>{if(getEliteMeta()===meta){ELITE_RUNNING.loading=false;ELITE_RUNNING.error=eliteUi("GPS-модуль недоступний. Перевір з’єднання й відкрий вправу повторно.","GPS module unavailable. Check the connection and reopen the exercise.");renderEliteExecutionOverlay();}});
    }

    async function eliteCheckRunningGPS(){
      const meta=getEliteMeta();if(!meta||ELITE_RUNNING.checkingGPS||ELITE_RUNNING.connecting)return;
      ELITE_RUNNING.checkingGPS=true;eliteRenderRunningFieldSetup(ELITE_RUNNING.live||ELITE_RUNNING.setupLive);
      try{const result=await window.PACDailyRunning.checkGPS();if(getEliteMeta()!==meta||!ELITE_EXEC.open)return;ELITE_RUNNING.gpsCheck={...result,at:Date.now(),exId:meta.exId};}
      catch(error){if(getEliteMeta()===meta&&ELITE_EXEC.open)ELITE_RUNNING.gpsCheck={ready:false,reason:'unavailable',at:Date.now(),exId:meta.exId};}
      finally{ELITE_RUNNING.checkingGPS=false;if(getEliteMeta()===meta&&ELITE_EXEC.open)renderEliteExecutionOverlay();}
    }

    async function eliteConnectRunningGPS(){
      const info=document.getElementById('di-elite-info');
        if(ELITE_RUNNING.connecting)return;const context=getEliteMeta();ELITE_RUNNING.connecting=true;
        ELITE_RUNNING.error=eliteUi('Підключення GPS… Дозволь геолокацію на телефоні.','Connecting GPS… Allow phone location.');
        renderEliteExecutionOverlay();
        try{window.PACDailyRunning.phoneGPS();const result=await window.PACDailyRunning.checkGPS();if(getEliteMeta()!==context||!ELITE_EXEC.open)return;
          if(result.ready){ELITE_RUNNING.error='';ELITE_RUNNING.gpsFailed=false;window.PACDailyRunning.start();if(info.open)info.close();}
          else {ELITE_RUNNING.gpsFailed=true;ELITE_RUNNING.error=eliteUi('GPS недоступний або недостатньо точний. Дозволь геолокацію, вийди надвір і повтори. Без GPS буде записаний лише час.','GPS unavailable or not accurate enough. Allow location, go outdoors and retry. Without GPS, only time is recorded.');}
        }catch(error){if(getEliteMeta()!==context||!ELITE_EXEC.open)return;ELITE_RUNNING.error=error.message==='FIELD_REQUIRED'?eliteUi('Обери або додай поле перед стартом.','Choose or add a field before starting.'):eliteUi('Не вдалося почати. Перевір дозвіл геолокації та повтори.','Could not start. Check location permission and retry.');}
        finally{ELITE_RUNNING.connecting=false;if(getEliteMeta()===context&&ELITE_EXEC.open)renderEliteExecutionOverlay();}
    }

    async function eliteRunningAction() {
      const context=getEliteMeta();
      const live=ELITE_RUNNING.live;
      if(!live||ELITE_RUNNING.loading||ELITE_RUNNING.connecting)return;
      try{
        if(live.state==='ready'){
          if(!live.timerOnly&&!live.gpsReady){
            await eliteConnectRunningGPS();
          }else{ELITE_RUNNING.error="";window.PACDailyRunning.start();}
        }else if(live.state==='paused'){window.PACDailyRunning.resume();}
        else if(live.state==='running'){await window.PACDailyRunning.finish();}
        else if(live.state==='finished'){if(live.saveError)await window.PACDailyRunning.finish();else document.getElementById('di-running-result').showModal();}
      }catch(error){if(!ELITE_EXEC.open||getEliteMeta()!==context)return;if(error.message==='FIELD_REQUIRED'){ELITE_RUNNING.error=eliteUi("Обери або відкалібруй поле у деталях.","Choose or calibrate a field in Details.");eliteRunningPanel('setup');document.getElementById('di-elite-info').showModal();}else ELITE_RUNNING.error=eliteUi("Результат ще не збережено. Не закривай сторінку й повтори дію.","Result not saved yet. Keep the page open and retry.");}
      renderEliteExecutionOverlay();
    }

    function eliteRenderRunning(meta) {
      const live=ELITE_RUNNING.live,button=document.getElementById('di-elite-main-btn'),pause=document.getElementById('di-elite-pause-btn');
      const sub=document.getElementById('di-elite-main-sub');
      eliteRunningPanel(document.getElementById('di-elite-info').dataset.runningPanel||'setup');
      eliteRenderCoachRunning(meta);eliteRenderRunningFieldSetup(live||ELITE_RUNNING.setupLive);
      document.getElementById('di-running-new').hidden=live?.state!=='finished';
      if(!live){button.disabled=true;button.textContent=ELITE_RUNNING.loading?eliteUi('ЗАВАНТАЖЕННЯ…','LOADING…'):eliteUi('ПОЧАТИ ТРЕНУВАННЯ','START WORKOUT');sub.textContent=ELITE_RUNNING.error;pause.style.display='none';document.getElementById('di-running-timer').hidden=true;return;}
      const demo=document.querySelector('#di-elite-video-host iframe[src*="clock=daily"]');
      if(demo){const offset=(meta.motionEstimates||[]).find(row=>row.playerId===meta.task.planned.playerId)?.startSec||0;
        const seconds=offset+(live.state==='ready'||live.phase==='prep'?0:live.phase==='work'?live.phaseElapsedSec:meta.task.planned.workSec);
        demo.contentWindow?.postMessage({type:'pac:daily-clock',seconds,state:live.state,phase:live.phase},location.origin);}
      button.disabled=!!ELITE_RUNNING.connecting||!!ELITE_RUNNING.checkingGPS;
      button.textContent=ELITE_RUNNING.connecting?eliteUi('ПІДКЛЮЧЕННЯ…','CONNECTING…'):live.state==='ready'?eliteUi('ПОЧАТИ ТРЕНУВАННЯ','START WORKOUT'):live.state==='paused'?eliteUi('ПРОДОВЖИТИ','RESUME'):live.state==='finished'?eliteUi('ПІДСУМОК','SUMMARY'):eliteUi('ЗАВЕРШИТИ','FINISH');
      if(live.saveError)button.textContent=eliteUi("ПОВТОРИТИ ЗБЕРЕЖЕННЯ","RETRY SAVE");
      pause.style.display=['running','paused'].includes(live.state)?'block':'none';
      pause.textContent=live.state==='paused'?eliteUi("ПРОДОВЖИТИ","RESUME"):ti('elitePause');
      document.getElementById('di-elite-target').textContent=live.state==='ready'?formatDurationClock(meta.task.planned.workSec):formatDurationClock(live.remainingSec);
      document.getElementById('di-elite-set-k').textContent=eliteUi('СЕРІЯ','SERIES');
      document.getElementById('di-elite-target-k').textContent=live.phase==='rest'?eliteUi("ПАУЗА","REST"):live.phase==='prep'?eliteUi("ПІДГОТОВКА","PREPARE"):eliteUi("РОБОТА","WORK");
      document.getElementById('di-elite-set').textContent=`${Math.max(1,live.round||1)} / ${meta.task.planned.sets}`;
      document.getElementById('di-elite-rest-k').textContent=eliteUi('ВІДПОЧИНОК','REST');
      document.getElementById('di-elite-rest-after').textContent=formatDurationClock(eliteResolveRestSec(meta,live.round||1));
      if(live.state==='finished')document.getElementById('di-elite-rest-after').textContent='—';
      const gps=live.timerOnly?eliteUi("Без GPS","Timer only"):live.gpsStatus==='denied'?eliteUi("GPS: немає дозволу","GPS: denied"):
        live.gpsReady||live.gpsStatus==='active'?eliteUi("GPS готовий","GPS ready"):eliteUi("GPS ще не підключено","GPS not connected");
      sub.textContent=ELITE_RUNNING.error||gps;
      document.getElementById('di-running-timer').hidden=!(live.state==='ready'&&!!ELITE_RUNNING.gpsFailed);

      if(live.state==='finished'){
        const session=live.session,planned=session.dailyTask?.planned||meta.task.planned;
        document.getElementById('di-elite-result-text').textContent=`${eliteUi("Завершені інтервали","Completed intervals")}: ${session.completedRounds}/${planned.sets}. ${eliteUi("Робота план / факт","Work plan / actual")}: ${formatDurationClock(planned.sets*planned.workSec)} / ${formatDurationClock(session.runningIntervals.reduce((sum,row)=>sum+row.workSec,0))}. ${eliteUi("Дистанція план / GPS","Distance plan / GPS")}: ${(planned.totalDistanceM??planned.distanceM)==null?'—':formatMetersSmart(planned.totalDistanceM??planned.distanceM)} / ${session.gps.hasMeasurements?formatMetersSmart(session.distanceMeters):eliteUi("не підтверджена GPS","not confirmed by GPS")}. ${live.saveError?eliteUi("Помилка локального збереження.","Local save failed."):live.localSaved?eliteUi("Збережено на цьому пристрої.","Saved on this device."):eliteUi("Збереження…","Saving…")}`;
      }
    }

    function eliteRenderRunningFieldSetup(live){
      const check=ELITE_RUNNING.gpsCheck,valid=check?.exId===getEliteMeta()?.exId&&Date.now()-check.at<60000;
      const ready=live?.gpsReady||(valid&&check.ready),denied=live?.gpsStatus==='denied'||(valid&&check.reason==='denied');
      const accuracy=live?.accuracy??(valid?check.accuracy:null);
      document.getElementById('di-running-gps-state').textContent=ELITE_RUNNING.checkingGPS?eliteUi('Підключення GPS… Дозволь геолокацію.','Connecting GPS… Allow location access.'):ready?eliteUi('GPS: сигнал доступний','GPS: signal available')+(Number.isFinite(accuracy)?' · ±'+Math.round(accuracy)+' m':''):denied?eliteUi('GPS: немає дозволу. Дозволь геолокацію в браузері.','GPS: permission denied. Allow location in your browser.'):valid?eliteUi('GPS: сигнал поки недоступний. Повтори надворі.','GPS: signal unavailable. Try again outdoors.'):eliteUi('GPS ще не підключено. Запис почнеться лише після «Почати».','GPS not connected. Recording begins only after Start.');

      const setup=live?.fieldSetup||{mode:'route',fields:[]},fieldSelect=document.getElementById('di-running-field');
      const fieldsKey=JSON.stringify(setup.fields);
      if(fieldSelect.dataset.fields!==fieldsKey){fieldSelect.dataset.fields=fieldsKey;fieldSelect.replaceChildren();for(const row of [{id:'',name:eliteUi('Обери поле','Choose field')},...setup.fields]){const option=document.createElement('option');option.value=row.id;option.textContent=row.name;fieldSelect.append(option);}}
      fieldSelect.value=setup.fieldId||'';
      document.getElementById('di-running-fields').hidden=setup.mode!=='field';
      document.getElementById('di-running-edit-field').disabled=!setup.fieldId||live?.state!=='ready'||!!ELITE_RUNNING.connecting;
      document.querySelectorAll('#di-running-setup [data-location]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.location===setup.mode)));
      document.querySelectorAll('#di-running-setup button,#di-running-setup select').forEach(el=>{if(el.id!=='di-running-edit-field'&&!el.closest('#di-running-coach'))el.disabled=live?.state!=='ready'||!!ELITE_RUNNING.connecting||!!ELITE_RUNNING.checkingGPS;});
    }

    function eliteRunningPanel(panel){
      const info=document.getElementById('di-elite-info');info.dataset.runningPanel='setup';
      document.getElementById('di-running-setup').hidden=false;info.querySelector('.di-elite-task').hidden=true;
    }

    function eliteOpenRunningPrescription(){if(!canEditRunningPlan()||getEliteMeta()?.task.mode!=='running')return;document.querySelector('#di-running-coach > details').open=true;document.getElementById('di-running-prescription').showModal();}
    function canEditRunningPlan(){const scope=CURRENT_SCOPE;return Boolean(scope?.allowed&&scope.canCoachEdit&&scope.effectiveUserId===CURRENT_UID&&scope.authUid===window.firebase?.auth?.().currentUser?.uid);}
    function eliteRenderCoachRunning(meta){
      const form=document.getElementById('di-running-coach'),allowed=canEditRunningPlan();form.hidden=!allowed;document.getElementById('di-running-use-route-time').hidden=!meta.task.planned.routeIntervalSec;
      const estimates=meta.motionEstimates||window.PACExerciseTask.motionEstimates(meta.exercise.playerSeriesTotals?meta.exercise:meta.exercise.tacticalDrill||{});
      const chosen=estimates.find(row=>row.playerId===meta.task.planned.playerId);
      const pace=meta.task.planned.runningTarget?.paceSecPerKm;
      const routeTime=chosen?.distanceM>0&&pace>0?formatDurationClock(chosen.distanceM/1000*pace):eliteUi('потрібні дистанція та цільовий темп','distance and target pace required');
      document.getElementById('di-running-route-estimate').textContent=chosen?
        `${eliteUi('Гравець','Player')}: ${chosen.name}${chosen.distanceM==null?'':` · ${formatMetersSmart(chosen.distanceM)}`}. ${eliteUi('Орієнтовний час за цільовим темпом','Estimated time at target pace')}: ${routeTime}. ${eliteUi('У схемі, не фактичний біг','In the diagram, not measured running')}: ${formatDurationClock(chosen.workSec)} ${eliteUi('руху','movement')}, ${(chosen.waitSec==null?'—':formatDurationClock(chosen.waitSec))} ${eliteUi('очікування','waiting')}.`:
        estimates.length>1?eliteUi('Групова вправа. Окремий орієнтир гравця можна задати за потреби.','Group drill. An individual player reference is optional.'):eliteUi('У збереженому завданні немає підрахунку маршруту гравця. Потрібно зберегти схему з редактора; час анімації не є часом тренування.','This task has no saved player route totals. Save the diagram from the editor; animation duration is not workout duration.');
      if(!allowed)return;
      const signature=JSON.stringify(window.PACExerciseTask.resolve(meta.exercise,meta.task.context).planned),key=meta.exId+signature;
      if(form.dataset.key!==key){
        form.dataset.key=key;form.dataset.expected=JSON.stringify(meta.exercise.coachRunningPlan||null);
        const p=window.PACExerciseTask.resolve(meta.exercise,meta.task.context).planned;
        for(const name of ['workSec','restSec','prepSec','restBetweenSetsSec','blocks','rounds'])form.elements[name].value=p[name]??(name==='blocks'?1:name==='rounds'?p.sets||1:0);
        form.elements.distanceM.value=p.distancePerSeriesM??p.distanceM??'';form.elements.rounds.value=p.sets&&p.blocks?p.sets/p.blocks:p.sets||p.rounds||1;form.elements.playerId.value=p.playerId||'';
      }
      const select=form.elements.playerId,playersKey=JSON.stringify(estimates.map(row=>[row.playerId,row.name]));
      if(select.dataset.players!==playersKey){const selected=select.value||meta.task.planned.playerId||'';select.dataset.players=playersKey;select.replaceChildren();for(const row of [{playerId:'',name:eliteUi('Як у схемі / групова вправа','As authored / group drill')},...estimates]){const option=document.createElement('option');option.value=row.playerId;option.textContent=row.name;select.append(option);}select.value=selected;select.parentElement.hidden=!estimates.length;}

      const active=['running','paused'].includes(ELITE_RUNNING.live?.state)||form.dataset.saving==='1';form.querySelectorAll('input,select,button').forEach(el=>el.disabled=active);
    }
    async function eliteSaveCoachRunning(event){
      event.preventDefault();const form=event.target,meta=getEliteMeta();if(!canEditRunningPlan()||meta?.task.mode!=='running')return;
      if(form.dataset.saving==='1')return;form.dataset.saving='1';
      const status=document.getElementById('di-running-coach-status');
      try{
        if(['running','paused'].includes(ELITE_RUNNING.live?.state))throw Error('FINISH_CURRENT_ATTEMPT');
        const values={};for(const name of ['workSec','restSec','prepSec','restBetweenSetsSec','blocks','rounds'])values[name]=Number(form.elements[name].value);values.distanceBasis='per-series';values.distanceM=form.elements.distanceM.value.trim()===''?null:Number(form.elements.distanceM.value);values.playerId=form.elements.playerId.value;const series=meta.exercise.playerSeriesTotals||meta.exercise.tacticalDrill?.playerSeriesTotals||meta.exercise.tacticalDrill?.exerciseStructure?.playerSeriesTotals;if(Array.isArray(series))values.playerSeriesTotals=series;
        
        const uid=CURRENT_UID,weekId=CURRENT_WEEK_ID,authUid=CURRENT_SCOPE.authUid,context={variantKey:CURRENT_VARIANT_KEY,variantIndex:CURRENT_VARIANT_INDEX};
        const ref=firebase.firestore().collection('weekly_plans').doc(`${uid}_${weekId}`),fallback=JSON.parse(JSON.stringify(window.__planData||{}));
        let next;
        await firebase.firestore().runTransaction(async tx=>{
          const snap=await tx.get(ref);if(!canEditRunningPlan()||firebase.auth().currentUser.uid!==authUid||CURRENT_UID!==uid)throw Error('OWNER_CHANGED');
          const old=snap.exists?snap.data():{};if(old.userId&&old.userId!==uid)throw Error('OWNER_MISMATCH');
          next=window.PACExerciseTask.editRunningPlan(old.planData||fallback,context,meta.task.planItemId,values,form.dataset.expected);
          tx.set(ref,{userId:uid,weekId,planData:next,updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
        });
        window.__planData=next;const {playerSeriesTotals}=values,savedVariants=next[`status_plan_${context.variantKey}`],savedVariant=Array.isArray(savedVariants)?savedVariants[context.variantIndex]:savedVariants,savedAssignment=savedVariant.exercises.find(e=>e.planItemId===meta.task.planItemId).coachRunningPlan;meta.exercise.coachRunningPlan={...savedAssignment};if(playerSeriesTotals)meta.exercise.playerSeriesTotals=playerSeriesTotals;meta.task=window.PACExerciseTask.resolve(meta.exercise,{...meta.task.context,routePlayerId:null});
        form.dataset.key='';status.textContent=eliteUi('Персональне завдання збережено для цього атлета. Уже розпочата спроба лишається зі своїм планом.','Personal assignment saved for this athlete. An existing attempt retains its original plan.');
        elitePrepareRunning(meta);
      }catch(error){status.textContent=error.message==='PLAN_CHANGED_REOPEN'?eliteUi('План уже змінився. Перезавантаж сторінку перед редагуванням.','Plan changed. Reload before editing.'):error.message;}
      finally{delete form.dataset.saving;if(getEliteMeta()===meta)eliteRenderCoachRunning(meta);}
    }

    function eliteStrengthStore() {
      if (!CURRENT_UID) throw Error("OWNER_REQUIRED");
      if (!ELITE_STRENGTH.store || ELITE_STRENGTH.store.userId !== CURRENT_UID) {
        ELITE_STRENGTH.store = { ...window.PACStrengthExecution.createStore(localStorage, CURRENT_UID), userId: CURRENT_UID };
      }
      return ELITE_STRENGTH.store;
    }
    function eliteHasStrengthRun(meta = getEliteMeta()) {
      return meta?.task?.mode === "gym" && ELITE_STRENGTH.run?.userId === CURRENT_UID && ELITE_STRENGTH.run?.task.planItemId === meta.task.planItemId;
    }
    function eliteStrengthError(error) {
      const messages = {
        INVALID_LOAD: eliteUi("Введи фактичну загальну вагу, кг. Для власної ваги введи 0.", "Enter actual total load in kg; use 0 for bodyweight."),
        INVALID_REPS: eliteUi("Введи фактично виконані повторення цілим числом. 0 — якщо повторення не виконано.", "Enter actual completed reps as a whole number; use 0 if none."),
        TEST_LOAD_PROGRESSION: eliteUi("У тесті потрібна додатна вага, не нижча за попередній підхід. Можна зупинити тест.", "Test load must be positive and no lower than the previous set. You can stop the test."),
        INVALID_PERCENT: eliteUi("Відсоток має бути більшим за 0 і не перевищувати 100.", "Percentage must be greater than 0 and at most 100."),
        INVALID_REFERENCE: eliteUi("Для відомого результату введи додатну вагу й від 1 до 15 повторень.", "For a known result enter positive load and 1–15 reps."),
        INVALID_PLAN: eliteUi("Перевір кількість підходів у програмі з тренером.", "Check the planned set count with your coach.")
      };
      ELITE_STRENGTH.error = messages[error?.message] || eliteUi("Не вдалося зберегти дані на цьому пристрої. Не закривай вікно й повтори збереження.", "Could not save on this device. Keep this window open and retry saving.");
      ELITE_STRENGTH.errorKind = messages[error?.message] ? "validation" : "storage";
      const el = document.getElementById("di-strength-message"); if (el) el.textContent = ELITE_STRENGTH.error;
      const retry = document.getElementById("di-strength-retry-save"); if (retry) retry.hidden = ELITE_STRENGTH.errorKind !== "storage";
    }
    function eliteSaveStrength() {
      if (!ELITE_STRENGTH.run) return true;
      try {
        eliteStrengthStore().save(ELITE_STRENGTH.run); ELITE_STRENGTH.error = "";
        const message = document.getElementById("di-strength-message"); if (message) message.textContent = eliteUi("Записи зберігаються на цьому пристрої для твого акаунта.", "Records are saved on this device for your account.");
        const retry = document.getElementById("di-strength-retry-save"); if (retry) retry.hidden = true;
        return true;
      }
      catch (error) { eliteStrengthError(error); return false; }
    }
    function eliteOpenStrength(meta, mode = "workout", fresh = false) {
      const date = getDateIdFromDate(new Date());
      ELITE_STRENGTH.run = eliteStrengthStore().start(meta.task, date, mode, { fresh,
        eligible: window.PACStrengthExecution.eligible(meta.exercise, meta.task), sets: ELITE_EXEC.totalSets,
        timed: eliteIsTimed(meta), reps: eliteIsTimed(meta) ? null : Number(meta.prescription.reps) || null,
        workSec: eliteIsTimed(meta) ? Number(meta.prescription.timedSeconds || meta.timer?.workSec) || null : null,
        sideTotal: mode === "test3" ? 1 : ELITE_EXEC.sideTotal });
      const run = ELITE_STRENGTH.run;
      meta.task.sessionId = run.sessionId; meta.task.executionId = run.executionId;
      ELITE_EXEC.setIndex = run.index; ELITE_EXEC.sideIndex = run.side;
      ELITE_EXEC.totalSets = run.targets.length; ELITE_EXEC.sideTotal = run.sideTotal; ELITE_EXEC.sideMode = run.sideTotal > 1;
      ELITE_EXEC.phase = "idle"; ELITE_EXEC.paused = false;
      if (run.pending.loadKg == null) {
        const rec = eliteRecommendedLoad(meta, run.index, run.targets.length);
        run.pending.loadKg = mode === "test3" ? null : rec.hasLoad ? rec.load : null;
      }
      ELITE_EXEC.currentLoadKg = run.pending.loadKg;
      ELITE_STRENGTH.error = ""; eliteSaveStrength();
      ELITE_STRENGTH.pendingFinish = null;
    }
    function eliteInstallStrengthFields(controls) {
      const fields = document.createElement("div"); fields.id = "di-strength-fields"; fields.className = "di-strength-fields";
      fields.innerHTML = `
        <label><span id="di-strength-mode-label"></span><select id="di-strength-mode"><option value="workout"></option><option value="test3"></option></select></label>
        <p id="di-strength-test-hint" hidden></p>
        <div class="di-strength-inputs">
          <label><span id="di-strength-load-label"></span><input id="di-strength-load" type="number" inputmode="decimal" min="0" max="2000" step="0.5"></label>
          <label id="di-strength-reps-wrap"><span id="di-strength-reps-label"></span><input id="di-strength-reps" type="number" inputmode="numeric" min="0" max="1000" step="1" placeholder="—"></label>
        </div>
        <small id="di-strength-load-hint"></small>
        <small id="di-strength-recommended"></small>
        <div id="di-strength-reference-summary"></div>
        <label id="di-strength-percent-wrap"><span id="di-strength-percent-label"></span><input id="di-strength-percent" type="number" min="1" max="100" step="0.5" inputmode="decimal" placeholder="—"></label>
        <details id="di-strength-known"><summary id="di-strength-known-heading"></summary><div class="di-strength-inputs">
          <label><span id="di-strength-known-load-label"></span><input id="di-strength-known-load" type="number" min="0.5" max="2000" step="0.5" inputmode="decimal"></label>
          <label><span id="di-strength-known-reps-label"></span><input id="di-strength-known-reps" type="number" min="1" max="15" step="1" inputmode="numeric" value="1"></label>
        </div><button type="button" id="di-strength-use-known" class="di-elite-secondary-btn"></button></details>
        <div class="di-strength-actions"><button type="button" id="di-strength-add-build" class="di-elite-secondary-btn" hidden></button><button type="button" id="di-strength-stop" class="di-elite-secondary-btn"></button></div>
        <button type="button" id="di-strength-skip-rest" class="di-elite-secondary-btn" hidden></button>
        <div id="di-strength-message" role="status"></div>
        <button type="button" id="di-strength-retry-save" class="di-elite-secondary-btn" hidden></button>`;
      controls.insertBefore(fields, controls.children[1] || null);
      for (const name of ["load", "reps"]) fields.querySelector(`#di-strength-${name}`).addEventListener("input", event => {
        if (!ELITE_STRENGTH.run) return;
        const raw = event.target.value;
        ELITE_STRENGTH.run.pending[name === "load" ? "loadKg" : "reps"] = raw === "" ? null : Number(raw);
        if (name === "reps") ELITE_STRENGTH.run.pending.repsSource = "manual";
        if (name === "load") ELITE_EXEC.currentLoadKg = raw === "" ? null : Number(raw);
        eliteSaveStrength();
      });
      fields.querySelector("#di-strength-mode").addEventListener("change", event => {
        try { eliteOpenStrength(getEliteMeta(), event.target.value, true); renderEliteExecutionOverlay(); } catch (error) { eliteStrengthError(error); }
      });
      fields.querySelector("#di-strength-add-build").addEventListener("click", () => {
        try { eliteStrengthStore().addBuild(ELITE_STRENGTH.run); ELITE_EXEC.totalSets = ELITE_STRENGTH.run.targets.length; renderEliteExecutionOverlay(); } catch (error) { eliteStrengthError(error); }
      });
      fields.querySelector("#di-strength-use-known").addEventListener("click", () => {
        try {
          const store = eliteStrengthStore(), meta = getEliteMeta();
          store.reference(meta.task.exerciseId, fields.querySelector("#di-strength-known-load").value, fields.querySelector("#di-strength-known-reps").value);
          dailySyncProfile(meta);
          if (ELITE_STRENGTH.run.mode === "test3") {
            eliteClearRuntimeTimers();
            if (ELITE_STRENGTH.run.activeSince != null) store.pause(ELITE_STRENGTH.run);
            dailySyncStrength(store.finish(ELITE_STRENGTH.run, true));
            eliteOpenStrength(meta, "workout", true);
          }
          ELITE_STRENGTH.error = ""; renderEliteExecutionOverlay();
        } catch (error) { eliteStrengthError(error); }
      });
      fields.querySelector("#di-strength-percent").addEventListener("change", event => {
        try {
          const meta = getEliteMeta(); eliteStrengthStore().setPercent(meta.task.exerciseId, event.target.value);
          dailySyncProfile(meta);
          if (ELITE_EXEC.phase === "idle") { const rec = eliteRecommendedLoad(meta, ELITE_EXEC.setIndex, ELITE_EXEC.totalSets); ELITE_STRENGTH.run.pending.loadKg = rec.hasLoad ? rec.load : null; ELITE_EXEC.currentLoadKg = ELITE_STRENGTH.run.pending.loadKg; eliteSaveStrength(); }
          ELITE_STRENGTH.error = ""; renderEliteExecutionOverlay();
        } catch (error) { eliteStrengthError(error); }
      });
      fields.querySelector("#di-strength-stop").addEventListener("click", () => eliteFinishStrength(true));
      fields.querySelector("#di-strength-retry-save").addEventListener("click", () => {
        if (ELITE_STRENGTH.pendingFinish != null) eliteFinishStrength(ELITE_STRENGTH.pendingFinish);
        else if (ELITE_STRENGTH.run?.rows.some(row => row.key === `${ELITE_STRENGTH.run.index}:${ELITE_STRENGTH.run.side}`)) eliteCompleteStrengthSet(getEliteMeta());
        else { eliteSaveStrength(); renderEliteExecutionOverlay(); }
      });
      fields.querySelector("#di-strength-skip-rest").addEventListener("click", () => { eliteClearRuntimeTimers(); ELITE_EXEC.phase = "idle"; ELITE_STRENGTH.run.phase = "ready"; eliteSaveStrength(); renderEliteExecutionOverlay(); });
    }

    function eliteRenderStrength(meta) {
      const fields = document.getElementById("di-strength-fields"), enabled = eliteHasStrengthRun(meta);
      fields.hidden = !enabled;
      if (!enabled) return;
      const run = ELITE_STRENGTH.run, store = eliteStrengthStore();
      let p = {}; try { p = store.performance(meta.task.exerciseId); } catch (error) { eliteStrengthError(error); }
      const test = run.mode === "test3", closed = run.status !== "in-progress";
      const label = (id, uk, en) => { document.getElementById(`di-strength-${id}`).textContent = eliteUi(uk, en); };
      label("mode-label", "Режим", "Mode");
      const mode = document.getElementById("di-strength-mode"); mode.options[0].textContent = eliteUi("Тренування", "Workout"); mode.options[1].textContent = eliteUi("Початковий тест · 3 повторення", "Initial test · 3 reps");
      mode.options[1].disabled = !window.PACStrengthExecution.eligible(meta.exercise, meta.task); mode.value = run.mode; mode.disabled = run.rows.length > 0 || ELITE_EXEC.phase !== "idle" || closed;
      label("test-hint", "Розігрів → підвідні підходи → 3 повторення. Вагу підвищуй вручну, без відмови. Можна додати підвідний підхід або зупинити тест.", "Warm-up → build-up sets → 3 reps. Increase load manually, without failure. Add a build-up set or stop when needed.");
      document.getElementById("di-strength-test-hint").hidden = !test;
      label("load-label", "Фактична загальна вага, кг", "Actual total load, kg"); label("reps-label", "Фактичні повторення", "Actual reps");
      label("load-hint", "Штанга з дисками або сума гантелей. Власна вага — 0 кг зовнішньої ваги.", "Bar plus plates, or both dumbbells combined. Bodyweight = 0 kg external load.");
      const rec = eliteRecommendedLoad(meta, run.index, run.targets.length);
      document.getElementById("di-strength-recommended").textContent = !test && rec.hasLoad ? `${eliteUi("Орієнтир", "Suggested load")}: ${rec.load} kg. ${eliteUi("Перевір і введи фактичну вагу.", "Check and enter the actual load.")}` : "";
      for (const [id, value] of [["load", run.pending.loadKg], ["reps", run.pending.reps]]) {
        const input = document.getElementById(`di-strength-${id}`); if (document.activeElement !== input) input.value = value ?? ""; input.disabled = closed;
      }
      document.getElementById("di-strength-reps-wrap").hidden = run.timed;
      label("known-heading", "Використати відомий силовий результат", "Use a known strength result"); label("known-load-label", "Загальна вага, кг", "Total load, kg"); label("known-reps-label", "Повторення", "Reps"); label("use-known", "Зберегти відомий результат", "Save known result");
      document.getElementById("di-strength-known").hidden = !window.PACStrengthExecution.eligible(meta.exercise, meta.task) || closed;
      const reference = p.referenceMax;
      document.getElementById("di-strength-reference-summary").textContent = reference ? `${reference.source === "estimated" ? eliteUi("Оцінений 1ПМ", "Estimated 1RM") : eliteUi("Відомий 1ПМ", "Known 1RM")}: ${reference.value} kg${reference.formula ? ` · ${reference.formula}, ${reference.basis.loadKg} kg × ${reference.basis.reps}` : ""}` : "";
      document.getElementById("di-strength-percent-wrap").hidden = !reference || test || closed;
      label("percent-label", "Робочий % від 1ПМ, якщо заданий тренером", "Working % of 1RM, if specified by your coach");
      const percent = document.getElementById("di-strength-percent"); if (document.activeElement !== percent) percent.value = meta.exercise.trainingPercent1RM ?? p.trainingPercent1RM ?? "";
      percent.disabled = meta.exercise.trainingPercent1RM != null;
      label("add-build", "Додати підвідний підхід", "Add build-up set"); label("stop", test ? "Зупинити тест" : "Завершити достроково", test ? "Stop test" : "Stop early");
      document.getElementById("di-strength-stop").hidden = closed;
      document.getElementById("di-strength-add-build").hidden = !test || closed || ELITE_EXEC.phase !== "idle" || run.index !== run.targets.length;
      label("skip-rest", "Завершити відпочинок", "End rest"); document.getElementById("di-strength-skip-rest").hidden = ELITE_EXEC.phase !== "rest";
      label("retry-save", "Повторити локальне збереження", "Retry local save"); document.getElementById("di-strength-retry-save").hidden = !ELITE_STRENGTH.error || ELITE_STRENGTH.errorKind !== "storage";
      document.getElementById("di-strength-message").textContent = ELITE_STRENGTH.error || eliteUi("Записи зберігаються на цьому пристрої для твого акаунта.", "Records are saved on this device for your account.");
      const rows = run.rows.map(row => `<tr><td>${escapeHtml(row.setIndex)}${row.side ? ` · ${escapeHtml(row.side)}` : ""}</td><td>${row.loadKg == null ? "—" : `${escapeHtml(row.loadKg)} kg`}</td><td>${row.reps == null ? `${escapeHtml(row.workSec)} s` : escapeHtml(row.reps)}</td></tr>`).join("");
      document.getElementById("di-elite-result-text").innerHTML = `${closed ? eliteUi(run.status === "completed" ? "Завершено" : "Зупинено достроково", run.status === "completed" ? "Completed" : "Stopped early") : eliteUi("Підтверджених записів", "Confirmed records")}: ${run.rows.length} / ${run.targets.length * run.sideTotal}${run.testResult ? `<br>${eliteUi("Оцінений 1ПМ", "Estimated 1RM")}: ${run.testResult.value} kg · Epley` : test && closed ? `<br>${eliteUi("Результат тесту на 3 повторення не встановлено.", "No valid 3-rep test result established.")}` : ""}${rows ? `<table aria-label="${eliteUi("Фактичні підходи", "Actual sets")}"><thead><tr><th>${eliteUi("Підхід", "Set")}</th><th>kg</th><th>${eliteUi("Повторення / час", "Reps / time")}</th></tr></thead><tbody>${rows}</tbody></table>` : ""}`;
      if (closed && run.task.actual.volumeKg != null) document.getElementById("di-elite-result-text").append(document.createTextNode(`${eliteUi("Обсяг (вага × повторення)", "Volume (load × reps)")}: ${run.task.actual.volumeKg} kg`));
      if (test) {
        document.getElementById("di-elite-task-heading").textContent = eliteUi("Завдання тесту", "Test task");
        document.getElementById("di-elite-task-grid").innerHTML = `<div class="di-elite-box"><div class="di-elite-k">${eliteUi("Послідовність повторень", "Repetition sequence")}</div><div class="di-elite-v">${escapeHtml(run.targets.join(" → "))}</div></div><div class="di-elite-box"><div class="di-elite-k">${eliteUi("Підходи", "Sets")}</div><div class="di-elite-v">${run.targets.length}</div></div>`;
        document.querySelector("#di-elite-overlay .di-elite-plan-details").hidden = true;
        document.getElementById("di-elite-role-top").textContent = run.index === run.targets.length ? eliteUi("ТЕСТ · 3 ПОВТОРЕННЯ", "TEST · 3 REPS") : eliteUi("ПІДВЕДЕННЯ ДО ТЕСТУ", "TEST BUILD-UP");
        document.getElementById("di-elite-target").textContent = `${run.targets[run.index - 1] || 3} ${eliteUi("повт.", "reps")}`;
      }
      if (ELITE_EXEC.phase === "complete" && test) document.getElementById("di-elite-main-btn").textContent = eliteUi("ПЕРЕЙТИ ДО ТРЕНУВАННЯ", "CONTINUE TO WORKOUT");
      if (ELITE_EXEC.phase === "active" && !run.timed) document.getElementById("di-elite-main-sub").textContent = `${eliteUi("За програмою", "Planned")}: ${run.targets[run.index - 1] ?? "—"} ${eliteUi("повт.", "reps")}. ${eliteUi("Інша кількість — натисни на вагу.", "Different reps? Tap the load.")}`;
      if (ELITE_EXEC.phase === "idle" && run.startedAt) document.getElementById("di-elite-main-btn").textContent = eliteUi("ПРОДОВЖИТИ ПІДХІД", "RESUME SET");
      if (test && document.querySelector("#di-elite-load-mid .s")) document.querySelector("#di-elite-load-mid .s").textContent = `× ${run.targets[run.index - 1]} ${eliteUi("повт.", "reps")}`;
    }

    function eliteFinishStrength(stopped = false) {
      const meta = getEliteMeta();
      if (!eliteHasStrengthRun(meta)) return;
      ELITE_STRENGTH.pendingFinish = stopped;
      try {
        eliteClearRuntimeTimers();
        const store = eliteStrengthStore();
        if (ELITE_STRENGTH.run.activeSince != null) store.pause(ELITE_STRENGTH.run);
        const done = store.finish(ELITE_STRENGTH.run, stopped);
        ELITE_STRENGTH.run = done; meta.task.actual = done.task.actual;
        dailySyncStrength(done);
        ELITE_STRENGTH.pendingFinish = null;
        ELITE_STRENGTH.error = ""; ELITE_EXEC.phase = "complete"; ELITE_EXEC.paused = false;
        eliteSpeak(stopped ? eliteUi("Зупинено", "Stopped") : ti("voiceDone"), { interrupt: true });
        if (done.mode === "workout" && !stopped) {
          const met = done.rows.every(row => done.timed ? row.workSec >= done.plannedWorkSec : row.targetReps != null && row.reps >= row.targetReps);
          setExerciseDoneUi(meta.exId, meta.exKey, met);
        }
        renderEliteExecutionOverlay();
      } catch (error) { eliteStrengthError(error); }
    }

    function eliteCompleteStrengthSet(meta) {
      const run = ELITE_STRENGTH.run, store = eliteStrengthStore();
      try {
        store.record(run, run.pending);
        store.save(run); // Retry may encounter a row already confirmed in memory.
        ELITE_STRENGTH.error = "";
        if (run.index === run.targets.length && run.side === run.sideTotal - 1) { eliteFinishStrength(); return; }
        const previousIndex = run.index, previousSide = run.side;
        store.advance(run);
        ELITE_EXEC.setIndex = run.index; ELITE_EXEC.sideIndex = run.side;
        ELITE_EXEC.currentLoadKg = run.pending.loadKg;
        ELITE_EXEC.paused = false;
        if (previousSide + 1 < run.sideTotal) { ELITE_EXEC.phase = "idle"; renderEliteExecutionOverlay(); return; }
        ELITE_EXEC.leftSec = eliteResolveRestSec(meta, previousIndex);
        if (ELITE_EXEC.leftSec <= 0) { ELITE_EXEC.phase = "idle"; renderEliteExecutionOverlay(); return; }
        ELITE_EXEC.phase = "rest"; eliteAnnounceRest(meta); renderEliteExecutionOverlay();
        ELITE_REST_AUDIO.seen.clear(); eliteStartStrengthRest();
      } catch (error) { eliteStrengthError(error); }
    }

    function elitePrepareRestAudio() {
      try {
        const Audio = window.AudioContext || window.webkitAudioContext;
        if (!Audio) return;
        ELITE_REST_AUDIO.context ||= new Audio();
        if (ELITE_REST_AUDIO.context.state === "suspended") ELITE_REST_AUDIO.context.resume().catch(() => {});
      } catch {}
    }

    function eliteRestBeat(left) {
      if (left < 0 || left > 5 || ELITE_REST_AUDIO.seen.has(left)) return;
      ELITE_REST_AUDIO.seen.add(left);
      if (ELITE_EXEC.voiceMuted) return;
      if(left>0&&window.speechSynthesis&&typeof SpeechSynthesisUtterance==='function'){
        eliteSpeak(left===5?eliteSpeechAmount(5,['секунда','секунди','секунд'],['second','seconds']):String(left),{interrupt:true,rate:1.2});
        window.dispatchEvent(new CustomEvent('pac:rest-cue',{detail:{remaining:left,kind:'voice'}}));return;
      }
      if(left===0)window.speechSynthesis?.cancel();
      try {
        const ctx = ELITE_REST_AUDIO.context;
        if (!ctx || ctx.state !== "running") return;
        for (const node of ELITE_REST_AUDIO.nodes) { try { node.stop(); } catch {} }
        ELITE_REST_AUDIO.nodes.clear();
        const oscillator = ctx.createOscillator(), gain = ctx.createGain();
        const duration = left === 0 ? .5 : .12, start = ctx.currentTime;
        oscillator.frequency.value = left === 0 ? 880 : 550;
        gain.gain.setValueAtTime(0, start); gain.gain.linearRampToValueAtTime(.16, start + .012);
        gain.gain.exponentialRampToValueAtTime(.001, start + duration);
        oscillator.connect(gain); gain.connect(ctx.destination);
        ELITE_REST_AUDIO.nodes.add(oscillator);
        oscillator.onended = () => { ELITE_REST_AUDIO.nodes.delete(oscillator); oscillator.disconnect(); gain.disconnect(); };
        oscillator.start(start); oscillator.stop(start + duration + .02);
        window.dispatchEvent(new CustomEvent("pac:rest-cue", { detail: { remaining: left, kind: left === 0 ? "start" : "short" } }));
      } catch {}
    }

    function eliteStartStrengthRest() {
      ELITE_REST_AUDIO.deadline = Date.now() + ELITE_EXEC.leftSec * 1000;
      eliteRestBeat(ELITE_EXEC.leftSec);
      ELITE_EXEC.intervalId = setInterval(() => {
        const left = Math.max(0, Math.ceil((ELITE_REST_AUDIO.deadline - Date.now()) / 1000));
        ELITE_EXEC.leftSec = left;
        if (left === 0) {
          eliteClearRuntimeTimers();
          window.speechSynthesis?.cancel();
          eliteStartActiveSet('automatic-rest-signal');
          if(ELITE_EXEC.phase==='active')eliteRestBeat(0);
          return;
        }
        eliteRestBeat(left); renderEliteExecutionOverlay();
      }, 100);
    }

    function eliteArrangeExecutionSections(root) {
      const body = root.querySelector(".di-elite-body");
      const kpis = [...body.querySelectorAll(":scope > .di-elite-kpi")];
      const section = (name) => {
        const el = document.createElement("section");
        el.className = `di-elite-section di-elite-${name}`;
        el.innerHTML = `<h3 id="di-elite-${name}-heading"></h3>`;
        el.setAttribute("aria-labelledby", `di-elite-${name}-heading`);
        return el;
      };
      const plan = section("task");
      const grid = document.createElement("div"); grid.id = "di-elite-task-grid"; grid.className = "di-elite-task-grid";
      plan.append(grid, body.querySelector(".di-elite-focus"));
      const runningBrief=document.createElement('section');runningBrief.id='di-running-brief';runningBrief.hidden=true;runningBrief.setAttribute('aria-label',eliteUi('Завдання і ціль','Task and target'));body.append(runningBrief);
      const current = section("current");
      current.append(body.querySelector(".di-elite-progress"), kpis[0]);
      const controls = section("controls");
      for (const selector of [".di-elite-adjust", "#di-elite-main-btn", "#di-elite-pause-btn", ".di-elite-main-sub", ".di-elite-nav"]) controls.append(body.querySelector(selector));
      eliteInstallStrengthFields(controls);
      const result = section("result");
      const text = document.createElement("div"); text.id = "di-elite-result-text"; text.setAttribute("role", "status"); result.append(text);
      const history = document.createElement("details"); history.className = "di-elite-history";
      history.innerHTML = '<summary id="di-elite-history-heading"></summary>';
      history.append(kpis[1]);
      const table = document.createElement("details"); table.className = "di-elite-plan-details";
      table.innerHTML = '<summary id="di-elite-table-heading"></summary>';
      table.append(body.querySelector(".di-elite-table"));
      const signals = body.querySelector(".di-elite-mini-grid");
      const status = document.createElement("div"); status.id = "di-elite-media-status"; status.className = "di-elite-media-status"; status.hidden = true;
      status.innerHTML = '<span role="status" id="di-elite-media-message"></span><button type="button" id="di-elite-media-retry" hidden></button>';
      status.querySelector("button").addEventListener("click", () => {
        ELITE_MEDIA.key = "";
        const meta = getEliteMeta();
        if (meta) eliteEnsureVideoPlayer(meta.videoId || "", isDrillVideoKey(meta.videoId || ""), true);
      });
      window.addEventListener("message", event => {
        const frame = document.querySelector("#di-elite-video-host iframe");
        if (!ELITE_EXEC.open || !frame || event.source !== frame.contentWindow || event.origin !== location.origin || event.data?.type !== "pac:drill-media") return;
        clearTimeout(ELITE_MEDIA.timeout);
        if (event.data.status === "ready") {
          eliteMediaStatus();const meta=getEliteMeta();
          if(meta?.task?.mode==='running'&&event.data.drillId===drillIdFromExercise(meta.exercise)&&Array.isArray(event.data.playerSeriesTotals)&&event.data.playerSeriesTotals.length&&(!ELITE_RUNNING.live||['ready','finished'].includes(ELITE_RUNNING.live.state))){
            meta.exercise.playerSeriesTotals=window.PACExerciseTask.seriesTotals({playerSeriesTotals:event.data.playerSeriesTotals});meta.frameTaskSummary=true;
            meta.motionEstimates=window.PACExerciseTask.motionEstimates(meta.exercise);meta.task=window.PACExerciseTask.resolve(meta.exercise,meta.task.context);if(ELITE_RUNNING.live?.state==='finished')renderEliteExecutionOverlay();else elitePrepareRunning(meta);
          }
        }
        else if (event.data.status === "error") eliteMediaStatus(eliteUi("Анімація недоступна. Перевір доступ до вправи або повтори завантаження.", "Animation unavailable. Check exercise access or retry."), true);
      });
      body.replaceChildren(status, plan, runningBrief, current, controls, result, history, table, signals);
      const editor = document.createElement("dialog"); editor.id = "di-strength-editor"; editor.className = "di-elite-popup";
      editor.innerHTML = `<header><strong>${eliteUi("Вага та повторення", "Load and reps")}</strong><button type="button" data-editor-close aria-label="Close">×</button></header>`;
      const fields = document.getElementById("di-strength-fields");
      const advanced = document.createElement("details"); advanced.className = "di-strength-advanced";
      advanced.innerHTML = `<summary>${eliteUi("Тест / відомий результат", "Test / known result")}</summary>`;
      for (const selector of ["#di-strength-mode", "#di-strength-test-hint", "#di-strength-reference-summary", "#di-strength-percent-wrap", "#di-strength-known", ".di-strength-actions", "#di-strength-skip-rest"]) {
        const element = fields.querySelector(selector);
        advanced.append(selector === "#di-strength-mode" ? element.closest("label") : element);
      }
      fields.append(advanced); editor.append(fields);
      const apply = document.createElement("button"); apply.id = "di-strength-apply"; apply.type = "button"; apply.className = "di-elite-main-btn";
      apply.textContent = eliteUi("ГОТОВО", "DONE"); editor.append(apply); root.append(editor);
      const closeEditor = () => { editor.close(); editor.dataset.confirm = ""; renderEliteExecutionOverlay(); };
      editor.querySelector("[data-editor-close]").addEventListener("click", closeEditor);
      apply.addEventListener("click", () => {
        if (!eliteSaveStrength()) return;
        const confirm = editor.dataset.confirm === "1";
        if (confirm && (!Number.isInteger(ELITE_STRENGTH.run.pending.reps) || ELITE_STRENGTH.run.pending.reps < 0)) { eliteStrengthError(Error("INVALID_REPS")); return; }
        closeEditor(); if (confirm) eliteCompleteSetAndContinue();
      });
      const tile = document.getElementById("di-elite-load-mid");
      tile.setAttribute("role", "button"); tile.tabIndex = 0;
      tile.setAttribute("aria-label", eliteUi("Змінити вагу та повторення", "Edit load and reps"));
      tile.addEventListener("click", () => eliteOpenStrengthEditor());
      tile.addEventListener("keydown", event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); eliteOpenStrengthEditor(); } });
      const info = document.createElement("dialog"); info.id = "di-elite-info"; info.className = "di-elite-popup";
      info.innerHTML = `<header><strong>${eliteUi("Завдання та результати", "Task and results")}</strong><button type="button" aria-label="Close">×</button></header>`;
      info.append(plan, result, history, table, signals); root.append(info);
      const runningSetup=document.createElement('div');runningSetup.id='di-running-setup';runningSetup.hidden=true;
      runningSetup.innerHTML=`<p id="di-running-gps-state" role="status"></p><button type="button" id="di-running-check-gps" class="di-elite-secondary-btn">${eliteUi("Підключити GPS","Connect GPS")}</button><div class="di-running-chips"><button type="button" data-location="field">${eliteUi('Поле','Field')}</button><button type="button" data-location="route">${eliteUi('Маршрут','Route')}</button></div><div id="di-running-fields"><label>${eliteUi('Збережене поле','Saved field')}<select id="di-running-field"></select></label><div class="di-running-chips"><button type="button" id="di-running-add-field">${eliteUi('Додати поле','Add field')}</button><button type="button" id="di-running-edit-field">${eliteUi('Калібрувати','Calibrate')}</button></div><small>${eliteUi('Налаштуй один раз на цьому пристрої. Можна змінити пізніше. GPS для вибору поля не потрібен.','Set up once on this device. Change later. Choosing a field needs no GPS.')}</small></div><button type="button" id="di-running-timer" hidden class="di-elite-secondary-btn">${eliteUi("Почати без GPS · лише час","Start without GPS · time only")}</button>`;
      runningSetup.querySelector('#di-running-check-gps').onclick=eliteCheckRunningGPS;
      info.insertBefore(runningSetup,plan);
      const routeEstimate=document.createElement('p');routeEstimate.id='di-running-route-estimate';plan.insertBefore(routeEstimate,grid);
      const coachForm=document.createElement('form');coachForm.id='di-running-coach';coachForm.hidden=true;
      const assignment=document.createElement('dialog');assignment.id='di-running-prescription';assignment.className='di-elite-popup';assignment.innerHTML=`<header><strong>${eliteUi('Персональне завдання атлета','Athlete assignment')}</strong><button type="button" aria-label="${eliteUi('Закрити','Close')}">×</button></header>`;assignment.querySelector('button').onclick=()=>assignment.close();root.append(assignment);
      const field=(name,label,min=0)=>`<label>${label}<input name="${name}" type="number" min="${min}" max="86400" step="1" required></label>`;
      coachForm.innerHTML=`<details><summary>${eliteUi('Змінити завдання · тренер','Edit prescription · coach')}</summary><p>${eliteUi('Для вибраного гравця. Час анімації — лише підказка, швидкість реального бігу може відрізнятися.','For the selected player. Animation is only a guide; actual running speed may differ.')}</p><div class="di-running-coach-grid"><label>${eliteUi('Дистанція однієї серії, м','Distance per series, m')}<input name="distanceM" type="number" min="0" max="1000000" step="1"></label>${field('workSec',eliteUi('Робота, с','Work, s'),1)}${field('restSec',eliteUi('Відпочинок / очікування, с','Rest / waiting, s'))}${field('rounds',eliteUi('Кількість серій','Number of series'),1)}<label>${eliteUi('Призначена роль у схемі','Assigned diagram role')}<select name="playerId"></select></label></div><details><summary>${eliteUi('Підготовка й серії','Preparation and series')}</summary><div class="di-running-coach-grid">${field('blocks',eliteUi('Блоків','Blocks'),1)}${field('prepSec',eliteUi('До старту, с','Preparation, s'))}${field('restBetweenSetsSec',eliteUi('Між блоками, с','Between blocks, s'))}</div></details><button type="submit" class="di-elite-main-btn">${eliteUi('ЗБЕРЕГТИ ПЛАН','SAVE PLAN')}</button></details><p id="di-running-coach-status" role="status"></p>`;
      const routeTiming=document.createElement('button');routeTiming.id='di-running-use-route-time';routeTiming.type='button';routeTiming.className='di-running-time-suggestion';routeTiming.textContent=eliteUi('Взяти час руху зі схеми як орієнтир','Use diagram movement as a timing suggestion');routeTiming.onclick=()=>{const p=getEliteMeta()?.task.planned,rows=getEliteMeta()?.motionEstimates||window.PACExerciseTask.motionEstimates(getEliteMeta()?.exercise||{}),row=rows.find(r=>r.playerId===coachForm.elements.playerId.value),seconds=row?.workSec!=null?row.workSec/(row.repetitions||1):p?.routeIntervalSec;if(!seconds)return;coachForm.elements.workSec.value=Math.ceil(seconds);coachForm.elements.restSec.value='';document.getElementById('di-running-coach-status').textContent=eliteUi('Перевір повтори та відпочинок і збережи план. Це орієнтир зі схеми, а не виміряний час бігу.','Review repetitions and rest, then save. This is a diagram estimate, not measured running time.');};coachForm.querySelector('.di-running-coach-grid').before(routeTiming);
      const recovery=document.createElement('details');recovery.className='di-running-recovery';recovery.innerHTML=`<summary>${eliteUi('Орієнтири відпочинку','Recovery guide')}</summary><p>${eliteUi('HIIT: орієнтир 1:1 або довше. Короткі прискорення: 1–2 хв. Максимальна швидкість: 3–5 хв. Обери за метою й готовністю атлета.','HIIT: approximately 1:1 or longer. Short accelerations: 1–2 min. Maximum speed: 3–5 min. Choose for the goal and athlete readiness.')}</p><button type="button" data-rest-factor="1">1:1</button> <button type="button" data-rest-factor="2">1:2</button><p><a href="https://www.acsm.org/docs/default-source/files-for-resource-library/high-intensity-interval-training.pdf" target="_blank" rel="noopener">ACSM</a> · <a href="https://dxpprod.nsca.com/globalassets/education/nsca-coach/nsca-coach-5.4.pdf" target="_blank" rel="noopener">NSCA</a></p>`;recovery.querySelectorAll('[data-rest-factor]').forEach(button=>button.onclick=()=>{const work=Number(coachForm.elements.workSec.value);if(work>0)coachForm.elements.restSec.value=Math.round(work*Number(button.dataset.restFactor));});coachForm.querySelector('button[type=submit]').before(recovery);
      coachForm.addEventListener('submit',eliteSaveCoachRunning);assignment.append(coachForm);const roleField=coachForm.elements.playerId.closest('label');coachForm.querySelector('.di-running-coach-grid').prepend(roleField);coachForm.elements.playerId.onchange=()=>{const row=(getEliteMeta()?.motionEstimates||window.PACExerciseTask.motionEstimates(getEliteMeta()?.exercise||{})).find(row=>row.playerId===coachForm.elements.playerId.value);coachForm.elements.distanceM.value=row?.distanceM!=null?row.distanceM/(row.repetitions||1):'';};
      const replayButton=document.createElement('button');replayButton.type='button';replayButton.id='di-running-replay';replayButton.className='di-elite-secondary-btn';replayButton.textContent=eliteUi('Переглянути GPS на полі','View GPS field replay');replayButton.onclick=()=>window.PACDailyRunning.replay();result.append(replayButton);
      const newRun=document.createElement('button');newRun.id='di-running-new';newRun.type='button';newRun.className='di-elite-secondary-btn';newRun.textContent=eliteUi("Новий запуск цього завдання","New attempt of this task");result.append(newRun);
      newRun.addEventListener('click',async()=>{try{const meta=getEliteMeta();if(!meta.task.ready){document.getElementById('di-running-result').close();if(canEditRunningPlan()){eliteOpenRunningPrescription();}return;}ELITE_RUNNING.gpsFailed=false;await window.PACDailyRunning.fresh(meta.task);ELITE_RUNNING.error='';document.getElementById('di-running-result').close();}catch{ELITE_RUNNING.error=eliteUi("Попередній результат ще не збережено.","Previous result not saved yet.");}renderEliteExecutionOverlay();});

      controls.append(document.getElementById('di-running-timer'));
      const setupAction=fn=>{try{fn();ELITE_RUNNING.error='';}catch(error){ELITE_RUNNING.error=eliteUi('Не вдалося змінити налаштування. Заверши поточний запуск або перевір збереження поля.','Unable to change setup. Finish the current attempt or check field storage.');}renderEliteExecutionOverlay();};
      document.getElementById('di-running-timer').onclick=()=>setupAction(()=>{window.PACDailyRunning.timerOnly();window.PACDailyRunning.start();document.getElementById('di-elite-info').close();});
      runningSetup.querySelectorAll('[data-location]').forEach(button=>button.onclick=()=>setupAction(()=>window.PACDailyRunning.configureField(button.dataset.location)));
      runningSetup.querySelector('#di-running-field').onchange=event=>setupAction(()=>window.PACDailyRunning.configureField('field',event.target.value));
      runningSetup.querySelector('#di-running-add-field').onclick=()=>setupAction(()=>window.PACDailyRunning.editField(false));
      runningSetup.querySelector('#di-running-edit-field').onclick=()=>setupAction(()=>window.PACDailyRunning.editField(true));
      info.querySelector("header button").addEventListener("click", () => info.close());
      const infoButton = document.createElement("button"); infoButton.type = "button"; infoButton.className = "di-elite-info-btn";
      infoButton.textContent = eliteUi("Деталі", "Details"); infoButton.addEventListener("click", () => {if(getEliteMeta()?.task.mode==='running')eliteRunningPanel('setup');info.showModal();}); current.querySelector("h3").append(document.createTextNode(""), infoButton);
      const runResult=document.createElement('dialog');runResult.id='di-running-result';runResult.className='di-elite-popup';runResult.innerHTML=`<header><strong>${eliteUi('Підсумок тренування','Workout summary')}</strong><button type="button" aria-label="${eliteUi('Закрити','Close')}">×</button></header>`;runResult.querySelector('button').onclick=()=>runResult.close();root.append(runResult);
      root.querySelector(".di-elite-panel").setAttribute("role", "dialog");
      root.querySelector(".di-elite-panel").setAttribute("aria-modal", "true");
      root.querySelector(".di-elite-panel").setAttribute("aria-labelledby", "di-elite-title");
    }

    function eliteOpenStrengthEditor(confirm = false) {
      if (!eliteHasStrengthRun()) return;
      const dialog = document.getElementById("di-strength-editor"); dialog.dataset.confirm = confirm ? "1" : "";
      if (!dialog.open) dialog.showModal();
      document.getElementById(confirm ? "di-strength-reps" : "di-strength-load").focus();
    }

    function eliteRenderTaskLayout(meta) {
      const running = meta.task?.mode === "running";
      document.getElementById('di-running-replay').hidden=!running;
      const p = meta.task?.planned || {};const shownDistance=p.distancePerSeriesM??p.distanceM;
      const clock = v => v == null ? "—" : formatDurationClock(v);
      document.querySelector('.di-elite-info-btn').textContent=running?eliteUi('GPS · Поле','GPS · Field'):eliteUi('Деталі','Details');
      document.querySelector('#di-elite-info .di-elite-mini-grid').hidden=running;
      const info=document.getElementById('di-elite-info'),summary=document.getElementById('di-running-result'),result=document.getElementById('di-elite-result-text').closest('.di-elite-result');
      if(running&&result.parentElement!==summary)summary.append(result);else if(!running&&result.parentElement!==info)info.append(result);
      info.querySelector('header strong').textContent=running?eliteUi('GPS та поле','GPS and field'):eliteUi('Завдання та результати','Task and results');
      const coachForm=document.getElementById('di-running-coach'),coachHost=document.getElementById('di-running-prescription');if(coachForm.parentElement!==coachHost)coachHost.append(coachForm);
      const brief=document.getElementById('di-running-brief');brief.hidden=!running;if(!running)document.getElementById('di-running-timer').hidden=true;
      if(running){const rows=meta.motionEstimates||window.PACExerciseTask.motionEstimates(meta.exercise.playerSeriesTotals?meta.exercise:meta.exercise.tacticalDrill||{}),player=rows.find(row=>row.playerId===p.playerId);brief.innerHTML=`<div class="di-running-goal-label">${eliteUi('ТВОЄ ЗАВДАННЯ','YOUR TASK')}</div><strong>${shownDistance==null?(rows.length>1&&!p.playerId?eliteUi('Групова вправа','Group drill'):eliteUi('Метри зі схеми не передані','Diagram distance unavailable')):escapeHtml(shownDistance===0?'0 m':formatMetersSmart(shownDistance))}${p.distancePerSeriesM!=null?` <small>${eliteUi('на серію','per series')}</small>`:''}</strong><span>${player?`${eliteUi('Твоя роль: №','Your role: #')}${escapeHtml(player.name)} · `:''}${p.routeWorkSec!=null&&!(p.distanceSource==='coach'&&p.distancePerSeriesM!==p.diagramDistanceM/(p.routeRepetitions||1))?`${eliteUi('За стрілками ≈','Authored pace ≈')} ${clock(p.routeIntervalSec)} · ${eliteUi('перегляд 2×','preview 2×')}`:''}</span>${`<span>${eliteUi('Серії','Series')}: ${p.sets??'—'} × ${p.workIsEstimate?'≈ ':''}${clock(p.workSec)} · ${eliteUi('відпочинок','rest')} ${clock(p.restSec)}</span>`}`;}
      if(running){const sum=document.createElement('span');sum.className='di-running-total';sum.textContent=eliteUi('Разом: ','Total: ')+(p.totalDistanceM!=null?formatMetersSmart(p.totalDistanceM)+' · ':'')+(p.totalDurationSec!=null?'≈ '+clock(p.totalDurationSec):'')+(p.prepSec>0?eliteUi(' з підготовкою й паузами',' including preparation and rests'):eliteUi(' з паузами',' including rests'));brief.append(sum);}
      if(running&&canEditRunningPlan()){const edit=document.createElement('button');edit.type='button';edit.id='di-running-edit-plan';edit.className='di-running-time-suggestion';edit.textContent=eliteUi('Налаштувати завдання атлета','Assign athlete task');edit.onclick=eliteOpenRunningPrescription;brief.append(edit);}
      if(running&&p.distanceSource==='coach'&&p.distanceM!==p.diagramDistanceM){const note=document.createElement('span');note.textContent=eliteUi('Персональна дистанція тренера','Personal coach distance');brief.append(note);}
      if(running&&p.routeByLoad&&!(p.distanceSource==='coach'&&p.distanceM!==p.diagramDistanceM)){const bands=[];for(const [key,label] of [['hspd','HSPD'],['sprint','SPR'],['acceleration','ACC'],['run','RUN']])if(p.routeByLoad[key]>0)bands.push(label+' '+formatMetersSmart(p.routeByLoad[key]/(p.routeRepetitions||1)));if(p.routeActionCounts?.deceleration>0)bands.push('DCC ×'+p.routeActionCounts.deceleration);if(bands.length){const detail=document.createElement('span');detail.className='di-running-bands';detail.textContent=bands.join(' · ');brief.append(detail);}}
      if(!running){document.querySelector('#di-elite-info .di-elite-task').hidden=false;document.querySelector('#di-elite-info .di-elite-result').hidden=false;}
      const value = (v, suffix = "") => v == null ? "—" : `${v}${suffix}`;

      const rows = running ? [
        [eliteUi("Інтервали", "Intervals"), value(p.sets)],
        [eliteUi("Робота", "Work"), clock(p.workSec)],
        [eliteUi("Відпочинок", "Rest"), clock(p.restSec)],
        [eliteUi("Дистанція за планом", "Planned distance"), p.distanceM == null ? "—" : formatMetersSmart(p.distanceM)],
        [eliteUi("Цільовий темп", "Target pace"), p.runningTarget?.paceSecPerKm ? `${clock(p.runningTarget.paceSecPerKm)} / km` : "—"],
        [eliteUi("Сигнал за планом", "Planned time cue"), clock(p.cueEverySec)],
        ...(p.blocks > 1 ? [[eliteUi("Серії × інтервали", "Series × intervals"), `${p.blocks} × ${p.rounds}`], [eliteUi("Між серіями", "Between series"), clock(p.restBetweenSetsSec)]] : [])
      ] : [
        [eliteUi("Підходи", "Sets"), value(p.sets)],
        [p.workSec != null && p.reps == null ? eliteUi("Час роботи", "Work duration") : eliteUi("Повторення", "Reps"), p.reps != null ? value(p.reps) : clock(p.workSec)],
        [eliteUi("Вага за планом", "Planned load"), value(p.loadKg, " kg")],
        [eliteUi("Відпочинок", "Rest"), clock(p.restSec)]
      ];
      document.getElementById("di-elite-task-grid").innerHTML = rows.map(([label, v]) => `<div class="di-elite-box"><div class="di-elite-k">${escapeHtml(label)}</div><div class="di-elite-v">${escapeHtml(v)}</div></div>`).join("");
      const labels = { task: eliteUi("Завдання", "Task"), current: eliteUi("Виконання", "Execution"), controls: eliteUi("Керування", "Controls"),
        result: eliteUi("Стан виконання", "Execution status"), history: eliteUi("Минулий раз і найкращий результат", "Previous and best result"), table: eliteUi("План підходів", "Set plan") };
      for (const [name, label] of Object.entries(labels)) {
        const heading = document.getElementById(`di-elite-${name}-heading`);
        if (name === "current") heading.firstChild.textContent = label; else heading.textContent = label;
      }
      document.querySelector("#di-elite-overlay .di-elite-history").hidden = running;
      document.querySelector("#di-elite-overlay .di-elite-plan-details").hidden = running;
      document.getElementById("di-elite-result-text").textContent = ELITE_EXEC.phase === "complete"
        ? eliteUi("Вправу завершено.", "Exercise completed.")
        : ELITE_EXEC.phase === "idle" ? eliteUi("Готово до початку. Переглянь завдання й увімкни звук за потреби.", "Ready to start. Review the task and enable sound if needed.")
        : ELITE_EXEC.paused ? eliteUi("На паузі.", "Paused.") : eliteUi("Виконання триває.", "Exercise in progress.");
    }

    function ensureEliteExecutionOverlay() {
      let root = document.getElementById("di-elite-overlay");
      if (root) return root;

      const style = document.createElement("style");
      style.id = "di-elite-style";
      style.textContent = `
        #di-elite-overlay{position:fixed;inset:0;z-index:100500;display:none}
        #di-elite-overlay *{box-sizing:border-box}
        #di-elite-overlay .di-elite-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.86)}
        #di-elite-overlay .di-elite-shell{position:relative;height:100%;display:flex;justify-content:center;align-items:center;padding:8px}
        #di-elite-overlay .di-elite-panel{width:min(560px,100%);height:min(96vh,980px);background:radial-gradient(circle at 50% -10%,#1e1a10 0%,#0b0b0b 32%,#060606 100%);border:1px solid #252525;border-radius:20px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 28px 60px rgba(0,0,0,.55)}
        #di-elite-overlay .di-elite-top{display:flex;justify-content:space-between;align-items:center;padding:10px 12px}
        #di-elite-overlay .di-elite-x{border:1px solid #2a2a2a;background:#0c0c0c;color:#eee;width:34px;height:34px;border-radius:999px;cursor:pointer;font-size:1rem;line-height:1}
        #di-elite-overlay .di-elite-top-mid{text-align:center;flex:1}
        #di-elite-overlay .di-elite-mini{color:#d4af37;font-weight:900;font-size:.66rem;letter-spacing:.7px}
        #di-elite-overlay .di-elite-title{color:#f2f2f2;font-weight:900;font-size:1.7rem;line-height:1.1;margin-top:2px}
        #di-elite-overlay .di-elite-voice{border:1px solid #2f2f2f;background:#101010;color:#d4af37;padding:7px 10px;border-radius:999px;font-weight:900;font-size:.62rem;cursor:pointer}
        #di-elite-overlay .di-elite-video{position:relative;width:100%;aspect-ratio:16/9;background:#000;overflow:hidden;flex:0 0 auto}
        #di-elite-overlay .di-elite-video:has(iframe[src*="drill-player.html"]){aspect-ratio:3/2;height:auto;border-top:1px solid rgba(212,175,55,.22);border-bottom:1px solid rgba(212,175,55,.22)}
        #di-elite-overlay .di-elite-video-host{position:absolute;left:-10%;top:-14%;width:120%;height:128%;border:0;pointer-events:none;z-index:1}
        #di-elite-overlay .di-elite-video-cover{position:absolute;inset:0;display:none;align-items:center;justify-content:center;background:linear-gradient(180deg,rgba(0,0,0,.34),rgba(0,0,0,.62));z-index:10;cursor:pointer}
        #di-elite-overlay .di-elite-video-cover.is-visible{display:flex}
        #di-elite-overlay .di-elite-play{width:76px;height:76px;border-radius:999px;background:#d4af37;border:1px solid rgba(255,255,255,.16);box-shadow:0 0 28px rgba(212,175,55,.44);display:flex;align-items:center;justify-content:center}
        #di-elite-overlay .di-elite-play:before{content:"";width:0;height:0;border-top:15px solid transparent;border-bottom:15px solid transparent;border-left:22px solid #070707;margin-left:6px}
        #di-elite-overlay .di-elite-video-host iframe{width:100% !important;height:100% !important;border:0 !important;pointer-events:none}
        #di-elite-overlay .di-elite-video-host:has(iframe[src*="drill-player.html"]){left:0;top:0;width:100%;height:100%;pointer-events:auto}
        #di-elite-overlay .di-elite-video-host iframe[src*="drill-player.html"]{pointer-events:auto}
        #di-elite-overlay .di-elite-mask-top{position:absolute;left:0;right:0;top:0;height:22%;pointer-events:none;background:linear-gradient(to bottom,rgba(0,0,0,.72),rgba(0,0,0,0))}
        #di-elite-overlay .di-elite-mask-br{position:absolute;right:0;bottom:0;width:26%;height:24%;pointer-events:none;background:linear-gradient(135deg,rgba(0,0,0,0),rgba(0,0,0,.9))}
        #di-elite-overlay .di-elite-logo-end{position:absolute;inset:0;display:none;align-items:center;justify-content:center;background:#000;z-index:12;cursor:pointer}
        #di-elite-overlay .di-elite-logo-end img{width:76px;filter:drop-shadow(0 0 10px #d4af37)}
        #di-elite-overlay .di-elite-focus{background:rgba(11,11,11,.88);border:1px solid #3a3a3a;border-radius:12px;padding:10px 12px}
        #di-elite-overlay .di-elite-focus .k{color:#d4af37;font-size:.62rem;font-weight:900;letter-spacing:.6px;text-transform:uppercase}
        #di-elite-overlay .di-elite-focus .v{color:#f1f1f1;font-size:1rem;font-weight:700;line-height:1.25;margin-top:3px}
        #di-elite-overlay .di-elite-body{padding:11px 12px 12px;display:flex;flex-direction:column;gap:10px;overflow:auto;min-height:0;flex:1}
        #di-elite-overlay .di-elite-progress{display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:6px}
        #di-elite-overlay .di-elite-pr{height:4px;border-radius:999px;background:#262626}
        #di-elite-overlay .di-elite-pr.current,#di-elite-overlay .di-elite-pr.done{background:#d4af37}
        #di-elite-overlay .di-elite-kpi{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
        #di-elite-overlay .di-elite-box{background:#0f0f0f;border:1px solid #242424;border-radius:12px;padding:9px 10px}
        #di-elite-overlay .di-elite-k{color:#808080;font-size:.58rem;font-weight:800;letter-spacing:.5px;text-transform:uppercase}
        #di-elite-overlay .di-elite-v{color:#f7f7f7;font-size:1.02rem;font-weight:900;line-height:1.2;margin-top:3px}
        #di-elite-overlay .di-elite-v.big{font-size:2.05rem}
        #di-elite-overlay .di-elite-v.load-text{font-size:1.28rem;line-height:1.25;word-break:break-word}
        #di-elite-overlay .di-elite-sub{color:#9a9a9a;font-size:.72rem;margin-top:2px}
        #di-elite-overlay .di-elite-load{border-color:#6f5a1b;box-shadow:0 0 0 1px rgba(212,175,55,.22) inset}
        #di-elite-overlay .di-elite-adjust{display:grid;grid-template-columns:1fr 1.8fr 1fr;gap:7px;align-items:stretch}
        #di-elite-overlay .di-elite-adjust button{background:#0f0f0f;border:1px solid #2c2c2c;border-radius:10px;color:#e8e8e8;padding:9px 0;font-weight:900;font-size:1.18rem;cursor:pointer}
        #di-elite-overlay .di-elite-adjust button.main{background:#d4af37;color:#0b0b0b;border-color:#d4af37}
        #di-elite-overlay .di-elite-load-mid{background:#111;border:1px solid #3a2e08;border-radius:10px;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:7px 8px}
        #di-elite-overlay .di-elite-load-mid .v{color:#fff;font-size:1.26rem;font-weight:900;line-height:1.1}
        #di-elite-overlay .di-elite-load-mid .s{color:#a8a8a8;font-size:.72rem;line-height:1.1;margin-top:2px}
        #di-elite-overlay .di-elite-load-mid.body{border-color:#2f2f2f}
        #di-elite-overlay .di-elite-main-btn{width:100%;border:0;border-radius:12px;background:#d4af37;color:#0c0c0c;font-size:1.06rem;font-weight:900;letter-spacing:.45px;padding:14px 12px;cursor:pointer}
        #di-elite-overlay .di-elite-main-btn:disabled{opacity:.55;cursor:not-allowed}
        #di-elite-overlay .di-elite-secondary-btn{width:100%;border:1px solid #2b2b2b;border-radius:11px;background:#101010;color:#e8e8e8;font-size:.88rem;font-weight:900;letter-spacing:.35px;padding:9px 10px;cursor:pointer}
        #di-elite-overlay .di-elite-secondary-btn:disabled{opacity:.45;cursor:not-allowed}
        #di-elite-overlay .di-elite-nav{display:grid;grid-template-columns:1fr 1fr;gap:7px}
        #di-elite-overlay .di-elite-main-sub{text-align:center;color:#a0a0a0;font-size:.76rem;margin-top:-5px}
        #di-elite-overlay .di-elite-mini-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
        #di-elite-overlay .di-elite-mini-grid .di-elite-v{font-size:1.22rem}
        #di-elite-overlay .di-elite-table{background:#0c0c0c;border:1px solid #1f1f1f;border-radius:12px;overflow:hidden}
        #di-elite-overlay .di-elite-head{display:flex;justify-content:space-between;align-items:center;padding:10px 10px;border-bottom:1px solid #1f1f1f}
        #di-elite-overlay .di-elite-head .k{color:#7f7f7f;font-size:.62rem;font-weight:900;letter-spacing:.55px}
        #di-elite-overlay .di-elite-autoreg{display:flex;align-items:center;gap:8px;color:#d4af37;font-size:.62rem;font-weight:800}
        #di-elite-overlay table{width:100%;border-collapse:collapse}
        #di-elite-overlay td{padding:8px 10px;border-top:1px solid #171717;color:#c8c8c8;font-size:.8rem}
        #di-elite-overlay tr.current td{color:#ffd763;background:rgba(212,175,55,.07)}
        #di-elite-overlay td:nth-child(1){width:28px;color:#9e9e9e}
        #di-elite-overlay td:nth-child(2){font-weight:700}
        #di-elite-overlay td:nth-child(3),#di-elite-overlay td:nth-child(4){text-align:right}
        #di-elite-overlay.is-running-drill .di-elite-panel{width:min(760px,100%)}
        #di-elite-overlay.is-running-drill .di-elite-video:has(iframe[src*="drill-player.html"]){aspect-ratio:3/2;height:auto}
        #di-elite-overlay.is-running-drill .di-elite-adjust,
        #di-elite-overlay.is-running-drill .di-elite-table,
        #di-elite-overlay.is-running-drill .di-elite-mini-grid{display:none}
        #di-elite-overlay.is-running-drill .di-elite-body{gap:8px}
        @media (max-width:560px){
          #di-elite-overlay .di-elite-shell{padding:0}
          #di-elite-overlay .di-elite-panel{height:100vh;max-height:none;border-radius:0}
          #di-elite-overlay .di-elite-top{padding:8px 10px}
          #di-elite-overlay .di-elite-title{font-size:1.42rem}
          #di-elite-overlay .di-elite-video:has(iframe[src*="drill-player.html"]){aspect-ratio:3/2;height:auto}
          #di-elite-overlay.is-running-drill .di-elite-video:has(iframe[src*="drill-player.html"]){aspect-ratio:3/2;height:auto}
          #di-elite-overlay .di-elite-kpi,#di-elite-overlay .di-elite-mini-grid{gap:6px}
        }
        #di-elite-overlay .di-elite-panel{height:min(96dvh,980px)}
        #di-elite-overlay .di-elite-top-mid{min-width:0;padding:0 10px}
        #di-elite-overlay .di-elite-title{font-size:clamp(1.1rem,3.5vw,1.5rem);overflow-wrap:anywhere}
        #di-elite-overlay .di-elite-body{padding:14px;gap:16px;overscroll-behavior:contain}
        #di-elite-overlay .di-elite-section{min-width:0;display:grid;gap:9px}
        #di-elite-overlay .di-elite-section h3{margin:0;color:#d4af37;font-size:.72rem;letter-spacing:.06em;text-transform:uppercase}
        #di-elite-overlay .di-elite-task-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
        #di-elite-overlay .di-elite-task-grid .di-elite-box{min-width:0}
        #di-elite-overlay .di-elite-k{font-size:.65rem;color:#aaa;line-height:1.4}
        #di-elite-overlay .di-elite-v,#di-elite-overlay .di-elite-sub{overflow-wrap:anywhere}
        #di-elite-overlay .di-elite-progress{grid-template-columns:repeat(auto-fit,minmax(8px,1fr))}
        #di-elite-overlay .di-elite-controls{padding:12px;background:#14120c;border:1px solid #44391c;border-radius:14px}
        #di-elite-overlay button{min-height:44px;touch-action:manipulation}
        #di-elite-overlay button:focus-visible,#di-elite-overlay summary:focus-visible{outline:2px solid #ffd763;outline-offset:3px}
        #di-elite-overlay .di-elite-history summary,#di-elite-overlay .di-elite-plan-details summary{cursor:pointer;color:#ddd;font-size:.85rem;padding:10px 0}
        #di-elite-overlay .di-elite-result{border-top:1px solid #2a2a2a;padding-top:12px;color:#bbb;font-size:.84rem;line-height:1.5}
        #di-elite-overlay .di-elite-media-status{font-size:.78rem;line-height:1.5;color:#bbb;display:flex;align-items:center;gap:10px}
        #di-elite-overlay .di-elite-media-status[hidden]{display:none}
        #di-elite-overlay .di-elite-media-status button{flex:none;border:1px solid #555;border-radius:8px;background:#191919;color:#eee;padding:6px 10px}
        #di-elite-overlay .di-elite-video-host:has(video){left:0;top:0;width:100%;height:100%;pointer-events:auto}
        #di-elite-overlay .di-elite-video-host video{width:100%;height:100%;object-fit:contain;background:#000}
        #di-elite-overlay .di-elite-mini-grid{display:none}
        #di-elite-overlay [hidden]{display:none!important}
        #di-elite-overlay .di-strength-fields{display:grid;gap:10px;min-width:0}
        #di-elite-overlay .di-strength-fields label{display:grid;gap:5px;min-width:0;color:#ccc;font-size:.78rem;line-height:1.4}
        #di-elite-overlay .di-strength-fields input,#di-elite-overlay .di-strength-fields select{width:100%;min-width:0;min-height:44px;padding:9px;background:#080808;color:#fff;border:1px solid #665529;border-radius:8px;font:inherit;font-size:1rem}
        #di-elite-overlay .di-strength-inputs,#di-elite-overlay .di-strength-actions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
        #di-elite-overlay .di-strength-fields p,#di-elite-overlay .di-strength-fields small{margin:0;color:#aaa;line-height:1.5;font-size:.76rem}
        #di-elite-overlay #di-strength-message{color:#d4af37;font-size:.76rem;line-height:1.4}
        #di-elite-overlay .di-elite-result th{color:#aaa;font-size:.7rem;text-align:left;padding:8px}
        #di-elite-overlay .di-elite-result td{font-variant-numeric:tabular-nums}
        @media(min-width:700px){#di-elite-overlay.is-running-drill .di-elite-task-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
        @media(max-width:560px){#di-elite-overlay .di-elite-panel{height:100dvh}#di-elite-overlay .di-elite-body{padding:12px}}
        @media(max-height:520px) and (orientation:landscape){#di-elite-overlay .di-elite-panel{overflow:auto}#di-elite-overlay .di-elite-body{flex:none;overflow:visible}#di-elite-overlay .di-elite-video{max-height:45vh}}
        `;
      document.head.appendChild(style);
      const compactStyle = document.createElement("link"); compactStyle.rel = "stylesheet";
      compactStyle.href = "../css/daily-execution.css?v=20261104-phone-test-v1"; document.head.append(compactStyle);

      root = document.createElement("div");
      root.id = "di-elite-overlay";
      root.innerHTML = `
        <div class="di-elite-backdrop" data-close="1"></div>
        <div class="di-elite-shell">
          <div class="di-elite-panel">
            <div class="di-elite-top">
              <button class="di-elite-x" type="button" data-close="1">‹</button>
              <div class="di-elite-top-mid">
                <div class="di-elite-mini" id="di-elite-role-top">TOP SET</div>
                <div class="di-elite-title" id="di-elite-title"></div>
              </div>
              <button class="di-elite-voice" type="button" id="di-elite-voice-btn">VOICE</button>
            </div>
            <div class="di-elite-video">
              <div id="di-elite-video-host" class="di-elite-video-host"></div>
              <div class="di-elite-mask-top"></div>
              <div class="di-elite-mask-br"></div>
              <div id="di-elite-video-cover" class="di-elite-video-cover" aria-label="Start video" role="button" tabindex="0">
                <div class="di-elite-play"></div>
              </div>
              <div id="di-elite-logo-end" class="di-elite-logo-end">
                <img src="../assets/images/AK_logo.png" alt="AK">
              </div>
            </div>
            <div class="di-elite-body">
              <div class="di-elite-focus">
                <div class="k">${ti("eliteFocus")}</div>
                <div class="v" id="di-elite-focus"></div>
              </div>
              <div class="di-elite-progress" id="di-elite-progress"></div>
              <div class="di-elite-kpi">
                <div class="di-elite-box"><div class="di-elite-k" id="di-elite-set-k">${ti("eliteSet")}</div><div class="di-elite-v" id="di-elite-set"></div></div>
                <div class="di-elite-box"><div class="di-elite-k" id="di-elite-target-k">${ti("eliteTarget")}</div><div class="di-elite-v" id="di-elite-target"></div></div>
                <div class="di-elite-box"><div class="di-elite-k" id="di-elite-rest-k">${ti("eliteRestAfter")}</div><div class="di-elite-v" id="di-elite-rest-after"></div></div>
              </div>
              <div class="di-elite-kpi">
                <div class="di-elite-box"><div class="di-elite-k" id="di-elite-last-k">${ti("eliteLastTime")}</div><div class="di-elite-v" id="di-elite-last"></div><div class="di-elite-sub" id="di-elite-last-date"></div></div>
                <div class="di-elite-box"><div class="di-elite-k" id="di-elite-best-k">${ti("eliteBest")}</div><div class="di-elite-v" id="di-elite-best"></div><div class="di-elite-sub" id="di-elite-e1rm"></div></div>
                <div class="di-elite-box di-elite-load"><div class="di-elite-k" id="di-elite-load-k">${ti("eliteTodayLoad")}</div><div class="di-elite-v" id="di-elite-load"></div><div class="di-elite-sub" id="di-elite-range"></div></div>
              </div>
              <div class="di-elite-adjust">
                <button type="button" data-delta="-5">-5</button>
                <div class="di-elite-load-mid" id="di-elite-load-mid"></div>
                <button class="main" type="button" data-delta="5">+5</button>
              </div>
              <button class="di-elite-main-btn" type="button" id="di-elite-main-btn"></button>
              <button class="di-elite-secondary-btn" type="button" id="di-elite-pause-btn"></button>
              <div class="di-elite-main-sub" id="di-elite-main-sub"></div>
              <div class="di-elite-nav">
                <button class="di-elite-secondary-btn" type="button" id="di-elite-prev-btn"></button>
                <button class="di-elite-secondary-btn" type="button" id="di-elite-next-btn"></button>
              </div>
              <div class="di-elite-mini-grid">
                <div class="di-elite-box"><div class="di-elite-k">${ti("eliteReadiness")}</div><div class="di-elite-v" id="di-elite-readiness"></div><div class="di-elite-sub" id="di-elite-readiness-label"></div></div>
                <div class="di-elite-box"><div class="di-elite-k">${ti("eliteFatigue")}</div><div class="di-elite-v" id="di-elite-fatigue"></div><div class="di-elite-sub" id="di-elite-acwr"></div></div>
                <div class="di-elite-box"><div class="di-elite-k">${ti("eliteHydration")}</div><div class="di-elite-v" id="di-elite-hydration"></div><div class="di-elite-sub">${ti("eliteOnTrack")}</div></div>
              </div>
              <div class="di-elite-table">
                <div class="di-elite-head">
                  <div class="k">${ti("elitePlannedSets")}</div>
                  <label class="di-elite-autoreg"><span>${ti("eliteAutoreg")}</span><input id="di-elite-autoreg" type="checkbox" checked></label>
                </div>
                <table><tbody id="di-elite-rows"></tbody></table>
              </div>
            </div>
          </div>
        </div>`;
      document.body.appendChild(root);
      eliteArrangeExecutionSections(root);

      root.querySelectorAll("[data-close='1']").forEach((el) => el.addEventListener("click", () => closeEliteExecutionMode()));

      const voiceBtn = document.getElementById("di-elite-voice-btn");
      if (voiceBtn) {
        voiceBtn.addEventListener("click", () => {
          if(getEliteMeta()?.task?.mode!=='running')elitePrepareRestAudio();
          ELITE_EXEC.voiceMuted = !ELITE_EXEC.voiceMuted;
          if (ELITE_EXEC.voiceMuted) {
            window.speechSynthesis?.cancel();
            for (const node of ELITE_REST_AUDIO.nodes) { try { node.stop(); } catch {} }
            ELITE_REST_AUDIO.nodes.clear();
          }
          try { localStorage.setItem("pac_di_elite_voice_muted", ELITE_EXEC.voiceMuted ? "1" : "0"); } catch {}
          if(getEliteMeta()?.task?.mode==='running')window.PACDailyRunning.sound(!ELITE_EXEC.voiceMuted,!ELITE_EXEC.voiceMuted);
          if(!ELITE_EXEC.voiceMuted&&ELITE_EXEC.phase==='idle')eliteAnnounceExerciseName(getEliteMeta());
          renderEliteExecutionOverlay();
        });
      }

      root.querySelectorAll("[data-delta]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const delta = Number(btn.getAttribute("data-delta") || 0);
          const meta = getEliteMeta();
          if (!meta) return;
          if (ELITE_EXEC.currentLoadKg == null && !eliteHasStrengthRun(meta)) return;
          ELITE_EXEC.currentLoadKg = Math.round(Math.max(0, Number(ELITE_EXEC.currentLoadKg || 0) + delta) * 100) / 100;
          if (eliteHasStrengthRun(meta)) { ELITE_STRENGTH.run.pending.loadKg = ELITE_EXEC.currentLoadKg; eliteSaveStrength(); }
          renderEliteExecutionOverlay();
        });
      });

      const mainBtn = document.getElementById("di-elite-main-btn");
      const pauseBtn = document.getElementById("di-elite-pause-btn");
      const prevBtn = document.getElementById("di-elite-prev-btn");
      const nextBtn = document.getElementById("di-elite-next-btn");
      if (mainBtn) {
        mainBtn.addEventListener("click", () => {
          if(getEliteMeta()?.task?.mode==='running'){eliteRunningAction();return;}
          elitePrepareRestAudio();
          if (ELITE_EXEC.phase === "idle") eliteStartPreset();
          else if (ELITE_EXEC.phase === "preset") eliteStartActiveSet();
          else if (ELITE_EXEC.phase === "active") {
            const m = getEliteMeta();
            if (m?.prescription?.repsUnit !== "sec") {
              if (eliteHasStrengthRun(m) && ELITE_STRENGTH.run.pending.reps == null) {
                const target = ELITE_STRENGTH.run.targets[ELITE_STRENGTH.run.index - 1];
                if (!(target > 0)) { eliteOpenStrengthEditor(true); return; }
                ELITE_STRENGTH.run.pending.reps = target;
                ELITE_STRENGTH.run.pending.repsSource = "confirmed-plan";
              }
              eliteCompleteSetAndContinue();
            }
          } else if (ELITE_EXEC.phase === "complete") {
            if (eliteHasStrengthRun() && ELITE_STRENGTH.run.mode === "test3") { eliteOpenStrength(getEliteMeta(), "workout", true); renderEliteExecutionOverlay(); }
            else eliteGoNextExercise();
          }
        });
      }
      if (pauseBtn) {
        pauseBtn.addEventListener("click", () => {
          if(getEliteMeta()?.task?.mode==='running'){
            if(ELITE_RUNNING.live?.state==='paused')window.PACDailyRunning.resume();else window.PACDailyRunning.pause();
          }else eliteTogglePause();
        });
      }
      if (prevBtn) {
        prevBtn.addEventListener("click", () => eliteGoPrevExercise());
      }
      if (nextBtn) {
        nextBtn.addEventListener("click", () => eliteGoNextExerciseManual());
      }
      const logoEnd = document.getElementById("di-elite-logo-end");
      if (logoEnd) {
        logoEnd.addEventListener("click", () => eliteReplayVideo());
      }
      const videoCover = document.getElementById("di-elite-video-cover");
      if (videoCover) {
        const startFromCover = () => {
          if (!ELITE_EXEC.open) return;
          if(getEliteMeta()?.task?.mode==='running'){eliteRunningAction();return;}
          if (ELITE_EXEC.phase === "idle") eliteStartPreset();
        };
        videoCover.addEventListener("click", startFromCover);
        videoCover.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            startFromCover();
          }
        });
      }
      return root;
    }

    function eliteShowVideoCover(show) {
      const cover = document.getElementById("di-elite-video-cover");
      if (!cover) return;
      cover.classList.toggle("is-visible", Boolean(show));
    }

    function eliteShowVideoEndLogo(show) {
      const logoEnd = document.getElementById("di-elite-logo-end");
      if (!logoEnd) return;
      logoEnd.style.display = show ? "flex" : "none";
    }

    function eliteReplayVideo() {
      eliteShowVideoEndLogo(false);
      const direct = document.querySelector("#di-elite-video-host video");
      if (direct) { direct.currentTime = 0; direct.play().catch(() => {}); return; }
      try {
        ELITE_YT_PLAYER?.mute?.();
        ELITE_YT_PLAYER?.setVolume?.(0);
        ELITE_YT_PLAYER?.seekTo?.(0, true);
        ELITE_YT_PLAYER?.playVideo?.();
      } catch {}
    }

    function eliteMediaStatus(message = "", retry = false) {
      const status = document.getElementById("di-elite-media-status");
      if (!status) return;
      status.hidden = !message;
      document.getElementById("di-elite-media-message").textContent = message;
      const button = document.getElementById("di-elite-media-retry");
      button.hidden = !retry; button.textContent = eliteUi("Повторити", "Retry");
    }

    function eliteDirectVideoUrl(ex = {}) {
      const raw = ex.videoUrl || ex.videoSrc || ex.demoVideoUrl || (/\.(mp4|webm)(\?|$)/i.test(ex.videoKey || "") ? ex.videoKey : "");
      if (!raw) return "";
      try {
        const url = new URL(raw, document.baseURI);
        return ["https:", "http:"].includes(url.protocol) && /\.(mp4|webm)$/i.test(url.pathname) ? url.href : "";
      } catch { return ""; }
    }

    function eliteEnsureVideoPlayer(videoId, shouldAutoplay = false, silentDemo = false) {
      silentDemo = silentDemo || ['gym','running'].includes(getEliteMeta()?.task?.mode);
      const host = document.getElementById("di-elite-video-host");
      if (!host) return;
      const directUrl = eliteDirectVideoUrl(getEliteMeta()?.exercise);
      const externalClock=getEliteMeta()?.task?.mode==='running';
      const drillUrl = isDrillVideoKey(videoId) ? `${drillPlayerUrl(String(videoId).trim().slice(6), externalClock?false:shouldAutoplay)}${silentDemo ? "&silent=1" : ""}${externalClock?'&clock=daily':''}` : "";
      const cleanId = normalizeYouTubeId(videoId);
      const key = drillUrl || directUrl || cleanId || "none";
      if (ELITE_MEDIA.key === key && host.childElementCount) {
        if (shouldAutoplay) {
          host.querySelector("video")?.play().catch(() => {});
          if (cleanId && !directUrl && !drillUrl) {
            eliteShowVideoCover(false);
            if (ELITE_YT_PLAYER) { try { ELITE_YT_PLAYER.playVideo?.(); } catch {} }
            else { const frame = host.querySelector("iframe"); if (frame?.src.includes("autoplay=0")) frame.src = eliteVideoSrc(cleanId, true); }
          }
        }
        return;
      }
      ELITE_MEDIA.key = key;
      const token = ++ELITE_MEDIA.token;
      clearTimeout(ELITE_MEDIA.timeout);
      eliteShowVideoCover(false); eliteShowVideoEndLogo(false);
      if (ELITE_YT_PLAYER) { try { ELITE_YT_PLAYER.destroy?.(); } catch {} ELITE_YT_PLAYER = null; ELITE_YT_VIDEO_ID = ""; }
      host.replaceChildren();
      if (key === "none") {
        eliteMediaStatus(eliteUi("Демонстрація поки недоступна. Завдання й керування доступні нижче.", "Demo unavailable. The task and controls are available below."));
        return;
      }
      eliteMediaStatus(eliteUi("Завантаження демонстрації… Можна переглянути завдання нижче.", "Loading demo… You can review the task below."));
      const loaded = () => { if (token === ELITE_MEDIA.token) { clearTimeout(ELITE_MEDIA.timeout); eliteMediaStatus(); } };
      const failed = () => {
        if (token !== ELITE_MEDIA.token) return;
        clearTimeout(ELITE_MEDIA.timeout); eliteShowVideoCover(false);
        // Preserve the configured video frame size while removing a failed native spinner.
        host.innerHTML = '<div style="height:100%;display:grid;place-items:center"><img src="../assets/images/AK_logo.png" alt="" width="76"></div>';
        eliteMediaStatus(eliteUi("Не вдалося завантажити демонстрацію. Завдання залишається доступним.", "Demo could not load. The task remains available."), true);
      };
      ELITE_MEDIA.timeout = setTimeout(() => {
        if (token === ELITE_MEDIA.token) eliteMediaStatus(eliteUi("Демонстрація завантажується довше звичайного. Можна продовжити за завданням або повторити завантаження.", "The demo is taking longer to load. You can follow the task or retry."), true);
      }, 10000);
      if (directUrl && !drillUrl) {
        const video = document.createElement("video");
        video.src = directUrl; video.controls = true; video.playsInline = true; video.muted = true;
        video.loop = true; video.preload = "metadata";
        video.setAttribute("aria-label", eliteUi("Демонстрація вправи", "Exercise demo"));
        video.addEventListener("loadedmetadata", loaded); video.addEventListener("error", failed);
        host.append(video);
        if (shouldAutoplay) video.play().catch(() => { if (token === ELITE_MEDIA.token && !video.error) eliteMediaStatus(eliteUi("Натисни ▶ на відео, щоб переглянути демонстрацію.", "Press play on the video to view the demo.")); });
        return;
      }
      if (isDrillVideoKey(videoId)) {
        eliteShowVideoCover(false);
        eliteShowVideoEndLogo(false);
        if (ELITE_YT_PLAYER) {
          try { ELITE_YT_PLAYER.destroy?.(); } catch {}
          ELITE_YT_PLAYER = null;
          ELITE_YT_VIDEO_ID = "";
        }
        const frame = document.createElement("iframe");
        frame.src = drillUrl; frame.title = eliteUi("Анімація вправи", "Exercise animation");
        frame.allow = "autoplay; fullscreen"; frame.allowFullscreen = true;
        frame.addEventListener("error", failed); host.append(frame);
        return;
      }
      if (!document.getElementById("pac-youtube-api") && !window.YT) {
        const tag = document.createElement("script"); tag.id = "pac-youtube-api";
        tag.src = "https://www.youtube.com/iframe_api"; document.head.append(tag);
      }
      eliteShowVideoCover(!shouldAutoplay);
      eliteShowVideoEndLogo(false);

      if (!cleanId || !window.YT || typeof window.YT.Player !== "function") {
        host.innerHTML = `<iframe src="${eliteVideoSrc(cleanId || "", shouldAutoplay)}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
        host.querySelector("iframe").title = eliteUi("Демонстрація YouTube", "YouTube demo");
        host.querySelector("iframe").addEventListener("load", loaded);
        host.querySelector("iframe").addEventListener("error", failed);
        return;
      }

      ELITE_YT_VIDEO_ID = cleanId;
      host.innerHTML = '<div id="di-elite-yt-frame"></div>';
      ELITE_YT_PLAYER = new YT.Player("di-elite-yt-frame", {
        width: "100%",
        height: "100%",
        videoId: cleanId,
        playerVars: {
          autoplay: shouldAutoplay ? 1 : 0,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          mute: 1,
          playsinline: 1,
          iv_load_policy: 3,
          cc_load_policy: 0,
          fs: 0,
          disablekb: 1,
          start: 1
        },
        events: {
          onReady: (e) => {
            loaded();
            try {
              e.target.mute?.();
              e.target.setVolume?.(0);
              if (shouldAutoplay) {
                eliteShowVideoCover(false);
                e.target.playVideo?.();
              } else {
                e.target.pauseVideo?.();
              }
              const iframe = e.target.getIframe?.();
              if (iframe) iframe.setAttribute("tabindex", "-1");
              eliteShowVideoEndLogo(false);
            } catch {}
          },
          onError: failed,
          onStateChange: (e) => {
            try { e.target.mute?.(); e.target.setVolume?.(0); } catch {}
            if (e.data === 1) {
              eliteShowVideoCover(false);
              eliteShowVideoEndLogo(false);
            }
            if (e.data === 0) {
              eliteShowVideoEndLogo(true);
            }
          }
        }
      });
    }

    function elitePauseVideoPlayer() {
      try { ELITE_YT_PLAYER?.pauseVideo?.(); } catch {}
      document.querySelector("#di-elite-video-host video")?.pause();
    }

    function eliteResumeCurrentPhase() {
      const meta = getEliteMeta();
      if (!meta || !ELITE_EXEC.open) return;
      ELITE_EXEC.paused = false;
      if (eliteHasStrengthRun(meta) && ELITE_EXEC.phase === "active") {
        try { eliteStrengthStore().startSet(ELITE_STRENGTH.run); } catch (error) { eliteStrengthError(error); return; }
      }

      if (ELITE_EXEC.phase === "preset") {
        ELITE_EXEC.autoStartTimer = setInterval(() => {
          ELITE_EXEC.leftSec -= 1;
          if (meta.task?.mode !== "gym" && ELITE_EXEC.leftSec <= 3 && ELITE_EXEC.leftSec > 0) {
            eliteSpeak(String(ELITE_EXEC.leftSec), { interrupt: false });
          }
          if (ELITE_EXEC.leftSec <= 0) {
            eliteStartActiveSet();
            return;
          }
          renderEliteExecutionOverlay();
        }, 1000);
        renderEliteExecutionOverlay();
        return;
      }

      if (ELITE_EXEC.phase === "active") {
        if (!eliteIsTimed(meta)) {
          if (ELITE_EXEC.repTarget > 0 && ELITE_EXEC.repDone < ELITE_EXEC.repTarget) {
            eliteStartRepCounter(meta);
          }
          renderEliteExecutionOverlay();
          return;
        }
        ELITE_EXEC.intervalId = setInterval(() => {
          ELITE_EXEC.leftSec -= 1;
          if (meta.task?.mode !== "gym" && (ELITE_EXEC.leftSec === 20 || ELITE_EXEC.leftSec === 10)) {
            eliteSpeak(eliteSpeakSeconds(ELITE_EXEC.leftSec), { interrupt: false });
          }
          if (ELITE_EXEC.leftSec <= 0) {
            eliteCompleteSetAndContinue();
            return;
          }
          renderEliteExecutionOverlay();
        }, 1000);
        renderEliteExecutionOverlay();
        return;
      }

      if (ELITE_EXEC.phase === "rest") {
        if (eliteHasStrengthRun(meta)) { eliteStartStrengthRest(); renderEliteExecutionOverlay(); return; }
        ELITE_EXEC.intervalId = setInterval(() => {
          ELITE_EXEC.leftSec -= 1;
          if (ELITE_EXEC.leftSec <= 0) {
            eliteClearRuntimeTimers();
            ELITE_EXEC.setIndex += 1;
            eliteStartPreset();
            return;
          }
          renderEliteExecutionOverlay();
        }, 1000);
        renderEliteExecutionOverlay();
      }
    }

    function eliteTogglePause() {
      if (!ELITE_EXEC.open) return;
      if (ELITE_EXEC.phase === "idle" || ELITE_EXEC.phase === "complete") return;

      if (!ELITE_EXEC.paused) {
        window.speechSynthesis?.cancel();
        if (eliteHasStrengthRun() && ELITE_EXEC.phase === "active") {
          try { eliteStrengthStore().pause(ELITE_STRENGTH.run); } catch (error) { eliteStrengthError(error); }
        }
        eliteClearRuntimeTimers();
        ELITE_EXEC.paused = true;
        renderEliteExecutionOverlay();
        return;
      }
      eliteResumeCurrentPhase();
    }

    function eliteClearRuntimeTimers() {
      for (const node of ELITE_REST_AUDIO.nodes) { try { node.stop(); } catch {} }
      ELITE_REST_AUDIO.nodes.clear();
      if (ELITE_EXEC.intervalId) clearInterval(ELITE_EXEC.intervalId);
      if (ELITE_EXEC.autoStartTimer) clearInterval(ELITE_EXEC.autoStartTimer);
      if (ELITE_EXEC.repIntervalId) clearInterval(ELITE_EXEC.repIntervalId);
      if (ELITE_EXEC.completeDelayTimer) clearTimeout(ELITE_EXEC.completeDelayTimer);
      ELITE_EXEC.intervalId = null;
      ELITE_EXEC.autoStartTimer = null;
      ELITE_EXEC.repIntervalId = null;
      ELITE_EXEC.completeDelayTimer = null;
    }

    function elitePauseInlineVideoIfAny() {
      if (__ACTIVE_EXID__ && players[__ACTIVE_EXID__] && typeof players[__ACTIVE_EXID__].pauseVideo === "function") {
        try { players[__ACTIVE_EXID__].pauseVideo(); } catch {}
      }
    }

    function eliteTableRows(meta) {
      const rows = [];
      for (let i = 1; i <= ELITE_EXEC.totalSets; i++) {
        const rec = eliteRecommendedLoad(meta, i, ELITE_EXEC.totalSets);
        const role = eliteRoleLabel(ELITE_EXEC.roleMap[i - 1] || eliteRoleForSet(i, ELITE_EXEC.totalSets));
        const perSide = ELITE_EXEC.sideMode && !eliteIsTimed(meta) ? ` / ${ti("elitePerSide")}` : "";
        const target = eliteIsTimed(meta)
          ? `${eliteSetDurationSec(meta, i)}${ti("timerSecShort")}`
          : `${meta?.prescription?.reps || "—"} ${ti("reps").toLowerCase()}${perSide}`;
        const load = rec.hasLoad ? `${rec.load} kg` : "—";
        const currentCls = ELITE_EXEC.setIndex === i && ELITE_EXEC.phase !== "complete" ? "current" : "";
        rows.push(`<tr class="${currentCls}"><td>${i}</td><td>${role}</td><td>${target}</td><td>${load}</td></tr>`);
      }
      return rows.join("");
    }

    function renderEliteExecutionOverlay() {
      if (!ELITE_EXEC.open) return;
      ensureEliteExecutionOverlay();
      const meta = getEliteMeta();
      if (!meta) return;
      const exercise = meta.exercise || {};
      const runningTarget = runningTargetFromExercise(exercise);
      const speedTarget = speedTargetFromExercise(exercise);
      const isSpeedDrill = Boolean(speedTarget) || isSpeedDrillExercise(exercise);
      const isRunningDrill = !isSpeedDrill && (meta.task?.mode === "running" || Boolean(runningTarget) || isRunningDrillExercise(exercise));
      const isTargetDrill = isRunningDrill || isSpeedDrill;
      const overlayRoot = document.getElementById("di-elite-overlay");
      if (overlayRoot) overlayRoot.classList.toggle("is-running-drill", isTargetDrill);
      eliteRenderTaskLayout(meta);

      const rec = eliteRecommendedLoad(meta, ELITE_EXEC.setIndex, ELITE_EXEC.totalSets);
      if (ELITE_EXEC.currentLoadKg == null && rec.hasLoad && !eliteHasStrengthRun(meta)) ELITE_EXEC.currentLoadKg = rec.load;
      if (ELITE_EXEC.currentLoadKg != null && ELITE_EXEC.currentLoadKg < 0) ELITE_EXEC.currentLoadKg = 0;

      const exName = resolveExerciseName(meta.exercise || {});
      const roleTop = eliteRoleLabel(ELITE_EXEC.roleMap[ELITE_EXEC.setIndex - 1] || eliteRoleForSet(ELITE_EXEC.setIndex, ELITE_EXEC.totalSets));
      const targetSec = eliteSetDurationSec(meta, ELITE_EXEC.setIndex);
      const perSide = ELITE_EXEC.sideMode && !eliteIsTimed(meta) ? ` / ${ti("elitePerSide")}` : "";
      const targetText = eliteIsTimed(meta)
        ? `${targetSec}${ti("timerSecShort")}`
        : `${meta?.prescription?.reps || "—"} ${ti("reps")}${perSide}`;
      const targetTextCompact = eliteIsTimed(meta)
        ? `${targetSec}${ti("timerSecShort")}`
        : `${meta?.prescription?.reps || "—"} ${ti("reps").toLowerCase()}${perSide}`;
      const perf = getElitePerf(meta.exKey);
      const lastLoad = toNumSafe(perf?.lastLoadKg);
      const lastReps = toNumSafe(perf?.lastReps);
      const bestLoad = toNumSafe(perf?.bestLoadKg ?? perf?.lastLoadKg);
      const bestReps = toNumSafe(perf?.bestReps ?? perf?.lastReps);
      const e1rm = estimateEliteE1RM(bestLoad, bestReps);
      const signals = readCurrentSignals();
      const ready = eliteReadinessCard(signals.readiness);
      const fatigueVal = (() => {
        const s = toNumSafe(signals.stress);
        const so = toNumSafe(signals.soreness);
        if (s == null && so == null) return ti("eliteModerate");
        const avg = ((s || 5) + (so || 5)) / 2;
        if (avg >= 7) return ti("eliteModerate");
        if (avg <= 4.5) return ti("eliteGood");
        return ti("eliteModerate");
      })();

      const roleTopEl = document.getElementById("di-elite-role-top");
      const titleEl = document.getElementById("di-elite-title");
      const focusEl = document.getElementById("di-elite-focus");
      const progressEl = document.getElementById("di-elite-progress");
      const setEl = document.getElementById("di-elite-set");
      const targetEl = document.getElementById("di-elite-target");
      const restAfterEl = document.getElementById("di-elite-rest-after");
      const lastEl = document.getElementById("di-elite-last");
      const lastDateEl = document.getElementById("di-elite-last-date");
      const bestEl = document.getElementById("di-elite-best");
      const e1El = document.getElementById("di-elite-e1rm");
      const loadEl = document.getElementById("di-elite-load");
      const loadMidEl = document.getElementById("di-elite-load-mid");
      const rangeEl = document.getElementById("di-elite-range");
      const mainBtn = document.getElementById("di-elite-main-btn");
      const pauseBtn = document.getElementById("di-elite-pause-btn");
      const prevBtn = document.getElementById("di-elite-prev-btn");
      const nextBtn = document.getElementById("di-elite-next-btn");
      const mainSub = document.getElementById("di-elite-main-sub");
      const readinessEl = document.getElementById("di-elite-readiness");
      const readinessLabelEl = document.getElementById("di-elite-readiness-label");
      const fatigueEl = document.getElementById("di-elite-fatigue");
      const acwrEl = document.getElementById("di-elite-acwr");
      const hydrationEl = document.getElementById("di-elite-hydration");
      const rowsEl = document.getElementById("di-elite-rows");
      const voiceBtn = document.getElementById("di-elite-voice-btn");
      const adjustBtns = document.querySelectorAll("#di-elite-overlay [data-delta]");
      const adjustWrap = document.querySelector("#di-elite-overlay .di-elite-adjust");
      const setKeyEl = document.getElementById("di-elite-set-k");
      const targetKeyEl = document.getElementById("di-elite-target-k");
      const restKeyEl = document.getElementById("di-elite-rest-k");
      const lastKeyEl = document.getElementById("di-elite-last-k");
      const bestKeyEl = document.getElementById("di-elite-best-k");
      const loadKeyEl = document.getElementById("di-elite-load-k");

      const setEliteKeyLabels = (labels = {}) => {
        if (setKeyEl) setKeyEl.textContent = labels.set || ti("eliteSet");
        if (targetKeyEl) targetKeyEl.textContent = labels.target || ti("eliteTarget");
        if (restKeyEl) restKeyEl.textContent = labels.rest || ti("eliteRestAfter");
        if (lastKeyEl) lastKeyEl.textContent = labels.last || ti("eliteLastTime");
        if (bestKeyEl) bestKeyEl.textContent = labels.best || ti("eliteBest");
        if (loadKeyEl) loadKeyEl.textContent = labels.load || ti("eliteTodayLoad");
      };

      if (roleTopEl) roleTopEl.textContent = isRunningDrill ? eliteUi("БІГ", "RUNNING") : isSpeedDrill ? eliteUi("ШВИДКІСТЬ", "SPEED") : roleTop.toUpperCase();
      if (titleEl) titleEl.textContent = exName || "—";
      if (focusEl) {
        if (isRunningDrill) {
          const r = runningMetricRows(runningTarget || runningFallbackTargetFromMeta(meta, targetSec));
          focusEl.textContent = runningFocusText(r);
        } else if (isSpeedDrill) {
          const s = speedMetricRows(speedTarget || {});
          focusEl.textContent = speedFocusText(s);
        } else {
          focusEl.textContent = eliteFocusCue(meta);
        }
      }
      if (progressEl) progressEl.innerHTML = eliteSetProgressHtml(ELITE_EXEC.totalSets, ELITE_EXEC.setIndex, ELITE_EXEC.phase);
      if (setEl) {
        const sideText = eliteCurrentSideText();
        setEl.textContent = isTargetDrill ? `${ELITE_EXEC.setIndex} / ${ELITE_EXEC.totalSets}`
          : sideText
          ? `${ELITE_EXEC.setIndex} / ${ELITE_EXEC.totalSets} • ${sideText}`
          : `${ELITE_EXEC.setIndex} / ${ELITE_EXEC.totalSets}`;
      }
      if (isRunningDrill) {
        const runningDisplayTarget = runningTarget || runningFallbackTargetFromMeta(meta, targetSec);
        const r = runningMetricRows(runningDisplayTarget);
        const timer = timerFromDrillExercise(exercise);
        setEliteKeyLabels(runningEliteLabels());
        if (targetEl) targetEl.textContent = formatDurationClock(meta.task?.planned?.workSec ?? targetSec);
        if (restAfterEl) restAfterEl.textContent = formatDurationClock(eliteResolveRestSec(meta));
        if (lastEl) lastEl.textContent = r.target;
        if (lastDateEl) lastDateEl.textContent = timer.workSec ? `${runningWord("work")} ${formatDurationClock(timer.workSec)}` : "";
        if (bestEl) bestEl.textContent = `${ELITE_EXEC.totalSets} ${runningWord("seriesShort")}`;
        if (e1El) e1El.textContent = r.source ? `Source: ${r.source.replace(/_/g, " ")}` : "";
        if (loadEl) {
          loadEl.textContent = timer.restBetweenSets ? `${runningWord("seriesRest")} ${formatDurationClock(timer.restBetweenSets)}` : r.cue;
          loadEl.classList.remove("big");
          loadEl.classList.add("load-text");
        }
        if (rangeEl) rangeEl.textContent = timer.source || "Drill timing";
      } else if (isSpeedDrill) {
        const s = speedMetricRows(speedTarget || {});
        setEliteKeyLabels(speedEliteLabels());
        if (targetEl) targetEl.textContent = s.zone;
        if (restAfterEl) restAfterEl.textContent = s.reps;
        if (lastEl) lastEl.textContent = s.target;
        if (lastDateEl) lastDateEl.textContent = "Target distance";
        if (bestEl) bestEl.textContent = s.exposure;
        if (e1El) e1El.textContent = s.source;
        if (loadEl) {
          loadEl.textContent = s.rest;
          loadEl.classList.remove("big");
          loadEl.classList.add("load-text");
        }
        if (rangeEl) rangeEl.textContent = s.type;
      } else {
        setEliteKeyLabels();
        if (targetEl) targetEl.textContent = targetText;
        if (restAfterEl) restAfterEl.textContent = `${eliteResolveRestSec(meta)}${ti("timerSecShort")}`;
        if (lastEl) lastEl.textContent = (lastLoad != null && lastReps != null) ? `${lastLoad} kg × ${lastReps}` : "—";
      }
      if (lastDateEl) {
        const d = toNumSafe(perf?.updatedAt);
        if (!isTargetDrill) lastDateEl.textContent = d ? `${new Date(d).toLocaleDateString()}${perf.lastMode ? ` · ${perf.lastMode === "test3" ? eliteUi("Тест", "Test") : eliteUi("Тренування", "Workout")}` : ""}` : "";
      }
      if (!isTargetDrill && bestEl) bestEl.textContent = (bestLoad != null && bestReps != null) ? `${bestLoad} kg × ${bestReps}` : "—";
      if (!isTargetDrill && e1El) e1El.textContent = e1rm != null ? `e1RM ${e1rm} kg` : "";
      if (!isTargetDrill && loadEl) {
        if (ELITE_EXEC.currentLoadKg != null) {
          loadEl.textContent = `${ELITE_EXEC.currentLoadKg} kg`;
          loadEl.classList.add("big");
          loadEl.classList.remove("load-text");
        } else {
          const noLoadShort = String(ti("eliteBodyweight") || "").split("/")[0].trim() || ti("eliteBodyweight");
          loadEl.textContent = noLoadShort;
          loadEl.classList.remove("big");
          loadEl.classList.add("load-text");
        }
      }
      if (!isTargetDrill && loadMidEl) {
        if (ELITE_EXEC.currentLoadKg != null) {
          loadMidEl.classList.remove("body");
          loadMidEl.innerHTML = `<div class="v">${escapeHtml(ELITE_EXEC.currentLoadKg)} kg</div><div class="s">× ${escapeHtml(targetTextCompact)}</div>`;
        } else {
          const noLoadShort = String(ti("eliteBodyweight") || "").split("/")[0].trim() || ti("eliteBodyweight");
          loadMidEl.classList.add("body");
          loadMidEl.innerHTML = `<div class="v">${noLoadShort}</div><div class="s">× ${targetTextCompact}</div>`;
        }
      }
      const canAdjustLoad = !isTargetDrill && (rec.hasLoad || eliteHasStrengthRun(meta)) && (!eliteHasStrengthRun(meta) || ELITE_STRENGTH.run.status === "in-progress");
      if (adjustWrap) adjustWrap.style.display = canAdjustLoad ? "grid" : "none";
      adjustBtns.forEach((btn) => {
        btn.disabled = !canAdjustLoad;
        btn.style.opacity = canAdjustLoad ? "1" : ".4";
        btn.style.cursor = canAdjustLoad ? "pointer" : "not-allowed";
      });
      if (!isTargetDrill && rangeEl) {
        if (rec.hasLoad && rec.min != null && rec.max != null) rangeEl.textContent = `${ti("eliteRange")}: ${rec.min} - ${rec.max} kg`;
        else rangeEl.textContent = ti("eliteBodyweight");
      }
      if (readinessEl) readinessEl.textContent = ready.score;
      if (readinessLabelEl) readinessLabelEl.textContent = ready.label;
      if (fatigueEl) fatigueEl.textContent = fatigueVal;
      if (acwrEl) acwrEl.textContent = (toNumSafe(signals.acwr) != null) ? `ACWR ${Number(signals.acwr).toFixed(2)}` : "ACWR —";
      if (hydrationEl) hydrationEl.textContent = `${eliteHydrationPct()}%`;
      if (rowsEl) rowsEl.innerHTML = eliteTableRows(meta);
      if (voiceBtn) {
        voiceBtn.textContent = ELITE_EXEC.voiceMuted ? eliteUi("Звук: вимк.", "Sound: off") : eliteUi("Звук: увімк.", "Sound: on");
        voiceBtn.setAttribute("aria-pressed", String(!ELITE_EXEC.voiceMuted));
      }
      const prevExId = findPrevExerciseId(ELITE_EXEC.exId);
      const nextExId = findNextExerciseId(ELITE_EXEC.exId);
      if (prevBtn) {
        prevBtn.textContent = ti("elitePrevious");
        prevBtn.disabled = !prevExId;
      }
      if (nextBtn) {
        nextBtn.textContent = ti("eliteNext");
        nextBtn.disabled = !nextExId;
      }

      if (mainBtn && mainSub) {
        mainBtn.disabled = false;
        if (pauseBtn) {
          const canPause = ELITE_EXEC.phase === "preset" || ELITE_EXEC.phase === "active" || ELITE_EXEC.phase === "rest";
          pauseBtn.style.display = canPause ? "block" : "none";
          pauseBtn.textContent = ELITE_EXEC.paused ? ti("elitePlay") : ti("elitePause");
        }
        if (ELITE_EXEC.phase === "preset") {
          mainBtn.textContent = ti("eliteStartSet");
          mainSub.textContent = `${ti("eliteAutoStartIn")} ${ELITE_EXEC.leftSec}${ti("timerSecShort")}`;
          if (ELITE_EXEC.paused) mainSub.textContent = ti("elitePaused");
        } else if (ELITE_EXEC.phase === "active") {
          if (meta?.prescription?.repsUnit === "sec") {
            mainBtn.textContent = `${ti("timerWork")} ${ELITE_EXEC.leftSec}${ti("timerSecShort")}`;
            mainSub.textContent = "";
            mainBtn.disabled = true;
          } else {
            mainBtn.textContent = ti("eliteCompleteSet");
            if (ELITE_EXEC.repTarget > 0) {
              const sideText = eliteCurrentSideText();
              mainSub.textContent = `${ti("reps")} ${Math.min(ELITE_EXEC.repDone, ELITE_EXEC.repTarget)} / ${ELITE_EXEC.repTarget}${sideText ? ` • ${sideText}` : ""}`;
            } else {
              mainSub.textContent = "";
            }
          }
          if (ELITE_EXEC.paused) mainSub.textContent = ti("elitePaused");
        } else if (ELITE_EXEC.phase === "rest") {
          mainBtn.textContent = `${ti("timerRest")} ${ELITE_EXEC.leftSec}${ti("timerSecShort")}`;
          mainSub.textContent = "";
          mainBtn.disabled = true;
          if (ELITE_EXEC.paused) mainSub.textContent = ti("elitePaused");
        } else if (ELITE_EXEC.phase === "complete") {
          mainBtn.textContent = ti("eliteNextExercise");
          mainSub.textContent = ti("eliteDone");
          if (pauseBtn) pauseBtn.style.display = "none";
        } else {
          mainBtn.textContent = ti("eliteStartSet");
          mainSub.textContent = "";
          if (pauseBtn) pauseBtn.style.display = "none";
        }
      }
      eliteRenderStrength(meta);
      document.getElementById('di-running-setup').hidden=meta.task?.mode!=='running';
      if(meta.task?.mode==='running')eliteRenderRunning(meta);
      if (meta.task?.mode === "gym" && !eliteHasStrengthRun(meta)) {
        if (mainBtn) mainBtn.disabled = true;
        document.getElementById("di-elite-result-text").textContent = ELITE_STRENGTH.error || eliteUi("Локальний журнал недоступний.", "Local journal unavailable.");
      }
    }

    function eliteSpeak(message, opts = {}) {
      if (ELITE_EXEC.voiceMuted) return;
      coachSpeak(message, opts);
    }

    function eliteFinishExercise() {
      const meta = getEliteMeta();
      if (!meta) return closeEliteExecutionMode();
      eliteClearRuntimeTimers();
      setExerciseDoneUi(meta.exId, meta.exKey, true);

      const perfPatch = {};
      if (ELITE_EXEC.currentLoadKg != null) perfPatch.lastLoadKg = ELITE_EXEC.currentLoadKg;
      if (meta?.prescription?.repsUnit !== "sec") perfPatch.lastReps = toNumSafe(meta?.prescription?.reps) || null;
      const prev = getElitePerf(meta.exKey);
      const bestLoad = Math.max(toNumSafe(prev?.bestLoadKg) || 0, toNumSafe(perfPatch.lastLoadKg) || 0);
      if (bestLoad > 0) perfPatch.bestLoadKg = bestLoad;
      const bestReps = Math.max(toNumSafe(prev?.bestReps) || 0, toNumSafe(perfPatch.lastReps) || 0);
      if (bestReps > 0) perfPatch.bestReps = bestReps;
      if (eliteIsTimed(meta) && meta?.task?.mode !== "running" && detectIsometricExercise(meta?.exercise || {})) {
        const baseSec = eliteSetDurationSec(meta, 1);
        const maxSec = Math.max(...(Array.isArray(ELITE_EXEC.setDurations) ? ELITE_EXEC.setDurations : [baseSec]).map(v => Number(v) || 0), baseSec);
        perfPatch.lastIsoSec = baseSec;
        perfPatch.bestIsoSec = Math.max(toNumSafe(prev?.bestIsoSec) || 0, maxSec || 0);
        perfPatch.nextIsoSec = Math.min(120, Math.max(20, baseSec + 5));
      }
      saveElitePerf(meta.exKey, perfPatch);

      const nextUndone = findNextUndoneExerciseId(meta.exId);
      if (!nextUndone) {
        ELITE_EXEC.phase = "complete";
        renderEliteExecutionOverlay();
        eliteSpeak(ti("voiceGreatJob"), { interrupt: false });
        setTimeout(() => {
          closeEliteExecutionMode();
          goToFeedbackForm(true);
        }, 280);
        return;
      }

      ELITE_EXEC.phase = "complete";
      renderEliteExecutionOverlay();
      eliteSpeak(ti("voiceDone"), { interrupt: false });
    }

    function eliteCompleteSetAndContinue() {
      const meta = getEliteMeta();
      if (!meta) return;
      eliteClearRuntimeTimers();
      if (eliteHasStrengthRun(meta)) { eliteCompleteStrengthSet(meta); return; }

      // For unilateral exercises, complete side 1 -> auto-switch to side 2 within the same set.
      if (ELITE_EXEC.sideMode && ELITE_EXEC.sideTotal > 1 && ELITE_EXEC.sideIndex < (ELITE_EXEC.sideTotal - 1)) {
        ELITE_EXEC.sideIndex += 1;
        const p = eliteVoicePack();
        eliteSpeak(p.otherSide, { interrupt: false });
        eliteStartPreset({ shortPrep: true });
        return;
      }
      ELITE_EXEC.sideIndex = 0;

      if (ELITE_EXEC.setIndex >= ELITE_EXEC.totalSets) {
        eliteFinishExercise();
        return;
      }
      ELITE_EXEC.phase = "rest";
      ELITE_EXEC.leftSec = eliteResolveRestSec(meta);
      if (ELITE_EXEC.leftSec === 0) {
        ELITE_EXEC.setIndex += 1;
        eliteStartActiveSet();
        return;
      }
      eliteAnnounceRest(meta);
      renderEliteExecutionOverlay();
      ELITE_EXEC.intervalId = setInterval(() => {
        ELITE_EXEC.leftSec -= 1;
        if (ELITE_EXEC.leftSec <= 0) {
          eliteClearRuntimeTimers();
          ELITE_EXEC.setIndex += 1;
          eliteStartPreset();
          return;
        }
        renderEliteExecutionOverlay();
      }, 1000);
    }

    function eliteStartActiveSet(startSource='athlete-button') {
      const meta = getEliteMeta();
      if (!meta) return;
      if (eliteHasStrengthRun(meta)) {
        try { eliteStrengthStore().startSet(ELITE_STRENGTH.run,{startSource,plannedRestSec:eliteResolveRestSec(meta,ELITE_STRENGTH.run.rows.at(-1)?.setIndex)}); }
        catch (error) { eliteStrengthError(error); return; }
      }
      eliteClearRuntimeTimers();
      ELITE_EXEC.phase = "active";
      eliteAnnounceSetStart(meta);
      if (eliteIsTimed(meta)) {
        ELITE_EXEC.leftSec = Math.max(meta?.task?.planned?.workSec > 0 ? 1 : 3, eliteSetDurationSec(meta, ELITE_EXEC.setIndex));
        if (meta.task?.mode !== "gym" && ELITE_EXEC.leftSec >= 25) {
          eliteSpeak(eliteSpeakSeconds(ELITE_EXEC.leftSec), { interrupt: false });
        }
        renderEliteExecutionOverlay();
        ELITE_EXEC.intervalId = setInterval(() => {
          ELITE_EXEC.leftSec -= 1;
          if (meta.task?.mode !== "gym" && (ELITE_EXEC.leftSec === 20 || ELITE_EXEC.leftSec === 10)) {
            eliteSpeak(eliteSpeakSeconds(ELITE_EXEC.leftSec), { interrupt: false });
          }
          if (ELITE_EXEC.leftSec <= 0) {
            eliteCompleteSetAndContinue();
            return;
          }
          renderEliteExecutionOverlay();
        }, 1000);
      } else {
        ELITE_EXEC.repTarget = eliteTargetReps(meta);
        ELITE_EXEC.repDone = 0;
        ELITE_EXEC.repTickMs = eliteRepTickMs(meta);
        renderEliteExecutionOverlay();
        eliteStartRepCounter(meta);
      }
    }

    function eliteStartPreset(opts = {}) {
      const meta = getEliteMeta();
      if (!meta) return;
      if (meta.task?.mode === "gym") {
        if (!eliteHasStrengthRun(meta)) return;
        if (ELITE_STRENGTH.run.pending.loadKg == null && ELITE_STRENGTH.run.mode === "workout") { ELITE_STRENGTH.run.pending.loadKg = 0; ELITE_EXEC.currentLoadKg = 0; eliteSaveStrength(); }
        if (!ELITE_STRENGTH.run.timed && (ELITE_STRENGTH.run.pending.loadKg == null || ELITE_STRENGTH.run.pending.loadKg < 0)) { eliteOpenStrengthEditor(); eliteStrengthError(Error("INVALID_LOAD")); return; }
        if(ELITE_STRENGTH.run.index>1){eliteStartActiveSet();return;}
      }
      eliteClearRuntimeTimers();
      eliteEnsureVideoPlayer(meta.videoId || "", true);
      ELITE_EXEC.phase = "preset";
      ELITE_EXEC.paused = false;
      ELITE_EXEC.repTarget = 0;
      ELITE_EXEC.repDone = 0;
      ELITE_EXEC.repTickMs = 0;
      const prepSec = meta.task?.mode === "running"
        ? (ELITE_EXEC.setIndex === 1 ? meta.task.planned.prepSec ?? 3 : 0)
        : eliteIsTimed(meta) ? 3 : (opts?.shortPrep ? 3 : 5);
      if (prepSec === 0) { eliteStartActiveSet(); return; }
      ELITE_EXEC.leftSec = prepSec;
      const rec = eliteRecommendedLoad(meta, ELITE_EXEC.setIndex, ELITE_EXEC.totalSets);
      if (!eliteHasStrengthRun(meta)) ELITE_EXEC.currentLoadKg = rec.hasLoad ? rec.load : null;
      const p = eliteVoicePack();
      const exName = resolveExerciseNameForSpeech(meta?.exercise || {}, diLang());
      if (meta.task?.mode !== "gym") {
        if (ELITE_EXEC.setIndex === 1 && ELITE_EXEC.sideIndex === 0 && exName) eliteSpeak(exName, { interrupt: true });
        eliteSpeak(p.ready, { interrupt: false });
      }
      renderEliteExecutionOverlay();
      ELITE_EXEC.autoStartTimer = setInterval(() => {
        ELITE_EXEC.leftSec -= 1;
        if (meta.task?.mode !== "gym" && ELITE_EXEC.leftSec <= 3 && ELITE_EXEC.leftSec > 0) {
          eliteSpeak(String(ELITE_EXEC.leftSec), { interrupt: false });
        }
        if (ELITE_EXEC.leftSec <= 0) {
          eliteStartActiveSet();
          return;
        }
        renderEliteExecutionOverlay();
      }, 1000);
    }

    function eliteGoNextExercise() {
      const nextExId = findNextUndoneExerciseId(ELITE_EXEC.exId);
      if (!nextExId) {
        eliteSpeak(ti("voiceGreatJob"), { interrupt: false });
        closeEliteExecutionMode();
        goToFeedbackForm(true);
        return;
      }
      openEliteExecutionMode(nextExId, { fromAuto: true });
    }

    function eliteGoPrevExercise() {
      const prevExId = findPrevExerciseId(ELITE_EXEC.exId);
      if (!prevExId) return;
      openEliteExecutionMode(prevExId, { fromAuto: true });
    }

    function eliteGoNextExerciseManual() {
      const nextExId = findNextExerciseId(ELITE_EXEC.exId);
      if (!nextExId) return;
      openEliteExecutionMode(nextExId, { fromAuto: true });
    }

    function closeEliteExecutionMode() {
      window.speechSynthesis?.cancel();
      if(getEliteMeta()?.task?.mode==='running')window.PACDailyRunning.detach();
      if (ELITE_STRENGTH.run?.status === "in-progress" && ELITE_STRENGTH.run?.userId === CURRENT_UID) {
        try { eliteStrengthStore().pause(ELITE_STRENGTH.run); } catch (error) { eliteStrengthError(error); return; }
      }
      clearInterval(ELITE_STRENGTH.checkpoint); ELITE_STRENGTH.checkpoint = null;
      ELITE_STRENGTH.run = null;
      document.getElementById("di-strength-editor")?.close();
      document.getElementById("di-elite-info")?.close();
      document.getElementById("di-running-result")?.close();
      document.getElementById("di-running-prescription")?.close();
      eliteClearRuntimeTimers();
      clearTimeout(ELITE_MEDIA.timeout); ELITE_MEDIA.token += 1; ELITE_MEDIA.key = "";
      document.querySelector("#di-elite-video-host video")?.pause();
      if (ELITE_YT_PLAYER) { try { ELITE_YT_PLAYER.destroy?.(); } catch {} ELITE_YT_PLAYER = null; ELITE_YT_VIDEO_ID = ""; }
      document.getElementById("di-elite-video-host")?.replaceChildren();
      ELITE_EXEC.open = false;
      ELITE_EXEC.exId = null;
      ELITE_EXEC.phase = "idle";
      ELITE_EXEC.setDurations = [];
      ELITE_EXEC.paused = false;
      ELITE_EXEC.repTarget = 0;
      ELITE_EXEC.repDone = 0;
      ELITE_EXEC.repTickMs = 0;
      ELITE_EXEC.sideMode = false;
      ELITE_EXEC.sideIndex = 0;
      ELITE_EXEC.sideTotal = 1;
      eliteShowVideoEndLogo(false);
      const root = document.getElementById("di-elite-overlay");
      if (root) root.style.display = "none";
      elitePauseVideoPlayer();
      const host = document.getElementById("di-elite-video-host");
      if (host && !ELITE_YT_PLAYER) host.innerHTML = "";
      document.body.style.overflow = "";
    }

    function openEliteExecutionMode(exId, opts = {}) {
      const meta = getEliteMeta(exId);
      if (!meta) return;
      if (ELITE_EXEC.open) { closeEliteExecutionMode(); if (ELITE_EXEC.open) return; }
      stopAllExerciseCoachTimers(true);
      elitePauseInlineVideoIfAny();

      ensureEliteExecutionOverlay();
      ELITE_EXEC.open = true;
      ELITE_EXEC.exId = exId;
      ELITE_EXEC.setIndex = 1;
      ELITE_EXEC.totalSets = Math.max(1, Number(meta?.timer?.sets || meta?.prescription?.sets || 1) || 1);
      ELITE_EXEC.workSec = meta.task?.mode === "running" ? meta.task.planned.workSec : Math.max(3, Number(meta?.timer?.workSec || 8) || 8);
      ELITE_EXEC.restSec = meta.task?.mode === "running" ? meta.task.planned.restSec : Math.max(5, Number(meta?.timer?.restSec || 20) || 20);
      ELITE_EXEC.roleMap = eliteBuildRoleMap(ELITE_EXEC.totalSets);
      ELITE_EXEC.setDurations = eliteBuildSetDurations(meta, ELITE_EXEC.totalSets);
      ELITE_EXEC.paused = false;
      ELITE_EXEC.repTarget = 0;
      ELITE_EXEC.repDone = 0;
      ELITE_EXEC.repTickMs = 0;
      ELITE_EXEC.sideMode = eliteHasDualSide(meta) && !eliteIsTimed(meta);
      ELITE_EXEC.sideIndex = 0;
      ELITE_EXEC.sideTotal = ELITE_EXEC.sideMode ? 2 : 1;
      if (ELITE_EXEC.setDurations.length) ELITE_EXEC.workSec = ELITE_EXEC.setDurations[0];
      try { ELITE_EXEC.voiceMuted = String(localStorage.getItem("pac_di_elite_voice_muted") || "") === "1"; } catch {}
      ELITE_EXEC.guidedDrillCoach = false; // GPS owns running timing/audio; Drill is a silent demonstration.
      if (ELITE_EXEC.guidedDrillCoach) ELITE_EXEC.voiceMuted = true;
      ELITE_EXEC.phase = "idle";
      ELITE_EXEC.leftSec = 0;
      const rec = eliteRecommendedLoad(meta, ELITE_EXEC.setIndex, ELITE_EXEC.totalSets);
      ELITE_EXEC.currentLoadKg = rec.hasLoad ? rec.load : null;
      if (meta.task?.mode === "gym") {
        try {
          eliteOpenStrength(meta);
          ELITE_STRENGTH.checkpoint = setInterval(() => {
            if (ELITE_STRENGTH.run?.status === "in-progress" && ELITE_STRENGTH.run.activeSince != null) {
              try { eliteStrengthStore().checkpoint(ELITE_STRENGTH.run); } catch (error) { eliteStrengthError(error); }
            }
          }, 1000);
        } catch (error) { ELITE_STRENGTH.run = null; eliteStrengthError(error); }
      }

      const root = document.getElementById("di-elite-overlay");
      if (root) root.style.display = "block";
      document.body.style.overflow = "hidden";
      eliteEnsureVideoPlayer(meta.videoId || "", isDrillVideoKey(meta.videoId || ""), true);
      if(meta.task?.mode==='running'){ELITE_RUNNING.live=null;ELITE_RUNNING.loading=true;}
      renderEliteExecutionOverlay();

      if(meta.task?.mode==='running'){
        ELITE_RUNNING.live=null;ELITE_RUNNING.loading=true;
        hydrateEliteDrillTargets(meta).finally(()=>{if(ELITE_EXEC.open&&getEliteMeta()===meta)elitePrepareRunning(meta);});
      }else hydrateEliteDrillTargets(meta);
      eliteAnnounceExerciseName(meta);
      if (!opts?.fromAuto) revealExerciseCard(exId);
    }

    window.openEliteExecutionMode = openEliteExecutionMode;
    window.closeEliteExecutionMode = closeEliteExecutionMode;
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && ELITE_EXEC.open) {
        const popup = document.querySelector("#di-elite-overlay dialog[open]");
        if (popup) { e.preventDefault(); popup.close(); return; }
        closeEliteExecutionMode();
      }
    });

    // Персоналізовані рекомендації залежно від типу вправи.
    function exerciseRecommendation(ex, stage, lang = diLang()) {
      const mapped = fixMojibake(pickLocalizedValue(ex?.recommendation_i18n, lang));
      if (mapped) return mapped;
      const direct = fixMojibake(ex?.recommendation || "").trim();
      if (direct) {
        if ((lang !== "uk" && lang !== "ru") && hasCyrillic(direct)) return "";
        return direct;
      }

      const kind = detectExerciseKind(ex);
      const rec = {
        uk: {
          mobility: "Плавна амплітуда і контроль дихання; без ривків.",
          glute: "Нейтральний поперек і пауза у піку скорочення.",
          core: "Стабілізуй корпус, контролюй таз і ребра.",
          lower_strength: "Коліно по осі стопи, контроль ексцентрики.",
          power: "Вибухове виконання, повний відпочинок між підходами.",
          push: "Лопатки стабільні, траєкторія контрольована.",
          pull: "Ініціюй рух лопаткою, не тільки руками.",
          release: "Повільний темп і помірний тиск, без гострого болю.",
          rehab: "Безболісний діапазон, біль не вище 3/10.",
          general: stage === "Pre-Training" ? "Контрольований темп і якісна активація." : (stage === "Post-Training" ? "Знизь інтенсивність і віднови дихання." : "Якість руху важливіша за темп.")
        },
        en: {
          mobility: "Use smooth range and breathing control; avoid jerky reps.",
          glute: "Keep lumbar neutral and pause at peak contraction.",
          core: "Brace trunk and control pelvis/rib position.",
          lower_strength: "Track knee over foot and control the eccentric phase.",
          power: "Explosive execution with full rest between sets.",
          push: "Keep scapula stable and path controlled.",
          pull: "Initiate with scapula, not only with arms.",
          release: "Slow tempo and moderate pressure, no sharp pain.",
          rehab: "Work in pain-free range; pain <= 3/10.",
          general: stage === "Pre-Training" ? "Controlled tempo and clean activation." : (stage === "Post-Training" ? "Lower intensity and reset breathing." : "Movement quality over speed.")
        },
        de: {
          mobility: "Ruhige Amplitude und Atemkontrolle, ohne Rucke.",
          glute: "LWS neutral halten, kurze Pause im Peak.",
          core: "Rumpf stabil, Becken und Rippen kontrolliert.",
          lower_strength: "Knie über dem Fuß, Exzentrik kontrolliert.",
          power: "Explosiv arbeiten, volle Satzpausen nutzen.",
          push: "Scapula stabil und saubere Bewegungsbahn.",
          pull: "Aus der Scapula initiieren, nicht nur aus den Armen.",
          release: "Langsames Tempo, moderater Druck, kein stechender Schmerz.",
          rehab: "Im schmerzfreien Bereich arbeiten; Schmerz <= 3/10.",
          general: stage === "Pre-Training" ? "Kontrolliertes Tempo und saubere Aktivierung." : (stage === "Post-Training" ? "Intensität senken und Atmung beruhigen." : "Bewegungsqualität vor Tempo.")
        },
        es: {
          mobility: "Rango suave y respiración controlada, sin tirones.",
          glute: "Mantén lumbar neutra y pausa en la contracción pico.",
          core: "Estabiliza tronco y controla pelvis/costillas.",
          lower_strength: "Rodilla alineada al pie y excéntrica controlada.",
          power: "Ejecución explosiva con descanso completo entre series.",
          push: "Escápulas estables y trayectoria limpia.",
          pull: "Inicia con la escápula, no solo con los brazos.",
          release: "Ritmo lento y presión moderada, sin dolor agudo.",
          rehab: "Trabaja en rango sin dolor; dolor <= 3/10.",
          general: stage === "Pre-Training" ? "Tempo controlado y activación de calidad." : (stage === "Post-Training" ? "Baja intensidad y normaliza respiración." : "Calidad de movimiento sobre velocidad.")
        },
        ru: {
          mobility: "Плавная амплитуда и контроль дыхания, без рывков.",
          glute: "Нейтральная поясница и пауза в пике сокращения.",
          core: "Стабилизируй корпус, контролируй таз и ребра.",
          lower_strength: "Колено по оси стопы, эксцентрика под контролем.",
          power: "Взрывное выполнение и полный отдых между подходами.",
          push: "Лопатки стабильны, траектория контролируется.",
          pull: "Начинай движение лопаткой, не только руками.",
          release: "Медленный темп и умеренное давление, без острой боли.",
          rehab: "Работа в безболезненном диапазоне; боль <= 3/10.",
          general: stage === "Pre-Training" ? "Контролируемый темп и качественная активация." : (stage === "Post-Training" ? "Снизь интенсивность и восстанови дыхание." : "Качество движения важнее темпа.")
        },
        pt: {
          mobility: "Amplitude suave e respiração controlada, sem trancos.",
          glute: "Lombar neutra e pausa no pico da contração.",
          core: "Estabilize o tronco e controle pelve/costelas.",
          lower_strength: "Joelho alinhado ao pé e excêntrica controlada.",
          power: "Execução explosiva com descanso completo entre séries.",
          push: "Escápulas estáveis e trajetória limpa.",
          pull: "Inicie pela escápula, não só pelos braços.",
          release: "Ritmo lento e pressão moderada, sem dor aguda.",
          rehab: "Trabalhe sem dor; dor <= 3/10.",
          general: stage === "Pre-Training" ? "Ritmo controlado e ativação de qualidade." : (stage === "Post-Training" ? "Reduza a intensidade e normalize a respiração." : "Qualidade de movimento acima da velocidade.")
        }
      };
      const set = rec[lang] || rec.en;
      return set[kind] || set.general;
    }
    function exerciseTechnique(ex, stage, lang = diLang()) {
      const mapped = fixMojibake(pickLocalizedValue(ex?.technique_i18n, lang));
      if (mapped) return mapped;
      const direct = fixMojibake(ex?.technique || "").trim();
      if (direct) {
        if ((lang !== "uk" && lang !== "ru") && hasCyrillic(direct)) return "";
        return direct;
      }

      const kind = detectExerciseKind(ex);
      const cues = {
        uk: {
          mobility: "Рухайся повільно, синхронно з видихом у кінці амплітуди.",
          glute: "Тримай таз нейтрально, штовхайся п'ятами і не прогинай поперек.",
          core: "Зафіксуй ребра, дихай діафрагмою і не втрачай контроль корпуса.",
          lower_strength: "Стопа повністю в підлозі, коліно стабільне по осі руху.",
          power: "Кожен повтор вибуховий, між повторами повне перезарядження.",
          push: "Плечі опущені, лікті контрольовані, не винось шию вперед.",
          pull: "Спочатку зведи лопатки, потім дотягуй руками.",
          release: "Прокочуй ділянку повільно 20-40 сек, уникай гострого болю.",
          rehab: "Працюй у безболісній амплітуді та зупиняйся при різкому болю.",
          general: stage === "Post-Training" ? "Зменш темп і сфокусуйся на відновленні руху." : "Контролюй темп і якість кожного повторення."
        },
        en: {
          mobility: "Move slowly and sync the end range with your exhale.",
          glute: "Keep pelvis neutral, drive through heels, avoid lumbar overarch.",
          core: "Brace ribs down, breathe diaphragmatically, keep trunk control.",
          lower_strength: "Keep full foot contact and stable knee tracking.",
          power: "Explode on each rep and fully reset between efforts.",
          push: "Shoulders down, elbows controlled, no forward neck reach.",
          pull: "Set scapula first, then finish the pull with arms.",
          release: "Roll slowly for 20-40 sec per zone, avoid sharp pain.",
          rehab: "Stay in pain-free range and stop on sharp discomfort.",
          general: stage === "Post-Training" ? "Reduce tempo and focus on recovery quality." : "Control tempo and execute every rep clean."
        },
        de: {
          mobility: "Langsam bewegen und Endposition mit der Ausatmung koppeln.",
          glute: "Becken neutral halten, über die Fersen drücken, kein Hohlkreuz.",
          core: "Rippen unten halten, diaphragmal atmen, Rumpf stabilisieren.",
          lower_strength: "Volle Fußauflage und stabiles Knie-Tracking sichern.",
          power: "Jede Wiederholung explosiv, dazwischen vollständig resetten.",
          push: "Schultern tief, Ellenbogen kontrolliert, Nacken neutral.",
          pull: "Zuerst Scapula setzen, dann mit den Armen nachziehen.",
          release: "Zone 20-40 Sek. langsam ausrollen, ohne stechenden Schmerz.",
          rehab: "Im schmerzfreien Bereich arbeiten und bei stechendem Schmerz stoppen.",
          general: stage === "Post-Training" ? "Tempo reduzieren und auf saubere Regeneration fokussieren." : "Tempo kontrollieren und jede Wiederholung sauber ausführen."
        },
        es: {
          mobility: "Muévete lento y sincroniza el final del rango con la exhalación.",
          glute: "Pelvis neutra, empuja con talones y evita arquear la zona lumbar.",
          core: "Costillas abajo, respiración diafragmática y control del tronco.",
          lower_strength: "Apoyo completo del pie y rodilla estable en la trayectoria.",
          power: "Cada repetición explosiva y reinicio completo entre repeticiones.",
          push: "Hombros abajo, codos controlados y cuello neutro.",
          pull: "Primero activa escápulas y luego completa con brazos.",
          release: "Ritmo lento 20-40 s por zona, sin dolor agudo.",
          rehab: "Trabaja sin dolor y detente ante molestias agudas.",
          general: stage === "Post-Training" ? "Baja el ritmo y prioriza la recuperación técnica." : "Controla el tempo y cuida la calidad de cada repetición."
        },
        ru: {
          mobility: "Двигайся медленно и синхронизируй конец амплитуды с выдохом.",
          glute: "Держи таз нейтрально, дави пятками и не прогибай поясницу.",
          core: "Фиксируй ребра, дыши диафрагмой, сохраняй контроль корпуса.",
          lower_strength: "Полный контакт стопы и стабильная ось колена.",
          power: "Каждое повторение взрывное, между ними полный сброс.",
          push: "Плечи опущены, локти под контролем, шея нейтральна.",
          pull: "Сначала включи лопатки, затем дотягивай руками.",
          release: "Прокатывай зону 20-40 сек медленно, без острой боли.",
          rehab: "Работай в безболезненном диапазоне и останавливайся при резкой боли.",
          general: stage === "Post-Training" ? "Снизь темп и сфокусируйся на качественном восстановлении." : "Контролируй темп и чистоту каждого повторения."
        },
        pt: {
          mobility: "Movimento lento, sincronizando o fim da amplitude com a expiração.",
          glute: "Pelvis neutra, força nos calcanhares e sem hiperextensão lombar.",
          core: "Costelas controladas, respiração diafragmática e tronco estável.",
          lower_strength: "Pé todo no solo e joelho estável na linha do movimento.",
          power: "Cada repetição explosiva e reset completo entre esforços.",
          push: "Ombros para baixo, cotovelos controlados e pescoço neutro.",
          pull: "Ative a escápula primeiro e finalize com os braços.",
          release: "Ritmo lento por 20-40 s por zona, sem dor aguda.",
          rehab: "Trabalhe sem dor e pare se houver desconforto agudo.",
          general: stage === "Post-Training" ? "Reduza o ritmo e foque na recuperação técnica." : "Controle o ritmo e execute cada repetição com qualidade."
        }
      };
      const set = cues[lang] || cues.en;
      if (set[kind]) return set[kind];

      const desc = resolveExerciseDescription(ex, lang);
      if (desc) return desc;
      return exerciseRecommendation(ex, stage, lang);
    }
    // Локалізуємо коди статусів у верхньому бейджі (REST/TRAIN)
    function localizeStatusCode(status) {
      if (status === "REST") return ti("statusRest");
      if (status === "TRAIN") return ti("statusTrain");
      return status; // MD, MD+1, MD-1 лишаємо як загальноприйняті коди
    }
    function applyDailyStaticTranslations() {
      document.title = ti("title");
      const tg = document.getElementById("daily-tagline"); if (tg) tg.textContent = ti("tagline");
      const pt = document.getElementById("daily-page-title"); if (pt) pt.textContent = ti("pageTitle");
      const lp = document.getElementById("daily-loading-profile"); if (lp) lp.textContent = ti("loadingProfile");
      const lpl = document.getElementById("daily-loading-plan"); if (lpl) lpl.textContent = ti("loadingPlan");
      const un = document.getElementById("user-name"); if (un && (!un.textContent || un.textContent.includes("Loading") || un.textContent.includes("Заван"))) un.textContent = ti("loading");
    }
    // --- PAC debug (proof, safe) ---
window.PAC_DI_DEBUG = {
  // повертає стани всіх створених player-ів
  states() {
    const out = {};
    for (const [exId, p] of Object.entries(players)) {
      try {
        out[exId] = {
          state: typeof p.getPlayerState === "function" ? p.getPlayerState() : null
        };
      } catch (e) {
        out[exId] = { error: String(e) };
      }
    }
    return out;
  },
  // хто зараз активний (якщо ти додав __ACTIVE_EXID__)
  active() {
    try { return __ACTIVE_EXID__ || null; } catch { return null; }
  }
};
    let __ACTIVE_EXID__ = null;
    // --- PAC: video helpers (cheap, no iframe spam) ---
const MAX_ACTIVE_PLAYERS = 4; // можна 3, якщо хочеш ще дешевше
const __playerOrder = [];     // LRU: останній використаний в кінці


function normalizeYouTubeId(input) {
  const s = String(input || "").trim();

  if (/^[a-zA-Z0-9_-]{11}$/.test(s)) return s;

  // youtu.be/<id>
  let m = s.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (m) return m[1];

  // watch?v=<id>
  m = s.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (m) return m[1];

  // embed/<id>
  m = s.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (m) return m[1];

  return null;
}

function touchPlayer(exId) {
  const i = __playerOrder.indexOf(exId);
  if (i !== -1) __playerOrder.splice(i, 1);
  __playerOrder.push(exId);
}

function enforcePlayerCap() {
  while (__playerOrder.length > MAX_ACTIVE_PLAYERS) {
    const killId = __playerOrder.shift();
    const p = players[killId];
    if (p) {
      try { p.destroy(); } catch {}
      delete players[killId];
    }
    const el = document.getElementById(`player-${killId}`);
    if (el) el.innerHTML = ""; // прибрати iframe
    const poster = document.getElementById(`poster-${killId}`);
    const ctrl   = document.getElementById(`ctrl-${killId}`);
    const logo   = document.getElementById(`logo-end-${killId}`);
    if (poster) poster.style.display = "flex";
    if (ctrl) ctrl.style.display = "none";
    if (logo) logo.style.display = "none";
  }
}

    const MD_RECS = {
        "MD": () => ti("md"),
        "MD+1": () => ti("mdp1"),
        "MD-1": () => ti("mdm1"),
        "TRAIN": () => ti("train"),
        "REST": () => ti("rest")
    };

    // YouTube API is requested only when opening a YouTube demonstration.

    function getFullDateString() {
        const d = new Date();
        const localeMap = { uk: "uk-UA", en: "en-US", de: "de-DE", es: "es-ES", ru: "ru-RU", pt: "pt-PT" };
        const locale = localeMap[diLang()] || "en-US";
        const text = new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long" }).format(d);
        return `${ti("todayPrefix")} ${text}`;
    }

    function isoLocalDate(dt) {
        const y = dt.getFullYear();
        const m = String(dt.getMonth() + 1).padStart(2, "0");
        const d = String(dt.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
    }

    function getWeekID() {
        const d = new Date();
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(d.setDate(diff));
        return isoLocalDate(monday);
    }

    function normalizeMicrocycleDays(rawMicro) {
      const raw = (rawMicro && typeof rawMicro === "object" && !Array.isArray(rawMicro)) ? rawMicro : {};
      const out = {};
      for (let idx = 0; idx < 7; idx += 1) {
        const modern = raw[`day${idx}`];
        const legacy = raw[`day${idx + 1}`]; // backward-compat: old docs used day1..day7
        const val = String(modern || legacy || "").toUpperCase().trim();
        if (!val) continue;
        out[`day${idx}`] = val;
      }
      return out;
    }
    
    // ===== Plan variants helpers (Daily Individual) =====
function buildWeekStatusesFromMicro(micro) {
  // micro: day0..day6 = TRAIN/MATCH/REST
  const activityData = {};
  for (let i = 0; i < 7; i++) {
    activityData[`activity_${i}`] = micro?.[`day${i}`] || 'TRAIN';
  }

  const statuses = [];
  for (let i = 0; i < 7; i++) {
    statuses[i] = calculateStatus(activityData, i);
  }
  return statuses;
}

function getStatusOccurrenceIndex(dayIndex, statuses, status) {
  let k = 0;
  for (let i = 0; i < dayIndex; i++) {
    if (statuses[i] === status) k++;
  }
  return k;
}

function getPlanVariant(planData, status, variantIndex) {
  const key = `status_plan_${status}`;
  const v = planData?.[key];

  // legacy object => variant 0
  if (v && !Array.isArray(v)) return (variantIndex === 0) ? v : null;

  // array variants
  if (Array.isArray(v)) return v[variantIndex] || null;

  return null;
}

    async function initAthleteView() {
        const listContainer = document.getElementById('daily-exercise-list');
        const welcomeBox = document.getElementById('athlete-welcome');
        const feedbackContainer = document.getElementById('user-feedback-container');
        const dateLabel = document.getElementById('current-date-display');
        if (dateLabel) dateLabel.textContent = getFullDateString();

        firebase.auth().onAuthStateChanged(async (user) => {
            if (!user) return;
            const dbx = window.db || firebase.firestore();
            const scope = (typeof window.pacResolveDelegatedContext === "function")
              ? await window.pacResolveDelegatedContext(user, { db: dbx })
              : {
                  allowed: true,
                  effectiveUserId: String(window.currentUserId || user.uid),
                  targetName: user.displayName || ti('athlete'),
                  backHref: "coach-dashboard.html"
                };
            if (!scope.allowed) {
              alert(ti("accessDeniedAthlete"));
              window.location.href = scope.backHref || "coach-dashboard.html";
              return;
            }
            if (typeof window.pacRenderDelegatedIndicator === "function") {
              window.pacRenderDelegatedIndicator(scope);
            }
            CURRENT_SCOPE=scope;

            const effectiveUserId = String(scope.effectiveUserId || user.uid).trim();
            const athleteLabel = String(scope.targetName || user.displayName || ti('athlete')).trim();
            const firstName = athleteLabel ? athleteLabel.split(' ')[0] : ti('athlete');
            const weekId = getWeekID();

            if (welcomeBox) {
                welcomeBox.innerHTML = `
                    <div style="margin-bottom: 20px;">
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 15px;">
                            <div id="status-pill" style="background: #d4af37; color: #000; padding: 8px 12px; border-radius: 10px; font-weight: 900; font-size: 1rem; min-width: 50px; text-align: center;">...</div>
                            <h2 style="color: #fff; margin: 0; font-size: 1.1rem; font-weight: 800; line-height: 1.3;">${ti("hello")}, ${firstName}! <br><span style="color:#666; font-size:0.9rem; font-weight:600;">${getFullDateString()}</span></h2>
                        </div>
                        <div style="background: rgba(212, 175, 55, 0.05); border-left: 3px solid #d4af37; padding: 12px 15px; border-radius: 0 10px 10px 0;">
                             <p id="advice-text" style="margin: 0; font-size: 0.82rem; line-height: 1.4;">
                                <span style="color:#d4af37; font-weight:900; text-transform:uppercase; font-size:0.6rem; letter-spacing:1px; display:block; margin-bottom:2px;">${ti("coachAdvice")}</span>
                                <span style="color: #fff; font-style: italic; opacity: 0.9;">${ti("loading")}</span>
                             </p>
                        </div>
                    </div>
                `;
            }

            try {
                const userDoc = await firebase.firestore().collection('users').doc(effectiveUserId).get();
                const userData = userDoc.exists ? userDoc.data() : {};
                CURRENT_SPORT_PROFILE = dailySportProfileFromType(userData?.sportType || userData?.sport || userData?.onboarding?.summary?.sport || "");
                const weekDocId = `${effectiveUserId}_${weekId}`;

// 1) спочатку пробуємо план атлета
let doc = null;

try {
  doc = await firebase.firestore()
    .collection('weekly_plans')
    .doc(weekDocId)
    .get();
} catch (e) {
  const code = String(e?.code || "");
  console.warn("weekly_plans read failed:", code, e);

  throw e; // Denied is not an absent plan; do not render a false rest day.
}

let weekData = (doc && doc.exists) ? (doc.data() || {}) : {};
if (String(weekData?.sportProfile || "").toUpperCase()) {
  const sp = String(weekData.sportProfile || "").toUpperCase();
  if (["TEAM_MD", "COURT_MD", "INDIVIDUAL_ENDURANCE"].includes(sp)) CURRENT_SPORT_PROFILE = sp;
}

// 2) якщо плану атлета немає — беремо published template (лише planData)
if (!(doc && doc.exists)) {
  const templateCoachId = String(userData.coachId || "").trim();
  const templateId = templateCoachId ? `${templateCoachId}_${weekId}` : "";
  if (templateId) {
  const tplSnap = await firebase.firestore()
    .collection('week_templates_published')
    .doc(templateId)
    .get();

  if (tplSnap.exists) {
    const tpl = tplSnap.data() || {};

    // Підтримуємо ОБИДВА формати publish:
    // A) tpl.standard / tpl.custom (рекомендовано)
    // B) tpl.planData + tpl.microcyclePreview (простий)
    const mode = tpl.mode || 'standard';
    const block = (tpl.standard && tpl[mode]) ? tpl[mode] : tpl;

weekData = {
  ...weekData,
  planData: block.planData || {},
  // New athlete: do not auto-apply template microcycle before manual choice.
  microcycle: {}
};

  }
  }
}

// 3) читаємо дані як і раніше (але тепер з fallback)
const planData = weekData.planData || {};
const micro = normalizeMicrocycleDays(weekData.microcycle || weekData.microcyclePreview || {});
window.__micro = micro;
window.__planData = planData;


// якщо mdStatus ще не порахований — постав нижче

// ✅ адаптер day0..day6 → activity_0..activity_6 (тільки для calculateStatus)
const activityData = {};
for (let i = 0; i < 7; i++) {
  activityData[`activity_${i}`] = micro[`day${i}`] || 'TRAIN';
}

const todayIdx = (new Date().getDay() === 0) ? 6 : new Date().getDay() - 1;
CURRENT_UID = effectiveUserId;
CURRENT_WEEK_ID = weekId;
CURRENT_DAY_IDX = todayIdx;

// ✅ статус рахуємо з microcycle (через activityData)
const calculatedStatus = calculateStatus(activityData, todayIdx, CURRENT_SPORT_PROFILE);
const mdStatus = userData.overrideStatus || calculatedStatus;
CURRENT_USER_DATA = userData || {};
CURRENT_DAY_STATUS = String(mdStatus || "TRAIN").toUpperCase();
// UI: статус
const statusEl = document.getElementById('status-pill');
if (statusEl) statusEl.textContent = localizeStatusCode(mdStatus);

// UI: порада тренера
const adviceEl = document.getElementById('advice-text');
const adviceSpan = adviceEl ? adviceEl.querySelector('span:last-child') : null;

if (adviceSpan) {
  if (userData.coachNote) {
    adviceSpan.replaceChildren();
    const personalLabel = document.createElement("b");
    personalLabel.style.color = "#d4af37";
    personalLabel.textContent = `${ti("personal")}:`;
    adviceSpan.append(personalLabel, document.createTextNode(` ${String(userData.coachNote)}`));
  } else {
    adviceSpan.textContent = (MD_RECS[mdStatus] || MD_RECS["TRAIN"])();
  }
}

// ✅ план беремо з planData
// ✅ правильний variant плану (як у Weekly Individual)
const weekStatuses = buildWeekStatusesFromMicro(micro);
const occ = getStatusOccurrenceIndex(todayIdx, weekStatuses, mdStatus);

let currentPlan = getPlanVariant(planData, mdStatus, occ);
CURRENT_VARIANT_KEY = mdStatus;
CURRENT_VARIANT_INDEX = occ;

// fallback якщо цей variant ще пустий
if (!currentPlan) { currentPlan = getPlanVariant(planData, "TRAIN", 0); CURRENT_VARIANT_KEY = "TRAIN"; CURRENT_VARIANT_INDEX = 0; }
if (!currentPlan) { currentPlan = getPlanVariant(planData, "MD", 0); CURRENT_VARIANT_KEY = "MD"; CURRENT_VARIANT_INDEX = 0; }
if (!currentPlan) currentPlan = { exercises: [] };
window.__dailyCurrentExercises = Array.isArray(currentPlan.exercises) ? currentPlan.exercises.slice() : [];

DONE_EXERCISES_MAP = await loadDailyProgress(effectiveUserId, weekId, todayIdx);
renderExercises(Array.isArray(currentPlan.exercises) ? currentPlan.exercises : [], listContainer);
try { await saveDailyProgress(); } catch (_) {}

                renderFeedbackForm(feedbackContainer, effectiveUserId, weekId, todayIdx);
                initDailyJournal();
            } catch (err) { console.error(err); if(window.pacShowPlanReadError)window.pacShowPlanReadError(err);else if(listContainer)listContainer.textContent=eliteUi('Не вдалося завантажити план. Перевірте доступ до акаунта та з’єднання.','Unable to load your plan. Check account access and connection.'); }
        });
    }

    function renderExercises(exercises, container) {
        if (!container) return;
        window.PACExerciseTask.ensureItems(exercises);
        stopAllExerciseCoachTimers(true);
        if (ELITE_EXEC.open) closeEliteExecutionMode();
        if (ELITE_EXEC.open) return; // A failed local save must not discard the active record.
        exerciseFlowOrder = [];
        exerciseMetaById = {};
        exerciseMetaByKey = {};
        CURRENT_TOTAL_EXERCISES = Array.isArray(exercises) ? exercises.length : 0;
        if (!exercises.length) { container.innerHTML = `<p style='color:#444;text-align:center;padding:40px;font-weight:700;'>${ti("restDay")}</p>`; return; }
        
        container.innerHTML = STAGES_LIST.map(stage => {
            const stageExs = exercises.filter(ex => ex.stage === stage);
            if (!stageExs.length) return '';
            const stageKey = stage.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
            return `
                <div style="margin-bottom:12px;">
                    <div onclick="const c = this.nextElementSibling; c.style.display = (c.style.display==='none'?'block':'none')" style="background:#0a0a0a; color:#d4af37; padding:12px 18px; border-radius:12px; cursor:pointer; display:flex; justify-content:space-between; font-weight:900; font-size:0.75rem; border:1px solid #1a1a1a; letter-spacing:1px;">
                        <span>${stageLabel(stage).toUpperCase()}</span><span>▼</span>
                    </div>
                    <div id="stage-content-${stageKey}" data-stage-content style="display:none; padding:10px 0;">
                        ${stageExs.map((ex, index) => {
                            // Reuse locally available Drill targets before resolving the shared task.
                            const runningTarget = runningTargetFromExercise(ex);
                            const speedTarget = speedTargetFromExercise(ex);
                            if (runningTarget && !ex.runningTarget) ex.runningTarget = runningTarget;
                            if (speedTarget && !ex.speedTarget) ex.speedTarget = speedTarget;
                            const cleanId = ex.videoKey ? ex.videoKey.toString().trim() : "";
                            const isDrillCanvas = isDrillExercise(ex);
                            const drillCanvasId = drillIdFromExercise(ex);
                            const exId = `v-${stageKey}-${index}`;
                            const exKey = ex.planItemId;
                            // Move an exact legacy alias once, without retaining a second counted entry.
                            if (ex.legacyProgressKey && Object.prototype.hasOwnProperty.call(DONE_EXERCISES_MAP, ex.legacyProgressKey)) {
                              if (!Object.prototype.hasOwnProperty.call(DONE_EXERCISES_MAP, exKey)) DONE_EXERCISES_MAP[exKey] = DONE_EXERCISES_MAP[ex.legacyProgressKey];
                              delete DONE_EXERCISES_MAP[ex.legacyProgressKey];
                            }
                            const isDone = !!DONE_EXERCISES_MAP[exKey];
                            const exName = resolveExerciseName(ex);
                            const exDescription = resolveExerciseDescription(ex);
                            const exRecommendation = exerciseRecommendation(ex, stage);
                            const exTechnique = exerciseTechnique(ex, stage);
                            const safeExName = escapeHtml(exName);
                            const safeExDescription = escapeHtml(exDescription);
                            const safeExRecommendation = escapeHtml(exRecommendation);
                            const safeExTechnique = escapeHtml(exTechnique);
                            const safeDescriptionLabel = escapeHtml(descriptionLabel());
                            const safeTechniqueLabel = escapeHtml(techniqueLabel());
                            const safeRecommendationLabel = escapeHtml(recommendationLabel());
                            const safeVideoId = escapeHtml(cleanId);
                            const exPrescription = resolveExercisePrescription(ex, stage);
                            const repUnitLabel = exPrescription.repsUnit === "sec" ? ti("secShort") : ti("reps");
                            const exTimer = resolveExerciseTimerConfig(ex, exPrescription, stage);
                            const task = window.PACExerciseTask.resolve(ex, { userId: CURRENT_UID, weekId: CURRENT_WEEK_ID,
                              dayIdx: CURRENT_DAY_IDX, variantKey: CURRENT_VARIANT_KEY, variantIndex: CURRENT_VARIANT_INDEX });
                            exerciseFlowOrder.push({ exId, exKey, timer: exTimer });
                            exerciseMetaById[exId] = {
                              exId,
                              exKey,
                              cleanId,
                              videoId: cleanId,
                              isDrillCanvas,
                              drillCanvasId,
                              stage,
                              exercise: ex,
                              prescription: exPrescription,
                              timer: exTimer,
                              task
                            };
                            exerciseMetaByKey[exKey] = exerciseMetaById[exId];
                            const missingTaskHtml = !task.ready ? `<div role="status" style="color:#d4af37;font-size:0.75rem">${diLang() === "uk" ? "Неповне завдання — уточніть параметри у тренера." : "Incomplete task — check the parameters with your coach."}${task.mode === "gym" ? (diLang() === "uk" ? " Час таймера орієнтовний." : " Timer duration is estimated.") : ""}</div>` : "";
                            const timerHtml = missingTaskHtml + (exTimer ? `
                                        <div style="display:flex; flex-direction:column; gap:6px; width:100%; margin-top:4px;">
                                            <button id="timer-btn-${exId}" type="button" onclick="openEliteExecutionMode('${exId}')" style="background:#171717; color:#d4af37; border:1px solid #3a2e08; border-radius:8px; padding:6px 10px; font-size:0.62rem; font-weight:900; letter-spacing:.5px; cursor:pointer;">${ti("timerStart")}</button>
                                            <div id="timer-label-${exId}" style="color:#9f9f9f; font-size:0.62rem; text-align:center; min-height:14px;">${ti("timerSet")} 1/${exTimer.sets} • ${ti("timerWork")}: ${exTimer.workSec}${ti("timerSecShort")}</div>
                                        </div>` : "");
                            return `
                            <div id="card-${exId}" class="ex-card" style="opacity:${isDone ? "0.2" : "1"}; background: linear-gradient(145deg, #070707 0%, #020202 100%); border:1px solid #111; border-radius:16px; padding:15px; margin-bottom:12px; transition: all 0.4s ease;">
                                <div style="display:flex; gap:12px; align-items:flex-start;">
                                    
                                    <div style="flex:1;">
                                        <h4 style="color:#fff; margin:0 0 4px 0; font-size:1rem; font-weight:800;">${safeExName}</h4>
                                        <p style="color:#d4af37; margin:0 8px 0 0; font-size:0.7rem; font-weight:700; text-transform:uppercase;">${escapeHtml(exPrescription.sets)} ${escapeHtml(ti("sets"))} × ${escapeHtml(exPrescription.reps)} ${escapeHtml(repUnitLabel)}</p>
                                        ${exDescription ? `<p style="color:#c8c8c8; font-size:0.73rem; margin:8px 0 0 0; line-height:1.35; border-left:2px solid #3f3f3f; padding-left:8px;"><b style="color:#d4af37;">${safeDescriptionLabel}:</b> ${safeExDescription}</p>` : ""}
                                        ${exTechnique ? `<p style="color:#cfcfcf; font-size:0.74rem; margin:8px 0 0 0; line-height:1.35; border-left:2px solid #4a4a4a; padding-left:8px;"><b style="color:#d4af37;">${safeTechniqueLabel}:</b> ${safeExTechnique}</p>` : ""}
                                        ${exRecommendation ? `<p style="color:#d7d7d7; font-size:0.72rem; margin:8px 0 0 0; line-height:1.35; border-left:2px solid #5a5a5a; padding-left:8px;"><b style="color:#d4af37;">${safeRecommendationLabel}:</b> ${safeExRecommendation}</p>` : ""}
                                    </div>

                                    <div style="width:200px; display:flex; flex-direction:column; gap:8px; align-items:center;">
                                        <div style="width:200px; aspect-ratio:${isDrillCanvas ? "3/2" : "16/9"}; border-radius:10px; overflow:hidden; border:1.5px solid #d4af37; position:relative; background:#000; isolation: isolate;">
                                            <div id="player-${exId}" style="position:absolute; inset:0; width:100%; height:100%; z-index:1; background:#000;"></div>
                                            
                                            <div id="logo-end-${exId}" onclick="replayExerciseVideo('${exId}')" style="position:absolute; inset:0; background:#000; z-index:11; display:none; align-items:center; justify-content:center; cursor:pointer;">
                                                <img src="../assets/images/AK_logo.png" style="width:70px; filter: drop-shadow(0 0 10px #d4af37);">
                                            </div>

                                            <div id="pause-${exId}" onclick="togglePlayState('${exId}')" style="position:absolute; inset:0; z-index:10; cursor:pointer; display:none; align-items:center; justify-content:center; background:#000;">
                                                <div style="position:absolute; width:38px; height:38px; background:#d4af37; border-radius:50%; display:flex; align-items:center; justify-content:center;">
                                                    <div style="width: 0; height: 0; border-top: 6px solid transparent; border-bottom: 6px solid transparent; border-left: 10px solid #000; margin-left:2px;"></div>
                                                </div>
                                            </div>
                                            <div id="ctrl-${exId}" onclick="togglePlayState('${exId}')" style="position:absolute; inset:0; z-index:8; cursor:pointer; display:none;"></div>
                                            <div style="position:absolute; inset:0; z-index:5; pointer-events:none; background: radial-gradient(circle, transparent 30%, rgba(0,0,0,0.8) 100%);"></div>
                                            ${isDrillCanvas ? drillPosterHtml(exId, drillCanvasId) : `
                                              <div id="poster-${exId}" onclick="openEliteExecutionMode('${exId}')" style="position:absolute; inset:0; background:#000; cursor:pointer; display:flex; align-items:center; justify-content:center; z-index:12;">
                                                  ${!eliteDirectVideoUrl(ex) && normalizeYouTubeId(cleanId) ? `<img loading="lazy" alt="" src="https://img.youtube.com/vi/${escapeHtml(normalizeYouTubeId(cleanId))}/mqdefault.jpg" style="width:100%; height:100%; object-fit:cover; opacity:0.5;">` : `<span style="color:#aaa;font-size:.75rem">${eliteUi("Демонстрація", "Demo")}</span>`}
                                                  <div style="position:absolute; width:35px; height:35px; background:#d4af37; border-radius:50%; display:flex; align-items:center; justify-content:center;">
                                                      <div style="width: 0; height: 0; border-top: 6px solid transparent; border-bottom: 6px solid transparent; border-left: 10px solid black; margin-left:3px;"></div>
                                                  </div>
                                              </div>`}
                                        </div>

                                        <label style="cursor:pointer; display:flex; align-items:center; gap:5px; background:#111; padding:4px 10px; border-radius:8px; border:1px solid #222; width:fit-content;">
                                            <input id="done-${exId}" type="checkbox" ${isDone ? "checked" : ""} style="accent-color:#d4af37; width:14px; height:14px;" onchange="const card = this.closest('.ex-card'); card.style.opacity = this.checked ? '0.2' : '1'; window.toggleExerciseDone('${exKey}', this.checked);">
                                            <span style="color:#666; font-size:0.6rem; font-weight:900; text-transform:uppercase;">${ti("done")}</span>
                                        </label>
                                        ${timerHtml}
                                    </div>
                                </div>
                            </div>`;
                        }).join('')}
                    </div>
                </div>`;
        }).join('');
    }

function forceMutePlayer(player) {
  if (!player) return;
  try { player.mute?.(); } catch {}
  try { player.setVolume?.(0); } catch {}
}

function isDrillExercise(ex = {}) {
  const key = String(ex.videoKey || ex.drillId || "").trim();
  return key.startsWith("drill:") || Boolean(ex.drillId) || ex.type === "drill_canvas";
}

function isGuidedDrillExercise(ex = {}) {
  if (!isDrillExercise(ex)) return false;
  const drill = ex.tacticalDrill || {};
  const object = drill.exerciseObject || {};
  const timingEngine = ex.timingEngine || object.timingEngine || drill.timingEngine || {};
  return Boolean(
    ex.coachGuided ||
    ex.guidedIntervalWorkout ||
    object.guidedIntervalWorkout ||
    timingEngine.intervalSettings ||
    ex.intervalSettings ||
    object.intervalSettings ||
    (Array.isArray(ex.timingLayers) && ex.timingLayers.length) ||
    (Array.isArray(ex.audioLayers) && ex.audioLayers.length)
  );
}

function localSavedDrillFromExercise(ex = {}) {
  const drillId = drillIdFromExercise(ex);
  if (!drillId) return null;
  try {
    const parsed = window.PACDrillLocalStorage ? window.PACDrillLocalStorage.read() : JSON.parse(localStorage.getItem("pac_imported_drill_library") || "[]");
    if (!Array.isArray(parsed)) return null;
    const cleanId = String(drillId).trim();
    return parsed.find((drill) => {
      const ids = [drill?.id, drill?.drillId, drill?.localId, drill?.exerciseObject?.drillId].map((v) => String(v || "").trim());
      return ids.includes(cleanId);
    }) || null;
  } catch {
    return null;
  }
}

function targetFromDrillCanvas(drill = {}, key) {
  if (!drill || typeof drill !== "object") return null;
  const direct = drill[key]
    || drill.timingEngine?.[key]
    || drill.exerciseStructure?.[key]
    || drill.exerciseObject?.[key]
    || drill.exerciseObject?.timingEngine?.[key]
    || null;
  if (direct && typeof direct === "object") return direct;
  const measurement = (Array.isArray(drill.measurements) ? drill.measurements : []).find((m) => m?.[key]);
  return measurement?.[key] || null;
}

function runningTargetFromExercise(ex = {}) {
  const measurements = [
    ...(Array.isArray(ex.measurements) ? ex.measurements : []),
    ...(Array.isArray(ex.tacticalDrill?.measurements) ? ex.tacticalDrill.measurements : []),
    ...(Array.isArray(ex.tacticalDrill?.exerciseObject?.measurements) ? ex.tacticalDrill.exerciseObject.measurements : [])
  ];
  const measurementTarget = measurements.find((m) => m?.runningTarget)?.runningTarget || null;
  const target = ex.runningTarget
    || ex.timingEngine?.runningTarget
    || ex.tacticalDrill?.runningTarget
    || ex.tacticalDrill?.timingEngine?.runningTarget
    || ex.tacticalDrill?.exerciseObject?.runningTarget
    || ex.tacticalDrill?.exerciseObject?.timingEngine?.runningTarget
    || measurementTarget
    || targetFromDrillCanvas(localSavedDrillFromExercise(ex), "runningTarget")
    || null;
  if (!target || typeof target !== "object") return null;
  const hasRunning = Number(target.targetDistanceM || target.targetDistanceKm || target.lapDistanceM || target.perimeterM || target.cueEverySec || 0) > 0;
  return hasRunning ? target : null;
}

function speedTargetFromExercise(ex = {}) {
  const measurements = [
    ...(Array.isArray(ex.measurements) ? ex.measurements : []),
    ...(Array.isArray(ex.tacticalDrill?.measurements) ? ex.tacticalDrill.measurements : []),
    ...(Array.isArray(ex.tacticalDrill?.exerciseObject?.measurements) ? ex.tacticalDrill.exerciseObject.measurements : [])
  ];
  const measurementTarget = measurements.find((m) => m?.speedTarget)?.speedTarget || null;
  const target = ex.speedTarget
    || ex.timingEngine?.speedTarget
    || ex.tacticalDrill?.speedTarget
    || ex.tacticalDrill?.timingEngine?.speedTarget
    || ex.tacticalDrill?.exerciseObject?.speedTarget
    || ex.tacticalDrill?.exerciseObject?.timingEngine?.speedTarget
    || measurementTarget
    || targetFromDrillCanvas(localSavedDrillFromExercise(ex), "speedTarget")
    || null;
  if (!target || typeof target !== "object") return null;
  return Number(target.targetDistanceM || target.reps || target.repDistanceM || 0) > 0 ? target : null;
}
function runningFallbackTargetFromMeta(meta = {}, setDurationSec = 0) {
  const ex = meta.exercise || {};
  const timer = timerFromDrillExercise(ex);
  const targetM = Number(
    ex.distanceMeters || ex.targetDistanceM || ex.totalDistanceM ||
    ex.tacticalDrill?.distanceMeters || ex.tacticalDrill?.targetDistanceM ||
    ex.tacticalDrill?.exerciseObject?.distanceMeters || ex.tacticalDrill?.exerciseObject?.targetDistanceM ||
    0
  );
  const workSec = Number(timer.workSec || meta.timer?.workSec || meta.prescription?.timedSeconds || setDurationSec || 0);
  return {
    targetDistanceM: targetM,
    totalWorkSec: workSec,
    cueEverySec: 0,
    source: timer.source || "daily_drill_timer"
  };
}

function isRunningDrillExercise(ex = {}) {
  if (runningTargetFromExercise(ex)) return true;
  const drill = ex.tacticalDrill || {};
  const object = drill.exerciseObject || {};
  const text = [
    ex.name, ex.title, ex.category, ex.subcategory, ex.loadType,
    drill.name, drill.title, drill.category, drill.subcategory,
    object.name, object.title, object.category, object.subcategory,
    ...(Array.isArray(ex.tags) ? ex.tags : []),
    ...(Array.isArray(drill.tags) ? drill.tags : []),
    ...(Array.isArray(object.tags) ? object.tags : [])
  ].filter(Boolean).join(" ").toLowerCase();
  return isDrillExercise(ex) && /aerobic|running|run|tempo|interval|metabolic|conditioning|hiit|high intensity/.test(text);
}

function isSpeedDrillExercise(ex = {}) {
  if (speedTargetFromExercise(ex)) return true;
  const drill = ex.tacticalDrill || {};
  const object = drill.exerciseObject || {};
  const text = [
    ex.name, ex.title, ex.category, ex.subcategory, ex.loadType,
    drill.name, drill.title, drill.category, drill.subcategory,
    object.name, object.title, object.category, object.subcategory,
    ...(Array.isArray(ex.tags) ? ex.tags : []),
    ...(Array.isArray(drill.tags) ? drill.tags : []),
    ...(Array.isArray(object.tags) ? object.tags : [])
  ].filter(Boolean).join(" ").toLowerCase();
  return isDrillExercise(ex) && /speed|sprint|accel|acceleration|decel|deceleration|agility|cod|change of direction|rsa|repeated sprint/.test(text);
}

function formatDurationClock(sec) {
  const s = Math.max(0, Math.round(Number(sec || 0)));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

function formatMetersSmart(m) {
  const n = Number(m || 0);
  if (!Number.isFinite(n) || n <= 0) return "—";
  return n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 1 : 2)} km` : `${Math.round(n)} m`;
}

function runningMetricRows(target = {}) {
  const targetM = Number(target.targetDistanceM || target.targetDistanceKm * 1000 || 0);
  const totalSec = Number(target.totalWorkSec || target.workSec || 0);
  const lapM = Number(target.lapDistanceM || 0);
  const pace = Number(target.paceSecPerKm || (targetM > 0 ? totalSec / (targetM / 1000) : 0));
  const lapSec = Number(target.lapTimeSec || (targetM > 0 && lapM > 0 ? totalSec * (lapM / targetM) : 0));
  const laps = Number(target.laps || (targetM > 0 && lapM > 0 ? targetM / lapM : 0));
  const cueSec = Number(target.cueEverySec || 0);
  const cueM = Number(target.cueDistanceM || (cueSec > 0 && targetM > 0 && totalSec > 0 ? targetM * (cueSec / totalSec) : 0));
  return {
    target: formatMetersSmart(targetM),
    total: totalSec ? formatDurationClock(totalSec) : "—",
    pace: pace ? `${formatDurationClock(pace)} / km` : "—",
    lap: lapM ? `${formatMetersSmart(lapM)} • ${lapSec ? formatDurationClock(lapSec) : "—"}` : "—",
    laps: laps ? `${laps.toFixed(laps >= 10 ? 1 : 2)} laps` : "—",
    cue: cueSec ? `${formatDurationClock(cueSec)} • ${formatMetersSmart(cueM)}` : "—",
    source: target.source === "football_zone_perimeter" || target.lapSource === "football_zone_perimeter" ? "Football Zone perimeter" : target.lapSource || target.source || ""
  };
}

function speedMetricRows(target = {}) {
  const minKmh = Number(target.minKmh || 0);
  const maxKmh = Number(target.maxKmh || 0);
  const targetM = Number(target.targetDistanceM || 0);
  const reps = Number(target.reps || 0);
  const laneDistanceM = Number(target.laneDistanceM || target.repDistanceM || 0);
  const speedDistancePerRepM = Number(target.speedDistancePerRepM || 0);
  const buildUpDistanceM = Number(target.buildUpDistanceM || 0);
  const brakeDistanceM = Number(target.brakeDistanceM || 0);
  const exposure = Number(target.targetExposureSec || target.minimumExposureSec || 0);
  const rest = Number(target.totalRestSec || 0);
  return {
    type: target.label || "Speed target",
    zone: maxKmh > minKmh ? `${roundSmart(minKmh)}-${roundSmart(maxKmh)} km/h` : `>${roundSmart(minKmh)} km/h`,
    target: formatMetersSmart(targetM),
    reps: reps && laneDistanceM ? `${reps} x ${formatMetersSmart(laneDistanceM)} lane` : "—",
    exposure: exposure ? formatDurationClock(exposure) : "—",
    rest: rest ? formatDurationClock(rest) : `Build ${formatMetersSmart(buildUpDistanceM)} • speed ${formatMetersSmart(speedDistancePerRepM)} • brake ${formatMetersSmart(brakeDistanceM)}`,
    source: target.source === "football_zone_speed_target" ? "Source: Football Zone speed target" : ""
  };
}

function roundSmart(value) {
  const n = Number(value || 0);
  return n >= 10 ? Math.round(n * 10) / 10 : Math.round(n * 100) / 100;
}

function timerFromDrillExercise(ex = {}) {
  const object = ex.tacticalDrill?.exerciseObject || {};
  const direct = ex.timer || object.timer;
  if (direct?.sets || direct?.workSec || direct?.workSeconds) {
    return {
      sets: Math.max(1, Number(direct.sets || 1) || 1),
      workSec: Math.max(1, Number(direct.workSec || direct.workSeconds || ex.duration || 30) || 30),
      restSec: Math.max(0, Number(direct.restSec || direct.restSeconds || 0) || 0),
      prepSec: Math.max(0, Number(direct.prepSec || direct.preparationSeconds || 0) || 0),
      restBetweenSets: Math.max(0, Number(direct.restBetweenSets || 0) || 0),
      rounds: Math.max(1, Number(direct.rounds || 1) || 1),
      blocks: Math.max(1, Number(direct.blocks || 1) || 1),
      source: direct.source || "drill_canvas_timer"
    };
  }

  const timingEngine = ex.timingEngine || object.timingEngine || ex.tacticalDrill?.timingEngine || {};
  const cfg = ex.intervalSettings || object.intervalSettings || timingEngine.intervalSettings || {};
  const blocks = Math.max(1, Number(cfg.sets || 1) || 1);
  const rounds = Math.max(1, Number(cfg.rounds || 1) || 1);
  return {
    sets: Math.max(1, Math.round(blocks * rounds)),
    workSec: Math.max(1, Math.round(Number(cfg.workSeconds || 0) || Number(ex.duration || timingEngine.duration || 30) || 30)),
    restSec: Math.max(0, Math.round(Number(cfg.restSeconds || 0) || 0)),
    prepSec: Math.max(0, Math.round(Number(cfg.preparationSeconds || 0) || 0)),
    restBetweenSets: Math.max(0, Math.round(Number(cfg.restBetweenSets || 0) || 0)),
    rounds,
    blocks,
    source: "drill_canvas_interval_settings"
  };
}

function drillIdFromExercise(ex = {}) {
  const key = String(ex.videoKey || "").trim();
  if (key.startsWith("drill:")) return key.slice(6);
  return String(ex.drillId || "").trim();
}

function drillPlayerUrl(drillId, autoplay = false) {
  return `drill-player.html?id=${encodeURIComponent(drillId || "")}&embed=1&preview=1&v=20260630-daily-static-preview${autoplay ? "&autoplay=1" : ""}`;
}

function isDrillVideoKey(value) {
  return String(value || "").trim().startsWith("drill:");
}

function drillPosterHtml(exId, drillId) {
  return `
    <iframe src="${drillPlayerUrl(drillId)}" title="Drill preview" loading="lazy" style="position:absolute; inset:0; width:100%; height:100%; border:0; opacity:1; pointer-events:none; z-index:2; background:#000;"></iframe>
    <div id="poster-${exId}" onclick="openEliteExecutionMode('${exId}')" style="position:absolute; inset:0; background:linear-gradient(180deg, rgba(0,0,0,.08), rgba(0,0,0,.42)); cursor:pointer; display:flex; flex-direction:column; align-items:center; justify-content:center; z-index:12;">
      <div style="position:absolute; left:8px; top:7px; color:#d4af37; background:rgba(0,0,0,.62); border:1px solid rgba(212,175,55,.45); border-radius:999px; padding:3px 7px; font-size:.48rem; font-weight:950; letter-spacing:.7px; text-transform:uppercase;">Drill preview</div>
      <div style="width:36px; height:36px; border-radius:50%; background:#d4af37; display:flex; align-items:center; justify-content:center; box-shadow:0 0 20px rgba(212,175,55,.42);">
        <div style="width:0; height:0; border-top:7px solid transparent; border-bottom:7px solid transparent; border-left:11px solid #000; margin-left:3px;"></div>
      </div>
    </div>`;
}

window.startExerciseVideo = function(videoInput, exId) {
  if (!window.YT) return;

  const videoId = normalizeYouTubeId(videoInput);
  if (!videoId) {
    console.error("[PAC] Invalid video id input:", videoInput, "exId:", exId);
    return;
  }

  const poster = document.getElementById(`poster-${exId}`);
  const pauseO = document.getElementById(`pause-${exId}`);
  const ctrl   = document.getElementById(`ctrl-${exId}`);
  const logo   = document.getElementById(`logo-end-${exId}`);
  const host   = document.getElementById(`player-${exId}`);

  if (!host) {
    console.error("[PAC] player host not found:", `player-${exId}`);
    return;
  }

  playerVideoIds[exId] = videoId;

  // Keep poster until the player is really in PLAYING state,
  // so user does not see YouTube loading/splash screen.
  if (poster) poster.style.display = "flex";
  if (pauseO) pauseO.style.display = "none";
  if (ctrl) ctrl.style.display = "none";
  if (logo) logo.style.display = "none";
// ⏸️ auto-pause previous active video (UX + no parallel audio)
if (__ACTIVE_EXID__ && __ACTIVE_EXID__ !== exId) {
  const prev = players[__ACTIVE_EXID__];
  if (prev && typeof prev.pauseVideo === "function") {
    try { prev.pauseVideo(); } catch {}
  }
}
__ACTIVE_EXID__ = exId;
  // ✅ Якщо player уже є — НЕ створюємо iframe заново
  const existing = players[exId];
  if (existing && typeof existing.getPlayerState === "function") {
    touchPlayer(exId);
    enforcePlayerCap();

    try {
      forceMutePlayer(existing);
      const st = existing.getPlayerState();
      if (st === 0 && typeof existing.seekTo === "function") {
        existing.seekTo(0, true);
      }
      existing.playVideo?.();
      return;
    } catch (e) {
      console.warn("[PAC] existing player restart failed -> recreate player once", e);
      try { existing.destroy(); } catch {}
      delete players[exId];
      host.innerHTML = "";
      // continue below and recreate player
    }
  }

  if (!players[exId]) {
    // важливо: перед створенням прибираємо сміття в контейнері
    host.innerHTML = "";

    const ytOrigin = window.location.origin || `${window.location.protocol}//${window.location.host}`;
    players[exId] = new YT.Player(`player-${exId}`, {
      width: "100%",
      height: "100%",
      videoId,
      playerVars: {
        enablejsapi: 1,
        origin: ytOrigin,
        autoplay: 1,
        controls: 0,
        modestbranding: 1,
        rel: 0,
        mute: 1,
        playsinline: 1,
        iv_load_policy: 3,
        fs: 0,
        disablekb: 1
      },
      events: {
        onReady: (e) => {
          try {
            const iframe = e?.target?.getIframe?.();
            if (iframe) {
              iframe.style.width = "100%";
              iframe.style.height = "100%";
              iframe.style.border = "0";
              iframe.style.pointerEvents = "none";
            }
          } catch {}
          forceMutePlayer(e?.target);
        },
        onStateChange: (e) => {
          if (e.data === 1) {
            forceMutePlayer(e?.target);
            if (poster) poster.style.display = "none";
            if (pauseO) pauseO.style.display = "none";
            if (ctrl) ctrl.style.display = "block";
            if (logo) logo.style.display = "none";
          }
          // BUFFERING: keep our overlay visible to hide YouTube screen while resuming.
          if (e.data === 3) {
            if (poster) poster.style.display = "none";
            if (pauseO) pauseO.style.display = "flex";
            if (ctrl) ctrl.style.display = "block";
            if (logo) logo.style.display = "none";
          }
          if (e.data === 2) {
            if (pauseO) pauseO.style.display = "flex";
            if (ctrl) ctrl.style.display = "block";
            if (logo) logo.style.display = "none";
          }
          if (e.data === 0 && logo) {
            if (ctrl) ctrl.style.display = "none";
            if (pauseO) pauseO.style.display = "none";
            logo.style.display = "flex";
          }
        }
      }
    });

    touchPlayer(exId);
    enforcePlayerCap();
  }
};

window.replayExerciseVideo = function(exId) {
  const p = players[exId];
  const logo = document.getElementById(`logo-end-${exId}`);
  const pauseO = document.getElementById(`pause-${exId}`);
  const ctrl = document.getElementById(`ctrl-${exId}`);
  if (logo) logo.style.display = "none";
  if (pauseO) pauseO.style.display = "none";
  if (ctrl) ctrl.style.display = "block";

  try {
    if (p && typeof p.seekTo === "function") {
      p.seekTo(0, true);
      forceMutePlayer(p);
      p.playVideo?.();
      touchPlayer(exId);
      __ACTIVE_EXID__ = exId;
      return;
    }
  } catch (e) {
    console.warn("[PAC] replay error:", e);
  }

  const remembered = playerVideoIds[exId];
  if (remembered) startExerciseVideo(remembered, exId);
};

window.togglePlayState = function(exId) {
  const p = players[exId];
  const pauseO = document.getElementById(`pause-${exId}`);
  if (!p || typeof p.getPlayerState !== "function") return;

  try {
    if (p.getPlayerState() === 1) {
      p.pauseVideo();
      if (pauseO) pauseO.style.display = "flex";
    } else {
      // keep overlay until onStateChange -> PLAYING
      if (pauseO) pauseO.style.display = "flex";
      forceMutePlayer(p);
      p.playVideo();
      __ACTIVE_EXID__ = exId;
    }
    touchPlayer(exId);
  } catch (e) {
    console.warn("[PAC] togglePlayState error:", e);
  }
};

    function renderFeedbackForm(container, uid, weekId, dayIdx) {
        if (!container) return;
        selectedRPE = 0;
        selectedStars = 0;
        const doneCount = Object.values(DONE_EXERCISES_MAP || {}).filter(Boolean).length;
        const totalCount = Math.max(0, Number(CURRENT_TOTAL_EXERCISES) || 0);
        const daySummary = buildCurrentDayMinutesSummary();
        const focusRows = Object.entries(daySummary.focusMinutes || {})
          .sort((a, b) => (Number(b[1]) || 0) - (Number(a[1]) || 0))
          .slice(0, 3);

        container.innerHTML = `
            <div class="di-feedback-card">
                <div class="di-feedback-box">
                    <p class="di-feedback-head">${ti("daySummaryTitle")}</p>
                    <div class="di-summary-content">
                      <div style="display:flex;justify-content:space-between;color:#f3f3f3;font-weight:800;">
                        <span>${ti("daySummaryDone")}</span>
                        <span>${doneCount} / ${totalCount > 0 ? totalCount : "—"}</span>
                      </div>
                      <div style="display:flex;justify-content:space-between;color:#d8d8d8;">
                        <span>${ti("daySummaryMinutes")}</span>
                        <span>${Math.round(Number(daySummary.totalMinutes || 0))} ${ti("weeklyMinUnit")}</span>
                      </div>
                      <div style="margin-top:3px;color:#a7a7a7;font-size:0.72rem;text-transform:uppercase;letter-spacing:0.5px;">${ti("daySummaryFocus")}</div>
                      ${focusRows.length ? focusRows.map(([kind, val]) => `
                        <div style="display:flex;justify-content:space-between;color:#d3d3d3;">
                          <span>${focusKindLabel(kind)}</span>
                          <span>${Math.round(Number(val) || 0)} ${ti("weeklyMinUnit")}</span>
                        </div>
                      `).join("") : `<span style="color:#9b9b9b;">${ti("daySummaryEmpty")}</span>`}
                    </div>
                </div>

                <div class="di-feedback-box">
                    <div class="di-feedback-row">
                      <p class="di-feedback-head">${ti("rpeTitle")}</p>
                      <span id="di-rpe-value" class="di-rpe-value">0 / 10</span>
                    </div>
                    <div class="di-rpe-group" id="di-rpe-group">
                      ${[10,9,8,7,6,5,4,3,2,1].map(n => `
                        <input type="radio" id="di-rpe-${n}" name="di-rpe" value="${n}" onclick="setRPE(${n})">
                        <label for="di-rpe-${n}" data-rpe="${n}" onclick="setRPE(${n})"></label>
                      `).join("")}
                    </div>
                </div>

                <div class="di-feedback-box">
                    <div class="di-feedback-row">
                      <p class="di-feedback-head">${ti("ratingTitle")}</p>
                      <span id="di-stars-value" class="di-stars-value">0 / 5</span>
                    </div>
                    <div id="di-stars-group" class="di-stars-group">
                        ${[1,2,3,4,5].map(n => `<button type="button" data-star="${n}" onclick="setStars(${n})" class="di-star-btn">★</button>`).join('')}
                    </div>
                </div>

                <label style="color:#ccc">${eliteUi("Фактична тривалість усього тренування, хв","Actual total session duration, min")}<input id="di-session-duration" type="number" min="1" max="1440" required class="di-comment-input" inputmode="decimal"></label>
                <div class="di-feedback-actions">
                    <input id="coach-comment" class="di-comment-input" aria-label="${eliteUi('Коментар тренеру','Comment for your coach')}" placeholder="${ti("commentPlaceholder")}">
                    <button onclick="submitTrainingReport('${uid}', '${weekId}', ${dayIdx})" id="save-btn" class="di-save-btn">OK</button>
                </div>
            </div>
            <style>
                .di-feedback-card{
                  background:#0a0a0a;border:1px solid #1a1a1a;padding:15px;border-radius:15px;margin-top:20px;display:flex;flex-direction:column;gap:10px;
                }
                .di-feedback-box{
                  background:#000;padding:10px;border-radius:12px;border:1px solid #111;
                }
                .di-feedback-head{
                  color:#d4af37;font-size:0.55rem;text-transform:uppercase;font-weight:900;margin:0 0 8px 0;letter-spacing:0.5px;
                }
                .di-feedback-row{
                  display:flex;align-items:center;justify-content:space-between;gap:10px;
                }
                .di-summary-content{display:flex;flex-direction:column;gap:6px;color:#bdbdbd;font-size:0.78rem;}
                .di-rpe-group{
                  display:flex;flex-direction:row-reverse;justify-content:flex-end;align-items:flex-start;flex-wrap:wrap;
                  background:#0f0f0f;border:1px solid #1f1f1f;border-radius:10px;padding:7px;
                }
                .di-rpe-group input[type="radio"]{display:none;}
                .di-rpe-group label{
                  cursor:pointer;font-size:1.3rem;width:10%;text-align:center;color:#456545;position:relative;transition:.2s;
                }
                .di-rpe-group label::before{content:'⚡';display:block;}
                .di-rpe-group label::after{
                  content: attr(data-rpe);position:absolute;top:-13px;left:50%;transform:translateX(-50%);
                  font-size:.58rem;font-weight:900;color:#727272;
                }
                .di-rpe-group input[value="1"]:checked ~ label,
                .di-rpe-group input[value="2"]:checked ~ label,
                .di-rpe-group input[value="3"]:checked ~ label,
                .di-rpe-group input[value="4"]:checked ~ label,
                .di-rpe-group input[value="5"]:checked ~ label{ color:#5cb85c; }
                .di-rpe-group input[value="1"]:checked ~ label::after,
                .di-rpe-group input[value="2"]:checked ~ label::after,
                .di-rpe-group input[value="3"]:checked ~ label::after,
                .di-rpe-group input[value="4"]:checked ~ label::after,
                .di-rpe-group input[value="5"]:checked ~ label::after{ color:#5cb85c; }
                .di-rpe-group input[value="6"]:checked ~ label,
                .di-rpe-group input[value="7"]:checked ~ label,
                .di-rpe-group input[value="8"]:checked ~ label{ color:#f0ad4e; }
                .di-rpe-group input[value="6"]:checked ~ label::after,
                .di-rpe-group input[value="7"]:checked ~ label::after,
                .di-rpe-group input[value="8"]:checked ~ label::after{ color:#f0ad4e; }
                .di-rpe-group input[value="9"]:checked ~ label,
                .di-rpe-group input[value="10"]:checked ~ label{ color:#d9534f; }
                .di-rpe-group input[value="9"]:checked ~ label::after,
                .di-rpe-group input[value="10"]:checked ~ label::after{ color:#d9534f; }
                .di-rpe-group input:checked + label{ transform:scale(1.14); text-shadow:0 0 6px currentColor; }
                .di-rpe-group label:hover{ color:#7ad37a; }
                .di-rpe-group label:hover::after{ color:#7ad37a; }
                .di-rpe-group input:checked ~ label:hover,
                .di-rpe-group input:checked ~ label:hover::after{ color:inherit; }
                .di-rpe-value{
                  color:#d9d9d9;font-size:0.72rem;font-weight:800;background:#0f0f0f;border:1px solid #1f1f1f;border-radius:8px;padding:4px 8px;
                }

                .di-stars-group{display:flex;justify-content:center;gap:8px;flex-wrap:wrap;}
                .di-star-btn{
                  border:1px solid #2b2b2b;background:#0f0f0f;color:#343434;border-radius:10px;padding:6px 9px;
                  cursor:pointer;font-size:1.45rem;line-height:1;transition:.2s;
                }
                .di-star-btn:hover{ color:#e9c54a; border-color:#6f5a21; }
                .di-star-btn.active{ color:#ffcc00; border-color:#7a5f00; box-shadow:0 0 8px rgba(255,204,0,.45); }
                .di-stars-value{
                  color:#d9d9d9;font-size:0.72rem;font-weight:800;background:#0f0f0f;border:1px solid #1f1f1f;border-radius:8px;padding:4px 8px;
                }

                .di-feedback-actions{display:flex;gap:8px;margin-top:5px;}
                .di-comment-input{
                  flex:1;background:#000;border:1px solid #222;color:#fff;padding:10px;border-radius:10px;font-size:.82rem;outline:none;
                }
                .di-comment-input:focus{border-color:#d4af37;}
                .di-save-btn{
                  background:#d4af37;color:#000;border:0;padding:0 15px;border-radius:10px;font-weight:900;text-transform:uppercase;
                  cursor:pointer;font-size:.68rem;min-width:70px;
                }
                .di-save-btn:disabled{opacity:0.7;cursor:default;}
                @media (max-width:560px){
                  .di-feedback-actions{flex-direction:column;}
                  .di-save-btn{width:100%;height:40px;}
                }
            </style>
        `;
    }

    window.setRPE = (val) => {
        selectedRPE = Number(val) || 0;
        const picked = document.getElementById(`di-rpe-${selectedRPE}`);
        if (picked) picked.checked = true;
        const valEl = document.getElementById("di-rpe-value");
        if (valEl) valEl.textContent = `${selectedRPE} / 10`;
    };

    window.setStars = (val) => {
        selectedStars = Number(val) || 0;
        const stars = Array.from(document.querySelectorAll('#di-stars-group .di-star-btn'));
        stars.forEach((el) => {
          const n = Number(el.getAttribute('data-star') || 0);
          el.classList.toggle('active', n <= selectedStars);
        });
        const valEl = document.getElementById('di-stars-value');
        if (valEl) valEl.textContent = `${selectedStars} / 5`;
    };

    window.submitTrainingReport = async (uid, weekId, dayIdx) => {
        if (selectedRPE === 0) { alert(ti("chooseRpe")); return; }
        if(!document.getElementById('di-session-duration')?.reportValidity())return;
        const btn = document.getElementById('save-btn');
        if (!btn) return;
        btn.disabled = true;
        btn.innerText = "...";
        try {
            const duration=Number(document.getElementById('di-session-duration').value);
            if(!(duration>0&&duration<=1440))throw Error(eliteUi("Вкажи фактичну тривалість тренування.","Enter actual session duration."));
            const client=dailyJournalClient();if(!client)throw Error('AUTH_REQUIRED');
            const now=new Date(),date=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
            await client.feedback({mutationId:crypto.randomUUID(),date,timezone:Intl.DateTimeFormat().resolvedOptions().timeZone,duration,rpe:selectedRPE,stars:selectedStars,
              comment:document.getElementById('coach-comment').value,context:{weekId,dayIdx}});
            btn.style.background = "#2ecc71"; btn.innerText = "✓";
            setTimeout(() => { btn.style.background = "#d4af37"; btn.innerText = "OK"; btn.disabled = false; }, 3000);
        } catch (e) { btn.innerText = "!"; btn.disabled = false; btn.title=e.message; }
    };

    function calculateStatus(data, todayIdx, sportProfile = CURRENT_SPORT_PROFILE) {
        if (data[`activity_${todayIdx}`] === 'REST') return 'REST';
        if (data[`activity_${todayIdx}`] === 'MATCH') return 'MD';
        let matches = [];
        for (let i = 0; i < 7; i++) if (data[`activity_${i}`] === 'MATCH') matches.push(i);
        if (!matches.length) return 'TRAIN';
        let min = 100, res = 'TRAIN';
        matches.forEach(m => {
            [-7, 0, 7].forEach(o => {
                let d = todayIdx - (m + o);
                const candidate = dailyStatusByDiff(d, sportProfile);
                if (candidate && Math.abs(d) < Math.abs(min)) {
                    min = d; res = candidate;
                }
            });
        });
        return res;
    }

    function getDateIdFromDate(dateObj) {
      const d = dateObj instanceof Date ? dateObj : new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    }

    function progressDocId(uid, weekId, dayIdx) {
      return `${uid}_${weekId}_${dayIdx}`;
    }

    async function loadDailyProgress(uid, weekId, dayIdx) {
      try {
        const ref = firebase.firestore().collection("athlete_daily_progress").doc(progressDocId(uid, weekId, dayIdx));
        const snap = await ref.get();
        if (!snap.exists) return {};
        const data = snap.data() || {};
        return (data.doneMap && typeof data.doneMap === "object") ? data.doneMap : {};
      } catch (e) {
        console.warn("daily progress load failed:", e);
        return {};
      }
    }

    async function saveDailyProgress() {
      if (!CURRENT_UID || !CURRENT_WEEK_ID || CURRENT_DAY_IDX == null) return;
      // A coach prescribes the plan; only the athlete records their completion.
      if(window.firebase?.auth?.().currentUser?.uid!==CURRENT_UID)return;
      const doneCount = Object.keys(exerciseMetaByKey).filter(key => DONE_EXERCISES_MAP[key]).length;
      const total = Math.max(0, Number(CURRENT_TOTAL_EXERCISES) || 0);
      const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;
      const minutesSummary = buildCurrentDayMinutesSummary();

      const payload = {
        uid: CURRENT_UID,
        weekId: CURRENT_WEEK_ID,
        dayIdx: CURRENT_DAY_IDX,
        dateId: getDateIdFromDate(new Date()),
        doneMap: DONE_EXERCISES_MAP,
        doneCount,
        totalExercises: total,
        progressPct: pct,
        trainingMinutes: minutesSummary.totalMinutes,
        focusMinutes: minutesSummary.focusMinutes,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };

      await firebase.firestore().collection("athlete_daily_progress").doc(progressDocId(CURRENT_UID, CURRENT_WEEK_ID, CURRENT_DAY_IDX)).set(payload, { merge: true });
    }

    window.toggleExerciseDone = async function(exKey, isDone) {
      DONE_EXERCISES_MAP[exKey] = !!isDone;
      try {
        await saveDailyProgress();
      } catch (e) {
        console.warn("daily progress save failed:", e);
      }
    };

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

    document.addEventListener('DOMContentLoaded', () => {
        applyDailyStaticTranslations();
        initAthleteView();
        applyHashFocus();
    });

    window.addEventListener("pac:lang-changed", () => {
      applyDailyStaticTranslations();
      const dateLabel = document.getElementById("current-date-display");
      if (dateLabel) dateLabel.textContent = getFullDateString();

      const statusEl = document.getElementById("status-pill");
      if (statusEl) statusEl.textContent = localizeStatusCode(CURRENT_DAY_STATUS);

      const adviceEl = document.getElementById("advice-text");
      if (adviceEl) {
        const labelSpan = adviceEl.querySelector("span:first-child");
        if (labelSpan) labelSpan.textContent = ti("coachAdvice");
        const valueSpan = adviceEl.querySelector("span:last-child");
        if (valueSpan && !CURRENT_USER_DATA?.coachNote) {
          valueSpan.textContent = (MD_RECS[CURRENT_DAY_STATUS] || MD_RECS["TRAIN"])();
        }
      }

      const listContainer = document.getElementById("daily-exercise-list");
      if (listContainer && Array.isArray(window.__dailyCurrentExercises)) {
        renderExercises(window.__dailyCurrentExercises, listContainer);
      }

      const feedbackContainer = document.getElementById("user-feedback-container");
      if (feedbackContainer && CURRENT_UID && CURRENT_WEEK_ID && Number.isInteger(CURRENT_DAY_IDX)) {
        renderFeedbackForm(feedbackContainer, CURRENT_UID, CURRENT_WEEK_ID, CURRENT_DAY_IDX);
        renderDailyJournal().catch(()=>{});
      }
    });
})();













