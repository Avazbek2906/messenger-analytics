import { afterEach, describe, expect, it } from 'vitest'

import { formatNumber, formatPercent } from './format'
import { setActiveLocale } from './locale-runtime'

afterEach(() => setActiveLocale('uz'))

describe('locale-aware number formatting', () => {
  it('changes the group separator per locale', () => {
    setActiveLocale('en')
    expect(formatNumber(1284)).toBe('1,284')

    setActiveLocale('ru')
    // In uz and ru the group separator is a non-breaking space (U+00A0).
    expect(formatNumber(1284).replaceAll(' ', ' ')).toBe('1 284')
  })

  it('changes the decimal separator per locale', () => {
    setActiveLocale('en')
    expect(formatPercent(34.5)).toBe('34.5%')

    setActiveLocale('uz')
    expect(formatPercent(34.5)).toBe('34,5%')
  })

  it('renders null as a dash in every locale', () => {
    for (const locale of ['uz', 'ru', 'en'] as const) {
      setActiveLocale(locale)
      expect(formatNumber(null)).toBe('—')
    }
  })
})
