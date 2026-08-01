import {
  DeltaBadge,
  type CriterionKey,
  type EmployeeRating,
} from '@/entities/dashboard'
import { ScoreValue } from '@/entities/conversation'
import type { TranslateFn } from '@/shared/i18n'
import {
  formatDuration,
  formatNumber,
  formatPercent,
  initials,
} from '@/shared/lib'
import type { Column } from '@/shared/ui/data/data-table'
import { Badge } from '@/shared/ui/primitives/badge'
import { Tooltip } from '@/shared/ui/primitives/tooltip'

import { RankBadge } from './rank-badge'

/**
 * League-table columns.
 *
 * When a `criterion` filter is active, `avg_score` / `score_delta` / `samples`
 * describe that single criterion rather than the overall score, so the score
 * header changes with it (docs/05).
 */
export function buildLeaderboardColumns(
  t: TranslateFn,
  criterion: CriterionKey | null,
  criterionLabel: string,
): Column<EmployeeRating>[] {
  return [
    {
      key: 'rank',
      header: '#',
      className: 'w-12',
      cell: (row) => <RankBadge rank={row.rank} isRanked={row.is_ranked} />,
    },
    {
      key: 'employee',
      header: t('team.employee'),
      cell: (row) => (
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold text-primary"
          >
            {initials(row.employee_name)}
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium text-fg">{row.employee_name}</p>
            <p className="truncate text-2xs text-fg-subtle">
              {row.department || t('team.noDepartment')}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'score',
      header: criterion ? criterionLabel : t('team.score'),
      numeric: true,
      cell: (row) => <ScoreValue score={row.avg_score} />,
    },
    {
      key: 'delta',
      header: t('team.change'),
      numeric: true,
      hideBelow: 'sm',
      cell: (row) => <DeltaBadge value={row.score_delta} unit="points" />,
    },
    {
      key: 'conversations',
      header: t('team.conversations'),
      numeric: true,
      hideBelow: 'md',
      cell: (row) => (
        <span className="text-fg-muted">{formatNumber(row.conversations)}</span>
      ),
    },
    {
      key: 'conversion',
      header: t('kpi.conversion'),
      numeric: true,
      hideBelow: 'lg',
      cell: (row) => (
        <span className="text-fg-muted">
          {formatPercent(row.conversion_rate)}
        </span>
      ),
    },
    {
      key: 'violations',
      header: t('team.violations'),
      numeric: true,
      hideBelow: 'xl',
      cell: (row) =>
        row.violations > 0 ? (
          <Tooltip content={t('team.violationsHint')}>
            <Badge tone="danger" size="sm" className="cursor-help">
              {formatNumber(row.violations)}
            </Badge>
          </Tooltip>
        ) : (
          <span className="text-fg-subtle">0</span>
        ),
    },
    {
      key: 'response',
      header: t('team.response'),
      numeric: true,
      hideBelow: 'xl',
      cell: (row) => (
        <span className="text-fg-muted">
          {formatDuration(row.avg_response_seconds)}
        </span>
      ),
    },
  ]
}
