// settings.js (i18n-ready)
document.addEventListener('DOMContentLoaded', () => {
  const auth = window.auth;
  const db = window.db;
  const storage = window.storage;
  const settingsForm = document.getElementById('settings-form');

  const I18N = {
    uk: {
      firstName: "Ім'я", lastName: "Прізвище", club: "Клуб / Команда", country: "Країна",
      save: "Зберегти зміни", saving: "Збереження...", updated: "Дані успішно оновлено!",
      noUser: "Немає активного користувача. Перезайди в акаунт.",
      pickImage: "Будь ласка, вибери зображення (image/*).",
      uploadFail: "Фото не завантажилось: ", errPrefix: "Помилка: ",
      disclaimerWellness: "Показники продуктивності та wellness мають лише інформаційний характер і не замінюють професійну медичну консультацію.",
      disclaimerInjury: "ProAthleteCare зберігає лише нотатки про травми та файли для підтримки тренувального процесу. Це не медична діагностика і не лікування.",
      disclaimerPower: "Power Test призначений лише для фітнесу та відстеження продуктивності. Це не медичний тест і не діагноз.",
      disclaimerLoad: "Load Season надає лише аналітику тренувального навантаження та продуктивності. Він не діагностує, не лікує і не запобігає травмам.",
      disclaimerWeight: "Weight Control надає лише загальні рекомендації щодо фітнесу та харчування. Це не медична, дієтична або клінічна консультація."
    },
    en: {
      firstName: "First name", lastName: "Last name", club: "Club / Team", country: "Country",
      save: "Save changes", saving: "Saving...", updated: "Profile updated successfully!",
      noUser: "No active user. Please sign in again.",
      pickImage: "Please select an image file (image/*).",
      uploadFail: "Photo upload failed: ", errPrefix: "Error: ",
      disclaimerWellness: "Performance and wellness insights are informational only and do not replace professional medical advice.",
      disclaimerInjury: "ProAthleteCare stores injury notes and training-support files only. It does not provide medical diagnosis or treatment.",
      disclaimerPower: "Power Test is intended for fitness and performance tracking only. It is not a medical test or diagnosis.",
      disclaimerLoad: "Load Season provides training load and performance insights only. It does not diagnose, treat, or prevent injuries.",
      disclaimerWeight: "Weight Control provides general fitness and nutrition guidance only. It is not medical, dietary, or clinical advice."
    },
    de: {
      firstName: "Vorname", lastName: "Nachname", club: "Club / Team", country: "Land",
      save: "Änderungen speichern", saving: "Speichern...", updated: "Profil erfolgreich aktualisiert!",
      noUser: "Kein aktiver Benutzer. Bitte erneut anmelden.",
      pickImage: "Bitte ein Bild auswählen (image/*).",
      uploadFail: "Foto-Upload fehlgeschlagen: ", errPrefix: "Fehler: ",
      disclaimerWellness: "Leistungs- und Wellness-Einblicke dienen nur zur Information und ersetzen keine professionelle medizinische Beratung.",
      disclaimerInjury: "ProAthleteCare speichert nur Verletzungsnotizen und Dateien zur Trainingsunterstützung. Es bietet keine medizinische Diagnose oder Behandlung.",
      disclaimerPower: "Power Test dient nur der Fitness- und Leistungsüberwachung. Es ist kein medizinischer Test und keine Diagnose.",
      disclaimerLoad: "Load Season liefert nur Einblicke in Trainingsbelastung und Leistung. Es diagnostiziert, behandelt oder verhindert keine Verletzungen.",
      disclaimerWeight: "Weight Control bietet nur allgemeine Fitness- und Ernährungshinweise. Es ist keine medizinische, diätetische oder klinische Beratung."
    },
    es: {
      firstName: "Nombre", lastName: "Apellido", club: "Club / Equipo", country: "País",
      save: "Guardar cambios", saving: "Guardando...", updated: "¡Perfil actualizado correctamente!",
      noUser: "No hay usuario activo. Inicia sesión de nuevo.",
      pickImage: "Selecciona una imagen (image/*).",
      uploadFail: "Error al subir foto: ", errPrefix: "Error: ",
      disclaimerWellness: "Las métricas de rendimiento y bienestar son solo informativas y no sustituyen el consejo médico profesional.",
      disclaimerInjury: "ProAthleteCare solo almacena notas de lesiones y archivos de apoyo al entrenamiento. No ofrece diagnóstico ni tratamiento médico.",
      disclaimerPower: "Power Test está destinado solo al seguimiento de fitness y rendimiento. No es una prueba médica ni un diagnóstico.",
      disclaimerLoad: "Load Season ofrece solo información sobre carga de entrenamiento y rendimiento. No diagnostica, trata ni previene lesiones.",
      disclaimerWeight: "Weight Control ofrece solo orientación general de fitness y nutrición. No es consejo médico, dietético ni clínico."
    },
    ru: {
      firstName: "Имя", lastName: "Фамилия", club: "Клуб / Команда", country: "Страна",
      save: "Сохранить изменения", saving: "Сохранение...", updated: "Профиль успешно обновлен!",
      noUser: "Нет активного пользователя. Войдите снова.",
      pickImage: "Выберите изображение (image/*).",
      uploadFail: "Ошибка загрузки фото: ", errPrefix: "Ошибка: ",
      disclaimerWellness: "Показатели эффективности и wellness носят только информационный характер и не заменяют профессиональную медицинскую консультацию.",
      disclaimerInjury: "ProAthleteCare хранит только заметки о травмах и файлы для поддержки тренировочного процесса. Это не медицинская диагностика и не лечение.",
      disclaimerPower: "Power Test предназначен только для отслеживания фитнеса и производительности. Это не медицинский тест и не диагноз.",
      disclaimerLoad: "Load Season предоставляет только аналитику тренировочной нагрузки и производительности. Он не диагностирует, не лечит и не предотвращает травмы.",
      disclaimerWeight: "Weight Control предоставляет только общие рекомендации по фитнесу и питанию. Это не медицинская, диетологическая или клиническая консультация."
    },
    pt: {
      firstName: "Nome", lastName: "Sobrenome", club: "Clube / Equipe", country: "País",
      save: "Salvar alterações", saving: "Salvando...", updated: "Perfil atualizado com sucesso!",
      noUser: "Nenhum usuário ativo. Entre novamente.",
      pickImage: "Selecione uma imagem (image/*).",
      uploadFail: "Falha no upload da foto: ", errPrefix: "Erro: ",
      disclaimerWellness: "Insights de desempenho e wellness são apenas informativos e não substituem orientação médica profissional.",
      disclaimerInjury: "ProAthleteCare armazena apenas notas de lesões e arquivos de apoio ao treino. Não fornece diagnóstico ou tratamento médico.",
      disclaimerPower: "Power Test destina-se apenas ao acompanhamento de fitness e desempenho. Não é um teste médico nem um diagnóstico.",
      disclaimerLoad: "Load Season fornece apenas insights de carga de treino e desempenho. Não diagnostica, trata ou previne lesões.",
      disclaimerWeight: "Weight Control fornece apenas orientação geral de fitness e nutrição. Não é aconselhamento médico, dietético ou clínico."
    }
  };

  const sl = () => {
    const raw = String(localStorage.getItem('pac_lang') || document.documentElement.lang || '').toLowerCase().slice(0, 2);
    if (raw === 'ua') return 'uk';
    return I18N[raw] ? raw : 'uk';
  };
  const t = (k) => I18N[sl()]?.[k] ?? I18N.en[k] ?? k;

  const DISCLAIMER_KEYS = {
    wellness: 'disclaimerWellness',
    injury: 'disclaimerInjury',
    power: 'disclaimerPower',
    load: 'disclaimerLoad',
    weight: 'disclaimerWeight'
  };

  function applySensitiveDisclaimers() {
    document.querySelectorAll('[data-pac-disclaimer]').forEach((el) => {
      const key = DISCLAIMER_KEYS[String(el.getAttribute('data-pac-disclaimer') || '').trim()];
      if (key) el.textContent = t(key);
    });
  }

  applySensitiveDisclaimers();
  window.addEventListener('pac:lang-changed', applySensitiveDisclaimers);

  if (!auth || !db) {
    console.error('Missing Firebase globals: window.auth / window.db');
    return;
  }

  function $(id) { return document.getElementById(id); }
  function safeVal(id, fallback = '') { const el = $(id); return el ? (el.value || fallback) : fallback; }

  function setTextAll(selector, text) {
    document.querySelectorAll(selector).forEach(el => { el.innerText = text; });
  }

  function setAvatarAll(url) {
    ['#user-avatar', '#profile-avatar', '.user-avatar', '.avatar-img'].forEach(sel => {
      document.querySelectorAll(sel).forEach(img => {
        if (img && img.tagName === 'IMG') img.src = url;
      });
    });
  }

  function computeDisplayName(user, firstName, lastName) {
    const full = `${firstName || ''} ${lastName || ''}`.trim();
    if (full) return full;
    const email = user?.email || '';
    return email ? email.split('@')[0] : 'User';
  }

  async function syncPublicProfile(uid, patch) {
    if (!uid) return;
    try {
      await db.collection('public_profiles').doc(uid).set({
        ...patch,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    } catch (e) {
      console.warn('syncPublicProfile denied:', e?.message || e);
    }
  }

  function applySettingsI18n() {
    if (!settingsForm) return;
    const labels = settingsForm.querySelectorAll('label');
    if (labels[0]) labels[0].textContent = t('firstName');
    if (labels[1]) labels[1].textContent = t('lastName');
    if (labels[2]) labels[2].textContent = t('club');
    if (labels[3]) labels[3].textContent = t('country');
    const btn = settingsForm.querySelector("button[type='submit'], button");
    if (btn) btn.textContent = t('save');
  }

  async function loadUserData() {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const userDoc = await db.collection('users').doc(user.uid).get();
      if (userDoc.exists) {
        const data = userDoc.data() || {};
        if ($('set-firstName')) $('set-firstName').value = data.firstName || '';
        if ($('set-lastName')) $('set-lastName').value = data.lastName || '';
        if ($('set-club')) $('set-club').value = data.club || '';
        if ($('set-country')) $('set-country').value = data.country || 'Germany';
        if ($('user-email-display')) $('user-email-display').innerText = user.email || '';
        const currentPhoto = data.photoURL || user.photoURL || '';
        if (currentPhoto) setAvatarAll(currentPhoto);
      }
    } catch (error) {
      console.error('Profile load error:', error);
    }
  }

  window.openProfile = () => {
    const modal = $('profileModal');
    if (!modal) return;
    modal.style.display = 'block';
    applySettingsI18n();
    loadUserData();
  };

  window.closeProfile = () => {
    const modal = $('profileModal');
    if (!modal) return;
    modal.style.display = 'none';
  };

  async function uploadAvatarIfAny(user) {
    const fileInput = $('set-avatar');
    if (!fileInput || !fileInput.files || !fileInput.files[0]) return null;

    if (!storage || !storage.ref) throw new Error('Firebase Storage is not connected (window.storage).');

    const file = fileInput.files[0];
    if (!file.type || !file.type.startsWith('image/')) throw new Error(t('pickImage'));

    const ref = storage.ref().child(`avatars/${user.uid}/${Date.now()}_${file.name}`);
    const snap = await ref.put(file);
    const url = await snap.ref.getDownloadURL();
    fileInput.value = '';
    return url;
  }

  if (settingsForm) {
    settingsForm.onsubmit = async (e) => {
      e.preventDefault();

      const user = auth.currentUser;
      if (!user?.uid) {
        alert(t('noUser'));
        return;
      }

      const btn = settingsForm.querySelector('button');
      const oldBtnText = btn ? btn.innerText : '';

      if (btn) {
        btn.innerText = t('saving');
        btn.disabled = true;
      }

      try {
        const firstName = safeVal('set-firstName', '');
        const lastName  = safeVal('set-lastName', '');
        const club      = safeVal('set-club', '');
        const country   = safeVal('set-country', 'Germany');

        let newPhotoURL = null;
        try {
          newPhotoURL = await uploadAvatarIfAny(user);
        } catch (avatarErr) {
          alert(t('uploadFail') + (avatarErr?.message || avatarErr));
          throw avatarErr;
        }

        const usersPatch = {
          firstName,
          lastName,
          club,
          country,
          lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        };
        if (newPhotoURL) usersPatch.photoURL = newPhotoURL;

        await db.collection('users').doc(user.uid).set(usersPatch, { merge: true });

        const newFullName = computeDisplayName(user, firstName, lastName);
        localStorage.setItem('userFullName', newFullName);

        await syncPublicProfile(user.uid, {
          displayName: newFullName,
          ...(newPhotoURL ? { photoURL: newPhotoURL } : {})
        });

        setTextAll('#user-name', newFullName);
        setTextAll('.user-name-display', newFullName);
        if (newPhotoURL) setAvatarAll(newPhotoURL);

        alert(t('updated'));

        if (btn) {
          btn.innerText = oldBtnText || t('save');
          btn.disabled = false;
        }

        window.closeProfile();
      } catch (error) {
        alert(t('errPrefix') + (error?.message || error));
        if (btn) {
          btn.innerText = oldBtnText || t('save');
          btn.disabled = false;
        }
      }
    };
  }

  applySettingsI18n();
  window.addEventListener('pac:lang-changed', applySettingsI18n);
});

window.onclick = (event) => {
  const modal = document.getElementById('profileModal');
  if (modal && event.target === modal) modal.style.display = 'none';
};
