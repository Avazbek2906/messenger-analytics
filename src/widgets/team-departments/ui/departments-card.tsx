import {
  useDepartmentRatings,
  type DepartmentRating,
} from '@/entities/dashboard'
import { ScoreValue } from '@/entities/conversation'
import type { PeriodParams } from '@/shared/api'
import { useTranslation } from '@/shared/i18n'
import { formatNumber, formatPercent } from '@/shared/lib'
import { QueryBoundary } from '@/shared/ui/feedback/query-boundary'
import { EmptyState } from '@/shared/ui/feedback/states'
import { Card, CardBody, CardHeader } from '@/shared/ui/primitives/card'
import { Tooltip } from '@/shared/ui/primitives/tooltip'

/**
 * Department comparison.
 *
 * There is no sample floor here (no `rank` / `is_ranked`), so a department with
 * very few conversations needs the same caution as an unranked employee — the
 * conversation count is shown next to every score for exactly that reason.
 */
export function DepartmentsCard({ period }: { period: PeriodParams }) {
  const { t } = useTranslation()
  const query = useDepartmentRatings(period)

  return (
    <Card className="h-full">
      <CardHeader
        title={t('team.departments')}
        description={t('team.departmentsHint')}
      />

      <CardBody>
        <QueryBoundary
          query={query}
          loading={
            <div className="space-y-3">
              {Array.from({ length: 4 }, (_, index) => (
                <div
                  key={index}
                  className="h-14 rounded-lg bg-surface-sunken"
                />
              ))}
            </div>
          }
          empty={
            <EmptyState
              title={t('team.noDepartments.title')}
              description={t('team.noDepartments.description')}
              compact
            />
          }
        >
          {(rows) => (
            <ul className="space-y-2.5">
              {rows.map((row: DepartmentRating) => (
                <li
                  key={row.department || '__none__'}
                  className="flex items-center gap-4 rounded-lg bg-surface-muted px-3.5 py-3 ring-1 ring-line"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-fg">
                      {row.department || t('team.noDepartment')}
                    </p>
                    <p className="text-2xs text-fg-subtle">
                      {t('team.departmentMeta', {
                        employees: formatNumber(row.employees),
                        conversations: formatNumber(row.conversations),
                      })}
                    </p>
                  </div>

                  <Tooltip content={t('kpi.conversion')}>
                    <span className="tabular hidden cursor-help text-[13px] text-fg-muted sm:block">
                      {formatPercent(row.conversion_rate)}
                    </span>
                  </Tooltip>

                  <ScoreValue score={row.avg_score} />
                </li>
              ))}
            </ul>
          )}
        </QueryBoundary>
      </CardBody>
    </Card>
  )
}
