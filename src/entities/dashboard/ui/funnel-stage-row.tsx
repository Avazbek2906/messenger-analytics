import { funnelStageLabelKey } from '../model/labels'
import type { FunnelStage } from '../model/types'
import { useTranslation } from '@/shared/i18n'
import { formatNumber, formatPercent } from '@/shared/lib'
import { Tooltip } from '@/shared/ui/primitives/tooltip'

import { FUNNEL_SEGMENTS } from './funnel-segments'

/**
 * One stage of the script funnel.
 *
 * The percentages are shares of `analyzed`, not of `reached`, which is why they
 * form a single full bar summing to ~100 (docs/05).
 */
export function FunnelStageRow({ stage }: { stage: FunnelStage }) {
  const { t } = useTranslation()

  const percents = {
    success: stage.success_percent,
    neutral: stage.neutral_percent,
    drop_off: stage.drop_off_percent,
    not_reached: stage.not_reached_percent,
  }

  return (
    <li className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[13px] font-medium text-fg">
          {t(funnelStageLabelKey(stage.stage))}
        </span>
        <span className="tabular text-xs text-fg-muted">
          {t('funnel.summary', {
            success: formatPercent(stage.success_percent),
          })}{' '}
          ·{' '}
          <span className="font-medium text-danger-fg">
            {t('funnel.summaryDrop', {
              percent: formatPercent(stage.drop_off_percent),
            })}
          </span>
        </span>
      </div>

      <div
        className="flex h-2.5 overflow-hidden rounded-full bg-surface-sunken"
        role="img"
        aria-label={FUNNEL_SEGMENTS.map(
          (segment) =>
            `${t(segment.labelKey)}: ${formatPercent(percents[segment.key])}`,
        ).join(', ')}
      >
        {FUNNEL_SEGMENTS.map((segment) => {
          const value = percents[segment.key]
          if (!value) return null

          return (
            <Tooltip
              key={segment.key}
              content={t('funnel.tooltip', {
                label: t(segment.labelKey),
                count: formatNumber(stage[segment.key]),
                percent: formatPercent(value),
              })}
            >
              <span
                className="h-full first:rounded-l-full last:rounded-r-full"
                style={{ width: `${value}%`, backgroundColor: segment.color }}
              />
            </Tooltip>
          )
        })}
      </div>

      {stage.drop_notes.length > 0 ? (
        <ul className="flex flex-wrap gap-1.5 pt-0.5">
          {stage.drop_notes.slice(0, 3).map((note) => (
            <li
              key={note.note}
              className="rounded-full bg-danger-soft px-2 py-0.5 text-2xs text-danger-fg"
            >
              {note.note} · {formatNumber(note.count)}
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  )
}
