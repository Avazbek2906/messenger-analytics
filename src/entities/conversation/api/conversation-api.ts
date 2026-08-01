import { http, type PageParams, type Paginated, type UUID } from '@/shared/api'

import type {
  Conversation,
  ConversationDetail,
  Outcome,
  RawMessage,
  Sentiment,
} from '../model/types'

/** `ConversationFilter` — docs/03. An unknown param is SILENTLY ignored. */
export interface ConversationFilters extends PageParams {
  search?: string
  ordering?: string
  employee?: UUID
  account?: UUID
  attribution_source?: string
  is_legacy?: boolean
  /** `true` → the unassigned queue; `false` → assigned only. */
  unassigned?: boolean
  /** Matched against the override-resolved outcome. */
  outcome?: Outcome
  sentiment?: Sentiment
  score_min?: number
  score_max?: number
  needs_review?: boolean
  closed_from?: string
  closed_to?: string
  /** The catalog `Product` UUID — not a code. */
  product?: UUID
  /** The catalog `Reason` UUID. Matches on the effective reason. */
  reason?: UUID
  has_violations?: boolean
}

export interface AssignPayload {
  employee: UUID
}

export interface OverridePayload {
  field: 'outcome' | 'score' | 'primary_reason'
  /** ALWAYS a string: even a score goes over the wire as `"70"`. */
  value: string
}

export const conversationApi = {
  list: (filters: ConversationFilters, signal?: AbortSignal) =>
    http.get<Paginated<Conversation>>(
      'chats/conversations',
      { ...filters },
      signal,
    ),

  detail: (id: UUID) =>
    http.get<ConversationDetail>(`chats/conversations/${id}`),

  /** Ordering is fixed to `sent_at` ascending and is not configurable. */
  messages: (id: UUID, page: PageParams) =>
    http.get<Paginated<RawMessage>>(`chats/conversations/${id}/messages`, {
      ...page,
    }),

  /** Returns the updated list row. `attribution_source` becomes `manual`. */
  assign: (id: UUID, payload: AssignPayload) =>
    http.post<Conversation>(`chats/conversations/${id}/assign`, payload),

  /** Returns the full detail, with `effective_*` already reflecting the change. */
  override: (id: UUID, payload: OverridePayload) =>
    http.post<ConversationDetail>(
      `chats/conversations/${id}/override`,
      payload,
    ),

  /**
   * Streams a voice message. A JWT is required, so this cannot be a plain
   * `<audio src>` — it is fetched as a blob. `Range` is unsupported (docs/03).
   */
  audio: (messageId: UUID) => http.blob(`chats/messages/${messageId}/audio`),
}
