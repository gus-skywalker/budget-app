import axiosInterceptor from './axiosInterceptor'

export type BillingSubjectType = 'USER' | 'COMPANY'
export type BillingDecisionAction = 'START_SUBSCRIPTION' | 'NOOP_ALREADY_PREMIUM'

export interface BillingDecisionRequest {
  plan: string
  actor: string

  /** Preferred canonical identity */
  subjectType?: BillingSubjectType
  subjectId?: string

  /** Backward-compatible fields */
  userId?: string | null
  companyId?: string | null

  /** Tracing (backend expects/accepts correlationId in body) */
  correlationId?: string
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
  userId?: string | null
  companyId?: string | null
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
