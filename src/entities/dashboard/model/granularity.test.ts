import { describe, expect, it } from 'vitest'

import { defaultGranularity } from './granularity'

const DAY_MS = 86_400_000

function window(days: number) {
  const to = Date.UTC(2026, 7, 3)
  return {
    date_from: new Date(to - days * DAY_MS).toISOString(),
    date_to: new Date(to).toISOString(),
  }
}

describe('defaultGranularity', () => {
  it('keeps a month or less daily', () => {
    expect(defaultGranularity(window(7))).toBe('day')
    // Exactly 30 days is the API's own default window — still readable daily.
    expect(defaultGranularity(window(30))).toBe('day')
  })

  it('switches to weekly past a month', () => {
    expect(defaultGranularity(window(31))).toBe('week')
    expect(defaultGranularity(window(365))).toBe('week')
  })

  it('falls back to daily when the window is unset', () => {
    // Omitting both is the API's 30-day default, which is inside the boundary.
    expect(defaultGranularity({})).toBe('day')
    expect(defaultGranularity({ date_from: 'nonsense' })).toBe('day')
  })
})
