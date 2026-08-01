import { afterEach, describe, expect, it, vi } from 'vitest'

import type { InstagramAccount } from './index'
import { instagramState, isBackfillActive, isHeartbeatStale } from './index'

const NOW = new Date('2026-07-29T12:00:00Z')

function at(offsetMs: number): string {
  // Backend datetimes are "YYYY-MM-DD HH:MM:SS" in UTC — not ISO-8601.
  return new Date(NOW.getTime() + offsetMs)
    .toISOString()
    .slice(0, 19)
    .replace('T', ' ')
}

function account(patch: Partial<InstagramAccount> = {}): InstagramAccount {
  return {
    id: 'a1',
    ig_user_id: '178414',
    username: 'kotib.shop',
    name: 'kotib.shop',
    is_active: true,
    token_expires_at: at(60 * 24 * 3600_000),
    last_refreshed_at: at(-3600_000),
    scopes: [],
    ...patch,
  }
}

afterEach(() => vi.useRealTimers())

function freeze() {
  vi.useFakeTimers()
  vi.setSystemTime(NOW)
}

describe('instagramState', () => {
  it('is monitoring while active with a healthy token', () => {
    freeze()
    expect(instagramState(account())).toBe('monitoring')
  })

  it('warns while the token is inside the 7-day window', () => {
    freeze()
    expect(
      instagramState(account({ token_expires_at: at(3 * 86_400_000) })),
    ).toBe('token_expiring')
  })

  it('demands a reconnect once the token has expired', () => {
    freeze()
    expect(instagramState(account({ token_expires_at: at(-86_400_000) }))).toBe(
      'reconnect_required',
    )
  })

  it('treats a missing token as reconnect required', () => {
    freeze()
    expect(instagramState(account({ token_expires_at: null }))).toBe(
      'reconnect_required',
    )
  })

  it('reports paused for an inactive account with a valid token', () => {
    // Meta's deauthorize callback also sets `is_active: false`, so a paused
    // account and a removed app are indistinguishable here by design.
    freeze()
    expect(instagramState(account({ is_active: false }))).toBe('paused')
  })
})

describe('isHeartbeatStale', () => {
  it('only applies to connected accounts', () => {
    freeze()
    expect(isHeartbeatStale('disconnected', at(-3600_000))).toBe(false)
  })

  it('flags a connected account quiet for over 15 minutes', () => {
    freeze()
    expect(isHeartbeatStale('connected', at(-20 * 60_000))).toBe(true)
    expect(isHeartbeatStale('connected', at(-5 * 60_000))).toBe(false)
  })

  it('treats a missing heartbeat as stale', () => {
    freeze()
    expect(isHeartbeatStale('connected', null)).toBe(true)
  })
})

describe('isBackfillActive', () => {
  it('recognises the two blocking states', () => {
    // Only one pending/running job may exist per account, so these two are what
    // gate the "request a tier" buttons.
    expect(isBackfillActive({ status: 'pending' } as never)).toBe(true)
    expect(isBackfillActive({ status: 'running' } as never)).toBe(true)
    expect(isBackfillActive({ status: 'completed' } as never)).toBe(false)
    expect(isBackfillActive(undefined)).toBe(false)
  })
})
