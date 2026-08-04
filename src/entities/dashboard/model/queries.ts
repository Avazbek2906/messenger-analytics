import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { queryKeys, type PeriodParams, type UUID } from '@/shared/api'

import {
  dashboardApi,
  type EmployeeRatingParams,
  type TimeseriesParams,
} from '../api/dashboard-api'

/**
 * Dashboard queries.
 *
 * `staleTime` is 120 s because the backend caches aggregates for exactly that
 * long (docs/05 §9) — asking sooner only burns requests.
 *
 * Every one of these is keyed on the period, so changing the filter changes the
 * key. `keepPreviousData` holds the old numbers through that swap instead of
 * dropping the whole page back to skeletons; `QueryBoundary` dims them while
 * they are one filter behind (guide §8).
 */
const AGGREGATE_STALE_TIME = 120_000

const aggregate = {
  staleTime: AGGREGATE_STALE_TIME,
  placeholderData: keepPreviousData,
} as const

export function useOverview(params: PeriodParams) {
  return useQuery({
    queryKey: queryKeys.dashboard.overview(params),
    queryFn: () => dashboardApi.overview(params),
    ...aggregate,
  })
}

export function useTimeseries(params: TimeseriesParams) {
  return useQuery({
    queryKey: queryKeys.dashboard.timeseries(params),
    queryFn: () => dashboardApi.timeseries(params),
    ...aggregate,
    // `period_too_long` needs the user to change granularity — retrying the
    // same request cannot help.
    retry: false,
  })
}

export function useCriteria(params: PeriodParams) {
  return useQuery({
    queryKey: queryKeys.dashboard.criteria(params),
    queryFn: () => dashboardApi.criteria(params),
    ...aggregate,
  })
}

export function useFunnel(params: PeriodParams) {
  return useQuery({
    queryKey: queryKeys.dashboard.funnel(params),
    queryFn: () => dashboardApi.funnel(params),
    ...aggregate,
  })
}

export function useEmployeeRatings(params: EmployeeRatingParams) {
  return useQuery({
    queryKey: queryKeys.dashboard.employees(params),
    queryFn: () => dashboardApi.employees(params),
    ...aggregate,
  })
}

export function useDepartmentRatings(params: PeriodParams) {
  return useQuery({
    queryKey: queryKeys.dashboard.departments(params),
    queryFn: () => dashboardApi.departments(params),
    ...aggregate,
  })
}

export function useEmployeeCard(id: UUID, params: PeriodParams) {
  return useQuery({
    queryKey: queryKeys.dashboard.employee(id, params),
    queryFn: () => dashboardApi.employee(id, params),
    ...aggregate,
    // `employee_not_found` arrives as a 400, so a retry would just repeat it.
    retry: false,
  })
}

/** The cabinet is uncached server-side, so it is always current (docs/05). */
export function useMyCard(params: PeriodParams) {
  return useQuery({
    queryKey: queryKeys.dashboard.me(params),
    queryFn: () => dashboardApi.me(params),
    staleTime: 0,
    placeholderData: keepPreviousData,
    retry: false,
  })
}

export function useLostProducts(params: PeriodParams) {
  return useQuery({
    queryKey: queryKeys.dashboard.products(params),
    queryFn: () => dashboardApi.products(params),
    ...aggregate,
  })
}

export function useLostReasons(params: PeriodParams) {
  return useQuery({
    queryKey: queryKeys.dashboard.reasons(params),
    queryFn: () => dashboardApi.reasons(params),
    ...aggregate,
  })
}

export function useAgreements(params: PeriodParams) {
  return useQuery({
    queryKey: queryKeys.dashboard.agreements(params),
    queryFn: () => dashboardApi.agreements(params),
    ...aggregate,
  })
}
