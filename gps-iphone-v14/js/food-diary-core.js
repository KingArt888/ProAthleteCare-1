(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PACFoodDiaryCore=api;})(typeof window==='object'?window:globalThis,function(){
  'use strict';
  const slots=['brf','lnc','din','snack'],metrics=['kcal','p','f','c'];
  const number=v=>v===null||v===undefined||v===''?null:Number.isFinite(Number(v))&&Number(v)>=0?Number(v):null;
  function calculate(food,amount,unit,portion=0){
    if(metrics.some(k=>food[k]!==null&&food[k]!==undefined&&food[k]!==''&&(number(food[k])===null||number(food[k])>50000)))throw Error('nutrition');
    const n=number(amount);if(n===null||n<=0||n>10000)throw Error('quantity');
    let grams;if(food.basis==='portion'&&unit==='portion')grams=null;else if(unit==='g')grams=n;else if(unit==='ml'&&number(food.density)>0)grams=n*food.density;else if(unit==='portion'&&number(food.portions?.[portion]?.g)>0)grams=n*food.portions[portion].g;else throw Error('unit');
    if(grams>20000)throw Error('quantity');
    const values=Object.fromEntries(metrics.map(k=>[k,number(food[k])===null?null:Number((food[k]*(grams===null?n:grams/100)).toFixed(2))]));
    if(values.kcal===null||metrics.some(k=>values[k]!==null&&values[k]>50000))throw Error('nutrition');
    return {grams:grams===null?null:Number(grams.toFixed(2)),...values};
  }
  function entry({id,userId,date,food,amount,unit,portion=0,slot='snack',replaceSlot=false,now=new Date().toISOString(),createdAt}){
    if(!/^[a-zA-Z0-9_-]{1,100}$/.test(id||'')||!userId||!/^\d{4}-\d{2}-\d{2}$/.test(date||'')||new Date(date+'T12:00:00Z').toISOString().slice(0,10)!==date||!slots.includes(slot)||!String(food.name||'').trim())throw Error('identity');
    const values=calculate(food,amount,unit,portion);
    return {version:1,id,userId,date,slot,replaceSlot:slot!=='snack'&&Boolean(replaceSlot),deleted:false,amount:Number(amount),unit,portion,food:{id:String(food.id||'manual').slice(0,100),basis:food.basis||'100g',name:String(food.name||'').slice(0,500),names:food.names||{},kcal:number(food.kcal),p:number(food.p),f:number(food.f),c:number(food.c),density:number(food.density),portions:(food.portions||[]).slice(0,4),source:String(food.source||'manual').slice(0,200),url:/^https:\/\//.test(food.url||'')?food.url:'',country:food.country||'',release:food.release||'',estimated:food.estimated!==false},...values,createdAt:createdAt||now,updatedAt:now};
  }
  function project(plan={},entries={}){
    const records=Object.values(entries).filter(e=>e&&e.version===1&&slots.includes(e.slot));
    const actual=records.filter(e=>!e.deleted),seen=new Set(records.filter(e=>e.kind==='plan'&&e.plannedMealId).map(e=>String(e.plannedMealId)));
    const replaced=new Set(actual.filter(e=>e.kind!=='plan'&&e.replaceSlot).map(e=>e.slot));
    const replacements=new Map();for(const e of actual.filter(e=>e.kind==='replacement'&&e.plannedMealId).sort((a,b)=>String(a.updatedAt).localeCompare(String(b.updatedAt))))replacements.set(String(e.plannedMealId),e);
    const planned=['brf','lnc','din'].flatMap(slot=>replaced.has(slot)?[]:(plan[slot]||[]).filter(m=>m.eaten&&!replacements.has(String(m.uid))&&(!m.uid||!seen.has(String(m.uid)))));
    const totals={kcal:0,p:0,f:0,c:0},unknown={kcal:false,p:false,f:false,c:false};
    for(const row of [...planned,...actual.filter(e=>e.consumed!==false&&(e.kind==='replacement'?replacements.get(String(e.plannedMealId))===e:e.kind==='plan'?!replaced.has(e.slot)&&!replacements.has(String(e.plannedMealId)):true))])for(const k of metrics){const v=number(row[k]);if(v===null)unknown[k]=true;else totals[k]+=v;}
    metrics.forEach(k=>totals[k]=Number(totals[k].toFixed(2)));
    return {...totals,unknown,entries:actual,replacedSlots:[...replaced],replacedMealIds:[...replacements.keys()],consumedReplacementMealIds:[...replacements].filter(([,e])=>e.consumed!==false).map(([id])=>id),plannedCount:planned.length};
  }
  function normal(s){return String(s||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[’']/g,'').trim();}
  // Native-language query aliases; original USDA descriptions remain available as source text.
  const terms=[
    ['beer','пиво','bier','cerveza','cerveja'],['nonalcoholic beer','безалкогольне пиво','безалкогольное пиво','alkoholfreies bier','cerveza sin alcohol','cerveja sem alcool'],['wine','вино','wein','vino','vinho'],['vodka','горілка','водка','wodka'],['whiskey','віскі','виски','whisky'],
    ['gyro','донер','дьонер','шаурма','шаверма','döner','doner','kebab','gyros'],['mcdonald','макдональдс','макдональд','mcdonalds'],['big mac','біг мак','биг мак'],
    ['pizza','піца','пицца'],['cheeseburger','чізбургер','чизбургер','käseburger'],['hamburger','гамбургер'],['french fries','картопля фрі','картофель фри','pommes','patatas fritas','batatas fritas'],
    ['cottage cheese','творог','кисломолочний сир','quark','requesón'],['cheese','сир','сыр','käse','queso','queijo'],['chicken','курка','курица','hähnchen','pollo','frango'],['turkey','індичка','индейка','pute','pavo','peru'],
    ['egg','яйця','яйца','eier','huevo','ovo'],['rice','рис','reis','arroz'],['buckwheat','гречка','гречневая','buchweizen','sarraceno'],['oatmeal','вівсянка','овсянка','hafer','avena','aveia'],
    ['milk','молоко','milch','leche','leite'],['yogurt','йогурт','joghurt','yogur','iogurte'],['banana','банан','plátano'],['apple','яблуко','яблоко','apfel','manzana','maçã'],
    ['bread','хліб','хлеб','brot','pan','pão'],['salmon','лосось','сьомга','семга','lachs','salmón','salmão'],['tuna','тунець','тунец','thunfisch','atún','atum'],['beef','яловичина','говядина','rind','ternera','carne bovina'],
    ['pork','свинина','schwein','cerdo','porco'],['potato','картопля','картофель','kartoffel','patata','batata'],['chocolate','шоколад','schokolade','chocolate'],['coffee','кава','кофе','kaffee','café'],['water','вода','wasser','agua','água'],['juice','сік','сок','saft','zumo','suco'],
    ['fish','риба','рыба','fisch','pescado','peixe'],['pasta','макарони','макароны','nudeln','massa'],['shrimp','креветки','garnelen','gambas','camarao'],['tofu','тофу'],['lentil','сочевиця','чечевица','linsen','lentejas','lentilhas'],['bean','квасоля','фасоль','bohnen','alubias','feijao'],['nut','горіхи','орехи','nusse','nueces','nozes'],['tomato','помідор','помидор','tomate'],['cucumber','огірок','огурец','gurke','pepino'],['carrot','морква','морковь','karotte','zanahoria','cenoura'],['broccoli','броколі','брокколи','brokkoli','brocoli','brocolis'],['salad','салат','salat','ensalada','salada'],['soup','суп','suppe','sopa'],['ice cream','морозиво','мороженое','eiscreme','helado','sorvete'],['cake','торт','kuchen','pastel','bolo'],['cooked','варений','варена','варене','вареный','вареная','вареное','gekocht','cocido','cozido'],['raw','сирий','сира','сырое','сырой','сырая','roh','crudo','cru'],['fried','смажена','смажений','жареный','жареная','gebraten','frito'],['red','червоне','красное','rot','tinto'],['white','біле','белое','weiss','blanco','branco']
  ];
  function search(foods,query,lang='en'){
    const raw=normal(query);if(!raw)return foods.slice(0,30);
    const alias=terms.find(row=>row.some(t=>normal(t)===raw));
    let q=alias?alias[0]:' '+raw.replace(/[^\p{L}\p{N}\s]/gu,' ')+' ';
    if(!alias){const alternatives=terms.flatMap(row=>row.slice(1).map(a=>[normal(a),row[0]])).sort((a,b)=>b[0].length-a[0].length);for(const [from,to]of alternatives)q=q.split(' '+from+' ').join(' '+to+' ');q=q.trim();if(q===raw&&raw.length>=3){const partial=terms.find(row=>row.slice(1).some(a=>normal(a).startsWith(raw)));if(partial)q=partial[0];}}
    const tokens=q.split(/\s+/);
    return foods.map(f=>{const title=normal(f.names?.[lang]||f.name),source=normal(f.name),text=title+' '+source;const hit=text.includes(raw)||tokens.every(t=>text.includes(t));return {f,score:hit?(title===raw||source===q?100:title.startsWith(raw)||source.startsWith(q)?70:30):0};}).filter(x=>x.score).sort((a,b)=>b.score-a.score||a.f.name.length-b.f.name.length).slice(0,50).map(x=>x.f);
  }
  return {number,calculate,entry,project,search,normal};
});
