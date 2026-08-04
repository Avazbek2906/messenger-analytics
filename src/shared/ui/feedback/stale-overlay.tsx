import type { ReactNode } from 'react'

import { cn } from '@/shared/lib'

/**
 * Holds the previous render while the next one loads.
 *
 * Opacity only — no blur, no spinner, no layout change. The point is to say
 * "these numbers are one filter behind", not to hide them: a manager reading a
 * figure when the period changes should still be able to finish reading it.
 *
 * `aria-busy` carries the same message to a screen reader, which cannot see
 * the dimming. The transition is short and the global reduced-motion rule
 * flattens it to nothing for users who ask for that.
 */
export function StaleOverlay({
  stale,
  children,
}: {
  stale: boolean
  children: ReactNode
}) {
  if (!stale) return <>{children}</>

  return (
    <div
      aria-busy="true"
      className={cn(
        'opacity-55 transition-opacity duration-(--duration-fast)',
        // The content stays readable and selectable; only pointer feedback
        // that would act on stale rows is suppressed.
        'cursor-progress',
      )}
    >
      {children}
    </div>
  )
}
