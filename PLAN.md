# Messenger Analytics — Frontend Plan

> Backend: `https://monitoring.jakhongir.dev/api/v1` (docs: `docs/01`–`docs/07`).
> Read-only toward customers: composer / reply / mark-as-read UI is **never** built.

---

## 1. Technology choices

| Layer | Choice | Reason |
|---|---|---|
| Build | **Vite 7** + React 19 + TypeScript (strict) | Fastest dev server and build; no SSR needed (JWT-only SPA, no SEO) |
| Styling | **Tailwind CSS v4** (CSS-first `@theme`) | Token-driven, no runtime CSS, fastest |
| Routing | **React Router v7** (`createBrowserRouter`, lazy routes) | Route-level code splitting, data-router guards |
| Server state | **TanStack Query v5** | Matches the backend's 120 s cache semantics; polling/refetch/invalidate built in |
| Client state | **Zustand** (auth/session only) | Everything else lives in Query — the global store never bloats |
| Forms | **react-hook-form + zod** | Field-level errors map directly to `errors[].attr` |
| UI primitives | **Radix UI** + `cva` + `tailwind-merge` | Accessible (focus trap, keyboard nav) — with our own layer on top |
| Charts | **Recharts 3** | Composable React API; enough for the smooth line/donut/radar/funnel of the reference design |
| Icons | **lucide-react** | Uniform stroke (1.5px), SVG — no emoji |
| Dates | **date-fns** (+ our own `parseApiDate`) | Backend sends `YYYY-MM-DD HH:MM:SS`, not ISO — defensive parsing is required |
| i18n | **Our own layer** (`shared/i18n`) | uz / ru / en; typed keys + `Intl.PluralRules` — no library, ~1 kB |
| Tests | **Vitest + Testing Library** | For core lib (api client, formatters, selectors) |
| Lint | ESLint 9 flat + Prettier + `eslint-plugin-boundaries` | Enforces the architecture layers |

---

## 2. Architecture — Feature-Sliced Design

```
src/
├─ app/                    # composition root
│  ├─ providers/           # QueryClient, Router, Theme, Toast, ErrorBoundary
│  ├─ router/              # route tree, guards (auth, role, cabinet)
│  └─ layouts/             # AppShell, AuthLayout, SettingsLayout
│
├─ pages/                  # route-level composition (assembles widgets ONLY)
│
├─ widgets/                # page sections (KpiRow, ScoreTrendCard, SignalQueue…)
│
├─ features/              # user actions (assign, override, merge, export…)
│
├─ entities/              # domain models + label maps + small display components
│  ├─ conversation/ employee/ customer/ product/ reason/ signal/ agreement/ …
│  └─ <entity>/{model,api,ui}
│
└─ shared/                # cross-cutting, no domain coupling
   ├─ api/                # http client, ApiError, token store, refresh queue
   ├─ ui/                 # design system primitives (Button, Card, Badge, Table…)
   ├─ lib/                # cn, date, format, number, url
   ├─ config/ hooks/ types/
```

**Import rule (enforced by ESLint):**
`app → pages → widgets → features → entities → shared`. Reverse imports are forbidden.

**File size rule:** a component is ≤ 150 lines; beyond that it gets split. Every independent section is its own component.

---

## 3. Design system (from the reference images)

The visual language taken from the images (styling only, not content):

- **Background:** soft neutral (`#F1F3F8`), cards pure white, large radius (16–20px)
- **Shadows:** very soft, multi-layered (`0 1px 2px`, `0 8px 24px -12px`) — no heavy shadows
- **Chip/badge:** `rounded-full`, tinted background (green/orange/blue), small text
- **Icon button:** square, `rounded-xl`, white background, thin border; **active = filled indigo**
- **Sidebar:** vertical rounded-square items, active state in solid brand colour
- **Charts:** thin smooth lines, low-contrast grid, the remainder of a donut hatched
- **Progress:** `rounded-full`, coloured fill + diagonally hatched remainder
- **Typography:** Inter (400/500/600/700), tabular-nums for numbers

### Tokens (`shared/ui/styles/theme.css`)

| Role | Value |
|---|---|
| brand / primary | `#4F46E5` (indigo-600) → gradient `#4F46E5 → #06B6D4` (logo) |
| accent (cyan) | `#06B6D4` |
| success | `#16A34A` · warning `#F59E0B` · danger `#DC2626` · info `#2563EB` |
| background | `#F1F3F8` · surface `#FFFFFF` · surface-muted `#F8FAFC` |
| foreground | `#0F172A` · muted-foreground `#64748B` · border `#E7EAF3` |
| radius | `sm 8` · `md 12` · `lg 16` · `xl 20` · `full` |
| spacing | 4pt scale (4/8/12/16/24/32/48) |

### Chart palette (WCAG 3:1, colour-blind safe)
`#4F46E5` `#06B6D4` `#16A34A` `#F59E0B` `#EC4899` `#8B5CF6` — series are distinguished by colour *and* line style.

### Logo
A bar chart inside a chat bubble — SVG icon; the "Messenger Analytics" wordmark in Inter Bold with an indigo→cyan gradient. Icon and wordmark side by side (combined variant).

---

## 4. Hard rules imposed by the backend (encoded once)

1. **No trailing slash** — the HTTP client never appends `/` to a path.
2. **`company_id` is never sent.**
3. Errors are matched by `code` (`byCode` / `byField` maps).
4. Response dates are `YYYY-MM-DD HH:MM:SS` (UTC) — via `parseApiDate()`.
5. **`null !== 0`** — render `—`, break the chart line.
6. Tokens: access 5 days, refresh 7 days, no rotation → reactive refresh with a single in-flight promise.
7. Role gating: `owner|admin|manager` = write; `viewer` = read-only; **employee-linked user = cabinet** (anything other than `/dashboard/me` is 403).
8. Dashboard cache is 120 s → after an override show an "updating…" state, no retry spam.
9. Audio and exports: `fetch → blob` with JWT (a bare `<audio src>` / `<a download>` will not work).
10. Deltas: `*_percent` = `%`, `*_points` = points; a negative `first_response_percent` is **good**.

---

## 5. Page map

| Route | Page | Main endpoints |
|---|---|---|
| `/login` | Sign in | `auth/token` |
| `/` | Dashboard | `overview`, `timeseries`, `criteria`, `funnel`, `signals`, `insights` |
| `/conversations` | Conversation list | `chats/conversations` (+ 15 filters) |
| `/conversations/:id` | Conversation detail | `+/messages`, `/assign`, `/override` |
| `/customers` | Customers | `chats/customers`, `/merge` |
| `/team` | Team + departments | `dashboard/employees`, `/departments` |
| `/team/:id` | Employee card | `dashboard/employees/{id}` |
| `/products` | Products & feedback | `dashboard/products`, `/reasons` |
| `/agreements` | Agreements | `dashboard/agreements` |
| `/reports` | Exports | `dashboard/exports` |
| `/me` | Employee cabinet | `dashboard/me` |
| `/settings/company` | Company settings | `companies/me` |
| `/settings/employees` | Employee CRUD | `companies/employees` |
| `/settings/catalog` | Products / Reasons / Rules | `catalog/*` |
| `/settings/integrations` | Telegram / Instagram / Web | `integrations/*` |

---

## 6. Stages (each one is a separate "next")

| # | Stage | Contents |
|---|---|---|
| ~~1~~ | ~~Foundation~~ ✅ | Scaffolding, tooling, design tokens, UI kit, AppShell + sidebar, auth (login/refresh/bootstrap), routing + guards, error handling layer, logo |
| ~~2~~ | ~~Dashboard~~ ✅ | KPI row, outcome donut, trend chart, rubric radar, script funnel, period filter (in the URL) |
| ~~2.5~~ | ~~Internationalisation~~ ✅ | uz / ru / en; typed dictionaries, `Intl.PluralRules`, language-bound number and date formats, language switcher |
| ~~3~~ | ~~Conversations~~ ✅ | List + 15 filters (in the URL), detail (transcript + analysis panel), override/assign, audio player, correction history |
| ~~4~~ | ~~Team~~ ✅ | Ranking table (re-sortable by criterion), departments, employee card, `/me` cabinet |
| ~~5~~ | ~~Products & reasons~~ ✅ | Lost opportunities (with drill-down), reason shares, emerging feedback, agreements section |
| ~~6~~ | ~~Signals & AI~~ ✅ | Attention queue (7 signals, resolve), widget insights, ask chat (400-day clamp + 90 s timeout) |
| ~~7~~ | ~~Settings~~ ✅ | Company, employee CRUD + shift editor, catalog (product/reason/rulebook upload + polling) |
| ~~8~~ | ~~Integrations~~ ✅ | Telegram QR/SMS login (with 2FA), Instagram OAuth, widget key, backfill tiers |
| ~~9~~ | ~~Customers & reports~~ ✅ | Customer catalog + merge, export lifecycle (poll + blob download) |
| ~~10~~ | ~~Polish~~ ✅ | Dark mode (token swap), lazy-loaded dictionaries (−28 kB gz), page titles, keyboard navigation, contrast audit |

---

## 7. Quality criteria

- No duplicate code: every recurring pattern (`StatCard`, `DeltaBadge`, `EmptyState`, `DataTable`, `PeriodFilter`, `AsyncBoundary`) lives in exactly one place.
- Every page in `pages/` is composition only; logic lives in `widgets/` and `features/`.
- Every API module lives in `entities/*/api`; components never call `fetch` — only hooks.
- All enum → label conversion is centralised in `entities/*/model/labels.ts`.
