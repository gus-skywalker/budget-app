import type { BillingSummaryResponse } from '@/services/BillingOrchestrationService'
import { PLAN_FEATURES, featureAvailability, type PlanFeature } from '@/utils/planAccess'

type Tier = 'STARTER' | 'TEAM'
type FeatureKey = PlanFeature['key']

// A hint means that this accessible page contains a paid feature, not that the
// whole page is restricted. Keep full-page gates (such as closing) separate.
const NAV_FEATURES: Record<string, readonly FeatureKey[]> = {
  decisions: ['collaboration'],
  overview: ['connectedFinance', 'ai', 'advancedCashflow'],
  transactions: ['connectedFinance', 'ai'],
  cashflow: ['ai', 'advancedCashflow'],
  accounts: ['connectedFinance'],
  categories: ['connectedFinance'],
  'planning-budget': ['planningIntelligence', 'connectedFinance'],
  'planning-scenarios': ['advancedScenarios'],
  'planning-goals': ['ai'],
  settings: ['connectedFinance'],
}

export function sidebarPlanHints(key: string, summary: BillingSummaryResponse | null): Tier[] {
  if (!summary) return []
  const missing = (NAV_FEATURES[key] || [])
    .map(featureKey => PLAN_FEATURES.find(feature => feature.key === featureKey)!)
    .filter(feature => featureAvailability(summary, feature) === 'locked')
    .map(feature => feature.tier)
  return [...new Set(missing)]
}
