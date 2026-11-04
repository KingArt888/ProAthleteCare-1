(function () {
  "use strict";

  function isIos() {
    return /iphone|ipad|ipod/i.test(navigator.userAgent);
  }

  function isSafari() {
    const ua = navigator.userAgent || "";
    return /safari/i.test(ua) && !/crios|fxios|edgios|opr\//i.test(ua);
  }

  function isStandalone() {
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true
    );
  }

  function createModal() {
    if (document.getElementById("pac-pwa-modal")) return;

    const modal = document.createElement("div");
    modal.id = "pac-pwa-modal";
    modal.style.cssText = [
      "position:fixed",
      "inset:0",
      "z-index:2147483600",
      "background:rgba(0,0,0,.74)",
      "display:none",
      "align-items:center",
      "justify-content:center",
      "padding:16px",
      "font-family:Arial,sans-serif"
    ].join(";");

    modal.innerHTML = [
      "<div style='width:min(440px,96vw);background:#0c0c0c;border:1px solid rgba(255,199,44,.45);border-radius:14px;padding:14px;color:#fff;'>",
      "<div style='display:flex;align-items:center;justify-content:space-between;gap:10px;'>",
      "<div style='font-size:14px;font-weight:800;color:#FFC72C;'>Install ProAthleteCare</div>",
      "<button id='pac-pwa-modal-close' type='button' style='border:1px solid #444;background:#111;color:#fff;border-radius:8px;padding:6px 10px;cursor:pointer;'>Close</button>",
      "</div>",
      "<div style='font-size:13px;line-height:1.45;opacity:.95;margin-top:10px;'>",
      "<div>1. Open site in <b>Safari</b>.</div>",
      "<div style='margin-top:6px;'>2. Tap <b>Share</b> icon (square with arrow).</div>",
      "<div style='margin-top:6px;'>3. Choose <b>Add to Home Screen</b>.</div>",
      "<div style='margin-top:6px;'>4. Tap <b>Add</b>.</div>",
      "</div>",
      "<div style='display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;'>",
      "<button id='pac-pwa-open-share' type='button' style='border:1px solid #FFC72C;background:#FFC72C;color:#000;border-radius:10px;padding:10px 12px;font-weight:800;cursor:pointer;'>Open Share Menu</button>",
      "<button id='pac-pwa-installed' type='button' style='border:1px solid #2f2f2f;background:#101010;color:#fff;border-radius:10px;padding:10px 12px;cursor:pointer;'>Done</button>",
      "</div>",
      "</div>"
    ].join("");

    document.body.appendChild(modal);

    const close = document.getElementById("pac-pwa-modal-close");
    const done = document.getElementById("pac-pwa-installed");
    const openShare = document.getElementById("pac-pwa-open-share");

    close?.addEventListener("click", function () {
      modal.style.display = "none";
    });

    done?.addEventListener("click", function () {
      localStorage.setItem("pac_pwa_hint_hidden_v2", "1");
      modal.style.display = "none";
      const hint = document.getElementById("pac-pwa-hint");
      if (hint) hint.remove();
    });

    openShare?.addEventListener("click", async function () {
      try {
        if (navigator.share) {
          await navigator.share({
            title: "ProAthleteCare",
            text: "Install ProAthleteCare on iPhone",
            url: window.location.origin + "/"
          });
        } else {
          alert("Open Safari Share menu manually and tap Add to Home Screen.");
        }
      } catch (_) {
        // User canceled share or browser blocked it.
      }
    });

    return modal;
  }

  function showIosInstallHint() {
    if (!isIos() || isStandalone()) return;
    if (document.getElementById("pac-pwa-hint")) return;
    if (document.getElementById("pac-site-lock")) return;

    const hiddenKey = "pac_pwa_hint_hidden_v2";
    if (localStorage.getItem(hiddenKey) === "1") return;

    const hint = document.createElement("div");
    hint.id = "pac-pwa-hint";
    hint.style.cssText = [
      "position:fixed",
      "left:12px",
      "right:12px",
      "bottom:12px",
      "z-index:2147483000",
      "background:#0b0b0b",
      "color:#fff",
      "border:1px solid rgba(255,199,44,.5)",
      "border-radius:14px",
      "padding:10px 12px",
      "box-shadow:0 12px 36px rgba(0,0,0,.45)",
      "font-family:Arial,sans-serif"
    ].join(";");

    hint.innerHTML = [
      "<div style='display:flex;gap:10px;align-items:flex-start;'>",
      "<div style='flex:1;min-width:0;'>",
      "<div style='font-size:13px;font-weight:800;color:#FFC72C;'>Install on iPhone</div>",
      "<div style='font-size:12px;line-height:1.35;opacity:.9;margin-top:4px;'>Tap Install Guide and add app to Home Screen</div>",
      "</div>",
      "<button id='pac-pwa-hint-open' type='button' style='width:auto;min-width:106px;height:32px;border-radius:8px;border:1px solid #FFC72C;background:#FFC72C;color:#000;cursor:pointer;font-weight:800;'>Install Guide</button>",
      "</div>",
      "<div style='margin-top:8px;font-size:11px;opacity:.75;'>",
      isSafari() ? "Browser: Safari" : "Open in Safari for Add to Home Screen",
      "</div>",
    ].join("");

    document.body.appendChild(hint);

    const open = document.getElementById("pac-pwa-hint-open");
    open?.addEventListener("click", function () {
      const modal = createModal();
      if (modal) modal.style.display = "flex";
    });
  }

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker
        .register("/ProAthleteCare-1/gps-iphone-v14/service-worker.js", { updateViaCache: "none" })
        .then(function (reg) {
          reg.update().catch(function () {});

          reg.addEventListener("updatefound", function () {
            const installing = reg.installing;
            if (!installing) return;
            installing.addEventListener("statechange", function () {
              if (installing.state === "installed" && navigator.serviceWorker.controller) {
                window.dispatchEvent(new CustomEvent("pac:pwa-update-ready", {
                  detail: { registration: reg }
                }));
              }
            });
          });
        })
        .catch(function (err) {
          console.warn("PWA SW registration failed:", err);
        });
    });
  }

  window.addEventListener("load", function () {
    showIosInstallHint();
  });
})();
