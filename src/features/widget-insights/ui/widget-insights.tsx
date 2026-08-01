import { RefreshCw, Sparkles } from 'lucide-react'
import { useState } from 'react'

import {
  useAiStore,
  useWidgetInsights,
  type InsightWidget,
} from '@/entities/insight'
import type { PeriodParams } from '@/shared/api'
import { useTranslation } from '@/shared/i18n'
import { Button } from '@/shared/ui/primitives/button'
import { Skeleton } from '@/shared/ui/primitives/skeleton'

/**
 * AI narration under a widget.
 *
 * Self-contained on purpose: the trigger and the bullets live in one component
 * so no state has to be threaded through the card header.
 *
 * The request fires on click, never on mount — each one is an LLM round-trip.
 * If the deployment has no Gemini key the whole control disappears for the rest
 * of the session instead of failing once per widget (docs/06).
 */
export function WidgetInsights({
  widget,
  period,
}: {
  widget: InsightWidget
  period: PeriodParams
}) {
  const { t } = useTranslation()
  const unavailable = useAiStore((state) => state.unavailable)
  const [requested, setRequested] = useState(false)

  const query = useWidgetInsights(widget, period, requested)

  if (unavailable) return null

  if (!requested) {
    return (
      <Button
        size="sm"
        variant="ghost"
        icon={<Sparkles />}
        className="mb-3 text-primary"
        onClick={() => setRequested(true)}
      >
        {t('insights.action')}
      </Button>
    )
  }

  return (
    <section
      aria-live="polite"
      className="mb-4 rounded-lg bg-primary-soft px-4 py-3.5"
    >
      <h3 className="mb-2 flex items-center gap-1.5 text-xs font-medium text-primary">
        <Sparkles className="size-3.5" aria-hidden />
        {t('insights.title')}
      </h3>

      {query.isPending ? (
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-full bg-brand-100" />
          <Skeleton className="h-3.5 w-4/5 bg-brand-100" />
        </div>
      ) : query.isError ? (
        <div className="flex items-center justify-between gap-3">
          <p className="text-[13px] text-fg-muted">{t('insights.failed')}</p>
          <Button
            size="sm"
            variant="ghost"
            icon={<RefreshCw />}
            onClick={() => void query.refetch()}
          >
            {t('common.retry')}
          </Button>
        </div>
      ) : (
        <>
          <ul className="space-y-1.5">
            {/* Keyed by index: the wording changes after the 120 s cache
                expires even when the numbers did not, so the text is not a
                stable identity (docs/06). */}
            {query.data.bullets.map((bullet, index) => (
              <li
                key={index}
                className="text-[13px] leading-6 text-fg before:mr-1.5 before:text-primary before:content-['•']"
              >
                {bullet}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-2xs text-fg-subtle">{t('insights.caveat')}</p>
        </>
      )}
    </section>
  )
}
