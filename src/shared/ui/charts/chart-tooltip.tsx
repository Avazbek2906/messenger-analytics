import type { ReactNode } from 'react'

import { cn } from '@/shared/lib'

export interface TooltipRow {
  key: string
  label: string
  value: ReactNode
  color?: string
}

interface ChartTooltipProps {
  title: ReactNode
  rows: TooltipRow[]
  footer?: ReactNode
  className?: string
}

/**
 * One tooltip for every chart.
 *
 * Replaces the Recharts default: it matches the design system, renders `null`
 * as `—`, and leaves formatting to the caller.
 */
export function ChartTooltip({
  title,
  rows,
  footer,
  className,
}: ChartTooltipProps) {
  return (
    <div
      className={cn(
        'min-w-40 rounded-lg bg-surface px-3 py-2.5 shadow-popover ring-1 ring-line',
        className,
      )}
    >
      <p className="mb-2 text-xs font-medium text-fg">{title}</p>

      <ul className="space-y-1.5">
        {rows.map((row) => (
          <li key={row.key} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-xs text-fg-muted">
              {row.color ? (
                <span
                  aria-hidden
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: row.color }}
                />
              ) : null}
              {row.label}
            </span>
            <span className="tabular text-xs font-medium text-fg">
              {row.value}
            </span>
          </li>
        ))}
      </ul>

      {footer ? (
        <p className="mt-2 border-t border-line pt-2 text-2xs text-fg-subtle">
          {footer}
        </p>
      ) : null}
    </div>
  )
}
