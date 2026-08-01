import type { Locale as DateFnsLocale } from 'date-fns'
import { enUS, ru, uz } from 'date-fns/locale'

/**
 * The active locale used for formatting.
 *
 * It lives at module level so `formatNumber` / `formatDate` do not have to take
 * a locale argument at every call site. The locale is set once at the app root
 * (`I18nProvider`); when it changes the tree is remounted, so no stale
 * formatting is ever left on screen.
 */

type SupportedLocale = 'uz' | 'ru' | 'en'

const TAGS: Record<SupportedLocale, string> = {
  uz: 'uz-UZ',
  ru: 'ru-RU',
  en: 'en-US',
}

const DATE_LOCALES: Record<SupportedLocale, DateFnsLocale> = {
  uz,
  ru,
  en: enUS,
}

let active: SupportedLocale = 'uz'

export function setActiveLocale(locale: SupportedLocale): void {
  active = locale
}

export function activeTag(): string {
  return TAGS[active]
}

export function activeDateLocale(): DateFnsLocale {
  return DATE_LOCALES[active]
}

/**
 * Reuses `Intl.NumberFormat` instances — constructing them is expensive and
 * these helpers run hundreds of times per table render.
 */
const numberFormatCache = new Map<string, Intl.NumberFormat>()

export function numberFormat(
  options: Intl.NumberFormatOptions,
): Intl.NumberFormat {
  const tag = activeTag()
  const key = `${tag}|${options.maximumFractionDigits ?? ''}|${options.minimumFractionDigits ?? ''}`

  let formatter = numberFormatCache.get(key)
  if (!formatter) {
    formatter = new Intl.NumberFormat(tag, options)
    numberFormatCache.set(key, formatter)
  }
  return formatter
}
