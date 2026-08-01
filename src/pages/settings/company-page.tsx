import { useQuery } from '@tanstack/react-query'

import { sessionApi } from '@/entities/session'
import { queryKeys } from '@/shared/api'
import { QueryBoundary } from '@/shared/ui/feedback/query-boundary'
import { Skeleton } from '@/shared/ui/primitives/skeleton'
import { CompanyForm } from '@/widgets/company-settings'

/** Company settings. The record is resolved from the caller, so there is no id. */
export function CompanySettingsPage() {
  const query = useQuery({
    queryKey: queryKeys.session.company(),
    queryFn: sessionApi.company,
    staleTime: 5 * 60_000,
  })

  return (
    <QueryBoundary
      query={query}
      isEmpty={() => false}
      loading={<Skeleton className="h-96 rounded-xl" />}
    >
      {(company) => <CompanyForm company={company} />}
    </QueryBoundary>
  )
}

export default CompanySettingsPage
