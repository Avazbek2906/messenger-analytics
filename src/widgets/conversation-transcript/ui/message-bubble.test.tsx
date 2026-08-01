import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { RawMessage } from '@/entities/conversation'
import { renderWithProviders } from '@/test/render'

import { MessageBubble } from './message-bubble'

function buildMessage(patch: Partial<RawMessage> = {}): RawMessage {
  return {
    id: '12ab34cd-56ef-4780-91a2-b3c4d5e6f708',
    direction: 'inbound',
    message_type: 'text',
    text: 'Salom, vitrina narxi qancha?',
    transcript: '',
    transcript_source: '',
    transcript_confidence: null,
    detected_language: '',
    has_audio: false,
    audio_url: null,
    sent_at: '2026-07-28 09:14:02',
    is_echo: false,
    external_id: 'tg:441029',
    ...patch,
  }
}

describe('MessageBubble', () => {
  it('shows the `text` field for a text message', () => {
    renderWithProviders(<MessageBubble message={buildMessage()} />)

    expect(screen.getByText('Salom, vitrina narxi qancha?')).toBeInTheDocument()
  })

  it('shows `transcript` for a voice note, not `text`', () => {
    // The AI reads `transcript` too — the UI must not diverge from that.
    renderWithProviders(
      <MessageBubble
        message={buildMessage({
          message_type: 'voice',
          text: '',
          transcript: 'Bu narx menga to‘g‘ri kelmaydi.',
          has_audio: true,
        })}
      />,
    )

    expect(
      screen.getByText('Bu narx menga to‘g‘ri kelmaydi.'),
    ).toBeInTheDocument()
  })

  it('renders an explicit state instead of an empty bubble while transcribing', () => {
    renderWithProviders(
      <MessageBubble
        message={buildMessage({
          message_type: 'voice',
          text: '',
          transcript: '',
          has_audio: true,
        })}
      />,
    )

    expect(screen.getByText(/tayyorlanmoqda/i)).toBeInTheDocument()
  })

  it('shows a type chip for media messages', () => {
    renderWithProviders(
      <MessageBubble
        message={buildMessage({ message_type: 'image', text: '' })}
      />,
    )

    expect(screen.getByText('Rasm')).toBeInTheDocument()
  })
})
