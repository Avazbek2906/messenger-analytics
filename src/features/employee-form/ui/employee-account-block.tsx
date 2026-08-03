import { AccountFields, type AccountDraft } from '@/entities/user'
import type { ApiError } from '@/shared/api'
import { useTranslation } from '@/shared/i18n'
import { Switch } from '@/shared/ui/primitives/switch'

/**
 * The optional login block of the employee CREATE form.
 *
 * Not offered on edit: `account` is silently ignored by `PATCH` — no login is
 * created and no error is raised — so a control there would simply lie
 * (CHANGELOG 2026-08-02 §1).
 */
export function EmployeeAccountBlock({
  draft,
  enabled,
  error,
  disabled,
  onToggle,
  onChange,
}: {
  draft: AccountDraft
  enabled: boolean
  error: ApiError | null
  disabled: boolean
  onToggle: (enabled: boolean) => void
  onChange: (draft: AccountDraft) => void
}) {
  const { t } = useTranslation()

  return (
    <div className="space-y-4 rounded-lg bg-surface-sunken p-3.5">
      <Switch
        checked={enabled}
        disabled={disabled}
        onChange={onToggle}
        label={t('employeeForm.createLogin')}
        description={t('employeeForm.createLoginHint')}
      />

      {enabled ? (
        <div className="space-y-3">
          <AccountFields
            draft={draft}
            error={error}
            errorPrefix="account"
            disabled={disabled}
            onChange={onChange}
          />
        </div>
      ) : null}
    </div>
  )
}
