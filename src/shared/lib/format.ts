/**
 * Number and text formatting.
 *
 * CRITICAL rule (docs/05 §1): `null` is NOT `0`. "Not measured" and "measured,
 * and it was zero" are different facts. `null` always renders as `—`.
 */

import { numberFormat } from './locale-runtime'

const DASH = '—'

type Nullable = number | null | undefined

interface Options {
  fallback?: string
}

// Formatters come from the active locale (`locale-runtime`) and are cached —
// that is how `1 234,5` (uz/ru) and `1,234.5` (en) both come out right.
const decimal = () => numberFormat({ maximumFractionDigits: 1 })
const integer = () => numberFormat({ maximumFractionDigits: 0 })

export function formatNumber(
  value: Nullable,
  { fallback = DASH }: Options = {},
): string {
  if (value === null || value === undefined) return fallback
  return Number.isInteger(value)
    ? integer().format(value)
    : decimal().format(value)
}

/** Score (0–100) — one decimal place. */
export function formatScore(
  value: Nullable,
  { fallback = DASH }: Options = {},
): string {
  if (value === null || value === undefined) return fallback
  return decimal().format(value)
}

/** Percentage: `34.5` → `34.5%`. */
export function formatPercent(
  value: Nullable,
  { fallback = DASH }: Options = {},
): string {
  if (value === null || value === undefined) return fallback
  return `${decimal().format(value)}%`
}

/** Point delta (`*_points`) — a `%` sign is NEVER appended (docs/05). */
export function formatPoints(
  value: Nullable,
  { fallback = DASH }: Options = {},
): string {
  if (value === null || value === undefined) return fallback
  const sign = value > 0 ? '+' : ''
  return `${sign}${decimal().format(value)}`
}

/** Percentage change (`*_percent`) — signed. */
export function formatDelta(
  value: Nullable,
  { fallback = DASH }: Options = {},
): string {
  if (value === null || value === undefined) return fallback
  const sign = value > 0 ? '+' : ''
  return `${sign}${decimal().format(value)}%`
}

/** Money: `184000000` + `UZS` → `184 000 000 UZS`. */
export function formatMoney(
  value: Nullable,
  currency: string | null | undefined,
  { fallback = DASH }: Options = {},
): string {
  if (value === null || value === undefined) return fallback
  return `${integer().format(value)}${currency ? ` ${currency}` : ''}`
}

/** The backend returns `price` as a decimal STRING — parse it deliberately. */
export function parseDecimal(value: string | null | undefined): number | null {
  if (value === null || value === undefined || value === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

/** An empty string counts as absent — the backend mixes `""` and `null`. */
export function orDash(value: string | null | undefined): string {
  return value && value.trim() ? value : DASH
}

/** Avatar initials from a name. */
export function initials(name: string | null | undefined): string {
  if (!name?.trim()) return '?'
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

/** Truncates long text (the full value goes in a tooltip). */
export function truncate(value: string, max: number): string {
  return value.length <= max ? value : `${value.slice(0, max - 1)}…`
}

export { DASH }
