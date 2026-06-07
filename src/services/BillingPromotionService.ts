import axiosInterceptor from './axiosInterceptor'

export interface BillingPromotionClaim {
  claimId: string
  status: string
  actorUserId?: string | null
  workspaceId?: string | null
  billingAccountId?: string | null
  plan?: string | null
  discountPercent?: number | null
  claimedAt?: string | null
  expiresAt?: string | null
  consumedAt?: string | null
  winner?: boolean
}

export interface BillingPromotionResponse {
  campaignKey?: string | null
  name?: string | null
  description?: string | null
  status?: string | null
  discountPercent?: number | null
  maxClaims?: number | null
  claimedCount?: number | null
  remainingClaims?: number | null
  reserveMinutes?: number | null
  minimumPlanTier?: string | null
  startsAt?: string | null
  endsAt?: string | null
  checkedAt?: string | null
  currentClaim?: BillingPromotionClaim | null
  recentClaims?: BillingPromotionClaim[]
}

export interface BillingPromotionClaimRequest {
  workspaceId?: string | null
  billingAccountId?: string | null
  plan: string
  actor: string
  correlationId?: string | null
}

export default {
  getCurrent(workspaceId?: string | null, billingAccountId?: string | null) {
    return axiosInterceptor.get<BillingPromotionResponse>('/billing/promotions/current', {
      params: {
        workspaceId,
        billingAccountId,
      },
    })
  },

  claim(payload: BillingPromotionClaimRequest) {
    return axiosInterceptor.post<BillingPromotionClaim>('/billing/promotions/current/claim', payload)
  },
}
