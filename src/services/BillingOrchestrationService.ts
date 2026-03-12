import axiosInterceptor from './axiosInterceptor'
import type { BillingSubjectType } from './BillingDecisionService'
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
  subjectType: BillingSubjectType
  subjectId: string
  correlationId: string
  /** Backend command idempotency key */
  messageId: string
}

export interface CancelSubscriptionRequest {
  actor: string
  subjectType: BillingSubjectType
  subjectId: string
  correlationId: string
  messageId: string
}

export interface OpenPortalRequest extends PricingContextPayload {
  actor: string
  subjectType: BillingSubjectType
  subjectId: string
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
  checkoutUrl?: string | null
  resolvedCurrency?: SupportedCurrency
  resolvedPriceId?: string | null
}

export interface BillingAccessResponse {
  subjectType: BillingSubjectType
  subjectId: string
  hasPremiumAccess: boolean
  hasPlanAccess?: boolean
  subscriptionStatus?: 'NONE' | 'INCOMPLETE' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED'
  currentPlanTier?: 'FREE' | 'STARTER' | 'TEAM'
  currentBillingCycle?: 'MONTHLY' | 'ANNUAL'
  currentPlanId?: 'MONTHLY' | 'ANNUAL' | 'BUSINESS_MONTHLY' | 'BUSINESS_ANNUAL'
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

  getPremiumAccess(subjectType: BillingSubjectType, subjectId: string) {
    return axiosInterceptor.get<BillingAccessResponse>('/billing/access', {
      params: {
        subjectType,
        subjectId
      }
    })
  }
}
