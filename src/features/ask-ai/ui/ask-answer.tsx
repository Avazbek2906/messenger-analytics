import { Info, MessageSquareText } from 'lucide-react'
import { Link } from 'react-router-dom'

import { ROUTES } from '@/app/router/routes'
import type { AskResponse } from '@/entities/insight'
import { useTranslation } from '@/shared/i18n'
import { cn } from '@/shared/lib'
import { Badge } from '@/shared/ui/primitives/badge'

/**
 * One answer.
 *
 * `has_data: false` is a normal 200, not an error — it gets informational
 * styling and no evidence chips, because the model was told to say so rather
 * than invent a number (docs/06).
 */
export function AskAnswer({ answer }: { answer: AskResponse }) {
  const { t } = useTranslation()

  return (
    <section
      aria-live="polite"
      className={cn(
        'space-y-3 rounded-lg px-4 py-3.5',
        answer.has_data ? 'bg-surface-muted' : 'bg-info-soft',
      )}
    >
      <div className="flex gap-2.5">
        {answer.has_data ? null : (
          <Info className="mt-0.5 size-4 shrink-0 text-info-fg" aria-hidden />
        )}
        <p
          className={cn(
            'text-[13px] leading-6 whitespace-pre-wrap',
            answer.has_data ? 'text-fg' : 'text-info-fg',
          )}
        >
          {answer.answer}
        </p>
      </div>

      {answer.has_data && answer.used_conversations.length > 0 ? (
        <div className="space-y-1.5">
          <p className="text-2xs font-medium tracking-wide text-fg-muted uppercase">
            {t('ask.evidence')}
          </p>
          <ul className="flex flex-wrap gap-1.5">
            {answer.used_conversations.map((id) => (
              <li key={id}>
                <Link to={ROUTES.conversation(id)}>
                  <Badge
                    tone="outline"
                    size="sm"
                    icon={<MessageSquareText />}
                    className="hover:bg-surface-sunken"
                  >
                    {id.slice(0, 8)}
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  )
}
