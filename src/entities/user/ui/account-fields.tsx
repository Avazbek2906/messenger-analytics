import { roleLabelKey, useSession } from '@/entities/session'
import type { ApiError } from '@/shared/api'
import { useTranslation } from '@/shared/i18n'
import { Field, Input } from '@/shared/ui/primitives/input'
import { Select } from '@/shared/ui/primitives/select'

import { grantableRoles } from '../model/types'
import type { AccountDraft } from '../model/account-draft'

/**
 * The three fields every login needs: username, role, password.
 *
 * The role list is narrowed to what the signed-in user may actually grant — a
 * `manager` cannot create an `owner` and take the tenant, and the backend
 * rejects it as `role_not_grantable` anyway (CHANGELOG 2026-08-02 §1).
 *
 * `errorPrefix` exists because the same fields are validated at two depths:
 * flat on `/users/invite`, nested under `account` when they ride along with an
 * employee create.
 */
export function AccountFields({
  draft,
  error,
  errorPrefix,
  disabled,
  onChange,
}: {
  draft: AccountDraft
  error: ApiError | null
  errorPrefix?: 'account'
  disabled?: boolean
  onChange: (draft: AccountDraft) => void
}) {
  const { t } = useTranslation()
  const session = useSession()

  const roles = grantableRoles(session.user.role).map((role) => ({
    value: role,
    label: t(roleLabelKey(role)),
  }))

  // A nested serializer reports every failure against `attr: "account"`, so at
  // that depth all three fields share one error slot.
  const fieldError = (name: string) =>
    error?.byField[errorPrefix ?? name]?.detail ?? null

  return (
    <>
      <Field
        label={t('credentials.username')}
        hint={t('user.usernameHint')}
        required
        error={fieldError('username')}
      >
        {(field) => (
          <Input
            {...field}
            value={draft.username}
            autoComplete="off"
            maxLength={150}
            disabled={disabled}
            onChange={(event) =>
              onChange({ ...draft, username: event.target.value })
            }
          />
        )}
      </Field>

      <Field
        label={t('user.role')}
        hint={t('user.roleHint')}
        error={errorPrefix ? null : fieldError('role')}
      >
        {(field) => (
          <Select
            {...field}
            value={draft.role}
            options={roles}
            disabled={disabled}
            onChange={(role) => onChange({ ...draft, role })}
          />
        )}
      </Field>

      <Field
        label={t('credentials.password')}
        hint={t('user.passwordHint')}
        error={errorPrefix ? null : fieldError('password')}
      >
        {(field) => (
          <Input
            {...field}
            type="text"
            value={draft.password}
            autoComplete="off"
            disabled={disabled}
            placeholder={t('user.passwordPlaceholder')}
            onChange={(event) =>
              onChange({ ...draft, password: event.target.value })
            }
          />
        )}
      </Field>
    </>
  )
}
