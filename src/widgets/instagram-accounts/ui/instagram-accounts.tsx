import { useMutation } from '@tanstack/react-query'
import { Camera, Pause, Play, RefreshCw, Trash2 } from 'lucide-react'
import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

import {
  instagramState,
  integrationApi,
  useDeleteInstagram,
  useInstagramAccounts,
  useToggleInstagram,
  type InstagramAccount,
  type InstagramState,
} from '@/entities/integration'
import { useSession } from '@/entities/session'
import { useTranslation, type MessageKey } from '@/shared/i18n'
import { formatDate } from '@/shared/lib'
import { QueryBoundary } from '@/shared/ui/feedback/query-boundary'
import { EmptyState } from '@/shared/ui/feedback/states'
import { Badge, type BadgeTone } from '@/shared/ui/primitives/badge'
import { Button } from '@/shared/ui/primitives/button'
import { Card, CardBody, CardHeader } from '@/shared/ui/primitives/card'
import { Skeleton } from '@/shared/ui/primitives/skeleton'

const STATE_TONES: Record<InstagramState, BadgeTone> = {
  monitoring: 'success',
  paused: 'neutral',
  token_expiring: 'warning',
  reconnect_required: 'danger',
}

/**
 * Connected Instagram accounts.
 *
 * Connecting is an OAuth round-trip: the authorize URL is fetched with the JWT
 * (a browser cannot carry a Bearer header on a top-level redirect) and then
 * navigated to. Meta returns to this route with `?instagram=connected|error`
 * (docs/07).
 */
export function InstagramAccounts() {
  const { t } = useTranslation()
  const session = useSession()
  const query = useInstagramAccounts()
  const toggle = useToggleInstagram()
  const remove = useDeleteInstagram()
  const [searchParams, setSearchParams] = useSearchParams()

  const outcome = searchParams.get('instagram')
  const reason = searchParams.get('reason')

  // Clear the OAuth params once read so a reload does not re-announce the result.
  useEffect(() => {
    if (!outcome) return
    const timer = setTimeout(() => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current)
          next.delete('instagram')
          next.delete('reason')
          return next
        },
        { replace: true },
      )
    }, 8000)
    return () => clearTimeout(timer)
  }, [outcome, setSearchParams])

  const connect = useMutation({
    mutationFn: integrationApi.instagramStart,
    onSuccess: ({ authorize_url }) => {
      window.location.href = authorize_url
    },
  })

  return (
    <Card>
      <CardHeader
        title={t('instagram.title')}
        description={t('instagram.description')}
        actions={
          session.canWrite ? (
            <Button
              variant="primary"
              size="sm"
              icon={<Camera />}
              loading={connect.isPending}
              onClick={() => connect.mutate()}
            >
              {t('instagram.connect')}
            </Button>
          ) : null
        }
      />

      <CardBody className="space-y-3">
        {outcome === 'connected' ? (
          <p className="rounded-md bg-success-soft px-3 py-2 text-[13px] text-success-fg">
            {t('instagram.connectSuccess')}
          </p>
        ) : null}

        {outcome === 'error' ? (
          <p
            role="alert"
            className="rounded-md bg-danger-soft px-3 py-2 text-[13px] text-danger-fg"
          >
            {/* Meta's own reason text is the only actionable detail here — the
                most common one is simply an expired 10-minute OAuth state. */}
            {reason || t('instagram.connectFailed')}
          </p>
        ) : null}

        <QueryBoundary
          query={query}
          loading={<Skeleton className="h-20 rounded-lg" />}
          empty={
            <EmptyState
              title={t('instagram.empty.title')}
              description={t('instagram.empty.description')}
              compact
            />
          }
        >
          {(accounts) => (
            <ul className="space-y-2">
              {accounts.map((account: InstagramAccount) => {
                const state = instagramState(account)
                const needsReconnect =
                  state === 'reconnect_required' || state === 'token_expiring'

                return (
                  <li
                    key={account.id}
                    className="flex flex-wrap items-center gap-3 rounded-lg bg-surface-muted px-3.5 py-3 ring-1 ring-line"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-fg">
                        @{account.username}
                      </p>
                      <p className="text-2xs text-fg-subtle">
                        {t('instagram.tokenUntil', {
                          date: formatDate(account.token_expires_at),
                        })}
                      </p>
                    </div>

                    <Badge tone={STATE_TONES[state]} size="sm">
                      {t(`instagramState.${state}` as MessageKey)}
                    </Badge>

                    {session.canWrite ? (
                      <div className="flex gap-0.5">
                        {needsReconnect ? (
                          <Button
                            size="sm"
                            icon={<RefreshCw />}
                            loading={connect.isPending}
                            onClick={() => connect.mutate()}
                          >
                            {t('instagram.reconnect')}
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            disabled={toggle.isPending}
                            aria-label={t(
                              account.is_active
                                ? 'instagram.pause'
                                : 'instagram.resume',
                            )}
                            onClick={() => toggle.mutate(account.id)}
                          >
                            {account.is_active ? <Pause /> : <Play />}
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-danger-fg"
                          disabled={remove.isPending}
                          aria-label={t('instagram.remove')}
                          onClick={() => remove.mutate(account.id)}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    ) : null}
                  </li>
                )
              })}
            </ul>
          )}
        </QueryBoundary>
      </CardBody>
    </Card>
  )
}
