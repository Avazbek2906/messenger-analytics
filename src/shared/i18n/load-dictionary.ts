import { DEFAULT_LOCALE, type Locale } from './config'
import { uz, type Messages } from './locales/uz'

/**
 * Dictionary loading.
 *
 * All three dictionaries together weigh ~43 kB gzipped and only one is ever
 * used, so the non-default ones are code-split. The default locale stays
 * statically imported: it is what most users get, and for them there is no
 * extra request and no loading state at all.
 */

const loaded = new Map<Locale, Messages>([[DEFAULT_LOCALE, uz]])

const loaders: Partial<Record<Locale, () => Promise<Messages>>> = {
  ru: () => import('./locales/ru').then((module) => module.ru),
  en: () => import('./locales/en').then((module) => module.en),
}

/** Returns the dictionary synchronously when it is already in memory. */
export function peekDictionary(locale: Locale): Messages | null {
  return loaded.get(locale) ?? null
}

export async function loadDictionary(locale: Locale): Promise<Messages> {
  const cached = loaded.get(locale)
  if (cached) return cached

  const loader = loaders[locale]
  // Unreachable in practice: the default locale is pre-seeded in `loaded`.
  if (!loader) return uz

  const dictionary = await loader()
  loaded.set(locale, dictionary)
  return dictionary
}
