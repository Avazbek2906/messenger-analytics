import { format } from 'date-fns'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import type { AgreementDailyPoint } from '@/entities/dashboard'
import { useTranslation } from '@/shared/i18n'
import { formatNumber, parseApiDate } from '@/shared/lib'
import { activeDateLocale } from '@/shared/lib/locale-runtime'
import { chartAxis, chartGrid } from '@/shared/ui/charts/chart-theme'
import { ChartTooltip } from '@/shared/ui/charts/chart-tooltip'
import { Card, CardBody, CardHeader } from '@/shared/ui/primitives/card'

const SERIES = [
  {
    key: 'fulfilled',
    labelKey: 'agreementStatus.fulfilled',
    color: 'var(--color-success)',
  },
  {
    key: 'forgotten',
    labelKey: 'agreementStatus.forgotten',
    color: 'var(--color-danger)',
  },
] as const

/**
 * Day-by-day promises.
 *
 * Stacked bars rather than lines: these are counts of discrete events, and a
 * day with none is a real zero (not a missing measurement), so the bar simply
 * has no height. `daily` is always day-granular with no `granularity` param.
 */
export function AgreementsTrend({ daily }: { daily: AgreementDailyPoint[] }) {
  const { t } = useTranslation()

  return (
    <Card>
      <CardHeader
        title={t('agreementsBoard.trend')}
        description={t('agreementsBoard.trendHint')}
      />
      <CardBody>
        <ul className="mb-3 flex flex-wrap items-center gap-4">
          {SERIES.map((series) => (
            <li
              key={series.key}
              className="flex items-center gap-1.5 text-xs text-fg-muted"
            >
              <span
                aria-hidden
                className="size-2 rounded-full"
                style={{ backgroundColor: series.color }}
              />
              {t(series.labelKey)}
            </li>
          ))}
        </ul>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={daily}
              margin={{ top: 8, right: 8, bottom: 0, left: -20 }}
            >
              <CartesianGrid {...chartGrid} />
              <XAxis
                dataKey="date"
                {...chartAxis}
                tickMargin={10}
                minTickGap={28}
                tickFormatter={formatTick}
              />
              <YAxis {...chartAxis} width={36} allowDecimals={false} />

              <Tooltip
                cursor={{ fill: 'var(--color-surface-sunken)' }}
                content={({ active, payload }) => {
                  const point = payload?.[0]?.payload as
                    AgreementDailyPoint | undefined
                  if (!active || !point) return null

                  return (
                    <ChartTooltip
                      title={formatFullDate(point.date)}
                      rows={[
                        {
                          key: 'taken',
                          label: t('agreementsBoard.taken'),
                          value: formatNumber(point.taken),
                        },
                        ...SERIES.map((series) => ({
                          key: series.key,
                          label: t(series.labelKey),
                          value: formatNumber(point[series.key]),
                          color: series.color,
                        })),
                      ]}
                    />
                  )
                }}
              />

              {SERIES.map((series) => (
                <Bar
                  key={series.key}
                  dataKey={series.key}
                  stackId="agreements"
                  fill={series.color}
                  radius={series.key === 'forgotten' ? [4, 4, 0, 0] : 0}
                  isAnimationActive={false}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
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
