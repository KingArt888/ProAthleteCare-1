// js/auth-guard.js
// PATCH START: unified guard (public allowlist + private + verify + absolute redirects)
(function () {
  function normalizeRole(raw) {
    const role = String(raw || "").toLowerCase();
    if (role === "trainer") return "coach";
    return role || "athlete";
  }

  // Absolute navigation helper (never breaks relative folders)
  function go(toPath) {
    window.location.href = new URL(toPath, window.location.origin).toString();
  }

  function normPath(p) {
    // "/a/b/" -> "/a/b"
    return (p || "").replace(/\/+$/, "") || "/";
  }

  function isAppChannelMode() {
    try {
      const q = new URLSearchParams(window.location.search || "");
      if (q.get("mobile") === "1" || q.get("app") === "1") return true;
    } catch {}
    try {
      return localStorage.getItem("pac_app_mode") === "1";
    } catch {
      return false;
    }
  }

  function buildAppModeQuery() {
    const out = new URLSearchParams();
    out.set("mobile", "1");
    out.set("app", "1");

    try {
      const q = new URLSearchParams(window.location.search || "");
      ["appv", "uid", "channel"].forEach((key) => {
        const value = String(q.get(key) || "").trim();
        if (value) out.set(key, value);
      });
    } catch {}

    try {
      const appv = String(localStorage.getItem("pac_app_build") || "").trim();
      const uid = String(localStorage.getItem("pac_app_uid") || "").trim();
      const channel = String(localStorage.getItem("pac_app_channel") || "").trim();
      if (appv && !out.get("appv")) out.set("appv", appv);
      if (uid && !out.get("uid")) out.set("uid", uid);
      if (channel && !out.get("channel")) out.set("channel", channel);
    } catch {}

    const qs = out.toString();
    return qs ? `?${qs}` : "";
  }

  // Returns true if current path ends with one of allowed public endpoints
  function isPublicPath(pathname) {
    const path = normPath(pathname);

    // PUBLIC allowlist (must be accessible without login)
    const PUBLIC_ENDS = [
      "/",
      "/ProAthleteCare-1/gps-iphone-v14/platform.html",
      "/ProAthleteCare-1/gps-iphone-v14/pages/regist.html",
      "/ProAthleteCare-1/gps-iphone-v14/pricing.html",
      "/ProAthleteCare-1/gps-iphone-v14/checkout.html",
      "/ProAthleteCare-1/gps-iphone-v14/payment-success.html",
      "/ProAthleteCare-1/gps-iphone-v14/payment-cancel.html",
      "/ProAthleteCare-1/gps-iphone-v14/privacy.html",
      "/ProAthleteCare-1/gps-iphone-v14/terms.html",
      "/ProAthleteCare-1/gps-iphone-v14/impressum.html",
      "/ProAthleteCare-1/gps-iphone-v14/pages/app-access-required.html",
    ];

    // root "/" case
    if (path === "/") return true;

    // Works even if site is deployed under subfolder (/ProAtletCare/index.html etc.)
    return PUBLIC_ENDS.some((end) => end !== "/" && path.endsWith(end));
  }

  function isAuthPage(pathname) {
    const path = normPath(pathname);
    return path.endsWith("/pages/regist.html") || path.endsWith("/pages/auth.html");
  }

  const AUTH_REDIRECT = "/ProAthleteCare-1/gps-iphone-v14/pages/regist.html";
  const CLIENT_ERRORS_COL = "client_errors";
  const CLIENT_ERRORS_LIMIT_PER_SESSION = 12;
  const CLIENT_ERROR_DEDUP_MS = 5 * 60 * 1000;
  const CLIENT_ERROR_IGNORE = [
    /ResizeObserver loop limit exceeded/i,
    /NetworkError when attempting to fetch resource/i,
    /The operation was aborted/i
  ];

  function clampText(v, max) {
    return String(v ?? "").trim().slice(0, max);
  }

  function currentLang() {
    try {
      return String(localStorage.getItem("pac_lang") || "uk").toLowerCase().slice(0, 8);
    } catch {
      return "uk";
    }
  }

  function shouldSkipClientError(message) {
    return CLIENT_ERROR_IGNORE.some((rx) => rx.test(message));
  }

  function ensureClientErrorLogger(context) {
    const prev = window.__pacClientErrorCtx || {};
    window.__pacClientErrorCtx = {
      ...prev,
      ...context,
      page: `${window.location.pathname}${window.location.search || ""}`
    };

    if (window.__pacClientErrorLoggerInstalled) return;
    window.__pacClientErrorLoggerInstalled = true;

    const seen = new Map();
    let sentCount = 0;

    const logClientError = (kind, payload) => {
      try {
        if (sentCount >= CLIENT_ERRORS_LIMIT_PER_SESSION) return;
        if (!firebase || typeof firebase.firestore !== "function") return;

        const ctx = window.__pacClientErrorCtx || {};
        const uid = String(ctx.uid || "");
        if (!uid) return;

        const message = clampText(payload?.message || "", 220);
        if (!message || shouldSkipClientError(message)) return;

        const source = clampText(payload?.source || "", 180);
        const fp = `${kind}|${source}|${message}`;
        const now = Date.now();
        const last = seen.get(fp) || 0;
        if (now - last < CLIENT_ERROR_DEDUP_MS) return;
        seen.set(fp, now);

        sentCount += 1;
        const dbx = window.db || firebase.firestore();
        dbx.collection(CLIENT_ERRORS_COL).add({
          uid,
          role: String(ctx.role || "athlete"),
          delegatedUid: String(ctx.delegatedUid || uid),
          isAdmin: !!ctx.isAdmin,
          kind: String(kind || "error"),
          message,
          stack: clampText(payload?.stack || "", 1500),
          source,
          line: Number(payload?.line || 0) || 0,
          col: Number(payload?.col || 0) || 0,
          page: clampText(ctx.page || window.location.pathname, 180),
          lang: currentLang(),
          ua: clampText(navigator.userAgent || "", 220),
          ts: now
        }).catch(() => {});
      } catch {
        // no-op
      }
    };

    window.addEventListener("error", (ev) => {
      const msg = clampText(ev?.message || "window.onerror", 220);
      logClientError("onerror", {
        message: msg,
        stack: ev?.error?.stack || "",
        source: ev?.filename || "",
        line: ev?.lineno || 0,
        col: ev?.colno || 0
      });
    }, true);

    window.addEventListener("unhandledrejection", (ev) => {
      const reason = ev?.reason;
      let message = "Unhandled promise rejection";
      let stack = "";

      if (reason && typeof reason === "object" && reason.message) {
        message = String(reason.message);
        stack = String(reason.stack || "");
      } else if (typeof reason === "string") {
        message = reason;
      } else if (reason != null) {
        try { message = JSON.stringify(reason); } catch {}
      }

      logClientError("unhandledrejection", {
        message: clampText(message, 220),
        stack: clampText(stack, 1500),
        source: ""
      });
    });
  }

  function deriveUserDisplayName(profile, fallbackUid = "") {
    const first = String(profile?.firstName || "").trim();
    const last = String(profile?.lastName || "").trim();
    const full = `${first} ${last}`.trim();
    if (full) return full;

    const displayName = String(profile?.displayName || "").trim();
    if (displayName) return displayName;

    const email = String(profile?.email || "").trim();
    if (email && email.includes("@")) return email.split("@")[0];

    const fallback = String(fallbackUid || "").trim();
    return fallback || "Athlete";
  }

  function parseDelegatedParams() {
    const qs = new URLSearchParams(window.location.search || "");
    return {
      viewUserId: String(qs.get("userId") || "").trim(),
      fromAdmin: qs.get("fromAdmin") === "1",
      fromCoach: qs.get("fromCoach") === "1",
      asAdmin: qs.get("asAdmin") === "1",
      coachId: String(qs.get("coachId") || "").trim()
    };
  }

  function delegatedBackHref(params) {
    if (params.fromAdmin) return "/ProAthleteCare-1/gps-iphone-v14/admin.html";
    if (params.asAdmin && params.coachId) {
      return `/ProAthleteCare-1/gps-iphone-v14/pages/coach-dashboard.html?asAdmin=1&coachId=${encodeURIComponent(params.coachId)}`;
    }
    if (params.fromCoach || params.asAdmin) return "/ProAthleteCare-1/gps-iphone-v14/pages/coach-dashboard.html";
    return "/ProAthleteCare-1/gps-iphone-v14/pages/dashboard_user.html";
  }

  function renderDelegatedIndicator(scope) {
    const id = "pac-delegated-indicator";
    const existing = document.getElementById(id);
    if (!scope?.isDelegated) {
      if (existing) existing.remove();
      return;
    }

    const main = document.querySelector(".main-content") || document.querySelector("main");
    if (!main) return;

    const badge = existing || document.createElement("div");
    badge.id = id;
    badge.style.cssText = [
      "margin: 0 0 10px 0",
      "padding: 8px 12px",
      "border-radius: 8px",
      "border: 1px solid rgba(255,199,44,0.45)",
      "background: rgba(255,199,44,0.10)",
      "color: #FFC72C",
      "font-size: 12px",
      "font-weight: 800",
      "letter-spacing: 0.2px"
    ].join(";");
    badge.textContent = `Viewing athlete: ${scope.targetName || scope.effectiveUserId || "—"}`;

    if (!existing) {
      const title = main.querySelector("h1, h2, h3");
      if (title && title.parentNode === main && title.nextSibling) {
        main.insertBefore(badge, title.nextSibling);
      } else if (title && title.parentNode === main) {
        main.appendChild(badge);
      } else {
        main.prepend(badge);
      }
    }
  }

  function currentPageName() {
    return String(window.location.pathname.split("/").pop() || "").toLowerCase();
  }

  function isOwnAthleteWorkspacePage() {
    const page = currentPageName();
    if (!/^(dashboard(_user)?|wellness|injury|load-season|daily-individual|weekly-individual|weight-control|power)\.html$/i.test(page)) {
      return false;
    }
    const params = parseDelegatedParams();
    return !params.viewUserId && !params.fromAdmin && !params.fromCoach && !params.asAdmin;
  }

  function applyRoleShell(scope) {
    const isAdmin = Boolean(scope?.isAdmin);
    const selectors = [
      "#nav-admin-panel",
      "#cwe-nav-admin-panel",
      "#admin-nav-admin-panel",
      "[data-admin-only-nav]",
      "a[href$='../admin.html']",
      "a[href$='admin.html']"
    ];
    const hideAdminLinks = () => {
      document.querySelectorAll(selectors.join(",")).forEach((el) => {
        if (isAdmin) {
          el.hidden = false;
          el.style.display = "";
          el.removeAttribute("aria-hidden");
        } else {
          el.hidden = true;
          el.style.display = "none";
          el.setAttribute("aria-hidden", "true");
        }
      });
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", hideAdminLinks, { once: true });
    } else {
      hideAdminLinks();
    }
  }

  async function resolveDelegatedContext(user, options = {}) {
    const dbx = options.db || window.db || firebase.firestore();
    const SUPER_COACH_UID = "UJXRfD4spSSbNsiZOrFBSvuZkP72";
    const params = parseDelegatedParams();
    const requestedDelegation = Boolean(
      params.viewUserId && (params.fromAdmin || params.fromCoach || params.asAdmin)
    );

    const meSnap = await dbx.collection("users").doc(user.uid).get().catch(() => null);
    const me = meSnap?.exists ? (meSnap.data() || {}) : {};
    const role = normalizeRole(me.role);
    const isAdminEmail = String(user.email || "").toLowerCase() === "kulyk015@gmail.com";
    const isAdmin = isAdminEmail;
    const isCoach = !isAdmin && role === "coach";
    const isSuper = isAdmin || user.uid === SUPER_COACH_UID;

    let allowed = true;
    let denialReason = "";
    let effectiveUserId = user.uid;
    let targetProfile = me;
    let isDelegated = false;

    if (requestedDelegation) {
      const targetUid = params.viewUserId;
      const isSelf = targetUid === user.uid;

      if (isSelf) {
        effectiveUserId = user.uid;
        targetProfile = me;
      } else if (isAdmin && (params.fromAdmin || params.asAdmin || params.fromCoach)) {
        effectiveUserId = targetUid;
      } else if (isCoach && params.fromCoach) {
        const athleteSnap = await dbx.collection("users").doc(targetUid).get().catch(() => null);
        const athlete = athleteSnap?.exists ? (athleteSnap.data() || {}) : {};
        const athleteCoachId = String(athlete.coachId || "").trim();
        if (athleteSnap?.exists && athleteCoachId === user.uid) {
          effectiveUserId = targetUid;
          targetProfile = athlete;
        } else {
          allowed = false;
          denialReason = athleteSnap?.exists ? "not-assigned-athlete" : "athlete-not-found";
        }
      } else {
        allowed = false;
        denialReason = "delegation-not-allowed";
      }

      if (allowed && effectiveUserId !== user.uid && (!targetProfile || targetProfile === me)) {
        const targetSnap = await dbx.collection("users").doc(effectiveUserId).get().catch(() => null);
        targetProfile = targetSnap?.exists ? (targetSnap.data() || {}) : {};
      }

      if (allowed && effectiveUserId !== user.uid) {
        isDelegated = true;
      }
    }

    const targetName = deriveUserDisplayName(targetProfile, effectiveUserId);
    const scope = {
      allowed,
      denialReason,
      backHref: delegatedBackHref(params),
      role: isAdmin ? "admin" : (role === "coach" ? "coach" : "athlete"),
      isAdmin,
      isCoach,
      isSuper,
      canCoachEdit: Boolean(isSuper || isCoach),
      authUid: user.uid,
      effectiveUserId,
      isDelegated,
      targetName,
      params,
      meProfile: me,
      targetProfile
    };

    window.pacDelegatedContext = scope;
    window.currentUserId = scope.effectiveUserId;
    window.isAdmin = scope.isAdmin;
    window.isCoach = scope.isCoach;
    window.isSuper = scope.isSuper;
    window.userRole = scope.role;

    return scope;
  }

  window.pacResolveDelegatedContext = resolveDelegatedContext;
  window.pacRenderDelegatedIndicator = renderDelegatedIndicator;
  window.pacGetEffectiveUserId = function pacGetEffectiveUserId(fallback = "") {
    const delegatedUid = String(window.pacDelegatedContext?.effectiveUserId || "").trim();
    if (delegatedUid) return delegatedUid;
    const globalUid = String(window.currentUserId || "").trim();
    if (globalUid) return globalUid;
    return String(fallback || "").trim();
  };

  // PATCH START: trial/paid gate helpers (MVP)
async function trialGate(user, onPublic, isAdmin) {
  // public pages never blocked by trial/paywall
  if (onPublic) return { ok: true };

  // admin never blocked
  if (isAdmin) return { ok: true };

  try {
    const db = window.db || firebase.firestore();

    const ref = db.collection("users").doc(user.uid);
    const snap = await ref.get();

    if (!snap.exists) return { ok: false, reason: 'no_plan_access' };

    const data = snap.data() || {};
    return evaluatePlanAccess(data,Date.now());
  } catch (e) {
    console.warn("trialGate error:", e);
    // A transport failure is not evidence that the subscription expired.
    return { ok: true, verification: 'unavailable' };
  }
}

function evaluatePlanAccess(data,now) {

    const trialEnds = typeof data.trialEndsAtMs==='number'?data.trialEndsAtMs:0;
    const paidUntil = typeof data.paidUntilMs==='number'?data.paidUntilMs:0;
    const planStatus = data.planStatus || '';
    const accessStatus = data.accessStatus || '';
    const billingKeys=['planStatus','accessStatus','trialEndsAtMs','paidUntilMs','paidUntil'];
    if(!billingKeys.some(key=>Object.prototype.hasOwnProperty.call(data,key)))return {ok:true};
    const active=planStatus==='active'||accessStatus==='active'||paidUntil>now;
    const validTrial=trialEnds>now&&(planStatus==='trial'||accessStatus==='trial');
    const expiredTrial=trialEnds>0&&trialEnds<=now&&planStatus==='trial'&&accessStatus!=='active'&&paidUntil<=now;
    const blocked=planStatus==='inactive'||expiredTrial||(accessStatus==='expired'&&!['active','trial'].includes(planStatus)&&paidUntil<=now);
    return !blocked&&(active||validTrial)?{ok:true}:{ok:false,reason:trialEnds>0&&trialEnds<=now?'trial_expired':'no_plan_access'};
}

function planAccessDialog(id){
  if(!document.getElementById('pac-access-dialog-style')){
    const style=document.createElement('style');style.id='pac-access-dialog-style';
    style.textContent=`.pac-access-dialog{box-sizing:border-box;width:min(560px,calc(100vw - 32px));max-height:calc(100dvh - 40px);overflow:auto;margin:auto;padding:28px;border:1px solid #d4af37;border-radius:16px;background:#111;color:#eee;box-shadow:0 24px 90px #0009;font:inherit}.pac-access-dialog::backdrop{background:rgba(0,0,0,.64);backdrop-filter:blur(7px);-webkit-backdrop-filter:blur(7px)}.pac-access-dialog h2{margin:0 0 16px;font-size:1.5rem;color:#ffc72c}.pac-access-dialog p{margin:0 0 20px;line-height:1.5}`;
    document.head.append(style);
  }
  let notice=document.getElementById(id);
  if(notice&&notice.tagName!=='DIALOG'){notice.remove();notice=null;}
  if(!notice){notice=document.createElement('dialog');notice.id=id;notice.className='pac-access-dialog';notice.setAttribute('role','alertdialog');notice.setAttribute('aria-modal','true');notice.setAttribute('aria-labelledby',id+'-title');notice.setAttribute('aria-describedby',id+'-description');notice.addEventListener('cancel',event=>event.preventDefault());document.body.append(notice);}
  return notice;
}
function openPlanAccessDialog(notice){
  if(!notice.open)notice.showModal();
  document.documentElement.style.overflow='hidden';document.body.style.overflow='hidden';
}
function showPlanAccessRequired(reason){
  const readError=document.getElementById('pac-plan-read-error');if(readError?.open)readError.close();
  const notice=planAccessDialog('pac-plan-access-required');
  notice.replaceChildren();
  const uk=String(localStorage.getItem('pac_lang')||document.documentElement.lang||'uk').startsWith('uk');
  const title=document.createElement('h2');title.id=notice.id+'-title';title.textContent=uk?'Оберіть ваш план':'Choose your plan';
  const text=document.createElement('p');text.id=notice.id+'-description';text.textContent=reason==='trial_expired'?(uk?'Ваш пробний період закінчився. Оберіть ваш план для продовження.':'Your trial has ended. Choose a plan to continue.'):(uk?'Ваш план не обраний або доступ не активовано. Оберіть ваш план для продовження.':'No active plan is available. Choose a plan to continue.');
  const link=document.createElement('a');link.href='/ProAthleteCare-1/gps-iphone-v14/pricing.html';link.textContent=uk?'Обрати план':'Choose a plan';link.style.cssText='display:inline-block;padding:12px 20px;border-radius:9px;background:#d4af37;color:#000;font-weight:800;text-decoration:none';
  notice.append(title,text,link);
  openPlanAccessDialog(notice);
}
window.pacShowPlanAccessRequired=showPlanAccessRequired;
window.pacShowPlanReadError=function(error){
  window.pacPlanReadBlocked=true;
  if(window.pacPlanAccessState?.ok===false){showPlanAccessRequired(window.pacPlanAccessState.reason);return;}
  const notice=planAccessDialog('pac-plan-read-error');notice.replaceChildren();
  const uk=String(localStorage.getItem('pac_lang')||document.documentElement.lang||'uk').startsWith('uk'),p=document.createElement('p');
  const title=document.createElement('h2');title.id=notice.id+'-title';title.textContent=uk?'План не завантажено':'Plan unavailable';p.id=notice.id+'-description';
  p.textContent=uk?'Не вдалося завантажити ваш план. Дані не прочитані — це не порожній план. Перевірте доступ до акаунта та з’єднання.':'Your plan could not be loaded. This does not mean it is empty. Check account access and your connection.';
  const retry=document.createElement('button');retry.textContent=uk?'Спробувати знову':'Retry';retry.type='button';retry.addEventListener('click',()=>location.reload());notice.append(title,p,retry);openPlanAccessDialog(notice);
};
// PATCH END


  firebase.auth().onAuthStateChanged(async (user) => {
    const path = window.location.pathname;
    const onPublic = isPublicPath(path);
    const onAuth = isAuthPage(path);

    // Not logged in → only public pages are allowed
    if (!user || user.isAnonymous) {
      if (!onPublic) go(AUTH_REDIRECT);
      return;
    }

    // Logged in, but email NOT verified → allow ONLY regist page (verification screen)
    // Everything else -> back to regist
    if (!user.emailVerified) {
      if (!path.endsWith("/pages/regist.html")) go(AUTH_REDIRECT);
      return;
    }

    // Logged in + verified:
    // If user on auth page -> route by role (coach/admin/athlete)
    if (onAuth) {
      try {
        const dbx = window.db || firebase.firestore();
        const meSnap = await dbx.collection("users").doc(user.uid).get();
        const me = meSnap.exists ? (meSnap.data() || {}) : {};
        const role = normalizeRole(me.role);
        const isAdminEmail = String(user.email || "").toLowerCase() === "kulyk015@gmail.com";

        if (isAdminEmail) {
          go("/ProAthleteCare-1/gps-iphone-v14/admin.html");
          return;
        }
        if (role === "coach") {
          go("/ProAthleteCare-1/gps-iphone-v14/pages/coach-dashboard.html");
          return;
        }
      } catch (e) {
        console.warn("role redirect fallback:", e);
      }

      go("/ProAthleteCare-1/gps-iphone-v14/pages/dashboard_user.html");
      return;
    }

    // Globals + delegated view resolution (admin/coach)
try {
  const dbx = window.db || firebase.firestore();
  const scope = await resolveDelegatedContext(user, { db: dbx });

  if (!scope.allowed) {
    console.warn("Delegated access denied:", scope.denialReason || "unknown");
    go(scope.backHref || "/ProAthleteCare-1/gps-iphone-v14/pages/coach-dashboard.html");
    return;
  }

  ensureClientErrorLogger({
    uid: user.uid,
    role: scope.role,
    isAdmin: scope.isAdmin,
    delegatedUid: scope.effectiveUserId
  });

  renderDelegatedIndicator(scope);
  applyRoleShell(scope);

  const page = currentPageName();
  if (page === "admin.html" && !scope.isAdmin) {
    go(scope.isCoach ? "/ProAthleteCare-1/gps-iphone-v14/pages/coach-dashboard.html" : "/ProAthleteCare-1/gps-iphone-v14/pages/dashboard_user.html");
    return;
  }
  if (scope.isCoach && isOwnAthleteWorkspacePage()) {
    go("/ProAthleteCare-1/gps-iphone-v14/pages/coach-dashboard.html");
    return;
  }
  if (scope.isAdmin && isOwnAthleteWorkspacePage()) {
    go("/ProAthleteCare-1/gps-iphone-v14/admin.html");
    return;
  }

  // PATCH START: trial/paid gate (block private pages only)
  const gate = await trialGate(user, onPublic, scope.isAdmin);
  window.pacPlanAccessState=gate;
  if (!gate.ok) {
    window.pacPlanReadBlocked=true;
    if (isAppChannelMode()) {
      go(`/ProAthleteCare-1/gps-iphone-v14/pages/app-access-required.html${buildAppModeQuery()}`);
    } else {
      showPlanAccessRequired(gate.reason);
    }
    return;
  }
  // PATCH END

  if (typeof syncWellnessFromFirebase === "function") {
    syncWellnessFromFirebase(scope.effectiveUserId);
  }
  if (typeof loadBaseData === "function") loadBaseData();
} catch (e) {
  console.warn("auth-guard extras failed:", e);
}
window.logout = async function logout() {
  try {
    await firebase.auth().signOut();
  } catch (e) {
    console.warn("logout error:", e);
  } finally {
    // абсолютний перехід, щоб не ламалось з /pages/*
    window.location.href = new URL("/ProAthleteCare-1/gps-iphone-v14/platform.html", window.location.origin).toString();
  }
};

  });
})();
// PATCH END


