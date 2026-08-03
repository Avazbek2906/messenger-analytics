import { Check, Copy } from 'lucide-react'

import { useCopyToClipboard } from '@/shared/hooks/use-copy-to-clipboard'
import { useTranslation } from '@/shared/i18n'
import { cn } from '@/shared/lib'

import { Button } from '../primitives/button'

interface SecretFieldProps {
  value: string
  /** Rendered above the value; omit for a bare row. */
  label?: string
  copyLabel: string
  className?: string
}

/**
 * A value shown exactly once — a widget key, a generated password.
 *
 * Monospaced and wrapping rather than truncated: a secret the user cannot read
 * in full is a secret they will mistype, and there is no route to fetch it
 * again.
 */
export function SecretField({
  value,
  label,
  copyLabel,
  className,
}: SecretFieldProps) {
  const { t } = useTranslation()
  const { copied, copy } = useCopyToClipboard()

  return (
    <div className={className}>
      {label ? (
        <span className="mb-1 block text-xs font-medium text-fg-muted">
          {label}
        </span>
      ) : null}
      <div className="flex items-center gap-2 rounded-lg bg-surface-sunken px-3 py-2.5">
        <code
          className={cn(
            'min-w-0 flex-1 font-mono text-[13px] break-all text-fg',
            'select-all',
          )}
        >
          {value}
        </code>
        <Button
          size="icon-sm"
          variant="ghost"
          aria-label={copied ? t('common.copied') : copyLabel}
          onClick={() => copy(value)}
        >
          {copied ? <Check className="text-success" /> : <Copy />}
        </Button>
      </div>
    </div>
  )
}
