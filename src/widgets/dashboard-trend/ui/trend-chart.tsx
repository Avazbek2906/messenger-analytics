import type { Granularity, TimeseriesPoint } from '@/entities/dashboard'

import { TrendScoreChart } from './trend-score-chart'
import { TrendVolumeChart } from './trend-volume-chart'

/**
 * Volume and quality, as two stacked charts rather than one with two y-axes.
 *
 * The scales are unrelated — 0–40 conversations against 0–100 points — so any
 * alignment of a shared plot area invents a correlation the data does not
 * contain. Split, each series is read against its own baseline, and the synced
 * crosshair still ties a date across both.
 */
export function TrendChart({
  series,
  granularity,
}: {
  series: TimeseriesPoint[]
  granularity: Granularity
}) {
  return (
    <div className="space-y-3">
      <TrendVolumeChart series={series} granularity={granularity} />
      <TrendScoreChart series={series} granularity={granularity} />
    </div>
  )
}
