// weekly-individual.js — ProAtletCare (FULL INTEGRATED VERSION)

const CANON_STATUSES = ["MD-4","MD-3","MD-2","MD-1","MD","MD+1","MD+2","TRAIN","LIGHT","REHAB","REST"];


const WEEKLY_I18N = {
  uk: {
    activityTrain: "Тренування",
    activityMatch: "Матч",
    activityRest: "Відпочинок",
    statusTrain: "ТРЕНУВАННЯ",
    statusRest: "ВІДПОЧИНОК",
    statusLight: "ЛЕГКО",
    statusRehab: "РЕАБ",
    restDay: "☕ День відпочинку",
    stagePre: "Підготовка",
    stageMain: "Основна частина",
    stagePost: "Відновлення",
    addToStage: "Додати у",
    dayShort: ["Пн","Вт","Ср","Чт","Пт","Сб","Нд"],
    nutritionTitle: "Харчування на тиждень",
    nutritionNote: "Підтягується з Weight Control та синхронізується зі статусом дня.",
    nutritionEmpty: "План харчування на цей тиждень ще не згенеровано.",
    nutritionNoDay: "Немає даних на цей день.",
    nutritionCalories: "Калорії",
    nutritionPortion: "Порція",
    nutritionComposition: "Склад",
    nutritionMacros: "Б/Ж/В",
    nutritionKcalUnit: "ккал",
    nutritionGramUnit: "г",
    nutritionBreakfast: "Сніданок",
    nutritionLunch: "Обід",
    nutritionDinner: "Вечеря"
  },
  en: {
    activityTrain: "Training",
    activityMatch: "Match",
    activityRest: "Rest",
    statusTrain: "TRAIN",
    statusRest: "REST",
    statusLight: "LIGHT",
    statusRehab: "REHAB",
    restDay: "☕ Rest day",
    stagePre: "Pre-Training",
    stageMain: "Main Training",
    stagePost: "Post-Training",
    addToStage: "Add to",
    dayShort: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
    nutritionTitle: "Weekly nutrition",
    nutritionNote: "Loaded from Weight Control and synced to day status.",
    nutritionEmpty: "Nutrition plan is not generated yet for this week.",
    nutritionNoDay: "No nutrition data for this day.",
    nutritionCalories: "Calories",
    nutritionPortion: "Portion",
    nutritionComposition: "Composition",
    nutritionMacros: "P/F/C",
    nutritionKcalUnit: "kcal",
    nutritionGramUnit: "g",
    nutritionBreakfast: "Breakfast",
    nutritionLunch: "Lunch",
    nutritionDinner: "Dinner"
  },
  de: {
    activityTrain: "Training",
    activityMatch: "Spiel",
    activityRest: "Ruhetag",
    statusTrain: "TRAINING",
    statusRest: "ERHOLUNG",
    statusLight: "LEICHT",
    statusRehab: "REHA",
    restDay: "☕ Ruhetag",
    stagePre: "Vorbereitung",
    stageMain: "Hauptteil",
    stagePost: "Nachbereitung",
    addToStage: "Hinzufügen zu",
    dayShort: ["Mo","Di","Mi","Do","Fr","Sa","So"],
    nutritionTitle: "Wöchentliche Ernährung",
    nutritionNote: "Aus Weight Control geladen und mit dem Tagesstatus synchronisiert.",
    nutritionEmpty: "Für diese Woche wurde noch kein Ernährungsplan erstellt.",
    nutritionNoDay: "Keine Ernährungsdaten für diesen Tag.",
    nutritionCalories: "Kalorien",
    nutritionPortion: "Portion",
    nutritionComposition: "Zusammensetzung",
    nutritionMacros: "P/F/C",
    nutritionKcalUnit: "kcal",
    nutritionGramUnit: "g",
    nutritionBreakfast: "Frühstück",
    nutritionLunch: "Mittagessen",
    nutritionDinner: "Abendessen"
  },
  es: {
    activityTrain: "Entrenamiento",
    activityMatch: "Partido",
    activityRest: "Descanso",
    statusTrain: "ENTRENO",
    statusRest: "DESCANSO",
    statusLight: "LIGERO",
    statusRehab: "REHAB",
    restDay: "☕ Día de descanso",
    stagePre: "Pre-entreno",
    stageMain: "Entreno principal",
    stagePost: "Post-entreno",
    addToStage: "Añadir a",
    dayShort: ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"],
    nutritionTitle: "Nutrición semanal",
    nutritionNote: "Se carga desde Weight Control y se sincroniza con el estado del día.",
    nutritionEmpty: "Aún no se generó un plan nutricional para esta semana.",
    nutritionNoDay: "Sin datos de nutrición para este día.",
    nutritionCalories: "Calorías",
    nutritionPortion: "Porción",
    nutritionComposition: "Composición",
    nutritionMacros: "P/G/C",
    nutritionKcalUnit: "kcal",
    nutritionGramUnit: "g",
    nutritionBreakfast: "Desayuno",
    nutritionLunch: "Almuerzo",
    nutritionDinner: "Cena"
  },
  ru: {
    activityTrain: "Тренировка",
    activityMatch: "Матч",
    activityRest: "Отдых",
    statusTrain: "ТРЕНИРОВКА",
    statusRest: "ОТДЫХ",
    statusLight: "ЛЕГКО",
    statusRehab: "РЕАБ",
    restDay: "☕ День отдыха",
    stagePre: "Подготовка",
    stageMain: "Основная часть",
    stagePost: "Восстановление",
    addToStage: "Добавить в",
    dayShort: ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"],
    nutritionTitle: "Питание на неделю",
    nutritionNote: "Данные из Weight Control, синхронизация по статусу дня.",
    nutritionEmpty: "План питания на эту неделю еще не сгенерирован.",
    nutritionNoDay: "Нет данных питания на этот день.",
    nutritionCalories: "Калории",
    nutritionPortion: "Порция",
    nutritionComposition: "Состав",
    nutritionMacros: "Б/Ж/У",
    nutritionKcalUnit: "ккал",
    nutritionGramUnit: "г",
    nutritionBreakfast: "Завтрак",
    nutritionLunch: "Обед",
    nutritionDinner: "Ужин"
  },
  pt: {
    activityTrain: "Treino",
    activityMatch: "Jogo",
    activityRest: "Descanso",
    statusTrain: "TREINO",
    statusRest: "DESCANSO",
    statusLight: "LEVE",
    statusRehab: "REAB",
    restDay: "☕ Dia de descanso",
    stagePre: "Pré-treino",
    stageMain: "Treino principal",
    stagePost: "Pós-treino",
    addToStage: "Adicionar a",
    dayShort: ["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"],
    nutritionTitle: "Nutrição semanal",
    nutritionNote: "Carregado do Weight Control e sincronizado com o status do dia.",
    nutritionEmpty: "O plano nutricional desta semana ainda não foi gerado.",
    nutritionNoDay: "Sem dados de nutrição para este dia.",
    nutritionCalories: "Calorias",
    nutritionPortion: "Porção",
    nutritionComposition: "Composição",
    nutritionMacros: "P/G/C",
    nutritionKcalUnit: "kcal",
    nutritionGramUnit: "g",
    nutritionBreakfast: "Café da manhã",
    nutritionLunch: "Almoço",
    nutritionDinner: "Jantar"
  }
};

function weeklyLang() {
  const raw = String(localStorage.getItem("pac_lang") || "").toLowerCase();
  if (raw === "ua") return "uk";
  if (WEEKLY_I18N[raw]) return raw;
  return "uk";
}
function wt(key) {
  const l = weeklyLang();
  return WEEKLY_I18N[l]?.[key] ?? WEEKLY_I18N.en[key] ?? key;
}
function wtFormat(key, vars = {}) {
  let tpl = String(wt(key) ?? "");
  Object.keys(vars || {}).forEach((k) => {
    tpl = tpl.split(`{${k}}`).join(String(vars[k]));
  });
  return tpl;
}
function stageDisplayName(stage) {
  const m = {
    "Pre-Training": "stagePre",
    "Main Training": "stageMain",
    "Post-Training": "stagePost"
  };
  return m[stage] ? wt(m[stage]) : stage;
}
function statusDisplayName(status) {
  if (status === "TRAIN") return wt("statusTrain");
  if (status === "REST") return wt("statusRest");
  if (status === "LIGHT") return wt("statusLight");
  if (status === "REHAB") return wt("statusRehab");
  return status;
}
function getWeeklyDayShortNames() {
  return WEEKLY_I18N[weeklyLang()]?.dayShort || WEEKLY_I18N.en.dayShort;
}

const EXERCISE_NAME_FALLBACKS = {
  "Динамічні випади з поворотом": { en: "Dynamic Lunges with Rotation", de: "Dynamic Lunges with Rotation", es: "Dynamic Lunges with Rotation", pt: "Dynamic Lunges with Rotation" },
  "Рух 'Світч-Кік'": { en: "Switch Kick", de: "Switch Kick", es: "Switch Kick", pt: "Switch Kick" },
  "Розкриття грудної клітки лежачи": { en: "Lying Thoracic Opener", de: "Lying Thoracic Opener", es: "Lying Thoracic Opener", pt: "Lying Thoracic Opener" },
  "Розтяжка задньої поверхні стегна лежачи з ременем": { en: "Supine Hamstring Strap Stretch", de: "Supine Hamstring Strap Stretch", es: "Supine Hamstring Strap Stretch", pt: "Supine Hamstring Strap Stretch" },
  "YTWL для плечей": { en: "YTWL Shoulder Series", de: "YTWL Shoulder Series", es: "YTWL Shoulder Series", pt: "YTWL Shoulder Series" },
  "Болгарські присідання": { en: "Bulgarian Split Squat", de: "Bulgarian Split Squat", es: "Bulgarian Split Squat", pt: "Bulgarian Split Squat" },
  "Terminal Knee Extension (TKE) з резинкою": { en: "Band Terminal Knee Extension (TKE)", de: "Band Terminal Knee Extension (TKE)", es: "Band Terminal Knee Extension (TKE)", pt: "Band Terminal Knee Extension (TKE)" },
  "Step-Down контроль (низька платформа)": { en: "Controlled Step-Down (Low Box)", de: "Controlled Step-Down (Low Box)", es: "Controlled Step-Down (Low Box)", pt: "Controlled Step-Down (Low Box)" },
  "Face Pull з резинкою": { en: "Band Face Pull", de: "Band Face Pull", es: "Band Face Pull", pt: "Band Face Pull" },
  "Тяга верхнього блоку вузьким хватом": { en: "Close-Grip Lat Pulldown", de: "Close-Grip Lat Pulldown", es: "Close-Grip Lat Pulldown", pt: "Close-Grip Lat Pulldown" },
  "Розтяжка грудних м'язів у дверному отворі": { en: "Doorway Chest Stretch", de: "Doorway Chest Stretch", es: "Doorway Chest Stretch", pt: "Doorway Chest Stretch" },
  "Розтяжка квадрицепсів стоячи": { en: "Standing Quad Stretch", de: "Standing Quad Stretch", es: "Standing Quad Stretch", pt: "Standing Quad Stretch" },
  "Розтяжка трицепса і плечей": { en: "Triceps and Shoulder Stretch", de: "Triceps and Shoulder Stretch", es: "Triceps and Shoulder Stretch", pt: "Triceps and Shoulder Stretch" },
  "Розтяжка гомілковостопного суглоба": { en: "Ankle Mobility Stretch", de: "Ankle Mobility Stretch", es: "Ankle Mobility Stretch", pt: "Ankle Mobility Stretch" },
  "Рол для квадрицепсів": { en: "Foam Roll for Quads", de: "Foam Roll for Quads", es: "Foam Roll for Quads", pt: "Foam Roll for Quads" },
  "Рол для задньої поверхні стегна": { en: "Foam Roll for Hamstrings", de: "Foam Roll for Hamstrings", es: "Foam Roll for Hamstrings", pt: "Foam Roll for Hamstrings" },
  "Рол для верхньої частини спини": { en: "Foam Roll for Upper Back", de: "Foam Roll for Upper Back", es: "Foam Roll for Upper Back", pt: "Foam Roll for Upper Back" },
  "Рол для середньої частини спини": { en: "Foam Roll for Mid Back", de: "Foam Roll for Mid Back", es: "Foam Roll for Mid Back", pt: "Foam Roll for Mid Back" },
  "Рол для нижньої частини спини": { en: "Foam Roll for Lower Back", de: "Foam Roll for Lower Back", es: "Foam Roll for Lower Back", pt: "Foam Roll for Lower Back" },
  "Рол для підколінних сухожиль": { en: "Foam Roll for Hamstring Tendons", de: "Foam Roll for Hamstring Tendons", es: "Foam Roll for Hamstring Tendons", pt: "Foam Roll for Hamstring Tendons" }
};
function hasCyrillic(text) {
  return /[\u0400-\u04FF]/.test(String(text || ""));
}

function fixMojibake(text) {
  const raw = String(text || "");
  if (!raw) return "";
  if (!/[ÐÑÃâ]/.test(raw)) return raw;
  try {
    return decodeURIComponent(escape(raw));
  } catch (_) {
    return raw;
  }
}

function splitBilingualName(rawName) {
  const raw = fixMojibake(rawName).trim();
  const m = raw.match(/^(.+?)\s*\(([^()]{2,})\)\s*$/);
  if (!m) return null;
  const left = m[1].trim();
  const right = m[2].trim();
  if (!left || !right) return null;
  // Treat as bilingual only when scripts differ (e.g. "Планка ... (Elbow Plank)").
  if (hasCyrillic(left) === hasCyrillic(right)) return null;
  return { left, right };
}

function pickLocalizedValue(map, lang) {
  if (!map || typeof map !== "object") return "";
  return String(
    map[lang] ||
    map.en ||
    map.uk ||
    map.ru ||
    map.de ||
    map.es ||
    map.pt ||
    ""
  ).trim();
}

function resolveExerciseName(ex, lang = weeklyLang()) {
  const raw = fixMojibake(ex?.name || "").trim();
  const mapped = fixMojibake(pickLocalizedValue(ex?.name_i18n, lang));
  if (mapped) {
    // Backward-compat for old saved i18n where "(...)" part replaced full EN name.
    if (raw && !splitBilingualName(raw) && /\(([^()]{2,})\)\s*$/.test(raw) && !hasCyrillic(raw)) {
      return raw;
    }
    if (!((lang !== "uk" && lang !== "ru") && hasCyrillic(mapped))) return mapped;
  }

  if (!raw) return "—";

  const alias = EXERCISE_NAME_FALLBACKS[raw]?.[lang];
  if (alias) return alias;

  const bi = splitBilingualName(raw);
  if (bi) return (lang === "uk" || lang === "ru") ? bi.left : bi.right;

  if ((lang !== "uk" && lang !== "ru") && hasCyrillic(raw)) return "";
  return raw;
}

function resolveExerciseDescription(ex, lang = weeklyLang()) {
  const mapped = fixMojibake(pickLocalizedValue(ex?.description_i18n, lang));
  if (mapped) {
    if (!((lang !== "uk" && lang !== "ru") && hasCyrillic(mapped))) return mapped;
  }

  const raw = fixMojibake(ex?.description || "").trim();
  if (!raw) return "";
  if ((lang !== "uk" && lang !== "ru") && hasCyrillic(raw)) return "";
  return raw;
}

function weeklyRecommendationLabel(lang = weeklyLang()) {
  const m = { uk: "Рекомендація", en: "Recommendation", de: "Empfehlung", es: "Recomendación", ru: "Рекомендация", pt: "Recomendação" };
  return m[lang] || m.en;
}

function resolveExerciseRecommendation(ex, stage, lang = weeklyLang()) {
  const mapped = fixMojibake(pickLocalizedValue(ex?.recommendation_i18n, lang));
  if (mapped) return mapped;

  const direct = fixMojibake(ex?.recommendation || "").trim();
  if (direct) return direct;

  const name = resolveExerciseName(ex, "en").toLowerCase();
  const tags = Array.isArray(ex?.tags) ? ex.tags.map(t => String(t).toLowerCase()) : [];
  const has = (...arr) => arr.some(x => name.includes(x) || tags.includes(x));
  const kind =
    has("stretch", "mobility", "opener") ? "mobility" :
    has("bridge", "glute", "clam", "hip") ? "glute" :
    has("plank", "dead bug", "bird-dog", "core", "superman") ? "core" :
    has("squat", "split squat", "lunge") ? "lower_strength" :
    has("jump", "plyo") ? "power" :
    has("press", "push") ? "push" :
    has("row", "pull", "lat") ? "pull" :
    has("roll", "foam") ? "release" :
    has("rehab", "tke", "step-down", "wall sit") ? "rehab" :
    "general";

  const rec = {
    uk: {
      mobility: "Плавна амплітуда і контроль дихання; без ривків.",
      glute: "Нейтральний поперек і пауза у піку скорочення.",
      core: "Стабілізуй корпус, контролюй таз і ребра.",
      lower_strength: "Коліно по осі стопи, контроль ексцентрики.",
      power: "Вибухове виконання, повний відпочинок між підходами.",
      push: "Лопатки стабільні, траєкторія контрольована.",
      pull: "Ініціюй рух лопаткою, не тільки руками.",
      release: "Повільний темп і помірний тиск, без гострого болю.",
      rehab: "Безболісний діапазон, біль не вище 3/10.",
      general: stage === "Pre-Training" ? "Контрольований темп і якісна активація." : (stage === "Post-Training" ? "Знизь інтенсивність і віднови дихання." : "Якість руху важливіша за темп.")
    },
    en: {
      mobility: "Use smooth range and breathing control; avoid jerky reps.",
      glute: "Keep lumbar neutral and pause at peak contraction.",
      core: "Brace trunk and control pelvis/rib position.",
      lower_strength: "Track knee over foot and control the eccentric phase.",
      power: "Explosive execution with full rest between sets.",
      push: "Keep scapula stable and path controlled.",
      pull: "Initiate with scapula, not only with arms.",
      release: "Slow tempo and moderate pressure, no sharp pain.",
      rehab: "Work in pain-free range; pain <= 3/10.",
      general: stage === "Pre-Training" ? "Controlled tempo and clean activation." : (stage === "Post-Training" ? "Lower intensity and reset breathing." : "Movement quality over speed.")
    },
    de: {
      mobility: "Ruhige Amplitude und Atemkontrolle, ohne Rucke.",
      glute: "LWS neutral halten, kurze Pause im Peak.",
      core: "Rumpf stabil, Becken und Rippen kontrolliert.",
      lower_strength: "Knie über dem Fuß, Exzentrik kontrolliert.",
      power: "Explosiv arbeiten, volle Satzpausen nutzen.",
      push: "Scapula stabil und saubere Bewegungsbahn.",
      pull: "Aus der Scapula initiieren, nicht nur aus den Armen.",
      release: "Langsames Tempo, moderater Druck, kein stechender Schmerz.",
      rehab: "Im schmerzfreien Bereich arbeiten; Schmerz <= 3/10.",
      general: stage === "Pre-Training" ? "Kontrolliertes Tempo und saubere Aktivierung." : (stage === "Post-Training" ? "Intensität senken und Atmung beruhigen." : "Bewegungsqualität vor Tempo.")
    },
    es: {
      mobility: "Rango suave y respiración controlada, sin tirones.",
      glute: "Mantén lumbar neutra y pausa en la contracción pico.",
      core: "Estabiliza tronco y controla pelvis/costillas.",
      lower_strength: "Rodilla alineada al pie y excéntrica controlada.",
      power: "Ejecución explosiva con descanso completo entre series.",
      push: "Escápulas estables y trayectoria limpia.",
      pull: "Inicia con la escápula, no solo con los brazos.",
      release: "Ritmo lento y presión moderada, sin dolor agudo.",
      rehab: "Trabaja en rango sin dolor; dolor <= 3/10.",
      general: stage === "Pre-Training" ? "Tempo controlado y activación de calidad." : (stage === "Post-Training" ? "Baja intensidad y normaliza respiración." : "Calidad de movimiento sobre velocidad.")
    },
    ru: {
      mobility: "Плавная амплитуда и контроль дыхания, без рывков.",
      glute: "Нейтральная поясница и пауза в пике сокращения.",
      core: "Стабилизируй корпус, контролируй таз и ребра.",
      lower_strength: "Колено по оси стопы, эксцентрика под контролем.",
      power: "Взрывное выполнение и полный отдых между подходами.",
      push: "Лопатки стабильны, траектория контролируется.",
      pull: "Начинай движение лопаткой, не только руками.",
      release: "Медленный темп и умеренное давление, без острой боли.",
      rehab: "Работа в безболезненном диапазоне; боль <= 3/10.",
      general: stage === "Pre-Training" ? "Контролируемый темп и качественная активация." : (stage === "Post-Training" ? "Снизь интенсивность и восстанови дыхание." : "Качество движения важнее темпа.")
    },
    pt: {
      mobility: "Amplitude suave e respiração controlada, sem trancos.",
      glute: "Lombar neutra e pausa no pico da contração.",
      core: "Estabilize o tronco e controle pelve/costelas.",
      lower_strength: "Joelho alinhado ao pé e excêntrica controlada.",
      power: "Execução explosiva com descanso completo entre séries.",
      push: "Escápulas estáveis e trajetória limpa.",
      pull: "Inicie pela escápula, não só pelos braços.",
      release: "Ritmo lento e pressão moderada, sem dor aguda.",
      rehab: "Trabalhe sem dor; dor <= 3/10.",
      general: stage === "Pre-Training" ? "Ritmo controlado e ativação de qualidade." : (stage === "Post-Training" ? "Reduza a intensidade e normalize a respiração." : "Qualidade de movimento acima da velocidade.")
    }
  };

  const set = rec[lang] || rec.en;
  return set[kind] || set.general;
}

function buildExerciseI18nMapFromRaw(name, description) {
  const nameRaw = fixMojibake(name || "").trim();
  const descRaw = fixMojibake(description || "").trim();
  const bi = splitBilingualName(nameRaw);

  const name_i18n = bi ? {
    uk: bi.left,
    ru: bi.left,
    en: bi.right,
    de: bi.right,
    es: bi.right,
    pt: bi.right
  } : {
    uk: nameRaw,
    ru: nameRaw,
    en: hasCyrillic(nameRaw) ? "" : nameRaw,
    de: hasCyrillic(nameRaw) ? "" : nameRaw,
    es: hasCyrillic(nameRaw) ? "" : nameRaw,
    pt: hasCyrillic(nameRaw) ? "" : nameRaw
  };

  const descLatin = !hasCyrillic(descRaw);
  const description_i18n = {
    uk: descRaw,
    ru: descRaw,
    en: descLatin ? descRaw : "",
    de: descLatin ? descRaw : "",
    es: descLatin ? descRaw : "",
    pt: descLatin ? descRaw : ""
  };

  return { name_i18n, description_i18n };
}

Object.assign(WEEKLY_I18N.en, {
  title: "Weekly Individual | ProAthleteCare",
  tagline: "Professional athlete support online",
  pageTitle: "Weekly Individual: Microcycle planning",
  subHeader: "Your individual weekly plan and load distribution.",
  microcyclePrefix: "Microcycle",
  colDay: "Day",
  colStatus: "MD Status",
  colActivity: "Activity",
  planTitle: "Your weekly plan",
  planNote: "Mark match days in Activity and adjust training days if needed.",
  microGuide: "Select 1 or 2 matches in the Activity row and set your real competition day(s). The system will automatically rebuild and sync the week around your peak-performance days.",
  savePlan: "Save weekly plan",
  modalTitle: "Select exercise",
  qualityFilterTitle: "Filter by load quality:",
  addSelected: "Add selected",
  loadingUser: "Loading...",
  statusLabel: "Status",
  keyLabel: "Key",
  createdEmpty: "created empty",
  coachOnlyPlan: "Only coach can plan exercises",
  coachOnlyChange: "Only coach can change the program",
  coachOnlyApply: "Only coach can apply changes",
  whyChanged: "What changed and why",
  accessDeniedAthlete: "Access denied for this athlete. Check assignment and open again from Coach Dashboard.",
  authContextMismatch: "It looks like you're signed in with another account. Please sign in again and retry.",
  microcycleSaveDenied: "No access to save microcycle. Check trial/subscription (planStatus/accessStatus) in athlete profile."
});
Object.assign(WEEKLY_I18N.uk, {
  title: "Weekly Individual | ProAthleteCare",
  tagline: "Онлайн-тренінг та професійний супровід атлетів",
  pageTitle: "Weekly Individual: Планування мікроциклу",
  subHeader: "Ваш індивідуальний тижневий план і розподіл навантаження.",
  microcyclePrefix: "Мікроцикл",
  colDay: "День",
  colStatus: "MD Статус",
  colActivity: "Активність",
  planTitle: "Ваш тижневий план",
  planNote: "Познач у рядку «Активність» матчеві дні та за потреби відкоригуй тренувальні.",
  microGuide: "Оберіть 1 або 2 матчі в рядку «Активність» і встановіть реальний день (або дні) змагання. Система автоматично перебудує та синхронізує тиждень під дні пікової результативності.",
  savePlan: "Зберегти тижневий план",
  modalTitle: "Вибір вправи",
  qualityFilterTitle: "Фільтр за якістю навантаження:",
  addSelected: "Додати вибрані",
  loadingUser: "Завантаження...",
  statusLabel: "Статус",
  keyLabel: "Ключ",
  createdEmpty: "створено порожній",
  coachOnlyPlan: "Тільки тренер може планувати вправи",
  coachOnlyChange: "Тільки тренер може змінювати програму",
  coachOnlyApply: "Тільки тренер може застосовувати зміни",
  whyChanged: "Що змінено і чому",
  accessDeniedAthlete: "Немає доступу до цього атлета. Перевір призначення і відкрий сторінку з Coach Dashboard.",
  authContextMismatch: "Схоже, вхід виконано під іншим акаунтом. Перелогіньтесь і спробуйте ще раз.",
  microcycleSaveDenied: "Немає доступу для збереження мікроциклу. Перевір trial/підписку (planStatus/accessStatus) у профілі атлета."
});
Object.assign(WEEKLY_I18N.de, {
  accessDeniedAthlete: "Kein Zugriff auf diesen Athleten. Bitte Zuweisung prüfen und über das Coach Dashboard öffnen.",
  authContextMismatch: "Es sieht so aus, als wärst du mit einem anderen Konto angemeldet. Bitte neu anmelden und erneut versuchen.",
  microcycleSaveDenied: "Kein Zugriff zum Speichern des Mikrozyklus. Bitte Trial/Abo (planStatus/accessStatus) im Athletenprofil prüfen."
});
Object.assign(WEEKLY_I18N.es, {
  accessDeniedAthlete: "Acceso denegado para este atleta. Verifica la asignación y abre desde Coach Dashboard.",
  authContextMismatch: "Parece que iniciaste sesión con otra cuenta. Vuelve a iniciar sesión e inténtalo de nuevo.",
  microcycleSaveDenied: "No hay acceso para guardar el microciclo. Verifica trial/suscripción (planStatus/accessStatus) en el perfil del atleta."
});
Object.assign(WEEKLY_I18N.ru, {
  accessDeniedAthlete: "Нет доступа к этому атлету. Проверьте назначение и откройте страницу из Coach Dashboard.",
  authContextMismatch: "Похоже, вход выполнен под другим аккаунтом. Войдите заново и попробуйте еще раз.",
  microcycleSaveDenied: "Нет доступа для сохранения микроцикла. Проверьте trial/подписку (planStatus/accessStatus) в профиле атлета."
});
Object.assign(WEEKLY_I18N.pt, {
  accessDeniedAthlete: "Acesso negado para este atleta. Verifique a atribuição e abra pelo Coach Dashboard.",
  authContextMismatch: "Parece que você entrou com outra conta. Faça login novamente e tente de novo.",
  microcycleSaveDenied: "Sem acesso para salvar o microciclo. Verifique trial/assinatura (planStatus/accessStatus) no perfil do atleta."
});
Object.assign(WEEKLY_I18N.de, { title: "Weekly Individual | ProAthleteCare", tagline: "Professionelle Athletenbetreuung online", pageTitle: "Weekly Individual: Mikrozyklusplanung", subHeader: "Dein individueller Wochenplan und Lastverteilung.", microcyclePrefix: "Mikrozyklus", colDay: "Tag", colStatus: "MD Status", colActivity: "Aktivität", planTitle: "Dein Wochenplan", planNote: "Markiere Spieltage in der Aktivität und passe Trainingstage bei Bedarf an.", savePlan: "Wochenplan speichern", modalTitle: "Übung auswählen", qualityFilterTitle: "Nach Belastungsqualität filtern:", addSelected: "Ausgewählte hinzufügen", loadingUser: "Lädt...", statusLabel: "Status", keyLabel: "Schlüssel", createdEmpty: "leer erstellt", coachOnlyPlan: "Nur Trainer können Übungen planen", coachOnlyChange: "Nur Trainer können das Programm ändern", coachOnlyApply: "Nur Trainer können Änderungen anwenden", whyChanged: "Was wurde geändert und warum" });
Object.assign(WEEKLY_I18N.es, { title: "Weekly Individual | ProAthleteCare", tagline: "Acompañamiento profesional del atleta online", pageTitle: "Weekly Individual: Planificación del microciclo", subHeader: "Tu plan semanal individual y distribución de carga.", microcyclePrefix: "Microciclo", colDay: "Día", colStatus: "Estado MD", colActivity: "Actividad", planTitle: "Tu plan semanal", planNote: "Marca los días de partido en Actividad y ajusta los días de entrenamiento si hace falta.", savePlan: "Guardar plan semanal", modalTitle: "Seleccionar ejercicio", qualityFilterTitle: "Filtrar por calidad de carga:", addSelected: "Añadir seleccionados", loadingUser: "Cargando...", statusLabel: "Estado", keyLabel: "Clave", createdEmpty: "creado vacío", coachOnlyPlan: "Solo el entrenador puede planificar ejercicios", coachOnlyChange: "Solo el entrenador puede cambiar el programa", coachOnlyApply: "Solo el entrenador puede aplicar cambios", whyChanged: "Qué se cambió y por qué" });
Object.assign(WEEKLY_I18N.ru, { title: "Weekly Individual | ProAthleteCare", tagline: "Профессиональное сопровождение атлета онлайн", pageTitle: "Weekly Individual: Планирование микроцикла", subHeader: "Ваш индивидуальный недельный план и распределение нагрузки.", microcyclePrefix: "Микроцикл", colDay: "День", colStatus: "MD Статус", colActivity: "Активность", planTitle: "Ваш недельный план", planNote: "Отметьте матчевые дни в «Активности» и при необходимости скорректируйте тренировочные.", savePlan: "Сохранить недельный план", modalTitle: "Выбор упражнения", qualityFilterTitle: "Фильтр по качеству нагрузки:", addSelected: "Добавить выбранные", loadingUser: "Загрузка...", statusLabel: "Статус", keyLabel: "Ключ", createdEmpty: "создано пустым", coachOnlyPlan: "Только тренер может планировать упражнения", coachOnlyChange: "Только тренер может менять программу", coachOnlyApply: "Только тренер может применять изменения", whyChanged: "Что изменено и почему" });
Object.assign(WEEKLY_I18N.pt, { title: "Weekly Individual | ProAthleteCare", tagline: "Acompanhamento profissional do atleta online", pageTitle: "Weekly Individual: Planejamento do microciclo", subHeader: "Seu plano semanal individual e distribuição de carga.", microcyclePrefix: "Microciclo", colDay: "Dia", colStatus: "Status MD", colActivity: "Atividade", planTitle: "Seu plano semanal", planNote: "Marque dias de jogo em Atividade e ajuste os dias de treino se necessário.", savePlan: "Salvar plano semanal", modalTitle: "Selecionar exercício", qualityFilterTitle: "Filtrar por qualidade de carga:", addSelected: "Adicionar selecionados", loadingUser: "Carregando...", statusLabel: "Status", keyLabel: "Chave", createdEmpty: "criado vazio", coachOnlyPlan: "Apenas o treinador pode planejar exercícios", coachOnlyChange: "Apenas o treinador pode alterar o programa", coachOnlyApply: "Apenas o treinador pode aplicar mudanças", whyChanged: "O que mudou e por quê" });
Object.assign(WEEKLY_I18N.en, {
  weeklyAnalysisTitle: "Weekly Analysis",
  weeklyVolumeTitle: "Weekly Volume",
  weeklyVolumeDays: "Completed days",
  weeklyVolumeTotal: "Total minutes",
  weeklyVolumeDone: "Completed exercises",
  weeklyVolumeFocus: "Weekly focus",
  weeklyVolumeEmpty: "No completed exercises in this week yet.",
  weeklyVolumeHint: "Minutes are calculated from completed exercises in Daily.",
  weeklyVolumeMinUnit: "min",
  weeklyNutritionSummaryTitle: "Nutrition Summary",
  weeklyNutritionSummaryDays: "Days with menu",
  weeklyNutritionSummaryCalories: "Weekly calories",
  weeklyNutritionSummaryMacros: "Weekly macros",
  weeklyNutritionSummaryMeals: "Meals planned",
  weeklyNutritionSummaryEmpty: "No nutrition plan for this week yet.",
  weeklyNutritionSummaryHint: "Nutrition data is loaded from Weight Control."
});
Object.assign(WEEKLY_I18N.uk, {
  weeklyAnalysisTitle: "Тижневий аналіз",
  weeklyVolumeTitle: "Тижневий обсяг",
  weeklyVolumeDays: "Виконано днів",
  weeklyVolumeTotal: "Разом хвилин",
  weeklyVolumeDone: "Виконано вправ",
  weeklyVolumeFocus: "Фокус тижня",
  weeklyVolumeEmpty: "Поки немає завершених вправ за цей тиждень.",
  weeklyVolumeHint: "Хвилини рахуються з завершених вправ у Daily.",
  weeklyVolumeMinUnit: "хв",
  weeklyNutritionSummaryTitle: "Підсумок харчування",
  weeklyNutritionSummaryDays: "Днів із меню",
  weeklyNutritionSummaryCalories: "Калорії за тиждень",
  weeklyNutritionSummaryMacros: "Макроси за тиждень",
  weeklyNutritionSummaryMeals: "Заплановано прийомів їжі",
  weeklyNutritionSummaryEmpty: "План харчування на цей тиждень ще не згенеровано.",
  weeklyNutritionSummaryHint: "Дані харчування беруться з Weight Control."
});
Object.assign(WEEKLY_I18N.de, {
  weeklyAnalysisTitle: "Wochenanalyse",
  weeklyVolumeTitle: "Wochenvolumen",
  weeklyVolumeDays: "Abgeschlossene Tage",
  weeklyVolumeTotal: "Gesamtminuten",
  weeklyVolumeDone: "Abgeschlossene Übungen",
  weeklyVolumeFocus: "Wochenfokus",
  weeklyVolumeEmpty: "Für diese Woche sind noch keine Übungen abgeschlossen.",
  weeklyVolumeHint: "Minuten werden aus abgeschlossenen Übungen in Daily berechnet.",
  weeklyVolumeMinUnit: "min",
  weeklyNutritionSummaryTitle: "Ernährungsübersicht",
  weeklyNutritionSummaryDays: "Tage mit Plan",
  weeklyNutritionSummaryCalories: "Wochenkalorien",
  weeklyNutritionSummaryMacros: "Wochen-Makros",
  weeklyNutritionSummaryMeals: "Geplante Mahlzeiten",
  weeklyNutritionSummaryEmpty: "Für diese Woche ist noch kein Ernährungsplan vorhanden.",
  weeklyNutritionSummaryHint: "Ernährungsdaten werden aus Weight Control geladen."
});
Object.assign(WEEKLY_I18N.es, {
  weeklyAnalysisTitle: "Análisis semanal",
  weeklyVolumeTitle: "Volumen Semanal",
  weeklyVolumeDays: "Días completados",
  weeklyVolumeTotal: "Minutos Totales",
  weeklyVolumeDone: "Ejercicios completados",
  weeklyVolumeFocus: "Enfoque Semanal",
  weeklyVolumeEmpty: "Aún no hay ejercicios completados esta semana.",
  weeklyVolumeHint: "Los minutos se calculan desde ejercicios completados en Daily.",
  weeklyVolumeMinUnit: "min",
  weeklyNutritionSummaryTitle: "Resumen de nutrición",
  weeklyNutritionSummaryDays: "Días con menú",
  weeklyNutritionSummaryCalories: "Calorías semanales",
  weeklyNutritionSummaryMacros: "Macros semanales",
  weeklyNutritionSummaryMeals: "Comidas planificadas",
  weeklyNutritionSummaryEmpty: "Aún no hay plan nutricional para esta semana.",
  weeklyNutritionSummaryHint: "Los datos de nutrición se cargan desde Weight Control."
});
Object.assign(WEEKLY_I18N.ru, {
  weeklyAnalysisTitle: "Недельный анализ",
  weeklyVolumeTitle: "Недельный объём",
  weeklyVolumeDays: "Выполнено дней",
  weeklyVolumeTotal: "Всего минут",
  weeklyVolumeDone: "Завершено упражнений",
  weeklyVolumeFocus: "Фокус недели",
  weeklyVolumeEmpty: "За эту неделю пока нет завершённых упражнений.",
  weeklyVolumeHint: "Минуты считаются по завершённым упражнениям в Daily.",
  weeklyVolumeMinUnit: "мин",
  weeklyNutritionSummaryTitle: "Сводка питания",
  weeklyNutritionSummaryDays: "Дней с меню",
  weeklyNutritionSummaryCalories: "Калории за неделю",
  weeklyNutritionSummaryMacros: "Макросы за неделю",
  weeklyNutritionSummaryMeals: "Запланировано приёмов пищи",
  weeklyNutritionSummaryEmpty: "План питания на эту неделю ещё не сгенерирован.",
  weeklyNutritionSummaryHint: "Данные питания загружаются из Weight Control."
});
Object.assign(WEEKLY_I18N.pt, {
  weeklyAnalysisTitle: "Análise semanal",
  weeklyVolumeTitle: "Volume Semanal",
  weeklyVolumeDays: "Dias concluídos",
  weeklyVolumeTotal: "Minutos Totais",
  weeklyVolumeDone: "Exercícios concluídos",
  weeklyVolumeFocus: "Foco da Semana",
  weeklyVolumeEmpty: "Ainda não há exercícios concluídos esta semana.",
  weeklyVolumeHint: "Os minutos são calculados a partir dos exercícios concluídos no Daily.",
  weeklyVolumeMinUnit: "min",
  weeklyNutritionSummaryTitle: "Resumo de nutrição",
  weeklyNutritionSummaryDays: "Dias com menu",
  weeklyNutritionSummaryCalories: "Calorias semanais",
  weeklyNutritionSummaryMacros: "Macros semanais",
  weeklyNutritionSummaryMeals: "Refeições planeadas",
  weeklyNutritionSummaryEmpty: "Ainda não há plano nutricional para esta semana.",
  weeklyNutritionSummaryHint: "Os dados de nutrição são carregados do Weight Control."
});
WEEKLY_I18N.de.microGuide = "Wähle 1 oder 2 Spiele in der Zeile Aktivität und setze die realen Wettkampftage. Das System baut und synchronisiert die Woche automatisch rund um deine Peak-Tage.";
WEEKLY_I18N.es.microGuide = "Elige 1 o 2 partidos en la fila Actividad y marca los días reales de competición. El sistema reorganiza y sincroniza la semana automáticamente alrededor de tus días de pico.";
WEEKLY_I18N.ru.microGuide = "Выберите 1 или 2 матча в строке «Активность» и укажите реальные дни соревнований. Система автоматически перестроит и синхронизирует неделю под дни пиковой результативности.";
WEEKLY_I18N.pt.microGuide = "Escolha 1 ou 2 jogos na linha Atividade e marque os dias reais de competição. O sistema reorganiza e sincroniza a semana automaticamente em torno dos dias de pico.";

Object.assign(WEEKLY_I18N.en, {
  athleteSportLine: "Athlete: {athlete} • Sport: {sport}",
  sportUnknown: "Not set",
  sportFootball: "Football",
  sportFutsal: "Futsal",
  sportBasketball: "Basketball",
  sportHandball: "Handball",
  sportVolleyball: "Volleyball",
  sportRugby: "Rugby",
  sportAthletics: "Athletics",
  sportTennis: "Tennis",
  sportHockey: "Hockey",
  sportOther: "Other"
});
Object.assign(WEEKLY_I18N.uk, {
  athleteSportLine: "Атлет: {athlete} • Спорт: {sport}",
  sportUnknown: "Не вказано",
  sportFootball: "Футбол",
  sportFutsal: "Футзал",
  sportBasketball: "Баскетбол",
  sportHandball: "Гандбол",
  sportVolleyball: "Волейбол",
  sportRugby: "Регбі",
  sportAthletics: "Легка атлетика",
  sportTennis: "Теніс",
  sportHockey: "Хокей",
  sportOther: "Інший"
});
Object.assign(WEEKLY_I18N.de, {
  athleteSportLine: "Athlet: {athlete} • Sport: {sport}",
  sportUnknown: "Nicht angegeben",
  sportFootball: "Fussball",
  sportFutsal: "Futsal",
  sportBasketball: "Basketball",
  sportHandball: "Handball",
  sportVolleyball: "Volleyball",
  sportRugby: "Rugby",
  sportAthletics: "Leichtathletik",
  sportTennis: "Tennis",
  sportHockey: "Hockey",
  sportOther: "Andere"
});
Object.assign(WEEKLY_I18N.es, {
  athleteSportLine: "Atleta: {athlete} • Deporte: {sport}",
  sportUnknown: "No especificado",
  sportFootball: "Futbol",
  sportFutsal: "Futsal",
  sportBasketball: "Baloncesto",
  sportHandball: "Balonmano",
  sportVolleyball: "Voleibol",
  sportRugby: "Rugby",
  sportAthletics: "Atletismo",
  sportTennis: "Tenis",
  sportHockey: "Hockey",
  sportOther: "Otro"
});
Object.assign(WEEKLY_I18N.ru, {
  athleteSportLine: "Атлет: {athlete} • Спорт: {sport}",
  sportUnknown: "Не указано",
  sportFootball: "Футбол",
  sportFutsal: "Футзал",
  sportBasketball: "Баскетбол",
  sportHandball: "Гандбол",
  sportVolleyball: "Волейбол",
  sportRugby: "Регби",
  sportAthletics: "Легкая атлетика",
  sportTennis: "Теннис",
  sportHockey: "Хоккей",
  sportOther: "Другое"
});
Object.assign(WEEKLY_I18N.pt, {
  athleteSportLine: "Atleta: {athlete} • Esporte: {sport}",
  sportUnknown: "Nao definido",
  sportFootball: "Futebol",
  sportFutsal: "Futsal",
  sportBasketball: "Basquete",
  sportHandball: "Handebol",
  sportVolleyball: "Voleibol",
  sportRugby: "Rugby",
  sportAthletics: "Atletismo",
  sportTennis: "Tenis",
  sportHockey: "Hoquei",
  sportOther: "Outro"
});

Object.assign(WEEKLY_I18N.en, {
  modalSuggestedHeader: "Suggested plan",
  modalWhy: "WHY",
  modalRecommendations: "RECOMMENDATIONS",
  modalBase: "BASE",
  modalSuggested: "SUGGESTED",
  modalDetails: "DETAILS",
  modalManual: "Manual",
  modalApply: "Apply",
  modalSubtitle: "Athlete: {athlete} • Week: {week}",
  modalTitleRisk: "Suggested plan — risk {risk}/100 (mode: {mode})",
  modalPillRed: "RED",
  modalPillYellow: "YELLOW",
  modalPillGreen: "GREEN",
  modalHintHigh: "High risk detected (load / wellness / injury)",
  modalHintModerate: "Moderate risk — check details",
  modalHintOk: "All systems in safe zone",
  modalDayChip: "Day {day} • Status: {status}",
  modalNoReasons: "General state is stable. Load control is important this week.",
  modalNoRecs: "No recommendations yet (insufficient data).",
  modalContextMismatch: "Athlete context mismatch detected. Please reload this page.",
  modalOpenBlocked: "Unable to open MD for this athlete right now. Please reload the page.",
  modalNoSuggestedPlanApply: "No suggested plan to apply.",
  modalAppliedTo: "Applied to {key}[{index}] (no day booking).",
  modalNoSafeAlternativeStage: "No safe alternative in this stage. Current exercise kept.",
  modalNoSafeAlternative: "No safe alternative in this stage.",
  modalReplace: "Replace",
  modalWhyLabel: "Why",
  modalWhyReplacedUnknown: "Replaced unknown exercise: {why}",
  modalWhyAutoFilled: "Auto-filled: {why}",
  modalInjury: "Injury",
  modalInjuryControl: "Injury Control",
  modalLocation: "Location",
  modalPain: "Pain",
  modalLastUpdate: "Last update",
  modalCoords: "Coords",
  modalSeverityHigh: "HIGH",
  modalSeverityModerate: "MODERATE",
  modalSeverityLowMonitor: "LOW (monitor)",
  modalSeverityOk: "OK",
  modalBodyMass: "Body Mass",
  modalCurrent: "Current",
  modalDate: "Date",
  modalPrevious: "Previous",
  modalChange: "Change",
  modalGoalWeightLoss: "GOAL: WEIGHT LOSS",
  modalGoalMuscleGain: "GOAL: MUSCLE GAIN",
  modalGoalAthletic: "GOAL: ATHLETIC FORM",
  modalGoalUnknown: "GOAL: —",
  modalTrendCut: "TREND: CUTTING",
  modalTrendGain: "TREND: GAINING",
  modalTrendMaintain: "TREND: MAINTAIN",
  modalTrendUnknown: "TREND: —",
  modalLoadControl: "Load control",
  modalLoadStatusOk: "OK",
  modalLoadStatusHigh: "HIGH",
  modalLoadStatusLow: "LOW",
  modalSeason: "Season",
  modalZone: "Zone",
  modalNote: "Note",
  modalLoadNoteOk: "Load is within range.",
  modalLoadNoteHigh: "ACWR is above season zone — reduce volume/intensity.",
  modalLoadNoteLow: "ACWR is below season zone — possible underload depending on goal.",
  modalWellnessCnsControl: "Wellness / CNS Control",
  modalSleep: "Sleep",
  modalStress: "Stress",
  modalSoreness: "Soreness",
  modalReadiness: "Readiness",
  modalCnsFormula: "CNS = 30% sleep + 30% readiness + 25% (low stress) + 15% (low soreness).",
  modalPowerControl: "Power Control",
  modalComingSoon: "coming soon",
  modalPowerComingSoonBody: "CMJ power analysis (best / avg / fatigue) and CNS recommendations will appear here.",
  modalPowerCMJ: "Power (CMJ)",
  modalJumps: "jumps",
  modalBest: "best",
  modalAvg: "avg",
  modalImprove: "IMPROVE",
  modalFatigue: "FATIGUE",
  modalPowerStrongFatigue: "Strong fatigue: avoid heavy jumps/sprints today.",
  modalPowerModerateFatigue: "Moderate fatigue: dose explosive work.",
  modalPowerActivationOk: "Activation is good: power work can stay in the plan.",
  modalPowerStable: "Stable: maintain without overload."
});

Object.assign(WEEKLY_I18N.uk, {
  modalSuggestedHeader: "Рекомендований план",
  modalWhy: "ЧОМУ",
  modalRecommendations: "РЕКОМЕНДАЦІЇ",
  modalBase: "БАЗА",
  modalSuggested: "РЕКОМЕНДОВАНО",
  modalDetails: "ДЕТАЛІ",
  modalManual: "Вручну",
  modalApply: "Застосувати",
  modalSubtitle: "Атлет: {athlete} • Тиждень: {week}",
  modalTitleRisk: "Рекомендований план — ризик {risk}/100 (режим: {mode})",
  modalPillRed: "ЧЕРВОНИЙ",
  modalPillYellow: "ЖОВТИЙ",
  modalPillGreen: "ЗЕЛЕНИЙ",
  modalHintHigh: "Високий ризик (навантаження / wellness / травма)",
  modalHintModerate: "Помірний ризик — перевір деталі",
  modalHintOk: "Стан стабільний",
  modalDayChip: "День {day} • Статус: {status}",
  modalNoReasons: "Загальний стан стабільний. Цього тижня важливий контроль навантаження.",
  modalNoRecs: "Поки немає рекомендацій (недостатньо даних).",
  modalContextMismatch: "Виявлено невідповідність контексту атлета. Онови сторінку.",
  modalOpenBlocked: "Зараз неможливо відкрити MD для цього атлета. Онови сторінку.",
  modalNoSuggestedPlanApply: "Немає рекомендованого плану для застосування.",
  modalAppliedTo: "Застосовано до {key}[{index}] (без бронювання дня).",
  modalNoSafeAlternativeStage: "У цьому stage немає безпечної альтернативи. Поточна вправа залишена.",
  modalNoSafeAlternative: "Немає безпечної альтернативи в цьому stage.",
  modalReplace: "Замінити",
  modalWhyLabel: "Чому",
  modalWhyReplacedUnknown: "Замінено невідому вправу: {why}",
  modalWhyAutoFilled: "Автозаповнення: {why}",
  modalInjury: "Травма",
  modalInjuryControl: "Контроль травми",
  modalLocation: "Локація",
  modalPain: "Біль",
  modalLastUpdate: "Останнє оновлення",
  modalCoords: "Координати",
  modalSeverityHigh: "ВИСОКО",
  modalSeverityModerate: "ПОМІРНО",
  modalSeverityLowMonitor: "НИЗЬКО (моніторинг)",
  modalSeverityOk: "OK",
  modalBodyMass: "Маса тіла",
  modalCurrent: "Поточна",
  modalDate: "Дата",
  modalPrevious: "Попередня",
  modalChange: "Зміна",
  modalGoalWeightLoss: "ЦІЛЬ: СХУДНЕННЯ",
  modalGoalMuscleGain: "ЦІЛЬ: НАБІР М’ЯЗІВ",
  modalGoalAthletic: "ЦІЛЬ: АТЛЕТИЧНА ФОРМА",
  modalGoalUnknown: "ЦІЛЬ: —",
  modalTrendCut: "ТРЕНД: ЗНИЖЕННЯ",
  modalTrendGain: "ТРЕНД: НАБІР",
  modalTrendMaintain: "ТРЕНД: УТРИМАННЯ",
  modalTrendUnknown: "ТРЕНД: —",
  modalLoadControl: "Контроль навантаження",
  modalLoadStatusOk: "OK",
  modalLoadStatusHigh: "ВИСОКО",
  modalLoadStatusLow: "НИЗЬКО",
  modalSeason: "Сезон",
  modalZone: "Зона",
  modalNote: "Примітка",
  modalLoadNoteOk: "Навантаження в межах норми.",
  modalLoadNoteHigh: "ACWR вище сезонної зони — краще зменшити обсяг/інтенсивність.",
  modalLoadNoteLow: "ACWR нижче сезонної зони — можливе недовантаження залежно від цілі.",
  modalWellnessCnsControl: "Wellness / контроль ЦНС",
  modalSleep: "Сон",
  modalStress: "Стрес",
  modalSoreness: "М’язова втома",
  modalReadiness: "Готовність",
  modalCnsFormula: "ЦНС = 30% сон + 30% готовність + 25% (низький стрес) + 15% (низька втома).",
  modalPowerControl: "Контроль потужності",
  modalComingSoon: "скоро",
  modalPowerComingSoonBody: "Тут буде аналіз вибуховості (CMJ / best / avg / fatigue) і рекомендації по ЦНС.",
  modalPowerCMJ: "Потужність (CMJ)",
  modalJumps: "стрибків",
  modalBest: "кращий",
  modalAvg: "середній",
  modalImprove: "ПРОГРЕС",
  modalFatigue: "ВТОМА",
  modalPowerStrongFatigue: "Сильна втома: сьогодні без важких стрибків/спринтів.",
  modalPowerModerateFatigue: "Помірна втома: дозуй вибухові вправи.",
  modalPowerActivationOk: "Активація ок: power можна лишати в плані.",
  modalPowerStable: "Стабільно: підтримка без перевантаження."
});

Object.assign(WEEKLY_I18N.de, {
  modalSuggestedHeader: "Empfohlener Plan",
  modalWhy: "WARUM",
  modalRecommendations: "EMPFEHLUNGEN",
  modalBase: "BASIS",
  modalSuggested: "EMPFOHLEN",
  modalDetails: "DETAILS",
  modalManual: "Manuell",
  modalApply: "Anwenden",
  modalSubtitle: "Athlet: {athlete} • Woche: {week}",
  modalTitleRisk: "Empfohlener Plan — Risiko {risk}/100 (Modus: {mode})",
  modalPillRed: "ROT",
  modalPillYellow: "GELB",
  modalPillGreen: "GRÜN",
  modalHintHigh: "Hohes Risiko erkannt (Belastung / Wellness / Verletzung)",
  modalHintModerate: "Mittleres Risiko — Details prüfen",
  modalHintOk: "Alle Systeme im grünen Bereich",
  modalDayChip: "Tag {day} • Status: {status}",
  modalNoReasons: "Allgemeiner Zustand stabil. Belastungssteuerung ist diese Woche wichtig.",
  modalNoRecs: "Noch keine Empfehlungen (zu wenig Daten).",
  modalContextMismatch: "Athletenkontext stimmt nicht überein. Bitte Seite neu laden.",
  modalOpenBlocked: "MD kann für diesen Athleten gerade nicht geöffnet werden. Seite neu laden.",
  modalNoSuggestedPlanApply: "Kein Vorschlagsplan zum Anwenden.",
  modalAppliedTo: "Angewendet auf {key}[{index}] (ohne Tagesbuchung).",
  modalNoSafeAlternativeStage: "In dieser Stage gibt es keine sichere Alternative. Übung bleibt.",
  modalNoSafeAlternative: "Keine sichere Alternative in dieser Stage.",
  modalReplace: "Ersetzen",
  modalWhyLabel: "Warum"
});

Object.assign(WEEKLY_I18N.es, {
  modalSuggestedHeader: "Plan recomendado",
  modalWhy: "POR QUÉ",
  modalRecommendations: "RECOMENDACIONES",
  modalBase: "BASE",
  modalSuggested: "RECOMENDADO",
  modalDetails: "DETALLES",
  modalManual: "Manual",
  modalApply: "Aplicar",
  modalSubtitle: "Atleta: {athlete} • Semana: {week}",
  modalTitleRisk: "Plan recomendado — riesgo {risk}/100 (modo: {mode})",
  modalPillRed: "ROJO",
  modalPillYellow: "AMARILLO",
  modalPillGreen: "VERDE",
  modalHintHigh: "Riesgo alto detectado (carga / wellness / lesión)",
  modalHintModerate: "Riesgo moderado — revisa detalles",
  modalHintOk: "Todo en zona segura",
  modalDayChip: "Día {day} • Estado: {status}",
  modalNoReasons: "Estado general estable. El control de carga es clave esta semana.",
  modalNoRecs: "Aún no hay recomendaciones (faltan datos).",
  modalContextMismatch: "Se detectó desajuste del contexto del atleta. Recarga la página.",
  modalOpenBlocked: "No se puede abrir MD para este atleta ahora. Recarga la página.",
  modalNoSuggestedPlanApply: "No hay plan sugerido para aplicar.",
  modalAppliedTo: "Aplicado a {key}[{index}] (sin reservar día).",
  modalNoSafeAlternativeStage: "No hay alternativa segura en este stage. Se mantiene la actual.",
  modalNoSafeAlternative: "No hay alternativa segura en este stage.",
  modalReplace: "Reemplazar",
  modalWhyLabel: "Por qué"
});

Object.assign(WEEKLY_I18N.ru, {
  modalSuggestedHeader: "Рекомендуемый план",
  modalWhy: "ПОЧЕМУ",
  modalRecommendations: "РЕКОМЕНДАЦИИ",
  modalBase: "БАЗА",
  modalSuggested: "РЕКОМЕНДОВАНО",
  modalDetails: "ДЕТАЛИ",
  modalManual: "Вручную",
  modalApply: "Применить",
  modalSubtitle: "Атлет: {athlete} • Неделя: {week}",
  modalTitleRisk: "Рекомендуемый план — риск {risk}/100 (режим: {mode})",
  modalPillRed: "КРАСНЫЙ",
  modalPillYellow: "ЖЕЛТЫЙ",
  modalPillGreen: "ЗЕЛЕНЫЙ",
  modalHintHigh: "Высокий риск (нагрузка / wellness / травма)",
  modalHintModerate: "Умеренный риск — проверь детали",
  modalHintOk: "Все системы в безопасной зоне",
  modalDayChip: "День {day} • Статус: {status}",
  modalNoReasons: "Общее состояние стабильно. На этой неделе важен контроль нагрузки.",
  modalNoRecs: "Пока нет рекомендаций (недостаточно данных).",
  modalContextMismatch: "Обнаружено несоответствие контекста атлета. Обновите страницу.",
  modalOpenBlocked: "Сейчас нельзя открыть MD для этого атлета. Обновите страницу.",
  modalNoSuggestedPlanApply: "Нет рекомендованного плана для применения.",
  modalAppliedTo: "Применено к {key}[{index}] (без брони дня).",
  modalNoSafeAlternativeStage: "В этом stage нет безопасной альтернативы. Текущая сохранена.",
  modalNoSafeAlternative: "Нет безопасной альтернативы в этом stage.",
  modalReplace: "Заменить",
  modalWhyLabel: "Почему"
});

Object.assign(WEEKLY_I18N.pt, {
  modalSuggestedHeader: "Plano sugerido",
  modalWhy: "POR QUE",
  modalRecommendations: "RECOMENDAÇÕES",
  modalBase: "BASE",
  modalSuggested: "SUGERIDO",
  modalDetails: "DETALHES",
  modalManual: "Manual",
  modalApply: "Aplicar",
  modalSubtitle: "Atleta: {athlete} • Semana: {week}",
  modalTitleRisk: "Plano sugerido — risco {risk}/100 (modo: {mode})",
  modalPillRed: "VERMELHO",
  modalPillYellow: "AMARELO",
  modalPillGreen: "VERDE",
  modalHintHigh: "Risco alto detectado (carga / wellness / lesão)",
  modalHintModerate: "Risco moderado — ver detalhes",
  modalHintOk: "Tudo em zona segura",
  modalDayChip: "Dia {day} • Status: {status}",
  modalNoReasons: "Estado geral estável. O controle de carga é importante esta semana.",
  modalNoRecs: "Ainda sem recomendações (dados insuficientes).",
  modalContextMismatch: "Incompatibilidade de contexto do atleta detectada. Recarregue a página.",
  modalOpenBlocked: "Não foi possível abrir MD para este atleta agora. Recarregue a página.",
  modalNoSuggestedPlanApply: "Não há plano sugerido para aplicar.",
  modalAppliedTo: "Aplicado em {key}[{index}] (sem reservar dia).",
  modalNoSafeAlternativeStage: "Não há alternativa segura neste stage. Exercício mantido.",
  modalNoSafeAlternative: "Não há alternativa segura neste stage.",
  modalReplace: "Substituir",
  modalWhyLabel: "Por quê"
});

Object.assign(WEEKLY_I18N.en, {
  modalVerdictDefault: "You can follow the plan without changes.",
  modalVerdictRest: "Better to prioritize recovery/rest today. Remove CNS-heavy stimuli.",
  modalVerdictRehab: "Focus: rehab + controlled stimulus (pain not above 3/10).",
  modalVerdictLight: "Reduce intensity/volume, keep quality and technique.",
  modalVerdictMd1: "MD-1: low-fatigue priming (minimal volume)."
});

Object.assign(WEEKLY_I18N.uk, {
  modalVerdictDefault: "План можна виконувати без змін.",
  modalVerdictRest: "Сьогодні краще recovery/відпочинок. Забираємо CNS-heavy стимули.",
  modalVerdictRehab: "Фокус: rehab + контрольований стимул (біль не вище 3/10).",
  modalVerdictLight: "Зменшуємо інтенсивність/об’єм, зберігаємо якість і техніку.",
  modalVerdictMd1: "MD-1: прайминг без втоми (мінімум об’єму)."
});

Object.assign(WEEKLY_I18N.de, {
  modalInjury: "Verletzung",
  modalInjuryControl: "Verletzungskontrolle",
  modalLocation: "Bereich",
  modalPain: "Schmerz",
  modalLastUpdate: "Letztes Update",
  modalCoords: "Koordinaten",
  modalSeverityHigh: "HOCH",
  modalSeverityModerate: "MITTEL",
  modalSeverityLowMonitor: "NIEDRIG (beobachten)",
  modalSeverityOk: "OK",
  modalBodyMass: "Körpergewicht",
  modalCurrent: "Aktuell",
  modalDate: "Datum",
  modalPrevious: "Vorher",
  modalChange: "Änderung",
  modalGoalWeightLoss: "ZIEL: GEWICHT VERLIEREN",
  modalGoalMuscleGain: "ZIEL: MUSKELAUFBAU",
  modalGoalAthletic: "ZIEL: ATHLETISCHE FORM",
  modalGoalUnknown: "ZIEL: —",
  modalTrendCut: "TREND: ABNAHME",
  modalTrendGain: "TREND: ZUNAHME",
  modalTrendMaintain: "TREND: HALTEN",
  modalTrendUnknown: "TREND: —",
  modalLoadControl: "Belastungskontrolle",
  modalLoadStatusOk: "OK",
  modalLoadStatusHigh: "HOCH",
  modalLoadStatusLow: "NIEDRIG",
  modalSeason: "Saison",
  modalZone: "Zone",
  modalNote: "Hinweis",
  modalLoadNoteOk: "Belastung liegt im Zielbereich.",
  modalLoadNoteHigh: "ACWR liegt über der Saisonzonen-Grenze — Volumen/Intensität reduzieren.",
  modalLoadNoteLow: "ACWR liegt unter der Saisonzonen-Grenze — evtl. Unterlast je nach Ziel.",
  modalWellnessCnsControl: "Wellness / ZNS-Kontrolle",
  modalSleep: "Schlaf",
  modalStress: "Stress",
  modalSoreness: "Muskelkater",
  modalReadiness: "Bereitschaft",
  modalCnsFormula: "ZNS = 30% Schlaf + 30% Bereitschaft + 25% (niedriger Stress) + 15% (niedriger Muskelkater).",
  modalPowerControl: "Power-Kontrolle",
  modalComingSoon: "kommt bald",
  modalPowerComingSoonBody: "CMJ-Analyse (best / avg / fatigue) und ZNS-Empfehlungen erscheinen hier.",
  modalPowerCMJ: "Power (CMJ)",
  modalJumps: "Sprünge",
  modalBest: "Best",
  modalAvg: "Avg",
  modalImprove: "VERBESSERUNG",
  modalFatigue: "ERMÜDUNG",
  modalPowerStrongFatigue: "Starke Ermüdung: heute keine schweren Sprünge/Sprints.",
  modalPowerModerateFatigue: "Moderate Ermüdung: explosive Arbeit dosieren.",
  modalPowerActivationOk: "Aktivierung ist gut: Power kann im Plan bleiben.",
  modalPowerStable: "Stabil: erhalten ohne Überlastung.",
  modalVerdictDefault: "Plan kann ohne Änderungen durchgeführt werden.",
  modalVerdictRest: "Heute besser Recovery/Erholung. ZNS-lastige Reize rausnehmen.",
  modalVerdictRehab: "Fokus: Rehab + kontrollierter Reiz (Schmerz nicht über 3/10).",
  modalVerdictLight: "Intensität/Volumen reduzieren, Qualität und Technik beibehalten.",
  modalVerdictMd1: "MD-1: Priming ohne Müdigkeit (minimales Volumen)."
});

Object.assign(WEEKLY_I18N.es, {
  modalInjury: "Lesión",
  modalInjuryControl: "Control de lesión",
  modalLocation: "Zona",
  modalPain: "Dolor",
  modalLastUpdate: "Última actualización",
  modalCoords: "Coordenadas",
  modalSeverityHigh: "ALTO",
  modalSeverityModerate: "MODERADO",
  modalSeverityLowMonitor: "BAJO (monitorizar)",
  modalSeverityOk: "OK",
  modalBodyMass: "Masa corporal",
  modalCurrent: "Actual",
  modalDate: "Fecha",
  modalPrevious: "Anterior",
  modalChange: "Cambio",
  modalGoalWeightLoss: "OBJETIVO: BAJAR PESO",
  modalGoalMuscleGain: "OBJETIVO: GANAR MÚSCULO",
  modalGoalAthletic: "OBJETIVO: FORMA ATLÉTICA",
  modalGoalUnknown: "OBJETIVO: —",
  modalTrendCut: "TENDENCIA: BAJADA",
  modalTrendGain: "TENDENCIA: SUBIDA",
  modalTrendMaintain: "TENDENCIA: MANTENER",
  modalTrendUnknown: "TENDENCIA: —",
  modalLoadControl: "Control de carga",
  modalLoadStatusOk: "OK",
  modalLoadStatusHigh: "ALTO",
  modalLoadStatusLow: "BAJO",
  modalSeason: "Temporada",
  modalZone: "Zona",
  modalNote: "Nota",
  modalLoadNoteOk: "La carga está dentro del rango.",
  modalLoadNoteHigh: "ACWR por encima de la zona de temporada — reduce volumen/intensidad.",
  modalLoadNoteLow: "ACWR por debajo de la zona de temporada — posible subcarga según el objetivo.",
  modalWellnessCnsControl: "Wellness / control SNC",
  modalSleep: "Sueño",
  modalStress: "Estrés",
  modalSoreness: "Dolor muscular",
  modalReadiness: "Preparación",
  modalCnsFormula: "SNC = 30% sueño + 30% preparación + 25% (bajo estrés) + 15% (bajo dolor muscular).",
  modalPowerControl: "Control de potencia",
  modalComingSoon: "próximamente",
  modalPowerComingSoonBody: "Aquí aparecerá el análisis CMJ (best / avg / fatigue) y recomendaciones SNC.",
  modalPowerCMJ: "Potencia (CMJ)",
  modalJumps: "saltos",
  modalBest: "mejor",
  modalAvg: "prom",
  modalImprove: "MEJORA",
  modalFatigue: "FATIGA",
  modalPowerStrongFatigue: "Fatiga alta: hoy sin saltos/sprints pesados.",
  modalPowerModerateFatigue: "Fatiga moderada: dosifica el trabajo explosivo.",
  modalPowerActivationOk: "Activación correcta: se puede mantener power en el plan.",
  modalPowerStable: "Estable: mantener sin sobrecarga.",
  modalVerdictDefault: "Se puede seguir el plan sin cambios.",
  modalVerdictRest: "Hoy mejor recovery/descanso. Quitamos estímulos pesados para el SNC.",
  modalVerdictRehab: "Enfoque: rehab + estímulo controlado (dolor no mayor a 3/10).",
  modalVerdictLight: "Reducir intensidad/volumen, mantener calidad y técnica.",
  modalVerdictMd1: "MD-1: activación sin fatiga (volumen mínimo)."
});

Object.assign(WEEKLY_I18N.ru, {
  modalInjury: "Травма",
  modalInjuryControl: "Контроль травмы",
  modalLocation: "Зона",
  modalPain: "Боль",
  modalLastUpdate: "Последнее обновление",
  modalCoords: "Координаты",
  modalSeverityHigh: "ВЫСОКО",
  modalSeverityModerate: "УМЕРЕННО",
  modalSeverityLowMonitor: "НИЗКО (мониторинг)",
  modalSeverityOk: "OK",
  modalBodyMass: "Масса тела",
  modalCurrent: "Текущая",
  modalDate: "Дата",
  modalPrevious: "Предыдущая",
  modalChange: "Изменение",
  modalGoalWeightLoss: "ЦЕЛЬ: СНИЖЕНИЕ ВЕСА",
  modalGoalMuscleGain: "ЦЕЛЬ: НАБОР МЫШЦ",
  modalGoalAthletic: "ЦЕЛЬ: АТЛЕТИЧЕСКАЯ ФОРМА",
  modalGoalUnknown: "ЦЕЛЬ: —",
  modalTrendCut: "ТРЕНД: СНИЖЕНИЕ",
  modalTrendGain: "ТРЕНД: НАБОР",
  modalTrendMaintain: "ТРЕНД: УДЕРЖАНИЕ",
  modalTrendUnknown: "ТРЕНД: —",
  modalLoadControl: "Контроль нагрузки",
  modalLoadStatusOk: "OK",
  modalLoadStatusHigh: "ВЫСОКО",
  modalLoadStatusLow: "НИЗКО",
  modalSeason: "Сезон",
  modalZone: "Зона",
  modalNote: "Примечание",
  modalLoadNoteOk: "Нагрузка в пределах нормы.",
  modalLoadNoteHigh: "ACWR выше сезонной зоны — лучше снизить объем/интенсивность.",
  modalLoadNoteLow: "ACWR ниже сезонной зоны — возможна недонагрузка в зависимости от цели.",
  modalWellnessCnsControl: "Wellness / контроль ЦНС",
  modalSleep: "Сон",
  modalStress: "Стресс",
  modalSoreness: "Мышечная боль",
  modalReadiness: "Готовность",
  modalCnsFormula: "ЦНС = 30% сон + 30% готовность + 25% (низкий стресс) + 15% (низкая мышечная боль).",
  modalPowerControl: "Контроль мощности",
  modalComingSoon: "скоро",
  modalPowerComingSoonBody: "Здесь появится анализ CMJ (best / avg / fatigue) и рекомендации по ЦНС.",
  modalPowerCMJ: "Мощность (CMJ)",
  modalJumps: "прыжков",
  modalBest: "лучший",
  modalAvg: "средний",
  modalImprove: "ПРОГРЕСС",
  modalFatigue: "УСТАЛОСТЬ",
  modalPowerStrongFatigue: "Сильная усталость: сегодня без тяжелых прыжков/спринтов.",
  modalPowerModerateFatigue: "Умеренная усталость: дозируй взрывные упражнения.",
  modalPowerActivationOk: "Активация ок: power можно оставить в плане.",
  modalPowerStable: "Стабильно: поддержка без перегруза.",
  modalVerdictDefault: "План можно выполнять без изменений.",
  modalVerdictRest: "Сегодня лучше recovery/отдых. Убираем CNS-heavy стимулы.",
  modalVerdictRehab: "Фокус: rehab + контролируемый стимул (боль не выше 3/10).",
  modalVerdictLight: "Снижаем интенсивность/объем, сохраняем качество и технику.",
  modalVerdictMd1: "MD-1: прайминг без усталости (минимум объема)."
});

Object.assign(WEEKLY_I18N.pt, {
  modalInjury: "Lesão",
  modalInjuryControl: "Controle de lesão",
  modalLocation: "Local",
  modalPain: "Dor",
  modalLastUpdate: "Última atualização",
  modalCoords: "Coordenadas",
  modalSeverityHigh: "ALTO",
  modalSeverityModerate: "MODERADO",
  modalSeverityLowMonitor: "BAIXO (monitorar)",
  modalSeverityOk: "OK",
  modalBodyMass: "Massa corporal",
  modalCurrent: "Atual",
  modalDate: "Data",
  modalPrevious: "Anterior",
  modalChange: "Mudança",
  modalGoalWeightLoss: "META: PERDA DE PESO",
  modalGoalMuscleGain: "META: GANHO MUSCULAR",
  modalGoalAthletic: "META: FORMA ATLÉTICA",
  modalGoalUnknown: "META: —",
  modalTrendCut: "TENDÊNCIA: CORTE",
  modalTrendGain: "TENDÊNCIA: GANHO",
  modalTrendMaintain: "TENDÊNCIA: MANUTENÇÃO",
  modalTrendUnknown: "TENDÊNCIA: —",
  modalLoadControl: "Controle de carga",
  modalLoadStatusOk: "OK",
  modalLoadStatusHigh: "ALTO",
  modalLoadStatusLow: "BAIXO",
  modalSeason: "Temporada",
  modalZone: "Zona",
  modalNote: "Nota",
  modalLoadNoteOk: "Carga dentro da zona.",
  modalLoadNoteHigh: "ACWR acima da zona da temporada — reduzir volume/intensidade.",
  modalLoadNoteLow: "ACWR abaixo da zona da temporada — possível subcarga dependendo do objetivo.",
  modalWellnessCnsControl: "Wellness / controle do SNC",
  modalSleep: "Sono",
  modalStress: "Estresse",
  modalSoreness: "Dor muscular",
  modalReadiness: "Prontidão",
  modalCnsFormula: "SNC = 30% sono + 30% prontidão + 25% (baixo estresse) + 15% (baixa dor muscular).",
  modalPowerControl: "Controle de potência",
  modalComingSoon: "em breve",
  modalPowerComingSoonBody: "Aqui aparecerá a análise CMJ (best / avg / fatigue) e recomendações de SNC.",
  modalPowerCMJ: "Potência (CMJ)",
  modalJumps: "saltos",
  modalBest: "melhor",
  modalAvg: "média",
  modalImprove: "MELHORA",
  modalFatigue: "FADIGA",
  modalPowerStrongFatigue: "Fadiga alta: hoje sem saltos/sprints pesados.",
  modalPowerModerateFatigue: "Fadiga moderada: dose o trabalho explosivo.",
  modalPowerActivationOk: "Ativação ok: pode manter power no plano.",
  modalPowerStable: "Estável: manter sem sobrecarga.",
  modalVerdictDefault: "Você pode seguir o plano sem mudanças.",
  modalVerdictRest: "Hoje é melhor recovery/descanso. Tiramos estímulos pesados de SNC.",
  modalVerdictRehab: "Foco: rehab + estímulo controlado (dor não acima de 3/10).",
  modalVerdictLight: "Reduzir intensidade/volume, manter qualidade e técnica.",
  modalVerdictMd1: "MD-1: priming sem fadiga (volume mínimo)."
});

Object.assign(WEEKLY_I18N.en, {
  smartRecRest: "Today prioritize recovery: sleep + light mobility + breathing. Avoid CNS-heavy work.",
  smartRecRehab: "Rehab focus: controlled volume, pain not above 3/10, no sharp direction changes.",
  smartRecLight: "Reduce intensity/volume, keep movement quality and technique.",
  smartRecMd1: "MD-1: low-fatigue priming — short, explosive, minimal volume.",
  smartRecPainHigh: "Pain {pain}/10: remove pain provokers in “{location}”, keep only pain-free range.",
  smartRecPainModerate: "Pain {pain}/10: reduce range/volume, add more isometrics and control in “{location}”.",
  smartRecCnsLow: "CNS LOW ({cns}/100): avoid max strength/heavy explosive work. Prefer technique + control + moderate volume.",
  smartRecCnsModerate: "CNS MODERATE ({cns}/100): dose strength/explosive work, focus on rep quality.",
  smartRecAcwrSpike: "ACWR {acwr} (spike): cut endurance/running load for 24–48h. Keep gym work but avoid finishing overload.",
  smartRecAcwrHigh: "ACWR {acwr}: dose endurance carefully and monitor recovery.",
  smartRecTrendCut: "Trend: CUTTING — keep strength/power with minimum effective dose, no PR chase, more recovery.",
  smartRecTrendGain: "Trend: GAINING — progression is possible, but control sudden load spikes.",
  smartRecDefaultStable: "State is stable: follow the plan. If pain/fatigue appears, open Suggested and adapt."
});

Object.assign(WEEKLY_I18N.uk, {
  smartRecRest: "Сьогодні краще recovery: сон + легка мобільність + дихання. Уникаємо CNS-heavy.",
  smartRecRehab: "Rehab фокус: контрольований об’єм, біль не вище 3/10, без різких змін напрямку.",
  smartRecLight: "Зменшуємо інтенсивність/об’єм, зберігаємо якість руху та техніку.",
  smartRecMd1: "MD-1: прайминг без втоми — коротко, вибухово, мінімум об’єму.",
  smartRecPainHigh: "Pain {pain}/10: прибираємо провокатори болю в зоні “{location}”, тільки безболісний діапазон.",
  smartRecPainModerate: "Pain {pain}/10: обмежуємо об’єм/амплітуду, більше ізометрії/контролю у зоні “{location}”.",
  smartRecCnsLow: "CNS LOW ({cns}/100): не ставимо max strength / важкі вибухові. Краще техніка + контроль + помірний об’єм.",
  smartRecCnsModerate: "CNS MODERATE ({cns}/100): силу/вибух дозуємо, акцент на якість повторень.",
  smartRecAcwrSpike: "ACWR {acwr} (spike): урізаємо endurance/біговий об’єм 24–48 год. Зал лишаємо без добивання.",
  smartRecAcwrHigh: "ACWR {acwr}: витривалість дозуємо, стежимо за відновленням.",
  smartRecTrendCut: "Trend: CUTTING — підтримуємо силу/вибух мінімально ефективною дозою, не женемось за PR, більше відновлення.",
  smartRecTrendGain: "Trend: GAINING — можна тримати прогресію, але контролюємо стрибки навантаження.",
  smartRecDefaultStable: "Стан стабільний: виконуй план. Якщо з’являється біль/втома — натискай Suggested і адаптуй."
});

Object.assign(WEEKLY_I18N.de, {
  smartRecRest: "Heute Recovery priorisieren: Schlaf + leichte Mobilität + Atmung. CNS-heavy vermeiden.",
  smartRecRehab: "Rehab-Fokus: kontrolliertes Volumen, Schmerz nicht über 3/10, keine abrupten Richtungswechsel.",
  smartRecLight: "Intensität/Volumen reduzieren, Bewegungsqualität und Technik halten.",
  smartRecMd1: "MD-1: Priming ohne Müdigkeit — kurz, explosiv, minimales Volumen.",
  smartRecPainHigh: "Schmerz {pain}/10: Provokatoren im Bereich „{location}“ entfernen, nur schmerzfreier Bereich.",
  smartRecPainModerate: "Schmerz {pain}/10: Umfang/Amplitude reduzieren, mehr Isometrie und Kontrolle in „{location}“.",
  smartRecCnsLow: "CNS LOW ({cns}/100): keine Maxkraft/schweren explosiven Reize. Technik + Kontrolle + moderates Volumen.",
  smartRecCnsModerate: "CNS MODERATE ({cns}/100): Kraft/Explosivität dosieren, Fokus auf Wiederholungsqualität.",
  smartRecAcwrSpike: "ACWR {acwr} (Spike): Ausdauer/Laufvolumen für 24–48h reduzieren. Kraft ok, aber ohne Überziehen.",
  smartRecAcwrHigh: "ACWR {acwr}: Ausdauer dosieren und Regeneration beobachten.",
  smartRecTrendCut: "Trend: CUTTING — Kraft/Power mit minimal wirksamer Dosis halten, keine PR-Jagd, mehr Recovery.",
  smartRecTrendGain: "Trend: GAINING — Progression möglich, Lastspitzen kontrollieren.",
  smartRecDefaultStable: "Zustand stabil: Plan ausführen. Bei Schmerz/Müdigkeit Suggested öffnen und anpassen."
});

Object.assign(WEEKLY_I18N.es, {
  smartRecRest: "Hoy prioriza recovery: sueño + movilidad ligera + respiración. Evita CNS-heavy.",
  smartRecRehab: "Foco rehab: volumen controlado, dolor no mayor a 3/10, sin cambios bruscos de dirección.",
  smartRecLight: "Reduce intensidad/volumen, mantén calidad de movimiento y técnica.",
  smartRecMd1: "MD-1: activación sin fatiga — corto, explosivo, volumen mínimo.",
  smartRecPainHigh: "Dolor {pain}/10: elimina provocadores en “{location}”, solo rango sin dolor.",
  smartRecPainModerate: "Dolor {pain}/10: limita amplitud/volumen, más isometría y control en “{location}”.",
  smartRecCnsLow: "CNS LOW ({cns}/100): evita fuerza máxima/explosivos pesados. Mejor técnica + control + volumen moderado.",
  smartRecCnsModerate: "CNS MODERATE ({cns}/100): dosifica fuerza/explosividad, foco en calidad de repeticiones.",
  smartRecAcwrSpike: "ACWR {acwr} (spike): reduce volumen de carrera/resistencia 24–48h. Gimnasio sí, sin sobrecarga final.",
  smartRecAcwrHigh: "ACWR {acwr}: dosifica resistencia y vigila la recuperación.",
  smartRecTrendCut: "Trend: CUTTING — mantén fuerza/potencia con dosis mínima efectiva, sin buscar PR, más recovery.",
  smartRecTrendGain: "Trend: GAINING — se puede progresar, pero controla picos bruscos de carga.",
  smartRecDefaultStable: "Estado estable: sigue el plan. Si aparece dolor/fatiga, abre Suggested y adapta."
});

Object.assign(WEEKLY_I18N.ru, {
  smartRecRest: "Сегодня приоритет recovery: сон + легкая мобильность + дыхание. Избегаем CNS-heavy.",
  smartRecRehab: "Rehab-фокус: контролируемый объем, боль не выше 3/10, без резких смен направления.",
  smartRecLight: "Снижаем интенсивность/объем, сохраняем качество движения и технику.",
  smartRecMd1: "MD-1: прайминг без усталости — коротко, взрывно, минимальный объем.",
  smartRecPainHigh: "Боль {pain}/10: убираем провокаторы в зоне «{location}», только безболезненная амплитуда.",
  smartRecPainModerate: "Боль {pain}/10: ограничиваем амплитуду/объем, больше изометрии и контроля в зоне «{location}».",
  smartRecCnsLow: "CNS LOW ({cns}/100): не ставим max strength/тяжелую взрывную работу. Лучше техника + контроль + умеренный объем.",
  smartRecCnsModerate: "CNS MODERATE ({cns}/100): дозируем силу/взрыв, акцент на качество повторений.",
  smartRecAcwrSpike: "ACWR {acwr} (spike): урезаем беговой/выносливостный объем на 24–48ч. Зал можно, но без добивания.",
  smartRecAcwrHigh: "ACWR {acwr}: дозируй выносливость и контролируй восстановление.",
  smartRecTrendCut: "Trend: CUTTING — поддерживаем силу/взрыв минимально эффективной дозой, без гонки за PR, больше recovery.",
  smartRecTrendGain: "Trend: GAINING — прогресс возможен, но контролируем резкие скачки нагрузки.",
  smartRecDefaultStable: "Состояние стабильное: выполняй план. Если появляется боль/усталость — открой Suggested и адаптируй."
});

Object.assign(WEEKLY_I18N.pt, {
  smartRecRest: "Hoje priorize recovery: sono + mobilidade leve + respiração. Evite CNS-heavy.",
  smartRecRehab: "Foco rehab: volume controlado, dor não acima de 3/10, sem mudanças bruscas de direção.",
  smartRecLight: "Reduza intensidade/volume, mantenha qualidade de movimento e técnica.",
  smartRecMd1: "MD-1: ativação sem fadiga — curto, explosivo, volume mínimo.",
  smartRecPainHigh: "Dor {pain}/10: remover provocadores na área “{location}”, só amplitude sem dor.",
  smartRecPainModerate: "Dor {pain}/10: reduzir amplitude/volume, mais isometria e controle em “{location}”.",
  smartRecCnsLow: "CNS LOW ({cns}/100): evitar força máxima/explosivo pesado. Melhor técnica + controle + volume moderado.",
  smartRecCnsModerate: "CNS MODERATE ({cns}/100): dosar força/explosão, foco na qualidade das repetições.",
  smartRecAcwrSpike: "ACWR {acwr} (spike): reduzir volume de corrida/resistência por 24–48h. Academia ok, sem exaustão final.",
  smartRecAcwrHigh: "ACWR {acwr}: dosar resistência e monitorar recuperação.",
  smartRecTrendCut: "Trend: CUTTING — manter força/potência com dose mínima efetiva, sem buscar PR, mais recovery.",
  smartRecTrendGain: "Trend: GAINING — progressão possível, mas controlar picos bruscos de carga.",
  smartRecDefaultStable: "Estado estável: siga o plano. Se houver dor/fadiga, abra Suggested e adapte."
});


function applyWeeklyActivityOptionLabels() {
  document.querySelectorAll(".activity-type-select").forEach((sel) => {
    const train = sel.querySelector('option[value="TRAIN"]');
    const match = sel.querySelector('option[value="MATCH"]');
    const rest = sel.querySelector('option[value="REST"]');
    if (train) train.textContent = wt("activityTrain");
    if (match) match.textContent = wt("activityMatch");
    if (rest) rest.textContent = wt("activityRest");
  });
}

function applyWeeklyStaticTranslations() {
  document.title = wt("title");
  const map = {
    "weekly-tagline": "tagline",
    "weekly-page-title": "pageTitle",
    "weekly-sub-header": "subHeader",
    "weekly-col-day": "colDay",
    "weekly-col-status": "colStatus",
    "weekly-col-activity": "colActivity",
    "weekly-plan-title": "planTitle",
    "weekly-note": "planNote",
    "weekly-analysis-title": "weeklyAnalysisTitle",
    "weekly-volume-title": "weeklyVolumeTitle",
    "weekly-nutrition-summary-title": "weeklyNutritionSummaryTitle",
    "weekly-micro-guide": "microGuide",
    "weekly-save-button": "savePlan",
    "modal-title-context": "modalTitle",
    "weekly-quality-filter-title": "qualityFilterTitle"
  };

  Object.entries(map).forEach(([id, key]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = wt(key);
  });

  const addSel = document.getElementById("add-selected-btn");
  if (addSel) addSel.textContent = `${wt("addSelected")} (0)`;

  const un = document.getElementById("user-name");
  if (un && (!un.textContent || un.textContent.includes("Loading") || un.textContent.includes("Заван"))) {
    un.textContent = wt("loadingUser");
  }

  const pill = document.getElementById("microcycle-mode-pill");
  if (pill && (!pill.textContent || pill.textContent.includes("Microcycle"))) {
    pill.textContent = `${wt("microcyclePrefix")}: —`;
  }

  getWeeklyDayShortNames().forEach((name, idx) => {
    const d = document.getElementById(`weekly-day-${idx}`);
    if (d) d.textContent = name;
  });

  applyWeeklyActivityOptionLabels();
  renderWeeklyAthleteContextLine().catch(() => null);
  renderWeeklyVolumeSummary().catch(() => null);
  renderWeeklyNutritionSummary().catch(() => null);
}
const SEASON_LOAD_ZONES = {
  PRESEASON:  { min: 0.9, max: 1.4 },
  INSEASON:   { min: 0.8, max: 1.2 },
  CONGESTED:  { min: 0.7, max: 1.1 },
  OFFSEASON:  { min: 0.6, max: 1.0 },
  RETURN:     { min: 0.6, max: 0.9 }
};





function getSeasonPhase(core, signals) {
  const raw =
    core?.seasonPhase ??
    signals?.seasonPhase ??
    "INSEASON";

  const norm = String(raw)
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/-/g, "");

  const map = {
    PRESEASON: "PRESEASON",
    INSEASON: "INSEASON",
    CONGESTED: "CONGESTED",
    OFFSEASON: "OFFSEASON",
    RETURN: "RETURN"
  };

  return map[norm] || "INSEASON";
}
 

function getSeasonLoadSeverity(core, signals) {
  const acwr = getACWRFromAnywhere(core, signals);
  if (acwr == null) return "ok";

  const phase = getSeasonPhase(core, signals);
  const zone = SEASON_LOAD_ZONES[phase];
  if (!zone) return "ok";

  if (acwr > zone.max) return "bad";
  if (acwr < zone.min) return "warn";
  return "ok";
}


function ensureStatusPlansExist(statuses) {
  const list = Array.isArray(statuses) && statuses.length ? statuses : CANON_STATUSES;


  // рахуємо скільки разів кожен статус зустрічається у цьому тижні
  const needed = {};
  for (const st of list) needed[st] = (needed[st] || 0) + 1;

  const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");

  let changed = false;

  for (const st of Object.keys(needed)) {
    const key = `status_plan_${st}`;
    const n = Math.max(1, needed[st]); // мінімум 1 варіант

    if (!data[key]) {
      // створюємо одразу n варіантів
      data[key] = Array.from({ length: n }, () => ({ exercises: [] }));
      changed = true;
      continue;
    }

    // якщо legacy-об'єкт — конвертуємо в масив варіантів
    if (data[key] && !Array.isArray(data[key])) {
      const first = data[key];
      data[key] = [first, ...Array.from({ length: n - 1 }, () => ({ exercises: [] }))];
      changed = true;
      continue;
    }

    // якщо масив — добиваємо до n
    if (Array.isArray(data[key]) && data[key].length < n) {
      while (data[key].length < n) data[key].push({ exercises: [] });
      changed = true;
    }

    // нормалізація exercises
    if (Array.isArray(data[key])) {
      for (const item of data[key]) {
        if (!item || !Array.isArray(item.exercises)) {
          if (item && typeof item === "object") item.exercises = [];
          changed = true;
        }
      }
    }
  }

  if (changed) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(window.PACExerciseTask.ensurePlan(data)));
}


  return data;
}



let currentUserId = null;
let __PAC_ACTIVITY_SELECTS__ = null;
let __PAC_WEEK_PLAN_CACHE__ = null;
let __weeklyNutritionPlanCache = null;
window.__weeklyCoreMismatch = false;
window.__weeklyCoreMismatchInfo = null;
const __weeklyAthleteNameCache = new Map();
let __weeklySportType = "";
let __weeklySportProfile = "TEAM_MD";
window.__weeklySportType = __weeklySportType;
window.__weeklySportProfile = __weeklySportProfile;

function deriveAthleteDisplayName(profile = {}, fallbackUid = "") {
  const firstName = String(profile?.firstName || "").trim();
  const lastName = String(profile?.lastName || "").trim();
  const fullName = `${firstName} ${lastName}`.trim();
  if (fullName) return fullName;

  const displayName = String(profile?.displayName || profile?.name || "").trim();
  if (displayName) return displayName;

  const email = String(profile?.email || "").trim();
  if (email) return email.split("@")[0] || email;

  return String(fallbackUid || "—").trim() || "—";
}

function cacheWeeklyAthleteName(uid, profile = {}) {
  const key = String(uid || "").trim();
  if (!key) return;
  __weeklyAthleteNameCache.set(key, deriveAthleteDisplayName(profile, key));
}

function normalizeWeeklySportType(raw) {
  const s = String(raw || "").trim().toLowerCase();
  if (!s) return "";
  if (s === "soccer") return "football";
  return s;
}

function weeklySportProfileFromType(raw) {
  const sport = normalizeWeeklySportType(raw);
  if (["football", "futsal", "rugby", "hockey"].includes(sport)) return "TEAM_MD";
  if (["basketball", "volleyball", "handball", "tennis"].includes(sport)) return "COURT_MD";
  if (["athletics", "other"].includes(sport)) return "INDIVIDUAL_ENDURANCE";
  return "TEAM_MD";
}

function setWeeklySportContext(rawSport) {
  __weeklySportType = normalizeWeeklySportType(rawSport);
  __weeklySportProfile = weeklySportProfileFromType(__weeklySportType);
  window.__weeklySportType = __weeklySportType;
  window.__weeklySportProfile = __weeklySportProfile;
}

function getWeeklySportProfile() {
  const p = String(window.__weeklySportProfile || __weeklySportProfile || "TEAM_MD").toUpperCase();
  if (p === "COURT_MD" || p === "INDIVIDUAL_ENDURANCE") return p;
  return "TEAM_MD";
}

function getWeeklyMatchWindow(profile = getWeeklySportProfile()) {
  const p = String(profile || "TEAM_MD").toUpperCase();
  if (p === "COURT_MD") return { preMax: 4, postMax: 2 };
  if (p === "INDIVIDUAL_ENDURANCE") return { preMax: 2, postMax: 1 };
  return { preMax: 4, postMax: 2 };
}

function weeklyStatusByMatchDiff(diff, profile = getWeeklySportProfile()) {
  if (!Number.isFinite(diff) || diff === 0) return null;
  const w = getWeeklyMatchWindow(profile);
  if (diff < 0 && diff >= -w.preMax) return `MD${diff}`;
  if (diff > 0 && diff <= w.postMax) return `MD+${diff}`;
  return null;
}

async function resolveWeeklyAthleteName(uid) {
  const key = String(uid || "").trim();
  if (!key) return "—";

  const cached = __weeklyAthleteNameCache.get(key);
  if (cached) return cached;

  try {
    const dbx = window.db || (typeof db !== "undefined" ? db : firebase.firestore());
    const snap = await dbx.collection("users").doc(key).get();
    const profile = snap.exists ? (snap.data() || {}) : {};
    const resolved = deriveAthleteDisplayName(profile, key);
    __weeklyAthleteNameCache.set(key, resolved);
    return resolved;
  } catch (e) {
    console.warn("resolveWeeklyAthleteName failed:", e?.message || e);
    __weeklyAthleteNameCache.set(key, key);
    return key;
  }
}

function weeklySportLabelKey(typeRaw) {
  const type = normalizeWeeklySportType(typeRaw);
  if (type === "football") return "sportFootball";
  if (type === "futsal") return "sportFutsal";
  if (type === "basketball") return "sportBasketball";
  if (type === "handball") return "sportHandball";
  if (type === "volleyball") return "sportVolleyball";
  if (type === "rugby") return "sportRugby";
  if (type === "athletics") return "sportAthletics";
  if (type === "tennis") return "sportTennis";
  if (type === "hockey") return "sportHockey";
  if (type === "other") return "sportOther";
  return "";
}

function weeklySportDisplayName() {
  const rawType = String(window.__weeklySportType || __weeklySportType || "").trim();
  const labelKey = weeklySportLabelKey(rawType);
  if (labelKey) return wt(labelKey);
  if (rawType) return rawType;
  return wt("sportUnknown");
}

function weeklyFocusKindLabel(kind, lang = weeklyLang()) {
  const map = {
    uk: { mobility: "Мобільність", glute: "Сідниці", core: "Кор", lower_strength: "Силові ноги", power: "Потужність", push: "Поштовх", pull: "Тяга", release: "МФР", rehab: "Реабілітація", general: "Загально" },
    en: { mobility: "Mobility", glute: "Glute", core: "Core", lower_strength: "Lower Strength", power: "Power", push: "Push", pull: "Pull", release: "Release", rehab: "Rehab", general: "General" },
    de: { mobility: "Mobilität", glute: "Gluteus", core: "Core", lower_strength: "Unterkörper Kraft", power: "Explosivität", push: "Drücken", pull: "Ziehen", release: "Release", rehab: "Reha", general: "Allgemein" },
    es: { mobility: "Movilidad", glute: "Glúteos", core: "Core", lower_strength: "Fuerza Tren Inferior", power: "Potencia", push: "Empuje", pull: "Tirón", release: "Liberación", rehab: "Rehab", general: "General" },
    ru: { mobility: "Мобильность", glute: "Ягодичные", core: "Кор", lower_strength: "Сила Низ", power: "Мощность", push: "Жим", pull: "Тяга", release: "МФР", rehab: "Реабилитация", general: "Общее" },
    pt: { mobility: "Mobilidade", glute: "Glúteos", core: "Core", lower_strength: "Força Membros Inferiores", power: "Potência", push: "Empurrar", pull: "Puxar", release: "Liberação", rehab: "Reabilitação", general: "Geral" }
  };
  return (map[lang] && map[lang][kind]) || (map.en[kind]) || kind;
}

async function renderWeeklyVolumeSummary(uidOverride = "") {
  const titleEl = document.getElementById("weekly-volume-title");
  const host = document.getElementById("weekly-volume-content");
  if (titleEl) titleEl.textContent = wt("weeklyVolumeTitle");
  if (!host) return;

  const uid = String(uidOverride || currentUserId || window.currentUserId || "").trim();
  const weekId = String(currentWeekId || window.currentWeekId || "").trim();
  if (!uid || !weekId) {
    host.innerHTML = `<span style="color:#8a8a8a;">${wt("weeklyVolumeHint")}</span>`;
    return;
  }

  host.innerHTML = `<span style="color:#8a8a8a;">${wt("loadingUser")}</span>`;
  try {
    const dbx = window.db || (typeof db !== "undefined" ? db : firebase.firestore());
    const snap = await dbx
      .collection("athlete_daily_progress")
      .where("uid", "==", uid)
      .where("weekId", "==", weekId)
      .get();

    let totalMinutes = 0;
    let doneTotal = 0;
    let plannedTotal = 0;
    let completedDays = 0;
    const focusTotals = {};

    snap.forEach((doc) => {
      const data = doc.data() || {};
      const tm = Number((data.actualSessionId ? data.actualTrainingMinutes : data.trainingMinutes) || 0);
      const done = data.actualSessionId ? Object.values(data.executionSummary||{}).filter(row=>row.goalMet===true).length : Number(data.doneCount || 0);
      const total = Number(data.totalExercises || 0);
      if (Number.isFinite(tm) && tm > 0) totalMinutes += tm;
      if (Number.isFinite(done) && done > 0) {
        doneTotal += done;
        completedDays += 1;
      }
      if (Number.isFinite(total) && total > 0) plannedTotal += total;

      const fm = (data.focusMinutes && typeof data.focusMinutes === "object") ? data.focusMinutes : {};
      Object.entries(fm).forEach(([k, v]) => {
        const n = Number(v || 0);
        if (!Number.isFinite(n) || n <= 0) return;
        focusTotals[k] = (focusTotals[k] || 0) + n;
      });
    });

    if (totalMinutes <= 0 && doneTotal <= 0) {
      host.innerHTML = `
        <span style="color:#9b9b9b;">${wt("weeklyVolumeEmpty")}</span>
        <span style="color:#747474;font-size:0.78rem;">${wt("weeklyVolumeHint")}</span>
      `;
      return;
    }

    const rows = Object.entries(focusTotals)
      .sort((a, b) => (Number(b[1]) || 0) - (Number(a[1]) || 0))
      .slice(0, 5);

    host.innerHTML = `
      <div style="display:flex;justify-content:space-between;color:#d8d8d8;">
        <span>${wt("weeklyVolumeDays")}</span>
        <span>${completedDays} / 7</span>
      </div>
      <div style="display:flex;justify-content:space-between;font-weight:800;color:#f3f3f3;">
        <span>${wt("weeklyVolumeDone")}</span>
        <span>${doneTotal}${plannedTotal > 0 ? ` / ${plannedTotal}` : ""}</span>
      </div>
      <div style="display:flex;justify-content:space-between;color:#d8d8d8;">
        <span>${wt("weeklyVolumeTotal")}</span>
        <span>${Math.round(totalMinutes)} ${wt("weeklyVolumeMinUnit")}</span>
      </div>
      <div style="margin-top:3px;color:#a7a7a7;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.5px;">${wt("weeklyVolumeFocus")}</div>
      ${rows.length ? rows.map(([kind, val]) => `
        <div style="display:flex;justify-content:space-between;color:#d3d3d3;">
          <span>${weeklyFocusKindLabel(kind)}</span>
          <span>${Math.round(Number(val) || 0)} ${wt("weeklyVolumeMinUnit")}</span>
        </div>
      `).join("") : `<span style="color:#8a8a8a;">${wt("weeklyVolumeHint")}</span>`}
    `;
  } catch (e) {
    console.warn("weekly volume load failed:", e?.message || e);
    host.innerHTML = `<span style="color:#8a8a8a;">${wt("weeklyVolumeHint")}</span>`;
  }
}

function buildWeeklyNutritionSummary() {
  const weeklyPlan = __weeklyNutritionPlanCache?.weeklyPlan || null;
  if (!weeklyPlan || !Object.keys(weeklyPlan).length) return null;

  const dayIds = Array.from({ length: 7 }, (_, idx) => weeklyDateByIndex(currentWeekId, idx)).filter(Boolean);
  let daysWithPlan = 0;
  let totalMeals = 0;
  let totalP = 0;
  let totalF = 0;
  let totalC = 0;
  let totalPlannedKcal = 0;
  let totalTargetKcal = 0;

  dayIds.forEach((dateId) => {
    const dayPlan = weeklyPlan?.[dateId];
    if (!dayPlan) return;
    daysWithPlan += 1;

    const meta = dayPlan._meta || {};
    const sum = nutritionDayTotals(dayPlan);
    const planned = Number(meta.plannedKcal || sum.k || 0);
    const target = Number(meta.targetKcal || 0);
    if (Number.isFinite(planned) && planned > 0) totalPlannedKcal += planned;
    if (Number.isFinite(target) && target > 0) totalTargetKcal += target;

    totalP += Number(sum.p || 0);
    totalF += Number(sum.f || 0);
    totalC += Number(sum.c || 0);

    ["brf", "lnc", "din"].forEach((slot) => {
      const rows = Array.isArray(dayPlan?.[slot]) ? dayPlan[slot] : [];
      totalMeals += rows.length;
    });
  });

  return {
    daysWithPlan,
    totalMeals,
    totalPlannedKcal: Math.round(totalPlannedKcal),
    totalTargetKcal: Math.round(totalTargetKcal),
    totalP: Math.round(totalP),
    totalF: Math.round(totalF),
    totalC: Math.round(totalC)
  };
}

async function renderWeeklyNutritionSummary() {
  const titleEl = document.getElementById("weekly-nutrition-summary-title");
  const host = document.getElementById("weekly-nutrition-summary-content");
  if (titleEl) titleEl.textContent = wt("weeklyNutritionSummaryTitle");
  if (!host) return;

  const summary = buildWeeklyNutritionSummary();
  if (!summary || summary.daysWithPlan <= 0) {
    host.innerHTML = `
      <span style="color:#9b9b9b;">${wt("weeklyNutritionSummaryEmpty")}</span>
      <span style="color:#747474;font-size:0.78rem;">${wt("weeklyNutritionSummaryHint")}</span>
    `;
    return;
  }

  host.innerHTML = `
    <div style="display:flex;justify-content:space-between;color:#d8d8d8;">
      <span>${wt("weeklyNutritionSummaryDays")}</span>
      <span>${summary.daysWithPlan} / 7</span>
    </div>
    <div style="display:flex;justify-content:space-between;font-weight:800;color:#f3f3f3;">
      <span>${wt("weeklyNutritionSummaryCalories")}</span>
      <span>${summary.totalPlannedKcal}${summary.totalTargetKcal > 0 ? ` / ${summary.totalTargetKcal}` : ""} ${wt("nutritionKcalUnit")}</span>
    </div>
    <div style="display:flex;justify-content:space-between;color:#d8d8d8;">
      <span>${wt("weeklyNutritionSummaryMacros")}</span>
      <span>${summary.totalP}/${summary.totalF}/${summary.totalC}</span>
    </div>
    <div style="display:flex;justify-content:space-between;color:#d8d8d8;">
      <span>${wt("weeklyNutritionSummaryMeals")}</span>
      <span>${summary.totalMeals}</span>
    </div>
  `;
}

async function renderWeeklyAthleteContextLine(uidOverride = "") {
  const el = document.getElementById("weekly-athlete-context");
  if (!el) return;
  const uid = String(uidOverride || currentUserId || window.currentUserId || "").trim();
  const athleteName = uid ? await resolveWeeklyAthleteName(uid) : "—";
  el.textContent = wtFormat("athleteSportLine", {
    athlete: athleteName || "—",
    sport: weeklySportDisplayName()
  });
}

function setSuggestedSubtitle(subEl, athleteLabel) {
  if (!subEl) return;
  subEl.textContent = wtFormat("modalSubtitle", { athlete: athleteLabel, week: currentWeekId });
}

function weeklyDateByIndex(weekId, idx) {
  const monday = parseIsoLocal(weekId);
  if (!monday) return "";
  const d = new Date(monday);
  d.setDate(monday.getDate() + Number(idx || 0));
  return isoLocal(d);
}

function weeklyDateLabel(dateId) {
  const d = parseIsoLocal(dateId);
  if (!d) return dateId || "—";
  const l = weeklyLang();
  const localeMap = {
    uk: "uk-UA",
    en: "en-US",
    de: "de-DE",
    es: "es-ES",
    ru: "ru-RU",
    pt: "pt-PT"
  };
  const locale = localeMap[l] || "en-US";
  try {
    return new Intl.DateTimeFormat(locale, { day: "2-digit", month: "2-digit" }).format(d);
  } catch (_) {
    return dateId;
  }
}

function nutritionMealName(meal) {
  const api = window.PACDietI18n;
  let base = "";
  try {
    if (api && typeof api.pickName === "function") {
      base = fixMojibake(api.pickName(meal || {}, weeklyLang())) || "";
    }
  } catch (_) { base = ""; }
  if (!base) {
    const lang = weeklyLang();
    const i18nName = meal?.name_i18n?.[lang] || meal?.name_i18n?.en;
    base = fixMojibake(i18nName || meal?.name || "—") || "—";
  }
  return base;
}

function nutritionDefaultGrams(slot) {
  if (slot === "lnc") return 430;
  if (slot === "din") return 360;
  return 280;
}

function nutritionPortionGrams(meal, slot = "brf") {
  const unit = String(meal?.portionUnit || "").toLowerCase();
  const value = Number(meal?.portionValue || 0);
  const explicitGrams = Number(meal?.portionGrams || 0);

  if (explicitGrams > 0) return Math.round(explicitGrams);
  if (unit && value > 0) {
    if (unit === "g" || unit === "гр") return Math.round(value);
    if (unit === "kg") return Math.round(value * 1000);
    if (unit === "ml" || unit === "мл") return Math.round(value);
    if (unit === "l" || unit === "л") return Math.round(value * 1000);
    if (unit === "pcs" || unit === "pc" || unit === "шт") return Math.round(value * 70);
  }

  const sources = [
    String(meal?.name_en || ""),
    String(meal?.name_uk || ""),
    String(meal?.name || ""),
    String(nutritionMealName(meal) || "")
  ];
  for (let i = 0; i < sources.length; i += 1) {
    const base = sources[i];
    if (!base) continue;
    const m = base.match(/\((\d+(?:[.,]\d+)?)\s*(kg|g|гр|ml|мл|l|л|pcs?|pc|шт)\)|\b(\d+(?:[.,]\d+)?)\s*(kg|g|гр|ml|мл|l|л|pcs?|pc|шт)\b/i);
    if (!m) continue;
    const v = Number(String(m[1] || m[3] || "0").replace(",", "."));
    const u = String(m[2] || m[4] || "").toLowerCase();
    if (v > 0) {
      if (u === "g" || u === "гр") return Math.round(v);
      if (u === "kg") return Math.round(v * 1000);
      if (u === "ml" || u === "мл") return Math.round(v);
      if (u === "l" || u === "л") return Math.round(v * 1000);
      if (u === "pcs" || u === "pc" || u === "шт") return Math.round(v * 70);
    }
  }

  return nutritionDefaultGrams(slot);
}

function nutritionMealNameClean(meal) {
  return String(nutritionMealName(meal) || "—")
    .replace(/\s*\(\d+(?:[.,]\d+)?\s*(kg|g|гр|ml|мл|l|л|pcs?|pc|шт)\)\s*/gi, " ")
    .replace(/\b\d+(?:[.,]\d+)?\s*(kg|g|гр|ml|мл|l|л|pcs?|pc|шт)\b/gi, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function nutritionSplitMealParts(name) {
  const raw = String(name || "").trim();
  if (!raw) return [];
  const main = raw.split(/\s*\+\s*|,\s*/g);
  const expanded = [];
  main.forEach((chunk) => {
    String(chunk || "")
      .split(/\s+(?:with|and|та|і|и|з|с)\s+/gi)
      .forEach((p) => expanded.push(p));
  });
  return expanded
    .map((s) => s.trim())
    .filter((s) => s && s !== "—")
    .slice(0, 4);
}

function nutritionPartClass(part) {
  const t = String(part || "").toLowerCase();
  const has = (arr) => arr.some((k) => t.includes(k));
  if (has(["egg", "eggs", "яйц", "яєц"])) return "egg";
  if (has(["sauce", "соус", "cream", "сметан", "вершк"])) return "sauce";
  if (has(["soup", "суп", "risotto", "ризотто", "syrnyky", "сирники", "omelet", "омлет"])) return "dish";
  if (has([
    "turkey", "chicken", "beef", "pork", "fish", "tuna", "salmon", "cod", "hake", "pollock",
    "shrimp", "mussels", "squid", "tofu", "egg", "omelet", "йиндич", "індич", "кур", "говяд", "говядин",
    "рыб", "риба", "тунец", "лосос", "тріск", "треск", "хек", "кревет", "міді", "кальмар", "тофу", "яйц", "омлет"
  ])) return "protein";
  if (has([
    "rice", "potato", "pasta", "bulgur", "buckwheat", "oat", "bread", "toast", "lavash", "quinoa",
    "couscous", "polenta", "millet", "рис", "картоп", "картоф", "паста", "булгур", "гречк", "овсян", "вівсян",
    "хліб", "хлеб", "тост", "лаваш", "киноа", "кускус", "пшоно", "полент"
  ])) return "carb";
  if (has([
    "salad", "vegetable", "broccoli", "spinach", "zucchini", "tomato", "cucumber", "asparagus",
    "салат", "овоч", "овощ", "броккол", "шпинат", "кабач", "томат", "помидор", "огір", "огур", "спарж"
  ])) return "veg";
  return "other";
}

function nutritionPieceUnit() {
  const l = weeklyLang();
  return (l === "uk" || l === "ru") ? "шт" : "pcs";
}

function nutritionPartNameClean(part) {
  return String(part || "")
    .replace(/\([^)]*\)/g, " ")
    .replace(/\b\d+(?:[.,]\d+)?\s*(kg|g|гр|ml|мл|l|л|pcs?|pc|шт)\b/gi, " ")
    .replace(/\b\d+(?:[.,]\d+)?\b/g, " ")
    .replace(/[,:;()[\]/]/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function nutritionLocalizeIngredientName(name) {
  const l = weeklyLang();
  let out = String(name || "");
  const mapUk = [
    [/\bomelet\b/gi, "омлет"],
    [/\bsandwich\b/gi, "сендвіч"],
    [/\btoast\b/gi, "тост"],
    [/\btofu\b/gi, "тофу"],
    [/\bmushrooms?\b/gi, "гриби"],
    [/\bbeef\b/gi, "яловичина"],
    [/\bbulgur\b/gi, "булгур"],
    [/\bquinoa\b/gi, "кіноа"],
    [/\bavocado\b/gi, "авокадо"],
    [/\bgreens?\b/gi, "зелень"],
    [/\bpotato\b/gi, "картопля"],
    [/\bchicken\b/gi, "курка"],
    [/\bturkey\b/gi, "індичка"],
    [/\beggs?\b/gi, "яйця"],
    [/\bvegetables?\b/gi, "овочі"]
  ];
  const mapRu = [
    [/\bomelet\b/gi, "омлет"],
    [/\bsandwich\b/gi, "сэндвич"],
    [/\btoast\b/gi, "тост"],
    [/\btofu\b/gi, "тофу"],
    [/\bmushrooms?\b/gi, "грибы"],
    [/\bbeef\b/gi, "говядина"],
    [/\bbulgur\b/gi, "булгур"],
    [/\bquinoa\b/gi, "киноа"],
    [/\bavocado\b/gi, "авокадо"],
    [/\bgreens?\b/gi, "зелень"],
    [/\bpotato\b/gi, "картофель"],
    [/\bchicken\b/gi, "курица"],
    [/\bturkey\b/gi, "индейка"],
    [/\beggs?\b/gi, "яйца"],
    [/\bvegetables?\b/gi, "овощи"]
  ];
  const map = l === "uk" ? mapUk : (l === "ru" ? mapRu : []);
  map.forEach(([rx, repl]) => { out = out.replace(rx, repl); });
  return out.replace(/\s{2,}/g, " ").trim();
}

function nutritionPartExplicitQty(part) {
  const raw = String(part || "");
  const unitMatch = raw.match(/\((\d+(?:[.,]\d+)?)\s*(kg|g|гр|ml|мл|l|л|pcs?|pc|шт)\)|\b(\d+(?:[.,]\d+)?)\s*(kg|g|гр|ml|мл|l|л|pcs?|pc|шт)\b/i);
  if (unitMatch) {
    const v = Number(String(unitMatch[1] || unitMatch[3] || "0").replace(",", "."));
    const u = String(unitMatch[2] || unitMatch[4] || "").toLowerCase();
    if (v > 0) {
      if (u === "g" || u === "гр") return { value: Math.round(v), unit: "g", grams: Math.round(v), explicit: true };
      if (u === "kg") return { value: Number(v.toFixed(2)), unit: "kg", grams: Math.round(v * 1000), explicit: true };
      if (u === "ml" || u === "мл") return { value: Math.round(v), unit: "ml", grams: Math.round(v), explicit: true };
      if (u === "l" || u === "л") return { value: Number(v.toFixed(2)), unit: "l", grams: Math.round(v * 1000), explicit: true };
      if (u === "pcs" || u === "pc" || u === "шт") return { value: Math.round(v), unit: "pcs", grams: Math.round(v * 70), explicit: true };
    }
  }

  const eggMatch = raw.match(/\((\d+(?:[.,]\d+)?)\s*(eggs?|egg|яйц[а-яіїєґ]*)\)|\b(\d+(?:[.,]\d+)?)\s*(eggs?|egg|яйц[а-яіїєґ]*)\b/i);
  if (eggMatch) {
    const n = Number(String(eggMatch[1] || eggMatch[3] || "0").replace(",", "."));
    if (n > 0) {
      return { value: Math.round(n), unit: "pcs", grams: Math.round(n * 60), explicit: true };
    }
  }
  return null;
}

function nutritionNeedCarbCut(meta) {
  const k = Number(meta?.targetKcal || 0);
  const c = Number(meta?.targetC || 0);
  if (!(k > 0 && c > 0)) return false;
  const carbShare = (c * 4) / k;
  return carbShare <= 0.38;
}

function nutritionPartProfile(part, cls, { carbCut = false } = {}) {
  const t = String(part || "").toLowerCase();
  const has = (arr) => arr.some((k) => t.includes(k));

  const carbMul = carbCut ? 0.85 : 1;

  if (cls === "egg") {
    return { cls, defaultGrams: 120, minGrams: 60, weight: 0.75, preferPieces: true };
  }

  if (cls === "protein") {
    if (has(["tofu", "тофу"])) return { cls, defaultGrams: 170, minGrams: 120, weight: 1.1 };
    if (has(["fish", "tuna", "salmon", "cod", "hake", "pollock", "shrimp", "mussels", "squid", "риба", "рыб", "тунец", "лосос", "кревет"])) {
      return { cls, defaultGrams: 160, minGrams: 110, weight: 1.08 };
    }
    if (has(["yogurt", "kefir", "skyr", "cheese", "cottage", "йогур", "кефір", "кефир", "сир", "творог"])) {
      return { cls, defaultGrams: 180, minGrams: 120, weight: 1.0 };
    }
    return { cls, defaultGrams: 160, minGrams: 110, weight: 1.1 };
  }

  if (cls === "carb") {
    if (has(["toast", "bread", "lavash", "sandwich", "бутерброд", "сендвіч", "тост", "хліб", "хлеб", "лаваш"])) {
      return { cls, defaultGrams: Math.round(90 * carbMul), minGrams: Math.round(55 * carbMul), weight: 0.85 };
    }
    if (has(["oat", "oatmeal", "овсян", "вівсян"])) {
      return { cls, defaultGrams: Math.round(70 * carbMul), minGrams: Math.round(45 * carbMul), weight: 0.82 };
    }
    if (has(["rice", "potato", "pasta", "bulgur", "buckwheat", "quinoa", "couscous", "полента", "millet", "рис", "картоп", "картоф", "паста", "булгур", "греч", "киноа", "кускус", "пшоно"])) {
      return { cls, defaultGrams: Math.round(140 * carbMul), minGrams: Math.round(85 * carbMul), weight: 0.9 };
    }
    return { cls, defaultGrams: Math.round(120 * carbMul), minGrams: Math.round(75 * carbMul), weight: 0.85 };
  }

  if (cls === "veg") {
    if (has(["avocado", "авокад"])) return { cls, defaultGrams: 85, minGrams: 60, weight: 0.65 };
    return { cls, defaultGrams: 120, minGrams: 70, weight: 0.62 };
  }

  if (cls === "sauce") {
    return { cls, defaultGrams: 20, minGrams: 10, weight: 0.2 };
  }

  if (cls === "dish") {
    if (has(["soup", "суп"])) return { cls, defaultGrams: 320, minGrams: 220, weight: 1.25 };
    if (has(["syrnyky", "сирники"])) return { cls, defaultGrams: 220, minGrams: 150, weight: 1.2 };
    return { cls, defaultGrams: 200, minGrams: 140, weight: 1.15 };
  }

  return { cls, defaultGrams: 110, minGrams: 70, weight: 0.8 };
}

function nutritionBreakdownByGrams(name, totalGrams, options = {}) {
  const carbCut = Boolean(options?.carbCut);
  const parts = nutritionSplitMealParts(name);
  if (parts.length < 2) return "";

  const total = Math.max(0, Math.round(Number(totalGrams || 0)));
  const rows = parts.map((part) => {
    const cleanName = nutritionLocalizeIngredientName(nutritionPartNameClean(part) || String(part || "").trim());
    const cls = nutritionPartClass(cleanName);
    const explicit = nutritionPartExplicitQty(part);
    const profile = nutritionPartProfile(cleanName, cls, { carbCut });
    return {
      name: cleanName || "—",
      cls,
      value: explicit ? Number(explicit.value || 0) : 0,
      unit: explicit ? String(explicit.unit || "g") : "g",
      grams: explicit ? Number(explicit.grams || 0) : Number(profile.defaultGrams || 0),
      explicit: Boolean(explicit),
      scaleable: !explicit,
      minGrams: explicit ? Number(explicit.grams || 0) : Number(profile.minGrams || 0),
      weight: Number(profile.weight || 1),
      preferPieces: Boolean(profile.preferPieces)
    };
  });

  const scaleable = rows.filter((r) => r.scaleable);
  const explicitSum = rows.filter((r) => r.explicit).reduce((acc, r) => acc + Number(r.grams || 0), 0);
  const minScaleable = scaleable.reduce((acc, r) => acc + Number(r.minGrams || 0), 0);
  const targetForScaleable = total > 0 ? Math.max(minScaleable, total - explicitSum) : Math.max(minScaleable, scaleable.reduce((acc, r) => acc + Number(r.grams || 0), 0));

  if (scaleable.length) {
    // Start from minimums to avoid absurd tiny numbers.
    scaleable.forEach((r) => { r.grams = Number(r.minGrams || 0); });
    let extra = Math.max(0, targetForScaleable - minScaleable);
    const wSum = scaleable.reduce((acc, r) => acc + Number(r.weight || 1), 0) || scaleable.length;

    if (extra > 0) {
      scaleable.forEach((r, idx) => {
        if (idx === scaleable.length - 1) return;
        const share = Number(r.weight || 1) / wSum;
        const add = Math.max(0, Math.round(extra * share));
        r.grams += add;
        extra -= add;
      });
      if (extra > 0) {
        scaleable[scaleable.length - 1].grams += extra;
      }
    }
  }

  return rows.map((r) => {
    const u = String(r.unit || "").toLowerCase();
    const safeName = String(r.name || "—");
    if (u === "pcs" || (r.preferPieces && !r.explicit)) {
      const pcs = r.explicit
        ? Math.max(1, Math.round(Number(r.value || 1)))
        : Math.max(1, Math.round(Number(r.grams || 0) / 60));
      return `${safeName} ${pcs} ${nutritionPieceUnit()}`;
    }
    if (u === "kg") return `${safeName} ${Number(r.value || 0).toFixed(2)} kg`;
    if (u === "l") return `${safeName} ${Number(r.value || 0).toFixed(2)} l`;
    const g = Math.max(20, Math.round(Number(r.grams || r.value || 0)));
    return `${safeName} ${g} ${wt("nutritionGramUnit")}`;
  }).join(" + ");
}

function nutritionDayStatusByIndex(idx) {
  const fromFinal = Array.isArray(window.__finalStatusesForWeek) ? window.__finalStatusesForWeek[idx] : null;
  if (fromFinal) return String(fromFinal).toUpperCase();
  const el = document.querySelector(`#day-status-${idx} .md-status`);
  const raw = String(el?.dataset?.statusCode || el?.textContent || "TRAIN").trim().toUpperCase();
  return raw || "TRAIN";
}

function nutritionDayTotals(dayPlan) {
  const out = { k: 0, p: 0, f: 0, c: 0 };
  ["brf", "lnc", "din"].forEach((slot) => {
    const rows = Array.isArray(dayPlan?.[slot]) ? dayPlan[slot] : [];
    rows.forEach((m) => {
      out.k += Number(m?.kcal || 0);
      out.p += Number(m?.p || 0);
      out.f += Number(m?.f || 0);
      out.c += Number(m?.c || 0);
    });
  });
  return out;
}

function sanitizeWeeklyNutritionPlan(rawPlan) {
  const out = {};
  if (!rawPlan || typeof rawPlan !== "object") return out;
  Object.keys(rawPlan).forEach((dayId) => {
    const day = rawPlan[dayId] || {};
    out[dayId] = {
      brf: Array.isArray(day.brf) ? day.brf : [],
      lnc: Array.isArray(day.lnc) ? day.lnc : [],
      din: Array.isArray(day.din) ? day.din : [],
      _meta: day._meta && typeof day._meta === "object" ? day._meta : {}
    };
  });
  return out;
}

function renderWeeklyNutritionForDay(dayIndex, status) {
  const weeklyPlan = __weeklyNutritionPlanCache?.weeklyPlan || null;
  const dateId = weeklyDateByIndex(currentWeekId, dayIndex);
  const dayPlan = weeklyPlan?.[dateId] || null;

  if (!weeklyPlan || !Object.keys(weeklyPlan).length) {
    if (Number(dayIndex) !== 0) return "";
    return `
      <div class="pac-day-nutrition" style="margin-top:14px; border-top:1px solid #2a2a2a; padding-top:12px;">
        <div style="font-size:12px; color:#777;">${escapeHtml(wt("nutritionEmpty"))}</div>
      </div>
    `;
  }

  if (!dayPlan) {
    return `
      <div class="pac-day-nutrition" style="margin-top:14px; border-top:1px solid #2a2a2a; padding-top:12px;">
        <div style="font-size:12px; color:#777; margin-top:4px;">${escapeHtml(wt("nutritionNoDay"))}</div>
      </div>
    `;
  }

  const meta = dayPlan._meta || {};
  const sum = nutritionDayTotals(dayPlan);
  const targetKcal = Math.round(Number(meta.targetKcal || 0));
  const plannedKcal = Math.round(Number(meta.plannedKcal || sum.k || 0));
  const kcalText = `${plannedKcal} / ${targetKcal > 0 ? targetKcal : "—"} ${escapeHtml(wt("nutritionKcalUnit"))}`;

  const row = (labelKey, list, slot) => {
    const meals = Array.isArray(list) ? list : [];
    if (!meals.length) {
      return `<div style="font-size:12px; color:#ddd; margin-top:6px;"><strong style="color:#FFC72C;">${escapeHtml(wt(labelKey))}:</strong> —</div>`;
    }
    const lines = meals.map((m) => {
      const grams = nutritionPortionGrams(m, slot);
      const kcal = Math.round(Number(m?.kcal || 0));
      const p = Math.round(Number(m?.p || 0));
      const f = Math.round(Number(m?.f || 0));
      const c = Math.round(Number(m?.c || 0));
      const rawName = nutritionMealName(m);
      const name = nutritionMealNameClean(m);
      const breakdown = nutritionBreakdownByGrams(rawName || name, grams, { carbCut: nutritionNeedCarbCut(meta) });
      const headline = breakdown || `${name} ${grams} ${wt("nutritionGramUnit")}`;
      return `
        <div style="margin-top:6px; padding:6px 8px; border-radius:8px; background:rgba(255,255,255,0.02);">
          <div style="color:#fff;">• ${escapeHtml(headline)}</div>
          <div style="margin-top:2px; color:#9ca3af; font-size:11px;">
            ${kcal} ${escapeHtml(wt("nutritionKcalUnit"))} •
            ${escapeHtml(wt("nutritionMacros"))}: ${p}/${f}/${c}
          </div>
        </div>
      `;
    }).join("");
    return `<div style="font-size:12px; color:#ddd; margin-top:6px;"><strong style="color:#FFC72C;">${escapeHtml(wt(labelKey))}:</strong>${lines}</div>`;
  };

  return `
    <div class="pac-day-nutrition" style="margin-top:14px; border-top:1px solid #2a2a2a; padding-top:12px;">
      <div style="margin-top:10px; border:1px solid #2f2f2f; border-radius:10px; padding:10px; background:rgba(255,255,255,0.02);">
        <div style="font-size:13px; color:#fff; margin-top:8px;">
          <strong style="color:#FFC72C;">${escapeHtml(wt("nutritionCalories"))}:</strong> ${kcalText}
        </div>
        ${row("nutritionBreakfast", dayPlan.brf, "brf")}
        ${row("nutritionLunch", dayPlan.lnc, "lnc")}
        ${row("nutritionDinner", dayPlan.din, "din")}
      </div>
    </div>
  `;
}

async function loadWeeklyNutritionForUser(uid) {
  const safeUid = String(uid || "").trim();
  if (!safeUid) {
    __weeklyNutritionPlanCache = null;
    if (typeof updateCycleColors === "function") updateCycleColors();
    return;
  }

  try {
    const planDoc = await db.collection("athlete_plans").doc(safeUid).get();
    const data = planDoc.exists ? (planDoc.data() || {}) : {};
    const weekOk = String(data.serverWeekId || "") === String(currentWeekId || "");
    const weeklyPlan = weekOk ? sanitizeWeeklyNutritionPlan(data.weeklyPlan || {}) : {};
    __weeklyNutritionPlanCache = { uid: safeUid, weeklyPlan };
  } catch (e) {
    console.warn("weekly nutrition load failed:", e?.message || e);
    __weeklyNutritionPlanCache = { uid: safeUid, weeklyPlan: {} };
  }

  if (typeof updateCycleColors === "function") updateCycleColors();
}

function expectedWeeklyCoreUserId() {
  try {
    const qUserId = new URL(window.location.href).searchParams.get("userId");
    return String(currentUserId || window.currentUserId || qUserId || "").trim();
  } catch {
    return String(currentUserId || window.currentUserId || "").trim();
  }
}

function resolvedWeeklyCoreUserId() {
  return String(window.__athleteCoreUserId || window.__athleteSignals?.userId || window.__athleteSignals?.uid || "").trim();
}

function hasWeeklyCoreForExpectedUser() {
  const expectedUid = expectedWeeklyCoreUserId();
  const resolvedUid = resolvedWeeklyCoreUserId();
  return Boolean(window.__athleteCore && expectedUid && resolvedUid && expectedUid === resolvedUid);
}

async function ensureWeeklyCoreForExpectedUser({ maxWaitMs = 1800 } = {}) {
  const expectedUid = expectedWeeklyCoreUserId();
  if (!expectedUid) {
    return { ok: false, expectedUid: "", resolvedUid: resolvedWeeklyCoreUserId(), core: null, reason: "missing_expected_uid" };
  }

  if (!hasWeeklyCoreForExpectedUser() && typeof window.refreshAthleteCore === "function") {
    try {
      await window.refreshAthleteCore();
    } catch (e) {
      console.warn("refreshAthleteCore in ensureWeeklyCoreForExpectedUser failed:", e?.message || e);
    }
  }

  const startedAt = Date.now();
  while (!hasWeeklyCoreForExpectedUser() && Date.now() - startedAt < maxWaitMs) {
    await new Promise((resolve) => setTimeout(resolve, 120));
  }

  const ok = hasWeeklyCoreForExpectedUser();
  window.__weeklyCoreMismatch = !ok;
  window.__weeklyCoreMismatchInfo = {
    expectedUid,
    resolvedUid: resolvedWeeklyCoreUserId(),
    checkedAtMs: Date.now(),
    reason: ok ? "ready" : "mismatch_or_timeout"
  };

  return {
    ok,
    expectedUid,
    resolvedUid: resolvedWeeklyCoreUserId(),
    core: ok ? window.__athleteCore : null,
    reason: ok ? "ready" : "mismatch_or_timeout"
  };
}

// 1. ІДЕНТИФІКАЦІЯ ТИЖНЯ (Понеділок)
function isoLocal(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseIsoLocal(dateStr) {
  const m = String(dateStr || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const dt = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function getWeekID() {
  const d = new Date();
  const dow = (d.getDay() === 0) ? 6 : d.getDay() - 1; // Mon=0..Sun=6
  d.setDate(d.getDate() - dow);
  return isoLocal(d);
}

function mondayOf(dateStr) {
  const d = parseIsoLocal(dateStr) || new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  const dow = (d.getDay() === 0) ? 6 : d.getDay() - 1; // Mon=0..Sun=6
  d.setDate(d.getDate() - dow);
  return isoLocal(d);
}

function getWeekIdFromUrl() {
  const u = new URL(window.location.href);
  const raw = u.searchParams.get("weekId");
  return raw ? mondayOf(raw) : null; // ✅ якщо дали неділю — стане понеділок
}

let currentWeekId = getWeekIdFromUrl() || getWeekID(); // ✅ завжди понеділок
let STORAGE_KEY = `weeklyPlanData_${currentWeekId}`;
window.__PAC_STORAGE_KEY__ = STORAGE_KEY; // optional debug
window.currentWeekId = currentWeekId;
const COLOR_MAP = {
    'MD': { status: 'MD', colorClass: 'color-red' },
    'MD+1': { status: 'MD+1', colorClass: 'color-dark-green' }, 
    'MD+2': { status: 'MD+2', colorClass: 'color-green' }, 
    'MD-1': { status: 'MD-1', colorClass: 'color-yellow' }, 
    'MD-2': { status: 'MD-2', colorClass: 'color-deep-green' }, 
    'MD-3': { status: 'MD-3', colorClass: 'color-orange' }, 
    'MD-4': { status: 'MD-4', colorClass: 'color-blue' }, 
    'REST': { status: 'REST', colorClass: 'color-neutral' }, 
    'TRAIN': { status: 'TRAIN', colorClass: 'color-dark-grey' }, 
};

const STATUS_QUALITY_TARGETS = {

  "MD-4": {
    include: ["strength","power","eccentric","tissue","shuttle_run"],
    exclude: ["speed","endurance"]
  },

  "MD-3": {
    include: [
      "speed_endurance",
      "hspd",
      "locomotor_volume",
      "isometric_activation",
      "mobility"
    ],
    exclude: ["strength","power","eccentric","heavy","shuttle_run"]
  },

  "MD-2": {
  include: ["speed","neural","coordination","upperbody"],
  exclude: ["legs","strength","power","endurance","eccentric","heavy","shuttle_run"]
},

"MD-1": {
  include: ["reaction","readiness","speed","power_test"],
  exclude: ["legs","strength","endurance","eccentric","isometric","heavy","fatigue","shuttle_run"]
},

  "MD": {
    include: ["match"],
    exclude: [
      "strength",
      "power",
      "speed",
      "endurance",
      "heavy",
      "training",
      "shuttle_run"
    ]
  },

  "MD+1": {
  include: ["recovery","aerobic_flush","mobility"],
  exclude: ["legs","strength","speed","power","heavy","shuttle_run"]
},

"MD+2": {
  include: ["injury_prevention","extensive_aerobic","tissue","mobility"],
  exclude: ["legs","speed","power","strength","heavy","hspd","shuttle_run"]
},

  "TRAIN": {
    include: ["development"],
    exclude: []
  },

  "LIGHT": {
    include: ["technical","coordination","neural"],
    exclude: ["heavy","endurance_high","eccentric","shuttle_run"]
  },

  "REHAB": {
    include: ["rehab","tissue","aerobic_low"],
    exclude: ["speed","power","heavy","hspd","shuttle_run"]
  },

  "REST": {
    include: [],
    exclude: ["strength","power","speed","endurance","tests","shuttle_run"]
  }

};

const STATUS_QUALITY_TARGETS_COURT = {
  "MD-4": { include: ["power", "strength", "acceleration"], exclude: ["heavy", "eccentric"] },
  "MD-3": { include: ["speed", "agility", "coordination"], exclude: ["heavy", "eccentric"] },
  "MD-2": { include: ["activation", "neural", "coordination"], exclude: ["heavy", "legs"] },
  "MD-1": { include: ["activation", "reaction", "readiness"], exclude: ["heavy", "legs", "endurance"] },
  "MD":   { include: ["match"], exclude: ["strength", "power", "speed", "heavy", "training"] },
  "MD+1": { include: ["recovery", "mobility", "tissue"], exclude: ["heavy", "legs", "power"] },
  "MD+2": { include: ["mobility", "coordination", "aerobic_low"], exclude: ["heavy", "power"] },
  "TRAIN":{ include: ["development", "mixed"], exclude: [] },
  "LIGHT":{ include: ["technical", "coordination", "activation"], exclude: ["heavy", "eccentric"] },
  "REHAB":{ include: ["rehab", "tissue", "aerobic_low"], exclude: ["heavy", "power", "speed"] },
  "REST": { include: [], exclude: ["strength", "power", "speed", "endurance", "tests"] }
};

const STATUS_QUALITY_TARGETS_ENDURANCE = {
  "MD-4": { include: ["endurance", "aerobic", "locomotor_volume"], exclude: ["heavy", "eccentric"] },
  "MD-3": { include: ["speed_endurance", "tempo", "coordination"], exclude: ["heavy", "eccentric"] },
  "MD-2": { include: ["speed", "neural", "activation"], exclude: ["heavy", "legs"] },
  "MD-1": { include: ["activation", "readiness", "mobility"], exclude: ["heavy", "legs", "eccentric"] },
  "MD":   { include: ["match"], exclude: ["strength", "power", "speed", "heavy", "training"] },
  "MD+1": { include: ["recovery", "aerobic_low", "mobility"], exclude: ["heavy", "power"] },
  "MD+2": { include: ["aerobic", "mobility", "tissue"], exclude: ["heavy", "power"] },
  "TRAIN":{ include: ["endurance", "development"], exclude: ["heavy"] },
  "LIGHT":{ include: ["technical", "coordination", "aerobic_low"], exclude: ["heavy", "eccentric"] },
  "REHAB":{ include: ["rehab", "tissue", "aerobic_low"], exclude: ["heavy", "power", "speed"] },
  "REST": { include: [], exclude: ["strength", "power", "speed", "endurance_high", "tests"] }
};

function getStatusQualityTargetsMap() {
  const profile = getWeeklySportProfile();
  if (profile === "COURT_MD") return STATUS_QUALITY_TARGETS_COURT;
  if (profile === "INDIVIDUAL_ENDURANCE") return STATUS_QUALITY_TARGETS_ENDURANCE;
  return STATUS_QUALITY_TARGETS;
}

(function ensureWeekIdInUrl() {
  const u = new URL(location.href);
  const p = u.searchParams;
  const fromCoach = p.get("fromCoach") === "1" || p.get("fromAdmin") === "1" || p.get("asAdmin") === "1";
  const requested = p.get("weekId");
  const requestedMonday = requested ? mondayOf(requested) : null;
  const currentMonday = getWeekID();

  // Athlete view: always pin to current week so every new week requires a fresh match choice.
  const shouldForceCurrent = !fromCoach && requestedMonday !== currentMonday;
  const shouldFillMissing = !requested;

  if (shouldForceCurrent || shouldFillMissing) {
    u.searchParams.set("weekId", currentMonday);
    history.replaceState({}, "", u.toString());
    currentWeekId = currentMonday;
    STORAGE_KEY = `weeklyPlanData_${currentWeekId}`;
    window.__PAC_STORAGE_KEY__ = STORAGE_KEY;
    window.currentWeekId = currentWeekId;
  }
})();

function getStatusOccurrenceIndex(dayIndex, statuses, status) {
  // 0-based: перший MD-1 => 0, другий MD-1 => 1
  let k = 0;
  for (let i = 0; i < dayIndex; i++) {
    if (statuses[i] === status) k++;
  }
  return k;
}

function getPlanVariant(planData, status, variantIndex) {
  const key = `status_plan_${status}`;
  const v = planData[key];

  // legacy: якщо об’єкт — вважаємо це варіант #0
  if (v && !Array.isArray(v)) {
    if (variantIndex === 0) return v;
    return null;
  }

  if (Array.isArray(v)) return v[variantIndex] || null;
  return null;
}

function getLib() {
  // якщо EXERCISE_LIBRARY існує як глобальна змінна (non-module)
  if (typeof EXERCISE_LIBRARY !== "undefined") return EXERCISE_LIBRARY;
  // якщо підключено як module і ти експортуєш в window
  return window.EXERCISE_LIBRARY || null;
}

// ---------- LIB INDEX (only exercises that exist) ----------
function buildExerciseNameIndex() {
  const lib = getLib();
  const set = new Set();
  if (!lib) return set;

  ["Pre-Training", "Main Training", "Post-Training"].forEach(stage => {
    const stageObj = lib?.[stage];
    if (!stageObj) return;
    Object.keys(stageObj).forEach(cat => {
      const arr = stageObj?.[cat]?.exercises || [];
      arr.forEach(ex => {
        const nm = String(ex?.name || "").trim().toLowerCase();
        if (nm) set.add(nm);
      });
    });
  });

  return set;
}

window.__EX_NAME_INDEX = window.__EX_NAME_INDEX || buildExerciseNameIndex();

function isExerciseInLibrary(name) {
  const nm = String(name || "").trim().toLowerCase();
  if (!nm) return false;
  if (!window.__EX_NAME_INDEX || !(window.__EX_NAME_INDEX instanceof Set)) {
    window.__EX_NAME_INDEX = buildExerciseNameIndex();
  }
  return window.__EX_NAME_INDEX.has(nm);
}

function sanitizePlanToLibrary(plan, signals, dayStatus) {
  const out = deepClone(plan || { exercises: [] });
  out.exercises = Array.isArray(out.exercises) ? out.exercises : [];

  // used set щоб не було дублів
  const used = new Set(
    out.exercises.map(e => String(e?.name || "").toLowerCase()).filter(Boolean)
  );

  for (let i = 0; i < out.exercises.length; i++) {
    const e = out.exercises[i] || {};
    const stage = e.stage || "Main Training";

    // якщо вправи нема в бібліотеці — замінюємо
    if (!isExerciseInLibrary(e.name)) {
      const current = { name: "__unknown__", category: e.category || "" };

      const res = pickReplacementExerciseSmart(
        current,
        stage,
        signals || {},
        dayStatus,
        { alreadyUsed: used }
      );

      if (res?.ex) {
        const nm = String(res.ex.name || "").toLowerCase();
        used.add(nm);
        out.exercises[i] = {
          ...res.ex,
          stage,
          whyReplaced: wtFormat("modalWhyReplacedUnknown", { why: res.why })
        };
      } else {
        // якщо навіть замінити нема чим — просто прибираємо, щоб не показувати “лівак”
        out.exercises.splice(i, 1);
        i--;
      }
    }
  }

  return out;
}



firebase.auth().onAuthStateChanged(async (user) => {
  if (user) {
    const scope = (typeof window.pacResolveDelegatedContext === "function")
      ? await window.pacResolveDelegatedContext(user, { db })
      : {
          allowed: true,
          role: "athlete",
          isAdmin: false,
          isCoach: false,
          isSuper: false,
          canCoachEdit: false,
          effectiveUserId: String(window.currentUserId || user.uid).trim(),
          targetProfile: {},
          backHref: "coach-dashboard.html"
        };

    if (!scope.allowed) {
      alert(wt("accessDeniedAthlete"));
      window.location.href = scope.backHref || "coach-dashboard.html";
      return;
    }

    if (typeof window.pacRenderDelegatedIndicator === "function") {
      window.pacRenderDelegatedIndicator(scope);
    }

    const me = scope.meProfile || {};
    cacheWeeklyAthleteName(user.uid, { ...(me || {}), email: me?.email || user.email || "" });
    window.isAdmin = !!scope.isAdmin;
    window.isCoach = !!scope.isCoach;
    window.isSuper = !!scope.isSuper;
    window.canCoachEdit = Boolean(scope.canCoachEdit);

    currentUserId = String(scope.effectiveUserId || user.uid).trim();

    let targetProfile = {};
    if (currentUserId === user.uid) {
      targetProfile = me || {};
    } else if (scope.targetProfile && Object.keys(scope.targetProfile).length) {
      targetProfile = scope.targetProfile;
    } else {
      try {
        const targetSnap = await db.collection("users").doc(currentUserId).get();
        targetProfile = targetSnap.exists ? (targetSnap.data() || {}) : {};
      } catch (e) {
        console.warn("target athlete profile read failed:", e?.message || e);
      }
    }
    cacheWeeklyAthleteName(currentUserId, targetProfile);
    setWeeklySportContext(targetProfile?.sportType || targetProfile?.sport || targetProfile?.onboarding?.summary?.sport || "");
    renderWeeklyAthleteContextLine(currentUserId).catch(() => null);

    window.currentUserId = currentUserId; // ✅ ДЛЯ athlete-core-loader.js
    window.__athleteCore = null;
    window.__athleteSignals = null;
    window.__athleteCoreUserId = null;
    window.__athleteCoreLoadedAt = 0;
    resolveWeeklyAthleteName(currentUserId).catch(() => null);


    // Force recalculation with the resolved athlete id to avoid coach-id race on page load.
    if (typeof window.refreshAthleteCore === "function") {
      try {
        await window.refreshAthleteCore();
      } catch (e) {
        console.warn("refreshAthleteCore failed:", e?.message || e);
      }
    }

    const initialCoreState = await ensureWeeklyCoreForExpectedUser({ maxWaitMs: 2200 });
    if (!initialCoreState.ok) {
      console.warn("Weekly preflight core mismatch", initialCoreState);
    }

    // ✅ дочекайся DOM, щоб існували select'и і контейнери
if (document.readyState === 'loading') {
  await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve, { once: true }));
}
await renderWeeklyAthleteContextLine(currentUserId).catch(() => null);

if(await loadFromFirebase(currentUserId)===false)return;
await loadWeeklyNutritionForUser(currentUserId);
await renderWeeklyVolumeSummary(currentUserId).catch(() => null);
await renderWeeklyNutritionSummary().catch(() => null);
//{const core = AthleteCore.calculate(currentUserId, {
  //injury: window.__injuryData,
  //wellness: window.__wellnessData,
  //load: window.__loadData
//});



  } else {
    // ✅ безпечніше ніж anonymous
    window.location.href = 'regist.html';
  }
});

function hasMeaningfulPlanData(planData) {
  if (!planData || typeof planData !== "object" || Array.isArray(planData)) return false;
  return Object.keys(planData).some((k) => {
    const v = planData[k];
    if (!v) return false;
    if (Array.isArray(v)) return v.some((x) => Array.isArray(x?.exercises) && x.exercises.length > 0);
    return Array.isArray(v.exercises) && v.exercises.length > 0;
  });
}

function countTemplateMatches(micro) {
  if (!micro || typeof micro !== "object" || Array.isArray(micro)) return 0;
  return Object.keys(micro).filter((key) => String(micro[key] || "").toUpperCase() === "MATCH").length;
}

function pickPublishedTemplateBlock(tpl, requestedMode) {
  const mode = String(requestedMode || tpl?.mode || "standard").toLowerCase();
  if (tpl?.[mode]) return tpl[mode];

  const candidates = [tpl?.custom, tpl?.standard].filter(Boolean);
  if (mode === "custom") {
    const customByMatches = candidates.find((block) => countTemplateMatches(block?.microcyclePreview) >= 2);
    if (customByMatches) return customByMatches;
  }
  if (mode === "standard") {
    const standardByMatches = candidates.find((block) => countTemplateMatches(block?.microcyclePreview) < 2);
    if (standardByMatches) return standardByMatches;
  }

  return tpl?.[String(tpl?.mode || "").toLowerCase()] || tpl?.custom || tpl?.standard || tpl;
}

let __PAC_TEMPLATE_COACH_ID__ = "";
async function getPublishedWeekPlanData(weekId, requestedMode, athleteUid = currentUserId, strict = false) {
  try {
    if (!__PAC_TEMPLATE_COACH_ID__ && athleteUid) {
      const athleteSnap = await db.collection("users").doc(String(athleteUid)).get();
      __PAC_TEMPLATE_COACH_ID__ = String(athleteSnap.data()?.coachId || "").trim();
    }
    if (!__PAC_TEMPLATE_COACH_ID__) return {};
    const templateId = `${__PAC_TEMPLATE_COACH_ID__}_${weekId}`;
    const tplSnap = await db.collection('week_templates_published').doc(templateId).get();
    if (!tplSnap.exists) return {};
    const tpl = tplSnap.data() || {};
    const block = pickPublishedTemplateBlock(tpl, requestedMode);
    return (block && block.planData && typeof block.planData === "object") ? block.planData : {};
  } catch (e) {
    console.error("template fallback failed:", e);
    if(strict)throw e;
    return {};
  }
}

async function loadFromFirebase(uid) {
  try {
    window.pacPlanReadBlocked=false;
    let doc = null;

    // 1) пробуємо індивідуальний weekly_plans
    try {
      doc = await db.collection('weekly_plans').doc(`${uid}_${currentWeekId}`).get();
    } catch (e) {
      const code = String(e?.code || "");
      console.warn("weekly_plans read failed:", code, e);

      throw e; // Denied is not an absent document.
    }

    // 2) якщо нема дока — fallback на published template (лише вправи, без автопідбору мікроциклу)
    if (!doc || !doc.exists) {
      const planData = await getPublishedWeekPlanData(currentWeekId, null, uid, true);
      document.getElementById('weekly-plan-form').hidden=false;
      if (hasMeaningfulPlanData(planData)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(window.PACExerciseTask.ensurePlan(planData)));

        document.querySelectorAll('.activity-type-select').forEach((sel) => {
          // New athlete starts with explicit manual choice, not template microcycle.
          sel.value = 'TRAIN';
        });

        updateCycleColors();
        if (typeof renderWeek === "function") renderWeek();
        if (typeof renderAllDays === "function") renderAllDays();
        return;
      }

      updateCycleColors();
      return;
    }

    // 3) якщо doc є — завантажуємо індивідуальні дані
    const data = doc.data() || {};
    document.getElementById('weekly-plan-form').hidden=false;
    __PAC_WEEK_PLAN_CACHE__ = data;
    if (String(data?.sportType || "").trim()) {
      setWeeklySportContext(data.sportType);
      renderWeeklyAthleteContextLine(uid).catch(() => null);
    }
    if (String(data?.sportProfile || "").toUpperCase()) {
      const p = String(data.sportProfile || "").toUpperCase();
      if (["TEAM_MD", "COURT_MD", "INDIVIDUAL_ENDURANCE"].includes(p)) {
        __weeklySportProfile = p;
        window.__weeklySportProfile = p;
      }
    }

    // why-panel (як у тебе)
    try {
      const nSnap = await db.collection("users").doc(uid)
        .collection("notifications")
        .orderBy("createdAt", "desc")
        .limit(5).get();

      const items = nSnap.docs.map(d => d.data() || {});
      const lastPlanUpdate = items.find(x =>
        String(x.type || "").toUpperCase().includes("PLAN") ||
        String(x.type || "").toUpperCase().includes("SUGGEST") ||
        String(x.title || "").toLowerCase().includes("план")
      );

      if (lastPlanUpdate) {
        const host = document.getElementById("plan-why-panel");
        if (host) {
          const why = lastPlanUpdate.why || lastPlanUpdate.reasons || lastPlanUpdate.text || "";
          host.innerHTML = `
            <div style="border:1px solid rgba(255,255,255,.10); border-radius:12px; padding:12px; margin:10px 0;">
              <div style="font-weight:900; color:#d4af37;">${wt("whyChanged")}</div>
              <div style="opacity:.85; margin-top:6px; font-size:13px;">${escapeHtml(String(why||"—"))}</div>
            </div>
          `;
        }
      }
    } catch (e) {
      console.warn("why panel load failed:", e);
    }

    window.__dayOverrides = {};
    window.__dayPlanOverrides = {};

    let planData = data.planData || {};
    if (!hasMeaningfulPlanData(planData)) {
      const fallbackPlanData = await getPublishedWeekPlanData(currentWeekId, null, uid, true);
      if (hasMeaningfulPlanData(fallbackPlanData)) {
        planData = fallbackPlanData;
        // Athletes may consume published planData but cannot persist or alter it.
        if (window.canCoachEdit || window.isAdmin) {
          try {
            await db.collection("weekly_plans").doc(`${uid}_${currentWeekId}`).set({
              userId: uid,
              weekId: currentWeekId,
              planData: makeWeeklyPlanFirestoreSafe(fallbackPlanData).planData,
              updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
          } catch (e) {
            console.warn("weekly plan recovery save skipped:", e?.message || e);
          }
        }
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(window.PACExerciseTask.ensurePlan(planData)));

    const micro = normalizeMicrocycleDays(data.microcycle || {});
    document.querySelectorAll('.activity-type-select').forEach((sel, idx) => {
      const key = `day${idx}`;
      if (micro[key]) sel.value = micro[key];
    });

    updateCycleColors();
  } catch (e) {
    console.error("Помилка завантаження:", e);
    window.pacPlanReadBlocked=true;
    document.getElementById('weekly-plan-form').hidden=true;
    window.pacShowPlanReadError?.(e);
    return false;
  }
}

function normalizeMicrocycleDays(rawMicro) {
  const raw = (rawMicro && typeof rawMicro === "object" && !Array.isArray(rawMicro)) ? rawMicro : {};
  const out = {};
  for (let idx = 0; idx < 7; idx += 1) {
    const modern = raw[`day${idx}`];
    const legacy = raw[`day${idx + 1}`]; // backward-compat: old docs used day1..day7
    const val = String(modern || legacy || "").toUpperCase().trim();
    if (!val) continue;
    out[`day${idx}`] = val;
  }
  return out;
}

async function syncMicrocycleToFirebase() {
  if(window.pacPlanReadBlocked)return;
  if (!currentUserId) return;
  const authUid = String(auth.currentUser?.uid || "").trim();
  const isCoachContext = !!(window.canCoachEdit || window.isAdmin);

  // Athlete page must never write to a different uid.
  if (!isCoachContext && authUid && authUid !== String(currentUserId)) {
    const msg = `UID mismatch: auth=${authUid}, target=${currentUserId}`;
    console.warn("microcycle sync blocked:", msg);
    window.__pacMicrocycleSyncError = { at: Date.now(), code: "uid-mismatch", message: msg };
    alert(wt("authContextMismatch"));
    return;
  }

  // Registration owns profile and entitlement creation. A feature page must
  // never manufacture or repair trial/billing fields.
  if (!isCoachContext && authUid) {
    const meSnap = await db.collection("users").doc(authUid).get();
    if (!meSnap.exists) throw new Error("User profile is missing; complete registration first.");
  }

  const microcycle = {};
(__PAC_ACTIVITY_SELECTS__ || document.querySelectorAll('.activity-type-select')).forEach((sel, idx) => {
  const key = `day${idx}`;
  microcycle[key] = String(sel?.value || "TRAIN").toUpperCase();
});

  const meta = calcMicrocycleMetaFromUI();
  const templatePlanData = await getPublishedWeekPlanData(currentWeekId, String(meta.mode || "").toLowerCase(), currentUserId);
  let nextPlanData = {};
  if (hasMeaningfulPlanData(templatePlanData)) {
    nextPlanData = templatePlanData;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(window.PACExerciseTask.ensurePlan(templatePlanData)));
  } else {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      nextPlanData = makeWeeklyPlanFirestoreSafe(raw).planData;
    } catch {
      nextPlanData = {};
    }
  }

  try {
    const ref = db.collection('weekly_plans').doc(`${currentUserId}_${currentWeekId}`);
    let prev = __PAC_WEEK_PLAN_CACHE__ || {};

    const prevState = String(prev.state || "WAITING");
    const prevMatchCount = Number(prev.microcycleMatchCount ?? null);
    const prevCustomNotifiedAt = prev.customNotifiedAt || null;
  
    

    

    const nextState = (prevState === "WAITING") ? "ACTIVE" : prevState;

const willSendCustom =
  (String(meta.mode || "") === "CUSTOM") &&
  (String(prev.microcycleMode || "") !== "CUSTOM") &&
  !prevCustomNotifiedAt;

const patch = {
  userId: currentUserId,
  weekId: currentWeekId,
  microcycle,
  sportType: window.__weeklySportType || null,
  sportProfile: getWeeklySportProfile(),
  microcycleMode: meta.mode,
  microcycleMatchCount: meta.matchCount,
  microcycleMatchDays: meta.matchDays,
  state: nextState,
  updatedAt: firebase.firestore.FieldValue.serverTimestamp()
};
if (isCoachContext) {
  patch.planData = nextPlanData;
}

    const shouldActivate = (prevState === "WAITING");
    // ❌ Notifications moved to "finalize" flow (debounced) to avoid duplicates.
// (We still save the plan immediately, but notify only once after user finishes choosing.)

    // ---- batching ----
    const batch = db.batch();
    batch.set(ref, patch, { merge: true });

    const metaRef = db.collection("users").doc(currentUserId)
      .collection("notifMeta").doc("main");

    // helper: create/update deterministic notification + unreadCount only if new unread
    const upsertNotificationIfNeeded = async ({ id, payload }) => {

  const notifRef = db.collection("users")
    .doc(currentUserId)
    .collection("notifications")
    .doc(id);

  batch.set(notifRef, payload, { merge: true });

  batch.set(metaRef, {
    unreadCount: firebase.firestore.FieldValue.increment(1),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  }, { merge: true });

  return { didWrite: true, didInc: true };
};

    // 1) PLAN_ACTIVATED — тільки при першій активації
    let wroteActivated = false;
    /*if (shouldActivate) {
      const res = await upsertNotificationIfNeeded({
        id: `PLAN_ACTIVATED_${currentWeekId}`,
        payload: {
          type: "PLAN_ACTIVATED",
          title: "Ваш персональний план готовий 💪",
          text: "План сформовано з урахуванням вашого ігрового мікроциклу.",
          weekId: currentWeekId,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          readAt: null
        }
      });
      wroteActivated = res.didWrite;
    }
*/
    // 2) MICROCYCLE_CUSTOM — тільки при переході <2 → >=2 і лише 1 раз
// 2) CUSTOM notify тут більше НЕ шлемо.
// Персональна нотифікація повинна приходити тільки 1 раз у finalize flow.
let wroteCustom = false;
const crossedToMultiMatch = false;

    await batch.commit();
__PAC_WEEK_PLAN_CACHE__ = {
  ...prev,
  ...patch,
  state: nextState,
  customNotifiedAt: prev.customNotifiedAt || null
};

  } catch (e) {
    console.error("Помилка збереження microcycle:", e);
    window.__pacMicrocycleSyncError = {
      at: Date.now(),
      code: String(e?.code || ""),
      message: String(e?.message || e || "")
    };
    if (String(e?.code || "").includes("permission-denied")) {
      alert(wt("microcycleSaveDenied"));
    }
  }
}
// =====================================================
// Microcycle notify: send ONCE after user finishes choosing (debounce)
// =====================================================
let __pacFinalizeTimer = null;

function getMicrocycleFinalKey(weekId) {
  return `microcycle_final_${String(weekId || "").replace(/[^a-zA-Z0-9_-]/g, "")}`;
}

function describeMicrocycle(meta, matchCount) {
  const mode = meta?.mode || "OFFSEASON";
  const profile = getWeeklySportProfile();

  if (mode === "CUSTOM") {
    return `Ваш персональний план сформовано під CUSTOM мікроцикл (${matchCount} матчі).`;
  }

  if (mode === "STANDARD") {
    return `Ваш персональний план сформовано під STANDARD мікроцикл (${matchCount} подій, профіль: ${profile}).`;
  }

  return "Мікроцикл збережено.";
}

async function sendMicrocycleFinalNotificationOnce() {
  const uid = String(currentUserId || window.currentUserId || auth.currentUser?.uid || "").trim();
  const weekId = window.currentWeekId;
  if (!uid || !weekId) return;

  const planRef = db.collection("weekly_plans").doc(`${uid}_${weekId}`);
  const notifId = getMicrocycleFinalKey(weekId);
  const notifRef = db.collection("users").doc(uid).collection("notifications").doc(notifId);
  const metaRef  = db.collection("users").doc(uid).collection("notifMeta").doc("main");

  await db.runTransaction(async (tx) => {
    const [planSnap, notifSnap, metaSnap] = await Promise.all([
      tx.get(planRef),
      tx.get(notifRef),
      tx.get(metaRef),
    ]);

    // ✅ already notified for this week -> do nothing
    if (notifSnap.exists) return;

    const plan = planSnap.exists ? (planSnap.data() || {}) : {};
const matchCount = Number(plan.microcycleMatchCount || 0);
const mcMeta = {
  mode: String(plan.microcycleMode || "OFFSEASON"),
  matchCount,
  matchDays: Array.isArray(plan.microcycleMatchDays) ? plan.microcycleMatchDays : []
};

// якщо матчів нема — фінальну нотифікацію не шлемо
if (matchCount < 1) return;

const title = "Ваш персональний план готовий 💪";
const text  = describeMicrocycle(mcMeta, matchCount);

    // Create ONE deterministic notification (same doc id)
    tx.set(notifRef, {
      type: "MICROCYCLE_FINAL",
      title,
      text,
      weekId,
      silent: true, // тихо, але ОДИН раз
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      readAt: null,
    });

    // bump unreadCount once
    const curUnread = metaSnap.exists ? Number((metaSnap.data() || {}).unreadCount || 0) : 0;
    tx.set(metaRef, {
      unreadCount: curUnread + 1,
      lastUnreadAt: firebase.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    // optional mark in plan (diagnostics)
    tx.set(planRef, {
  microcycleMeta: {
    ...mcMeta,
    notifiedAt: firebase.firestore.FieldValue.serverTimestamp(),
  }
}, { merge: true });
  });
}

function scheduleFinalizeMicrocycle({ delayMs = 20000 } = {}) {
  try { if (__pacFinalizeTimer) clearTimeout(__pacFinalizeTimer); } catch {}
  __pacFinalizeTimer = setTimeout(async () => {
    try {
      // ✅ save latest plan (no notifications here)
      await syncMicrocycleToFirebase();
      // ✅ send final notification ONCE
      await sendMicrocycleFinalNotificationOnce();
    } catch (e) {
      console.warn("finalize microcycle failed:", e?.message || e);
    }
  }, delayMs);
}
// ===============================
// PAC: Debounce + Anti-spam
// ===============================
function pacDebounce(fn, wait) {
  let t = null;
  return function(...args) {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

const PAC_WEEKLY_PLAN_SOFT_LIMIT_BYTES = 900000;
const PAC_WEEKLY_PLAN_MAX_STRING = 1800;
const PAC_WEEKLY_PLAN_MAX_LONG_TEXT = 900;

function estimateJsonBytes(value) {
  try {
    const json = JSON.stringify(value || {});
    if (typeof TextEncoder !== "undefined") return new TextEncoder().encode(json).length;
    return unescape(encodeURIComponent(json)).length;
  } catch {
    return 0;
  }
}

function clampWeeklyText(value, max = PAC_WEEKLY_PLAN_MAX_STRING) {
  if (typeof value !== "string") return value;
  if (/^data:/i.test(value)) return "";
  if (value.length <= max) return value;
  return value.slice(0, max).trim();
}

function compactWeeklyI18nMap(map, max = PAC_WEEKLY_PLAN_MAX_LONG_TEXT) {
  if (!map || typeof map !== "object" || Array.isArray(map)) return undefined;
  const out = {};
  ["uk", "en", "de", "es", "ru", "pt"].forEach((lang) => {
    const v = clampWeeklyText(map[lang], max);
    if (typeof v === "string" && v.trim()) out[lang] = v;
  });
  return Object.keys(out).length ? out : undefined;
}

function compactWeeklyStringArray(arr, maxItems = 12) {
  if (!Array.isArray(arr)) return undefined;
  const out = arr
    .map((v) => clampWeeklyText(String(v || "").trim(), 80))
    .filter(Boolean)
    .slice(0, maxItems);
  return out.length ? out : undefined;
}

function compactWeeklyNumberMap(source, keys) {
  if (!source || typeof source !== "object") return undefined;
  const out = {};
  keys.forEach((key) => {
    const value = source[key];
    if (value == null || value === "") return;
    if (typeof value === "number") {
      if (Number.isFinite(value)) out[key] = value;
      return;
    }
    if (typeof value === "boolean") {
      out[key] = value;
      return;
    }
    const n = Number(value);
    out[key] = Number.isFinite(n) && String(value).trim() !== "" ? n : clampWeeklyText(String(value), 120);
  });
  return Object.keys(out).length ? out : undefined;
}

function compactWeeklyTimer(timer) {
  return compactWeeklyNumberMap(timer, [
    "sets",
    "workSec",
    "workSeconds",
    "restSec",
    "restSeconds",
    "prepSec",
    "preparationSeconds",
    "rounds",
    "blocks",
    "restBetweenSets"
  ]);
}

function compactWeeklyPrescription(prescription) {
  if (typeof prescription === "string") return clampWeeklyText(prescription, 120);
  return compactWeeklyNumberMap(prescription, ["sets", "reps", "repsUnit", "timedSeconds"]);
}

function compactWeeklyIntervalSettings(settings) {
  return compactWeeklyNumberMap(settings, [
    "preparationSeconds",
    "workSeconds",
    "restSeconds",
    "rounds",
    "sets",
    "restBetweenSets",
    "startDelay",
    "voiceLanguage",
    "enableBeep",
    "enableWhistle",
    "enableVoice"
  ]);
}

function compactWeeklyRunningTarget(target) {
  return compactWeeklyNumberMap(target, [
    "type",
    "source",
    "zoneId",
    "mode",
    "targetDistanceKm",
    "targetDistanceM",
    "totalWorkSec",
    "targetTimeMin",
    "perimeterM",
    "widthM",
    "heightM",
    "areaM2",
    "workSec",
    "cueEverySec",
    "cueDistanceM",
    "lapDistanceM",
    "lapSource",
    "circleRadiusM",
    "laps",
    "paceSecPerKm",
    "lapTimeSec"
  ]);
}

function compactWeeklySpeedTarget(target) {
  return compactWeeklyNumberMap(target, [
    "type",
    "source",
    "zoneId",
    "preset",
    "label",
    "minKmh",
    "maxKmh",
    "accelerationMps2",
    "decelerationMps2",
    "reps",
    "laneDistanceM",
    "repDistanceM",
    "speedDistancePerRepM",
    "buildUpDistanceM",
    "brakeDistanceM",
    "autoBuildUpM",
    "autoBrakeM",
    "totalLaneDistanceM",
    "targetDistanceM",
    "minimumExposureSec",
    "targetExposureSec",
    "repTimeSec",
    "totalRestSec"
  ]);
}

function compactWeeklyExercise(ex) {
  if (!ex || typeof ex !== "object") return null;
  const out = {};
  [
    "name",
    "planItemId",
    "exerciseId",
    "id",
    "legacyProgressKey",
    "executionMode",
    "strengthTestEligible",
    "trainingPercent1RM",
    "stage",
    "category",
    "bodyGroup",
    "videoKey",
    "videoUrl",
    "videoSrc",
    "demoVideoUrl",
    "demoAutoplay",
    "drillId",
    "type",
    "coachGuided",
    "mdStatus",
    "intensity",
    "subcategory",
    "quality",
    "duration",
    "durationSeconds",
    "minutes",
    "sets",
    "reps",
    "setsCount",
    "repsCount",
    "prescriptionSets",
    "prescriptionReps",
    "scheme",
    "plan",
    "load",
    "loadKg",
    "weightKg",
    "weight",
    "kg",
    "workSec",
    "durationSec",
    "holdSec",
    "restSec",
    "pauseSec",
    "distanceMeters",
    "targetDistanceM",
    "tempo",
    "rest",
    "whyReplaced",
    "injuryWarning"
  ].forEach((key) => {
    if (ex[key] == null) return;
    const value = typeof ex[key] === "string" ? clampWeeklyText(ex[key]) : ex[key];
    if (value !== "" && value !== undefined) out[key] = value;
  });

  const description = clampWeeklyText(ex.description, PAC_WEEKLY_PLAN_MAX_LONG_TEXT);
  if (description) out.description = description;
  const recommendation = clampWeeklyText(ex.recommendation, PAC_WEEKLY_PLAN_MAX_LONG_TEXT);
  if (recommendation) out.recommendation = recommendation;

  const nameI18n = compactWeeklyI18nMap(ex.name_i18n, 220);
  if (nameI18n) out.name_i18n = nameI18n;
  const descI18n = compactWeeklyI18nMap(ex.description_i18n, PAC_WEEKLY_PLAN_MAX_LONG_TEXT);
  if (descI18n) out.description_i18n = descI18n;
  const recI18n = compactWeeklyI18nMap(ex.recommendation_i18n, PAC_WEEKLY_PLAN_MAX_LONG_TEXT);
  if (recI18n) out.recommendation_i18n = recI18n;

  const tags = compactWeeklyStringArray(ex.tags);
  if (tags) out.tags = tags;
  const qualities = compactWeeklyStringArray(ex.qualities);
  if (qualities) out.qualities = qualities;
  const primaryZones = compactWeeklyStringArray(ex.primaryZones);
  if (primaryZones) out.primaryZones = primaryZones;
  const secondaryZones = compactWeeklyStringArray(ex.secondaryZones);
  if (secondaryZones) out.secondaryZones = secondaryZones;

  const nested = ex.tacticalDrill?.exerciseObject || {};
  const series=window.PACExerciseTask.seriesTotals(ex.playerSeriesTotals?ex:ex.tacticalDrill||{});
  if(series.length)out.playerSeriesTotals=series;
  if(ex.coachRunningPlan&&typeof ex.coachRunningPlan==='object')out.coachRunningPlan={...ex.coachRunningPlan};
  const engine = ex.timingEngine || nested.timingEngine || ex.tacticalDrill?.timingEngine || {};
  const timer = compactWeeklyTimer(ex.timer || nested.timer);
  if (timer) out.timer = timer;
  const prescription = compactWeeklyPrescription(ex.prescription || nested.prescription);
  if (prescription) out.prescription = prescription;
  const intervalSettings = compactWeeklyIntervalSettings(ex.intervalSettings || nested.intervalSettings || engine.intervalSettings);
  if (intervalSettings) {
    out.intervalSettings = intervalSettings;
    out.timingEngine = {
      ...(out.timingEngine || {}),
      intervalSettings
    };
  }
  const task = window.PACExerciseTask.resolve(ex);
  const runningTarget = compactWeeklyRunningTarget(task.planned.runningTarget);
  if (runningTarget) {
    out.runningTarget = runningTarget;
    out.timingEngine = {
      ...(out.timingEngine || {}),
      runningTarget
    };
  }
  const speedTarget = compactWeeklySpeedTarget(task.planned.speedTarget);
  if (speedTarget) {
    out.speedTarget = speedTarget;
    out.timingEngine = {
      ...(out.timingEngine || {}),
      speedTarget
    };
  }

  return out.name ? out : null;
}

function compactWeeklyPlanVariant(variant) {
  const source = (variant && typeof variant === "object") ? variant : { exercises: [] };
  window.PACExerciseTask.ensureItems(source.exercises);
  const exercises = Array.isArray(source.exercises)
    ? source.exercises.map(compactWeeklyExercise).filter(Boolean)
    : [];
  return { exercises };
}

function compactWeeklyPlanDataForFirestore(planData) {
  if (!planData || typeof planData !== "object" || Array.isArray(planData)) return {};
  const out = {};
  Object.keys(planData).forEach((key) => {
    const value = planData[key];
    if (Array.isArray(value)) {
      out[key] = value.map(compactWeeklyPlanVariant);
    } else if (value && typeof value === "object" && Array.isArray(value.exercises)) {
      out[key] = compactWeeklyPlanVariant(value);
    }
  });
  return out;
}

function makeWeeklyPlanFirestoreSafe(planData) {
  let safe = compactWeeklyPlanDataForFirestore(planData);
  let bytes = estimateJsonBytes(safe);
  if (bytes <= PAC_WEEKLY_PLAN_SOFT_LIMIT_BYTES) {
    return { planData: safe, bytes, compacted: true };
  }

  safe = JSON.parse(JSON.stringify(safe));
  Object.values(safe).forEach((variants) => {
    (Array.isArray(variants) ? variants : [variants]).forEach((variant) => {
      (variant?.exercises || []).forEach((ex) => {
        delete ex.description_i18n;
        delete ex.recommendation_i18n;
        if (ex.description) ex.description = clampWeeklyText(ex.description, 320);
        if (ex.recommendation) ex.recommendation = clampWeeklyText(ex.recommendation, 240);
      });
    });
  });

  bytes = estimateJsonBytes(safe);
  if (bytes > PAC_WEEKLY_PLAN_SOFT_LIMIT_BYTES) {
    Object.values(safe).forEach((variants) => {
      (Array.isArray(variants) ? variants : [variants]).forEach((variant) => {
        (variant?.exercises || []).forEach((ex) => {
          delete ex.description;
          delete ex.recommendation;
          delete ex.whyReplaced;
          delete ex.injuryWarning;
        });
      });
    });
    bytes = estimateJsonBytes(safe);
  }

  return { planData: safe, bytes, compacted: true };
}

// кеш останнього planData, щоб не писати дубль
let __PAC_LAST_PLAN_JSON__ = null;
// ===============================
// PAC: Debug helpers (global)
// ===============================
(function attachPacDebugHelpers() {
  // якщо файл підключений як type="module", то "let __PAC_LAST_PLAN_JSON__" НЕ буде на window.
  // Тому робимо "single source of truth" через window.* і синхронізуємо.
  if (typeof window.__PAC_LAST_PLAN_JSON__ === "undefined") {
    window.__PAC_LAST_PLAN_JSON__ = __PAC_LAST_PLAN_JSON__;
  }

  // ✅ RESET: скидає кеш порівняння і таймер нотифікацій
  window.__PAC_RESET__ = function __PAC_RESET__() {
    __PAC_LAST_PLAN_JSON__ = null;
    window.__PAC_LAST_PLAN_JSON__ = null;

    __PAC_LAST_PLAN_NOTIFY_MS__ = 0;

  };

  // ✅ PRINT: показує ключову діагностику
  window.__PAC_PRINT__ = async function __PAC_PRINT__(withServer = false) {
    let ls = null;
    try {
      ls = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    } catch (e) {
      ls = { __error: String(e) };
    }

    const uiMicro = {};
    (__PAC_ACTIVITY_SELECTS__ || document.querySelectorAll('.activity-type-select')).forEach((sel, idx) => {
      uiMicro[`day${idx}`] = String(sel?.value || "").toUpperCase();
    });

    const out = {
      at: new Date().toISOString(),
      uid: String(currentUserId || window.currentUserId || auth.currentUser?.uid || ""),
      weekId: String(currentWeekId || window.currentWeekId || ""),
      storageKey: STORAGE_KEY,
      uiMicrocycle: uiMicro,
      localPlanKeys: (ls && typeof ls === "object" && !Array.isArray(ls)) ? Object.keys(ls).length : 0,
      lastSyncError: window.__pacMicrocycleSyncError || null
    };

    if (withServer && out.uid && out.weekId) {
      try {
        const snap = await db.collection("weekly_plans").doc(`${out.uid}_${out.weekId}`).get();
        if (!snap.exists) {
          out.server = { exists: false };
        } else {
          const data = snap.data() || {};
          out.server = {
            exists: true,
            microcycle: normalizeMicrocycleDays(data.microcycle || {}),
            microcycleMode: String(data.microcycleMode || ""),
            microcycleMatchCount: Number(data.microcycleMatchCount || 0),
            planKeys: (data.planData && typeof data.planData === "object" && !Array.isArray(data.planData))
              ? Object.keys(data.planData).length
              : 0,
            updatedAt: data.updatedAt || null
          };
        }
      } catch (e) {
        out.serverError = {
          code: String(e?.code || ""),
          message: String(e?.message || e || "")
        };
      }
    }

    console.log("PAC_PRINT", out);
    return out;
  };

  window.__PAC_MICRO_ROUNDTRIP__ = async function __PAC_MICRO_ROUNDTRIP__() {
    const before = await window.__PAC_PRINT__(true);
    await syncMicrocycleToFirebase();
    const after = await window.__PAC_PRINT__(true);
    const payload = { before, after };
    console.log("PAC_MICRO_ROUNDTRIP", payload);
    return payload;
  };

  // ✅ на всякий: синхронізуємо кеши, якщо ти міняєш window.__PAC_LAST_PLAN_JSON__ в консолі
  window.__PAC_SET_LAST__ = function(v) {
    __PAC_LAST_PLAN_JSON__ = v;
    window.__PAC_LAST_PLAN_JSON__ = v;
  };
})();

// таймштамп останнього PLAN_UPDATED notify (глобальний анти-спам 10s)
let __PAC_LAST_PLAN_NOTIFY_MS__ = 0;
async function safePlanWriteOnly() {
  if(window.pacPlanReadBlocked)return;
  if (!currentWeekId) {
  console.warn("⏭️ skip save: currentWeekId is not set");
  return;
}
  if (!currentUserId) return;
  if (!(window.canCoachEdit || window.isAdmin)) return;

  const rawPlanData = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  const safePlan = makeWeeklyPlanFirestoreSafe(rawPlanData);
  // Keep minted legacy IDs in the editor cache before any later rename/reorder.
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rawPlanData));
  const planData = safePlan.planData;
  const planJson = JSON.stringify(planData);

  // ✅ shallow compare — не пишемо якщо не змінилось
  if (planJson === __PAC_LAST_PLAN_JSON__) return;

  const ref = db.collection("weekly_plans").doc(`${currentUserId}_${currentWeekId}`);
  const writePayload = {
    userId: currentUserId,
    weekId: currentWeekId,
    planData,
    // state тут НЕ чіпаємо (щоб не ламати твою існуючу логіку state)
    lastCoachEditAt: firebase.firestore.FieldValue.serverTimestamp(),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  };

  try {
    await ref.update(writePayload);
  } catch (e) {
    if (String(e?.code || "").includes("not-found")) {
      await ref.set(writePayload, { merge: true });
    } else {
      throw e;
    }
  }

  __PAC_LAST_PLAN_JSON__ = planJson;
  window.__PAC_LAST_PLAN_JSON__ = planJson;
  window.__PAC_LAST_WEEKLY_PLAN_BYTES__ = safePlan.bytes;
  if (safePlan.bytes > PAC_WEEKLY_PLAN_SOFT_LIMIT_BYTES) {
    console.warn("PAC weekly plan is still close to Firestore document limit:", safePlan.bytes);
  }

}

async function safePlanUpdatedNotificationQuietCommit() {
  if (!currentWeekId) {
  console.warn("⏭️ skip notify: currentWeekId is not set");
  return;
}
  if (!currentUserId) return;
  if (!(window.canCoachEdit || window.isAdmin)) return;

  // ✅ глобальний анти-спам: максимум 1 раз / 10 сек
  const nowMs = Date.now();
  if (nowMs - __PAC_LAST_PLAN_NOTIFY_MS__ < 10000) return;
  __PAC_LAST_PLAN_NOTIFY_MS__ = nowMs;

  const notifId = `PLAN_UPDATED_${currentWeekId}`; // ✅ deterministic
  const notifRef = db.collection("users").doc(currentUserId)
    .collection("notifications").doc(notifId);

  // ✅ не створюємо новий, якщо вже є active unread по weekId
  const snap = await notifRef.get();
  if (snap.exists) {
    const d = snap.data() || {};
    if (d.readAt == null) {
      return; // уже є unread → нічого не робимо
    }
  }

  const batch = db.batch();

  batch.set(notifRef, {
    type: "PLAN_UPDATED",
    title: "План оновлено тренером",
    text: "Тренер завершив правки і оновив ваш план.",
    weekId: currentWeekId,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    readAt: null
  }, { merge: true });

  // unreadCount++ тільки якщо документ створюється заново як unread
  const metaRef = db.collection("users").doc(currentUserId)
    .collection("notifMeta").doc("main");

  batch.set(metaRef, {
    unreadCount: firebase.firestore.FieldValue.increment(1),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  }, { merge: true });

  await batch.commit();
}

// ✅ SAVE: 800ms debounce
const schedulePlanSave = pacDebounce(async () => {
  await safePlanWriteOnly();
  // кожен save перезапускає “таймер завершення правок”
  schedulePlanNotify();
}, 800);

// ✅ NOTIFY: quiet commit через 10s без змін
const schedulePlanNotify = pacDebounce(async () => {
  await safePlanUpdatedNotificationQuietCommit();
}, 10000);
let __PAC_FORCE_LAST_MS__ = 0;

window.__PAC_FORCE_SAVE__ = async function() {
  if (!(window.canCoachEdit || window.isAdmin)) return;

  const now = Date.now();
  if (now - __PAC_FORCE_LAST_MS__ < 3000) {
    return;
  }
  __PAC_FORCE_LAST_MS__ = now;

  __PAC_SET_LAST__(null);
  schedulePlanSave();
};


function updateCycleColors() {
  if(window.pacPlanReadBlocked)return;
  const activitySelects = (__PAC_ACTIVITY_SELECTS__ || document.querySelectorAll('.activity-type-select'));
  const dayCells = document.querySelectorAll('#md-colors-row .cycle-day');
  const dayNamesShort = getWeeklyDayShortNames();

  const activityTypes = Array.from(activitySelects).map(s => s.value);
  const computed = new Array(7).fill('TRAIN');

  const matchIndices = activityTypes
    .map((t, idx) => t === 'MATCH' ? idx : -1)
    .filter(i => i !== -1);

  for (let i = 0; i < 7; i++) {
    if (activityTypes[i] === 'MATCH') {
      computed[i] = 'MD';
      continue;
    }

    let minDiff = Infinity;
    let bestStatus = 'TRAIN';

    matchIndices.forEach(mIdx => {
      for (let offset of [-7, 0, 7]) {
        const diff = i - (mIdx + offset);
        const candidate = weeklyStatusByMatchDiff(diff);
        if (candidate) {
          if (Math.abs(diff) < Math.abs(minDiff)) {
            minDiff = diff;
            bestStatus = candidate;
          }
        }
      }
    });

    computed[i] = bestStatus;
  }

  // ✅ computed лишаємо окремо (може знадобитись)
  window.__computedStatusesForWeek = computed.slice();

  // ✅ ТУТ: робимо FINAL statuses
  const finalStatuses = new Array(7).fill("TRAIN");

  


  for (let idx = 0; idx < 7; idx++) {
    const isRest  = activityTypes[idx] === 'REST';
    const isMatch = activityTypes[idx] === 'MATCH';
    // ✅ НІЯКИХ override для дня. Статус тільки від microcycle + computed.
const finalStatus =
  isRest ? "REST" :
  isMatch ? "MD" :
  computed[idx];


    finalStatuses[idx] = finalStatus;

    // ---- UI (як у тебе) ----
    const style = COLOR_MAP[finalStatus] || COLOR_MAP['TRAIN'];

    const mdEl = dayCells[idx]?.querySelector('.md-status');
    if (mdEl) {
      mdEl.dataset.statusCode = finalStatus;
      mdEl.textContent = statusDisplayName(finalStatus);
      Object.values(COLOR_MAP).forEach(m => mdEl.classList.remove(m.colorClass));
      mdEl.classList.add(style.colorClass);

      mdEl.style.cursor = "pointer";
      mdEl.onclick = async () => {
        if (!(window.canCoachEdit || window.isAdmin)) {
          alert(wt("coachOnlyPlan"));
          return;
        }

        const coreState = await ensureWeeklyCoreForExpectedUser({ maxWaitMs: 2200 });
    if (!coreState.ok || !coreState.core) {
      console.warn("Blocked MD modal due to core mismatch", coreState);
      alert(wt("modalOpenBlocked"));
      return;
    }

        openSuggestedPlanModal({
          core: coreState.core,
          dayIndex: idx,
          dayStatus: finalStatus
        });
      };
    }

    const titleEl = document.getElementById(`md-title-${idx}`);
    if (titleEl) {
      titleEl.innerHTML =
        `<span class="md-status-label ${style.colorClass}">
          ${statusDisplayName(finalStatus)}
        </span> (${dayNamesShort[idx]})`;
    }
  }

  // ✅ ОЦЕ головне: фінальний список статусів тижня
  window.__finalStatusesForWeek = finalStatuses.slice();

  // ✅ create plans під ФІНАЛЬНІ статуси
  ensureStatusPlansExist(window.__finalStatusesForWeek);
  // ✅ режим мікроциклу (STANDARD/CUSTOM/OFFSEASON) — без spam
  const meta = calcMicrocycleMetaFromUI();
  renderMicrocycleModePill(meta);
  // ✅ рендер вже по finalStatuses
  for (let idx = 0; idx < 7; idx++) {
    renderExercisesByStatus(idx, finalStatuses[idx]);
  }
}


function getDayContainer(dayIndex) {
  // 1) твій поточний варіант
  let el = document.querySelector(`.task-day-container[data-day-index="${dayIndex}"]`);
  if (el) return el;

  // 2) fallback: якщо в тебе контейнери просто йдуть списком
  const all = document.querySelectorAll(".task-day-container");
  if (all && all[dayIndex]) return all[dayIndex];

  // 3) fallback: id-шки
  el = document.getElementById(`task-day-${dayIndex}`);
  if (el) return el;

  // 4) fallback: інколи роблять так: day-container-0 ...
  el = document.getElementById(`day-container-${dayIndex}`);
  if (el) return el;

  return null;
}

function resolvePlanForStatus(data, status) {
  const exactKey = `status_plan_${status}`;
  if (data?.[exactKey]) return { plan: data[exactKey], usedKey: status, existed: true };
  return { plan: { exercises: [] }, usedKey: status, existed: false };
}

function renderExercisesByStatus(dayIndex, status) {
  const container = getDayContainer(dayIndex);
  if (!container) return;

  // ✅ створює відсутні status_plan_* як порожні (без підміни показу іншим статусом)
  // ✅ statuses цього тижня (виставляється в updateCycleColors)
const weekStatuses = getWeekFinalStatuses();
const data = ensureStatusPlansExist(weekStatuses && weekStatuses.length ? weekStatuses : CANON_STATUSES);


const finalStatus = status;

// ✅ день REST — без вправ
if (finalStatus === "REST") {
  container.innerHTML =
    "<div style=\"text-align:center; padding:20px; color:#777;\">" + wt("restDay") + "</div>" +
    renderWeeklyNutritionForDay(dayIndex, finalStatus);
  return;
}

// ✅ variantIndex = яка поява цього статусу у тижні (0..n-1)
const occ = getStatusOccurrenceIndex(dayIndex, weekStatuses, finalStatus);

// ✅ беремо саме variant плану
let finalPlan = getPlanVariant(data, finalStatus, occ);

// якщо нема варіанту — порожній (БЕЗ fallback на інший статус)
if (!finalPlan) finalPlan = { exercises: [] };

// для debug тексту
const usedKey = finalStatus;
const existed = Boolean(getPlanVariant(data, finalStatus, occ));



  const exs = Array.isArray(finalPlan.exercises) ? finalPlan.exercises : [];

  let html = `
    <div style="font-size:11px; opacity:.7; margin-bottom:6px;">
      ${wt("statusLabel")}: <b>${statusDisplayName(finalStatus)}</b> • ${wt("keyLabel")}: <b>status_plan_${usedKey}</b>
      ${existed ? "" : ` • <span style='opacity:.7'>(${wt("createdEmpty")})</span>`}
      
    </div>
    <div class="generated-exercises-list">
  `;

  ["Pre-Training", "Main Training", "Post-Training"].forEach(stage => {
    const stageExs = exs.filter(ex => (ex.stage || "Main Training") === stage);

    html += `<div class="stage-label" style="font-size:0.7rem; color:#d4af37; margin-top:10px;">${stageDisplayName(stage)}</div>`;

    if (!stageExs.length) {
      html += `<div style="opacity:.6; font-size:.85rem; padding:6px 0;">—</div>`;
    } else {
      stageExs.forEach((ex, i) => {
        html += `
          <div class="exercise-row" style="display:flex; gap:8px; justify-content:space-between; align-items:center; padding:6px 0; border-bottom:1px solid #222;">
            <div style="font-size:.9rem;">${escapeHtml(resolveExerciseName(ex))}</div>
            ${(window.canCoachEdit || window.isAdmin) ? `
              <button class="gold-button btn-small" type="button"
                onclick="removeExerciseFromStatus(${dayIndex}, '${finalStatus}', '${stage}', ${i})">
                ✖
              </button>
            ` : ``}
          </div>
        `;
      });
    }

    // ✅ manual add йде в status_plan_${finalStatus}
    if (window.canCoachEdit || window.isAdmin) {
      html += `
        <button type="button" class="add-manual-btn"
          onclick="openExerciseModal(${dayIndex}, '${finalStatus}', '${stage}')"
          style="width:100%; border:1px dashed #444; background:none; color:#d4af37; padding:8px; margin-top:6px; border-radius:10px;">
          + ${wt("addToStage")} ${stageDisplayName(stage)}
        </button>
      `;
    }
  });

  html += `</div>${renderWeeklyNutritionForDay(dayIndex, finalStatus)}`;
  container.innerHTML = html;
}

function rerenderDayByIndex(dayIndex) {
  const dayCells = document.querySelectorAll('#md-colors-row .cycle-day');
  const stEl = dayCells?.[dayIndex]?.querySelector(".md-status");
  const st = stEl?.dataset?.statusCode || stEl?.textContent?.trim() || "TRAIN";
  renderExercisesByStatus(dayIndex, st);
}

document.addEventListener("click", (e) => {
  // 1) клік по елементу з data-day-index
  const byData = e.target.closest("[data-day-index]");
  if (byData) {
    const idx = Number(byData.getAttribute("data-day-index"));
    if (Number.isFinite(idx)) rerenderDayByIndex(idx);
  }

  // 2) клік по заголовку md-title-0..6
  const byTitle = e.target.closest('[id^="md-title-"]');
  if (byTitle) {
    const idx = Number(byTitle.id.replace("md-title-", ""));
    if (Number.isFinite(idx)) rerenderDayByIndex(idx);
  }

  // 3) клік по клітинці циклу (якщо там є data-day-index всередині)
  const byCycle = e.target.closest("#md-colors-row .cycle-day");
  if (byCycle && byCycle.dataset && byCycle.dataset.dayIndex != null) {
    const idx = Number(byCycle.dataset.dayIndex);
    if (Number.isFinite(idx)) rerenderDayByIndex(idx);
  }
});

function modalZoneLabel(zoneKey) {
  const raw = String(zoneKey || "").replace(/_/g, " ").trim();
  if (!raw) return "";
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function formatExerciseZonesCompact(ex) {
  const primary = Array.isArray(ex?.primaryZones) ? ex.primaryZones.filter(Boolean) : [];
  const secondary = Array.isArray(ex?.secondaryZones) ? ex.secondaryZones.filter(Boolean) : [];
  if (!primary.length && !secondary.length) return "";
  const parts = [];
  if (primary.length) parts.push(`P: ${primary.map(modalZoneLabel).join(", ")}`);
  if (secondary.length) parts.push(`S: ${secondary.map(modalZoneLabel).join(", ")}`);
  return parts.join(" • ");
}

window.openExerciseModal = function(dayIndex, status, stage) {
  window.currentAddDayIndex = dayIndex;
  window.currentAddStatus = status;
  window.currentAddStage = stage;

  const weekStatuses = getWeekFinalStatuses();
window.currentAddVariantIndex = getStatusOccurrenceIndex(dayIndex, weekStatuses, status);



  const modal = document.getElementById('exercise-selection-modal');
  const list = document.getElementById('exercise-list-container');
  if (!modal || !list) return;

  list.innerHTML = '';
  const LIB = getLib();
  const stageData = LIB?.[stage];


  if (stageData) {
    for (const categoryName in stageData) {
      const category = stageData[categoryName];

      const catHeader = document.createElement('div');
      catHeader.className = "modal-category-header";
      catHeader.textContent = categoryName;
      list.appendChild(catHeader);

      const exercises = Array.isArray(category?.exercises) ? category.exercises : [];
      if (!exercises.length && categoryName === "Football Tactical Drills") {
        const empty = document.createElement('div');
        empty.className = "modal-exercise-item";
        empty.innerHTML = `<div class="modal-exercise-meta"><span class="modal-exercise-name">No tactical drills imported yet</span><span class="modal-exercise-zones">Import the exported Drill Canvas JSON, then select it here.</span></div><button type="button" class="gold-button modal-exercise-add-btn" data-pac-import-drill-json>Import JSON</button>`;
        list.appendChild(empty);
      }

      exercises.forEach(ex => {
        const item = document.createElement('div');
        item.className = "modal-exercise-item";

        const meta = document.createElement('div');
        meta.className = "modal-exercise-meta";

        const nameSpan = document.createElement('span');
        nameSpan.className = "modal-exercise-name";
        nameSpan.textContent = resolveExerciseName(ex);
        meta.appendChild(nameSpan);

        const zonesTxt = formatExerciseZonesCompact(ex);
        if (zonesTxt) {
          const zonesSpan = document.createElement('span');
          zonesSpan.className = "modal-exercise-zones";
          zonesSpan.textContent = zonesTxt;
          meta.appendChild(zonesSpan);
        }

        const btn = document.createElement('button');
        btn.type = "button";
        btn.className = "gold-button modal-exercise-add-btn";
        btn.textContent = wt("addSelected");
        btn.title = wt("addSelected");

        btn.addEventListener('click', () => {
          addExerciseToStatus(btn, ex.name, stage, categoryName);
        });

        item.appendChild(meta);
        item.appendChild(btn);
        list.appendChild(item);
      });
    }
  }

  modal.style.display = 'flex';
};

window.addEventListener("pac:drill-library-updated", () => {
  const modal = document.getElementById('exercise-selection-modal');
  if (modal?.style?.display === 'flex' && Number.isFinite(Number(window.currentAddDayIndex)) && window.currentAddStatus && window.currentAddStage) {
    openExerciseModal(Number(window.currentAddDayIndex), window.currentAddStatus, window.currentAddStage);
  }
});

window.addExerciseToStatus = function(btn, name, stage, category) {
  if (!(window.canCoachEdit || window.isAdmin)) {
    alert(wt("coachOnlyPlan"));
    return;
  }

  const status = window.currentAddStatus;
  const dayIndex = Number(window.currentAddDayIndex);
  const variantIndex = Number(window.currentAddVariantIndex) || 0;

  const LIB = getLib();
const exTemplate = LIB?.[stage]?.[category]?.exercises?.find(e => e.name === name);

  if (!exTemplate) return;

  const data = ensureStatusPlansExist(getWeekFinalStatuses());

  const key = `status_plan_${status}`;

  // ensure array
  if (!data[key]) data[key] = [];
  if (data[key] && !Array.isArray(data[key])) data[key] = [data[key]];
  while (data[key].length <= variantIndex) data[key].push({ exercises: [] });

  const plan = data[key][variantIndex];
  plan.exercises = Array.isArray(plan.exercises) ? plan.exercises : [];
  const i18n = buildExerciseI18nMapFromRaw(exTemplate.name, exTemplate.description);
  plan.exercises.push({
  ...exTemplate,
  planItemId: window.PACExerciseTask.newItemId(),
  ...i18n,
  stage,
  category,
  bodyGroup: String(exTemplate?.bodyGroup || category || "").toLowerCase().trim()
});


  localStorage.setItem(STORAGE_KEY, JSON.stringify(window.PACExerciseTask.ensurePlan(data)));

  updateCycleColors();
schedulePlanSave();

  btn.textContent = "✔";
  btn.disabled = true;
};

window.removeExerciseFromStatus = function(dayIndex, status, stage, stageIndex) {
  if (!(window.canCoachEdit || window.isAdmin)) {
    alert(wt("coachOnlyChange"));
    return;
  }

  const weekStatuses = getWeekFinalStatuses();
  const variantIndex = getStatusOccurrenceIndex(dayIndex, weekStatuses, status);

  const data = ensureStatusPlansExist(weekStatuses);
  const key = `status_plan_${status}`;

  let plan = getPlanVariant(data, status, variantIndex);
  if (!plan) plan = { exercises: [] };

  const exs = Array.isArray(plan.exercises) ? plan.exercises : [];

  const stageItems = exs
    .map((e, idx) => ({ e, idx }))
    .filter(x => (x.e.stage || "Main Training") === stage);

  const target = stageItems[stageIndex];
  if (!target) return;

  exs.splice(target.idx, 1);

  // запис назад у потрібний варіант
  if (!data[key]) data[key] = [];
  if (data[key] && !Array.isArray(data[key])) data[key] = [data[key]];
  while (data[key].length <= variantIndex) data[key].push({ exercises: [] });

  data[key][variantIndex] = { ...plan, exercises: exs };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(window.PACExerciseTask.ensurePlan(data)));

  updateCycleColors();
schedulePlanSave();
};

function closeExerciseModal() {
    const modal = document.getElementById('exercise-selection-modal');
    if (modal) modal.style.display = 'none';
}


function initWeeklyIndividualUI() {
  __PAC_ACTIVITY_SELECTS__ = document.querySelectorAll('.activity-type-select');
  applyWeeklyStaticTranslations();
  const closeX = document.querySelector('.close-modal-btn');
  if (closeX) closeX.onclick = closeExerciseModal;

  document.querySelectorAll('.activity-type-select').forEach(sel => {
    // щоб не навішати 2 рази, якщо init викличеться повторно
    if (sel.__pacBound) return;
    sel.__pacBound = true;

    sel.addEventListener('change', async () => {
  updateCycleColors();
  await syncMicrocycleToFirebase();   // зберегти одразу UI/state
  scheduleFinalizeMicrocycle({ delayMs: 20000 }); // 1 фінальна нотифікація після паузи
});
  });
}


if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initWeeklyIndividualUI, { once: true });
} else {
  initWeeklyIndividualUI();
}

document.addEventListener("athletecore:ready", (e) => {
  const { userId, weekId, core, signals } = e.detail;

  const qUserId = new URLSearchParams(window.location.search).get("userId");
  const expectedUserId = String(currentUserId || window.currentUserId || qUserId || "");

  // Ignore stale payloads from a different user (including early startup races).
  if (expectedUserId && userId && String(userId) !== expectedUserId) {
    console.warn("Ignoring athletecore:ready for different user", { expected: expectedUserId, got: userId, weekId });
    return;
  }

  window.__athleteCore = core;
  window.__athleteSignals = signals;
  window.__athleteCoreUserId = String(userId || signals?.userId || signals?.uid || "");
  window.__athleteCoreLoadedAt = Date.now();
  window.__weeklyCoreMismatch = !hasWeeklyCoreForExpectedUser();
  window.__weeklyCoreMismatchInfo = {
    expectedUid: expectedWeeklyCoreUserId(),
    resolvedUid: window.__athleteCoreUserId,
    checkedAtMs: Date.now(),
    reason: window.__weeklyCoreMismatch ? "event_mismatch" : "event_match"
  };
  const sportFromCore =
    core?.profile?.sportType ||
    core?.profile?.sport ||
    core?.athlete?.sportType ||
    core?.athlete?.sport ||
    core?.sportType ||
    core?.sport ||
    "";
  if (sportFromCore && !String(window.__weeklySportType || "").trim()) {
    setWeeklySportContext(sportFromCore);
  }
  renderWeeklyAthleteContextLine(expectedUserId || userId).catch(() => null);
  
  
});

function renderInjurySummaryCard(inj) {
  if (!inj) {
    return `
      <div class="sa-card" style="border:1px solid #2a2a2a; padding:12px; border-radius:10px; margin:10px 0;">
        <div style="font-weight:700; margin-bottom:6px;">${escapeHtml(wt("modalInjury"))}</div>
        <div style="opacity:.8;">—</div>
      </div>
    `;
  }

  const pain = Number(inj.pain ?? 0) || 0;
  const loc  = escapeHtml(inj.location || "—");
  const dt   = escapeHtml(inj.date || (inj.history?.length ? inj.history[inj.history.length - 1].date : "—"));

  // легкий статус без “паніки”
  const status =
    pain >= 7 ? wt("modalSeverityHigh") :
    pain >= 4 ? wt("modalSeverityModerate") :
    pain >= 1 ? wt("modalSeverityLowMonitor") :
    wt("modalSeverityOk");

  return `
    <div class="sa-card" style="border:1px solid #2a2a2a; padding:12px; border-radius:10px; margin:10px 0;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
        <div style="font-weight:700;">${escapeHtml(wt("modalInjuryControl"))}</div>
        <div style="font-size:12px; opacity:.8;">${escapeHtml(status)}</div>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px 12px; font-size:14px;">
        <div><b>${escapeHtml(wt("modalLocation"))}:</b> ${loc}</div>
        <div><b>${escapeHtml(wt("modalPain"))}:</b> ${pain}/10</div>
        <div><b>${escapeHtml(wt("modalLastUpdate"))}:</b> ${dt}</div>
        <div><b>${escapeHtml(wt("modalCoords"))}:</b> ${inj.coordX ?? "—"} / ${inj.coordY ?? "—"}</div>
      </div>
    </div>
  `;
}

function getACWRFromSignals(core, signals) {
  const v =
    core?.breakdown?.acwr ??
    core?.breakdown?.load?.acwr ??
    core?.acwr ??                // (інколи так)
    signals?.load?.acwr ??
    signals?.load?.ACWR ??
    signals?.load?.ratio ??
    null;

  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}


function getACWRFromAnywhere(core, signals) {
  const v =
    core?.breakdown?.load?.acwr ??
    core?.breakdown?.acwr ??
    core?.acwr ??
    signals?.load?.acwr ??
    signals?.load?.ACWR ??
    signals?.load?.ratio ??
    null;

  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}


function getBodyMassFromSignals(signals) {
  const w = signals?.weight;
  if (!w) return null;

  // пробуємо різні поля, щоб не залежати від схеми
  const kg =
    Number(w.weight ?? w.kg ?? w.bodyMass ?? w.value ?? w.mass ?? NaN);

  if (!Number.isFinite(kg)) return null;

  const date =
    w.date ||
    (w.timestamp?.toDate ? w.timestamp.toDate().toISOString().slice(0,10) : null) ||
    w.timestamp ||
    null;

  return { kg, date, raw: w };
}

function classifyWeightMode(currKg, prevKg) {
  if (!Number.isFinite(currKg) || !Number.isFinite(prevKg)) return { mode: "UNKNOWN", delta: null };

  const delta = currKg - prevKg; // + = набрав, - = скинув
  const abs = Math.abs(delta);

  // поріг щоб не реагувати на воду/похибку ваг
  if (abs < 0.3) return { mode: "MAINTAIN", delta };

  if (delta <= -0.3) return { mode: "CUT", delta };
  return { mode: "GAIN", delta };
}

function renderBodyMassCard(curr, prev) {
  if (!curr) {
    return `
      <div class="sa-card" style="border:1px solid #2a2a2a; padding:12px; border-radius:10px; margin:10px 0;">
        <div style="font-weight:700;">Body Mass Control</div>
        <div style="opacity:.8; margin-top:6px;">—</div>
      </div>
    `;
  }

  const currKg = curr.kg;
  const prevKg = prev?.kg;

  const { mode, delta } = classifyWeightMode(currKg, prevKg);

  const label =
    mode === "CUT" ? "CUTTING (скидає вагу)" :
    mode === "GAIN" ? "GAINING (набирає вагу)" :
    mode === "MAINTAIN" ? "MAINTAIN (тримає вагу)" :
    "UNKNOWN";

  const deltaTxt =
    (delta == null || !Number.isFinite(delta)) ? "" :
    ` • Δ ${delta > 0 ? "+" : ""}${delta.toFixed(1)} кг`;

  return `
    <div class="sa-card" style="border:1px solid #2a2a2a; padding:12px; border-radius:10px; margin:10px 0;">
      <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
        <div style="font-weight:700;">⚖️ Body Mass</div>
        <div style="font-size:12px; opacity:.8;">${label}</div>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px 12px; font-size:14px;">
        <div><b>Current:</b> ${currKg.toFixed(1)} кг</div>
        <div><b>Date:</b> ${curr.date || "—"}</div>
        <div><b>Previous:</b> ${Number.isFinite(prevKg) ? prevKg.toFixed(1) + " кг" : "—"}</div>
        <div><b>Change:</b> ${deltaTxt ? deltaTxt.replace(" • ", "") : "—"}</div>
      </div>
    </div>
  `;
}

function renderBodyMassCardV2(curr, prev, meta) {
  const hasCurr = Number.isFinite(curr?.kg);
  const hasPrev = Number.isFinite(prev?.kg);

  const goal =
    curr?.goalMode === "WEIGHT LOSS" ? wt("modalGoalWeightLoss") :
    curr?.goalMode === "MUSCLE GAIN" ? wt("modalGoalMuscleGain") :
    curr?.goalMode === "ATHLETIC FORM" ? wt("modalGoalAthletic") :
    (curr?.goalMode ? `${wt("modalGoalUnknown").replace("—", "").trim()} ${curr.goalMode}` : wt("modalGoalUnknown"));

  const trend =
    meta?.trendMode === "CUT" ? wt("modalTrendCut") :
    meta?.trendMode === "GAIN" ? wt("modalTrendGain") :
    meta?.trendMode === "MAINTAIN" ? wt("modalTrendMaintain") :
    wt("modalTrendUnknown");

  const deltaTxt =
    (meta?.delta == null || !Number.isFinite(meta.delta)) ? "—" :
    `${meta.delta > 0 ? "+" : ""}${meta.delta.toFixed(1)} кг`;

  return `
    <div class="sa-card" style="border:1px solid #2a2a2a; padding:12px; border-radius:10px; margin:10px 0;">
      <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
        <div style="font-weight:700;">${escapeHtml(wt("modalBodyMass"))}</div>
        <div style="font-size:12px; opacity:.85;">${trend}</div>
      </div>

      <div style="font-size:13px; opacity:.9; margin-bottom:8px;">${goal}</div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px 12px; font-size:14px;">
        <div><b>${escapeHtml(wt("modalCurrent"))}:</b> ${hasCurr ? curr.kg.toFixed(1) + " кг" : "—"}</div>
        <div><b>${escapeHtml(wt("modalDate"))}:</b> ${escapeHtml(curr?.date || "—")}</div>
        <div><b>${escapeHtml(wt("modalPrevious"))}:</b> ${hasPrev ? prev.kg.toFixed(1) + " кг" : "—"}</div>
        <div><b>${escapeHtml(wt("modalChange"))}:</b> ${deltaTxt}</div>
      </div>
    </div>
  `;
}

function renderLoadSummaryCard(acwr, core, signals) {
  if (acwr == null) return "";

  const phase = getSeasonPhase(core, signals);
  const zone = SEASON_LOAD_ZONES[phase];

  let status = wt("modalLoadStatusOk");
  let note = wt("modalLoadNoteOk");
  if (zone) {
    if (acwr > zone.max) {
      status = wt("modalLoadStatusHigh");
      note = wt("modalLoadNoteHigh");
    } else if (acwr < zone.min) {
      status = wt("modalLoadStatusLow");
      note = wt("modalLoadNoteLow");
    }
  }

  const zoneTxt = zone ? `${zone.min.toFixed(2)}–${zone.max.toFixed(2)}` : "—";

  return `
    <div class="sa-card" style="border:1px solid #2a2a2a; padding:12px; border-radius:10px; margin:10px 0;">
      <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
        <div style="font-weight:700;">${escapeHtml(wt("modalLoadControl"))}</div>
        <div style="font-size:12px; opacity:.8;">${status}</div>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px 12px; font-size:14px;">
        <div><b>ACWR:</b> ${acwr.toFixed(2)}</div>
        <div><b>${escapeHtml(wt("modalSeason"))}:</b> ${phase}</div>
        <div><b>${escapeHtml(wt("modalZone"))}:</b> ${zoneTxt}</div>
        <div><b>${escapeHtml(wt("statusLabel"))}:</b> ${status}</div>
      </div>

      <div style="font-size:13px; opacity:.9; margin-top:8px; line-height:1.35;">
        <b>${escapeHtml(wt("modalNote"))}:</b> ${note}
      </div>
    </div>
  `;
}

function getWellnessScores(w) {
  // повертає об'єкт з полями sleep/ready/stress/soreness у шкалі 0..10
  if (!w) return null;

  const s = (w && typeof w === "object" && w.scores && typeof w.scores === "object")
    ? w.scores
    : w; // fallback якщо прийшло без .scores

  const sleep    = Number(s.sleep ?? w.sleep ?? w.sleepQuality ?? w.sleep_quality ?? NaN);
  const ready    = Number(s.ready ?? s.readiness ?? w.ready ?? w.readiness ?? NaN);
  const stress   = Number(s.stress ?? w.stress ?? NaN);
  const soreness = Number(s.soreness ?? w.soreness ?? w.sore ?? NaN);

  const out = { sleep, ready, stress, soreness };

  // залишаємо тільки валідні
  for (const k of Object.keys(out)) {
    if (!Number.isFinite(out[k])) out[k] = null;
    else out[k] = Math.max(0, Math.min(10, out[k])); // clamp 0..10
  }

  // якщо нічого нема — null
  if ([out.sleep,out.ready,out.stress,out.soreness].every(v => v == null)) return null;

  return out;
}

function computeCNSScore(w) {
  const s = getWellnessScores(w);
  if (!s) return { score: null, label: "—", details: null };

  // Переводимо 0..10 -> 0..100 (і інвертуємо stress/soreness)
  const sleepPct    = (s.sleep    == null) ? null : s.sleep * 10;
  const readyPct    = (s.ready    == null) ? null : s.ready * 10;
  const stressPct   = (s.stress   == null) ? null : 100 - s.stress * 10;
  const sorenessPct = (s.soreness == null) ? null : 100 - s.soreness * 10;

  // Ваги (можеш потім тюнити, але це стабільна база)
  const parts = [
    { key: "sleep",    val: sleepPct,    w: 0.30 },
    { key: "ready",    val: readyPct,    w: 0.30 },
    { key: "stress",   val: stressPct,   w: 0.25 },
    { key: "soreness", val: sorenessPct, w: 0.15 },
  ].filter(x => Number.isFinite(x.val));

  if (!parts.length) return { score: null, label: "—", details: null };

  // якщо якихось полів нема — нормалізуємо ваги на суму наявних
  const wSum = parts.reduce((a,b)=>a+b.w, 0);
  const scoreRaw = parts.reduce((a,p)=> a + p.val * (p.w / wSum), 0);
  const score = Math.round(scoreRaw);

  const label =
    score >= 80 ? "HIGH" :
    score >= 60 ? "MODERATE" :
    "LOW";

  return {
    score,
    label,
    details: { sleepPct, readyPct, stressPct, sorenessPct }
  };
}


function getSectionSeverity(section, core, signals) {
  const traffic = String(core?.traffic || "green"); // green/yellow/red
  const mode = String(core?.mode || "TRAIN");

  const inj = signals?.injury || null;
  const pain = Number(inj?.pain ?? 0) || 0;

  const wellness = signals?.wellness || null;
  const cns = computeCNSScore(wellness);
  const cnsScore = Number(cns?.score);

  const acwr = getACWRFromAnywhere(window.__athleteCore, window.__athleteSignals);


  // default
  let level = "ok"; // ok | warn | bad

  if (section === "injury") {
    if (pain >= 7) level = "bad";
    else if (pain >= 4) level = "warn";
    else level = "ok";
  }

  if (section === "wellness") {
    if (Number.isFinite(cnsScore)) {
      if (cnsScore < 60) level = "bad";
      else if (cnsScore < 80) level = "warn";
      else level = "ok";
    }
  }

  


  if (section === "bodymass") {
    // дуже легкий тригер: якщо trend = CUT + traffic not green -> warn (можеш під себе змінити)
    const wr = signals?.weightRecent || [];
    const sorted = wr.slice().sort((a,b)=> (String(a.date||"") > String(b.date||"") ? 1 : -1));
    const currW = sorted.length ? sorted[sorted.length - 1] : signals?.weight;
    const prevW = sorted.length >= 2 ? sorted[sorted.length - 2] : null;
    const currKg = Number(currW?.weight ?? currW?.kg ?? currW?.bodyMass ?? currW?.value ?? NaN);
    const prevKg = Number(prevW?.weight ?? prevW?.kg ?? prevW?.bodyMass ?? prevW?.value ?? NaN);

    let trend = "UNKNOWN";
    if (Number.isFinite(currKg) && Number.isFinite(prevKg)) {
      const d = currKg - prevKg;
      if (Math.abs(d) < 0.3) trend = "MAINTAIN";
      else if (d < -0.3) trend = "CUT";
      else trend = "GAIN";
    }

    if (trend === "CUT" && traffic !== "green") level = "warn";
    else level = "ok";
  }
   if (section === "load") {
    return getSeasonLoadSeverity(core, signals);
  }

  if (section === "power") {
    const traffic = String(core?.traffic || "green");
    let lvl = "ok";
    if (traffic === "red") lvl = "bad";
    else if (traffic === "yellow") lvl = "warn";

    const mode = String(core?.mode || "");
    if (mode === "REST" || mode === "REHAB" || mode === "LIGHT") {
      lvl = (lvl === "bad") ? "bad" : "warn";
    }
    return lvl;
  }

  return level;


  
}
function getOverallSeverity(core, signals) {
  const sections = ["injury","wellness","load","bodymass","power"];

  let hasWarn = false;

  for (const k of sections) {
    const s = getSectionSeverity(k, core, signals);
    if (s === "bad") return "bad";
    if (s === "warn") hasWarn = true;
  }

  return hasWarn ? "warn" : "ok";
}

function wrapWithGlow(sectionKey, innerHTML, core, signals) {
  const sev = getSectionSeverity(sectionKey, core, signals); // ok/warn/bad

  const border =
    sev === "bad"  ? "1px solid rgba(255,90,90,0.50)" :
    sev === "warn" ? "1px solid rgba(255,200,90,0.40)" :
                     "1px solid rgba(255,255,255,0.12)";

  const glow =
    sev === "bad"  ? "0 0 0 2px rgba(255,90,90,0.18), 0 10px 30px rgba(255,90,90,0.08)" :
    sev === "warn" ? "0 0 0 2px rgba(255,200,90,0.14), 0 10px 30px rgba(255,200,90,0.06)" :
                     "none";

  return `
    <div data-severity="${sev}" style="
      border:${border};
      box-shadow:${glow};
      border-radius:12px;
      overflow:hidden;
    ">
      ${innerHTML}
    </div>
  `;
}

function renderWellnessSummaryCard(wellness) {
  const s = getWellnessScores(wellness);
  if (!s) return "";

  const cns = computeCNSScore(wellness);

  return `
    <div class="sa-card" style="border:1px solid #2a2a2a; padding:12px; border-radius:10px; margin:10px 0;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
        <div style="font-weight:700;">${escapeHtml(wt("modalWellnessCnsControl"))}</div>
        <div style="font-size:12px; opacity:.8;">
          ${cns.score != null ? `${cns.score}/100 • ${cns.label}` : "—"}
        </div>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px 12px; font-size:14px;">
        <div><b>${escapeHtml(wt("modalSleep"))}:</b> ${s.sleep ?? "—"}</div>
        <div><b>${escapeHtml(wt("modalStress"))}:</b> ${s.stress ?? "—"}</div>
        <div><b>${escapeHtml(wt("modalSoreness"))}:</b> ${s.soreness ?? "—"}</div>
        <div><b>${escapeHtml(wt("modalReadiness"))}:</b> ${s.ready ?? "—"}</div>
      </div>

      <div style="margin-top:8px; font-size:12px; opacity:.85;">
        ${cns.score == null ? "" : escapeHtml(wt("modalCnsFormula"))}
      </div>
    </div>
  `;
}

function renderPowerPlaceholderCard() {
  return `
    <div class="sa-card" style="border:1px solid #2a2a2a; padding:12px; border-radius:10px; margin:10px 0;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
        <div style="font-weight:700;">${escapeHtml(wt("modalPowerControl"))}</div>
        <div style="font-size:12px; opacity:.7;">${escapeHtml(wt("modalComingSoon"))}</div>
      </div>
      <div style="opacity:.85; font-size:13px; line-height:1.35;">
        ${escapeHtml(wt("modalPowerComingSoonBody"))}
      </div>
    </div>
  `;
}

function buildVerdict(core) {
  const traffic = core?.traffic || "green";
  const mode = core?.mode || "TRAIN";
  const pill = `${traffic.toUpperCase()} • ${mode}`;

  let text = wt("modalVerdictDefault");
  if (mode === "REST") text = wt("modalVerdictRest");
  else if (mode === "REHAB") text = wt("modalVerdictRehab");
  else if (mode === "LIGHT") text = wt("modalVerdictLight");
  else if (mode === "MD-1") text = wt("modalVerdictMd1");

  return { pill, text };
}
function normalizeStatusToPlanKey(st) {
  if (st === "REST") return "REST";
  if (st === "MD") return "MD";
  if (st === "LIGHT") return "LIGHT";
  if (st === "REHAB") return "REHAB";
  if (String(st).startsWith("MD")) return "TRAIN"; // MD-2/MD+1 -> TRAIN база
  return "TRAIN";
}
function getWeekFinalStatuses() {
  return window.__finalStatusesForWeek
    || window.__computedStatusesForWeek
    || [];
}
function calcMicrocycleMetaFromUI() {
  const sels = Array.from(document.querySelectorAll('.activity-type-select'));
  const types = sels.map(s => String(s.value || "TRAIN").toUpperCase());
  const profile = getWeeklySportProfile();

  const matchDays = [];
  for (let i = 0; i < types.length; i++) {
    if (types[i] === "MATCH") matchDays.push(i);
  }

  const matchCount = matchDays.length;

  // 0 матчів = міжсезон / оффсезон
  if (matchCount === 0) {
    return { mode: "OFFSEASON", matchCount, matchDays };
  }

  if (profile === "INDIVIDUAL_ENDURANCE") {
    // Для індивідуальних видів 1 подія/контрольний старт = стандарт.
    if (matchCount === 1) return { mode: "STANDARD", matchCount, matchDays };
    return { mode: "CUSTOM", matchCount, matchDays };
  }

  // TEAM/COURT: 1 матч у суботу/неділю = стандартний мікроцикл
  if (matchCount === 1 && (matchDays[0] === 5 || matchDays[0] === 6)) {
    return { mode: "STANDARD", matchCount, matchDays };
  }

  // TEAM/COURT: 1 матч у будній день або 2+ матчі = нестандартний
  return { mode: "CUSTOM", matchCount, matchDays };
}

function microcycleModeLabel(mode) {
  const l = weeklyLang();
  const map = {
    STANDARD: {
      uk: "Стандартний мікроцикл",
      en: "Standard microcycle",
      de: "Standard-Mikrozyklus",
      es: "Microciclo estándar",
      ru: "Стандартный микроцикл",
      pt: "Microciclo padrão"
    },
    CUSTOM: {
      uk: "Кастомний мікроцикл",
      en: "Custom microcycle",
      de: "Individueller Mikrozyklus",
      es: "Microciclo personalizado",
      ru: "Кастомный микроцикл",
      pt: "Microciclo personalizado"
    },
    OFFSEASON: {
      uk: "Міжсезоння (матч не вибрано)",
      en: "Offseason (no match selected)",
      de: "Offseason (kein Spiel gewählt)",
      es: "Pretemporada (sin partido seleccionado)",
      ru: "Межсезонье (матч не выбран)",
      pt: "Offseason (sem jogo selecionado)"
    }
  };
  return map[mode]?.[l] || map[mode]?.en || "—";
}

function renderMicrocycleModePill(meta) {
  // якщо у тебе нема елемента — нічого не ламаємо
  const el = document.getElementById("microcycle-mode-pill");
  if (!el) return;

  const mode = meta?.mode || "—";
  const txt = microcycleModeLabel(mode);

  el.textContent = txt;

  // мінімальний стиль (без залежності від css)
  el.style.display = "inline-flex";
  el.style.alignItems = "center";
  el.style.gap = "6px";
  el.style.padding = "6px 10px";
  el.style.borderRadius = "999px";
  el.style.fontWeight = "900";
  el.style.fontSize = "12px";
  el.style.border = "1px solid rgba(255,255,255,0.18)";
  el.style.background =
    mode === "CUSTOM" ? "rgba(255,200,90,0.10)" :
    mode === "STANDARD" ? "rgba(90,200,120,0.10)" :
    "rgba(255,255,255,0.06)";
}
function groupByStage(exercises = []) {
  const out = { "Pre-Training": [], "Main Training": [], "Post-Training": [] };
  exercises.forEach((e) => {
    const st = e.stage || "Main Training";
    if (!out[st]) out[st] = [];
    out[st].push(e);
  });
  return out;
}

function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalizeQuality(q) {
  const s = String(q || "").toLowerCase().trim();
  if (!s) return null;
  if (s === "pow" || s === "explosive") return "power";
  if (s === "str" || s === "strength") return "strength";
  if (s === "end" || s === "conditioning" || s === "aerobic") return "endurance";
  return s;
}

function uniqueOrderedStrings(list = []) {
  const out = [];
  (Array.isArray(list) ? list : []).forEach((v) => {
    const s = String(v || "").trim();
    if (!s) return;
    if (!out.includes(s)) out.push(s);
  });
  return out;
}

function mapPriorityGoalToQualities(goalRaw) {
  const g = String(goalRaw || "").toLowerCase();
  const out = [];
  const add = (...vals) => {
    vals.forEach((x) => {
      const n = normalizeQuality(x);
      if (!n) return;
      if (!out.includes(n)) out.push(n);
    });
  };

  if (/strength|сил|kraft|fuerza|forca|força|force/.test(g)) {
    add("strength", "heavy", "isometric_activation");
  }
  if (/\bpower\b|vertical power|throw power|potencia|potência|explosive|jump|потуж|мощ/.test(g)) {
    add("power", "reaction", "readiness", "power_test");
  }
  if (/speed|agility|quick|sprint|footwork|veloc|скорост|швид/.test(g)) {
    add("speed", "coordination", "reaction", "neural");
  }
  if (/endurance|stamina|conditioning|aerobic|speed endurance|витрив|выносл|resisten|ausdauer/.test(g)) {
    add("endurance", "speed_endurance", "extensive_aerobic", "aerobic_low", "aerobic_flush", "locomotor_volume");
  }
  if (/recovery|injury prevention|return after injury|rehab|віднов|реаб|восстанов|recuper/.test(g)) {
    add("recovery", "rehab", "mobility", "injury_prevention", "tissue", "aerobic_low", "aerobic_flush");
  }
  if (/match readiness|decision making|contact readiness|readiness|готов/.test(g)) {
    add("readiness", "reaction", "coordination", "power_test", "speed");
  }

  return out;
}

function getGoalPriorityContext(signals = null, core = window.__athleteCore) {
  const goalsProfile = Array.isArray(signals?.profile?.goals) ? signals.profile.goals : [];
  const goalsSignals = Array.isArray(signals?.goals) ? signals.goals : [];
  const goalsCore = Array.isArray(core?.breakdown?.focus?.goals) ? core.breakdown.focus.goals : [];
  const goals = uniqueOrderedStrings([...goalsProfile, ...goalsSignals, ...goalsCore]);

  const weights = {};
  goals.forEach((goal, idx) => {
    const w = idx === 0 ? 5 : idx === 1 ? 3 : idx === 2 ? 2 : 1;
    mapPriorityGoalToQualities(goal).forEach((q) => {
      weights[q] = (weights[q] || 0) + w;
    });
  });

  const qualityOrder = Object.entries(weights)
    .sort((a, b) => b[1] - a[1])
    .map(([q]) => q);

  return { goals, weights, qualityOrder };
}

function priorityQualityBonus(candidateQualities, priorityCtx, dayStatus, coreMode, cons) {
  if (!priorityCtx || !priorityCtx.weights) return 0;
  if (dayStatus === "MD" || coreMode === "REST") return 0;

  const c = Array.isArray(candidateQualities) ? candidateQualities.map(normalizeQuality).filter(Boolean) : [];
  if (!c.length) return 0;
  const cSet = new Set(c);

  let score = 0;
  for (const [quality, weight] of Object.entries(priorityCtx.weights)) {
    if (!cSet.has(quality)) continue;

    if (cons?.cnsLow && (quality === "power" || quality === "speed" || quality === "heavy")) continue;
    if ((cons?.acwrSpike || cons?.acwrHigh) && quality === "endurance") continue;
    if ((coreMode === "LIGHT" || coreMode === "REHAB") && (quality === "heavy" || quality === "power")) continue;
    if ((dayStatus === "MD+1" || dayStatus === "MD+2") && (quality === "heavy" || quality === "power")) continue;

    score += Number(weight) || 0;
  }

  if (coreMode === "LIGHT" || coreMode === "REHAB") score *= 0.75;
  if (dayStatus === "MD+1" || dayStatus === "MD+2") score *= 0.8;

  return Math.min(8, Math.round(score));
}

function renderQualityBadgesHTML(qualities) {
  const allowed = new Set(["power","strength","endurance","speed","rehab","heavy"]);
  const list = Array.isArray(qualities) ? qualities.map(normalizeQuality).filter(Boolean) : [];
  const filtered = list.filter(x => allowed.has(x));
  if (!filtered.length) return "";

  const uniq = [...new Set(filtered)];
  const badge = (txt) => `
    <span style="
      display:inline-flex; align-items:center; gap:4px;
      font-size:10px; font-weight:900;
      border:1px solid rgba(255,255,255,.18);
      background: rgba(255,255,255,.06);
      border-radius:999px;
      padding:2px 7px;
      opacity:.95;
    ">${escapeHtml(txt)}</span>
  `;

  return `<div style="display:flex; flex-wrap:wrap; gap:6px; margin-top:4px;">${uniq.map(badge).join("")}</div>`;
}


function renderPlanStagesHTML(plan, { editable = false, onReplace = "" } = {}) {
  const exs = Array.isArray(plan?.exercises) ? plan.exercises : [];
  const g = groupByStage(exs);

  const stages = ["Pre-Training", "Main Training", "Post-Training"];

  let html = "";
  for (const stage of stages) {
    const items = g[stage] || [];
    html += `<div style="margin-top:6px;">
  <div style="
    font-weight:900;
    font-size:11px;
    letter-spacing:0.06em;
    color:#d4af37;
    margin-bottom:4px;
  ">${escapeHtml(stageDisplayName(stage))}</div>
`;


    if (!items.length) {
      html += `<div style="opacity:.6; font-size:11px;">—</div></div>`;
      continue;
    }

    items.forEach((e, idx) => {
      const name = escapeHtml(resolveExerciseName(e));
      const cat = escapeHtml(e.category || "");
      const desc = escapeHtml(resolveExerciseDescription(e));
      const rec = escapeHtml(resolveExerciseRecommendation(e, stage));
      const btn = editable
        ? `<button type="button" style="
              margin-left:8px;
              border:1px solid rgba(255,255,255,0.18);
              background: transparent;
              color:#fff;
              border-radius:10px;
              padding:3px 7px;
              cursor:pointer;
              font-weight:800;
              font-size:11px;
            " onclick="${onReplace}('${escapeHtml(stage)}', '${escapeHtml(e.name)}')">${escapeHtml(wt("modalReplace"))}</button>`
        : "";

      html += `
        <div style="display:flex; justify-content:space-between; gap:8px; align-items:flex-start;
                    padding:6px; border:1px solid rgba(255,255,255,0.08); border-radius:10px; margin:4px 0;">
          <div style="min-width:0;">
            <div style="font-size:12px; font-weight:800; line-height:1.2;">${name}</div>
            ${cat ? `<div style="font-size:10px; opacity:.7; margin-top:2px;">${cat}</div>` : ""}
            ${desc ? `<div style="font-size:11px; opacity:.85; margin-top:3px; line-height:1.2;">${desc}</div>` : ""}
            ${rec ? `<div style="font-size:11px; opacity:.9; margin-top:3px; line-height:1.25;"><span style="color:#d4af37; font-weight:800;">${escapeHtml(weeklyRecommendationLabel())}:</span> ${rec}</div>` : ""}
          </div>
          <div style="flex:0 0 auto;">${btn}</div>
        </div>
      `;
    });

    html += `</div>`;
  }
  return html;
}




function replaceOneExerciseInPlan(plan, stage, exerciseName) {
  const exs = Array.isArray(plan?.exercises) ? plan.exercises : [];
  const idx = exs.findIndex(e => e.stage === stage && e.name === exerciseName);
  if (idx === -1) return plan;

  const preferredCategory = exs[idx]?.category || null;
  const repl = pickReplacementExercise(stage, exerciseName, preferredCategory);
  if (!repl) return plan;

  const next = { ...plan, exercises: exs.slice() };
  next.exercises[idx] = repl;
  return next;
}

function ensureSuggestionModal() {
  let wrap = document.getElementById("coreSuggestModal");
  if (wrap) return wrap;

  wrap = document.createElement("div");
  wrap.id = "coreSuggestModal";
  wrap.style.cssText = `position:fixed; inset:0; z-index:99999; display:none;`;

  wrap.innerHTML = `
    <div id="coreSuggestBackdrop" style="
      position:absolute; inset:0;
      background: rgba(0,0,0,.55);
      backdrop-filter: blur(6px);
    "></div>

    <div id="coreSuggestPanel" style="
      position: relative;
      width: min(740px, 96vw);
      max-height: 78vh;
      margin: 6vh auto;
      background: rgba(18,18,18,0.94);
      color:#fff;
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 14px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.45);
      overflow:hidden;
      display:flex;
      flex-direction:column;
      font-size: 12px;
      line-height: 1.25;
    ">

      <!-- header -->
      <div style="
        padding:8px 10px;
        border-bottom: 1px solid rgba(255,255,255,0.10);
        display:flex; align-items:flex-start; justify-content:space-between; gap:10px;
      ">
        <div style="min-width:0;">
          <div id="coreSuggestTitle" style="font-weight:900; font-size:13px; line-height:1.15;">${wt("modalSuggestedHeader")}</div>
          <div id="coreSuggestSubtitle" style="font-size:11px; opacity:.85; margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;"></div>
        </div>

        <div style="display:flex; gap:8px; align-items:center;">
          <div id="coreSuggestVerdictPill" style="
            font-size:11px; padding:5px 8px; border-radius:999px;
            border:1px solid rgba(255,255,255,0.18);
            background: rgba(255,255,255,0.06);
            white-space:nowrap;
          ">—</div>

          <button id="coreSuggestCloseX" style="
            background: transparent; border: 1px solid rgba(255,255,255,0.18);
            color:#fff; border-radius: 10px; padding: 5px 9px; cursor:pointer;
          ">✕</button>
        </div>
      </div>

      <!-- body -->
      <div style="padding:8px 10px; overflow:auto; display:grid; gap:8px;">

        <!-- verdict text -->
        <div id="coreSuggestVerdictText" style="
          font-size:12px; line-height:1.25;
          border:1px solid rgba(255,255,255,0.12);
          border-radius:12px;
          padding:8px;
          background: rgba(255,255,255,0.04);
        ">—</div>

                <!-- WHY wide top -->
        <div style="border:1px solid rgba(255,255,255,0.12); border-radius:12px; padding:8px;">
          <div style="
  font-weight:900;
  font-size:11px;
  letter-spacing:0.06em;
  color:#d4af37;
  margin-bottom:4px;
">${wt("modalWhy")}</div>

          <div id="coreSuggestReasons" style="font-size:12px; line-height:1.25; opacity:.95;">—</div>
        </div>

        <!-- RECOMMENDATIONS (тонко як WHY, тепер ВГОРІ) -->
        <div style="border:1px solid rgba(255,255,255,0.12); border-radius:12px; padding:8px;">
          <div style="
  font-weight:900;
  font-size:11px;
  letter-spacing:0.06em;
  color:#d4af37;
  margin-bottom:4px;
">${wt("modalRecommendations")}</div>

          <div id="coreSuggestRecs" style="font-size:12px; line-height:1.25; opacity:.95;">—</div>
        </div>

        <!-- MAIN GRID: LEFT = BASE+SUGGESTED (на місці великого RECS), RIGHT = DETAILS -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; align-items:start;">

          <!-- LEFT: BASE (top) + SUGGESTED (bottom) -->
<div style="
  border:1px solid rgba(255,255,255,0.12);
  border-radius:12px;
  padding:8px;
  display:grid;
  gap:8px;
">

  <div style="border:1px solid rgba(255,255,255,0.10); border-radius:12px; padding:8px;">
    <div style="
  font-weight:900;
  font-size:11px;
  letter-spacing:0.06em;
  color:#d4af37;
  margin-bottom:4px;
">
  ${wt("modalBase")}
</div>

    <div id="coreSuggestBase" style="font-size:12px; line-height:1.25; opacity:.95;">—</div>
  </div>

  <div style="border:1px solid rgba(255,255,255,0.10); border-radius:12px; padding:8px;">
    <div style="
  font-weight:900;
  font-size:11px;
  letter-spacing:0.06em;
  color:#d4af37;
  margin-bottom:4px;
">${wt("modalSuggested")}</div>
    <div id="coreSuggestSuggested" style="font-size:12px; line-height:1.25; opacity:.95;">—</div>
  </div>

</div>


            

          <!-- RIGHT: DETAILS (як було) -->
          <div style="border:1px solid rgba(255,255,255,0.12); border-radius:12px; overflow:hidden;">
            <div id="coreSuggestDetailsToggle" style="
  padding:8px 10px;
  cursor:pointer;
  background: rgba(255,255,255,0.03);
  border-bottom: 1px solid rgba(255,255,255,0.10);
  border-left: 3px solid rgba(212,175,55,0.85);
  display:flex; justify-content:space-between; align-items:center;
  font-weight:900;
  font-size:11px;
  letter-spacing:0.10em;
  color: rgba(255,255,255,0.90);
  text-transform: uppercase;
">


              <span>${wt("modalDetails")}</span>
              <span id="coreSuggestDetailsChevron" style="opacity:.8;">▾</span>
            </div>

            <div id="coreSuggestDetails" style="display:none; padding:8px; gap:8px;">
              <div id="coreSuggestInjury"></div>
              <div id="coreSuggestWellness"></div>
              <div id="coreSuggestLoad"></div>
              <div id="coreSuggestBodyMass"></div>
              <div id="coreSuggestPower"></div>
            </div>
          </div>

        </div>


      </div>

      <!-- footer -->
      <div style="
        border-top: 1px solid rgba(255,255,255,0.10);
        padding:8px 10px;
        display:flex; justify-content:space-between; gap:10px; align-items:center;
        background: rgba(255,255,255,0.03);
      ">
        <div id="coreSuggestDayChip" style="font-size:11px; opacity:.85;">—</div>
        <div style="display:flex; gap:8px;">
          <button id="coreSuggestEditManual" style="
            padding:7px 9px; border-radius:10px;
            border:1px solid rgba(255,255,255,0.18);
            background: transparent; color:#fff; cursor:pointer; font-weight:800; font-size:12px;
          ">${wt("modalManual")}</button>
          <button id="coreSuggestApply" style="
            padding:7px 9px; border-radius:10px;
            border:1px solid rgba(255,255,255,0.18);
            background: #fff; color:#111; cursor:pointer; font-weight:900; font-size:12px;
          ">${wt("modalApply")}</button>
        </div>
      </div>

    </div>
  `;

  document.body.appendChild(wrap);

  const close = () => (wrap.style.display = "none");
  wrap.querySelector("#coreSuggestBackdrop").onclick = close;
  wrap.querySelector("#coreSuggestCloseX").onclick = close;

  // DETAILS toggle (✅ без падінь)
  const toggle = wrap.querySelector("#coreSuggestDetailsToggle");
  const details = wrap.querySelector("#coreSuggestDetails");
  const chev = wrap.querySelector("#coreSuggestDetailsChevron");
  if (toggle && details) {
    toggle.onclick = () => {
      const isOpen = details.style.display !== "none";
      details.style.display = isOpen ? "none" : "grid";
      if (chev) chev.textContent = isOpen ? "▾" : "▴";
    };
  }

  // Manual = просто закрити (тут ти можеш потім підʼєднати свій existing flow)
  wrap.querySelector("#coreSuggestEditManual").onclick = () => {
    wrap.style.display = "none";
  };

  return wrap;
}

function buildProposedDayStatuses(core) {
  // Беремо поточні статуси (які ти вже показуєш)
  const dayNames = ["Пн","Вт","Ср","Чт","Пт","Сб","Нд"];
  const current = [];

  const dayCells = document.querySelectorAll('#md-colors-row .cycle-day');
  for (let i = 0; i < 7; i++) {
    const mdEl = dayCells[i]?.querySelector('.md-status');
    const status = mdEl ? mdEl.textContent.trim() : "TRAIN";
    current.push(status);
  }

  // правило v1: міняємо тільки TRAIN/MD+? на safer якщо треба
  const risk = Number(core?.risk || 0);
  const mode = core?.mode || "TRAIN";

  const proposed = current.map((st) => st);

  // helper: чи статус тренувальний
  const isTrainLike = (st) => st === "TRAIN" || st.startsWith("MD+") || st.startsWith("MD-");

  // MD (match day) не чіпаємо, але якщо risk дуже високий — MD-1 теж в LIGHT
  for (let i = 0; i < 7; i++) {
    const st = current[i];

    if (st === "MD") continue;

    if (mode === "REST") {
      // risk >= 85: усе крім MD -> REST
      if (risk >= 85 && st !== "MD") proposed[i] = "REST";
      // risk 70-84: TRAIN та MD+ -> REST, MD- залишаємо але можна LIGHT
      else if (risk >= 70) {
        if (st === "TRAIN" || st.startsWith("MD+")) proposed[i] = "REST";
        if (st === "MD-1") proposed[i] = "LIGHT";
      }
      continue;
    }

    if (mode === "REHAB") {
      if (isTrainLike(st) && st !== "MD") proposed[i] = "REHAB";
      continue;
    }

    if (mode === "LIGHT") {
      if (isTrainLike(st) && st !== "MD") proposed[i] = "LIGHT";
      continue;
    }
  }

  return { dayNames, current, proposed };
}

function countBodyGroups(exercises = []) {
  const counts = {};
  (Array.isArray(exercises) ? exercises : []).forEach(e => {
    const g = String(e?.bodyGroup || "").toLowerCase().trim();
    if (!g) return;
    counts[g] = (counts[g] || 0) + 1;
  });
  return counts;
}

function bodyGroupPenalty(bg, counts, limits) {
  const g = String(bg || "").toLowerCase().trim();
  if (!g) return 0;

  const lim = Number(limits?.[g]);
  if (!Number.isFinite(lim)) return 0;

  const n = Number(counts?.[g] || 0);

  // якщо вже >= ліміту — сильний мінус, щоб не вибирало
  if (n >= lim) return -999;

  // якщо наближаємось до ліміту — м’який мінус
  if (n === lim - 1) return -2;

  return 0;
}


function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj || {}));
}

function getStagePool(stage) {
  const lib = getLib();
  const pool = [];
  const stageData = lib?.[stage];
  if (!stageData) return pool;

  for (const catName in stageData) {
    const cat = stageData[catName];
    const catQual = Array.isArray(cat?.qualities) ? cat.qualities : [];

    const bodyGroup = String(catName || "").toLowerCase().trim(); // legs | core | upperbody | ...

    (cat?.exercises || []).forEach(ex => {
      // якщо нема ex.qualities — беремо категорійні
      const rawQual = Array.isArray(ex?.qualities) ? ex.qualities : [];

      // беремо tags з бібліотеки
      const rawTags = Array.isArray(ex?.tags) ? ex.tags : [];

      // ✅ qualities = ТІЛЬКИ якості + tags (без legs/core/upperbody)
      const combined = [
        ...rawQual,
        ...rawTags
      ];

      pool.push({
        ...ex,
        stage,
        category: catName,

        // ✅ тепер include/exclude працює по qualities+tags,
        // але НЕ плутає це з body groups
        qualities: combined.map(normalizeQuality).filter(Boolean),

        tags: rawTags,

        // ✅ окремо: група тіла (НЕ використовується як quality)
        bodyGroup
      });
    });
  }

  return pool;
}

function getDayFocus(dayStatus, coreMode) {
  if (coreMode === "REST") return "recovery";
  if (coreMode === "REHAB") return "rehab";
  if (coreMode === "LIGHT") return "activation";

  const profile = getWeeklySportProfile();
  if (profile === "COURT_MD") {
    switch (dayStatus) {
      case "MD-4": return "power";
      case "MD-3": return "speed";
      case "MD-2": return "mixed";
      case "MD-1": return "activation";
      case "MD+1": return "recovery";
      case "MD+2": return "mixed";
      case "TRAIN": return "mixed";
      default: return "mixed";
    }
  }

  if (profile === "INDIVIDUAL_ENDURANCE") {
    switch (dayStatus) {
      case "MD-4": return "endurance";
      case "MD-3": return "mixed";
      case "MD-2": return "speed";
      case "MD-1": return "activation";
      case "MD+1": return "recovery";
      case "MD+2": return "endurance";
      case "TRAIN": return "endurance";
      default: return "mixed";
    }
  }

  switch (dayStatus) {
    case "MD-4": return "legs";
    case "MD-3": return "mixed";
    case "MD-2": return "speed";
    case "MD-1": return "activation";
    case "MD+1": return "recovery";
    case "MD+2": return "mixed";
    default: return "mixed";
  }
}

function allowLegsFor(dayStatus, stage) {
  const st = String(dayStatus || "");
  const sg = String(stage || "Main Training");
  const profile = getWeeklySportProfile();

  if (profile === "COURT_MD") {
    if (st === "REST" || st === "MD" || st === "MD+1") return false;
    if (st === "MD-1") return sg === "Pre-Training";
    if (st === "MD-3") return sg === "Pre-Training" || sg === "Main Training";
    return true;
  }

  if (profile === "INDIVIDUAL_ENDURANCE") {
    if (st === "REST" || st === "MD" || st === "MD+1") return false;
    if (st === "MD-1") return sg === "Pre-Training";
    return true;
  }

  // MD-4: legs можна всюди
  if (st === "MD-4") return true;

  // MD-3: legs можна ТІЛЬКИ у Pre-Training
  if (st === "MD-3") return sg === "Pre-Training";

  // інші дні: legs не можна
  return false;
}


function inferFlagsFromText(name = "", category = "") {
  const t = `${name} ${category}`.toLowerCase();
  
  

  // витривалість / біг
  const endurance = /endurance|aerobic|cardio|run|tempo|interval|hiit|rsa|yo-yo|beep|витривал|аероб|кардіо|біг|темпов|інтервал|шатл|повторн/.test(t);

  // швидкість / спринт
  const sprint = /sprint|accel|acceleration|max velocity|top speed|speed|спринт|прискор|швидк|ривок|старт/.test(t);

  // стрибки / пліо
  const jump = /jump|cmj|plyo|plyometric|bounds|hops|drop jump|стриб|пліо|пліомет|баунд|хоп/.test(t);

  // важке / силове
  const heavy = /max|heavy|1rm|3rm|5rm|strength|squat|deadlift|bench|clean|snatch|важк|макс|1пм|3пм|5пм|сила|присід|тяга|жим|ривок|поштовх/.test(t);

  const eccentric = /eccentric|isometric|iso|tempo|ексцент|ізометр|темп/.test(t);

  // зони ризику (для pain filter)
  const knee = /knee|колін|колено|patellar|надкол|пател/.test(t) || /squat|присід|lunge|випад|split squat|болгар/.test(t);
  const ankle = /ankle|achilles|гоміл|щикол|ахіл|литк|ікр/.test(t);
  const hamstring = /hamstring|biceps femoris|задн|біцепс стегна|норд(ик)?|rdl|румун|hinge|хіндж/.test(t);
  const groin = /groin|adductor|пах|аддукт|привідн|copenhagen|копенгаген/.test(t);
  const back = /back|spine|lumbar|попер|спин|хреб/.test(t);
  const shoulder = /shoulder|rotator|overhead|плеч|ротатор|над голов/.test(t);

  const knee_dominant =
  /squat|lunge|leg press|step|split squat|extension|jump|plyo|присід|випад|стриб/.test(t);


  return {
  endurance, sprint, jump, heavy, eccentric,
  knee, ankle, hamstring, groin, back, shoulder,
  knee_dominant
};

}

const FALLBACK_INJURY_ZONES = [
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

function getInjuryZoneCatalog() {
  const fromWindow = Array.isArray(window.INJURY_ZONES) ? window.INJURY_ZONES : [];
  const raw = fromWindow.length ? fromWindow : FALLBACK_INJURY_ZONES;
  return [...new Set(raw.map((z) => String(z || "").toLowerCase().trim()).filter(Boolean))];
}

function normalizeInjuryZone(zoneRaw) {
  const zoneSet = new Set(getInjuryZoneCatalog());
  const direct = String(zoneRaw || "").toLowerCase().trim().replace(/\s+/g, "_");
  if (!direct) return "";
  if (zoneSet.has(direct)) return direct;

  const t = String(zoneRaw || "").toLowerCase();
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
  if (/upper[\s_-]?back|thoracic|лопат|trapez/.test(t)) return "upper_back";
  if (/core|abs|прес|кор\b/.test(t)) return "core";
  if (/chest|груд/.test(t)) return "chest";
  if (/shoulder|плеч|rotator/.test(t)) return "shoulder";
  if (/elbow|лікоть|локоть/.test(t)) return "elbow";
  if (/wrist|запяст|кист/.test(t)) return "wrist";
  if (/neck|cervic|ши[яї]/.test(t)) return "neck";
  return "";
}

function normalizeZoneList(raw) {
  const arr = Array.isArray(raw) ? raw : [];
  const out = [];
  arr.forEach((z) => {
    const n = normalizeInjuryZone(z);
    if (n && !out.includes(n)) out.push(n);
  });
  return out;
}

function getExerciseZones(ex) {
  const primary = normalizeZoneList(ex?.primaryZones);
  const secondaryRaw = normalizeZoneList(ex?.secondaryZones);
  const secondary = secondaryRaw.filter((z) => !primary.includes(z));
  const hasExplicit = primary.length > 0 || secondary.length > 0;
  return { primary, secondary, hasExplicit };
}

function formatSecondaryZoneWarning(zoneKey) {
  const label = String(zoneKey || "").replace(/_/g, " ");
  const l = weeklyLang();
  if (l === "uk") return `Увага: вторинне навантаження на зону "${label}". За потреби замініть вправу вручну.`;
  if (l === "ru") return `Внимание: вторичная нагрузка на зону "${label}". При необходимости замените упражнение вручную.`;
  return `Warning: secondary load on zone "${label}". Replace manually if needed.`;
}

function prunePlanIrritants(plan, signals, dayStatus) {
  const out = deepClone(plan || { exercises: [] });
  out.exercises = Array.isArray(out.exercises) ? out.exercises : [];

  const cons = buildReplaceConstraints(signals || {}, dayStatus);
  const targets = getTargetsForDay(dayStatus);
  const exc = Array.isArray(targets?.exclude) ? targets.exclude : [];

  const keep = [];

  for (const ex of out.exercises) {
    const flags = inferFlagsFromText(ex?.name || "", ex?.category || "");
    const safety = evaluateExerciseInjurySafety(ex, flags, cons);

    // 1) Pain provocation
    if (safety.blocked) continue;

    // 2) CNS rules
    if (cons.cnsLow) {
      // прибираємо heavy + jump/sprint + явні power/speed/heavy tags
      if (flags.heavy || flags.jump || flags.sprint) continue;
      if (hasAnyQuality(ex, ["power", "heavy", "speed"])) continue;
    } else if (cons.cnsMod) {
      // moderate: прибираємо heavy; jump/sprint залишимо, але пізніше вони і так “зажаті” scoring’ом
      if (flags.heavy) continue;
    }

    // 3) Load spike rules
    if ((cons.acwrSpike || cons.acwrHigh) && flags.endurance) continue;

    // 4) Microcycle exclude rules
    // 4) Microcycle exclude rules (qualities/tags + HARD bodyGroup)
// 4) Microcycle exclude rules (qualities/tags + HARD bodyGroup)
if (exc.length) {
  // 4a) exclude по qualities/tags
  if (hasAnyQuality(ex, exc)) continue;

  // 4b) exclude по bodyGroup (legs/upperbody/core)
  const excLower = exc.map(x => String(x).toLowerCase().trim());
  const bg = String(ex?.bodyGroup || "").toLowerCase().trim();
  const stage = String(ex?.stage || "Main Training");
  const allowLegs = allowLegsFor(dayStatus, stage);

  if (bg === "legs" && excLower.includes("legs") && !allowLegs) continue;
  if (bg === "upperbody" && excLower.includes("upperbody")) continue;
  if (bg === "core" && excLower.includes("core")) continue;
}


// ✅ HARD rule: legs заборонені, крім MD-4 або MD-3 Pre-Training
{
  const bg = String(ex?.bodyGroup || "").toLowerCase().trim();
  const stage = String(ex?.stage || "Main Training");

  if (bg === "legs" && !allowLegsFor(dayStatus, stage)) {
    continue;
  }
}

    const nextEx = { ...ex };
    if (safety.warning) nextEx.injuryWarning = safety.warning;
    else delete nextEx.injuryWarning;
    keep.push(nextEx);
  }

  out.exercises = keep;
  return out;
}


function buildReplaceConstraints(signals, dayStatus) {
  const inj = signals?.injury || null;
  const pain = Number(inj?.pain ?? 0) || 0;
  const loc = String(inj?.location || "").toLowerCase();
  const locationKey = String(inj?.locationKey || "").toLowerCase().trim();
  const injuryZone = normalizeInjuryZone(locationKey) || normalizeInjuryZone(loc);

  const wellness = signals?.wellness || null;
  const cns = computeCNSScore(wellness);
  const cnsScore = Number(cns?.score);
  const cnsLow = Number.isFinite(cnsScore) && cnsScore < 60;
  const cnsMod = Number.isFinite(cnsScore) && cnsScore < 80;

  const acwr = getACWRFromAnywhere(window.__athleteCore, window.__athleteSignals);

  const acwrSpike = (acwr != null && acwr >= 1.50);
  const acwrHigh  = (acwr != null && acwr >= 1.30);

  const st = String(dayStatus || "");
  return {
    pain, loc, locationKey, injuryZone,
    cnsLow, cnsMod,
    acwrSpike, acwrHigh,
    isMD1: st === "MD-1",
    isMDp1: st === "MD+1",
    isMDp2: st === "MD+2",
  };
}

function getTargetQualitiesForDay(dayStatus, coreMode, cons) {
  const st = String(dayStatus || "");
  const mode = String(coreMode || "");

  // базово для дня
  let targets = ["strength"]; // дефолт

  if (st === "MD-1") targets = ["power"];
  if (st === "MD") targets = []; // матч — не чіпаємо
  if (st === "MD+1" || st === "MD+2") targets = ["endurance"]; // recovery/аеробна робота (легка)
  if (mode === "LIGHT") targets = ["strength"]; // але “легше”
  if (mode === "REHAB") targets = ["strength"]; // контроль/ізометрія теж часто strength-подібна якість
  if (mode === "REST") targets = [];

  // якщо CNS low — power прибираємо
  if (cons?.cnsLow) targets = targets.filter(x => x !== "power");

  // якщо ACWR spike/high — endurance караємо
  if (cons?.acwrSpike || cons?.acwrHigh) targets = targets.filter(x => x !== "endurance");

  return targets;
}

function qualityOverlapScore(candidateQualities, targets) {
  const c = Array.isArray(candidateQualities) ? candidateQualities.map(normalizeQuality).filter(Boolean) : [];
  const t = Array.isArray(targets) ? targets.map(normalizeQuality).filter(Boolean) : [];
  if (!t.length) return 0;
  if (!c.length) return -1; // немає tags — трохи гірше

  const cSet = new Set(c);
  let hit = 0;
  t.forEach(x => { if (cSet.has(x)) hit++; });

  // бонус за співпадіння
  if (hit >= 2) return +3;
  if (hit === 1) return +2;

  // якщо є tags, але нічого не співпало — легкий мінус
  return -1;
}

function isExerciseBlockedByPainLegacy(flags, cons) {
  if (!cons || cons.pain < 4) return false;

  const loc = String(cons.loc || "").toLowerCase();

  const kneePain =
    /knee|колін|колено|меніск|мениск|patella|пател|acl|mcl|lcl|pcl/.test(loc);

  if (kneePain) {
    if (flags.knee || flags.knee_dominant) return true;
  }

  if (/ham|string|задн/.test(loc)) return !!flags.hamstring;
  if (/groin|adductor|пах/.test(loc)) return !!flags.groin;
  if (/ankle|achilles|ахіл/.test(loc)) return !!flags.ankle;
  if (/back|spine|попер/.test(loc)) return !!flags.back;
  if (/shoulder|плеч/.test(loc)) return !!flags.shoulder;

  return false;
}

function evaluateExerciseInjurySafety(ex, flags, cons) {
  const zone = normalizeInjuryZone(cons?.injuryZone || cons?.locationKey || cons?.loc || "");
  const pain = Number(cons?.pain || 0);
  const z = getExerciseZones(ex);

  if (z.hasExplicit && zone && pain > 0) {
    if (z.primary.includes(zone)) {
      return { blocked: true, warning: "", reason: `primary:${zone}` };
    }
    if (z.secondary.includes(zone)) {
      return {
        blocked: false,
        warning: formatSecondaryZoneWarning(zone),
        reason: `secondary:${zone}`
      };
    }
    return { blocked: false, warning: "", reason: "zone-clear" };
  }

  const blockedLegacy = isExerciseBlockedByPainLegacy(flags, cons);
  return { blocked: blockedLegacy, warning: "", reason: blockedLegacy ? "legacy-block" : "legacy-clear" };
}


function scoreCandidateForDay(flags, cons) {
  let s = 0;

  if (cons.isMD1) {
    if (flags.heavy) s -= 3;
    if (flags.jump || flags.sprint) s += 2;
    if (flags.eccentric) s -= 1;
  }

  if (cons.isMDp1 || cons.isMDp2) {
    if (flags.heavy) s -= 2;
    if (flags.jump || flags.sprint) s -= 2;
    if (flags.eccentric) s += 1;
  }

  if (cons.cnsLow) {
    if (flags.heavy) s -= 3;
    if (flags.jump || flags.sprint) s -= 3;
    if (flags.eccentric) s += 1;
  } else if (cons.cnsMod) {
    if (flags.heavy) s -= 1;
    if (flags.jump || flags.sprint) s -= 1;
  }

  if (cons.acwrSpike) {
    if (flags.endurance) s -= 4;
  } else if (cons.acwrHigh) {
    if (flags.endurance) s -= 2;
  }

  if (cons.pain >= 4) {
    if (flags.jump || flags.sprint) s -= 1;
  }

  return s;
}
function normList(arr) {
  return (Array.isArray(arr) ? arr : [])
    .map(normalizeQuality)
    .filter(Boolean);
}

function hasAnyQuality(ex, qualities = []) {
  const want = (Array.isArray(qualities) ? qualities : [])
    .map(normalizeQuality)
    .filter(Boolean);

  if (!want.length) return false;

  // ✅ беремо і qualities, і tags
  const q1 = Array.isArray(ex?.qualities) ? ex.qualities : [];
  const q2 = Array.isArray(ex?.tags) ? ex.tags : [];

  const got = [...q1, ...q2].map(normalizeQuality).filter(Boolean);

  return want.some(x => got.includes(x));
}

function pickExerciseForDaySmart(stage, signals, dayStatus, targets, usedNamesSet) {
  const pool = getStagePool(stage);
  if (!pool.length) return null;

  const cons = buildReplaceConstraints(signals, dayStatus);
  const coreMode = String(window.__athleteCore?.mode || "");
  const priorityCtx = getGoalPriorityContext(signals, window.__athleteCore);

  // 1) прибираємо вже використані назви (щоб не дублювались в один день)
  let candidates = pool.filter(x => !usedNamesSet.has(String(x.name||"")));

  // 2) pain safety filter
  candidates = candidates.filter(c => {
    const f = inferFlagsFromText(c.name, c.category);
    const safety = evaluateExerciseInjurySafety(c, f, cons);
    return !safety.blocked;
  });

  // 3) quality filter (include/exclude)
  const inc = targets?.include || [];
  const exc = targets?.exclude || [];

  if (inc.length) {
    const incOnes = candidates.filter(c => hasAnyQuality(c, inc));
    if (incOnes.length) candidates = incOnes;
  }

  if (exc.length) {
    const filtered = candidates.filter(c => !hasAnyQuality(c, exc));
    if (filtered.length) candidates = filtered;
  }
  
  // ✅ HARD EXCLUDE by bodyGroup (legs/upperbody/core)
{
  const excLower = (Array.isArray(exc) ? exc : []).map(x => String(x).toLowerCase().trim());
  const exclBG = new Set(excLower.filter(x => x === "legs" || x === "upperbody" || x === "core"));

  const focus = getDayFocus(dayStatus, window.__athleteCore?.mode);
  const allowLegs = allowLegsFor(dayStatus, stage);


  if (exclBG.size) {
    const strict = candidates.filter(c => {
      const bg = String(c?.bodyGroup || "").toLowerCase().trim();
      if (!bg) return true;

      if (bg === "legs" && exclBG.has("legs") && !allowLegs) return false;
      if (bg === "upperbody" && exclBG.has("upperbody")) return false;
      if (bg === "core" && exclBG.has("core")) return false;

      return true;
    });

    if (strict.length) candidates = strict;
    else return null;
  }
}

  if (!candidates.length) return null;


  // 4) scoring (твоя існуюча логіка)
  const scored = candidates.map(c => {
    const f = inferFlagsFromText(c.name, c.category);
    const safety = evaluateExerciseInjurySafety(c, f, cons);
    const base = scoreCandidateForDay(f, cons);
    const qScore = qualityOverlapScore(c.qualities, inc);
    const pScore = priorityQualityBonus(c.qualities, priorityCtx, dayStatus, coreMode, cons);
    const warnPenalty = safety.warning ? -2 : 0;
    return { c, safety, score: base + qScore + pScore + warnPenalty };
  });
  scored.sort((a,b)=> b.score - a.score);

  // top-5 random
  const top = scored.slice(0, Math.min(5, scored.length));
  const pickedRow = top[Math.floor(Math.random() * top.length)] || null;
  const pick = pickedRow?.c || null;
  if (!pick) return null;
  const withSafety = pickedRow?.safety?.warning
    ? { ...pick, injuryWarning: pickedRow.safety.warning }
    : { ...pick };
  usedNamesSet.add(String(withSafety.name || ""));
  return withSafety;
}

function pickReplacementExerciseSmart(currentEx, stage, signals, dayStatus, opts = {}) {
  const pool = getStagePool(stage);
  if (!pool.length) return null;

  const currName = String(currentEx?.name || "");
  const currCat  = String(currentEx?.category || "");
  const cons = buildReplaceConstraints(signals, dayStatus);

  const coreMode = String(window.__athleteCore?.mode || "");
  const modeKey =
    (coreMode === "LIGHT" || coreMode === "REHAB" || coreMode === "REST")
      ? coreMode
      : String(dayStatus || "");

  const targetsMap = getStatusQualityTargetsMap();
  const targets =
    targetsMap[modeKey] ||
    targetsMap["TRAIN"] ||
    { include: [], exclude: [] };
  const priorityCtx = getGoalPriorityContext(signals, window.__athleteCore);

  let candidates = pool.filter(x => String(x.name || "") !== currName);

  // prefer same category
  if (currCat) {
    const sameCat = candidates.filter(x => String(x.category || "") === currCat);
    if (sameCat.length) candidates = sameCat;
  }

  // pain safety
  let filtered = candidates.filter(c => {
    const f = inferFlagsFromText(c.name, c.category);
    const safety = evaluateExerciseInjurySafety(c, f, cons);
    return !safety.blocked;
  });
  if (!filtered.length) return null;

  // avoid duplicates by name
  const used = opts?.alreadyUsed instanceof Set ? opts.alreadyUsed : null;
  if (used) {
    filtered = filtered.filter(c => !used.has(String(c?.name || "").toLowerCase()));
    if (!filtered.length) filtered = candidates.filter(c => !used.has(String(c?.name || "").toLowerCase()));
  }
// ✅ HARD BODY-GROUP EXCLUDE (проф-правило)
// ✅ HARD BODY-GROUP EXCLUDE (legs/upperbody/core) з урахуванням day focus
const excl = Array.isArray(targets?.exclude)
  ? targets.exclude.map(x => String(x).toLowerCase().trim())
  : [];

const hardGroups = new Set(["legs","upperbody","core"]);
const exclBG = new Set(excl.filter(x => hardGroups.has(x)));

const allowLegs = allowLegsFor(dayStatus, stage);
// тільки MD-4 у твоєму getDayFocus()

if (exclBG.size) {
  const bgFiltered = filtered.filter(c => {
    const bg = String(c?.bodyGroup || "").toLowerCase().trim();
    if (!bg) return true;

    if (bg === "legs" && exclBG.has("legs") && !allowLegs) return false;
    if (bg === "upperbody" && exclBG.has("upperbody")) return false;
    if (bg === "core" && exclBG.has("core")) return false;

    return true;
  });

  if (bgFiltered.length) filtered = bgFiltered;
  else return null; // ✅ важливо: не робимо відкат назад в legs
}


  // ✅ BODY GROUP LIMITS (ось головне)
  const groupCounts = opts?.groupCounts || {};
  const defaultLimits = { legs: 2, upperbody: 2, core: 2 };

let groupLimits = { ...defaultLimits };
const profile = getWeeklySportProfile();

if (profile === "COURT_MD") {
  if (dayStatus === "MD-4") groupLimits.legs = 4;
  else if (dayStatus === "MD-3") groupLimits.legs = stage === "Post-Training" ? 1 : 2;
  else if (dayStatus === "MD-2") groupLimits.legs = 1;
  else if (dayStatus === "MD-1") groupLimits.legs = stage === "Pre-Training" ? 1 : 0;
  else if (dayStatus === "MD" || dayStatus === "MD+1" || dayStatus === "REST") groupLimits.legs = 0;
} else if (profile === "INDIVIDUAL_ENDURANCE") {
  if (dayStatus === "TRAIN") groupLimits.legs = 3;
  else if (dayStatus === "MD-4") groupLimits.legs = 4;
  else if (dayStatus === "MD-1") groupLimits.legs = stage === "Pre-Training" ? 1 : 0;
  else if (dayStatus === "MD" || dayStatus === "MD+1" || dayStatus === "REST") groupLimits.legs = 0;
} else {
  if (dayStatus === "MD-4") {
    groupLimits.legs = 6;
  }
  if (dayStatus === "MD-3") {
    if (stage === "Pre-Training") groupLimits.legs = 2;
    else groupLimits.legs = 0; // ❌ Main + Post
  }
}



  // score
  const scored = filtered.map(c => {
    const f = inferFlagsFromText(c.name, c.category);
    const safety = evaluateExerciseInjurySafety(c, f, cons);
    const base = scoreCandidateForDay(f, cons);

    const qScore = qualityOverlapScore(c.qualities, targets?.include || []);
    const priorityBonus = priorityQualityBonus(c.qualities, priorityCtx, dayStatus, coreMode, cons);
    let focusBonus = 0;

if (opts.focus === "legs" && c.bodyGroup === "legs") {
  focusBonus += 5; // 💥 це і робить день ніг
}
// ✅ Post-Training should prefer recovery for groups trained in Main
if (
  stage === "Post-Training" &&
  Array.isArray(opts.preferredRecoveryGroups) &&
  opts.preferredRecoveryGroups.includes(String(c.bodyGroup || "").toLowerCase().trim())
) {
  focusBonus += 4;
}

if (opts.focus === "speed" && c.qualities?.includes("speed")) {
  focusBonus += 4;
}

if (opts.focus === "activation" && c.qualities?.includes("activation")) {
  focusBonus += 4;
}

if (opts.focus === "recovery" && c.qualities?.includes("recovery")) {
  focusBonus += 5;
}

if (opts.focus === "rehab" && c.qualities?.includes("rehab")) {
  focusBonus += 5;
}


    // hard rules (як у тебе)
    let hard = 0;
    const q = (Array.isArray(c.qualities) ? c.qualities.map(normalizeQuality) : []);
    if ((cons.acwrSpike || cons.acwrHigh) && q.includes("endurance")) hard -= 3;
    if (cons.cnsLow && q.includes("power")) hard -= 3;

    // ✅ ліміт по групі (legs/core/upperbody)
    const bgPen = bodyGroupPenalty(c.bodyGroup, groupCounts, groupLimits);

    const warnPenalty = safety.warning ? -2 : 0;
    return { c, safety, score: base + qScore + hard + focusBonus + priorityBonus + bgPen + warnPenalty };

  });

  scored.sort((a,b)=> b.score - a.score);
  
  const bestRow = scored[0] || null;
  const best = bestRow?.c || null;
  if (!best) return null;
  const warningMsg = bestRow?.safety?.warning || "";

  let why = "Closest safe match";
  if (cons.pain >= 4) why = "Pain filter: avoided provocative option";
  else if (cons.cnsLow) why = "CNS low: avoided heavy/power";
  else if (cons.isMD1) why = "MD-1: kept priming (low fatigue)";
  else if (cons.acwrSpike) why = "ACWR spike: avoided endurance load";
  if (warningMsg) why += ` • ${warningMsg}`;

  // ✅ якщо відсікли по ліміту — пояснимо
  const bg = String(best?.bodyGroup || "").toLowerCase();
  const lim = groupLimits?.[bg];
  if (bg && lim != null) why += ` • bodyGroup=${bg}`;
  if (Array.isArray(priorityCtx?.goals) && priorityCtx.goals.length) {
    why += ` • profile=${priorityCtx.goals.slice(0, 2).join(" + ")}`;
  }

  const outEx = warningMsg ? { ...best, injuryWarning: warningMsg } : { ...best };
  return { ex: outEx, why };
}


function getModeKeyForDay(dayStatus) {
  const coreMode = String(window.__athleteCore?.mode || "");
  return (coreMode === "LIGHT" || coreMode === "REHAB" || coreMode === "REST")
    ? coreMode
    : String(dayStatus || "TRAIN");
}

function getTargetsForDay(dayStatus) {
  const modeKey = getModeKeyForDay(dayStatus);
  const targetsMap = getStatusQualityTargetsMap();
  return targetsMap?.[modeKey]
    || targetsMap?.["TRAIN"]
    || { include: [], exclude: [] };
}

function renderPlanByStagesHTML(plan, opts = {}) {
  const { interactiveSuggested = false } = opts;
  const exs = Array.isArray(plan?.exercises) ? plan.exercises : [];
  if (!exs.length) return "—";

  const stages = ["Pre-Training", "Main Training", "Post-Training"];

  return stages.map(stage => {
    const items = exs
      .map((e, i) => ({ e, i }))
      .filter(x => x.e?.stage === stage);

    if (!items.length) return "";

    const list = items.map(({ e, i }) => {
      const name = resolveExerciseName(e) || "—";
      const qBadges = renderQualityBadgesHTML(e?.qualities);
      
      const btn = interactiveSuggested
        ? `<button type="button"
            onclick="window.saReplaceOneExercise(${i})"
            style="font-size:11px; padding:2px 6px; border:1px solid rgba(255,255,255,.18);
                    background: rgba(255,255,255,.06); color:#fff; border-radius:8px; cursor:pointer;">
            ↻ ${escapeHtml(wt("modalReplace"))}
          </button>`
        : "";

      return `
  <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:8px; padding:2px 0;">
    <div style="min-width:0;">
      <div style="min-width:0;">
  <div style="font-size:12px; line-height:1.2;">• ${escapeHtml(name)}</div>
  ${qBadges}
</div>

      ${e?.whyReplaced ? `<div style="font-size:10px; opacity:.7; margin-top:2px;">${escapeHtml(wt("modalWhyLabel"))}: ${escapeHtml(e.whyReplaced)}</div>` : ``}
      ${e?.injuryWarning ? `<div style="font-size:10px; color:#ffcc66; margin-top:2px;">${escapeHtml(e.injuryWarning)}</div>` : ``}
    </div>
    ${btn}
  </div>
`;

    }).join("");

    return `
      <div style="margin-bottom:8px;">
        <div style="font-size:11px; font-weight:900; letter-spacing:0.06em; color:#d4af37; margin-bottom:3px;">${stageDisplayName(stage)}</div>

        <div style="display:grid; gap:2px;">${list}</div>
      </div>
    `;
  }).join("") || "—";
}

function rerenderSuggestModalPlans(wrap) {
  const baseBox = wrap.querySelector("#coreSuggestBase");
  const sugBox  = wrap.querySelector("#coreSuggestSuggested");

  const basePlan = wrap.__basePlan || { exercises: [] };
  const sugPlan  = wrap.__suggestedPlan || { exercises: [] };

  if (baseBox) baseBox.innerHTML = renderPlanByStagesHTML(basePlan, { interactiveSuggested: false });
  if (sugBox)  sugBox.innerHTML  = renderPlanByStagesHTML(sugPlan,  { interactiveSuggested: true  });
}
function buildSmartRecommendations(core, signals, dayStatus) {
  const out = [];

  const risk = Number(core?.risk ?? 0) || 0;
  const mode = String(core?.mode || "TRAIN");

  const inj = signals?.injury || null;
  const pain = Number(inj?.pain ?? 0) || 0;
  const loc = String(inj?.location || "").toLowerCase();

  const wellness = signals?.wellness || null;
  const cns = computeCNSScore(wellness); // у тебе вже є ця функція

  const acwr = getACWRFromAnywhere(window.__athleteCore, window.__athleteSignals);


  // Вага/дієта (у тебе вже є логіка trendMode)
  const wr = signals?.weightRecent || [];
  const sorted = wr.slice().sort((a,b)=> (String(a.date||"") > String(b.date||"") ? 1 : -1));
  const currW = sorted.length ? sorted[sorted.length - 1] : signals?.weight;
  const prevW = sorted.length >= 2 ? sorted[sorted.length - 2] : null;
  const currKg = Number(currW?.weight ?? currW?.kg ?? currW?.bodyMass ?? currW?.value ?? NaN);
  const prevKg = Number(prevW?.weight ?? prevW?.kg ?? prevW?.bodyMass ?? prevW?.value ?? NaN);
  let trendMode = "UNKNOWN";
  if (Number.isFinite(currKg) && Number.isFinite(prevKg)) {
    const d = currKg - prevKg;
    if (Math.abs(d) < 0.3) trendMode = "MAINTAIN";
    else if (d < -0.3) trendMode = "CUT";
    else trendMode = "GAIN";
  }

  // 1) Головний режим від core
  if (mode === "REST") out.push(wt("smartRecRest"));
  if (mode === "REHAB") out.push(wt("smartRecRehab"));
  if (mode === "LIGHT") out.push(wt("smartRecLight"));
  if (dayStatus === "MD-1") out.push(wt("smartRecMd1"));

  // 2) Pain — найважливіше, бо “не зробити гірше”
  if (pain >= 7) out.push(wtFormat("smartRecPainHigh", { pain, location: inj?.location || "—" }));
  else if (pain >= 4) out.push(wtFormat("smartRecPainModerate", { pain, location: inj?.location || "—" }));

  // 3) CNS readiness — впливає на max strength / power / speed
  if (Number.isFinite(cns?.score)) {
    if (cns.score < 60) out.push(wtFormat("smartRecCnsLow", { cns: cns.score }));
    else if (cns.score < 80) out.push(wtFormat("smartRecCnsModerate", { cns: cns.score }));
  }

  // 4) Load spike (ACWR) — більше про біг/витривалість
  if (acwr != null) {
    if (acwr >= 1.5) out.push(wtFormat("smartRecAcwrSpike", { acwr: acwr.toFixed(2) }));
    else if (acwr >= 1.3) out.push(wtFormat("smartRecAcwrHigh", { acwr: acwr.toFixed(2) }));
  }

  // 5) Cutting — часто падає “power/strength output”
  if (trendMode === "CUT") out.push(wt("smartRecTrendCut"));
  if (trendMode === "GAIN") out.push(wt("smartRecTrendGain"));

  // 6) Якщо взагалі пусто — дефолт
  if (!out.length) out.push(wt("smartRecDefaultStable"));

  // максимум 4 рядки, як ти хочеш
  return out.slice(0, 4);
}

function ensureMinExercises(plan, signals, dayStatus, stageTargets = null) {
  const perStage = stageTargets || { "Pre-Training": 4, "Main Training": 6, "Post-Training": 3 };

  const out = deepClone(plan || { exercises: [] });
  out.exercises = Array.isArray(out.exercises) ? out.exercises : [];

  const used = new Set(
    out.exercises.map(e => String(e?.name || "").toLowerCase()).filter(Boolean)
  );
    // ✅ лічильники груп тіла (legs / upperbody / core)
  const groupCounts = countBodyGroups(out.exercises);
  
  // 🧠 Визначаємо, що було в Main Training
const mainGroups = new Set(
  out.exercises
    .filter(e => e.stage === "Main Training")
    .map(e => String(e.bodyGroup || "").toLowerCase().trim())
    .filter(Boolean)
);


  const stages = ["Pre-Training", "Main Training", "Post-Training"];

  for (const stage of stages) {
    const want = Number(perStage[stage] || 0);
    if (want <= 0) continue;

    const now = out.exercises.filter(e => (e.stage || "Main Training") === stage).length;
    let need = want - now;
    if (need <= 0) continue;

    let tries = 0;
    while (need > 0 && tries < 60) {
      tries++;

      const dummyCurrent = { name: "__dummy__", category: "" };

      const focus = getDayFocus(dayStatus, window.__athleteCore?.mode);

const res = pickReplacementExerciseSmart(
  dummyCurrent,
  stage,
  signals,
  dayStatus,
  {
    alreadyUsed: used,
    focus,
    groupCounts,
    preferredRecoveryGroups:
      stage === "Post-Training" ? [...mainGroups] : null
  }
);




      if (!res?.ex) continue;

      const nm = String(res.ex.name || "").toLowerCase();
      if (!nm || used.has(nm)) continue;

      used.add(nm);

      // ✅ оновлюємо групи
      const bg = String(res.ex.bodyGroup || "").toLowerCase().trim();
      if (bg) groupCounts[bg] = (groupCounts[bg] || 0) + 1;

      out.exercises.push({
        ...res.ex,
        stage,
        whyReplaced: wtFormat("modalWhyAutoFilled", { why: res.why })
      });

      need--;
    }
  }

  return out;
}

function generateSmartDayPlan(dayStatus, signals, stageTargets) {
  // 1) стартуємо з порожнього дня
  const empty = { exercises: [] };

  // 2) добиваємо потрібну кількість вправ, але вже під modeKey (див. правку ensureMinExercises)
  const filled = ensureMinExercises(
    empty,
    signals || {},
    dayStatus,
    stageTargets || { "Pre-Training": 4, "Main Training": 6, "Post-Training": 3 }
  );

  // 3) страховка: прибрати те, чого нема в бібліотеці / що unsafe
  return sanitizePlanToLibrary(filled, signals || {}, dayStatus);
}

function openSuggestedPlanModal({ core, dayIndex, dayStatus }) {
  const expectedUid = expectedWeeklyCoreUserId();
  const resolvedUid = resolvedWeeklyCoreUserId();
  if (!core || !expectedUid || !resolvedUid || expectedUid !== resolvedUid) {
    console.warn("Blocked openSuggestedPlanModal due athlete core mismatch", {
      expectedUid,
      resolvedUid,
      hasCore: Boolean(core)
    });
    alert(wt("modalContextMismatch"));
    return;
  }

  const wrap = ensureSuggestionModal();
  const { dayNames, current, proposed } = buildProposedDayStatuses(core);

  const titleEl = wrap.querySelector("#coreSuggestTitle");
  const subEl = wrap.querySelector("#coreSuggestSubtitle");
  const reasonsEl = wrap.querySelector("#coreSuggestReasons");
const recsEl = wrap.querySelector("#coreSuggestRecs");
const injuryEl = wrap.querySelector("#coreSuggestInjury");
const wellnessEl = wrap.querySelector("#coreSuggestWellness");
const loadEl = wrap.querySelector("#coreSuggestLoad");
const bodyMassEl = wrap.querySelector("#coreSuggestBodyMass");
const powerEl = wrap.querySelector("#coreSuggestPower");
const pillEl = wrap.querySelector("#coreSuggestVerdictPill");
const verdictTextEl = wrap.querySelector("#coreSuggestVerdictText");
const dayChipEl = wrap.querySelector("#coreSuggestDayChip");

const overall = getOverallSeverity(core, window.__athleteSignals || {});
const mode = String(core?.mode || "TRAIN");

const pillText =
  overall === "bad"  ? `${wt("modalPillRed")} • ${mode}` :
  overall === "warn" ? `${wt("modalPillYellow")} • ${mode}` :
                       `${wt("modalPillGreen")} • ${mode}`;

if (pillEl) {
  pillEl.textContent = pillText;

  pillEl.style.border =
    overall === "bad"  ? "1px solid rgba(255,90,90,0.55)" :
    overall === "warn" ? "1px solid rgba(255,200,90,0.45)" :
                         "1px solid rgba(90,200,120,0.45)";

  pillEl.style.boxShadow =
    overall === "bad"  ? "0 0 0 2px rgba(255,90,90,0.25), 0 10px 30px rgba(255,90,90,0.15)" :
    overall === "warn" ? "0 0 0 2px rgba(255,200,90,0.20), 0 10px 30px rgba(255,200,90,0.12)" :
                         "0 0 0 2px rgba(90,200,120,0.20), 0 10px 30px rgba(90,200,120,0.12)";
}

// verdict text лишаємо (або трохи підсилюємо нижче)
const v = buildVerdict(core);
if (verdictTextEl) verdictTextEl.textContent = v.text;
if (pillEl) {
  pillEl.title =
    overall === "bad"
      ? `❗ ${wt("modalHintHigh")}`
      : overall === "warn"
      ? `⚠️ ${wt("modalHintModerate")}`
      : `✅ ${wt("modalHintOk")}`;
}

if (dayChipEl) dayChipEl.textContent = wtFormat("modalDayChip", { day: dayIndex, status: dayStatus });

  const traffic = core.traffic || "green";
  const dot = traffic === "red" ? "🔴" : traffic === "yellow" ? "🟡" : "🟢";

  titleEl.textContent = `${dot} ${wtFormat("modalTitleRisk", { risk: core.risk, mode: core.mode })}`;
  const subtitleUid = String(window.currentUserId || expectedUid || "").trim();
  setSuggestedSubtitle(subEl, subtitleUid || "—");
  if (subEl) {
    const reqKey = `${subtitleUid}:${Date.now()}`;
    subEl.dataset.athleteReqKey = reqKey;
    resolveWeeklyAthleteName(subtitleUid).then((resolvedName) => {
      if (!subEl || subEl.dataset.athleteReqKey !== reqKey) return;
      setSuggestedSubtitle(subEl, resolvedName);
    }).catch(() => null);
  }
  const inj = window.__athleteSignals?.injury || window.__injuryData || null;
if (injuryEl) {
  const html = renderInjurySummaryCard(inj);
  injuryEl.innerHTML = wrapWithGlow("injury", html, core, window.__athleteSignals || {});
}


  const wellness = window.__athleteSignals?.wellness || null;
if (wellnessEl) {
  const html = renderWellnessSummaryCard(wellness, window.__athleteSignals);
  wellnessEl.innerHTML = wrapWithGlow("wellness", html, core, window.__athleteSignals || {});
}


// ===== BODY MASS (from weightRecent) =====
const wr = window.__athleteSignals?.weightRecent || [];
const sorted = wr.slice().sort((a,b)=> (String(a.date||"") > String(b.date||"") ? 1 : -1));

const currW = sorted.length ? sorted[sorted.length - 1] : window.__athleteSignals?.weight;
const prevW = sorted.length >= 2 ? sorted[sorted.length - 2] : null;

// вага
const currKg = Number(currW?.weight ?? currW?.kg ?? currW?.bodyMass ?? currW?.value ?? NaN);
const prevKg = Number(prevW?.weight ?? prevW?.kg ?? prevW?.bodyMass ?? prevW?.value ?? NaN);

// дата
const currDate = currW?.date || null;
const prevDate = prevW?.date || null;

// GOAL режим (з твоєї weight.js логіки, якщо є)
const goalMode = currW?.analysis?.mode || currW?.mode || null;

// TREND режим (факт: cut/maintain/gain)
let trendMode = "UNKNOWN";
let delta = null;

if (Number.isFinite(currKg) && Number.isFinite(prevKg)) {
  delta = currKg - prevKg;
  if (Math.abs(delta) < 0.3) trendMode = "MAINTAIN";
  else if (delta < -0.3) trendMode = "CUT";
  else trendMode = "GAIN";
}

// рендер
if (bodyMassEl) {
  const html = renderBodyMassCardV2(
    { kg: currKg, date: currDate, goalMode },
    { kg: prevKg, date: prevDate },
    { trendMode, delta }
  );
  bodyMassEl.innerHTML = wrapWithGlow("bodymass", html, core, window.__athleteSignals || {});
}


if (powerEl) {
  function renderPowerCard(core, signals) {
  const p = signals?.power || null;
  if (!p) return renderPowerPlaceholderCard();

  const best = Number(p.best_cm ?? 0);
  const avg  = Number(p.avg_cm ?? 0);
  const fat  = Number(p.fatigue_pct ?? 0);
  const imp  = Number(p.improve_pct ?? 0);
  const cnt  = Number(p.count ?? 0);
  const date = String(p.date || "—");

  const trend = (imp > 0)
    ? `${wt("modalImprove")} +${imp}%`
    : `${wt("modalFatigue")} ${fat}%`;
  const level = (fat >= 20) ? "bad" : (fat >= 10 ? "warn" : "ok");

  return `
    <div class="sa-card" style="border:1px solid #2a2a2a; padding:12px; border-radius:10px; margin:10px 0;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
        <div style="font-weight:700;">${escapeHtml(wt("modalPowerCMJ"))}</div>
        <div style="font-size:12px; opacity:.7;">${date}</div>
      </div>

      <div style="display:flex; gap:8px; flex-wrap:wrap; margin:8px 0;">
        <span class="chip">${escapeHtml(wt("modalJumps"))} ${cnt}</span>
        <span class="chip">${escapeHtml(wt("modalBest"))} ${best.toFixed(1)}cm</span>
        <span class="chip">${escapeHtml(wt("modalAvg"))} ${avg.toFixed(1)}cm</span>
        <span class="chip ${level}">${trend}</span>
      </div>

      <div style="opacity:.85; font-size:13px; line-height:1.35;">
        ${fat >= 20 ? `⚠️ ${escapeHtml(wt("modalPowerStrongFatigue"))}` :
          fat >= 10 ? `⚠️ ${escapeHtml(wt("modalPowerModerateFatigue"))}` :
          imp > 0 ? `✅ ${escapeHtml(wt("modalPowerActivationOk"))}` :
          `✅ ${escapeHtml(wt("modalPowerStable"))}`}
      </div>
    </div>
  `;
}

  const html = renderPowerCard(core, window.__athleteSignals || {});
  powerEl.innerHTML = wrapWithGlow("power", html, core, window.__athleteSignals || {});
}




  const acwr = getACWRFromAnywhere(window.__athleteCore, window.__athleteSignals);
  const acwrDbg = getACWRFromAnywhere(window.__athleteCore, window.__athleteSignals);
const phaseDbg = getSeasonPhase(core, window.__athleteSignals);
const zoneDbg = SEASON_LOAD_ZONES[phaseDbg];


if (loadEl) {
  const html = renderLoadSummaryCard(acwr, core, window.__athleteSignals || {});
  loadEl.innerHTML = wrapWithGlow("load", html, core, window.__athleteSignals || {});
}


const hasBad =
  ["injury","wellness","load","bodymass","power"]
    .some(k => getSectionSeverity(k, core, window.__athleteSignals || {}) === "bad");

const hasWarn =
  ["injury","wellness","load","bodymass","power"]
    .some(k => getSectionSeverity(k, core, window.__athleteSignals || {}) === "warn");

const toggle = document.getElementById("coreSuggestDetailsToggle");
if (toggle) {
  if (hasBad) {
    toggle.style.boxShadow = "0 0 0 2px rgba(255,90,90,0.18)";
  } else if (hasWarn) {
    toggle.style.boxShadow = "0 0 0 2px rgba(255,200,90,0.14)";
  } else {
    toggle.style.boxShadow = "none";
  }
}


  const reasons = Array.isArray(core.reasons) ? core.reasons : [];
const reasonsClean = reasons.filter(r => {
  const s = String(r || "").toLowerCase();
  if (s.includes("acwr")) return false;
  if (s.includes("сумарний ризик")) return false;
  return true;
});



reasonsEl.innerHTML =
  reasonsClean.slice(0, 4).map(r => `• ${r}`).join("<br>") ||
  `• ${escapeHtml(wt("modalNoReasons"))}`;

// ✅ ОЦЕ ВСТАВ СЮДИ
const coreRecs =
  Array.isArray(core?.recommendations) ? core.recommendations :
  Array.isArray(core?.details?.recommendations) ? core.details.recommendations :
  Array.isArray(core?.coach?.recommendations) ? core.coach.recommendations :
  [];


// якщо AthleteCore ще не дає recommendations — генеруємо локально з сигналів
const smartRecs = buildSmartRecommendations(core, window.__athleteSignals || {}, dayStatus);

const finalRecs = (Array.isArray(coreRecs) && coreRecs.length > 0) ? coreRecs : smartRecs;

if (recsEl) {
  recsEl.innerHTML = (finalRecs && finalRecs.length)
    ? finalRecs.slice(0, 4).map(r => `• ${escapeHtml(r)}`).join("<br>")
    : `• ${escapeHtml(wt("modalNoRecs"))}`;
}




  // days grid
  // ✅ PREVIEW Base vs Suggested (для конкретного дня)
  const weekStatuses = getWeekFinalStatuses();
const planData = ensureStatusPlansExist(weekStatuses);
const occ = getStatusOccurrenceIndex(dayIndex, weekStatuses, dayStatus);

let basePlan = getPlanVariant(planData, dayStatus, occ);
if (!basePlan) basePlan = { exercises: [] };

// ❌ НІЯКИХ dayPlanOverrides — модалка не бронює день
const finalBasePlan = basePlan;




// suggested = base або адаптований
// suggested = base або адаптований
const rawSuggestedPlan =
  (core?.mode && typeof window.adaptPlan === "function")
    ? window.adaptPlan(finalBasePlan, core.mode, window.__athleteSignals, { dayIndex, dayStatus })
    : finalBasePlan;

// ✅ ВАЖЛИВО: прибираємо/замінюємо все, чого немає в EXERCISE_LIBRARY
const suggestedSanitized = sanitizePlanToLibrary(
  rawSuggestedPlan,
  window.__athleteSignals || {},
  dayStatus
);

// ✅ NEW: спочатку прибираємо подразники
const suggestedPruned = prunePlanIrritants(
  suggestedSanitized,
  window.__athleteSignals || {},
  dayStatus
);

// ✅ потім добиваємо мінімум безпечними вправами
const suggestedPlanFilled = ensureMinExercises(
  suggestedPruned,
  window.__athleteSignals || {},
  dayStatus,
  { "Pre-Training": 4, "Main Training": 6, "Post-Training": 3 }
);




const baseBox = wrap.querySelector("#coreSuggestBase");
const sugBox  = wrap.querySelector("#coreSuggestSuggested");

// ✅ збережемо base + suggested в wrap (для live replace)
wrap.__suggestedDayIndex = dayIndex;
wrap.__suggestedDayStatus = dayStatus;
wrap.__basePlan = deepClone(finalBasePlan);
wrap.__suggestedPlan = deepClone(suggestedPlanFilled);



// ✅ глобальний хендлер заміни 1 вправи (працює лише поки модалка відкрита)
window.saReplaceOneExercise = function(exIndex) {
  const w = document.getElementById("coreSuggestModal");
  if (!w || !w.__suggestedPlan) return;

  const exs = Array.isArray(w.__suggestedPlan.exercises) ? w.__suggestedPlan.exercises : [];
  const current = exs[exIndex];
  if (!current) return;

  const stage = current.stage || "Main Training";
  const dayStatus = w.__suggestedDayStatus || "";
const alreadyUsed = new Set(
  (exs || []).map(x => String(x?.name || "").toLowerCase()).filter(Boolean)
);

const res = pickReplacementExerciseSmart(
  current,
  stage,
  window.__athleteSignals,
  dayStatus,
  { alreadyUsed }
);

if (!res || !res.ex) {
  alert(`ℹ️ ${wt("modalNoSafeAlternativeStage")}`);
  return;
}

// ✅ гарантія: не ставимо дубль (але дозволяємо заміну саме цієї вправи)
const nextName = String(res.ex.name || "").toLowerCase();
const currName = String(current?.name || "").toLowerCase();

if (nextName && alreadyUsed.has(nextName) && nextName !== currName) {
  // пробуємо ще раз до 5 спроб, щоб не застрягати
  let attempts = 0;
  let alt = res;

  while (attempts < 5) {
    attempts++;
    alt = pickReplacementExerciseSmart(
      current,
      stage,
      window.__athleteSignals,
      dayStatus,
      { alreadyUsed }
    );

    if (alt?.ex) {
      const nm = String(alt.ex.name || "").toLowerCase();
      if (nm && (!alreadyUsed.has(nm) || nm === currName)) break;
    }
  }

  if (!alt?.ex) {
    alert(`ℹ️ ${wt("modalNoSafeAlternative")}`);
    return;
  }

  res.ex = alt.ex;
  res.why = alt.why;
}

// ✅ ОЦЕ і є заміна 1 вправи
exs[exIndex] = { ...res.ex, stage, whyReplaced: res.why };

w.__suggestedPlan.exercises = exs;
rerenderSuggestModalPlans(w);

}

// ✅ первинний рендер по стадіях + кнопки replace в suggested
rerenderSuggestModalPlans(wrap);



  // apply handler
  const btnApply = wrap.querySelector("#coreSuggestApply");
btnApply.onclick = async () => {
  const di = wrap.__suggestedDayIndex;
  const sp = wrap.__suggestedPlan;

  if (typeof di !== "number" || !sp) {
    alert(`❌ ${wt("modalNoSuggestedPlanApply")}`);
    return;
  }

  await applySuggestedTrainingToStatusVariant(core, di, dayStatus, sp);
  wrap.style.display = "none";
};



  wrap.style.display = "block";
} 



async function applySuggestedTrainingToStatusVariant(core, dayIndex, status, suggestedPlan) {
  if (!(window.canCoachEdit || window.isAdmin)) {
    alert(wt("coachOnlyApply"));
    return;
  }

  const weekStatuses = getWeekFinalStatuses();
const variantIndex = getStatusOccurrenceIndex(dayIndex, weekStatuses, status);


  const data = ensureStatusPlansExist(weekStatuses);
  const key = `status_plan_${status}`;

  if (!data[key]) data[key] = [];
  if (data[key] && !Array.isArray(data[key])) data[key] = [data[key]];
  while (data[key].length <= variantIndex) data[key].push({ exercises: [] });

  // ✅ 1) Беремо тільки вправи, які реально існують в EXERCISE_LIBRARY
const sanitized = sanitizePlanToLibrary(
  suggestedPlan,
  window.__athleteSignals || {},
  status
);

// ✅ 2) Записуємо вже "чистий" план (без заборонених/неіснуючих вправ)
const pruned = prunePlanIrritants(
  sanitized,
  window.__athleteSignals || {},
  status
);

data[key][variantIndex] = {
  exercises: Array.isArray(pruned?.exercises) ? pruned.exercises : []
};



  localStorage.setItem(STORAGE_KEY, JSON.stringify(window.PACExerciseTask.ensurePlan(data)));

    // localStorage вже оновлено — просто тригеримо дебаунс сейв
  updateCycleColors();
  schedulePlanSave();   // ✅ debounce 800ms + quiet notify 10s
  alert(`✅ ${wtFormat("modalAppliedTo", { key, index: variantIndex })}`);
}


window.addEventListener('pac:lang-changed', () => {
  applyWeeklyStaticTranslations();
  if (typeof updateCycleColors === "function") updateCycleColors();
  if (typeof renderWeek === "function") renderWeek();
});

function applyHashFocus() {
  const raw = String(window.location.hash || "").replace(/^#/, "");
  if (!raw) return;
  const target = document.getElementById(raw);
  if (!target) return;
  setTimeout(() => {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    const prev = target.style.boxShadow;
    const prevTr = target.style.transition;
    target.style.transition = "box-shadow 0.25s ease";
    target.style.boxShadow = "0 0 0 2px rgba(255,199,44,0.85), 0 0 24px rgba(255,199,44,0.25)";
    setTimeout(() => {
      target.style.boxShadow = prev || "";
      target.style.transition = prevTr || "";
    }, 1800);
  }, 120);
}

window.addEventListener("load", applyHashFocus);
