import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

import {
  attributionModeLabelKey,
  sessionApi,
  useSession,
  type AttributionMode,
  type Company,
  type IdleGapHours,
} from '@/entities/session'
import { ApiError, queryKeys } from '@/shared/api'
import { useTranslation, type TranslateFn } from '@/shared/i18n'
import { Button } from '@/shared/ui/primitives/button'
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
} from '@/shared/ui/primitives/card'
import { Field, Input } from '@/shared/ui/primitives/input'
import { Select } from '@/shared/ui/primitives/select'

import { RetentionField } from './retention-field'

const MODES: AttributionMode[] = [1, 2, 3]
const IDLE_GAPS: IdleGapHours[] = [4, 8, 12, 24]

interface Draft {
  name: string
  timezone: string
  attribution_mode: AttributionMode
  idle_gap_hours: IdleGapHours
  retention_months: string
}

/**
 * Company settings.
 *
 * `attribution_mode` and `idle_gap_hours` are INTEGERS on the wire, not strings
 * (docs/02). Changing the mode does not re-attribute existing conversations,
 * and a manual assignment is never overwritten — the hint says so.
 */
export function CompanyForm({ company }: { company: Company }) {
  const { t } = useTranslation()
  const session = useSession()
  const queryClient = useQueryClient()

  const [draft, setDraft] = useState<Draft>(() => toDraft(company))

  // The server is the source of truth: re-seed if it changes underneath us.
  useEffect(() => setDraft(toDraft(company)), [company])

  const save = useMutation({
    mutationFn: () => sessionApi.updateCompany(toPayload(draft)),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.session.company(), updated)
    },
  })

  const disabled = !session.canWrite || save.isPending
  const patch = (part: Partial<Draft>) =>
    setDraft((current) => ({ ...current, ...part }))

  return (
    <Card>
      <CardHeader
        title={t('settings.companyTitle')}
        description={t('settings.companyHint')}
      />

      <CardBody className="grid gap-4 sm:grid-cols-2">
        <Field
          label={t('settings.companyName')}
          required
          error={fieldError(save.error, 'name', t)}
        >
          {(field) => (
            <Input
              {...field}
              value={draft.name}
              disabled={disabled}
              maxLength={255}
              onChange={(event) => patch({ name: event.target.value })}
            />
          )}
        </Field>

        <Field
          label={t('settings.timezone')}
          hint={t('settings.timezoneHint')}
          error={fieldError(save.error, 'timezone', t)}
        >
          {(field) => (
            <Input
              {...field}
              value={draft.timezone}
              disabled={disabled}
              maxLength={64}
              placeholder="Asia/Tashkent"
              onChange={(event) => patch({ timezone: event.target.value })}
            />
          )}
        </Field>

        <Field
          label={t('settings.attributionMode')}
          hint={t('settings.attributionModeHint')}
        >
          {(field) => (
            <Select
              {...field}
              disabled={disabled}
              value={String(draft.attribution_mode)}
              onChange={(value) =>
                patch({ attribution_mode: Number(value) as AttributionMode })
              }
              options={MODES.map((mode) => ({
                value: String(mode),
                label: t(attributionModeLabelKey(mode)),
              }))}
            />
          )}
        </Field>

        <Field label={t('settings.idleGap')} hint={t('settings.idleGapHint')}>
          {(field) => (
            <Select
              {...field}
              disabled={disabled}
              value={String(draft.idle_gap_hours)}
              onChange={(value) =>
                patch({ idle_gap_hours: Number(value) as IdleGapHours })
              }
              options={IDLE_GAPS.map((hours) => ({
                value: String(hours),
                label: t('settings.hours', { count: hours }),
              }))}
            />
          )}
        </Field>

        <RetentionField
          value={draft.retention_months}
          current={company.retention_months ?? null}
          disabled={disabled}
          onChange={(value) => patch({ retention_months: value })}
        />
      </CardBody>

      {session.canWrite ? (
        <CardFooter>
          <span className="text-xs text-fg-muted">
            {save.isSuccess ? t('settings.saved') : null}
            {save.isError && !hasFieldErrors(save.error)
              ? t('settings.saveFailed')
              : null}
          </span>
          <Button
            variant="primary"
            loading={save.isPending}
            disabled={!draft.name.trim()}
            onClick={() => save.mutate()}
          >
            {t('settings.save')}
          </Button>
        </CardFooter>
      ) : null}
    </Card>
  )
}

function toDraft(company: Company): Draft {
  return {
    name: company.name,
    timezone: company.timezone,
    attribution_mode: company.attribution_mode,
    idle_gap_hours: company.idle_gap_hours,
    retention_months:
      company.retention_months == null ? '' : String(company.retention_months),
  }
}

function toPayload(draft: Draft) {
  return {
    name: draft.name.trim(),
    timezone: draft.timezone.trim(),
    attribution_mode: draft.attribution_mode,
    idle_gap_hours: draft.idle_gap_hours,
    // An empty field means "keep forever", which the API expresses as `null`.
    retention_months:
      draft.retention_months === '' ? null : Number(draft.retention_months),
  }
}

/** Field-level errors arrive on `attr`, so they bind straight to the input. */
function fieldError(
  error: unknown,
  attr: string,
  t: TranslateFn,
): string | null {
  if (!(error instanceof ApiError)) return null
  const found = error.byField[attr]
  if (!found) return null
  return found.code === 'timezone_invalid'
    ? t('settings.timezoneInvalid')
    : found.detail
}

function hasFieldErrors(error: unknown): boolean {
  return error instanceof ApiError && Object.keys(error.byField).length > 0
}
