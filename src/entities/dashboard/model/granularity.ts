import type { PeriodParams } from '@/shared/api'

import type { Granularity } from './types'

/** Past this many days a daily series stops being readable. */
const DAILY_MAX_DAYS = 30

/**
 * Which grouping to open the trend with.
 *
 * Daily buckets stay readable for about a month; beyond that the chart turns
 * into noise long before it hits the backend's 400-bucket ceiling. The guide
 * makes this a launch requirement — weekly for any window over 30 days — so it
 * is chosen automatically rather than left to the user to discover.
 *
 * An omitted window is the API's own 30-day default, which is exactly the
 * boundary, so it stays daily.
 */
export function defaultGranularity(period: PeriodParams): Granularity {
  const from = period.date_from ? Date.parse(period.date_from) : NaN
  const to = period.date_to ? Date.parse(period.date_to) : NaN
  if (Number.isNaN(from) || Number.isNaN(to)) return 'day'

  return (to - from) / 86_400_000 > DAILY_MAX_DAYS ? 'week' : 'day'
}
