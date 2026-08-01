import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import type { LostProduct } from '@/entities/dashboard'
import { renderWithProviders } from '@/test/render'

import { ProductRow } from './product-row'

function buildProduct(patch: Partial<LostProduct> = {}): LostProduct {
  return {
    product: 'p1',
    product_name: 'Turkiya turi (7 kun)',
    currency: 'UZS',
    customers: 23,
    lost_value: 184_000_000,
    reasons: [
      {
        reason: 'r1',
        code: 'narx',
        label: 'Narx qimmat',
        customers: 14,
        conversations: ['c1', 'c2'],
      },
    ],
    ...patch,
  }
}

describe('ProductRow', () => {
  it('renders the money value when the catalog carries a price', () => {
    renderWithProviders(<ProductRow product={buildProduct()} />)

    expect(screen.getByText(/184\D?000\D?000 UZS/)).toBeInTheDocument()
  })

  it('renders a dash rather than "0 UZS" when there is no price', () => {
    // A missing price is "not valued", not "worth nothing" (docs/05).
    renderWithProviders(
      <ProductRow product={buildProduct({ lost_value: null })} />,
    )

    expect(screen.getByText('—')).toBeInTheDocument()
    expect(screen.queryByText(/0 UZS/)).not.toBeInTheDocument()
  })

  it('reveals the reason drill-down only after expanding', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ProductRow product={buildProduct()} />)

    expect(screen.queryByText('Narx qimmat')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button'))

    expect(screen.getByText('Narx qimmat')).toBeInTheDocument()
    // The drill-down carries BOTH ids, so the list matches the cell it came from.
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      '/conversations?product=p1&reason=r1',
    )
  })

  it('cannot be expanded when the product has no attributed reasons', () => {
    renderWithProviders(<ProductRow product={buildProduct({ reasons: [] })} />)

    expect(screen.getByRole('button')).toBeDisabled()
  })
})
