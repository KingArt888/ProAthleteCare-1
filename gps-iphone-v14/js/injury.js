// Constants and initialization
const INJURY_COLLECTION = 'injuries';
const RED_MARKER = '#DA3E52'; 
const GOLD_COLOR = '#FFC72C'; 

let injuries = [];
let currentUserId = null;
let selectedId = null; 
let activeLocationFilter = null; 
let painChartInstance = null;
let defaultInjurySubmitHandler = null;
let isDelegatedReadOnly = false;
let medicalDocs = [];

const MEDICAL_DOCS_LIMIT = 24;
const MEDICAL_DOC_MAX_SIZE = 25 * 1024 * 1024;
const MEDICAL_DOC_ALLOWED_EXT = ["pdf", "png", "jpg", "jpeg", "webp", "dcm", "dicom"];

const getToday = () => {const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
let injuryReadBlocked=true,injurySaving=false;
function canWriteInjury(){return !isDelegatedReadOnly&&!injuryReadBlocked&&currentUserId===firebase.auth().currentUser?.uid;}
function injuryReadStatus(failed){
  let host=document.getElementById('injury-read-status');if(!host){host=document.createElement('p');host.id='injury-read-status';document.getElementById('injury-form')?.before(host);}
  host.hidden=!failed;host.replaceChildren();host.setAttribute('role',failed?'alert':'status');
  if(failed){host.textContent=pacInjuryLang()==='uk'?'Не вдалося завантажити історію. Перевір з’єднання та повтори.':'Could not load injury history. Check your connection and retry.';const retry=document.createElement('button');retry.type='button';retry.textContent=pacInjuryLang()==='uk'?'Повторити':'Retry';retry.onclick=()=>{retry.disabled=true;loadInjuriesFromFirebase();};host.append(' ',retry);}
}

const INJURY_I18N = {
  uk: {
    title: "Injury Story | ProAthleteCare",
    headerTagline: "Професійний супровід атлета онлайн",
    pageTitle: "Injury Story: Журнал травм та відновлення",
    formTitle: "Локація травми та деталі",
    mapHint: "Клікніть на силует, щоб відмітити місце травми.",
    dateLabel: "Дата травми:",
    locationLabel: "Коротка назва (напр., розтягнення біцепса):",
    locationPlaceholder: "Гомілкостоп, коліно, плече",
    painLabel: "Шкала болю (0-10, де 0 - відсутність болю):",
    notesLabel: "Детальний опис (механізм, відчуття, лікування):",
    saveButton: "Записати / Оновити травму",
    chartTitle: "Динаміка відновлення (графік болю)",
    historyTitle: "Історія травм",
    reportDate: "Дата звіту:",
    exportPdf: "Експорт Injury Report (PDF)",
    exportJson: "Експорт моїх даних (JSON)",
    deleteData: "Видалити мої дані",
    emptyHint: "Клікніть на силует тіла, щоб додати травму",
    back: "Назад",
    painShort: "Біль",
    lastRecord: "Останній запис",
    newEntry: "Новий запис",
    deleteInjury: "Видалити всю травму",
    editOk: "Запис оновлено.",
    editErr: "Помилка оновлення.",
    saveErr: "Помилка збереження",
    deleteEntryAsk: "Видалити цей запис?",
    deleteFullAsk: "Видалити всю травму та історію?",
    notFound: "Травму не знайдено.",
    deleteErr: "Помилка видалення.",
    noUserId: "Немає userId.",
    exportErr: "Не вдалося експортувати дані.",
    deleteAllAsk: "Точно видалити всі Injury записи для цього користувача?",
    deleteAllOk: "Дані видалено.",
    deleteAllErr: "Не вдалося видалити дані.",
    chartDataset: "Біль",
    trendUp: "зростає",
    trendDown: "зменшується",
    trendFlat: "стабільно",
    unknownZone: "Інша зона",
    loading: "Завантаження...",
    accessDeniedAthlete: "Доступ до цього атлета заборонено.",
    choosePain010: "оберіть біль 0-10",
    editBtn: "Ред.",
    deleteBtn: "Вид.",
    pdfErrorPrefix: "Помилка PDF: ",
    athleteFallback: "Атлет",
    pdfTitle: "Звіт про динаміку болю",
    pdfLocationTitle: "Локація травми",
    pdfNameLabel: "Ім'я:",
    pdfLatestPainLabel: "Останній біль:",
    pdfTrend7DaysTitle: "Тренд болю за 7 днів",
    pdfMetricLatestPain: "Останній біль",
    pdfMetricAvg7Days: "Середнє за 7 днів",
    pdfMetricTrend: "Тренд",
    pdfRiskDateLabel: "Дата",
    pdfHistoryTitle: "Історія травм",
    pdfHistoryPainLabel: "Біль:"
  },
  en: {
    title: "Injury Story | ProAthleteCare",
    headerTagline: "Professional athlete support online",
    pageTitle: "Injury Story: Tracking and Recovery",
    formTitle: "Injury Location and Details",
    mapHint: "Tap body map to mark injury area.",
    dateLabel: "Injury date:",
    locationLabel: "Short name (example: hamstring strain):",
    locationPlaceholder: "Ankle, knee, shoulder",
    painLabel: "Pain scale (0-10, where 0 means no pain):",
    notesLabel: "Details (mechanism, feeling, treatment):",
    saveButton: "Save / Update injury",
    chartTitle: "Recovery trend (Pain chart)",
    historyTitle: "Injury history",
    reportDate: "Report date:",
    exportPdf: "Export Injury Report (PDF)",
    exportJson: "Export my data (JSON)",
    deleteData: "Delete my data",
    emptyHint: "Tap body marker to add first injury record",
    back: "Back",
    painShort: "Pain",
    lastRecord: "Last record",
    newEntry: "New entry",
    deleteInjury: "Delete full injury",
    editOk: "Entry updated.",
    editErr: "Update failed.",
    saveErr: "Save error",
    deleteEntryAsk: "Delete this entry?",
    deleteFullAsk: "Delete full injury and history?",
    notFound: "Injury not found.",
    deleteErr: "Delete failed.",
    noUserId: "No userId.",
    exportErr: "Export failed.",
    deleteAllAsk: "Delete all injury records for this user?",
    deleteAllOk: "Data deleted.",
    deleteAllErr: "Failed to delete data.",
    chartDataset: "Pain",
    trendUp: "increasing",
    trendDown: "decreasing",
    trendFlat: "stable",
    unknownZone: "Other zone",
    loading: "Loading...",
    accessDeniedAthlete: "Access denied for this athlete.",
    choosePain010: "choose pain 0-10",
    editBtn: "Edit",
    deleteBtn: "Del",
    pdfErrorPrefix: "PDF error: ",
    athleteFallback: "Athlete",
    pdfTitle: "Pain trend report",
    pdfLocationTitle: "Injury location",
    pdfNameLabel: "Name:",
    pdfLatestPainLabel: "Latest pain:",
    pdfTrend7DaysTitle: "Pain trend for 7 days",
    pdfMetricLatestPain: "Latest pain",
    pdfMetricAvg7Days: "Average for 7 days",
    pdfMetricTrend: "Trend",
    pdfRiskDateLabel: "Date",
    pdfHistoryTitle: "Injury history",
    pdfHistoryPainLabel: "Pain:"
  },
  de: {
    title: "Injury Story | ProAthleteCare",
    headerTagline: "Professionelle Athletenbetreuung online",
    pageTitle: "Injury Story: Verletzungs- und Reha-Tracking",
    formTitle: "Verletzungsstelle und Details",
    mapHint: "Klicke auf die Körperkarte, um die Verletzung zu markieren.",
    dateLabel: "Verletzungsdatum:",
    locationLabel: "Kurzer Name (z. B. Hamstring-Zerrung):",
    locationPlaceholder: "Knöchel, Knie, Schulter",
    painLabel: "Schmerzskala (0-10, 0 = kein Schmerz):",
    notesLabel: "Details (Mechanismus, Gefühl, Behandlung):",
    saveButton: "Verletzung speichern / aktualisieren",
    chartTitle: "Verlauf der Erholung (Schmerz-Chart)",
    historyTitle: "Verletzungshistorie",
    reportDate: "Berichtsdatum:",
    exportPdf: "Injury Report exportieren (PDF)",
    exportJson: "Meine Daten exportieren (JSON)",
    deleteData: "Meine Daten löschen",
    emptyHint: "Klicke auf die Körperkarte, um eine Verletzung hinzuzufügen",
    back: "Zurück",
    painShort: "Schmerz",
    lastRecord: "Letzter Eintrag",
    newEntry: "Neuer Eintrag",
    deleteInjury: "Gesamte Verletzung löschen",
    editOk: "Eintrag aktualisiert.",
    editErr: "Aktualisierung fehlgeschlagen.",
    saveErr: "Fehler beim Speichern",
    deleteEntryAsk: "Diesen Eintrag löschen?",
    deleteFullAsk: "Gesamte Verletzung inklusive Verlauf löschen?",
    notFound: "Verletzung nicht gefunden.",
    deleteErr: "Löschen fehlgeschlagen.",
    noUserId: "Keine userId.",
    exportErr: "Export fehlgeschlagen.",
    deleteAllAsk: "Alle Injury-Einträge dieses Nutzers löschen?",
    deleteAllOk: "Daten gelöscht.",
    deleteAllErr: "Daten konnten nicht gelöscht werden.",
    chartDataset: "Schmerz",
    trendUp: "steigend",
    trendDown: "sinkend",
    trendFlat: "stabil",
    unknownZone: "Andere Zone",
    loading: "Lädt...",
    accessDeniedAthlete: "Zugriff auf diesen Athleten verweigert.",
    choosePain010: "Schmerz 0-10 auswählen",
    editBtn: "Bearb.",
    deleteBtn: "Lösch.",
    pdfErrorPrefix: "PDF-Fehler: ",
    athleteFallback: "Athlet",
    pdfTitle: "Bericht zur Schmerzentwicklung",
    pdfLocationTitle: "Verletzungsstelle",
    pdfNameLabel: "Name:",
    pdfLatestPainLabel: "Letzter Schmerz:",
    pdfTrend7DaysTitle: "Schmerztrend der letzten 7 Tage",
    pdfMetricLatestPain: "Letzter Schmerz",
    pdfMetricAvg7Days: "Durchschnitt 7 Tage",
    pdfMetricTrend: "Trend",
    pdfRiskDateLabel: "Datum",
    pdfHistoryTitle: "Verletzungshistorie",
    pdfHistoryPainLabel: "Schmerz:"
  },
  es: {
    title: "Injury Story | ProAthleteCare",
    headerTagline: "Acompañamiento profesional del atleta online",
    pageTitle: "Injury Story: Seguimiento y recuperación",
    formTitle: "Zona de lesión y detalles",
    mapHint: "Haz clic en el cuerpo para marcar la zona de lesión.",
    dateLabel: "Fecha de la lesión:",
    locationLabel: "Nombre corto (ej.: tirón de isquios):",
    locationPlaceholder: "Tobillo, rodilla, hombro",
    painLabel: "Escala de dolor (0-10, 0 = sin dolor):",
    notesLabel: "Detalles (mecanismo, sensación, tratamiento):",
    saveButton: "Guardar / Actualizar lesión",
    chartTitle: "Evolución de recuperación (gráfico de dolor)",
    historyTitle: "Historial de lesiones",
    reportDate: "Fecha del reporte:",
    exportPdf: "Exportar Injury Report (PDF)",
    exportJson: "Exportar mis datos (JSON)",
    deleteData: "Eliminar mis datos",
    emptyHint: "Haz clic en el cuerpo para añadir una lesión",
    back: "Atrás",
    painShort: "Dolor",
    lastRecord: "Último registro",
    newEntry: "Nuevo registro",
    deleteInjury: "Eliminar lesión completa",
    editOk: "Registro actualizado.",
    editErr: "Error al actualizar.",
    saveErr: "Error al guardar",
    deleteEntryAsk: "¿Eliminar este registro?",
    deleteFullAsk: "¿Eliminar lesión completa e historial?",
    notFound: "Lesión no encontrada.",
    deleteErr: "Error al eliminar.",
    noUserId: "No hay userId.",
    exportErr: "No se pudo exportar.",
    deleteAllAsk: "¿Eliminar todos los registros Injury de este usuario?",
    deleteAllOk: "Datos eliminados.",
    deleteAllErr: "No se pudieron eliminar los datos.",
    chartDataset: "Dolor",
    trendUp: "subiendo",
    trendDown: "bajando",
    trendFlat: "estable",
    unknownZone: "Otra zona",
    loading: "Cargando...",
    accessDeniedAthlete: "Acceso denegado para este atleta.",
    choosePain010: "elige dolor 0-10",
    editBtn: "Editar",
    deleteBtn: "Borrar",
    pdfErrorPrefix: "Error de PDF: ",
    athleteFallback: "Atleta",
    pdfTitle: "Informe de tendencia de dolor",
    pdfLocationTitle: "Zona de lesión",
    pdfNameLabel: "Nombre:",
    pdfLatestPainLabel: "Dolor más reciente:",
    pdfTrend7DaysTitle: "Tendencia de dolor de 7 días",
    pdfMetricLatestPain: "Dolor más reciente",
    pdfMetricAvg7Days: "Promedio de 7 días",
    pdfMetricTrend: "Tendencia",
    pdfRiskDateLabel: "Fecha",
    pdfHistoryTitle: "Historial de lesiones",
    pdfHistoryPainLabel: "Dolor:"
  },
  ru: {
    title: "Injury Story | ProAthleteCare",
    headerTagline: "Профессиональное сопровождение атлета онлайн",
    pageTitle: "Injury Story: журнал травм и восстановления",
    formTitle: "Локация травмы и детали",
    mapHint: "Нажмите на силуэт, чтобы отметить место травмы.",
    dateLabel: "Дата травмы:",
    locationLabel: "Короткое название (например, растяжение бицепса):",
    locationPlaceholder: "Голеностоп, колено, плечо",
    painLabel: "Шкала боли (0-10, где 0 = нет боли):",
    notesLabel: "Детали (механизм, ощущения, лечение):",
    saveButton: "Сохранить / Обновить травму",
    chartTitle: "Динамика восстановления (график боли)",
    historyTitle: "История травм",
    reportDate: "Дата отчета:",
    exportPdf: "Экспорт Injury Report (PDF)",
    exportJson: "Экспорт моих данных (JSON)",
    deleteData: "Удалить мои данные",
    emptyHint: "Нажмите на силуэт, чтобы добавить травму",
    back: "Назад",
    painShort: "Боль",
    lastRecord: "Последняя запись",
    newEntry: "Новая запись",
    deleteInjury: "Удалить всю травму",
    editOk: "Запись обновлена.",
    editErr: "Ошибка обновления.",
    saveErr: "Ошибка сохранения",
    deleteEntryAsk: "Удалить эту запись?",
    deleteFullAsk: "Удалить всю травму и историю?",
    notFound: "Травма не найдена.",
    deleteErr: "Ошибка удаления.",
    noUserId: "Нет userId.",
    exportErr: "Не удалось экспортировать данные.",
    deleteAllAsk: "Удалить все Injury записи для этого пользователя?",
    deleteAllOk: "Данные удалены.",
    deleteAllErr: "Не удалось удалить данные.",
    chartDataset: "Боль",
    trendUp: "растет",
    trendDown: "снижается",
    trendFlat: "стабильно",
    unknownZone: "Другая зона",
    loading: "Загрузка...",
    accessDeniedAthlete: "Доступ к этому атлету запрещен.",
    choosePain010: "выберите боль 0-10",
    editBtn: "Ред.",
    deleteBtn: "Удал.",
    pdfErrorPrefix: "Ошибка PDF: ",
    athleteFallback: "Атлет",
    pdfTitle: "Отчет по динамике боли",
    pdfLocationTitle: "Локация травмы",
    pdfNameLabel: "Имя:",
    pdfLatestPainLabel: "Последняя боль:",
    pdfTrend7DaysTitle: "Тренд боли за 7 дней",
    pdfMetricLatestPain: "Последняя боль",
    pdfMetricAvg7Days: "Среднее за 7 дней",
    pdfMetricTrend: "Тренд",
    pdfRiskDateLabel: "Дата",
    pdfHistoryTitle: "История травм",
    pdfHistoryPainLabel: "Боль:"
  },
  pt: {
    title: "Injury Story | ProAthleteCare",
    headerTagline: "Acompanhamento profissional do atleta online",
    pageTitle: "Injury Story: histórico de lesão e recuperação",
    formTitle: "Local da lesão e detalhes",
    mapHint: "Clique no corpo para marcar a área da lesão.",
    dateLabel: "Data da lesão:",
    locationLabel: "Nome curto (ex.: distensão de isquiotibiais):",
    locationPlaceholder: "Tornozelo, joelho, ombro",
    painLabel: "Escala de dor (0-10, 0 = sem dor):",
    notesLabel: "Detalhes (mecanismo, sensação, tratamento):",
    saveButton: "Salvar / Atualizar lesão",
    chartTitle: "Evolução da recuperação (gráfico de dor)",
    historyTitle: "Histórico de lesões",
    reportDate: "Data do relatório:",
    exportPdf: "Exportar Injury Report (PDF)",
    exportJson: "Exportar meus dados (JSON)",
    deleteData: "Excluir meus dados",
    emptyHint: "Clique no corpo para adicionar uma lesão",
    back: "Voltar",
    painShort: "Dor",
    lastRecord: "Último registro",
    newEntry: "Novo registro",
    deleteInjury: "Excluir lesão completa",
    editOk: "Registro atualizado.",
    editErr: "Falha ao atualizar.",
    saveErr: "Erro ao salvar",
    deleteEntryAsk: "Excluir este registro?",
    deleteFullAsk: "Excluir lesão completa e histórico?",
    notFound: "Lesão não encontrada.",
    deleteErr: "Erro ao excluir.",
    noUserId: "Sem userId.",
    exportErr: "Falha ao exportar.",
    deleteAllAsk: "Excluir todos os registros Injury deste usuário?",
    deleteAllOk: "Dados excluídos.",
    deleteAllErr: "Não foi possível excluir os dados.",
    chartDataset: "Dor",
    trendUp: "aumentando",
    trendDown: "diminuindo",
    trendFlat: "estável",
    unknownZone: "Outra zona",
    loading: "Carregando...",
    accessDeniedAthlete: "Acesso negado para este atleta.",
    choosePain010: "escolha dor 0-10",
    editBtn: "Editar",
    deleteBtn: "Excluir",
    pdfErrorPrefix: "Erro de PDF: ",
    athleteFallback: "Atleta",
    pdfTitle: "Relatório de tendência de dor",
    pdfLocationTitle: "Local da lesão",
    pdfNameLabel: "Nome:",
    pdfLatestPainLabel: "Dor mais recente:",
    pdfTrend7DaysTitle: "Tendência de dor em 7 dias",
    pdfMetricLatestPain: "Dor mais recente",
    pdfMetricAvg7Days: "Média de 7 dias",
    pdfMetricTrend: "Tendência",
    pdfRiskDateLabel: "Data",
    pdfHistoryTitle: "Histórico de lesões",
    pdfHistoryPainLabel: "Dor:"
  }
};

const INJURY_VAULT_I18N = {
  uk: {
    vaultTitle: "Сховище медичних документів",
    vaultSubtitle: "Завантажуйте MRI / X-ray файли для тренера та командного лікаря.",
    vaultTypeLabel: "Тип документа",
    vaultNameLabel: "Назва документа",
    vaultNotesLabel: "Нотатка (опційно)",
    vaultFileLabel: "Обрати файл",
    vaultConsentText: "Я надаю згоду на обробку моїх медичних файлів для спортивного супроводу.",
    vaultDisclaimer: "Платформа лише зберігає файли. Діагноз чи лікування не надається.",
    vaultUploadBtn: "Завантажити документ",
    vaultEmpty: "Поки немає завантажених документів.",
    vaultOpen: "Відкрити",
    vaultDelete: "Видалити",
    vaultDeleteAsk: "Видалити цей документ?",
    vaultNoConsent: "Підтвердьте згоду на обробку медичних даних.",
    vaultNoFile: "Оберіть файл для завантаження.",
    vaultTooLarge: "Файл занадто великий. Максимум 25MB.",
    vaultUnsupported: "Непідтримуваний тип файлу. Дозволено: PDF, JPG, PNG, WEBP, DCM.",
    vaultUploaded: "Документ успішно завантажено.",
    vaultUploadFailed: "Не вдалося завантажити документ.",
    vaultReadOnly: "Режим лише читання: перегляд делегованого атлета.",
    vaultUploadInProgress: "Завантаження...",
    vaultTypeMRI: "MRI",
    vaultTypeXray: "X-ray",
    vaultTypeCT: "CT",
    vaultTypeUS: "Ultrasound",
    vaultTypeOther: "Інше",
    vaultUploadedAt: "Завантажено",
    vaultBy: "Ким",
    vaultStorageMissing: "Storage недоступний (window.storage).",
    vaultMaxReached: "Ліміт документів досягнуто. Видаліть старі файли перед новим завантаженням.",
    vaultAddData: "Додати дані",
    vaultModalTitle: "Додати медичний документ",
    vaultCloseAria: "Закрити"
  },
  en: {
    vaultTitle: "Medical Documents Vault",
    vaultSubtitle: "Upload MRI / X-ray files for your coach and team doctor.",
    vaultTypeLabel: "Document type",
    vaultNameLabel: "Document name",
    vaultNotesLabel: "Notes (optional)",
    vaultFileLabel: "Choose file",
    vaultConsentText: "I consent to processing of my health files for training support.",
    vaultDisclaimer: "Platform stores files only. No diagnosis or treatment is provided.",
    vaultUploadBtn: "Upload document",
    vaultEmpty: "No uploaded documents yet.",
    vaultOpen: "Open",
    vaultDelete: "Delete",
    vaultDeleteAsk: "Delete this document?",
    vaultNoConsent: "Please confirm consent for processing health data.",
    vaultNoFile: "Please choose a file to upload.",
    vaultTooLarge: "File is too large. Max size is 25MB.",
    vaultUnsupported: "Unsupported file type. Allowed: PDF, JPG, PNG, WEBP, DCM.",
    vaultUploaded: "Document uploaded.",
    vaultUploadFailed: "Document upload failed.",
    vaultReadOnly: "Read-only mode: viewing delegated athlete.",
    vaultUploadInProgress: "Uploading...",
    vaultTypeMRI: "MRI",
    vaultTypeXray: "X-ray",
    vaultTypeCT: "CT",
    vaultTypeUS: "Ultrasound",
    vaultTypeOther: "Other",
    vaultUploadedAt: "Uploaded",
    vaultBy: "By",
    vaultStorageMissing: "Storage is not available (window.storage).",
    vaultMaxReached: "Document limit reached. Remove old files before uploading a new one.",
    vaultAddData: "Add data",
    vaultModalTitle: "Add medical document",
    vaultCloseAria: "Close"
  },
  de: {
    vaultTitle: "Ablage medizinischer Dokumente",
    vaultSubtitle: "Laden Sie MRI-/Röntgen-Dateien für Trainer und Teamarzt hoch.",
    vaultTypeLabel: "Dokumenttyp",
    vaultNameLabel: "Dokumentname",
    vaultNotesLabel: "Notiz (optional)",
    vaultFileLabel: "Datei wählen",
    vaultConsentText: "Ich stimme der Verarbeitung meiner Gesundheitsdateien zur Trainingsbetreuung zu.",
    vaultDisclaimer: "Die Plattform speichert nur Dateien. Keine Diagnose oder Behandlung.",
    vaultUploadBtn: "Dokument hochladen",
    vaultEmpty: "Noch keine Dokumente hochgeladen.",
    vaultOpen: "Öffnen",
    vaultDelete: "Löschen",
    vaultDeleteAsk: "Dieses Dokument löschen?",
    vaultNoConsent: "Bitte Zustimmung zur Verarbeitung von Gesundheitsdaten bestätigen.",
    vaultNoFile: "Bitte Datei zum Hochladen wählen.",
    vaultTooLarge: "Datei zu groß. Maximal 25MB.",
    vaultUnsupported: "Dateityp nicht unterstützt. Erlaubt: PDF, JPG, PNG, WEBP, DCM.",
    vaultUploaded: "Dokument hochgeladen.",
    vaultUploadFailed: "Upload fehlgeschlagen.",
    vaultReadOnly: "Nur-Lese-Modus: Delegierter Athlet wird angezeigt.",
    vaultUploadInProgress: "Wird hochgeladen...",
    vaultTypeMRI: "MRI",
    vaultTypeXray: "Röntgen",
    vaultTypeCT: "CT",
    vaultTypeUS: "Ultraschall",
    vaultTypeOther: "Andere",
    vaultUploadedAt: "Hochgeladen",
    vaultBy: "Von",
    vaultStorageMissing: "Storage ist nicht verfügbar (window.storage).",
    vaultMaxReached: "Dokumentenlimit erreicht. Entfernen Sie alte Dateien vor neuem Upload.",
    vaultAddData: "Daten hinzufügen",
    vaultModalTitle: "Medizinisches Dokument hinzufügen",
    vaultCloseAria: "Schließen"
  },
  es: {
    vaultTitle: "Archivo de documentos médicos",
    vaultSubtitle: "Sube archivos de MRI / rayos X para tu entrenador y médico.",
    vaultTypeLabel: "Tipo de documento",
    vaultNameLabel: "Nombre del documento",
    vaultNotesLabel: "Notas (opcional)",
    vaultFileLabel: "Elegir archivo",
    vaultConsentText: "Consiento el tratamiento de mis archivos de salud para soporte deportivo.",
    vaultDisclaimer: "La plataforma solo almacena archivos. No da diagnóstico ni tratamiento.",
    vaultUploadBtn: "Subir documento",
    vaultEmpty: "Todavía no hay documentos subidos.",
    vaultOpen: "Abrir",
    vaultDelete: "Eliminar",
    vaultDeleteAsk: "¿Eliminar este documento?",
    vaultNoConsent: "Confirma el consentimiento para tratar datos de salud.",
    vaultNoFile: "Selecciona un archivo para subir.",
    vaultTooLarge: "Archivo demasiado grande. Máximo 25MB.",
    vaultUnsupported: "Tipo no soportado. Permitidos: PDF, JPG, PNG, WEBP, DCM.",
    vaultUploaded: "Documento subido.",
    vaultUploadFailed: "Error al subir documento.",
    vaultReadOnly: "Modo solo lectura: viendo atleta delegado.",
    vaultUploadInProgress: "Subiendo...",
    vaultTypeMRI: "MRI",
    vaultTypeXray: "Rayos X",
    vaultTypeCT: "CT",
    vaultTypeUS: "Ultrasonido",
    vaultTypeOther: "Otro",
    vaultUploadedAt: "Subido",
    vaultBy: "Por",
    vaultStorageMissing: "Storage no disponible (window.storage).",
    vaultMaxReached: "Límite de documentos alcanzado. Elimina archivos antiguos para subir uno nuevo.",
    vaultAddData: "Añadir datos",
    vaultModalTitle: "Añadir documento médico",
    vaultCloseAria: "Cerrar"
  },
  ru: {
    vaultTitle: "Хранилище медицинских документов",
    vaultSubtitle: "Загружайте MRI / рентген-файлы для тренера и командного врача.",
    vaultTypeLabel: "Тип документа",
    vaultNameLabel: "Название документа",
    vaultNotesLabel: "Заметка (опционально)",
    vaultFileLabel: "Выбрать файл",
    vaultConsentText: "Я даю согласие на обработку моих медицинских файлов для спортивного сопровождения.",
    vaultDisclaimer: "Платформа только хранит файлы. Диагноз или лечение не предоставляется.",
    vaultUploadBtn: "Загрузить документ",
    vaultEmpty: "Пока нет загруженных документов.",
    vaultOpen: "Открыть",
    vaultDelete: "Удалить",
    vaultDeleteAsk: "Удалить этот документ?",
    vaultNoConsent: "Подтвердите согласие на обработку медицинских данных.",
    vaultNoFile: "Выберите файл для загрузки.",
    vaultTooLarge: "Файл слишком большой. Максимум 25MB.",
    vaultUnsupported: "Неподдерживаемый тип файла. Разрешено: PDF, JPG, PNG, WEBP, DCM.",
    vaultUploaded: "Документ успешно загружен.",
    vaultUploadFailed: "Не удалось загрузить документ.",
    vaultReadOnly: "Режим только чтения: просмотр делегированного атлета.",
    vaultUploadInProgress: "Загрузка...",
    vaultTypeMRI: "MRI",
    vaultTypeXray: "Рентген",
    vaultTypeCT: "CT",
    vaultTypeUS: "УЗИ",
    vaultTypeOther: "Другое",
    vaultUploadedAt: "Загружено",
    vaultBy: "Кем",
    vaultStorageMissing: "Storage недоступен (window.storage).",
    vaultMaxReached: "Лимит документов достигнут. Удалите старые файлы перед новой загрузкой.",
    vaultAddData: "Добавить данные",
    vaultModalTitle: "Добавить медицинский документ",
    vaultCloseAria: "Закрыть"
  },
  pt: {
    vaultTitle: "Arquivo de documentos médicos",
    vaultSubtitle: "Envie arquivos de MRI / raio-X para treinador e médico da equipe.",
    vaultTypeLabel: "Tipo de documento",
    vaultNameLabel: "Nome do documento",
    vaultNotesLabel: "Notas (opcional)",
    vaultFileLabel: "Escolher arquivo",
    vaultConsentText: "Concordo com o processamento dos meus arquivos de saúde para suporte esportivo.",
    vaultDisclaimer: "A plataforma apenas armazena arquivos. Não fornece diagnóstico ou tratamento.",
    vaultUploadBtn: "Enviar documento",
    vaultEmpty: "Ainda não há documentos enviados.",
    vaultOpen: "Abrir",
    vaultDelete: "Excluir",
    vaultDeleteAsk: "Excluir este documento?",
    vaultNoConsent: "Confirme o consentimento para processar dados de saúde.",
    vaultNoFile: "Escolha um arquivo para enviar.",
    vaultTooLarge: "Arquivo muito grande. Máximo de 25MB.",
    vaultUnsupported: "Tipo de arquivo não suportado. Permitido: PDF, JPG, PNG, WEBP, DCM.",
    vaultUploaded: "Documento enviado.",
    vaultUploadFailed: "Falha ao enviar documento.",
    vaultReadOnly: "Modo somente leitura: visualizando atleta delegado.",
    vaultUploadInProgress: "Enviando...",
    vaultTypeMRI: "MRI",
    vaultTypeXray: "Raio-X",
    vaultTypeCT: "CT",
    vaultTypeUS: "Ultrassom",
    vaultTypeOther: "Outro",
    vaultUploadedAt: "Enviado",
    vaultBy: "Por",
    vaultStorageMissing: "Storage indisponível (window.storage).",
    vaultMaxReached: "Limite de documentos atingido. Remova arquivos antigos antes de novo envio.",
    vaultAddData: "Adicionar dados",
    vaultModalTitle: "Adicionar documento médico",
    vaultCloseAria: "Fechar"
  }
};

Object.keys(INJURY_VAULT_I18N).forEach((lang) => {
  if (INJURY_I18N[lang]) Object.assign(INJURY_I18N[lang], INJURY_VAULT_I18N[lang]);
});

function pacInjuryLang() {
  const raw = (localStorage.getItem("pac_lang") || "uk").toLowerCase();
  return INJURY_I18N[raw] ? raw : "uk";
}

function ti(key) {
  const lang = pacInjuryLang();
  return INJURY_I18N[lang]?.[key] ?? INJURY_I18N.uk[key] ?? key;
}

function setText(selector, text) {
  const el = document.querySelector(selector);
  if (el) el.textContent = text;
}

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatBytes(bytes) {
  const n = Number(bytes || 0);
  if (!Number.isFinite(n) || n <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let val = n;
  let idx = 0;
  while (val >= 1024 && idx < units.length - 1) {
    val /= 1024;
    idx += 1;
  }
  return `${val.toFixed(val >= 10 || idx === 0 ? 0 : 1)} ${units[idx]}`;
}

function formatDocDate(ts) {
  const n = Number(ts || 0);
  if (!Number.isFinite(n) || n <= 0) return "—";
  try {
    return new Date(n).toLocaleString();
  } catch (_) {
    return "—";
  }
}

function safeDownloadUrl(url) {
  const v = String(url || "").trim();
  try {
    const parsed = new URL(v);
    return parsed.protocol === "https:" ? parsed.href : "";
  } catch (_) {
    return "";
  }
}

function sanitizeFileName(name) {
  return String(name || "file")
    .replace(/[^\w.\-()\s]/g, "_")
    .replace(/\s+/g, "_")
    .slice(0, 120);
}

function extOf(name) {
  const m = String(name || "").toLowerCase().match(/\.([a-z0-9]+)$/);
  return m ? m[1] : "";
}

function getVaultTypeLabel(type) {
  const t = String(type || "other").toLowerCase();
  if (t === "mri") return ti("vaultTypeMRI");
  if (t === "xray") return ti("vaultTypeXray");
  if (t === "ct") return ti("vaultTypeCT");
  if (t === "us") return ti("vaultTypeUS");
  return ti("vaultTypeOther");
}

function injuryStorage() {
  return window.storage || (typeof firebase.storage === "function" ? firebase.storage() : null);
}

function getActiveInjuryId() {
  const raw = String(activeLocationFilter || "").trim();
  return raw || null;
}

function getActiveInjury() {
  const injuryId = getActiveInjuryId();
  if (!injuryId) return null;
  return injuries.find((i) => String(i?.id || "") === injuryId) || null;
}

function vaultSelectInjuryText() {
  const lang = pacInjuryLang();
  const map = {
    uk: "Оберіть травму, щоб переглянути MRI/X-ray файли.",
    en: "Select an injury to view MRI/X-ray files.",
    de: "Wähle eine Verletzung aus, um MRI/Röntgen-Dateien zu sehen.",
    es: "Selecciona una lesión para ver archivos de MRI/rayos X.",
    ru: "Выберите травму, чтобы посмотреть MRI/рентген-файлы.",
    pt: "Selecione uma lesão para ver arquivos de MRI/raio-X."
  };
  return map[lang] || map.en;
}

function vaultInjuryContextPrefixText() {
  const lang = pacInjuryLang();
  const map = {
    uk: "Для травми:",
    en: "For injury:",
    de: "Für Verletzung:",
    es: "Para la lesión:",
    ru: "Для травмы:",
    pt: "Para a lesão:"
  };
  return map[lang] || map.en;
}

function vaultDocNamePlaceholderText() {
  const lang = pacInjuryLang();
  const map = {
    uk: "MRI правого коліна 2026-05-01",
    en: "Right knee MRI 2026-05-01",
    de: "MRT rechtes Knie 2026-05-01",
    es: "MRI de rodilla derecha 2026-05-01",
    ru: "MRI правого колена 2026-05-01",
    pt: "MRI do joelho direito 2026-05-01"
  };
  return map[lang] || map.en;
}

function vaultDocNotesPlaceholderText() {
  const lang = pacInjuryLang();
  const map = {
    uk: "Додатковий контекст для тренера / лікаря",
    en: "Optional context for coach / doctor",
    de: "Optionaler Kontext für Trainer / Arzt",
    es: "Contexto opcional para entrenador / médico",
    ru: "Дополнительный контекст для тренера / врача",
    pt: "Contexto opcional para treinador / médico"
  };
  return map[lang] || map.en;
}

function bodyMapAltText() {
  const lang = pacInjuryLang();
  const map = {
    uk: "Карта тіла",
    en: "Body map",
    de: "Körperkarte",
    es: "Mapa corporal",
    ru: "Карта тела",
    pt: "Mapa corporal"
  };
  return map[lang] || map.en;
}

function applyMedicalVaultContextUi() {
  const contextEl = document.getElementById("inj-vault-context");
  if (!contextEl) return;
  const activeInjury = getActiveInjury();
  if (!activeInjury) {
    contextEl.style.display = "none";
    contextEl.textContent = "";
    return;
  }
  contextEl.style.display = "block";
  contextEl.textContent = `${vaultInjuryContextPrefixText()} ${displayLocation(activeInjury)}`;
}

function closeMedicalVaultModal() {
  const modal = document.getElementById("inj-vault-modal");
  if (!modal) return;
  modal.style.display = "none";
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("inj-vault-modal-open");
}

function openMedicalVaultModal() {
  if (!getActiveInjury()) return;
  if (isDelegatedReadOnly) return;
  const modal = document.getElementById("inj-vault-modal");
  if (!modal) return;
  modal.style.display = "flex";
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("inj-vault-modal-open");
}

function applyMedicalVaultVisibility() {
  const card = document.getElementById("inj-vault-card");
  if (!card) return;
  const visible = Boolean(getActiveInjury());
  card.style.display = visible ? "" : "none";
  if (!visible) closeMedicalVaultModal();
}

function applyInjuryStaticTranslations() {
  document.title = ti("title");
  setText("header .tagline", ti("headerTagline"));

  const nameEl = document.getElementById("user-name");
  if (nameEl) {
    const raw = (nameEl.textContent || "").trim();
  if (!raw || raw.includes("\u00D0") || raw.includes("Loading")) {
      nameEl.textContent = ti("loading");
    }
  }

  const main = document.querySelector(".main-content");
  if (!main) return;

  const h2 = main.querySelector("h2");
  if (h2) h2.textContent = ti("pageTitle");

  const form = document.getElementById("injury-form");
  if (form) {
    const cardTitle = form.closest(".form-card")?.querySelector("h3");
    if (cardTitle) cardTitle.textContent = ti("formTitle");

    const mapHint = form.querySelector("p");
    if (mapHint) mapHint.textContent = ti("mapHint");

    const lDate = form.querySelector("label[for='injury-date']");
    if (lDate) lDate.textContent = ti("dateLabel");

    const lLoc = form.querySelector("label[for='injury-location']");
    if (lLoc) lLoc.textContent = ti("locationLabel");

    const locInput = document.getElementById("injury-location");
    if (locInput) {
      locInput.placeholder = ti("locationPlaceholder");
      const k = resolveZoneKeyFromText(locInput.value);
      if (k) locInput.value = localizeZoneKey(k);
    }

    const painGroup = document.getElementById("pain-rating-group");
    if (painGroup) {
      const p1 = painGroup.previousElementSibling;
      if (p1 && p1.tagName === "LABEL") p1.textContent = ti("painLabel");
      const p2 = p1?.previousElementSibling;
      if (p2 && p2.tagName === "LABEL") p2.remove();
    }

    const lNotes = form.querySelector("label[for='injury-notes']");
    if (lNotes) lNotes.textContent = ti("notesLabel");

    const saveBtn = document.getElementById("save-injury-button");
    if (saveBtn) saveBtn.textContent = ti("saveButton");
  }

  const chartCard = document.querySelector(".chart-card");
  if (chartCard) {
    const hs = chartCard.querySelectorAll("h3");
    if (hs[0]) hs[0].textContent = ti("chartTitle");
    if (hs[1]) hs[1].textContent = ti("historyTitle");

    const controls = chartCard.querySelector(".pac-ui-controls");
    if (controls) {
      const l = controls.querySelector("label");
      if (l) l.textContent = ti("reportDate");

      const btns = controls.querySelectorAll("button");
      if (btns[0]) btns[0].textContent = ti("exportPdf");
      if (btns[1]) btns[1].textContent = ti("exportJson");
      if (btns[2]) btns[2].textContent = ti("deleteData");
    }

    const ph = document.querySelector("#injury-list .placeholder-text");
    if (ph) ph.textContent = ti("emptyHint");
  }

  setText("#inj-vault-title", ti("vaultTitle"));
  setText("#inj-vault-subtitle", ti("vaultSubtitle"));
  setText("#inj-vault-type-label", ti("vaultTypeLabel"));
  setText("#inj-vault-name-label", ti("vaultNameLabel"));
  setText("#inj-vault-notes-label", ti("vaultNotesLabel"));
  setText("#inj-vault-file-label", ti("vaultFileLabel"));
  setText("#inj-vault-consent-text", ti("vaultConsentText"));
  setText("#inj-vault-disclaimer", ti("vaultDisclaimer"));
  setText("#inj-vault-upload-btn", ti("vaultUploadBtn"));
  setText("#inj-vault-empty", ti("vaultEmpty"));
  setText("#inj-vault-readonly", ti("vaultReadOnly"));
  setText("#inj-vault-open-btn", ti("vaultAddData"));
  setText("#inj-vault-modal-title", ti("vaultModalTitle"));
  const modalCloseBtn = document.getElementById("inj-vault-modal-close");
  if (modalCloseBtn) modalCloseBtn.setAttribute("aria-label", ti("vaultCloseAria"));
  const vaultDocTitleInput = document.getElementById("inj-doc-title");
  if (vaultDocTitleInput) vaultDocTitleInput.placeholder = vaultDocNamePlaceholderText();
  const vaultDocNotesInput = document.getElementById("inj-doc-notes");
  if (vaultDocNotesInput) vaultDocNotesInput.placeholder = vaultDocNotesPlaceholderText();
  const bodyMapImage = document.getElementById("body-map-image");
  if (bodyMapImage) bodyMapImage.setAttribute("alt", bodyMapAltText());
  const pdfBodyMapImage = document.getElementById("inj-pdf-body-img");
  if (pdfBodyMapImage) pdfBodyMapImage.setAttribute("alt", bodyMapAltText());
  applyMedicalVaultContextUi();

  const typeSelect = document.getElementById("inj-doc-type");
  if (typeSelect) {
    const oMri = typeSelect.querySelector("option[value='mri']");
    const oXray = typeSelect.querySelector("option[value='xray']");
    const oCt = typeSelect.querySelector("option[value='ct']");
    const oUs = typeSelect.querySelector("option[value='us']");
    const oOther = typeSelect.querySelector("option[value='other']");
    if (oMri) oMri.textContent = ti("vaultTypeMRI");
    if (oXray) oXray.textContent = ti("vaultTypeXray");
    if (oCt) oCt.textContent = ti("vaultTypeCT");
    if (oUs) oUs.textContent = ti("vaultTypeUS");
    if (oOther) oOther.textContent = ti("vaultTypeOther");
  }

  setText("#inj-pdf-title", ti("pdfTitle"));
  setText("#inj-pdf-location-title", ti("pdfLocationTitle"));
  setText("#inj-pdf-name-label", ti("pdfNameLabel"));
  setText("#inj-pdf-latestpain-label", ti("pdfLatestPainLabel"));
  setText("#inj-pdf-trend7-title", ti("pdfTrend7DaysTitle"));
  setText("#inj-pdf-metric-last-label", ti("pdfMetricLatestPain"));
  setText("#inj-pdf-metric-avg7-label", ti("pdfMetricAvg7Days"));
  setText("#inj-pdf-metric-trend-label", ti("pdfMetricTrend"));
  setText("#inj-pdf-risk-date-label", ti("pdfRiskDateLabel"));
  setText("#inj-pdf-history-title", ti("pdfHistoryTitle"));
  setText("#inj-pdf-history-pain-label", ti("pdfHistoryPainLabel"));
  try {
    const baseRisk = pacAnalyzeInjury([]);
    setText("#inj-pdf-risk-title", baseRisk.title);
    setText("#inj-pdf-risk-sub", baseRisk.sub);
    setText("#inj-pdf-history-risk", baseRisk.title);
    const riskList = document.getElementById("inj-pdf-risk-list");
    if (riskList && Array.isArray(baseRisk.recs)) {
      riskList.innerHTML = baseRisk.recs.map((t) => `<li>${t}</li>`).join("");
    }
  } catch (_) {}
}
const urlParams = new URLSearchParams(window.location.search);
const viewUserId = urlParams.get('userId');
const viewInjuryId = urlParams.get('injuryId'); // coming from admin badge
const fromAdmin = urlParams.get("fromAdmin") === "1";
const fromCoach = urlParams.get("fromCoach") === "1";
const asAdmin = urlParams.get("asAdmin") === "1";


firebase.auth().onAuthStateChanged(async (user) => {
    if (user) {
        const scope = (typeof window.pacResolveDelegatedContext === "function")
          ? await window.pacResolveDelegatedContext(user, { db })
          : {
              allowed: true,
              effectiveUserId: String(window.currentUserId || user.uid).trim(),
              isDelegated: Boolean(viewUserId && (fromAdmin || fromCoach || asAdmin)),
              backHref: "coach-dashboard.html"
            };
        if (!scope.allowed) {
            alert(ti("accessDeniedAthlete"));
            window.location.href = scope.backHref || "coach-dashboard.html";
            return;
        }
        if (typeof window.pacRenderDelegatedIndicator === "function") {
            window.pacRenderDelegatedIndicator(scope);
        }
        currentUserId = String(scope.effectiveUserId || user.uid).trim();
        isDelegatedReadOnly = Boolean(scope.isDelegated && String(scope.authUid || user.uid).trim() !== currentUserId);
        applyMedicalVaultAccessUi();
        loadInjuriesFromFirebase();
    } else {
        currentUserId = null;
        isDelegatedReadOnly = false;
        activeLocationFilter = null;
        selectedId = null;
        injuries = [];
        medicalDocs = [];
        applyMedicalVaultAccessUi();
        renderMedicalDocs();
        const next = encodeURIComponent(`${window.location.pathname}${window.location.search}${window.location.hash}`);
        window.location.href = `./regist.html?next=${next}`;
    }
});
async function loadInjuriesFromFirebase() {
    if (!currentUserId) return;
    const uid=currentUserId;injuryReadBlocked=true;applyMedicalVaultAccessUi();
    try {
        const snapshot = await db.collection(INJURY_COLLECTION)
            .where("userId", "==", currentUserId)
            .get();
        if(currentUserId!==uid)return;
        injuryReadBlocked=false;
        injuryReadStatus(false);
        
        injuries = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            // Ensure history exists
            if (!data.history) {
                data.history = [{ date: data.date || getToday(), pain: data.pain || 0, notes: data.notes || "" }];
            }
            injuries.push({ id: doc.id, ...data });
            
        });
                // If opened from Admin with injuryId, auto-select that injury
        if (viewInjuryId) {
            const exists = injuries.some(i => i.id === viewInjuryId);
            if (exists) {
                activeLocationFilter = viewInjuryId;
                selectedId = viewInjuryId;
            }
        }
        if (activeLocationFilter && !injuries.some((i) => i.id === activeLocationFilter)) {
            activeLocationFilter = null;
            if (selectedId && !injuries.some((i) => i.id === selectedId)) {
              selectedId = null;
            }
        }

        refreshUI();
        window.injuries = injuries;

    } catch (e) {
        if(currentUserId!==uid)return;
        injuryReadBlocked=true;injuries=[];window.injuries=[];refreshUI();injuryReadStatus(true);
        console.error("Load error:", e);
    }
}

function syncMedicalDocsFromActiveInjury() {
  const activeInjury = getActiveInjury();
  if (!activeInjury) {
    medicalDocs = [];
  } else {
    const arr = Array.isArray(activeInjury.medicalDocs) ? activeInjury.medicalDocs : [];
    medicalDocs = arr
      .filter((x) => x && typeof x === "object")
      .sort((a, b) => Number(b.createdAtMs || 0) - Number(a.createdAtMs || 0));
  }
  applyMedicalVaultVisibility();
  applyMedicalVaultContextUi();
  applyMedicalVaultAccessUi();
  renderMedicalDocs();
}

function applyMedicalVaultAccessUi() {
  document.querySelectorAll('#injury-form input,#injury-form textarea,#injury-form button').forEach(el=>{el.disabled=!canWriteInjury()||injurySaving||(el.id==='injury-location'&&Boolean(selectedId));});
  document.querySelectorAll('[data-injury-action="edit"],[data-injury-action="delete-entry"],[data-injury-action="update"],[data-injury-action="delete-injury"],[onclick="pacDeleteMyInjuryData()"]') .forEach(el=>{el.hidden=!canWriteInjury();});
  const openBtn = document.getElementById("inj-vault-open-btn");
  const form = document.getElementById("inj-vault-form");
  const readonlyEl = document.getElementById("inj-vault-readonly");
  if (openBtn) {
    const canOpen = Boolean(getActiveInjury()) && !isDelegatedReadOnly;
    openBtn.disabled = !canOpen;
    openBtn.style.display = isDelegatedReadOnly ? "none" : "";
  }
  if (!form) return;
  const hasActiveInjury = Boolean(getActiveInjury());
  const lock = Boolean(isDelegatedReadOnly || !hasActiveInjury);
  form.querySelectorAll("input, select, textarea, button").forEach((el) => {
    el.disabled = lock;
  });
  form.style.opacity = lock ? "0.62" : "1";
  if (readonlyEl) {
    if (!hasActiveInjury) {
      readonlyEl.style.display = "none";
      readonlyEl.textContent = "";
    } else if (isDelegatedReadOnly) {
      readonlyEl.style.display = "block";
      readonlyEl.textContent = ti("vaultReadOnly");
    } else {
      readonlyEl.style.display = "none";
      readonlyEl.textContent = "";
    }
  }
}

function renderMedicalDocs() {
  const listRoot = document.getElementById("inj-vault-list");
  const emptyEl = document.getElementById("inj-vault-empty");
  if (!listRoot || !emptyEl) return;
  if (!getActiveInjury()) {
    listRoot.innerHTML = "";
    emptyEl.style.display = "none";
    return;
  }

  const list = Array.isArray(medicalDocs) ? medicalDocs : [];
  if (!list.length) {
    listRoot.innerHTML = "";
    emptyEl.style.display = "block";
    emptyEl.textContent = ti("vaultEmpty");
    return;
  }

  emptyEl.style.display = "none";
  listRoot.innerHTML = list.map((doc) => {
    const rawId = String(doc.id || "");
    const id = escapeHtml(rawId);
    const title = escapeHtml(doc.title || doc.fileName || "Document");
    const note = String(doc.notes || "").trim();
    const storagePath = escapeHtml(String(doc.storagePath || ""));
    const canOpen = !isDelegatedReadOnly && Boolean(storagePath);
    const created = formatDocDate(doc.createdAtMs);
    const metaType = escapeHtml(getVaultTypeLabel(doc.docType));
    const fileMeta = `${escapeHtml(doc.fileName || "file")} • ${formatBytes(doc.size)}`;
    const uploadedBy = escapeHtml(String(doc.uploadedBy || "—"));
    const openBtn = canOpen
      ? `<button type="button" class="inj-vault-link" data-vault-open data-storage-path="${storagePath}">${escapeHtml(ti("vaultOpen"))}</button>`
      : "";
    const delBtn = isDelegatedReadOnly
      ? ""
      : `<button type="button" class="inj-vault-delete" data-vault-delete data-doc-id="${id}">${escapeHtml(ti("vaultDelete"))}</button>`;

    return `
      <article class="inj-vault-item">
        <div class="inj-vault-item-top">
          <div class="inj-vault-name">${title}</div>
          <div class="inj-vault-type">${metaType}</div>
        </div>
        <div class="inj-vault-meta">${escapeHtml(ti("vaultUploadedAt"))}: ${escapeHtml(created)} • ${escapeHtml(ti("vaultBy"))}: ${uploadedBy}</div>
        <div class="inj-vault-meta">${fileMeta}</div>
        ${note ? `<div class="inj-vault-note">${escapeHtml(note)}</div>` : ""}
        <div class="inj-vault-actions">${openBtn}${delBtn}</div>
      </article>
    `;
  }).join("");
  listRoot.onclick = (event) => {
    const button = event.target.closest("[data-vault-delete], [data-vault-open]");
    if (!button || !listRoot.contains(button)) return;
    if (button.matches("[data-vault-open]")) {
      const storagePath = String(button.dataset.storagePath || "");
      if (storagePath) window.pacOpenMedicalDoc(storagePath);
      return;
    }
    const docId = String(button.dataset.docId || "");
    if (docId) window.pacDeleteMedicalDoc(docId);
  };
}

window.pacOpenMedicalDoc = async function pacOpenMedicalDoc(storagePath) {
  if (isDelegatedReadOnly) return;
  const st = injuryStorage();
  const safePath = String(storagePath || "").trim();
  if (!st?.ref || !safePath.startsWith(`medical-docs/${currentUserId}/injuries/`)) return;
  try {
    const url = await st.ref().child(safePath).getDownloadURL();
    window.open(url, "_blank", "noopener,noreferrer");
  } catch (e) {
    console.error("medical document open failed:", e);
    alert(ti("vaultUploadFailed"));
  }
};

async function persistMedicalDocs(nextDocs) {
  const injuryId = getActiveInjuryId();
  if (!injuryId) throw new Error("No active injury selected");
  const sorted = nextDocs
    .filter((x) => x && typeof x === "object")
    .slice(0, MEDICAL_DOCS_LIMIT)
    .sort((a, b) => Number(b.createdAtMs || 0) - Number(a.createdAtMs || 0));

  const injuryRef = db.collection(INJURY_COLLECTION).doc(injuryId);
  await injuryRef.set({
    medicalDocs: sorted,
    medicalDocsUpdatedAt: firebase.firestore.FieldValue.serverTimestamp()
  }, { merge: true });

  const localInjury = injuries.find((i) => String(i?.id || "") === injuryId);
  if (localInjury) {
    localInjury.medicalDocs = sorted.slice();
  }
  medicalDocs = sorted.slice();
  renderMedicalDocs();
}

window.pacDeleteMedicalDoc = async function pacDeleteMedicalDoc(docId) {
  const injuryId = getActiveInjuryId();
  if (!injuryId) {
    alert(vaultSelectInjuryText());
    return;
  }
  if (isDelegatedReadOnly) {
    alert(ti("vaultReadOnly"));
    return;
  }
  const id = String(docId || "").trim();
  if (!id) return;
  if (!confirm(ti("vaultDeleteAsk"))) return;
  try {
    const current = Array.isArray(medicalDocs) ? medicalDocs.slice() : [];
    const target = current.find((d) => String(d.id || "") === id);
    const next = current.filter((d) => String(d.id || "") !== id);

    if (target && target.storagePath) {
      const st = injuryStorage();
      if (st && st.ref) {
        try {
          await st.ref().child(target.storagePath).delete();
        } catch (e) {
          console.warn("storage delete skipped:", e?.message || e);
        }
      }
    }

    await persistMedicalDocs(next);
  } catch (e) {
    console.error("medical doc delete failed:", e);
    alert(ti("vaultUploadFailed"));
  }
};

async function uploadMedicalDocFromForm() {
  const injuryId = getActiveInjuryId();
  if (!injuryId) {
    alert(vaultSelectInjuryText());
    return;
  }
  if (isDelegatedReadOnly) {
    alert(ti("vaultReadOnly"));
    return;
  }

  const form = document.getElementById("inj-vault-form");
  if (!form) return;
  const typeEl = document.getElementById("inj-doc-type");
  const titleEl = document.getElementById("inj-doc-title");
  const notesEl = document.getElementById("inj-doc-notes");
  const fileEl = document.getElementById("inj-doc-file");
  const consentEl = document.getElementById("inj-doc-consent");
  const uploadBtn = document.getElementById("inj-vault-upload-btn");
  const fileNameEl = document.getElementById("inj-vault-file-name");

  const file = fileEl?.files?.[0] || null;
  if (!file) {
    alert(ti("vaultNoFile"));
    return;
  }
  if (!consentEl?.checked) {
    alert(ti("vaultNoConsent"));
    return;
  }
  if ((Array.isArray(medicalDocs) ? medicalDocs.length : 0) >= MEDICAL_DOCS_LIMIT) {
    alert(ti("vaultMaxReached"));
    return;
  }
  if (Number(file.size || 0) > MEDICAL_DOC_MAX_SIZE) {
    alert(ti("vaultTooLarge"));
    return;
  }

  const ext = extOf(file.name);
  const allowedByExt = MEDICAL_DOC_ALLOWED_EXT.includes(ext);
  const allowedByMime = String(file.type || "").startsWith("image/") || String(file.type || "").toLowerCase() === "application/pdf";
  if (!allowedByExt && !allowedByMime) {
    alert(ti("vaultUnsupported"));
    return;
  }

  const st = injuryStorage();
  if (!st || !st.ref) {
    alert(ti("vaultStorageMissing"));
    return;
  }

  const prevText = uploadBtn ? uploadBtn.textContent : "";
  if (uploadBtn) {
    uploadBtn.disabled = true;
    uploadBtn.textContent = ti("vaultUploadInProgress");
  }

  let uploadedRef = null;
  try {
    const docType = String(typeEl?.value || "other");
    const title = String(titleEl?.value || "").trim();
    const notes = String(notesEl?.value || "").trim();
    const docId = `md_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const safeName = sanitizeFileName(file.name || `doc_${Date.now()}`);
    const storagePath = `medical-docs/${currentUserId}/injuries/${injuryId}/${docId}/${safeName}`;

    const snap = await st.ref().child(storagePath).put(file, {
      contentType: file.type || "application/octet-stream",
      customMetadata: {
        userId: String(currentUserId || ""),
        injuryId: String(injuryId || ""),
        uploadedBy: String(firebase.auth().currentUser?.uid || ""),
        docType
      }
    });
    uploadedRef = snap.ref;

    const row = {
      id: docId,
      docType,
      title: title || safeName,
      notes,
      fileName: safeName,
      size: Number(file.size || 0),
      mimeType: String(file.type || ""),
      injuryId: String(injuryId || ""),
      storagePath,
      createdAtMs: Date.now(),
      uploadedBy: String(firebase.auth().currentUser?.uid || "")
    };

    const nextDocs = [row, ...(Array.isArray(medicalDocs) ? medicalDocs : [])]
      .slice(0, MEDICAL_DOCS_LIMIT);

    await persistMedicalDocs(nextDocs);
    form.reset();
    if (fileNameEl) fileNameEl.textContent = "—";
    closeMedicalVaultModal();
    alert(ti("vaultUploaded"));
  } catch (e) {
    console.error("medical doc upload failed:", e);
    if (uploadedRef) {
      try { await uploadedRef.delete(); } catch (_) {}
    }
    alert(`${ti("vaultUploadFailed")} ${e?.message ? `(${e.message})` : ""}`);
  } finally {
    if (uploadBtn) {
      uploadBtn.disabled = false;
      uploadBtn.textContent = prevText || ti("vaultUploadBtn");
    }
  }
}

function initMedicalVault() {
  const openBtn = document.getElementById("inj-vault-open-btn");
  const modal = document.getElementById("inj-vault-modal");
  const modalBackdrop = document.getElementById("inj-vault-modal-backdrop");
  const modalClose = document.getElementById("inj-vault-modal-close");
  const form = document.getElementById("inj-vault-form");
  const fileEl = document.getElementById("inj-doc-file");
  const fileNameEl = document.getElementById("inj-vault-file-name");
  if (!form || !fileEl) return;

  if (openBtn) {
    openBtn.addEventListener("click", () => {
      openMedicalVaultModal();
    });
  }
  if (modalBackdrop) {
    modalBackdrop.addEventListener("click", () => {
      closeMedicalVaultModal();
    });
  }
  if (modalClose) {
    modalClose.addEventListener("click", () => {
      closeMedicalVaultModal();
    });
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal && modal.style.display !== "none") {
      closeMedicalVaultModal();
    }
  });

  fileEl.addEventListener("change", () => {
    const file = fileEl.files?.[0];
    if (fileNameEl) fileNameEl.textContent = file ? file.name : "—";
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    await uploadMedicalDocFromForm();
  });

  syncMedicalDocsFromActiveInjury();
}

function refreshUI() {
    renderPoints();
    renderInjuryList();
    updatePainChart();
    syncMedicalDocsFromActiveInjury();
}
        if (viewInjuryId) {
            // scroll to chart or list
            setTimeout(() => {
                const chartSection = document.querySelector('.chart-card') || document.getElementById('painChart');
                const list = document.getElementById('injury-list');
                (chartSection || list)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 150);
        }
function renderPoints() {
    const container = document.getElementById('bodyMapContainer');
    if (!container) return;
    container.querySelectorAll('.injury-marker').forEach(m => m.remove());

    injuries.forEach(inj => {
        const el = document.createElement('div');
        el.className = 'injury-marker';
        const lastEntry = inj.history[inj.history.length - 1];
        const isHealed = parseInt(lastEntry.pain) === 0;
        
        el.style.cssText = `
            position: absolute; width: 14px; height: 14px; 
            border-radius: 50%; border: 2px solid white; 
            background-color: ${isHealed ? GOLD_COLOR : RED_MARKER}; 
            left: ${inj.coordX}%; top: ${inj.coordY}%; transform: translate(-50%, -50%);
            z-index: 100; cursor: pointer;
            box-shadow: 0 0 8px ${isHealed ? GOLD_COLOR : RED_MARKER};
        `;
        
        el.onclick = (e) => { 
            e.stopPropagation(); 
            activeLocationFilter = inj.id; 
            refreshUI();
            const chartSection = document.querySelector('.chart-card') || document.getElementById('painChart');
            if (chartSection) {
                chartSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        };
        container.appendChild(el);
    });
}
function updatePainChart() {
    const ctx = document.getElementById('painChart');
    if (!ctx) return;
    if (painChartInstance) painChartInstance.destroy();

    const selectedInjury = injuries.find(i => i.id === activeLocationFilter);
    if (!selectedInjury) return;

    const history = [...selectedInjury.history].sort((a, b) => new Date(a.date) - new Date(b.date));

    painChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: history.map(h => h.date),
            datasets: [{
                label: `${ti("chartDataset")}: ${displayLocation(selectedInjury)}`,
                data: history.map(h => h.pain),
                borderColor: GOLD_COLOR,
                backgroundColor: 'rgba(255, 199, 44, 0.1)',
                tension: 0.3,
                fill: true,
                pointRadius: 6,
                pointBackgroundColor: history.map(h => parseInt(h.pain) === 0 ? GOLD_COLOR : RED_MARKER)
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { min: 0, max: 10, ticks: { color: '#fff' }, grid: { color: '#333' } },
                x: { ticks: { color: '#888' }, grid: { display: false } }
            },
            plugins: { legend: { labels: { color: '#fff' } } }
        }
    });
}
window.editEntry = (injuryId, index) => {
    if(!canWriteInjury())return;
    const inj = injuries.find(i => i.id === injuryId);
    const entry = inj.history[index];
    
    selectedId = injuryId;
    document.getElementById('notes-section').style.display = 'block';
    document.getElementById('injury-location').value = displayLocation(inj);
    document.getElementById('injury-location').disabled = true;
    document.getElementById('injury-date').value = entry.date;
    document.getElementById('injury-notes').value = entry.notes || "";
    
    const painRadio = document.querySelector(`input[name="pain"][value="${entry.pain}"]`);
    if (painRadio) painRadio.checked = true;
    document.getElementById('injury-form').onsubmit = async (e) => {
        e.preventDefault();
        if(!canWriteInjury()||injurySaving)return;
        const painInput = document.querySelector('input[name="pain"]:checked');
        if (!painInput) { alert(`${ti("saveErr")}: ${ti("choosePain010")}`); return; }
        const updatedHistory = [...inj.history];
        updatedHistory[index] = {
            date: document.getElementById('injury-date').value,
            pain: parseInt(painInput.value, 10),
            notes: document.getElementById('injury-notes').value,
            source: "manual",
            timestamp: Date.now()
        };

        try {
            const last = updatedHistory[updatedHistory.length - 1] || updatedHistory[index];
            await db.collection(INJURY_COLLECTION).doc(injuryId).update({
              history: updatedHistory,
              pain: Number(last?.pain || 0),
              date: String(last?.date || getToday()),
              source: "manual",
              timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            alert(ti("editOk"));
            selectedId = null;
            const form = document.getElementById("injury-form");
            if (form && typeof defaultInjurySubmitHandler === "function") {
              form.onsubmit = defaultInjurySubmitHandler;
              form.reset();
            }
            const marker = document.getElementById("click-marker");
            if (marker) marker.style.left = "-100px";
            document.getElementById("notes-section").style.display = "none";
            await loadInjuriesFromFirebase();
        } catch (err) { alert(ti("editErr")); }
    };

    document.getElementById('injury-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

window.deleteEntry = async (injuryId, index) => {
  if(!canWriteInjury())return;
  if (!confirm(ti("deleteEntryAsk"))) return;

  const inj = injuries.find(i => i.id === injuryId);
  if (!inj) return alert(ti("notFound"));

  const updatedHistory = (inj.history || []).filter((_, i) => i !== index);

  try {
    if (updatedHistory.length === 0) {
      await db.collection(INJURY_COLLECTION).doc(injuryId).delete();
      activeLocationFilter = null;
    } else {
      const last = updatedHistory[updatedHistory.length - 1] || { pain: 0, date: getToday() };

      await db.collection(INJURY_COLLECTION).doc(injuryId).update({
        history: updatedHistory,
      pain: Number(last.pain) || 0,        // top-level sync
      date: last.date || getToday(),       // top-level sync
      source: "manual",
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });
    }

    loadInjuriesFromFirebase();
  } catch (e) {
    console.error(e);
    alert(ti("deleteErr"));
  }
};


async function deleteFullInjury(id) {
    if(!canWriteInjury())return;
    if (confirm(ti("deleteFullAsk"))) {
        try {
            await db.collection(INJURY_COLLECTION).doc(id).delete();
            activeLocationFilter = null;
            loadInjuriesFromFirebase();
        } catch (e) { alert(ti("deleteErr")); }
    }
}
const BODY_ZONES = {
    front: {
        head:          { yStart: 5,  yEnd: 18, xStart: 20, xEnd: 30 },
        chest:         { yStart: 17, yEnd: 32, xStart: 17, xEnd: 35 },
        shoulderRight: { yStart: 12, yEnd: 26, xStart: 10, xEnd: 17 },
        shoulderLeft:  { yStart: 12, yEnd: 26, xStart: 34, xEnd: 40 },
        abs:           { yStart: 28, yEnd: 45, xStart: 17, xEnd: 35 },
        bicepsRight:   { yStart: 26, yEnd: 34, xStart: 10, xEnd: 15 },
        bicepsLeft:    { yStart: 26, yEnd: 34, xStart: 35, xEnd: 42 },
        elbowRight:    { yStart: 34, yEnd: 37, xStart: 7,  xEnd: 18 }, 
        elbowLeft:     { yStart: 34, yEnd: 37, xStart: 36, xEnd: 46 },
        wristRight:    { yStart: 48, yEnd: 55, xStart: 5,  xEnd: 10 },
        wristLeft:     { yStart: 48, yEnd: 55, xStart: 41, xEnd: 46 },
        fingersRight:  { yStart: 55, yEnd: 65, xStart: 3,  xEnd: 11 },
        fingersLeft:   { yStart: 55, yEnd: 58, xStart: 39, xEnd: 47 },
        groin:         { yStart: 45, yEnd: 55, xStart: 18, xEnd: 33 },
        quadsRight:    { yStart: 53, yEnd: 68, xStart: 14, xEnd: 25 },
        quadsLeft:     { yStart: 53, yEnd: 68, xStart: 27, xEnd: 38 },
        kneeRight:     { yStart: 68, yEnd: 73, xStart: 16, xEnd: 22 },
        kneeLeft:      { yStart: 68, yEnd: 73, xStart: 28, xEnd: 35 },
        shinRight:     { yStart: 85, yEnd: 95, xStart: 12, xEnd: 25 },
        shinLeft:      { yStart: 85, yEnd: 95, xStart: 25, xEnd: 38 },
        footRight:     { yStart: 95, yEnd: 100, xStart: 10, xEnd: 25 },
        footLeft:      { yStart: 95, yEnd: 100, xStart: 25, xEnd: 40 }
    },
    back: {
        head:              { yStart: 0,  yEnd: 15, xStart: 71, xEnd: 81 },
        trapsRight:        { yStart: 15, yEnd: 28, xStart: 77, xEnd: 83 },
        trapsLeft:         { yStart: 15, yEnd: 28, xStart: 72, xEnd: 77 },
        shoulderBackRight: { yStart: 19, yEnd: 27, xStart: 83, xEnd: 91 },
        shoulderBackLeft:  { yStart: 19, yEnd: 26, xStart: 60, xEnd: 72 },
        latsRight:         { yStart: 27, yEnd: 39, xStart: 77, xEnd: 88 },
        latsLeft:          { yStart: 27, yEnd: 39, xStart: 68, xEnd: 76 },
        tricepsRight:      { yStart: 27, yEnd: 34, xStart: 86, xEnd: 92 },
        tricepsLeft:       { yStart: 27, yEnd: 34, xStart: 58, xEnd: 64 },
        elbowBackRight:    { yStart: 34, yEnd: 38, xStart: 88, xEnd: 95 },
        elbowBackLeft:     { yStart: 34, yEnd: 38, xStart: 58, xEnd: 64 },
        lowerBack:         { yStart: 39, yEnd: 44, xStart: 68, xEnd: 85 },
        glutesRight:       { yStart: 44, yEnd: 54, xStart: 75, xEnd: 88 },
        glutesLeft:        { yStart: 44, yEnd: 54, xStart: 62, xEnd: 75 },
        hamstringsRight:   { yStart: 54, yEnd: 69, xStart: 78, xEnd: 90 },
        hamstringsLeft:    { yStart: 54, yEnd: 69, xStart: 65, xEnd: 75 },
        poplitealRight:    { yStart: 69, yEnd: 72, xStart: 77, xEnd: 90 },
        poplitealLeft:     { yStart: 69, yEnd: 72, xStart: 67, xEnd: 75 },
        calvesRight:       { yStart: 70, yEnd: 84, xStart: 75, xEnd: 90 },
        calvesLeft:        { yStart: 70, yEnd: 84, xStart: 65, xEnd: 75 },
        achillesRight:     { yStart: 85, yEnd: 95, xStart: 83, xEnd: 86 },
        achillesLeft:      { yStart: 85, yEnd: 95, xStart: 68, xEnd: 72 }
    }
};




//==========================================================================
function humanizeZoneKey(zoneKey) {
  if (!zoneKey) return ti("unknownZone");
  return String(zoneKey)
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/Right/g, " right")
    .replace(/Left/g, " left")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (m) => m.toUpperCase());
}


function findZoneKeyByCoords(x, y) {
  const nx = Number(x);
  const ny = Number(y);
  if (!Number.isFinite(nx) || !Number.isFinite(ny)) return null;
  for (const side in BODY_ZONES) {
    for (const zoneKey in BODY_ZONES[side]) {
      const z = BODY_ZONES[side][zoneKey];
      if (nx >= z.xStart && nx <= z.xEnd && ny >= z.yStart && ny <= z.yEnd) {
        return zoneKey;
      }
    }
  }
  return null;
}

const ZONE_NAMES = {
  uk: {
    head: "Голова", chest: "Груди", shoulderRight: "Праве плече", shoulderLeft: "Ліве плече",
    abs: "Живіт", bicepsRight: "Правий біцепс", bicepsLeft: "Лівий біцепс", elbowRight: "Правий лікоть",
    elbowLeft: "Лівий лікоть", wristRight: "Праве зап'ястя", wristLeft: "Ліве зап'ястя", fingersRight: "Права кисть",
    fingersLeft: "Ліва кисть", groin: "Пахова зона", quadsRight: "Правий квадрицепс", quadsLeft: "Лівий квадрицепс",
    kneeRight: "Праве коліно", kneeLeft: "Ліве коліно", shinRight: "Права гомілка", shinLeft: "Ліва гомілка",
    footRight: "Права стопа", footLeft: "Ліва стопа", trapsRight: "Правий трапецієподібний", trapsLeft: "Лівий трапецієподібний",
    shoulderBackRight: "Праве плече (ззаду)", shoulderBackLeft: "Ліве плече (ззаду)", latsRight: "Правий найширший",
    latsLeft: "Лівий найширший", tricepsRight: "Правий трицепс", tricepsLeft: "Лівий трицепс",
    elbowBackRight: "Правий лікоть (ззаду)", elbowBackLeft: "Лівий лікоть (ззаду)", lowerBack: "Поперек",
    glutesRight: "Права сідниця", glutesLeft: "Ліва сідниця", hamstringsRight: "Праві задні м'язи стегна",
    hamstringsLeft: "Ліві задні м'язи стегна", poplitealRight: "Права підколінна зона", poplitealLeft: "Ліва підколінна зона",
    calvesRight: "Права литка", calvesLeft: "Ліва литка", achillesRight: "Праве ахіллове сухожилля", achillesLeft: "Ліве ахіллове сухожилля"
  },
  de: {
    head: "Kopf", chest: "Brust", shoulderRight: "Rechte Schulter", shoulderLeft: "Linke Schulter",
    abs: "Bauch", bicepsRight: "Rechter Bizeps", bicepsLeft: "Linker Bizeps", elbowRight: "Rechter Ellbogen",
    elbowLeft: "Linker Ellbogen", wristRight: "Rechtes Handgelenk", wristLeft: "Linkes Handgelenk", fingersRight: "Rechte Hand",
    fingersLeft: "Linke Hand", groin: "Adduktoren", quadsRight: "Rechter Quadrizeps", quadsLeft: "Linker Quadrizeps",
    kneeRight: "Rechtes Knie", kneeLeft: "Linkes Knie", shinRight: "Rechtes Schienbein", shinLeft: "Linkes Schienbein",
    footRight: "Rechter Fuß", footLeft: "Linker Fuß", trapsRight: "Rechter Trapezmuskel", trapsLeft: "Linker Trapezmuskel",
    shoulderBackRight: "Rechte Schulter (hinten)", shoulderBackLeft: "Linke Schulter (hinten)", latsRight: "Rechter Latissimus",
    latsLeft: "Linker Latissimus", tricepsRight: "Rechter Trizeps", tricepsLeft: "Linker Trizeps",
    elbowBackRight: "Rechter Ellbogen (hinten)", elbowBackLeft: "Linker Ellbogen (hinten)", lowerBack: "Unterer Rücken",
    glutesRight: "Rechte Gesäßseite", glutesLeft: "Linke Gesäßseite", hamstringsRight: "Rechter hinterer Oberschenkel",
    hamstringsLeft: "Linker hinterer Oberschenkel", poplitealRight: "Rechte Kniekehle", poplitealLeft: "Linke Kniekehle",
    calvesRight: "Rechte Wade", calvesLeft: "Linke Wade", achillesRight: "Rechte Achillessehne", achillesLeft: "Linke Achillessehne"
  },
  es: {
    head: "Cabeza", chest: "Pecho", shoulderRight: "Hombro derecho", shoulderLeft: "Hombro izquierdo",
    abs: "Abdomen", bicepsRight: "Bíceps derecho", bicepsLeft: "Bíceps izquierdo", elbowRight: "Codo derecho",
    elbowLeft: "Codo izquierdo", wristRight: "Muñeca derecha", wristLeft: "Muñeca izquierda", fingersRight: "Mano derecha",
    fingersLeft: "Mano izquierda", groin: "Aductores", quadsRight: "Cuádriceps derecho", quadsLeft: "Cuádriceps izquierdo",
    kneeRight: "Rodilla derecha", kneeLeft: "Rodilla izquierda", shinRight: "Espinilla derecha", shinLeft: "Espinilla izquierda",
    footRight: "Pie derecho", footLeft: "Pie izquierdo", trapsRight: "Trapecio derecho", trapsLeft: "Trapecio izquierdo",
    shoulderBackRight: "Hombro derecho (posterior)", shoulderBackLeft: "Hombro izquierdo (posterior)", latsRight: "Dorsal derecho",
    latsLeft: "Dorsal izquierdo", tricepsRight: "Tríceps derecho", tricepsLeft: "Tríceps izquierdo",
    elbowBackRight: "Codo derecho (posterior)", elbowBackLeft: "Codo izquierdo (posterior)", lowerBack: "Zona lumbar",
    glutesRight: "Glúteo derecho", glutesLeft: "Glúteo izquierdo", hamstringsRight: "Isquiotibiales derechos",
    hamstringsLeft: "Isquiotibiales izquierdos", poplitealRight: "Hueco poplíteo derecho", poplitealLeft: "Hueco poplíteo izquierdo",
    calvesRight: "Pantorrilla derecha", calvesLeft: "Pantorrilla izquierda", achillesRight: "Aquiles derecho", achillesLeft: "Aquiles izquierdo"
  },
  ru: {
    head: "Голова", chest: "Грудь", shoulderRight: "Правое плечо", shoulderLeft: "Левое плечо",
    abs: "Живот", bicepsRight: "Правый бицепс", bicepsLeft: "Левый бицепс", elbowRight: "Правый локоть",
    elbowLeft: "Левый локоть", wristRight: "Правое запястье", wristLeft: "Левое запястье", fingersRight: "Правая кисть",
    fingersLeft: "Левая кисть", groin: "Паховая зона", quadsRight: "Правый квадрицепс", quadsLeft: "Левый квадрицепс",
    kneeRight: "Правое колено", kneeLeft: "Левое колено", shinRight: "Правая голень", shinLeft: "Левая голень",
    footRight: "Правая стопа", footLeft: "Левая стопа", trapsRight: "Правый трапециевидный", trapsLeft: "Левый трапециевидный",
    shoulderBackRight: "Правое плечо (сзади)", shoulderBackLeft: "Левое плечо (сзади)", latsRight: "Правый широчайший",
    latsLeft: "Левый широчайший", tricepsRight: "Правый трицепс", tricepsLeft: "Левый трицепс",
    elbowBackRight: "Правый локоть (сзади)", elbowBackLeft: "Левый локоть (сзади)", lowerBack: "Поясница",
    glutesRight: "Правая ягодица", glutesLeft: "Левая ягодица", hamstringsRight: "Правые задние мышцы бедра",
    hamstringsLeft: "Левые задние мышцы бедра", poplitealRight: "Правая подколенная зона", poplitealLeft: "Левая подколенная зона",
    calvesRight: "Правая икра", calvesLeft: "Левая икра", achillesRight: "Правое ахиллово сухожилие", achillesLeft: "Левое ахиллово сухожилие"
  },
  pt: {
    head: "Cabeça", chest: "Peito", shoulderRight: "Ombro direito", shoulderLeft: "Ombro esquerdo",
    abs: "Abdómen", bicepsRight: "Bíceps direito", bicepsLeft: "Bíceps esquerdo", elbowRight: "Cotovelo direito",
    elbowLeft: "Cotovelo esquerdo", wristRight: "Pulso direito", wristLeft: "Pulso esquerdo", fingersRight: "Mão direita",
    fingersLeft: "Mão esquerda", groin: "Adutores", quadsRight: "Quadríceps direito", quadsLeft: "Quadríceps esquerdo",
    kneeRight: "Joelho direito", kneeLeft: "Joelho esquerdo", shinRight: "Canela direita", shinLeft: "Canela esquerda",
    footRight: "Pé direito", footLeft: "Pé esquerdo", trapsRight: "Trapézio direito", trapsLeft: "Trapézio esquerdo",
    shoulderBackRight: "Ombro direito (posterior)", shoulderBackLeft: "Ombro esquerdo (posterior)", latsRight: "Dorsal direito",
    latsLeft: "Dorsal esquerdo", tricepsRight: "Tríceps direito", tricepsLeft: "Tríceps esquerdo",
    elbowBackRight: "Cotovelo direito (posterior)", elbowBackLeft: "Cotovelo esquerdo (posterior)", lowerBack: "Lombar",
    glutesRight: "Glúteo direito", glutesLeft: "Glúteo esquerdo", hamstringsRight: "Isquiotibiais direitos",
    hamstringsLeft: "Isquiotibiais esquerdos", poplitealRight: "Fossa poplítea direita", poplitealLeft: "Fossa poplítea esquerda",
    calvesRight: "Panturrilha direita", calvesLeft: "Panturrilha esquerda", achillesRight: "Aquiles direito", achillesLeft: "Aquiles esquerdo"
  }
};

function normalizeLocationToken(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9а-яёіїєґ]+/g, "");
}

const LEGACY_LOCATION_ALIASES = {
  chest: "chest",
  pectoral: "chest",
  rightknee: "kneeRight",
  leftknee: "kneeLeft",
  kneeright: "kneeRight",
  kneeleft: "kneeLeft",
  rightshoulder: "shoulderRight",
  leftshoulder: "shoulderLeft",
  lowback: "lowerBack",
  lowerback: "lowerBack",
  back: "lowerBack"
};

function resolveZoneKeyFromText(text) {
  const token = normalizeLocationToken(text);
  if (!token) return null;
  if (LEGACY_LOCATION_ALIASES[token]) return LEGACY_LOCATION_ALIASES[token];

  for (const side in BODY_ZONES) {
    for (const zoneKey in BODY_ZONES[side]) {
      if (normalizeLocationToken(humanizeZoneKey(zoneKey)) === token) return zoneKey;
      for (const lang of ["uk", "de", "es", "ru", "pt"]) {
        const map = ZONE_NAMES[lang] || {};
        if (map[zoneKey] && normalizeLocationToken(map[zoneKey]) === token) return zoneKey;
      }
    }
  }
  return null;
}
function localizeZoneKey(zoneKey) {
  if (!zoneKey) return ti("unknownZone");
  const lang = pacInjuryLang();
  const map = ZONE_NAMES[lang];
  if (map && map[zoneKey]) return map[zoneKey];
  return humanizeZoneKey(zoneKey);
}

function displayLocation(injury) {
  const key = injury?.locationKey || findZoneKeyByCoords(injury?.coordX, injury?.coordY) || resolveZoneKeyFromText(injury?.location);
  if (key) return localizeZoneKey(key);
  return injury?.location || ti("unknownZone");
}
function findZoneByCoords(x, y) {
    for (const side in BODY_ZONES) {
        for (const zoneKey in BODY_ZONES[side]) {
            const z = BODY_ZONES[side][zoneKey];
            if (x >= z.xStart && x <= z.xEnd && y >= z.yStart && y <= z.yEnd) {
                return localizeZoneKey(zoneKey);
            }
        }
    }
    return ti("unknownZone");
}
function renderInjuryList() {
    const listElement = document.getElementById("injury-list");
    if (!listElement) return;
    listElement.onclick = (event) => {
        const target = event.target.closest("[data-injury-action]");
        if (!target || !listElement.contains(target)) return;
        const action = String(target.dataset.injuryAction || "");
        const injuryId = String(target.dataset.injuryId || "");
        const historyIndex = Number(target.dataset.historyIndex);
        if (action === "back") {
            activeLocationFilter = null;
            refreshUI();
        } else if (action === "open" && injuryId) {
            activeLocationFilter = injuryId;
            refreshUI();
        } else if (action === "edit" && injuryId && Number.isInteger(historyIndex)) {
            editEntry(injuryId, historyIndex);
        } else if (action === "delete-entry" && injuryId && Number.isInteger(historyIndex)) {
            deleteEntry(injuryId, historyIndex);
        } else if (action === "update" && injuryId) {
            openUpdateMode(injuryId);
        } else if (action === "delete-injury" && injuryId) {
            deleteFullInjury(injuryId);
        }
    };

    if (activeLocationFilter) {
        const inj = injuries.find(i => i.id === activeLocationFilter);
        if (!inj) {
            activeLocationFilter = null;
            renderInjuryList();
            return;
        }
        const historySorted = inj.history.map((h, i) => ({ ...h, idx: i })).reverse();
        const safeInjuryId = escapeHtml(inj.id || "");
        const safeLocation = escapeHtml(displayLocation(inj));

        listElement.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                <h3 style="color:gold; margin:0;">${safeLocation}</h3>
                <button type="button" data-injury-action="back" class="gold-button" style="width:auto; padding:5px 15px;">${escapeHtml(ti("back"))}</button>
            </div>
            <div style="padding-right:5px;">
                ${historySorted.map(h => {
                    const safeDate = escapeHtml(h.date || "");
                    const safePain = escapeHtml(h.pain ?? "");
                    const safeNotes = escapeHtml(h.notes || "");
                    return `
                    <div style="background:#111; padding:12px 40px 12px 12px; border-radius:8px; margin-bottom:10px; border-left:4px solid ${parseInt(h.pain, 10) === 0 ? GOLD_COLOR : RED_MARKER}; position:relative;">
                        <div style="display:flex; justify-content:space-between; font-size:0.85em; margin-bottom:5px;">
                            <span style="color:#888;">${safeDate}</span>
                            <span style="color:gold; font-weight:bold;">${escapeHtml(ti("painShort"))}: ${safePain}</span>
                        </div>
                        <div style="font-size:0.9em; color:#ddd;">${safeNotes}</div>
                        <div style="position:absolute; right:8px; top:50%; transform:translateY(-50%); display:flex; flex-direction:column; gap:10px;">
                            <button type="button" data-injury-action="edit" data-injury-id="${safeInjuryId}" data-history-index="${h.idx}" style="background:none; border:none; cursor:pointer;">${escapeHtml(ti("editBtn"))}</button>
                            <button type="button" data-injury-action="delete-entry" data-injury-id="${safeInjuryId}" data-history-index="${h.idx}" style="background:none; border:none; cursor:pointer;">${escapeHtml(ti("deleteBtn"))}</button>
                        </div>
                    </div>
                `;}).join("")}
            </div>
            <button type="button" data-injury-action="update" data-injury-id="${safeInjuryId}" style="width:100%; padding:12px; background:gold; border:none; border-radius:5px; font-weight:bold; margin-top:10px; cursor:pointer; color:black;">+ ${escapeHtml(ti("newEntry"))}</button>
            <button type="button" data-injury-action="delete-injury" data-injury-id="${safeInjuryId}" style="width:100%; padding:8px; background:none; border:1px solid #DA3E52; color:#DA3E52; border-radius:5px; margin-top:8px; cursor:pointer; font-size:0.8em;">${escapeHtml(ti("deleteInjury"))}</button>
        `;
    } else {
        listElement.innerHTML = injuries.map(inj => {
            const last = inj.history[inj.history.length - 1];
            const safeInjuryId = escapeHtml(inj.id || "");
            const safeLocation = escapeHtml(displayLocation(inj));
            const safeDate = escapeHtml(last.date || "");
            const safePain = escapeHtml(last.pain ?? "");
            return `
                <div data-injury-action="open" data-injury-id="${safeInjuryId}" style="background:#1a1a1a; padding:15px; border-radius:8px; margin-bottom:12px; cursor:pointer; border-left:5px solid ${parseInt(last.pain, 10) === 0 ? GOLD_COLOR : RED_MARKER}; transition: 0.2s;" onmouseover="this.style.background='#222'" onmouseout="this.style.background='#1a1a1a'">
                    <div style="color:gold; font-weight:bold; font-size:1.1em;">${safeLocation}</div>
                    <div style="font-size:0.85em; color:#888; margin-top:5px;">${escapeHtml(ti("lastRecord"))}: ${safeDate} | ${escapeHtml(ti("painShort"))}: ${safePain}</div>
                </div>
            `;
        }).join("") || `<p style="color:#666; text-align:center;">${escapeHtml(ti("emptyHint"))}</p>`;
    }
}
window.openUpdateMode = (id) => {
    if(!canWriteInjury())return;
    activeLocationFilter = id;
    selectedId = id;
    const inj = injuries.find(i => i.id === id);
    if (!inj) return;
    const form = document.getElementById("injury-form");
    if (form && typeof defaultInjurySubmitHandler === "function") {
      form.onsubmit = defaultInjurySubmitHandler;
    }
    document.getElementById('notes-section').style.display = 'block';
    document.getElementById('injury-location').value = displayLocation(inj);
    document.getElementById('injury-location').disabled = true; 
    document.getElementById('injury-date').value = getToday();
    document.getElementById('injury-notes').value = "";
    document.getElementById('injury-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

document.addEventListener('DOMContentLoaded', () => {
    applyInjuryStaticTranslations();
    initMedicalVault();
    const map = document.getElementById('bodyMapContainer');
    const marker = document.getElementById('click-marker');

    if (map) {
        map.onclick = (e) => {
    if(!canWriteInjury())return;
    if (e.target.classList.contains('injury-marker')) return;
    
    const rect = map.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    marker.style.left = x + '%'; 
    marker.style.top = y + '%';
    const locationName = findZoneByCoords(x, y);
    
    selectedId = null; 
    const form = document.getElementById('injury-form');
    if (form) {
      form.reset();
      if (typeof defaultInjurySubmitHandler === "function") {
        form.onsubmit = defaultInjurySubmitHandler;
      }
    }
    document.getElementById('injury-location').disabled = false;
  document.getElementById('injury-location').value = locationName; // set localized location
    document.getElementById('injury-date').value = getToday();
    document.getElementById('coordX').value = x.toFixed(2);
    document.getElementById('coordY').value = y.toFixed(2);
    document.getElementById('notes-section').style.display = 'block';
    document.getElementById('injury-form').scrollIntoView({ behavior: 'smooth', block: 'center' });
};
    }

    const form = document.getElementById('injury-form');
    if (form) {
        form.onsubmit = async (e) => {
            e.preventDefault();
            if(!canWriteInjury()||injurySaving)return;
            const selectedPainInput = document.querySelector('input[name="pain"]:checked');
            if (!selectedPainInput) {
                alert(`${ti("saveErr")}: ${ti("choosePain010")}`);
                return;
            }
            const updateData = {
                date: document.getElementById('injury-date').value,
                pain: parseInt(selectedPainInput.value, 10),
                notes: document.getElementById('injury-notes').value,
                source: "manual",
                timestamp: Date.now()
            };
            injurySaving=true;applyMedicalVaultAccessUi();

            try {
                if (selectedId) {
                    await db.collection(INJURY_COLLECTION).doc(selectedId).update({
        pain: updateData.pain, // top-level
        date: updateData.date, // optional
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
  history: firebase.firestore.FieldValue.arrayUnion(updateData)
});

                } else {
                    await db.collection(INJURY_COLLECTION).add({
  userId: currentUserId,
  source: "manual",
  location: document.getElementById('injury-location').value,
  locationKey: findZoneKeyByCoords(document.getElementById('coordX').value, document.getElementById('coordY').value),
  coordX: document.getElementById('coordX').value,
  coordY: document.getElementById('coordY').value,
            pain: updateData.pain,          // top-level
            date: updateData.date,          // optional
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
  history: [updateData]
});

                }
                await loadInjuriesFromFirebase();
                form.reset();
                document.getElementById('notes-section').style.display = 'none';
    marker.style.left = '-100px'; // hide selection marker
            } catch (err) { alert(`${ti("saveErr")}: ${err.message}`); }
            finally{injurySaving=false;applyMedicalVaultAccessUi();}
        };
        defaultInjurySubmitHandler = form.onsubmit;
    }
});
function pacGetJsPDF() {
  return (window.jspdf && window.jspdf.jsPDF) ? window.jspdf.jsPDF : null;
}

/* =========================================================
    Injury Report PDF + Export/Delete 
========================================================= */

function pacGetAthleteNameForPdf() {
  const el = document.getElementById("user-name");
  const name = (el && el.textContent || "").trim();
  return name && name !== ti("loading") ? name : ti("athleteFallback");
}

function pacGetReportDateForPdf() {
  const d = document.getElementById("inj-report-date");
  return (d && d.value) ? d.value : getToday();
}

function pacPickInjuryForReport() {
  if (!Array.isArray(injuries) || !injuries.length) return null;
  if (typeof selectedId !== "undefined" && selectedId) {
    const bySelected = injuries.find(i => i.id === selectedId);
    if (bySelected) return bySelected;
  }
  if (typeof activeLocationFilter !== "undefined" && activeLocationFilter) {
    const byActive = injuries.find(i => i.id === activeLocationFilter);
    if (byActive) return byActive;
  }
  const sorted = injuries.slice().sort((a, b) => {
    const ad = (a.history?.[a.history.length - 1]?.date) || a.date || "0000-00-00";
    const bd = (b.history?.[b.history.length - 1]?.date) || b.date || "0000-00-00";
    return ad > bd ? -1 : 1;
  });

  return sorted[0];
}

function buildInjuryPdfLayout() {
  const inj = pacPickInjuryForReport();

  // logo
  const logo = document.getElementById("pac-pdf-logo");
  if (logo) logo.src = "../assets/images/AK_logo.png";

  // athlete/date
  const athleteEl = document.getElementById("inj-pdf-athlete");
  const dateEl = document.getElementById("inj-pdf-date");
  if (athleteEl) athleteEl.textContent = pacGetAthleteNameForPdf();
  if (dateEl) dateEl.textContent = pacGetReportDateForPdf();

  // body map img
  const bodyImg = document.getElementById("inj-pdf-body-img");
  if (bodyImg) bodyImg.src = "../assets/images/human_body_outline.png";

  // marker + meta
  const marker = document.getElementById("inj-pdf-marker");
  const loc = document.getElementById("inj-pdf-location");
  const lastPainEl = document.getElementById("inj-pdf-lastpain");

  // NEW history nodes (table)
  const rowsRoot = document.getElementById("inj-pdf-history-rows");
  const headPain = document.getElementById("inj-pdf-history-pain");

  // helper: render empty state
  const renderEmpty = () => {
    if (marker) marker.style.display = "none";
    if (loc) loc.textContent = "—";
    if (lastPainEl) lastPainEl.textContent = "—";
    if (headPain) headPain.textContent = "—";
    if (rowsRoot) {
      rowsRoot.innerHTML = `
        <div class="inj-row">
          <div class="date">—</div>
          <div class="pain">—</div>
        </div>
      `;
    }
  };

  if (!inj) {
    renderEmpty();
    return null;
  }

  // marker position (% from DB)
  if (marker) {
    marker.style.display = "block";
    marker.style.left = (inj.coordX ?? 50) + "%";
    marker.style.top  = (inj.coordY ?? 50) + "%";
  }

  if (loc) loc.textContent = displayLocation(inj) || "-";

  // history sort
  const hist = Array.isArray(inj.history) ? inj.history : [];
  const histSorted = hist.slice().sort((a, b) => (a.date > b.date ? 1 : -1));
  const last = histSorted[histSorted.length - 1] || {};

  const lastPainVal = (last.pain ?? inj.pain ?? "—");
  if (lastPainEl) lastPainEl.textContent = String(lastPainVal);

  // ===== HISTORY TABLE (mock-like) =====
  if (headPain) headPain.textContent = String(lastPainVal);

  if (rowsRoot) {
    const lastItems = histSorted.slice(-5).reverse(); // most recent first

    if (!lastItems.length) {
      rowsRoot.innerHTML = `
        <div class="inj-row">
          <div class="date">—</div>
          <div class="pain">—</div>
        </div>
      `;
    } else {
      const maxPain = Math.max(...lastItems.map(x => Number(x.pain ?? 0)));

      rowsRoot.innerHTML = lastItems.map(h => {
        const p = Number(h.pain ?? 0);
        const safePainLabel = escapeHtml(ti("painShort"));
        const painHtml = (p === maxPain && p >= 5)
          ? `${safePainLabel}: <span class="badge">${p}</span>`
          : `${safePainLabel}: ${p}`;

        return `
          <div class="inj-row">
            <div class="date">${escapeHtml(h.date || "—")}</div>
            <div class="pain">${painHtml}</div>
          </div>
        `;
      }).join("");
    }
  }

  return { inj, histSorted };
}
function renderInjuryPdfChart(histSorted) {
  if (!window.Chart) return;

  const canvas = document.getElementById("inj-pdf-line");
  if (!canvas) return;

  if (window.__injPdfLineChart instanceof Chart) {
    window.__injPdfLineChart.destroy();
  }

  const arr = Array.isArray(histSorted) ? histSorted : [];
const lastDateStr = arr.length ? (arr[arr.length - 1].date || "") : "";
const lastDate = lastDateStr ? new Date(lastDateStr + "T00:00:00") : new Date();
const fromDate = new Date(lastDate);
fromDate.setDate(fromDate.getDate() - 6); // inclusive 7-day range

const last7days = arr.filter(x => {
  const ds = x.date || "";
  if (!ds) return false;
  const d = new Date(ds + "T00:00:00");
  return d >= fromDate && d <= lastDate;
});

const labels = last7days.map(x => (x.date || "").slice(5));
const data   = last7days.map(x => Number(x.pain ?? 0));
  
  

  const ctx = canvas.getContext("2d");
  const wrap = canvas.parentElement;

  const wrapW = wrap ? wrap.clientWidth : 360;
  const wrapH = wrap ? wrap.clientHeight : 180;

  // Important: set real canvas size before creating Chart.js instance
  canvas.width = Math.floor(wrapW * 2);
  canvas.height = Math.floor(wrapH * 2);
  canvas.style.width = wrapW + "px";
  canvas.style.height = wrapH + "px";

  // gradient
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, "rgba(255,199,44,0.35)");
  grad.addColorStop(1, "rgba(255,199,44,0.02)");




  window.__injPdfLineChart = new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [{
        data,
        borderColor: "#E0A800",
        backgroundColor: grad,
        borderWidth: 4,
        tension: 0.35,
        pointRadius: 5,
        pointBorderWidth: 3,
        pointBorderColor: "#E0A800",
        pointBackgroundColor: "#ffffff",
        fill: true
      }]
    },
    options: {
      responsive: false,
      maintainAspectRatio: false,
      animation: false,
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: {
        y: {
          min: 0,
          max: 10,
          ticks: {
            stepSize: 2,
            font: { size: 9 },
            color: "rgba(0,0,0,0.55)"
          },
          grid: { color: "rgba(0,0,0,0.08)", drawBorder: false }
        },
        x: {
          ticks: {
            font: { size: 9 },
            color: "rgba(0,0,0,0.55)",
            maxRotation: 0,
            autoSkip: false
          },
          grid: { display: false }
        }
      }
    }
  });
  const lastVal = data.length ? data[data.length - 1] : 0;
  const avgVal = data.length
    ? Math.round((data.reduce((a, b) => a + b, 0) / data.length) * 10) / 10
    : 0;
  let dir = "flat"; // up / down / flat

if (data.length >= 2) {
  const first = data[0];
  const last = data[data.length - 1];
  if (last > first) {
    if (last >= 4) dir = "up";
    else dir = "flat"; // ignore tiny increase to avoid noisy warnings
  }
  else if (last < first) {
    dir = "down";
  }
}


  const elLast = document.getElementById("inj-pdf-stat-last");
  const elAvg = document.getElementById("inj-pdf-stat-avg");
const elTrend = document.querySelector("#pdf-root .inj-pdf-metrics > .inj-metric-trend .inj-metric-trend");


  if (elLast) elLast.textContent = `${lastVal}/10`;
  if (elAvg) elAvg.textContent = `${avgVal}`;

  if (elTrend) {
  elTrend.classList.remove("up","down","flat");
  elTrend.classList.add(dir);
  let arrow = ">";
  let txt = ti("trendFlat");

  if (dir === "up") {
    arrow = "^";
    txt = ti("trendUp");
  } else if (dir === "down") {
    arrow = "v";
    txt = ti("trendDown");
  }

  elTrend.innerHTML = `<span class="arrow">${arrow}</span><span class="pct">${txt}</span>`;
}



}
function pacAvg(arr){
  if (!arr.length) return 0;
  return arr.reduce((s,x)=>s+x,0) / arr.length;
}




function pacAnalyzeInjury(histSorted){
  const arr = Array.isArray(histSorted) ? histSorted : [];
  const last7 = arr.slice(-7);

  const pains = last7.map(h => Number(h.pain ?? 0));
  const last = pains.length ? pains[pains.length - 1] : 0;
  const avg  = pains.length ? pains.reduce((a,b)=>a+b,0) / pains.length : 0;
  const max7 = pains.length ? Math.max(...pains) : 0;
  let slope = 0;
  if (pains.length >= 2){
    const n = pains.length;
    const xs = pains.map((_,i)=>i);
    const sumX = xs.reduce((a,b)=>a+b,0);
    const sumY = pains.reduce((a,b)=>a+b,0);
    const sumXY = xs.reduce((s,x,i)=>s + x*pains[i], 0);
    const sumXX = xs.reduce((s,x)=>s + x*x, 0);
    const denom = (n*sumXX - sumX*sumX) || 1;
    slope = (n*sumXY - sumX*sumY) / denom;
  }

  const trend =
    slope > 0.18 ? "up" :
    slope < -0.18 ? "down" :
    "flat";
  let level = "low";
if (last >= 7) {
  level = "high";
}
else if (last >= 5) {
  level = "moderate";
}
else if (trend === "up" && last >= 4) {
  level = "moderate";
}
else {
  level = "low";
}


  const lang = pacInjuryLang();
  const riskCopy = {
    uk: {
      low: {
        title: "Низький ризик",
        sub: "Статус: низький біль і стабільна або позитивна динаміка.",
        recs: [
          "Тримайте тренувальне навантаження контрольованим.",
          "Уникайте різких піків навантаження.",
          "Пріоритезуйте розминку, мобільність і відновлення.",
          "Відстежуйте біль щодня протягом 7 днів."
        ]
      },
      moderate: {
        title: "Пильне спостереження",
        sub: "Статус: біль зростає або потребує жорсткішого контролю.",
        recs: [
          "Зменшіть навантаження на 20-40% на 3-5 днів.",
          "Уникайте тригерних рухів.",
          "Додайте відновлення та якісний сон.",
          "Якщо за 48-72 год немає покращення, скоригуйте план."
        ]
      },
      high: {
        title: "Високий ризик",
        sub: "Статус: високий біль або чітко негативний тренд.",
        recs: [
          "Негайно припиніть провокативне навантаження.",
          "Проведіть повторну оцінку з тренером або спеціалістом.",
          "Пріоритезуйте відновлення та протизапальну рутину.",
          "Щодня моніторте стан до стабілізації симптомів."
        ]
      }
    },
    en: {
      low: {
        title: "Low risk",
        sub: "Status: low pain with stable or positive dynamics.",
        recs: [
          "Keep training load controlled.",
          "Avoid sudden load spikes.",
          "Prioritize warm-up, mobility and recovery.",
          "Track pain daily for 7 days."
        ]
      },
      moderate: {
        title: "Watch closely",
        sub: "Status: pain is rising or requires tighter control.",
        recs: [
          "Reduce load by 20-40% for 3-5 days.",
          "Avoid trigger movements.",
          "Add recovery work and quality sleep.",
          "If no improvement in 48-72h, adjust the plan."
        ]
      },
      high: {
        title: "High risk",
        sub: "Status: high pain or sharp negative trend.",
        recs: [
          "Stop provocative load immediately.",
          "Reassess with coach or specialist.",
          "Prioritize recovery and anti-inflammatory routine.",
          "Monitor daily until symptoms stabilize."
        ]
      }
    },
    de: {
      low: {
        title: "Niedriges Risiko",
        sub: "Status: geringe Schmerzen bei stabiler oder positiver Dynamik.",
        recs: [
          "Trainingslast kontrolliert halten.",
          "Plötzliche Belastungsspitzen vermeiden.",
          "Auf Warm-up, Mobilität und Regeneration fokussieren.",
          "Schmerz 7 Tage täglich erfassen."
        ]
      },
      moderate: {
        title: "Eng beobachten",
        sub: "Status: Schmerzen steigen oder brauchen engere Kontrolle.",
        recs: [
          "Belastung für 3-5 Tage um 20-40% reduzieren.",
          "Auslösende Bewegungen vermeiden.",
          "Mehr Regeneration und Schlafqualität einbauen.",
          "Wenn in 48-72h keine Besserung: Plan anpassen."
        ]
      },
      high: {
        title: "Hohes Risiko",
        sub: "Status: hohe Schmerzen oder klar negativer Trend.",
        recs: [
          "Provokative Belastung sofort stoppen.",
          "Mit Coach oder Spezialist neu beurteilen.",
          "Regeneration und entzündungsarme Routine priorisieren.",
          "Täglich monitoren bis zur Stabilisierung."
        ]
      }
    },
    es: {
      low: {
        title: "Riesgo bajo",
        sub: "Estado: dolor bajo con dinámica estable o positiva.",
        recs: [
          "Mantén la carga de entrenamiento controlada.",
          "Evita picos bruscos de carga.",
          "Prioriza calentamiento, movilidad y recuperación.",
          "Controla el dolor a diario durante 7 días."
        ]
      },
      moderate: {
        title: "Vigilar de cerca",
        sub: "Estado: el dolor sube o requiere más control.",
        recs: [
          "Reduce la carga un 20-40% durante 3-5 días.",
          "Evita movimientos que desencadenen dolor.",
          "Añade recuperación y mejor sueño.",
          "Si no mejora en 48-72h, ajusta el plan."
        ]
      },
      high: {
        title: "Riesgo alto",
        sub: "Estado: dolor alto o tendencia claramente negativa.",
        recs: [
          "Detén de inmediato la carga provocativa.",
          "Reevalúa con entrenador o especialista.",
          "Prioriza recuperación y rutina antiinflamatoria.",
          "Monitorea a diario hasta estabilizar síntomas."
        ]
      }
    },
    ru: {
      low: {
        title: "Низкий риск",
        sub: "Статус: низкая боль и стабильная или позитивная динамика.",
        recs: [
          "Держите тренировочную нагрузку под контролем.",
          "Избегайте резких пиков нагрузки.",
          "Приоритет: разминка, мобильность и восстановление.",
          "Отслеживайте боль ежедневно в течение 7 дней."
        ]
      },
      moderate: {
        title: "Нужен контроль",
        sub: "Статус: боль растет или требует более строгого контроля.",
        recs: [
          "Снизьте нагрузку на 20-40% на 3-5 дней.",
          "Избегайте триггерных движений.",
          "Добавьте восстановление и качественный сон.",
          "Если нет улучшения за 48-72ч, скорректируйте план."
        ]
      },
      high: {
        title: "Высокий риск",
        sub: "Статус: высокая боль или четко негативный тренд.",
        recs: [
          "Немедленно остановите провокативную нагрузку.",
          "Переоцените состояние с тренером или специалистом.",
          "Приоритет: восстановление и противовоспалительная рутина.",
          "Ежедневно мониторьте до стабилизации симптомов."
        ]
      }
    },
    pt: {
      low: {
        title: "Risco baixo",
        sub: "Status: dor baixa com dinâmica estável ou positiva.",
        recs: [
          "Mantenha a carga de treino controlada.",
          "Evite picos súbitos de carga.",
          "Priorize aquecimento, mobilidade e recuperação.",
          "Monitore a dor diariamente por 7 dias."
        ]
      },
      moderate: {
        title: "Observar de perto",
        sub: "Status: a dor está subindo ou exige controle mais rígido.",
        recs: [
          "Reduza a carga em 20-40% por 3-5 dias.",
          "Evite movimentos gatilho.",
          "Adicione recuperação e sono de qualidade.",
          "Se não melhorar em 48-72h, ajuste o plano."
        ]
      },
      high: {
        title: "Risco alto",
        sub: "Status: dor alta ou tendência claramente negativa.",
        recs: [
          "Interrompa imediatamente a carga provocativa.",
          "Reavalie com treinador ou especialista.",
          "Priorize recuperação e rotina anti-inflamatória.",
          "Monitore diariamente até estabilizar os sintomas."
        ]
      }
    }
  };
  const rc = riskCopy[lang] || riskCopy.en;
  const dict = {
    low: { cls:"risk-low", title: rc.low.title, icon:"OK", sub: rc.low.sub, recs: rc.low.recs },
    moderate: { cls:"risk-mod", title: rc.moderate.title, icon:"!", sub: rc.moderate.sub, recs: rc.moderate.recs },
    high: { cls:"risk-high", title: rc.high.title, icon:"!", sub: rc.high.sub, recs: rc.high.recs }
  };

const meta = dict[level];

return {
  level,
  cls: meta.cls,
  title: meta.title,
  icon: meta.icon,
  sub: meta.sub,
  recs: meta.recs,
  last: Math.round(last*10)/10,
  avg: Math.round(avg*10)/10,
  max7,
  trend,
  slope
};
}



function pacRenderInjuryRiskBlock(histSorted) {
  const box = document.getElementById("inj-pdf-risk");
  if (!box) return;

  const a = pacAnalyzeInjury(histSorted);
  const pdfRoot = document.getElementById("pdf-root");
if (pdfRoot) {
  pdfRoot.classList.remove("risk-low","risk-mod","risk-high");
  pdfRoot.classList.add(a.cls);
}
  box.classList.remove("risk-low", "risk-mod", "risk-high");
  box.classList.add(a.cls);
  const iconEl  = document.getElementById("inj-pdf-risk-icon");
  const titleEl = document.getElementById("inj-pdf-risk-title");
  const subEl   = document.getElementById("inj-pdf-risk-sub");

  if (iconEl)  iconEl.textContent  = a.icon;
  if (titleEl) titleEl.textContent = a.title;
  if (subEl)   subEl.textContent   = a.sub;
  const range = document.getElementById("inj-pdf-risk-range");
  if (range && Array.isArray(histSorted) && histSorted.length) {
    const from = histSorted[0].date || "—";
    const to   = histSorted[histSorted.length - 1].date || "—";
    range.textContent = `${from} – ${to}`;
  } else if (range) {
    range.textContent = "—";
  }
  const listEl = document.getElementById("inj-pdf-risk-list");
  if (listEl) {
    listEl.innerHTML = a.recs.map(t => `<li>${t}</li>`).join("");
  }
  const hRisk = document.getElementById("inj-pdf-history-risk");
  if (hRisk) hRisk.textContent = a.title;
    const page =
    document.getElementById("pac-injury-pdf-page") ||
    document.querySelector("#pdf-root .pac-pdf-page");

  if (!page) return;

  const vars = (a.level === "low") ? {
    risk: "#2e7d32",
    g1: "rgba(46,125,50,.78)",
    g2: "rgba(46,125,50,.35)",
    bg: "#eef7ee",
    border: "rgba(46,125,50,.35)"
  } : (a.level === "moderate") ? {
    risk: "#b26a00",
    g1: "rgba(178,106,0,.72)",
    g2: "rgba(178,106,0,.32)",
    bg: "#fff5e6",
    border: "rgba(178,106,0,.40)"
  } : {
    risk: "#b3261e",
    g1: "rgba(179,38,30,.70)",
    g2: "rgba(179,38,30,.30)",
    bg: "#fdecec",
    border: "rgba(179,38,30,.40)"
  };

  page.style.setProperty("--risk", vars.risk);
  page.style.setProperty("--riskGrad1", vars.g1);
  page.style.setProperty("--riskGrad2", vars.g2);
  page.style.setProperty("--riskBg", vars.bg);
  page.style.setProperty("--riskBorder", vars.border);
}




window.generateInjuryReportPDF = async function generateInjuryReportPDF() {
  let page = null;

  try {
    // 1) show PDF layout
    document.body.classList.add("pac-report-mode");

    // 2) wait layout apply (important when #pdf-root was hidden)
    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);

    // 3) find page first (so we can safely wait images inside it)
    page = document.querySelector("#pdf-root .pac-pdf-page");
    if (!page) throw new Error("PDF page not found: #pdf-root .pac-pdf-page");

    // 4) fill layout data (sets logo/body img/texts/history)
    const pack = buildInjuryPdfLayout();

    // 5) ensure chart canvas exists (chart card must be in PDF HTML)
    const lineCanvas = document.getElementById("inj-pdf-line");
    if (!lineCanvas) {
      console.warn("Chart canvas not found: #inj-pdf-line. PDF will be generated without chart.");
    }

    // 6) wait one more frame so all sizes are real
    await new Promise(requestAnimationFrame);

    // 7) draw chart + risk (only if data exists)
    if (pack && pack.histSorted) {
      if (lineCanvas) renderInjuryPdfChart(pack.histSorted);
      pacRenderInjuryRiskBlock(pack.histSorted);
    }

    // 8) wait for fonts
    if (document.fonts && document.fonts.ready) {
      try { await document.fonts.ready; } catch (_) {}
    }

    // 9) wait images (logo + body image) inside PAGE
    const imgs = Array.from(page.querySelectorAll("img"));
    await Promise.all(imgs.map(async (img) => {
      try {
        if (!img.complete) await img.decode();
      } catch (_) {}
    }));

    // 10) give Chart.js a moment to paint into canvas
    await new Promise(r => setTimeout(r, 220));

    // 11) render page to canvas
    const canvas = await html2canvas(page, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
      allowTaint: true,
      logging: false,
      scrollX: 0,
      scrollY: 0,
      width: page.offsetWidth,
      height: page.offsetHeight,
      windowWidth: page.offsetWidth,
      windowHeight: page.offsetHeight
    });

    // 12) make PDF
    const imgData = canvas.toDataURL("image/jpeg", 0.95);
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF("p", "mm", "a4");
    pdf.addImage(imgData, "JPEG", 0, 0, 210, 297);

    const dateStr = pacGetReportDateForPdf();
    pdf.save(`Injury_Report_${dateStr}.pdf`);

    } catch (e) {
    console.error("PDF error RAW:", e);
    console.error("PDF error type:", typeof e);
    console.error("PDF error keys:", e && typeof e === "object" ? Object.keys(e) : "-");
    console.error("PDF error message:", e?.message);
    console.error("PDF error stack:", e?.stack);
    const msg =
      (e && e.message) ? e.message :
      (typeof e === "string") ? e :
      (e ? JSON.stringify(e) : "Unknown error (empty reject)");

    alert(ti("pdfErrorPrefix") + msg);
  }
  finally {
    document.body.classList.remove("pac-report-mode");
  }
};

/* ========= Export / Delete Injury data (Firestore) ========= */

window.pacExportMyInjuryData = async function pacExportMyInjuryData() {
  try {
    if (!currentUserId) return alert(ti("noUserId"));

    const snap = await db.collection(INJURY_COLLECTION)
      .where("userId", "==", currentUserId)
      .get();

    const data = [];
    snap.forEach(doc => data.push({ id: doc.id, ...doc.data() }));

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `injury_data_${currentUserId}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
  } catch (e) {
    console.error(e);
    alert(ti("exportErr"));
  }
};

window.pacDeleteMyInjuryData = async function pacDeleteMyInjuryData() {
  if(!canWriteInjury())return;
  try {
    if (!currentUserId) return alert(ti("noUserId"));
    if (!confirm(ti("deleteAllAsk"))) return;

    const snap = await db.collection(INJURY_COLLECTION)
      .where("userId", "==", currentUserId)
      .get();

    const batch = db.batch();
    snap.forEach(doc => batch.delete(doc.ref));
    await batch.commit();

    injuries = [];
    activeLocationFilter = null;
    selectedId = null;
    refreshUI();

    alert(ti("deleteAllOk"));
  } catch (e) {
    console.error(e);
    alert(ti("deleteAllErr"));
  }
};
window.addEventListener("unhandledrejection", (ev) => {
  console.error("UNHANDLED REJECTION:", ev.reason);
});
window.addEventListener("error", (ev) => {
  console.error("WINDOW ERROR:", ev.error || ev.message);
});


window.addEventListener("pac:lang-changed", () => {
  applyInjuryStaticTranslations();
  applyMedicalVaultAccessUi();
  renderMedicalDocs();
  refreshUI();
  if (document.body.classList.contains("pac-report-mode")) {
    const pack = buildInjuryPdfLayout();
    if (pack && pack.histSorted) {
      renderInjuryPdfChart(pack.histSorted);
      pacRenderInjuryRiskBlock(pack.histSorted);
    }
  }
});
