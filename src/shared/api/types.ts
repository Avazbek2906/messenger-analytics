/** Shapes that repeat across the whole API. */

export type UUID = string

/** Backend format: `"YYYY-MM-DD HH:MM:SS"` (UTC) — this is NOT ISO-8601. */
export type ApiDateTime = string

/** `"YYYY-MM-DD"`. */
export type ApiDate = string

/** The DRF `LimitOffsetPagination` envelope. */
export interface Paginated<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface PageParams {
  limit?: number
  offset?: number
}

/** Filter params shared by every dashboard endpoint (docs/05). */
export interface PeriodParams {
  date_from?: string
  date_to?: string
  confirmed?: boolean
}

export const DEFAULT_PAGE_SIZE = 25
