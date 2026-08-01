import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/shared/lib'
import { Tooltip } from '@/shared/ui/primitives/tooltip'

interface StatCardProps {
  label: string
  /** The headline value. `null` must already have been rendered as `—`. */
  value: ReactNode
  /** Small unit next to the value: `%`, `/ 100`, seconds. */
  unit?: string
  /** Context under the value: coverage, comparison, a note. */
  caption?: ReactNode
  /** Top right — usually a `DeltaBadge`. */
  badge?: ReactNode
  icon?: LucideIcon
  tone?: 'neutral' | 'brand' | 'success' | 'warning' | 'danger'
  /** Tooltip on the label — explains what the number actually counts. */
  hint?: ReactNode
  className?: string
}

const ICON_TONES = {
  neutral: 'bg-surface-sunken text-fg-muted',
  brand: 'bg-primary-soft text-primary',
  success: 'bg-success-soft text-success-fg',
  warning: 'bg-warning-soft text-warning-fg',
  danger: 'bg-danger-soft text-danger-fg',
} as const

/**
 * KPI card — the building block of the dashboard header row.
 *
 * It lives in one place because the same shape repeats on the dashboard, the
 * team page and the employee card.
 */
export function StatCard({
  label,
  value,
  unit,
  caption,
  badge,
  icon: Icon,
  tone = 'neutral',
  hint,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl bg-surface p-5 shadow-card ring-1 ring-line ring-inset',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          {Icon ? (
            <span
              aria-hidden
              className={cn(
                'flex size-9 shrink-0 items-center justify-center rounded-lg',
                ICON_TONES[tone],
              )}
            >
              <Icon className="size-[18px]" />
            </span>
          ) : null}
          <span className="truncate text-[13px] font-medium text-fg-muted">
            {hint ? (
              <Tooltip content={hint}>
                <span className="cursor-help underline decoration-line-strong decoration-dotted underline-offset-4">
                  {label}
                </span>
              </Tooltip>
            ) : (
              label
            )}
          </span>
        </div>
        {badge}
      </div>

      <p className="mt-4 flex items-baseline gap-1">
        <span className="tabular text-2xl leading-8 font-semibold tracking-tight text-fg">
          {value}
        </span>
        {unit ? (
          <span className="text-sm font-medium text-fg-muted">{unit}</span>
        ) : null}
      </p>

      {caption ? (
        <p className="mt-1 text-xs leading-5 text-fg-subtle">{caption}</p>
      ) : null}
    </div>
  )
}
