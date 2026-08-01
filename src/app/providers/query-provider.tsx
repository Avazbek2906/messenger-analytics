import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

import { ApiError } from '@/shared/api'

/**
 * The query client.
 *
 * The backend caches dashboard endpoints for 120 s (docs/05 §9), so a shorter
 * `staleTime` buys nothing — the server would return the same stale value. The
 * default of 60 s keeps needless refetches down.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          // 4xx is not worth retrying (the http layer already handles 401).
          if (
            error instanceof ApiError &&
            error.status >= 400 &&
            error.status < 500
          ) {
            return false
          }
          return failureCount < 2
        },
      },
      mutations: {
        retry: false,
      },
    },
  })
}

export function QueryProvider({
  client,
  children,
}: {
  client: QueryClient
  children: ReactNode
}) {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
