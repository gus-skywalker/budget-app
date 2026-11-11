import { describe, expect, it } from 'vitest'
import { sidebarPlanHints } from '@/utils/sidebarPlanHints'
import type { BillingSummaryResponse } from '@/services/BillingOrchestrationService'

const summary = (capabilities: BillingSummaryResponse['capabilities']) => ({ capabilities } as BillingSummaryResponse)

describe('sidebar plan hints', () => {
  it('shows Starter and Team only for confirmed missing features on accessible pages', () => {
    const free = summary({
      aiEnabled: false,
      connectedFinanceEnabled: false,
      collaborationEnabled: false,
      planningIntelligenceEnabled: false,
      advancedScenariosEnabled: false,
      advancedCashflowEnabled: false,
      advancedToolsEnabled: false,
      financialClosingEnabled: false,
    })
    expect(sidebarPlanHints('decisions', free)).toEqual(['STARTER'])
    expect(sidebarPlanHints('cashflow', free)).toEqual(['STARTER', 'TEAM'])
    expect(sidebarPlanHints('planning-budget', free)).toEqual(['STARTER'])
    expect(sidebarPlanHints('settings', free)).toEqual(['STARTER'])
    expect(sidebarPlanHints('insights', free)).toEqual([])
    expect(sidebarPlanHints('planning-financial-closings', free)).toEqual([])
  })

  it('hides included tiers and does not guess when the billing response is unavailable', () => {
    expect(sidebarPlanHints('cashflow', summary({ aiEnabled: true, advancedCashflowEnabled: false, advancedToolsEnabled: true }))).toEqual(['TEAM'])
    expect(sidebarPlanHints('cashflow', summary({ aiEnabled: true, advancedCashflowEnabled: true, advancedToolsEnabled: true }))).toEqual([])
    expect(sidebarPlanHints('cashflow', summary({ aiEnabled: false, advancedToolsEnabled: false }))).toEqual(['STARTER'])
    expect(sidebarPlanHints('cashflow', null)).toEqual([])
  })
})
