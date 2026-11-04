// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD1EP8iLSCVNZgkZKSSbMJa_4gS5VmqfKc",
  authDomain: "proathletecare-8eaba.firebaseapp.com",
  databaseURL: "https://proathletecare-8eaba-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "proathletecare-8eaba",
  storageBucket: "proathletecare-8eaba.firebasestorage.app",
  messagingSenderId: "769667753086",
  appId: "1:769667753086:web:9137a954e12fa35e58a42f",
  measurementId: "G-YMCM4H414R"
};

// Ініціалізація Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Створюємо глобальні змінні, щоб інші скрипти їх бачили
window.db = firebase.firestore();
window.auth = firebase.auth();
window.storage = typeof firebase.storage === "function" ? firebase.storage() : null;

// Legacy globals for scripts that use `auth` and `db` directly
window.auth = window.auth || firebase.auth();
window.db = window.db || firebase.firestore();
window.storage = window.storage || (typeof firebase.storage === "function" ? firebase.storage() : null);

var auth = window.auth;
var db = window.db;
