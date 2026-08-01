import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'

import { formatNumber, formatPercent } from '@/shared/lib'

export interface DonutSlice {
  key: string
  label: string
  value: number
  color: string
  /** A hatched segment for the "not measured" remainder (reference design). */
  hatched?: boolean
}

interface OutcomeDonutProps {
  slices: DonutSlice[]
  /** Markazdagi asosiy raqam. */
  centerValue: string
  centerLabel: string
  /** Ulushlar hisoblanadigan maxraj. Berilmasa segmentlar yig'indisi olinadi. */
  total?: number
}

const HATCH_ID = 'donut-hatch'

/**
 * Donut + legend.
 *
 * Shares are given as text alongside COLOUR, so colour never carries meaning on
 * its own (WCAG 1.4.1), and the chart never exceeds five segments.
 */
export function OutcomeDonut({
  slices,
  centerValue,
  centerLabel,
  total,
}: OutcomeDonutProps) {
  const denominator =
    total ?? slices.reduce((sum, slice) => sum + slice.value, 0)
  const visible = slices.filter((slice) => slice.value > 0)

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-8">
      <div className="relative size-44 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <defs>
              <pattern
                id={HATCH_ID}
                patternUnits="userSpaceOnUse"
                width="6"
                height="6"
                patternTransform="rotate(-45)"
              >
                <rect width="6" height="6" fill="var(--color-warning-soft)" />
                <line
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="6"
                  stroke="var(--color-warning)"
                  strokeWidth="2"
                />
              </pattern>
            </defs>

            <Pie
              data={visible.length ? visible : [{ key: 'empty', value: 1 }]}
              dataKey="value"
              innerRadius="72%"
              outerRadius="100%"
              startAngle={90}
              endAngle={-270}
              paddingAngle={visible.length > 1 ? 2 : 0}
              cornerRadius={6}
              stroke="none"
              isAnimationActive={false}
            >
              {(visible.length
                ? visible
                : [{ key: 'empty' } as DonutSlice]
              ).map((slice) => (
                <Cell
                  key={slice.key}
                  fill={
                    !visible.length
                      ? 'var(--color-surface-sunken)'
                      : slice.hatched
                        ? `url(#${HATCH_ID})`
                        : slice.color
                  }
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="tabular text-2xl leading-8 font-semibold text-fg">
            {centerValue}
          </span>
          <span className="text-xs text-fg-subtle">{centerLabel}</span>
        </div>
      </div>

      <ul className="w-full space-y-3">
        {slices.map((slice) => (
          <li key={slice.key} className="flex items-center gap-3">
            <span
              aria-hidden
              className="size-2.5 shrink-0 rounded-full"
              style={
                slice.hatched
                  ? {
                      backgroundColor: 'var(--color-warning-soft)',
                      boxShadow: `inset 0 0 0 2px ${slice.color}`,
                    }
                  : { backgroundColor: slice.color }
              }
            />
            <span className="tabular w-12 shrink-0 text-sm font-semibold text-fg">
              {formatNumber(slice.value)}
            </span>
            <span className="min-w-0 flex-1 truncate text-[13px] text-fg-muted">
              {slice.label}
            </span>
            <span className="tabular text-xs text-fg-subtle">
              {denominator > 0
                ? formatPercent((slice.value / denominator) * 100)
                : '—'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
