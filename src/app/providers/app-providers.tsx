import { TooltipProvider } from '@radix-ui/react-tooltip'
import { useState, type ReactNode } from 'react'
import { Toaster } from 'sonner'

import { I18nProvider, useTranslation } from '@/shared/i18n'
import { LogoMark } from '@/shared/ui/brand/logo'
import { ThemeEffect } from '@/shared/ui/theme'
import {
  AppCrashFallback,
  ErrorBoundary,
} from '@/shared/ui/feedback/error-boundary'

import { createQueryClient, QueryProvider } from './query-provider'

/**
 * All global providers. The order matters: i18n sits outermost because even
 * the error screens need translation.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient)

  return (
    <I18nProvider fallback={<BootSplash />}>
      <ThemeEffect />
      <ErrorBoundary fallback={(reset) => <CrashFallback reset={reset} />}>
        <QueryProvider client={queryClient}>
          <TooltipProvider delayDuration={200} skipDelayDuration={300}>
            {children}
            <Toaster
              position="bottom-right"
              duration={4000}
              closeButton
              toastOptions={{
                classNames: {
                  toast:
                    'bg-surface ring-1 ring-line shadow-popover rounded-lg text-fg text-sm',
                  description: 'text-fg-muted',
                },
              }}
            />
          </TooltipProvider>
        </QueryProvider>
      </ErrorBoundary>
    </I18nProvider>
  )
}

/**
 * Shown only while a code-split dictionary loads — i.e. never for the default
 * locale, and once per session for the others.
 */
function BootSplash() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-canvas">
      <LogoMark className="size-10 animate-pulse" />
    </div>
  )
}

function CrashFallback({ reset }: { reset: () => void }) {
  const { t } = useTranslation()

  return (
    <AppCrashFallback
      reset={reset}
      messages={{
        title: t('error.app.title'),
        description: t('error.app.description'),
        reload: t('error.app.reload'),
        retry: t('common.retry'),
      }}
    />
  )
}
