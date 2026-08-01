# Namuna suhbatlar — barcha statistikani to'ldirish uchun

Bu faylda **8 turdagi 5 tadan, jami 40 ta suhbat** bor. Ular ataylab shunday
tanlanganki, dashboard'dagi **har bir raqam, chiziq va signal** to'lishi kerak.

## Avval katalogni to'ldiring

Suhbatlarni yozishdan **oldin** `Sozlamalar → AI konfiguratsiyasi` da quyidagilarni
qo'shing, aks holda mahsulot tahlili bo'sh qoladi (AI faqat katalogdagi
mahsulotni taniy oladi):

| Mahsulot | Turkum | Narx | Valyuta |
|---|---|---|---|
| Vitrina 120sm | Mebel | 4 200 000 | UZS |
| Vitrina 180sm | Mebel | 6 500 000 | UZS |
| Oshxona stoli | Mebel | 3 100 000 | UZS |
| Yumshoq divan | Mebel | 8 900 000 | UZS |
| Kompyuter stoli | Mebel | 1 750 000 | UZS |

Sabablar: 8 ta standart sabab allaqachon mavjud. Qo'shimcha sifatida
**`yetkazib_berish`** — «Yetkazib berish shartlari mos kelmadi» ni qo'shing.

Xodimlar: kamida **4 ta** xodim, ikkitasi «Sotuv» bo'limida, ikkitasi
«Onlayn savdo» bo'limida — shunda bo'limlar taqqoslovi ham ishlaydi.

## Qanday ishlatiladi

- Har bir suhbatni **alohida mijoz** bilan yozing (bir odam bilan ketma-ket
  yozsangiz, ular bitta suhbatga qo'shilib ketadi).
- Suhbat **yopilishi** kerak: oxirgi xabardan keyin `idle_gap_hours` (sukut
  bo'yicha 8 soat) sukunat kerak. Test uchun bu qiymatni `4` soatga tushirib
  turishingiz mumkin.
- Faqat **yopilgan** suhbatlar baholanadi va statistikaga kiradi.
- Kanal ustuni — qaysi kanalda yozish tavsiya etilishini ko'rsatadi; kanal
  statistikasi shu tariqa uchalasi bo'yicha to'ladi.

---

# A. Sotildi (5 ta)

Nimani to'ldiradi: **konversiya**, **sotildi** ulushi, **ijobiy kayfiyat**,
yuqori ball, funnelning to'liq o'tishi.

### A1 — Vitrina 120sm · Telegram
```
Mijoz:  Assalomu alaykum, vitrina 120sm bormi?
Xodim:  Assalomu alaykum! Ha, bor. Sizga qaysi rang kerak — oq yoki yong'oq?
Mijoz:  Oq bo'lsa yaxshi edi. Narxi qancha?
Xodim:  Oq rangi 4 200 000 so'm. Ichida 3 ta shisha javon, LED yoritgich bilan.
Mijoz:  Yaxshi ekan. Yetkazib berasizmi?
Xodim:  Toshkent bo'ylab bepul, ertaga soat 14:00 dan keyin yetkazamiz.
Mijoz:  Bo'pti, olaman. Manzilni yuboraman.
Xodim:  Rahmat! Buyurtmangizni rasmiylashtirdim, ertaga aloqaga chiqamiz.
```

### A2 — Yumshoq divan · Instagram
```
Mijoz:  Salom, divanni ko'rdim, hali bormi?
Xodim:  Salom! Ha, omborda bor. Kulrang va bej rangda.
Mijoz:  Kulrang. O'lchami qanday?
Xodim:  220x95 sm, yotoq holatga ochiladi. Narxi 8 900 000 so'm.
Mijoz:  Bo'lib to'lash bormi?
Xodim:  Ha, 6 oyga foizsiz. Birinchi to'lov 1 500 000 so'm.
Mijoz:  Juda yaxshi, shu shartda olaman.
Xodim:  Ajoyib! Hujjatlar uchun pasport ma'lumotingizni yuboring.
```

### A3 — Oshxona stoli · Telegram
```
Mijoz:  Oshxona stoli kerak edi, 6 kishilik
Xodim:  Assalomu alaykum! 6 kishilik stolimiz bor — 160x90 sm, 3 100 000 so'm.
Mijoz:  Stullari bilanmi?
Xodim:  Yo'q, stullar alohida. Lekin komplekt olsangiz 10% chegirma beramiz.
Mijoz:  Komplekt qancha turadi?
Xodim:  Stol + 6 ta stul: 5 400 000 so'm, chegirma bilan 4 860 000 so'm.
Mijoz:  Shuni olaman, qachon yetkazasiz?
Xodim:  Payshanba kuni. Buyurtmani qabul qildim, rahmat!
```

### A4 — Kompyuter stoli · Veb-chat
```
Mijoz:  Kompyuter stoli narxi?
Xodim:  Assalomu alaykum! 1 750 000 so'm, 120x60 sm, monitor tagligi bilan.
Mijoz:  Balandligi sozlanadimi?
Xodim:  Bu modelda yo'q, lekin sozlanadigan modelimiz ham bor — 2 400 000 so'm.
Mijoz:  Oddiysi yetadi. Qanday to'lash mumkin?
Xodim:  Naqd, karta yoki Payme orqali. Sizga qaysi biri qulay?
Mijoz:  Payme. Havolani yuboring.
Xodim:  Yubordim. To'lovdan keyin 2 kun ichida yetkazamiz.
```

### A5 — Vitrina 180sm · Telegram
```
Mijoz:  Kattaroq vitrina bormi? 120 kichiklik qiladi
Xodim:  Assalomu alaykum! 180 sm li modelimiz bor — 6 500 000 so'm.
Mijoz:  Rasmini yuborasizmi?
Xodim:  Albatta, mana. Ichi 5 javonli, orqa fon oynali.
Mijoz:  Chiroyli ekan. Kafolat bormi?
Xodim:  2 yil kafolat, furnitura almashtirish ham kiradi.
Mijoz:  Yaxshi, olaman. Ertaga to'lov qilaman.
Xodim:  Rahmat! Sizga bron qilib qo'ydim, ertaga kutamiz.
```

---

# B. Sotilmadi — narx sababli (5 ta)

Nimani to'ldiradi: **sotilmadi** ulushi, **`narx`** sababi, sabab ulushlari
grafigi, yo'qotilgan imkoniyatlar (mahsulot × narx), funnelda **«Narx»**
bosqichidagi uzilish.

### B1 — Vitrina 120sm · Telegram
```
Mijoz:  Vitrina narxi qancha?
Xodim:  Assalomu alaykum! 120sm vitrina 4 200 000 so'm.
Mijoz:  Voy, qimmat ekan. Bozorda 3 millionga bor
Xodim:  Bizniki massiv yog'ochdan, LED bilan. Sifati boshqacha.
Mijoz:  Baribir qimmat. O'ylab ko'raman.
```

### B2 — Yumshoq divan · Instagram
```
Mijoz:  Divan qancha?
Xodim:  Salom! 8 900 000 so'm.
Mijoz:  Byudjetim 6 million edi, chegirma bo'ladimi?
Xodim:  Afsuski bu modelga chegirma yo'q.
Mijoz:  Unda menga to'g'ri kelmaydi, rahmat.
```

### B3 — Vitrina 180sm · Veb-chat
```
Mijoz:  180sm vitrina narxini ayting
Xodim:  6 500 000 so'm.
Mijoz:  Boshqa do'kondan 5 200 000 ga taklif qilishdi
Xodim:  Bizda material va furnitura sifatliroq.
Mijoz:  Farqi 1.3 million — bu men uchun ko'p. Kechirasiz.
```

### B4 — Oshxona stoli · Telegram
```
Mijoz:  Assalomu alaykum, oshxona stoli kerak
Xodim:  Assalomu alaykum! 6 kishilik — 3 100 000 so'm.
Mijoz:  Bo'lib to'lash bilan qancha bo'ladi?
Xodim:  6 oyga bo'lsa 3 600 000 so'm bo'ladi.
Mijoz:  Ustama juda ko'p ekan. Kerak emas.
```

### B5 — Kompyuter stoli · Instagram
```
Mijoz:  Stol narxi?
Xodim:  Salom! 1 750 000 so'm.
Mijoz:  Talaba uchun olmoqchi edim, arzonrog'i yo'qmi?
Xodim:  Eng arzoni shu.
Mijoz:  Unda kechroq olaman, hozircha qimmat.
```

---

# C. Sotilmadi — boshqa sabablar (5 ta)

Nimani to'ldiradi: **sabab ulushlari** grafigining qolgan qismi. Har biri
boshqa sababni beradi.

### C1 — `mavjud_emas` · Telegram
```
Mijoz:  Vitrina 120sm, yong'oq rangda bormi?
Xodim:  Assalomu alaykum! Afsuski yong'oq rangi hozir tugagan.
Mijoz:  Qachon keladi?
Xodim:  Aniq sana yo'q, taxminan bir oydan keyin.
Mijoz:  Menga bu hafta kerak edi. Boshqa joydan qidiraman.
```

### C2 — `raqobatchi` · Instagram
```
Mijoz:  Divan hali bormi?
Xodim:  Salom! Ha, bor.
Mijoz:  Kecha boshqa sahifadan buyurtma berib qo'ygandim, shuni bekor qilay dedim
Xodim:  Bizda ham xuddi shu model bor, yetkazib berish bepul.
Mijoz:  Ular allaqachon yo'lga chiqarishibdi. Keyingi safar.
```

### C3 — `vaqti_kelmadi` · Veb-chat
```
Mijoz:  Vitrinalar haqida ma'lumot bera olasizmi?
Xodim:  Albatta! 120sm — 4 200 000, 180sm — 6 500 000 so'm.
Mijoz:  Rahmat. Yangi kvartiraga ko'chganimizda olamiz
Xodim:  Qachon ko'chishni rejalashtiryapsiz?
Mijoz:  Kuzda. Hozircha shunchaki ko'rib qo'yayotgandim.
```

### C4 — `ishonch_yoq` · Telegram
```
Mijoz:  Sizdan olsam kafolat qanday ishlaydi?
Xodim:  2 yil kafolat, muammo bo'lsa ustamiz keladi.
Mijoz:  Do'koningiz bormi yoki faqat onlaynmi?
Xodim:  Hozircha onlayn ishlaymiz.
Mijoz:  Ko'rmasdan bunchalik pul berishga yuragim dov bermayapti. Kechirasiz.
```

### C5 — `yetkazib_berish` · Instagram
```
Mijoz:  Salom, oshxona stoli Samarqandga yetkaziladimi?
Xodim:  Salom! Afsuski hozircha faqat Toshkent bo'ylab yetkazamiz.
Mijoz:  Pochta orqali yuborsangiz bo'lmaydimi?
Xodim:  Mebel uchun bunday imkoniyat yo'q.
Mijoz:  Afsus, menga aynan yetkazib berish kerak edi.
```

---

# D. Noaniq (5 ta)

Nimani to'ldiradi: **noaniq** ulushi. Muhim: bular konversiya maxrajiga
**kirmaydi** — ular «hal qilinmagan» suhbatlar.

### D1 — Telegram
```
Mijoz:  Vitrina bormi?
Xodim:  Assalomu alaykum! Ha, 120 va 180 sm da bor.
Mijoz:  Rasmini yuboring
Xodim:  Mana, ikkalasi ham. Qaysi biri yoqdi?
Mijoz:  Ko'rib chiqaman
```

### D2 — Instagram
```
Mijoz:  Divan narxi?
Xodim:  Salom! 8 900 000 so'm.
Mijoz:  Rahmat
```

### D3 — Veb-chat
```
Mijoz:  Kompyuter stoli o'lchamlarini yuboring
Xodim:  120x60x75 sm. Monitor tagligi ham bor.
Mijoz:  Tushunarli
Xodim:  Yana savolingiz bo'lsa yozing, yordam beraman.
```

### D4 — Telegram
```
Mijoz:  Salom, do'koningiz manzili qayerda?
Xodim:  Assalomu alaykum! Hozircha onlayn ishlaymiz, ombor Yunusobodda.
Mijoz:  Aha
Xodim:  Qiziqqan mahsulotingiz bormi? Yordam beraman.
```

### D5 — Instagram
```
Mijoz:  Oshxona stoli va stullar komplektini ko'rsating
Xodim:  Mana komplekt: stol + 6 stul, 4 860 000 so'm chegirma bilan.
Mijoz:  Oilam bilan maslahatlashib ko'raman
Xodim:  Albatta, kutamiz.
```

---

# E. Javobsiz qolgan (5 ta)

Nimani to'ldiradi: **`unanswered`** signali, **`xodim_javob_bermadi`** sababi,
birinchi javob vaqti statistikasidagi bo'shliq.

> **Muhim:** bu suhbatlarga **umuman javob yozmang**. Faqat mijoz xabari
> bo'lishi kerak — shundagina signal ishga tushadi.

### E1 — Telegram
```
Mijoz:  Assalomu alaykum, vitrina 120sm narxi qancha?
Mijoz:  Javob bering iltimos
```

### E2 — Instagram
```
Mijoz:  Salom, divan bormi?
```

### E3 — Veb-chat
```
Mijoz:  Oshxona stoli bo'lib to'lashga bormi?
Mijoz:  Kimdir bormi?
```

### E4 — Telegram
```
Mijoz:  Kompyuter stolini bugun yetkazib bera olasizmi?
Mijoz:  Shoshilinch kerak edi
Mijoz:  ...
```

### E5 — Instagram
```
Mijoz:  Vitrina 180sm ni bron qilmoqchi edim
```

---

# F. Jahli chiqqan mijoz (5 ta)

Nimani to'ldiradi: **jahli chiqqan mijozlar** KPI'si, **`angry_customer`**
signali, salbiy kayfiyat ulushi.

### F1 — Telegram
```
Mijoz:  Buyurtmam qani? Uch kun oldin yetkazishingiz kerak edi!
Xodim:  Assalomu alaykum, tekshirib ko'raman.
Mijoz:  Har safar shunday deysiz! Menga aniq javob kerak!
Xodim:  Ombordan hali chiqmagan ekan.
Mijoz:  Bu qanaqasi umuman?! Pulimni qaytaring, kerak emas!
```

### F2 — Instagram
```
Mijoz:  Divan keldi, lekin oyog'i sinib qolgan
Xodim:  Kechirasiz, rasm yuborasizmi?
Mijoz:  Yubordim. Shunday holda yuborishga uyalmadingizmi?
Xodim:  Almashtirib beramiz.
Mijoz:  Qachon? Yana bir oy kutamanmi?! Bu masxarabozlik!
```

### F3 — Veb-chat
```
Mijoz:  Ikki kundan beri javob kutyapman
Xodim:  Kechirasiz, band edik.
Mijoz:  Band edik?! Men mijozman, pul to'layapman!
Xodim:  Tushunaman, hozir yordam beraman.
Mijoz:  Kech bo'ldi. Boshqa joydan oldim. Sizga ishonch yo'q.
```

### F4 — Telegram
```
Mijoz:  Narxni 4 200 000 dedingiz, endi 4 600 000 deyapsiz
Xodim:  Narxlar yangilandi.
Mijoz:  Kecha kelishgandik! Bu aldash-ku!
Xodim:  Eski narxda bera olmaymiz.
Mijoz:  Unda shartnomamiz tugadi. Hech kimga tavsiya qilmayman.
```

### F5 — Instagram
```
Mijoz:  Stol keldi, lekin rangi butunlay boshqa
Xodim:  Qaysi rangni buyurtma qilgan edingiz?
Mijoz:  Oq! Menga jigarrang yuboribsiz! O'qib ham ko'rmaysizmi?!
Xodim:  Tekshiramiz.
Mijoz:  Tekshirmang, olib keting. Vaqtimni behuda sarfladim.
```

---

# G. Kelishuv berilgan suhbatlar (5 ta)

Nimani to'ldiradi: **Kelishuvlar** bo'limi — berilgan va'dalar, bajarilganlar,
unutilganlar, kunlik dinamika, **`forgotten_agreement`** signali.

> Va'da **aniq harakat + vaqt** bilan aytilishi kerak («ertaga yuboraman»,
> «dushanbaga tayyorlayman»), shunda AI uni kelishuv sifatida ajratib oladi.

### G1 — Bajariladi · Telegram
```
Mijoz:  Barcha vitrinalarning narxlar ro'yxati bormi?
Xodim:  Ha, ertaga ertalab to'liq narxlar ro'yxatini yuboraman.
Mijoz:  Yaxshi, kutaman.
```
*Ertasi kuni xodim rostan ham narxlarni yuborsin — shunda «bajarilgan» bo'ladi.*

### G2 — Bajariladi · Instagram
```
Mijoz:  Divanning boshqa ranglarini ko'rsatasizmi?
Xodim:  Bugun kechqurun ombordan rasmga olib yuboraman.
Mijoz:  Rahmat!
```
*O'sha kuni rasm yuborilsin.*

### G3 — Unutiladi · Telegram
```
Mijoz:  Yetkazib berish narxini aniqlab bera olasizmi?
Xodim:  Albatta, dushanba kuni logistika bilan gaplashib javob beraman.
Mijoz:  Kutaman.
```
*Dushanba o'tsin va hech narsa yozilmasin — «unutilgan» bo'ladi.*

### G4 — Unutiladi · Veb-chat
```
Mijoz:  Kompyuter stoliga qo'shimcha javon bormi?
Xodim:  Bor, ertaga narxini aytaman.
Mijoz:  Bo'pti.
```
*Javob berilmasin.*

### G5 — Kutilmoqda · Instagram
```
Mijoz:  Oshxona stolini kelasi hafta olsam bo'ladimi?
Xodim:  Albatta, seshanba kuni sizga o'zim aloqaga chiqaman.
Mijoz:  Kelishdik.
```
*Muddat hali kelmagan bo'lsin — «kutilmoqda» holatida qoladi.*

---

# H. Past ball va qoida buzilishi (5 ta)

Nimani to'ldiradi: **past ball** signali (0–49), **`rule_violations`** signali,
rubrikadagi zaif tomonlar (salomlashish, ehtiyojni aniqlash, e'tirozlar bilan
ishlash, yopish), funnelning boshlang'ich bosqichlaridagi uzilish.

### H1 — Salomlashish yo'q, quruq javob · Telegram
```
Mijoz:  Assalomu alaykum, vitrina bormi?
Xodim:  bor
Mijoz:  Narxi?
Xodim:  4200000
Mijoz:  Yaxshi, o'ylab ko'ray
```

### H2 — Ehtiyoj aniqlanmagan · Instagram
```
Mijoz:  Divan qidiryapman
Xodim:  8 900 000 so'm.
Mijoz:  Qanaqa divan ekanini bilmadim-ku
Xodim:  Sahifada bor.
Mijoz:  Tushundim...
```

### H3 — E'tirozga javob berilmagan · Veb-chat
```
Mijoz:  Vitrina 120sm — 4 200 000 ko'pmi deb o'ylayapman
Xodim:  Narx shunday.
Mijoz:  Nega bunchalik qimmat?
Xodim:  Bilmadim, narxni men belgilamayman.
Mijoz:  Aha, mayli.
```

### H4 — Yopish qadami yo'q · Telegram
```
Mijoz:  Oshxona stoli menga yoqdi
Xodim:  Yaxshi.
Mijoz:  Nima qilishim kerak endi?
Xodim:  Bilmadim, o'zingiz hal qiling.
Mijoz:  Tushunarli.
```

### H5 — Sekin javob + noto'g'ri ohang · Instagram
```
Mijoz:  Salom, stol haqida so'ramoqchi edim
Xodim:  Nima kerak
Mijoz:  Kompyuter stoli narxi qancha?
Xodim:  Yozgandim-ku sahifada, o'qing
Mijoz:  Kerak emas unda.
```

---

# Nima to'ladi — tekshiruv ro'yxati

Bu 40 ta suhbat kiritilib, tungi tahlil o'tgandan keyin quyidagilar to'lishi kerak:

| Bo'lim | Qaysi guruh to'ldiradi |
|---|---|
| KPI: suhbatlar, o'rtacha ball, konversiya | Hammasi |
| KPI: birinchi javob vaqti | A–D, F–H (E javobsiz — o'rtachaga kirmaydi) |
| KPI: jahli chiqqan mijozlar | F |
| KPI: kelishuvlar | G |
| Natijalar donuti | A (sotildi), B–C (sotilmadi), D (noaniq) |
| Hajm va sifat trendi | Hammasi — turli kunlarga taqsimlang |
| Rubrika profili | A (kuchli), H (zaif) |
| Skript funneli | B (narx bosqichida uzilish), H (boshlanishida uzilish) |
| Diqqat talab qiladi | E (javobsiz), F (jahli chiqqan), G3–G4 (unutilgan), H (past ball, qoida) |
| Yo'qotilgan imkoniyatlar | B, C — mahsulot × sabab kesimi |
| Sabablar ulushi | B (`narx`), C (qolgan 5 sabab) |
| Kelishuvlar bo'limi | G |
| Jamoa reytingi | Suhbatlarni **4 ta xodimga** taqsimlang |
| Bo'limlar taqqoslovi | Xodimlarni 2 ta bo'limga bo'ling |

## Yana ikkita maslahat

1. **Sanalarni yoying.** Hammasi bir kunda bo'lsa, trend grafigi bitta ustun
   bo'lib qoladi. 2–3 hafta bo'ylab taqsimlang.
2. **Reyting uchun kamida 5 tadan.** Xodim reytingda o'rin olishi uchun unda
   kamida **5 ta baholangan suhbat** bo'lishi kerak — aks holda u «o'rin
   olmagan» bo'limida qoladi. 40 ta suhbatni 4 xodimga bo'lsangiz, har biriga
   10 tadan tushadi — bu yetarli.
