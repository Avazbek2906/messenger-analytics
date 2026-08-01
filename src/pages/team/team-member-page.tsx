import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { ROUTES } from '@/app/router/routes'
import { useEmployeeCard } from '@/entities/dashboard'
import { PeriodFilter, usePeriod } from '@/features/period-filter'
import { ApiError } from '@/shared/api'
import { useDocumentTitle } from '@/shared/hooks/use-document-title'
import { useTranslation } from '@/shared/i18n'
import { QueryBoundary } from '@/shared/ui/feedback/query-boundary'
import { EmptyState } from '@/shared/ui/feedback/states'
import { PageHeader } from '@/shared/ui/layout/page-header'
import { Card } from '@/shared/ui/primitives/card'
import { EmployeeCardBody } from '@/widgets/employee-card'

import { EmployeeCardSkeleton } from './ui/employee-card-skeleton'

/**
 * One employee's card, reached from a league-table row.
 *
 * A cross-company id comes back as `400 employee_not_found`, never a bare 404,
 * so that code gets its own empty state rather than a generic error (docs/05).
 */
export function TeamMemberPage() {
  const { id = '' } = useParams()
  const { t } = useTranslation()
  useDocumentTitle(t('employee.title'))
  const period = usePeriod()
  const query = useEmployeeCard(id, period.params)

  const notFound =
    query.error instanceof ApiError && query.error.has('employee_not_found')

  return (
    <>
      <PageHeader
        eyebrow={
          <Link
            to={ROUTES.team}
            className="mb-1 inline-flex items-center gap-1.5 text-[13px] text-fg-muted transition-colors hover:text-fg"
          >
            <ArrowLeft className="size-3.5" aria-hidden />
            {t('employee.backToTeam')}
          </Link>
        }
        title={t('employee.title')}
        actions={<PeriodFilter period={period} />}
      />

      {notFound ? (
        <Card>
          <EmptyState
            title={t('employee.notFound.title')}
            description={t('employee.notFound.description')}
          />
        </Card>
      ) : (
        <QueryBoundary
          query={query}
          isEmpty={() => false}
          loading={<EmployeeCardSkeleton />}
        >
          {(card) => <EmployeeCardBody card={card} />}
        </QueryBoundary>
      )}
    </>
  )
}

export default TeamMemberPage
