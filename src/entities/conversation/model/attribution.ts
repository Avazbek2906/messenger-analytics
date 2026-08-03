import type { AttributionMode } from '@/entities/session'
import type { MessageKey } from '@/shared/i18n'

import type { Conversation } from './types'

/**
 * Why a conversation has no employee.
 *
 * `extension_silent` is the case that changed on 2026-08-02: attribution now
 * lands the moment the extension reports a send, instead of waiting for the
 * conversation to close. So `attribution_source: ""` no longer means "pending
 * until close" — it means nobody has sent from the extension in that chat. On
 * a conversation that HAS outbound messages that is a real gap (the employee
 * replied with the extension off), not a state to wait out (CHANGELOG §4).
 */
export type AttributionGap = 'none' | 'no_rule' | 'extension_silent'

export function attributionGap(
  row: Conversation,
  mode: AttributionMode | undefined,
): AttributionGap {
  if (row.employee !== null) return 'none'
  // `first_response_seconds` is the only outbound-message signal a list row
  // carries: non-null means somebody replied.
  const replied = row.first_response_seconds !== null
  if (mode === 3 && row.attribution_source === '' && replied) {
    return 'extension_silent'
  }
  return 'no_rule'
}

export function attributionGapHintKey(gap: AttributionGap): MessageKey {
  return gap === 'extension_silent'
    ? 'conversationTable.extensionSilentHint'
    : 'conversationTable.unassignedHint'
}
