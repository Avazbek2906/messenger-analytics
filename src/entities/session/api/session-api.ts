import { http } from '@/shared/api'

import type { Company, CurrentUser, TokenPair } from '../model/types'

/**
 * The narrowest window the cabinet probe can ask for. `/dashboard/me` is the
 * only uncached dashboard endpoint, so the default 30-day window would make
 * the server recompute a full aggregate on every app boot — and bootstrap only
 * needs the yes/no answer, never the numbers.
 */
const PROBE_WINDOW_MS = 60 * 60 * 1000

export const sessionApi = {
  /** Login takes a USERNAME, not an email (docs/02). */
  login: (credentials: { username: string; password: string }) =>
    http.anonymousPost<TokenPair>('auth/token', credentials),

  me: () => http.get<CurrentUser>('companies/users/me'),

  company: () => http.get<Company>('companies/me'),

  updateCompany: (patch: Partial<Company>) =>
    http.patch<Company>('companies/me', patch),

  /**
   * Cabinet probe: is the user linked to an active `Employee` profile?
   *
   * `/dashboard/me` is the documented way to ask — docs/05 says to read its
   * `400 no_employee_profile` as "you have no cabinet" and hide the nav item,
   * not as an error. Only the resolution matters here, so the payload is
   * discarded and the window is kept as small as possible.
   */
  hasCabinet: async (): Promise<boolean> => {
    const now = Date.now()
    await http.get<unknown>('dashboard/me', {
      date_from: new Date(now - PROBE_WINDOW_MS).toISOString(),
      date_to: new Date(now).toISOString(),
    })
    return true
  },
}
