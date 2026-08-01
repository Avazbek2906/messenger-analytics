import { useSession } from '@/entities/session'
import { PeriodFilter, usePeriod } from '@/features/period-filter'
import { AskPanel } from '@/features/ask-ai'
import { useDocumentTitle } from '@/shared/hooks/use-document-title'
import { useTranslation } from '@/shared/i18n'
import { PageHeader } from '@/shared/ui/layout/page-header'
import { CriteriaCard } from '@/widgets/dashboard-criteria'
import { FunnelCard } from '@/widgets/dashboard-funnel'
import { KpiSection } from '@/widgets/dashboard-kpi'
import { OutcomesCard } from '@/widgets/dashboard-outcomes'
import { TrendCard } from '@/widgets/dashboard-trend'
import { SignalsQueue } from '@/widgets/signals-queue'

/**
 * Dashboard.
 *
 * The page only composes: it owns the period state in one place and passes it
 * to EVERY widget. The widgets fetch their own data.
 */
export function DashboardPage() {
  const session = useSession()
  const period = usePeriod()
  const { t } = useTranslation()
  useDocumentTitle(t('nav.dashboard'))

  return (
    <>
      <PageHeader
        title={t('nav.dashboard')}
        description={
          session.company
            ? t('dashboard.subtitle', { company: session.company.name })
            : undefined
        }
        actions={<PeriodFilter period={period} />}
      />

      <div className="space-y-5">
        <KpiSection period={period.params} />

        <SignalsQueue period={period.params} />

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
          <OutcomesCard period={period.params} />
          <TrendCard period={period.params} />
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          <CriteriaCard period={period.params} />
          <FunnelCard period={period.params} />
        </div>

        <AskPanel period={period.params} />
      </div>
    </>
  )
}

export default DashboardPage
