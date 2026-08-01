import { Link } from 'react-router-dom'

import { ROUTES } from '@/app/router/routes'
import type { AgreementsByEmployee as Row } from '@/entities/dashboard'
import { useTranslation } from '@/shared/i18n'
import { formatNumber, orDash } from '@/shared/lib'
import { Card, CardBody, CardHeader } from '@/shared/ui/primitives/card'
import { EmptyState } from '@/shared/ui/feedback/states'
import { Tooltip } from '@/shared/ui/primitives/tooltip'

/**
 * Who takes the most promises and who forgets the most.
 *
 * Agreements with no employee are omitted server-side, so this column does not
 * sum to the top-level `taken` — the header note says so instead of leaving the
 * reader to discover the discrepancy (docs/05).
 */
export function AgreementsByEmployee({ rows }: { rows: Row[] }) {
  const { t } = useTranslation()

  return (
    <Card className="h-full">
      <CardHeader
        title={t('agreementsBoard.byEmployee')}
        description={t('agreementsBoard.byEmployeeHint')}
      />
      <CardBody>
        {rows.length === 0 ? (
          <EmptyState title={t('agreementsBoard.noByEmployee')} compact />
        ) : (
          <ul className="space-y-2">
            {rows.map((row) => {
              const decided = row.fulfilled + row.forgotten
              const kept = decided > 0 ? (row.fulfilled / decided) * 100 : null

              return (
                <li key={row.employee}>
                  <Link
                    to={ROUTES.teamMember(row.employee)}
                    className="flex items-center gap-3 rounded-lg px-2.5 py-2 transition-colors hover:bg-surface-muted"
                  >
                    <span className="min-w-0 flex-1 truncate text-[13px] text-fg">
                      {orDash(row.employee_name)}
                    </span>

                    <Tooltip content={t('agreementsBoard.rowHint')}>
                      <span className="tabular flex shrink-0 cursor-help items-baseline gap-2 text-xs">
                        <span className="text-success-fg">
                          {formatNumber(row.fulfilled)}
                        </span>
                        <span className="text-fg-subtle">/</span>
                        <span className="text-danger-fg">
                          {formatNumber(row.forgotten)}
                        </span>
                        <span className="text-fg-subtle">
                          {t('agreementsBoard.ofTaken', {
                            count: formatNumber(row.taken),
                          })}
                        </span>
                      </span>
                    </Tooltip>

                    <span
                      aria-hidden
                      className="hidden h-1.5 w-16 shrink-0 overflow-hidden rounded-full bg-surface-sunken sm:block"
                    >
                      <span
                        className="block h-full rounded-full bg-success"
                        style={{ width: `${kept ?? 0}%` }}
                      />
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </CardBody>
    </Card>
  )
}
