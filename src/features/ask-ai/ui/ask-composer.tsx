import { CornerDownLeft } from 'lucide-react'
import { useState, type RefObject } from 'react'

import { useTranslation } from '@/shared/i18n'
import { Button } from '@/shared/ui/primitives/button'
import { Textarea } from '@/shared/ui/primitives/input'

/** The backend rejects anything longer (docs/06). */
export const MAX_LENGTH = 500

/**
 * The composer, pinned to the bottom of the dock.
 *
 * It is disabled while a request is in flight and there is NO auto retry: the
 * call computes nine aggregates plus an LLM round-trip, so a slow response
 * usually means the server is still working, not that it failed.
 */
export function AskComposer({
  disabled,
  inputRef,
  onSend,
}: {
  disabled: boolean
  inputRef: RefObject<HTMLTextAreaElement | null>
  onSend: (question: string) => void
}) {
  const { t } = useTranslation()
  const [question, setQuestion] = useState('')

  const trimmed = question.trim()
  const canSubmit = !disabled && trimmed.length > 0

  const submit = () => {
    if (!canSubmit) return
    onSend(trimmed)
    setQuestion('')
  }

  return (
    <div className="border-t border-line p-3">
      <div className="relative">
        <Textarea
          ref={inputRef}
          value={question}
          maxLength={MAX_LENGTH}
          disabled={disabled}
          rows={2}
          aria-label={t('ask.title')}
          placeholder={t('ask.placeholder')}
          onChange={(event) => setQuestion(event.target.value)}
          onKeyDown={(event) => {
            // Enter sends, Shift+Enter adds a newline — the chat idiom every
            // user already knows.
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              submit()
            }
          }}
          className="max-h-40 min-h-16 pr-12 text-[13px]"
        />

        <Button
          variant="primary"
          size="icon-sm"
          className="absolute right-2 bottom-2"
          loading={disabled}
          disabled={!canSubmit}
          aria-label={t('ask.submit')}
          onClick={submit}
        >
          <CornerDownLeft />
        </Button>
      </div>

      {/* Kept in sight permanently: a chat transcript implies memory, and this
          endpoint has none. */}
      <p className="mt-2 text-2xs leading-4 text-fg-subtle">
        {t('ask.scopeHint')}
      </p>
    </div>
  )
}
