# 04 — Catalog (products, reasons, rulebooks)

The catalog is the **company's configuration surface for the AI**. Everything under
`/api/v1/catalog/` is tenant-owned reference data that the nightly Gemini batch pass reads
before it scores a conversation:

- **Products** — the picklist Gemini is allowed to match `products_of_interest` against.
  Free-form product extraction is deliberately disallowed, so a product that isn't in this
  list can never appear in the dashboard's product-feedback widget.
- **Reasons** — the "why didn't the customer buy" taxonomy. Reads return the 8 **global
  defaults** (shipped with the platform, `company = NULL`, immutable) plus the company's
  own extensions.
- **Rulebooks** — an uploaded PDF/DOCX/XLSX sales rulebook. It is parsed asynchronously,
  distilled by Gemini into a numbered clause list, and composed into a **per-company batch
  prompt**, so rule violations can cite the exact clause.

All three are managed from an admin/settings screen. Reads are open to every user attached
to the company; **writes require an `owner` / `admin` / `manager` role**.

## Endpoints at a glance

| # | Method | Path | Purpose | Write role |
|---|--------|------|---------|-----------|
| 1 | `GET` | `/api/v1/catalog/products` | List products (paginated, filterable, searchable) | — |
| 2 | `POST` | `/api/v1/catalog/products` | Create a product | manager+ |
| 3 | `GET` | `/api/v1/catalog/products/{id}` | Retrieve one product | — |
| 4 | `PUT` | `/api/v1/catalog/products/{id}` | Full replace | manager+ |
| 5 | `PATCH` | `/api/v1/catalog/products/{id}` | Partial update | manager+ |
| 6 | `DELETE` | `/api/v1/catalog/products/{id}` | Delete a product | manager+ |
| 7 | `GET` | `/api/v1/catalog/reasons` | Effective reason taxonomy (defaults + own), **unpaginated** | — |
| 8 | `POST` | `/api/v1/catalog/reasons` | Add a company reason | manager+ |
| 9 | `GET` | `/api/v1/catalog/reasons/{id}` | Retrieve one reason (default or own) | — |
| 10 | `PUT` | `/api/v1/catalog/reasons/{id}` | Full replace (own reasons only) | manager+ |
| 11 | `PATCH` | `/api/v1/catalog/reasons/{id}` | Partial update (own reasons only) | manager+ |
| 12 | `DELETE` | `/api/v1/catalog/reasons/{id}` | Delete (own reasons only) | manager+ |
| 13 | `GET` | `/api/v1/catalog/rulebooks` | List uploaded rulebooks (paginated) | — |
| 14 | `POST` | `/api/v1/catalog/rulebooks` | Upload a rulebook (`multipart/form-data`) | manager+ |
| 15 | `GET` | `/api/v1/catalog/rulebooks/{id}` | Retrieve one — **the status-polling endpoint** | — |
| 16 | `DELETE` | `/api/v1/catalog/rulebooks/{id}` | Delete an upload | manager+ |

There is **no** `PUT`/`PATCH` on rulebooks — a changed rulebook is a new upload, which keeps
the prompt-generation audit trail intact.

> Paths have no trailing slash (`DefaultRouter(trailing_slash=False)` + `APPEND_SLASH = False`).
> Sending `/api/v1/catalog/products/` will **not** redirect.

## Shared conventions

- **Auth**: `Authorization: Bearer <access>` (SimpleJWT) or session cookie. See
  `01-conventions.md`.
- **Tenant scoping** is automatic and server-side (→ `request.user.company_id`). You never
  send a `company` field, and you can never read or write another tenant's rows — a foreign
  id returns `404`, not `403`. Products and rulebooks use the shared
  `CompanyScopedQuerySetMixin`; reasons use a two-layer variant of it (reads add the global
  defaults, writes stay on the company's own rows) — see the Reasons section.
- **Datetimes** are rendered `YYYY-MM-DD HH:MM:SS` (project-wide `DATETIME_FORMAT`).
- **Pagination** is `LimitOffsetPagination` with `PAGE_SIZE = 100` (products and rulebooks;
  reasons are unpaginated).
- **Errors** use the shared `drf-standardized-errors` envelope documented in
  `01-conventions.md`:

  ```json
  {
    "type": "validation_error",
    "errors": [{ "code": "price_negative", "detail": "Price cannot be negative.", "attr": "price" }]
  }
  ```

  Match on `code`, never on `detail`.

---

## Products

`Product` rows are the only product names the analysis pipeline will ever emit. Before each
batch call, the backend renders **active** products (`is_active = true`, ordered by `name`)
into the prompt as a picklist, and matches Gemini's answer back to a row **verbatim,
case-insensitively**. Two consequences for the frontend:

- Renaming a product changes what the model can match from that moment on; historical
  `AnalysisResult` rows keep pointing at the same row (the FK), so history stays intact.
- Deactivating (`is_active = false`) removes it from future matching without destroying
  history. **Prefer deactivation over deletion** — `DELETE` cascades the M2M links and
  silently shrinks past dashboards.

`price` + `currency` are optional. With a price, the dashboard values lost opportunities in
money (`lost_value`); without it, the widget only shows customer counts.

### GET /api/v1/catalog/products

**What it does.** Returns the company's product catalog as a paginated list, filterable by
activity/category/currency and searchable by name or category. This is the data source for
the product-management table on the settings screen and for any product picker.

**Auth & permissions.** `IsAuthenticated` + `HasCompany`. Any authenticated user attached to
a company may read — including `viewer` role and employee-cabinet users. Rows are filtered
to `request.user.company_id`.

**Query params**

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `is_active` | boolean | no | — | Exact filter. `true` / `false`. |
| `category` | string | no | — | **Exact** match on `category` (not a contains match). |
| `currency` | string | no | — | Exact match on the 3-letter currency code, e.g. `UZS`. |
| `search` | string | no | — | Case-insensitive partial match across `name` and `category`. |
| `ordering` | string | no | `name` | Any serializer field: `id`, `name`, `category`, `description`, `price`, `currency`, `is_active`, `created_at`. Prefix with `-` for descending, e.g. `-created_at`. |
| `limit` | integer | no | `100` | Page size (`PAGE_SIZE = 100`). |
| `offset` | integer | no | `0` | Start index. |

**Response `200 OK`**

```json
{
  "count": 137,
  "next": "https://monitoring.jakhongir.dev/api/v1/catalog/products?limit=100&offset=100",
  "previous": null,
  "results": [
    {
      "id": "6f1c2a94-9b2e-4f0d-8f4e-7a1b3c5d9e01",
      "name": "AirPods Pro 2",
      "category": "Aksessuar",
      "description": "Original, 1 yil kafolat",
      "price": "2450000.00",
      "currency": "UZS",
      "is_active": true,
      "created_at": "2026-06-14 09:12:03"
    },
    {
      "id": "c0a7b5d1-3e46-4a92-b8f7-2d5e91c40b6a",
      "name": "iPhone 15 Pro 256GB",
      "category": "Telefon",
      "description": "",
      "price": null,
      "currency": "UZS",
      "is_active": true,
      "created_at": "2026-06-14 09:10:41"
    }
  ]
}
```

`price` is serialized as a **decimal string** (or `null`) — parse it, don't treat it as a
JS number blindly.

**Errors.** `401` `not_authenticated` (no/expired token) · `403` `permission_denied` with
detail `User is not attached to a company.`

### POST /api/v1/catalog/products

**What it does.** Adds a product to the catalog so the AI can start recognising it in
conversations. Takes effect on the **next** analysis run — it does not retroactively
re-match past conversations.

**Auth & permissions.** `IsAuthenticated` + `HasCompany` + `IsManagerRole`
(`owner` / `admin` / `manager`). `company` is stamped from the caller — never send it.

**Query params.** None.

**Request body** (`application/json`; the view also accepts `multipart/form-data` and
`application/x-www-form-urlencoded` with the same fields)

```json
{
  "name": "iPhone 15 Pro 256GB",   // required, 1–255 chars, unique within the company
  "category": "Telefon",           // optional, ≤128 chars, "" allowed
  "description": "Original, 1 yil kafolat",  // optional, free text, "" allowed
  "price": "18990000.00",          // optional, decimal string or null; max 12 int digits + 2 decimals
  "currency": "UZS",               // optional, ≤3 chars, defaults to "UZS"
  "is_active": true                // optional, defaults to true
}
```

`id` and `created_at` are read-only and ignored if sent.

**Response `201 Created`**

```json
{
  "id": "c0a7b5d1-3e46-4a92-b8f7-2d5e91c40b6a",
  "name": "iPhone 15 Pro 256GB",
  "category": "Telefon",
  "description": "Original, 1 yil kafolat",
  "price": "18990000.00",
  "currency": "UZS",
  "is_active": true,
  "created_at": "2026-07-29 11:04:57"
}
```

**Errors**

| Status | `code` | `attr` | When |
|--------|--------|--------|------|
| 400 | `product_name_duplicate` | `name` | The tenant already has a product with this exact name — "A product with this name already exists." |
| 400 | `price_negative` | `price` | `price < 0` — "Price cannot be negative." |
| 400 | `required` | `name` | `name` missing |
| 400 | `blank` | `name` / `currency` | Sent as `""`. `category` and `description` **do** accept `""`. |
| 400 | `max_length` | `name` / `category` / `currency` | Over 255 / 128 / 3 chars |
| 400 | `invalid` | `price` | Not a valid decimal |
| 401 | `not_authenticated` | — | Missing/expired token |
| 403 | `permission_denied` | — | Not a manager role, or user has no company |

> **Duplicate names.** `(company, name)` is unique per tenant and the check is surfaced as
> a normal field error: `400` with `code: "product_name_duplicate"` on `attr: "name"`
> ("A product with this name already exists."). Bind it to the name input like any other
> validation error. The comparison is **case- and whitespace-sensitive** — "iPhone 15" and
> "iphone 15 " are distinct rows, so trim input and consider a client-side case-insensitive
> warning to stop near-duplicates that would split the product's feedback statistics.

### GET /api/v1/catalog/products/{id}

**What it does.** Fetches a single product — the edit-form loader.

**Auth & permissions.** `IsAuthenticated` + `HasCompany`. Read-open to all company users.

**Path params**

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `id` | uuid | yes | — | Product id. Must belong to the caller's company. |

**Query params.** None (no filtering, search or ordering on a detail route).

**Response `200 OK`** — a single `Product` object (same shape as a `results[]` entry above).

**Errors.** `404` `not_found` (unknown id, or a product belonging to another tenant) ·
`401` `not_authenticated` · `403` `permission_denied`.

### PUT /api/v1/catalog/products/{id}

**What it does.** Full update — the "save the whole edit form" call. `name` is mandatory;
every other field is optional. Note that DRF does **not** blank out fields you omit: an
omitted optional field keeps its current stored value, exactly like `PATCH`. The only
practical difference between `PUT` and `PATCH` here is that `PUT` requires `name`. Send the
complete form anyway, so the payload matches what the user sees.

**Auth & permissions.** `IsAuthenticated` + `HasCompany` + `IsManagerRole`, tenant-scoped.

**Path params**

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `id` | uuid | yes | — | Product id. Must belong to the caller's company. |

**Query params.** None.

**Request body.** Same schema as `POST`; `name` is required.

**Response `200 OK`** — the updated `Product` object.

**Errors.** Same set as `POST`, plus `404` `not_found`.

### PATCH /api/v1/catalog/products/{id}

**What it does.** Partial update — the endpoint behind the "active / inactive" toggle and
inline price edits.

**Auth & permissions.** `IsAuthenticated` + `HasCompany` + `IsManagerRole`, tenant-scoped.

**Path params**

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `id` | uuid | yes | — | Product id. Must belong to the caller's company. |

**Query params.** None.

**Request body** — every field optional:

```json
{ "is_active": false }
```

**Response `200 OK`**

```json
{
  "id": "c0a7b5d1-3e46-4a92-b8f7-2d5e91c40b6a",
  "name": "iPhone 15 Pro 256GB",
  "category": "Telefon",
  "description": "Original, 1 yil kafolat",
  "price": "18990000.00",
  "currency": "UZS",
  "is_active": false,
  "created_at": "2026-06-14 09:10:41"
}
```

**Errors.** Same as `POST` minus the `required` row (nothing is mandatory on a partial
update), plus `404` `not_found`.

### DELETE /api/v1/catalog/products/{id}

**What it does.** Permanently removes the product row. Its links to past `AnalysisResult`
rows go with it, so historical product-feedback numbers shrink. Deactivation
(`PATCH {"is_active": false}`) is almost always the right action instead.

**Auth & permissions.** `IsAuthenticated` + `HasCompany` + `IsManagerRole`, tenant-scoped.

**Path params**

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `id` | uuid | yes | — | Product id. Must belong to the caller's company. |

**Query params.** None.

**Request body.** None.

**Response `204 No Content`** — empty body.

**Errors.** `404` `not_found` · `401` `not_authenticated` · `403` `permission_denied`.

---

## Reasons

The reason taxonomy answers "why didn't the customer buy". It is a **two-layer** list:

- **8 global defaults** (`company = NULL`, `is_default: true`) seeded for every tenant:

  | `code` | `label` |
  |--------|---------|
  | `narx` | Narx — juda qimmat deb hisobladi |
  | `mavjud_emas` | Mavjud emas — kerakli sana/o'lcham/rang yo'q |
  | `raqobatchi` | Raqobatchi — boshqa joydan oldi |
  | `vaqti_kelmadi` | Vaqti kelmadi — hozircha rejalashtirmagan |
  | `xususiyat_yetishmadi` | Xususiyat yetishmadi — mahsulot ehtiyojiga mos kelmadi |
  | `ishonch_yoq` | Ishonch yo'q — brend/mahsulotga shubha qildi |
  | `xodim_javob_bermadi` | Xodim javob bermadi — mijoz javobsiz qolib ketdi |
  | `boshqa` | Boshqa — erkin matn |

- **Company extensions** (`is_default: false`) the tenant adds itself.

`boshqa` ("other") is special: when Gemini picks it, the free-text explanation lands in the
analysis result's `other_reason_text`, and the dashboard clusters those strings into themes.

**Defaults are immutable.** Reads (`list`, `retrieve`) return defaults + own rows; write
actions are scoped to the company's own rows only, so `PUT` / `PATCH` / `DELETE` against a
default reason id returns **`404`**. Hide or disable edit controls when `is_default` is `true`.

### GET /api/v1/catalog/reasons

**What it does.** Returns the company's **effective** taxonomy — the 8 global defaults plus
the company's own reasons — as a flat array. Use it to populate every reason dropdown
(manager override forms, dashboard filters, settings table).

**Auth & permissions.** `IsAuthenticated` + `HasCompany`. Read-open to all company users.

**Query params**

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `ordering` | string | no | `created_at` asc | Serializer fields: `id`, `code`, `label`. Prefix `-` for descending. |
| `search` | string | no | — | Accepted by the schema but a **no-op** — this viewset declares no `search_fields`. Filter client-side. |

**Pagination is disabled** (`pagination_class = None`) — the response is a bare JSON array,
not `{count, next, previous, results}`. Do not send `limit`/`offset`; they are ignored.

**Response `200 OK`**

```json
[
  { "id": "1a4d7e30-5c2b-4f18-9a6d-0b3e8c7f2a55", "code": "narx", "label": "Narx — juda qimmat deb hisobladi", "is_default": true },
  { "id": "2b5e8f41-6d3c-4a29-8b7e-1c4f9d0a3b66", "code": "mavjud_emas", "label": "Mavjud emas — kerakli sana/o'lcham/rang yo'q", "is_default": true },
  { "id": "3c6f9a52-7e4d-4b3a-9c8f-2d5a0e1b4c77", "code": "raqobatchi", "label": "Raqobatchi — boshqa joydan oldi", "is_default": true },
  { "id": "4d70ab63-8f5e-4c4b-ad90-3e6b1f2c5d88", "code": "vaqti_kelmadi", "label": "Vaqti kelmadi — hozircha rejalashtirmagan", "is_default": true },
  { "id": "5e81bc74-905f-4d5c-be01-4f7c2a3d6e99", "code": "xususiyat_yetishmadi", "label": "Xususiyat yetishmadi — mahsulot ehtiyojiga mos kelmadi", "is_default": true },
  { "id": "6f92cd85-a160-4e6d-cf12-5a8d3b4e7f00", "code": "ishonch_yoq", "label": "Ishonch yo'q — brend/mahsulotga shubha qildi", "is_default": true },
  { "id": "70a3de96-b271-4f7e-d023-6b9e4c5f8011", "code": "xodim_javob_bermadi", "label": "Xodim javob bermadi — mijoz javobsiz qolib ketdi", "is_default": true },
  { "id": "81b4ef07-c382-4a8f-e134-7c0f5d6a9122", "code": "boshqa", "label": "Boshqa — erkin matn", "is_default": true },
  { "id": "92c5f018-d493-4b90-f245-8d106e7b0233", "code": "yetkazib_berish", "label": "Yetkazib berish shartlari mos kelmadi", "is_default": false }
]
```

**Errors.** `401` `not_authenticated` · `403` `permission_denied`.

### POST /api/v1/catalog/reasons

**What it does.** Extends the taxonomy with a company-specific reason. It becomes available
to the AI on the next batch run (the picklist is rendered fresh for every call).

**Auth & permissions.** Manager+ (`IsManagerRole`) + `HasCompany`. `company` is stamped from
the caller, so the new row is always a company extension — you cannot create a global default.

**Query params.** None.

**Request body** (`application/json`; `multipart/form-data` and
`application/x-www-form-urlencoded` are accepted too)

```json
{
  "code": "yetkazib_berish",   // required, 1–64 chars — the stable machine key the AI returns
  "label": "Yetkazib berish shartlari mos kelmadi"  // required, 1–255 chars — shown to users
}
```

`id` and `is_default` are read-only. Keep `code` `snake_case`, ASCII, and stable — overrides
and analysis results store the **code**, so renaming it later orphans historical mappings.

**Response `201 Created`**

```json
{
  "id": "92c5f018-d493-4b90-f245-8d106e7b0233",
  "code": "yetkazib_berish",
  "label": "Yetkazib berish shartlari mos kelmadi",
  "is_default": false
}
```

**Errors**

| Status | `code` | `attr` | When |
|--------|--------|--------|------|
| 400 | `reason_code_duplicate` | `code` | The code already exists in the **effective** taxonomy — including the 8 global defaults. "A reason with this code already exists." |
| 400 | `required` / `blank` | `code`, `label` | Missing or empty |
| 400 | `max_length` | `code` (64) / `label` (255) | Too long |
| 401 | `not_authenticated` | — | Missing/expired token |
| 403 | `permission_denied` | — | Not a manager role, or no company |

### GET /api/v1/catalog/reasons/{id}

**What it does.** Fetches one reason — default or company-owned.

**Auth & permissions.** `IsAuthenticated` + `HasCompany`; retrieve resolves against the
effective taxonomy, so global defaults are reachable by id.

**Path params**

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `id` | uuid | yes | — | Reason id (global default or own). |

**Query params.** None.

**Response `200 OK`**

```json
{ "id": "92c5f018-d493-4b90-f245-8d106e7b0233", "code": "yetkazib_berish", "label": "Yetkazib berish shartlari mos kelmadi", "is_default": false }
```

**Errors.** `404` `not_found` · `401` `not_authenticated` · `403` `permission_denied`.

### PUT /api/v1/catalog/reasons/{id}

**What it does.** Replaces a **company-owned** reason. Global defaults are not writable.

**Auth & permissions.** Manager+ (`IsManagerRole`). The write queryset is
`company_id = request.user.company_id` only — a default reason id yields `404`.

**Path params**

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `id` | uuid | yes | — | Reason id. Must be a **company-owned** reason (not a global default). |

**Query params.** None.

**Request body** — both fields are required (this is a true full replace: `code` and
`label` are the only writable fields and neither has a default)

```json
{
  "code": "yetkazib_berish",                          // required
  "label": "Yetkazib berish muddati uzoq bo'ldi"      // required
}
```

**Response `200 OK`** — the updated reason object.

**Errors.** `400` `reason_code_duplicate` (the check excludes the row being edited, so
re-submitting the same code is fine) · `400` `required` / `blank` / `max_length` ·
`404` `not_found` (unknown id **or a global default**) · `401` · `403`.

### PATCH /api/v1/catalog/reasons/{id}

**What it does.** Partial update of a company-owned reason — typically relabelling without
touching `code`.

**Auth & permissions.** Manager+ (`IsManagerRole`), company-owned rows only.

**Path params**

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `id` | uuid | yes | — | Reason id. Must be a **company-owned** reason. |

**Query params.** None.

**Request body** — all fields optional:

```json
{ "label": "Yetkazib berish muddati uzoq bo'ldi" }
```

**Response `200 OK`** — the updated reason object.

**Errors.** Same as `PUT`.

### DELETE /api/v1/catalog/reasons/{id}

**What it does.** Removes a company-owned reason from the taxonomy. Analysis results that
referenced it lose the link — `primary_reason` is `on_delete=SET_NULL` so the result row
survives with a null reason, and any `secondary_reasons` M2M links to it are dropped — so
the reasons dashboard loses those rows. Global defaults cannot be deleted.

**Auth & permissions.** Manager+ (`IsManagerRole`), company-owned rows only.

**Path params**

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `id` | uuid | yes | — | Reason id. Must be a **company-owned** reason. |

**Query params.** None.

**Request body.** None.

**Response `204 No Content`** — empty body.

**Errors.** `404` `not_found` (unknown id or a global default) · `401` · `403`.

---

## Rulebooks

A `RulebookDocument` is the company's internal sales rulebook (script requirements,
greeting/closing rules, response-time limits, forbidden phrases, discount policy, tone). It
is uploaded once and turned into the **company's active batch prompt**, which is how the AI
learns to check conversations against *this company's* rules and cite them by clause number.

### The lifecycle

```
POST /api/v1/catalog/rulebooks  (multipart)
        │
        ▼
   status = "uploaded"          row created; Celery task enqueued on commit
        │
        ▼
   status = "processing"        file parsed to text (PDF/DOCX/XLSX),
        │                       Gemini Pro distills a numbered clause list,
        │                       the digest is composed onto the baseline batch prompt
        ├──────────────► status = "error"   `error` holds a human-readable message
        ▼
   status = "ready"             a new PromptTemplate (kind=batch, version=rulebook-<ts>,
                                is_active=true) is now the company's batch prompt;
                                the previous one is deactivated, never deleted
```

**Status enum** (`RulebookDocumentModelStatusEnum`) and what to show:

| `status` | Meaning | Suggested UI |
|----------|---------|--------------|
| `uploaded` | Row saved, background job queued but not started | Spinner, "Navbatda…" — keep polling |
| `processing` | Being parsed and distilled by Gemini | Spinner, "Tahlil qilinmoqda…" — keep polling |
| `ready` | Rubric prompt generated and activated | Green check, "Faol qoidalar" — stop polling |
| `error` | Terminal failure; `error` is populated | Red banner with `error` text + "Qayta yuklash" — stop polling |

The enum is exactly these four values (`RulebookDocument.Status`); there is no "queued" or
"done". Two nuances that affect polling: an *unexpected* (non-terminal) exception leaves the
row in `processing` while Celery retries with backoff — the row only flips to `error` after
the final attempt (`max_retries=2`, i.e. up to three attempts) — whereas a human-fixable
failure (unparseable/legacy file, Gemini not configured) sets `error` immediately with no
retry. So a long `processing` is normal; it is not a stuck state until minutes have passed.

**Effect on analysis.** Once `ready`, every nightly Gemini Pro batch call for that company
uses the generated prompt instead of the global baseline. Clause violations then land in the
analysis result's `rule_violations`, with each `explanation` prefixed by the clause number
(e.g. `"Band 4: ..."`), so the dashboard can cite the exact rule. Real-time (Flash) scoring
is unaffected — it always uses the global realtime prompt. Composition is deterministic: the
model distills the company's rules but never rewrites the output contract, so the analysis
response shape never changes.

**No update endpoint.** To change the rules, upload a new file. Each upload generates a new
prompt version and deactivates the previous one, preserving the audit trail — every past
`AnalysisResult` keeps a FK to the exact prompt version that produced it.

### GET /api/v1/catalog/rulebooks

**What it does.** Lists the company's rulebook uploads, newest first — the upload history
table on the settings screen. The first `ready` row is the one currently driving analysis.

**Auth & permissions.** `IsAuthenticated` + `HasCompany`. Read-open to all company users;
rows filtered to `request.user.company_id`.

**Query params**

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `ordering` | string | no | `-created_at` | Serializer fields: `id`, `file`, `original_name`, `status`, `error`, `created_at`. Prefix `-` for descending. |
| `search` | string | no | — | Accepted by the schema but a **no-op** — no `search_fields` declared. |
| `limit` | integer | no | `100` | Page size (`PAGE_SIZE = 100`). |
| `offset` | integer | no | `0` | Start index. |

There are **no** `filterset_fields` here — to show only failed uploads, filter `status`
client-side.

**Response `200 OK`**

```json
{
  "count": 3,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": "a3e5c7d9-1b2f-4c6a-8e0d-5f7a9b1c3d5e",
      "file": "https://monitoring.jakhongir.dev/media/rulebooks/2026/07/sotuv_qoidalari_v3.pdf",
      "original_name": "sotuv_qoidalari_v3.pdf",
      "status": "ready",
      "error": "",
      "created_at": "2026-07-29 10:42:18"
    },
    {
      "id": "b4f6d8ea-2c3a-4d7b-9f1e-6a8b0c2d4e6f",
      "file": "https://monitoring.jakhongir.dev/media/rulebooks/2026/07/qoidalar_eski.doc",
      "original_name": "qoidalar_eski.doc",
      "status": "error",
      "error": "Legacy .doc is not supported — re-save the file as .docx.",
      "created_at": "2026-07-21 16:05:02"
    },
    {
      "id": "c5a7e9fb-3d4b-4e8c-a02f-7b9c1d3e5f70",
      "file": "https://monitoring.jakhongir.dev/media/rulebooks/2026/05/rulebook.docx",
      "original_name": "rulebook.docx",
      "status": "ready",
      "error": "",
      "created_at": "2026-05-03 12:31:44"
    }
  ]
}
```

`file` is an absolute URL (local media in dev, S3/MinIO in production). Render it as a
download link; use `original_name` as the display label.

**Errors.** `401` `not_authenticated` · `403` `permission_denied`.

### POST /api/v1/catalog/rulebooks

**What it does.** Uploads a rulebook file. The row is created immediately with
`status: "uploaded"` and a background job is queued **on transaction commit**; the response
returns before any parsing has happened. Poll the detail endpoint for the outcome.

**Auth & permissions.** Manager+ (`IsManagerRole`) + `HasCompany`. The viewset accepts only
`multipart/form-data` and `application/x-www-form-urlencoded` (`MultiPartParser`,
`FormParser`) — **a JSON body will be rejected**.

**Query params.** None.

**Request body** (`multipart/form-data`) — `file` is the **only** writable field, and the
form field name is literally `file`:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | binary | **yes** | The rulebook. The extension check accepts exactly `.pdf`, `.doc`, `.docx`, `.xls`, `.xlsx` (case-insensitive) — but `.doc`/`.xls` then **fail during processing**, see below. Max **20 MB** (`20 × 1024 × 1024` bytes; the size check runs after the extension check, so a too-large `.txt` reports the type error). |

`original_name` is derived from the uploaded filename server-side; `status`, `error`, `id`
and `created_at` are read-only.

```
POST /api/v1/catalog/rulebooks
Authorization: Bearer <access>
Content-Type: multipart/form-data; boundary=----X

------X
Content-Disposition: form-data; name="file"; filename="sotuv_qoidalari_v3.pdf"
Content-Type: application/pdf

%PDF-1.7 …
------X--
```

**Response `201 Created`**

```json
{
  "id": "a3e5c7d9-1b2f-4c6a-8e0d-5f7a9b1c3d5e",
  "file": "https://monitoring.jakhongir.dev/media/rulebooks/2026/07/sotuv_qoidalari_v3.pdf",
  "original_name": "sotuv_qoidalari_v3.pdf",
  "status": "uploaded",
  "error": "",
  "created_at": "2026-07-29 10:42:18"
}
```

**Errors**

| Status | `code` | `attr` | When |
|--------|--------|--------|------|
| 400 | `rulebook_file_type_unsupported` | `file` | The uploaded **filename's extension** (lower-cased) is not in `.doc, .docx, .pdf, .xls, .xlsx`. Detail: `"Unsupported file type <ext>. Allowed: .doc, .docx, .pdf, .xls, .xlsx."` The `Content-Type` part header is **not** inspected — only the extension. |
| 400 | `rulebook_file_too_large` | `file` | Over 20 MB — "File is larger than 20 MB." |
| 400 | `required` | `file` | No file part in the request |
| 401 | `not_authenticated` | — | Missing/expired token |
| 403 | `permission_denied` | — | Not a manager role, or no company |
| 415 | `unsupported_media_type` | — | Sent as JSON instead of multipart |

> **Legacy formats pass upload validation but fail processing.** `.doc` and `.xls` are in the
> allowed-extension set, so the upload returns `201`, then the row flips to
> `status: "error"` with `error` = *"Legacy .doc is not supported — re-save the file as
> .docx."* (or the `.xls` equivalent). Warn the user at file-pick time and steer them to
> `.docx` / `.xlsx` / `.pdf`.

### GET /api/v1/catalog/rulebooks/{id}

**What it does.** Fetches one upload. **This is the polling endpoint** — call it after
`POST` until `status` is `ready` or `error`.

**Auth & permissions.** `IsAuthenticated` + `HasCompany`; scoped to the caller's company.

**Path params**

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `id` | uuid | yes | — | Rulebook document id returned by `POST`. |

**Query params.** None.

**Response `200 OK`** — while processing:

```json
{
  "id": "a3e5c7d9-1b2f-4c6a-8e0d-5f7a9b1c3d5e",
  "file": "https://monitoring.jakhongir.dev/media/rulebooks/2026/07/sotuv_qoidalari_v3.pdf",
  "original_name": "sotuv_qoidalari_v3.pdf",
  "status": "processing",
  "error": "",
  "created_at": "2026-07-29 10:42:18"
}
```

and on terminal failure:

```json
{
  "id": "b4f6d8ea-2c3a-4d7b-9f1e-6a8b0c2d4e6f",
  "file": "https://monitoring.jakhongir.dev/media/rulebooks/2026/07/skan.pdf",
  "original_name": "skan.pdf",
  "status": "error",
  "error": "No extractable text found in the document.",
  "created_at": "2026-07-29 10:47:55"
}
```

Common `error` strings, all safe to show verbatim (they are written for humans, truncated to
500 chars):

- `No extractable text found in the document.` — usually a scanned/image-only PDF.
- `Legacy .doc is not supported — re-save the file as .docx.`
- `Legacy .xls is not supported — re-save the file as .xlsx.`
- `Unsupported file type: <ext>`
- A Gemini-configuration message when the AI backend isn't reachable.

The `parsed_text` and the generated prompt are **not** exposed through the API — the
generated `PromptTemplate` is internal (Django admin only).

**Errors.** `404` `not_found` · `401` `not_authenticated` · `403` `permission_denied`.

### DELETE /api/v1/catalog/rulebooks/{id}

**What it does.** Removes an upload row (e.g. a failed one, or an obsolete rulebook). It does
**not** deactivate or delete the `PromptTemplate` it generated — an active generated prompt
stays active until a newer rulebook is processed. Deleting a `ready` row is therefore a
history cleanup, not a way to "turn off" custom rules.

**Auth & permissions.** `IsAuthenticated` + `HasCompany` + `IsManagerRole`, tenant-scoped.

**Path params**

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `id` | uuid | yes | — | Rulebook document id. Must belong to the caller's company. |

**Query params.** None.

**Request body.** None.

**Response `204 No Content`** — empty body.

**Errors.** `404` `not_found` · `401` `not_authenticated` · `403` `permission_denied`.

---

## How catalog data reaches the dashboard

Products and reasons are the **dimensions** of two dashboard widgets documented in
`05-dashboard.md`:

- **Product feedback / "top lost opportunities"** — groups lost (`sotilmadi` / `noaniq`)
  conversations by `product × reason`, counting **distinct customers** (not conversations).
  Each product row carries `product`, `product_name`, `customers`, `lost_value`, and a nested
  `reasons[]` array with drill-down conversation ids. `lost_value` is
  `price × customers` and is `null` whenever the product has no `price` — **that's the direct
  payoff for filling in `price` and `currency` here.**
- **Reason breakdown** — share of lost conversations per reason `code`/`label`, plus a
  themed cluster of the free-text `boshqa` entries.

Two rules worth designing around:

1. **The AI can only report what's in the catalog.** An empty product catalog means an empty
   product-feedback widget — no error, just no data. Surface a "catalog is empty" nudge on
   the dashboard rather than an empty table.
2. **Manager overrides store the reason `code`, not the id.** Changing a reason's `code`
   after the fact breaks the link between past overrides and the taxonomy row. Treat `code`
   as write-once in the UI (editable only immediately after creation, or not at all) and let
   users edit `label` freely.

Dimension filters on trend endpoints (`product_id`, `reason_id`) take the **UUIDs** returned
by these catalog endpoints — load the catalog once and cache it for the session.

---

## Frontend notes

**Settings screen shape.** One "Sozlamalar → AI konfiguratsiyasi" page with three tabs:
*Mahsulotlar*, *Sabablar*, *Qoidalar fayli*. Gate the whole write surface on role: if
`user.role` is not `owner` / `admin` / `manager`, render everything read-only rather than
letting the user hit a `403`.

**Products tab.**
- Server-side table: `GET /api/v1/catalog/products?limit=50&offset=…`, with `search` bound to the
  search box (debounce ~300 ms) and `is_active` / `category` / `currency` as select filters.
  Remember `category` and `currency` are **exact** filters — populate their options from the
  distinct values already loaded, don't offer free text.
- Inline `is_active` toggle → `PATCH {"is_active": …}`. Optimistic update is safe.
- Steer destructive intent toward deactivation: put "Deaktivatsiya" as the primary row action
  and "O'chirish" behind a confirm dialog that mentions history loss.
- Validate name uniqueness client-side before `POST` (see the duplicate-name caveat) and
  reject negative prices in the form so `price_negative` never round-trips.

**Reasons tab.**
- One `GET /api/v1/catalog/reasons` fetch — it's unpaginated and small (usually < 20 rows). Cache it
  app-wide; every reason dropdown in the product should read from this cache.
- Split the table visually: a locked "Standart sabablar" section (`is_default: true`, no edit
  or delete controls) above an editable "Kompaniya sabablari" section.
- On create, auto-slug `code` from `label` (lowercase, ASCII, `_` separators) but let the
  user override it, and pre-check the slug against the cached list to pre-empt
  `reason_code_duplicate` — remember the check includes the global defaults.
- On edit, lock `code` and allow `label` only.

**Rulebook tab — upload UX.**
1. Client-side pre-checks before touching the network: extension in `.pdf` / `.docx` /
   `.xlsx` (warn hard on `.doc` / `.xls` — they upload fine and then fail), size ≤ 20 MB.
2. `POST` as `multipart/form-data` with an `XMLHttpRequest`/`fetch` upload-progress bar. Do
   **not** set `Content-Type` manually — let the browser write the boundary.
3. On `201`, immediately insert the row in `uploaded` state and start polling
   `GET /api/v1/catalog/rulebooks/{id}`: every **2 s** for the first 30 s, then every **5 s**, and
   give up after ~5 minutes with a "still processing, check back later" message (Gemini
   distillation of a long document is slow, and the task retries twice on transient errors).
   Stop polling as soon as `status` is `ready` or `error`.
4. Pause polling while the tab is hidden (`visibilitychange`) and resume on focus.
5. On `error`, show the `error` string verbatim in a red banner plus a "Qayta yuklash" button
   — these messages are written to be actionable ("re-save as .docx", "no extractable text").
6. On `ready`, show a success state that explains the consequence: *"Qoidalar faollashtirildi
   — keyingi tungi tahlildan boshlab suhbatlar shu qoidalarga tekshiriladi."* Effects appear
   after the next nightly batch run, not instantly — say so, or users will refresh the
   dashboard expecting immediate change.
7. Keep the upload history visible and mark the newest `ready` row as "Faol". Since there is
   no update endpoint, "Qoidalarni yangilash" is just another upload — label the button that
   way rather than offering an edit action.
