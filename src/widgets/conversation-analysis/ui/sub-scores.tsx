import type { AnalysisResult } from '@/entities/conversation'
import { useTranslation } from '@/shared/i18n'
import { formatScore } from '@/shared/lib'
import { SCORE_BAND_COLORS, scoreBand } from '@/shared/ui/charts/chart-theme'

/**
 * Rubric sub-scores.
 *
 * `sub_scores` is a free-form JSON object whose keys depend on the prompt
 * version, so it is rendered generically — no key is hard-coded (docs/03). When
 * no translation exists, the raw key is shown.
 */
export function SubScores({ analysis }: { analysis: AnalysisResult }) {
  const { t, tDynamic } = useTranslation()
  const entries = Object.entries(analysis.sub_scores ?? {})

  if (entries.length === 0) return null

  return (
    <section>
      <h3 className="mb-3 text-xs font-medium tracking-wide text-fg-muted uppercase">
        {t('conversation.subScores')}
      </h3>

      <ul className="space-y-2.5">
        {entries.map(([key, value]) => {
          const band = scoreBand(value)
          return (
            <li key={key} className="space-y-1">
              <div className="flex items-baseline justify-between gap-3">
                <span className="truncate text-[13px] text-fg">
                  {tDynamic(`criterion.${key}`, key)}
                </span>
                <span className="tabular shrink-0 text-[13px] font-semibold text-fg">
                  {formatScore(value)}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-surface-sunken">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.max(Math.min(value, 100), 2)}%`,
                    backgroundColor: band
                      ? SCORE_BAND_COLORS[band]
                      : 'var(--color-line-strong)',
                  }}
                />
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
