(function () {

  "use strict";
let UI_LOCK = false;

  // =========================
  // Timings / Flow
  // =========================
  const READY_HOLD_MS = 1200;     // full body + stable hold
  const COUNTDOWN_SECONDS = 3;    // 3..2..1
  const CALIB_SECONDS = 3;        // baseline calibration
  const TEST_SECONDS = 15;        // test length after FIRST jump

  // =========================
  // Jump params
  // =========================
  const HISTORY_KEY = "pac_jump_history_v1";
  // base defaults (як запасний варіант)
let takeoffDelta = 0.028;
let landDelta    = 0.018;
let minFlightMs  = 260;

// adaptive (після калібрування)
let takeoffDeltaA = null;
let landDeltaA    = null;
let minFlightMsA  = null;




  const minGapMs = 300;

  const stableWindow = 10;
  const stableEps = 0.006;
  const g = 9.81;

  // =========================
  // DOM
  // =========================
  const video = document.getElementById("jl-video");
  const canvas = document.getElementById("jl-canvas");
  const ctx = canvas.getContext("2d");

  const placeholder = document.getElementById("jlPlaceholder");
  const btnStart = document.getElementById("jlStartCam");
  const btnReset = document.getElementById("jlReset");
  const briefConfirm = document.getElementById("power-brief-confirm");
  const briefBox = document.getElementById("power-brief");

  const kJumps = document.getElementById("jlJumps");
  const kAvg = document.getElementById("jlFlight");   // repurpose as Avg height
  const kBest = document.getElementById("jlHeight");  // Best height
  const kState = document.getElementById("jlState");
  const attemptsEl = document.getElementById("attempts");
  const verdictEl = document.getElementById("jlVerdict");
const verdictWhyEl = document.getElementById("jlVerdictWhy");

  const qLib = document.getElementById("jlLib");
  const qCam = document.getElementById("jlCam");
  const qPose = document.getElementById("jlPose");
  const qFull = document.getElementById("jlFull");
  const qStable = document.getElementById("jlStable");

  const countdownEl = document.getElementById("jlCountdown");
  const chartCanvas = document.getElementById("jlChart");
  const isMobile = window.matchMedia("(max-width: 768px)").matches;

const camModal = document.getElementById("camModal");
const camClose = document.getElementById("camClose");
const countdownModalEl = document.getElementById("jlCountdownModal");

const videoModal = document.getElementById("jl-video-modal");
const canvasModal = document.getElementById("jl-canvas-modal");
const ti = (key, fallback, vars = null) => {
  const tr = window.PACPowerI18n?.ti?.(key) ?? fallback ?? key;
  if (!vars) return tr;
  return String(tr).replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? {}));
};
// ===== Snapshot overlay assets =====
const LOGO_SRC = "../assets/images/AK_logo.png"; // шлях як у твоєму HTML
const logoImg = new Image();
logoImg.src = LOGO_SRC;

function drawGoldPanel(ctx, x, y, w, h) {
  ctx.save();
  // темний напівпрозорий фон
  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.fillRect(x, y, w, h);

  // золота рамка
  ctx.strokeStyle = "rgba(212,175,55,0.95)";
  ctx.lineWidth = 3;
  ctx.strokeRect(x + 1.5, y + 1.5, w - 3, h - 3);

  ctx.restore();
}

function drawGoldText(ctx, text, x, y, size = 18, bold = true) {
  ctx.save();
  ctx.font = `${bold ? "700" : "500"} ${size}px system-ui, -apple-system, Segoe UI, Roboto, Arial`;
  ctx.fillStyle = "rgba(212,175,55,0.98)";
  ctx.shadowColor = "rgba(0,0,0,0.6)";
  ctx.shadowBlur = 6;
  ctx.fillText(text, x, y);
  ctx.restore();
}

function drawWhiteText(ctx, text, x, y, size = 14, bold = false) {
  ctx.save();
  ctx.font = `${bold ? "700" : "500"} ${size}px system-ui, -apple-system, Segoe UI, Roboto, Arial`;
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.shadowColor = "rgba(0,0,0,0.65)";
  ctx.shadowBlur = 6;
  ctx.fillText(text, x, y);
  ctx.restore();
}
// =========================
// LIVE HUD (НЕ ЛАМАЄ onResults)
// =========================
const hud = {
  msgTop: "ProAtletCare • POWER TEST",
  msgSub: "",
  attempts: 0,
  timeLeft: null,
  phase: "IDLE"
};

function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 2) {
  const words = String(text || "").split(" ");
  let line = "";
  let lines = 0;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const w = ctx.measureText(testLine).width;

    if (w > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, y);
      line = words[n] + " ";
      y += lineHeight;
      lines++;
      if (lines >= maxLines - 1) break;
    } else {
      line = testLine;
    }
  }

  // last line (with ellipsis if too long)
  let last = line.trim();
  while (ctx.measureText(last + "…").width > maxWidth && last.length > 0) {
    last = last.slice(0, -1);
  }
  if (last.length < line.trim().length) last = last + "…";
  ctx.fillText(last, x, y);
}
function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }
function drawOutlinedText(ctx, text, x, y, size, color = "#fff") {
  ctx.save();
  ctx.font = `900 ${size}px system-ui, -apple-system, Segoe UI, Roboto, Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.lineWidth = Math.max(6, size * 0.18);
  ctx.strokeStyle = "rgba(0,0,0,0.90)";
  ctx.strokeText(text, x, y);

  ctx.fillStyle = color;
  ctx.fillText(text, x, y);

  ctx.restore();
}


function drawLiveHUD(ctx, canvasEl) {
  const W = canvasEl.width || 0;
  const H = canvasEl.height || 0;
  if (!W || !H) return;

  const boxW = Math.round(W * 0.92);
  const boxH = 0; // ✅ нема фону/плашки

  const safeTop = Math.round(H * 0.10);
  const safeBottom = Math.round(H * 0.18);

  const yPreferred = Math.round(H * 0.12); // ✅ вище
  const yMin = safeTop;
  const yMax = H - safeBottom - boxH;
  const y = clamp(yPreferred, yMin, yMax);

  const titleSize = Math.min(34, Math.max(20, Math.round(W * 0.048)));
  const subSize   = Math.min(26, Math.max(16, Math.round(W * 0.038)));

  ctx.save();

  const centerX = Math.round(W / 2);

  const mainY = y;
  const subY  = y + Math.round(titleSize * 1.10);

  const title = String(hud.msgTop || "POWER TEST").toUpperCase();
  const sub   = String(hud.msgSub || "").toUpperCase();

  drawOutlinedText(ctx, title, centerX, mainY, titleSize, "#ffffff");
  if (sub) drawOutlinedText(ctx, sub, centerX, subY, subSize, "rgba(212,175,55,0.98)");

  ctx.restore();
}






// активні посилання
let activeVideo = video;
let activeCanvas = canvas;
let activeCtx = ctx;
let activeCountdownEl = countdownEl;

function useModalTargets() {
  // якщо елементи модалки не знайдені — падаємо назад на сторінку
  if (!videoModal || !canvasModal || !countdownModalEl) {
    console.warn("Modal targets missing, fallback to page targets");
    usePageTargets();
    return;
  }

  activeVideo = videoModal;
  activeCanvas = canvasModal;
  activeCtx = canvasModal.getContext("2d");
  activeCountdownEl = countdownModalEl;

  // важливо для Safari/iOS/Chrome: autoplay+playsinline+muted
  activeVideo.setAttribute("playsinline", "true");
  activeVideo.setAttribute("autoplay", "true");
  activeVideo.muted = true;
}

function usePageTargets() {
  activeVideo = video;
  activeCanvas = canvas;
  activeCtx = ctx;
  activeCountdownEl = countdownEl;

  if (activeVideo) {
    activeVideo.setAttribute("playsinline", "true");
    activeVideo.setAttribute("autoplay", "true");
    activeVideo.muted = true;
  }
}

function syncStartAvailability() {
  if (!btnStart) return;
  btnStart.disabled = !Boolean(briefConfirm?.checked);
  if (!briefConfirm?.checked) {
    btnStart.classList.add("cta-pulse");
    briefBox?.classList.add("is-pulsing");
  } else if (state === "IDLE" || state === "READY_SCAN") {
    btnStart.classList.add("cta-pulse");
    briefBox?.classList.remove("is-pulsing");
  }
}

function updateMotionState() {
  const c = document.getElementById("jlCountdown");
  if (c) c.classList.toggle("is-active", state === "COUNTDOWN" || state === "CALIBRATING" || state === "TESTING");
  if (!btnStart) return;
  const canPulse = Boolean(briefConfirm?.checked) && (state === "IDLE" || state === "READY_SCAN");
  btnStart.classList.toggle("cta-pulse", canPulse);
}


camClose?.addEventListener("click", () => {
  hardStopCamera();
  camModal.classList.add("hidden");
  usePageTargets();
  UI_LOCK = false;
});

const btnShare = document.getElementById("btnShare");
const shareCard = document.getElementById("shareCard");
const shareKpi = document.getElementById("shareKpi");
const shareVerdict = document.getElementById("shareVerdict");
const shareDate = document.getElementById("shareDate");

function buildShareCardFromLast() {
  const hist = getHistory();
const last = hist[0];

  const s = computeSummary(last?.series || []);
  shareKpi.innerHTML = `
    <div class="chip">Jumps ${s.count || 0}</div>
    <div class="chip">Avg ${(s.avg||0).toFixed(1)} cm</div>
    <div class="chip">Best ${(s.best||0).toFixed(1)} cm</div>
    <div class="chip">${s.trend_ok ? s.trend_label : "TREND N/A"}</div>
  `;
  shareVerdict.textContent = document.getElementById("jlVerdict")?.textContent || "—";
  shareDate.textContent = last?.date || new Date().toISOString().slice(0,19).replace("T"," ");
}

btnShare?.addEventListener("click", async () => {
  buildShareCardFromLast();
  shareCard.classList.remove("hidden");

  const canvas = await html2canvas(shareCard, { scale: 2, backgroundColor: null });
  shareCard.classList.add("hidden");

  const link = document.createElement("a");
  link.download = "ProAthleteCare_PowerTest.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
});

  // ✅ always get fresh DOM (fix for script before DOM ready)
const $ = (id) => document.getElementById(id);
function setKPI({ jumps, best, avg }) {
  const elJ = $("jlJumps");
  const elB = $("jlHeight");
  const elA = $("jlFlight");

  if (elJ && jumps != null) elJ.textContent = String(jumps);
  if (elB) elB.textContent = (best != null ? best.toFixed(1) + " cm" : "—");
  if (elA) elA.textContent = (avg  != null ? avg.toFixed(1)  + " cm" : "—");
}

  let chart = null;
let selectedTestIndex = null;

  function setPill(el, ok, text) {
    if (!el) return;
    el.classList.remove("ok", "bad");
    el.classList.add(ok ? "ok" : "bad");
    el.textContent = text;
  }

  function setCountdown(text, ok = true, big = false) {
  const el = activeCountdownEl || countdownEl;
  if (!el) return;

  el.classList.remove("ok", "bad", "big");
  el.classList.add(ok ? "ok" : "bad");
  if (big) el.classList.add("big");

  el.textContent = text;
}



  function showPlaceholder(show) {
    if (!placeholder) return;
    placeholder.classList.toggle("hidden", !show);
  }

  // =========================
  // Libs check
  // =========================
  const libsOk =
    typeof Pose !== "undefined" &&
    typeof drawConnectors !== "undefined" &&
    typeof drawLandmarks !== "undefined" &&
    typeof POSE_CONNECTIONS !== "undefined";

  setPill(qLib, libsOk, libsOk ? "Libs: OK" : "Libs: FAIL");
  if (!libsOk) {
    btnStart && (btnStart.disabled = true);
    return;
  }

  // =========================
  // Helpers
  // =========================
  class MovingAverage {
    constructor(n = 6) { this.n = n; this.buf = []; }
    push(x) {
      this.buf.push(x);
      if (this.buf.length > this.n) this.buf.shift();
      let s = 0;
      for (const v of this.buf) s += v;
      return s / this.buf.length;
    }
    reset() { this.buf = []; }
  }

  function flightTimeToHeightMeters(tSeconds) {
    const half = tSeconds / 2;
    return (g * half * half) / 2;
  }
// =========================
// History (Firestore only) - POWER
// =========================
const HISTORY_LIMIT = 50;

let POWER_HISTORY = []; // newest first
let POWER_UID = null;
let POWER_READ_ONLY = false;

function canWritePowerData({ notify = true } = {}) {
  if (!POWER_READ_ONLY) return true;
  if (notify) alert(ti("readOnlyDelegated", "Read-only mode: viewing delegated athlete."));
  return false;
}

function setPowerReadOnlyUi(readOnly) {
  const isLocked = Boolean(readOnly);
  const startBtn = document.getElementById("jlStartCam");
  const resetBtn = document.getElementById("jlReset");
  if (startBtn) {
    startBtn.disabled = isLocked;
    startBtn.style.opacity = isLocked ? "0.6" : "";
    startBtn.style.cursor = isLocked ? "not-allowed" : "";
  }
  if (resetBtn) {
    resetBtn.disabled = isLocked;
    resetBtn.style.opacity = isLocked ? "0.6" : "";
    resetBtn.style.cursor = isLocked ? "not-allowed" : "";
  }
}

function getUid() {
  const delegatedUid = String(window.pacDelegatedContext?.effectiveUserId || "").trim();
  if (delegatedUid) return delegatedUid;
  const globalUid = String(window.currentUserId || "").trim();
  if (globalUid) return globalUid;
  const authUid = String(firebase.auth().currentUser?.uid || "").trim();
  return authUid || null;

}

function powerCol(uid) {
  return window.db.collection("power_tests").doc(uid).collection("tests");
}


async function loadPowerHistoryFromFS(uid) {
  const snap = await powerCol(uid)
    .orderBy("createdAtMs", "desc")
    .limit(HISTORY_LIMIT)
    .get();

  POWER_HISTORY = snap.docs.map(d => ({ _id: d.id, ...d.data() })); // newest first
  return POWER_HISTORY;
}

// UI-джерело правди
function getHistory() {
  return POWER_HISTORY || [];
}
function sanitizePowerEntry(entry) {
  const cleanSeries = (Array.isArray(entry.series) ? entry.series : []).map(p => ({
    t_s: Number(p?.t_s || 0),
    flight_s: Number(p?.flight_s || 0),
    height_cm: Number(p?.height_cm || 0),
    snapshot: (typeof p?.snapshot === "string" ? p.snapshot : null)
  }));

  return {
    date: String(entry?.date || ""),
    createdAtMs: Number(entry?.createdAtMs || Date.now()),
    count: Number(entry?.count || cleanSeries.length || 0),
    best_cm: (entry?.best_cm == null ? null : Number(entry.best_cm)),
    avg_cm: (entry?.avg_cm == null ? null : Number(entry.avg_cm)),
    fatigue_pct: Number(entry?.fatigue_pct || 0),
    improve_pct: Number(entry?.improve_pct || 0),
    final_snapshot: (typeof entry?.final_snapshot === "string" ? entry.final_snapshot : null),
    series: cleanSeries
  };
}

async function addPowerTestToFS(entry) {
  if (!canWritePowerData()) throw new Error("READ_ONLY");
  const uid = getUid();
  if (!uid) throw new Error("NO_AUTH");

  const payload = sanitizePowerEntry({
    ...entry,
    userId: uid,
    source: "manual",
    createdAtMs: entry.createdAtMs || Date.now()
  });

  const ref = await powerCol(uid).add(payload);
  const saved = { _id: ref.id, ...payload };

  POWER_HISTORY.unshift(saved);
  POWER_HISTORY = POWER_HISTORY.slice(0, HISTORY_LIMIT);

  return saved;
}


async function patchPowerTest(docId, patch) {
  if (!canWritePowerData({ notify: false })) return;
  const uid = getUid();
  if (!uid || !docId) return;
  await powerCol(uid).doc(docId).set(patch, { merge: true });

  const i = POWER_HISTORY.findIndex(x => x._id === docId);
  if (i >= 0) POWER_HISTORY[i] = { ...POWER_HISTORY[i], ...patch };
}

async function deletePowerTestAt(index) {
  if (!canWritePowerData()) return;
  const uid = getUid();
  if (!uid) return;

  const item = POWER_HISTORY[index];
  if (!item?._id) return;

  await powerCol(uid).doc(item._id).delete();
  POWER_HISTORY.splice(index, 1);
}

async function clearPowerHistoryFS() {
  if (!canWritePowerData()) return;
  const uid = getUid();
  if (!uid) return;

  const snap = await powerCol(uid).get();
  const batch = window.db.batch();
  snap.docs.forEach(doc => batch.delete(doc.ref));
  await batch.commit();

  POWER_HISTORY = [];
}

  function loadHistory() {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch { return []; }
  }

  function saveHistoryEntry(entry) {
  // Firestore-only mode: history is managed by POWER_HISTORY from FS
  // Keeping this for backward compatibility (no-op).
  return getHistory();
}


  function median(arr){
  const a = arr.slice().sort((x,y)=>x-y);
  const n = a.length;
  if (!n) return null;
  const mid = Math.floor(n/2);
  return (n % 2) ? a[mid] : (a[mid-1] + a[mid]) / 2;
}

function trimmedMean(arr, trim = 0.2){
  const a = arr.slice().sort((x,y)=>x-y);
  const n = a.length;
  if (!n) return null;
  const k = Math.floor(n * trim);
  const slice = a.slice(k, Math.max(k+1, n-k));
  const s = slice.reduce((p,c)=>p+c,0);
  return s / slice.length;
}

function robustCentral(arr){
  // для маленьких n краще медіана, для більших — trimmed mean
  if (arr.length <= 5) return median(arr);
  return trimmedMean(arr, 0.2);
}

function computeSummary(seriesItems) {
  const arr = Array.isArray(seriesItems) ? seriesItems : [];
  const hs = arr.map(x => Number(x?.height_cm)).filter(h => Number.isFinite(h) && h >= 5);

  const out = {
    count: hs.length,
    best: null,
    avg: null,
    fatigue_pct: null,
    improve_pct: null,
    first_avg: null,
    last_avg: null,
    trend_ok: false,
    trend_label: "TREND N/A"
  };

  if (!hs.length) return out;

  out.best = Math.max(...hs);
  out.avg  = hs.reduce((a,b)=>a+b,0)/hs.length;

  // TREND: мінімум 6 для надійності, але можемо робити robust з 5
  const n = hs.length;
  if (n < 5) {
    out.trend_ok = false;
    return out;
  }

  const half = Math.max(2, Math.floor(n/2));      // щоб не було 1 vs 1
  const firstArr = hs.slice(0, half);
  const lastArr  = hs.slice(n - half);

  const first = robustCentral(firstArr);
  const last  = robustCentral(lastArr);

  out.first_avg = first;
  out.last_avg  = last;

  if (!Number.isFinite(first) || first <= 0 || !Number.isFinite(last)) {
    out.trend_ok = false;
    return out;
  }

  const deltaPct = ((last - first) / first) * 100;
  const improve = Math.max(0, deltaPct);
  const fatigue = Math.max(0, -deltaPct);

  // clamp
  out.improve_pct = Math.round(Math.min(100, improve));
  out.fatigue_pct = Math.round(Math.min(100, fatigue));

  out.trend_ok = true;
  out.trend_label = (out.improve_pct > 0)
    ? `IMPROVE +${out.improve_pct}%`
    : `FATIGUE ${out.fatigue_pct}%`;

  return out;
}
  function escapeHtml(s){
  return String(s ?? "")
    .replace(/&/g,"&amp;").replace(/</g,"&lt;")
    .replace(/>/g,"&gt;").replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");
}

function renderHistory(hist) {
  if (!attemptsEl) return;

  if (!hist.length) {
    attemptsEl.innerHTML = `<div class="history-empty">${ti("noAttempts", "No attempts yet.")}</div>`;
    return;
  }

  const items = hist; // newest first

  attemptsEl.innerHTML = items.map((t, idx) => {
    const testIndex = idx;
    const date = escapeHtml(t.date || "—");

    const s = computeSummary(Array.isArray(t.series) ? t.series : []);
    const jumps = Number.isFinite(s.count) ? s.count : Number(t.count || 0);

    const best = Number.isFinite(s.best) ? s.best : Number(t.best_cm || 0);
    const avg  = Number.isFinite(s.avg)  ? s.avg  : Number(t.avg_cm || 0);

    const fat = Number.isFinite(s.fatigue_pct) ? s.fatigue_pct : 0;
    const imp = Number.isFinite(s.improve_pct) ? s.improve_pct : 0;
    
    
// prev test (older)
const prev = hist[testIndex - 1];
let vsPrev = null;

if (prev) {
  const ps = computeSummary(Array.isArray(prev.series) ? prev.series : []);
  if (Number.isFinite(ps.avg) && Number.isFinite(s.avg)) {
    const diff = s.avg - ps.avg; // cm
    const pct = ps.avg > 0 ? (diff / ps.avg) * 100 : 0;
    vsPrev = { diff, pct };
  }
}

let vsPrevChip = "";
if (vsPrev && Number.isFinite(vsPrev.diff)) {
  const sign = vsPrev.diff >= 0 ? "+" : "−";
  const diffAbs = Math.abs(vsPrev.diff).toFixed(1);
  const pctAbs  = Math.abs(vsPrev.pct).toFixed(0);
  const cls = vsPrev.diff >= 0 ? "ok" : "warn";
  vsPrevChip = `<span class="chip ${cls}">vs prev ${sign}${diffAbs}cm (${sign}${pctAbs}%)</span>`;
}



    const trendLabel =
      (jumps < 4) ? "TREND N/A" :
      (imp > 0) ? `IMPROVE +${imp}%` : `FATIGUE ${fat}%`;

    const trendClass =
      (jumps < 4) ? "ok" :
      (fat >= 20) ? "bad" : (fat >= 10 ? "warn" : "ok");

    const deleteCompact = POWER_READ_ONLY ? "" : `
  <button class="test-delete"
    title="${escapeHtml(ti("deleteTest", "Delete test"))}"
    onclick="event.stopPropagation(); window.pacPowerDeleteTest(${testIndex})">
    ✕
  </button>`;

    const deletePrimary = POWER_READ_ONLY ? "" : `
  <button class="gold-button danger" type="button"
    onclick="window.pacPowerDeleteTest(${testIndex})">
    ${escapeHtml(ti("deleteTest", "Delete test"))}
  </button>`;

    return `
      <details class="test-entry">
        <summary class="test-summary">
  ${deleteCompact}

  <div class="ts-left">

            <div class="ts-title">Test #${hist.length - idx}</div>
            <div class="ts-date">${date}</div>
          </div>
          <div class="ts-right">
            <span class="chip">${jumps} jumps</span>
            <span class="chip">best ${best.toFixed(1)}cm</span>
            <span class="chip">avg ${avg.toFixed(1)}cm</span>
             ${vsPrevChip}
            <span class="chip ${trendClass}">${trendLabel}</span>
          </div>
        </summary>

        <div class="test-body">
          <div class="test-row">
            <div class="kv"><div class="k">First avg</div><div class="v">${Number(s.first_avg||0).toFixed(1)} cm</div></div>
            <div class="kv"><div class="k">Last avg</div><div class="v">${Number(s.last_avg||0).toFixed(1)} cm</div></div>
            <div class="kv"><div class="k">Trend</div><div class="v">${trendLabel}</div></div>
          </div>

          <div class="test-actions">
  <button class="gold-button secondary" type="button"
    onclick="window.pacPowerOpenTest(${testIndex})">
    ${escapeHtml(ti("openTestChart", "Open this test chart"))}
  </button>

  ${deletePrimary}
</div>

        </div>
      </details>
    `;
  }).join("");

  // ✅ accordion: only one open (ПІСЛЯ innerHTML)
  attemptsEl.querySelectorAll("details.test-entry").forEach(d => {
    d.addEventListener("toggle", () => {
      if (!d.open) return;
      attemptsEl.querySelectorAll("details.test-entry").forEach(x => {
        if (x !== d) x.open = false;
      });
    });
  });

  // ✅ optional: reopen selected test after rerender
  if (selectedTestIndex != null) {
    attemptsEl.querySelectorAll("details.test-entry").forEach(d => {
      const btn = d.querySelector(`button[onclick*="pacPowerOpenTest(${selectedTestIndex})"]`);
      if (btn) d.open = true;
    });
  }
}
async function finishTest() {

  testing = false;
  setState("FINISHED");

  const sum = computeSummary(series);
  window.__lastSeries = series.slice();

  const entry = {
    date: new Date().toISOString().slice(0,19).replace("T"," "),
    createdAtMs: Date.now(),
    count: sum.count || 0,
    best_cm: sum.best ?? null,
    avg_cm: sum.avg ?? null,
    fatigue_pct: sum.fatigue_pct ?? 0,
    improve_pct: sum.improve_pct ?? 0,
    series: series.slice(),
    final_snapshot: null
  };

  // 1) save to Firestore (create doc)
  let saved = null;
  try {
    
    saved = await addPowerTestToFS(entry);
    window.__lastSavedPowerId = saved?._id || null;

  } catch (e) {
    console.warn("Save power test failed:", e);
  }


  // 2) UI
  setKPI({ jumps: entry.count, best: entry.best_cm, avg: entry.avg_cm });
  renderHistory(getHistory());
  if (entry.series?.length) renderChart(entry.series);

  // 3) make final story shot
  let bestFlightS = 0;
  if (Array.isArray(series) && series.length) {
    let bestIdx = 0;
    for (let i = 1; i < series.length; i++) {
      if ((series[i].height_cm || 0) > (series[bestIdx].height_cm || 0)) bestIdx = i;
    }
    bestFlightS = Number(series[bestIdx]?.flight_s || 0);
  }

  let shot = null;
  try {
    shot = makeFinalVerticalStoryShot({ imageSource: activeVideo, sum, bestFlightS });
  } catch (e) {
    console.warn("Final screenshot failed", e);
  }

  // 4) store final_snapshot into Firestore
  if (shot && saved?._id) {
    try {
      await patchPowerTest(saved._id, { final_snapshot: shot });
    } catch (e) {
      console.warn("Patch final_snapshot failed:", e);
    }
  }

  // 5) show shot
  const box = document.getElementById("jlShots");
  if (box) {
    box.innerHTML = shot
      ? `<img class="jump-shot" src="${shot}" alt="final result">
         <button class="gold-button" id="saveFinalShot">${escapeHtml(ti("saveScreenshot", "📲 Save screenshot"))}</button>`
      : `<div class="history-empty">${escapeHtml(ti("screenshotFailed", "❌ Could not generate screenshot."))}</div>`;

    if (shot) {
      setTimeout(() => {
        document.getElementById("saveFinalShot")?.addEventListener("click", () => {
          const a = document.createElement("a");
          a.download = "ProAthleteCare_PowerTest_RESULT.jpg";
          a.href = shot;
          a.click();
        });
      }, 0);
    }
  }

  setCountdown(ti("cdownFinished", "✅ Test finished. Check chart and history ✅"));
}


// load selected test into chart
window.pacPowerOpenTest = function (index) {
  try {
    const hist = getHistory();

    const i = Number(index);
    selectedTestIndex = i;

    if (!Number.isFinite(i)) {
      console.warn("OPEN_TEST_BAD_INDEX", index);
      return;
    }
    
    const t = hist[i];
    const series = Array.isArray(t?.series) ? t.series : [];


    // ✅ якщо немає серії — все одно покажемо що є (best/avg з entry), але графік не малюємо
    const s = series.length ? computeSummary(series) : {
      count: Number(t?.count || 0),
      best: Number(t?.best_cm ?? t?.best ?? 0) || null,
      avg:  Number(t?.avg_cm  ?? t?.avg  ?? 0) || null,
      fatigue_pct: Number(t?.fatigue_pct ?? 0),
      improve_pct: Number(t?.improve_pct ?? 0)
    };

    // KPI
    setKPI({ jumps: s.count || 0, best: s.best, avg: s.avg });
    if (kState) kState.textContent = "HISTORY";
if (countdownEl) {
  countdownEl.classList.remove("ok","bad");
  countdownEl.classList.add("ok");
  countdownEl.textContent = `${ti("historyOpened", `📜 Opened test #${i + 1} (history)`, { index: i + 1 })}`;
}

// якщо після setKPI хтось перезатирає — побачимо одразу
setTimeout(() => {
}, 0);



    // Verdict
    const fat = Number(s.fatigue_pct || 0);
    const imp = Number(s.improve_pct || 0);

    if (verdictEl) {
      verdictEl.classList.remove("ok","warn","bad");
      if (fat >= 20) { verdictEl.classList.add("bad"); verdictEl.textContent = "RED • FATIGUE"; }
      else if (fat >= 10) { verdictEl.classList.add("warn"); verdictEl.textContent = "YELLOW • CAUTION"; }
      else { verdictEl.classList.add("ok"); verdictEl.textContent = imp > 0 ? "GREEN • IMPROVING" : "GREEN • STABLE"; }
    }
    if (verdictWhyEl) {
      verdictWhyEl.textContent =
        (fat >= 20) ? "Strong drop at the end of the test." :
        (fat >= 10) ? "Moderate drop — dose intensity carefully." :
        (imp > 0)   ? "Improved during test (activation effect)." :
                      "Stable power output.";
    }

    // Chart
    if (series.length) {
      renderChart(series);
    } else {
      // якщо немає серії — прибираємо графік (опційно)
      if (chart) { try { chart.destroy(); } catch {} chart = null; }
      console.warn("OPEN_TEST_NO_SERIES", { index: i, entry: t });
    }
const shots = series.map(p => p.snapshot).filter(Boolean);
const box = document.getElementById("jlShots");
if (box) {
  box.innerHTML = shots.length
    ? shots.map((src, i) => `<img class="jump-shot" src="${src}" alt="jump ${i+1}">`).join("")
    : `<div class="history-empty">${escapeHtml(ti("noSnapshots", "No snapshots in this test."))}</div>`;
}

  } catch (e) {
    console.error("pacPowerOpenTest error:", e);
  }
};
window.pacPowerDeleteTest = async function (index) {
  if (!canWritePowerData()) return;
  try {
    const i = Number(index);
    if (!Number.isFinite(i)) return;

    await deletePowerTestAt(i);

    if (selectedTestIndex === i) {
      selectedTestIndex = null;
      if (chart) { try { chart.destroy(); } catch {} chart = null; }
      const box = document.getElementById("jlShots");
      if (box) box.innerHTML = "";
      setKPI({ jumps: 0, best: null, avg: null });
      if (kState) kState.textContent = "IDLE";
      setCountdown(ti("cdownDeleted", "🗑️ Test deleted"));
    } else if (selectedTestIndex != null && selectedTestIndex > i) {
      selectedTestIndex--;
    }

    renderHistory(getHistory());
  } catch (e) {
    console.error("pacPowerDeleteTest error", e);
  }
};


window.pacPowerClearHistory = async function () {
  if (!canWritePowerData()) return;
  const ok = confirm(ti("clearConfirm", "Clear all test history? This cannot be undone."));
  if (!ok) return;

  await clearPowerHistoryFS();

  if (chart) { try { chart.destroy(); } catch {} chart = null; }
  selectedTestIndex = null;

  const box = document.getElementById("jlShots");
  if (box) box.innerHTML = `<div class="history-empty">${escapeHtml(ti("noData", "No data."))}</div>`;

  setKPI({ jumps: 0, best: null, avg: null });
  if (kState) kState.textContent = "IDLE";
  setCountdown(ti("cdownCleared", "✅ History cleared ✅"));

  renderHistory(getHistory());
};




  function renderChart(items) {
    if (!chartCanvas || typeof Chart === "undefined") return;

    const labels = items.map(x => x.t_s.toFixed(1));
    const data = items.map(x => Number(x.height_cm.toFixed(1)));

    if (chart) { try { chart.destroy(); } catch {} chart = null; }

    chart = new Chart(chartCanvas, {
      type: "line",
      data: {
        labels,
        datasets: [{
          label: (window.PACPowerI18n?.ti?.("chartDataset") || "Jump height (cm)"),
          data,
          tension: 0.25
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: true } },
        scales: {
          x: { title: { display: true, text: (window.PACPowerI18n?.ti?.("chartX") || "Time (s)") } },
          y: { title: { display: true, text: (window.PACPowerI18n?.ti?.("chartY") || "Height (cm)") } }
        }
      }
    });
  }
function makeJumpSnapshot({ imageSource, jumpNumber, heightCm, flightS, t_s }) {
  try {
    if (!imageSource) return null;

    // робимо окремий offscreen canvas
    const base = activeCanvas || canvas;
const w = base.width || 1280;
const h = base.height || 720;


    const off = document.createElement("canvas");
    off.width = w;
    off.height = h;
    const c = off.getContext("2d");

    // фон = кадр
    c.drawImage(imageSource, 0, 0, w, h);

    // верхня “gold” плашка
    const pad = 18;
    const topH = 86;
    drawGoldPanel(c, pad, pad, w - pad * 2, topH);

    // лого справа (маленьке)
    const logoSize = 56;
    const logoX = w - pad - logoSize;
    const logoY = pad + 15;
    if (logoImg && logoImg.complete) {
      c.save();
      c.globalAlpha = 0.95;
      c.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
      c.restore();
    }

    // текст зліва
    drawGoldText(c, "ProAthleteCare • POWER TEST", pad + 16, pad + 32, 18, true);
    drawWhiteText(c, `Jump #${jumpNumber}  •  t=${t_s.toFixed(1)}s`, pad + 16, pad + 56, 14, false);

    // центральний великий результат
    const main = `${heightCm.toFixed(1)} cm`;
    c.save();
    c.font = "800 54px system-ui, -apple-system, Segoe UI, Roboto, Arial";
    c.fillStyle = "rgba(212,175,55,0.98)";
    c.shadowColor = "rgba(0,0,0,0.65)";
    c.shadowBlur = 10;
    c.fillText(main, pad + 16, pad + topH + 70);
    c.restore();

    // маленькі метрики
    drawWhiteText(c, `Flight: ${flightS.toFixed(3)} s`, pad + 18, pad + topH + 100, 16, true);

    // watermark внизу
    c.save();
    c.globalAlpha = 0.25;
    c.fillStyle = "rgba(212,175,55,1)";
    c.font = "700 16px system-ui, -apple-system, Segoe UI, Roboto, Arial";
    c.fillText("AK • ProAthleteCare", pad, h - pad);
    c.restore();

    return off.toDataURL("image/jpeg", 0.92);
  } catch (e) {
    console.warn("makeJumpSnapshot error", e);
    return null;
  }
}
function makeFinalVerticalStoryShot({ imageSource, sum, bestFlightS }) {
  try {
    const W = 1080, H = 1920;

    const off = document.createElement("canvas");
    off.width = W; off.height = H;
    const c = off.getContext("2d");

    // ---------- helpers ----------
    const roundRect = (ctx, x, y, w, h, r) => {
      const rr = Math.min(r, w/2, h/2);
      ctx.beginPath();
      ctx.moveTo(x+rr, y);
      ctx.arcTo(x+w, y, x+w, y+h, rr);
      ctx.arcTo(x+w, y+h, x, y+h, rr);
      ctx.arcTo(x, y+h, x, y, rr);
      ctx.arcTo(x, y, x+w, y, rr);
      ctx.closePath();
    };

    // ---------- 1) background (center crop) ----------
    c.fillStyle = "#000";
    c.fillRect(0, 0, W, H);

    const iw = imageSource?.videoWidth || imageSource?.width || 0;
    const ih = imageSource?.videoHeight || imageSource?.height || 0;
    if (!iw || !ih) return null;

    const srcAspect = iw / ih;
    const dstAspect = W / H;

    let sx, sy, sw, sh;
    if (srcAspect > dstAspect) {
      sh = ih;
      sw = ih * dstAspect;
      sx = (iw - sw) / 2;
      sy = 0;
    } else {
      sw = iw;
      sh = iw / dstAspect;
      sx = 0;
      sy = (ih - sh) / 2;
    }
    c.drawImage(imageSource, sx, sy, sw, sh, 0, 0, W, H);

    // ---------- 2) premium overlays ----------
    // TOP: зробимо справжню "чорну оболонку" (не просто слабий градієнт)
    c.save();
    c.fillStyle = "rgba(0,0,0,0.78)";
    c.fillRect(0, 0, W, 220);
    const topFade = c.createLinearGradient(0, 220, 0, 420);
    topFade.addColorStop(0, "rgba(0,0,0,0.78)");
    topFade.addColorStop(1, "rgba(0,0,0,0.00)");
    c.fillStyle = topFade;
    c.fillRect(0, 220, W, 240);
    c.restore();

    // BOTTOM fade (щоб статистика читалась)
    const botG = c.createLinearGradient(0, H - 520, 0, H);
    botG.addColorStop(0, "rgba(0,0,0,0.00)");
    botG.addColorStop(1, "rgba(0,0,0,0.86)");
    c.fillStyle = botG;
    c.fillRect(0, H - 520, W, 520);

    // SAFE areas
    const SAFE_TOP = 140;
    const SAFE_BOTTOM = 230;
    const pad = 56;

    // ---------- 3) Header ----------
    // Title
    c.save();
    c.font = "900 48px system-ui, -apple-system, Segoe UI, Roboto, Arial";
    c.fillStyle = "rgba(212,175,55,0.98)";
    c.shadowColor = "rgba(0,0,0,0.65)";
    c.shadowBlur = 14;
    c.fillText("POWER TEST", pad, SAFE_TOP);
    c.restore();

    // Capsule top-right (повністю в чорній зоні)
    const capW = 260, capH = 74;
    const capX = W - pad - capW;
    const capY = SAFE_TOP - 64;

    c.save();
    c.fillStyle = "rgba(0,0,0,0.72)";
    roundRect(c, capX, capY, capW, capH, 38);
    c.fill();

    // тонкий gold stroke
    c.strokeStyle = "rgba(212,175,55,0.55)";
    c.lineWidth = 2;
    roundRect(c, capX, capY, capW, capH, 38);
    c.stroke();
    c.restore();

    // Logo + text inside capsule
    if (logoImg && logoImg.complete) {
      const s = 52;
      const lx = capX + 16;
      const ly = capY + (capH - s) / 2;
      c.save();
      c.globalAlpha = 0.98;
      c.drawImage(logoImg, lx, ly, s, s);
      c.restore();

      c.save();
      c.font = "800 22px system-ui, -apple-system, Segoe UI, Roboto, Arial";
      c.fillStyle = "rgba(255,255,255,0.92)";
      c.fillText("ProAthleteCare", lx + s + 12, capY + 46);
      c.restore();
    }

    // ---------- 4) Best result card (менше по ширині, вище, преміум) ----------
    const best = Number(sum?.best || 0);
    const avg  = Number(sum?.avg  || 0);
    const cnt  = Number(sum?.count || 0);
    const flight = Number(bestFlightS || 0);

    const cardW = Math.round(W * 0.86);
    const cardX = Math.round((W - cardW) / 2);
    const cardY = Math.round(H * 0.54);
    const cardH = 240;

    c.save();
    // glass
    c.fillStyle = "rgba(0,0,0,0.55)";
    roundRect(c, cardX, cardY, cardW, cardH, 44);
    c.fill();

    // gold border
    c.strokeStyle = "rgba(212,175,55,0.70)";
    c.lineWidth = 2.5;
    roundRect(c, cardX, cardY, cardW, cardH, 44);
    c.stroke();
    c.restore();

    // label
    c.save();
    c.font = "800 30px system-ui, -apple-system, Segoe UI, Roboto, Arial";
    c.fillStyle = "rgba(255,255,255,0.92)";
    c.fillText("BEST JUMP", cardX + 36, cardY + 70);
    c.restore();

    // big value
    c.save();
    c.font = "900 140px system-ui, -apple-system, Segoe UI, Roboto, Arial";
    c.fillStyle = "rgba(212,175,55,0.98)";
    c.shadowColor = "rgba(0,0,0,0.70)";
    c.shadowBlur = 18;
    c.fillText(`${best.toFixed(1)} cm`, cardX + 36, cardY + 185);
    c.restore();

    // ---------- 5) Bottom stats (без AK знизу) ----------
    const statsY = H - SAFE_BOTTOM - 120;

    c.save();
    c.font = "800 44px system-ui, -apple-system, Segoe UI, Roboto, Arial";
    c.fillStyle = "rgba(255,255,255,0.94)";
    c.fillText(`Avg ${avg.toFixed(1)} cm`, pad, statsY);
    c.fillText(`Jumps ${cnt}`, pad, statsY + 64);
    c.restore();

    // flight time line (тільки якщо є)
    if (flight > 0) {
      c.save();
      c.font = "800 40px system-ui, -apple-system, Segoe UI, Roboto, Arial";
      c.fillStyle = "rgba(212,175,55,0.95)";
      c.fillText(`Flight ${flight.toFixed(3)} s`, pad, statsY + 128);
      c.restore();
    }

    return off.toDataURL("image/jpeg", 0.95);
  } catch (e) {
    console.warn("vertical story shot failed", e);
    return null;
  }
}




  // =========================
  // State
  // =========================
  let stream = null;
  let rafId = 0;

  let state = "IDLE"; // IDLE, READY_SCAN, COUNTDOWN, CALIBRATING, ARMED, TESTING, FINISHED
  let readyOkSince = 0;
  let cdStartMs = 0;

  let calibrating = false;
  let baseline = null;
  let baselineSamples = [];
  let calibStartMs = 0;

  let armed = false;     // wait first jump
  let testing = false;   // 15 sec window active

  let testStartMs = 0;
  let testEndMs = 0;
  let series = [];

  const heightMA = new MovingAverage(6);
  let stableBuf = [];

  var jumpCount = 0;

  let flightStartMs = null;
  let lastJumpMs = 0;
  let peakHeightSm = null;      // max heightSm під час польоту
let peakFrameImage = null;    // results.image (кадр) на піку


  // =========================
  // Pose init
  // =========================
  const pose = new Pose({
    locateFile: (file) => `../js/libs/pose/${file}`
  });

  // Selfie on (front-like). For integrated camera on laptop it's ok.
  // If you prefer non-mirrored drawing, set selfieMode:false.
  pose.setOptions({
  modelComplexity: isMobile ? 0 : 1,   // 0 = швидше
  smoothLandmarks: true,
  selfieMode: true,
  minDetectionConfidence: 0.6,
  minTrackingConfidence: 0.6
});


  pose.onResults(onResults);

  // =========================
  // UI reset
  // =========================
  function uiReset() {
    setPill(qCam, false, "Camera: —");
    setPill(qPose, false, "Pose: —");
    setPill(qFull, false, "Full body: —");
    setPill(qStable, false, "Stable: —");

    kJumps && (kJumps.textContent = "0");
    kAvg && (kAvg.textContent = "—");
    kBest && (kBest.textContent = "—");
    kState && (kState.textContent = "IDLE");

    setCountdown(ti("cdownPressStart", "Tap \"Start Test\"."));
    showPlaceholder(true);

    renderHistory(getHistory());


    if (chart) { try { chart.destroy(); } catch {} chart = null; }
  }
const h = getHistory();
const last = h[0]; // newest first



  uiReset();

  // =========================
  // Camera: pick ONE integrated webcam
  // =========================
  function isVirtualLabel(label) {
    const s = (label || "").toLowerCase();
    const banned = ["virtual", "obs", "manycam", "snap", "droidcam", "iriun", "camera2", "epocam"];
    return banned.some(x => s.includes(x));
  }

  function scoreLabel(label) {
    const s = (label || "").toLowerCase();
    let score = 0;
    if (s.includes("integrated")) score += 50;
    if (s.includes("webcam")) score += 40;
    if (s.includes("built-in") || s.includes("builtin")) score += 30;
    if (s.includes("usb")) score += 10;
    return score;
  }

  async function pickIntegratedCameraId() {
    // After permission, labels become available.
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cams = devices.filter(d => d.kind === "videoinput");
      if (!cams.length) return "";

      const real = cams.filter(c => !isVirtualLabel(c.label));
      const list = real.length ? real : cams;

      list.sort((a,b) => scoreLabel(b.label) - scoreLabel(a.label));
      return (list[0] && list[0].deviceId) ? list[0].deviceId : "";
    } catch {
      return "";
    }
  }

  // =========================
  // Start/Stop camera
  // =========================
  function stopLoop() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
  }

  function hardStopCamera() {
    stopLoop();

    if (stream) {
      try { stream.getTracks().forEach(t => t.stop()); } catch {}
    }
    stream = null;

    showPlaceholder(true);
    setPill(qCam, false, "Camera: —");
  }

  async function waitForVideoSize(timeoutMs = 4000) {
  const t0 = performance.now();
  return new Promise((resolve) => {
    const tick = () => {
      const v = activeVideo || video;
      const w = v?.videoWidth || 0;
      const h = v?.videoHeight || 0;
      if (w > 2 && h > 2) return resolve(true);
      if (performance.now() - t0 > timeoutMs) return resolve(false);
      requestAnimationFrame(tick);
    };
    tick();
  });
}
async function getStreamWithFallback(primaryConstraints) {
  try {
    return await navigator.mediaDevices.getUserMedia(primaryConstraints);
  } catch (e1) {
    console.warn("getUserMedia primary failed:", e1?.name, e1?.message);

    // 1) якщо впав exact deviceId або aspectRatio — пробуємо простіше
    const fallback1 = { audio: false, video: { width: { ideal: 1280 }, height: { ideal: 720 } } };
    try {
      return await navigator.mediaDevices.getUserMedia(fallback1);
    } catch (e2) {
      console.warn("getUserMedia fallback1 failed:", e2?.name, e2?.message);

      // 2) останній шанс: взагалі будь-яка камера
      const fallback2 = { audio: false, video: true };
      return await navigator.mediaDevices.getUserMedia(fallback2);
    }
  }
}


  async function startCameraIntegrated() {
  setCountdown("[CAM] REQUESTING CAMERA…", true, true);

  setPill(qCam, false, "Camera: requesting…");

  hardStopCamera();

  const v = activeVideo || video;
  v.setAttribute("playsinline", "true");
  v.muted = true;

  // 1) request any camera first to unlock permission & labels
  let firstStream = null;
  try {
    firstStream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: { width: { ideal: 1280 }, height: { ideal: 720 } }
    });
  } catch (e) {
    console.error("CAMERA_PERMISSION_ERROR:", e);
    const name = e?.name || "Error";
    const msg  = e?.message || "";
    setCountdown(ti("cameraError", `❌ Camera: ${name}${msg ? " — " + msg : ""}`, { name, msg: msg ? ` — ${msg}` : "" }), false);
    setPill(qCam, false, `Camera: ${name}`);
    return false;
  }

  // stop it immediately; we re-open exact integrated deviceId
  try { firstStream.getTracks().forEach(t => t.stop()); } catch {}

  const deviceId = await pickIntegratedCameraId();

  const videoBase = {
    width:  { ideal: isMobile ? 1280 : 1920 },
    height: { ideal: isMobile ? 720  : 1080 },
    frameRate: { ideal: 30, max: isMobile ? 30 : 60 }
  };

  const constraints = {
    audio: false,
    video: deviceId
      ? { ...videoBase, deviceId: { exact: deviceId } }
      : videoBase
  };

  try {
    stream = await getStreamWithFallback(constraints);

    const c = activeCanvas || canvas;

    // 1) attach stream
    v.srcObject = stream;

    // 2) wait metadata
    await new Promise((resolve) => {
      const t = setTimeout(resolve, 2500);
      v.onloadedmetadata = () => { clearTimeout(t); resolve(); };
    });

    // 3) play
    await v.play();

    // 4) wait size
    const ok = await waitForVideoSize(4000);
    if (!ok) throw new Error("Video size 0x0");

    // 5) set canvas size AFTER video size exists
    const maxW = (isMobile ? 960 : 1280);
    const vw = v.videoWidth || maxW;
    const vh = v.videoHeight || Math.round(maxW * 9/16);

    const scale = Math.min(1, maxW / vw);
    c.width  = Math.round(vw * scale);
    c.height = Math.round(vh * scale);

    setPill(qCam, true, `Camera: OK (${c.width}x${c.height})`);
    showPlaceholder(false);

    stopLoop();
    rafId = requestAnimationFrame(loop);

    return true;
  } catch (e) {
    console.error("startCameraIntegrated error:", e);
    const name = e?.name || "Error";
    const msg  = e?.message || "";
    setCountdown(`❌ Camera error: ${name}${msg ? " — " + msg : ""}`, false);
    setPill(qCam, false, `Camera: ${name}`);
    hardStopCamera();
    return false;
  }
}



  // =========================
  // Video loop -> pose.send
  // =========================
  let sending = false;

function loop() {
  if (!stream) return;

  const v = activeVideo || video;
  const w = v.videoWidth || 0;
  const h = v.videoHeight || 0;

  if (w > 2 && h > 2 && !sending) {
    sending = true;
    pose.send({ image: v })
      .catch((e) => {
        console.error("pose.send error:", e);
        setPill(qPose, false, "Pose: ERROR");
      })
      .finally(() => {
        sending = false;
      });
  }

  rafId = requestAnimationFrame(loop);
}



  // =========================
  // Flow helpers
  // =========================
  function setState(s) {
    state = s;
    kState && (kState.textContent = s);
    updateMotionState();
  }

  function resetFlowVars() {
    readyOkSince = 0;
    cdStartMs = 0;

    calibrating = false;
    baseline = null;
    baselineSamples = [];
    calibStartMs = 0;

    armed = false;
    testing = false;

    testStartMs = 0;
    testEndMs = 0;

    series = [];
    jumpCount = 0;
    flightStartMs = null;
    lastJumpMs = 0;
    
peakHeightSm = null;
peakFrameImage = null;


    stableBuf = [];
    heightMA.reset();
    
setState("IDLE"); // ✅ додай тут

  
  }

  function startCalibration(now) {
    calibrating = true;
    baseline = null;
    baselineSamples = [];
    stableBuf = [];
    calibStartMs = now;

    setState("CALIBRATING");
    setCountdown(`CALIBRATING • HOLD STILL • ${CALIB_SECONDS}s`, true, true);

  }

  function armForFirstJump() {
  calibrating = false;
  armed = true;
  
  setState("GROUND"); // ✅ ОЦЕ ДОДАЙ ТУТ
  setCountdown("READY • FIRST JUMP STARTS 15s TEST", true, false);

}


  function start15sTest(now) {
    armed = false;
    testing = true;

    testStartMs = now;
    testEndMs = now + TEST_SECONDS * 1000;
    series = [];

    setState("TESTING");
    setCountdown(`GO • ${TEST_SECONDS.toFixed(1)}s`, true, false);

  }




    

  // =========================
  // Events
  // =========================
  
btnStart?.addEventListener("click", async () => {
  if (!briefConfirm?.checked) {
    setCountdown(ti("briefRequired", "Please read instructions and confirm before starting the test."), false);
    return;
  }
  if (UI_LOCK) return;
  UI_LOCK = true;

  if (isMobile) {
    camModal.classList.remove("hidden");
    useModalTargets();
  } else {
    usePageTargets();
  }

  resetFlowVars();

  kJumps.textContent = "0";
  kAvg.textContent = "—";
  kBest.textContent = "—";

  if (chart) { chart.destroy(); chart = null; }

  const ok = await startCameraIntegrated();
  if (!ok) { UI_LOCK = false; return; }

  setState("READY_SCAN");
  
  setCountdown(ti("moveBackDistance", "Step back ~2–3 meters (3–4 steps) so your full body and headroom are visible ✅"));

  UI_LOCK = false;
});

briefConfirm?.addEventListener("change", syncStartAvailability);
syncStartAvailability();
updateMotionState();



  btnReset?.addEventListener("click", () => {
    hardStopCamera();
    resetFlowVars();
    uiReset();
    setState("IDLE");
  });

  // Safety: stop camera when leaving tab
  document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    hardStopCamera();
    // НЕ робимо uiReset() тут, бо воно затирає KPI/графік
    // resetFlowVars(); теж краще не чіпати, якщо хочеш зберегти відкритий тест
  }
});

  


  window.addEventListener("beforeunload", () => {
    hardStopCamera();
  });

  // =========================
  // onResults
  // =========================
  function onResults(results) {
    // draw frame
    const c = activeCanvas || canvas;
const cctx = activeCtx || ctx;

cctx.save();
cctx.clearRect(0, 0, c.width, c.height);

if (results.image) {
  cctx.drawImage(results.image, 0, 0, c.width, c.height);
}


    const lm = results.poseLandmarks;
    const hasPose = !!lm && lm.length > 0;
    setPill(qPose, hasPose, hasPose ? "Pose: OK" : "Pose: NO");

    if (!hasPose) {
      setPill(qFull, false, "Full body: —");
      setPill(qStable, false, "Stable: —");
      cctx.restore();
      return;
    }

    drawConnectors(cctx, lm, POSE_CONNECTIONS, { lineWidth: 2 });
drawLandmarks(cctx, lm, { lineWidth: 1, radius: 2 });
// ✅ draw live HUD on top
// ❌ НЕ малюємо canvas HUD у mobile modal (DOM overlay краще)
if (
  typeof drawLiveHUD === "function" &&
  !(isMobile && activeCanvas === canvasModal)
) {
  drawLiveHUD(cctx, c);
}




    const vis = (i) => (lm[i] && lm[i].visibility != null ? lm[i].visibility : 0.0);
    const vSh = Math.min(vis(11), vis(12));
    const vHip = Math.min(vis(23), vis(24));
    const vAnk = Math.min(vis(27), vis(28));
    const fullOk = vSh > 0.5 && vHip > 0.5 && vAnk > 0.5;
    setPill(qFull, fullOk, fullOk ? "Full body: OK" : "Full body: BAD");


    if (!fullOk && hasPose) {
  // якщо щиколотки погано видно — зазвичай ти близько/низ кадру
  if (vAnk < 0.35) {
    setCountdown(ti("tooCloseFrame", "📏 You are too close or too low in frame — step back 2–3 steps ✅"), false);
  }
}

    const point = (i) => (lm[i] ? { y: lm[i].y, v: lm[i].visibility ?? 0 } : null);
    const la = point(27), ra = point(28); // ankles
const lh = point(29), rh = point(30); // heels

let y;
if (la && ra && la.v > 0.5 && ra.v > 0.5) y = (la.y + ra.y) / 2;
else if (lh && rh && lh.v > 0.5 && rh.v > 0.5) y = (lh.y + rh.y) / 2;
else y = lm[24].y; // hip fallback


    const heightRaw = 1.0 - y;
    const heightSm = heightMA.push(heightRaw);
    // ✅ velocity (anti-fake)
if (window.__prevHeightSm == null) window.__prevHeightSm = heightSm;
const vSm = heightSm - window.__prevHeightSm;
window.__prevHeightSm = heightSm;


    stableBuf.push(heightSm);
    if (stableBuf.length > stableWindow) stableBuf.shift();

    const stable =
      stableBuf.length === stableWindow
        ? (Math.max(...stableBuf) - Math.min(...stableBuf) < stableEps)
        : false;
// ✅ baseline drift correction (тільки коли стоїмо на землі)
if (!testing && baseline && stable) {
  baseline = baseline * 0.98 + heightSm * 0.02;
}
if (testing && state === "GROUND" && baseline) {
  baseline = baseline * 0.995 + heightSm * 0.005;
}

    setPill(qStable, stable, stable ? "Stable: OK" : "Stable: —");
// ===== Live coach HUD hints =====
hud.attempts = (testing || armed) ? (jumpCount + (state === "FLIGHT" ? 1 : 0)) : jumpCount;

hud.phase = state;

if (!fullOk) {
  hud.msgTop = ti("hudMoveBackTop", "STEP BACK");
  hud.msgSub = ti("hudMoveBackSub", "Full body must be visible in frame");
} else if (!stable && (state === "READY_SCAN" || state === "COUNTDOWN" || calibrating)) {
  hud.msgTop = ti("hudStillTop", "STAND STILL");
  hud.msgSub = ti("hudStillSub", "Calibration • 1–2 seconds");
} else if (state === "READY_SCAN") {
  hud.msgTop = ti("hudReadyTop", "✅ Ready");
  hud.msgSub = ti("hudReadySub", "Full body in frame + stay still for 1–2 sec");
} else if (state === "COUNTDOWN") {
  hud.msgTop = ti("hudCountdownTop", "⏳ Starting soon");
  hud.msgSub = ti("hudCountdownSub", "Do not move. Get ready.");
} else if (calibrating) {
  hud.msgTop = ti("hudCalibTop", "⚙️ Calibrating");
  hud.msgSub = ti("hudCalibSub", "Stand still — measuring baseline");
} else if (armed) {
  hud.msgTop = ti("hudArmedTop", "🚀 Start jumping");
  hud.msgSub = ti("hudArmedSub", "First jump starts the 15s test");
} else if (testing) {
  hud.msgTop = ti("hudTestingTop", "🔥 TEST IN PROGRESS");
  hud.msgSub = ti("hudTestingSub", "Jump for 15 seconds with steady rhythm");
} else if (state === "FINISHED") {
  hud.msgTop = ti("hudFinishedTop", "✅ TEST COMPLETED");
  hud.msgSub = ti("hudFinishedSub", "Saved to history + screenshot captured");
} else {
  hud.msgTop = ti("shareTitle", "ProAtletCare • POWER TEST");
  hud.msgSub = "";
}

const now = performance.now();

    // =========================
    // READY_SCAN -> COUNTDOWN
    // =========================
    if (state === "READY_SCAN") {
      if (fullOk && stable) {
        if (!readyOkSince) readyOkSince = now;
        const held = now - readyOkSince;
        const left = Math.max(0, READY_HOLD_MS - held);
        setCountdown(`STAND STILL • ${Math.ceil(left/1000)}s`, true, true);

        if (held >= READY_HOLD_MS) {
          readyOkSince = 0;
          startCalibration(now);

        }
      } else {
        readyOkSince = 0;
        setCountdown("MOVE BACK • FULL BODY IN FRAME • HOLD STILL", false, true);


      }
    }

    

    // =========================
    // CALIBRATING
    // =========================
    if (calibrating) {
      if (fullOk && stable) baselineSamples.push(heightSm);

      if (now - calibStartMs >= CALIB_SECONDS * 1000) {
        calibrating = false;

        if (baselineSamples.length < 20) {
          baseline = null;
          setState("READY_SCAN");
          setCountdown(ti("calibrationFailed", "❌ Calibration failed. Stand still and try again."), false);
        } else {
          baselineSamples.sort((a,b)=>a-b);
baseline = baselineSamples[Math.floor(baselineSamples.length / 2)];
// ✅ adaptive thresholds from calibration noise
const sorted = baselineSamples.slice().sort((a,b)=>a-b);
const p10 = sorted[Math.floor(sorted.length * 0.10)];
const p90 = sorted[Math.floor(sorted.length * 0.90)];
const noise = Math.max(0.002, (p90 - p10)); // “розкид” коли стоїш

takeoffDeltaA = Math.max(takeoffDelta, noise * 3.5);
landDeltaA    = Math.max(landDelta,    noise * 2.2);
minFlightMsA  = Math.max(minFlightMs,  240);



// стартуємо countdown ПІСЛЯ калібровки
cdStartMs = now;
setState("COUNTDOWN");
setCountdown(`START IN • ${COUNTDOWN_SECONDS}`, true, true);


        }
      }
    }
    if (state === "COUNTDOWN") {
  const elapsed = (now - cdStartMs) / 1000;
  const remain = COUNTDOWN_SECONDS - elapsed;
  const shown = Math.ceil(remain);

  if (shown > 0) {
    setCountdown(`START IN • ${shown}`, true, true);

  } else {
    armForFirstJump();
  }
}

    // =========================
    // ARMED -> first jump starts test
    // =========================
    if (armed && baseline && fullOk) {
      const td = (takeoffDeltaA ?? takeoffDelta);
const airborne = (heightSm > baseline + td) && (vSm > 0.002);


      if (airborne && (now - lastJumpMs) > minGapMs) {
        // first jump -> start test
        lastJumpMs = now;
        flightStartMs = now;
        start15sTest(now);
        // we are already in air:
        setState("FLIGHT");

      }
    }

    // =========================
    // TESTING timer
    // =========================
    if (testing) {
  const leftMs = testEndMs - now;
  if (leftMs > 0) {
    const leftS = leftMs / 1000;
    hud.timeLeft = leftS;
    setCountdown(`GO • ${leftS.toFixed(1)}s`, true, false);

  } else {
    hud.timeLeft = 0;
    finishTest();
    cctx.restore();
    return;
  }
} else {
  hud.timeLeft = null;
}


    // =========================
    // Jump detection (when testing)
    // =========================
    if (testing && baseline && fullOk) {
      const td = (takeoffDeltaA ?? takeoffDelta);
const ld = (landDeltaA ?? landDelta);

const airborne   = heightSm > baseline + td;
const nearGround = heightSm < baseline + ld;


      if (state === "GROUND") {
        if (airborne && (now - lastJumpMs) > minGapMs) {
          setState("FLIGHT");
          flightStartMs = now;
          peakHeightSm = heightSm;
peakFrameImage = results.image || null;

        }
      } else if (state === "FLIGHT") {
        // ---- track peak during flight (best frame) ----
if (peakHeightSm == null || heightSm > peakHeightSm) {
  peakHeightSm = heightSm;
  // зберігаємо сам кадр results.image (HTMLVideoElement/CanvasImageSource)
  // щоб потім намалювати його в snapshot
  peakFrameImage = results.image || null;
}

        if (nearGround) {
          const flightMs = now - (flightStartMs ?? now);
          const mf = (minFlightMsA ?? minFlightMs);
if (flightMs >= mf) {

            jumpCount += 1;
            lastJumpMs = now;

            const flightS = flightMs / 1000;
            const h = flightTimeToHeightMeters(flightS);
            const hCm = h * 100;
          const t_s = (now - testStartMs) / 1000;



            const peakFrame = peakFrameImage || results.image;

const snap = makeJumpSnapshot({
  imageSource: peakFrame,
  jumpNumber: jumpCount ,
  heightCm: hCm,
  flightS: flightS,
  t_s: t_s
});

series.push({
  t_s,
  flight_s: flightS,
  height_cm: hCm,
  snapshot: snap || null
});



peakHeightSm = null;
peakFrameImage = null;


            setState("GROUND");
            flightStartMs = null;
          
          }
        }
      }
    }

    cctx.restore();
  }


// ✅ дебаг/консоль
window.computeSummary = computeSummary;
window.pacPowerRenderHistory = () => renderHistory(getHistory());
window.pacPowerHistory = () => getHistory();


firebase.auth().onAuthStateChanged(async (u) => {
  if (!u) return;
  const scope = (typeof window.pacResolveDelegatedContext === "function")
    ? await window.pacResolveDelegatedContext(u, { db: window.db || firebase.firestore() })
    : {
        allowed: true,
        effectiveUserId: String(window.currentUserId || u.uid).trim(),
        backHref: "coach-dashboard.html"
      };
  if (!scope.allowed) {
    alert(ti("accessDeniedAthlete", "Access denied for this athlete."));
    window.location.href = scope.backHref || "coach-dashboard.html";
    return;
  }
  if (typeof window.pacRenderDelegatedIndicator === "function") {
    window.pacRenderDelegatedIndicator(scope);
  }

  POWER_UID = String(scope.effectiveUserId || u.uid).trim();
  POWER_READ_ONLY = Boolean(scope.isDelegated && String(scope.authUid || u.uid).trim() !== POWER_UID);
  setPowerReadOnlyUi(POWER_READ_ONLY);

  try {
    await loadPowerHistoryFromFS(POWER_UID);
    renderHistory(getHistory());
  } catch (e) {
    console.warn("Power history load failed:", e);
  }
});
window.pacPowerWriteTest = async () => {
  const entry = {
    date: new Date().toISOString(),
    createdAtMs: Date.now(),
    count: 1,
    best_cm: 10,
    avg_cm: 10,
    fatigue_pct: 0,
    improve_pct: 0,
    series: [{ t_s: 0, flight_s: 0.3, height_cm: 10, snapshot: null }],
    final_snapshot: null
  };
  const saved = await addPowerTestToFS(entry);
  window.__lastSavedPowerId = saved?._id || null;
};

})();

