import { describe, expect, it } from 'vitest'

import { bucketCount, formatDuration, parseApiDate, toApiDate } from './date'

describe('parseApiDate', () => {
  it('reads the backend format as UTC', () => {
    // "2026-07-29 14:30:00" — no T, no Z. It must be read as UTC.
    expect(parseApiDate('2026-07-29 14:30:00')?.toISOString()).toBe(
      '2026-07-29T14:30:00.000Z',
    )
  })

  it('accepts ISO-8601 as well', () => {
    expect(parseApiDate('2026-07-29T14:30:00Z')?.toISOString()).toBe(
      '2026-07-29T14:30:00.000Z',
    )
  })

  it('returns null for null, empty or invalid input', () => {
    expect(parseApiDate(null)).toBeNull()
    expect(parseApiDate('')).toBeNull()
    expect(parseApiDate('salom')).toBeNull()
  })
})

describe('toApiDate', () => {
  it('returns a YYYY-MM-DD string', () => {
    expect(toApiDate(new Date(2026, 6, 29))).toBe('2026-07-29')
  })
})

describe('formatDuration', () => {
  it('never turns null into zero', () => {
    expect(formatDuration(null)).toBe('—')
    expect(formatDuration(0)).toBe('0 s')
  })

  it('splits seconds, minutes and hours', () => {
    expect(formatDuration(42)).toBe('42 s')
    expect(formatDuration(192)).toBe('3 min 12 s')
    expect(formatDuration(3600)).toBe('1 h')
    expect(formatDuration(3720)).toBe('1 h 2 min')
  })
})

describe('bucketCount', () => {
  it('counts daily and weekly buckets', () => {
    const from = new Date(2026, 0, 1)
    const to = new Date(2026, 0, 31)
    expect(bucketCount(from, to, 'day')).toBe(31)
    expect(bucketCount(from, to, 'week')).toBe(5)
  })
})
