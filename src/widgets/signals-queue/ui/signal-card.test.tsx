import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useSessionStore } from '@/entities/session'
import type { SignalBucket } from '@/entities/signal'
import { renderWithProviders } from '@/test/render'

import { SignalCard } from './signal-card'

function asManager() {
  useSessionStore.setState({
    isAuthenticated: true,
    context: {
      user: {
        id: 'u1',
        username: 'aziza.k',
        email: '',
        first_name: '',
        last_name: '',
        role: 'manager',
        company: 'c1',
      },
      company: null,
      canWrite: true,
      canViewCompanyDashboards: true,
      isCabinet: false,
      hasEmployeeProfile: false,
    },
  })
}

function buildBucket(patch: Partial<SignalBucket> = {}): SignalBucket {
  return {
    count: 17,
    resolved: 5,
    items: [
      {
        conversation: 'c1',
        customer_name: 'Dilnoza R.',
        employee_name: 'Sardor',
        closed_at: '2026-07-28 15:04:11',
      },
    ],
    ...patch,
  }
}

describe('SignalCard', () => {
  it('shows the real total, not the preview length', () => {
    // `items` caps at 20 while `count` is the true number — deriving the badge
    // from the list would understate the queue (docs/06).
    asManager()
    renderWithProviders(
      <SignalCard
        kind="low_score"
        bucket={buildBucket()}
        isResolved={() => false}
        onResolve={vi.fn()}
        isResolving={false}
      />,
    )

    expect(screen.getByText('17')).toBeInTheDocument()
  })

  it('drops a locally resolved row and decrements the count', () => {
    // The aggregate is cached for up to 120 s, so the row keeps coming back
    // from the server — the local set is what the UI trusts.
    asManager()
    renderWithProviders(
      <SignalCard
        kind="low_score"
        bucket={buildBucket()}
        isResolved={() => true}
        onResolve={vi.fn()}
        isResolving={false}
      />,
    )

    expect(screen.queryByText('Dilnoza R.')).not.toBeInTheDocument()
    expect(screen.getByText('16')).toBeInTheDocument()
  })

  it('renders nothing when a signal has neither open nor handled items', () => {
    asManager()
    const { container } = renderWithProviders(
      <SignalCard
        kind="unassigned"
        bucket={buildBucket({ count: 0, resolved: 0, items: [] })}
        isResolved={() => false}
        onResolve={vi.fn()}
        isResolving={false}
      />,
    )

    expect(container.querySelector('li')).toBeNull()
  })
})
