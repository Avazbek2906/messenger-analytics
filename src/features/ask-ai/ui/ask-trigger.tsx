import { Sparkles } from 'lucide-react'

import { useAiStore } from '@/entities/insight'
import { useSession } from '@/entities/session'
import { useTranslation } from '@/shared/i18n'
import { Button } from '@/shared/ui/primitives/button'

/**
 * Opens the dock.
 *
 * Lives in the topbar rather than floating over the page: a fixed bubble would
 * cover the bottom-right corner of every table on every screen, and the topbar
 * is where this app already keeps its persistent controls.
 *
 * The label is the panel's own title, so the button names what it opens rather
 * than the technology behind it. It collapses to the icon on a narrow screen,
 * where `aria-label` keeps the accessible name.
 */
export function AskTrigger({
  open,
  onToggle,
}: {
  open: boolean
  onToggle: () => void
}) {
  const { t } = useTranslation()
  const session = useSession()
  const unavailable = useAiStore((state) => state.unavailable)

  if (unavailable || !session.canViewCompanyDashboards) return null

  return (
    <Button
      variant={open ? 'soft' : 'ghost'}
      size="sm"
      icon={<Sparkles />}
      aria-expanded={open}
      aria-label={t('ask.title')}
      onClick={onToggle}
    >
      <span className="hidden sm:inline">{t('ask.title')}</span>
    </Button>
  )
}
