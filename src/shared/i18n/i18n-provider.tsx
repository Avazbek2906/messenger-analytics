import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import { setActiveLocale } from '@/shared/lib/locale-runtime'

import {
  detectLocale,
  LOCALE_STORAGE_KEY,
  LOCALE_TAGS,
  type Locale,
} from './config'
import { loadDictionary, peekDictionary } from './load-dictionary'
import type { MessageKey, Messages } from './locales/uz'
import { formatMessage, type TranslateParams } from './translate'

export type TranslateFn = (key: MessageKey, params?: TranslateParams) => string

/**
 * For text whose key is only known at runtime.
 *
 * The backend returns keys that vary with the prompt version (`sub_scores`,
 * `rule_violations`), so they cannot be enumerated in a type. When no
 * translation exists, `fallback` is used.
 */
export type TranslateDynamicFn = (
  key: string,
  fallback: string,
  params?: TranslateParams,
) => string

export interface I18nContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: TranslateFn
  tDynamic: TranslateDynamicFn
}

export const I18nContext = createContext<I18nContextValue | null>(null)

/**
 * The i18n provider.
 *
 * Non-default dictionaries are code-split, so a locale may still be loading on
 * first paint — `fallback` covers that gap rather than flashing the wrong
 * language.
 *
 * When the locale changes the subtree is remounted via `key`: number and date
 * formatting reads a module-level active locale, and a plain re-render would
 * not refresh it.
 */
export function I18nProvider({
  children,
  fallback = null,
}: {
  children: ReactNode
  /** Rendered while a code-split dictionary is still in flight. */
  fallback?: ReactNode
}) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const initial = detectLocale()
    setActiveLocale(initial)
    return initial
  })
  const [dictionary, setDictionary] = useState<Messages | null>(() =>
    peekDictionary(locale),
  )

  useEffect(() => {
    setActiveLocale(locale)
    document.documentElement.lang = LOCALE_TAGS[locale]

    const cached = peekDictionary(locale)
    if (cached) {
      setDictionary(cached)
      return
    }

    let active = true
    setDictionary(null)
    void loadDictionary(locale).then((loaded) => {
      if (active) setDictionary(loaded)
    })
    return () => {
      active = false
    }
  }, [locale])

  const setLocale = useCallback((next: Locale) => {
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, next)
    } catch {
      /* private mode — the choice lives only for this session */
    }
    setLocaleState(next)
  }, [])

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      t: (key, params) => formatMessage(dictionary?.[key], locale, key, params),
      tDynamic: (key, fallbackText, params) => {
        const message = dictionary?.[key as MessageKey]
        return message === undefined
          ? fallbackText
          : formatMessage(message, locale, fallbackText, params)
      },
    }),
    [dictionary, locale, setLocale],
  )

  return (
    <I18nContext.Provider value={value}>
      {dictionary === null ? (
        fallback
      ) : (
        <div key={locale} className="contents">
          {children}
        </div>
      )}
    </I18nContext.Provider>
  )
}
