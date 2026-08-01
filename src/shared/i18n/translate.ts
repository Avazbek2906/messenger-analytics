import { LOCALE_TAGS, type Locale } from './config'

/**
 * Plural forms of a message.
 *
 * Categories come from `Intl.PluralRules`, which matters for Russian: it has
 * `one` / `few` / `many` (1, 2–4, 5+), and a hand-written `count === 1` check
 * would pick the wrong form.
 */
export type PluralForms = { other: string } & Partial<
  Record<Intl.LDMLPluralRule, string>
>

export type Message = string | PluralForms

export type TranslateParams = Record<string, string | number>

const pluralRulesCache = new Map<Locale, Intl.PluralRules>()

function pluralRules(locale: Locale): Intl.PluralRules {
  let rules = pluralRulesCache.get(locale)
  if (!rules) {
    rules = new Intl.PluralRules(LOCALE_TAGS[locale])
    pluralRulesCache.set(locale, rules)
  }
  return rules
}

function selectForm(
  message: Message,
  locale: Locale,
  params?: TranslateParams,
): string {
  if (typeof message === 'string') return message

  const count = params?.count
  if (typeof count !== 'number') return message.other

  const category = pluralRules(locale).select(count)
  return message[category] ?? message.other
}

/** Fills `{name}` placeholders. */
function interpolate(template: string, params?: TranslateParams): string {
  if (!params) return template

  return template.replaceAll(/\{(\w+)\}/g, (match, key: string) => {
    const value = params[key]
    return value === undefined ? match : String(value)
  })
}

export function formatMessage(
  message: Message | undefined,
  locale: Locale,
  fallbackKey: string,
  params?: TranslateParams,
): string {
  // A missing key returns the key itself: visible enough not to hide the bug,
  // harmless enough not to break the app.
  if (message === undefined) return fallbackKey

  return interpolate(selectForm(message, locale, params), params)
}
