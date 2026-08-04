# Integration guide

**Docs 01–07 are the reference — this is the manual.** They tell you what each endpoint
returns; this tells you how to wire a frontend to them: the auth loop, the rules that
bite, the code, and which endpoint feeds which chart.

Read this once end to end before writing the first request. Then keep
[01-conventions](./01-conventions.md) open and use this page only when you're stuck.

**Base URL: `https://monitoring.jakhongir.dev/api/v1`**

---

## Contents

1. [What you are building against](#1-what-you-are-building-against)
2. [Authentication — the whole loop](#2-authentication--the-whole-loop)
3. [Tenancy: the one thing you must not do](#3-tenancy-the-one-thing-you-must-not-do)
4. [The five rules that will cost you a day each](#4-the-five-rules-that-will-cost-you-a-day-each)
5. [Errors — one envelope, stable codes](#5-errors--one-envelope-stable-codes)
6. [Lists: pagination, filters, search, ordering](#6-lists-pagination-filters-search-ordering)
7. [Roles — what to render for whom](#7-roles--what-to-render-for-whom)
8. [Building the dashboard screens](#8-building-the-dashboard-screens)
9. [Write paths: correcting the AI](#9-write-paths-correcting-the-ai)
10. [Async exports](#10-async-exports)
11. [Onboarding users without the Django admin](#11-onboarding-users-without-the-django-admin)
12. [Local development](#12-local-development)
13. [Pre-launch checklist](#13-pre-launch-checklist)

---

## 1. What you are building against

Kotib Monitoring **observes** sales conversations across Telegram, Instagram and web
chat, scores them with Gemini, and aggregates the results.

It is **read-only toward customers.** No endpoint sends a message, reaction, read
receipt or typing indicator into a customer conversation, and none is planned. Do not
design a reply box, a composer, or a "mark as read" control — the endpoints to back them
do not exist.

Three consumers share the surface, with **three different auth schemes**:

| Consumer | Auth | Docs |
|---|---|---|
| **The dashboard SPA** — what this guide is about | JWT `Authorization: Bearer` | 02–06 |
| The site chat widget | `X-Kotib-Widget-Key` header, no DRF auth | [WIDGET.md](../WIDGET.md), 07 |
| The Chrome extension | JWT, same as the SPA, but logs in as an employee | 07 |

### The data model in one paragraph

A **Conversation** is a segment of one customer chat, cut by an idle gap
(`Company.idle_gap_hours`, default 8h). When it closes, Gemini scores it and writes an
**AnalysisResult** — score, outcome (`sotildi` / `sotilmadi` / `noaniq`), why it was
lost, sentiment, funnel, promises. Results are **append-only**: a re-score adds a row,
and every aggregate reads the newest row per conversation. A manager who disagrees files
a **ManagerOverride**, and *that* wins in every number you see. So: an open conversation
has no score, and the score you display is "latest AI result, unless a human corrected
it."

---

## 2. Authentication — the whole loop

### The two calls

```http
POST /api/v1/auth/token
Content-Type: application/json

{"username": "aziza.k", "password": "…"}
```

**`username`, never email.** People sign in with the username a manager issued them.

```jsonc
// 200
{"access": "eyJ…", "refresh": "eyJ…"}
```

```http
POST /api/v1/auth/token/refresh
{"refresh": "eyJ…"}
→ 200 {"access": "eyJ…"}      // a NEW access token; the refresh token is unchanged
```

| Token | Lifetime | Use |
|---|---|---|
| `access` | **5 days** | Every request: `Authorization: Bearer <access>` |
| `refresh` | **7 days** | Only `POST /auth/token/refresh` |

### Read the claims, don't trust them

The access token carries `company_id` and `role`, stamped at login so you can render the
right shell without an extra round trip:

```ts
// Decode for DISPLAY ONLY. Never for an authorization decision.
type Claims = { user_id: string; company_id: string | null; role: Role; exp: number };

function readClaims(token: string): Claims {
  const [, payload] = token.split(".");
  return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
}
```

> **The claims are decorative.** Every permission check on the backend reads the user's
> company and role **from the database**, not from your token. A populated `company_id`
> claim proves nothing — if the user row lost its company, you still get
> `403 permission_denied` with *"User is not attached to a company."* Treat the claims as
> a hint for the first paint, and let the server be the authority.

### A client that handles refresh properly

The part everyone gets wrong is **concurrent 401s**: a dashboard fires eight requests at
once, the token expires, and eight refresh calls race. Single-flight it.

```ts
// api/client.ts
const BASE = "https://monitoring.jakhongir.dev/api/v1";

let access: string | null = localStorage.getItem("access");
let refresh: string | null = localStorage.getItem("refresh");
let refreshing: Promise<string> | null = null;   // the single-flight latch

function setTokens(a: string, r?: string) {
  access = a; localStorage.setItem("access", a);
  if (r) { refresh = r; localStorage.setItem("refresh", r); }
}

export function logout() {
  access = refresh = null;
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  location.assign("/login");
}

export async function login(username: string, password: string) {
  const res = await fetch(`${BASE}/auth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw await ApiError.from(res);
  const { access: a, refresh: r } = await res.json();
  setTokens(a, r);
}

async function renew(): Promise<string> {
  // Everyone who 401s during a refresh awaits the SAME promise.
  refreshing ??= (async () => {
    const res = await fetch(`${BASE}/auth/token/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });
    if (!res.ok) { logout(); throw new Error("session expired"); }
    const { access: a } = await res.json();
    setTokens(a);
    return a;
  })().finally(() => { refreshing = null; });
  return refreshing;
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const call = (token: string | null) =>
    fetch(`${BASE}${path}`, {
      ...init,
      headers: {
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
      // No cookies. See the warning below — an /admin session cookie would
      // outrank this header on the same domain.
      credentials: "omit",
    });

  let res = await call(access);
  if (res.status === 401) res = await call(await renew());   // one retry, never a loop
  if (!res.ok) throw await ApiError.from(res);
  return res.status === 204 ? (undefined as T) : res.json();
}
```

> **Do not send cookies.** If the browser holds a Django `/admin` session cookie for the
> same domain and you send it, DRF may authenticate that session **instead of** your
> token, and the API answers for the wrong user. `credentials: "omit"` removes the
> question entirely. (Fixed server-side so the Bearer header now wins, but omitting
> cookies is still correct — you are not a browser session.)

### Where to keep tokens

`localStorage` (above) is the pragmatic choice and what most SPAs do; it is readable by
any XSS on your origin. In-memory + a silent re-login is stricter but costs a login on
every tab open. Pick one deliberately and write it down — do not put the **refresh**
token somewhere less protected than the access token; it is the longer-lived secret.

### What a password change does *not* do

Access tokens are stateless and there is no blacklist. After a password reset, the old
token keeps working for its remaining lifetime — **up to 5 days**. Never label a reset
"revoke access" in your UI. Cutting access immediately means deactivating the account,
which is not yet exposed over the API.

---

## 3. Tenancy: the one thing you must not do

**Never send `company_id`. In a body, in a query param, anywhere.**

Every tenant-scoped endpoint resolves the company from the authenticated user and
filters and stamps on it server-side. Sending your own is at best ignored and at worst
a validation error.

The corollary matters for your error handling: **another tenant's row reads as `404`,
not `403`.** Existence is never leaked. So a 404 on a detail route means "gone, or never
yours" — render one "not found" state and do not try to distinguish them.

```ts
// ✅
await api("/chats/conversations?employee=" + employeeId);
// ❌ — ignored at best
await api("/chats/conversations?company=" + companyId);
```

---

## 4. The five rules that will cost you a day each

### 4.1 No trailing slashes

`/api/v1/chats/conversations/` is a **404**. `APPEND_SLASH` is off and there is no
redirect. Build paths without them and never let a helper append one.

### 4.2 Response datetimes are not ISO-8601

DRF is configured with `DATETIME_FORMAT = "%Y-%m-%d %H:%M:%S"`, so responses look like:

```json
{"closed_at": "2026-08-01 14:32:07"}
```

`new Date("2026-08-01 14:32:07")` works in Chrome and **fails in Safari**. Parse
deliberately, and treat the value as **UTC** — the server formats in UTC:

```ts
export function parseApiDate(v: string | null): Date | null {
  if (!v) return null;
  const [d, t] = v.split(" ");
  return new Date(`${d}T${t}Z`);          // explicit Z — the API is UTC
}
```

**Requests are the opposite:** query params and request bodies want real ISO-8601
(`2026-08-01T14:32:07Z`). Asymmetric, and it catches everyone once.

### 4.3 The window is `date_from` / `date_to` — there is no `period`

Every dashboard endpoint takes an explicit window. **There is no `?period=30d`
shorthand**, and because DRF query serializers ignore unknown params silently, sending
one does not error — you just get the default 30-day window and think your filter works.

```ts
const to = new Date();
const from = new Date(to.getTime() - days * 864e5);
const qs = new URLSearchParams({ date_from: from.toISOString(), date_to: to.toISOString() });
await api(`/dashboard/overview?${qs}`);
```

Use `URLSearchParams`, not string concatenation: a raw `+00:00` offset in a query string
decodes as a space and the field rejects it.

Defaults and limits:

- Omit both → **the last 30 days**.
- The window is measured on `Conversation.closed_at`. An open conversation is in no
  window, because it has no final score yet.
- `date_from` after `date_to` → `400 period_invalid`.
- `granularity=day|week` on `/dashboard/timeseries`, default `day`. A series may hold at
  most **400 buckets**, so `day` is fine for any window under ~13 months; past that the
  API returns **`400 period_too_long`** rather than silently truncating your chart —
  switch to `week`. (Choosing `week` earlier is a readability decision, not a
  requirement.)

### 4.4 `null` is not `0`

Across every aggregate, a missing score means **"not measured"**. Rendering it as zero
silently lies — a chart that dips to 0 reads as "the team performed terribly that day"
when in fact nothing was scored.

```tsx
{avg_score == null ? <span className="muted">—</span> : avg_score.toFixed(1)}
```

In a line chart, **break the line** across null days; do not interpolate and do not plot
zero. In a table, render an em dash.

### 4.5 Match on `code`, never on `detail`

`detail` is human text and will be reworded or translated. `code` is stable API.

---

## 5. Errors — one envelope, stable codes

Every error shares one shape:

```jsonc
{
  "type": "validation_error",            // validation_error | client_error | server_error
  "errors": [
    {
      "code": "working_hours_time_format",  // ← match on THIS
      "detail": "Entry 0: start must be 'HH:MM'.",
      "attr": "working_hours"               // offending field; null for non-field errors
    }
  ]
}
```

A typed helper that turns it into something a form can consume:

```ts
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly errors: { code: string; detail: string; attr: string | null }[],
  ) { super(errors[0]?.detail ?? `HTTP ${status}`); }

  static async from(res: Response) {
    const body = await res.json().catch(() => null);
    return new ApiError(res.status, body?.errors ?? [{ code: "unknown", detail: res.statusText, attr: null }]);
  }

  /** True if any error carries this code. */
  has(code: string) { return this.errors.some(e => e.code === code); }

  /** { fieldName: "message" } — drop straight into your form library. */
  get fieldErrors(): Record<string, string> {
    return Object.fromEntries(
      this.errors.filter(e => e.attr).map(e => [e.attr!, e.detail]),
    );
  }

  /** Errors with no field — render these at the top of the form. */
  get formErrors() { return this.errors.filter(e => !e.attr).map(e => e.detail); }
}
```

Using it:

```ts
try {
  await api("/companies/users/invite", { method: "POST", body: JSON.stringify(form) });
} catch (e) {
  if (!(e instanceof ApiError)) throw e;
  if (e.has("username_taken"))       setError("username", "Bu username band");
  else if (e.has("role_not_grantable")) setError("role", "Sizning rolingiz buni bera olmaydi");
  else setFieldErrors(e.fieldErrors);
}
```

### The statuses you will actually see

| Status | Means | Do |
|---|---|---|
| 400 | Validation. Read `code` + `attr`. | Show it on the field |
| 401 | Token missing / expired / wrong type (`token_not_valid`) | Refresh once, then log out |
| 403 | Authenticated but not allowed (`permission_denied`) | Hide the control; don't retry |
| 404 | Missing **or another tenant's** | One "not found" state |
| 500 | Server | Generic message + retry; do not parse |

A `401` with `code: "token_not_valid"` and `token_class: "AccessToken"` in the messages
means you sent the **refresh** token as a Bearer. Easy mistake; the two look identical.

---

## 6. Lists: pagination, filters, search, ordering

Every list endpoint is `LimitOffsetPagination`, page size **100**:

```jsonc
{
  "count": 137,
  "next": "https://…/chats/conversations?limit=20&offset=20",
  "previous": null,
  "results": [ … ]
}
```

```ts
export type Page<T> = { count: number; next: string | null; previous: string | null; results: T[] };

export const list = <T>(path: string, params: Record<string, string | number | boolean | undefined>) => {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== "")
      .map(([k, v]) => [k, String(v)]),
  );
  return api<Page<T>>(`${path}?${qs}`);
};
```

> `next` and `previous` are **absolute URLs**. Either fetch them verbatim (they already
> carry every filter) or ignore them and drive `limit`/`offset` yourself. Do not
> concatenate them onto your base URL.

### Conversations — the filters worth knowing

`GET /api/v1/chats/conversations` is the workhorse. Every dashboard widget should link
into it with the matching filter, so a manager can go from a number to the conversations
behind it.

| Param | Type | Notes |
|---|---|---|
| `employee`, `account` | uuid | |
| `unassigned` | bool | `true` = the queue to triage |
| `outcome` | `sotildi`\|`sotilmadi`\|`noaniq` | The **effective** outcome — overrides included |
| `sentiment` | enum | |
| `score_min`, `score_max` | number | `score_max=49` is the low-score band |
| `needs_review` | bool | Flash and Pro disagreed |
| `has_violations` | bool | |
| `product`, `reason` | uuid | Matches the **effective** reason, so a drill-down agrees with the widget it came from |
| `closed_from`, `closed_to` | ISO datetime | |
| `attribution_source`, `is_legacy` | enum / bool | |
| `search` | string | Customer display name or username |
| `ordering` | string | `started_at`, `last_message_at`, `closed_at`, `analysis_score`; prefix `-` for desc |

```ts
// "25 conversations scored 0–49" → the list behind that number
list<Conversation>("/chats/conversations", {
  score_max: 49, closed_from: from.toISOString(), closed_to: to.toISOString(),
  ordering: "analysis_score", limit: 20,
});
```

---

## 7. Roles — what to render for whom

Four roles, plus one cross-cutting distinction that catches people out.

| Role | Company dashboards | Writes (override, assign, catalog, roster) |
|---|---|---|
| `owner`, `admin`, `manager` | ✅ | ✅ |
| `viewer` **not** linked to an employee | ✅ read-only | ❌ 403 |
| any user **linked to an Employee** | ❌ — only `/dashboard/me` | ❌ 403 |

**The employee link, not the role, decides cabinet mode.** A user attached to an
`Employee` record is a salesperson: they see their own numbers at
`GET /api/v1/dashboard/me` and get `403` on every company-wide dashboard. That link is
also what the Chrome extension requires.

**There is no `employee` field on `/companies/users/me`** — that endpoint returns only
`id`, `username`, `email`, `first_name`, `last_name`, `role`, `company`. The link is
discovered by *asking for the cabinet*: `/dashboard/me` answers with the profile when the
user is linked, and `400 no_employee_profile` when they are not.

```ts
const isManager = ["owner", "admin", "manager"].includes(claims.role);

/** Cabinet mode is decided by the employee link, which only /dashboard/me can tell you. */
async function resolveCabinet(): Promise<EmployeeProfile | null> {
  try {
    return await api<EmployeeProfile>("/dashboard/me");
  } catch (e) {
    if (e instanceof ApiError && e.has("no_employee_profile")) return null;
    throw e;                                   // a real failure, not "not an employee"
  }
}
```

Resolve this once at app start, alongside `/companies/users/me`, and route on the result.

Gate the UI so a user never sees a control that will 403 — but **treat that as cosmetic
only**. The server enforces it; your job is to avoid a dead-end click.

---

## 8. Building the dashboard screens

All 17 endpoints live under `/api/v1/dashboard/`. Full field-by-field reference in
[05-dashboard](./05-dashboard.md) and [06-dashboard-insights](./06-dashboard-insights.md).

### Endpoint → what to draw

| Endpoint | Shape | Render as |
|---|---|---|
| `overview` | KPIs + `previous` + `deltas` | A row of **stat tiles**; the average score is the hero number |
| `timeseries` | `series[]` per day/week | **Two** charts — volume and score. See the warning below |
| `criteria` | 7 rubric criteria + strengths/weaknesses | Horizontal bars, one colour |
| `funnel` | stages with success / drop-off / neutral / not-reached | Bars of `success_percent`; the shortfall is where the script breaks |
| `reasons` | `share` per reason + `emerging_feedback` | Horizontal bars, sorted by share |
| `products` | `lost_value` + reasons per product | Horizontal bars — the money left on the table |
| `employees` | league table, `is_ranked` | Bars + a table |
| `departments` | per-department rollup | Bars |
| `agreements` | taken / fulfilled / forgotten + `daily` | Stat tiles + a trend |
| `signals` | 7 attention queues with `items[]` | Count tiles linking into the conversation list |
| `me` | the employee cabinet | The same widgets, one person |
| `insights`, `ask` | narrative text | Prose panels |
| `exports` | async file jobs | See §10 |

> **Never plot volume and score on one chart with two y-axes.** Their scales are
> unrelated (0–40 conversations vs 0–100 points), so any alignment you pick invents a
> correlation that is not in the data. Two charts stacked, or two cards side by side.

### The averaging rule — so your labels are honest

Every average is a **mean over conversations**, not over messages or over days. Label it
"o'rtacha ball" / "average score per conversation" and never re-average the daily
averages client-side to produce a period figure — that weights a quiet day the same as a
busy one and will disagree with `overview.avg_score`. If you need a period number, read
it from `overview`. The full contract is [ANALYTICS.md](../ANALYTICS.md).

### Deltas

`overview.deltas` compares against the immediately preceding window of equal length. A
delta is `null` when the previous window had nothing to compare — render "—", not "0%".
And mind the direction: for `avg_first_response_seconds` and `angry_customers`, **down
is good**.

```tsx
function Delta({ value, upIsGood = true }: { value: number | null; upIsGood?: boolean }) {
  if (value == null) return <span className="muted">—</span>;
  const good = value === 0 ? null : (value > 0) === upIsGood;
  return <span className={good == null ? "" : good ? "up" : "down"}>
    {value > 0 ? "▲ +" : value < 0 ? "▼ " : ""}{value.toFixed(1)}
  </span>;
}
```

### Polling and the server cache

Dashboard responses are cached **120 s per tenant + question**. Polling faster than that
just re-reads the same bytes. Refetch on window focus and on filter change; if you must
poll, 60–120 s is the honest floor.

While refetching, **hold the previous render at reduced opacity.** A skeleton flash on
every filter change makes a dashboard feel broken.

### The two AI endpoints — treat them differently from everything else

Sixteen of the eighteen `/dashboard/` routes read numbers a worker already computed.
**`/insights` and `/ask` call Gemini synchronously, inside your request.** That changes
how you should build against them:

- They are **slow** — seconds, not milliseconds. Never block first paint on one. Render
  the charts, then let the narrative arrive.
- They can **fail while the rest of the dashboard is fine**. Give each its own loading
  and error state; never let one failing panel blank a working page.
- `/insights` is behind the same 120 s cache; `/ask` is not, so every question is a
  fresh model call.

```http
GET /api/v1/dashboard/insights?widget=overview&date_from=…&date_to=…
→ 200 {"widget": "overview", "bullets": ["Joriy davrda 42 ta suhbatdan 5 tasi …", …]}
```

`widget` is **required** and one of `overview`, `timeseries`, `ratings`, `products`,
`reasons`, `funnel`, `agreements`. Omitting it is `400 required`. One call per widget —
there is no "all widgets" mode — so fan out in parallel, per card.

```http
POST /api/v1/dashboard/ask
{"question": "Qaysi xodim eng yaxshi ishlayapti?", "date_from": "…", "date_to": "…"}

→ 200 {"answer": "…", "used_conversations": ["<uuid>", …], "has_data": true}
```

The model is grounded strictly in that period's precomputed statistics and is instructed
to say "no data" rather than guess — so **check `has_data` before rendering `answer` as
a finding**, and use `used_conversations` to link the reader to the evidence. `question`
is capped at 500 characters.

#### Their error codes

| Status | `code` | When | What the UI should do |
|---|---|---|---|
| 503 | `ai_unavailable` | Gemini quota, an upstream 5xx, a timeout, or output the schema rejected | "Try again in a moment" + a retry button. The request was valid — resend it verbatim |
| 400 | `gemini_not_configured` | No API key on the server | Hide the AI panels entirely; retrying will never help |
| 400 | *(field errors)* | `widget` missing/unknown, `question` over 500 chars | Fix the request |

`ai_unavailable` is genuinely common when several insight panels load at once and the
quota is tight — **retry one panel at a time with backoff**, do not hammer all seven.
Treat it as transient and `gemini_not_configured` as permanent; that is the whole
difference in your handling.

```ts
async function loadInsight(widget: string, window: URLSearchParams) {
  try {
    return (await api<{ bullets: string[] }>(`/dashboard/insights?widget=${widget}&${window}`)).bullets;
  } catch (e) {
    if (e instanceof ApiError && e.has("ai_unavailable")) return "retry";   // transient
    if (e instanceof ApiError && e.has("gemini_not_configured")) return "off"; // permanent
    throw e;
  }
}
```

> **Model output is untrusted text.** Render bullets and `answer` with `textContent` /
> JSX text — never `dangerouslySetInnerHTML`. It is generated prose derived from customer
> messages, and it is not sanitized for you.

### One filter row, scoping everything

Put the date range and dimension filters in a single row **above** all the cards, and
re-render every card against the same window. Per-card filters guarantee the numbers on
screen will eventually disagree with each other.

---

## 9. Write paths: correcting the AI

Manager role required for all of these.

**Override an AI conclusion** — the human decision that wins in every aggregate
afterwards. The body is a **`field` + `value` pair**, not the field itself:

```http
POST /api/v1/chats/conversations/{id}/override
{"field": "outcome", "value": "sotildi"}
```

| `field` | `value` | Rejected with |
|---|---|---|
| `outcome` | `sotildi` \| `sotilmadi` \| `noaniq` | `invalid_outcome` |
| `score` | `0`–`100`; sent as a string, though a JSON number is coerced | `invalid_score` |
| `primary_reason` | the reason **`code`** available to your company — **not its uuid** | `invalid_reason_code` |

```ts
// ✅  the reason is its code, not the uuid you got from /catalog/reasons
await api(`/chats/conversations/${id}/override`, {
  method: "POST", body: JSON.stringify({ field: "primary_reason", value: "narx" }),
});
// ❌  { field: "primary_reason", value: "73895cf8-…" } → 400 invalid_reason_code
```

The uuid mistake is the easy one to make: every other endpoint keys a reason by `id`,
and this one keys it by `code`.

Fetch the valid reason codes from `GET /api/v1/catalog/reasons` — it returns the 8
global defaults plus your tenant's own — and drive the dropdown from `code`.

Overrides are **append-only** (an audit trail). Every subsequent aggregate reads the
`effective_outcome`, so the number a manager just corrected changes everywhere at once —
invalidate your dashboard queries after a successful override.

**Assign an employee** to an unattributed conversation:

```http
POST /api/v1/chats/conversations/{id}/assign
{"employee": "<uuid>"}
```

This sets `attribution_source = "manual"`, which **no automatic mode will ever
overwrite**. Manual is final — surface that in your confirm copy.

**Resolve a signal** — take one conversation out of an attention queue without touching
the underlying data:

```http
POST /api/v1/dashboard/signals/resolve
{"conversation": "<uuid>", "signal": "angry_customer"}
```

---

## 10. Async exports

Excel exports are generated by a worker, so this is a three-step lifecycle, not a
download link. (`kind` is `conversations` or `ratings`; there is no PDF export.)

```ts
// 1. Ask
const job = await api<ExportFile>("/dashboard/exports", {
  method: "POST",
  body: JSON.stringify({ kind: "conversations", date_from: from.toISOString(), date_to: to.toISOString() }),
});

// 2. Poll until it settles — the file does not exist yet.
//    status: "pending" | "running" | "done" | "error"   (it is "done", not "ready")
async function waitFor(id: string, signal: AbortSignal) {
  for (let i = 0; i < 60 && !signal.aborted; i++) {
    const f = await api<ExportFile>(`/dashboard/exports/${id}`);
    if (f.status === "done") return f;         // file_url is null until this moment
    if (f.status === "error") throw new Error(f.error || "export failed");
    await new Promise(r => setTimeout(r, 2000));
  }
  throw new Error("timed out");
}

// 3. Download THROUGH the API — the file is authenticated
const res = await fetch(`${BASE}/dashboard/exports/${job.id}/download`, {
  headers: { Authorization: `Bearer ${access}` },
});
const url = URL.createObjectURL(await res.blob());
Object.assign(document.createElement("a"), { href: url, download: "conversations.xlsx" }).click();
URL.revokeObjectURL(url);
```

> `file_url` is the **authenticated** download route, never a raw storage URL — and it
> is `null` until `status` is `done`. Because it needs the bearer token, you cannot put
> it in an `<a href>` or an `<img src>`: the browser will not attach the header, and you
> will get a 401 that looks like a broken link. Fetch it as a blob, as above.
> Exports also expire (`expires_at`) and are swept, so re-request rather than storing
> the URL.

---

## 11. Onboarding users without the Django admin

Everything here is manager-only, and each returns the new password **exactly once** — it
is hashed at rest and cannot be read back. Show it, let the user copy it, and never
attempt to re-fetch it.

```ts
// A login for someone who is not an employee (a manager, a stakeholder)
const invited = await api("/companies/users/invite", {
  method: "POST",
  body: JSON.stringify({ username: "aziza.k", role: "manager" }),   // omit password → generated
});
showOnce(invited.password);

// An employee AND their login, in one atomic call
const employee = await api("/companies/employees", {
  method: "POST",
  body: JSON.stringify({
    full_name: "Aziza Karimova",
    department: "Sotuv",
    account: { username: "aziza.k", role: "viewer" },
  }),
});
showOnce(employee.credentials.password);
```

Two things to design for:

- **You can only grant a role you hold.** `owner`/`admin` may grant anything; a
  `manager` may grant only `manager` and `viewer`. Filter the role dropdown by the
  current user's role, or you will render options that always 400 with
  `role_not_grantable`.
- **Usernames are unique platform-wide**, not per tenant — so `username_taken` can fire
  on a name nobody in *your* company is using. Word the error accordingly.

Password reset (`POST /companies/users/{id}/reset-password`) and self-service change
(`POST /companies/users/me/password`) are covered in the [CHANGELOG](./CHANGELOG.md).

---

## 12. Local development

```bash
docker start postgres redis
python manage.py migrate
python manage.py seed_demo          # a tenant + 40 analysed-ready conversations
python manage.py runserver
```

Log in as `demo` / `demo`. With `DEBUG=True` you also get:

- **Swagger UI** at `/` and **ReDoc** at `/redoc`
- **`GET /api/schema/`** — the OpenAPI 3 document. Generate your client from it:
  ```bash
  npx openapi-typescript http://localhost:8000/api/schema/ -o src/api/schema.d.ts
  ```
  These are registered **only** when `DEBUG=True`; they do not exist in production.

To see what a finished dashboard looks like with real analysed data:

```bash
python manage.py build_dashboard_preview     # → docs/dashboard-preview.html
```

That page is built by calling the same endpoints you will call, so it doubles as a
worked reference for which response feeds which chart.

### CORS

Currently `CORS_ALLOW_ALL_ORIGINS = True`, so any origin may call the API and you need no
allowlist entry for your dev server. Do not build on that permanently — it is a
deployment setting that should be narrowed before launch, and the day it is, your origin
has to be on the list. Nothing in your client changes either way.

---

## 13. Pre-launch checklist

- [ ] No trailing slashes anywhere in your path builder.
- [ ] `company_id` appears in **zero** requests.
- [ ] All response datetimes go through `parseApiDate` — verified in **Safari**.
- [ ] Every `null` metric renders `—`, never `0`; line charts break rather than dip.
- [ ] Date windows use `date_from`/`date_to` via `URLSearchParams`; `granularity=week`
      whenever the window is over 30 days.
- [ ] Error handling matches on `code`, never on `detail` text.
- [ ] Refresh is single-flighted; one retry per request, never a loop.
- [ ] `credentials: "omit"` on every call.
- [ ] The employee-linked user is routed to `/dashboard/me` and never sees a company
      dashboard link.
- [ ] Role dropdowns are filtered by what the current user may grant.
- [ ] Generated passwords are shown once, with copy-to-clipboard.
- [ ] Exports are downloaded as an authenticated blob, not an `<a href>`.
- [ ] No reply box, composer, or "mark as read" anywhere in the UI.

---

## Where to go next

| Document | For |
|---|---|
| [CHANGELOG](./CHANGELOG.md) | What changed since 01–07 — **read after this page** |
| [01-conventions](./01-conventions.md) | The rules above, in reference form |
| [02](./02-auth-and-accounts.md) … [07](./07-integrations.md) | Per-endpoint params, filters, samples, every error code |
| [ANALYTICS.md](../ANALYTICS.md) | The authoritative read-side contract behind every aggregate |
| [ARCHITECTURE.md](../ARCHITECTURE.md) | How the subsystems fit together; built vs pending |
| `GET /api/schema/` (dev only) | Machine-readable ground truth. When docs and schema disagree, the schema wins |
