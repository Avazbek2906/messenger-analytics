import { CalendarClock } from 'lucide-react'

import {
  AGREEMENT_TONES,
  agreementStatusLabelKey,
  type Agreement,
} from '@/entities/conversation'
import { useTranslation } from '@/shared/i18n'
import { formatDate, orDash } from '@/shared/lib'
import { Badge } from '@/shared/ui/primitives/badge'
import { Card, CardBody, CardHeader } from '@/shared/ui/primitives/card'
import { CardInset } from '@/shared/ui/primitives/card'

/** Promises made in this conversation. The card is omitted when empty. */
export function AgreementsList({ agreements }: { agreements: Agreement[] }) {
  const { t } = useTranslation()

  if (agreements.length === 0) return null

  return (
    <Card>
      <CardHeader
        title={t('agreements.title')}
        description={t('agreements.description')}
      />
      <CardBody>
        <ul className="space-y-3">
          {agreements.map((agreement) => (
            <li key={agreement.id}>
              <CardInset className="space-y-2 p-3.5">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[13px] leading-6 text-fg">
                    {agreement.text}
                  </p>
                  <Badge tone={AGREEMENT_TONES[agreement.status]} size="sm">
                    {t(agreementStatusLabelKey(agreement.status))}
                  </Badge>
                </div>

                {agreement.evidence ? (
                  <p className="text-xs leading-5 text-fg-muted italic">
                    {agreement.evidence}
                  </p>
                ) : null}

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-2xs text-fg-subtle">
                  {agreement.due_on ? (
                    <span className="flex items-center gap-1">
                      <CalendarClock className="size-3" aria-hidden />
                      {formatDate(agreement.due_on)}
                    </span>
                  ) : agreement.due_hint ? (
                    <span>{agreement.due_hint}</span>
                  ) : null}
                  <span>{orDash(agreement.employee_name)}</span>
                </div>
              </CardInset>
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  )
}
