let isLoginMode = false;

function toggleMode() {
    isLoginMode = !isLoginMode;
    const btn = document.getElementById('main-btn');
    const title = document.querySelector('.logo-text');
    const extraFields = ['name', 'age', 'club', 'consent', 'avatar-file'];
    
    if (isLoginMode) {
        btn.innerText = "Увійти";
        title.innerText = "PRO ATLET CARE | ВХІД";
        document.querySelector('.avatar-picker').style.display = 'none';
        document.querySelector('.consent-box').style.display = 'none';
        document.getElementById('name').style.display = 'none';
        document.getElementById('age').style.display = 'none';
        document.getElementById('club').style.display = 'none';
        document.querySelector('.toggle-link').innerHTML = "Немає акаунту? <span>Зареєструватися</span>";
    } else {
        location.reload(); // Найпростіший спосіб повернути стан реєстрації
    }
}

function previewImage(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => document.getElementById('preview').src = e.target.result;
        reader.readAsDataURL(file);
    }
}

async function handleAuth() {
    const email = document.getElementById('email').value.trim();
    const pass = document.getElementById('pass').value;
    const btn = document.getElementById('main-btn');

    if (isLoginMode) {
        try {
            await firebase.auth().signInWithEmailAndPassword(email, pass);
            window.location.href = "injury.html";
        } catch (e) { alert("Помилка входу: " + e.message); }
        return;
    }

    // РЕЄСТРАЦІЯ (беремо ID саме з твого HTML)
    const firstName = document.getElementById('firstName')?.value || document.getElementById('name')?.value;
    const lastName = document.getElementById('lastName')?.value || "";
    
    if (!firstName) return alert("Будь ласка, введіть ім'я!");

    btn.disabled = true;
    btn.innerText = "Створюємо профіль...";

    try {
        const res = await firebase.auth().createUserWithEmailAndPassword(email, pass);
        await firebase.firestore().collection('users').doc(res.user.uid).set({
  uid: res.user.uid,
  firstName: firstName,
  lastName: lastName,
  email: email,
  photoURL: "../assets/images/AK_logo.png",
  createdAt: firebase.firestore.FieldValue.serverTimestamp(),

  // ✅ ВАЖЛИВО для rules
  role: "athlete",
  coachId: null,
  clubId: null,
  setupComplete: true
});

        window.location.href = "injury.html";
    } catch (e) {
        alert(e.message);
        btn.disabled = false;
        btn.innerText = "Зареєструватися";
    }
}