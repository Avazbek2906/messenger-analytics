import { Download, FileText, Trash2 } from 'lucide-react'

import {
  useDeleteRulebook,
  useRulebooks,
  type Rulebook,
  type RulebookStatus,
} from '@/entities/catalog'
import { useSession } from '@/entities/session'
import { RulebookUpload } from '@/features/rulebook-upload'
import { useTranslation, type MessageKey } from '@/shared/i18n'
import { formatDateTime } from '@/shared/lib'
import { QueryBoundary } from '@/shared/ui/feedback/query-boundary'
import { EmptyState } from '@/shared/ui/feedback/states'
import { Badge, type BadgeTone } from '@/shared/ui/primitives/badge'
import { Button } from '@/shared/ui/primitives/button'
import { Card, CardBody, CardHeader } from '@/shared/ui/primitives/card'
import { Skeleton } from '@/shared/ui/primitives/skeleton'

const STATUS_TONES: Record<RulebookStatus, BadgeTone> = {
  uploaded: 'info',
  processing: 'info',
  ready: 'success',
  error: 'danger',
}

function statusLabelKey(status: RulebookStatus): MessageKey {
  return `rulebookStatus.${status}` as MessageKey
}

/**
 * Rulebook uploads.
 *
 * The newest `ready` row is the one currently driving analysis — it is badged
 * as active. Deleting a `ready` row is history cleanup, not a way to turn off
 * custom rules: the generated prompt stays active until a newer rulebook is
 * processed (docs/04).
 */
export function RulebooksPanel() {
  const { t } = useTranslation()
  const session = useSession()
  const query = useRulebooks()
  const remove = useDeleteRulebook()

  const activeId = query.data?.results.find((row) => row.status === 'ready')?.id

  return (
    <Card>
      <CardHeader
        title={t('settings.rulebook')}
        description={t('rulebook.description')}
      />

      <CardBody className="space-y-5">
        {session.canWrite ? <RulebookUpload /> : null}

        <QueryBoundary
          query={query}
          loading={
            <div className="space-y-2">
              {Array.from({ length: 3 }, (_, index) => (
                <Skeleton key={index} className="h-14 rounded-lg" />
              ))}
            </div>
          }
          isEmpty={(data) => data.results.length === 0}
          empty={
            <EmptyState
              title={t('rulebook.empty.title')}
              description={t('rulebook.empty.description')}
              compact
            />
          }
        >
          {(data) => (
            <ul className="space-y-2">
              {data.results.map((row: Rulebook) => (
                <li
                  key={row.id}
                  className="flex items-start gap-3 rounded-lg bg-surface-muted px-3.5 py-3 ring-1 ring-line"
                >
                  <FileText
                    className="mt-0.5 size-4 shrink-0 text-fg-subtle"
                    aria-hidden
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-fg">
                      {row.original_name}
                    </p>
                    <p className="text-2xs text-fg-subtle">
                      {formatDateTime(row.created_at)}
                    </p>
                    {row.status === 'error' && row.error ? (
                      <p className="mt-1 text-xs leading-5 text-danger-fg">
                        {row.error}
                      </p>
                    ) : null}
                  </div>

                  {row.id === activeId ? (
                    <Badge tone="brand" size="sm">
                      {t('rulebook.active')}
                    </Badge>
                  ) : null}

                  <Badge tone={STATUS_TONES[row.status]} size="sm">
                    {t(statusLabelKey(row.status))}
                  </Badge>

                  <Button
                    asChild
                    variant="ghost"
                    size="icon-sm"
                    aria-label={t('rulebook.download')}
                  >
                    <a href={row.file} target="_blank" rel="noreferrer">
                      <Download />
                    </a>
                  </Button>

                  {session.canWrite ? (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-danger-fg"
                      disabled={remove.isPending}
                      aria-label={t('rulebook.delete')}
                      onClick={() => remove.mutate(row.id)}
                    >
                      <Trash2 />
                    </Button>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </QueryBoundary>
      </CardBody>
    </Card>
  )
}
