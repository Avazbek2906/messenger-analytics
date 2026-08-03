import type { Messages } from './uz'

/** Русский. Ключи проверяются типом `Messages` — пропуск не скомпилируется. */
export const ru: Messages = {
  /* -------------------------------------------------------------- Общее */
  'common.retry': 'Повторить',
  'common.apply': 'Применить',
  'common.cancel': 'Отмена',
  'common.close': 'Закрыть',
  'common.copied': 'Скопировано',
  'common.noData': 'Нет данных',
  'common.outOf100': '/ 100',

  /* ------------------------------------------------------------- Ошибки */
  'error.network.title': 'Нет соединения',
  'error.network.description':
    'Не удалось связаться с сервером. Проверьте подключение к интернету.',
  'error.noCompany.title': 'Аккаунт не привязан к компании',
  'error.noCompany.description':
    'Ваш аккаунт не привязан ни к одной компании. Обратитесь к администратору.',
  'error.forbidden.title': 'Нет доступа',
  'error.forbidden.description': 'У вас нет прав на просмотр этого раздела.',
  'error.notFound.title': 'Не найдено',
  'error.notFound.description': 'Запрошенные данные не существуют или удалены.',
  'error.server.title': 'Ошибка сервера',
  'error.server.description':
    'Что-то пошло не так. Попробуйте повторить чуть позже.',
  'error.request.title': 'Запрос не выполнен',
  'error.unknown.detail': 'Неизвестная ошибка.',
  'error.unexpected.title': 'Непредвиденная ошибка',
  'error.unexpected.description': 'Попробуйте обновить страницу.',
  'error.app.title': 'В приложении произошла ошибка',
  'error.app.description':
    'Из-за непредвиденной ошибки страницу не удалось отобразить. Обновите страницу или повторите позже.',
  'error.app.reload': 'Обновить страницу',

  /* ---------------------------------------------------------------- Вход */
  'auth.welcome': 'Добро пожаловать',
  'auth.subtitle': 'Войдите в аккаунт, чтобы открыть панель аналитики.',
  'auth.username': 'Имя пользователя',
  'auth.usernameHint': 'Это не email — ваш логин в системе.',
  'auth.usernameRequired': 'Введите имя пользователя',
  'auth.password': 'Пароль',
  'auth.passwordRequired': 'Введите пароль',
  'auth.showPassword': 'Показать пароль',
  'auth.hidePassword': 'Скрыть пароль',
  'auth.submit': 'Войти',
  'auth.forgot': 'Забыли пароль? Обратитесь к администратору вашей компании.',
  'auth.error.credentials':
    'Неверное имя пользователя или пароль, либо аккаунт неактивен.',
  'auth.error.generic': 'Не удалось войти.',
  'auth.brand.headline': 'Ваши продажные диалоги — {accent}.',
  'auth.brand.headlineAccent': 'в измеримые показатели',
  'auth.brand.channels.title': 'Telegram, Instagram и веб-чат',
  'auth.brand.channels.text':
    'Все продажные диалоги в одном месте — только наблюдение, ответы никогда не отправляются.',
  'auth.brand.scoring.title': 'ИИ-оценка и рубрика',
  'auth.brand.scoring.text':
    'Каждый диалог получает балл 0–100, анализ причин и воронку скрипта.',
  'auth.brand.control.title': 'Контроль менеджера',
  'auth.brand.control.text':
    'Исправление выводов ИИ, назначение диалога сотруднику — всё с журналом изменений.',

  /* ---------------------------------------------------------- Навигация */
  'nav.dashboard': 'Панель управления',
  'nav.conversations': 'Диалоги',
  'nav.team': 'Команда',
  'nav.products': 'Товары',
  'nav.agreements': 'Договорённости',
  'nav.customers': 'Клиенты',
  'nav.cabinet': 'Мой кабинет',
  'nav.reports': 'Отчёты',
  'nav.settings': 'Настройки',
  'nav.main': 'Основная навигация',
  'nav.home': 'Messenger Analytics — на главную',
  'nav.openMenu': 'Открыть меню',
  'nav.closeMenu': 'Закрыть меню',
  'nav.expandSidebar': 'Развернуть боковую панель',
  'nav.collapseSidebar': 'Свернуть боковую панель',
  'nav.skipToContent': 'Перейти к основному содержимому',

  /* --------------------------------------------------- Профиль и язык */
  'user.menu': 'Меню профиля',
  'user.signOut': 'Выйти',
  'user.language': 'Язык',
  'theme.label': 'Оформление',
  'theme.light': 'Светлое',
  'theme.dark': 'Тёмное',
  'theme.system': 'Как в системе',
  'user.switchAccount': 'Войти под другим аккаунтом',

  'role.owner': 'Владелец',
  'role.admin': 'Администратор',
  'role.manager': 'Менеджер',
  'role.viewer': 'Наблюдатель',

  'attribution.mode1': 'По аккаунту',
  'attribution.mode2': 'По графику смен',
  'attribution.mode3': 'По расширению браузера',

  /* -------------------------------------------------- Системные страницы */
  'noCompany.title': 'Аккаунт не привязан к компании',
  'noCompany.description':
    '{name} не привязан ни к одной компании, поэтому данные аналитики недоступны. Войдите снова после того, как администратор добавит вас в компанию.',
  'noCompany.fallbackName': 'Ваш аккаунт',
  'notFound.title': 'Страница не найдена',
  'notFound.description': 'Неверный адрес или раздел был перемещён.',
  'notFound.action': 'Вернуться на панель управления',
  'stub.title': 'Раздел в разработке',
  'stub.description': 'Заработает на этапе {phase}.',
  'stub.conversations': 'Все закрытые диалоги, фильтры и сортировка по оценке.',
  'stub.team': 'Рейтинг сотрудников и сравнение отделов.',
  'stub.products': 'Упущенные возможности и анализ отзывов клиентов.',
  'stub.agreements': 'Данные обещания, выполненные и забытые.',
  'stub.customers': 'Идентификаторы клиентов по каналам и их объединение.',
  'stub.cabinet': 'Ваши личные показатели, сильные и слабые стороны.',
  'stub.reports': 'Создание и скачивание Excel-выгрузок.',
  'stub.settings': 'Компания, сотрудники, ИИ-каталог и интеграции каналов.',

  /* ----------------------------------------------------- Фильтр периода */
  'period.select': 'Выбор периода',
  'period.7d': '7 дней',
  'period.30d': '30 дней',
  'period.90d': '90 дней',
  'period.month': 'Этот месяц',
  'period.custom': 'Свой',
  'period.customTitle': 'Свой период',
  'period.pick': 'Выбрать свой период',
  'period.from': 'Начало',
  'period.to': 'Конец',
  'period.invalidRange': 'Дата конца не может быть раньше начала',
  'period.confirmedOn': 'Подтверждённые',
  'period.confirmedOff': 'Все результаты',
  'period.confirmedLabel': 'Только подтверждённые результаты',
  'period.confirmedDescription':
    'Ограничивает выборку диалогами, проверенными менеджером. Это сужает охват, но не меняет способ расчёта.',

  /* -------------------------------------------------------------- Дельты */
  'delta.comparison': 'По сравнению с предыдущим периодом такой же длины',
  'delta.comparisonLower':
    'По сравнению с предыдущим периодом — снижение это хорошо',
  'delta.noBaseline': 'В предыдущем периоде нет данных для сравнения',

  /* ------------------------------------------------------------ Дашборд */
  'dashboard.subtitle': '{company} — качество и результаты продажных диалогов',

  'kpi.conversations': 'Диалоги',
  'kpi.conversations.caption': 'оценено: {count}',
  'kpi.conversations.hint':
    'ЗАКРЫТЫЕ диалоги за выбранный период. Открытые не учитываются — у них нет итоговой оценки.',
  'kpi.avgScore': 'Средний балл',
  'kpi.avgScore.coverage': 'Охват: {percent}',
  'kpi.avgScore.coverageUnknown': 'Охват не определён',
  'kpi.avgScore.hint':
    'Среднее считается только по ОЦЕНЁННЫМ диалогам. Охват — сколько диалогов оценено.',
  'kpi.conversion': 'Конверсия',
  'kpi.conversion.caption': 'продано: {sold} · не продано: {notSold}',
  'kpi.conversion.hint':
    'продано / (продано + не продано). «Неясные» результаты в знаменатель не входят.',
  'kpi.firstResponse': 'Первый ответ',
  'kpi.firstResponse.caption': 'От сообщения клиента до ответа',
  'kpi.firstResponse.hint':
    'Диалог без единого ответа добавляет к среднему не 0, а ничего.',
  'kpi.angry': 'Недовольные клиенты',
  'kpi.angry.unassigned': 'не назначено диалогов: {count}',
  'kpi.angry.allAssigned': 'Все диалоги назначены',
  'kpi.angry.hint':
    'Диалоги, в которых настроение клиента в конце оценено как «раздражён».',
  'kpi.agreements': 'Договорённости',
  'kpi.agreements.caption': 'выполнено: {fulfilled} · забыто: {forgotten}',
  'kpi.agreements.hint': 'Количество обещаний, данных в диалогах, и их статус.',

  'coverage.none':
    'За период закрыто диалогов: {count}, но ни один ещё не оценён. Показатели качества остаются «—» и заполнятся после анализа.',
  'coverage.partial':
    'Оценено {percent} диалогов (ещё ждут анализа: {pending}). Показатели качества относятся к этому охвату.',

  'overview.empty.title': 'За этот период нет закрытых диалогов',
  'overview.empty.description':
    'В выбранном окне не завершился ни один диалог. Расширьте период или проверьте подключение канала.',

  'outcomes.title': 'Распределение результатов',
  'outcomes.description': 'закрытых диалогов: {count}',
  'outcomes.center': 'конверсия',
  'outcome.sold': 'Продано',
  'outcome.notSold': 'Не продано',
  'outcome.unclear': 'Неясно',
  'outcome.unscored': 'Ещё не оценено',

  'trend.title': 'Тренд объёма и качества',
  'trend.description': 'Количество закрытых диалогов и их средняя оценка',
  'trend.granularity': 'Интервал группировки',
  'trend.day': 'По дням',
  'trend.week': 'По неделям',
  'trend.legend.volume': 'Количество диалогов',
  'trend.legend.score': 'Средний балл (правая ось)',
  'trend.tooLong.title': 'Период слишком длинный',
  'trend.tooLong.description':
    'При дневной группировке получится больше {max} точек. Перейдите на недельную группировку или сократите период.',
  'trend.tooLong.action': 'Перейти на недельный вид',
  'trend.empty.title': 'За этот период нет закрытых диалогов',
  'trend.empty.description': 'Попробуйте расширить период.',
  'trend.tooltip.weekOf': 'Неделя с {date}',
  'trend.tooltip.noneScored': 'За этот период не оценён ни один диалог',

  'criteria.title': 'Профиль рубрики',
  'criteria.description': 'Какой навык стоит подтянуть в следующем квартале',
  'criteria.samples': 'на основе диалогов: {count}',
  'criteria.samplesHint':
    'Баллы рубрики приходят только из ночного пакетного анализа, поэтому это число обычно меньше количества оценённых диалогов.',
  'criteria.average': 'Среднее',
  'criteria.empty.title': 'Пакетный анализ ещё не проходил',
  'criteria.empty.description':
    'Под-баллы рубрики формирует только ночной полный анализ. Раздел заполнится после оценки диалогов.',
  'criteria.strengths': 'Сильные стороны',
  'criteria.weaknesses': 'Слабые стороны',
  'criteria.notEnough':
    'Недостаточно данных — этот список опирается на пакетный анализ.',

  'criterion.rule_adherence': 'Соблюдение правил',
  'criterion.response_speed': 'Скорость ответа',
  'criterion.tone': 'Тон общения',
  'criterion.needs_discovery': 'Выявление потребности',
  'criterion.objection_handling': 'Работа с возражениями',
  'criterion.closing': 'Закрытие диалога',
  'criterion.promise_fulfillment': 'Выполнение обещаний',

  'criterionHint.rule_adherence':
    'Насколько соблюдены правила компании и скрипт.',
  'criterionHint.response_speed': 'Скорость ответа на вопрос клиента.',
  'criterionHint.tone': 'Культура общения и тон обращения.',
  'criterionHint.needs_discovery':
    'Вопросы, заданные для выявления реальной потребности клиента.',
  'criterionHint.objection_handling':
    'Качество ответов на возражения по цене и другие.',
  'criterionHint.closing':
    'Обозначен ли в конце диалога конкретный следующий шаг.',
  'criterionHint.promise_fulfillment': 'Выполнение данных обещаний.',

  'funnel.title': 'Воронка скрипта',
  'funnel.description': 'На каком шаге скрипта обрываются диалоги',
  'funnel.analyzed': 'проанализировано: {count}',
  'funnel.empty.title': 'Проанализированных диалогов недостаточно',
  'funnel.empty.description':
    'Воронку формирует только ночной полный (Pro) анализ. Быстрая оценка в реальном времени шаги не определяет.',
  'funnel.summary': 'успешно: {success}',
  'funnel.summaryDrop': 'обрыв: {percent}',
  'funnel.tooltip': '{label}: {count} ({percent})',
  'funnel.status.success': 'Успешно',
  'funnel.status.neutral': 'Частично',
  'funnel.status.drop_off': 'Обрыв',
  'funnel.status.not_reached': 'Не достигнут',

  'funnelStage.greeting': 'Приветствие',
  'funnelStage.needs_discovery': 'Выявление потребности',
  'funnelStage.offer': 'Предложение',
  'funnelStage.price': 'Цена',
  'funnelStage.objection_handling': 'Возражения',
  'funnelStage.closing': 'Закрытие',

  /* ---------------------------------------------------------- Пагинация */
  'pagination.range': '{from}–{to} из {total}',
  'pagination.previous': 'Назад',
  'pagination.next': 'Вперёд',

  /* ------------------------------------------------------------ Диалоги */
  'conversations.subtitle':
    'Закрытые диалоги, их оценки и результаты. Каждая строка ведёт к полному разбору.',

  'conversationTable.customer': 'Клиент',
  'conversationTable.employee': 'Сотрудник',
  'conversationTable.score': 'Балл',
  'conversationTable.outcome': 'Результат',
  'conversationTable.sentiment': 'Настроение',
  'conversationTable.firstResponse': 'Первый ответ',
  'conversationTable.closedAt': 'Закрыт',
  'conversationTable.open': 'Открыт',
  'conversationTable.unassigned': 'Не назначен',
  'conversationTable.unassignedHint':
    'Ни одно правило атрибуции не сработало — менеджеру нужно назначить вручную.',
  'conversationTable.needsReviewHint':
    'Оценки быстрого и полного анализа разошлись — стоит перепроверить.',
  'conversationTable.total': 'Всего: {count}',
  'conversationTable.empty.title': 'Диалогов пока нет',
  'conversationTable.empty.description':
    'После подключения канала диалоги появятся здесь автоматически.',
  'conversationTable.emptyFiltered.title': 'По фильтрам ничего не найдено',
  'conversationTable.emptyFiltered.description':
    'Ослабьте фильтры или сбросьте их и попробуйте снова.',

  'conversationFilters.search': 'Поиск по диалогам',
  'conversationFilters.searchPlaceholder': 'Имя клиента или username',
  'conversationFilters.clearSearch': 'Очистить поиск',
  'conversationFilters.more': 'Фильтры',
  'conversationFilters.reset': 'Сбросить',
  'conversationFilters.any': 'Все',
  'conversationFilters.ordering': 'Сортировка',
  'conversationFilters.employee': 'Сотрудник',
  'conversationFilters.outcome': 'Результат',
  'conversationFilters.sentiment': 'Настроение',
  'conversationFilters.attribution': 'Способ назначения',
  'conversationFilters.product': 'Товар',
  'conversationFilters.reason': 'Причина',
  'conversationFilters.scoreRange': 'Диапазон баллов',
  'conversationFilters.scoreRangeHint': 'от 0 до 100',
  'conversationFilters.scoreMax': 'Максимальный балл',
  'conversationFilters.closedRange': 'Дата закрытия',
  'conversationFilters.closedTo': 'Дата закрытия — конец',
  'conversationFilters.unassigned': 'Не назначены',
  'conversationFilters.needsReview': 'На перепроверку',
  'conversationFilters.hasViolations': 'С нарушениями',

  'ordering.lastMessageDesc': 'По последнему сообщению',
  'ordering.closedDesc': 'Сначала недавно закрытые',
  'ordering.closedAsc': 'Сначала давно закрытые',
  'ordering.scoreDesc': 'Балл: по убыванию',
  'ordering.scoreAsc': 'Балл: по возрастанию',
  'ordering.startedDesc': 'Сначала недавно начатые',

  /* ------------------------------------------------------- Карточка диалога */
  'conversation.backToList': 'К списку диалогов',
  'conversation.employee': 'Сотрудник',
  'conversation.outcome': 'Результат',
  'conversation.score': 'Балл',
  'conversation.reason': 'Причина',
  'conversation.legacy': 'Архив',
  'conversation.startedAt': 'Начат',
  'conversation.closedAt': 'Закрыт',
  'conversation.avgResponse': 'Средний ответ',
  'conversation.aiSaid': 'ИИ:',
  'conversation.notScoredHint': 'Ещё не оценён — это не ноль.',
  'conversation.noReasonHint': 'Причина не определена.',
  'conversation.outcomeSignal': 'Обоснование результата',
  'conversation.reasonEvidence': 'Обоснование причины',
  'conversation.subScores': 'Баллы рубрики',
  'conversation.violations': 'Нарушения правил',
  'conversation.products': 'Интересующие товары',
  'conversation.secondaryReasons': 'Дополнительные причины',
  'conversation.coaching': 'Совет для сотрудника',
  'conversation.readOnlyNotice':
    'Платформа не отправляет сообщения клиенту — только наблюдает.',

  'analysis.title': 'Анализ ИИ',
  'analysis.modelHint': '{model} · {date}',
  'analysis.legacy.title': 'Архивные диалоги не оцениваются',
  'analysis.legacy.description':
    'История, загруженная через backfill, не оценивается автоматически, поэтому анализа нет.',
  'analysis.missing.title': 'Анализ ещё не готов',
  'analysis.missing.description':
    'Оценка выполняется в фоне после закрытия диалога. Загляните чуть позже.',
  'analysisStage.realtime': 'Быстрый анализ',
  'analysisStage.batch': 'Полный ночной анализ',

  'transcript.title': 'Переписка',
  'transcript.count': 'сообщений: {count}',
  'transcript.empty': 'Сообщений нет',
  'transcript.loadEarlier': 'Загрузить более ранние',
  'transcript.pending': 'Расшифровка готовится…',
  'transcript.playAudio': 'Прослушать',
  'transcript.audioFailed': 'Не удалось загрузить аудио.',

  'overrideHistory.title': 'История исправлений',
  'overrideHistory.description':
    'Все изменения, внесённые менеджерами — ничего не удаляется.',
  'overrideHistory.empty': 'было пусто',

  'agreements.title': 'Договорённости',
  'agreements.description': 'Обещания, данные в диалоге.',

  'assign.action': 'Назначить',
  'assign.title': 'Назначить диалог сотруднику',
  'assign.description':
    'Ручное назначение окончательное: ни один автоматический режим его не перезапишет.',
  'assign.employee': 'Сотрудник',
  'assign.employeeHint': 'Показаны только активные сотрудники.',
  'assign.selectEmployee': 'Выберите сотрудника',
  'assign.submit': 'Назначить',
  'assign.otherCompany': 'Этот сотрудник принадлежит другой компании.',
  'assign.notFound': 'Такой сотрудник не найден.',

  'override.action': 'Исправить',
  'override.title': 'Исправить вывод ИИ',
  'override.description':
    'Исправление сохраняется отдельной записью — результат ИИ не удаляется.',
  'override.field': 'Что исправляем',
  'override.newOutcome': 'Новый результат',
  'override.newScore': 'Новый балл',
  'override.scoreHint': 'Целое число от 0 до 100.',
  'override.scoreInvalid': 'Балл должен быть целым числом от 0 до 100.',
  'override.newReason': 'Новая причина',
  'override.reasonHint': 'Список берётся из таксономии компании.',
  'override.selectReason': 'Выберите причину',
  'override.submit': 'Сохранить',
  'override.outcomeInvalid': 'Такого значения результата не существует.',
  'override.reasonInvalid': 'Такого кода причины не существует.',
  'error.roleRequired': 'Для этого действия требуется роль менеджера.',

  /* ----------------------------------------------------------- Перечисления */
  'outcome.sotildi': 'Продано',
  'outcome.sotilmadi': 'Не продано',
  'outcome.noaniq': 'Неясно',

  'sentiment.positive': 'Позитивное',
  'sentiment.neutral': 'Нейтральное',
  'sentiment.negative': 'Негативное',
  'sentiment.angry': 'Раздражён',

  'channel.telegram': 'Telegram',
  'channel.instagram': 'Instagram',
  'channel.web': 'Веб-чат',

  'messageType.text': 'Текст',
  'messageType.voice': 'Голосовое',
  'messageType.image': 'Изображение',
  'messageType.video': 'Видео',
  'messageType.file': 'Файл',
  'messageType.sticker': 'Стикер',
  'messageType.location': 'Геопозиция',
  'messageType.other': 'Другое',

  'agreementStatus.pending': 'Ожидает',
  'agreementStatus.fulfilled': 'Выполнено',
  'agreementStatus.forgotten': 'Забыто',

  'attributionSource.mode_1': 'По аккаунту',
  'attributionSource.mode_2_shift': 'По смене',
  'attributionSource.mode_3_extension': 'По расширению',
  'attributionSource.widget': 'По виджету',
  'attributionSource.legacy': 'Архив',
  'attributionSource.manual': 'Вручную',
  'attributionSource.unassigned': 'Не назначен',

  /* ---------------------------------------------------------- Команда */
  'team.subtitle': '{company} — рейтинг сотрудников и сравнение отделов',
  'team.leaderboard': 'Рейтинг сотрудников',
  'team.leaderboardHint':
    'Кто растёт, а кто проседает. Нажмите на строку, чтобы открыть карточку.',
  'team.rankBy': 'Сортировать по',
  'team.overallScore': 'Общий балл',
  'team.employee': 'Сотрудник',
  'team.score': 'Балл',
  'team.change': 'Изменение',
  'team.conversations': 'Диалоги',
  'team.violations': 'Нарушения',
  'team.violationsHint':
    'Количество диалогов, где найдено хотя бы одно нарушение правил.',
  'team.response': 'Время ответа',
  'team.noDepartment': 'Без отдела',
  'team.unrankedHint':
    'Для рейтинга нужно минимум 5 оценённых диалогов — этот сотрудник пока без места.',
  'team.empty.title': 'Нет данных для рейтинга',
  'team.empty.description':
    'За этот период нет закрытых диалогов, назначенных сотрудникам.',
  'team.departments': 'Отделы',
  'team.departmentsHint': 'Балл отдела — отсортировано по среднему баллу',
  'team.departmentMeta': 'сотрудников: {employees} · диалогов: {conversations}',
  'team.noDepartments.title': 'Отделы не заданы',
  'team.noDepartments.description':
    'Заполните поле отдела в карточках сотрудников, и это сравнение заработает.',

  /* --------------------------------------------------- Карточка сотрудника */
  'employee.title': 'Карточка сотрудника',
  'employee.backToTeam': 'К списку команды',
  'employee.rank': 'Место',
  'employee.rankOf': 'из {total}',
  'employee.rankHint':
    'Место среди сотрудников, попавших в рейтинг (5+ оценённых диалогов).',
  'employee.scoredOf': 'оценено {scored} из {handled}',
  'employee.scoredHint':
    'Среднее считается только по оценённым диалогам; разница — то, что ещё ждёт анализа.',
  'employee.workload': 'Нагрузка',
  'employee.workloadHint':
    'Количество закрытых диалогов, назначенных этому сотруднику.',
  'employee.perDay': 'в среднем {value} в день',
  'employee.avgResponse': 'Средний ответ: {value}',
  'employee.agreementsCaption':
    'договорённостей: {taken} · забыто: {forgotten}',
  'employee.trend': 'Ежедневный тренд качества',
  'employee.trendHint': 'Средний балл по дням',
  'employee.noTrend.title': 'За этот период нет оценённых диалогов',
  'employee.noTrend.description': 'Попробуйте расширить период.',
  'employee.rubricHint': 'Сильные и слабые навыки этого сотрудника',
  'employee.funnelHint': 'Срез диалогов этого сотрудника по шагам скрипта',
  'employee.examples': 'Примеры',
  'employee.examplesHint':
    'Лучшие и слабейшие диалоги — обучение начинается с них.',
  'employee.best': 'Лучшие',
  'employee.worst': 'Слабейшие',
  'employee.noExamples': 'Примеров нет',
  'employee.coaching': 'Советы для сотрудника',
  'employee.coachingHint':
    'Короткие рекомендации из ночного анализа, свежие сверху.',
  'employee.notFound.title': 'Сотрудник не найден',
  'employee.notFound.description':
    'Такого сотрудника нет или он принадлежит другой компании.',

  'cabinet.subtitle': '{name} — ваши личные показатели',
  'cabinet.noProfile.title': 'У вас нет кабинета сотрудника',
  'cabinet.noProfile.description':
    'Ваш аккаунт не привязан к записи сотрудника, поэтому личные показатели не считаются. Администратор должен связать вас со списком сотрудников.',

  /* ------------------------------------------------- Товары и причины */
  'products.subtitle':
    'Какой товар и по какой причине теряется. Архивные диалоги тоже учитываются.',
  'products.title': 'Упущенные возможности',
  'products.description':
    'Потерянные клиенты по товарам. Раскройте строку, чтобы увидеть причины.',
  'products.customersLost': 'клиентов: {count}',
  'products.lostValueHint':
    'Цена × число потерянных клиентов. Это оценка упущенной выручки.',
  'products.noPriceHint':
    'В каталоге у этого товара не указана цена — поэтому денежная оценка не считается.',
  'products.seeConversations': 'Показать диалоги',
  'products.empty.title': 'Потерянных товаров нет',
  'products.empty.description':
    'За этот период нет потерянных диалогов, связанных с товаром. Если каталог пуст, ИИ вообще не может определить товар.',

  'reasons.title': 'Доли причин',
  'reasons.description': 'Почему клиенты не купили',
  'reasons.denominator': 'диалогов: {count}',
  'reasons.denominatorHint':
    'Это число потерянных диалогов с определённой причиной. Это не «все потерянные диалоги» и обычно меньше.',
  'reasons.customersHint': 'Число уникальных клиентов',
  'reasons.emerging': 'Появляющиеся темы',
  'reasons.emergingHint':
    'Свободный текст из причины «другое», сгруппированный по темам. Это список для изучения, а не точная статистика.',
  'reasons.empty.title': 'Причины не определены',
  'reasons.empty.description':
    'За этот период нет потерянных диалогов с указанной причиной.',

  /* ------------------------------------------------------ Договорённости */
  'agreementsBoard.subtitle':
    'Обещания сотрудников: какие выполнены, а какие забыты.',
  'agreementsBoard.taken': 'Данные обещания',
  'agreementsBoard.takenHint': 'Число обещаний, найденных ИИ в диалогах.',
  'agreementsBoard.pendingCaption': 'ожидают: {count}',
  'agreementsBoard.fulfillmentRate': 'Уровень выполнения',
  'agreementsBoard.rateHint':
    'выполнено / (выполнено + забыто). Ожидающие в знаменатель не входят.',
  'agreementsBoard.fulfilledCaption': 'выполнено: {count}',
  'agreementsBoard.forgottenCaption': 'Срок прошёл, обещание не выполнено',
  'agreementsBoard.forgottenHint':
    'Обещания, которые ночная проверка отметила как забытые.',
  'agreementsBoard.overdue': 'Просрочено',
  'agreementsBoard.overdueCaption': 'Из числа ожидающих',
  'agreementsBoard.overdueHint':
    'Это часть ожидающих: срок прошёл, но забытыми они ещё не отмечены.',
  'agreementsBoard.trend': 'Динамика по дням',
  'agreementsBoard.trendHint': 'Выполненные и забытые обещания',
  'agreementsBoard.upcoming': 'Ближайшие сроки',
  'agreementsBoard.upcomingHint':
    'Сначала самые близкие сроки. Нажмите строку, чтобы открыть диалог.',
  'agreementsBoard.noUpcoming.title': 'Ожидающих обещаний нет',
  'agreementsBoard.noUpcoming.description':
    'Нет открытых обещаний с назначенным сроком.',
  'agreementsBoard.byEmployee': 'В разрезе сотрудников',
  'agreementsBoard.byEmployeeHint':
    'Обещания без сотрудника сюда не попадают, поэтому сумма может быть меньше общего числа.',
  'agreementsBoard.rowHint': 'выполнено / забыто',
  'agreementsBoard.ofTaken': 'из {count}',
  'agreementsBoard.noByEmployee': 'Нет обещаний, связанных с сотрудником',
  'agreementsBoard.empty.title': 'За этот период обещаний не было',
  'agreementsBoard.empty.description':
    'Обещания извлекает из текста диалога ночной полный анализ.',

  /* -------------------------------------------------------------- Сигналы */
  'signals.title': 'Требует внимания',
  'signals.description':
    'Диалоги, где нужен менеджер. Список пересчитывается при каждом запросе.',
  'signals.openTotal': 'всего открыто: {count}',
  'signals.resolvedCount': 'просмотрено: {count}',
  'signals.resolve': 'Отметить просмотренным',
  'signals.resolveHint':
    'Диалог уйдёт из очереди этого сигнала. Сами данные не меняются, и отменить это нельзя.',
  'signals.allHandled': 'Всё просмотрено',
  'signals.empty.title': 'Ничего не требует внимания',
  'signals.empty.description':
    'За этот период не сработал ни один сигнал — всё в порядке.',

  'signal.unanswered': 'Без ответа',
  'signal.unassigned': 'Не назначен',
  'signal.low_score': 'Низкий балл',
  'signal.rule_violations': 'Нарушены правила',
  'signal.angry_customer': 'Раздражённый клиент',
  'signal.forgotten_agreement': 'Забытое обещание',
  'signal.needs_review': 'Нужна перепроверка',

  'signalHint.unanswered':
    'Клиент написал, но исходящих сообщений нет ни одного.',
  'signalHint.unassigned':
    'После всех правил атрибуции сотрудник так и не определён.',
  'signalHint.low_score': 'Оценка диалога 49 и ниже — полоса «плохо».',
  'signalHint.rule_violations': 'Анализ нашёл хотя бы одно нарушение правил.',
  'signalHint.angry_customer':
    'Итоговое настроение клиента оценено как раздражённое.',
  'signalHint.forgotten_agreement':
    'Ночная проверка отметила обещание как забытое.',
  'signalHint.needs_review': 'Оценки быстрого и полного анализа разошлись.',

  /* --------------------------------------------------------- ИИ-пояснение */
  'insights.action': 'Пояснение ИИ',
  'insights.title': 'Пояснение ИИ',
  'insights.failed':
    'Не удалось получить пояснение. Сам график при этом остаётся на месте.',
  'insights.caveat':
    'Это гипотезы, а не выводы. Числа считаются на сервере, модель лишь описывает их.',

  /* --------------------------------------------------------- Вопрос к ИИ */
  'ask.title': 'Спросить ИИ',
  'ask.description':
    'Задайте вопрос по статистике выбранного периода — ответ опирается только на неё.',
  'ask.placeholder':
    'Например: кто из сотрудников чаще всего забывает обещания?',
  'ask.submit': 'Спросить',
  'ask.thinking': 'Готовим ответ — это может занять несколько секунд…',
  'ask.failed':
    'Ответ не получен. Попробуйте сократить вопрос или сузить период.',
  'ask.evidence': 'Диалоги, на которые опирается ответ',
  'ask.scopeHint':
    'Модель видит только статистику этого периода: ни текстов переписки, ни контактов клиентов ей не передают. Каждый вопрос независим — предыдущий не запоминается.',

  /* ------------------------------------------------------------ Настройки */
  'settings.subtitle':
    'Компания, сотрудники и настройки ИИ. Просмотр доступен всем, изменение требует роли менеджера.',
  'settings.readOnly': 'Только просмотр',
  'settings.company': 'Компания',
  'settings.employees': 'Сотрудники',
  'settings.catalog': 'Настройки ИИ',
  'settings.products': 'Товары',
  'settings.reasons': 'Причины',
  'settings.rulebook': 'Файл правил',
  'settings.save': 'Сохранить',
  'settings.saved': 'Сохранено',
  'settings.saveFailed': 'Не удалось сохранить',
  'settings.companyTitle': 'Настройки компании',
  'settings.companyHint':
    'Эти настройки определяют, кому назначаются диалоги и когда они закрываются.',
  'settings.companyName': 'Название компании',
  'settings.timezone': 'Часовой пояс',
  'settings.timezoneHint':
    'Имя IANA, например Asia/Tashkent. Графики смен считаются в этом поясе.',
  'settings.timezoneInvalid':
    'Такого часового пояса не существует. Укажите полное имя IANA (Asia/Tashkent).',
  'settings.attributionMode': 'Способ назначения',
  'settings.attributionModeHint':
    'Смена способа не переназначает старые диалоги, а назначенные вручную не меняются никогда.',
  'settings.idleGap': 'Интервал закрытия диалога',
  'settings.idleGapHint':
    'После такого молчания диалог закрывается и начинается новый.',
  'settings.hours': '{count} ч',
  'settings.retention': 'Срок хранения данных (мес.)',
  'settings.retentionHint':
    'Пустое поле — хранить вечно. Иначе еженедельная очистка удалит диалоги старше этого срока.',
  'settings.retentionForever': 'Вечно',
  'settings.retentionWarning':
    'Внимание: диалоги, сообщения и их анализ старше {months} мес. будут полностью удалены при следующей еженедельной очистке. Это необратимо.',

  /* --------------------------------------------------------- Сотрудники */
  'employeesTable.description':
    'Сотрудники, чьи диалоги оцениваются. Ушедшего сотрудника лучше деактивировать, а не удалять.',
  'employeesTable.search': 'Поиск по имени',
  'employeesTable.add': 'Добавить сотрудника',
  'employeesTable.shiftCount': 'смен: {count}',
  'employeesTable.cabinet': 'Кабинет',
  'employeesTable.linked': 'Привязан',
  'employeesTable.empty.title': 'Сотрудники не добавлены',
  'employeesTable.empty.description':
    'Без сотрудников не работают ни рейтинг, ни назначение. Добавьте первого сотрудника.',

  'employeeForm.createTitle': 'Новый сотрудник',
  'employeeForm.editTitle': 'Редактирование сотрудника',
  'employeeForm.description':
    'Имя и отдел используются в рейтинге и сравнении отделов.',
  'employeeForm.fullName': 'Полное имя',
  'employeeForm.department': 'Отдел',
  'employeeForm.departmentHint':
    'Единственный источник для сравнения отделов. Выбирайте из существующих названий, чтобы один отдел не записали двумя способами.',
  'employeeForm.active': 'Активен',
  'employeeForm.activeHint':
    'Неактивный сотрудник не появляется в списках назначения, но его история сохраняется.',
  'employeeForm.shifts': 'График смен',
  'employeeForm.shiftsHint':
    'Используется только при назначении «по графику смен». Время — местное в часовом поясе компании.',
  'employeeForm.noShifts': 'Смены не заданы',
  'employeeForm.addShift': 'Добавить смену',
  'employeeForm.removeShift': 'Удалить смену',
  'employeeForm.weekday': 'День недели',
  'employeeForm.start': 'Начало',
  'employeeForm.end': 'Конец',
  'employeeForm.overnightHint':
    'Ночная смена допустима: 22:00 — 06:00 переходит на следующий день.',
  'employeeForm.userLinkNote':
    'Привязка сотрудника к пользователю системы делается не здесь — это выполняет администратор в панели Django admin.',

  'weekday.mon': 'Понедельник',
  'weekday.tue': 'Вторник',
  'weekday.wed': 'Среда',
  'weekday.thu': 'Четверг',
  'weekday.fri': 'Пятница',
  'weekday.sat': 'Суббота',
  'weekday.sun': 'Воскресенье',

  /* -------------------------------------------------------------- Товары */
  'productsTable.description':
    'ИИ распознаёт только товары из этого списка. Пустой список — пустая аналитика по товарам.',
  'productsTable.search': 'Поиск по названию',
  'productsTable.add': 'Добавить товар',
  'productsTable.active': 'Активен',
  'productsTable.delete': 'Удалить',
  'productsTable.deactivate': 'Деактивировать',
  'productsTable.deleteTitle': 'Удаление товара',
  'productsTable.deleteWarning':
    'Удаление уберёт и связи товара с прошлыми анализами — числа в старых отчётах уменьшатся. Обычно правильнее деактивация: она прекращает распознавание в будущем, но сохраняет историю.',
  'productsTable.empty.title': 'Каталог пуст',
  'productsTable.empty.description':
    'Пока вы не добавите товар, ИИ не сможет определять его в диалогах.',

  'productForm.createTitle': 'Новый товар',
  'productForm.editTitle': 'Редактирование товара',
  'productForm.description':
    'Название показывается ИИ ровно в таком виде — написание имеет значение.',
  'productForm.name': 'Название',
  'productForm.category': 'Категория',
  'productForm.descriptionField': 'Описание',
  'productForm.price': 'Цена',
  'productForm.priceHint':
    'С указанной ценой упущенные возможности считаются и в деньгах.',
  'productForm.noPrice': 'Не указана',
  'productForm.noPriceHint': 'Цена не указана',
  'productForm.currency': 'Валюта',
  'productForm.priceInvalid': 'Цена должна быть числом.',
  'productForm.priceNegative': 'Цена не может быть отрицательной.',
  'productForm.duplicate':
    'Товар с таким названием уже есть. Две записи разделят статистику надвое.',

  /* ------------------------------------------------------------- Причины */
  'reasonsTable.description':
    'Таксономия «почему не купили». ИИ выбирает только из этого списка.',
  'reasonsTable.add': 'Добавить причину',
  'reasonsTable.defaults': 'Стандартные причины',
  'reasonsTable.defaultsHint':
    'Поставляются вместе с платформой и не изменяются.',
  'reasonsTable.own': 'Причины компании',
  'reasonsTable.ownHint': 'Дополнительные причины, добавленные вами.',
  'reasonsTable.noOwn': 'Пока не добавлены',
  'reasonsTable.locked': 'Неизменяемая',
  'reasonsTable.delete': 'Удалить',

  'reasonForm.createTitle': 'Новая причина',
  'reasonForm.editTitle': 'Редактирование причины',
  'reasonForm.description':
    'Код — машинный ключ, а метка — то, что видит пользователь.',
  'reasonForm.label': 'Метка',
  'reasonForm.code': 'Код',
  'reasonForm.codeHint':
    'Формируется из метки автоматически. Только латиница, цифры и подчёркивание.',
  'reasonForm.codeLocked':
    'Код изменить нельзя: результаты анализа и исправления менеджеров хранят именно его.',
  'reasonForm.duplicate':
    'Такой код уже существует — проверка включает и стандартные причины.',

  /* --------------------------------------------------------- Файл правил */
  'rulebook.description':
    'Внутренние правила продаж компании. Файл разбирается, и на его основе готовится отдельный промпт для ночной оценки.',
  'rulebook.upload': 'Загрузить правила',
  'rulebook.formats':
    'PDF, DOCX или XLSX. Не более 20 МБ. Загрузка нового файла — это и есть способ обновить правила.',
  'rulebook.typeUnsupported':
    'Этот тип файла не поддерживается. Выберите PDF, DOCX или XLSX.',
  'rulebook.tooLarge': 'Файл больше 20 МБ.',
  'rulebook.legacyFormat':
    'Старый формат .doc / .xls упадёт на этапе разбора. Пересохраните файл как .docx или .xlsx.',
  'rulebook.uploadFailed': 'Не удалось загрузить файл.',
  'rulebook.processing':
    'Файл разбирается. Для длинного документа это может занять несколько минут.',
  'rulebook.ready':
    'Правила активированы. Эффект появится начиная со следующего ночного анализа.',
  'rulebook.processingFailed': 'Не удалось разобрать файл.',
  'rulebook.active': 'Активный',
  'rulebook.download': 'Скачать',
  'rulebook.delete': 'Удалить',
  'rulebook.empty.title': 'Файл правил не загружен',
  'rulebook.empty.description':
    'Без файла диалоги оцениваются по общим правилам платформы.',

  'rulebookStatus.uploaded': 'В очереди',
  'rulebookStatus.processing': 'Разбирается',
  'rulebookStatus.ready': 'Готово',
  'rulebookStatus.error': 'Ошибка',

  /* --------------------------------------------------------- Интеграции */
  'settings.integrations': 'Интеграции',
  'integrations.modeNotice':
    'Текущий способ назначения: {mode}. Изменить его можно в разделе «Компания».',

  'accountStatus.pending': 'Подключается',
  'accountStatus.connected': 'Подключено',
  'accountStatus.disconnected': 'Отключено',
  'accountStatus.error': 'Ошибка',

  /* -------------------------------------------------------------- Telegram */
  'telegram.title': 'Telegram',
  'telegram.description':
    'Через аккаунт Telegram отслеживаются личные переписки. Группы намеренно не отслеживаются.',
  'telegram.connect': 'Подключить аккаунт',
  'telegram.connectTitle': 'Подключение аккаунта Telegram',
  'telegram.connectDescription':
    'QR-код — самый удобный способ. Подключение по SMS — запасной вариант.',
  'telegram.accountType': 'Тип аккаунта',
  'telegram.accountTypeHint':
    'Корпоративный номер или личный номер сотрудника.',
  'telegram.typeCompany': 'Корпоративный',
  'telegram.typePersonal': 'Личный',
  'telegram.consent': 'Согласие сотрудника получено',
  'telegram.consentHint':
    'Для подключения личного номера нужно письменное согласие сотрудника. Без него сервер отклонит подключение.',
  'telegram.defaultEmployee': 'Сотрудник по умолчанию',
  'telegram.defaultEmployeeHint':
    'При назначении «по аккаунту» все диалоги этого аккаунта записываются на этого сотрудника.',
  'telegram.noDefaultEmployee': 'Не выбран',
  'telegram.startQr': 'Подключить по QR-коду',
  'telegram.useSms': 'Подключить по SMS',
  'telegram.qrAlt': 'QR-код для Telegram',
  'telegram.qrInstructions':
    'Telegram → Настройки → Устройства → «Подключить устройство» и отсканируйте код. Код обновляется каждые 30 секунд.',
  'telegram.phone': 'Номер телефона',
  'telegram.phoneHint': 'В международном формате, например +998901234567.',
  'telegram.sendCode': 'Отправить код',
  'telegram.code': 'Код из Telegram',
  'telegram.codeHint': 'Код приходит сообщением в приложение Telegram.',
  'telegram.verify': 'Подтвердить',
  'telegram.password': 'Пароль двухфакторной защиты',
  'telegram.passwordHint':
    'На аккаунте включена двухфакторная защита — введите облачный пароль Telegram.',
  'telegram.submitPassword': 'Продолжить',
  'telegram.connected': 'Аккаунт подключён',
  'telegram.tier0Note':
    'История за последние 6 месяцев загружается автоматически — она не оценивается, только сохраняется.',
  'telegram.disconnect': 'Отключить',
  'telegram.lastHealthy': 'Последняя связь: {value}',
  'telegram.staleHeartbeat':
    'Аккаунт не выходил на связь более 15 минут. Возможно, сессия ломается — будьте готовы переподключить.',
  'telegram.empty.title': 'Telegram не подключён',
  'telegram.empty.description':
    'Пока аккаунт не подключён, диалоги из Telegram не анализируются.',

  'telegram.error.consent':
    'Для личного аккаунта нужно отметить согласие сотрудника.',
  'telegram.error.phoneInvalid':
    'Неверный номер телефона. Укажите его в международном формате.',
  'telegram.error.phoneTaken': 'Этот номер подключён к другой компании.',
  'telegram.error.phoneBanned': 'Telegram заблокировал этот номер.',
  'telegram.error.codeInvalid': 'Код неверный или устарел.',
  'telegram.error.codeSendFailed':
    'Не удалось отправить код. Попробуйте чуть позже.',
  'telegram.error.codeVerifyFailed':
    'Не удалось проверить код. Попробуйте снова.',
  'telegram.error.passwordRejected': 'Пароль не принят.',
  'telegram.error.passwordNotRequired':
    'В этом подключении пароль не запрашивался. Начните процесс заново.',
  'telegram.error.loginExpired': 'Сессия подключения истекла. Начните заново.',
  'telegram.error.floodWait':
    'Telegram временно ограничил запросы. Подождите немного и попробуйте снова.',
  'telegram.error.accountTaken':
    'Этот аккаунт Telegram подключён к другой компании.',
  'telegram.error.qrFailed':
    'Не удалось связаться с Telegram. Попробуйте снова.',
  'telegram.error.throttled':
    'Больше 10 попыток подключения в час недоступно. Подождите немного.',

  /* -------------------------------------------------------------- История */
  'backfill.title': 'Загрузка истории',
  'backfill.description':
    'Загрузить старые переписки и оценить их тоже. Одновременно работает только одна задача.',
  'backfill.cancel': 'Отменить',
  'backfill.fetched': 'сообщений: {count}',
  'backfillScope.tier_0': 'Автоматически (6 мес.)',
  'backfillScope.tier_a': 'Без оценки',
  'backfillScope.tier_b': 'Последние 30 дней',
  'backfillScope.tier_c': 'Последние 6 месяцев',
  'backfillStatus.pending': 'В очереди',
  'backfillStatus.running': 'Выполняется',
  'backfillStatus.cancelled': 'Отменено',
  'backfillStatus.completed': 'Завершено',
  'backfillStatus.error': 'Ошибка',

  /* ------------------------------------------------------------ Instagram */
  'instagram.title': 'Instagram',
  'instagram.description':
    'Отслеживаются переписки Direct бизнес-аккаунта Instagram.',
  'instagram.connect': 'Подключить Instagram',
  'instagram.reconnect': 'Переподключить',
  'instagram.pause': 'Приостановить отслеживание',
  'instagram.resume': 'Возобновить отслеживание',
  'instagram.remove': 'Удалить подключение',
  'instagram.tokenUntil': 'Токен действует до: {date}',
  'instagram.connectSuccess': 'Instagram успешно подключён.',
  'instagram.connectFailed':
    'Не удалось подключить Instagram. Попробуйте снова.',
  'instagram.empty.title': 'Instagram не подключён',
  'instagram.empty.description':
    'Для подключения нужно выдать разрешение через Meta — это несколько шагов.',
  'instagramState.monitoring': 'Отслеживается',
  'instagramState.paused': 'Приостановлено',
  'instagramState.token_expiring': 'Токен истекает',
  'instagramState.reconnect_required': 'Нужно переподключить',

  /* -------------------------------------------------------------- Виджет */
  'web.title': 'Веб-чат',
  'web.description':
    'Сообщения чата на сайте отправляет ваш сервер с помощью ключа. Kotib сам чат не размещает.',
  'web.create': 'Создать ключ',
  'web.createTitle': 'Новый ключ виджета',
  'web.createDescription':
    'Создайте отдельный ключ для каждого сайта — тогда замена одного не затронет остальные.',
  'web.name': 'Название',
  'web.nameHint': 'Например: основной сайт, лендинг.',
  'web.unnamed': 'Без названия',
  'web.rotate': 'Заменить ключ',
  'web.rotateWarning':
    'В списке видны только последние 4 символа ключа. Если ключ потерян, его можно только заменить — старый перестанет работать сразу, поэтому сначала обновите сайт.',
  'web.keyTitle': 'Ключ виджета',
  'web.keyDescription':
    'Этот ключ больше никогда не будет показан. Скопируйте его сейчас и сохраните в надёжном месте.',
  'web.keySaved': 'Сохранил',
  'web.copyKey': 'Скопировать',
  'web.keyWarning':
    'Храните ключ только на своём сервере. Не размещайте его в JavaScript страницы: любой, у кого есть ключ, сможет отправлять поддельные сообщения.',
  'web.empty.title': 'Ключей виджета нет',
  'web.empty.description':
    'Чтобы подключить чат на сайте, сначала создайте ключ.',

  /* ------------------------------------------------------------- Клиенты */
  'customers.subtitle':
    'Отдельная запись клиента для каждого канала. Записи одного человека из разных каналов можно объединить вручную.',
  'customers.description':
    'Идентификаторы клиентов по каналам. Автоматического сопоставления нет.',
  'customers.search': 'Имя, username или телефон',
  'customers.name': 'Клиент',
  'customers.phone': 'Телефон',
  'customers.state': 'Состояние',
  'customers.firstSeen': 'Впервые',
  'customers.alias': 'Объединён',
  'customers.aliasHint':
    'Эта запись объединена с другим клиентом и в статистике отдельно не считается.',
  'customers.mergedCount': '+{count} записей',
  'customers.mergedIntoThisHint':
    'Сколько записей из других каналов объединено с этим клиентом.',
  'customers.empty.title': 'Клиенты не найдены',
  'customers.empty.description':
    'После подключения канала и первых диалогов клиенты появятся автоматически.',

  'merge.title': 'Объединение клиентов',
  'merge.description':
    'Левая запись присоединяется к правой: её диалоги сохраняются, но в статистике она отдельно не считается.',
  'merge.pickTarget': 'Выберите основную запись',
  'merge.search': 'Поиск основной записи',
  'merge.searchHint':
    'В списке только самостоятельные записи — присоединить к уже объединённой нельзя.',
  'merge.submit': 'Объединить',
  'merge.error.self': 'Запись нельзя объединить саму с собой.',
  'merge.error.cycle': 'Эти две записи уже связаны в обратном направлении.',
  'merge.error.notCanonical':
    'Выбранная запись сама объединена с другой. Выберите основную.',
  'merge.error.otherCompany': 'Этот клиент принадлежит другой компании.',
  'merge.error.notFound': 'Такой клиент не найден.',

  /* --------------------------------------------------------------- Отчёты */
  'reports.subtitle':
    'Отчёты в Excel. Файл хранится 24 часа, затем удаляется автоматически.',
  'reports.title': 'Выгрузки',
  'reports.description': 'Последние 50 запросов. Доступен только формат .xlsx.',
  'reports.kind': 'Тип отчёта',
  'reports.kindConversations': 'Диалоги',
  'reports.kindRatings': 'Рейтинг',
  'reports.kind.conversations': 'Отчёт по диалогам',
  'reports.kind.ratings': 'Рейтинг сотрудников',
  'reports.create': 'Создать отчёт',
  'reports.download': 'Скачать',
  'reports.window': '{from} — {to}',
  'reports.expiresIn': 'истекает {value}',
  'reports.expired': 'срок истёк',
  'reports.empty.title': 'Отчёты не создавались',
  'reports.empty.description':
    'Выберите период и создайте отчёт — файл соберётся в фоне.',
  'exportStatus.pending': 'В очереди',
  'exportStatus.running': 'Собирается',
  'exportStatus.done': 'Готов',
  'exportStatus.error': 'Ошибка',

  /* ------------------------------------------------- Логины и пароли */

  'settings.account': 'Логин и пароль',
  'account.identity': 'Мой аккаунт',
  'account.identityDescription': 'Под каким логином вы вошли в систему.',
  'account.logins': 'Логины',
  'account.loginsDescription': 'Создание логина для компании.',
  'account.loginsHint':
    'API со списком логинов нет, поэтому здесь можно только создать новый. Пароль существующего логина сбрасывается в разделе «Сотрудники».',

  'user.username': 'Логин',
  'user.usernameHint': 'Должен быть уникальным в рамках всей платформы.',
  'user.name': 'Полное имя',
  'user.firstName': 'Имя',
  'user.lastName': 'Фамилия',
  'user.role': 'Роль',
  'user.roleHint': 'Показаны только те роли, которые вы вправе выдать.',
  'user.passwordHint': 'Оставьте пустым — система сгенерирует пароль сама.',
  'user.passwordPlaceholder': 'Будет сгенерирован',
  'user.cabinet': 'Кабинет',
  'user.cabinetLinked': 'Связан с профилем сотрудника',
  'user.cabinetMissing': 'Не связан',

  'credentials.title': 'Логин создан',
  'credentials.description':
    'Пароль показывается только здесь и только один раз.',
  'credentials.username': 'Логин',
  'credentials.password': 'Пароль',
  'credentials.copyUsername': 'Скопировать логин',
  'credentials.copyPassword': 'Скопировать пароль',
  'credentials.warning':
    'После закрытия окна пароль посмотреть уже нельзя. Скопируйте его сейчас и передайте сотруднику.',
  'credentials.saved': 'Скопировал',

  'inviteUser.title': 'Новый логин',
  'inviteUser.description':
    'Создаёт логин в вашей компании. Пароль будет показан один раз.',
  'inviteUser.submit': 'Создать логин',
  'inviteUser.employee': 'Сотрудник',
  'inviteUser.employeeHint':
    'Связь с сотрудником открывает ему личный кабинет и расширение для браузера.',
  'inviteUser.noEmployee': 'Без привязки',

  'resetPassword.title': 'Сброс пароля',
  'resetPassword.description': 'Будет установлен новый пароль для {name}.',
  'resetPassword.submit': 'Сбросить пароль',
  'resetPassword.newPassword': 'Новый пароль',
  'resetPassword.newPasswordHint':
    'Оставьте пустым — система сгенерирует пароль сама.',
  'resetPassword.sessionsNote':
    'Сброс пароля не завершает открытые сессии — старый токен действует ещё до 5 дней.',

  'changePassword.title': 'Смена пароля',
  'changePassword.description': 'Вы меняете собственный пароль.',
  'changePassword.current': 'Текущий пароль',
  'changePassword.new': 'Новый пароль',
  'changePassword.confirm': 'Повторите новый пароль',
  'changePassword.mismatch': 'Пароли не совпадают.',
  'changePassword.unchanged': 'Новый пароль совпадает с текущим.',
  'changePassword.submit': 'Изменить',
  'changePassword.success': 'Пароль изменён.',

  'employeeForm.createLogin': 'Создать также логин',
  'employeeForm.createLoginHint':
    'Сотрудник и его логин создаются одной операцией. Позже добавить логин из этого окна уже нельзя.',

  'conversationTable.extensionSilent': 'Расширение молчало',
  'conversationTable.extensionSilentHint':
    'В диалоге был ответ, но расширение не зафиксировало ни одной отправки — вероятно, сотрудник его не включил.',
}
