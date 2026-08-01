import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'

import {
  useDeleteProduct,
  useProducts,
  useUpdateProduct,
  type Product,
} from '@/entities/catalog'
import { useSession } from '@/entities/session'
import { ProductDialog } from '@/features/product-form'
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value'
import { useTranslation } from '@/shared/i18n'
import { formatMoney, parseDecimal } from '@/shared/lib'
import { DataTable, type Column } from '@/shared/ui/data/data-table'
import { QueryBoundary } from '@/shared/ui/feedback/query-boundary'
import { EmptyState } from '@/shared/ui/feedback/states'
import { Button } from '@/shared/ui/primitives/button'
import { Card, CardBody, CardHeader } from '@/shared/ui/primitives/card'
import { Input } from '@/shared/ui/primitives/input'
import { Switch } from '@/shared/ui/primitives/switch'
import { Tooltip } from '@/shared/ui/primitives/tooltip'

import { DeleteProductDialog } from './delete-product-dialog'

/**
 * The product catalog.
 *
 * These are the only names the analysis pipeline can ever emit — free-form
 * product extraction is disallowed, so an empty catalog silently empties the
 * product widget. Deactivation is the primary action; `DELETE` cascades the M2M
 * links and shrinks past dashboards (docs/04).
 */
export function ProductsTable() {
  const { t } = useTranslation()
  const session = useSession()

  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search)
  const [editing, setEditing] = useState<Product | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState<Product | null>(null)

  // No `is_active` filter: the settings table must show inactive rows too.
  const query = useProducts({
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ordering: 'name',
  })
  const update = useUpdateProduct()
  const remove = useDeleteProduct()

  const names = useMemo(
    () => (query.data?.results ?? []).map((product) => product.name),
    [query.data],
  )

  const columns = useMemo<Column<Product>[]>(
    () => [
      {
        key: 'name',
        header: t('productForm.name'),
        cell: (row) => (
          <div className="min-w-0">
            <p className="truncate font-medium text-fg">{row.name}</p>
            {row.category ? (
              <p className="truncate text-2xs text-fg-subtle">{row.category}</p>
            ) : null}
          </div>
        ),
      },
      {
        key: 'price',
        header: t('productForm.price'),
        numeric: true,
        hideBelow: 'sm',
        cell: (row) => (
          <Tooltip
            content={row.price === null ? t('productForm.noPriceHint') : ''}
          >
            <span className="text-fg-muted">
              {formatMoney(parseDecimal(row.price), row.currency)}
            </span>
          </Tooltip>
        ),
      },
      {
        key: 'active',
        header: t('productsTable.active'),
        cell: (row) => (
          <Switch
            checked={row.is_active}
            disabled={!session.canWrite || update.isPending}
            label={<span className="sr-only">{t('productsTable.active')}</span>}
            onChange={(checked) =>
              update.mutate({ id: row.id, input: { is_active: checked } })
            }
          />
        ),
      },
      {
        key: 'actions',
        header: '',
        className: 'w-20',
        cell: (row) =>
          session.canWrite ? (
            <div className="flex justify-end gap-0.5">
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={t('productForm.editTitle')}
                onClick={() => {
                  setEditing(row)
                  setDialogOpen(true)
                }}
              >
                <Pencil />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-danger-fg"
                aria-label={t('productsTable.delete')}
                onClick={() => setDeleting(row)}
              >
                <Trash2 />
              </Button>
            </div>
          ) : null,
      },
    ],
    [t, session.canWrite, update],
  )

  return (
    <Card>
      <CardHeader
        title={t('settings.products')}
        description={t('productsTable.description')}
        actions={
          <>
            <Input
              type="search"
              value={search}
              leading={<Search />}
              className="h-9 sm:w-56"
              aria-label={t('productsTable.search')}
              placeholder={t('productsTable.search')}
              onChange={(event) => setSearch(event.target.value)}
            />
            {session.canWrite ? (
              <Button
                variant="primary"
                size="sm"
                icon={<Plus />}
                onClick={() => {
                  setEditing(null)
                  setDialogOpen(true)
                }}
              >
                {t('productsTable.add')}
              </Button>
            ) : null}
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
              title={t('productsTable.empty.title')}
              description={t('productsTable.empty.description')}
            />
          }
        >
          {(data) => (
            <DataTable
              columns={columns}
              rows={data.results}
              getRowKey={(row: Product) => row.id}
              caption={t('settings.products')}
            />
          )}
        </QueryBoundary>
      </CardBody>

      <ProductDialog
        product={editing}
        existingNames={names}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />

      <DeleteProductDialog
        product={deleting}
        isPending={remove.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={(id) =>
          remove.mutate(id, { onSuccess: () => setDeleting(null) })
        }
        onDeactivate={(id) =>
          update.mutate(
            { id, input: { is_active: false } },
            { onSuccess: () => setDeleting(null) },
          )
        }
      />
    </Card>
  )
}
