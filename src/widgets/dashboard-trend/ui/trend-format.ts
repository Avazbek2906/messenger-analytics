import { format } from 'date-fns'

import type { Granularity } from '@/entities/dashboard'
import type { TranslateFn } from '@/shared/i18n'
import { parseApiDate } from '@/shared/lib'
import { activeDateLocale } from '@/shared/lib/locale-runtime'

/** Bucket date (`YYYY-MM-DD`) → axis tick label. */
export function formatTick(value: string): string {
  const date = parseApiDate(`${value} 00:00:00`)
  return date ? format(date, 'd MMM', { locale: activeDateLocale() }) : value
}

export function formatTooltipTitle(
  value: string,
  granularity: Granularity,
  t: TranslateFn,
): string {
  const date = parseApiDate(`${value} 00:00:00`)
  if (!date) return value

  const label = format(date, 'd MMMM yyyy', { locale: activeDateLocale() })
  return granularity === 'week'
    ? t('trend.tooltip.weekOf', { date: label })
    : label
}
