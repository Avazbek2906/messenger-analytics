# API changelog

Changes to the frontend-facing API **since docs 01–07 were written**. Everything here
is additive except the one behaviour change in §3 — no endpoint was removed and no
response field disappeared.

Conventions are unchanged: full paths under `https://monitoring.jakhongir.dev/api/v1`,
no trailing slashes, match errors on `code`. See
[01-conventions](./01-conventions.md).

---

## 2026-08-02

### 1. Onboarding no longer needs the Django admin

Creating a login used to require a superuser in `/admin`. There are now three API paths
onto it, and **all three return the password exactly once** — it is hashed at rest and
cannot be read back. Show it, let the user copy it, and never re-fetch it.

#### `POST /api/v1/companies/users/invite` — new

Create a login inside your own company. **Manager role required** (`owner` / `admin` /
`manager`).

```jsonc
// request
{
  "username": "aziza.k",        // required; unique across the PLATFORM, not per tenant
  "role": "manager",            // owner | admin | manager | viewer — default "viewer"
  "email": "",                  // optional
  "first_name": "",             // optional
  "last_name": "",              // optional
  "password": "",               // optional — omit and one is generated for you
  "employee": null              // optional uuid — link this login to an existing employee
}
```

```jsonc
// 201
{
  "id": "956c386a-7e2c-4269-88b9-2e08ec7d21cb",
  "username": "aziza.k",
  "email": "", "first_name": "", "last_name": "",
  "role": "manager",
  "company": "9a470a02-b261-4c0a-b43a-97c9e5484a41",
  "employee": null,                    // echoes the linked employee, if any
  "password": "4PNW3Vy7EwOSZzdt"       // ← ONCE. Never returned again.
}
```

**`company` is never read from the body** — it is stamped from the caller, and
`is_staff` / `is_superuser` are unreachable. A tenant login can never be platform staff.

**Roles you may grant are limited by your own** — otherwise a manager could invite an
owner and take the tenant:

| Your role | Can grant |
|---|---|
| `owner`, `admin` | `owner`, `admin`, `manager`, `viewer` |
| `manager` | `manager`, `viewer` |

Pass `employee` to link the login to an existing employee in the same call. **That link
is what `/aaaaapi/v1/dashboard/me` and the browser extension require** — a login without it
has no employee cabinet and cannot use the extension.

| Status | `code` | `attr` | When |
|---|---|---|---|
| 400 | `username_required` | `username` | Blank or whitespace-only |
| 400 | `username_taken` | `username` | Case-insensitive match on an existing user, **any tenant** |
| 400 | `role_not_grantable` | `role` | Your role may not grant that role (table above) |
| 400 | `password_invalid` | `password` | Fails Django's validators; `detail` carries the reasons |
| 400 | `employee_other_company` | `employee` | That employee belongs to another tenant |
| 400 | `employee_already_linked` | `employee` | That employee already has a login |
| 403 | `permission_denied` | — | Caller is a `viewer` |

#### `POST /api/v1/companies/employees` — gained `account`, `user`, `credentials`

The employee create/update body documented in
[02-auth-and-accounts](./02-auth-and-accounts.md#post-apiv1companiesemployees) now
accepts two more fields, and the response carries one:

| Field | Direction | Notes |
|---|---|---|
| `account` | write-only | Nested invite body (same rules and error codes as above, minus `employee`). Creates the employee **and** their login in one atomic call. |
| `user` | read/write | uuid of an **existing** login to link instead. |
| `credentials` | read-only | `{username, password}` — present only on the create response when `account` was passed; `null` otherwise. |

```jsonc
// POST /api/v1/companies/employees
{
  "full_name": "Aziza Karimova",
  "department": "Sotuv",
  "account": {"username": "aziza.k", "role": "viewer"}
}
```

```jsonc
// 201
{
  "id": "e562be93-ce81-4387-af3d-25faef0e0383",
  "full_name": "Aziza Karimova",
  "department": "Sotuv",
  "is_active": true,
  "working_hours": null,
  "user": "b039ccec-7605-45d1-b0fb-931bf429d1f8",
  "credentials": {"username": "aziza.k", "password": "EZG8WACgUoYqJdK4"},
  "created_at": "2026-08-02 13:04:39"
}
```

`user` and `account` are mutually exclusive — sending both is `400 user_and_account`.
Employee and login are created in one transaction, so a rejected username leaves **no**
employee behind; retry the whole call.

> ⚠️ **`account` is create-only.** The generated schema lists it on `PUT`/`PATCH` too,
> but updates silently ignore it — no login is created and no error is raised. To give
> an existing employee a login, use `POST /api/v1/companies/users/invite` with
> `employee`, or `PATCH` the employee with a `user` uuid.

New error codes on this endpoint: every code from the invite table above (reported
against `attr: "account"`), plus:

| Status | `code` | `attr` | When |
|---|---|---|---|
| 400 | `user_and_account` | — | Both `user` and `account` were sent |
| 400 | `user_other_company` | `user` | That login belongs to another tenant |
| 400 | `user_already_linked` | `user` | That login is already on another employee |

### 2. Password management

#### `POST /api/v1/companies/users/{id}/reset-password` — new

A manager resets **someone else's** password — the locked-out-employee path.
**Manager role required.** `{id}` is the `User` uuid, not the employee's.

```jsonc
{"password": "Ch0sen!Passw0rd"}   // optional — omit (or send {}) to have one generated
```

```jsonc
// 200 — same shape as the invite response
{
  "id": "956c386a-…", "username": "aziza.k",
  "email": "", "first_name": "", "last_name": "",
  "role": "manager", "company": "9a470a02-…",
  "password": "u7Br3chhQfaMy0gj"
}
```

> **The `employee` key is absent here**, not `null` — unlike the invite response, which
> always includes it. Read it with a presence check, not `response.employee === null`.

| Status | `code` | When |
|---|---|---|
| 400 | `user_not_found` | No such user **in your tenant** — another tenant's user reads the same way, so existence never leaks |
| 400 | `user_is_staff` | Target is a platform superuser; those are not managed here |
| 400 | `role_not_grantable` | You may only reset a user whose role you could have granted — a `manager` cannot reset the `owner` |
| 400 | `password_invalid` | Explicit password fails Django's validators |
| 403 | `permission_denied` | Caller is a `viewer` |

#### `POST /api/v1/companies/users/me/password` — new

Any authenticated user changes their **own** password — the natural follow-up to being
handed a generated one. No role requirement.

```jsonc
{"current_password": "…", "new_password": "…"}   // both required
```

```jsonc
// 200
{"detail": "Password changed."}
```

Requiring the current password means a stolen access token alone cannot seize the
account.

| Status | `code` | `attr` | When |
|---|---|---|---|
| 400 | `current_password_invalid` | `current_password` | Wrong current password |
| 400 | `password_unchanged` | — | New password equals the current one |
| 400 | `password_invalid` | `new_password` | Fails Django's validators |

#### What a password reset does *not* do

**It does not end existing sessions.** JWTs are stateless and an access token stays
valid for its full `ACCESS_TOKEN_LIFETIME` (**5 days**) after the password changes.
Do not present a reset as "revoke access" in the UI. Cutting access immediately means
deactivating the account (`is_active = False`), which simplejwt rejects on every
request — there is **no API for that yet**; it is still an `/admin` action.

### 3. Behaviour change — the bearer token now wins over a session cookie

`SessionAuthentication` used to be tried **before** the JWT authenticator. Because DRF
stops at the first authenticator that returns a user, any request made from a browser
that also held a Django `/admin` session cookie on this domain authenticated as **that
admin**, silently ignoring the `Authorization` header. Symptoms:

- endpoints answering for the wrong user (`/api/v1/companies/users/me` returning the
  admin);
- `403 permission_denied` with `"User is not attached to a company."` on a token whose
  own `company_id` claim is populated — because the admin has no tenant;
- CSRF failures on `POST`s that carried a perfectly valid token.

The order is now JWT first. **An `Authorization` header always decides who you are.**
Session auth still applies when no token is sent, which is what Swagger and the
browsable API need — so opening an API URL directly in a logged-in browser tab still
authenticates as your admin session, and that is expected.

No frontend change is required. If you built a workaround (a private browsing window, a
separate domain for `/admin`, stripping cookies), you can drop it.

> Reminder while debugging: the `company_id` inside the JWT is **decorative** — stamped
> at login so the SPA can read it client-side. Every permission check reads the user's
> company from the database, so a populated claim proves nothing about authorization.

### 4. Extension attribution is now immediate

Mode-3 conversations used to sit with `employee: null` and
`attribution_source: ""` until the conversation **closed** — up to
`idle_gap_hours` (default **8h**) after the last message. A dashboard opened during
the working day showed live chats as unattributed, and they dropped out of every
employee KPI until the next morning.

Attribution now lands as soon as both halves are present, whichever order they arrive in:

| Order | Attributed |
|---|---|
| Extension reported the send first (the usual case) | when the message is ingested — the conversation is created already attributed |
| Message was ingested first | on `POST /api/v1/integrations/attribution/events`, in the same request |
| Neither worked (e.g. the peer key had not been learned yet) | the 2-minute correlation sweep |
| — | the close-time pass still runs, and remains authoritative |

**No contract change.** No new field, no new error code, no changed status code —
`POST /attribution/events` still answers `201 {"accepted": n}`. What changed is how soon
`GET /api/v1/chats/conversations` reports an `employee` on a mode-3 conversation.

Two consequences worth designing for:

- **`employee` on an open conversation can change.** Attribution is last-outbound-wins,
  so when a colleague takes a chat over, the conversation moves to them on their first
  send. Don't cache the employee of an open conversation across a poll.
  *(Handover previously never applied at all — the roll-up refused to overwrite its own
  `mode_3_extension` stamp, freezing each conversation on whoever replied first. Fixed
  in the same change.)*
- **`attribution_source: ""` now means something narrower** — nobody has sent from the
  extension in that chat yet, rather than "wait for it to close". An `""` on a
  conversation with outbound messages is a genuine gap worth surfacing to a manager
  (the employee sent without the extension running), not a pending state.

Unchanged: `manual` and `widget` still outrank the extension, and
`POST /api/v1/chats/conversations/{id}/assign` is still final.

---

## Not yet reflected in docs 01–07

The pages listed below predate the changes above; this file is authoritative until they
are updated.

| Page | What it is missing |
|---|---|
| [02-auth-and-accounts](./02-auth-and-accounts.md) | The whole of §1 and §2 — the employees section documents neither `account`/`user`/`credentials` nor any `/companies/users/*` endpoint beyond `users/me`. |
| [01-conventions](./01-conventions.md) | §3 — the auth section does not mention session/JWT precedence. |

`GET /api/schema/` (dev only) stays machine-readable ground truth, with the one
documented exception above: it advertises `account` on employee updates, where it is
ignored.
