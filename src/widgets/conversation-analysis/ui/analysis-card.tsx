import { Sparkles } from 'lucide-react'

import type { ConversationDetail } from '@/entities/conversation'
import { useTranslation } from '@/shared/i18n'
import { formatDateTime } from '@/shared/lib'
import { EmptyState } from '@/shared/ui/feedback/states'
import { Badge } from '@/shared/ui/primitives/badge'
import { Card, CardBody, CardHeader } from '@/shared/ui/primitives/card'
import { Tooltip } from '@/shared/ui/primitives/tooltip'

import { AnalysisDetails } from './analysis-details'
import { AnalysisEvidence } from './analysis-evidence'
import { EffectiveSummary } from './effective-summary'
import { SubScores } from './sub-scores'

/**
 * The AI analysis panel.
 *
 * The WHOLE panel is guarded on `analysis !== null`: legacy (backfilled)
 * conversations are never auto-scored and always carry a `null` analysis
 * (docs/03).
 */
export function AnalysisCard({ detail }: { detail: ConversationDetail }) {
  const { t } = useTranslation()
  const analysis = detail.analysis

  return (
    <Card>
      <CardHeader
        title={t('analysis.title')}
        description={
          analysis
            ? t(
                analysis.stage === 'batch'
                  ? 'analysisStage.batch'
                  : 'analysisStage.realtime',
              )
            : undefined
        }
        actions={
          analysis ? (
            <Tooltip
              content={t('analysis.modelHint', {
                model: analysis.model,
                date: formatDateTime(analysis.created_at),
              })}
            >
              <Badge tone="outline" size="sm" icon={<Sparkles />}>
                {analysis.model}
              </Badge>
            </Tooltip>
          ) : null
        }
      />

      <CardBody>
        {analysis === null ? (
          <EmptyState
            title={
              detail.is_legacy
                ? t('analysis.legacy.title')
                : t('analysis.missing.title')
            }
            description={
              detail.is_legacy
                ? t('analysis.legacy.description')
                : t('analysis.missing.description')
            }
            compact
          />
        ) : (
          <div className="space-y-6">
            <EffectiveSummary detail={detail} />
            <AnalysisEvidence analysis={analysis} />
            <SubScores analysis={analysis} />
            <AnalysisDetails analysis={analysis} />
          </div>
        )}
      </CardBody>
    </Card>
  )
}
