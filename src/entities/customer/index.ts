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
  type PageParams,
  type Paginated,
  type UUID,
} from '@/shared/api'
import type { Channel } from '@/entities/conversation'

/**
 * One customer identity on ONE channel.
 *
 * The same human on Telegram and Instagram is two rows until a manager merges
 * them — there is no automatic matching in v1 (docs/03).
 */
export interface Customer {
  id: UUID
  channel: Channel
  /** The channel-side id, unique per (company, channel). */
  external_id: string
  /** `""` when unknown — never `null`. */
  display_name: string
  username: string
  phone: string
  /** `null` ⇒ this row is canonical and is what statistics count. */
  merged_into: UUID | null
  /** Identities absorbed INTO this one. Chains are exactly one hop deep. */
  merged_customers: UUID[]
  created_at: ApiDateTime
}

export interface CustomerFilters extends PageParams {
  channel?: Channel
  search?: string
  ordering?: string
}

export const customerApi = {
  list: (filters: CustomerFilters, signal?: AbortSignal) =>
    http.get<Paginated<Customer>>('chats/customers', { ...filters }, signal),

  detail: (id: UUID) => http.get<Customer>(`chats/customers/${id}`),

  /**
   * Folds the customer in the path (the source) into the one in the body.
   *
   * Nothing is rewritten — the source keeps its conversations — it simply stops
   * counting separately. The response is the TARGET, but its
   * `merged_customers` is serialized from a prefetch taken BEFORE the merge, so
   * the just-absorbed id can be missing from it (docs/03).
   */
  merge: (sourceId: UUID, targetId: UUID) =>
    http.post<Customer>(`chats/customers/${sourceId}/merge`, {
      into: targetId,
    }),
}

export function useCustomers(filters: CustomerFilters) {
  return useQuery({
    queryKey: queryKeys.customers.list(filters),
    queryFn: ({ signal }) => customerApi.list(filters, signal),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  })
}

/**
 * Merges two identities.
 *
 * Customers change only when someone merges them, so nothing here polls. The
 * whole list is invalidated afterwards because the response cannot be trusted
 * to already contain the absorbed id.
 */
export function useMergeCustomers() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ source, target }: { source: UUID; target: UUID }) =>
      customerApi.merge(source, target),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.customers.all(),
      })
    },
  })
}

/** Absorbed rows must never appear in a merge-target picker (docs/03). */
export function isCanonical(customer: Customer): boolean {
  return customer.merged_into === null
}
