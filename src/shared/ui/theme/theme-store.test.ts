import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { applyTheme, resolveTheme } from './theme-store'

function mockPrefersDark(dark: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockReturnValue({
      matches: dark,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
  )
}

beforeEach(() => localStorage.clear())
afterEach(() => vi.unstubAllGlobals())

describe('resolveTheme', () => {
  it('honours an explicit choice over the OS setting', () => {
    // An explicit preference must win in BOTH directions — a user on a dark OS
    // who picks light gets light.
    mockPrefersDark(true)
    expect(resolveTheme('light')).toBe('light')

    mockPrefersDark(false)
    expect(resolveTheme('dark')).toBe('dark')
  })

  it('follows the OS setting under "system"', () => {
    mockPrefersDark(true)
    expect(resolveTheme('system')).toBe('dark')

    mockPrefersDark(false)
    expect(resolveTheme('system')).toBe('light')
  })
})

describe('applyTheme', () => {
  it('writes the resolved theme onto the root element', () => {
    mockPrefersDark(true)
    applyTheme('system')
    expect(document.documentElement.dataset.theme).toBe('dark')

    applyTheme('light')
    expect(document.documentElement.dataset.theme).toBe('light')
  })
})
