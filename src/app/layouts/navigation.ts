import {
  BarChart3,
  Handshake,
  LayoutDashboard,
  type LucideIcon,
  MessagesSquare,
  Package,
  Settings,
  UserRound,
  Users,
} from 'lucide-react'

import { ROUTES } from '@/app/router/routes'
import type { SessionContext } from '@/entities/session'
import type { MessageKey } from '@/shared/i18n'

export interface NavItem {
  to: string
  /** Tarjima kaliti — matn komponentda `t()` orqali olinadi. */
  labelKey: MessageKey
  icon: LucideIcon
  /** Only for users who may read company dashboards. */
  companyOnly?: boolean
  /** Manager roles only. */
  managerOnly?: boolean
  /** Only for users linked to an `Employee` profile. */
  cabinetOnly?: boolean
  /** `end` — `/` needs an exact match. */
  end?: boolean
}

const PRIMARY: NavItem[] = [
  {
    to: ROUTES.dashboard,
    labelKey: 'nav.dashboard',
    icon: LayoutDashboard,
    companyOnly: true,
    end: true,
  },
  {
    to: ROUTES.conversations,
    labelKey: 'nav.conversations',
    icon: MessagesSquare,
  },
  { to: ROUTES.team, labelKey: 'nav.team', icon: Users, companyOnly: true },
  {
    to: ROUTES.products,
    labelKey: 'nav.products',
    icon: Package,
    companyOnly: true,
  },
  {
    to: ROUTES.agreements,
    labelKey: 'nav.agreements',
    icon: Handshake,
    companyOnly: true,
  },
  { to: ROUTES.customers, labelKey: 'nav.customers', icon: UserRound },
  {
    to: ROUTES.cabinet,
    labelKey: 'nav.cabinet',
    icon: BarChart3,
    cabinetOnly: true,
  },
]

const SECONDARY: NavItem[] = [
  {
    to: ROUTES.reports,
    labelKey: 'nav.reports',
    icon: BarChart3,
    companyOnly: true,
  },
  { to: ROUTES.settings, labelKey: 'nav.settings', icon: Settings },
]

/**
 * Filters navigation by the session's permissions.
 *
 * The goal is that a user never walks into a 403 — a section they cannot reach
 * is simply not offered (docs/01 §4).
 */
function allow(item: NavItem, session: SessionContext): boolean {
  if (item.companyOnly && !session.canViewCompanyDashboards) return false
  if (item.managerOnly && !session.canWrite) return false
  if (item.cabinetOnly && !session.hasEmployeeProfile) return false
  return true
}

export function buildNavigation(session: SessionContext): {
  primary: NavItem[]
  secondary: NavItem[]
} {
  return {
    primary: PRIMARY.filter((item) => allow(item, session)),
    secondary: SECONDARY.filter((item) => allow(item, session)),
  }
}
