/* Existing collections only. Explicit actor/assignment checks and bounded server reads. */
(function(root,factory){
 const api=factory(typeof module==='object'&&module.exports?require('./performance-hub-core.js'):root.PACPerformanceHubCore);
 if(typeof module==='object'&&module.exports)module.exports=api;else root.PACPerformanceHubRepository=api;
})(globalThis,function(C){
 'use strict';
 const SERVER={source:'server'},MAX_SESSIONS=250;
 async function create({db,auth,coachId}){
  const user=auth.currentUser;
  if(!user||!user.emailVerified)throw Error('AUTH');
  const me=await db.collection('users').doc(user.uid).get(SERVER);
  const role=String(me.data()?.role||'').toLowerCase();
  const admin=user.emailVerified===true&&String(user.email).toLowerCase()==='kulyk015@gmail.com';
  if(!admin&&!['coach','trainer'].includes(role))throw Error('ROLE');
  if(coachId&&coachId!==user.uid&&!admin)throw Error('SCOPE');
  const owner=coachId||user.uid,cache=new Map(),stops=new Set();
  let disposed=false,roster=[];
  function ensure(){if(disposed||auth.currentUser?.uid!==user.uid||auth.currentUser?.emailVerified!==true)throw Error('AUTH_CHANGED')}
  function dispose(){disposed=true;cache.clear();roster=[];for(const stop of stops)stop();stops.clear()}
  async function list(){
   ensure();const snap=await db.collection('users').where('coachId','==',owner).limit(201).get(SERVER);ensure();
   roster=snap.docs.slice(0,200).map(d=>({...d.data(),uid:d.id})).filter(d=>d.coachId===owner&&(!d.role||['athlete','client','user'].includes(String(d.role).toLowerCase())));
   return{players:roster,truncated:snap.docs.length>200};
  }
  async function scope(uid){
   ensure();if(!roster.some(p=>p.uid===uid))throw Error('SCOPE');
   const doc=await db.collection('users').doc(uid).get(SERVER);ensure();
   if(!doc.exists||doc.data()?.coachId!==owner)throw Error('SCOPE');return{...doc.data(),uid};
  }
  const dated=(collection,uid,start,end)=>db.collection(collection).where('userId','==',uid).where('date','>=',start).where('date','<=',end).orderBy('date','desc');
  async function read(uid,start,end,{refresh=false,light=false}={}){
   C.validate(start,end);const profile=await scope(uid),key=[uid,start,end,light?'sessions':'all'].join('|'),old=cache.get(key);
   if(!refresh&&old&&Date.now()-old.at<60000)return{...old.value,profile,fromMemory:true};
   const data={profile,errors:[],truncated:[],fallbackSources:[],readAt:0,fromMemory:false};
   async function source(name,query,limit,{owned=true,fallback=null,dateFiltered=false}={}){
    try{
     let snap;
     try{snap=await query.limit(limit+1).get(SERVER)}catch(error){
      // Missing index only: same uid scope, bounded response, never a permission bypass.
      if(error.code!=='failed-precondition'||!fallback)throw error;
      snap=await fallback.limit(limit+1).get(SERVER);data.fallbackSources.push(name);
     }
     ensure();if(snap.docs.length>limit)data.truncated.push(name);
     return snap.docs.slice(0,limit).map(d=>({id:d.id,data:d.data()})).filter(r=>(!owned||r.data.userId===uid)&&(!dateFiltered||(r.data.date>=start&&r.data.date<=end)));
    }catch(error){ensure();data.errors.push({source:name,code:error.code||'read-failed'});return[]}
   }
   const readDated=(name,collection,limit)=>source(name,dated(collection,uid,start,end),limit,{fallback:db.collection(collection).where('userId','==',uid),dateFiltered:true});
   const jobs=[['sessions',()=>readDated('sessions','load_season_reports',MAX_SESSIONS)]];
   if(!light)jobs.push(
    ['weights',()=>readDated('weights','weight_history',100)],
    ['wellness',()=>readDated('wellness','wellness_reports',100)],
    ['injuries',()=>source('injuries',db.collection('injuries').where('userId','==',uid).orderBy('date','desc'),100,{fallback:db.collection('injuries').where('userId','==',uid)})],
    ['strength',()=>source('strength',db.collection('users').doc(uid).collection('training_profiles'),100,{owned:false})],
    ['plans',async()=>{
     const ids=C.weeks(start,end),results=await Promise.allSettled(ids.map(week=>db.collection('weekly_plans').doc(uid+'_'+week).get(SERVER)));ensure();
     const docs=[];results.forEach((r,i)=>{if(r.status==='rejected'){data.errors.push({source:'plans',code:r.reason.code||'read-failed'});return}if(r.value.exists&&r.value.data().userId===uid)docs.push({id:r.value.id,data:{...r.value.data(),weekId:ids[i]}})});return docs;
    }]
   );
   await Promise.all(jobs.map(async([name,fn])=>{data[name]=await fn()}));ensure();
   const normalized=C.normalize(data.sessions,uid);data.normalized=normalized.sessions;data.excluded=normalized.excluded;data.readAt=Date.now();cache.set(key,{at:data.readAt,value:data});return data;
  }
  async function executions(uid,sessionId){
   await scope(uid);if(typeof sessionId!=='string'||!/^[a-zA-Z0-9-]{1,128}$/.test(sessionId))throw Error('SESSION');
   const snap=await db.collection('load_season_reports').doc(uid+'_'+sessionId).collection('executions').where('userId','==',uid).limit(101).get(SERVER);ensure();
   const input=snap.docs.slice(0,100),rows=input.map(d=>C.execution(d.data(),uid,sessionId)).filter(Boolean);
   return{rows,truncated:snap.docs.length>100,excluded:input.length-rows.length};
  }
  async function power(uid,start,end){
   C.validate(start,end);await scope(uid);
   const snap=await db.collection('power_tests').doc(uid).collection('tests').where('createdAtMs','>=',Date.parse(start+'T00:00:00Z')).where('createdAtMs','<',Date.parse(C.offset(end,1)+'T00:00:00Z')).orderBy('createdAtMs','desc').limit(21).get(SERVER);ensure();
   return{rows:snap.docs.slice(0,20).map(d=>{const r=d.data();return{id:d.id,data:{date:r.date,best_cm:r.best_cm,source:r.source,isTest:r.isTest,isDemo:r.isDemo,deleted:r.deleted,archived:r.archived}}}),truncated:snap.docs.length>20};
  }
  async function watch(uid,start,end,onData,onError){
   C.validate(start,end);await scope(uid);ensure();let active=true,unsubscribe=()=>{};
   const stop=()=>{active=false;unsubscribe();stops.delete(stop)};stops.add(stop);
   try{unsubscribe=dated('load_season_reports',uid,start,end).limit(MAX_SESSIONS+1).onSnapshot(snap=>{
    if(!active)return;try{ensure()}catch(error){stop();onError(error);return}
    if(snap.metadata?.fromCache)return;
    const records=snap.docs.slice(0,MAX_SESSIONS).map(d=>({id:d.id,data:d.data()})).filter(r=>r.data.userId===uid),normalized=C.normalize(records,uid);
    cache.clear();onData({records,...normalized,truncated:snap.docs.length>MAX_SESSIONS,readAt:Date.now()});
   },error=>{if(active){stop();onError(error)}})}catch(error){stop();throw error}
   if(!active)unsubscribe();return stop;
  }
  return{actor:user.uid,owner,list,read,executions,power,watch,ensure,dispose};
 }
 return{create};
});
