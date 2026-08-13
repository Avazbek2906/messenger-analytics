import { create } from 'zustand'

import { tokenStore } from '@/shared/api'

import { clearCabinetFlag } from './cabinet-cache'
import type { SessionContext } from './types'

interface SessionState {
  /** Whether tokens exist on load — i.e. whether bootstrapping is worth it. */
  isAuthenticated: boolean
  /** The router redirects nowhere until bootstrap has finished. */
  context: SessionContext | null
  setAuthenticated: (value: boolean) => void
  setContext: (context: SessionContext | null) => void
  signOut: () => void
}

/**
 * The session — the only global client state.
 *
 * Everything else lives in TanStack Query; this store answers just one
 * question: "who am I and what am I allowed to do".
 */
export const useSessionStore = create<SessionState>((set) => ({
  isAuthenticated: tokenStore.hasSession(),
  context: null,

  setAuthenticated: (value) => set({ isAuthenticated: value }),

  setContext: (context) => set({ context }),

  signOut: () => {
    tokenStore.clear()
    // Signing out is the user's own way to fix a stale cabinet flag — an admin
    // may have linked them to an employee since the last probe.
    clearCabinetFlag()
    set({ isAuthenticated: false, context: null })
  },
}))

/** Stays in sync when tokens are cleared elsewhere (a failed 401 refresh). */
tokenStore.subscribe(() => {
  const hasSession = tokenStore.hasSession()
  const state = useSessionStore.getState()
  if (!hasSession && state.isAuthenticated) {
    useSessionStore.setState({ isAuthenticated: false, context: null })
  }
})
