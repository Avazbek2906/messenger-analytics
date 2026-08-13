import { Sparkles } from 'lucide-react'
import { useEffect, useRef } from 'react'

import { ApiError } from '@/shared/api'
import { useTranslation, type MessageKey } from '@/shared/i18n'

import type { AskTurn } from '../model/use-ask-thread'
import { AskAnswer } from './ask-answer'

const SUGGESTIONS: MessageKey[] = [
  'ask.suggestion.1',
  'ask.suggestion.2',
  'ask.suggestion.3',
]

/**
 * The transcript.
 *
 * Scrolls to the newest turn whenever one arrives — the composer is pinned at
 * the bottom, so a user who just pressed send must not have to scroll to find
 * their own answer.
 */
export function AskThread({
  turns,
  onPick,
}: {
  turns: AskTurn[]
  onPick: (question: string) => void
}) {
  const { t } = useTranslation()
  const bottom = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [turns])

  if (turns.length === 0) {
    return (
      <div className="flex flex-1 flex-col justify-center gap-4 p-4">
        <div className="text-center">
          <Sparkles
            className="mx-auto mb-2 size-6 text-primary opacity-60"
            aria-hidden
          />
          <p className="text-[13px] leading-6 text-fg-muted">
            {t('ask.description')}
          </p>
        </div>

        {/* Examples, not decoration: the model only sees this period's
            statistics, and a concrete question shows that boundary faster than
            a paragraph explaining it. */}
        <ul className="space-y-1.5">
          {SUGGESTIONS.map((key) => (
            <li key={key}>
              <button
                type="button"
                onClick={() => onPick(t(key))}
                className="w-full cursor-pointer rounded-lg bg-surface-sunken px-3 py-2 text-left text-[13px] leading-5 text-fg-muted transition-colors duration-(--duration-fast) hover:bg-surface-muted hover:text-fg"
              >
                {t(key)}
              </button>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 overflow-y-auto p-3">
      {turns.map((turn) => (
        <article key={turn.id} className="space-y-2">
          <p className="ml-6 rounded-lg rounded-br-sm bg-primary px-3 py-2 text-[13px] leading-6 whitespace-pre-wrap text-primary-fg">
            {turn.question}
          </p>

          {turn.answer ? <AskAnswer answer={turn.answer} /> : null}

          {turn.error ? <TurnError error={turn.error} /> : null}

          {!turn.answer && !turn.error ? (
            <p aria-live="polite" className="text-[13px] text-fg-muted">
              {t('ask.thinking')}
            </p>
          ) : null}
        </article>
      ))}

      <div ref={bottom} />
    </div>
  )
}

function TurnError({ error }: { error: unknown }) {
  const { t } = useTranslation()

  // A 503 says the model was busy, not that the question was wrong — and
  // `/ask` is never auto-retried, so the user is told to send it again.
  const busy = error instanceof ApiError && error.isAiUnavailable

  return (
    <p
      role="alert"
      className="rounded-lg bg-danger-soft px-3 py-2 text-[13px] leading-6 text-danger-fg"
    >
      {t(busy ? 'ask.busy' : 'ask.failed')}
    </p>
  )
}
