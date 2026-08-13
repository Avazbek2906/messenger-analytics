import type { UUID } from '@/shared/api'

const KEY = 'ma.cabinet'

/**
 * The employee link is set by an admin and then essentially never changes, so
 * re-asking on every page load is pure waste. A day is short enough that a
 * newly linked user is not stuck for long, and signing out clears it outright.
 */
const TTL_MS = 24 * 60 * 60 * 1000

interface Entry {
  user: UUID
  hasCabinet: boolean
  at: number
}

/**
 * Remembers whether the user has an employee cabinet.
 *
 * The only way to ask is `GET /dashboard/me`, which answers
 * `400 no_employee_profile` for everyone who has none — a manager, typically.
 * Unremembered, that is a request that fails on EVERY page load: a wasted
 * round-trip, and a red line in the network panel that reads as a bug to
 * anyone who opens devtools.
 *
 * Keyed by user id, so switching accounts on one machine cannot inherit the
 * previous user's answer.
 */
export function readCabinetFlag(user: UUID): boolean | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null

    const entry = JSON.parse(raw) as Entry
    if (entry.user !== user) return null
    if (Date.now() - entry.at > TTL_MS) return null

    return entry.hasCabinet
  } catch {
    return null
  }
}

export function writeCabinetFlag(user: UUID, hasCabinet: boolean): void {
  try {
    const entry: Entry = { user, hasCabinet, at: Date.now() }
    localStorage.setItem(KEY, JSON.stringify(entry))
  } catch {
    /* private mode / quota — the probe simply runs again next time */
  }
}

export function clearCabinetFlag(): void {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}
