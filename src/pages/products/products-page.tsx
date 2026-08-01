import { PeriodFilter, usePeriod } from '@/features/period-filter'
import { useDocumentTitle } from '@/shared/hooks/use-document-title'
import { useTranslation } from '@/shared/i18n'
import { PageHeader } from '@/shared/ui/layout/page-header'
import { LostProductsCard } from '@/widgets/lost-products'
import { LostReasonsCard } from '@/widgets/lost-reasons'

/**
 * Product feedback.
 *
 * Both widgets include legacy (backfilled) history: the customer's words about
 * a product stay valid even when the employee behind the chat is unknown
 * (docs/05 §7).
 */
export function ProductsPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('nav.products'))
  const period = usePeriod()

  return (
    <>
      <PageHeader
        title={t('nav.products')}
        description={t('products.subtitle')}
        actions={<PeriodFilter period={period} />}
      />

      <div className="grid gap-5 xl:grid-cols-2">
        <LostProductsCard period={period.params} />
        <LostReasonsCard period={period.params} />
      </div>
    </>
  )
}

export default ProductsPage
