import { describe, expect, it } from 'vitest'

import { ASK_MAX_DAYS, clampAskPeriod } from './index'

const DAY_MS = 86_400_000

function isoDaysAgo(days: number): string {
  return new Date(Date.UTC(2026, 6, 29) - days * DAY_MS).toISOString()
}

describe('clampAskPeriod', () => {
  it('leaves a normal window untouched', () => {
    const period = { date_from: isoDaysAgo(30), date_to: isoDaysAgo(0) }

    expect(clampAskPeriod(period)).toEqual(period)
  })

  it('clamps a window wider than the 400-day ceiling', () => {
    // `/ask` has no `period_too_long` guard: an over-long window fails as an
    // unhandled 500, so this must never reach the network (docs/06).
    const period = { date_from: isoDaysAgo(900), date_to: isoDaysAgo(0) }
    const clamped = clampAskPeriod(period)

    const days =
      (new Date(clamped.date_to!).getTime() -
        new Date(clamped.date_from!).getTime()) /
      DAY_MS

    expect(days).toBe(ASK_MAX_DAYS)
    expect(clamped.date_to).toBe(period.date_to)
  })

  it('leaves an exactly-400-day window alone', () => {
    const period = { date_from: isoDaysAgo(400), date_to: isoDaysAgo(0) }

    expect(clampAskPeriod(period)).toEqual(period)
  })

  it('passes through a period with missing or invalid dates', () => {
    expect(clampAskPeriod({})).toEqual({})
    expect(
      clampAskPeriod({ date_from: 'nonsense', date_to: isoDaysAgo(0) }),
    ).toEqual({ date_from: 'nonsense', date_to: isoDaysAgo(0) })
  })
})
