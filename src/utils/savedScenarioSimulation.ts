import type { SavedScenario, ScenarioDeltaType, ScenarioSimulationRequest } from '@/services/ScenarioService'

export const buildSavedScenarioSimulationRequest = (
  scenario: SavedScenario,
  lineAdjustmentLabel: (category: string) => string,
): ScenarioSimulationRequest => ({
  id: scenario.id,
  budgetId: scenario.budgetId,
  name: scenario.name,
  scenarioType: scenario.scenarioType,
  sourceType: scenario.sourceType,
  months: scenario.months || 6,
  debtInput: scenario.debtInput || undefined,
  deltas: [
    ...(scenario.deltas || []).map((delta) => ({
      label: delta.label,
      type: delta.type,
      temporalType: delta.temporalType,
      amount: Number(delta.amount || 0),
      percentage: delta.percentage,
      startMonthOffset: Number(delta.startMonthOffset || 0),
      endMonthOffset: delta.endMonthOffset,
    })),
    ...((scenario.lines || [])
      .map((line) => {
        const delta = Number(line.adjustedAmount || 0) - Number(line.originalAmount || 0)
        if (!delta) return null
        if (line.type === 'INCOME') {
          return {
            label: lineAdjustmentLabel(line.category),
            type: (delta > 0 ? 'MONTHLY_INCOME' : 'MONTHLY_EXPENSE') as ScenarioDeltaType,
            amount: Math.abs(delta),
            startMonthOffset: 0,
          }
        }
        return {
          label: lineAdjustmentLabel(line.category),
          type: (delta > 0 ? 'MONTHLY_EXPENSE' : 'MONTHLY_INCOME') as ScenarioDeltaType,
          amount: Math.abs(delta),
          startMonthOffset: 0,
        }
      })
      .filter((item): item is { label: string; type: ScenarioDeltaType; amount: number; startMonthOffset: number } => Boolean(item))),
  ],
})
