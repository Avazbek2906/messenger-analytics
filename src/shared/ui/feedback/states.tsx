import { AlertTriangle, Inbox, Lock, RefreshCw } from 'lucide-react'
import type { ReactNode } from 'react'

import { ApiError } from '@/shared/api'
import { useTranslation, type TranslateFn } from '@/shared/i18n'
import { cn } from '@/shared/lib'
import { Button } from '@/shared/ui/primitives/button'

interface StateShellProps {
  icon: ReactNode
  title: string
  description?: ReactNode
  action?: ReactNode
  tone?: 'neutral' | 'danger'
  className?: string
  compact?: boolean
}

function StateShell({
  icon,
  title,
  description,
  action,
  tone = 'neutral',
  className,
  compact,
}: StateShellProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        compact ? 'gap-2 px-4 py-8' : 'gap-3 px-6 py-14',
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          'flex items-center justify-center rounded-full',
          compact ? 'size-10 [&_svg]:size-5' : 'size-12 [&_svg]:size-6',
          tone === 'danger'
            ? 'bg-danger-soft text-danger'
            : 'bg-surface-sunken text-fg-subtle',
        )}
      >
        {icon}
      </span>
      <div className="space-y-1">
        <p className="text-sm font-medium text-fg">{title}</p>
        {description ? (
          <p className="mx-auto max-w-sm text-[13px] leading-5 text-fg-muted">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  )
}

/* ------------------------------------------------------------ Empty state */

interface EmptyStateProps {
  title?: string
  description?: ReactNode
  action?: ReactNode
  icon?: ReactNode
  compact?: boolean
  className?: string
}

export function EmptyState({
  title,
  description,
  action,
  icon,
  compact,
  className,
}: EmptyStateProps) {
  const { t } = useTranslation()

  return (
    <StateShell
      icon={icon ?? <Inbox />}
      title={title ?? t('common.noData')}
      description={description}
      action={action}
      compact={compact}
      className={className}
    />
  )
}

/* ------------------------------------------------------------ Error state */

interface ErrorStateProps {
  error: unknown
  onRetry?: () => void
  compact?: boolean
  className?: string
}

/**
 * Error state.
 *
 * The message is chosen by `ApiError.code`, never by the `detail` text. On a
 * 500 the `detail` is deliberately not surfaced to the user (docs/01 §8).
 */
export function ErrorState({
  error,
  onRetry,
  compact,
  className,
}: ErrorStateProps) {
  const { t } = useTranslation()
  const { title, description, retryable, icon } = describeError(error, t)

  return (
    <StateShell
      tone="danger"
      icon={icon}
      title={title}
      description={description}
      compact={compact}
      className={className}
      action={
        retryable && onRetry ? (
          <Button size="sm" icon={<RefreshCw />} onClick={onRetry}>
            {t('common.retry')}
          </Button>
        ) : null
      }
    />
  )
}

interface ErrorDescription {
  title: string
  description: string
  retryable: boolean
  icon: ReactNode
}

export function describeError(
  error: unknown,
  t: TranslateFn,
): ErrorDescription {
  if (error instanceof ApiError) {
    if (error.type === 'network_error') {
      return {
        title: t('error.network.title'),
        description: t('error.network.description'),
        retryable: true,
        icon: <AlertTriangle />,
      }
    }
    if (error.isMissingCompany) {
      return {
        title: t('error.noCompany.title'),
        description: t('error.noCompany.description'),
        retryable: false,
        icon: <Lock />,
      }
    }
    if (error.isForbidden) {
      return {
        title: t('error.forbidden.title'),
        description: t('error.forbidden.description'),
        retryable: false,
        icon: <Lock />,
      }
    }
    if (error.isNotFound) {
      return {
        title: t('error.notFound.title'),
        description: t('error.notFound.description'),
        retryable: false,
        icon: <AlertTriangle />,
      }
    }
    if (error.type === 'server_error') {
      return {
        title: t('error.server.title'),
        description: t('error.server.description'),
        retryable: true,
        icon: <AlertTriangle />,
      }
    }
    return {
      title: t('error.request.title'),
      // A validation error's `detail` comes from the server untranslated — it
      // names the exact field, which beats a generic message.
      description: error.errors[0]?.detail ?? t('error.unknown.detail'),
      retryable: true,
      icon: <AlertTriangle />,
    }
  }

  return {
    title: t('error.unexpected.title'),
    description: t('error.unexpected.description'),
    retryable: true,
    icon: <AlertTriangle />,
  }
}
