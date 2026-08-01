import { http } from '@/shared/api'

import type { Company, CurrentUser, TokenPair } from '../model/types'

/** The extension's "who am I" response — the cheapest cabinet probe available. */
export interface EmployeeIdentity {
  employee_id: string
  full_name: string
  company: string
}

export const sessionApi = {
  /** Login takes a USERNAME, not an email (docs/02). */
  login: (credentials: { username: string; password: string }) =>
    http.anonymousPost<TokenPair>('auth/token', credentials),

  me: () => http.get<CurrentUser>('companies/users/me'),

  company: () => http.get<Company>('companies/me'),

  updateCompany: (patch: Partial<Company>) =>
    http.patch<Company>('companies/me', patch),

  /**
   * Whether the user is linked to an active `Employee` profile.
   * If not, the API answers `400 no_employee_profile` (docs/07).
   */
  employeeIdentity: () =>
    http.get<EmployeeIdentity>('integrations/attribution/me'),
}
