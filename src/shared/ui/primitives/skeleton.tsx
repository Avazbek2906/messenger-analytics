import type { ComponentPropsWithoutRef } from 'react'

import { cn } from '@/shared/lib'

/**
 * Skeleton — for loads longer than 300 ms.
 * Preferred over a spinner: the layout does not shift (CLS ≈ 0) and the wait
 * feels shorter.
 */
export function Skeleton({
  className,
  ...props
}: ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      aria-hidden
      className={cn('animate-pulse rounded-md bg-surface-sunken', className)}
      {...props}
    />
  )
}

/** Ready-made skeleton for lines of text. */
export function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number
  className?: string
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton
          key={index}
          className="h-3.5"
          style={{ width: index === lines - 1 ? '60%' : '100%' }}
        />
      ))}
    </div>
  )
}
