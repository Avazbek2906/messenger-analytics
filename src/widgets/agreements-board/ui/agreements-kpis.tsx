import { CalendarClock, CheckCircle2, Handshake, XCircle } from 'lucide-react'

import type { AgreementsSummary } from '@/entities/dashboard'
import { useTranslation } from '@/shared/i18n'
import { formatNumber, formatPercent } from '@/shared/lib'
import { StatCard } from '@/shared/ui/layout/stat-card'

/**
 * The promises board headline.
 *
 * `fulfillment_rate` excludes `pending` from its denominator, and `overdue` is
 * a subset of `pending` — both are stated in the tooltips so nobody adds the
 * numbers up incorrectly (docs/05).
 */
export function AgreementsKpis({ data }: { data: AgreementsSummary }) {
  const { t } = useTranslation()

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label={t('agreementsBoard.taken')}
        icon={Handshake}
        tone="brand"
        value={formatNumber(data.taken)}
        caption={t('agreementsBoard.pendingCaption', {
          count: formatNumber(data.pending),
        })}
        hint={t('agreementsBoard.takenHint')}
      />

      <StatCard
        label={t('agreementsBoard.fulfillmentRate')}
        icon={CheckCircle2}
        tone="success"
        value={formatPercent(data.fulfillment_rate)}
        caption={t('agreementsBoard.fulfilledCaption', {
          count: formatNumber(data.fulfilled),
        })}
        hint={t('agreementsBoard.rateHint')}
      />

      <StatCard
        label={t('agreementStatus.forgotten')}
        icon={XCircle}
        tone={data.forgotten > 0 ? 'danger' : 'neutral'}
        value={formatNumber(data.forgotten)}
        caption={t('agreementsBoard.forgottenCaption')}
        hint={t('agreementsBoard.forgottenHint')}
      />

      <StatCard
        label={t('agreementsBoard.overdue')}
        icon={CalendarClock}
        tone={data.overdue > 0 ? 'warning' : 'neutral'}
        value={formatNumber(data.overdue)}
        caption={t('agreementsBoard.overdueCaption')}
        hint={t('agreementsBoard.overdueHint')}
      />
    </div>
  )
}
