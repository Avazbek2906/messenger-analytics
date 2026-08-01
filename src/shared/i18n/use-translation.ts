import { useContext } from 'react'

import { I18nContext, type I18nContextValue } from './i18n-provider'

/**
 * Translation hook.
 *
 * `const { t } = useTranslation()` → `t('kpi.conversations')`.
 * Keys are checked against the `MessageKey` type, so a typo is caught at
 * compile time.
 */
export function useTranslation(): I18nContextValue {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useTranslation I18nProvider ichida chaqirilishi kerak')
  }
  return context
}
