import { useState } from 'react'
import { toast } from 'sonner'

import { useChangeOwnPassword } from '@/entities/user'
import { ApiError } from '@/shared/api'
import { useTranslation } from '@/shared/i18n'
import { Button } from '@/shared/ui/primitives/button'
import { Card, CardBody, CardHeader } from '@/shared/ui/primitives/card'
import { Field, Input } from '@/shared/ui/primitives/input'

/**
 * Any authenticated user changes their own password — the natural follow-up to
 * being handed a generated one.
 *
 * The current password is required by the backend, which is what stops a
 * stolen access token alone from seizing the account; the confirmation field
 * is ours, to catch a typo before it becomes a lockout (CHANGELOG §2).
 */
export function ChangePasswordForm() {
  const { t } = useTranslation()
  const change = useChangeOwnPassword()

  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')

  const error = change.error instanceof ApiError ? change.error : null
  const mismatch = confirm.length > 0 && next !== confirm
  const canSubmit = Boolean(current && next && next === confirm)

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!canSubmit) return

    change.mutate(
      { current_password: current, new_password: next },
      {
        onSuccess: () => {
          setCurrent('')
          setNext('')
          setConfirm('')
          toast.success(t('changePassword.success'))
        },
      },
    )
  }

  return (
    <Card>
      <CardHeader
        title={t('changePassword.title')}
        description={t('changePassword.description')}
      />
      <CardBody>
        <form className="max-w-md space-y-4" onSubmit={submit}>
          <Field
            label={t('changePassword.current')}
            required
            error={error?.byField.current_password?.detail ?? null}
          >
            {(field) => (
              <Input
                {...field}
                type="password"
                value={current}
                autoComplete="current-password"
                onChange={(event) => setCurrent(event.target.value)}
              />
            )}
          </Field>

          <Field
            label={t('changePassword.new')}
            required
            error={error?.byField.new_password?.detail ?? null}
          >
            {(field) => (
              <Input
                {...field}
                type="password"
                value={next}
                autoComplete="new-password"
                onChange={(event) => setNext(event.target.value)}
              />
            )}
          </Field>

          <Field
            label={t('changePassword.confirm')}
            required
            error={mismatch ? t('changePassword.mismatch') : null}
          >
            {(field) => (
              <Input
                {...field}
                type="password"
                value={confirm}
                autoComplete="new-password"
                onChange={(event) => setConfirm(event.target.value)}
              />
            )}
          </Field>

          {error && Object.keys(error.byField).length === 0 ? (
            <p role="alert" className="text-[13px] text-danger-fg">
              {error.has('password_unchanged')
                ? t('changePassword.unchanged')
                : (error.errors[0]?.detail ?? t('error.unknown.detail'))}
            </p>
          ) : null}

          <Button
            type="submit"
            variant="primary"
            loading={change.isPending}
            disabled={!canSubmit}
          >
            {t('changePassword.submit')}
          </Button>
        </form>
      </CardBody>
    </Card>
  )
}
