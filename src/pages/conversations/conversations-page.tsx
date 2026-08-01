import {
  FilterBar,
  useConversationFilters,
} from '@/features/conversation-filters'
import { useDocumentTitle } from '@/shared/hooks/use-document-title'
import { useTranslation } from '@/shared/i18n'
import { PageHeader } from '@/shared/ui/layout/page-header'
import { ConversationTable } from '@/widgets/conversation-table'

/**
 * The conversation list.
 *
 * Every number on the dashboard drills down to this screen, so the filter state
 * lives in the URL — a shared link carries the context with it.
 */
export function ConversationsPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('nav.conversations'))
  const filters = useConversationFilters()

  return (
    <>
      <PageHeader
        title={t('nav.conversations')}
        description={t('conversations.subtitle')}
      />

      <div className="space-y-4">
        <FilterBar filters={filters} />
        <ConversationTable filters={filters} />
      </div>
    </>
  )
}

export default ConversationsPage
