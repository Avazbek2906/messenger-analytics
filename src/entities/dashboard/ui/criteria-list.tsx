import { ThumbsDown, ThumbsUp } from 'lucide-react'

import { criterionHintKey, criterionLabelKey } from '../model/labels'
import type { CriterionStat } from '../model/types'
import { useTranslation } from '@/shared/i18n'
import { cn, formatScore } from '@/shared/lib'
import { SCORE_BAND_COLORS, scoreBand } from '@/shared/ui/charts/chart-theme'
import { Tooltip } from '@/shared/ui/primitives/tooltip'

interface CriteriaListProps {
  title: string
  variant: 'strengths' | 'weaknesses'
  items: CriterionStat[]
}

/**
 * The strengths / weaknesses list.
 *
 * Each row renders as a progress bar, but the score is also printed as text, so
 * the meaning survives even if colour is lost.
 */
export function CriteriaList({ title, variant, items }: CriteriaListProps) {
  const { t } = useTranslation()
  const Icon = variant === 'strengths' ? ThumbsUp : ThumbsDown

  return (
    <section>
      <h3 className="mb-3 flex items-center gap-1.5 text-xs font-medium tracking-wide text-fg-muted uppercase">
        <Icon
          className={cn(
            'size-3.5',
            variant === 'strengths' ? 'text-success' : 'text-danger',
          )}
          aria-hidden
        />
        {title}
      </h3>

      {items.length === 0 ? (
        <p className="text-[13px] text-fg-subtle">{t('criteria.notEnough')}</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <CriterionRow key={item.key} item={item} />
          ))}
        </ul>
      )}
    </section>
  )
}

function CriterionRow({ item }: { item: CriterionStat }) {
  const { t } = useTranslation()
  const band = scoreBand(item.avg_score)
  const width = item.avg_score === null ? 0 : Math.max(item.avg_score, 2)

  return (
    <li className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <Tooltip content={t(criterionHintKey(item.key))}>
          <span className="cursor-help truncate text-[13px] text-fg underline decoration-line-strong decoration-dotted underline-offset-4">
            {t(criterionLabelKey(item.key))}
          </span>
        </Tooltip>
        <span className="tabular shrink-0 text-[13px] font-semibold text-fg">
          {formatScore(item.avg_score)}
        </span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-surface-sunken">
        <div
          className="h-full rounded-full transition-[width] duration-(--duration-slow) ease-(--ease-out-soft)"
          style={{
            width: `${width}%`,
            backgroundColor: band
              ? SCORE_BAND_COLORS[band]
              : 'var(--color-line-strong)',
          }}
        />
      </div>
    </li>
  )
}
