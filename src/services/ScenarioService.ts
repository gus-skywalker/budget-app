import axiosInterceptor from './axiosInterceptor'

const SCENARIOS_API_URL = `${import.meta.env.VITE_API_BASE_URL}/scenarios`

export const DEBT_PAYMENT_SCENARIO_TYPE = 'DEBT_PAYMENT_DECISION'
export type ScenarioSourceType = 'BUDGET_BASED' | 'MANUAL_TYPED'

export type ScenarioDeltaType =
  | 'MONTHLY_INCOME'
  | 'MONTHLY_EXPENSE'
  | 'ONE_TIME_INCOME'
  | 'ONE_TIME_EXPENSE'
  | 'INCOME_INCREASE'
  | 'EXPENSE_INCREASE'
  | 'INCOME_REDUCTION'
  | 'EXPENSE_REDUCTION'
  | 'PERCENT_INCOME_INCREASE'
  | 'PERCENT_EXPENSE_INCREASE'
  | 'PERCENT_INCOME_REDUCTION'
  | 'PERCENT_EXPENSE_REDUCTION'

export type ScenarioTemporalType = 'SINGLE' | 'FIXED_PERIOD' | 'ONGOING'

export interface ScenarioDeltaInput {
  label?: string
  type: ScenarioDeltaType
  temporalType?: ScenarioTemporalType
  amount: number
  percentage?: number
  startMonthOffset?: number
  endMonthOffset?: number
}

export interface ScenarioSimulationRequest {
  id?: string
  budgetId?: string
  name?: string
  scenarioType?: string
  sourceType?: ScenarioSourceType
  months?: number
  periodMonth?: number
  periodYear?: number
  deltas: ScenarioDeltaInput[]
  lineAdjustments?: ScenarioLineAdjustment[]
  debtInput?: DebtPaymentScenarioInput
}

export interface ScenarioForecastItem {
  month: string
  baselineProjectedBalance: number
  scenarioProjectedBalance: number
  deltaImpact: number
  status: string
}

export interface ScenarioProjectionItem {
  period: string
  baselineIncome: number
  baselineExpense: number
  baselineBalance: number
  scenarioIncome: number
  scenarioExpense: number
  scenarioBalance: number
  changeImpact: number
  sources: string[]
}

export interface ScenarioSimulationResponse {
  scenarioName: string
  scenarioType?: string
  sourceType?: ScenarioSourceType
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
  projection?: ScenarioProjectionItem[]
  impactedGoalNames: string[]
  debtComparison?: DebtPaymentComparison | null
}

export interface SavedScenario {
  id: string
  budgetId?: string
  name: string
  description?: string
  scenarioType?: string
  sourceType?: ScenarioSourceType
  months?: number | null
  decisionStatus?: string
  summary?: string
  projectedFinalBalance?: number | null
  scenarioMonthlyImpact?: number | null
  impactedGoalsCount?: number | null
  createdAt?: string
  deltas: ScenarioDeltaInput[]
  lines?: ScenarioLine[]
  forecast?: ScenarioForecastItem[]
  projection?: ScenarioProjectionItem[]
  impactedGoalNames?: string[]
  debtInput?: DebtPaymentScenarioInput | null
  debtComparison?: DebtPaymentComparison | null
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

export type DebtPaymentOptionType = 'INSTALLMENT' | 'SHORT_TERM_CREDIT' | 'MANUAL'
export type LiquidityCertainty = 'CERTAIN' | 'UNCERTAIN' | 'NONE'
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH'
export type PredictabilityLevel = 'LOW' | 'MEDIUM' | 'HIGH'

export interface DebtPaymentScenarioInput {
  title: string
  totalAmount: number
  availableCash: number
  options: DebtPaymentOptionInput[]
}

export interface DebtPaymentOptionInput {
  name: string
  type: DebtPaymentOptionType
  financedAmount?: number | null
  installments?: number | null
  monthlyInterestRate?: number | null
  iofAmount?: number | null
  totalInstallmentAmount?: number | null
  expectedPayoffDays?: number | null
  liquidityCertainty: LiquidityCertainty
  notes?: string | null
}

export interface DebtPaymentOptionResult {
  name: string
  type: DebtPaymentOptionType
  principalAmount: number
  totalPaid: number
  totalExtraCost: number
  totalInterest: number
  monthlyImpact: number
  effectivePeriodCostPercent: number
  riskLevel: RiskLevel
  predictabilityLevel: PredictabilityLevel
  explanation: string
  warning?: string | null
}

export interface DebtPaymentComparison {
  options: DebtPaymentOptionResult[]
  cheapestOption?: string | null
  safestOption?: string | null
  recommendedOption?: string | null
  recommendationReason?: string | null
  tradeOffSummary?: string | null
  warnings: string[]
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
