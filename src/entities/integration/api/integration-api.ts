import { http, type UUID } from '@/shared/api'

import type {
  BackfillJob,
  BackfillScope,
  InstagramAccount,
  TelegramAccount,
  TelegramLoginOptions,
  TelegramLoginResponse,
  WebAccount,
} from '../model/types'

/**
 * Integration endpoints.
 *
 * Every account viewset has `pagination_class = None`, so these return bare
 * arrays rather than a paginated envelope. `search` / `ordering` are accepted
 * by the schema but inert (docs/07).
 */
export const integrationApi = {
  /* ----------------------------------------------------------- Instagram */

  instagramAccounts: () =>
    http.get<InstagramAccount[]>('integrations/accounts/instagram'),

  /**
   * A browser cannot carry a Bearer header on a top-level redirect, so the SPA
   * fetches the authorize URL with the JWT and then navigates to it.
   */
  instagramStart: () =>
    http.get<{ authorize_url: string }>('integrations/connect/instagram/start'),

  /** Pauses or resumes monitoring without re-authenticating. */
  instagramToggle: (id: UUID) =>
    http.post<InstagramAccount>(`integrations/accounts/instagram/${id}/toggle`),

  instagramDelete: (id: UUID) =>
    http.delete(`integrations/accounts/instagram/${id}`),

  /* ------------------------------------------------------------ Telegram */

  telegramAccounts: () =>
    http.get<TelegramAccount[]>('integrations/accounts/telegram'),

  telegramUpdate: (
    id: UUID,
    input: Partial<
      Pick<
        TelegramAccount,
        'name' | 'account_type' | 'default_employee' | 'legal_consent'
      >
    >,
  ) =>
    http.patch<TelegramAccount>(`integrations/accounts/telegram/${id}`, input),

  /** Throttled at 10 requests per hour per company → 429. */
  telegramQrStart: (options: TelegramLoginOptions) =>
    http.post<TelegramLoginResponse>(
      'integrations/accounts/telegram/login/qr/start',
      options,
    ),

  telegramQrPoll: (loginId: string) =>
    http.post<TelegramLoginResponse>(
      'integrations/accounts/telegram/login/qr/poll',
      { login_id: loginId },
    ),

  telegramSmsStart: (phone: string, options: TelegramLoginOptions) =>
    http.post<TelegramLoginResponse>(
      'integrations/accounts/telegram/login/start',
      { phone, ...options },
    ),

  telegramSmsVerify: (loginId: string, code: string) =>
    http.post<TelegramLoginResponse>(
      'integrations/accounts/telegram/login/verify',
      { login_id: loginId, code },
    ),

  telegramPassword: (loginId: string, password: string) =>
    http.post<TelegramLoginResponse>(
      'integrations/accounts/telegram/login/password',
      { login_id: loginId, password },
    ),

  telegramDisconnect: (id: UUID) =>
    http.post<{ detail: string }>(
      `integrations/accounts/telegram/${id}/disconnect`,
    ),

  /* ------------------------------------------------------------ Backfill */

  backfillJobs: (accountId: UUID) =>
    http.get<BackfillJob[]>(
      `integrations/accounts/telegram/${accountId}/backfill/jobs`,
    ),

  /** Only one pending/running job may exist per account (DB-enforced). */
  backfillStart: (accountId: UUID, scope: BackfillScope) =>
    http.post<BackfillJob>(
      `integrations/accounts/telegram/${accountId}/backfill`,
      { scope },
    ),

  /** The only way to unblock future tiers when a job is stuck. */
  backfillCancel: (accountId: UUID) =>
    http.post<BackfillJob>(
      `integrations/accounts/telegram/${accountId}/backfill/cancel`,
    ),

  /* ---------------------------------------------------------- Web widget */

  webAccounts: () => http.get<WebAccount[]>('integrations/accounts/web'),

  /** The response is the ONLY place the full widget key is ever shown. */
  webCreate: (name: string) =>
    http.post<WebAccount>('integrations/accounts/web', { name }),

  /** Mints a new key; the old one stops working immediately. */
  webRotateKey: (id: UUID) =>
    http.post<WebAccount>(`integrations/accounts/web/${id}/rotate_key`),
}
