import { describe, expect, it } from 'vitest'

import { rubricBand, rubricRatio, rubricScale } from './chart-theme'

/** The seven values `/dashboard/criteria` actually returned on 2026-08-13. */
const LIVE_0_10 = [8.6, 8.1, 7.9, 7.1, 4.8, 4.8, 4.3]
/** What docs/05's sample claims the same endpoint returns. */
const DOCS_0_100 = [84.1, 79.6, 74.0, 70.2, 63.5, 58.8, 51.3]

describe('rubricScale', () => {
  it('detects the 0–10 rubric the deployed prompt emits', () => {
    expect(rubricScale(LIVE_0_10)).toBe(10)
    // Per-conversation sub-scores: only ever 0, 5, 10 or 15 in practice.
    expect(rubricScale([0, 5, 10, 15])).toBe(10)
  })

  it('still detects the 0–100 rubric documented in docs/05', () => {
    expect(rubricScale(DOCS_0_100)).toBe(100)
  })

  it('treats an all-null or empty payload as the 0–10 default', () => {
    expect(rubricScale([])).toBe(10)
    expect(rubricScale([null, null])).toBe(10)
  })
})

describe('rubricRatio', () => {
  it('clamps an out-of-range value instead of overflowing the bar', () => {
    // The model occasionally exceeds its instructed maximum — 15 on a 0–10
    // rubric. A full bar is right; a 150%-wide one is not.
    expect(rubricRatio(15, 10)).toBe(1)
    expect(rubricRatio(-3, 10)).toBe(0)
    expect(rubricRatio(null, 10)).toBe(0)
  })
})

describe('rubricBand', () => {
  it('colours by share of the rubric scale, not by raw value', () => {
    // 8.6/10 is the team's strongest criterion. Read as 8.6/100 it landed in
    // the red "poor" band — the bug this whole helper exists to prevent.
    expect(rubricBand(8.6, 10)).toBe('high')
    expect(rubricBand(4.3, 10)).toBe('low')
    expect(rubricBand(6, 10)).toBe('mid')
    expect(rubricBand(null, 10)).toBeNull()
  })

  it('agrees with itself across both scales', () => {
    expect(rubricBand(86, 100)).toBe(rubricBand(8.6, 10))
  })
})
