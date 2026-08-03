import { describe, expect, it } from 'vitest'

import { EMPTY_ACCOUNT, toAccountInput } from './model/account-draft'
import { canResetPassword, grantableRoles } from './model/types'

describe('grantableRoles', () => {
  it('stops a manager from creating an owner', () => {
    // Otherwise a manager could invite an owner and take over the tenant; the
    // backend answers `role_not_grantable`, so offering it would be a dead end.
    expect(grantableRoles('manager')).toEqual(['manager', 'viewer'])
    expect(grantableRoles('owner')).toContain('owner')
    expect(grantableRoles('viewer')).toEqual([])
  })
})

describe('canResetPassword', () => {
  it('mirrors the grant table', () => {
    expect(canResetPassword('manager', 'owner')).toBe(false)
    expect(canResetPassword('manager', 'viewer')).toBe(true)
    expect(canResetPassword('admin', 'owner')).toBe(true)
  })
})

describe('toAccountInput', () => {
  it('omits an empty password instead of sending a blank one', () => {
    // `""` would be run through Django's validators and rejected; a missing
    // key is what makes the backend generate a password.
    const input = toAccountInput({ ...EMPTY_ACCOUNT, username: ' aziza.k ' })

    expect(input).toEqual({ username: 'aziza.k', role: 'viewer' })
    expect('password' in input).toBe(false)
  })

  it('keeps an explicit password', () => {
    const input = toAccountInput({
      username: 'aziza.k',
      role: 'manager',
      password: '  Ch0sen!Pass  ',
    })

    expect(input.password).toBe('Ch0sen!Pass')
  })
})
