import axiosInterceptor from './axiosInterceptor'
import type { SupportedCurrency } from '@/utils/pricing'

interface PricingContextPayload {
  preferredCurrency?: SupportedCurrency
  countryCode?: string | null
  browserLocale?: string | null
  uiLocale?: string | null
}

export interface StartSubscriptionRequest extends PricingContextPayload {
  plan: string
  actor: string
  billingAccountId?: string | null
  promotionClaimId?: string | null
  promotionCampaignKey?: string | null
  promotionDiscountPercent?: number | null
  correlationId: string
  /** Backend command idempotency key */
  messageId: string
}

export interface CancelSubscriptionRequest {
  actor: string
  billingAccountId?: string | null
  correlationId: string
  messageId: string
}

export interface OpenPortalRequest extends PricingContextPayload {
  actor: string
  billingAccountId?: string | null
  correlationId: string
  messageId: string
  returnUrl?: string
  targetPlan?: 'MONTHLY' | 'ANNUAL' | 'BUSINESS_MONTHLY' | 'BUSINESS_ANNUAL'
}

export interface CommandAcceptedResponse {
  messageId: string
  correlationId: string
  status: 'ACCEPTED'
}

export interface OperationStatusResponse {
  messageId: string
  messageType: string
  messageVersion: string
  correlationId: string
  status: 'PENDING' | 'SENDING' | 'DISPATCHED' | 'FAILED'
  attempts: number
  lastError?: string | null
  redirectUrl?: string | null
  resolvedCurrency?: SupportedCurrency
  resolvedPriceId?: string | null
}

export interface BillingSummaryResponse {
  workspaceId?: string | null
  /** Canonical backend owner identifier; response-only for frontend compatibility. */
  billingAccountId?: string | null
  hasPremiumAccess: boolean
  hasPlanAccess?: boolean
  subscriptionStatus?: 'NONE' | 'INCOMPLETE' | 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED'
  currentPlanTier?: 'FREE' | 'STARTER' | 'TEAM'
  currentBillingCycle?: 'MONTHLY' | 'ANNUAL'
  currentPlanId?: 'MONTHLY' | 'ANNUAL' | 'BUSINESS_MONTHLY' | 'BUSINESS_ANNUAL'
  trialEndsAt?: string
  nextBillingDate?: string
  paymentProviderReachable?: boolean
  subscriptionDataSource?: 'LOCAL' | 'PAYMENT_API' | 'LOCAL_FALLBACK'
  workspaceQuota?: {
    hasBillingAccount: boolean
    activeWorkspaceCount: number
    activeCollaborativeWorkspaceCount: number
    activePersonalWorkspaceCount: number
  }
  planLimits?: {
    maxWorkspaces: number
    maxMembersPerWorkspace: number
    maxSavedScenarios?: number
    maxSavedDecisions?: number
  }
  capabilities?: {
    aiEnabled: boolean
    connectedFinanceEnabled?: boolean
    collaborationEnabled?: boolean
    planningIntelligenceEnabled?: boolean
    advancedScenariosEnabled?: boolean
    advancedCashflowEnabled?: boolean
    advancedToolsEnabled: boolean
  }
  checkedAt: string
}

export default {
  startSubscription(payload: StartSubscriptionRequest) {
    return axiosInterceptor.post<CommandAcceptedResponse>('/billing/subscriptions/start', payload)
  },

  cancelSubscription(payload: CancelSubscriptionRequest) {
    return axiosInterceptor.post<CommandAcceptedResponse>('/billing/subscriptions/cancel', payload)
  },

  openPortal(payload: OpenPortalRequest) {
    return axiosInterceptor.post<CommandAcceptedResponse>('/billing/subscriptions/portal/open', payload)
  },

  getOperationStatus(messageId: string) {
    return axiosInterceptor.get<OperationStatusResponse>(`/billing/operations/${encodeURIComponent(messageId)}`)
  },

  getBillingSummary(workspaceId: string) {
    return axiosInterceptor.get<BillingSummaryResponse>('/billing/access', {
      params: {
        workspaceId
      }
    })
  },

  getBillingSummaryByBillingAccount(billingAccountId: string) {
    return axiosInterceptor.get<BillingSummaryResponse>('/billing/access', {
      params: {
        billingAccountId
      }
    })
  }
}
