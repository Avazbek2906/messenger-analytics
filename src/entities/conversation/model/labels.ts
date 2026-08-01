import type { MessageKey } from '@/shared/i18n'
import type { BadgeTone } from '@/shared/ui/primitives/badge'

import type {
  AgreementStatus,
  AttributionSource,
  Channel,
  MessageType,
  Outcome,
  Sentiment,
} from './types'

/* Enum → translation key. The text itself comes from `t()` in the component. */

export function outcomeLabelKey(outcome: Outcome): MessageKey {
  return `outcome.${outcome}` as MessageKey
}

export function sentimentLabelKey(sentiment: Sentiment): MessageKey {
  return `sentiment.${sentiment}` as MessageKey
}

export function channelLabelKey(channel: Channel): MessageKey {
  return `channel.${channel}` as MessageKey
}

export function messageTypeLabelKey(type: MessageType): MessageKey {
  return `messageType.${type}` as MessageKey
}

export function agreementStatusLabelKey(status: AgreementStatus): MessageKey {
  return `agreementStatus.${status}` as MessageKey
}

/** `""` means unassigned; it gets its own key. */
export function attributionLabelKey(source: AttributionSource): MessageKey {
  return source === ''
    ? 'attributionSource.unassigned'
    : (`attributionSource.${source}` as MessageKey)
}

/* ------------------------------------------------------------- Colours */

export const OUTCOME_TONES: Record<Outcome, BadgeTone> = {
  sotildi: 'success',
  sotilmadi: 'danger',
  noaniq: 'neutral',
}

export const SENTIMENT_TONES: Record<Sentiment, BadgeTone> = {
  positive: 'success',
  neutral: 'neutral',
  negative: 'warning',
  angry: 'danger',
}

export const AGREEMENT_TONES: Record<AgreementStatus, BadgeTone> = {
  pending: 'info',
  fulfilled: 'success',
  forgotten: 'danger',
}

export const CHANNEL_COLORS: Record<Channel, string> = {
  telegram: 'var(--color-channel-telegram)',
  instagram: 'var(--color-channel-instagram)',
  web: 'var(--color-channel-web)',
}

/**
 * Score bands (spec §4). `0–49` is the "poor" band that raises `low_score`.
 * `null` is not a band — it means "not measured".
 */
export function scoreTone(score: number | null): BadgeTone {
  if (score === null) return 'outline'
  if (score <= 49) return 'danger'
  if (score < 75) return 'warning'
  return 'success'
}
