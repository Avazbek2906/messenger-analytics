import { describe, expect, it } from 'vitest'

import { ApiError } from './error'

const envelope = {
  type: 'validation_error' as const,
  errors: [
    { code: 'invalid_score', detail: 'Score must be 0–100.', attr: 'score' },
    { code: 'merge_self', detail: 'Cannot merge into itself.', attr: null },
  ],
}

describe('ApiError', () => {
  it('indexes errors by code and attr', () => {
    const error = new ApiError(400, envelope)

    expect(error.byCode.invalid_score?.attr).toBe('score')
    expect(error.byField.score?.code).toBe('invalid_score')
    // An error with attr === null never lands in byField.
    expect(Object.keys(error.byField)).toEqual(['score'])
  })

  it('has() checks several codes at once', () => {
    const error = new ApiError(400, envelope)

    expect(error.has('merge_self')).toBe(true)
    expect(error.has('merge_cycle', 'merge_self')).toBe(true)
    expect(error.has('period_invalid')).toBe(false)
  })

  it('tells the two causes of a 403 apart', () => {
    const noCompany = new ApiError(403, {
      type: 'client_error',
      errors: [
        {
          code: 'permission_denied',
          detail: 'User is not attached to a company.',
          attr: null,
        },
      ],
    })
    const roleDenied = new ApiError(403, {
      type: 'client_error',
      errors: [
        {
          code: 'permission_denied',
          detail: 'This action requires a manager role.',
          attr: null,
        },
      ],
    })

    expect(noCompany.isMissingCompany).toBe(true)
    expect(noCompany.isRoleDenied).toBe(false)
    expect(roleDenied.isRoleDenied).toBe(true)
    expect(roleDenied.isMissingCompany).toBe(false)
  })

  it('survives an empty response body', () => {
    const error = new ApiError(500, null)

    expect(error.type).toBe('server_error')
    expect(error.errors).toEqual([])
    expect(error.message).toBe('HTTP 500')
  })
})
