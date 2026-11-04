// /js/admin.js - ProAthleteCare Admin Dashboard (stable, sortable, fast)
// Requires globals: firebase, db (from firebase-config.js)

(function () {
  "use strict";

  // set your admin email
  const ADMIN_EMAIL = "kulyk015@gmail.com";

  const USERS_COL = "users";
  const CLIENT_ERRORS_COL = "client_errors";
  const WELLNESS_COL = "wellness_reports";
  const INJURY_COL = "injuries";
  const WEIGHT_COL = "weight_history";
  const POWER_TOP_COL = "power_tests"; // /power_tests/{uid}/tests/{tid}
  const ENRICH_LIMIT_P3 = 30; // top priority users (full enrich)
  const ENRICH_LIMIT_P2 = 10; // medium priority users (light enrich)
  const CLIENT_ERRORS_LIMIT = 200;
  const CLIENT_ERRORS_WINDOW_MS = 24 * 60 * 60 * 1000;
  const USERS_PAGE_SIZE = 400;
  const USERS_MAX_FETCH = 5000;
  const BROKEN_TEXT_RE = /(Ð.|Ñ.|â€|âœ|Ã.|Â.|ï¿½)/;
  const PAYMENT_FAIL_TOKENS = [
    "fail", "failed", "declin", "past_due", "unpaid", "incomplete",
    "requires_payment_method", "requires_action", "error", "canceled", "cancelled"
  ];
  const PAYMENT_STATUS_KEYS = [
    "paymentStatus", "lastPaymentStatus", "stripeStatus", "subscriptionStatus",
    "billingStatus", "invoiceStatus", "checkoutStatus", "paymentIntentStatus"
  ];
  const PAYMENT_ERROR_KEYS = [
    "paymentError", "lastPaymentError", "billingError", "stripeError",
    "invoiceError", "checkoutError", "paymentFailureReason"
  ];
  const PAYMENT_TIME_KEYS = [
    "paymentFailedAtMs", "lastPaymentFailedAtMs", "lastBillingErrorAtMs",
    "lastInvoiceFailedAtMs", "paymentErrorAtMs"
  ];
  const STORAGE_LANG_KEY = "pac_lang";
  const SUPPORTED_LANGS = ["uk", "en", "de", "es", "ru", "pt"];


  const UI = {
    tbody: () => document.getElementById("athletes-tbody"),
    search: () => document.getElementById("search-input"),
    refresh: () => document.getElementById("refresh-btn"),
    langSelect: () => document.getElementById("admin-lang-select"),
    toggleAthleteViewBtn: () => document.getElementById("toggle-athlete-view-btn"),
    legacyAthleteBlock: () => document.getElementById("legacy-athlete-block"),
    adminMe: () => document.getElementById("admin-me"),
    logout: () => document.getElementById("logout-btn"),
    planTabs: () => document.querySelectorAll("#plan-tabs [data-plan-tab]"),
    planNote: () => document.getElementById("plan-tab-note"),
    moduleButtons: () => document.querySelectorAll("[data-admin-module-btn]"),
    moduleLinks: () => document.querySelectorAll("[data-admin-module]"),
    moduleSubtitle: () => document.getElementById("admin-module-subtitle"),
    ovOnlineNow: () => document.getElementById("ov-online-now"),
    ovActive24h: () => document.getElementById("ov-active-24h"),
    ovActive7d: () => document.getElementById("ov-active-7d"),
    ovTrialExpired: () => document.getElementById("ov-trial-expired"),
    ovPaymentFailed: () => document.getElementById("ov-payment-failed"),
    ovSystemAlerts: () => document.getElementById("ov-system-alerts"),
    opsAlertsList: () => document.getElementById("ops-alerts-list"),
    exTotalUsers: () => document.getElementById("ex-total-users"),
    exPaidActive: () => document.getElementById("ex-paid-active"),
    exTrialLive: () => document.getElementById("ex-trial-live"),
    exBillingRisk: () => document.getElementById("ex-billing-risk"),
    exDau: () => document.getElementById("ex-dau"),
    exWau: () => document.getElementById("ex-wau"),
    exMau: () => document.getElementById("ex-mau"),
    exRenew7d: () => document.getElementById("ex-renew-7d"),
    execBillingList: () => document.getElementById("exec-billing-list"),
    execGrowthList: () => document.getElementById("exec-growth-list"),
    execHealthList: () => document.getElementById("exec-health-list"),
  };

  const I18N = {
    en: {
      "button.refresh": "REFRESH",
      "button.showAthletes": "SHOW ATHLETES",
      "button.hideAthletes": "HIDE ATHLETES",
      "button.logout": "LOGOUT",
      "admin.prefix": "Admin",
      "page.tagline": "Online training and professional athlete support",
      "main.title": "ADMIN OPERATIONS HUB",
      "main.subtitle": "Executive overview first. Athlete table is hidden by default.",
      "nav.overview": "Overview",
      "nav.billing": "Billing",
      "nav.users": "Users",
      "nav.security": "Security",
      "nav.audit": "Audit",
      "nav.incidents": "Incidents",
      "nav.costs": "Costs",
      "nav.coachMode": "Coach Workspace",
      "nav.datePlan": "Date Plan",
      "module.overview": "Overview",
      "module.billing": "Billing",
      "module.users": "Users",
      "module.security": "Security",
      "module.audit": "Audit",
      "module.incidents": "Incidents",
      "module.costs": "Costs",
      "module.subtitle.overview": "Command center view: high-level product, billing, growth, and system health.",
      "module.subtitle.billing": "Billing operations: failed payments, expiring access, trial conversion risks.",
      "module.subtitle.users": "User operations: activation and coach assignment. Open MANAGE on a user to assign coach.",
      "module.subtitle.security": "Security operations: role anomalies, profile integrity, and hardening queue.",
      "module.subtitle.audit": "Audit operations: what changed, what is missing, and traceability gaps.",
      "module.subtitle.incidents": "Incident operations: open alerts, severity, and response playbooks.",
      "module.subtitle.costs": "Cost operations: read strategy, priority budgets, and Firebase governance.",
      "kpi.totalUsers": "TOTAL USERS",
      "kpi.paidActive": "PAID ACTIVE",
      "kpi.trialLive": "TRIAL LIVE",
      "kpi.billingRisk": "BILLING RISK",
      "kpi.dau": "DAU",
      "kpi.wau": "WAU",
      "kpi.mau": "MAU",
      "kpi.renew7d": "RENEWALS 7D",
      "panel.billing": "Billing Radar",
      "panel.growth": "Growth & Retention",
      "panel.health": "System & Data Health",
      "legacy.title": "Legacy Athlete View",
      "legacy.subtitle": "Temporary hidden mode. Use only for manual athlete inspection.",
      "search.placeholder": "Search (name / email / uid)",
      "legacy.onlineNow": "ONLINE NOW",
      "legacy.visits24h": "VISITS 24H",
      "legacy.visits7d": "VISITS 7D",
      "legacy.trialExpired": "TRIAL EXPIRED",
      "legacy.paymentFailed": "PAYMENT FAILED",
      "legacy.systemAlerts": "SYSTEM ALERTS",
      "ops.title": "Ops Alerts",
      "table.athlete": "ATHLETE",
      "table.weight": "WEIGHT",
      "table.acwr": "ACWR/PWR",
      "table.wellness": "WELLNESS",
      "table.injury": "INJURY",
      "table.lastSeen": "LAST SEEN",
      "table.actions": "ACTIONS",
      "plan.all": "ALL",
      "plan.p3": "PRIORITY 3",
      "plan.p2": "PRIORITY 2",
      "plan.p1": "PRIORITY 1",
      "note.overview": "Overview mode. PRIORITY 3 is analyzed first. Trial expired users stay red.",
      "note.p3": "Priority 3 users. Full analysis enabled.",
      "note.p2": "Priority 2 users. Light analysis to reduce reads.",
      "note.p1": "Priority 1 users. No expensive analysis to protect Firebase budget.",
      "modal.close": "Close",
      "modal.role": "Role",
      "modal.roleHint": "admin role allowed only for kulyk015@gmail.com",
      "modal.coach": "Coach",
      "modal.quick": "Quick actions",
      "modal.chat": "Chat",
      "modal.trial7": "Set Trial 7 days",
      "modal.activate30": "Activate 30 days",
      "modal.deactivate": "Deactivate",
      "modal.coachMode": "Coach Mode",
      "modal.chatPlaceholder": "Write message...",
      "modal.send": "Send",
      "modal.reset": "Reset",
      "modal.save": "Save",
      "modal.onboarding": "Onboarding",
      "modal.sport": "Sport",
      "modal.season": "Season",
      "modal.position": "Position",
      "modal.goals": "Goals",
      "alert.accessDenied": "Access denied (not admin).",
      "alert.loadFailed": "Error",
      "alert.sendFailed": "Send failed",
      "label.error": "Error",
      "list.noCritical": "No critical alerts.",
      "list.noMessages": "No messages",
      "status.live": "Live",
      "table.loading": "LOADING..."
    },
    uk: {
      "button.refresh": "ОНОВИТИ",
      "button.showAthletes": "ПОКАЗАТИ АТЛЕТІВ",
      "button.hideAthletes": "ПРИХОВАТИ АТЛЕТІВ",
      "button.logout": "ВИЙТИ",
      "admin.prefix": "Адмін",
      "page.tagline": "Онлайн-тренування та професійна підтримка атлетів",
      "main.title": "АДМІН ОПЕРАЦІЙНИЙ ХАБ",
      "main.subtitle": "Спочатку виконавчий огляд. Таблиця атлетів прихована за замовчуванням.",
      "nav.overview": "Огляд",
      "nav.billing": "Оплати",
      "nav.users": "Користувачі",
      "nav.security": "Безпека",
      "nav.audit": "Аудит",
      "nav.incidents": "Інциденти",
      "nav.costs": "Витрати",
      "nav.coachMode": "Робоче місце тренера",
      "nav.datePlan": "План за датами",
      "module.overview": "Огляд",
      "module.billing": "Оплати",
      "module.users": "Користувачі",
      "module.security": "Безпека",
      "module.audit": "Аудит",
      "module.incidents": "Інциденти",
      "module.costs": "Витрати",
      "module.subtitle.overview": "Режим командного центру: загальний стан продукту, оплат, росту та системи.",
      "module.subtitle.billing": "Білінг-режим: фейли оплат, завершення доступу, ризики trial.",
      "module.subtitle.users": "Користувачі: активація і призначення тренера. Натисни MANAGE у користувача, щоб призначити тренера.",
      "module.subtitle.security": "Безпека: аномалії ролей, цілісність профілів, черга посилення.",
      "module.subtitle.audit": "Аудит: що змінювалось, чого не вистачає, прогалини трасування.",
      "module.subtitle.incidents": "Інциденти: відкриті алерти, серйозність і плейбуки реакції.",
      "module.subtitle.costs": "Витрати: стратегія reads, пріоритетні бюджети і контроль Firebase.",
      "kpi.totalUsers": "УСЬОГО КОРИСТУВАЧІВ",
      "kpi.paidActive": "АКТИВНА ОПЛАТА",
      "kpi.trialLive": "АКТИВНИЙ TRIAL",
      "kpi.billingRisk": "РИЗИК ОПЛАТ",
      "kpi.dau": "DAU",
      "kpi.wau": "WAU",
      "kpi.mau": "MAU",
      "kpi.renew7d": "ПРОДОВЖЕННЯ 7Д",
      "panel.billing": "Радар оплат",
      "panel.growth": "Ріст і утримання",
      "panel.health": "Стан системи і даних",
      "legacy.title": "Legacy перегляд атлетів",
      "legacy.subtitle": "Тимчасово прихований режим. Використовуй лише для ручної перевірки.",
      "search.placeholder": "Пошук (ім'я / email / uid)",
      "legacy.onlineNow": "ОНЛАЙН ЗАРАЗ",
      "legacy.visits24h": "ВІЗИТИ 24Г",
      "legacy.visits7d": "ВІЗИТИ 7Д",
      "legacy.trialExpired": "TRIAL ПРОСТРОЧЕНО",
      "legacy.paymentFailed": "ОПЛАТА НЕ ПРОЙШЛА",
      "legacy.systemAlerts": "СИСТЕМНІ АЛЕРТИ",
      "ops.title": "Ops алерти",
      "table.athlete": "АТЛЕТ",
      "table.weight": "ВАГА",
      "table.acwr": "ACWR/PWR",
      "table.wellness": "САМОПОЧУТТЯ",
      "table.injury": "ТРАВМА",
      "table.lastSeen": "ОСТАННЯ АКТИВНІСТЬ",
      "table.actions": "ДІЇ",
      "plan.all": "УСІ",
      "plan.p3": "ПРІОРИТЕТ 3",
      "plan.p2": "ПРІОРИТЕТ 2",
      "plan.p1": "ПРІОРИТЕТ 1",
      "note.overview": "Режим огляду. ПРІОРИТЕТ 3 аналізується першим. Прострочені trial залишаються червоними.",
      "note.p3": "Користувачі пріоритету 3. Увімкнено повний аналіз.",
      "note.p2": "Користувачі пріоритету 2. Легкий аналіз для зменшення reads.",
      "note.p1": "Користувачі пріоритету 1. Без дорогого аналізу для захисту бюджету Firebase.",
      "modal.close": "Закрити",
      "modal.role": "Роль",
      "modal.roleHint": "роль admin дозволена тільки для kulyk015@gmail.com",
      "modal.coach": "Тренер",
      "modal.quick": "Швидкі дії",
      "modal.chat": "Чат",
      "modal.trial7": "Поставити Trial 7 днів",
      "modal.activate30": "Активувати на 30 днів",
      "modal.deactivate": "Деактивувати",
      "modal.coachMode": "Режим тренера",
      "modal.chatPlaceholder": "Напиши повідомлення...",
      "modal.send": "Надіслати",
      "modal.reset": "Скинути",
      "modal.save": "Зберегти",
      "modal.onboarding": "Онбординг",
      "modal.sport": "Спорт",
      "modal.season": "Сезон",
      "modal.position": "Позиція",
      "modal.goals": "Цілі",
      "alert.accessDenied": "Доступ заборонено (не адмін).",
      "alert.loadFailed": "Помилка",
      "alert.sendFailed": "Не вдалося відправити",
      "label.error": "Помилка",
      "list.noCritical": "Критичних алертів немає.",
      "list.noMessages": "Повідомлень немає",
      "status.live": "Онлайн",
      "table.loading": "ЗАВАНТАЖЕННЯ..."
    },
    de: { "button.refresh": "AKTUALISIEREN", "button.showAthletes": "ATHLETEN ANZEIGEN", "button.hideAthletes": "ATHLETEN AUSBLENDEN", "button.logout": "ABMELDEN", "admin.prefix": "Admin" },
    es: { "button.refresh": "ACTUALIZAR", "button.showAthletes": "MOSTRAR ATLETAS", "button.hideAthletes": "OCULTAR ATLETAS", "button.logout": "SALIR", "admin.prefix": "Admin" },
    ru: { "button.refresh": "ОБНОВИТЬ", "button.showAthletes": "ПОКАЗАТЬ АТЛЕТОВ", "button.hideAthletes": "СКРЫТЬ АТЛЕТОВ", "button.logout": "ВЫЙТИ", "admin.prefix": "Админ" },
    pt: { "button.refresh": "ATUALIZAR", "button.showAthletes": "MOSTRAR ATLETAS", "button.hideAthletes": "OCULTAR ATLETAS", "button.logout": "SAIR", "admin.prefix": "Admin" }
  };

  const UK_DYNAMIC_REPLACEMENTS = [
    ["Payment failed", "Оплата не пройшла"],
    ["Active but expired", "Active, але прострочено"],
    ["Active no paidUntilMs", "Active без paidUntilMs"],
    ["Renewal due in 7d", "Продовження за 7д"],
    ["New users (7d)", "Нові користувачі (7д)"],
    ["New users (30d)", "Нові користувачі (30д)"],
    ["Athletes with coach", "Атлетів з тренером"],
    ["Priority silent 14d+", "Тихі пріоритетні 14д+"],
    ["System alerts", "Системні алерти"],
    ["Client errors (24h)", "Клієнтські помилки (24г)"],
    ["Client errors 24h", "Клієнтські помилки 24г"],
    ["Client incidents (24h)", "Клієнтські інциденти (24г)"],
    ["Top pages", "Топ сторінки"],
    ["Top errors", "Топ помилки"],
    ["Frontend runtime errors captured from athlete/coach/admin sessions.", "Frontend runtime помилки, зібрані із сесій атлета/тренера/адміна."],
    ["Broken text suspects", "Підозра на битий текст"],
    ["Trial expired pending", "Прострочений trial у черзі"],
    ["Missing core profile fields", "Відсутні базові поля профілю"],
    ["Data hygiene status", "Стан якості даних"],
    ["Needs review", "Потрібна перевірка"],
    ["Healthy", "Норма"],
    ["No critical alerts.", "Критичних алертів немає."],
    ["TRIAL no end date", "TRIAL без кінцевої дати"],
    ["TRIAL EXPIRED", "TRIAL ПРОСТРОЧЕНО"],
    ["TRIAL ", "TRIAL "],
    [" left", " днів лишилось"],
    ["ACTIVE EXPIRED", "ACTIVE ПРОСТРОЧЕНО"],
    ["ACTIVE ", "ACTIVE "],
    ["INACTIVE", "НЕАКТИВНИЙ"],
    ["trialEndsAtMs is missing", "trialEndsAtMs відсутній"],
    ["ended ", "завершився "],
    ["ends ", "до "],
    ["paid ended ", "оплата закінчилась "],
    ["paid until ", "оплачено до "],
    ["no paidUntilMs", "немає paidUntilMs"],
    ["access closed", "доступ закрито"],
    ["Online", "Онлайн"],
    ["WEEKLY", "ТИЖДЕНЬ"],
    ["MANAGE", "КЕРУВАТИ"],
    ["Overview mode. PRIORITY 3 is analyzed first. Trial expired users stay red.", "Режим огляду. ПРІОРИТЕТ 3 аналізується першим. Прострочені trial лишаються червоними."],
    ["Priority 3 users. Full analysis enabled.", "Користувачі пріоритету 3. Увімкнено повний аналіз."],
    ["Priority 2 users. Light analysis to reduce reads.", "Користувачі пріоритету 2. Легкий аналіз для зменшення reads."],
    ["Priority 1 users. No expensive analysis to protect Firebase budget.", "Користувачі пріоритету 1. Без дорогого аналізу для захисту бюджету Firebase."],
    ["No users in", "Немає користувачів у"],
    ["tab", "вкладці"],
    ["No messages", "Повідомлень немає"],
    ["Frontend errors: inspect client_errors feed and hotfix top pages/messages", "Frontend помилки: перевірити стрічку client_errors і виправити топові сторінки/повідомлення"],
    ["Live", "Онлайн"],
    ["LOADING...", "ЗАВАНТАЖЕННЯ..."],
    ["Error:", "Помилка:"]
  ];

  let currentLang = "en";

  function normalizeLang(v) {
    const lang = String(v || "").toLowerCase();
    return SUPPORTED_LANGS.includes(lang) ? lang : "en";
  }

  function readStoredLang() {
    try { return normalizeLang(localStorage.getItem(STORAGE_LANG_KEY)); } catch { return "en"; }
  }

  function saveStoredLang(lang) {
    try { localStorage.setItem(STORAGE_LANG_KEY, normalizeLang(lang)); } catch {}
  }

  function t(key) {
    const lang = normalizeLang(currentLang);
    return normalizeText((I18N[lang] && I18N[lang][key]) || (I18N.en && I18N.en[key]) || key);
  }

  function linkTextWithIcon(id, text) {
    const el = document.getElementById(id);
    if (!el) return;
    const icon = el.querySelector("img");
    el.textContent = `${text} `;
    if (icon) el.appendChild(icon);
  }

  function translateDynamicText(text) {
    let out = String(text ?? "");
    if (normalizeLang(currentLang) !== "uk") return out;
    for (const [from, to] of UK_DYNAMIC_REPLACEMENTS) {
      out = out.split(from).join(to);
    }
    return out;
  }

  function applyStaticI18n() {
    document.documentElement.lang = normalizeLang(currentLang);

    linkTextWithIcon("admin-nav-command-center", t("nav.overview"));
    linkTextWithIcon("admin-nav-billing", t("nav.billing"));
    linkTextWithIcon("admin-nav-users", t("nav.users"));
    linkTextWithIcon("admin-nav-security", t("nav.security"));
    linkTextWithIcon("admin-nav-audit", t("nav.audit"));
    linkTextWithIcon("admin-nav-incidents", t("nav.incidents"));
    linkTextWithIcon("admin-nav-costs", t("nav.costs"));
    linkTextWithIcon("admin-nav-coach-mode", t("nav.coachMode"));
    linkTextWithIcon("admin-nav-date-plan", t("nav.datePlan"));

    const me = UI.adminMe();
    if (me && me.dataset.email) me.textContent = `${t("admin.prefix")}: ${me.dataset.email}`;

    const tag = document.getElementById("admin-page-tagline");
    if (tag) tag.textContent = t("page.tagline");
    const mainTitle = document.getElementById("admin-main-title");
    if (mainTitle) mainTitle.textContent = t("main.title");
    const mainSub = document.getElementById("admin-main-subtitle");
    if (mainSub) mainSub.textContent = t("main.subtitle");

    UI.moduleButtons().forEach((btn) => {
      const moduleId = String(btn.getAttribute("data-admin-module-btn") || "").toLowerCase();
      if (!moduleId) return;
      btn.textContent = t(`module.${moduleId}`);
    });
    const moduleSubtitle = UI.moduleSubtitle();
    if (moduleSubtitle) moduleSubtitle.textContent = t(`module.subtitle.${activeModule}`);

    if (UI.refresh()) UI.refresh().textContent = t("button.refresh");
    if (UI.logout()) UI.logout().textContent = t("button.logout");

    const labels = [
      ["ex-k-total-users", "kpi.totalUsers"],
      ["ex-k-paid-active", "kpi.paidActive"],
      ["ex-k-trial-live", "kpi.trialLive"],
      ["ex-k-billing-risk", "kpi.billingRisk"],
      ["ex-k-dau", "kpi.dau"],
      ["ex-k-wau", "kpi.wau"],
      ["ex-k-mau", "kpi.mau"],
      ["ex-k-renew-7d", "kpi.renew7d"],
      ["ex-panel-billing-title", "panel.billing"],
      ["ex-panel-growth-title", "panel.growth"],
      ["ex-panel-health-title", "panel.health"],
      ["legacy-title", "legacy.title"],
      ["legacy-subtitle", "legacy.subtitle"],
      ["ov-k-online-now", "legacy.onlineNow"],
      ["ov-k-active-24h", "legacy.visits24h"],
      ["ov-k-active-7d", "legacy.visits7d"],
      ["ov-k-trial-expired", "legacy.trialExpired"],
      ["ov-k-payment-failed", "legacy.paymentFailed"],
      ["ov-k-system-alerts", "legacy.systemAlerts"],
      ["ops-alerts-title", "ops.title"],
      ["th-athlete", "table.athlete"],
      ["th-weight", "table.weight"],
      ["th-acwr", "table.acwr"],
      ["th-wellness", "table.wellness"],
      ["th-injury", "table.injury"],
      ["th-last-seen", "table.lastSeen"],
      ["th-actions", "table.actions"],
      ["mClose", "modal.close"],
      ["m-role-label", "modal.role"],
      ["m-role-hint", "modal.roleHint"],
      ["m-coach-label", "modal.coach"],
      ["m-quick-actions-label", "modal.quick"],
      ["m-chat-label", "modal.chat"],
      ["qaTrial7", "modal.trial7"],
      ["qaAct30", "modal.activate30"],
      ["qaDeactivate", "modal.deactivate"],
      ["qaCoachMode", "modal.coachMode"],
      ["chatSend", "modal.send"],
      ["mReset", "modal.reset"],
      ["mSave", "modal.save"]
    ];
    labels.forEach(([id, key]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = t(key);
    });

    if (UI.search()) UI.search().placeholder = t("search.placeholder");
    const chatText = document.getElementById("chatText");
    if (chatText) chatText.placeholder = t("modal.chatPlaceholder");

    const bAll = document.querySelector('#plan-tabs [data-plan-tab="all"]');
    const bP3 = document.querySelector('#plan-tabs [data-plan-tab="p3"]');
    const bP2 = document.querySelector('#plan-tabs [data-plan-tab="p2"]');
    const bP1 = document.querySelector('#plan-tabs [data-plan-tab="p1"]');
    if (bAll) bAll.setAttribute("data-label", t("plan.all"));
    if (bP3) bP3.setAttribute("data-label", t("plan.p3"));
    if (bP2) bP2.setAttribute("data-label", t("plan.p2"));
    if (bP1) bP1.setAttribute("data-label", t("plan.p1"));

    if (modalSnapshot) renderManageOnboardingSummary(modalSnapshot);
  }

  // ---------- Helpers ----------
  function normalizeText(value) {
    const raw = String(value ?? "");
    if (!/[\u00D0\u00D1\u00C2\u00C3\u00E2\uFFFD]|ï¿½/.test(raw)) return raw;
    try {
      return decodeURIComponent(escape(raw));
    } catch {
      return raw;
    }
  }

  function esc(s) {
    return normalizeText(s).replace(/[&<>"']/g, (m) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[m]));
  }

  function pickOnboardingSport(u) {
    return String(u?.sportType || u?.sport || u?.onboarding?.summary?.sport || u?.onboarding?.sport || "").trim();
  }

  function pickAthleteTeam(u) {
    return String(u?.club || u?.team || u?.clubName || u?.onboarding?.club || "").trim();
  }

  function normalizeSportLabel(raw) {
    const src = String(raw || "").trim();
    if (!src) return "";
    const key = src.toLowerCase();
    const map = {
      football: "Football",
      soccer: "Football",
      futsal: "Futsal",
      basketball: "Basketball",
      handball: "Handball",
      volleyball: "Volleyball",
      rugby: "Rugby",
      athletics: "Athletics",
      tennis: "Tennis",
      hockey: "Hockey"
    };
    if (map[key]) return map[key];
    return src
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function athleteMetaLine(u) {
    const team = pickAthleteTeam(u);
    const sport = normalizeSportLabel(pickOnboardingSport(u));
    return `${team || "—"} • ${sport || "—"}`;
  }

  function pickOnboardingSeason(u) {
    return String(u?.seasonPhase || u?.season || "").trim();
  }

  function pickOnboardingPosition(u) {
    return String(u?.playerPosition || u?.position || "").trim();
  }

  function pickOnboardingGoals(u) {
    const topGoals = Array.isArray(u?.goals) ? u.goals : [];
    const summaryGoals = Array.isArray(u?.onboarding?.summary?.goals) ? u.onboarding.summary.goals : [];
    const arr = (topGoals.length ? topGoals : summaryGoals)
      .map((x) => String(x || "").trim())
      .filter(Boolean);
    return arr.length ? arr.slice(0, 3).join(", ") : "";
  }

  function renderManageOnboardingSummary(u) {
    const host = document.getElementById("mOnboardingSummary");
    if (!host) return;
    const sport = pickOnboardingSport(u) || "-";
    const season = pickOnboardingSeason(u) || "-";
    const position = pickOnboardingPosition(u) || "-";
    const goals = pickOnboardingGoals(u) || "-";
    host.innerHTML = `
      <div style="font-size:11px; color:#999; text-transform:uppercase; letter-spacing:.08em;">${esc(t("modal.onboarding"))}</div>
      <div style="margin-top:6px; display:grid; gap:4px;">
        <div><b>${esc(t("modal.sport"))}:</b> ${esc(sport)}</div>
        <div><b>${esc(t("modal.season"))}:</b> ${esc(season)}</div>
        <div><b>${esc(t("modal.position"))}:</b> ${esc(position)}</div>
        <div><b>${esc(t("modal.goals"))}:</b> ${esc(goals)}</div>
      </div>`;
  }

  function safeMillis(ts) {
    if (!ts) return 0;
    try {
      if (typeof ts === "number") return ts;
      if (ts.toMillis) return ts.toMillis();
      if (ts.toDate) return ts.toDate().getTime();
      return new Date(ts).getTime() || 0;
    } catch { return 0; }
  }

  function getTimeSince(ms) {
    if (!ms) return `<span style="opacity:.45">-</span>`;
    const diff = Date.now() - ms;
    const mins = Math.floor(diff / 60000);
    if (mins < 5) return `<b style="color:#00ff00; text-shadow:0 0 6px rgba(0,255,0,.55)">${esc(translateDynamicText("● Online"))}</b>`;
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(diff / 3600000);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(diff / 86400000)}d`;
  }

  function fmtDateShort(ms) {
    const n = Number(ms || 0);
    if (!Number.isFinite(n) || n <= 0) return "-";
    try {
      return new Date(n).toLocaleDateString();
    } catch {
      return "-";
    }
  }

  function daysFromNow(targetMs) {
    const n = Number(targetMs || 0);
    if (!Number.isFinite(n) || n <= 0) return null;
    return Math.ceil((n - Date.now()) / 86400000);
  }

  function getPlanStatus(u) {
    const s = String(u?.planStatus || "").toLowerCase();
    if (s === "trial" || s === "active" || s === "inactive") return s;
    return "trial";
  }

  function getPlanPriority(u) {
    const explicitNum = Number(u?.planPriority ?? u?.priority ?? NaN);
    if (Number.isFinite(explicitNum) && explicitNum >= 1 && explicitNum <= 3) {
      return Math.round(explicitNum);
    }

    const raw = String(
      u?.planId ??
      u?.plan ??
      u?.subscriptionTier ??
      u?.tier ??
      ""
    ).toLowerCase();

    if (raw === "3" || raw.includes("pro") || raw.includes("tier3") || raw.includes("priority3")) return 3;
    if (raw === "2" || raw.includes("plus") || raw.includes("tier2") || raw.includes("priority2")) return 2;
    if (raw === "1" || raw.includes("basic") || raw.includes("tier1") || raw.includes("priority1")) return 1;

    // Fallback: treat unknown as lowest priority to protect Firestore budget.
    return 1;
  }

  function planPriorityLabel(p) {
    if (p === 3) return "PRIORITY 3";
    if (p === 2) return "PRIORITY 2";
    return "PRIORITY 1";
  }

  function priorityColor(p) {
    if (p === 3) return "#00ff88";
    if (p === 2) return "#FFC72C";
    return "#9aa8ff";
  }

  function toLow(v) {
    return String(v ?? "").trim().toLowerCase();
  }

  function hasPaymentFailToken(v) {
    const s = toLow(v);
    if (!s) return false;
    return PAYMENT_FAIL_TOKENS.some((t) => s.includes(t));
  }

  function isLikelyBrokenText(v) {
    const raw = String(v ?? "");
    if (!raw) return false;
    if (!BROKEN_TEXT_RE.test(raw)) return false;
    const fixed = normalizeText(raw);
    if (fixed !== raw) return true;
    return /(Ð.|Ñ.|â€|âœ|Ã.|Â.|ï¿½)/.test(raw);
  }

  function userHasBrokenText(u) {
    const fields = [
      u?.displayName, u?.name, u?.firstName, u?.lastName, u?.email,
      u?.coachNote, u?.overrideStatus
    ];
    return fields.some(isLikelyBrokenText);
  }

  function inspectPaymentIssue(u) {
    if (!u) return null;
    const reasons = [];
    let atMs = 0;

    for (const key of PAYMENT_STATUS_KEYS) {
      const value = toLow(u[key]);
      if (!value) continue;
      if (hasPaymentFailToken(value)) reasons.push(`${key}: ${value}`);
    }

    for (const key of PAYMENT_ERROR_KEYS) {
      const value = String(u[key] ?? "").trim();
      if (!value) continue;
      reasons.push(`${key}: ${value.slice(0, 80)}`);
    }

    for (const key of PAYMENT_TIME_KEYS) {
      const ms = Number(u[key] || 0);
      if (Number.isFinite(ms) && ms > 0) atMs = Math.max(atMs, ms);
    }

    const status = getPlanStatus(u);
    const paidUntilMs = Number(u?.paidUntilMs || 0);
    if (status === "active" && paidUntilMs > 0 && paidUntilMs < Date.now()) {
      reasons.push(`paidUntilMs expired ${fmtDateShort(paidUntilMs)}`);
    }

    if (!reasons.length) return null;
    return {
      uid: String(u.uid || ""),
      label: normalizeText(u.displayName || u.name || u.email || u.uid || "Unknown"),
      reasons: [...new Set(reasons)].slice(0, 3),
      atMs,
    };
  }

  function normalizeClientErrorPage(value) {
    const raw = normalizeText(String(value || "").trim());
    if (!raw) return "unknown";
    try {
      const u = new URL(raw, window.location.origin);
      const cleaned = String(u.pathname || "").split("/").filter(Boolean).pop();
      return cleaned || "unknown";
    } catch {
      const cleaned = raw.split("?")[0].split("#")[0];
      const tail = cleaned.split("/").filter(Boolean).pop();
      return tail || cleaned || "unknown";
    }
  }

  function buildOpsSummary() {
    const now = Date.now();
    const paymentFailed = [];
    const activeExpired = [];
    const activeNoPaidUntil = [];
    const trialExpired = [];
    const brokenText = [];
    const highPrioritySilent = [];
    const alertUidSet = new Set();
    const clientErrors24h = [];
    const clientErrorTop = new Map();
    const clientErrorPages = new Map();
    const clientErrorMessages = new Map();
    let clientErrorsP1 = 0;

    for (const u of ALL) {
      const uid = String(u.uid || "");
      const status = getPlanStatus(u);
      const paidMs = Number(u?.paidUntilMs || 0);
      const trialMs = Number(u?.trialEndsAtMs || 0);

      const pIssue = inspectPaymentIssue(u);
      if (pIssue) {
        paymentFailed.push(pIssue);
        if (uid) alertUidSet.add(uid);
      }

      if (status === "active" && paidMs > 0 && paidMs < now) {
        activeExpired.push(u);
        if (uid) alertUidSet.add(uid);
      }

      if (status === "active" && paidMs <= 0) {
        activeNoPaidUntil.push(u);
        if (uid) alertUidSet.add(uid);
      }

      if (status === "trial" && trialMs > 0 && trialMs < now) {
        trialExpired.push(u);
        if (uid) alertUidSet.add(uid);
      }

      if (userHasBrokenText(u)) {
        brokenText.push(u);
        if (uid) alertUidSet.add(uid);
      }

      const lastSeen = Number(u?.lastSeen || 0);
      if (getPlanPriority(u) >= 2 && lastSeen > 0 && (now - lastSeen) > 14 * 86400000) {
        highPrioritySilent.push(u);
        if (uid) alertUidSet.add(uid);
      }
    }

    for (const row of CLIENT_ERRORS) {
      const ts = Number(row?.ts || 0);
      if (!Number.isFinite(ts) || ts <= 0 || ts < (now - CLIENT_ERRORS_WINDOW_MS)) continue;

      const kind = String(row?.kind || "").toLowerCase();
      const uid = String(row?.uid || "").trim();
      const page = normalizeClientErrorPage(row?.page);
      const message = normalizeText(String(row?.message || row?.reason || "runtime error"))
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 80) || "runtime error";

      clientErrors24h.push({ uid, ts, kind, page, message });
      clientErrorTop.set(`${page}: ${message}`, (clientErrorTop.get(`${page}: ${message}`) || 0) + 1);
      clientErrorPages.set(page, (clientErrorPages.get(page) || 0) + 1);
      clientErrorMessages.set(message, (clientErrorMessages.get(message) || 0) + 1);

      if (uid) alertUidSet.add(uid);
      else alertUidSet.add(`client:${page}`);

      if (kind === "onerror" || kind === "unhandledrejection" || kind === "fatal") clientErrorsP1 += 1;
    }

    const alerts = [];

    if (paymentFailed.length) {
      alerts.push({
        key: "payment",
        color: "#ff7a7a",
        title: `Payment failed: ${paymentFailed.length}`,
        hint: "Users with failure/error billing signals in profile fields.",
        examples: paymentFailed.slice(0, 3).map((x) => `${x.label} (${x.reasons[0] || "error"})`)
      });
    }

    if (activeExpired.length) {
      alerts.push({
        key: "active-expired",
        color: "#ff4d4d",
        title: `Active but expired: ${activeExpired.length}`,
        hint: "planStatus=active but paidUntilMs already in the past."
      });
    }

    if (activeNoPaidUntil.length) {
      alerts.push({
        key: "active-no-paid",
        color: "#ffad66",
        title: `Active without paidUntilMs: ${activeNoPaidUntil.length}`,
        hint: "Users marked active with missing billing end timestamp."
      });
    }

    if (trialExpired.length) {
      alerts.push({
        key: "trial-expired",
        color: "#ffb347",
        title: `Trial expired not switched: ${trialExpired.length}`,
        hint: "planStatus=trial and trialEndsAtMs already passed."
      });
    }

    if (highPrioritySilent.length) {
      alerts.push({
        key: "silent",
        color: "#ffd88d",
        title: `Priority users silent 14d+: ${highPrioritySilent.length}`,
        hint: "Priority 2/3 users who have not opened app for 14+ days."
      });
    }

    if (brokenText.length) {
      alerts.push({
        key: "broken-text",
        color: "#9fd8ff",
        title: `Broken text suspect: ${brokenText.length}`,
        hint: "Potential mojibake in user profile strings."
      });
    }

    if (clientErrors24h.length) {
      const topExamples = Array.from(clientErrorTop.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([x, count]) => `${x} (${count})`);
      alerts.push({
        key: "client-errors",
        color: "#ff9966",
        title: `Client errors (24h): ${clientErrors24h.length}`,
        hint: "Frontend runtime errors captured from athlete/coach/admin sessions.",
        examples: topExamples
      });
    }

    return {
      paymentFailedCount: paymentFailed.length,
      systemAlertsCount: alertUidSet.size,
      activeExpiredCount: activeExpired.length,
      activeNoPaidCount: activeNoPaidUntil.length,
      trialExpiredCount: trialExpired.length,
      brokenTextCount: brokenText.length,
      highPrioritySilentCount: highPrioritySilent.length,
      clientErrors24hCount: clientErrors24h.length,
      clientErrorsP1Count: clientErrorsP1,
      clientErrorsByPage: Array.from(clientErrorPages.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([page, count]) => ({ page, count })),
      clientErrorsTop: Array.from(clientErrorMessages.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([message, count]) => ({ message, count })),
      paymentFailed,
      activeExpired,
      activeNoPaidUntil,
      trialExpired,
      brokenText,
      highPrioritySilent,
      clientErrors24h,
      alerts,
    };
  }

  function lineItem(label, value, color) {
    const c = color || "#ddd";
    return `<div style="display:flex; justify-content:space-between; gap:10px; margin-bottom:6px;">
      <span style="opacity:.82;">${esc(label)}</span>
      <b style="color:${c};">${esc(value)}</b>
    </div>`;
  }

  function profileLabel(u) {
    return normalizeText(u?.displayName || u?.name || u?.email || u?.uid || "Unknown");
  }

  function setExecutivePanelTitles(a, b, c) {
    const p1 = document.getElementById("ex-panel-billing-title");
    const p2 = document.getElementById("ex-panel-growth-title");
    const p3 = document.getElementById("ex-panel-health-title");
    if (p1) p1.textContent = a;
    if (p2) p2.textContent = b;
    if (p3) p3.textContent = c;
  }

  function renderModulePanels(summary, m) {
    const panelA = UI.execBillingList();
    const panelB = UI.execGrowthList();
    const panelC = UI.execHealthList();
    if (!panelA || !panelB || !panelC) return;

    if (activeModule === "billing") {
      setExecutivePanelTitles("Billing Failures", "Renewal Pressure", "Recovery Actions");
      const topFails = (summary?.paymentFailed || []).slice(0, 5);
      panelA.innerHTML = translateDynamicText(
        topFails.length
          ? topFails.map((x) => `<div style="margin-bottom:7px;"><b style="color:#ff7a7a;">${esc(x.label)}</b><div style="opacity:.8; font-size:11px;">${esc(x.reasons?.[0] || "payment issue")}</div></div>`).join("")
          : `<span style="opacity:.75;">No failed payment signals.</span>`
      );

      panelB.innerHTML = translateDynamicText([
        lineItem("Active but expired", String(summary?.activeExpiredCount || 0), "#ff4d4d"),
        lineItem("Active without paidUntilMs", String(summary?.activeNoPaidCount || 0), "#ffad66"),
        lineItem("Trial expired pending", String(summary?.trialExpiredCount || 0), "#ffb347"),
        lineItem("Renewals due in 7d", String(m.renew7d), "#ffd88d")
      ].join(""));

      panelC.innerHTML = translateDynamicText([
        `<div style="margin-bottom:6px;">• Retry billing reminders every 12h for failed users</div>`,
        `<div style="margin-bottom:6px;">• Auto-downgrade expired active subscriptions</div>`,
        `<div style="margin-bottom:6px;">• Trigger proactive renewal messages before paidUntil</div>`
      ].join(""));
      return;
    }

    if (activeModule === "users") {
      setExecutivePanelTitles("User Structure", "Activity Snapshot", "Assignment Quality");
      panelA.innerHTML = translateDynamicText([
        lineItem("Admins", String(m.roles.admin), "#9fd8ff"),
        lineItem("Coaches", String(m.roles.coach), "#9fd8ff"),
        lineItem("Athletes", String(m.roles.athlete), "#8dffbf"),
        lineItem("New users (7d)", String(m.new7d), "#ffd88d")
      ].join(""));

      panelB.innerHTML = translateDynamicText([
        lineItem("DAU", String(m.dau), "#9fd8ff"),
        lineItem("WAU", String(m.wau), "#9fd8ff"),
        lineItem("MAU", String(m.mau), "#9fd8ff"),
        lineItem("Users without lastSeen", String(m.withoutLastSeen), "#ffad66")
      ].join(""));

      panelC.innerHTML = translateDynamicText([
        lineItem("Athletes with coach", m.coachCoverage, "#8dffbf"),
        lineItem("Unassigned athletes", String(m.unassignedAthletes), "#ff4d4d"),
        lineItem("Priority users silent 14d+", String(summary?.highPrioritySilentCount || 0), "#ffd88d")
      ].join(""));
      return;
    }

    if (activeModule === "security") {
      setExecutivePanelTitles("Access Risk", "Data Integrity", "Hardening Queue");
      panelA.innerHTML = translateDynamicText([
        lineItem("Suspicious role values", String(m.suspiciousRoles), "#ff4d4d"),
        lineItem("Missing core fields", String(m.missingCoreFields), "#ffad66"),
        lineItem("Priority silent 14d+", String(summary?.highPrioritySilentCount || 0), "#ffd88d")
      ].join(""));

      panelB.innerHTML = translateDynamicText([
        lineItem("Broken text suspects", String(summary?.brokenTextCount || 0), "#9fd8ff"),
        lineItem("System alerts", String(summary?.systemAlertsCount || 0), "#ffd88d"),
        lineItem("Trial expired pending", String(summary?.trialExpiredCount || 0), "#ffb347")
      ].join(""));

      panelC.innerHTML = translateDynamicText([
        `<div style="margin-bottom:6px;">• Add server-side audit log for role/billing mutations</div>`,
        `<div style="margin-bottom:6px;">• Add alert when suspicious role values > 0</div>`,
        `<div style="margin-bottom:6px;">• Add nightly data quality validation job</div>`
      ].join(""));
      return;
    }

    if (activeModule === "audit") {
      setExecutivePanelTitles("Coverage", "Recent Signals", "Next Steps");
      panelA.innerHTML = translateDynamicText([
        lineItem("Audit events stream", "Not configured", "#ffad66"),
        lineItem("Role change tracking", "No", "#ff4d4d"),
        lineItem("Billing change tracking", "No", "#ff4d4d")
      ].join(""));

      const topRecent = ALL.slice().sort((a, b) => Number(b.lastSeen || 0) - Number(a.lastSeen || 0)).slice(0, 4);
      panelB.innerHTML = translateDynamicText(
        topRecent.length
          ? topRecent.map((u) => {
            const ms = Number(u?.lastSeen || 0);
            const when = ms ? new Date(ms).toLocaleString() : "-";
            return `<div style="margin-bottom:7px;"><b>${esc(profileLabel(u))}</b><div style="opacity:.8; font-size:11px;">Last activity: ${esc(when)}</div></div>`;
          }).join("")
          : `<span style="opacity:.75;">No activity data.</span>`
      );

      panelC.innerHTML = translateDynamicText([
        `<div style="margin-bottom:6px;">• Create /audit_log with actor/action/target/before/after/timestamp</div>`,
        `<div style="margin-bottom:6px;">• Write log on each admin mutation endpoint</div>`,
        `<div style="margin-bottom:6px;">• Add CSV export for investigations</div>`
      ].join(""));
      return;
    }

    if (activeModule === "incidents") {
      setExecutivePanelTitles("Open Incidents", "Severity Mix", "Response Playbooks");
      const topAlerts = (summary?.alerts || []).slice(0, 5);
      const clientTopPages = (summary?.clientErrorsByPage || []).slice(0, 3);
      const clientTopErrors = (summary?.clientErrorsTop || []).slice(0, 3);
      panelA.innerHTML = translateDynamicText(
        topAlerts.length
          ? topAlerts.map((a) => `<div style="margin-bottom:7px;"><b style="color:${a.color};">${esc(a.title)}</b><div style="opacity:.8; font-size:11px;">${esc(a.hint || "")}</div></div>`).join("")
          : `<span style="opacity:.75;">No incidents.</span>`
      );
      panelB.innerHTML = translateDynamicText([
        lineItem("Billing incidents", String(summary?.paymentFailedCount || 0), "#ff7a7a"),
        lineItem("Access incidents", String(m.suspiciousRoles), "#ff4d4d"),
        lineItem("Client incidents (24h)", String(summary?.clientErrors24hCount || 0), "#ff9966"),
        lineItem("Data incidents", String((summary?.brokenTextCount || 0) + m.missingCoreFields), "#ffad66")
      ].join(""));
      const clientDetails = [];
      if (clientTopPages.length) {
        clientDetails.push(`<div style="margin-bottom:6px;">• Top pages: ${clientTopPages.map((x) => `${esc(x.page)} (${esc(x.count)})`).join(", ")}</div>`);
      }
      if (clientTopErrors.length) {
        clientDetails.push(`<div style="margin-bottom:6px;">• Top errors: ${clientTopErrors.map((x) => `${esc(x.message)} (${esc(x.count)})`).join(", ")}</div>`);
      }
      panelC.innerHTML = translateDynamicText([
        ...clientDetails,
        `<div style="margin-bottom:6px;">• Billing failure: notify user + suspend premium features</div>`,
        `<div style="margin-bottom:6px;">• Access anomaly: lock privileged actions until review</div>`,
        `<div style="margin-bottom:6px;">• Data breakage: queue profile repair</div>`,
        `<div style="margin-bottom:6px;">• Frontend errors: inspect client_errors feed and hotfix top pages/messages</div>`
      ].join(""));
      return;
    }

    if (activeModule === "costs") {
      setExecutivePanelTitles("Read Distribution", "Budget Pressure", "Optimization Plan");
      const heavyTargets = m.priority.p3 + Math.min(m.priority.p2, 10);
      const conservativeTargets = Math.max(0, ALL.length - heavyTargets);
      panelA.innerHTML = translateDynamicText([
        lineItem("Priority 3 users", String(m.priority.p3), "#00ff88"),
        lineItem("Priority 2 users", String(m.priority.p2), "#ffd88d"),
        lineItem("Priority 1 users", String(m.priority.p1), "#9fd8ff"),
        lineItem("Heavy enrich targets", String(heavyTargets), "#ffd88d"),
        lineItem("Conservative users", String(conservativeTargets), "#8dffbf")
      ].join(""));
      panelB.innerHTML = translateDynamicText([
        lineItem("WAU", String(m.wau), "#9fd8ff"),
        lineItem("MAU", String(m.mau), "#9fd8ff"),
        lineItem("Billing risk", String(m.billingRisk), "#ff7a7a"),
        lineItem("Stale users 90d+", String(m.stale90), "#ffad66")
      ].join(""));
      panelC.innerHTML = translateDynamicText([
        `<div style="margin-bottom:6px;">• P3 full analytics, P2 light analytics, P1 minimal reads</div>`,
        `<div style="margin-bottom:6px;">• Track daily reads/writes in Firebase Usage</div>`,
        `<div style="margin-bottom:6px;">• Add alerts when weekly read baseline is exceeded</div>`
      ].join(""));
      return;
    }

    setExecutivePanelTitles("Billing Radar", "Growth & Retention", "System & Data Health");
    const billingHtml = [
      lineItem("Payment failed", String(summary?.paymentFailedCount || 0), "#ff7a7a"),
      lineItem("Active but expired", String(summary?.activeExpiredCount || 0), "#ff4d4d"),
      lineItem("Active no paidUntilMs", String(summary?.activeNoPaidCount || 0), "#ffad66"),
      lineItem("Renewal due in 7d", String(m.renew7d), "#ffd88d"),
    ].join("");
    panelA.innerHTML = translateDynamicText(billingHtml);

    const dauPct = ALL.length ? `${Math.round((m.dau / ALL.length) * 100)}%` : "0%";
    const wauPct = ALL.length ? `${Math.round((m.wau / ALL.length) * 100)}%` : "0%";
    const growthHtml = [
      lineItem("New users (7d)", String(m.new7d), "#9fd8ff"),
      lineItem("New users (30d)", String(m.new30d), "#9fd8ff"),
      lineItem("DAU / Total", dauPct, "#9fd8ff"),
      lineItem("WAU / Total", wauPct, "#9fd8ff"),
      lineItem("Athletes with coach", m.coachCoverage, "#8dffbf"),
      lineItem("Priority silent 14d+", String(summary?.highPrioritySilentCount || 0), "#ffd88d"),
    ].join("");
    panelB.innerHTML = translateDynamicText(growthHtml);

    const healthHtml = [
      lineItem("System alerts", String(summary?.systemAlertsCount || 0), "#ffd88d"),
      lineItem("Client errors 24h", String(summary?.clientErrors24hCount || 0), "#ff9966"),
      lineItem("Broken text suspects", String(summary?.brokenTextCount || 0), "#9fd8ff"),
      lineItem("Trial expired pending", String(summary?.trialExpiredCount || 0), "#ffb347"),
      lineItem("Missing core profile fields", String(m.missingCoreFields), "#ffad66"),
      lineItem("Data hygiene status", m.missingCoreFields > 0 ? "Needs review" : "Healthy", m.missingCoreFields > 0 ? "#ffad66" : "#00ff88"),
    ].join("");
    panelC.innerHTML = translateDynamicText(healthHtml);
  }

  function renderExecutiveDashboard(summary) {
    const now = Date.now();
    let paidActive = 0;
    let trialLive = 0;
    let renew7d = 0;
    let dau = 0;
    let wau = 0;
    let mau = 0;
    let new7d = 0;
    let new30d = 0;
    let athletes = 0;
    let athletesWithCoach = 0;
    let unassignedAthletes = 0;
    let suspiciousRoles = 0;
    let missingCoreFields = 0;
    let withoutLastSeen = 0;
    let stale90 = 0;
    const priority = { p3: 0, p2: 0, p1: 0 };
    const roles = { admin: 0, coach: 0, athlete: 0 };

    for (const u of ALL) {
      const status = getPlanStatus(u);
      const paidMs = Number(u?.paidUntilMs || 0);
      const trialMs = Number(u?.trialEndsAtMs || 0);
      const lastSeen = Number(u?.lastSeen || 0);
      const createdMs = safeMillis(u?.createdAtMs || u?.createdAt || 0);
      const role = String(u?.role || "athlete").toLowerCase();
      const p = getPlanPriority(u);

      if (status === "active" && paidMs > now) paidActive += 1;
      if (status === "trial" && trialMs > now) trialLive += 1;
      if (status === "active" && paidMs > now && paidMs <= now + 7 * 86400000) renew7d += 1;

      if (lastSeen > now - 86400000) dau += 1;
      if (lastSeen > now - 7 * 86400000) wau += 1;
      if (lastSeen > now - 30 * 86400000) mau += 1;
      if (!lastSeen) withoutLastSeen += 1;
      if (lastSeen && lastSeen < now - 90 * 86400000) stale90 += 1;

      if (createdMs > now - 7 * 86400000) new7d += 1;
      if (createdMs > now - 30 * 86400000) new30d += 1;

      if (role === "athlete") {
        athletes += 1;
        if (u?.coachId) athletesWithCoach += 1;
        else unassignedAthletes += 1;
      }

      if (role === "admin" || role === "coach" || role === "athlete") roles[role] += 1;
      else suspiciousRoles += 1;

      if (p === 3) priority.p3 += 1;
      else if (p === 2) priority.p2 += 1;
      else priority.p1 += 1;

      if (!u?.email || !u?.planStatus || !u?.role) missingCoreFields += 1;
    }

    const billingRisk = (summary?.paymentFailedCount || 0)
      + (summary?.activeExpiredCount || 0)
      + (summary?.activeNoPaidCount || 0);

    if (UI.exTotalUsers()) UI.exTotalUsers().textContent = String(ALL.length);
    if (UI.exPaidActive()) UI.exPaidActive().textContent = String(paidActive);
    if (UI.exTrialLive()) UI.exTrialLive().textContent = String(trialLive);
    if (UI.exBillingRisk()) UI.exBillingRisk().textContent = String(billingRisk);
    if (UI.exDau()) UI.exDau().textContent = String(dau);
    if (UI.exWau()) UI.exWau().textContent = String(wau);
    if (UI.exMau()) UI.exMau().textContent = String(mau);
    if (UI.exRenew7d()) UI.exRenew7d().textContent = String(renew7d);

    const moduleMetrics = {
      paidActive,
      trialLive,
      renew7d,
      dau,
      wau,
      mau,
      new7d,
      new30d,
      roles,
      priority,
      unassignedAthletes,
      withoutLastSeen,
      stale90,
      suspiciousRoles,
      missingCoreFields,
      billingRisk,
      coachCoverage: athletes > 0 ? `${Math.round((athletesWithCoach / athletes) * 100)}%` : "0%"
    };

    renderModulePanels(summary, moduleMetrics);
  }

  function renderOpsAlerts(summary) {
    const box = UI.opsAlertsList();
    if (!box) return;

    const data = summary || buildOpsSummary();
    if (!data.alerts.length) {
      box.innerHTML = `<span style="opacity:.75;">${esc(t("list.noCritical"))}</span>`;
      return;
    }

    box.innerHTML = translateDynamicText(data.alerts.map((a) => `
      <div style="border:1px solid ${a.color}55; background:${a.color}12; border-radius:10px; padding:8px 10px; margin-bottom:8px;">
        <div style="font-weight:900; color:${a.color};">${esc(a.title)}</div>
        <div style="opacity:.82; margin-top:4px;">${esc(a.hint || "")}</div>
        ${a.examples?.length ? `<div style="opacity:.75; margin-top:5px;">${a.examples.map((x) => `• ${esc(x)}`).join("<br>")}</div>` : ""}
      </div>
    `).join(""));
  }

  function getSubscriptionInfo(u) {
    const status = getPlanStatus(u);
    const priority = getPlanPriority(u);
    const priorityLabel = planPriorityLabel(priority);
    const priorityBadgeColor = priorityColor(priority);
    if (status === "trial") {
      const endsMs = Number(u?.trialEndsAtMs || 0);
      const d = daysFromNow(endsMs);
      if (d === null) {
        return {
          status,
          badgeLabel: "TRIAL no end date",
          badgeColor: "#ff7a7a",
          note: "trialEndsAtMs is missing",
          rowWarn: true,
          expiredTrial: false,
          priority,
          priorityLabel,
          priorityBadgeColor,
        };
      }
      if (d < 0) {
        return {
          status,
          badgeLabel: `TRIAL EXPIRED ${Math.abs(d)}d`,
          badgeColor: "#ff4d4d",
          note: `ended ${fmtDateShort(endsMs)}`,
          rowWarn: true,
          expiredTrial: true,
          priority,
          priorityLabel,
          priorityBadgeColor,
        };
      }
      return {
        status,
        badgeLabel: `TRIAL ${d}d left`,
        badgeColor: "#FFC72C",
        note: `ends ${fmtDateShort(endsMs)}`,
        rowWarn: false,
        expiredTrial: false,
        priority,
        priorityLabel,
        priorityBadgeColor,
      };
    }

    if (status === "active") {
      const paidMs = Number(u?.paidUntilMs || 0);
      const d = daysFromNow(paidMs);
      if (d !== null && d < 0) {
        return {
          status,
          badgeLabel: `ACTIVE EXPIRED ${Math.abs(d)}d`,
          badgeColor: "#ff4d4d",
          note: `paid ended ${fmtDateShort(paidMs)}`,
          rowWarn: true,
          expiredTrial: false,
          priority,
          priorityLabel,
          priorityBadgeColor,
        };
      }
      if (d !== null) {
        return {
          status,
          badgeLabel: `ACTIVE ${d}d`,
          badgeColor: "#00ff88",
          note: `paid until ${fmtDateShort(paidMs)}`,
          rowWarn: false,
          expiredTrial: false,
          priority,
          priorityLabel,
          priorityBadgeColor,
        };
      }
      return {
        status,
        badgeLabel: "ACTIVE",
        badgeColor: "#00ff88",
        note: "no paidUntilMs",
        rowWarn: false,
        expiredTrial: false,
        priority,
        priorityLabel,
        priorityBadgeColor,
      };
    }

    return {
      status,
      badgeLabel: "INACTIVE",
      badgeColor: "#9a9a9a",
      note: "access closed",
      rowWarn: false,
      expiredTrial: false,
      priority,
      priorityLabel,
      priorityBadgeColor,
    };
  }

  function coloredBadge(label, color) {
    const c = color || "#FFC72C";
    return `
      <div style="display:inline-block; padding:6px 10px; border-radius:999px;
                  border:1px solid ${c}55; background:${c}12; color:${c};
                  font-weight:900; font-size:11px;">
        ${esc(label)}
      </div>`;
  }

  function wellnessMini(uid, w) {
    // show 4 metrics compact
    const metrics = [
      { key: "sleep", icon: "\u{1F4A4}", v: w?.sleep },
      { key: "stress", icon: "\u{1F9E0}", v: w?.stress },
      { key: "soreness", icon: "\u{1F4AA}", v: w?.soreness },
      { key: "ready", icon: "\u26A1", v: w?.ready },
    ];

    return `
      <div style="display:flex; gap:6px; justify-content:center; flex-wrap:nowrap;">
        ${metrics.map(m => {
          const has = (m.v !== undefined && m.v !== null && m.v !== "");
          const val = has ? m.v : "-";
          // simple coloring
          let good = true;
          if (m.key === "sleep" || m.key === "ready") good = Number(m.v) >= 7;
          if (m.key === "stress" || m.key === "soreness") good = Number(m.v) <= 4;
          const c = !has ? "#666" : (good ? "#00ff00" : "#ff4d4d");
          return `
            <a href="pages/wellness.html?userId=${encodeURIComponent(uid)}&fromAdmin=1&focus=${encodeURIComponent(m.key)}"
               title="${m.key}"
               style="text-decoration:none; display:flex; flex-direction:column; align-items:center;
                      width:34px; padding:6px 0; border-radius:12px;
                      border:1px solid rgba(255,255,255,.10); background:rgba(0,0,0,.25);">
              <span style="font-size:14px;">${m.icon}</span>
              <b style="font-size:11px; color:${c}; margin-top:2px;">${esc(val)}</b>
            </a>`;
        }).join("")}
      </div>`;
  }

  // ---------- Fetch last docs safely (no orderBy index dependency) ----------
  async function fetchLastByUserId(col, uid, limitN = 7) {
    // We avoid orderBy to reduce index pain; fetch few docs and sort locally.
    const snap = await db.collection(col).where("userId", "==", uid).limit(limitN).get();
    if (snap.empty) return null;

    const list = snap.docs.map(d => ({ id: d.id, ... (d.data() || {}) }));
    list.sort((a, b) => safeMillis(b.timestamp || b.createdAt || b.date || b.updatedAt) - safeMillis(a.timestamp || a.createdAt || a.date || a.updatedAt));
    return list[0] || null;
  }

  async function fetchWeight(uid) {
    const last = await fetchLastByUserId(WEIGHT_COL, uid, 10).catch(() => null);
    if (!last) return null;

    const lastMs = safeMillis(last.timestamp || last.createdAt);
    // get previous (best effort)
    const snap = await db.collection(WEIGHT_COL).where("userId", "==", uid).limit(10).get().catch(()=>null);
    if (!snap || snap.empty) return { val: last.value ?? last.weight ?? null, diff: null };

    const list = snap.docs.map(d => d.data() || {});
    list.sort((a,b) => safeMillis(b.timestamp || b.createdAt) - safeMillis(a.timestamp || a.createdAt));
    const cur = list[0];
    const prev = list[1] || null;

    const curVal = Number(cur.value ?? cur.weight ?? null);
    const prevVal = prev ? Number(prev.value ?? prev.weight ?? null) : null;

    let diff = null;
    if (Number.isFinite(curVal) && Number.isFinite(prevVal)) diff = +(curVal - prevVal).toFixed(1);

    return { val: Number.isFinite(curVal) ? curVal : null, diff, atMs: lastMs };
  }

  async function fetchWellness(uid) {
    const last = await fetchLastByUserId(WELLNESS_COL, uid, 10).catch(() => null);
    if (!last) return null;
    return {
      sleep: last.sleep ?? last.scores?.sleep,
      stress: last.stress ?? last.scores?.stress,
      soreness: last.soreness ?? last.scores?.soreness,
      ready: last.ready ?? last.scores?.ready,
      atMs: safeMillis(last.timestamp || last.createdAt)
    };
  }

  async function fetchInjury(uid) {
    const last = await fetchLastByUserId(INJURY_COL, uid, 10).catch(() => null);
    if (!last) return null;

    const pain = Number(last.pain ?? last.painScore ?? last.level ?? 0);
    let label = "HEALTHY";
    let color = "#00ff00";

    if (pain >= 7) { label = "HIGH"; color = "#ff4d4d"; }
    else if (pain >= 4) { label = "MED"; color = "#FFC72C"; }

        return { pain, label, color, atMs: safeMillis(last.timestamp || last.createdAt), id: last.id || null };


  }
    async function fetchPower(uid) {
    try {
      const snap = await db.collection(POWER_TOP_COL)
        .doc(uid)
        .collection("tests")
        .orderBy("createdAtMs", "desc")
        .limit(1)
        .get();

      if (snap.empty) return null;

      const d = snap.docs[0].data() || {};
      const best = Number(d.best_cm ?? d.bestCm ?? d.best ?? d.bestCM);
      if (!Number.isFinite(best)) return null;

      return { best_cm: best, atMs: safeMillis(d.createdAtMs ?? d.createdAt ?? d.date) };
    } catch {
      return null;
    }
  }
async function fetchCoreACWR(uid) {
  return new Promise((resolve) => {
    let resolved = false;

    function handler(e) {
      const detail = e?.detail;
      if (!detail || detail.userId !== uid) return;

      const acwr = detail?.core?.breakdown?.load?.acwr ?? null;
      document.removeEventListener("athletecore:ready", handler);

      resolved = true;
      resolve(acwr);
    }

    document.addEventListener("athletecore:ready", handler);

    // run core for selected uid
    window.currentUserId = uid;

    if (typeof window.refreshAthleteCore === "function") {
      window.refreshAthleteCore();
    }

    // safety timeout
    setTimeout(() => {
      if (!resolved) {
        document.removeEventListener("athletecore:ready", handler);
        resolve(null);
      }
    }, 1500);
  });
}


  // ---------- Render row ----------
  function renderRow(u) {
    const photo = u.photoURL || "assets/images/AK_logo.png";
    const name = normalizeText(u.displayName || ((u.firstName || "") + " " + (u.lastName || "")).trim() || u.email || u.uid);
    const metaLine = athleteMetaLine(u);

    const lastSeenMs = Number(u.lastSeen || 0);
    const sub = getSubscriptionInfo(u);

    const weightHtml = u._weight
      ? `<div style="text-align:center;">
           <div style="font-weight:900; color:#fff;">${u._weight.val ?? "-"} kg</div>
           <div style="font-size:11px; opacity:.7;">
             ${u._weight.diff === null ? "" : (u._weight.diff > 0 ? `<span style="color:#ff4d4d">&#8593; ${Math.abs(u._weight.diff)}</span>` : `<span style="color:#00ff00">&#8595; ${Math.abs(u._weight.diff)}</span>`)}
           </div>
         </div>`
      : `<span style="opacity:.45">-</span>`;
    const pwr = (u._power?.best_cm != null) ? Number(u._power.best_cm) : null;
const pwrTxt = (pwr != null && Number.isFinite(pwr)) ? pwr.toFixed(1) : null;
    const acwrFallback = Number(u.currentACWR ?? u.acwr ?? null);
    const acwrFromCore = Number(u._acwr);
    const acwrNum = (Number.isFinite(acwrFromCore) && acwrFromCore > 0)
      ? acwrFromCore
      : acwrFallback;
    const acwrOk = Number.isFinite(acwrNum) && acwrNum > 0;

let acwrColor = "#666";
if (acwrOk) {
  acwrColor =
    acwrNum > 1.5 ? "#ff4d4d" :
    acwrNum >= 1.3 ? "#FFC72C" :
    acwrNum >= 0.8 ? "#00ff00" :
    "#777";
}



    const injuryHtml = u._injury
  ? `<a href="pages/injury.html?userId=${encodeURIComponent(u.uid)}&fromAdmin=1${u._injury.id ? `&injuryId=${encodeURIComponent(u._injury.id)}` : ""}"
        style="text-decoration:none;">
       ${coloredBadge(`${u._injury.label} (${u._injury.pain})`, u._injury.color)}
     </a>`
  : `<span style="opacity:.45">-</span>`;



    const wellnessHtml = u._wellness
      ? wellnessMini(u.uid, u._wellness)
      : `<span style="opacity:.45">-</span>`;

    return `
      <tr${sub.rowWarn ? ` style="background:rgba(120,0,0,.16);"` : ""}>
        <td class="sticky-col">
          <div style="display:flex; gap:10px; align-items:center;">
            <img src="${esc(photo)}" style="width:34px; height:34px; border-radius:50%; object-fit:cover; border:2px solid ${Date.now() - lastSeenMs < 300000 ? "#00ff00" : "#444"};" />
            <div style="min-width:0;">
              <div style="font-weight:900; color:#fff; font-size:13px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:220px;">
                ${esc(name)}
              </div>
              <div style="font-size:11px; opacity:.82; color:#FFC72C; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:220px;">${esc(metaLine)}</div>
              <div style="font-size:11px; opacity:.65; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:220px;">
                ${esc(u.email || "")}
              </div>
              <div style="margin-top:6px; display:flex; gap:6px; flex-wrap:wrap;">
                ${coloredBadge(sub.priorityLabel, sub.priorityBadgeColor)}
                ${coloredBadge(sub.badgeLabel, sub.badgeColor)}
              </div>
              <div style="font-size:10px; opacity:.72; margin-top:4px;">${esc(sub.note)}</div>
            </div>
          </div>
        </td>

        <td>${weightHtml}</td>

        <td style="text-align:center;">
  ${acwrOk
  ? `<b style="color:${acwrColor}; font-weight:950;">${acwrNum.toFixed(2)}</b>`
  : `<span style="opacity:.45">-</span>`
}


  <div style="margin-top:6px; font-size:11px; opacity:.75;">
    ${pwrTxt ? `CMJ <b style="color:#FFC72C">${esc(pwrTxt)}</b> <span style="opacity:.6">cm</span>` : `<span style="opacity:.45">CMJ -</span>`}
  </div>
</td>


        <td>${wellnessHtml}</td>
        <td style="text-align:center;">${injuryHtml}</td>
        <td style="text-align:center; font-size:12px;">${getTimeSince(lastSeenMs)}</td>

        <td style="text-align:right; white-space:nowrap;">
          <a href="pages/weekly-individual.html?userId=${encodeURIComponent(u.uid)}&fromAdmin=1"
             style="display:inline-block; padding:8px 10px; border-radius:12px; background:#FFC72C; color:#000; text-decoration:none; font-weight:950; font-size:11px;">
            WEEKLY
          </a>
          <button data-action="manage" data-uid="${esc(u.uid)}"
  style="display:inline-block; padding:8px 10px; border-radius:12px; margin-left:8px;
         background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.12);
         color:#fff; font-weight:900; font-size:11px; cursor:pointer;">
  MANAGE
</button>

        </td>
      </tr>`;
  }

  // ---------- State ----------
  let ALL = [];
  let CLIENT_ERRORS = [];
  let unsubUsers = null;
  let activePlanTab = "all";
  let activeModule = "overview";
  let lastOpsSummary = null;
    // ---------- Sorting ----------
  let sortKey = "lastSeen";
  let sortDir = "desc"; // asc | desc

  function getSortVal(u, key){
    switch(key){
      case "lastSeen": return Number(u.lastSeen || 0);
      case "createdAt": return Number(u.createdAtMs || u.createdAt || 0);
      case "name": {
        const n = normalizeText(u.displayName || ((u.firstName||"")+" "+(u.lastName||"")).trim() || u.email || u.uid || "");
        return n.toLowerCase();
      }
      case "planStatus": return String(u.planStatus || "").toLowerCase();
      case "acwr": return Number(u._acwr || 0);
      case "pain": return Number(u._injury?.pain || 0);
      case "ready": return Number(u._wellness?.ready || 0);
      case "sleep": return Number(u._wellness?.sleep || 0);
      case "stress": return Number(u._wellness?.stress || 0);
      case "weight": return Number(u._weight?.val || 0);
      default: return "";
    }
  }

  function sortUsers(arr){
    const dir = (sortDir === "asc") ? 1 : -1;
    arr.sort((a,b)=>{
      const pa = getPlanPriority(a);
      const pb = getPlanPriority(b);
      if (pb !== pa) return pb - pa; // always keep higher priority first

      const va = getSortVal(a, sortKey);
      const vb = getSortVal(b, sortKey);
      if (typeof va === "number" && typeof vb === "number") {
        const d = (va - vb) * dir;
        if (d !== 0) return d;
      } else {
        const d = String(va).localeCompare(String(vb)) * dir;
        if (d !== 0) return d;
      }

      // fallback within same priority
      return Number(b.lastSeen || 0) - Number(a.lastSeen || 0);
    });
    return arr;
  }

  function wireSortingUI(){
    document.querySelectorAll(".monitor-table th[data-sort]").forEach(th=>{
      th.addEventListener("click", ()=>{
        const k = th.getAttribute("data-sort");
        if (!k) return;

        if (sortKey === k) sortDir = (sortDir === "asc") ? "desc" : "asc";
        else { sortKey = k; sortDir = "desc"; }

        // update header arrows
        document.querySelectorAll(".monitor-table th[data-sort]").forEach(x=>{
          x.classList.remove("is-sort-asc","is-sort-desc");
        });
        th.classList.add(sortDir === "asc" ? "is-sort-asc" : "is-sort-desc");

        renderFiltered();
      });
    });

    // set default arrow on lastSeen
    const def = document.querySelector('.monitor-table th[data-sort="lastSeen"]');
    if (def) def.classList.add("is-sort-desc");
  }

  function stylePlanTabButton(btn, isActive) {
    if (!btn) return;
    btn.style.border = isActive ? "1px solid rgba(255,199,44,.55)" : "1px solid rgba(255,255,255,.2)";
    btn.style.background = isActive ? "rgba(255,199,44,.15)" : "transparent";
    btn.style.color = isActive ? "#FFC72C" : "#fff";
  }

  function refreshPlanTabsUI() {
    const btns = Array.from(UI.planTabs() || []);
    if (!btns.length) return;

    const counts = { all: ALL.length, p3: 0, p2: 0, p1: 0 };
    let expiredTrialCount = 0;

    for (const u of ALL) {
      const p = getPlanPriority(u);
      if (p === 3) counts.p3 += 1;
      else if (p === 2) counts.p2 += 1;
      else counts.p1 += 1;

      if (getSubscriptionInfo(u).expiredTrial) expiredTrialCount += 1;
    }

    btns.forEach((btn) => {
      const tab = String(btn.getAttribute("data-plan-tab") || "all").toLowerCase();
      const baseLabel = String(btn.getAttribute("data-label") || tab.toUpperCase());
      const count = counts[tab] || 0;
      btn.textContent = (tab === "all" && expiredTrialCount > 0)
        ? `${baseLabel} (${count}) • trial expired ${expiredTrialCount}`
        : `${baseLabel} (${count})`;
      stylePlanTabButton(btn, tab === activePlanTab);
    });

    const note = UI.planNote();
    if (note) {
      if (activePlanTab === "all") {
        note.style.color = "#9fd8ff";
        note.textContent = t("note.overview");
      } else if (activePlanTab === "p3") {
        note.style.color = "#8dffbf";
        note.textContent = t("note.p3");
      } else if (activePlanTab === "p2") {
        note.style.color = "#ffd88d";
        note.textContent = t("note.p2");
      } else {
        note.style.color = "#c1c7ff";
        note.textContent = t("note.p1");
      }
    }

    updateOverviewCards();
  }

  function wirePlanTabs() {
    const btns = Array.from(UI.planTabs() || []);
    btns.forEach((btn) => {
      btn.onclick = () => {
        const next = String(btn.getAttribute("data-plan-tab") || "all").toLowerCase();
        if (!next) return;
        activePlanTab = next;
        renderFiltered();
      };
    });
    refreshPlanTabsUI();
  }

  function refreshModuleUI() {
    if (activeModule === "users") setLegacyAthleteVisible(true);
    else setLegacyAthleteVisible(false);

    UI.moduleButtons().forEach((btn) => {
      const moduleId = String(btn.getAttribute("data-admin-module-btn") || "").toLowerCase();
      btn.classList.toggle("is-active", moduleId === activeModule);
    });

    UI.moduleLinks().forEach((link) => {
      const moduleId = String(link.getAttribute("data-admin-module") || "").toLowerCase();
      link.classList.toggle("active", moduleId === activeModule);
    });

    const subtitle = UI.moduleSubtitle();
    if (subtitle) subtitle.textContent = t(`module.subtitle.${activeModule}`);

    if (lastOpsSummary) {
      renderExecutiveDashboard(lastOpsSummary);
    }
  }

  function setActiveModule(next) {
    const allowed = new Set(["overview", "billing", "users", "security", "audit", "incidents", "costs"]);
    const norm = String(next || "").toLowerCase();
    if (!allowed.has(norm)) return;
    activeModule = norm;
    try {
      const url = new URL(window.location.href);
      if (activeModule === "overview") url.searchParams.delete("module");
      else url.searchParams.set("module", activeModule);
      window.history.replaceState({}, "", url.toString());
    } catch {}
    refreshModuleUI();
  }

  function wireAdminModuleTabs() {
    UI.moduleButtons().forEach((btn) => {
      btn.onclick = () => setActiveModule(btn.getAttribute("data-admin-module-btn"));
    });

    UI.moduleLinks().forEach((link) => {
      link.onclick = (e) => {
        e.preventDefault();
        setActiveModule(link.getAttribute("data-admin-module"));
      };
    });
  }

  function updateOverviewCards() {
    const now = Date.now();
    let onlineNow = 0;
    let active24h = 0;
    let active7d = 0;
    let trialExpired = 0;

    for (const u of ALL) {
      const lastSeen = Number(u.lastSeen || 0);
      if (lastSeen > 0 && (now - lastSeen) <= 5 * 60 * 1000) onlineNow += 1;
      if (lastSeen > 0 && (now - lastSeen) <= 24 * 60 * 60 * 1000) active24h += 1;
      if (lastSeen > 0 && (now - lastSeen) <= 7 * 24 * 60 * 60 * 1000) active7d += 1;
      if (getSubscriptionInfo(u).expiredTrial) trialExpired += 1;
    }

    if (UI.ovOnlineNow()) UI.ovOnlineNow().textContent = String(onlineNow);
    if (UI.ovActive24h()) UI.ovActive24h().textContent = String(active24h);
    if (UI.ovActive7d()) UI.ovActive7d().textContent = String(active7d);
    if (UI.ovTrialExpired()) UI.ovTrialExpired().textContent = String(trialExpired);

    const ops = buildOpsSummary();
    lastOpsSummary = ops;
    if (UI.ovPaymentFailed()) UI.ovPaymentFailed().textContent = String(ops.paymentFailedCount);
    if (UI.ovSystemAlerts()) UI.ovSystemAlerts().textContent = String(ops.systemAlertsCount);
    renderOpsAlerts(ops);
    renderExecutiveDashboard(ops);
  }

  function setLegacyAthleteVisible(on) {
    const isOn = !!on;
    const block = UI.legacyAthleteBlock();
    if (block) block.style.display = isOn ? "block" : "none";

    const btn = UI.toggleAthleteViewBtn();
    if (btn) btn.textContent = isOn ? t("button.hideAthletes") : t("button.showAthletes");

    try { localStorage.setItem("pac_admin_legacy_athletes", isOn ? "1" : "0"); } catch {}
  }

  function wireLegacyAthleteToggle() {
    const btn = UI.toggleAthleteViewBtn();
    if (btn) {
      btn.onclick = () => {
        const isVisible = UI.legacyAthleteBlock()?.style.display !== "none";
        setLegacyAthleteVisible(!isVisible);
      };
    }

    let saved = false;
    try { saved = localStorage.getItem("pac_admin_legacy_athletes") === "1"; } catch {}
    setLegacyAthleteVisible(saved);
  }

  // ===== Chat (Firestore conversations/{cid}/messages) =====
  let chatUnsub = null;

  function chatCid(a, b){
  const [x,y] = [String(a||""), String(b||"")].sort();
  return `chat_${x}_${y}`;
}


  function stopChat(){
    try { if (typeof chatUnsub === "function") chatUnsub(); } catch {}
    chatUnsub = null;

    const st = document.getElementById("chatStatus");
    if (st) st.textContent = "-";

    const list = document.getElementById("chatList");
    if (list) list.innerHTML = `<div style="opacity:.55; font-size:12px;">${esc(t("list.noMessages"))}</div>`;
  }

  function renderChatMessage(meUid, m){
    const mine = m.senderId === meUid;
    const text = esc(m.text || "");
    const tms = safeMillis(m.createdAt || m.createdAtMs);
    const ts = tms ? new Date(tms).toLocaleString() : "";
    return `
      <div style="display:flex; justify-content:${mine ? "flex-end" : "flex-start"}; margin:6px 0;">
        <div style="max-width:80%; padding:10px 12px; border-radius:14px;
                    background:${mine ? "rgba(255,199,44,.18)" : "rgba(255,255,255,.08)"};
                    border:1px solid rgba(255,255,255,.10);">
          <div style="font-size:12px; color:#fff; white-space:pre-wrap; word-break:break-word;">${text}</div>
          <div style="font-size:10px; opacity:.55; margin-top:6px;">${esc(ts)}</div>
        </div>
      </div>
    `;
  }

  async function ensureConversation(cid, meUid, otherUid){
  const ref = db.collection("conversations").doc(cid);
  const snap = await ref.get();
  if (snap.exists) return ref;

  await ref.set({
    participants: [meUid, otherUid],
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    lastMessageAt: firebase.firestore.FieldValue.serverTimestamp(),
    lastMessageText: "",
    lastSenderId: meUid,
    lastReadAt: { [meUid]: firebase.firestore.FieldValue.serverTimestamp() }
  }, { merge:true });

  return ref;
}


  async function openChatFor(athleteUid){
    stopChat();

    const me = firebase.auth().currentUser;
    if (!me?.uid) return;

    const otherUid = String(athleteUid || "");
    if (!otherUid) {
      alert("athleteUid is missing");
      return;
    }
    const cid = chatCid(me.uid, otherUid);

    const convoRef = await ensureConversation(cid, me.uid, otherUid);

    const list = document.getElementById("chatList");
    const status = document.getElementById("chatStatus");
    if (status) status.textContent = t("status.live");

    chatUnsub = convoRef.collection("messages")
      .orderBy("createdAt", "desc")
      .limit(30)
      .onSnapshot((snap)=>{
        if (!list) return;
        if (snap.empty){
          list.innerHTML = `<div style="opacity:.55; font-size:12px;">${esc(t("list.noMessages"))}</div>`;
          return;
        }
        const msgs = snap.docs.map(d=>d.data()||{}).reverse();
        list.innerHTML = msgs.map(m=>renderChatMessage(me.uid, m)).join("");
        list.scrollTop = list.scrollHeight;
      }, ()=>{
        if (status) status.textContent = "-";
      });

    const btn = document.getElementById("chatSend");
    const ta  = document.getElementById("chatText");

    if (btn && ta){
      btn.onclick = async ()=>{
        const text = (ta.value || "").trim();
        if (!text) return;

        btn.disabled = true;
        try{
          await convoRef.collection("messages").add({
            senderId: me.uid,
            text,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          });

          await convoRef.set({
            lastMessageAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastMessageText: text,
            lastSenderId: me.uid
          }, { merge:true });


          ta.value = "";
        } catch (e){
          alert(`${t("alert.sendFailed")}: ${e.message || e}`);
        } finally {
          btn.disabled = false;
        }
      };
    }
  }

  async function loadClientErrors() {
    const cutoff = Date.now() - CLIENT_ERRORS_WINDOW_MS;
    const mapDocs = (snap) => snap.docs.map((d) => ({ id: d.id, ...(d.data() || {}) }));

    try {
      const snap = await db.collection(CLIENT_ERRORS_COL)
        .where("ts", ">=", cutoff)
        .orderBy("ts", "desc")
        .limit(CLIENT_ERRORS_LIMIT)
        .get();
      return mapDocs(snap);
    } catch {
      try {
        const snap = await db.collection(CLIENT_ERRORS_COL)
          .orderBy("ts", "desc")
          .limit(CLIENT_ERRORS_LIMIT)
          .get();
        return mapDocs(snap).filter((x) => Number(x?.ts || 0) >= cutoff);
      } catch (e) {
        console.warn("client_errors load skipped:", e?.message || e);
        return [];
      }
    }
  }

  async function loadUsersDocsPaged() {
    const docs = [];
    let lastDoc = null;

    while (docs.length < USERS_MAX_FETCH) {
      let query = db.collection(USERS_COL).limit(USERS_PAGE_SIZE);
      if (lastDoc) query = query.startAfter(lastDoc);

      const snap = await query.get();
      if (snap.empty) break;

      docs.push(...snap.docs);
      lastDoc = snap.docs[snap.docs.length - 1] || null;

      if (snap.size < USERS_PAGE_SIZE) break;
    }

    if (docs.length >= USERS_MAX_FETCH) {
      console.warn("Users list truncated for safety", { limit: USERS_MAX_FETCH });
    }
    return docs.slice(0, USERS_MAX_FETCH);
  }

  async function loadAndRender() {
    const tbody = UI.tbody();
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:40px; color:#FFC72C;">${esc(t("table.loading"))}</td></tr>`;

    try {
      // Pull users + frontend incidents
      const [userDocs, clientErrors] = await Promise.all([
        loadUsersDocsPaged(),
        loadClientErrors()
      ]);
      CLIENT_ERRORS = Array.isArray(clientErrors) ? clientErrors : [];
      const base = userDocs
  .map(d => ({ uid: d.id, ...(d.data() || {}) }))
  .filter(u => u.email); // remove records without email


      // Priority-first ordering:
      // P3 -> P2 -> P1, then by recency.
      base.sort((a, b) => {
        const pDiff = getPlanPriority(b) - getPlanPriority(a);
        if (pDiff !== 0) return pDiff;
        return Number(b.lastSeen || 0) - Number(a.lastSeen || 0);
      });

      // Cost control:
      // - Full enrich only for a subset of P3
      // - Light enrich subset for P2
      // - Skip expensive enrich for P1
      const topP3 = base.filter((u) => getPlanPriority(u) === 3).slice(0, ENRICH_LIMIT_P3);
      const topP2 = base.filter((u) => getPlanPriority(u) === 2).slice(0, ENRICH_LIMIT_P2);
      const top = [...topP3, ...topP2];
      await Promise.all(top.map(async (u) => {
        const priority = getPlanPriority(u);

        // P3: full enrich
        // P2: light enrich (no AthleteCore ACWR call to reduce reads/cost)
        const [w, wel, inj, pwr, acwr] = await Promise.all([
          fetchWeight(u.uid).catch(() => null),
          fetchWellness(u.uid).catch(() => null),
          fetchInjury(u.uid).catch(() => null),
          priority >= 2 ? fetchPower(u.uid).catch(() => null) : Promise.resolve(null),
          priority === 3 ? fetchCoreACWR(u.uid).catch(() => null) : Promise.resolve(null),
        ]);

        u._weight = w;
        u._wellness = wel;
        u._injury = inj;
        u._power = pwr;
        u._acwr = acwr;
      }));

      ALL = base;
      renderFiltered();

    } catch (e) {
      console.error("admin load error:", e);
      CLIENT_ERRORS = [];
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:30px; color:#ff4d4d;">${esc(t("label.error"))}: ${esc(e.message)}</td></tr>`;
    }
  }

  function renderFiltered() {
    const tbody = UI.tbody();
    if (!tbody) return;

    const q = (UI.search()?.value || "").trim().toLowerCase();

const scoped = (activePlanTab === "all")
  ? ALL
  : ALL.filter((u) => {
      const p = getPlanPriority(u);
      if (activePlanTab === "p3") return p === 3;
      if (activePlanTab === "p2") return p === 2;
      if (activePlanTab === "p1") return p === 1;
      return true;
    });
const filtered = !q ? scoped : scoped.filter(u => {
  const name = normalizeText(u.displayName || ((u.firstName||"")+" "+(u.lastName||"")).trim() || "").toLowerCase();
  const email = (u.email || "").toLowerCase();
  const uid = (u.uid || "").toLowerCase();
  return name.includes(q) || email.includes(q) || uid.includes(q);
});

// apply sorting (copy array)
const list = sortUsers(filtered.slice());


    if (!list.length) {
      tbody.innerHTML = translateDynamicText(`<tr><td colspan="7" style="text-align:center; padding:28px; color:#999;">No users in ${esc(activePlanTab.toUpperCase())} tab</td></tr>`);
      refreshPlanTabsUI();
      return;
    }

    tbody.innerHTML = translateDynamicText(list.map(renderRow).join(""));
    tbody.querySelectorAll('button[data-action="manage"]').forEach(btn => {
  btn.onclick = () => openManageModal(btn.getAttribute("data-uid"));
});

    refreshPlanTabsUI();

  }
  
  async function openManage(uid) {
    const u = ALL.find(x => x.uid === uid);
    if (!u) return;

    const curRole = (u.role || "athlete").toLowerCase();
    const curPlanStatus = (u.planStatus || "").toLowerCase();
    const curPlanId = (u.planId || "").toLowerCase();

    const role = prompt("Role (athlete/coach):", curRole);
    if (!role) return;

    const planStatus = prompt("planStatus (trial/active/inactive or empty):", curPlanStatus);
    if (planStatus === null) return;

    const planId = prompt("planId (basic/plus/pro or empty):", curPlanId);
    if (planId === null) return;

    const roleNorm = role.trim().toLowerCase();
    if (!["athlete", "coach"].includes(roleNorm)) {
      alert("Role must be athlete or coach");
      return;
    }

    const ps = (planStatus || "").trim().toLowerCase();
    if (ps && !["trial", "active", "inactive"].includes(ps)) {
      alert("planStatus must be trial / active / inactive or empty");
      return;
    }

    const pid = (planId || "").trim().toLowerCase();
    if (pid && !["basic", "plus", "pro"].includes(pid)) {
      alert("planId must be basic / plus / pro or empty");
      return;
    }

    const patch = {
      role: roleNorm,
      planStatus: ps || null,
      planId: pid || null
    };

    try {
      await db.collection(USERS_COL).doc(uid).update(patch);
      // update local cache to avoid UI flicker
      u.role = roleNorm;
      u.planStatus = ps || "";
      u.planId = pid || "";
      renderFiltered();
    } catch (e) {
      alert("Update error: " + e.message);
    }
  }
  // ===== Manage Modal logic (from Control Center, adapted to stable design) =====
  let modalUid = null;
  let modalSnapshot = null;
  let coachesCache = [];
  

  function mShow(on){ const el = document.getElementById("manageModal"); if(el) el.style.display = on ? "flex" : "none"; }
  function m$(id){ return document.getElementById(id); }

  async function loadCoachesOnce(){
    if (coachesCache.length) return coachesCache;
    try{
      const snap = await db.collection(USERS_COL).where("role","==","coach").limit(200).get();
      coachesCache = snap.docs.map(d=>{
        const x = d.data()||{};
        const nm = x.displayName || x.name || ((x.firstName||"")+" "+(x.lastName||"")).trim() || x.email || d.id;
        return { uid: d.id, name: nm, email: x.email || "" };
      }).sort((a,b)=> String(a.name).localeCompare(String(b.name)));
    }catch{ coachesCache = []; }
    return coachesCache;
  }

  function safeRoleOptions(targetEmail){
    const sel = m$("mRole"); if(!sel) return;
    const canAdminRole = (String(stateMeEmail||"").toLowerCase() === ADMIN_EMAIL.toLowerCase())
      && (String(targetEmail||"").toLowerCase() === ADMIN_EMAIL.toLowerCase());
    [...sel.options].forEach(o=>{ if(o.value==="admin") o.hidden = !canAdminRole; });
    if(!canAdminRole && sel.value==="admin") sel.value="coach";
  }

  function fillCoachSelect(selected){
    const sel = m$("mCoach"); if(!sel) return;
    const opts = [`<option value="">- none -</option>`];
    coachesCache.forEach(c=>{
      const s = (c.uid===selected) ? "selected" : "";
      opts.push(`<option value="${esc(c.uid)}" ${s}>${esc(c.name)} (${esc(c.email)})</option>`);
    });
    sel.innerHTML = opts.join("");
  }

  function addDaysFromNow(days){ return Date.now() + days*24*60*60*1000; }

  // we need admin email for safeRoleOptions
  let stateMeEmail = null;

  async function openManageModal(uid){
    const u = ALL.find(x=>x.uid===uid);
    if(!u) return;

    modalUid = uid;

    // fresh snapshot from Firestore for Reset
    const doc = await db.collection(USERS_COL).doc(uid).get();
    const data = doc.exists ? (doc.data()||{}) : {};
    modalSnapshot = { uid, ...(data||{}) };

    // header
    m$("mTitle").textContent = `Manage: ${normalizeText(u.displayName || u.email || u.uid)}`;
    m$("mSub").textContent = `${u.uid}${u.email ? " | " + normalizeText(u.email) : ""}`;
    renderManageOnboardingSummary({ ...(u || {}), ...(data || {}) });

    // preload coaches
    await loadCoachesOnce();
    fillCoachSelect(u.coachId || "");

    // fields
    m$("mRole").value = (u.role || "athlete");
    m$("mPlanStatus").value = (u.planStatus || "trial");
    m$("mPlanId").value = (u.planId || "");
    m$("mPaidUntilMs").value = String(u.paidUntilMs || 0);
    m$("mTrialEndsAtMs").value = String(u.trialEndsAtMs || 0);

    safeRoleOptions(u.email);
    openChatFor(uid).catch(()=>{});

    mShow(true);
  }

  function resetManageModal(){
    if(!modalSnapshot) return;
    const s = modalSnapshot;

    m$("mRole").value = (s.role || "athlete");
    m$("mPlanStatus").value = (s.planStatus || "trial");
    m$("mPlanId").value = (s.planId || "");
    m$("mPaidUntilMs").value = String(s.paidUntilMs || 0);
    m$("mTrialEndsAtMs").value = String(s.trialEndsAtMs || 0);

    fillCoachSelect(s.coachId || "");
    safeRoleOptions(s.email);
    renderManageOnboardingSummary(s || {});
  }

  async function saveManageModal(){
    if(!modalUid) return;
    const u = ALL.find(x=>x.uid===modalUid);
    if(!u) return;

    const nextRole = m$("mRole").value;
    const nextCoachId = m$("mCoach").value || null;
    const nextPlanStatus = m$("mPlanStatus").value || "trial";
    const nextAccessStatus = nextPlanStatus === "active"
      ? "active"
      : (nextPlanStatus === "trial" ? "trial" : "expired");
    const nextPlanId = (m$("mPlanId").value || "").trim() || null;

    const paidRaw = (m$("mPaidUntilMs").value || "").trim();
    const trialRaw = (m$("mTrialEndsAtMs").value || "").trim();
    const paidUntilMs = paidRaw ? Number(paidRaw) : 0;
    const trialEndsAtMs = trialRaw ? Number(trialRaw) : 0;

    if (paidRaw && !Number.isFinite(paidUntilMs)) return alert("paidUntilMs must be a number (ms).");
    if (trialRaw && !Number.isFinite(trialEndsAtMs)) return alert("trialEndsAtMs must be a number (ms).");

    // SAFE: admin role only for your email
    if (nextRole === "admin" && String(u.email||"").toLowerCase() !== ADMIN_EMAIL.toLowerCase()){
      return alert("admin role is allowed only for your email.");
    }

    const patch = {
      role: nextRole,
      coachId: nextCoachId,
      planStatus: nextPlanStatus,
      accessStatus: nextAccessStatus,
      planId: nextPlanId,
      paidUntilMs: paidUntilMs || 0,
      trialEndsAtMs: trialEndsAtMs || 0,
      paidUntil: (paidUntilMs ? new Date(paidUntilMs).toISOString() : null),
    };

    try{
      await db.collection(USERS_COL).doc(modalUid).set(patch, { merge:true });

      // update local
      Object.assign(u, patch);
      renderFiltered();
      mShow(false);
      alert("Saved");
    }catch(e){
      alert("Save failed: " + (e.message || e));
    }
  }

  function wireManageModal(){
    m$("mClose")?.addEventListener("click", ()=>{ stopChat(); mShow(false); });

    m$("mReset")?.addEventListener("click", resetManageModal);
    m$("mSave")?.addEventListener("click", saveManageModal);

    m$("qaTrial7")?.addEventListener("click", ()=>{
      m$("mPlanStatus").value = "trial";
      m$("mTrialEndsAtMs").value = String(addDaysFromNow(7));
      m$("mPaidUntilMs").value = "0";
    });

    m$("qaAct30")?.addEventListener("click", ()=>{
      m$("mPlanStatus").value = "active";
      m$("mPaidUntilMs").value = String(addDaysFromNow(30));
    });

    m$("qaDeactivate")?.addEventListener("click", ()=>{
      m$("mPlanStatus").value = "inactive";
      m$("mPaidUntilMs").value = "0";
    });

    // click outside box closes
    m$("manageModal")?.addEventListener("click", (e)=>{
  if(e.target && e.target.id==="manageModal") { stopChat(); mShow(false); }
});

  }

  function wireUI() {
    UI.search()?.addEventListener("input", () => renderFiltered());
    UI.refresh()?.addEventListener("click", () => loadAndRender());

    const langSelect = UI.langSelect();
    if (langSelect) {
      langSelect.value = currentLang;
      langSelect.onchange = () => {
        currentLang = normalizeLang(langSelect.value);
        saveStoredLang(currentLang);
        applyStaticI18n();
        refreshPlanTabsUI();
        refreshModuleUI();
        renderFiltered();
      };
    }

    wireAdminModuleTabs();
    wireLegacyAthleteToggle();
    wirePlanTabs();
    refreshModuleUI();

    UI.logout()?.addEventListener("click", async () => {
  try { await firebase.auth().signOut(); } catch {}
  window.location.href = "index.html";
});

  }

  // ---------- Auth gate for admin page ----------
  firebase.auth().onAuthStateChanged(async (user) => {
    currentLang = readStoredLang();
    applyStaticI18n();

    if (!user) {
      window.location.href = "index.html";
      return;
    }

    const email = (user.email || "").toLowerCase();
    if (UI.adminMe()) {
      UI.adminMe().dataset.email = user.email || user.uid;
      UI.adminMe().textContent = `${t("admin.prefix")}: ${user.email || user.uid}`;
    }
    stateMeEmail = user.email || null;

    try {
      const fromUrl = String(new URL(window.location.href).searchParams.get("module") || "").toLowerCase();
      if (["overview", "billing", "users", "security", "audit", "incidents", "costs"].includes(fromUrl)) {
        activeModule = fromUrl;
      }
    } catch {}

    wireManageModal();


    if (!user.emailVerified || email !== ADMIN_EMAIL.toLowerCase()) {
      alert(t("alert.accessDenied"));
      window.location.href = "index.html";
      return;
    }

    wireUI();
    wireSortingUI();
    applyStaticI18n();

    await loadAndRender();
  });

})();

