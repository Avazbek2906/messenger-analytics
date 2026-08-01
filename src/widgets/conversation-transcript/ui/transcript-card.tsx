import { useState } from 'react'

import { useMessages, type RawMessage } from '@/entities/conversation'
import type { Paginated, UUID } from '@/shared/api'
import { useTranslation } from '@/shared/i18n'
import { formatNumber } from '@/shared/lib'
import { QueryBoundary } from '@/shared/ui/feedback/query-boundary'
import { EmptyState } from '@/shared/ui/feedback/states'
import { Button } from '@/shared/ui/primitives/button'
import { Card, CardBody, CardHeader } from '@/shared/ui/primitives/card'
import { Skeleton } from '@/shared/ui/primitives/skeleton'

import { MessageBubble } from './message-bubble'

const PAGE_SIZE = 100

/**
 * Conversation transcript.
 *
 * Messages arrive in ASCENDING `sent_at` order, but a chat UI usually wants the
 * newest first: `count` comes from a probe request, the LAST page is loaded,
 * and the user walks backwards for older messages
 * (docs/03 "Pagination strategy for long threads").
 */
export function TranscriptCard({ conversationId }: { conversationId: UUID }) {
  const { t } = useTranslation()
  const [offset, setOffset] = useState<number | null>(null)

  // A probe request just to learn `count`; then we jump to the last page.
  const probe = useMessages(conversationId, { limit: 1, offset: 0 })
  const total = probe.data?.count ?? 0

  const resolvedOffset = offset ?? Math.max(0, total - PAGE_SIZE)

  const query = useMessages(conversationId, {
    limit: PAGE_SIZE,
    offset: resolvedOffset,
  })

  const hasEarlier = resolvedOffset > 0

  return (
    <Card className="flex h-full flex-col">
      <CardHeader
        title={t('transcript.title')}
        description={
          probe.data
            ? t('transcript.count', { count: formatNumber(total) })
            : undefined
        }
      />

      <CardBody className="min-h-0 flex-1">
        <QueryBoundary
          query={query}
          loading={
            <div className="space-y-3">
              {Array.from({ length: 6 }, (_, index) => (
                <Skeleton
                  key={index}
                  className="h-14 rounded-2xl"
                  style={{
                    width: `${55 + ((index * 13) % 30)}%`,
                    marginLeft: index % 2 ? 'auto' : undefined,
                  }}
                />
              ))}
            </div>
          }
          isEmpty={(data: Paginated<RawMessage>) => data.results.length === 0}
          empty={<EmptyState title={t('transcript.empty')} compact />}
        >
          {(data) => (
            <div className="scrollbar-slim max-h-[60vh] overflow-y-auto pr-1">
              {hasEarlier ? (
                <div className="pb-3 text-center">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      setOffset(Math.max(0, resolvedOffset - PAGE_SIZE))
                    }
                  >
                    {t('transcript.loadEarlier')}
                  </Button>
                </div>
              ) : null}

              <ul className="space-y-3">
                {data.results.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
              </ul>
            </div>
          )}
        </QueryBoundary>
      </CardBody>
    </Card>
  )
}
