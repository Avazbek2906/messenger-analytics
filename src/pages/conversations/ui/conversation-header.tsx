import { ArrowLeft, PenLine, UserPlus } from 'lucide-react'
import { Link } from 'react-router-dom'

import { ROUTES } from '@/app/router/routes'
import {
  AttributionBadge,
  ChannelIcon,
  SentimentBadge,
  type ConversationDetail,
} from '@/entities/conversation'
import { useSession } from '@/entities/session'
import { useTranslation } from '@/shared/i18n'
import { formatDateTime, formatDuration, orDash } from '@/shared/lib'
import { Badge } from '@/shared/ui/primitives/badge'
import { Button } from '@/shared/ui/primitives/button'
import { PageHeader } from '@/shared/ui/layout/page-header'

interface HeaderProps {
  detail: ConversationDetail
  onAssign: () => void
  onOverride: () => void
}

/**
 * Conversation header.
 *
 * The correction controls are shown to manager roles ONLY — the backend answers
 * 403 for anyone else, so offering a button and then failing would be pointless
 * (docs/03).
 */
export function ConversationHeader({
  detail,
  onAssign,
  onOverride,
}: HeaderProps) {
  const { t } = useTranslation()
  const session = useSession()

  return (
    <PageHeader
      eyebrow={
        <Link
          to={ROUTES.conversations}
          className="mb-1 inline-flex items-center gap-1.5 text-[13px] text-fg-muted transition-colors hover:text-fg"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          {t('conversation.backToList')}
        </Link>
      }
      title={orDash(detail.customer_name)}
      description={
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-1">
          <ChannelIcon channel={detail.channel} />
          <span>
            {t('conversation.employee')}: {orDash(detail.employee_name)}
          </span>
          <AttributionBadge source={detail.attribution_source} />
          {detail.is_legacy ? (
            <Badge tone="outline" size="sm">
              {t('conversation.legacy')}
            </Badge>
          ) : null}
          <SentimentBadge sentiment={detail.customer_sentiment} />
        </span>
      }
      actions={
        session.canWrite ? (
          <>
            <Button size="sm" icon={<UserPlus />} onClick={onAssign}>
              {t('assign.action')}
            </Button>
            <Button
              size="sm"
              variant="primary"
              icon={<PenLine />}
              onClick={onOverride}
              disabled={detail.analysis === null}
            >
              {t('override.action')}
            </Button>
          </>
        ) : null
      }
    >
      <dl className="flex flex-wrap gap-x-5 gap-y-1 pt-2 text-xs text-fg-subtle">
        <Metric
          label={t('conversation.startedAt')}
          value={formatDateTime(detail.started_at)}
        />
        <Metric
          label={t('conversation.closedAt')}
          value={
            detail.closed_at
              ? formatDateTime(detail.closed_at)
              : t('conversationTable.open')
          }
        />
        <Metric
          label={t('kpi.firstResponse')}
          value={formatDuration(detail.first_response_seconds)}
        />
        <Metric
          label={t('conversation.avgResponse')}
          value={formatDuration(detail.avg_response_seconds)}
        />
      </dl>
    </PageHeader>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <dt>{label}:</dt>
      <dd className="tabular font-medium text-fg-muted">{value}</dd>
    </div>
  )
}
