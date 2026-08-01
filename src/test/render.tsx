import { TooltipProvider } from '@radix-ui/react-tooltip'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  render,
  type RenderOptions,
  type RenderResult,
} from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'

import { I18nProvider, type Locale } from '@/shared/i18n'

interface Options extends Omit<RenderOptions, 'wrapper'> {
  /** Initial locale. Defaults to `uz` rather than relying on `detectLocale`. */
  locale?: Locale
  /** Initial route when the component needs a router. */
  route?: string
}

/**
 * Shared render helper for tests.
 *
 * Providers are nested in the same order as the app, so components land in the
 * same environment they will run in. Each test gets its own `QueryClient` so
 * cache never leaks between tests.
 */
export function renderWithProviders(
  ui: ReactElement,
  { locale = 'uz', route = '/', ...options }: Options = {},
): RenderResult {
  localStorage.setItem('ma.locale', locale)

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <MemoryRouter initialEntries={[route]}>
        <QueryClientProvider client={queryClient}>
          <I18nProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </I18nProvider>
        </QueryClientProvider>
      </MemoryRouter>
    )
  }

  return render(ui, { wrapper: Wrapper, ...options })
}
