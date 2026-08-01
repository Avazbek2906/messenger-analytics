import { Sparkles } from 'lucide-react'

import {
  OutcomeBadge,
  ScoreValue,
  outcomeLabelKey,
  type ConversationDetail,
} from '@/entities/conversation'
import { useTranslation } from '@/shared/i18n'
import { DASH, formatScore } from '@/shared/lib'
import { Badge } from '@/shared/ui/primitives/badge'
import { CardInset } from '@/shared/ui/primitives/card'
import { Tooltip } from '@/shared/ui/primitives/tooltip'

/**
 * Biznes ishlatadigan qiymatlar: `effective_*`.
 *
 * The raw AI value appears as a struck-through secondary line, so a manager
 * sees at a glance what was changed (docs/03).
 */
export function EffectiveSummary({ detail }: { detail: ConversationDetail }) {
  const { t } = useTranslation()
  const ai = detail.analysis

  const outcomeChanged =
    ai?.outcome != null && ai.outcome !== detail.effective_outcome
  const scoreChanged = ai?.score != null && ai.score !== detail.effective_score

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <CardInset className="p-4">
        <p className="mb-2 text-xs font-medium text-fg-muted">
          {t('conversation.outcome')}
        </p>
        <OutcomeBadge outcome={detail.effective_outcome} />
        {outcomeChanged ? (
          <p className="mt-1.5 text-2xs text-fg-subtle">
            {t('conversation.aiSaid')}{' '}
            <span className="line-through">
              {t(outcomeLabelKey(ai.outcome!))}
            </span>
          </p>
        ) : null}
      </CardInset>

      <CardInset className="p-4">
        <p className="mb-2 text-xs font-medium text-fg-muted">
          {t('conversation.score')}
        </p>
        <ScoreValue score={detail.effective_score} />
        {scoreChanged ? (
          <p className="mt-1.5 text-2xs text-fg-subtle">
            {t('conversation.aiSaid')}{' '}
            <span className="line-through">{formatScore(ai.score)}</span>
          </p>
        ) : null}
      </CardInset>

      <CardInset className="p-4">
        <p className="mb-2 text-xs font-medium text-fg-muted">
          {t('conversation.reason')}
        </p>
        {detail.effective_reason ? (
          <Badge
            tone={
              detail.effective_reason.source === 'manager' ? 'brand' : 'neutral'
            }
            size="sm"
            icon={
              detail.effective_reason.source === 'ai' ? <Sparkles /> : undefined
            }
          >
            {detail.effective_reason.label}
          </Badge>
        ) : (
          <Tooltip content={t('conversation.noReasonHint')}>
            <span className="cursor-help text-fg-subtle">{DASH}</span>
          </Tooltip>
        )}
      </CardInset>
    </div>
  )
}
