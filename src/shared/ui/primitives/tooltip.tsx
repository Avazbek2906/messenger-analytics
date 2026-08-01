import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import type { ReactNode } from 'react'

import { cn } from '@/shared/lib'

export const TooltipProvider = TooltipPrimitive.Provider

interface TooltipProps {
  content: ReactNode
  children: ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
  className?: string
}

/**
 * Tooltip.
 *
 * A11y note: a tooltip must never be the ONLY source of meaning — it adds
 * context (Radix also opens it on keyboard focus).
 */
export function Tooltip({
  content,
  children,
  side = 'top',
  className,
}: TooltipProps) {
  if (!content) return <>{children}</>

  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          sideOffset={6}
          className={cn(
            'z-50 max-w-64 rounded-md bg-tooltip px-2.5 py-1.5 text-xs leading-5 text-tooltip-fg shadow-popover',
            'data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95',
            className,
          )}
        >
          {content}
          <TooltipPrimitive.Arrow className="fill-tooltip" />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  )
}
