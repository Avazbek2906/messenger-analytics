import { NavLink } from 'react-router-dom'

import { ROUTES } from '@/app/router/routes'
import { useTranslation } from '@/shared/i18n'
import { cn } from '@/shared/lib'
import { Logo, LogoMark } from '@/shared/ui/brand/logo'
import { Tooltip } from '@/shared/ui/primitives/tooltip'

import type { NavItem } from './navigation'

interface SidebarProps {
  primary: NavItem[]
  secondary: NavItem[]
  collapsed: boolean
  /** Closes the mobile drawer after a link is clicked. */
  onNavigate?: () => void
}

/**
 * Sidebar.
 *
 * From the reference design: rounded-square items, the active one filled with
 * the brand colour. Collapsed, only the icon remains and the label moves into
 * a tooltip — icon-only navigation must not hurt discoverability.
 */
export function AppSidebar({
  primary,
  secondary,
  collapsed,
  onNavigate,
}: SidebarProps) {
  const { t } = useTranslation()

  return (
    <div className="flex h-full flex-col bg-surface ring-1 ring-line">
      <div
        className={cn(
          'flex h-16 shrink-0 items-center',
          collapsed ? 'justify-center px-3' : 'px-5',
        )}
      >
        <NavLink
          to={ROUTES.dashboard}
          onClick={onNavigate}
          aria-label={t('nav.home')}
        >
          {collapsed ? <LogoMark className="size-8" /> : <Logo />}
        </NavLink>
      </div>

      <nav
        aria-label={t('nav.main')}
        className="scrollbar-slim flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-2"
      >
        {primary.map((item) => (
          <SidebarLink
            key={item.to}
            item={item}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
        ))}

        <div className="flex-1" />

        <div className="mt-2 space-y-1 border-t border-line pt-3">
          {secondary.map((item) => (
            <SidebarLink
              key={item.to}
              item={item}
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </nav>
    </div>
  )
}

function SidebarLink({
  item,
  collapsed,
  onNavigate,
}: {
  item: NavItem
  collapsed: boolean
  onNavigate?: () => void
}) {
  const { t } = useTranslation()
  const Icon = item.icon
  const label = t(item.labelKey)

  const link = (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'group relative flex h-11 items-center gap-3 rounded-md text-sm font-medium',
          'transition-colors duration-(--duration-fast) ease-(--ease-out-soft)',
          collapsed ? 'w-11 justify-center' : 'px-3',
          isActive
            ? 'bg-primary text-primary-fg shadow-xs'
            : 'text-fg-muted hover:bg-surface-sunken hover:text-fg',
        )
      }
    >
      <Icon className="size-[18px] shrink-0" aria-hidden />
      {collapsed ? (
        <span className="sr-only">{label}</span>
      ) : (
        <span className="truncate">{label}</span>
      )}
    </NavLink>
  )

  return collapsed ? (
    <Tooltip content={label} side="right">
      {link}
    </Tooltip>
  ) : (
    link
  )
}
