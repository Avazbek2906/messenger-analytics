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

/**
 * Rubric criteria do NOT share the overall score's 0–100 scale.
 *
 * docs/05 §4 says they do — and its sample shows `84.1` — but the deployed
 * prompt emits 0–10: verified live, `/dashboard/criteria` returns averages of
 * 4.3–8.6 and per-conversation `sub_scores` only ever hold 0, 5, 10 or 15.
 * Rendering an 8.6 against a 100-wide bar drew a near-empty red bar for the
 * team's STRONGEST criterion.
 *
 * The scale is therefore detected from the data rather than assumed, so the UI
 * stays honest whichever prompt version is deployed.
 */
export function rubricScale(values: readonly (number | null)[]): number {
  const max = Math.max(0, ...values.filter((v) => v !== null))
  // Nothing on a 0–10 rubric reaches 20, and nothing on a 0–100 one stays
  // under it for a whole payload — so the gap between them is unambiguous.
  return max > 20 ? 100 : 10
}

/** A criterion's share of its own scale, clamped to `0..1`. */
export function rubricRatio(value: number | null, scale: number): number {
  if (value === null || scale <= 0) return 0
  return Math.min(Math.max(value / scale, 0), 1)
}

/** The same bands as `scoreBand`, applied proportionally to the rubric scale. */
export function rubricBand(
  value: number | null,
  scale: number,
): 'low' | 'mid' | 'high' | null {
  if (value === null) return null
  return scoreBand(rubricRatio(value, scale) * 100)
}
