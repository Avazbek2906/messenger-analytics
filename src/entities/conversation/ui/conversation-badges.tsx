import { Camera, Globe, Send } from 'lucide-react'

import { useTranslation } from '@/shared/i18n'
import { DASH, cn, formatScore } from '@/shared/lib'
import { Badge } from '@/shared/ui/primitives/badge'
import { Tooltip } from '@/shared/ui/primitives/tooltip'

import {
  CHANNEL_COLORS,
  OUTCOME_TONES,
  SENTIMENT_TONES,
  attributionLabelKey,
  channelLabelKey,
  outcomeLabelKey,
  scoreTone,
  sentimentLabelKey,
} from '../model/labels'
import type {
  AttributionSource,
  Channel,
  Outcome,
  Sentiment,
} from '../model/types'

/**
 * Visual treatment of conversation attributes.
 *
 * The rule throughout: `null` means "not measured" and renders as `—`; it never
 * degrades into `0` or a default enum value (docs/03).
 */

const CHANNEL_ICONS = {
  telegram: Send,
  instagram: Camera,
  web: Globe,
} as const

export function ChannelIcon({
  channel,
  className,
}: {
  channel: Channel
  className?: string
}) {
  const { t } = useTranslation()
  const Icon = CHANNEL_ICONS[channel] ?? Globe
  const label = t(channelLabelKey(channel))

  return (
    <Tooltip content={label}>
      <span
        className={cn('inline-flex shrink-0', className)}
        style={{ color: CHANNEL_COLORS[channel] }}
      >
        <Icon className="size-4" aria-hidden />
        <span className="sr-only">{label}</span>
      </span>
    </Tooltip>
  )
}

export function OutcomeBadge({ outcome }: { outcome: Outcome | null }) {
  const { t } = useTranslation()

  if (outcome === null) {
    return (
      <Tooltip content={t('conversation.notScoredHint')}>
        <span className="cursor-help text-fg-subtle">{DASH}</span>
      </Tooltip>
    )
  }

  return (
    <Badge tone={OUTCOME_TONES[outcome]} size="sm">
      {t(outcomeLabelKey(outcome))}
    </Badge>
  )
}

export function SentimentBadge({ sentiment }: { sentiment: Sentiment | null }) {
  const { t } = useTranslation()

  if (sentiment === null) return <span className="text-fg-subtle">{DASH}</span>

  return (
    <Badge tone={SENTIMENT_TONES[sentiment]} size="sm">
      {t(sentimentLabelKey(sentiment))}
    </Badge>
  )
}

/** Score plus band colour. The band lives in colour, so a tooltip explains it. */
export function ScoreValue({ score }: { score: number | null }) {
  const { t } = useTranslation()

  if (score === null) {
    return (
      <Tooltip content={t('conversation.notScoredHint')}>
        <span className="cursor-help text-fg-subtle">{DASH}</span>
      </Tooltip>
    )
  }

  return (
    <Badge tone={scoreTone(score)} size="sm" className="tabular">
      {formatScore(score)}
    </Badge>
  )
}

export function AttributionBadge({
  source,
  className,
}: {
  source: AttributionSource
  className?: string
}) {
  const { t } = useTranslation()

  return (
    <Badge
      tone={
        source === 'manual' ? 'brand' : source === '' ? 'warning' : 'outline'
      }
      size="sm"
      className={className}
    >
      {t(attributionLabelKey(source))}
    </Badge>
  )
}
