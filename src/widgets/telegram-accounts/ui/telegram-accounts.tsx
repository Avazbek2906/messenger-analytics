import { AlertTriangle, LogOut, Send } from 'lucide-react'
import { useState } from 'react'

import { useEmployees } from '@/entities/employee'
import {
  isHeartbeatStale,
  useDisconnectTelegram,
  useTelegramAccounts,
  useUpdateTelegram,
  type AccountStatus,
  type TelegramAccount,
} from '@/entities/integration'
import { useSession } from '@/entities/session'
import { TelegramConnectDialog } from '@/features/connect-telegram'
import { useTranslation, type MessageKey } from '@/shared/i18n'
import { formatRelative } from '@/shared/lib'
import { QueryBoundary } from '@/shared/ui/feedback/query-boundary'
import { EmptyState } from '@/shared/ui/feedback/states'
import { Badge, type BadgeTone } from '@/shared/ui/primitives/badge'
import { Button } from '@/shared/ui/primitives/button'
import { Card, CardBody, CardHeader } from '@/shared/ui/primitives/card'
import { Select } from '@/shared/ui/primitives/select'
import { Skeleton } from '@/shared/ui/primitives/skeleton'

import { BackfillPanel } from './backfill-panel'

const NONE = '__none__'

const STATUS_TONES: Record<AccountStatus, BadgeTone> = {
  pending: 'info',
  connected: 'success',
  disconnected: 'neutral',
  error: 'danger',
}

/**
 * Connected Telegram userbot accounts.
 *
 * Telegram is DM-only by design — group chats are deliberately not monitored.
 * A `connected` account whose heartbeat has gone quiet for ~15 minutes gets an
 * early warning before its status actually flips (docs/07).
 */
export function TelegramAccounts() {
  const { t } = useTranslation()
  const session = useSession()

  const query = useTelegramAccounts()
  const employees = useEmployees()
  const update = useUpdateTelegram()
  const disconnect = useDisconnectTelegram()
  const [connectOpen, setConnectOpen] = useState(false)

  return (
    <Card>
      <CardHeader
        title={t('telegram.title')}
        description={t('telegram.description')}
        actions={
          session.canWrite ? (
            <Button
              variant="primary"
              size="sm"
              icon={<Send />}
              onClick={() => setConnectOpen(true)}
            >
              {t('telegram.connect')}
            </Button>
          ) : null
        }
      />

      <CardBody>
        <QueryBoundary
          query={query}
          loading={<Skeleton className="h-24 rounded-lg" />}
          empty={
            <EmptyState
              title={t('telegram.empty.title')}
              description={t('telegram.empty.description')}
              compact
            />
          }
        >
          {(accounts) => (
            <ul className="space-y-3">
              {accounts.map((account: TelegramAccount) => {
                const stale = isHeartbeatStale(
                  account.status,
                  account.last_healthy_at,
                )

                return (
                  <li
                    key={account.id}
                    className="space-y-3 rounded-lg bg-surface-muted px-3.5 py-3 ring-1 ring-line"
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium text-fg">
                          {account.name || account.external_id}
                        </p>
                        <p className="text-2xs text-fg-subtle">
                          {t('telegram.lastHealthy', {
                            value: formatRelative(account.last_healthy_at),
                          })}
                        </p>
                      </div>

                      <Badge tone={STATUS_TONES[account.status]} size="sm">
                        {t(`accountStatus.${account.status}` as MessageKey)}
                      </Badge>

                      {session.canWrite ? (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          disabled={disconnect.isPending}
                          aria-label={t('telegram.disconnect')}
                          onClick={() => disconnect.mutate(account.id)}
                        >
                          <LogOut />
                        </Button>
                      ) : null}
                    </div>

                    {stale ? (
                      <p className="flex items-start gap-2 rounded-md bg-warning-soft px-3 py-2 text-xs leading-5 text-warning-fg">
                        <AlertTriangle
                          className="mt-px size-3.5 shrink-0"
                          aria-hidden
                        />
                        {t('telegram.staleHeartbeat')}
                      </p>
                    ) : null}

                    {/* Attribution mode 1 resolves every conversation on this
                        account to its default employee (docs/07). */}
                    <Select
                      aria-label={t('telegram.defaultEmployee')}
                      className="h-9 text-[13px]"
                      disabled={!session.canWrite || update.isPending}
                      value={account.default_employee ?? NONE}
                      onChange={(value) =>
                        update.mutate({
                          id: account.id,
                          input: {
                            default_employee: value === NONE ? null : value,
                          },
                        })
                      }
                      options={[
                        { value: NONE, label: t('telegram.noDefaultEmployee') },
                        ...(employees.data?.results ?? []).map((employee) => ({
                          value: employee.id,
                          label: employee.full_name,
                        })),
                      ]}
                    />

                    <BackfillPanel accountId={account.id} />
                  </li>
                )
              })}
            </ul>
          )}
        </QueryBoundary>
      </CardBody>

      <TelegramConnectDialog open={connectOpen} onOpenChange={setConnectOpen} />
    </Card>
  )
}
