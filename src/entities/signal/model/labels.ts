import {
  AlertTriangle,
  Frown,
  Handshake,
  MessageCircleOff,
  Scale,
  TrendingDown,
  UserX,
  type LucideIcon,
} from 'lucide-react'

import type { MessageKey } from '@/shared/i18n'
import type { BadgeTone } from '@/shared/ui/primitives/badge'

import type { SignalKind } from './types'

/**
 * Display order and severity.
 *
 * The API has NO severity field — every signal is flat and equally weighted
 * server-side. This ordering is a client-side product decision and must stay
 * stable, so it lives in exactly one place (docs/06).
 */
export const SIGNAL_ORDER: readonly SignalKind[] = [
  'unanswered',
  'angry_customer',
  'rule_violations',
  'forgotten_agreement',
  'low_score',
  'needs_review',
  'unassigned',
]

export const SIGNAL_ICONS: Record<SignalKind, LucideIcon> = {
  unanswered: MessageCircleOff,
  angry_customer: Frown,
  rule_violations: Scale,
  forgotten_agreement: Handshake,
  low_score: TrendingDown,
  needs_review: AlertTriangle,
  unassigned: UserX,
}

export const SIGNAL_TONES: Record<SignalKind, BadgeTone> = {
  unanswered: 'danger',
  angry_customer: 'danger',
  rule_violations: 'warning',
  forgotten_agreement: 'warning',
  low_score: 'warning',
  needs_review: 'info',
  unassigned: 'neutral',
}

export function signalLabelKey(kind: SignalKind): MessageKey {
  return `signal.${kind}` as MessageKey
}

export function signalHintKey(kind: SignalKind): MessageKey {
  return `signalHint.${kind}` as MessageKey
}
