import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

import { queryKeys, tokenStore } from '@/shared/api'

import { sessionApi } from '../api/session-api'
import { buildSessionContext } from './permissions'
import { useSessionStore } from './session-store'
import type { Company, CurrentUser, SessionContext } from './types'

/**
 * App bootstrap (docs/02 "App boot order"):
 *   `auth/token` → `companies/users/me` → `companies/me`.
 *
 * If `users/me` returns `company: null`, every other endpoint answers 403, so
 * a dedicated screen is shown instead of a generic error.
 */
export function useSessionBootstrap(): {
  isLoading: boolean
  error: unknown
  context: SessionContext | null
} {
  const isAuthenticated = useSessionStore((s) => s.isAuthenticated)
  const setContext = useSessionStore((s) => s.setContext)

  const userQuery = useQuery({
    queryKey: queryKeys.session.me(),
    queryFn: sessionApi.me,
    enabled: isAuthenticated,
    staleTime: 5 * 60_000,
    retry: false,
  })

  const user = userQuery.data
  const hasCompany = Boolean(user?.company)

  const companyQuery = useQuery({
    queryKey: queryKeys.session.company(),
    queryFn: sessionApi.company,
    enabled: hasCompany,
    staleTime: 5 * 60_000,
    retry: false,
  })

  // Cabinet probe: is this user linked to an `Employee` record? This is a UI
  // HINT, not required data — so ANY error is read as "no cabinet" and can
  // never bring bootstrap down. (Besides the documented
  // `400 no_employee_profile` the backend may also answer `403` here.)
  const cabinetQuery = useQuery({
    queryKey: queryKeys.session.cabinet(),
    queryFn: () => sessionApi.hasCabinet().catch(() => false),
    enabled: hasCompany,
    staleTime: 10 * 60_000,
    retry: false,
  })

  const isResolved =
    Boolean(user) &&
    (!hasCompany || (companyQuery.isSuccess && cabinetQuery.isSuccess))

  useEffect(() => {
    if (!isAuthenticated) {
      setContext(null)
      return
    }
    if (!user || !isResolved) return

    setContext(
      buildSessionContext(
        user,
        companyQuery.data ?? null,
        cabinetQuery.data ?? false,
      ),
    )
  }, [
    isAuthenticated,
    isResolved,
    user,
    companyQuery.data,
    cabinetQuery.data,
    setContext,
  ])

  return {
    isLoading: isAuthenticated && !isResolved && !userQuery.isError,
    // `cabinetQuery` is deliberately absent: its failure must not stop bootstrap.
    error: userQuery.error ?? companyQuery.error,
    context: useSessionStore((s) => s.context),
  }
}

/** Login. On success the tokens are stored and bootstrap starts on its own. */
export function useLogin() {
  const queryClient = useQueryClient()
  const setAuthenticated = useSessionStore((s) => s.setAuthenticated)

  return useMutation({
    mutationFn: sessionApi.login,
    onSuccess: (tokens) => {
      tokenStore.set(tokens)
      queryClient.clear()
      setAuthenticated(true)
    },
  })
}

export function useSignOut(): () => void {
  const queryClient = useQueryClient()
  const signOut = useSessionStore((s) => s.signOut)

  return () => {
    signOut()
    queryClient.clear()
  }
}

/**
 * Access to the session context. Always present below the guards.
 * Throws rather than returning `null`, so callers never have to null-check.
 */
export function useSession(): SessionContext {
  const context = useSessionStore((s) => s.context)
  if (!context) {
    throw new Error('useSession sessiya bootstrap tugagandan keyin chaqirilsin')
  }
  return context
}

export type { Company, CurrentUser }
