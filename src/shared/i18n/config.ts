/** Supported locales. */
export const LOCALES = ['uz', 'ru', 'en'] as const

export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'uz'

export const LOCALE_STORAGE_KEY = 'ma.locale'

/** Names in the language switcher — always written in their own language. */
export const LOCALE_NAMES: Record<Locale, string> = {
  uz: "O'zbekcha",
  ru: 'Русский',
  en: 'English',
}

/** BCP-47 tags for `Intl` and `<html lang>`. */
export const LOCALE_TAGS: Record<Locale, string> = {
  uz: 'uz-UZ',
  ru: 'ru-RU',
  en: 'en-US',
}

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && LOCALES.includes(value as Locale)
}

/**
 * Resolves the initial locale: stored choice → browser language → default.
 * If the browser reports a full tag like `ru-RU`, the language part is used.
 */
export function detectLocale(): Locale {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY)
    if (isLocale(stored)) return stored
  } catch {
    /* private mode */
  }

  for (const language of navigator.languages ?? []) {
    const base = language.split('-')[0]
    if (isLocale(base)) return base
  }

  return DEFAULT_LOCALE
}
