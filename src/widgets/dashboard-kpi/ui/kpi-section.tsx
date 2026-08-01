import { useOverview, type Overview } from '@/entities/dashboard'
import type { PeriodParams } from '@/shared/api'
import { useTranslation } from '@/shared/i18n'
import { QueryBoundary } from '@/shared/ui/feedback/query-boundary'
import { EmptyState } from '@/shared/ui/feedback/states'
import { Card } from '@/shared/ui/primitives/card'

import { CoverageNotice } from './coverage-notice'
import { KpiRow } from './kpi-row'
import { KpiRowSkeleton } from './kpi-row-skeleton'

/**
 * Dashboard sarlavha bloki: qamrov ogohlantirishi + KPI kartalar.
 *
 * The widget owns its query. `OutcomesCard` uses the exact same key, and
 * TanStack Query dedupes them into a single network request — so there is no
 * need to thread props between widgets.
 */
export function KpiSection({ period }: { period: PeriodParams }) {
  const { t } = useTranslation()
  const query = useOverview(period)

  return (
    <QueryBoundary
      query={query}
      loading={<KpiRowSkeleton />}
      isEmpty={(data: Overview) => data.conversations === 0}
      empty={
        <Card>
          <EmptyState
            title={t('overview.empty.title')}
            description={t('overview.empty.description')}
          />
        </Card>
      }
    >
      {(overview) => (
        <div className="space-y-5">
          <CoverageNotice overview={overview} />
          <KpiRow overview={overview} />
        </div>
      )}
    </QueryBoundary>
  )
}
