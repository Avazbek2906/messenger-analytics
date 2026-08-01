import { useTranslation } from '@/shared/i18n'
import { cn } from '@/shared/lib'
import { Tooltip } from '@/shared/ui/primitives/tooltip'

/** The medal colours stop at three — below that it is a plain position. */
const MEDALS: Record<number, string> = {
  1: 'bg-warning-soft text-warning-fg ring-warning/30',
  2: 'bg-neutral-soft text-neutral-fg ring-line-strong',
  3: 'bg-danger-soft text-danger-fg ring-danger/25',
}

/**
 * League position.
 *
 * Below 5 scored conversations the backend sends `rank: null`, and such a row
 * must NEVER get a medal — an 88.0 average on 3 conversations is not first
 * place (docs/05 §6).
 */
export function RankBadge({
  rank,
  isRanked,
}: {
  rank: number | null
  isRanked: boolean
}) {
  const { t } = useTranslation()

  if (!isRanked || rank === null) {
    return (
      <Tooltip content={t('team.unrankedHint')}>
        <span className="cursor-help text-xs text-fg-subtle">—</span>
      </Tooltip>
    )
  }

  return (
    <span
      className={cn(
        'tabular inline-flex size-7 items-center justify-center rounded-full text-xs font-semibold ring-1 ring-inset',
        MEDALS[rank] ?? 'bg-surface-sunken text-fg-muted ring-line',
      )}
    >
      {rank}
    </span>
  )
}
