(function () {
  // ---------- CONFIG ----------
  const MAX_DAYS = 7;

  // NS load formula weights (можеш змінювати під свою методику)
  const W = {
    sleepDeficit: 0.30, // (10 - sleep)
    stress: 0.25,       // stress
    soreness: 0.20,     // soreness
    moodDeficit: 0.15,  // (10 - mood)
    hydrationDeficit: 0.10 // (10 - water)
  };

  const REASON_LABELS = {
    sleepDeficit: "Не достатньо сну",
    stress: "Стрес / нервове напруження",
    soreness: "Мʼязова втома / біль",
    moodDeficit: "Низька енергія",
    hydrationDeficit: "Гідратація нижче норми",
    analytics: "Аналітика"
  };

  // ---------- DOM ----------
  const elRadial = () => document.getElementById("wgRadial");
  const elToday = () => document.getElementById("wgToday");
  const elAvg = () => document.getElementById("wgAvg");
  const elNsToday = () => document.getElementById("wgNsToday");
  const elChip = () => document.getElementById("wgChip");
  const elChipText = () => document.getElementById("wgChipText");
  const elCanvas = () => document.getElementById("wgTrend");
  const elTooltip = () => document.getElementById("wgTooltip");
  const elReasons = () => document.getElementById("wgReasons");

  // ---------- HELPERS ----------
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function avg(arr) { return arr.reduce((s, x) => s + x, 0) / (arr.length || 1); }

  function parseWellnessHistory() {
    // wellness.js зберігає: { "YYYY-MM-DD": {sleep:.., soreness:.., mood:.., water:.., stress:.., ready:..}, ... }
    const raw = localStorage.getItem("wellnessHistory");
    if (!raw) return [];
    let obj;
    try { obj = JSON.parse(raw); } catch { return []; }

    const dates = Object.keys(obj).sort(); // asc
    const last = dates.slice(-MAX_DAYS);

    return last.map((date) => ({
      date,
      scores: obj[date] || {}
    }));
  }

  function dayLabelFromDate(dateStr) {
    // dateStr "YYYY-MM-DD" -> "MM/DD"
    const p = String(dateStr).split("-");
    if (p.length !== 3) return dateStr;
    return `${p[1]}/${p[2]}`;
  }

  function readinessPct(scores) {
    const r = Number(scores.ready || 0); // 0..10
    return clamp(Math.round(r * 10), 0, 100);
  }

  function nsLoadPct(scores) {
    // All fields 0..10 (in your form)
    const sleep = Number(scores.sleep || 0);
    const soreness = Number(scores.soreness || 0);
    const mood = Number(scores.mood || 0);
    const water = Number(scores.water || 0);
    const stress = Number(scores.stress || 0);

    const sleepDeficit = clamp(10 - sleep, 0, 10);
    const moodDeficit = clamp(10 - mood, 0, 10);
    const hydrationDeficit = clamp(10 - water, 0, 10);

    // weighted 0..10 -> convert to 0..100
    const score0to10 =
      W.sleepDeficit * sleepDeficit +
      W.stress * stress +
      W.soreness * soreness +
      W.moodDeficit * moodDeficit +
      W.hydrationDeficit * hydrationDeficit;

    return clamp(Math.round((score0to10 / 10) * 100), 0, 100);
  }

  function primaryReason(scores) {
    // pick max contributor
    const sleep = Number(scores.sleep || 0);
    const soreness = Number(scores.soreness || 0);
    const mood = Number(scores.mood || 0);
    const water = Number(scores.water || 0);
    const stress = Number(scores.stress || 0);

    const contributors = [
      ["sleepDeficit", W.sleepDeficit * clamp(10 - sleep, 0, 10)],
      ["stress", W.stress * stress],
      ["soreness", W.soreness * soreness],
      ["moodDeficit", W.moodDeficit * clamp(10 - mood, 0, 10)],
      ["hydrationDeficit", W.hydrationDeficit * clamp(10 - water, 0, 10)],
    ];

    contributors.sort((a, b) => b[1] - a[1]);
    const [key, val] = contributors[0] || ["analytics", 0];

    // якщо все майже нульове — називаємо “аналітика”
    if (val < 1.0) return "analytics";
    return key;
  }

  function setStatusChip(readiness, nsLoad) {
    // readiness high good; nsLoad high bad
    // status based on combination
    let text = "Moderate";
    let color = "#FFC72C";

    if (readiness >= 80 && nsLoad <= 40) { text = "Optimal"; color = "rgb(50, 205, 50)"; }
    else if (readiness < 60 || nsLoad >= 70) { text = "Overload"; color = "rgb(218, 62, 82)"; }

    elChip().style.color = color;
    elChipText().textContent = text;
  }

  function setRadialPct(pct) {
    const circumference = 289;
    const offset = circumference - (circumference * (pct / 100));
    elRadial().style.strokeDashoffset = String(offset);
    elToday().textContent = `${pct}%`;
  }

  // ---------- CANVAS TREND ----------
  function drawTrend(series) {
    const canvas = elCanvas();
    const tooltip = elTooltip();
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;

    // size
    const cssW = canvas.clientWidth;
    const cssH = canvas.clientHeight;
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const w = cssW;
    const h = cssH;

    const pad = 14;
    const left = pad, right = w - pad, top = pad, bottom = h - pad;

    ctx.clearRect(0, 0, w, h);

    // zones (premium)
    // high load zone top: red-ish, mid: gold, low: green-ish
    ctx.fillStyle = "rgba(218, 62, 82, .10)";
    ctx.fillRect(left, top, right - left, (bottom - top) * 0.33);
    ctx.fillStyle = "rgba(255, 199, 44, .08)";
    ctx.fillRect(left, top + (bottom - top) * 0.33, right - left, (bottom - top) * 0.34);
    ctx.fillStyle = "rgba(50, 205, 50, .08)";
    ctx.fillRect(left, top + (bottom - top) * 0.67, right - left, (bottom - top) * 0.33);

    // grid lines
    ctx.strokeStyle = "rgba(255,255,255,.10)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = top + ((bottom - top) * i) / 4;
      ctx.beginPath();
      ctx.moveTo(left, y);
      ctx.lineTo(right, y);
      ctx.stroke();
    }

    // points
    const n = series.length;
    const stepX = (right - left) / Math.max(1, n - 1);

    const pts = series.map((p, i) => {
      const x = left + stepX * i;
      const y = bottom - (clamp(p.value, 0, 100) / 100) * (bottom - top);
      return { ...p, x, y };
    });

    // area fill
    ctx.beginPath();
    ctx.moveTo(pts[0].x, bottom);
    pts.forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.lineTo(pts[pts.length - 1].x, bottom);
    ctx.closePath();
    ctx.fillStyle = "rgba(255,199,44,.16)";
    ctx.fill();

    // line
    ctx.beginPath();
    pts.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
    ctx.strokeStyle = "#FFC72C";
    ctx.lineWidth = 2;
    ctx.stroke();

    // last point highlight
    const last = pts[pts.length - 1];
    ctx.beginPath();
    ctx.arc(last.x, last.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.globalAlpha = 0.9;
    ctx.fill();
    ctx.globalAlpha = 1;

    // hover tooltip
    function onMove(ev) {
      const rect = canvas.getBoundingClientRect();
      const mx = ev.clientX - rect.left;
      const my = ev.clientY - rect.top;

      // find nearest point
      let best = null;
      let bestDist = Infinity;
      for (const p of pts) {
        const dx = p.x - mx;
        const dy = p.y - my;
        const d = dx * dx + dy * dy;
        if (d < bestDist) { bestDist = d; best = p; }
      }

      // show if close enough
      if (!best || bestDist > 900) { // ~30px radius
        tooltip.style.display = "none";
        return;
      }

      tooltip.style.display = "block";
      tooltip.style.left = `${best.x}px`;
      tooltip.style.top = `${best.y}px`;
      tooltip.textContent = `${best.label}: ${best.value}% • ${best.reason}`;
    }

    function onLeave() { tooltip.style.display = "none"; }

    // remove old listeners by resetting handlers (simple approach)
    canvas.onmousemove = onMove;
    canvas.onmouseleave = onLeave;
  }

  function renderReasonsPills(series) {
    const box = elReasons();
    box.innerHTML = "";
    series.forEach((p) => {
      const div = document.createElement("div");
      div.className = "wg-pill";
      div.innerHTML = `<span class="d">${p.label}</span><span class="r">${p.reason}</span>`;
      box.appendChild(div);
    });
  }

  // ---------- MAIN RENDER ----------
  function renderFromLocalStorage() {
    const rows = parseWellnessHistory();

    // якщо немає даних — робимо fallback, щоб не “порожньо”
    if (rows.length === 0) {
      const fallback = [
        { label: "01/07", value: 64, reason: "Аналітика" },
        { label: "01/08", value: 70, reason: "Не достатньо сну" },
        { label: "01/09", value: 62, reason: "Стрес / нервове напруження" },
        { label: "01/10", value: 58, reason: "Мʼязова втома / біль" },
        { label: "01/11", value: 66, reason: "Аналітика" },
        { label: "01/12", value: 61, reason: "Не достатньо сну" },
        { label: "01/13", value: 55, reason: "Стрес / нервове напруження" },
      ];
      setRadialPct(70);
      elAvg().textContent = "70%";
      elNsToday().textContent = "55%";
      setStatusChip(70, 55);
      drawTrend(fallback);
      renderReasonsPills(fallback);
      return;
    }

    const readinessSeries = rows.map(r => readinessPct(r.scores));
    const nsSeries = rows.map(r => nsLoadPct(r.scores));
    const reasons = rows.map(r => REASON_LABELS[primaryReason(r.scores)] || "Аналітика");

    const todayReadiness = readinessSeries[readinessSeries.length - 1];
    const weeklyAvg = Math.round(avg(readinessSeries));
    const todayNs = nsSeries[nsSeries.length - 1];

    setRadialPct(todayReadiness);
    elAvg().textContent = `${weeklyAvg}%`;
    elNsToday().textContent = `${todayNs}%`;
    setStatusChip(todayReadiness, todayNs);

    const trendData = rows.map((r, i) => ({
      label: dayLabelFromDate(r.date),
      value: nsSeries[i],
      reason: reasons[i]
    }));

    drawTrend(trendData);
    renderReasonsPills(trendData);
  }

  // ---------- FIREBASE SYNC ----------
  function ensureSyncThenRender() {
    // якщо firebase доступний — чекаємо юзера і синхронізуємо wellness
    if (window.firebase && firebase.auth) {
      firebase.auth().onAuthStateChanged(async (user) => {
        // якщо є syncWellnessFromFirebase — викликаємо
        if (user && typeof window.syncWellnessFromFirebase === "function") {
          try {
            await window.syncWellnessFromFirebase(user.uid);
          } catch (e) {
            console.warn("syncWellnessFromFirebase failed:", e);
          }
        }
        // після цього читаємо localStorage
        renderFromLocalStorage();
      });
      return;
    }

    // fallback: просто читаємо localStorage
    renderFromLocalStorage();
  }

  document.addEventListener("DOMContentLoaded", ensureSyncThenRender);
})();
