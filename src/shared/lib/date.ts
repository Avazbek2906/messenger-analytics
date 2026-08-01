/**
 * Date and time handling.
 *
 * CRITICAL (docs/01 §7): response datetimes look like `"2026-07-29 14:30:00"` —
 * no `T` separator and no timezone suffix. That is NOT ISO-8601, and
 * `new Date(value)` parses it inconsistently across browsers (`Invalid Date`
 * in Safari). Every parse therefore goes through this module.
 *
 * Requests, on the other hand, accept standard ISO-8601.
 */

import {
  differenceInCalendarDays,
  format,
  formatDistanceToNowStrict,
  isValid,
  startOfDay,
  subDays,
} from 'date-fns'

import { activeDateLocale } from './locale-runtime'

/** Backend datetime (`YYYY-MM-DD HH:MM:SS`, UTC) or ISO → `Date`. */
export function parseApiDate(value: string | null | undefined): Date | null {
  if (!value) return null

  // Already ISO (dashboard `period`, export `created_at`) — pass it through.
  const normalized = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)
    ? `${value.replace(' ', 'T')}Z`
    : value

  const date = new Date(normalized)
  return isValid(date) ? date : null
}

/** `Date` → ISO-8601 UTC for backend requests. */
export function toApiDateTime(date: Date): string {
  return date.toISOString()
}

/** `Date` → `YYYY-MM-DD` (for date-only filters). */
export function toApiDate(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

interface FormatOptions {
  /** What to render when the value is `null`. Defaults to `—`. */
  fallback?: string
}

const DASH = '—'

export function formatDate(
  value: string | Date | null | undefined,
  { fallback = DASH }: FormatOptions = {},
): string {
  const date = value instanceof Date ? value : parseApiDate(value)
  return date
    ? format(date, 'd MMM yyyy', { locale: activeDateLocale() })
    : fallback
}

export function formatDateTime(
  value: string | Date | null | undefined,
  { fallback = DASH }: FormatOptions = {},
): string {
  const date = value instanceof Date ? value : parseApiDate(value)
  return date
    ? format(date, 'd MMM yyyy, HH:mm', { locale: activeDateLocale() })
    : fallback
}

export function formatTime(
  value: string | Date | null | undefined,
  { fallback = DASH }: FormatOptions = {},
): string {
  const date = value instanceof Date ? value : parseApiDate(value)
  return date ? format(date, 'HH:mm', { locale: activeDateLocale() }) : fallback
}

/** Relative time, e.g. "3 days ago". */
export function formatRelative(
  value: string | Date | null | undefined,
  { fallback = DASH }: FormatOptions = {},
): string {
  const date = value instanceof Date ? value : parseApiDate(value)
  if (!date) return fallback
  return formatDistanceToNowStrict(date, {
    addSuffix: true,
    locale: activeDateLocale(),
  })
}

/** Seconds → a human-readable duration: `42 s`, `3 min 12 s`, `1 h 4 min`. */
export function formatDuration(
  seconds: number | null | undefined,
  { fallback = DASH }: FormatOptions = {},
): string {
  if (seconds === null || seconds === undefined) return fallback

  // Units are deliberately the international symbols `s`, `min` and `h` —
  // they read the same in all three languages.
  const total = Math.round(seconds)
  if (total < 60) return `${total} s`

  const minutes = Math.floor(total / 60)
  if (minutes < 60) {
    const rest = total % 60
    return rest ? `${minutes} min ${rest} s` : `${minutes} min`
  }

  const hours = Math.floor(minutes / 60)
  const restMinutes = minutes % 60
  return restMinutes ? `${hours} h ${restMinutes} min` : `${hours} h`
}

/** The last N days — the dashboard filter's default window. */
export function lastNDays(days: number): { from: Date; to: Date } {
  const to = new Date()
  return { from: startOfDay(subDays(to, days - 1)), to }
}

/** Bucket count for the timeseries chart (the backend caps it at 400). */
export function bucketCount(
  from: Date,
  to: Date,
  granularity: 'day' | 'week',
): number {
  const days = differenceInCalendarDays(to, from) + 1
  return granularity === 'week' ? Math.ceil(days / 7) : days
}

export const MAX_BUCKETS = 400
