import { useSession } from '@/entities/session'
import { PeriodFilter, usePeriod } from '@/features/period-filter'
import { useDocumentTitle } from '@/shared/hooks/use-document-title'
import { useTranslation } from '@/shared/i18n'
import { PageHeader } from '@/shared/ui/layout/page-header'
import { DepartmentsCard } from '@/widgets/team-departments'
import { LeaderboardCard } from '@/widgets/team-leaderboard'

/**
 * The team screen: employee league table plus department comparison.
 *
 * Both widgets share one period state, so the two tables can never describe
 * different windows.
 */
export function TeamPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('nav.team'))
  const period = usePeriod()
  const session = useSession()

  return (
    <>
      <PageHeader
        title={t('nav.team')}
        description={
          session.company
            ? t('team.subtitle', { company: session.company.name })
            : undefined
        }
        actions={<PeriodFilter period={period} />}
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <LeaderboardCard period={period.params} />
        <DepartmentsCard period={period.params} />
      </div>
    </>
  )
}

export default TeamPage
