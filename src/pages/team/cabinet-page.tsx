import { useMyCard } from '@/entities/dashboard'
import { displayName, useSession } from '@/entities/session'
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
 * The employee cabinet.
 *
 * `/dashboard/me` returns the same payload as an employee card, so this page is
 * the manager view with a different query behind it. `400 no_employee_profile`
 * means "you have no cabinet" — an explanation, not an error toast (docs/05).
 */
export function CabinetPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('nav.cabinet'))
  const session = useSession()
  const period = usePeriod()
  const query = useMyCard(period.params)

  const noProfile =
    query.error instanceof ApiError && query.error.has('no_employee_profile')

  return (
    <>
      <PageHeader
        title={t('nav.cabinet')}
        description={t('cabinet.subtitle', {
          name: displayName(session.user),
        })}
        actions={<PeriodFilter period={period} />}
      />

      {noProfile ? (
        <Card>
          <EmptyState
            title={t('cabinet.noProfile.title')}
            description={t('cabinet.noProfile.description')}
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

export default CabinetPage
