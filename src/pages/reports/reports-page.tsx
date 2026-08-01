import { PeriodFilter, usePeriod } from '@/features/period-filter'
import { useDocumentTitle } from '@/shared/hooks/use-document-title'
import { useTranslation } from '@/shared/i18n'
import { PageHeader } from '@/shared/ui/layout/page-header'
import { ExportsList } from '@/widgets/exports-list'

/**
 * Excel exports.
 *
 * The period filter here feeds the NEXT export that gets queued; already-listed
 * jobs echo back the window they were built with, so they stay self-describing
 * even after the filter changes (docs/06).
 */
export function ReportsPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('nav.reports'))
  const period = usePeriod()

  return (
    <>
      <PageHeader
        title={t('nav.reports')}
        description={t('reports.subtitle')}
        actions={<PeriodFilter period={period} />}
      />
      <ExportsList period={period.params} />
    </>
  )
}

export default ReportsPage
