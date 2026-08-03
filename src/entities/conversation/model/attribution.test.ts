import { describe, expect, it } from 'vitest'

import { attributionGap } from './attribution'
import type { Conversation } from './types'

function row(patch: Partial<Conversation>): Conversation {
  return {
    id: 'c1',
    channel: 'telegram',
    customer: 'cu1',
    customer_name: 'Aziza',
    employee: null,
    employee_name: null,
    attribution_source: '',
    started_at: '2026-07-29 09:00:00',
    last_message_at: '2026-07-29 09:20:00',
    closed_at: '2026-07-29 17:20:00',
    is_legacy: false,
    first_response_seconds: 42,
    avg_response_seconds: 60,
    score: 71,
    outcome: 'sotildi',
    customer_sentiment: 'neutral',
    needs_review: false,
    ...patch,
  }
}

describe('attributionGap', () => {
  it('reports no gap once an employee is attached', () => {
    expect(attributionGap(row({ employee: 'e1' }), 3)).toBe('none')
  })

  it('flags a silent extension when somebody replied anyway', () => {
    // Since 2026-08-02 attribution lands as soon as the extension reports a
    // send, so `""` on a conversation that HAS a reply means the extension was
    // never running — a real gap, not a pending state.
    expect(attributionGap(row({}), 3)).toBe('extension_silent')
  })

  it('does not flag a conversation nobody replied to', () => {
    // `first_response_seconds: null` — no outbound message, so an empty
    // `attribution_source` is exactly what it should be.
    expect(attributionGap(row({ first_response_seconds: null }), 3)).toBe(
      'no_rule',
    )
  })

  it('only applies under the extension attribution mode', () => {
    expect(attributionGap(row({}), 1)).toBe('no_rule')
    expect(attributionGap(row({}), undefined)).toBe('no_rule')
  })
})
