import { useAgreements } from '@/entities/dashboard'
import type { PeriodParams } from '@/shared/api'
import { useTranslation } from '@/shared/i18n'
import { QueryBoundary } from '@/shared/ui/feedback/query-boundary'
import { EmptyState } from '@/shared/ui/feedback/states'
import { Card } from '@/shared/ui/primitives/card'
import { Skeleton } from '@/shared/ui/primitives/skeleton'

import { AgreementsByEmployee } from './agreements-by-employee'
import { AgreementsKpis } from './agreements-kpis'
import { AgreementsTrend } from './agreements-trend'
import { UpcomingAgreements } from './upcoming-agreements'

/**
 * The promises board.
 *
 * One request feeds every section below, so the KPI row, the daily chart and
 * the queues can never describe different windows.
 */
export function AgreementsBoard({ period }: { period: PeriodParams }) {
  const { t } = useTranslation()
  const query = useAgreements(period)

  return (
    <QueryBoundary
      query={query}
      isEmpty={(data) => data.taken === 0}
      loading={
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-32 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-72 rounded-xl" />
        </div>
      }
      empty={
        <Card>
          <EmptyState
            title={t('agreementsBoard.empty.title')}
            description={t('agreementsBoard.empty.description')}
          />
        </Card>
      }
    >
      {(data) => (
        <div className="space-y-5">
          <AgreementsKpis data={data} />
          <AgreementsTrend daily={data.daily} />

          <div className="grid gap-5 xl:grid-cols-2">
            <UpcomingAgreements items={data.upcoming} />
            <AgreementsByEmployee rows={data.by_employee} />
          </div>
        </div>
      )}
    </QueryBoundary>
  )
}
