import type { ReactNode } from 'react'

import { cn } from '@/shared/lib'

interface PageHeaderProps {
  title: string
  description?: ReactNode
  /** Breadcrumb or back link, rendered above the title. */
  eyebrow?: ReactNode
  /** Controls on the right: period filter, export, "add". */
  actions?: ReactNode
  /** Extra context below the description — metrics, chips. */
  children?: ReactNode
  className?: string
}

/** One header block for every page. */
export function PageHeader({
  title,
  description,
  eyebrow,
  actions,
  children,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        'mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between',
        className,
      )}
    >
      <div className="min-w-0 space-y-1">
        {eyebrow}
        <h1 className="truncate text-xl leading-8 font-semibold tracking-tight text-fg">
          {title}
        </h1>
        {description ? (
          <div className="max-w-2xl text-sm leading-6 text-fg-muted">
            {description}
          </div>
        ) : null}
        {children}
      </div>

      {actions ? (
        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          {actions}
        </div>
      ) : null}
    </header>
  )
}
