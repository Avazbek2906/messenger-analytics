import { Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import type { ReactNode } from 'react'

import { AskTrigger } from '@/features/ask-ai'
import { useTranslation } from '@/shared/i18n'
import { Button } from '@/shared/ui/primitives/button'

import { UserMenu } from './user-menu'

interface TopbarProps {
  collapsed: boolean
  onToggleCollapse: () => void
  onOpenMobileNav: () => void
  askOpen: boolean
  /** Omitted on pages with no period filter — the trigger then disappears. */
  onToggleAsk?: () => void
  /** Pages drop their own controls here (period filter, export, …). */
  actions?: ReactNode
}

/**
 * Topbar.
 *
 * The page title deliberately does NOT live here — it belongs to the page,
 * because each page presents its own context (breadcrumb, period) differently.
 */
export function AppTopbar({
  collapsed,
  onToggleCollapse,
  onOpenMobileNav,
  askOpen,
  onToggleAsk,
  actions,
}: TopbarProps) {
  const { t } = useTranslation()

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b border-line bg-canvas/80 px-4 backdrop-blur-md lg:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onOpenMobileNav}
        aria-label={t('nav.openMenu')}
      >
        <Menu />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="hidden lg:inline-flex"
        onClick={onToggleCollapse}
        aria-label={
          collapsed ? t('nav.expandSidebar') : t('nav.collapseSidebar')
        }
        aria-pressed={collapsed}
      >
        {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
      </Button>

      <div className="ml-auto flex items-center gap-2">
        {actions}
        {onToggleAsk ? (
          <AskTrigger open={askOpen} onToggle={onToggleAsk} />
        ) : null}
        <UserMenu />
      </div>
    </header>
  )
}
