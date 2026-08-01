import type { MessageKey } from '@/shared/i18n'

import type { CriterionKey, FunnelStageKey } from './types'

/**
 * Domain enums → translation keys.
 *
 * The backend returns `label` as an English fallback, but localisation ALWAYS
 * happens on the stable `key`, never on the `label` text (docs/05).
 */

export function criterionLabelKey(key: CriterionKey): MessageKey {
  return `criterion.${key}` as MessageKey
}

export function criterionHintKey(key: CriterionKey): MessageKey {
  return `criterionHint.${key}` as MessageKey
}

export function funnelStageLabelKey(key: FunnelStageKey): MessageKey {
  return `funnelStage.${key}` as MessageKey
}

/** Script order — the backend returns stages in this sequence and the UI relies on it. */
export const FUNNEL_STAGE_ORDER: readonly FunnelStageKey[] = [
  'greeting',
  'needs_discovery',
  'offer',
  'price',
  'objection_handling',
  'closing',
]
