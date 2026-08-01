import { beforeEach, describe, expect, it, vi } from 'vitest'

import { tokenStore } from './token-store'

beforeEach(() => {
  localStorage.clear()
  tokenStore.clear()
})

describe('tokenStore', () => {
  it('persists both tokens', () => {
    tokenStore.set({ access: 'A1', refresh: 'R1' })

    // The access token is persisted too: otherwise every page reload would
    // cost a guaranteed 401 plus an extra refresh round-trip.
    expect(localStorage.getItem('ma.access')).toBe('A1')
    expect(localStorage.getItem('ma.refresh')).toBe('R1')
  })

  it('keeps the old refresh when only an access token comes back', () => {
    tokenStore.set({ access: 'A1', refresh: 'R1' })
    // Rotation is off on the backend — the response has no new `refresh`.
    tokenStore.set({ access: 'A2' })

    expect(tokenStore.getAccess()).toBe('A2')
    expect(tokenStore.getRefresh()).toBe('R1')
  })

  it('clear() removes both tokens', () => {
    tokenStore.set({ access: 'A1', refresh: 'R1' })
    tokenStore.clear()

    expect(tokenStore.hasSession()).toBe(false)
    expect(localStorage.getItem('ma.access')).toBeNull()
    expect(localStorage.getItem('ma.refresh')).toBeNull()
  })

  it('restores a session from the refresh token alone', () => {
    tokenStore.set({ access: 'A1', refresh: 'R1' })
    localStorage.removeItem('ma.access')

    expect(tokenStore.hasSession()).toBe(true)
  })

  it('does not throw when localStorage is unavailable', () => {
    const spy = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new Error('QuotaExceededError')
      })

    expect(() => tokenStore.set({ access: 'A1', refresh: 'R1' })).not.toThrow()
    // The session still works, at least in this tab.
    expect(tokenStore.getAccess()).toBe('A1')

    spy.mockRestore()
  })

  it('notifies subscribers on change', () => {
    const listener = vi.fn()
    const unsubscribe = tokenStore.subscribe(listener)

    tokenStore.set({ access: 'A1', refresh: 'R1' })
    expect(listener).toHaveBeenCalledTimes(1)

    tokenStore.clear()
    expect(listener).toHaveBeenCalledTimes(2)

    unsubscribe()
    tokenStore.set({ access: 'A2' })
    expect(listener).toHaveBeenCalledTimes(2)
  })
})
