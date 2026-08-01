import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { differenceInMinutes, differenceInDays } from 'date-fns'

import { queryKeys, type UUID } from '@/shared/api'
import { parseApiDate } from '@/shared/lib'

import { integrationApi } from './api/integration-api'
import type {
  AccountStatus,
  BackfillJob,
  BackfillScope,
  InstagramAccount,
  InstagramState,
} from './model/types'

/* ---------------------------------------------------------------- Derived */

/** Tokens inside this window get a "reconnect soon" warning (docs/07). */
const TOKEN_WARNING_DAYS = 7

/** No heartbeat for this long means the session is going bad (docs/07). */
const STALE_HEARTBEAT_MINUTES = 15

/**
 * Instagram has no `status` field, so its state is derived from two signals.
 * `is_active: false` is also what Meta's deauthorize callback sets, which is
 * why a paused account and a removed app look the same here.
 */
export function instagramState(account: InstagramAccount): InstagramState {
  const expiry = parseApiDate(account.token_expires_at)

  if (!expiry || expiry.getTime() <= Date.now()) return 'reconnect_required'
  if (!account.is_active) return 'paused'
  if (differenceInDays(expiry, new Date()) <= TOKEN_WARNING_DAYS) {
    return 'token_expiring'
  }
  return 'monitoring'
}

/** A `connected` account whose heartbeat has gone quiet still needs attention. */
export function isHeartbeatStale(
  status: AccountStatus,
  lastHealthyAt: string | null,
): boolean {
  if (status !== 'connected') return false

  const seen = parseApiDate(lastHealthyAt)
  if (!seen) return true
  return differenceInMinutes(new Date(), seen) > STALE_HEARTBEAT_MINUTES
}

export function isBackfillActive(job: BackfillJob | undefined): boolean {
  return job?.status === 'pending' || job?.status === 'running'
}

/* ------------------------------------------------------------------ Hooks */

/**
 * Account lists.
 *
 * Background workers change `status`, `is_active` and `last_healthy_at`, so
 * these refetch on window focus and on a slow interval while the page is open
 * (docs/07 "Polling").
 */
const ACCOUNT_QUERY = {
  staleTime: 30_000,
  refetchOnWindowFocus: true,
  refetchInterval: 60_000,
} as const

export function useInstagramAccounts() {
  return useQuery({
    queryKey: queryKeys.integrations.instagram(),
    queryFn: integrationApi.instagramAccounts,
    ...ACCOUNT_QUERY,
  })
}

export function useTelegramAccounts() {
  return useQuery({
    queryKey: queryKeys.integrations.telegram(),
    queryFn: integrationApi.telegramAccounts,
    ...ACCOUNT_QUERY,
  })
}

export function useWebAccounts() {
  return useQuery({
    queryKey: queryKeys.integrations.web(),
    queryFn: integrationApi.webAccounts,
    staleTime: 60_000,
  })
}

/**
 * History jobs for one account, newest first, capped at 20.
 *
 * Polled every ~10 s only while a job is actually pending or running.
 */
export function useBackfillJobs(accountId: UUID) {
  return useQuery({
    queryKey: queryKeys.integrations.backfillJobs(accountId),
    queryFn: () => integrationApi.backfillJobs(accountId),
    refetchInterval: (query) =>
      isBackfillActive(query.state.data?.[0]) ? 10_000 : false,
  })
}

function useInvalidate(key: readonly unknown[]) {
  const queryClient = useQueryClient()
  return () => void queryClient.invalidateQueries({ queryKey: key })
}

export function useToggleInstagram() {
  const invalidate = useInvalidate(queryKeys.integrations.instagram())
  return useMutation({
    mutationFn: integrationApi.instagramToggle,
    onSuccess: invalidate,
  })
}

export function useDeleteInstagram() {
  const invalidate = useInvalidate(queryKeys.integrations.instagram())
  return useMutation({
    mutationFn: integrationApi.instagramDelete,
    onSuccess: invalidate,
  })
}

export function useUpdateTelegram() {
  const invalidate = useInvalidate(queryKeys.integrations.telegram())
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: UUID
      input: Parameters<typeof integrationApi.telegramUpdate>[1]
    }) => integrationApi.telegramUpdate(id, input),
    onSuccess: invalidate,
  })
}

export function useDisconnectTelegram() {
  const invalidate = useInvalidate(queryKeys.integrations.telegram())
  return useMutation({
    mutationFn: integrationApi.telegramDisconnect,
    onSuccess: invalidate,
  })
}

export function useStartBackfill(accountId: UUID) {
  const invalidate = useInvalidate(
    queryKeys.integrations.backfillJobs(accountId),
  )
  return useMutation({
    mutationFn: (scope: BackfillScope) =>
      integrationApi.backfillStart(accountId, scope),
    onSuccess: invalidate,
  })
}

export function useCancelBackfill(accountId: UUID) {
  const invalidate = useInvalidate(
    queryKeys.integrations.backfillJobs(accountId),
  )
  return useMutation({
    mutationFn: () => integrationApi.backfillCancel(accountId),
    onSuccess: invalidate,
  })
}

export function useCreateWebAccount() {
  const invalidate = useInvalidate(queryKeys.integrations.web())
  return useMutation({
    mutationFn: integrationApi.webCreate,
    onSuccess: invalidate,
  })
}

export function useRotateWidgetKey() {
  const invalidate = useInvalidate(queryKeys.integrations.web())
  return useMutation({
    mutationFn: integrationApi.webRotateKey,
    onSuccess: invalidate,
  })
}

export { integrationApi } from './api/integration-api'
export type * from './model/types'
