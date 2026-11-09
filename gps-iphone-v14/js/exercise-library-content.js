// Curated built-in content. Identity, prescriptions, coach loads and history stay on the plan item.
// Muscle anatomy is separate from loaded body zones; neither is a medical clearance.
(function () {
  'use strict';
  const version='2026-11-09-library-1', records=[];
  function add(key, media, uk, en, muscles, support, primary, secondary, pattern, equipment, impact, ukText, enText) {
    records.push({key,media,name_i18n:{uk,en},primaryMuscles:muscles.split(','),secondaryMuscles:support?support.split(','):[],
      primaryZones:primary.split(','),secondaryZones:secondary?secondary.split(','):[],movementPattern:pattern,
      equipment:equipment?equipment.split(','):[],impact,description_i18n:{uk:ukText,en:enText},technique_i18n:{uk:ukText,en:enText}});
  }
  add('mDwiyCcr_7k','','Колові рухи стегном','Hip Circles','hip_flexors,gluteus_medius','adductors','hip','groin,glute','hip_mobility','', 'none',
    'Стань біля опори. Підніми зігнуте коліно й повільно опиши стегном коло в обидва боки. Таз тримай рівно; не компенсуй рух прогином попереку. Повтори іншою ногою.',
    'Stand beside a support. Lift one bent knee and slowly circle the hip in both directions. Keep the pelvis level without arching your lower back. Repeat on the other side.');
  add('ТУТ_ТВОЄ_ВІДЕО','','Румунська тяга на одній нозі','Single Leg Romanian Deadlift (Control)','hamstrings,gluteus_maximus','spinal_erectors,abdominals','hamstring,glute','hip,lower_back,knee,ankle','hinge','', 'none',
    'Стань на одну ногу, трохи зігни коліно. Відведи таз назад і нахили корпус, витягуючи вільну ногу назад. Тримай таз без розвороту, спину нейтральною. Повернись через опорну ногу.',
    'Stand on one leg with a soft knee. Push the hips back and hinge forward as the free leg reaches behind you. Keep the pelvis square and spine neutral. Return through the supporting leg.');
  add('vYJLnJaifc4','','Розкриття грудного відділу лежачи','Side-Lying Thoracic Rotation','thoracic_rotators','obliques','upper_back','shoulder,core','rotation','', 'none',
    'Ляж на бік, зігни коліна й склади руки перед собою. Розкривай верхню руку назад, повертаючи грудну клітку. Коліна залишай разом; не дотискай плече до підлоги силою.',
    'Lie on your side with bent knees and arms together in front. Open the upper arm behind you while rotating the chest. Keep the knees together and do not force the shoulder to the floor.');
  add('dR-47yjhJjo','','Бокова планка з опорою на лавку','Bench Side Plank','obliques','gluteus_medius,deltoids','core','shoulder,hip,elbow','anti_lateral_flexion','bench','none',
    'Постав передпліччя на лавку, лікоть під плечем. Підніми таз і тримай тіло однією лінією. Дихай рівномірно; не провисай у плечі й не розвертай таз. Зміни бік за планом.',
    'Place the forearm on a bench with the elbow under the shoulder. Lift the hips into a straight body line. Breathe steadily; do not sink into the shoulder or rotate the pelvis. Change sides as prescribed.');
  add('KLSr8sDun_Q','','Зворотне нордичне згинання','Reverse Nordic Curl','quadriceps','abdominals','quad,knee','hip,core','knee_extension','mat','none',
    'Стань на коліна на м’яку опору. Тримай стегна й корпус однією лінією та повільно відхиляйся назад у контрольованій амплітуді. Повернись без ривка. Не згинайся в тазі.',
    'Kneel on a padded surface. Keep thighs and torso in one line and slowly lean back within a controlled range. Return without jerking. Do not fold at the hips.');
  add('JKfb2VKZdz0','','Бокові кроки ковзаняра з резинкою','Mini Band Lateral Skater Steps','gluteus_medius,gluteus_maximus','quadriceps','glute,hip','knee,ankle','lateral_step','mini_band','low',
    'Надягни міні-резинку й займи неглибокий присід. Крокуй убік короткими кроками ковзаняра, зберігаючи натяг. Коліна спрямовуй за стопами; не зводь їх усередину.',
    'Wear a mini band and take a shallow squat position. Make short lateral skater steps while maintaining band tension. Keep knees aligned with feet rather than collapsing inward.');
  add('6KE-wOyBTFY','','Утримання випаду з роботою рук','Isometric Lunge with Arm Drive','quadriceps,gluteus_maximus','abdominals,deltoids','quad,glute,knee','hip,core,shoulder','lunge_isometric','', 'none',
    'Займи випад і зафіксуй ноги. Працюй руками, як під час бігу, без рухів тазом. Переднє коліно спрямоване за стопою; корпус стабільний. Поміняй ноги за планом.',
    'Hold a split-lunge position with still legs. Drive the arms as in running without moving the pelvis. Keep the front knee aligned with the foot and torso stable. Switch legs as prescribed.');
  add('nN7IIrNJxsw','','Бігова робота рук','Arm Drive Drill','deltoids','latissimus_dorsi,abdominals','shoulder','elbow,core','arm_drive','', 'none',
    'Стань рівно, зігни лікті. Рухай руками вперед-назад від плеча, як під час бігу. Плечі опущені, кисті розслаблені; не розгойдуй корпус і не перехрещуй руки перед грудьми.',
    'Stand tall with bent elbows. Swing the arms forward and back from the shoulders as in running. Keep shoulders down and hands relaxed; avoid torso sway or crossing the arms over the chest.');
  add('lknh7mTH6d0','resisted-split-stance-drive','Біговий поштовх із розножки з опором','Resisted Split Stance Drive','gluteus_maximus,quadriceps','calves,abdominals','glute,quad,hip','knee,ankle,achilles,core','acceleration','resistance_band','low',
    'Надійно закріпи резинку позаду й займи розножку. Відштовхуйся задньою ногою та виконуй біговий поштовх уперед проти опору. Зберігай нахил усього тіла, стабільний таз і контроль повернення.',
    'Secure the band behind you and take a split stance. Push through the rear leg into a running drive against resistance. Maintain a whole-body lean, stable pelvis and controlled return.');
  add('eEIjdqHgCC8','resisted-high-knee-run','Біг із високим коліном проти опору','Resisted High Knee Run','hip_flexors,gluteus_maximus','calves,abdominals','hip,glute,calf','knee,ankle,achilles,core','running','resistance_band','moderate',
    'Закріпи резинку позаду. Почергово піднімай коліна, швидко змінюй опору й працюй руками. Тримай таз стабільним і приземляйся під корпусом. Не відхиляйся назад, щоб підняти коліно вище.',
    'Secure the band behind you. Alternate high knees, quick ground contacts and coordinated arm drive. Keep the pelvis stable and land beneath the body. Do not lean backward to lift the knee higher.');
  add('84Uo-FLpLp4','mini-band-lateral-shuffle','Бокове переміщення з міні-резинкою','Mini Band Lateral Shuffle','gluteus_medius','gluteus_maximus,quadriceps','glute,hip','knee,ankle','lateral_step','mini_band','low',
    'Займи спортивну стійку з міні-резинкою. Пересувайся боком короткими кроками, не зводячи стопи й не втрачаючи натягу. Таз на одній висоті, коліна за напрямком стоп.',
    'Take an athletic stance with a mini band. Shuffle sideways with short steps without bringing the feet together or losing tension. Keep the pelvis level and knees tracking over the feet.');
  add('KLuk_WLnOjs','dynamic-arm-raises','Динамічне піднімання рук','Dynamic Arm Raises','deltoids','serratus_anterior,trapezius','shoulder','upper_back,neck','shoulder_raise','', 'none',
    'Стань рівно й плавно піднімай та опускай руки в контрольованій амплітуді. Ребра не випинай, плечі не підтягуй до вух. Рухайся без махів корпусом.',
    'Stand tall and smoothly raise and lower the arms through a controlled range. Keep ribs down and shoulders away from the ears. Avoid swinging the torso.');
  add('9azyxpB2hAA','forward-lunge-continuous-tension','Випад із безперервним напруженням','Forward Lunge (Continuous Tension)','quadriceps,gluteus_maximus','adductors,abdominals','quad,glute,knee','hip,ankle,core','lunge','', 'none',
    'Займи позицію випаду. Опускайся та піднімайся без повного розслаблення вгорі. Вага на всій передній стопі, коліно рухається за нею. Не відштовхуйся ривком і не завалюй таз.',
    'Take a lunge stance. Lower and rise while maintaining tension at the top. Keep weight across the front foot and the knee tracking with it. Avoid bouncing or tipping the pelvis.');
  add('LSoKax5QycI','knee-drive','Динамічний підйом коліна','Knee Drive Dynamic','hip_flexors','gluteus_maximus,abdominals','hip','knee,ankle,core','knee_drive','', 'low',
    'З опори на одну ногу підніми інше коліно вперед і поверни під контролем. Поєднуй рух із протилежною рукою. Не розвертай таз і не закидай корпус назад.',
    'From a single-leg support, drive the opposite knee forward and return with control. Coordinate the opposite arm. Keep the pelvis square and avoid leaning backward.');
  add('KsEHHZMPQFY','','Стабільність гомілкостопа на одній нозі','Single Leg Ankle Stability Drill','calves,foot_intrinsics','gluteus_medius','ankle,foot','calf,achilles,knee,hip','balance','', 'none',
    'Стань на одну ногу біля опори. Утримуй три точки стопи на підлозі та роби невеликі контрольовані зміщення ваги. Не завалюй стопу всередину й не блокуй коліно.',
    'Stand on one leg near a support. Maintain three-point foot contact and make small controlled weight shifts. Avoid collapsing the arch or locking the knee.');
  add('74u69OLencM','resisted-alternating-knee-drive','Почерговий підйом колін з опором','Resisted Alternating Knee Drive','hip_flexors,gluteus_maximus','abdominals,calves','hip,glute','knee,ankle,core','knee_drive','resistance_band','low',
    'Закріпи резинку й займи стійке положення, як на демонстрації. Почергово піднімай коліна проти опору та контрольовано повертай стопу. Таз не розгойдуй, поперек не прогинай. Темп і повторення — за планом.',
    'Secure the band and take the stable position shown in the demo. Alternate knee drives against resistance and return each foot with control. Keep the pelvis still and avoid arching the lower back. Follow the prescribed tempo and repetitions.');
  add('YAQkGSKokWE','','Контрольований випад на одній нозі','Single Leg Step Control Lunge','quadriceps,gluteus_maximus','gluteus_medius','quad,glute,knee','hip,ankle','lunge','', 'low',
    'Зроби контрольований крок у випад і повернись через опорну ногу. Тримай таз рівно, коліно за напрямком стопи. Виконуй повільно, без падіння вниз і поштовху корпусом.',
    'Step into a controlled lunge and return through the supporting leg. Keep the pelvis level and knee tracking with the foot. Move slowly without dropping down or throwing the torso.');
  add('EeQHsunHRIA','hip-hinge-activation-barbell','Відпрацювання нахилу зі штангою','Hip Hinge Activation (Barbell)','hamstrings,gluteus_maximus','spinal_erectors,abdominals','hamstring,glute,hip','lower_back,knee,core','hinge','barbell','none',
    'Візьми легку штангу. Трохи зігни коліна й відводь таз назад, ведучи гриф близько до ніг. Зупини нахил, поки спина нейтральна. Випрямись за рахунок стегон, без перерозгинання попереку.',
    'Use a light barbell. Soften the knees and push the hips back, keeping the bar close to the legs. Stop while the spine remains neutral. Extend through the hips without overextending the lower back.');
  add('0rXbHL3dxk4','glute-bridge-activation','Сідничний місток','Glute Bridge','gluteus_maximus','hamstrings,abdominals','glute','hip,hamstring,lower_back','hip_extension','mat','none',
    'Ляж на спину, зігни коліна, постав стопи на підлогу. Підніми таз до лінії плечі–таз–коліна й плавно опусти. Тисни стопами в підлогу; не підміняй рух прогином попереку.',
    'Lie on your back with bent knees and feet on the floor. Lift the pelvis into a shoulder–hip–knee line and lower smoothly. Press through the feet rather than arching the lower back.');
  add('HWGUZzeuBAo','prone-scapular-retraction-hold','Утримання зведених лопаток лежачи','Scapular Activation Hold','rhomboids,middle_trapezius','rear_deltoids','upper_back','shoulder,neck','scapular_retraction','mat','none',
    'Ляж на живіт, розташуй руки як у демонстрації. Легко підніми руки та зведи лопатки без піднімання плечей до вух. Шия продовжує лінію спини, дихання вільне.',
    'Lie face down with arms positioned as shown. Gently lift the arms and draw the shoulder blades together without shrugging. Keep the neck aligned with the spine and breathe freely.');
  add('wMxl5mNFLEA','dynamic-shoulder-activation-hinge','Динамічна активація лопаток у нахилі','Dynamic Scapular Activation','middle_trapezius,lower_trapezius','rear_deltoids,spinal_erectors','upper_back,shoulder','lower_back,hip,neck','scapular_control','', 'none',
    'Нахили корпус від тазу з нейтральною спиною. Виконуй рухи руками й лопатками, як на демонстрації, без ривків. Зберігай положення корпусу; не підтягуй плечі до вух.',
    'Hinge at the hips with a neutral spine. Move the arms and shoulder blades as shown without jerking. Keep the torso still and avoid shrugging.');
  add('CMOuMStw1uA','','Піднімання таза у зворотному упорі','Reverse Tabletop Hip Lift','gluteus_maximus','hamstrings,triceps,deltoids','glute,hip','shoulder,wrist,elbow,lower_back','hip_extension','', 'none',
    'Сядь, постав долоні позаду й стопи на підлогу. Підніми таз у зворотний упор, зберігаючи комфортне положення плечей. Опускайся під контролем; не закидай голову.',
    'Sit with hands behind you and feet on the floor. Lift the hips into a reverse tabletop within a comfortable shoulder range. Lower with control and avoid throwing the head back.');
  add('uZy9GRGJ9k0','','Пташка-собака','Bird-Dog','abdominals,spinal_erectors','gluteus_maximus,deltoids','core','lower_back,hip,shoulder,wrist,knee','anti_rotation','mat','none',
    'Стань навкарачки, долоні під плечима. Витягни протилежні руку й ногу, не повертаючи таз і не прогинаючи поперек. Повернись та зміни сторону. Краще коротша амплітуда зі стабільним корпусом.',
    'Start on all fours with hands under shoulders. Reach the opposite arm and leg without rotating the pelvis or arching the lower back. Return and switch sides. Prioritize a stable torso over reach distance.');
  add('I_JbLLGm248','dead-bug-core-control','Почергове опускання руки й ноги лежачи','Dynamic Dead Bug','abdominals,obliques','hip_flexors','core','hip,lower_back,shoulder','anti_extension','mat','none',
    'Ляж на спину, підніми руки й зігнуті ноги. Повільно відводь протилежні руку та ногу, не відриваючи поперек від контрольованого положення. Видихай під час розгинання; скороти амплітуду, якщо спина прогинається.',
    'Lie on your back with arms raised and hips and knees bent. Slowly extend the opposite arm and leg while maintaining the lower-back position. Exhale during extension; shorten the range if the back arches.');
  add('SKYuwr-0Hw8','elbow-plank','Планка на передпліччях','Elbow Plank','abdominals,obliques','gluteus_maximus,deltoids','core','shoulder,elbow,lower_back','anti_extension','mat','none',
    'Постав лікті під плечима, обіприся на передпліччя й носки. Тримай голову, корпус і таз однією лінією. Дихай рівно; не провисай у попереку й не підіймай таз надто високо.',
    'Place elbows beneath shoulders and support yourself on forearms and toes. Keep head, trunk and hips in one line. Breathe steadily; avoid sagging through the lower back or lifting the hips too high.');
  add('b9uy94AC7UE','','Супермен лежачи','Superman','spinal_erectors','gluteus_maximus,lower_trapezius','lower_back','glute,shoulder,neck','back_extension','mat','none',
    'Ляж на живіт. Трохи підніми руки й ноги без ривка, шию тримай нейтрально. Плавно повернись на підлогу. Не намагайся піднятися якомога вище через сильний прогин.',
    'Lie face down. Lift arms and legs slightly without jerking, keeping the neck neutral. Return smoothly to the floor. Do not chase height by excessively arching the back.');
  add('oWIX2qKxscQ','','Координація з жонглюванням м’ячами','Ball Juggling Coordination','deltoids,forearm_flexors','abdominals','shoulder','elbow,wrist,core','coordination','small_ball','none',
    'Стань стійко. Перекидай і лови м’ячі за заданою послідовністю на зручній висоті. Дивись уперед, тримай плечі розслабленими. Спершу збережи контроль, потім підвищуй темп.',
    'Stand in a stable position. Toss and catch the balls in the prescribed sequence at a comfortable height. Look ahead and relax the shoulders. Establish control before increasing speed.');
  add('4bLOUxEBcxE','dual-ball-reaction-drill','Реакція з двома м’ячами','Dual Ball Reaction Drill','deltoids,forearm_flexors','abdominals','shoulder','elbow,wrist,core','reaction','small_ball','low',
    'Візьми два м’ячі й виконуй почергові кидки та ловлю за схемою демонстрації. Зберігай стійку й контролюй обидва м’ячі поглядом. Не підвищуй темп ціною точності.',
    'Use two balls and alternate throws and catches following the demo sequence. Maintain your stance and track both balls. Do not sacrifice accuracy for speed.');
  add('1PRk-nrevdc','single-arm-wall-reaction-catch','Ловля від стіни однією рукою','Single Arm Wall Reaction Catch','deltoids,forearm_flexors','abdominals','shoulder','elbow,wrist,core','reaction','small_ball,wall','low',
    'Стань на безпечній відстані від стіни. Кинь м’яч однією рукою й злови відскок відповідно до завдання. Почни з передбачуваного відскоку; не кидай у людей чи скло.',
    'Stand a safe distance from a solid wall. Throw with one hand and catch the rebound as prescribed. Start with predictable rebounds; do not throw toward people or glass.');
  add('1t2MbGijS-I','barbell-front-squat','Фронтальний присід зі штангою','Barbell Front Squat (Strength)','quadriceps,gluteus_maximus','abdominals,spinal_erectors','quad,glute,knee','hip,ankle,lower_back,shoulder,wrist','squat','barbell','none',
    'Поклади гриф на передню частину плечей, підніми лікті. Присядь у контрольованій амплітуді, тримаючи стопи на підлозі й коліна за їх напрямком. Встань без втрати положення корпусу. Вагу бери із завдання тренера.',
    'Rest the bar on the front of the shoulders with elbows raised. Squat through a controlled range, keeping feet grounded and knees aligned with them. Stand without losing trunk position. Use the coach-prescribed load.');
  add('VRr6RI11cmU','','Зворотний випад на місці','Reverse Lunge (In Place)','quadriceps,gluteus_maximus','adductors,abdominals','quad,glute,knee','hip,ankle,core','lunge','', 'none',
    'Зроби крок назад і опустися у випад під контролем. Передня стопа залишається повністю на підлозі. Відштовхнись передньою ногою та повернись. Не завалюй коліно всередину.',
    'Step backward and lower into a controlled lunge. Keep the front foot fully grounded. Push through the front leg to return. Avoid allowing the knee to collapse inward.');
  add('XZgTaDIAX8k','','Присід із вагою перед грудьми','Goblet Squat','quadriceps,gluteus_maximus','abdominals','quad,glute,knee','hip,ankle,lower_back,shoulder','squat','dumbbell','none',
    'Тримай гантель або гирю біля грудей. Присядь, зберігаючи опору всією стопою й нейтральну спину. Коліна рухаються за стопами. Встань плавно, без ривка попереком.',
    'Hold a dumbbell or kettlebell at the chest. Squat while keeping the whole foot grounded and spine neutral. Knees track with the feet. Stand smoothly without jerking the lower back.');
  add('iZHKJLM4yjo','','Присід із несиметричною вагою','Offset Goblet Squat','quadriceps,gluteus_maximus','obliques','quad,glute,knee','hip,ankle,core,shoulder','squat','dumbbell','none',
    'Тримай вагу перед корпусом зі зміщенням на один бік. Присядай, не нахиляючись до ваги й не повертаючи таз. Зберігай рівний тиск стопами. Зміни бік за планом.',
    'Hold the load in front of the torso offset to one side. Squat without leaning toward the weight or rotating the pelvis. Maintain even foot pressure. Change sides as prescribed.');
  add('C5J_BGYHY4I','front-foot-elevated-split-squat','Спліт-присід із передньою ногою на підвищенні','Front Foot Elevated Split Squat (Strength)','quadriceps,gluteus_maximus','adductors','quad,glute,knee','hip,ankle,core','split_squat','step','none',
    'Постав передню стопу на стійке невисоке підвищення, задню залиш позаду. Опускай таз вниз між ногами й піднімайся через передню стопу. Коліно контролюй за напрямком стопи; не втрачай рівновагу.',
    'Place the front foot on a stable low platform with the rear foot behind. Lower the pelvis between the legs and rise through the front foot. Keep the knee aligned with the foot and maintain balance.');
  add('v4tLgYMhOB4','barbell-romanian-deadlift-strength','Румунська тяга зі штангою','Barbell Romanian Deadlift','hamstrings,gluteus_maximus','spinal_erectors,abdominals','hamstring,glute','hip,lower_back,knee,core','hinge','barbell','none',
    'Тримай штангу перед стегнами. З м’якими колінами відводь таз назад, гриф веди біля ніг. Опускайся лише доки зберігаєш нейтральну спину. Випрямляй таз без відхилення назад.',
    'Hold the bar in front of the thighs. With soft knees, push the hips backward and keep the bar close to the legs. Lower only while maintaining a neutral spine. Extend the hips without leaning back.');
  add('2s1WgotD0hA','offset-load-forward-lunge','Випад уперед із вагою з одного боку','Offset Load Forward Lunge','quadriceps,gluteus_maximus','obliques,adductors','quad,glute,knee','hip,ankle,core,shoulder','lunge','dumbbell','none',
    'Тримай вагу з одного боку, як показано. Зроби випад уперед і повернись через передню ногу. Не нахиляйся до ваги та не розвертай корпус. Контролюй коліно й м’яке опускання.',
    'Hold the load on one side as shown. Lunge forward and return through the front leg. Do not lean toward the load or rotate the torso. Control knee alignment and the lowering phase.');
  add('8fnWi7DQ0uU','','Присід на одній нозі з підтримкою TRX','TRX Reverse Single Leg Squat','quadriceps,gluteus_maximus','gluteus_medius','quad,glute,knee','hip,ankle,shoulder,wrist','single_leg_squat','suspension_trainer','none',
    'Візьми ручки надійно закріпленого TRX. Присядай на опорній нозі, використовуючи руки лише для потрібної підтримки. Тримай таз рівно й коліно над стопою. Не падай униз і не витягуй себе лише руками.',
    'Hold the handles of a securely anchored suspension trainer. Squat on the supporting leg, using only the assistance needed. Keep the pelvis level and knee aligned with the foot. Do not drop down or pull yourself up entirely with the arms.');
  add('KYA7lc6wlNo','','Боковий поштовх із резинкою та стабілізацією','Band Resisted Drive (Single Leg Stability)','gluteus_medius,gluteus_maximus,quadriceps','calves,abdominals','hip,glute,knee','ankle,achilles,core','lateral_force','resistance_band','moderate',
    'Надійно закріпи резинку. Виконай поштовх ногою вбік проти опору, імітуючи удар або зміну напрямку, та стабілізуйся на опорній нозі. Таз і корпус тримай під контролем; коліно не завалюй усередину. Повтори лише після відновлення рівноваги.',
    'Secure the band. Drive the leg sideways against resistance as in a kick or change of direction, then stabilize on the supporting leg. Control the pelvis and trunk; do not allow inward knee collapse. Repeat only after regaining balance.');
  add('kKrsaCgXAT4','lateral-bound-power-drill','Потужний боковий стрибок','Lateral Bound Power Drill','gluteus_maximus,gluteus_medius,quadriceps','calves','glute,quad,knee,ankle','hip,achilles,core','lateral_jump','', 'high',
    'Відштовхнись однією ногою вбік і приземлись на іншу. Амортизуй через таз, коліно й гомілкостоп. Коліно не завалюй усередину. Дальність збільшуй лише зі збереженням контрольованого приземлення.',
    'Push sideways from one leg and land on the other. Absorb the landing through hip, knee and ankle. Keep the knee from collapsing inward. Increase distance only while maintaining landing control.');
  add('bk6dVRjq_R0','rotational-medicine-ball-throw','Ротаційний кидок медболу','Rotational Medicine Ball Throw','obliques,gluteus_maximus','pectoralis_major,deltoids','core,hip','shoulder,elbow,wrist,knee,lower_back','rotation_power','medicine_ball','moderate',
    'Стань боком до безпечної зони кидка. Поверни таз і корпус та кинь медбол узгодженим рухом. Дозволь стопам повертатися; не скручуй коліно на зафіксованій стопі. Лови відскок лише якщо це передбачено.',
    'Stand side-on to a safe throwing area. Rotate hips and trunk together to throw the medicine ball. Allow the feet to pivot; do not twist the knee over a fixed foot. Catch rebounds only when prescribed.');
  add('BCEHfakT4fs','','Боковий стрибок із фіксацією','Skater Jump to Stick','gluteus_medius,gluteus_maximus,quadriceps','calves','glute,quad,knee,ankle','hip,achilles,core','lateral_jump_stick','', 'high',
    'Стрибни вбік на іншу ногу й зафіксуй рівновагу перед наступним повторенням. Приземляйся м’яко зі згинанням ноги. Не поспішай у наступний стрибок, поки таз і коліно не стабільні.',
    'Jump sideways onto the other leg and establish balance before the next repetition. Land softly with a bent leg. Do not rush into another jump before the pelvis and knee are stable.');
  add('AqUPofTHGJoО','reactive-lateral-box-jump-with-rotation','Боковий стрибок на тумбу з поворотом','Lateral Rotational Box Jump','quadriceps,gluteus_maximus','calves,obliques','quad,glute,knee,ankle','hip,achilles,core','rotational_jump','box','high',
    'Використовуй стійку тумбу відповідної висоти. Виконай боковий стрибок із поворотом, як на демонстрації, і м’яко зафіксуй приземлення. Спускайся контрольовано. Не збільшуй висоту ціною точності.',
    'Use a stable box at an appropriate height. Jump laterally with the demonstrated rotation and hold a soft landing. Step down under control. Do not increase height at the expense of accuracy.');
  add('EcIPaghUaec','repeated-single-leg-hops','Повторні підскоки на одній нозі','Repeated Single Leg Hops','calves,quadriceps','gluteus_maximus','calf,ankle,achilles,knee','hip,foot,core','hopping','', 'high',
    'Виконуй серію невисоких підскоків на одній нозі в заданому напрямку. Зберігай пружний контакт, рівний таз і контроль коліна. При втраті якості зупини серію; зміни ногу за планом.',
    'Perform a series of low single-leg hops in the prescribed direction. Maintain springy contacts, level hips and knee control. Stop the series if quality deteriorates; switch legs as prescribed.');
  add('O2cx8ljLP-4','wall-sit-isometric','Статичний присід біля стіни','Wall Sit (Isometric)','quadriceps','gluteus_maximus','quad,knee','hip,core','squat_isometric','wall','none',
    'Обіприся спиною на стіну та опустися до заданого кута. Стопи стійко на підлозі, коліна спрямовані за ними. Утримуй положення й дихай рівно. Глибину та час визначає план.',
    'Rest the back against a wall and lower to the prescribed angle. Keep feet firmly grounded and knees aligned with them. Hold and breathe steadily. Follow the planned depth and duration.');
  add('Y6FhkjlLkpI','dumbbell-bench-press','Жим гантелей лежачи','Dumbbell Bench Press','pectoralis_major,triceps','anterior_deltoids','chest,shoulder','elbow,wrist,upper_back','horizontal_push','dumbbell,bench','none',
    'Ляж на лавку, стопи на підлозі. Опускай гантелі під контролем, тримаючи зап’ястки над ліктями й плечі стабільними. Вижми вгору без удару гантелей одна об одну. Не опускай плечі в неконтрольовану глибину.',
    'Lie on a bench with feet on the floor. Lower the dumbbells under control, keeping wrists over elbows and shoulders stable. Press upward without striking the dumbbells together. Avoid an uncontrolled deep shoulder position.');
  add('iSlR5jhcA_Y','barbell-bent-over-row','Тяга штанги в нахилі','Barbell Bent Over Row','latissimus_dorsi,rhomboids,middle_trapezius','biceps,spinal_erectors','upper_back','shoulder,elbow,wrist,lower_back,hip','horizontal_pull','barbell','none',
    'Нахились від тазу й зафіксуй нейтральну спину. Тягни штангу до нижніх ребер, ведучи лікті назад. Опускай під контролем. Не підкидай гриф корпусом і не округлюй поперек.',
    'Hinge at the hips and hold a neutral spine. Row the bar toward the lower ribs with elbows traveling backward. Lower under control. Do not heave with the torso or round the lower back.');
  add('1AtoFpEzh4A','single-arm-dumbbell-row','Тяга гантелі однією рукою','Single Arm Dumbbell Row (Control)','latissimus_dorsi,rhomboids','biceps,obliques','upper_back','shoulder,elbow,wrist,lower_back,core','horizontal_pull','dumbbell,bench','none',
    'Обіприся вільною рукою на стійку опору. Тягни гантель до таза, не розвертаючи корпус. Лопатку рухай під контролем; плече не підтягуй до вуха. Плавно опусти й зміни бік за планом.',
    'Support the free hand on a stable surface. Row the dumbbell toward the hip without rotating the torso. Control the shoulder blade and avoid shrugging. Lower smoothly and switch sides as prescribed.');
  add('-fdV4v3gTYg','','Згинання руки з несиметричною вагою','Offset Dumbbell Curl','biceps,brachialis','forearm_flexors,obliques','elbow','wrist,shoulder,core','elbow_flexion','dumbbell','none',
    'Тримай гантель збоку, лікоть біля корпусу. Зігни руку та плавно опусти вагу. Корпус не розгойдуй, зап’ясток тримай нейтрально. Зміни руку за планом.',
    'Hold the dumbbell at your side with the elbow near the torso. Curl and lower smoothly. Keep the torso still and wrist neutral. Change arms as prescribed.');
  const releases=[
    ['mpFwDn9piJg','','Рол для квадрицепсів','Quadriceps Foam Roll','quadriceps','quad','knee,hip','foam_roller','Ляж передньою поверхнею стегна на рол. Повільно прокочуй м’яз, підтримуючи вагу руками. Не тисни на колінну чашечку.','Place the front of the thigh on the roller. Roll slowly over the muscle while supporting weight with the arms. Avoid direct pressure on the kneecap.'],
    ['natzfgf8oUo','','Рол для задньої поверхні стегна','Hamstring Foam Roll','hamstrings','hamstring','hip,knee','foam_roller','Сядь, розмісти рол під задньою поверхнею стегна. Рухайся повільно по м’язу, зменшуючи тиск руками. Не прокочуй підколінну ямку.','Sit with the roller under the back of the thigh. Move slowly over the muscle and use the arms to regulate pressure. Avoid the back of the knee.'],
    ['b4qSgj1htuA','glute-ball-release','М’який самомасаж сідниць м’ячем','Glute Ball Release','gluteus_maximus,gluteus_medius','glute','hip,lower_back','massage_ball','Сядь на м’яч під м’якою частиною сідниці. Робіть невеликі повільні зміщення, регулюючи тиск руками. Не тисни на кістку й не продовжуй при прострілі або онімінні.','Sit with a ball beneath the soft part of the buttock. Make small slow shifts and control pressure with the arms. Avoid bone and stop if shooting pain or numbness occurs.'],
    ['ZnQXePLxXGQ','proximal-hamstring-ball-release','Самомасаж верхньої частини заднього стегна','Proximal Hamstring Ball Release','hamstrings','hamstring','hip,glute','massage_ball','Сядь на опору, розмісти м’яч під м’якою частиною заднього стегна. Зміщуйся повільно з легким тиском. Не тисни прямо на сідничну кістку; при онімінні припини.','Sit on a support with a ball beneath the soft part of the upper hamstring. Shift slowly with light pressure. Avoid direct pressure on the sitting bone; stop if numbness occurs.'],
    ['7nPtIsR5L28','','Рол для верхньої частини спини','Upper Back Foam Roll','trapezius,rhomboids','upper_back','shoulder,neck','foam_roller','Розмісти рол поперек верхньої частини спини, підтримай голову руками. Повільно прокочуй коротку ділянку грудного відділу. Не тисни на шию.','Place the roller across the upper back and support the head with the hands. Slowly roll a short thoracic section. Avoid rolling the neck.'],
    ['odgNO-4n9xU','','Рол для середньої частини спини','Mid Back Foam Roll','thoracic_spinal_erectors','upper_back','lower_back,shoulder','foam_roller','Розмісти рол у грудному відділі. Підтримуй голову й роби короткі контрольовані переміщення без сильного прогину. Не скочуйся на поперек.','Position the roller beneath the thoracic back. Support the head and make short controlled movements without excessive arching. Do not roll onto the lower back.'],
    ['J7LxJbkKTA4','','Рол для нижньої частини спини','Lower Back Foam Roll','spinal_erectors','lower_back','hip,core','foam_roller','Цю вправу виконуй лише за індивідуальною вказівкою фахівця. Не прокочуй поперек вагою всього тіла й не тисни прямо на хребет. За відсутності погодженої техніки попроси тренера замінити вправу.','Use this exercise only with individual professional instruction. Do not roll the lower back under full body weight or apply direct pressure to the spine. Without an agreed technique, ask the coach for a replacement.'],
    ['euZDk0MNJBQ','','Рол для литкових м’язів','Calf Foam Roll','gastrocnemius,soleus','calf','ankle,achilles','foam_roller','Сядь і поклади литку на рол. Повільно прокочуй м’яку частину м’яза, зменшуючи тиск руками. Уникай прямого тиску на ахіллове сухожилля та задню частину коліна.','Sit with the calf on the roller. Slowly roll the muscle belly, using the arms to regulate pressure. Avoid direct pressure on the Achilles tendon and back of the knee.']
  ];
  releases.forEach(([k,m,u,e,mus,p,s,eq,ut,et])=>add(k,m,u,e,mus,'',p,s,'self_massage',eq,'none',ut,et));
  // Distinct local movements are added as distinct entries, never substituted for a different exercise.
  const extras=[
    ['dumbbell-forward-lunge-in-place','Випад уперед із гантелями','Dumbbell Forward Lunge (In Place)','quadriceps,gluteus_maximus','abdominals','quad,glute,knee','hip,ankle,core','lunge','dumbbell','none','Main Training','Legs','Тримай гантелі з боків. Зроби крок уперед, контрольовано опустися у випад і повернись через передню ногу. Не завалюй коліно всередину.','Hold dumbbells at your sides. Step forward, lower into a controlled lunge and return through the front leg. Avoid inward knee collapse.'],
    ['forward-step-balance-lunge','Випад уперед із балансом','Forward Step Balance Lunge','quadriceps,gluteus_maximus','gluteus_medius','quad,glute,knee','hip,ankle','lunge_balance','','low','Pre-Training','Activation','Зроби контрольований крок у випад і повернись у баланс на одній нозі, як на демонстрації. Тримай таз рівно. Стабілізуйся перед наступним повторенням.','Step into a controlled lunge and return to single-leg balance as shown. Keep the pelvis level. Establish balance before repeating.'],
    ['lateral-shuffle','Бокове переміщення','Lateral Shuffle','gluteus_medius,quadriceps','calves','hip,glute,knee','ankle,achilles','lateral_step','','moderate','Pre-Training','Movement Preparation','Займи спортивну стійку. Пересувайся боком короткими кроками без перехрещення ніг. Тримай таз на одній висоті, груди вперед і коліна за стопами.','Take an athletic stance. Shuffle sideways with short steps without crossing the feet. Keep the pelvis level, chest forward and knees tracking over feet.'],
    ['lateral-skater-jumps','Бокові стрибки ковзаняра','Lateral Skater Jumps','gluteus_medius,gluteus_maximus,quadriceps','calves','glute,quad,knee,ankle','hip,achilles','lateral_jump','','high','Main Training','Power','Почергово стрибай убік з ноги на ногу. Приземляйся м’яко, контролюючи коліно й таз. Зберігай ритм лише доки можеш контролювати кожен контакт.','Alternate lateral jumps from one leg to the other. Land softly with knee and pelvic control. Maintain rhythm only while each contact remains controlled.'],
    ['multi-ball-coordination-drill','Координація з кількома м’ячами','Multi Ball Coordination Drill','deltoids,forearm_flexors','abdominals','shoulder','elbow,wrist,core','coordination','small_ball','low','Pre-Training','Neuro Activation','Виконуй послідовність кидків і ловлі кількох м’ячів, показану на демонстрації. Почни повільно, зберігай стійку та точність. Додай темп лише після освоєння послідовності.','Follow the demonstrated sequence of throws and catches with several balls. Start slowly and maintain stance and accuracy. Add speed only after learning the sequence.'],
    ['resisted-running-drill-single-leg','Біговий рух однією ногою з опором','Resisted Running Drill (Single Leg)','hip_flexors,gluteus_maximus','hamstrings,abdominals','hip,glute','knee,ankle,core','running_drill','resistance_band','low','Pre-Training','Movement Preparation','Надійно закріпи резинку та прийми положення з демонстрації. Виконуй цикл бігового руху однією ногою проти опору. Зберігай нерухомий таз і контрольоване повернення; зміни ногу за планом.','Secure the band and take the position shown. Cycle one leg through the running action against resistance. Keep the pelvis still and control the return; change legs as prescribed.'],
    ['resistend-band-single-kick','Поштовх ногою з резинкою','Resisted Band Single Kick','gluteus_maximus','hamstrings,abdominals','glute,hip','knee,lower_back,core','hip_extension','resistance_band','none','Pre-Training','Activation','Закріпи резинку та виконуй поштовх однією ногою в напрямку демонстрації. Не розвертай таз і не прогинай поперек. Повертай ногу під контролем.','Secure the band and drive one leg in the direction shown. Avoid rotating the pelvis or arching the lower back. Return the leg under control.'],
    ['reverse-tabletop-hip-rotation','Ротація таза у зворотному упорі','Reverse Tabletop Hip Rotation','gluteus_maximus,obliques','deltoids,triceps','hip,core','shoulder,wrist,elbow,lower_back','rotation','', 'none','Pre-Training','Activation','Постав долоні позаду й підніми таз у зворотний упор. Виконуй контрольовану ротацію, як показано, без ривків у плечах. Не закидай голову й не перевищуй доступну амплітуду.','Place hands behind you and lift into a reverse tabletop. Perform the controlled rotation shown without jerking through the shoulders. Keep the neck neutral and stay within your available range.'],
    ['single-leg-band-knee-drive','Підйом коліна однією ногою з резинкою','Single Leg Band Knee Drive','hip_flexors','gluteus_maximus,abdominals','hip','knee,ankle,core','knee_drive','resistance_band','low','Pre-Training','Activation','Зі стійкої опори піднімай коліно однієї ноги проти опору резинки. Не відхиляй корпус назад і не розвертай таз. Контрольовано повертай ногу; зміни бік за планом.','From a stable stance, drive one knee against the band. Avoid leaning backward or rotating the pelvis. Return with control; switch sides as prescribed.'],
    ['single-leg-hop-to-stick','Стрибок на одній нозі з фіксацією','Single Leg Hop to Stick','quadriceps,gluteus_maximus,calves','gluteus_medius','knee,ankle,quad,glute','hip,achilles','hop_stick','','high','Main Training','Power','Стрибни на одній нозі й зафіксуй приземлення на ній. Амортизуй через таз, коліно й гомілкостоп. Наступний повтор починай лише після відновлення рівноваги.','Hop on one leg and hold the landing on that leg. Absorb through hip, knee and ankle. Begin the next repetition only after regaining balance.'],
    ['single-leg-lateral-reach-band','Бокове відведення ноги з резинкою','Single Leg Lateral Reach (Band)','gluteus_medius','gluteus_maximus,abdominals','glute,hip','knee,ankle,core','hip_abduction','resistance_band','none','Pre-Training','Activation','Стань стійко на одну ногу. Відводь іншу вбік проти резинки та повертай під контролем. Тримай таз горизонтально, не нахиляй корпус убік.','Stand steadily on one leg. Reach the other leg sideways against the band and return under control. Keep the pelvis level without leaning the torso sideways.'],
    ['step-up-calf-drive','Підйом на сходинку з роботою литки','Step-Up Calf Drive','quadriceps,gluteus_maximus,calves','abdominals','quad,glute,calf,ankle','knee,hip,achilles','step_up','step','low','Main Training','Legs','Постав стопу на стійку сходинку. Піднімися через опорну ногу й виконай роботу стопою, як показано. Контрольовано спустися; не відштовхуйся різко нижньою ногою.','Place the foot on a stable step. Rise through the supporting leg and perform the demonstrated calf action. Lower under control without pushing sharply from the trailing leg.']
  ];
  extras.forEach(([id,u,e,m,s,p,z,pat,eq,imp,stage,cat,ut,et])=>{add('library:'+id,id,u,e,m,s,p,z,pat,eq,imp,ut,et);Object.assign(records.at(-1),{stage,category:cat});});
  // Source contains no wall support; a free squat is not a Wall Sit demonstration.
  records.find(r=>r.key==='O2cx8ljLP-4').media='';
  const mediaOverrides={
    'ТУТ_ТВОЄ_ВІДЕО':'single-leg-rdl-bodyweight','dR-47yjhJjo':'bench-side-plank','KLSr8sDun_Q':'reverse-nordic-curl',
    '6KE-wOyBTFY':'isometric-lunge-with-arm-drive','nN7IIrNJxsw':'arm-drive-drill','VRr6RI11cmU':'dumbbell-reverse-lunge',
    'XZgTaDIAX8k':'dumbbell-goblet-squat','iZHKJLM4yjo':'offset-goblet-squat','8fnWi7DQ0uU':'trx-reverse-single-leg-squat',
    '-fdV4v3gTYg':'single-arm-curl-anti-rotation','YAQkGSKokWE':'forward-step-balance-lunge',
    'oWIX2qKxscQ':'multi-ball-coordination-drill','CMOuMStw1uA':'reverse-tabletop-hip-rotation'
  };
  records.forEach(r=>{if(mediaOverrides[r.key])r.media=mediaOverrides[r.key];});
  // These local filenames are aliases of existing movements, not three new exercises.
  for(const id of ['forward-step-balance-lunge','multi-ball-coordination-drill','reverse-tabletop-hip-rotation']){
    const index=records.findIndex(r=>r.key==='library:'+id);if(index>=0)records.splice(index,1);
  }
  // The named kick source actually depicts waist-resisted running. Keep it out of the catalog.
  const rejectedKey='library:resistend-band-single-kick';
  records.splice(records.findIndex(r=>r.key===rejectedKey),1);
  const normalize=s=>String(s||'').trim().toLowerCase().replace(/\s+/g,' ');
  const byKey=new Map(),byName=new Map();
  const executionSources=new WeakMap(),legacyContent=new Map();
  const muscleNames={
    hip_flexors:['згиначі стегна','hip flexors'],gluteus_medius:['середній сідничний','gluteus medius'],gluteus_maximus:['великий сідничний','gluteus maximus'],
    adductors:['привідні м’язи стегна','adductors'],hamstrings:['задня група м’язів стегна','hamstrings'],quadriceps:['квадрицепс','quadriceps'],
    spinal_erectors:['розгиначі спини','spinal erectors'],abdominals:['м’язи живота','abdominals'],obliques:['косі м’язи живота','obliques'],
    thoracic_rotators:['ротатори грудного відділу','thoracic rotators'],deltoids:['дельтоподібні','deltoids'],calves:['литкові м’язи','calves'],
    latissimus_dorsi:['найширші м’язи спини','latissimus dorsi'],serratus_anterior:['передній зубчастий','serratus anterior'],trapezius:['трапецієподібний','trapezius'],
    foot_intrinsics:['дрібні м’язи стопи','intrinsic foot muscles'],rhomboids:['ромбоподібні','rhomboids'],middle_trapezius:['середня трапеція','middle trapezius'],
    lower_trapezius:['нижня трапеція','lower trapezius'],rear_deltoids:['задні дельтоподібні','rear deltoids'],triceps:['трицепс','triceps'],
    forearm_flexors:['згиначі передпліччя','forearm flexors'],pectoralis_major:['великий грудний','pectoralis major'],anterior_deltoids:['передні дельтоподібні','anterior deltoids'],
    biceps:['біцепс','biceps'],brachialis:['плечовий м’яз','brachialis'],thoracic_spinal_erectors:['розгиначі грудного відділу','thoracic spinal erectors'],
    gastrocnemius:['литковий м’яз','gastrocnemius'],soleus:['камбалоподібний','soleus']
  };
  const labelMuscles=(list,lang)=>list.map(k=>muscleNames[k]?.[lang==='uk'?0:1]||k.replace(/_/g,' ')).join(', ');
  const lib=window.EXERCISE_LIBRARY;
  const all=[];Object.entries(lib||{}).forEach(([stage,cats])=>Object.entries(cats).forEach(([category,c])=>(c.exercises||[]).forEach(e=>all.push({e,stage,category}))));
  records.forEach(r=>{byKey.set(normalize(r.key),r);Object.values(r.name_i18n).forEach(n=>byName.set(normalize(n),r));});
  all.forEach(({e})=>{const r=byKey.get(normalize(e.videoKey));if(r)byName.set(normalize(e.name),r);});
  all.forEach(({e})=>{legacyContent.set(normalize(e.videoKey),{...e});executionSources.set(e,{...e});});
  function executionSource(ex){
    if(executionSources.has(ex)){const source=executionSources.get(ex);return {...source,executionMode:ex.executionMode||source.executionMode};}
    const legacy=ex?.contentVersion?legacyContent.get(normalize(ex.videoKey)):null;
    if(!legacy)return ex;
    return {...ex,description:legacy.description,description_i18n:legacy.description_i18n,technique:legacy.technique,
      technique_i18n:legacy.technique_i18n,tags:legacy.tags,name_i18n:legacy.name_i18n};
  }
  function lookup(ex){
    if(!ex||String(ex.videoKey||'').startsWith('drill:')||ex.drillId||ex.tacticalDrill)return null;
    const key=normalize(ex.videoKey);
    // A different explicit identity is never replaced through a coincidental name.
    return byKey.get(key)||(!key?byName.get(normalize(ex.name)):null)||null;
  }
  function resolve(ex){
    const r=lookup(ex);if(!r)return ex;
    const media=r.media?'../assets/videos/library/'+r.media+'.mp4':'';
    const description_i18n={uk:`Основні м’язи: ${labelMuscles(r.primaryMuscles,'uk')}.${r.secondaryMuscles.length?' Допоміжні: '+labelMuscles(r.secondaryMuscles,'uk')+'.':''}`,
      en:`Main muscles: ${labelMuscles(r.primaryMuscles,'en')}.${r.secondaryMuscles.length?' Supporting muscles: '+labelMuscles(r.secondaryMuscles,'en')+'.':''}`};
    const result={...ex,contentVersion:version,description:description_i18n.uk,description_i18n,
      // A stationary technique demo is a set, not a GPS session inferred from the word "Run".
      executionMode:ex.executionMode||(!ex.runningTarget&&!ex.speedTarget&&!ex.coachRunningPlan?'gym':undefined),
      technique:r.technique_i18n.uk,technique_i18n:{...r.technique_i18n},name_i18n:{...r.name_i18n},
      primaryMuscles:[...r.primaryMuscles],secondaryMuscles:[...r.secondaryMuscles],primaryZones:[...r.primaryZones],secondaryZones:[...r.secondaryZones],
      movementPattern:r.movementPattern,equipment:[...r.equipment],impact:r.impact,
      tags:[...new Set([...(ex.tags||[]),...r.primaryMuscles,r.movementPattern])],
      videoUrl:media,videoSrc:'',demoVideoUrl:'',demoAutoplay:!!media,demoUnavailable:!media,
      mediaStatus:media?'local':'missing-local',videoPoster:media.replace(/\.mp4$/,'.jpg')};
    executionSources.set(result,executionSource(ex));return result;
  }
  all.forEach(({e})=>Object.assign(e,resolve(e)));
  extras.forEach(([id])=>{
    const r=byKey.get('library:'+id);if(!r)return;const cat=lib?.[r.stage]?.[r.category];if(!cat)return;
    if(!cat.exercises.some(e=>e.videoKey===r.key))cat.exercises.push(resolve({name:r.name_i18n.en,videoKey:r.key,tags:[r.stage==='Post-Training'?'recovery':r.stage==='Main Training'?'strength':'activation']}));
  });
  const archivedExercises=[];
  function isAvailable(ex){const record=lookup(ex);return !record||Boolean(record.media);}
  Object.entries(lib||{}).forEach(([stage,cats])=>Object.entries(cats).forEach(([category,c])=>{
    const seen=new Set();c.exercises=(c.exercises||[]).filter(e=>{const id=normalize(e.videoKey)||normalize(e.name);if(seen.has(id))return false;seen.add(id);if(!isAvailable(e)){archivedExercises.push({...e,stage,category});return false;}return true;});
  }));
  window.PACExerciseContent=Object.freeze({version,resolve,lookup,records,labelMuscles,executionSource,isAvailable,archivedExercises});
})();
