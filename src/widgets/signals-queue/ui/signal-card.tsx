import { Check } from 'lucide-react'
import { Link } from 'react-router-dom'

import { ROUTES } from '@/app/router/routes'
import { useSession } from '@/entities/session'
import {
  SIGNAL_ICONS,
  SIGNAL_TONES,
  signalHintKey,
  signalLabelKey,
  type SignalBucket,
  type SignalKind,
} from '@/entities/signal'
import { useTranslation } from '@/shared/i18n'
import { cn, formatDateTime, formatNumber, orDash } from '@/shared/lib'
import { Badge } from '@/shared/ui/primitives/badge'
import { Button } from '@/shared/ui/primitives/button'
import { Tooltip } from '@/shared/ui/primitives/tooltip'

const TONE_STYLES = {
  danger: 'bg-danger-soft text-danger-fg',
  warning: 'bg-warning-soft text-warning-fg',
  info: 'bg-info-soft text-info-fg',
  neutral: 'bg-neutral-soft text-neutral-fg',
  success: 'bg-success-soft text-success-fg',
  brand: 'bg-primary-soft text-primary',
  outline: 'bg-surface-sunken text-fg-muted',
} as const

interface SignalCardProps {
  kind: SignalKind
  bucket: SignalBucket
  isResolved: (conversation: string) => boolean
  onResolve: (conversation: string) => void
  isResolving: boolean
}

/**
 * One signal type: its open count, its handled count and a preview queue.
 *
 * `count` is the real total while `items` caps at 20, so the count is never
 * derived from the list length. Resolving is idempotent, which makes the
 * optimistic removal safe (docs/06).
 */
export function SignalCard({
  kind,
  bucket,
  isResolved,
  onResolve,
  isResolving,
}: SignalCardProps) {
  const { t } = useTranslation()
  const session = useSession()

  const Icon = SIGNAL_ICONS[kind]
  const tone = SIGNAL_TONES[kind]

  // The aggregate stays cached for up to 120 s, so a just-resolved row keeps
  // coming back — reconcile against the local set instead of the refetch.
  const open = bucket.items.filter((item) => !isResolved(item.conversation))
  const openCount = Math.max(
    bucket.count - (bucket.items.length - open.length),
    0,
  )

  if (bucket.count === 0 && bucket.resolved === 0) return null

  return (
    <li className="rounded-xl bg-surface ring-1 ring-line ring-inset">
      <div className="flex items-start gap-3 px-4 pt-4 pb-3">
        <span
          aria-hidden
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-lg',
            TONE_STYLES[tone],
          )}
        >
          <Icon className="size-[18px]" />
        </span>

        <div className="min-w-0 flex-1">
          <Tooltip content={t(signalHintKey(kind))}>
            <p className="cursor-help truncate text-[13px] font-medium text-fg">
              {t(signalLabelKey(kind))}
            </p>
          </Tooltip>
          <p className="text-2xs text-fg-subtle">
            {t('signals.resolvedCount', {
              count: formatNumber(bucket.resolved),
            })}
          </p>
        </div>

        <Badge tone={openCount > 0 ? tone : 'outline'} size="lg">
          {formatNumber(openCount)}
        </Badge>
      </div>

      {open.length > 0 ? (
        <ul className="border-t border-line px-2 py-1.5">
          {open.slice(0, 5).map((item) => (
            <li key={item.conversation} className="flex items-center gap-1">
              <Link
                to={ROUTES.conversation(item.conversation)}
                className="min-w-0 flex-1 rounded-md px-2 py-1.5 transition-colors hover:bg-surface-muted"
              >
                <span className="block truncate text-[13px] text-fg">
                  {orDash(item.customer_name)}
                </span>
                <span className="block truncate text-2xs text-fg-subtle">
                  {orDash(item.employee_name)} ·{' '}
                  {formatDateTime(item.closed_at)}
                </span>
              </Link>

              {session.canWrite ? (
                <Tooltip content={t('signals.resolveHint')}>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    disabled={isResolving}
                    aria-label={t('signals.resolve')}
                    onClick={() => onResolve(item.conversation)}
                  >
                    <Check />
                  </Button>
                </Tooltip>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="border-t border-line px-4 py-3 text-2xs text-fg-subtle">
          {t('signals.allHandled')}
        </p>
      )}
    </li>
  )
}
