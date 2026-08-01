import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { useConversationFilters } from './use-conversation-filters'

function renderFilters(search = '') {
  return renderHook(() => useConversationFilters(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <MemoryRouter initialEntries={[`/conversations${search}`]}>
        {children}
      </MemoryRouter>
    ),
  })
}

describe('useConversationFilters', () => {
  it('sends only pagination for an empty URL', () => {
    const { result } = renderFilters()

    expect(result.current.params).toEqual({ limit: 25, offset: 0 })
    expect(result.current.activeCount).toBe(0)
  })

  it('coerces boolean and numeric filters to the right type', () => {
    const { result } = renderFilters('?unassigned=true&score_min=50')

    // The backend expects `?unassigned=true`, but our type is boolean —
    // sending it as a string risks DRF interpreting it wrongly.
    expect(result.current.params.unassigned).toBe(true)
    expect(result.current.params.score_min).toBe(50)
  })

  it('omits a param with an empty value entirely', () => {
    const { result } = renderFilters('?search=&outcome=sotildi')

    expect(result.current.params.search).toBeUndefined()
    expect(result.current.params.outcome).toBe('sotildi')
    expect(result.current.activeCount).toBe(1)
  })

  it('resets to the first page when a filter changes', () => {
    const { result } = renderFilters('?offset=50')
    expect(result.current.offset).toBe(50)

    act(() => result.current.set('outcome', 'sotilmadi'))

    // Otherwise the user would land on a page that no longer exists.
    expect(result.current.offset).toBe(0)
    expect(result.current.params.outcome).toBe('sotilmadi')
  })

  it('clear() removes every filter', () => {
    const { result } = renderFilters(
      '?outcome=sotildi&unassigned=true&offset=25',
    )

    act(() => result.current.clear())

    expect(result.current.activeCount).toBe(0)
    expect(result.current.params).toEqual({ limit: 25, offset: 0 })
  })

  it('a null value removes the filter', () => {
    const { result } = renderFilters('?employee=abc')

    act(() => result.current.set('employee', null))

    expect(result.current.params.employee).toBeUndefined()
  })
})
