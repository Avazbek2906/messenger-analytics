import { Monitor, Moon, Sun } from 'lucide-react'
import { useEffect } from 'react'

import { useTranslation, type MessageKey } from '@/shared/i18n'
import { Segmented } from '@/shared/ui/primitives/segmented'

import { applyTheme, useThemeStore, type ThemePreference } from './theme-store'

const OPTIONS = [
  { value: 'light', labelKey: 'theme.light', icon: Sun },
  { value: 'dark', labelKey: 'theme.dark', icon: Moon },
  { value: 'system', labelKey: 'theme.system', icon: Monitor },
] as const satisfies readonly {
  value: ThemePreference
  labelKey: MessageKey
  icon: typeof Sun
}[]

/**
 * Applies the stored theme and keeps `system` in sync with the OS.
 *
 * Mounted once at the app root: without the listener a user who flips their OS
 * theme while the tab is open would stay on the old one.
 */
export function ThemeEffect() {
  const preference = useThemeStore((state) => state.preference)

  useEffect(() => {
    applyTheme(preference)
    if (preference !== 'system') return

    const media = globalThis.matchMedia('(prefers-color-scheme: dark)')
    const sync = () => applyTheme('system')
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [preference])

  return null
}

export function ThemeToggle() {
  const { t } = useTranslation()
  const preference = useThemeStore((state) => state.preference)
  const setPreference = useThemeStore((state) => state.setPreference)

  return (
    <Segmented
      aria-label={t('theme.label')}
      size="sm"
      value={preference}
      onChange={setPreference}
      options={OPTIONS.map((option) => ({
        value: option.value,
        // Icon-only: the label lives in `ariaLabel` and the tooltip-free chip
        // stays compact inside the profile menu.
        ariaLabel: t(option.labelKey),
        label: <option.icon className="size-4" aria-hidden />,
      }))}
    />
  )
}
