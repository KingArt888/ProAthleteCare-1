/* Read-only view model. Reuses the existing session normalizer; no IO or new writes. */
(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./session-normalizer.js'):root.PACSessionNormalizer);if(typeof module==='object'&&module.exports)module.exports=api;else root.PACPerformanceHubCore=api})(globalThis,function(N){
 'use strict';const DAY=86400000,num=v=>v==null||v===''||typeof v==='boolean'?null:Number.isFinite(Number(v))?Number(v):null;
 const validDate=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&Number.isFinite(Date.parse(s))&&new Date(s).toISOString().slice(0,10)===s;
 const usable=r=>r&&r.deleted!==true&&r.archived!==true&&r.isTest!==true&&r.isDemo!==true&&r.active!==false&&!['test','demo','qa','synthetic','seed'].includes(String(r.source||'').toLowerCase());
 const iso=n=>new Date(n).toISOString().slice(0,10),offset=(d,n)=>iso(Date.parse(d)+n*DAY);
 function validate(start,end,max=366){if(!validDate(start)||!validDate(end)||start>end||(Date.parse(end)-Date.parse(start))/DAY+1>max)throw Error('RANGE');return{start,end}}
 function weeks(start,end){validate(start,end);const a=new Date(start+'T00:00:00Z'),m=offset(start,-((a.getUTCDay()+6)%7));const result=[];for(let d=m;d<=end;d=offset(d,7))result.push(d);return result}
 function normalize(records,uid){const input=records.filter(x=>(x.data||x).userId===uid&&usable(x.data||x));const all=N.normalizeSessions(input);return{sessions:N.filterActiveSessions(all),excluded:all.filter(s=>!s.normalization.valid||s.status!=='completed'||s.aggregationStatus==='superseded').length}}
 function zone(session,min,max){const m=session.actual.speedZones;if(m?.quality?.status==='rejected'||!m?.value?.zones)return null;let edge=min,total=0;for(const z of m.value.zones){if(z.minKmh<min)continue;if(z.minKmh!==edge)return null;if(max!==null&&(z.maxKmh===null||z.maxKmh>max))return null;total+=z.distanceKm*1000;edge=z.maxKmh;if(edge===max)return total}return null}
 const metricKeys=['distance','duration','load','maxSpeed','hsr','sprint'];
 function value(s,key){if(key==='load')return s.sessionLoad.value;if(key==='hsr')return zone(s,19,25);if(key==='sprint')return zone(s,25,null);const m=s.actual[key];return m?.quality?.status==='rejected'?null:m?.value??null}
 function summary(sessions,start,end){validate(start,end);const rows=sessions.filter(s=>s.date>=start&&s.date<=end),result={sessions:rows.length,metrics:{}};for(const key of metricKeys){const values=rows.map(s=>value(s,key)).filter(v=>typeof v==='number'&&Number.isFinite(v)&&v>=0);result.metrics[key]={value:values.length?(key==='maxSpeed'?Math.max(...values):values.reduce((a,b)=>a+b,0)):null,known:values.length,total:rows.length,partial:values.length<rows.length}}return result}
 function series(sessions,start,end,key,group='day'){validate(start,end);if(!['day','week','month'].includes(group))throw Error('GROUP');const map=new Map();for(const s of sessions){if(s.date<start||s.date>end)continue;const v=value(s,key);if(v==null)continue;const date=s.date,k=group==='month'?date.slice(0,7):group==='week'?offset(date,-((new Date(date+'T00:00:00Z').getUTCDay()+6)%7)):date;const old=map.get(k);map.set(k,{key:k,value:old?(key==='maxSpeed'?Math.max(old.value,v):old.value+v):v})}return[...map.values()].sort((a,b)=>a.key.localeCompare(b.key))}
 function compare(a,b){if(a==null||b==null)return{difference:null,percent:null};return{difference:b-a,percent:a===0?null:(b/a-1)*100}}
 function planDays(plans,start,end){const out=[];for(const p of plans){if(!validDate(p.weekId))continue;for(let i=0;i<7;i++){const date=offset(p.weekId,i);if(date<start||date>end)continue;const raw=p.microcycle?.['day'+i];if(typeof raw!=='string')continue;out.push({date,weekId:p.weekId,status:raw.toUpperCase()==='MATCH'?'MD':raw.toUpperCase()})}}return out.sort((a,b)=>a.date.localeCompare(b.date))}
 function execution(record,uid,sessionId){
  const p=record?.payload;
  if(!p||record.userId!==uid||record.sessionId!==sessionId||p.userId!==uid||p.executionId!==record.executionId||!['gym','running'].includes(p.kind))return null;
  const actual=p.actual||{},sets=Array.isArray(actual.strengthSets)?actual.strengthSets:[],intervals=Array.isArray(actual.runningIntervals)?actual.runningIntervals:[];
  if(sets.length>500||intervals.length>500)return null;
  return{executionId:record.executionId,date:p.date,kind:p.kind,startedAt:p.startedAt,endedAt:p.endedAt,
   task:{exerciseId:p.task?.exerciseId,exerciseName:record.summary?.name||p.task?.exerciseName||p.task?.exerciseId},
   actual:{status:actual.status,strengthMode:actual.strengthMode,strengthSets:sets.map(s=>({setIndex:s.setIndex,reps:num(s.reps),loadKg:num(s.loadKg),workSec:num(s.workSec)})),runningIntervals:intervals.map(s=>({round:s.round,workSec:num(s.workSec),distanceM:num(s.distanceM)}))},
   summary:{goalMet:typeof record.summary?.goalMet==='boolean'?record.summary.goalMet:null}};
 }
 function insights(sessions,start,end){
  const rows=sessions.filter(s=>s.date>=start&&s.date<=end),result={sessions:rows.length,withRpe:0,withDuration:0,plannedDistance:{known:0,planned:0,actual:0,difference:null,percent:null},sources:{}};
  for(const s of rows){if(s.actual.rpe?.value!=null)result.withRpe++;if(value(s,'duration')!=null)result.withDuration++;const a=value(s,'distance'),p=s.planned?.distance;if(a!=null&&p?.value!=null&&p.quality?.status!=='rejected'){result.plannedDistance.known++;result.plannedDistance.planned+=p.value;result.plannedDistance.actual+=a}const source=s.actual.distance?.source||'unavailable';result.sources[source]=(result.sources[source]||0)+1}
  if(result.plannedDistance.known)Object.assign(result.plannedDistance,compare(result.plannedDistance.planned,result.plannedDistance.actual));return result;
 }
 function periods(kind,reference){
  if(!validDate(reference))throw Error('RANGE');const day=new Date(reference+'T00:00:00Z');
  if(kind==='day')return{a:{start:offset(reference,-1),end:offset(reference,-1)},b:{start:reference,end:reference}};
  if(kind==='week'){const start=offset(reference,-((day.getUTCDay()+6)%7));return{a:{start:offset(start,-7),end:offset(start,-1)},b:{start,end:offset(start,6)}}}
  if(kind==='month'){const start=reference.slice(0,7)+'-01',end=iso(Date.UTC(day.getUTCFullYear(),day.getUTCMonth()+1,0)),previous=iso(Date.UTC(day.getUTCFullYear(),day.getUTCMonth()-1,1));return{a:{start:previous,end:offset(start,-1)},b:{start,end}}}
  throw Error('RANGE');
 }
 return{DAY,num,validDate,usable,offset,validate,weeks,normalize,metricKeys,value,zone,summary,series,compare,planDays,execution,insights,periods};
});
