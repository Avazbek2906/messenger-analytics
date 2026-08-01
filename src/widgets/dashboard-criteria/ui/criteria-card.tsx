import {
  CriteriaList,
  CriteriaRadar,
  useCriteria,
  type CriteriaSummary,
} from '@/entities/dashboard'
import type { PeriodParams } from '@/shared/api'
import { useTranslation } from '@/shared/i18n'
import { formatNumber } from '@/shared/lib'
import { QueryBoundary } from '@/shared/ui/feedback/query-boundary'
import { EmptyState } from '@/shared/ui/feedback/states'
import { Card, CardBody, CardHeader } from '@/shared/ui/primitives/card'
import { Skeleton } from '@/shared/ui/primitives/skeleton'
import { Tooltip } from '@/shared/ui/primitives/tooltip'

/**
 * The company's rubric profile.
 *
 * `samples` covers BATCH-analysed conversations only (the Flash pass emits no
 * sub-scores), so it is normal for it to sit well below `overview.scored` — the
 * header says so explicitly (docs/05 §6).
 */
export function CriteriaCard({ period }: { period: PeriodParams }) {
  const { t } = useTranslation()
  const query = useCriteria(period)

  return (
    <Card className="h-full">
      <CardHeader
        title={t('criteria.title')}
        description={t('criteria.description')}
        actions={query.data ? <SamplesBadge data={query.data} /> : null}
      />

      <CardBody>
        <QueryBoundary
          query={query}
          loading={
            <div className="space-y-4">
              <Skeleton className="h-64 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
            </div>
          }
          isEmpty={(data: CriteriaSummary) =>
            data.criteria.every((item) => item.avg_score === null)
          }
          empty={
            <EmptyState
              title={t('criteria.empty.title')}
              description={t('criteria.empty.description')}
            />
          }
        >
          {(data) => (
            <div className="space-y-6">
              <CriteriaRadar criteria={data.criteria} />

              <div className="grid gap-6 border-t border-line pt-5 sm:grid-cols-2">
                <CriteriaList
                  title={t('criteria.strengths')}
                  variant="strengths"
                  items={data.strengths}
                />
                <CriteriaList
                  title={t('criteria.weaknesses')}
                  variant="weaknesses"
                  items={data.weaknesses}
                />
              </div>
            </div>
          )}
        </QueryBoundary>
      </CardBody>
    </Card>
  )
}

function SamplesBadge({ data }: { data: CriteriaSummary }) {
  const { t } = useTranslation()
  const samples = data.criteria[0]?.samples ?? 0
  if (!samples) return null

  return (
    <Tooltip content={t('criteria.samplesHint')}>
      <span className="cursor-help text-xs whitespace-nowrap text-fg-subtle">
        {t('criteria.samples', { count: formatNumber(samples) })}
      </span>
    </Tooltip>
  )
}
