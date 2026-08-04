/**
 * A typed layer over the `drf-standardized-errors` envelope.
 *
 * Backend contract (docs/01 §8): match errors on `code`, NEVER on the `detail`
 * text — `detail` wording may change at any time.
 */

export type ApiErrorType =
  'validation_error' | 'client_error' | 'server_error' | 'network_error'

export interface ApiErrorItem {
  code: string
  detail: string
  attr: string | null
}

interface ApiErrorEnvelope {
  type?: ApiErrorType
  errors?: ApiErrorItem[]
}

export class ApiError extends Error {
  readonly status: number
  readonly type: ApiErrorType
  readonly errors: ApiErrorItem[]
  /** `code` → error. For object-level business rules. */
  readonly byCode: Record<string, ApiErrorItem>
  /** `attr` → error. Maps straight onto form-library field errors. */
  readonly byField: Record<string, ApiErrorItem>

  constructor(status: number, body: ApiErrorEnvelope | null) {
    const errors = body?.errors ?? []
    super(errors[0]?.detail ?? `HTTP ${status}`)
    this.name = 'ApiError'
    this.status = status
    this.type = body?.type ?? inferType(status)
    this.errors = errors
    this.byCode = Object.fromEntries(errors.map((e) => [e.code, e]))
    this.byField = Object.fromEntries(
      errors.filter((e) => e.attr).map((e) => [e.attr as string, e]),
    )
  }

  /** Whether any of the given `code`s is present. */
  has(...codes: string[]): boolean {
    return codes.some((code) => code in this.byCode)
  }

  get isUnauthorized(): boolean {
    return this.status === 401
  }

  get isForbidden(): boolean {
    return this.status === 403
  }

  get isNotFound(): boolean {
    return this.status === 404
  }

  /**
   * A 403 has two distinct causes and only `detail` tells them apart (docs/02).
   * A user with no company is unrecoverable from the UI.
   */
  get isMissingCompany(): boolean {
    return this.isForbidden && /not attached to a company/i.test(this.message)
  }

  /** A manager role is required — hiding the control is enough. */
  get isRoleDenied(): boolean {
    return this.isForbidden && !this.isMissingCompany
  }

  /**
   * Gemini failed upstream — quota, a 5xx, a timeout, or output the schema
   * rejected. The REQUEST WAS VALID, so the same one may be resent verbatim.
   *
   * This is the transient half of the AI error pair; `gemini_not_configured`
   * is the permanent half and must never be retried (CHANGELOG §5).
   */
  get isAiUnavailable(): boolean {
    return this.status === 503 || this.has('ai_unavailable')
  }
}

/** Network failure / CORS / timeout — the server never answered. */
export class NetworkError extends ApiError {
  constructor(cause?: unknown) {
    super(0, {
      type: 'network_error',
      errors: [
        {
          code: 'network_unavailable',
          detail: 'Serverga ulanib bo‘lmadi.',
          attr: null,
        },
      ],
    })
    this.name = 'NetworkError'
    this.cause = cause
  }
}

function inferType(status: number): ApiErrorType {
  if (status === 400) return 'validation_error'
  if (status >= 500) return 'server_error'
  return 'client_error'
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}
