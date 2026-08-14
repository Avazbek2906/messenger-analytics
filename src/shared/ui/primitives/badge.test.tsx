import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Badge } from './badge'

/** A real emerging-feedback theme from the live API — 104 characters. */
const LONG =
  "Mijoz yetkazib berish narxini so'radi, xodim esa aniqlashtirmasdan keyingi kunga va'da berdi va suhbat to'xtadi"

describe('Badge', () => {
  it('can never be wider than its container', () => {
    // Badges carry catalog labels and model-written text whose length the UI
    // does not control. Without this cap, one long string put the whole
    // products page into horizontal scroll.
    render(<Badge>{LONG}</Badge>)

    expect(screen.getByText(LONG)).toHaveClass('max-w-full')
  })

  it('clips by default and wraps on request', () => {
    const { rerender } = render(<Badge>{LONG}</Badge>)
    expect(screen.getByText(LONG)).toHaveClass('whitespace-nowrap')

    // `wrap` is for content where truncating would drop the only information
    // the badge carries.
    rerender(<Badge wrap>{LONG}</Badge>)
    expect(screen.getByText(LONG)).toHaveClass('whitespace-normal')
  })
})
