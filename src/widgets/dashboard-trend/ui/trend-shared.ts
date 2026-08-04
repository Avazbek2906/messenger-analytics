/** Layout constants the two trend charts must agree on to stay aligned. */

export const VOLUME_COLOR = 'var(--color-chart-2)'
export const SCORE_COLOR = 'var(--color-chart-1)'

/**
 * Recharts syncs the hovered index across charts sharing an id, so one
 * crosshair moves through both — the thing a single dual-axis chart gave for
 * free and the reason splitting it does not cost readability.
 */
export const SYNC_ID = 'dashboard-trend'

/**
 * Identical on both charts. The plot area starts after the y-axis, so an axis
 * of a different width would shift one chart's x-scale relative to the other
 * and the synced crosshairs would land on different dates.
 */
export const AXIS_WIDTH = 44

export const CHART_MARGIN = { top: 4, right: 8, bottom: 0, left: -12 } as const

/** Below / at / above the score bands (0–49 poor, 50–74 fair, 75+ good). */
export const SCORE_TICKS = [0, 50, 100]
