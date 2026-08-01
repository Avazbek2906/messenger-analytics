import {
  FunnelLegend,
  FunnelStageRow,
  useFunnel,
  type FunnelSummary,
} from '@/entities/dashboard'
import type { PeriodParams } from '@/shared/api'
import { WidgetInsights } from '@/features/widget-insights'
import { useTranslation } from '@/shared/i18n'
import { formatNumber } from '@/shared/lib'
import { QueryBoundary } from '@/shared/ui/feedback/query-boundary'
import { EmptyState } from '@/shared/ui/feedback/states'
import { Card, CardBody, CardHeader } from '@/shared/ui/primitives/card'
import { Skeleton } from '@/shared/ui/primitives/skeleton'

/**
 * The sales-script funnel.
 *
 * When `analyzed = 0` every percentage is `null` — an explanation is shown
 * instead of drawing a funnel flattened to zero (docs/05).
 */
export function FunnelCard({ period }: { period: PeriodParams }) {
  const { t } = useTranslation()
  const query = useFunnel(period)

  return (
    <Card className="h-full">
      <CardHeader
        title={t('funnel.title')}
        description={t('funnel.description')}
        actions={
          query.data?.analyzed ? (
            <span className="text-xs whitespace-nowrap text-fg-subtle">
              {t('funnel.analyzed', {
                count: formatNumber(query.data.analyzed),
              })}
            </span>
          ) : null
        }
      />

      <CardBody>
        <WidgetInsights widget="funnel" period={period} />

        <QueryBoundary
          query={query}
          loading={
            <div className="space-y-5">
              {Array.from({ length: 6 }, (_, index) => (
                <Skeleton key={index} className="h-10 w-full" />
              ))}
            </div>
          }
          isEmpty={(data: FunnelSummary) =>
            data.analyzed === 0 || data.stages.length === 0
          }
          empty={
            <EmptyState
              title={t('funnel.empty.title')}
              description={t('funnel.empty.description')}
            />
          }
        >
          {(data) => (
            <>
              <FunnelLegend />
              <ul className="space-y-4">
                {data.stages.map((stage) => (
                  <FunnelStageRow key={stage.stage} stage={stage} />
                ))}
              </ul>
            </>
          )}
        </QueryBoundary>
      </CardBody>
    </Card>
  )
}
