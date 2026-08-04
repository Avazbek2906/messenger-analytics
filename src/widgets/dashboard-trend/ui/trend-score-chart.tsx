import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import type { Granularity, TimeseriesPoint } from '@/entities/dashboard'
import { useTranslation } from '@/shared/i18n'
import { formatScore } from '@/shared/lib'
import { chartAxis, chartGrid } from '@/shared/ui/charts/chart-theme'
import { ChartTooltip } from '@/shared/ui/charts/chart-tooltip'

import { ChartCaption } from './chart-caption'
import { formatTick, formatTooltipTitle } from './trend-format'
import {
  AXIS_WIDTH,
  CHART_MARGIN,
  SCORE_COLOR,
  SCORE_TICKS,
  SYNC_ID,
} from './trend-shared'

/**
 * Average score per bucket — the chart that carries the shared x-axis.
 *
 * Two things are deliberate. The domain is pinned to the full 0–100 scale, so
 * a two-point wiggle cannot be auto-scaled into a cliff. And an empty bucket
 * has `avg_score: null`, where the line must BREAK — dropping to zero would
 * draw the lie that quality collapsed that day (docs/05 §1).
 */
export function TrendScoreChart({
  series,
  granularity,
}: {
  series: TimeseriesPoint[]
  granularity: Granularity
}) {
  const { t } = useTranslation()

  const scores = series
    .map((point) => point.avg_score)
    .filter((score): score is number => score !== null)

  return (
    <div>
      <ChartCaption label={t('trend.legend.score')} color={SCORE_COLOR} />
      <div
        role="img"
        aria-label={
          scores.length === 0
            ? t('trend.a11y.scoreEmpty')
            : t('trend.a11y.score', {
                min: formatScore(Math.min(...scores)),
                max: formatScore(Math.max(...scores)),
              })
        }
        className="h-40 w-full"
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={series} margin={CHART_MARGIN} syncId={SYNC_ID}>
            <CartesianGrid {...chartGrid} />

            <XAxis
              dataKey="date"
              {...chartAxis}
              tickMargin={10}
              minTickGap={24}
              tickFormatter={formatTick}
            />
            <YAxis
              {...chartAxis}
              width={AXIS_WIDTH}
              domain={[0, 100]}
              ticks={SCORE_TICKS}
            />

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
                        key: 'score',
                        label: t('criteria.average'),
                        value: formatScore(point.avg_score),
                        color: SCORE_COLOR,
                      },
                    ]}
                    footer={
                      point.scored === 0 && point.conversations > 0
                        ? t('trend.tooltip.noneScored')
                        : undefined
                    }
                  />
                )
              }}
            />

            <Line
              type="monotone"
              dataKey="avg_score"
              stroke={SCORE_COLOR}
              strokeWidth={2.5}
              dot={false}
              connectNulls={false}
              isAnimationActive={false}
              activeDot={{
                r: 4,
                strokeWidth: 2,
                stroke: 'var(--color-surface)',
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
