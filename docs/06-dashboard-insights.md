# Dashboard — Signals, Insights, Ask & Exports

The numeric aggregates (overview, timeseries, criteria, employees, departments, me,
products, reasons, funnel, agreements) live in
[`05-dashboard.md`](./05-dashboard.md). This document covers the four *action-shaped*
dashboard features built on top of them:

- **Signals** — the attention queue: "which conversations need a human right now",
  plus the per-conversation "handled" flow.
- **Insights** — 2–3 AI-written one-sentence hypotheses under a widget.
- **Ask** — the in-platform AI chat over the period's statistics.
- **Exports** — asynchronous Excel report jobs (create → poll → download).

All routes are under the API root `/api/v1/` (all examples below show the full path).
Errors use the shared envelope documented in [`01-conventions.md`](./01-conventions.md);
this page lists the concrete `code` values each endpoint can emit.

## Endpoints at a glance

| Method | Path | Purpose | Role |
|---|---|---|---|
| `GET` | `/api/v1/dashboard/signals` | Attention queue: counters + previews for 7 signal types | Manager dashboards |
| `POST` | `/api/v1/dashboard/signals/resolve` | Mark one conversation's signal handled | Manager only |
| `GET` | `/api/v1/dashboard/insights` | AI narration for one widget | Manager dashboards |
| `POST` | `/api/v1/dashboard/ask` | Free-form question over the period's statistics | Manager dashboards |
| `GET` | `/api/v1/dashboard/exports` | List this company's export jobs (latest 50) | Manager dashboards |
| `POST` | `/api/v1/dashboard/exports` | Queue an Excel export job | Manager only |
| `GET` | `/api/v1/dashboard/exports/{id}` | Poll one export job's status | Manager dashboards |
| `GET` | `/api/v1/dashboard/exports/{id}/download` | Stream the finished `.xlsx` | Manager dashboards |

**Two permission tiers appear below.**

- *Manager dashboards* = `IsAuthenticated` + `HasCompany` + `ManagerDashboardAccess`.
  Roles `owner`/`admin`/`manager` always pass. A user **linked to an Employee profile**
  is the employee cabinet and is rejected with `403` (they may only use
  `/api/v1/dashboard/me`). A `viewer`-role user *without* an employee link is a read-only
  stakeholder and passes.
- *Manager only* = `IsAuthenticated` + `HasCompany` + `IsManagerRole` — strictly
  `owner`/`admin`/`manager`. Viewers get `403`.

Every response is scoped to `request.user.company_id`. There is no cross-tenant read of
any kind, including the export download.

---

## Signals — the attention queue

A **signal** is a rule-derived reason a conversation deserves a manager's eyes. Signals
are **pull-only**: the platform never pushes a notification anywhere (no email, no
Telegram, no webhook). They exist only in this endpoint's response — the UI is
responsible for turning them into badges.

### The seven signal types

`SignalKind` (`apps/analysis/models/signal.py`) — these strings are both the response
object keys and the accepted `signal` values on resolve:

| `signal` | Label | Triggered when |
|---|---|---|
| `unanswered` | Customer never got a reply | The conversation has at least one **inbound** message and **no outbound** message at all |
| `unassigned` | No employee attributed | `conversation.employee` is null after all attribution modes ran |
| `low_score` | Score in the 0–49 band | The canonical analysis result's `score` ≤ **49** (spec §4 "Yomon" band) |
| `rule_violations` | Rule violations found | The canonical result's `rule_violations` list is non-empty |
| `angry_customer` | Customer ended the chat angry | The canonical result's `customer_sentiment` is `angry` |
| `forgotten_agreement` | A promise was forgotten | An `Agreement` on the conversation reached status `forgotten` (nightly sweep) |
| `needs_review` | Flash and Pro scores diverged | The canonical result carries `needs_review: true` |

There is **no severity field**. Every signal type is flat and equally weighted by the
API; if the UI needs a severity ordering it must define it client-side (a reasonable
order is the table order above, which is the response's key order).

The queue is derived at read time from the same canonical result collapse the rest of
the dashboard uses — signals are not a stored table. Only *resolutions* are stored.

### GET /api/v1/dashboard/signals

**What it does.** Powers the "Diqqat talab qiladi" panel: a card per signal type showing
how many conversations are still open on it, how many were already handled, and a
preview list of up to 20 conversations (newest-closed first) so the manager can jump
straight into a chat.

**Auth & permissions.** *Manager dashboards* tier (see above). Tenant-scoped on the
caller's company. Response is cached for **120 s per tenant + query string**
(`dashboard/cache.py`), so a just-resolved signal may still appear for up to two minutes
— see [Frontend notes](#frontend-notes).

**Query params**

| Name | Type | Required | Default | Description |
|---|---|---|---|---|
| `date_from` | ISO-8601 datetime | no | `date_to − 30 days` | Window start, measured on `Conversation.closed_at` |
| `date_to` | ISO-8601 datetime | no | now | Window end |
| `confirmed` | boolean | no | `false` | Accepted and validated for parity with the other dashboard endpoints, but **ignored** by this endpoint — the queue is never filtered to manager-confirmed outcomes. It still varies the cache key. |

**Response `200`**

Exactly seven keys, always present, one per `SignalKind`. `count` = still-open,
`resolved` = already-handled in this window, `items` = up to 20 open previews.

```json
{
  "unanswered": {
    "count": 4,
    "resolved": 11,
    "items": [
      {
        "conversation": "6b0e6b8a-8f1a-4a2a-9c3d-0e1f2a3b4c5d",
        "customer_name": "Dilnoza R.",
        "employee_name": null,
        "closed_at": "2026-07-28 15:04:11"
      }
    ]
  },
  "unassigned":          { "count": 2,  "resolved": 0,  "items": [] },
  "low_score":           { "count": 17, "resolved": 5,  "items": [] },
  "rule_violations":     { "count": 9,  "resolved": 2,  "items": [] },
  "angry_customer":      { "count": 1,  "resolved": 0,  "items": [] },
  "forgotten_agreement": { "count": 6,  "resolved": 3,  "items": [] },
  "needs_review":        { "count": 3,  "resolved": 0,  "items": [] }
}
```

`customer_name`, `employee_name` and `closed_at` are nullable. `items` is truncated at
20 (`SIGNAL_PREVIEW`) — `count` is the real total, so never derive the count from
`items.length`.

`closed_at` uses the project-wide response datetime format `YYYY-MM-DD HH:MM:SS` — **no
`T`, no `Z`, no offset** (see [`01-conventions.md`](./01-conventions.md) for the parser
helper). It is *not* ISO-8601; `new Date(value)` is unreliable on it.

**Errors**

| Status | `code` | When |
|---|---|---|
| `400` | `period_invalid` | `date_from` is after `date_to` |
| `400` | (field errors) | Unparseable `date_from` / `date_to` / `confirmed` |
| `401` | — | Missing/expired token |
| `403` | — | No company on the user, or the user is an employee-cabinet user |

### POST /api/v1/dashboard/signals/resolve

**What it does.** The "ko'rildi / hal qilindi" button. Marks **one conversation on one
signal type** as handled so it drops out of that signal's open queue. The underlying
conversation, analysis and agreement data are never modified — a resolution is a
manager's read receipt, not a data correction.

**Auth & permissions.** *Manager only* tier: `IsAuthenticated` + `HasCompany` +
`IsManagerRole` (`owner`/`admin`/`manager`). Viewer-role stakeholders who can *read*
`/api/v1/dashboard/signals` get `403` here. The conversation must belong to the caller's
company.

**Query params.** None — everything travels in the body.

**Request body**

```jsonc
{
  // required — UUID of a conversation in the caller's company
  "conversation": "6b0e6b8a-8f1a-4a2a-9c3d-0e1f2a3b4c5d",
  // required — one of the seven SignalKind values:
  // unanswered | unassigned | low_score | rule_violations |
  // angry_customer | forgotten_agreement | needs_review
  "signal": "low_score"
}
```

Both fields are required; there are no optional fields and no bulk form. To resolve a
conversation on several signal types, send one request per type.

**Idempotency.** Backed by `get_or_create` on a `(conversation, signal)` unique
constraint. Resolving twice returns the same `200` and changes nothing — safe to retry
on network failure, and safe to fire optimistically. The original `resolved_by` and
timestamp are preserved on a repeat call.

**What changes after resolve.** On the next uncached `GET /api/v1/dashboard/signals` (up to
120 s later), that conversation moves out of `<signal>.items`, `<signal>.count`
decreases by one, and `<signal>.resolved` increases by one — provided the conversation is
still inside the requested window and still matches the signal's rule. A resolution is
permanent and per-signal; there is **no un-resolve endpoint**.

**Response `200`** — the validated payload, echoed:

```json
{
  "conversation": "6b0e6b8a-8f1a-4a2a-9c3d-0e1f2a3b4c5d",
  "signal": "low_score"
}
```

**Errors**

| Status | `code` | When |
|---|---|---|
| `400` | `conversation_not_found` | Unknown conversation UUID, or one belonging to another company (deliberately indistinguishable) |
| `400` | (field errors on `signal`) | `signal` is not one of the seven values |
| `400` | (field errors on `conversation`) | Not a valid UUID / missing |
| `401` | — | Missing/expired token |
| `403` | — | No company, or role is not `owner`/`admin`/`manager` |

---

## Insights — AI narration under a widget

### GET /api/v1/dashboard/insights

**What it does.** Powers the "get-insights" button under a chart: 2–3 one-sentence
hypotheses about what the widget's numbers are showing, in Uzbek (Russian when the data
is clearly Russian). It is the caption under a chart, not an analysis engine.

**How it is generated — and what you can rely on.**

- **On demand, not scheduled.** There is no background job and no stored insight
  history. The request itself recomputes the widget's aggregate server-side and calls
  Gemini Flash (`GEMINI_FLASH_MODEL`) synchronously.
- **The model narrates, it never computes.** The aggregate is computed in SQL and
  serialized *into* the prompt; the model is instructed never to recompute,
  extrapolate, or invent a number. It cannot be fed client-side numbers — the
  frontend only supplies the widget name and the period.
- **Phrased as hypotheses.** Trends are stated as possibilities ("…bo'lishi mumkin"),
  not conclusions. If nothing stands out, you get a single bullet saying exactly that.
- **Bounded output.** At most **3** bullets, each truncated to **220 characters**, plain
  text (the prompt forbids markdown). Safe to render into a plain `<li>`.
- **Freshness.** Cached 120 s per tenant + query string, like every other aggregate.
  Insights for the same widget + window inside that window return byte-identical text;
  after it expires the model is called again and the wording will differ even if the
  numbers didn't. Do not treat the text as a stable identity — don't diff it, don't key
  React lists on it.
- **Latency.** One LLM round-trip on the request thread; budget a few seconds.

**Query params**

| Name | Type | Required | Default | Description |
|---|---|---|---|---|
| `widget` | enum | **yes** | — | Which widget to narrate. One of `overview`, `timeseries`, `ratings`, `products`, `reasons`, `funnel`, `agreements` |
| `date_from` | ISO-8601 datetime | no | `date_to − 30 days` | Window start (on `closed_at`) |
| `date_to` | ISO-8601 datetime | no | now | Window end |
| `confirmed` | boolean | no | `false` | Narrate only manager-confirmed outcomes. Ignored for `agreements`, whose aggregate has no confirmed filter |

Each `widget` value maps to the identical aggregate the matching endpoint in
`05-dashboard.md` returns (`ratings` → `/api/v1/dashboard/employees`, `products` →
`/api/v1/dashboard/products`, `reasons` → `/api/v1/dashboard/reasons`), so the narration and the chart
beside it can never disagree.

**Auth & permissions.** *Manager dashboards* tier. Tenant-scoped.

**Response `200`**

```json
{
  "widget": "funnel",
  "bullets": [
    "Ehtiyojni aniqlash bosqichida suhbatlarning 38% to'xtab qolgan — skriptning shu qismi eng zaif bo'lishi mumkin.",
    "Narx e'tirozi ko'tarilgan suhbatlarda yopish bosqichiga o'tish ikki barobar kam uchraydi.",
    "Yakuniy bosqichga yetgan suhbatlarning aksariyati sotuv bilan tugagan."
  ]
}
```

`bullets` is a list of strings; it can contain 1–3 entries and is never `null`.

**Errors**

| Status | `code` | When |
|---|---|---|
| `400` | (field error on `widget`) | Missing or not one of the seven widget values |
| `400` | `period_invalid` | `date_from` after `date_to` |
| `400` | `period_too_long` | The window needs more than **400** daily buckets (≈13 months). Only reachable for `widget=timeseries` and `widget=agreements`, whose aggregates build a daily series; the other five widgets have no bucket cap |
| `400` | `gemini_not_configured` | The deployment has no `GEMINI_API_KEY`. Treat as "AI features off" and hide the insights button for the session |
| `401` / `403` | — | As for `/api/v1/dashboard/signals` |
| `5xx` | — | Upstream Gemini failure or a non-schema-valid model response. Show a retry affordance; never block the chart itself on this call |

---

## Ask — the in-platform AI chat

### POST /api/v1/dashboard/ask

**What it does.** The dashboard's chat box (spec §10): a manager types a question in
Uzbek or Russian ("Kim eng ko'p kelishuvni unutgan?") and gets a short answer grounded
strictly in that period's precomputed statistics, plus the conversation ids the answer
rests on so the UI can render them as clickable chips.

**What the model is allowed to answer over.** Exactly one server-built statistics pack
for the requested period — nothing else. It contains: `period`, `overview`,
`employee_ratings`, `department_ratings`, `lost_products`, `lost_reasons`, `funnel`,
`agreements`, and `signals` (counts + previews). It does **not** contain message
transcripts, customer contact details, or anything from outside the window or outside
the caller's company. The pack is always computed *unconfirmed* (there is no `confirmed`
switch on this endpoint).

The prompt forbids inventing, estimating or extrapolating any number not in the pack. If
the pack cannot answer, the model must return `has_data: false` with a brief "this data
isn't available for the period" in the question's language — that is a **normal `200`**,
not an error. Conversation ids may only be cited if they appear in the pack.

**Auth & permissions.** *Manager dashboards* tier. Tenant-scoped on
`request.user.company_id`; the pack is built from that company alone.

**Query params.** None — the window travels in the body.

**Request body**

```jsonc
{
  // required — free text, max 500 characters. Uzbek or Russian; the answer comes
  // back in the question's language.
  "question": "Iyul oyida qaysi xodim eng ko'p kelishuvni unutgan?",
  // optional — defaults to the last 30 days, same rule as every dashboard endpoint
  "date_from": "2026-07-01T00:00:00Z",
  "date_to":   "2026-07-31T23:59:59Z"
}
```

There is **no conversation/thread id and no chat history** — every call is stateless and
one-shot. If the UI shows a chat transcript, it maintains that state client-side; the
backend will not resolve "and what about last week?" against a previous turn.

**Response `200`**

```json
{
  "answer": "Iyul oyida eng ko'p unutilgan kelishuv Sardor Y.ga tegishli — 6 ta. Undan keyin Malika T. (4 ta) turadi.",
  "used_conversations": [
    "6b0e6b8a-8f1a-4a2a-9c3d-0e1f2a3b4c5d",
    "9d2c1f30-4b77-4f0e-8b52-a1c6d3e7f011"
  ],
  "has_data": true
}
```

| Field | Type | Notes |
|---|---|---|
| `answer` | string | Plain text, no markdown; truncated server-side to **1200 characters** |
| `used_conversations` | UUID list | At most **20**; may be empty even when `has_data` is `true` |
| `has_data` | boolean | `false` = the statistics pack could not answer; render `answer` as an informational message, not a result |

**Latency & failure handling.** This is the heaviest read in the API: it computes nine
aggregates over the window and then makes one Gemini Flash round-trip, all
synchronously. Expect **several seconds**, and materially longer on a 90-day window with
a large tenant. It is **not cached** and there is **no streaming** — the response arrives
in one piece. Recommended client behaviour: a request timeout of at least 60 s, a
disabled send button plus a skeleton/typing indicator while in flight, and a "retry"
affordance on failure. Never auto-retry on a timeout — the request is expensive and the
server may still be working.

**Errors**

| Status | `code` | When |
|---|---|---|
| `400` | (field error on `question`) | Missing, empty, or longer than 500 characters |
| `400` | (field errors on dates) | Unparseable `date_from` / `date_to` |
| `400` | `gemini_not_configured` | No `GEMINI_API_KEY` in the deployment — hide the chat box |
| `401` / `403` | — | As for `/api/v1/dashboard/signals` |
| `5xx` | — | Gemini failure or non-schema-valid output |

Note: unlike the GET endpoints, `/ask` does not raise `period_invalid` — it is a plain
`APIView` that calls `resolve_period` directly and never range-checks it, so an inverted
window simply produces an empty pack and a `has_data: false` answer.

For the same reason `/ask` has **no `period_too_long`**: it does not inherit the base
dashboard view's `PeriodTooLong → 400` mapping, yet the pack it builds includes the
agreements daily series. A window wider than **400 days** therefore fails as an
unhandled **`500`**, not a clean `400`. Clamp the date range client-side to ≤400 days.

---

## Exports — asynchronous Excel reports

Exports are **jobs**, not downloads. `POST` queues a Celery task and returns
immediately; the file is built in the background, written to storage with a **24-hour
TTL**, and swept by a daily cleanup job (04:30 server time) that deletes both the file
and the row. An export is a download, not an archive — re-request rather than store the
id long-term.

**Lifecycle**

```
POST /api/v1/dashboard/exports
    ──►  201  { status: "pending" }
    │
    ▼  Celery builds it:  pending → running → done | error
    │
GET /api/v1/dashboard/exports/{id}
    ──►  poll until status is "done" or "error"
    │
    ▼
GET /api/v1/dashboard/exports/{id}/download
    ──►  .xlsx byte stream
    │
    ▼  expires_at (created + 24h) → row and file deleted → 400 export_not_found
```

**Status enum** (`ExportFile.Status`)

| `status` | Meaning | Frontend |
|---|---|---|
| `pending` | Row created, task queued, not started | Keep polling |
| `running` | The Celery worker is building the workbook | Keep polling |
| `done` | File written; `file_url` and `expires_at` are set | Stop polling, enable download |
| `error` | Build failed after retries; `error` holds the message (≤500 chars) | Stop polling, show `error`, offer re-request |

`error` is only populated once the task has exhausted its retries (up to 2 retries with
backoff), so a transient failure will not surface as `error` — the row simply stays
`running` a little longer.

**Format support.** The only output format is **`.xlsx`** (built with openpyxl). There
is **no PDF export** — it is listed as pending work in the project docs and no code path,
field, or enum value for it exists. There is no `format` parameter: do not send one, and
do not render a PDF option in the UI. If the product needs PDF today, the frontend must
generate it client-side from the aggregate endpoints in `05-dashboard.md`.

**Export kinds** (`ExportFile.Kind`)

| `kind` | Contents |
|---|---|
| `conversations` | One row per conversation in the window with its canonical analysis |
| `ratings` | The employee ratings league table for the window |

Both are built from the same canonical collapse the dashboard uses, so an export can
never disagree with the screen it was exported from.

### GET /api/v1/dashboard/exports

**What it does.** The "Hisobotlar" list: this company's recent export jobs so a manager
can re-download a file built ten minutes ago instead of queueing a duplicate.

**Auth & permissions.** *Manager dashboards* tier (read is open to viewer-role
stakeholders; only creation is manager-only). Filtered to
`company_id = request.user.company_id`.

**Query params.** None. The list is hard-capped at the **50 most recent** rows
(`-created_at`), is not paginated, and cannot be filtered — expired rows are already gone,
so 50 covers well over a day of activity.

**Response `200`** — a bare array (no pagination envelope):

```json
[
  {
    "id": "1f4c8a52-9b31-4bb7-9d0f-77aa9d3e1c40",
    "kind": "conversations",
    "status": "done",
    "params": {
      "date_from": "2026-07-01T00:00:00+00:00",
      "date_to": "2026-07-29T12:00:00+00:00"
    },
    "file_url": "https://monitoring.jakhongir.dev/api/v1/dashboard/exports/1f4c8a52-9b31-4bb7-9d0f-77aa9d3e1c40/download",
    "error": "",
    "expires_at": "2026-07-30T12:03:41.882Z",
    "created_at": "2026-07-29T12:03:12.010Z"
  },
  {
    "id": "8e2b0c17-33aa-4c9e-8b0d-5f0d2a9b6e77",
    "kind": "ratings",
    "status": "running",
    "params": {
      "date_from": "2026-06-29T12:01:55+00:00",
      "date_to": "2026-07-29T12:01:55+00:00"
    },
    "file_url": null,
    "error": "",
    "expires_at": null,
    "created_at": "2026-07-29T12:01:55.443Z"
  }
]
```

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | Use for the detail and download routes |
| `kind` | enum | `conversations` \| `ratings` |
| `status` | enum | `pending` \| `running` \| `done` \| `error` |
| `params` | object | The **resolved** window echoed back (`date_from`/`date_to` as ISO strings), so a listed export is self-describing even if the user's filters have since changed |
| `file_url` | string \| null | Absolute URL of the authenticated download route. `null` unless `status` is `done` **and** a file exists. Never a raw storage/S3 URL |
| `error` | string | `""` unless `status` is `error` |
| `expires_at` | datetime \| null | Set when the file is written: `+24h`. `null` while pending/running |
| `created_at` | datetime | Row creation |

**Errors:** `401`, `403` (no company / employee-cabinet user).

### POST /api/v1/dashboard/exports

**What it does.** Queues one export job and returns the freshly created row so the UI can
immediately show a "preparing…" card with an id to poll.

**Auth & permissions.** *Manager only* — the view additionally checks `IsManagerRole` and
raises `PermissionDenied` for viewer-role users who may still read the list.

**Request body**

```jsonc
{
  // required — "conversations" or "ratings"
  "kind": "conversations",
  // optional — defaults to the last 30 days; the resolved window is echoed in `params`
  "date_from": "2026-07-01T00:00:00Z",
  "date_to":   "2026-07-29T12:00:00Z"
}
```

No other options exist: no column selection, no format, no employee/product filter. The
window is resolved server-side with the same 30-day default as every dashboard endpoint,
and an inverted window is **not** rejected here (it yields an empty workbook).

**Response `201 Created`** — one `ExportFile` object, always `status: "pending"` with
`file_url: null`:

```json
{
  "id": "1f4c8a52-9b31-4bb7-9d0f-77aa9d3e1c40",
  "kind": "conversations",
  "status": "pending",
  "params": {
    "date_from": "2026-07-01T00:00:00+00:00",
    "date_to": "2026-07-29T12:00:00+00:00"
  },
  "file_url": null,
  "error": "",
  "expires_at": null,
  "created_at": "2026-07-29T12:03:12.010Z"
}
```

> The generated OpenAPI schema advertises `200` for this operation; the implementation
> returns **`201`**. Accept both (`response.ok`) rather than matching on `200`.

Duplicate submissions are **not** deduplicated — two identical POSTs create two jobs and
build two files. Disable the button while a request is in flight.

**Errors**

| Status | `code` | When |
|---|---|---|
| `400` | (field error on `kind`) | Missing or not `conversations` / `ratings` |
| `400` | (field errors on dates) | Unparseable `date_from` / `date_to` |
| `401` | — | Missing/expired token |
| `403` | — | No company, employee-cabinet user, or a non-manager role (`This action requires a manager role.`) |

### GET /api/v1/dashboard/exports/{id}

**What it does.** The poll endpoint. Fetch it on an interval after creating a job until
`status` becomes `done` or `error`.

**Auth & permissions.** *Manager dashboards* tier. Looked up with
`pk=<id>, company_id=<caller's company>` — another tenant's export id is reported as not
found, never as forbidden.

**Path params**

| Name | Type | Required | Description |
|---|---|---|---|
| `id` | UUID | yes | The export id returned by `POST /api/v1/dashboard/exports` |

**Query params.** None.

**Response `200`** — the same `ExportFile` object as the list, e.g. once finished:

```json
{
  "id": "1f4c8a52-9b31-4bb7-9d0f-77aa9d3e1c40",
  "kind": "conversations",
  "status": "done",
  "params": {
    "date_from": "2026-07-01T00:00:00+00:00",
    "date_to": "2026-07-29T12:00:00+00:00"
  },
  "file_url": "https://monitoring.jakhongir.dev/api/v1/dashboard/exports/1f4c8a52-9b31-4bb7-9d0f-77aa9d3e1c40/download",
  "error": "",
  "expires_at": "2026-07-30T12:03:41.882Z",
  "created_at": "2026-07-29T12:03:12.010Z"
}
```

And on failure:

```json
{
  "id": "1f4c8a52-9b31-4bb7-9d0f-77aa9d3e1c40",
  "kind": "ratings",
  "status": "error",
  "params": { "date_from": "2026-07-01T00:00:00+00:00", "date_to": "2026-07-29T12:00:00+00:00" },
  "file_url": null,
  "error": "Worksheet build failed: ...",
  "expires_at": null,
  "created_at": "2026-07-29T12:03:12.010Z"
}
```

**Errors**

| Status | `code` | When |
|---|---|---|
| `400` | `export_not_found` | Unknown id, another tenant's id, or an export already swept past `expires_at` |
| `401` / `403` | — | As above |

> Note this is a **`400` with `export_not_found`**, not a `404` — handle the missing case
> off the error `code`, not the status.

### GET /api/v1/dashboard/exports/{id}/download

**What it does.** Streams the finished workbook. This route exists precisely so the file
is never reachable by a storage URL: an export contains a whole company's conversations
and analysis, so every download passes tenant scoping first.

**Auth & permissions.** *Manager dashboards* tier, plus the export must belong to the
caller's company **and** have `status = done` with a file present. Because auth is
required, this URL cannot be opened by a bare `window.open`/`<a download>` unless your
auth travels in a cookie — with `Authorization: Bearer`, fetch it as a blob and trigger
the save client-side.

**Path params**

| Name | Type | Required | Description |
|---|---|---|---|
| `id` | UUID | yes | Export id whose `status` is `done` |

**Response `200`** — a **direct file stream, not a redirect**:

- Body: the raw `.xlsx` bytes (Django `FileResponse`).
- `Content-Type`: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
  (inferred from the `.xlsx` name).
- `Content-Disposition`: `attachment; filename="conversations-<timestamp>.xlsx"` —
  the server names the file (`<kind>-<timestamp>.xlsx`); use that name when saving.
- `Content-Length` is set for a normal (non-ranged) response.

Prefer `file_url` from the export object over building this path by hand — it is the
same route, returned as an absolute URL.

**Errors**

| Status | `code` | When |
|---|---|---|
| `400` | `export_not_found` | Unknown id, another tenant's, `status` is not `done`, the file is missing, or the 24h TTL already swept it |
| `401` / `403` | — | As above |

Because a failure comes back as a JSON error envelope while success is binary, always
check `response.ok` (and/or the content type) before treating the body as a file.

---

## Frontend notes

**Signals — badge & queue UX**
- Nothing is pushed. If the product wants a live badge, the SPA must poll
  `GET /api/v1/dashboard/signals`. The response is server-cached for 120 s, so polling faster
  than that just burns requests — **60–120 s is the useful floor**, and on a background
  tab you should stop polling entirely.
- Badge count = `Σ count` over the seven signal types (or a chosen subset). Use `count`,
  never `items.length` — `items` is capped at 20.
- There is no severity from the server. If you colour-code, define the order client-side
  and keep it stable; a reasonable default is `unanswered` → `angry_customer` →
  `rule_violations` → `forgotten_agreement` → `low_score` → `needs_review` →
  `unassigned`.
- Resolve is idempotent, so optimistic UI is safe: remove the row locally on click, and
  on error restore it. Expect the item to reappear on the next `GET` for up to 120 s
  because of the aggregate cache — reconcile against your local resolved-set rather than
  trusting the first refetch.
- `resolved` is a coverage stat ("we handled 11 of 15 unanswered chats"), not a queue —
  there is no endpoint to list resolved items or to un-resolve one.

**Insights & Ask — loading UX**
- Neither endpoint streams. Render a skeleton (insights) or a typing indicator (ask);
  do not build a token-by-token UI, there are no partial chunks to consume.
- Insights: fire lazily on the widget's "get-insights" click, not on page load — it is
  an LLM call per widget. Cache the result in component state for the current filter
  set; the server cache means a refetch within 2 minutes is free, but a later refetch
  will return differently-worded text.
- Ask: allow ≥60 s before timing out, disable the composer while in flight, and never
  auto-retry. Treat `has_data: false` as a first-class answer (info styling, no
  `used_conversations` chips) rather than an error.
- If either endpoint returns `gemini_not_configured`, disable all AI affordances for the
  session — the deployment has no key and every subsequent call will fail the same way.

**Exports — polling**
- After `POST`, poll `GET /api/v1/dashboard/exports/{id}` on a **3–5 s** interval; back off to
  ~10 s after the first 30 s. Stop on `done` or `error`, and give up with a "still
  building, check the reports list" message after ~5 minutes rather than polling forever.
- Never poll the download route to detect readiness — a not-yet-ready export returns a
  `400`, not a retryable signal.
- Gate the download button on `file_url !== null` rather than on `status === "done"`;
  both are required server-side and `file_url` folds them into one check.
- Surface `expires_at` in the UI ("24 soat ichida yuklab oling") — after it passes both
  the file and the row are deleted, and the id turns into `export_not_found`. Don't
  persist export ids in local storage across sessions.
- With bearer-token auth, download via `fetch` → `blob` → object URL, reading the
  filename from `Content-Disposition`; a plain anchor will fail auth.
- There is no PDF: if a "Download PDF" control is in the design, either drop it or
  implement it entirely client-side from the aggregates in `05-dashboard.md`.
