import type { RawRuleViolation, RuleViolation } from './types'

/**
 * Folds whatever the current prompt emitted into one shape.
 *
 * Defensive on purpose: this field's contents are written by an LLM against a
 * prompt that changes without a version bump, so a shape we have never seen
 * must degrade to "show what is there" rather than crash the analysis panel —
 * which is exactly what rendering the raw object as a React child did.
 */
export function normalizeViolations(
  raw: readonly RawRuleViolation[] | null | undefined,
): RuleViolation[] {
  if (!Array.isArray(raw)) return []

  return raw
    .map((entry): RuleViolation => {
      if (typeof entry === 'string') {
        return { rule: entry, location: '', explanation: '' }
      }
      if (entry && typeof entry === 'object') {
        return {
          rule: text(entry.rule),
          location: text(entry.location),
          explanation: text(entry.explanation),
        }
      }
      return { rule: '', location: '', explanation: '' }
    })
    .filter(
      (violation) =>
        violation.rule !== '' ||
        violation.explanation !== '' ||
        violation.location !== '',
    )
}

/** Anything non-string (a number, a nested object) is dropped, not stringified. */
function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}
