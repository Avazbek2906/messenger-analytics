import { messageTypeLabelKey, type RawMessage } from '@/entities/conversation'
import { AudioPlayer } from '@/features/message-audio/ui/audio-player'
import { useTranslation } from '@/shared/i18n'
import { cn, formatTime } from '@/shared/lib'
import { Badge } from '@/shared/ui/primitives/badge'

/**
 * A single message.
 *
 * The text source depends on the type: `transcript` for `voice`, `text` for
 * everything else — exactly what the AI is shown. If transcription has not
 * finished, an explicit state is rendered rather than an empty bubble (docs/03).
 */
export function MessageBubble({ message }: { message: RawMessage }) {
  const { t } = useTranslation()
  const outbound = message.direction === 'outbound'

  const body =
    message.message_type === 'voice' ? message.transcript : message.text
  const hasMedia =
    message.message_type !== 'text' && message.message_type !== 'voice'

  return (
    <li className={cn('flex', outbound ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[min(32rem,85%)] space-y-2 rounded-2xl px-3.5 py-2.5',
          outbound
            ? 'rounded-br-sm bg-primary-soft text-fg'
            : 'rounded-bl-sm bg-surface-sunken text-fg',
        )}
      >
        {hasMedia ? (
          <Badge tone="outline" size="sm">
            {t(messageTypeLabelKey(message.message_type))}
          </Badge>
        ) : null}

        {body ? (
          <p className="text-[13px] leading-6 whitespace-pre-wrap">{body}</p>
        ) : message.message_type === 'voice' ? (
          <p className="text-[13px] text-fg-subtle italic">
            {t('transcript.pending')}
          </p>
        ) : null}

        {message.has_audio ? <AudioPlayer messageId={message.id} /> : null}

        <div className="flex items-center justify-end gap-2 text-2xs text-fg-subtle">
          {message.detected_language ? (
            <span className="uppercase">{message.detected_language}</span>
          ) : null}
          <time dateTime={message.sent_at}>{formatTime(message.sent_at)}</time>
        </div>
      </div>
    </li>
  )
}
