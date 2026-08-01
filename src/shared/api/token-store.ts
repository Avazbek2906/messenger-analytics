/**
 * Token storage.
 *
 * Backend: access lives 5 days, refresh 7 days, with NO rotation or blacklist
 * (docs/02). The practical strategy is therefore reactive: refresh once on a
 * 401, and fall back to the login screen if that fails too.
 *
 * Both tokens live in `localStorage`. Keeping the access token in memory only
 * buys no real security — the refresh token sits here anyway and grants seven
 * days of full access — while costing a guaranteed 401 plus an extra refresh
 * round-trip on every page reload.
 */

const ACCESS_KEY = 'ma.access'
const REFRESH_KEY = 'ma.refresh'

/** `localStorage` can throw in private mode — reads and writes are guarded. */
function read(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function write(key: string, value: string | null): void {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, value)
  } catch {
    /* quota exceeded or private mode — the session lives in memory only */
  }
}

// In-memory copy, so the store still works where `localStorage` is unavailable.
let accessToken: string | null = read(ACCESS_KEY)
let refreshToken: string | null = read(REFRESH_KEY)

type Listener = () => void
const listeners = new Set<Listener>()

function emit(): void {
  for (const listener of listeners) listener()
}

export const tokenStore = {
  getAccess(): string | null {
    return accessToken
  },

  getRefresh(): string | null {
    return refreshToken
  },

  set(tokens: { access: string; refresh?: string }): void {
    accessToken = tokens.access
    write(ACCESS_KEY, tokens.access)

    // Rotation is off: `/auth/token/refresh` returns no new `refresh`, so the
    // original one must be kept.
    if (tokens.refresh) {
      refreshToken = tokens.refresh
      write(REFRESH_KEY, tokens.refresh)
    }
    emit()
  },

  clear(): void {
    accessToken = null
    refreshToken = null
    write(ACCESS_KEY, null)
    write(REFRESH_KEY, null)
    emit()
  },

  /** Whether a session can still be restored after a page reload. */
  hasSession(): boolean {
    return Boolean(accessToken ?? refreshToken)
  },

  subscribe(listener: Listener): () => void {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
}
