import { Building2, KeyRound, Package, Plug, Users } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'

import { ROUTES } from '@/app/router/routes'
import { useSession } from '@/entities/session'
import { useDocumentTitle } from '@/shared/hooks/use-document-title'
import { useTranslation, type MessageKey } from '@/shared/i18n'
import { cn } from '@/shared/lib'
import { PageHeader } from '@/shared/ui/layout/page-header'
import { Badge } from '@/shared/ui/primitives/badge'

const TABS = [
  { to: ROUTES.settingsCompany, labelKey: 'settings.company', icon: Building2 },
  { to: ROUTES.settingsAccount, labelKey: 'settings.account', icon: KeyRound },
  { to: ROUTES.settingsEmployees, labelKey: 'settings.employees', icon: Users },
  { to: ROUTES.settingsCatalog, labelKey: 'settings.catalog', icon: Package },
  {
    to: ROUTES.settingsIntegrations,
    labelKey: 'settings.integrations',
    icon: Plug,
  },
] as const satisfies readonly {
  to: string
  labelKey: MessageKey
  icon: typeof Users
}[]

/**
 * The settings shell.
 *
 * Reads are open to every company user and only writes require a manager role,
 * so there is no route guard here — instead the read-only state is announced
 * once, at the top, rather than being discovered control by control.
 */
export function SettingsLayout() {
  const { t } = useTranslation()
  useDocumentTitle(t('nav.settings'))
  const session = useSession()

  return (
    <>
      <PageHeader
        title={t('nav.settings')}
        description={t('settings.subtitle')}
        actions={
          session.canWrite ? null : (
            <Badge tone="warning">{t('settings.readOnly')}</Badge>
          )
        }
      />

      <nav
        aria-label={t('nav.settings')}
        className="mb-5 flex gap-1 overflow-x-auto border-b border-line"
      >
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              cn(
                '-mb-px flex items-center gap-2 border-b-2 px-3.5 py-2.5 text-[13px] font-medium whitespace-nowrap transition-colors',
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-fg-muted hover:text-fg',
              )
            }
          >
            <tab.icon className="size-4" aria-hidden />
            {t(tab.labelKey)}
          </NavLink>
        ))}
      </nav>

      <Outlet />
    </>
  )
}

export default SettingsLayout
