/* Account data view. Editing uses the existing owner-only cabinet; this page performs no writes. */
(function(){
  'use strict';
  const db=window.db||firebase.firestore(),auth=firebase.auth(),D=window.PACCoachDashboardData;
  const $=id=>document.getElementById(id),uk=()=>String(localStorage.getItem('pac_lang')||document.documentElement.lang||'uk').slice(0,2)==='uk',t=(a,b)=>uk()?a:b;
  let generation=0;
  function rows(id,values){const host=$(id);host.replaceChildren();for(const [label,value]of values){const row=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=value==null||value===''?'—':Array.isArray(value)?value.join(', '):String(value);row.append(dt,dd);host.append(row);}}
  function date(value){const ms=typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)?Date.parse(value+'T12:00:00'):D.millis(value);return ms?new Date(ms).toLocaleDateString(uk()?'uk-UA':'en-GB'):'—';}
  function clear(){for(const id of ['profile-identity','profile-sport','profile-measurements','profile-training','profile-wellness'])$(id).replaceChildren();$('profile-title').textContent=t('Мої дані','My data');$('profile-subtitle').textContent='';$('profile-content').hidden=true;$('profile-edit').hidden=true;$('profile-access').hidden=true;$('profile-access').replaceChildren();}
  function status(text,error=false){$('profile-status').textContent=text;$('profile-status').setAttribute('role',error?'alert':'status');}
  function localize(){for(const [id,a,b]of [['profile-eyebrow','ОСОБИСТИЙ КАБІНЕТ','MY ACCOUNT'],['profile-refresh','Оновити','Refresh'],['profile-edit','Редагувати профіль','Edit profile'],['profile-identity-title','Дані акаунта','Account details'],['profile-sport-title','Спортивний профіль','Sport profile'],['profile-measurements-title','Останні вимірювання','Latest measurements'],['profile-training-title','Останнє заняття','Latest session'],['profile-wellness-title','Останній звіт Wellness','Latest Wellness report'],['profile-weight-link','Історія ваги','Weight history'],['profile-load-link','Відкрити журнал','Open journal'],['profile-wellness-link','Відкрити Wellness','Open Wellness']])$(id).textContent=t(a,b);document.title=t('Мої дані','My data')+' | ProAthleteCare';}
  function linked(href,scope){if(!scope.isDelegated)return href;const params=new URLSearchParams({userId:scope.effectiveUserId,[scope.isAdmin?'fromAdmin':'fromCoach']:'1'});return href+'?'+params;}
  async function load(user=auth.currentUser){
    const version=++generation;clear();localize();$('profile-refresh').disabled=true;
    const current=()=>version===generation&&auth.currentUser?.uid===user?.uid;
    try{
      if(!user||!user.emailVerified){status(t('Увійди та підтвердь email, щоб переглянути свої дані.','Sign in and verify your email to view your data.'),true);return;}
      status(t('Завантаження…','Loading…'));
      if(typeof window.pacResolveDelegatedContext!=='function')throw Error('ACCESS_CONTEXT_UNAVAILABLE');
      const scope=await window.pacResolveDelegatedContext(user,{db});if(!current())return;
      const requested=new URLSearchParams(location.search).get('userId');
      if(!scope.allowed||(requested&&requested!==scope.effectiveUserId)){status(t('Немає доступу до даних цього акаунта.','You do not have access to this account.'),true);return;}
      const uid=scope.effectiveUserId,snap=await db.collection('users').doc(uid).get();if(!current())return;
      if(!snap.exists){status(t('Профіль ще не заповнений. Заверши налаштування акаунта.','Profile not found. Complete account setup.'),true);return;}
      const p=snap.data()||{},summary=p.onboarding?.summary||{},owner=uid===user.uid&&!scope.isDelegated,athlete=scope.isDelegated||scope.role==='athlete';
      $('profile-title').textContent=[p.firstName,p.lastName].filter(Boolean).join(' ')||p.displayName||t('Профіль','Profile');
      $('profile-subtitle').textContent=owner?t('Особисті дані та останні збережені результати.','Personal details and latest saved results.'):t('Перегляд даних атлета. Редагування особистих даних недоступне.','Athlete data view. Personal details are read-only.');
      $('profile-edit').hidden=!owner;$('profile-athlete-data').hidden=!athlete;
      rows('profile-identity',[[t('Ім’я','Name'),[p.firstName,p.lastName].filter(Boolean).join(' ')||p.displayName],[t('Email','Email'),p.email||(owner?user.email:null)],[t('Телефон','Phone'),p.phone],[t('Країна','Country'),p.country],[t('Тип акаунта','Account type'),scope.isDelegated?t('Атлет','Athlete'):scope.role==='coach'?t('Тренер','Coach'):scope.role==='admin'?'Admin':t('Атлет','Athlete')],[t('Дата народження','Birth date'),p.birthdate?date(p.birthdate):null],[t('Оновлено','Updated'),p.updatedAt?date(p.updatedAt):null]]);
      rows('profile-sport',[[t('Спорт','Sport'),p.sportType||p.sport||summary.sport],[t('Позиція','Position'),p.playerPosition||p.position||summary.position],[t('Клуб / команда','Club / team'),p.club||p.clubName],[t('Фаза сезону','Season phase'),p.seasonPhase||summary.seasonPhase],[t('Рівень','Level'),p.competitionLevel],[t('Цілі','Goals'),p.goals?.length?p.goals:summary.goals],[t('Тренер','Coach'),p.coachName||p.coachDisplayName||(p.coachId?t('Призначений тренер','Assigned coach'):null)]]);
      for(const a of document.querySelectorAll('#main-sidebar a')){const href=a.getAttribute('href').split('?')[0];a.href=linked(href,scope);if(owner&&!athlete&&/daily-individual|weekly-individual|load-season/.test(href))a.hidden=true;else a.hidden=false;}
      $('profile-dashboard-link').href=owner&&!athlete?(scope.isAdmin?'../admin.html':'coach-dashboard.html'):linked('dashboard_user.html',scope);
      for(const [id,href]of [['profile-weight-link','weight-control.html'],['profile-load-link','load-season.html'],['profile-wellness-link','wellness.html']])$(id).href=linked(href,scope);
      $('profile-content').hidden=false;
      const access=window.pacEvaluatePlanAccess?.(p,Date.now());
      if(owner&&access&&!access.ok){const host=$('profile-access');host.hidden=false;const text=document.createElement('p');text.textContent=access.reason==='trial_expired'?t('Пробний період закінчився. Обери план для продовження тренувань.','Your trial has ended. Choose a plan to continue training.'):t('Активний план не обрано. Особисті дані й налаштування доступні.','No active plan selected. Your account details and settings remain available.');const link=document.createElement('a');link.href='../pricing.html';link.textContent=t('Обрати план','Choose a plan');host.append(text,link);}
      if(!athlete){status(t('Дані завантажені.','Data loaded.'));return;}
      const read=async collection=>(await db.collection(collection).where('userId','==',uid).get()).docs.map(d=>({id:d.id,data:d.data()}));
      const results=await Promise.allSettled([read('weight_history'),read('wellness_reports'),read('load_season_reports')]);if(!current())return;
      const records=i=>results[i].status==='fulfilled'?results[i].value:[],weight=D.latest(records(0).map(r=>r.data)),wellness=D.latest(records(1).map(r=>r.data)),sessions=window.PACSessionJournal.project(records(2)).rows,last=sessions.at(-1);
      const weightValue=D.num(weight?.weight??weight?.value??p.weight),height=D.num(p.height);
      rows('profile-measurements',[[t('Зріст','Height'),height==null?null:height+' cm'],[t('Вага','Weight'),weightValue==null?null:weightValue+' kg'],[t('Джерело ваги','Weight source'),weight?t('Історія ваги','Weight history'):p.weight!=null?t('Профіль','Profile'):null],[t('Дата вимірювання','Measurement date'),weight?date(D.sourceTime(weight)):null]]);
      rows('profile-training',[[t('Дата','Date'),last?date(last.date):null],[t('Тривалість','Duration'),last?.duration==null?null:last.duration+' '+t('хв','min')],['RPE',last?.rpe],[t('Дистанція','Distance'),last?.distance==null?null:last.distance+' km'],[t('Навантаження','Session load'),last?.sessionLoad==null?null:last.sessionLoad+' AU']]);
      rows('profile-wellness',[[t('Дата звіту','Report date'),wellness?date(D.sourceTime(wellness)):null],...['sleep','soreness','mood','water','stress','ready'].map((key,i)=>[[t('Сон','Sleep'),t('Біль / втома','Soreness'),t('Настрій','Mood'),t('Гідратація','Hydration'),t('Стрес','Stress'),t('Готовність','Readiness')][i],D.num(wellness?.scores?.[key]??wellness?.[key])==null?null:(wellness.scores?.[key]??wellness[key])+' / 10'])]);
      status(results.some(r=>r.status==='rejected')?t('Особисті дані завантажені. Частину результатів не вдалося прочитати — спробуй оновити.','Account details loaded. Some results could not be read; try Refresh.'):t('Показано останні збережені дані.','Showing latest saved data.'),results.some(r=>r.status==='rejected'));
    }catch(error){if(current()){clear();status(t('Не вдалося завантажити дані. Перевір з’єднання та натисни «Оновити».','Could not load data. Check your connection and press Refresh.'),true);}}
    finally{if(version===generation)$('profile-refresh').disabled=false;}
  }
  function init(){auth.onAuthStateChanged(user=>load(user));$('profile-refresh').onclick=()=>load();$('profile-edit').onclick=async()=>{if(window.pacDelegatedContext?.isDelegated)return;if(typeof window.openProfile==='function'){window.openProfile();await window.openCabSection?.('edit-profile');}};window.addEventListener('pac:lang-changed',()=>load());window.addEventListener('pac:profile-updated',e=>{if(e.detail?.userId===auth.currentUser?.uid)load();});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
