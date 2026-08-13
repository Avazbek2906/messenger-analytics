import { useRef, useState } from 'react'

import { clampAskPeriod, useAskAi, type AskResponse } from '@/entities/insight'
import type { PeriodParams } from '@/shared/api'

export interface AskTurn {
  id: number
  question: string
  /** `null` until the answer arrives. */
  answer: AskResponse | null
  /** Set instead of `answer` when the call failed. */
  error: unknown
}

/**
 * The client-side transcript.
 *
 * `/ask` is STATELESS — there is no thread id and the model is never shown a
 * previous turn. The transcript exists so the user can re-read what they asked,
 * and for no other reason: "and what about last week?" will not resolve against
 * the question above it, which is why the panel says so under the composer
 * (docs/06).
 */
export function useAskThread(period: PeriodParams): {
  turns: AskTurn[]
  isPending: boolean
  send: (question: string) => void
  clear: () => void
} {
  const [turns, setTurns] = useState<AskTurn[]>([])
  const nextId = useRef(0)
  const ask = useAskAi()

  const patch = (id: number, changes: Partial<AskTurn>) => {
    setTurns((prev) =>
      prev.map((turn) => (turn.id === id ? { ...turn, ...changes } : turn)),
    )
  }

  const send = (question: string) => {
    const id = nextId.current++
    setTurns((prev) => [...prev, { id, question, answer: null, error: null }])

    // A window wider than 400 days makes `/ask` fail as an unhandled 500 — it
    // has no `period_too_long` guard, so the range is clamped here (docs/06).
    const range = clampAskPeriod(period)

    ask.mutate(
      { question, date_from: range.date_from, date_to: range.date_to },
      {
        onSuccess: (answer) => patch(id, { answer }),
        onError: (error) => patch(id, { error }),
      },
    )
  }

  return {
    turns,
    isPending: ask.isPending,
    send,
    clear: () => setTurns([]),
  }
}
