import { ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { ROUTES } from '@/app/router/routes'
import type { LostProduct } from '@/entities/dashboard'
import { useTranslation } from '@/shared/i18n'
import { cn, formatMoney, formatNumber } from '@/shared/lib'
import { Badge } from '@/shared/ui/primitives/badge'
import { Tooltip } from '@/shared/ui/primitives/tooltip'

/**
 * One product and the reasons it was lost for.
 *
 * The reasons are NOT rendered as shares of the product total: one customer
 * lost for two reasons is counted once at product level, so those numbers do
 * not add up to 100% and pretending otherwise would be a lie (docs/05).
 */
export function ProductRow({ product }: { product: LostProduct }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  const hasReasons = product.reasons.length > 0

  return (
    <li className="rounded-lg ring-1 ring-line">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        disabled={!hasReasons}
        aria-expanded={hasReasons ? open : undefined}
        className={cn(
          'flex w-full items-center gap-3 px-3.5 py-3 text-left',
          hasReasons
            ? 'cursor-pointer rounded-lg transition-colors hover:bg-surface-muted'
            : 'cursor-default',
        )}
      >
        <ChevronRight
          aria-hidden
          className={cn(
            'size-4 shrink-0 text-fg-subtle transition-transform',
            !hasReasons && 'invisible',
            open && 'rotate-90',
          )}
        />

        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-medium text-fg">
            {product.product_name}
          </span>
          <span className="block text-2xs text-fg-subtle">
            {t('products.customersLost', {
              count: formatNumber(product.customers),
            })}
          </span>
        </span>

        <Tooltip
          content={
            product.lost_value === null
              ? t('products.noPriceHint')
              : t('products.lostValueHint')
          }
        >
          <span className="tabular cursor-help text-[13px] font-semibold whitespace-nowrap text-fg">
            {formatMoney(product.lost_value, product.currency)}
          </span>
        </Tooltip>
      </button>

      {open && hasReasons ? (
        <ul className="space-y-1 border-t border-line px-3.5 py-2.5">
          {product.reasons.map((reason) => (
            <li
              key={reason.reason}
              className="flex flex-wrap items-center gap-2 py-1"
            >
              <Badge tone="outline" size="sm">
                {reason.label}
              </Badge>
              <span className="tabular text-xs text-fg-muted">
                {t('products.customersLost', {
                  count: formatNumber(reason.customers),
                })}
              </span>

              <Link
                to={`${ROUTES.conversations}?product=${product.product}&reason=${reason.reason}`}
                className="ml-auto text-xs font-medium text-primary hover:underline"
              >
                {t('products.seeConversations')}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  )
}
