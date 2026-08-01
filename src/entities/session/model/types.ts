import type { ApiDateTime, UUID } from '@/shared/api'

/** `owner` / `admin` / `manager` are collectively the manager roles (docs/01 §4). */
export type UserRole = 'owner' | 'admin' | 'manager' | 'viewer'

export interface CurrentUser {
  id: UUID
  username: string
  email: string
  first_name: string
  last_name: string
  role: UserRole
  /** `null` for platform staff — every tenant endpoint then answers 403. */
  company: UUID | null
}

/** 1 — account, 2 — shift schedule, 3 — browser extension. */
export type AttributionMode = 1 | 2 | 3

export type IdleGapHours = 4 | 8 | 12 | 24

export interface Company {
  id: UUID
  name: string
  timezone: string
  attribution_mode: AttributionMode
  idle_gap_hours: IdleGapHours
  retention_months?: number | null
  created_at: ApiDateTime
}

export interface TokenPair {
  access: string
  refresh: string
}

/**
 * The session context — the whole app is built on top of this.
 *
 * `isCabinet` marks the "employee cabinet" state. It is NOT a role: it is a
 * non-manager user linked to an `Employee` record. Company dashboards answer
 * 403 for them and only `/dashboard/me` is open (docs/01 §4).
 */
export interface SessionContext {
  user: CurrentUser
  company: Company | null
  /** Write access: overrides, assignment, catalog, settings. */
  canWrite: boolean
  /** Whether company-wide dashboards are readable. */
  canViewCompanyDashboards: boolean
  /** Employee-cabinet mode (non-manager + an `Employee` record). */
  isCabinet: boolean
  /**
   * Whether an `Employee` profile is linked. A manager can also be an employee,
   * in which case both the company dashboards and the personal cabinet open.
   */
  hasEmployeeProfile: boolean
}
