import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'

import { useTranslation } from '@/shared/i18n'
import { formatDelta, formatPoints } from '@/shared/lib'
import { Badge } from '@/shared/ui/primitives/badge'
import { Tooltip } from '@/shared/ui/primitives/tooltip'

interface DeltaBadgeProps {
  value: number | null
  /**
   * `percent` is a percentage change (`*_percent`), `points` is a point
   * difference (`*_points`). A `%` sign is NEVER appended to points (docs/05).
   */
  unit: 'percent' | 'points'
  /**
   * When `true`, a decrease counts as an improvement and the colour inverts.
   * That is the case for response time: a negative value means it got faster.
   */
  lowerIsBetter?: boolean
}

/**
 * Movement against the previous period.
 *
 * With no baseline the API returns `null`, and we render `—` rather than
 * "+100%" — a division by zero carries no meaning.
 */
export function DeltaBadge({
  value,
  unit,
  lowerIsBetter = false,
}: DeltaBadgeProps) {
  const { t } = useTranslation()
  const text = unit === 'percent' ? formatDelta(value) : formatPoints(value)

  if (value === null) {
    return (
      <Tooltip content={t('delta.noBaseline')}>
        <Badge tone="outline" size="sm" icon={<Minus />}>
          {text}
        </Badge>
      </Tooltip>
    )
  }

  const improved = lowerIsBetter ? value < 0 : value > 0
  const neutral = value === 0
  const tone = neutral ? 'neutral' : improved ? 'success' : 'danger'

  return (
    <Tooltip
      content={t(lowerIsBetter ? 'delta.comparisonLower' : 'delta.comparison')}
    >
      <Badge
        tone={tone}
        size="sm"
        icon={
          neutral ? (
            <Minus />
          ) : value > 0 ? (
            <ArrowUpRight />
          ) : (
            <ArrowDownRight />
          )
        }
      >
        {text}
      </Badge>
    </Tooltip>
  )
}
