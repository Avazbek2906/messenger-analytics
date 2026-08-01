import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ROUTES } from '@/app/router/routes'
import {
  criterionLabelKey,
  useEmployeeRatings,
  type CriterionKey,
  type EmployeeRating,
} from '@/entities/dashboard'
import type { PeriodParams } from '@/shared/api'
import { WidgetInsights } from '@/features/widget-insights'
import { useTranslation } from '@/shared/i18n'
import { DataTable } from '@/shared/ui/data/data-table'
import { QueryBoundary } from '@/shared/ui/feedback/query-boundary'
import { EmptyState } from '@/shared/ui/feedback/states'
import { Card, CardBody, CardHeader } from '@/shared/ui/primitives/card'
import { Select } from '@/shared/ui/primitives/select'

import { buildLeaderboardColumns } from './leaderboard-columns'

const ALL = '__all__'

const CRITERIA: CriterionKey[] = [
  'rule_adherence',
  'response_speed',
  'tone',
  'needs_discovery',
  'objection_handling',
  'closing',
  'promise_fulfillment',
]

/**
 * The employee league table.
 *
 * Switching `criterion` is the most useful coaching view ("who is weakest at
 * objection handling"), so it sits in the card header rather than behind a
 * filter panel. Legacy history is excluded server-side — we cannot tell who
 * handled it (docs/05).
 */
export function LeaderboardCard({ period }: { period: PeriodParams }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [criterion, setCriterion] = useState<CriterionKey | null>(null)

  const query = useEmployeeRatings({
    ...period,
    ...(criterion ? { criterion } : {}),
  })

  const criterionLabel = criterion ? t(criterionLabelKey(criterion)) : ''
  const columns = useMemo(
    () => buildLeaderboardColumns(t, criterion, criterionLabel),
    [t, criterion, criterionLabel],
  )

  return (
    <Card>
      <CardHeader
        title={t('team.leaderboard')}
        description={t('team.leaderboardHint')}
        actions={
          <Select
            aria-label={t('team.rankBy')}
            className="h-9 w-auto min-w-48 text-[13px]"
            value={criterion ?? ALL}
            onChange={(value) =>
              setCriterion(value === ALL ? null : (value as CriterionKey))
            }
            options={[
              { value: ALL, label: t('team.overallScore') },
              ...CRITERIA.map((key) => ({
                value: key,
                label: t(criterionLabelKey(key)),
              })),
            ]}
          />
        }
      />

      <CardBody className="px-0 pb-0">
        <WidgetInsights widget="ratings" period={period} />

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
          empty={
            <EmptyState
              title={t('team.empty.title')}
              description={t('team.empty.description')}
            />
          }
        >
          {(rows) => (
            <DataTable
              columns={columns}
              rows={rows}
              getRowKey={(row: EmployeeRating) => row.employee}
              caption={t('team.leaderboard')}
              onRowClick={(row) => navigate(ROUTES.teamMember(row.employee))}
            />
          )}
        </QueryBoundary>
      </CardBody>
    </Card>
  )
}
