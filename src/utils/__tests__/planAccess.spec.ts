import { describe, expect, it } from 'vitest'
import { PLAN_FEATURES, featureAvailability } from '@/utils/planAccess'
import type { BillingSummaryResponse } from '@/services/BillingOrchestrationService'

const feature = (key: typeof PLAN_FEATURES[number]['key']) => PLAN_FEATURES.find(item => item.key === key)!
const summary = (capabilities: BillingSummaryResponse['capabilities']) => ({ capabilities } as BillingSummaryResponse)

describe('plan feature availability', () => {
  it('mirrors explicit backend capabilities for Starter and Team features', () => {
    expect(featureAvailability(summary({ aiEnabled: true, advancedToolsEnabled: true, financialClosingEnabled: false }), feature('ai'))).toBe('available')
    expect(featureAvailability(summary({ aiEnabled: true, advancedToolsEnabled: true, financialClosingEnabled: false }), feature('financialClosing'))).toBe('locked')
    expect(feature('financialClosing').tier).toBe('TEAM')
    expect(feature('connectedFinance').tier).toBe('STARTER')
  })

  it('does not turn failed or incomplete billing responses into a plan lock', () => {
    expect(featureAvailability(null, feature('ai'))).toBe('unknown')
    expect(featureAvailability(summary({ aiEnabled: false, advancedToolsEnabled: false }), feature('financialClosing'))).toBe('unknown')
    expect(featureAvailability(summary({ aiEnabled: false, advancedToolsEnabled: false }), feature('ai'))).toBe('locked')
  })
})
