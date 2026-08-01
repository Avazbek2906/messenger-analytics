import {
  CriteriaList,
  CriteriaRadar,
  FunnelLegend,
  FunnelStageRow,
  type EmployeeCard,
} from '@/entities/dashboard'
import { useTranslation } from '@/shared/i18n'
import { formatNumber } from '@/shared/lib'
import { EmptyState } from '@/shared/ui/feedback/states'
import { Card, CardBody, CardHeader } from '@/shared/ui/primitives/card'

/**
 * The employee's rubric profile and their own script funnel.
 *
 * Both come from the same nightly batch pass, so they share one empty state:
 * if the batch has not run, neither exists and drawing a zeroed chart would
 * misrepresent the data (docs/05).
 */
export function EmployeeRubric({ card }: { card: EmployeeCard }) {
  const { t } = useTranslation()
  const hasCriteria = card.criteria.some((item) => item.avg_score !== null)

  return (
    <>
      <Card className="h-full">
        <CardHeader
          title={t('criteria.title')}
          description={t('employee.rubricHint')}
        />
        <CardBody>
          {hasCriteria ? (
            <div className="space-y-6">
              <CriteriaRadar criteria={card.criteria} />
              <div className="grid gap-6 border-t border-line pt-5 sm:grid-cols-2">
                <CriteriaList
                  title={t('criteria.strengths')}
                  variant="strengths"
                  items={card.strengths}
                />
                <CriteriaList
                  title={t('criteria.weaknesses')}
                  variant="weaknesses"
                  items={card.weaknesses}
                />
              </div>
            </div>
          ) : (
            <EmptyState
              title={t('criteria.empty.title')}
              description={t('criteria.empty.description')}
              compact
            />
          )}
        </CardBody>
      </Card>

      <Card className="h-full">
        <CardHeader
          title={t('funnel.title')}
          description={t('employee.funnelHint')}
          actions={
            card.funnel.analyzed > 0 ? (
              <span className="text-xs whitespace-nowrap text-fg-subtle">
                {t('funnel.analyzed', {
                  count: formatNumber(card.funnel.analyzed),
                })}
              </span>
            ) : null
          }
        />
        <CardBody>
          {card.funnel.analyzed > 0 && card.funnel.stages.length > 0 ? (
            <>
              <FunnelLegend />
              <ul className="space-y-4">
                {card.funnel.stages.map((stage) => (
                  <FunnelStageRow key={stage.stage} stage={stage} />
                ))}
              </ul>
            </>
          ) : (
            <EmptyState
              title={t('funnel.empty.title')}
              description={t('funnel.empty.description')}
              compact
            />
          )}
        </CardBody>
      </Card>
    </>
  )
}
