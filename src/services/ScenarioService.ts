import axiosInterceptor from './axiosInterceptor'

const SCENARIOS_API_URL = `${import.meta.env.VITE_API_BASE_URL}/scenarios`

export type ScenarioDeltaType =
  | 'MONTHLY_INCOME'
  | 'MONTHLY_EXPENSE'
  | 'ONE_TIME_INCOME'
  | 'ONE_TIME_EXPENSE'

export interface ScenarioDeltaInput {
  label?: string
  type: ScenarioDeltaType
  amount: number
  startMonthOffset?: number
}

export interface ScenarioSimulationRequest {
  id?: string
  budgetId?: string
  name?: string
  months?: number
  periodMonth?: number
  periodYear?: number
  deltas: ScenarioDeltaInput[]
  lineAdjustments?: ScenarioLineAdjustment[]
}

export interface ScenarioForecastItem {
  month: string
  baselineProjectedBalance: number
  scenarioProjectedBalance: number
  deltaImpact: number
  status: string
}

export interface ScenarioSimulationResponse {
  scenarioName: string
  months: number
  currentBalance: number
  baselineMonthlyNet: number
  scenarioMonthlyImpact: number
  projectedFinalBalance: number
  decisionStatus: 'ACTION_NEEDED' | 'WATCH' | 'STABLE' | 'NO_DATA'
  firstRiskMonth?: string | null
  availableForGoals: number
  impactedGoalsCount: number
  summary?: string
  forecast: ScenarioForecastItem[]
  impactedGoalNames: string[]
}

export interface SavedScenario {
  id: string
  budgetId?: string
  name: string
  description?: string
  months?: number | null
  decisionStatus?: string
  summary?: string
  projectedFinalBalance?: number | null
  scenarioMonthlyImpact?: number | null
  impactedGoalsCount?: number | null
  createdAt?: string
  deltas: ScenarioDeltaInput[]
  lines?: ScenarioLine[]
}

export interface ScenarioLine {
  id: string
  category: string
  type: 'INCOME' | 'EXPENSE'
  originalAmount: number
  adjustedAmount: number
  delta: number
}

export interface ScenarioLineAdjustment {
  category: string
  type: 'INCOME' | 'EXPENSE'
  adjustedAmount: number
}

export default {
  simulate(payload: ScenarioSimulationRequest) {
    return axiosInterceptor.post<ScenarioSimulationResponse>(`${SCENARIOS_API_URL}/simulate`, payload)
  },
  save(payload: ScenarioSimulationRequest) {
    return axiosInterceptor.post<SavedScenario>(`${SCENARIOS_API_URL}/save`, payload)
  },
  remove(id: string) {
    return axiosInterceptor.delete(`${SCENARIOS_API_URL}/${id}`)
  },
  list() {
    return axiosInterceptor.get<SavedScenario[]>(`${SCENARIOS_API_URL}`)
  },
}
