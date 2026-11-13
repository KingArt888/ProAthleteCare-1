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
  const Locale=window.PACCoachI18n;
  const copy=(en,uk,params)=>Locale.text(en,getLang(),params);
  let dialogState=null;
  let identityCode='';
  const ENRICH_CACHE_MS = 5 * 60 * 1000;
  const enrichCache = new Map();

  function getLang(){return Locale.normalize(localStorage.getItem('pac_lang')||'uk');}
  function tt(key){return Locale.key(key,getLang());}
  function dateLabel(value){return value?new Date(value+'T12:00:00').toLocaleDateString(getLang()):'—';}
  function signalEvidence(signal,m){
    if(signal.key==='recovery')return copy('Stress','Стрес')+' '+(m.stress??'—')+' / '+copy('Soreness','Крепатура')+' '+(m.soreness??'—');
    if(signal.key==='error')return m.sourceErrors.map(source=>copy(source,source)).join(', ');
    if(signal.evidence==='48 h')return '48 '+tt('hourShort');
    return String(signal.evidence||'').replace(/^\d{4}-\d{2}-\d{2}/,dateLabel);
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

    const scope=document.getElementById('coach-client-scope');if(scope){const value=scope.value;scope.innerHTML=[['active',copy('Active','Активний')],['inactive',copy('Inactive','Неактивний')],['test',copy('Test','Тестові')],['all',copy('Users · all','Користувачі · усі')]].map(([v,t])=>'<option value="'+v+'">'+t+'</option>').join('');scope.value=value;scope.setAttribute('aria-label',copy('Client account state','Стан акаунта клієнта'));}
    const search = document.getElementById("coach-search-input");
    if (search) search.placeholder = tt("searchPlaceholder");

    const notesBox = document.getElementById("coach-notes-box");
    if (notesBox) {
      notesBox.textContent = tt("notesEmpty");
    }

    set('coach-users-title',copy('Clients','Клієнти'));
    setLinkTextWithIcon('nav-drill-canvas',copy('Drill Canvas','Редактор вправ'));
    set('coach-footer','© 2026 ProAthleteCare. '+copy('All rights reserved.','Усі права захищено.'));
    document.getElementById('coach-users-close')?.setAttribute('aria-label',copy('Close','Закрити'));
    document.getElementById('coach-search-input')?.setAttribute('aria-label',copy('Search clients','Пошук клієнта'));
    document.getElementById('menu-toggle-button')?.setAttribute('aria-label',copy('Menu','Меню'));
    document.getElementById('langSelect')?.setAttribute('aria-label',copy('Language selector','Вибір мови'));
    document.getElementById('coach-decisions-section')?.setAttribute('aria-label',tt('kickerAlerts'));
    document.querySelector('section[aria-label="Coach summary"]')?.setAttribute('data-coach-summary','');
    document.querySelector('[data-coach-summary]')?.setAttribute('aria-label',tt('kickerTeam'));
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
    if (map[key]) return copy(map[key],map[key]);
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
    }));if(generation!==monitorGeneration)return;renderAlertsAndActions();renderTop();renderTable();}}
    finally{if(generation===monitorGeneration){monitorBusy=false;renderAlertsAndActions();renderTop();renderTable();}}
  }
  function riskFrom(a){
    if(a.pain!=null&&a.pain>=7)return 'high';
    if(a.monitor?.signals.some(signal=>signal.level==='review'||signal.level==='priority'))return 'med';
    return a.pain!=null&&a.metricsAt&&!a.readError?'low':'unknown';
  }
  function filteredAthletes(){
    const q=String(document.getElementById('coach-search-input')?.value||'').trim().toLowerCase();
    return athletes.filter(a=>(currentFilter!=='risk'||riskFrom(a)==='high')&&(currentFilter!=='active'||Data.recentlyActive(a,Date.now(),1))&&(!q||[a.displayName,a.firstName,a.lastName,a.email,a.uid].join(' ').toLowerCase().includes(q))).sort((a,b)=>Data.visitTime(b)-Data.visitTime(a));
  }
  function trendObj(a){
    if(a.trend==='up')return{text:copy('Up','Зростає'),cls:'up'};
    if(a.trend==='down')return{text:copy('Down','Знижується'),cls:'down'};
    return{text:a.trend==='flat'?copy('Stable','Без змін'):'—',cls:'flat'};
  }
  function wellnessMini(a){
    return '<div class="coach-wellness-mini">'+[['😴',a.sleep,copy('Sleep','Сон')],['🧠',a.stress,copy('Stress','Стрес')],['💪',a.soreness,copy('Soreness','Крепатура')],['⚡',a.ready,tt('tableReadiness')]].map(([icon,value,label])=>'<span title="'+esc(label)+'" aria-label="'+esc(label)+': '+(value??'—')+'"><span aria-hidden="true">'+icon+'</span><b>'+(value??'—')+'</b></span>').join('')+'</div>';
  }
  function riskBadge(a){const risk=riskFrom(a),label=risk==='high'?copy('High','Високий'):risk==='med'?copy('Moderate','Помірний'):risk==='low'?copy('Low','Низький'):'—';return '<span class="coach-review-badge is-'+risk+'" title="'+esc(copy('Recorded pain','Записаний біль'))+'">'+label+(a.pain!=null?' ('+a.pain+')':'')+'</span>';}
  function renderTable(){
    const host=document.getElementById('athletes-table');if(!host)return;const list=filteredAthletes(),ctx=asAdmin?'fromAdmin=1':'fromCoach=1';
    host.innerHTML='<table class="monitor-table"><thead><tr><th class="sticky-col">'+copy('Client','Клієнт')+'</th><th>'+tt('tableReadiness')+'</th><th>'+copy('Trend','Тренд')+'</th><th>'+copy('7-day average','Середнє за 7 днів')+'</th><th>'+copy('Wellness','Самопочуття')+'</th><th>'+copy('Risk','Ризик')+'</th><th>'+copy('Last activity','Остання активність')+'</th><th>'+tt('tableActions')+'</th></tr></thead><tbody>'+list.map(a=>{
      const name=a.displayName||[a.firstName,a.lastName].filter(Boolean).join(' ')||a.email||a.uid,tr=trendObj(a),ready=Data.num(a.readinessPct),visit=Data.visitTime(a);
      let photo='../assets/images/AK_logo.png';try{const url=new URL(a.photoURL||'',location.href);if(a.photoURL&&url.protocol==='https:')photo=url.href;}catch{}
      const base='userId='+encodeURIComponent(a.uid)+'&'+ctx;
      return '<tr><td class="sticky-col"><div class="coach-client-identity"><img src="'+esc(photo)+'" alt=""><div><b>'+esc(name)+'</b><small>'+esc(athleteMetaLine(a))+'</small><small>'+esc(a.email||a.uid)+'</small></div></div></td><td style="text-align:center"><b style="color:'+(ready==null?'#aaa':ready>=75?'#00ff88':ready>=55?'#FFC72C':'#ff7a7a')+'">'+(ready==null?'—':ready+'%')+'</b></td><td style="text-align:center"><span class="coach-pill '+tr.cls+'">'+tr.text+'</span></td><td style="text-align:center">'+(a.avg7==null?'—':a.avg7+'%')+'</td><td>'+wellnessMini(a)+'</td><td style="text-align:center">'+riskBadge(a)+'</td><td style="text-align:center;font-size:12px">'+esc(visit>0&&visit<=Date.now()+300000?getTimeSince(visit):'—')+'</td><td><div class="coach-inline-actions"><a class="ud-btn ud-btn--ghost" href="weekly-individual.html?'+base+'">'+tt('adjust')+'</a><a class="ud-btn ud-btn--ghost" href="load-season.html?'+base+'">'+copy('Journal','Журнал')+'</a><button class="ud-btn ud-btn--ghost" type="button" data-act="recovery" data-uid="'+esc(a.uid)+'">'+copy('Injury history','Історія травм')+'</button><button class="ud-btn ud-btn--ghost" type="button" data-act="message" data-uid="'+esc(a.uid)+'">'+tt('message')+'</button><button class="ud-btn ud-btn--ghost" type="button" data-act="details" data-uid="'+esc(a.uid)+'">'+copy('Details','Деталі')+'</button></div></td></tr>';
    }).join('')+'</tbody></table>';
    document.getElementById('athletes-count').textContent=athletes.length+' '+tt('clientsCount');
  }
  function renderTop(){
    const clients=athletes.filter(a=>Data.clientState(a)==='active'),known=clients.filter(a=>a.readinessPct!=null),reviewed=clients.filter(a=>a.monitor),today=clients.filter(a=>Data.recentlyActive(a,Date.now(),1)).length,high=reviewed.filter(a=>riskFrom(a)==='high').length;
    const ready=known.length?Math.round(known.reduce((sum,a)=>sum+a.readinessPct,0)/known.length):null;
    const activePct=clients.length?Math.round(today/clients.length*100):0;
    document.getElementById('coach-summary-cards').innerHTML=[
      [copy('Clients','Клієнти'),clients.length,'all',null],
      [copy('Active today','Активні сьогодні'),activePct+'%','active',activePct],
      [copy('Average readiness','Сер. готовність'),ready==null?'—':ready+'%','all',null],
      [copy('High','Високий')+' · '+copy('Risk','Ризик'),high,'risk',Math.min(100,high*20)]
    ].map(([label,value,filter,bar])=>'<button class="ud-progress-item coach-progress-filter" type="button" data-filter="'+filter+'"><span class="ud-progress-top"><span class="ud-progress-name">'+label+'</span><span class="ud-progress-val">'+value+'</span></span>'+(bar==null?'':'<span class="ud-progress-track"><span class="ud-progress-bar" style="display:block;width:'+bar+'%"></span></span>')+'</button>').join('');
    document.querySelectorAll('#coach-summary-cards [data-filter]').forEach(el=>el.onclick=()=>{currentFilter=el.dataset.filter;renderTable();});
    document.getElementById('coach-top-readiness').textContent=copy('Average readiness','Сер. готовність')+': '+(ready==null?'—':ready+'%');
    document.getElementById('coach-top-next-session').textContent=copy('Fresh Wellness','Свіжий Wellness')+': '+known.length+' / '+clients.length;
  }
  function alertItems(){return athletes.filter(a=>Data.clientState(a)==='active'&&a.monitor&&a.monitor.signals.length).sort((a,b)=>(riskFrom(b)==='high'?1:0)-(riskFrom(a)==='high'?1:0));}
  function shortReason(a){if(a.readError)return copy('Incomplete data','Неповні дані');if(a.pain>=4)return copy('Recorded pain','Записаний біль')+' '+a.pain+' / 10';if(a.readinessPct==null)return copy('No recent report','Немає свіжого звіту');return tt('tableReadiness')+': '+a.readinessPct+'%';}
  function renderAlertsAndActions(){
    document.getElementById('coach-decisions-section').hidden=false;document.getElementById('coach-quick-actions-list').closest('.ud-card').hidden=false;
    const host=document.getElementById('coach-alerts-list'),actions=document.getElementById('coach-quick-actions-list');
    const clients=athletes.filter(a=>Data.clientState(a)==='active'),reviewed=clients.filter(a=>a.monitor),remaining=clients.length-reviewed.length,items=alertItems();
    document.getElementById('coach-alerts-title').textContent=copy('Attention','Увага')+' ('+items.length+')';
    if(clientsReadError){host.innerHTML='<p role="alert">'+copy('Could not load clients','Не вдалося завантажити клієнтів')+'</p>';actions.textContent='—';return;}
    host.innerHTML=items.length?items.slice(0,4).map(a=>'<a class="coach-alert-item '+(riskFrom(a)==='high'?'is-high':'is-med')+'" href="'+(a.pain>=4?'injury.html':a.monitor.signals.find(signal=>signal.level==='priority'||signal.level==='review')?.page||'wellness.html')+'?userId='+encodeURIComponent(a.uid)+'&'+(asAdmin?'fromAdmin=1':'fromCoach=1')+'" style="text-decoration:none;color:inherit"><span><b>'+esc(a.displayName||a.email||a.uid)+'</b> → '+esc(shortReason(a))+'</span><span>'+copy('Open','Відкрити')+'</span></a>').join(''):'<div class="ud-mini">'+copy(monitorBusy?'Loading…':'No alerts in reviewed data',null)+'</div>';
    host.innerHTML+='<div class="coach-monitor-status">'+copy('Reviewed clients','Переглянуто клієнтів')+': '+reviewed.length+' / '+clients.length+'</div>'+(remaining?'<button id="coach-monitor-more" class="ud-btn ud-btn--ghost" type="button" '+(monitorBusy?'disabled':'')+'>'+copy(monitorBusy?'Loading…':'Review next {count}',null,{count:Math.min(remaining,Monitor.LIMITS.batch)})+'</button>':'');
    const actionRows=reviewed.slice().sort((a,b)=>(a.readinessPct??Infinity)-(b.readinessPct??Infinity)).slice(0,3);
    actions.innerHTML=actionRows.length?actionRows.map(a=>'<div class="coach-action-item"><span><b>'+esc(a.displayName||a.email||a.uid)+'</b> → '+esc(shortReason(a))+'</span><div class="coach-inline-actions"><button class="ud-btn ud-btn--ghost" type="button" data-act="details" data-uid="'+esc(a.uid)+'">'+copy('Open','Відкрити')+'</button><button class="ud-btn ud-btn--ghost" type="button" data-act="edit" data-uid="'+esc(a.uid)+'">'+tt('adjust')+'</button></div></div>').join(''):'<div class="ud-mini">'+copy('No actions available','Немає дій для перегляду')+'</div>';
    document.getElementById('coach-monitor-more')?.addEventListener('click',()=>loadMonitorBatch().catch(console.error));
  }

  let payoutView={loading:true,data:null,error:false};
  async function loadPayout(){payoutView={loading:true,data:null,error:false};renderEarnings();const date=new Date(),key=date.getFullYear()+'_'+String(date.getMonth()+1).padStart(2,'0');try{const snap=await db.collection('coach_payouts').doc(coachUid+'_'+key).get();payoutView={loading:false,data:snap.exists?snap.data():null,error:false};}catch{payoutView={loading:false,data:null,error:true};}renderEarnings();}
  function renderEarnings(){
    const p=payoutView.data&&Data.usable(payoutView.data)?payoutView.data:null;
    document.getElementById('coach-earnings-cards').innerHTML=[[tt('mrr'),p?.mrrBase,'€'],[tt('myPercent'),p?.commissionPct==null?null:p.commissionPct<=1?p.commissionPct*100:p.commissionPct,'%'],[tt('expected'),p?.expectedPayout,'€'],[tt('paid'),p?.paidAmount,'€']].map(([label,value,unit])=>'<div class="ud-progress-item"><div class="ud-progress-top"><span class="ud-progress-name">'+label+'</span><span class="ud-progress-val">'+(Data.num(value)==null?'—':esc(Number(value).toLocaleString(getLang(),{maximumFractionDigits:2}))+' '+unit)+'</span></div></div>').join('');
  }

  function coachDialog(title){
    let dialog=document.getElementById('coach-details-modal');if(!dialog){dialog=document.createElement('dialog');dialog.id='coach-details-modal';dialog.className='coach-details-dialog';document.body.append(dialog);}
    if(dialog.open)dialog.close();dialog.setAttribute('aria-labelledby','coach-dialog-title');dialog.innerHTML='<header><h3 id="coach-dialog-title">'+esc(title)+'</h3><button type="button" aria-label="'+copy('Close','Закрити')+'">×</button></header><div data-dialog-body></div>';dialog.querySelector('button').onclick=()=>dialog.close();dialog.showModal();return dialog;
  }

  async function openAthleteDetails(uid,renderOnly=false){
    dialogState={type:'details',uid};
    const a=athletes.find(row=>row.uid===uid);if(!a)return;const dialog=coachDialog(a.displayName||[a.firstName,a.lastName].filter(Boolean).join(' ')||a.email||uid),body=dialog.querySelector('[data-dialog-body]');body.textContent=copy('Loading…','Завантаження…');
    if(!renderOnly){try{const data=await fetchLatestMetrics(uid);Object.assign(a,data);a.monitor=data;renderAlertsAndActions();renderTop();renderTable();}catch(error){a.readError=true;}}
    const metric=(label,value,unit='',at=0)=>'<div class="coach-detail-metric"><span>'+label+(at?'<small style="display:block;color:#aaa;margin-top:3px">'+esc(new Date(at).toLocaleDateString(getLang()))+'</small>':'')+'</span><b>'+(Data.num(value)==null?'—':esc(value)+' '+unit)+'</b></div>',ctx=asAdmin?'fromAdmin=1':'fromCoach=1';
    body.innerHTML='<p>'+copy('Account state','Стан акаунта')+': '+esc(Data.clientState(a)==='active'?copy('Active','Активний'):Data.clientState(a)==='test'?copy('Test account','Тестовий акаунт'):copy('Inactive','Неактивний'))+'</p><p>'+copy('Wellness is current for 48 hours. Missing data is not zero readiness.','Wellness актуальний протягом 48 годин. Відсутні дані не означають нульову готовність.')+'</p>'+(a.readError?'<p role="alert">'+copy('Some sources could not be loaded.','Частину джерел не вдалося завантажити.')+'</p>':'')+metric(tt('tableReadiness'),a.readinessPct,'%')+metric(copy('Recorded pain','Записаний біль'),a.pain,'/ 10')+metric(copy('Sleep','Сон'),a.sleep,'/ 10')+metric(copy('Stress','Стрес'),a.stress,'/ 10')+(a.monitor?.completion?metric(copy('Recorded exercise completion','Зафіксоване виконання вправ'),a.monitor.completion.done,'/ '+a.monitor.completion.total):'<p class="ud-mini">'+copy('No execution report in the reviewed seven days.','Немає звіту про виконання за переглянуті 7 днів.')+'</p>')+'<p>'+copy('Wellness date','Дата Wellness')+': '+esc(a.metricsAt?new Date(a.metricsAt).toLocaleDateString(getLang()):'—')+'</p><div class="coach-inline-actions"><a class="ud-btn" href="weekly-individual.html?userId='+encodeURIComponent(uid)+'&'+ctx+'">'+tt('adjust')+'</a><a class="ud-btn ud-btn--ghost" href="daily-individual.html?userId='+encodeURIComponent(uid)+'&'+ctx+'">'+copy('Daily plan','План на день')+'</a><a class="ud-btn ud-btn--ghost" href="load-season.html?userId='+encodeURIComponent(uid)+'&'+ctx+'">'+copy('Journal','Журнал')+'</a><a class="ud-btn ud-btn--ghost" href="profile.html?userId='+encodeURIComponent(uid)+'&'+ctx+'">'+copy('Athlete data','Дані атлета')+'</a><a class="ud-btn ud-btn--ghost" href="injury.html?userId='+encodeURIComponent(uid)+'&'+ctx+'">'+copy('Injury history','Історія травм')+'</a><button type="button" class="ud-btn ud-btn--ghost" data-act="message" data-uid="'+esc(uid)+'">'+tt('message')+'</button></div>';
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

    identityCode=code;
    renderCoachIdentity();
  }
  function openInviteDialog(){
    dialogState={type:'invite'};const dialog=coachDialog(copy('Invite athlete','Запросити атлета'));
    dialog.querySelector('[data-dialog-body]').innerHTML='<p>'+tt('inviteCode')+': <b>'+esc(identityCode||tt('inviteNotSet'))+'</b></p><button type="button" class="ud-btn" id="coach-copy-invite">'+tt('copyInviteLink')+'</button>';
    dialog.querySelector('#coach-copy-invite').onclick=copyInviteLink;
  }
  function renderCoachIdentity(){
    const box=document.getElementById('coach-context');if(!box||!coachUid)return;box.style.display='block';
    box.innerHTML='<div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap"><div><b>'+tt('coachLabel')+': '+esc(coachName)+'</b></div><div style="text-align:right"><div>'+tt('inviteCode')+': <b style="color:#d4af37">'+esc(identityCode||tt('inviteNotSet'))+'</b></div><button class="ud-btn ud-btn--ghost" id="coach-copy-invite" type="button" style="margin-top:6px">'+tt('copyInviteLink')+'</button></div></div>';
    document.getElementById('coach-copy-invite').onclick=copyInviteLink;
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
    await loadPayout();
    await loadCoachAthletes(targetUid);
  }

  // Apply the saved language before waiting for authentication/network reads.
  applyPageI18n();
  document.getElementById('coach-top-readiness').textContent=copy('Fresh Wellness','Свіжий Wellness')+': —';
  document.getElementById('coach-top-next-session').textContent=copy('Reviewed clients','Переглянуто клієнтів')+': —';

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
    renderEarnings();
    renderCoachIdentity();
    if(document.getElementById('coach-details-modal')?.open&&dialogState){
      if(dialogState.type==='details')openAthleteDetails(dialogState.uid,true).catch(console.error);
      else if(dialogState.type==='invite')openInviteDialog();
    }
  });
})();
