import axiosInterceptor from './axiosInterceptor'

const AI_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

export type AiTransactionType = 'INCOME' | 'EXPENSE'

export interface AiTransaction {
  transactionId?: string
  userId?: string
  type: AiTransactionType
  date: string
  amount: number
  currency: string
  categoryId?: number
  categoryCode?: string
  description?: string
  paymentMethodId?: number
}

export interface MonthlyExpensesPredictionRequest {
  categoryId?: number
  forecastMonths?: number
  historicalTransactions: AiTransaction[]
}

export interface MonthlyExpensePredictionItem {
  month: string
  categoryId?: number
  predictedAmount: number
  confidence: number
  historicalAverage?: number
  trend?: string
  minExpected?: number
  maxExpected?: number
}

export interface MonthlyExpensesPredictionResponse {
  predictions: MonthlyExpensePredictionItem[]
  totalPredicted: number
  modelAccuracy?: number
}

export interface AnomalyDetectionRequest {
  transactions: AiTransaction[]
  sensitivity?: number
}

export interface AnomalyExpense {
  id?: string
  date?: string
  amount: number
  description?: string
  categoryId?: number
  categoryCode?: string
  categoryName?: string
}

export interface AnomalyExpectedRange {
  min: number
  max: number
  average: number
}

export type AnomalySeverity = 'medium' | 'high'

export interface AnomalyDetectionItem {
  expense: AnomalyExpense
  expectedRange: AnomalyExpectedRange
  deviation: number
  severity: AnomalySeverity
  suggestion?: string
}

export interface AnomalyDetectionSummary {
  totalTransactionsAnalyzed: number
  anomaliesCount: number
  totalAnomalousAmount: number
  highestAnomalyScore: number
  summaryText?: string
}

export interface AnomalyDetectionResponse {
  anomalies: AnomalyDetectionItem[]
  summary: AnomalyDetectionSummary
}

export interface AutoCategorizeExpenseInput {
  expenseId?: string
  description?: string
  amount: number
  paymentMethodId?: number
}

export interface CategorySuggestion {
  id: number
  code: string
  name: string
  confidence: number
}

export interface AutoCategorizeSuggestion {
  expenseId?: string
  suggestedCategory: CategorySuggestion
  alternativeCategories: CategorySuggestion[]
  reasoning?: string
}

export interface AutoCategorizeRequest {
  expenses: AutoCategorizeExpenseInput[]
}

export interface AutoCategorizeResponse {
  suggestions: AutoCategorizeSuggestion[]
}

export interface SavingsRecommendationRequest {
  savingsGoalAmount?: number
  targetDate?: string
}

export interface SavingsAction {
  id: string
  description: string
  estimatedMonthlyImpact: number
  categoryId?: number
  difficultyLevel: string
  confidence: number
}

export interface SavingsPlan {
  recommendedMonthlySavings: number
  projectedBalanceByTargetDate: number
  probabilityOfSuccess: number
  actions: SavingsAction[]
}

export interface SavingsRecommendationResponse {
  plan: SavingsPlan
  summaryText?: string
}

export interface CashflowInsightsRequest {
  months?: number
}

export type CashflowStatus = 'surplus' | 'deficit'

export interface CashflowAlert {
  severity: string
  message: string
  suggestions: string[]
}

export interface CashflowForecastItem {
  month: string
  predictedIncome: number
  predictedExpenses: number
  projectedBalance: number
  status: CashflowStatus
  alert?: CashflowAlert
}

export interface CashflowInsightsResponse {
  currentBalance: number
  forecast: CashflowForecastItem[]
  averageMonthlyBalance: number
  insights: string[]
}

const AiService = {
  predictMonthlyExpenses(payload: MonthlyExpensesPredictionRequest) {
    return axiosInterceptor.post<MonthlyExpensesPredictionResponse>(
    '/ai/predictions/monthly-expenses',
    //   '/ai/monthly-expenses-prediction',
      payload,
      { baseURL: AI_BASE_URL }
    )
  },
  detectAnomalies(payload: AnomalyDetectionRequest) {
    return axiosInterceptor.post<AnomalyDetectionResponse>(
    '/ai/anomalies',
    //   '/ai/anomaly-detection',
      payload,
      { baseURL: AI_BASE_URL }
    )
  },
  autoCategorize(payload: AutoCategorizeRequest) {
    return axiosInterceptor.post<AutoCategorizeResponse>(
    '/ai/categorize',
    //   '/ai/auto-categorize',
      payload,
      { baseURL: AI_BASE_URL }
    )
  },
  getSavingsRecommendations(payload: SavingsRecommendationRequest) {
    return axiosInterceptor.post<SavingsRecommendationResponse>(
      '/ai/savings-recommendations',
      payload,
      { baseURL: AI_BASE_URL }
    )
  },
  getCashflowInsights(payload: CashflowInsightsRequest) {
    return axiosInterceptor.post<CashflowInsightsResponse>(
      '/ai/cashflow-insights',
      payload,
      { baseURL: AI_BASE_URL }
    )
  }
}

export default AiService
