import { http, type PeriodParams, type UUID } from '@/shared/api'

import type {
  AgreementsSummary,
  CriteriaSummary,
  CriterionKey,
  DepartmentRating,
  EmployeeCard,
  EmployeeRating,
  LostProduct,
  ReasonsSummary,
  FunnelSummary,
  Granularity,
  Overview,
  Timeseries,
} from '../model/types'

export interface EmployeeRatingParams extends PeriodParams {
  /** Re-ranks the table on a single rubric criterion instead of the overall score. */
  criterion?: CriterionKey
}

export interface TimeseriesParams extends PeriodParams {
  granularity?: Granularity
  /** A catalog product UUID — narrows both lines to that one dimension. */
  product?: UUID
  reason?: UUID
}

/**
 * Dashboard aggregates — all read-only.
 *
 * Every endpoint is cached server-side for 120 s, keyed on tenant + query
 * params (`/dashboard/me` excepted), so cache-busting is pointless here.
 */
export const dashboardApi = {
  overview: (params: PeriodParams) =>
    http.get<Overview>('dashboard/overview', { ...params }),

  timeseries: (params: TimeseriesParams) =>
    http.get<Timeseries>('dashboard/timeseries', { ...params }),

  criteria: (params: PeriodParams) =>
    http.get<CriteriaSummary>('dashboard/criteria', { ...params }),

  funnel: (params: PeriodParams) =>
    http.get<FunnelSummary>('dashboard/funnel', { ...params }),

  /** A bare array, already sorted: ranked employees first, then unranked. */
  employees: (params: EmployeeRatingParams) =>
    http.get<EmployeeRating[]>('dashboard/employees', { ...params }),

  /** A bare array sorted by `avg_score` descending. */
  departments: (params: PeriodParams) =>
    http.get<DepartmentRating[]>('dashboard/departments', { ...params }),

  /** A cross-company id is reported as `400 employee_not_found`, never a 404. */
  employee: (id: UUID, params: PeriodParams) =>
    http.get<EmployeeCard>(`dashboard/employees/${id}`, { ...params }),

  /**
   * The employee cabinet. Same shape as `employee`, resolved from the caller's
   * own `Employee` link — and the one dashboard endpoint that is NOT cached.
   */
  me: (params: PeriodParams) =>
    http.get<EmployeeCard>('dashboard/me', { ...params }),

  /** A bare array, most-lost first, capped at the top 20 products. */
  products: (params: PeriodParams) =>
    http.get<LostProduct[]>('dashboard/products', { ...params }),

  reasons: (params: PeriodParams) =>
    http.get<ReasonsSummary>('dashboard/reasons', { ...params }),

  /** `confirmed` is accepted for parity but does NOT affect this endpoint. */
  agreements: (params: PeriodParams) =>
    http.get<AgreementsSummary>('dashboard/agreements', { ...params }),
}
