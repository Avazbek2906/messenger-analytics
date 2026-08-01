import { AlertTriangle, Lightbulb, Package, Tag } from 'lucide-react'
import type { ReactNode } from 'react'

import type { AnalysisResult } from '@/entities/conversation'
import { useTranslation } from '@/shared/i18n'
import { Badge } from '@/shared/ui/primitives/badge'
import { CardInset } from '@/shared/ui/primitives/card'

/**
 * Tahlilning qolgan qismlari: qoida buzilishlari, mahsulotlar, ikkilamchi
 * sabablar va murabbiylik maslahati.
 *
 * Each section disappears entirely when empty — a panel padded with empty
 * headings only distracts.
 */
export function AnalysisDetails({ analysis }: { analysis: AnalysisResult }) {
  const { t } = useTranslation()

  return (
    <div className="space-y-5">
      <Section
        icon={<AlertTriangle className="text-danger" />}
        title={t('conversation.violations')}
        show={analysis.rule_violations.length > 0}
      >
        <ul className="flex flex-wrap gap-1.5">
          {analysis.rule_violations.map((violation) => (
            <li key={violation}>
              <Badge tone="danger" size="sm">
                {violation}
              </Badge>
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
            <li key={reason.id}>
              <Badge tone="outline" size="sm">
                {reason.label}
              </Badge>
            </li>
          ))}
          {analysis.other_reason_text ? (
            <li>
              <Badge tone="neutral" size="sm">
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
