import {
  SIGNAL_ORDER,
  useResolveSignal,
  useSignals,
  type SignalsResponse,
} from '@/entities/signal'
import type { PeriodParams } from '@/shared/api'
import { useTranslation } from '@/shared/i18n'
import { formatNumber } from '@/shared/lib'
import { QueryBoundary } from '@/shared/ui/feedback/query-boundary'
import { EmptyState } from '@/shared/ui/feedback/states'
import { Card, CardBody, CardHeader } from '@/shared/ui/primitives/card'
import { Skeleton } from '@/shared/ui/primitives/skeleton'

import { SignalCard } from './signal-card'

/**
 * The attention queue.
 *
 * Card order comes from `SIGNAL_ORDER`, a client-side product decision — the
 * API has no severity field and treats all seven kinds equally (docs/06).
 */
export function SignalsQueue({ period }: { period: PeriodParams }) {
  const { t } = useTranslation()
  const query = useSignals(period)
  const { resolve, isResolved, isPending } = useResolveSignal()

  const total = query.data
    ? SIGNAL_ORDER.reduce((sum, kind) => sum + query.data[kind].count, 0)
    : 0

  return (
    <Card>
      <CardHeader
        title={t('signals.title')}
        description={t('signals.description')}
        actions={
          query.data ? (
            <span className="text-xs whitespace-nowrap text-fg-subtle">
              {t('signals.openTotal', { count: formatNumber(total) })}
            </span>
          ) : null
        }
      />

      <CardBody>
        <QueryBoundary
          query={query}
          loading={
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }, (_, index) => (
                <Skeleton key={index} className="h-32 rounded-xl" />
              ))}
            </div>
          }
          isEmpty={(data: SignalsResponse) =>
            SIGNAL_ORDER.every(
              (kind) => data[kind].count === 0 && data[kind].resolved === 0,
            )
          }
          empty={
            <EmptyState
              title={t('signals.empty.title')}
              description={t('signals.empty.description')}
            />
          }
        >
          {(data) => (
            <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {SIGNAL_ORDER.map((kind) => (
                <SignalCard
                  key={kind}
                  kind={kind}
                  bucket={data[kind]}
                  isResolving={isPending}
                  isResolved={(conversation) => isResolved(conversation, kind)}
                  onResolve={(conversation) =>
                    resolve({ conversation, signal: kind })
                  }
                />
              ))}
            </ul>
          )}
        </QueryBoundary>
      </CardBody>
    </Card>
  )
}
