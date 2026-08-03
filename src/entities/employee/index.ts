import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'

import type { Credentials, EmployeeAccountInput } from '@/entities/user'
import {
  http,
  queryKeys,
  type ApiDateTime,
  type Paginated,
  type UUID,
} from '@/shared/api'

/** `weekday`: 0 = Monday. Times are wall-clock local in the company timezone. */
export interface WorkingHoursEntry {
  weekday: number
  start: string
  end: string
}

export interface Employee {
  id: UUID
  full_name: string
  /** `""` when no department is set — never `null`. */
  department: string
  is_active: boolean
  working_hours: WorkingHoursEntry[] | null
  /** Link to a dashboard user — this is what opens the cabinet and extension. */
  user: UUID | null
  /**
   * The one-time password, present ONLY on a create response that carried
   * `account`; `null` everywhere else. It is never returned again.
   */
  credentials: Credentials | null
  created_at: ApiDateTime
}

/** `company` is stamped server-side and must never be sent. */
export interface EmployeeInput {
  full_name: string
  department?: string
  is_active?: boolean
  /** `null` or `[]` clears the schedule. */
  working_hours?: WorkingHoursEntry[] | null
  /**
   * Creates the employee AND their login in one transaction. Mutually
   * exclusive with `user` (`400 user_and_account`).
   *
   * CREATE ONLY: the schema advertises it on `PUT`/`PATCH` too, but updates
   * ignore it silently — no login, no error. `EmployeeUpdateInput` therefore
   * strips it (CHANGELOG 2026-08-02 §1).
   */
  account?: EmployeeAccountInput
  /** Links an EXISTING login instead of creating one. */
  user?: UUID | null
}

/** Updates cannot carry `account` — see the note above. */
export type EmployeeUpdateInput = Partial<Omit<EmployeeInput, 'account'>>

export interface EmployeeFilters {
  is_active?: boolean
  search?: string
  ordering?: string
  limit?: number
  offset?: number
}

export const employeeApi = {
  list: (filters: EmployeeFilters = {}) =>
    http.get<Paginated<Employee>>('companies/employees', { ...filters }),

  create: (input: EmployeeInput) =>
    http.post<Employee>('companies/employees', input),

  update: (id: UUID, input: EmployeeUpdateInput) =>
    http.patch<Employee>(`companies/employees/${id}`, input),

  /** Hard delete — prefer `update({ is_active: false })` for someone who left. */
  remove: (id: UUID) => http.delete(`companies/employees/${id}`),
}

/**
 * The employee roster — for pickers, filters and the settings table.
 *
 * The roster changes rarely, hence the long `staleTime`. Callers that need the
 * full roster (settings) pass `{}`; pickers keep the active-only default.
 */
export function useEmployees(filters: EmployeeFilters = { is_active: true }) {
  return useQuery({
    queryKey: queryKeys.employees.list(filters),
    queryFn: () => employeeApi.list({ limit: 100, ...filters }),
    staleTime: 5 * 60_000,
  })
}

function useInvalidateEmployees() {
  const queryClient = useQueryClient()
  return () =>
    void queryClient.invalidateQueries({ queryKey: queryKeys.employees.all() })
}

export function useCreateEmployee() {
  const invalidate = useInvalidateEmployees()
  return useMutation({ mutationFn: employeeApi.create, onSuccess: invalidate })
}

export function useUpdateEmployee() {
  const invalidate = useInvalidateEmployees()
  return useMutation({
    mutationFn: ({ id, input }: { id: UUID; input: EmployeeUpdateInput }) =>
      employeeApi.update(id, input),
    onSuccess: invalidate,
  })
}

export function useDeleteEmployee() {
  const invalidate = useInvalidateEmployees()
  return useMutation({ mutationFn: employeeApi.remove, onSuccess: invalidate })
}

/**
 * Distinct departments already in the roster.
 *
 * `department` is free-form text and the only source for the departments
 * dashboard, so the form offers these as suggestions — otherwise "Sotuv" and
 * "sotuv" become two different departments (docs/02).
 */
export function useDepartmentSuggestions(employees: Employee[] | undefined) {
  return useMemo(() => {
    const values = new Set<string>()
    for (const employee of employees ?? []) {
      if (employee.department) values.add(employee.department)
    }
    return [...values].toSorted((a, b) => a.localeCompare(b))
  }, [employees])
}
