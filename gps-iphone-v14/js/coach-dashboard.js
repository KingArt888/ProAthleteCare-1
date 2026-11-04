(function () {
  const db = firebase.firestore();
  const qs = new URLSearchParams(window.location.search);
  const asAdmin = qs.get("asAdmin") === "1";
  const targetCoachIdFromUrl = (qs.get("coachId") || "").trim();

  let coachInviteLink = "";
  let athletes = [];
  let coachUid = "";
  let coachName = "";
  let currentFilter = "all";

  const ENRICH_LIMIT = 8;
  const ENRICH_CACHE_MS = 5 * 60 * 1000;
  const enrichCache = new Map();

  const I18N = {
    en: {
      docTitle: "ProAthleteCare | Coach Workspace",
      tagline: "Online training and professional athlete support",
      navCoachDashboard: "Coach Workspace",
      navCoachWeek: "Week Editor",
      navCoachDate: "Date Plan",
      navSystemAdmin: "Admin Panel",
      pageTitle: "Coach Workspace",
      topReadiness: "Team readiness",
      topNextSession: "Next key session",
      refresh: "Refresh",
      openWeek: "Open Week",
      datePlan: "Date Plan",
      kickerAlerts: "ALERTS",
      kickerDecisions: "QUICK DECISIONS",
      titleActions: "Today actions",
      kickerTeam: "TEAM STATUS",
      kickerEarnings: "COACH EARNINGS",
      kickerClients: "MY CLIENTS",
      kickerNotes: "COACH NOTES",
      notesEmpty: "No notes yet.",
      searchPlaceholder: "Search (name / email / uid)",
      clientsCount: "clients",
      readMore: "Open",
      noAlerts: "No critical alerts.",
      noActions: "No actions right now.",
      online: "online",
      minShort: "m",
      hourShort: "h",
      dayShort: "d",
      tableClient: "CLIENT",
      tableReadiness: "READINESS",
      tableTrend: "TREND",
      tableAvg7: "7D AVG",
      tableWellness: "WELLNESS",
      tableRisk: "RISK",
      tableLastSeen: "LAST SEEN",
      tableActions: "ACTIONS",
      adjust: "Adjust",
      recovery: "Recovery",
      message: "Message",
      summaryClients: "Clients",
      summaryActiveToday: "Active today",
      summaryAvgReadiness: "Avg readiness",
      summaryHighRisk: "High risk",
      nextClientFallback: "client",
      alertHighRisk: "HIGH injury risk",
      alertNoData: "No data 2+ days",
      alertFatigue: "Fatigue trend",
      attention: "Attention",
      actionRecovery: "Recovery session",
      actionLight: "Light training (-20%)",
      actionFull: "Ready for full training",
      apply: "Apply",
      edit: "Edit",
      mrr: "MRR",
      myPercent: "My %",
      expected: "Expected",
      paid: "Paid",
      coachLabel: "Coach",
      inviteCode: "Invite code",
      inviteNotSet: "not set",
      copyInviteLink: "Copy Invite Link",
      inviteLinkNotReady: "Invite link not ready.",
      inviteLinkCopied: "Invite link copied.",
      invitePrompt: "Copy invite link:",
      cannotLoadClients: "Cannot load clients",
      accessDenied: "Access denied.",
      applied: "Applied.",
      athlete: "Athlete",
      teamLabel: "Team",
      sportLabel: "Sport",
    },
    uk: {
      docTitle: "ProAthleteCare | Робочий простір тренера",
      tagline: "Онлайн-тренінг та професійний супровід атлетів",
      navCoachDashboard: "Робочий простір тренера",
      navCoachWeek: "Редактор тижня",
      navCoachDate: "План за датами",
      navSystemAdmin: "Адмін-панель",
      pageTitle: "Робочий простір тренера",
      topReadiness: "Готовність команди",
      topNextSession: "Наступна ключова сесія",
      refresh: "Оновити",
      openWeek: "Відкрити тиждень",
      datePlan: "План за датами",
      kickerAlerts: "УВАГА",
      kickerDecisions: "ШВИДКІ РІШЕННЯ",
      titleActions: "Дії на сьогодні",
      kickerTeam: "СТАН КОМАНДИ",
      kickerEarnings: "ДОХІД ТРЕНЕРА",
      kickerClients: "МОЇ КЛІЄНТИ",
      kickerNotes: "НОТАТКИ ТРЕНЕРА",
      notesEmpty: "Нотаток поки немає.",
      searchPlaceholder: "Пошук (ім'я / email / uid)",
      clientsCount: "клієнтів",
      readMore: "Відкрити",
      noAlerts: "Критичних алертів немає.",
      noActions: "Наразі дій немає.",
      online: "онлайн",
      minShort: "хв",
      hourShort: "г",
      dayShort: "д",
      tableClient: "КЛІЄНТ",
      tableReadiness: "ГОТОВНІСТЬ",
      tableTrend: "ТРЕНД",
      tableAvg7: "7Д СЕРЕДНЄ",
      tableWellness: "WELLNESS",
      tableRisk: "РИЗИК",
      tableLastSeen: "ОСТАННЯ АКТИВНІСТЬ",
      tableActions: "ДІЇ",
      adjust: "Корекція",
      recovery: "Відновлення",
      message: "Повідомлення",
      summaryClients: "Клієнти",
      summaryActiveToday: "Активні сьогодні",
      summaryAvgReadiness: "Сер. готовність",
      summaryHighRisk: "Високий ризик",
      nextClientFallback: "клієнт",
      alertHighRisk: "ВИСОКИЙ ризик травми",
      alertNoData: "Немає даних 2+ дні",
      alertFatigue: "Тренд втоми",
      attention: "Увага",
      actionRecovery: "Сесія відновлення",
      actionLight: "Легке тренування (-20%)",
      actionFull: "Готовий до повного тренування",
      apply: "Застосувати",
      edit: "Редагувати",
      mrr: "MRR",
      myPercent: "Мій %",
      expected: "Очікується",
      paid: "Виплачено",
      coachLabel: "Тренер",
      inviteCode: "Інвайт-код",
      inviteNotSet: "не задано",
      copyInviteLink: "Скопіювати інвайт-лінк",
      inviteLinkNotReady: "Інвайт-лінк ще не готовий.",
      inviteLinkCopied: "Інвайт-лінк скопійовано.",
      invitePrompt: "Скопіюй інвайт-лінк:",
      cannotLoadClients: "Не вдалось завантажити клієнтів",
      accessDenied: "Доступ заборонено.",
      applied: "Застосовано.",
      athlete: "Атлет",
      teamLabel: "Команда",
      sportLabel: "Спорт",
    }
  };

  I18N.de = { ...I18N.en };
  I18N.es = { ...I18N.en };
  I18N.ru = { ...I18N.en };
  I18N.pt = { ...I18N.en };

  function getLang() {
    const raw = String(localStorage.getItem("pac_lang") || "").toLowerCase();
    if (raw === "ua") return "uk";
    return I18N[raw] ? raw : "en";
  }

  function tt(key) {
    const lang = getLang();
    return I18N[lang]?.[key] ?? I18N.en[key] ?? key;
  }

  function setLinkTextWithIcon(id, text) {
    const el = document.getElementById(id);
    if (!el) return;
    const img = el.querySelector("img");
    el.textContent = `${text} `;
    if (img) el.appendChild(img);
  }

  function coachWorkspaceParams() {
    if (asAdmin && targetCoachIdFromUrl) {
      return `asAdmin=1&coachId=${encodeURIComponent(targetCoachIdFromUrl)}`;
    }
    return "";
  }

  function withCoachWorkspace(base) {
    const p = coachWorkspaceParams();
    return p ? `${base}?${p}` : base;
  }

  function applyCoachWorkspaceNavLinks() {
    const navDash = document.getElementById("nav-coach-dashboard");
    const navWeek = document.getElementById("nav-coach-week");
    const navDate = document.getElementById("nav-coach-date");
    const btnDate = document.getElementById("btn-date-plan");

    if (navDash) navDash.href = withCoachWorkspace("coach-dashboard.html");
    if (navWeek) navWeek.href = withCoachWorkspace("coach-week-editor.html");
    if (navDate) navDate.href = withCoachWorkspace("coach-date-plan.html");
    if (btnDate) btnDate.href = withCoachWorkspace("coach-date-plan.html");
  }

  function applyPageI18n() {
    document.documentElement.lang = getLang();
    document.title = tt("docTitle");

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

    set("coach-tagline", tt("tagline"));
    setLinkTextWithIcon("nav-coach-dashboard", tt("navCoachDashboard"));
    setLinkTextWithIcon("nav-coach-week", tt("navCoachWeek"));
    setLinkTextWithIcon("nav-coach-date", tt("navCoachDate"));
    setLinkTextWithIcon("nav-admin-panel", tt("navSystemAdmin"));

    set("coach-page-title", tt("pageTitle"));
    set("btn-refresh", tt("refresh"));
    set("btn-open-current", tt("openWeek"));
    set("btn-date-plan", tt("datePlan"));
    set("coach-kicker-alerts", tt("kickerAlerts"));
    set("coach-kicker-decisions", tt("kickerDecisions"));
    set("coach-title-actions", tt("titleActions"));
    set("coach-kicker-team", tt("kickerTeam"));
    set("coach-kicker-earnings", tt("kickerEarnings"));
    set("coach-kicker-clients", tt("kickerClients"));
    set("coach-kicker-notes", tt("kickerNotes"));

    const search = document.getElementById("coach-search-input");
    if (search) search.placeholder = tt("searchPlaceholder");

    const notesBox = document.getElementById("coach-notes-box");
    if (notesBox && String(notesBox.textContent || "").trim().toLowerCase() === "no notes yet.") {
      notesBox.textContent = tt("notesEmpty");
    }

    applyCoachWorkspaceNavLinks();
  }

  function esc(s) {
    return String(s ?? "").replace(/[&<>\"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
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

  function athleteMetaLine(a) {
    const team = String(a?.club || a?.team || a?.clubName || a?.onboarding?.club || "").trim();
    const rawSport = String(a?.sportType || a?.sport || a?.onboarding?.summary?.sport || a?.onboarding?.sport || "").trim();
    const sport = normalizeSportLabel(rawSport);
    return `${tt("teamLabel")}: ${team || "—"} • ${tt("sportLabel")}: ${sport || "—"}`;
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
    if (mins < 5) return `<b style="color:#00ff00;">● ${tt("online")}</b>`;
    if (mins < 60) return `${mins}${tt("minShort")}`;
    const h = Math.floor(diff / 3600000);
    if (h < 24) return `${h}${tt("hourShort")}`;
    return `${Math.floor(diff / 86400000)}${tt("dayShort")}`;
  }

  function mondayId(d = new Date()) {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(date.setDate(diff));
    return monday.toISOString().split("T")[0];
  }

  function randomInviteCode(len = 5) {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let out = "";
    for (let i = 0; i < len; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
    return out;
  }

  async function ensureCoachInviteCode(uid) {
    if (!uid) return "";
    const ref = db.collection("users").doc(uid);
    const snap = await ref.get();
    if (!snap.exists) return "";
    const d = snap.data() || {};
    const existing = String(d.inviteCode || "").trim();
    if (existing) return existing;
    const code = randomInviteCode(5);
    await ref.set({ inviteCode: code }, { merge: true });
    return code;
  }

  async function copyInviteLink() {
    if (!coachInviteLink) return alert(tt("inviteLinkNotReady"));
    try {
      await navigator.clipboard.writeText(coachInviteLink);
      alert(tt("inviteLinkCopied"));
    } catch {
      window.prompt(tt("invitePrompt"), coachInviteLink);
    }
  }

  function openComposeForAthlete(uid) {
    const targetUid = String(uid || "").trim();
    if (!targetUid) return;

    const context = asAdmin ? "&fromAdmin=1" : "&fromCoach=1";
    const fallbackHref = `weekly-individual.html?userId=${encodeURIComponent(targetUid)}${context}`;
    const bellBtn = document.getElementById("mail-button");

    if (!bellBtn) {
      window.location.href = fallbackHref;
      return;
    }

    bellBtn.click();

    const trySelectRecipient = (attempt = 0) => {
      const select = document.getElementById("pacToSelect");
      if (!select) {
        if (attempt < 12) {
          setTimeout(() => trySelectRecipient(attempt + 1), 120);
          return;
        }
        window.location.href = fallbackHref;
        return;
      }

      const hasRecipient = Array.from(select.options || []).some((opt) => opt.value === targetUid);
      if (!hasRecipient && attempt < 12) {
        setTimeout(() => trySelectRecipient(attempt + 1), 120);
        return;
      }

      if (!hasRecipient) {
        const opt = document.createElement("option");
        opt.value = targetUid;
        opt.textContent = tt("athlete");
        select.appendChild(opt);
      }

      select.value = targetUid;
      select.dispatchEvent(new Event("change", { bubbles: true }));

      const textArea = document.getElementById("pacComposeText");
      if (textArea) textArea.focus();
    };

    setTimeout(() => {
      document.getElementById("pacTabCompose")?.click();
      setTimeout(() => trySelectRecipient(), 80);
    }, 60);
  }

  async function fetchLastByUserId(col, uid, limitN = 8) {
    if(col==='load_season_reports'){
      const snap=await db.collection(col).where('userId','==',uid).get();
      return window.PACSessionJournal.project(snap.docs.map(doc=>({id:doc.id,data:doc.data()}))).knownRows.at(-1)||null;
    }
    const snap = await db.collection(col).where("userId", "==", uid).limit(limitN).get();
    if (snap.empty) return null;
    const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() || {}) }));
    list.sort((a, b) => safeMillis(b.timestamp || b.createdAt || b.date || b.updatedAt) - safeMillis(a.timestamp || a.createdAt || a.date || a.updatedAt));
    return list[0] || null;
  }

  async function fetchPower(uid) {
    try {
      const snap = await db.collection("power_tests").doc(uid).collection("tests").limit(1).get();
      if (snap.empty) return null;
      const d = snap.docs[0].data() || {};
      const cmj = Number(d.best_cm ?? d.bestCm ?? d.best ?? null);
      return Number.isFinite(cmj) ? cmj : null;
    } catch { return null; }
  }

  async function fetchAthleteReport(uid) {
    try {
      const snap = await db.collection("athlete_reports").doc(uid).get();
      if (!snap.exists) return null;
      return snap.data() || null;
    } catch { return null; }
  }

  async function fetchLatestMetrics(uid) {
    const now = Date.now();
    const cached = enrichCache.get(uid);
    if (cached && now - cached.ts < ENRICH_CACHE_MS) return cached.data;

    const report = await fetchAthleteReport(uid);
    if (report) {
      const rr = {
        readinessPct: Number(report.readinessPct ?? NaN),
        trend: String(report.trend || "flat"),
        avg7: Number(report.compliance7dPct ?? report.last7dAvg ?? NaN),
        riskLevel: String(report.riskLevel || ""),
        wellnessAvg: Number(report.wellnessAvg7d ?? NaN),
        pain: Number(report.injuryPain ?? NaN),
        acwr: Number(report.acwr ?? NaN),
        cmj: Number(report.cmj ?? NaN),
        weight: Number(report.weight ?? NaN),
      };
      enrichCache.set(uid, { ts: now, data: rr });
      return rr;
    }

    const [w, wel, inj, load, cmj] = await Promise.all([
      fetchLastByUserId("weight_history", uid, 10).catch(() => null),
      fetchLastByUserId("wellness_reports", uid, 10).catch(() => null),
      fetchLastByUserId("injuries", uid, 10).catch(() => null),
      fetchLastByUserId("load_season_reports", uid, 12).catch(() => null),
      fetchPower(uid),
    ]);

    const sleep = Number(wel?.sleep ?? wel?.scores?.sleep ?? NaN);
    const stress = Number(wel?.stress ?? wel?.scores?.stress ?? NaN);
    const soreness = Number(wel?.soreness ?? wel?.scores?.soreness ?? NaN);
    const ready = Number(wel?.ready ?? wel?.scores?.ready ?? NaN);

    const data = {
      readinessPct: Number.isFinite(ready) ? Math.max(0, Math.min(100, Math.round(ready * 10))) : NaN,
      trend: "flat",
      avg7: NaN,
      riskLevel: "",
      wellnessAvg: Number.isFinite(ready) ? ready : NaN,
      pain: Number(inj?.pain ?? inj?.painScore ?? inj?.level ?? NaN),
      acwr: Number(load?.acwr ?? load?.ACWR ?? NaN),
      cmj: Number(cmj ?? NaN),
      weight: Number(w?.value ?? w?.weight ?? NaN),
      sleep, stress, soreness, ready,
    };
    enrichCache.set(uid, { ts: now, data });
    return data;
  }

  function riskFrom(a) {
    if (a.riskLevel) return a.riskLevel;
    const pain = Number(a.pain);
    const acwr = Number(a.acwr);
    if ((Number.isFinite(pain) && pain >= 7) || (Number.isFinite(acwr) && acwr >= 1.5)) return "high";
    if ((Number.isFinite(pain) && pain >= 4) || (Number.isFinite(acwr) && acwr >= 1.3)) return "med";
    return "low";
  }

  function trendObj(a) {
    const tr = String(a.trend || "flat").toLowerCase();
    if (tr === "up") return { text: "UP", cls: "up" };
    if (tr === "down") return { text: "DOWN", cls: "down" };
    return { text: "FLAT", cls: "flat" };
  }

  function wellnessMini(a) {
    const cell = (icon, val) => {
      const has = Number.isFinite(Number(val));
      return `<div style="display:flex;flex-direction:column;align-items:center;width:34px;padding:6px 0;border-radius:10px;border:1px solid rgba(255,255,255,.12);background:rgba(0,0,0,.22);"><span style="font-size:13px;">${icon}</span><b style="font-size:11px;color:${has ? "#fff" : "#666"};margin-top:2px;">${has ? Number(val) : "-"}</b></div>`;
    };
    return `<div style="display:flex;gap:6px;justify-content:center;">${cell("😴", a.sleep)}${cell("🧠", a.stress)}${cell("💪", a.soreness)}${cell("⚡", a.ready)}</div>`;
  }

  function riskBadge(risk, pain) {
    const p = Number(pain);
    if (risk === "high") return `<div style="display:inline-block;padding:6px 10px;border-radius:999px;border:1px solid #ff4d4d55;background:#ff4d4d18;color:#ff4d4d;font-weight:900;font-size:11px;">HIGH${Number.isFinite(p) ? ` (${p})` : ""}</div>`;
    if (risk === "med") return `<div style="display:inline-block;padding:6px 10px;border-radius:999px;border:1px solid #FFC72C55;background:#FFC72C18;color:#FFC72C;font-weight:900;font-size:11px;">MED${Number.isFinite(p) ? ` (${p})` : ""}</div>`;
    return `<div style="display:inline-block;padding:6px 10px;border-radius:999px;border:1px solid #00ff0055;background:#00ff0014;color:#00ff00;font-weight:900;font-size:11px;">LOW</div>`;
  }

  function filteredAthletes() {
    const q = String(document.getElementById("coach-search-input")?.value || "").trim().toLowerCase();
    return athletes
      .filter((a) => {
        if (currentFilter === "active") {
          if (!(Number(a.lastSeen || 0) > (Date.now() - 24 * 60 * 60 * 1000))) return false;
        }
        if (currentFilter === "risk") {
          if (riskFrom(a) !== "high") return false;
        }
        if (q) {
          const name = String(a.displayName || `${a.firstName || ""} ${a.lastName || ""}`.trim() || "").toLowerCase();
          const email = String(a.email || "").toLowerCase();
          const uid = String(a.uid || "").toLowerCase();
          if (!name.includes(q) && !email.includes(q) && !uid.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => Number(b.lastSeen || 0) - Number(a.lastSeen || 0));
  }

  function renderTable() {
    const host = document.getElementById("athletes-table");
    if (!host) return;
    const ctx = asAdmin ? "&fromAdmin=1" : "&fromCoach=1";
    const list = filteredAthletes();

    host.innerHTML = `
      <table class="monitor-table">
        <thead><tr><th class="sticky-col">${tt("tableClient")}</th><th>${tt("tableReadiness")}</th><th>${tt("tableTrend")}</th><th>${tt("tableAvg7")}</th><th>${tt("tableWellness")}</th><th>${tt("tableRisk")}</th><th>${tt("tableLastSeen")}</th><th style="text-align:right;">${tt("tableActions")}</th></tr></thead>
        <tbody>
          ${list.map((a) => {
            const name = a.displayName || `${a.firstName || ""} ${a.lastName || ""}`.trim() || a.email || a.uid;
            const photo = a.photoURL || "../assets/images/AK_logo.png";
            const metaLine = athleteMetaLine(a);
            const base = `userId=${encodeURIComponent(a.uid)}${ctx}`;
            const readiness = Number.isFinite(Number(a.readinessPct)) ? Number(a.readinessPct) : 0;
            const trend = trendObj(a);
            const avg7 = Number.isFinite(Number(a.avg7)) ? Number(a.avg7).toFixed(0) : "-";
            const risk = riskFrom(a);
            return `
              <tr>
                <td class="sticky-col"><div style="display:flex;gap:10px;align-items:center;"><img src="${esc(photo)}" style="width:34px;height:34px;border-radius:50%;object-fit:cover;border:2px solid #444;" /><div style="min-width:0;"><div style="font-weight:900;color:#fff;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:220px;">${esc(name)}</div><div style="font-size:11px;opacity:.82;color:#FFC72C;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:220px;">${esc(metaLine)}</div><div style="font-size:11px;opacity:.65;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:220px;">${esc(a.email || a.uid)}</div></div></div></td>
                <td style="text-align:center;"><b style="color:${readiness >= 75 ? "#00ff88" : readiness >= 55 ? "#FFC72C" : "#ff7a7a"}">${readiness}%</b></td>
                <td style="text-align:center;"><span class="coach-pill ${trend.cls}">${trend.text}</span></td>
                <td style="text-align:center;">${avg7}</td>
                <td>${wellnessMini(a)}</td>
                <td style="text-align:center;">${riskBadge(risk, a.pain)}</td>
                <td style="text-align:center;font-size:12px;">${getTimeSince(Number(a.lastSeen || safeMillis(a.updatedAt)))}</td>
                <td style="text-align:right;white-space:nowrap;"><a class="ud-btn ud-btn--ghost" style="text-decoration:none;padding:8px 10px;" href="weekly-individual.html?${base}">${tt("adjust")}</a> <a class="ud-btn ud-btn--ghost" href="load-season.html?${base}">Journal</a> <button class="ud-btn ud-btn--ghost" data-act="recovery" data-uid="${esc(a.uid)}" type="button">${tt("recovery")}</button> <button class="ud-btn ud-btn--ghost" data-act="message" data-uid="${esc(a.uid)}" type="button">${tt("message")}</button></td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    `;
  }

  function renderTop() {
    const total = athletes.length;
    const activeToday = athletes.filter((a) => Number(a.lastSeen || 0) > (Date.now() - 24 * 60 * 60 * 1000)).length;
    const validReady = athletes.filter((a) => Number.isFinite(Number(a.readinessPct)));
    const avgRead = validReady.length ? validReady.reduce((acc, a) => acc + Number(a.readinessPct), 0) / validReady.length : 0;
    const highRisk = athletes.filter((a) => riskFrom(a) === "high").length;

    const summary = document.getElementById("coach-summary-cards");
    if (summary) {
      summary.innerHTML = `
        <div class="ud-progress-item" data-filter="all"><div class="ud-progress-top"><span class="ud-progress-name">${tt("summaryClients")}</span><span class="ud-progress-val">${total}</span></div></div>
        <div class="ud-progress-item" data-filter="active"><div class="ud-progress-top"><span class="ud-progress-name">${tt("summaryActiveToday")}</span><span class="ud-progress-val">${total ? Math.round((activeToday / total) * 100) : 0}%</span></div><div class="ud-progress-track"><div class="ud-progress-bar" style="width:${total ? Math.round((activeToday / total) * 100) : 0}%"></div></div></div>
        <div class="ud-progress-item" data-filter="all"><div class="ud-progress-top"><span class="ud-progress-name">${tt("summaryAvgReadiness")}</span><span class="ud-progress-val">${Math.round(avgRead)}%</span></div></div>
        <div class="ud-progress-item" data-filter="risk"><div class="ud-progress-top"><span class="ud-progress-name">${tt("summaryHighRisk")}</span><span class="ud-progress-val">${highRisk}</span></div><div class="ud-progress-track"><div class="ud-progress-bar" style="width:${Math.min(100, highRisk * 20)}%"></div></div></div>
      `;
    }

    document.querySelectorAll("#coach-summary-cards [data-filter]").forEach((el) => {
      el.style.cursor = "pointer";
      el.addEventListener("click", () => {
        currentFilter = el.getAttribute("data-filter") || "all";
        renderTable();
      });
    });

    const topRead = document.getElementById("coach-top-readiness");
    if (topRead) topRead.textContent = `${tt("topReadiness")}: ${Math.round(avgRead)}%`;

    const nextSession = document.getElementById("coach-top-next-session");
    if (nextSession) {
      const soon = athletes.slice().sort((a, b) => Number(a.lastSeen || 0) - Number(b.lastSeen || 0))[0];
      nextSession.textContent = `${tt("topNextSession")}: ${soon ? (soon.displayName || soon.email || tt("nextClientFallback")) : "-"}`;
    }

    const count = document.getElementById("athletes-count");
    if (count) count.textContent = `${athletes.length} ${tt("clientsCount")}`;
  }

  function renderAlertsAndActions() {
    const alertsHost = document.getElementById("coach-alerts-list");
    const alertsTitle = document.getElementById("coach-alerts-title");
    const actionsHost = document.getElementById("coach-quick-actions-list");

    if (!alertsHost || !actionsHost) return;

    const alerts = athletes.map((a) => {
      const readiness = Number(a.readinessPct || 0);
      const pain = Number(a.pain || 0);
      const inactive = Number(a.lastSeen || 0) && (Date.now() - Number(a.lastSeen || 0) > 2 * 86400000);
      let severity = 0;
      let reason = "";
      if (pain >= 7 || Number(a.acwr || 0) >= 1.5) { severity = 3; reason = tt("alertHighRisk"); }
      else if (inactive) { severity = 2; reason = tt("alertNoData"); }
      else if (readiness < 55) { severity = 1; reason = tt("alertFatigue"); }
      return { a, severity, reason };
    }).filter((x) => x.severity > 0).sort((x, y) => y.severity - x.severity).slice(0, 5);

    alertsTitle.textContent = `${tt("attention")} (${alerts.length})`;
    const alertCtx = asAdmin ? "fromAdmin=1" : "fromCoach=1";
    alertsHost.innerHTML = alerts.length ? alerts.map(({ a, severity, reason }) => {
      const name = a.displayName || `${a.firstName || ""} ${a.lastName || ""}`.trim() || a.email || a.uid;
      const cls = severity >= 3 ? "is-high" : "is-med";
      const href = `weekly-individual.html?userId=${encodeURIComponent(a.uid)}&${alertCtx}`;
      return `<a class="coach-alert-item ${cls}" href="${href}" style="text-decoration:none;color:inherit;"><span><b>${esc(name)}</b> → ${esc(reason)}</span><span>${tt("readMore")}</span></a>`;
    }).join("") : `<div class="ud-mini">${tt("noAlerts")}</div>`;

    const actions = athletes.slice().sort((x, y) => Number(x.readinessPct || 0) - Number(y.readinessPct || 0)).slice(0, 3);
    actionsHost.innerHTML = actions.length ? actions.map((a) => {
      const name = a.displayName || `${a.firstName || ""} ${a.lastName || ""}`.trim() || a.email || a.uid;
      const pain = Number(a.pain || 0);
      const readiness = Number(a.readinessPct || 0);
      const action = pain >= 7 ? tt("actionRecovery") : readiness < 60 ? tt("actionLight") : tt("actionFull");
      return `<div class="coach-action-item"><span><b>${esc(name)}</b> → ${esc(action)}</span><div class="coach-inline-actions"><button class="ud-btn ud-btn--ghost" data-act="apply" data-uid="${esc(a.uid)}" type="button">${tt("apply")}</button><button class="ud-btn ud-btn--ghost" data-act="edit" data-uid="${esc(a.uid)}" type="button">${tt("edit")}</button></div></div>`;
    }).join("") : `<div class="ud-mini">${tt("noActions")}</div>`;
  }

  async function renderEarnings() {
    const host = document.getElementById("coach-earnings-cards");
    if (!host || !coachUid) return;

    const monthKey = new Date().toISOString().slice(0, 7).replace("-", "_");
    let payout = null;
    try {
      const snap = await db.collection("coach_payouts").doc(`${coachUid}_${monthKey}`).get();
      payout = snap.exists ? (snap.data() || null) : null;
    } catch {}

    const mrr = Number(payout?.mrrBase ?? 0);
    const pct = Number.isFinite(Number(payout?.commissionPct)) ? Number(payout.commissionPct) : 0.2;
    const expected = Number(payout?.expectedPayout ?? (mrr * pct));
    const paid = Number(payout?.paidAmount ?? 0);

    host.innerHTML = `
      <div class="ud-progress-item"><div class="ud-progress-top"><span class="ud-progress-name">${tt("mrr")}</span><span class="ud-progress-val">€${mrr.toFixed(0)}</span></div></div>
      <div class="ud-progress-item"><div class="ud-progress-top"><span class="ud-progress-name">${tt("myPercent")}</span><span class="ud-progress-val">${Math.round(pct * 100)}%</span></div></div>
      <div class="ud-progress-item"><div class="ud-progress-top"><span class="ud-progress-name">${tt("expected")}</span><span class="ud-progress-val">€${expected.toFixed(0)}</span></div></div>
      <div class="ud-progress-item"><div class="ud-progress-top"><span class="ud-progress-name">${tt("paid")}</span><span class="ud-progress-val">€${paid.toFixed(0)}</span></div></div>
    `;
  }

  async function loadCoachIdentity(uid) {
    const box = document.getElementById("coach-context");
    if (!box || !uid) return;

    const snap = await db.collection("users").doc(uid).get();
    const d = snap.exists ? (snap.data() || {}) : {};
    coachUid = uid;
    coachName = d.displayName || `${d.firstName || ""} ${d.lastName || ""}`.trim() || d.email || uid;

    const code = (await ensureCoachInviteCode(uid).catch(() => "")) || d.inviteCode || "";
    coachInviteLink = code ? `https://proathletecare.com/j/${encodeURIComponent(code)}` : "";

    box.style.display = "block";
    box.innerHTML = `<div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;"><div><b>${tt("coachLabel")}: ${esc(coachName)}</b></div><div style="text-align:right;"><div class="muted">${tt("inviteCode")}: <b style="color:#d4af37;">${esc(code || tt("inviteNotSet"))}</b></div><button class="ud-btn ud-btn--ghost" id="coach-copy-invite" type="button" style="margin-top:6px;">${tt("copyInviteLink")}</button></div></div>`;
    document.getElementById("coach-copy-invite")?.addEventListener("click", copyInviteLink);
  }

  async function enrichAthletes() {
    const top = athletes.slice().sort((a, b) => Number(b.lastSeen || 0) - Number(a.lastSeen || 0)).slice(0, ENRICH_LIMIT);
    await Promise.all(top.map(async (a) => {
      const m = await fetchLatestMetrics(a.uid).catch(() => null);
      if (!m) return;
      if (Number.isFinite(m.readinessPct)) a.readinessPct = m.readinessPct;
      if (Number.isFinite(m.avg7)) a.avg7 = m.avg7;
      if (m.trend) a.trend = m.trend;
      if (m.riskLevel) a.riskLevel = m.riskLevel;
      if (Number.isFinite(m.wellnessAvg)) a.wellnessAvg = m.wellnessAvg;
      if (Number.isFinite(m.pain)) a.pain = m.pain;
      if (Number.isFinite(m.acwr)) a.acwr = m.acwr;
      if (Number.isFinite(m.cmj)) a.cmj = m.cmj;
      if (Number.isFinite(m.weight)) a.weight = m.weight;
      if (Number.isFinite(m.sleep)) a.sleep = m.sleep;
      if (Number.isFinite(m.stress)) a.stress = m.stress;
      if (Number.isFinite(m.soreness)) a.soreness = m.soreness;
      if (Number.isFinite(m.ready)) a.ready = m.ready;
    }));
  }

  async function loadCoachAthletes(uid) {
    const host = document.getElementById("athletes-table");
    if (!host || !uid) return;

    try {
      const snap = await db.collection("users").where("coachId", "==", uid).limit(200).get();
      athletes = snap.docs.map((d) => ({ uid: d.id, ...(d.data() || {}) }));
    } catch (e) {
      host.innerHTML = `<div class="ud-mini" style="margin-top:8px;color:#ff9a9a;">${tt("cannotLoadClients")}: ${esc(e?.message || e)}</div>`;
      return;
    }

    renderTop();
    renderAlertsAndActions();
    renderTable();
    await enrichAthletes();
    renderTop();
    renderAlertsAndActions();
    renderTable();
    await renderEarnings();
  }

  async function start(targetUid) {
    await loadCoachIdentity(targetUid);
    await loadCoachAthletes(targetUid);
  }

  firebase.auth().onAuthStateChanged(async (user) => {
    if (!user) return;

    const meRef = await db.collection("users").doc(user.uid).get();
    const me = meRef.exists ? (meRef.data() || {}) : {};
    const rawRole = String(me.role || "athlete").toLowerCase();
    const role = rawRole === "trainer" ? "coach" : rawRole;
    const isAdmin = role === "admin" || String(user.email || "").toLowerCase() === "kulyk015@gmail.com";
    const isCoach = role === "coach";

    const adminLink = document.querySelector('.sidebar a[href="../admin.html"]');
    if (adminLink) adminLink.style.display = isAdmin ? "" : "none";

    let targetUid = user.uid;
    if (asAdmin && isAdmin && targetCoachIdFromUrl) targetUid = targetCoachIdFromUrl;
    else if (!isCoach && !isAdmin) {
      alert(tt("accessDenied"));
      window.location.href = "./dashboard_user.html";
      return;
    }

    applyPageI18n();

    document.getElementById("btn-refresh")?.addEventListener("click", () => start(targetUid).catch(console.error));
    document.getElementById("coach-search-input")?.addEventListener("input", () => renderTable());
    document.getElementById("btn-open-current")?.addEventListener("click", () => {
      const weekId = mondayId();
      const p = coachWorkspaceParams();
      const base = `./coach-week-editor.html?weekId=${encodeURIComponent(weekId)}`;
      window.location.href = p ? `${base}&${p}` : base;
    });

    document.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-act]");
      if (!btn) return;
      const uid = btn.getAttribute("data-uid");
      const act = btn.getAttribute("data-act");
      const ctx = asAdmin ? "fromAdmin=1" : "fromCoach=1";
      if (!uid || !act) return;
      if (act === "apply") alert(tt("applied"));
      if (act === "edit") window.location.href = `weekly-individual.html?userId=${encodeURIComponent(uid)}&${ctx}`;
      if (act === "recovery") window.location.href = `injury.html?userId=${encodeURIComponent(uid)}&${ctx}`;
      if (act === "message") openComposeForAthlete(uid);
    });

    start(targetUid).catch(console.error);
  });

  window.addEventListener("pac:lang-changed", () => {
    applyPageI18n();
    renderTop();
    renderAlertsAndActions();
    renderTable();
    renderEarnings().catch(() => {});
  });
})();
