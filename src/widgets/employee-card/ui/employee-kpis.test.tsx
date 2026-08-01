import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { EmployeeCard } from '@/entities/dashboard'
import { renderWithProviders } from '@/test/render'

import { EmployeeKpis } from './employee-kpis'

function buildCard(patch: Partial<EmployeeCard> = {}): EmployeeCard {
  return {
    employee: 'e1',
    period: {
      date_from: '2026-06-29T00:00:00Z',
      date_to: '2026-07-29T00:00:00Z',
    },
    rank: 1,
    ranked_total: 12,
    handled_conversations: 214,
    conversations: 190,
    avg_score: 81.7,
    avg_conversations_per_day: 6.9,
    avg_first_response_seconds: 143.5,
    avg_response_seconds: 168.2,
    violations: 6,
    sold: 74,
    not_sold: 96,
    unclear: 44,
    conversion_rate: 43.5,
    agreements: { taken: 22, fulfilled: 15, forgotten: 3 },
    daily: [],
    criteria: [],
    strengths: [],
    weaknesses: [],
    funnel: { analyzed: 0, stages: [] },
    best_conversations: [],
    worst_conversations: [],
    coaching: [],
    ...patch,
  }
}

describe('EmployeeKpis', () => {
  it('renders rank out of the ranked total', () => {
    renderWithProviders(<EmployeeKpis card={buildCard()} />)

    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('/ 12')).toBeInTheDocument()
  })

  it('explains an absent rank instead of showing a position', () => {
    renderWithProviders(
      <EmployeeKpis card={buildCard({ rank: null, ranked_total: 12 })} />,
    )

    expect(screen.getByText('—')).toBeInTheDocument()
    expect(screen.queryByText('/ 12')).not.toBeInTheDocument()
  })

  it('shows scored versus handled, since the gap is the unscored tail', () => {
    renderWithProviders(<EmployeeKpis card={buildCard()} />)

    expect(
      screen.getByText('214 tadan 190 tasi baholangan'),
    ).toBeInTheDocument()
  })

  it('keeps unmeasured values as a dash', () => {
    renderWithProviders(
      <EmployeeKpis
        card={buildCard({
          avg_score: null,
          conversion_rate: null,
          avg_first_response_seconds: null,
        })}
      />,
    )

    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(3)
  })
})
