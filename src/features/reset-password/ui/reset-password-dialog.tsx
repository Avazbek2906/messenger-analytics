import { Info } from 'lucide-react'
import { useEffect, useState } from 'react'

import {
  CredentialsDialog,
  useResetPassword,
  type Credentials,
} from '@/entities/user'
import { ApiError, type UUID } from '@/shared/api'
import { useTranslation } from '@/shared/i18n'
import { Button } from '@/shared/ui/primitives/button'
import { Dialog } from '@/shared/ui/primitives/dialog'
import { Field, Input } from '@/shared/ui/primitives/input'

interface ResetPasswordDialogProps {
  /** The `User` uuid — NOT the employee's. `null` keeps the dialog closed. */
  userId: UUID | null
  /** Whose password this is, for the confirmation text. */
  subject: string
  onOpenChange: (open: boolean) => void
}

/**
 * A manager resets someone else's password — the locked-out-employee path.
 *
 * The dialog states outright that this does not end existing sessions: a JWT
 * stays valid for its full 5-day lifetime after the change, so presenting a
 * reset as "revoke access" would be a lie a manager might act on
 * (CHANGELOG 2026-08-02 §2).
 */
export function ResetPasswordDialog({
  userId,
  subject,
  onOpenChange,
}: ResetPasswordDialogProps) {
  const { t } = useTranslation()
  const reset = useResetPassword()

  const [password, setPassword] = useState('')
  const [credentials, setCredentials] = useState<Credentials | null>(null)

  useEffect(() => {
    if (userId === null) return
    setPassword('')
    reset.reset()
    // Re-seeding only when a new target opens the dialog.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  const error = reset.error instanceof ApiError ? reset.error : null

  const submit = () => {
    if (!userId) return
    const chosen = password.trim()

    reset.mutate(
      { id: userId, ...(chosen ? { password: chosen } : {}) },
      {
        onSuccess: (user) => {
          onOpenChange(false)
          setCredentials({ username: user.username, password: user.password })
        },
      },
    )
  }

  return (
    <>
      <Dialog
        open={userId !== null}
        onOpenChange={onOpenChange}
        title={t('resetPassword.title')}
        description={t('resetPassword.description', { name: subject })}
        footer={
          <>
            <Button onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="primary"
              loading={reset.isPending}
              onClick={submit}
            >
              {t('resetPassword.submit')}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field
            label={t('resetPassword.newPassword')}
            hint={t('resetPassword.newPasswordHint')}
            error={error?.byField.password?.detail ?? null}
          >
            {(field) => (
              <Input
                {...field}
                type="text"
                value={password}
                autoComplete="new-password"
                disabled={reset.isPending}
                placeholder={t('user.passwordPlaceholder')}
                onChange={(event) => setPassword(event.target.value)}
              />
            )}
          </Field>

          <p className="flex items-start gap-2 rounded-md bg-info-soft px-3 py-2.5 text-xs leading-5 text-info-fg">
            <Info className="mt-px size-3.5 shrink-0" aria-hidden />
            {t('resetPassword.sessionsNote')}
          </p>

          {error && Object.keys(error.byField).length === 0 ? (
            <p role="alert" className="text-[13px] text-danger-fg">
              {error.isRoleDenied
                ? t('error.roleRequired')
                : (error.errors[0]?.detail ?? t('error.unknown.detail'))}
            </p>
          ) : null}
        </div>
      </Dialog>

      <CredentialsDialog
        credentials={credentials}
        onClose={() => setCredentials(null)}
      />
    </>
  )
}
