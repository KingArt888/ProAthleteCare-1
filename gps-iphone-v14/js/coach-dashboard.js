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

    const scope=document.getElementById('coach-client-scope');if(scope){const value=scope.value;scope.innerHTML=[['active',copy('Active','Активні')],['inactive',copy('Inactive','Неактивні')],['test',copy('Test','Тестові')],['all',copy('All','Усі')]].map(([v,t])=>'<option value="'+v+'">'+t+'</option>').join('');scope.value=value;scope.setAttribute('aria-label',copy('Client account state','Стан акаунта клієнта'));}
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

  async function fetchPower(uid){
    const snap=await db.collection('power_tests').doc(uid).collection('tests').get();
    return snap.docs.map(d=>d.data());
  }

  async function fetchLatestMetrics(uid){
    const cached=enrichCache.get(uid);if(cached&&Date.now()-cached.ts<ENRICH_CACHE_MS)return cached.data;
    // Canonical athlete_reports and user-profile percentages may be old test aggregates.
    // Current display is built from active source records, never those cached percentages.
    const read=async col=>{const snap=await db.collection(col).where('userId','==',uid).get();return snap.docs.map(d=>d.data());};
    const results=await Promise.allSettled([read('wellness_reports'),read('injuries'),read('weight_history'),fetchPower(uid)]);
    const rows=i=>results[i].status==='fulfilled'?results[i].value:[];
    const data={...Data.metrics({wellness:rows(0),injuries:rows(1),weights:rows(2),power:rows(3)}),readError:results.some(r=>r.status==='rejected')};
    if(!data.readError)enrichCache.set(uid,{ts:Date.now(),data});return data;
  }

  function riskFrom(a){
    const pain=Data.num(a.pain),acwr=Data.num(a.acwr);
    if(pain==null&&acwr==null)return 'unknown';
    if(pain>=7||acwr>=1.5)return 'high';if(pain>=4||acwr>=1.3)return 'med';return 'low';
  }

  function filteredAthletes(){
    const q=String(document.getElementById('coach-search-input')?.value||'').trim().toLowerCase(),scope=document.getElementById('coach-client-scope')?.value||'active';
    return athletes.filter(a=>(scope==='all'||Data.clientState(a)===scope)&&(currentFilter!=='risk'||riskFrom(a)==='high')&&(currentFilter!=='active'||a.lastSeen>Date.now()-86400000&&a.lastSeen<=Date.now()+300000)&&(!q||[a.displayName,a.firstName,a.lastName,a.email,a.uid].join(' ').toLowerCase().includes(q))).sort((a,b)=>(b.lastSeen||0)-(a.lastSeen||0));
  }

  function renderTable(){
    const host=document.getElementById('athletes-table');if(!host)return;
    const list=filteredAthletes(),ctx=asAdmin?'fromAdmin=1':'fromCoach=1';
    host.innerHTML=list.length?'<table class="monitor-table"><thead><tr><th>'+tt('tableClient')+'</th><th>'+tt('tableReadiness')+'</th><th>'+copy('Latest Wellness','Останній Wellness')+'</th><th>'+tt('tableActions')+'</th></tr></thead><tbody>'+list.map(a=>{
      const name=a.displayName||[a.firstName,a.lastName].filter(Boolean).join(' ')||a.email||a.uid,state=Data.clientState(a),ready=Data.num(a.readinessPct);
      return '<tr><td><b>'+esc(name)+'</b><div class="ud-mini">'+esc(athleteMetaLine(a))+'</div>'+(state!=='active'?'<span class="coach-pill flat">'+(state==='test'?copy('Test account','Тестовий акаунт'):copy('Inactive','Неактивний'))+'</span>':'')+'</td><td data-label="'+esc(tt('tableReadiness'))+'">'+(ready==null?'—':ready+'%')+'</td><td data-label="'+copy('Latest Wellness','Останній Wellness')+'">'+esc(a.metricsAt?new Date(a.metricsAt).toLocaleDateString(getLang()):copy('No fresh data','Немає свіжих даних'))+'</td><td><div class="coach-inline-actions"><button type="button" class="ud-btn ud-btn--ghost" data-act="details" data-uid="'+esc(a.uid)+'">'+copy('Details','Деталі')+'</button><a class="ud-btn" href="weekly-individual.html?userId='+encodeURIComponent(a.uid)+'&'+ctx+'">'+tt('adjust')+'</a></div></td></tr>';
    }).join('')+'</tbody></table>':'<p class="ud-mini">'+copy('No clients match this filter.','За цим фільтром клієнтів немає.')+'</p>';
    document.getElementById('athletes-count').textContent=list.length+' / '+athletes.length+' '+tt('clientsCount');
  }

  function renderTop(){
    const s=Data.summary(athletes),active=athletes.filter(a=>Data.clientState(a)==='active'),today=active.filter(a=>a.lastSeen>Date.now()-86400000&&a.lastSeen<=Date.now()+300000).length,high=active.filter(a=>riskFrom(a)==='high').length;
    document.getElementById('coach-summary-cards').innerHTML='<p class="ud-mini">'+copy('Active clients only. Test/inactive accounts are excluded.','Лише активні клієнти. Тестові й неактивні не враховуються.')+'</p>'+[
      [copy('Active clients','Активні клієнти'),s.active,'all'],[tt('summaryActiveToday'),today+' / '+s.active,'active'],[tt('summaryAvgReadiness'),s.readiness==null?'—':s.readiness+'%','all'],[copy('Needs attention','Потребують уваги'),high,'risk']
    ].map(([label,value,filter])=>'<button type="button" class="ud-btn ud-btn--ghost coach-summary-button" data-filter="'+filter+'"><span>'+label+'</span><b>'+value+'</b></button>').join('');
    document.querySelectorAll('#coach-summary-cards [data-filter]').forEach(el=>el.onclick=()=>{currentFilter=el.dataset.filter;document.getElementById('coach-client-scope').value='active';renderTable();});
    document.getElementById('coach-top-readiness').textContent=tt('topReadiness')+': '+(s.readiness==null?'—':s.readiness+'%');
    document.getElementById('coach-top-next-session').textContent=copy('Fresh Wellness','Свіжий Wellness')+': '+s.known+' / '+s.active;
  }

  function renderAlertsAndActions(){
    const active=athletes.filter(a=>Data.clientState(a)==='active'),items=active.map(a=>({a,risk:riskFrom(a)})).filter(x=>x.risk==='high'||x.risk==='med'||Data.num(x.a.readinessPct)==null).sort((x,y)=>(y.risk==='high')-(x.risk==='high'));
    document.getElementById('coach-alerts-title').textContent=tt('attention')+' ('+items.length+')';
    const host=document.getElementById('coach-alerts-list');
    host.innerHTML=items.length?'<p class="ud-mini">'+copy('Review missing reports and recorded pain before changing a plan.','Переглянь відсутні звіти та записи болю перед зміною плану.')+'</p><button class="ud-btn" type="button" id="coach-open-alerts">'+copy('Review clients','Переглянути клієнтів')+' · '+items.length+'</button>':'<p class="ud-mini">'+tt('noAlerts')+'</p>';
    document.getElementById('coach-open-alerts')?.addEventListener('click',()=>{
      const dialog=coachDialog(tt('attention'));dialog.querySelector('[data-dialog-body]').innerHTML=items.map(({a,risk})=>'<button type="button" class="coach-alert-item '+(risk==='high'?'is-high':'is-med')+'" data-act="details" data-uid="'+esc(a.uid)+'"><b>'+esc(a.displayName||[a.firstName,a.lastName].filter(Boolean).join(' ')||a.email||a.uid)+'</b><span>'+copy(risk==='high'||risk==='med'?'Review recorded pain/load':'No fresh Wellness',risk==='high'||risk==='med'?'Переглянути записи болю / навантаження':'Немає свіжого Wellness')+'</span></button>').join('');
    });
    document.getElementById('coach-quick-actions-list').closest('.ud-card').hidden=true;
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
    try{Object.assign(a,await fetchLatestMetrics(uid));}catch(error){a.readError=true;}
    const metric=(label,value,unit='',at=0)=>'<div class="coach-detail-metric"><span>'+label+(at?'<small style="display:block;color:#aaa;margin-top:3px">'+esc(new Date(at).toLocaleDateString(getLang()))+'</small>':'')+'</span><b>'+(Data.num(value)==null?'—':esc(value)+' '+unit)+'</b></div>',ctx=asAdmin?'fromAdmin=1':'fromCoach=1';
    body.innerHTML='<p>'+copy('Account state','Стан акаунта')+': '+esc(Data.clientState(a)==='active'?copy('Active','Активний'):Data.clientState(a)==='test'?copy('Test account','Тестовий акаунт'):copy('Inactive','Неактивний'))+'</p><p>'+copy('Wellness is current for 48 hours. Missing data is not zero readiness.','Wellness актуальний протягом 48 годин. Відсутні дані не означають нульову готовність.')+'</p>'+(a.readError?'<p role="alert">'+copy('Some sources could not be loaded.','Частину джерел не вдалося завантажити.')+'</p>':'')+metric(tt('tableReadiness'),a.readinessPct,'%')+metric(copy('Recorded pain','Записаний біль'),a.pain,'/ 10')+metric(copy('Sleep','Сон'),a.sleep,'/ 10')+metric(copy('Stress','Стрес'),a.stress,'/ 10')+metric(copy('Last recorded weight','Остання записана вага'),a.weight,'kg',a.weightAt)+metric('CMJ',a.cmj,'cm',a.cmjAt)+'<p>'+copy('Wellness date','Дата Wellness')+': '+esc(a.metricsAt?new Date(a.metricsAt).toLocaleDateString(getLang()):'—')+'</p><div class="coach-inline-actions"><a class="ud-btn" href="weekly-individual.html?userId='+encodeURIComponent(uid)+'&'+ctx+'">'+tt('adjust')+'</a><a class="ud-btn ud-btn--ghost" href="daily-individual.html?userId='+encodeURIComponent(uid)+'&'+ctx+'">Daily</a><a class="ud-btn ud-btn--ghost" href="load-season.html?userId='+encodeURIComponent(uid)+'&'+ctx+'">'+copy('Journal','Журнал')+'</a><a class="ud-btn ud-btn--ghost" href="injury.html?userId='+encodeURIComponent(uid)+'&'+ctx+'">'+copy('Injury history','Історія травм')+'</a><button type="button" class="ud-btn ud-btn--ghost" data-act="message" data-uid="'+esc(uid)+'">'+tt('message')+'</button></div>';
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
    box.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap"><b>${tt('coachLabel')}: ${esc(coachName)}</b><button class="ud-btn ud-btn--ghost" id="coach-open-invite" type="button">${copy('Invite athlete','Запросити атлета')}</button></div>`;
    document.getElementById('coach-open-invite').onclick=()=>{const dialog=coachDialog(copy('Invite athlete','Запросити атлета'));dialog.querySelector('[data-dialog-body]').innerHTML='<p>'+tt('inviteCode')+': <b>'+esc(code||tt('inviteNotSet'))+'</b></p><button type="button" class="ud-btn" id="coach-copy-invite">'+tt('copyInviteLink')+'</button>';dialog.querySelector('#coach-copy-invite').onclick=copyInviteLink;};
  }

  async function enrichAthletes(){
    const rows=athletes.filter(a=>Data.clientState(a)==='active');
    for(let start=0;start<rows.length;start+=4)await Promise.all(rows.slice(start,start+4).map(async a=>{try{Object.assign(a,await fetchLatestMetrics(a.uid));}catch(error){a.readError=true;}}));
  }

  async function loadCoachAthletes(uid){
    const host=document.getElementById('athletes-table');if(!host||!uid)return;const generation=++loadGeneration,button=document.getElementById('btn-refresh');button.disabled=true;enrichCache.clear();document.getElementById('coach-details-modal')?.close();host.innerHTML='<p role="status">'+copy('Loading clients…','Завантаження клієнтів…')+'</p>';
    try{const snap=await db.collection('users').where('coachId','==',uid).limit(200).get();if(generation!==loadGeneration)return;
      athletes=snap.docs.map(d=>{const raw=d.data()||{};return{...raw,...Data.emptyMetrics(),uid:d.id,lastSeen:safeMillis(raw.lastSeenAt||raw.lastSeen)};}).filter(a=>!a.role||['athlete','client','user'].includes(String(a.role).toLowerCase()));
      renderTop();renderAlertsAndActions();renderTable();await enrichAthletes();if(generation!==loadGeneration)return;renderTop();renderAlertsAndActions();renderTable();await renderEarnings();
    }catch(error){if(generation!==loadGeneration)return;athletes=[];renderTop();renderAlertsAndActions();host.innerHTML='<p role="alert">'+tt('cannotLoadClients')+'. '+copy('Press Refresh to retry.','Натисни «Оновити», щоб повторити.')+'</p>';}
    finally{if(generation===loadGeneration)button.disabled=false;}
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
