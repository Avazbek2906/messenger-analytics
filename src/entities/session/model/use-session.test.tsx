import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ApiError, tokenStore } from '@/shared/api'

import { sessionApi } from '../api/session-api'
import { useSessionStore } from './session-store'
import type { Company, CurrentUser } from './types'
import { useSessionBootstrap } from './use-session'

vi.mock('../api/session-api', () => ({
  sessionApi: {
    me: vi.fn(),
    company: vi.fn(),
    hasCabinet: vi.fn(),
    login: vi.fn(),
    updateCompany: vi.fn(),
  },
}))

const MANAGER: CurrentUser = {
  id: 'u1',
  username: 'aziza.k',
  email: 'aziza@example.com',
  first_name: 'Aziza',
  last_name: 'Karimova',
  role: 'manager',
  company: 'c1',
}

/** Only a non-manager role can own a cabinet, so the probe targets this one. */
const SALESPERSON: CurrentUser = { ...MANAGER, id: 'u2', role: 'viewer' }

const COMPANY: Company = {
  id: 'c1',
  name: 'Kotib Savdo',
  timezone: 'Asia/Tashkent',
  attribution_mode: 1,
  idle_gap_hours: 8,
  created_at: '2026-02-11 09:24:07',
}

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

beforeEach(() => {
  // The cabinet answer is persisted between loads — each test starts clean.
  localStorage.clear()
  tokenStore.set({ access: 'A1', refresh: 'R1' })
  useSessionStore.setState({ isAuthenticated: true, context: null })

  vi.mocked(sessionApi.me).mockResolvedValue(SALESPERSON)
  vi.mocked(sessionApi.company).mockResolvedValue(COMPANY)
})

afterEach(() => {
  tokenStore.clear()
  vi.clearAllMocks()
})

describe('useSessionBootstrap', () => {
  it('never asks about the cabinet for a manager role', async () => {
    // `/dashboard/me` answers `400 no_employee_profile` to a manager, so the
    // probe would fail on every page load while telling us nothing we act on:
    // a manager is never in cabinet mode.
    vi.mocked(sessionApi.me).mockResolvedValue(MANAGER)

    const { result } = renderHook(() => useSessionBootstrap(), { wrapper })

    await waitFor(() => expect(result.current.context).not.toBeNull())
    expect(sessionApi.hasCabinet).not.toHaveBeenCalled()
    expect(result.current.context?.hasEmployeeProfile).toBe(false)
    expect(result.current.context?.canViewCompanyDashboards).toBe(true)
  })

  it('opens the cabinet when an employee profile exists', async () => {
    vi.mocked(sessionApi.hasCabinet).mockResolvedValue(true)

    const { result } = renderHook(() => useSessionBootstrap(), { wrapper })

    await waitFor(() => expect(result.current.context).not.toBeNull())
    expect(result.current.context?.hasEmployeeProfile).toBe(true)
  })

  it('survives a 403 from the cabinet probe', async () => {
    // The backend may answer `403` here instead of the documented
    // `400 no_employee_profile`. That must not turn the whole app into
    // "Access denied" — the probe is only a UI hint.
    vi.mocked(sessionApi.hasCabinet).mockRejectedValue(
      new ApiError(403, {
        type: 'client_error',
        errors: [
          { code: 'permission_denied', detail: 'Forbidden.', attr: null },
        ],
      }),
    )

    const { result } = renderHook(() => useSessionBootstrap(), { wrapper })

    await waitFor(() => expect(result.current.context).not.toBeNull())
    expect(result.current.error).toBeNull()
    expect(result.current.context?.hasEmployeeProfile).toBe(false)
    expect(result.current.context?.canViewCompanyDashboards).toBe(true)
  })

  it('asks for the cabinet once, then remembers the answer', async () => {
    // `/dashboard/me` answers `400 no_employee_profile` for every user without
    // a cabinet, so an unremembered probe is a guaranteed failed request on
    // every single page load.
    vi.mocked(sessionApi.hasCabinet).mockResolvedValue(false)

    const first = renderHook(() => useSessionBootstrap(), { wrapper })
    await waitFor(() => expect(first.result.current.context).not.toBeNull())
    expect(sessionApi.hasCabinet).toHaveBeenCalledTimes(1)

    first.unmount()
    useSessionStore.setState({ context: null })

    // A fresh mount stands in for a page reload: same tokens, new QueryClient.
    const second = renderHook(() => useSessionBootstrap(), { wrapper })
    await waitFor(() => expect(second.result.current.context).not.toBeNull())

    expect(sessionApi.hasCabinet).toHaveBeenCalledTimes(1)
    expect(second.result.current.context?.hasEmployeeProfile).toBe(false)
  })

  it('surfaces a `users/me` failure as a bootstrap error', async () => {
    vi.mocked(sessionApi.me).mockRejectedValue(new ApiError(401, null))

    const { result } = renderHook(() => useSessionBootstrap(), { wrapper })

    await waitFor(() => expect(result.current.error).toBeDefined())
    expect(result.current.context).toBeNull()
  })
})
