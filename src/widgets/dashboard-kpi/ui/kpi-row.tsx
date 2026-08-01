import {
  Frown,
  Handshake,
  MessagesSquare,
  Target,
  Timer,
  TrendingUp,
} from 'lucide-react'

import { DeltaBadge, type Overview } from '@/entities/dashboard'
import { useTranslation } from '@/shared/i18n'
import {
  formatDuration,
  formatNumber,
  formatPercent,
  formatScore,
} from '@/shared/lib'
import { StatCard } from '@/shared/ui/layout/stat-card'

/**
 * The KPI row — the first thing the dashboard shows.
 *
 * Each card renders its delta in the right unit: counts move in percent,
 * 0–100 scales move in points (docs/05).
 */
export function KpiRow({ overview }: { overview: Overview }) {
  const { t } = useTranslation()
  const { deltas, agreements } = overview

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      <StatCard
        label={t('kpi.conversations')}
        icon={MessagesSquare}
        tone="brand"
        value={formatNumber(overview.conversations)}
        caption={t('kpi.conversations.caption', {
          count: formatNumber(overview.scored),
        })}
        badge={
          <DeltaBadge value={deltas.conversations_percent} unit="percent" />
        }
        hint={t('kpi.conversations.hint')}
      />

      <StatCard
        label={t('kpi.avgScore')}
        icon={TrendingUp}
        tone="success"
        value={formatScore(overview.avg_score)}
        unit={overview.avg_score === null ? undefined : t('common.outOf100')}
        caption={
          overview.scoring_coverage === null
            ? t('kpi.avgScore.coverageUnknown')
            : t('kpi.avgScore.coverage', {
                percent: formatPercent(overview.scoring_coverage),
              })
        }
        badge={<DeltaBadge value={deltas.avg_score_points} unit="points" />}
        hint={t('kpi.avgScore.hint')}
      />

      <StatCard
        label={t('kpi.conversion')}
        icon={Target}
        tone="brand"
        value={formatPercent(overview.conversion_rate)}
        caption={t('kpi.conversion.caption', {
          sold: formatNumber(overview.sold),
          notSold: formatNumber(overview.not_sold),
        })}
        badge={
          <DeltaBadge value={deltas.conversion_rate_points} unit="points" />
        }
        hint={t('kpi.conversion.hint')}
      />

      <StatCard
        label={t('kpi.firstResponse')}
        icon={Timer}
        tone="warning"
        value={formatDuration(overview.avg_first_response_seconds)}
        caption={t('kpi.firstResponse.caption')}
        badge={
          <DeltaBadge
            value={deltas.first_response_percent}
            unit="percent"
            lowerIsBetter
          />
        }
        hint={t('kpi.firstResponse.hint')}
      />

      <StatCard
        label={t('kpi.angry')}
        icon={Frown}
        tone="danger"
        value={formatNumber(overview.angry_customers)}
        caption={
          overview.unassigned > 0
            ? t('kpi.angry.unassigned', {
                count: formatNumber(overview.unassigned),
              })
            : t('kpi.angry.allAssigned')
        }
        hint={t('kpi.angry.hint')}
      />

      <StatCard
        label={t('kpi.agreements')}
        icon={Handshake}
        tone="neutral"
        value={formatNumber(agreements.taken)}
        caption={t('kpi.agreements.caption', {
          fulfilled: formatNumber(agreements.fulfilled),
          forgotten: formatNumber(agreements.forgotten),
        })}
        hint={t('kpi.agreements.hint')}
      />
    </div>
  )
}
