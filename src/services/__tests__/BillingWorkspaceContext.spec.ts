import { beforeEach, describe, expect, it } from 'vitest'
import {
  clearBillingCheckoutContext,
  readBillingCheckoutContext,
  resolveActiveWorkspaceContext,
  resolveAnyWorkspaceContext,
  saveBillingCheckoutContext,
} from '@/services/BillingWorkspaceContext'

describe('BillingWorkspaceContext', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('returns the active workspace context when a workspace is selected', () => {
    const userStore = {
      getCurrentWorkspaceId: 'workspace-2',
      getWorkspaces: [
        { workspaceId: 'workspace-1', workspaceName: 'Personal' },
        { workspaceId: 'workspace-2', workspaceName: 'Finance Team' },
      ],
    } as any

    expect(resolveActiveWorkspaceContext(userStore)).toEqual({
      workspaceId: 'workspace-2',
      workspaceName: 'Finance Team',
    })
  })

  it('falls back to the first available workspace for read-only billing contexts', () => {
    const userStore = {
      getCurrentWorkspaceId: null,
      getWorkspaces: [
        { workspaceId: 'workspace-1', workspaceName: 'Personal' },
        { workspaceId: 'workspace-2', workspaceName: 'Shared' },
      ],
    } as any

    expect(resolveAnyWorkspaceContext(userStore)).toEqual({
      workspaceId: 'workspace-1',
      workspaceName: 'Personal',
    })
  })

  it('stores and restores checkout context without ownership fields', () => {
    saveBillingCheckoutContext({
      workspaceId: null,
      workspaceName: null,
      billingAccountId: 'billing-account-9',
      plan: 'BUSINESS_MONTHLY',
      correlationId: 'corr-9',
      storedAt: 123,
    })

    expect(readBillingCheckoutContext()).toEqual({
      workspaceId: null,
      workspaceName: null,
      billingAccountId: 'billing-account-9',
      plan: 'BUSINESS_MONTHLY',
      promotionClaimId: null,
      promotionCampaignKey: null,
      promotionDiscountPercent: null,
      correlationId: 'corr-9',
      storedAt: 123,
    })
  })

  it('restores checkout context even without a workspace id', () => {
    sessionStorage.setItem('billing.checkout.context', JSON.stringify({
      billingAccountId: 'billing-account-10',
      plan: 'BUSINESS_ANNUAL',
      storedAt: 456,
    }))

    expect(readBillingCheckoutContext()).toEqual({
      workspaceId: null,
      workspaceName: null,
      billingAccountId: 'billing-account-10',
      plan: 'BUSINESS_ANNUAL',
      promotionClaimId: null,
      promotionCampaignKey: null,
      promotionDiscountPercent: null,
      correlationId: null,
      storedAt: 456,
    })
  })

  it('clears stored checkout context explicitly', () => {
    saveBillingCheckoutContext({ workspaceId: 'workspace-3' })
    clearBillingCheckoutContext()

    expect(readBillingCheckoutContext()).toBeNull()
  })
})
