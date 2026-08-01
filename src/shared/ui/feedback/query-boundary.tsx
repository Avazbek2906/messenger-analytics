import type { UseQueryResult } from '@tanstack/react-query'
import type { ReactNode } from 'react'

import { EmptyState, ErrorState } from './states'

interface QueryBoundaryProps<T> {
  query: UseQueryResult<T>
  /** Loading skeleton — each widget supplies one matching its own shape. */
  loading: ReactNode
  /** Detects an empty result. Defaults to checking for an empty array. */
  isEmpty?: (data: T) => boolean
  empty?: ReactNode
  children: (data: T) => ReactNode
}

/**
 * Renders the four query states in one place: loading → error → empty → data.
 *
 * This removes the `if (isLoading) … if (isError) …` chain that would otherwise
 * repeat in every widget, and guarantees that empty and error states look
 * identical app-wide.
 */
export function QueryBoundary<T>({
  query,
  loading,
  isEmpty = defaultIsEmpty,
  empty,
  children,
}: QueryBoundaryProps<T>) {
  if (query.isPending) return <>{loading}</>

  if (query.isError) {
    return (
      <ErrorState error={query.error} onRetry={() => void query.refetch()} />
    )
  }

  if (isEmpty(query.data)) {
    return <>{empty ?? <EmptyState />}</>
  }

  return <>{children(query.data)}</>
}

function defaultIsEmpty(data: unknown): boolean {
  return Array.isArray(data) && data.length === 0
}
