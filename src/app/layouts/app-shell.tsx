import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { Suspense, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

import { useSession } from '@/entities/session'
import { useTranslation } from '@/shared/i18n'
import { useLocalStorage } from '@/shared/hooks/use-local-storage'
import { cn } from '@/shared/lib'
import { ErrorBoundary } from '@/shared/ui/feedback/error-boundary'
import { Button } from '@/shared/ui/primitives/button'
import { Skeleton } from '@/shared/ui/primitives/skeleton'

import { AppSidebar } from './app-sidebar'
import { AppTopbar } from './app-topbar'
import { buildNavigation } from './navigation'

/**
 * The app shell: sidebar + topbar + content.
 *
 * On desktop the sidebar collapses (the state is persisted in `localStorage`);
 * on mobile it opens as a drawer — the `adaptive-navigation` rule.
 */
export function AppShell() {
  const session = useSession()
  const { t } = useTranslation()
  const location = useLocation()
  const [collapsed, setCollapsed] = useLocalStorage(
    'ma.sidebar-collapsed',
    false,
  )
  const [mobileOpen, setMobileOpen] = useState(false)

  const { primary, secondary } = buildNavigation(session)

  return (
    <div className="min-h-dvh bg-canvas">
      {/* Klaviatura foydalanuvchilari uchun kontentga o'tish. */}
      <a
        href="#main"
        className="sr-only rounded-md bg-primary px-4 py-2 text-sm text-primary-fg focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50"
      >
        {t('nav.skipToContent')}
      </a>

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 hidden transition-[width] duration-(--duration-base) ease-(--ease-out-soft) lg:block',
          collapsed
            ? 'w-(--spacing-sidebar-collapsed)'
            : 'w-(--spacing-sidebar)',
        )}
      >
        <AppSidebar
          primary={primary}
          secondary={secondary}
          collapsed={collapsed}
        />
      </aside>

      <MobileNav
        open={mobileOpen}
        onOpenChange={setMobileOpen}
        primary={primary}
        secondary={secondary}
      />

      <div
        className={cn(
          'flex min-h-dvh flex-col transition-[padding] duration-(--duration-base) ease-(--ease-out-soft)',
          collapsed
            ? 'lg:pl-(--spacing-sidebar-collapsed)'
            : 'lg:pl-(--spacing-sidebar)',
        )}
      >
        <AppTopbar
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
          onOpenMobileNav={() => setMobileOpen(true)}
        />

        <main id="main" className="flex-1 px-4 py-6 lg:px-6 lg:py-8">
          {/* `key` — route almashganda xato holati o'zi tozalanadi. */}
          <ErrorBoundary key={location.pathname}>
            <Suspense fallback={<PageFallback />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  )
}

function MobileNav({
  open,
  onOpenChange,
  primary,
  secondary,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  primary: ReturnType<typeof buildNavigation>['primary']
  secondary: ReturnType<typeof buildNavigation>['secondary']
}) {
  const { t } = useTranslation()

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="data-[state=open]:animate-in data-[state=open]:fade-in-0 fixed inset-0 z-40 bg-overlay backdrop-blur-[2px] lg:hidden" />
        <Dialog.Content className="data-[state=open]:animate-in data-[state=open]:slide-in-from-left fixed inset-y-0 left-0 z-50 w-(--spacing-sidebar) lg:hidden">
          <Dialog.Title className="sr-only">{t('nav.main')}</Dialog.Title>
          <Dialog.Close asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="absolute top-4 right-3 z-10"
              aria-label={t('nav.closeMenu')}
            >
              <X />
            </Button>
          </Dialog.Close>
          <AppSidebar
            primary={primary}
            secondary={secondary}
            collapsed={false}
            onNavigate={() => onOpenChange(false)}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

/** Shown while a route lazy-loads — sized so the layout does not shift. */
function PageFallback() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-9 w-56" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-80 rounded-xl" />
    </div>
  )
}
