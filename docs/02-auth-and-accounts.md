# Auth & Accounts

Covers everything the SPA needs before it can render anything else: obtaining and
refreshing a JWT, the two infrastructure health probes, reading/updating the caller's own
company settings, reading the logged-in user's profile, and managing the tenant's
employee roster.

Every path below is written in full. The whole API is mounted under **`/api/v1/`**
(`conf/urls.py` → `path("api/v1/", include("apps.urls"))`), so a bare `/auth/token` or
`/companies/me` does not exist — always call `/api/v1/auth/token`, `/api/v1/companies/me`,
and so on.

The Swagger UI, ReDoc and raw `api/schema/` routes are registered **only when
`DEBUG=True`**. On a production deployment they return 404 — do not build tooling that
depends on fetching the live schema from the deployed backend.

Datetimes are rendered with `DATETIME_FORMAT = "%Y-%m-%d %H:%M:%S"` — a plain
`YYYY-MM-DD HH:MM:SS` string in **UTC** (`TIME_ZONE = "UTC"`, `USE_TZ = True`), *not*
ISO-8601 with an offset. Parse accordingly. All primary keys are UUIDs.

## Endpoints at a glance

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/v1/auth/token` | Exchange username + password for an access/refresh token pair |
| `POST` | `/api/v1/auth/token/refresh` | Mint a new access token from a refresh token |
| `GET` | `/api/v1/health` | Liveness probe — no auth, touches nothing external |
| `GET` | `/api/v1/health/ready` | Readiness probe — verifies Postgres + Redis |
| `GET` | `/api/v1/companies/me` | Read the caller's own company settings |
| `PUT` / `PATCH` | `/api/v1/companies/me` | Update company name, timezone, attribution mode, idle gap, retention — **manager only** |
| `GET` | `/api/v1/companies/users/me` | The authenticated user's own profile (SPA bootstrap) |
| `GET` | `/api/v1/companies/employees` | List the tenant's employees (filter / search / order / paginate) |
| `POST` | `/api/v1/companies/employees` | Create an employee — **manager only** |
| `GET` | `/api/v1/companies/employees/{id}` | Retrieve one employee |
| `PUT` / `PATCH` | `/api/v1/companies/employees/{id}` | Update an employee — **manager only** |
| `DELETE` | `/api/v1/companies/employees/{id}` | Delete an employee — **manager only** |

Reads are open to every user attached to the company (`viewer` included); every write on
this page requires an `owner` / `admin` / `manager` role.

## Error envelope

Every 4xx/5xx from this API goes through `drf_standardized_errors`, so the body always
has the same shape:

```jsonc
{
  "type": "validation_error",        // "validation_error" | "client_error" | "server_error"
  "errors": [
    {
      "code": "working_hours_time_format", // stable, machine-readable — match on THIS
      "detail": "Entry 0: start must be 'HH:MM'.", // human text, may change
      "attr": "working_hours"           // offending field; null for non-field errors
    }
  ]
}
```

Match on `code`, never on `detail`. `type: "validation_error"` accompanies HTTP 400;
`client_error` accompanies 401/403/404/405; `server_error` accompanies 500. This envelope
is not repeated in the samples below — only the endpoint-specific codes are listed.

Common `client_error` codes across all authenticated endpoints:

| Status | `code` | When |
|---|---|---|
| 401 | `not_authenticated` | No `Authorization` header / no session |
| 401 | `authentication_failed` | Malformed credentials |
| 401 | `token_not_valid` | Access token expired, malformed, or signed with another key |
| 403 | `permission_denied` | Authenticated but the permission class rejected the call |
| 404 | `not_found` | Object does not exist **or** belongs to another tenant |
| 405 | `method_not_allowed` | Verb not supported on that route |

---

## Authentication

JWT is issued by SimpleJWT. Configured lifetimes (`conf/settings.py` → `SIMPLE_JWT`):

- `ACCESS_TOKEN_LIFETIME` — **5 days**
- `REFRESH_TOKEN_LIFETIME` — **7 days**
- `ALGORITHM` — `HS256`
- `UPDATE_LAST_LOGIN` — `True` (a successful `/api/v1/auth/token` stamps `last_login`)
- Refresh rotation and blacklisting are **not** enabled, so a refresh token stays valid
  for its full 7 days and `/api/v1/auth/token/refresh` returns only a new `access`.

Authenticated calls send:

```http
Authorization: Bearer <access>
```

Session authentication is also enabled (`SessionAuthentication`) but exists for the Django
admin and the browsable API — the SPA should use Bearer tokens.

### POST /api/v1/auth/token

Signs a dashboard user in. Takes Django username + password and returns a JWT pair. The
access token is minted by `CompanyTokenObtainPairSerializer`, which stamps two extra
claims — `company_id` and `role` — into the payload so the SPA can branch on tenancy and
role without an extra round-trip. Those claims are a client-side convenience only: the
backend always re-derives the tenant from the authenticated user, never from the claim.

**Auth & permissions** — public. No token required. A user whose account is inactive
(`is_active = False`) is rejected exactly like bad credentials.

**Path / query params** — none.

**Request body**

```jsonc
{
  "username": "aziza.k",   // required, string, non-empty (this is the USERNAME, not email)
  "password": "s3cret-pw"  // required, string, non-empty
}
```

**Response `200 OK`**

```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2NzE5MDQwMH0.rXk3l0Qq0kQ6mQmLbP3Q1sVQ3l2mE0oYk8bqQ0i9vTk",
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzY2NzU4NDAwLCJ1c2VyX2lkIjoiOGYxNGQzMmEtNzA5Yi00YjMxLTllMGEtY2QyZjRhOTFiNzE2IiwiY29tcGFueV9pZCI6IjNiN2E0ZmQyLTFjOGUtNGQ2Yi04ZTdmLTVhMDkxYzRlMmYwMSIsInJvbGUiOiJtYW5hZ2VyIn0.7Yb2yQvVJq0lZ1Yk3Q9m2H4pRfQ0mQ8cW3n1oXzGqLo"
}
```

Decoded `access` payload (claims the SPA may read; do **not** trust them for
authorization decisions):

```json
{
  "token_type": "access",
  "exp": 1766758400,
  "jti": "0b1a1c4a83c74a1cb9bb1c1a09b1de77",
  "user_id": "8f14d32a-709b-4b31-9e0a-cd2f4a91b716",
  "company_id": "3b7a4fd2-1c8e-4d6b-8e7f-5a091c4e2f01",
  "role": "manager"
}
```

`company_id` is `null` for platform staff (superusers created with `createsuperuser` carry
no company). Such a token authenticates but is rejected by every tenant endpoint with
`403 permission_denied` — see `HasCompany` below.

**Errors**

| Status | `type` | `code` | Cause |
|---|---|---|---|
| 400 | `validation_error` | `required` (`attr`: `username` / `password`) | Field omitted |
| 400 | `validation_error` | `blank` | Field sent empty |
| 401 | `client_error` | `no_active_account` | Wrong credentials or inactive user |

### POST /api/v1/auth/token/refresh

Trades a still-valid refresh token for a fresh access token, so a session survives the
5-day access lifetime without re-prompting for a password. Rotation is off — the same
refresh token can be reused until it expires at 7 days, and the response carries **no**
new `refresh` value.

**Auth & permissions** — public; the refresh token in the body is the credential.

**Path / query params** — none.

**Request body**

```jsonc
{
  "refresh": "eyJhbGciOiJIUzI1NiIs..."  // required, string, non-empty
}
```

**Response `200 OK`**

```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzY3MTkwNDAwLCJ1c2VyX2lkIjoiOGYxNGQzMmEtNzA5Yi00YjMxLTllMGEtY2QyZjRhOTFiNzE2IiwiY29tcGFueV9pZCI6IjNiN2E0ZmQyLTFjOGUtNGQ2Yi04ZTdmLTVhMDkxYzRlMmYwMSIsInJvbGUiOiJtYW5hZ2VyIn0.Kk9wV7g0lQZ1m8s5bR2hT3xN0pYcQ7eF1uJ2kA9dS4M"
}
```

**Errors**

| Status | `type` | `code` | Cause |
|---|---|---|---|
| 400 | `validation_error` | `required` / `blank` (`attr`: `refresh`) | Field missing or empty |
| 401 | `client_error` | `token_not_valid` | Refresh token expired or malformed → force a full re-login |

---

## Health

Two deliberately separate probes. Neither is meant for the SPA's normal request path;
they exist for the container orchestrator, and `depends_on: service_healthy` in Compose
gates the worker/beat/runner on readiness.

### GET /api/v1/health

Liveness. Answers "is this web process up and able to speak HTTP?" and touches no
external system, so a Postgres or Redis blip never causes the orchestrator to kill an
otherwise healthy worker.

**Auth & permissions** — `AllowAny`, and `authentication_classes` is empty, so an
`Authorization` header is ignored entirely (never 401s on a stale token).

**Path / query params** — none. **Request body** — none.

**Response `200 OK`**

```json
{ "status": "ok" }
```

**Errors** — none in practice; a non-200 means the process itself is down.

### GET /api/v1/health/ready

Readiness. Actively probes both dependencies — a `SELECT 1` against Postgres and a
set-then-get round-trip against the Redis cache — and reports each one individually, so a
degraded deployment tells you *which* backing service is down.

**Auth & permissions** — `AllowAny`, no authentication classes.

**Path / query params** — none. **Request body** — none.

**Response `200 OK`** — both dependencies answered:

```json
{
  "status": "ok",
  "database": true,
  "cache": true
}
```

**Response `503 Service Unavailable`** — at least one dependency failed. Note this is a
raw body, **not** the standardized error envelope:

```json
{
  "status": "degraded",
  "database": true,
  "cache": false
}
```

**Errors** — only the `503` above. `status` is `"ok"` iff every check is `true`.

---

## Company

### GET /api/v1/companies/me

Returns the tenant record of the calling user — the settings that drive attribution and
conversation windowing. `attribution_mode` decides how messages are assigned to
employees, `idle_gap_hours` is the silence gap after which an ongoing chat is closed and a
new conversation starts, and `timezone` is the IANA zone in which shift schedules
(attribution mode 2) are evaluated against UTC message timestamps.

**Auth & permissions** — `IsAuthenticated` + `HasCompany`. The object is resolved as
`request.user.company`, so there is no id in the URL and cross-tenant reads are
structurally impossible. A platform superuser without a company gets `403`.

**Path / query params** — none.

**Response `200 OK`**

```json
{
  "id": "3b7a4fd2-1c8e-4d6b-8e7f-5a091c4e2f01",
  "name": "Kotib Savdo MChJ",
  "timezone": "Asia/Tashkent",
  "attribution_mode": 1,
  "idle_gap_hours": 8,
  "created_at": "2026-02-11 09:24:07"
}
```

Enum values:

| Field | Value | Meaning |
|---|---|---|
| `attribution_mode` | `1` | One account = one employee |
| | `2` | Shift schedule (uses `Employee.working_hours` + company `timezone`) |
| | `3` | Browser extension |
| `idle_gap_hours` | `4`, `8`, `12`, `24` | Conversation-close silence gap (hours) |

**Errors** — `401 not_authenticated`, `403 permission_denied` (user has no company).

### PUT /api/v1/companies/me · PATCH /api/v1/companies/me

Updates the caller's own company settings. Use `PATCH` for partial edits (the SPA's
settings screen); `PUT` replaces and therefore **requires** `name`. `id` and `created_at`
are read-only and silently ignored if sent.

**Auth & permissions** — `IsAuthenticated` + `HasCompany` + **`IsManagerRole`**
(`ManagerWriteMixin` adds the manager gate on non-safe methods). Reads are open to every
company user, but only `owner` / `admin` / `manager` may write. A `viewer` or an
employee-cabinet user gets `403 permission_denied` ("This action requires a manager
role.") — hide or disable the settings form for them rather than letting the save fail.

**Path / query params** — none.

**Request body** (`PATCH`; for `PUT` every optional field below still applies but `name`
becomes mandatory)

```jsonc
{
  "name": "Kotib Savdo MChJ",   // required on PUT, optional on PATCH — string, 1–255 chars
  "timezone": "Asia/Tashkent",  // optional — valid IANA zone name, max 64 chars
  "attribution_mode": 2,        // optional — integer enum: 1 | 2 | 3
  "idle_gap_hours": 12,         // optional — integer enum: 4 | 8 | 12 | 24
  "retention_months": 18        // optional — positive integer, or null to keep forever
}
```

`retention_months` drives the weekly data-retention sweep: conversations, messages and
their analysis older than this are purged. `null` means keep forever. Because the effect
is destructive and irreversible, confirm explicitly before lowering it.

**Response `200 OK`** — the full updated object, same shape as the `GET`:

```json
{
  "id": "3b7a4fd2-1c8e-4d6b-8e7f-5a091c4e2f01",
  "name": "Kotib Savdo MChJ",
  "timezone": "Asia/Tashkent",
  "attribution_mode": 2,
  "idle_gap_hours": 12,
  "created_at": "2026-02-11 09:24:07"
}
```

**Errors**

| Status | `code` | `attr` | Cause |
|---|---|---|---|
| 400 | `timezone_invalid` | `timezone` | Not a resolvable IANA name (`"Asia/Tashkent"` is valid, `"UZT"` is not) |
| 400 | `required` | `name` | `PUT` without `name` |
| 400 | `blank` / `max_length` | `name`, `timezone` | Empty string, or over 255 / 64 chars |
| 400 | `invalid_choice` | `attribution_mode`, `idle_gap_hours` | Integer outside the enum |
| 401 | `not_authenticated` | `null` | Missing/expired token |
| 403 | `permission_denied` | `null` | User not attached to a company |

Changing `attribution_mode` does not retroactively re-attribute existing conversations,
and manual assignments (`attribution_source = "manual"`) are never overwritten by an
automatic mode.

---

## Users

### GET /api/v1/companies/users/me

The authenticated user's own profile — the SPA's bootstrap call. It resolves `role` (which
drives menu/route visibility) and `company` (which is `null` only for platform staff) in
one request, without decoding the JWT client-side.

**Auth & permissions** — `IsAuthenticated` only. Deliberately **no** `HasCompany`, so a
company-less staff user can still read their profile and the SPA can render a meaningful
"your account is not attached to a company" state instead of an opaque 403. The object is
`request.user`; there is no way to read another user through this route.

**Path / query params** — none.

**Response `200 OK`**

```json
{
  "id": "8f14d32a-709b-4b31-9e0a-cd2f4a91b716",
  "username": "aziza.k",
  "email": "aziza@jakhongir.dev",
  "first_name": "Aziza",
  "last_name": "Karimova",
  "role": "manager",
  "company": "3b7a4fd2-1c8e-4d6b-8e7f-5a091c4e2f01"
}
```

Every field is read-only — there is no write route here.

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | |
| `username` | string | Login identifier used at `/api/v1/auth/token` |
| `email` | string (email) | May be `""` |
| `first_name` / `last_name` | string | May be `""` |
| `role` | enum | `owner` \| `admin` \| `manager` \| `viewer` |
| `company` | uuid, nullable | `null` for platform staff |

Role semantics used by the rest of the API: `owner`, `admin` and `manager` are the
**manager roles** — they pass `IsManagerRole` (write-side gate elsewhere in the API) and
`ManagerDashboardAccess` (company-wide dashboards). A `viewer` linked to an `Employee`
record is the *employee cabinet* and is restricted to `/api/v1/dashboard/me`; a `viewer` with no
employee link is a read-only stakeholder that may still read company dashboards.

**Errors** — `401 not_authenticated` / `401 token_not_valid`.

---

## Employees

The employee roster: the people whose sales conversations are scored. An `Employee` is not
necessarily a dashboard `User` — the `user` link is optional and read-only over the API
(set it in the Django admin). Every route below is company-scoped by
`CompanyScopedModelViewSet`: the queryset is filtered to `request.user.company_id` and
creates stamp it automatically, so `company` is never sent or returned.

**Auth & permissions (all routes)** — `IsAuthenticated` + `HasCompany`, plus
**`IsManagerRole`** on every write (`ManagerWriteMixin`). So:

| Method | Who may call it |
|---|---|
| `GET` (list, retrieve) | Any user attached to the company, `viewer` included |
| `POST` / `PUT` / `PATCH` / `DELETE` | `owner` / `admin` / `manager` only |

A non-manager write returns `403 permission_denied` with "This action requires a manager
role." Render the roster read-only for viewers and employee-cabinet users instead of
surfacing that error.

**`department` drives the departments dashboard.** It is a free-form string (max 120
chars, `""` when unset — never `null`) and it is the only source for the
`/api/v1/dashboard/departments` dimension. A tenant that leaves it blank everywhere gets
an empty departments view, so an employee form should offer it as a combo box seeded from
the distinct values already in the roster.

### GET /api/v1/companies/employees

Lists the tenant's employees for pickers, roster screens and attribution setup. Results
are paginated, filterable by active state, searchable by name and orderable.

**Query params**

| Name | Type | Required | Default | Description |
|---|---|---|---|---|
| `is_active` | boolean | no | — | Exact filter. Accepts `true` / `false`. Omit to get both. |
| `search` | string | no | — | Case-insensitive containment search over `full_name` (the only search field). |
| `ordering` | string | no | `full_name` | Field to sort by; prefix with `-` for descending. Valid: `id`, `full_name`, `is_active`, `working_hours`, `user`, `created_at`. Comma-separate for multi-key sorts (e.g. `-is_active,full_name`). Default comes from the model's `Meta.ordering = ["full_name"]`. |
| `limit` | integer | no | `100` | Page size (`LimitOffsetPagination`, `PAGE_SIZE = 100`). |
| `offset` | integer | no | `0` | Index of the first returned row. |

**Response `200 OK`**

```json
{
  "count": 3,
  "next": "http://localhost:8000/api/v1/companies/employees?limit=2&offset=2",
  "previous": null,
  "results": [
    {
      "id": "a1c9f0d4-6b2e-4f77-9a3d-2c5e8b710f42",
      "full_name": "Aziza Karimova",
      "department": "Savdo",
      "is_active": true,
      "working_hours": [
        { "weekday": 0, "start": "09:00", "end": "18:00" },
        { "weekday": 1, "start": "09:00", "end": "18:00" }
      ],
      "user": "8f14d32a-709b-4b31-9e0a-cd2f4a91b716",
      "created_at": "2026-03-02 11:05:33"
    },
    {
      "id": "c73b18ea-4d0f-4c9a-b6e1-9f30ab24d557",
      "full_name": "Bekzod Rasulov",
      "department": "",
      "is_active": false,
      "working_hours": null,
      "user": null,
      "created_at": "2026-03-04 08:41:02"
    }
  ]
}
```

`next` / `previous` are absolute URLs or `null`.

**Errors** — `401 not_authenticated`, `403 permission_denied`.

### POST /api/v1/companies/employees

Creates an employee in the caller's company. `company` is stamped server-side from the
authenticated user and must not be sent. The `user` link cannot be established here — it
is read-only.

**Request body**

```jsonc
{
  "full_name": "Bekzod Rasulov",  // required — string, 1–255 chars
  "department": "Savdo",          // optional — string, max 120 chars, "" when unset
  "is_active": true,              // optional — boolean, defaults to true
  "working_hours": [              // optional — null or a list of shift entries; null/[] clears it
    { "weekday": 0, "start": "09:00", "end": "18:00" },  // weekday: integer 0=Monday … 6=Sunday
    { "weekday": 5, "start": "22:00", "end": "06:00" }   // start > end is a legal overnight shift
  ]
}
```

`working_hours` matters only when the company runs `attribution_mode = 2` (shift
schedule); times are wall-clock **local** times in the company's `timezone`. Each entry
requires exactly the keys `weekday`, `start`, `end`; `start` and `end` are `"HH:MM"`
strings between `"00:00"` and `"23:59"` and must differ.

**Response `201 Created`**

```json
{
  "id": "c73b18ea-4d0f-4c9a-b6e1-9f30ab24d557",
  "full_name": "Bekzod Rasulov",
  "department": "Savdo",
  "is_active": true,
  "working_hours": [
    { "weekday": 0, "start": "09:00", "end": "18:00" },
    { "weekday": 5, "start": "22:00", "end": "06:00" }
  ],
  "user": null,
  "created_at": "2026-03-04 08:41:02"
}
```

**Errors**

| Status | `code` | `attr` | Cause |
|---|---|---|---|
| 400 | `required` / `blank` / `max_length` | `full_name` | Missing, empty, or over 255 chars |
| 400 | `working_hours_not_list` | `working_hours` | Value is neither `null`, `[]`, nor a list |
| 400 | `working_hours_entry_not_object` | `working_hours` | A list element is not an object |
| 400 | `working_hours_weekday_invalid` | `working_hours` | `weekday` missing or outside `0`–`6` |
| 400 | `working_hours_time_format` | `working_hours` | `start`/`end` is not a 5-char `"HH:MM"` string |
| 400 | `working_hours_time_range` | `working_hours` | `start`/`end` outside `"00:00"`–`"23:59"` |
| 400 | `working_hours_zero_length` | `working_hours` | `start` equals `end` (zero-length shift) |
| 401 | `not_authenticated` | `null` | |
| 403 | `permission_denied` | `null` | User not attached to a company |

### GET /api/v1/companies/employees/{id}

Retrieves one employee. Because the queryset is company-filtered, an id belonging to
another tenant returns `404`, not `403` — the API never confirms that a foreign row exists.

**Path params**

| Name | Type | Required | Default | Description |
|---|---|---|---|---|
| `id` | uuid | yes | — | Employee primary key |

**Response `200 OK`**

```json
{
  "id": "a1c9f0d4-6b2e-4f77-9a3d-2c5e8b710f42",
  "full_name": "Aziza Karimova",
  "department": "Savdo",
  "is_active": true,
  "working_hours": [
    { "weekday": 0, "start": "09:00", "end": "18:00" }
  ],
  "user": "8f14d32a-709b-4b31-9e0a-cd2f4a91b716",
  "created_at": "2026-03-02 11:05:33"
}
```

**Errors** — `401 not_authenticated`, `403 permission_denied`, `404 not_found`.

### PUT /api/v1/companies/employees/{id} · PATCH /api/v1/companies/employees/{id}

Updates an employee — renaming, deactivating a departed seller (prefer
`is_active: false` over `DELETE`, which destroys the row), or editing a shift schedule.
`PUT` requires `full_name`; `PATCH` accepts any subset. `id`, `user` and `created_at` are
read-only.

**Path params** — `id` (uuid, required), as above.

**Request body** (`PATCH`)

```jsonc
{
  "full_name": "Aziza Karimova",  // required on PUT, optional on PATCH — string, 1–255 chars
  "is_active": false,             // optional — boolean
  "working_hours": null           // optional — null / [] clears the schedule
}
```

**Response `200 OK`**

```json
{
  "id": "a1c9f0d4-6b2e-4f77-9a3d-2c5e8b710f42",
  "full_name": "Aziza Karimova",
  "is_active": false,
  "working_hours": null,
  "user": "8f14d32a-709b-4b31-9e0a-cd2f4a91b716",
  "created_at": "2026-03-02 11:05:33"
}
```

**Errors** — every `working_hours_*` and `full_name` code from `POST` above, plus
`401 not_authenticated`, `403 permission_denied`, `404 not_found`.

### DELETE /api/v1/companies/employees/{id}

Hard-deletes the employee row. There is no soft delete on this route — prefer
`PATCH {"is_active": false}` for someone who has left, so their historical conversations
and scores keep a named owner.

**Path params** — `id` (uuid, required).

**Response `204 No Content`** — empty body.

**Errors** — `401 not_authenticated`, `403 permission_denied`, `404 not_found`.

---

## Frontend notes

**Token storage & refresh.** Keep `access` in memory and `refresh` in the most durable
store your threat model allows. Access lives 5 days, refresh 7 — a user who does not open
the app for a week must log in again. Rotation is off, so store the `refresh` you got at
login and reuse it; `/api/v1/auth/token/refresh` returns only `access` and you must *not* expect
a new `refresh` in the response. Wire a single response interceptor: on `401` with
`code: "token_not_valid"`, attempt one refresh and replay the original request; if the
refresh itself returns `401 token_not_valid`, clear both tokens and route to login.
Serialize concurrent refreshes behind one in-flight promise or a burst of parallel
requests will each trigger their own.

**App boot order.** `POST /api/v1/auth/token` → `GET /api/v1/companies/users/me` →
`GET /api/v1/companies/me`.
The last two are independent and can run in parallel, but `users/me` must resolve before
you decide routes: `role` gates manager screens, and a `company` of `null` means every
other endpoint in the API will answer `403 permission_denied` — render a dedicated
"account not linked to a company" screen rather than a generic error. Only fetch
`/api/v1/companies/employees` once you are inside a company context.

**Gotchas.**

- `APPEND_SLASH = False` and the routers use `trailing_slash=False`. `/api/v1/companies/me/`
  with a trailing slash is a 404. Never append one.
- Datetimes are `"2026-03-02 11:05:33"` — space-separated UTC, not ISO-8601. `new
  Date(s)` is unreliable on this format in Safari; normalise to
  `s.replace(" ", "T") + "Z"` before parsing.
- `403` here has two distinct causes and only `detail` tells them apart: `"User is not
  attached to a company."` (`HasCompany` — a platform superuser, unrecoverable in the UI)
  vs `"This action requires a manager role."` (`IsManagerRole` — a viewer or
  employee-cabinet user attempting a write, recoverable by hiding the control).
- Cross-tenant ids surface as `404`, never `403`. Do not treat a 404 from
  `/api/v1/companies/employees/{id}` as "deleted" without re-listing.
- `attribution_mode` and `idle_gap_hours` are **integers**, not strings — `1`, not `"1"`.
- The employee list is capped at `limit=100` per page by default; a tenant with a large
  roster needs offset paging or a `search` term, not a single unbounded fetch.
- `working_hours` validation errors all report `attr: "working_hours"` and the entry index
  is only in the human `detail` text — surface `detail` next to the shift editor rather
  than mapping the code to a specific row.
- `department` (employee) and `retention_months` (company) are both writable. Treat
  `retention_months` as a destructive setting — lowering it purges history on the next
  weekly sweep, so require an explicit confirmation step.
