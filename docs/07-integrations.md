# 07 — Integrations (channels, connect flows, widget & extension)

Everything under `/api/v1/integrations/`. This is the **settings / channel-connection**
surface: connecting an Instagram professional account, logging a Telegram userbot in,
minting web-widget keys, plus the two non-dashboard clients (the embeddable widget and
the Kotib Chrome extension).

> **Read-only platform.** Kotib never sends anything into a customer conversation — no
> replies, no notifications, no typing/seen indicators. The Instagram client has no send
> methods and the Telegram runner has no outbound path. **Do not build a reply UI**; the
> only writes a frontend performs here are connection/config writes.

All error responses use the shared envelope described in `01-conventions.md`
(`drf_standardized_errors`: `{"type": …, "errors": [{"code", "detail", "attr"}]}`). The
`code` values listed per endpoint below are the stable machine-readable strings — match
on those, never on `detail` text.

**Every path below is the real, callable path** — the API is mounted at `api/v1/`
(`conf/urls.py`: `path("api/v1/", include("apps.urls"))`), so a full URL is
`https://monitoring.jakhongir.dev/api/v1/integrations/…`.

### Absolute URLs that must match configuration

These are not free choices — they are registered with Meta, hardcoded in the extension,
or pasted into the customer's site backend. The URLs below use the production host,
`monitoring.jakhongir.dev` (`BACKEND_DOMAIN` in `.env.prod`); swap in your own host for
local or staging work.

| What | Exact URL | Where it comes from |
|---|---|---|
| Meta OAuth **redirect URI** (register in the Meta app) | `https://monitoring.jakhongir.dev/api/v1/integrations/connect/instagram/callback` | `META_OAUTH_REDIRECT_URI` env var |
| Meta **webhook** callback URL | `https://monitoring.jakhongir.dev/api/v1/integrations/webhooks/meta` | `MetaWebhookAPIView` route |
| Meta **deauthorize** callback | `https://monitoring.jakhongir.dev/api/v1/integrations/connect/instagram/deauthorize` | Meta app settings |
| Meta **data-deletion** callback | `https://monitoring.jakhongir.dev/api/v1/integrations/connect/instagram/data-deletion` | Meta app settings |
| Deletion **status** URL (returned to Meta) | `https://monitoring.jakhongir.dev/api/v1/integrations/connect/instagram/data-deletion/status?code=del-<user_id>` | Built server-side with `request.build_absolute_uri` |
| **SPA** landing after OAuth | `FRONTEND_OAUTH_REDIRECT_URL` (e.g. `https://monitoring.jakhongir.dev/settings/integrations`) | env var; the callback appends `?instagram=connected\|error` |
| **Widget** ingest (site backend) | `https://monitoring.jakhongir.dev/api/v1/integrations/web/events` | `docs/WIDGET.md` |
| **Extension** whoami / events | `<baseUrl>/api/v1/integrations/attribution/me`, `<baseUrl>/api/v1/integrations/attribution/events` | hardcoded in `extension/src/config.js` (`ENDPOINTS`); `baseUrl` comes from extension storage, default `http://localhost:8000` |

The extension also uses `/api/v1/auth/token` and `/api/v1/auth/token/refresh` for its
login — see [`02-auth-and-accounts.md`](./02-auth-and-accounts.md); it is the ordinary
dashboard JWT.

## Endpoints at a glance

| Method | Path | Audience | What |
|---|---|---|---|
| GET | `/api/v1/integrations/accounts/instagram` | dashboard | List connected IG accounts |
| GET | `/api/v1/integrations/accounts/instagram/{id}` | dashboard | Retrieve one |
| PUT/PATCH | `/api/v1/integrations/accounts/instagram/{id}` | dashboard | Update (all fields read-only in practice) |
| DELETE | `/api/v1/integrations/accounts/instagram/{id}` | dashboard | Remove the connection row |
| POST | `/api/v1/integrations/accounts/instagram/{id}/toggle` | dashboard | Pause/resume monitoring (`is_active`) |
| GET | `/api/v1/integrations/connect/instagram/start` | dashboard | Get the Meta authorize URL |
| GET | `/api/v1/integrations/connect/instagram/callback` | Meta → browser | OAuth return; redirects to the SPA |
| POST | `/api/v1/integrations/connect/instagram/deauthorize` | server-to-server (Meta) | App removed by the IG user |
| POST | `/api/v1/integrations/connect/instagram/data-deletion` | server-to-server (Meta) | Data-deletion request |
| GET | `/api/v1/integrations/connect/instagram/data-deletion/status` | Meta / user browser | Deletion confirmation page data |
| POST/GET | `/api/v1/integrations/webhooks/meta` | server-to-server (Meta) | Webhook verify + event receiver |
| GET | `/api/v1/integrations/accounts/telegram` | dashboard | List connected TG userbot accounts |
| GET | `/api/v1/integrations/accounts/telegram/{id}` | dashboard | Retrieve one |
| PUT/PATCH | `/api/v1/integrations/accounts/telegram/{id}` | dashboard | Edit type / consent / default employee |
| POST | `/api/v1/integrations/accounts/telegram/login/qr/start` | dashboard | Begin QR login (primary) |
| POST | `/api/v1/integrations/accounts/telegram/login/qr/poll` | dashboard | Poll QR login |
| POST | `/api/v1/integrations/accounts/telegram/login/start` | dashboard | Begin SMS login (fallback) |
| POST | `/api/v1/integrations/accounts/telegram/login/verify` | dashboard | Submit the SMS code |
| POST | `/api/v1/integrations/accounts/telegram/login/password` | dashboard | Submit the 2FA password |
| POST | `/api/v1/integrations/accounts/telegram/{id}/disconnect` | dashboard | Log out + mark disconnected |
| POST | `/api/v1/integrations/accounts/telegram/{id}/backfill` | dashboard | Request a paid history tier |
| POST | `/api/v1/integrations/accounts/telegram/{id}/backfill/cancel` | dashboard | Cancel the active history job |
| GET | `/api/v1/integrations/accounts/telegram/{id}/backfill/jobs` | dashboard | History-job progress |
| GET | `/api/v1/integrations/accounts/web` | dashboard | List widget accounts (masked key) |
| POST | `/api/v1/integrations/accounts/web` | dashboard | Create a widget account (key revealed once) |
| POST | `/api/v1/integrations/accounts/web/{id}/rotate_key` | dashboard | Mint a new widget key |
| POST | `/api/v1/integrations/web/events` | widget (site backend) | Public ingest, widget-key auth |
| GET | `/api/v1/integrations/attribution/me` | extension | Who am I (employee profile) |
| POST | `/api/v1/integrations/attribution/events` | extension | Batch of captured web-client sends |

**Auth summary**

- Dashboard endpoints: `Authorization: Bearer <JWT>` (SimpleJWT; Django session auth also
  accepted). Permissions: `IsAuthenticated` + `HasCompany`; writes additionally require a
  **manager role** (`owner` / `admin` / `manager`) via `ManagerWriteMixin`.
- Extension endpoints (`/api/v1/integrations/attribution/*`): the **same dashboard JWT** — the employee logs
  into the extension with their normal Kotib account. There is *no* separate extension
  token or secret. The employee is resolved from `request.user`, so it is trusted.
- Widget ingest (`/api/v1/integrations/web/events`): **unauthenticated** in the DRF sense
  (`authentication_classes = []`, `AllowAny`); authorization is the
  `X-Kotib-Widget-Key` header alone.
- Meta callbacks/webhook: unauthenticated, verified by Meta's HMAC
  (`X-Hub-Signature-256`, or the `signed_request` HMAC-SHA256 for the callbacks).

**Listing behaviour (all three account viewsets)**: `pagination_class = None` — the full
list is returned as a plain JSON array, no `count`/`next`/`results` envelope. The global
filter backends are installed, so `?search=` and `?ordering=` are *accepted* by the
schema, but these viewsets declare no `search_fields`/`ordering_fields`/`filterset_fields`
— they have no effect. Server order is `created_at` ascending.

---

## Instagram

Connection is an OAuth round-trip with Meta. Two model rows are involved: the
channel-agnostic `Account` (what conversations hang off, `status` enum) and the
Instagram-specific `InstagramAccount` (what this API exposes, `is_active` + token
expiry). Both are created/updated by the OAuth callback — the frontend never creates
them directly.

### GET /api/v1/integrations/connect/instagram/start

Returns the Meta authorize URL the SPA must navigate to. A browser cannot carry a Bearer
header on a top-level redirect, so the frontend **fetches this with the JWT**, then sets
`window.location = authorize_url`. The caller's company is bound to a single-use `state`
(TTL 10 minutes) that the callback resolves — the callback itself needs no auth.

**Auth & permissions**: dashboard JWT (`JWTAuthentication` or `SessionAuthentication`) +
`IsAuthenticated`. Any authenticated role may call it.

**Params**: none.

**Request body**: none.

**Response `200 OK`**

```json
{
  "authorize_url": "https://www.instagram.com/oauth/authorize?client_id=…&redirect_uri=…&scope=…&state=8Kf3…"
}
```

**Errors**

| Status | `code` | When |
|---|---|---|
| 400 | `user_has_no_company` | The authenticated user is not attached to a company |
| 401 | — | Missing/expired JWT |

### GET /api/v1/integrations/connect/instagram/callback

Meta redirects the **browser** here after the user approves. It is a plain Django view,
not a DRF endpoint: no auth, no JSON. It exchanges the code for a long-lived token,
fetches the profile, creates/updates the `Integration`, the bridge `Account`
(`status=connected`) and the `InstagramAccount`, subscribes the webhooks, then issues a
**302 redirect back to the frontend** at `FRONTEND_OAUTH_REDIRECT_URL`.

**Auth & permissions**: none (the company comes from the single-use `state`).

**Query params** (set by Meta, not by you)

| Name | Type | Required | Description |
|---|---|---|---|
| `code` | string | on success | Authorization code |
| `state` | string | yes | The single-use token issued by `/start` |
| `error` | string | on failure | Meta's error slug |
| `error_description` | string | no | Human text |

**Response**: `302 Found` to
`<FRONTEND_OAUTH_REDIRECT_URL>?instagram=connected`
or, on any failure,
`<FRONTEND_OAUTH_REDIRECT_URL>?instagram=error&reason=<truncated reason, ≤200 chars>`.

**How the SPA detects success**: read the `instagram` query param on the landing route —
`connected` or `error` — show the `reason` on error, then re-fetch
`GET /api/v1/integrations/accounts/instagram` to render the new account. Failure reasons
produced by the backend include `invalid or expired OAuth state`, `missing authorization
code`, `could not determine Instagram user id`, and any Meta API error text.

### GET /api/v1/integrations/accounts/instagram

List the company's connected Instagram accounts.

**Auth & permissions**: dashboard JWT, `IsAuthenticated` + `HasCompany`. Scoped to
`request.user.company_id`.

**Query params**: `search`, `ordering` are accepted but inert (see listing note above).
No pagination.

**Response `200 OK`**

```json
[
  {
    "id": "9d1a5f0e-6c22-4f5a-9a0b-0f2f3d8c1b77",
    "ig_user_id": "17841400000000000",
    "username": "kotib.shop",
    "name": "kotib.shop",
    "is_active": true,
    "token_expires_at": "2026-09-26 11:04:12",
    "last_refreshed_at": "2026-07-28 03:00:05",
    "scopes": ["instagram_business_basic", "instagram_business_manage_messages"]
  }
]
```

Every field is **read-only** — identity, token and scope fields are owned by the connect
flow.

**Errors**: 401 (no/expired JWT), 403 (`HasCompany` — user not attached to a company).

### GET /api/v1/integrations/accounts/instagram/{id}

Single account, same body as one list element.

**Path params**

| Name | Type | Required | Description |
|---|---|---|---|
| `id` | uuid | yes | `InstagramAccount.id` |

**Errors**: 401, 403, 404 (not found *or* belongs to another company — scoping makes
these indistinguishable, by design).

### PUT / PATCH /api/v1/integrations/accounts/instagram/{id}

Present for completeness. **Every serializer field is read-only**, so a write is a no-op
that echoes the object back. Use `/toggle` to pause monitoring, not PATCH.

**Auth & permissions**: dashboard JWT + manager role (`owner`/`admin`/`manager`).

**Request body**: `{}` (nothing is writable).

**Response `200 OK`**: the account object (unchanged).

**Errors**: 401, 403 (`This action requires a manager role.`), 404.

### DELETE /api/v1/integrations/accounts/instagram/{id}

Deletes the `InstagramAccount` row. This does **not** revoke the token at Meta and does
not delete already-ingested conversations. Prefer `/toggle` for "pause monitoring"; use
delete only for a genuine removal.

**Auth & permissions**: dashboard JWT + manager role.

**Response**: `204 No Content` (empty body).

**Errors**: 401, 403, 404.

### POST /api/v1/integrations/accounts/instagram/{id}/toggle

Flips `is_active`. Webhook processing already respects the flag, so this pauses/resumes
monitoring **without re-authenticating** — the token and webhook subscription stay.

**Auth & permissions**: dashboard JWT + manager role.

**Request body**: none (send an empty body).

**Response `200 OK`**: the full account object with the flipped `is_active`.

```json
{
  "id": "9d1a5f0e-6c22-4f5a-9a0b-0f2f3d8c1b77",
  "ig_user_id": "17841400000000000",
  "username": "kotib.shop",
  "name": "kotib.shop",
  "is_active": false,
  "token_expires_at": "2026-09-26 11:04:12",
  "last_refreshed_at": "2026-07-28 03:00:05",
  "scopes": ["instagram_business_basic", "instagram_business_manage_messages"]
}
```

**Errors**: 401, 403, 404.

### Instagram state → what the UI shows

`InstagramAccount` has no `status` string; combine two signals:

| Signal | Value | UI |
|---|---|---|
| `is_active` | `true` | "Monitoring" — offer **Pause** (`/toggle`) |
| `is_active` | `false` | "Paused" — offer **Resume** (`/toggle`). Also set by Meta's deauthorize callback: if the user removed the app in Instagram, resuming needs a full reconnect |
| `token_expires_at` | in the future | normal |
| `token_expires_at` | near (< ~7 days) | "Token expiring" warning — a background refresh normally handles it; surface a **Reconnect** button anyway |
| `token_expires_at` | past / `null` | "Reconnect required" — the only fix is the OAuth round-trip (`/api/v1/integrations/connect/instagram/start`) |

The bridge `Account.status` (`pending` / `connected` / `disconnected` / `error`) is not
exposed on this endpoint; deauthorize sets it to `disconnected` and clears `is_active`,
so `is_active=false` is the frontend's disconnected signal.

### POST /api/v1/integrations/connect/instagram/deauthorize — **NOT for frontend**

Meta posts a signed `signed_request` here when an Instagram user removes the app.
Unauthenticated; the HMAC-SHA256 over the payload with `META_APP_SECRET` is the auth.
Deactivates every matching `InstagramAccount` (`is_active=false`) and sets the bridge
`Account.status = disconnected`. Returns `200` (empty) on success, `400` on a bad or
unverifiable signature. Excluded from the OpenAPI schema.

### POST /api/v1/integrations/connect/instagram/data-deletion — **NOT for frontend**

Meta's data-deletion callback (an App Review prerequisite). Same `signed_request`
verification. Synchronously anonymizes matching `Customer` rows and erases message text,
transcripts, audio files and the AI-generated quotes across tenants, then returns Meta's
contract:

```json
{
  "url": "https://monitoring.jakhongir.dev/api/v1/integrations/connect/instagram/data-deletion/status?code=del-17841400000000000",
  "confirmation_code": "del-17841400000000000"
}
```

`400` on bad signature. Excluded from the schema.

### GET /api/v1/integrations/connect/instagram/data-deletion/status — **NOT for frontend**

The status URL returned above. Unauthenticated. Deletion is synchronous, so it always
reports complete.

**Query params**: `code` (string, optional) — echoed back.

**Response `200 OK`**: `{"status": "complete", "confirmation_code": "del-1784140…"}`

### GET / POST /api/v1/integrations/webhooks/meta — **NOT for frontend**

Server-to-server only, excluded from the schema.

- `GET` — Meta's subscription handshake: `hub.mode=subscribe`, `hub.verify_token`,
  `hub.challenge`. Returns the challenge as `text/plain` on match, `403` otherwise.
- `POST` — event receiver. Verifies `X-Hub-Signature-256` against `META_APP_SECRET`
  (`403` on mismatch), persists each entry as a `WebhookEvent`, enqueues a Celery task,
  returns `200`. `400` on malformed JSON. It never calls Meta and never replies to a
  customer.

---

## Telegram (userbot)

Telegram connects by logging a **real Telegram account** in via MTProto. Two flows:

- **QR (primary)**: `login/qr/start` → render the returned `url` as a QR code → poll
  `login/qr/poll` until `status = "connected"`. Telegram rotates the QR token roughly
  every 30 s, so each `pending` poll returns a **fresh `url`** that must be re-rendered.
- **SMS (fallback)**: `login/start` (phone) → `login/verify` (code) → `login/password`
  when the account has 2FA.

Both flows carry the same **onboarding fields** (`account_type`, `legal_consent`,
`default_employee`) submitted at *start* and applied when the account is finalized.
Partial login state lives in a server-side cache keyed by `login_id`; it expires
(`login_expired`).

`login/qr/start` and `login/start` are throttled at **10 requests/hour per company**
(`429 Too Many Requests`).

On the **first** successful connect, a Tier 0 history job (180 days, raw, unscored) is
created automatically — expect a job to appear in `backfill/jobs` right away.

### POST /api/v1/integrations/accounts/telegram/login/qr/start

Begins a QR login and returns the `tg://login?token=…` URL to render as a QR code.

**Auth & permissions**: dashboard JWT + manager role (it is a POST →
`ManagerWriteMixin`). Throttled: 10/hour/company.

**Request body**

```jsonc
{
  "account_type": "company",          // optional, enum: "company" | "personal", default "company"
  "legal_consent": false,             // optional, default false; REQUIRED true when account_type = "personal"
  "default_employee": null            // optional uuid | null — Employee this account's conversations belong to (attribution mode 1)
}
```

**Response `201 Created`**

```json
{
  "login_id": "3f8a1c9b4d2e4f0aa1b2c3d4e5f60718",
  "url": "tg://login?token=AQAAAO0hK1s…",
  "status": "pending"
}
```

**Errors**

| Status | `code` | When |
|---|---|---|
| 400 | `consent_required` | `account_type=personal` without `legal_consent=true` |
| 400 | `employee_other_company` | `default_employee` belongs to another tenant |
| 400 | `qr_start_failed` | Telegram/network failure starting the login |
| 400 | `flood_wait` | Telegram flood-wait (detail names the seconds) |
| 401 / 403 | — | No JWT / not a manager |
| 429 | — | Login throttle (10/hour/company) |

### POST /api/v1/integrations/accounts/telegram/login/qr/poll

Polls a pending QR login. Poll every ~2–3 s; re-render the QR whenever a `pending`
response carries a new `url`.

**Auth & permissions**: dashboard JWT + manager role.

**Request body**

```jsonc
{ "login_id": "3f8a1c9b4d2e4f0aa1b2c3d4e5f60718" }   // required
```

**Response — still waiting, `200 OK`**

```json
{
  "status": "pending",
  "url": "tg://login?token=AQAAAO0hK1s…",
  "login_id": "3f8a1c9b4d2e4f0aa1b2c3d4e5f60718"
}
```

**Response — account has 2FA, `200 OK`** (continue with `login/password`)

```json
{ "status": "password_required", "login_id": "3f8a1c9b4d2e4f0aa1b2c3d4e5f60718" }
```

**Response — done, `201 Created`**

```json
{
  "status": "connected",
  "account": {
    "id": "b6f0e2d1-9c44-4c1e-8a10-2f7d5e9c0011",
    "external_id": "553412789",
    "name": "Aziz Karimov",
    "account_type": "company",
    "default_employee": null,
    "legal_consent": false,
    "status": "connected",
    "connected_at": "2026-07-29 10:12:44",
    "last_healthy_at": "2026-07-29 10:12:44",
    "created_at": "2026-07-29 10:12:44"
  }
}
```

**Errors**

| Status | `code` | When |
|---|---|---|
| 400 | `login_expired` | Unknown/expired `login_id` (restart the flow) |
| 400 | `qr_poll_failed` | Telegram/network failure while polling |
| 400 | `flood_wait` | Telegram flood-wait |
| 400 | `account_taken` | That Telegram account is already connected to another company |
| 401 / 403 | — | No JWT / not a manager |

### POST /api/v1/integrations/accounts/telegram/login/start

SMS fallback: sends the login code to the phone and returns a `login_id`.

**Auth & permissions**: dashboard JWT + manager role. Throttled: 10/hour/company.

**Request body**

```jsonc
{
  "phone": "+998901234567",   // required; normalized server-side to digits only
  "account_type": "company",  // optional enum "company" | "personal"
  "legal_consent": false,     // required true when account_type = "personal"
  "default_employee": null    // optional uuid | null
}
```

**Response `201 Created`**

```json
{ "login_id": "7c2b9e1f0a5d4e83b6c7d8e9f0a1b2c3", "status": "code_sent" }
```

**Errors**

| Status | `code` | When |
|---|---|---|
| 400 | `phone_invalid` | Not ≥7 digits / not international format |
| 400 | `phone_taken` | That phone is already connected to another company |
| 400 | `phone_banned` | Telegram has banned the number |
| 400 | `code_send_failed` | Telegram/network failure sending the code |
| 400 | `flood_wait` | Telegram flood-wait |
| 400 | `consent_required` / `employee_other_company` | Onboarding validation (see QR start) |
| 401 / 403 | — | No JWT / not a manager |
| 429 | — | Login throttle |

### POST /api/v1/integrations/accounts/telegram/login/verify

Submits the SMS code.

**Auth & permissions**: dashboard JWT + manager role.

**Request body**

```jsonc
{
  "login_id": "7c2b9e1f0a5d4e83b6c7d8e9f0a1b2c3",  // required
  "code": "51274"                                   // required
}
```

**Response — 2FA needed, `200 OK`**

```json
{ "status": "password_required", "login_id": "7c2b9e1f0a5d4e83b6c7d8e9f0a1b2c3" }
```

**Response — connected, `201 Created`**: same `{"status": "connected", "account": {…}}`
body as the QR poll.

**Errors**

| Status | `code` | When |
|---|---|---|
| 400 | `code_invalid` | Wrong or expired code |
| 400 | `login_expired` | Unknown/expired `login_id` |
| 400 | `code_verify_failed` | Telegram/network failure |
| 400 | `flood_wait` | Telegram flood-wait |
| 400 | `account_taken` | Account already connected to another company |
| 401 / 403 | — | No JWT / not a manager |

### POST /api/v1/integrations/accounts/telegram/login/password

Submits the Telegram 2FA (cloud) password. Only valid after a `password_required`
response.

**Auth & permissions**: dashboard JWT + manager role.

**Request body**

```jsonc
{
  "login_id": "7c2b9e1f0a5d4e83b6c7d8e9f0a1b2c3",  // required
  "password": "•••••••"                             // required, write-only
}
```

**Response `201 Created`**: `{"status": "connected", "account": {…}}`.

**Errors**

| Status | `code` | When |
|---|---|---|
| 400 | `password_not_required` | This login never asked for a password |
| 400 | `password_rejected` | Wrong 2FA password (or Telegram error) |
| 400 | `login_expired` | Unknown/expired `login_id` |
| 400 | `flood_wait` | Telegram flood-wait |
| 400 | `account_taken` | Account already connected to another company |
| 401 / 403 | — | No JWT / not a manager |

### GET /api/v1/integrations/accounts/telegram

List the company's Telegram accounts.

**Auth & permissions**: dashboard JWT, `IsAuthenticated` + `HasCompany`.

**Query params**: `search` / `ordering` accepted but inert. No pagination.

**Response `200 OK`**

```json
[
  {
    "id": "b6f0e2d1-9c44-4c1e-8a10-2f7d5e9c0011",
    "external_id": "553412789",
    "name": "Aziz Karimov",
    "account_type": "personal",
    "default_employee": "1c4a77b2-0e33-4a58-9f00-6de8b1a2c333",
    "legal_consent": true,
    "status": "connected",
    "connected_at": "2026-07-29 10:12:44",
    "last_healthy_at": "2026-07-29 11:40:02",
    "created_at": "2026-07-29 10:12:44"
  }
]
```

**Errors**: 401, 403.

### GET /api/v1/integrations/accounts/telegram/{id}

Single account; body as above. **Errors**: 401, 403, 404.

### PUT / PATCH /api/v1/integrations/accounts/telegram/{id}

Edit the writable settings of a connected account.

**Auth & permissions**: dashboard JWT + manager role.

**Path params**: `id` (uuid, required).

**Request body** (writable fields only; PATCH may send any subset)

```jsonc
{
  "name": "Sales line 1",                                  // optional string
  "account_type": "personal",                              // optional enum: "company" | "personal"
  "default_employee": "1c4a77b2-0e33-4a58-9f00-6de8b1a2c333", // optional uuid | null (attribution mode 1)
  "legal_consent": true                                    // optional bool; must be true when account_type = "personal"
}
```

Read-only: `id`, `external_id`, `status`, `connected_at`, `last_healthy_at`,
`created_at`.

**Response `200 OK`**: the updated account object.

**Errors**

| Status | `code` | When |
|---|---|---|
| 400 | `consent_required` | `personal` without `legal_consent=true` |
| 400 | `employee_other_company` | `default_employee` from another tenant |
| 401 / 403 | — | No JWT / not a manager |
| 404 | — | Unknown id or other tenant |

### POST /api/v1/integrations/accounts/telegram/{id}/disconnect

Logs the userbot out of Telegram (best effort) and marks the account disconnected.
Ingested history is kept. Reconnecting means running the login flow again.

**Auth & permissions**: dashboard JWT + manager role.

**Request body**: none.

**Response `200 OK`**

```json
{ "detail": "Telegram account disconnected." }
```

**Errors**

| Status | `code` | When |
|---|---|---|
| 400 | `account_not_found` | No such Telegram account for this company |
| 401 / 403 | — | No JWT / not a manager |

### POST /api/v1/integrations/accounts/telegram/{id}/backfill

Requests a **paid history-scoring tier**. Tier 0 (6 months raw, unscored) already ran
automatically at first connect; this asks the runner to replay history and queue the
resulting legacy conversations for scoring. Only **one** job may be pending/running per
account (DB-enforced).

**Auth & permissions**: dashboard JWT + manager role.

**Path params**: `id` (uuid, required) — `Account.id`.

**Request body**

```jsonc
{ "scope": "tier_b" }   // required, enum: "tier_b" (last 30 days) | "tier_c" (last 6 months)
```

**Response `201 Created`**

```json
{
  "id": "0f6c2a9b-1c1e-4c9a-9c4d-9d0f2a4e5b61",
  "account": "b6f0e2d1-9c44-4c1e-8a10-2f7d5e9c0011",
  "scope": "tier_b",
  "status": "pending",
  "progress_pct": 0,
  "fetched_messages": 0,
  "started_at": null,
  "completed_at": null,
  "error": "",
  "created_at": "2026-07-29 12:00:00"
}
```

**Errors**

| Status | `code` | When |
|---|---|---|
| 400 | `account_not_connected` | `Account.status != "connected"` |
| 400 | `backfill_already_running` | A pending/running job already exists for this account |
| 400 | — (`scope`) | Invalid enum value |
| 401 / 403 | — | No JWT / not a manager |
| 404 | — | Unknown id or other tenant |

### POST /api/v1/integrations/accounts/telegram/{id}/backfill/cancel

Cancels the account's active (`pending` or `running`) history job and closes anything the
replay parked open. Needed when a job is stuck because the runner never reported on it —
otherwise the one-active-job rule blocks every future tier.

**Auth & permissions**: dashboard JWT + manager role.

**Request body**: none.

**Response `200 OK`**: the job object with `status: "cancelled"` and a `completed_at`
timestamp.

```json
{
  "id": "0f6c2a9b-1c1e-4c9a-9c4d-9d0f2a4e5b61",
  "account": "b6f0e2d1-9c44-4c1e-8a10-2f7d5e9c0011",
  "scope": "tier_b",
  "status": "cancelled",
  "progress_pct": 0,
  "fetched_messages": 8421,
  "started_at": "2026-07-29 12:00:11",
  "completed_at": "2026-07-29 12:44:03",
  "error": "",
  "created_at": "2026-07-29 12:00:00"
}
```

**Errors**

| Status | `code` | When |
|---|---|---|
| 400 | `backfill_not_running` | No pending/running job for this account |
| 401 / 403 | — | No JWT / not a manager |
| 404 | — | Unknown id or other tenant |

### GET /api/v1/integrations/accounts/telegram/{id}/backfill/jobs

The account's history jobs, newest first, capped at **20** (the auto Tier 0 job included).

**Auth & permissions**: dashboard JWT, `IsAuthenticated` + `HasCompany` (a read — no
manager role needed).

**Query params**: `search` / `ordering` accepted but inert.

**Response `200 OK`**

```json
[
  {
    "id": "0f6c2a9b-1c1e-4c9a-9c4d-9d0f2a4e5b61",
    "account": "b6f0e2d1-9c44-4c1e-8a10-2f7d5e9c0011",
    "scope": "tier_b",
    "status": "running",
    "progress_pct": 0,
    "fetched_messages": 8421,
    "started_at": "2026-07-29 12:00:11",
    "completed_at": null,
    "error": "",
    "created_at": "2026-07-29 12:00:00"
  },
  {
    "id": "44b1c2d3-5e6f-4708-91a2-b3c4d5e6f708",
    "account": "b6f0e2d1-9c44-4c1e-8a10-2f7d5e9c0011",
    "scope": "tier_0",
    "status": "completed",
    "progress_pct": 100,
    "fetched_messages": 51203,
    "started_at": "2026-07-29 10:12:50",
    "completed_at": "2026-07-29 11:02:19",
    "error": "",
    "created_at": "2026-07-29 10:12:44"
  }
]
```

`scope` enum: `tier_0` (raw 6 months, auto), `tier_a` (unscored default),
`tier_b` (last 30 days), `tier_c` (last 6 months).
`status` enum: `pending`, `running`, `cancelled`, `completed`, `error`.

**Progress UI rule**: the runner reports a *running count*, not a percentage —
`progress_pct` stays `0` until completion. While `status = "running"`, show
`fetched_messages` ("51 203 messages fetched"), not a progress bar.

**Errors**: 401, 403, 404.

### Telegram `Account.status` → UI

| `status` | Meaning | UI |
|---|---|---|
| `pending` | Row exists, login not finished | "Connecting…" — resume/restart the login flow |
| `connected` | Session live | "Connected", show `last_healthy_at` |
| `disconnected` | Logged out (via `/disconnect`, or the session was revoked from a Telegram device) | "Disconnected" + **Reconnect** (re-run the login flow) |
| `error` | Session broken server-side (e.g. `AUTH_KEY_UNREGISTERED`) | Red banner "Session expired — reconnect" + **Reconnect** |

A stale `last_healthy_at` (no update for ~15 minutes) is the early warning that a session
is going bad even while `status` still reads `connected`.

Telegram is **DM-only by design** — group chats are deliberately not monitored.

---

## Web widget

Kotib does not host the site chat. The company's own chat/backend reports each message
server-to-server. See `docs/WIDGET.md` for the full channel description.

### GET /api/v1/integrations/accounts/web

List the company's widget accounts. The widget key is **masked** here (last 4 characters
only) — it is revealed exactly once, in the create response.

**Auth & permissions**: dashboard JWT, `IsAuthenticated` + `HasCompany`.

**Query params**: `search` / `ordering` accepted but inert. No pagination.

**Response `200 OK`**

```json
[
  {
    "id": "5a2e9c31-8b44-4f11-9c0a-2b7d4e6f8a90",
    "name": "Main site",
    "widget_key": "…8f3a",
    "status": "connected",
    "connected_at": "2026-07-20 08:15:00",
    "created_at": "2026-07-20 08:15:00"
  }
]
```

**Errors**: 401, 403.

### POST /api/v1/integrations/accounts/web

Creates a widget account and **mints the widget key**. The full key is returned only in
this response — there is no way to read it back later; a manager who loses it rotates it.

**Auth & permissions**: dashboard JWT + manager role.

**Request body**

```jsonc
{ "name": "Main site" }   // optional string; everything else is server-assigned
```

Server-assigned: `channel=web`, `external_id` = the fresh key, `status=connected`,
`connected_at=now`, `company` = the caller's tenant.

**Response `201 Created`**

```json
{
  "id": "5a2e9c31-8b44-4f11-9c0a-2b7d4e6f8a90",
  "name": "Main site",
  "widget_key": "Rm9vQmFyQmF6UXV4MTIzNDU2Nzg5MGFi",
  "status": "connected",
  "connected_at": "2026-07-29 09:00:00",
  "created_at": "2026-07-29 09:00:00"
}
```

> Show the key once, with a copy button and an explicit "store this server-side, it will
> not be shown again" warning. **Never** put it in page JavaScript — anyone holding it can
> post fabricated messages.

**Errors**: 401, 403 (not a manager).

### POST /api/v1/integrations/accounts/web/{id}/rotate_key

Mints a new widget key. The old key **stops working immediately**, so the site must be
updated first (or at the same moment).

**Auth & permissions**: dashboard JWT + manager role.

**Path params**: `id` (uuid, required).

**Request body**: none.

**Response `200 OK`**: the account with `widget_key` revealed in full (same shape as the
create response).

**Errors**: 401, 403, 404.

### POST /api/v1/integrations/web/events — **widget / site backend, public endpoint**

The widget ingest endpoint. **Unauthenticated in the DRF sense** (`AllowAny`, no
authentication classes) — the `X-Kotib-Widget-Key` header alone identifies and authorizes
the account, so it must be called **server-to-server** from the company's backend, never
from browser JavaScript. Not called by the dashboard SPA.

**Auth & permissions**

| Header | Required | Description |
|---|---|---|
| `X-Kotib-Widget-Key` | yes | The account's `external_id`. Must match a `web` channel account with `status = connected` |

**Full request (as the site backend sends it)**

```http
POST https://monitoring.jakhongir.dev/api/v1/integrations/web/events
X-Kotib-Widget-Key: Rm9vQmFyQmF6UXV4MTIzNDU2Nzg5MGFi
Content-Type: application/json
```

**Request body**

```jsonc
{
  "events": [                      // required, 1–100 items
    {
      "customer_id": "visitor-8f3a",        // required, ≤128 — the site's stable visitor/session id
      "client_message_id": "m-1024",        // required, ≤128 — unique per account; redelivery is a safe no-op
      "direction": "inbound",               // required, enum: "inbound" | "outbound"
      "text": "Salom, narxi qancha?",       // optional, ≤8000, default ""
      "message_type": "text",               // optional, enum: text|voice|image|video|file|sticker|location|other (default "text")
      "sent_at": "2026-07-28T09:41:00Z",    // optional ISO-8601; defaults to server now
      "customer_name": "Site visitor",      // optional, ≤255, default ""
      "employee": "1c4a77b2-0e33-4a58-9f00-6de8b1a2c333"  // optional uuid — OUTBOUND only: the Kotib Employee handling the chat
    }
  ]
}
```

**Response `201 Created`**

```json
{ "accepted": 1 }
```

`accepted` counts only **newly stored** messages — redelivered `client_message_id`s are
silently skipped, so `accepted` may be lower than the number of events sent. That is
success, not an error.

**Attribution semantics**: an outbound event's `employee` is *in-band ground truth*. It
stamps the conversation with `attribution_source = "widget"` and overrides whatever the
ingest funnel inferred first (mode 1's account default, mode 2's shift guess). Latest
outbound wins. A **manual** manager assignment (`attribution_source = "manual"`) is never
overwritten.

**Errors**

| Status | `code` | When |
|---|---|---|
| 400 | `widget_key_invalid` | Missing header, unknown key, or the account is not `connected` |
| 400 | — (field errors) | Missing `customer_id`/`client_message_id`/`direction`/`sent_at` format, bad enum, empty or >100 `events` |

Read-only by construction: this endpoint only listens; Kotib never posts back into the
site chat.

---

## Attribution (Chrome extension)

Attribution mode 3. The Kotib browser extension watches Telegram Web / Instagram Web and
reports "this employee sent this message". It is **not** a message source — the real
messages arrive via the Meta webhook / Telethon runner; these events only fix *who* sent
them. Messages sent without the extension produce no event, so their conversation stays
unattributed and is excluded from employee KPIs.

**Auth scheme**: the **same dashboard JWT** as the SPA — the employee signs into the
extension with their normal Kotib account (`Authorization: Bearer <JWT>`). There is no
separate extension token, API key or shared secret. Permissions: `IsAuthenticated` +
`HasCompany`, plus the user must be linked to an **active `Employee`** profile.

These two endpoints are consumed by the extension, not by the dashboard SPA — but a
settings screen may call `/api/v1/integrations/attribution/me` to show the manager whether an employee's
extension is correctly linked.

### GET /api/v1/integrations/attribution/me

Confirms the token works and identifies the employee behind it. The extension calls this
right after login.

**Auth & permissions**: dashboard JWT, `IsAuthenticated` + `HasCompany`, and the user
must have an active `Employee` profile.

**Params**: none.

**Response `200 OK`**

```json
{
  "employee_id": "1c4a77b2-0e33-4a58-9f00-6de8b1a2c333",
  "full_name": "Aziz Karimov",
  "company": "Kotib Shop LLC"
}
```

**Errors**

| Status | `code` | When |
|---|---|---|
| 400 | `no_employee_profile` | The user is not linked to an active employee profile (e.g. a manager-only login, or a deactivated employee) |
| 401 | — | Missing/expired JWT |
| 403 | — | `HasCompany` — user not attached to a company |

### POST /api/v1/integrations/attribution/events

Accepts a batch of captured web-client sends. Events are stored as `pending`; correlation
to the real stored messages happens later, when their conversations close (a periodic
sweep is the backstop).

**Auth & permissions**: dashboard JWT, `IsAuthenticated` + `HasCompany`, active
`Employee` required. The employee is taken from `request.user` — the payload cannot
name another employee.

**Request body**

```jsonc
{
  "events": [                       // required, 1–200 items
    {
      "channel": "telegram",                     // optional enum: "telegram" | "instagram" | "web" (default "telegram")
      "direction": "outbound",                   // optional enum: "inbound" | "outbound" (default "outbound")
      "chat_id": "-1001234567890",               // required, ≤128 — peer/chat id as the web client shows it
      "sent_at": "2026-07-29T13:22:05Z",         // required, ISO-8601 UTC (client send time)
      "text": "Narxi 850 000 so'm",              // optional, default "" (empty for media)
      "message_type": "text",                    // optional, ≤20, default "text"
      "message_id": "3391",                      // optional, ≤64 — Telegram only (data-mid); enables an exact match
      "peer_id": "17841400000000000",            // optional, ≤128 — Instagram only: the customer's IGSID
      "peer_username": "customer.handle"         // optional, ≤128 — Instagram only: peer @username from the DM header
    }
  ]
}
```

**Response `201 Created`**

```json
{ "accepted": 12 }
```

`accepted` is the number of events stored (all of them — this endpoint does not dedupe).
Stored events start at `status = "pending"` and later become `matched` or `unmatched`;
those states are internal and not exposed on this API.

**Errors**

| Status | `code` | When |
|---|---|---|
| 400 | `no_employee_profile` | User not linked to an active employee profile |
| 400 | — (field errors) | Empty `events`, >200 items, missing `chat_id`/`sent_at`, bad `channel`/`direction` enum |
| 401 | — | Missing/expired JWT |
| 403 | — | Not attached to a company |

---

## Attribution modes (what a settings screen configures)

One mode applies to **all channels** of a tenant (no hybrid in v1). It lives on the
company record (`Company.attribution_mode`, an integer) — configured through the
companies API, see [`02-auth-and-accounts.md`](./02-auth-and-accounts.md) (`PATCH
/api/v1/companies/me`); documented here because it is what the channel settings screens
are for.

| Mode | Value | How it decides | What the frontend must set up |
|---|---|---|---|
| Account | `1` | Every conversation on an account belongs to that account's `default_employee` | Set `default_employee` on each Telegram account (`PATCH /api/v1/integrations/accounts/telegram/{id}`) |
| Shift | `2` | Whoever was on shift when the conversation started | Fill each employee's `working_hours` schedule and set the company `timezone` |
| Extension | `3` | The Chrome extension reports the sender | Each employee installs the extension and signs in; verify with `GET /api/v1/integrations/attribution/me` |

**Mode 2 details** — `Employee.working_hours` is a list of wall-clock **LOCAL** entries:

```json
[{"weekday": 0, "start": "09:00", "end": "18:00"}]
```

`weekday` 0 = Monday. Message timestamps are UTC, so every comparison is done in
`Company.timezone` (default `Asia/Tashkent`). **Overnight shifts are supported**: an
`end` earlier than `start` (e.g. `22:00`–`06:00`) covers the tail of its own weekday and
the head of the next. Overlapping shifts resolve to whoever sent an outbound message in
the last 30 minutes (continuity), else the first entry in the schedule. Nobody on shift →
the conversation stays unassigned for a manager to resolve.

**The manual rule.** A conversation assigned by a human carries
`attribution_source = "manual"` and is **never** overwritten by any automatic mode —
not mode 1, not mode 2, not the extension, not the widget's in-band employee. Surface
manually-assigned conversations as locked-in; only another manual assignment changes them.

`Conversation.attribution_source` values a UI may encounter: `mode_1`, `mode_2_shift`,
`mode_3_extension`, `widget`, `legacy`, `manual`, or empty (unassigned).

---

## Frontend notes

**Settings page, per channel**

- **Instagram** — "Connect Instagram" button → `GET /connect/instagram/start` with the
  JWT → `window.location = authorize_url`. Meta returns the browser to
  `FRONTEND_OAUTH_REDIRECT_URL?instagram=connected|error[&reason=…]`. On that route: read
  the param, toast success or the reason, then refetch
  `GET /api/v1/integrations/accounts/instagram`. Per account offer **Pause/Resume** (`/toggle`),
  and **Reconnect** (re-run `/start`) when `is_active` is false or `token_expires_at` is
  near/past. The OAuth state expires after 10 minutes — if the user sits on Meta's screen
  too long they come back with `reason=invalid or expired OAuth state`; just restart.
- **Telegram** — default to the **QR** flow: `POST login/qr/start` with the onboarding
  fields, render `url` as a QR, then `POST login/qr/poll` every 2–3 s, **re-rendering the
  QR each time a `pending` response returns a new `url`** (Telegram rotates it ~30 s).
  Handle `password_required` by showing a 2FA password field →
  `POST login/password`. Offer "Use SMS instead" → `login/start` → `login/verify` →
  (`login/password`). Show the consent checkbox whenever `account_type = personal` — the
  API rejects the combination otherwise (`consent_required`). Respect the 10/hour/company
  throttle: on `429`, disable the start button and say when to retry. After connect, the
  Tier 0 history job appears immediately in `backfill/jobs`.
- **Web** — "Create widget account" → `POST /api/v1/integrations/accounts/web` → show `widget_key` **once**
  in a copy-to-clipboard modal with the "server-side only" warning, plus the embed
  snippet from `docs/WIDGET.md` (the site backend adds the key header;
  `POST /api/v1/integrations/web/events`). Listings only ever show `…8f3a`, so the recovery path
  is **Rotate key** (`POST /api/v1/integrations/accounts/web/{id}/rotate_key`), which invalidates the old one instantly — warn
  before rotating.

**Reconnect UX**

- Instagram: `is_active=false` or an expired `token_expires_at` → full OAuth round-trip.
  There is no silent re-auth.
- Telegram: `status` in `disconnected` / `error`, or a `last_healthy_at` older than ~15
  minutes → red banner with **Reconnect**, which restarts the QR/SMS login for the same
  account (a re-login does not re-trigger Tier 0 and leaves a user-chosen `name` alone).
- Web: keys never expire; the only failure is a wrong/rotated key, which the site backend
  sees as `widget_key_invalid` — surface it as "the site is using an old key, rotate and
  update".

**Polling**

- Telegram QR: 2–3 s while the modal is open; stop on `connected`, `password_required`,
  or any 4xx.
- Backfill progress: poll `backfill/jobs` every ~10 s while a job is `pending`/`running`;
  display `fetched_messages`, not `progress_pct` (which stays `0` until completion). Offer
  **Cancel** (`backfill/cancel`) for a job stuck at `pending` — that is the only way to
  unblock future tiers.
- Connection health: refetch the account lists on settings-page focus (and every ~60 s if
  the page stays open) to pick up `status` / `is_active` / `last_healthy_at` changes
  driven by background workers.

**Never build**: a message composer, quick-reply, "mark as read" or notification-send
control anywhere in this product. The backend has no endpoint for it and never will.
