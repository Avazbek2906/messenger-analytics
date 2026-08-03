/**
 * Centralised query-key factory.
 *
 * Every key lives here so invalidation never turns into "which string was it
 * again?", and so no key is ever duplicated.
 */

import type { PeriodParams, UUID } from './types'

/** A filter object that becomes part of the key — its shape does not matter. */
type Filters = object

export const queryKeys = {
  session: {
    me: () => ['session', 'me'] as const,
    company: () => ['session', 'company'] as const,
    cabinet: () => ['session', 'cabinet'] as const,
  },

  employees: {
    all: () => ['employees'] as const,
    list: (filters?: Filters) => ['employees', 'list', filters ?? {}] as const,
    detail: (id: UUID) => ['employees', 'detail', id] as const,
  },

  conversations: {
    all: () => ['conversations'] as const,
    list: (filters: Filters) => ['conversations', 'list', filters] as const,
    detail: (id: UUID) => ['conversations', 'detail', id] as const,
    messages: (id: UUID, page: Filters) =>
      ['conversations', 'messages', id, page] as const,
  },

  customers: {
    all: () => ['customers'] as const,
    list: (filters: Filters) => ['customers', 'list', filters] as const,
    detail: (id: UUID) => ['customers', 'detail', id] as const,
  },

  catalog: {
    products: (filters?: Filters) =>
      ['catalog', 'products', filters ?? {}] as const,
    product: (id: UUID) => ['catalog', 'products', 'detail', id] as const,
    reasons: () => ['catalog', 'reasons'] as const,
    rulebooks: () => ['catalog', 'rulebooks'] as const,
    rulebook: (id: UUID) => ['catalog', 'rulebooks', 'detail', id] as const,
  },

  dashboard: {
    all: () => ['dashboard'] as const,
    overview: (p: PeriodParams) => ['dashboard', 'overview', p] as const,
    timeseries: (p: PeriodParams & Filters) =>
      ['dashboard', 'timeseries', p] as const,
    criteria: (p: PeriodParams) => ['dashboard', 'criteria', p] as const,
    employees: (p: PeriodParams & Filters) =>
      ['dashboard', 'employees', p] as const,
    employee: (id: UUID, p: PeriodParams) =>
      ['dashboard', 'employee', id, p] as const,
    departments: (p: PeriodParams) => ['dashboard', 'departments', p] as const,
    me: (p: PeriodParams) => ['dashboard', 'me', p] as const,
    products: (p: PeriodParams) => ['dashboard', 'products', p] as const,
    reasons: (p: PeriodParams) => ['dashboard', 'reasons', p] as const,
    funnel: (p: PeriodParams) => ['dashboard', 'funnel', p] as const,
    agreements: (p: PeriodParams) => ['dashboard', 'agreements', p] as const,
    signals: (p: PeriodParams) => ['dashboard', 'signals', p] as const,
    insights: (widget: string, p: PeriodParams) =>
      ['dashboard', 'insights', widget, p] as const,
    exports: () => ['dashboard', 'exports'] as const,
    export: (id: UUID) => ['dashboard', 'exports', id] as const,
  },

  integrations: {
    all: () => ['integrations'] as const,
    instagram: () => ['integrations', 'instagram'] as const,
    telegram: () => ['integrations', 'telegram'] as const,
    web: () => ['integrations', 'web'] as const,
    backfillJobs: (accountId: UUID) =>
      ['integrations', 'telegram', accountId, 'backfill'] as const,
  },
} as const
