import { useState } from 'react'

import {
  defaultGranularity,
  useTimeseries,
  type Granularity,
  type Timeseries,
} from '@/entities/dashboard'
import { ApiError, type PeriodParams } from '@/shared/api'
import { WidgetInsights } from '@/features/widget-insights'
import { useTranslation } from '@/shared/i18n'
import { MAX_BUCKETS } from '@/shared/lib'
import { QueryBoundary } from '@/shared/ui/feedback/query-boundary'
import { EmptyState } from '@/shared/ui/feedback/states'
import { Card, CardBody, CardHeader } from '@/shared/ui/primitives/card'
import { Segmented } from '@/shared/ui/primitives/segmented'
import { Skeleton } from '@/shared/ui/primitives/skeleton'

import { TrendChart } from './trend-chart'

/**
 * Volume and quality trend.
 *
 * The backend returns at most 400 buckets per request and REJECTS anything
 * longer with `period_too_long` (it does not truncate) — so the user is offered
 * a concrete fix: switch to weekly grouping.
 */
export function TrendCard({ period }: { period: PeriodParams }) {
  const { t } = useTranslation()
  // `null` means "follow the window". An explicit pick sticks, so changing the
  // period does not silently undo the grouping the user just chose.
  const [chosen, setChosen] = useState<Granularity | null>(null)
  const granularity = chosen ?? defaultGranularity(period)
  const query = useTimeseries({ ...period, granularity })

  const tooLong =
    query.error instanceof ApiError && query.error.has('period_too_long')

  return (
    <Card>
      <CardHeader
        title={t('trend.title')}
        description={t('trend.description')}
        actions={
          <Segmented
            aria-label={t('trend.granularity')}
            size="sm"
            value={granularity}
            onChange={setChosen}
            options={[
              { value: 'day', label: t('trend.day') },
              { value: 'week', label: t('trend.week') },
            ]}
          />
        }
      />

      <CardBody>
        <WidgetInsights widget="timeseries" period={period} />

        {tooLong ? (
          <EmptyState
            title={t('trend.tooLong.title')}
            description={t('trend.tooLong.description', { max: MAX_BUCKETS })}
            action={
              <button
                type="button"
                onClick={() => setChosen('week')}
                className="cursor-pointer text-sm font-medium text-primary hover:underline"
              >
                {t('trend.tooLong.action')}
              </button>
            }
          />
        ) : (
          <QueryBoundary
            query={query}
            loading={<Skeleton className="h-72 w-full rounded-lg" />}
            isEmpty={(data: Timeseries) => data.series.length === 0}
            empty={
              <EmptyState
                title={t('trend.empty.title')}
                description={t('trend.empty.description')}
              />
            }
          >
            {(data) => (
              <TrendChart series={data.series} granularity={data.granularity} />
            )}
          </QueryBoundary>
        )}
      </CardBody>
    </Card>
  )
}
