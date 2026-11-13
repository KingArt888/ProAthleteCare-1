/* Design preview. Synthetic fixtures only: no authentication, network, storage or imported files. */
(function(){
 'use strict';
 const $=id=>document.getElementById(id),NS='http://www.w3.org/2000/svg';
 const names=['Артем Коваль','Максим Бондар','Данило Мельник','Олексій Шевченко','Ілля Ткаченко','Назар Мороз','Роман Савчук','Денис Петренко'];
 const positions=['Центральний захисник','Крайній захисник','Півзахисник','Нападник','Півзахисник','Крайній нападник','Захисник','Нападник'];
 const weights=[.91,1.07,1.13,1.02,1.05,.98,.89,1.09],cycles=[.80,.90,1.01,.66,.87,.98,1.10,.72,.95,1.07,1.20,.79];
 const players=names.map((name,p)=>({id:'demo-'+p,name,position:positions[p],weeks:cycles.map((c,w)=>{const f=c*weights[p]*(1+.035*Math.sin(p+w));return{distance:Math.round(26400*f),load:Math.round(1630*f),hsr:Math.round(1520*f*(1+.08*Math.cos(w+p))),sprint:Math.round(380*f*(1+.13*Math.sin(w+p))),acc:Math.round(142*f),dec:Math.round(136*f),max:Math.round((28.5+p*.35+Math.sin(w+p)*1.1)*10)/10}})}));
 const metrics={distance:{label:'Дистанція',unit:'км',color:'#FFC72C',divide:1000},load:{label:'Player Load',unit:'a.u.',color:'#FFC72C',divide:1},hsr:{label:'HSR',unit:'м',color:'#65ccb7',divide:1},sprint:{label:'Sprint',unit:'м',color:'#FFC72C',divide:1},acc:{label:'Прискорення',unit:'подій',color:'#FFC72C',divide:1},dec:{label:'Гальмування',unit:'подій',color:'#65ccb7',divide:1}};
 const format=(n,digits=0)=>new Intl.NumberFormat('uk-UA',{maximumFractionDigits:digits}).format(n);
 const Cycle=window.PACCoachLoadCycle,plans=new Map();
 let selected='team',range='all',metric='distance',week=11,explorer=null;
 const weekLabel=i=>'W'+String(i+1).padStart(2,'0');
 const weekDates=i=>{const d=new Date(Date.UTC(2026,7,3+i*7)),end=new Date(+d+6*86400000);const f=x=>x.toLocaleDateString('uk-UA',{day:'2-digit',month:'2-digit',timeZone:'UTC'});return f(d)+'–'+f(end)};
 function indices(){return Array.from({length:range==='4'?4:12},(_,i)=>i+(range==='4'?8:0))}
 function active(){return selected==='team'?players:players.filter(p=>p.id===selected)}
 function sum(list,ids,key){return list.reduce((total,p)=>total+ids.reduce((n,w)=>n+p.weeks[w][key],0),0)}
 function settings(key){return plans.get(selected+'|'+key)||{base:sum(active(),[0],key)/metrics[key].divide,stepPct:12,cyclePct:8,unloadPct:65,weeks:12}}
 function targetPlan(key){return Cycle.plan(settings(key))}
 function signed(n){return n==null?'—':(n>0?'+':'')+format(n,1)+'%'}
 function svg(tag,attrs={},text){const e=document.createElementNS(NS,tag);for(const [k,v]of Object.entries(attrs))e.setAttribute(k,v);if(text!=null)e.textContent=text;return e}
 function make(tag,text,cls){const e=document.createElement(tag);if(text!=null)e.textContent=text;if(cls)e.className=cls;return e}
 function choose(id){selected=id;$('cp-player').value=id;const u=new URL(location.href);if(id==='team')u.searchParams.delete('demoPlayer');else u.searchParams.set('demoPlayer',id);history.replaceState({},'',u);render()}
 function chart(host,key,{bars=false,dual=false,compact=false}={}){
  const ids=indices(),list=active(),def=metrics[key],values=ids.map(w=>sum(list,[w],key)/def.divide),second=dual?ids.map(w=>sum(list,[w],'sprint')):[];
  const mobile=matchMedia('(max-width:600px)').matches,plan=targetPlan(key),targets=ids.map(w=>plan[w].target);
  const W=mobile?640:compact?650:1000,H=mobile?360:compact?260:310,L=58,R=30,T=32,B=45,max=Math.max(1,...values,...second,...(!bars?targets:[]))*1.18;
  const x=i=>L+i*(W-L-R)/(ids.length-1),y=v=>H-B-v/max*(H-T-B);
  const graph=svg('svg',{viewBox:`0 0 ${W} ${H}`,role:'img','aria-label':def.label+' за тижнями · демонстраційні дані'});
  graph.append(svg('title',{},def.label+' · '+(selected==='team'?'Уся команда':list[0].name)+' · демонстраційні дані'));
  for(let i=0;i<5;i++){const v=max*i/4,yy=y(v);graph.append(svg('line',{x1:L,y1:yy,x2:W-R,y2:yy,stroke:'#292929','stroke-dasharray':i?'3 6':'none'}),svg('text',{x:L-12,y:yy+4,fill:'#777','font-size':11,'text-anchor':'end'},format(v)))}
  if(!bars){
   graph.append(svg('polyline',{class:'cp-plan-line',points:targets.map((v,i)=>x(i)+','+y(v)).join(' '),fill:'none',stroke:'#b8b8b8','stroke-opacity':.8,'stroke-width':2,'stroke-dasharray':'6 6'}));
   for(let i=1;i<values.length;i++){const w=ids[i],state=Cycle.classify({value:values[i],previous:sum(list,[w-1],key)/def.divide,target:plan[w].target,phase:plan[w].phase});graph.append(svg('line',{x1:x(i-1),y1:y(values[i-1]),x2:x(i),y2:y(values[i]),stroke:state.color,'stroke-width':4,'data-trend':state.status}))}
  }
  ids.forEach((w,i)=>{
   const v=values[i],group=svg('g',{role:'button',tabindex:0,'aria-label':weekLabel(w)+', '+def.label+' '+format(v,1)+' '+def.unit});
   const state=Cycle.classify({value:v,previous:w?sum(list,[w-1],key)/def.divide:null,target:plan[w].target,phase:plan[w].phase});
   const tip=weekDates(w)+' · '+format(v,1)+' '+def.unit+' · '+state.label+' · план '+format(plan[w].target,1);group.append(svg('title',{},tip));group.setAttribute('data-status',state.status);
   if(bars){const width=Math.min(40,(W-L-R)/ids.length*(dual?.32:.52));group.append(svg('rect',{x:x(i)-(dual?width+2:width/2),y:y(v),width,height:y(0)-y(v),fill:dual?'#65ccb7':state.color,rx:3}));if(dual)group.append(svg('rect',{x:x(i)+2,y:y(second[i]),width,height:y(0)-y(second[i]),fill:'#FFC72C',rx:3}));}
   else{const width=Math.min(16,(W-L-R)/ids.length*.24);group.append(svg('rect',{class:'cp-candle',x:x(i)-width/2,y:y(v),width,height:y(0)-y(v),fill:state.color,'fill-opacity':.27,rx:2}));group.append(svg('circle',{cx:x(i),cy:y(v),r:w===week?7:4.5,fill:w===week?state.color:'#111',stroke:state.color,'stroke-width':2}));if(!mobile||ids.length===4||i%3===2)group.append(svg('text',{x:x(i),y:y(v)-15,'text-anchor':'middle','font-size':mobile?16:12,fill:state.color},format(v,1)));}
   group.append(svg('rect',{x:x(i)-22,y:T,width:44,height:H-T,fill:'transparent'}));
   const pick=()=>{week=w;render()};group.onclick=pick;group.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();pick()}};
   graph.append(group);if(!mobile||ids.length===4||i%2===0||i===ids.length-1)graph.append(svg('text',{x:x(i),y:H-15,fill:w===week?'#FFC72C':'#898989','text-anchor':'middle','font-size':mobile?16:12},weekLabel(w)));
  });
  $(host).replaceChildren(graph);
 }
 function render(){
  const list=active(),ids=indices();if(!ids.includes(week))week=ids[ids.length-1];
  $('cp-title').textContent=selected==='team'?'Огляд команди':list[0].name;
  $('cp-scope').textContent=selected==='team'?'TEAM OVERVIEW':'ATHLETE OVERVIEW · '+list[0].position.toUpperCase();
  $('cp-coverage').textContent=list.length+' '+(list.length===1?'гравець':'гравців')+' · '+ids.length+' тижнів · '+list.length*ids.length+' демо-записів';
  $('cp-metrics').replaceChildren();for(const key of ['distance','load','hsr','sprint','acc','dec']){const def=metrics[key],card=make('a',null,'cp-stat cp-stat-link');card.href=explorer.link(key);card.onclick=explorer.activate;card.setAttribute('aria-label','Детально: '+def.label);card.append(make('small',def.label+' · '+def.unit),make('strong',format(sum(list,ids,key)/def.divide,key==='distance'?1:0)),make('span','Дні · тижні · місяці ↗'));$('cp-metrics').append(card)}
  $('cp-chart-title').textContent=metrics[metric].label+' за тижнями';chart('cp-season-chart',metric);chart('cp-load-chart','load',{bars:true,compact:true});chart('cp-speed-chart','hsr',{bars:true,dual:true,compact:true});
  $('cp-week-detail').replaceChildren(make('b',weekLabel(week)+' · '+weekDates(week)),make('span',format(sum(list,[week],'distance')/1000,1)+' км'),make('span',format(sum(list,[week],'load'))+' a.u.'),make('span','HSR '+format(sum(list,[week],'hsr'))+' м'),make('span','Sprint '+format(sum(list,[week],'sprint'))+' м'));
  const def=metrics[metric],plan=targetPlan(metric),value=sum(list,[week],metric)/def.divide,previous=week?sum(list,[week-1],metric)/def.divide:null,state=Cycle.classify({value,previous,target:plan[week].target,phase:plan[week].phase});
  const phase=plan[week].phase==='unload'?'Розвантаження':plan[week].phase==='peak'?'Третя сходинка · пік':'Нарощування · сходинка '+plan[week].step;
  let streak=0;for(let i=week;i>0&&sum(list,[i],metric)>sum(list,[i-1],metric);i--)streak++;
  const analysis=$('cp-load-analysis');analysis.replaceChildren(make('strong','Цикл '+plan[week].cycle+' · '+phase),make('p',state.label+'. '+def.label+': '+format(value,1)+' '+def.unit+'; до попереднього тижня '+signed(Cycle.percent(value,previous))+'. План '+format(plan[week].target,1)+' '+def.unit+'; відхилення '+signed(Cycle.percent(value,plan[week].target))+'.'+(streak?' Послідовних підвищень: '+streak+'.':'')));
  analysis.style.borderLeftColor=state.color;
  const cycleIndex=Math.floor(week/4);if(cycleIndex>0){const peak=c=>Math.max(...[0,1,2].map(s=>sum(list,[c*4+s],metric)/def.divide)),low=c=>sum(list,[c*4+3],metric)/def.divide;analysis.append(make('p','Порівняння циклів '+cycleIndex+' → '+(cycleIndex+1)+': пік '+signed(Cycle.percent(peak(cycleIndex),peak(cycleIndex-1)))+'; тиждень розвантаження '+signed(Cycle.percent(low(cycleIndex),low(cycleIndex-1)))+'. Це динаміка демо-значень, а не оцінка відновлення.'))}
  const config=settings(metric);$('cp-base-label').firstChild.nodeValue='База W01, '+def.unit+' ';$('cp-plan-base').value=String(Math.round(config.base*1000)/1000);$('cp-plan-step').value=config.stepPct;$('cp-plan-cycle').value=config.cyclePct;$('cp-plan-unload').value=config.unloadPct;
  renderRoster();
  explorer.sync();
 }
 function renderRoster(){const query=$('cp-search').value.trim().toLocaleLowerCase('uk-UA'),list=players.filter(p=>p.name.toLocaleLowerCase('uk-UA').includes(query)),ids=indices();$('cp-roster-body').replaceChildren();for(const p of list){const row=make('tr');row.setAttribute('aria-selected',String(p.id===selected));const td=make('td'),button=make('button',null,'cp-player-link'),text=make('span',p.name);button.type='button';button.setAttribute('aria-label','Відкрити гравця '+p.name);text.append(make('small',p.position+' · демо'));button.append(make('span',p.name.split(' ').map(s=>s[0]).join(''),'cp-avatar'),text);button.onclick=()=>{choose(p.id);$('cp-title').scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})};td.append(button);row.append(td);for(const k of ['distance','load','hsr','sprint','acc','dec'])row.append(make('td',format(sum([p],ids,k)/(k==='distance'?1000:1),k==='distance'?1:0)));row.append(make('td',format(Math.max(...ids.map(i=>p.weeks[i].max)),1)));$('cp-roster-body').append(row)}$('cp-search-status').textContent=list.length?'Показано '+list.length+' із 8 демонстраційних гравців.':'Гравців не знайдено. Змініть пошуковий запит.';}
 for(const p of players)$('cp-player').add(new Option(p.name,p.id));
 const requested=new URL(location.href).searchParams.get('demoPlayer');if(players.some(p=>p.id===requested)){selected=requested;$('cp-player').value=requested}
 $('cp-player').onchange=e=>choose(e.target.value);$('cp-range').onchange=e=>{range=e.target.value;render()};$('cp-metric').onchange=e=>{metric=e.target.value;render()};$('cp-search').oninput=renderRoster;
 $('cp-import').onclick=()=>$('cp-import-dialog').showModal();$('cp-dialog-close').onclick=()=>$('cp-import-dialog').close();
 $('cp-plan-form').onsubmit=e=>{e.preventDefault();try{const config={base:Number($('cp-plan-base').value),stepPct:Number($('cp-plan-step').value),cyclePct:Number($('cp-plan-cycle').value),unloadPct:Number($('cp-plan-unload').value),weeks:12};Cycle.plan(config);plans.set(selected+'|'+metric,config);render();$('cp-plan-status').textContent='Пунктирний план оновлено. Фактичні демо-дані не змінено.'}catch(error){$('cp-plan-status').textContent=error.message}};
 let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(render,120)});
 $('menu-toggle-button').onclick=()=>{const open=$('main-sidebar').classList.toggle('active');$('menu-toggle-button').classList.toggle('is-open',open);$('menu-toggle-button').setAttribute('aria-expanded',String(open))};
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){$('main-sidebar').classList.remove('active');$('menu-toggle-button').classList.remove('is-open');$('menu-toggle-button').setAttribute('aria-expanded','false')}});
 explorer=window.PACCoachPerformanceDetail.create({players,metrics,getSelected:()=>selected});
 window.addEventListener('popstate',()=>{const id=new URL(location.href).searchParams.get('demoPlayer');selected=players.some(p=>p.id===id)?id:'team';$('cp-player').value=selected;render()});
 render();
})();
