(function(root){
 'use strict';
 const D=typeof module==='object'&&module.exports?require('./coach-dashboard-data.js'):root.PACCoachDashboardData;
 const LIMITS={wellness:8,injuries:24,sessions:14,batch:8};
 function days(now,count){return Array.from({length:count},(_,i)=>{const d=new Date(now);d.setDate(d.getDate()-i);return D.localDate(d);});}
 function progressPath(uid,date){const d=new Date(date+'T12:00:00'),day=(d.getDay()+6)%7;d.setDate(d.getDate()-day);return uid+'_'+D.localDate(d)+'_'+day;}
 function assess(input={},now=Date.now()){
  const m=D.metrics(input,now),signals=[],add=(key,level,text,en,page,evidence)=>signals.push({key,level,text,en,page,evidence});
  // Historical table columns use observed daily readings, never profile aggregates.
  const daily=new Map();
  for(const row of input.wellness||[]){const ready=D.num(row.scores?.ready??row.ready);if(!D.usable(row)||ready==null||ready<1||ready>10||!days(now,7).includes(row.date)||D.sourceTime(row)>now+300000)continue;const previous=daily.get(row.date);if(!previous||D.sourceTime(row)>D.sourceTime(previous))daily.set(row.date,row);}
  const readings=days(now,7).map(date=>daily.get(date));
  if(readings.every(Boolean))m.avg7=Math.round(readings.reduce((sum,row)=>sum+Number(row.scores?.ready??row.ready)*10,0)/7);
  if(readings[0]&&readings[1]){const difference=Number(readings[0].scores?.ready??readings[0].ready)-Number(readings[1].scores?.ready??readings[1].ready);m.trend=difference>0?'up':difference<0?'down':'flat';}
  if(m.pain>=4)add('pain',m.pain>=7?'priority':'review','Переглянути біль та адаптацію програми','Review pain and programme adaptation','injury.html',m.pain+' / 10');
  if(m.readinessPct!=null&&m.readinessPct<=40)add('readiness','review','Уточнити самопочуття перед наступним заняттям','Check wellbeing before the next session','wellness.html',m.readinessPct+'%');
  if(m.sleep!=null&&m.sleep<=3)add('sleep','review','Обговорити сон і відновлення','Discuss sleep and recovery','wellness.html',m.sleep+' / 10');
  if(m.stress>=8||m.soreness>=7)add('recovery','review','Перевірити потребу у відновленні','Review recovery needs','wellness.html','stress '+(m.stress??'—')+' / soreness '+(m.soreness??'—'));
  const progressDates=new Set(days(now,7));
  const progresses=(input.progress||[]).filter(d=>D.usable(d)&&progressDates.has(d.dateId)).sort((a,b)=>b.dateId.localeCompare(a.dateId));
  const p=progresses[0],done=p?D.num(p.doneCount):null,total=p?D.num(p.totalExercises):null;
  const executions=p?Object.values(p.executionSummary||{}).filter(x=>x&&x.mode!=='test3'):[];
  if(executions.some(x=>x.goalMet===false))add('execution','review','Розібрати виконання: записано недосягнуту ціль','Review execution: recorded goal not met','daily-individual.html',p.dateId);
  const sessions=(input.sessions||[]).filter(d=>D.usable(d)&&(d.status==='completed'||d.status==null)&&D.fresh(d,now,7*24)).sort((a,b)=>D.sourceTime(b)-D.sourceTime(a));
  const latest=sessions[0]||null;
  for(const s of sessions){
   const actual=s.actual||{};
   const valid=v=>v&&v.quality?.status!=='rejected'&&D.num(v.value)!=null&&D.num(v.value)>=0;
   const rpe=actual.rpe||(s.schemaVersion==null||s.schemaVersion===1?{value:D.num(s.rpe)}:null);
   if(valid(rpe)&&rpe.value>=8&&rpe.value<=10){add('effort','review','Переглянути заняття з високим суб’єктивним зусиллям','Review session with high perceived effort','load-season.html',s.date+' · RPE '+rpe.value+' / 10');break;}
  }
  for(const s of sessions){
   const a=s.actual?.distance,p=s.planned?.distance;
   const gps=a?.source==='measured'&&['browser-geolocation','gps'].includes(a.provider);
   const planned=p&&['manual','measured','imported','estimated'].includes(p.source)&&p.quality?.status!=='rejected';
   if(gps&&a.quality?.status==='ok'&&planned&&a.unit==='km'&&p.unit==='km'&&D.num(a.value)>0&&D.num(p.value)>0&&a.value>p.value*1.2){add('gps','review','Перевірити GPS-дистанцію проти призначеного плану','Review GPS distance against the prescribed plan','load-season.html',s.date+' · '+Math.round(a.value/p.value*100)+'%');break;}
  }
  const errors=input.errors||[];
  if(errors.length)add('error','unknown','Частину даних не вдалося прочитати','Some sources could not be read','profile.html',errors.join(', '));
  if(!m.metricsAt)add('missing','unknown','Уточнити самопочуття: немає свіжого Wellness','Check wellbeing: no recent Wellness','wellness.html','48 h');
  if((input.injuries||[]).length>=LIMITS.injuries||(input.sessions||[]).length>=LIMITS.sessions||(input.wellness||[]).length>=LIMITS.wellness)add('coverage','unknown','Досягнуто ліміт огляду — відкрити історію','Review limit reached — open history','injury.html','');
  return {...m,signals,completion:total>0&&done!=null&&done>=0&&done<=total?{done,total,date:p.dateId}:null,lastSession:latest?{date:latest.date,status:latest.status}:null,loadedAt:now,sourceErrors:errors};
 }
 async function read(db,uid,now=Date.now()){
  const dates=days(now,7),sources=[
   ['wellness',()=>db.collection('wellness_reports').where('userId','==',uid).where('date','>=',dates[6]).orderBy('date','desc').limit(LIMITS.wellness).get()],
   ['injuries',()=>db.collection('injuries').where('userId','==',uid).orderBy('date','desc').limit(LIMITS.injuries).get()],
   ['sessions',()=>db.collection('load_season_reports').where('userId','==',uid).where('date','>=',dates[6]).orderBy('date','desc').limit(LIMITS.sessions).get()]
  ];
  const input={errors:[],progress:[]};
  await Promise.all(sources.map(async([key,load])=>{try{const snap=await load();input[key]=snap.docs.map(d=>d.data());}catch(e){input[key]=[];input.errors.push(key);}}));
  const progress=await Promise.allSettled(dates.map(date=>db.collection('athlete_daily_progress').doc(progressPath(uid,date)).get()));
  progress.forEach(r=>{if(r.status==='fulfilled'&&r.value.exists)input.progress.push(r.value.data());});
  if(progress.some(r=>r.status==='rejected'))input.errors.push('progress');
  return assess(input,now);
 }
 const api={LIMITS,days,progressPath,assess,read};if(typeof module==='object'&&module.exports)module.exports=api;else root.PACCoachMonitor=api;
})(globalThis);
