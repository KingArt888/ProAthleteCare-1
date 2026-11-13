/* Design preview. Synthetic fixtures only: no authentication, network, storage or imported files. */
(function(){
 'use strict';
 const $=id=>document.getElementById(id),NS='http://www.w3.org/2000/svg';
 const names=['Артем Коваль','Максим Бондар','Данило Мельник','Олексій Шевченко','Ілля Ткаченко','Назар Мороз','Роман Савчук','Денис Петренко'];
 const positions=['Центральний захисник','Крайній захисник','Півзахисник','Нападник','Півзахисник','Крайній нападник','Захисник','Нападник'];
 const weights=[.91,1.07,1.13,1.02,1.05,.98,.89,1.09],cycles=[.81,.96,1.09,.91,1.03,.78,1.12,.99,1.07,.94];
 const players=names.map((name,p)=>({id:'demo-'+p,name,position:positions[p],weeks:cycles.map((c,w)=>{const f=c*weights[p]*(1+.035*Math.sin(p+w));return{distance:Math.round(26400*f),load:Math.round(1630*f),hsr:Math.round(1520*f*(1+.08*Math.cos(w+p))),sprint:Math.round(380*f*(1+.13*Math.sin(w+p))),acc:Math.round(142*f),dec:Math.round(136*f),max:Math.round((28.5+p*.35+Math.sin(w+p)*1.1)*10)/10}})}));
 const metrics={distance:{label:'Дистанція',unit:'км',color:'#FFC72C',divide:1000},load:{label:'Player Load',unit:'a.u.',color:'#FFC72C',divide:1},hsr:{label:'HSR',unit:'м',color:'#65ccb7',divide:1},sprint:{label:'Sprint',unit:'м',color:'#FFC72C',divide:1},acc:{label:'Прискорення',unit:'подій',color:'#FFC72C',divide:1},dec:{label:'Гальмування',unit:'подій',color:'#65ccb7',divide:1}};
 const format=(n,digits=0)=>new Intl.NumberFormat('uk-UA',{maximumFractionDigits:digits}).format(n);
 let selected='team',range='all',metric='distance',week=9;
 const weekLabel=i=>'W'+String(i+1).padStart(2,'0');
 const weekDates=i=>{const d=new Date(Date.UTC(2026,7,3+i*7)),end=new Date(+d+6*86400000);const f=x=>x.toLocaleDateString('uk-UA',{day:'2-digit',month:'2-digit',timeZone:'UTC'});return f(d)+'–'+f(end)};
 function indices(){return Array.from({length:range==='4'?4:10},(_,i)=>i+(range==='4'?6:0))}
 function active(){return selected==='team'?players:players.filter(p=>p.id===selected)}
 function sum(list,ids,key){return list.reduce((total,p)=>total+ids.reduce((n,w)=>n+p.weeks[w][key],0),0)}
 function svg(tag,attrs={},text){const e=document.createElementNS(NS,tag);for(const [k,v]of Object.entries(attrs))e.setAttribute(k,v);if(text!=null)e.textContent=text;return e}
 function make(tag,text,cls){const e=document.createElement(tag);if(text!=null)e.textContent=text;if(cls)e.className=cls;return e}
 function choose(id){selected=id;$('cp-player').value=id;const u=new URL(location.href);if(id==='team')u.searchParams.delete('demoPlayer');else u.searchParams.set('demoPlayer',id);history.replaceState({},'',u);render()}
 function chart(host,key,{bars=false,dual=false,compact=false}={}){
  const ids=indices(),list=active(),def=metrics[key],values=ids.map(w=>sum(list,[w],key)/def.divide),second=dual?ids.map(w=>sum(list,[w],'sprint')):[];
  const W=compact?650:1000,H=compact?260:310,L=58,R=compact?38:24,T=24,B=45,max=Math.max(1,...values,...second)*1.18;
  const x=i=>L+i*(W-L-R)/(ids.length-1),y=v=>H-B-v/max*(H-T-B);
  const graph=svg('svg',{viewBox:`0 0 ${W} ${H}`,role:'img','aria-label':def.label+' за тижнями · демонстраційні дані'});
  graph.append(svg('title',{},def.label+' · '+(selected==='team'?'Уся команда':list[0].name)+' · демонстраційні дані'));
  for(let i=0;i<5;i++){const v=max*i/4,yy=y(v);graph.append(svg('line',{x1:L,y1:yy,x2:W-R,y2:yy,stroke:'#292929','stroke-dasharray':i?'3 6':'none'}),svg('text',{x:L-12,y:yy+4,fill:'#777','font-size':11,'text-anchor':'end'},format(v)))}
  if(!bars){
   const defs=svg('defs'),gradient=svg('linearGradient',{id:'cp-fill-'+key,x1:0,y1:0,x2:0,y2:1});gradient.append(svg('stop',{offset:'0%','stop-color':def.color,'stop-opacity':.2}),svg('stop',{offset:'100%','stop-color':def.color,'stop-opacity':0}));defs.append(gradient);graph.append(defs);
   graph.append(svg('path',{d:`M${x(0)},${y(0)} L`+values.map((v,i)=>x(i)+','+y(v)).join(' L')+` L${x(values.length-1)},${y(0)} Z`,fill:'url(#cp-fill-'+key+')'}));
   graph.append(svg('polyline',{points:values.map((v,i)=>x(i)+','+y(v)).join(' '),fill:'none',stroke:def.color,'stroke-width':3.5,'stroke-linejoin':'round'}));
  }
  ids.forEach((w,i)=>{
   const v=values[i],group=svg('g',{role:'button',tabindex:0,'aria-label':weekLabel(w)+', '+def.label+' '+format(v,1)+' '+def.unit});
   const tip=weekDates(w)+' · '+format(v,1)+' '+def.unit;group.append(svg('title',{},tip));
   if(bars){const width=Math.min(40,(W-L-R)/ids.length*(dual?.32:.52));group.append(svg('rect',{x:x(i)-(dual?width+2:width/2),y:y(v),width,height:y(0)-y(v),fill:dual?'#65ccb7':'#ad8a2d',rx:3}));if(dual)group.append(svg('rect',{x:x(i)+2,y:y(second[i]),width,height:y(0)-y(second[i]),fill:'#FFC72C',rx:3}));}
   else{group.append(svg('circle',{cx:x(i),cy:y(v),r:w===week?7:4.5,fill:w===week?'#FFC72C':'#111',stroke:def.color,'stroke-width':2}));group.append(svg('text',{x:x(i),y:y(v)-15,'text-anchor':'middle','font-size':12,fill:'#e0d4ad'},format(v,1)));}
   group.append(svg('rect',{x:x(i)-22,y:T,width:44,height:H-T,fill:'transparent'}));
   const pick=()=>{week=w;render()};group.onclick=pick;group.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();pick()}};
   graph.append(group,svg('text',{x:x(i),y:H-15,fill:w===week?'#FFC72C':'#898989','text-anchor':'middle','font-size':12},weekLabel(w)));
  });
  $(host).replaceChildren(graph);
 }
 function render(){
  const list=active(),ids=indices();if(!ids.includes(week))week=ids[ids.length-1];
  $('cp-title').textContent=selected==='team'?'Огляд команди':list[0].name;
  $('cp-scope').textContent=selected==='team'?'TEAM OVERVIEW':'ATHLETE OVERVIEW · '+list[0].position.toUpperCase();
  $('cp-coverage').textContent=list.length+' '+(list.length===1?'гравець':'гравців')+' · '+ids.length+' тижнів · '+list.length*ids.length+' демо-записів';
  $('cp-metrics').replaceChildren();for(const key of ['distance','load','hsr','sprint','acc','dec']){const def=metrics[key],card=make('article',null,'cp-stat');card.append(make('small',def.label+' · '+def.unit),make('strong',format(sum(list,ids,key)/def.divide,key==='distance'?1:0)),make('span','За вибраний період'));$('cp-metrics').append(card)}
  $('cp-chart-title').textContent=metrics[metric].label+' за тижнями';chart('cp-season-chart',metric);chart('cp-load-chart','load',{bars:true,compact:true});chart('cp-speed-chart','hsr',{bars:true,dual:true,compact:true});
  $('cp-week-detail').replaceChildren(make('b',weekLabel(week)+' · '+weekDates(week)),make('span',format(sum(list,[week],'distance')/1000,1)+' км'),make('span',format(sum(list,[week],'load'))+' a.u.'),make('span','HSR '+format(sum(list,[week],'hsr'))+' м'),make('span','Sprint '+format(sum(list,[week],'sprint'))+' м'));
  renderRoster();
 }
 function renderRoster(){const query=$('cp-search').value.trim().toLocaleLowerCase('uk-UA'),list=players.filter(p=>p.name.toLocaleLowerCase('uk-UA').includes(query)),ids=indices();$('cp-roster-body').replaceChildren();for(const p of list){const row=make('tr');row.setAttribute('aria-selected',String(p.id===selected));const td=make('td'),button=make('button',null,'cp-player-link'),text=make('span',p.name);button.type='button';button.setAttribute('aria-label','Відкрити гравця '+p.name);text.append(make('small',p.position+' · демо'));button.append(make('span',p.name.split(' ').map(s=>s[0]).join(''),'cp-avatar'),text);button.onclick=()=>{choose(p.id);$('cp-title').scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})};td.append(button);row.append(td);for(const k of ['distance','load','hsr','sprint','acc','dec'])row.append(make('td',format(sum([p],ids,k)/(k==='distance'?1000:1),k==='distance'?1:0)));row.append(make('td',format(Math.max(...ids.map(i=>p.weeks[i].max)),1)));$('cp-roster-body').append(row)}$('cp-search-status').textContent=list.length?'Показано '+list.length+' із 8 демонстраційних гравців.':'Гравців не знайдено. Змініть пошуковий запит.';}
 for(const p of players)$('cp-player').add(new Option(p.name,p.id));
 const requested=new URL(location.href).searchParams.get('demoPlayer');if(players.some(p=>p.id===requested)){selected=requested;$('cp-player').value=requested}
 $('cp-player').onchange=e=>choose(e.target.value);$('cp-range').onchange=e=>{range=e.target.value;render()};$('cp-metric').onchange=e=>{metric=e.target.value;render()};$('cp-search').oninput=renderRoster;
 $('cp-import').onclick=()=>$('cp-import-dialog').showModal();$('cp-dialog-close').onclick=()=>$('cp-import-dialog').close();
 $('menu-toggle-button').onclick=()=>{const open=$('main-sidebar').classList.toggle('active');$('menu-toggle-button').classList.toggle('is-open',open);$('menu-toggle-button').setAttribute('aria-expanded',String(open))};
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){$('main-sidebar').classList.remove('active');$('menu-toggle-button').classList.remove('is-open');$('menu-toggle-button').setAttribute('aria-expanded','false')}});
 render();
})();
