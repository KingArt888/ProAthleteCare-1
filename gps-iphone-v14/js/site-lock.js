(function () {
  "use strict";

  const ENABLED = false;
  const PASSWORD = "PAC-TEST-2026";
  const SESSION_TTL_HOURS = 12;
  const STORAGE_KEY = "pac_site_lock_v2";
  const HIDE_STYLE_ID = "pac-site-lock-hide";

  function nowMs() {
    return Date.now();
  }

  function readSession() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (!data || data.ok !== 1) return null;
      if (!Number.isFinite(data.exp) || data.exp <= nowMs()) return null;
      return data;
    } catch {
      return null;
    }
  }

  function writeSession() {
    const exp = nowMs() + SESSION_TTL_HOURS * 60 * 60 * 1000;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ok: 1, exp }));
  }

  function clearSession() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }

  function injectHideStyle() {
    if (document.getElementById(HIDE_STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = HIDE_STYLE_ID;
    style.textContent = "html{visibility:hidden!important;}";
    (document.head || document.documentElement).appendChild(style);
  }

  function removeHideStyle() {
    const style = document.getElementById(HIDE_STYLE_ID);
    if (style) style.remove();
  }

  function unlockByUrlParam() {
    try {
      const url = new URL(window.location.href);
      const unlock = url.searchParams.get("unlock");
      if (!unlock || unlock !== PASSWORD) return;
      writeSession();
      url.searchParams.delete("unlock");
      const q = url.searchParams.toString();
      const clean = url.pathname + (q ? "?" + q : "") + (url.hash || "");
      window.history.replaceState({}, "", clean);
    } catch {}
  }

  function mountLockScreen() {
    if (document.getElementById("pac-site-lock")) return;

    let body = document.body;
    if (!body) {
      body = document.createElement("body");
      document.documentElement.appendChild(body);
    }

    document.documentElement.style.overflow = "hidden";
    document.documentElement.style.height = "100%";
    body.style.overflow = "hidden";
    body.style.margin = "0";
    body.style.height = "100%";

    body.innerHTML = [
      "<div id='pac-site-lock' style='position:fixed;inset:0;z-index:2147483647;background:radial-gradient(circle at top,#121212 0%,#000 62%);display:flex;align-items:center;justify-content:center;padding:16px;font-family:Arial,sans-serif;'>",
      "<div style='width:min(420px,96vw);padding:20px;border-radius:16px;border:1px solid rgba(255,199,44,.35);background:rgba(0,0,0,.92);box-shadow:0 20px 60px rgba(0,0,0,.7);'>",
      "<div style='color:#FFC72C;font-weight:900;font-size:20px;letter-spacing:.02em;'>ProAthleteCare</div>",
      "<div style='color:#fff;font-weight:800;margin-top:8px;'>Private Test Access</div>",
      "<div style='color:#aaa;font-size:13px;line-height:1.45;margin-top:8px;'>Site is temporarily locked for internal testing. Enter password to continue.</div>",
      "<form id='pac-site-lock-form' style='margin-top:14px;display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center;'>",
      "<input id='pac-site-lock-input' type='password' autocomplete='current-password' placeholder='Password' style='width:100%;min-width:0;padding:12px;border-radius:10px;border:1px solid #333;background:#0b0b0b;color:#fff;outline:none;'>",
      "<button type='submit' style='width:auto;min-width:96px;padding:12px 14px;border-radius:10px;border:1px solid #FFC72C;background:#FFC72C;color:#000;font-weight:900;cursor:pointer;white-space:nowrap;'>Enter</button>",
      "</form>",
      "<div id='pac-site-lock-error' style='display:none;color:#ff6b6b;font-size:12px;margin-top:10px;'>Wrong password. Try again.</div>",
      "</div>",
      "</div>"
    ].join("");

    removeHideStyle();
    document.documentElement.style.visibility = "visible";

    const form = document.getElementById("pac-site-lock-form");
    const input = document.getElementById("pac-site-lock-input");
    const err = document.getElementById("pac-site-lock-error");
    if (input) input.focus();

    form?.addEventListener("submit", function (e) {
      e.preventDefault();
      const value = String(input?.value || "");
      if (value === PASSWORD) {
        writeSession();
        window.location.reload();
        return;
      }
      if (err) err.style.display = "block";
      if (input) {
        input.value = "";
        input.focus();
      }
    });
  }

  window.PAC_SITE_LOCK = {
    clear: clearSession,
    enabled: ENABLED
  };

  if (!ENABLED) return;

  unlockByUrlParam();
  if (readSession()) return;

  injectHideStyle();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountLockScreen, { once: true });
  } else {
    mountLockScreen();
  }
})();
