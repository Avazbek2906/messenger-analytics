# Conversations, Customers & Message Audio

Everything under `/api/v1/chats/`. This is the **evidence layer** of the product: the
dashboards produce numbers, and every number drills down into a conversation list, a
conversation detail screen, and a message transcript. It also carries the two human
correction flows a manager uses — reassigning a conversation to the right employee and
overriding an AI conclusion — plus the manual cross-channel customer merge.

All endpoints are read-heavy. There are **no create/update/delete routes** on
conversations, customers or messages: conversations are produced by ingest +
segmentation, never by the frontend. The only writes are the three `POST` actions below.

Every path below is written in full, including the `/api/v1` mount prefix — call them
exactly as shown.
Error envelope, auth headers and datetime format: see `01-conventions.md`.

## Endpoints at a glance

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/v1/chats/conversations` | Paginated conversation list with canonical score/outcome columns + the full filter set |
| `GET` | `/api/v1/chats/conversations/{id}` | One conversation with its analysis, effective values, override history and agreements |
| `GET` | `/api/v1/chats/conversations/{id}/messages` | Paginated, time-ordered transcript of one conversation |
| `POST` | `/api/v1/chats/conversations/{id}/assign` | Manually attribute the conversation to an employee |
| `POST` | `/api/v1/chats/conversations/{id}/override` | Correct the AI's outcome / score / primary reason |
| `GET` | `/api/v1/chats/customers` | Paginated customer identities (one row per channel) |
| `GET` | `/api/v1/chats/customers/{id}` | One customer identity + the identities merged into it |
| `POST` | `/api/v1/chats/customers/{id}/merge` | Fold this customer into another (manual identity merge) |
| `GET` | `/api/v1/chats/messages/{id}/audio` | Stream a voice message's stored recording |

**9 endpoints.**

## Enums the frontend must render

### `channel` — `shared.enums.Channel`

| Value | Meaning |
|---|---|
| `telegram` | Telegram (userbot-monitored DM) |
| `instagram` | Instagram Direct |
| `web` | Web chat widget |

On a conversation, `channel` is read from the owning integration account
(`account.channel`) and is a plain string. On a customer it is a proper enum field.

### `direction` — `RawMessage.Direction`

| Value | Meaning |
|---|---|
| `inbound` | From the customer |
| `outbound` | From the company (the employee / account) |

### `message_type` — `RawMessage.Type`

| Value | Meaning |
|---|---|
| `text` | Plain text (default) |
| `voice` | Voice note — has `audio_file`, gets an STT `transcript` |
| `image` | Photo |
| `video` | Video |
| `file` | Document / arbitrary attachment |
| `sticker` | Sticker |
| `location` | Shared location |
| `other` | Anything the channel adapter could not classify |

### `transcript_source` — `RawMessage.TranscriptSource`

`kotib_stt`, `google_stt`, `azure_stt`, or `""` (empty string) when the message has no
transcript.

### `detected_language` — `RawMessage.Language`

`uz` (Uzbek), `ru` (Russian), `uz-ru-mixed` (mixed), or `""` when unknown.

### `outcome` — `analysis.models.result.Outcome`

| Value | Meaning |
|---|---|
| `sotildi` | Sold — the deal closed |
| `sotilmadi` | Not sold — the deal was lost |
| `noaniq` | Unclear / undetermined |

Also the allowed `value` set for `POST /api/v1/chats/conversations/{id}/override` with `field: "outcome"`.
A conversation that has never been scored returns `null`, **not** `noaniq`.

### `customer_sentiment` / `sentiment` filter — `analysis.models.result.Sentiment`

`positive`, `neutral`, `negative`, `angry`. `angry` drives the "jahli chiqqan mijozlar"
signal. `null` on unscored conversations.

### `attribution_source` — `Conversation.AttributionSource`

| Value | Meaning |
|---|---|
| `mode_1` | Attributed from the account's default employee |
| `mode_2_shift` | Attributed by the shift schedule (wall-clock, company timezone) |
| `mode_3_extension` | Attributed by the browser extension (who had the chat open) |
| `widget` | Web widget named its employee in-band |
| `legacy` | Backfilled history |
| `manual` | A manager assigned it via `POST /api/v1/chats/conversations/{id}/assign` |
| `""` | Unassigned — nobody was on shift / no rule matched |

`manual` is sticky: automatic modes never overwrite it.

### `override.field` — `ManagerOverride.Field`

`outcome`, `score`, `primary_reason`, `employee`. The **request** to `POST /api/v1/chats/conversations/{id}/override`
accepts only the first three; `employee` rows appear in the response history because
`POST /api/v1/chats/conversations/{id}/assign` writes them.

### `agreements[].status` — `Agreement.Status`

`pending`, `fulfilled`, `forgotten`.

### `analysis.stage` — `AnalysisResult.Stage`

`realtime` (quick Flash pass) or `batch` (nightly full analysis). The canonical row
shown is the newest `batch`, else the newest `realtime`.

## Conversations

### GET /api/v1/chats/conversations

**What it does.** The main working list — the screen a manager lands on after clicking
any dashboard tile. Each row already carries its *canonical* analysis (newest batch row,
else newest realtime) as flat columns, so the list renders a score column, an outcome
badge and a sentiment chip without a second request. The `outcome` column resolves
manager overrides, so this list can never disagree with the KPI it was opened from.

**Auth & permissions.** `IsAuthenticated` + `HasCompany`. Rows are always filtered to
`request.user.company_id`. A non-manager user linked to an `Employee` profile
(the employee cabinet) additionally sees **only their own conversations**
(`employee_id = <their employee>`); a `viewer`-role user with no employee link sees the
whole company read-only.

**Query params**

Pagination — `LimitOffsetPagination`, `PAGE_SIZE = 100`.

| Name | Type | Required | Default | Description |
|---|---|---|---|---|
| `limit` | integer | no | `100` | Rows per page |
| `offset` | integer | no | `0` | Index of the first row |
| `search` | string | no | — | Case-insensitive contains over `customer.display_name`, `customer.username` |
| `ordering` | string | no | `-last_message_at` (model default) | One of `started_at`, `last_message_at`, `closed_at`, `analysis_score`; prefix `-` for descending |

Filters (`ConversationFilter`):

| Name | Type | Required | Default | Description |
|---|---|---|---|---|
| `employee` | uuid | no | — | Exact employee FK |
| `account` | uuid | no | — | Exact integration-account FK (one account = one channel identity) |
| `attribution_source` | enum | no | — | One of the `attribution_source` values above |
| `is_legacy` | boolean | no | — | `true` = backfilled history (excluded from employee ratings) |
| `unassigned` | boolean | no | — | `true` → `employee IS NULL` (the manager's assignment queue); `false` → assigned only |
| `outcome` | enum | no | — | `sotildi` / `sotilmadi` / `noaniq`, matched against the **override-resolved** outcome |
| `sentiment` | enum | no | — | `positive` / `neutral` / `negative` / `angry` (raw AI value) |
| `score_min` | number | no | — | Canonical score `>=` |
| `score_max` | number | no | — | Canonical score `<=` |
| `needs_review` | boolean | no | — | Batch score diverged from the realtime pass — the "re-reviewed" marker |
| `closed_from` | ISO 8601 datetime | no | — | `closed_at >=` |
| `closed_to` | ISO 8601 datetime | no | — | `closed_at <=` |
| `product` | uuid | no | — | Canonical analysis lists this catalog product in `products_of_interest` |
| `reason` | uuid | no | — | Canonical **effective** primary reason (manager correction wins over the AI's) |
| `has_violations` | boolean | no | — | `true` = canonical analysis has a non-empty `rule_violations`; `false` also returns unscored conversations |

> `product` and `reason` take a **UUID** (the catalog `Product` / `Reason` id), not a
> code. `reason` matches the effective reason on purpose, so the drill-down count always
> equals the widget count it came from.

**Request body.** None.

**Response `200`**

```json
{
  "count": 342,
  "next": "https://monitoring.jakhongir.dev/api/v1/chats/conversations?limit=100&offset=100",
  "previous": null,
  "results": [
    {
      "id": "6f2a9c14-3d5b-4a7e-9f01-2c8b6de41a77",
      "channel": "telegram",
      "customer": "b91d4e7a-55c2-4f18-8a3d-0e7c9b21f640",
      "customer_name": "Dilnoza Karimova",
      "employee": "2c7e1f90-84ab-4c3d-9b52-6f0a3d18e4c1",
      "employee_name": "Sardor Rustamov",
      "attribution_source": "mode_2_shift",
      "started_at": "2026-07-28 09:14:02",
      "last_message_at": "2026-07-28 09:41:37",
      "closed_at": "2026-07-28 11:41:37",
      "is_legacy": false,
      "first_response_seconds": 42.0,
      "avg_response_seconds": 118.5,
      "score": 78,
      "outcome": "sotildi",
      "customer_sentiment": "positive",
      "needs_review": false
    },
    {
      "id": "a4c0be21-77d9-4e60-b1f3-95ad2c6f8e33",
      "channel": "instagram",
      "customer": "df31a05c-9b6e-4a22-88d7-31c0f47b9e15",
      "customer_name": "aziz_shop_uz",
      "employee": null,
      "employee_name": null,
      "attribution_source": "",
      "started_at": "2026-07-28 15:02:11",
      "last_message_at": "2026-07-28 15:07:49",
      "closed_at": null,
      "is_legacy": false,
      "first_response_seconds": null,
      "avg_response_seconds": null,
      "score": null,
      "outcome": null,
      "customer_sentiment": null,
      "needs_review": null
    }
  ]
}
```

Field notes:

- `score`, `outcome`, `customer_sentiment`, `needs_review` are **null until scored**.
  Render "—", never `0` / `noaniq`.
- `first_response_seconds` / `avg_response_seconds` are floats stamped when the
  conversation closes. `null` means "no answered inbound message (or still open)" — it
  never means "replied instantly".
- `closed_at: null` ⇒ the conversation is still open.
- `attribution_source: ""` ⇒ unassigned; pair with `employee: null`.

**Errors.** `401` (unauthenticated), `403` (`HasCompany` fails — user not attached to a
company), `400` (`validation_error`) on a malformed filter value, e.g. a non-UUID
`employee` or an `outcome` outside the enum.

### GET /api/v1/chats/conversations/{id}

**What it does.** The single-conversation screen: the canonical AI analysis with its
evidence, the manager corrections layered on top (`effective_*`), the full override
audit trail, and the extracted customer agreements/promises. Messages are deliberately
**not** included — fetch them from the `/api/v1/chats/conversations/{id}/messages` sub-endpoint.

**Auth & permissions.** Same as the list: `IsAuthenticated` + `HasCompany`, company
scoping, employee-cabinet self-scoping. A conversation outside your company (or outside
your own rows, for an employee-cabinet user) returns `404`, not `403`.

**Path params**

| Name | Type | Required | Default | Description |
|---|---|---|---|---|
| `id` | uuid | yes | — | Conversation id |

**Request body.** None.

**Response `200`** — every `ConversationModel` field above, plus:

```json
{
  "id": "6f2a9c14-3d5b-4a7e-9f01-2c8b6de41a77",
  "channel": "telegram",
  "customer": "b91d4e7a-55c2-4f18-8a3d-0e7c9b21f640",
  "customer_name": "Dilnoza Karimova",
  "employee": "2c7e1f90-84ab-4c3d-9b52-6f0a3d18e4c1",
  "employee_name": "Sardor Rustamov",
  "attribution_source": "manual",
  "started_at": "2026-07-28 09:14:02",
  "last_message_at": "2026-07-28 09:41:37",
  "closed_at": "2026-07-28 11:41:37",
  "is_legacy": false,
  "first_response_seconds": 42.0,
  "avg_response_seconds": 118.5,
  "score": 61,
  "outcome": "sotilmadi",
  "customer_sentiment": "negative",
  "needs_review": true,
  "analysis": {
    "id": "0d18b7c5-2e44-49aa-b0c6-7f2e5a9d3311",
    "stage": "batch",
    "model": "gemini-2.5-pro",
    "created_at": "2026-07-29 02:11:04",
    "outcome": "sotilmadi",
    "outcome_confidence": 0.86,
    "outcome_signal": "Mijoz narxni eshitgach suhbatni to'xtatdi.",
    "customer_sentiment": "negative",
    "score": 61,
    "sub_scores": {
      "greeting": 8,
      "needs_discovery": 5,
      "objection_handling": 4,
      "closing": 3
    },
    "rule_violations": ["no_price_justification", "no_followup_offer"],
    "funnel": [
      {"stage": "salomlashish", "status": "ok", "note": ""},
      {"stage": "ehtiyojni aniqlash", "status": "partial", "note": "Faqat bitta savol berildi"},
      {"stage": "taklif", "status": "ok", "note": ""},
      {"stage": "e'tirozlar", "status": "failed", "note": "Narx e'tirozi javobsiz qoldi"},
      {"stage": "yopish", "status": "failed", "note": ""}
    ],
    "needs_review": true,
    "products_of_interest": [
      {"id": "7a3c9e02-1b48-4d6f-9c25-8e0af1b73d54", "name": "Vitrina 120sm"}
    ],
    "primary_reason": {
      "id": "c05f8b71-6d29-4e13-a7b8-91d4e6c0273f",
      "code": "qimmat",
      "label": "Narx qimmat"
    },
    "reason_evidence": "«Bu narx menga to'g'ri kelmaydi, boshqa joyda arzonroq»",
    "secondary_reasons": [
      {"id": "3e6d1a48-70bc-4f95-8d21-a5c7e0934b62", "code": "yetkazish", "label": "Yetkazib berish shartlari"}
    ],
    "other_reason_text": "",
    "coaching_suggestion": "Narx e'tirozida qiymatni qayta asoslang va muqobil to'lov shartini taklif qiling."
  },
  "effective_outcome": "noaniq",
  "effective_score": 70,
  "effective_reason": {
    "id": "c05f8b71-6d29-4e13-a7b8-91d4e6c0273f",
    "code": "qimmat",
    "label": "Narx qimmat",
    "source": "manager"
  },
  "overrides": [
    {
      "id": "9b4f2d67-1c80-42ae-b5f3-6e2a08c7d419",
      "field": "score",
      "old_value": "61",
      "new_value": "70",
      "overridden_by": "5d2e70a9-3f61-48bb-9c04-7ae1f5d20b83",
      "overridden_by_name": "Nodira Yusupova",
      "created_at": "2026-07-29 10:22:17"
    },
    {
      "id": "1f80c3ae-42d7-4b96-8e50-c6b93a71d208",
      "field": "outcome",
      "old_value": "sotilmadi",
      "new_value": "noaniq",
      "overridden_by": "5d2e70a9-3f61-48bb-9c04-7ae1f5d20b83",
      "overridden_by_name": "Nodira Yusupova",
      "created_at": "2026-07-29 10:21:55"
    },
    {
      "id": "8c17e94b-05fa-4d23-91b7-2ed6a3c08f57",
      "field": "employee",
      "old_value": "",
      "new_value": "Sardor Rustamov",
      "overridden_by": "5d2e70a9-3f61-48bb-9c04-7ae1f5d20b83",
      "overridden_by_name": "Nodira Yusupova",
      "created_at": "2026-07-29 09:58:40"
    }
  ],
  "agreements": [
    {
      "id": "e2704d19-8ba6-45c3-97f1-0d5c8e3a6249",
      "conversation": "6f2a9c14-3d5b-4a7e-9f01-2c8b6de41a77",
      "text": "Ertaga narxlar ro'yxatini yuborish",
      "due_hint": "ertaga",
      "due_on": "2026-07-30",
      "evidence": "«Ertaga sizga to'liq narxlar ro'yxatini yuboraman»",
      "status": "pending",
      "employee": "2c7e1f90-84ab-4c3d-9b52-6f0a3d18e4c1",
      "employee_name": "Sardor Rustamov",
      "created_at": "2026-07-29 02:11:05"
    }
  ]
}
```

Field notes:

- `analysis` is `null` when the conversation has never been scored (legacy/backfilled
  conversations are never auto-scored). Everything under it is then unavailable — guard
  the whole analysis panel on this one check.
- **`effective_*` vs the raw columns.** `score` / `outcome` are the AI's canonical
  values (`outcome` already resolves an override); `effective_outcome`,
  `effective_score` and `effective_reason` are what the business acts on and what the
  dashboards count. Display `effective_*` and show the raw AI value as a struck-through
  "AI said …" secondary line.
- `effective_reason.source` is `"manager"` or `"ai"` — use it to badge the reason chip.
- `effective_score` falls back to the AI score when no numeric override exists.
- `overrides` is the append-only audit trail, newest first, and includes `employee`
  rows written by `POST /api/v1/chats/conversations/{id}/assign`. Nothing is ever updated or deleted.
- `sub_scores` is a free-form JSON object and `rule_violations` / `funnel` are JSON
  arrays — their keys are prompt-version dependent. Render them generically
  (iterate keys) rather than hard-coding names.
- `outcome_confidence` is a float `0..1` or `null`.

**Errors.** `401`, `403` (no company), `404` (unknown id, other tenant, or an
employee-cabinet user asking for a colleague's conversation).

### GET /api/v1/chats/conversations/{id}/messages

**What it does.** The transcript, ascending by `sent_at` — the raw evidence behind every
score, reason and dashboard number. This is the message pane of the conversation detail
screen.

**Auth & permissions.** The conversation is resolved through the same scoped queryset,
so company scoping and employee self-scoping apply before any message is read. An
out-of-scope conversation id yields `404`.

**Path / query params**

| Name | Type | Required | Default | Description |
|---|---|---|---|---|
| `id` | uuid (path) | yes | — | Conversation id |
| `limit` | integer | no | `100` | Messages per page |
| `offset` | integer | no | `0` | Index of the first message |

Ordering is fixed to `sent_at` ascending and is not configurable.

> The generated OpenAPI schema also lists the conversation list's filter params
> (`outcome`, `search`, `ordering`, …) on this route because the viewset declares them.
> **They are inert here** — this action paginates a message queryset directly and never
> runs the filter backends. Send only `limit` / `offset`.

**Request body.** None.

**Response `200`** — paginated `RawMessageModel`, showing the variants a frontend must
handle (inbound/outbound, text/voice/image, echo):

```json
{
  "count": 24,
  "next": "https://monitoring.jakhongir.dev/api/v1/chats/conversations/6f2a9c14-3d5b-4a7e-9f01-2c8b6de41a77/messages?limit=100&offset=100",
  "previous": null,
  "results": [
    {
      "id": "12ab34cd-56ef-4780-91a2-b3c4d5e6f708",
      "direction": "inbound",
      "message_type": "text",
      "text": "Salom, vitrina narxi qancha?",
      "transcript": "",
      "transcript_source": "",
      "transcript_confidence": null,
      "detected_language": "",
      "has_audio": false,
      "audio_url": null,
      "sent_at": "2026-07-28 09:14:02",
      "is_echo": false,
      "external_id": "tg:441029"
    },
    {
      "id": "23bc45de-67f0-4891-a2b3-c4d5e6f70819",
      "direction": "outbound",
      "message_type": "text",
      "text": "Assalomu alaykum! 120sm vitrina 4 200 000 so'm.",
      "transcript": "",
      "transcript_source": "",
      "transcript_confidence": null,
      "detected_language": "",
      "has_audio": false,
      "audio_url": null,
      "sent_at": "2026-07-28 09:14:44",
      "is_echo": true,
      "external_id": "tg:441030"
    },
    {
      "id": "34cd56ef-7801-49a2-b3c4-d5e6f7081920",
      "direction": "inbound",
      "message_type": "voice",
      "text": "",
      "transcript": "Bu narx menga to'g'ri kelmaydi, boshqa joyda arzonroq ko'rdim.",
      "transcript_source": "kotib_stt",
      "transcript_confidence": 0.91,
      "detected_language": "uz-ru-mixed",
      "has_audio": true,
      "audio_url": "https://monitoring.jakhongir.dev/api/v1/chats/messages/34cd56ef-7801-49a2-b3c4-d5e6f7081920/audio",
      "sent_at": "2026-07-28 09:16:20",
      "is_echo": false,
      "external_id": "tg:441031"
    },
    {
      "id": "45de6780-1920-4b3c-8d5e-6f70819203a4",
      "direction": "inbound",
      "message_type": "image",
      "text": "",
      "transcript": "",
      "transcript_source": "",
      "transcript_confidence": null,
      "detected_language": "",
      "has_audio": false,
      "audio_url": null,
      "sent_at": "2026-07-28 09:18:03",
      "is_echo": false,
      "external_id": "ig:aWc6bWlkLjEyMzQ1Njc4OTA"
    },
    {
      "id": "56ef7801-9203-4a4b-9c6d-70819203a4b5",
      "direction": "outbound",
      "message_type": "voice",
      "text": "",
      "transcript": "",
      "transcript_source": "",
      "transcript_confidence": null,
      "detected_language": "",
      "has_audio": true,
      "audio_url": "https://monitoring.jakhongir.dev/api/v1/chats/messages/56ef7801-9203-4a4b-9c6d-70819203a4b5/audio",
      "sent_at": "2026-07-28 09:41:37",
      "is_echo": false,
      "external_id": "tg:441044"
    }
  ]
}
```

Field notes:

- **Body text**: use `transcript` when `message_type == "voice"`, otherwise `text`.
  That is exactly what the AI is shown. A voice message whose STT has not run (or
  failed) has `transcript: ""` — render a "transcription pending" placeholder rather
  than an empty bubble.
- `transcript_source`, `detected_language` are `""` (empty string), never `null`, when
  absent. `transcript_confidence` **is** `null` when absent.
- `has_audio` / `audio_url`: `audio_url` is the authenticated stream route below, built
  absolute from the current request. It is `null` exactly when `has_audio` is `false`.
  The raw storage URL is never exposed.
- Non-text, non-voice types (`image`, `video`, `file`, `sticker`, `location`) carry no
  media URL in this API — render a type chip plus any `text` caption.
- `is_echo` marks an outbound message the platform echoed back to the monitoring
  session. It is still a real company message; use it only if you need to explain
  duplicates in a channel's own UI.
- `external_id` is the channel's own message id (Telegram id, Instagram mid, …), unique
  per account. Useful as a stable React key alongside `id`.

**Errors.** `401`, `403` (no company), `404` (conversation not in scope).

### POST /api/v1/chats/conversations/{id}/assign

**What it does.** Manually attributes a conversation to an employee — the fallback for
conversations mode 2 left unassigned (nobody on shift) and the fix for a wrong automatic
attribution. It sets `attribution_source` to `manual` (which automatic modes will never
overwrite), re-syncs the denormalized employee on the analysis rows, and appends an
`employee` `ManagerOverride` so the human decision is auditable.

**Auth & permissions.** `IsAuthenticated` + `HasCompany` + **`IsManagerRole`** — only
`owner`, `admin`, `manager`. Employee-cabinet and `viewer` users get `403`. The target
employee must belong to the caller's company.

**Path params**

| Name | Type | Required | Default | Description |
|---|---|---|---|---|
| `id` | uuid | yes | — | Conversation id |

**Request body** (`application/json`)

```json
{
  "employee": "2c7e1f90-84ab-4c3d-9b52-6f0a3d18e4c1"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `employee` | uuid | **yes** | `Employee` id in the caller's company |

**Response `200`** — the updated `ConversationModel` (same shape as a list row):

```json
{
  "id": "6f2a9c14-3d5b-4a7e-9f01-2c8b6de41a77",
  "channel": "telegram",
  "customer": "b91d4e7a-55c2-4f18-8a3d-0e7c9b21f640",
  "customer_name": "Dilnoza Karimova",
  "employee": "2c7e1f90-84ab-4c3d-9b52-6f0a3d18e4c1",
  "employee_name": "Sardor Rustamov",
  "attribution_source": "manual",
  "started_at": "2026-07-28 09:14:02",
  "last_message_at": "2026-07-28 09:41:37",
  "closed_at": "2026-07-28 11:41:37",
  "is_legacy": false,
  "first_response_seconds": 42.0,
  "avg_response_seconds": 118.5,
  "score": 61,
  "outcome": "sotilmadi",
  "customer_sentiment": "negative",
  "needs_review": true
}
```

> The response is serialized from the freshly saved instance, so the analysis columns
> (`score`, `outcome`, …) come from the annotated queryset the object was loaded with.

**Errors** — `400 validation_error` with:

| `code` | `attr` | Cause |
|---|---|---|
| `required` | `employee` | Field missing |
| `does_not_exist` | `employee` | No employee with that id |
| `employee_other_company` | `employee` | Employee belongs to another company |

Plus `401`, `403` (`HasCompany` or `IsManagerRole` — message
`"This action requires a manager role."`), `404` (conversation out of scope).

### POST /api/v1/chats/conversations/{id}/override

**What it does.** A manager correcting an AI conclusion — the outcome, the 0–100 score,
or the primary lost-reason. Strictly **append-only**: the `AnalysisResult` row is never
touched; a new `ManagerOverride` is written and the newest override per field becomes
the `effective_*` value that dashboards count and that calibration learns from. Sending
the same field twice is legal and simply supersedes the earlier correction.

**Auth & permissions.** `IsAuthenticated` + `HasCompany` + **`IsManagerRole`**.

**Path params**

| Name | Type | Required | Default | Description |
|---|---|---|---|---|
| `id` | uuid | yes | — | Conversation id |

**Request body** (`application/json`)

```json
{
  "field": "outcome",
  "value": "noaniq"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `field` | enum | **yes** | `outcome`, `score`, or `primary_reason` (`employee` is **not** accepted here — use `POST /api/v1/chats/conversations/{id}/assign`) |
| `value` | string | **yes** | Non-blank; always a **string**, whitespace-trimmed server-side |

`value` rules per `field`:

| `field` | Accepted `value` | Example |
|---|---|---|
| `outcome` | one of `sotildi`, `sotilmadi`, `noaniq` | `"noaniq"` |
| `score` | digits only, integer `0..100` — **as a string** | `"70"` |
| `primary_reason` | a `Reason.code` available to this company (global or company-specific) | `"qimmat"` |

> `score` is a string, not a number: `{"field": "score", "value": 70}` is coerced by DRF
> to `"70"` and works, but send the string form to stay explicit. `"70.5"` fails.
> For `primary_reason` you send the reason **code**, while the list filter `?reason=`
> takes the reason **UUID**.

**Response `200`** — the full `ConversationDetail` payload (same shape as
`GET /api/v1/chats/conversations/{id}`), re-read from the annotated queryset so
`effective_outcome` / `effective_score` / `effective_reason` and `overrides` already
reflect the new correction. Re-render the detail screen straight from it — no refetch
needed.

**Errors** — `400 validation_error` with:

| `code` | `attr` | Cause |
|---|---|---|
| `required` | `field` / `value` | Missing |
| `invalid_choice` | `field` | Not one of the three allowed fields |
| `blank` | `value` | Empty string |
| `invalid_outcome` | `non_field_errors` | `field=outcome` and the value is not an `Outcome` |
| `invalid_score` | `non_field_errors` | `field=score` and the value is not an integer `0..100` |
| `invalid_reason_code` | `non_field_errors` | `field=primary_reason` and no such reason code for this company |

Plus `401`, `403` (no company / not a manager), `404` (conversation out of scope).

## Customers

A `Customer` is an identity on **one** channel. The same human on Telegram and Instagram
is two rows until a manager merges them — there is no automatic matching in v1.

### GET /api/v1/chats/customers

**What it does.** The customer directory: the search-and-pick list behind "who is this
person", and the picker used to choose a merge target.

**Auth & permissions.** `IsAuthenticated` + `HasCompany`, company scoped. An
employee-cabinet user sees only customers they actually handled (scoped through
`conversations__employee_id`, de-duplicated).

**Query params**

Pagination — `LimitOffsetPagination`, `PAGE_SIZE = 100`.

| Name | Type | Required | Default | Description |
|---|---|---|---|---|
| `limit` | integer | no | `100` | Rows per page |
| `offset` | integer | no | `0` | Index of the first row |
| `channel` | enum | no | — | `telegram` / `instagram` / `web` |
| `search` | string | no | — | Case-insensitive contains over `display_name`, `username`, `external_id`, `phone` |
| `ordering` | string | no | model default (unordered) | No explicit `ordering_fields`, so DRF allows the serializer's model fields: `id`, `channel`, `external_id`, `display_name`, `username`, `phone`, `merged_into`, `created_at`; prefix `-` for descending |

**Request body.** None.

**Response `200`**

```json
{
  "count": 1289,
  "next": "https://monitoring.jakhongir.dev/api/v1/chats/customers?limit=100&offset=100",
  "previous": null,
  "results": [
    {
      "id": "b91d4e7a-55c2-4f18-8a3d-0e7c9b21f640",
      "channel": "telegram",
      "external_id": "512338901",
      "display_name": "Dilnoza Karimova",
      "username": "dilnoza_k",
      "phone": "+998901234567",
      "merged_into": null,
      "merged_customers": ["df31a05c-9b6e-4a22-88d7-31c0f47b9e15"],
      "created_at": "2026-06-11 14:02:55"
    },
    {
      "id": "df31a05c-9b6e-4a22-88d7-31c0f47b9e15",
      "channel": "instagram",
      "external_id": "17841400000000001",
      "display_name": "dilnoza.k",
      "username": "dilnoza.k",
      "phone": "",
      "merged_into": "b91d4e7a-55c2-4f18-8a3d-0e7c9b21f640",
      "merged_customers": [],
      "created_at": "2026-06-28 10:44:19"
    }
  ]
}
```

Field notes:

- `merged_into: null` ⇒ this row is **canonical** and is what statistics count.
  Non-null ⇒ absorbed; show it as an alias of the target and hide it from pickers.
- `merged_customers` is a flat array of UUID strings — the identities absorbed **into**
  this one. Chains are always exactly one hop deep (the merge endpoint flattens them).
- `display_name`, `username`, `phone` are `""` when unknown, never `null`.
- `external_id` is the channel-side id (Telegram user id, Instagram IGSID, widget
  visitor id) and is unique per `(company, channel)`.

**Errors.** `401`, `403` (no company), `400` on an invalid `channel` value.

### GET /api/v1/chats/customers/{id}

**What it does.** One customer identity plus the identities merged into it — the header
of a customer profile panel.

**Auth & permissions.** Same as the list, including employee self-scoping.

**Path params**

| Name | Type | Required | Default | Description |
|---|---|---|---|---|
| `id` | uuid | yes | — | Customer id |

**Request body.** None.

**Response `200`** — a single `CustomerModel` object, exactly one element of the
`results` array above:

```json
{
  "id": "b91d4e7a-55c2-4f18-8a3d-0e7c9b21f640",
  "channel": "telegram",
  "external_id": "512338901",
  "display_name": "Dilnoza Karimova",
  "username": "dilnoza_k",
  "phone": "+998901234567",
  "merged_into": null,
  "merged_customers": ["df31a05c-9b6e-4a22-88d7-31c0f47b9e15"],
  "created_at": "2026-06-11 14:02:55"
}
```

**Errors.** `401`, `403` (no company), `404` (unknown id / other tenant / not handled by
this employee-cabinet user).

### POST /api/v1/chats/customers/{id}/merge

**What it does.** Manual cross-channel identity merge: folds the customer in the path
(**the source**) into the customer named in the body (**the target**). Nothing is
rewritten — the source keeps its conversations and messages — but it stops counting
separately in statistics. Anything already pointing at the source is re-pointed at the
target, so merge chains stay exactly one hop deep.

**Auth & permissions.** `IsAuthenticated` + `HasCompany` + **`IsManagerRole`**. The
target must be in the caller's company.

**Path params**

| Name | Type | Required | Default | Description |
|---|---|---|---|---|
| `id` | uuid | yes | — | Source customer — the one being absorbed |

**Request body** (`application/json`)

```json
{
  "into": "b91d4e7a-55c2-4f18-8a3d-0e7c9b21f640"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `into` | uuid | **yes** | Target customer id — must be canonical (`merged_into == null`) and in the same company |

**Response `200`** — the **target** customer (not the source), with the source now
listed in `merged_customers`:

```json
{
  "id": "b91d4e7a-55c2-4f18-8a3d-0e7c9b21f640",
  "channel": "telegram",
  "external_id": "512338901",
  "display_name": "Dilnoza Karimova",
  "username": "dilnoza_k",
  "phone": "+998901234567",
  "merged_into": null,
  "merged_customers": ["df31a05c-9b6e-4a22-88d7-31c0f47b9e15"],
  "created_at": "2026-06-11 14:02:55"
}
```

> `merged_customers` on the returned target is serialized from a prefetch taken before
> the merge, so the just-absorbed id may be missing from this one response. Refetch
> `GET /api/v1/chats/customers/{target_id}` if you render that array immediately.

**Errors** — `400 validation_error` with:

| `code` | `attr` | Cause |
|---|---|---|
| `required` | `into` | Field missing |
| `does_not_exist` | `into` | No customer with that id |
| `customer_other_company` | `into` | Target belongs to another company |
| `merge_target_not_canonical` | `into` | Target is itself already merged into someone else — merge into the canonical record instead |
| `merge_cycle` | `non_field_errors` | The target is already merged into the source (would form a cycle) |
| `merge_self` | `non_field_errors` | `into` equals the path id |

Plus `401`, `403` (no company / not a manager), `404` (source customer out of scope).

## Message audio

### GET /api/v1/chats/messages/{id}/audio

**What it does.** Streams the stored recording of a voice message so the conversation
view can play it next to its transcript. This route exists precisely so the raw storage
URL is never handed out: under `MEDIA_URL` (or a public bucket) that path would be
unauthenticated and guessable, exposing customers' voice recordings. Always use the
`audio_url` field from the message serializer — never construct a media path yourself.

**Auth & permissions.** `IsAuthenticated` + `HasCompany` (this is a plain `APIView`, not
the scoped viewset, so scoping is applied explicitly): the message must belong to the
caller's company **and** have a non-empty `audio_file`. A non-manager user who is linked
to an `Employee` additionally only reaches audio from conversations assigned to them —
the same restriction the conversation endpoints apply. No manager role is required to
listen; this is a read.

**Path params**

| Name | Type | Required | Default | Description |
|---|---|---|---|---|
| `id` | uuid | yes | — | `RawMessage` id (the `id` of the message row, not the conversation) |

**Query params.** None.

**Request body.** None.

**Response `200`** — the raw audio bytes, **not** JSON.

```http
HTTP/1.1 200 OK
Content-Type: audio/ogg
Content-Length: 18342
Content-Disposition: inline; filename="34cd56ef-7801-49a2-b3c4-d5e6f7081920.ogg"
```

Streaming behaviour:

- Served by Django's `FileResponse` — a **streaming** response, chunked from storage,
  with `Content-Disposition: inline` and a filename derived from the stored file name.
- `Content-Type` is guessed from that filename (Telegram voice notes are typically
  `audio/ogg`; other channels may yield `audio/mpeg` / `audio/mp4`).
- **HTTP `Range` requests are not supported** — the response is always the whole file.
  A native `<audio src>` will therefore play but may not seek reliably. If you need a
  scrub bar, `fetch()` the URL with your auth header, turn the response into a
  `Blob`, and feed `URL.createObjectURL(blob)` to the player.
- Because auth is required, a bare `<audio src="{audio_url}">` only works with
  cookie/session auth. With JWT you must fetch-and-blob as above.

Transcripts and audio are independent columns on the same message: `transcript` is the
STT output that the AI actually reads, `audio_file` is what a human listens to. A voice
message can have audio with an empty transcript (STT pending, or it gave up after
repeated silent/corrupt attempts). Render the player from `has_audio` and the text from
`transcript`, independently.

**Errors.**

| Status | `code` | Cause |
|---|---|---|
| `400` | `audio_not_found` | No such message id **in your scope**, or the message has no stored audio. This is deliberately a `ValidationError` — do **not** expect `404` here. |
| `401` | — | Unauthenticated |
| `403` | — | `HasCompany` failed (user not attached to a company) |

The `400` body is the standard error envelope from `01-conventions.md`:

```json
{
  "type": "validation_error",
  "errors": [
    {"code": "audio_not_found", "detail": "Audio not found.", "attr": null}
  ]
}
```

## Frontend notes

**Building the conversation detail view.** Two requests in parallel:
`GET /api/v1/chats/conversations/{id}` (analysis, effective values, overrides, agreements) and
`GET /api/v1/chats/conversations/{id}/messages?limit=100`. Layout: transcript on the left,
analysis panel on the right. Guard the whole analysis panel on `analysis !== null` —
legacy/backfilled conversations are never auto-scored and will always be `null`.
Show `effective_*` as the primary values with the AI's originals as secondary text, and
render `overrides` as a "correction history" strip. After `POST /api/v1/chats/conversations/{id}/override` or
`POST /api/v1/chats/conversations/{id}/assign`, both responses already contain the fresh state — replace the cached
object instead of refetching.

**Pagination strategy for long threads.** Messages are ascending by `sent_at` with
`PAGE_SIZE = 100`. For a chat UI you usually want the *newest* messages first on screen:
read `count` from the first request, then request the last page with
`offset = max(0, count - limit)` and prepend earlier pages as the user scrolls up (walk
`offset` backwards by `limit`). `next`/`previous` are absolute URLs — following them
directly is the safest way to page. For conversation and customer lists, plain
forward `limit`/`offset` paging with `count` for the total is fine; keep `limit` at or
below 100.

**Polling / refresh.** Nothing here is push-based. Open conversations
(`closed_at == null`) change as messages arrive — poll the message endpoint every
~15–30 s while a live conversation is on screen, and the list every ~60 s if you show a
live queue (`?unassigned=true`). Analysis is produced asynchronously: the realtime pass
lands shortly after a conversation closes and the batch pass overnight, so a conversation
that shows `score: null` right after closing will fill in later — poll the detail
endpoint sparingly (a minute or more) rather than tightly, and never block the UI on it.
Customers change only when someone merges them; no polling needed.

**Role-aware UI.** Hide the assign/override/merge affordances unless the user's role is
`owner`, `admin` or `manager` — the API returns `403` otherwise. Employee-cabinet users
silently see a smaller dataset (their own conversations and the customers they handled),
so an "empty list" for them is normal, not an error.

**Null discipline.** `score`, `outcome`, `customer_sentiment`, `needs_review`,
`first_response_seconds`, `avg_response_seconds`, `closed_at`, `transcript_confidence`
and `effective_*` are all legitimately `null`. Never coerce them to `0` or to a default
enum value — "not scored yet" and "scored zero" are different facts throughout this
product. String fields (`display_name`, `transcript`, `transcript_source`,
`detected_language`, `attribution_source`) use `""` for the same idea instead.
