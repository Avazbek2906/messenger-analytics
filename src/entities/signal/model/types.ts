import type { ApiDateTime, UUID } from '@/shared/api'

/**
 * The seven signal kinds (`SignalKind`).
 *
 * Signals are derived at read time from the same canonical collapse the rest of
 * the dashboard uses — they are not a stored table. Only *resolutions* are
 * stored, and there is no un-resolve endpoint (docs/06).
 */
export type SignalKind =
  | 'unanswered'
  | 'unassigned'
  | 'low_score'
  | 'rule_violations'
  | 'angry_customer'
  | 'forgotten_agreement'
  | 'needs_review'

export interface SignalItem {
  conversation: UUID
  customer_name: string | null
  employee_name: string | null
  closed_at: ApiDateTime | null
}

export interface SignalBucket {
  /** The real total. NEVER derive this from `items.length` — items cap at 20. */
  count: number
  /** Already handled inside this window. A coverage stat, not a queue. */
  resolved: number
  items: SignalItem[]
}

/** Exactly seven keys, always present. */
export type SignalsResponse = Record<SignalKind, SignalBucket>

export interface ResolveSignalPayload {
  conversation: UUID
  signal: SignalKind
}
