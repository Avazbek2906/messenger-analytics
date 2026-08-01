import { useEffect, useState } from 'react'

import { useReasons } from '@/entities/catalog'
import {
  outcomeLabelKey,
  useOverrideConversation,
  type ConversationDetail,
  type Outcome,
} from '@/entities/conversation'
import { ApiError, type UUID } from '@/shared/api'
import { useTranslation, type TranslateFn } from '@/shared/i18n'
import { Button } from '@/shared/ui/primitives/button'
import { Dialog } from '@/shared/ui/primitives/dialog'
import { Field, Input } from '@/shared/ui/primitives/input'
import { Segmented } from '@/shared/ui/primitives/segmented'
import { Select } from '@/shared/ui/primitives/select'

type OverrideField = 'outcome' | 'score' | 'primary_reason'

const OUTCOMES: Outcome[] = ['sotildi', 'sotilmadi', 'noaniq']

interface OverrideDialogProps {
  conversationId: UUID
  detail: ConversationDetail
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * AI xulosasini tuzatish.
 *
 * Append-only: `AnalysisResult` is never touched. A new `ManagerOverride` is
 * written and the newest one per field becomes the `effective_*` value. The
 * same field may be corrected repeatedly (docs/03).
 */
export function OverrideDialog({
  conversationId,
  detail,
  open,
  onOpenChange,
}: OverrideDialogProps) {
  const { t } = useTranslation()
  const reasons = useReasons()
  const override = useOverrideConversation(conversationId)

  const [field, setField] = useState<OverrideField>('outcome')
  const [outcome, setOutcome] = useState<Outcome>(
    detail.effective_outcome ?? 'noaniq',
  )
  const [score, setScore] = useState(String(detail.effective_score ?? ''))
  const [reasonCode, setReasonCode] = useState(
    detail.effective_reason?.code ?? '',
  )

  // Reset the mutation when the dialog closes, so a stale error does not
  // resurface the next time it opens.
  useEffect(() => {
    if (!open) override.reset()
  }, [open, override])

  const scoreError = validateScore(score, field, t)
  const canSubmit =
    field === 'score'
      ? !scoreError && score !== ''
      : field === 'primary_reason'
        ? Boolean(reasonCode)
        : true

  const submit = () => {
    const value =
      field === 'outcome'
        ? outcome
        : field === 'score'
          ? score.trim()
          : reasonCode

    override.mutate({ field, value }, { onSuccess: () => onOpenChange(false) })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('override.title')}
      description={t('override.description')}
      footer={
        <>
          <Button onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="primary"
            loading={override.isPending}
            disabled={!canSubmit}
            onClick={submit}
          >
            {t('override.submit')}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label={t('override.field')}>
          {() => (
            <Segmented
              aria-label={t('override.field')}
              value={field}
              onChange={setField}
              className="w-full"
              options={[
                { value: 'outcome', label: t('conversation.outcome') },
                { value: 'score', label: t('conversation.score') },
                { value: 'primary_reason', label: t('conversation.reason') },
              ]}
            />
          )}
        </Field>

        {field === 'outcome' ? (
          <Field label={t('override.newOutcome')}>
            {(props) => (
              <Select
                {...props}
                value={outcome}
                onChange={setOutcome}
                options={OUTCOMES.map((value) => ({
                  value,
                  label: t(outcomeLabelKey(value)),
                }))}
              />
            )}
          </Field>
        ) : null}

        {field === 'score' ? (
          <Field
            label={t('override.newScore')}
            hint={t('override.scoreHint')}
            error={scoreError}
          >
            {(props) => (
              <Input
                {...props}
                type="number"
                min={0}
                max={100}
                step={1}
                inputMode="numeric"
                value={score}
                onChange={(event) => setScore(event.target.value)}
              />
            )}
          </Field>
        ) : null}

        {field === 'primary_reason' ? (
          <Field
            label={t('override.newReason')}
            hint={t('override.reasonHint')}
          >
            {(props) => (
              <Select
                {...props}
                value={reasonCode}
                onChange={setReasonCode}
                placeholder={t('override.selectReason')}
                options={(reasons.data ?? []).map((reason) => ({
                  value: reason.code,
                  label: reason.label,
                }))}
              />
            )}
          </Field>
        ) : null}

        {override.isError ? (
          <p role="alert" className="text-[13px] text-danger-fg">
            {describeOverrideError(override.error, t)}
          </p>
        ) : null}
      </div>
    </Dialog>
  )
}

/** The backend rejects `"70.5"` — only a whole number `0..100` is valid. */
function validateScore(
  value: string,
  field: OverrideField,
  t: TranslateFn,
): string | null {
  if (field !== 'score' || value === '') return null

  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed < 0 || parsed > 100) {
    return t('override.scoreInvalid')
  }
  return null
}

function describeOverrideError(error: unknown, t: TranslateFn): string {
  if (!(error instanceof ApiError)) return t('error.unexpected.title')

  if (error.has('invalid_score')) return t('override.scoreInvalid')
  if (error.has('invalid_outcome')) return t('override.outcomeInvalid')
  if (error.has('invalid_reason_code')) return t('override.reasonInvalid')
  if (error.isRoleDenied) return t('error.roleRequired')

  return error.errors[0]?.detail ?? t('error.unknown.detail')
}
