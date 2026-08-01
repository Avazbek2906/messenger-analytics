import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

import { criterionLabelKey } from '../model/labels'
import type { CriterionStat } from '../model/types'
import { useTranslation } from '@/shared/i18n'
import { formatNumber, formatScore } from '@/shared/lib'
import { ChartTooltip } from '@/shared/ui/charts/chart-tooltip'

/**
 * Rubric profile.
 *
 * A radar suits 5–8 axes (we have 7 criteria). A numeric list always sits
 * beside it for precise comparison — the radar is never the only source.
 */
export function CriteriaRadar({ criteria }: { criteria: CriterionStat[] }) {
  const { t } = useTranslation()

  const data = criteria
    .filter((item) => item.avg_score !== null)
    .map((item) => ({
      key: item.key,
      label: t(criterionLabelKey(item.key)),
      score: item.avg_score,
      samples: item.samples,
    }))

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid stroke="var(--color-chart-grid)" />
          <PolarAngleAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: 'var(--color-fg-muted)' }}
          />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />

          <Tooltip
            content={({ active, payload }) => {
              const point = payload?.[0]?.payload as
                { label: string; score: number; samples: number } | undefined
              if (!active || !point) return null

              return (
                <ChartTooltip
                  title={point.label}
                  rows={[
                    {
                      key: 'score',
                      label: t('criteria.average'),
                      value: `${formatScore(point.score)} ${t('common.outOf100')}`,
                      color: 'var(--color-chart-1)',
                    },
                  ]}
                  footer={t('criteria.samples', {
                    count: formatNumber(point.samples),
                  })}
                />
              )
            }}
          />

          <Radar
            dataKey="score"
            stroke="var(--color-chart-1)"
            strokeWidth={2}
            fill="var(--color-chart-1)"
            fillOpacity={0.18}
            isAnimationActive={false}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
