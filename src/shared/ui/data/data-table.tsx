import type { ReactNode } from 'react'

import { cn } from '@/shared/lib'
import { Skeleton } from '@/shared/ui/primitives/skeleton'

export interface Column<T> {
  key: string
  header: ReactNode
  cell: (row: T) => ReactNode
  /** Numeric columns are right-aligned and get tabular figures. */
  numeric?: boolean
  /** Secondary columns hidden on narrow screens. */
  hideBelow?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  headerClassName?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  rows: T[]
  getRowKey: (row: T) => string
  /** Row click — usually navigation to the detail page. */
  onRowClick?: (row: T) => void
  isLoading?: boolean
  skeletonRows?: number
  caption?: string
}

const HIDE_CLASSES = {
  sm: 'hidden sm:table-cell',
  md: 'hidden md:table-cell',
  lg: 'hidden lg:table-cell',
  xl: 'hidden xl:table-cell',
} as const

/**
 * Data table.
 *
 * One implementation so every list looks the same and behaves the same under
 * the keyboard. A clickable row gets real button semantics (`tabIndex` +
 * `Enter`), not just a `tr` with an `onClick` bolted on.
 */
export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  onRowClick,
  isLoading,
  skeletonRows = 8,
  caption,
}: DataTableProps<T>) {
  return (
    <div className="scrollbar-slim w-full overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        {caption ? <caption className="sr-only">{caption}</caption> : null}

        <thead>
          <tr className="border-b border-line">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn(
                  'px-4 py-2.5 text-left text-xs font-medium whitespace-nowrap text-fg-muted',
                  column.numeric && 'text-right',
                  column.hideBelow && HIDE_CLASSES[column.hideBelow],
                  column.headerClassName,
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {isLoading
            ? Array.from({ length: skeletonRows }, (_, index) => (
                <tr key={index} className="border-b border-line last:border-0">
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn(
                        'px-4 py-3.5',
                        column.hideBelow && HIDE_CLASSES[column.hideBelow],
                      )}
                    >
                      <Skeleton className="h-4 w-full max-w-28" />
                    </td>
                  ))}
                </tr>
              ))
            : rows.map((row) => (
                <tr
                  key={getRowKey(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  onKeyDown={
                    onRowClick
                      ? (event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault()
                            onRowClick(row)
                          }
                        }
                      : undefined
                  }
                  tabIndex={onRowClick ? 0 : undefined}
                  role={onRowClick ? 'button' : undefined}
                  className={cn(
                    'border-b border-line last:border-0',
                    onRowClick &&
                      'cursor-pointer transition-colors hover:bg-surface-muted focus-visible:bg-surface-muted',
                  )}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      data-numeric={column.numeric ? '' : undefined}
                      className={cn(
                        'px-4 py-3.5 align-middle',
                        column.numeric && 'text-right',
                        column.hideBelow && HIDE_CLASSES[column.hideBelow],
                        column.className,
                      )}
                    >
                      {column.cell(row)}
                    </td>
                  ))}
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  )
}
