import type { SavedScenario, ScenarioSimulationResponse } from '@/services/ScenarioService'

// Local presentation evidence, not a new API contract. Missing values stay missing.
export type ResultEvidence = { [K in keyof ScenarioSimulationResponse]?: ScenarioSimulationResponse[K] | null }
export type ResultOrigin = 'live' | 'saved' | 'legacy'
const number = (value: unknown): number | null => typeof value === 'number' && Number.isFinite(value) ? value : null
const text = (value: unknown): string | null => typeof value === 'string' && value.trim() ? value : null
const strings = (value: unknown): string[] => Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string' && !!item.trim()) : []

export function savedResultEvidence(saved: SavedScenario): ResultEvidence {
  return {
    scenarioName: saved.name, scenarioType: saved.scenarioType, sourceType: saved.sourceType,
    months: saved.months, scenarioMonthlyImpact: saved.scenarioMonthlyImpact,
    projectedFinalBalance: saved.projectedFinalBalance,
    decisionStatus: ['ACTION_NEEDED', 'WATCH', 'STABLE', 'NO_DATA'].includes(saved.decisionStatus || '')
      ? saved.decisionStatus as ScenarioSimulationResponse['decisionStatus'] : undefined,
    impactedGoalsCount: saved.impactedGoalsCount, impactedGoalNames: saved.impactedGoalNames,
    forecast: saved.forecast, projection: saved.projection, debtComparison: saved.debtComparison,
  }
}

export function presentDecisionResult(input: ResultEvidence, origin: ResultOrigin, recalculated = false, isDebt = false) {
  const field = (value: unknown) => ({ value: number(value), source: number(value) === null ? null : origin })
  const projection = Array.isArray(input.projection) ? input.projection : []
  const forecast = Array.isArray(input.forecast) ? input.forecast : []
  const rows = projection.length ? projection.filter(Boolean).map(row => ({
    period: text(row.period), baselineBalance: number(row.baselineBalance), scenarioBalance: number(row.scenarioBalance),
    baselineIncome: number(row.baselineIncome), baselineExpense: number(row.baselineExpense),
    scenarioIncome: number(row.scenarioIncome), scenarioExpense: number(row.scenarioExpense),
    changeImpact: number(row.changeImpact), sources: strings(row.sources), legacy: false,
  })) : forecast.filter(Boolean).map(row => ({
    period: text(row.month), baselineBalance: number(row.baselineProjectedBalance), scenarioBalance: number(row.scenarioProjectedBalance),
    baselineIncome: null, baselineExpense: null, scenarioIncome: null, scenarioExpense: null,
    changeImpact: number(row.deltaImpact), sources: [] as string[], legacy: true,
  }))
  const status = ['ACTION_NEEDED', 'WATCH', 'STABLE', 'NO_DATA'].includes(input.decisionStatus || '') ? input.decisionStatus! : 'NO_DATA'
  return {
    origin, recalculated, isDebt: isDebt || input.sourceType === 'MANUAL_TYPED',
    name: text(input.scenarioName),
    months: number(input.months) !== null && input.months! > 0 ? input.months! : null,
    impact: field(input.scenarioMonthlyImpact), finalBalance: field(input.projectedFinalBalance),
    initialBalance: field(input.currentBalance), baseline: field(input.baselineMonthlyNet),
    availableForGoals: field(input.availableForGoals), goalsCount: field(input.impactedGoalsCount),
    goalNames: strings(input.impactedGoalNames),
    status, tone: status === 'ACTION_NEEDED' ? 'negative' : status === 'WATCH' ? 'warning' : status === 'STABLE' ? 'neutral' : 'unknown',
    riskMonth: text(input.firstRiskMonth),
    riskKnown: status !== 'NO_DATA' && Object.prototype.hasOwnProperty.call(input, 'firstRiskMonth') && (input.firstRiskMonth === null || text(input.firstRiskMonth) !== null),
    rows, debtSummary: text(input.debtComparison?.tradeOffSummary) || text(input.debtComparison?.recommendationReason),
  }
}
export type DecisionResultPresentation = ReturnType<typeof presentDecisionResult>
type Translate = (key: string, params?: Record<string, string | number>) => string

// Screen and speech use the same evidence and wording; no regional variant may invent facts.
export function decisionResultNarrative(model: DecisionResultPresentation, translate: Translate, money: (value: number) => string) {
  const resultText = (key: string, params?: Record<string, string | number>) => translate(`decisionJourney.result.${key}`, params)
  const impact = model.impact.value
  const headline = model.isDebt ? resultText('debtTitle') : model.status === 'NO_DATA' ? resultText('noData')
    : impact === null ? resultText('impactUnknown') : impact === 0 ? resultText('unchanged')
      : resultText(impact < 0 ? 'less' : 'more', { amount: money(Math.abs(impact)) })
  const origin = resultText(model.recalculated ? 'recalculated' : model.origin)
  const horizon = model.months === null ? resultText('horizonUnknown') : resultText('horizon', { count: model.months })
  const impactHelp = model.isDebt ? resultText('debtHelp') : resultText('averageHelp')
  const status = resultText(`status${model.status}`)
  const risk = !model.riskKnown ? resultText('riskUnknown') : model.riskMonth ? resultText('riskMonth', { month: model.riskMonth }) : resultText('riskNotFlagged')
  const final = model.status === 'NO_DATA' ? resultText('finalNoData') : model.finalBalance.value === null ? resultText('finalUnknown') : resultText(model.finalBalance.value < 0 ? 'finalNegative' : 'finalValue', { amount: money(Math.abs(model.finalBalance.value)) })
  const caution = resultText('estimate')
  const summary = model.isDebt ? model.debtSummary || resultText('debtUnknown')
    : model.status === 'NO_DATA' || impact === null ? resultText('noDataHelp') : impactHelp
  const speech = [origin, headline, summary, ...(model.isDebt ? [impactHelp] : [horizon, status, risk, final]), caution].join(' ')
  return { headline, origin, horizon, impactHelp, status, risk, final, caution, summary, speech }
}
