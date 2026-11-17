/* Pure read-only athlete analysis. No IO. */
(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./performance-hub-core.js'):root.PACPerformanceHubCore);if(typeof module==='object'&&module.exports)module.exports=api;else root.PACAthleteAnalysis=api})(globalThis,function(C){
'use strict';
function previous(start,end){C.validate(start,end);const days=(Date.parse(end)-Date.parse(start))/C.DAY+1;return{start:C.offset(start,-days),end:C.offset(start,-1)}}
function incomplete(data,period,today){return(data.errors||[]).some(e=>e.source==='sessions')||(data.truncated||[]).includes('sessions')||period.end>today||Boolean(data.availableRange&&(period.start<data.availableRange.start||period.end>data.availableRange.end))}
function comparison(a,b,ra,rb,today){C.validate(ra.start,ra.end);C.validate(rb.start,rb.end);const sa=C.summary(a.normalized,ra.start,ra.end),sb=C.summary(b.normalized,rb.start,rb.end),partial=incomplete(a,ra,today)||incomplete(b,rb,today);return{a:sa,b:sb,partial,metrics:C.metricKeys.map(key=>{const av=sa.metrics[key],bv=sb.metrics[key],uncertain=partial||av.partial||bv.partial;return{key,a:av,b:bv,uncertain,...(uncertain?{difference:null,percent:null}:C.compare(av.value,bv.value))}})}}
function csv(rows){const safe=value=>{let text=String(value??'');if(/^[\s]*[=+\-@]/.test(text)||/^[\t\r]/.test(text))text="'"+text;return'"'+text.replace(/"/g,'""')+'"'};return'\uFEFF'+rows.map(row=>row.map(safe).join(',')).join('\r\n')}
function domain(points,kind){const values=points.map(p=>p.value).filter(Number.isFinite);if(!values.length)return{min:0,max:1};if(kind==='score')return{min:0,max:10};const low=Math.min(...values),high=Math.max(...values);if(kind==='observations'){const pad=Math.max((high-low)*.25,high*.01,.5);return{min:Math.max(0,Math.floor((low-pad)*10)/10),max:Math.ceil((high+pad)*10)/10}}return{min:0,max:Math.max(1,high)*1.15}}
return{previous,incomplete,comparison,csv,domain};
});
