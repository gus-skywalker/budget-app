import { describe, expect, it } from 'vitest'
import {
  buildScenarioPayload,
  createAdjustment,
  snapshotFromSavedScenario,
  type ScenarioWizardSnapshot,
} from '@/utils/scenarioWizard'
import type { SavedScenario } from '@/services/ScenarioService'

describe('scenarioWizard deterministic payloads', () => {
  it('serializes fixed-period percentage changes for the backend scenario projection engine', () => {
    const snapshot: ScenarioWizardSnapshot = {
      scenarioName: 'Campaign ramp',
      months: 6,
      currentScenarioId: null,
      budgetId: 'budget-1',
      adjustments: [
        createAdjustment({
          id: 'change-1',
          label: 'Paid media ramp',
          flow: 'EXPENSE',
          valueMode: 'PERCENTAGE',
          temporalType: 'FIXED_PERIOD',
          amount: 12,
          percentage: 12,
          startMonthOffset: 1,
          endMonthOffset: 3,
        }),
      ],
      scenarioLines: [],
    }

    expect(buildScenarioPayload(snapshot).deltas).toEqual([
      {
        label: 'Paid media ramp',
        type: 'PERCENT_EXPENSE_INCREASE',
        temporalType: 'FIXED_PERIOD',
        amount: 12,
        percentage: 12,
        startMonthOffset: 1,
        endMonthOffset: 3,
      },
    ])
  })

  it('hydrates saved percentage and fixed-period fields without flattening them to legacy monthly deltas', () => {
    const saved: SavedScenario = {
      id: 'scenario-1',
      budgetId: 'budget-1',
      name: 'Seasonal hiring',
      months: 6,
      deltas: [
        {
          label: 'Contractor lift',
          type: 'PERCENT_INCOME_INCREASE',
          temporalType: 'FIXED_PERIOD',
          amount: 8,
          percentage: 8,
          startMonthOffset: 2,
          endMonthOffset: 5,
        },
      ],
    }

    const snapshot = snapshotFromSavedScenario(saved)
    expect(snapshot.adjustments[0]).toMatchObject({
      label: 'Contractor lift',
      flow: 'INCOME',
      valueMode: 'PERCENTAGE',
      temporalType: 'FIXED_PERIOD',
      amount: 8,
      percentage: 8,
      startMonthOffset: 2,
      endMonthOffset: 5,
    })
    expect(buildScenarioPayload(snapshot).deltas[0]).toMatchObject({
      type: 'PERCENT_INCOME_INCREASE',
      temporalType: 'FIXED_PERIOD',
      percentage: 8,
      endMonthOffset: 5,
    })
  })
})
