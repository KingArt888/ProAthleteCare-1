(function () {
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const num = (v, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);

  const inv10 = (score10) => clamp((10 - clamp(num(score10, 0), 0, 10)) * 10, 0, 100);
  const dir10 = (score10) => clamp(clamp(num(score10, 0), 0, 10) * 10, 0, 100);

  const msDay = 24 * 60 * 60 * 1000;
  const nowTs = () => Date.now();
  const CORE_TX = {
    uk: {
      connectedSteps: (n) => `Підключені кроки сьогодні: ${n}.`,
      painHigh: (p, loc) => `Біль високий (${p}/10)${loc ? ` — ${loc}` : ""}.`,
      painModerate: (loc) => `Біль помірний (3/10)${loc ? ` — ${loc}` : ""}.`,
      sleepLow: (v) => `Сон низький (${v}/10).`,
      stressHigh: (v) => `Стрес високий (${v}/10).`,
      readinessLow: (v) => `Готовність низька (${v}/10).`,
      acwrHigh: (v) => `ACWR високий (${v}).`,
      acwrElevated: (v) => `ACWR підвищений (${v}).`,
      noCritical: "Немає критичних червоних сигналів у останніх даних.",
      totalRisk: (v) => `Сумарний ризик: ${v}/100.`,
      restDay: "День відновлення: мобільність 20-30 хв + легка аеробіка Z1.",
      restNo: "Без: спринтів/plyo/важких присідань/ексцентрики.",
      rehabMain: "Rehab: ізометрика + контроль ROM, біль не вище 3/10.",
      rehabSwap: "Заміна: вело/ергометр Z1-Z2 15-25 хв.",
      lightCut: "LIGHT: -30-40% об'єму, прибрати high-speed та plyo.",
      lightFocus: "Фокус: техніка, стабілізація, контрольована сила.",
      md1: "MD-1: мінімум об'єму, прайминг без втоми.",
      painAvoidExplosive: "Поки біль >=4/10: без вибухових вправ на ноги.",
      painControlled: "Біль 3/10: тренування можливе, але без провокуючих вправ.",
      sleepNoMax: "Сон низький: сьогодні без max-effort.",
      stressReduce: "Стрес високий: прибрати CNS-heavy, додати дихання/релакс.",
      acwrSpike: "ACWR spike: зменшити об'єм/інтенсивність на 24-48 год.",
      profilePriority2: (a, b) => `Пріоритет профілю: ${a} -> ${b}.`,
      profilePriority1: (a) => `Пріоритет профілю: ${a}.`,
      profileFocus: (a) => `Фокус профілю: ${a}.`,
      corePriority: (a) => `Пріоритет core-якостей: ${a}.`,
      strengthTrain: "Фокус сили: 3-5 підходів x 3-6 повторів, RPE 7-8, відпочинок 2-3 хв.",
      strengthSafe: "Фокус сили (safe): tempo/isometric 3x6-8, без near-max навантажень.",
      powerFocus: "Фокус потужності: короткі вибухові серії, повне відновлення між спробами.",
      speedFocus: "Фокус швидкості: 4-8 якісних прискорень з повним відпочинком.",
      enduranceFocus: "Фокус витривалості: 12-20 хв Z2 після основної роботи, якщо біль <= 3/10."
    },
    en: {
      connectedSteps: (n) => `Connected steps today: ${n}.`,
      painHigh: (p, loc) => `High pain (${p}/10)${loc ? ` — ${loc}` : ""}.`,
      painModerate: (loc) => `Moderate pain (3/10)${loc ? ` — ${loc}` : ""}.`,
      sleepLow: (v) => `Low sleep (${v}/10).`,
      stressHigh: (v) => `High stress (${v}/10).`,
      readinessLow: (v) => `Low readiness (${v}/10).`,
      acwrHigh: (v) => `ACWR high (${v}).`,
      acwrElevated: (v) => `ACWR elevated (${v}).`,
      noCritical: "No critical red signals in recent data.",
      totalRisk: (v) => `Total risk: ${v}/100.`,
      restDay: "Recovery day: mobility 20-30 min + light aerobic Z1.",
      restNo: "Avoid: sprints/plyo/heavy squats/eccentrics.",
      rehabMain: "Rehab: isometrics + ROM control, pain not above 3/10.",
      rehabSwap: "Replacement: bike/ergometer Z1-Z2 15-25 min.",
      lightCut: "LIGHT: -30-40% volume, remove high-speed and plyo.",
      lightFocus: "Focus: technique, stabilization, controlled strength.",
      md1: "MD-1: minimum volume, priming without fatigue.",
      painAvoidExplosive: "While pain is >=4/10: no explosive leg exercises.",
      painControlled: "Pain 3/10: training allowed, but avoid provocative exercises.",
      sleepNoMax: "Low sleep: no max-effort today.",
      stressReduce: "High stress: remove CNS-heavy work, add breathing/relaxation.",
      acwrSpike: "ACWR spike: reduce volume/intensity for 24-48h.",
      profilePriority2: (a, b) => `Profile priority: ${a} -> ${b}.`,
      profilePriority1: (a) => `Profile priority: ${a}.`,
      profileFocus: (a) => `Profile focus: ${a}.`,
      corePriority: (a) => `Core quality priority: ${a}.`,
      strengthTrain: "Strength focus: 3-5 sets x 3-6 reps, RPE 7-8, 2-3 min rest.",
      strengthSafe: "Strength focus (safe): tempo/isometric work 3x6-8, avoid near-max loading.",
      powerFocus: "Power focus: short explosive sets, full recovery between attempts.",
      speedFocus: "Speed focus: 4-8 high-quality accelerations with full rest.",
      enduranceFocus: "Endurance focus: add 12-20 min Z2 after main work if pain <= 3/10."
    },
    de: {
      connectedSteps: (n) => `Verbundene Schritte heute: ${n}.`,
      painHigh: (p, loc) => `Hoher Schmerz (${p}/10)${loc ? ` — ${loc}` : ""}.`,
      painModerate: (loc) => `Mäßiger Schmerz (3/10)${loc ? ` — ${loc}` : ""}.`,
      sleepLow: (v) => `Schlaf niedrig (${v}/10).`,
      stressHigh: (v) => `Stress hoch (${v}/10).`,
      readinessLow: (v) => `Bereitschaft niedrig (${v}/10).`,
      acwrHigh: (v) => `ACWR hoch (${v}).`,
      acwrElevated: (v) => `ACWR erhöht (${v}).`,
      noCritical: "Keine kritischen roten Signale in den letzten Daten.",
      totalRisk: (v) => `Gesamtrisiko: ${v}/100.`,
      restDay: "Recovery-Tag: Mobilität 20-30 Min + leichtes aerobes Z1.",
      restNo: "Vermeiden: Sprints/Plyo/schwere Kniebeugen/Eccentrics.",
      rehabMain: "Rehab: Isometrik + ROM-Kontrolle, Schmerz nicht über 3/10.",
      rehabSwap: "Alternative: Bike/Ergometer Z1-Z2 15-25 Min.",
      lightCut: "LIGHT: -30-40% Volumen, high-speed und plyo entfernen.",
      lightFocus: "Fokus: Technik, Stabilisierung, kontrollierte Kraft.",
      md1: "MD-1: Mindestvolumen, Priming ohne Ermüdung.",
      painAvoidExplosive: "Bei Schmerz >=4/10: keine explosiven Beinübungen.",
      painControlled: "Schmerz 3/10: Training möglich, aber provokative Übungen vermeiden.",
      sleepNoMax: "Schlaf niedrig: heute kein Maximaltraining.",
      stressReduce: "Stress hoch: CNS-heavy reduzieren, Atmung/Entspannung ergänzen.",
      acwrSpike: "ACWR-Spike: Volumen/Intensität für 24-48h senken.",
      profilePriority2: (a, b) => `Profilpriorität: ${a} -> ${b}.`,
      profilePriority1: (a) => `Profilpriorität: ${a}.`,
      profileFocus: (a) => `Profilfokus: ${a}.`,
      corePriority: (a) => `Core-Qualitätspriorität: ${a}.`,
      strengthTrain: "Kraftfokus: 3-5 Sätze x 3-6 Wdh., RPE 7-8, 2-3 Min Pause.",
      strengthSafe: "Kraftfokus (safe): Tempo/Isometrik 3x6-8, kein Near-Max.",
      powerFocus: "Power-Fokus: kurze explosive Sätze mit voller Erholung.",
      speedFocus: "Speed-Fokus: 4-8 hochwertige Beschleunigungen mit voller Pause.",
      enduranceFocus: "Ausdauerfokus: 12-20 Min Z2 nach der Hauptarbeit, wenn Schmerz <= 3/10."
    },
    es: {
      connectedSteps: (n) => `Pasos conectados hoy: ${n}.`,
      painHigh: (p, loc) => `Dolor alto (${p}/10)${loc ? ` — ${loc}` : ""}.`,
      painModerate: (loc) => `Dolor moderado (3/10)${loc ? ` — ${loc}` : ""}.`,
      sleepLow: (v) => `Sueño bajo (${v}/10).`,
      stressHigh: (v) => `Estrés alto (${v}/10).`,
      readinessLow: (v) => `Preparación baja (${v}/10).`,
      acwrHigh: (v) => `ACWR alto (${v}).`,
      acwrElevated: (v) => `ACWR elevado (${v}).`,
      noCritical: "No hay señales críticas rojas en los datos recientes.",
      totalRisk: (v) => `Riesgo total: ${v}/100.`,
      restDay: "Día de recuperación: movilidad 20-30 min + aeróbico suave Z1.",
      restNo: "Evitar: sprints/plyo/sentadillas pesadas/ excéntricos.",
      rehabMain: "Rehab: isométricos + control de ROM, dolor no mayor a 3/10.",
      rehabSwap: "Sustitución: bici/ergómetro Z1-Z2 15-25 min.",
      lightCut: "LIGHT: -30-40% de volumen, quitar high-speed y plyo.",
      lightFocus: "Enfoque: técnica, estabilización, fuerza controlada.",
      md1: "MD-1: volumen mínimo, activación sin fatiga.",
      painAvoidExplosive: "Mientras dolor >=4/10: sin ejercicios explosivos de piernas.",
      painControlled: "Dolor 3/10: se puede entrenar, pero sin ejercicios provocativos.",
      sleepNoMax: "Sueño bajo: hoy sin max-effort.",
      stressReduce: "Estrés alto: quitar CNS-heavy, añadir respiración/relajación.",
      acwrSpike: "Pico ACWR: reducir volumen/intensidad por 24-48h.",
      profilePriority2: (a, b) => `Prioridad del perfil: ${a} -> ${b}.`,
      profilePriority1: (a) => `Prioridad del perfil: ${a}.`,
      profileFocus: (a) => `Foco del perfil: ${a}.`,
      corePriority: (a) => `Prioridad de cualidades core: ${a}.`,
      strengthTrain: "Foco fuerza: 3-5 series x 3-6 reps, RPE 7-8, descanso 2-3 min.",
      strengthSafe: "Foco fuerza (safe): tempo/isométricos 3x6-8, evitar cargas near-max.",
      powerFocus: "Foco potencia: series explosivas cortas con recuperación completa.",
      speedFocus: "Foco velocidad: 4-8 aceleraciones de alta calidad con pausa completa.",
      enduranceFocus: "Foco resistencia: añadir 12-20 min Z2 tras el trabajo principal si dolor <= 3/10."
    },
    ru: {
      connectedSteps: (n) => `Подключенные шаги сегодня: ${n}.`,
      painHigh: (p, loc) => `Боль высокая (${p}/10)${loc ? ` — ${loc}` : ""}.`,
      painModerate: (loc) => `Боль умеренная (3/10)${loc ? ` — ${loc}` : ""}.`,
      sleepLow: (v) => `Сон низкий (${v}/10).`,
      stressHigh: (v) => `Стресс высокий (${v}/10).`,
      readinessLow: (v) => `Готовность низкая (${v}/10).`,
      acwrHigh: (v) => `ACWR высокий (${v}).`,
      acwrElevated: (v) => `ACWR повышенный (${v}).`,
      noCritical: "Критических красных сигналов в последних данных нет.",
      totalRisk: (v) => `Суммарный риск: ${v}/100.`,
      restDay: "День восстановления: мобилити 20-30 мин + легкая аэробика Z1.",
      restNo: "Без: спринтов/plyo/тяжелых приседаний/эксцентрики.",
      rehabMain: "Rehab: изометрика + контроль ROM, боль не выше 3/10.",
      rehabSwap: "Замена: вело/эргометр Z1-Z2 15-25 мин.",
      lightCut: "LIGHT: -30-40% объема, убрать high-speed и plyo.",
      lightFocus: "Фокус: техника, стабилизация, контролируемая сила.",
      md1: "MD-1: минимум объема, прайминг без усталости.",
      painAvoidExplosive: "Пока боль >=4/10: без взрывных упражнений на ноги.",
      painControlled: "Боль 3/10: тренироваться можно, но без провоцирующих упражнений.",
      sleepNoMax: "Сон низкий: сегодня без max-effort.",
      stressReduce: "Стресс высокий: убрать CNS-heavy, добавить дыхание/релакс.",
      acwrSpike: "ACWR spike: снизить объем/интенсивность на 24-48 ч.",
      profilePriority2: (a, b) => `Приоритет профиля: ${a} -> ${b}.`,
      profilePriority1: (a) => `Приоритет профиля: ${a}.`,
      profileFocus: (a) => `Фокус профиля: ${a}.`,
      corePriority: (a) => `Приоритет core-качеств: ${a}.`,
      strengthTrain: "Фокус силы: 3-5 подходов x 3-6 повторов, RPE 7-8, отдых 2-3 мин.",
      strengthSafe: "Фокус силы (safe): tempo/isometric 3x6-8, без near-max нагрузок.",
      powerFocus: "Фокус мощности: короткие взрывные серии с полным восстановлением.",
      speedFocus: "Фокус скорости: 4-8 качественных ускорений с полным отдыхом.",
      enduranceFocus: "Фокус выносливости: 12-20 мин Z2 после основной работы, если боль <= 3/10."
    },
    pt: {
      connectedSteps: (n) => `Passos conectados hoje: ${n}.`,
      painHigh: (p, loc) => `Dor alta (${p}/10)${loc ? ` — ${loc}` : ""}.`,
      painModerate: (loc) => `Dor moderada (3/10)${loc ? ` — ${loc}` : ""}.`,
      sleepLow: (v) => `Sono baixo (${v}/10).`,
      stressHigh: (v) => `Estresse alto (${v}/10).`,
      readinessLow: (v) => `Prontidão baixa (${v}/10).`,
      acwrHigh: (v) => `ACWR alto (${v}).`,
      acwrElevated: (v) => `ACWR elevado (${v}).`,
      noCritical: "Sem sinais críticos vermelhos nos dados recentes.",
      totalRisk: (v) => `Risco total: ${v}/100.`,
      restDay: "Dia de recuperação: mobilidade 20-30 min + aeróbico leve Z1.",
      restNo: "Evitar: sprints/plyo/agachamentos pesados/excêntricos.",
      rehabMain: "Rehab: isometria + controle de ROM, dor não acima de 3/10.",
      rehabSwap: "Substituição: bike/ergômetro Z1-Z2 15-25 min.",
      lightCut: "LIGHT: -30-40% de volume, remover high-speed e plyo.",
      lightFocus: "Foco: técnica, estabilização, força controlada.",
      md1: "MD-1: volume mínimo, ativação sem fadiga.",
      painAvoidExplosive: "Enquanto dor >=4/10: sem exercícios explosivos de pernas.",
      painControlled: "Dor 3/10: treino possível, mas sem exercícios provocativos.",
      sleepNoMax: "Sono baixo: hoje sem max-effort.",
      stressReduce: "Estresse alto: remover CNS-heavy, adicionar respiração/relaxamento.",
      acwrSpike: "Pico de ACWR: reduzir volume/intensidade por 24-48h.",
      profilePriority2: (a, b) => `Prioridade do perfil: ${a} -> ${b}.`,
      profilePriority1: (a) => `Prioridade do perfil: ${a}.`,
      profileFocus: (a) => `Foco do perfil: ${a}.`,
      corePriority: (a) => `Prioridade de qualidades core: ${a}.`,
      strengthTrain: "Foco de força: 3-5 séries x 3-6 reps, RPE 7-8, descanso 2-3 min.",
      strengthSafe: "Foco de força (safe): tempo/isométrico 3x6-8, evitar cargas near-max.",
      powerFocus: "Foco de potência: séries explosivas curtas com recuperação total.",
      speedFocus: "Foco de velocidade: 4-8 acelerações de alta qualidade com descanso total.",
      enduranceFocus: "Foco de endurance: adicionar 12-20 min Z2 após o treino principal se dor <= 3/10."
    }
  };
  function coreLang() {
    try {
      const raw = String(window?.localStorage?.getItem("pac_lang") || "").toLowerCase();
      const normalized = raw === "ua" ? "uk" : raw;
      return CORE_TX[normalized] ? normalized : "en";
    } catch {
      return "en";
    }
  }

  function pickTs(d) {
    if (d?.timestamp?.toDate) return d.timestamp.toDate().getTime();
    if (typeof d?.timestamp === "number") return d.timestamp;
    if (typeof d?.timestamp === "string") {
      const t = new Date(d.timestamp).getTime();
      if (!isNaN(t)) return t;
    }
    if (typeof d?.date === "string") {
      const t = new Date(d.date).getTime();
      if (!isNaN(t)) return t;
    }
    return 0;
  }

  function inLastDays(arr, days) {
    const cut = nowTs() - days * msDay;
    return (Array.isArray(arr) ? arr : []).filter(x => pickTs(x) >= cut);
  }

  function avg(arr) {
    if (!arr.length) return null;
    const s = arr.reduce((a, b) => a + b, 0);
    return s / arr.length;
  }

  function latestPain(injury) {
    if (!injury) return { pain: 0, location: null, date: null };
    const hist = Array.isArray(injury.history) ? injury.history.slice() : null;
    if (hist && hist.length) {
      hist.sort((a, b) => String(a.date || "").localeCompare(String(b.date || "")));
      const last = hist[hist.length - 1] || {};
      return {
        pain: num(last.pain, num(injury.pain, 0)),
        location: injury.location || null,
        date: last.date || injury.date || null,
      };
    }
    return { pain: num(injury.pain, 0), location: injury.location || null, date: injury.date || null };
  }

  function painRisk(pain10) {
    const p = clamp(num(pain10, 0), 0, 10);
    if (p <= 1) return 0;
    if (p === 2) return 25;
    if (p === 3) return 55;
    if (p <= 5) return 75;
    if (p <= 7) return 90;
    return 100;
  }

  function wellnessPack(wellnessLatest, wellnessRecent, connectedLatest) {
    const latest = wellnessLatest?.scores || wellnessLatest || {};
    const recent28 = Array.isArray(wellnessRecent) ? wellnessRecent : [];

    const w7 = inLastDays(recent28, 7).map(x => x?.scores || x || {});
    const w28 = inLastDays(recent28, 28).map(x => x?.scores || x || {});

    const pick = (arr, k) => arr.map(o => num(o?.[k], null)).filter(v => v !== null);

    const sleep7 = avg(pick(w7, "sleep"));
    const sleep28 = avg(pick(w28, "sleep"));
    const stress7 = avg(pick(w7, "stress"));
    const stress28 = avg(pick(w28, "stress"));
    const ready7 = avg(pick(w7, "ready"));
    const ready28 = avg(pick(w28, "ready"));
    const sore7 = avg(pick(w7, "soreness"));
    const sore28 = avg(pick(w28, "soreness"));

    // latest fallback if no averages exist
    const connectedSleepScore = Number.isFinite(Number(connectedLatest?.sleepHours))
      ? clamp((Number(connectedLatest.sleepHours) / 8) * 10, 0, 10)
      : null;
    const connectedReadyScore = Number.isFinite(Number(connectedLatest?.recoveryScore))
      ? clamp(Number(connectedLatest.recoveryScore) / 10, 0, 10)
      : null;
    const sleep = sleep7 ?? num(latest.sleep, connectedSleepScore);
    const stress = stress7 ?? num(latest.stress, null);
    const ready = ready7 ?? num(latest.ready, connectedReadyScore);
    const soreness = sore7 ?? num(latest.soreness, null);

    const sleepRisk = sleep === null ? 20 : inv10(sleep);
    const readyRisk = ready === null ? 25 : inv10(ready);
    const stressRisk = stress === null ? 20 : dir10(stress);
    const soreRisk = soreness === null ? 10 : dir10(soreness);

    let risk =
      0.40 * readyRisk +
      0.25 * sleepRisk +
      0.25 * stressRisk +
      0.10 * soreRisk;

    // тренд-буст (консервативно):
    // якщо readiness 7d гірша за 28d на >=1 бал → +6
    if (ready7 !== null && ready28 !== null && (ready28 - ready7) >= 1) risk += 6;
    // якщо sleep 7d гірший за 28d на >=1 → +4
    if (sleep7 !== null && sleep28 !== null && (sleep28 - sleep7) >= 1) risk += 4;
    // якщо stress 7d вищий за 28d на >=1 → +4
    if (stress7 !== null && stress28 !== null && (stress7 - stress28) >= 1) risk += 4;

    return {
      wellnessRisk: clamp(risk, 0, 100),
      raw: { sleep, stress, ready, soreness },
      trend: { sleep7, sleep28, stress7, stress28, ready7, ready28, sore7, sore28 },
    };
  }

  function loadPack(loadLatest, loadRecent, connectedLatest) {
    const recent28 = Array.isArray(loadRecent) ? loadRecent : [];

    const s7 = inLastDays(recent28, 7);
    const s28 = inLastDays(recent28, 28);

    const sessionLoad = (x) => num(x?.duration, 0) * num(x?.rpe, 0);

    const acute7 = s7.reduce((a, x) => a + sessionLoad(x), 0);
    const sum28 = s28.reduce((a, x) => a + sessionLoad(x), 0);
    const chronic = sum28 / 4; // 28d -> 4 тижні
    const acwr = chronic > 0 ? acute7 / chronic : null;

    // якщо історії мало — fallback на latest proxy
    const duration = num(loadLatest?.duration, 0);
    const rpe = num(loadLatest?.rpe, 0);
    const connectedSteps = num(connectedLatest?.stepsToday, 0);
    const connectedDistance = num(connectedLatest?.distanceKm, connectedSteps > 0 ? connectedSteps * 0.00078 : 0);
    const distance = num(loadLatest?.distance, connectedDistance);

    let loadRisk = 0;

    // ACWR logic (проф-стандарт)
    if (acwr !== null) {
      if (acwr >= 1.8) loadRisk += 45;
      else if (acwr >= 1.5) loadRisk += 30;
      else if (acwr >= 1.3) loadRisk += 18;
    } else {
      // proxy якщо нема ACWR
      const proxy = clamp((duration / 90) * (rpe / 10), 0, 1.5) * 50;
      loadRisk += proxy;
      if (distance >= 12) loadRisk += 10;
      if (distance > 0 && duration <= 0 && rpe <= 0) {
        loadRisk += clamp(distance / 10, 0, 1.5) * 20;
      }
    }

    return {
      loadRisk: clamp(loadRisk, 0, 100),
      acwr,
      acute7,
      chronic,
      latest: { duration, rpe, distance, connectedSteps },
    };
  }

  function traffic(risk) {
    if (risk >= 70) return "red";
    if (risk >= 40) return "yellow";
    return "green";
  }

  function pickMode({ risk, pain, planned }) {
    if (pain >= 5) return "REHAB";
    if (risk >= 85) return "REST";
    if (risk >= 70) return pain >= 4 ? "REHAB" : "REST";
    if (risk >= 55) return "LIGHT";
    if (planned === "MD" || planned === "MD-1") return planned;
    return "TRAIN";
  }

  function reasons({ pain, loc, w, l, risk, connected }) {
    const r = [];
    const tx = CORE_TX[coreLang()] || CORE_TX.en;
    if (Number(connected?.stepsToday || 0) > 0) {
      r.push(tx.connectedSteps(Math.round(Number(connected.stepsToday))));
    }
    if (pain >= 4) r.push(tx.painHigh(pain, loc));
    else if (pain === 3) r.push(tx.painModerate(loc));

    if (w?.raw?.sleep !== null && w.raw.sleep <= 5) r.push(tx.sleepLow(w.raw.sleep));
    if (w?.raw?.stress !== null && w.raw.stress >= 7) r.push(tx.stressHigh(w.raw.stress));
    if (w?.raw?.ready !== null && w.raw.ready <= 4.5) r.push(tx.readinessLow(w.raw.ready));

    if (l?.acwr !== null) {
      if (l.acwr >= 1.5) r.push(tx.acwrHigh(l.acwr.toFixed(2)));
      else if (l.acwr >= 1.3) r.push(tx.acwrElevated(l.acwr.toFixed(2)));
    }

    if (!r.length) r.push(tx.noCritical);
    r.push(tx.totalRisk(Math.round(risk)));
    return r;
  }

  function parseFocusGoals(goalsRaw) {
    const goals = (Array.isArray(goalsRaw) ? goalsRaw : [])
      .map((x) => String(x || "").trim())
      .filter(Boolean);
    const has = (re) => goals.some((g) => re.test(g.toLowerCase()));
    const addUnique = (arr, value) => {
      const v = String(value || "").toLowerCase().trim();
      if (!v) return;
      if (!arr.includes(v)) arr.push(v);
    };
    const mapGoalToQualities = (goalRaw) => {
      const g = String(goalRaw || "").toLowerCase();
      const out = [];

      if (/strength|strength development|force|fuerza|forca|força|kraft/.test(g)) {
        addUnique(out, "strength");
        addUnique(out, "heavy");
        addUnique(out, "isometric_activation");
      }
      if (/\bpower\b|vertical power|throw power|serve power|explosive|jump|potencia|potência/.test(g)) {
        addUnique(out, "power");
        addUnique(out, "reaction");
        addUnique(out, "readiness");
        addUnique(out, "power_test");
      }
      if (/speed|agility|quick|sprint|footwork|velocity|veloc/.test(g)) {
        addUnique(out, "speed");
        addUnique(out, "coordination");
        addUnique(out, "reaction");
        addUnique(out, "neural");
      }
      if (/endurance|stamina|conditioning|aerobic|speed endurance|resisten|ausdauer/.test(g)) {
        addUnique(out, "endurance");
        addUnique(out, "speed_endurance");
        addUnique(out, "extensive_aerobic");
        addUnique(out, "aerobic_low");
      }
      if (/recovery|injury prevention|return after injury|rehab|recuper/.test(g)) {
        addUnique(out, "recovery");
        addUnique(out, "rehab");
        addUnique(out, "mobility");
        addUnique(out, "injury_prevention");
        addUnique(out, "tissue");
      }
      if (/match readiness|decision making|contact readiness|readiness/.test(g)) {
        addUnique(out, "readiness");
        addUnique(out, "reaction");
        addUnique(out, "coordination");
      }
      return out;
    };

    const qualityWeights = {};
    goals.forEach((goal, idx) => {
      const w = idx === 0 ? 5 : idx === 1 ? 3 : idx === 2 ? 2 : 1;
      mapGoalToQualities(goal).forEach((q) => {
        qualityWeights[q] = (qualityWeights[q] || 0) + w;
      });
    });
    const qualityPriority = Object.entries(qualityWeights)
      .sort((a, b) => b[1] - a[1])
      .map(([q]) => q);

    return {
      goals,
      topGoal: goals[0] || null,
      secondaryGoal: goals[1] || null,
      qualityPriority,
      qualityWeights,
      strength: has(/strength|сила|силов|fuerza|forca|força|kraft|force/),
      power: has(/\bpower\b|potencia|potência|потуж|мощ|jump|throw power|vertical power/),
      speed: has(/speed|agility|quick|sprint|footwork|швид|скорост|veloc/),
      endurance: has(/endurance|stamina|conditioning|витрив|вынослив|resisten|ausdauer/),
      recovery: has(/recovery|injury prevention|return after injury|rehab|віднов|реаб|восстанов|recuper/),
    };
  }

  function recommendations({ mode, pain, w, l, focus }) {
    const rec = [];
    const tx = CORE_TX[coreLang()] || CORE_TX.en;

    if (mode === "REST") {
      rec.push(tx.restDay);
      rec.push(tx.restNo);
      return rec;
    }
    if (mode === "REHAB") {
      rec.push(tx.rehabMain);
      rec.push(tx.rehabSwap);
    }
    if (mode === "LIGHT") {
      rec.push(tx.lightCut);
      rec.push(tx.lightFocus);
    }
    if (mode === "MD-1") {
      rec.push(tx.md1);
    }

    if (pain >= 4) rec.push(tx.painAvoidExplosive);
    else if (pain === 3) rec.push(tx.painControlled);

    if (w?.raw?.sleep !== null && w.raw.sleep <= 5) rec.push(tx.sleepNoMax);
    if (w?.raw?.stress !== null && w.raw.stress >= 7) rec.push(tx.stressReduce);

    if (l?.acwr !== null && l.acwr >= 1.5) rec.push(tx.acwrSpike);

    if (focus?.topGoal) {
      if (focus?.secondaryGoal) rec.push(tx.profilePriority2(focus.topGoal, focus.secondaryGoal));
      else rec.push(tx.profilePriority1(focus.topGoal));
    } else if (focus?.goals?.length) {
      rec.push(tx.profileFocus(focus.goals.slice(0, 2).join(" + ")));
    }
    if (Array.isArray(focus?.qualityPriority) && focus.qualityPriority.length) {
      rec.push(tx.corePriority(focus.qualityPriority.slice(0, 3).join(" > ")));
    }
    if (focus?.strength) {
      if (mode === "TRAIN" || mode === "MD-1") {
        rec.push(tx.strengthTrain);
      } else if (mode === "LIGHT" || mode === "REHAB") {
        rec.push(tx.strengthSafe);
      }
    }
    if (focus?.power && (mode === "TRAIN" || mode === "MD-1")) {
      rec.push(tx.powerFocus);
    }
    if (focus?.speed && (mode === "TRAIN" || mode === "MD-1")) {
      rec.push(tx.speedFocus);
    }
    if (focus?.endurance && mode !== "REST") {
      rec.push(tx.enduranceFocus);
    }
    return rec;
  }
            // =========================
  // POWER helper (safe) — avoids ReferenceError if used anywhere
  // =========================
  if (typeof window.powerSummary !== "function") {
    window.powerSummary = function powerSummary(p) {
      const obj = p || null;
      if (!obj) return { count: 0, best_cm: null, avg_cm: null, fatigue_pct: null, improve_pct: null, date: null };
      return {
        count: Number(obj.count ?? obj.jumps ?? 0) || 0,
        best_cm: (obj.best_cm == null ? null : Number(obj.best_cm)),
        avg_cm:  (obj.avg_cm  == null ? null : Number(obj.avg_cm)),
        fatigue_pct: (obj.fatigue_pct == null ? null : Number(obj.fatigue_pct)),
        improve_pct: (obj.improve_pct == null ? null : Number(obj.improve_pct)),
        date: (obj.date != null ? String(obj.date) : null),
      };
    };
  }

  window.AthleteCore = {
    calculate(userId, data) {
      const injuryPick = latestPain(data?.injury);
      const pain = clamp(num(injuryPick.pain, 0), 0, 10);

      const w = wellnessPack(data?.wellness, data?.wellnessRecent, data?.connected);
      const l = loadPack(data?.load, data?.loadRecent, data?.connected);

      // weights v1.1 (проф-логіка)
      let risk = 0;
      risk += 0.40 * painRisk(pain);
      risk += 0.45 * w.wellnessRisk;
      risk += 0.15 * l.loadRisk;

      // synergy bumps
      if (pain === 3 && w.raw.ready !== null && w.raw.ready <= 4.5) risk += 8;
      const badWellness =
        (w.raw.sleep !== null && w.raw.sleep <= 5 ? 1 : 0) +
        (w.raw.stress !== null && w.raw.stress >= 7 ? 1 : 0) +
        (w.raw.ready !== null && w.raw.ready <= 4.5 ? 1 : 0);
      if (badWellness >= 2) risk += 7;

      risk = clamp(risk, 0, 100);

      const planned = data?.plannedDayStatus || data?.dayStatus || null;
      const mode = pickMode({ risk, pain, planned });
      const profileGoals = Array.isArray(data?.goals)
        ? data.goals
        : (Array.isArray(data?.profile?.goals) ? data.profile.goals : []);
      const focus = parseFocusGoals(profileGoals);

      return {
        userId,
        weekId: data?.weekId || null,
        risk: Math.round(risk),
        traffic: traffic(risk),
        mode,
        reasons: reasons({ pain, loc: injuryPick.location, w, l, risk, connected: data?.connected }),
        recommendations: recommendations({ mode, pain, w, l, focus }),
        breakdown: {
          pain: { pain10: pain },
          wellness: w,
          load: l,
          connected: data?.connected || null,
          focus,
          profile: data?.profile || null,
          power: window.powerSummary((data && (data.power || data.signals?.power)) || null),
          plannedDayStatus: planned,
        },
      };
    },
  };
})();
function calcCnsReadiness(signals) {
  const w = signals?.wellness || null;
  const inj = signals?.injury || null;

  const sleep = Number(w?.sleep);
  const stress = Number(w?.stress);
  const soreness = Number(w?.soreness);
  const pain = Number(inj?.pain);

  // нормалізація 0..10 (якщо null — не враховуємо)
  const clamp01 = (x) => Math.max(0, Math.min(1, x));
  const has = (x) => Number.isFinite(x);

  const parts = [];

  if (has(sleep))    parts.push({ name: "sleep",    v: clamp01(sleep / 10) });          // більше = краще
  if (has(stress))   parts.push({ name: "stress",   v: clamp01(1 - stress / 10) });    // менше = краще
  if (has(soreness)) parts.push({ name: "soreness", v: clamp01(1 - soreness / 10) });  // менше = краще
  if (has(pain))     parts.push({ name: "pain",     v: clamp01(1 - pain / 10) });      // менше = краще

  if (!parts.length) return { score: null, label: "—", details: [] };

  // ваги (можеш змінити потім)
  const weights = {
    sleep: 0.35,
    stress: 0.25,
    soreness: 0.20,
    pain: 0.20
  };

  let sumW = 0;
  let sum = 0;
  parts.forEach(p => {
    const wgt = weights[p.name] ?? 0.25;
    sumW += wgt;
    sum += p.v * wgt;
  });

  const score = Math.round((sum / (sumW || 1)) * 100);

  const label =
    score >= 80 ? "HIGH" :
    score >= 60 ? "OK" :
    score >= 40 ? "LOW" :
    "VERY LOW";

  return { score, label, details: parts };
}


