# Messenger Analytics — Frontend

Dashboard (SPA) for a platform that uses AI to analyse sales conversations from
Telegram, Instagram and web chat.

> **Important:** the platform is **read-only** toward the customer. UI for
> replying, reacting, marking as read or sending messages is never built — the
> backend has no such endpoint and never will.

## Getting started

```bash
pnpm install
cp .env.example .env.local     # change the API URL if needed
pnpm dev                       # http://localhost:5173
```

| Command | Purpose |
|---|---|
| `pnpm dev` | Dev server |
| `pnpm build` | Typecheck + production build |
| `pnpm preview` | Preview the build output |
| `pnpm typecheck` | TypeScript check only |
| `pnpm lint` | oxlint |
| `pnpm format` | Prettier |
| `pnpm test` | Vitest |

## Stack

Vite 8 · React 19 · TypeScript · Tailwind CSS v4 · TanStack Query v5 ·
React Router v7 · Radix UI · Recharts · Zustand · react-hook-form + zod

## Architecture

Feature-Sliced Design. Imports flow in one direction only:

```
app → pages → widgets → features → entities → shared
```

| Layer | What lives there |
|---|---|
| `app/` | Providers, router, guards, layout shell |
| `pages/` | Route-level composition (assembles widgets only) |
| `widgets/` | Page sections |
| `features/` | User actions (override, assign, merge, export…) |
| `entities/` | Domain models, API modules, label maps |
| `shared/` | HTTP client, UI kit, lib, hooks — no domain coupling |

Full plan and stages: [`PLAN.md`](./PLAN.md).
Backend API docs: [`docs/frontend/`](./docs/frontend/) — the canonical copy.
Start with [`00-integration-guide`](./docs/frontend/00-integration-guide.md), then
the [`CHANGELOG`](./docs/frontend/CHANGELOG.md); the rest is reference material.

## Internationalisation

Three languages: **Uzbek** (source), **Russian**, **English**. No library — our
own layer in `src/shared/i18n/`.

```tsx
const { t } = useTranslation()
t('kpi.conversations')
t('coverage.partial', { percent: '89,3%', pending: '137' })
```

- Keys are defined in `locales/uz.ts`; `ru.ts` and `en.ts` conform to that type —
  a **missing key is a compile error**.
- Plural forms go through `Intl.PluralRules`, so Russian `one / few / many` works
  correctly (a `count === 1` check is not enough here).
- Number and date formats are bound to the active language
  (`shared/lib/locale-runtime.ts`): `1 284` (uz/ru) vs `1,284` (en).
- The language is persisted in `localStorage` and detected from the browser on
  first visit.
- Switching language remounts the tree via `key`, so no stale formatting is left
  on screen.

> `uz` ships in the entry chunk (it is the default language and needs no loading
> state), while `ru` and `en` are separate chunks loaded on demand.

## Hard rules for working with the backend

These are encoded once in `shared/` and must not be rewritten:

1. **No trailing `/` on paths** — `APPEND_SLASH = False`, no redirects.
2. **`company_id` is never sent** — tenancy is resolved server-side.
3. Errors are matched by **`code`** (`ApiError.byCode` / `byField`).
4. Response dates are `YYYY-MM-DD HH:MM:SS` (UTC) — parse only via `parseApiDate()`.
5. **`null` ≠ `0`** — render `—` and break the chart line.
6. The dashboard is cached for 120 s on the server — do not refetch immediately after a correction.
7. Audio and Excel downloads require JWT → `fetch` → `blob`.
8. Passwords are returned **once** (`invite`, `reset-password`, employee +
   `account`) — they cannot be read again and are shown through `CredentialsDialog`.
9. An **open conversation** (`closed_at === null`) is not cached: its attributes
   can change during the conversation depending on the last sender.
10. No cookies are sent (`credentials: 'omit'`) — we are a bearer-token client.
11. No skeleton when a filter changes: `keepPreviousData` + dimming
    (`StaleOverlay`). Skeletons appear only on the **first** load.
