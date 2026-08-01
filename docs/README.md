# Kotib Monitoring — Frontend API Documentation

Everything a frontend needs to build against the Kotib Monitoring backend: every
endpoint, what it does, what it accepts, what it filters on, and a realistic
request/response sample for each.

**Base URL: `https://monitoring.jakhongir.dev/api/v1`** — every application endpoint lives under
that prefix, and every path in these docs is written out in full.

---

## Read in this order

| # | Document | What's in it |
|---|---|---|
| 01 | **[Conventions](./01-conventions.md)** | Auth, tenancy, roles, pagination, filtering, date formats, the error envelope, CORS. **Read this first — the other docs assume it.** |
| 02 | **[Auth & accounts](./02-auth-and-accounts.md)** | Login, token refresh, health checks, company profile, current user, employees CRUD. |
| 03 | **[Conversations](./03-conversations.md)** | Conversations, messages, transcripts and audio, customers, manager overrides, assignment. The core data API. |
| 04 | **[Catalog](./04-catalog.md)** | Products, reasons and rulebook documents — the per-tenant configuration that analysis and the dashboards are built on. |
| 05 | **[Dashboard — aggregates](./05-dashboard.md)** | Overview, timeseries, criteria, employees, departments, the employee cabinet, products, reasons, funnel, agreements. |
| 06 | **[Dashboard — insights & exports](./06-dashboard-insights.md)** | Signals, insights, natural-language ask, and the async export lifecycle. |
| 07 | **[Integrations](./07-integrations.md)** | Connecting Telegram / Instagram / Web channels, the Meta OAuth round-trip, attribution modes, and the widget + Chrome extension endpoints. |

---

## The five-minute version

```bash
# 1. Log in
curl -X POST https://monitoring.jakhongir.dev/api/v1/auth/token \
  -H 'Content-Type: application/json' \
  -d '{"username": "aziza.k", "password": "…"}'   # username, NOT email
# → { "access": "eyJ…", "refresh": "eyJ…" }

# 2. Everything else carries the bearer token
curl https://monitoring.jakhongir.dev/api/v1/companies/users/me \
  -H 'Authorization: Bearer eyJ…'
```

Five rules that will save you the most time:

1. **No trailing slashes.** `/api/v1/chats/conversations/` is a 404. `APPEND_SLASH` is off
   and there is no redirect.
2. **Never send `company_id`.** Tenancy is stamped server-side from the authenticated
   user. Another tenant's row reads as **404**, not 403.
3. **Match errors on `code`, not on `detail`.** Every error shares one envelope
   (`{type, errors: [{code, detail, attr}]}`) and the snake_case codes are stable API.
4. **Response datetimes are `"YYYY-MM-DD HH:MM:SS"`** — not ISO-8601. `new Date(value)`
   will betray you across browsers; parse deliberately.
5. **`null` is not `0`.** Across the dashboard, a missing score means "not measured" and
   must render as "—". Charting it as zero silently lies to the user.

---

## What this platform is (and isn't)

Kotib Monitoring is a multi-tenant SaaS that **observes** sales conversations across
Telegram, Instagram and web chat, scores them with an LLM, and aggregates the results
into manager dashboards and product feedback.

It is **read-only toward customers.** Nothing in this API sends a message, reaction, read
receipt or typing indicator into a customer conversation — the Instagram client has no
send methods and the Telegram runner has no outbound path, deliberately. Do not design a
reply box, a composer, or a "mark as read" control; the endpoints to back them do not
exist and will not be added.

Two audiences share the API surface, and the docs label which is which:

- **the dashboard SPA** — JWT-authenticated, the subject of docs 02–06;
- **the widget and Chrome extension** — separate auth schemes, ingest-only, covered in
  doc 07.

---

## Related reading

| Document | Why you'd open it |
|---|---|
| [`docs/ARCHITECTURE.md`](../ARCHITECTURE.md) | How the subsystems fit together, and what is built vs. pending. |
| [`docs/ANALYTICS.md`](../ANALYTICS.md) | The authoritative read-side contract behind every dashboard aggregate — the averaging rule, `canonical_results`, override precedence. Doc 05 summarises it; this is the source. |
| [`docs/WIDGET.md`](../WIDGET.md) | The embeddable web-chat widget in detail. |
| [`docs/PHASE1_SPEC.md`](../PHASE1_SPEC.md) | Product spec — the *why* behind the endpoints. |
| `GET /api/schema/` (dev only) | The generated OpenAPI 3 document. Registered only when `DEBUG=True`; Swagger UI is at `/` and ReDoc at `/redoc`. Machine-readable ground truth — generate your API client from it. |

> These docs were written against the generated OpenAPI schema and the source. When the
> two ever disagree, the schema wins — regenerate it with
> `python manage.py spectacular --file schema.yaml`.
