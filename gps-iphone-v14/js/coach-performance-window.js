(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PACPerformanceWindow=api})(typeof window==='object'?window:globalThis,function(){
 'use strict';const DAY=86400000,FIRST='2026-08-03',LAST='2026-10-25',stamp=s=>Date.parse(s+'T00:00:00Z'),iso=n=>new Date(n).toISOString().slice(0,10);
 function today(now=new Date()){const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Berlin',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);const get=k=>parts.find(p=>p.type===k).value;return get('year')+'-'+get('month')+'-'+get('day')}
 function preset(key,now=new Date()){const t=stamp(today(now)),last=stamp(LAST);let a=stamp(FIRST),b=last;if(key==='today')a=b=t;else if(key==='thisweek'){a=t-((new Date(t).getUTCDay()+6)%7)*DAY;b=a+6*DAY}else if(key==='session')a=b=last;else if(/^\d+$/.test(key)){a=Math.max(a,last-(Number(key)-1)*DAY)}return{start:iso(a),end:iso(b),group:'auto',session:key==='session'?LAST+'-demo-1':null}}
 function count(state){return Math.round((stamp(state.end)-stamp(state.start))/DAY)+1}
 function grouping(state){return state.group==='auto'?(count(state)<=21?'day':count(state)<=90?'week':'month'):state.group}
 function zoom(state,factor){const total=count(state),n=Math.max(1,Math.min(366,Math.round(total*factor))),center=(stamp(state.start)+stamp(state.end))/2;let a=Math.round((center-(n-1)*DAY/2)/DAY)*DAY,b=a+(n-1)*DAY;const low=stamp(FIRST),high=stamp(LAST);if(total<=84&&stamp(state.start)>=low&&stamp(state.end)<=high){if(a<low){b+=low-a;a=low}if(b>high){a-=b-high;b=high}a=Math.max(a,low)}return{...state,start:iso(a),end:iso(b),group:'auto',session:null}}
 function select(state,start,end){if(!Number.isFinite(stamp(start))||!Number.isFinite(stamp(end))||start>end)throw Error('Перевірте діапазон дат.');return{...state,start,end,group:'auto',session:null}}
 return{preset,count,grouping,zoom,select,today,FIRST,LAST,DAY};
});
