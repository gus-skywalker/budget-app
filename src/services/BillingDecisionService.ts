import axiosInterceptor from './axiosInterceptor'
import type { SupportedCurrency } from '@/utils/pricing'

export type BillingSubjectType = 'USER' | 'WORKSPACE'
export type BillingDecisionAction = 'START_SUBSCRIPTION' | 'NOOP_ALREADY_PREMIUM'

export interface BillingDecisionRequest {
  plan: string
  actor: string

  /** Preferred canonical identity */
  subjectType?: BillingSubjectType
  subjectId?: string

  /** Preferred identity fields */
  userId?: string | null
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
  decidedTarget: BillingSubjectType
  subjectType: BillingSubjectType
  subjectId: string
  hasPremiumAccess: boolean
  shouldStartSubscription: boolean
  action: BillingDecisionAction
  trialDays?: number
  plan: string
  planTier?: 'STARTER' | 'TEAM'
  billingCycle?: 'MONTHLY' | 'ANNUAL'
  userId?: string | null
  workspaceId?: string | null
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
