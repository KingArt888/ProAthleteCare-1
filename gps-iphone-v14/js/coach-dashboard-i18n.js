/* Coach workspace translations. Every phrase has all six supported locales. */
(function(root){'use strict';
 const languages=['uk','en','de','es','ru','pt'];
 const keys={
  "docTitle": "ProAthleteCare | Coach Workspace",
  "tagline": "Online training and professional athlete support",
  "navCoachDashboard": "Coach Workspace",
  "navCoachWeek": "Week Editor",
  "navCoachDate": "Date Plan",
  "navSystemAdmin": "Admin Panel",
  "pageTitle": "Coach Workspace",
  "refresh": "Refresh",
  "openWeek": "Open Week",
  "datePlan": "Date Plan",
  "kickerAlerts": "ALERTS",
  "kickerDecisions": "QUICK DECISIONS",
  "titleActions": "Today actions",
  "kickerTeam": "TEAM STATUS",
  "kickerEarnings": "COACH EARNINGS",
  "kickerClients": "MY CLIENTS",
  "kickerNotes": "COACH NOTES",
  "searchPlaceholder": "Search (name / email / uid)",
  "notesEmpty": "No notes yet.",
  "teamLabel": "Team",
  "sportLabel": "Sport",
  "online": "online",
  "minShort": "m",
  "hourShort": "h",
  "dayShort": "d",
  "inviteLinkNotReady": "Invite link not ready.",
  "inviteLinkCopied": "Invite link copied.",
  "invitePrompt": "Copy invite link:",
  "athlete": "Athlete",
  "tableActions": "ACTIONS",
  "adjust": "Adjust",
  "clientsCount": "clients",
  "mrr": "MRR",
  "myPercent": "My %",
  "expected": "Expected",
  "paid": "Paid",
  "tableReadiness": "READINESS",
  "message": "Message",
  "coachLabel": "Coach",
  "inviteCode": "Invite code",
  "inviteNotSet": "not set",
  "copyInviteLink": "Copy Invite Link",
  "cannotLoadClients": "Cannot load clients",
  "accessDenied": "Access denied."
};
 const messages={
  "Attention": {"en":"Attention","uk":"Увага","de":"Aufmerksamkeit","es":"Atención","ru":"Внимание","pt":"Atenção"},
  "Futsal": {"en":"Futsal","uk":"Футзал","de":"Futsal","es":"Fútbol sala","ru":"Футзал","pt":"Futsal"},
  "ProAthleteCare | Coach Workspace": {
    "en": "ProAthleteCare | Coach Workspace",
    "uk": "ProAthleteCare | Робочий простір тренера",
    "de": "ProAthleteCare | Trainerbereich",
    "es": "ProAthleteCare | Área del entrenador",
    "ru": "ProAthleteCare | Кабинет тренера",
    "pt": "ProAthleteCare | Área do treinador"
  },
  "Online training and professional athlete support": {
    "en": "Online training and professional athlete support",
    "uk": "Онлайн-тренінг та професійний супровід атлетів",
    "de": "Online-Training und professionelle Betreuung von Athleten",
    "es": "Entrenamiento en línea y acompañamiento profesional de deportistas",
    "ru": "Онлайн-тренировки и профессиональное сопровождение спортсменов",
    "pt": "Treino online e acompanhamento profissional de atletas"
  },
  "Coach Workspace": {
    "en": "Coach Workspace",
    "uk": "Робочий простір тренера",
    "de": "Trainerbereich",
    "es": "Área del entrenador",
    "ru": "Кабинет тренера",
    "pt": "Área do treinador"
  },
  "Week Editor": {
    "en": "Week Editor",
    "uk": "Редактор тижня",
    "de": "Wochenplanung",
    "es": "Planificador semanal",
    "ru": "Редактор недели",
    "pt": "Planeamento semanal"
  },
  "Date Plan": {
    "en": "Date Plan",
    "uk": "План за датами",
    "de": "Tagesplanung",
    "es": "Plan por fecha",
    "ru": "План по датам",
    "pt": "Plano por data"
  },
  "Admin Panel": {
    "en": "Admin Panel",
    "uk": "Адмін-панель",
    "de": "Administration",
    "es": "Administración",
    "ru": "Администрирование",
    "pt": "Administração"
  },
  "Refresh": {
    "en": "Refresh",
    "uk": "Оновити",
    "de": "Aktualisieren",
    "es": "Actualizar",
    "ru": "Обновить",
    "pt": "Atualizar"
  },
  "Open Week": {
    "en": "Open Week",
    "uk": "Відкрити тиждень",
    "de": "Woche öffnen",
    "es": "Abrir semana",
    "ru": "Открыть неделю",
    "pt": "Abrir semana"
  },
  "ALERTS": {
    "en": "ALERTS",
    "uk": "УВАГА",
    "de": "HINWEISE",
    "es": "AVISOS",
    "ru": "ВНИМАНИЕ",
    "pt": "AVISOS"
  },
  "QUICK DECISIONS": {
    "en": "QUICK DECISIONS",
    "uk": "ШВИДКІ РІШЕННЯ",
    "de": "TRAINERÜBERSICHT",
    "es": "RESUMEN DEL ENTRENADOR",
    "ru": "ОБЗОР ТРЕНЕРА",
    "pt": "RESUMO DO TREINADOR"
  },
  "Today actions": {
    "en": "Today actions",
    "uk": "Дії на сьогодні",
    "de": "Heutige Aufgaben",
    "es": "Acciones de hoy",
    "ru": "Действия на сегодня",
    "pt": "Ações de hoje"
  },
  "TEAM STATUS": {
    "en": "TEAM STATUS",
    "uk": "СТАН КОМАНДИ",
    "de": "TEAMSTATUS",
    "es": "ESTADO DEL EQUIPO",
    "ru": "СОСТОЯНИЕ КОМАНДЫ",
    "pt": "ESTADO DA EQUIPA"
  },
  "COACH EARNINGS": {
    "en": "COACH EARNINGS",
    "uk": "ДОХІД ТРЕНЕРА",
    "de": "TRAINERVERGÜTUNG",
    "es": "INGRESOS DEL ENTRENADOR",
    "ru": "ДОХОД ТРЕНЕРА",
    "pt": "RENDIMENTOS DO TREINADOR"
  },
  "MY CLIENTS": {
    "en": "MY CLIENTS",
    "uk": "МОЇ КЛІЄНТИ",
    "de": "MEINE KLIENTEN",
    "es": "MIS CLIENTES",
    "ru": "МОИ КЛИЕНТЫ",
    "pt": "OS MEUS CLIENTES"
  },
  "COACH NOTES": {
    "en": "COACH NOTES",
    "uk": "НОТАТКИ ТРЕНЕРА",
    "de": "TRAINERNOTIZEN",
    "es": "NOTAS DEL ENTRENADOR",
    "ru": "ЗАМЕТКИ ТРЕНЕРА",
    "pt": "NOTAS DO TREINADOR"
  },
  "Search (name / email / uid)": {
    "en": "Search (name / email / uid)",
    "uk": "Пошук (ім'я / email / uid)",
    "de": "Suchen (Name / E-Mail / Nutzer-ID)",
    "es": "Buscar (nombre / correo / ID)",
    "ru": "Поиск (имя / почта / ID)",
    "pt": "Pesquisar (nome / email / ID)"
  },
  "No notes yet.": {
    "en": "No notes yet.",
    "uk": "Нотаток поки немає.",
    "de": "Noch keine Notizen.",
    "es": "Todavía no hay notas.",
    "ru": "Заметок пока нет.",
    "pt": "Ainda não há notas."
  },
  "Team": {
    "en": "Team",
    "uk": "Команда",
    "de": "Team",
    "es": "Equipo",
    "ru": "Команда",
    "pt": "Equipa"
  },
  "Sport": {
    "en": "Sport",
    "uk": "Спорт",
    "de": "Sportart",
    "es": "Deporte",
    "ru": "Спорт",
    "pt": "Modalidade"
  },
  "online": {
    "en": "online",
    "uk": "онлайн",
    "de": "online",
    "es": "en línea",
    "ru": "онлайн",
    "pt": "online"
  },
  "m": {
    "en": "m",
    "uk": "хв",
    "de": "Min.",
    "es": "min",
    "ru": "мин",
    "pt": "min"
  },
  "h": {
    "en": "h",
    "uk": "г",
    "de": "Std.",
    "es": "h",
    "ru": "ч",
    "pt": "h"
  },
  "d": {
    "en": "d",
    "uk": "д",
    "de": "Tg.",
    "es": "d",
    "ru": "д",
    "pt": "d"
  },
  "Invite link not ready.": {
    "en": "Invite link not ready.",
    "uk": "Інвайт-лінк ще не готовий.",
    "de": "Der Einladungslink ist noch nicht verfügbar.",
    "es": "El enlace de invitación aún no está disponible.",
    "ru": "Ссылка-приглашение ещё не готова.",
    "pt": "A ligação de convite ainda não está disponível."
  },
  "Invite link copied.": {
    "en": "Invite link copied.",
    "uk": "Інвайт-лінк скопійовано.",
    "de": "Einladungslink kopiert.",
    "es": "Enlace de invitación copiado.",
    "ru": "Ссылка-приглашение скопирована.",
    "pt": "Ligação de convite copiada."
  },
  "Copy invite link:": {
    "en": "Copy invite link:",
    "uk": "Скопіюй інвайт-лінк:",
    "de": "Einladungslink kopieren:",
    "es": "Copiar enlace de invitación:",
    "ru": "Скопируйте ссылку-приглашение:",
    "pt": "Copiar ligação de convite:"
  },
  "Athlete": {
    "en": "Athlete",
    "uk": "Атлет",
    "de": "Athlet",
    "es": "Deportista",
    "ru": "Спортсмен",
    "pt": "Atleta"
  },
  "ACTIONS": {
    "en": "ACTIONS",
    "uk": "ДІЇ",
    "de": "AKTIONEN",
    "es": "ACCIONES",
    "ru": "ДЕЙСТВИЯ",
    "pt": "AÇÕES"
  },
  "Adjust": {
    "en": "Adjust",
    "uk": "Корекція",
    "de": "Anpassen",
    "es": "Ajustar",
    "ru": "Коррекция",
    "pt": "Ajustar"
  },
  "clients": {
    "en": "clients",
    "uk": "клієнтів",
    "de": "Klienten",
    "es": "clientes",
    "ru": "клиентов",
    "pt": "clientes"
  },
  "MRR": {
    "en": "MRR",
    "uk": "MRR",
    "de": "Monatlich wiederkehrender Umsatz",
    "es": "Ingresos recurrentes mensuales",
    "ru": "Ежемесячный регулярный доход",
    "pt": "Receita recorrente mensal"
  },
  "My %": {
    "en": "My %",
    "uk": "Мій %",
    "de": "Mein Anteil",
    "es": "Mi porcentaje",
    "ru": "Мой процент",
    "pt": "A minha percentagem"
  },
  "Expected": {
    "en": "Expected",
    "uk": "Очікується",
    "de": "Erwartet",
    "es": "Previsto",
    "ru": "Ожидается",
    "pt": "Previsto"
  },
  "Paid": {
    "en": "Paid",
    "uk": "Виплачено",
    "de": "Ausgezahlt",
    "es": "Pagado",
    "ru": "Выплачено",
    "pt": "Pago"
  },
  "READINESS": {
    "en": "READINESS",
    "uk": "ГОТОВНІСТЬ",
    "de": "BEREITSCHAFT",
    "es": "PREPARACIÓN",
    "ru": "ГОТОВНОСТЬ",
    "pt": "PRONTIDÃO"
  },
  "Message": {
    "en": "Message",
    "uk": "Повідомлення",
    "de": "Nachricht",
    "es": "Mensaje",
    "ru": "Сообщение",
    "pt": "Mensagem"
  },
  "Coach": {
    "en": "Coach",
    "uk": "Тренер",
    "de": "Trainer",
    "es": "Entrenador",
    "ru": "Тренер",
    "pt": "Treinador"
  },
  "Invite code": {
    "en": "Invite code",
    "uk": "Інвайт-код",
    "de": "Einladungscode",
    "es": "Código de invitación",
    "ru": "Код приглашения",
    "pt": "Código de convite"
  },
  "not set": {
    "en": "not set",
    "uk": "не задано",
    "de": "nicht festgelegt",
    "es": "sin definir",
    "ru": "не задан",
    "pt": "não definido"
  },
  "Copy Invite Link": {
    "en": "Copy Invite Link",
    "uk": "Скопіювати інвайт-лінк",
    "de": "Einladungslink kopieren",
    "es": "Copiar enlace de invitación",
    "ru": "Скопировать ссылку-приглашение",
    "pt": "Copiar ligação de convite"
  },
  "Cannot load clients": {
    "en": "Cannot load clients",
    "uk": "Не вдалось завантажити клієнтів",
    "de": "Klienten konnten nicht geladen werden",
    "es": "No se pueden cargar los clientes",
    "ru": "Не удалось загрузить клиентов",
    "pt": "Não foi possível carregar os clientes"
  },
  "Access denied.": {
    "en": "Access denied.",
    "uk": "Доступ заборонено.",
    "de": "Zugriff verweigert.",
    "es": "Acceso denegado.",
    "ru": "Доступ запрещён.",
    "pt": "Acesso negado."
  },
  "Create drill": {
    "en": "Create drill",
    "uk": "Створити вправу",
    "de": "Übung erstellen",
    "es": "Crear ejercicio",
    "ru": "Создать упражнение",
    "pt": "Criar exercício"
  },
  "Visits are separate from wellbeing and training completion. Registration is not a visit.": {
    "en": "Visits are separate from wellbeing and training completion. Registration is not a visit.",
    "uk": "Візити показані окремо від здоров’я та виконання тренувань. Реєстрація не є візитом.",
    "de": "Besuche werden getrennt von Befinden und Trainingsdurchführung erfasst. Eine Registrierung zählt nicht als Besuch.",
    "es": "Las visitas se muestran por separado del bienestar y del cumplimiento del entrenamiento. Registrarse no cuenta como visita.",
    "ru": "Посещения показаны отдельно от самочувствия и выполнения тренировок. Регистрация не считается посещением.",
    "pt": "As visitas são apresentadas separadamente do bem-estar e da realização dos treinos. O registo não conta como visita."
  },
  "Active · 7 days": {
    "en": "Active · 7 days",
    "uk": "Активні · 7 днів",
    "de": "Aktiv · 7 Tage",
    "es": "Activos · 7 días",
    "ru": "Активные · 7 дней",
    "pt": "Ativos · 7 dias"
  },
  "Users · all": {
    "en": "Users · all",
    "uk": "Користувачі · усі",
    "de": "Alle Nutzer",
    "es": "Todos los usuarios",
    "ru": "Все пользователи",
    "pt": "Todos os utilizadores"
  },
  "Without recent visits": {
    "en": "Without recent visits",
    "uk": "Без недавніх візитів",
    "de": "Ohne kürzliche Besuche",
    "es": "Sin visitas recientes",
    "ru": "Без недавних посещений",
    "pt": "Sem visitas recentes"
  },
  "Test": {
    "en": "Test",
    "uk": "Тестові",
    "de": "Testkonten",
    "es": "Prueba",
    "ru": "Тестовые",
    "pt": "Teste"
  },
  "Client account state": {
    "en": "Client account state",
    "uk": "Стан акаунта клієнта",
    "de": "Kontostatus des Klienten",
    "es": "Estado de la cuenta del cliente",
    "ru": "Состояние аккаунта клиента",
    "pt": "Estado da conta do cliente"
  },
  "Client": {
    "en": "Client",
    "uk": "Клієнт",
    "de": "Klient",
    "es": "Cliente",
    "ru": "Клиент",
    "pt": "Cliente"
  },
  "Activity": {
    "en": "Activity",
    "uk": "Активність",
    "de": "Aktivität",
    "es": "Actividad",
    "ru": "Активность",
    "pt": "Atividade"
  },
  "Last visit": {
    "en": "Last visit",
    "uk": "Останній візит",
    "de": "Letzter Besuch",
    "es": "Última visita",
    "ru": "Последнее посещение",
    "pt": "Última visita"
  },
  "Test account": {
    "en": "Test account",
    "uk": "Тестовий акаунт",
    "de": "Testkonto",
    "es": "Cuenta de prueba",
    "ru": "Тестовый аккаунт",
    "pt": "Conta de teste"
  },
  "Account disabled": {
    "en": "Account disabled",
    "uk": "Акаунт неактивний",
    "de": "Konto deaktiviert",
    "es": "Cuenta desactivada",
    "ru": "Аккаунт отключён",
    "pt": "Conta desativada"
  },
  "Visited within 7 days": {
    "en": "Visited within 7 days",
    "uk": "Заходив за 7 днів",
    "de": "Besuch in den letzten 7 Tagen",
    "es": "Visita en los últimos 7 días",
    "ru": "Заходил за последние 7 дней",
    "pt": "Visitou nos últimos 7 dias"
  },
  "No recent visits": {
    "en": "No recent visits",
    "uk": "Давно не заходив",
    "de": "Keine kürzlichen Besuche",
    "es": "Sin visitas recientes",
    "ru": "Давно не заходил",
    "pt": "Sem visitas recentes"
  },
  "No confirmed visit": {
    "en": "No confirmed visit",
    "uk": "Візит не підтверджено",
    "de": "Kein bestätigter Besuch",
    "es": "Sin visita confirmada",
    "ru": "Посещение не подтверждено",
    "pt": "Sem visita confirmada"
  },
  "Details": {
    "en": "Details",
    "uk": "Деталі",
    "de": "Details",
    "es": "Detalles",
    "ru": "Подробнее",
    "pt": "Detalhes"
  },
  "No clients here yet": {
    "en": "No clients here yet",
    "uk": "Тут поки немає клієнтів",
    "de": "Hier sind noch keine Klienten",
    "es": "Todavía no hay clientes aquí",
    "ru": "Здесь пока нет клиентов",
    "pt": "Ainda não há clientes aqui"
  },
  "Other accounts are available under Users. Activity appears after a workspace visit.": {
    "en": "Other accounts are available under Users. Activity appears after a workspace visit.",
    "uk": "Решта акаунтів доступні в «Користувачах». Активність з’явиться після відвідування кабінету.",
    "de": "Weitere Konten finden Sie unter „Nutzer“. Aktivität wird nach einem Besuch des persönlichen Bereichs angezeigt.",
    "es": "Las demás cuentas están en «Usuarios». La actividad aparece tras una visita al área personal.",
    "ru": "Остальные аккаунты доступны в разделе «Пользователи». Активность появится после посещения кабинета.",
    "pt": "As restantes contas estão em «Utilizadores». A atividade aparece após uma visita à área pessoal."
  },
  "First 200 accounts": {
    "en": "First 200 accounts",
    "uk": "Перші 200 акаунтів",
    "de": "Erste 200 Konten",
    "es": "Primeras 200 cuentas",
    "ru": "Первые 200 аккаунтов",
    "pt": "Primeiras 200 contas"
  },
  "Visited · 24 hours": {
    "en": "Visited · 24 hours",
    "uk": "Заходили · 24 години",
    "de": "Besuche · 24 Stunden",
    "es": "Visitas · 24 horas",
    "ru": "Заходили · 24 часа",
    "pt": "Visitas · 24 horas"
  },
  "Users · all accounts": {
    "en": "Users · all accounts",
    "uk": "Користувачі · усі акаунти",
    "de": "Nutzer · alle Konten",
    "es": "Usuarios · todas las cuentas",
    "ru": "Пользователи · все аккаунты",
    "pt": "Utilizadores · todas as contas"
  },
  "Fresh Wellness": {
    "en": "Fresh Wellness",
    "uk": "Свіжий Wellness",
    "de": "Aktuelles Befinden",
    "es": "Bienestar reciente",
    "ru": "Свежее самочувствие",
    "pt": "Bem-estar recente"
  },
  "Reviewed clients": {
    "en": "Reviewed clients",
    "uk": "Переглянуто клієнтів",
    "de": "Geprüfte Klienten",
    "es": "Clientes revisados",
    "ru": "Клиентов просмотрено",
    "pt": "Clientes analisados"
  },
  "Could not load clients": {
    "en": "Could not load clients",
    "uk": "Не вдалося завантажити клієнтів",
    "de": "Klienten konnten nicht geladen werden",
    "es": "No se pudieron cargar los clientes",
    "ru": "Не удалось загрузить клиентов",
    "pt": "Não foi possível carregar os clientes"
  },
  "Press Refresh to retry. Health status is unknown.": {
    "en": "Press Refresh to retry. Health status is unknown.",
    "uk": "Натисни «Оновити», щоб повторити. Стан спортсменів невідомий.",
    "de": "Klicken Sie auf „Aktualisieren“, um es erneut zu versuchen. Der Gesundheitszustand ist unbekannt.",
    "es": "Pulsa «Actualizar» para reintentar. Se desconoce el estado de salud.",
    "ru": "Нажмите «Обновить», чтобы повторить. Состояние здоровья неизвестно.",
    "pt": "Prima «Atualizar» para tentar novamente. O estado de saúde é desconhecido."
  },
  "Who needs attention": {
    "en": "Who needs attention",
    "uk": "Кому потрібна увага",
    "de": "Wer braucht Aufmerksamkeit?",
    "es": "Quién necesita atención",
    "ru": "Кому нужно внимание",
    "pt": "Quem precisa de atenção"
  },
  "Review prompts from recorded data. These are not diagnoses or automatic programme changes.": {
    "en": "Review prompts from recorded data. These are not diagnoses or automatic programme changes.",
    "uk": "Сигнали для перегляду за записами спортсмена. Не діагноз і не автоматична зміна програми.",
    "de": "Prüfhinweise aus erfassten Daten. Keine Diagnosen oder automatischen Programmänderungen.",
    "es": "Avisos de revisión basados en datos registrados. No son diagnósticos ni cambios automáticos del programa.",
    "ru": "Сигналы для проверки по записям спортсмена. Это не диагнозы и не автоматические изменения программы.",
    "pt": "Indicações de revisão baseadas nos dados registados. Não são diagnósticos nem alterações automáticas do programa."
  },
  "No recent report": {
    "en": "No recent report",
    "uk": "Немає свіжого звіту",
    "de": "Kein aktueller Bericht",
    "es": "Sin informe reciente",
    "ru": "Нет свежего отчёта",
    "pt": "Sem relatório recente"
  },
  "Recorded pain": {
    "en": "Recorded pain",
    "uk": "Записаний біль",
    "de": "Erfasster Schmerz",
    "es": "Dolor registrado",
    "ru": "Записанная боль",
    "pt": "Dor registada"
  },
  "No dated pain record": {
    "en": "No dated pain record",
    "uk": "Немає датованого запису болю",
    "de": "Kein datierter Schmerzeintrag",
    "es": "Sin registro de dolor fechado",
    "ru": "Нет датированной записи боли",
    "pt": "Sem registo de dor com data"
  },
  "Execution": {
    "en": "Execution",
    "uk": "Виконання",
    "de": "Durchführung",
    "es": "Cumplimiento",
    "ru": "Выполнение",
    "pt": "Execução"
  },
  "No completion report": {
    "en": "No completion report",
    "uk": "Немає звіту про виконання",
    "de": "Kein Durchführungsbericht",
    "es": "Sin informe de cumplimiento",
    "ru": "Нет отчёта о выполнении",
    "pt": "Sem relatório de execução"
  },
  "No threshold flags in the available records. This does not confirm full health or plan completion.": {
    "en": "No threshold flags in the available records. This does not confirm full health or plan completion.",
    "uk": "У доступних записах немає порогових сигналів. Це не підтверджує повне здоров’я чи виконання всього плану.",
    "de": "Keine Schwellenwerthinweise in den verfügbaren Daten. Dies bestätigt weder vollständige Gesundheit noch die vollständige Durchführung des Plans.",
    "es": "No hay alertas por umbrales en los registros disponibles. Esto no confirma una salud plena ni el cumplimiento total del plan.",
    "ru": "В доступных записях нет пороговых сигналов. Это не подтверждает полное здоровье или выполнение всего плана.",
    "pt": "Não há alertas de limiar nos registos disponíveis. Isto não confirma saúde plena nem o cumprimento integral do plano."
  },
  "Latest data": {
    "en": "Latest data",
    "uk": "Останні показники",
    "de": "Aktuelle Werte",
    "es": "Últimos indicadores",
    "ru": "Последние показатели",
    "pt": "Indicadores recentes"
  },
  "Review programme": {
    "en": "Review programme",
    "uk": "Переглянути програму",
    "de": "Programm prüfen",
    "es": "Revisar programa",
    "ru": "Пересмотреть программу",
    "pt": "Rever programa"
  },
  "Review coverage": {
    "en": "Review coverage",
    "uk": "Охоплення огляду",
    "de": "Umfang der Prüfung",
    "es": "Cobertura de la revisión",
    "ru": "Охват обзора",
    "pt": "Cobertura da análise"
  },
  "clients reviewed": {
    "en": "clients reviewed",
    "uk": "клієнтів переглянуто",
    "de": "Klienten geprüft",
    "es": "clientes revisados",
    "ru": "клиентов просмотрено",
    "pt": "clientes analisados"
  },
  "Account visits do not mean that training was completed. Missing reports remain unknown.": {
    "en": "Account visits do not mean that training was completed. Missing reports remain unknown.",
    "uk": "Відвідування не означає виконання тренування. Відсутні звіти залишаються невідомими.",
    "de": "Ein Besuch bedeutet nicht, dass das Training durchgeführt wurde. Fehlende Berichte bleiben ungeklärt.",
    "es": "Una visita no significa que se haya completado el entrenamiento. Los informes ausentes siguen siendo desconocidos.",
    "ru": "Посещение не означает выполнение тренировки. Отсутствующие отчёты остаются неизвестными.",
    "pt": "Uma visita não significa que o treino foi concluído. Os relatórios em falta permanecem desconhecidos."
  },
  "Latest Wellness: 48 hours. Execution and sessions: 7 days. GPS flags require a recorded plan and accepted GPS distance; local phone routes are not read.": {
    "en": "Latest Wellness: 48 hours. Execution and sessions: 7 days. GPS flags require a recorded plan and accepted GPS distance; local phone routes are not read.",
    "uk": "Wellness: 48 годин. Виконання та заняття: 7 днів. GPS-сигнали потребують записаного плану й прийнятної GPS-дистанції; локальні маршрути телефона не читаються.",
    "de": "Befinden: 48 Stunden. Durchführung und Einheiten: 7 Tage. GPS-Hinweise erfordern einen gespeicherten Plan und eine geeignete GPS-Distanz. Lokale Telefonrouten werden nicht gelesen.",
    "es": "Bienestar: 48 horas. Cumplimiento y sesiones: 7 días. Los avisos GPS requieren un plan guardado y una distancia GPS válida; no se leen las rutas locales del teléfono.",
    "ru": "Самочувствие: 48 часов. Выполнение и занятия: 7 дней. GPS-сигналы требуют сохранённого плана и пригодной GPS-дистанции; локальные маршруты телефона не читаются.",
    "pt": "Bem-estar: 48 horas. Execução e sessões: 7 dias. Os avisos GPS exigem um plano guardado e uma distância GPS válida; não são lidos os percursos locais do telemóvel."
  },
  "Signal criteria": {
    "en": "Signal criteria",
    "uk": "Критерії сигналів",
    "de": "Hinweiskriterien",
    "es": "Criterios de los avisos",
    "ru": "Критерии сигналов",
    "pt": "Critérios dos avisos"
  },
  "Review thresholds: pain ≥4/10 (priority ≥7), readiness ≤40%, sleep ≤3/10, stress ≥8/10, soreness ≥7/10, RPE ≥8/10; GPS distance >120% of plan. These are review rules, not injury predictions.": {
    "en": "Review thresholds: pain ≥4/10 (priority ≥7), readiness ≤40%, sleep ≤3/10, stress ≥8/10, soreness ≥7/10, RPE ≥8/10; GPS distance >120% of plan. These are review rules, not injury predictions.",
    "uk": "Пороги огляду: біль ≥4/10 (пріоритет ≥7), готовність ≤40%, сон ≤3/10, стрес ≥8/10, крепатура ≥7/10, RPE ≥8/10; GPS-дистанція >120% плану. Це правила огляду, не прогноз травми.",
    "de": "Prüfschwellen: Schmerz ≥4/10 (Priorität ≥7), Bereitschaft ≤40 %, Schlaf ≤3/10, Stress ≥8/10, Muskelkater ≥7/10, RPE ≥8/10; GPS-Distanz >120 % des Plans. Dies sind Prüfregeln, keine Verletzungsprognosen.",
    "es": "Umbrales de revisión: dolor ≥4/10 (prioridad ≥7), preparación ≤40 %, sueño ≤3/10, estrés ≥8/10, dolor muscular ≥7/10, RPE ≥8/10; distancia GPS >120 % del plan. Son reglas de revisión, no predicciones de lesiones.",
    "ru": "Пороги обзора: боль ≥4/10 (приоритет ≥7), готовность ≤40 %, сон ≤3/10, стресс ≥8/10, крепатура ≥7/10, RPE ≥8/10; GPS-дистанция >120 % плана. Это правила проверки, а не прогноз травмы.",
    "pt": "Limiares de análise: dor ≥4/10 (prioridade ≥7), prontidão ≤40 %, sono ≤3/10, stress ≥8/10, dor muscular ≥7/10, RPE ≥8/10; distância GPS >120 % do plano. São regras de análise, não previsões de lesões."
  },
  "Payout details for the current month.": {
    "en": "Payout details for the current month.",
    "uk": "Деталі нарахувань за поточний місяць.",
    "de": "Vergütungsdetails für den aktuellen Monat.",
    "es": "Detalles de los pagos del mes actual.",
    "ru": "Детали начислений за текущий месяц.",
    "pt": "Detalhes dos pagamentos do mês atual."
  },
  "View payouts": {
    "en": "View payouts",
    "uk": "Переглянути нарахування",
    "de": "Vergütung ansehen",
    "es": "Ver pagos",
    "ru": "Посмотреть начисления",
    "pt": "Ver pagamentos"
  },
  "Coach earnings": {
    "en": "Coach earnings",
    "uk": "Нарахування тренера",
    "de": "Trainervergütung",
    "es": "Ingresos del entrenador",
    "ru": "Начисления тренера",
    "pt": "Rendimentos do treinador"
  },
  "Loading…": {
    "en": "Loading…",
    "uk": "Завантаження…",
    "de": "Wird geladen…",
    "es": "Cargando…",
    "ru": "Загрузка…",
    "pt": "A carregar…"
  },
  "No confirmed payout records for this month.": {
    "en": "No confirmed payout records for this month.",
    "uk": "Підтверджених нарахувань за цей місяць немає.",
    "de": "Für diesen Monat liegen keine bestätigten Vergütungseinträge vor.",
    "es": "No hay pagos confirmados para este mes.",
    "ru": "Подтверждённых начислений за этот месяц нет.",
    "pt": "Não há pagamentos confirmados para este mês."
  },
  "Could not load payouts. Close and try again.": {
    "en": "Could not load payouts. Close and try again.",
    "uk": "Не вдалося завантажити нарахування. Закрий і спробуй ще раз.",
    "de": "Vergütung konnte nicht geladen werden. Schließen Sie das Fenster und versuchen Sie es erneut.",
    "es": "No se pudieron cargar los pagos. Cierra y vuelve a intentarlo.",
    "ru": "Не удалось загрузить начисления. Закройте окно и попробуйте снова.",
    "pt": "Não foi possível carregar os pagamentos. Feche e tente novamente."
  },
  "Close": {
    "en": "Close",
    "uk": "Закрити",
    "de": "Schließen",
    "es": "Cerrar",
    "ru": "Закрыть",
    "pt": "Fechar"
  },
  "Account state": {
    "en": "Account state",
    "uk": "Стан акаунта",
    "de": "Kontostatus",
    "es": "Estado de la cuenta",
    "ru": "Состояние аккаунта",
    "pt": "Estado da conta"
  },
  "Active": {
    "en": "Active",
    "uk": "Активний",
    "de": "Aktiv",
    "es": "Activo",
    "ru": "Активный",
    "pt": "Ativo"
  },
  "Inactive": {
    "en": "Inactive",
    "uk": "Неактивний",
    "de": "Inaktiv",
    "es": "Inactivo",
    "ru": "Неактивный",
    "pt": "Inativo"
  },
  "Wellness is current for 48 hours. Missing data is not zero readiness.": {
    "en": "Wellness is current for 48 hours. Missing data is not zero readiness.",
    "uk": "Wellness актуальний протягом 48 годин. Відсутні дані не означають нульову готовність.",
    "de": "Das Befinden gilt 48 Stunden als aktuell. Fehlende Daten bedeuten nicht null Bereitschaft.",
    "es": "El bienestar se considera actual durante 48 horas. La falta de datos no significa preparación cero.",
    "ru": "Самочувствие актуально 48 часов. Отсутствие данных не означает нулевую готовность.",
    "pt": "O bem-estar é considerado atual durante 48 horas. A falta de dados não significa prontidão zero."
  },
  "Some sources could not be loaded.": {
    "en": "Some sources could not be loaded.",
    "uk": "Частину джерел не вдалося завантажити.",
    "de": "Einige Datenquellen konnten nicht geladen werden.",
    "es": "No se pudieron cargar algunas fuentes.",
    "ru": "Часть источников не удалось загрузить.",
    "pt": "Não foi possível carregar algumas fontes."
  },
  "Sleep": {
    "en": "Sleep",
    "uk": "Сон",
    "de": "Schlaf",
    "es": "Sueño",
    "ru": "Сон",
    "pt": "Sono"
  },
  "Stress": {
    "en": "Stress",
    "uk": "Стрес",
    "de": "Stress",
    "es": "Estrés",
    "ru": "Стресс",
    "pt": "Stress"
  },
  "Recorded exercise completion": {
    "en": "Recorded exercise completion",
    "uk": "Зафіксоване виконання вправ",
    "de": "Erfasste Übungsdurchführung",
    "es": "Ejercicios completados registrados",
    "ru": "Зафиксированное выполнение упражнений",
    "pt": "Execução de exercícios registada"
  },
  "No execution report in the reviewed seven days.": {
    "en": "No execution report in the reviewed seven days.",
    "uk": "Немає звіту про виконання за переглянуті 7 днів.",
    "de": "Kein Durchführungsbericht in den geprüften sieben Tagen.",
    "es": "No hay informe de cumplimiento en los siete días revisados.",
    "ru": "Нет отчёта о выполнении за просмотренные семь дней.",
    "pt": "Sem relatório de execução nos sete dias analisados."
  },
  "Wellness date": {
    "en": "Wellness date",
    "uk": "Дата Wellness",
    "de": "Datum des Befindens",
    "es": "Fecha del bienestar",
    "ru": "Дата самочувствия",
    "pt": "Data do bem-estar"
  },
  "Journal": {
    "en": "Journal",
    "uk": "Журнал",
    "de": "Trainingsprotokoll",
    "es": "Diario",
    "ru": "Журнал",
    "pt": "Diário"
  },
  "Athlete data": {
    "en": "Athlete data",
    "uk": "Дані атлета",
    "de": "Athletendaten",
    "es": "Datos del deportista",
    "ru": "Данные спортсмена",
    "pt": "Dados do atleta"
  },
  "Injury history": {
    "en": "Injury history",
    "uk": "Історія травм",
    "de": "Verletzungshistorie",
    "es": "Historial de lesiones",
    "ru": "История травм",
    "pt": "Histórico de lesões"
  },
  "Invite athlete": {
    "en": "Invite athlete",
    "uk": "Запросити атлета",
    "de": "Athleten einladen",
    "es": "Invitar deportista",
    "ru": "Пригласить спортсмена",
    "pt": "Convidar atleta"
  },
  "My data": {
    "en": "My data",
    "uk": "Мої дані",
    "de": "Meine Daten",
    "es": "Mis datos",
    "ru": "Мои данные",
    "pt": "Os meus dados"
  },
  "Loading clients…": {
    "en": "Loading clients…",
    "uk": "Завантаження клієнтів…",
    "de": "Klienten werden geladen…",
    "es": "Cargando clientes…",
    "ru": "Загрузка клиентов…",
    "pt": "A carregar clientes…"
  },
  "Press Refresh to retry.": {
    "en": "Press Refresh to retry.",
    "uk": "Натисни «Оновити», щоб повторити.",
    "de": "Klicken Sie auf „Aktualisieren“, um es erneut zu versuchen.",
    "es": "Pulsa «Actualizar» para reintentar.",
    "ru": "Нажмите «Обновить», чтобы повторить.",
    "pt": "Prima «Atualizar» para tentar novamente."
  },
  "Review pain and programme adaptation": {
    "en": "Review pain and programme adaptation",
    "uk": "Переглянути біль та адаптацію програми",
    "de": "Schmerz und Programmanpassung prüfen",
    "es": "Revisar el dolor y la adaptación del programa",
    "ru": "Проверить боль и адаптацию программы",
    "pt": "Rever a dor e a adaptação do programa"
  },
  "Check wellbeing before the next session": {
    "en": "Check wellbeing before the next session",
    "uk": "Уточнити самопочуття перед наступним заняттям",
    "de": "Befinden vor der nächsten Einheit abklären",
    "es": "Consultar el bienestar antes de la próxima sesión",
    "ru": "Уточнить самочувствие перед следующим занятием",
    "pt": "Verificar o bem-estar antes da próxima sessão"
  },
  "Discuss sleep and recovery": {
    "en": "Discuss sleep and recovery",
    "uk": "Обговорити сон і відновлення",
    "de": "Schlaf und Erholung besprechen",
    "es": "Hablar sobre el sueño y la recuperación",
    "ru": "Обсудить сон и восстановление",
    "pt": "Abordar o sono e a recuperação"
  },
  "Review recovery needs": {
    "en": "Review recovery needs",
    "uk": "Перевірити потребу у відновленні",
    "de": "Erholungsbedarf prüfen",
    "es": "Revisar las necesidades de recuperación",
    "ru": "Проверить потребность в восстановлении",
    "pt": "Rever as necessidades de recuperação"
  },
  "Review execution: recorded goal not met": {
    "en": "Review execution: recorded goal not met",
    "uk": "Розібрати виконання: записано недосягнуту ціль",
    "de": "Durchführung prüfen: Erfasstes Ziel nicht erreicht",
    "es": "Revisar el cumplimiento: objetivo registrado no alcanzado",
    "ru": "Разобрать выполнение: записанная цель не достигнута",
    "pt": "Rever a execução: objetivo registado não atingido"
  },
  "Review session with high perceived effort": {
    "en": "Review session with high perceived effort",
    "uk": "Переглянути заняття з високим суб’єктивним зусиллям",
    "de": "Einheit mit hoher subjektiver Belastung prüfen",
    "es": "Revisar la sesión con esfuerzo percibido alto",
    "ru": "Пересмотреть занятие с высоким субъективным усилием",
    "pt": "Rever a sessão com esforço percebido elevado"
  },
  "Review GPS distance against the prescribed plan": {
    "en": "Review GPS distance against the prescribed plan",
    "uk": "Перевірити GPS-дистанцію проти призначеного плану",
    "de": "GPS-Distanz mit dem vorgegebenen Plan vergleichen",
    "es": "Comparar la distancia GPS con el plan prescrito",
    "ru": "Сравнить GPS-дистанцию с назначенным планом",
    "pt": "Comparar a distância GPS com o plano prescrito"
  },
  "Some sources could not be read": {
    "en": "Some sources could not be read",
    "uk": "Частину даних не вдалося прочитати",
    "de": "Einige Datenquellen konnten nicht gelesen werden",
    "es": "No se pudieron leer algunas fuentes",
    "ru": "Часть данных не удалось прочитать",
    "pt": "Não foi possível ler algumas fontes"
  },
  "Check wellbeing: no recent Wellness": {
    "en": "Check wellbeing: no recent Wellness",
    "uk": "Уточнити самопочуття: немає свіжого Wellness",
    "de": "Befinden abklären: kein aktueller Bericht",
    "es": "Consultar el bienestar: sin informe reciente",
    "ru": "Уточнить самочувствие: нет свежего отчёта",
    "pt": "Verificar o bem-estar: sem relatório recente"
  },
  "Review limit reached — open history": {
    "en": "Review limit reached — open history",
    "uk": "Досягнуто ліміт огляду — відкрити історію",
    "de": "Prüflimit erreicht – Historie öffnen",
    "es": "Límite de revisión alcanzado: abrir historial",
    "ru": "Достигнут лимит обзора — открыть историю",
    "pt": "Limite de análise atingido — abrir histórico"
  },
  "Review needed": {
    "en": "Review needed",
    "uk": "Потрібен перегляд",
    "de": "Prüfung erforderlich",
    "es": "Revisión necesaria",
    "ru": "Нужна проверка",
    "pt": "Revisão necessária"
  },
  "Incomplete data": {
    "en": "Incomplete data",
    "uk": "Неповні дані",
    "de": "Unvollständige Daten",
    "es": "Datos incompletos",
    "ru": "Неполные данные",
    "pt": "Dados incompletos"
  },
  "No flags in reviewed data": {
    "en": "No flags in reviewed data",
    "uk": "У переглянутих даних без сигналів",
    "de": "Keine Hinweise in geprüften Daten",
    "es": "Sin avisos en los datos revisados",
    "ru": "В просмотренных данных нет сигналов",
    "pt": "Sem avisos nos dados analisados"
  },
  "Loading latest reports…": {
    "en": "Loading latest reports…",
    "uk": "Завантажую останні звіти…",
    "de": "Aktuelle Berichte werden geladen…",
    "es": "Cargando los últimos informes…",
    "ru": "Загружаю последние отчёты…",
    "pt": "A carregar os relatórios recentes…"
  },
  "No clients available for review.": {
    "en": "No clients available for review.",
    "uk": "Немає клієнтів для огляду.",
    "de": "Keine Klienten zur Prüfung verfügbar.",
    "es": "No hay clientes disponibles para revisar.",
    "ru": "Нет клиентов для обзора.",
    "pt": "Não há clientes disponíveis para análise."
  },
  "Review next {count}": {
    "en": "Review next {count}",
    "uk": "Переглянути ще {count}",
    "de": "Weitere {count} prüfen",
    "es": "Revisar otros {count}",
    "ru": "Просмотреть ещё {count}",
    "pt": "Analisar mais {count}"
  },
  "Clients": {
    "en": "Clients",
    "uk": "Клієнти",
    "de": "Klienten",
    "es": "Clientes",
    "ru": "Клиенты",
    "pt": "Clientes"
  },
  "Search clients": {
    "en": "Search clients",
    "uk": "Пошук клієнта",
    "de": "Klienten suchen",
    "es": "Buscar clientes",
    "ru": "Поиск клиента",
    "pt": "Pesquisar clientes"
  },
  "Language selector": {
    "en": "Language selector",
    "uk": "Вибір мови",
    "de": "Sprache auswählen",
    "es": "Seleccionar idioma",
    "ru": "Выбор языка",
    "pt": "Selecionar idioma"
  },
  "Menu": {
    "en": "Menu",
    "uk": "Меню",
    "de": "Menü",
    "es": "Menú",
    "ru": "Меню",
    "pt": "Menu"
  },
  "Daily plan": {
    "en": "Daily plan",
    "uk": "План на день",
    "de": "Tagesplan",
    "es": "Plan diario",
    "ru": "План на день",
    "pt": "Plano diário"
  },
  "Drill Canvas": {
    "en": "Drill Canvas",
    "uk": "Редактор вправ",
    "de": "Übungseditor",
    "es": "Editor de ejercicios",
    "ru": "Редактор упражнений",
    "pt": "Editor de exercícios"
  },
  "All rights reserved.": {
    "en": "All rights reserved.",
    "uk": "Усі права захищено.",
    "de": "Alle Rechte vorbehalten.",
    "es": "Todos los derechos reservados.",
    "ru": "Все права защищены.",
    "pt": "Todos os direitos reservados."
  },
  "Football": {
    "en": "Football",
    "uk": "Футбол",
    "de": "Fußball",
    "es": "Fútbol",
    "ru": "Футбол",
    "pt": "Futebol"
  },
  "Basketball": {
    "en": "Basketball",
    "uk": "Баскетбол",
    "de": "Basketball",
    "es": "Baloncesto",
    "ru": "Баскетбол",
    "pt": "Basquetebol"
  },
  "Handball": {
    "en": "Handball",
    "uk": "Гандбол",
    "de": "Handball",
    "es": "Balonmano",
    "ru": "Гандбол",
    "pt": "Andebol"
  },
  "Volleyball": {
    "en": "Volleyball",
    "uk": "Волейбол",
    "de": "Volleyball",
    "es": "Voleibol",
    "ru": "Волейбол",
    "pt": "Voleibol"
  },
  "Rugby": {
    "en": "Rugby",
    "uk": "Регбі",
    "de": "Rugby",
    "es": "Rugbi",
    "ru": "Регби",
    "pt": "Râguebi"
  },
  "Athletics": {
    "en": "Athletics",
    "uk": "Легка атлетика",
    "de": "Leichtathletik",
    "es": "Atletismo",
    "ru": "Лёгкая атлетика",
    "pt": "Atletismo"
  },
  "Tennis": {
    "en": "Tennis",
    "uk": "Теніс",
    "de": "Tennis",
    "es": "Tenis",
    "ru": "Теннис",
    "pt": "Ténis"
  },
  "Hockey": {
    "en": "Hockey",
    "uk": "Хокей",
    "de": "Hockey",
    "es": "Hockey",
    "ru": "Хоккей",
    "pt": "Hóquei"
  },
  "Soreness": {
    "en": "Soreness",
    "uk": "Крепатура",
    "de": "Muskelkater",
    "es": "Dolor muscular",
    "ru": "Крепатура",
    "pt": "Dor muscular"
  },
  "Wellness": {
    "en": "Wellness",
    "uk": "Самопочуття",
    "de": "Befinden",
    "es": "Bienestar",
    "ru": "Самочувствие",
    "pt": "Bem-estar"
  },
  "wellness": {
    "en": "wellness",
    "uk": "самопочуття",
    "de": "Befinden",
    "es": "bienestar",
    "ru": "самочувствие",
    "pt": "bem-estar"
  },
  "injuries": {
    "en": "injuries",
    "uk": "травми",
    "de": "Verletzungen",
    "es": "lesiones",
    "ru": "травмы",
    "pt": "lesões"
  },
  "sessions": {
    "en": "sessions",
    "uk": "заняття",
    "de": "Einheiten",
    "es": "sesiones",
    "ru": "занятия",
    "pt": "sessões"
  },
  "progress": {
    "en": "progress",
    "uk": "виконання",
    "de": "Durchführung",
    "es": "cumplimiento",
    "ru": "выполнение",
    "pt": "execução"
  }
};
 function normalize(lang){const value=String(lang||'uk').toLowerCase().split('-')[0];return value==='ua'?'uk':languages.includes(value)?value:'en';}
 function text(phrase,lang,params={}){const value=messages[phrase]?.[normalize(lang)]||phrase;return value.replace(/\{(\w+)\}/g,(_,name)=>Object.prototype.hasOwnProperty.call(params,name)?String(params[name]):'{'+name+'}');}
 function key(name,lang){return text(keys[name]||name,lang);}
 const api={languages,keys,messages,normalize,text,key};if(typeof module==='object'&&module.exports)module.exports=api;else root.PACCoachI18n=api;
})(globalThis);
