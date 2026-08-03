import type { UserRole } from '@/entities/session'
import type { UUID } from '@/shared/api'

/**
 * A generated (or explicitly chosen) password, returned exactly ONCE.
 *
 * The backend hashes it at rest and has no route that reads it back, so
 * whatever renders this must let the user copy it before the dialog closes —
 * there is no second chance (CHANGELOG 2026-08-02 §1).
 */
export interface Credentials {
  username: string
  password: string
}

/** The invite / reset response: a tenant user plus the one-time password. */
export interface TenantUser {
  id: UUID
  username: string
  email: string
  first_name: string
  last_name: string
  role: UserRole
  company: UUID
  /**
   * Present on invite, ABSENT on reset-password — not `null`. Read it with a
   * presence check, never `=== null` (CHANGELOG §2).
   */
  employee?: UUID | null
  password: string
}

/** `company` is stamped from the caller and `is_staff` is unreachable. */
export interface InviteInput {
  username: string
  role: UserRole
  email?: string
  first_name?: string
  last_name?: string
  /** Omit to have the backend generate one. */
  password?: string
  /** Links the new login to an existing employee in the same call. */
  employee?: UUID
}

/**
 * The account block nested in an employee create — same rules as `InviteInput`
 * minus `employee`, which the enclosing call supplies.
 */
export type EmployeeAccountInput = Omit<InviteInput, 'employee'>

/**
 * Which roles a user may hand out. A manager cannot invite an owner, otherwise
 * they could take over the tenant (CHANGELOG §1).
 */
const GRANTABLE: Record<UserRole, UserRole[]> = {
  owner: ['owner', 'admin', 'manager', 'viewer'],
  admin: ['owner', 'admin', 'manager', 'viewer'],
  manager: ['manager', 'viewer'],
  viewer: [],
}

export function grantableRoles(role: UserRole): UserRole[] {
  return GRANTABLE[role]
}

/**
 * Whether `actor` may reset `target`'s password. The backend applies the same
 * rule, so gating the button here only avoids a pointless round trip.
 */
export function canResetPassword(actor: UserRole, target: UserRole): boolean {
  return GRANTABLE[actor].includes(target)
}
