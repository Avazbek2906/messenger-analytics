import {
  Award,
  MessagesSquare,
  Target,
  Timer,
  TrendingUp,
  TriangleAlert,
} from 'lucide-react'

import type { EmployeeCard } from '@/entities/dashboard'
import { useTranslation } from '@/shared/i18n'
import {
  DASH,
  formatDuration,
  formatNumber,
  formatPercent,
  formatScore,
} from '@/shared/lib'
import { StatCard } from '@/shared/ui/layout/stat-card'

/**
 * The employee's headline numbers.
 *
 * `handled_conversations` counts closed conversations assigned to them, while
 * `conversations` counts those that actually carry an analysis row — the gap
 * between them is the unscored tail, so both are shown together (docs/05).
 */
export function EmployeeKpis({ card }: { card: EmployeeCard }) {
  const { t } = useTranslation()

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      <StatCard
        label={t('employee.rank')}
        icon={Award}
        tone="brand"
        value={card.rank === null ? DASH : `${formatNumber(card.rank)}`}
        unit={
          card.rank === null
            ? undefined
            : t('employee.rankOf', { total: formatNumber(card.ranked_total) })
        }
        caption={card.rank === null ? t('team.unrankedHint') : undefined}
        hint={t('employee.rankHint')}
      />

      <StatCard
        label={t('kpi.avgScore')}
        icon={TrendingUp}
        tone="success"
        value={formatScore(card.avg_score)}
        unit={card.avg_score === null ? undefined : t('common.outOf100')}
        caption={t('employee.scoredOf', {
          scored: formatNumber(card.conversations),
          handled: formatNumber(card.handled_conversations),
        })}
        hint={t('employee.scoredHint')}
      />

      <StatCard
        label={t('employee.workload')}
        icon={MessagesSquare}
        tone="neutral"
        value={formatNumber(card.handled_conversations)}
        caption={t('employee.perDay', {
          value: formatNumber(card.avg_conversations_per_day),
        })}
        hint={t('employee.workloadHint')}
      />

      <StatCard
        label={t('kpi.conversion')}
        icon={Target}
        tone="brand"
        value={formatPercent(card.conversion_rate)}
        caption={t('kpi.conversion.caption', {
          sold: formatNumber(card.sold),
          notSold: formatNumber(card.not_sold),
        })}
        hint={t('kpi.conversion.hint')}
      />

      <StatCard
        label={t('kpi.firstResponse')}
        icon={Timer}
        tone="warning"
        value={formatDuration(card.avg_first_response_seconds)}
        caption={t('employee.avgResponse', {
          value: formatDuration(card.avg_response_seconds),
        })}
        hint={t('kpi.firstResponse.hint')}
      />

      <StatCard
        label={t('team.violations')}
        icon={TriangleAlert}
        tone={card.violations > 0 ? 'danger' : 'neutral'}
        value={formatNumber(card.violations)}
        caption={t('employee.agreementsCaption', {
          taken: formatNumber(card.agreements.taken),
          forgotten: formatNumber(card.agreements.forgotten),
        })}
        hint={t('team.violationsHint')}
      />
    </div>
  )
}
