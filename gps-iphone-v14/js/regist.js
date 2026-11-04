document.addEventListener('DOMContentLoaded', () => {
    if (!window.__PAC_REG_I18N_LOADED__) {
        const i18nScript = document.createElement('script');
        i18nScript.src = '../js/regist-i18n.js';
        i18nScript.defer = true;
        document.head.appendChild(i18nScript);
        window.__PAC_REG_I18N_LOADED__ = true;
    }

    const auth = window.auth;
    const db = window.db;

    const ch1 = document.getElementById('check-terms');
    const ch2 = document.getElementById('check-data');
    const googleBtn = document.getElementById('google-btn');
    const showEmailBtn = document.getElementById('show-email-btn');
    const getRegI18n = () => window.PAC_REG_I18N || null;
    const t = (key, vars) => {
      const i18n = getRegI18n();
      if (i18n && typeof i18n.t === 'function') return i18n.t(key, vars);
      return String(key || '');
    };
    const applyRegI18n = () => {
      const i18n = getRegI18n();
      if (i18n && typeof i18n.applyStatic === 'function') {
        i18n.applyStatic(document);
      }
    };
    applyRegI18n();
    window.addEventListener('pac:lang-changed', applyRegI18n);
    window.addEventListener('storage', (ev) => {
      if (ev && ev.key === 'pac_lang') applyRegI18n();
    });
    // PATCH START: Trial helpers (MVP gate)
function getQP(name) {
  try { return new URL(window.location.href).searchParams.get(name); }
  catch { return null; }
}
const FORCE_ONBOARDING = getQP("onboarding") === "1" || getQP("reonboard") === "1";
function normPlan(p){
  p = (p || "").toLowerCase();
  if (p.includes("basic")) return "basic";
  if (p.includes("pro")) return "pro";
  return "plus";
}

async function ensureTrialForNewUser(user) {
  // trial only when coming from checkout/regist with ?trial=1
  const isTrial = getQP("trial") === "1";
  if (!isTrial || !user?.uid) return;

  const plan = normPlan(getQP("plan"));

  const ref = db.collection("users").doc(user.uid);
  const snap = await ref.get();

  // якщо user doc вже має trial/paid — НЕ чіпаємо (щоб не “продовжити trial” випадково)
  const existing = snap.exists ? snap.data() : null;
  if (existing?.trialEndsAtMs || existing?.paidUntilMs) return;

  const nowMs = Date.now();
  const endsMs = nowMs + 7 * 24 * 60 * 60 * 1000;

  // PATCH START: keep createdAt stable
const payload = {
  uid: user.uid,
  email: user.email || null,
  role: existing?.role || "athlete",
  setupComplete: existing?.setupComplete || false,

  planSelected: plan,
  accessStatus: "trial",
  trialStartedAtMs: nowMs,
  trialEndsAtMs: endsMs,

  
};

// ✅ додаємо тільки якщо поле реально існує в документі
if (existing && ("clubId" in existing)) payload.clubId = existing.clubId;
if (existing && ("coachId" in existing)) payload.coachId = existing.coachId;

// якщо дока нема — тоді явно ставимо null (це CREATE, rules це дозволяють)
if (!snap.exists) {
  payload.clubId = null;
  payload.coachId = null;
  payload.createdAt = firebase.firestore.FieldValue.serverTimestamp();
}

await ref.set(payload, { merge: true });

// PATCH END

}
async function ensureUserDoc(user) {
  if (!user?.uid) return;

  const ref = db.collection("users").doc(user.uid);
  const snap = await ref.get();
  const existing = snap.exists ? (snap.data() || {}) : null;

  // Новий user doc: тільки безпечний мінімум для правил create.
  if (!snap.exists) {
    const createPayload = {
      uid: user.uid,
      role: "athlete",
      clubId: null,
      coachId: null,
      setupComplete: false,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      lastSeen: Date.now()
    };
    if (user.email) createPayload.email = user.email;
    await ref.set(createPayload, { merge: false });
    return;
  }

  // Існуючий user doc: не торкаємось billing/role полів, щоб не впертись у rules.
  const patch = {
    lastSeen: Date.now()
  };
  if (!("uid" in existing) || !existing.uid) patch.uid = user.uid;
  if ((!("email" in existing) || !existing.email) && user.email) patch.email = user.email;
  if (!("setupComplete" in existing)) patch.setupComplete = false;

  await ref.set(patch, { merge: true });
}

const EMAIL_VERIFICATION_RESEND_COOLDOWN_MS = 60 * 1000;
const EMAIL_CANONICAL_ORIGIN = "https://proathletecare.com";
let lastVerificationEmailSentAt = 0;

function getActionContinueUrl() {
  const host = String(window.location.hostname || "").toLowerCase();
  const isProdHost = host === "proathletecare.com" || host === "www.proathletecare.com";
  const isLocalHost = host === "localhost" || host === "127.0.0.1";
  const origin = isProdHost
    ? window.location.origin
    : (isLocalHost ? window.location.origin : EMAIL_CANONICAL_ORIGIN);
  const lang = encodeURIComponent(resolveAuthEmailLang());
  return `${origin}/ProAthleteCare-1/gps-iphone-v14/pages/regist.html?from=email-action&lang=${lang}`;
}

function resolveAuthEmailLang() {
  try {
    const raw = String(localStorage.getItem("pac_lang") || "").trim().toLowerCase();
    if (raw === "ua") return "uk";
    if (["uk", "en", "de", "es", "ru", "pt"].includes(raw)) return raw;
  } catch {}
  const navLang = String(navigator.language || "en").toLowerCase();
  const short = navLang.slice(0, 2);
  if (["uk", "en", "de", "es", "ru", "pt"].includes(short)) return short;
  return "en";
}

function applyAuthEmailLang() {
  try {
    auth.languageCode = resolveAuthEmailLang();
  } catch {}
}

function buildActionCodeSettings() {
  return {
    url: getActionContinueUrl(),
    handleCodeInApp: false
  };
}

function shouldFallbackToDefaultActionSettings(err) {
  const code = String(err?.code || "");
  return (
    code === "auth/invalid-continue-uri" ||
    code === "auth/unauthorized-continue-uri" ||
    code === "auth/missing-continue-uri"
  );
}

async function sendVerificationEmailSmart(user, source = "unknown") {
  if (!user) {
    const error = new Error("No authenticated user is available for email verification.");
    error.code = "auth/no-current-user";
    throw error;
  }
  applyAuthEmailLang();
  const actionCodeSettings = buildActionCodeSettings();
  console.info("[VERIFY] sending verification email", {
    source,
    uid: user.uid || null,
    email: user.email || null,
    continueUrl: actionCodeSettings.url
  });
  try {
    await user.sendEmailVerification(actionCodeSettings);
    console.info("[VERIFY] send success", { source });
  } catch (err) {
    if (!shouldFallbackToDefaultActionSettings(err)) {
      console.error("[VERIFY] send failed:", err?.code, err?.message, err);
      throw err;
    }
    console.warn("[VERIFY] action settings rejected; retrying with Firebase defaults:", err?.code);
    try {
      await user.sendEmailVerification();
      console.info("[VERIFY] send success", { source, usedDefaultActionSettings: true });
    } catch (fallbackErr) {
      console.error("[VERIFY] send failed:", fallbackErr?.code, fallbackErr?.message, fallbackErr);
      throw fallbackErr;
    }
  }
}

async function sendPasswordResetSmart(email) {
  if (!email) return;
  applyAuthEmailLang();
  const actionCodeSettings = buildActionCodeSettings();
  try {
    await auth.sendPasswordResetEmail(email, actionCodeSettings);
  } catch (err) {
    if (!shouldFallbackToDefaultActionSettings(err)) throw err;
    await auth.sendPasswordResetEmail(email);
  }
}

function getResendWaitSeconds() {
  const elapsed = Date.now() - lastVerificationEmailSentAt;
  if (elapsed >= EMAIL_VERIFICATION_RESEND_COOLDOWN_MS) return 0;
  return Math.ceil((EMAIL_VERIFICATION_RESEND_COOLDOWN_MS - elapsed) / 1000);
}

function normalizeEmail(rawEmail) {
  return String(rawEmail || "").trim().toLowerCase();
}

function getSignInErrorMessage(code) {
  switch (String(code || "")) {
    case "auth/too-many-requests":
      return t("errorTooMany");
    case "auth/network-request-failed":
      return t("errorNetwork");
    case "auth/user-disabled":
      return t("errorUserDisabled");
    case "auth/invalid-email":
      return t("errorInvalidEmail");
    default:
      return "";
  }
}

// Verification-email send failures must never surface a raw Firebase message
// (e.g. "Too many requests. (auth/too-many-requests)"). The real code is kept
// in the console by the caller; the user only ever sees these two messages.
function getVerifySendErrorMessage(code) {
  if (String(code || "") === "auth/too-many-requests") return t("verifyTooMany");
  return t("verifySendFailed");
}


async function safeFetchSignInMethods(email) {
  try {
    return await auth.fetchSignInMethodsForEmail(email);
  } catch (_) {
    return [];
  }
}





    // 1. ПРАВИЛА ТА МОДАЛКА (Глобальні функції)
    window.showRules = (type) => {
        const body = document.getElementById('rules-body');
        const modal = document.getElementById('rulesModal');
        if (!body || !modal) return;
        const i18n = getRegI18n();
        if (i18n && typeof i18n.getLegalHtml === 'function') {
            body.innerHTML = i18n.getLegalHtml(type);
        } else {
            body.innerHTML = '';
        }
        modal.style.display = 'block';
    };
    window.closeRules = () => {
        const modal = document.getElementById('rulesModal');
        if (modal) modal.style.display = 'none';
    };

    // 2. ВАЛІДАЦІЯ ГАЛОЧОК
    if (ch1 && ch2) {
        const validate = () => {
            const ok = ch1.checked && ch2.checked;
            if (googleBtn) googleBtn.disabled = !ok;
            if (showEmailBtn) showEmailBtn.disabled = !ok;
        };
        ch1.onchange = validate;
        ch2.onchange = validate;
    }

    // 3. GOOGLE ВХІД (Тут був дубль, я залишив один правильний)
    if (googleBtn) {
        googleBtn.onclick = async () => {
            // Declared out here so the profile block below can see it; keeping it
            // inside the auth try would scope it away and throw ReferenceError.
            let res = null;
            try {
                res = await auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
            } catch (e) {
                // Помилка авторизації (popup cancelled, blocked, network, disabled...).
                console.error("GOOGLE SIGNIN ERROR:", e?.code, e?.message, e);
                const code = String(e?.code || "");
                alert(code.startsWith("auth/") ? (getSignInErrorMessage(code) || t("errorAuthGeneric")) : t("errorAuthGeneric"));
                return;
            }

            // Auth успішний. Помилки далі — це профіль (Firestore), не вхід.
            try {
// PATCH START: trial init for google users
await ensureUserDoc(res.user);
if (res?.additionalUserInfo?.isNewUser) {
  await ensureTrialForNewUser(res.user);
}

await db.collection("users").doc(res.user.uid).set({ lastSeen: Date.now() }, { merge: true });

// No verification email is sent on the Google path. Pass false so the UI never
// claims one was. If Google already reports emailVerified === true, checkUser
// skips the verification screen entirely and proceeds normally.
await checkUser(res.user, false);

            } catch (profileErr) {
                console.error("PROFILE FAILED after successful Google sign-in:", profileErr?.code, profileErr?.message, profileErr);
                alert(t("profileLoadFailed"));
            }
        };
    }

    // 4. EMAIL ВХІД ТА РЕЄСТРАЦІЯ
    if (showEmailBtn) {
        showEmailBtn.onclick = () => {
            document.getElementById('auth-selection').style.display = 'none';
            document.getElementById('email-section').style.display = 'block';
        };
    }

const emailFinalBtn = document.getElementById('email-final-btn');
if (emailFinalBtn) emailFinalBtn.onclick = async () => {

  const email = normalizeEmail(document.getElementById('email-input').value);
  const pass = document.getElementById('pass-input').value;

  if (!email) return alert(t("enterEmail"));
  if (pass.length < 6) return alert(t("passwordMin"));

  emailFinalBtn.disabled = true;

  try {
    let res = null;

    // ✅ 1) Спочатку пробуємо увійти (існуючий акаунт)
    let signinErr = null;

    // Крок A: тільки Firebase Auth. Помилка тут = помилка авторизації.
    try {
      res = await auth.signInWithEmailAndPassword(email, pass);

    } catch (e) {
      signinErr = e;
      console.error("SIGNIN ERROR:", e?.code, e?.message, e);

      const signInMessage = getSignInErrorMessage(signinErr?.code);
      if (signInMessage) {
        alert(signInMessage);
        return;
      }
      // Не return: нижче пробуємо створити акаунт/new.
    }

    // Крок B: Auth успішний -> акаунт існує, пароль вірний.
    // Будь-яка помилка нижче — це проблема ПРОФІЛЮ (Firestore), а не пароля.
    // Не переходимо до createUserWithEmailAndPassword і не пропонуємо
    // скидання пароля, бо пароль тут ні до чого.
    // Повернення існуючого користувача не надсилає verification email, тому
    // передаємо false: екран не має називатися «ми надіслали лист».
    if (res && res.user) {
      try {
        await ensureUserDoc(res.user);
        await db.collection("users").doc(res.user.uid).set({ lastSeen: Date.now() }, { merge: true });

        await checkUser(res.user, false);
      } catch (profileErr) {
        console.error("PROFILE FAILED after successful sign-in:", profileErr?.code, profileErr?.message, profileErr);
        alert(t("profileLoadFailed"));
      }
      return;
    }

    // ✅ 2) Якщо вхід не вдався — пробуємо створити нового
    try {
      res = await auth.createUserWithEmailAndPassword(email, pass);
    } catch (createErr) {
      // Важливо: з увімкненим захистом Firebase методи входу можуть не віддаватися,
      // тому опираємося на прямий код помилки createUser.
      if (createErr?.code === "auth/email-already-in-use") {
        const methods = await safeFetchSignInMethods(email);
        const hasGoogle = methods.includes("google.com");
        const hasPassword = methods.includes("password");

        if (hasGoogle && !hasPassword) {
          alert(t("emailRegisteredGoogle"));
          return;
        }

        if (signinErr?.code === "auth/too-many-requests") {
          alert(t("tooManyAgain"));
          return;
        }

        // Якщо вхід не вдався через неправильний пароль, не заганяємо в нескінченний reset-loop.
        if (signinErr?.code === "auth/wrong-password" || signinErr?.code === "auth/invalid-credential") {
          alert(t("wrongPassword"));
          return;
        }

        const doReset = confirm(t("accountExistsResetQuestion"));
        if (doReset) {
          await sendPasswordResetSmart(email);
          alert(t("resetSent", { email }));
        } else {
          alert(t("emailAlreadyRegistered"));
        }
        return;
      }
      throw createErr;
    }

// Firebase Auth account creation succeeded. Request verification immediately,
// before Firestore/profile work, so a profile write failure cannot prevent the
// verification request from reaching Firebase Auth.
let verificationEmailSent = false;
try {
  await sendVerificationEmailSmart(res.user, "registration");
  lastVerificationEmailSentAt = Date.now();
  verificationEmailSent = true;
} catch (e) {
  alert(getVerifySendErrorMessage(e?.code));
}

// Далі — лише робота з профілем. Помилка профілю не повинна виглядати як
// невдала реєстрація/невірний пароль.
try {
  await ensureUserDoc(res.user);
  await ensureTrialForNewUser(res.user);

  await db.collection("users").doc(res.user.uid).set(
    { lastSeen: Date.now() },
    { merge: true }
  );

  await checkUser(res.user, verificationEmailSent);
} catch (profileErr) {
  console.error("PROFILE FAILED after account creation:", profileErr?.code, profileErr?.message, profileErr);
  alert(t("profileLoadFailed"));
}
return;


  } catch (e) {
    console.error("EMAIL AUTH ERROR:", e?.code, e?.message, e);
    const errCode = String(e?.code || "");
    // Розділяємо помилку авторизації від помилки профілю/бекенду.
    alert(
      errCode.startsWith("auth/")
        ? (getSignInErrorMessage(errCode) || t("errorAuthGeneric"))
        : t("profileLoadFailed")
    );
  } finally {
    emailFinalBtn.disabled = false;
  }
};


    async function redirectByRole(user) {
        if (!user) return;
        try {
            const snap = await db.collection('users').doc(user.uid).get();
            const data = snap.exists ? (snap.data() || {}) : {};
            const rawRole = String(data.role || '').toLowerCase();
            const role = rawRole === 'trainer' ? 'coach' : rawRole;
            const isAdminEmail = String(user.email || '').toLowerCase() === "kulyk015@gmail.com";

            if (isAdminEmail || role === 'admin') {
                window.location.href = "../admin.html";
            } else if (role === 'coach') {
                window.location.href = "coach-dashboard.html";
            } else {
                window.location.href = "dashboard_user.html";
            }
        } catch (e) {
            console.warn("redirectByRole failed:", e);
            window.location.href = "dashboard_user.html";
        }
    }

    // 5. ФУНКЦІЯ ПЕРЕВІРКИ КОРИСТУВАЧА
    // verificationEmailSent must reflect an ACTUAL successful sendEmailVerification()
    // in this flow. It must never be inferred from !emailVerified, because a brand
    // new user is always unverified, so that would claim an email was sent even
    // when the send failed, or when no send was ever attempted (Google, returning
    // user sign-in).
    async function checkUser(user, verificationEmailSent = false) {
        await user.reload();
        const updatedUser = auth.currentUser;

        if (!updatedUser.emailVerified) {
            showVerificationScreen(updatedUser.email, verificationEmailSent === true);
            return;
        }

        const doc = await db.collection('users').doc(updatedUser.uid).get();
        if (doc.exists && doc.data().setupComplete && !FORCE_ONBOARDING) {
            await redirectByRole(updatedUser);
        } else {
            // Показуємо форму профілю
            document.getElementById('auth-selection').style.display = 'none';
            document.getElementById('email-section').style.display = 'none';
            if (document.getElementById('verification-section')) 
                document.getElementById('verification-section').style.display = 'none';
            
            const legalBox = document.querySelector('.legal-box');
            if (legalBox) legalBox.style.display = 'none';
            
            document.getElementById('profile-form').style.display = 'block';
        }
    }

    // Екран верифікації
    // emailWasSent === true  -> "We sent a verification email to ..." (truthful)
    // emailWasSent === false -> never claims a send; offers to request one instead
    function showVerificationScreen(email, emailWasSent) {
        const authSel = document.getElementById('auth-selection');
        const emailSec = document.getElementById('email-section');
        const vSection = document.getElementById('verification-section');

        if (authSel) authSel.style.display = 'none';
        if (emailSec) emailSec.style.display = 'none';
        if (vSection) {
            vSection.style.display = 'block';
            vSection.innerHTML = `
                <div style="padding: 20px; background: rgba(255,199,44,0.1); border-radius: 16px; border: 1px dashed #FFC72C;">
                    <h3 style="color: #FFC72C;">${t("verifyTitle")}</h3>
                    <p style="color: #ccc;">${emailWasSent ? t("verifySentTo", { email }) : t("verifyNotSent", { email })}</p>
                    <button onclick="location.reload()" style="margin-top: 15px;">${t("verifyDone")}</button>
                    <p style="margin-top: 20px; color: #888; cursor: pointer;" onclick="resendEmail()">${emailWasSent ? t("resendAgain") : t("sendVerification")}</p>
                </div>`;
        }
    }

    // Повторна пошта
    window.resendEmail = async () => {
        console.info("[VERIFY] resend clicked");
        const user = auth.currentUser;
        console.info("[VERIFY] currentUser:", user ? { uid: user.uid || null, email: user.email || null } : null);
        if (!user) {
            console.warn("[VERIFY] resend blocked: no auth.currentUser");
            alert(t("verifyNoSession"));
            return;
        }
        try {
            const waitSec = getResendWaitSeconds();
            if (waitSec > 0) {
                console.info("[VERIFY] resend blocked by cooldown", { waitSeconds: waitSec });
                return alert(t("resendWait", { sec: waitSec }));
            }
            await sendVerificationEmailSmart(user, "resend");
            // Cooldown and the success message only AFTER a real successful send.
            lastVerificationEmailSentAt = Date.now();
            alert(t("resendSent"));
        } catch (e) {
            alert(getVerifySendErrorMessage(e?.code));
        }
    };


    // Збереження профілю
    // Profile save (Onboarding Wizard)
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        const SPORT_CONFIG = {
          football: { label: 'Football', positions: [['gk','Goalkeeper'],['cb','Center Back'],['fb','Fullback/Wingback'],['dm','Defensive Midfielder'],['cm','Central Midfielder'],['am','Attacking Midfielder'],['wing','Winger'],['st','Striker']], goals: ['Speed','Endurance','Strength','Power','Recovery','Injury prevention','Return after injury','Match readiness'] },
          futsal: { label: 'Futsal', positions: [['gk','Goalkeeper'],['fixo','Fixo'],['ala','Ala'],['pivot','Pivot']], goals: ['Agility','Strength','Speed endurance','Recovery','Injury prevention','Decision making','Match readiness'] },
          basketball: { label: 'Basketball', positions: [['pg','Point Guard'],['sg','Shooting Guard'],['sf','Small Forward'],['pf','Power Forward'],['c','Center']], goals: ['Strength','Vertical power','Agility','Conditioning','Recovery','Injury prevention','Match readiness'] },
          volleyball: { label: 'Volleyball', positions: [['setter','Setter'],['outside','Outside Hitter'],['opposite','Opposite'],['middle','Middle Blocker'],['libero','Libero']], goals: ['Jump height','Strength','Power','Shoulder health','Recovery','Injury prevention','Match readiness'] },
          tennis: { label: 'Tennis', positions: [['singles','Singles'],['doubles','Doubles']], goals: ['Footwork','Strength','Endurance','Serve power','Recovery','Injury prevention','Match readiness'] },
          athletics: { label: 'Athletics', positions: [['sprints','Sprints'],['middle','Middle distance'],['long','Long distance'],['jumps','Jumps'],['throws','Throws']], goals: ['Speed','Endurance','Strength','Power','Technique','Recovery','Injury prevention'] },
          rugby: { label: 'Rugby', positions: [['forward','Forward'],['back','Back'],['scrumhalf','Scrum-half'],['flyhalf','Fly-half']], goals: ['Strength','Power','Speed endurance','Contact readiness','Recovery','Injury prevention','Return after injury'] },
          athlete_coach: { label: 'Athlete Coach', positions: [['head_coach','Head Coach'],['strength_coach','Strength Coach'],['rehab_coach','Rehab Coach'],['performance_coach','Performance Coach']], goals: ['Monitoring quality','Strength development','Load control','Recovery planning','Injury prevention','Return after injury','Match readiness'] },
          handball: { label: 'Handball', positions: [['gk','Goalkeeper'],['lw','Left Wing'],['rw','Right Wing'],['lb','Left Back'],['cb','Center Back'],['rb','Right Back'],['pivot','Pivot']], goals: ['Strength','Throw power','Speed','Endurance','Recovery','Injury prevention','Match readiness'] },
          hockey: { label: 'Hockey', positions: [['gk','Goalkeeper'],['def','Defender'],['mid','Midfielder'],['fwd','Forward']], goals: ['Speed','Stamina','Strength','Power','Recovery','Injury prevention','Match readiness'] },
          other: { label: 'Other', positions: [['athlete','Athlete']], goals: ['Performance','Strength','Endurance','Recovery','Injury prevention','Return after injury'] }
        };

        function escHtml(s) {
          return String(s ?? '').replace(/[&<>"']/g, (m) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;' }[m]));
        }

        profileForm.innerHTML = `
          <div style="text-align:left;">
            <h3 style="margin:0 0 10px;">${t("wizardTitle")}</h3>
            <div id="obStepLabel" style="font-size:12px;color:#9a9a9a;margin-bottom:8px;">${t("stepLabel", { step: 1, total: 4 })}</div>
            <div style="height:8px;background:#161616;border:1px solid #2b2b2b;border-radius:999px;overflow:hidden;margin-bottom:14px;">
              <div id="obBar" style="height:100%;width:25%;background:linear-gradient(90deg,#d4a017,#FFC72C);"></div>
            </div>
          </div>

          <div class="ob-step" data-step="1">
            <input type="text" id="obFirstName" placeholder="${t("athleteFirstNamePlaceholder")}" required>
            <input type="text" id="obLastName" placeholder="${t("athleteLastNamePlaceholder")}" required>
            <input type="text" id="obClub" placeholder="${t("athleteClubPlaceholder")}">
            <select id="obCountry" required>
              <option value="Ukraine">${t("countryUkraine")}</option>
              <option value="Germany">${t("countryGermany")}</option>
              <option value="Cyprus">${t("countryCyprus")}</option>
            </select>
          </div>

          <div class="ob-step" data-step="2" style="display:none;">
            <div style="font-size:12px;color:#bcbcbc;margin-bottom:8px;">${t("chooseSport")}</div>
            <div id="obSportGrid" style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;"></div>
            <select id="obSport" required style="display:none;">
              ${Object.keys(SPORT_CONFIG).map((k) => `<option value="${k}" ${k==='football'?'selected':''}>${SPORT_CONFIG[k].label}</option>`).join('')}
            </select>
            <div style="font-size:12px;color:#bcbcbc;margin-bottom:8px;">${t("choosePosition")}</div>
            <div id="obPositionGrid" style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;"></div>
            <select id="obPosition" required style="display:none;"></select>
            <select id="obSeason" required>
              <option value="preseason">${t("seasonPreseason")}</option>
              <option value="inseason" selected>${t("seasonInseason")}</option>
              <option value="offseason">${t("seasonOffseason")}</option>
            </select>
          </div>

          <div class="ob-step" data-step="3" style="display:none;">
            <div style="font-size:18px;font-weight:800;color:#FFC72C;margin-bottom:6px;">${t("performanceFocusTitle")}</div>
            <div style="font-size:12px;color:#bcbcbc;margin-bottom:8px;">${t("performanceFocusHint")}</div>
            <div id="obGoalsCount" style="font-size:12px;color:#9a9a9a;margin-bottom:10px;">${t("selectedOutcomesCount", { count: 0 })}</div>
            <div id="obGoalsGrid" style="display:grid;grid-template-columns:1fr 1fr;gap:8px;"></div>
            <input type="text" id="obNotes" style="margin-top:14px;" placeholder="${t("notesPlaceholder")}">
          </div>

          <div class="ob-step" data-step="4" style="display:none;">
            <input type="number" id="obHeight" min="120" max="240" step="1" placeholder="${t("heightPlaceholder")}" required>
            <input type="number" id="obWeight" min="30" max="200" step="0.1" placeholder="${t("weightPlaceholder")}" required>
            <div style="font-size:12px;color:#9a9a9a;">${t("baselineHint")}</div>
          </div>

          <div style="display:flex;gap:10px;margin-top:14px;">
            <button id="obBack" type="button" style="width:auto;flex:1;background:none;border:1px solid #FFC72C;color:#FFC72C;display:none;">${t("previousStep")}</button>
            <button id="obNext" type="button" style="width:auto;flex:1;">${t("nextStep")}</button>
            <button id="obSubmit" type="submit" style="width:auto;flex:1;display:none;">${t("applyBaseline")}</button>
          </div>
        `;

        const ob = {
          step: 1,
          total: 4,
          selectedGoals: [],
          steps: Array.from(profileForm.querySelectorAll('.ob-step')),
          stepLabel: document.getElementById('obStepLabel'),
          bar: document.getElementById('obBar'),
          btnBack: document.getElementById('obBack'),
          btnNext: document.getElementById('obNext'),
          btnSubmit: document.getElementById('obSubmit'),
          sportEl: document.getElementById('obSport'),
          posEl: document.getElementById('obPosition'),
          sportGrid: document.getElementById('obSportGrid'),
          posGrid: document.getElementById('obPositionGrid'),
          goalsGrid: document.getElementById('obGoalsGrid')
        };
        ob.goalsCount = document.getElementById('obGoalsCount');

        function renderChoiceButtons(root, items, value, onPick) {
          if (!root) return;
          root.innerHTML = items.map((x) => {
            const v = escHtml(x.value);
            const t = escHtml(x.text);
            const active = x.value === value;
            return `<button type="button" data-v="${v}" style="background:${active ? 'rgba(255,199,44,.16)' : '#101010'};border:1px solid ${active ? '#FFC72C' : '#343434'};color:${active ? '#FFC72C' : '#fff'};padding:10px 12px;border-radius:10px;text-transform:none;font-weight:700;">${t}</button>`;
          }).join('');
          root.querySelectorAll('button[data-v]').forEach((btn) => {
            btn.addEventListener('click', () => onPick(btn.getAttribute('data-v')));
          });
        }

        function renderSportButtons() {
          const current = ob.sportEl?.value || 'football';
          const items = Object.keys(SPORT_CONFIG).map((k) => ({ value: k, text: SPORT_CONFIG[k].label }));
          renderChoiceButtons(ob.sportGrid, items, current, (picked) => {
            if (ob.sportEl) ob.sportEl.value = picked;
            fillSportDependent();
          });
        }

        function renderPositionButtons(positions) {
          const list = Array.isArray(positions) ? positions : [];
          renderChoiceButtons(
            ob.posGrid,
            list.map(([value, text]) => ({ value, text })),
            ob.posEl?.value || list[0]?.[0] || '',
            (picked) => {
              if (ob.posEl) ob.posEl.value = picked;
              renderPositionButtons(list);
            }
          );
        }

        function fillSportDependent() {
          const sport = ob.sportEl?.value || 'football';
          const cfg = SPORT_CONFIG[sport] || SPORT_CONFIG.other;
          renderSportButtons();
          ob.posEl.innerHTML = cfg.positions.map(([v,t]) => `<option value="${escHtml(v)}">${escHtml(t)}</option>`).join('');
          if (ob.posEl && !ob.posEl.value && cfg.positions[0]?.[0]) {
            ob.posEl.value = cfg.positions[0][0];
          }
          renderPositionButtons(cfg.positions);
          ob.selectedGoals = [];
          ob.goalsGrid.innerHTML = cfg.goals.map((g) => `
            <button type="button" class="ob-goal-btn" data-goal="${escHtml(g)}" style="background:#101010;border:1px solid #343434;color:#fff;padding:10px 12px;border-radius:10px;text-transform:none;font-weight:700;">${escHtml(g)}</button>
          `).join('');
          ob.goalsGrid.querySelectorAll('.ob-goal-btn').forEach((btn) => {
            btn.addEventListener('click', () => {
              const goal = btn.getAttribute('data-goal');
              const has = ob.selectedGoals.includes(goal);
              if (has) {
                ob.selectedGoals = ob.selectedGoals.filter((x) => x !== goal);
              } else {
                if (ob.selectedGoals.length >= 2) return;
                ob.selectedGoals.push(goal);
              }
              ob.goalsGrid.querySelectorAll('.ob-goal-btn').forEach((b) => {
                const active = ob.selectedGoals.includes(b.getAttribute('data-goal'));
                b.style.borderColor = active ? '#FFC72C' : '#343434';
                b.style.background = active ? 'rgba(255,199,44,.16)' : '#101010';
                b.style.color = active ? '#FFC72C' : '#fff';
                b.textContent = active ? `✓ ${b.getAttribute('data-goal')}` : b.getAttribute('data-goal');
              });
              updateGoalStepState();
            });
          });
          const goalButtons = Array.from(ob.goalsGrid.querySelectorAll('.ob-goal-btn'));
          if (goalButtons.length % 2 === 1 && goalButtons.length > 0) {
            const lastBtn = goalButtons[goalButtons.length - 1];
            lastBtn.style.gridColumn = '1 / -1';
            lastBtn.style.justifySelf = 'center';
            lastBtn.style.width = 'calc(50% - 4px)';
          }
          updateGoalStepState();
        }

        function updateGoalStepState() {
          if (ob.goalsCount) ob.goalsCount.textContent = t("selectedOutcomesCount", { count: ob.selectedGoals.length });
          if (ob.step === 3 && ob.btnNext) {
            const enabled = ob.selectedGoals.length >= 1;
            ob.btnNext.disabled = !enabled;
            ob.btnNext.style.opacity = enabled ? "1" : ".5";
            ob.btnNext.style.cursor = enabled ? "pointer" : "not-allowed";
          }
        }

        function validStep(step) {
          const req = { 1: ['obFirstName','obLastName','obCountry'], 2: ['obSport','obPosition','obSeason'], 3: [], 4: ['obHeight','obWeight'] }[step] || [];
          for (const id of req) {
            const el = document.getElementById(id);
            if (!el || !el.value || (typeof el.checkValidity === 'function' && !el.checkValidity())) {
              if (typeof el.reportValidity === 'function') el.reportValidity();
              return false;
            }
          }
          if (step === 3 && ob.selectedGoals.length === 0) {
            alert(t('selectOutcomeMin1'));
            return false;
          }
          return true;
        }

        function renderStep() {
          ob.steps.forEach((s, i) => s.style.display = (i + 1 === ob.step) ? 'block' : 'none');
          if (ob.stepLabel) ob.stepLabel.textContent = t("stepLabel", { step: ob.step, total: ob.total });
          if (ob.bar) ob.bar.style.width = `${(ob.step / ob.total) * 100}%`;
          if (ob.btnBack) ob.btnBack.style.display = ob.step > 1 ? 'block' : 'none';
          if (ob.btnNext) ob.btnNext.style.display = ob.step < ob.total ? 'block' : 'none';
          if (ob.btnSubmit) ob.btnSubmit.style.display = ob.step === ob.total ? 'block' : 'none';
          updateGoalStepState();
        }

        if (ob.btnBack) ob.btnBack.addEventListener('click', () => { if (ob.step > 1) { ob.step -= 1; renderStep(); } });
        if (ob.btnNext) ob.btnNext.addEventListener('click', () => { if (!validStep(ob.step)) return; if (ob.step < ob.total) { ob.step += 1; renderStep(); } });

        renderSportButtons();
        fillSportDependent();
        renderStep();

        profileForm.onsubmit = async (e) => {
          e.preventDefault();
          if (!validStep(ob.step)) return;
          const user = auth.currentUser;
          try {
            const sport = document.getElementById('obSport').value;
            const season = document.getElementById('obSeason').value;
            const height = Number(document.getElementById('obHeight').value || 0);
            const weight = Number(document.getElementById('obWeight').value || 0);
            const bmi = (height > 0 && weight > 0) ? Number((weight / ((height/100)*(height/100))).toFixed(1)) : null;
            const readinessPct = Math.max(45, Math.min(95, Math.round(72 - (season === 'inseason' ? 8 : 0) + (ob.selectedGoals.includes('Injury prevention') ? 6 : 0))));

            await db.collection('users').doc(user.uid).set({
              firstName: document.getElementById('obFirstName').value,
              lastName: document.getElementById('obLastName').value,
              club: document.getElementById('obClub').value || t('independentClub'),
              country: document.getElementById('obCountry').value,
              sportType: sport,
              seasonPhase: season,
              playerPosition: document.getElementById('obPosition').value,
              goals: ob.selectedGoals,
              extraNotes: document.getElementById('obNotes').value || '',
              height: Number.isFinite(height) ? height : null,
              weight: Number.isFinite(weight) ? weight : null,
              onboarding: {
                version: 1,
                completedAt: firebase.firestore.FieldValue.serverTimestamp(),
                source: 'regist',
                summary: { sport, season, goals: ob.selectedGoals }
              },
              onboardingDashboard: { readinessPct, bmi },
              uid: user.uid,
              setupComplete: true,
              role: 'athlete',
              clubId: null,
              coachId: null
            }, { merge: true });

            window.location.href = 'wellness.html?onboarding=done&baseline=1';
          } catch (err) { alert(err.message); }
        };
    }
});

// Глобальна перевірка авторизації (поза DOMContentLoaded для швидкості)
// PATCH START: Safe global auth guard for regist page (no ReferenceError)
(function(){
  const auth = window.auth;
  const db = window.db;
  if (!auth || !db) return;
  function isRegistRoute(pathname) {
    const path = String(pathname || "").toLowerCase().replace(/\/+$/, "");
    return path.endsWith("/ProAthleteCare-1/gps-iphone-v14/pages/regist") || path.endsWith("/ProAthleteCare-1/gps-iphone-v14/pages/regist.html");
  }
  const forceOnboardingGlobal = (function () {
    try {
      const u = new URL(window.location.href);
      return u.searchParams.get("onboarding") === "1" || u.searchParams.get("reonboard") === "1";
    } catch {
      return false;
    }
  })();

  auth.onAuthStateChanged(async (user) => {
    try {
      if (user && user.emailVerified) {
        const doc = await db.collection('users').doc(user.uid).get();
        if (doc.exists && doc.data().setupComplete && !forceOnboardingGlobal) {
          if (isRegistRoute(window.location.pathname)) {
            const data = doc.data() || {};
            const rawRole = String(data.role || '').toLowerCase();
            const role = rawRole === 'trainer' ? 'coach' : rawRole;
            const isAdminEmail = String(user.email || '').toLowerCase() === "kulyk015@gmail.com";
            if (isAdminEmail || role === "admin") window.location.href = "../admin.html";
            else if (role === "coach") window.location.href = "coach-dashboard.html";
            else window.location.href = "dashboard_user.html";
          }
        }
      } else if (!user && !isRegistRoute(window.location.pathname)) {
        window.location.href = "regist.html";
      }
    } catch(e){
      console.warn("regist authStateChanged error:", e);
    }
  });
})();
// PATCH END
