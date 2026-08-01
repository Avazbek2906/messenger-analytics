import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

import type { ConversationFilters } from '@/entities/conversation'
import { DEFAULT_PAGE_SIZE } from '@/shared/api'

/**
 * The URL-synced filter schema.
 *
 * How each field maps to a URL param and back lives in one place. Adding a new
 * filter means adding one line to this list.
 */
type FieldKind = 'string' | 'boolean' | 'number'

const FIELDS: Record<string, FieldKind> = {
  search: 'string',
  ordering: 'string',
  employee: 'string',
  outcome: 'string',
  sentiment: 'string',
  attribution_source: 'string',
  product: 'string',
  reason: 'string',
  closed_from: 'string',
  closed_to: 'string',
  score_min: 'number',
  score_max: 'number',
  unassigned: 'boolean',
  needs_review: 'boolean',
  has_violations: 'boolean',
  is_legacy: 'boolean',
}

export type ConversationFilterKey = keyof typeof FIELDS

export interface ConversationFilterState {
  /** The shape passed to the API (pagination included). */
  params: ConversationFilters
  /** Filters only, without pagination. Chips are built from this. */
  active: Partial<Record<ConversationFilterKey, string>>
  activeCount: number
  offset: number
  limit: number
  set: (key: ConversationFilterKey, value: string | null) => void
  setOffset: (offset: number) => void
  clear: () => void
}

/** An empty string and `null` are the same thing here: "no filter". */
function parseValue(kind: FieldKind, raw: string): unknown {
  if (kind === 'boolean') return raw === 'true'
  if (kind === 'number') {
    const parsed = Number(raw)
    return Number.isFinite(parsed) ? parsed : undefined
  }
  return raw
}

export function useConversationFilters(): ConversationFilterState {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.toString()

  const { params, active, offset, limit } = useMemo(() => {
    const current = new URLSearchParams(query)
    const collected: Partial<Record<ConversationFilterKey, string>> = {}
    const apiParams: Record<string, unknown> = {}

    for (const [field, kind] of Object.entries(FIELDS)) {
      const raw = current.get(field)
      if (raw === null || raw === '') continue

      collected[field] = raw
      const value = parseValue(kind, raw)
      if (value !== undefined) apiParams[field] = value
    }

    const parsedOffset = Number(current.get('offset') ?? 0)
    const resolvedOffset = Number.isFinite(parsedOffset)
      ? Math.max(0, parsedOffset)
      : 0

    return {
      active: collected,
      offset: resolvedOffset,
      limit: DEFAULT_PAGE_SIZE,
      params: {
        ...apiParams,
        limit: DEFAULT_PAGE_SIZE,
        offset: resolvedOffset,
      } as ConversationFilters,
    }
  }, [query])

  const update = useCallback(
    (mutate: (next: URLSearchParams) => void) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current)
          mutate(next)
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  return {
    params,
    active,
    activeCount: Object.keys(active).length,
    offset,
    limit,

    set: useCallback(
      (key, value) =>
        update((next) => {
          if (value === null || value === '') next.delete(key)
          else next.set(key, value)
          // Reset to the first page when a filter changes — otherwise the user
          // lands on a page that no longer exists and sees nothing.
          next.delete('offset')
        }),
      [update],
    ),

    setOffset: useCallback(
      (value) =>
        update((next) => {
          if (value <= 0) next.delete('offset')
          else next.set('offset', String(value))
        }),
      [update],
    ),

    clear: useCallback(
      () =>
        update((next) => {
          for (const field of Object.keys(FIELDS)) next.delete(field)
          next.delete('offset')
        }),
      [update],
    ),
  }
}
