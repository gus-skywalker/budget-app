import type { RouteLocationRaw } from 'vue-router'
import type { BillingSummaryResponse } from '@/services/BillingOrchestrationService'

export const decisionIntents = [
  { id: 'monthly-change', icon: 'mdi-calendar-month-outline', destination: 'planning-scenarios-new', group: 'primary', requiresWrite: true, advanced: false },
  { id: 'payment-options', icon: 'mdi-credit-card-outline', destination: 'planning-scenarios-debt-new', group: 'primary', requiresWrite: true, advanced: true },
  { id: 'custom', icon: 'mdi-tune-variant', destination: 'planning-scenarios-new', group: 'primary', requiresWrite: true, advanced: false },
  { id: 'organize-month', icon: 'mdi-wallet-outline', destination: 'planning-budget', group: 'support', requiresWrite: false, advanced: false },
  { id: 'goal', icon: 'mdi-flag-outline', destination: 'planning-goals', group: 'support', requiresWrite: false, advanced: false },
] as const

export type DecisionIntent = typeof decisionIntents[number]
export const intentKey = (intent: DecisionIntent, part: 'title' | 'description') => `decisionJourney.intents.${intent.id}.${part}`

// Construct a fresh query: never inherit financial values, templates or clone IDs.
export function decisionDestination(value: unknown): RouteLocationRaw {
  const intent = decisionIntents.find(item => item.id === value) || decisionIntents[2]
  return intent.group === 'primary'
    ? { name: intent.destination, query: { guided: '1', intent: intent.id } }
    : { name: intent.destination }
}

// Preserve the hub's legacy capability fallback. Missing evidence is not denial.
export function advancedDecisionAccess(summary: BillingSummaryResponse | null): boolean | null {
  const capabilities = summary?.capabilities
  if (!capabilities) return null
  if (typeof capabilities.advancedScenariosEnabled === 'boolean') return capabilities.advancedScenariosEnabled
  return Boolean(capabilities.advancedToolsEnabled || summary?.hasPremiumAccess)
}
