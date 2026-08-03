import { useEffect, useState } from 'react'

import {
  useCreateEmployee,
  useUpdateEmployee,
  type Employee,
  type WorkingHoursEntry,
} from '@/entities/employee'
import { useSession } from '@/entities/session'
import {
  CredentialsDialog,
  EMPTY_ACCOUNT,
  toAccountInput,
  type AccountDraft,
  type Credentials,
} from '@/entities/user'
import { ApiError } from '@/shared/api'
import { useTranslation } from '@/shared/i18n'
import { Button } from '@/shared/ui/primitives/button'
import { Dialog } from '@/shared/ui/primitives/dialog'
import { Field, Input } from '@/shared/ui/primitives/input'
import { Switch } from '@/shared/ui/primitives/switch'

import { EmployeeAccountBlock } from './employee-account-block'
import { WorkingHoursEditor } from './working-hours-editor'

interface EmployeeDialogProps {
  /** `null` opens the dialog in create mode. */
  employee: Employee | null
  departments: string[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Create or edit an employee.
 *
 * On create the form can also mint the employee's login in the same atomic
 * call. On edit it cannot: `account` is silently ignored by `PATCH`
 * (CHANGELOG 2026-08-02 §1), so an existing employee is given a login from the
 * roster's own action instead.
 */
export function EmployeeDialog({
  employee,
  departments,
  open,
  onOpenChange,
}: EmployeeDialogProps) {
  const { t } = useTranslation()
  const session = useSession()
  const create = useCreateEmployee()
  const update = useUpdateEmployee()
  const mutation = employee ? update : create

  const [fullName, setFullName] = useState('')
  const [department, setDepartment] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [shifts, setShifts] = useState<WorkingHoursEntry[]>([])
  const [account, setAccount] = useState<AccountDraft>(EMPTY_ACCOUNT)
  const [withAccount, setWithAccount] = useState(false)
  const [credentials, setCredentials] = useState<Credentials | null>(null)

  // Create-only, and only for a role that may grant one. An existing employee
  // is given a login from the roster action instead.
  const canCreateLogin = !employee && session.canWrite

  useEffect(() => {
    if (!open) {
      mutation.reset()
      return
    }
    setFullName(employee?.full_name ?? '')
    setDepartment(employee?.department ?? '')
    setIsActive(employee?.is_active ?? true)
    setShifts(employee?.working_hours ?? [])
    setAccount(EMPTY_ACCOUNT)
    setWithAccount(false)
    // Re-seeding only on open keeps typing from being clobbered by a refetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, employee])

  const error = mutation.error instanceof ApiError ? mutation.error : null
  const trimmedName = fullName.trim()
  const accountInput =
    canCreateLogin && withAccount ? toAccountInput(account) : undefined
  const accountIncomplete = accountInput !== undefined && !accountInput.username

  const submit = () => {
    const input = {
      full_name: trimmedName,
      department: department.trim(),
      is_active: isActive,
      // `[]` and `null` both clear the schedule; `null` is the documented form.
      working_hours: shifts.length > 0 ? shifts : null,
    }

    if (employee) {
      update.mutate(
        { id: employee.id, input },
        { onSuccess: () => onOpenChange(false) },
      )
      return
    }

    create.mutate(
      { ...input, ...(accountInput ? { account: accountInput } : {}) },
      {
        onSuccess: (created) => {
          onOpenChange(false)
          // Employee and login are created in one transaction, so a rejected
          // username leaves no employee behind — there is nothing to undo on
          // the failure path, only a password to reveal on the success one.
          setCredentials(created.credentials)
        },
      },
    )
  }

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={onOpenChange}
        size="lg"
        title={t(
          employee ? 'employeeForm.editTitle' : 'employeeForm.createTitle',
        )}
        description={t('employeeForm.description')}
        footer={
          <>
            <Button onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="primary"
              loading={mutation.isPending}
              disabled={!trimmedName || accountIncomplete}
              onClick={submit}
            >
              {t('settings.save')}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field
            label={t('employeeForm.fullName')}
            required
            error={error?.byField.full_name?.detail ?? null}
          >
            {(field) => (
              <Input
                {...field}
                value={fullName}
                maxLength={255}
                onChange={(event) => setFullName(event.target.value)}
              />
            )}
          </Field>

          <Field
            label={t('employeeForm.department')}
            hint={t('employeeForm.departmentHint')}
            error={error?.byField.department?.detail ?? null}
          >
            {(field) => (
              <>
                <Input
                  {...field}
                  list="employee-departments"
                  value={department}
                  maxLength={120}
                  onChange={(event) => setDepartment(event.target.value)}
                />
                {/* A datalist keeps the free-form field from splintering into
                  "Sotuv" and "sotuv", which would split the departments
                  dashboard in two (docs/02). */}
                <datalist id="employee-departments">
                  {departments.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </datalist>
              </>
            )}
          </Field>

          <Switch
            checked={isActive}
            onChange={setIsActive}
            label={t('employeeForm.active')}
            description={t('employeeForm.activeHint')}
          />

          <Field
            label={t('employeeForm.shifts')}
            hint={t('employeeForm.shiftsHint')}
          >
            {() => (
              <WorkingHoursEditor
                entries={shifts}
                disabled={mutation.isPending}
                serverError={error?.byField.working_hours?.detail ?? null}
                onChange={setShifts}
              />
            )}
          </Field>

          {canCreateLogin ? (
            <EmployeeAccountBlock
              draft={account}
              enabled={withAccount}
              error={error}
              disabled={mutation.isPending}
              onToggle={setWithAccount}
              onChange={setAccount}
            />
          ) : (
            <p className="rounded-md bg-info-soft px-3 py-2 text-xs leading-5 text-info-fg">
              {t('employeeForm.userLinkNote')}
            </p>
          )}

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
