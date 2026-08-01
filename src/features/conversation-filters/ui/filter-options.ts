import type { MessageKey } from '@/shared/i18n'

/**
 * Option lists.
 *
 * Keys only — the text comes from `t()` in the component. The empty value
 * ("any") behaves identically in every select.
 */

export const ALL_VALUE = '__all__'

export const OUTCOME_OPTIONS = [
  { value: 'sotildi', labelKey: 'outcome.sotildi' },
  { value: 'sotilmadi', labelKey: 'outcome.sotilmadi' },
  { value: 'noaniq', labelKey: 'outcome.noaniq' },
] as const satisfies readonly { value: string; labelKey: MessageKey }[]

export const SENTIMENT_OPTIONS = [
  { value: 'positive', labelKey: 'sentiment.positive' },
  { value: 'neutral', labelKey: 'sentiment.neutral' },
  { value: 'negative', labelKey: 'sentiment.negative' },
  { value: 'angry', labelKey: 'sentiment.angry' },
] as const satisfies readonly { value: string; labelKey: MessageKey }[]

export const ATTRIBUTION_OPTIONS = [
  { value: 'mode_1', labelKey: 'attributionSource.mode_1' },
  { value: 'mode_2_shift', labelKey: 'attributionSource.mode_2_shift' },
  { value: 'mode_3_extension', labelKey: 'attributionSource.mode_3_extension' },
  { value: 'widget', labelKey: 'attributionSource.widget' },
  { value: 'manual', labelKey: 'attributionSource.manual' },
  { value: 'legacy', labelKey: 'attributionSource.legacy' },
] as const satisfies readonly { value: string; labelKey: MessageKey }[]

/**
 * Sorting. The backend accepts only these fields (docs/03) — anything else is
 * silently ignored.
 */
export const ORDERING_OPTIONS = [
  { value: '-last_message_at', labelKey: 'ordering.lastMessageDesc' },
  { value: '-closed_at', labelKey: 'ordering.closedDesc' },
  { value: 'closed_at', labelKey: 'ordering.closedAsc' },
  { value: '-analysis_score', labelKey: 'ordering.scoreDesc' },
  { value: 'analysis_score', labelKey: 'ordering.scoreAsc' },
  { value: '-started_at', labelKey: 'ordering.startedDesc' },
] as const satisfies readonly { value: string; labelKey: MessageKey }[]

/** One-click filters — the manager's daily working queues. */
export const QUICK_TOGGLES = [
  { key: 'unassigned', labelKey: 'conversationFilters.unassigned' },
  { key: 'needs_review', labelKey: 'conversationFilters.needsReview' },
  { key: 'has_violations', labelKey: 'conversationFilters.hasViolations' },
] as const satisfies readonly { key: string; labelKey: MessageKey }[]
