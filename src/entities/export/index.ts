import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { http, queryKeys, type PeriodParams, type UUID } from '@/shared/api'

export type ExportKind = 'conversations' | 'ratings'

export type ExportStatus = 'pending' | 'running' | 'done' | 'error'

export interface ExportFile {
  id: UUID
  kind: ExportKind
  status: ExportStatus
  /** The RESOLVED window echoed back, so a listed export is self-describing. */
  params: { date_from?: string; date_to?: string }
  /** Absolute URL of the authenticated download route; `null` until done. */
  file_url: string | null
  /** `""` unless `status` is `error`. */
  error: string
  /** Set when the file is written: `+24h`. `null` while pending or running. */
  expires_at: string | null
  created_at: string
}

export interface CreateExportInput extends PeriodParams {
  kind: ExportKind
}

export const exportApi = {
  /** A bare array capped at the 50 most recent rows — no pagination, no filters. */
  list: () => http.get<ExportFile[]>('dashboard/exports'),

  detail: (id: UUID) => http.get<ExportFile>(`dashboard/exports/${id}`),

  create: (input: CreateExportInput) =>
    http.post<ExportFile>('dashboard/exports', input),

  /**
   * Streams the finished workbook.
   *
   * Auth is required, so a bare `window.open` or `<a download>` cannot work —
   * the file is fetched as a blob and saved client-side. A failure comes back
   * as a JSON error envelope while success is binary (docs/06).
   */
  download: (id: UUID) => http.blob(`dashboard/exports/${id}/download`),
}

/**
 * Export jobs.
 *
 * Polled while anything is still building; stops once every row is terminal.
 * Nothing here is cached long: expired rows are swept after 24 h and their ids
 * turn into `export_not_found`, so they must not be persisted (docs/06).
 */
export function useExports() {
  return useQuery({
    queryKey: queryKeys.dashboard.exports(),
    queryFn: exportApi.list,
    staleTime: 10_000,
    refetchInterval: (query) => {
      const rows = query.state.data ?? []
      const building = rows.some(
        (row) => row.status === 'pending' || row.status === 'running',
      )
      if (!building || document.visibilityState !== 'visible') return false
      return 4000
    },
  })
}

export function useCreateExport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: exportApi.create,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard.exports(),
      })
    },
  })
}

/** `expires_at` has passed: both the file and the row are already gone. */
export function isExpired(row: ExportFile): boolean {
  if (!row.expires_at) return false
  return new Date(row.expires_at).getTime() <= Date.now()
}

/**
 * Whether the download button should be enabled.
 *
 * Gated on `file_url` rather than on `status === 'done'`: the server requires
 * both, and `file_url` folds them into a single check (docs/06).
 */
export function canDownload(row: ExportFile): boolean {
  return row.file_url !== null && !isExpired(row)
}
