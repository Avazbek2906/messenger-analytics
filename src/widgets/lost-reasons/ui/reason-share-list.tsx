import { Link } from 'react-router-dom'

import { ROUTES } from '@/app/router/routes'
import type { LostReason } from '@/entities/dashboard'
import { useTranslation } from '@/shared/i18n'
import { formatNumber, formatPercent } from '@/shared/lib'
import { CHART_COLORS } from '@/shared/ui/charts/chart-theme'
import { Tooltip } from '@/shared/ui/primitives/tooltip'

/**
 * Reason shares as a horizontal bar list.
 *
 * A bar list beats a pie here: there are usually more than five reasons, and
 * exact comparison matters more than the visual proportion (docs: `no-pie-overuse`).
 * Both counts are shown because they answer different questions — conversations
 * count chats, customers count people.
 */
export function ReasonShareList({ reasons }: { reasons: LostReason[] }) {
  const { t } = useTranslation()

  return (
    <ul className="space-y-3">
      {reasons.map((reason, index) => (
        <li key={reason.reason} className="space-y-1.5">
          <div className="flex items-baseline justify-between gap-3">
            <Link
              to={`${ROUTES.conversations}?reason=${reason.reason}`}
              className="min-w-0 truncate text-[13px] text-fg hover:text-primary hover:underline"
            >
              {reason.label}
            </Link>

            <span className="flex shrink-0 items-baseline gap-2">
              <Tooltip content={t('reasons.customersHint')}>
                <span className="tabular cursor-help text-2xs text-fg-subtle">
                  {formatNumber(reason.customers)}
                </span>
              </Tooltip>
              <span className="tabular text-[13px] font-semibold text-fg">
                {formatPercent(reason.share)}
              </span>
            </span>
          </div>

          <div className="h-1.5 overflow-hidden rounded-full bg-surface-sunken">
            <div
              className="h-full rounded-full transition-[width] duration-(--duration-slow) ease-(--ease-out-soft)"
              style={{
                width: `${Math.max(reason.share ?? 0, 1.5)}%`,
                backgroundColor:
                  CHART_COLORS[index % CHART_COLORS.length] ?? CHART_COLORS[0],
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}
