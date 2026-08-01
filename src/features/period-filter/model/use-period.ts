import { endOfDay, startOfDay, startOfMonth, subDays } from 'date-fns'
import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

import type { PeriodParams } from '@/shared/api'
import type { MessageKey } from '@/shared/i18n'
import { toApiDate, toApiDateTime } from '@/shared/lib'

export type PeriodPreset = '7d' | '30d' | '90d' | 'month' | 'custom'

export interface PeriodRange {
  from: Date
  to: Date
}

export interface PeriodState {
  preset: PeriodPreset
  range: PeriodRange
  /** Manager-validated outcomes only. Narrows coverage, not the values. */
  confirmed: boolean
  /** The shape passed to the API — every widget receives THIS object. */
  params: PeriodParams
  setPreset: (preset: Exclude<PeriodPreset, 'custom'>) => void
  setRange: (range: PeriodRange) => void
  setConfirmed: (confirmed: boolean) => void
}

export const PERIOD_PRESETS: {
  value: Exclude<PeriodPreset, 'custom'>
  labelKey: MessageKey
}[] = [
  { value: '7d', labelKey: 'period.7d' },
  { value: '30d', labelKey: 'period.30d' },
  { value: '90d', labelKey: 'period.90d' },
  { value: 'month', labelKey: 'period.month' },
]

const DEFAULT_PRESET = '30d' satisfies Exclude<PeriodPreset, 'custom'>

function presetRange(preset: Exclude<PeriodPreset, 'custom'>): PeriodRange {
  const now = new Date()
  if (preset === 'month') {
    return { from: startOfMonth(now), to: now }
  }
  const days = preset === '7d' ? 7 : preset === '90d' ? 90 : 30
  return { from: startOfDay(subDays(now, days - 1)), to: now }
}

function isPreset(
  value: string | null,
): value is Exclude<PeriodPreset, 'custom'> {
  return PERIOD_PRESETS.some((preset) => preset.value === value)
}

function parseDate(value: string | null): Date | null {
  if (!value) return null
  const parsed = new Date(`${value}T00:00:00`)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

/**
 * The period filter — it lives in the URL.
 *
 * Why: every widget on a screen must use EXACTLY the same window (docs/05
 * "Frontend notes" calls mismatched windows the most common bug here), and a
 * shared link then carries the filter with it.
 */
export function usePeriod(): PeriodState {
  const [searchParams, setSearchParams] = useSearchParams()

  // Only the RAW STRINGS from the URL are used as dependencies: `Date` objects
  // would be new on every render and make the memo pointless.
  const rawPreset = searchParams.get('preset')
  const fromParam = searchParams.get('from')
  const toParam = searchParams.get('to')
  const confirmed = searchParams.get('confirmed') === '1'

  const { preset, range } = useMemo(() => {
    const from = parseDate(fromParam)
    const to = parseDate(toParam)

    if (from && to) {
      return {
        preset: 'custom' as PeriodPreset,
        range: { from: startOfDay(from), to: endOfDay(to) },
      }
    }

    const resolved = isPreset(rawPreset) ? rawPreset : DEFAULT_PRESET
    return { preset: resolved as PeriodPreset, range: presetRange(resolved) }
  }, [fromParam, toParam, rawPreset])

  const params = useMemo<PeriodParams>(
    () => ({
      date_from: toApiDateTime(range.from),
      date_to: toApiDateTime(range.to),
      ...(confirmed ? { confirmed: true } : {}),
    }),
    [range, confirmed],
  )

  const update = useCallback(
    (mutate: (next: URLSearchParams) => void) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current)
          mutate(next)
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  return {
    preset,
    range,
    confirmed,
    params,
    setPreset: useCallback(
      (value) =>
        update((next) => {
          next.set('preset', value)
          next.delete('from')
          next.delete('to')
        }),
      [update],
    ),
    setRange: useCallback(
      ({ from, to }) =>
        update((next) => {
          next.set('from', toApiDate(from))
          next.set('to', toApiDate(to))
          next.delete('preset')
        }),
      [update],
    ),
    setConfirmed: useCallback(
      (value) =>
        update((next) => {
          if (value) next.set('confirmed', '1')
          else next.delete('confirmed')
        }),
      [update],
    ),
  }
}
