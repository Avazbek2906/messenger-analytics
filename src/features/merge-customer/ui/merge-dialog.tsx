import { ArrowRight, Search } from 'lucide-react'
import { useEffect, useState } from 'react'

import {
  isCanonical,
  useCustomers,
  useMergeCustomers,
  type Customer,
} from '@/entities/customer'
import { ChannelIcon } from '@/entities/conversation'
import { ApiError } from '@/shared/api'
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value'
import {
  useTranslation,
  type MessageKey,
  type TranslateFn,
} from '@/shared/i18n'
import { cn, orDash } from '@/shared/lib'
import { Button } from '@/shared/ui/primitives/button'
import { Dialog } from '@/shared/ui/primitives/dialog'
import { Field, Input } from '@/shared/ui/primitives/input'

/**
 * Merges one customer identity into another.
 *
 * The source is folded into the target: it keeps its conversations but stops
 * counting separately in statistics. Already-absorbed rows are filtered out of
 * the picker, because merging into a non-canonical row is rejected with
 * `merge_target_not_canonical` (docs/03).
 */
export function MergeDialog({
  source,
  open,
  onOpenChange,
}: {
  source: Customer | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useTranslation()
  const merge = useMergeCustomers()

  const [search, setSearch] = useState('')
  const debounced = useDebouncedValue(search)
  const [target, setTarget] = useState<Customer | null>(null)

  const candidates = useCustomers({
    ...(debounced ? { search: debounced } : {}),
    limit: 20,
  })

  useEffect(() => {
    if (open) return
    merge.reset()
    setSearch('')
    setTarget(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const options = (candidates.data?.results ?? []).filter(
    (candidate) => isCanonical(candidate) && candidate.id !== source?.id,
  )

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      size="lg"
      title={t('merge.title')}
      description={t('merge.description')}
      footer={
        <>
          <Button onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="primary"
            loading={merge.isPending}
            disabled={!source || !target}
            onClick={() =>
              source &&
              target &&
              merge.mutate(
                { source: source.id, target: target.id },
                { onSuccess: () => onOpenChange(false) },
              )
            }
          >
            {t('merge.submit')}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-lg bg-surface-muted px-3.5 py-3 ring-1 ring-line">
          <CustomerLine customer={source} />
          <ArrowRight className="size-4 shrink-0 text-fg-subtle" aria-hidden />
          {target ? (
            <CustomerLine customer={target} />
          ) : (
            <span className="flex-1 text-[13px] text-fg-subtle">
              {t('merge.pickTarget')}
            </span>
          )}
        </div>

        <Field label={t('merge.search')} hint={t('merge.searchHint')}>
          {(field) => (
            <Input
              {...field}
              type="search"
              value={search}
              leading={<Search />}
              onChange={(event) => setSearch(event.target.value)}
            />
          )}
        </Field>

        <ul className="scrollbar-slim max-h-64 space-y-1 overflow-y-auto">
          {options.map((candidate) => (
            <li key={candidate.id}>
              <button
                type="button"
                onClick={() => setTarget(candidate)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors',
                  candidate.id === target?.id
                    ? 'bg-primary-soft ring-1 ring-primary/25'
                    : 'hover:bg-surface-muted',
                )}
              >
                <CustomerLine customer={candidate} />
              </button>
            </li>
          ))}
        </ul>

        {merge.isError ? (
          <p role="alert" className="text-[13px] text-danger-fg">
            {describeMergeError(merge.error, t)}
          </p>
        ) : null}
      </div>
    </Dialog>
  )
}

function CustomerLine({ customer }: { customer: Customer | null }) {
  if (!customer) return null

  return (
    <span className="flex min-w-0 flex-1 items-center gap-2">
      <ChannelIcon channel={customer.channel} />
      <span className="min-w-0">
        <span className="block truncate text-[13px] text-fg">
          {orDash(customer.display_name || customer.username)}
        </span>
        <span className="block truncate text-2xs text-fg-subtle">
          {customer.phone || customer.external_id}
        </span>
      </span>
    </span>
  )
}

const ERROR_KEYS: Record<string, MessageKey> = {
  merge_self: 'merge.error.self',
  merge_cycle: 'merge.error.cycle',
  merge_target_not_canonical: 'merge.error.notCanonical',
  customer_other_company: 'merge.error.otherCompany',
  does_not_exist: 'merge.error.notFound',
}

function describeMergeError(error: unknown, t: TranslateFn): string {
  if (!(error instanceof ApiError)) return t('error.unexpected.title')
  if (error.isRoleDenied) return t('error.roleRequired')

  const key = Object.keys(ERROR_KEYS).find((code) => error.has(code))
  if (key) return t(ERROR_KEYS[key] as MessageKey)

  return error.errors[0]?.detail ?? t('error.unknown.detail')
}
