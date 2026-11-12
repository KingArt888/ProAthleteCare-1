/* Coach display policy: explicit account states, active source records, no fabricated metrics. */
(function(root){
  'use strict';
  const num=v=>v==null||v===''||typeof v==='boolean'?null:Number.isFinite(Number(v))?Number(v):null;
  const state=v=>String(v||'').trim().toLowerCase();
  function millis(v){if(v==null)return 0;if(typeof v==='number')return v;if(v.toMillis)return v.toMillis();if(v.toDate)return v.toDate().getTime();if(v.seconds!=null)return Number(v.seconds)*1000;return Date.parse(v)||0;}
  function testRecord(d={}){return d.isTestAccount===true||d.isTest===true||d.isDemo===true||d.testMode===true||['test','demo','qa','synthetic','seed'].includes(state(d.source))||['test','demo'].includes(state(d.accountType));}
  function inactive(d={}){return d.active===false||d.isActive===false||d.enabled===false||d.aggregationEnabled===false||d.disabled===true||d.deleted===true||d.archived===true||Boolean(d.deletedAt||d.archivedAt)||[d.status,d.accountStatus,d.accessStatus,d.planStatus,d.aggregationStatus].some(v=>['inactive','disabled','archived','deleted','deactivated','revoked','superseded'].includes(state(v)));}
  function clientState(d={}){if(testRecord(d))return 'test';return inactive(d)?'inactive':'active';}
  function sourceTime(d={}){if(/^\d{4}-\d{2}-\d{2}$/.test(d.date||''))return millis(d.date+'T00:00:00');return millis(d.measuredAt||d.asOf||d.timestamp||d.updatedAt||d.createdAt);}
  function usable(d={}){return !inactive(d)&&!testRecord(d)&&!d.supersededBy;}
  function fresh(d,now=Date.now(),hours=48){const t=sourceTime(d);return usable(d)&&t>0&&t<=now+300000&&now-t<=hours*3600000;}
  function latest(rows=[],now=Date.now(),freshOnly=false){return rows.filter(d=>usable(d)&&sourceTime(d)<=now+300000&&(!freshOnly||fresh(d,now))).sort((a,b)=>sourceTime(b)-sourceTime(a))[0]||null;}
  function localDate(d=new Date()){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
  function emptyMetrics(){return{readinessPct:null,avg7:null,trend:null,pain:null,acwr:null,cmj:null,weight:null,sleep:null,stress:null,soreness:null,ready:null,metricsAt:0,weightAt:0,cmjAt:0,riskLevel:''};}
  function metrics({wellness=[],injuries=[],weights=[],power=[]}={},now=Date.now()){
    const result=emptyMetrics(),w=latest(wellness,now,true),weight=latest(weights,now),jump=latest(power,now);
    if(w){for(const k of ['sleep','stress','soreness','ready']){const value=num(w.scores?.[k]??w[k]);result[k]=value>=1&&value<=10?value:null;}if(result.ready!=null)result.readinessPct=Math.round(result.ready*10);result.metricsAt=sourceTime(w);}
    // Open injuries remain relevant until updated/resolved; an old timestamp is not recovery.
    const pain=injuries.filter(usable).map(d=>{const history=Array.isArray(d.history)?d.history:[];const last=history.slice().sort((a,b)=>sourceTime(b)-sourceTime(a)||millis(b.timestamp)-millis(a.timestamp))[0];return num(last?.pain??d.pain??d.painScore);}).filter(v=>v!=null&&v>=0&&v<=10);
    if(pain.length)result.pain=Math.max(...pain);
    result.weight=num(weight?.value??weight?.weight??weight?.weightKg);result.cmj=num(jump?.best_cm??jump?.bestCm??jump?.best);result.weightAt=weight?sourceTime(weight):0;result.cmjAt=jump?sourceTime(jump):0;
    return result;
  }
  function summary(clients=[]){const active=clients.filter(c=>clientState(c)==='active'),known=active.filter(c=>num(c.readinessPct)!=null);return{active:active.length,test:clients.filter(c=>clientState(c)==='test').length,inactive:clients.filter(c=>clientState(c)==='inactive').length,known:known.length,readiness:known.length?Math.round(known.reduce((s,c)=>s+num(c.readinessPct),0)/known.length):null};}
  const api={num,millis,testRecord,inactive,clientState,sourceTime,usable,fresh,latest,emptyMetrics,metrics,summary,localDate};
  if(typeof module==='object'&&module.exports)module.exports=api;else root.PACCoachDashboardData=api;
})(globalThis);
