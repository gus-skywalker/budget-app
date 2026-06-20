import type { Budget } from '@/services/BudgetService'
import type {
  SavedScenario,
  ScenarioDeltaInput,
  ScenarioDeltaType,
  ScenarioLine,
  ScenarioLineAdjustment,
  ScenarioSimulationRequest,
  ScenarioTemporalType,
} from '@/services/ScenarioService'
import i18n from '@/i18n'

export type AdjustmentFlow = 'INCOME' | 'EXPENSE'
export type AdjustmentValueMode = 'AMOUNT' | 'PERCENTAGE'

export type SimpleScenarioAdjustment = {
  id: string
  label?: string
  flow: AdjustmentFlow
  originalDeltaType?: ScenarioDeltaType
  valueMode: AdjustmentValueMode
  temporalType: ScenarioTemporalType
  amount: number
  percentage: number
  startMonthOffset: number
  endMonthOffset: number | null
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

const STORAGE_KEY = 'planning-scenario-wizard-v3'

const numberOrZero = (value: unknown): number => {
  const numeric = Number(value || 0)
  return Number.isFinite(numeric) ? numeric : 0
}

export const createAdjustment = (defaults?: Partial<SimpleScenarioAdjustment>): SimpleScenarioAdjustment => ({
  id: defaults?.id || crypto.randomUUID(),
  label: defaults?.label || '',
  flow: defaults?.flow || 'EXPENSE',
  originalDeltaType: defaults?.originalDeltaType,
  valueMode: defaults?.valueMode || 'AMOUNT',
  temporalType:
    defaults?.temporalType ||
    (numberOrZero(defaults?.oneTimeChange) > 0 && numberOrZero(defaults?.monthlyChange) === 0
      ? 'SINGLE'
      : 'ONGOING'),
  amount:
    defaults?.amount != null
      ? numberOrZero(defaults.amount)
      : numberOrZero(defaults?.oneTimeChange) > 0 && numberOrZero(defaults?.monthlyChange) === 0
        ? numberOrZero(defaults?.oneTimeChange)
        : numberOrZero(defaults?.monthlyChange),
  percentage: numberOrZero(defaults?.percentage),
  startMonthOffset: Math.max(0, Math.trunc(numberOrZero(defaults?.startMonthOffset))),
  endMonthOffset:
    defaults?.endMonthOffset == null
      ? null
      : Math.max(0, Math.trunc(numberOrZero(defaults.endMonthOffset))),
  monthlyChange: numberOrZero(defaults?.monthlyChange),
  oneTimeChange: numberOrZero(defaults?.oneTimeChange),
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
  type === 'MONTHLY_INCOME' ||
  type === 'ONE_TIME_INCOME' ||
  type === 'INCOME_INCREASE' ||
  type === 'PERCENT_INCOME_INCREASE' ||
  type === 'EXPENSE_REDUCTION' ||
  type === 'PERCENT_EXPENSE_REDUCTION'
    ? 'INCOME'
    : 'EXPENSE'

const isPercentageDeltaType = (type: ScenarioDeltaType) => type.startsWith('PERCENT_')

const percentageTypeForFlow = (flow: AdjustmentFlow): ScenarioDeltaType =>
  flow === 'INCOME' ? 'PERCENT_INCOME_INCREASE' : 'PERCENT_EXPENSE_INCREASE'

const typeForAdjustment = (
  adjustment: SimpleScenarioAdjustment,
  temporalType: ScenarioTemporalType,
): ScenarioDeltaType => {
  if (adjustment.originalDeltaType?.includes('REDUCTION')) {
    return adjustment.originalDeltaType
  }
  if (adjustment.valueMode === 'PERCENTAGE') {
    return percentageTypeForFlow(adjustment.flow)
  }
  return flowToType(adjustment.flow, temporalType === 'SINGLE' ? 'ONE_TIME' : 'MONTHLY')
}

const inferTemporalType = (delta: ScenarioDeltaInput): ScenarioTemporalType => {
  if (delta.temporalType) return delta.temporalType
  if (delta.type === 'ONE_TIME_INCOME' || delta.type === 'ONE_TIME_EXPENSE') return 'SINGLE'
  if (delta.endMonthOffset != null) return 'FIXED_PERIOD'
  return 'ONGOING'
}

const amountForAdjustment = (adjustment: SimpleScenarioAdjustment): number => {
  if (adjustment.valueMode === 'PERCENTAGE') {
    return numberOrZero(adjustment.percentage || adjustment.amount)
  }
  if (adjustment.amount > 0) return numberOrZero(adjustment.amount)
  return adjustment.temporalType === 'SINGLE'
    ? numberOrZero(adjustment.oneTimeChange)
    : numberOrZero(adjustment.monthlyChange)
}

export const buildManualDeltas = (adjustments: SimpleScenarioAdjustment[]): ScenarioDeltaInput[] =>
  adjustments
    .map<ScenarioDeltaInput | null>((adjustment, index) => {
      const labelBase = adjustment.label?.trim() || `Change ${index + 1}`
      const value = amountForAdjustment(adjustment)
      if (value <= 0) return null

      const temporalType = adjustment.temporalType || 'ONGOING'
      const isPercentage = adjustment.valueMode === 'PERCENTAGE'
      const type = typeForAdjustment(adjustment, temporalType)
      const startMonthOffset = Math.max(0, Math.trunc(numberOrZero(adjustment.startMonthOffset)))
      const endMonthOffset =
        temporalType === 'FIXED_PERIOD'
          ? Math.max(startMonthOffset, Math.trunc(numberOrZero(adjustment.endMonthOffset ?? startMonthOffset)))
          : undefined

      return {
        label: labelBase,
        type,
        temporalType,
        amount: value,
        percentage: isPercentage ? value : undefined,
        startMonthOffset,
        endMonthOffset,
      }
    })
    .filter((item): item is ScenarioDeltaInput => item !== null)

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
  sourceType: 'BUDGET_BASED',
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

  const meaningfulDeltas = deltas.filter((delta) => !String(delta.label || '').startsWith('Baseline adjustment:'))
  if (!meaningfulDeltas.length) return [createAdjustment()]

  return meaningfulDeltas.map((delta, index) => {
    const flow = typeToFlow(delta.type)
    const temporalType = inferTemporalType(delta)
    const valueMode = isPercentageDeltaType(delta.type) ? 'PERCENTAGE' : 'AMOUNT'
    const value = numberOrZero(valueMode === 'PERCENTAGE' ? delta.percentage ?? delta.amount : delta.amount)
    const label = String(delta.label || '').trim()
    const baseLabel = label.replace(/\s*\((monthly|one-time)\)\s*$/i, '').trim()

    return createAdjustment({
      id: `${index + 1}`,
      label: baseLabel,
      flow,
      originalDeltaType: delta.type,
      valueMode,
      temporalType,
      amount: value,
      percentage: valueMode === 'PERCENTAGE' ? value : 0,
      startMonthOffset: numberOrZero(delta.startMonthOffset),
      endMonthOffset: delta.endMonthOffset == null ? null : numberOrZero(delta.endMonthOffset),
      monthlyChange: temporalType === 'SINGLE' ? 0 : value,
      oneTimeChange: temporalType === 'SINGLE' ? value : 0,
    })
  })
}

export const snapshotFromSavedScenario = (
  savedScenario: SavedScenario,
  budget?: Budget | null,
): ScenarioWizardSnapshot => ({
  scenarioName:
    savedScenario.name || (String(i18n.global.locale.value).startsWith('en') ? 'New scenario' : 'Novo cenário'),
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
  const raw = window.sessionStorage.getItem(STORAGE_KEY) || window.sessionStorage.getItem('planning-scenario-wizard-v2')
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
  window.sessionStorage.removeItem('planning-scenario-wizard-v2')
}

export const monthlyImpactEstimate = (snapshot: ScenarioWizardSnapshot): number =>
  buildManualDeltas(snapshot.adjustments).reduce((total, delta) => {
    if (delta.type.startsWith('PERCENT_')) return total
    if (delta.temporalType === 'SINGLE') return total
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
