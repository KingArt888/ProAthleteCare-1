(function() {

    // ===============================
// PAC TEXTS (UA) — централізовані тексти
// ===============================
window.PAC_TEXT = {
  title: "ProAthleteCare · Щоденний Wellness-звіт",
  coachBlock: "Що це означає",
  actionBlock: "Що робити сьогодні",
  disclaimer: `
Цей wellness-звіт має виключно інформаційний характер і не є медичним висновком.
Дані обробляються відповідно до GDPR (DSGVO).
Користувач має право на доступ, виправлення та повне видалення своїх даних.
`
};



    const COLLECTION_NAME = 'wellness_reports';
    const GOLD_COLOR = 'rgb(255, 215, 0)';
    const GOLD_AREA = 'rgba(255, 215, 0, 0.4)';
    const WHITE_GRID = 'rgba(255, 255, 255, 0.3)'; 
    const TEXT_COLOR = 'rgba(255, 255, 255, 0.8)';

    const WELLNESS_FIELDS = ['sleep', 'soreness', 'mood', 'water', 'stress', 'ready'];
    const FIELD_LABELS_BY_LANG = {
        uk: { sleep: 'Сон', soreness: 'Біль', mood: 'Настрій', water: 'Гідратація', stress: 'Стрес', ready: 'Готовність' },
        en: { sleep: 'Sleep', soreness: 'Pain', mood: 'Mood', water: 'Hydration', stress: 'Stress', ready: 'Readiness' },
        de: { sleep: 'Schlaf', soreness: 'Schmerz', mood: 'Stimmung', water: 'Hydrierung', stress: 'Stress', ready: 'Bereitschaft' },
        es: { sleep: 'Sueño', soreness: 'Dolor', mood: 'Ánimo', water: 'Hidratación', stress: 'Estrés', ready: 'Preparación' },
        ru: { sleep: 'Сон', soreness: 'Боль', mood: 'Настроение', water: 'Гидратация', stress: 'Стресс', ready: 'Готовность' },
        pt: { sleep: 'Sono', soreness: 'Dor', mood: 'Humor', water: 'Hidratação', stress: 'Estresse', ready: 'Prontidão' }
    };
    function getUILang() {
      const raw = String(localStorage.getItem("pac_lang") || document.documentElement.lang || "uk").toLowerCase().slice(0, 2);
      return ["uk", "en", "de", "es", "ru", "pt"].includes(raw) ? raw : "uk";
    }
    function getFieldLabels() {
      return FIELD_LABELS_BY_LANG[getUILang()] || FIELD_LABELS_BY_LANG.uk;
    }
    const UI_COPY = {
      uk: {
        pageTitle: "Wellness Control: Моніторинг стану",
        survey: "Щоденне опитування",
        q1: "1. Якість сну (1-10, де 10 - ідеально):",
        q2: "2. М'язовий біль / втома (1-10, де 10 - сильний дискомфорт):",
        q3: "3. Настрій / рівень енергії (1-10, де 10 - відмінно):",
        q4: "4. Гідратація (1-10, де 10 - виконано ціль по воді):",
        q5: "5. Психологічний стрес (1-10, де 10 - максимальний):",
        q6: "6. Суб'єктивна готовність до тренування (1-10, де 10 - повна готовність):",
        save: "Зберегти",
        cnsTitle: "⚡ АНАЛІЗ НЕРВОВОЇ СИСТЕМИ",
        cnsRec: "RECOMMENDATION:",
        weekRec: "Рекомендація:",
        dynamics: "Індивідуальна динаміка Wellness",
        history: "📜 Історія WELLNESS (Натисніть для перегляду)",
        loading: "Завантаження історії...",
        cnsReset: "Скидання ЦНС",
        start: "Старт",
        pause: "Пауза",
        reset: "Скинути",
        sound: "Звуковий сигнал",
        weekRecEmpty: "Рекомендація: —",
        reportDate: "Дата звіту:",
        exportDailyReport: "Експорт щоденного звіту",
        exportMyData: "Експорт моїх даних (JSON)",
        deleteMyData: "Видалити мої дані",
        cnsReadyTag: "ГОТОВНІСТЬ",
        emptyHistory: "Записів немає",
        historyReady: "Готовність",
        historyReadyTag: "ГОТОВНІСТЬ",
        confirmDeleteEntry: "Видалити цей звіт?",
        deleteEntryErrorLog: "Помилка видалення:",
        readOnlyDelegated: "Режим тільки для читання: перегляд делегованого атлета.",
        pleaseWait: "Зачекай...",
        completeAllFields: "Заповни всі поля.",
        submitSuccess: "Дані успішно збережено.",
        errorWithMessage: "Помилка: {message}",
        accessDeniedAthlete: "Немає доступу до цього атлета.",
        pdfRootMissing: "PDF-контейнер не знайдено.",
        noData: "Немає даних.",
        pdfLibsMissing: "PDF бібліотеки не завантажені (html2canvas / jsPDF).",
        pdfPagesMissing: "PDF сторінки не знайдено: pac-pdf-page-1 / pac-pdf-page-2",
        noWellnessData: "Немає wellness-даних.",
        missingPdfLibs: "Відсутні html2canvas / jsPDF",
        notSignedIn: "Увійди в акаунт.",
        confirmDeleteAll: "Видалити ВСІ wellness-звіти? Це незворотно.",
        deleteAllSuccess: "Усі wellness-звіти видалено.",
        deleteFailedWithMessage: "Не вдалося видалити: {message}",
        cnsFatigue: "Втома ЦНС",
        stableShort: "Стабільно"
      },
      en: {
        pageTitle: "Wellness Control: Daily State Monitoring",
        survey: "Daily Check-in",
        q1: "1. Sleep quality (1-10, 10 = ideal):",
        q2: "2. Muscle pain / fatigue (1-10, 10 = strong discomfort):",
        q3: "3. Mood / energy (1-10, 10 = top):",
        q4: "4. Hydration (1-10, 10 = target met):",
        q5: "5. Psychological stress (1-10, 10 = maximum):",
        q6: "6. Subjective readiness to train (1-10, 10 = fully ready):",
        save: "Save",
        cnsTitle: "⚡ NERVOUS SYSTEM ANALYSIS",
        cnsRec: "RECOMMENDATION:",
        weekRec: "Recommendation:",
        dynamics: "Individual Wellness Dynamics",
        history: "📜 WELLNESS History (Click to view)",
        loading: "Loading history...",
        cnsReset: "CNS Reset",
        start: "Start",
        pause: "Pause",
        reset: "Reset",
        sound: "Sound signal",
        weekRecEmpty: "Recommendation: —",
        reportDate: "Report date:",
        exportDailyReport: "Export Daily Report",
        exportMyData: "Export my data (JSON)",
        deleteMyData: "Delete my data",
        cnsReadyTag: "READY",
        emptyHistory: "No entries",
        historyReady: "Readiness",
        historyReadyTag: "READINESS",
        confirmDeleteEntry: "Delete this report?",
        deleteEntryErrorLog: "Delete error:",
        readOnlyDelegated: "Read-only mode: viewing delegated athlete.",
        pleaseWait: "Please wait...",
        completeAllFields: "Please complete all fields.",
        submitSuccess: "Data successfully submitted.",
        errorWithMessage: "Error: {message}",
        accessDeniedAthlete: "Access denied for this athlete.",
        pdfRootMissing: "PDF root not found.",
        noData: "No data.",
        pdfLibsMissing: "PDF libraries not loaded (html2canvas / jsPDF).",
        pdfPagesMissing: "PDF pages not found: pac-pdf-page-1 / pac-pdf-page-2",
        noWellnessData: "No wellness data.",
        missingPdfLibs: "Missing html2canvas / jsPDF",
        notSignedIn: "Not signed in.",
        confirmDeleteAll: "Delete ALL your wellness reports? This cannot be undone.",
        deleteAllSuccess: "All wellness reports deleted.",
        deleteFailedWithMessage: "Delete failed: {message}",
        cnsFatigue: "CNS Fatigue",
        stableShort: "Stable"
      },
      de: {
        pageTitle: "Wellness Control: Tagesmonitoring",
        survey: "Täglicher Check-in",
        q1: "1. Schlafqualität (1-10, 10 = ideal):",
        q2: "2. Muskelschmerz / Ermüdung (1-10, 10 = starker Schmerz):",
        q3: "3. Stimmung / Energielevel (1-10, 10 = top):",
        q4: "4. Hydrierung (1-10, 10 = Ziel erreicht):",
        q5: "5. Psychischer Stress (1-10, 10 = maximal):",
        q6: "6. Subjektive Trainingsbereitschaft (1-10, 10 = voll bereit):",
        save: "Speichern",
        cnsTitle: "⚡ ANALYSE DES NERVENSYSTEMS",
        cnsRec: "EMPFEHLUNG:",
        weekRec: "Empfehlung:",
        dynamics: "Individuelle Wellness-Dynamik",
        history: "📜 WELLNESS-Verlauf (Klicken zum Öffnen)",
        loading: "Verlauf wird geladen...",
        cnsReset: "ZNS-Reset",
        start: "Start",
        pause: "Pause",
        reset: "Zurücksetzen",
        sound: "Signalton",
        weekRecEmpty: "Empfehlung: —",
        reportDate: "Berichtsdatum:",
        exportDailyReport: "Tagesbericht exportieren",
        exportMyData: "Meine Daten exportieren (JSON)",
        deleteMyData: "Meine Daten löschen",
        cnsReadyTag: "BEREITSCHAFT",
        emptyHistory: "Keine Einträge",
        historyReady: "Bereitschaft",
        historyReadyTag: "BEREITSCHAFT",
        confirmDeleteEntry: "Diesen Bericht löschen?",
        deleteEntryErrorLog: "Löschfehler:",
        readOnlyDelegated: "Nur-Lese-Modus: Delegierter Athlet wird angezeigt.",
        pleaseWait: "Bitte warten...",
        completeAllFields: "Bitte alle Felder ausfüllen.",
        submitSuccess: "Daten erfolgreich gespeichert.",
        errorWithMessage: "Fehler: {message}",
        accessDeniedAthlete: "Kein Zugriff auf diesen Athleten.",
        pdfRootMissing: "PDF-Container nicht gefunden.",
        noData: "Keine Daten.",
        pdfLibsMissing: "PDF-Bibliotheken nicht geladen (html2canvas / jsPDF).",
        pdfPagesMissing: "PDF-Seiten nicht gefunden: pac-pdf-page-1 / pac-pdf-page-2",
        noWellnessData: "Keine Wellness-Daten.",
        missingPdfLibs: "html2canvas / jsPDF fehlen",
        notSignedIn: "Nicht angemeldet.",
        confirmDeleteAll: "ALLE Wellness-Berichte löschen? Dies kann nicht rückgängig gemacht werden.",
        deleteAllSuccess: "Alle Wellness-Berichte wurden gelöscht.",
        deleteFailedWithMessage: "Löschen fehlgeschlagen: {message}",
        cnsFatigue: "ZNS-Ermüdung",
        stableShort: "Stabil"
      },
      es: {
        pageTitle: "Wellness Control: Monitoreo diario",
        survey: "Encuesta diaria",
        q1: "1. Calidad del sueño (1-10, 10 = ideal):",
        q2: "2. Dolor muscular / fatiga (1-10, 10 = fuerte):",
        q3: "3. Estado de ánimo / energía (1-10, 10 = top):",
        q4: "4. Hidratación (1-10, 10 = objetivo cumplido):",
        q5: "5. Estrés psicológico (1-10, 10 = máximo):",
        q6: "6. Preparación subjetiva para entrenar (1-10, 10 = totalmente listo):",
        save: "Guardar",
        cnsTitle: "⚡ ANÁLISIS DEL SISTEMA NERVIOSO",
        cnsRec: "RECOMENDACIÓN:",
        weekRec: "Recomendación:",
        dynamics: "Dinámica individual de Wellness",
        history: "📜 Historial WELLNESS (Haz clic para ver)",
        loading: "Cargando historial...",
        cnsReset: "Reset SNC",
        start: "Iniciar",
        pause: "Pausar",
        reset: "Restablecer",
        sound: "Señal sonora",
        weekRecEmpty: "Recomendación: —",
        reportDate: "Fecha del informe:",
        exportDailyReport: "Exportar informe diario",
        exportMyData: "Exportar mis datos (JSON)",
        deleteMyData: "Eliminar mis datos",
        cnsReadyTag: "PREPARACIÓN",
        emptyHistory: "No hay registros",
        historyReady: "Preparación",
        historyReadyTag: "PREPARACIÓN",
        confirmDeleteEntry: "¿Eliminar este informe?",
        deleteEntryErrorLog: "Error al eliminar:",
        readOnlyDelegated: "Modo de solo lectura: viendo atleta delegado.",
        pleaseWait: "Espera por favor...",
        completeAllFields: "Completa todos los campos.",
        submitSuccess: "Datos guardados correctamente.",
        errorWithMessage: "Error: {message}",
        accessDeniedAthlete: "Acceso denegado para este atleta.",
        pdfRootMissing: "Contenedor PDF no encontrado.",
        noData: "Sin datos.",
        pdfLibsMissing: "Bibliotecas PDF no cargadas (html2canvas / jsPDF).",
        pdfPagesMissing: "Páginas PDF no encontradas: pac-pdf-page-1 / pac-pdf-page-2",
        noWellnessData: "Sin datos de wellness.",
        missingPdfLibs: "Faltan html2canvas / jsPDF",
        notSignedIn: "No has iniciado sesión.",
        confirmDeleteAll: "¿Eliminar TODOS tus reportes de wellness? Esta acción no se puede deshacer.",
        deleteAllSuccess: "Todos los reportes de wellness fueron eliminados.",
        deleteFailedWithMessage: "No se pudo eliminar: {message}",
        cnsFatigue: "Fatiga SNC",
        stableShort: "Estable"
      },
      ru: {
        pageTitle: "Wellness Control: Мониторинг состояния",
        survey: "Ежедневный опрос",
        q1: "1. Качество сна (1-10, где 10 - идеально):",
        q2: "2. Мышечная боль / усталость (1-10, где 10 - сильный дискомфорт):",
        q3: "3. Настроение / уровень энергии (1-10, где 10 - отлично):",
        q4: "4. Гидратация (1-10, где 10 - цель по воде выполнена):",
        q5: "5. Психологический стресс (1-10, где 10 - максимальный):",
        q6: "6. Субъективная готовность к тренировке (1-10, где 10 - полная готовность):",
        save: "Сохранить",
        cnsTitle: "⚡ АНАЛИЗ НЕРВНОЙ СИСТЕМЫ",
        cnsRec: "РЕКОМЕНДАЦИЯ:",
        weekRec: "Рекомендация:",
        dynamics: "Индивидуальная динамика Wellness",
        history: "📜 История WELLNESS (Нажмите для просмотра)",
        loading: "Загрузка истории...",
        cnsReset: "Сброс ЦНС",
        start: "Старт",
        pause: "Пауза",
        reset: "Сброс",
        sound: "Звуковой сигнал",
        weekRecEmpty: "Рекомендация: —",
        reportDate: "Дата отчёта:",
        exportDailyReport: "Экспорт дневного отчёта",
        exportMyData: "Экспорт моих данных (JSON)",
        deleteMyData: "Удалить мои данные",
        cnsReadyTag: "ГОТОВНОСТЬ",
        emptyHistory: "Записей нет",
        historyReady: "Готовность",
        historyReadyTag: "ГОТОВНОСТЬ",
        confirmDeleteEntry: "Удалить этот отчёт?",
        deleteEntryErrorLog: "Ошибка удаления:",
        readOnlyDelegated: "Режим только чтения: просмотр делегированного атлета.",
        pleaseWait: "Пожалуйста, подождите...",
        completeAllFields: "Заполните все поля.",
        submitSuccess: "Данные успешно сохранены.",
        errorWithMessage: "Ошибка: {message}",
        accessDeniedAthlete: "Нет доступа к этому атлету.",
        pdfRootMissing: "PDF-контейнер не найден.",
        noData: "Нет данных.",
        pdfLibsMissing: "PDF-библиотеки не загружены (html2canvas / jsPDF).",
        pdfPagesMissing: "PDF-страницы не найдены: pac-pdf-page-1 / pac-pdf-page-2",
        noWellnessData: "Нет wellness-данных.",
        missingPdfLibs: "Отсутствуют html2canvas / jsPDF",
        notSignedIn: "Войдите в аккаунт.",
        confirmDeleteAll: "Удалить ВСЕ wellness-отчёты? Это действие нельзя отменить.",
        deleteAllSuccess: "Все wellness-отчёты удалены.",
        deleteFailedWithMessage: "Ошибка удаления: {message}",
        cnsFatigue: "Усталость ЦНС",
        stableShort: "Стабильно"
      },
      pt: {
        pageTitle: "Wellness Control: Monitoramento diário",
        survey: "Check-in diário",
        q1: "1. Qualidade do sono (1-10, 10 = ideal):",
        q2: "2. Dor muscular / fadiga (1-10, 10 = forte):",
        q3: "3. Humor / energia (1-10, 10 = top):",
        q4: "4. Hidratação (1-10, 10 = meta cumprida):",
        q5: "5. Estresse psicológico (1-10, 10 = máximo):",
        q6: "6. Prontidão subjetiva para treinar (1-10, 10 = totalmente pronto):",
        save: "Salvar",
        cnsTitle: "⚡ ANÁLISE DO SISTEMA NERVOSO",
        cnsRec: "RECOMENDAÇÃO:",
        weekRec: "Recomendação:",
        dynamics: "Dinâmica individual de Wellness",
        history: "📜 Histórico WELLNESS (Clique para ver)",
        loading: "Carregando histórico...",
        cnsReset: "Reset SNC",
        start: "Iniciar",
        pause: "Pausar",
        reset: "Redefinir",
        sound: "Sinal sonoro",
        weekRecEmpty: "Recomendação: —",
        reportDate: "Data do relatório:",
        exportDailyReport: "Exportar relatório diário",
        exportMyData: "Exportar meus dados (JSON)",
        deleteMyData: "Excluir meus dados",
        cnsReadyTag: "PRONTIDÃO",
        emptyHistory: "Sem registros",
        historyReady: "Prontidão",
        historyReadyTag: "PRONTIDÃO",
        confirmDeleteEntry: "Excluir este relatório?",
        deleteEntryErrorLog: "Erro ao excluir:",
        readOnlyDelegated: "Modo somente leitura: visualizando atleta delegado.",
        pleaseWait: "Aguarde...",
        completeAllFields: "Preencha todos os campos.",
        submitSuccess: "Dados enviados com sucesso.",
        errorWithMessage: "Erro: {message}",
        accessDeniedAthlete: "Acesso negado para este atleta.",
        pdfRootMissing: "Contêiner PDF não encontrado.",
        noData: "Sem dados.",
        pdfLibsMissing: "Bibliotecas PDF não carregadas (html2canvas / jsPDF).",
        pdfPagesMissing: "Páginas PDF não encontradas: pac-pdf-page-1 / pac-pdf-page-2",
        noWellnessData: "Sem dados de wellness.",
        missingPdfLibs: "Faltando html2canvas / jsPDF",
        notSignedIn: "Você não está autenticado.",
        confirmDeleteAll: "Excluir TODOS os seus relatórios de wellness? Isso não pode ser desfeito.",
        deleteAllSuccess: "Todos os relatórios de wellness foram excluídos.",
        deleteFailedWithMessage: "Falha ao excluir: {message}",
        cnsFatigue: "Fadiga SNC",
        stableShort: "Estável"
      }
    };
    function tUI(key) {
      const lang = getUILang();
      return (UI_COPY[lang] && UI_COPY[lang][key]) || UI_COPY.en[key] || "";
    }
    function tUIFmt(key, params) {
      const tpl = tUI(key);
      return tpl.replace(/\{(\w+)\}/g, (_, k) => (
        params && params[k] != null ? String(params[k]) : `{${k}}`
      ));
    }
    window.pacWellnessTUI = tUI;
    window.pacWellnessTUIFmt = tUIFmt;
    window.pacWellnessGetUILang = getUILang;
    window.pacWellnessFieldLabels = getFieldLabels;
    function applyWellnessLocale() {
      const h2 = document.querySelector("main.main-content > h2");
      if (h2) h2.textContent = tUI("pageTitle");
      const survey = document.querySelector(".form-card h3");
      if (survey) survey.textContent = tUI("survey");
      const questionLabels = document.querySelectorAll("#wellness-form > label");
      const questionCopy = [tUI("q1"), tUI("q2"), tUI("q3"), tUI("q4"), tUI("q5"), tUI("q6")];
      questionCopy.forEach((txt, idx) => {
        if (questionLabels[idx] && txt) questionLabels[idx].textContent = txt;
      });
      const saveBtn = document.querySelector("#wellness-form button[type='submit']");
      if (saveBtn) saveBtn.textContent = tUI("save");
      const pacTitle = document.getElementById("pac-title");
      if (pacTitle) pacTitle.textContent = tUI("cnsTitle");
      const cnsRec = document.querySelector("#cns-advice > div");
      if (cnsRec) cnsRec.textContent = tUI("cnsRec");
      const dyn = document.querySelector("h3[style*='margin-top: 30px']");
      if (dyn) dyn.textContent = tUI("dynamics");
      const weekRec = document.getElementById("pac-week-recommendation");
      if (weekRec && /^\s*(Recommendation|Рекомендація|Empfehlung|Recomendación|Recomendação|Рекомендация)\s*:\s*[-—]\s*$/i.test(weekRec.textContent || "")) {
        weekRec.textContent = tUI("weekRecEmpty");
      }
      const sum = document.querySelector("details summary");
      if (sum) sum.textContent = tUI("history");
      const histLoad = document.querySelector("#wellness-history-list > div");
      if (histLoad && /Завантаження|Loading|Загрузка|Cargando|Carregando|geladen/i.test(histLoad.textContent || "")) {
        histLoad.textContent = tUI("loading");
      }
      const resetHead = document.querySelector("#cns-reset-card .cns-reset-head strong");
      if (resetHead) resetHead.textContent = tUI("cnsReset");
      const bStart = document.getElementById("cns-start-btn");
      const bPause = document.getElementById("cns-pause-btn");
      const bReset = document.getElementById("cns-reset-btn");
      if (bStart) bStart.textContent = tUI("start");
      if (bPause) bPause.textContent = tUI("pause");
      if (bReset) bReset.textContent = tUI("reset");
      const cnsReadyTag = document.getElementById("cns-status-label");
      if (cnsReadyTag) cnsReadyTag.textContent = tUI("cnsReadyTag");
      const soundLabel = document.querySelector(".cns-sound-toggle span");
      if (soundLabel) soundLabel.textContent = tUI("sound");
      const reportDateLabel = document.getElementById("wellness-report-date-label");
      if (reportDateLabel) reportDateLabel.textContent = tUI("reportDate");
      const reportBtn = document.getElementById("wellness-export-report-btn");
      if (reportBtn) reportBtn.textContent = tUI("exportDailyReport");
      const exportDataBtn = document.getElementById("wellness-export-data-btn");
      if (exportDataBtn) exportDataBtn.textContent = tUI("exportMyData");
      const deleteDataBtn = document.getElementById("wellness-delete-data-btn");
      if (deleteDataBtn) deleteDataBtn.textContent = tUI("deleteMyData");
      const bAuto = document.getElementById("cns-prog-auto");
      const bRec = document.getElementById("cns-prog-recovery");
      const bFocus = document.getElementById("cns-prog-focus");
      const bSleep = document.getElementById("cns-prog-sleep");
      const bMatch = document.getElementById("cns-prog-match");
      const lang = getUILang();
      const btnCopy = {
        uk: { auto: "Рекомендовано", rec: "Відновлення", focus: "Фокус", sleep: "Сон", match: "Матч" },
        en: { auto: "Recommend", rec: "Recovery", focus: "Focus", sleep: "Sleep", match: "Match" },
        de: { auto: "Empfohlen", rec: "Erholung", focus: "Fokus", sleep: "Schlaf", match: "Match" },
        es: { auto: "Recomendado", rec: "Recuperación", focus: "Enfoque", sleep: "Sueño", match: "Partido" },
        ru: { auto: "Рекомендовано", rec: "Восстановление", focus: "Фокус", sleep: "Сон", match: "Матч" },
        pt: { auto: "Recomendado", rec: "Recuperação", focus: "Foco", sleep: "Sono", match: "Jogo" }
      };
      const bc = btnCopy[lang] || btnCopy.en;
      if (bAuto) bAuto.textContent = bc.auto;
      if (bRec) bRec.textContent = bc.rec;
      if (bFocus) bFocus.textContent = bc.focus;
      if (bSleep) bSleep.textContent = bc.sleep;
      if (bMatch) bMatch.textContent = bc.match;
      if (typeof window.pacWellnessRefreshCnsLocale === "function") {
        window.pacWellnessRefreshCnsLocale();
      }
      try {
        const hist = JSON.parse(localStorage.getItem("wellnessHistory") || "{}");
        const dates = Object.keys(hist).sort();
        const arr = dates.map((d) => ({ date: d, scores: hist[d] }));
        if (arr.length) updateSmartPACAnalysis(arr);
      } catch (_) {}
    }
    // БАЗА ПОРАД PROATLETCARE (Додай це сюди)
    const ADVICE_DB = {
        

        SLEEP: [
            "Додай 90 хв денного сну (Power Nap) до 16:00.",
            "Сьогодні відбій на 1 годину раніше. Вимкни гаджети за 60 хв.",
            "Без кофеїну після 12:00 сьогодні для стабілізації ЦНС.",
            "Виконай вечірній протокол: магнієва ванна + повна темрява.",
            "Спи в прохолоді (18°C). Пріоритет сьогодні — глибока фаза."
        ],
        STRESS: [
            "Виконай 10 хв дихання за квадратом (4-4-4-4) прямо зараз.",
            "Сьогодні цифровий детокс: мінімум соцмереж, ЦНС потрібна тиша.",
            "Контрастний душ (3 цикли) для перезавантаження нервової системи.",
            "Прогулянка 20 хв без телефону після вечері.",
            "Виконай протокол прогресивної м'язової релаксації перед сном."
        ],
        WATER: [
            "Гідратація низька. Випий 500мл води з електролітами зараз.",
            "Сьогодні пріоритет: +1.5л чистої води до кінця дня.",
            "Додай склянку води перед кожним прийомом їжі сьогодні."
        ],
        MFR: [
            "МФР: приділи по 2 хвилини кожній групі м'язів, де відчуваєш біль.",
            "Додай активне відновлення: 15 хв дуже легкої мобільності.",
            "Виконай лімфодренажний самомасаж (рухи знизу вгору).",
            "Використай компресійний одяг протягом 3 годин сьогодні."
        ],
        OPTIMAL: [
            "Стан ідеальний. Час для максимальної інтенсивності!",
            "ЦНС відновлена. Готовий до встановлення рекорду.",
            "Чудова робота з режимом. Твоя готовність 100%."
        ]

        
    };
window.ADVICE_DB = ADVICE_DB;
    function pacSeedFromString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0);
}
function pacRand(seed) {
  let s = seed >>> 0;
  return function () {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
function pacPickOne(arr, rnd) {
  if (!arr || !arr.length) return null;
  return arr[Math.floor(rnd() * arr.length)];
}



    const colorsMap = {
        sleep: { color: GOLD_COLOR, area: GOLD_AREA },
        soreness: { color: 'rgb(255, 99, 132)', area: 'rgba(255, 99, 132, 0.4)' },
        mood: { color: 'rgb(147, 112, 219)', area: 'rgba(147, 112, 219, 0.4)' },
        water: { color: 'rgb(0, 191, 255)', area: 'rgba(0, 191, 255, 0.4)' },
        stress: { color: 'rgb(255, 159, 64)', area: 'rgba(255, 159, 64, 0.4)' },
        ready: { color: 'rgb(50, 205, 50)', area: 'rgba(50, 205, 50, 0.4)' },
    };

    let currentUserId = null;
    let pacTrendChart = null;
    let wellnessReadBlocked=true,wellnessSaving=false;
    function wellnessReadStatus(failed,uid){
      let host=document.getElementById('wellness-read-status');
      if(!host){host=document.createElement('p');host.id='wellness-read-status';document.getElementById('wellness-form')?.before(host);}
      host.hidden=!failed;host.replaceChildren();host.setAttribute('role',failed?'alert':'status');
      if(failed){host.textContent=getUILang()==='uk'?'Не вдалося завантажити Wellness. Перевір з’єднання й повтори.':'Could not load Wellness. Check your connection and retry.';const retry=document.createElement('button');retry.type='button';retry.textContent=getUILang()==='uk'?'Повторити':'Retry';retry.onclick=()=>{retry.disabled=true;window.syncWellnessFromFirebase(uid);};host.append(' ',retry);}
    }

    function getWellnessEffectiveUid(fallback = "") {
      const ctxUid = String(window.pacDelegatedContext?.effectiveUserId || "").trim();
      if (ctxUid) return ctxUid;
      const globalUid = String(window.currentUserId || "").trim();
      if (globalUid) return globalUid;
      const localUid = String(currentUserId || "").trim();
      if (localUid) return localUid;
      return String(fallback || "").trim();
    }

    function isWellnessDelegatedReadOnly() {
      const ctx = window.pacDelegatedContext || null;
      if (!ctx) return false;
      const authUid = String(ctx.authUid || "").trim();
      const effectiveUid = String(ctx.effectiveUserId || "").trim();
      return Boolean(ctx.isDelegated && authUid && effectiveUid && authUid !== effectiveUid);
    }

    // --- 1. СИНХРОНІЗАЦІЯ ---
    // --- 1. СИНХРОНІЗАЦІЯ ---
    window.syncWellnessFromFirebase = async function(uid) {
        // ВИПРАВЛЕНО: додано window. перед db
        if (!window.db) {
            console.error("Firebase DB не знайдено!");
            return;
        }
        currentUserId = uid;
        wellnessReadBlocked=true;
        checkDailyRestriction();
        if (typeof window.pacRenderDelegatedIndicator === "function" && window.pacDelegatedContext) {
            window.pacRenderDelegatedIndicator(window.pacDelegatedContext);
        }

        try {
            // ВИПРАВЛЕНО: використовуємо window.db
            const snapshot = await window.db.collection(COLLECTION_NAME)
                .where("userId", "==", uid)
                .orderBy("timestamp", "asc")
                .get();
            if(currentUserId!==uid)return;

            const history = {};
            const historyArray = []; 
            let lastDate = "";

            snapshot.forEach(doc => {
                const data = doc.data();
                if (data.date && data.scores) {
                    history[data.date] = data.scores;
                    historyArray.push({ id: doc.id, ...data });
                    if (data.date > lastDate) lastDate = data.date;
                }
            });

            window.__wellnessHistoryArray = historyArray.slice();
 

            // Зберігаємо локально для миттєвого доступу
            localStorage.setItem('wellnessHistory', JSON.stringify(history));
            if (lastDate) localStorage.setItem('lastWellnessSubmissionDate', lastDate);
            else localStorage.removeItem('lastWellnessSubmissionDate');
            wellnessReadBlocked=false;wellnessReadStatus(false,uid);

            // Оновлюємо все
            await loadMatchDayDates(uid);
            await loadHydrationProfile(uid);
            initCharts(); 
            updateMiniAnalysesFromLocal();

            
            if (historyArray.length > 0) {
                if (typeof updateSmartPACAnalysis === 'function') {
                    updateSmartPACAnalysis(historyArray);
                }
            }

            renderWellnessHistory(historyArray.slice().reverse(), uid); 
            checkDailyRestriction();
            
        } catch (e) {
            console.error("Помилка завантаження даних:", e);
            // ПІДКАЗКА: Якщо в консолі помилка про Index, натисни на посилання в ній!
        if(currentUserId!==uid)return;
        wellnessReadBlocked=true;window.__wellnessHistoryArray=[];
        localStorage.setItem('wellnessHistory','{}');localStorage.removeItem('lastWellnessSubmissionDate');
        initCharts();renderWellnessHistory([],uid);wellnessReadStatus(true,uid);checkDailyRestriction();

        }
    };

    // ТАКОЖ ВИПРАВИ ТУТ (в кінці файлу, де надсилання форми)
    // Знайди рядок: await db.collection(COLLECTION_NAME).add({
    // Зміни на: await window.db.collection(COLLECTION_NAME).add({

    // --- 2. PAC ANALYSIS (МОЗОК) ---
    // 1. Додай цю допоміжну функцію, щоб прибрати помилку ReferenceError
    // --- 2. PAC ANALYSIS (ЦНС ТА РЕКОМЕНДАЦІЇ) ---

/** 1. СПОЧАТКУ ВИЗНАЧАЄМО ДОПОМІЖНІ ФУНКЦІЇ **/
const getSmartAdvice = (scores) => {
    const lang = getUILang();
    if (!scores) {
      const loading = {
        uk: "Аналізуємо показники...",
        en: "Analyzing current markers...",
        de: "Marker werden analysiert...",
        es: "Analizando indicadores actuales...",
        ru: "Анализируем показатели...",
        pt: "Analisando os indicadores atuais..."
      };
      return loading[lang] || loading.en;
    }
    
    const issues = [
        { id: 'SLEEP', val: (10 - Number(scores.sleep || 10)) },
        { id: 'STRESS', val: Number(scores.stress || 0) },
        { id: 'MFR', val: Number(scores.soreness || 0) },
        { id: 'WATER', val: (10 - Number(scores.water || 10)) }
    ];
    
    const top = issues.sort((a, b) => b.val - a.val)[0];
    if (Number(scores.ready) >= 8) return "\u0426\u041d\u0421 \u0432 \u043e\u043f\u0442\u0438\u043c\u0430\u043b\u044c\u043d\u043e\u043c\u0443 \u0441\u0442\u0430\u043d\u0456. \u041c\u043e\u0436\u043d\u0430 \u0442\u0440\u0438\u043c\u0430\u0442\u0438 \u043f\u043b\u0430\u043d\u043e\u0432\u0438\u0439 \u043e\u0431\u0441\u044f\u0433.";
    
    const adviceMap = {
      uk: {
        SLEEP: "Сон нижче цілі: сьогодні пріоритет відновлення і ранній відбій.",
        STRESS: "Стрес підвищений: додай дихальні вправи і знизь інтенсивність.",
        MFR: "Є м'язова втома: зроби акцент на мобільність і recovery.",
        WATER: "Гідратація нижче цілі: додай воду рівномірно протягом дня.",
        OK: "Стан стабільний. Працюй за планом."
      },
      en: {
        SLEEP: "Sleep is below target: prioritize recovery and earlier bedtime today.",
        STRESS: "Stress is elevated: add breathing work and reduce intensity.",
        MFR: "Muscle fatigue is present: focus on mobility and recovery.",
        WATER: "Hydration is below target: add water intake evenly through the day.",
        OK: "Condition is stable. Follow the plan."
      },
      de: {
        SLEEP: "Schlaf unter Ziel: Heute Regeneration priorisieren und früher schlafen.",
        STRESS: "Stress erhöht: Atemarbeit ergänzen und Intensität reduzieren.",
        MFR: "Muskelermüdung vorhanden: Fokus auf Mobilität und Regeneration.",
        WATER: "Hydrierung unter Ziel: Wasseraufnahme gleichmäßig über den Tag erhöhen.",
        OK: "Zustand stabil. Plan beibehalten."
      },
      es: {
        SLEEP: "Sueño por debajo del objetivo: hoy prioriza recuperación y dormir antes.",
        STRESS: "Estrés elevado: añade respiración y reduce intensidad.",
        MFR: "Hay fatiga muscular: enfoca movilidad y recuperación.",
        WATER: "Hidratación por debajo del objetivo: aumenta agua de forma uniforme durante el día.",
        OK: "Estado estable. Mantén el plan."
      },
      ru: {
        SLEEP: "Сон ниже цели: сегодня приоритет восстановление и ранний отбой.",
        STRESS: "Стресс повышен: добавьте дыхательные упражнения и снизьте интенсивность.",
        MFR: "Есть мышечная усталость: акцент на мобильность и восстановление.",
        WATER: "Гидратация ниже цели: увеличьте воду равномерно в течение дня.",
        OK: "Состояние стабильное. Работайте по плану."
      },
      pt: {
        SLEEP: "Sono abaixo da meta: hoje priorize recuperação e dormir mais cedo.",
        STRESS: "Estresse elevado: adicione respiração e reduza intensidade.",
        MFR: "Há fadiga muscular: foque em mobilidade e recuperação.",
        WATER: "Hidratação abaixo da meta: aumente água de forma regular ao longo do dia.",
        OK: "Condição estável. Siga o plano."
      }
    };
    const a = adviceMap[lang] || adviceMap.en;
    return a[top.id] || a.OK;
};

const getCnsResetAdvice = (scores) => {
    const lang = getUILang();
    const stress = Number(scores?.stress || 0);
    const ready = Number(scores?.ready || 0);
    const byLang = {
      uk: {
        high: "CNS Reset: 5-7 хв Recovery Breathing (довгий видих) перед тренуванням.",
        low: "CNS Reset: 6-8 хв Sleep Downshift (повільний ритм) ввечері.",
        mid: "CNS Reset: 4-5 хв Box Focus перед когнітивною/тактичною роботою."
      },
      en: {
        high: "CNS Reset: 5-7 min Recovery Breathing (long exhale) before training.",
        low: "CNS Reset: 6-8 min Sleep Downshift (slow rhythm) in the evening.",
        mid: "CNS Reset: 4-5 min Box Focus before cognitive/tactical work."
      },
      de: {
        high: "CNS Reset: 5-7 Min Recovery Breathing (langer Ausatem) vor dem Training.",
        low: "CNS Reset: 6-8 Min Sleep Downshift (langsamer Rhythmus) am Abend.",
        mid: "CNS Reset: 4-5 Min Box Focus vor kognitiver/taktischer Arbeit."
      },
      es: {
        high: "CNS Reset: 5-7 min Recovery Breathing (exhalación larga) antes del entrenamiento.",
        low: "CNS Reset: 6-8 min Sleep Downshift (ritmo lento) por la noche.",
        mid: "CNS Reset: 4-5 min Box Focus antes de trabajo cognitivo/táctico."
      },
      ru: {
        high: "CNS Reset: 5-7 мин Recovery Breathing (длинный выдох) перед тренировкой.",
        low: "CNS Reset: 6-8 мин Sleep Downshift (медленный ритм) вечером.",
        mid: "CNS Reset: 4-5 мин Box Focus перед когнитивной/тактической работой."
      },
      pt: {
        high: "CNS Reset: 5-7 min Recovery Breathing (expiração longa) antes do treino.",
        low: "CNS Reset: 6-8 min Sleep Downshift (ritmo lento) à noite.",
        mid: "CNS Reset: 4-5 min Box Focus antes de trabalho cognitivo/tático."
      }
    };
    const d = byLang[lang] || byLang.en;
    if (stress >= 7) return d.high;
    if (ready <= 4.5) return d.low;
    return d.mid;
};

/** 2. МАЛЮВАННЯ ГРАФІКА З КОЛЬОРОВИМИ ЗОНАМИ **/
function renderPACChart(historyArray) {
    const ctx = document.getElementById('pac-trend-chart');
    const analysisBox = document.getElementById('pac-daily-analysis');
    if (!ctx) return;

    const byDate = {};
    (Array.isArray(historyArray) ? historyArray : []).forEach((row) => {
      if (row && typeof row.date === "string") byDate[row.date] = row;
    });
    const chartDates = buildChartWindowDates();
    const labels = chartDates.map((d) => d.slice(8));
    const dataPoints = chartDates.map((dateKey) => {
      const raw = Number(byDate[dateKey]?.scores?.ready);
      return Number.isFinite(raw) ? Math.round(raw * 10) : null;
    });
    if (analysisBox) analysisBox.innerHTML = "";

    if (window.pacTrendChart instanceof Chart) window.pacTrendChart.destroy();
    
    window.pacTrendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                data: dataPoints,
                borderColor: '#FFC72C',
                borderWidth: 3,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#fff',
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: { left: 10, right: 14, top: 4, bottom: 0 }
            },
            animations: centerPointAnimations(4),
            scales: {
                y: { 
                    min: 0, max: 100,
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: '#444', font: { size: 8 }, stepSize: 25 }
                },
                x: { display: false }
            },
            plugins: {
                legend: { display: false }
            }
        },
        // КЛЮЧОВА ЗМІНА: Плагіни малюються окремим масивом тут
        plugins: [{
            id: 'custom_zones',
            beforeDraw: (chart) => {
                const {ctx, chartArea: {top, bottom, left, width}, scales: {y}} = chart;
                ctx.save();
                
                const drawZone = (yMin, yMax, color) => {
                    ctx.fillStyle = color;
                    const startY = y.getPixelForValue(yMax);
                    const endY = y.getPixelForValue(yMin);
                    ctx.fillRect(left, startY, width, endY - startY);
                };

                // Малюємо зони (кольори як ти просив)
                drawZone(0, 40, 'rgba(218, 62, 82, 0.15)');   // RED (нижня)
                drawZone(40, 75, 'rgba(255, 199, 44, 0.1)');  // YELLOW (середня)
                drawZone(75, 100, 'rgba(0, 255, 0, 0.08)');  // GREEN (верхня)
                
                ctx.restore();
            }
        }, {
            id: 'match_day_marker',
            afterDraw(chart) {
                drawMatchDayMarker(chart, chartDates);
            }
        }]
    });
}

/** 3. ГОЛОВНА ФУНКЦІЯ (ЯКУ ТИ ВИКЛИКАЄШ) **/
function updateSmartPACAnalysis(historyArray) {
    if (!historyArray || historyArray.length === 0) return;

    const latest = historyArray[historyArray.length - 1].scores;
    const currentReady = Number(latest.ready || 0);
    
    // Розрахунок тренду
    const last7Days = historyArray.slice(-7);
    const avgReady = last7Days.reduce((acc, day) => acc + Number(day.scores.ready || 0), 0) / last7Days.length;
    
    let trendIcon = "→"; let trendColor = "#FFC72C";
    if (currentReady > avgReady + 0.5) { trendIcon = "↑"; trendColor = "#00ff00"; }
    else if (currentReady < avgReady - 0.5) { trendIcon = "↓"; trendColor = "#DA3E52"; }

    // Вивід даних в HTML
    const elements = {
        pct: document.getElementById('cns-percentage'),
        advice: document.getElementById('advice-text'),
        verdict: document.getElementById('cns-verdict')
    };

    if (elements.pct) {
        elements.pct.textContent = `${Math.round(currentReady * 10)}%`;
    }
    
    if (elements.advice) {
        elements.advice.textContent = getSmartAdvice(latest);
    }
    const weekReco = document.getElementById("pac-week-recommendation");
    if (weekReco) {
      weekReco.textContent = `${tUI("weekRec")} ${getCnsResetAdvice(latest)}`;
    }

    if (elements.verdict) {
        const lang = getUILang();
        const verdictCopy = {
          uk: { hi: "ЦНС: Оптимальний стан", mid: "ЦНС: Стабільна втома", low: "ЦНС: Критичне виснаження" },
          en: { hi: "CNS: Optimal state", mid: "CNS: Controlled fatigue", low: "CNS: Critical fatigue" },
          de: { hi: "ZNS: Optimaler Zustand", mid: "ZNS: Kontrollierte Ermüdung", low: "ZNS: Kritische Erschöpfung" },
          es: { hi: "SNC: Estado óptimo", mid: "SNC: Fatiga controlada", low: "SNC: Fatiga crítica" },
          ru: { hi: "ЦНС: Оптимальное состояние", mid: "ЦНС: Контролируемая усталость", low: "ЦНС: Критическое истощение" },
          pt: { hi: "SNC: Estado ideal", mid: "SNC: Fadiga controlada", low: "SNC: Fadiga crítica" }
        };
        const vc = verdictCopy[lang] || verdictCopy.en;
        if (currentReady >= 7.5) { 
            elements.verdict.textContent = vc.hi; 
            elements.verdict.style.color = "#00ff00"; 
        } else if (currentReady >= 4.5) { 
            elements.verdict.textContent = vc.mid; 
            elements.verdict.style.color = "#FFC72C"; 
        } else { 
            elements.verdict.textContent = vc.low; 
            elements.verdict.style.color = "#DA3E52"; 
        }
    }

    renderPACChart(historyArray);
    updateSpiderSignal(latest);
}

function updateSpiderSignal(scores) {
    const el = document.querySelector(".wellness-spider-area");
    if (!el) return;
    el.classList.remove("is-ok", "is-warning", "is-alert");

    const stress = Number(scores?.stress || 0);
    const soreness = Number(scores?.soreness || 0);
    const ready = Number(scores?.ready || 0);

    if (stress >= 8 || soreness >= 8 || ready <= 3) {
        el.classList.add("is-alert");
        return;
    }
    if (stress >= 6 || soreness >= 6 || ready <= 5) {
        el.classList.add("is-warning");
        return;
    }
    el.classList.add("is-ok");
}

    // --- 3. ІСТОРІЯ ТА ВИДАЛЕННЯ ---
    function renderWellnessHistory(data, uid) {
        const container = document.getElementById('wellness-history-list');
        if (!container) return;
        
        if (data.length === 0) {
            container.innerHTML = `<div style="color:#444; text-align:center; padding:10px;">${tUI("emptyHistory")}</div>`;
            return;
        }

        container.innerHTML = data.map(d => `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px solid #1a1a1a;">
                <div style="flex:1;">
                    <div style="color:#fff; font-size:12px; font-weight:600;">${d.date.split('-').reverse().join('.')}</div>
                    <div style="color:#666; font-size:9px;">${tUI("historyReady")}: ${d.scores.ready}/10</div>
                </div>
                <div style="flex:1; text-align:center; color:#FFC72C; font-weight:800; font-size:14px;">
                    ${d.scores.ready} <span style="font-size:9px; font-weight:normal;">${tUI("historyReadyTag")}</span>
                </div>
                <button onclick="window.deleteWellnessEntry('${d.id}', '${uid}')" 
                        style="background:transparent; border:none; color:#DA3E52; cursor:pointer; font-size:16px; padding:5px;">✕</button>
            </div>
        `).join('');
    }

    window.deleteWellnessEntry = async function(docId, uid) {
        if (!confirm(tUI("confirmDeleteEntry"))) return;
        try {
            await db.collection(COLLECTION_NAME).doc(docId).delete();
            window.syncWellnessFromFirebase(uid);
        } catch (e) { console.error(tUI("deleteEntryErrorLog"), e); }
    };

    // --- 4. ДОПОМІЖНІ ФУНКЦІЇ ---
    function toLocalISODate(date) {
      if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    }

    function parseLocalISODate(iso) {
      if (typeof iso !== "string") return null;
      const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (!m) return null;
      const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
      d.setHours(0, 0, 0, 0);
      return d;
    }

    function addDaysISO(iso, offsetDays) {
      const d = parseLocalISODate(iso);
      if (!d) return iso;
      d.setDate(d.getDate() + Number(offsetDays || 0));
      return toLocalISODate(d);
    }

    function getTodayDateString() {
      return toLocalISODate(new Date());
    }

    function getCurrentWeekIdMonday() {
      const d = new Date();
      const dow = (d.getDay() === 0) ? 6 : d.getDay() - 1;
      d.setDate(d.getDate() - dow);
      return toLocalISODate(d);
    }

    function buildChartWindowDates() {
      const mondayIso = getCurrentWeekIdMonday();
      const out = [];
      for (let i = 0; i < 7; i += 1) out.push(addDaysISO(mondayIso, i));
      return out;
    }

    function getMatchDayIndexes(dateWindow) {
      const dates = Array.isArray(dateWindow) ? dateWindow : [];
      if (!dates.length) return [];

      const idxSet = new Set();
      const fromPlan = Array.isArray(window.__pacMatchDayIndexes) ? window.__pacMatchDayIndexes : [];
      fromPlan.forEach((value) => {
        const idx = Number(value);
        if (Number.isInteger(idx) && idx >= 0 && idx < dates.length) idxSet.add(idx);
      });

      const fromDates = Array.isArray(window.__pacMatchDayDates) ? window.__pacMatchDayDates : [];
      fromDates.forEach((iso) => {
        const idx = dates.indexOf(String(iso || ""));
        if (idx >= 0) idxSet.add(idx);
      });

      return Array.from(idxSet).sort((a, b) => a - b);
    }

    function centerPointAnimations(pointRadius) {
      return {
        x: {
          type: "number",
          duration: 650,
          easing: "easeOutCubic",
          from(ctx) {
            const area = ctx?.chart?.chartArea;
            return area ? (area.left + area.right) / 2 : (ctx?.chart?.width || 0) / 2;
          }
        },
        y: {
          type: "number",
          duration: 650,
          easing: "easeOutCubic",
          from(ctx) {
            const area = ctx?.chart?.chartArea;
            return area ? (area.top + area.bottom) / 2 : (ctx?.chart?.height || 0) / 2;
          }
        },
        radius: {
          type: "number",
          duration: 650,
          easing: "easeOutCubic",
          from: 0,
          to: Number(pointRadius || 3)
        }
      };
    }

    function drawMatchDayMarker(chart, dateWindow) {
      const dates = Array.isArray(dateWindow) ? dateWindow : [];
      if (!dates.length) return;

      const matchIdxs = getMatchDayIndexes(dates);
      if (!matchIdxs.length) return;

      const xScale = chart?.scales?.x;
      const chartArea = chart?.chartArea;
      if (!xScale || !chartArea) return;

      const { ctx } = chart;
      const lang = getUILang();
      const labelMap = { uk: "День матчу", en: "Match day", de: "Spieltag", es: "Día de partido", ru: "День матча", pt: "Dia de jogo" };
      const baseLabel = labelMap[lang] || labelMap.en;

      ctx.save();
      matchIdxs.forEach((idx, order) => {
        const x = xScale.getPixelForValue(idx);
        if (!Number.isFinite(x)) return;

        ctx.strokeStyle = "rgba(255,199,44,.92)";
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, chartArea.top);
        ctx.lineTo(x, chartArea.bottom);
        ctx.stroke();

        const suffix = matchIdxs.length > 1 ? ` ${order + 1}` : "";
        const label = `${baseLabel}${suffix}`;
        const textX = Math.min(Math.max(x + 4, chartArea.left + 4), chartArea.right - 96);
        const textY = chartArea.top + 12 + (order * 11);
        ctx.fillStyle = "rgba(255,199,44,.95)";
        ctx.font = "10px Inter, sans-serif";
        ctx.fillText(label, textX, textY);
      });
      ctx.setLineDash([]);
      ctx.restore();
    }

    async function loadMatchDayDates(uid) {
      window.__pacMatchDayDates = [];
      window.__pacMatchDayIndexes = [];
      try {
        if (!uid || !window.db) return;
        const weekId = getCurrentWeekIdMonday();
        const snap = await window.db.collection("weekly_plans").doc(`${uid}_${weekId}`).get();
        if (!snap.exists) return;
        const data = snap.data() || {};
        const matchDaysRaw = Array.isArray(data.microcycleMatchDays) ? data.microcycleMatchDays : [];
        const matchDays = Array.from(new Set(matchDaysRaw
          .map((v) => Number(v))
          .filter((i) => Number.isInteger(i) && i >= 0 && i <= 6))).sort((a, b) => a - b);
        if (!matchDays.length) return;
        const monday = parseLocalISODate(weekId) || new Date(`${weekId}T00:00:00`);
        const dates = matchDays.map((idx) => {
          const dt = new Date(monday);
          dt.setDate(monday.getDate() + idx);
          return toLocalISODate(dt);
        }).filter(Boolean);
        window.__pacMatchDayIndexes = matchDays;
        window.__pacMatchDayDates = dates;
      } catch (e) {
        console.warn("match day load failed:", e);
      }
    }

    async function loadHydrationProfile(uid) {
      window.__pacHydrationProfile = null;
      try {
        if (!uid || !window.db) return;
        const snap = await window.db.collection("weight_history").where("userId", "==", uid).limit(20).get();
        if (snap.empty) return;
        const rows = [];
        snap.forEach((d) => rows.push({ id: d.id, ...d.data() }));
        rows.sort((a, b) => {
          const ta = a.timestamp?.toMillis ? a.timestamp.toMillis() : Date.parse(a.date || "") || 0;
          const tb = b.timestamp?.toMillis ? b.timestamp.toMillis() : Date.parse(b.date || "") || 0;
          return tb - ta;
        });
        const latest = rows[0] || {};
        const weight = Number(latest.weight || latest.currentWeight || latest.kg || 0);
        if (!weight || !Number.isFinite(weight)) return;
        const targetL = Number((weight * 0.035).toFixed(2));
        const targetGlasses = Math.max(1, Math.round((targetL * 1000) / 250));
        window.__pacHydrationProfile = {
          weightKg: weight,
          targetL,
          targetGlasses,
          glassMl: 250
        };
      } catch (e) {
        console.warn("hydration profile load failed:", e);
      }
    }
    function checkDailyRestriction() {
        const lastDate = localStorage.getItem('lastWellnessSubmissionDate');
        const today = getTodayDateString();
        const button = document.querySelector('#wellness-form button[type=submit]');
        const authUid = firebase.auth().currentUser?.uid || null;
        const isTrainerViewing = Boolean(currentUserId && authUid && currentUserId !== authUid);
        const answeredToday = (lastDate === today);

        applyDailyQuestionVisibility(answeredToday);
        if(button){button.disabled=wellnessReadBlocked||wellnessSaving;button.style.display=isTrainerViewing||answeredToday?'none':'';}
        if(wellnessReadBlocked||wellnessSaving)return true;

        if (isTrainerViewing && button) {
            button.style.display = 'none';
            return true;
        }

        if (lastDate === today && button) {
            button.style.display = 'none';
            return true;
        }
        return false;
    }

    function applyDailyQuestionVisibility(answeredToday) {
      const form = document.getElementById("wellness-form");
      if (!form) return;

      WELLNESS_FIELDS.forEach((field) => {
        const firstInput = form.querySelector(`input[name="${field}"]`);
        if (!firstInput) return;
        const group = firstInput.closest(".rating-group");
        const label = group?.previousElementSibling;
        const stat = document.getElementById(`stat-${field}`);
        const analysis = document.getElementById(`analysis-${field}`);
        const chart = document.getElementById(`chart-${field}`);
        const chartWrap = chart ? chart.closest(".small-chart-container") : null;

        if (group) group.style.display = answeredToday ? "none" : "";
        if (label && label.tagName === "LABEL") label.style.display = answeredToday ? "none" : "";
        if (stat) stat.style.display = answeredToday ? "none" : "";
        if (analysis) {
          analysis.style.display = "block";
          analysis.style.border = "";
          analysis.style.background = "";
          analysis.style.color = "";
          analysis.style.padding = "";
          analysis.style.borderRadius = "";

          if (chartWrap && chartWrap.parentNode) {
            if (answeredToday && analysis.nextElementSibling !== chartWrap) {
              chartWrap.parentNode.insertBefore(analysis, chartWrap);
            } else if (!answeredToday && chartWrap.nextElementSibling !== analysis) {
              chartWrap.parentNode.insertBefore(analysis, chartWrap.nextElementSibling);
            }
          }
        }
      });
    }

function initCharts() {
  const history = JSON.parse(localStorage.getItem('wellnessHistory') || '{}');
  const sortedDates = Object.keys(history).sort();
  const FIELD_LABELS = getFieldLabels();

  const latestData = sortedDates.length > 0
    ? history[sortedDates[sortedDates.length - 1]]
    : { sleep:0, soreness:0, mood:0, water:0, stress:0, ready:0 };
  updateSpiderSignal(latestData);

  // ✅ coverage рахуємо за фактичні останні 7 днів
  const recent7Dates = [];
  {
    const now = new Date();
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      recent7Dates.push(toLocalISODate(d));
    }
  }
  const chartDates = buildChartWindowDates();
  const coverageEl = document.getElementById("wellness-week-coverage");
  if (coverageEl) {
    const filledDays = recent7Dates.filter((d) => !!history[d]);
    const localeMap = { uk: "uk-UA", en: "en-US", de: "de-DE", es: "es-ES", ru: "ru-RU", pt: "pt-PT" };
    const lang = getUILang();
    const dayFmt = new Intl.DateTimeFormat(localeMap[lang] || "en-US", { weekday: "short" });
    const dayList = filledDays.map((d0) => dayFmt.format(new Date(`${d0}T00:00:00`))).join(", ");
    const coverageText = {
      uk: `Заповнення за 7 днів: ${filledDays.length}/7${dayList ? ` • дні: ${dayList}` : ""}`,
      en: `7-day completion: ${filledDays.length}/7${dayList ? ` • days: ${dayList}` : ""}`,
      de: `7-Tage-Füllstand: ${filledDays.length}/7${dayList ? ` • Tage: ${dayList}` : ""}`,
      es: `Completado 7 días: ${filledDays.length}/7${dayList ? ` • días: ${dayList}` : ""}`,
      ru: `Заполнение за 7 дней: ${filledDays.length}/7${dayList ? ` • дни: ${dayList}` : ""}`,
      pt: `Preenchimento 7 dias: ${filledDays.length}/7${dayList ? ` • dias: ${dayList}` : ""}`
    };
    coverageEl.textContent = coverageText[lang] || coverageText.uk;
  }

  // labels типу "01-17"
  const last7Labels = chartDates.map(d => d.slice(5)); // YYYY-MM-DD -> MM-DD

  // ✅ у PDF покажемо дати на X, в UI сховаємо
  const isPDF = document.body.classList.contains("pac-report-mode");

  WELLNESS_FIELDS.forEach(field => {
    const ctx = document.getElementById(`chart-${field}`);
    const statEl = document.getElementById(`stat-${field}`);

    if (statEl) {
      const score = latestData[field] || 0;

      // ✅ назва + оцінка
      statEl.textContent = `${FIELD_LABELS[field]}: ${score} / 10`;

      statEl.style.color =
        score >= 7 ? 'rgb(50, 205, 50)' :
        (score >= 4 ? 'rgb(255, 159, 64)' : 'rgb(255, 99, 132)');
    }

    if (ctx && typeof Chart !== 'undefined') {
      if (window[`chart_${field}`] instanceof Chart) window[`chart_${field}`].destroy();

      const dataArr = chartDates.map(d => {
        const raw = history[d] && history[d][field];
        return raw == null ? null : Number(raw);
      });

      window[`chart_${field}`] = new Chart(ctx, {
        type: 'line',
        data: {
          labels: last7Labels,
            datasets: [{
              data: dataArr,
              borderColor: colorsMap[field].color,
              backgroundColor: colorsMap[field].area,
              fill: true,
              spanGaps: false,
              tension: 0.35,
            pointRadius: 3,
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          layout: {
            padding: { left: 10, right: 14, top: 4, bottom: 0 }
          },
          animations: centerPointAnimations(3),
          interaction: { mode: "nearest", intersect: false },
          onClick(evt, elements, chart) {
            if (!elements || !elements.length) return;
            const first = elements[0];
            chart.setActiveElements([{ datasetIndex: first.datasetIndex, index: first.index }]);
            if (chart.tooltip && typeof chart.tooltip.setActiveElements === "function") {
              chart.tooltip.setActiveElements([{ datasetIndex: first.datasetIndex, index: first.index }], { x: evt.x, y: evt.y });
            }
            chart.update();
          },
          scales: {
            y: {
              min: 0,
              max: 10,
              ticks: { color: TEXT_COLOR, stepSize: 2 },
              grid: { color: WHITE_GRID }
            },
            x: {
              // ✅ тільки в PDF показуємо дати
              ticks: isPDF
                ? { color: 'rgba(255,255,255,0.55)', font: { size: 9 }, maxRotation: 0, autoSkip: false }
                : { display: false },
              grid: { display: false }
            }
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              enabled: true,
              callbacks: {
                title(items) {
                  const idx = items && items[0] ? items[0].dataIndex : 0;
                  const iso = chartDates[idx] || "";
                  if (!iso) return "";
                  const [yy, mm, dd] = iso.split("-");
                  return `${dd}.${mm}.${yy}`;
                },
                label(item) {
                  const value = Number(item.raw || 0);
                  return `${FIELD_LABELS[field]}: ${value}/10`;
                }
              }
            }
          }
        },
        plugins: [{
          id: "match_day_marker",
          afterDraw(chart) {
            drawMatchDayMarker(chart, chartDates);
          }
        }]
      });
    }
  });

  // ✅ радар (залишаємо як є)
  const mainCtx = document.getElementById('wellnessChart');
  if (mainCtx && typeof Chart !== 'undefined') {
    if (window.wellnessChart instanceof Chart) window.wellnessChart.destroy();

    window.wellnessChart = new Chart(mainCtx, {
      type: 'radar',
      data: {
        labels: Object.values(FIELD_LABELS),
        datasets: [{
          data: WELLNESS_FIELDS.map(f => latestData[f]),
          backgroundColor: GOLD_AREA,
          borderColor: GOLD_COLOR,
          pointBackgroundColor: GOLD_COLOR
        }]
      },
      options: {
        scales: {
          r: {
            min: 0,
            max: 10,
            grid: { color: WHITE_GRID },
            angleLines: { color: WHITE_GRID },
            pointLabels: { color: 'white', font: { size: 12 } },
            ticks: { display: false }
          }
        },
        plugins: { legend: { display: false } }
      }
    });
  }
}


function pacTrend(values, direction = "higherBetter") {
  if (!values || values.length < 2) return "stable";
  const a = Number(values[0] || 0);
  const b = Number(values[values.length - 1] || 0);

  // зміна
  const delta = b - a;

  // поріг
  const TH = 1;

  if (Math.abs(delta) <= TH) return "stable";

  // якщо "higherBetter": ріст = покращення
  if (direction === "higherBetter") {
    return delta > 0 ? "improving" : "declining";
  }

  // якщо "lowerBetter": ріст = погіршення
  return delta > 0 ? "declining" : "improving";
}


function pacMiniText(field, v, trend){
  const lang = getUILang();
  const pick = (obj) => obj[lang] || obj.en || obj.uk || "";
  v = Number(v || 0);
  const trendText = {
    uk: { improving: "покращується", stable: "стабільно", declining: "погіршується" },
    en: { improving: "improving", stable: "stable", declining: "declining" },
    de: { improving: "verbessert sich", stable: "stabil", declining: "verschlechtert sich" },
    es: { improving: "mejora", stable: "estable", declining: "empeora" },
    ru: { improving: "улучшается", stable: "стабильно", declining: "ухудшается" },
    pt: { improving: "melhorando", stable: "estável", declining: "piorando" }
  };
  const tt = (trendText[lang] || trendText.uk)[trend] || trend;
  const t = {
    uk: `Тренд за 7 днів: ${tt}.`,
    en: `7-day trend: ${tt}.`,
    de: `7-Tage-Trend: ${tt}.`,
    es: `Tendencia de 7 días: ${tt}.`,
    ru: `Тренд за 7 дней: ${tt}.`,
    pt: `Tendência de 7 dias: ${tt}.`
  }[lang] || `7-day trend: ${tt}.`;

  if (field === "sleep")
    return pick({
      uk: v >= 7 ? `Сон у робочому діапазоні. Продовжуй поточний режим відновлення. ${t}` : `Сон нижче цілі. Сьогодні зроби акцент на ранньому відбої та гігієні сну. ${t}`,
      en: v >= 7 ? `Sleep is in target range. Keep your current recovery routine. ${t}` : `Sleep is below target. Prioritize early bedtime and sleep hygiene today. ${t}`,
      de: v >= 7 ? `Schlaf im Zielbereich. Aktuellen Regenerationsrhythmus beibehalten. ${t}` : `Schlaf unter Ziel. Heute Fokus auf frühes Zubettgehen und Schlafhygiene. ${t}`,
      es: v >= 7 ? `Sueño en rango objetivo. Mantén tu rutina de recuperación. ${t}` : `Sueño por debajo del objetivo. Prioriza dormir antes y la higiene del sueño. ${t}`,
      ru: v >= 7 ? `Сон в целевом диапазоне. Сохраняйте текущий режим восстановления. ${t}` : `Сон ниже цели. Сегодня приоритет: ранний отбой и гигиена сна. ${t}`,
      pt: v >= 7 ? `Sono na faixa alvo. Mantenha sua rotina de recuperação. ${t}` : `Sono abaixo da meta. Priorize dormir mais cedo e higiene do sono. ${t}`
    });

  if (field === "soreness")
    return pick({
      uk: v >= 7 ? `М'язовий біль високий. Зменш навантаження і додай відновлення після сесії. ${t}` :
           v >= 4 ? `Біль помірний. Тримай техніку і контроль обсягу. ${t}` :
           `Біль під контролем. Можна працювати за планом. ${t}`,
      en: v >= 7 ? `Muscle pain is high. Reduce load and add post-session recovery. ${t}` :
           v >= 4 ? `Pain is moderate. Keep technique quality and volume control. ${t}` :
           `Pain is under control. Continue with planned work. ${t}`,
      de: v >= 7 ? `Muskelschmerz ist hoch. Reduziere die Last und ergänze Regeneration nach der Einheit. ${t}` :
           v >= 4 ? `Schmerz ist moderat. Halte Technikqualität und Volumenkontrolle. ${t}` :
           `Schmerz ist unter Kontrolle. Weiter nach Plan. ${t}`,
      es: v >= 7 ? `El dolor muscular es alto. Reduce la carga y añade recuperación post-sesión. ${t}` :
           v >= 4 ? `El dolor es moderado. Mantén la técnica y el control de volumen. ${t}` :
           `El dolor está bajo control. Continúa según el plan. ${t}`,
      ru: v >= 7 ? `Мышечная боль высокая. Снизьте нагрузку и добавьте восстановление после сессии. ${t}` :
           v >= 4 ? `Боль умеренная. Держите качество техники и контроль объема. ${t}` :
           `Боль под контролем. Продолжайте по плану. ${t}`,
      pt: v >= 7 ? `Dor muscular alta. Reduza a carga e adicione recuperação pós-sessão. ${t}` :
           v >= 4 ? `Dor moderada. Mantenha técnica e controle de volume. ${t}` :
           `Dor sob controle. Continue conforme o plano. ${t}`
    });

  if (field === "mood")
    return pick({
      uk: v >= 7 ? `Енергія стабільна. Підтримуй поточний темп роботи. ${t}` : `Енергія знижена. Додай паузи відновлення і контроль інтенсивності. ${t}`,
      en: v >= 7 ? `Energy is stable. Maintain current training rhythm. ${t}` : `Energy is lower. Add recovery breaks and control intensity. ${t}`,
      de: v >= 7 ? `Energie ist stabil. Behalte den aktuellen Trainingsrhythmus bei. ${t}` : `Energie ist niedriger. Ergänze Erholungspausen und kontrolliere die Intensität. ${t}`,
      es: v >= 7 ? `La energía es estable. Mantén el ritmo actual de trabajo. ${t}` : `La energía está baja. Añade pausas de recuperación y controla la intensidad. ${t}`,
      ru: v >= 7 ? `Энергия стабильная. Сохраняйте текущий ритм работы. ${t}` : `Энергия снижена. Добавьте восстановительные паузы и контролируйте интенсивность. ${t}`,
      pt: v >= 7 ? `Energia estável. Mantenha o ritmo atual de treino. ${t}` : `Energia mais baixa. Adicione pausas de recuperação e controle a intensidade. ${t}`
    });

  if (field === "water")
    return pick({
      uk: v >= 7 ? `Гідратація в нормі. Продовжуй поточний режим пиття. ${t}` : `Гідратація нижче цілі. Додай воду рівномірно протягом дня. ${t}`,
      en: v >= 7 ? `Hydration is on target. Keep current intake rhythm. ${t}` : `Hydration is below target. Add water evenly through the day. ${t}`,
      de: v >= 7 ? `Hydrierung im Zielbereich. Behalte den aktuellen Trinkrhythmus bei. ${t}` : `Hydrierung unter Ziel. Trinke Wasser gleichmäßig über den Tag. ${t}`,
      es: v >= 7 ? `Hidratación en objetivo. Mantén el ritmo actual de ingesta. ${t}` : `Hidratación por debajo del objetivo. Añade agua de forma uniforme durante el día. ${t}`,
      ru: v >= 7 ? `Гидратация в норме. Сохраняйте текущий питьевой режим. ${t}` : `Гидратация ниже цели. Добавьте воду равномерно в течение дня. ${t}`,
      pt: v >= 7 ? `Hidratação na meta. Mantenha o ritmo atual de ingestão. ${t}` : `Hidratação abaixo da meta. Adicione água de forma regular ao longo do dia. ${t}`
    });

  if (field === "stress")
    return pick({
      uk: v >= 7 ? `Стрес підвищений. Додай дихальні вправи та зменш пік інтенсивності. ${t}` : `Стрес під контролем. Продовжуй за планом. ${t}`,
      en: v >= 7 ? `Stress is elevated. Add breathing work and reduce peak intensity. ${t}` : `Stress is controlled. Continue with the plan. ${t}`,
      de: v >= 7 ? `Stress ist erhöht. Ergänze Atemarbeit und reduziere Spitzenintensität. ${t}` : `Stress ist unter Kontrolle. Weiter nach Plan. ${t}`,
      es: v >= 7 ? `El estrés está elevado. Añade trabajo respiratorio y reduce picos de intensidad. ${t}` : `Estrés bajo control. Continúa con el plan. ${t}`,
      ru: v >= 7 ? `Стресс повышен. Добавьте дыхательные упражнения и снизьте пиковую интенсивность. ${t}` : `Стресс под контролем. Продолжайте по плану. ${t}`,
      pt: v >= 7 ? `Estresse elevado. Adicione exercícios respiratórios e reduza picos de intensidade. ${t}` : `Estresse sob controle. Continue com o plano. ${t}`
    });

  if (field === "ready")
    return pick({
      uk: v >= 7.5 ? `Готовність висока. Можна виконувати інтенсивні блоки за планом. ${t}` :
           v >= 4.5 ? `Готовність помірна. Дозуй навантаження і тримай якість виконання. ${t}` :
           `Готовність низька. Сьогодні пріоритет — відновлення. ${t}`,
      en: v >= 7.5 ? `Readiness is high. You can execute high-intensity blocks. ${t}` :
           v >= 4.5 ? `Readiness is moderate. Dose training load and keep quality. ${t}` :
           `Readiness is low. Recovery should be the priority today. ${t}`,
      de: v >= 7.5 ? `Bereitschaft ist hoch. Intensive Blöcke sind möglich. ${t}` :
           v >= 4.5 ? `Bereitschaft ist moderat. Belastung dosieren und Qualität halten. ${t}` :
           `Bereitschaft ist niedrig. Regeneration hat heute Priorität. ${t}`,
      es: v >= 7.5 ? `La preparación es alta. Puedes ejecutar bloques intensos. ${t}` :
           v >= 4.5 ? `La preparación es moderada. Dosifica la carga y mantén calidad. ${t}` :
           `La preparación es baja. La recuperación es prioridad hoy. ${t}`,
      ru: v >= 7.5 ? `Готовность высокая. Можно выполнять интенсивные блоки. ${t}` :
           v >= 4.5 ? `Готовность умеренная. Дозируйте нагрузку и держите качество. ${t}` :
           `Готовность низкая. Сегодня приоритет — восстановление. ${t}`,
      pt: v >= 7.5 ? `Prontidão alta. Você pode executar blocos intensos. ${t}` :
           v >= 4.5 ? `Prontidão moderada. Dose a carga e mantenha qualidade. ${t}` :
           `Prontidão baixa. Recuperação é prioridade hoje. ${t}`
    });

  return t;
}

function updateMiniAnalysesFromLocal() {
  const history = JSON.parse(localStorage.getItem("wellnessHistory") || "{}");
  const lang = getUILang();
  const insufficientByLang = {
    uk: "Недостатньо даних за останні 7 днів.",
    en: "Not enough data for the last 7 days.",
    de: "Nicht genug Daten für die letzten 7 Tage.",
    es: "No hay suficientes datos de los últimos 7 días.",
    ru: "Недостаточно данных за последние 7 дней.",
    pt: "Dados insuficientes dos últimos 7 dias."
  };
  const last7 = [];
  const now = new Date();
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    last7.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
  }

  ["sleep","soreness","mood","water","stress","ready"].forEach((f) => {
    const arr = last7.map((d) => {
      const raw = history[d] && history[d][f];
      return raw == null ? null : Number(raw);
    });
    const valid = arr.filter((v) => Number.isFinite(v));
    let text = insufficientByLang[lang] || insufficientByLang.en;
    if (valid.length >= 2) {
      const direction = (f === "soreness" || f === "stress") ? "lowerBetter" : "higherBetter";
      const trend = pacTrend(valid, direction);
      const current = valid[valid.length - 1];
      text = pacMiniText(f, current, trend);
    }

    const el = document.getElementById(`analysis-${f}`);
    if (el) el.textContent = text;
  });
}

function initCnsResetWidget() {
  const card = document.getElementById("cns-reset-card");
  if (!card) return;
  const phaseEl = document.getElementById("cns-phase");
  const phaseTimerEl = document.getElementById("cns-phase-timer");
  const orbEl = document.getElementById("cns-orb");
  const lungLeftEl = document.getElementById("cns-lung-left");
  const lungRightEl = document.getElementById("cns-lung-right");
  const sessionTimerEl = document.getElementById("cns-session-timer");
  const cycleCounterEl = document.getElementById("cns-cycle-counter");
  const statusEl = document.getElementById("cns-reset-status");
  const startBtn = document.getElementById("cns-start-btn");
  const pauseBtn = document.getElementById("cns-pause-btn");
  const resetBtn = document.getElementById("cns-reset-btn");
  const soundToggle = document.getElementById("cns-sound-toggle");
  const descEl = document.getElementById("cns-program-desc");
  const reasonEl = document.getElementById("cns-program-reason");
  const programButtons = {
    auto: document.getElementById("cns-prog-auto"),
    recovery: document.getElementById("cns-prog-recovery"),
    focus: document.getElementById("cns-prog-focus"),
    sleep: document.getElementById("cns-prog-sleep"),
    match: document.getElementById("cns-prog-match")
  };
  if (!phaseEl || !phaseTimerEl || !sessionTimerEl || !cycleCounterEl || !statusEl || !startBtn || !pauseBtn || !resetBtn || !soundToggle || !orbEl || !lungLeftEl || !lungRightEl || !descEl || !reasonEl) return;

  const PROGRAMS = {
    calm: { id: "calm", label: "Calm Base", phases: [4, 2, 6, 0], cycles: 12, desc: "4-2-6 breathing for nervous system downshift." },
    box: { id: "box", label: "Box Focus", phases: [4, 4, 4, 4], cycles: 10, desc: "4-4-4-4 for focus before work or training." },
    recovery: { id: "recovery", label: "Recovery Long Exhale", phases: [3, 1, 7, 0], cycles: 12, desc: "Long exhale pattern for post-training recovery." },
    match: { id: "match", label: "Match Prep", phases: [2, 1, 4, 0], cycles: 10, desc: "Short activation breathing before match or session." },
    sleep: { id: "sleep", label: "Sleep Downshift", phases: [4, 0, 8, 0], cycles: 10, desc: "Evening down-regulation for sleep readiness." }
  };

  let selectedMode = "auto";
  let activeProgram = PROGRAMS.calm;
  let phases = [
    { name: "Inhale", sec: 4 },
    { name: "Hold", sec: 2 },
    { name: "Exhale", sec: 6 },
    { name: "Hold", sec: 0 }
  ];
  let maxCycles = 12;
  let phaseIdx = 0;
  let phaseLeft = phases[0].sec;
  let cyclesDone = 0;
  let totalSec = 0;
  let timer = null;
  let running = false;
  let lastRecommendation = null;
  let statusKey = "ready";

  function getUiLang() {
    const raw = (localStorage.getItem("pac_lang") || document.documentElement.lang || "uk").toLowerCase().slice(0, 2);
    return ["uk", "en", "de", "es", "ru", "pt"].includes(raw) ? raw : "uk";
  }
  function cnsCopy() {
    const lang = getUiLang();
    const dict = {
      uk: { inhale: "ВДИХ", exhale: "ВИДИХ", hold: "ПАУЗА", cycle: "Цикл", ready: "Готово", inSession: "У сесії", paused: "Пауза", completed: "Завершено", completedToday: "Завершено сьогодні", recommendedNow: "Рекомендовано зараз" },
      en: { inhale: "INHALE", exhale: "EXHALE", hold: "HOLD", cycle: "Cycle", ready: "Ready", inSession: "In session", paused: "Paused", completed: "Completed", completedToday: "Completed today", recommendedNow: "Recommended now" },
      de: { inhale: "EINATMEN", exhale: "AUSATMEN", hold: "HALTEN", cycle: "Zyklus", ready: "Bereit", inSession: "In Sitzung", paused: "Pausiert", completed: "Abgeschlossen", completedToday: "Heute abgeschlossen", recommendedNow: "Jetzt empfohlen" },
      es: { inhale: "INHALAR", exhale: "EXHALAR", hold: "PAUSA", cycle: "Ciclo", ready: "Listo", inSession: "En sesión", paused: "Pausado", completed: "Completado", completedToday: "Completado hoy", recommendedNow: "Recomendado ahora" },
      ru: { inhale: "ВДОХ", exhale: "ВЫДОХ", hold: "ПАУЗА", cycle: "Цикл", ready: "Готово", inSession: "В сессии", paused: "Пауза", completed: "Завершено", completedToday: "Завершено сегодня", recommendedNow: "Рекомендовано сейчас" },
      pt: { inhale: "INSPIRAR", exhale: "EXPIRAR", hold: "PAUSA", cycle: "Ciclo", ready: "Pronto", inSession: "Em sessão", paused: "Pausado", completed: "Concluído", completedToday: "Concluído hoje", recommendedNow: "Recomendado agora" }
    };
    return dict[lang] || dict.en;
  }

  function tReason(mode, ctx) {
    const lang = getUiLang();
    const reasonKey = (ctx && ctx.reasonKey) ? ctx.reasonKey : "balanced_rotation";
    const copy = {
      uk: {
        reasons: {
          match_day: "\u0420\u0435\u043a\u043e\u043c\u0435\u043d\u0434\u0430\u0446\u0456\u044f: \u043f\u0435\u0440\u0435\u0434 match day.",
          late_evening: "\u0420\u0435\u043a\u043e\u043c\u0435\u043d\u0434\u0430\u0446\u0456\u044f: \u043f\u0435\u0440\u0435\u0434 \u0441\u043d\u043e\u043c \u0434\u043b\u044f \u0441\u0442\u0430\u0431\u0456\u043b\u0456\u0437\u0430\u0446\u0456\u0457 \u0441\u0442\u0430\u043d\u0443.",
          high_stress: "\u0420\u0435\u043a\u043e\u043c\u0435\u043d\u0434\u0430\u0446\u0456\u044f: \u043f\u0440\u0438 \u0432\u0438\u0441\u043e\u043a\u043e\u043c\u0443 \u0441\u0442\u0440\u0435\u0441\u0456 \u0434\u043b\u044f \u0432\u0456\u0434\u043d\u043e\u0432\u043b\u0435\u043d\u043d\u044f.",
          medium_stress: "\u0420\u0435\u043a\u043e\u043c\u0435\u043d\u0434\u0430\u0446\u0456\u044f: \u0434\u043b\u044f \u0441\u0442\u0430\u0431\u0456\u043b\u044c\u043d\u043e\u0433\u043e \u0441\u0442\u0430\u043d\u0443 \u0426\u041d\u0421.",
          balanced_rotation: "\u0420\u0435\u043a\u043e\u043c\u0435\u043d\u0434\u0430\u0446\u0456\u044f: \u0434\u043b\u044f \u0441\u0442\u0430\u0431\u0456\u043b\u044c\u043d\u043e\u0433\u043e \u0444\u043e\u043a\u0443\u0441\u0443 \u0456 \u0440\u0438\u0442\u043c\u0443."
        },
        manual: "\u0412\u0440\u0443\u0447\u043d\u0443: \u0432\u0438\u043a\u043e\u0440\u0438\u0441\u0442\u043e\u0432\u0443\u0439 \u043f\u0435\u0440\u0435\u0434 \u043a\u043e\u0433\u043d\u0456\u0442\u0438\u0432\u043d\u043e\u044e/\u0442\u0430\u043a\u0442\u0438\u0447\u043d\u043e\u044e \u0440\u043e\u0431\u043e\u0442\u043e\u044e \u0430\u0431\u043e \u043f\u0456\u0441\u043b\u044f \u043d\u0435\u0439\u0440\u043e\u0448\u0432\u0438\u0434\u043a\u043e\u0441\u0442\u0456."
      },
      en: {
        reasons: {
          match_day: "Recommendation: before match day.",
          late_evening: "Recommendation: before sleep for stable recovery.",
          high_stress: "Recommendation: with high stress for recovery.",
          medium_stress: "Recommendation: to keep CNS state stable.",
          balanced_rotation: "Recommendation: for stable focus and rhythm."
        },
        manual: "Manual: use before cognitive/tactical work, or after neuro-speed sessions."
      },
      de: {
        reasons: {
          match_day: "Empfehlung: vor dem Match Day.",
          late_evening: "Empfehlung: vor dem Schlafen fuer stabile Erholung.",
          high_stress: "Empfehlung: bei hohem Stress zur Regeneration.",
          medium_stress: "Empfehlung: fuer stabilen ZNS-Zustand.",
          balanced_rotation: "Empfehlung: fuer stabilen Fokus und Rhythmus."
        },
        manual: "Manuell: vor kognitiver/taktischer Arbeit oder nach Neuro-Speed nutzen."
      },
      es: {
        reasons: {
          match_day: "Recomendacion: antes del dia de partido.",
          late_evening: "Recomendacion: antes de dormir para recuperacion estable.",
          high_stress: "Recomendacion: con estres alto para recuperacion.",
          medium_stress: "Recomendacion: para mantener estable el SNC.",
          balanced_rotation: "Recomendacion: para foco y ritmo estables."
        },
        manual: "Manual: usar antes de trabajo cognitivo/tactico o despues de neuro-velocidad."
      },
      ru: {
        reasons: {
          match_day: "\u0420\u0435\u043a\u043e\u043c\u0435\u043d\u0434\u0430\u0446\u0438\u044f: \u043f\u0435\u0440\u0435\u0434 match day.",
          late_evening: "\u0420\u0435\u043a\u043e\u043c\u0435\u043d\u0434\u0430\u0446\u0438\u044f: \u043f\u0435\u0440\u0435\u0434 \u0441\u043d\u043e\u043c \u0434\u043b\u044f \u0441\u0442\u0430\u0431\u0438\u043b\u044c\u043d\u043e\u0433\u043e \u0432\u043e\u0441\u0441\u0442\u0430\u043d\u043e\u0432\u043b\u0435\u043d\u0438\u044f.",
          high_stress: "\u0420\u0435\u043a\u043e\u043c\u0435\u043d\u0434\u0430\u0446\u0438\u044f: \u043f\u0440\u0438 \u0432\u044b\u0441\u043e\u043a\u043e\u043c \u0441\u0442\u0440\u0435\u0441\u0441\u0435 \u0434\u043b\u044f \u0432\u043e\u0441\u0441\u0442\u0430\u043d\u043e\u0432\u043b\u0435\u043d\u0438\u044f.",
          medium_stress: "\u0420\u0435\u043a\u043e\u043c\u0435\u043d\u0434\u0430\u0446\u0438\u044f: \u0434\u043b\u044f \u0441\u0442\u0430\u0431\u0438\u043b\u044c\u043d\u043e\u0433\u043e \u0441\u043e\u0441\u0442\u043e\u044f\u043d\u0438\u044f \u0426\u041d\u0421.",
          balanced_rotation: "\u0420\u0435\u043a\u043e\u043c\u0435\u043d\u0434\u0430\u0446\u0438\u044f: \u0434\u043b\u044f \u0441\u0442\u0430\u0431\u0438\u043b\u044c\u043d\u043e\u0433\u043e \u0444\u043e\u043a\u0443\u0441\u0430 \u0438 \u0440\u0438\u0442\u043c\u0430."
        },
        manual: "\u0412\u0440\u0443\u0447\u043d\u0443\u044e: \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u0443\u0439 \u043f\u0435\u0440\u0435\u0434 \u043a\u043e\u0433\u043d\u0438\u0442\u0438\u0432\u043d\u043e\u0439/\u0442\u0430\u043a\u0442\u0438\u0447\u0435\u0441\u043a\u043e\u0439 \u0440\u0430\u0431\u043e\u0442\u043e\u0439 \u0438\u043b\u0438 \u043f\u043e\u0441\u043b\u0435 \u043d\u0435\u0439\u0440\u043e-\u0441\u043a\u043e\u0440\u043e\u0441\u0442\u0438."
      },
      pt: {
        reasons: {
          match_day: "Recomendacao: antes do dia de jogo.",
          late_evening: "Recomendacao: antes de dormir para recuperacao estavel.",
          high_stress: "Recomendacao: com estresse alto para recuperacao.",
          medium_stress: "Recomendacao: para manter o SNC estavel.",
          balanced_rotation: "Recomendacao: para foco e ritmo estaveis."
        },
        manual: "Manual: usar antes de trabalho cognitivo/tatico ou apos neuro-velocidade."
      }
    };
    const d = copy[lang] || copy.en;
    if (mode !== "auto") return d.manual;
    return d.reasons[reasonKey] || d.reasons.balanced_rotation;
  }
  function setStatus(nextKey) {
    statusKey = nextKey || "ready";
    const lc = cnsCopy();
    const statusByKey = {
      ready: lc.ready,
      inSession: lc.inSession,
      paused: lc.paused,
      completed: lc.completed,
      completedToday: lc.completedToday,
      recommendedNow: lc.recommendedNow
    };
    statusEl.textContent = statusByKey[statusKey] || lc.ready;
  }
  function refreshCnsLocaleOnly() {
    const ctx = lastRecommendation || inferAutoProgram();
    if (selectedMode === "auto") {
      reasonEl.textContent = tReason("auto", {
        reasonKey: ctx.reasonKey || "balanced_rotation",
        programId: activeProgram.id,
        programLabel: activeProgram.label
      });
    } else {
      reasonEl.textContent = tReason(selectedMode, {
        programId: activeProgram.id,
        programLabel: activeProgram.label
      });
    }
    setStatus(statusKey);
    render();
  }
  window.pacWellnessRefreshCnsLocale = refreshCnsLocaleOnly;
  function programFromHistory(candidates) {
    const hist = JSON.parse(localStorage.getItem("cns_reset_history") || "[]");
    const lastTwo = hist.slice(-2);
    return candidates.find((id) => !lastTwo.includes(id)) || candidates[0];
  }

  function inferAutoProgram() {
    let stress = 0;
    try {
      const hist = JSON.parse(localStorage.getItem("wellnessHistory") || "{}");
      const keys = Object.keys(hist).sort();
      const last = keys.length ? hist[keys[keys.length - 1]] : null;
      stress = Number(last?.stress || 0);
    } catch (_) {}
    const hour = new Date().getHours();
    const matchDates = Array.isArray(window.__pacMatchDayDates) ? window.__pacMatchDayDates : [];
    const today = getTodayDateString();
    if (matchDates.includes(today)) return { program: PROGRAMS.match, reasonKey: "match_day", stress, hour };
    if (hour >= 21 || hour <= 5) return { program: PROGRAMS.sleep, reasonKey: "late_evening", stress, hour };
    if (stress >= 7) return { program: PROGRAMS.recovery, reasonKey: "high_stress", stress, hour };
    if (stress >= 5) return { program: PROGRAMS.calm, reasonKey: "medium_stress", stress, hour };
    const id = programFromHistory(["box", "calm", "recovery"]);
    return { program: PROGRAMS[id] || PROGRAMS.calm, reasonKey: "balanced_rotation", stress, hour };
  }

  function setProgram(p) {
    activeProgram = p;
    const [inh, h1, exh, h2] = p.phases;
    phases = [
      { name: "Inhale", sec: inh },
      { name: "Hold", sec: h1 },
      { name: "Exhale", sec: exh },
      { name: "Hold", sec: h2 }
    ];
    maxCycles = p.cycles;
    phaseIdx = 0;
    phaseLeft = Math.max(0, phases[0].sec);
    cyclesDone = 0;
    totalSec = 0;
    descEl.textContent = `${p.label} - ${p.desc}`;
    if (selectedMode !== "auto") {
      reasonEl.textContent = tReason(selectedMode, { programId: p.id, programLabel: p.label });
    }
    render();
  }

  function setMode(mode) {
    selectedMode = mode;
    Object.entries(programButtons).forEach(([k, btn]) => {
      if (!btn) return;
      btn.classList.toggle("is-active", k === mode);
    });
    if (mode === "auto") {
      lastRecommendation = inferAutoProgram();
      setProgram(lastRecommendation.program);
      reasonEl.textContent = tReason("auto", {
        reasonKey: lastRecommendation.reasonKey,
        programId: lastRecommendation.program.id,
        programLabel: lastRecommendation.program.label
      });
    }
    if (mode === "recovery") setProgram(PROGRAMS.recovery);
    if (mode === "focus") setProgram(PROGRAMS.box);
    if (mode === "sleep") setProgram(PROGRAMS.sleep);
    if (mode === "match") setProgram(PROGRAMS.match);
  }

  function fillRatioForPhase() {
    const ph = phases[phaseIdx];
    const dur = Math.max(1, ph.sec || 1);
    const progress = 1 - (phaseLeft / dur);
    if (phaseIdx === 0) return Math.max(0, Math.min(1, progress));      // inhale
    if (phaseIdx === 2) return Math.max(0, Math.min(1, 1 - progress));  // exhale
    if (phaseIdx === 1) return 1;                                        // hold after inhale
    return 0;                                                            // hold after exhale
  }

  function fmt(sec) {
    const mm = String(Math.floor(sec / 60)).padStart(2, "0");
    const ss = String(sec % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  }
  function beep() {
    if (!soundToggle.checked) return;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 880;
      gain.gain.value = 0.02;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      setTimeout(() => {
        osc.stop();
        ctx.close();
      }, 100);
    } catch (_) {}
  }
  function render() {
    const lc = cnsCopy();
    const ph = phases[phaseIdx];
    phaseEl.textContent = ph.name === "Inhale" ? lc.inhale : (ph.name === "Exhale" ? lc.exhale : lc.hold);
    phaseTimerEl.textContent = `${phaseLeft}s`;
    sessionTimerEl.textContent = fmt(totalSec);
    cycleCounterEl.textContent = `${lc.cycle} ${cyclesDone}/${maxCycles}`;
    const fill = fillRatioForPhase();
    const fillPct = `${Math.round(fill * 100)}%`;
    lungLeftEl.style.height = fillPct;
    lungRightEl.style.height = fillPct;
    const scale = 0.82 + (fill * 0.22);
    orbEl.style.transform = `scale(${scale.toFixed(2)})`;
    orbEl.style.boxShadow = `0 0 ${Math.round(16 + fill * 18)}px rgba(255,199,44,${(0.14 + fill * 0.22).toFixed(2)})`;
    orbEl.classList.remove("is-inhale", "is-exhale");
    if (phaseIdx === 0) orbEl.classList.add("is-inhale");
    if (phaseIdx === 2) orbEl.classList.add("is-exhale");
  }
  function step() {
    if (!running) return;
    totalSec += 1;
    phaseLeft -= 1;
    if (phaseLeft <= 0) {
      phaseIdx += 1;
      beep();
      if (phaseIdx >= phases.length) {
        phaseIdx = 0;
        cyclesDone += 1;
        if (cyclesDone >= maxCycles) {
          running = false;
          clearInterval(timer);
          timer = null;
          const today = getTodayDateString();
          localStorage.setItem("cns_reset_done_date", today);
          setStatus("completed");
          render();
          return;
        }
      }
      phaseLeft = Math.max(0, phases[phaseIdx].sec);
    }
    render();
  }
  function setRecommendedState() {
    try {
      const hist = JSON.parse(localStorage.getItem("wellnessHistory") || "{}");
      const keys = Object.keys(hist).sort();
      const last = keys.length ? hist[keys[keys.length - 1]] : null;
      const stress = Number(last?.stress || 0);
      if (stress >= 7) setStatus("recommendedNow");
      else setStatus("ready");
    } catch (_) {}
  }

  startBtn.addEventListener("click", () => {
    if (running) return;
    running = true;
    if (!timer) timer = setInterval(step, 1000);
    setStatus("inSession");
    beep();
  });
  pauseBtn.addEventListener("click", () => {
    if (!running) return;
    running = false;
    setStatus("paused");
  });
  resetBtn.addEventListener("click", () => {
    running = false;
    clearInterval(timer);
    timer = null;
    phaseIdx = 0;
    phaseLeft = Math.max(0, phases[0].sec);
    cyclesDone = 0;
    totalSec = 0;
    setStatus("ready");
    render();
  });

  const doneDate = localStorage.getItem("cns_reset_done_date");
  const today = getTodayDateString();
  Object.entries(programButtons).forEach(([key, btn]) => {
    if (!btn) return;
    btn.addEventListener("click", () => setMode(key));
  });
  if (doneDate === today) setStatus("completedToday");
  else setRecommendedState();
  setMode("auto");
  render();

  const originalStep = step;
  step = function wrappedStep() {
    originalStep();
    if (!running && cyclesDone >= maxCycles) {
      const hist = JSON.parse(localStorage.getItem("cns_reset_history") || "[]");
      hist.push(activeProgram.id);
      localStorage.setItem("cns_reset_history", JSON.stringify(hist.slice(-20)));
    }
  };
}


    document.addEventListener('DOMContentLoaded', () => {
        // Ownerless legacy cache is a display cache, never proof of today's submission.
        localStorage.setItem('wellnessHistory','{}');localStorage.removeItem('lastWellnessSubmissionDate');
        initCharts();
        checkDailyRestriction();
        initCnsResetWidget();
        applyWellnessLocale();
        updateMiniAnalysesFromLocal();
        const langSelect = document.getElementById("langSelect");
        if (langSelect) {
          langSelect.addEventListener("change", () => {
            setTimeout(() => {
              applyWellnessLocale();
              initCharts();
              updateMiniAnalysesFromLocal();
            }, 0);
          });
        }
        window.addEventListener("pac:lang-changed", () => {
          applyWellnessLocale();
          initCharts();
          updateMiniAnalysesFromLocal();
        });
        const form = document.getElementById('wellness-form');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                if (isWellnessDelegatedReadOnly()) {
                    alert(tUI("readOnlyDelegated"));
                    return;
                }
                if (checkDailyRestriction()) return;
                const user = firebase.auth().currentUser;
                if (!user || !window.db) return alert(tUI("pleaseWait"));
                const effectiveUid = getWellnessEffectiveUid(user.uid);
                if (!effectiveUid) return alert(tUI("pleaseWait"));
                const scores = {};
                WELLNESS_FIELDS.forEach(f => {
                    const val = form.querySelector(`input[name="${f}"]:checked`);
                    if (val) scores[f] = parseInt(val.value, 10);
                });
                if (Object.keys(scores).length < 6) return alert(tUI("completeAllFields"));
                wellnessSaving=true;checkDailyRestriction();
                try {
                    const today = getTodayDateString();
                    await window.db.collection(COLLECTION_NAME).add({
                        userId: effectiveUid,
                        source: "manual",
                        date: today,
                        scores: scores,
                        timestamp: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    localStorage.setItem('lastWellnessSubmissionDate', today);
                    alert(tUI("submitSuccess"));
                    await window.syncWellnessFromFirebase(effectiveUid);
                } catch (err) { alert(tUIFmt("errorWithMessage", { message: err.message })); }
                finally{wellnessSaving=false;checkDailyRestriction();}
            });
        }

        firebase.auth().onAuthStateChanged(async (user) => {
            if (!user) return;
            const dbx = window.db || firebase.firestore();
            const scope = (typeof window.pacResolveDelegatedContext === "function")
              ? await window.pacResolveDelegatedContext(user, { db: dbx })
              : {
                  allowed: true,
                  effectiveUserId: String(window.currentUserId || user.uid).trim(),
                  backHref: "coach-dashboard.html"
                };
            if (!scope.allowed) {
                alert(tUI("accessDeniedAthlete"));
                window.location.href = scope.backHref || "coach-dashboard.html";
                return;
            }
            if (typeof window.pacRenderDelegatedIndicator === "function") {
                window.pacRenderDelegatedIndicator(scope);
            }
            const effectiveUid = String(scope.effectiveUserId || user.uid).trim();
            if (!effectiveUid) return;
            if (String(currentUserId || "").trim() !== effectiveUid || !Array.isArray(window.__wellnessHistoryArray)) {
                await window.syncWellnessFromFirebase(effectiveUid);
            }
        });
    });
})();
function pacWellnessText(key, fallback) {
  try {
    if (typeof window.pacWellnessTUI === "function") {
      const text = window.pacWellnessTUI(key);
      if (text) return text;
    }
  } catch (_) {}
  return fallback || "";
}
function pacWellnessTextFmt(key, params, fallback) {
  try {
    if (typeof window.pacWellnessTUIFmt === "function") {
      const text = window.pacWellnessTUIFmt(key, params || {});
      if (text) return text;
    }
  } catch (_) {}
  const template = fallback || "";
  return template.replace(/\{(\w+)\}/g, (_, k) => (
    params && params[k] != null ? String(params[k]) : `{${k}}`
  ));
}
window.toggleReportMode = function () {
  document.body.classList.toggle("pac-report-mode");
};

// ===============================
// PAC REPORT MODE + SCREEN->PDF
// ===============================

// 1) увімкнути/вимкнути режим репорту (щоб ти вручну налаштував вигляд)
window.enterReportMode = function enterReportMode() {
  document.body.classList.add("pac-report-mode");
};

window.exitReportMode = function exitReportMode() {
  document.body.classList.remove("pac-report-mode");
};

// 2) маленький хелпер: перевірка бібліотек
function pacGetJsPDF() {
  // jsPDF UMD: window.jspdf.jsPDF
  if (window.jspdf && window.jspdf.jsPDF) return window.jspdf.jsPDF;
  // інколи буває default
  if (window.jspdf && window.jspdf.default) return window.jspdf.default;
  return null;
}

function pacSleep(ms){ return new Promise(r => setTimeout(r, ms)); }

// 3) опціонально: зупинити анімації графіків, щоб pdf був чіткий
function pacFreezeCharts() {
  if (!window.Chart) return;
  try {
    Chart.defaults.animation = false;
    // якщо у тебе є змінні з інстансами графіків — додамо пізніше
  } catch (e) {}
}


// ===============================
// PAC: dynamic recommendations (GLOBAL)
// ===============================

window.pacSeedFromString = function (str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0);
};

window.pacRand = function (seed) {
  let s = seed >>> 0;
  return function () {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 4294967296;
  };
};

window.pacPickOne = function (arr, rnd) {
  if (!arr || !arr.length) return null;
  return arr[Math.floor(rnd() * arr.length)];
};

// ⚠️ ВАЖЛИВО: ADVICE_DB має існувати ДО цього (у тебе він є у wellness.js) :contentReference[oaicite:0]{index=0}
window.pacBuildDailyRecommendations = function (scores, dateStr) {
  var s = scores || {};
  var dateKey = dateStr || getTodayDateString();

  var user = (window.firebase && firebase.auth) ? firebase.auth().currentUser : null;
  var uid = String(currentUserId || window.currentUserId || (user && user.uid) || "guest");

  var seedStr = uid + "|" + dateKey + "|" + Number(s.ready || 0);

  // seed -> rand
  function pacSeedFromString_local(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0);
  }
  function pacRand_local(seed) {
    var st = seed >>> 0;
    return function () {
      st = (Math.imul(1664525, st) + 1013904223) >>> 0;
      return st / 4294967296;
    };
  }
  function pacPickOne_local(arr, rnd) {
    if (!arr || !arr.length) return null;
    return arr[Math.floor(rnd() * arr.length)];
  }

  var rnd = pacRand_local(pacSeedFromString_local(seedStr));

  // fallback якщо бази нема
  if (!window.ADVICE_DB) {
    return [
      "Фокус сьогодні: сон + гідратація.",
      "Дозуй інтенсивність і контролюй навантаження.",
      "Додай 10–15 хв мобільності або легкого відновлення."
    ];
  }

  var issues = [
    { key: "WATER",  score: 10 - Number(s.water || 10) },
    { key: "SLEEP",  score: 10 - Number(s.sleep || 10) },
    { key: "STRESS", score: Number(s.stress || 0) },
    { key: "MFR",    score: Number(s.soreness || 0) }
  ].sort(function(a,b){ return b.score - a.score; });

  var top = issues.filter(function(x){ return x.score >= 3; }).slice(0, 2);

  var recs = [];
  top.forEach(function(t){
    var tip = pacPickOne_local(window.ADVICE_DB[t.key], rnd);
    if (tip) recs.push(tip);
  });

  var ready = Number(s.ready || 0);

  if (recs.length < 3) {
    if (ready >= 8 && window.ADVICE_DB.OPTIMAL && window.ADVICE_DB.OPTIMAL.length) {
      recs.push(pacPickOne_local(window.ADVICE_DB.OPTIMAL, rnd));
    } else {
      ["WATER","SLEEP","STRESS","MFR"].some(function(k){
        var tip2 = pacPickOne_local(window.ADVICE_DB[k], rnd);
        if (tip2 && recs.indexOf(tip2) === -1) {
          recs.push(tip2);
          return true;
        }
        return false;
      });
    }
  }

  // unique + limit 3
  return recs.filter(function(v,i,a){ return a.indexOf(v) === i; }).slice(0, 3);
};




window.generateDailyReportPDF = async function () {
  const root = document.getElementById("pac-pdf-root");
  if (!root) return alert(pacWellnessText("pdfRootMissing", "PDF root not found."));

  const history = window.__wellnessHistoryArray || [];
  if (!history.length) return alert(pacWellnessText("noData", "No data."));

  const day = history[history.length - 1];
  const s = day.scores;

  // 1️⃣ наповнюємо PDF HTML
  root.innerHTML = `
    <div class="pac-pdf-page">
      <h1>Daily Wellness Report</h1>
      <p><b>Date:</b> ${day.date}</p>

      <div class="pac-card pac-readiness" style="--pct:${Math.round(s.ready * 10)}">
  <div class="pac-gauge">
    <div class="pac-gauge-inner">
      <div class="pac-gauge-val">${Math.round(s.ready * 10)}%</div>
      <div class="pac-gauge-sub">READY</div>
    </div>
  </div>

  <div>
    <h2>${Math.round(s.ready * 10)}% · MODERATE READINESS</h2>
    <div style="margin-top:8px;
                background:#f5c84c;
                color:#000;
                display:inline-block;
                padding:6px 14px;
                border-radius:999px;
                font-weight:600;">
      Train with controlled load
    </div>
  </div>
</div>


      <div class="pac-card">
        <h3>Coach Recommendation</h3>
        <ul>
          ${window.pacBuildDailyRecommendations(s, day.date)
            .map(r => `<li>${r}</li>`).join("")}
        </ul>
      </div>

      <div class="pac-card">
        <h3>Key Metrics</h3>
        <table>
          <tr><td>Sleep</td><td>${s.sleep}/10</td></tr>
          <tr><td>Hydration</td><td>${s.water}/10</td></tr>
          <tr><td>Stress</td><td>${s.stress}/10</td></tr>
          <tr><td>Readiness</td><td>${s.ready}/10</td></tr>
        </table>
      </div>
    </div>
  `;

  // 2️⃣ показуємо PDF layout
  root.style.display = "block";

  await new Promise(r => setTimeout(r, 200));

  // 3️⃣ робимо PDF
  const canvas = await html2canvas(root, {
    scale: 2,
    backgroundColor: "#ffffff"
  });

  const pdf = new window.jspdf.jsPDF("p", "pt", "a4");
  const w = pdf.internal.pageSize.getWidth();
  const h = (canvas.height * w) / canvas.width;

  pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, w, h);
  pdf.save("Daily_Wellness_Report.pdf");

  // 4️⃣ ховаємо PDF layout
  root.style.display = "none";
};









// 4) основна функція: зробити PDF з екрану (весь контент блоку, не тільки видима частина)
async function captureElementCanvas(el) {
  if (!el) throw new Error("captureElementCanvas: element not found");
  return await html2canvas(el, {
    backgroundColor: "#000",
    scale: 2,
    useCORS: true,
    allowTaint: true,
    scrollX: 0,
    scrollY: 0
  });
}

window.generatePdfFromTwoPages = async function(filename = "PAC_Daily_Report.pdf") {
  const JsPDF = pacGetJsPDF();
  if (!window.html2canvas || !JsPDF) {
    alert(pacWellnessText("pdfLibsMissing", "PDF libraries not loaded (html2canvas / jsPDF)."));
    return;
  }

  const p1 = document.getElementById("pac-pdf-page-1");
  const p2 = document.getElementById("pac-pdf-page-2");
  if (!p1 || !p2) {
    alert(pacWellnessText("pdfPagesMissing", "PDF pages not found: pac-pdf-page-1 / pac-pdf-page-2"));
    return;
  }

  const canvas1 = await captureElementCanvas(p1);
  const canvas2 = await captureElementCanvas(p2);

  const pdf = new JsPDF("p", "pt", "a4");
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();

  const addCanvas = (canvas, addNewPage) => {
    const imgW = pageW;
    const imgH = (canvas.height * imgW) / canvas.width;
    const img = canvas.toDataURL("image/jpeg", 0.95);

    if (addNewPage) pdf.addPage();
    // ✅ тут головне: ми ВПИСУЄМО у сторінку, а не ріжемо
    pdf.addImage(img, "JPEG", 0, 0, imgW, Math.min(imgH, pageH));
  };

  addCanvas(canvas1, false);
  addCanvas(canvas2, true);

  pdf.save(filename);
};

function buildPdfLayout(day, athleteName) {
  const root = document.getElementById("pdf-root");
  if (!root) return;

  const ready = Number(day.scores.ready || 0);
  const pct = Math.round(ready * 10);

  const recs = window.pacBuildDailyRecommendations(day.scores, day.date);

  root.innerHTML = `
<div id="pac-pdf" style="
  width:794px;
  margin:0 auto;
  padding:48px;
  font-family:Inter, system-ui, -apple-system, sans-serif;
  background:#fafafa;
  color:#222;
">

  <!-- HEADER -->
  <div style="display:flex; justify-content:space-between; align-items:flex-start;">
    <div>
      <div style="font-weight:800; font-size:14px; color:#bfa14a;">
        ProAthleteCare®
      </div>
      <div style="font-size:32px; font-weight:800; margin-top:6px;">
        Daily Wellness Report
      </div>
    </div>
    <div style="text-align:right; font-size:14px; color:#555;">
      <div style="font-weight:700;">${athleteName}</div>
      <div>${day.date}</div>
    </div>
  </div>

  <hr style="border:none; border-top:1px solid #e5e5e5; margin:24px 0 32px;"/>

  <!-- READINESS -->
  <div style="
    background:#f3f3f3;
    border-radius:24px;
    padding:32px;
    display:flex;
    gap:40px;
    align-items:center;
  ">

    <div style="
      width:160px;
      height:160px;
      border-radius:50%;
      background:
        conic-gradient(#f2c94c ${pct}%, #e5e5e5 0);
      display:flex;
      align-items:center;
      justify-content:center;
    ">
      <div style="
        width:120px;
        height:120px;
        background:#fff;
        border-radius:50%;
        display:flex;
        flex-direction:column;
        align-items:center;
        justify-content:center;
      ">
        <div style="font-size:36px; font-weight:800;">
          ${pct}%
        </div>
        <div style="font-size:12px; letter-spacing:1px; color:#777;">
          READY
        </div>
      </div>
    </div>

    <div style="flex:1;">
      <div style="font-size:28px; font-weight:800;">
        ${pct}% · MODERATE READINESS
      </div>

      <div style="
        display:inline-block;
        margin-top:12px;
        padding:10px 22px;
        background:linear-gradient(90deg,#f2c94c,#f5d76e);
        border-radius:999px;
        font-weight:700;
        font-size:14px;
      ">
        Train with controlled load
      </div>
    </div>
  </div>

  <!-- COACH -->
  <div style="margin-top:40px;">
    <div style="font-size:20px; font-weight:800; margin-bottom:16px;">
      Coach Recommendation (Today)
    </div>

    <div style="display:flex; gap:16px;">
      <div style="width:4px; background:#f2c94c; border-radius:4px;"></div>

      <ul style="margin:0; padding-left:18px; font-size:15px; line-height:1.6;">
        ${recs.map(r => `<li>${r}</li>`).join("")}
      </ul>
    </div>
  </div>

  <!-- FOOTER -->
  <div style="
    margin-top:48px;
    text-align:center;
    font-size:12px;
    color:#888;
  ">
    Generated by ProAthleteCare® · Elite Athlete Monitoring System
  </div>
</div>
`;
}



function pacWaitImage(img, timeoutMs) {
  timeoutMs = timeoutMs || 3000;
  return new Promise(function(resolve) {
    if (!img) return resolve(false);
    if (img.complete && img.naturalWidth > 0) return resolve(true);

    var done = false;
    var t = setTimeout(function(){
      if (done) return;
      done = true;
      resolve(false);
    }, timeoutMs);

    img.onload = function() {
      if (done) return;
      done = true;
      clearTimeout(t);
      resolve(true);
    };
    img.onerror = function() {
      if (done) return;
      done = true;
      clearTimeout(t);
      resolve(false);
    };
  });
}

window.generateDashboardPDF = async function(filename) {
  filename = filename || "PAC_Daily_Report.pdf";

  if (!window.html2canvas || !(window.jspdf && window.jspdf.jsPDF)) {
    alert(pacWellnessText("missingPdfLibs", "Missing html2canvas / jsPDF"));
    return;
  }

  var JsPDF = window.jspdf.jsPDF;

  var el =
    document.getElementById("pdf-root") ||
    document.getElementById("pac-dashboard") ||
    document.querySelector(".dashboard") ||
    document.body;

  var canvas = await html2canvas(el, {
    backgroundColor: "#ffffff",
    scale: 2,
    useCORS: true,
    allowTaint: true,
    scrollX: 0,
    scrollY: 0
  });

  var imgData = canvas.toDataURL("image/jpeg", 0.92);

  var pdf = new JsPDF("p", "pt", "a4");
  var pageW = pdf.internal.pageSize.getWidth();
  var pageH = pdf.internal.pageSize.getHeight();

  var imgW = pageW;
  var imgH = (canvas.height * imgW) / canvas.width;

  if (!isFinite(imgH) || imgH <= 0) throw new Error("Bad image size for PDF (imgH)");

  if (imgH <= pageH) {
    pdf.addImage(imgData, "JPEG", 0, 0, imgW, imgH);
    pdf.save(filename);
    return;
  }

  var y = 0;
  while (y < imgH) {
    pdf.addImage(imgData, "JPEG", 0, -y, imgW, imgH);
    y += pageH;
    if (y < imgH) pdf.addPage();
  }

  pdf.save(filename);
};



// ===============================
// FINAL PDF (A4 1-page) + Charts
// ===============================
(function () {
  function pacFmtDate(iso) {
    // ISO YYYY-MM-DD -> "18 January 2026" (простий варіант без i18n)
    const d = new Date(iso + "T00:00:00");
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  }

  function pacReadinessLabel(pct) {
    if (pct >= 85) return { label: "HIGH READINESS", pill: "Train hard (if no pain)", status: "High" };
    if (pct >= 65) return { label: "MODERATE READINESS", pill: "Train with controlled load", status: "Moderate" };
    return { label: "LOW READINESS", pill: "Recovery / low intensity", status: "Low" };
  }

  function pacMetricRow(metric, score10, statusText, trendText, statusTone) {
    const badgeClass =
      statusTone === "good" ? "pac-badge pac-badge--good" :
      statusTone === "bad"  ? "pac-badge pac-badge--bad"  :
                              "pac-badge pac-badge--warn";

    return `
      <tr>
        <td>${metric}</td>
        <td>${score10}</td>
        <td><span class="${badgeClass}">${statusText}</span></td>
        <td class="pac-trend">${trendText}</td>
      </tr>
    `;
  }

  // 1) buildPdfLayout(day, athleteName) — наповнює #pdf-root
  window.buildPdfLayout = function buildPdfLayout(day, athleteName) {
    const root = document.getElementById("pdf-root");
    if (!root || !day || !day.scores) return;

    // logo
    const logoEl = document.getElementById("pac-pdf-logo");
    if (logoEl) {
      // твій логотип вже є в assets (в шапці сайту так само). :contentReference[oaicite:6]{index=6}
      logoEl.src = "../assets/images/AK_logo.png";
    }

    const s = day.scores;
    const pct = Math.round(Number(s.ready || 0) * 10);
    const r = pacReadinessLabel(pct);

    const athleteEl = document.getElementById("pac-pdf-athlete");
    const dateEl = document.getElementById("pac-pdf-date");
    const gaugeEl = document.getElementById("pac-gauge");
    const pctEl = document.getElementById("pac-pdf-ready-pct");
    const labelEl = document.getElementById("pac-pdf-ready-label");
    const lineEl = document.getElementById("pac-pdf-ready-line");
    const pillEl = document.getElementById("pac-pdf-ready-pill");

    if (athleteEl) athleteEl.textContent = athleteName || "Athlete";
    if (dateEl) dateEl.textContent = pacFmtDate(day.date);
    if (gaugeEl) gaugeEl.style.setProperty("--pct", pct + "%");
    if (pctEl) pctEl.textContent = pct + "%";
    if (labelEl) labelEl.textContent = r.label;
    if (lineEl) lineEl.textContent = `${pct}% · ${r.label}`;
    if (pillEl) pillEl.textContent = r.pill;

    // Coach recs (seeded random)
    const recs = (window.pacBuildDailyRecommendations ? window.pacBuildDailyRecommendations(s, day.date) : []) || [];
    const coachList = document.getElementById("pac-pdf-coach-list");
    if (coachList) {
      coachList.innerHTML = recs.slice(0, 3).map(t => `<li>${t}</li>`).join("");
    }

    // Key metrics table (як у зразку: sleep/hydration/stress/readiness + ще CNS fatigue)
    const tbody = document.getElementById("pac-pdf-metrics-tbody");
    if (tbody) {
      const sleep = Number(s.sleep || 0);
      const water = Number(s.water || 0);
      const stress = Number(s.stress || 0);
      const ready = Number(s.ready || 0);
      const labels = (typeof window.pacWellnessFieldLabels === "function")
        ? window.pacWellnessFieldLabels()
        : { sleep: "Sleep", soreness: "Pain", mood: "Mood", water: "Hydration", stress: "Stress", ready: "Readiness" };

      // прості статуси (потім можна ускладнити)
      const sleepStatus = sleep >= 7
  ? ["Оптимально", "Стабільно", "good"]
  : sleep >= 5
    ? ["Нижче норми", "Стабільно", "warn"]
    : ["Погано", "Низько", "bad"];

const waterStatus = water >= 7
  ? ["Норма", "Стабільно", "good"]
  : water >= 5
    ? ["Низько", "Низько", "warn"]
    : ["Дуже низько", "Низько", "bad"];

const stressStatus = stress <= 3
  ? ["Під контролем", "Помірно", "good"]
  : stress <= 6
    ? ["Помірно", "Помірно", "warn"]
    : ["Високо", "Зростає", "bad"];

const readyStatus = ready >= 7.5
  ? ["Висока", "Покращується", "good"]
  : ready >= 4.5
    ? ["Помірна", "Стабільно", "warn"]
    : ["Низька", "Низько", "bad"];

      // CNS fatigue — якщо окремого поля нема, лишаємо "—"
      tbody.innerHTML =
  pacMetricRow(labels.sleep, `${sleep}/10`, sleepStatus[0], sleepStatus[1], sleepStatus[2]) +
  pacMetricRow(pacWellnessText("cnsFatigue", "CNS Fatigue"), "—", pacWellnessText("stableShort", "Stable"), "—", "warn") +
  pacMetricRow(labels.water, `${water}/10`, waterStatus[0], waterStatus[1], waterStatus[2]) +
  pacMetricRow(labels.stress, `${stress}/10`, stressStatus[0], stressStatus[1], stressStatus[2]) +
  pacMetricRow(labels.ready, `${ready}/10`, readyStatus[0], readyStatus[1], readyStatus[2]);
    }
  };

  // 2) renderPdfCharts(day, historyArray) — малює line + radar В pdf-root
  window.renderPdfCharts = function renderPdfCharts(day, historyArray) {
  if (!window.Chart) return;

  const lineEl = document.getElementById("pac-pdf-line");
  const radarEl = document.getElementById("pac-pdf-radar");
  if (!lineEl || !radarEl) return;

  // destroy previous charts
  if (window.__pacPdfLineChart instanceof Chart) window.__pacPdfLineChart.destroy();
  if (window.__pacPdfRadarChart instanceof Chart) window.__pacPdfRadarChart.destroy();

  const h = (historyArray || []).slice().sort((a, b) => (a.date > b.date ? 1 : -1));
  const last7 = h.slice(-7);
  const labels = last7.map(x => (x.date || "").slice(5)); // MM-DD
  const readyData = last7.map(x => Math.round(Number(x.scores?.ready || 0) * 10));

  // ===== LINE (7-day) — GOLD =====
  window.__pacPdfLineChart = new Chart(lineEl, {
    type: "line",
    data: {
      labels,
      datasets: [{
        data: readyData,
        borderColor: "#FFC72C",                  // GOLD
        backgroundColor: "rgba(255,199,44,0.15)",// light GOLD fill
        borderWidth: 2.5,
        tension: 0.35,
        pointRadius: 3,
        pointBackgroundColor: "#FFC72C",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 1.5,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: {
        y: {
          min: 0,
          max: 100,
          ticks: { font: { size: 9 } },
          grid: { color: "#e6e6e8" }
        },
        x: {
          ticks: { font: { size: 9 }, maxRotation: 0, autoSkip: false },
          grid: { display: false }
        }
      }
    }
  });

  // ===== RADAR (today snapshot) — GOLD =====
  const s = day?.scores || {};
  const fieldLabels = (typeof window.pacWellnessFieldLabels === "function")
    ? window.pacWellnessFieldLabels()
    : { sleep: "Sleep", soreness: "Pain", mood: "Mood", water: "Hydration", stress: "Stress", ready: "Readiness" };
  const radarLabels = [
    fieldLabels.sleep,
    fieldLabels.soreness,
    fieldLabels.mood,
    fieldLabels.water,
    fieldLabels.stress,
    fieldLabels.ready
  ];
  const radarValues = [
    Number(s.sleep || 0),
    Number(s.soreness || 0),
    Number(s.mood || 0),
    Number(s.water || 0),
    Number(s.stress || 0),
    Number(s.ready || 0)
  ];

  window.__pacPdfRadarChart = new Chart(radarEl, {
    type: "radar",
    data: {
      labels: radarLabels,
      datasets: [{
        data: radarValues,
        borderColor: "#FFC72C",                   // GOLD
        backgroundColor: "rgba(255,199,44,0.25)", // GOLD fill
        borderWidth: 2,
        pointRadius: 2,
        pointBackgroundColor: "#FFC72C",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 1,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: {
        r: {
          min: 0,
          max: 10,
          ticks: { display: false },
          grid: { color: "#e6e6e8" },       // сіра "павутинка"
          angleLines: { color: "#e6e6e8" }, // сіра "павутинка"
          pointLabels: {
            font: { size: 9, weight: "600" },
            color: "#444"
          }
        }
      }
    }
  });
};


  function pacSleep(ms){ return new Promise(r => setTimeout(r, ms)); }

  // 3) generateDailyReportPDF() — вмикає режим → рендер → html2canvas → jsPDF (JPEG)
  window.generateDailyReportPDF = async function generateDailyReportPDF() {
    const root = document.getElementById("pdf-root");
    if (!root) return alert(pacWellnessText("pdfRootMissing", "PDF root not found."));

    const history = window.__wellnessHistoryArray || [];
    if (!history.length) return alert(pacWellnessText("noWellnessData", "No wellness data."));

    // беремо дату з UI, якщо є
    const input = document.getElementById("report-date");
    const picked = input && input.value ? input.value : null;

    const day =
      picked ? (history.slice().find(x => x.date === picked) || history[history.length - 1])
            : history[history.length - 1];

    const user = (window.firebase && firebase.auth) ? firebase.auth().currentUser : null;
    const athleteName = (user && (user.displayName || user.email)) ? (user.displayName || user.email) : "Athlete";

    document.body.classList.add("pac-report-mode");

    // наповнюємо layout + графіки
    window.buildPdfLayout(day, athleteName);
    window.renderPdfCharts(day, history);

    // дати браузеру “домалювати” canvas
    await pacSleep(150);

    if (!window.html2canvas || !(window.jspdf && window.jspdf.jsPDF)) {
      document.body.classList.remove("pac-report-mode");
      return alert(pacWellnessText("missingPdfLibs", "Missing html2canvas / jsPDF"));
    }

    const canvas = await html2canvas(document.getElementById("pac-pdf-page"), {
      backgroundColor: "#ffffff",
      scale: 2,
      useCORS: true,
      allowTaint: true,
      scrollX: 0,
      scrollY: 0
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.95);

    const pdf = new window.jspdf.jsPDF("p", "pt", "a4");
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();

    const imgW = pageW;
    const imgH = (canvas.height * imgW) / canvas.width;

    // ВПИСУЄМО в 1 сторінку A4 (без розрізання)
    pdf.addImage(imgData, "JPEG", 0, 0, imgW, Math.min(imgH, pageH));
    pdf.save("Daily_Wellness_Report.pdf");

    document.body.classList.remove("pac-report-mode");
  };

  // ===============================
  // GDPR UI: Delete all / Export
  // ===============================

  window.pacExportMyData = function pacExportMyData() {
    const user = (window.firebase && firebase.auth) ? firebase.auth().currentUser : null;
    const uid = getWellnessEffectiveUid(user?.uid || "guest") || "guest";
    const history = window.__wellnessHistoryArray || [];

    const payload = {
      userId: uid,
      exportedAt: new Date().toISOString(),
      wellnessReports: history.map(x => ({ date: x.date, scores: x.scores }))
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `pac_wellness_export_${uid}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  window.pacDeleteMyData = async function pacDeleteMyData() {
    const user = (window.firebase && firebase.auth) ? firebase.auth().currentUser : null;
    if (!user || !window.db) return alert(pacWellnessText("notSignedIn", "Not signed in."));
    if (isWellnessDelegatedReadOnly()) {
      alert(pacWellnessText("readOnlyDelegated", "Read-only mode: viewing delegated athlete."));
      return;
    }
    const uid = getWellnessEffectiveUid(user.uid);

    if (!confirm(pacWellnessText("confirmDeleteAll", "Delete ALL your wellness reports? This cannot be undone."))) return;

    try {
      const snap = await window.db.collection("wellness_reports").where("userId", "==", uid).get();
      const batch = window.db.batch();
      snap.forEach(doc => batch.delete(doc.ref));
      await batch.commit();

      localStorage.removeItem("wellnessHistory");
      localStorage.removeItem("lastWellnessSubmissionDate");
      alert(pacWellnessText("deleteAllSuccess", "All wellness reports deleted."));
      await window.syncWellnessFromFirebase(uid);
    } catch (e) {
      console.error(e);
      alert(pacWellnessTextFmt("deleteFailedWithMessage", { message: e.message }, "Delete failed: {message}"));
    }
  };
})();
