import type { Budget } from '@/services/BudgetService'
import type { SavedScenario, ScenarioDeltaInput, ScenarioDeltaType, ScenarioLine, ScenarioLineAdjustment, ScenarioSimulationRequest } from '@/services/ScenarioService'

export type AdjustmentFlow = 'INCOME' | 'EXPENSE'

export type SimpleScenarioAdjustment = {
  id: string
  label?: string
  flow: AdjustmentFlow
  monthlyChange: number
  oneTimeChange: number
}

export type EditableScenarioLine = ScenarioLineAdjustment & {
  originalAmount: number
}

export type ScenarioWizardSnapshot = {
  scenarioName: string
  months: number
  currentScenarioId: string | null
  budgetId?: string
  periodMonth?: number
  periodYear?: number
  adjustments: SimpleScenarioAdjustment[]
  scenarioLines: EditableScenarioLine[]
}

const STORAGE_KEY = 'planning-scenario-wizard-v2'

export const createAdjustment = (defaults?: Partial<SimpleScenarioAdjustment>): SimpleScenarioAdjustment => ({
  id: defaults?.id || crypto.randomUUID(),
  label: defaults?.label || '',
  flow: defaults?.flow || 'EXPENSE',
  monthlyChange: Number(defaults?.monthlyChange || 0),
  oneTimeChange: Number(defaults?.oneTimeChange || 0),
})

export const buildScenarioLinesFromBudget = (budget?: Budget | null): EditableScenarioLine[] => {
  if (!budget?.lines?.length) return []
  return budget.lines.map((line) => ({
    category: line.category,
    type: line.type,
    originalAmount: Number(line.plannedAmount || 0),
    adjustedAmount: Number(line.plannedAmount || 0),
  }))
}

export const buildScenarioLinesFromSavedScenario = (scenario?: SavedScenario | null): EditableScenarioLine[] => {
  if (!scenario?.lines?.length) return []
  return scenario.lines.map((line) => ({
    category: line.category,
    type: line.type,
    originalAmount: Number(line.originalAmount || 0),
    adjustedAmount: Number(line.adjustedAmount || 0),
  }))
}

const flowToType = (flow: AdjustmentFlow, periodicity: 'MONTHLY' | 'ONE_TIME'): ScenarioDeltaType => {
  if (periodicity === 'MONTHLY') {
    return flow === 'INCOME' ? 'MONTHLY_INCOME' : 'MONTHLY_EXPENSE'
  }
  return flow === 'INCOME' ? 'ONE_TIME_INCOME' : 'ONE_TIME_EXPENSE'
}

const typeToFlow = (type: ScenarioDeltaType): AdjustmentFlow =>
  type === 'MONTHLY_INCOME' || type === 'ONE_TIME_INCOME' ? 'INCOME' : 'EXPENSE'

export const buildManualDeltas = (adjustments: SimpleScenarioAdjustment[]): ScenarioDeltaInput[] =>
  adjustments.flatMap((adjustment, index) => {
    const labelBase = adjustment.label?.trim() || `Change ${index + 1}`
    const monthlyAmount = Number(adjustment.monthlyChange || 0)
    const oneTimeAmount = Number(adjustment.oneTimeChange || 0)
    const items: ScenarioDeltaInput[] = []

    if (monthlyAmount > 0) {
      items.push({
        label: `${labelBase} (monthly)`,
        type: flowToType(adjustment.flow, 'MONTHLY'),
        amount: monthlyAmount,
        startMonthOffset: 0,
      })
    }

    if (oneTimeAmount > 0) {
      items.push({
        label: `${labelBase} (one-time)`,
        type: flowToType(adjustment.flow, 'ONE_TIME'),
        amount: oneTimeAmount,
        startMonthOffset: 0,
      })
    }

    return items
  })

export const buildLineDerivedDeltas = (scenarioLines: EditableScenarioLine[]): ScenarioDeltaInput[] =>
  scenarioLines
    .map<ScenarioDeltaInput | null>((line) => {
      const delta = Number(line.adjustedAmount || 0) - Number(line.originalAmount || 0)
      if (!delta) return null

      if (line.type === 'INCOME') {
        return {
          label: `Baseline adjustment: ${line.category}`,
          type: (delta > 0 ? 'MONTHLY_INCOME' : 'MONTHLY_EXPENSE') as ScenarioDeltaType,
          amount: Math.abs(delta),
          startMonthOffset: 0,
        }
      }

      return {
        label: `Baseline adjustment: ${line.category}`,
        type: (delta > 0 ? 'MONTHLY_EXPENSE' : 'MONTHLY_INCOME') as ScenarioDeltaType,
        amount: Math.abs(delta),
        startMonthOffset: 0,
      }
    })
    .filter((item): item is ScenarioDeltaInput => item !== null)

export const buildScenarioPayload = (snapshot: ScenarioWizardSnapshot): ScenarioSimulationRequest => ({
  id: snapshot.currentScenarioId || undefined,
  budgetId: snapshot.budgetId,
  name: snapshot.scenarioName,
  months: snapshot.months,
  periodMonth: snapshot.periodMonth,
  periodYear: snapshot.periodYear,
  deltas: buildManualDeltas(snapshot.adjustments),
  lineAdjustments: snapshot.scenarioLines.map((line) => ({
    category: line.category,
    type: line.type,
    adjustedAmount: Number(line.adjustedAmount || 0),
  })),
})

export const buildSimulationPayload = (snapshot: ScenarioWizardSnapshot): ScenarioSimulationRequest => {
  const payload = buildScenarioPayload(snapshot)
  return {
    ...payload,
    deltas: [...payload.deltas, ...buildLineDerivedDeltas(snapshot.scenarioLines)],
  }
}

export const mapDeltasToSimpleAdjustments = (deltas: ScenarioDeltaInput[] = []): SimpleScenarioAdjustment[] => {
  if (!deltas.length) return [createAdjustment()]

  return deltas.map((delta, index) => {
    const flow = typeToFlow(delta.type)
    const isMonthly = delta.type === 'MONTHLY_INCOME' || delta.type === 'MONTHLY_EXPENSE'
    return createAdjustment({
      id: `${index + 1}`,
      label: delta.label || '',
      flow,
      monthlyChange: isMonthly ? Number(delta.amount || 0) : 0,
      oneTimeChange: isMonthly ? 0 : Number(delta.amount || 0),
    })
  })
}

export const snapshotFromSavedScenario = (
  savedScenario: SavedScenario,
  budget?: Budget | null,
): ScenarioWizardSnapshot => ({
  scenarioName: savedScenario.name || 'Scenario',
  months: Number(savedScenario.months || 6),
  currentScenarioId: savedScenario.id,
  budgetId: savedScenario.budgetId || budget?.id,
  periodMonth: budget?.periodMonth,
  periodYear: budget?.periodYear,
  adjustments: mapDeltasToSimpleAdjustments(savedScenario.deltas || []),
  scenarioLines: buildScenarioLinesFromSavedScenario(savedScenario).length
    ? buildScenarioLinesFromSavedScenario(savedScenario)
    : buildScenarioLinesFromBudget(budget),
})

export const saveWizardSnapshot = (snapshot: ScenarioWizardSnapshot) => {
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
}

export const loadWizardSnapshot = (): ScenarioWizardSnapshot | null => {
  const raw = window.sessionStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as ScenarioWizardSnapshot
    return {
      ...parsed,
      adjustments: Array.isArray(parsed.adjustments) && parsed.adjustments.length
        ? parsed.adjustments.map((item) => createAdjustment(item))
        : [createAdjustment()],
      scenarioLines: Array.isArray(parsed.scenarioLines) ? parsed.scenarioLines : [],
      months: Number(parsed.months || 6),
      currentScenarioId: parsed.currentScenarioId || null,
    }
  } catch {
    return null
  }
}

export const clearWizardSnapshot = () => {
  window.sessionStorage.removeItem(STORAGE_KEY)
}

export const monthlyImpactEstimate = (snapshot: ScenarioWizardSnapshot): number =>
  buildManualDeltas(snapshot.adjustments).reduce((total, delta) => {
    if (delta.type === 'MONTHLY_INCOME') return total + Number(delta.amount || 0)
    if (delta.type === 'MONTHLY_EXPENSE') return total - Number(delta.amount || 0)
    return total
  }, 0)

export const hasAnyScenarioChange = (snapshot: ScenarioWizardSnapshot): boolean =>
  buildManualDeltas(snapshot.adjustments).length > 0 || buildLineDerivedDeltas(snapshot.scenarioLines).length > 0

export const templateDeltas = {
  reduce_costs: [
    { label: 'Cut subscriptions', type: 'MONTHLY_INCOME', amount: 400, startMonthOffset: 0 },
    { label: 'Renegotiate contracts', type: 'MONTHLY_INCOME', amount: 900, startMonthOffset: 0 },
  ] satisfies ScenarioDeltaInput[],
  increase_revenue: [
    { label: 'Marketing campaign', type: 'MONTHLY_EXPENSE', amount: 1500, startMonthOffset: 0 },
    { label: 'Growth tools', type: 'MONTHLY_EXPENSE', amount: 350, startMonthOffset: 0 },
  ] satisfies ScenarioDeltaInput[],
  hiring: [
    { label: 'New hire salary', type: 'MONTHLY_EXPENSE', amount: 6000, startMonthOffset: 0 },
    { label: 'Onboarding setup', type: 'ONE_TIME_EXPENSE', amount: 2500, startMonthOffset: 0 },
  ] satisfies ScenarioDeltaInput[],
  investment: [
    { label: 'Initial investment', type: 'ONE_TIME_EXPENSE', amount: 8000, startMonthOffset: 0 },
    { label: 'Expected return', type: 'MONTHLY_INCOME', amount: 1800, startMonthOffset: 0 },
  ] satisfies ScenarioDeltaInput[],
}
