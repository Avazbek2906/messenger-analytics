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
    employeeIdentity: vi.fn(),
    login: vi.fn(),
    updateCompany: vi.fn(),
  },
}))

const USER: CurrentUser = {
  id: 'u1',
  username: 'aziza.k',
  email: 'aziza@example.com',
  first_name: 'Aziza',
  last_name: 'Karimova',
  role: 'manager',
  company: 'c1',
}

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
  tokenStore.set({ access: 'A1', refresh: 'R1' })
  useSessionStore.setState({ isAuthenticated: true, context: null })

  vi.mocked(sessionApi.me).mockResolvedValue(USER)
  vi.mocked(sessionApi.company).mockResolvedValue(COMPANY)
})

afterEach(() => {
  tokenStore.clear()
  vi.clearAllMocks()
})

describe('useSessionBootstrap', () => {
  it('opens the cabinet when an employee profile exists', async () => {
    vi.mocked(sessionApi.employeeIdentity).mockResolvedValue({
      employee_id: 'e1',
      full_name: 'Aziza Karimova',
      company: 'Kotib Savdo',
    })

    const { result } = renderHook(() => useSessionBootstrap(), { wrapper })

    await waitFor(() => expect(result.current.context).not.toBeNull())
    expect(result.current.context?.hasEmployeeProfile).toBe(true)
  })

  it('survives a 403 from the cabinet probe', async () => {
    // The backend may answer `403` here instead of the documented
    // `400 no_employee_profile`. That must not turn the whole app into
    // "Access denied" — the probe is only a UI hint.
    vi.mocked(sessionApi.employeeIdentity).mockRejectedValue(
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

  it('surfaces a `users/me` failure as a bootstrap error', async () => {
    vi.mocked(sessionApi.me).mockRejectedValue(new ApiError(401, null))

    const { result } = renderHook(() => useSessionBootstrap(), { wrapper })

    await waitFor(() => expect(result.current.error).toBeDefined())
    expect(result.current.context).toBeNull()
  })
})
