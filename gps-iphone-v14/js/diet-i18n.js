(function () {
  const LANGS = ["uk", "en", "de", "es", "ru", "pt"];

  function fixMojibake(value) {
    const raw = String(value || "");
    if (!/[ÐÑÃâ]/.test(raw)) return raw;
    try {
      return decodeURIComponent(escape(raw));
    } catch {
      return raw;
    }
  }

  const breakfasts = [
    ["Зернистий сир (200г) + 1 яблуко", "Cottage cheese (200 g) + 1 apple", "Hüttenkäse (200 g) + 1 Apfel", "Requesón (200 g) + 1 manzana", "Зерненый творог (200 г) + 1 яблоко", "Cottage cheese (200 g) + 1 maçã"],
    ["Сендвіч: цільнозерновий + моцарела (50г)", "Whole-grain sandwich + mozzarella (50 g)", "Vollkorn-Sandwich + Mozzarella (50 g)", "Sándwich integral + mozzarella (50 g)", "Цельнозерновой сэндвич + моцарелла (50 г)", "Sanduíche integral + muçarela (50 g)"],
    ["Протеїновий шейк (300мл) + банан", "Protein shake (300 ml) + banana", "Proteinshake (300 ml) + Banane", "Batido de proteína (300 ml) + plátano", "Протеиновый шейк (300 мл) + банан", "Shake proteico (300 ml) + banana"],
    ["Йогурт Skyr (200г) + лохина", "Skyr yogurt (200 g) + blueberries", "Skyr-Joghurt (200 g) + Blaubeeren", "Yogur Skyr (200 g) + arándanos", "Йогурт Skyr (200 г) + голубика", "Iogurte Skyr (200 g) + mirtilos"],
    ["3 рисові хлібці з Рікотою (60г)", "3 rice cakes with ricotta (60 g)", "3 Reiswaffeln mit Ricotta (60 g)", "3 tortitas de arroz con ricotta (60 g)", "3 рисовых хлебца с рикоттой (60 г)", "3 bolachas de arroz com ricota (60 g)"],
    ["Мигдаль (30г) + батончик PAC", "Almonds (30 g) + PAC bar", "Mandeln (30 g) + PAC-Riegel", "Almendras (30 g) + barrita PAC", "Миндаль (30 г) + батончик PAC", "Amêndoas (30 g) + barra PAC"],
    ["Хліб з висівками + паштет тунця (80г)", "Bran bread + tuna pate (80 g)", "Kleiebrot + Thunfischpaste (80 g)", "Pan con salvado + paté de atún (80 g)", "Хлеб с отрубями + паштет из тунца (80 г)", "Pão com farelo + patê de atum (80 g)"],
    ["Сир 5% (200г) з ягодами (100г)", "Cottage cheese 5% (200 g) with berries (100 g)", "Quark 5% (200 g) mit Beeren (100 g)", "Requesón 5% (200 g) con bayas (100 g)", "Творог 5% (200 г) с ягодами (100 г)", "Cottage cheese 5% (200 g) com frutas vermelhas (100 g)"],
    ["Ветчина індички (100г) + 2 хлібці", "Turkey ham (100 g) + 2 crispbreads", "Putenschinken (100 g) + 2 Knäckebrote", "Jamón de pavo (100 g) + 2 panes crujientes", "Ветчина индейки (100 г) + 2 хлебца", "Presunto de peru (100 g) + 2 torradas crocantes"],
    ["Кеш'ю (20г) + сухофрукти + кефір", "Cashews (20 g) + dried fruit + kefir", "Cashews (20 g) + Trockenfrüchte + Kefir", "Anacardos (20 g) + fruta seca + kéfir", "Кешью (20 г) + сухофрукты + кефир", "Castanha de caju (20 g) + frutas secas + kefir"],
    ["Вівсянка швидка + 1 сосиска PAC", "Quick oatmeal + 1 PAC sausage", "Schnelle Haferflocken + 1 PAC-Würstchen", "Avena rápida + 1 salchicha PAC", "Быстрая овсянка + 1 сосиска PAC", "Aveia rápida + 1 salsicha PAC"],
    ["Твердий сир (50г) + хлібці (3 шт)", "Hard cheese (50 g) + crispbreads (3 pcs)", "Hartkäse (50 g) + Knäckebrote (3 Stk.)", "Queso curado (50 g) + panes crujientes (3 uds.)", "Твердый сыр (50 г) + хлебцы (3 шт.)", "Queijo curado (50 g) + torradas crocantes (3 un.)"],
    ["М'який сир 0% + паста арахісова", "Soft cheese 0% + peanut butter", "Frischkäse 0% + Erdnussbutter", "Queso fresco 0% + crema de cacahuete", "Мягкий творог 0% + арахисовая паста", "Queijo fresco 0% + pasta de amendoim"],
    ["Чіа-пудинг (заготовлений)", "Chia pudding (prepared)", "Chia-Pudding (vorbereitet)", "Pudin de chía (preparado)", "Чиа-пудинг (готовый)", "Pudim de chia (preparado)"],
    ["Омлет (3 яйця) з авокадо + тост", "Omelet (3 eggs) with avocado + toast", "Omelett (3 Eier) mit Avocado + Toast", "Tortilla (3 huevos) con aguacate + tostada", "Омлет (3 яйца) с авокадо + тост", "Omelete (3 ovos) com abacate + torrada"],
    ["Вівсяноблін з сиром (50г)", "Oat pancake with cheese (50 g)", "Haferpfannkuchen mit Käse (50 g)", "Tortita de avena con queso (50 g)", "Овсяноблин с сыром (50 г)", "Panqueca de aveia com queijo (50 g)"],
    ["Яєчня-глазунья (3 яйця) з томатами", "Fried eggs (3 eggs) with tomatoes", "Spiegeleier (3 Eier) mit Tomaten", "Huevos fritos (3 huevos) con tomates", "Яичница-глазунья (3 яйца) с томатами", "Ovos fritos (3 ovos) com tomate"],
    ["Лаваш з моцарелою на грилі", "Grilled lavash with mozzarella", "Gegrillter Lavash mit Mozzarella", "Lavash a la parrilla con mozzarella", "Лаваш с моцареллой на гриле", "Lavash grelhado com muçarela"],
    ["Гарячий тост з яйцем та беконом", "Hot toast with egg and bacon", "Warmer Toast mit Ei und Speck", "Tostada caliente con huevo y beicon", "Горячий тост с яйцом и беконом", "Torrada quente com ovo e bacon"],
    ["Вівсянка на воді + 1 варене яйце", "Oatmeal with water + 1 boiled egg", "Haferflocken mit Wasser + 1 gekochtes Ei", "Avena con agua + 1 huevo cocido", "Овсянка на воде + 1 вареное яйцо", "Aveia com água + 1 ovo cozido"],
    ["Омлет з кабачками та 2 яйцями", "Omelet with zucchini and 2 eggs", "Omelett mit Zucchini und 2 Eiern", "Tortilla con calabacín y 2 huevos", "Омлет с кабачками и 2 яйцами", "Omelete com abobrinha e 2 ovos"],
    ["Панкейки вівсяні (3 шт)", "Oat pancakes (3 pcs)", "Hafer-Pancakes (3 Stk.)", "Panqueques de avena (3 uds.)", "Овсяные панкейки (3 шт.)", "Panquecas de aveia (3 un.)"],
    ["Сирний лаваш з зеленню (обсмажений)", "Cheese lavash with herbs (toasted)", "Käse-Lavash mit Kräutern (gebraten)", "Lavash de queso con hierbas (tostado)", "Сырный лаваш с зеленью (обжаренный)", "Lavash de queijo com ervas (tostado)"],
    ["Бутерброд з авокадо та куркою", "Sandwich with avocado and chicken", "Sandwich mit Avocado und Hähnchen", "Bocadillo con aguacate y pollo", "Бутерброд с авокадо и курицей", "Sanduíche com abacate e frango"],
    ["Скрембл з тофу та грибами", "Tofu scramble with mushrooms", "Tofu-Rührei mit Pilzen", "Revuelto de tofu con champiñones", "Скрембл из тофу с грибами", "Tofu mexido com cogumelos"],
    ["Запечене яблуко з сиром", "Baked apple with cottage cheese", "Bratapfel mit Quark", "Manzana al horno con requesón", "Запеченное яблоко с творогом", "Maçã assada com cottage cheese"],
    ["Омлет білковий з лососем (30г)", "Egg-white omelet with salmon (30 g)", "Eiweiß-Omelett mit Lachs (30 g)", "Tortilla de claras con salmón (30 g)", "Белковый омлет с лососем (30 г)", "Omelete de claras com salmão (30 g)"],
    ["Шакшука (2 яйця) з фетою", "Shakshuka (2 eggs) with feta", "Shakshuka (2 Eier) mit Feta", "Shakshuka (2 huevos) con feta", "Шакшука (2 яйца) с фетой", "Shakshuka (2 ovos) com feta"],
    ["Кіш з куркою та шпинатом", "Quiche with chicken and spinach", "Quiche mit Hähnchen und Spinat", "Quiche con pollo y espinacas", "Киш с курицей и шпинатом", "Quiche com frango e espinafre"],
    ["Домашня гранола з йогуртом", "Homemade granola with yogurt", "Hausgemachtes Granola mit Joghurt", "Granola casera con yogur", "Домашняя гранола с йогуртом", "Granola caseira com iogurte"],
    ["Сирна запіканка (250г) з манкою", "Cottage cheese casserole (250 g) with semolina", "Quarkauflauf (250 g) mit Grieß", "Pastel de requesón (250 g) con sémola", "Творожная запеканка (250 г) с манкой", "Caçarola de cottage cheese (250 g) com sêmola"],
    ["Полента з сиром та грибами", "Polenta with cheese and mushrooms", "Polenta mit Käse und Pilzen", "Polenta con queso y champiñones", "Полента с сыром и грибами", "Polenta com queijo e cogumelos"],
    ["Млинці цільнозернові з сиром", "Whole-grain crepes with cottage cheese", "Vollkorn-Pfannkuchen mit Quark", "Crepes integrales con requesón", "Цельнозерновые блины с творогом", "Crepes integrais com cottage cheese"],
    ["Бургер PAC: цільнозерновий з куркою", "PAC burger: whole-grain with chicken", "PAC-Burger: Vollkorn mit Hähnchen", "Hamburguesa PAC: integral con pollo", "Бургер PAC: цельнозерновой с курицей", "Hambúrguer PAC: integral com frango"],
    ["Пиріг зі шпинатом та фетою", "Pie with spinach and feta", "Kuchen mit Spinat und Feta", "Pastel con espinacas y feta", "Пирог со шпинатом и фетой", "Torta com espinafre e feta"],
    ["Картопляні зрази з м'ясом", "Potato zrazy with meat", "Kartoffel-Zrazy mit Fleisch", "Zrazy de patata con carne", "Картофельные зразы с мясом", "Zrazy de batata com carne"],
    ["Вівсянка запечена з грушею", "Baked oatmeal with pear", "Gebackene Haferflocken mit Birne", "Avena horneada con pera", "Запеченная овсянка с грушей", "Aveia assada com pera"],
    ["Оладки з печінки + салат", "Liver fritters + salad", "Leberküchlein + Salat", "Tortitas de hígado + ensalada", "Оладьи из печени + салат", "Bolinhos de fígado + salada"],
    ["Пшоно з морепродуктами у вершках", "Millet with seafood in cream sauce", "Hirse mit Meeresfrüchten in Sahnesauce", "Mijo con mariscos en salsa de nata", "Пшено с морепродуктами в сливках", "Painço com frutos do mar ao molho cremoso"],
    ["Тофу смажений з овочами", "Fried tofu with vegetables", "Gebratener Tofu mit Gemüse", "Tofu salteado con verduras", "Жареный тофу с овощами", "Tofu salteado com legumes"]
  ];

  const lunches = [
    ["Тунець (130г) у лаваші", "Tuna (130 g) in lavash", "Thunfisch (130 g) im Lavash", "Atún (130 g) en lavash", "Тунец (130 г) в лаваше", "Atum (130 g) no lavash"],
    ["Салат з нутом та овочами", "Salad with chickpeas and vegetables", "Salat mit Kichererbsen und Gemüse", "Ensalada con garbanzos y verduras", "Салат с нутом и овощами", "Salada com grão-de-bico e legumes"],
    ["Куряче філе + мікс салат", "Chicken fillet + mixed salad", "Hähnchenfilet + gemischter Salat", "Filete de pollo + ensalada mixta", "Куриное филе + микс салата", "Filé de frango + salada mista"],
    ["Сендвіч з індичкою та сиром", "Turkey and cheese sandwich", "Sandwich mit Pute und Käse", "Sándwich de pavo y queso", "Сэндвич с индейкой и сыром", "Sanduíche de peru e queijo"],
    ["Сочевичний суп + грінка", "Lentil soup + toast", "Linsensuppe + Toast", "Sopa de lentejas + tostada", "Чечевичный суп + гренка", "Sopa de lentilha + torrada"],
    ["Булгур з готовою куркою (100г)", "Bulgur with cooked chicken (100 g)", "Bulgur mit gegartem Hähnchen (100 g)", "Bulgur con pollo cocido (100 g)", "Булгур с готовой курицей (100 г)", "Bulgur com frango cozido (100 g)"],
    ["Салат з кіноа та яйцем", "Quinoa salad with egg", "Quinoa-Salat mit Ei", "Ensalada de quinoa con huevo", "Салат с киноа и яйцом", "Salada de quinoa com ovo"],
    ["Рол з хумусом та овочами", "Roll with hummus and vegetables", "Wrap mit Hummus und Gemüse", "Roll con hummus y verduras", "Ролл с хумусом и овощами", "Wrap com homus e legumes"],
    ["Парова сьомга + огірок", "Steamed salmon + cucumber", "Gedämpfter Lachs + Gurke", "Salmón al vapor + pepino", "Семга на пару + огурец", "Salmão no vapor + pepino"],
    ["Квасоля (200г) + хлібці", "Beans (200 g) + crispbreads", "Bohnen (200 g) + Knäckebrote", "Alubias (200 g) + panes crujientes", "Фасоль (200 г) + хлебцы", "Feijão (200 g) + torradas crocantes"],
    ["Салат Нісуаз (з тунцем)", "Niçoise salad (with tuna)", "Nizza-Salat (mit Thunfisch)", "Ensalada niçoise (con atún)", "Салат Нисуаз (с тунцом)", "Salada niçoise (com atum)"],
    ["Гаспачо (300мл)", "Gazpacho (300 ml)", "Gazpacho (300 ml)", "Gazpacho (300 ml)", "Гаспачо (300 мл)", "Gazpacho (300 ml)"],
    ["Тофу-гриль (150г)", "Grilled tofu (150 g)", "Gegrillter Tofu (150 g)", "Tofu a la parrilla (150 g)", "Тофу-гриль (150 г)", "Tofu grelhado (150 g)"],
    ["Кускус з овочами", "Couscous with vegetables", "Couscous mit Gemüse", "Cuscús con verduras", "Кускус с овощами", "Cuscuz com legumes"],
    ["Куряча грудка (150г) + рис", "Chicken breast (150 g) + rice", "Hähnchenbrust (150 g) + Reis", "Pechuga de pollo (150 g) + arroz", "Куриная грудка (150 г) + рис", "Peito de frango (150 g) + arroz"],
    ["Яловичина + булгур (150г)", "Beef + bulgur (150 g)", "Rindfleisch + Bulgur (150 g)", "Ternera + bulgur (150 g)", "Говядина + булгур (150 г)", "Carne bovina + bulgur (150 g)"],
    ["Паста цільнозернова з індичкою", "Whole-grain pasta with turkey", "Vollkornpasta mit Pute", "Pasta integral con pavo", "Цельнозерновая паста с индейкой", "Massa integral com peru"],
    ["Кіноа з креветками (100г)", "Quinoa with shrimp (100 g)", "Quinoa mit Garnelen (100 g)", "Quinoa con gambas (100 g)", "Киноа с креветками (100 г)", "Quinoa com camarão (100 g)"],
    ["Борщ з яловичиною (100г)", "Borscht with beef (100 g)", "Borschtsch mit Rindfleisch (100 g)", "Borsch con ternera (100 g)", "Борщ с говядиной (100 г)", "Borscht com carne bovina (100 g)"],
    ["Стейк індички + картопля", "Turkey steak + potatoes", "Putensteak + Kartoffeln", "Filete de pavo + patatas", "Стейк индейки + картофель", "Bife de peru + batata"],
    ["Різотто з грибами (250г)", "Mushroom risotto (250 g)", "Pilzrisotto (250 g)", "Risotto de champiñones (250 g)", "Ризотто с грибами (250 г)", "Risoto de cogumelos (250 g)"],
    ["Гречка з печінкою у сметані", "Buckwheat with liver in sour cream", "Buchweizen mit Leber in Sauerrahm", "Trigo sarraceno con hígado en crema agria", "Гречка с печенью в сметане", "Trigo-sarraceno com fígado em creme azedo"],
    ["Минтай запечений + спаржа", "Baked pollock + asparagus", "Gebackener Pollack + Spargel", "Abadejo al horno + espárragos", "Минтай запеченный + спаржа", "Polaca assada + aspargos"],
    ["Шашлик з курки + овочі гриль", "Chicken kebab + grilled vegetables", "Hähnchenspieß + Grillgemüse", "Brocheta de pollo + verduras a la parrilla", "Куриный шашлык + овощи гриль", "Espetinho de frango + legumes grelhados"],
    ["Суп-пюре з брокколі", "Broccoli cream soup", "Brokkoli-Cremesuppe", "Crema de brócoli", "Суп-пюре из брокколи", "Sopa creme de brócolis"],
    ["Омлет з куркою та грибами", "Omelet with chicken and mushrooms", "Omelett mit Hähnchen und Pilzen", "Tortilla con pollo y champiñones", "Омлет с курицей и грибами", "Omelete com frango e cogumelos"],
    ["Сендвіч Клаб з яйцем", "Club sandwich with egg", "Club-Sandwich mit Ei", "Sándwich club con huevo", "Клаб-сэндвич с яйцом", "Sanduíche club com ovo"],
    ["Лазанья з кабачків з фаршем", "Zucchini lasagna with minced meat", "Zucchini-Lasagne mit Hackfleisch", "Lasaña de calabacín con carne picada", "Лазанья из кабачков с фаршем", "Lasanha de abobrinha com carne moída"],
    ["Котлети з індички + гречка", "Turkey patties + buckwheat", "Putenfrikadellen + Buchweizen", "Hamburguesas de pavo + trigo sarraceno", "Котлеты из индейки + гречка", "Hambúrgueres de peru + trigo-sarraceno"],
    ["Рагу з кролика та овочі", "Rabbit stew with vegetables", "Kaninchenragout mit Gemüse", "Guiso de conejo con verduras", "Рагу из кролика с овощами", "Ensopado de coelho com legumes"],
    ["Плов з яловичиною (250г)", "Pilaf with beef (250 g)", "Pilaw mit Rindfleisch (250 g)", "Pilaf con ternera (250 g)", "Плов с говядиной (250 г)", "Pilaf com carne bovina (250 g)"],
    ["Форель запечена + овочі", "Baked trout + vegetables", "Gebackene Forelle + Gemüse", "Trucha al horno + verduras", "Форель запеченная + овощи", "Truta assada + legumes"],
    ["Тефтелі в томаті + паста", "Meatballs in tomato sauce + pasta", "Fleischbällchen in Tomatensauce + Pasta", "Albóndigas en tomate + pasta", "Тефтели в томате + паста", "Almôndegas ao molho de tomate + massa"],
    ["Мусака з баклажанів", "Eggplant moussaka", "Auberginen-Moussaka", "Musaka de berenjena", "Мусака из баклажанов", "Moussaka de berinjela"],
    ["Свиняча вирізка + рис", "Pork tenderloin + rice", "Schweinefilet + Reis", "Solomillo de cerdo + arroz", "Свиная вырезка + рис", "Lombo suíno + arroz"],
    ["Перці фаршировані (2 шт)", "Stuffed peppers (2 pcs)", "Gefüllte Paprika (2 Stk.)", "Pimientos rellenos (2 uds.)", "Фаршированные перцы (2 шт.)", "Pimentões recheados (2 un.)"],
    ["Голубці з яловичиною (3 шт)", "Cabbage rolls with beef (3 pcs)", "Kohlrouladen mit Rindfleisch (3 Stk.)", "Rollos de col con ternera (3 uds.)", "Голубцы с говядиной (3 шт.)", "Charutos de repolho com carne bovina (3 un.)"],
    ["Чахохбілі з куркою (200г)", "Chakhokhbili with chicken (200 g)", "Chakhokhbili mit Hähnchen (200 g)", "Chakhokhbili con pollo (200 g)", "Чахохбили с курицей (200 г)", "Chakhokhbili com frango (200 g)"],
    ["Суп Рамен з куркою", "Ramen soup with chicken", "Ramen-Suppe mit Hähnchen", "Sopa ramen con pollo", "Суп рамен с курицей", "Sopa ramen com frango"],
    ["Рибний пиріг PAC (150г)", "PAC fish pie (150 g)", "PAC-Fischkuchen (150 g)", "Pastel de pescado PAC (150 g)", "Рыбный пирог PAC (150 г)", "Torta de peixe PAC (150 g)"]
  ];

  const dinners = [
    ["Сир 5% (200г) + кефір", "Cottage cheese 5% (200 g) + kefir", "Quark 5% (200 g) + Kefir", "Requesón 5% (200 g) + kéfir", "Творог 5% (200 г) + кефир", "Cottage cheese 5% (200 g) + kefir"],
    ["Протеїновий пудинг (200г)", "Protein pudding (200 g)", "Proteinpudding (200 g)", "Pudin de proteína (200 g)", "Протеиновый пудинг (200 г)", "Pudim proteico (200 g)"],
    ["Салат з моцарелою та томатами", "Salad with mozzarella and tomatoes", "Salat mit Mozzarella und Tomaten", "Ensalada con mozzarella y tomates", "Салат с моцареллой и томатами", "Salada com muçarela e tomate"],
    ["2 Яйця варені + огірок", "2 boiled eggs + cucumber", "2 gekochte Eier + Gurke", "2 huevos cocidos + pepino", "2 вареных яйца + огурец", "2 ovos cozidos + pepino"],
    ["Йогурт + мигдаль (20г)", "Yogurt + almonds (20 g)", "Joghurt + Mandeln (20 g)", "Yogur + almendras (20 g)", "Йогурт + миндаль (20 г)", "Iogurte + amêndoas (20 g)"],
    ["Тунець (100г) + салат", "Tuna (100 g) + salad", "Thunfisch (100 g) + Salat", "Atún (100 g) + ensalada", "Тунец (100 г) + салат", "Atum (100 g) + salada"],
    ["Шинка індички + помідор", "Turkey ham + tomato", "Putenschinken + Tomate", "Jamón de pavo + tomate", "Ветчина индейки + помидор", "Presunto de peru + tomate"],
    ["Кефір + насіння льону", "Kefir + flax seeds", "Kefir + Leinsamen", "Kéfir + semillas de lino", "Кефир + семена льна", "Kefir + sementes de linhaça"],
    ["Хумус + морквяні палички", "Hummus + carrot sticks", "Hummus + Karottensticks", "Hummus + bastones de zanahoria", "Хумус + морковные палочки", "Homus + palitos de cenoura"],
    ["Креветки відварні (100г)", "Boiled shrimp (100 g)", "Gekochte Garnelen (100 g)", "Gambas cocidas (100 g)", "Отварные креветки (100 г)", "Camarão cozido (100 g)"],
    ["Сардини в соку + хлібець", "Sardines in their own juice + crispbread", "Sardinen im eigenen Saft + Knäckebrot", "Sardinas al natural + pan crujiente", "Сардины в собственном соку + хлебец", "Sardinhas ao natural + torrada crocante"],
    ["Творог 0% з какао", "Cottage cheese 0% with cocoa", "Quark 0% mit Kakao", "Requesón 0% con cacao", "Творог 0% с какао", "Cottage cheese 0% com cacau"],
    ["Протеїновий шейк на воді", "Protein shake with water", "Proteinshake mit Wasser", "Batido de proteína con agua", "Протеиновый шейк на воде", "Shake proteico com água"],
    ["Сир косичка (50г)", "String cheese (50 g)", "Flechtkäse (50 g)", "Queso trenzado (50 g)", "Сыр косичка (50 г)", "Queijo trançado (50 g)"],
    ["Тріска на пару + брокколі", "Steamed cod + broccoli", "Gedämpfter Kabeljau + Brokkoli", "Bacalao al vapor + brócoli", "Треска на пару + брокколи", "Bacalhau no vapor + brócolis"],
    ["Стегно курки + овочі", "Chicken thigh + vegetables", "Hähnchenschenkel + Gemüse", "Muslo de pollo + verduras", "Куриное бедро + овощи", "Coxa de frango + legumes"],
    ["Омлет з морепродуктами", "Omelet with seafood", "Omelett mit Meeresfrüchten", "Tortilla con mariscos", "Омлет с морепродуктами", "Omelete com frutos do mar"],
    ["Печінка куряча тушкована", "Stewed chicken liver", "Geschmorte Hähnchenleber", "Hígado de pollo guisado", "Куриная печень тушеная", "Fígado de frango ensopado"],
    ["Скумбрія запечена з лимоном", "Baked mackerel with lemon", "Gebackene Makrele mit Zitrone", "Caballa al horno con limón", "Скумбрия запеченная с лимоном", "Cavala assada com limão"],
    ["Гриби з куркою (100г)", "Mushrooms with chicken (100 g)", "Pilze mit Hähnchen (100 g)", "Champiñones con pollo (100 g)", "Грибы с курицей (100 г)", "Cogumelos com frango (100 g)"],
    ["Квасоля стручкова з яйцем", "Green beans with egg", "Grüne Bohnen mit Ei", "Judías verdes con huevo", "Стручковая фасоль с яйцом", "Vagem com ovo"],
    ["Хек запечений + томати", "Baked hake + tomatoes", "Gebackener Seehecht + Tomaten", "Merluza al horno + tomates", "Хек запеченный + томаты", "Pescada assada + tomate"],
    ["Курячі сердечка + овочі", "Chicken hearts + vegetables", "Hähnchenherzen + Gemüse", "Corazones de pollo + verduras", "Куриные сердечки + овощи", "Corações de frango + legumes"],
    ["Салат з авокадо та яйцем", "Salad with avocado and egg", "Salat mit Avocado und Ei", "Ensalada con aguacate y huevo", "Салат с авокадо и яйцом", "Salada com abacate e ovo"],
    ["Індичка-гриль + кабачок", "Grilled turkey + zucchini", "Gegrillte Pute + Zucchini", "Pavo a la parrilla + calabacín", "Индейка-гриль + кабачок", "Peru grelhado + abobrinha"],
    ["Сирники солоні з зеленню", "Savory cottage cheese pancakes with herbs", "Herzhafte Quarkküchlein mit Kräutern", "Tortitas saladas de requesón con hierbas", "Соленые сырники с зеленью", "Panquecas salgadas de cottage cheese com ervas"],
    ["Котлети рибні на пару", "Steamed fish patties", "Gedämpfte Fischfrikadellen", "Hamburguesas de pescado al vapor", "Рыбные котлеты на пару", "Hambúrgueres de peixe no vapor"],
    ["Рулет з індички з травами", "Turkey roulade with herbs", "Putenroulade mit Kräutern", "Rollo de pavo con hierbas", "Рулет из индейки с травами", "Rocambole de peru com ervas"],
    ["Рибне суфле запечене", "Baked fish soufflé", "Gebackenes Fischsoufflé", "Soufflé de pescado al horno", "Запеченное рыбное суфле", "Suflê de peixe assado"],
    ["2 Перці фаршировані м'ясом", "2 peppers stuffed with meat", "2 mit Fleisch gefüllte Paprika", "2 pimientos rellenos de carne", "2 перца, фаршированные мясом", "2 pimentões recheados com carne"],
    ["Салат Цезар (ПП) з куркою", "Caesar salad (fit) with chicken", "Caesar-Salat (fit) mit Hähnchen", "Ensalada César ligera con pollo", "Салат Цезарь (ПП) с курицей", "Salada Caesar fit com frango"],
    ["Мідії в томатному соусі", "Mussels in tomato sauce", "Muscheln in Tomatensauce", "Mejillones en salsa de tomate", "Мидии в томатном соусе", "Mexilhões ao molho de tomate"],
    ["Баклажани запечені з фаршем", "Baked eggplants with minced meat", "Gebackene Auberginen mit Hackfleisch", "Berenjenas al horno con carne picada", "Баклажаны запеченные с фаршем", "Berinjelas assadas com carne moída"],
    ["Заливне з курки (200г)", "Chicken aspic (200 g)", "Hähnchensülze (200 g)", "Gelatina salada de pollo (200 g)", "Заливное из курицы (200 г)", "Aspic de frango (200 g)"],
    ["Стейк тунця + шпинат", "Tuna steak + spinach", "Thunfischsteak + Spinat", "Filete de atún + espinacas", "Стейк тунца + шпинат", "Bife de atum + espinafre"],
    ["Кролик у вині з травами", "Rabbit in wine with herbs", "Kaninchen in Wein mit Kräutern", "Conejo al vino con hierbas", "Кролик в вине с травами", "Coelho ao vinho com ervas"],
    ["Судак запечений під сиром", "Baked zander with cheese", "Gebackener Zander mit Käse", "Lucioperca al horno con queso", "Судак запеченный под сыром", "Perca assada com queijo"],
    ["Запіканка з брокколі та індички", "Broccoli and turkey casserole", "Brokkoli-Puten-Auflauf", "Gratinado de brócoli y pavo", "Запеканка из брокколи и индейки", "Caçarola de brócolis e peru"],
    ["Кальмари фаршировані сиром", "Squid stuffed with cheese", "Mit Käse gefüllter Tintenfisch", "Calamares rellenos de queso", "Кальмары, фаршированные сыром", "Lulas recheadas com queijo"],
    ["Рулет з яловичини з чорносливом", "Beef roulade with prunes", "Rinderroulade mit Pflaumen", "Rollo de ternera con ciruelas pasas", "Рулет из говядины с черносливом", "Rocambole de carne bovina com ameixas"]
  ];

  const bySlot = { breakfasts, lunches, dinners };
  const langIndex = { uk: 0, en: 1, de: 2, es: 3, ru: 4, pt: 5 };

  function rowsToMeal(row) {
    return LANGS.reduce((acc, lang, index) => {
      acc[`name_${lang}`] = row[index] || row[1] || row[0] || "";
      return acc;
    }, {});
  }

  function normalizeMeal(meal, slot, index) {
    const normalized = meal || {};
    const slotRows = bySlot[slot] || [];
    const row = slotRows[index];
    if (row) Object.assign(normalized, rowsToMeal(row));
    normalized.name = fixMojibake(normalized.name_uk || normalized.name || row?.[0] || "");
    return normalized;
  }

  function normalizeDietDatabase(db) {
    if (!db || typeof db !== "object") return db;
    Object.keys(bySlot).forEach((slot) => {
      if (!Array.isArray(db[slot])) return;
      db[slot].forEach((meal, index) => normalizeMeal(meal, slot, index));
    });
    return db;
  }

  function pickName(meal, lang) {
    const normalized = meal || {};
    const key = `name_${langIndex[lang] == null ? "en" : lang}`;
    return normalized[key] || normalized.name_en || fixMojibake(normalized.name) || normalized.name_uk || "";
  }

  window.PACDietI18n = {
    fixMojibake,
    normalizeMeal,
    normalizeDietDatabase,
    pickName
  };
})();
