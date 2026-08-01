import { ChevronLeft, ChevronRight } from 'lucide-react'

import { useTranslation } from '@/shared/i18n'
import { formatNumber } from '@/shared/lib'
import { Button } from '@/shared/ui/primitives/button'

interface PaginationProps {
  /** Total across all pages (`count`). */
  total: number
  limit: number
  offset: number
  onOffsetChange: (offset: number) => void
}

/**
 * Offset-based pagination.
 *
 * The backend uses `LimitOffsetPagination` and returns `count`, so both the
 * "showing X of Y" line and the page maths can be derived here.
 */
export function Pagination({
  total,
  limit,
  offset,
  onOffsetChange,
}: PaginationProps) {
  const { t } = useTranslation()

  if (total <= limit) return null

  const from = offset + 1
  const to = Math.min(offset + limit, total)
  const canPrevious = offset > 0
  const canNext = to < total

  return (
    <div className="flex items-center justify-between gap-3">
      <p className="tabular text-xs text-fg-muted">
        {t('pagination.range', {
          from: formatNumber(from),
          to: formatNumber(to),
          total: formatNumber(total),
        })}
      </p>

      <div className="flex items-center gap-1.5">
        <Button
          size="sm"
          icon={<ChevronLeft />}
          disabled={!canPrevious}
          onClick={() => onOffsetChange(Math.max(0, offset - limit))}
        >
          <span className="hidden sm:inline">{t('pagination.previous')}</span>
        </Button>
        <Button
          size="sm"
          disabled={!canNext}
          onClick={() => onOffsetChange(offset + limit)}
        >
          <span className="hidden sm:inline">{t('pagination.next')}</span>
          <ChevronRight />
        </Button>
      </div>
    </div>
  )
}
