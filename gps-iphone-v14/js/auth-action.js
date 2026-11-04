(function () {
  const PASS_MIN_LENGTH = 6;

  const I18N = {
    en: {
      brandSubtitle: "Account Security Center",
      securityNote: "Only secure account actions are processed on this page.",
      badgeVerify: "Email verification",
      badgeReset: "Password reset",
      badgeRecover: "Email recovery",
      badgeVerifyChange: "Verify email change",
      badgeRevertMfa: "Security recovery",
      badgeUnknown: "Secure email action",
      titleWorking: "Processing request...",
      subtitleWorking: "Please wait while we validate your secure link.",
      loading: "Loading...",
      invalidLinkTitle: "Invalid or incomplete link",
      invalidLinkBody: "This email action link is missing required data. Request a new email and try again.",
      verifyDoneTitle: "Email verified",
      verifyDoneBody: "Your email has been successfully verified. You can continue securely.",
      verifyDoneStatus: "Verification completed",
      recoverDoneTitle: "Email restored",
      recoverDoneBody: "The previous email address has been restored for your account.",
      recoverDoneStatus: "Recovery completed",
      verifyChangeDoneTitle: "New email confirmed",
      verifyChangeDoneBody: "The new email address has been verified and secured.",
      verifyChangeDoneStatus: "Email update completed",
      revertMfaDoneTitle: "Security recovery completed",
      revertMfaDoneBody: "Second-factor enrollment was reverted for this account.",
      revertMfaDoneStatus: "Security action completed",
      resetTitle: "Create a new password",
      resetBody: "Use a strong password with at least 6 characters.",
      resetReadyStatus: "Secure code verified. Set your new password.",
      resetEmailLabel: "Account:",
      newPassLabel: "New password",
      confirmPassLabel: "Confirm password",
      saveNewPassword: "Save new password",
      submittingReset: "Updating password...",
      passMismatch: "Passwords do not match.",
      passShort: "Password must be at least 6 characters.",
      toggleShow: "Show",
      toggleHide: "Hide",
      ruleLength: "Minimum 6 characters",
      ruleMatch: "Passwords match",
      strengthEmpty: "Start typing a password",
      strengthWeak: "Password strength: weak",
      strengthMedium: "Password strength: medium",
      strengthStrong: "Password strength: strong",
      resetSuccessTitle: "Password updated",
      resetSuccessBody: "Your password has been changed successfully. You can sign in with the new one.",
      resetSuccessStatus: "Password successfully changed",
      actionFailedTitle: "This link has expired",
      actionFailedBody: "For security reasons, please request a new email action link and try again.",
      actionFailedStatus: "Action failed",
      continueBtn: "Continue",
      backToLoginBtn: "Back to sign in",
      errExpired: "This action link has expired. Request a new one and try again.",
      errInvalid: "This action link is invalid or already used.",
      errUserDisabled: "This account is disabled. Contact support.",
      errUserNotFound: "This account no longer exists.",
      errWeakPassword: "Password is too weak. Add more complexity.",
      errTooManyRequests: "Too many attempts. Please wait and try again.",
      errDefault: "Unable to complete this request right now. Please try again."
    },
    uk: {
      brandSubtitle: "Центр безпеки акаунта",
      securityNote: "На цій сторінці обробляються лише захищені дії акаунта.",
      badgeVerify: "Підтвердження пошти",
      badgeReset: "Скидання пароля",
      badgeRecover: "Відновлення пошти",
      badgeVerifyChange: "Підтвердження зміни пошти",
      badgeRevertMfa: "Відновлення безпеки",
      badgeUnknown: "Захищена поштова дія",
      titleWorking: "Обробка запиту...",
      subtitleWorking: "Зачекай, ми перевіряємо безпечний лінк.",
      loading: "Завантаження...",
      invalidLinkTitle: "Некоректний або неповний лінк",
      invalidLinkBody: "У цьому листі бракує обов'язкових параметрів. Запроси новий лист і спробуй ще раз.",
      verifyDoneTitle: "Пошту підтверджено",
      verifyDoneBody: "Твою адресу електронної пошти успішно підтверджено. Можеш продовжувати.",
      verifyDoneStatus: "Підтвердження завершено",
      recoverDoneTitle: "Пошту відновлено",
      recoverDoneBody: "Попередню адресу електронної пошти успішно повернуто для цього акаунта.",
      recoverDoneStatus: "Відновлення завершено",
      verifyChangeDoneTitle: "Нову пошту підтверджено",
      verifyChangeDoneBody: "Нову адресу електронної пошти успішно підтверджено.",
      verifyChangeDoneStatus: "Оновлення пошти завершено",
      revertMfaDoneTitle: "Відновлення безпеки завершено",
      revertMfaDoneBody: "Додавання другого фактору було скасоване для цього акаунта.",
      revertMfaDoneStatus: "Безпекова дія завершена",
      resetTitle: "Створи новий пароль",
      resetBody: "Використай надійний пароль щонайменше з 6 символів.",
      resetReadyStatus: "Безпечний код перевірено. Встанови новий пароль.",
      resetEmailLabel: "Акаунт:",
      newPassLabel: "Новий пароль",
      confirmPassLabel: "Підтверди пароль",
      saveNewPassword: "Зберегти новий пароль",
      submittingReset: "Оновлюємо пароль...",
      passMismatch: "Паролі не співпадають.",
      passShort: "Пароль має містити щонайменше 6 символів.",
      toggleShow: "Показати",
      toggleHide: "Сховати",
      ruleLength: "Мінімум 6 символів",
      ruleMatch: "Паролі співпадають",
      strengthEmpty: "Почни вводити пароль",
      strengthWeak: "Сила пароля: слабка",
      strengthMedium: "Сила пароля: середня",
      strengthStrong: "Сила пароля: сильна",
      resetSuccessTitle: "Пароль оновлено",
      resetSuccessBody: "Пароль успішно змінено. Тепер увійди з новим паролем.",
      resetSuccessStatus: "Пароль успішно змінено",
      actionFailedTitle: "Термін дії лінка завершився",
      actionFailedBody: "З міркувань безпеки запроси новий лист і повтори дію.",
      actionFailedStatus: "Дія не виконана",
      continueBtn: "Продовжити",
      backToLoginBtn: "Назад до входу",
      errExpired: "Термін дії лінка завершився. Запроси новий і спробуй ще раз.",
      errInvalid: "Цей лінк недійсний або вже використаний.",
      errUserDisabled: "Цей акаунт вимкнений. Звернись у підтримку.",
      errUserNotFound: "Цей акаунт більше не існує.",
      errWeakPassword: "Пароль занадто слабкий. Додай складності.",
      errTooManyRequests: "Забагато спроб. Зачекай і спробуй ще раз.",
      errDefault: "Зараз не вдалося завершити дію. Спробуй ще раз."
    },
    de: {
      brandSubtitle: "Sicherheitscenter für Konto",
      securityNote: "Auf dieser Seite werden nur sichere Kontoaktionen verarbeitet.",
      badgeVerify: "E-Mail-Bestätigung",
      badgeReset: "Passwort zurücksetzen",
      badgeRecover: "E-Mail-Wiederherstellung",
      badgeVerifyChange: "E-Mail-Änderung bestätigen",
      badgeRevertMfa: "Sicherheitswiederherstellung",
      badgeUnknown: "Sichere E-Mail-Aktion",
      titleWorking: "Anfrage wird verarbeitet...",
      subtitleWorking: "Bitte warten, wir prüfen den sicheren Link.",
      loading: "Wird geladen...",
      invalidLinkTitle: "Ungültiger oder unvollständiger Link",
      invalidLinkBody: "In diesem Link fehlen erforderliche Daten. Bitte fordere eine neue E-Mail an.",
      verifyDoneTitle: "E-Mail bestätigt",
      verifyDoneBody: "Deine E-Mail wurde erfolgreich bestätigt.",
      verifyDoneStatus: "Bestätigung abgeschlossen",
      recoverDoneTitle: "E-Mail wiederhergestellt",
      recoverDoneBody: "Die vorherige E-Mail-Adresse wurde wiederhergestellt.",
      recoverDoneStatus: "Wiederherstellung abgeschlossen",
      verifyChangeDoneTitle: "Neue E-Mail bestätigt",
      verifyChangeDoneBody: "Die neue E-Mail-Adresse wurde erfolgreich bestätigt.",
      verifyChangeDoneStatus: "E-Mail-Update abgeschlossen",
      revertMfaDoneTitle: "Sicherheitswiederherstellung abgeschlossen",
      revertMfaDoneBody: "Die Einrichtung des zweiten Faktors wurde zurückgesetzt.",
      revertMfaDoneStatus: "Sicherheitsaktion abgeschlossen",
      resetTitle: "Neues Passwort erstellen",
      resetBody: "Verwende ein sicheres Passwort mit mindestens 6 Zeichen.",
      resetReadyStatus: "Sicherheitscode bestätigt. Lege dein neues Passwort fest.",
      resetEmailLabel: "Konto:",
      newPassLabel: "Neues Passwort",
      confirmPassLabel: "Passwort bestätigen",
      saveNewPassword: "Neues Passwort speichern",
      submittingReset: "Passwort wird aktualisiert...",
      passMismatch: "Passwörter stimmen nicht überein.",
      passShort: "Passwort muss mindestens 6 Zeichen lang sein.",
      toggleShow: "Anzeigen",
      toggleHide: "Verbergen",
      ruleLength: "Mindestens 6 Zeichen",
      ruleMatch: "Passwörter stimmen überein",
      strengthEmpty: "Beginne mit der Eingabe eines Passworts",
      strengthWeak: "Passwortstärke: schwach",
      strengthMedium: "Passwortstärke: mittel",
      strengthStrong: "Passwortstärke: stark",
      resetSuccessTitle: "Passwort aktualisiert",
      resetSuccessBody: "Dein Passwort wurde erfolgreich geändert.",
      resetSuccessStatus: "Passwort erfolgreich geändert",
      actionFailedTitle: "Dieser Link ist abgelaufen",
      actionFailedBody: "Fordere aus Sicherheitsgründen bitte eine neue E-Mail an.",
      actionFailedStatus: "Aktion fehlgeschlagen",
      continueBtn: "Weiter",
      backToLoginBtn: "Zur Anmeldung",
      errExpired: "Dieser Link ist abgelaufen. Bitte fordere einen neuen Link an.",
      errInvalid: "Dieser Link ist ungültig oder wurde bereits verwendet.",
      errUserDisabled: "Dieses Konto ist deaktiviert. Kontaktiere den Support.",
      errUserNotFound: "Dieses Konto existiert nicht mehr.",
      errWeakPassword: "Passwort ist zu schwach. Bitte stärkeres Passwort wählen.",
      errTooManyRequests: "Zu viele Versuche. Bitte warte kurz und versuche es erneut.",
      errDefault: "Die Aktion konnte gerade nicht abgeschlossen werden. Bitte erneut versuchen."
    },
    es: {
      brandSubtitle: "Centro de seguridad de cuenta",
      securityNote: "En esta página solo se procesan acciones seguras de cuenta.",
      badgeVerify: "Verificación de email",
      badgeReset: "Restablecer contraseña",
      badgeRecover: "Recuperación de email",
      badgeVerifyChange: "Verificar cambio de email",
      badgeRevertMfa: "Recuperación de seguridad",
      badgeUnknown: "Acción segura de email",
      titleWorking: "Procesando solicitud...",
      subtitleWorking: "Espera mientras validamos tu enlace seguro.",
      loading: "Cargando...",
      invalidLinkTitle: "Enlace inválido o incompleto",
      invalidLinkBody: "Este enlace no contiene todos los datos requeridos. Solicita un nuevo email.",
      verifyDoneTitle: "Email verificado",
      verifyDoneBody: "Tu correo fue verificado correctamente.",
      verifyDoneStatus: "Verificación completada",
      recoverDoneTitle: "Email restaurado",
      recoverDoneBody: "La dirección de correo anterior fue restaurada.",
      recoverDoneStatus: "Recuperación completada",
      verifyChangeDoneTitle: "Nuevo email confirmado",
      verifyChangeDoneBody: "La nueva dirección de email se verificó correctamente.",
      verifyChangeDoneStatus: "Actualización de email completada",
      revertMfaDoneTitle: "Recuperación de seguridad completada",
      revertMfaDoneBody: "Se revirtió la activación del segundo factor en esta cuenta.",
      revertMfaDoneStatus: "Acción de seguridad completada",
      resetTitle: "Crea una nueva contraseña",
      resetBody: "Usa una contraseña segura de al menos 6 caracteres.",
      resetReadyStatus: "Código seguro verificado. Define tu nueva contraseña.",
      resetEmailLabel: "Cuenta:",
      newPassLabel: "Nueva contraseña",
      confirmPassLabel: "Confirmar contraseña",
      saveNewPassword: "Guardar nueva contraseña",
      submittingReset: "Actualizando contraseña...",
      passMismatch: "Las contraseñas no coinciden.",
      passShort: "La contraseña debe tener al menos 6 caracteres.",
      toggleShow: "Mostrar",
      toggleHide: "Ocultar",
      ruleLength: "Mínimo 6 caracteres",
      ruleMatch: "Las contraseñas coinciden",
      strengthEmpty: "Empieza a escribir una contraseña",
      strengthWeak: "Seguridad de contraseña: débil",
      strengthMedium: "Seguridad de contraseña: media",
      strengthStrong: "Seguridad de contraseña: fuerte",
      resetSuccessTitle: "Contraseña actualizada",
      resetSuccessBody: "Tu contraseña se cambió correctamente.",
      resetSuccessStatus: "Contraseña cambiada",
      actionFailedTitle: "Este enlace ha expirado",
      actionFailedBody: "Por seguridad, solicita un nuevo email de acción.",
      actionFailedStatus: "Acción fallida",
      continueBtn: "Continuar",
      backToLoginBtn: "Volver al inicio",
      errExpired: "Este enlace ha expirado. Solicita uno nuevo e inténtalo otra vez.",
      errInvalid: "Este enlace no es válido o ya fue usado.",
      errUserDisabled: "Esta cuenta está deshabilitada. Contacta soporte.",
      errUserNotFound: "Esta cuenta ya no existe.",
      errWeakPassword: "La contraseña es débil. Hazla más segura.",
      errTooManyRequests: "Demasiados intentos. Espera y vuelve a intentarlo.",
      errDefault: "No se pudo completar la acción ahora. Inténtalo de nuevo."
    },
    ru: {
      brandSubtitle: "Центр безопасности аккаунта",
      securityNote: "На этой странице обрабатываются только защищенные действия аккаунта.",
      badgeVerify: "Подтверждение почты",
      badgeReset: "Сброс пароля",
      badgeRecover: "Восстановление почты",
      badgeVerifyChange: "Подтверждение смены почты",
      badgeRevertMfa: "Восстановление безопасности",
      badgeUnknown: "Безопасное почтовое действие",
      titleWorking: "Обрабатываем запрос...",
      subtitleWorking: "Подождите, мы проверяем безопасную ссылку.",
      loading: "Загрузка...",
      invalidLinkTitle: "Некорректная или неполная ссылка",
      invalidLinkBody: "В этой ссылке не хватает обязательных параметров. Запросите новое письмо.",
      verifyDoneTitle: "Почта подтверждена",
      verifyDoneBody: "Ваш адрес электронной почты успешно подтвержден.",
      verifyDoneStatus: "Подтверждение завершено",
      recoverDoneTitle: "Почта восстановлена",
      recoverDoneBody: "Предыдущий адрес электронной почты успешно восстановлен.",
      recoverDoneStatus: "Восстановление завершено",
      verifyChangeDoneTitle: "Новая почта подтверждена",
      verifyChangeDoneBody: "Новый адрес электронной почты успешно подтвержден.",
      verifyChangeDoneStatus: "Обновление почты завершено",
      revertMfaDoneTitle: "Восстановление безопасности завершено",
      revertMfaDoneBody: "Подключение второго фактора отменено для этого аккаунта.",
      revertMfaDoneStatus: "Действие безопасности завершено",
      resetTitle: "Создайте новый пароль",
      resetBody: "Используйте надежный пароль минимум из 6 символов.",
      resetReadyStatus: "Безопасный код подтвержден. Задайте новый пароль.",
      resetEmailLabel: "Аккаунт:",
      newPassLabel: "Новый пароль",
      confirmPassLabel: "Подтвердите пароль",
      saveNewPassword: "Сохранить новый пароль",
      submittingReset: "Обновляем пароль...",
      passMismatch: "Пароли не совпадают.",
      passShort: "Пароль должен быть не менее 6 символов.",
      toggleShow: "Показать",
      toggleHide: "Скрыть",
      ruleLength: "Минимум 6 символов",
      ruleMatch: "Пароли совпадают",
      strengthEmpty: "Начните вводить пароль",
      strengthWeak: "Сила пароля: слабая",
      strengthMedium: "Сила пароля: средняя",
      strengthStrong: "Сила пароля: сильная",
      resetSuccessTitle: "Пароль обновлен",
      resetSuccessBody: "Пароль успешно изменен.",
      resetSuccessStatus: "Пароль изменен",
      actionFailedTitle: "Срок действия ссылки истек",
      actionFailedBody: "Из соображений безопасности запросите новое письмо.",
      actionFailedStatus: "Действие не выполнено",
      continueBtn: "Продолжить",
      backToLoginBtn: "Назад ко входу",
      errExpired: "Срок действия ссылки истек. Запросите новую ссылку.",
      errInvalid: "Ссылка недействительна или уже использована.",
      errUserDisabled: "Аккаунт отключен. Обратитесь в поддержку.",
      errUserNotFound: "Этот аккаунт больше не существует.",
      errWeakPassword: "Пароль слишком слабый. Сделайте его сложнее.",
      errTooManyRequests: "Слишком много попыток. Подождите и попробуйте снова.",
      errDefault: "Сейчас не удалось завершить действие. Попробуйте еще раз."
    },
    pt: {
      brandSubtitle: "Centro de segurança da conta",
      securityNote: "Nesta página, apenas ações seguras da conta são processadas.",
      badgeVerify: "Verificação de email",
      badgeReset: "Redefinição de senha",
      badgeRecover: "Recuperação de email",
      badgeVerifyChange: "Verificar troca de email",
      badgeRevertMfa: "Recuperação de segurança",
      badgeUnknown: "Ação segura de email",
      titleWorking: "Processando solicitação...",
      subtitleWorking: "Aguarde enquanto validamos seu link seguro.",
      loading: "Carregando...",
      invalidLinkTitle: "Link inválido ou incompleto",
      invalidLinkBody: "Este link não contém todos os dados necessários. Solicite um novo email.",
      verifyDoneTitle: "Email verificado",
      verifyDoneBody: "Seu email foi verificado com sucesso.",
      verifyDoneStatus: "Verificação concluída",
      recoverDoneTitle: "Email restaurado",
      recoverDoneBody: "O email anterior foi restaurado com sucesso.",
      recoverDoneStatus: "Recuperação concluída",
      verifyChangeDoneTitle: "Novo email confirmado",
      verifyChangeDoneBody: "O novo endereço de email foi confirmado com sucesso.",
      verifyChangeDoneStatus: "Atualização de email concluída",
      revertMfaDoneTitle: "Recuperação de segurança concluída",
      revertMfaDoneBody: "A configuração do segundo fator foi revertida nesta conta.",
      revertMfaDoneStatus: "Ação de segurança concluída",
      resetTitle: "Crie uma nova senha",
      resetBody: "Use uma senha forte com pelo menos 6 caracteres.",
      resetReadyStatus: "Código seguro validado. Defina sua nova senha.",
      resetEmailLabel: "Conta:",
      newPassLabel: "Nova senha",
      confirmPassLabel: "Confirmar senha",
      saveNewPassword: "Salvar nova senha",
      submittingReset: "Atualizando senha...",
      passMismatch: "As senhas não coincidem.",
      passShort: "A senha deve ter pelo menos 6 caracteres.",
      toggleShow: "Mostrar",
      toggleHide: "Ocultar",
      ruleLength: "Mínimo de 6 caracteres",
      ruleMatch: "As senhas coincidem",
      strengthEmpty: "Comece a digitar uma senha",
      strengthWeak: "Força da senha: fraca",
      strengthMedium: "Força da senha: média",
      strengthStrong: "Força da senha: forte",
      resetSuccessTitle: "Senha atualizada",
      resetSuccessBody: "Sua senha foi alterada com sucesso.",
      resetSuccessStatus: "Senha alterada",
      actionFailedTitle: "Este link expirou",
      actionFailedBody: "Por segurança, solicite um novo email de ação.",
      actionFailedStatus: "Ação falhou",
      continueBtn: "Continuar",
      backToLoginBtn: "Voltar ao login",
      errExpired: "Este link expirou. Solicite um novo e tente novamente.",
      errInvalid: "Este link é inválido ou já foi usado.",
      errUserDisabled: "Esta conta está desativada. Contate o suporte.",
      errUserNotFound: "Esta conta não existe mais.",
      errWeakPassword: "Senha fraca demais. Deixe-a mais forte.",
      errTooManyRequests: "Muitas tentativas. Aguarde e tente novamente.",
      errDefault: "Não foi possível concluir a ação agora. Tente novamente."
    }
  };

  function normalizeLang(raw) {
    const value = String(raw || "").toLowerCase().trim();
    if (!value) return "en";
    if (value === "ua") return "uk";
    const short = value.slice(0, 2);
    return ["uk", "en", "de", "es", "ru", "pt"].includes(short) ? short : "en";
  }

  function rememberLang(value) {
    try {
      const next = normalizeLang(value);
      if (next) localStorage.setItem("pac_lang", next);
    } catch {}
  }

  function detectLang() {
    const qp = new URLSearchParams(window.location.search);

    // 1) Link language is explicit and should win (and be remembered).
    const rawQueryLang = qp.get("lang");
    if (rawQueryLang) {
      const fromQuery = normalizeLang(rawQueryLang);
      rememberLang(fromQuery);
      return fromQuery;
    }

    // 2) Then fall back to user-selected site language.
    try {
      const rawStored = localStorage.getItem("pac_lang");
      if (rawStored) return normalizeLang(rawStored);
    } catch {}

    // 3) Optional language from nested continue URL, if present.
    const nested = qp.get("continueUrl") || qp.get("next");
    if (nested) {
      try {
        const decoded = decodeURIComponent(String(nested));
        const nestedUrl = new URL(decoded, window.location.origin);
        const nestedLang = nestedUrl.searchParams.get("lang");
        if (nestedLang) {
          const fromNested = normalizeLang(nestedLang);
          rememberLang(fromNested);
          return fromNested;
        }
      } catch {}
    }

    // 4) Browser fallback.
    return normalizeLang(navigator.language || "en");
  }

  const lang = detectLang();
  document.documentElement.lang = lang;

  function t(key, vars) {
    const dict = I18N[lang] || I18N.en;
    let out = dict[key] || I18N.en[key] || key;
    if (!vars) return out;
    Object.keys(vars).forEach((k) => {
      out = out.split(`{${k}}`).join(String(vars[k]));
    });
    return out;
  }

  function el(id) {
    return document.getElementById(id);
  }

  function setStaticText() {
    if (el("aa-brand-subtitle")) el("aa-brand-subtitle").textContent = t("brandSubtitle");
    if (el("aa-security-note")) el("aa-security-note").textContent = t("securityNote");
    if (el("aa-rule-len")) el("aa-rule-len").textContent = t("ruleLength");
    if (el("aa-rule-match")) el("aa-rule-match").textContent = t("ruleMatch");
    if (el("aa-toggle-new-pass")) el("aa-toggle-new-pass").textContent = t("toggleShow");
    if (el("aa-toggle-confirm-pass")) el("aa-toggle-confirm-pass").textContent = t("toggleShow");
    if (el("aa-strength-text")) el("aa-strength-text").textContent = t("strengthEmpty");
  }

  function setMain(titleKey, subtitleKey, badgeKey) {
    if (el("aa-title")) el("aa-title").textContent = t(titleKey);
    if (el("aa-subtitle")) el("aa-subtitle").textContent = t(subtitleKey);
    if (el("aa-badge")) el("aa-badge").textContent = t(badgeKey);
  }

  function setStatus(text, kind, note) {
    const status = el("aa-status");
    const panel = el("aa-status-panel");
    if (!status || !panel) return;

    panel.classList.remove("is-loading", "is-ok", "is-error");
    status.className = "aa-status";

    if (kind === "ok") {
      panel.classList.add("is-ok");
      status.classList.add("status-ok");
    } else if (kind === "error") {
      panel.classList.add("is-error");
      status.classList.add("status-error");
    } else {
      panel.classList.add("is-loading");
      status.classList.add("loading");
    }

    status.textContent = text;
    if (el("aa-status-note")) el("aa-status-note").textContent = note || "";
  }

  function showActions(targetHref) {
    const actions = el("aa-actions");
    if (!actions) return;
    actions.classList.remove("hidden");

    const next = targetHref || "/ProAthleteCare-1/gps-iphone-v14/pages/regist.html";
    if (el("aa-continue")) {
      el("aa-continue").href = next;
      el("aa-continue").textContent = t("continueBtn");
    }
    if (el("aa-login")) {
      el("aa-login").href = "/ProAthleteCare-1/gps-iphone-v14/pages/regist.html";
      el("aa-login").textContent = t("backToLoginBtn");
    }
  }

  function safeContinueUrl(raw) {
    const fallback = "/ProAthleteCare-1/gps-iphone-v14/pages/regist.html";
    if (!raw) return fallback;

    try {
      const decoded = decodeURIComponent(String(raw));
      const absolute = new URL(decoded, window.location.origin);
      if (absolute.origin !== window.location.origin) return fallback;
      return `${absolute.pathname}${absolute.search}${absolute.hash}`;
    } catch {
      try {
        const absolute = new URL(String(raw), window.location.origin);
        if (absolute.origin !== window.location.origin) return fallback;
        return `${absolute.pathname}${absolute.search}${absolute.hash}`;
      } catch {
        return fallback;
      }
    }
  }

  function scorePassword(pass) {
    if (!pass) return { level: "empty", percent: 0 };

    let score = 0;
    if (pass.length >= PASS_MIN_LENGTH) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass) && /\d/.test(pass)) score += 1;
    if (/[^a-zA-Z0-9]/.test(pass)) score += 1;

    const percentByScore = [18, 38, 62, 82, 100];
    const percent = percentByScore[Math.min(score, 4)] || 0;

    if (score <= 1) return { level: "weak", percent };
    if (score <= 2) return { level: "medium", percent };
    return { level: "strong", percent };
  }

  function setStrengthUi() {
    const pass = String(el("aa-new-pass")?.value || "");
    const confirm = String(el("aa-confirm-pass")?.value || "");
    const strengthBar = el("aa-strength-fill")?.parentElement;
    const strengthFill = el("aa-strength-fill");
    const strengthText = el("aa-strength-text");
    const lenRule = el("aa-rule-len");
    const matchRule = el("aa-rule-match");

    const lengthOk = pass.length >= PASS_MIN_LENGTH;
    const matchOk = !!pass && pass === confirm;

    if (lenRule) lenRule.classList.toggle("is-ok", lengthOk);
    if (matchRule) matchRule.classList.toggle("is-ok", matchOk);

    const scored = scorePassword(pass);

    if (strengthBar) {
      strengthBar.classList.remove("weak", "medium", "strong");
      if (scored.level === "weak") strengthBar.classList.add("weak");
      if (scored.level === "medium") strengthBar.classList.add("medium");
      if (scored.level === "strong") strengthBar.classList.add("strong");
    }

    if (strengthFill) strengthFill.style.width = `${scored.percent}%`;
    if (!strengthText) return;

    if (scored.level === "empty") {
      strengthText.textContent = t("strengthEmpty");
      return;
    }
    if (scored.level === "weak") {
      strengthText.textContent = t("strengthWeak");
      return;
    }
    if (scored.level === "medium") {
      strengthText.textContent = t("strengthMedium");
      return;
    }
    strengthText.textContent = t("strengthStrong");
  }

  function applyErrorMessage(err) {
    switch (err?.code || "") {
      case "auth/expired-action-code":
        return t("errExpired");
      case "auth/invalid-action-code":
        return t("errInvalid");
      case "auth/user-disabled":
        return t("errUserDisabled");
      case "auth/user-not-found":
        return t("errUserNotFound");
      case "auth/weak-password":
        return t("errWeakPassword");
      case "auth/too-many-requests":
        return t("errTooManyRequests");
      default:
        return t("errDefault");
    }
  }

  function wirePassToggles() {
    const buttons = [el("aa-toggle-new-pass"), el("aa-toggle-confirm-pass")].filter(Boolean);
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetId = btn.getAttribute("data-target");
        const input = targetId ? el(targetId) : null;
        if (!input) return;
        const nextType = input.type === "password" ? "text" : "password";
        input.type = nextType;
        btn.textContent = nextType === "password" ? t("toggleShow") : t("toggleHide");
      });
    });
  }

  function wireStrengthInputs() {
    const passInput = el("aa-new-pass");
    const confirmInput = el("aa-confirm-pass");
    if (!passInput || !confirmInput) return;
    passInput.addEventListener("input", setStrengthUi);
    confirmInput.addEventListener("input", setStrengthUi);
    setStrengthUi();
  }

  async function handleApplyMode(auth, actionCode, continueUrl, cfg) {
    setMain("titleWorking", "subtitleWorking", cfg.badge);
    setStatus(t("loading"), "loading", "");
    await auth.applyActionCode(actionCode);
    setMain(cfg.doneTitle, cfg.doneBody, cfg.badge);
    setStatus(t(cfg.doneStatus), "ok", "");
    showActions(safeContinueUrl(continueUrl));
  }

  async function handleResetPassword(auth, actionCode, continueUrl) {
    setMain("resetTitle", "resetBody", "badgeReset");
    setStatus(t("loading"), "loading", "");

    const accountEmail = await auth.verifyPasswordResetCode(actionCode);
    setStatus(t("resetReadyStatus"), "ok", "");

    if (el("aa-reset-email")) el("aa-reset-email").textContent = `${t("resetEmailLabel")} ${accountEmail}`;
    if (el("aa-new-pass-label")) el("aa-new-pass-label").textContent = t("newPassLabel");
    if (el("aa-confirm-pass-label")) el("aa-confirm-pass-label").textContent = t("confirmPassLabel");
    if (el("aa-submit-reset")) el("aa-submit-reset").textContent = t("saveNewPassword");

    const form = el("aa-reset-form");
    const submitBtn = el("aa-submit-reset");
    const msg = el("aa-reset-msg");
    if (!form || !submitBtn) return;

    form.classList.remove("hidden");
    wirePassToggles();
    wireStrengthInputs();

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const pass = String(el("aa-new-pass")?.value || "");
      const pass2 = String(el("aa-confirm-pass")?.value || "");

      if (msg) {
        msg.textContent = "";
        msg.className = "aa-hint aa-reset-msg";
      }

      if (pass.length < PASS_MIN_LENGTH) {
        if (msg) {
          msg.textContent = t("passShort");
          msg.className = "status-error aa-reset-msg";
        }
        return;
      }

      if (pass !== pass2) {
        if (msg) {
          msg.textContent = t("passMismatch");
          msg.className = "status-error aa-reset-msg";
        }
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = t("submittingReset");

      try {
        await auth.confirmPasswordReset(actionCode, pass);
        setMain("resetSuccessTitle", "resetSuccessBody", "badgeReset");
        setStatus(t("resetSuccessStatus"), "ok", "");
        form.classList.add("hidden");
        showActions(safeContinueUrl(continueUrl));
      } catch (err) {
        if (msg) {
          msg.textContent = applyErrorMessage(err);
          msg.className = "status-error aa-reset-msg";
        }
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = t("saveNewPassword");
      }
    });
  }

  async function init() {
    setStaticText();

    const auth = window.auth || (window.firebase && window.firebase.auth && window.firebase.auth());
    if (!auth) return;
    try { auth.languageCode = lang; } catch {}

    const query = new URLSearchParams(window.location.search);
    const mode = String(query.get("mode") || "").trim();
    const actionCode = String(query.get("oobCode") || "").trim();
    const continueUrl = query.get("continueUrl") || query.get("next");

    setMain("titleWorking", "subtitleWorking", "badgeUnknown");
    setStatus(t("loading"), "loading", "");

    if (!mode || !actionCode) {
      setMain("invalidLinkTitle", "invalidLinkBody", "badgeUnknown");
      setStatus(t("actionFailedStatus"), "error", t("errInvalid"));
      showActions("/ProAthleteCare-1/gps-iphone-v14/pages/regist.html");
      return;
    }

    try {
      switch (mode) {
        case "verifyEmail":
          await handleApplyMode(auth, actionCode, continueUrl, {
            badge: "badgeVerify",
            doneTitle: "verifyDoneTitle",
            doneBody: "verifyDoneBody",
            doneStatus: "verifyDoneStatus"
          });
          break;
        case "resetPassword":
          await handleResetPassword(auth, actionCode, continueUrl);
          break;
        case "recoverEmail":
          await handleApplyMode(auth, actionCode, continueUrl, {
            badge: "badgeRecover",
            doneTitle: "recoverDoneTitle",
            doneBody: "recoverDoneBody",
            doneStatus: "recoverDoneStatus"
          });
          break;
        case "verifyAndChangeEmail":
          await handleApplyMode(auth, actionCode, continueUrl, {
            badge: "badgeVerifyChange",
            doneTitle: "verifyChangeDoneTitle",
            doneBody: "verifyChangeDoneBody",
            doneStatus: "verifyChangeDoneStatus"
          });
          break;
        case "revertSecondFactorAddition":
          await handleApplyMode(auth, actionCode, continueUrl, {
            badge: "badgeRevertMfa",
            doneTitle: "revertMfaDoneTitle",
            doneBody: "revertMfaDoneBody",
            doneStatus: "revertMfaDoneStatus"
          });
          break;
        default:
          setMain("invalidLinkTitle", "invalidLinkBody", "badgeUnknown");
          setStatus(t("actionFailedStatus"), "error", t("errInvalid"));
          showActions("/ProAthleteCare-1/gps-iphone-v14/pages/regist.html");
      }
    } catch (err) {
      console.error("auth-action error:", err);
      setMain("actionFailedTitle", "actionFailedBody", "badgeUnknown");
      setStatus(t("actionFailedStatus"), "error", applyErrorMessage(err));
      showActions("/ProAthleteCare-1/gps-iphone-v14/pages/regist.html");
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
