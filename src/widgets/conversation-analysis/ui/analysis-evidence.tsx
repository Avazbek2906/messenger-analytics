import { Quote } from 'lucide-react'

import type { AnalysisResult } from '@/entities/conversation'
import { useTranslation } from '@/shared/i18n'
import { CardInset } from '@/shared/ui/primitives/card'

/**
 * AI xulosasining dalili.
 *
 * Rather than explaining a number in a tooltip, show the customer's own words —
 * that builds trust faster than the number ever could.
 */
export function AnalysisEvidence({ analysis }: { analysis: AnalysisResult }) {
  const { t } = useTranslation()

  const quotes = [
    {
      key: 'outcome',
      label: t('conversation.outcomeSignal'),
      text: analysis.outcome_signal,
    },
    {
      key: 'reason',
      label: t('conversation.reasonEvidence'),
      text: analysis.reason_evidence,
    },
  ].filter((quote) => quote.text.trim())

  if (quotes.length === 0) return null

  return (
    <section className="space-y-2">
      {quotes.map((quote) => (
        <CardInset key={quote.key} className="flex gap-3 p-3.5">
          <Quote
            className="mt-0.5 size-4 shrink-0 text-fg-subtle"
            aria-hidden
          />
          <div className="min-w-0 space-y-0.5">
            <p className="text-2xs font-medium tracking-wide text-fg-muted uppercase">
              {quote.label}
            </p>
            <p className="text-[13px] leading-6 text-fg">{quote.text}</p>
          </div>
        </CardInset>
      ))}
    </section>
  )
}
