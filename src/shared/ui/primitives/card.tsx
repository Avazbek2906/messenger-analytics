import type { ComponentPropsWithoutRef, ReactNode } from 'react'

import { cn } from '@/shared/lib'

/**
 * Card — the primary surface of the design system.
 * From the reference: pure white, large radius, hairline ring, very soft shadow.
 */
export function Card({
  className,
  ...props
}: ComponentPropsWithoutRef<'section'>) {
  return (
    <section
      className={cn(
        'rounded-xl bg-surface shadow-card ring-1 ring-line ring-inset',
        className,
      )}
      {...props}
    />
  )
}

interface CardHeaderProps extends Omit<
  ComponentPropsWithoutRef<'header'>,
  'title'
> {
  title: ReactNode
  description?: ReactNode
  /** Controls on the right: filter, menu, a "see all" link. */
  actions?: ReactNode
}

export function CardHeader({
  title,
  description,
  actions,
  className,
  children,
  ...props
}: CardHeaderProps) {
  return (
    <header
      className={cn(
        'flex items-start justify-between gap-4 px-5 pt-5 pb-4',
        className,
      )}
      {...props}
    >
      <div className="min-w-0 space-y-0.5">
        <h2 className="truncate text-[15px] leading-6 font-semibold text-fg">
          {title}
        </h2>
        {description ? (
          <p className="text-[13px] leading-5 text-fg-muted">{description}</p>
        ) : null}
        {children}
      </div>
      {actions ? (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      ) : null}
    </header>
  )
}

export function CardBody({
  className,
  ...props
}: ComponentPropsWithoutRef<'div'>) {
  return <div className={cn('px-5 pb-5', className)} {...props} />
}

export function CardFooter({
  className,
  ...props
}: ComponentPropsWithoutRef<'footer'>) {
  return (
    <footer
      className={cn(
        'flex items-center justify-between gap-3 border-t border-line px-5 py-3.5',
        className,
      )}
      {...props}
    />
  )
}

/** Inset block — the "card inside a card" pattern from the reference. */
export function CardInset({
  className,
  ...props
}: ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      className={cn('rounded-lg bg-surface-muted ring-1 ring-line', className)}
      {...props}
    />
  )
}
