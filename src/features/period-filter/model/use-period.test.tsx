import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { usePeriod } from './use-period'

function wrapper(initialEntry: string) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <MemoryRouter initialEntries={[initialEntry]}>{children}</MemoryRouter>
    )
  }
}

function renderPeriod(search: string) {
  return renderHook(() => usePeriod(), { wrapper: wrapper(`/${search}`) })
}

describe('usePeriod', () => {
  it('defaults to a 30-day window', () => {
    const { result } = renderPeriod('')

    expect(result.current.preset).toBe('30d')
    expect(result.current.confirmed).toBe(false)
    expect(result.current.params.date_from).toBeDefined()
    // When `confirmed` is off the param is not sent AT ALL — otherwise it
    // would change the cache key for nothing.
    expect(result.current.params.confirmed).toBeUndefined()
  })

  it('reads the preset from the URL', () => {
    const { result } = renderPeriod('?preset=7d')

    expect(result.current.preset).toBe('7d')
  })

  it('falls back to the default on an unknown preset', () => {
    const { result } = renderPeriod('?preset=xatolik')

    expect(result.current.preset).toBe('30d')
  })

  it('switches to a custom range when from + to are present', () => {
    const { result } = renderPeriod('?from=2026-07-01&to=2026-07-15')

    expect(result.current.preset).toBe('custom')
    // Start of day to end of day — an inclusive window.
    expect(result.current.range.from.getHours()).toBe(0)
    expect(result.current.range.to.getHours()).toBe(23)
  })

  it('turns confirmed=1 into a request param', () => {
    const { result } = renderPeriod('?confirmed=1')

    expect(result.current.confirmed).toBe(true)
    expect(result.current.params.confirmed).toBe(true)
  })

  it('keeps the params reference stable for the same URL', () => {
    const { result, rerender } = renderPeriod('?preset=7d')
    const first = result.current.params

    rerender()

    // Reference stability matters: `params` is part of the query key, and a
    // fresh object per render would make TanStack Query refetch forever.
    expect(result.current.params).toBe(first)
  })
})
