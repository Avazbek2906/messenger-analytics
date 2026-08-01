import type { UUID } from '@/shared/api'

/**
 * Dashboard aggregate responses (docs/05).
 *
 * Nullable fields are nullable on purpose: `null` means "not measured", `0`
 * means "measured, and it was zero". The two must never be conflated.
 */

export interface DashboardPeriod {
  date_from: string
  date_to: string
  previous_date_from?: string
  previous_date_to?: string
}

/* ------------------------------------------------------------------ Overview */

export interface OverviewAgreements {
  taken: number
  fulfilled: number
  forgotten: number
}

export interface OverviewPrevious {
  conversations: number
  scored: number
  avg_score: number | null
  sold: number
  conversion_rate: number | null
  avg_first_response_seconds: number | null
}

/**
 * Deltas: `*_percent` is a percentage change, `*_points` is an absolute point
 * difference on a 0–100 scale. On `first_response_percent` a NEGATIVE value is
 * good (it got faster).
 */
export interface OverviewDeltas {
  conversations_percent: number | null
  scored_percent: number | null
  sold_percent: number | null
  avg_score_points: number | null
  conversion_rate_points: number | null
  first_response_percent: number | null
}

export interface Overview {
  period: DashboardPeriod
  conversations: number
  scored: number
  unscored: number
  unassigned: number
  /** `scored / conversations × 100` — every average rests on this coverage. */
  scoring_coverage: number | null
  avg_score: number | null
  sold: number
  not_sold: number
  unclear: number
  angry_customers: number
  /** `sold / (sold + not_sold) × 100`; `unclear` is excluded from the denominator. */
  conversion_rate: number | null
  avg_first_response_seconds: number | null
  agreements: OverviewAgreements
  previous: OverviewPrevious
  deltas: OverviewDeltas
}

/* ---------------------------------------------------------------- Timeseries */

export type Granularity = 'day' | 'week'

export interface TimeseriesPoint {
  /** `YYYY-MM-DD` — the bucket start. Week buckets begin on Monday. */
  date: string
  conversations: number
  scored: number
  /** `null` on an empty bucket — the chart line must BREAK here. */
  avg_score: number | null
  sold: number
  not_sold: number
  unclear: number
}

export interface Timeseries {
  granularity: Granularity
  series: TimeseriesPoint[]
}

/* ------------------------------------------------------------------ Criteria */

export type CriterionKey =
  | 'rule_adherence'
  | 'response_speed'
  | 'tone'
  | 'needs_discovery'
  | 'objection_handling'
  | 'closing'
  | 'promise_fulfillment'

export interface CriterionStat {
  key: CriterionKey
  /** The backend's English fallback — the UI localises on `key` instead. */
  label: string
  avg_score: number | null
  /** Batch-analysed conversations only — lower than `overview.scored`. */
  samples: number
}

export interface CriteriaSummary {
  criteria: CriterionStat[]
  strengths: CriterionStat[]
  weaknesses: CriterionStat[]
}

/* -------------------------------------------------------------------- Funnel */

export type FunnelStageKey =
  | 'greeting'
  | 'needs_discovery'
  | 'offer'
  | 'price'
  | 'objection_handling'
  | 'closing'

export interface FunnelDropNote {
  note: string
  count: number
}

export interface FunnelStage {
  stage: FunnelStageKey
  reached: number
  success: number
  drop_off: number
  neutral: number
  not_reached: number
  /** All four percentages are shares of `analyzed` and sum to ~100. `null` when `analyzed = 0`. */
  success_percent: number | null
  drop_off_percent: number | null
  neutral_percent: number | null
  not_reached_percent: number | null
  drop_notes: FunnelDropNote[]
  drop_conversations: UUID[]
}

export interface FunnelSummary {
  /** Only the Pro batch emits a funnel, so this is below `overview.scored`. */
  analyzed: number
  stages: FunnelStage[]
}

/* -------------------------------------------------------------- People */

/**
 * A row of the employee league table.
 *
 * `rank: null` / `is_ranked: false` means fewer than 5 scored conversations —
 * such a row is still listed but must never get a position badge (docs/05 §6).
 */
export interface EmployeeRating {
  rank: number | null
  is_ranked: boolean
  employee: UUID
  employee_name: string
  /** `""` (never `null`) when no department is set. */
  department: string
  conversations: number
  avg_score: number | null
  samples: number
  /** Points versus the previous equal-length period; `null` with no baseline. */
  score_delta: number | null
  /** Conversations carrying at least one rule violation. */
  violations: number
  sold: number
  not_sold: number
  unclear: number
  conversion_rate: number | null
  avg_response_seconds: number | null
}

export interface DepartmentRating {
  /** `""` is the "no department" bucket. */
  department: string
  employees: number
  conversations: number
  avg_score: number | null
  violations: number
  sold: number
  not_sold: number
  unclear: number
  conversion_rate: number | null
}

export interface DailyPoint {
  date: string
  avg_score: number | null
  conversations: number
}

export interface ConversationRef {
  conversation: UUID
  score: number
  customer_name: string | null
  closed_at: string
}

/**
 * One employee's card — also the exact payload of the employee cabinet
 * (`/dashboard/me`), so both screens share every widget below it.
 */
export interface EmployeeCard {
  employee: UUID
  period: DashboardPeriod
  /** Position among RANKED employees only; `null` below the 5-conversation floor. */
  rank: number | null
  ranked_total: number
  /** Closed conversations assigned to them. */
  handled_conversations: number
  /** Those that carry a canonical analysis row — the difference is the unscored tail. */
  conversations: number
  avg_score: number | null
  avg_conversations_per_day: number | null
  avg_first_response_seconds: number | null
  avg_response_seconds: number | null
  violations: number
  sold: number
  not_sold: number
  unclear: number
  conversion_rate: number | null
  agreements: OverviewAgreements
  daily: DailyPoint[]
  criteria: CriterionStat[]
  strengths: CriterionStat[]
  weaknesses: CriterionStat[]
  funnel: FunnelSummary
  /** Up to 5 each. `customer_name` may be `null`. */
  best_conversations: ConversationRef[]
  worst_conversations: ConversationRef[]
  /** Up to 20 one-liners from the batch analyst, newest first. */
  coaching: string[]
}

/* ------------------------------------------------- Products and reasons */

export interface LostProductReason {
  reason: UUID
  code: string
  label: string
  customers: number
  /** Up to 5 evidence conversation ids, newest closed first. */
  conversations: UUID[]
}

export interface LostProduct {
  product: UUID
  product_name: string
  currency: string
  /**
   * Distinct customers lost on this product. NOT the sum of
   * `reasons[].customers` — one customer lost for two reasons is counted once
   * here, so the reasons must never be rendered as shares of this number.
   */
  customers: number
  /** `price × customers`; `null` when the catalog row carries no price. */
  lost_value: number | null
  reasons: LostProductReason[]
}

export interface LostReason {
  reason: UUID
  code: string
  label: string
  conversations: number
  customers: number
  /** Percentage of `lost_conversations`; `null` when nothing is attributed. */
  share: number | null
}

export interface EmergingFeedback {
  text: string
  count: number
}

export interface ReasonsSummary {
  /**
   * Lost conversations that carry an ATTRIBUTED reason — the denominator of
   * `share`. Normally smaller than `not_sold + unclear`, so it must not be
   * labelled "all lost conversations" (docs/05).
   */
  lost_conversations: number
  reasons: LostReason[]
  /** Up to 20 clustered free-text themes. A discovery list, not a statistic. */
  emerging_feedback: EmergingFeedback[]
}

/* ------------------------------------------------------------ Agreements */

export interface AgreementDailyPoint {
  date: string
  taken: number
  fulfilled: number
  forgotten: number
}

export interface AgreementsByEmployee {
  employee: UUID
  employee_name: string | null
  taken: number
  fulfilled: number
  forgotten: number
}

export interface UpcomingAgreement {
  agreement: UUID
  conversation: UUID
  text: string
  due_on: string
  employee_name: string | null
}

export interface AgreementsSummary {
  taken: number
  pending: number
  fulfilled: number
  forgotten: number
  /** A subset of `pending`: the due date has passed (company-local). */
  overdue: number
  /** `fulfilled / (fulfilled + forgotten)`; `pending` is excluded. */
  fulfillment_rate: number | null
  daily: AgreementDailyPoint[]
  /**
   * Agreements with no employee are omitted, so this column does not sum to
   * the top-level `taken` (docs/05).
   */
  by_employee: AgreementsByEmployee[]
  /** Up to 20 pending agreements with a due date, earliest first. */
  upcoming: UpcomingAgreement[]
}
