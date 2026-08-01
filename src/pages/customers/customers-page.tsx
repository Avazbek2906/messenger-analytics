import { useDocumentTitle } from '@/shared/hooks/use-document-title'
import { useTranslation } from '@/shared/i18n'
import { PageHeader } from '@/shared/ui/layout/page-header'
import { CustomersTable } from '@/widgets/customers-table'

/**
 * The customer directory.
 *
 * A customer is an identity on ONE channel: the same person on Telegram and
 * Instagram stays two rows until a manager merges them, because there is no
 * automatic cross-channel matching in v1 (docs/03).
 */
export function CustomersPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('nav.customers'))

  return (
    <>
      <PageHeader
        title={t('nav.customers')}
        description={t('customers.subtitle')}
      />
      <CustomersTable />
    </>
  )
}

export default CustomersPage
