import { CornerDownLeft, Info, Sparkles } from 'lucide-react'
import { useState } from 'react'

import {
  clampAskPeriod,
  useAiStore,
  useAskAi,
  type AskResponse,
} from '@/entities/insight'
import type { PeriodParams } from '@/shared/api'
import { useTranslation } from '@/shared/i18n'
import { Button } from '@/shared/ui/primitives/button'
import { Card, CardBody, CardHeader } from '@/shared/ui/primitives/card'
import { Textarea } from '@/shared/ui/primitives/input'

import { AskAnswer } from './ask-answer'

const MAX_LENGTH = 500

/**
 * The in-platform AI chat.
 *
 * The composer is disabled while a request is in flight and there is NO auto
 * retry: the call computes nine aggregates plus an LLM round-trip, so a timeout
 * usually means the server is still working (docs/06).
 *
 * Any transcript is client state — the endpoint is stateless and will not
 * resolve "and what about last week?" against a previous turn.
 */
export function AskPanel({ period }: { period: PeriodParams }) {
  const { t } = useTranslation()
  const unavailable = useAiStore((state) => state.unavailable)
  const [question, setQuestion] = useState('')
  const ask = useAskAi()

  if (unavailable) return null

  const trimmed = question.trim()
  const canSubmit = trimmed.length > 0 && trimmed.length <= MAX_LENGTH

  const submit = () => {
    if (!canSubmit || ask.isPending) return
    const range = clampAskPeriod(period)
    ask.mutate({
      question: trimmed,
      date_from: range.date_from,
      date_to: range.date_to,
    })
  }

  return (
    <Card>
      <CardHeader
        title={
          <span className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" aria-hidden />
            {t('ask.title')}
          </span>
        }
        description={t('ask.description')}
      />

      <CardBody className="space-y-3">
        <div className="relative">
          <Textarea
            value={question}
            maxLength={MAX_LENGTH}
            disabled={ask.isPending}
            aria-label={t('ask.title')}
            placeholder={t('ask.placeholder')}
            onChange={(event) => setQuestion(event.target.value)}
            onKeyDown={(event) => {
              // Enter sends, Shift+Enter adds a newline — the familiar chat idiom.
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                submit()
              }
            }}
            className="min-h-20 pr-28"
          />

          <Button
            variant="primary"
            size="sm"
            icon={<CornerDownLeft />}
            className="absolute right-2.5 bottom-2.5"
            loading={ask.isPending}
            disabled={!canSubmit}
            onClick={submit}
          >
            {t('ask.submit')}
          </Button>
        </div>

        <p className="flex items-start gap-1.5 text-2xs leading-5 text-fg-subtle">
          <Info className="mt-0.5 size-3 shrink-0" aria-hidden />
          {t('ask.scopeHint')}
        </p>

        {ask.isPending ? (
          <p aria-live="polite" className="text-[13px] text-fg-muted">
            {t('ask.thinking')}
          </p>
        ) : null}

        {ask.isError ? (
          <p role="alert" className="text-[13px] text-danger-fg">
            {t('ask.failed')}
          </p>
        ) : null}

        {ask.data ? <AskAnswer answer={ask.data as AskResponse} /> : null}
      </CardBody>
    </Card>
  )
}
