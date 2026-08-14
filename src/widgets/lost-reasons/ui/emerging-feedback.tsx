import { Sparkles } from 'lucide-react'

import type { EmergingFeedback as Theme } from '@/entities/dashboard'
import { useTranslation } from '@/shared/i18n'
import { formatNumber } from '@/shared/lib'

/**
 * Clustered free-text themes behind the "other" reason.
 *
 * This is a DISCOVERY list, not a statistic — the clustering is approximate, so
 * no percentage is shown and the heading says as much (docs/05).
 *
 * Rendered as rows rather than chips because the model writes SENTENCES here,
 * not labels: they run past a hundred characters, which is the length at which
 * a pill stops being a pill.
 */
export function EmergingFeedback({ themes }: { themes: Theme[] }) {
  const { t } = useTranslation()

  if (themes.length === 0) return null

  return (
    <section className="border-t border-line pt-5">
      <h3 className="mb-3 flex items-center gap-1.5 text-xs font-medium tracking-wide text-fg-muted uppercase">
        <Sparkles className="size-3.5 text-accent" aria-hidden />
        {t('reasons.emerging')}
      </h3>
      <p className="mb-3 text-xs leading-5 text-fg-subtle">
        {t('reasons.emergingHint')}
      </p>

      <ul className="space-y-1.5">
        {themes.map((theme) => (
          <li
            key={theme.text}
            className="flex items-start gap-3 rounded-lg bg-surface-sunken px-3 py-2"
          >
            <p className="min-w-0 flex-1 text-[13px] leading-5 text-fg-muted">
              {theme.text}
            </p>
            <span className="tabular shrink-0 text-[13px] font-semibold text-fg">
              {formatNumber(theme.count)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
