import { Lightbulb } from 'lucide-react'

import { useTranslation } from '@/shared/i18n'
import { Card, CardBody, CardHeader } from '@/shared/ui/primitives/card'
import { CardInset } from '@/shared/ui/primitives/card'

/**
 * Coaching lines written by the batch analyst, newest first (up to 20).
 *
 * The text is free-form model output, so it is rendered as plain paragraphs —
 * never as markdown and never parsed for structure.
 */
export function EmployeeCoaching({ coaching }: { coaching: string[] }) {
  const { t } = useTranslation()

  if (coaching.length === 0) return null

  return (
    <Card>
      <CardHeader
        title={t('employee.coaching')}
        description={t('employee.coachingHint')}
      />
      <CardBody>
        <ul className="space-y-2">
          {coaching.map((line, index) => (
            <li key={`${index}-${line.slice(0, 24)}`}>
              <CardInset className="flex gap-3 p-3.5">
                <Lightbulb
                  className="mt-0.5 size-4 shrink-0 text-warning"
                  aria-hidden
                />
                <p className="text-[13px] leading-6 text-fg">{line}</p>
              </CardInset>
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  )
}
