import { Lock, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { useDeleteReason, useReasons, type Reason } from '@/entities/catalog'
import { useSession } from '@/entities/session'
import { ReasonDialog } from '@/features/reason-form'
import { useTranslation } from '@/shared/i18n'
import { QueryBoundary } from '@/shared/ui/feedback/query-boundary'
import { Badge } from '@/shared/ui/primitives/badge'
import { Button } from '@/shared/ui/primitives/button'
import { Card, CardBody, CardHeader } from '@/shared/ui/primitives/card'
import { Skeleton } from '@/shared/ui/primitives/skeleton'

/**
 * The reason taxonomy.
 *
 * Two visually separate layers: the 8 global defaults are immutable — a PUT,
 * PATCH or DELETE against one answers 404 — so they carry no edit controls at
 * all rather than offering a button that fails (docs/04).
 */
export function ReasonsTable() {
  const { t } = useTranslation()
  const session = useSession()
  const query = useReasons()
  const remove = useDeleteReason()

  const [editing, setEditing] = useState<Reason | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <Card>
      <CardHeader
        title={t('settings.reasons')}
        description={t('reasonsTable.description')}
        actions={
          session.canWrite ? (
            <Button
              variant="primary"
              size="sm"
              icon={<Plus />}
              onClick={() => {
                setEditing(null)
                setDialogOpen(true)
              }}
            >
              {t('reasonsTable.add')}
            </Button>
          ) : null
        }
      />

      <CardBody>
        <QueryBoundary
          query={query}
          loading={
            <div className="space-y-2">
              {Array.from({ length: 8 }, (_, index) => (
                <Skeleton key={index} className="h-11 rounded-lg" />
              ))}
            </div>
          }
        >
          {(reasons) => {
            const defaults = reasons.filter((reason) => reason.is_default)
            const own = reasons.filter((reason) => !reason.is_default)

            return (
              <div className="space-y-6">
                <ReasonGroup
                  title={t('reasonsTable.defaults')}
                  hint={t('reasonsTable.defaultsHint')}
                  reasons={defaults}
                  locked
                />

                <ReasonGroup
                  title={t('reasonsTable.own')}
                  hint={t('reasonsTable.ownHint')}
                  reasons={own}
                  emptyText={t('reasonsTable.noOwn')}
                  onEdit={
                    session.canWrite
                      ? (reason) => {
                          setEditing(reason)
                          setDialogOpen(true)
                        }
                      : undefined
                  }
                  onDelete={
                    session.canWrite
                      ? (reason) => remove.mutate(reason.id)
                      : undefined
                  }
                />
              </div>
            )
          }}
        </QueryBoundary>
      </CardBody>

      <ReasonDialog
        reason={editing}
        existingCodes={(query.data ?? []).map((reason) => reason.code)}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </Card>
  )
}

function ReasonGroup({
  title,
  hint,
  reasons,
  locked,
  emptyText,
  onEdit,
  onDelete,
}: {
  title: string
  hint: string
  reasons: Reason[]
  locked?: boolean
  emptyText?: string
  onEdit?: (reason: Reason) => void
  onDelete?: (reason: Reason) => void
}) {
  const { t } = useTranslation()

  return (
    <section>
      <h3 className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-fg-muted uppercase">
        {locked ? <Lock className="size-3.5" aria-hidden /> : null}
        {title}
      </h3>
      <p className="mt-1 mb-3 text-xs leading-5 text-fg-subtle">{hint}</p>

      {reasons.length === 0 ? (
        <p className="text-[13px] text-fg-subtle">{emptyText}</p>
      ) : (
        <ul className="space-y-1.5">
          {reasons.map((reason) => (
            <li
              key={reason.id}
              className="flex items-center gap-3 rounded-lg bg-surface-muted px-3.5 py-2.5 ring-1 ring-line"
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] text-fg">
                  {reason.label}
                </span>
                <code className="block truncate text-2xs text-fg-subtle">
                  {reason.code}
                </code>
              </span>

              {locked ? (
                <Badge tone="outline" size="sm">
                  {t('reasonsTable.locked')}
                </Badge>
              ) : (
                <span className="flex gap-0.5">
                  {onEdit ? (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={t('reasonForm.editTitle')}
                      onClick={() => onEdit(reason)}
                    >
                      <Pencil />
                    </Button>
                  ) : null}
                  {onDelete ? (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-danger-fg"
                      aria-label={t('reasonsTable.delete')}
                      onClick={() => onDelete(reason)}
                    >
                      <Trash2 />
                    </Button>
                  ) : null}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
