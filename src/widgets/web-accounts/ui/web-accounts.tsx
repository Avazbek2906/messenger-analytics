import { Globe, KeyRound, Plus } from 'lucide-react'
import { useState } from 'react'

import {
  useCreateWebAccount,
  useRotateWidgetKey,
  useWebAccounts,
  type WebAccount,
} from '@/entities/integration'
import { useSession } from '@/entities/session'
import { WidgetKeyDialog } from '@/features/web-widget-key'
import { useTranslation } from '@/shared/i18n'
import { formatDate } from '@/shared/lib'
import { QueryBoundary } from '@/shared/ui/feedback/query-boundary'
import { EmptyState } from '@/shared/ui/feedback/states'
import { Button } from '@/shared/ui/primitives/button'
import { Card, CardBody, CardHeader } from '@/shared/ui/primitives/card'
import { Dialog } from '@/shared/ui/primitives/dialog'
import { Field, Input } from '@/shared/ui/primitives/input'
import { Skeleton } from '@/shared/ui/primitives/skeleton'

/**
 * Web widget accounts.
 *
 * Kotib does not host the site chat: the customer's own backend reports each
 * message server-to-server using the widget key. Listings only ever show the
 * masked key, so rotation is the recovery path when one is lost (docs/07).
 */
export function WebAccounts() {
  const { t } = useTranslation()
  const session = useSession()

  const query = useWebAccounts()
  const create = useCreateWebAccount()
  const rotate = useRotateWidgetKey()

  const [createOpen, setCreateOpen] = useState(false)
  const [name, setName] = useState('')
  const [revealedKey, setRevealedKey] = useState<string | null>(null)

  return (
    <Card>
      <CardHeader
        title={t('web.title')}
        description={t('web.description')}
        actions={
          session.canWrite ? (
            <Button
              variant="primary"
              size="sm"
              icon={<Plus />}
              onClick={() => setCreateOpen(true)}
            >
              {t('web.create')}
            </Button>
          ) : null
        }
      />

      <CardBody>
        <QueryBoundary
          query={query}
          loading={<Skeleton className="h-16 rounded-lg" />}
          empty={
            <EmptyState
              icon={<Globe />}
              title={t('web.empty.title')}
              description={t('web.empty.description')}
              compact
            />
          }
        >
          {(accounts) => (
            <ul className="space-y-2">
              {accounts.map((account: WebAccount) => (
                <li
                  key={account.id}
                  className="flex flex-wrap items-center gap-3 rounded-lg bg-surface-muted px-3.5 py-3 ring-1 ring-line"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-fg">
                      {account.name || t('web.unnamed')}
                    </p>
                    <p className="font-mono text-2xs text-fg-subtle">
                      {account.widget_key} ·{' '}
                      {formatDate(account.connected_at ?? account.created_at)}
                    </p>
                  </div>

                  {session.canWrite ? (
                    <Button
                      size="sm"
                      icon={<KeyRound />}
                      loading={rotate.isPending}
                      onClick={() =>
                        rotate.mutate(account.id, {
                          onSuccess: (updated) =>
                            setRevealedKey(updated.widget_key),
                        })
                      }
                    >
                      {t('web.rotate')}
                    </Button>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </QueryBoundary>

        <p className="mt-3 text-2xs leading-5 text-fg-subtle">
          {t('web.rotateWarning')}
        </p>
      </CardBody>

      <Dialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title={t('web.createTitle')}
        description={t('web.createDescription')}
        footer={
          <>
            <Button onClick={() => setCreateOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="primary"
              loading={create.isPending}
              onClick={() =>
                create.mutate(name.trim(), {
                  onSuccess: (account) => {
                    setRevealedKey(account.widget_key)
                    setCreateOpen(false)
                    setName('')
                  },
                })
              }
            >
              {t('web.create')}
            </Button>
          </>
        }
      >
        <Field label={t('web.name')} hint={t('web.nameHint')}>
          {(field) => (
            <Input
              {...field}
              value={name}
              placeholder="Main site"
              onChange={(event) => setName(event.target.value)}
            />
          )}
        </Field>
      </Dialog>

      <WidgetKeyDialog
        widgetKey={revealedKey}
        onClose={() => setRevealedKey(null)}
      />
    </Card>
  )
}
