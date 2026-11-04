(function initPacRegI18n() {
  const SUPPORTED = ["uk", "en", "de", "es", "ru", "pt"];

  function normalizeLang(raw) {
    const value = String(raw || "").trim().toLowerCase();
    if (!value) return "en";
    if (value === "ua") return "uk";
    const short = value.slice(0, 2);
    return SUPPORTED.includes(short) ? short : "en";
  }

  function detectLang() {
    try {
      const saved = normalizeLang(window.localStorage?.getItem("pac_lang"));
      if (SUPPORTED.includes(saved)) return saved;
    } catch {}
    const htmlLang = normalizeLang(document?.documentElement?.lang || "");
    if (SUPPORTED.includes(htmlLang)) return htmlLang;
    return normalizeLang(navigator?.language || "en");
  }

  const TEXT = {
    en: {
      pageTitle: "ProAthleteCare | Registration",
      tagline: "Professional Performance Tracking",
      acceptPrefix: "I accept",
      termsLink: "Terms of use",
      privacyPrefix: "I agree with",
      privacyLink: "Privacy policy",
      googleBtn: "Sign in with Google",
      authOr: "OR",
      emailBtn: "Sign in by Email",
      emailPlaceholder: "Email",
      passwordPlaceholder: "Password (min 6 chars)",
      emailFinalBtn: "Sign in or create account",
      backBtn: "Back",
      profileSetup: "Profile setup",
      firstNamePlaceholder: "First name",
      lastNamePlaceholder: "Last name",
      clubPlaceholder: "Club / Team",
      countryUkraine: "Ukraine",
      countryGermany: "Germany",
      countryCyprus: "Cyprus",
      saveAndEnter: "Save and enter",

      errorTooMany: "Too many sign-in attempts. Wait 5-10 minutes and try again.",
      errorNetwork: "Network error. Check your internet and try again.",
      errorUserDisabled: "This account is temporarily disabled.",
      errorInvalidEmail: "Invalid email format.",
      errorAuthGeneric: "Sign-in failed. Please check your email and password and try again.",
      enterEmail: "Enter your email.",
      passwordMin: "Password must be at least 6 characters.",
      emailRegisteredGoogle: "This email is registered with Google. Use 'Sign in with Google'.",
      tooManyAgain: "Too many sign-in attempts. Wait 5-10 minutes and try again.",
      accountExistsResetQuestion: "An account with this email already exists. Send a password reset email?",
      resetSent: "Password reset email sent to {email}. After reset, sign in with your new password. If this account uses Google, sign in with Google.",
      wrongPassword: "Wrong password. Try another password or reset it.",
      profileLoadFailed: "You are signed in, but your profile could not be loaded or saved. This is not a password problem. Please try again, or contact support if it keeps happening.",
      emailAlreadyRegistered: "This email is already registered. Try signing in.",
      resendWait: "Wait {sec}s before sending again.",
      resendSent: "Email sent!",
      verifyTitle: "Verify your email",
      verifySentTo: "We sent a verification email to <b>{email}</b>.",
      verifyDone: "I verified, continue",
      resendAgain: "Send again",
      sendVerification: "Send verification email",
      verifyNotSent: "Your email address <b>{email}</b> is not verified yet.",
      verifyTooMany: "Too many verification attempts. Please wait and try again later.",
      verifySendFailed: "We could not send the verification email. Please try again later.",
      verifyNoSession: "Your session has expired. Please sign in again to request a new verification email.",
      selectOutcomeMin1: "Select at least 1 outcome",

      wizardTitle: "Athlete Quick Setup",
      stepLabel: "Step {step}/{total}",
      previousStep: "Previous Step",
      nextStep: "Next Step",
      applyBaseline: "Apply Baseline",
      athleteFirstNamePlaceholder: "Athlete first name",
      athleteLastNamePlaceholder: "Athlete last name",
      athleteClubPlaceholder: "Club / Team (optional system input)",
      chooseSport: "Choose sport",
      choosePosition: "Choose position",
      seasonPreseason: "Pre-season phase",
      seasonInseason: "In-season phase",
      seasonOffseason: "Off-season phase",
      performanceFocusTitle: "Performance Focus",
      performanceFocusHint: "Select 1-2 focus areas for your plan.",
      selectedOutcomesCount: "Selected outcomes: {count}/2",
      notesPlaceholder: "Optional: injury context or schedule limits",
      heightPlaceholder: "Anthropometry: Height (cm)",
      weightPlaceholder: "Anthropometry: Weight (kg)",
      baselineHint: "These inputs initialize baseline model. You can update later in Settings.",
      doneMark: "Done",
      independentClub: "Independent",

      termsTitle: "Terms of use",
      termsUpdated: "Last updated: January 2026",
      termsP1: "<b>1. General provisions:</b> ProAthleteCare is a digital platform for monitoring athletes' physical condition. By using the app, you agree to these terms.",
      termsP2: "<b>2. Medical disclaimer:</b> <span style='color:#FFC72C;'>IMPORTANT:</span> The app is not a medical device. Analytics are based on self-monitoring algorithms and do not replace a doctor.",
      termsP3: "<b>3. Service use:</b> The user is fully responsible for data accuracy and execution of training plans.",
      termsP4: "<b>4. Governing law:</b> The project is governed by German law (BGB).",
      gdprTitle: "Privacy Policy (DSGVO)",
      gdprUpdated: "According to EU data protection requirements",
      gdprP1: "<b>1. Data controller:</b> Artem Kulyk (ProAthleteCare). Contact: proatletcare@gmail.com.",
      gdprP2: "<b>2. Data collection:</b> We collect email and health-related input required for analytics functionality.",
      gdprP3: "<b>3. Technical base:</b> Your data is encrypted and stored on Google Firebase servers in the European Union (Frankfurt, Germany).",
      gdprP4: "<b>4. Your rights:</b> You have the right to data copy and full profile deletion (right to be forgotten)."
    },
    uk: {
      pageTitle: "ProAthleteCare | Реєстрація",
      tagline: "Професійний моніторинг продуктивності",
      acceptPrefix: "Я приймаю",
      termsLink: "Умови використання",
      privacyPrefix: "Я погоджуюсь з",
      privacyLink: "Політикою конфіденційності",
      googleBtn: "Увійти через Google",
      authOr: "АБО",
      emailBtn: "Увійти через Email",
      emailPlaceholder: "Email",
      passwordPlaceholder: "Пароль (мін. 6 символів)",
      emailFinalBtn: "Увійти або створити акаунт",
      backBtn: "Назад",
      profileSetup: "Налаштування профілю",
      firstNamePlaceholder: "Ім'я",
      lastNamePlaceholder: "Прізвище",
      clubPlaceholder: "Клуб / Команда",
      countryUkraine: "Україна",
      countryGermany: "Німеччина",
      countryCyprus: "Кіпр",
      saveAndEnter: "Зберегти та увійти",

      errorTooMany: "Забагато спроб входу. Зачекай 5-10 хв і спробуй знову.",
      errorNetwork: "Помилка мережі. Перевір інтернет і спробуй ще раз.",
      errorUserDisabled: "Цей акаунт тимчасово вимкнено.",
      errorInvalidEmail: "Невірний формат email.",
      errorAuthGeneric: "Не вдалося увійти. Перевірте email і пароль та спробуйте ще раз.",
      enterEmail: "Введи email.",
      passwordMin: "Пароль має містити щонайменше 6 символів.",
      emailRegisteredGoogle: "Цей email зареєстрований через Google. Увійди кнопкою 'Увійти через Google'.",
      tooManyAgain: "Забагато спроб входу. Зачекай 5-10 хв і спробуй ще раз.",
      accountExistsResetQuestion: "Акаунт з цим email вже існує. Надіслати лист для скидання паролю?",
      resetSent: "Лист для скидання паролю надіслано на {email}. Після зміни паролю зайдіть з новим паролем. Якщо акаунт через Google - входьте через Google.",
      wrongPassword: "Пароль невірний. Спробуй інший пароль або скидання.",
      profileLoadFailed: "Ви увійшли в систему, але профіль не вдалося завантажити або зберегти. Це не проблема пароля. Спробуйте ще раз або зверніться в підтримку.",
      emailAlreadyRegistered: "Цей email вже зареєстрований. Спробуй увійти.",
      resendWait: "Зачекай {sec} с перед повторним надсиланням.",
      resendSent: "Лист надіслано!",
      verifyTitle: "Підтвердіть пошту",
      verifySentTo: "Ми надіслали лист на <b>{email}</b>.",
      verifyDone: "Я підтвердив, зайти",
      resendAgain: "Надіслати ще раз",
      sendVerification: "Надіслати лист підтвердження",
      verifyNotSent: "Ваша електронна адреса <b>{email}</b> ще не підтверджена.",
      verifyTooMany: "Забагато спроб підтвердження. Зачекайте та спробуйте пізніше.",
      verifySendFailed: "Не вдалося надіслати лист підтвердження. Спробуйте пізніше.",
      verifyNoSession: "Ваша сесія завершилася. Увійдіть знову, щоб замовити новий лист підтвердження.",
      selectOutcomeMin1: "Обери щонайменше 1 ціль",

      wizardTitle: "Швидке налаштування атлета",
      stepLabel: "Крок {step}/{total}",
      previousStep: "Попередній крок",
      nextStep: "Наступний крок",
      applyBaseline: "Застосувати базу",
      athleteFirstNamePlaceholder: "Ім'я атлета",
      athleteLastNamePlaceholder: "Прізвище атлета",
      athleteClubPlaceholder: "Клуб / Команда (необов'язково)",
      chooseSport: "Обери вид спорту",
      choosePosition: "Обери позицію",
      seasonPreseason: "Передсезонна фаза",
      seasonInseason: "Фаза сезону",
      seasonOffseason: "Міжсезоння",
      performanceFocusTitle: "Фокус продуктивності",
      performanceFocusHint: "Обери 1-2 фокусні напрями для плану.",
      selectedOutcomesCount: "Обрано цілей: {count}/2",
      notesPlaceholder: "Опційно: контекст травм або обмеження розкладу",
      heightPlaceholder: "Антропометрія: Зріст (см)",
      weightPlaceholder: "Антропометрія: Вага (кг)",
      baselineHint: "Ці дані ініціалізують базову модель. Пізніше можна змінити в Settings.",
      doneMark: "Готово",
      independentClub: "Без клубу",

      termsTitle: "Умови використання",
      termsUpdated: "Останнє оновлення: Січень 2026",
      termsP1: "<b>1. Загальні положення:</b> ProAthleteCare - це цифрова платформа для моніторингу фізичного стану атлетів. Використовуючи додаток, ви погоджуєтесь з цими умовами.",
      termsP2: "<b>2. Відмова від медичної відповідальності:</b> <span style='color:#FFC72C;'>ВАЖЛИВО:</span> Додаток не є медичним засобом. Аналітика стану базується на алгоритмах самоконтролю і не замінює лікаря.",
      termsP3: "<b>3. Використання сервісу:</b> Користувач несе повну відповідальність за правдивість даних та виконання тренувальних планів.",
      termsP4: "<b>4. Територіальна дія:</b> Проект керується законодавством Німеччини (BGB).",
      gdprTitle: "Політика конфіденційності (DSGVO)",
      gdprUpdated: "Згідно з вимогами ЄС щодо захисту даних",
      gdprP1: "<b>1. Відповідальний за дані:</b> Артем Кулик (ProAthleteCare). Контакт: proatletcare@gmail.com.",
      gdprP2: "<b>2. Збір даних:</b> Ми збираємо Email та дані про здоров'я, необхідні для роботи аналітики.",
      gdprP3: "<b>3. Технічна база:</b> Ваші дані шифруються та зберігаються на серверах Google Firebase у Європейському Союзі (Frankfurt, Germany).",
      gdprP4: "<b>4. Ваші права:</b> Ви маєте право на копію даних та повне видалення профілю (Право бути забутим)."
    },
    de: {
      pageTitle: "ProAthleteCare | Registrierung",
      tagline: "Professionelles Performance-Tracking",
      acceptPrefix: "Ich akzeptiere",
      termsLink: "Nutzungsbedingungen",
      privacyPrefix: "Ich stimme der",
      privacyLink: "Datenschutzerklärung zu",
      googleBtn: "Mit Google anmelden",
      authOr: "ODER",
      emailBtn: "Mit E-Mail anmelden",
      emailPlaceholder: "E-Mail",
      passwordPlaceholder: "Passwort (min. 6 Zeichen)",
      emailFinalBtn: "Anmelden oder Konto erstellen",
      backBtn: "Zurück",
      profileSetup: "Profil einrichten",
      firstNamePlaceholder: "Vorname",
      lastNamePlaceholder: "Nachname",
      clubPlaceholder: "Club / Team",
      countryUkraine: "Ukraine",
      countryGermany: "Deutschland",
      countryCyprus: "Zypern",
      saveAndEnter: "Speichern und starten",
      errorTooMany: "Zu viele Anmeldeversuche. Warte 5-10 Minuten und versuche es erneut.",
      errorNetwork: "Netzwerkfehler. Prüfe deine Verbindung und versuche es erneut.",
      errorUserDisabled: "Dieses Konto wurde vorübergehend deaktiviert.",
      errorInvalidEmail: "Ungültiges E-Mail-Format.",
      errorAuthGeneric: "Anmeldung fehlgeschlagen. Bitte pruefe E-Mail und Passwort und versuche es erneut.",
      enterEmail: "Bitte E-Mail eingeben.",
      passwordMin: "Passwort muss mindestens 6 Zeichen haben.",
      emailRegisteredGoogle: "Diese E-Mail ist mit Google registriert. Nutze 'Mit Google anmelden'.",
      tooManyAgain: "Zu viele Anmeldeversuche. Warte 5-10 Minuten und versuche es erneut.",
      accountExistsResetQuestion: "Ein Konto mit dieser E-Mail existiert bereits. Passwort-Reset-E-Mail senden?",
      resetSent: "Passwort-Reset-E-Mail wurde an {email} gesendet. Danach mit neuem Passwort anmelden. Bei Google-Konto bitte Google-Login nutzen.",
      wrongPassword: "Falsches Passwort. Versuche ein anderes oder setze es zurück.",
      profileLoadFailed: "Du bist angemeldet, aber dein Profil konnte nicht geladen oder gespeichert werden. Das ist kein Passwortproblem. Bitte versuche es erneut oder wende dich an den Support.",
      emailAlreadyRegistered: "Diese E-Mail ist bereits registriert. Bitte anmelden.",
      resendWait: "Bitte {sec}s warten, bevor du erneut sendest.",
      resendSent: "E-Mail gesendet!",
      verifyTitle: "E-Mail bestätigen",
      verifySentTo: "Wir haben eine E-Mail an <b>{email}</b> gesendet.",
      verifyDone: "Bestätigt, weiter",
      resendAgain: "Erneut senden",
      sendVerification: "Bestätigungs-E-Mail senden",
      verifyNotSent: "Deine E-Mail-Adresse <b>{email}</b> ist noch nicht bestätigt.",
      verifyTooMany: "Zu viele Bestätigungsversuche. Bitte warte und versuche es später erneut.",
      verifySendFailed: "Die Bestätigungs-E-Mail konnte nicht gesendet werden. Bitte versuche es später erneut.",
      verifyNoSession: "Deine Sitzung ist abgelaufen. Bitte melde dich erneut an, um eine neue Bestätigungs-E-Mail anzufordern.",
      selectOutcomeMin1: "Wähle mindestens 1 Ziel",
      wizardTitle: "Schnelles Athleten-Setup",
      stepLabel: "Schritt {step}/{total}",
      previousStep: "Vorheriger Schritt",
      nextStep: "Nächster Schritt",
      applyBaseline: "Baseline anwenden",
      athleteFirstNamePlaceholder: "Vorname des Athleten",
      athleteLastNamePlaceholder: "Nachname des Athleten",
      athleteClubPlaceholder: "Club / Team (optional)",
      chooseSport: "Sportart wählen",
      choosePosition: "Position wählen",
      seasonPreseason: "Vorsaison-Phase",
      seasonInseason: "Saison-Phase",
      seasonOffseason: "Nebensaison-Phase",
      performanceFocusTitle: "Leistungsfokus",
      performanceFocusHint: "Wähle 1-2 Fokusbereiche für deinen Plan.",
      selectedOutcomesCount: "Gewählte Ziele: {count}/2",
      notesPlaceholder: "Optional: Verletzungskontext oder Terminlimits",
      heightPlaceholder: "Anthropometrie: Größe (cm)",
      weightPlaceholder: "Anthropometrie: Gewicht (kg)",
      baselineHint: "Diese Werte initialisieren das Basismodell. Später in den Einstellungen änderbar.",
      doneMark: "Fertig",
      independentClub: "Unabhängig",
      termsTitle: "Nutzungsbedingungen",
      termsUpdated: "Letzte Aktualisierung: Januar 2026",
      termsP1: "<b>1. Allgemeine Bestimmungen:</b> ProAthleteCare ist eine digitale Plattform zur Überwachung des körperlichen Zustands von Athleten. Mit der Nutzung stimmst du diesen Bedingungen zu.",
      termsP2: "<b>2. Medizinischer Haftungsausschluss:</b> <span style='color:#FFC72C;'>WICHTIG:</span> Die App ist kein Medizinprodukt. Die Analytik basiert auf Selbstkontroll-Algorithmen und ersetzt keinen Arzt.",
      termsP3: "<b>3. Nutzung des Dienstes:</b> Nutzer sind vollständig verantwortlich für die Richtigkeit der Daten und die Ausführung der Trainingspläne.",
      termsP4: "<b>4. Geltendes Recht:</b> Das Projekt unterliegt deutschem Recht (BGB).",
      gdprTitle: "Datenschutzerklärung (DSGVO)",
      gdprUpdated: "Gemäß den EU-Anforderungen zum Datenschutz",
      gdprP1: "<b>1. Verantwortlicher:</b> Artem Kulyk (ProAthleteCare). Kontakt: proatletcare@gmail.com.",
      gdprP2: "<b>2. Datenerhebung:</b> Wir erfassen E-Mail und gesundheitsbezogene Eingaben, die für die Analytik notwendig sind.",
      gdprP3: "<b>3. Technische Basis:</b> Deine Daten werden verschlüsselt und auf Google-Firebase-Servern in der EU gespeichert (Frankfurt, Deutschland).",
      gdprP4: "<b>4. Deine Rechte:</b> Du hast das Recht auf Datenauskunft und vollständige Löschung des Profils (Recht auf Vergessenwerden)."
    },
    es: {
      pageTitle: "ProAthleteCare | Registro",
      tagline: "Seguimiento profesional del rendimiento",
      acceptPrefix: "Acepto",
      termsLink: "Términos de uso",
      privacyPrefix: "Estoy de acuerdo con la",
      privacyLink: "Política de privacidad",
      googleBtn: "Entrar con Google",
      authOr: "O",
      emailBtn: "Entrar con Email",
      emailPlaceholder: "Email",
      passwordPlaceholder: "Contraseña (mín. 6 caracteres)",
      emailFinalBtn: "Entrar o crear cuenta",
      backBtn: "Volver",
      profileSetup: "Configurar perfil",
      firstNamePlaceholder: "Nombre",
      lastNamePlaceholder: "Apellido",
      clubPlaceholder: "Club / Equipo",
      countryUkraine: "Ucrania",
      countryGermany: "Alemania",
      countryCyprus: "Chipre",
      saveAndEnter: "Guardar y entrar",

      errorTooMany: "Demasiados intentos de inicio de sesión. Espera 5-10 minutos e inténtalo de nuevo.",
      errorNetwork: "Error de red. Revisa tu internet e inténtalo otra vez.",
      errorUserDisabled: "Esta cuenta está temporalmente deshabilitada.",
      errorInvalidEmail: "Formato de email inválido.",
      errorAuthGeneric: "No se pudo iniciar sesion. Revisa tu email y contrasena e intentalo de nuevo.",
      enterEmail: "Introduce tu email.",
      passwordMin: "La contraseña debe tener al menos 6 caracteres.",
      emailRegisteredGoogle: "Este email está registrado con Google. Usa 'Entrar con Google'.",
      tooManyAgain: "Demasiados intentos de inicio de sesión. Espera 5-10 minutos e inténtalo de nuevo.",
      accountExistsResetQuestion: "Ya existe una cuenta con este email. ¿Enviar correo para restablecer la contraseña?",
      resetSent: "Se envió un correo de restablecimiento a {email}. Después del cambio, inicia sesión con tu nueva contraseña. Si la cuenta usa Google, entra con Google.",
      wrongPassword: "Contraseña incorrecta. Prueba otra contraseña o restablécela.",
      profileLoadFailed: "Has iniciado sesión, pero no se pudo cargar ni guardar tu perfil. No es un problema de contraseña. Inténtalo de nuevo o contacta con soporte si sigue igual.",
      emailAlreadyRegistered: "Este email ya está registrado. Intenta iniciar sesión.",
      resendWait: "Espera {sec}s antes de volver a enviar.",
      resendSent: "¡Correo enviado!",
      verifyTitle: "Confirma tu correo",
      verifySentTo: "Enviamos un correo a <b>{email}</b>.",
      verifyDone: "Ya confirmé, continuar",
      resendAgain: "Enviar otra vez",
      sendVerification: "Enviar correo de verificación",
      verifyNotSent: "Tu correo electrónico <b>{email}</b> aún no está verificado.",
      verifyTooMany: "Demasiados intentos de verificación. Espera e inténtalo de nuevo más tarde.",
      verifySendFailed: "No pudimos enviar el correo de verificación. Inténtalo de nuevo más tarde.",
      verifyNoSession: "Tu sesión ha caducado. Inicia sesión de nuevo para solicitar un nuevo correo de verificación.",
      selectOutcomeMin1: "Selecciona al menos 1 objetivo",

      wizardTitle: "Configuración rápida del atleta",
      stepLabel: "Paso {step}/{total}",
      previousStep: "Paso anterior",
      nextStep: "Siguiente paso",
      applyBaseline: "Aplicar base",
      athleteFirstNamePlaceholder: "Nombre del atleta",
      athleteLastNamePlaceholder: "Apellido del atleta",
      athleteClubPlaceholder: "Club / Equipo (opcional)",
      chooseSport: "Elige deporte",
      choosePosition: "Elige posición",
      seasonPreseason: "Fase de pretemporada",
      seasonInseason: "Fase de temporada",
      seasonOffseason: "Fase fuera de temporada",
      performanceFocusTitle: "Enfoque de rendimiento",
      performanceFocusHint: "Selecciona 1-2 áreas de enfoque para tu plan.",
      selectedOutcomesCount: "Objetivos seleccionados: {count}/2",
      notesPlaceholder: "Opcional: contexto de lesión o límites de agenda",
      heightPlaceholder: "Antropometría: altura (cm)",
      weightPlaceholder: "Antropometría: peso (kg)",
      baselineHint: "Estos datos inicializan el modelo base. Puedes actualizarlos luego en Settings.",
      doneMark: "Hecho",
      independentClub: "Independiente",

      termsTitle: "Términos de uso",
      termsUpdated: "Última actualización: Enero 2026",
      termsP1: "<b>1. Disposiciones generales:</b> ProAthleteCare es una plataforma digital para monitorear el estado físico de los atletas. Al usar la app, aceptas estos términos.",
      termsP2: "<b>2. Descargo de responsabilidad médica:</b> <span style='color:#FFC72C;'>IMPORTANTE:</span> La app no es un dispositivo médico. El análisis se basa en algoritmos de autocontrol y no sustituye a un médico.",
      termsP3: "<b>3. Uso del servicio:</b> El usuario asume total responsabilidad por la veracidad de los datos y la ejecución de los planes de entrenamiento.",
      termsP4: "<b>4. Legislación aplicable:</b> El proyecto se rige por la legislación alemana (BGB).",
      gdprTitle: "Política de privacidad (DSGVO)",
      gdprUpdated: "De acuerdo con los requisitos de protección de datos de la UE",
      gdprP1: "<b>1. Responsable de datos:</b> Artem Kulyk (ProAthleteCare). Contacto: proatletcare@gmail.com.",
      gdprP2: "<b>2. Recopilación de datos:</b> Recopilamos email y datos de salud necesarios para la funcionalidad analítica.",
      gdprP3: "<b>3. Base técnica:</b> Tus datos se cifran y se almacenan en servidores de Google Firebase en la Unión Europea (Frankfurt, Alemania).",
      gdprP4: "<b>4. Tus derechos:</b> Tienes derecho a copia de datos y eliminación completa del perfil (derecho al olvido)."
    },
    ru: {
      pageTitle: "ProAthleteCare | Регистрация",
      tagline: "Профессиональный мониторинг результативности",
      acceptPrefix: "Я принимаю",
      termsLink: "Условия использования",
      privacyPrefix: "Я согласен с",
      privacyLink: "Политикой конфиденциальности",
      googleBtn: "Войти через Google",
      authOr: "ИЛИ",
      emailBtn: "Войти по Email",
      emailPlaceholder: "Email",
      passwordPlaceholder: "Пароль (мин. 6 символов)",
      emailFinalBtn: "Войти или создать аккаунт",
      backBtn: "Назад",
      profileSetup: "Настройка профиля",
      firstNamePlaceholder: "Имя",
      lastNamePlaceholder: "Фамилия",
      clubPlaceholder: "Клуб / Команда",
      countryUkraine: "Украина",
      countryGermany: "Германия",
      countryCyprus: "Кипр",
      saveAndEnter: "Сохранить и войти",

      errorTooMany: "Слишком много попыток входа. Подождите 5-10 минут и попробуйте снова.",
      errorNetwork: "Ошибка сети. Проверьте интернет и попробуйте ещё раз.",
      errorUserDisabled: "Этот аккаунт временно отключён.",
      errorInvalidEmail: "Неверный формат email.",
      errorAuthGeneric: "Не удалось войти. Проверьте email и пароль и попробуйте снова.",
      enterEmail: "Введите email.",
      passwordMin: "Пароль должен содержать минимум 6 символов.",
      emailRegisteredGoogle: "Этот email зарегистрирован через Google. Используйте 'Войти через Google'.",
      tooManyAgain: "Слишком много попыток входа. Подождите 5-10 минут и попробуйте снова.",
      accountExistsResetQuestion: "Аккаунт с этим email уже существует. Отправить письмо для сброса пароля?",
      resetSent: "Письмо для сброса пароля отправлено на {email}. После смены пароля войдите с новым паролем. Если аккаунт через Google, входите через Google.",
      wrongPassword: "Неверный пароль. Попробуйте другой пароль или сброс.",
      profileLoadFailed: "Вы вошли в систему, но профиль не удалось загрузить или сохранить. Это не проблема с паролем. Попробуйте снова или обратитесь в поддержку.",
      emailAlreadyRegistered: "Этот email уже зарегистрирован. Попробуйте войти.",
      resendWait: "Подождите {sec} с перед повторной отправкой.",
      resendSent: "Письмо отправлено!",
      verifyTitle: "Подтвердите почту",
      verifySentTo: "Мы отправили письмо на <b>{email}</b>.",
      verifyDone: "Я подтвердил, продолжить",
      resendAgain: "Отправить ещё раз",
      sendVerification: "Отправить письмо подтверждения",
      verifyNotSent: "Ваш адрес электронной почты <b>{email}</b> ещё не подтверждён.",
      verifyTooMany: "Слишком много попыток подтверждения. Подождите и попробуйте позже.",
      verifySendFailed: "Не удалось отправить письмо подтверждения. Попробуйте позже.",
      verifyNoSession: "Ваша сессия завершена. Войдите снова, чтобы запросить новое письмо подтверждения.",
      selectOutcomeMin1: "Выберите минимум 1 цель",

      wizardTitle: "Быстрая настройка атлета",
      stepLabel: "Шаг {step}/{total}",
      previousStep: "Предыдущий шаг",
      nextStep: "Следующий шаг",
      applyBaseline: "Применить базу",
      athleteFirstNamePlaceholder: "Имя атлета",
      athleteLastNamePlaceholder: "Фамилия атлета",
      athleteClubPlaceholder: "Клуб / Команда (необязательно)",
      chooseSport: "Выберите вид спорта",
      choosePosition: "Выберите позицию",
      seasonPreseason: "Предсезонная фаза",
      seasonInseason: "Фаза сезона",
      seasonOffseason: "Межсезонная фаза",
      performanceFocusTitle: "Фокус производительности",
      performanceFocusHint: "Выберите 1-2 направления для вашего плана.",
      selectedOutcomesCount: "Выбрано целей: {count}/2",
      notesPlaceholder: "Опционально: контекст травмы или ограничения расписания",
      heightPlaceholder: "Антропометрия: рост (см)",
      weightPlaceholder: "Антропометрия: вес (кг)",
      baselineHint: "Эти данные инициализируют базовую модель. Позже можно изменить в Settings.",
      doneMark: "Готово",
      independentClub: "Без клуба",

      termsTitle: "Условия использования",
      termsUpdated: "Последнее обновление: Январь 2026",
      termsP1: "<b>1. Общие положения:</b> ProAthleteCare - это цифровая платформа для мониторинга физического состояния атлетов. Используя приложение, вы соглашаетесь с этими условиями.",
      termsP2: "<b>2. Отказ от медицинской ответственности:</b> <span style='color:#FFC72C;'>ВАЖНО:</span> Приложение не является медицинским изделием. Аналитика основана на алгоритмах самоконтроля и не заменяет врача.",
      termsP3: "<b>3. Использование сервиса:</b> Пользователь полностью несёт ответственность за достоверность данных и выполнение тренировочных планов.",
      termsP4: "<b>4. Применимое право:</b> Проект регулируется законодательством Германии (BGB).",
      gdprTitle: "Политика конфиденциальности (DSGVO)",
      gdprUpdated: "Согласно требованиям ЕС по защите данных",
      gdprP1: "<b>1. Ответственный за данные:</b> Artem Kulyk (ProAthleteCare). Контакт: proatletcare@gmail.com.",
      gdprP2: "<b>2. Сбор данных:</b> Мы собираем email и данные о здоровье, необходимые для аналитики.",
      gdprP3: "<b>3. Техническая база:</b> Ваши данные шифруются и хранятся на серверах Google Firebase в Европейском Союзе (Frankfurt, Germany).",
      gdprP4: "<b>4. Ваши права:</b> Вы имеете право на копию данных и полное удаление профиля (право быть забытым)."
    },
    pt: {
      pageTitle: "ProAthleteCare | Registro",
      tagline: "Monitoramento profissional de performance",
      acceptPrefix: "Eu aceito",
      termsLink: "Termos de uso",
      privacyPrefix: "Concordo com a",
      privacyLink: "Política de privacidade",
      googleBtn: "Entrar com Google",
      authOr: "OU",
      emailBtn: "Entrar por Email",
      emailPlaceholder: "Email",
      passwordPlaceholder: "Senha (mín. 6 caracteres)",
      emailFinalBtn: "Entrar ou criar conta",
      backBtn: "Voltar",
      profileSetup: "Configuração de perfil",
      firstNamePlaceholder: "Nome",
      lastNamePlaceholder: "Sobrenome",
      clubPlaceholder: "Clube / Equipe",
      countryUkraine: "Ucrânia",
      countryGermany: "Alemanha",
      countryCyprus: "Chipre",
      saveAndEnter: "Salvar e entrar",

      errorTooMany: "Muitas tentativas de login. Aguarde 5-10 minutos e tente novamente.",
      errorNetwork: "Erro de rede. Verifique sua internet e tente novamente.",
      errorUserDisabled: "Esta conta está temporariamente desativada.",
      errorInvalidEmail: "Formato de email inválido.",
      errorAuthGeneric: "Falha ao entrar. Verifique seu e-mail e senha e tente novamente.",
      enterEmail: "Digite seu email.",
      passwordMin: "A senha deve ter pelo menos 6 caracteres.",
      emailRegisteredGoogle: "Este email está registrado com Google. Use 'Entrar com Google'.",
      tooManyAgain: "Muitas tentativas de login. Aguarde 5-10 minutos e tente novamente.",
      accountExistsResetQuestion: "Já existe uma conta com este email. Enviar email para redefinir a senha?",
      resetSent: "Email de redefinição enviado para {email}. Depois da troca, entre com sua nova senha. Se a conta usa Google, entre com Google.",
      wrongPassword: "Senha incorreta. Tente outra senha ou redefina.",
      profileLoadFailed: "Você está autenticado, mas não foi possível carregar ou salvar seu perfil. Não é um problema de senha. Tente novamente ou fale com o suporte se continuar assim.",
      emailAlreadyRegistered: "Este email já está registrado. Tente entrar.",
      resendWait: "Aguarde {sec}s antes de reenviar.",
      resendSent: "Email enviado!",
      verifyTitle: "Confirme seu email",
      verifySentTo: "Enviamos um email para <b>{email}</b>.",
      verifyDone: "Já confirmei, continuar",
      resendAgain: "Enviar novamente",
      sendVerification: "Enviar e-mail de verificação",
      verifyNotSent: "Seu e-mail <b>{email}</b> ainda não foi verificado.",
      verifyTooMany: "Muitas tentativas de verificação. Aguarde e tente novamente mais tarde.",
      verifySendFailed: "Não foi possível enviar o e-mail de verificação. Tente novamente mais tarde.",
      verifyNoSession: "Sua sessão expirou. Entre novamente para solicitar um novo e-mail de verificação.",
      selectOutcomeMin1: "Selecione pelo menos 1 objetivo",

      wizardTitle: "Configuração rápida do atleta",
      stepLabel: "Etapa {step}/{total}",
      previousStep: "Etapa anterior",
      nextStep: "Próxima etapa",
      applyBaseline: "Aplicar base",
      athleteFirstNamePlaceholder: "Nome do atleta",
      athleteLastNamePlaceholder: "Sobrenome do atleta",
      athleteClubPlaceholder: "Clube / Equipe (opcional)",
      chooseSport: "Escolha o esporte",
      choosePosition: "Escolha a posição",
      seasonPreseason: "Fase de pré-temporada",
      seasonInseason: "Fase de temporada",
      seasonOffseason: "Fase de intertemporada",
      performanceFocusTitle: "Foco de performance",
      performanceFocusHint: "Selecione 1-2 áreas de foco para seu plano.",
      selectedOutcomesCount: "Objetivos selecionados: {count}/2",
      notesPlaceholder: "Opcional: contexto de lesão ou limites de agenda",
      heightPlaceholder: "Antropometria: altura (cm)",
      weightPlaceholder: "Antropometria: peso (kg)",
      baselineHint: "Esses dados inicializam o modelo base. Você pode atualizar depois em Settings.",
      doneMark: "Concluído",
      independentClub: "Independente",

      termsTitle: "Termos de uso",
      termsUpdated: "Última atualização: Janeiro 2026",
      termsP1: "<b>1. Disposições gerais:</b> ProAthleteCare é uma plataforma digital para monitorar o estado físico dos atletas. Ao usar o app, você concorda com estes termos.",
      termsP2: "<b>2. Isenção médica:</b> <span style='color:#FFC72C;'>IMPORTANTE:</span> O app não é um dispositivo médico. A análise é baseada em algoritmos de autocontrole e não substitui um médico.",
      termsP3: "<b>3. Uso do serviço:</b> O usuário assume total responsabilidade pela veracidade dos dados e execução dos planos de treino.",
      termsP4: "<b>4. Legislação aplicável:</b> O projeto é regido pela legislação da Alemanha (BGB).",
      gdprTitle: "Política de privacidade (DSGVO)",
      gdprUpdated: "De acordo com os requisitos da UE para proteção de dados",
      gdprP1: "<b>1. Controlador de dados:</b> Artem Kulyk (ProAthleteCare). Contato: proatletcare@gmail.com.",
      gdprP2: "<b>2. Coleta de dados:</b> Coletamos email e dados de saúde necessários para a funcionalidade analítica.",
      gdprP3: "<b>3. Base técnica:</b> Seus dados são criptografados e armazenados em servidores Google Firebase na União Europeia (Frankfurt, Alemanha).",
      gdprP4: "<b>4. Seus direitos:</b> Você tem direito à cópia dos dados e exclusão total do perfil (direito ao esquecimento)."
    }
  };

  // Keep all keys available for every language to avoid mixed/empty UI states.
  Object.keys(TEXT).forEach((lang) => {
    if (lang === "en") return;
    Object.keys(TEXT.en).forEach((key) => {
      if (!(key in TEXT[lang])) TEXT[lang][key] = TEXT.en[key];
    });
  });

  function formatText(text, vars) {
    let out = String(text ?? "");
    if (!vars) return out;
    Object.keys(vars).forEach((k) => {
      out = out.split(`{${k}}`).join(String(vars[k]));
    });
    return out;
  }

  function t(key, vars, langOverride) {
    const lang = normalizeLang(langOverride || detectLang());
    const dict = TEXT[lang] || TEXT.en;
    const value = dict[key] ?? TEXT.en[key] ?? key;
    return formatText(value, vars);
  }

  function applyStatic(root) {
    const scope = root && typeof root.querySelectorAll === "function" ? root : document;
    const lang = detectLang();
    if (document?.documentElement) document.documentElement.lang = lang;

    const pageTitle = document.getElementById("page-title");
    if (pageTitle) pageTitle.textContent = t("pageTitle", null, lang);

    scope.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (!key) return;
      el.textContent = t(key, null, lang);
    });

    scope.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      if (!key) return;
      el.setAttribute("placeholder", t(key, null, lang));
    });
  }

  function getLegalHtml(type, langOverride) {
    const lang = normalizeLang(langOverride || detectLang());
    const isGdpr = type === "gdpr";
    const title = isGdpr ? t("gdprTitle", null, lang) : t("termsTitle", null, lang);
    const subtitle = isGdpr ? t("gdprUpdated", null, lang) : t("termsUpdated", null, lang);
    const p1 = isGdpr ? t("gdprP1", null, lang) : t("termsP1", null, lang);
    const p2 = isGdpr ? t("gdprP2", null, lang) : t("termsP2", null, lang);
    const p3 = isGdpr ? t("gdprP3", null, lang) : t("termsP3", null, lang);
    const p4 = isGdpr ? t("gdprP4", null, lang) : t("termsP4", null, lang);
    return `
      <div style="border-left: 4px solid #FFC72C; padding-left: 15px; margin-bottom: 20px;">
        <h3 style="color:#FFC72C; text-transform: uppercase; margin: 0;">${title}</h3>
        <p style="color:#888; font-size:12px;">${subtitle}</p>
      </div>
      <div style="font-size:14px; color:#ccc; line-height:1.6; max-height: 300px; overflow-y: auto; padding-right: 10px;">
        <p>${p1}</p>
        <p>${p2}</p>
        <p>${p3}</p>
        <p>${p4}</p>
      </div>
    `;
  }

  window.PAC_REG_I18N = {
    supported: SUPPORTED.slice(),
    getLang: detectLang,
    t,
    applyStatic,
    getLegalHtml
  };
  window.__PAC_REG_I18N_LOADED__ = true;
})();
