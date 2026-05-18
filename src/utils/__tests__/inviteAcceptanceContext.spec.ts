import { beforeEach, describe, expect, it } from 'vitest'
import {
  clearInviteAcceptanceContext,
  readInviteAcceptanceContext,
  readInviteAcceptanceRedirect,
  saveInviteAcceptanceContext
} from '@/utils/inviteAcceptanceContext'

describe('inviteAcceptanceContext', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('stores pending invite redirect for post-auth routing', () => {
    saveInviteAcceptanceContext({
      token: 'invite-token',
      redirect: '/invite/accept?token=invite-token',
      invitedEmail: 'guest@example.com'
    })

    expect(readInviteAcceptanceContext()).toEqual({
      token: 'invite-token',
      redirect: '/invite/accept?token=invite-token',
      invitedEmail: 'guest@example.com'
    })
    expect(readInviteAcceptanceRedirect()).toBe('/invite/accept?token=invite-token')
  })

  it('falls back to the invite accept route when redirect is omitted', () => {
    saveInviteAcceptanceContext({ token: 'token with spaces' })

    expect(readInviteAcceptanceRedirect()).toBe('/invite/accept?token=token%20with%20spaces')
  })

  it('clears pending invite context', () => {
    saveInviteAcceptanceContext({ token: 'invite-token' })
    clearInviteAcceptanceContext()

    expect(readInviteAcceptanceContext()).toBeNull()
    expect(readInviteAcceptanceRedirect()).toBeNull()
  })
})
