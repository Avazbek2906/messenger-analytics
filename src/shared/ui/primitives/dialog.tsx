import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'

import { useTranslation } from '@/shared/i18n'
import { cn } from '@/shared/lib'

import { Button } from './button'

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: ReactNode
  description?: ReactNode
  children: ReactNode
  /** Action buttons in the footer. */
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const SIZES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-xl',
} as const

/**
 * Modal dialog.
 *
 * Radix handles the focus trap, `Esc` dismissal and scroll lock. The close
 * button is always present — the escape route must stay visible.
 */
export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = 'md',
}: DialogProps) {
  const { t } = useTranslation()

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="data-[state=open]:animate-in data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-overlay backdrop-blur-[2px]" />

        <DialogPrimitive.Content
          className={cn(
            'fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2',
            'rounded-2xl bg-surface shadow-popover ring-1 ring-line',
            'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
            SIZES[size],
          )}
        >
          <header className="flex items-start justify-between gap-4 px-5 pt-5 pb-4">
            <div className="min-w-0 space-y-1">
              <DialogPrimitive.Title className="text-[15px] leading-6 font-semibold text-fg">
                {title}
              </DialogPrimitive.Title>
              {description ? (
                <DialogPrimitive.Description className="text-[13px] leading-5 text-fg-muted">
                  {description}
                </DialogPrimitive.Description>
              ) : null}
            </div>

            <DialogPrimitive.Close asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={t('common.close')}
              >
                <X />
              </Button>
            </DialogPrimitive.Close>
          </header>

          <div className="scrollbar-slim max-h-[70vh] overflow-y-auto px-5 pb-5">
            {children}
          </div>

          {footer ? (
            <footer className="flex items-center justify-end gap-2 border-t border-line px-5 py-3.5">
              {footer}
            </footer>
          ) : null}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

export const DialogClose = DialogPrimitive.Close
