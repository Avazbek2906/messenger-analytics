import type { UseQueryResult } from '@tanstack/react-query'
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderWithProviders } from '@/test/render'

import { QueryBoundary } from './query-boundary'

type Rows = { id: string }[]

/** Only the fields `QueryBoundary` reads — the rest of the result is noise. */
function result(patch: Partial<UseQueryResult<Rows>>): UseQueryResult<Rows> {
  return {
    isPending: false,
    isError: false,
    isPlaceholderData: false,
    data: [{ id: 'a' }],
    ...patch,
  } as UseQueryResult<Rows>
}

function boundary(query: UseQueryResult<Rows>) {
  return (
    <QueryBoundary query={query} loading={<p>skeleton</p>}>
      {(rows) => <p>rows: {rows.length}</p>}
    </QueryBoundary>
  )
}

describe('QueryBoundary', () => {
  it('shows the skeleton only on a first load', () => {
    renderWithProviders(boundary(result({ isPending: true, data: undefined })))

    expect(screen.getByText('skeleton')).toBeInTheDocument()
  })

  it('holds and dims the previous data while a new filter loads', async () => {
    // The whole point: a filter change must NOT drop the page back to
    // skeletons. The old numbers stay, marked busy for screen readers.
    renderWithProviders(boundary(result({ isPlaceholderData: true })))

    const rows = await screen.findByText('rows: 1')
    expect(rows.parentElement).toHaveAttribute('aria-busy', 'true')
  })

  it('does not dim a settled result', async () => {
    renderWithProviders(boundary(result({})))

    const rows = await screen.findByText('rows: 1')
    expect(rows.parentElement).not.toHaveAttribute('aria-busy')
  })

  it('renders the empty state instead of the children', () => {
    renderWithProviders(
      <QueryBoundary
        query={result({ data: [] })}
        loading={<p>skeleton</p>}
        empty={<p>nothing here</p>}
      >
        {(rows) => <p>rows: {rows.length}</p>}
      </QueryBoundary>,
    )

    expect(screen.getByText('nothing here')).toBeInTheDocument()
    expect(screen.queryByText('rows: 0')).toBeNull()
  })
})
