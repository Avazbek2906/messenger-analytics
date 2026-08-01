import { ArrowUpRight, CalendarClock } from 'lucide-react'
import { isBefore, startOfToday } from 'date-fns'
import { Link } from 'react-router-dom'

import { ROUTES } from '@/app/router/routes'
import type { UpcomingAgreement } from '@/entities/dashboard'
import { useTranslation } from '@/shared/i18n'
import { formatDate, orDash, parseApiDate } from '@/shared/lib'
import { Badge } from '@/shared/ui/primitives/badge'
import { Card, CardBody, CardHeader } from '@/shared/ui/primitives/card'
import { EmptyState } from '@/shared/ui/feedback/states'

/**
 * The pending queue a manager works from — up to 20, earliest due first.
 *
 * Overdue rows are flagged here rather than only counted in the KPI, because
 * this list is where somebody actually acts on them.
 */
export function UpcomingAgreements({ items }: { items: UpcomingAgreement[] }) {
  const { t } = useTranslation()
  const today = startOfToday()

  return (
    <Card className="h-full">
      <CardHeader
        title={t('agreementsBoard.upcoming')}
        description={t('agreementsBoard.upcomingHint')}
      />
      <CardBody>
        {items.length === 0 ? (
          <EmptyState
            title={t('agreementsBoard.noUpcoming.title')}
            description={t('agreementsBoard.noUpcoming.description')}
            compact
          />
        ) : (
          <ul className="space-y-1.5">
            {items.map((item) => {
              const due = parseApiDate(`${item.due_on} 00:00:00`)
              const overdue = due ? isBefore(due, today) : false

              return (
                <li key={item.agreement}>
                  <Link
                    to={ROUTES.conversation(item.conversation)}
                    className="group flex items-start gap-3 rounded-lg px-2.5 py-2 transition-colors hover:bg-surface-muted"
                  >
                    <CalendarClock
                      className="mt-0.5 size-4 shrink-0 text-fg-subtle"
                      aria-hidden
                    />

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] text-fg">
                        {item.text}
                      </span>
                      <span className="block text-2xs text-fg-subtle">
                        {orDash(item.employee_name)}
                      </span>
                    </span>

                    <Badge tone={overdue ? 'danger' : 'outline'} size="sm">
                      {formatDate(item.due_on)}
                    </Badge>

                    <ArrowUpRight
                      className="mt-1 size-3.5 shrink-0 text-fg-subtle opacity-0 transition-opacity group-hover:opacity-100"
                      aria-hidden
                    />
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </CardBody>
    </Card>
  )
}
