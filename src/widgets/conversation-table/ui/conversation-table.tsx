import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import { ROUTES } from '@/app/router/routes'
import { useConversations, type Conversation } from '@/entities/conversation'
import { useSession } from '@/entities/session'
import type { ConversationFilterState } from '@/features/conversation-filters'
import { useTranslation } from '@/shared/i18n'
import { formatNumber } from '@/shared/lib'
import { DataTable } from '@/shared/ui/data/data-table'
import { Pagination } from '@/shared/ui/data/pagination'
import { EmptyState, ErrorState } from '@/shared/ui/feedback/states'
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
} from '@/shared/ui/primitives/card'

import { buildConversationColumns } from './conversation-columns'

/**
 * The conversation table.
 *
 * Filter state is passed in (it lives in the URL), so the very same component
 * serves a dashboard drill-down without any changes.
 */
export function ConversationTable({
  filters,
}: {
  filters: ConversationFilterState
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const session = useSession()
  const query = useConversations(filters.params)

  const mode = session.company?.attribution_mode
  const columns = useMemo(() => buildConversationColumns(t, mode), [t, mode])

  const total = query.data?.count ?? 0
  const rows = query.data?.results ?? []

  return (
    <Card>
      <CardHeader
        title={t('nav.conversations')}
        description={
          query.data
            ? t('conversationTable.total', { count: formatNumber(total) })
            : undefined
        }
      />

      {query.isError ? (
        <CardBody>
          <ErrorState
            error={query.error}
            onRetry={() => void query.refetch()}
          />
        </CardBody>
      ) : !query.isPending && rows.length === 0 ? (
        <CardBody>
          <EmptyState
            title={
              filters.activeCount > 0
                ? t('conversationTable.emptyFiltered.title')
                : t('conversationTable.empty.title')
            }
            description={
              filters.activeCount > 0
                ? t('conversationTable.emptyFiltered.description')
                : t('conversationTable.empty.description')
            }
          />
        </CardBody>
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={rows}
            getRowKey={(row: Conversation) => row.id}
            isLoading={query.isPending}
            caption={t('nav.conversations')}
            onRowClick={(row) => navigate(ROUTES.conversation(row.id))}
          />

          <CardFooter>
            <Pagination
              total={total}
              limit={filters.limit}
              offset={filters.offset}
              onOffsetChange={filters.setOffset}
            />
          </CardFooter>
        </>
      )}
    </Card>
  )
}
