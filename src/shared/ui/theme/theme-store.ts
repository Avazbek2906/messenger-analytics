import { create } from 'zustand'

export type ThemePreference = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'ma.theme'

interface ThemeState {
  preference: ThemePreference
  setPreference: (preference: ThemePreference) => void
}

function read(): ThemePreference {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored
    }
  } catch {
    /* private mode */
  }
  return 'system'
}

/** Resolves `system` against the OS setting. */
export function resolveTheme(preference: ThemePreference): 'light' | 'dark' {
  if (preference !== 'system') return preference
  return globalThis.matchMedia?.('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

/**
 * Writes the resolved theme onto the root element.
 *
 * A `data-theme` attribute rather than a media query alone, so an explicit
 * choice can override the OS setting in both directions.
 */
export function applyTheme(preference: ThemePreference): void {
  document.documentElement.dataset.theme = resolveTheme(preference)
}

export const useThemeStore = create<ThemeState>((set) => ({
  preference: read(),
  setPreference: (preference) => {
    try {
      localStorage.setItem(STORAGE_KEY, preference)
    } catch {
      /* private mode */
    }
    applyTheme(preference)
    set({ preference })
  },
}))
