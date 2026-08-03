import { AlertTriangle, CircleDot } from 'lucide-react'

import {
  attributionGap,
  attributionGapHintKey,
  ChannelIcon,
  OutcomeBadge,
  ScoreValue,
  SentimentBadge,
  type Conversation,
} from '@/entities/conversation'
import type { AttributionMode } from '@/entities/session'
import type { TranslateFn } from '@/shared/i18n'
import { DASH, formatDateTime, formatDuration, orDash } from '@/shared/lib'
import type { Column } from '@/shared/ui/data/data-table'
import { Tooltip } from '@/shared/ui/primitives/tooltip'

/**
 * The table columns.
 *
 * Kept in its own file: the column list is long and evolves independently of
 * the table composition.
 *
 * `attributionMode` is company-level and only affects the wording of the
 * unassigned hint — under mode 3 an empty `attribution_source` on a
 * conversation somebody replied to means the extension was off, which is a
 * different problem from "no rule matched" (CHANGELOG §4).
 */
export function buildConversationColumns(
  t: TranslateFn,
  attributionMode: AttributionMode | undefined,
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
      cell: (row) => {
        if (row.employee_name) {
          return (
            <span className="truncate text-fg-muted">{row.employee_name}</span>
          )
        }
        const gap = attributionGap(row, attributionMode)
        return (
          <Tooltip content={t(attributionGapHintKey(gap))}>
            <span className="cursor-help text-warning-fg">
              {t(
                gap === 'extension_silent'
                  ? 'conversationTable.extensionSilent'
                  : 'conversationTable.unassigned',
              )}
            </span>
          </Tooltip>
        )
      },
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
