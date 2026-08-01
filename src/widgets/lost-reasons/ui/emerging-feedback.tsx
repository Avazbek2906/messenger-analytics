import { Sparkles } from 'lucide-react'

import type { EmergingFeedback as Theme } from '@/entities/dashboard'
import { useTranslation } from '@/shared/i18n'
import { formatNumber } from '@/shared/lib'
import { Badge } from '@/shared/ui/primitives/badge'

/**
 * Clustered free-text themes behind the "other" reason.
 *
 * This is a DISCOVERY list, not a statistic — the clustering is approximate, so
 * no percentage is shown and the heading says as much (docs/05).
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

      <ul className="flex flex-wrap gap-1.5">
        {themes.map((theme) => (
          <li key={theme.text}>
            <Badge tone="neutral" size="lg">
              {theme.text}
              <span className="tabular ml-1 font-semibold text-fg">
                {formatNumber(theme.count)}
              </span>
            </Badge>
          </li>
        ))}
      </ul>
    </section>
  )
}
