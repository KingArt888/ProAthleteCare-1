// exercise_library.js

// Рекомендації тренера для всього циклу (Microcycle)
const MD_RECOMMENDATIONS = {
    'MD': 'Ігровий день. Максимальна концентрація на результаті. Твій час показати все, над чим працювали.',
    'MD+1': 'Відновлення. Активна регенерація: МФР, легка мобільність та контрастні процедури.',
    'MD+2': 'Відновлення (день 2). Поступове повернення до руху. Робота над еластичністю м’язів.',
    'MD-4': 'Навантажувальний день. Велика площа, висока інтенсивність. Працюємо над фізичними якостями.',
    'MD-3': 'Тактичний день. Середня інтенсивність. Фокус на взаємодіях та специфічній роботі.',
    'MD-2': 'Зниження об’єму. Швидкість та реакція. Готуємо нервову систему до гри.',
    'MD-1': 'Активація. Короткі, вибухові рухи. Низький об’єм, висока якість та свіжість.',
    'REST': 'Повний спокій. Пріоритет — сон, збалансоване харчування та ментальне розвантаження.',
    'TRAIN': 'Стандартний робочий цикл. Дотримуйтесь техніки та фокусуйтесь на індивідуальних завданнях.'
};
// Розширена бібліотека вправ для ProAtletCare з якостями навантаження.

const QUALITIES = [
    'Strength',
    'Endurance',
    'Speed',
    'Power',
    'Mobility',
    'Activation',
    'Recovery',
    'Other'
];

const EXERCISE_LIBRARY = {

    // =========================================================
    // 1. PRE-TRAINING (ПЕРЕДТРЕНУВАЛЬНА ПІДГОТОВКА)
    // =========================================================
    "Pre-Training": {

        "Mobility": {
            qualities: ['Mobility'],
            exercises: [
                {
                    name: "Обертання у кульшовому суглобі (Hip Circles)",
                    description: "10 обертань всередину та 10 назовні на кожну ногу.",
                    videoKey: "mDwiyCcr_7k",
                    tags: ["mobility","injury_prevention"]
                },
                {
                    name: "Кішка-Корова (Cat-Cow Stretch)",
                    description: "15 повільних повторень, синхронізуючи з диханням.",
                    videoKey: "cat_cow_v1",
                    tags: ["mobility","recovery"]
                },
                {
                    name: "Динамічні випади з поворотом",
                    description: "5 повторень на кожну ногу, затримуючись у нижній точці.",
                    videoKey: "lunge_twist_v1",
                    tags: ["mobility","injury_prevention","tissue"]
                },
                {
    name: "Single Leg Romanian Deadlift (Control)",
    description: "Станьте на одну ногу і виконайте нахил корпусу вперед, відводячи іншу ногу назад. Тіло утворює пряму лінію від голови до п’яти. Рух виконується повільно і під контролем, з акцентом на стабільність тазу і баланс. Поверніться у вихідне положення без інерції.",
    videoKey: "ТУТ_ТВОЄ_ВІДЕО",
    tags: ["unilateral","balance","control","hinge","glutes","hamstring"],
    primaryZones: ["hamstring","glute"],
    secondaryZones: ["hip","core","ankle"]
},
                {
                    name: "Розкриття грудної клітки лежачи",
                    description: "10 повторень на кожну сторону. Фокус на ротації.",
                    videoKey: "vYJLnJaifc4",
                    tags: ["mobility","recovery","upperbody"]
                },
                {
                    name: "Присідання 'Горила' (Goblet Squat Mobility)",
                    description: "2 підходи по 15 повторень, використовуючи лікті для розширення колін.",
                    videoKey: "gorilla_squat_v1",
                    tags: ["mobility","injury_prevention","tissue"]
                },
                {
                    name: "Мостик з ротацією (Thoracic Bridge)",
                    description: "3 підходи по 5 повільних ротацій на кожну сторону.",
                    videoKey: "thoracic_bridge_v1",
                    tags: ["mobility","recovery","upperbody"]
                },
                {
                    name: "Розтяжка задньої поверхні стегна лежачи з ременем",
                    description: "45 секунд утримання на кожну ногу.",
                    videoKey: "hamstring_strap_v1",
                    tags: ["mobility","recovery","tissue","injury_prevention"]
                },
            ]
        },
        "Injury Prevention": {
            qualities: ['Injury Prevention'],
            exercises: [
                {
    name: "Bench Side Plank",
    description: "Займіть положення бокової планки з опорою на лавку. Тіло утримується в прямій лінії, таз не провисає. Зберігайте стабільність корпусу і контроль протягом усього часу утримання. Після виконання змініть сторону.",
    videoKey: "dR-47yjhJjo",
    tags: ["core","stability","isometric","side_plank","activation","control"],
    primaryZones: ["core"],
    secondaryZones: ["obliques","shoulder","hip"]
},
{
    name: "Reverse Nordic Curl",
    description: "Станьте на коліна і тримайте корпус прямим. Повільно відхиляйтеся назад, зберігаючи пряму лінію від колін до плечей. Рух виконується за рахунок колінного суглоба з акцентом на квадрицепс. Поверніться у вихідне положення під контролем.",
    videoKey: "KLSr8sDun_Q",
    tags: ["strength","quadriceps","control","anterior_chain","injury_prevention"],
    primaryZones: ["quad"],
    secondaryZones: ["knee","hip"]
}
        ]
        },
        "Movement Preparation": {
            qualities: ['Activation', 'Speed', 'Mobility' , 'Endurance' , 'Strength' ],
            exercises: [
                {
    name: "Mini Band Lateral Skater Steps",
    description: "Станьте у спортивну позицію з міні-резинкою навколо стегон. Виконуйте швидкі бокові кроки, імітуючи рух ковзаняра. Зберігайте низьку позицію, стабільний корпус і постійний натяг резинки. Рух виконується ритмічно, з акцентом на координацію, швидкість і контроль.",
    videoKey: "JKfb2VKZdz0",
    tags: ["movement_prep","activation","lateral","coordination","speed","glutes","knee_control"]
},
{
    name: "Isometric Lunge with Arm Drive",
    description: "Утримуйте позицію випаду і виконуйте рухи руками, імітуючи біг. Нижня частина тіла залишається стабільною в ізометрії. Руки працюють ритмічно і під контролем. Вправа розвиває координацію, стабільність і взаємодію верхньої та нижньої частини тіла.",
    videoKey: "6KE-wOyBTFY",
    tags: ["activation","coordination","isometric","running","arms","core","movement_prep"],
    primaryZones: ["core"],
    secondaryZones: ["quad","glute","shoulder"]
},
{
    name: "Arm Drive Drill",
    description: "Виконуйте швидкі рухи руками, імітуючи біг. Нижня частина тіла залишається стабільною. Рухи короткі, швидкі і контрольовані, з акцентом на ритм і координацію.",
    videoKey: "nN7IIrNJxsw",
    tags: ["speed","running","coordination","arms","movement_prep","reaction"],
    primaryZones: ["shoulder"],
    secondaryZones: ["core","upper_back"]
},
{
    name: "Resisted Split Stance Drive",
    description: "Закріпіть резинку позаду і займіть позицію розножки. Виконуйте динамічний рух вперед, імітуючи старт бігу, долаючи опір. Передня нога стабілізує, задня активно відштовхується. Зберігайте нахил корпусу і контроль тазу. Після виконання повторень змініть положення ніг.",
    videoKey: "lknh7mTH6d0",
    tags: ["activation","movement_prep","speed","acceleration","running","glutes","coordination"],
    primaryZones: ["glute"],
    secondaryZones: ["hamstring","quad","core"]
},
{
    name: "Resisted High Knee Run",
    description: "Закріпіть резинку позаду і виконуйте біговий рух з високим підніманням колін. Чередуйте ноги, активно піднімаючи стегно і швидко змінюючи опору. Рух динамічний, з акцентом на ритм, координацію і роботу тазу. Зберігайте нахил корпусу і контроль протягом усієї вправи.",
    videoKey: "eEIjdqHgCC8",
    tags: ["activation","movement_prep","running","speed","coordination","hip","glutes"],
    primaryZones: ["hip","glute"],
    secondaryZones: ["quad","core","hamstring"]
},
{
    name: "Mini Band Lateral Shuffle",
    description: "Станьте у напівприсід з міні-резинкою навколо стегон. Зберігайте низьку позицію та стабільний корпус. Виконуйте короткі кроки в сторону, зберігаючи постійний натяг резинки. Рухайтесь в один бік, після чого поверніться назад, зберігаючи контроль і позицію. Рух виконується динамічно, без втрати стабільності.",
    videoKey: "84Uo-FLpLp4",
    tags: ["activation","movement_prep","glutes","hip","lateral","coordination","knee_control","injury_prevention"]
}            ]
        },
        "Activation": {
            qualities: ['Activation', 'Strength'],
            exercises: [
                {
    name: "Dynamic Arm Raises",
    description: "Станьте прямо, зберігаючи стабільний корпус. Піднімайте руки вперед і вгору під контролем, активуючи плечі та верхню частину тіла. Рух виконується плавно і ритмічно, без інерції. Зберігайте контроль положення плечей протягом усього руху.",
    videoKey: "KLuk_WLnOjs",
    tags: ["activation","upperbody","shoulders","chest","coordination","movement_prep"]
},
{
    name: "Forward Lunge (Continuous Tension)",
    description: "Виконуйте випад вперед, не розгинаючи ноги повністю у верхній точці. Зберігайте постійну напругу в м’язах і контроль коліна протягом усього руху. Коліно стабільне і не завалюється всередину. Після виконання повторень змініть ногу.",
    videoKey: "9azyxpB2hAA",
    tags: ["control","tempo","continuous_tension","knee_control","lunge","stability"],
    primaryZones: ["quad","knee"],
    secondaryZones: ["glute","hip","core"]
},
{
            name: "Knee Drive Dynamic",
            description: "Він виконує контрольований підйом коліна вгору, зберігаючи баланс на опорній нозі. Корпус залишається стабільним, таз не завалюється, рух виконується під контролем. Вправа покращує координацію, баланс і стабільність під час бігових та ігрових рухів.",
            videoKey: "LSoKax5QycI",
            sets: 2,
            reps: 15,
            holdSec: 15,
            restSec: 20,
            tags: ["activation","balance","coordination","injury_prevention"]
        },
        
        {
    name: "Single Leg Ankle Stability Drill",
    description: "Станьте на одну ногу, утримуючи баланс і стабільний корпус. Виконуйте контрольовані рухи у гомілковостопному суглобі, зберігаючи рівновагу. Стопа активно працює, коліно стабільне та не завалюється всередину. Рух виконується повільно і під контролем. Виконайте всі повторення на одну сторону, після чого змініть ногу.",
    videoKey: "KsEHHZMPQFY",
    tags: ["activation","ankle","stability","single_leg","balance","injury_prevention"]
},
        {
    name: "Resisted Alternating Knee Drive",
    description: "Закріпіть резинку позаду і займіть спортивну позицію. Виконуйте чергування ніг, піднімаючи стегно вгору і імітуючи біговий рух. Рух динамічний і ритмічний, з акцентом на роботу тазу та координацію. Зберігайте стабільний корпус і контроль опорної ноги протягом усієї вправи.",
    videoKey: "74u69OLencM",
    tags: ["activation","movement_prep","running","coordination","hip","glutes","speed"],
    primaryZones: ["glute"],
    secondaryZones: ["hip","core","quad"]
},
                {
    name: "Single Leg Step Control Lunge",
    description: "Станьте на одну ногу, утримуючи стабільний корпус і нейтральне положення тазу. Контрольовано відведіть вільну ногу вперед і перейдіть у випад. Опускайтесь повільно, зберігаючи контроль коліна — воно не завалюється всередину. У нижній точці зберігайте стабільність, після чого поверніться у вихідне положення під повним контролем, без інерції.",
    videoKey: "YAQkGSKokWE",
    tags: ["activation","stability","single_leg","balance","knee_control","eccentric","injury_prevention"]
},
{
    name: "Hip Hinge Activation (Barbell)",
    description: "Станьте прямо, тримаючи гриф перед собою. Виконайте рух тазом назад (хіп-хінж), зберігаючи нейтральну спину. Опускайте гриф уздовж ніг під контролем, відчуваючи активацію задньої поверхні стегна. Поверніться у вихідне положення, включаючи сідниці. Рух виконується повільно і технічно.",
    videoKey: "EeQHsunHRIA",
    tags: ["activation","posterior_chain","hamstrings","glutes","hip_hinge","movement_prep"]
},
                {
                    name: "Сідничний місток (Glute Bridge)",
                    description: "3 підходи по 12 повторень, утримуючи пікове скорочення 2 сек.",
                    videoKey: "0rXbHL3dxk4",
                    tags: ["isometric_activation","injury_prevention","tissue"]
                },
                {
                    name: "Планка з дотягуванням (Shoulder Taps)",
                    description: "3 підходи по 20 торкань. Слідкуйте за стабільністю корпусу.",
                    videoKey: "shoulder_taps_v1",
                    tags: ["core","isometric_activation","readiness","coordination"]
                },
                {
    name: "Dynamic Arm Raises",
    description: "Станьте прямо, зберігаючи стабільний корпус. Піднімайте руки вперед і вгору під контролем, активуючи плечі та верхню частину тіла. Рух виконується плавно і ритмічно, без інерції. Зберігайте контроль положення плечей протягом усього руху.",
    videoKey: "KLuk_WLnOjs",
    tags: ["activation","upperbody","shoulders","chest","coordination","movement_prep"]
},
                {
                    name: "Scapular Activation Hold",
                    description: "Він лежить на животі та піднімає верхню частину корпусу, зводячи лопатки разом і вниз. Основний акцент на контроль лопаток — вони рухаються назад і вниз без напруження шиї. Шия залишається в нейтральному положенні, погляд направлений вниз. Поперек не перенапружується, рух виконується за рахунок м’язів верхньої частини спини. Утримання виконується повільно і під повним контролем.",
                    videoKey: "HWGUZzeuBAo",
                    tags: ["activation","scapula","upperbody","injury_prevention","isometric"]
                },
                {
                    name: "Dynamic Scapular Activation",
                    description: "Він виконує контрольовані динамічні рухи руками з акцентом на роботу лопаток. Лопатки рухаються назад і вниз, активуючи м’язи верхньої частини спини. Корпус залишається стабільним, без залучення попереку. Рух виконується у помірному темпі, без інерції, з фокусом на контроль і якість.",
                    videoKey: "wMxl5mNFLEA",
                    tags: ["activation","scapula","shoulder","upperbody","coordination","low_fatigue"]
                },
                {
                    name: "Reverse Tabletop Hip Lift",
                    description: "Почніть у положенні з опорою на руки та ноги. Підніміть таз вгору, утримуючи корпус у прямій лінії. Контролюйте рух, не провалюйте таз вниз. Повільно опустіться назад у вихідне положення. Рух виконується під контролем, без ривків.",
                    videoKey: "CMOuMStw1uA",
                    tags: ["activation","hip","shoulder","core","posterior_chain","injury_prevention"]
                },
                {
                    name: "Міні-бенд кроки вбік (Band Side Steps)",
                    description: "3 підходи по 15 кроків в кожен бік. Фокус на середній сідничній.",
                    videoKey: "band_side_steps_v1",
                    tags: ["isometric_activation","injury_prevention","tissue"]
                },
                {
                    name: "Пташка-Собака (Bird-Dog)",
                    description: "3 підходи по 10 повільних повторень на кожну сторону.",
                    videoKey: "uZy9GRGJ9k0",
                    tags: ["core","isometric_activation","mobility","injury_prevention"]
                },
{
    name: "Dynamic Dead Bug",
    description: "Ляжте на спину, підніміть руки і ноги. Притисніть поперек до підлоги. Виконуйте почергові рухи протилежною рукою і ногою у динамічному темпі, зберігаючи стабільний корпус. Контролюйте положення попереку протягом усього руху. Рух виконується ритмічно, без втрати контролю.",
    videoKey: "I_JbLLGm248",
    tags: ["activation","core","coordination","movement_prep","stability"]
},
                {
                    name: "Elbow Plank",
                    description: "Прийміть положення планки на ліктях. Тіло утворює пряму лінію від голови до п’ят. Утримуйте напруження корпусу, не допускаючи провисання таза. Лікті під плечима, шия нейтральна. Дихання контрольоване протягом усього часу.",
                    videoKey: "SKYuwr-0Hw8",
                    tags: ["core","stability","isometric","activation","injury_prevention"],
                    primaryZones: ["core"],
                    secondaryZones: ["lower_back","shoulder"]
                },
                {
                    name: "Ягодичні відведення лежачи (Clam Shells)",
                    description: "3 підходи по 15 повторень на кожну сторону.",
                    videoKey: "clam_shells_v1",
                    tags: ["isometric_activation","injury_prevention","tissue"]
                },
                {
                    name: "Супермен (Superman)",
                    description: "3 підходи по 12 повторень, повільне опускання.",
                    videoKey: "b9uy94AC7UE",
                    tags: ["core","isometric_activation","tissue","injury_prevention"]
                },
            ]
        },
        "Neuro Activation": {
            qualities: ['Activation', 'Speed'],
            exercises: [
                {
                    name: "Ball Juggling Coordination",
                    description: "Станьте прямо і почніть жонглювати кількома м’ячами. Контролюйте висоту і ритм кидків. Погляд спрямований вперед, рухи рук плавні і скоординовані. Вправа спрямована на розвиток координації, реакції та роботи нервової системи.",
                    videoKey: "oWIX2qKxscQ",
                    tags: ["coordination","neuro","reaction","focus","movement_prep"],
                    primaryZones: ["core"],
                    secondaryZones: ["shoulder","upper_back"]
                },
                {
                    name: "Dual Ball Reaction Drill",
                    description: "Виконуйте одночасно дві дії: підкидайте один м’яч вгору і відпускайте інший вниз. Швидко реагуйте на обидва м’ячі, контролюючи їх траєкторію. Вправа розвиває реакцію, координацію та здатність обробляти декілька сигналів одночасно. Корпус стабільний, рухи контрольовані.",
                    videoKey: "4bLOUxEBcxE",
                    tags: ["reaction","neuro","coordination","dual_task","focus","speed","movement_prep"],
                    primaryZones: ["core"],
                    secondaryZones: ["shoulder","upper_back"]
                },
                {
                    name: "Ловля від стіни на реакцію (Peripheral Vision)",
                    description: "Киньте м’яч у стіну однією рукою і зловіть його двома руками після відскоку. Погляд спрямований вперед, використовуйте периферійний зір для відстеження м’яча. Реагуйте швидко і контролюйте рух. Вправа розвиває реакцію, координацію та роботу зору.",
                    videoKey: "1PRk-nrevdc",
                    tags: ["reaction","vision","peripheral","coordination","neuro","focus","movement_prep"],
                    primaryZones: ["core"],
                    secondaryZones: ["shoulder","upper_back"]
                }
            ]
        }
    },

    // =========================================================
    // 2. MAIN TRAINING (ОСНОВНЕ ТРЕНУВАННЯ)
    // =========================================================
    "Main Training": {

        "Legs": {
            qualities: ['Strength'],
            exercises: [
                {
    name: "Barbell Front Squat (Strength)",
    description: "Розташуйте штангу на передній частині плечей, лікті спрямовані вперед. Виконуйте присідання вниз, зберігаючи вертикальне положення корпусу і стабільність колін. Опустіться до паралелі або нижче, після чого поверніться у вихідне положення. Рух контрольований, без втрати балансу.",
    videoKey: "1t2MbGijS-I",
    tags: ["strength","legs","quadriceps","core","squat","control"],
    primaryZones: ["quad"],
    secondaryZones: ["core","glute","knee"]
},
                {
    name: "Reverse Lunge (In Place)",
    description: "Станьте прямо, утримуючи стабільний корпус. Зробіть крок назад і опустіться у випад. Коліно передньої ноги спрямоване по лінії стопи і не завалюється всередину. Опускайтесь під контролем, після чого поверніться у вихідне положення. Виконайте всі повторення на одну сторону, після чого змініть ногу.",
    videoKey: "VRr6RI11cmU",
    tags: ["strength","single_leg","glutes","quads","knee_control","eccentric","injury_prevention"]
},
{
    name: "Goblet Squat",
    description: "Тримайте гантель біля грудей і виконайте присідання вниз, зберігаючи рівну спину і стабільне положення корпусу. Коліна рухаються по лінії стоп, не завалюються всередину. Поверніться у вихідне положення під контролем.",
    videoKey: "XZgTaDIAX8k",
    tags: ["strength","lower_body","squat","quad","glute","control"],
    primaryZones: ["quad"],
    secondaryZones: ["glute","hip","core","knee"]
},
{
    name: "Offset Goblet Squat",
    description: "Виконуйте присідання, тримаючи гантель в одній руці. Зберігайте рівне положення корпусу, не допускаючи нахилу або скручування. Коліна рухаються по лінії стоп, таз стабільний. Рух виконується під контролем.",
    videoKey: "iZHKJLM4yjo",
    tags: ["strength","squat","unilateral","core","anti_rotation","control"],
    primaryZones: ["quad"],
    secondaryZones: ["glute","core","hip","knee"]
},
{
    name: "Front Foot Elevated Split Squat (Strength)",
    description: "Прийміть позицію випадy з передньою ногою на підвищенні. Опускайтеся вниз під контролем, зберігаючи вертикальний корпус і стабільне положення коліна. Передня нога виконує основну роботу. Поверніться у вихідне положення, контролюючи рух без інерції. Виконайте всі повторення на одну сторону, після чого змініть ногу.",
    videoKey: "C5J_BGYHY4I",
    tags: ["strength","legs","quad","glute","unilateral","balance","knee_control"],
    primaryZones: ["quad","glute"],
    secondaryZones: ["knee","hip"]
},
{
    name: "Barbell Romanian Deadlift ",
    description: "Станьте прямо, тримаючи штангу перед собою. Виконайте хіп-хінж, відводячи таз назад і зберігаючи нейтральну спину. Опускайте штангу вниз уздовж ніг, відчуваючи натяг у задній поверхні стегна. Поверніться у вихідне положення, активно включаючи сідниці. Рух виконується під контролем, без округлення спини і без інерції.",
    videoKey: "v4tLgYMhOB4",
    tags: ["strength","posterior_chain","hamstrings","glutes","hip_hinge","control"],
    primaryZones: ["hamstring","glute"],
    secondaryZones: ["lower_back","core"]
},
{
    name: "Offset Load Forward Lunge",
    description: "Виконайте випад вперед, тримаючи гантель в одній руці. Зберігайте стабільність корпусу, не дозволяючи тілу скручуватись. Коліно передньої ноги під контролем. Після виконання повторень змініть сторону.",
    videoKey: "2s1WgotD0hA",
    tags: ["strength","unilateral","core","anti_rotation","lunge","control","balance"],
    primaryZones: ["core","glute"],
    secondaryZones: ["quad","knee","hip"]
},

                
            ]
        },
"Unilateral Strength": {
            qualities: ['Unilateral Strength'],
            exercises: [
                {
    name: "TRX Reverse Single Leg Squat",
    description: "Виконуйте присідання на одній нозі, стоячи спиною до TRX. Використовуйте ремені для стабілізації, але не тягніть ними. Коліно опорної ноги під контролем, таз стабільний. Рух повільний і контрольований.",
    videoKey: "8fnWi7DQ0uU",
    tags: ["unilateral","trx","control","single_leg","stability","knee_control"],
    primaryZones: ["quad","knee"],
    secondaryZones: ["glute","hip","core"]
},
                ]
        },
        "Power": {
            qualities: ['Power',],
            exercises: [
                {
    "name": "Band Resisted  Drive (Single Leg Stability)",
    "description": "Атлет виконує повторювані поштовхи однією ногою проти опору резинки. Рух починається з активного відштовху в сторону, імітуючи удар або різку зміну напрямку. Після кожного поштовху атлет утримує стабільну позицію на опорній нозі. Коліно залишається стабільним, не завалюється всередину. Корпус контрольований, без зайвих рухів. Основний акцент — на вибуховій силі та здатності швидко стабілізуватися після кожного контакту з опорою.",
    "videoKey": "KYA7lc6wlNo",
    "tags": ["power","activation","singleleg","stability","glutes","hip","knee","football"]
},
{
    name: "Lateral Bound Power Drill",
    description: "Виконуйте швидкі імпульсивні переміщення в сторону, активно відштовхуючись опорною ногою. Приземлення контрольоване, з утриманням балансу. Рух динамічний, з акцентом на вибухову силу і стабілізацію після контакту з підлогою.",
    videoKey: "kKrsaCgXAT4",
    tags: ["power","lateral","agility","speed","coordination","glutes","movement"],
    primaryZones: ["glute"],
    secondaryZones: ["quad","hamstring","core","knee"]
},
{
    name: "Rotational Medicine Ball Throw",
    description: "Займіть позицію з розворотом корпусу. Виконайте вибуховий поворот і киньте м’яч вперед, передаючи силу від тазу через корпус до рук. Рух швидкий і потужний, з акцентом на координацію і передачу сили. Після виконання повторень змініть сторону.",
    videoKey: "bk6dVRjq_R0",
    tags: ["power","rotation","core","coordination","throw","athletic","movement"],
    primaryZones: ["core"],
    secondaryZones: ["hip","shoulder","glute"]
},
{
    name: "Skater Jump to Stick",
    description: "Станьте у спортивну позицію. Виконайте стрибок в сторону з ноги на ногу і приземліться з контролем. Після приземлення зафіксуйте положення, зберігаючи баланс і стабільність. Коліно не завалюється всередину, корпус стабільний. Рух виконується вибухово, приземлення — під повним контролем.",
    videoKey: "BCEHfakT4fs",
    tags: ["power","plyometric","lateral","balance","single_leg","knee_control","injury_prevention"]
},
{
    name: "Lateral Rotational Box Jump",
    description: "Виконайте стрибок в сторону з легким розворотом корпусу і приземліться на бокс. Приземлення контрольоване, з м’яким контактом і стабілізацією коліна. Рух вибуховий, з акцентом на координацію, баланс і контроль після приземлення.",
    videoKey: "AqUPofTHGJoО",
    tags: ["power","plyometric","lateral","rotation","agility","jump","coordination"],
    primaryZones: ["glute"],
    secondaryZones: ["quad","hamstring","knee","core"]
},
{
    name: "Repeated Single Leg Hops",
    description: "Станьте на одну ногу, зберігаючи стабільний корпус. Виконуйте послідовні стрибки на одній нозі у ритмічному темпі. Приземлення м’яке, з контролем положення коліна — воно не завалюється всередину. Рух виконується динамічно, з акцентом на реакцію і стабільність.",
    videoKey: "EcIPaghUaec",
    tags: ["power","plyometric","single_leg","reactive","coordination","knee_control"]
},

            ]
        },

        "Core": {
            qualities: ['Strength', 'Endurance'],
            exercises: [
                {
                    name: "Скручування 'Велосипед' (Bicycle Crunch)",
                    description: "3 підходи по 30 секунд. Контрольований рух.",
                    videoKey: "bicycle_crunch_v1",
                    tags: ["core","endurance","coordination"]
                },
                {
                    name: "Підйом ніг лежачи (Leg Raises)",
                    description: "3 підходи по 15 повторень. Не відривайте поперек від підлоги.",
                    videoKey: "leg_raises_v1",
                    tags: ["core","tissue","endurance"]
                },
                {
                    name: "Скручування 'Книжка' (Book Crunch)",
                    description: "3 підходи по 12 повторень. Робота верхнього і нижнього преса одночасно.",
                    videoKey: "book_crunch_v1",
                    tags: ["core","strength","tissue"]
                },
                {
                    name: "Тяга тросу на колінах (Kneeling Cable Crunch)",
                    description: "3 підходи по 15 повторень. Використовуйте середню вагу.",
                    videoKey: "cable_crunch_v1",
                    tags: ["core","strength","tissue"]
                },
                {
                    name: "Російський твіст (Russian Twist)",
                    description: "3 підходи по 20 торкань (з гантеллю/м'ячем).",
                    videoKey: "russian_twist_v1",
                    tags: ["core","endurance","coordination"]
                },
                {
                    name: "Фермерська прогулянка (Farmer's Walk)",
                    description: "4 підходи по 30 метрів. Важка вага, стабільний корпус.",
                    videoKey: "farmers_walk_v1",
                    tags: ["core","strength","heavy","fatigue"]
                },
                {
                    name: "Бічна планка (Side Plank)",
                    description: "3 підходи по 45 секунд на кожну сторону.",
                    videoKey: "side_plank_v1",
                    tags: ["core","isometric_activation","readiness","injury_prevention"]
                },
            ]
        },



        "Rehab": {
  qualities: ["Recovery","Mobility","Strength"],
  exercises: [
    {
      name: "Spanish Squat Isometric",
      description: "4x30-45 сек, біль ≤3/10. Коліна вперед, корпус вертикально.",
      videoKey: "spanish_squat_iso_v1",
      tags: ["rehab","strength","isometric","low_fatigue","knee_dominant"
,"injury_prevention"]
    },
    {
      name: "Terminal Knee Extension (TKE) з резинкою",
      description: "3x15-20 на ногу. Пауза 1 сек в розгинанні.",
      videoKey: "tke_band_v1",
      tags: ["rehab","strength","isometric","low_fatigue","knee_dominant"]

    },
    {
      name: "Step-Down контроль (низька платформа)",
      description: "3x8-10 на ногу. Повільно вниз 3 сек, коліно стабільне.",
      videoKey: "step_down_control_v1",
      tags: ["rehab","strength","isometric","low_fatigue","knee_dominant"]

    },
    {
      name: "Wall Sit (Isometric)",
      description: "Притисніть спину до стіни і опустіться до положення, де коліна зігнуті приблизно під кутом 90 градусів. Утримуйте позицію, зберігаючи стабільний корпус і рівномірний тиск на стопи. Дихання контрольоване протягом усього часу.",
      videoKey: "O2cx8ljLP-4",
      sets: 3,
      holdSec: 60,
      restSec: 45,
      tags: ["rehab","isometric","quadriceps","endurance","control","injury_prevention"],
      primaryZones: ["quad"],
      secondaryZones: ["knee","glute","core"]
    }
  ]
},

"Conditioning": {
  qualities: ["Endurance","Recovery"],
  exercises: [
    {
      name: "Bike Easy Flush 20-30 min",
      description: "Зона 1-2. Дихання спокійне. Без закислення.",
      videoKey: "bike_flush_v1",
      tags: ["endurance","aerobic","recovery","low_fatigue"]

    },
    {
      name: "Brisk Walk 25-40 min",
      description: "Комфортний темп. Пульс низький.",
      videoKey: "walk_flush_v1",
      tags: ["endurance","aerobic","recovery","low_fatigue"]

    }
  ]
},


        "UpperBody": {
            qualities: ['Strength',],
            exercises: [
                {
    name: "Dumbbell Bench Press ",
    description: "Ляжте на лавку з гантелями в руках. Стопи впираються в підлогу, лопатки зведені і стабільні. Опустіть гантелі вниз під контролем, лікті рухаються під кутом і не розводяться занадто широко. Виштовхніть гантелі вгору, зберігаючи стабільність корпусу і положення плечей. Рух виконується плавно, без інерції.",
    videoKey: "Y6FhkjlLkpI",
    tags: ["strength","upperbody","chest","shoulder","triceps","control","stability"]
},
 {
    name: "Barbell Bent Over Row ",
    description: "Станьте у нахилі, виконуючи хіп-хінж, спина нейтральна. Тягніть штангу до корпусу, зводячи лопатки разом. Лікті рухаються назад уздовж тіла. Повільно опустіть штангу вниз, зберігаючи контроль і стабільне положення спини. Рух виконується без інерції.",
    videoKey: "iSlR5jhcA_Y ",
    tags: ["strength","upperbody","back","lats","rear_delts","core","hip_hinge","control"]
},
 {
    name: "Single Arm Dumbbell Row (Control)",
    description: "Станьте у нахилі, спираючись однією рукою на стегно або лавку. Спина нейтральна, корпус стабільний. Потягніть гантель до пояса, ведучи лікоть назад уздовж тіла і зводячи лопатку. Повільно опустіть гантель вниз під контролем. Виконайте всі повторення на одну сторону, після чого змініть руку.",
    videoKey: "1AtoFpEzh4A",
    tags: ["strength","upperbody","back","lats","rear_delts","scapula","control","single_arm"],
    primaryZones: ["upper_back"],
    secondaryZones: ["shoulder","core"]
},
{
    name: "Offset Dumbbell Curl",
    description: "Виконуйте підйом гантелі однією рукою, зберігаючи стабільний корпус без скручування. Тримайте тіло рівно, контролюючи положення плечей і таза. Рух виконується під контролем, без інерції.",
    videoKey: "-fdV4v3gTYg",
    tags: ["strength","biceps","unilateral","core","anti_rotation","control"],
    primaryZones: ["biceps"],
    secondaryZones: ["core","shoulder"]
},
                {
                    name: "Тяга гантелей в нахилі (Dumbbell Row)",
                    description: "3 підходи по 12 повторень на кожну руку. Фокус на лопатках.",
                    videoKey: "dumbbell_row_v1",
                    tags: ["upperbody","strength","tissue","fatigue"]
                },
                {
                    name: "Віджимання від підлоги (Push-ups)",
                    description: "3 підходи до відмови. Контроль фази опускання.",
                    videoKey: "pushups_v1",
                    tags: ["upperbody","tissue","fatigue"]
                },
                {
                    name: "Жим гантелей стоячи (Overhead Press)",
                    description: "4 підходи по 10 повторень. Контроль корпусу.",
                    videoKey: "overhead_press_v1",
                    tags: ["upperbody","strength","tissue","fatigue"]
                },
                {
                    name: "Підтягування (Pull-ups/Lat Pulldown)",
                    description: "4 підходи по 8-12 повторень (залежно від рівня).",
                    videoKey: "pull_ups_v1",
                    tags: ["upperbody","strength","tissue","fatigue"]
                },
                {
                    name: "Розведення гантелей в сторони (Lateral Raises)",
                    description: "3 підходи по 15 повторень. Легка вага, ідеальна техніка.",
                    videoKey: "lateral_raises_v1",
                    tags: ["upperbody","tissue","injury_prevention"]
                },
                {
                    name: "Жим гантелей під нахилом (Incline Dumbbell Press)",
                    description: "3 підходи по 10 повторень. Фокус на верхній частині грудей.",
                    videoKey: "incline_dumbbell_v1",
                    tags: ["upperbody","strength","tissue","fatigue"]
                },
                {
  name: "TRX Row (легкий темп)",
  description: "3x12-15, контроль лопаток, без відмови.",
  videoKey: "trx_row_v1",
  tags: ["upperbody","strength","low_cns","tissue"]
},
{
  name: "Face Pull з резинкою",
  description: "3x15-20, пауза 1 сек в кінці.",
  videoKey: "face_pull_band_v1",
  tags: ["upperbody","injury_prevention","activation","low_cns"]
},

                {
                    name: "Тяга верхнього блоку вузьким хватом",
                    description: "3 підходи по 12 повторень. Робота на ширину спини.",
                    videoKey: "close_grip_pulldown_v1",
                    tags: ["upperbody","strength","tissue","fatigue"]
                },
            ]
        }
    },

    
    // =========================================================
    // 3. POST-TRAINING (ПІСЛЯТРЕНУВАЛЬНЕ ВІДНОВЛЕННЯ)
    // =========================================================
    "Post-Training": {

        "Recovery": {
            qualities: ['Recovery', 'Mobility'],
            exercises: [
                {
                    name: "Розтяжка згиначів стегна (Hip Flexor Stretch)",
                    description: "Утримувати 45 секунд на кожну сторону.",
                    videoKey: "hip_flexor_stretch_v1",
                    tags: ["recovery","mobility","tissue","injury_prevention"]
                },
                {
                    name: "Розтяжка грудних м'язів у дверному отворі",
                    description: "3 підходи по 30 секунд. Глибоке дихання.",
                    videoKey: "chest_stretch_v1",
                    tags: ["recovery","mobility","upperbody","tissue"]
                },
                {
                    name: "Розтяжка квадрицепсів стоячи",
                    description: "Утримувати 30 секунд на кожну ногу.",
                    videoKey: "quad_stretch_v1",
                    tags: ["recovery","mobility","tissue","injury_prevention"]
                },
                {
                    name: "Розтяжка підколінного сухожилля (Hamstring Stretch)",
                    description: "45 секунд у положенні сидячи або стоячи.",
                    videoKey: "hamstring_stretch_v1",
                    tags: ["recovery","mobility","tissue","injury_prevention"]
                },
                {
                    name: "Розтяжка трицепса і плечей",
                    description: "30 секунд на кожну руку.",
                    videoKey: "triceps_stretch_v1",
                    tags: ["recovery","mobility","upperbody","tissue"]
                },
                {
                    name: "Дихальні вправи лежачи (Belly Breathing)",
                    description: "5 хвилин повільного діафрагмального дихання.",
                    videoKey: "belly_breathing_v1",
                    tags: ["recovery","aerobic_flush","readiness"]
                },
                {
                    name: "Розтяжка гомілковостопного суглоба",
                    description: "По 30 секунд у кожному напрямку на обидві стопи.",
                    videoKey: "ankle_mobility_v1",
                    tags: ["recovery","mobility","injury_prevention"]
                },
                {
                    name: "Розтяжка ротаторів стегна (Figure-Four Stretch)",
                    description: "60 секунд утримання на кожну ногу.",
                    videoKey: "figure_four_v1",
                    tags: ["recovery","mobility","tissue","injury_prevention"]
                },
            ]
        },

        "FoamRolling": {
            qualities: ['Recovery'],
            exercises: [
                {
                    name: "Рол для квадрицепсів",
                    description: "90 секунд на кожну ногу. Працювати повільно, зупиняючись на больових точках.",
                    videoKey: "mpFwDn9piJg",
                    tags: ["recovery","tissue","myofascial","injury_prevention"]
                },
                {
                    name: "Рол для задньої поверхні стегна",
                    description: "90 секунд на кожну ногу. Працювати повільно, зупиняючись на больових точках.",
                    videoKey: "natzfgf8oUo",
                    tags: ["recovery","tissue","myofascial","injury_prevention"]
                },
                {
                    name: "Рол для сідниць та зовнішньої сторони стегна (IT Band)",
                    description: "90 секунд на кожну ногу. Обережно на IT-ділянці.",
                    videoKey: "foam_glutes_v1",
                    tags: ["recovery","tissue","myofascial","injury_prevention"]
                },
                {
                    name: "Glute Ball Release",
                    description: "Сядьте на м’яч, розмістивши його під сідницею. Повільно переміщайте вагу тіла, знаходячи чутливі точки. Затримуйтесь на них 20–30 секунд, зберігаючи контроль дихання. Рух виконується повільно, без різкого тиску.",
                    videoKey: "b4qSgj1htuA",
                    tags: ["recovery","glutes","myofascial","tissue","injury_prevention"],
                    primaryZones: ["glute"],
                    secondaryZones: ["hip","lower_back"]
                },
                {
                    name: "Proximal Hamstring Ball Release",
                    description: "Сядьте на м’яч, розмістивши його під нижньою частиною сідниці, в зоні прикріплення задньої поверхні стегна. Повільно переміщайте вагу тіла, знаходячи чутливі точки. Затримуйтесь на них 20–30 секунд, зберігаючи контроль дихання. Уникайте різкого тиску.",
                    videoKey: "ZnQXePLxXGQ",
                    tags: ["recovery","hamstrings","glutes","myofascial","tissue","injury_prevention"],
                    primaryZones: ["hamstring"],
                    secondaryZones: ["glute","hip"]
                },
                {
                    name: "Рол для верхньої частини спини",
                    description: "60 секунд. Рухатися від попереку до плечей.",
                    videoKey: "7nPtIsR5L28",
                    tags: ["recovery","tissue","myofascial","upperbody"]
                },
                {
                    name: "Рол для середньої частини спини",
                    description: "60 секунд. Рухатися від поясниці до грудного відділення.",
                    videoKey: "odgNO-4n9xU",
                    tags: ["recovery","tissue","myofascial","upperbody"]
                },
                {
                    name: "Рол для нижньої частини спини",
                    description: "60 секунд. Рухатися від попереку до середньої частини.",
                    videoKey: "J7LxJbkKTA4",
                    tags: ["recovery","tissue","myofascial","upperbody"]
                },
                
                {
                    name: "Рол для литкових м'язів (Calves)",
                    description: "60 секунд на кожну ногу, обертаючи ногу для зовнішньої/внутрішньої частини.",
                    videoKey: "euZDk0MNJBQ",
                    tags: ["recovery","tissue","myofascial","injury_prevention"]
                },
                {
                    name: "Рол для привідних м'язів (Adductors)",
                    description: "90 секунд на кожну ногу, лежачи обличчям вниз.",
                    videoKey: "foam_adductors_v1",
                    tags: ["recovery","tissue","myofascial","injury_prevention"]
                },
                {
                    name: "Рол для підколінних сухожиль",
                    description: "60 секунд на кожну ногу, працюючи від сідниць до колін.",
                    videoKey: "foam_hamstrings_v1",
                    tags: ["recovery","tissue","myofascial","injury_prevention"]
                },
                {
                    name: "М'яч для стоп (Plantar Fascia)",
                    description: "1-2 хвилини прокатки тенісним м'ячем/роликом для стоп.",
                    videoKey: "foot_ball_v1",
                    tags: ["recovery","tissue","myofascial","injury_prevention"]
                },
            ]
        }

    }

};
// expose to window (важливо для weekly-individual.js)
const INJURY_ZONES = [
    "foot",
    "ankle",
    "achilles",
    "calf",
    "knee",
    "quad",
    "hamstring",
    "groin",
    "glute",
    "hip",
    "core",
    "lower_back",
    "upper_back",
    "chest",
    "shoulder",
    "elbow",
    "wrist",
    "neck"
];

const SECONDARY_ZONE_LINKS = {
    foot: ["ankle", "achilles", "calf"],
    ankle: ["foot", "achilles", "calf", "knee"],
    achilles: ["calf", "ankle", "foot", "knee"],
    calf: ["achilles", "ankle", "knee"],
    knee: ["quad", "hamstring", "ankle", "hip"],
    quad: ["knee", "hip"],
    hamstring: ["glute", "hip", "lower_back", "knee"],
    groin: ["hip", "core", "glute"],
    glute: ["hip", "hamstring", "lower_back", "knee"],
    hip: ["groin", "glute", "hamstring", "lower_back", "knee"],
    core: ["lower_back", "hip"],
    lower_back: ["core", "hip", "hamstring"],
    upper_back: ["shoulder", "neck", "chest"],
    chest: ["shoulder", "upper_back"],
    shoulder: ["upper_back", "neck", "elbow", "chest"],
    elbow: ["shoulder", "wrist"],
    wrist: ["elbow", "shoulder"],
    neck: ["upper_back", "shoulder"]
};

function normalizeZoneKey(raw) {
    const direct = String(raw || "").toLowerCase().trim().replace(/\s+/g, "_");
    if (!direct) return "";
    if (INJURY_ZONES.includes(direct)) return direct;

    const t = String(raw || "").toLowerCase();
    if (/achilles|ахіл/.test(t)) return "achilles";
    if (/ankle|гомілкостоп|щиколот/.test(t)) return "ankle";
    if (/foot|стоп|plantar/.test(t)) return "foot";
    if (/calf|икр|литк/.test(t)) return "calf";
    if (/knee|колін|patella|пател|menisc|меніск|acl|mcl|lcl|pcl/.test(t)) return "knee";
    if (/quad|квадриц|квадр/.test(t)) return "quad";
    if (/hamstring|biceps femoris|задн/.test(t)) return "hamstring";
    if (/groin|adductor|пах|привід/.test(t)) return "groin";
    if (/glute|сідниц/.test(t)) return "glute";
    if (/hip|кульш|тазостег/.test(t)) return "hip";
    if (/lower[\s_-]?back|lumbar|поперек/.test(t)) return "lower_back";
    if (/upper[\s_-]?back|thoracic|лопат|trapez|lats|rear_delts/.test(t)) return "upper_back";
    if (/core|abs|прес|кор\b/.test(t)) return "core";
    if (/chest|груд/.test(t)) return "chest";
    if (/shoulder|плеч|rotator/.test(t)) return "shoulder";
    if (/elbow|лікоть|локоть/.test(t)) return "elbow";
    if (/wrist|запяст|кист/.test(t)) return "wrist";
    if (/neck|cervic|ши[яї]/.test(t)) return "neck";
    return "";
}

function uniqueZones(list) {
    const out = [];
    (Array.isArray(list) ? list : []).forEach((z) => {
        const n = normalizeZoneKey(z);
        if (n && !out.includes(n)) out.push(n);
    });
    return out;
}

function inferPrimaryZonesFromLegacy(exercise, categoryName) {
    const tags = Array.isArray(exercise?.tags) ? exercise.tags.map((t) => String(t).toLowerCase()) : [];
    const text = `${exercise?.name || ""} ${categoryName || ""} ${tags.join(" ")}`.toLowerCase();
    const out = [];
    const add = (zone) => { if (zone && !out.includes(zone)) out.push(zone); };

    if (/foot|стоп|plantar/.test(text)) add("foot");
    if (/ankle|гомілкостоп|щиколот/.test(text)) add("ankle");
    if (/achilles|ахіл/.test(text)) add("achilles");
    if (/calf|икр|литк/.test(text)) add("calf");
    if (/knee|колін|patella|пател|knee_control|knee_dominant/.test(text)) add("knee");
    if (/quad|quads|квадриц|квадр/.test(text)) add("quad");
    if (/hamstring|задн/.test(text)) add("hamstring");
    if (/groin|adductor|пах|привід/.test(text)) add("groin");
    if (/glute|glutes|сідниц/.test(text)) add("glute");
    if (/hip|hip_hinge|кульш|тазостег/.test(text)) add("hip");
    if (/core|abs|прес|кор\b/.test(text)) add("core");
    if (/lower[\s_-]?back|lumbar|поперек/.test(text)) add("lower_back");
    if (/upper[\s_-]?back|thoracic|лопат|lats|rear_delts|scapula/.test(text)) add("upper_back");
    if (/chest|груд/.test(text)) add("chest");
    if (/shoulder|плеч|rotator/.test(text)) add("shoulder");
    if (/elbow|лікоть|локоть/.test(text)) add("elbow");
    if (/wrist|запяст|кист/.test(text)) add("wrist");
    if (/neck|cervic|ши[яї]/.test(text)) add("neck");

    return out;
}

function inferSecondaryZones(primaryZones) {
    const out = [];
    (Array.isArray(primaryZones) ? primaryZones : []).forEach((z) => {
        const linked = Array.isArray(SECONDARY_ZONE_LINKS[z]) ? SECONDARY_ZONE_LINKS[z] : [];
        linked.forEach((s) => {
            const n = normalizeZoneKey(s);
            if (!n) return;
            if (primaryZones.includes(n)) return;
            if (!out.includes(n)) out.push(n);
        });
    });
    return out;
}

function enrichExerciseZones(library) {
    if (!library || typeof library !== "object") return;
    Object.keys(library).forEach((stageName) => {
        const stage = library[stageName];
        if (!stage || typeof stage !== "object") return;
        Object.keys(stage).forEach((categoryName) => {
            const category = stage[categoryName];
            const exercises = Array.isArray(category?.exercises) ? category.exercises : [];
            exercises.forEach((exercise) => {
                const basePrimary = uniqueZones(exercise?.primaryZones);
                const baseSecondary = uniqueZones(exercise?.secondaryZones);

                let primary = basePrimary;
                let secondary = baseSecondary;

                if (!primary.length && !secondary.length) {
                    primary = inferPrimaryZonesFromLegacy(exercise, categoryName);
                    secondary = inferSecondaryZones(primary);
                }

                exercise.primaryZones = uniqueZones(primary);
                exercise.secondaryZones = uniqueZones(secondary).filter((z) => !exercise.primaryZones.includes(z));
            });
        });
    });
}

function isPlaceholderVideoKey(videoKey) {
    const key = String(videoKey || "").trim();
    return /_v\d+$/i.test(key);
}

function stripPlaceholderExercises(library) {
    if (!library || typeof library !== "object") return;
    Object.keys(library).forEach((stageName) => {
        const stage = library[stageName];
        if (!stage || typeof stage !== "object") return;
        Object.keys(stage).forEach((categoryName) => {
            const category = stage[categoryName];
            if (!category || typeof category !== "object") return;
            if (!Array.isArray(category.exercises)) return;
            category.exercises = category.exercises.filter((exercise) => !isPlaceholderVideoKey(exercise?.videoKey));
        });
    });
}

stripPlaceholderExercises(EXERCISE_LIBRARY);
enrichExerciseZones(EXERCISE_LIBRARY);
window.EXERCISE_LIBRARY = EXERCISE_LIBRARY;
window.QUALITIES = QUALITIES;
window.MD_RECOMMENDATIONS = MD_RECOMMENDATIONS;
window.INJURY_ZONES = INJURY_ZONES;
