import type { BillingSummaryResponse } from '@/services/BillingOrchestrationService'

type Capability = keyof NonNullable<BillingSummaryResponse['capabilities']>

export const PLAN_FEATURES = [
  { key: 'connectedFinance', capability: 'connectedFinanceEnabled', tier: 'STARTER' },
  { key: 'ai', capability: 'aiEnabled', tier: 'STARTER' },
  { key: 'planningIntelligence', capability: 'planningIntelligenceEnabled', tier: 'STARTER' },
  { key: 'advancedScenarios', capability: 'advancedScenariosEnabled', tier: 'STARTER' },
  { key: 'collaboration', capability: 'collaborationEnabled', tier: 'STARTER' },
  { key: 'advancedCashflow', capability: 'advancedCashflowEnabled', tier: 'TEAM' },
  { key: 'financialClosing', capability: 'financialClosingEnabled', tier: 'TEAM' },
] as const satisfies ReadonlyArray<{ key: string; capability: Capability; tier: 'STARTER' | 'TEAM' }>

export type PlanFeature = typeof PLAN_FEATURES[number]
export type FeatureAvailability = 'available' | 'locked' | 'unknown'

// Only an explicit backend capability can assert access or a plan lock.
export function featureAvailability(
  summary: BillingSummaryResponse | null,
  feature: PlanFeature,
): FeatureAvailability {
  const value = summary?.capabilities?.[feature.capability]
  return value === true ? 'available' : value === false ? 'locked' : 'unknown'
}
