import { Eraser, Sparkles, X } from 'lucide-react'
import { useEffect, useRef } from 'react'

import { usePeriod } from '@/features/period-filter'
import { useTranslation } from '@/shared/i18n'
import { Button } from '@/shared/ui/primitives/button'

import { useAskThread } from '../model/use-ask-thread'
import { AskComposer } from './ask-composer'
import { AskThread } from './ask-thread'

/**
 * The dock's contents: header, transcript, composer.
 *
 * Split from the dock shell because that shell exists twice — a docked column
 * on desktop and an overlay sheet on mobile — and the conversation inside them
 * must be one component, not two that drift apart.
 *
 * The period comes from the URL, so the panel answers about exactly the window
 * the page beside it is showing. On a page with no period filter that is the
 * API's own 30-day default.
 */
export function AskChat({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation()
  const period = usePeriod()
  const { turns, isPending, send, clear } = useAskThread(period.params)
  const input = useRef<HTMLTextAreaElement>(null)

  // Opening the panel is a deliberate act — put the caret where the user is
  // already heading.
  useEffect(() => {
    input.current?.focus()
  }, [])

  return (
    <div className="flex h-full flex-col bg-surface">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-line px-3">
        <Sparkles className="size-4 shrink-0 text-primary" aria-hidden />
        <h2 className="min-w-0 flex-1 truncate text-sm font-semibold text-fg">
          {t('ask.title')}
        </h2>

        {turns.length > 0 ? (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t('ask.clear')}
            onClick={clear}
          >
            <Eraser />
          </Button>
        ) : null}

        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={t('common.close')}
          onClick={onClose}
        >
          <X />
        </Button>
      </header>

      <AskThread
        turns={turns}
        onPick={(question) => {
          send(question)
          input.current?.focus()
        }}
      />

      <AskComposer disabled={isPending} inputRef={input} onSend={send} />
    </div>
  )
}
