# Messenger Analytics — Frontend

Telegram, Instagram va veb-chatdagi savdo suhbatlarini AI bilan tahlil qiluvchi
platformaning boshqaruv paneli (SPA).

> **Muhim:** platforma mijozga nisbatan **faqat o‘qiydi**. Javob yozish, reaksiya,
> "o‘qildi" belgisi yoki xabar yuborish UI’si hech qachon qurilmaydi — backend’da
> bunday endpoint yo‘q va bo‘lmaydi.

## Ishga tushirish

```bash
pnpm install
cp .env.example .env.local     # kerak bo'lsa API manzilini o'zgartiring
pnpm dev                       # http://localhost:5173
```

| Buyruq | Vazifasi |
|---|---|
| `pnpm dev` | Dev server |
| `pnpm build` | Typecheck + production build |
| `pnpm preview` | Build natijasini ko‘rish |
| `pnpm typecheck` | Faqat TypeScript tekshiruvi |
| `pnpm lint` | oxlint |
| `pnpm format` | Prettier |
| `pnpm test` | Vitest |

## Stack

Vite 8 · React 19 · TypeScript · Tailwind CSS v4 · TanStack Query v5 ·
React Router v7 · Radix UI · Recharts · Zustand · react-hook-form + zod

## Arxitektura

Feature-Sliced Design. Import yo‘nalishi bir tomonlama:

```
app → pages → widgets → features → entities → shared
```

| Qatlam | Nima yashaydi |
|---|---|
| `app/` | Providerlar, router, guardlar, layout qobig‘i |
| `pages/` | Route darajasidagi kompozitsiya (faqat widget yig‘adi) |
| `widgets/` | Sahifa bo‘limlari |
| `features/` | Foydalanuvchi harakatlari (override, assign, merge, export…) |
| `entities/` | Domen modellari, API modullari, label map’lar |
| `shared/` | HTTP client, UI kit, lib, hook’lar — domenga bog‘liq emas |

To‘liq reja va bosqichlar: [`PLAN.md`](./PLAN.md).
Backend API hujjatlari: [`docs/`](./docs/).

## Ko’p tillilik

Uch til: **o’zbekcha** (manba), **ruscha**, **inglizcha**. Kutubxonasiz, o’z
qatlamimiz — `src/shared/i18n/`.

```tsx
const { t } = useTranslation()
t(‘kpi.conversations’)
t(‘coverage.partial’, { percent: ‘89,3%’, pending: ‘137’ })
```

- Kalitlar `locales/uz.ts` da belgilanadi; `ru.ts` va `en.ts` shu tipga
  moslashtiriladi — **unutilgan kalit kompilyatsiya xatosi** bo’ladi.
- Ko’plik shakllari `Intl.PluralRules` orqali — ruschadagi `one / few / many`
  to’g’ri ishlaydi (`count === 1` tekshiruvi bu yerda yetarli emas).
- Raqam va sana formatlari faol tilga bog’lanadi (`shared/lib/locale-runtime.ts`):
  `1 284` (uz/ru) va `1,284` (en).
- Til `localStorage` da saqlanadi, birinchi marta brauzer tilidan aniqlanadi.
- Til almashganda daraxt `key` orqali qayta yig’iladi — format qoldiqlari
  ekranda qolib ketmasligi uchun.

> Hozircha uchala lug’at ham entry chunk’ga kiradi (~11 kB gz). Kalitlar soni
> sezilarli o’sib, bu 40 kB gz dan oshsa — `import.meta.glob` bilan tilga qarab
> lazy yuklashga o’tiladi.

## Backend bilan ishlashning qat’iy qoidalari

Bular bir marta `shared/` da kodlangan va qayta yozilmasligi kerak:

1. **Path oxirida `/` bo‘lmaydi** — `APPEND_SLASH = False`, redirect yo‘q.
2. **`company_id` hech qachon yuborilmaydi** — tenancy server tomonda.
3. Xatolar **`code`** bo‘yicha tekshiriladi (`ApiError.byCode` / `byField`).
4. Javob sanalari `YYYY-MM-DD HH:MM:SS` (UTC) — faqat `parseApiDate()` orqali.
5. **`null` ≠ `0`** — `—` ko‘rsatiladi, chart chizig‘i uziladi.
6. Dashboard 120 s serverda keshlanadi — tuzatishdan keyin darhol refetch qilinmaydi.
7. Audio va Excel yuklab olish JWT talab qiladi → `fetch` → `blob`.
