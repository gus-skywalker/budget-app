import axiosInterceptor from './axiosInterceptor'
import type { SupportedCurrency } from '@/utils/pricing'

export type BillingDecisionAction = 'START_SUBSCRIPTION' | 'NOOP_ALREADY_PREMIUM'

export interface BillingDecisionRequest {
  plan: string
  actor: string
  workspaceId?: string | null

  /** Tracing (backend expects/accepts correlationId in body) */
  correlationId?: string

  /** Preferred billing context for backend currency resolution */
  preferredCurrency?: SupportedCurrency
  countryCode?: string | null
  browserLocale?: string | null
  uiLocale?: string | null
}

export interface BillingDecisionResponse {
  hasPremiumAccess: boolean
  shouldStartSubscription: boolean
  action: BillingDecisionAction
  trialDays?: number
  plan: string
  planTier?: 'STARTER' | 'TEAM'
  billingCycle?: 'MONTHLY' | 'ANNUAL'
  workspaceId?: string | null
  /** Canonical backend owner identifier; response-only for frontend compatibility. */
  billingAccountId?: string | null
  resolvedCurrency?: SupportedCurrency
  resolvedPriceId?: string | null
  catalogVersion?: string | null
  correlationId: string
  actor: string
  decidedAt: string
}

export default {
  decide(payload: Omit<BillingDecisionRequest, 'correlationId'>, correlationId: string) {
    return axiosInterceptor.post<BillingDecisionResponse>('/billing/decision', {
      ...payload,
      correlationId
    })
  }
}
