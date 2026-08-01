import type { ApiDateTime, UUID } from '@/shared/api'

/* ------------------------------------------------------------- Instagram */

/**
 * `InstagramAccount` carries no `status` string — the UI derives its state from
 * `is_active` plus `token_expires_at` instead (docs/07).
 */
export interface InstagramAccount {
  id: UUID
  ig_user_id: string
  username: string
  name: string
  is_active: boolean
  token_expires_at: ApiDateTime | null
  last_refreshed_at: ApiDateTime | null
  scopes: string[]
}

export type InstagramState =
  'monitoring' | 'paused' | 'token_expiring' | 'reconnect_required'

/* -------------------------------------------------------------- Telegram */

export type AccountStatus = 'pending' | 'connected' | 'disconnected' | 'error'

export type TelegramAccountType = 'company' | 'personal'

export interface TelegramAccount {
  id: UUID
  external_id: string
  name: string
  account_type: TelegramAccountType
  /** Attribution mode 1 uses this employee for every conversation. */
  default_employee: UUID | null
  legal_consent: boolean
  status: AccountStatus
  connected_at: ApiDateTime | null
  /** Stale for ~15 min is the early warning that a session is going bad. */
  last_healthy_at: ApiDateTime | null
  created_at: ApiDateTime
}

/** Onboarding fields submitted at login start and applied on finalisation. */
export interface TelegramLoginOptions {
  account_type?: TelegramAccountType
  /** REQUIRED to be true when `account_type` is `personal`. */
  legal_consent?: boolean
  default_employee?: UUID | null
}

export type TelegramLoginStatus =
  'pending' | 'code_sent' | 'password_required' | 'connected'

export interface TelegramLoginResponse {
  login_id: string
  status: TelegramLoginStatus
  /** QR flow only. Telegram rotates the token roughly every 30 s. */
  url?: string
  account?: TelegramAccount
}

/* -------------------------------------------------------------- Backfill */

export type BackfillScope = 'tier_0' | 'tier_a' | 'tier_b' | 'tier_c'

export type BackfillStatus =
  'pending' | 'running' | 'cancelled' | 'completed' | 'error'

export interface BackfillJob {
  id: UUID
  account: UUID
  scope: BackfillScope
  status: BackfillStatus
  /**
   * The runner reports a running count, not a percentage: this stays `0` until
   * completion, so a progress bar would lie. Show `fetched_messages` instead
   * (docs/07).
   */
  progress_pct: number
  fetched_messages: number
  started_at: ApiDateTime | null
  completed_at: ApiDateTime | null
  error: string
  created_at: ApiDateTime
}

/* ------------------------------------------------------------- Web widget */

export interface WebAccount {
  id: UUID
  name: string
  /**
   * Masked to the last four characters in listings. The full key is revealed
   * exactly once — in the create or rotate response (docs/07).
   */
  widget_key: string
  status: AccountStatus
  connected_at: ApiDateTime | null
  created_at: ApiDateTime
}
