# API Conventions

Everything in this section applies to **every** endpoint in the API. The per-resource
docs (`02`–`07`) assume it and do not repeat it.

---

## 1. Base URL & routing rules

| | |
|---|---|
| Base URL | `https://monitoring.jakhongir.dev/api/v1` |
| Content type | `application/json` (except file upload / download endpoints, which say so explicitly) |

**Every application endpoint lives under `/api/v1/`.** `conf/urls.py` mounts the whole app
URL tree there, so the paths you see in these docs — `/api/v1/chats/conversations`,
`/api/v1/dashboard/overview` — are the complete, callable paths. Set `/api/v1` as your
HTTP client's base URL and the rest of this documentation reads naturally.

Two route groups sit *outside* the versioned prefix:

| Path | Notes |
|---|---|
| `/admin/` | Django admin. Session auth, not for the SPA. |
| `/`, `/redoc`, `/api/schema/` | Swagger UI, ReDoc and the raw OpenAPI 3 document. **Registered only when `DEBUG=True`** — they are not available in production, so don't link the SPA at them. In development the schema at `/api/schema/` is the machine-readable source of truth for everything in these docs. |

### No trailing slashes — ever

The routers are built with `DefaultRouter(trailing_slash=False)` and Django runs with
`APPEND_SLASH = False`. This is not cosmetic:

- `GET /api/v1/chats/conversations` → **200**
- `GET /api/v1/chats/conversations/` → **404**

There is no redirect to save you. Configure your HTTP client's base URL and path joining
so it never appends a slash, and make sure your router/interceptor layer doesn't
normalise URLs by adding one.

---

## 2. Authentication

The API uses **JWT bearer tokens** (`djangorestframework-simplejwt`). Session
authentication is also enabled, but only so the Django admin and the browsable API work —
the SPA should always use JWT.

```
Authorization: Bearer <access_token>
```

### Obtaining tokens

`POST /api/v1/auth/token` with username + password returns an access/refresh pair.
`POST /api/v1/auth/token/refresh` exchanges a refresh token for a new access token.
Both are documented in detail in [02-auth-and-accounts.md](./02-auth-and-accounts.md).

### Lifetimes

| Token | Lifetime |
|---|---|
| `access` | **5 days** |
| `refresh` | **7 days** |

Because the access token is long-lived, the practical refresh strategy is *reactive*:
retry once on a 401 with a refreshed access token, and if the refresh itself 401s, send
the user to the login screen. There is no rotation or blacklist configured, so a refresh
token stays valid for its full 7 days.

### Custom claims

The access token carries two extra claims so the SPA can bootstrap its UI without an
extra round-trip:

```json
{
  "token_type": "access",
  "exp": 1785500000,
  "jti": "…",
  "user_id": "9f1c2a44-1f0e-4c7f-9c1c-2b2a4d3e5f60",
  "company_id": "3a7e6d21-5c88-4a1f-9d3e-0f2b8c6a4d19",
  "role": "manager"
}
```

> **Do not treat these claims as authorization.** They are a UI hint only. The backend
> always re-derives the tenant and the role from the authenticated user record, so a
> tampered token buys nothing — but it also means a stale claim (e.g. the user's role was
> changed) will not match reality until they log in again. For anything that matters,
> read `GET /api/v1/companies/users/me`.

---

## 3. Tenancy (multi-company isolation)

Every tenant-owned resource is scoped to the caller's company, centrally, in
`CompanyScopedQuerySetMixin`:

- **Reads** are filtered to `request.user.company_id`.
- **Writes** stamp `company_id` from the authenticated user.

Consequences for the frontend:

- **Never send a `company` / `company_id` field** in a create or update payload. It is
  ignored at best; the server assigns it.
- A resource belonging to another tenant is **404, not 403** — it simply isn't in the
  queryset. Don't build UI that distinguishes "forbidden" from "missing" for tenant data.
- Platform superusers created via `createsuperuser` have **no company** and are
  deliberately rejected by `HasCompany` with a 403. Tenant data is only reachable from
  inside a tenant. If you're testing with a superuser and everything 403s, that's why.

---

## 4. Roles & permissions

`User.role` is one of:

| Role | Value | Company dashboards | Writes (overrides, assignment, catalog, signals) |
|---|---|---|---|
| Owner | `owner` | ✅ | ✅ |
| Admin | `admin` | ✅ | ✅ |
| Manager | `manager` | ✅ | ✅ |
| Viewer | `viewer` | ✅ (read-only stakeholder) | ❌ |

`owner`, `admin` and `manager` are collectively the **manager roles**. Three permission
classes implement the rules:

- **`HasCompany`** — the caller is attached to a tenant. Applied to essentially everything.
- **`IsManagerRole`** — write-side gate. Non-safe methods (`POST`/`PUT`/`PATCH`/`DELETE`)
  on tenant resources require a manager role. Viewers and employee-cabinet users read;
  they don't decide.
- **`ManagerDashboardAccess`** — company-wide dashboards. Manager roles always pass. A
  user **linked to an `Employee` profile** is the *employee cabinet* and is restricted to
  `GET /api/v1/dashboard/me`. A `viewer` **without** an employee link is a read-only stakeholder
  and may read the company dashboards.

### The employee cabinet

This is the subtlety most likely to bite you. "Employee cabinet" is not a role — it's the
state of a non-manager user who has an `Employee` record linked to them. Such a user:

- gets **403** on `/api/v1/dashboard/overview`, `/api/v1/dashboard/employees`, etc.
- gets `/api/v1/dashboard/me` instead;
- **also** has their data-endpoint querysets narrowed (`EmployeeSelfScopedMixin`) — they
  see only conversations, customers and results attributed to themselves. The restriction
  is enforced on the data API too, not just the dashboard, so the cabinet can't be
  bypassed by reading transcripts directly.

The frontend should branch on `role` + whether `GET /api/v1/companies/users/me` resolves to an
employee-linked user, and render the cabinet layout rather than letting the user hit 403s.

---

## 5. Pagination

All list endpoints use DRF's **`LimitOffsetPagination`** with `PAGE_SIZE = 100` (the
default limit when you don't pass one).

**Query params**

| Param | Type | Default | Description |
|---|---|---|---|
| `limit` | integer | `100` | Number of items to return. |
| `offset` | integer | `0` | Number of items to skip. |

**Envelope**

```json
{
  "count": 243,
  "next": "https://monitoring.jakhongir.dev/api/v1/chats/conversations?limit=50&offset=100",
  "previous": "https://monitoring.jakhongir.dev/api/v1/chats/conversations?limit=50&offset=0",
  "results": [ /* … */ ]
}
```

`next` / `previous` are absolute URLs, or `null` at the ends. `count` is the total across
all pages — use it for "showing X of Y" and for page-count maths. Offset pagination is
not stable under concurrent inserts; for feeds that grow (messages, events) prefer
filtering by a timestamp cursor over deep-paging with large offsets.

Aggregate endpoints under `/api/v1/dashboard/` are **not** paginated — they return a single
computed object. See [05-dashboard.md](./05-dashboard.md).

---

## 6. Filtering, search and ordering

Three DRF backends are enabled globally, so any list endpoint *may* expose any of them.
The per-endpoint docs list exactly which fields each one supports.

| Backend | Param(s) | Notes |
|---|---|---|
| `DjangoFilterBackend` | named fields, e.g. `?channel=telegram&status=open` | Exact/range/choice filters declared in a `FilterSet`. Unknown params are **ignored silently**, not rejected — a typo yields unfiltered data, not an error. |
| `SearchFilter` | `?search=<text>` | Case-insensitive substring match across the endpoint's declared `search_fields`. |
| `OrderingFilter` | `?ordering=<field>` | Prefix with `-` for descending: `?ordering=-created_at`. Multiple fields comma-separated: `?ordering=-created_at,name`. Only declared `ordering_fields` are honoured. |

Combine freely — filters, search, ordering and pagination all apply to the same request:

```
GET /api/v1/chats/conversations?channel=instagram&search=refund&ordering=-created_at&limit=25&offset=0
```

> The "unknown filter params are ignored" behaviour is worth guarding against in your
> API client: assert your filter keys against the documented list in dev, because the
> server will not tell you that `?chanel=telegram` did nothing.

---

## 7. Dates, times and IDs

| | |
|---|---|
| **IDs** | UUID v4 strings on every resource (`shared.models.BaseModel`). Never integers. Treat them as opaque. |
| **Timestamps in responses** | `"YYYY-MM-DD HH:MM:SS"` — the configured `DATETIME_FORMAT`. **No timezone suffix, no `T` separator.** This is *not* ISO-8601 and `new Date(value)` will parse it inconsistently across browsers. |
| **Timestamps in requests** | Standard DRF parsing — ISO-8601 (`2026-07-29T14:30:00Z`) is accepted. |
| **Date-only filters** | `YYYY-MM-DD`. |
| **Timezone** | Response datetimes are rendered in the server's timezone. Attribution *shift* windows are a deliberate exception: they are wall-clock **local** times evaluated in `Company.timezone`. See [07-integrations.md](./07-integrations.md). |

Because of the non-ISO response format, parse defensively:

```js
// "2026-07-29 14:30:00" → Date
const parseApiDate = (s) => (s ? new Date(s.replace(" ", "T") + "Z") : null);
```

Every model also carries `created_at` and `updated_at` in the same format.

---

## 8. Errors

Errors are rendered by **`drf-standardized-errors`**, so every 4xx/5xx shares one
envelope. This is the single most important contract in this document: the frontend
should match on `code`, never on `detail` text.

### Envelope

```json
{
  "type": "validation_error",
  "errors": [
    {
      "code": "invalid_score",
      "detail": "Score must be between 0 and 10.",
      "attr": "score"
    }
  ]
}
```

| Field | Meaning |
|---|---|
| `type` | `validation_error` (400), `client_error` (401/403/404/405/429), or `server_error` (500). |
| `errors[]` | Always an array — a single request can fail on several fields at once. |
| `errors[].code` | **Stable, machine-readable, snake_case.** Match on this. |
| `errors[].detail` | Human-readable message. May change wording at any time; do not parse or match it. |
| `errors[].attr` | The offending field name, or `null` for non-field / object-level errors. |

### Status codes

| Status | `type` | When |
|---|---|---|
| 400 | `validation_error` | Payload or query params failed validation. |
| 401 | `client_error` | Missing, malformed or expired access token → refresh, then re-login. |
| 403 | `client_error` | Authenticated but not permitted: no company, wrong role, employee-cabinet restriction. |
| 404 | `client_error` | Not found **or** belongs to another tenant (indistinguishable by design). |
| 405 | `client_error` | Method not allowed on this route. |
| 500 | `server_error` | Bug. Show a generic message; don't surface `detail`. |

### Domain error codes

Business rules raise `ValidationError(..., code="…")` with static snake_case codes, so
the frontend can render a precise, localised message per failure. The complete catalogue
currently in the codebase:

**Company settings** — `timezone_invalid`, `working_hours_not_list`,
`working_hours_entry_not_object`, `working_hours_weekday_invalid`,
`working_hours_time_format`, `working_hours_time_range`, `working_hours_zero_length`

**Conversations & customers** — `invalid_score`, `invalid_outcome`, `invalid_reason_code`,
`employee_other_company`, `customer_other_company`, `merge_self`, `merge_cycle`,
`merge_target_not_canonical`, `audio_not_found`

**Catalog** — `product_name_duplicate`, `price_negative`, `reason_code_duplicate`, `rulebook_file_too_large`,
`rulebook_file_type_unsupported`

**Dashboard** — `period_invalid`, `period_too_long`, `conversation_not_found`,
`employee_not_found`, `export_not_found`, `no_employee_profile`, `gemini_not_configured`

**Telegram connection** — `phone_invalid`, `phone_taken`, `phone_banned`, `consent_required`,
`code_send_failed`, `code_invalid`, `code_verify_failed`, `password_not_required`,
`password_rejected`, `login_expired`, `flood_wait`, `qr_start_failed`, `qr_poll_failed`,
`account_not_found`, `account_taken`, `account_not_connected`, `backfill_already_running`,
`backfill_not_running`, `employee_other_company`

**Instagram / widget** — `user_has_no_company`, `widget_key_invalid`

Each code's exact trigger and the recommended UI response are documented at the endpoint
that raises it.

### Suggested client handling

```js
async function request(path, options) {
  const res = await fetch(BASE + path, options);
  if (res.ok) return res.status === 204 ? null : res.json();

  const body = await res.json().catch(() => null);
  throw new ApiError({
    status: res.status,
    type: body?.type,
    // index by code so callers can do: err.byCode.invalid_score
    errors: body?.errors ?? [],
    byCode: Object.fromEntries((body?.errors ?? []).map((e) => [e.code, e])),
    byField: Object.fromEntries(
      (body?.errors ?? []).filter((e) => e.attr).map((e) => [e.attr, e]),
    ),
  });
}
```

`byField` maps cleanly onto form-library field errors; `byCode` handles the
object-level business rules.

---

## 9. CORS

`CORS_ALLOW_ALL_ORIGINS` is enabled, so a browser SPA on any origin can call the API
directly. `CSRF_TRUSTED_ORIGINS` is derived from `BACKEND_DOMAIN` and only matters for
session-authenticated flows (admin, browsable API) — JWT requests are exempt from CSRF.

---

## 10. Read-only toward customers

A platform-wide invariant, stated here so it informs your UI design: **nothing in this
API sends a message, reaction, read receipt or typing indicator into a customer
conversation.** The Instagram client has no send methods and the Telegram runner has no
outbound path. Do not build a reply box, a "mark as read" control, or any composer — the
endpoints to back them do not exist and will not be added.

---

## 11. Health checks

| Endpoint | Purpose |
|---|---|
| `GET /api/v1/health` | Liveness. Unauthenticated. |
| `GET /api/v1/health/ready` | Readiness — checks dependencies (DB, Redis). Unauthenticated. |

Useful for a status banner or a pre-login connectivity check. Details in
[02-auth-and-accounts.md](./02-auth-and-accounts.md).
