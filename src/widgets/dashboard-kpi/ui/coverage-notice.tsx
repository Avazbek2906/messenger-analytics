import { Info } from 'lucide-react'

import type { Overview } from '@/entities/dashboard'
import { useTranslation } from '@/shared/i18n'
import { formatNumber, formatPercent } from '@/shared/lib'

/**
 * Qamrov ogohlantirishi.
 *
 * Three distinct empty states must never be collapsed into one (docs/05
 * "Empty states"). This component covers the second: conversations exist but
 * none are scored — that calls for an explanation, not an empty chart.
 */
export function CoverageNotice({ overview }: { overview: Overview }) {
  const { t } = useTranslation()

  if (overview.conversations === 0) return null

  const nothingScored = overview.scored === 0
  const lowCoverage =
    !nothingScored &&
    overview.scoring_coverage !== null &&
    overview.scoring_coverage < 70

  if (!nothingScored && !lowCoverage) return null

  return (
    <div className="flex items-start gap-2.5 rounded-lg bg-info-soft px-4 py-3 text-[13px] leading-5 text-info-fg">
      <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
      <p>
        {nothingScored
          ? t('coverage.none', {
              count: formatNumber(overview.conversations),
            })
          : t('coverage.partial', {
              percent: formatPercent(overview.scoring_coverage),
              pending: formatNumber(overview.unscored),
            })}
      </p>
    </div>
  )
}
