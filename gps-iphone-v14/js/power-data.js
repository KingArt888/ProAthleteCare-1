(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PACPowerData=api;})(typeof window==='object'?window:globalThis,function(){
 'use strict';
 const num=v=>v==null||v===''||typeof v==='boolean'?null:Number.isFinite(Number(v))?Number(v):null;
 const usable=e=>!!e&&e.isTest!==true&&e.isDemo!==true&&e.deleted!==true&&e.archived!==true&&e.active!==false&&!['test','demo','qa','synthetic','seed'].includes(String(e.source||'').toLowerCase());
 const stamp=e=>num(e?.createdAtMs)||Date.parse(e?.date||'')||0;
 const latest=rows=>rows.filter(e=>usable(e)&&stamp(e)>0&&stamp(e)<=Date.now()+300000&&summary(e).best>0).sort((a,b)=>stamp(b)-stamp(a))[0]||null;
 const snapshot=s=>typeof s==='string'&&/^data:image\/(?:jpeg|png);base64,[a-zA-Z0-9+/=]+$/.test(s)&&s.length<=220000?s:null;
 function summary(e={}){
   const series=(Array.isArray(e.series)?e.series:[]).filter(p=>num(p.height_cm)>0&&num(p.height_cm)<=200);
   const heights=series.map(p=>Number(p.height_cm));
   return {count:heights.length||Math.max(0,num(e.count)||0),best:heights.length?Math.max(...heights):num(e.best_cm)>0?num(e.best_cm):null,avg:heights.length?heights.reduce((a,b)=>a+b,0)/heights.length:num(e.avg_cm)>0?num(e.avg_cm):null,series};
 }
 function sanitize(e,uid){
   if(!uid||!['camera','manual'].includes(e.source))throw Error('provenance');
   const manual=e.source==='manual';
   const series=(Array.isArray(e.series)?e.series:[]).map(p=>({t_s:num(p.t_s),flight_s:manual?null:num(p.flight_s),height_cm:num(p.height_cm),snapshot:snapshot(p.snapshot)}));
   if(manual){if(series.length||num(e.best_cm)<=0||num(e.best_cm)>200||num(e.best_cm)===null)throw Error('height');}
   else if(!series.length||series.length>100||series.some(p=>p.t_s===null||p.t_s<0||p.height_cm===null||p.height_cm<=0||p.height_cm>200||p.flight_s===null||p.flight_s<=0))throw Error('series');
   const s=manual?{count:1,best:Number(e.best_cm),avg:Number(e.best_cm)}:summary({series});
   const date=String(e.date||''),ms=num(e.createdAtMs);if(!Number.isFinite(Date.parse(date))||!ms||ms<0)throw Error('date');
   const out={schemaVersion:2,userId:uid,source:e.source,isTest:false,testType:manual?'single_jump_manual':'repeated_jump_15s_camera',measurementMethod:manual?'reported_height':'pose_flight_time_estimate',date,createdAtMs:ms,count:s.count,best_cm:s.best,avg_cm:s.avg,fatigue_pct:manual?null:num(e.fatigue_pct),improve_pct:manual?null:num(e.improve_pct),series,final_snapshot:snapshot(e.final_snapshot)};
   if(!manual)out.trackingLosses=Math.max(0,num(e.trackingLosses)||0);
   if(JSON.stringify(out).length>650000){out.series=series.map(p=>({...p,snapshot:null}));out.final_snapshot=null;}
   return out;
 }
 return {num,usable,stamp,latest,snapshot,summary,sanitize};
});
