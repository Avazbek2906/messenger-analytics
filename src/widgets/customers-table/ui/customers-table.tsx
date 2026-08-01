import { Merge, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { ChannelIcon, channelLabelKey } from '@/entities/conversation'
import { isCanonical, useCustomers, type Customer } from '@/entities/customer'
import { useSession } from '@/entities/session'
import { MergeDialog } from '@/features/merge-customer'
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value'
import { useTranslation } from '@/shared/i18n'
import { DEFAULT_PAGE_SIZE } from '@/shared/api'
import { formatDate, formatNumber, orDash } from '@/shared/lib'
import { DataTable, type Column } from '@/shared/ui/data/data-table'
import { Pagination } from '@/shared/ui/data/pagination'
import { QueryBoundary } from '@/shared/ui/feedback/query-boundary'
import { EmptyState } from '@/shared/ui/feedback/states'
import { Badge } from '@/shared/ui/primitives/badge'
import { Button } from '@/shared/ui/primitives/button'
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
} from '@/shared/ui/primitives/card'
import { Input } from '@/shared/ui/primitives/input'
import { Select } from '@/shared/ui/primitives/select'
import { Tooltip } from '@/shared/ui/primitives/tooltip'

const ALL = '__all__'

/**
 * The customer directory.
 *
 * One row per channel identity. A row with `merged_into` set has been absorbed
 * into another and no longer counts on its own — it is badged as an alias
 * rather than hidden, so the merge stays visible and auditable (docs/03).
 */
export function CustomersTable() {
  const { t } = useTranslation()
  const session = useSession()

  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') ?? '')
  const debounced = useDebouncedValue(search)
  const [merging, setMerging] = useState<Customer | null>(null)

  const channel = searchParams.get('channel') ?? ''
  const offset = Number(searchParams.get('offset') ?? 0) || 0

  const query = useCustomers({
    ...(debounced ? { search: debounced } : {}),
    ...(channel ? { channel: channel as Customer['channel'] } : {}),
    limit: DEFAULT_PAGE_SIZE,
    offset,
  })

  const setParam = (key: string, value: string | null) =>
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current)
        if (value) next.set(key, value)
        else next.delete(key)
        if (key !== 'offset') next.delete('offset')
        return next
      },
      { replace: true },
    )

  const columns = useMemo<Column<Customer>[]>(
    () => [
      {
        key: 'name',
        header: t('customers.name'),
        cell: (row) => (
          <div className="flex items-center gap-2.5">
            <ChannelIcon channel={row.channel} />
            <div className="min-w-0">
              <p className="truncate font-medium text-fg">
                {orDash(row.display_name || row.username)}
              </p>
              <p className="truncate text-2xs text-fg-subtle">
                {row.username ? `@${row.username}` : row.external_id}
              </p>
            </div>
          </div>
        ),
      },
      {
        key: 'phone',
        header: t('customers.phone'),
        hideBelow: 'md',
        cell: (row) => (
          <span className="tabular text-fg-muted">{orDash(row.phone)}</span>
        ),
      },
      {
        key: 'state',
        header: t('customers.state'),
        cell: (row) =>
          isCanonical(row) ? (
            row.merged_customers.length > 0 ? (
              <Tooltip content={t('customers.mergedIntoThisHint')}>
                <Badge tone="brand" size="sm" className="cursor-help">
                  {t('customers.mergedCount', {
                    count: formatNumber(row.merged_customers.length),
                  })}
                </Badge>
              </Tooltip>
            ) : (
              <span className="text-fg-subtle">—</span>
            )
          ) : (
            <Tooltip content={t('customers.aliasHint')}>
              <Badge tone="neutral" size="sm" className="cursor-help">
                {t('customers.alias')}
              </Badge>
            </Tooltip>
          ),
      },
      {
        key: 'created',
        header: t('customers.firstSeen'),
        hideBelow: 'lg',
        cell: (row) => (
          <span className="whitespace-nowrap text-fg-muted">
            {formatDate(row.created_at)}
          </span>
        ),
      },
      {
        key: 'actions',
        header: '',
        className: 'w-12',
        cell: (row) =>
          session.canWrite && isCanonical(row) ? (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={t('merge.title')}
              onClick={() => setMerging(row)}
            >
              <Merge />
            </Button>
          ) : null,
      },
    ],
    [t, session.canWrite],
  )

  const total = query.data?.count ?? 0

  return (
    <Card>
      <CardHeader
        title={t('nav.customers')}
        description={t('customers.description')}
        actions={
          <>
            <Input
              type="search"
              value={search}
              leading={<Search />}
              className="h-9 sm:w-56"
              aria-label={t('customers.search')}
              placeholder={t('customers.search')}
              onChange={(event) => {
                setSearch(event.target.value)
                setParam('offset', null)
              }}
            />
            <Select
              aria-label={t('conversationFilters.any')}
              className="h-9 w-auto min-w-36 text-[13px]"
              value={channel || ALL}
              onChange={(value) =>
                setParam('channel', value === ALL ? null : value)
              }
              options={[
                { value: ALL, label: t('conversationFilters.any') },
                ...(['telegram', 'instagram', 'web'] as const).map((value) => ({
                  value,
                  label: t(channelLabelKey(value)),
                })),
              ]}
            />
          </>
        }
      />

      <CardBody className="px-0 pb-0">
        <QueryBoundary
          query={query}
          loading={
            <DataTable
              columns={columns}
              rows={[]}
              getRowKey={() => ''}
              isLoading
            />
          }
          isEmpty={(data) => data.results.length === 0}
          empty={
            <EmptyState
              title={t('customers.empty.title')}
              description={t('customers.empty.description')}
            />
          }
        >
          {(data) => (
            <DataTable
              columns={columns}
              rows={data.results}
              getRowKey={(row: Customer) => row.id}
              caption={t('nav.customers')}
            />
          )}
        </QueryBoundary>
      </CardBody>

      <CardFooter>
        <Pagination
          total={total}
          limit={DEFAULT_PAGE_SIZE}
          offset={offset}
          onOffsetChange={(value) =>
            setParam('offset', value > 0 ? String(value) : null)
          }
        />
      </CardFooter>

      <MergeDialog
        source={merging}
        open={merging !== null}
        onOpenChange={(open) => {
          if (!open) setMerging(null)
        }}
      />
    </Card>
  )
}
