import axiosInterceptor from './axiosInterceptor'

export type BudgetStatus = 'DRAFT' | 'ACTIVE'
export type BudgetLineType = 'INCOME' | 'EXPENSE'

export interface BudgetLine {
  id: string
  category: string
  type: BudgetLineType
  plannedAmount: number
}

export interface Budget {
  id: string
  workspaceId: string
  periodMonth: number
  periodYear: number
  status: BudgetStatus
  totalIncome: number
  totalExpense: number
  net: number
  lines: BudgetLine[]
}

export interface BudgetCreateRequest {
  workspaceId?: string
  periodMonth: number
  periodYear: number
  status?: BudgetStatus
}

export interface BudgetLineRequest {
  category: string
  type: BudgetLineType
  plannedAmount: number
}

export type BudgetSuggestionConfidence = 'HIGH' | 'MEDIUM' | 'LOW'

export interface BudgetSuggestionLine {
  category: string
  type: BudgetLineType
  suggestedAmount: number
  confidence: BudgetSuggestionConfidence
}

export interface BudgetSuggestion {
  workspaceId: string
  month: number
  year: number
  suggestedIncome: number
  suggestedExpense: number
  net: number
  lookbackMonths?: number
  lines: BudgetSuggestionLine[]
}

export interface BudgetFromSuggestionRequest {
  workspaceId?: string
  month: number
  year: number
  lines: BudgetSuggestionLine[]
}

export type BudgetComparisonStatus = 'OVER' | 'UNDER' | 'OK'

export interface BudgetComparisonLine {
  category: string
  type: BudgetLineType
  planned: number
  actual: number
  delta: number
  status: BudgetComparisonStatus
}

export interface BudgetComparisonSummary {
  plannedIncome: number
  actualIncome: number
  plannedExpense: number
  actualExpense: number
  plannedNet: number
  actualNet: number
  netDelta: number
}

export interface BudgetComparison {
  workspaceId: string
  month: number
  year: number
  summary: BudgetComparisonSummary
  lines: BudgetComparisonLine[]
}

export type FinancialInsightType = 'WARNING' | 'INFO' | 'POSITIVE'

export interface FinancialInsight {
  type: FinancialInsightType
  message: string
}

export interface FinancialInsightsResponse {
  insights: FinancialInsight[]
}

export default {
  async getCurrent(month?: number, year?: number) {
    return axiosInterceptor.get<Budget>('/budgets/current', { params: { month, year } })
  },
  getSuggestions(month?: number, year?: number) {
    return axiosInterceptor.get<BudgetSuggestion>('/budgets/suggestions', { params: { month, year } })
  },
  getComparison(month?: number, year?: number) {
    return axiosInterceptor.get<BudgetComparison>('/budgets/comparison', { params: { month, year } })
  },
  getInsights(month?: number, year?: number) {
    return axiosInterceptor.get<FinancialInsightsResponse>('/insights', { params: { month, year } })
  },
  createFromSuggestion(payload: BudgetFromSuggestionRequest) {
    return axiosInterceptor.post<Budget>('/budgets/from-suggestion', payload)
  },
  create(payload: BudgetCreateRequest) {
    return axiosInterceptor.post<Budget>('/budgets', payload)
  },
  addLine(budgetId: string, payload: BudgetLineRequest) {
    return axiosInterceptor.post<Budget>(`/budgets/${budgetId}/lines`, payload)
  },
  updateLine(budgetId: string, lineId: string, payload: BudgetLineRequest) {
    return axiosInterceptor.put<Budget>(`/budgets/${budgetId}/lines/${lineId}`, payload)
  },
  deleteLine(budgetId: string, lineId: string) {
    return axiosInterceptor.delete(`/budgets/${budgetId}/lines/${lineId}`)
  },
  activate(budgetId: string) {
    return axiosInterceptor.post<Budget>(`/budgets/${budgetId}/activate`)
  },
}
