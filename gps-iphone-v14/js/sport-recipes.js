/* Approximate nutrition per listed serving. Cooked ingredients are weighed after cooking.
   Stable IDs separate new recipes from saved legacy meals; old plans are never rewritten. */
(function(){
  const langs=['uk','en','de','es','ru','pt'];
  const translated=a=>Object.fromEntries(langs.map((l,i)=>[l,a[i]]));
  const food=(names,p,f,c)=>({names:translated(names),p,f,c});
  const foods={
    quark:food(['Кисломолочний сир 2%','Quark 2%','Quark 2%','Queso fresco batido 2%','Творог 2%','Queijo quark 2%'],12,2,4),
    skyr:food(['Натуральний Skyr','Plain Skyr','Skyr natur','Skyr natural','Натуральный Skyr','Skyr natural'],11,0.2,4),
    oats:food(['Вівсяні пластівці, сухі','Oats, dry','Haferflocken, trocken','Copos de avena, secos','Овсяные хлопья, сухие','Flocos de aveia, secos'],13,7,60),
    berries:food(['Ягоди','Berries','Beeren','Frutos rojos','Ягоды','Frutas vermelhas'],1,0.5,10),
    banana:food(['Банан без шкірки','Peeled banana','Banane ohne Schale','Plátano pelado','Банан без кожуры','Banana sem casca'],1,0.3,23),
    bread:food(['Цільнозерновий хліб','Wholegrain bread','Vollkornbrot','Pan integral','Цельнозерновой хлеб','Pão integral'],9,3,43),
    egg:food(['Варені яйця без шкаралупи','Boiled eggs, shelled','Gekochte Eier ohne Schale','Huevos cocidos sin cáscara','Варёные яйца без скорлупы','Ovos cozidos sem casca'],13,11,1),
    spinach:food(['Шпинат','Spinach','Spinat','Espinacas','Шпинат','Espinafre'],3,0.4,2),
    tomato:food(['Помідори','Tomatoes','Tomaten','Tomates','Помидоры','Tomates'],1,0.2,4),
    chicken:food(['Готова куряча грудка без шкіри','Cooked skinless chicken breast','Gegarte Hähnchenbrust ohne Haut','Pechuga de pollo cocida sin piel','Готовая куриная грудка без кожи','Peito de frango cozido sem pele'],31,3.6,0),
    turkey:food(['Готова грудка індички','Cooked turkey breast','Gegarte Putenbrust','Pechuga de pavo cocida','Готовая грудка индейки','Peito de peru cozido'],29,2,0),
    tofu:food(['Твердий тофу','Firm tofu','Fester Tofu','Tofu firme','Твёрдый тофу','Tofu firme'],14,8,2),
    tuna:food(['Тунець у власному соку, без рідини','Tuna in water, drained','Thunfisch in Wasser, abgetropft','Atún al natural, escurrido','Тунец в собственном соку, без жидкости','Atum ao natural, escorrido'],25,1,0),
    salmon:food(['Готовий лосось','Cooked salmon','Gegarter Lachs','Salmón cocido','Готовый лосось','Salmão cozido'],22,12,0),
    rice:food(['Рис, варений','Rice, cooked','Reis, gekocht','Arroz, cocido','Рис, варёный','Arroz, cozido'],2.7,0.3,28),
    quinoa:food(['Кіноа, варена','Quinoa, cooked','Quinoa, gekocht','Quinoa, cocida','Киноа, варёная','Quinoa, cozida'],4.4,1.9,21),
    pasta:food(['Цільнозернова паста, варена','Wholegrain pasta, cooked','Vollkornnudeln, gekocht','Pasta integral, cocida','Цельнозерновая паста, варёная','Massa integral, cozida'],5,1.5,27),
    lentils:food(['Сочевиця, варена','Lentils, cooked','Linsen, gekocht','Lentejas, cocidas','Чечевица, варёная','Lentilhas, cozidas'],9,0.4,20),
    beans:food(['Квасоля, варена','Beans, cooked','Bohnen, gekocht','Alubias, cocidas','Фасоль, варёная','Feijão, cozido'],8,0.5,21),
    potato:food(['Картопля, варена','Potatoes, cooked','Kartoffeln, gekocht','Patatas, cocidas','Картофель, варёный','Batatas, cozidas'],2,0.1,18),
    broccoli:food(['Броколі, готова','Broccoli, cooked','Brokkoli, gegart','Brócoli, cocido','Брокколи, готовая','Brócolis, cozido'],3,0.4,5),
    zucchini:food(['Кабачок','Zucchini','Zucchini','Calabacín','Кабачок','Abobrinha'],1.2,0.3,3),
    oil:food(['Оливкова олія','Olive oil','Olivenöl','Aceite de oliva','Оливковое масло','Azeite'],0,100,0),
    nuts:food(['Волоські горіхи','Walnuts','Walnüsse','Nueces','Грецкие орехи','Nozes'],15,65,14),
    yogurt:food(['Грецький йогурт 2%','Greek yogurt 2%','Griechischer Joghurt 2%','Yogur griego 2%','Греческий йогурт 2%','Iogurte grego 2%'],10,2,4),
    soyYogurt:food(['Натуральний соєвий йогурт','Plain soy yogurt','Sojajoghurt natur','Yogur de soja natural','Натуральный соевый йогурт','Iogurte de soja natural'],4,2.3,2),
    apple:food(['Яблуко без серцевини','Apple, cored','Apfel ohne Kerngehäuse','Manzana sin corazón','Яблоко без сердцевины','Maçã sem caroço'],0.3,0.2,14),
    pear:food(['Груша без серцевини','Pear, cored','Birne ohne Kerngehäuse','Pera sin corazón','Груша без сердцевины','Pera sem caroço'],0.4,0.1,15),
    seeds:food(['Гарбузове насіння','Pumpkin seeds','Kürbiskerne','Semillas de calabaza','Тыквенные семечки','Sementes de abóbora'],30,49,11),
    buckwheat:food(['Гречка, варена','Buckwheat, cooked','Buchweizen, gekocht','Trigo sarraceno, cocido','Гречка, варёная','Trigo-sarraceno, cozido'],3.4,0.6,20),
    bulgur:food(['Булгур, варений','Bulgur, cooked','Bulgur, gekocht','Bulgur, cocido','Булгур, варёный','Bulgur, cozido'],3.1,0.2,19),
    chickpeas:food(['Нут, варений','Chickpeas, cooked','Kichererbsen, gekocht','Garbanzos, cocidos','Нут, варёный','Grão-de-bico, cozido'],8.9,2.6,27),
    cod:food(['Готова тріска без кісток','Cooked boneless cod','Gegarter Kabeljau ohne Gräten','Bacalao cocido sin espinas','Готовая треска без костей','Bacalhau fresco cozido sem espinhas'],23,1,0),
    beef:food(['Готова нежирна яловичина','Cooked lean beef','Gegartes mageres Rindfleisch','Ternera magra cocida','Готовая нежирная говядина','Carne bovina magra cozida'],28,7,0),
    carrot:food(['Морква','Carrots','Karotten','Zanahorias','Морковь','Cenouras'],1,0.2,9),
    pepper:food(['Солодкий перець','Sweet peppers','Paprika','Pimientos dulces','Сладкий перец','Pimentões'],1,0.3,6),
    mushroom:food(['Печериці','Button mushrooms','Champignons','Champiñones','Шампиньоны','Cogumelos'],3,0.3,3)
  };
  const methods={
    bowl:translated(['Змішай інгредієнти. Ягоди вимий; заморожені використовуй за вказівками на упаковці. Подавай охолодженим.','Mix the ingredients. Wash berries; follow pack instructions for frozen berries. Serve chilled.','Zutaten vermischen. Beeren waschen; bei Tiefkühlbeeren die Packungsangaben beachten. Gekühlt servieren.','Mezcla los ingredientes. Lava las frutas; sigue el envase si están congeladas. Sirve frío.','Смешай ингредиенты. Ягоды вымой; замороженные используй по инструкции на упаковке. Подавай охлаждённым.','Misture os ingredientes. Lave as frutas; siga a embalagem para frutas congeladas. Sirva frio.']),
    toast:translated(['Наріж готові інгредієнти й виклади на хліб. Овочі вимий. Використовуй уже варені яйця або повністю готове м’ясо.','Slice prepared ingredients and arrange on bread. Wash vegetables. Use already boiled eggs or fully cooked meat.','Vorbereitete Zutaten schneiden und auf das Brot legen. Gemüse waschen. Bereits gekochte Eier oder durchgegartes Fleisch verwenden.','Corta los ingredientes preparados y colócalos sobre el pan. Lava las verduras. Usa huevos ya cocidos o carne completamente cocinada.','Нарежь готовые ингредиенты и выложи на хлеб. Овощи вымой. Используй уже варёные яйца или полностью готовое мясо.','Corte os ingredientes preparados e coloque sobre o pão. Lave os vegetais. Use ovos já cozidos ou carne completamente cozida.']),
    pan:translated(['Наріж овочі. Прогрій на сковороді з указаною олією, додай решту готових інгредієнтів і добре прогрій. Крупи та м’ясо зважуються готовими.','Chop vegetables. Heat in a pan with the listed oil, add the remaining prepared ingredients and heat thoroughly. Weigh grains and meat after cooking.','Gemüse schneiden und mit dem angegebenen Öl in der Pfanne garen. Übrige vorbereitete Zutaten zugeben und gründlich erhitzen. Getreide und Fleisch gegart wiegen.','Corta las verduras y cocínalas con el aceite indicado. Añade los demás ingredientes preparados y calienta bien. Pesa cereales y carne ya cocidos.','Нарежь овощи, прогрей с указанным маслом. Добавь остальные готовые ингредиенты и хорошо прогрей. Крупы и мясо взвешиваются готовыми.','Corte os vegetais e cozinhe com o azeite indicado. Junte os demais ingredientes preparados e aqueça bem. Pese cereais e carne depois de cozidos.']),
    bake:translated(['Наріж або розімни інгредієнти, змішай та виклади у форму. Запікай при 180 °C до м’якості та повного прогрівання. М’ясо, риба й крупи мають бути вже готовими.','Chop or mash ingredients, mix and place in a baking dish. Bake at 180 °C until tender and heated through. Meat, fish and grains must already be cooked.','Zutaten schneiden oder zerdrücken, mischen und in eine Form geben. Bei 180 °C backen, bis alles weich und vollständig erhitzt ist. Fleisch, Fisch und Getreide müssen bereits gegart sein.','Corta o tritura los ingredientes, mezcla y coloca en una fuente. Hornea a 180 °C hasta que estén tiernos y bien calientes. Carne, pescado y cereales deben estar ya cocidos.','Нарежь или разомни ингредиенты, смешай и выложи в форму. Запекай при 180 °C до мягкости и полного прогревания. Мясо, рыба и крупы должны быть уже готовыми.','Corte ou amasse os ingredientes, misture e coloque numa assadeira. Asse a 180 °C até ficarem macios e bem aquecidos. Carne, peixe e cereais devem estar já cozidos.'])
  };
  const db={breakfasts:[],lunches:[],dinners:[]};
  function add(id,slot,speed,names,items,method,minutes){
    const totals=items.reduce((a,[key,g])=>{for(const k of ['p','f','c'])a[k]+=foods[key][k]*g/100;return a;},{p:0,f:0,c:0});
    const grams=items.reduce((s,x)=>s+x[1],0);
    const m={recipeId:id,recipeVersion:1,speed,...totals,kcal:Math.round(totals.p*4+totals.f*9+totals.c*4),ingredients:items.map(([key,grams])=>({key,grams,names:foods[key].names})),instructions:methods[method],minutes,portionUnit:'g',portionValue:grams,portionGrams:grams,recipeScale:1};
    for(const k of ['p','f','c'])m[k]=Math.round(m[k]);langs.forEach((l,i)=>m['name_'+l]=names[i]);m.name=m.name_uk;db[slot].push(m);
  }
  add('quark-berries','breakfasts','Easy',['Сир з ягодами та вівсянкою','Quark, berries and oats','Quark mit Beeren und Haferflocken','Queso fresco con frutos rojos y avena','Творог с ягодами и овсянкой','Quark com frutas vermelhas e aveia'],[['quark',200],['berries',100],['oats',40]],'bowl',5);
  add('skyr-banana','breakfasts','Easy',['Skyr з бананом і горіхами','Skyr with banana and walnuts','Skyr mit Banane und Walnüssen','Skyr con plátano y nueces','Skyr с бананом и орехами','Skyr com banana e nozes'],[['skyr',250],['banana',120],['nuts',15],['oats',30]],'bowl',5);
  add('egg-toast','breakfasts','Medium',['Тост з яйцями та шпинатом','Egg and spinach toast','Ei-Spinat-Toast','Tostada con huevo y espinacas','Тост с яйцами и шпинатом','Torrada com ovos e espinafre'],[['bread',80],['egg',120],['spinach',50],['tomato',100]],'toast',10);
  add('turkey-toast','breakfasts','Medium',['Тост з індичкою та сиром','Turkey and quark toast','Puten-Quark-Toast','Tostada con pavo y queso fresco','Тост с индейкой и творогом','Torrada com peru e quark'],[['bread',80],['turkey',80],['quark',60],['tomato',100]],'toast',10);
  add('baked-oat-quark','breakfasts','Hard',['Вівсяна запіканка з сиром і бананом','Baked oats with quark and banana','Haferauflauf mit Quark und Banane','Avena al horno con queso fresco y plátano','Овсяная запеканка с творогом и бананом','Aveia assada com quark e banana'],[['quark',180],['oats',50],['banana',100]],'bake',25);
  add('tofu-breakfast','breakfasts','Hard',['Тофу зі шпинатом і тостом','Tofu with spinach and toast','Tofu mit Spinat und Toast','Tofu con espinacas y tostada','Тофу со шпинатом и тостом','Tofu com espinafre e torrada'],[['tofu',180],['spinach',80],['tomato',100],['bread',60],['oil',5]],'pan',15);
  add('tuna-rice','lunches','Easy',['Рисовий боул з тунцем','Tuna rice bowl','Thunfisch-Reis-Bowl','Bol de arroz con atún','Рисовый боул с тунцом','Bowl de arroz com atum'],[['tuna',130],['rice',200],['tomato',150],['oil',8]],'pan',10);
  add('chicken-quinoa','lunches','Easy',['Курка з кіноа та броколі','Chicken with quinoa and broccoli','Hähnchen mit Quinoa und Brokkoli','Pollo con quinoa y brócoli','Курица с киноа и брокколи','Frango com quinoa e brócolis'],[['chicken',130],['quinoa',180],['broccoli',150],['oil',5]],'pan',10);
  add('turkey-pasta','lunches','Medium',['Цільнозернова паста з індичкою','Wholegrain pasta with turkey','Vollkornnudeln mit Pute','Pasta integral con pavo','Цельнозерновая паста с индейкой','Massa integral com peru'],[['turkey',140],['pasta',200],['tomato',150],['oil',8]],'pan',15);
  add('tofu-lentil','lunches','Medium',['Тофу з сочевицею та овочами','Tofu with lentils and vegetables','Tofu mit Linsen und Gemüse','Tofu con lentejas y verduras','Тофу с чечевицей и овощами','Tofu com lentilhas e vegetais'],[['tofu',150],['lentils',180],['zucchini',150],['oil',5]],'pan',15);
  add('salmon-potato','lunches','Hard',['Лосось з картоплею та броколі','Salmon with potatoes and broccoli','Lachs mit Kartoffeln und Brokkoli','Salmón con patatas y brócoli','Лосось с картофелем и брокколи','Salmão com batatas e brócolis'],[['salmon',140],['potato',250],['broccoli',150],['oil',5]],'bake',25);
  add('chicken-beans','lunches','Hard',['Курка з квасолею та кабачком','Chicken with beans and zucchini','Hähnchen mit Bohnen und Zucchini','Pollo con alubias y calabacín','Курица с фасолью и кабачком','Frango com feijão e abobrinha'],[['chicken',120],['beans',180],['zucchini',200],['oil',8]],'bake',25);
  add('quark-toast','dinners','Easy',['Сир з овочами та цільнозерновим хлібом','Quark with vegetables and wholegrain bread','Quark mit Gemüse und Vollkornbrot','Queso fresco con verduras y pan integral','Творог с овощами и цельнозерновым хлебом','Quark com vegetais e pão integral'],[['quark',250],['bread',80],['tomato',150],['oil',5]],'toast',5);
  add('tuna-beans','dinners','Easy',['Тунець з квасолею та томатами','Tuna with beans and tomatoes','Thunfisch mit Bohnen und Tomaten','Atún con alubias y tomates','Тунец с фасолью и томатами','Atum com feijão e tomate'],[['tuna',120],['beans',180],['tomato',150],['oil',8]],'pan',10);
  add('turkey-rice','dinners','Medium',['Індичка з рисом і броколі','Turkey with rice and broccoli','Pute mit Reis und Brokkoli','Pavo con arroz y brócoli','Индейка с рисом и брокколи','Peru com arroz e brócolis'],[['turkey',140],['rice',180],['broccoli',180],['oil',5]],'pan',15);
  add('tofu-quinoa','dinners','Medium',['Тофу з кіноа та шпинатом','Tofu with quinoa and spinach','Tofu mit Quinoa und Spinat','Tofu con quinoa y espinacas','Тофу с киноа и шпинатом','Tofu com quinoa e espinafre'],[['tofu',180],['quinoa',180],['spinach',100],['oil',5]],'pan',15);
  add('chicken-vegetables','dinners','Hard',['Куряча запіканка з овочами та картоплею','Chicken, vegetable and potato bake','Hähnchen-Gemüse-Kartoffel-Auflauf','Pollo al horno con verduras y patatas','Куриная запеканка с овощами и картофелем','Frango assado com vegetais e batatas'],[['chicken',140],['potato',200],['zucchini',150],['tomato',100],['oil',8]],'bake',25);
  add('salmon-lentils','dinners','Hard',['Лосось з сочевицею та шпинатом','Salmon with lentils and spinach','Lachs mit Linsen und Spinat','Salmón con lentejas y espinacas','Лосось с чечевицей и шпинатом','Salmão com lentilhas e espinafre'],[['salmon',120],['lentils',180],['spinach',100],['oil',5]],'bake',25);
  // Complete measured combinations, not renamed duplicates. Titles list the actual components.
  function namesFor(items){return langs.map(l=>items.map(([key])=>foods[key].names[l]).join(' + '));}
  const fruitBases=[
    [['quark',200],['oats',35]], [['skyr',250],['oats',40]], [['yogurt',250],['oats',40]],
    [['quark',180],['nuts',15]], [['skyr',220],['seeds',20]],
    [['soyYogurt',250],['oats',50],['seeds',30]], [['soyYogurt',300],['oats',45],['nuts',15],['seeds',20]]
  ];
  fruitBases.forEach((base,i)=>['apple','pear'].forEach(fruit=>{const items=[...base,[fruit,130]];add('fruit-'+i+'-'+fruit,'breakfasts','Easy',namesFor(items),items,'bowl',5);}));
  const toastBases=[['chicken',100],['turkey',110],['tuna',100],['egg',130],['tofu',180],['quark',200],['lentils',220]];
  toastBases.forEach(([protein,grams],i)=>['tomato','spinach'].forEach(veg=>{const items=[[protein,grams],['bread',80],[veg,80]];add('toast-'+i+'-'+veg,'breakfasts','Medium',namesFor(items),items,'toast',10);}));
  const bakeBases=[
    [['quark',200],['oats',45]], [['skyr',250],['oats',45]], [['yogurt',250],['oats',45]],
    [['quark',200],['rice',120]], [['skyr',250],['rice',120]],
    [['soyYogurt',250],['oats',50],['seeds',30]], [['soyYogurt',300],['oats',50],['nuts',15],['seeds',20]]
  ];
  bakeBases.forEach((base,i)=>['apple','pear'].forEach(fruit=>{const items=[...base,[fruit,120]];add('baked-fruit-'+i+'-'+fruit,'breakfasts','Hard',namesFor(items),items,'bake',25);}));
  const proteins=[['chicken',130],['turkey',140],['cod',160],['beef',130],['tofu',180],['lentils',220],['chickpeas',220]];
  const grains=['rice','quinoa','pasta','buckwheat','bulgur','potato'],vegetables=['broccoli','zucchini','carrot','pepper','mushroom','spinach'];
  for(const [slot,offset]of [['lunches',0],['dinners',3]])proteins.forEach(([protein,amount],i)=>grains.forEach((grain,j)=>{
    const veg=vegetables[(i+j+offset)%vegetables.length],speed=['Easy','Medium','Hard'][(i+j)%3];
    const items=[[protein,amount],[grain,protein==='lentils'||protein==='chickpeas'?120:180],[veg,150],['oil',5]];
    add(slot+'-'+protein+'-'+grain,slot,speed,namesFor(items),items,speed==='Hard'?'bake':'pan',speed==='Easy'?10:speed==='Medium'?15:25);
  }));
  const dairy=['quark','skyr','yogurt'],fish=['tuna','salmon','cod'],meat=['chicken','turkey','beef'];
  for(const meal of Object.values(db).flat()){
    const keys=meal.ingredients.map(i=>i.key),has=group=>group.some(k=>keys.includes(k));
    meal.allergens=[...(has(dairy)?['milk']:[]),...(has(fish)?['fish']:[]),...(keys.includes('egg')?['egg']:[]),...(has(['tofu','soyYogurt'])?['soy']:[]),...(has(['bread','pasta','bulgur','oats'])?['gluten']:[]),...(keys.includes('nuts')?['nuts']:[])];
    meal.diet=has(meat)||has(fish)?'omnivore':has(dairy)||keys.includes('egg')?'vegetarian':'vegan';
    meal.tags=[meal.diet, ...(has(['lentils','beans','chickpeas'])?['legumes']:[]),...(meal.p>=25?['protein']:[])];
  }
  window.PACSportRecipes={
    meals:()=>Object.values(db).flat(),
    allows:(meal,prefs={})=>(prefs.diet!=='vegan'||meal.diet==='vegan')&&(prefs.diet!=='vegetarian'||meal.diet!=='omnivore')&&!(prefs.exclude||[]).some(a=>(meal.allergens||[]).includes(a))
  };
  // Replace only the generator catalogue. Saved plans keep their original names, totals and eaten flags.
  Object.assign(dietDatabase,db);
})();
