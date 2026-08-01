import { useOverview, type Overview } from '@/entities/dashboard'
import type { PeriodParams } from '@/shared/api'
import { useTranslation, type TranslateFn } from '@/shared/i18n'
import { formatNumber, formatPercent } from '@/shared/lib'
import { OUTCOME_COLORS } from '@/shared/ui/charts/chart-theme'
import { QueryBoundary } from '@/shared/ui/feedback/query-boundary'
import { Card, CardBody, CardHeader } from '@/shared/ui/primitives/card'
import { Skeleton } from '@/shared/ui/primitives/skeleton'

import { OutcomeDonut, type DonutSlice } from './outcome-donut'

/**
 * Outcome breakdown.
 *
 * Unscored conversations get their own hatched segment on purpose: they are not
 * "unclear", they simply have not been measured yet (docs/05 §1).
 */
export function OutcomesCard({ period }: { period: PeriodParams }) {
  const { t } = useTranslation()
  const query = useOverview(period)

  return (
    <Card className="h-full">
      <CardHeader
        title={t('outcomes.title')}
        description={
          query.data
            ? t('outcomes.description', {
                count: formatNumber(query.data.conversations),
              })
            : undefined
        }
      />
      <CardBody>
        <QueryBoundary
          query={query}
          loading={<Skeleton className="h-44 w-full rounded-lg" />}
          isEmpty={(data: Overview) => data.conversations === 0}
        >
          {(overview) => (
            <OutcomeDonut
              slices={buildSlices(overview, t)}
              total={overview.conversations}
              centerValue={formatPercent(overview.conversion_rate)}
              centerLabel={t('outcomes.center')}
            />
          )}
        </QueryBoundary>
      </CardBody>
    </Card>
  )
}

function buildSlices(overview: Overview, t: TranslateFn): DonutSlice[] {
  return [
    {
      key: 'sold',
      label: t('outcome.sold'),
      value: overview.sold,
      color: OUTCOME_COLORS.sold,
    },
    {
      key: 'not_sold',
      label: t('outcome.notSold'),
      value: overview.not_sold,
      color: OUTCOME_COLORS.not_sold,
    },
    {
      key: 'unclear',
      label: t('outcome.unclear'),
      value: overview.unclear,
      color: OUTCOME_COLORS.unclear,
    },
    {
      key: 'unscored',
      label: t('outcome.unscored'),
      value: overview.unscored,
      color: 'var(--color-warning)',
      hatched: true,
    },
  ]
}
