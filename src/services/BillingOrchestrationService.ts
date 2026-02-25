import axiosInterceptor from './axiosInterceptor'
import type { BillingSubjectType } from './BillingDecisionService'

export interface StartSubscriptionRequest {
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

export interface OpenPortalRequest {
  actor: string
  subjectType: BillingSubjectType
  subjectId: string
  correlationId: string
  messageId: string
  returnUrl?: string
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
  }
}
