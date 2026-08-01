export {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_NAMES,
  LOCALE_TAGS,
  detectLocale,
  isLocale,
} from './config'
export type { Locale } from './config'
export { I18nProvider } from './i18n-provider'
export type {
  I18nContextValue,
  TranslateDynamicFn,
  TranslateFn,
} from './i18n-provider'
export type { MessageKey } from './locales/uz'
export type { TranslateParams } from './translate'
export { useTranslation } from './use-translation'
