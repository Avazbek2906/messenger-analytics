import { useEffect, type ReactNode } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useSessionStore, useSignOut } from '@/entities/session'
import { ApiError } from '@/shared/api'
import { LogoMark } from '@/shared/ui/brand/logo'
import { Button } from '@/shared/ui/primitives/button'
import { ErrorState } from '@/shared/ui/feedback/states'
import { useTranslation } from '@/shared/i18n'

import { ROUTES } from './routes'

/**
 * Shown while the session is still loading.
 * The router must not redirect anywhere before bootstrap finishes, otherwise a
 * page reload throws the user back to the login screen.
 */
export function SessionSplash() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-canvas">
      <LogoMark className="size-10 animate-pulse" />
      <span className="sr-only">Yuklanmoqda…</span>
    </div>
  )
}

interface GuardProps {
  isLoading: boolean
  error: unknown
  children?: ReactNode
}

/** Every route that requires authentication sits under this guard. */
export function RequireAuth({ isLoading, error }: GuardProps) {
  const location = useLocation()
  const isAuthenticated = useSessionStore((s) => s.isAuthenticated)
  const context = useSessionStore((s) => s.context)
  const signOut = useSignOut()

  // If the refresh itself 401s the session cannot be restored — send the user
  // back to login instead of trapping them on an error screen.
  const expired = error instanceof ApiError && error.isUnauthorized

  useEffect(() => {
    if (expired) signOut()
  }, [expired, signOut])

  if (!isAuthenticated || expired) {
    return <Navigate to={ROUTES.login} state={{ from: location }} replace />
  }
  if (isLoading || !context) {
    return error ? <BootstrapError error={error} /> : <SessionSplash />
  }
  // An account with no company gets 403 everywhere — it gets its own screen.
  if (!context.company) {
    return <Navigate to={ROUTES.noCompany} replace />
  }

  return <Outlet />
}

/**
 * Bootstrap xatosi.
 *
 * The app shell does not exist yet at this point, so the escape route has to
 * be spelled out or the user is stuck.
 */
function BootstrapError({ error }: { error: unknown }) {
  const { t } = useTranslation()
  const signOut = useSignOut()

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-2 bg-canvas px-5">
      <ErrorState error={error} onRetry={() => window.location.reload()} />
      <Button variant="ghost" size="sm" onClick={signOut}>
        {t('user.switchAccount')}
      </Button>
    </div>
  )
}

/**
 * Company-wide dashboards.
 *
 * An employee-cabinet user would get a 403 on these routes, so they are
 * redirected to their own cabinet rather than shown an error.
 */
export function RequireCompanyDashboards() {
  const context = useSessionStore((s) => s.context)
  if (context && !context.canViewCompanyDashboards) {
    return <Navigate to={ROUTES.cabinet} replace />
  }
  return <Outlet />
}

/* Note: the settings routes get no guard of their own — on the backend reads
   are open to every company user and only writes require a manager role. The
   role check therefore happens at control level (button / form) via
   `session.canWrite`. */

/** Login sahifasi — allaqachon kirgan foydalanuvchini ichkariga qaytaradi. */
export function RedirectIfAuthenticated({ children }: { children: ReactNode }) {
  const isAuthenticated = useSessionStore((s) => s.isAuthenticated)
  return isAuthenticated ? (
    <Navigate to={ROUTES.dashboard} replace />
  ) : (
    <>{children}</>
  )
}
