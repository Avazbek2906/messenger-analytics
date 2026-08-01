import { lazy } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { AppShell } from '@/app/layouts/app-shell'
import { useSessionBootstrap } from '@/entities/session'

import {
  RedirectIfAuthenticated,
  RequireAuth,
  RequireCompanyDashboards,
} from './guards'
import { ROUTES } from './routes'

/* Route-level code splitting so the first load stays light. */
const LoginPage = lazy(() => import('@/pages/login/login-page'))
const DashboardPage = lazy(() => import('@/pages/dashboard/dashboard-page'))
const ConversationsPage = lazy(
  () => import('@/pages/conversations/conversations-page'),
)
const ConversationDetailPage = lazy(
  () => import('@/pages/conversations/conversation-detail-page'),
)
const TeamPage = lazy(() => import('@/pages/team/team-page'))
const TeamMemberPage = lazy(() => import('@/pages/team/team-member-page'))
const CabinetPage = lazy(() => import('@/pages/team/cabinet-page'))
const ProductsPage = lazy(() => import('@/pages/products/products-page'))
const AgreementsPage = lazy(() => import('@/pages/agreements/agreements-page'))
const SettingsLayout = lazy(() => import('@/pages/settings/settings-layout'))
const CompanySettingsPage = lazy(() => import('@/pages/settings/company-page'))
const EmployeesSettingsPage = lazy(
  () => import('@/pages/settings/employees-page'),
)
const CatalogSettingsPage = lazy(() => import('@/pages/settings/catalog-page'))
const IntegrationsPage = lazy(
  () => import('@/pages/settings/integrations-page'),
)
const CustomersPage = lazy(() => import('@/pages/customers/customers-page'))
const ReportsPage = lazy(() => import('@/pages/reports/reports-page'))
const NoCompanyPage = lazy(() => import('@/pages/system/no-company-page'))
const NotFoundPage = lazy(() => import('@/pages/system/not-found-page'))

export function AppRouter() {
  // Bootstrap runs INSIDE the router: the guards read this state to decide
  // where to send the user, so a page reload never bounces them to login.
  const { isLoading, error } = useSessionBootstrap()

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path={ROUTES.login}
          element={
            <RedirectIfAuthenticated>
              <LoginPage />
            </RedirectIfAuthenticated>
          }
        />
        <Route path={ROUTES.noCompany} element={<NoCompanyPage />} />

        <Route element={<RequireAuth isLoading={isLoading} error={error} />}>
          <Route element={<AppShell />}>
            {/* Kompaniya darajasidagi dashboardlar. Xodim kabineti
                foydalanuvchisi bu yerda 403 olardi — u `/me` ga yo'naltiriladi. */}
            <Route element={<RequireCompanyDashboards />}>
              <Route index element={<DashboardPage />} />
              <Route path={ROUTES.team}>
                <Route index element={<TeamPage />} />
                <Route path=":id" element={<TeamMemberPage />} />
              </Route>
              <Route path={ROUTES.products} element={<ProductsPage />} />
              <Route path={ROUTES.agreements} element={<AgreementsPage />} />
              <Route path={ROUTES.reports} element={<ReportsPage />} />
            </Route>

            <Route path={ROUTES.conversations}>
              <Route index element={<ConversationsPage />} />
              <Route path=":id" element={<ConversationDetailPage />} />
            </Route>
            <Route path={ROUTES.customers} element={<CustomersPage />} />
            <Route path={ROUTES.cabinet} element={<CabinetPage />} />
            <Route path={ROUTES.settings} element={<SettingsLayout />}>
              <Route index element={<Navigate to="company" replace />} />
              <Route path="company" element={<CompanySettingsPage />} />
              <Route path="employees" element={<EmployeesSettingsPage />} />
              <Route path="catalog" element={<CatalogSettingsPage />} />
              <Route path="integrations" element={<IntegrationsPage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to={ROUTES.dashboard} replace />} />
      </Routes>
    </BrowserRouter>
  )
}
