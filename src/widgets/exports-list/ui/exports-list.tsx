import { FileSpreadsheet } from 'lucide-react'

import {
  isExpired,
  useExports,
  type ExportFile,
  type ExportStatus,
} from '@/entities/export'
import { useSession } from '@/entities/session'
import { DownloadButton } from '@/features/export-download'
import type { PeriodParams } from '@/shared/api'
import { useTranslation, type MessageKey } from '@/shared/i18n'
import { formatDate, formatDateTime, formatRelative } from '@/shared/lib'
import { QueryBoundary } from '@/shared/ui/feedback/query-boundary'
import { EmptyState } from '@/shared/ui/feedback/states'
import { Badge, type BadgeTone } from '@/shared/ui/primitives/badge'
import { Card, CardBody, CardHeader } from '@/shared/ui/primitives/card'
import { Skeleton } from '@/shared/ui/primitives/skeleton'

import { CreateExport } from './create-export'

const STATUS_TONES: Record<ExportStatus, BadgeTone> = {
  pending: 'info',
  running: 'info',
  done: 'success',
  error: 'danger',
}

/**
 * Export jobs.
 *
 * An export is a download, not an archive: the file lives 24 hours and both it
 * and its row are then swept, turning the id into `export_not_found`. The list
 * therefore surfaces the expiry instead of pretending old rows are usable
 * (docs/06).
 */
export function ExportsList({ period }: { period: PeriodParams }) {
  const { t } = useTranslation()
  const session = useSession()
  const query = useExports()

  return (
    <Card>
      <CardHeader
        title={t('reports.title')}
        description={t('reports.description')}
        actions={session.canWrite ? <CreateExport period={period} /> : null}
      />

      <CardBody>
        <QueryBoundary
          query={query}
          loading={
            <div className="space-y-2">
              {Array.from({ length: 3 }, (_, index) => (
                <Skeleton key={index} className="h-16 rounded-lg" />
              ))}
            </div>
          }
          empty={
            <EmptyState
              icon={<FileSpreadsheet />}
              title={t('reports.empty.title')}
              description={t('reports.empty.description')}
            />
          }
        >
          {(rows) => (
            <ul className="space-y-2">
              {rows.map((row: ExportFile) => (
                <li
                  key={row.id}
                  className="flex flex-wrap items-center gap-3 rounded-lg bg-surface-muted px-3.5 py-3 ring-1 ring-line"
                >
                  <FileSpreadsheet
                    className="size-4 shrink-0 text-fg-subtle"
                    aria-hidden
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-fg">
                      {t(`reports.kind.${row.kind}` as MessageKey)}
                    </p>
                    <p className="truncate text-2xs text-fg-subtle">
                      {t('reports.window', {
                        from: formatDate(row.params.date_from ?? null),
                        to: formatDate(row.params.date_to ?? null),
                      })}
                      {' · '}
                      {formatDateTime(row.created_at)}
                    </p>
                    {row.error ? (
                      <p className="mt-1 text-xs leading-5 text-danger-fg">
                        {row.error}
                      </p>
                    ) : null}
                  </div>

                  {row.expires_at ? (
                    <span className="text-2xs whitespace-nowrap text-fg-subtle">
                      {isExpired(row)
                        ? t('reports.expired')
                        : t('reports.expiresIn', {
                            value: formatRelative(row.expires_at),
                          })}
                    </span>
                  ) : null}

                  <Badge tone={STATUS_TONES[row.status]} size="sm">
                    {t(`exportStatus.${row.status}` as MessageKey)}
                  </Badge>

                  <DownloadButton row={row} />
                </li>
              ))}
            </ul>
          )}
        </QueryBoundary>
      </CardBody>
    </Card>
  )
}
