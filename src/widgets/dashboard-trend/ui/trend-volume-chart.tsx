import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import type { Granularity, TimeseriesPoint } from '@/entities/dashboard'
import { useTranslation } from '@/shared/i18n'
import { formatNumber } from '@/shared/lib'
import { chartAxis, chartGrid } from '@/shared/ui/charts/chart-theme'
import { ChartTooltip } from '@/shared/ui/charts/chart-tooltip'

import { ChartCaption } from './chart-caption'
import { formatTooltipTitle } from './trend-format'
import { AXIS_WIDTH, CHART_MARGIN, SYNC_ID, VOLUME_COLOR } from './trend-shared'

/**
 * How many conversations closed per bucket.
 *
 * The x-axis is hidden here and drawn once under the score chart below — the
 * two share a scale, so repeating the dates would be noise. `AXIS_WIDTH` is
 * pinned on both charts so the plot areas line up to the pixel; without that
 * the crosshairs would point at different dates.
 */
export function TrendVolumeChart({
  series,
  granularity,
}: {
  series: TimeseriesPoint[]
  granularity: Granularity
}) {
  const { t } = useTranslation()

  const peak = series.reduce(
    (max, point) => Math.max(max, point.conversations),
    0,
  )

  return (
    <div>
      <ChartCaption label={t('trend.legend.volume')} color={VOLUME_COLOR} />
      <div
        role="img"
        aria-label={t('trend.a11y.volume', {
          count: formatNumber(series.length),
          max: formatNumber(peak),
        })}
        className="h-32 w-full"
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={series} margin={CHART_MARGIN} syncId={SYNC_ID}>
            <defs>
              <linearGradient id="trend-volume" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={VOLUME_COLOR} stopOpacity={0.22} />
                <stop
                  offset="100%"
                  stopColor={VOLUME_COLOR}
                  stopOpacity={0.02}
                />
              </linearGradient>
            </defs>

            <CartesianGrid {...chartGrid} />
            <XAxis dataKey="date" hide />
            <YAxis {...chartAxis} width={AXIS_WIDTH} allowDecimals={false} />

            <Tooltip
              cursor={{ stroke: 'var(--color-line-strong)', strokeWidth: 1 }}
              content={({ active, payload }) => {
                const point = payload?.[0]?.payload as
                  TimeseriesPoint | undefined
                if (!active || !point) return null

                return (
                  <ChartTooltip
                    title={formatTooltipTitle(point.date, granularity, t)}
                    rows={[
                      {
                        key: 'conversations',
                        label: t('trend.legend.volume'),
                        value: formatNumber(point.conversations),
                        color: VOLUME_COLOR,
                      },
                      {
                        key: 'sold',
                        label: t('outcome.sold'),
                        value: formatNumber(point.sold),
                      },
                      {
                        key: 'not_sold',
                        label: t('outcome.notSold'),
                        value: formatNumber(point.not_sold),
                      },
                    ]}
                  />
                )
              }}
            />

            <Area
              type="monotone"
              dataKey="conversations"
              stroke={VOLUME_COLOR}
              strokeWidth={2}
              fill="url(#trend-volume)"
              isAnimationActive={false}
              activeDot={{
                r: 4,
                strokeWidth: 2,
                stroke: 'var(--color-surface)',
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
