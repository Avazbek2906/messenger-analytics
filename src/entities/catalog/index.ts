import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import {
  http,
  queryKeys,
  type ApiDateTime,
  type Paginated,
  type UUID,
} from '@/shared/api'

/* -------------------------------------------------------------- Product */

export interface Product {
  id: UUID
  name: string
  category: string
  description: string
  /** A decimal STRING or `null` — parse before treating it as a number. */
  price: string | null
  currency: string
  is_active: boolean
  created_at: ApiDateTime
}

export interface ProductInput {
  name: string
  category?: string
  description?: string
  /** A decimal string or `null`; max 12 integer digits and 2 decimals. */
  price?: string | null
  currency?: string
  is_active?: boolean
}

export interface ProductFilters {
  is_active?: boolean
  /** EXACT match, not a contains match — populate options from loaded values. */
  category?: string
  currency?: string
  search?: string
  ordering?: string
  limit?: number
  offset?: number
}

/* --------------------------------------------------------------- Reason */

export interface Reason {
  id: UUID
  /** The stable machine key. Overrides store exactly this code. */
  code: string
  label: string
  /** `true` — one of the 8 platform-wide defaults; not editable. */
  is_default: boolean
}

export interface ReasonInput {
  code: string
  label: string
}

/* ------------------------------------------------------------- Rulebook */

export type RulebookStatus = 'uploaded' | 'processing' | 'ready' | 'error'

export interface Rulebook {
  id: UUID
  /** Absolute URL — render as a download link, label it with `original_name`. */
  file: string
  original_name: string
  status: RulebookStatus
  /** `""` unless `status` is `error`. Written for humans; safe to show as-is. */
  error: string
  created_at: ApiDateTime
}

export const catalogApi = {
  products: (filters: ProductFilters = {}) =>
    http.get<Paginated<Product>>('catalog/products', { ...filters }),

  createProduct: (input: ProductInput) =>
    http.post<Product>('catalog/products', input),

  updateProduct: (id: UUID, input: Partial<ProductInput>) =>
    http.patch<Product>(`catalog/products/${id}`, input),

  deleteProduct: (id: UUID) => http.delete(`catalog/products/${id}`),

  /** Unpaginated — the response is a bare array (docs/04). */
  reasons: () => http.get<Reason[]>('catalog/reasons'),

  createReason: (input: ReasonInput) =>
    http.post<Reason>('catalog/reasons', input),

  /** Company-owned rows only: a default reason id answers 404. */
  updateReason: (id: UUID, input: Partial<ReasonInput>) =>
    http.patch<Reason>(`catalog/reasons/${id}`, input),

  deleteReason: (id: UUID) => http.delete(`catalog/reasons/${id}`),

  rulebooks: () => http.get<Paginated<Rulebook>>('catalog/rulebooks'),

  rulebook: (id: UUID) => http.get<Rulebook>(`catalog/rulebooks/${id}`),

  /** `multipart/form-data` only — a JSON body is rejected with 415. */
  uploadRulebook: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return http.upload<Rulebook>('catalog/rulebooks', form)
  },

  deleteRulebook: (id: UUID) => http.delete(`catalog/rulebooks/${id}`),
}

/* --------------------------------------------------------------- Hooks */

/**
 * The reason taxonomy: 8 global defaults plus the company's own extensions.
 *
 * The list is small (usually < 20) and rarely changes, so it is fetched once
 * and cached for the whole session (docs/04 "Frontend notes").
 */
export function useReasons() {
  return useQuery({
    queryKey: queryKeys.catalog.reasons(),
    queryFn: catalogApi.reasons,
    staleTime: 30 * 60_000,
  })
}

export function useProducts(filters: ProductFilters = { is_active: true }) {
  return useQuery({
    queryKey: queryKeys.catalog.products(filters),
    queryFn: () => catalogApi.products({ limit: 100, ...filters }),
    staleTime: 10 * 60_000,
    // Same as the roster: the filter is a search box.
    placeholderData: keepPreviousData,
  })
}

export function useRulebooks() {
  return useQuery({
    queryKey: queryKeys.catalog.rulebooks(),
    queryFn: catalogApi.rulebooks,
    staleTime: 30_000,
  })
}

function useInvalidate(key: readonly unknown[]) {
  const queryClient = useQueryClient()
  return () => void queryClient.invalidateQueries({ queryKey: key })
}

export function useCreateProduct() {
  const invalidate = useInvalidate(['catalog', 'products'])
  return useMutation({
    mutationFn: catalogApi.createProduct,
    onSuccess: invalidate,
  })
}

export function useUpdateProduct() {
  const invalidate = useInvalidate(['catalog', 'products'])
  return useMutation({
    mutationFn: ({ id, input }: { id: UUID; input: Partial<ProductInput> }) =>
      catalogApi.updateProduct(id, input),
    onSuccess: invalidate,
  })
}

export function useDeleteProduct() {
  const invalidate = useInvalidate(['catalog', 'products'])
  return useMutation({
    mutationFn: catalogApi.deleteProduct,
    onSuccess: invalidate,
  })
}

export function useCreateReason() {
  const invalidate = useInvalidate(queryKeys.catalog.reasons())
  return useMutation({
    mutationFn: catalogApi.createReason,
    onSuccess: invalidate,
  })
}

export function useUpdateReason() {
  const invalidate = useInvalidate(queryKeys.catalog.reasons())
  return useMutation({
    mutationFn: ({ id, input }: { id: UUID; input: Partial<ReasonInput> }) =>
      catalogApi.updateReason(id, input),
    onSuccess: invalidate,
  })
}

export function useDeleteReason() {
  const invalidate = useInvalidate(queryKeys.catalog.reasons())
  return useMutation({
    mutationFn: catalogApi.deleteReason,
    onSuccess: invalidate,
  })
}

export function useUploadRulebook() {
  const invalidate = useInvalidate(queryKeys.catalog.rulebooks())
  return useMutation({
    mutationFn: catalogApi.uploadRulebook,
    onSuccess: invalidate,
  })
}

export function useDeleteRulebook() {
  const invalidate = useInvalidate(queryKeys.catalog.rulebooks())
  return useMutation({
    mutationFn: catalogApi.deleteRulebook,
    onSuccess: invalidate,
  })
}

/**
 * Polls one upload until it reaches a terminal state.
 *
 * Every 2 s at first, then 5 s after 30 s, and it stops on `ready` / `error`.
 * A long `processing` is normal: Gemini distillation is slow and the task
 * retries twice, so the row only flips to `error` after the final attempt
 * (docs/04).
 */
export function useRulebookStatus(id: UUID | null, startedAt: number) {
  return useQuery({
    queryKey: queryKeys.catalog.rulebook(id ?? ''),
    queryFn: () => catalogApi.rulebook(id as UUID),
    enabled: Boolean(id),
    refetchInterval: (query) => {
      const status = query.state.data?.status
      if (status === 'ready' || status === 'error') return false
      if (document.visibilityState !== 'visible') return false
      return Date.now() - startedAt < 30_000 ? 2000 : 5000
    },
  })
}
