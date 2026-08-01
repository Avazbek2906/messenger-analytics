import { useMutation } from '@tanstack/react-query'
import { Download } from 'lucide-react'

import { canDownload, exportApi, type ExportFile } from '@/entities/export'
import { useTranslation } from '@/shared/i18n'
import { downloadBlob } from '@/shared/lib'
import { Button } from '@/shared/ui/primitives/button'

/**
 * Downloads a finished export.
 *
 * The route requires a JWT, so a plain anchor would 401 — the workbook is
 * fetched as a blob and saved client-side using the filename the server put in
 * `Content-Disposition` (docs/06).
 */
export function DownloadButton({ row }: { row: ExportFile }) {
  const { t } = useTranslation()

  const download = useMutation({
    mutationFn: () => exportApi.download(row.id),
    onSuccess: ({ blob, filename }) => {
      downloadBlob(blob, filename ?? `${row.kind}.xlsx`)
    },
  })

  return (
    <Button
      size="sm"
      icon={<Download />}
      loading={download.isPending}
      disabled={!canDownload(row)}
      onClick={() => download.mutate()}
    >
      {t('reports.download')}
    </Button>
  )
}
