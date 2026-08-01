import { useEffect, useState } from 'react'

import {
  useCreateReason,
  useUpdateReason,
  type Reason,
} from '@/entities/catalog'
import { ApiError } from '@/shared/api'
import { useTranslation } from '@/shared/i18n'
import { Button } from '@/shared/ui/primitives/button'
import { Dialog } from '@/shared/ui/primitives/dialog'
import { Field, Input } from '@/shared/ui/primitives/input'

interface ReasonDialogProps {
  reason: Reason | null
  /** Includes the 8 global defaults — the duplicate check spans both layers. */
  existingCodes: string[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Create or relabel a company reason.
 *
 * `code` is WRITE-ONCE in the UI: analysis results and manager overrides store
 * the code, so renaming it later orphans every historical mapping. On edit the
 * field is locked and only the label can change (docs/04).
 */
export function ReasonDialog({
  reason,
  existingCodes,
  open,
  onOpenChange,
}: ReasonDialogProps) {
  const { t } = useTranslation()
  const create = useCreateReason()
  const update = useUpdateReason()
  const mutation = reason ? update : create

  const [code, setCode] = useState('')
  const [label, setLabel] = useState('')
  const [codeTouched, setCodeTouched] = useState(false)

  useEffect(() => {
    if (!open) {
      mutation.reset()
      return
    }
    setCode(reason?.code ?? '')
    setLabel(reason?.label ?? '')
    setCodeTouched(Boolean(reason))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, reason])

  const trimmedCode = code.trim()
  const trimmedLabel = label.trim()

  const duplicate =
    !reason && trimmedCode !== '' && existingCodes.includes(trimmedCode)

  const submit = () => {
    const options = { onSuccess: () => onOpenChange(false) }
    if (reason) {
      update.mutate({ id: reason.id, input: { label: trimmedLabel } }, options)
    } else {
      create.mutate({ code: trimmedCode, label: trimmedLabel }, options)
    }
  }

  const error = mutation.error instanceof ApiError ? mutation.error : null

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={t(reason ? 'reasonForm.editTitle' : 'reasonForm.createTitle')}
      description={t('reasonForm.description')}
      footer={
        <>
          <Button onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="primary"
            loading={mutation.isPending}
            disabled={!trimmedLabel || (!reason && (!trimmedCode || duplicate))}
            onClick={submit}
          >
            {t('settings.save')}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field
          label={t('reasonForm.label')}
          required
          error={error?.byField.label?.detail ?? null}
        >
          {(field) => (
            <Input
              {...field}
              value={label}
              maxLength={255}
              onChange={(event) => {
                setLabel(event.target.value)
                // Auto-slug the code from the label until the user edits it.
                if (!reason && !codeTouched)
                  setCode(slugify(event.target.value))
              }}
            />
          )}
        </Field>

        <Field
          label={t('reasonForm.code')}
          hint={t(reason ? 'reasonForm.codeLocked' : 'reasonForm.codeHint')}
          error={
            duplicate
              ? t('reasonForm.duplicate')
              : (error?.byField.code?.detail ?? null)
          }
          required={!reason}
        >
          {(field) => (
            <Input
              {...field}
              value={code}
              maxLength={64}
              disabled={Boolean(reason)}
              className="font-mono"
              onChange={(event) => {
                setCodeTouched(true)
                setCode(slugify(event.target.value))
              }}
            />
          )}
        </Field>

        {error && Object.keys(error.byField).length === 0 ? (
          <p role="alert" className="text-[13px] text-danger-fg">
            {error.isRoleDenied
              ? t('error.roleRequired')
              : (error.errors[0]?.detail ?? t('error.unknown.detail'))}
          </p>
        ) : null}
      </div>
    </Dialog>
  )
}

/** Codes must stay `snake_case` ASCII — the AI returns them verbatim. */
function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replaceAll(/[̀-ͯ]/g, '')
    .replaceAll(/[^a-z0-9]+/g, '_')
    .replaceAll(/^_+|_+$/g, '')
    .slice(0, 64)
}
