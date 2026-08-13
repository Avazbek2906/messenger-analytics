import * as Dialog from '@radix-ui/react-dialog'

import { useAiStore } from '@/entities/insight'
import { useSession } from '@/entities/session'
import { useMediaQuery } from '@/shared/hooks/use-media-query'
import { useTranslation } from '@/shared/i18n'
import { cn } from '@/shared/lib'

import { AskChat } from './ask-chat'

/** Matches Tailwind's `lg` — the width at which a column can be given away. */
const DESKTOP = '(min-width: 64rem)'

/**
 * The Ask-AI dock.
 *
 * Two shells, one conversation. On a wide screen it is a column that SHRINKS
 * the page rather than covering it — the point is to read a chart and ask about
 * it at the same time, which an overlay would defeat. Below `lg` there is no
 * width to give away, so it becomes a sheet with a scrim, and Radix supplies
 * the focus trap, the Escape handler and the dismissal affordances a modal owes
 * the user.
 *
 * Exactly ONE of the two is mounted: the sheet's focus trap would otherwise
 * fight the docked column on desktop.
 *
 * It renders nothing at all for a user `/dashboard/ask` would answer with a 403
 * (the employee cabinet), or when the deployment has no Gemini key — the same
 * rule the per-widget insights follow.
 */
export function AskDock({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useTranslation()
  const session = useSession()
  const unavailable = useAiStore((state) => state.unavailable)
  const isDesktop = useMediaQuery(DESKTOP)

  if (unavailable || !session.canViewCompanyDashboards) return null

  if (isDesktop) {
    return (
      <aside
        aria-label={t('ask.title')}
        // Kept mounted while closed so the slide-out reads as the panel
        // leaving, not as it vanishing. `inert` keeps the hidden conversation
        // out of the tab order.
        inert={!open}
        className={cn(
          'fixed inset-y-0 right-0 z-40 w-(--spacing-ask-dock) border-l border-line',
          'transition-transform duration-(--duration-base) ease-(--ease-out-soft)',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <AskChat onClose={() => onOpenChange(false)} />
      </aside>
    )
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="data-[state=open]:animate-in data-[state=open]:fade-in-0 fixed inset-0 z-40 bg-overlay backdrop-blur-[2px]" />
        <Dialog.Content className="data-[state=open]:animate-in data-[state=open]:slide-in-from-right fixed inset-y-0 right-0 z-50 w-full max-w-sm">
          <Dialog.Title className="sr-only">{t('ask.title')}</Dialog.Title>
          <AskChat onClose={() => onOpenChange(false)} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
