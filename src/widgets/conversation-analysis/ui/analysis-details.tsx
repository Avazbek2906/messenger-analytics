import { AlertTriangle, Lightbulb, Package, Tag } from 'lucide-react'
import type { ReactNode } from 'react'

import {
  normalizeViolations,
  type AnalysisResult,
} from '@/entities/conversation'
import { useTranslation } from '@/shared/i18n'
import { Badge } from '@/shared/ui/primitives/badge'
import { CardInset } from '@/shared/ui/primitives/card'

/**
 * The remaining parts of the analysis: rule violations, products, secondary
 * reasons and the coaching note.
 *
 * Each section disappears entirely when empty — a panel padded with empty
 * headings only distracts.
 */
export function AnalysisDetails({ analysis }: { analysis: AnalysisResult }) {
  const { t } = useTranslation()

  const violations = normalizeViolations(analysis.rule_violations)

  return (
    <div className="space-y-5">
      <Section
        icon={<AlertTriangle className="text-danger" />}
        title={t('conversation.violations')}
        show={violations.length > 0}
      >
        <ul className="space-y-3">
          {violations.map((violation, index) => (
            <li
              key={`${violation.rule}-${index}`}
              className="border-l-2 border-danger pl-3"
            >
              {violation.rule ? (
                <Badge tone="danger" size="sm" wrap>
                  {violation.rule}
                </Badge>
              ) : null}

              {/* The explanation is what a manager coaches from; the code alone
                  says nothing. Wrapped rather than truncated — this is the
                  whole point of the section. */}
              {violation.explanation ? (
                <p className="mt-1.5 text-[13px] leading-6 text-fg">
                  {violation.explanation}
                </p>
              ) : null}

              {/* The quoted message that triggered it — evidence, so it is set
                  apart from the model's own prose. */}
              {violation.location ? (
                <p className="mt-1 font-mono text-2xs leading-5 break-words text-fg-muted">
                  {violation.location}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </Section>

      <Section
        icon={<Package className="text-fg-muted" />}
        title={t('conversation.products')}
        show={analysis.products_of_interest.length > 0}
      >
        <ul className="flex flex-wrap gap-1.5">
          {analysis.products_of_interest.map((product) => (
            <li key={product.id}>
              <Badge tone="outline" size="sm">
                {product.name}
              </Badge>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        icon={<Tag className="text-fg-muted" />}
        title={t('conversation.secondaryReasons')}
        show={
          analysis.secondary_reasons.length > 0 ||
          Boolean(analysis.other_reason_text)
        }
      >
        <ul className="flex flex-wrap gap-1.5">
          {analysis.secondary_reasons.map((reason) => (
            <li key={reason.id} className="min-w-0">
              <Badge tone="outline" size="sm" wrap>
                {reason.label}
              </Badge>
            </li>
          ))}
          {analysis.other_reason_text ? (
            <li className="min-w-0">
              <Badge tone="neutral" size="sm" wrap>
                {analysis.other_reason_text}
              </Badge>
            </li>
          ) : null}
        </ul>
      </Section>

      <Section
        icon={<Lightbulb className="text-warning" />}
        title={t('conversation.coaching')}
        show={Boolean(analysis.coaching_suggestion.trim())}
      >
        <CardInset className="p-3.5 text-[13px] leading-6 text-fg">
          {analysis.coaching_suggestion}
        </CardInset>
      </Section>
    </div>
  )
}

function Section({
  icon,
  title,
  show,
  children,
}: {
  icon: ReactNode
  title: string
  show: boolean
  children: ReactNode
}) {
  if (!show) return null

  return (
    <section>
      <h3 className="mb-2.5 flex items-center gap-1.5 text-xs font-medium tracking-wide text-fg-muted uppercase [&_svg]:size-3.5">
        {icon}
        {title}
      </h3>
      {children}
    </section>
  )
}
