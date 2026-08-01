import { History, XCircle } from 'lucide-react'

import {
  isBackfillActive,
  useBackfillJobs,
  useCancelBackfill,
  useStartBackfill,
  type BackfillJob,
  type BackfillScope,
} from '@/entities/integration'
import { useSession } from '@/entities/session'
import type { UUID } from '@/shared/api'
import { useTranslation, type MessageKey } from '@/shared/i18n'
import { formatDateTime, formatNumber } from '@/shared/lib'
import { Badge, type BadgeTone } from '@/shared/ui/primitives/badge'
import { Button } from '@/shared/ui/primitives/button'
import { CardInset } from '@/shared/ui/primitives/card'

const TIERS: BackfillScope[] = ['tier_b', 'tier_c']

const STATUS_TONES: Record<BackfillJob['status'], BadgeTone> = {
  pending: 'info',
  running: 'info',
  completed: 'success',
  cancelled: 'neutral',
  error: 'danger',
}

/**
 * History (backfill) jobs for one Telegram account.
 *
 * The runner reports a running count, not a percentage: `progress_pct` stays
 * `0` until completion, so `fetched_messages` is shown instead of a progress
 * bar that would sit frozen at zero. Only one job may be active at a time,
 * which is why Cancel is the documented way to unblock a stuck one (docs/07).
 */
export function BackfillPanel({ accountId }: { accountId: UUID }) {
  const { t } = useTranslation()
  const session = useSession()

  const jobs = useBackfillJobs(accountId)
  const start = useStartBackfill(accountId)
  const cancel = useCancelBackfill(accountId)

  const latest = jobs.data?.[0]
  const active = isBackfillActive(latest)

  return (
    <CardInset className="space-y-3 p-3.5">
      <div className="flex flex-wrap items-center gap-2">
        <History className="size-4 text-fg-subtle" aria-hidden />
        <span className="flex-1 text-[13px] font-medium text-fg">
          {t('backfill.title')}
        </span>

        {session.canWrite ? (
          active ? (
            <Button
              size="sm"
              variant="ghost"
              icon={<XCircle />}
              loading={cancel.isPending}
              onClick={() => cancel.mutate()}
            >
              {t('backfill.cancel')}
            </Button>
          ) : (
            TIERS.map((scope) => (
              <Button
                key={scope}
                size="sm"
                loading={start.isPending}
                onClick={() => start.mutate(scope)}
              >
                {t(`backfillScope.${scope}` as MessageKey)}
              </Button>
            ))
          )
        ) : null}
      </div>

      <p className="text-2xs leading-5 text-fg-subtle">
        {t('backfill.description')}
      </p>

      {jobs.data && jobs.data.length > 0 ? (
        <ul className="space-y-1.5">
          {jobs.data.slice(0, 4).map((job) => (
            <li
              key={job.id}
              className="flex flex-wrap items-center gap-2 text-2xs"
            >
              <Badge tone={STATUS_TONES[job.status]} size="sm">
                {t(`backfillStatus.${job.status}` as MessageKey)}
              </Badge>
              <span className="text-fg-muted">
                {t(`backfillScope.${job.scope}` as MessageKey)}
              </span>
              <span className="tabular text-fg-muted">
                {t('backfill.fetched', {
                  count: formatNumber(job.fetched_messages),
                })}
              </span>
              <span className="ml-auto text-fg-subtle">
                {formatDateTime(job.created_at)}
              </span>
              {job.error ? (
                <span className="w-full text-danger-fg">{job.error}</span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </CardInset>
  )
}
