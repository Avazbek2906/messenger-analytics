import { useLostProducts, type LostProduct } from '@/entities/dashboard'
import type { PeriodParams } from '@/shared/api'
import { WidgetInsights } from '@/features/widget-insights'
import { useTranslation } from '@/shared/i18n'
import { QueryBoundary } from '@/shared/ui/feedback/query-boundary'
import { EmptyState } from '@/shared/ui/feedback/states'
import { Card, CardBody, CardHeader } from '@/shared/ui/primitives/card'
import { Skeleton } from '@/shared/ui/primitives/skeleton'

import { ProductRow } from './product-row'

/**
 * Top lost opportunities.
 *
 * An empty catalog produces an empty widget with no error at all, so the empty
 * state points at the catalog rather than at the period (docs/04).
 */
export function LostProductsCard({ period }: { period: PeriodParams }) {
  const { t } = useTranslation()
  const query = useLostProducts(period)

  return (
    <Card className="h-full">
      <CardHeader
        title={t('products.title')}
        description={t('products.description')}
      />

      <CardBody>
        <WidgetInsights widget="products" period={period} />

        <QueryBoundary
          query={query}
          loading={
            <div className="space-y-2">
              {Array.from({ length: 6 }, (_, index) => (
                <Skeleton key={index} className="h-14 rounded-lg" />
              ))}
            </div>
          }
          empty={
            <EmptyState
              title={t('products.empty.title')}
              description={t('products.empty.description')}
            />
          }
        >
          {(products) => (
            <ul className="space-y-2">
              {products.map((product: LostProduct) => (
                <ProductRow key={product.product} product={product} />
              ))}
            </ul>
          )}
        </QueryBoundary>
      </CardBody>
    </Card>
  )
}
