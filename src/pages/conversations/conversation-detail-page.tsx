import { useState } from 'react'
import { useParams } from 'react-router-dom'

import { useConversation } from '@/entities/conversation'
import { AssignDialog } from '@/features/assign-conversation'
import { OverrideDialog } from '@/features/override-analysis'
import { useTranslation } from '@/shared/i18n'
import { QueryBoundary } from '@/shared/ui/feedback/query-boundary'
import { Skeleton } from '@/shared/ui/primitives/skeleton'
import { AgreementsList } from '@/widgets/conversation-agreements'
import { AnalysisCard } from '@/widgets/conversation-analysis'
import { OverrideHistory } from '@/widgets/conversation-overrides'
import { TranscriptCard } from '@/widgets/conversation-transcript'

import { ConversationHeader } from './ui/conversation-header'

/**
 * The single-conversation screen.
 *
 * Evidence on the left (transcript), conclusion on the right (analysis), so the
 * path from a number to its proof is one glance. Both requests run in parallel
 * (docs/03).
 */
export function ConversationDetailPage() {
  const { id = '' } = useParams()
  const { t } = useTranslation()
  const query = useConversation(id)

  const [assignOpen, setAssignOpen] = useState(false)
  const [overrideOpen, setOverrideOpen] = useState(false)

  return (
    <QueryBoundary
      query={query}
      isEmpty={() => false}
      loading={
        <div className="space-y-6">
          <Skeleton className="h-24 w-full max-w-md" />
          <div className="grid gap-5 xl:grid-cols-2">
            <Skeleton className="h-96 rounded-xl" />
            <Skeleton className="h-96 rounded-xl" />
          </div>
        </div>
      }
    >
      {(detail) => (
        <>
          <ConversationHeader
            detail={detail}
            onAssign={() => setAssignOpen(true)}
            onOverride={() => setOverrideOpen(true)}
          />

          <div className="grid gap-5 xl:grid-cols-2">
            <div className="space-y-5">
              <TranscriptCard conversationId={id} />
            </div>

            <div className="space-y-5">
              <AnalysisCard detail={detail} />
              <AgreementsList agreements={detail.agreements} />
              <OverrideHistory overrides={detail.overrides} />
            </div>
          </div>

          <AssignDialog
            conversationId={id}
            currentEmployeeId={detail.employee}
            open={assignOpen}
            onOpenChange={setAssignOpen}
          />

          {detail.analysis ? (
            <OverrideDialog
              conversationId={id}
              detail={detail}
              open={overrideOpen}
              onOpenChange={setOverrideOpen}
            />
          ) : null}

          <span className="sr-only">{t('conversation.readOnlyNotice')}</span>
        </>
      )}
    </QueryBoundary>
  )
}

export default ConversationDetailPage
