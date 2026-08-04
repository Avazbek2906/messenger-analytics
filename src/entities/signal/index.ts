import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useCallback, useState } from 'react'

import { http, queryKeys, type PeriodParams, type UUID } from '@/shared/api'

import type {
  ResolveSignalPayload,
  SignalKind,
  SignalsResponse,
} from './model/types'

export const signalApi = {
  /** `confirmed` is validated for parity but ignored by this endpoint. */
  list: (params: PeriodParams) =>
    http.get<SignalsResponse>('dashboard/signals', { ...params }),

  /** Idempotent: backed by `get_or_create` on `(conversation, signal)`. */
  resolve: (payload: ResolveSignalPayload) =>
    http.post<ResolveSignalPayload>('dashboard/signals/resolve', payload),
}

/**
 * The attention queue.
 *
 * Nothing is pushed — a live badge means polling, and the response is cached
 * server-side for 120 s, so anything faster than that just burns requests.
 * Polling stops entirely while the tab is hidden (docs/06).
 */
export function useSignals(params: PeriodParams) {
  return useQuery({
    queryKey: queryKeys.dashboard.signals(params),
    queryFn: () => signalApi.list(params),
    staleTime: 120_000,
    // Period-keyed like every other aggregate: hold the previous queues while
    // the new window loads rather than emptying the panel (guide §8).
    placeholderData: keepPreviousData,
    refetchInterval: () =>
      document.visibilityState === 'visible' ? 120_000 : false,
  })
}

/**
 * Marks one conversation on one signal as handled.
 *
 * Because the aggregate is cached for up to 120 s, a refetch right after
 * resolving still returns the row. The caller therefore keeps a local resolved
 * set and reconciles against it rather than trusting the first refetch
 * (docs/06 "Signals — badge & queue UX").
 */
export function useResolveSignal() {
  const queryClient = useQueryClient()
  const [resolved, setResolved] = useState<Set<string>>(new Set())

  const mutation = useMutation({
    mutationFn: signalApi.resolve,
    onSuccess: (payload) => {
      setResolved((current) => new Set(current).add(key(payload)))
      void queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard.all(),
        refetchType: 'none',
      })
    },
  })

  const isResolved = useCallback(
    (conversation: UUID, signal: SignalKind) =>
      resolved.has(`${signal}:${conversation}`),
    [resolved],
  )

  return { resolve: mutation.mutate, isResolved, isPending: mutation.isPending }
}

function key(payload: ResolveSignalPayload): string {
  return `${payload.signal}:${payload.conversation}`
}

export {
  SIGNAL_ICONS,
  SIGNAL_ORDER,
  SIGNAL_TONES,
  signalHintKey,
  signalLabelKey,
} from './model/labels'
export type * from './model/types'
