/* Two periods aligned by relative day, same metric/unit, never joins missing days. */
window.PACPerformanceComparisonChart={draw({host,views,metric,label,format}){
 const C=window.PACPerformanceHubCore,NS='http://www.w3.org/2000/svg',svg=(tag,attrs={},text)=>{const e=document.createElementNS(NS,tag);for(const [k,v]of Object.entries(attrs))e.setAttribute(k,v);if(text!=null)e.textContent=text;return e};
 host.replaceChildren();if(!views)return;
 const lines=views.map((view,i)=>({...view,color:i?'#65ccb7':'#FFC72C',points:C.series(view.sessions,view.start,view.end,metric,'day').map(p=>({...p,day:(Date.parse(p.key)-Date.parse(view.start))/C.DAY}))}));
 if(!lines.some(l=>l.points.length))return;
 const W=900,H=310,L=65,R=25,T=42,B=45,last=Math.max(1,...lines.map(l=>(Date.parse(l.end)-Date.parse(l.start))/C.DAY)),max=Math.max(1,...lines.flatMap(l=>l.points.map(p=>p.value)))*1.15,x=d=>L+d/last*(W-L-R),y=v=>H-B-v/max*(H-T-B),g=svg('svg',{viewBox:`0 0 ${W} ${H}`,role:'img','aria-label':label});
 lines.forEach((line,i)=>g.append(svg('text',{x:L+i*360,y:17,fill:line.color,'font-size':13},(i?'B · ':'A · ')+line.name)));
 for(let i=0;i<=4;i++)g.append(svg('line',{x1:L,y1:y(max*i/4),x2:W-R,y2:y(max*i/4),stroke:'#292929'}),svg('text',{x:L-10,y:y(max*i/4)+4,'text-anchor':'end',fill:'#999','font-size':11},format(max*i/4)));
 for(const line of lines)line.points.forEach((point,i)=>{const previous=line.points[i-1];if(previous&&point.day-previous.day===1)g.append(svg('line',{x1:x(previous.day),y1:y(previous.value),x2:x(point.day),y2:y(point.value),stroke:line.color,'stroke-width':3}));const dot=svg('circle',{cx:x(point.day),cy:y(point.value),r:5,fill:line.color});dot.append(svg('title',{},line.name+' · '+point.key+' · '+format(point.value)));g.append(dot)});
 for(let i=0;i<=Math.min(6,last);i++){const d=Math.round(i/Math.min(6,last)*last);g.append(svg('text',{x:x(d),y:H-15,'text-anchor':'middle',fill:'#999','font-size':12},String(d+1)))}host.append(g);
}};
