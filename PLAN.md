# Messenger Analytics — Frontend Plan

> Backend: `https://monitoring.jakhongir.dev/api/v1` (docs: `docs/01`–`docs/07`).
> Read-only toward customers: **hech qachon** composer / reply / mark-as-read UI qurilmaydi.

---

## 1. Texnologiya tanlovi

| Qatlam | Tanlov | Sabab |
|---|---|---|
| Build | **Vite 7** + React 19 + TypeScript (strict) | Eng tez dev-server va build; SSR kerak emas (JWT-only SPA, SEO yo'q) |
| Styling | **Tailwind CSS v4** (CSS-first `@theme`) | Token-driven, runtime CSS yo'q, eng tez |
| Routing | **React Router v7** (`createBrowserRouter`, lazy routes) | Route-level code splitting, data-router guards |
| Server state | **TanStack Query v5** | Backend 120s cache semantikasi bilan mos, polling/refetch/invalidate built-in |
| Client state | **Zustand** (faqat auth/session) | Boshqa hamma narsa Query'da — global store shishmaydi |
| Formalar | **react-hook-form + zod** | Field-level xatolar `errors[].attr` bilan to'g'ridan-to'g'ri bog'lanadi |
| UI primitivlar | **Radix UI** + `cva` + `tailwind-merge` | Accessible (focus trap, keyboard nav) — o'zimiz yozgan qatlam bilan |
| Charts | **Recharts 3** | Composable React API, referens dizayndagi silliq line/donut/radar/funnel uchun yetarli |
| Ikonkalar | **lucide-react** | Bir xil stroke (1.5px), SVG — emoji ishlatilmaydi |
| Sanalar | **date-fns** (+ o'z `parseApiDate`) | Backend `YYYY-MM-DD HH:MM:SS` — ISO emas, defensive parsing shart |
| Ko'p tillilik | **O'z qatlamimiz** (`shared/i18n`) | uz / ru / en; tipli kalitlar + `Intl.PluralRules` — kutubxonasiz, ~1 kB |
| Testlar | **Vitest + Testing Library** | Core lib (api client, formatters, selektorlar) uchun |
| Lint | ESLint 9 flat + Prettier + `eslint-plugin-boundaries` | Arxitektura qatlamlarini majburlash |

---

## 2. Arxitektura — Feature-Sliced Design

```
src/
├─ app/                    # kompozitsiya ildizi
│  ├─ providers/           # QueryClient, Router, Theme, Toast, ErrorBoundary
│  ├─ router/              # route daraxti, guardlar (auth, role, cabinet)
│  └─ layouts/             # AppShell, AuthLayout, SettingsLayout
│
├─ pages/                  # route darajasidagi kompozitsiya (FAQAT widget'larni yig'adi)
│
├─ widgets/                # sahifa bo'limlari (KpiRow, ScoreTrendCard, SignalQueue…)
│
├─ features/              # foydalanuvchi harakatlari (assign, override, merge, export…)
│
├─ entities/              # domen modellari + label map + kichik display komponentlar
│  ├─ conversation/ employee/ customer/ product/ reason/ signal/ agreement/ …
│  └─ <entity>/{model,api,ui}
│
└─ shared/                # cross-cutting, domenga bog'liq emas
   ├─ api/                # http client, ApiError, token store, refresh queue
   ├─ ui/                 # dizayn tizimi primitivlari (Button, Card, Badge, Table…)
   ├─ lib/                # cn, date, format, number, url
   ├─ config/ hooks/ types/
```

**Import qoidasi (ESLint bilan majburlanadi):**
`app → pages → widgets → features → entities → shared`. Teskari import taqiqlanadi.

**Fayl hajmi qoidasi:** komponent ≤ 150 qator; oshsa — bo'linadi. Har bir mustaqil section = alohida komponent.

---

## 3. Dizayn tizimi (referens rasmlardan)

Rasmlardan olingan vizual til (kontent emas, faqat stilistika):

- **Fon:** yumshoq neytral (`#F1F3F8`), kartalar sof oq, katta radius (16–20px)
- **Soyalar:** juda yumshoq, ko'p qatlamli (`0 1px 2px`, `0 8px 24px -12px`) — og'ir soya yo'q
- **Chip/badge:** `rounded-full`, tint fon (yashil/orange/ko'k), kichik matn
- **Icon-button:** kvadrat, `rounded-xl`, oq fon, ingichka border; **active = to'ldirilgan indigo**
- **Sidebar:** vertikal rounded-square itemlar, active holat solid brand rang
- **Grafiklar:** ingichka silliq chiziqlar, past-kontrast grid, donut'da qolgan qismi shtrixlangan
- **Progress:** `rounded-full`, rangli fill + diagonal shtrixli qoldiq
- **Typography:** Inter (400/500/600/700), tabular-nums raqamlar uchun

### Token'lar (`shared/ui/styles/theme.css`)

| Rol | Qiymat |
|---|---|
| brand / primary | `#4F46E5` (indigo-600) → gradient `#4F46E5 → #06B6D4` (logo) |
| accent (cyan) | `#06B6D4` |
| success | `#16A34A` · warning `#F59E0B` · danger `#DC2626` · info `#2563EB` |
| background | `#F1F3F8` · surface `#FFFFFF` · surface-muted `#F8FAFC` |
| foreground | `#0F172A` · muted-foreground `#64748B` · border `#E7EAF3` |
| radius | `sm 8` · `md 12` · `lg 16` · `xl 20` · `full` |
| spacing | 4pt shkala (4/8/12/16/24/32/48) |

### Chart palitrasi (WCAG 3:1, rang-ko'r xavfsiz)
`#4F46E5` `#06B6D4` `#16A34A` `#F59E0B` `#EC4899` `#8B5CF6` — seriyalar rang + chiziq uslubi bilan farqlanadi.

### Logo
Chat pufakchasi ichida bar-chart — SVG icon; wordmark "Messenger Analytics" Inter Bold, indigo→cyan gradient. Icon + wordmark yonma-yon (kombinatsiyalangan variant).

---

## 4. Backend'dan kelib chiqadigan qat'iy qoidalar (bir marta kodlanadi)

1. **Trailing slash yo'q** — HTTP client path'ga hech qachon `/` qo'shmaydi.
2. **`company_id` hech qachon yuborilmaydi.**
3. Xatolar `code` bo'yicha match qilinadi (`byCode` / `byField` map).
4. Response sanalari `YYYY-MM-DD HH:MM:SS` (UTC) — `parseApiDate()` orqali.
5. **`null !== 0`** — `—` ko'rsatiladi, chart chizig'i uziladi.
6. Token: access 5 kun, refresh 7 kun, rotation yo'q → reaktiv refresh, bitta in-flight promise.
7. Role gating: `owner|admin|manager` = yozish; `viewer` = read-only; **employee-linked user = kabinet** (`/dashboard/me` dan boshqasi 403).
8. Dashboard 120s cache → override'dan keyin "yangilanmoqda…" holati, spam retry yo'q.
9. Audio va export: JWT bilan `fetch → blob` (bare `<audio src>` / `<a download>` ishlamaydi).
10. Deltalar: `*_percent` = `%`, `*_points` = ball; `first_response_percent` manfiy = **yaxshi**.

---

## 5. Sahifalar xaritasi

| Route | Sahifa | Asosiy endpointlar |
|---|---|---|
| `/login` | Kirish | `auth/token` |
| `/` | Dashboard | `overview`, `timeseries`, `criteria`, `funnel`, `signals`, `insights` |
| `/conversations` | Suhbatlar ro'yxati | `chats/conversations` (+ 15 filtr) |
| `/conversations/:id` | Suhbat detali | `+/messages`, `/assign`, `/override` |
| `/customers` | Mijozlar | `chats/customers`, `/merge` |
| `/team` | Jamoa + bo'limlar | `dashboard/employees`, `/departments` |
| `/team/:id` | Xodim kartasi | `dashboard/employees/{id}` |
| `/products` | Mahsulot & fikrlar | `dashboard/products`, `/reasons` |
| `/agreements` | Kelishuvlar | `dashboard/agreements` |
| `/reports` | Eksportlar | `dashboard/exports` |
| `/me` | Xodim kabineti | `dashboard/me` |
| `/settings/company` | Kompaniya sozlamalari | `companies/me` |
| `/settings/employees` | Xodimlar CRUD | `companies/employees` |
| `/settings/catalog` | Mahsulot / Sabab / Qoidalar | `catalog/*` |
| `/settings/integrations` | Telegram / Instagram / Web | `integrations/*` |

---

## 6. Bosqichlar (har biri alohida "next")

| # | Bosqich | Mazmuni |
|---|---|---|
| ~~1~~ | ~~Poydevor~~ ✅ | Scaffolding, tooling, dizayn token'lari, UI kit, AppShell + sidebar, auth (login/refresh/bootstrap), routing + guardlar, xato ishlash qatlami, logo |
| ~~2~~ | ~~Dashboard~~ ✅ | KPI qatori, natijalar donuti, trend grafigi, rubrika radar, skript funneli, davr filtri (URL'da) |
| ~~2.5~~ | ~~Ko'p tillilik~~ ✅ | uz / ru / en; tipli lug'atlar, `Intl.PluralRules`, tilga bog'liq raqam va sana formati, til tanlagich |
| ~~3~~ | ~~Suhbatlar~~ ✅ | Ro'yxat + 15 filtr (URL'da), detal (transkript + tahlil paneli), override/assign, audio pleyer, tuzatishlar tarixi |
| ~~4~~ | ~~Jamoa~~ ✅ | Reyting jadvali (mezon bo'yicha qayta saralash), bo'limlar, xodim kartasi, kabinet `/me` |
| ~~5~~ | ~~Mahsulot & sabablar~~ ✅ | Yo'qotilgan imkoniyatlar (drill-down bilan), sabab ulushlari, emerging feedback, kelishuvlar bo'limi |
| ~~6~~ | ~~Signallar & AI~~ ✅ | Diqqat navbati (7 signal, resolve), widget insights, ask chat (400 kunlik clamp + 90s timeout) |
| ~~7~~ | ~~Sozlamalar~~ ✅ | Kompaniya, xodimlar CRUD + smena tahrirlagichi, katalog (mahsulot/sabab/rulebook upload+polling) |
| ~~8~~ | ~~Integratsiyalar~~ ✅ | Telegram QR/SMS login (2FA bilan), Instagram OAuth, vidjet kaliti, backfill tierlari |
| ~~9~~ | ~~Mijozlar & hisobotlar~~ ✅ | Mijozlar katalogi + birlashtirish, eksport lifecycle (poll + blob download) |
| ~~10~~ | ~~Sayqal~~ ✅ | Dark mode (token almashuvi), lug'atlarni lazy yuklash (−28 kB gz), sahifa sarlavhalari, klaviatura navigatsiyasi, kontrast auditi |

---

## 7. Sifat mezonlari

- Duplicate kod yo'q: har bir takrorlanuvchi pattern (`StatCard`, `DeltaBadge`, `EmptyState`, `DataTable`, `PeriodFilter`, `AsyncBoundary`) — bitta joyda.
- Har bir sahifa `pages/` da faqat kompozitsiya; logika `widgets/` va `features/` da.
- Har bir API modul `entities/*/api` da; komponentlar `fetch` chaqirmaydi — faqat hook.
- Barcha enum → label konvertatsiyasi `entities/*/model/labels.ts` da markazlashgan.
</content>
</invoke>
