import { useLostReasons, type ReasonsSummary } from '@/entities/dashboard'
import type { PeriodParams } from '@/shared/api'
import { WidgetInsights } from '@/features/widget-insights'
import { useTranslation } from '@/shared/i18n'
import { formatNumber } from '@/shared/lib'
import { QueryBoundary } from '@/shared/ui/feedback/query-boundary'
import { EmptyState } from '@/shared/ui/feedback/states'
import { Card, CardBody, CardHeader } from '@/shared/ui/primitives/card'
import { Skeleton } from '@/shared/ui/primitives/skeleton'
import { Tooltip } from '@/shared/ui/primitives/tooltip'

import { EmergingFeedback } from './emerging-feedback'
import { ReasonShareList } from './reason-share-list'

/**
 * Why customers did not buy.
 *
 * The header states the denominator explicitly: `lost_conversations` counts
 * only lost conversations that carry an ATTRIBUTED reason, which is normally
 * fewer than "all lost conversations" (docs/05).
 */
export function LostReasonsCard({ period }: { period: PeriodParams }) {
  const { t } = useTranslation()
  const query = useLostReasons(period)

  return (
    <Card className="h-full">
      <CardHeader
        title={t('reasons.title')}
        description={t('reasons.description')}
        actions={
          query.data ? (
            <Tooltip content={t('reasons.denominatorHint')}>
              <span className="cursor-help text-xs whitespace-nowrap text-fg-subtle">
                {t('reasons.denominator', {
                  count: formatNumber(query.data.lost_conversations),
                })}
              </span>
            </Tooltip>
          ) : null
        }
      />

      <CardBody>
        <WidgetInsights widget="reasons" period={period} />

        <QueryBoundary
          query={query}
          loading={
            <div className="space-y-3">
              {Array.from({ length: 6 }, (_, index) => (
                <Skeleton key={index} className="h-9" />
              ))}
            </div>
          }
          isEmpty={(data: ReasonsSummary) => data.reasons.length === 0}
          empty={
            <EmptyState
              title={t('reasons.empty.title')}
              description={t('reasons.empty.description')}
            />
          }
        >
          {(data) => (
            <div className="space-y-5">
              <ReasonShareList reasons={data.reasons} />
              <EmergingFeedback themes={data.emerging_feedback} />
            </div>
          )}
        </QueryBoundary>
      </CardBody>
    </Card>
  )
}
