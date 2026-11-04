(function () {
  const db = firebase.firestore();
  function plannerCoachId() {
    const qs = new URLSearchParams(window.location.search || "");
    const delegated = String(qs.get("coachId") || "").trim();
    if (qs.get("asAdmin") === "1" && delegated) return delegated;
    return String(firebase.auth().currentUser?.uid || "").trim();
  }
  function plannerTemplateDocId(weekId) {
    const coachId = plannerCoachId();
    return coachId ? `${coachId}_${weekId}` : String(weekId || "");
  }
  let selectedWeekId = getWeekIdFromUrl() || mondayId();
  let visibleWeeks = new Map();

  const WEEK_DAYS = [
    { key: "day0", label: "Mon" },
    { key: "day1", label: "Tue" },
    { key: "day2", label: "Wed" },
    { key: "day3", label: "Thu" },
    { key: "day4", label: "Fri" },
    { key: "day5", label: "Sat" },
    { key: "day6", label: "Sun" }
  ];

  function iso(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function parseIsoLocal(dateStr) {
    const m = String(dateStr || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return null;
    const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    return Number.isNaN(d.getTime()) ? null : d;
  }

  function mondayId(d = new Date()) {
    const date = d instanceof Date ? new Date(d) : (parseIsoLocal(d) || new Date(d));
    const dow = date.getDay() === 0 ? 6 : date.getDay() - 1;
    date.setDate(date.getDate() - dow);
    return iso(date);
  }

  function getWeekIdFromUrl() {
    const raw = new URL(window.location.href).searchParams.get("weekId");
    return raw && parseIsoLocal(raw) ? mondayId(raw) : null;
  }

  function sundayOfMonday(monISO) {
    const d = parseIsoLocal(monISO);
    if (!d) return monISO || "";
    d.setDate(d.getDate() + 6);
    return iso(d);
  }

  function getLang() {
    const raw = String(localStorage.getItem("pac_lang") || "uk").toLowerCase();
    return raw === "ua" ? "uk" : raw;
  }

  function ui(key) {
    const lang = getLang();
    const dict = {
      uk: {
        weeks: "ТИЖНІ",
        label: "Неділя",
        selected: "Обраний тиждень",
        empty: "EMPTY",
        draft: "DRAFT",
        published: "PUBLISHED",
        choose: "Оберіть тиждень вище, щоб відкрити його у Week Editor.",
        edit: "Редагувати",
        publish: "Опублікувати",
        moveCurrent: "Перенести на цей тиждень",
        standard: "Простий мікроцикл",
        custom: "Складний мікроцикл",
        moved: "Тиждень перенесено",
        publishedOk: "Тиждень опубліковано",
        nothingToPublish: "Немає збереженого draft для публікації.",
        nothingToMove: "Немає збереженого тижня для перенесення.",
        noPlan: "План ще порожній.",
        recovery: "Відновлення",
        match: "Матч / головний день",
        light: "Передматчевий день",
        hard: "Підготовчий день",
        training: "Тренування",
        rest: "Відпочинок",
        refresh: "Оновити",
        current: "Поточний тиждень"
      },
      en: {
        weeks: "WEEKS",
        label: "Sunday",
        selected: "Selected week",
        empty: "EMPTY",
        draft: "DRAFT",
        published: "PUBLISHED",
        choose: "Choose a week above to open it in Week Editor.",
        edit: "Edit",
        publish: "Publish",
        moveCurrent: "Move to this week",
        standard: "Simple microcycle",
        custom: "Complex microcycle",
        moved: "Week moved",
        publishedOk: "Week published",
        nothingToPublish: "No saved draft to publish.",
        nothingToMove: "No saved week to move.",
        noPlan: "Plan is empty yet.",
        recovery: "Recovery",
        match: "Match / main day",
        light: "Pre-match day",
        hard: "Preparation day",
        training: "Training",
        rest: "Rest",
        refresh: "Refresh",
        current: "Open Current Week"
      },
      ru: {
        weeks: "НЕДЕЛИ",
        label: "Воскресенье",
        selected: "Выбранная неделя",
        empty: "EMPTY",
        draft: "DRAFT",
        published: "PUBLISHED",
        choose: "Выберите неделю выше, чтобы открыть её в Week Editor.",
        edit: "Редактировать",
        publish: "Опубликовать",
        moveCurrent: "Перенести на эту неделю",
        standard: "Простой микроцикл",
        custom: "Сложный микроцикл",
        moved: "Неделя перенесена",
        publishedOk: "Неделя опубликована",
        nothingToPublish: "Нет сохранённого draft для публикации.",
        nothingToMove: "Нет сохранённой недели для переноса.",
        noPlan: "План пока пустой.",
        recovery: "Восстановление",
        match: "Матч / главный день",
        light: "Предматчевый день",
        hard: "Подготовительный день",
        training: "Тренировка",
        rest: "Отдых",
        refresh: "Обновить",
        current: "Текущая неделя"
      }
    };
    return (dict[lang] || dict.en)[key] || (dict.en[key] || key);
  }

  function locale() {
    return ({ uk: "uk-UA", en: "en-US", de: "de-DE", es: "es-ES", ru: "ru-RU", pt: "pt-PT" }[getLang()] || "en-US");
  }

  function dayNames() {
    const map = {
      uk: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"],
      en: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      de: ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"],
      es: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
      ru: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
      pt: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]
    };
    return map[getLang()] || map.en;
  }

  function formatLongDate(dateStr) {
    const d = parseIsoLocal(dateStr);
    if (!d) return dateStr || "";
    return new Intl.DateTimeFormat(locale(), { day: "2-digit", month: "long", year: "numeric" }).format(d);
  }

  function formatShortDate(date) {
    return new Intl.DateTimeFormat(locale(), { day: "2-digit", month: "short" }).format(date);
  }

  function dayPurpose(status) {
    if (status === "REST") return ui("rest");
    if (status === "MD") return ui("match");
    if (status === "MD+1" || status === "MD+2") return ui("recovery");
    if (status === "MD-1") return ui("light");
    if (status === "MD-2" || status === "MD-3" || status === "MD-4") return ui("hard");
    return ui("training");
  }

  function statusFor(weekId) {
    return visibleWeeks.get(weekId) || { hasDraft: false, hasPublished: false, draft: null, published: null };
  }

  function statusText(weekId) {
    const status = statusFor(weekId);
    if (status.hasPublished) return ui("published");
    if (status.hasDraft) return ui("draft");
    return ui("empty");
  }

  function statusClass(weekId) {
    const status = statusFor(weekId);
    if (status.hasPublished) return "published";
    if (status.hasDraft) return "draft";
    return "empty";
  }

  async function loadStatuses(weekIds) {
    const unique = [...new Set(weekIds.filter(Boolean))];
    const draftDocs = await Promise.all(unique.map((id) => db.collection("week_templates_drafts").doc(plannerTemplateDocId(id)).get()));
    const pubDocs = await Promise.all(unique.map((id) => db.collection("week_templates_published").doc(plannerTemplateDocId(id)).get()));
    visibleWeeks = new Map(unique.map((weekId, i) => {
      const d = draftDocs[i];
      const p = pubDocs[i];
      const draft = d.exists ? (d.data() || {}) : null;
      const published = p.exists ? (p.data() || {}) : null;
      return [weekId, {
        draft,
        published,
        hasDraft: !!(draft && (draft.standard || draft.custom || draft.planData)),
        hasPublished: !!(published && (published.standard || published.custom || published.planData))
      }];
    }));
  }

  async function loadWeekData(weekId) {
    if (visibleWeeks.has(weekId)) return visibleWeeks.get(weekId);
    const [draftSnap, pubSnap] = await Promise.all([
      db.collection("week_templates_drafts").doc(plannerTemplateDocId(weekId)).get(),
      db.collection("week_templates_published").doc(plannerTemplateDocId(weekId)).get()
    ]);
    const draft = draftSnap.exists ? (draftSnap.data() || {}) : null;
    const published = pubSnap.exists ? (pubSnap.data() || {}) : null;
    const data = {
      draft,
      published,
      hasDraft: !!(draft && (draft.standard || draft.custom || draft.planData)),
      hasPublished: !!(published && (published.standard || published.custom || published.planData))
    };
    visibleWeeks.set(weekId, data);
    return data;
  }

  function blockFromDoc(doc, mode) {
    if (!doc) return null;
    if (doc[mode]) return doc[mode];
    if (doc.planData || doc.microcyclePreview) {
      return { planData: doc.planData || {}, microcyclePreview: doc.microcyclePreview || {} };
    }
    return null;
  }

  function preferredBlock(data, mode) {
    return blockFromDoc(data?.draft, mode) || blockFromDoc(data?.published, mode);
  }

  function planForStatus(planData, status) {
    const raw = planData?.[`status_plan_${status}`];
    const planObj = Array.isArray(raw) ? (raw[0] || { exercises: [] }) : (raw || { exercises: [] });
    return Array.isArray(planObj.exercises) ? planObj.exercises : [];
  }

  function computeStatuses(microcycle) {
    const activity = WEEK_DAYS.map((d) => microcycle?.[d.key] || "TRAIN");
    const matches = activity.map((value, idx) => value === "MATCH" ? idx : -1).filter((idx) => idx >= 0);
    const matchWindow = { preMax: 4, postMax: 2 };
    const statusByDiff = (diff) => {
      if (!Number.isFinite(diff) || diff === 0) return null;
      if (diff < 0 && diff >= -matchWindow.preMax) return `MD${diff}`;
      if (diff > 0 && diff <= matchWindow.postMax) return `MD+${diff}`;
      return null;
    };
    return activity.map((type, idx) => {
      if (type === "REST") return "REST";
      if (type === "MATCH") return "MD";
      if (!matches.length) return "TRAIN";
      let minDiff = Infinity;
      let bestStatus = "TRAIN";
      matches.forEach((matchIdx) => {
        [-7, 0, 7].forEach((offset) => {
          const diff = idx - (matchIdx + offset);
          const candidate = statusByDiff(diff);
          if (candidate && Math.abs(diff) < Math.abs(minDiff)) {
            minDiff = diff;
            bestStatus = candidate;
          }
        });
      });
      return bestStatus;
    });
  }

  function escapeHtml(input) {
    return String(input ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function storedPayloadFromData(data) {
    const source = data?.draft || data?.published || null;
    if (!source) return null;
    const payload = {};
    if (source.standard) payload.standard = source.standard;
    if (source.custom) payload.custom = source.custom;
    if (!payload.standard && !payload.custom && (source.planData || source.microcyclePreview)) {
      const mode = source.mode === "custom" ? "custom" : "standard";
      payload[mode] = {
        planData: source.planData || {},
        microcyclePreview: source.microcyclePreview || {}
      };
    }
    return normalizePayloadModes(Object.keys(payload).length ? payload : null);
  }

  function normalizePayloadModes(payload) {
    if (!payload) return null;
    const out = { ...payload };
    if (out.standard && !out.custom && countTemplateMatches(out.standard.microcyclePreview) >= 2) {
      out.custom = out.standard;
    }
    return out;
  }

  function countTemplateMatches(micro) {
    if (!micro || typeof micro !== "object" || Array.isArray(micro)) return 0;
    return Object.keys(micro).filter((key) => String(micro[key] || "").toUpperCase() === "MATCH").length;
  }

  function preferredPublishBlock(payload) {
    if (payload?.custom && countTemplateMatches(payload.custom.microcyclePreview) >= 2) return { mode: "custom", block: payload.custom };
    if (payload?.standard) return { mode: "standard", block: payload.standard };
    if (payload?.custom) return { mode: "custom", block: payload.custom };
    return { mode: "standard", block: {} };
  }

  async function publishSelectedWeek(weekId, data) {
    const payload = storedPayloadFromData({ draft: data?.draft, published: null });
    if (!payload) throw new Error(ui("nothingToPublish"));
    const selected = preferredPublishBlock(payload);
    await db.collection("week_templates_published").doc(plannerTemplateDocId(weekId)).set({
      ownerCoachId: plannerCoachId(),
      ...payload,
      mode: selected.mode,
      planData: selected.block.planData || {},
      microcyclePreview: selected.block.microcyclePreview || {},
      publishedAt: firebase.firestore.FieldValue.serverTimestamp(),
      publishedBy: firebase.auth().currentUser?.uid || null
    }, { merge: true });
  }

  async function moveSelectedToCurrentWeek(data) {
    const payload = storedPayloadFromData(data);
    if (!payload) throw new Error(ui("nothingToMove"));
    await db.collection("week_templates_drafts").doc(plannerTemplateDocId(mondayId())).set({
      ownerCoachId: plannerCoachId(),
      ...payload,
      movedFromWeekId: selectedWeekId,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  }

  function visibleMonthStart() {
    const u = new URL(window.location.href);
    const qsStart = u.searchParams.get("miniStartMonth");
    const lsStart = localStorage.getItem("cweMiniStartMonth");
    const fallback = iso(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    const raw = qsStart || lsStart || fallback;
    const d = parseIsoLocal(raw) || new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  }

  function setVisibleMonthStart(date) {
    const nextISO = iso(new Date(date.getFullYear(), date.getMonth(), 1));
    localStorage.setItem("cweMiniStartMonth", nextISO);
    const url = new URL(window.location.href);
    url.searchParams.set("miniStartMonth", nextISO);
    history.replaceState({}, "", url.toString());
  }

  function collectVisibleWeeks(months) {
    const weekIds = [];
    months.forEach((mDate) => {
      const y = mDate.getFullYear();
      const mo = mDate.getMonth();
      const mStart = new Date(y, mo, 1);
      const mEnd = new Date(y, mo + 1, 0);
      const firstMon = new Date(mStart);
      while (firstMon.getDay() !== 1) firstMon.setDate(firstMon.getDate() - 1);
      const lastSun = new Date(mEnd);
      while (lastSun.getDay() !== 0) lastSun.setDate(lastSun.getDate() + 1);
      for (let d = new Date(firstMon); d <= lastSun; d.setDate(d.getDate() + 7)) {
        const mon = new Date(d);
        const sun = new Date(d);
        sun.setDate(sun.getDate() + 6);
        if (sun.getMonth() === mo) weekIds.push(iso(mon));
      }
    });
    return weekIds;
  }

  async function renderSelectedWeek() {
    const title = document.getElementById("selected-week-title");
    const status = document.getElementById("selected-week-status");
    const actions = document.getElementById("selected-week-actions");
    const data = await loadWeekData(selectedWeekId);
    if (title) title.textContent = `${formatLongDate(selectedWeekId)} - ${formatLongDate(sundayOfMonday(selectedWeekId))}`;
    if (status) status.textContent = `${statusText(selectedWeekId)} · ${selectedWeekId} - ${sundayOfMonday(selectedWeekId)}`;
    if (!actions) return;
    actions.innerHTML = `
      <button class="ud-btn" id="btn-publish-selected-week" type="button">${ui("publish")}</button>
      <button class="ud-btn ud-btn--ghost" id="btn-move-selected-week" type="button">${ui("moveCurrent")}</button>
      <button class="ud-btn ud-btn--ghost" id="btn-edit-selected-week" type="button">${ui("edit")}</button>
    `;
    document.getElementById("btn-publish-selected-week")?.addEventListener("click", async () => {
      try {
        await publishSelectedWeek(selectedWeekId, data);
        alert(ui("publishedOk"));
        await start();
      } catch (e) {
        alert(e.message || e);
      }
    });
    document.getElementById("btn-move-selected-week")?.addEventListener("click", async () => {
      try {
        await moveSelectedToCurrentWeek(data);
        alert(ui("moved"));
        await start();
      } catch (e) {
        alert(e.message || e);
      }
    });
    document.getElementById("btn-edit-selected-week")?.addEventListener("click", () => {
      openWeekEditor(selectedWeekId);
    });
    renderWeekPreview(data);
  }

  function openWeekEditor(weekId, mode) {
    const url = new URL("coach-week-editor.html", window.location.href);
    url.searchParams.set("weekId", weekId);
    url.searchParams.set("miniStartMonth", iso(visibleMonthStart()));
    if (mode) url.searchParams.set("mode", mode);
    window.location.href = url.toString();
  }

  function renderWeekPreview(data) {
    const preview = document.getElementById("date-plan-week-preview");
    if (!preview) return;
    const previewDayNames = dayNames();
    const weekStart = parseIsoLocal(selectedWeekId) || new Date();
    const availableModes = ["standard", "custom"].filter((mode) => !!preferredBlock(data, mode));
    if (!availableModes.length) {
      preview.innerHTML = `
        <div style="border:1px solid #252525;border-radius:8px;background:#0d0d0d;padding:10px;color:#777;font-size:.86rem;">
          ${escapeHtml(ui("noPlan"))}
        </div>`;
      return;
    }
    preview.innerHTML = availableModes.map((mode) => {
      const block = preferredBlock(data, mode);
      const statuses = computeStatuses(block.microcyclePreview || {});
      const days = WEEK_DAYS.map((day, idx) => {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + idx);
        const dayStatus = statuses[idx];
        const exercises = planForStatus(block.planData || {}, dayStatus);
        const names = exercises.slice(0, 2).map((ex) => escapeHtml(ex.name || ex.title || "Exercise"));
        const namesHtml = names.length ? names.join(" · ") : escapeHtml(ui("noPlan"));
        return `
          <div style="display:grid;grid-template-columns:86px 62px minmax(120px,1fr) minmax(140px,2fr);gap:8px;align-items:center;border-bottom:1px solid #1f1f1f;padding:7px 0;min-width:0;">
            <strong style="color:#eee;font-size:.82rem;">${escapeHtml(formatShortDate(date))}</strong>
            <span style="color:#f4c62d;font-size:.76rem;font-weight:900;">${escapeHtml(dayStatus)}</span>
            <span style="color:#b7b7b7;font-size:.78rem;">${escapeHtml(previewDayNames[idx] || day.label)} · ${escapeHtml(dayPurpose(dayStatus))}</span>
            <div style="color:#aaa;font-size:.78rem;line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${namesHtml}</div>
          </div>`;
      }).join("");
      const matchCount = Object.values(block.microcyclePreview || {}).filter((value) => value === "MATCH").length;
      const storedType = matchCount >= 2 ? ui("custom") : ui("standard");
      return `
        <div style="border:1px solid #2b2b2b;border-radius:8px;background:#0b0b0b;padding:10px;">
          <div style="display:flex;justify-content:space-between;gap:8px;align-items:center;margin-bottom:8px;">
            <div style="color:#f4c62d;font-weight:900;">${escapeHtml(storedType)}</div>
            <button class="ud-btn ud-btn--ghost" type="button" data-open-mode="${mode}" style="padding:6px 10px;">${escapeHtml(ui("edit"))}</button>
          </div>
          <div style="display:grid;gap:0;">${days}</div>
        </div>`;
    }).join("");
    preview.querySelectorAll("[data-open-mode]").forEach((btn) => {
      btn.addEventListener("click", () => openWeekEditor(selectedWeekId, btn.dataset.openMode));
    });
  }

  function renderCalendar(months) {
    const list = document.getElementById("week-mini-list");
    const label = document.getElementById("week-mini-label");
    if (!list) return;

    const selectedMon = mondayId(selectedWeekId);
    const todayMon = mondayId(new Date());
    const monthFmt = new Intl.DateTimeFormat(locale(), { month: "short", year: "numeric" });
    const isMobile = window.innerWidth <= 760;

    list.innerHTML = "";
    list.style.display = "grid";
    list.style.gridTemplateColumns = isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))";
    list.style.gap = "10px";
    list.style.overflowX = "hidden";
    list.style.overflowY = "visible";
    list.style.whiteSpace = "normal";
    list.style.width = "100%";

    months.forEach((mDate) => {
      const y = mDate.getFullYear();
      const mo = mDate.getMonth();
      const mStart = new Date(y, mo, 1);
      const mEnd = new Date(y, mo + 1, 0);

      const firstMon = new Date(mStart);
      while (firstMon.getDay() !== 1) firstMon.setDate(firstMon.getDate() - 1);
      const lastSun = new Date(mEnd);
      while (lastSun.getDay() !== 0) lastSun.setDate(lastSun.getDate() + 1);

      const card = document.createElement("div");
      card.style.cssText = "border:1px solid #2a2a2a;border-radius:12px;background:linear-gradient(180deg,#131417,#0e0f12);padding:8px;box-shadow:inset 0 1px 0 rgba(255,255,255,.04);";

      const title = document.createElement("div");
      title.textContent = monthFmt.format(mDate).toUpperCase();
      title.style.cssText = "color:#f4c62d;font-weight:900;font-size:0.92rem;letter-spacing:0.3px;margin-bottom:6px;";
      card.appendChild(title);

      const head = document.createElement("div");
      head.style.cssText = "display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-bottom:4px;padding:2px 0;border-bottom:1px solid #23262b;";
      dayNames().forEach((dn) => {
        const h = document.createElement("div");
        h.textContent = dn;
        h.style.cssText = "color:#8f8f8f;font-size:0.68rem;font-weight:800;text-align:center;";
        head.appendChild(h);
      });
      card.appendChild(head);

      for (let d = new Date(firstMon); d <= lastSun; d.setDate(d.getDate() + 7)) {
        const mon = new Date(d);
        const sun = new Date(d);
        sun.setDate(sun.getDate() + 6);
        if (sun.getMonth() !== mo) continue;

        const monISO = iso(mon);
        const isSelected = monISO === selectedMon;
        const isCurrent = monISO === todayMon;
        const isFuture = new Date(`${monISO}T00:00:00`) > new Date(`${todayMon}T00:00:00`);
        const cls = statusClass(monISO);

        let borderColor = isCurrent ? "#35b86a" : (isFuture ? "#f0c438" : "#6e4b24");
        if (cls === "published") borderColor = "#35b86a";
        if (cls === "draft") borderColor = "#f0c438";
        const rowBg = isCurrent || cls === "published"
          ? "linear-gradient(180deg, rgba(37,130,68,.42), rgba(18,74,39,.26))"
          : (isFuture || cls === "draft"
            ? "linear-gradient(180deg, rgba(194,141,24,.35), rgba(130,92,12,.20))"
            : "linear-gradient(180deg, rgba(98,66,30,.32), rgba(58,39,19,.20))");
        const dayTextColor = isCurrent || cls === "published" ? "#dbffe7" : ((isFuture || cls === "draft") ? "#fff1c7" : "#e2cda8");

        const row = document.createElement("button");
        row.type = "button";
        row.title = `${monISO} · ${statusText(monISO)}`;
        row.style.cssText =
          "width:100%;display:grid;grid-template-columns:repeat(7,1fr);gap:4px;align-items:center;" +
          `border:1px solid ${borderColor};background:${rowBg};` +
          "border-radius:7px;padding:4px 4px;margin-bottom:4px;cursor:pointer;";

        for (let j = 0; j < 7; j += 1) {
          const day = new Date(mon);
          day.setDate(mon.getDate() + j);
          const inMonth = day.getMonth() === mo;
          const cell = document.createElement("div");
          cell.textContent = String(day.getDate()).padStart(2, "0");
          cell.style.cssText = `text-align:center;font-size:0.78rem;font-weight:700;color:${inMonth ? dayTextColor : "#6a6a6a"};`;
          row.appendChild(cell);
        }

        row.addEventListener("click", () => {
          selectedWeekId = monISO;
          renderCalendar(months);
          renderSelectedWeek().catch(console.error);
        });
        if (isSelected) row.style.boxShadow = "0 0 0 1px rgba(255,255,255,.22) inset";
        card.appendChild(row);
      }

      list.appendChild(card);
    });

    if (label) label.textContent = `${ui("label")}: ${sundayOfMonday(selectedWeekId)}`;
  }

  async function start() {
    const startMonth = visibleMonthStart();
    const isMobile = window.innerWidth <= 760;
    const months = Array.from({ length: isMobile ? 1 : 3 }, (_, idx) =>
      new Date(startMonth.getFullYear(), startMonth.getMonth() + idx, 1)
    );
    await loadStatuses(collectVisibleWeeks(months));
    renderCalendar(months);
    await renderSelectedWeek();
  }

  function bindNav() {
    document.getElementById("cwe-weeks-label").textContent = ui("weeks");
    document.getElementById("btn-refresh-plan").textContent = ui("refresh");
    document.getElementById("btn-open-current-plan").textContent = ui("current");
    document.getElementById("week-mini-prev")?.addEventListener("click", () => {
      const current = visibleMonthStart();
      setVisibleMonthStart(new Date(current.getFullYear(), current.getMonth() - 1, 1));
      start().catch(console.error);
    });
    document.getElementById("week-mini-next")?.addEventListener("click", () => {
      const current = visibleMonthStart();
      setVisibleMonthStart(new Date(current.getFullYear(), current.getMonth() + 1, 1));
      start().catch(console.error);
    });
    document.getElementById("btn-refresh-plan")?.addEventListener("click", () => start().catch(console.error));
    document.getElementById("btn-open-current-plan")?.addEventListener("click", () => {
      openWeekEditor(mondayId());
    });
    window.addEventListener("resize", () => start().catch(console.error));
    window.addEventListener("pac:lang-changed", () => {
      bindLabelsOnly();
      start().catch(console.error);
    });
  }

  function bindLabelsOnly() {
    const weeks = document.getElementById("cwe-weeks-label");
    const refresh = document.getElementById("btn-refresh-plan");
    const current = document.getElementById("btn-open-current-plan");
    if (weeks) weeks.textContent = ui("weeks");
    if (refresh) refresh.textContent = ui("refresh");
    if (current) current.textContent = ui("current");
  }

  firebase.auth().onAuthStateChanged(async (user) => {
    if (!user) return;
    selectedWeekId = getWeekIdFromUrl() || mondayId();
    bindNav();
    start().catch(console.error);
  });
})();
