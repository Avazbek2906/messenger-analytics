import { format } from 'date-fns'
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import type { Granularity, TimeseriesPoint } from '@/entities/dashboard'
import { useTranslation, type TranslateFn } from '@/shared/i18n'
import { formatNumber, formatScore, parseApiDate } from '@/shared/lib'
import { activeDateLocale } from '@/shared/lib/locale-runtime'
import { chartAxis, chartGrid } from '@/shared/ui/charts/chart-theme'
import { ChartTooltip } from '@/shared/ui/charts/chart-tooltip'

interface TrendChartProps {
  series: TimeseriesPoint[]
  granularity: Granularity
}

const VOLUME_COLOR = 'var(--color-chart-2)'
const SCORE_COLOR = 'var(--color-chart-1)'

/**
 * Volume (area) plus quality (line) on two axes.
 *
 * CRITICAL: an empty bucket has `avg_score: null` and the line must BREAK
 * there. Dropping it to zero would draw the lie that quality collapsed that day
 * (docs/05 §1).
 */
export function TrendChart({ series, granularity }: TrendChartProps) {
  const { t } = useTranslation()

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={series}
          margin={{ top: 8, right: 8, bottom: 0, left: -12 }}
        >
          <defs>
            <linearGradient id="trend-volume" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={VOLUME_COLOR} stopOpacity={0.22} />
              <stop offset="100%" stopColor={VOLUME_COLOR} stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <CartesianGrid {...chartGrid} />

          <XAxis
            dataKey="date"
            {...chartAxis}
            tickMargin={10}
            minTickGap={24}
            tickFormatter={formatTick}
          />
          <YAxis
            yAxisId="volume"
            {...chartAxis}
            width={44}
            allowDecimals={false}
          />
          <YAxis
            yAxisId="score"
            orientation="right"
            domain={[0, 100]}
            {...chartAxis}
            width={36}
          />

          <Tooltip
            cursor={{ stroke: 'var(--color-line-strong)', strokeWidth: 1 }}
            content={({ active, payload }) => {
              const point = payload?.[0]?.payload as TimeseriesPoint | undefined
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
                      key: 'score',
                      label: t('criteria.average'),
                      value: formatScore(point.avg_score),
                      color: SCORE_COLOR,
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
                  footer={
                    point.scored === 0 && point.conversations > 0
                      ? t('trend.tooltip.noneScored')
                      : undefined
                  }
                />
              )
            }}
          />

          <Area
            yAxisId="volume"
            type="monotone"
            dataKey="conversations"
            stroke={VOLUME_COLOR}
            strokeWidth={2}
            fill="url(#trend-volume)"
            activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--color-surface)' }}
          />
          <Line
            yAxisId="score"
            type="monotone"
            dataKey="avg_score"
            stroke={SCORE_COLOR}
            strokeWidth={2.5}
            dot={false}
            connectNulls={false}
            activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--color-surface)' }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

/** Bucket date (`YYYY-MM-DD`) → axis tick label. */
function formatTick(value: string): string {
  const date = parseApiDate(`${value} 00:00:00`)
  return date ? format(date, 'd MMM', { locale: activeDateLocale() }) : value
}

function formatTooltipTitle(
  value: string,
  granularity: Granularity,
  t: TranslateFn,
): string {
  const date = parseApiDate(`${value} 00:00:00`)
  if (!date) return value

  const label = format(date, 'd MMMM yyyy', { locale: activeDateLocale() })
  return granularity === 'week'
    ? t('trend.tooltip.weekOf', { date: label })
    : label
}
