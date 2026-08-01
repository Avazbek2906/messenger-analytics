import type { ApiDate, ApiDateTime, UUID } from '@/shared/api'

/* --------------------------------------------------------------- Enums */

export type Channel = 'telegram' | 'instagram' | 'web'

/** A never-scored conversation returns `null` — NOT `noaniq`. */
export type Outcome = 'sotildi' | 'sotilmadi' | 'noaniq'

export type Sentiment = 'positive' | 'neutral' | 'negative' | 'angry'

export type MessageDirection = 'inbound' | 'outbound'

export type MessageType =
  | 'text'
  | 'voice'
  | 'image'
  | 'video'
  | 'file'
  | 'sticker'
  | 'location'
  | 'other'

/** `""` means unassigned (it always comes with `employee: null`). */
export type AttributionSource =
  | 'mode_1'
  | 'mode_2_shift'
  | 'mode_3_extension'
  | 'widget'
  | 'legacy'
  | 'manual'
  | ''

/** Only the first three are accepted on write; `employee` is written by `/assign`. */
export type OverrideField = 'outcome' | 'score' | 'primary_reason' | 'employee'

export type AgreementStatus = 'pending' | 'fulfilled' | 'forgotten'

export type AnalysisStage = 'realtime' | 'batch'

/* ------------------------------------------------------------- List row */

export interface Conversation {
  id: UUID
  channel: Channel
  customer: UUID
  customer_name: string | null
  employee: UUID | null
  employee_name: string | null
  attribution_source: AttributionSource
  started_at: ApiDateTime
  last_message_at: ApiDateTime
  /** `null` means the conversation is still open. */
  closed_at: ApiDateTime | null
  is_legacy: boolean
  /** `null` means unanswered or still open — never "replied instantly". */
  first_response_seconds: number | null
  avg_response_seconds: number | null
  /** `null` until scored — never `0`. */
  score: number | null
  outcome: Outcome | null
  customer_sentiment: Sentiment | null
  needs_review: boolean | null
}

/* ------------------------------------------------------------- Analysis */

export interface ReasonRef {
  id: UUID
  code: string
  label: string
}

export interface EffectiveReason extends ReasonRef {
  /** `manager` — a human corrected it; `ai` — the model decided. */
  source: 'manager' | 'ai'
}

export interface ProductRef {
  id: UUID
  name: string
}

export interface FunnelStep {
  stage: string
  status: string
  note: string
}

export interface AnalysisResult {
  id: UUID
  stage: AnalysisStage
  model: string
  created_at: ApiDateTime
  outcome: Outcome | null
  outcome_confidence: number | null
  outcome_signal: string
  customer_sentiment: Sentiment | null
  score: number | null
  /** Free-form JSON — keys depend on the prompt version, so render generically. */
  sub_scores: Record<string, number>
  rule_violations: string[]
  funnel: FunnelStep[]
  needs_review: boolean
  products_of_interest: ProductRef[]
  primary_reason: ReasonRef | null
  reason_evidence: string
  secondary_reasons: ReasonRef[]
  other_reason_text: string
  coaching_suggestion: string
}

export interface ManagerOverride {
  id: UUID
  field: OverrideField
  old_value: string
  new_value: string
  overridden_by: UUID
  overridden_by_name: string | null
  created_at: ApiDateTime
}

export interface Agreement {
  id: UUID
  conversation: UUID
  text: string
  due_hint: string
  due_on: ApiDate | null
  evidence: string
  status: AgreementStatus
  employee: UUID | null
  employee_name: string | null
  created_at: ApiDateTime
}

export interface ConversationDetail extends Conversation {
  /** `null` when never scored (backfilled history is never auto-scored). */
  analysis: AnalysisResult | null
  /** What the business acts on — the raw AI value is shown as secondary text. */
  effective_outcome: Outcome | null
  effective_score: number | null
  effective_reason: EffectiveReason | null
  /** Append-only audit trail, newest first. */
  overrides: ManagerOverride[]
  agreements: Agreement[]
}

/* ------------------------------------------------------------- Messages */

export interface RawMessage {
  id: UUID
  direction: MessageDirection
  message_type: MessageType
  text: string
  /** STT output for a voice note — this is exactly what the AI reads. */
  transcript: string
  transcript_source: string
  transcript_confidence: number | null
  detected_language: string
  has_audio: boolean
  /** Exactly `null` when `has_audio` is false. Requires a JWT. */
  audio_url: string | null
  sent_at: ApiDateTime
  is_echo: boolean
  external_id: string
}
