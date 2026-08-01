import { PeriodFilter, usePeriod } from '@/features/period-filter'
import { useDocumentTitle } from '@/shared/hooks/use-document-title'
import { useTranslation } from '@/shared/i18n'
import { PageHeader } from '@/shared/ui/layout/page-header'
import { AgreementsBoard } from '@/widgets/agreements-board'

/**
 * The promises board.
 *
 * The time axis here is `Agreement.occurred_at`, not `closed_at`, and the
 * `confirmed` switch does not affect this endpoint — agreements are their own
 * fact rows (docs/05).
 */
export function AgreementsPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('nav.agreements'))
  const period = usePeriod()

  return (
    <>
      <PageHeader
        title={t('nav.agreements')}
        description={t('agreementsBoard.subtitle')}
        actions={<PeriodFilter period={period} />}
      />

      <AgreementsBoard period={period.params} />
    </>
  )
}

export default AgreementsPage
