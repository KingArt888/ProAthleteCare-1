/* Shared journal: pure projection + explicitly configured Firebase client.
   No IO at load time. Existing load_season_reports owns sessions; immutable
   execution details are children, not additional load-bearing sessions. */
(function(root){
  'use strict';
  const N=typeof module==='object'&&module.exports?require('./session-normalizer.js'):root.PACSessionNormalizer;
  const R=typeof module==='object'&&module.exports?require('./session-repository.js'):root.PACSessionRepository;
  const copy=value=>JSON.parse(JSON.stringify(value));
  function project(records){
    const sessions=N.normalizeSessions(records),active=N.filterActiveSessions(sessions);
    const rows=active.map(s=>({userId:s.userId,sessionId:s.sessionId,_id:s.docId,date:s.date,duration:s.actual.duration.value,
      rpe:s.actual.rpe.value,distance:s.actual.distance.value,source:s.actual.duration.source,
      timestamp:s.startedAt||s.date,loadReady:s.sessionLoad.value!=null,sessionLoad:s.sessionLoad.value})).sort((a,b)=>a.date.localeCompare(b.date)||a.sessionId.localeCompare(b.sessionId));
    return{rows,knownRows:rows.filter(row=>row.loadReady),sessions,quality:N.getDataQuality(sessions),
      overlaps:sessions.filter(s=>s.normalization.errors.includes('legacy_overlap_requires_resolution')).map(s=>s.date).filter((date,i,list)=>list.indexOf(date)===i)};
  }
  function strengthRecord(run){return{userId:run.userId,executionId:run.executionId,date:run.date,timezone:run.timezone||Intl.DateTimeFormat().resolvedOptions().timeZone,
    kind:'gym',task:{...copy(run.task),actual:{}},actual:{...copy(run.task.actual),effectivePrescription:{sets:run.targets.length,reps:run.timed?null:run.targets[0],workSec:run.plannedWorkSec,sideTotal:run.sideTotal,source:run.prescriptionSource}},startedAt:new Date(run.rows[0]?.startedAt||run.createdAt).toISOString(),endedAt:new Date(run.endedAt).toISOString(),route:null};}
  function runningRecord(envelope){
    const task=envelope.extensions.task,e=envelope.extensions;
    return{userId:task.context.userId,executionId:task.executionId,date:envelope.input.date,timezone:envelope.input.timezone,kind:'running',task:{...copy(task),actual:{}},
      actual:{runningIntervals:copy(e.runningIntervals),fieldSelection:copy(e.fieldSelection||null),activeMs:e.activeMs,elapsedMs:e.elapsedMs,movingMs:e.movingMs,quality:copy(e.quality),provenance:copy(e.provenance),maxSpeedKmh:envelope.input.actual.maxSpeed.value,
        distanceM:envelope.input.actual.distance.value==null?null:envelope.input.actual.distance.value*1000,gps:copy(e.gps),status:e.runningIntervals.length>=task.planned.sets?'completed':'stopped'},
      startedAt:envelope.input.startedAt,endedAt:envelope.input.endedAt,route:null,gpsLocalSessionId:envelope.sessionId};
  }
  function mergeStrengthProfile(previous,record){
    const p=copy(previous||{}),a=record.actual;
    const rows=(a.strengthSets||[]).filter(row=>row.loadKg!=null&&row.reps>0).map(row=>({...row,executionId:record.executionId,mode:a.strengthMode}));
    if(rows.length){const last=rows.at(-1);if(!p.last||last.endedAt>=p.last.endedAt)p.last=copy(last);
      p.best=[...(p.best?[p.best]:[]),...rows].sort((x,y)=>(y.estimated1RM||y.loadKg)-(x.estimated1RM||x.loadKg)||y.loadKg-x.loadKg||y.reps-x.reps)[0];
      if(a.strengthMode==='workout'&&last.endedAt>=(p.lastWorkAt||0)){p.lastWorkLoadKg=last.loadKg;p.lastWorkAt=last.endedAt;}}
    if(a.testResult&&(!p.referenceMax||a.testResult.recordedAt>=p.referenceMax.recordedAt))p.referenceMax=copy(a.testResult);
    return p;
  }
  async function readRoute(sessionId,owner){
    const db=await new Promise((resolve,reject)=>{const request=indexedDB.open('pac-gps',1);request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(Error('GPS_STORAGE_UNAVAILABLE'));});
    try{return await new Promise((resolve,reject)=>{const request=db.transaction('sessions').objectStore('sessions').get(sessionId);request.onerror=()=>reject(Error('GPS_ROUTE_UNAVAILABLE'));request.onsuccess=()=>{const value=request.result;if(!value||value.dailyOwner!==owner){reject(Error('OWNER_MISMATCH'));return;}resolve({schemaVersion:1,sessionId,executionId:value.dailyTask.executionId,route:value.route||[],replayPoints:value.replayPoints||[]});};});}finally{db.close();}
  }
  function createClient({db,auth,storage,localStorage:local,onStatus=()=>{}}){
    let working=null;
    const owner=()=>{const uid=auth.currentUser?.uid;if(!uid)throw Error('AUTH_REQUIRED');return uid;};
    const queueKey=uid=>`pac_session_outbox_v1:${encodeURIComponent(uid)}`;
    function read(uid){const raw=local.getItem(queueKey(uid));if(!raw)return{};const parsed=JSON.parse(raw);if(!parsed||Array.isArray(parsed)||typeof parsed!=='object')throw Error('INVALID_OUTBOX');return parsed;}
    function store(uid,data){local.setItem(queueKey(uid),JSON.stringify(data));}
    function ensure(uid){if(owner()!==uid)throw Error('OWNER_MISMATCH');}
    async function prepareRoute(item,uid){
      if(!item.gpsLocalSessionId||!item.record.actual.gps?.hasMeasurements)return;
      const route=await readRoute(item.gpsLocalSessionId,uid);
      if(route.executionId!==item.record.executionId)throw Error('ROUTE_EXECUTION_MISMATCH');
      const text=JSON.stringify(route),bytes=new TextEncoder().encode(text);
      if(bytes.length>20*1024*1024)throw Error('ROUTE_TOO_LARGE');
      const digest=await crypto.subtle.digest('SHA-256',bytes),sha256=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
      const path=`training-routes/${uid}/${item.record.executionId}.json`;ensure(uid);
      item.record.route={path,sha256,bytes:bytes.length};
      return async()=>{ensure(uid);const task=storage.ref(path).putString(text,'raw',{contentType:'application/json',customMetadata:{userId:uid,executionId:item.record.executionId,sha256}});const timeout=setTimeout(()=>task.cancel?.(),12000);try{await task;}finally{clearTimeout(timeout);}};
    }
    async function send(item,uid){
      ensure(uid);
      if(item.kind==='execution'){
        const upload=await prepareRoute(item,uid);ensure(uid);
        const record=item.record,sessionId=`daily-${record.date}`,parent=db.collection('load_season_reports').doc(`${uid}_${sessionId}`),child=parent.collection('executions').doc(record.executionId);
        const profile=record.kind==='gym'?db.collection('users').doc(uid).collection('training_profiles').doc(encodeURIComponent(record.task.exerciseId)):null;
        const context=record.task.context,progress=context.weekId&&Number.isInteger(context.dayIdx)?db.collection('athlete_daily_progress').doc(`${uid}_${context.weekId}_${context.dayIdx}`):null;
        await db.runTransaction(async tx=>{
          const [session,execution,oldProfile,oldProgress]=await Promise.all([tx.get(parent),tx.get(child),profile?tx.get(profile):Promise.resolve(null),progress?tx.get(progress):Promise.resolve(null)]);ensure(uid);
          const decision=R.prepareExecution({actorId:uid,record,now:new Date().toISOString()},session.exists?session.data():null,execution.exists?execution.data():null);
          if(decision.write){
            tx.set(parent,decision.document);tx.set(child,decision.execution);if(profile)tx.set(profile,{userId:uid,exerciseId:record.task.exerciseId,performance:mergeStrengthProfile(oldProfile?.exists?oldProfile.data().performance:{},record)});
            if(progress){const old=oldProgress?.exists?oldProgress.data():{},summaries={...(old.executionSummary||{})},summary=decision.execution.summary;
              if(!summaries[summary.planItemId]||summary.endedAt>=summaries[summary.planItemId].endedAt)summaries[summary.planItemId]=summary;
              const doneMap={...(old.doneMap||{})};if(summary.mode!=='test3')doneMap[summary.planItemId]=summaries[summary.planItemId].goalMet;
              const doneCount=Object.values(doneMap).filter(Boolean).length,total=Number(old.totalExercises)||Object.keys(summaries).length;
              tx.set(progress,{...old,uid,weekId:context.weekId,dayIdx:context.dayIdx,dateId:record.date,executionSummary:summaries,actualSessionId:sessionId,actualTrainingMinutes:decision.document.actual.duration.value,doneMap,doneCount,totalExercises:total,progressPct:total?Math.min(100,Math.round(doneCount/total*100)):0});
            }
          }
        });
        if(upload)await upload();
      }else if(item.kind==='profile'){
        const ref=db.collection('users').doc(uid).collection('training_profiles').doc(encodeURIComponent(item.exerciseId));
        await db.runTransaction(async tx=>{const snapshot=await tx.get(ref);ensure(uid);const p=snapshot.exists?snapshot.data().performance:{};
          if(item.performance.referenceMax&&(!p.referenceMax||item.performance.referenceMax.recordedAt>=p.referenceMax.recordedAt))p.referenceMax=item.performance.referenceMax;
          if((item.performance.percentUpdatedAt||0)>=(p.percentUpdatedAt||0)){p.trainingPercent1RM=item.performance.trainingPercent1RM??null;p.percentUpdatedAt=item.performance.percentUpdatedAt||0;}
          tx.set(ref,{userId:uid,exerciseId:item.exerciseId,performance:p});});
      }else{
        const command=item.command,parent=db.collection('load_season_reports').doc(`${uid}_daily-${command.date}`),feedback=db.collection('athlete_reports').doc(`${uid}_daily-${command.date}`);
        await db.runTransaction(async tx=>{
          const [session,oldFeedback]=await Promise.all([tx.get(parent),tx.get(feedback)]);ensure(uid);
          if(oldFeedback.exists&&oldFeedback.data().mutationId===command.mutationId)return;
          const decision=R.prepareFeedback({...command,actorId:uid,now:new Date().toISOString()},session.exists?session.data():null);
          tx.set(parent,decision.document);tx.set(feedback,{...decision.feedback,mutationId:command.mutationId});
          if(command.context.weekId&&Number.isInteger(command.context.dayIdx))tx.set(db.collection('athlete_daily_progress').doc(`${uid}_${command.context.weekId}_${command.context.dayIdx}`),{uid,weekId:command.context.weekId,dayIdx:command.context.dayIdx,actualSessionId:`daily-${command.date}`,actualTrainingMinutes:command.duration},{merge:true});
        });
      }
    }
    async function flush(){
      if(working)return working;
      const uid=owner();
      working=(async()=>{
        const failures=[];
        for(const key of Object.keys(read(uid))){ensure(uid);const queue=read(uid);if(!queue[key])continue;
          const item=copy(queue[key]);onStatus({state:'syncing',pending:Object.keys(queue).length});
          try{await send(item,uid);}catch(error){ensure(uid);failures.push(error);continue;}ensure(uid);const fresh=read(uid);if(JSON.stringify(fresh[key])===JSON.stringify(queue[key]))delete fresh[key];store(uid,fresh);
        }
        if(failures.length)throw failures[0];
        onStatus({state:'synced',pending:0});
      })().catch(error=>{onStatus({state:'pending',error:error.message,pending:Object.keys(read(uid)).length});throw error;}).finally(()=>{working=null;});
      return working;
    }
    function enqueueExecution(record){
      const uid=owner();if(record.userId!==uid)throw Error('OWNER_MISMATCH');
      const value=copy(record),gpsLocalSessionId=value.gpsLocalSessionId||null;delete value.gpsLocalSessionId;
      R.prepareExecution({actorId:uid,record:value,now:new Date().toISOString()},null,null);
      const queue=read(uid),key=`execution:${value.executionId}`;
      if(queue[key]&&JSON.stringify(queue[key].record)!==JSON.stringify(value))throw Error('EXECUTION_CONFLICT');
      queue[key]={kind:'execution',record:value,gpsLocalSessionId};store(uid,queue);onStatus({state:'pending',pending:Object.keys(queue).length});
      return flush();
    }
    function feedback(command){const uid=owner();R.prepareFeedback({...command,actorId:uid,now:new Date().toISOString()},null);
      const queue=read(uid);queue[`feedback:${command.mutationId}`]={kind:'feedback',command:copy(command)};store(uid,queue);return flush();}
    async function list(uid=owner()){
      const snapshot=await db.collection('load_season_reports').where('userId','==',uid).get();
      const records=snapshot.docs.map(doc=>({id:doc.id,data:doc.data()}));return{...project(records),records};
    }
    async function executions(sessionId,uid=owner()){
      if(typeof sessionId!=='string'||!/^[a-zA-Z0-9-]{1,128}$/.test(sessionId))throw Error('INVALID_SESSION_ID');
      const snapshot=await db.collection('load_season_reports').doc(`${uid}_${sessionId}`).collection('executions').where('userId','==',uid).get();
      return snapshot.docs.map(doc=>doc.data());
    }
    function profile(exerciseId,performance){const uid=owner(),queue=read(uid);queue[`profile:${exerciseId}`]={kind:'profile',exerciseId,performance:copy(performance)};store(uid,queue);return flush();}
    async function profiles(uid=owner()){const snapshot=await db.collection('users').doc(uid).collection('training_profiles').get();return snapshot.docs.map(doc=>doc.data());}
    async function resolveLegacy(date,choice){
      const uid=owner(),legacy=db.collection('load_season_reports').doc(`${uid}_${date}`),daily=db.collection('load_season_reports').doc(`${uid}_daily-${date}`);
      await db.runTransaction(async tx=>{
        const [old,parent]=await Promise.all([tx.get(legacy),tx.get(daily)]);ensure(uid);
        const decision=R.prepareLegacyResolution({actorId:uid,date,choice,timezone:Intl.DateTimeFormat().resolvedOptions().timeZone,now:new Date().toISOString()},old.exists?old.data():null,parent.exists?parent.data():null);
        if(decision.write){tx.set(db.collection('load_season_reports').doc(decision.docId),decision.document);tx.set(legacy,decision.legacy);}
      });
    }
    return{enqueueExecution,feedback,flush,list,executions,resolveLegacy,profile,profiles,pending:()=>Object.keys(read(owner())).length};
  }
  const api={project,strengthRecord,runningRecord,mergeStrengthProfile,createClient};
  if(typeof module==='object'&&module.exports)module.exports=api;else root.PACSessionJournal=api;
})(globalThis);
