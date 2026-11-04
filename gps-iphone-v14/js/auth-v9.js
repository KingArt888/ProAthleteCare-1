// auth-v9.js
// Firebase Auth v9 — ТІЛЬКИ для Google Authenticator (TOTP)

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getAuth,
  multiFactor,
  TotpMultiFactorGenerator
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

// ⚠️ Мінімальний конфіг (той самий проєкт)
const firebaseConfig = {
  apiKey: "AIzaSyD1EP8iLSCVNZgkZKSSbMJa_4gS5VmqfKc",
  authDomain: "proathletecare-8eaba.firebaseapp.com",
  projectId: "proathletecare-8eaba",
  appId: "1:769667753086:web:9137a954e12fa35e58a42f"
};

// ✅ ОКРЕМИЙ app instance, щоб не ламати v8
const appV9 = initializeApp(firebaseConfig, "authV9");

// ✅ Auth v9
const authV9 = getAuth(appV9);

// 🌍 Робимо глобально доступним
window.authV9 = authV9;
window.multiFactorV9 = multiFactor;
window.TotpGenerator = TotpMultiFactorGenerator;

