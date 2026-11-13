/* Actual food is separate from the prescribed plan. All writes are owner scoped. */
(function(){
 'use strict';
 const C=window.PACFoodDiaryCore,db=firebase.firestore(),auth=firebase.auth();
 const lang=()=>{const l=String(localStorage.getItem('pac_lang')||'uk');return l==='ua'?'uk':l;},t=k=>window.PACFoodDiaryText(k,lang());
 const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
 const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
 let replacementTarget=null;
 let ctx=null,entries={},savedPlan={},ready=false,loading=false,error='',generation=0,saving=false,catalog=null,catalogPromise=null,dialog=null,selected=null,editing=null,tab='library',recent=[],favorites=[];
 const name=f=>f.names?.[lang()]||f.name;
 const locked=()=>!ctx||ctx.readOnly||ctx.date>today()||auth.currentUser?.uid!==ctx.uid;
 const project=()=>C.project(Object.values(ctx?.plan||{}).some(v=>Array.isArray(v)&&v.length)?ctx.plan:savedPlan,entries);
 const consumedPlan=()=>Object.values(ctx?.plan||{}).some(v=>Array.isArray(v)&&v.length)?Object.fromEntries(['brf','lnc','din'].map(slot=>[slot,(ctx?.plan?.[slot]||[]).filter(m=>m.eaten).map(m=>({uid:m.uid||'',eaten:true,kcal:m.kcal??null,p:m.p??null,f:m.f??null,c:m.c??null}))])):savedPlan;
 const planState=id=>{const e=Object.values(entries).find(e=>e.kind==='plan'&&e.plannedMealId===String(id));return e?!e.deleted:null;};
 const replacementFor=id=>Object.values(entries).filter(e=>!e.deleted&&e.kind==='replacement'&&e.plannedMealId===String(id)).sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt)))[0]||null;
 function personal(){try{recent=JSON.parse(localStorage.getItem('pac-food-recent:'+ctx.uid)||'[]').slice(0,25);favorites=JSON.parse(localStorage.getItem('pac-food-favorites:'+ctx.uid)||'[]').slice(0,40);if(!Array.isArray(recent)||!Array.isArray(favorites))throw Error();}catch{recent=[];favorites=[];}}
 function persistPersonal(){try{localStorage.setItem('pac-food-recent:'+ctx.uid,JSON.stringify(recent.slice(0,25)));localStorage.setItem('pac-food-favorites:'+ctx.uid,JSON.stringify(favorites.slice(0,40)));}catch{/* server receipt remains valid if personal shortcuts exceed local quota */}}
 function ensureHost(){let host=document.getElementById('food-diary');if(!host){host=el('section',undefined,'food-diary');host.id='food-diary';document.getElementById('diet-section')?.prepend(host);}return host;}
 function status(text){if(dialog){const node=dialog.querySelector('[data-status]');node.textContent=text;node.setAttribute('role','status');}}
 function render(){
   const host=ensureHost();host.replaceChildren();host.hidden=true;if(!ctx)return;
   const legacy=ready?project().entries.filter(e=>e.kind!=='plan'&&e.kind!=='replacement'):[];if(legacy.length){host.hidden=false;const details=el('details'),summary=el('summary',t('consumed'));details.append(summary);for(const e of legacy){const row=el('p',`${name(e.food)} · ≈ ${Math.round(e.kcal)} kcal `);for(const [key,fn]of [['edit',()=>open(e)],['remove',()=>remove(e)]]){const b=el('button',t(key),'recipe-food-link');b.type='button';b.disabled=locked()||saving;b.onclick=fn;row.append(b);}details.append(row);}host.append(details);document.getElementById('diet-tab-content')?.after(host);}
   if(!ready){host.hidden=false;const message=el('p',loading?t('loading'):t('loadError'));message.setAttribute('role',error?'alert':'status');host.append(message);if(!loading){const retry=el('button',t('refresh'));retry.type='button';retry.onclick=load;host.append(retry);}}
 }
 async function load(){
   if(!ctx)return;const version=++generation,owner=ctx.uid,date=ctx.date;loading=true;ready=false;error='';entries={};render();ctx.changed?.();
   try{const snap=await db.collection('athlete_nutrition_daily').where('userId','==',owner).where('date','==',date).get();if(version!==generation||ctx?.uid!==owner||ctx?.date!==date)return;
     const doc=snap.docs.find(d=>d.id===`${owner}_${date}`),data=doc?.data()||{};savedPlan=data.planConsumed||{};
     if(data.foodDiary&&data.foodDiary.version!==1)throw Error('unsupported-diary');
     if(['brf','lnc','din'].some(slot=>savedPlan[slot]!==undefined&&!Array.isArray(savedPlan[slot])))throw Error('invalid-plan-receipt');
     for(const [id,e]of Object.entries(data.foodDiary?.entries||{}))if(!e||e.version!==1||e.id!==id||e.userId!==owner||e.date!==date||!e.food||typeof e.food.name!=='string'||typeof e.createdAt!=='string'||C.number(e.kcal)===null)throw Error('invalid-entry');
     entries=Object.fromEntries(Object.entries(data.foodDiary?.entries||{}).filter(([id,e])=>e&&e.id===id&&e.userId===owner&&e.date===date));ready=true;
   }catch(e){if(version===generation)error=e.code||'read';}
   finally{if(version===generation){loading=false;render();ctx?.changed?.();}}
 }
 function connect(options){
   const change=!ctx||ctx.uid!==options.uid||ctx.date!==options.date;
   if(ctx?.uid!==options.uid){if(dialog){dialog.close();dialog.remove();dialog=null;}recent=[];favorites=[];}
   ctx={...options};if(change){personal();load();}else render();
 }
 function disconnect(){generation++;ctx=null;entries={};savedPlan={};ready=false;recent=[];favorites=[];if(dialog){dialog.close();dialog.remove();dialog=null;}ensureHost().replaceChildren();}
 async function library(){
   if(catalog)return catalog;if(catalogPromise)return catalogPromise;
   catalogPromise=(async()=>{const url=new URL('../assets/data/food-catalog.json',document.querySelector('script[src*="food-diary.js"]').src);const r=await fetch(url);if(!r.ok)throw Error('catalog');const data=await r.json();if(!Array.isArray(data.foods))throw Error('catalog');
     catalog=data.foods.map(f=>({...f,names:window.PACFoodDiaryFoodNames(f.name),source:data.source,release:data.release,url:'https://fdc.nal.usda.gov/food-details/'+f.id.replace('fdc-','')+'/nutrients',estimated:true}));
     const recipes=(window.PACSportRecipes?.meals()||[]).map(m=>({id:'recipe-'+m.recipeId,name:m.name_en,names:Object.fromEntries(['uk','en','de','es','ru','pt'].map(l=>[l,m['name_'+l]])),kcal:m.kcal*100/m.portionGrams,p:m.p*100/m.portionGrams,f:m.f*100/m.portionGrams,c:m.c*100/m.portionGrams,portions:[{name:t('portion'),g:m.portionGrams}],source:'ProAthleteCare',estimated:true}));catalog=[...recipes,...catalog];return catalog;
   })().catch(e=>{catalogPromise=null;throw e;});return catalogPromise;
 }
 function preview(){
   const form=dialog?.querySelector('form');if(!form||!selected)return;
   try{const food=form.elements.namedItem('manual').value==='true'?manualFood(form):selected,values=C.calculate(food,form.elements.namedItem('amount').value,form.elements.namedItem('unit').value,Number(form.elements.namedItem('portion').value));form.querySelector('[data-preview]').textContent=`≈ ${Math.round(values.kcal)} kcal · ${['p','f','c'].map(k=>`${t(k)}: ${values[k]===null?'—':values[k]+' '+t('g')}`).join(' · ')}`;}catch{form.querySelector('[data-preview]').textContent='—';}
 }
 function field(form,key,type='text',value=''){const wrap=el('div',undefined,'food-field food-field-'+key),label=el('label',t(key));const input=el('input');input.name=key;input.id='food-input-'+key;label.htmlFor=input.id;input.type=type;input.value=value;if(type==='number'){input.min='0';input.step='any';}wrap.append(label,input);form.append(wrap);return input;}
 function manualFood(form){return {id:editing?.food?.source==='manual'?editing.food.id:'manual-'+crypto.randomUUID(),basis:'portion',name:form.elements.namedItem('foodName').value.trim(),kcal:form.elements.namedItem('kcal').value===''?null:Number(form.elements.namedItem('kcal').value),p:form.elements.namedItem('p').value===''?null:Number(form.elements.namedItem('p').value),f:form.elements.namedItem('f').value===''?null:Number(form.elements.namedItem('f').value),c:form.elements.namedItem('c').value===''?null:Number(form.elements.namedItem('c').value),source:'manual',portions:[],estimated:true};}
 function choose(food,entry){
   selected=food;dialog.querySelector('[data-results]').hidden=true;for(const n of dialog.querySelectorAll('[data-search-controls]'))n.hidden=true;const host=dialog.querySelector('[data-selection]');host.replaceChildren();const back=el('button',t('search'),'food-diary-link');back.type='button';back.onclick=()=>{host.replaceChildren();for(const n of dialog.querySelectorAll('[data-search-controls]'))n.hidden=false;results();dialog.querySelector('[data-query]').focus();};host.append(back);const form=el('form');form.id='food-diary-form';form.dataset.entryId=entry?.id||replacementTarget?.entryId||crypto.randomUUID();form.onsubmit=e=>{e.preventDefault();save(form);};host.append(form);dialog.scrollTop=0;
   const manual=el('input');manual.name='manual';manual.type='hidden';manual.value=String(food.source==='manual');form.append(manual);
   if(food.source==='manual'){form.append(el('p',t('perServing'),'food-diary-note'));const n=field(form,'name','text',food.name);n.name='foodName';n.required=true;for(const key of ['kcal','p','f','c']){const input=field(form,key,'number',food[key]??'');if(key==='kcal')input.required=true;}}
   else{form.append(el('h4',name(food)));const source=el('p',`${t('estimate')} · ${food.source.startsWith('USDA')?'USDA 2021–2023':food.source}${food.country?' · '+food.country:''}`,'food-diary-note');if(food.url){const a=el('a',t('source'));a.href=food.url;a.target='_blank';a.rel='noopener noreferrer';source.append(document.createTextNode(' · '),a);}form.append(source);}
   const fluid=food.density>0,defaultAmount=food.basis==='portion'?1:fluid?/^Beer\b/i.test(food.name)?500:/^Wine\b/i.test(food.name)?150:100:food.portions?.length?1:100;
   const amount=field(form,'amount','number',entry?.food.id===food.id?entry.amount:defaultAmount);amount.min='0.1';amount.max='10000';amount.required=true;
   const unitWrap=el('div',undefined,'food-field'),unitLabel=el('label',t('unit'));unitLabel.htmlFor='food-diary-unit';const unit=el('select');unit.name='unit';unit.id='food-diary-unit';const units=food.basis==='portion'?['portion']:['g',...(fluid?['ml']:[]),...(food.portions?.length?['portion']:[])];for(const value of units){const o=el('option',t(value==='portion'?'portion':value));o.value=value;unit.append(o);}unit.value=units.includes(entry?.unit)?entry.unit:fluid?'ml':(units.includes('portion')?'portion':'g');unitWrap.append(unitLabel,unit);form.append(unitWrap);
   const portionWrap=el('div',undefined,'food-field food-field-wide'),portionLabel=el('label',t('portion'));portionLabel.htmlFor='food-diary-portion';const portion=el('select');portion.id='food-diary-portion';portion.name='portion';(food.portions||[]).forEach((p,i)=>{const o=el('option',`${p.name} · ${p.g} ${t('g')}`);o.value=String(i);portion.append(o);});if(!portion.options.length){const o=el('option',t('portion'));o.value='0';portion.append(o);}portion.value=String(entry?.portion||0);portionWrap.append(portionLabel,portion);form.append(portionWrap);const updateUnits=()=>{portionWrap.hidden=unit.value!=='portion'||food.basis==='portion';};unit.onchange=()=>{updateUnits();preview();};updateUnits();
   const slotWrap=el('div',undefined,'food-field food-field-wide'),slotLabel=el('label',t('meal'));slotLabel.htmlFor='food-diary-slot';const slot=el('select');slot.name='slot';slot.id='food-diary-slot';for(const value of ['brf','lnc','din','snack']){const o=el('option',t(value));o.value=value;slot.append(o);}slot.value=entry?.slot||(fluid?'snack':ctx.slot||'snack');slotWrap.append(slotLabel,slot);if(!replacementTarget)form.append(slotWrap);else slot.value=replacementTarget.slot;
   const replaceLabel=el('label',undefined,'food-diary-check'),replace=el('input');replace.type='checkbox';replace.name='replaceSlot';replace.checked=entry?entry.replaceSlot:slot.value!=='snack';replaceLabel.append(replace,document.createTextNode(t('replace')));if(!replacementTarget)form.append(replaceLabel);const updateSlot=()=>{replaceLabel.hidden=slot.value==='snack';if(slot.value==='snack')replace.checked=false;};slot.onchange=updateSlot;updateSlot();
   const favoriteLabel=el('label',undefined,'food-diary-check'),favorite=el('input');favorite.type='checkbox';favorite.name='favorite';favorite.checked=favorites.some(f=>f.id===food.id);favoriteLabel.append(favorite,document.createTextNode(t('favorite')));form.append(favoriteLabel);
   const p=el('p',undefined,'food-diary-note');p.dataset.preview='';form.append(p);form.oninput=preview;
   const saveButton=el('button',t('save'));saveButton.type='submit';saveButton.id='food-diary-save';form.append(saveButton);preview();
 }
 async function results(){
   const host=dialog?.querySelector('[data-results]');if(!host)return;host.hidden=false;host.replaceChildren();
   if(tab==='manual'){choose({id:'manual',name:'',source:'manual',basis:'portion',kcal:null,p:null,f:null,c:null},editing);return;}
   const owner=ctx?.uid;let foods;
   try{host.append(el('p',t('loading')));foods=tab==='recent'?recent:tab==='favorites'?favorites:await library();}catch{host.replaceChildren(el('p',t('catalogError')));return;}
   if(!dialog||ctx?.uid!==owner||host!==dialog.querySelector('[data-results]'))return;
   const query=dialog.querySelector('[data-query]').value;const found=C.search(foods,query,lang());host.replaceChildren();if(!found.length)host.append(el('p',t('noResults')));
   for(const f of found){
     if(!replacementTarget){const b=el('button',name(f),'food-search-result');b.type='button';b.onclick=()=>choose(f,editing);host.append(b);continue;}
     const row=el('div',undefined,'food-quick-row'),body=el('div'),title=el('strong',name(f)),detail=el('span');body.append(title,detail);
     const current=replacementFor(replacementTarget.id),matching=current?.food.id===f.id;
     let unit=f.basis==='portion'?'portion':f.density>0?'ml':f.portions?.length?'portion':'g',portion=Math.max(0,(f.portions||[]).findIndex(p=>p.name.toLowerCase().includes(f.name.replace(/ \(.*$/, '').toLowerCase()))),step=unit==='ml'?(/^Beer\b/i.test(f.name)?500:/^Wine\b/i.test(f.name)?150:250):unit==='g'?100:1;
     if(matching){unit=current.unit;portion=current.portion||0;if(current.quickStep>0)step=current.quickStep;else if(unit==='g')step=100;}
     let amount=matching&&current.consumed!==false?current.amount:0;
     const controls=el('div',undefined,'food-quick-controls'),minus=el('button','−'),count=el('output'),plus=el('button','+');minus.type=plus.type='button';minus.setAttribute('aria-label',t('decrease')+' '+name(f));plus.setAttribute('aria-label',t('increase')+' '+name(f));
     const portionLabel=()=>unit==='ml'?(step>=1000?step/1000+' '+t('litre'):step+' '+t('ml')):unit==='g'?step+' '+t('g'):f.portions?.[portion]?.g?Math.round(f.portions[portion].g)+' '+t('g')+' / '+t('portion'):t('portion');
     let size;const update=()=>{const value=C.calculate(f,Math.max(amount,step),unit,portion);detail.textContent=portionLabel()+' · ≈ '+Math.round(C.calculate(f,step,unit,portion).kcal)+' kcal';count.textContent=unit==='ml'?(amount>=1000?Number((amount/1000).toFixed(2))+' '+t('litre'):amount+' '+t('ml')):unit==='g'?amount+' '+t('g'):Number(amount.toFixed(2))+' ×';minus.disabled=amount<=0;row.dataset.amount=amount;};
     if(unit==='ml'||unit==='portion'&&f.portions?.length>1){size=el('select');size.className='food-quick-size';size.setAttribute('aria-label',t('portion')+' '+name(f));const sizes=unit==='ml'?[250,330,500,1000]:f.portions.map((_,i)=>i);if(unit==='ml'&&!sizes.includes(step))sizes.push(step);for(const v of sizes){const o=el('option',unit==='ml'?(v>=1000?v/1000+' '+t('litre'):v+' '+t('ml')):f.portions[v].name+' · '+Math.round(f.portions[v].g)+' '+t('g'));o.value=v;size.append(o);}size.value=unit==='ml'?step:portion;size.onchange=()=>{if(unit==='ml')step=Number(size.value);else portion=Number(size.value);amount=0;update();};body.append(size);}
     const change=async delta=>{if(saving||locked())return;const next=Math.max(0,Number((amount+delta*step).toFixed(2))),target={...replacementTarget},owner=ctx.uid,date=ctx.date,previous=replacementFor(target.id);for(const b of dialog.querySelectorAll('button'))b.disabled=true;status(t('loading'));
       try{const value={...C.entry({id:target.entryId,userId:owner,date,food:f,amount:next||step,unit,portion,slot:target.slot,createdAt:previous?.createdAt}),kind:'replacement',plannedMealId:target.id,consumed:next>0,quickStep:step};if(!await persist(value.id,value))return;if(ctx?.uid!==owner||ctx?.date!==date)return;recent=[value.food,...recent.filter(x=>x.id!==f.id)].slice(0,25);persistPersonal();status('');await results();}
       catch{status(t('saveError'));}finally{if(dialog){for(const b of dialog.querySelectorAll('button'))b.disabled=false;await results();}} 
     };minus.onclick=()=>change(-1);plus.onclick=()=>change(1);controls.append(minus,count,plus);update();row.append(body,controls);host.append(row);
   }
 }
 function open(entry,target=null){
   replacementTarget=target;
   if(locked()||!ready)return;if(dialog){dialog.remove();dialog=null;}
   editing=entry||null;selected=null;tab='library';dialog=el('dialog',undefined,'food-diary-dialog');dialog.id='food-diary-dialog';dialog.setAttribute('aria-labelledby','food-diary-dialog-title');
   const heading=el('div',undefined,'food-diary-heading'),h=el('h3',target?t('own'):entry?t('edit'):t('add'));h.id='food-diary-dialog-title';const close=el('button',t('close'));close.type='button';close.onclick=()=>dialog.close();heading.append(h,close);dialog.append(heading);
   const searchLabel=el('label',t('search'));searchLabel.dataset.searchControls='';searchLabel.htmlFor='food-diary-query';const query=el('input');query.id='food-diary-query';query.dataset.searchControls='';query.dataset.query='';query.type='search';query.placeholder=t('hint');query.oninput=()=>results();dialog.append(searchLabel,query);
   const tabs=el('div',undefined,'food-diary-tabs');tabs.dataset.searchControls='';for(const key of ['library','recent','favorites','manual']){const b=el('button',t(key));b.type='button';b.dataset.foodTab=key;b.onclick=()=>{tab=key;dialog.querySelector('[data-selection]').replaceChildren();results();};tabs.append(b);}dialog.append(tabs);
   const result=el('div',undefined,'food-search-results');result.dataset.results='';const selection=el('div');selection.dataset.selection='';const message=el('p');message.dataset.status='';message.setAttribute('aria-live','polite');dialog.append(result,selection,message);const sourceDetails=el('details',undefined,'food-source-details'),sourceSummary=el('summary',t('source'));sourceDetails.append(sourceSummary,el('p',t('sourceNote'),'food-diary-note'));dialog.append(sourceDetails);
   const attribution=el('a','USDA FoodData Central · CC0');attribution.href='https://fdc.nal.usda.gov/download-datasets/';attribution.target='_blank';attribution.rel='noopener noreferrer';sourceDetails.append(attribution);
   dialog.addEventListener('cancel',e=>{if(saving)e.preventDefault();});document.body.append(dialog);dialog.showModal();if(entry&&!target){result.hidden=true;choose(entry.food,entry);}else{if(entry)query.value=name(entry.food);results();}
 }
 async function persist(id,value){
   if(locked()||!ready||saving)throw Error('read-only');const owner=ctx.uid,date=ctx.date,version=generation;
   if(!entries[id]&&Object.keys(entries).length>=200)throw Error('limit');saving=true;render();
   try{await db.collection('athlete_nutrition_daily').doc(`${owner}_${date}`).set({userId:owner,date,planConsumed:consumedPlan(),foodDiary:{version:1,entries:{[id]:value}},updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
     if(ctx?.uid!==owner||ctx?.date!==date||auth.currentUser?.uid!==owner||generation!==version)return false;
     await load();if(ctx?.uid!==owner||ctx?.date!==date||auth.currentUser?.uid!==owner)return false;if(!ready)return true; // Canonical entry has a server receipt; retrying must not duplicate it.
     const p=project(),planned=['brf','lnc','din'].flatMap(slot=>(ctx.plan?.[slot]||[]).map(m=>({m,slot}))),done=planned.filter(({m,slot})=>replacementFor(m.uid)?replacementFor(m.uid).consumed!==false:m.eaten||planState(m.uid)===true||p.replacedSlots.includes(slot)).length;
     try{await db.collection('athlete_nutrition_daily').doc(`${owner}_${date}`).set({userId:owner,date,eatenKcal:p.kcal,...(planned.length?{completionPct:Math.round(done/planned.length*100)}:{}),targetKcal:Number(ctx.targetKcal)||0,actualNutrition:{version:1,kcal:p.kcal,p:p.p,f:p.f,c:p.c,unknown:p.unknown},updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});}catch{/* Derived cache is optional; raw entries remain canonical and are recomputed on read. */}
     if(ctx?.uid!==owner||ctx?.date!==date||auth.currentUser?.uid!==owner)return false;
     try{localStorage.setItem('pac_nutrition_updated_at',String(Date.now()));}catch{}window.dispatchEvent(new CustomEvent('pac:nutrition-updated',{detail:{userId:owner,date}}));return true;
   }finally{saving=false;render();ctx?.changed?.();}
 }
 async function save(form){
   if(saving||locked())return;const owner=ctx.uid,id=form.dataset.entryId,food=form.elements.namedItem('manual').value==='true'?manualFood(form):selected;let entry;
   try{entry=C.entry({id,userId:owner,date:ctx.date,food,amount:form.elements.namedItem('amount').value,unit:form.elements.namedItem('unit').value,portion:Number(form.elements.namedItem('portion').value),slot:replacementTarget?.slot||form.elements.namedItem('slot').value,replaceSlot:replacementTarget?false:form.elements.namedItem('replaceSlot').checked,createdAt:editing?.createdAt});if(replacementTarget)Object.assign(entry,{kind:'replacement',plannedMealId:replacementTarget.id,consumed:true});else if(editing?.kind==='plan')Object.assign(entry,{kind:'plan',plannedMealId:editing.plannedMealId});}catch{status(t('invalid'));return;}
   const submit=form.querySelector('[type=submit]');submit.disabled=true;status(t('loading'));
   try{if(!await persist(id,entry))return;if(ctx?.uid!==owner)return;recent=[entry.food,...recent.filter(f=>f.id!==entry.food.id)].slice(0,25);favorites=favorites.filter(f=>f.id!==entry.food.id);if(form.elements.namedItem('favorite').checked)favorites.unshift(entry.food);persistPersonal();dialog?.close();}
   catch{status(t('saveError'));}finally{submit.disabled=false;}
 }
 async function remove(entry){if(locked()||saving||!confirm(t('deleteQ')))return;try{await persist(entry.id,{...entry,deleted:true,updatedAt:new Date().toISOString()});}catch{error='save';const host=ensureHost();const p=el('p',t('saveError'));p.setAttribute('role','alert');host.append(p);}}
 async function togglePlan(meal,slot,desired){
   if(locked()||!ready||saving)return false;const replacement=replacementFor(meal.uid);if(replacement){try{return await persist(replacement.id,{...replacement,consumed:typeof desired==='boolean'?desired:replacement.consumed===false,updatedAt:new Date().toISOString()});}catch{return false;}}const owner=ctx.uid,date=ctx.date,version=generation,state=planState(meal.uid),next=typeof desired==='boolean'?desired:!(state===null?meal.eaten:state),previous=Object.values(entries).find(e=>e.kind==='plan'&&e.plannedMealId===String(meal.uid));
   const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(String(meal.uid))),id=previous?.id||'plan-'+Array.from(new Uint8Array(hash)).slice(0,16).map(n=>n.toString(16).padStart(2,'0')).join('');
   if(ctx?.uid!==owner||ctx?.date!==date||version!==generation||locked())return false;
   const food={id:'planned-'+meal.uid,basis:'portion',name:meal.name_en||meal.name||t('recipe'),names:Object.fromEntries(['uk','en','de','es','ru','pt'].map(l=>[l,meal['name_'+l]||meal.name])),kcal:meal.kcal,p:meal.p??null,f:meal.f??null,c:meal.c??null,source:'ProAthleteCare',estimated:true};
   const e={...C.entry({id,userId:ctx.uid,date:ctx.date,food,amount:1,unit:'portion',slot,createdAt:previous?.createdAt}),kind:'plan',plannedMealId:String(meal.uid),deleted:!next};
   try{return await persist(id,e);}catch{const p=el('p',t('saveError'));p.setAttribute('role','alert');ensureHost().append(p);return false;}
 }
 async function capturePlan(){if(locked()||!ready||saving)return false;const owner=ctx.uid,date=ctx.date;for(const slot of ['brf','lnc','din'])for(const meal of [...(ctx.plan?.[slot]||[])])if(meal.eaten&&!replacementFor(meal.uid)&&planState(meal.uid)===null){if(ctx?.uid!==owner||ctx?.date!==date||!await togglePlan(meal,slot,true))return false;}return true;}
 async function openReplacement(meal,slot){if(locked()||!ready||saving)return;const owner=ctx.uid,date=ctx.date,hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(String(meal.uid)));if(ctx?.uid!==owner||ctx?.date!==date)return;const id='replacement-'+Array.from(new Uint8Array(hash)).slice(0,16).map(n=>n.toString(16).padStart(2,'0')).join('');open(replacementFor(meal.uid),{id:String(meal.uid),slot,entryId:id});}
 async function restore(meal){const e=replacementFor(meal.uid);if(e&&!locked()&&!saving)try{await persist(e.id,{...e,deleted:true,updatedAt:new Date().toISOString()});}catch{error='save';render();}}
 window.PACFoodDiary={openReplacement,replacementFor,restore,connect,disconnect,projection:()=>ready?project():null,isReady:()=>ready,isBusy:()=>saving,open,reload:load,planState,togglePlan,capturePlan};
 auth.onAuthStateChanged(user=>{if(!user||ctx&&user.uid!==ctx.authUid)disconnect();});
 window.addEventListener('pac:lang-changed',()=>{if(dialog?.open)dialog.close();render();});
})();
