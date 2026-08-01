import type { MessageKey } from '@/shared/i18n'

import type {
  AttributionMode,
  CurrentUser,
  SessionContext,
  UserRole,
} from './types'

/** `owner` / `admin` / `manager` — may write and read company dashboards. */
const MANAGER_ROLES = new Set<UserRole>(['owner', 'admin', 'manager'])

export function isManagerRole(role: UserRole): boolean {
  return MANAGER_ROLES.has(role)
}

/**
 * Builds the session context.
 *
 * The "employee cabinet" is not a role but a state: a non-manager user linked
 * to an `Employee` record. Company dashboards answer 403 for them, so the UI
 * never offers those sections in the first place.
 */
export function buildSessionContext(
  user: CurrentUser,
  company: SessionContext['company'],
  hasEmployeeProfile: boolean,
): SessionContext {
  const manager = isManagerRole(user.role)
  const isCabinet = !manager && hasEmployeeProfile

  return {
    user,
    company,
    canWrite: manager,
    canViewCompanyDashboards: manager || !isCabinet,
    isCabinet,
    hasEmployeeProfile,
  }
}

export function displayName(user: CurrentUser): string {
  const full = `${user.first_name} ${user.last_name}`.trim()
  return full || user.username
}

/* Enum → translation key. The text itself comes from `t()` in the component. */

export function roleLabelKey(role: UserRole): MessageKey {
  return `role.${role}` as MessageKey
}

export function attributionModeLabelKey(mode: AttributionMode): MessageKey {
  return `attribution.mode${mode}` as MessageKey
}
