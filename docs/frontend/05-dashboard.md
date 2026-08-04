# Dashboard — analytics read API

Everything under `/api/v1/dashboard/` is **read-only aggregate data** over analysed
conversations. Nothing here writes; nothing here is per-user — the numbers are the
tenant's numbers, computed server-side from `AnalysisResult`.

This page covers the eleven statistics endpoints. The attention queue, AI narration,
free-form ask and Excel exports (`/api/v1/dashboard/signals`, `/api/v1/dashboard/signals/resolve`, `/api/v1/dashboard/insights`, `/api/v1/dashboard/ask`,
`/api/v1/dashboard/exports`) live in [`06-dashboard-insights.md`](./06-dashboard-insights.md).
Auth headers, pagination and the error envelope are in
[`01-conventions.md`](./01-conventions.md).

## Endpoints at a glance

| Endpoint | Powers | Shape |
|---|---|---|
| `GET /api/v1/dashboard/overview` | KPI header cards + period deltas | object |
| `GET /api/v1/dashboard/timeseries` | Volume & quality line chart | object |
| `GET /api/v1/dashboard/criteria` | Rubric radar / strengths & weaknesses | object |
| `GET /api/v1/dashboard/employees` | Employee league table | **array** |
| `GET /api/v1/dashboard/employees/{id}` | One employee's card | object |
| `GET /api/v1/dashboard/departments` | Department league table ("bo'lim balli") | **array** |
| `GET /api/v1/dashboard/me` | Employee cabinet (own card) | object |
| `GET /api/v1/dashboard/products` | Top lost opportunities | **array** |
| `GET /api/v1/dashboard/reasons` | Lost-reason shares + emerging themes | object |
| `GET /api/v1/dashboard/funnel` | Sales-script funnel | object |
| `GET /api/v1/dashboard/agreements` | Promises board ("kelishuvlar") | object |

Array endpoints return a bare JSON array — **not** a paginated `{count, results}`
envelope.

---

## Rules that govern every number

Read these once; they explain most of the fields below.

**1. `null` is never `0`.** Any absent measurement is `null`: a day with no scored
conversation has `avg_score: null`, a metric with no previous-period baseline has a
`null` delta. Render `null` as `—`, never as `0`, and break the chart line rather than
dropping it to the axis. `0` always means "measured, and it was zero".

**2. The averaging rule: every average is a mean over conversations.** An employee's
`avg_score` is the mean over that employee's scored conversations; a daily point is the
mean over that day's. There is no mean-of-means anywhere, so the same question always
returns the same number no matter which widget asks it. Do **not** re-average values the
API already averaged (e.g. averaging the `series[]` points will not reproduce
`overview.avg_score`).

**3. `canonical_results` — what you are actually seeing.** `AnalysisResult` is
append-only: a conversation can have a realtime (Flash) row, a batch (Pro) row, and one
row per re-run. Every aggregate first collapses to **one canonical row per
conversation** — newest *batch* row, else newest *realtime* row. On top of that,
outcome and lost-reason are resolved through manager overrides:
`effective_outcome` / `effective_reason_id` = the newest manager correction if one
exists, else the AI's value. So a manager correcting "sotilmadi → sotildi" moves the
conversion rate, the product widget and the reason shares — not just the conversation
detail. (Score overrides are the exception: they show on the conversation detail as
`effective_score`, but aggregates average the AI score.)

**4. Score scale: integer `0–100`.** Per spec bands, `0–49` is the "Yomon" band that
raises the `low_score` signal. Rubric sub-scores are also `0–100` each. Averages come
back rounded to 1 decimal.

**5. Time axis = `Conversation.closed_at`.** Open conversations are never counted — they
have no final score. Never ingest or extraction time, so scoring six months of backfilled
history does not dump six months of chats onto today's window.

**6. `samples` rides along.** Averages carry the count they rest on. Criterion averages
in particular cover only **batch-analysed** conversations (Flash rows have no
sub-scores), so `samples` can be much lower than `conversations`. League-table ranking is
suppressed (`rank: null`, `is_ranked: false`) below **5** scored conversations.

**7. Legacy (backfilled) history**, where the employee is unknown, is **excluded** from
employee/score analytics and **included** in product/reason analytics — the customer's
words about the product stay valid even when the employee isn't known.

**8. People counts are people.** `customers` on the product and reason widgets is
`COUNT(DISTINCT customer)`, not conversations, and merged identities collapse to their
surviving row.

**9. Caching — expect up to 120s of staleness.** Every endpoint on this page except
`/api/v1/dashboard/me` is cached for **120 seconds**, keyed on **tenant + query params**
(never per user). Two managers in the same company asking the same window share one
entry. Consequences for the frontend:
- After a manager writes an override / assignment, the dashboard may show the old number
  for up to two minutes. Say "updating…" rather than retrying in a loop.
- Cache-busting by changing a query param works but pollutes the shared cache — don't.
- `/api/v1/dashboard/me` is uncached and always current.

---

## Common filter params

Every endpoint on this page accepts these three. Per-endpoint extras are listed under
that endpoint as **Additional params**.

| Name | Type | Required | Default | Description |
|---|---|---|---|---|
| `date_from` | ISO 8601 date-time | no | `date_to − 30 days` | Window start, inclusive, matched on `Conversation.closed_at`. |
| `date_to` | ISO 8601 date-time | no | now | Window end, inclusive. |
| `confirmed` | boolean | no | `false` | Two-layer statistics: when `true`, restrict to conversations whose outcome a manager actually validated. It narrows **coverage**, it never changes which value is counted. |

The "previous period" used for deltas is the equal-length window immediately before,
half-open: `[start − (end − start), start)`.

---

## Overview & trends

### GET /api/v1/dashboard/overview

**What it does.** Powers the KPI header of the main dashboard: how many conversations
closed, how many we managed to score, the average quality score, the sold / not-sold /
unclear split, conversion rate, angry customers, first-response time, and the agreements
tally — each with its movement against the equal-length previous period.

**Auth & permissions.** `IsAuthenticated` + `HasCompany` + `ManagerDashboardAccess`.
Owner / admin / manager always pass; a viewer-role user *not* linked to an employee also
passes (read-only stakeholder). **A user linked to an `Employee` gets `403` here** — they
are the employee cabinet and may only call `/api/v1/dashboard/me`.

**Query params.** [Common filter params](#common-filter-params) only.

**Response** `200`

```json
{
  "period": {
    "date_from": "2026-06-29T00:00:00Z",
    "date_to": "2026-07-29T00:00:00Z",
    "previous_date_from": "2026-05-30T00:00:00Z",
    "previous_date_to": "2026-06-29T00:00:00Z"
  },
  "conversations": 1284,
  "scored": 1147,
  "unscored": 137,
  "unassigned": 42,
  "scoring_coverage": 89.3,
  "avg_score": 72.4,
  "sold": 318,
  "not_sold": 604,
  "unclear": 225,
  "angry_customers": 37,
  "conversion_rate": 34.5,
  "avg_first_response_seconds": 214.7,
  "agreements": { "taken": 96, "fulfilled": 61, "forgotten": 18 },
  "previous": {
    "conversations": 1102,
    "scored": 980,
    "avg_score": 69.8,
    "sold": 265,
    "conversion_rate": 31.2,
    "avg_first_response_seconds": 260.1
  },
  "deltas": {
    "conversations_percent": 16.5,
    "scored_percent": 17.0,
    "sold_percent": 20.0,
    "avg_score_points": 2.6,
    "conversion_rate_points": 3.3,
    "first_response_percent": -17.5
  }
}
```

Field notes:
- `scoring_coverage` — `scored / conversations × 100`. **Every average on this dashboard
  is over `scored`, not over `conversations`** — show this next to `avg_score` so the
  reader knows what the number speaks for.
- `deltas` — **counts move in percent** (`*_percent`), **0–100 scales move in points**
  (`avg_score_points`, `conversion_rate_points`). `first_response_percent` is a percent
  because seconds have no fixed scale; **negative = got faster** (good).
- Any delta is `null` when the previous period had no baseline — render `—`, never
  "+100%".
- `conversion_rate` = `sold / (sold + not_sold) × 100`; `unclear` is excluded from the
  denominator. `null` when nothing was decided.
- `avg_first_response_seconds` — deterministic, no LLM: first customer message → first
  reply. A fully unanswered chat contributes `null`, not `0`.

**Errors.** `400 period_invalid` (`date_from` after `date_to`), `401` unauthenticated,
`403` employee-linked user or user without a company. Envelope per
[`01-conventions.md`](./01-conventions.md).

---

### GET /api/v1/dashboard/timeseries

**What it does.** The two lines every dashboard opens with — conversation volume and
average score over time, bucketed by day or week. Passing `product` and/or `reason`
turns it into the drill-down trend chart ("Turkey tour × price, over time"); both lines
then cover only conversations whose canonical analysis matched that product/reason,
**legacy history included**, exactly like the product widget it drills out of.

**Auth & permissions.** Same as `/api/v1/dashboard/overview` (employee-linked users → `403`).

**Additional params**

| Name | Type | Required | Default | Description |
|---|---|---|---|---|
| `granularity` | enum `day` \| `week` | no | `day` | Bucket size. Week buckets start on Monday. |
| `product` | uuid | no | — | Narrow both lines to one catalog product. |
| `reason` | uuid | no | — | Narrow both lines to one lost-reason. |

Max **400** buckets per request — a longer window is rejected rather than truncated
(a silently trimmed chart would disagree with the totals rendered beside it).

**Response** `200`

```json
{
  "granularity": "day",
  "series": [
    { "date": "2026-07-27", "conversations": 48, "scored": 44, "avg_score": 71.2,
      "sold": 12, "not_sold": 21, "unclear": 11 },
    { "date": "2026-07-28", "conversations": 0,  "scored": 0,  "avg_score": null,
      "sold": 0,  "not_sold": 0,  "unclear": 0 },
    { "date": "2026-07-29", "conversations": 53, "scored": 50, "avg_score": 74.9,
      "sold": 19, "not_sold": 20, "unclear": 11 }
  ]
}
```

Every bucket in the window is present, including empty ones — no gaps to fill client-side.
`avg_score: null` on an empty bucket must break the line, not plot zero. When `product`
or `reason` is set, `conversations` equals `scored` (a dimension only exists on scored
rows).

**Errors.** `400 period_too_long` (bucket count > 400 — offer the user `granularity=week`
or a shorter range), `400 period_invalid`, `401`, `403`.

---

### GET /api/v1/dashboard/criteria

**What it does.** The company's rubric profile: the average per scoring criterion, plus
the derived top-3 strengths and bottom-3 weaknesses — "what do we coach next quarter".
Powers the radar/bar chart and the two short lists beside it.

**Auth & permissions.** Same as `/api/v1/dashboard/overview` (employee-linked users → `403`).

**Query params.** [Common filter params](#common-filter-params) only.

The seven rubric criteria (stable keys, each `0–100`):
`rule_adherence`, `response_speed`, `tone`, `needs_discovery`, `objection_handling`,
`closing`, `promise_fulfillment`. `label` is an English fallback
(`objection_handling` → `Objection handling`) — **localise on the key**, not the label.

**Response** `200`

```json
{
  "criteria": [
    { "key": "tone",                "label": "Tone",                "avg_score": 84.1, "samples": 902 },
    { "key": "rule_adherence",      "label": "Rule adherence",      "avg_score": 79.6, "samples": 902 },
    { "key": "response_speed",      "label": "Response speed",      "avg_score": 74.0, "samples": 902 },
    { "key": "promise_fulfillment", "label": "Promise fulfillment", "avg_score": 70.2, "samples": 902 },
    { "key": "needs_discovery",     "label": "Needs discovery",     "avg_score": 63.5, "samples": 902 },
    { "key": "closing",             "label": "Closing",             "avg_score": 58.8, "samples": 902 },
    { "key": "objection_handling",  "label": "Objection handling",  "avg_score": 51.3, "samples": 902 }
  ],
  "strengths": [
    { "key": "tone",           "label": "Tone",           "avg_score": 84.1, "samples": 902 },
    { "key": "rule_adherence", "label": "Rule adherence", "avg_score": 79.6, "samples": 902 },
    { "key": "response_speed", "label": "Response speed", "avg_score": 74.0, "samples": 902 }
  ],
  "weaknesses": [
    { "key": "objection_handling", "label": "Objection handling", "avg_score": 51.3, "samples": 902 },
    { "key": "closing",            "label": "Closing",            "avg_score": 58.8, "samples": 902 },
    { "key": "needs_discovery",    "label": "Needs discovery",    "avg_score": 63.5, "samples": 902 }
  ]
}
```

`criteria` is sorted best → worst, with `avg_score: null` rows last. `weaknesses` is
worst-first. A criterion with no samples (`avg_score: null`, `samples: 0`) is not
evidence and appears in neither list. **`samples` is the batch-analysed subset**, so it
is normally lower than `overview.scored` — surface it in the tooltip.

**Errors.** `400 period_invalid`, `401`, `403`.

---

## People

### GET /api/v1/dashboard/employees

**What it does.** The league table ("kim o'syapti, kim tushyapti"): every employee with
their average score, movement vs the previous period, rule violations, outcome split,
conversion and response time. `?criterion=` re-ranks the table on a single rubric
criterion instead of the overall score — the most useful coaching view ("who is weakest
at objection handling"). Legacy history is excluded: we can't tell who handled it.

**Auth & permissions.** Same as `/api/v1/dashboard/overview` (employee-linked users → `403` — an employee
never sees the league table; they see `/api/v1/dashboard/me`).

**Additional params**

| Name | Type | Required | Default | Description |
|---|---|---|---|---|
| `criterion` | enum | no | — | One of `rule_adherence`, `response_speed`, `tone`, `needs_discovery`, `objection_handling`, `closing`, `promise_fulfillment`. Switches `avg_score` / `score_delta` / `samples` from the overall score to that criterion. |

**Response** `200` — a bare array, already sorted: ranked employees first (best score
first), then unranked ones, ties broken by name.

```json
[
  {
    "rank": 1,
    "is_ranked": true,
    "employee": "3f0c2a5e-9a71-4d02-8f6a-1c2f77a1b901",
    "employee_name": "Dilnoza Karimova",
    "department": "Sotuv",
    "conversations": 214,
    "avg_score": 81.7,
    "samples": 214,
    "score_delta": 3.4,
    "violations": 6,
    "sold": 74,
    "not_sold": 96,
    "unclear": 44,
    "conversion_rate": 43.5,
    "avg_response_seconds": 168.2
  },
  {
    "rank": null,
    "is_ranked": false,
    "employee": "8bb1c0d4-2f6e-4a17-9de2-55a0f3c19c7d",
    "employee_name": "Yangi Xodim",
    "department": "",
    "conversations": 3,
    "avg_score": 88.0,
    "samples": 3,
    "score_delta": null,
    "violations": 0,
    "sold": 1,
    "not_sold": 1,
    "unclear": 1,
    "conversion_rate": 50.0,
    "avg_response_seconds": null
  }
]
```

Field notes:
- `rank: null` / `is_ranked: false` — fewer than **5** scored conversations. Still listed
  with their score; render them in a separate "not enough data to rank" block and never
  show a medal. Note the second row above: 88.0 on 3 conversations is *not* #1.
- `department` is `""` (empty string, not `null`) when unset — label it "No department".
- `score_delta` — points vs the previous equal-length period; `null` when there is no
  baseline.
- `violations` — count of conversations with at least one rule violation.
- `avg_response_seconds` — mean over answered customer runs; `null` when nothing was
  answered.

**Errors.** `400` invalid `criterion` (not in the enum), `400 period_invalid`, `401`,
`403`.

---

### GET /api/v1/dashboard/employees/{id}

**What it does.** One employee's card, reached by clicking a row of the league table:
rank within the company, workload, response times, daily score trend, rubric profile with
strengths/weaknesses, their own funnel, agreements tally, best and worst conversations
(with ids to open), and the coaching lines the batch analyst wrote for them.

**Auth & permissions.** Same as `/api/v1/dashboard/overview` (employee-linked users → `403`; they get the
same payload for themselves from `/api/v1/dashboard/me`). `{id}` is the `Employee` UUID and must
belong to the caller's company — otherwise it is reported as not found.

**Query params.** [Common filter params](#common-filter-params) only. (`criterion` is
**not** accepted here — the full rubric is in `criteria[]`.)

**Response** `200`

```json
{
  "employee": "3f0c2a5e-9a71-4d02-8f6a-1c2f77a1b901",
  "period": { "date_from": "2026-06-29T00:00:00Z", "date_to": "2026-07-29T00:00:00Z" },
  "rank": 1,
  "ranked_total": 12,
  "handled_conversations": 214,
  "conversations": 214,
  "avg_score": 81.7,
  "avg_conversations_per_day": 6.9,
  "avg_first_response_seconds": 143.5,
  "avg_response_seconds": 168.2,
  "violations": 6,
  "sold": 74,
  "not_sold": 96,
  "unclear": 44,
  "conversion_rate": 43.5,
  "agreements": { "taken": 22, "fulfilled": 15, "forgotten": 3 },
  "daily": [
    { "date": "2026-07-27", "avg_score": 79.0, "conversations": 8 },
    { "date": "2026-07-28", "avg_score": null, "conversations": 0 },
    { "date": "2026-07-29", "avg_score": 84.5, "conversations": 11 }
  ],
  "criteria": [
    { "key": "tone", "label": "Tone", "avg_score": 88.0, "samples": 190 },
    { "key": "objection_handling", "label": "Objection handling", "avg_score": 54.2, "samples": 190 }
  ],
  "strengths": [
    { "key": "tone", "label": "Tone", "avg_score": 88.0, "samples": 190 }
  ],
  "weaknesses": [
    { "key": "objection_handling", "label": "Objection handling", "avg_score": 54.2, "samples": 190 }
  ],
  "funnel": {
    "analyzed": 190,
    "stages": [
      { "stage": "greeting", "reached": 188, "success": 180, "drop_off": 4, "neutral": 4,
        "not_reached": 2, "success_percent": 94.7, "drop_off_percent": 2.1,
        "neutral_percent": 2.1, "not_reached_percent": 1.1,
        "drop_notes": [], "drop_conversations": [] }
    ]
  },
  "best_conversations": [
    { "conversation": "b21f8b7c-4c31-4f2e-9b6a-0d2c9f1a7e30", "score": 98,
      "customer_name": "Aziz", "closed_at": "2026-07-21T14:03:11Z" }
  ],
  "worst_conversations": [
    { "conversation": "17ac9e02-5b12-4d88-a0f1-6ee42c0f9a55", "score": 31,
      "customer_name": null, "closed_at": "2026-07-08T09:41:02Z" }
  ],
  "coaching": [
    "Narx e'tiroziga javob berishdan oldin mijozning byudjetini so'rang.",
    "Suhbat oxirida keyingi qadamni aniq belgilang."
  ]
}
```

Field notes:
- `handled_conversations` — closed conversations assigned to them; `conversations` —
  those that have a canonical analysis row. The difference is the unscored tail.
- `rank` / `ranked_total` — position among *ranked* employees only; `rank: null` when
  below the 5-conversation floor.
- `avg_conversations_per_day` = `handled_conversations / days in window`, 2 decimals.
- `daily` covers every day in the window; empty days are `avg_score: null`,
  `conversations: 0`. (Same 400-bucket ceiling applies.)
- `best_conversations` / `worst_conversations` — up to **5** each,
  `customer_name` may be `null`. `conversation` is the id to navigate to the chat detail.
- `coaching` — up to 20 most recent one-liners, newest first.
- `funnel` is the same object as [`GET /api/v1/dashboard/funnel`](#get-apiv1dashboardfunnel), scoped
  to this employee.

**Errors.** `400 employee_not_found` (unknown id, or an employee from another company —
returned as a `400` validation error, not a bare `404`), `400 period_invalid`, `401`,
`403`.

---

### GET /api/v1/dashboard/departments

**What it does.** The same league one level up — "bo'lim balli", grouped by
`Employee.department`. Powers the department comparison table on the team screen.

**Auth & permissions.** Same as `/api/v1/dashboard/overview` (employee-linked users → `403`).

**Query params.** [Common filter params](#common-filter-params) only.

**Response** `200` — a bare array, sorted by `avg_score` descending.

```json
[
  {
    "department": "Sotuv",
    "employees": 7,
    "conversations": 812,
    "avg_score": 76.3,
    "violations": 31,
    "sold": 244,
    "not_sold": 401,
    "unclear": 167,
    "conversion_rate": 37.8
  },
  {
    "department": "",
    "employees": 2,
    "conversations": 61,
    "avg_score": null,
    "violations": 0,
    "sold": 0,
    "not_sold": 0,
    "unclear": 61,
    "conversion_rate": null
  }
]
```

Employees with no department fall into a single `""` bucket — label it "No department".
There is no sample floor here (no `rank` / `is_ranked`), so treat a department with a tiny
`conversations` count with the same caution.

**Errors.** `400 period_invalid`, `401`, `403`.

---

### GET /api/v1/dashboard/me

**What it does.** The employee cabinet: the caller's own card and nothing about anyone
else. Same payload shape as `GET /api/v1/dashboard/employees/{id}`, resolved from the
`Employee` row linked to the authenticated user.

**Auth & permissions.** `IsAuthenticated` + `HasCompany` **only** — deliberately *not*
`ManagerDashboardAccess`. Any company user linked to an `Employee` may call it, including
managers who are also employees. This is the **one** dashboard endpoint an employee-linked
user can reach; the restriction is enforced on the data endpoints too
(`/api/v1/chats/conversations`, `/api/v1/chats/customers` narrow to their own rows), so it cannot be
stepped around.

**Caching.** Uncached — always current, unlike every other endpoint on this page.

**Query params.** [Common filter params](#common-filter-params) only.

**Response** `200` — identical schema to
[`GET /api/v1/dashboard/employees/{id}`](#get-apiv1dashboardemployeesid).

**Errors.** `400 no_employee_profile` — the authenticated user is not linked to an
`Employee`. Treat this as "you don't have a cabinet", not as an error toast: hide the
cabinet nav item for such users. Also `400 period_invalid`, `401`, `403` (no company).

---

## Product & funnel

### GET /api/v1/dashboard/products

**What it does.** "Top lost opportunities": for each product, how many **distinct
customers** were lost, broken down by reason, with a money valuation when the catalog
carries a price — and conversation ids per cell so every number opens the chats behind
it. Legacy history **is** included here.

**Auth & permissions.** Same as `/api/v1/dashboard/overview` (employee-linked users → `403`).

**Query params.** [Common filter params](#common-filter-params) only.

Scope: canonical rows whose `effective_outcome` is `sotilmadi` or `noaniq` **and** that
name a product. Top **20** products by customer count.

**Response** `200` — a bare array, most-lost first.

```json
[
  {
    "product": "c9d1a37e-77b2-4a2c-9f31-1e5f0b2c8a44",
    "product_name": "Turkiya turi (7 kun)",
    "currency": "UZS",
    "customers": 23,
    "lost_value": 184000000.0,
    "reasons": [
      {
        "reason": "5a2f9c11-3d80-41ab-b7c6-9de0f4a12b33",
        "code": "narx",
        "label": "Narx qimmat",
        "customers": 14,
        "conversations": [
          "b21f8b7c-4c31-4f2e-9b6a-0d2c9f1a7e30",
          "17ac9e02-5b12-4d88-a0f1-6ee42c0f9a55"
        ]
      },
      {
        "reason": "77b4e3d0-1a95-4c62-b0aa-2f9c6e18d477",
        "code": "boshqa",
        "label": "Boshqa",
        "customers": 9,
        "conversations": ["4d5e6f70-8a91-4b2c-9d3e-0f1a2b3c4d5e"]
      }
    ]
  }
]
```

Field notes:
- `customers` on the **product** is its own distinct-customer count — it is **not** the
  sum of `reasons[].customers` (one customer lost for two reasons is counted once at the
  product level). Never render the reasons as a "% of product total" that must add to 100.
- `lost_value` = `price × customers`, `null` when the catalog row has no price. Show `—`,
  not `0 UZS`. `currency` is the product's currency string (e.g. `"UZS"`).
- `conversations` — up to **5** evidence ids per (product, reason) cell, newest closed
  first. For the full list, navigate to the conversation list with
  `?product=&reason=`.
- Reason rows with no attributed reason are omitted; a product can therefore have an
  empty `reasons: []` while `customers > 0`.

**Errors.** `400 period_invalid`, `401`, `403`.

---

### GET /api/v1/dashboard/reasons

**What it does.** Why customers didn't buy, across all products: each reason's share of
the lost conversations, plus the free-text "boshqa" entries clustered into counted
emerging themes ("no delivery to Samarkand" ×7) instead of twenty scattered strings.
Legacy history is included.

**Auth & permissions.** Same as `/api/v1/dashboard/overview` (employee-linked users → `403`).

**Query params.** [Common filter params](#common-filter-params) only.

Reasons come from the company's taxonomy: the 8 global defaults plus the company's own
extensions. `code` is stable and safe to switch on (`boshqa` is the "Other" code);
`label` is the display string as configured.

**Response** `200`

```json
{
  "lost_conversations": 604,
  "reasons": [
    { "reason": "5a2f9c11-3d80-41ab-b7c6-9de0f4a12b33", "code": "narx",
      "label": "Narx qimmat", "conversations": 241, "customers": 198, "share": 39.9 },
    { "reason": "3c7d1e88-4b02-4f9a-8c11-6ab2e5d90f27", "code": "yetkazib_berish",
      "label": "Yetkazib berish", "conversations": 96, "customers": 91, "share": 15.9 },
    { "reason": "77b4e3d0-1a95-4c62-b0aa-2f9c6e18d477", "code": "boshqa",
      "label": "Boshqa", "conversations": 58, "customers": 55, "share": 9.6 }
  ],
  "emerging_feedback": [
    { "text": "Samarqandga yetkazib berish yo'q", "count": 7 },
    { "text": "Kredit imkoniyati kerak", "count": 4 }
  ]
}
```

Field notes:
- `lost_conversations` is the count of lost conversations **that carry an attributed
  reason** — it is the denominator of `share`, and is normally smaller than
  `overview.not_sold + overview.unclear`. Don't label it "all lost conversations".
- `share` is a percentage of that denominator, 1 decimal, `null` when nothing is
  attributed. Shares sum to ~100 (rounding aside).
- `conversations` counts chats, `customers` counts distinct people — show both; they
  answer different questions.
- `emerging_feedback` — up to 20 themes, most frequent first, clustered on normalised
  text over the 500 most recent free-text entries. This is a discovery list, not a
  statistic.

**Errors.** `400 period_invalid`, `401`, `403`.

---

### GET /api/v1/dashboard/funnel

**What it does.** The sales-script funnel ("skript tahlili"): for each stage of the
script, how conversations fared, and — for the drop-offs — why, from the analyst's notes,
with conversation ids to open. Powers the funnel chart plus the "top drop reasons" list
under each stage.

**Auth & permissions.** Same as `/api/v1/dashboard/overview` (employee-linked users → `403`).

**Query params.** [Common filter params](#common-filter-params) only.

Stages, always returned in script order:
`greeting` → `needs_discovery` → `offer` → `price` → `objection_handling` → `closing`.

Per-stage statuses: `success` (happened, customer moved on), `drop_off` (customer lost
**at** this stage), `neutral` (happened partially/weakly), `not_reached` (the
conversation never got this far).

**Response** `200`

```json
{
  "analyzed": 902,
  "stages": [
    {
      "stage": "greeting",
      "reached": 894,
      "success": 851,
      "drop_off": 19,
      "neutral": 24,
      "not_reached": 8,
      "success_percent": 94.3,
      "drop_off_percent": 2.1,
      "neutral_percent": 2.7,
      "not_reached_percent": 0.9,
      "drop_notes": [],
      "drop_conversations": ["b21f8b7c-4c31-4f2e-9b6a-0d2c9f1a7e30"]
    },
    {
      "stage": "price",
      "reached": 612,
      "success": 388,
      "drop_off": 171,
      "neutral": 53,
      "not_reached": 290,
      "success_percent": 43.0,
      "drop_off_percent": 19.0,
      "neutral_percent": 5.9,
      "not_reached_percent": 32.2,
      "drop_notes": [
        { "note": "mijoz narxni qimmat dedi", "count": 88 },
        { "note": "raqobatchi arzonroq taklif qilgan", "count": 31 }
      ],
      "drop_conversations": [
        "17ac9e02-5b12-4d88-a0f1-6ee42c0f9a55",
        "4d5e6f70-8a91-4b2c-9d3e-0f1a2b3c4d5e"
      ]
    }
  ]
}
```

Field notes:
- `analyzed` is the denominator of **all four** percentages: batch-analysed conversations
  that carry a funnel verdict. Only the Pro batch emits a funnel, so `analyzed` is lower
  than `overview.scored`. When `analyzed` is `0`, every `*_percent` is `null` — render
  "not enough analysed conversations", not a flat 0% funnel.
- `reached` = `success + drop_off + neutral` (everything except `not_reached`).
- The four `*_percent` values are shares of `analyzed` and sum to ~100 per stage — they
  are **not** conditional on `reached`.
- `drop_notes` — up to **5** most common notes for that stage, lowercased and
  whitespace-normalised when clustered.
- `drop_conversations` — up to **5** evidence ids per stage.

**Errors.** `400 period_invalid`, `401`, `403`.

---

### GET /api/v1/dashboard/agreements

**What it does.** The promises board ("kelishuvlar"): how many commitments were made,
kept, forgotten and are overdue, with the day-by-day line, the per-employee split ("kim
ko'p kelishuv oladi, kim ko'p unutadi") and the upcoming due list a manager works from.

**Auth & permissions.** Same as `/api/v1/dashboard/overview` (employee-linked users → `403`).

**Query params.** [Common filter params](#common-filter-params) only. Note: `confirmed`
is accepted for consistency but **does not affect** this endpoint — agreements are their
own fact rows and are not filtered by outcome validation.

Agreement statuses: `pending`, `fulfilled`, `forgotten`. Time axis is
`Agreement.occurred_at`.

**Response** `200`

```json
{
  "taken": 96,
  "pending": 17,
  "fulfilled": 61,
  "forgotten": 18,
  "overdue": 6,
  "fulfillment_rate": 77.2,
  "daily": [
    { "date": "2026-07-27", "taken": 4, "fulfilled": 3, "forgotten": 1 },
    { "date": "2026-07-28", "taken": 0, "fulfilled": 0, "forgotten": 0 },
    { "date": "2026-07-29", "taken": 5, "fulfilled": 2, "forgotten": 0 }
  ],
  "by_employee": [
    { "employee": "3f0c2a5e-9a71-4d02-8f6a-1c2f77a1b901",
      "employee_name": "Dilnoza Karimova",
      "taken": 22, "fulfilled": 15, "forgotten": 3 }
  ],
  "upcoming": [
    { "agreement": "0c3d5b7a-9e11-4f6b-8a2d-77c9e0f4b512",
      "conversation": "b21f8b7c-4c31-4f2e-9b6a-0d2c9f1a7e30",
      "text": "Ertaga soat 10 da narxlar ro'yxatini yuborish",
      "due_on": "2026-07-30",
      "employee_name": "Dilnoza Karimova" }
  ]
}
```

Field notes:
- `fulfillment_rate` = `fulfilled / (fulfilled + forgotten) × 100`; `pending` is excluded
  from the denominator, and the value is `null` when nothing is decided yet.
- `overdue` is a subset of `pending`: `due_on` is in the past (company-local date).
- `daily` covers every day in the window — always day granularity, no `granularity`
  param, and the 400-bucket ceiling applies.
- `by_employee` — agreements with no employee are omitted, so the `taken` column will not
  sum to the top-level `taken`.
- `upcoming` — up to **20** pending agreements with a due date, earliest first;
  `employee_name` may be `null`.

**Errors.** `400 period_invalid`, `401`, `403`.

---

## Errors

All endpoints use the shared error envelope described in
[`01-conventions.md`](./01-conventions.md); match on the machine-readable `code`, never
on the message text.

| Status | Code | When |
|---|---|---|
| `400` | `period_invalid` | `date_from` is after `date_to`. |
| `400` | `period_too_long` | `/api/v1/dashboard/timeseries` only: the window needs more than 400 buckets at the requested granularity. |
| `400` | `employee_not_found` | `/api/v1/dashboard/employees/{id}`: unknown employee, or one from another company. |
| `400` | `no_employee_profile` | `/api/v1/dashboard/me`: the caller isn't linked to an `Employee`. |
| `400` | *(field errors)* | Malformed `date_from`/`date_to`, unknown `criterion`, unknown `granularity`, non-UUID `product`/`reason` — reported per field. |
| `401` | — | Missing or expired token. |
| `403` | — | Employee-linked user hitting any endpoint other than `/api/v1/dashboard/me`; or an authenticated user with no company. |
| `404` | — | Wrong path only (note the routes have **no** trailing slash — `/api/v1/dashboard/overview/` 404s). |

Cross-company ids are reported as `400 employee_not_found`, never as `404` — the tenant
boundary never confirms that a resource exists elsewhere.

---

## Frontend notes

**Fetch in parallel per page.** These are independent GETs; fire them together.

| Page | Parallel fetch |
|---|---|
| Main dashboard | `/api/v1/dashboard/overview`, `/api/v1/dashboard/timeseries`, `/api/v1/dashboard/criteria`, `/api/v1/dashboard/funnel` |
| Team | `/api/v1/dashboard/employees`, `/api/v1/dashboard/departments` |
| Employee card | `/api/v1/dashboard/employees/{id}` (single call — funnel, criteria and agreements are embedded) |
| Product & feedback | `/api/v1/dashboard/products`, `/api/v1/dashboard/reasons` |
| Agreements | `/api/v1/dashboard/agreements` |
| Employee cabinet | `/api/v1/dashboard/me` (single call) |

Keep one shared period-filter state (`date_from`, `date_to`, `confirmed`) at the page
level and pass it to every request — mismatched windows across widgets on one screen is
the most common bug here.

**Drill-down navigation.** The ids in the payloads are the navigation graph:

- `/api/v1/dashboard/overview` → `/timeseries?product=&reason=` (trend for one dimension)
- `/api/v1/dashboard/employees` → `/employees/{employee}` → `best_conversations[].conversation` /
  `worst_conversations[].conversation` → conversation detail
- `/api/v1/dashboard/departments` → `/api/v1/dashboard/employees` filtered by that department (client-side on
  `department`)
- `/api/v1/dashboard/products` → `reasons[].conversations[]` → conversation detail; "see all" →
  conversation list with `?product=&reason=`
- `/api/v1/dashboard/funnel` → `stages[].drop_conversations[]` → conversation detail
- `/api/v1/dashboard/agreements` → `upcoming[].conversation` → conversation detail

Every conversation detail carries the quote behind the conclusion (`outcome_signal`,
`reason_evidence`) — link to it rather than explaining a number in a tooltip.

**Empty states.** Distinguish three cases and never collapse them into one:

1. **No data in the window** — `conversations: 0`, arrays empty. Say "no closed
   conversations in this period" and offer to widen the range.
2. **Data, but not scored** — `conversations > 0`, `scored: 0`, `avg_score: null`.
   Analysis hasn't run (or the tier doesn't score). Show the volume, show `—` for
   quality, and explain rather than showing an empty chart.
3. **Scored, but not batch-analysed** — `criteria[].samples: 0`, `funnel.analyzed: 0`.
   Only the Pro batch produces sub-scores and funnels. Hide the radar/funnel with a note,
   don't draw a zeroed one.

**Rendering rules to hard-code once:**
- A `null` numeric renders as `—`. A `null` in a chart series breaks the line.
- `rank: null` never gets a position badge; group unranked employees separately with
  "needs ≥5 conversations".
- `department: ""` renders as "No department"; `""` is not `null`.
- Deltas: `*_percent` are percentages, `*_points` are absolute points — don't append `%`
  to a points delta. On `first_response_percent`, negative is **good** (faster) — invert
  the colour.
- Cache staleness is up to 120s (except `/api/v1/dashboard/me`); after a manager writes a correction,
  refetch after ~2 minutes rather than immediately, and don't spam retries.
