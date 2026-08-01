import { AlertTriangle } from 'lucide-react'

import { useTranslation } from '@/shared/i18n'
import { Field, Input } from '@/shared/ui/primitives/input'

interface RetentionFieldProps {
  value: string
  /** The value currently stored, used to detect a *lowering* of the window. */
  current: number | null
  disabled: boolean
  onChange: (value: string) => void
}

/**
 * Data retention in months.
 *
 * This is a destructive setting: the weekly sweep purges conversations,
 * messages and their analysis older than the window, irreversibly. Lowering it
 * therefore gets an explicit inline warning rather than a silent save
 * (docs/02).
 */
export function RetentionField({
  value,
  current,
  disabled,
  onChange,
}: RetentionFieldProps) {
  const { t } = useTranslation()

  const next = value === '' ? null : Number(value)
  const lowered =
    next !== null &&
    Number.isFinite(next) &&
    (current === null || next < current)

  return (
    <Field
      label={t('settings.retention')}
      hint={t('settings.retentionHint')}
      className="sm:col-span-2"
    >
      {(field) => (
        <div className="space-y-2">
          <Input
            {...field}
            type="number"
            min={1}
            inputMode="numeric"
            value={value}
            disabled={disabled}
            placeholder={t('settings.retentionForever')}
            onChange={(event) => onChange(event.target.value)}
            className="sm:max-w-48"
          />

          {lowered ? (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-md bg-danger-soft px-3 py-2 text-xs leading-5 text-danger-fg"
            >
              <AlertTriangle className="mt-px size-3.5 shrink-0" aria-hidden />
              {t('settings.retentionWarning', { months: next })}
            </p>
          ) : null}
        </div>
      )}
    </Field>
  )
}
