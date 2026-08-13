import type { Message } from '../translate'

/**
 * O'zbekcha — manba til.
 *
 * Bu obyekt kalitlar to'plamini BELGILAYDI: `ru` va `en` fayllari shu tipga
 * moslashtiriladi, shuning uchun unutilgan yoki ortiqcha kalit kompilyatsiya
 * xatosi bo'lib chiqadi.
 */
export const uz = {
  /* ------------------------------------------------------------- Umumiy */
  'common.retry': 'Qayta urinish',
  'common.apply': 'Qo‘llash',
  'common.cancel': 'Bekor qilish',
  'common.close': 'Yopish',
  'common.copied': 'Nusxalandi',
  'common.noData': 'Ma’lumot yo‘q',
  'common.outOf100': '/ 100',

  /* -------------------------------------------------------------- Xato */
  'error.network.title': 'Ulanish yo‘q',
  'error.network.description':
    'Serverga ulanib bo‘lmadi. Internetni tekshirib ko‘ring.',
  'error.noCompany.title': 'Hisob kompaniyaga bog‘lanmagan',
  'error.noCompany.description':
    'Hisobingiz hech qaysi kompaniyaga biriktirilmagan. Administrator bilan bog‘laning.',
  'error.forbidden.title': 'Ruxsat yo‘q',
  'error.forbidden.description':
    'Bu bo‘limni ko‘rish uchun sizda huquq mavjud emas.',
  'error.notFound.title': 'Topilmadi',
  'error.notFound.description':
    'So‘ralgan ma’lumot mavjud emas yoki o‘chirilgan.',
  'error.server.title': 'Serverda xatolik',
  'error.server.description':
    'Nimadir noto‘g‘ri ketdi. Birozdan so‘ng qayta urinib ko‘ring.',
  'error.request.title': 'So‘rov bajarilmadi',
  'error.unknown.detail': 'Noma’lum xatolik.',
  'error.unexpected.title': 'Kutilmagan xatolik',
  'error.unexpected.description': 'Sahifani yangilab ko‘ring.',
  'error.app.title': 'Ilovada xatolik yuz berdi',
  'error.app.description':
    'Kutilmagan xatolik sababli sahifani ko‘rsatib bo‘lmadi. Sahifani qayta yuklang yoki keyinroq urinib ko‘ring.',
  'error.app.reload': 'Sahifani yangilash',

  /* ------------------------------------------------------------- Kirish */
  'auth.welcome': 'Xush kelibsiz',
  'auth.subtitle': 'Hisobingizga kirib, tahlil panelini oching.',
  'auth.username': 'Foydalanuvchi nomi',
  'auth.usernameHint': 'Bu email emas — tizimdagi login nomingiz.',
  'auth.usernameRequired': 'Foydalanuvchi nomini kiriting',
  'auth.password': 'Parol',
  'auth.passwordRequired': 'Parolni kiriting',
  'auth.showPassword': 'Parolni ko‘rsatish',
  'auth.hidePassword': 'Parolni yashirish',
  'auth.submit': 'Kirish',
  'auth.forgot':
    'Parolni unutdingizmi? Kompaniyangiz administratoriga murojaat qiling.',
  'auth.error.credentials':
    'Foydalanuvchi nomi yoki parol noto‘g‘ri, yoki hisob faol emas.',
  'auth.error.generic': 'Kirish amalga oshmadi.',
  'auth.brand.headline': 'Savdo suhbatlaringiz — {accent} aylanadi.',
  'auth.brand.headlineAccent': 'o‘lchanadigan ko‘rsatkichlarga',
  'auth.brand.channels.title': 'Telegram, Instagram va veb-chat',
  'auth.brand.channels.text':
    'Barcha savdo suhbatlari bitta joyda — kuzatiladi, hech qachon javob yozilmaydi.',
  'auth.brand.scoring.title': 'AI baholash va rubrika',
  'auth.brand.scoring.text':
    'Har bir suhbat 0–100 ball, sabab tahlili va skript funneli bilan baholanadi.',
  'auth.brand.control.title': 'Menejer nazorati',
  'auth.brand.control.text':
    'AI xulosasini tuzatish, suhbatni xodimga biriktirish — barchasi audit izi bilan.',

  /* ------------------------------------------------------- Navigatsiya */
  'nav.dashboard': 'Boshqaruv paneli',
  'nav.conversations': 'Suhbatlar',
  'nav.team': 'Jamoa',
  'nav.products': 'Mahsulotlar',
  'nav.agreements': 'Kelishuvlar',
  'nav.customers': 'Mijozlar',
  'nav.cabinet': 'Mening kabinetim',
  'nav.reports': 'Hisobotlar',
  'nav.settings': 'Sozlamalar',
  'nav.main': 'Asosiy navigatsiya',
  'nav.home': 'Messenger Analytics — bosh sahifa',
  'nav.openMenu': 'Menyuni ochish',
  'nav.closeMenu': 'Menyuni yopish',
  'nav.expandSidebar': 'Yon panelni kengaytirish',
  'nav.collapseSidebar': 'Yon panelni yig‘ish',
  'nav.skipToContent': 'Asosiy kontentga o‘tish',

  /* ------------------------------------------------- Profil va til */
  'user.menu': 'Profil menyusi',
  'user.signOut': 'Chiqish',
  'user.language': 'Til',
  'theme.label': 'Ko‘rinish',
  'theme.light': 'Yorug‘',
  'theme.dark': 'Qorong‘i',
  'theme.system': 'Tizim bo‘yicha',
  'user.switchAccount': 'Boshqa hisob bilan kirish',

  'role.owner': 'Egasi',
  'role.admin': 'Administrator',
  'role.manager': 'Menejer',
  'role.viewer': 'Kuzatuvchi',

  'attribution.mode1': 'Akkaunt bo‘yicha',
  'attribution.mode2': 'Smena jadvali bo‘yicha',
  'attribution.mode3': 'Brauzer kengaytmasi bo‘yicha',

  /* ------------------------------------------------------ Tizim sahifalari */
  'noCompany.title': 'Hisob kompaniyaga bog‘lanmagan',
  'noCompany.description':
    '{name} hech qaysi kompaniyaga biriktirilmagan, shuning uchun tahlil ma’lumotlari mavjud emas. Administrator sizni kompaniyaga qo‘shgach, qayta kiring.',
  'noCompany.fallbackName': 'Hisobingiz',
  'notFound.title': 'Sahifa topilmadi',
  'notFound.description':
    'Manzil noto‘g‘ri yoki bo‘lim ko‘chirilgan bo‘lishi mumkin.',
  'notFound.action': 'Boshqaruv paneliga qaytish',
  'stub.title': 'Bu bo‘lim tayyorlanmoqda',
  'stub.description': '{phase}-bosqichda ishga tushadi.',
  'stub.conversations':
    'Barcha yopilgan suhbatlar, filtrlar va bahoga ko‘ra saralash.',
  'stub.team': 'Xodimlar reytingi va bo‘limlar bo‘yicha taqqoslash.',
  'stub.products':
    'Yo‘qotilgan imkoniyatlar va mijozlar fikri bo‘yicha tahlil.',
  'stub.agreements': 'Berilgan va’dalar, bajarilganlari va unutilganlari.',
  'stub.customers':
    'Kanal bo‘yicha mijoz identifikatorlari va ularni birlashtirish.',
  'stub.cabinet': 'Shaxsiy ko‘rsatkichlaringiz, kuchli va zaif tomonlaringiz.',
  'stub.reports': 'Excel eksportlarini yaratish va yuklab olish.',
  'stub.settings':
    'Kompaniya, xodimlar, AI katalogi va kanal integratsiyalari.',

  /* -------------------------------------------------------- Davr filtri */
  'period.select': 'Davrni tanlash',
  'period.7d': '7 kun',
  'period.30d': '30 kun',
  'period.90d': '90 kun',
  'period.month': 'Bu oy',
  'period.custom': 'Maxsus',
  'period.customTitle': 'Maxsus davr',
  'period.pick': 'Maxsus davr tanlash',
  'period.from': 'Boshlanishi',
  'period.to': 'Tugashi',
  'period.invalidRange': 'Tugash sanasi boshlanishdan oldin bo‘lmasin',
  'period.confirmedOn': 'Tasdiqlangan',
  'period.confirmedOff': 'Barcha natijalar',
  'period.confirmedLabel': 'Faqat tasdiqlangan natijalar',
  'period.confirmedDescription':
    'Menejer tekshirib chiqqan suhbatlar bilan cheklaydi. Bu qamrovni toraytiradi, hisoblash usulini o‘zgartirmaydi.',

  /* ------------------------------------------------------------- Deltalar */
  'delta.comparison': 'Oldingi teng uzunlikdagi davrga nisbatan',
  'delta.comparisonLower': 'Oldingi davrga nisbatan — kamayish yaxshi',
  'delta.noBaseline': 'Oldingi davrda taqqoslash uchun ma’lumot yo‘q',

  /* ------------------------------------------------------------ Dashboard */
  'dashboard.subtitle': '{company} — savdo suhbatlari sifati va natijalari',

  'kpi.conversations': 'Suhbatlar',
  'kpi.conversations.caption': '{count} tasi baholangan',
  'kpi.conversations.hint':
    'Tanlangan davrda YOPILGAN suhbatlar. Ochiq suhbatlar hisobga olinmaydi — ularning yakuniy bahosi yo‘q.',
  'kpi.avgScore': 'O‘rtacha ball',
  'kpi.avgScore.coverage': 'Qamrov: {percent}',
  'kpi.avgScore.coverageUnknown': 'Qamrov aniqlanmagan',
  'kpi.avgScore.hint':
    'O‘rtacha faqat BAHOLANGAN suhbatlar ustidan hisoblanadi. Qamrov — nechta suhbat baholangani.',
  'kpi.conversion': 'Konversiya',
  'kpi.conversion.caption': '{sold} sotildi · {notSold} sotilmadi',
  'kpi.conversion.hint':
    'sotildi / (sotildi + sotilmadi). «Noaniq» natijalar maxrajga kirmaydi.',
  'kpi.firstResponse': 'Birinchi javob',
  'kpi.firstResponse.caption': 'Mijoz yozganidan javobgacha',
  'kpi.firstResponse.hint':
    'Umuman javob olmagan suhbat bu o‘rtachaga 0 emas, hech narsa qo‘shmaydi.',
  'kpi.angry': 'Jahli chiqqan mijozlar',
  'kpi.angry.unassigned': '{count} suhbat biriktirilmagan',
  'kpi.angry.allAssigned': 'Barcha suhbatlar biriktirilgan',
  'kpi.angry.hint':
    'Yakunida mijozning kayfiyati «jahli chiqqan» deb baholangan suhbatlar.',
  'kpi.agreements': 'Kelishuvlar',
  'kpi.agreements.caption': '{fulfilled} bajarilgan · {forgotten} unutilgan',
  'kpi.agreements.hint':
    'Suhbatlarda berilgan va’dalar soni va ularning holati.',

  'coverage.none':
    'Bu davrda {count} ta suhbat yopilgan, lekin hech biri hali baholanmagan. Sifat ko‘rsatkichlari «—» bo‘lib turadi — tahlil o‘tgach to‘ladi.',
  'coverage.partial':
    'Suhbatlarning {percent} qismi baholangan ({pending} tasi hali tahlil kutmoqda). Sifat ko‘rsatkichlari shu qamrov uchun amal qiladi.',

  'overview.empty.title': 'Bu davrda yopilgan suhbat yo‘q',
  'overview.empty.description':
    'Tanlangan oynada birorta suhbat yakunlanmagan. Davrni kengaytiring yoki kanal ulanganini tekshiring.',

  'outcomes.title': 'Natijalar taqsimoti',
  'outcomes.description': '{count} ta yopilgan suhbat',
  'outcomes.center': 'konversiya',
  'outcome.sold': 'Sotildi',
  'outcome.notSold': 'Sotilmadi',
  'outcome.unclear': 'Noaniq',
  'outcome.unscored': 'Hali baholanmagan',

  'trend.title': 'Hajm va sifat trendi',
  'trend.description': 'Yopilgan suhbatlar soni va ularning o‘rtacha bahosi',
  'trend.granularity': 'Guruhlash oralig‘i',
  'trend.day': 'Kunlik',
  'trend.week': 'Haftalik',
  'trend.legend.volume': 'Suhbatlar soni',
  'trend.legend.score': 'O‘rtacha ball (0–100)',
  'trend.a11y.volume':
    'Suhbatlar soni grafigi: {count} ta nuqta, eng yuqori qiymat {max}.',
  'trend.a11y.score':
    'O‘rtacha ball grafigi: eng past {min}, eng yuqori {max}.',
  'trend.a11y.scoreEmpty':
    'O‘rtacha ball grafigi: bu davrda hech bir suhbat baholanmagan.',
  'trend.tooLong.title': 'Davr juda uzun',
  'trend.tooLong.description':
    'Kunlik ko‘rinishda {max} tadan ortiq nuqta chiqadi. Haftalik guruhlashga o‘ting yoki davrni qisqartiring.',
  'trend.tooLong.action': 'Haftalik ko‘rinishga o‘tish',
  'trend.empty.title': 'Bu davrda yopilgan suhbat yo‘q',
  'trend.empty.description': 'Davrni kengaytirib ko‘ring.',
  'trend.tooltip.weekOf': '{date} dan boshlangan hafta',
  'trend.tooltip.noneScored': 'Bu davrda hech bir suhbat baholanmagan',

  'criteria.title': 'Rubrika profili',
  'criteria.description': 'Qaysi ko‘nikmani keyingi chorakda o‘rgatish kerak',
  'criteria.samples': '{count} ta suhbat asosida',
  'criteria.samplesHint':
    'Rubrika ballari faqat tungi batch tahlildan keladi, shuning uchun bu son baholangan suhbatlar sonidan kichik bo‘lishi normal.',
  'criteria.average': 'O‘rtacha',
  'criteria.empty.title': 'Batch tahlil hali o‘tmagan',
  'criteria.empty.description':
    'Rubrika sub-ballarini faqat tungi to‘liq tahlil chiqaradi. Suhbatlar baholangach, bu bo‘lim to‘ladi.',
  'criteria.strengths': 'Kuchli tomonlar',
  'criteria.weaknesses': 'Zaif tomonlar',
  'criteria.notEnough':
    'Yetarli ma’lumot yo‘q — bu ro‘yxat batch tahlilga tayanadi.',

  'criterion.rule_adherence': 'Qoidalarga rioya',
  'criterion.response_speed': 'Javob tezligi',
  'criterion.tone': 'Muloqot ohangi',
  'criterion.needs_discovery': 'Ehtiyojni aniqlash',
  'criterion.objection_handling': 'E’tirozlar bilan ishlash',
  'criterion.closing': 'Suhbatni yopish',
  'criterion.promise_fulfillment': 'Va’dani bajarish',

  'criterionHint.rule_adherence':
    'Kompaniya qoidalari va skriptga qanchalik amal qilingan.',
  'criterionHint.response_speed': 'Mijoz savoliga javob berish tezligi.',
  'criterionHint.tone': 'Muloqot madaniyati va munosabat ohangi.',
  'criterionHint.needs_discovery':
    'Mijozning haqiqiy ehtiyojini aniqlash uchun berilgan savollar.',
  'criterionHint.objection_handling':
    'Narx va boshqa e’tirozlarga berilgan javoblar sifati.',
  'criterionHint.closing': 'Suhbat oxirida aniq keyingi qadam belgilanganmi.',
  'criterionHint.promise_fulfillment': 'Berilgan va’dalarning bajarilishi.',

  'funnel.title': 'Skript funneli',
  'funnel.description': 'Suhbatlar skriptning qaysi bosqichida uzilib qolmoqda',
  'funnel.analyzed': '{count} ta tahlil',
  'funnel.empty.title': 'Tahlil qilingan suhbat yetarli emas',
  'funnel.empty.description':
    'Funnel faqat tungi to‘liq (Pro) tahlildan chiqadi. Real vaqtdagi tezkor baholash bosqichlarni aniqlamaydi.',
  'funnel.summary': '{success} muvaffaqiyatli',
  'funnel.summaryDrop': '{percent} uzilish',
  'funnel.tooltip': '{label}: {count} ta ({percent})',
  'funnel.status.success': 'Muvaffaqiyatli',
  'funnel.status.neutral': 'Qisman',
  'funnel.status.drop_off': 'Uzilish',
  'funnel.status.not_reached': 'Yetib bormagan',

  'funnelStage.greeting': 'Salomlashish',
  'funnelStage.needs_discovery': 'Ehtiyojni aniqlash',
  'funnelStage.offer': 'Taklif',
  'funnelStage.price': 'Narx',
  'funnelStage.objection_handling': 'E’tirozlar',
  'funnelStage.closing': 'Yopish',

  /* ------------------------------------------------------------ Sahifalash */
  'pagination.range': '{from}–{to} / {total}',
  'pagination.previous': 'Oldingi',
  'pagination.next': 'Keyingi',

  /* ------------------------------------------------------------ Suhbatlar */
  'conversations.subtitle':
    'Yopilgan suhbatlar, ularning bahosi va natijalari. Har bir satr to‘liq tahlilga olib boradi.',

  'conversationTable.customer': 'Mijoz',
  'conversationTable.employee': 'Xodim',
  'conversationTable.score': 'Ball',
  'conversationTable.outcome': 'Natija',
  'conversationTable.sentiment': 'Kayfiyat',
  'conversationTable.firstResponse': 'Birinchi javob',
  'conversationTable.closedAt': 'Yopilgan',
  'conversationTable.open': 'Ochiq',
  'conversationTable.unassigned': 'Biriktirilmagan',
  'conversationTable.unassignedHint':
    'Hech qanday atribut qoidasi mos kelmadi — menejer qo‘lda biriktirishi kerak.',
  'conversationTable.needsReviewHint':
    'Tezkor va to‘liq tahlil ballari bir-biridan farq qildi — qayta ko‘rib chiqish tavsiya etiladi.',
  'conversationTable.total': 'Jami {count} ta',
  'conversationTable.empty.title': 'Hali suhbat yo‘q',
  'conversationTable.empty.description':
    'Kanal ulangach, suhbatlar avtomatik ravishda shu yerda paydo bo‘ladi.',
  'conversationTable.emptyFiltered.title': 'Filtrga mos suhbat topilmadi',
  'conversationTable.emptyFiltered.description':
    'Filtrlarni yumshating yoki tozalab qayta urinib ko‘ring.',

  'conversationFilters.search': 'Suhbatlarni qidirish',
  'conversationFilters.searchPlaceholder': 'Mijoz ismi yoki username',
  'conversationFilters.clearSearch': 'Qidiruvni tozalash',
  'conversationFilters.more': 'Filtrlar',
  'conversationFilters.reset': 'Tozalash',
  'conversationFilters.any': 'Hammasi',
  'conversationFilters.ordering': 'Saralash',
  'conversationFilters.employee': 'Xodim',
  'conversationFilters.outcome': 'Natija',
  'conversationFilters.sentiment': 'Kayfiyat',
  'conversationFilters.attribution': 'Biriktirish usuli',
  'conversationFilters.product': 'Mahsulot',
  'conversationFilters.reason': 'Sabab',
  'conversationFilters.scoreRange': 'Ball oralig‘i',
  'conversationFilters.scoreRangeHint': '0 dan 100 gacha',
  'conversationFilters.scoreMax': 'Eng yuqori ball',
  'conversationFilters.closedRange': 'Yopilgan sana',
  'conversationFilters.closedTo': 'Yopilgan sana — tugashi',
  'conversationFilters.unassigned': 'Biriktirilmagan',
  'conversationFilters.needsReview': 'Qayta ko‘rish',
  'conversationFilters.hasViolations': 'Qoida buzilgan',

  'ordering.lastMessageDesc': 'Oxirgi xabar bo‘yicha',
  'ordering.closedDesc': 'Avval yangi yopilgan',
  'ordering.closedAsc': 'Avval eski yopilgan',
  'ordering.scoreDesc': 'Ball: yuqoridan',
  'ordering.scoreAsc': 'Ball: pastdan',
  'ordering.startedDesc': 'Avval yangi boshlangan',

  /* -------------------------------------------------------- Suhbat detali */
  'conversation.backToList': 'Suhbatlar ro‘yxatiga',
  'conversation.employee': 'Xodim',
  'conversation.outcome': 'Natija',
  'conversation.score': 'Ball',
  'conversation.reason': 'Sabab',
  'conversation.legacy': 'Arxiv',
  'conversation.startedAt': 'Boshlangan',
  'conversation.closedAt': 'Yopilgan',
  'conversation.avgResponse': 'O‘rtacha javob',
  'conversation.aiSaid': 'AI:',
  'conversation.notScoredHint': 'Hali baholanmagan — bu nol degani emas.',
  'conversation.noReasonHint': 'Sabab aniqlanmagan.',
  'conversation.outcomeSignal': 'Natija dalili',
  'conversation.reasonEvidence': 'Sabab dalili',
  'conversation.subScores': 'Rubrika ballari',
  'conversation.violations': 'Qoida buzilishlari',
  'conversation.products': 'Qiziqqan mahsulotlar',
  'conversation.secondaryReasons': 'Qo‘shimcha sabablar',
  'conversation.coaching': 'Murabbiylik maslahati',
  'conversation.readOnlyNotice':
    'Bu platforma mijozga xabar yubormaydi — faqat kuzatadi.',

  'analysis.title': 'AI tahlili',
  'analysis.modelHint': '{model} · {date}',
  'analysis.legacy.title': 'Arxiv suhbat baholanmaydi',
  'analysis.legacy.description':
    'Backfill orqali yuklangan tarix avtomatik baholanmaydi, shuning uchun tahlil mavjud emas.',
  'analysis.missing.title': 'Tahlil hali tayyor emas',
  'analysis.missing.description':
    'Baholash suhbat yopilgandan keyin fonda ishlaydi. Birozdan so‘ng qayta oching.',
  'analysisStage.realtime': 'Tezkor tahlil',
  'analysisStage.batch': 'To‘liq tungi tahlil',

  'transcript.title': 'Yozishmalar',
  'transcript.count': '{count} ta xabar',
  'transcript.empty': 'Xabarlar yo‘q',
  'transcript.loadEarlier': 'Oldingi xabarlarni yuklash',
  'transcript.pending': 'Transkripsiya tayyorlanmoqda…',
  'transcript.playAudio': 'Ovozni eshitish',
  'transcript.audioFailed': 'Ovozli yozuvni yuklab bo‘lmadi.',

  'overrideHistory.title': 'Tuzatishlar tarixi',
  'overrideHistory.description':
    'Menejerlar kiritgan barcha o‘zgarishlar — hech biri o‘chirilmaydi.',
  'overrideHistory.empty': 'bo‘sh edi',

  'agreements.title': 'Kelishuvlar',
  'agreements.description': 'Suhbatda berilgan va’dalar.',

  'assign.action': 'Biriktirish',
  'assign.title': 'Suhbatni xodimga biriktirish',
  'assign.description':
    'Qo‘lda biriktirish qat’iy: hech qanday avtomatik rejim uni qayta yozmaydi.',
  'assign.employee': 'Xodim',
  'assign.employeeHint': 'Faqat faol xodimlar ko‘rsatiladi.',
  'assign.selectEmployee': 'Xodimni tanlang',
  'assign.submit': 'Biriktirish',
  'assign.otherCompany': 'Bu xodim boshqa kompaniyaga tegishli.',
  'assign.notFound': 'Bunday xodim topilmadi.',

  'override.action': 'Tuzatish',
  'override.title': 'AI xulosasini tuzatish',
  'override.description':
    'Tuzatish qo‘shimcha yozuv sifatida saqlanadi — AI natijasi o‘chirilmaydi.',
  'override.field': 'Nimani tuzatamiz',
  'override.newOutcome': 'Yangi natija',
  'override.newScore': 'Yangi ball',
  'override.scoreHint': '0 dan 100 gacha butun son.',
  'override.scoreInvalid': 'Ball 0–100 oralig‘idagi butun son bo‘lishi kerak.',
  'override.newReason': 'Yangi sabab',
  'override.reasonHint': 'Ro‘yxat kompaniya taksonomiyasidan olinadi.',
  'override.selectReason': 'Sababni tanlang',
  'override.submit': 'Saqlash',
  'override.outcomeInvalid': 'Bunday natija qiymati mavjud emas.',
  'override.reasonInvalid': 'Bunday sabab kodi mavjud emas.',
  'error.roleRequired': 'Bu amal uchun menejer roli talab qilinadi.',

  /* --------------------------------------------------------------- Enums */
  'outcome.sotildi': 'Sotildi',
  'outcome.sotilmadi': 'Sotilmadi',
  'outcome.noaniq': 'Noaniq',

  'sentiment.positive': 'Ijobiy',
  'sentiment.neutral': 'Neytral',
  'sentiment.negative': 'Salbiy',
  'sentiment.angry': 'Jahli chiqqan',

  'channel.telegram': 'Telegram',
  'channel.instagram': 'Instagram',
  'channel.web': 'Veb-chat',

  'messageType.text': 'Matn',
  'messageType.voice': 'Ovozli xabar',
  'messageType.image': 'Rasm',
  'messageType.video': 'Video',
  'messageType.file': 'Fayl',
  'messageType.sticker': 'Stiker',
  'messageType.location': 'Joylashuv',
  'messageType.other': 'Boshqa',

  'agreementStatus.pending': 'Kutilmoqda',
  'agreementStatus.fulfilled': 'Bajarilgan',
  'agreementStatus.forgotten': 'Unutilgan',

  'attributionSource.mode_1': 'Akkaunt bo‘yicha',
  'attributionSource.mode_2_shift': 'Smena bo‘yicha',
  'attributionSource.mode_3_extension': 'Kengaytma bo‘yicha',
  'attributionSource.widget': 'Vidjet bo‘yicha',
  'attributionSource.legacy': 'Arxiv',
  'attributionSource.manual': 'Qo‘lda',
  'attributionSource.unassigned': 'Biriktirilmagan',

  /* ----------------------------------------------------------- Jamoa */
  'team.subtitle': '{company} — xodimlar reytingi va bo‘limlar taqqoslovi',
  'team.leaderboard': 'Xodimlar reytingi',
  'team.leaderboardHint':
    'Kim o‘syapti, kim tushyapti. Satrni bosib to‘liq kartani oching.',
  'team.rankBy': 'Nima bo‘yicha saralash',
  'team.overallScore': 'Umumiy ball',
  'team.employee': 'Xodim',
  'team.score': 'Ball',
  'team.change': 'O‘zgarish',
  'team.conversations': 'Suhbatlar',
  'team.violations': 'Buzilishlar',
  'team.violationsHint':
    'Kamida bitta qoida buzilishi aniqlangan suhbatlar soni.',
  'team.response': 'Javob vaqti',
  'team.noDepartment': 'Bo‘limsiz',
  'team.unrankedHint':
    'Reyting uchun kamida 5 ta baholangan suhbat kerak — bu xodim hali o‘rin olmaydi.',
  'team.empty.title': 'Reyting uchun ma’lumot yo‘q',
  'team.empty.description':
    'Bu davrda birorta xodimga biriktirilgan yopilgan suhbat yo‘q.',
  'team.departments': 'Bo‘limlar',
  'team.departmentsHint': 'Bo‘lim balli — o‘rtacha ball bo‘yicha saralangan',
  'team.departmentMeta': '{employees} xodim · {conversations} suhbat',
  'team.noDepartments.title': 'Bo‘limlar belgilanmagan',
  'team.noDepartments.description':
    'Xodimlar kartasida bo‘lim maydonini to‘ldirsangiz, bu taqqoslash ishlay boshlaydi.',

  /* ------------------------------------------------------- Xodim kartasi */
  'employee.title': 'Xodim kartasi',
  'employee.backToTeam': 'Jamoa ro‘yxatiga',
  'employee.rank': 'O‘rin',
  'employee.rankOf': '/ {total}',
  'employee.rankHint':
    'Faqat reytingga kirgan (5+ baholangan suhbat) xodimlar orasidagi o‘rin.',
  'employee.scoredOf': '{handled} tadan {scored} tasi baholangan',
  'employee.scoredHint':
    'O‘rtacha faqat baholangan suhbatlar ustidan hisoblanadi; farqi — tahlil kutayotgan qism.',
  'employee.workload': 'Yuklama',
  'employee.workloadHint': 'Xodimga biriktirilgan va yopilgan suhbatlar soni.',
  'employee.perDay': 'Kuniga o‘rtacha {value} ta',
  'employee.avgResponse': 'O‘rtacha javob: {value}',
  'employee.agreementsCaption': '{taken} kelishuv · {forgotten} unutilgan',
  'employee.trend': 'Kunlik sifat trendi',
  'employee.trendHint': 'Har bir kunning o‘rtacha bahosi',
  'employee.noTrend.title': 'Bu davrda baholangan suhbat yo‘q',
  'employee.noTrend.description': 'Davrni kengaytirib ko‘ring.',
  'employee.rubricHint': 'Shu xodimning kuchli va zaif ko‘nikmalari',
  'employee.funnelHint': 'Shu xodim suhbatlarining skript bo‘yicha kesimi',
  'employee.examples': 'Namunalar',
  'employee.examplesHint':
    'Eng yaxshi va eng zaif suhbatlar — murabbiylik shulardan boshlanadi.',
  'employee.best': 'Eng yaxshi',
  'employee.worst': 'Eng zaif',
  'employee.noExamples': 'Namuna yo‘q',
  'employee.coaching': 'Murabbiylik maslahatlari',
  'employee.coachingHint':
    'Tungi tahlil yozgan qisqa tavsiyalar, eng yangisi birinchi.',
  'employee.notFound.title': 'Xodim topilmadi',
  'employee.notFound.description':
    'Bu xodim mavjud emas yoki boshqa kompaniyaga tegishli.',

  'cabinet.subtitle': '{name} — shaxsiy ko‘rsatkichlaringiz',
  'cabinet.noProfile.title': 'Sizda xodim kabineti yo‘q',
  'cabinet.noProfile.description':
    'Hisobingiz xodim yozuviga bog‘lanmagan, shuning uchun shaxsiy ko‘rsatkichlar hisoblanmaydi. Administrator sizni xodimlar ro‘yxatiga bog‘lashi kerak.',

  /* ------------------------------------------------- Mahsulot va sabablar */
  'products.subtitle':
    'Qaysi mahsulot qaysi sabab bilan yo‘qotilmoqda. Arxiv suhbatlar ham hisobga olinadi.',
  'products.title': 'Yo‘qotilgan imkoniyatlar',
  'products.description':
    'Mahsulot bo‘yicha yo‘qotilgan mijozlar. Qatorni ochib sabablarni ko‘ring.',
  'products.customersLost': '{count} mijoz',
  'products.lostValueHint':
    'Narx × yo‘qotilgan mijozlar soni. Bu taxminiy yo‘qotilgan daromad.',
  'products.noPriceHint':
    'Katalogda bu mahsulotning narxi ko‘rsatilmagan — shuning uchun pul qiymati hisoblanmaydi.',
  'products.seeConversations': 'Suhbatlarni ko‘rish',
  'products.empty.title': 'Yo‘qotilgan mahsulot topilmadi',
  'products.empty.description':
    'Bu davrda mahsulot bilan bog‘langan yo‘qotilgan suhbat yo‘q. Katalog bo‘sh bo‘lsa, AI mahsulotni umuman aniqlay olmaydi.',

  'reasons.title': 'Sabablar ulushi',
  'reasons.description': 'Mijozlar nima uchun sotib olmadi',
  'reasons.denominator': '{count} ta suhbat',
  'reasons.denominatorHint':
    'Bu — sababi aniqlangan yo‘qotilgan suhbatlar soni. U «barcha yo‘qotilgan suhbatlar» emas va odatda undan kichik.',
  'reasons.customersHint': 'Alohida mijozlar soni',
  'reasons.emerging': 'Yangi paydo bo‘layotgan fikrlar',
  'reasons.emergingHint':
    '«Boshqa» sababidagi erkin matnlar mavzular bo‘yicha guruhlangan. Bu kashfiyot ro‘yxati, aniq statistika emas.',
  'reasons.empty.title': 'Sabablar aniqlanmagan',
  'reasons.empty.description':
    'Bu davrda sababi belgilangan yo‘qotilgan suhbat yo‘q.',

  /* ---------------------------------------------------------- Kelishuvlar */
  'agreementsBoard.subtitle':
    'Xodimlar bergan va’dalar: qaysilari bajarildi, qaysilari unutildi.',
  'agreementsBoard.taken': 'Berilgan va’dalar',
  'agreementsBoard.takenHint': 'Suhbatlarda AI aniqlagan va’dalar soni.',
  'agreementsBoard.pendingCaption': '{count} tasi kutilmoqda',
  'agreementsBoard.fulfillmentRate': 'Bajarilish darajasi',
  'agreementsBoard.rateHint':
    'bajarilgan / (bajarilgan + unutilgan). Kutilayotganlar maxrajga kirmaydi.',
  'agreementsBoard.fulfilledCaption': '{count} ta bajarilgan',
  'agreementsBoard.forgottenCaption': 'Muddati o‘tib, bajarilmagan',
  'agreementsBoard.forgottenHint':
    'Tungi tekshiruv «unutilgan» deb belgilagan va’dalar.',
  'agreementsBoard.overdue': 'Muddati o‘tgan',
  'agreementsBoard.overdueCaption': 'Kutilayotganlar ichida',
  'agreementsBoard.overdueHint':
    'Bu — kutilayotganlarning bir qismi: muddati o‘tgan, lekin hali unutilgan deb belgilanmagan.',
  'agreementsBoard.trend': 'Kunlik dinamika',
  'agreementsBoard.trendHint': 'Bajarilgan va unutilgan va’dalar',
  'agreementsBoard.upcoming': 'Yaqin muddatlilar',
  'agreementsBoard.upcomingHint':
    'Muddati eng yaqinlari birinchi. Satrni bosib suhbatga o‘ting.',
  'agreementsBoard.noUpcoming.title': 'Kutilayotgan va’da yo‘q',
  'agreementsBoard.noUpcoming.description':
    'Muddati belgilangan ochiq va’dalar mavjud emas.',
  'agreementsBoard.byEmployee': 'Xodimlar kesimida',
  'agreementsBoard.byEmployeeHint':
    'Xodimi aniqlanmagan va’dalar bu yerga kirmaydi, shuning uchun yig‘indi umumiy sondan kichik bo‘lishi mumkin.',
  'agreementsBoard.rowHint': 'bajarilgan / unutilgan',
  'agreementsBoard.ofTaken': '/ {count}',
  'agreementsBoard.noByEmployee': 'Xodimga bog‘langan va’da yo‘q',
  'agreementsBoard.empty.title': 'Bu davrda va’da berilmagan',
  'agreementsBoard.empty.description':
    'Va’dalarni tungi to‘liq tahlil suhbat matnidan ajratib oladi.',

  /* ------------------------------------------------------------ Signallar */
  'signals.title': 'Diqqat talab qiladi',
  'signals.description':
    'Menejer aralashuvi kerak bo‘lgan suhbatlar. Bu ro‘yxat har safar qayta hisoblanadi.',
  'signals.openTotal': 'jami {count} ta ochiq',
  'signals.resolvedCount': '{count} tasi ko‘rildi',
  'signals.resolve': 'Ko‘rildi deb belgilash',
  'signals.resolveHint':
    'Suhbat shu signal navbatidan chiqadi. Ma’lumotning o‘zi o‘zgarmaydi va buni ortga qaytarib bo‘lmaydi.',
  'signals.allHandled': 'Barchasi ko‘rib chiqilgan',
  'signals.empty.title': 'Diqqat talab qiladigan suhbat yo‘q',
  'signals.empty.description':
    'Bu davrda hech bir signal ishga tushmagan — hammasi joyida.',

  'signal.unanswered': 'Javobsiz qolgan',
  'signal.unassigned': 'Biriktirilmagan',
  'signal.low_score': 'Past ball',
  'signal.rule_violations': 'Qoida buzilgan',
  'signal.angry_customer': 'Jahli chiqqan mijoz',
  'signal.forgotten_agreement': 'Unutilgan va’da',
  'signal.needs_review': 'Qayta ko‘rish kerak',

  'signalHint.unanswered': 'Mijoz yozgan, lekin birorta ham javob xabari yo‘q.',
  'signalHint.unassigned':
    'Barcha biriktirish qoidalari ishlagach ham xodim aniqlanmadi.',
  'signalHint.low_score': 'Suhbat bahosi 49 va undan past — «Yomon» bandi.',
  'signalHint.rule_violations': 'Tahlil kamida bitta qoida buzilishini topdi.',
  'signalHint.angry_customer':
    'Mijozning yakuniy kayfiyati «jahli chiqqan» deb baholandi.',
  'signalHint.forgotten_agreement':
    'Berilgan va’da tungi tekshiruvda unutilgan deb belgilandi.',
  'signalHint.needs_review':
    'Tezkor va to‘liq tahlil ballari bir-biridan farq qildi.',

  /* -------------------------------------------------------------- AI izoh */
  'insights.action': 'AI izohini olish',
  'insights.title': 'AI izohi',
  'insights.failed':
    'Izohni olishning imkoni bo‘lmadi. Grafik esa joyida qoladi.',
  'insights.busy':
    'AI hozir band — bir lahzadan keyin qayta urinib ko‘ring. So‘rov to‘g‘ri edi.',
  'insights.caveat':
    'Bu — taxminlar, xulosa emas. Raqamlar serverda hisoblanadi, model faqat ularni izohlaydi.',

  /* ------------------------------------------------------------ AI savol */
  'ask.title': 'AI dan so‘rang',
  'ask.description':
    'Tanlangan davr statistikasi bo‘yicha savol bering — javob shu ma’lumotlarga tayanadi.',
  'ask.placeholder': 'Masalan: qaysi xodim eng ko‘p kelishuvni unutgan?',
  'ask.submit': 'So‘rash',
  'ask.thinking': 'Javob tayyorlanmoqda — bu bir necha soniya olishi mumkin…',
  'ask.failed':
    'Javob olinmadi. Savolni qisqartirib yoki davrni toraytirib qayta urinib ko‘ring.',
  'ask.busy':
    'AI hozir band. Savolingiz to‘g‘ri — bir lahzadan keyin «So‘rash» tugmasini qayta bosing.',
  'ask.evidence': 'Javob asoslangan suhbatlar',
  'ask.clear': 'Suhbatni tozalash',
  'ask.suggestion.1': 'Qaysi xodim eng yaxshi ishlayapti?',
  'ask.suggestion.2': 'Sotuvlar eng ko‘p qaysi sabab bilan yo‘qolyapti?',
  'ask.suggestion.3': 'Shu davrda nimani birinchi bo‘lib tuzatish kerak?',
  'ask.scopeHint':
    'Model faqat shu davr statistikasini ko‘radi: yozishmalar matni ham, mijoz kontaktlari ham unga berilmaydi. Har bir savol mustaqil — oldingi savol eslab qolinmaydi.',

  /* ---------------------------------------------------------- Sozlamalar */
  'settings.subtitle':
    'Kompaniya, xodimlar va AI konfiguratsiyasi. O‘qish barchaga ochiq, o‘zgartirish menejer rolini talab qiladi.',
  'settings.readOnly': 'Faqat ko‘rish',
  'settings.company': 'Kompaniya',
  'settings.employees': 'Xodimlar',
  'settings.catalog': 'AI konfiguratsiyasi',
  'settings.products': 'Mahsulotlar',
  'settings.reasons': 'Sabablar',
  'settings.rulebook': 'Qoidalar fayli',
  'settings.save': 'Saqlash',
  'settings.saved': 'Saqlandi',
  'settings.saveFailed': 'Saqlab bo‘lmadi',
  'settings.companyTitle': 'Kompaniya sozlamalari',
  'settings.companyHint':
    'Bu sozlamalar suhbatlarni kimga biriktirish va qachon yopishni belgilaydi.',
  'settings.companyName': 'Kompaniya nomi',
  'settings.timezone': 'Vaqt mintaqasi',
  'settings.timezoneHint':
    'IANA nomi, masalan Asia/Tashkent. Smena jadvallari shu mintaqada hisoblanadi.',
  'settings.timezoneInvalid':
    'Bunday vaqt mintaqasi mavjud emas. To‘liq IANA nomini kiriting (Asia/Tashkent).',
  'settings.attributionMode': 'Biriktirish usuli',
  'settings.attributionModeHint':
    'Usulni o‘zgartirish eski suhbatlarni qayta biriktirmaydi, qo‘lda biriktirilganlar esa hech qachon o‘zgarmaydi.',
  'settings.idleGap': 'Suhbatni yopish oralig‘i',
  'settings.idleGapHint':
    'Shuncha vaqt sukunatdan keyin suhbat yopiladi va yangisi boshlanadi.',
  'settings.hours': '{count} soat',
  'settings.retention': 'Ma’lumotni saqlash muddati (oy)',
  'settings.retentionHint':
    'Bo‘sh qoldirsangiz — abadiy saqlanadi. Aks holda haftalik tozalash undan eski suhbatlarni o‘chiradi.',
  'settings.retentionForever': 'Abadiy',
  'settings.retentionWarning':
    'Diqqat: {months} oydan eski suhbatlar, xabarlar va ularning tahlili keyingi haftalik tozalashda butunlay o‘chiriladi. Buni ortga qaytarib bo‘lmaydi.',

  /* -------------------------------------------------------- Xodimlar */
  'employeesTable.description':
    'Suhbatlari baholanadigan xodimlar. Ishdan ketgan xodimni o‘chirish o‘rniga faolsizlantiring.',
  'employeesTable.search': 'Ism bo‘yicha qidirish',
  'employeesTable.add': 'Xodim qo‘shish',
  'employeesTable.shiftCount': '{count} ta smena',
  'employeesTable.cabinet': 'Kabinet',
  'employeesTable.linked': 'Bog‘langan',
  'employeesTable.empty.title': 'Xodimlar qo‘shilmagan',
  'employeesTable.empty.description':
    'Xodimlarsiz reyting ham, biriktirish ham ishlamaydi. Birinchi xodimni qo‘shing.',

  'employeeForm.createTitle': 'Yangi xodim',
  'employeeForm.editTitle': 'Xodimni tahrirlash',
  'employeeForm.description':
    'Ism va bo‘lim reyting hamda bo‘limlar taqqoslovida ishlatiladi.',
  'employeeForm.fullName': 'To‘liq ism',
  'employeeForm.department': 'Bo‘lim',
  'employeeForm.departmentHint':
    'Bo‘limlar taqqoslovining yagona manbai. Mavjud nomlardan tanlang — bir xil bo‘lim ikki xil yozilmasin.',
  'employeeForm.active': 'Faol',
  'employeeForm.activeHint':
    'Faolsiz xodim biriktirish ro‘yxatlarida ko‘rinmaydi, lekin tarixi saqlanib qoladi.',
  'employeeForm.shifts': 'Smena jadvali',
  'employeeForm.shiftsHint':
    'Faqat «smena jadvali» biriktirish usulida ishlatiladi. Vaqtlar kompaniya mintaqasidagi mahalliy soat.',
  'employeeForm.noShifts': 'Smena belgilanmagan',
  'employeeForm.addShift': 'Smena qo‘shish',
  'employeeForm.removeShift': 'Smenani o‘chirish',
  'employeeForm.weekday': 'Hafta kuni',
  'employeeForm.start': 'Boshlanishi',
  'employeeForm.end': 'Tugashi',
  'employeeForm.overnightHint':
    'Tungi smena qonuniy: 22:00 — 06:00 keyingi kunga o‘tadi.',
  'employeeForm.userLinkNote':
    'Xodimni tizim foydalanuvchisiga bog‘lash bu yerdan qilinmaydi — buni administrator Django admin panelida bajaradi.',

  'weekday.mon': 'Dushanba',
  'weekday.tue': 'Seshanba',
  'weekday.wed': 'Chorshanba',
  'weekday.thu': 'Payshanba',
  'weekday.fri': 'Juma',
  'weekday.sat': 'Shanba',
  'weekday.sun': 'Yakshanba',

  /* ------------------------------------------------------- Mahsulotlar */
  'productsTable.description':
    'AI faqat shu ro‘yxatdagi mahsulotlarni tanib oladi. Ro‘yxat bo‘sh bo‘lsa, mahsulot tahlili ham bo‘sh qoladi.',
  'productsTable.search': 'Nomi bo‘yicha qidirish',
  'productsTable.add': 'Mahsulot qo‘shish',
  'productsTable.active': 'Faol',
  'productsTable.delete': 'O‘chirish',
  'productsTable.deactivate': 'Faolsizlantirish',
  'productsTable.deleteTitle': 'Mahsulotni o‘chirish',
  'productsTable.deleteWarning':
    'O‘chirish bu mahsulotning o‘tmishdagi tahlillar bilan bog‘lanishini ham yo‘q qiladi — eski hisobotlardagi raqamlar kamayadi. Odatda faolsizlantirish to‘g‘riroq: u kelajakdagi tanishni to‘xtatadi, tarixni esa saqlaydi.',
  'productsTable.empty.title': 'Katalog bo‘sh',
  'productsTable.empty.description':
    'Mahsulot qo‘shmaguningizcha AI suhbatlarda mahsulotni aniqlay olmaydi.',

  'productForm.createTitle': 'Yangi mahsulot',
  'productForm.editTitle': 'Mahsulotni tahrirlash',
  'productForm.description':
    'Nom AI ga aynan shu ko‘rinishda ko‘rsatiladi — mos yozilishi muhim.',
  'productForm.name': 'Nomi',
  'productForm.category': 'Turkum',
  'productForm.descriptionField': 'Tavsif',
  'productForm.price': 'Narxi',
  'productForm.priceHint':
    'Narx ko‘rsatilsa, yo‘qotilgan imkoniyatlar pulda ham hisoblanadi.',
  'productForm.noPrice': 'Ko‘rsatilmagan',
  'productForm.noPriceHint': 'Narx ko‘rsatilmagan',
  'productForm.currency': 'Valyuta',
  'productForm.priceInvalid': 'Narx raqam bo‘lishi kerak.',
  'productForm.priceNegative': 'Narx manfiy bo‘lishi mumkin emas.',
  'productForm.duplicate':
    'Bunday nomli mahsulot allaqachon mavjud. Ikki xil yozuv statistikani ikkiga bo‘lib yuboradi.',

  /* ---------------------------------------------------------- Sabablar */
  'reasonsTable.description':
    '«Nega sotib olmadi» taksonomiyasi. AI faqat shu ro‘yxatdan tanlaydi.',
  'reasonsTable.add': 'Sabab qo‘shish',
  'reasonsTable.defaults': 'Standart sabablar',
  'reasonsTable.defaultsHint':
    'Platforma bilan birga keladi va o‘zgartirilmaydi.',
  'reasonsTable.own': 'Kompaniya sabablari',
  'reasonsTable.ownHint': 'Siz qo‘shgan qo‘shimcha sabablar.',
  'reasonsTable.noOwn': 'Hali qo‘shilmagan',
  'reasonsTable.locked': 'O‘zgarmas',
  'reasonsTable.delete': 'O‘chirish',

  'reasonForm.createTitle': 'Yangi sabab',
  'reasonForm.editTitle': 'Sababni tahrirlash',
  'reasonForm.description':
    'Kod — mashina kaliti, yorliq esa foydalanuvchiga ko‘rinadigan matn.',
  'reasonForm.label': 'Yorlig‘i',
  'reasonForm.code': 'Kodi',
  'reasonForm.codeHint':
    'Yorliqdan avtomatik hosil bo‘ladi. Faqat lotin harflari, raqam va pastki chiziq.',
  'reasonForm.codeLocked':
    'Kodni o‘zgartirib bo‘lmaydi: tahlil natijalari va menejer tuzatishlari aynan shu kodni saqlaydi.',
  'reasonForm.duplicate':
    'Bunday kod allaqachon mavjud — standart sabablar ichida ham tekshiriladi.',

  /* ------------------------------------------------------ Qoidalar fayli */
  'rulebook.description':
    'Kompaniyaning ichki savdo qoidalari. Fayl tahlil qilinib, tungi baholash uchun alohida prompt tayyorlanadi.',
  'rulebook.upload': 'Qoidalarni yuklash',
  'rulebook.formats':
    'PDF, DOCX yoki XLSX. Eng ko‘pi 20 MB. Yangi fayl yuklash — bu qoidalarni yangilash usuli.',
  'rulebook.typeUnsupported':
    'Bu fayl turi qo‘llab-quvvatlanmaydi. PDF, DOCX yoki XLSX tanlang.',
  'rulebook.tooLarge': 'Fayl 20 MB dan katta.',
  'rulebook.legacyFormat':
    'Eski .doc / .xls formati tahlil bosqichida xato beradi. Faylni .docx yoki .xlsx sifatida qayta saqlang.',
  'rulebook.uploadFailed': 'Faylni yuklab bo‘lmadi.',
  'rulebook.processing':
    'Fayl tahlil qilinmoqda. Uzun hujjat uchun bu bir necha daqiqa olishi mumkin.',
  'rulebook.ready':
    'Qoidalar faollashtirildi. Ta’siri keyingi tungi tahlildan boshlab ko‘rinadi.',
  'rulebook.processingFailed': 'Faylni tahlil qilib bo‘lmadi.',
  'rulebook.active': 'Faol',
  'rulebook.download': 'Yuklab olish',
  'rulebook.delete': 'O‘chirish',
  'rulebook.empty.title': 'Qoidalar fayli yuklanmagan',
  'rulebook.empty.description':
    'Fayl bo‘lmasa, suhbatlar platformaning umumiy qoidalari bo‘yicha baholanadi.',

  'rulebookStatus.uploaded': 'Navbatda',
  'rulebookStatus.processing': 'Tahlil qilinmoqda',
  'rulebookStatus.ready': 'Tayyor',
  'rulebookStatus.error': 'Xato',

  /* -------------------------------------------------------- Integratsiyalar */
  'settings.integrations': 'Integratsiyalar',
  'integrations.modeNotice':
    'Joriy biriktirish usuli: {mode}. Uni «Kompaniya» bo‘limida o‘zgartirish mumkin.',

  'accountStatus.pending': 'Ulanmoqda',
  'accountStatus.connected': 'Ulangan',
  'accountStatus.disconnected': 'Uzilgan',
  'accountStatus.error': 'Xatolik',

  /* ------------------------------------------------------------- Telegram */
  'telegram.title': 'Telegram',
  'telegram.description':
    'Telegram akkaunti orqali shaxsiy yozishmalar kuzatiladi. Guruhlar ataylab kuzatilmaydi.',
  'telegram.connect': 'Akkaunt ulash',
  'telegram.connectTitle': 'Telegram akkauntini ulash',
  'telegram.connectDescription':
    'QR kod eng qulay usul. SMS orqali ulash — zaxira variant.',
  'telegram.accountType': 'Akkaunt turi',
  'telegram.accountTypeHint': 'Kompaniya raqami yoki xodimning shaxsiy raqami.',
  'telegram.typeCompany': 'Kompaniya',
  'telegram.typePersonal': 'Shaxsiy',
  'telegram.consent': 'Xodim roziligi olingan',
  'telegram.consentHint':
    'Shaxsiy raqamni ulash uchun xodimning yozma roziligi shart. Roziliksiz server ulanishni rad etadi.',
  'telegram.defaultEmployee': 'Sukut bo‘yicha xodim',
  'telegram.defaultEmployeeHint':
    '«Akkaunt bo‘yicha» biriktirish usulida shu akkauntdagi barcha suhbatlar shu xodimga yoziladi.',
  'telegram.noDefaultEmployee': 'Tanlanmagan',
  'telegram.startQr': 'QR kod bilan ulash',
  'telegram.useSms': 'SMS orqali ulash',
  'telegram.qrAlt': 'Telegram uchun QR kod',
  'telegram.qrInstructions':
    'Telegram → Sozlamalar → Qurilmalar → «Kompyuterni ulash» va shu kodni skanerlang. Kod har 30 soniyada yangilanadi.',
  'telegram.phone': 'Telefon raqami',
  'telegram.phoneHint': 'Xalqaro formatda, masalan +998901234567.',
  'telegram.sendCode': 'Kod yuborish',
  'telegram.code': 'Telegramdan kelgan kod',
  'telegram.codeHint': 'Kod Telegram ilovasiga xabar sifatida keladi.',
  'telegram.verify': 'Tasdiqlash',
  'telegram.password': 'Ikki bosqichli parol',
  'telegram.passwordHint':
    'Akkauntda ikki bosqichli himoya yoqilgan — Telegram bulut parolini kiriting.',
  'telegram.submitPassword': 'Davom etish',
  'telegram.connected': 'Akkaunt ulandi',
  'telegram.tier0Note':
    'Oxirgi 6 oylik tarix avtomatik yuklanmoqda — u baholanmaydi, faqat saqlanadi.',
  'telegram.disconnect': 'Uzish',
  'telegram.lastHealthy': 'Oxirgi aloqa: {value}',
  'telegram.staleHeartbeat':
    'Akkaunt 15 daqiqadan beri aloqaga chiqmadi. Sessiya buzilayotgan bo‘lishi mumkin — qayta ulanishga tayyor turing.',
  'telegram.empty.title': 'Telegram ulanmagan',
  'telegram.empty.description':
    'Akkaunt ulanmaguncha Telegramdagi suhbatlar tahlil qilinmaydi.',

  'telegram.error.consent':
    'Shaxsiy akkaunt uchun xodim roziligi belgilanishi shart.',
  'telegram.error.phoneInvalid':
    'Telefon raqami noto‘g‘ri. Xalqaro formatda kiriting.',
  'telegram.error.phoneTaken': 'Bu raqam boshqa kompaniyaga ulangan.',
  'telegram.error.phoneBanned': 'Telegram bu raqamni bloklagan.',
  'telegram.error.codeInvalid': 'Kod noto‘g‘ri yoki muddati o‘tgan.',
  'telegram.error.codeSendFailed':
    'Kodni yuborib bo‘lmadi. Birozdan so‘ng qayta urinib ko‘ring.',
  'telegram.error.codeVerifyFailed':
    'Kodni tekshirib bo‘lmadi. Qayta urinib ko‘ring.',
  'telegram.error.passwordRejected': 'Parol qabul qilinmadi.',
  'telegram.error.passwordNotRequired':
    'Bu ulanishda parol so‘ralmagan edi. Jarayonni qaytadan boshlang.',
  'telegram.error.loginExpired':
    'Ulanish seansi muddati tugadi. Qaytadan boshlang.',
  'telegram.error.floodWait':
    'Telegram vaqtincha cheklov qo‘ydi. Biroz kutib, qayta urinib ko‘ring.',
  'telegram.error.accountTaken':
    'Bu Telegram akkaunti boshqa kompaniyaga ulangan.',
  'telegram.error.qrFailed':
    'Telegram bilan bog‘lanib bo‘lmadi. Qayta urinib ko‘ring.',
  'telegram.error.throttled':
    'Soatiga 10 martadan ko‘p ulanishga urinib bo‘lmaydi. Bir oz kutib turing.',

  /* -------------------------------------------------------------- Backfill */
  'backfill.title': 'Tarixni yuklash',
  'backfill.description':
    'Eski yozishmalarni yuklab, ularni ham baholash. Bir vaqtda faqat bitta vazifa ishlaydi.',
  'backfill.cancel': 'Bekor qilish',
  'backfill.fetched': '{count} ta xabar',
  'backfillScope.tier_0': 'Avtomatik (6 oy)',
  'backfillScope.tier_a': 'Baholanmagan',
  'backfillScope.tier_b': 'Oxirgi 30 kun',
  'backfillScope.tier_c': 'Oxirgi 6 oy',
  'backfillStatus.pending': 'Navbatda',
  'backfillStatus.running': 'Ishlamoqda',
  'backfillStatus.cancelled': 'Bekor qilingan',
  'backfillStatus.completed': 'Tugallandi',
  'backfillStatus.error': 'Xatolik',

  /* ------------------------------------------------------------ Instagram */
  'instagram.title': 'Instagram',
  'instagram.description':
    'Instagram biznes akkaunti Direct yozishmalari kuzatiladi.',
  'instagram.connect': 'Instagram ulash',
  'instagram.reconnect': 'Qayta ulash',
  'instagram.pause': 'Kuzatuvni to‘xtatish',
  'instagram.resume': 'Kuzatuvni davom ettirish',
  'instagram.remove': 'Ulanishni o‘chirish',
  'instagram.tokenUntil': 'Token muddati: {date}',
  'instagram.connectSuccess': 'Instagram muvaffaqiyatli ulandi.',
  'instagram.connectFailed':
    'Instagramga ulanib bo‘lmadi. Qaytadan urinib ko‘ring.',
  'instagram.empty.title': 'Instagram ulanmagan',
  'instagram.empty.description':
    'Ulash uchun Meta orqali ruxsat berish kerak — bu bir necha qadamdan iborat.',
  'instagramState.monitoring': 'Kuzatilmoqda',
  'instagramState.paused': 'To‘xtatilgan',
  'instagramState.token_expiring': 'Token tugayapti',
  'instagramState.reconnect_required': 'Qayta ulash kerak',

  /* ----------------------------------------------------------- Veb-vidjet */
  'web.title': 'Veb-chat',
  'web.description':
    'Saytdagi chat xabarlarini sizning serveringiz kalit orqali yuboradi. Kotib chatni o‘zi joylashtirmaydi.',
  'web.create': 'Kalit yaratish',
  'web.createTitle': 'Yangi vidjet kaliti',
  'web.createDescription':
    'Har bir sayt uchun alohida kalit yarating — shunda birini almashtirish boshqasiga ta’sir qilmaydi.',
  'web.name': 'Nomi',
  'web.nameHint': 'Masalan: asosiy sayt, landing sahifa.',
  'web.unnamed': 'Nomsiz',
  'web.rotate': 'Kalitni almashtirish',
  'web.rotateWarning':
    'Ro‘yxatda kalitning faqat oxirgi 4 belgisi ko‘rinadi. Kalit yo‘qolsa, uni faqat almashtirish mumkin — eski kalit shu zahoti ishlamay qoladi, shuning uchun avval saytni yangilang.',
  'web.keyTitle': 'Vidjet kaliti',
  'web.keyDescription':
    'Bu kalit boshqa hech qachon ko‘rsatilmaydi. Hozir nusxalab, xavfsiz joyga saqlang.',
  'web.keySaved': 'Saqladim',
  'web.copyKey': 'Nusxalash',
  'web.keyWarning':
    'Kalitni faqat serveringizda saqlang. Sahifa JavaScript’iga qo‘ymang: kalitga ega bo‘lgan har kim soxta xabar yubora oladi.',
  'web.empty.title': 'Vidjet kaliti yo‘q',
  'web.empty.description': 'Sayt chatini ulash uchun avval kalit yarating.',

  /* ----------------------------------------------------------- Mijozlar */
  'customers.subtitle':
    'Har bir kanal uchun alohida mijoz yozuvi. Bir odamning ikki kanaldagi yozuvini qo‘lda birlashtirish mumkin.',
  'customers.description':
    'Kanal bo‘yicha mijoz identifikatorlari. Avtomatik moslashtirish yo‘q.',
  'customers.search': 'Ism, username yoki telefon',
  'customers.name': 'Mijoz',
  'customers.phone': 'Telefon',
  'customers.state': 'Holati',
  'customers.firstSeen': 'Birinchi marta',
  'customers.alias': 'Birlashtirilgan',
  'customers.aliasHint':
    'Bu yozuv boshqa mijozga birlashtirilgan va statistikada alohida sanalmaydi.',
  'customers.mergedCount': '+{count} yozuv',
  'customers.mergedIntoThisHint':
    'Shu mijozga birlashtirilgan boshqa kanal yozuvlari soni.',
  'customers.empty.title': 'Mijozlar topilmadi',
  'customers.empty.description':
    'Kanal ulanib, suhbatlar kela boshlagach mijozlar avtomatik paydo bo‘ladi.',

  'merge.title': 'Mijozlarni birlashtirish',
  'merge.description':
    'Chapdagi yozuv o‘ngdagisiga qo‘shiladi: suhbatlari saqlanadi, lekin statistikada alohida sanalmaydi.',
  'merge.pickTarget': 'Asosiy yozuvni tanlang',
  'merge.search': 'Asosiy yozuvni qidirish',
  'merge.searchHint':
    'Ro‘yxatda faqat mustaqil yozuvlar ko‘rinadi — allaqachon birlashtirilganiga birlashtirib bo‘lmaydi.',
  'merge.submit': 'Birlashtirish',
  'merge.error.self': 'Yozuvni o‘zi bilan birlashtirib bo‘lmaydi.',
  'merge.error.cycle':
    'Bu ikki yozuv allaqachon teskari yo‘nalishda bog‘langan.',
  'merge.error.notCanonical':
    'Tanlangan yozuv o‘zi ham birlashtirilgan. Asosiy yozuvni tanlang.',
  'merge.error.otherCompany': 'Bu mijoz boshqa kompaniyaga tegishli.',
  'merge.error.notFound': 'Bunday mijoz topilmadi.',

  /* --------------------------------------------------------- Hisobotlar */
  'reports.subtitle':
    'Excel hisobotlari. Fayl 24 soat saqlanadi, keyin avtomatik o‘chiriladi.',
  'reports.title': 'Eksportlar',
  'reports.description': 'Oxirgi 50 ta so‘rov. Faqat .xlsx formati mavjud.',
  'reports.kind': 'Hisobot turi',
  'reports.kindConversations': 'Suhbatlar',
  'reports.kindRatings': 'Reyting',
  'reports.kind.conversations': 'Suhbatlar hisoboti',
  'reports.kind.ratings': 'Xodimlar reytingi',
  'reports.create': 'Hisobot yaratish',
  'reports.download': 'Yuklab olish',
  'reports.window': '{from} — {to}',
  'reports.expiresIn': 'muddati {value}',
  'reports.expired': 'muddati tugagan',
  'reports.empty.title': 'Hisobot yaratilmagan',
  'reports.empty.description':
    'Davrni tanlab, hisobot yarating — fayl fonda tayyorlanadi.',
  'exportStatus.pending': 'Navbatda',
  'exportStatus.running': 'Tayyorlanmoqda',
  'exportStatus.done': 'Tayyor',
  'exportStatus.error': 'Xatolik',

  /* ------------------------------------------- Logins and passwords */

  'settings.account': 'Login va parol',
  'account.identity': 'Mening akkauntim',
  'account.identityDescription': 'Tizimga qaysi login bilan kirgansiz.',
  'account.logins': 'Loginlar',
  'account.loginsDescription': 'Kompaniya uchun yangi login yaratish.',
  'account.loginsHint':
    'Loginlar ro‘yxatini qaytaradigan API yo‘q, shuning uchun bu yerda faqat yangisini yaratasiz. Mavjud loginning parolini «Xodimlar» bo‘limidan tiklaysiz.',

  'user.username': 'Login',
  'user.usernameHint': 'Butun platforma bo‘yicha takrorlanmas bo‘lishi shart.',
  'user.name': 'To‘liq ism',
  'user.firstName': 'Ism',
  'user.lastName': 'Familiya',
  'user.role': 'Rol',
  'user.roleHint': 'Faqat o‘zingiz bera oladigan rollar ko‘rsatiladi.',
  'user.passwordHint': 'Bo‘sh qoldirsangiz, tizim o‘zi yaratib beradi.',
  'user.passwordPlaceholder': 'Avtomatik yaratiladi',
  'user.cabinet': 'Kabinet',
  'user.cabinetLinked': 'Xodim profiliga bog‘langan',
  'user.cabinetMissing': 'Bog‘lanmagan',

  'credentials.title': 'Login tayyor',
  'credentials.description':
    'Parol faqat shu yerda va faqat bir marta ko‘rsatiladi.',
  'credentials.username': 'Login',
  'credentials.password': 'Parol',
  'credentials.copyUsername': 'Loginni nusxalash',
  'credentials.copyPassword': 'Parolni nusxalash',
  'credentials.warning':
    'Oynani yopganingizdan keyin parolni qayta ko‘rish imkoni yo‘q. Hozir nusxalab, xodimga yetkazing.',
  'credentials.saved': 'Nusxalab oldim',

  'inviteUser.title': 'Yangi login',
  'inviteUser.description':
    'Kompaniyangiz uchun login yaratadi. Parol bir marta ko‘rsatiladi.',
  'inviteUser.submit': 'Login yaratish',
  'inviteUser.employee': 'Xodim',
  'inviteUser.employeeHint':
    'Xodimga bog‘lansa, unga shaxsiy kabinet va brauzer kengaytmasi ochiladi.',
  'inviteUser.noEmployee': 'Bog‘lanmasin',

  'resetPassword.title': 'Parolni tiklash',
  'resetPassword.description': '{name} uchun yangi parol o‘rnatiladi.',
  'resetPassword.submit': 'Parolni tiklash',
  'resetPassword.newPassword': 'Yangi parol',
  'resetPassword.newPasswordHint':
    'Bo‘sh qoldirsangiz, tizim o‘zi yaratib beradi.',
  'resetPassword.sessionsNote':
    'Parolni tiklash ochiq sessiyalarni to‘xtatmaydi — eski token yana 5 kungacha amal qiladi.',

  'changePassword.title': 'Parolni o‘zgartirish',
  'changePassword.description': 'O‘z parolingizni o‘zgartirasiz.',
  'changePassword.current': 'Joriy parol',
  'changePassword.new': 'Yangi parol',
  'changePassword.confirm': 'Yangi parolni takrorlang',
  'changePassword.mismatch': 'Parollar mos kelmadi.',
  'changePassword.unchanged': 'Yangi parol joriysi bilan bir xil.',
  'changePassword.submit': 'O‘zgartirish',
  'changePassword.success': 'Parol o‘zgartirildi.',

  'employeeForm.createLogin': 'Login ham yaratilsin',
  'employeeForm.createLoginHint':
    'Xodim va uning logini bitta amalda yaratiladi. Keyinroq bu oynadan login qo‘shib bo‘lmaydi.',

  'conversationTable.extensionSilent': 'Kengaytma ishlamagan',
  'conversationTable.extensionSilentHint':
    'Suhbatga javob berilgan, lekin kengaytma birorta jo‘natishni qayd etmagan — xodim uni yoqmagan bo‘lishi mumkin.',
} satisfies Record<string, Message>

export type MessageKey = keyof typeof uz

/** `ru` va `en` fayllari shu tipga moslashtiriladi. */
export type Messages = Record<MessageKey, Message>
