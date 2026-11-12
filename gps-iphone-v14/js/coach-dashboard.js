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

  const Data=window.PACCoachDashboardData;
  const Monitor=window.PACCoachMonitor;
  let monitorBusy=false;
  let clientsReadError=false;
  let monitorGeneration=0;
  let loadGeneration=0;
  const copy=(en,uk)=>getLang()==='uk'?uk:en;
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
      topReadiness: "Wellness readiness",
      topNextSession: "Fresh Wellness",
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
      topReadiness: "Готовність за Wellness",
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
    set('btn-create-drill',copy('Create drill','Створити вправу'));
    set("btn-open-current", tt("openWeek"));
    set("btn-date-plan", tt("datePlan"));
    set("coach-kicker-alerts", tt("kickerAlerts"));
    set("coach-kicker-decisions", tt("kickerDecisions"));
    set("coach-title-actions", tt("titleActions"));
    set("coach-kicker-team", tt("kickerTeam"));
    set("coach-kicker-earnings", tt("kickerEarnings"));
    set("coach-kicker-clients", tt("kickerClients"));
    set("coach-kicker-notes", tt("kickerNotes"));
    set("coach-activity-note", copy('Visits are separate from wellbeing and training completion. Registration is not a visit.', 'Візити показані окремо від здоров’я та виконання тренувань. Реєстрація не є візитом.'));

    const scope=document.getElementById('coach-client-scope');if(scope){const value=scope.value;scope.innerHTML=[['active',copy('Active · 7 days','Активні · 7 днів')],['all',copy('Users · all','Користувачі · усі')],['inactive',copy('Without recent visits','Без недавніх візитів')],['test',copy('Test','Тестові')]].map(([v,t])=>'<option value="'+v+'">'+t+'</option>').join('');scope.value=value;scope.setAttribute('aria-label',copy('Client account state','Стан акаунта клієнта'));}
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
    return Data.localDate(monday);
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
    document.getElementById('coach-details-modal')?.close();
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

  async function fetchLatestMetrics(uid){
    const cached=enrichCache.get(uid);if(cached&&Date.now()-cached.ts<ENRICH_CACHE_MS)return cached.data;
    const data=await Monitor.read(db,uid);data.readError=data.sourceErrors.length>0;
    if(!data.readError)enrichCache.set(uid,{ts:Date.now(),data});return data;
  }
  async function loadMonitorBatch(){
    if(monitorBusy)return;monitorBusy=true;const generation=monitorGeneration;
    const rows=athletes.filter(a=>Data.clientState(a)==='active'&&!a.monitor).slice(0,Monitor.LIMITS.batch);
    renderAlertsAndActions();
    try{for(let i=0;i<rows.length;i+=2){await Promise.all(rows.slice(i,i+2).map(async a=>{
      const data=await fetchLatestMetrics(a.uid);if(generation===monitorGeneration){Object.assign(a,data);a.monitor=data;}
    }));if(generation!==monitorGeneration)return;renderAlertsAndActions();renderTop();}}
    finally{if(generation===monitorGeneration){monitorBusy=false;renderAlertsAndActions();renderTop();}}
  }
  function openUsers(scope,filter){currentFilter=filter;document.getElementById('coach-client-scope').value=scope;renderTable();document.getElementById('coach-users-dialog').showModal();}
  function riskFrom(a){
    const pain=Data.num(a.pain),acwr=Data.num(a.acwr);
    if(pain==null&&acwr==null)return 'unknown';
    if(pain>=7||acwr>=1.5)return 'high';if(pain>=4||acwr>=1.3)return 'med';return 'low';
  }

  function filteredAthletes(){
    const q=String(document.getElementById('coach-search-input')?.value||'').trim().toLowerCase(),scope=document.getElementById('coach-client-scope')?.value||'active';
    return athletes.filter(a=>(scope==='all'||scope==='active'&&Data.recentlyActive(a)||scope==='inactive'&&!Data.recentlyActive(a)&&Data.clientState(a)!=='test'||scope==='test'&&Data.clientState(a)==='test')&&(currentFilter!=='active'||Data.recentlyActive(a,Date.now(),1))&&(!q||[a.displayName,a.firstName,a.lastName,a.email,a.uid].join(' ').toLowerCase().includes(q))).sort((a,b)=>Data.visitTime(b)-Data.visitTime(a));
  }
  function renderTable(){
    const host=document.getElementById('athletes-table');if(!host)return;
    const list=filteredAthletes(),ctx=asAdmin?'fromAdmin=1':'fromCoach=1';
    host.innerHTML=list.length?'<table class="monitor-table"><thead><tr><th>'+copy('Client','Клієнт')+'</th><th>'+copy('Activity','Активність')+'</th><th>'+copy('Last visit','Останній візит')+'</th><th>'+tt('tableActions')+'</th></tr></thead><tbody>'+list.map(a=>{
      const name=a.displayName||[a.firstName,a.lastName].filter(Boolean).join(' ')||a.email||a.uid,t=Data.visitTime(a),active=Data.recentlyActive(a);
      const label=Data.clientState(a)==='test'?copy('Test account','Тестовий акаунт'):Data.clientState(a)==='inactive'?copy('Account disabled','Акаунт неактивний'):active?copy('Visited within 7 days','Заходив за 7 днів'):t?copy('No recent visits','Давно не заходив'):copy('No confirmed visit','Візит не підтверджено');
      return '<tr><td><b>'+esc(name)+'</b><div class="ud-mini">'+esc(athleteMetaLine(a))+'</div></td><td data-label="'+copy('Activity','Активність')+'"><span class="coach-pill '+(active?'up':'flat')+'">'+label+'</span></td><td data-label="'+copy('Last visit','Останній візит')+'">'+esc(t?new Date(t).toLocaleString(getLang()):'—')+'</td><td><div class="coach-inline-actions"><button type="button" class="ud-btn ud-btn--ghost" data-act="details" data-uid="'+esc(a.uid)+'">'+copy('Details','Деталі')+'</button><a class="ud-btn" href="weekly-individual.html?userId='+encodeURIComponent(a.uid)+'&'+ctx+'">'+tt('adjust')+'</a></div></td></tr>';
    }).join('')+'</tbody></table>':'<div class="coach-empty"><b>'+copy('No clients here yet','Тут поки немає клієнтів')+'</b><p>'+copy('Other accounts are available under Users. Activity appears after a workspace visit.','Решта акаунтів доступні в «Користувачах». Активність з’явиться після відвідування кабінету.')+'</p></div>';
    document.getElementById('athletes-count').textContent=list.length+' / '+athletes.length+' '+tt('clientsCount')+(athletes.length===200?' · '+copy('First 200 accounts','Перші 200 акаунтів'):'');
  }
  function renderTop(){
    const active=athletes.filter(a=>Data.recentlyActive(a)),today=active.filter(a=>Data.recentlyActive(a,Date.now(),1)).length;
    document.getElementById('coach-summary-cards').innerHTML=[
      [copy('Active · 7 days','Активні · 7 днів'),active.length,'active','all'],[copy('Visited · 24 hours','Заходили · 24 години'),today,'active','active'],[copy('Users · all accounts','Користувачі · усі акаунти'),athletes.length,'all','all']
    ].map(([label,value,scope,filter])=>'<button type="button" class="ud-btn ud-btn--ghost coach-summary-button" data-scope="'+scope+'" data-filter="'+filter+'"><span>'+label+'</span><b>'+value+'</b></button>').join('');
    document.querySelectorAll('#coach-summary-cards [data-scope]').forEach(el=>el.onclick=()=>openUsers(el.dataset.scope,el.dataset.filter));
    const reviewed=athletes.filter(a=>a.monitor),known=reviewed.filter(a=>a.metricsAt);document.getElementById('coach-top-readiness').textContent=copy('Fresh Wellness','Свіжий Wellness')+': '+known.length+' / '+reviewed.length;
    document.getElementById('coach-top-next-session').textContent=copy('Reviewed clients','Переглянуто клієнтів')+': '+athletes.filter(a=>a.monitor).length+' / '+athletes.filter(a=>Data.clientState(a)==='active').length;
  }
  function renderAlertsAndActions(){
    const section=document.getElementById('coach-decisions-section');section.hidden=false;
    if(clientsReadError){document.getElementById('coach-alerts-title').textContent=copy('Could not load clients','Не вдалося завантажити клієнтів');document.getElementById('coach-alerts-list').innerHTML='<p role="alert">'+copy('Press Refresh to retry. Health status is unknown.','Натисни «Оновити», щоб повторити. Стан спортсменів невідомий.')+'</p>';document.getElementById('coach-quick-actions-list').textContent='—';return;}
    const clients=athletes.filter(a=>Data.clientState(a)==='active'),reviewed=clients.filter(a=>a.monitor),remaining=clients.length-reviewed.length;
    const ordered=reviewed.slice().sort((a,b)=>priority(b)-priority(a));
    function priority(a){return a.monitor.signals.some(s=>s.level==='priority')?3:a.monitor.signals.some(s=>s.level==='review')?2:1;}
    document.getElementById('coach-alerts-title').textContent=copy('Who needs attention','Кому потрібна увага');
    const host=document.getElementById('coach-alerts-list');
    host.innerHTML='<p class="ud-mini">'+copy('Review prompts from recorded data. These are not diagnoses or automatic programme changes.','Сигнали для перегляду за записами спортсмена. Не діагноз і не автоматична зміна програми.')+'</p>'+(ordered.length?ordered.map(a=>{
      const m=a.monitor,signals=m.signals,ctx=asAdmin?'fromAdmin=1':'fromCoach=1';
      return '<article class="coach-health-card"><div class="coach-health-heading"><b>'+esc(a.displayName||a.email||a.uid)+'</b><span class="coach-pill '+(signals.some(s=>s.level==='priority')?'down':'flat')+'">'+copy(signals.some(s=>s.level==='review'||s.level==='priority')?'Review needed':signals.some(s=>s.level==='unknown')?'Incomplete data':'No flags in reviewed data',signals.some(s=>s.level==='review'||s.level==='priority')?'Потрібен перегляд':signals.some(s=>s.level==='unknown')?'Неповні дані':'У переглянутих даних без сигналів')+'</span></div><div class="coach-health-metrics"><span>Wellness <b>'+(m.readinessPct==null?'—':m.readinessPct+'%')+'</b><small>'+esc(m.metricsAt?new Date(m.metricsAt).toLocaleString(getLang()):copy('No recent report','Немає свіжого звіту'))+'</small></span><span>'+copy('Recorded pain','Записаний біль')+' <b>'+(m.pain==null?'—':m.pain+' / 10')+'</b><small>'+esc(m.painAt?new Date(m.painAt).toLocaleDateString(getLang()):copy('No dated pain record','Немає датованого запису болю'))+'</small></span><span>'+copy('Execution','Виконання')+' <b>'+(m.completion?m.completion.done+' / '+m.completion.total:'—')+'</b><small>'+esc(m.completion?.date||copy('No completion report','Немає звіту про виконання'))+'</small></span></div>'+(signals.length?'<ul class="coach-signal-list">'+signals.map(s=>'<li class="is-'+s.level+'"><a href="'+s.page+'?userId='+encodeURIComponent(a.uid)+'&'+ctx+'">'+esc(copy(s.en,s.text))+'</a>'+(s.evidence?' <small>'+esc(s.evidence)+'</small>':'')+'</li>').join(''):'<p class="ud-mini">'+copy('No threshold flags in the available records. This does not confirm full health or plan completion.','У доступних записах немає порогових сигналів. Це не підтверджує повне здоров’я чи виконання всього плану.')+'</p>')+'<div class="coach-inline-actions"><button class="ud-btn ud-btn--ghost" type="button" data-act="details" data-uid="'+esc(a.uid)+'">'+copy('Latest data','Останні показники')+'</button><a class="ud-btn" href="weekly-individual.html?userId='+encodeURIComponent(a.uid)+'&'+ctx+'">'+copy('Review programme','Переглянути програму')+'</a></div></article>';
    }).join(''):'<p class="ud-mini" role="status">'+copy(monitorBusy?'Loading latest reports…':'No clients available for review.',monitorBusy?'Завантажую останні звіти…':'Немає клієнтів для огляду.')+'</p>');
    document.getElementById('coach-title-actions').textContent=copy('Review coverage','Охоплення огляду');
    document.getElementById('coach-quick-actions-list').innerHTML='<p><b>'+reviewed.length+' / '+clients.length+'</b> '+copy('clients reviewed','клієнтів переглянуто')+'</p><p class="ud-mini">'+copy('Account visits do not mean that training was completed. Missing reports remain unknown.','Відвідування не означає виконання тренування. Відсутні звіти залишаються невідомими.')+'</p><p class="ud-mini">'+copy('Latest Wellness: 48 hours. Execution and sessions: 7 days. GPS flags require a recorded plan and accepted GPS distance; local phone routes are not read.','Wellness: 48 годин. Виконання та заняття: 7 днів. GPS-сигнали потребують записаного плану й прийнятної GPS-дистанції; локальні маршрути телефона не читаються.')+'</p><details class="coach-thresholds"><summary>'+copy('Signal criteria','Критерії сигналів')+'</summary><p class="ud-mini">'+copy('Review thresholds: pain ≥4/10 (priority ≥7), readiness ≤40%, sleep ≤3/10, stress ≥8/10, soreness ≥7/10, RPE ≥8/10; GPS distance >120% of plan. These are review rules, not injury predictions.','Пороги огляду: біль ≥4/10 (пріоритет ≥7), готовність ≤40%, сон ≤3/10, стрес ≥8/10, крепатура ≥7/10, RPE ≥8/10; GPS-дистанція >120% плану. Це правила огляду, не прогноз травми.')+'</p></details>'+(remaining?'<button id="coach-monitor-more" type="button" class="ud-btn" '+(monitorBusy?'disabled':'')+'>'+copy(monitorBusy?'Loading…':'Review next '+Math.min(remaining,Monitor.LIMITS.batch),monitorBusy?'Завантаження…':'Переглянути ще '+Math.min(remaining,Monitor.LIMITS.batch))+'</button>':'');
    document.getElementById('coach-monitor-more')?.addEventListener('click',()=>loadMonitorBatch().catch(console.error));
  }

  async function renderEarnings(){
    const host=document.getElementById('coach-earnings-cards');host.innerHTML='<p class="ud-mini">'+copy('Payout details for the current month.','Деталі нарахувань за поточний місяць.')+'</p><button type="button" class="ud-btn ud-btn--ghost" id="coach-open-earnings">'+copy('View payouts','Переглянути нарахування')+'</button>';
    document.getElementById('coach-open-earnings').onclick=async()=>{
      const dialog=coachDialog(copy('Coach earnings','Нарахування тренера')),body=dialog.querySelector('[data-dialog-body]');body.textContent=copy('Loading…','Завантаження…');
      const date=new Date(),key=date.getFullYear()+'_'+String(date.getMonth()+1).padStart(2,'0');
      try{const snap=await db.collection('coach_payouts').doc(coachUid+'_'+key).get(),p=snap.exists?snap.data():null;
        if(!p||!Data.usable(p)){body.textContent=copy('No confirmed payout records for this month.','Підтверджених нарахувань за цей місяць немає.');return;}
        body.innerHTML=[[tt('mrr'),p.mrrBase,'€'],[tt('myPercent'),Data.num(p.commissionPct)==null?null:(p.commissionPct<=1?p.commissionPct*100:p.commissionPct),'%'],[tt('expected'),p.expectedPayout,'€'],[tt('paid'),p.paidAmount,'€']].map(([label,value,unit])=>'<p>'+label+': <b>'+(Data.num(value)==null?'—':esc(Number(value).toFixed(2))+' '+unit)+'</b></p>').join('');
      }catch(error){body.textContent=copy('Could not load payouts. Close and try again.','Не вдалося завантажити нарахування. Закрий і спробуй ще раз.');}
    };
  }

  function coachDialog(title){
    let dialog=document.getElementById('coach-details-modal');if(!dialog){dialog=document.createElement('dialog');dialog.id='coach-details-modal';dialog.className='coach-details-dialog';document.body.append(dialog);}
    if(dialog.open)dialog.close();dialog.setAttribute('aria-labelledby','coach-dialog-title');dialog.innerHTML='<header><h3 id="coach-dialog-title">'+esc(title)+'</h3><button type="button" aria-label="'+copy('Close','Закрити')+'">×</button></header><div data-dialog-body></div>';dialog.querySelector('button').onclick=()=>dialog.close();dialog.showModal();return dialog;
  }

  async function openAthleteDetails(uid){
    const a=athletes.find(row=>row.uid===uid);if(!a)return;const dialog=coachDialog(a.displayName||[a.firstName,a.lastName].filter(Boolean).join(' ')||a.email||uid),body=dialog.querySelector('[data-dialog-body]');body.textContent=copy('Loading…','Завантаження…');
    try{const data=await fetchLatestMetrics(uid);Object.assign(a,data);a.monitor=data;renderAlertsAndActions();renderTop();}catch(error){a.readError=true;}
    const metric=(label,value,unit='',at=0)=>'<div class="coach-detail-metric"><span>'+label+(at?'<small style="display:block;color:#aaa;margin-top:3px">'+esc(new Date(at).toLocaleDateString(getLang()))+'</small>':'')+'</span><b>'+(Data.num(value)==null?'—':esc(value)+' '+unit)+'</b></div>',ctx=asAdmin?'fromAdmin=1':'fromCoach=1';
    body.innerHTML='<p>'+copy('Account state','Стан акаунта')+': '+esc(Data.clientState(a)==='active'?copy('Active','Активний'):Data.clientState(a)==='test'?copy('Test account','Тестовий акаунт'):copy('Inactive','Неактивний'))+'</p><p>'+copy('Wellness is current for 48 hours. Missing data is not zero readiness.','Wellness актуальний протягом 48 годин. Відсутні дані не означають нульову готовність.')+'</p>'+(a.readError?'<p role="alert">'+copy('Some sources could not be loaded.','Частину джерел не вдалося завантажити.')+'</p>':'')+metric(tt('tableReadiness'),a.readinessPct,'%')+metric(copy('Recorded pain','Записаний біль'),a.pain,'/ 10')+metric(copy('Sleep','Сон'),a.sleep,'/ 10')+metric(copy('Stress','Стрес'),a.stress,'/ 10')+(a.monitor?.completion?metric(copy('Recorded exercise completion','Зафіксоване виконання вправ'),a.monitor.completion.done,'/ '+a.monitor.completion.total):'<p class="ud-mini">'+copy('No execution report in the reviewed seven days.','Немає звіту про виконання за переглянуті 7 днів.')+'</p>')+'<p>'+copy('Wellness date','Дата Wellness')+': '+esc(a.metricsAt?new Date(a.metricsAt).toLocaleDateString(getLang()):'—')+'</p><div class="coach-inline-actions"><a class="ud-btn" href="weekly-individual.html?userId='+encodeURIComponent(uid)+'&'+ctx+'">'+tt('adjust')+'</a><a class="ud-btn ud-btn--ghost" href="daily-individual.html?userId='+encodeURIComponent(uid)+'&'+ctx+'">Daily</a><a class="ud-btn ud-btn--ghost" href="load-season.html?userId='+encodeURIComponent(uid)+'&'+ctx+'">'+copy('Journal','Журнал')+'</a><a class="ud-btn ud-btn--ghost" href="profile.html?userId='+encodeURIComponent(uid)+'&'+ctx+'">'+copy('Athlete data','Дані атлета')+'</a><a class="ud-btn ud-btn--ghost" href="injury.html?userId='+encodeURIComponent(uid)+'&'+ctx+'">'+copy('Injury history','Історія травм')+'</a><button type="button" class="ud-btn ud-btn--ghost" data-act="message" data-uid="'+esc(uid)+'">'+tt('message')+'</button></div>';
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
    box.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap"><b>${tt('coachLabel')}: ${esc(coachName)}</b><button class="ud-btn ud-btn--ghost" id="coach-open-invite" type="button">${copy('Invite athlete','Запросити атлета')}</button><a class="ud-btn ud-btn--ghost" href="profile.html">${copy('My data','Мої дані')}</a></div>`;
    document.getElementById('coach-open-invite').onclick=()=>{const dialog=coachDialog(copy('Invite athlete','Запросити атлета'));dialog.querySelector('[data-dialog-body]').innerHTML='<p>'+tt('inviteCode')+': <b>'+esc(code||tt('inviteNotSet'))+'</b></p><button type="button" class="ud-btn" id="coach-copy-invite">'+tt('copyInviteLink')+'</button>';dialog.querySelector('#coach-copy-invite').onclick=copyInviteLink;};
  }

  async function loadCoachAthletes(uid){
    const host=document.getElementById('athletes-table');if(!host||!uid)return;const generation=++loadGeneration;monitorGeneration++;monitorBusy=false;clientsReadError=false;const button=document.getElementById('btn-refresh');button.disabled=true;enrichCache.clear();document.getElementById('coach-details-modal')?.close();host.innerHTML='<p role="status">'+copy('Loading clients…','Завантаження клієнтів…')+'</p>';
    try{const snap=await db.collection('users').where('coachId','==',uid).limit(200).get();if(generation!==loadGeneration)return;
      athletes=snap.docs.map(d=>{const raw=d.data()||{};return{...raw,...Data.emptyMetrics(),uid:d.id,lastSeen:safeMillis(raw.lastSeenAt||raw.lastSeen)};}).filter(a=>!a.role||['athlete','client','user'].includes(String(a.role).toLowerCase()));
      renderTop();renderAlertsAndActions();renderTable();await renderEarnings();await loadMonitorBatch();
    }catch(error){if(generation!==loadGeneration)return;athletes=[];clientsReadError=true;renderTop();renderAlertsAndActions();host.innerHTML='<p role="alert">'+tt('cannotLoadClients')+'. '+copy('Press Refresh to retry.','Натисни «Оновити», щоб повторити.')+'</p>';}
    finally{if(generation===loadGeneration)button.disabled=false;}
  }

  async function start(targetUid) {
    await loadCoachIdentity(targetUid);
    await loadCoachAthletes(targetUid);
  }

  firebase.auth().onAuthStateChanged(async (user) => {
    if (!user || !user.emailVerified) return;

    const meRef = await db.collection("users").doc(user.uid).get();
    const me = meRef.exists ? (meRef.data() || {}) : {};
    const rawRole = String(me.role || "athlete").toLowerCase();
    const role = rawRole === "trainer" ? "coach" : rawRole;
    const isAdmin = user.emailVerified === true && String(user.email || "").toLowerCase() === "kulyk015@gmail.com";
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
    document.getElementById('coach-users-close')?.addEventListener('click',()=>document.getElementById('coach-users-dialog').close());
    document.getElementById('coach-client-scope')?.addEventListener('change',()=>{currentFilter='all';renderTable();});
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
      if (act === "details") openAthleteDetails(uid).catch(console.error);
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
