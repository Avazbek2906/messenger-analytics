import { AlertTriangle, CircleDot } from 'lucide-react'

import {
  ChannelIcon,
  OutcomeBadge,
  ScoreValue,
  SentimentBadge,
  type Conversation,
} from '@/entities/conversation'
import type { TranslateFn } from '@/shared/i18n'
import { DASH, formatDateTime, formatDuration, orDash } from '@/shared/lib'
import type { Column } from '@/shared/ui/data/data-table'
import { Tooltip } from '@/shared/ui/primitives/tooltip'

/**
 * Jadval ustunlari.
 *
 * Kept in its own file: the column list is long and evolves independently of
 * the table composition.
 */
export function buildConversationColumns(
  t: TranslateFn,
): Column<Conversation>[] {
  return [
    {
      key: 'customer',
      header: t('conversationTable.customer'),
      cell: (row) => (
        <div className="flex items-center gap-2.5">
          <ChannelIcon channel={row.channel} />
          <div className="min-w-0">
            <p className="truncate font-medium text-fg">
              {orDash(row.customer_name)}
            </p>
            {row.closed_at === null ? (
              <span className="flex items-center gap-1 text-2xs text-info-fg">
                <CircleDot className="size-3" aria-hidden />
                {t('conversationTable.open')}
              </span>
            ) : null}
          </div>
        </div>
      ),
    },
    {
      key: 'employee',
      header: t('conversationTable.employee'),
      hideBelow: 'md',
      cell: (row) =>
        row.employee_name ? (
          <span className="truncate text-fg-muted">{row.employee_name}</span>
        ) : (
          <Tooltip content={t('conversationTable.unassignedHint')}>
            <span className="cursor-help text-warning-fg">
              {t('conversationTable.unassigned')}
            </span>
          </Tooltip>
        ),
    },
    {
      key: 'score',
      header: t('conversationTable.score'),
      numeric: true,
      cell: (row) => (
        <span className="inline-flex items-center gap-1.5">
          {row.needs_review ? (
            <Tooltip content={t('conversationTable.needsReviewHint')}>
              <AlertTriangle
                className="size-3.5 cursor-help text-warning"
                aria-label={t('conversationFilters.needsReview')}
              />
            </Tooltip>
          ) : null}
          <ScoreValue score={row.score} />
        </span>
      ),
    },
    {
      key: 'outcome',
      header: t('conversationTable.outcome'),
      cell: (row) => <OutcomeBadge outcome={row.outcome} />,
    },
    {
      key: 'sentiment',
      header: t('conversationTable.sentiment'),
      hideBelow: 'lg',
      cell: (row) => <SentimentBadge sentiment={row.customer_sentiment} />,
    },
    {
      key: 'first_response',
      header: t('conversationTable.firstResponse'),
      numeric: true,
      hideBelow: 'xl',
      cell: (row) => (
        <span className="text-fg-muted">
          {formatDuration(row.first_response_seconds)}
        </span>
      ),
    },
    {
      key: 'closed_at',
      header: t('conversationTable.closedAt'),
      hideBelow: 'sm',
      cell: (row) => (
        <span className="whitespace-nowrap text-fg-muted">
          {row.closed_at ? formatDateTime(row.closed_at) : DASH}
        </span>
      ),
    },
  ]
}
