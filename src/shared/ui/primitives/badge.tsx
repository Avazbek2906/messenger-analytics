import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'

import { cn } from '@/shared/lib'

/**
 * Chip / badge — the soft-tinted, fully rounded labels from the reference.
 *
 * A11y: colour must never carry meaning on its own (WCAG 1.4.1), so status
 * badges always ship with text (and an icon where it helps).
 */
const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap [&_svg]:size-3.5 [&_svg]:shrink-0',
  {
    variants: {
      tone: {
        neutral: 'bg-neutral-soft text-neutral-fg',
        brand: 'bg-primary-soft text-primary',
        success: 'bg-success-soft text-success-fg',
        warning: 'bg-warning-soft text-warning-fg',
        danger: 'bg-danger-soft text-danger-fg',
        info: 'bg-info-soft text-info-fg',
        outline: 'text-fg-muted ring-line bg-transparent ring-1 ring-inset',
      },
      size: {
        sm: 'h-5 px-2 text-2xs',
        md: 'h-6 px-2.5 text-xs',
        lg: 'h-7 px-3 text-[13px]',
      },
    },
    defaultVariants: { tone: 'neutral', size: 'md' },
  },
)

export type BadgeTone = NonNullable<VariantProps<typeof badgeVariants>['tone']>

export interface BadgeProps
  extends ComponentPropsWithoutRef<'span'>, VariantProps<typeof badgeVariants> {
  icon?: ReactNode
}

export function Badge({
  className,
  tone,
  size,
  icon,
  children,
  ...props
}: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ tone, size }), className)} {...props}>
      {icon}
      {children}
    </span>
  )
}

/** A bare colour dot — saves space in dense table rows. */
export function Dot({ tone = 'neutral' }: { tone?: BadgeTone }) {
  const colors: Record<BadgeTone, string> = {
    neutral: 'bg-fg-subtle',
    brand: 'bg-primary',
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-danger',
    info: 'bg-info',
    outline: 'bg-line-strong',
  }
  return (
    <span
      aria-hidden
      className={cn('size-2 shrink-0 rounded-full', colors[tone])}
    />
  )
}
