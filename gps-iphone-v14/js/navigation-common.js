// ==============================================
// navigation-common.js - ЧИСТА ВЕРСІЯ
// ==============================================
console.count("NAV FILE LOADED");
// ==============================================
// GLOBAL LISTENER REGISTRY (prevents bfcache leaks)
// ==============================================
window.__PAC_LISTENERS__ = window.__PAC_LISTENERS__ || new Set();

function pacRegisterUnsub(fn) {
  if (typeof fn === "function") window.__PAC_LISTENERS__.add(fn);
  return fn;
}
function pacUnregisterUnsub(fn) {
  try { window.__PAC_LISTENERS__?.delete(fn); } catch {}
}
function pacStopAllListeners() {
  try {
    window.__PAC_LISTENERS__?.forEach((fn) => { try { fn(); } catch {} });
    window.__PAC_LISTENERS__?.clear();
  } catch {}
}

// IMPORTANT: bfcache safe cleanup
window.addEventListener("pagehide", () => pacStopAllListeners(), { capture: true });
window.addEventListener("beforeunload", () => pacStopAllListeners(), { capture: true });

// ==============================================
// APP CHANNEL MODE (separate mobile app flow)
// ==============================================
(function pacInitAppChannelMode() {
  const APP_MODE_KEY = "pac_app_mode";
  const APP_BUILD_KEY = "pac_app_build";
  const APP_UID_KEY = "pac_app_uid";
  const APP_CHANNEL_KEY = "pac_app_channel";

  function readModeFromUrl() {
    try {
      const q = new URLSearchParams(window.location.search || "");
      return q.get("mobile") === "1" || q.get("app") === "1";
    } catch {
      return false;
    }
  }

  function readSessionMode() {
    try {
      return localStorage.getItem(APP_MODE_KEY) === "1";
    } catch {
      return false;
    }
  }

  function currentContextFromUrl() {
    try {
      const q = new URLSearchParams(window.location.search || "");
      return {
        appv: String(q.get("appv") || "").trim(),
        uid: String(q.get("uid") || "").trim(),
        channel: String(q.get("channel") || "").trim()
      };
    } catch {
      return { appv: "", uid: "", channel: "" };
    }
  }

  const modeFromUrl = readModeFromUrl();
  const isAppMode = modeFromUrl || readSessionMode();
  window.__PAC_APP_MODE__ = !!isAppMode;

  if (!isAppMode) return;

  try { localStorage.setItem(APP_MODE_KEY, "1"); } catch {}

  const ctx = currentContextFromUrl();
  if (ctx.appv) {
    try { localStorage.setItem(APP_BUILD_KEY, ctx.appv); } catch {}
  }
  if (ctx.uid) {
    try { localStorage.setItem(APP_UID_KEY, ctx.uid); } catch {}
  }
  if (ctx.channel) {
    try { localStorage.setItem(APP_CHANNEL_KEY, ctx.channel); } catch {}
  }

  function getStoredContext() {
    let appv = "";
    let uid = "";
    let channel = "";
    try { appv = String(localStorage.getItem(APP_BUILD_KEY) || "").trim(); } catch {}
    try { uid = String(localStorage.getItem(APP_UID_KEY) || "").trim(); } catch {}
    try { channel = String(localStorage.getItem(APP_CHANNEL_KEY) || "").trim(); } catch {}
    return { appv, uid, channel };
  }

  function shouldPatchUrl(urlObj) {
    const file = String(urlObj.pathname || "").toLowerCase();
    if (!/\.html$/i.test(file)) return false;
    if (/\/(pricing|checkout|payment-success|payment-cancel)\.html$/i.test(file)) return false;
    return true;
  }

  function patchAnchorHref(anchor) {
    if (!anchor || !anchor.getAttribute) return;
    const raw = String(anchor.getAttribute("href") || "").trim();
    if (!raw || raw.startsWith("#")) return;
    if (/^(mailto:|tel:|javascript:)/i.test(raw)) return;

    let urlObj;
    try {
      urlObj = new URL(raw, window.location.href);
    } catch {
      return;
    }
    if (urlObj.origin !== window.location.origin) return;
    if (!shouldPatchUrl(urlObj)) return;

    const stored = getStoredContext();
    urlObj.searchParams.set("mobile", "1");
    urlObj.searchParams.set("app", "1");
    if (stored.appv && !urlObj.searchParams.get("appv")) {
      urlObj.searchParams.set("appv", stored.appv);
    }
    if (stored.uid && !urlObj.searchParams.get("uid")) {
      urlObj.searchParams.set("uid", stored.uid);
    }
    if (stored.channel && !urlObj.searchParams.get("channel")) {
      urlObj.searchParams.set("channel", stored.channel);
    }

    anchor.setAttribute("href", urlObj.pathname + urlObj.search + urlObj.hash);
  }

  function hideAppBlockedLinks(root) {
    const targets = (root || document).querySelectorAll("a[href]");
    targets.forEach((a) => {
      const href = String(a.getAttribute("href") || "").toLowerCase();
      if (/(^|\/)(pricing|checkout|payment-success|payment-cancel)\.html(\?|#|$)/i.test(href)) {
        a.style.display = "none";
      }
    });
  }

  function patchAllLinks(root) {
    const targets = (root || document).querySelectorAll("a[href]");
    targets.forEach((a) => patchAnchorHref(a));
  }

  function applyAppModeDecor() {
    try { document.documentElement.classList.add("pac-app-mode"); } catch {}
    try { document.body && document.body.classList.add("pac-app-mode"); } catch {}
  }

  function applyAppMode(root) {
    applyAppModeDecor();
    patchAllLinks(root || document);
    hideAppBlockedLinks(root || document);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => applyAppMode(document), { once: true });
  } else {
    applyAppMode(document);
  }

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      mutation.addedNodes?.forEach((node) => {
        if (node && node.nodeType === 1) applyAppMode(node);
      });
    }
  });
  const startObserver = () => {
    try {
      if (!document.body) return;
      observer.observe(document.body, { childList: true, subtree: true });
      pacRegisterUnsub(() => observer.disconnect());
    } catch {}
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startObserver, { once: true });
  } else {
    startObserver();
  }
})();
// ==============================================
// USERS/{uid} CACHE (EARLY INIT) - must be before first setMeCache()
// ==============================================
var __meCache = window.__PAC_ME_CACHE__ || { uid: null, data: null, fetchedAt: 0, p: null };
window.__PAC_ME_CACHE__ = __meCache;

function setMeCache(uid, data) {
  __meCache.uid = uid || null;
  __meCache.data = data || null;
  __meCache.fetchedAt = Date.now();
  __meCache.p = null;
}

function getProfileUiCache() {
  try {
    return {
      name: String(sessionStorage.getItem("pac_profile_name") || "").trim(),
      photo: String(sessionStorage.getItem("pac_profile_photo") || "").trim()
    };
  } catch {
    return { name: "", photo: "" };
  }
}

function setProfileUiCache(name, photo) {
  try {
    if (name) sessionStorage.setItem("pac_profile_name", String(name));
    if (photo) sessionStorage.setItem("pac_profile_photo", String(photo));
  } catch {}
}

function getStoredAvatarForUid(uid) {
  try {
    const data = JSON.parse(localStorage.getItem("pac_avatar_cache") || "{}");
    if (data && data.uid === uid && data.photoURL) return String(data.photoURL);
  } catch {}
  return "";
}

function setStoredAvatarForUid(uid, photoURL) {
  try {
    if (uid && photoURL) {
      localStorage.setItem("pac_avatar_cache", JSON.stringify({
        uid,
        photoURL,
        updatedAt: Date.now()
      }));
    }
  } catch {}
}

async function getPublicAvatarForUid(uid) {
  if (!uid) return "";
  try {
    const snap = await db.collection("public_profiles").doc(uid).get();
    const data = snap.exists ? (snap.data() || {}) : {};
    return String(data.photoURL || "").trim();
  } catch (e) {
    console.warn("public avatar read skipped:", e?.message || e);
    return "";
  }
}

function clearProfileUiCache() {
  try {
    sessionStorage.removeItem("pac_profile_name");
    sessionStorage.removeItem("pac_profile_photo");
  } catch {}
}

async function getMeDataCached({ force = false, ttlMs = 30000 } = {}) {
  const u = auth.currentUser;
  if (!u?.uid) return null;

  const uid = u.uid;
  const fresh = (__meCache.uid === uid) && __meCache.data && (Date.now() - __meCache.fetchedAt < ttlMs);
  if (!force && fresh) return __meCache.data;

  if (!force && __meCache.p && __meCache.uid === uid) return __meCache.p;

  __meCache.uid = uid;
  __meCache.p = db.collection("users").doc(uid).get()
    .then((doc) => {
      const data = doc.exists ? (doc.data() || {}) : {};
      setMeCache(uid, data);
      return data;
    })
    .catch((e) => {
      __meCache.p = null;
      throw e;
    });

  return __meCache.p;
}
// ==============================================
// USERS/{uid} DOC CACHE (keeps "exists" too)
// ==============================================
var __meDocCache = window.__PAC_ME_DOC_CACHE__ || { uid: null, doc: null, fetchedAt: 0, p: null };
window.__PAC_ME_DOC_CACHE__ = __meDocCache;

function setMeDocCache(uid, doc) {
  __meDocCache.uid = uid || null;
  __meDocCache.doc = doc || null;
  __meDocCache.fetchedAt = Date.now();
  __meDocCache.p = null;
}

async function getMeDocCached({ force = false, ttlMs = 30000 } = {}) {
  const u = auth.currentUser;
  if (!u?.uid) return null;

  const uid = u.uid;
  const fresh = (__meDocCache.uid === uid) && __meDocCache.doc && (Date.now() - __meDocCache.fetchedAt < ttlMs);
  if (!force && fresh) return __meDocCache.doc;

  if (!force && __meDocCache.p && __meDocCache.uid === uid) return __meDocCache.p;

  __meDocCache.uid = uid;
  __meDocCache.p = db.collection("users").doc(uid).get()
    .then((doc) => {
      setMeDocCache(uid, doc);
      // також синхронізуємо твій data cache, щоб все було консистентно
      setMeCache(uid, doc.exists ? (doc.data() || {}) : {});
      return doc;
    })
    .catch((e) => {
      __meDocCache.p = null;
      throw e;
    });

  return __meDocCache.p;
}
// 1. ГОЛОВНА ЛОГІКА: АВТОРИЗАЦІЯ ТА ДАНІ
auth.onAuthStateChanged(async (user) => {
    const statusText = document.querySelector('.loading-status'); 
    
    if (user) {
        if (statusText) statusText.style.display = 'none';

        try {
            // Отримуємо дані з Firestore
            let userDoc = await getMeDocCached({ force: false, ttlMs: 30000 });

let userData = {};

if (!userDoc.exists) {
  const first = (user.displayName || "").split(" ")[0] || "";
  const last  = (user.displayName || "").split(" ").slice(1).join(" ") || "";

  userData = {
    role: "athlete",
    coachId: null,
    firstName: first,
    lastName: last,
    email: user.email || null,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  };

  await db.collection("users").doc(user.uid).set(userData, { merge: true });
  setMeDocCache(user.uid, { exists: true, data: () => userData });

  // ✅ НЕ перечитуємо документ: економимо 1 read на перший логін
} else {
  userData = userDoc.data() || {};
}

  // cache me (avoids repeated users/{uid}.get() later)
setMeCache(user.uid, userData);

            // Оновлюємо фото у модалці
            const modalAvatar = document.getElementById('profile-img-preview');
            const publicPhotoURL = (!userData?.photoURL && !getStoredAvatarForUid(user.uid))
                ? await getPublicAvatarForUid(user.uid)
                : "";
            const cachedPhotoSrc = getStoredAvatarForUid(user.uid) || userData?.photoURL || publicPhotoURL || user.photoURL || "../assets/images/AK_logo.png";

            if (modalAvatar) {
                modalAvatar.src = cachedPhotoSrc;
            }

            // Заповнюємо поля форми редагування
            if (userData) {
                if (document.getElementById('set-firstName')) document.getElementById('set-firstName').value = userData.firstName || "";
                if (document.getElementById('set-lastName')) document.getElementById('set-lastName').value = userData.lastName || "";
                if (document.getElementById('set-email')) document.getElementById('set-email').value = user.email || "";
            }

            // Оновлюємо ім'я та аватарки всюди на сторінці
            const displayName =
  (userData?.firstName || userData?.lastName)
    ? `${userData.firstName || ""} ${userData.lastName || ""}`.trim()
    : (user.displayName || (user.email ? user.email.split("@")[0] : "Athlete"));

            const photoSrc = cachedPhotoSrc;
            if (!userData?.photoURL && photoSrc && !/AK_logo\.png/i.test(photoSrc)) {
                try {
                    await db.collection("users").doc(user.uid).set({
                        uid: user.uid,
                        photoURL: photoSrc,
                        avatarUpdatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    }, { merge: true });
                    userData = { ...userData, uid: user.uid, photoURL: photoSrc };
                    setMeCache(user.uid, userData);
                    setMeDocCache(user.uid, { exists: true, data: () => userData });
                } catch (avatarSyncErr) {
                    console.warn("Avatar cache sync skipped:", avatarSyncErr?.message || avatarSyncErr);
                }
            }
            setProfileUiCache(displayName, photoSrc);

            document.querySelectorAll('#user-name, .user-name-display').forEach(el => {
                el.innerText = displayName;
            });

            document.querySelectorAll('.user-avatar, .user-sidebar-profile img').forEach(img => {
                img.src = photoSrc;
            });
            setTimeout(applyStoredAvatarForCurrentUser, 250);
            setTimeout(applyPersistentAvatarForCurrentUser, 1000);

        } catch (error) {
            console.error("Помилка завантаження даних:", error);
        }

    } else {
  clearProfileUiCache();
  // Якщо не залогінений - на реєстрацію
  const current = window.location.pathname.split("/").pop();
if (current !== "regist.html") {
  window.location.replace(getSiteBase() + "pages/regist.html");
}

}
});

// 2. КЕРУВАННЯ МЕНЮ (SIDEBAR)
function setupMenuToggle() {
    const toggleButton = document.getElementById('menu-toggle-button');
    const sidebar = document.getElementById('main-sidebar'); 
    
    if (toggleButton && sidebar) {
        toggleButton.onclick = (event) => {
            event.stopPropagation();
            sidebar.classList.toggle('active');
            toggleButton.classList.toggle('is-open');
        };
        
        document.addEventListener('click', (event) => {
            if (!sidebar.contains(event.target) && !toggleButton.contains(event.target)) {
                sidebar.classList.remove('active');
                toggleButton.classList.remove('is-open');
            }
        });
    }
}
function escapeHtml(input) {
  if (input == null) return "";
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Safety: prevent invisible cards (opacity:0) on pages that reuse dashboard styles
function ensureUdCardsVisible() {
  const reveal = () => {
    document.querySelectorAll(".ud-card").forEach((el) => el.classList.add("is-visible"));
  };
  reveal();
  setTimeout(reveal, 200);
  window.addEventListener("pageshow", reveal, { once: true });
}

function pickUserSport(data) {
  return String(data?.sportType || data?.sport || "").trim();
}

function pickUserSeason(data) {
  return String(data?.seasonPhase || data?.season || "").trim();
}

function pickUserPosition(data) {
  return String(data?.playerPosition || data?.position || "").trim();
}

function pickUserGoals(data) {
  const topLevel = Array.isArray(data?.goals) ? data.goals : [];
  const summaryGoals = Array.isArray(data?.onboarding?.summary?.goals) ? data.onboarding.summary.goals : [];
  return (topLevel.length ? topLevel : summaryGoals)
    .map((x) => String(x || "").trim())
    .filter(Boolean);
}

function renderOnboardingSummary(data) {
  const sport = pickUserSport(data) || "-";
  const season = pickUserSeason(data) || "-";
  const position = pickUserPosition(data) || "-";
  const goalsArr = pickUserGoals(data);
  const goals = goalsArr.length ? goalsArr.slice(0, 3).join(", ") : "-";
  const labels = getCabI18n();

  const html = `
    <div style="font-size:11px; color:#aaa; text-transform:uppercase; letter-spacing:.08em;">${labels.onboardingSummary}</div>
    <div style="margin-top:6px; display:grid; gap:4px; font-size:12px; color:#ddd;">
      <div><b>${labels.sportShort}:</b> ${escapeHtml(sport)}</div>
      <div><b>${labels.seasonShort}:</b> ${escapeHtml(season)}</div>
      <div><b>${labels.positionShort}:</b> ${escapeHtml(position)}</div>
      <div><b>${labels.goalsShort}:</b> ${escapeHtml(goals)}</div>
    </div>`;

  const main = document.getElementById("onboarding-quick-view");
  if (main) main.innerHTML = html;

  const profile = document.getElementById("onboarding-profile-summary");
  if (profile) profile.innerHTML = html;
}


async function injectProfileModal() {
    if (document.getElementById('profileModal')) return;

    const modalHTML = `
    <div id="profileModal" class="modal">
        <div class="modal-content profile-modal cab-container"
             style="background:#000;border:1px solid #FFC72C;border-radius:15px;">

            <span class="close-modal" onclick="closeProfile()" style="color:#FFC72C;">&times;</span>

            <!-- HEADER -->
            <div id="cab-header"
                 style="display:none;align-items:center;margin-bottom:20px;
                        border-bottom:1px solid #333;padding-bottom:10px;">
                <button onclick="goBackToMenu()"
                        style="color:#FFC72C;background:none;border:none;cursor:pointer;">
                    ← Назад
                </button>
                <h2 id="cab-title"
                    style="color:#FFC72C;margin:0 auto;font-size:16px;text-transform:uppercase;">
                    Розділ
                </h2>
            </div>

            <!-- MAIN MENU -->
            <div id="cab-main-menu">

                <div style="text-align:center;margin-bottom:25px;">

                    <!-- AVATAR -->
                    <div class="avatar-container"
                         style="position:relative;display:inline-block;">
                        <img id="profile-img-preview"
                             src="../assets/images/AK_logo.png"
                             class="avatar-big"
                             style="width:90px;height:90px;border-radius:50%;
                                    border:2px solid #FFC72C;object-fit:cover;">

                        <label for="avatar-input"
                               style="position:absolute;bottom:0;right:0;
                                      width:26px;height:26px;border-radius:50%;
                                      background:#FFC72C;color:#000;
                                      display:flex;align-items:center;
                                      justify-content:center;
                                      cursor:pointer;font-size:14px;">
                            ✎
                        </label>

                        <input type="file" id="avatar-input"
                               accept="image/*" style="display:none;">
                    </div>

                    <h2 class="user-name-display"
                        style="color:#fff;margin:15px 0 5px;
                               font-size:18px;font-weight:800;">
                        Атлет
                    </h2>

                    <p id="user-club-display"
                       style="color:#FFC72C;font-size:11px;
                              text-transform:uppercase;
                              letter-spacing:1px;margin:0;">
                        PRO ATLET CARE SYSTEM
                    </p>
                    <div id="onboarding-quick-view"
                         style="margin-top:10px;padding:10px;border-radius:10px;
                                border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.03);
                                text-align:left;"></div>
                </div>

                <!-- NAV -->
                <div class="modal-nav-list"
                     style="display:flex;flex-direction:column;gap:10px;">
                    <button onclick="openCabSection('edit-profile','Мій профіль')"
                            class="modal-item">
                        1. Профіль та антропометрія
                    </button>
                    <button onclick="openCabSection('my-stats','Експорт Даних (GDPR)')"
                            class="modal-item">
                        2. Аналітика та звіти PDF
                    </button>
                    <button onclick="openCabSection('security','Безпека & Приватність')"
                            class="modal-item">
                        3. Безпека та конфіденційність
                    </button>
                    <button onclick="logout()"
                            class="modal-item logout-btn"
                            style="margin-top:15px;border-color:#DA3E52;color:#DA3E52;">
                        4. Вийти з системи
                    </button>
                </div>
            </div>

            <!-- SECURITY -->
            <div id="security" class="cab-section" style="display:none;">
                <div style="background:rgba(255,199,44,0.05);
                            padding:15px;border-radius:10px;
                            border:1px solid rgba(255,199,44,0.1);
                            margin-bottom:20px;">
                    <h4 style="color:#FFC72C;font-size:13px;margin-top:0;">
                        Захист даних (DSGVO)
                    </h4>
                    <p style="font-size:11px;color:#ccc;line-height:1.4;">
                        Ваші дані обробляються згідно з GDPR.
                    </p>
                    <hr style="border:0;border-top:1px solid #222;margin:20px 0;">

<div id="mfa-block"
     style="background:#111;padding:15px;border-radius:10px;
            border:1px solid #333;">
  <h4 style="color:#FFC72C;font-size:13px;margin-top:0;">
    Двофакторна автентифікація (2FA)
  </h4>

  <p id="mfa-status"
     style="font-size:11px;color:#ccc;margin-bottom:10px;">
    Перевірка статусу...
  </p>

  <button id="btn-enable-mfa"
          style="width:100%;padding:10px;
                 background:none;border:1px solid #FFC72C;
                 color:#FFC72C;border-radius:8px;
                 cursor:pointer;display:none;">
    Увімкнути 2FA (SMS)
  </button>
</div>

                </div>

                <form id="form-password">
                    <input type="password" id="new-pass" aria-label="Новий пароль" autocomplete="new-password"
                           placeholder="Новий пароль"
                           style="width:100%;padding:10px;
                                  background:#111;border:1px solid #333;
                                  color:#fff;">
                    <input type="password" id="confirm-pass" aria-label="Підтвердити пароль" autocomplete="new-password"
                           placeholder="Підтвердити"
                           style="width:100%;padding:10px;margin-top:10px;
                                  background:#111;border:1px solid #333;
                                  color:#fff;">
                    <button type="submit" class="btn-premium-gold"
                            style="width:100%;margin-top:15px;">
                        Оновити пароль
                    </button>
                </form>

                <hr style="border:0;border-top:1px solid #222;margin:20px 0;">
                <p style="font-size:11px;color:#aaa;line-height:1.4;margin:0 0 10px;">
                    You can request account deletion from here. We will review the request before deleting profile and training data.
                </p>
                <div id="account-delete-request-status"
                     style="font-size:11px;color:#777;text-align:center;display:none;margin-bottom:10px;"></div>
                <button onclick="handleDeleteAccount()"
                        style="margin-top:25px;color:#DA3E52;
                               background:none;border:1px solid #DA3E52;
                               padding:10px;width:100%;
                               border-radius:8px;cursor:pointer;">
                    Request account deletion
                </button>
            </div>

            <!-- EDIT PROFILE -->
<div id="edit-profile" class="cab-section" style="display:none;">
  <form id="form-profile">

    <!-- IDENTITY -->
    <div class="modal-grid-2" style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
      <div class="modal-input-group">
        <label for="set-firstName" style="color:#888;font-size:11px;">Ім'я</label>
        <input type="text" id="set-firstName" style="width:100%;background:#111;border:1px solid #333;color:#fff;padding:8px;">
      </div>
      <div class="modal-input-group">
        <label for="set-lastName" style="color:#888;font-size:11px;">Прізвище</label>
        <input type="text" id="set-lastName" style="width:100%;background:#111;border:1px solid #333;color:#fff;padding:8px;">
      </div>
    </div>

    <hr style="border:0;border-top:1px solid #222;margin:20px 0;">

    <!-- EMAIL -->
    <div class="modal-input-group">
      <label for="set-email" style="color:#888;font-size:11px;">Поточний Email</label>
      <input type="email" id="set-email" disabled
             style="width:100%;background:#111;border:1px solid #333;color:#888;padding:8px;">
    </div>

    <div class="modal-input-group">
      <label for="set-new-email" style="color:#888;font-size:11px;">Новий Email</label>
      <input type="email" id="set-new-email" placeholder="new@email.com"
             style="width:100%;background:#111;border:1px solid #333;color:#fff;padding:8px;">
    </div>

    <div class="modal-input-group">
      <label for="set-email-pass" style="color:#888;font-size:11px;">Пароль (підтвердження)</label>
      <input type="password" id="set-email-pass" placeholder="••••••••"
             style="width:100%;background:#111;border:1px solid #333;color:#fff;padding:8px;">
    </div>

    <button type="button" id="btn-change-email"
            style="width:100%;margin-top:10px;background:none;border:1px solid #444;color:#ccc;
                   padding:10px;font-size:12px;cursor:pointer;border-radius:8px;">
      Змінити Email
    </button>

    <div id="email-change-status"
         style="margin-top:8px;font-size:11px;color:#777;text-align:center;display:none;"></div>

    <hr style="border:0;border-top:1px solid #222;margin:20px 0;">

    <!-- SPORT INFO -->
    <div class="modal-input-group">
      <label for="set-sport" style="color:#888;font-size:11px;">Вид спорту</label>
      <select id="set-sport" style="width:100%;background:#111;border:1px solid #333;color:#fff;padding:8px;">
        <option value="">— оберіть спорт —</option>
        <option value="football">Football</option>
        <option value="futsal">Futsal</option>
        <option value="basketball">Basketball</option>
        <option value="handball">Handball</option>
        <option value="volleyball">Volleyball</option>
        <option value="tennis">Tennis</option>
        <option value="rugby">Rugby</option>
        <option value="hockey">Hockey</option>
        <option value="athletics">Athletics</option>
        <option value="athlete_coach">Athlete Coach</option>
        <option value="other">Other</option>
      </select>
    </div>

    <div class="modal-input-group">
      <label for="set-club" style="color:#888;font-size:11px;">Клуб</label>
      <div id="onboarding-profile-summary"
           style="margin-bottom:10px;padding:10px;border-radius:10px;
                  border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.03);"></div>
      <input type="text" id="set-club" style="width:100%;background:#111;border:1px solid #333;color:#fff;padding:8px;">
    </div>

    <div class="modal-input-group">
      <label for="set-country" style="color:#888;font-size:11px;">Країна</label>
      <select id="set-country" style="width:100%;background:#111;border:1px solid #333;color:#fff;padding:8px;">
        <option value="">— оберіть країну —</option>
        <option value="UA">Україна</option>
        <option value="DE">Germany</option>
        <option value="PL">Poland</option>
        <option value="CZ">Czech Republic</option>
        <option value="SK">Slovakia</option>
        <option value="OTHER">Other</option>
      </select>
    </div>

    <div class="modal-input-group">
      <label for="set-competitionLevel" style="color:#888;font-size:11px;">Рівень змагань</label>
      <select id="set-competitionLevel" style="width:100%;background:#111;border:1px solid #333;color:#fff;padding:8px;">
        <option value="">— не вказано —</option>
        <option value="amateur">Amateur</option>
        <option value="semi-pro">Semi-Pro</option>
        <option value="professional">Professional</option>
      </select>
    </div>

    <hr style="border:0;border-top:1px solid #222;margin:20px 0;">

    <div class="modal-input-group">
      <label for="set-phone" style="color:#888;font-size:11px;">Телефон (опціонально)</label>
      <input type="tel" id="set-phone" style="width:100%;background:#111;border:1px solid #333;color:#fff;padding:8px;">
    </div>

    <div id="profile-save-status" style="margin-top:10px;font-size:11px;color:#777;text-align:center;display:none;"></div>

    <button type="submit" class="btn-premium-gold" style="width:100%;margin-top:15px;">
      Зберегти зміни
    </button>

  </form>
</div>


            <!-- STATS -->
            <div id="my-stats" class="cab-section" style="display:none;">
  <div style="background:#111;padding:15px;border-radius:10px;border:1px solid #333;">

    <h4 style="color:#FFC72C;font-size:13px;margin-top:0;">ЕКСПОРТ ДАНИХ (GDPR)</h4>

    <label for="pdf-start-date" style="color:#888;font-size:11px;">Дата старт</label>
    <input type="date" id="pdf-start-date"
           style="width:100%;padding:10px;background:#000;border:1px solid #333;color:#fff;border-radius:8px;">

    <label for="pdf-end-date" style="color:#888;font-size:11px;margin-top:10px;display:block;">Дата кінець</label>
    <input type="date" id="pdf-end-date"
           style="width:100%;padding:10px;background:#000;border:1px solid #333;color:#fff;border-radius:8px;">

    <button onclick="generateFullPDF(false)"
            class="btn-premium-gold"
            style="width:100%;margin-top:12px;">
      PDF за період
    </button>

    <button onclick="generateFullPDF(true)"
            style="width:100%;margin-top:10px;padding:10px;background:none;border:1px solid #FFC72C;color:#FFC72C;border-radius:8px;cursor:pointer;">
      PDF за весь час
    </button>

    <hr style="border:0;border-top:1px solid #222;margin:18px 0;">

    <button onclick="exportAllUserData()"
            style="width:100%;padding:10px;background:none;border:1px solid #444;color:#ccc;border-radius:8px;cursor:pointer;">
      Експортувати всі дані (JSON)
    </button>

    <p style="font-size:10px;color:#666;margin-top:8px;line-height:1.4;">
      JSON включає профіль + підколекції користувача.
    </p>

  </div>
</div>


        </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    applyCabinetI18n();
}

const CABINET_I18N = {
  uk: {
    back: "← Назад",
    section: "Розділ",
    athlete: "Атлет",
    system: "PRO ATHLETE CARE SYSTEM",
    profileTitle: "Мій профіль",
    statsTitle: "Експорт даних (GDPR)",
    securityTitle: "Безпека & приватність",
    menuProfile: "1. Профіль та антропометрія",
    menuStats: "2. Аналітика та звіти PDF",
    menuSecurity: "3. Безпека та конфіденційність",
    menuLogout: "4. Вийти з системи",
    dataProtection: "Захист даних (DSGVO)",
    dataProtectionText: "Ваші дані обробляються згідно з GDPR.",
    mfaTitle: "Двофакторна автентифікація (2FA)",
    mfaChecking: "Перевірка статусу...",
    mfaEnable: "Увімкнути 2FA (SMS)",
    newPassword: "Новий пароль",
    confirmPassword: "Підтвердити",
    updatePassword: "Оновити пароль",
    deleteInfo: "Ви можете запросити видалення акаунту тут. Ми перевіримо запит перед видаленням профілю та тренувальних даних.",
    requestDelete: "Запросити видалення акаунту",
    firstName: "Ім'я",
    lastName: "Прізвище",
    currentEmail: "Поточний Email",
    newEmail: "Новий Email",
    emailPassword: "Пароль (підтвердження)",
    changeEmail: "Змінити Email",
    sport: "Вид спорту",
    chooseSport: "— оберіть спорт —",
    club: "Клуб",
    country: "Країна",
    chooseCountry: "— оберіть країну —",
    competitionLevel: "Рівень змагань",
    notSet: "— не вказано —",
    phone: "Телефон (опціонально)",
    saveChanges: "Зберегти зміни",
    exportHeading: "ЕКСПОРТ ДАНИХ (GDPR)",
    startDate: "Дата старт",
    endDate: "Дата кінець",
    pdfPeriod: "PDF за період",
    pdfAllTime: "PDF за весь час",
    exportJson: "Експортувати всі дані (JSON)",
    jsonInfo: "JSON включає профіль + підколекції користувача.",
    onboardingSummary: "Підсумок онбордингу",
    sportShort: "Спорт",
    seasonShort: "Сезон",
    positionShort: "Позиція",
    goalsShort: "Цілі",
    clubMissing: "Клуб не вказано",
    enterNewEmail: "Введи новий email",
    enterPassword: "Введи пароль для підтвердження",
    emailChanged: "✓ Email змінено",
    emailChangeError: "Не вдалося змінити email. Перевір пароль або спробуй ще раз.",
    loginBeforeDelete: "Увійдіть в акаунт перед запитом на видалення.",
    deleteConfirm: "Запросити видалення акаунту?\n\nЗапит буде відправлений на перевірку.\nТренувальні, wellness, injury, load, weight та профільні дані можуть бути видалені після перевірки.\n\nЦе серйозна дія. Firebase Auth user та дані користувача не будуть видалені миттєво.",
    sendingDelete: "Надсилаємо запит на видалення акаунту...",
    deleteSaved: "✓ Запит на видалення акаунту збережено.",
    avatarNoImage: "Оберіть файл зображення.",
    avatarTooLarge: "Фото завелике. Оберіть файл до 8 MB.",
    avatarUploadError: "Не вдалося завантажити аватар. Спробуй інше фото.",
    avatarUpdated: "✓ Аватар оновлено"
  },
  en: {
    back: "← Back",
    section: "Section",
    athlete: "Athlete",
    system: "PRO ATHLETE CARE SYSTEM",
    profileTitle: "My profile",
    statsTitle: "Data export (GDPR)",
    securityTitle: "Security & privacy",
    menuProfile: "1. Profile and anthropometry",
    menuStats: "2. Analytics and PDF reports",
    menuSecurity: "3. Security and privacy",
    menuLogout: "4. Log out",
    dataProtection: "Data protection (GDPR)",
    dataProtectionText: "Your data is processed according to GDPR.",
    mfaTitle: "Two-factor authentication (2FA)",
    mfaChecking: "Checking status...",
    mfaEnable: "Enable 2FA (SMS)",
    newPassword: "New password",
    confirmPassword: "Confirm",
    updatePassword: "Update password",
    deleteInfo: "You can request account deletion from here. We will review the request before deleting profile and training data.",
    requestDelete: "Request account deletion",
    firstName: "First name",
    lastName: "Last name",
    currentEmail: "Current Email",
    newEmail: "New Email",
    emailPassword: "Password confirmation",
    changeEmail: "Change Email",
    sport: "Sport",
    chooseSport: "— choose sport —",
    club: "Club",
    country: "Country",
    chooseCountry: "— choose country —",
    competitionLevel: "Competition level",
    notSet: "— not set —",
    phone: "Phone (optional)",
    saveChanges: "Save changes",
    exportHeading: "DATA EXPORT (GDPR)",
    startDate: "Start date",
    endDate: "End date",
    pdfPeriod: "PDF for period",
    pdfAllTime: "PDF for all time",
    exportJson: "Export all data (JSON)",
    jsonInfo: "JSON includes profile + user subcollections.",
    onboardingSummary: "Onboarding Summary",
    sportShort: "Sport",
    seasonShort: "Season",
    positionShort: "Position",
    goalsShort: "Goals",
    clubMissing: "Club not specified",
    enterNewEmail: "Enter a new email",
    enterPassword: "Enter your password to confirm",
    emailChanged: "✓ Email changed",
    emailChangeError: "Could not change email. Check the password or try again.",
    loginBeforeDelete: "Please log in before requesting account deletion.",
    deleteConfirm: "Request account deletion?\n\nYour account deletion request will be sent for review.\nTraining, wellness, injury, load, weight and profile data may be deleted after review.\n\nThis action is serious. No Firebase Auth user or user data will be deleted immediately.",
    sendingDelete: "Sending account deletion request...",
    deleteSaved: "✓ Account deletion request saved.",
    avatarNoImage: "Choose an image file.",
    avatarTooLarge: "The photo is too large. Choose a file up to 8 MB.",
    avatarUploadError: "Could not upload avatar. Try another photo.",
    avatarUpdated: "✓ Avatar updated"
  },
  de: {
    back: "← Zurück",
    section: "Bereich",
    athlete: "Athlet",
    system: "PRO ATHLETE CARE SYSTEM",
    profileTitle: "Mein Profil",
    statsTitle: "Datenexport (DSGVO)",
    securityTitle: "Sicherheit & Datenschutz",
    menuProfile: "1. Profil und Anthropometrie",
    menuStats: "2. Analysen und PDF-Berichte",
    menuSecurity: "3. Sicherheit und Datenschutz",
    menuLogout: "4. Abmelden",
    dataProtection: "Datenschutz (DSGVO)",
    dataProtectionText: "Deine Daten werden gemäß DSGVO verarbeitet.",
    mfaTitle: "Zwei-Faktor-Authentifizierung (2FA)",
    mfaChecking: "Status wird geprüft...",
    mfaEnable: "2FA aktivieren (SMS)",
    newPassword: "Neues Passwort",
    confirmPassword: "Bestätigen",
    updatePassword: "Passwort aktualisieren",
    deleteInfo: "Du kannst hier die Kontolöschung anfordern. Wir prüfen die Anfrage, bevor Profil- und Trainingsdaten gelöscht werden.",
    requestDelete: "Kontolöschung anfordern",
    firstName: "Vorname",
    lastName: "Nachname",
    currentEmail: "Aktuelle E-Mail",
    newEmail: "Neue E-Mail",
    emailPassword: "Passwortbestätigung",
    changeEmail: "E-Mail ändern",
    sport: "Sportart",
    chooseSport: "— Sportart wählen —",
    club: "Verein",
    country: "Land",
    chooseCountry: "— Land wählen —",
    competitionLevel: "Wettkampfniveau",
    notSet: "— nicht angegeben —",
    phone: "Telefon (optional)",
    saveChanges: "Änderungen speichern",
    exportHeading: "DATENEXPORT (DSGVO)",
    startDate: "Startdatum",
    endDate: "Enddatum",
    pdfPeriod: "PDF für Zeitraum",
    pdfAllTime: "PDF für gesamten Zeitraum",
    exportJson: "Alle Daten exportieren (JSON)",
    jsonInfo: "JSON enthält Profil + Nutzer-Unterkollektionen.",
    onboardingSummary: "Onboarding-Zusammenfassung",
    sportShort: "Sport",
    seasonShort: "Saison",
    positionShort: "Position",
    goalsShort: "Ziele",
    clubMissing: "Verein nicht angegeben",
    enterNewEmail: "Gib eine neue E-Mail ein",
    enterPassword: "Gib dein Passwort zur Bestätigung ein",
    emailChanged: "✓ E-Mail geändert",
    emailChangeError: "E-Mail konnte nicht geändert werden. Prüfe das Passwort oder versuche es erneut.",
    loginBeforeDelete: "Bitte melde dich an, bevor du die Kontolöschung anforderst.",
    deleteConfirm: "Kontolöschung anfordern?\n\nDeine Anfrage wird zur Prüfung gesendet.\nTrainings-, Wellness-, Injury-, Load-, Weight- und Profildaten können nach Prüfung gelöscht werden.\n\nDies ist eine wichtige Aktion. Firebase Auth user und Nutzerdaten werden nicht sofort gelöscht.",
    sendingDelete: "Anfrage zur Kontolöschung wird gesendet...",
    deleteSaved: "✓ Anfrage zur Kontolöschung gespeichert.",
    avatarNoImage: "Wähle eine Bilddatei aus.",
    avatarTooLarge: "Das Foto ist zu groß. Wähle eine Datei bis 8 MB.",
    avatarUploadError: "Avatar konnte nicht hochgeladen werden. Versuche ein anderes Foto.",
    avatarUpdated: "✓ Avatar aktualisiert"
  },
  es: {
    back: "← Atrás",
    section: "Sección",
    athlete: "Atleta",
    system: "PRO ATHLETE CARE SYSTEM",
    profileTitle: "Mi perfil",
    statsTitle: "Exportación de datos (GDPR)",
    securityTitle: "Seguridad y privacidad",
    menuProfile: "1. Perfil y antropometría",
    menuStats: "2. Analíticas e informes PDF",
    menuSecurity: "3. Seguridad y privacidad",
    menuLogout: "4. Cerrar sesión",
    dataProtection: "Protección de datos (GDPR)",
    dataProtectionText: "Tus datos se procesan de acuerdo con GDPR.",
    mfaTitle: "Autenticación de dos factores (2FA)",
    mfaChecking: "Comprobando estado...",
    mfaEnable: "Activar 2FA (SMS)",
    newPassword: "Nueva contraseña",
    confirmPassword: "Confirmar",
    updatePassword: "Actualizar contraseña",
    deleteInfo: "Puedes solicitar la eliminación de la cuenta aquí. Revisaremos la solicitud antes de eliminar el perfil y los datos de entrenamiento.",
    requestDelete: "Solicitar eliminación de cuenta",
    firstName: "Nombre",
    lastName: "Apellido",
    currentEmail: "Email actual",
    newEmail: "Nuevo Email",
    emailPassword: "Confirmación de contraseña",
    changeEmail: "Cambiar Email",
    sport: "Deporte",
    chooseSport: "— elige deporte —",
    club: "Club",
    country: "País",
    chooseCountry: "— elige país —",
    competitionLevel: "Nivel competitivo",
    notSet: "— no indicado —",
    phone: "Teléfono (opcional)",
    saveChanges: "Guardar cambios",
    exportHeading: "EXPORTACIÓN DE DATOS (GDPR)",
    startDate: "Fecha de inicio",
    endDate: "Fecha de fin",
    pdfPeriod: "PDF por período",
    pdfAllTime: "PDF de todo el tiempo",
    exportJson: "Exportar todos los datos (JSON)",
    jsonInfo: "JSON incluye perfil + subcolecciones del usuario.",
    onboardingSummary: "Resumen de onboarding",
    sportShort: "Deporte",
    seasonShort: "Temporada",
    positionShort: "Posición",
    goalsShort: "Objetivos",
    clubMissing: "Club no indicado",
    enterNewEmail: "Introduce un nuevo email",
    enterPassword: "Introduce tu contraseña para confirmar",
    emailChanged: "✓ Email cambiado",
    emailChangeError: "No se pudo cambiar el email. Revisa la contraseña o inténtalo de nuevo.",
    loginBeforeDelete: "Inicia sesión antes de solicitar la eliminación de la cuenta.",
    deleteConfirm: "¿Solicitar eliminación de cuenta?\n\nLa solicitud se enviará para revisión.\nLos datos de entrenamiento, wellness, injury, load, weight y perfil pueden eliminarse después de la revisión.\n\nEsta acción es seria. El usuario de Firebase Auth y los datos no se eliminarán inmediatamente.",
    sendingDelete: "Enviando solicitud de eliminación de cuenta...",
    deleteSaved: "✓ Solicitud de eliminación de cuenta guardada.",
    avatarNoImage: "Elige un archivo de imagen.",
    avatarTooLarge: "La foto es demasiado grande. Elige un archivo de hasta 8 MB.",
    avatarUploadError: "No se pudo subir el avatar. Prueba otra foto.",
    avatarUpdated: "✓ Avatar actualizado"
  },
  ru: {
    back: "← Назад",
    section: "Раздел",
    athlete: "Атлет",
    system: "PRO ATHLETE CARE SYSTEM",
    profileTitle: "Мой профиль",
    statsTitle: "Экспорт данных (GDPR)",
    securityTitle: "Безопасность и приватность",
    menuProfile: "1. Профиль и антропометрия",
    menuStats: "2. Аналитика и PDF-отчеты",
    menuSecurity: "3. Безопасность и конфиденциальность",
    menuLogout: "4. Выйти из системы",
    dataProtection: "Защита данных (GDPR)",
    dataProtectionText: "Ваши данные обрабатываются согласно GDPR.",
    mfaTitle: "Двухфакторная аутентификация (2FA)",
    mfaChecking: "Проверка статуса...",
    mfaEnable: "Включить 2FA (SMS)",
    newPassword: "Новый пароль",
    confirmPassword: "Подтвердить",
    updatePassword: "Обновить пароль",
    deleteInfo: "Здесь можно запросить удаление аккаунта. Мы проверим запрос перед удалением профиля и тренировочных данных.",
    requestDelete: "Запросить удаление аккаунта",
    firstName: "Имя",
    lastName: "Фамилия",
    currentEmail: "Текущий Email",
    newEmail: "Новый Email",
    emailPassword: "Пароль для подтверждения",
    changeEmail: "Изменить Email",
    sport: "Вид спорта",
    chooseSport: "— выберите спорт —",
    club: "Клуб",
    country: "Страна",
    chooseCountry: "— выберите страну —",
    competitionLevel: "Уровень соревнований",
    notSet: "— не указано —",
    phone: "Телефон (опционально)",
    saveChanges: "Сохранить изменения",
    exportHeading: "ЭКСПОРТ ДАННЫХ (GDPR)",
    startDate: "Дата начала",
    endDate: "Дата окончания",
    pdfPeriod: "PDF за период",
    pdfAllTime: "PDF за все время",
    exportJson: "Экспортировать все данные (JSON)",
    jsonInfo: "JSON включает профиль + подколлекции пользователя.",
    onboardingSummary: "Итоги онбординга",
    sportShort: "Спорт",
    seasonShort: "Сезон",
    positionShort: "Позиция",
    goalsShort: "Цели",
    clubMissing: "Клуб не указан",
    enterNewEmail: "Введите новый email",
    enterPassword: "Введите пароль для подтверждения",
    emailChanged: "✓ Email изменен",
    emailChangeError: "Не удалось изменить email. Проверьте пароль или попробуйте снова.",
    loginBeforeDelete: "Войдите в аккаунт перед запросом на удаление.",
    deleteConfirm: "Запросить удаление аккаунта?\n\nЗапрос будет отправлен на проверку.\nДанные training, wellness, injury, load, weight и профиль могут быть удалены после проверки.\n\nЭто серьезное действие. Firebase Auth user и данные пользователя не будут удалены мгновенно.",
    sendingDelete: "Отправляем запрос на удаление аккаунта...",
    deleteSaved: "✓ Запрос на удаление аккаунта сохранен.",
    avatarNoImage: "Выберите файл изображения.",
    avatarTooLarge: "Фото слишком большое. Выберите файл до 8 MB.",
    avatarUploadError: "Не удалось загрузить аватар. Попробуйте другое фото.",
    avatarUpdated: "✓ Аватар обновлен"
  },
  pt: {
    back: "← Voltar",
    section: "Seção",
    athlete: "Atleta",
    system: "PRO ATHLETE CARE SYSTEM",
    profileTitle: "Meu perfil",
    statsTitle: "Exportação de dados (GDPR)",
    securityTitle: "Segurança e privacidade",
    menuProfile: "1. Perfil e antropometria",
    menuStats: "2. Análises e relatórios PDF",
    menuSecurity: "3. Segurança e privacidade",
    menuLogout: "4. Sair",
    dataProtection: "Proteção de dados (GDPR)",
    dataProtectionText: "Seus dados são processados de acordo com GDPR.",
    mfaTitle: "Autenticação de dois fatores (2FA)",
    mfaChecking: "Verificando status...",
    mfaEnable: "Ativar 2FA (SMS)",
    newPassword: "Nova senha",
    confirmPassword: "Confirmar",
    updatePassword: "Atualizar senha",
    deleteInfo: "Você pode solicitar a exclusão da conta aqui. Revisaremos a solicitação antes de excluir perfil e dados de treino.",
    requestDelete: "Solicitar exclusão da conta",
    firstName: "Nome",
    lastName: "Sobrenome",
    currentEmail: "Email atual",
    newEmail: "Novo Email",
    emailPassword: "Confirmação de senha",
    changeEmail: "Alterar Email",
    sport: "Esporte",
    chooseSport: "— escolha o esporte —",
    club: "Clube",
    country: "País",
    chooseCountry: "— escolha o país —",
    competitionLevel: "Nível competitivo",
    notSet: "— não informado —",
    phone: "Telefone (opcional)",
    saveChanges: "Salvar alterações",
    exportHeading: "EXPORTAÇÃO DE DADOS (GDPR)",
    startDate: "Data inicial",
    endDate: "Data final",
    pdfPeriod: "PDF por período",
    pdfAllTime: "PDF de todo o período",
    exportJson: "Exportar todos os dados (JSON)",
    jsonInfo: "JSON inclui perfil + subcoleções do usuário.",
    onboardingSummary: "Resumo do onboarding",
    sportShort: "Esporte",
    seasonShort: "Temporada",
    positionShort: "Posição",
    goalsShort: "Metas",
    clubMissing: "Clube não informado",
    enterNewEmail: "Informe um novo email",
    enterPassword: "Informe sua senha para confirmar",
    emailChanged: "✓ Email alterado",
    emailChangeError: "Não foi possível alterar o email. Verifique a senha ou tente novamente.",
    loginBeforeDelete: "Entre na conta antes de solicitar a exclusão.",
    deleteConfirm: "Solicitar exclusão da conta?\n\nSua solicitação será enviada para revisão.\nDados de treino, wellness, injury, load, weight e perfil podem ser excluídos após revisão.\n\nEsta ação é séria. O usuário Firebase Auth e os dados não serão excluídos imediatamente.",
    sendingDelete: "Enviando solicitação de exclusão da conta...",
    deleteSaved: "✓ Solicitação de exclusão da conta salva.",
    avatarNoImage: "Escolha um arquivo de imagem.",
    avatarTooLarge: "A foto é muito grande. Escolha um arquivo de até 8 MB.",
    avatarUploadError: "Não foi possível carregar o avatar. Tente outra foto.",
    avatarUpdated: "✓ Avatar atualizado"
  }
};

function getCabLang() {
  const raw = String(localStorage.getItem("pac_lang") || document.documentElement.lang || "uk").toLowerCase().trim();
  const lang = raw === "ua" ? "uk" : raw.slice(0, 2);
  return CABINET_I18N[lang] ? lang : "uk";
}

function getCabI18n() {
  return CABINET_I18N[getCabLang()] || CABINET_I18N.uk;
}

function setCabText(root, selector, text) {
  const el = root?.querySelector(selector);
  if (el) el.textContent = text;
}

function setCabPlaceholder(root, selector, text) {
  const el = root?.querySelector(selector);
  if (el) { el.placeholder = text; el.setAttribute('aria-label',text); }
}

function isCabTranslatedValue(value, key) {
  const raw = String(value || "").trim();
  return Object.values(CABINET_I18N).some((dict) => String(dict[key] || "").trim() === raw);
}

function applyCabinetI18n() {
  const root = document.getElementById("profileModal");
  if (!root) return;

  const t = getCabI18n();
  setCabText(root, "#cab-header button", t.back);
  const activeSection = Array.from(root.querySelectorAll(".cab-section")).find((section) => section.style.display !== "none");
  const activeTitle = activeSection?.id === "edit-profile" ? t.profileTitle
    : activeSection?.id === "my-stats" ? t.statsTitle
    : activeSection?.id === "security" ? t.securityTitle
    : t.section;
  setCabText(root, "#cab-title", activeTitle);
  const nameEl = root.querySelector(".user-name-display");
  if (nameEl && (!nameEl.textContent.trim() || isCabTranslatedValue(nameEl.textContent, "athlete"))) {
    nameEl.textContent = t.athlete;
  }
  const clubEl = root.querySelector("#user-club-display");
  if (clubEl && (!clubEl.textContent.trim() || isCabTranslatedValue(clubEl.textContent, "system") || isCabTranslatedValue(clubEl.textContent, "clubMissing"))) {
    clubEl.textContent = t.system;
  }

  const menuButtons = root.querySelectorAll("#cab-main-menu .modal-item");
  [t.menuProfile, t.menuStats, t.menuSecurity, t.menuLogout].forEach((text, index) => {
    if (menuButtons[index]) menuButtons[index].textContent = text;
  });

  const securityHeadings = root.querySelectorAll("#security h4");
  if (securityHeadings[0]) securityHeadings[0].textContent = t.dataProtection;
  if (securityHeadings[1]) securityHeadings[1].textContent = t.mfaTitle;
  setCabText(root, "#security p", t.dataProtectionText);
  setCabText(root, "#mfa-status", t.mfaChecking);
  setCabText(root, "#btn-enable-mfa", t.mfaEnable);
  setCabPlaceholder(root, "#new-pass", t.newPassword);
  setCabPlaceholder(root, "#confirm-pass", t.confirmPassword);
  setCabText(root, "#form-password button[type='submit']", t.updatePassword);
  const securityParagraphs = root.querySelectorAll("#security > p");
  if (securityParagraphs[0]) securityParagraphs[0].textContent = t.deleteInfo;
  setCabText(root, "button[onclick='handleDeleteAccount()']", t.requestDelete);

  const labels = root.querySelectorAll("#edit-profile label");
  [
    t.firstName,
    t.lastName,
    t.currentEmail,
    t.newEmail,
    t.emailPassword,
    t.sport,
    t.club,
    t.country,
    t.competitionLevel,
    t.phone
  ].forEach((text, index) => {
    if (labels[index]) labels[index].textContent = text;
  });
  setCabText(root, "#set-sport option[value='']", t.chooseSport);
  setCabText(root, "#set-country option[value='']", t.chooseCountry);
  setCabText(root, "#set-competitionLevel option[value='']", t.notSet);
  setCabText(root, "#btn-change-email", t.changeEmail);
  setCabText(root, "#form-profile button[type='submit']", t.saveChanges);

  setCabText(root, "#my-stats h4", t.exportHeading);
  const statsLabels = root.querySelectorAll("#my-stats label");
  if (statsLabels[0]) statsLabels[0].textContent = t.startDate;
  if (statsLabels[1]) statsLabels[1].textContent = t.endDate;
  setCabText(root, "button[onclick='generateFullPDF(false)']", t.pdfPeriod);
  setCabText(root, "button[onclick='generateFullPDF(true)']", t.pdfAllTime);
  setCabText(root, "button[onclick='exportAllUserData()']", t.exportJson);
  const statsInfo = root.querySelector("#my-stats p");
  if (statsInfo) statsInfo.textContent = t.jsonInfo;

  try {
    const data = __meCache?.data || {};
    if (document.getElementById("onboarding-quick-view") || document.getElementById("onboarding-profile-summary")) {
      renderOnboardingSummary(data);
    }
  } catch {}
}


// ==============================================
// EMAIL CHANGE (requires re-auth)
// ==============================================
document.addEventListener('click', async (e) => {
  if (e.target.id !== 'btn-change-email') return;

  const user = auth.currentUser;
  if (!user) return;

  const newEmail = (document.getElementById('set-new-email')?.value || "").trim();
  const pass = document.getElementById('set-email-pass')?.value || "";
  const status = document.getElementById('email-change-status');

  const copy = getCabI18n();
  if (!newEmail) return alert(copy.enterNewEmail);
  if (!pass) return alert(copy.enterPassword);

  try {
    // Re-auth
    const cred = firebase.auth.EmailAuthProvider.credential(user.email, pass);
    await user.reauthenticateWithCredential(cred);

    // Update email
    await user.updateEmail(newEmail);

    // Update UI
    if (document.getElementById('set-email')) document.getElementById('set-email').value = newEmail;
    if (status) {
      status.innerText = copy.emailChanged;
      status.style.display = "block";
    }

  } catch (err) {
    console.error("Email change error:", err);
    alert(copy.emailChangeError);
  }
});



// Допоміжна функція для оновлення даних в модалці
async function updateProfileInModal(user) {
  try {
    const data = await getMeDataCached();
    const photo = getStoredAvatarForUid(user.uid) || data?.photoURL || await getPublicAvatarForUid(user.uid) || user.photoURL || "../assets/images/AK_logo.png";

    if (document.getElementById('profile-img-preview')) document.getElementById('profile-img-preview').src = photo;
    if (document.getElementById('user-email-view')) document.getElementById('user-email-view').innerText = user.email;
    if (document.getElementById('set-firstName')) document.getElementById('set-firstName').value = data?.firstName || "";
    if (document.getElementById('set-lastName')) document.getElementById('set-lastName').value = data?.lastName || "";
    if (document.getElementById('set-email')) document.getElementById('set-email').value = user.email;
    if (document.getElementById('set-sport')) document.getElementById('set-sport').value = pickUserSport(data);
    renderOnboardingSummary(data || {});
  } catch (e) {
    console.warn("updateProfileInModal: cache/get failed", e?.message || e);
  }
}

// Викликаємо при завантаженні
document.addEventListener('DOMContentLoaded', injectProfileModal);

// 3. ПІДСВІТКА АКТИВНОГО ПОСИЛАННЯ
function highlightActiveLink() {
    let currentPath = window.location.pathname.split('/').pop() || "wellness.html";
    document.querySelectorAll('.sidebar a').forEach(link => {
        const linkPath = link.getAttribute('href').split('/').pop();
        if (linkPath === currentPath) link.classList.add('active');
    });
}

// 4. МОДАЛЬНЕ ВІКНО (КАБІНЕТ) ТА ПЕРЕХОДИ
function openProfile() {
    const modal = document.getElementById('profileModal');
    if (modal) {
        applyCabinetI18n();
        modal.style.display = 'block';
        goBackToMenu();
        const user = auth.currentUser;
        if (user) updateProfileInModal(user);
    }
}

function closeProfile() {
    const modal = document.getElementById('profileModal');
    if (modal) modal.style.display = 'none';
}

// Функція відкриття розділу всередині модалки
async function openCabSection(sectionId, title) {
  const copy = getCabI18n();
  const titleBySection = {
    "edit-profile": copy.profileTitle,
    "my-stats": copy.statsTitle,
    "security": copy.securityTitle
  };
  // 1) Перемикаємо видимість розділів
  const mainMenu = document.getElementById('cab-main-menu');
  if (mainMenu) mainMenu.style.display = 'none';

  document.querySelectorAll('.cab-section').forEach(s => (s.style.display = 'none'));

  const header = document.getElementById('cab-header');
  if (header) header.style.display = 'flex';

  const cabTitle = document.getElementById('cab-title');
  if (cabTitle) cabTitle.innerText = titleBySection[sectionId] || title || copy.section;

  const sectionEl = document.getElementById(sectionId);
  if (sectionEl) sectionEl.style.display = 'block';
  applyCabinetI18n();

  // 2) Підтягуємо дані
  const user = auth.currentUser;
  if (!user) return;

  
    try {
    const data = await getMeDataCached();

    // --- EDIT PROFILE ---
    if (sectionId === 'edit-profile') {
      const set = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.value = val ?? "";
      };

      set('set-firstName', data.firstName);
      set('set-lastName', data.lastName);
      set('set-sport', pickUserSport(data));
      set('set-club', data.club);
      set('set-phone', data.phone);
      set('set-competitionLevel', data.competitionLevel);
      set('set-country', data.country);
      renderOnboardingSummary(data || {});

      const status = document.getElementById('profile-save-status');
      if (data.updatedAt && status && typeof data.updatedAt.toDate === "function") {
        const d = data.updatedAt.toDate();
        status.innerText = `✓ Дані збережено · ${d.toLocaleString()}`;
        status.style.display = "block";
      }
    }

    // --- MY STATS (GDPR EXPORT ONLY) ---
    if (sectionId === 'my-stats') {
      // ✅ тут НЕ чіпаємо метрики і НЕ рахуємо BMI/BMR
      // бо в my-stats у тебе зараз тільки кнопки PDF/JSON
    }

  } catch (error) {
    console.error("Помилка при завантаженні даних у поля:", error);
  }
}


// Функція повернення назад у головне меню модалки
function goBackToMenu() {
    document.querySelectorAll('.cab-section').forEach(s => s.style.display = 'none');
    document.getElementById('cab-header').style.display = 'none';
    document.getElementById('cab-main-menu').style.display = 'block';
    applyCabinetI18n();
}

// Оновлена функція завантаження даних
async function loadUserStats() {
    const user = auth.currentUser;
    if (!user) return;

        try {
        const data = await getMeDataCached();

        // Заповнюємо поля "Профіль"
        if (document.getElementById('set-sport')) document.getElementById('set-sport').value = pickUserSport(data);
        if (document.getElementById('set-club')) document.getElementById('set-club').value = data.club || "";
        if (document.getElementById('set-phone')) document.getElementById('set-phone').value = data.phone || "";
        if (document.getElementById('set-city')) document.getElementById('set-city').value = data.city || "";
        renderOnboardingSummary(data || {});
        if (document.getElementById('user-club-display')) document.getElementById('user-club-display').innerText = data.club || getCabI18n().clubMissing;

        // Заповнюємо поля "Метрики"
        if (document.getElementById('set-height')) document.getElementById('set-height').value = data.height || "";
        if (document.getElementById('set-weight')) document.getElementById('set-weight').value = data.weight || "";
        if (document.getElementById('set-age')) document.getElementById('set-age').value = data.age || "";

        calculateHealthMetrics(data.weight, data.height, data.age);
    } catch (e) { console.error("Помилка:", e); }
}

// Функція розрахунку ІМТ та BMR (Німецький стандарт точності)
function calculateHealthMetrics(weight, height, age) {
    if (weight && height) {
        const hMeter = height / 100;
        const bmi = (weight / (hMeter * hMeter)).toFixed(1);
        document.getElementById('bmi-result').innerText = `ІМТ: ${bmi}`;
        
        // Базовий метаболізм (BMR) за формулою Міффліна-Сан Жеора
        if (age) {
            const bmr = Math.round(10 * weight + 6.25 * height - 5 * age + 5); 
            document.getElementById('bmr-result').innerText = `BMR: ${bmr} kcal`;
        }
    }
}

// ЗАПУСК ПРИ ЗАВАНТАЖЕННІ
document.addEventListener('DOMContentLoaded', () => {
    setupMenuToggle(); 
    highlightActiveLink();
    ensureUdCardsVisible();
});

// Закриття модалки при кліку на фон
window.onclick = function(event) {
    const modal = document.getElementById('profileModal');
    if (event.target === modal) closeProfile();
}

// ПУНКТ 1: Збереження змін профілю


// ПУНКТ 3: Налаштування (Зміна мови)
async function updateLanguage() {
    const lang = document.getElementById('language-select').value;
    const user = auth.currentUser;
    if (user) {
        try {
            await db.collection('users').doc(user.uid).update({ language: lang });
            // Тут можна додати виклик функції перекладу інтерфейсу
        } catch (e) { console.error(e); }
    }
}

// ПУНКТ 4: Приватність (запит на видалення акаунту)
async function handleDeleteAccount() {
  const user = auth.currentUser;
  const copy = getCabI18n();
  if (!user) return alert(copy.loginBeforeDelete);

  const confirmation = confirm(copy.deleteConfirm);
  if (!confirmation) return;

  const status = document.getElementById("account-delete-request-status");
  if (status) {
    status.innerText = copy.sendingDelete;
    status.style.color = "#FFC72C";
    status.style.display = "block";
  }

  try {
    await db.collection("account_deletion_requests").doc(user.uid).set({
      uid: user.uid,
      email: user.email || "",
      status: "requested",
      requestedAtMs: Date.now(),
      requestedAt: firebase.firestore.FieldValue.serverTimestamp(),
      source: "app_profile_security",
      appMode: !!window.__PAC_APP_MODE__
    }, { merge: true });

    if (status) {
      status.innerText = copy.deleteSaved;
      status.style.color = "#7CFF9B";
    }
    alert(copy.deleteSaved);
  } catch (error) {
    console.error("account deletion request error:", error);
    if (status) {
      status.innerText = "Could not save request. Please try again.";
      status.style.color = "#DA3E52";
    }
    alert("Could not save account deletion request. Please try again.");
  }
}


// ПУНКТ 5: Вихід
// PATCH START: unified logout to index (absolute-safe)
function getSiteBase() { return '/ProAthleteCare-1/gps-iphone-v14/';
  const baseTag = document.querySelector('base[href]');
  if (baseTag) return new URL(baseTag.getAttribute('href'), window.location.origin).pathname;

  const isGithub = window.location.hostname.endsWith('github.io');
  const parts = window.location.pathname.split('/').filter(Boolean);

  if (isGithub) {
    const pagesIndex = parts.indexOf('pages');
    if (pagesIndex > 0) return `/${parts.slice(0, pagesIndex).join('/')}/`;
    // якщо перший сегмент "pages" — це точно не repo
    if (parts[0] && parts[0] !== "pages") return `/${parts[0]}/`;
    // fallback: repo з hardcode (твій проект)
    return "/KingArt888-ProAthleteCare/";
  }

  return "/";
}


function logout() {
  if (confirm("Вийти з системи?")) {
    auth.signOut().finally(() => {
      const base = getSiteBase();
      window.location.replace(base + "index.html");
    });
  }
}

// PATCH END

// Використовуємо делегування подій для динамічної форми
// ==============================================
// TARGET UID (user or admin-view)
// ==============================================
function getTargetUid() {
  const u = auth.currentUser;
  if (!u) return null;
  // якщо адмін дивиться профіль атлета -> window.currentUserId (з auth-guard)
  return window.currentUserId || u.uid;
}

function getSelectedPeriod() {
  const start = document.getElementById("pdf-start-date")?.value || "";
  const end = document.getElementById("pdf-end-date")?.value || new Date().toISOString().split("T")[0];
  return { start, end };
}

// Firestore Timestamp / Date / object -> safe normalize


async function safeQueryToArray(queryPromise) {
  try {
    const snap = await queryPromise;
    return snap.docs.map(d => ({ id: d.id, ...normalizeFirestoreValue(d.data()) }));
  } catch (e) {
    console.warn("Query failed:", e);
    return [];
  }
}

// ==============================================
// COLLECT ALL DATA (for JSON + PDF)
// period: {start,end}, allTime: boolean
// ==============================================
async function collectAllUserData({ allTime = false } = {}) {
  const uid = getTargetUid();
  if (!uid) throw new Error("No target uid");

  const { start, end } = getSelectedPeriod();
  const user = auth.currentUser;

  // meta (auth)
  const meta = {
    exportedAt: new Date().toISOString(),
    targetUid: uid,
    requesterUid: user?.uid || null,
    email: user?.email || null,
    emailVerified: !!user?.emailVerified,
    createdAt: user?.metadata?.creationTime || null,
    lastLogin: user?.metadata?.lastSignInTime || null,
  };

  // 1) users/{uid}
  const userDoc = await db.collection("users").doc(uid).get();
  const profile = userDoc.exists ? normalizeFirestoreValue(userDoc.data()) : {};

  // 2) users/{uid}/wellness  (date string "YYYY-MM-DD")
  let wellnessQuery = db.collection("users").doc(uid).collection("wellness");
  if (!allTime && start) {
    wellnessQuery = wellnessQuery.where("date", ">=", start).where("date", "<=", end);
  }
  const wellnessSub = await safeQueryToArray(wellnessQuery.orderBy("date", "desc").get());

  // EXTRA: possible subcollections (if you store inside users/{uid}/...)
const injuriesSub = await safeQueryToArray(
  db.collection("users").doc(uid).collection("injuries").get()
);

const weightSub = await safeQueryToArray(
  db.collection("users").doc(uid).collection("weight_history").get()
);

const loadSub = await safeQueryToArray(
  db.collection("users").doc(uid).collection("load_season_reports").get()
);

const weeklySub = await safeQueryToArray(
  db.collection("users").doc(uid).collection("weekly_plans").get()
);

const dailySub = await safeQueryToArray(
  db.collection("users").doc(uid).collection("athlete_reports").get()
);


  // 3) top-level collections used across pages
  // NOTE: якщо десь поля дат відрізняються — ми все одно заберемо дані, але без фільтра
  // (щоб не було пусто)

  // wellness_reports: usually has userId and timestamp (Firestore Timestamp)
  let wellnessReportsQ = db.collection("wellness_reports").where("userId", "==", uid);
  if (!allTime && start) {
    // optional: if they have "date" string -> filter; if only timestamp -> we skip filter
    // (безпечно: не ламаємо запит)
  }
  const wellnessReports = await safeQueryToArray(wellnessReportsQ.get());

  // injuries: has userId
  const injuries = await safeQueryToArray(
    db.collection("injuries").where("userId", "==", uid).get()
  );

  // load_season_reports: has userId
  const loadSeasonReports = await safeQueryToArray(
    db.collection("load_season_reports").where("userId", "==", uid).get()
  );

  // weight_history: has userId and usually "date" (string) or timestamp
  const weightHistory = await safeQueryToArray(
    db.collection("weight_history").where("userId", "==", uid).get()
  );

  // athlete_plans/{uid} (doc)
  const athletePlanDoc = await db.collection("athlete_plans").doc(uid).get();
  const athletePlans = athletePlanDoc.exists ? normalizeFirestoreValue(athletePlanDoc.data()) : null;

  // weekly_plans: has userId
  const weeklyPlans = await safeQueryToArray(
    db.collection("weekly_plans").where("userId", "==", uid).get()
  );

  // athlete_reports: daily feedback uses field "uid"
  const athleteReports = await safeQueryToArray(
    db.collection("athlete_reports").where("uid", "==", uid).get()
  );

  return {
    meta: {
      ...meta,
      period: allTime ? "ALL_TIME" : { start, end }
    },
    firestore: {
  users_doc: profile,
  users_wellness_subcollection: wellnessSub,

  // top-level
  wellness_reports: wellnessReports,
  injuries,
  load_season_reports: loadSeasonReports,
  weight_history: weightHistory,
  athlete_plans: athletePlans,
  weekly_plans: weeklyPlans,
  athlete_reports: athleteReports,

  // subcollection fallbacks
  injuries_sub: injuriesSub,
  weight_sub: weightSub,
  load_sub: loadSub,
  weekly_sub: weeklySub,
  daily_sub: dailySub
}
  };
}

// ==============================================
// ЛОГІКА ЗБЕРЕЖЕННЯ ТА ЕКСПОРТУ (GDPR)
// ==============================================

// Функція для генерації PDF (GDPR Export)
function pdfAddSectionTitle(doc, title) {
  doc.setTextColor(212, 175, 55);
  doc.setFontSize(14);
  doc.text(title, 14, doc.lastAutoY || 20);
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
}

function ensureY(doc, y, minY = 20, maxY = 280) {
  if (y > maxY) {
    doc.addPage();
    return minY;
  }
  return y;
}

function pdfHeader(doc, title, subtitle) {
  doc.setFillColor(0, 0, 0);
  doc.rect(0, 0, 210, 30, "F");
  doc.setTextColor(212, 175, 55);
  doc.setFontSize(18);
  doc.text(title, 14, 18);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text(subtitle, 14, 26);
  doc.setTextColor(0, 0, 0);
}

function pdfWriteKeyValue(doc, y, key, value) {
  doc.setFontSize(10);
  doc.setTextColor(120, 120, 120);
  doc.text(`${key}:`, 14, y);
  doc.setTextColor(0, 0, 0);
  const text = String(value ?? "");
  const lines = doc.splitTextToSize(text, 160);
  doc.text(lines, 55, y);
  return y + lines.length * 5 + 2;
}

function pdfWriteList(doc, y, rows, formatRowFn) {
  doc.setFontSize(9);
  for (const r of rows) {
    const line = formatRowFn(r);
    const lines = doc.splitTextToSize(line, 185);
    doc.text(lines, 14, y);
    y += lines.length * 5;
    y = ensureY(doc, y);
  }
  return y;
}

async function generateFullPDF(allTime = false) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  try {
    const data = await collectAllUserData({ allTime });

    const uid = data.meta.targetUid;
    const periodText = allTime
      ? "ALL TIME"
      : `PERIOD: ${data.meta.period.start} - ${data.meta.period.end}`;

    const profile = data.firestore.users_doc || {};
    const fullName = `${profile.firstName || ""} ${profile.lastName || ""}`.trim() || "Athlete";

    // титул
    pdfHeader(doc, "PRO ATLET CARE", `FULL REPORT | ${periodText}`);
    let y = 40;

    y = pdfWriteKeyValue(doc, y, "Athlete", fullName);
    y = pdfWriteKeyValue(doc, y, "UID", uid);
    y = pdfWriteKeyValue(doc, y, "Exported", data.meta.exportedAt);

    // ---- SECTION: Wellness (subcollection)
    doc.addPage();
    pdfHeader(doc, "SECTION", "WELLNESS");
    y = 40;
    doc.setFontSize(11);
    doc.text("users/{uid}/wellness", 14, y);
    y += 8;

    const wellness = data.firestore.users_wellness_subcollection || [];
    if (!wellness.length) {
      doc.setFontSize(10);
      doc.text("No wellness records for selected period.", 14, y);
    } else {
      y = pdfWriteList(doc, y, wellness, (w) => {
        const date = w.date || "";
        const s = w.scores || {};
        return `${date} | ready: ${s.ready ?? "-"} | stress: ${s.stress ?? "-"} | sleep: ${s.sleep ?? "-"}`;
      });
    }

    // ---- SECTION: Wellness Reports (top-level)
    doc.addPage();
    pdfHeader(doc, "SECTION", "WELLNESS REPORTS");
    y = 40;
    const wrep = data.firestore.wellness_reports || [];
    if (!wrep.length) {
      doc.text("No wellness_reports found.", 14, y);
    } else {
      y = pdfWriteList(doc, y, wrep, (r) => {
        const date = r.date || r.createdAt || r.timestamp || "";
        const ready = r.ready ?? r.scores?.ready ?? "-";
        const stress = r.stress ?? r.scores?.stress ?? "-";
        const sleep = r.sleep ?? r.scores?.sleep ?? "-";
        return `${date} | ready: ${ready} | stress: ${stress} | sleep: ${sleep}`;
      });
    }

    // ---- SECTION: Injuries
    doc.addPage();
    pdfHeader(doc, "SECTION", "INJURIES");
    y = 40;
    const injuries = data.firestore.injuries || [];
    if (!injuries.length) {
      doc.text("No injuries records found.", 14, y);
    } else {
      y = pdfWriteList(doc, y, injuries, (i) => {
        const date = i.date || i.createdAt || "";
        const name = i.injuryName || i.title || i.type || "injury";
        const status = i.status || i.stage || "";
        return `${date} | ${name} | ${status}`;
      });
    }

    // ---- SECTION: Load Season
    doc.addPage();
    pdfHeader(doc, "SECTION", "LOAD SEASON");
    y = 40;
    const load = data.firestore.load_season_reports || [];
    if (!load.length) {
      doc.text("No load_season_reports found.", 14, y);
    } else {
      y = pdfWriteList(doc, y, load, (l) => {
        const date = l.date || l.createdAt || "";
        const total = l.totalLoad ?? l.load ?? "-";
        const note = l.note || "";
        return `${date} | load: ${total} | ${note}`;
      });
    }

    // ---- SECTION: Weight
    doc.addPage();
    pdfHeader(doc, "SECTION", "WEIGHT HISTORY");
    y = 40;
    const weight = data.firestore.weight_history || [];
    if (!weight.length) {
      doc.text("No weight_history found.", 14, y);
    } else {
      y = pdfWriteList(doc, y, weight, (w) => {
        const date = w.date || w.createdAt || "";
        const kg = w.weight ?? w.kg ?? "-";
        return `${date} | weight: ${kg}`;
      });
    }

    // ---- SECTION: Weekly Plans
    doc.addPage();
    pdfHeader(doc, "SECTION", "WEEKLY PLANS");
    y = 40;
    const weekly = data.firestore.weekly_plans || [];
    if (!weekly.length) {
      doc.text("No weekly_plans found.", 14, y);
    } else {
      y = pdfWriteList(doc, y, weekly, (p) => {
        const week = p.weekId || p.week || p.startDate || "";
        const match = p.matchDay || p.match || "";
        return `week: ${week} | match: ${match}`;
      });
    }

    // ---- SECTION: Daily Reports (athlete_reports)
    doc.addPage();
    pdfHeader(doc, "SECTION", "DAILY REPORTS");
    y = 40;
    const daily = data.firestore.athlete_reports || [];
    if (!daily.length) {
      doc.text("No athlete_reports found.", 14, y);
    } else {
      y = pdfWriteList(doc, y, daily, (r) => {
        const date = r.date || r.createdAt || "";
        const text = r.text || r.comment || r.feedback || "";
        return `${date} | ${text}`.trim();
      });
    }
    

    const safeLast = (profile.lastName || "Export").toString().replace(/\s+/g, "_");
    const suffix = allTime ? "ALL_TIME" : "PERIOD";

    doc.save(`PAC_Full_Report_${safeLast}_${suffix}.pdf`);

  } catch (e) {
    console.error(e);
    alert("❌ Помилка PDF. Перевір console (F12).");
  }
}


// Єдиний обробник для всіх форм у модалці
document.addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    // 1. Форма профілю
    if (e.target.id === 'form-profile') {
  const form=e.target;if(form.dataset.saving==='true')return;
  const saveButton=form.querySelector('[type="submit"]'),status=document.getElementById('profile-save-status');
  form.dataset.saving='true';if(saveButton)saveButton.disabled=true;
  if(status){status.style.display='block';status.setAttribute('role','status');status.textContent=document.documentElement.lang==='uk'?'Зберігаємо…':'Saving…';}

  const profileData = {
    uid: user.uid,
    firstName: document.getElementById('set-firstName').value,
    lastName: document.getElementById('set-lastName').value,
    sport: document.getElementById('set-sport').value,
    sportType: document.getElementById('set-sport').value,
    club: document.getElementById('set-club').value,
    phone: document.getElementById('set-phone').value,
    country: document.getElementById('set-country').value,
    competitionLevel: document.getElementById('set-competitionLevel').value,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  };

  try{
  await db.collection('users').doc(user.uid).set(profileData, { merge: true });
  if(auth.currentUser?.uid!==user.uid)return;

  
// keep local cache fresh WITHOUT extra read
setMeCache(user.uid, { ...(__meCache.data || {}), ...profileData });
setMeDocCache(user.uid, { exists: true, data: () => ({ ...(__meCache.data || {}), ...profileData }) });

  if (status) {
    status.innerText = "✓ Дані збережено";
    status.style.display = "block";
  }
  window.dispatchEvent(new CustomEvent('pac:profile-updated',{detail:{userId:user.uid}}));
  }catch(error){if(status){status.setAttribute('role','alert');status.textContent=document.documentElement.lang==='uk'?'Не вдалося зберегти. Дані залишились у формі — спробуй ще раз.':'Could not save. Your entries remain in the form; try again.';}}
  finally{delete form.dataset.saving;if(saveButton)saveButton.disabled=false;}
}

            
            

    // 2. Форма метрик (Вага/Зріст)
    if (e.target.id === 'form-metrics') {
        const metricsData = {
            uid: user.uid,
            height: Number(document.getElementById('set-height').value),
            weight: Number(document.getElementById('set-weight').value),
            age: Number(document.getElementById('set-age').value)
        };
        await db.collection('users').doc(user.uid).set(metricsData, { merge: true });
        window.dispatchEvent(new CustomEvent('pac:profile-updated',{detail:{userId:user.uid}}));
        if (typeof calculateHealthMetrics === "function") {
            calculateHealthMetrics(metricsData.weight, metricsData.height, metricsData.age);
        }
        alert("Метрики оновлено! 📈");
    }

    // 3. Форма пароля
    if (e.target.id === 'form-password') {
        const newPass = document.getElementById('new-pass').value;
        const confirmPass = document.getElementById('confirm-pass').value;
        if (newPass !== confirmPass) return alert("Паролі не співпадають!");
        if (newPass.length < 6) return alert("Пароль занадто короткий!");
        if (!user.email) return alert("Не знайдено email акаунта.");

        const host = String(window.location.hostname || "").toLowerCase();
        const isProdHost = host === "proathletecare.com" || host === "www.proathletecare.com";
        const isLocalHost = host === "localhost" || host === "127.0.0.1";
        const origin = isProdHost
            ? window.location.origin
            : (isLocalHost ? window.location.origin.replace("127.0.0.1", "localhost") : "https://proathletecare.com");
        const currentLang = (() => {
            try {
                const raw = String(localStorage.getItem("pac_lang") || "").trim().toLowerCase();
                if (raw === "ua") return "uk";
                if (["uk", "en", "de", "es", "ru", "pt"].includes(raw)) return raw;
            } catch {}
            return "en";
        })();
        const actionUrl = `${origin}/ProAthleteCare-1/gps-iphone-v14/pages/regist.html?from=email-action&lang=${encodeURIComponent(currentLang)}`;
        const actionCodeSettings = { url: actionUrl, handleCodeInApp: false };

        try {
            const rawLang = String(localStorage.getItem("pac_lang") || "").toLowerCase();
            const lang = rawLang === "ua" ? "uk" : rawLang.slice(0, 2);
            if (["uk", "en", "de", "es", "ru", "pt"].includes(lang)) {
                auth.languageCode = lang;
            }
        } catch {}

        try {
            await auth.sendPasswordResetEmail(user.email, actionCodeSettings);
        } catch (err) {
            const code = String(err?.code || "");
            if (
                code === "auth/invalid-continue-uri" ||
                code === "auth/unauthorized-continue-uri" ||
                code === "auth/missing-continue-uri"
            ) {
                await auth.sendPasswordResetEmail(user.email);
            } else {
                console.error(err);
                alert("Не вдалося надіслати лист для зміни пароля. Спробуй ще раз.");
                return;
            }
        }

        alert("Ми надіслали лист для безпечної зміни пароля. Відкрий email і натисни кнопку.");
        e.target.reset();
    }
});
// ==============================================
// AVATAR UPLOAD
// ==============================================
document.addEventListener('click', (e) => {
    const avatarTrigger = e.target.closest?.('#profile-img-preview, .avatar-container label');
    if (!avatarTrigger) return;
    e.preventDefault();
    const input = document.getElementById('avatar-input');
    if (input) input.click();
});

function getAvatarStorage() {
    try {
        const host = String(window.location.hostname || "").toLowerCase();
        const isLocalPreview = host === "localhost" || host === "127.0.0.1" || host === "::1";
        if (isLocalPreview) return null;
        if (window.storage && typeof window.storage.ref === "function") return window.storage;
        if (window.firebase && typeof firebase.storage === "function") return firebase.storage();
    } catch (e) {
        console.warn("Avatar storage unavailable:", e?.message || e);
    }
    return null;
}

function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = () => reject(reader.error || new Error("File read failed"));
        reader.readAsDataURL(file);
    });
}

function loadImageFromDataUrl(dataUrl) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("Image load failed"));
        img.src = dataUrl;
    });
}

function dataUrlToBlob(dataUrl) {
    const parts = String(dataUrl).split(",");
    const meta = parts[0] || "";
    const binary = atob(parts[1] || "");
    const mime = (meta.match(/data:([^;]+)/) || [])[1] || "image/jpeg";
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return new Blob([bytes], { type: mime });
}

function avatarDataUrlBytes(dataUrl) {
    const raw = String(dataUrl || "");
    const b64 = raw.split(",")[1] || "";
    return Math.ceil((b64.length * 3) / 4);
}

function canvasToSafeAvatarDataUrl(canvas, maxBytes = 450000) {
    const sizes = [320, 288, 256, 224, 192];
    const qualities = [0.86, 0.78, 0.68, 0.58, 0.48];

    for (const size of sizes) {
        const out = document.createElement("canvas");
        out.width = size;
        out.height = size;
        const ctx = out.getContext("2d");
        ctx.fillStyle = "#050505";
        ctx.fillRect(0, 0, size, size);
        ctx.drawImage(canvas, 0, 0, size, size);

        for (const quality of qualities) {
            const dataUrl = out.toDataURL("image/jpeg", quality);
            if (avatarDataUrlBytes(dataUrl) <= maxBytes) return dataUrl;
        }
    }

    const tiny = document.createElement("canvas");
    tiny.width = 160;
    tiny.height = 160;
    tiny.getContext("2d").drawImage(canvas, 0, 0, 160, 160);
    return tiny.toDataURL("image/jpeg", 0.42);
}

function showAvatarCropper(file, copy) {
    return new Promise(async (resolve, reject) => {
        let sourceUrl = "";
        try {
            sourceUrl = await readFileAsDataUrl(file);
            const img = await loadImageFromDataUrl(sourceUrl);

            const old = document.getElementById("pac-avatar-cropper");
            if (old) old.remove();

            const modal = document.createElement("div");
            modal.id = "pac-avatar-cropper";
            modal.innerHTML = `
<div class="pac-avatar-crop-backdrop">
  <div class="pac-avatar-crop-panel">
    <div class="pac-avatar-crop-head">
      <div>
        <div class="pac-avatar-crop-title">Avatar</div>
        <div class="pac-avatar-crop-sub">Drag and zoom to frame your face</div>
      </div>
      <button type="button" class="pac-avatar-crop-close" aria-label="Close">×</button>
    </div>
    <canvas class="pac-avatar-crop-canvas" width="320" height="320"></canvas>
    <div class="pac-avatar-crop-controls">
      <input class="pac-avatar-crop-zoom" type="range" min="1" max="3" step="0.01" value="1">
      <div class="pac-avatar-crop-actions">
        <button type="button" class="pac-avatar-crop-cancel">Cancel</button>
        <button type="button" class="pac-avatar-crop-save">Save avatar</button>
      </div>
    </div>
  </div>
</div>`;

            const style = document.createElement("style");
            style.textContent = `
#pac-avatar-cropper{position:fixed;inset:0;z-index:2147483647;font-family:Inter,Segoe UI,Arial,sans-serif;}
#pac-avatar-cropper .pac-avatar-crop-backdrop{min-height:100%;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.78);backdrop-filter:blur(10px);padding:18px;}
#pac-avatar-cropper .pac-avatar-crop-panel{width:min(390px,94vw);background:#050505;border:1px solid rgba(255,199,44,.34);border-radius:16px;box-shadow:0 22px 70px rgba(0,0,0,.68);padding:14px;}
#pac-avatar-cropper .pac-avatar-crop-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:12px;}
#pac-avatar-cropper .pac-avatar-crop-title{color:#FFC72C;font-size:13px;font-weight:950;text-transform:uppercase;letter-spacing:.08em;}
#pac-avatar-cropper .pac-avatar-crop-sub{color:rgba(255,255,255,.62);font-size:12px;margin-top:3px;}
#pac-avatar-cropper .pac-avatar-crop-close{border:0;background:none;color:#FFC72C;font-size:24px;line-height:1;cursor:pointer;}
#pac-avatar-cropper .pac-avatar-crop-canvas{width:100%;aspect-ratio:1/1;display:block;border-radius:14px;background:#111;touch-action:none;cursor:grab;}
#pac-avatar-cropper .pac-avatar-crop-canvas:active{cursor:grabbing;}
#pac-avatar-cropper .pac-avatar-crop-controls{display:grid;gap:12px;margin-top:12px;}
#pac-avatar-cropper .pac-avatar-crop-zoom{width:100%;accent-color:#FFC72C;}
#pac-avatar-cropper .pac-avatar-crop-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
#pac-avatar-cropper button{border-radius:10px;padding:11px 12px;font-weight:900;cursor:pointer;}
#pac-avatar-cropper .pac-avatar-crop-cancel{background:#111;border:1px solid rgba(255,255,255,.18);color:#ddd;}
#pac-avatar-cropper .pac-avatar-crop-save{background:#FFC72C;border:1px solid #FFC72C;color:#000;}`;
            modal.appendChild(style);
            document.body.appendChild(modal);

            const canvas = modal.querySelector(".pac-avatar-crop-canvas");
            const ctx = canvas.getContext("2d");
            const zoomInput = modal.querySelector(".pac-avatar-crop-zoom");
            const cancelBtn = modal.querySelector(".pac-avatar-crop-cancel");
            const closeBtn = modal.querySelector(".pac-avatar-crop-close");
            const saveBtn = modal.querySelector(".pac-avatar-crop-save");

            const baseScale = Math.max(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight);
            let zoom = 1;
            let offsetX = 0;
            let offsetY = 0;
            let dragging = false;
            let lastX = 0;
            let lastY = 0;

            function clampOffsets() {
                const scale = baseScale * zoom;
                const w = img.naturalWidth * scale;
                const h = img.naturalHeight * scale;
                const maxX = Math.max(0, (w - canvas.width) / 2);
                const maxY = Math.max(0, (h - canvas.height) / 2);
                offsetX = Math.max(-maxX, Math.min(maxX, offsetX));
                offsetY = Math.max(-maxY, Math.min(maxY, offsetY));
            }

            function draw() {
                clampOffsets();
                const scale = baseScale * zoom;
                const w = img.naturalWidth * scale;
                const h = img.naturalHeight * scale;
                const x = (canvas.width - w) / 2 + offsetX;
                const y = (canvas.height - h) / 2 + offsetY;

                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = "#050505";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, x, y, w, h);

                ctx.save();
                ctx.fillStyle = "rgba(0,0,0,.42)";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.globalCompositeOperation = "destination-out";
                ctx.beginPath();
                ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width * 0.39, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();

                ctx.strokeStyle = "rgba(255,199,44,.95)";
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width * 0.39, 0, Math.PI * 2);
                ctx.stroke();
            }

            function finish(value) {
                modal.remove();
                resolve(value);
            }

            zoomInput.addEventListener("input", () => {
                zoom = Number(zoomInput.value) || 1;
                draw();
            });
            canvas.addEventListener("pointerdown", (ev) => {
                dragging = true;
                lastX = ev.clientX;
                lastY = ev.clientY;
                canvas.setPointerCapture(ev.pointerId);
            });
            canvas.addEventListener("pointermove", (ev) => {
                if (!dragging) return;
                const rect = canvas.getBoundingClientRect();
                const px = canvas.width / Math.max(1, rect.width);
                const py = canvas.height / Math.max(1, rect.height);
                offsetX += (ev.clientX - lastX) * px;
                offsetY += (ev.clientY - lastY) * py;
                lastX = ev.clientX;
                lastY = ev.clientY;
                draw();
            });
            canvas.addEventListener("pointerup", () => { dragging = false; });
            canvas.addEventListener("pointercancel", () => { dragging = false; });
            cancelBtn.addEventListener("click", () => finish(null));
            closeBtn.addEventListener("click", () => finish(null));
            saveBtn.addEventListener("click", () => {
                const out = document.createElement("canvas");
                out.width = 320;
                out.height = 320;
                const outCtx = out.getContext("2d");
                const scale = baseScale * zoom;
                const w = img.naturalWidth * scale;
                const h = img.naturalHeight * scale;
                const x = (out.width - w) / 2 + offsetX;
                const y = (out.height - h) / 2 + offsetY;
                outCtx.fillStyle = "#050505";
                outCtx.fillRect(0, 0, out.width, out.height);
                outCtx.drawImage(img, x, y, w, h);
                finish(canvasToSafeAvatarDataUrl(out));
            });

            draw();
        } catch (err) {
            reject(err);
        }
    });
}

function updateAvatarUi(photoURL) {
    document.querySelectorAll('#profile-img-preview, .user-avatar, .user-sidebar-profile img, #user-avatar, #profile-avatar, .avatar-img')
        .forEach((img) => {
            if (img) img.src = photoURL;
        });
}

function applyStoredAvatarForCurrentUser() {
    try {
        const uid = auth?.currentUser?.uid || "";
        const photoURL = uid ? getStoredAvatarForUid(uid) : "";
        if (photoURL) updateAvatarUi(photoURL);
    } catch {}
}

async function applyPersistentAvatarForCurrentUser() {
    try {
        const user = auth?.currentUser;
        if (!user?.uid) return;
        const cached = getStoredAvatarForUid(user.uid);
        if (cached) {
            updateAvatarUi(cached);
            return;
        }
        let photoURL = "";
        try {
            const me = await getMeDataCached();
            photoURL = String(me?.photoURL || "").trim();
        } catch {}
        photoURL = photoURL || await getPublicAvatarForUid(user.uid) || String(user.photoURL || "").trim();
        if (photoURL) {
            setStoredAvatarForUid(user.uid, photoURL);
            updateAvatarUi(photoURL);
        }
    } catch {}
}

document.addEventListener("DOMContentLoaded", () => {
    setTimeout(applyStoredAvatarForCurrentUser, 0);
    setTimeout(applyPersistentAvatarForCurrentUser, 350);
    setTimeout(applyPersistentAvatarForCurrentUser, 1200);
});

async function saveAvatarFallbackToFirestore(user, photoURL) {
    const displayName = String(getProfileUiCache().name || user.displayName || (user.email ? user.email.split("@")[0] : "Athlete")).trim();
    let savedSomewhere = false;

    try {
        await db.collection('public_profiles').doc(user.uid).set({
            uid: user.uid,
            displayName,
            photoURL,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        savedSomewhere = true;
    } catch (publicProfileErr) {
        console.warn("Public profile avatar update failed:", publicProfileErr?.message || publicProfileErr);
    }

    try {
        await db.collection('users').doc(user.uid).set({
            uid: user.uid,
            photoURL,
            avatarUpdatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        savedSomewhere = true;
    } catch (userProfileErr) {
        console.warn("Users profile avatar update skipped:", userProfileErr?.message || userProfileErr);
    }

    if (!savedSomewhere) {
        throw new Error("Avatar could not be saved to Firestore. Check public_profiles write rules.");
    }
}

document.addEventListener('change', async (e) => {
    if (e.target.id !== 'avatar-input') return;

    const file = e.target.files[0];
    if (!file) return;

    const user = auth.currentUser;
    if (!user) return;
    const copy = getCabI18n();

    if (!String(file.type || "").startsWith("image/")) {
        alert(copy.avatarNoImage);
        e.target.value = "";
        return;
    }

    if (file.size > 25 * 1024 * 1024) {
        alert(copy.avatarTooLarge);
        e.target.value = "";
        return;
    }

    try {
        const croppedDataUrl = await showAvatarCropper(file, copy);
        if (!croppedDataUrl) {
            e.target.value = "";
            return;
        }
        updateAvatarUi(croppedDataUrl);

        let photoURL = "";
        const storage = getAvatarStorage();
        if (!storage) {
            throw new Error("Firebase Storage is unavailable; avatar was not saved.");
        }
        const avatarBlob = dataUrlToBlob(croppedDataUrl);
        const storageRef = storage.ref().child(`avatars/${user.uid}/profile.jpg`);
        await storageRef.put(avatarBlob, {
            contentType: "image/jpeg",
            customMetadata: { owner: user.uid }
        });
        photoURL = await storageRef.getDownloadURL();

        try { await user.updateProfile({ photoURL }); } catch (profileErr) {
            console.warn("Auth profile photo update skipped:", profileErr?.message || profileErr);
        }
        await saveAvatarFallbackToFirestore(user, photoURL);
        // keep cache fresh
        const updatedMe = { ...(__meCache.data || {}), uid: user.uid, photoURL };
        setMeCache(user.uid, updatedMe);
        setMeDocCache(user.uid, { exists: true, data: () => updatedMe });
        setProfileUiCache(getProfileUiCache().name, photoURL);
        setStoredAvatarForUid(user.uid, photoURL);

        // Оновлюємо UI
        updateAvatarUi(photoURL);
        const status = document.getElementById('profile-save-status');
        if (status) {
            status.innerText = copy.avatarUpdated;
            status.style.color = "#7CFF9B";
            status.style.display = "block";
        }

    } catch (err) {
        console.error("Avatar upload error:", err);
        const message = err?.message ? `\n${err.message}` : "";
        alert(copy.avatarUploadError + message);
    } finally {
        e.target.value = "";
    }
});






// JSON Export: за період (false) або за весь час (true)
// ==============================================
// UNIVERSAL EXPORT: finds real data across pages
// ==============================================

// Timestamp/Date normalize
function normalizeFirestoreValue(value) {
  if (value == null) return value;
  if (typeof value === "object" && typeof value.toDate === "function") return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(normalizeFirestoreValue);
  if (typeof value === "object") {
    const out = {};
    for (const k in value) out[k] = normalizeFirestoreValue(value[k]);
    return out;
  }
  return value;
}

function downloadJSON(dataObj, filename) {
  const blob = new Blob([JSON.stringify(dataObj, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// safe: snapshot -> array
async function snapToArraySafe(promiseSnap, label) {
  try {
    const snap = await promiseSnap;
    return snap.docs.map(d => ({ id: d.id, ...normalizeFirestoreValue(d.data()) }));
  } catch (e) {
    console.warn("SKIP:", label, e?.message || e);
    return [];
  }
}

// tries top-level collection with possible owner fields
async function fetchTopLevelByOwner(colName, uid) {
  const ownerFields = ["userId", "uid", "ownerId"];
  const out = [];

  // try with where (best)
  for (const f of ownerFields) {
    const arr = await snapToArraySafe(
      db.collection(colName).where(f, "==", uid).get(),
      `${colName} where ${f}`
    );
    if (arr.length) out.push(...arr);
  }

  // if nothing found, as last resort: try doc(uid)
  if (!out.length) {
    const docArr = await (async () => {
      try {
        const doc = await db.collection(colName).doc(uid).get();
        if (!doc.exists) return [];
        return [{ id: doc.id, ...normalizeFirestoreValue(doc.data()) }];
      } catch {
        return [];
      }
    })();
    if (docArr.length) out.push(...docArr);
  }

  // de-dup by id
  const map = new Map();
  out.forEach(x => map.set(x.id, x));
  return [...map.values()];
}

// tries users/{uid}/subcollection with multiple possible names
async function fetchUserSubcollections(uid, names) {
  const result = {};
  for (const name of names) {
    result[name] = await snapToArraySafe(
      db.collection("users").doc(uid).collection(name).get(),
      `users/${uid}/${name}`
    );
  }
  return result;
}

// main collector (ALL TIME)
async function collectAllUserDataAllTime(targetUid) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  // if you want "admin export other user": set window.exportUid = "...."
  const uid = targetUid || window.exportUid || user.uid;

  // profile
  const profileDoc = await db.collection("users").doc(uid).get();
  const profile = profileDoc.exists ? normalizeFirestoreValue(profileDoc.data()) : {};

  // Candidate collections (top-level) used by your pages
  const topCollections = [
    "wellness_reports",
    "injuries",
    "load_season_reports",
    "weight_history",
    "weekly_plans",
    "athlete_reports",
    "trainings",
    "metrics"
  ];

  // Candidate subcollections under users/{uid}
  const subNames = [
    "wellness",
    "injuries",
    "injury",
    "load_season_reports",
    "load_season",
    "weight_history",
    "weight",
    "weekly_plans",
    "weekly",
    "athlete_reports",
    "daily",
    "trainings",
    "metrics"
  ];

  // fetch
  const top = {};
  for (const col of topCollections) {
    top[col] = await fetchTopLevelByOwner(col, uid);
  }

  const subs = await fetchUserSubcollections(uid, subNames);

  // athlete_plans usually doc(uid)
  const athletePlan = await (async () => {
    try {
      const d = await db.collection("athlete_plans").doc(uid).get();
      return d.exists ? normalizeFirestoreValue(d.data()) : null;
    } catch {
      return null;
    }
  })();

  // Build a clean export
  const exportData = {
    meta: {
      exportedAt: new Date().toISOString(),
      uid,
      email: (uid === user.uid ? user.email : null),
      by: user.uid
    },
    firestore: {
      users_doc: profile,
      athlete_plans: athletePlan,
      top_level: top,
      user_subcollections: subs
    }
  };

  // IMPORTANT: show real counts (so you SEE what exists)

  return exportData;
}

// button: JSON export
async function exportAllUserData() {
  try {
    const data = await collectAllUserDataAllTime();
    downloadJSON(data, `PAC_GDPR_EXPORT_${data.meta.uid}.json`);
    alert("✅ JSON експорт готовий. Дивись файл + console counts (F12).");
  } catch (e) {
    console.error(e);
    alert("❌ Експорт не вийшов. Відкрий Console (F12) і скинь помилку.");
  }
}
function enterReportMode() {
  document.body.classList.add("report-mode");
}
function exitReportMode() {
  document.body.classList.remove("report-mode");
}
async function generateDashboardPDF(filename = "PAC_Wellness_Report.pdf") {
  if (!window.html2canvas || !window.jspdf) {
    alert("PDF libraries not loaded");
    return;
  }

  const { jsPDF } = window.jspdf;
  const root = document.querySelector(".wellness-report-root");
  if (!root) {
    alert("Report root not found");
    return;
  }

  // 👉 Вмикаємо report mode
  document.body.classList.add("report-mode");

  // Дати час DOM оновитись
  await new Promise(r => setTimeout(r, 300));

  const canvas = await html2canvas(root, {
    scale: 2,
    backgroundColor: "#000",
    useCORS: true
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = pageWidth;
  const imgHeight = canvas.height * imgWidth / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position -= pageHeight;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save(filename);

  // 👉 Повертаємо UI
  document.body.classList.remove("report-mode");
}
// ==============================================
// PREMIUM NOTIFICATION BELL
// ==============================================
function injectBellButton() {
  if (document.getElementById("mail-button")) return;

  const header = document.querySelector("header");
  if (!header) return;

  const btn = document.createElement("button");
  btn.id = "mail-button";
  btn.type = "button";
  btn.title = "Messages";
  btn.setAttribute("aria-label", "Messages");

  btn.innerHTML = `
  <svg class="bell-icon" viewBox="0 0 24 24" width="40" height="40">
    <path d="M18 16v-5a6 6 0 10-12 0v5"></path>
    <path d="M5 16h14"></path>
    <path d="M10 19a2 2 0 004 0"></path>
  </svg>
  <span class="bell-badge" style="display:none;">0</span>
`;


  header.appendChild(btn);
}

document.addEventListener("DOMContentLoaded", injectBellButton);

function injectGlobalLanguageSwitcher() {
  const header = document.querySelector("header");
  if (!header) return;

  const SUPPORTED_LANGS = ["uk", "en", "de", "es", "ru", "pt"];
  const normalizeLang = (raw) => {
    const v = String(raw || "").toLowerCase().trim();
    if (v === "ua") return "uk";
    return SUPPORTED_LANGS.includes(v) ? v : "";
  };
  const getCurrentLang = () => normalizeLang(localStorage.getItem("pac_lang")) || "uk";
  const loadingByLang = {
    uk: "Завантаження...",
    en: "Loading...",
    de: "Lädt...",
    es: "Cargando...",
    ru: "Загрузка...",
    pt: "Carregando..."
  };
  const placeholderRe = /^(?:loading|завантаження|загрузка|lädt|cargando|carregando)\s*\.{0,3}$/i;
  function primeUserNamePlaceholders(langCode) {
    const txt = loadingByLang[langCode] || loadingByLang.uk;
    const cached = getProfileUiCache();
    document.querySelectorAll('#user-name, .user-name-display').forEach((el) => {
      const raw = String(el?.textContent || "").trim();
      if (!raw || raw === "..." || placeholderRe.test(raw)) {
        el.textContent = cached.name || txt;
      }
    });
    if (cached.photo) {
      document.querySelectorAll(".user-avatar, .user-sidebar-profile img").forEach((img) => {
        if (img && (!img.src || /AK_logo\.png/i.test(String(img.src)))) {
          img.src = cached.photo;
        }
      });
    }
  }

  let select = document.getElementById("langSelect");
  if (!select) {
    select = document.createElement("select");
    select.id = "langSelect";
    select.setAttribute("aria-label", "Language selector");
    select.innerHTML =
      '<option value="uk">UA</option>' +
      '<option value="en">EN</option>' +
      '<option value="de">DE</option>' +
      '<option value="es">ES</option>' +
      '<option value="ru">RU</option>' +
      '<option value="pt">PT</option>';
    header.appendChild(select);
  }

  select.classList.add("pac-global-lang");

  const lang = getCurrentLang();
  if (select.value !== lang) select.value = lang;
  localStorage.setItem("pac_lang", lang);
  document.documentElement.lang = lang;
  primeUserNamePlaceholders(lang);

  if (!select.dataset.boundLang) {
    select.addEventListener("change", () => {
      const v = normalizeLang(select.value) || "uk";
      localStorage.setItem("pac_lang", v);
      document.documentElement.lang = v;
      primeUserNamePlaceholders(v);
      applyCabinetI18n();
      window.dispatchEvent(new CustomEvent("pac:lang-changed", { detail: { lang: v } }));
    });
    select.dataset.boundLang = "1";
  }
}

document.addEventListener("DOMContentLoaded", injectGlobalLanguageSwitcher);
window.addEventListener("pac:lang-changed", applyCabinetI18n);




// helpers
let _unreadMessages = 0;
let _unreadNotifs = 0;

function setTotalBellBadge() {
  const btn = document.getElementById("mail-button");
  const badge = btn?.querySelector(".bell-badge");
  if (!btn || !badge) return;

  const total = Math.max(0, (_unreadMessages || 0) + (_unreadNotifs || 0));

  if (total > 0) {
    badge.textContent = total > 99 ? "99+" : String(total);
    badge.style.display = "inline-flex";
    btn.classList.add("has-unread");
  } else {
    badge.style.display = "none";
    btn.classList.remove("has-unread");
  }
}

function setUnreadMessages(count) {
  _unreadMessages = Math.max(0, Number(count) || 0);
  setTotalBellBadge();
}

function setUnreadNotifs(count) {
  _unreadNotifs = Math.max(0, Number(count) || 0);
  setTotalBellBadge();
}



// =====================================================
// PAC Messages + Notifications (PROD CLEAN, Vanilla JS)
// Depends on globals: firebase, auth, db
// Collections:
// - public_profiles/{uid}
// - conversations/{cid}
// - conversations/{cid}/messages/{mid}
// - users/{uid}/notifications/{nid} + users/{uid}/notifMeta/main (optional)
// - global_notifications/{id} (optional)
// =====================================================
(function () {
  "use strict";

  // ---------- Guards ----------
  if (!window.firebase || !window.auth || !window.db) return;

  // ---------- Constants ----------
  const PAC = {
    UI: {
      bellId: "mail-button",
      modalId: "pacMsgModal",
    },
    limits: {
      conversationsListen: 50,
      inboxRender: 30,
      messagesListen: 40,
      notifsListen: 25,
    },
    profileFallbackName(userLike) {
      // userLike can be firebase user or a profile doc
      const email = userLike?.email || "";
      const local = email ? String(email).split("@")[0] : "";
      return local || "User";
    },
  };

  // ---------- State ----------
  const state = {
    me: null, // { uid, email, role, coachId }
    open: {
      convoId: null,
      otherUid: null,
      view: "inbox", // inbox | archive | thread | compose | notifs
    },
    cache: {
      publicProfiles: new Map(), // uid -> {displayName, role, photoURL}
      recipients: {
        coachAthletesByCoach: new Map(), // coachUid -> { atMs, uids[] }
        adminUsers: { atMs: 0, uids: [] },
      },
    },
    unsubs: {
      inbox: null,
      thread: null,
      notifsMeta: null,
      notifsPersonal: null,
      notifsGlobal: null,
    },
    counts: {
      unreadMessages: 0,
      unreadNotifs: 0,
    },
    inboxDocs: [], // raw conversations docs from listener
  };
  // =====================================================
// Single-tab leader for background listeners (inbox + notifMeta)
// =====================================================
const TAB_ID = `${Date.now()}_${Math.random().toString(16).slice(2)}`;
const LEADER_KEY = "PAC_RT_LEADER_V1";
const HEARTBEAT_MS = 5000;     // why: fast failover without being spammy
const STALE_MS = 12000;        // leader considered dead after ~12s

const bc = ("BroadcastChannel" in window) ? new BroadcastChannel("pac_rt_v1") : null;

function readLeader() {
  try { return JSON.parse(localStorage.getItem(LEADER_KEY) || "null"); } catch { return null; }
}
function writeLeader(obj) {
  try { localStorage.setItem(LEADER_KEY, JSON.stringify(obj)); } catch {}
}
function isLeaderAlive(l) {
  return l && l.id && (Date.now() - (l.ts || 0) < STALE_MS);
}
function iAmLeader() {
  const l = readLeader();
  return !!(l && l.id === TAB_ID && isLeaderAlive(l));
}

function claimLeadership() {
  const cur = readLeader();
  if (isLeaderAlive(cur) && cur.id !== TAB_ID) return false;

  writeLeader({ id: TAB_ID, ts: Date.now() });
  return true;
}

function heartbeat() {
  if (!iAmLeader()) return;
  writeLeader({ id: TAB_ID, ts: Date.now() });
}

let _hbTimer = null;
// bfcache cleanup: stop heartbeat + close broadcast channel
window.addEventListener("pagehide", () => {
  try { if (_hbTimer) { clearInterval(_hbTimer); _hbTimer = null; } } catch {}
  try { bc?.close?.(); } catch {}
  // stop own listeners too (safety)
  stopUnsub("inbox");
  stopUnsub("thread");
  stopUnsub("notifsMeta");
  stopNotifsLists();
}, { capture: true });

function startLeaderLoop() {
  if (_hbTimer) return;
  _hbTimer = setInterval(() => {
    const cur = readLeader();
    if (!isLeaderAlive(cur)) {
      // nobody active -> try become leader
      claimLeadership();
    }

    // if I am leader -> keep alive, ensure listeners started
    if (iAmLeader()) {
      heartbeat();
      ensureBackgroundListenersRunning();
    } else {
      // follower -> ensure listeners are stopped
      stopBackgroundListeners();
    }
  }, HEARTBEAT_MS);
}

function postCounts() {
  const payload = {
    t: "counts",
    unreadMessages: state.counts.unreadMessages || 0,
    unreadNotifs: state.counts.unreadNotifs || 0,
    from: TAB_ID,
    ts: Date.now()
  };
  try { bc?.postMessage(payload); } catch {}
  try { localStorage.setItem("PAC_RT_COUNTS_V1", JSON.stringify(payload)); } catch {}
}

// Follower receives counts and updates badge without listeners
function onCounts(payload) {
  if (!payload) return;
  if (payload.from === TAB_ID) return; // ignore own
  state.counts.unreadMessages = Number(payload.unreadMessages || 0);
  state.counts.unreadNotifs = Number(payload.unreadNotifs || 0);
  updateBell();
}

// BroadcastChannel path
if (bc) {
  bc.onmessage = (ev) => {
    const msg = ev?.data;
    if (msg?.t === "counts") onCounts(msg);
  };
}

// storage fallback path (also reacts when leader changes)
window.addEventListener("storage", (e) => {
  if (e.key === "PAC_RT_COUNTS_V1" && e.newValue) {
    try { onCounts(JSON.parse(e.newValue)); } catch {}
  }
  if (e.key === LEADER_KEY) {
    // leader changed -> next loop tick will start/stop listeners
  }
});

// Background listeners start/stop (leader only)
function ensureBackgroundListenersRunning() {
  // start only if not already running
  if (!state.unsubs.inbox) subscribeConversations();
  if (!state.unsubs.notifsMeta) startNotifs();
}

function stopBackgroundListeners() {
  // Followers must not keep background listeners
  stopUnsub("inbox");
  stopUnsub("notifsMeta");
  // Lists remain on-demand (Notifs tab), but only if modal open you already control them
}

  // =====================================================
  // Utils
  // =====================================================
  function $(id) { return document.getElementById(id); }

  function esc(s) {
    return String(s ?? "").replace(/[&<>"']/g, (m) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[m]));
  }

  function safeMillis(ts) {
    if (!ts) return 0;
    try {
      if (typeof ts === "number") return ts;
      if (ts.toMillis) return ts.toMillis();
      if (ts.toDate) return ts.toDate().getTime();
      return new Date(ts).getTime() || 0;
    } catch { return 0; }
  }
function nowClientTs() {
  return firebase.firestore.Timestamp.now();
}
  function nowServerTs() {
    return firebase.firestore.FieldValue.serverTimestamp();
  }

  function stopUnsub(key) {
  const fn = state.unsubs[key];
  try {
    if (typeof fn === "function") {
      pacUnregisterUnsub(fn);
      fn();
    }
  } catch {}
  state.unsubs[key] = null;
}

  function setBellBadge(total) {
    const btn = $(PAC.UI.bellId);
    const badge = btn?.querySelector?.(".bell-badge");
    if (!btn || !badge) return;

    const n = Math.max(0, Number(total) || 0);
    if (n > 0) {
      badge.textContent = n > 99 ? "99+" : String(n);
      badge.style.display = "inline-flex";
      btn.classList.add("has-unread");
    } else {
      badge.style.display = "none";
      btn.classList.remove("has-unread");
    }
  }

  function updateBell() {
    setBellBadge((state.counts.unreadMessages || 0) + (state.counts.unreadNotifs || 0));
  }

  function convoIdFor(a, b) {
    const [x, y] = [String(a || ""), String(b || "")].sort();
    return `chat_${x}_${y}`;
  }

  function otherUidFromParticipants(participants, myUid) {
    return (participants || []).find((x) => x && x !== myUid) || null;
  }

  // =====================================================
  // public_profiles (NEVER depends on users/{uid} for others)
  // =====================================================
  async function getPublicProfile(uid) {
    if (!uid) return null;
    if (state.cache.publicProfiles.has(uid)) return state.cache.publicProfiles.get(uid);

    try {
      const snap = await db.collection("public_profiles").doc(uid).get();
      const data = snap.exists ? (snap.data() || {}) : {};
      const profile = {
        displayName: (data.displayName || "").trim(),
        role: (data.role || "").trim(),
        photoURL: (data.photoURL || "").trim(),
        email: (data.email || "").trim(), // optional if you store it
      };
      state.cache.publicProfiles.set(uid, profile);
      return profile;
    } catch {
      const profile = { displayName: "", role: "", photoURL: "", email: "" };
      state.cache.publicProfiles.set(uid, profile);
      return profile;
    }
  }

  function pickDisplayName({ convo, uid }) {
    // Priority:
    // 1) participantsMeta in conversation
    // 2) cached public_profiles
    // 3) fallback "User"
    const metaName = convo?.participantsMeta?.[uid]?.name;
    if (metaName && String(metaName).trim()) return String(metaName).trim();

    const cached = state.cache.publicProfiles.get(uid);
    if (cached?.displayName) return cached.displayName;

    // fallback to uid-short
    return "User";
  }

  async function ensureMyPublicProfile(firebaseUser) {
    // Called for current user only
    if (!firebaseUser?.uid) return;

    // We can safely use whatever your app already knows about "me".
    // Try to build a stable displayName:
    const meName =
      (window.document?.querySelector?.("#user-name")?.innerText || "").trim() ||
      (firebaseUser.displayName || "").trim() ||
      PAC.profileFallbackName(firebaseUser);

    // Role: prefer already loaded state.me.role, else default athlete
    const role = (state.me?.role || "athlete").toLowerCase();
    let photoURL = "";
    try {
      const me = await getMeDataCached();
      photoURL = String(me?.photoURL || "").trim();
    } catch {}
    photoURL = photoURL || getStoredAvatarForUid(firebaseUser.uid) || String(firebaseUser.photoURL || "").trim();

    try {
      const patch = {
        displayName: meName,
        role,
        updatedAt: nowServerTs()
      };
      if (photoURL) patch.photoURL = photoURL;

      await db.collection("public_profiles").doc(firebaseUser.uid).set(patch, { merge: true });

      // update cache
      state.cache.publicProfiles.set(firebaseUser.uid, { displayName: meName, role, photoURL });
      if (photoURL) {
        setStoredAvatarForUid(firebaseUser.uid, photoURL);
        setProfileUiCache(meName, photoURL);
        updateAvatarUi(photoURL);
      }
    } catch (e) {
      // Do not break UI if denied
      console.warn("ensureMyPublicProfile denied:", e?.message || e);
    }
  }

  // =====================================================
  // Minimal "me" loader (can read users/{myUid}, allowed by rules)
  // =====================================================
  async function loadMe(firebaseUser) {
    const uid = firebaseUser?.uid;
    if (!uid) return null;

    let role = "athlete";
    let coachId = null;

      try {
    const data = await getMeDataCached(); // uses cache first, falls back to 1 get()
    role = (data?.role || "athlete").toLowerCase();
    if (role === "trainer") role = "coach";
    coachId = data?.coachId || null;
  } catch (e) {
    console.warn("loadMe users/{uid} denied:", e?.message || e);
  }

    return {
      uid,
      email: firebaseUser.email || null,
      role,
      coachId,
    };
  }

  // =====================================================
  // Modal UI (Inbox / Archive / Thread / Compose / Notifs)
  // =====================================================
  function ensureBellButton() {
    // You already inject bell in your file; this is safe fallback
    if ($(PAC.UI.bellId)) return;

    const header = document.querySelector("header");
    if (!header) return;

    const btn = document.createElement("button");
    btn.id = PAC.UI.bellId;
    btn.type = "button";
    btn.title = "Messages";
    btn.setAttribute("aria-label", "Messages");
    btn.innerHTML = `
      <svg class="bell-icon" viewBox="0 0 24 24" width="40" height="40">
        <path d="M18 16v-5a6 6 0 10-12 0v5"></path>
        <path d="M5 16h14"></path>
        <path d="M10 19a2 2 0 004 0"></path>
      </svg>
      <span class="bell-badge" style="display:none;">0</span>
    `;
    header.appendChild(btn);
  }

  function ensureModal() {
    if ($(PAC.UI.modalId)) return;

    const html = `
<div id="${PAC.UI.modalId}" style="
  position:fixed;inset:0;z-index:2200;display:none;
  background:rgba(0,0,0,.55);backdrop-filter:blur(10px);">

  <div style="
    width:min(560px,92vw);max-height:80vh;margin:8vh auto 0;
    border-radius:18px;border:1px solid rgba(255,199,44,.28);
    background:rgba(0,0,0,.62);
    box-shadow:0 18px 60px rgba(0,0,0,.55);overflow:hidden;">

    <div style="display:flex;align-items:center;justify-content:space-between;
      padding:12px 14px;border-bottom:1px solid rgba(255,255,255,.08);">
      <div style="color:#FFC72C;font-weight:950;letter-spacing:.08em;text-transform:uppercase;font-size:12px;">
        Messages
      </div>
      <button id="pacMsgClose" type="button"
        style="background:none;border:0;color:#FFC72C;font-size:20px;cursor:pointer;">×</button>
    </div>

    <div style="display:flex;gap:8px;padding:10px 14px;border-bottom:1px solid rgba(255,255,255,.08);">
      <button id="pacTabInbox" type="button" style="flex:1;padding:10px;border-radius:12px;
        border:1px solid rgba(255,199,44,.35);background:rgba(255,199,44,.12);
        color:#fff;font-weight:900;font-size:12px;">Inbox</button>

      <button id="pacTabArchive" type="button" style="flex:1;padding:10px;border-radius:12px;
        border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.05);
        color:#fff;font-weight:900;font-size:12px;">Archive</button>

      <button id="pacTabCompose" type="button" style="flex:1;padding:10px;border-radius:12px;
        border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.05);
        color:#fff;font-weight:900;font-size:12px;">Compose</button>

      <button id="pacTabNotifs" type="button" style="flex:1;padding:10px;border-radius:12px;
        border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.05);
        color:#fff;font-weight:900;font-size:12px;">Notifs</button>
    </div>

    <div style="padding:12px 14px;">
      <div id="pacViewInbox" style="display:block;">
        <div id="pacInboxList" style="display:flex;flex-direction:column;gap:10px;max-height:48vh;overflow:auto;"></div>
      </div>

      <div id="pacViewArchive" style="display:none;">
        <div id="pacArchiveList" style="display:flex;flex-direction:column;gap:10px;max-height:48vh;overflow:auto;"></div>
      </div>

      <div id="pacViewThread" style="display:none;">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;">
          <button id="pacBackToList" type="button" style="
            padding:8px 10px;border-radius:12px;border:1px solid rgba(255,255,255,.12);
            background:rgba(255,255,255,.05);color:#fff;font-weight:900;cursor:pointer;">← Back</button>
          <div id="pacThreadTitle" style="color:#fff;font-weight:950;font-size:13px;opacity:.95;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;"></div>
        </div>

        <div id="pacThreadList" style="margin-top:10px;max-height:42vh;overflow:auto;
          padding:10px;border-radius:12px;background:rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.08);">
          <div style="opacity:.55;font-size:12px;">No messages</div>
        </div>

        <div style="display:flex;gap:10px;margin-top:10px;">
          <textarea id="pacThreadText" rows="2" placeholder="Write message…"
            style="flex:1;resize:none;background:#000;color:#fff;border:1px solid #333;border-radius:12px;padding:10px 12px;"></textarea>
          <button id="pacThreadSend" type="button"
            style="padding:10px 12px;border-radius:12px;border:1px solid #FFC72C;background:#FFC72C;color:#000;
              cursor:pointer;font-weight:950;">Send</button>
        </div>

        <div style="display:flex;gap:10px;margin-top:10px;">
  <button id="pacThreadArchive" type="button" style="flex:1;padding:10px;border-radius:12px;
    border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.05);
    color:#fff;font-weight:900;cursor:pointer;">Archive</button>
</div>

      </div>


      <div id="pacViewCompose" style="display:none;">
        <div style="display:flex;flex-direction:column;gap:10px;">
          <select id="pacToSelect" style="width:100%;background:rgba(0,0,0,.45);
            border:1px solid rgba(255,255,255,.12);color:#fff;border-radius:12px;padding:10px;"></select>
          <textarea id="pacComposeText" placeholder="Write message…"
            style="width:100%;min-height:110px;resize:none;background:rgba(0,0,0,.45);
              border:1px solid rgba(255,255,255,.12);color:#fff;border-radius:12px;padding:10px;"></textarea>
          <button id="pacComposeSend" type="button" style="
            width:100%;border-radius:14px;padding:11px;border:1px solid rgba(255,199,44,.35);
            background:rgba(255,199,44,.14);color:#fff;font-weight:950;cursor:pointer;">Send</button>
          <div id="pacComposeHint" style="font-size:11px;color:rgba(255,255,255,.55);"></div>
        </div>
      </div>

      <div id="pacViewNotifs" style="display:none;">
        <div id="pacNotifList" style="display:flex;flex-direction:column;gap:10px;max-height:48vh;overflow:auto;"></div>
        <button id="pacNotifsMarkRead" type="button" style="
          margin-top:10px;width:100%;border-radius:14px;padding:11px;
          border:1px solid rgba(255,199,44,.35);background:rgba(255,199,44,.10);
          color:#fff;font-weight:950;cursor:pointer;">Mark all read</button>
      </div>
    </div>
  </div>
</div>`;

    document.body.insertAdjacentHTML("beforeend", html);

    // close + backdrop
    $("pacMsgClose")?.addEventListener("click", closeModal);
    $(PAC.UI.modalId)?.addEventListener("click", (e) => {
      if (e.target && e.target.id === PAC.UI.modalId) closeModal();
    });

    // tabs
    $("pacTabInbox")?.addEventListener("click", () => switchView("inbox"));
    $("pacTabArchive")?.addEventListener("click", () => switchView("archive"));
    $("pacTabCompose")?.addEventListener("click", () => switchView("compose"));
    $("pacTabNotifs")?.addEventListener("click", () => switchView("notifs"));

    // thread actions
    $("pacBackToList")?.addEventListener("click", () => {
      stopUnsub("thread");
      state.open.convoId = null;
      state.open.otherUid = null;
      switchView("inbox");
    });

    $("pacThreadSend")?.addEventListener("click", sendThreadMessage);
    
    $("pacThreadArchive")?.addEventListener("click", toggleArchiveCurrentThread);


    // compose send
    $("pacComposeSend")?.addEventListener("click", sendComposeMessage);

    // notifs mark read
    $("pacNotifsMarkRead")?.addEventListener("click", markAllNotifsRead);

    // esc
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal();
    });
  }
async function toggleArchiveCurrentThread() {
  const uid = state.me?.uid;
  const cid = state.open.convoId;
  if (!uid || !cid) return;

  const cur = (state.inboxDocs || []).find(x => x?.id === cid) || null;
  const curArchived = cur?.archivedFor?.[uid] === true;

  await setArchived({ convoId: cid, archived: !curArchived });
}

  function highlightTab(active) {
    const tabs = [
      ["pacTabInbox", active === "inbox"],
      ["pacTabArchive", active === "archive"],
      ["pacTabCompose", active === "compose"],
      ["pacTabNotifs", active === "notifs"],
    ];
    tabs.forEach(([id, on]) => {
      const el = $(id);
      if (!el) return;
      el.style.borderColor = on ? "rgba(255,199,44,.35)" : "rgba(255,255,255,.12)";
      el.style.background = on ? "rgba(255,199,44,.12)" : "rgba(255,255,255,.05)";
    });
  }

  function switchView(view) {
    state.open.view = view;

    const vInbox = $("pacViewInbox");
    const vArchive = $("pacViewArchive");
    const vThread = $("pacViewThread");
    const vCompose = $("pacViewCompose");
    const vNotifs = $("pacViewNotifs");

    if (vInbox) vInbox.style.display = (view === "inbox") ? "block" : "none";
    if (vArchive) vArchive.style.display = (view === "archive") ? "block" : "none";
    if (vThread) vThread.style.display = (view === "thread") ? "block" : "none";
    if (vCompose) vCompose.style.display = (view === "compose") ? "block" : "none";
    if (vNotifs) vNotifs.style.display = (view === "notifs") ? "block" : "none";

    highlightTab(view);

    if (view === "compose") buildRecipients().catch(() => {});

// ✅ Notifs lists ONLY when tab is open
if (view === "notifs") {
  ensureNotifsListsLive();
  renderNotifs();
} else {
  // leaving notifs -> stop heavy listeners
  stopNotifsLists();
}

if (view === "inbox") renderInboxAndArchive();
if (view === "archive") renderInboxAndArchive();
  }

  function openModal(initialView) {
  ensureModal();
  const modal = $(PAC.UI.modalId);
  if (modal) modal.style.display = "block";

  // ✅ IMPORTANT: якщо модалка відкрита — ця вкладка повинна мати inbox listener
  if (!state.unsubs.inbox) subscribeConversations();

  // meta notifs теж можна тримати тут (дешево 1 doc)
    // ✅ meta listener тримає тільки leader (інші вкладки отримають counts через bc/storage)
  if (iAmLeader()) {
    if (!state.unsubs.notifsMeta) startNotifs();
  }

  switchView(initialView || "inbox");
}

  function closeModal() {
  const modal = $(PAC.UI.modalId);
  if (modal) modal.style.display = "none";

  stopUnsub("thread");
  stopNotifsLists();

  // ✅ якщо я НЕ leader — прибираю inbox/meta (бо фонові слухачі має тримати leader)
  if (!iAmLeader()) {
    stopUnsub("inbox");
    stopUnsub("notifsMeta");
  }
}

  // =====================================================
  // Conversations list + unread badge (one listener)
  // =====================================================
  function isHiddenForMe(convo) {
    const meUid = state.me?.uid;
    if (!meUid) return false;
    return convo?.hiddenFor?.[meUid] === true;
  }

  function isArchivedForMe(convo) {
    const meUid = state.me?.uid;
    if (!meUid) return false;
    return convo?.archivedFor?.[meUid] === true;
  }

  function computeUnreadForMe(convo) {
    const meUid = state.me?.uid;
    if (!meUid) return false;

    const lastMsgMs = safeMillis(convo?.lastMessageAt);
    const lastReadMs = safeMillis(convo?.lastReadAt?.[meUid]);
    const lastSenderId = convo?.lastSenderId;

    return !!(lastSenderId && lastSenderId !== meUid && lastMsgMs > lastReadMs);

  }

  async function enrichConvoForRender(convo) {
  const meUid = state.me?.uid;
  const otherUid = otherUidFromParticipants(convo.participants, meUid);
  if (!otherUid) return { ...convo, _otherUid: null, _otherName: "User" };

  // ✅ 1) If participantsMeta has name — DO NOT READ public_profiles
  const metaName = convo?.participantsMeta?.[otherUid]?.name;
  if (metaName && String(metaName).trim()) {
    return {
      ...convo,
      _otherUid: otherUid,
      _otherName: String(metaName).trim(),
      _unread: computeUnreadForMe(convo),
    };
  }

  // ✅ 2) Otherwise: use cache if exists
  const cached = state.cache.publicProfiles.get(otherUid);
  if (cached?.displayName) {
    return {
      ...convo,
      _otherUid: otherUid,
      _otherName: cached.displayName,
      _unread: computeUnreadForMe(convo),
    };
  }

  // ✅ 3) Only then read public_profiles (lazy)
  await getPublicProfile(otherUid);
  const otherName =
    state.cache.publicProfiles.get(otherUid)?.displayName ||
    "User";

  return {
    ...convo,
    _otherUid: otherUid,
    _otherName: otherName,
    _unread: computeUnreadForMe(convo),
  };
}

  function formatTime(ts) {
    const ms = safeMillis(ts);
    if (!ms) return "";
    try {
      const d = new Date(ms);
      return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch { return ""; }
  }

  function convoCardHTML(c) {
  const unread = c._unread;
  const archived = isArchivedForMe(c);

  const title = esc(c._otherName || "User");
  const lastText = esc(c.lastMessageText || "");
  const time = esc(formatTime(c.lastMessageAt));

  const archLabel = archived ? "Unarchive" : "Archive";

  return `
<div data-cid="${esc(c.id)}" data-other="${esc(c._otherUid || "")}" 
  style="padding:14px;border-radius:16px;
  border:1px solid rgba(255,255,255,.08);
  background:${unread ? "rgba(255,199,44,.08)" : "rgba(255,255,255,.03)"};
  cursor:pointer;">

  <div style="display:flex;justify-content:space-between;align-items:center;">
    <div style="min-width:0;">
      <div style="display:flex;align-items:center;gap:8px;">
        <div style="font-weight:900;font-size:13px;color:#fff;">
          ${title}
        </div>
        ${unread ? `
          <span style="font-size:10px;padding:3px 8px;border-radius:999px;
            border:1px solid rgba(255,199,44,.55);
            background:rgba(255,199,44,.15);
            color:#FFC72C;font-weight:900;">
            UNREAD
          </span>` : ``}
      </div>

      <div style="margin-top:6px;font-size:12px;color:rgba(255,255,255,.65);
        white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
        ${lastText}
      </div>
    </div>

    <div style="text-align:right;display:flex;flex-direction:column;align-items:flex-end;gap:6px;">
      <div style="font-size:11px;color:rgba(255,255,255,.45);">
        ${time}
      </div>
      <button data-act="archive"
        style="padding:6px 10px;border-radius:10px;
        border:1px solid rgba(255,255,255,.12);
        background:rgba(255,255,255,.05);
        color:#fff;font-weight:900;font-size:11px;cursor:pointer;">
        ${archLabel}
      </button>
    </div>
  </div>
</div>`;
}



  async function renderInboxAndArchive() {
    const hostInbox = $("pacInboxList");
    const hostArchive = $("pacArchiveList");
    if (!hostInbox || !hostArchive) return;

    // build render list from cached docs, enrich names
    const raw = state.inboxDocs || [];
    const enriched = [];
    for (const c of raw) enriched.push(await enrichConvoForRender(c));

    // filter out hidden always
    // filter out hidden ALWAYS
const visible = enriched.filter((c) => !isHiddenForMe(c));

const inbox = visible
  .filter((c) => !isArchivedForMe(c))
  .slice(0, PAC.limits.inboxRender);

const archive = visible
  .filter((c) => isArchivedForMe(c))
  .slice(0, PAC.limits.inboxRender);


    hostInbox.innerHTML = inbox.length
      ? inbox.map(convoCardHTML).join("")
      : `<div style="opacity:.6;font-size:12px;padding:10px;">No dialogs.</div>`;

    hostArchive.innerHTML = archive.length
      ? archive.map(convoCardHTML).join("")
      : `<div style="opacity:.6;font-size:12px;padding:10px;">No archived dialogs.</div>`;

    // delegate click handlers
    [hostInbox, hostArchive].forEach((host) => {
      host.querySelectorAll("[data-cid]").forEach((card) => {
        const cid = card.getAttribute("data-cid");
        const other = card.getAttribute("data-other");

        // action buttons
        card.querySelectorAll("button[data-act]").forEach((btn) => {
          btn.addEventListener("click", async (e) => {
            e.stopPropagation();
            const act = btn.getAttribute("data-act");
            if (act === "archive") {
  const cur = (state.inboxDocs || []).find(x => x?.id === cid) || null;
  const myUid = state.me?.uid;
  if (!myUid) return;

  const curArchived = cur?.archivedFor?.[myUid] === true;
  await setArchived({ convoId: cid, archived: !curArchived });
}



          });
        });

        // open thread
        card.addEventListener("click", async () => {
          if (!cid || !other) return;
          await openThread(cid, other);
        });
      });
    });
  }

  function subscribeConversations() {
    stopUnsub("inbox");

    const uid = state.me?.uid;
    if (!uid) return;

    const q = db.collection("conversations")
      .where("participants", "array-contains", uid)
      .orderBy("lastMessageAt", "desc")
      .limit(PAC.limits.conversationsListen);

    state.unsubs.inbox = pacRegisterUnsub(
  q.onSnapshot(async (snap) => {
      try {
        const docs = snap.docs.map((d) => ({ id: d.id, ...(d.data() || {}) }));
        state.inboxDocs = Array.isArray(docs) ? docs : Array.from(docs || []);
        if (state.open.view === "thread") refreshThreadActionLabels();


        // unread count for badge:
        // exclude hidden (so user doesn't get spam for hidden threads)
        let unread = 0;
for (const c of docs) {
  if (isHiddenForMe(c)) continue;
  if (computeUnreadForMe(c)) unread++;
}

        state.counts.unreadMessages = unread;
        updateBell();
        postCounts();

        // if modal open on inbox/archive -> rerender
        const modal = $(PAC.UI.modalId);
const isOpen = modal && modal.style.display === "block";

if (isOpen) {
  if (state.open.view === "inbox" || state.open.view === "archive") {
    await renderInboxAndArchive();
  } else if (state.open.view === "thread") {
    refreshThreadActionLabels();
  }
}

      } catch (e) {
        console.warn("subscribeConversations render error:", e?.message || e);
      }
        }, (err) => {
      console.error("subscribeConversations snapshot denied:", err?.message || err);
    })
);
  }

  async function markConvoRead(convoId) {
  const uid = state.me?.uid;
  if (!uid || !convoId) return;

  try {
    await db.collection("conversations").doc(convoId).update({
      [`lastReadAt.${uid}`]: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
  } catch (e) {
    console.warn("markConvoRead failed:", e?.message || e);
  }
}

  async function setArchived({ convoId, archived } = {}) {
  const uid = state.me?.uid;
  const cid = convoId || state.open.convoId;
  if (!uid || !cid) return;

  try {
    await db.collection("conversations").doc(cid).update({
  [`archivedFor.${uid}`]: !!archived,
  updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
});

// ✅ optimistic local update (instant UI)
try {
  const arr = Array.isArray(state.inboxDocs) ? state.inboxDocs : [];
  const idx = arr.findIndex(x => x?.id === cid);
  if (idx >= 0) {
    const cur = arr[idx] || {};
    const archivedFor = { ...(cur.archivedFor || {}) };
    archivedFor[uid] = !!archived;
    arr[idx] = { ...cur, archivedFor };
    state.inboxDocs = arr;
  }
} catch {}

// rerender now
if (state.open.view === "inbox" || state.open.view === "archive") {
  await renderInboxAndArchive();
}
refreshThreadActionLabels();
  } catch (e) {
    console.warn("setArchived denied:", e?.message || e);
    alert("Permission denied for Archive.");
  }
}



  // =====================================================
  // Thread (messages listener) + send
  // =====================================================
  function renderMessageBubble(meUid, m) {
    const mine = m.senderId === meUid;
    const text = esc(m.text || "");
    const ts = esc(formatTime(m.createdAt));
    return `
<div style="display:flex;justify-content:${mine ? "flex-end" : "flex-start"};margin:6px 0;">
  <div style="max-width:80%;padding:10px 12px;border-radius:14px;
    background:${mine ? "rgba(255,199,44,.18)" : "rgba(255,255,255,.08)"};
    border:1px solid rgba(255,255,255,.10);">
    <div style="font-size:12px;color:#fff;white-space:pre-wrap;word-break:break-word;">${text}</div>
    <div style="font-size:10px;opacity:.55;margin-top:6px;">${ts}</div>
  </div>
</div>`;
  }

  async function openThread(convoId, otherUid) {
    stopUnsub("thread");

    state.open.convoId = convoId;
    state.open.otherUid = otherUid;

    // title
    await getPublicProfile(otherUid);
    const title = state.cache.publicProfiles.get(otherUid)?.displayName || "User";
    const tEl = $("pacThreadTitle");
    if (tEl) tEl.textContent = title;

    switchView("thread");
    refreshThreadActionLabels();


    const host = $("pacThreadList");
    if (!host) return;

    // mark read immediately (best effort)
    await markConvoRead(convoId);
    // якщо діалог в архіві — при відкритті thread повернемо в inbox (unarchive)
try {
  const cur = (state.inboxDocs || []).find((x) => x?.id === convoId) || null;
  if (cur?.archivedFor?.[state.me.uid] === true) {
  await setArchived({ convoId, archived: false });
}

} catch {}


    // live messages
    const ref = db.collection("conversations").doc(convoId).collection("messages")
      .orderBy("createdAt", "desc")
      .limit(PAC.limits.messagesListen);

    state.unsubs.thread = pacRegisterUnsub(
  ref.onSnapshot((snap) => {
      try {
        if (snap.empty) {
          host.innerHTML = `<div style="opacity:.55;font-size:12px;">No messages</div>`;
          return;
        }
        const msgs = snap.docs.map((d) => (d.data() || {})).reverse();
        const meUid = state.me?.uid;
        host.innerHTML = msgs.map((m) => renderMessageBubble(meUid, m)).join("");
        host.scrollTop = host.scrollHeight;
      } catch (e) {
        console.warn("thread render error:", e?.message || e);
      }
        }, (err) => {
      console.error("thread snapshot denied:", err?.message || err);
    })
);
  }

  function refreshThreadActionLabels() {
  const uid = state.me?.uid;
  const cid = state.open.convoId;
  if (!uid || !cid) return;

  const cur = (state.inboxDocs || []).find((x) => x?.id === cid) || null;
  const curArchived = cur?.archivedFor?.[uid] === true;

  const btnArch = $("pacThreadArchive");
  if (btnArch) btnArch.textContent = curArchived ? "Unarchive" : "Archive";
}


  async function sendThreadMessage() {
  const uid = state.me?.uid;
  const cid = state.open.convoId;
  const otherUid = state.open.otherUid;
  const ta = $("pacThreadText");
  const text = (ta?.value || "").trim();

  if (!uid || !otherUid) return;
  if (!text) return;
  let targetCid = cid;

  // Ensure conversation exists before message write.
  try {
    targetCid = await ensureConversationWith(otherUid);
    if (targetCid && state.open.convoId !== targetCid) {
      state.open.convoId = targetCid;
    }
  } catch (e) {
    console.error("❌ DENY STEP0 ensureConversationWith", e);
    alert("STEP0 DENY");
    return;
  }


  // STEP 1 — MESSAGE
  try {
    await db.collection("conversations").doc(targetCid).collection("messages").add({
      senderId: uid,
      text,
      createdAt: firebase.firestore.Timestamp.now(), // або serverTimestamp якщо хочеш
    });
  } catch (e) {
    console.error("❌ DENY STEP1 messages.add", e);
    alert("STEP1 DENY");
    return;
  }

  // STEP 2 — ENSURE CONVO + SUMMARY UPDATE
  try {

    const convoRef = db.collection("conversations").doc(targetCid);

    await db.runTransaction(async (tx) => {
      const snap = await tx.get(convoRef);

      // якщо раптом нема діалогу — створюємо (щоб update не падав)
      if (!snap.exists) {
        tx.set(convoRef, {
          participants: [uid, otherUid],
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
      }

      // summary update
      tx.update(convoRef, {
        lastMessageAt: firebase.firestore.FieldValue.serverTimestamp(),
        lastMessageText: text,
        lastSenderId: uid,
        [`lastReadAt.${uid}`]: firebase.firestore.FieldValue.serverTimestamp(),
        [`archivedFor.${uid}`]: false,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
    });

    ta.value = "";
  } catch (e) {
    console.error("❌ DENY STEP2 txn/update", e);
    alert("STEP2 DENY");
  }
}

  // =====================================================
  // Compose (recipient selection) - stable + minimal reads
  // =====================================================
  const RECIPIENTS_TTL_MS = 60 * 1000;

  async function buildRecipients() {
    const sel = $("pacToSelect");
    const hint = $("pacComposeHint");
    if (!sel || !hint) return;

    sel.innerHTML = "";
    hint.textContent = "";

    const me = state.me;
    if (!me?.uid) return;

    // helper to append option with lazy name
    async function addRecipient(uid, fallbackLabel) {
      const p = await getPublicProfile(uid);
      const label = (p?.displayName || "").trim() || fallbackLabel || "User";
      const opt = document.createElement("option");
      opt.value = uid;
      opt.textContent = label;
      sel.appendChild(opt);
    }

    if (me.role === "athlete") {
      const coachId = me.coachId;
      if (!coachId) {
        sel.innerHTML = `<option value="">— coachId not set —</option>`;
        sel.disabled = true;
        hint.textContent = "Athlete: додай coachId у users/{uid}, щоб можна було писати тренеру.";
        return;
      }

      sel.disabled = true;
      await addRecipient(coachId, "Coach");
      hint.textContent = "Ти можеш писати тільки своєму тренеру.";
      return;
    }

    sel.disabled = false;

    if (me.role === "coach") {
      hint.textContent = "Coach: вибери атлета або admin.";

      // list my athletes (uids) from users (allowed by rules), but names come from public_profiles
      try {
        let athleteUids = [];
        const cacheItem = state.cache.recipients.coachAthletesByCoach.get(me.uid);
        const fresh = cacheItem && (Date.now() - cacheItem.atMs < RECIPIENTS_TTL_MS);

        if (fresh) {
          athleteUids = cacheItem.uids || [];
        } else {
          const snap = await db.collection("users").where("coachId", "==", me.uid).limit(200).get();
          athleteUids = snap.docs.map((d) => d.id).filter(Boolean);
          state.cache.recipients.coachAthletesByCoach.set(me.uid, { atMs: Date.now(), uids: athleteUids });
        }

        if (athleteUids.length) {
          const og = document.createElement("optgroup");
          og.label = "My athletes";
          sel.appendChild(og);

          for (const aUid of athleteUids) {
            const p = await getPublicProfile(aUid);
            const opt = document.createElement("option");
            opt.value = aUid;
            opt.textContent = (p?.displayName || "").trim() || ("Athlete " + aUid.slice(0, 6));
            og.appendChild(opt);
          }
        }
      } catch (e) {
        console.warn("coach recipients list denied:", e?.message || e);
      }

      // admins: MVP — if you have fixed admin uid/email, you can hardcode 1 admin uid
      // OR you can skip admins for coach if listing admins is restricted.
      // Recommended: store admin profile doc(s) in public_profiles and keep a config list.
      // For now: keep it optional.
      hint.textContent += " (Admin — optional via config)";

      if (!sel.value) sel.selectedIndex = 0;
      return;
    }

    // admin
    hint.textContent = "Admin: можеш писати будь-кому (list users allowed for admin).";
    try {
      let userUids = [];
      const cache = state.cache.recipients.adminUsers;
      const fresh = cache && (Date.now() - cache.atMs < RECIPIENTS_TTL_MS) && Array.isArray(cache.uids);

      if (fresh) {
        userUids = cache.uids;
      } else {
        const snap = await db.collection("users").limit(80).get();
        userUids = snap.docs.map((d) => d.id).filter(Boolean);
        state.cache.recipients.adminUsers = { atMs: Date.now(), uids: userUids };
      }

      for (const uid of userUids) {
        if (uid === me.uid) continue;
        await addRecipient(uid, "User " + uid.slice(0, 6));
      }
    } catch (e) {
      console.warn("admin recipients list denied:", e?.message || e);
      // Fallback #1: public_profiles list (readable for any signed-in user by rules)
      try {
        const snapProfiles = await db.collection("public_profiles").limit(200).get();
        const profileUids = snapProfiles.docs.map((d) => d.id).filter(Boolean);
        for (const uid of profileUids) {
          if (uid === me.uid) continue;
          await addRecipient(uid, "User " + uid.slice(0, 6));
        }
      } catch (e2) {
        console.warn("admin recipients fallback(public_profiles) denied:", e2?.message || e2);
      }

      // Fallback #2: users from existing conversations with me
      if (!sel.options.length) {
        try {
          const snapConvos = await db.collection("conversations")
            .where("participants", "array-contains", me.uid)
            .limit(120)
            .get();

          const convoUids = new Set();
          for (const d of snapConvos.docs) {
            const participants = Array.isArray(d.data()?.participants) ? d.data().participants : [];
            for (const p of participants) {
              if (p && p !== me.uid) convoUids.add(String(p));
            }
          }
          for (const uid of convoUids) {
            await addRecipient(uid, "User " + uid.slice(0, 6));
          }
        } catch (e3) {
          console.warn("admin recipients fallback(conversations) denied:", e3?.message || e3);
        }
      }

      if (!sel.options.length) {
        sel.innerHTML = `<option value="">— no recipients доступні —</option>`;
        sel.disabled = true;
        hint.textContent = "Admin: не вдалося завантажити список отримувачів. Перевір права Firestore.";
      }
    }
  }

  function isValidUid(x) {
  return typeof x === "string" && x.length >= 20 && x !== "null" && x !== "undefined";
}

async function ensureConversationWith(otherUid) {
  const meUid = state.me?.uid;
  if (!isValidUid(meUid) || !isValidUid(otherUid)) {
    throw new Error("Invalid UID: meUid/otherUid");
  }
  if (meUid === otherUid) {
    throw new Error("Cannot message yourself");
  }

  const cid = convoIdFor(meUid, otherUid);
  const convoRef = db.collection("conversations").doc(cid);

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(convoRef);

    // якщо нема — створюємо мінімально, щоб пройти create rules
    if (!snap.exists) {
      tx.set(convoRef, {
        participants: [meUid, otherUid],
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
    }
  });

  return cid;
}

async function sendComposeMessage() {
  const sel = $("pacToSelect");
  const ta = $("pacComposeText");
  const toUid = (sel?.value || "").trim();
  const text = (ta?.value || "").trim();

  if (!isValidUid(toUid)) {
    alert("❌ Recipient invalid (coachId is empty?). Перевір users/{athleteUid}.coachId");
    console.warn("COMPOSE invalid toUid:", toUid);
    return;
  }
  if (!text) return;

  // athlete restriction
  if (state.me?.role === "athlete") {
    const coachId = state.me?.coachId;
    if (!isValidUid(coachId)) {
      alert("❌ У тебе coachId = null. Додай coachId у users/{uid} (UID тренера).");
      return;
    }
    if (toUid !== coachId) {
      alert("Athlete може писати тільки своєму тренеру.");
      return;
    }
  }

  const btn = $("pacComposeSend");
  if (btn) btn.disabled = true;

  try {
    const cid = await ensureConversationWith(toUid);

    await db.collection("conversations").doc(cid).collection("messages").add({
      senderId: state.me.uid,
      text,
      createdAt: firebase.firestore.Timestamp.now(),
    });

    await db.collection("conversations").doc(cid).update({
      lastMessageAt: firebase.firestore.FieldValue.serverTimestamp(),
      lastMessageText: text,
      lastSenderId: state.me.uid,
      [`lastReadAt.${state.me.uid}`]: firebase.firestore.FieldValue.serverTimestamp(),
      [`archivedFor.${state.me.uid}`]: false,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    if (ta) ta.value = "";
    await openThread(cid, toUid);

  } catch (e) {
    console.error("❌ COMPOSE FAIL", e);
    alert("Send failed: " + (e?.message || e));
  } finally {
    if (btn) btn.disabled = false;
  }
}
  // =====================================================
  // Notifications (badge works even if modal closed)
  // =====================================================
  const notifs = {
    personal: [],
    global: [],
    meta: { lastGlobalReadAt: null, unreadCount: 0 },
  };

  const GLOBAL_NOTIFS_TTL_MS = 60 * 1000;
  let globalNotifsFetchedAt = 0;
  let globalNotifsInFlight = null;

  function renderNotifs() {
    const host = $("pacNotifList");
    if (!host) return;

    const lastGlobalReadMs = safeMillis(notifs.meta.lastGlobalReadAt);

    const items = [
      ...(notifs.personal || []).map((x) => ({ ...x, _scope: "PERSONAL" })),
      ...(notifs.global || []).map((x) => ({ ...x, _scope: "GLOBAL" })),
    ].sort((a, b) => safeMillis(b.notifyAt || b.createdAt) - safeMillis(a.notifyAt || a.createdAt));

    if (!items.length) {
      host.innerHTML = `<div style="opacity:.6;font-size:12px;padding:10px;">No notifications.</div>`;
      return;
    }

    host.innerHTML = items.slice(0, 30).map((n) => {
      const title = esc(n.title || n.type || "Notification");
      const text = esc(n.text || n.message || "");
      const unread = (n._scope === "PERSONAL")
        ? !n.readAt
        : (safeMillis(n.notifyAt || n.createdAt) > lastGlobalReadMs);

      return `
<div style="padding:12px;border-radius:14px;border:1px solid rgba(255,255,255,.10);
  background:${unread ? "rgba(255,199,44,.10)" : "rgba(255,255,255,.04)"};">
  <div style="display:flex;justify-content:space-between;gap:10px;">
    <div style="font-weight:950;font-size:12px;color:#fff;">${title}</div>
    <div style="opacity:.55;font-size:11px;">
  ${esc(n._scope)} • ${esc(formatTime(n.notifyAt || n.createdAt))}
</div>
  </div>
  ${text ? `<div style="margin-top:6px;opacity:.8;font-size:12px;">${text}</div>` : ``}
</div>`;
    }).join("");
  }

  function startNotifs() {
  // ALWAYS keep only META in background (cheap: 1 doc listener)
  stopUnsub("notifsMeta");
  // lists should NOT run in background
  stopUnsub("notifsPersonal");
  stopUnsub("notifsGlobal");

  const uid = state.me?.uid;
  if (!uid) return;

  const metaRef = db.collection("users").doc(uid).collection("notifMeta").doc("main");

  state.unsubs.notifsMeta = pacRegisterUnsub(
  metaRef.onSnapshot((doc) => {
    const d = doc.exists ? (doc.data() || {}) : {};
    notifs.meta.lastGlobalReadAt = d.lastGlobalReadAt || null;
    notifs.meta.unreadCount = Number(d.unreadCount || 0);

    // In background we only trust meta counts (no global list scanning)
    state.counts.unreadNotifs = notifs.meta.unreadCount || 0;
    updateBell();
    postCounts();

    const modal = $(PAC.UI.modalId);
    const isOpen = modal && modal.style.display === "block";
    if (isOpen && state.open.view === "notifs") renderNotifs();
    }, (err) => console.warn("notifs meta denied:", err?.message || err))
);
}

// On-demand lists (heavy): only when Notifs tab is open
// On-demand lists: PERSONAL can be live, GLOBAL should be one-time (avoid fan-out reads)
function ensureNotifsListsLive() {
  const uid = state.me?.uid;
  if (!uid) return;

  // ✅ PERSONAL можна live
  if (!state.unsubs.notifsPersonal) {
    const personalRef = db.collection("users").doc(uid).collection("notifications")
      .orderBy("createdAt", "desc").limit(PAC.limits.notifsListen);

    state.unsubs.notifsPersonal = pacRegisterUnsub(
      personalRef.onSnapshot((snap) => {
        notifs.personal = snap.docs.map(d => ({ id: d.id, ...(d.data() || {}) }));
        if (state.open.view === "notifs") renderNotifs();
      }, (err) => console.warn("notifs personal denied:", err?.message || err))
    );
  }

  // ❌ GLOBAL НЕ live
  // ✅ GLOBAL одноразово
  loadGlobalNotifsOnce({ force: false }).catch(() => {});
}

async function loadGlobalNotifsOnce({ force = false } = {}) {
  const isFresh = Date.now() - globalNotifsFetchedAt < GLOBAL_NOTIFS_TTL_MS;
  if (!force && isFresh && Array.isArray(notifs.global) && notifs.global.length) {
    if (state.open.view === "notifs") renderNotifs();
    return notifs.global;
  }
  if (!force && globalNotifsInFlight) return globalNotifsInFlight;

  globalNotifsInFlight = (async () => {
    let snap = null;

    try {
      snap = await db.collection("global_notifications")
        .orderBy("notifyAt", "desc")
        .limit(PAC.limits.notifsListen)
        .get();
    } catch (e) {
      // fallback (старі доки без notifyAt)
      snap = await db.collection("global_notifications")
        .orderBy("createdAt", "desc")
        .limit(PAC.limits.notifsListen)
        .get()
        .catch(() => null);
    }

    notifs.global = snap ? snap.docs.map(d => ({ id: d.id, ...(d.data() || {}) })) : [];
    globalNotifsFetchedAt = Date.now();
    if (state.open.view === "notifs") renderNotifs();
    return notifs.global;
  })();

  try {
    return await globalNotifsInFlight;
  } finally {
    globalNotifsInFlight = null;
  }
}
function stopNotifsLists() {
  stopUnsub("notifsPersonal");
  stopUnsub("notifsGlobal");
}

  async function markAllNotifsRead() {
    const uid = state.me?.uid;
    if (!uid) return;

    try {
      const metaRef = db.collection("users").doc(uid).collection("notifMeta").doc("main");
      await metaRef.set({
        unreadCount: 0,
        lastReadAt: nowServerTs(),
        lastGlobalReadAt: nowServerTs(),
      }, { merge: true });

      const listRef = db.collection("users").doc(uid).collection("notifications");
      const snap = await listRef.where("readAt", "==", null).limit(80).get().catch(() => null);
      if (snap && !snap.empty) {
        const batch = db.batch();
        snap.docs.forEach((d) => batch.set(d.ref, { readAt: nowServerTs() }, { merge: true }));
        await batch.commit().catch(() => {});
      }

      state.counts.unreadNotifs = 0;
      updateBell();
      renderNotifs();
    } catch (e) {
      console.warn("markAllNotifsRead denied:", e?.message || e);
    }
  }

  // =====================================================
  // Boot
  // =====================================================
  function wireBellClick() {
    document.addEventListener("click", (e) => {
      const btn = e.target?.closest?.("#" + PAC.UI.bellId);
      if (!btn) return;

      // if notifs unread > 0 -> open notifs, else inbox
      const initial = (state.counts.unreadNotifs > 0) ? "notifs" : "inbox";
      openModal(initial);
    });
  }

  // Start early (badge even if modal never opened)
  ensureBellButton();
  wireBellClick();

  auth.onAuthStateChanged(async (user) => {
    if (!user || user.isAnonymous) return;

    try {
      state.me = await loadMe(user);
      await ensureMyPublicProfile(user);

      // Live listeners
            // Start leader loop (single-tab background listeners)
      startLeaderLoop();

      // Try to become leader immediately on boot (best effort)
      claimLeadership();

      // Leader will start listeners inside ensureBackgroundListenersRunning()
      // Follower will receive counts via bc/storage and still show badge
      updateBell();
    } catch (e) {
      console.warn("PAC messages boot error:", e?.message || e);
    }
  });
window.PAC_DEBUG = {
  tabId: TAB_ID,
  getState() {
    return {
      me: state.me,
      view: state.open.view,
      convoId: state.open.convoId,
      leader: readLeader(),
      hasInboxListener: !!state.unsubs.inbox,
      hasNotifsMetaListener: !!state.unsubs.notifsMeta,
      hasThreadListener: !!state.unsubs.thread,
      counts: { ...state.counts },

      // ✅ РОЗДІЛЯЄМО
      inboxCount: Array.isArray(state.inboxDocs) ? state.inboxDocs.length : 0,
      inboxDocs: Array.isArray(state.inboxDocs) ? state.inboxDocs : [],

      iAmLeader: iAmLeader(),
      leaderAlive: isLeaderAlive(readLeader()),
      leaderRaw: readLeader(),
    };
  }
};
})();

// Normalize coach workspace URL: remove athlete-context params to avoid navigation traps
(function () {
  "use strict";

  const page = String(window.location.pathname.split("/").pop() || "").toLowerCase();
  if (!/^(coach-dashboard|coach-week-editor|coach-date-plan)\.html$/i.test(page)) return;

  const url = new URL(window.location.href);
  let changed = false;

  ["userId", "fromAdmin", "fromCoach"].forEach((key) => {
    if (!url.searchParams.has(key)) return;
    url.searchParams.delete(key);
    changed = true;
  });

  if (!changed) return;
  try {
    window.history.replaceState({}, "", page + url.search + (url.hash || ""));
  } catch {}
})();

// Quick return button to Dashboard (better flow from execution pages)
(function () {
  "use strict";

  function coachWorkspaceHref(qs) {
    const asAdmin = qs.get("asAdmin") === "1";
    const coachId = (qs.get("coachId") || "").trim();
    if (asAdmin && coachId) {
      return `coach-dashboard.html?asAdmin=1&coachId=${encodeURIComponent(coachId)}`;
    }
    return "coach-dashboard.html";
  }
  function defaultWorkspaceHref() {
    if (window.isAdmin) return "../admin.html";
    if (window.isCoach) return "coach-dashboard.html";
    return "dashboard_user.html";
  }

  function dashLabel() {
    const qs = new URLSearchParams(window.location.search);
    if (qs.get("fromAdmin") === "1") return "← Back to Admin";
    if (qs.get("fromCoach") === "1") return "← Back to Coach Workspace";
    if (qs.get("asAdmin") === "1" && (qs.get("coachId") || "").trim()) return "← Back to Coach Workspace";
    if (window.isAdmin) return "← Back to Admin";
    if (window.isCoach) return "← Back to Coach Workspace";
    const page = String(window.location.pathname.split("/").pop() || "").toLowerCase();
    if (page === "coach-dashboard.html" || page === "coach-week-editor.html" || page === "coach-date-plan.html") {
      return "← Back to Coach Workspace";
    }
    const raw = String(localStorage.getItem("pac_lang") || "").toLowerCase();
    const lang = raw === "ua" ? "uk" : raw;
    const map = {
      uk: "← До Dashboard",
      en: "← Back to Dashboard",
      de: "← Zurück zum Dashboard",
      es: "← Volver al Dashboard",
      ru: "← На Dashboard",
      pt: "← Voltar ao Dashboard"
    };
    return map[lang] || map.en;
  }

  function shouldShow() {
    const page = String(window.location.pathname.split("/").pop() || "").toLowerCase();
    const qs = new URLSearchParams(window.location.search);
    if (qs.get("fromAdmin") === "1") return false;
    if (qs.get("fromCoach") === "1") return false;

    // If supervisor context is active (admin/coach viewing athlete), avoid duplicate back buttons.
    let savedMode = "";
    try {
      const raw = sessionStorage.getItem("pac_supervisor_ctx");
      if (raw) savedMode = String((JSON.parse(raw) || {}).mode || "").toLowerCase();
    } catch {}
    const isAthletePage = /^(dashboard(_user)?|wellness|injury|load-season|daily-individual|weekly-individual|weight-control|power)\.html$/i.test(page);
    if (isAthletePage && (savedMode === "admin" || savedMode === "coach")) return false;

    if (page === "admin.html" || page === "system-admin.html") return false;
    if (page === "coach-dashboard.html") return false;
    if (!page) return false;
    if (page === "dashboard_user.html" || page === "dashboard.html") return false;
    if (page === "regist.html") return false;
    if (page === "index.html") return false;
    return true;
  }

  function injectQuickBack() {
    if (!shouldShow()) return;
    if (document.getElementById("pac-quick-back-dashboard")) return;

    const main = document.querySelector(".main-content");
    if (!main) return;

    const btn = document.createElement("button");
    btn.id = "pac-quick-back-dashboard";
    btn.type = "button";
    btn.textContent = dashLabel();
    btn.style.cssText = [
      "display:inline-flex",
      "align-items:center",
      "gap:6px",
      "padding:10px 14px",
      "margin:0",
      "border-radius:999px",
      "border:1px solid #FFC72C",
      "background:rgba(0,0,0,0.85)",
      "color:#FFC72C",
      "font-weight:800",
      "font-size:12px",
      "letter-spacing:0.2px",
      "cursor:pointer",
      "position:fixed",
      "left:16px",
      "top:86px",
      "z-index:1200",
      "box-shadow:0 8px 20px rgba(0,0,0,0.35)"
    ].join(";");

    btn.addEventListener("click", () => {
      const qs = new URLSearchParams(window.location.search);
      const page = String(window.location.pathname.split("/").pop() || "").toLowerCase();
      const coachHref = coachWorkspaceHref(qs);
      const defaultHref = defaultWorkspaceHref();
      const href = (qs.get("fromAdmin") === "1")
        ? "../admin.html"
        : ((qs.get("fromCoach") === "1"
            || (qs.get("asAdmin") === "1" && (qs.get("coachId") || "").trim())
            || page === "coach-week-editor.html"
            || page === "coach-date-plan.html")
          ? coachHref
          : defaultHref);
      if (window.history.length > 1 && document.referrer && document.referrer.includes("dashboard_user.html")) {
        window.history.back();
        return;
      }
      window.location.href = href;
    });

    main.insertBefore(btn, main.firstChild);

    const applyResponsivePos = () => {
      if (window.matchMedia("(max-width: 768px)").matches) {
        const header = document.querySelector("header");
        const headerHeight = header ? Math.ceil(header.getBoundingClientRect().height) : 54;
        const mobileTop = Math.max(40, headerHeight - 14);

        btn.style.left = "12px";
        btn.style.right = "";
        btn.style.top = mobileTop + "px";
        btn.style.bottom = "";
        btn.style.fontSize = "11px";
        btn.style.padding = "8px 12px";
      } else {
        btn.style.left = "16px";
        btn.style.right = "";
        btn.style.top = "86px";
        btn.style.bottom = "";
        btn.style.fontSize = "12px";
        btn.style.padding = "10px 14px";
      }
    };
    applyResponsivePos();
    window.addEventListener("resize", applyResponsivePos);
  }

  document.addEventListener("DOMContentLoaded", injectQuickBack);
  window.addEventListener("pac:lang-changed", () => {
    const btn = document.getElementById("pac-quick-back-dashboard");
    if (btn) btn.textContent = dashLabel();
  });
})();

// Supervisor athlete context: keep selected athlete across pages + safe return
(function () {
  "use strict";

  const CONTEXT_KEY = "pac_supervisor_ctx";
  const ATHLETE_PAGE_RE = /^(dashboard(_user)?|wellness|injury|load-season|daily-individual|weekly-individual|weight-control|power)\.html$/i;

  function getLang() {
    const raw = String(localStorage.getItem("pac_lang") || "").toLowerCase();
    return raw === "ua" ? "uk" : raw;
  }

  function text(key, mode) {
    const lang = getLang();
    const map = {
      back_admin: {
        uk: "<- Nazad do Admin",
        en: "<- Back to Admin"
      },
      back_coach: {
        uk: "<- Nazad do Coach Workspace",
        en: "<- Back to Coach Workspace"
      },
      badge_admin: {
        uk: "Admin View",
        en: "Admin View"
      },
      badge_coach: {
        uk: "Coach View",
        en: "Coach View"
      },
      no_team: {
        uk: "No team set",
        en: "No team set"
      }
    };
    const dict = map[key] || {};
    const fallback = dict.en || "";
    return dict[lang] || fallback;
  }

  function parseParams() {
    const qs = new URLSearchParams(window.location.search);
    return {
      userId: (qs.get("userId") || "").trim(),
      fromAdmin: qs.get("fromAdmin") === "1",
      fromCoach: qs.get("fromCoach") === "1"
    };
  }

  function resolveMode(parsed) {
    if (parsed.fromAdmin) return "admin";
    if (parsed.fromCoach) return "coach";
    return null;
  }

  function modeMeta(mode) {
    if (mode === "admin") {
      return { mode, flag: "fromAdmin", backHref: "../admin.html" };
    }
    if (mode === "coach") {
      return { mode, flag: "fromCoach", backHref: "coach-dashboard.html" };
    }
    return null;
  }

  function saveContext(userId, mode) {
    if (!userId || !mode) return;
    try {
      sessionStorage.setItem(CONTEXT_KEY, JSON.stringify({
        ts: Date.now(),
        userId,
        mode
      }));
    } catch {}
  }

  function loadContext() {
    try {
      const raw = sessionStorage.getItem(CONTEXT_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed?.userId || !parsed?.mode) return null;
      const ageMs = Date.now() - Number(parsed.ts || 0);
      if (ageMs > 2 * 60 * 60 * 1000) {
        sessionStorage.removeItem(CONTEXT_KEY);
        return null;
      }
      return { userId: String(parsed.userId), mode: String(parsed.mode) };
    } catch {
      return null;
    }
  }

  function getEffectiveContext() {
    const parsed = parseParams();
    const mode = resolveMode(parsed);
    if (parsed.userId && mode) {
      saveContext(parsed.userId, mode);
      return { userId: parsed.userId, mode };
    }

    const saved = loadContext();
    const page = String(window.location.pathname.split("/").pop() || "").toLowerCase();
    if (!saved || !ATHLETE_PAGE_RE.test(page)) return null;

    const ref = String(document.referrer || "");
    const refSameOrigin = !!ref && ref.indexOf(window.location.origin) === 0;
    const refHasContext = /fromAdmin=1|fromCoach=1|userId=/.test(ref);
    if (!resolveMode(parsed) && !(refSameOrigin && refHasContext)) return null;

    // Recover missing query context inside athlete pages so user cannot get lost.
    const url = new URL(window.location.href);
    let changed = false;

    if (!parsed.userId) {
      url.searchParams.set("userId", saved.userId);
      changed = true;
    }
    if (!mode) {
      url.searchParams.delete("fromAdmin");
      url.searchParams.delete("fromCoach");
      url.searchParams.set(saved.mode === "admin" ? "fromAdmin" : "fromCoach", "1");
      changed = true;
    }

    if (changed) {
      try { window.history.replaceState({}, "", url.pathname.split("/").pop() + url.search); } catch {}
      return {
        userId: String(url.searchParams.get("userId") || saved.userId),
        mode: saved.mode
      };
    }

    return {
      userId: parsed.userId || saved.userId,
      mode: mode || saved.mode
    };
  }

  function preserveSupervisorAthleteQuery() {
    const ctx = getEffectiveContext();
    if (!ctx?.userId || !ctx?.mode) return;

    const meta = modeMeta(ctx.mode);
    if (!meta) return;

    const sidebar = document.getElementById("main-sidebar");
    if (!sidebar) return;

    const links = sidebar.querySelectorAll("a[href]");
    links.forEach((a) => {
      const href = a.getAttribute("href") || "";
      if (!href || href.startsWith("http") || href.startsWith("#")) return;
      if (!/\.html(\?|$)/i.test(href)) return;

      let url;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }

      const file = String(url.pathname.split("/").pop() || "").toLowerCase();
      if (!file.endsWith(".html")) return;

      if (/index\.html|regist\.html|auth\.html|pricing\.html|checkout\.html|privacy\.html|terms\.html|impressum\.html|payment-success\.html|payment-cancel\.html|cancel\.html/i.test(file)) {
        return;
      }

      if (meta.mode === "admin" && /admin\.html|system-admin\.html/i.test(file)) return;

      if (meta.mode === "coach" && /^coach-dashboard\.html$/i.test(file)) {
        url.searchParams.delete("userId");
        url.searchParams.delete("fromAdmin");
        url.searchParams.set("fromCoach", "1");
        a.setAttribute("href", file + url.search);
        return;
      }

      if (file === "dashboard_user.html" || file === "dashboard.html") {
        a.setAttribute("href", meta.backHref);
        return;
      }

      if (!ATHLETE_PAGE_RE.test(file)) return;

      url.searchParams.set("userId", ctx.userId);
      url.searchParams.delete("fromAdmin");
      url.searchParams.delete("fromCoach");
      url.searchParams.set(meta.flag, "1");
      a.setAttribute("href", file + url.search);
    });
  }

  async function injectSupervisorAthleteBadge() {
    const ctx = getEffectiveContext();
    if (!ctx?.userId || !ctx?.mode) return;
    if (document.getElementById("pac-supervisor-athlete-context")) return;

    const meta = modeMeta(ctx.mode);
    if (!meta) return;

    const main = document.querySelector(".main-content");
    if (!main) return;

    let athleteName = ctx.userId;
    let athleteTeam = text("no_team", ctx.mode);
    let athletePhoto = "../assets/images/AK_logo.png";

    const cacheKey = "pac_supervisor_athlete_" + ctx.mode + "_" + ctx.userId;
    const cachedRaw = sessionStorage.getItem(cacheKey);
    let cached = null;
    if (cachedRaw) {
      try { cached = JSON.parse(cachedRaw); } catch {}
    }

    if (cached && (Date.now() - Number(cached.ts || 0) < 10 * 60 * 1000)) {
      athleteName = cached.name || athleteName;
      athleteTeam = cached.team || athleteTeam;
      athletePhoto = cached.photo || athletePhoto;
    } else {
      try {
        const snap = await db.collection("users").doc(ctx.userId).get();
        if (snap.exists) {
          const d = snap.data() || {};
          const full = (d.firstName || "") + " " + (d.lastName || "");
          athleteName = full.trim() || d.displayName || d.email || ctx.userId;
          athleteTeam = d.teamName || d.team || d.club || d.currentTeam || text("no_team", ctx.mode);
          athletePhoto = d.photoURL || d.avatarUrl || "../assets/images/AK_logo.png";
          sessionStorage.setItem(cacheKey, JSON.stringify({
            ts: Date.now(),
            name: athleteName,
            team: athleteTeam,
            photo: athletePhoto
          }));
        }
      } catch {}
    }

    const wrap = document.createElement("div");
    wrap.id = "pac-supervisor-athlete-context";
    wrap.setAttribute("data-mode", ctx.mode);
    wrap.style.cssText = [
      "display:flex",
      "align-items:center",
      "justify-content:space-between",
      "gap:10px",
      "flex-wrap:wrap",
      "margin:0 0 12px 0",
      "padding:10px 12px",
      "border:1px solid rgba(255,199,44,.28)",
      "border-radius:14px",
      "background:linear-gradient(180deg, rgba(255,199,44,.10), rgba(0,0,0,.35))"
    ].join(";");

    const left = document.createElement("div");
    left.style.cssText = "display:flex;align-items:center;gap:10px;min-width:220px;";

    const avatar = document.createElement("img");
    avatar.src = athletePhoto;
    avatar.alt = athleteName;
    avatar.style.cssText = [
      "width:44px",
      "height:44px",
      "border-radius:50%",
      "object-fit:cover",
      "border:2px solid rgba(255,199,44,.75)",
      "background:#111"
    ].join(";");

    const identity = document.createElement("div");
    identity.style.cssText = "display:flex;flex-direction:column;gap:2px;";

    const scope = document.createElement("div");
    scope.style.cssText = "font-size:10px;color:#FFC72C;line-height:1.2;font-weight:800;letter-spacing:.04em;text-transform:uppercase;";
    scope.textContent = ctx.mode === "admin" ? text("badge_admin", ctx.mode) : text("badge_coach", ctx.mode);

    const name = document.createElement("div");
    name.style.cssText = "font-size:14px;color:#fff;font-weight:900;line-height:1.2;";
    name.textContent = athleteName;

    const team = document.createElement("div");
    team.style.cssText = "font-size:11px;color:#C9C9C9;line-height:1.2;";
    team.textContent = athleteTeam;

    identity.appendChild(scope);
    identity.appendChild(name);
    identity.appendChild(team);
    left.appendChild(avatar);
    left.appendChild(identity);

    const back = document.createElement("button");
    back.id = "pac-supervisor-back";
    back.type = "button";
    back.textContent = ctx.mode === "admin" ? text("back_admin", ctx.mode) : text("back_coach", ctx.mode);
    back.style.cssText = [
      "padding:8px 12px",
      "border-radius:999px",
      "border:1px solid #FFC72C",
      "background:rgba(0,0,0,.72)",
      "color:#FFC72C",
      "font-weight:800",
      "font-size:12px",
      "cursor:pointer"
    ].join(";");
    back.addEventListener("click", () => {
      try { sessionStorage.removeItem(CONTEXT_KEY); } catch {}
      window.location.href = meta.backHref;
    });

    wrap.appendChild(left);
    wrap.appendChild(back);
    main.insertBefore(wrap, main.firstChild);
  }

  function updateBadgeText() {
    const wrap = document.getElementById("pac-supervisor-athlete-context");
    const btn = document.getElementById("pac-supervisor-back");
    if (!wrap || !btn) return;
    const mode = wrap.getAttribute("data-mode") === "coach" ? "coach" : "admin";
    btn.textContent = mode === "admin" ? text("back_admin", mode) : text("back_coach", mode);
  }

  function maybeClearContextOnHub() {
    const page = String(window.location.pathname.split("/").pop() || "").toLowerCase();
    if (page === "coach-dashboard.html"
      || page === "coach-week-editor.html"
      || page === "coach-date-plan.html"
      || page === "admin.html"
      || page === "system-admin.html") {
      try { sessionStorage.removeItem(CONTEXT_KEY); } catch {}
    }
  }

  function wire() {
    maybeClearContextOnHub();
    preserveSupervisorAthleteQuery();
    injectSupervisorAthleteBadge();
  }

  document.addEventListener("DOMContentLoaded", wire);
  window.addEventListener("pac:lang-changed", updateBadgeText);
})();
