import { describe, expect, it } from 'vitest'

import {
  formatDelta,
  formatMoney,
  formatPercent,
  formatPoints,
  formatScore,
  initials,
  parseDecimal,
} from './format'

describe('the null !== 0 rule', () => {
  it('renders an unmeasured value as a dash', () => {
    expect(formatScore(null)).toBe('—')
    expect(formatPercent(undefined)).toBe('—')
    expect(formatMoney(null, 'UZS')).toBe('—')
  })

  it('renders a real zero as zero', () => {
    expect(formatScore(0)).toBe('0')
    expect(formatPercent(0)).toBe('0%')
  })
})

describe('deltas', () => {
  it('appends % to percentages but not to points', () => {
    expect(formatDelta(16.5)).toBe('+16,5%')
    expect(formatPoints(2.6)).toBe('+2,6')
  })

  it('does not double the sign on negative values', () => {
    expect(formatDelta(-17.5)).toBe('-17,5%')
    expect(formatPoints(-3)).toBe('-3')
  })
})

describe('parseDecimal', () => {
  it('turns the backend decimal string into a number', () => {
    expect(parseDecimal('2450000.00')).toBe(2_450_000)
    expect(parseDecimal(null)).toBeNull()
    expect(parseDecimal('')).toBeNull()
  })
})

describe('initials', () => {
  it('builds initials from up to two words', () => {
    expect(initials('Aziza Karimova')).toBe('AK')
    expect(initials('Aziza')).toBe('A')
    expect(initials('')).toBe('?')
  })
})
