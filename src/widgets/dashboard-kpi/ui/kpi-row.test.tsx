import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { Overview } from '@/entities/dashboard'
import type { Locale } from '@/shared/i18n'
import { renderWithProviders } from '@/test/render'

import { KpiRow } from './kpi-row'

function buildOverview(patch: Partial<Overview> = {}): Overview {
  return {
    period: {
      date_from: '2026-06-29T00:00:00Z',
      date_to: '2026-07-29T00:00:00Z',
    },
    conversations: 1284,
    scored: 1147,
    unscored: 137,
    unassigned: 42,
    scoring_coverage: 89.3,
    avg_score: 72.4,
    sold: 318,
    not_sold: 604,
    unclear: 225,
    angry_customers: 37,
    conversion_rate: 34.5,
    avg_first_response_seconds: 214.7,
    agreements: { taken: 96, fulfilled: 61, forgotten: 18 },
    previous: {
      conversations: 1102,
      scored: 980,
      avg_score: 69.8,
      sold: 265,
      conversion_rate: 31.2,
      avg_first_response_seconds: 260.1,
    },
    deltas: {
      conversations_percent: 16.5,
      scored_percent: 17,
      sold_percent: 20,
      avg_score_points: 2.6,
      conversion_rate_points: 3.3,
      first_response_percent: -17.5,
    },
    ...patch,
  }
}

function renderRow(overview: Overview, locale: Locale = 'uz') {
  return renderWithProviders(<KpiRow overview={overview} />, { locale })
}

describe('KpiRow', () => {
  it('renders measured values', () => {
    renderRow(buildOverview())

    expect(screen.getByText('72,4')).toBeInTheDocument()
    expect(screen.getByText('34,5%')).toBeInTheDocument()
    expect(screen.getByText('3 min 35 s')).toBeInTheDocument()
  })

  it('renders an unmeasured value as a dash, not a zero', () => {
    renderRow(
      buildOverview({
        avg_score: null,
        conversion_rate: null,
        avg_first_response_seconds: null,
        scoring_coverage: null,
      }),
    )

    // All three KPIs must render "—"; a "0" must appear nowhere.
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(3)
    expect(screen.getByText('Qamrov aniqlanmagan')).toBeInTheDocument()
  })

  it('shows a dash instead of a delta when there is no baseline', () => {
    const { container } = renderRow(
      buildOverview({
        deltas: {
          conversations_percent: null,
          scored_percent: null,
          sold_percent: null,
          avg_score_points: null,
          conversion_rate_points: null,
          first_response_percent: null,
        },
      }),
    )

    expect(container.textContent).not.toContain('+100%')
  })

  it('never appends a percent sign to a point delta', () => {
    renderRow(buildOverview())

    // `avg_score_points: 2.6` → "+2,6" (points, not a percentage).
    expect(screen.getByText('+2,6')).toBeInTheDocument()
    expect(screen.queryByText('+2,6%')).not.toBeInTheDocument()
  })
})
