import { useMutation, useQuery } from '@tanstack/react-query'

import {
  ApiError,
  http,
  queryKeys,
  type PeriodParams,
  type UUID,
} from '@/shared/api'

import { useAiStore } from './model/ai-store'

/**
 * Which widget the narration describes.
 *
 * Note there is no `criteria` value — the rubric card gets no insights button
 * (docs/06).
 */
export type InsightWidget =
  | 'overview'
  | 'timeseries'
  | 'ratings'
  | 'products'
  | 'reasons'
  | 'funnel'
  | 'agreements'

export interface InsightResponse {
  widget: InsightWidget
  /** 1–3 plain-text bullets, each truncated to 220 characters. Never `null`. */
  bullets: string[]
}

export interface AskRequest {
  /** Free text, max 500 characters. The answer comes back in its language. */
  question: string
  date_from?: string
  date_to?: string
}

export interface AskResponse {
  /** Plain text, no markdown, truncated server-side to 1200 characters. */
  answer: string
  /** At most 20 ids; may be empty even when `has_data` is true. */
  used_conversations: UUID[]
  /** `false` means the statistics pack could not answer — a normal result. */
  has_data: boolean
}

export const insightApi = {
  forWidget: (widget: InsightWidget, params: PeriodParams) =>
    http.get<InsightResponse>('dashboard/insights', { widget, ...params }),

  /**
   * The heaviest read in the API: nine aggregates plus one LLM round-trip, all
   * synchronous. A minute is the documented floor for the client timeout.
   */
  ask: (payload: AskRequest) =>
    http.post<AskResponse>('dashboard/ask', payload, { timeoutMs: 90_000 }),
}

/**
 * `/ask` has no `period_too_long` guard: a window wider than 400 days fails as
 * an unhandled 500, so the range is clamped here instead (docs/06).
 */
export const ASK_MAX_DAYS = 400

export function clampAskPeriod(period: PeriodParams): PeriodParams {
  const from = period.date_from ? new Date(period.date_from) : null
  const to = period.date_to ? new Date(period.date_to) : null
  if (
    !from ||
    !to ||
    Number.isNaN(from.getTime()) ||
    Number.isNaN(to.getTime())
  ) {
    return period
  }

  const days = (to.getTime() - from.getTime()) / 86_400_000
  if (days <= ASK_MAX_DAYS) return period

  const clamped = new Date(to.getTime() - ASK_MAX_DAYS * 86_400_000)
  return { ...period, date_from: clamped.toISOString() }
}

/**
 * AI narration for one widget.
 *
 * Fired lazily by an explicit click (`enabled`), never on page load — each call
 * is one LLM round-trip on the request thread. The wording changes once the
 * 120 s server cache expires even if the numbers did not, so the text is never
 * used as a React key (docs/06).
 */
export function useWidgetInsights(
  widget: InsightWidget,
  params: PeriodParams,
  enabled: boolean,
) {
  const markUnavailable = useAiStore((state) => state.markUnavailable)

  return useQuery({
    queryKey: queryKeys.dashboard.insights(widget, params),
    queryFn: async () => {
      try {
        return await insightApi.forWidget(widget, params)
      } catch (error) {
        if (error instanceof ApiError && error.has('gemini_not_configured')) {
          markUnavailable()
        }
        throw error
      }
    },
    enabled,
    staleTime: 120_000,
    retry: false,
  })
}

/**
 * The in-platform AI chat.
 *
 * Stateless and one-shot: there is no thread id and no server-side history, so
 * any transcript is client state. It is the heaviest read in the API (nine
 * aggregates plus an LLM round-trip), is not cached and does not stream — hence
 * the long timeout and the hard "never auto-retry" rule (docs/06).
 */
export function useAskAi() {
  const markUnavailable = useAiStore((state) => state.markUnavailable)

  return useMutation({
    mutationFn: (payload: AskRequest) => insightApi.ask(payload),
    onError: (error) => {
      if (error instanceof ApiError && error.has('gemini_not_configured')) {
        markUnavailable()
      }
    },
    retry: false,
  })
}

export { useAiStore } from './model/ai-store'
