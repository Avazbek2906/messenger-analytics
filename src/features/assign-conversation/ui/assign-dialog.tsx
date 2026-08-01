import { useEffect, useState } from 'react'

import { useAssignConversation } from '@/entities/conversation'
import { useEmployees } from '@/entities/employee'
import { ApiError, type UUID } from '@/shared/api'
import { useTranslation, type TranslateFn } from '@/shared/i18n'
import { Button } from '@/shared/ui/primitives/button'
import { Dialog } from '@/shared/ui/primitives/dialog'
import { Field } from '@/shared/ui/primitives/input'
import { Select } from '@/shared/ui/primitives/select'

interface AssignDialogProps {
  conversationId: UUID
  currentEmployeeId: UUID | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Assigns a conversation to an employee.
 *
 * This sets `attribution_source` to `manual`, which is STICKY: no automatic
 * mode will ever overwrite it (docs/07). The dialog says so explicitly.
 */
export function AssignDialog({
  conversationId,
  currentEmployeeId,
  open,
  onOpenChange,
}: AssignDialogProps) {
  const { t } = useTranslation()
  const employees = useEmployees()
  const assign = useAssignConversation(conversationId)

  const [employeeId, setEmployeeId] = useState(currentEmployeeId ?? '')

  useEffect(() => {
    if (!open) assign.reset()
  }, [open, assign])

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('assign.title')}
      description={t('assign.description')}
      footer={
        <>
          <Button onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="primary"
            loading={assign.isPending}
            disabled={!employeeId || employeeId === currentEmployeeId}
            onClick={() =>
              assign.mutate(
                { employee: employeeId },
                { onSuccess: () => onOpenChange(false) },
              )
            }
          >
            {t('assign.submit')}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label={t('assign.employee')} hint={t('assign.employeeHint')}>
          {(props) => (
            <Select
              {...props}
              value={employeeId || undefined}
              onChange={setEmployeeId}
              placeholder={t('assign.selectEmployee')}
              options={(employees.data?.results ?? []).map((employee) => ({
                value: employee.id,
                label: employee.department
                  ? `${employee.full_name} · ${employee.department}`
                  : employee.full_name,
              }))}
            />
          )}
        </Field>

        {assign.isError ? (
          <p role="alert" className="text-[13px] text-danger-fg">
            {describeAssignError(assign.error, t)}
          </p>
        ) : null}
      </div>
    </Dialog>
  )
}

function describeAssignError(error: unknown, t: TranslateFn): string {
  if (!(error instanceof ApiError)) return t('error.unexpected.title')

  if (error.has('employee_other_company')) return t('assign.otherCompany')
  if (error.has('does_not_exist')) return t('assign.notFound')
  if (error.isRoleDenied) return t('error.roleRequired')

  return error.errors[0]?.detail ?? t('error.unknown.detail')
}
