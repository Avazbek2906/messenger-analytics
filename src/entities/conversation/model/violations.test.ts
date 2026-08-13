import { describe, expect, it } from 'vitest'

import { normalizeViolations } from './violations'

describe('normalizeViolations', () => {
  it('accepts the object shape the deployed prompt emits', () => {
    // Verified against the live API: the model returns objects, while docs/03
    // still shows bare strings. Rendering the object as a React child is what
    // crashed the analysis panel.
    const result = normalizeViolations([
      {
        rule: 'rude_tone',
        location: "[2026-08-04 09:17] Xodim: Bilmadim, o'zingiz hal qiling",
        explanation: "Xodim mijozga qo'pol javob berdi.",
      },
    ])

    expect(result).toEqual([
      {
        rule: 'rude_tone',
        location: "[2026-08-04 09:17] Xodim: Bilmadim, o'zingiz hal qiling",
        explanation: "Xodim mijozga qo'pol javob berdi.",
      },
    ])
  })

  it('still accepts the bare-string shape from older prompts', () => {
    expect(normalizeViolations(['no_price_justification'])).toEqual([
      { rule: 'no_price_justification', location: '', explanation: '' },
    ])
  })

  it('fills missing parts rather than leaving them undefined', () => {
    expect(normalizeViolations([{ explanation: 'Salomlashmadi' }])).toEqual([
      { rule: '', location: '', explanation: 'Salomlashmadi' },
    ])
  })

  it('drops entries that carry nothing renderable', () => {
    // A prompt change must degrade to "show less", never to a crash.
    expect(
      normalizeViolations([{}, null, 42, '', { rule: '   ' }] as never),
    ).toEqual([])
  })

  it('survives a non-array value', () => {
    expect(normalizeViolations(null)).toEqual([])
    expect(normalizeViolations(undefined)).toEqual([])
  })
})
