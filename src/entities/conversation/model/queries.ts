import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { queryKeys, type PageParams, type UUID } from '@/shared/api'

import {
  conversationApi,
  type AssignPayload,
  type ConversationFilters,
  type OverridePayload,
} from '../api/conversation-api'
import type { ConversationDetail } from './types'

export function useConversations(filters: ConversationFilters) {
  return useQuery({
    queryKey: queryKeys.conversations.list(filters),
    queryFn: ({ signal }) => conversationApi.list(filters, signal),
    // Keeps the table populated while a new page loads — the old data stays
    // until the new one arrives.
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  })
}

export function useConversation(id: UUID) {
  return useQuery({
    queryKey: queryKeys.conversations.detail(id),
    queryFn: () => conversationApi.detail(id),
    staleTime: 30_000,
  })
}

export function useMessages(id: UUID, page: PageParams) {
  return useQuery({
    queryKey: queryKeys.conversations.messages(id, page),
    queryFn: () => conversationApi.messages(id, page),
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  })
}

/**
 * Assigns a conversation to an employee.
 *
 * The response is a list row, not the detail payload, so the detail query is
 * refetched. Dashboard aggregates sit in a 120 s server cache — invalidating
 * them right away would buy nothing (docs/05 §9).
 */
export function useAssignConversation(id: UUID) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: AssignPayload) => conversationApi.assign(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.detail(id),
      })
      void queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.all(),
      })
    },
  })
}

/**
 * Corrects an AI conclusion.
 *
 * The response is the full detail payload with `effective_*` and `overrides`
 * already updated, so it is written straight into the cache — no refetch
 * needed (docs/03).
 */
export function useOverrideConversation(id: UUID) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: OverridePayload) =>
      conversationApi.override(id, payload),
    onSuccess: (detail: ConversationDetail) => {
      queryClient.setQueryData(queryKeys.conversations.detail(id), detail)
      void queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.all(),
        refetchType: 'none',
      })
    },
  })
}
