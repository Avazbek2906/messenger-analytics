import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderWithProviders } from '@/test/render'

import { RankBadge } from './rank-badge'

describe('RankBadge', () => {
  it('shows the position for a ranked employee', () => {
    renderWithProviders(<RankBadge rank={1} isRanked />)

    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('shows a dash when the employee is below the ranking floor', () => {
    // Fewer than 5 scored conversations: an 88.0 average on 3 conversations is
    // NOT first place, so no position and no medal may appear (docs/05 §6).
    renderWithProviders(<RankBadge rank={null} isRanked={false} />)

    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('never renders a position when is_ranked is false', () => {
    // Defensive: the API should not send both, but if it does, `is_ranked` wins.
    renderWithProviders(<RankBadge rank={2} isRanked={false} />)

    expect(screen.queryByText('2')).not.toBeInTheDocument()
  })
})
