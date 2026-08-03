import type { UserRole } from '@/entities/session'

import type { EmployeeAccountInput } from './types'

/** Form state for the login fields, shared by every screen that mints one. */
export interface AccountDraft {
  username: string
  role: UserRole
  password: string
}

export const EMPTY_ACCOUNT: AccountDraft = {
  username: '',
  // A cabinet user must not read company-wide dashboards, so `viewer` — the
  // backend's own default — is the right default here too.
  role: 'viewer',
  password: '',
}

/**
 * Draft → request body.
 *
 * An empty password is OMITTED rather than sent blank: `""` would be run
 * through Django's validators and rejected, where a missing key makes the
 * backend generate one.
 */
export function toAccountInput(draft: AccountDraft): EmployeeAccountInput {
  const password = draft.password.trim()
  return {
    username: draft.username.trim(),
    role: draft.role,
    ...(password ? { password } : {}),
  }
}
