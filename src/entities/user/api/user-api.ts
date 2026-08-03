import { http, type UUID } from '@/shared/api'

import type { InviteInput, TenantUser } from '../model/types'

export const userApi = {
  /**
   * Creates a login inside the caller's own company. Manager role required.
   * The response carries the password once and never again.
   */
  invite: (input: InviteInput) =>
    http.post<TenantUser>('companies/users/invite', input),

  /**
   * A manager resets SOMEONE ELSE's password — the locked-out-employee path.
   * `id` is the `User` uuid, not the employee's. Omit `password` to have one
   * generated.
   *
   * This does NOT end existing sessions: a JWT stays valid for its full 5-day
   * lifetime after the change, so it must never be presented as "revoke
   * access" (CHANGELOG §2).
   */
  resetPassword: (id: UUID, password?: string) =>
    http.post<TenantUser>(
      `companies/users/${id}/reset-password`,
      password ? { password } : {},
    ),

  /** Any authenticated user changes their own password. No role requirement. */
  changeOwnPassword: (input: {
    current_password: string
    new_password: string
  }) => http.post<{ detail: string }>('companies/users/me/password', input),
}
