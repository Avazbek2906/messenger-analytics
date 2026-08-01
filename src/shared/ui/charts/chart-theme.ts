/**
 * Shared visual settings for charts.
 *
 * From the reference design: thin smooth lines, a barely-there grid, no fill on
 * the plot area. The data outranks the decoration.
 *
 * A11y: series are distinguished by colour AND line style (`strokeDasharray`) —
 * colour alone never carries meaning (WCAG 1.4.1).
 */

export const CHART_COLORS = [
  'var(--color-chart-1)',
  'var(--color-chart-2)',
  'var(--color-chart-3)',
  'var(--color-chart-4)',
  'var(--color-chart-5)',
  'var(--color-chart-6)',
] as const

export const CHART_DASH = [
  undefined,
  '6 4',
  '2 3',
  '10 4 2 4',
  '4 4',
  '1 4',
] as const

export const chartAxis = {
  stroke: 'var(--color-chart-axis)',
  fontSize: 11,
  tickLine: false,
  axisLine: false,
} as const

export const chartGrid = {
  stroke: 'var(--color-chart-grid)',
  strokeDasharray: '0',
  vertical: false,
} as const

/** Outcome colours — identical app-wide (sold / not sold / unclear). */
export const OUTCOME_COLORS = {
  sold: 'var(--color-success)',
  not_sold: 'var(--color-danger)',
  unclear: 'var(--color-fg-subtle)',
} as const

/** Score bands (spec §4): 0–49 is the "poor" band that raises a signal. */
export function scoreBand(score: number | null): 'low' | 'mid' | 'high' | null {
  if (score === null) return null
  if (score <= 49) return 'low'
  if (score < 75) return 'mid'
  return 'high'
}

export const SCORE_BAND_COLORS = {
  low: 'var(--color-danger)',
  mid: 'var(--color-warning)',
  high: 'var(--color-success)',
} as const
