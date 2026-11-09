(function() {
    const COLLECTION_NAME = 'load_season_reports';
    const db = window.db; 
    
    let dailyLoadData = [];
    let journalDocuments = [], journalRows = [], pendingManual = null;
    let distanceChart = null;
    let loadChart = null;
    let currentUserId = null;
    let isDelegatedView = false;
    let coreCache = null;
    // PAC_LOAD_SHADOW: opt-in, memory-only observation of the last existing read.
    let shadowDocuments = null;
    let shadowLegacyMetrics = null;
    let shadowResult = null;

    function runLoadSeasonShadow() {
      try {
        shadowResult = null;
        if (window.PAC_LOAD_SEASON_SHADOW_ENABLED !== true || !shadowDocuments) return;
        const normalizer = window.PACSessionNormalizer;
        if (!normalizer) {
          shadowResult = { status: "unavailable", code: "normalizer_not_loaded" };
          return;
        }
        const config = window.PAC_LOAD_SEASON_SHADOW_OPTIONS || {};
        const reportTimezone = config.reportTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
        const parts = new Intl.DateTimeFormat("en-CA", {
          timeZone: reportTimezone, year: "numeric", month: "2-digit", day: "2-digit"
        }).formatToParts(new Date());
        const part = (type) => parts.find((p) => p.type === type).value;
        const asOf = config.asOf || `${part("year")}-${part("month")}-${part("day")}`;
        // Firestore Timestamp.toJSON yields seconds/nanoseconds (supported by the
        // normalizer); Date becomes ISO. Never expose mutable live UI input to it.
        const input = JSON.parse(JSON.stringify(shadowDocuments));
        const legacySessionLoads = input.map(({ data }) => data.duration * (data.rpe || 0));
        const rows = normalizer.normalizeSessions(input);
        const normalized = normalizer.calculateACWR(rows, { asOf, reportTimezone });
        const delta = (oldValue, newValue) => Number.isFinite(oldValue) && Number.isFinite(newValue) ? newValue - oldValue : null;
        shadowResult = {
          status: "ok", comparisonVersion: "load-season-shadow:v1", asOf, reportTimezone,
          legacy: {
            sessionLoads: legacySessionLoads,
            acute7: shadowLegacyMetrics.acute, chronic: shadowLegacyMetrics.chronic, acwr: shadowLegacyMetrics.acwr,
            window: "last-record-local-noon; legacy calculateMetrics"
          },
          normalized: {
            sessionLoads: rows.map((row) => ({ value: row.sessionLoad.value,
              active: row.normalization.valid && row.status === "completed" && row.aggregationStatus !== "superseded",
              errors: row.normalization.errors.slice(), issues: row.normalization.issues.slice() })),
            acute7: normalized.acute7, chronic: normalized.chronic, acwr: normalized.acwr,
            provisional: normalized.provisional, coverage: normalized.coverage,
            quality: normalizer.getDataQuality(rows), calculationVersion: normalized.calculationVersion
          },
          delta: {
            acute7: delta(shadowLegacyMetrics.acute, normalized.acute7),
            chronic: delta(shadowLegacyMetrics.chronic, normalized.chronic),
            acwr: delta(shadowLegacyMetrics.acwr, normalized.acwr)
          }
        };
      } catch (_) {
        // Do not log error objects (they may contain document data). The legacy
        // render/form/PDF flow is already complete and never depends on shadow.
        shadowResult = { status: "error", code: "shadow_comparison_failed" };
      }
    }

    function rememberLoadSeasonShadow(documents, metrics) {
      try {
        shadowDocuments = documents;
        shadowLegacyMetrics = { acute: metrics.acute, chronic: metrics.chronic, acwr: metrics.acwr };
        runLoadSeasonShadow();
      } catch (_) {
        shadowResult = { status: "error", code: "shadow_comparison_failed" };
      }
    }

    window.PACLoadSeasonShadow = Object.freeze({
      run: runLoadSeasonShadow,
      getResult: () => window.PAC_LOAD_SEASON_SHADOW_ENABLED === true ? shadowResult : null,
      clear: () => { shadowResult = null; }
    });
    // End PAC_LOAD_SHADOW. No flag is enabled by scripts, URL or persistent storage.
    const LOAD_I18N = {
      uk: {
        title: "Load Season | ProAthleteCare",
        tagline: "Онлайн-тренінг та професійний супровід атлетів",
        loading: "Завантаження...",
        pageTitle: "Load Season: Контроль тренувального навантаження",
        formTitle: "Щоденне тренування (Session-RPE)",
        dateLabel: "Дата тренування:",
        durationLabel: "Тривалість (хвилин):",
        distanceLabel: "Кілометраж (км):",
        rpeLabel: "Суб'єктивне навантаження (RPE, 1-10):",
        submit: "Зберегти навантаження",
        riskTitle: "Контроль ризику травм (ACWR)",
        acwrIndex: "Індекс ACWR",
        exportPdf: "📄 Експорт Load Season Report (PDF)",
        exportJson: "⬇️ Експорт моїх даних (JSON)",
        deleteData: "🗑️ Видалити мої дані",
        chartMain: "Навантаження (Acute vs Chronic)",
        chartDistance: "Дистанція (км) по тижнях",
        chartAcute: "Гостре",
        chartChronic: "Хронічне",
        chartWeeklyKm: "Сума км за тиждень",
        chartStart: "Початок",
        kmLabelOk: "OK",
        kmLabelFast: "ШВИДКО ↑",
        kmLabelTooFast: "НАДТО ШВИДКО ↑",
        statusRisk: "РИЗИК ТРАВМИ",
        statusOptimal: "ОПТИМАЛЬНО",
        statusUnderload: "НЕДОВАНТАЖЕННЯ",
        noDataYet: "Ще немає даних",
        noDataAdvice: "Додайте принаймні 7–10 днів даних дистанції.",
        noCompareWeek: "Немає тижня для порівняння.",
        kmUnderloadAdvice: "Навантаження впало >20%. Якщо це відновлення — ок. Якщо ні — вирівняйте обсяг.",
        kmOkAdvice: "Приріст до 10% на тиждень. Добра прогресія.",
        kmFastAdvice: "Приріст 10–20%. Контролюйте втому/біль і не додавайте інтенсивність цього тижня.",
        kmTooFastAdvice: "Приріст >20%. Високий ризик стрибка, зменште обсяг на 10–20% на 7–10 днів.",
        kmNeedPrevWeek: "потрібен попередній тиждень",
        exportErr: "Помилка експорту",
        deleteConfirm: "Точно видалити всі дані Load Season? Це неможливо відмінити.",
        dbMissing: "DB не ініціалізована",
        noUserId: "Немає userId",
        deleteOk: "Дані Load Season видалено.",
        deleteErr: "Помилка видалення",
        loadErr: "Помилка завантаження",
        authErr: "Помилка авторизації",
        chooseRpe: "Оберіть RPE",
        saveErr: "Помилка збереження",
        trendUp: "ЗРОСТАЄ ↑",
        trendDown: "ЗМЕНШУЄТЬСЯ ↓",
        trendFlat: "СТАБІЛЬНО →",
        pdfTitle: "Звіт про тренувальне навантаження",
        pdfCardAcwr: "ACWR (7 днів / 28 днів)",
        pdfCard28: "Навантаження за 28 днів",
        pdfTrend: "Тренд:",
        pdfReactive: "Реактивне (7 днів)",
        pdfChronic: "Хронічне (28 днів)",
        pdfTrend4: "Тренд за 4 тижні",
        pdf8w: "Кілометраж за останні 8 тижнів",
        pdfDelta: "Δ тиждень:",
        pdfLast7: "Останні 7 тренувань",
        pdfDate: "Дата",
        pdfKm: "км",
        pdfPrivacy: "<strong>Політика конфіденційності</strong> (GDPR / DSGVO)",
        alertNoDataTitle: "Недостатньо даних",
        alertNoDataText: "Немає достатньо записів для аналізу навантаження.",
        alertNoDataRec1: "Додайте дані тренувань, щоб сформувати звіт.",
        alertLowTitle: "Контрольоване навантаження",
        alertLowText: "Навантаження у комфортній зоні. Продовжуйте планову роботу.",
        alertLowRec1: "Підтримувати стабільний тижневий обсяг",
        alertLowRec2: "Контролювати пікові сесії",
        alertLowRec3: "Додати 1 день відновлення за потреби",
        alertModTitle: "Зона контролю",
        alertModText: "Навантаження зростає. Потрібна корекція обсягу на найближчі 7 днів.",
        alertModRec1: "Зменшити тижневий кілометраж на 10-20%",
        alertModRec2: "Зберегти інтенсивність ключових сесій",
        alertModRec3: "Підсилити відновлення (сон/мобільність)",
        alertHighTitle: "Попередження",
        alertHighText: "Є ризик перевантаження через різке зростання навантаження.",
        alertHighRec1: "Зменшити тижневий кілометраж на 15-25% на 7-10 днів",
        alertHighRec2: "Не робити 2 важких дні поспіль",
        alertHighRec3: "Додати додатковий день відновлення",
        alertHighRec4: "Моніторити самопочуття та сон",
        acwrNormal: "Норма",
        acwrOverload: "Перевантаження",
        acwrControl: "Контроль",
        acwrUnderloadWord: "Недовантаження",
        currentWeek: "Поточний",
        accessDeniedAthlete: "Немає доступу до цього атлета.",
        pdfErrorPrefix: "Помилка PDF: "
      },
      en: {
        title: "Load Season | ProAthleteCare",
        tagline: "Professional athlete support online",
        loading: "Loading...",
        pageTitle: "Load Season: Training Load Control",
        formTitle: "Daily session (Session-RPE)",
        dateLabel: "Training date:",
        durationLabel: "Duration (minutes):",
        distanceLabel: "Distance (km):",
        rpeLabel: "Perceived exertion (RPE, 1-10):",
        submit: "Save load",
        riskTitle: "Injury risk control (ACWR)",
        acwrIndex: "ACWR Index",
        exportPdf: "📄 Export Load Season Report (PDF)",
        exportJson: "⬇️ Export my data (JSON)",
        deleteData: "🗑️ Delete my data",
        chartMain: "Load (Acute vs Chronic)",
        chartDistance: "Distance (km) by weeks",
        chartAcute: "Acute",
        chartChronic: "Chronic",
        chartWeeklyKm: "Weekly km sum",
        chartStart: "Start",
        kmLabelOk: "OK",
        kmLabelFast: "FAST ↑",
        kmLabelTooFast: "TOO FAST ↑",
        statusRisk: "INJURY RISK",
        statusOptimal: "OPTIMAL",
        statusUnderload: "UNDERLOAD",
        noDataYet: "No data yet",
        noDataAdvice: "Add at least 7-10 days of distance data.",
        noCompareWeek: "No comparison week.",
        kmUnderloadAdvice: "Load dropped >20%. If planned recovery, OK. If not, stabilize volume.",
        kmOkAdvice: "Weekly increase within 10%. Good progression.",
        kmFastAdvice: "Increase 10-20%. Watch fatigue/soreness; avoid adding intensity this week.",
        kmTooFastAdvice: "Increase >20%. High spike risk. Reduce volume by 10-20% for 7-10 days.",
        kmNeedPrevWeek: "need prev week",
        exportErr: "Export error",
        deleteConfirm: "Delete all Load Season data? This cannot be undone.",
        dbMissing: "DB is not initialized",
        noUserId: "No userId",
        deleteOk: "Load Season data deleted.",
        deleteErr: "Delete error",
        loadErr: "Load error",
        authErr: "Authorization error",
        chooseRpe: "Select RPE",
        saveErr: "Save error",
        trendUp: "UP ↑",
        trendDown: "DOWN ↓",
        trendFlat: "STABLE →",
        pdfTitle: "Training load report",
        pdfCardAcwr: "ACWR (7 days / 28 days)",
        pdfCard28: "Load over 28 days",
        pdfTrend: "Trend:",
        pdfReactive: "Acute (7 days)",
        pdfChronic: "Chronic (28 days)",
        pdfTrend4: "4-week trend",
        pdf8w: "Distance over last 8 weeks",
        pdfDelta: "Δ week:",
        pdfLast7: "Last 7 sessions",
        pdfDate: "Date",
        pdfKm: "km",
        pdfPrivacy: "<strong>Privacy policy</strong> (GDPR / DSGVO)",
        alertNoDataTitle: "Not enough data",
        alertNoDataText: "Not enough records to analyze training load.",
        alertNoDataRec1: "Add training data to build the report.",
        alertLowTitle: "Controlled load",
        alertLowText: "Load is in a comfortable zone. Keep planned work.",
        alertLowRec1: "Keep weekly volume stable",
        alertLowRec2: "Control peak sessions",
        alertLowRec3: "Add one recovery day if needed",
        alertModTitle: "Control zone",
        alertModText: "Load is increasing. Adjust volume for the next 7 days.",
        alertModRec1: "Reduce weekly distance by 10-20%",
        alertModRec2: "Keep key session intensity",
        alertModRec3: "Boost recovery (sleep/mobility)",
        alertHighTitle: "Warning",
        alertHighText: "Overload risk due to sharp load increase.",
        alertHighRec1: "Reduce weekly distance by 15-25% for 7-10 days",
        alertHighRec2: "Avoid 2 hard days in a row",
        alertHighRec3: "Add an extra recovery day",
        alertHighRec4: "Monitor wellness and sleep",
        acwrNormal: "Normal",
        acwrOverload: "Overload",
        acwrControl: "Control",
        acwrUnderloadWord: "Underload",
        currentWeek: "Current",
        accessDeniedAthlete: "Access denied for this athlete.",
        pdfErrorPrefix: "PDF error: "
      }
    };

    LOAD_I18N.de = { ...LOAD_I18N.en, tagline: "Professionelle Athletenbetreuung online", pageTitle: "Load Season: Trainingsbelastung kontrollieren", formTitle: "Tägliche Einheit (Session-RPE)", dateLabel: "Trainingsdatum:", durationLabel: "Dauer (Minuten):", distanceLabel: "Distanz (km):", rpeLabel: "Subjektive Belastung (RPE, 1-10):", submit: "Belastung speichern", riskTitle: "Verletzungsrisiko-Kontrolle (ACWR)", exportPdf: "📄 Load Season Report exportieren (PDF)", exportJson: "⬇️ Meine Daten exportieren (JSON)", deleteData: "🗑️ Meine Daten löschen", chartDistance: "Distanz (km) nach Wochen", chartMain: "Belastung (Akut vs. Chronisch)", chartAcute: "Akut", chartChronic: "Chronisch", statusRisk: "VERLETZUNGSRISIKO", statusOptimal: "OPTIMAL", noDataYet: "Noch keine Daten", loadErr: "Ladefehler", authErr: "Autorisierungsfehler", chooseRpe: "RPE auswählen", saveErr: "Speicherfehler", pdfTitle: "Bericht zur Trainingsbelastung", pdfCardAcwr: "ACWR (7 Tage / 28 Tage)", pdfCard28: "Belastung über 28 Tage", pdfReactive: "Akut (7 Tage)", pdfChronic: "Chronisch (28 Tage)", pdfTrend4: "4-Wochen-Trend", pdf8w: "Distanz der letzten 8 Wochen", pdfLast7: "Letzte 7 Einheiten", pdfDate: "Datum", pdfPrivacy: "<strong>Datenschutzrichtlinie</strong> (GDPR / DSGVO)", acwrNormal: "Normal", acwrOverload: "Überlastung", acwrControl: "Kontrolle", acwrUnderloadWord: "Unterlastung", currentWeek: "Aktuell" };
    LOAD_I18N.es = { ...LOAD_I18N.en, tagline: "Acompañamiento profesional del atleta online", pageTitle: "Load Season: Control de carga de entrenamiento", formTitle: "Sesión diaria (Session-RPE)", dateLabel: "Fecha de entrenamiento:", durationLabel: "Duración (minutos):", distanceLabel: "Distancia (km):", rpeLabel: "Esfuerzo percibido (RPE, 1-10):", submit: "Guardar carga", riskTitle: "Control de riesgo de lesión (ACWR)", exportPdf: "📄 Exportar Load Season Report (PDF)", exportJson: "⬇️ Exportar mis datos (JSON)", deleteData: "🗑️ Eliminar mis datos", chartDistance: "Distancia (km) por semanas", chartMain: "Carga (Aguda vs Crónica)", chartAcute: "Aguda", chartChronic: "Crónica", statusRisk: "RIESGO DE LESIÓN", statusOptimal: "ÓPTIMO", noDataYet: "Aún no hay datos", loadErr: "Error de carga", authErr: "Error de autorización", chooseRpe: "Selecciona RPE", saveErr: "Error al guardar", pdfTitle: "Informe de carga de entrenamiento", pdfCardAcwr: "ACWR (7 días / 28 días)", pdfCard28: "Carga en 28 días", pdfReactive: "Aguda (7 días)", pdfChronic: "Crónica (28 días)", pdfTrend4: "Tendencia de 4 semanas", pdf8w: "Distancia de las últimas 8 semanas", pdfLast7: "Últimas 7 sesiones", pdfDate: "Fecha", pdfPrivacy: "<strong>Política de privacidad</strong> (GDPR / DSGVO)", acwrNormal: "Normal", acwrOverload: "Sobrecarga", acwrControl: "Control", acwrUnderloadWord: "Subcarga", currentWeek: "Actual" };
    LOAD_I18N.ru = { ...LOAD_I18N.en, tagline: "Профессиональное сопровождение атлета онлайн", pageTitle: "Load Season: Контроль тренировочной нагрузки", formTitle: "Ежедневная сессия (Session-RPE)", dateLabel: "Дата тренировки:", durationLabel: "Длительность (минуты):", distanceLabel: "Дистанция (км):", rpeLabel: "Субъективная нагрузка (RPE, 1-10):", submit: "Сохранить нагрузку", riskTitle: "Контроль риска травм (ACWR)", exportPdf: "📄 Экспорт Load Season Report (PDF)", exportJson: "⬇️ Экспорт моих данных (JSON)", deleteData: "🗑️ Удалить мои данные", chartDistance: "Дистанция (км) по неделям", chartMain: "Нагрузка (Острая vs Хроническая)", chartAcute: "Острая", chartChronic: "Хроническая", statusRisk: "РИСК ТРАВМЫ", statusOptimal: "ОПТИМАЛЬНО", noDataYet: "Пока нет данных", loadErr: "Ошибка загрузки", authErr: "Ошибка авторизации", chooseRpe: "Выберите RPE", saveErr: "Ошибка сохранения", pdfTitle: "Отчет по тренировочной нагрузке", pdfCardAcwr: "ACWR (7 дней / 28 дней)", pdfCard28: "Нагрузка за 28 дней", pdfReactive: "Острая (7 дней)", pdfChronic: "Хроническая (28 дней)", pdfTrend4: "Тренд за 4 недели", pdf8w: "Дистанция за последние 8 недель", pdfLast7: "Последние 7 сессий", pdfDate: "Дата", pdfPrivacy: "<strong>Политика конфиденциальности</strong> (GDPR / DSGVO)", acwrNormal: "Норма", acwrOverload: "Перегрузка", acwrControl: "Контроль", acwrUnderloadWord: "Недогрузка", currentWeek: "Текущая" };
    LOAD_I18N.pt = { ...LOAD_I18N.en, tagline: "Acompanhamento profissional do atleta online", pageTitle: "Load Season: Controle de carga de treino", formTitle: "Sessão diária (Session-RPE)", dateLabel: "Data do treino:", durationLabel: "Duração (minutos):", distanceLabel: "Distância (km):", rpeLabel: "Esforço percebido (RPE, 1-10):", submit: "Salvar carga", riskTitle: "Controle de risco de lesão (ACWR)", exportPdf: "📄 Exportar Load Season Report (PDF)", exportJson: "⬇️ Exportar meus dados (JSON)", deleteData: "🗑️ Excluir meus dados", chartDistance: "Distância (km) por semanas", chartMain: "Carga (Aguda vs Crônica)", chartAcute: "Aguda", chartChronic: "Crônica", statusRisk: "RISCO DE LESÃO", statusOptimal: "ÓTIMO", noDataYet: "Ainda sem dados", loadErr: "Erro de carregamento", authErr: "Erro de autorização", chooseRpe: "Selecione RPE", saveErr: "Erro ao salvar", pdfTitle: "Relatório de carga de treino", pdfCardAcwr: "ACWR (7 dias / 28 dias)", pdfCard28: "Carga em 28 dias", pdfReactive: "Aguda (7 dias)", pdfChronic: "Crônica (28 dias)", pdfTrend4: "Tendência de 4 semanas", pdf8w: "Distância das últimas 8 semanas", pdfLast7: "Últimas 7 sessões", pdfDate: "Data", pdfPrivacy: "<strong>Política de privacidade</strong> (GDPR / DSGVO)", acwrNormal: "Normal", acwrOverload: "Sobrecarga", acwrControl: "Controle", acwrUnderloadWord: "Subcarga", currentWeek: "Atual" };

    function pacLoadLang() {
      const raw = String(localStorage.getItem("pac_lang") || "").toLowerCase();
      if (raw === "ua") return "uk";
      if (LOAD_I18N[raw]) return raw;
      return "uk";
    }
    function ti(key) {
      const lang = pacLoadLang();
      return LOAD_I18N[lang]?.[key] ?? LOAD_I18N.en[key] ?? key;
    }
    function setText(id, text) {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    }
    function setHtml(id, html) {
      const el = document.getElementById(id);
      if (el) el.innerHTML = html;
    }
    function applyLoadStaticTranslations() {
      setText('load-distance-hint',pacLoadLang()==='uk'?'Необов’язково. Залиш порожнім, щоб зберегти записану GPS-дистанцію.':'Optional. Leave empty to keep the recorded GPS distance.');
      document.title = ti("title");
      setText("load-tagline", ti("tagline"));
      setText("load-page-title", ti("pageTitle"));
      setText("load-form-title", ti("formTitle"));
      setText("load-label-date", ti("dateLabel"));
      setText("load-label-duration", ti("durationLabel"));
      setText("load-label-distance", ti("distanceLabel"));
      setText("load-label-rpe", ti("rpeLabel"));
      setText("load-submit-btn", ti("submit"));
      setText("load-risk-title", ti("riskTitle"));
      setText("load-acwr-label", ti("acwrIndex"));
      setText("load-export-pdf-text", ti("exportPdf"));
      setText("load-export-json-text", ti("exportJson"));
      setText("load-delete-text", ti("deleteData"));
      setText("load-chart-main-title", ti("chartMain"));
      setText("load-chart-distance-title", ti("chartDistance"));
      setText("load-pdf-title", ti("pdfTitle"));
      setText("load-pdf-card-acwr-title", ti("pdfCardAcwr"));
      setText("load-pdf-card-28-title", ti("pdfCard28"));
      setText("load-pdf-trend-label", ti("pdfTrend"));
      setText("load-pdf-k-acute", ti("pdfReactive"));
      setText("load-pdf-k-chronic", ti("pdfChronic"));
      setText("load-pdf-k-acwr", "ACWR");
      setText("load-pdf-k-trend4", ti("pdfTrend4"));
      setText("load-pdf-8w-title", ti("pdf8w"));
      setText("load-pdf-delta-label", ti("pdfDelta"));
      setText("load-pdf-last7-title", ti("pdfLast7"));
      setText("load-pdf-head-date", ti("pdfDate"));
      setText("load-pdf-head-load", "Load");
      setText("load-pdf-head-km", ti("pdfKm"));
      setHtml("load-pdf-foot-privacy", ti("pdfPrivacy"));
      const nameEl = document.getElementById("user-name");
      if (nameEl && (!nameEl.textContent || nameEl.textContent.trim() === "" || nameEl.textContent.includes("Loading") || nameEl.textContent.includes("Заван"))) {
        nameEl.textContent = ti("loading");
      }
    }

document.addEventListener("athletecore:ready", (e) => {
  coreCache = e?.detail?.core || null;
  const L = coreCache?.breakdown?.load || null;
  if (!L) return;
  updateACWRGauge(L.acwr);
  renderCharts(L.acute7 ?? L.acute ?? 0, L.chronic ?? 0);
  renderKmWidget();

});



    const urlParams = new URLSearchParams(window.location.search);
    const viewUserId = urlParams.get('userId');
    const fromAdmin = urlParams.get("fromAdmin") === "1";
    const fromCoach = urlParams.get("fromCoach") === "1";
    const asAdmin = urlParams.get("asAdmin") === "1";

    // Константи кольорів ProAtletCare
    const GOLD = '#FFC72C';
    const ACUTE_RED = '#FF4136';   
    const CHRONIC_ORANGE = '#FF851B'; 
    const GRID_COLOR = 'rgba(255, 255, 255, 0.05)';

    document.addEventListener('DOMContentLoaded', () => {
        applyLoadStaticTranslations();
        const dateInput = document.getElementById('load-date');
        if (dateInput) dateInput.value = localLoadDate();

        window.auth.onAuthStateChanged(async (user) => {
            if (user) {
                const scope = (typeof window.pacResolveDelegatedContext === "function")
                  ? await window.pacResolveDelegatedContext(user, { db })
                  : {
                      allowed: true,
                      effectiveUserId: String(window.currentUserId || user.uid).trim(),
                      isDelegated: Boolean(viewUserId && (fromAdmin || fromCoach || asAdmin)),
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

                currentUserId = String(scope.effectiveUserId || user.uid).trim();
                isDelegatedView = !!scope.isDelegated;

                if (isDelegatedView) {
                    const submitBtn = document.querySelector('.submit-button');
                    if (submitBtn) submitBtn.style.display = 'none';
                } else {
                    const submitBtn = document.querySelector('.submit-button');
                    if (submitBtn) submitBtn.style.display = '';
                }
                await syncLoadFromFirebase(currentUserId);
                if(!isDelegatedView)retryPendingJournal();
                if (typeof window.refreshAthleteCore === "function") {
  await window.refreshAthleteCore();
}

            } else {
                const next = encodeURIComponent(`${window.location.pathname}${window.location.search}${window.location.hash}`);
                window.location.href = `./regist.html?next=${next}`;
            }
        });

        const form = document.getElementById('load-form');
        if (form) form.addEventListener('submit', handleFormSubmit);
    });

    let activeJournalClient=null;
    const journalClient = () => activeJournalClient ||= window.PACSessionJournal.createClient({db,auth:window.auth,storage:firebase.storage(),localStorage});
    function localLoadDate(date=new Date()){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;}
    async function retryPendingJournal(){
      if(isDelegatedView||!currentUserId||!window.PACSessionJournal||window.auth.currentUser?.uid!==currentUserId)return;
      const client=journalClient();if(!client.pending())return;
      try{await client.flush();window.dispatchEvent(new CustomEvent('pac:journal-synced'));}catch{/* Retain the outbox; summary records may already have reached the cloud. */}
      await syncLoadFromFirebase(currentUserId);
    }
    window.addEventListener('online',retryPendingJournal);
    function chooseLoadSessionTarget(records,date,previous,preserve){
      const candidates=records.filter(e=>e.data.date===date&&e.data.schemaVersion===2&&e.data.status!=='deleted'&&!e.data.supersededBy);
      if(preserve&&(['new',...candidates.map(e=>e.data.sessionId)]).includes(previous))return previous;
      const daily=candidates.filter(e=>e.data.sessionId===`daily-${date}`);return daily.length===1?daily[0].data.sessionId:'new';
    }
    function renderExecutionActual(host,execution){
      const uk=pacLoadLang()==='uk',payload=execution.payload||{},actual=payload.actual||{},running=payload.kind==='running';
      const heading=document.createElement('h4');heading.textContent=execution.summary?.name||payload.task?.exerciseName||'';host.append(heading);
      const table=document.createElement('table');table.style.cssText='width:100%;border-collapse:collapse;font-size:.8rem';
      const headers=running?(uk?['Серія','Робота, с','GPS, м']:['Series','Work, s','GPS, m']):(uk?['Підхід','Вага, кг','Повтори','Робота, с','Пауза: таймер / план, с']:['Set','Load, kg','Reps','Work, s','Rest: clock / plan, s']);
      const head=document.createElement('thead'),tr=document.createElement('tr');for(const text of headers){const th=document.createElement('th');th.scope='col';th.textContent=text;th.style.cssText='text-align:left;padding:6px;border-bottom:1px solid #665529';tr.append(th);}head.append(tr);table.append(head);
      const body=document.createElement('tbody'),fmt=v=>v==null?'—':String(v);
      for(const row of (running?actual.runningIntervals:actual.strengthSets)||[]){const line=document.createElement('tr'),values=running?[row.round,row.workSec,row.distanceM]:[`${row.setIndex}${row.side?' · '+row.side:''}`,row.loadKg,row.reps,row.workSec,row.rest?`${fmt(row.rest.elapsedSec)} / ${fmt(row.rest.plannedSec)}`:'—'];for(const value of values){const td=document.createElement('td');td.textContent=fmt(value);td.style.padding='6px';line.append(td);}body.append(line);}table.append(body);
      const wrap=document.createElement('div');wrap.style.overflowX='auto';wrap.append(table);host.append(wrap);
    }
    function renderSessionJournal(projection) {
      let host=document.getElementById('load-session-journal');
      if(!host){host=document.createElement('section');host.id='load-session-journal';host.style.cssText='padding:16px;color:#ddd';(document.getElementById('load-form')?.parentElement||document.body).append(host);}
      host.replaceChildren();
      const uk=pacLoadLang()==='uk',title=document.createElement('h3');title.textContent=uk?'Журнал · Daily / GPS':'Daily / GPS · Journal';host.append(title);
      if(projection.rows.some(row=>!row.loadReady)){const note=document.createElement('p');note.textContent=uk?'Для розрахунку навантаження додай фактичну тривалість заняття та RPE. Результати вправ і GPS вже є в журналі.':'Add actual session duration and RPE to calculate load. Exercise and GPS results are available below.';host.append(note);}
      for(const date of projection.overlaps){
        const line=document.createElement('p');line.textContent=`${date}: Daily + legacy — ${pacLoadLang()==='uk'?'уточни, чи це одне тренування; до уточнення не враховуються':'confirm whether these are the same session; excluded until resolved'}`;
        if(!isDelegatedView)for(const [choice,label] of [['same',uk?'Це одне тренування':'Same session'],['separate',uk?'Це різні тренування':'Separate sessions']]){const button=document.createElement('button');button.textContent=label;button.onclick=async()=>{button.disabled=true;try{await journalClient().resolveLegacy(date,choice);await syncLoadFromFirebase(currentUserId);}catch(e){button.disabled=false;alert(e.message);}};line.append(button);}host.append(line);
      }
      for(const entry of journalDocuments.slice().sort((a,b)=>b.data.date.localeCompare(a.data.date)).slice(0,60)){
        const detail=document.createElement('details'),summary=document.createElement('summary');summary.textContent=`${entry.data.date} · ${entry.data.sessionId||'legacy'}`;detail.append(summary);
        for(const row of Object.values(entry.data.executionIndex||{})){const p=document.createElement('p');p.textContent=`${row.name}: ${row.recordedCount}/${row.plannedCount??'—'} · reps ${row.repsPct??'—'}% · time ${row.timePct??'—'}% · distance ${row.distancePct??'—'}%`;detail.append(p);}
        if(entry.data.schemaVersion===2){const button=document.createElement('button');button.textContent=uk?'Фактичні підходи / серії':'Actual sets / intervals';button.onclick=async()=>{button.disabled=true;try{for(const execution of await journalClient().executions(entry.data.sessionId,currentUserId)){renderExecutionActual(detail,execution);
          if(execution.payload.route){const link=document.createElement('button');link.textContent='GPS route JSON';link.onclick=async()=>{try{const url=await firebase.storage().ref(execution.payload.route.path).getDownloadURL();window.open(url,'_blank','noopener');}catch(e){alert(e.message);}};detail.append(link);}
        }}catch(e){button.disabled=false;alert(e.message);}};detail.append(button);}host.append(detail);
      }
      const form=document.getElementById('load-form');if(form&&!isDelegatedView){let select=form.querySelector('[name="sessionTarget"]');if(!select){select=document.createElement('select');select.name='sessionTarget';select.id='load-session-target';select.style.cssText='width:100%;margin:10px 0;padding:10px';const label=document.createElement('label');label.htmlFor=select.id;label.textContent=uk?'До якого заняття додати навантаження?':'Which session should receive this load?';form.prepend(label,select);select.addEventListener('change',()=>{select.dataset.userChoice='true';});form.elements.date.addEventListener('change',()=>renderSessionJournal(window.PACSessionJournal.project(journalDocuments)));}
        const date=form.elements.date.value,previous=select.value,preserve=select.dataset.selectionDate===date&&select.dataset.userChoice==='true';
        const target=chooseLoadSessionTarget(journalDocuments,date,previous,preserve);select.replaceChildren();for(const [value,label] of [['new',uk?'Нове окреме тренування':'New separate session'],...journalDocuments.filter(e=>e.data.date===date&&e.data.schemaVersion===2&&e.data.status!=='deleted'&&!e.data.supersededBy).map(e=>[e.data.sessionId,e.data.sessionId===`daily-${date}`?(uk?'Доповнити заняття Daily / GPS':'Update Daily / GPS session'):`${uk?'Доповнити заняття':'Update session'} · ${e.data.date}`])]){const option=document.createElement('option');option.value=value;option.textContent=label;select.append(option);}select.value=target;if(select.dataset.selectionDate!==date)select.dataset.userChoice='';select.dataset.selectionDate=date;
        const pending=journalClient().pending();if(pending){const retry=document.createElement('button');retry.type='button';retry.textContent=uk?`Повторити синхронізацію (${pending})`:`Retry sync (${pending})`;retry.onclick=()=>retryPendingJournal();host.prepend(retry);}
      }
    }
    async function syncLoadFromFirebase(uid) {
        if (!db) return;
        shadowDocuments = null;
        shadowLegacyMetrics = null;
        shadowResult = null;
        try {
            const snapshot = await db.collection(COLLECTION_NAME)
                .where("userId", "==", uid)
                .get();
            if(currentUserId&&uid!==currentUserId)return;
            
            dailyLoadData = [];
            const loadedDocuments = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                dailyLoadData.push(data);
                loadedDocuments.push({ id: doc.id, data });
            });
            dailyLoadData.sort((a, b) => new Date(a.date) - new Date(b.date));
            journalDocuments=loadedDocuments;
            if(window.PACSessionJournal){const projection=window.PACSessionJournal.project(loadedDocuments);dailyLoadData=projection.knownRows;journalRows=projection.rows;renderSessionJournal(projection);}
            
            if (dailyLoadData.length === 0) {
                renderCharts(0, 0);
                updateACWRGauge(0);
                window.__pacLoadMetrics={acute:0,chronic:0,acwr:0};
                renderKmWidget();
                rememberLoadSeasonShadow(loadedDocuments, { acute: 0, chronic: 0, acwr: 0 });
                
                return;
            }

            const metrics = calculateMetrics();
            window.__pacLoadMetrics = metrics;


const coreLoad = coreCache?.breakdown?.load || null;

const acuteForUI   = Number.isFinite(coreLoad?.acute7)  ? coreLoad.acute7  : metrics.acute;
const chronicForUI = Number.isFinite(coreLoad?.chronic) ? coreLoad.chronic : metrics.chronic;
const acwrForUI    = Number.isFinite(coreLoad?.acwr)    ? coreLoad.acwr    : metrics.acwr;
// або залишити як є до приходу core

renderCharts(acuteForUI, chronicForUI);
updateACWRGauge(acwrForUI);
renderKmWidget();
rememberLoadSeasonShadow(loadedDocuments, metrics);







        } catch (e) {
            console.error(ti("loadErr") + ":", e);
        }
    }

    function calculateMetrics() {
  if (!Array.isArray(dailyLoadData) || dailyLoadData.length === 0) {
    return { acute: 0, chronic: 0, acwr: 0 };
  }

  const safeNum = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  // робимо timestamp з date-строки стабільно (без сюрпризів таймзони)
  const dateToTs = (dateStr) => {
    const t = Date.parse(String(dateStr || "").slice(0, 10) + "T12:00:00");
    return Number.isFinite(t) ? t : null;
  };

  const lastTs = Math.max(
  ...dailyLoadData
    .map(d => Date.parse(String(d.date).slice(0,10) + "T12:00:00"))
    .filter(Number.isFinite)
);
const nowTs = Number.isFinite(lastTs) ? lastTs : Date.now();

  const DAY = 86400000;
const t = todayISO();
const hasToday = dailyLoadData.some(x => String(x.date).slice(0,10) === t);

showTodayLoadBlock();

  const getAvgWeeklyLoad = (days) => {
    const cut = nowTs - days * DAY;

    let total = 0;
    for (const d of dailyLoadData) {
      const ts = dateToTs(d.date);
      if (ts == null) continue;
      if (ts >= cut) {
        const duration = safeNum(d.duration);
        const rpe = safeNum(d.rpe);
        total += duration * rpe;
      }
    }

    // same logic as AthleteCore: chronic = sum28/4, acute = sum7
    return total / (days / 7);
  };

  const acute = getAvgWeeklyLoad(7);
  const chronic = getAvgWeeklyLoad(28);

  const acwr = (Number.isFinite(chronic) && chronic > 0)
    ? (acute / chronic)
    : 0;

  // для дебагу (можеш прибрати потім)
  window.__pacLoadMetrics = { acute, chronic, acwr };

  return { acute, chronic, acwr };
}



    /**
 * Оновлює стан спідометра ACWR
 * @param {number} value - Значення ACWR (зазвичай від 0.5 до 2.0)
 */
function updateACWRGauge(value) {
    const needleGroup = document.getElementById('gauge-needle-group');
    const arcPath = document.getElementById('gauge-arc-path');
    const valDisplay = document.getElementById('acwr-value');
    const statusBadge = document.getElementById('acwr-status');

    if (!needleGroup || !arcPath || !valDisplay || !statusBadge) return;

    const numericValue = parseFloat(value) || 0;
    valDisplay.textContent = numericValue.toFixed(2);

    // 1. Розрахунок кута (від -90 до +90)
    const clampedValue = Math.min(Math.max(numericValue, 0), 2);
    const angle = (clampedValue * 90) - 90;
    
    // ВАЖЛИВО: Використовуємо rotate без translateX, бо transform-origin вже вказано в SVG
    needleGroup.style.transform = `rotate(${angle}deg)`;

    // 2. Розрахунок заповнення дуги
    const dashOffset = 251.3 - (clampedValue / 2) * 251.3;
    arcPath.style.strokeDashoffset = dashOffset;

    // 3. Кольорова логіка
    if (numericValue > 1.5) {
        arcPath.style.stroke = "#DA3E52";
        statusBadge.textContent = ti("statusRisk");
        statusBadge.style.color = "#DA3E52";
        valDisplay.style.color = "#DA3E52";
    } else if (numericValue >= 0.8) {
        arcPath.style.stroke = "#5cb85c";
        statusBadge.textContent = ti("statusOptimal");
        statusBadge.style.color = "#FFC72C";
        valDisplay.style.color = "#fff";
    } else {
        arcPath.style.stroke = "#444";
        statusBadge.textContent = ti("statusUnderload");
        statusBadge.style.color = "#888";
        valDisplay.style.color = "#888";
    }
}
window.updateACWRGauge = updateACWRGauge;

function todayISO() {
  return localLoadDate();
}

function hideTodayLoadBlock() {
  const container = document.querySelector(".form-container") 
    || document.querySelector(".form-card") 
    || document.getElementById("load-form");
  if (container) container.style.display = "none";
}

function showTodayLoadBlock() {
  const container = document.querySelector(".form-container") 
    || document.querySelector(".form-card") 
    || document.getElementById("load-form");
  if (container) container.style.display = "";
}


    function getWeekNumber(d) {
        d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
        var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    }
    function weekKeyISO(dateStr){
  const d = new Date(String(dateStr || "").slice(0,10) + "T12:00:00");
  if (isNaN(d.getTime())) return null;

  // ISO week key (year-week)
  const dt = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  dt.setUTCDate(dt.getUTCDate() + 4 - (dt.getUTCDay() || 7));
  const y = dt.getUTCFullYear();
  const yearStart = new Date(Date.UTC(y,0,1));
  const week = Math.ceil((((dt - yearStart) / 86400000) + 1) / 7);
  return `${y}-W${String(week).padStart(2,"0")}`;
}

function buildWeeklyKm(data){
  const map = new Map();
  for (const s of (Array.isArray(data) ? data : [])){
    const key = weekKeyISO(s.date);
    if (!key) continue;
    const km = Number(s.distance || 0) || 0;
    map.set(key, (map.get(key) || 0) + km);
  }
  const keys = Array.from(map.keys()).sort();
  return keys.map(k => ({ key:k, km: Math.round(map.get(k)*10)/10 }));
}

function classifyKmDelta(pct){
  if (!Number.isFinite(pct)) return { band:"unknown", label:"—", advice:ti("noCompareWeek") };

  if (pct < -0.20) return { band:"yellow", label:ti("statusUnderload"), advice:ti("kmUnderloadAdvice") };
  if (pct <= 0.10) return { band:"green", label:ti("kmLabelOk"), advice:ti("kmOkAdvice") };
  if (pct <= 0.20) return { band:"yellow", label:ti("kmLabelFast"), advice:ti("kmFastAdvice") };
  return { band:"red", label:ti("kmLabelTooFast"), advice:ti("kmTooFastAdvice") };
}

function bandToTraffic(b){
  if (b === "red") return "red";
  if (b === "yellow") return "yellow";
  if (b === "green") return "green";
  return "yellow";
}

function renderKmWidget(){
  const root = document.getElementById("kmWidget");
  if (!root) return;

  // беремо з Firestore дані (dailyLoadData) — там є distance
  const weeks = buildWeeklyKm(journalRows.length ? journalRows : dailyLoadData);
  if (!weeks.length){
    document.getElementById("kmSub").textContent = ti("noDataYet");
    document.getElementById("kmThis").textContent = "—";
    document.getElementById("kmPrev").textContent = "—";
    document.getElementById("kmDelta").textContent = "—";
    document.getElementById("kmAdvice").textContent = ti("noDataAdvice");
    const pill = document.getElementById("kmPill");
    if (pill){ pill.dataset.traffic = "yellow"; pill.textContent = "—"; }
    return;
  }

  const cur = weeks[weeks.length-1];
  const prev = weeks.length >= 2 ? weeks[weeks.length-2] : null;

  const curKm = Number(cur.km) || 0;
  const prevKm = prev ? (Number(prev.km) || 0) : null;

  let pct = null;
  if (prevKm != null && prevKm > 0){
    pct = (curKm - prevKm) / prevKm;
  }

  const cls = classifyKmDelta(pct);

  const pill = document.getElementById("kmPill");
  if (pill){
    pill.dataset.traffic = bandToTraffic(cls.band);
    pill.textContent = cls.label;
  }

  document.getElementById("kmSub").textContent =
    prev ? `${cur.key} vs ${prev.key}` : `${cur.key} (${ti("kmNeedPrevWeek")})`;

  document.getElementById("kmThis").textContent = `${curKm.toFixed(1)} km`;
  document.getElementById("kmPrev").textContent = (prevKm == null) ? "—" : `${prevKm.toFixed(1)} km`;

  const deltaTxt =
    (pct == null) ? "—" :
    `${pct >= 0 ? "+" : ""}${Math.round(pct*100)}%`;

  document.getElementById("kmDelta").textContent = deltaTxt;
  document.getElementById("kmAdvice").textContent = cls.advice;
}

    // ===========================
// EXPORT / DELETE (like Injury)
// ===========================

window.pacExportMyLoadSeasonData = function pacExportMyLoadSeasonData() {
  try {
    const data = Array.isArray(dailyLoadData) ? dailyLoadData : [];
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `load_season_data_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
  } catch (e) {
    console.error(e);
    alert(ti("exportErr") + ": " + (e?.message || e));
  }
};

window.pacDeleteMyLoadSeasonData = async function pacDeleteMyLoadSeasonData() {
  const ok = confirm(ti("deleteConfirm"));
  if (!ok) return;

  try {
    if (!db) return alert(ti("dbMissing"));
    if (!currentUserId) return alert(ti("noUserId"));

    const snap = await db.collection(COLLECTION_NAME)
      .where("userId", "==", currentUserId)
      .get();

    if(isDelegatedView||window.auth.currentUser?.uid!==currentUserId)throw Error('OWNER_MISMATCH');
    for(const parent of snap.docs){
      const children=await parent.ref.collection('executions').where('userId','==',currentUserId).get();
      for(const child of children.docs){const route=child.data().payload?.route;if(route)await firebase.storage().ref(route.path).delete().catch(e=>{if(e.code!=='storage/object-not-found')throw e;});await child.ref.delete();}
      await parent.ref.delete();
    }

    // очистка локально + перерендер
    dailyLoadData = [];
    renderCharts(0, 0);
    

    alert(ti("deleteOk"));
  } catch (e) {
    console.error(e);
    alert(ti("deleteErr") + ": " + (e?.message || e));
  }
};

    function renderCharts(finalAcute, finalChronic) {
        // Налаштування для усунення проблем зі скролом
        const commonOptions = {
            responsive: true,
            maintainAspectRatio: false, // беремо висоту контейнера, щоб графік не обрізався
            layout: { padding: { left: 6, right: 10, top: 4, bottom: 2 } },
            plugins: {
                legend: { 
                    display: true, 
                    position: 'top', 
                    labels: { color: '#ccc', font: { size: 11 }, padding: 10 } 
                }
            }
        };

        // --- 1. ГРАФІК НАВАНТАЖЕННЯ (Acute vs Chronic) ---
        const ctxL = document.getElementById('loadChart');
        if (ctxL && typeof Chart !== 'undefined') {
            if (loadChart) loadChart.destroy();
            const lastData = dailyLoadData.slice(-14);
            const labels = lastData.map(d => d.date.split('-').slice(1).join('.'));

            loadChart = new Chart(ctxL, {
                type: 'line',
                data: {
                    labels: labels.length ? labels : [ti('chartStart')],
                    datasets: [
                        {
                            label: ti('chartAcute'),
                            data: lastData.map(d => (d.duration * (d.rpe || 0))),
                            borderColor: ACUTE_RED,
                            borderWidth: 3,
                            tension: 0.15,
                            pointRadius: 4,
                            pointBackgroundColor: ACUTE_RED,
                            zIndex: 10
                        },
                        {
                            label: ti('chartChronic'),
                            data: lastData.map(() => finalChronic.toFixed(0)),
                            borderColor: CHRONIC_ORANGE,
                            borderDash: [5, 5], 
                            borderWidth: 2,
                            fill: false,
                            pointRadius: 0,
                            zIndex: 5
                        }
                    ]
                },
                options: {
                    ...commonOptions,
                    plugins: {
                        ...commonOptions.plugins,
                        tooltip: { mode: 'index', intersect: false }
                    },
                    scales: {
                        y: { grid: { color: GRID_COLOR }, ticks: { color: '#666', font: { size: 10 } } },
                        x: { offset: true, grid: { display: false }, ticks: { color: '#888', font: { size: 10 } } }
                    }
                }
            });
        }
        window.__pacUI_LoadAcuteChronic = loadChart;   // UI chart 7/28
        window.__pacUI_8w = distanceChart;             // UI 8 weeks chart

        
        // --- 2. ГРАФІК ДИСТАНЦІЇ (Групування по тижнях) ---
        const ctxD = document.getElementById('distanceChart');
        if (ctxD && typeof Chart !== 'undefined') {
            if (distanceChart) distanceChart.destroy();

            const weeklyGroups = {};
            (journalRows.length ? journalRows : dailyLoadData).forEach(d => {
                const dateObj = new Date(d.date);
                const year = dateObj.getFullYear();
                const week = getWeekNumber(dateObj);
                const key = `W${week} (${year})`;
                if (!weeklyGroups[key]) weeklyGroups[key] = 0;
                weeklyGroups[key] += Number(d.distance || 0);
            });

            const weekLabels = Object.keys(weeklyGroups).slice(-8);
            const weekSums = weekLabels.map(key => weeklyGroups[key]);

            distanceChart = new Chart(ctxD, {
                type: 'line',
                data: {
                    labels: weekLabels,
                    datasets: [{
                        label: ti('chartWeeklyKm'),
                        data: weekSums,
                        borderColor: GOLD,
                        backgroundColor: 'rgba(255, 199, 44, 0.2)',
                        fill: 'start',
                        tension: 0.4,
                        pointRadius: 5,
                        pointBackgroundColor: GOLD,
                        borderWidth: 3
                    }]
                },
                options: { 
                    ...commonOptions,
                    plugins: { 
                        ...commonOptions.plugins,
                        tooltip: { backgroundColor: '#111', titleColor: GOLD }
                    },
                    scales: {
                        y: { 
                            beginAtZero: true, 
                            grid: { color: GRID_COLOR }, 
                            ticks: { color: '#666', font: { size: 10 } } 
                        },
                        x: { offset: true, grid: { display: false }, ticks: { color: '#888', font: { size: 10 } } }
                    }
                }
            });
        }
    }

    async function handleFormSubmit(e) {
        e.preventDefault();
        if (isDelegatedView) return;
        const user = window.auth.currentUser;
        if (!user) return alert(ti("authErr"));
        const form = e.target;
        const rpeInput = form.querySelector('input[name="rpe"]:checked');
        if (!rpeInput) return alert(ti("chooseRpe"));

        const data = {
            userId: currentUserId,
            source: "manual",
            date: form.elements['date'].value,
            duration: parseInt(form.elements['duration'].value) || 0,
            distance: parseFloat(form.elements['distance'].value) || 0,
            rpe: parseInt(rpeInput.value),
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        };

        try {
            const R=window.PACSessionRepository,selected=form.elements.sessionTarget?.value||'new';
            const signature=JSON.stringify({...data,timestamp:null,selected});
            if(!pendingManual||pendingManual.signature!==signature)pendingManual={signature,sessionId:selected==='new'?R.createSessionId(()=>crypto.randomUUID()):selected,mutationId:crypto.randomUUID()};
            const command={...pendingManual},ref=db.collection(COLLECTION_NAME).doc(`${currentUserId}_${command.sessionId}`);
            await db.runTransaction(async tx=>{const old=await tx.get(ref);if(window.auth.currentUser?.uid!==currentUserId)throw Error('OWNER_MISMATCH');
              if(old.exists&&old.data().lastMutationId===command.mutationId)return;
              const metric=(value,unit)=>({value,unit,source:'manual'}),actual={duration:metric(data.duration,'min'),rpe:metric(data.rpe,'1-10')};
              if(String(form.elements.distance.value).trim())actual.distance=metric(data.distance,'km');
              const input={date:data.date,timezone:Intl.DateTimeFormat().resolvedOptions().timeZone,timePrecision:'day',status:'completed',actual},now=new Date().toISOString();
              const decision=old.exists?R.preparePatch({actorId:currentUserId,sessionId:command.sessionId,mutationId:command.mutationId,expectedRevision:old.data().revision,patch:input,now},old.data()):R.prepareCreate({actorId:currentUserId,sessionId:command.sessionId,mutationId:command.mutationId,input,now},null);
              if(decision.write)tx.set(ref,decision.document);
              const context=decision.document.context||{};
              if(command.sessionId.startsWith('daily-')&&context.weekId&&Number.isInteger(context.dayIdx))tx.set(db.collection('athlete_daily_progress').doc(`${currentUserId}_${context.weekId}_${context.dayIdx}`),{uid:currentUserId,weekId:context.weekId,dayIdx:context.dayIdx,actualSessionId:command.sessionId,actualTrainingMinutes:data.duration},{merge:true});
            });
            pendingManual=null;window.dispatchEvent(new CustomEvent('pac:journal-synced'));await syncLoadFromFirebase(currentUserId);

            
            if (typeof window.refreshAthleteCore === "function") {
  await window.refreshAthleteCore(); // перерахувати core+signals з новими даними
}

            form.reset();
            document.getElementById('load-date').value = localLoadDate();
            if(form.elements.sessionTarget)form.elements.sessionTarget.dataset.userChoice='';
            renderSessionJournal(window.PACSessionJournal.project(journalDocuments));
        } catch (err) {
            alert(ti("saveErr"));
        }
    }
    
    function pacGetAthleteNameForPdf(){
  const el = document.getElementById("user-name");
  const name = (el && el.textContent || "").trim();
  return name && name !== ti("loading") ? name : "Athlete";
}

function pacTrendLabel(dir){
  if (dir === "up") return ti("trendUp");
  if (dir === "down") return ti("trendDown");
  return ti("trendFlat");
}

function pacWeekKeyISO(dateStr){
  const d = new Date(dateStr);
  const dt = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  dt.setUTCDate(dt.getUTCDate() + 4 - (dt.getUTCDay()||7));
  const y = dt.getUTCFullYear();
  const yearStart = new Date(Date.UTC(y,0,1));
  const week = Math.ceil((((dt - yearStart)/86400000)+1)/7);
  return `${y}-W${String(week).padStart(2,"0")}`;
}

function pacBuildWeeklyKm8(data){
  const map = new Map();
  for (const s of data){
    const key = pacWeekKeyISO(s.date);
    const km = Number(s.distance || 0);

    const prev = map.get(key) || { km:0, sessions:0, days:new Set() };
    prev.km += km;
    prev.sessions += 1;
    prev.days.add(s.date);
    map.set(key, prev);
  }

  const keys = Array.from(map.keys()).sort();
  const tail = keys.slice(-8);

  return tail.map(k => {
    const it = map.get(k);
    return {
      key: k,
      km: Math.round(it.km*10)/10,
      sessions: it.sessions,
      daysWithData: it.days.size
    };
  });
}

function pacIsReliableWeek(w){
  return (w.daysWithData >= 3) || (w.sessions >= 3);
}

function pacAnalyzeLoadPdf(data){
  const sorted = [...data].sort((a,b)=> new Date(a.date)-new Date(b.date));
  if (!sorted.length){
    return { acute:0, chronic:0, acwr:0, level:"low", cls:"load-low", trend28:"flat", trend4w:"flat",
      weeks:[], weekDelta:null,
      alertTitle:ti("alertNoDataTitle"),
      alertText:ti("alertNoDataText"),
      recs:[ti("alertNoDataRec1")]
    };
  }

  const lastDate = new Date(sorted[sorted.length-1].date);

  const avgWeeklyLoad = (days) => {
    const start = new Date(lastDate);
    start.setDate(lastDate.getDate() - days);
    const period = sorted.filter(d => new Date(d.date) > start);
    const total = period.reduce((sum,d)=> sum + (Number(d.duration)||0) * (Number(d.rpe)||0), 0);
    return total / (days/7);
  };

  const acute = avgWeeklyLoad(7);
  const chronic = avgWeeklyLoad(28);
  const acwr = chronic > 0 ? (acute/chronic) : 0;

  // 28d simple trend (first vs last)
  const start28 = new Date(lastDate); start28.setDate(lastDate.getDate()-28);
  const arr28 = sorted.filter(d => new Date(d.date) > start28);
  let trend28 = "flat";
  if (arr28.length >= 2){
    const first = (Number(arr28[0].duration)||0) * (Number(arr28[0].rpe)||0);
    const last  = (Number(arr28[arr28.length-1].duration)||0) * (Number(arr28[arr28.length-1].rpe)||0);
    if (last > first) trend28 = "up";
    else if (last < first) trend28 = "down";
  }

  const weeks = pacBuildWeeklyKm8(sorted);
  const reliable = weeks.filter(pacIsReliableWeek);

  let weekDelta = null;
  if (reliable.length >= 2){
    const cur = reliable[reliable.length-1].km;
    const prev = reliable[reliable.length-2].km;
    if (prev > 0) weekDelta = (cur - prev)/prev;
  }

  let trend4w = "flat";
  if (reliable.length >= 3){
    const chunk = reliable.slice(-4);
    const first = chunk[0].km;
    const last = chunk[chunk.length-1].km;
    if (last > first) trend4w = "up";
    else if (last < first) trend4w = "down";
  }

  let level = "low";
  if (acwr >= 1.5) level = "high";
  else if (acwr >= 1.3) level = "moderate";

  const dict = {
    low: {
      cls:"load-low",
      alertTitle:ti("alertLowTitle"),
      alertText:ti("alertLowText"),
      recs:[
        ti("alertLowRec1"),
        ti("alertLowRec2"),
        ti("alertLowRec3")
      ]
    },
    moderate: {
      cls:"load-mod",
      alertTitle:ti("alertModTitle"),
      alertText:ti("alertModText"),
      recs:[
        ti("alertModRec1"),
        ti("alertModRec2"),
        ti("alertModRec3")
      ]
    },
    high: {
      cls:"load-high",
      alertTitle:ti("alertHighTitle"),
      alertText:ti("alertHighText"),
      recs:[
        ti("alertHighRec1"),
        ti("alertHighRec2"),
        ti("alertHighRec3"),
        ti("alertHighRec4")
      ]
    }
  };

  const m = (level==="moderate") ? dict.moderate : dict[level];

  return {
    acute: Math.round(acute),
    chronic: Math.round(chronic),
    acwr: Math.round(acwr*100)/100,
    level,
    cls: m.cls,
    trend28,
    trend4w,
    weeks,
    weekDelta,
    alertTitle: m.alertTitle,
    alertText: m.alertText,
    recs: m.recs
  };
}

function pacSetNeedleByACWR(acwr){
  const needle = document.getElementById("load-pdf-needle");
  if (!needle) return;
  const v = Math.max(0, Math.min(2, Number(acwr)||0));
  const angle = (v*90) - 90; // 0=>-90, 2=>+90
  needle.style.transform = `rotate(${angle}deg)`;
}

function pacRenderPdf28Chart(sorted){
  const canvas = document.getElementById("load-pdf-chart-28");
  if (!canvas || !window.Chart) return;

  if (window.__loadPdf28 instanceof Chart) window.__loadPdf28.destroy();

  const data = [...sorted].sort((a,b)=> new Date(a.date)-new Date(b.date));
  const lastDate = new Date(data[data.length-1].date);
  const start = new Date(lastDate); start.setDate(lastDate.getDate()-28);
  const arr = data.filter(d => new Date(d.date) > start);

  const labels = arr.map(x => x.date.slice(5));
  const acutePts = arr.map(x => (Number(x.duration)||0) * (Number(x.rpe)||0));

  // chronic constant line (final chronic value)
  const meta = pacAnalyzeLoadPdf(data);
  const chronicLine = arr.map(()=> meta.chronic);

  const wrap = canvas.parentElement;
  const w = wrap ? wrap.clientWidth : 360;
  const h = wrap ? wrap.clientHeight : 160;

  canvas.width = Math.floor(w*2);
  canvas.height = Math.floor(h*2);
  canvas.style.width = w+"px";
  canvas.style.height = h+"px";

  window.__loadPdf28 = new Chart(canvas, {
    type:"line",
    data:{
      labels: labels.length ? labels : ["—"],
      datasets:[
        {
          data: acutePts.length ? acutePts : [0],
          borderColor:"#E0A800",
          backgroundColor:"rgba(255,199,44,0.15)",
          borderWidth:3,
          tension:0.25,
          pointRadius:3,
          pointBackgroundColor:"#E0A800",
          fill:true
        },
        {
          data: chronicLine.length ? chronicLine : [0],
          borderColor:"#b26a00",
          borderWidth:2,
          borderDash:[5,5],
          pointRadius:0,
          fill:false
        }
      ]
    },
    options:{
      responsive:false,
      maintainAspectRatio:false,
      animation:false,
      plugins:{ legend:{ display:false }, tooltip:{ enabled:false } },
      scales:{
        y:{ ticks:{ font:{ size:9 }, color:"rgba(0,0,0,0.55)" }, grid:{ color:"rgba(0,0,0,0.08)", drawBorder:false } },
        x:{ ticks:{ font:{ size:9 }, color:"rgba(0,0,0,0.55)", maxRotation:0, autoSkip:true }, grid:{ display:false } }
      }
    }
  });
}

function pacRenderPdf8wBars(weeks){
  const canvas = document.getElementById("load-pdf-bars-8w");
  if (!canvas || !window.Chart) return;

  if (window.__loadPdfBars instanceof Chart) window.__loadPdfBars.destroy();

  const w = Array.isArray(weeks) ? weeks : [];
  const labels = w.map((x, i)=> (i===w.length-1 ? ti("currentWeek") : `W-${w.length-1-i}`));
  const values = w.map(x => Number(x.km||0));

  const colors = [];
  let prevReliable = null;

  for (let i=0;i<w.length;i++){
    const cur = w[i];
    if (!pacIsReliableWeek(cur)){
      colors.push("rgba(0,0,0,0.12)");
      continue;
    }
    if (!prevReliable){
      colors.push("rgba(46,125,50,0.70)");
      prevReliable = cur;
      continue;
    }

    const delta = prevReliable.km > 0 ? (cur.km - prevReliable.km)/prevReliable.km : 0;
    const absInc = cur.km - prevReliable.km;

    if (delta > 0.20 && absInc >= Math.max(5, 0.15*prevReliable.km)){
      colors.push("rgba(179,38,30,0.75)");
    } else if (delta > 0.10){
      colors.push("rgba(178,106,0,0.75)");
    } else {
      colors.push("rgba(46,125,50,0.70)");
    }

    prevReliable = cur;
  }

  const wrap = canvas.parentElement;
  const ww = wrap ? wrap.clientWidth : 520;
  const hh = wrap ? wrap.clientHeight : 110;

  canvas.width = Math.floor(ww*2);
  canvas.height = Math.floor(hh*2);
  canvas.style.width = ww+"px";
  canvas.style.height = hh+"px";

  window.__loadPdfBars = new Chart(canvas, {
    type:"bar",
    data:{ labels, datasets:[{ data: values, backgroundColor: colors, borderRadius: 6, borderSkipped:false }] },
    options:{
      responsive:false,
      maintainAspectRatio:false,
      animation:false,
      plugins:{ legend:{ display:false }, tooltip:{ enabled:false } },
      scales:{
        y:{ ticks:{ display:false }, grid:{ display:false }, border:{ display:false } },
        x:{ ticks:{ font:{ size:10 }, color:"rgba(0,0,0,0.55)" }, grid:{ display:false }, border:{ display:false } }
      }
    }
  });
}

function pacFillLoadPdf(meta, sorted){
  const root = document.getElementById("pdf-root");
  if (!root) return;

  root.classList.remove("load-low","load-mod","load-high");
  root.classList.add(meta.cls);

  // header info
  const a = document.getElementById("load-pdf-athlete");
  const d = document.getElementById("load-pdf-date");
  if (a) a.textContent = pacGetAthleteNameForPdf();
  if (d) d.textContent = new Date().toISOString().slice(0,10);

  // metrics
  const elAc = document.getElementById("load-pdf-acute");
  const elCh = document.getElementById("load-pdf-chronic");
  const elAw = document.getElementById("load-pdf-acwr-small");
  if (elAc) elAc.textContent = `${meta.acute}`;
  if (elCh) elCh.textContent = `${meta.chronic}`;
  if (elAw) elAw.textContent = `${meta.acwr.toFixed(2)}`;

  // trends
  const topTrend = document.getElementById("load-pdf-trend-top");
  const tr4 = document.getElementById("load-pdf-trend-4w");
  if (topTrend) topTrend.textContent = pacTrendLabel(meta.trend28);
  if (tr4) tr4.textContent = pacTrendLabel(meta.trend4w);

  // gauge
  const acwrBig = document.getElementById("load-pdf-acwr");
  const acwrStatus = document.getElementById("load-pdf-acwr-status");
  if (acwrBig) acwrBig.textContent = meta.acwr.toFixed(2);

  let st = ti("acwrNormal");
  if (meta.acwr >= 1.5) st = ti("acwrOverload");
  else if (meta.acwr >= 1.3) st = ti("acwrControl");
  else if (meta.acwr > 0 && meta.acwr < 0.8) st = ti("acwrUnderloadWord");
  if (acwrStatus) acwrStatus.textContent = st;

  pacSetNeedleByACWR(meta.acwr);

  // alert
  const t = document.getElementById("load-pdf-alert-title");
  const txt = document.getElementById("load-pdf-alert-text");
  const recs = document.getElementById("load-pdf-recs");
  if (t) t.textContent = meta.alertTitle;
  if (txt) txt.textContent = meta.alertText;
  if (recs) recs.innerHTML = (meta.recs||[]).map(x=> `<li>${x}</li>`).join("");

  // week delta
  const wd = document.getElementById("load-pdf-week-delta");
  if (wd){
    if (typeof meta.weekDelta === "number"){
      const pct = Math.round(meta.weekDelta*100);
      const sign = pct > 0 ? "+" : "";
      wd.textContent = `${sign}${pct}%`;
    } else wd.textContent = "—";
  }

  // last7 table
  const last7root = document.getElementById("load-pdf-last7");
  if (last7root){
    const last7 = [...sorted].sort((a,b)=> new Date(b.date)-new Date(a.date)).slice(0,7);
    last7root.innerHTML = last7.map(s=>{
      const load = Math.round((Number(s.duration)||0) * (Number(s.rpe)||0));
      const km = (Number(s.distance)||0).toFixed(1);
      return `
        <div class="tr">
          <div>${s.date.slice(5).split("-").reverse().join(".")}</div>
          <div>${load}</div>
          <div>${km}</div>
        </div>
      `;
    }).join("");
  }
}


window.addEventListener("pac:lang-changed", async () => {
  applyLoadStaticTranslations();
  const coreLoad = coreCache?.breakdown?.load || null;
  const metrics = window.__pacLoadMetrics || { acute: 0, chronic: 0, acwr: 0 };
  const acuteForUI   = Number.isFinite(coreLoad?.acute7)  ? coreLoad.acute7  : metrics.acute;
  const chronicForUI = Number.isFinite(coreLoad?.chronic) ? coreLoad.chronic : metrics.chronic;
  const acwrForUI    = Number.isFinite(coreLoad?.acwr)    ? coreLoad.acwr    : metrics.acwr;
  renderCharts(acuteForUI || 0, chronicForUI || 0);
  renderKmWidget();
  updateACWRGauge(acwrForUI || 0);
});
window.generateLoadSeasonReportPDF = async function generateLoadSeasonReportPDF(){
  let page = null;
  try{
    document.body.classList.add("pac-report-mode");
    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);

    page = document.getElementById("pac-load-pdf-page") ||
           document.querySelector("#pdf-root .pac-pdf-page");
    if (!page) throw new Error("PDF page not found");

    const sorted = Array.isArray(dailyLoadData) ? [...dailyLoadData] : [];
    const meta = pacAnalyzeLoadPdf(sorted);

    pacFillLoadPdf(meta, sorted);

    await new Promise(requestAnimationFrame);
    pacRenderPdf28Chart(sorted);
    pacRenderPdf8wBars(meta.weeks);

    if (document.fonts?.ready) { try{ await document.fonts.ready; }catch(_){} }
    await new Promise(r=> setTimeout(r, 220));document.getElementById("load-pdf-trend-top").textContent =
  document.getElementById("load-ui-trend-top")?.textContent?.trim() || "—";

document.getElementById("load-pdf-trend-4w").textContent =
  document.getElementById("load-ui-trend-4w")?.textContent?.trim() || "—";

    
    

    const canvas = await html2canvas(page, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
      allowTaint: true,
      logging: false,
      scrollX: 0,
      scrollY: 0,
      width: page.offsetWidth,
      height: page.offsetHeight,
      windowWidth: page.offsetWidth,
      windowHeight: page.offsetHeight
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.95);
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF("p", "mm", "a4");
    pdf.addImage(imgData, "JPEG", 0, 0, 210, 297);

    const dateStr = new Date().toISOString().slice(0,10);
    pdf.save(`Load_Season_Report_${dateStr}.pdf`);
  } catch(e){
    console.error(e);
    alert(ti("pdfErrorPrefix") + (e?.message || e));
  } finally {
    document.body.classList.remove("pac-report-mode");
  }
};






})();




