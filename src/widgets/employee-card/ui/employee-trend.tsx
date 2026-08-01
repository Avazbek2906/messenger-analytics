import { format } from 'date-fns'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import type { DailyPoint } from '@/entities/dashboard'
import { useTranslation } from '@/shared/i18n'
import { formatNumber, formatScore, parseApiDate } from '@/shared/lib'
import { activeDateLocale } from '@/shared/lib/locale-runtime'
import { chartAxis, chartGrid } from '@/shared/ui/charts/chart-theme'
import { ChartTooltip } from '@/shared/ui/charts/chart-tooltip'
import { EmptyState } from '@/shared/ui/feedback/states'
import { Card, CardBody, CardHeader } from '@/shared/ui/primitives/card'

const SCORE_COLOR = 'var(--color-chart-1)'

/**
 * Daily score trend for one employee.
 *
 * `daily` covers every day in the window, and empty days carry
 * `avg_score: null` — the line must break there rather than dive to zero.
 */
export function EmployeeTrend({ daily }: { daily: DailyPoint[] }) {
  const { t } = useTranslation()
  const hasScores = daily.some((point) => point.avg_score !== null)

  return (
    <Card>
      <CardHeader
        title={t('employee.trend')}
        description={t('employee.trendHint')}
      />
      <CardBody>
        {hasScores ? (
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={daily}
                margin={{ top: 8, right: 8, bottom: 0, left: -16 }}
              >
                <CartesianGrid {...chartGrid} />
                <XAxis
                  dataKey="date"
                  {...chartAxis}
                  tickMargin={10}
                  minTickGap={28}
                  tickFormatter={formatTick}
                />
                <YAxis domain={[0, 100]} {...chartAxis} width={40} />

                <Tooltip
                  cursor={{
                    stroke: 'var(--color-line-strong)',
                    strokeWidth: 1,
                  }}
                  content={({ active, payload }) => {
                    const point = payload?.[0]?.payload as
                      DailyPoint | undefined
                    if (!active || !point) return null

                    return (
                      <ChartTooltip
                        title={formatFullDate(point.date)}
                        rows={[
                          {
                            key: 'score',
                            label: t('criteria.average'),
                            value: formatScore(point.avg_score),
                            color: SCORE_COLOR,
                          },
                          {
                            key: 'conversations',
                            label: t('team.conversations'),
                            value: formatNumber(point.conversations),
                          },
                        ]}
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
                  activeDot={{
                    r: 4,
                    strokeWidth: 2,
                    stroke: 'var(--color-surface)',
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyState
            title={t('employee.noTrend.title')}
            description={t('employee.noTrend.description')}
            compact
          />
        )}
      </CardBody>
    </Card>
  )
}

function formatTick(value: string): string {
  const date = parseApiDate(`${value} 00:00:00`)
  return date ? format(date, 'd MMM', { locale: activeDateLocale() }) : value
}

function formatFullDate(value: string): string {
  const date = parseApiDate(`${value} 00:00:00`)
  return date
    ? format(date, 'd MMMM yyyy', { locale: activeDateLocale() })
    : value
}
