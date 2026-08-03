import { useEffect, useMemo, useState } from 'react'

import { useEmployees } from '@/entities/employee'
import {
  AccountFields,
  CredentialsDialog,
  EMPTY_ACCOUNT,
  toAccountInput,
  useInviteUser,
  type AccountDraft,
  type Credentials,
} from '@/entities/user'
import { ApiError } from '@/shared/api'
import { useTranslation } from '@/shared/i18n'
import { Button } from '@/shared/ui/primitives/button'
import { Dialog } from '@/shared/ui/primitives/dialog'
import { Field, Input } from '@/shared/ui/primitives/input'
import { Select } from '@/shared/ui/primitives/select'

const NO_EMPLOYEE = 'none'

/**
 * Creates a login inside the company — the onboarding path that used to
 * require a superuser in the Django admin.
 *
 * Linking an employee here is what opens that person's cabinet and lets them
 * use the browser extension; a login without the link is a manager or a
 * read-only stakeholder (CHANGELOG 2026-08-02 §1).
 */
export function InviteUserDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useTranslation()
  const invite = useInviteUser()
  const employees = useEmployees({ is_active: true })

  const [account, setAccount] = useState<AccountDraft>(EMPTY_ACCOUNT)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [employeeId, setEmployeeId] = useState<string>(NO_EMPLOYEE)
  const [credentials, setCredentials] = useState<Credentials | null>(null)

  useEffect(() => {
    if (!open) {
      invite.reset()
      return
    }
    setAccount(EMPTY_ACCOUNT)
    setFirstName('')
    setLastName('')
    setEmployeeId(NO_EMPLOYEE)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Already-linked employees are filtered out: the backend rejects them as
  // `employee_already_linked`, so offering them would only produce an error.
  const options = useMemo(
    () => [
      { value: NO_EMPLOYEE, label: t('inviteUser.noEmployee') },
      ...(employees.data?.results ?? [])
        .filter((employee) => employee.user === null)
        .map((employee) => ({
          value: employee.id,
          label: employee.full_name,
        })),
    ],
    [employees.data, t],
  )

  const error = invite.error instanceof ApiError ? invite.error : null
  const input = toAccountInput(account)

  const submit = () => {
    invite.mutate(
      {
        ...input,
        ...(firstName.trim() ? { first_name: firstName.trim() } : {}),
        ...(lastName.trim() ? { last_name: lastName.trim() } : {}),
        ...(employeeId === NO_EMPLOYEE ? {} : { employee: employeeId }),
      },
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
        open={open}
        onOpenChange={onOpenChange}
        title={t('inviteUser.title')}
        description={t('inviteUser.description')}
        footer={
          <>
            <Button onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="primary"
              loading={invite.isPending}
              disabled={!input.username}
              onClick={submit}
            >
              {t('inviteUser.submit')}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <AccountFields
            draft={account}
            error={error}
            disabled={invite.isPending}
            onChange={setAccount}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t('user.firstName')}>
              {(field) => (
                <Input
                  {...field}
                  value={firstName}
                  maxLength={150}
                  disabled={invite.isPending}
                  onChange={(event) => setFirstName(event.target.value)}
                />
              )}
            </Field>
            <Field label={t('user.lastName')}>
              {(field) => (
                <Input
                  {...field}
                  value={lastName}
                  maxLength={150}
                  disabled={invite.isPending}
                  onChange={(event) => setLastName(event.target.value)}
                />
              )}
            </Field>
          </div>

          <Field
            label={t('inviteUser.employee')}
            hint={t('inviteUser.employeeHint')}
            error={error?.byField.employee?.detail ?? null}
          >
            {(field) => (
              <Select
                {...field}
                value={employeeId}
                options={options}
                disabled={invite.isPending || employees.isLoading}
                onChange={setEmployeeId}
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

      <CredentialsDialog
        credentials={credentials}
        onClose={() => setCredentials(null)}
      />
    </>
  )
}
