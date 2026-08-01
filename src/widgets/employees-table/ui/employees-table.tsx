import { Pencil, Plus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'

import {
  useDepartmentSuggestions,
  useEmployees,
  useUpdateEmployee,
  type Employee,
} from '@/entities/employee'
import { useSession } from '@/entities/session'
import { EmployeeDialog } from '@/features/employee-form'
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value'
import { useTranslation } from '@/shared/i18n'
import { formatNumber } from '@/shared/lib'
import { DataTable, type Column } from '@/shared/ui/data/data-table'
import { QueryBoundary } from '@/shared/ui/feedback/query-boundary'
import { EmptyState } from '@/shared/ui/feedback/states'
import { Badge } from '@/shared/ui/primitives/badge'
import { Button } from '@/shared/ui/primitives/button'
import { Card, CardBody, CardHeader } from '@/shared/ui/primitives/card'
import { Input } from '@/shared/ui/primitives/input'
import { Switch } from '@/shared/ui/primitives/switch'

/**
 * The employee roster.
 *
 * Deactivation is the primary action, not deletion: `DELETE` destroys the row
 * and leaves historical conversations without a named owner (docs/02). The
 * table therefore exposes only an active toggle and an edit dialog.
 */
export function EmployeesTable() {
  const { t } = useTranslation()
  const session = useSession()

  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search)
  const [editing, setEditing] = useState<Employee | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const query = useEmployees({
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ordering: '-is_active,full_name',
  })
  const update = useUpdateEmployee()
  const departments = useDepartmentSuggestions(query.data?.results)

  const columns = useMemo<Column<Employee>[]>(
    () => [
      {
        key: 'name',
        header: t('employeeForm.fullName'),
        cell: (row) => (
          <span className="font-medium text-fg">{row.full_name}</span>
        ),
      },
      {
        key: 'department',
        header: t('employeeForm.department'),
        hideBelow: 'sm',
        cell: (row) =>
          row.department ? (
            <span className="text-fg-muted">{row.department}</span>
          ) : (
            <span className="text-fg-subtle">{t('team.noDepartment')}</span>
          ),
      },
      {
        key: 'shifts',
        header: t('employeeForm.shifts'),
        hideBelow: 'lg',
        cell: (row) => (
          <span className="text-fg-muted">
            {row.working_hours?.length
              ? t('employeesTable.shiftCount', {
                  count: formatNumber(row.working_hours.length),
                })
              : '—'}
          </span>
        ),
      },
      {
        key: 'cabinet',
        header: t('employeesTable.cabinet'),
        hideBelow: 'xl',
        cell: (row) =>
          row.user ? (
            <Badge tone="success" size="sm">
              {t('employeesTable.linked')}
            </Badge>
          ) : (
            <span className="text-fg-subtle">—</span>
          ),
      },
      {
        key: 'active',
        header: t('employeeForm.active'),
        cell: (row) => (
          <Switch
            checked={row.is_active}
            disabled={!session.canWrite || update.isPending}
            label={<span className="sr-only">{t('employeeForm.active')}</span>}
            onChange={(checked) =>
              update.mutate({ id: row.id, input: { is_active: checked } })
            }
          />
        ),
      },
      {
        key: 'actions',
        header: '',
        className: 'w-12',
        cell: (row) =>
          session.canWrite ? (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={t('employeeForm.editTitle')}
              onClick={() => {
                setEditing(row)
                setDialogOpen(true)
              }}
            >
              <Pencil />
            </Button>
          ) : null,
      },
    ],
    [t, session.canWrite, update],
  )

  return (
    <Card>
      <CardHeader
        title={t('settings.employees')}
        description={t('employeesTable.description')}
        actions={
          <>
            <Input
              type="search"
              value={search}
              leading={<Search />}
              className="h-9 sm:w-56"
              aria-label={t('employeesTable.search')}
              placeholder={t('employeesTable.search')}
              onChange={(event) => setSearch(event.target.value)}
            />
            {session.canWrite ? (
              <Button
                variant="primary"
                size="sm"
                icon={<Plus />}
                onClick={() => {
                  setEditing(null)
                  setDialogOpen(true)
                }}
              >
                {t('employeesTable.add')}
              </Button>
            ) : null}
          </>
        }
      />

      <CardBody className="px-0 pb-0">
        <QueryBoundary
          query={query}
          loading={
            <DataTable
              columns={columns}
              rows={[]}
              getRowKey={() => ''}
              isLoading
            />
          }
          isEmpty={(data) => data.results.length === 0}
          empty={
            <EmptyState
              title={t('employeesTable.empty.title')}
              description={t('employeesTable.empty.description')}
            />
          }
        >
          {(data) => (
            <DataTable
              columns={columns}
              rows={data.results}
              getRowKey={(row: Employee) => row.id}
              caption={t('settings.employees')}
            />
          )}
        </QueryBoundary>
      </CardBody>

      <EmployeeDialog
        employee={editing}
        departments={departments}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </Card>
  )
}
