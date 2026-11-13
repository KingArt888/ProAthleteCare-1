/* Coach-defined planning visualisation, not a physiological risk model. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PACCoachLoadCycle=api})(typeof window==='object'?window:globalThis,function(){
 'use strict';
 function plan({base,stepPct=12,cyclePct=8,unloadPct=65,weeks=12}){
  if(![base,stepPct,cyclePct,unloadPct,weeks].every(Number.isFinite)||base<=0||stepPct<0||stepPct>50||cyclePct<0||cyclePct>50||unloadPct<10||unloadPct>100||!Number.isInteger(weeks)||weeks<1||weeks>52)throw Error('Перевірте план: база > 0; крок і приріст циклу 0–50%; розвантаження 10–100% від піку.');
  return Array.from({length:weeks},(_,i)=>{const cycle=Math.floor(i/4),step=i%4,level=base*Math.pow(1+cyclePct/100,cycle),peak=level*Math.pow(1+stepPct/100,2);return{week:i,cycle:cycle+1,step:step+1,phase:step===3?'unload':step===2?'peak':'build',target:step===3?peak*unloadPct/100:level*Math.pow(1+stepPct/100,step)}});
 }
 function percent(value,reference){return Number.isFinite(value)&&Number.isFinite(reference)&&reference!==0?(value/reference-1)*100:null}
 function classify({value,previous,target,phase}){
  if(!Number.isFinite(value)||value<0)return{color:'#888',label:'Немає даних',status:'missing'};
  if(Number.isFinite(target)&&value>target*1.1)return{color:'#ff6464',label:'Вище плану >10%',status:'above-plan'};
  if(Number.isFinite(previous)&&value<previous)return{color:'#48cf91',label:'Зниження',status:'decrease'};
  if(phase==='peak')return{color:'#ff6464',label:'Пік циклу за планом',status:'peak'};
  return{color:'#FFC72C',label:'Нарощування / без зниження',status:'build'};
 }
 return{plan,percent,classify};
});
