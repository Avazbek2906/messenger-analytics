import { ArrowUpRight, ThumbsDown, ThumbsUp } from 'lucide-react'
import { Link } from 'react-router-dom'

import { ROUTES } from '@/app/router/routes'
import { ScoreValue } from '@/entities/conversation'
import type { ConversationRef } from '@/entities/dashboard'
import { useTranslation } from '@/shared/i18n'
import { cn, formatDate, orDash } from '@/shared/lib'
import { Card, CardBody, CardHeader } from '@/shared/ui/primitives/card'

/**
 * Best and worst conversations — up to 5 each.
 *
 * These ids are the navigation graph: a coaching conversation should start from
 * the actual chat, not from an average (docs/05 "Drill-down navigation").
 */
export function EmployeeConversations({
  best,
  worst,
}: {
  best: ConversationRef[]
  worst: ConversationRef[]
}) {
  const { t } = useTranslation()

  if (best.length === 0 && worst.length === 0) return null

  return (
    <Card>
      <CardHeader
        title={t('employee.examples')}
        description={t('employee.examplesHint')}
      />
      <CardBody className="grid gap-6 sm:grid-cols-2">
        <ConversationList
          title={t('employee.best')}
          variant="best"
          items={best}
        />
        <ConversationList
          title={t('employee.worst')}
          variant="worst"
          items={worst}
        />
      </CardBody>
    </Card>
  )
}

function ConversationList({
  title,
  variant,
  items,
}: {
  title: string
  variant: 'best' | 'worst'
  items: ConversationRef[]
}) {
  const { t } = useTranslation()
  const Icon = variant === 'best' ? ThumbsUp : ThumbsDown

  return (
    <section>
      <h3 className="mb-3 flex items-center gap-1.5 text-xs font-medium tracking-wide text-fg-muted uppercase">
        <Icon
          className={cn(
            'size-3.5',
            variant === 'best' ? 'text-success' : 'text-danger',
          )}
          aria-hidden
        />
        {title}
      </h3>

      {items.length === 0 ? (
        <p className="text-[13px] text-fg-subtle">{t('employee.noExamples')}</p>
      ) : (
        <ul className="space-y-1.5">
          {items.map((item) => (
            <li key={item.conversation}>
              <Link
                to={ROUTES.conversation(item.conversation)}
                className="group flex items-center gap-3 rounded-lg px-2.5 py-2 transition-colors hover:bg-surface-muted"
              >
                <ScoreValue score={item.score} />
                <span className="min-w-0 flex-1 truncate text-[13px] text-fg">
                  {orDash(item.customer_name)}
                </span>
                <span className="hidden text-2xs whitespace-nowrap text-fg-subtle sm:block">
                  {formatDate(item.closed_at)}
                </span>
                <ArrowUpRight
                  className="size-3.5 shrink-0 text-fg-subtle opacity-0 transition-opacity group-hover:opacity-100"
                  aria-hidden
                />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
