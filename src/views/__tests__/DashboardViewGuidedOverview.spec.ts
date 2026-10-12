import { afterEach, describe, expect, it, vi } from 'vitest'
import DashboardView from '@/views/DashboardView.vue'
import BudgetService from '@/services/BudgetService'
import DataService from '@/services/DataService'
import FinancialReadService from '@/services/FinancialReadService'
import pt from '@/assets/locales/pt.json'
import en from '@/assets/locales/en.json'
import es from '@/assets/locales/es.json'
import fr from '@/assets/locales/fr.json'

const computed = (DashboardView as any).computed
const methods = (DashboardView as any).methods

afterEach(() => vi.restoreAllMocks())

describe('Dashboard guided overview', () => {
  it('separates an empty month from recorded activity', () => {
    const empty = { monthTransactions: [], dashboardSummary: { monthlyIncome: 0, monthlyExpenses: 0 }, hasComparisonActivity: false }
    expect(computed.hasMonthlyActivity.call(empty)).toBe(false)
    expect(computed.hasMonthlyActivity.call({ ...empty, monthTransactions: [{ id: 'one' }] })).toBe(true)
    expect(computed.hasMonthlyActivity.call({ ...empty, dashboardSummary: { monthlyIncome: 100, monthlyExpenses: 0 } })).toBe(true)
  })

  it('does not present a planned value as recorded income', () => {
    const context = { isOverviewPending: false, overviewUnavailable: false, hasMonthlyActivity: false, budgetComparison: { summary: { plannedNet: 1000 } }, netMonthlyCashflow: 0 }
    expect(computed.heroAmount.call(context)).toBe(1000)
    expect(computed.heroAmountLabelKey.call(context)).toBe('overview.guided_planned_net_label')
    expect(computed.heroAmount.call({ ...context, hasMonthlyActivity: true, netMonthlyCashflow: 200 })).toBe(200)
    expect(computed.heroAmountLabelKey.call({ ...context, hasMonthlyActivity: true })).toBe('overview.guided_actual_net_label')
    expect(computed.heroAmount.call({ ...context, overviewUnavailable: true })).toBeNull()
  })

  it('only exposes the planned-versus-actual difference after recorded activity', () => {
    const base = { budgetComparison: { summary: { plannedNet: 1000, actualNet: 0, actualIncome: 0, actualExpense: 0, netDelta: -1000 } } }
    expect(computed.hasComparisonActivity.call(base)).toBe(false)
    expect(computed.hasComparisonActivity.call({ budgetComparison: { summary: { ...base.budgetComparison.summary, actualIncome: 100 } } })).toBe(true)
  })

  it('uses distinct titles for no plan, no activity, and attention', () => {
    const base = { dashboardLoadFailed: false, isOverviewPending: false, openFinanceConflictCount: 0, cashflowDecisionData: null, goalsAtRisk: [], hasMonthlyActivity: false, budgetComparisonState: 'ready' }
    expect(computed.heroTitleKey.call(base)).toBe('overview.guided_no_activity_title')
    expect(computed.heroTitleKey.call({ ...base, budgetComparisonState: 'no-budget' })).toBe('overview.guided_no_plan_title')
    expect(computed.heroTitleKey.call({ ...base, goalsAtRisk: [{ id: 'goal' }] })).toBe('overview.guided_attention_hero_title')
    expect(computed.heroTitleKey.call({ ...base, budgetComparisonState: 'error' })).toBe('overview.guided_plan_error_title')
    expect(computed.heroTitleKey.call({ ...base, isOverviewPending: true })).toBe('overview.guided_loading_title')
  })

  it('does not infer an active plan while comparison is pending or unavailable', () => {
    const base = { dashboardLoadFailed: false, dashboardLoading: false, hasMonthlyActivity: false, budgetComparisonLoading: false, budgetComparisonState: 'idle' }
    expect(computed.isOverviewPending.call(base)).toBe(true)
    expect(computed.isOverviewPending.call({ ...base, budgetComparisonState: 'ready' })).toBe(false)
    expect(computed.overviewUnavailable.call({ ...base, budgetComparisonState: 'error' })).toBe(true)
    expect(computed.overviewUnavailable.call({ ...base, dashboardLoadFailed: true })).toBe(true)
  })

  it('keeps no-plan and comparison-error states distinct without inventing a monthly amount', () => {
    const base = { dashboardLoadFailed: false, dashboardLoading: false, budgetComparisonLoading: false, hasMonthlyActivity: false, budgetComparison: null, openFinanceConflictCount: 0, cashflowDecisionData: null, goalsAtRisk: [], canWriteCurrentWorkspace: true }
    const noPlan = { ...base, budgetComparisonState: 'no-budget', isOverviewPending: false, overviewUnavailable: false }
    expect(computed.heroTitleKey.call(noPlan)).toBe('overview.guided_no_plan_title')
    expect(computed.heroAmount.call(noPlan)).toBeNull()
    expect(computed.primaryAction.call(noPlan).to).toBe('/planning/budget')

    const comparisonError = { ...base, budgetComparisonState: 'error', isOverviewPending: false, overviewUnavailable: true }
    expect(computed.heroTitleKey.call(comparisonError)).toBe('overview.guided_plan_error_title')
    expect(computed.heroAmount.call(comparisonError)).toBeNull()
    expect(computed.overviewUnavailable.call(comparisonError)).toBe(true)
  })

  it('keeps recorded activity visible when comparison fails and prioritizes conflicts safely', () => {
    const recorded = { dashboardLoadFailed: false, isOverviewPending: false, overviewUnavailable: false, hasMonthlyActivity: true, netMonthlyCashflow: 250, budgetComparisonState: 'error', openFinanceConflictCount: 0, cashflowDecisionData: null, goalsAtRisk: [], canWriteCurrentWorkspace: true }
    expect(computed.heroAmount.call(recorded)).toBe(250)
    expect(computed.heroAmountLabelKey.call(recorded)).toBe('overview.guided_actual_net_label')
    expect(computed.heroTitleKey.call(recorded)).toBe('overview.guided_current_title')
    const conflict = { ...recorded, openFinanceConflictCount: 1 }
    expect(computed.heroTitleKey.call(conflict)).toBe('overview.guided_attention_hero_title')
    expect(computed.primaryAction.call(conflict).to).toBe('/transactions')
  })

  it('keeps the primary action safe for read-only and attention states', () => {
    const base = { openFinanceConflictCount: 0, cashflowDecisionData: null, goalsAtRisk: [], canWriteCurrentWorkspace: true, budgetComparisonState: 'ready', hasMonthlyActivity: true }
    expect(computed.primaryAction.call(base).to).toBe('/planning/decide')
    expect(computed.primaryAction.call({ ...base, canWriteCurrentWorkspace: false }).to).toBe('/transactions')
    expect(computed.primaryAction.call({ ...base, budgetComparisonState: 'no-budget' }).to).toBe('/planning/budget')
    expect(computed.primaryAction.call({ ...base, openFinanceConflictCount: 1 }).to).toBe('/transactions')
    expect(computed.primaryAction.call({ ...base, goalsAtRisk: [{ id: 'goal' }] }).to).toBe('/planning/goals')
  })

  it('draws the trend chart after opening the collapsed section', () => {
    const createChart = vi.fn()
    const context = { showTrendsChart: false, createChart, $nextTick: (callback: () => void) => callback() }
    methods.toggleTrendsChart.call(context)
    expect(context.showTrendsChart).toBe(true)
    expect(createChart).toHaveBeenCalledOnce()
  })

  it('renders structured financial insights through translated copy and preserves unknown messages', () => {
    const t = vi.fn((key: string, params: { category: string; amount: string }) => `${key}:${params.category}:${params.amount}`)
    const context = { $t: t, formatCurrency: (value: number) => `BRL ${value}` }
    expect(methods.financialInsightMessage.call(context, { code: 'CATEGORY_INCOME_UNDER', category: 'Receita', amount: 3000, message: 'English fallback' }))
      .toBe('overview.financial_insight_category_income_under:Receita:BRL 3000')
    expect(methods.financialInsightMessage.call(context, { code: 'DECISION_IMPACT', amount: 120, message: 'English fallback' }))
      .toBe('overview.financial_insight_decision_impact::+BRL 120')
    expect(methods.financialInsightMessage.call(context, { code: 'UNKNOWN', message: 'Legacy message' }))
      .toBe('Legacy message')
    for (const locale of [pt, en, es, fr]) {
      expect(locale.overview.financial_insight_category_income_under).toContain('{amount}')
      expect(locale.overview.financial_insight_decision_impact).toContain('{amount}')
    }
  })

  it('recovers core and comparison reads independently after controlled failures', async () => {
    const fetchDashboard = vi.spyOn(FinancialReadService, 'fetchDashboard')
    const fetchChartData = vi.spyOn(DataService, 'fetchChartData').mockResolvedValue({ data: {} })
    const getComparison = vi.spyOn(BudgetService, 'getComparison')
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const context: any = {
      requestTokens: {}, beginRequest: methods.beginRequest, isLatestRequest: methods.isLatestRequest,
      currentWorkspaceId: 'fixture-workspace', selectedTimePeriod: 'month', selectedCategory: '',
      month: 10, year: 2026, dashboardLoadFailed: false, dashboardLoading: false,
      budgetComparison: null, budgetComparisonLoading: false, budgetComparisonState: 'idle',
      showAllComparisonLines: false, isCurrentWorkspaceContext: () => true,
      isCurrentOverviewContext: () => true, normalizeDashboardSummary: (data: unknown) => data,
      reconcileDashboardSummaryFromLocalReadModels: vi.fn(), buildChartState: () => ({}),
      applyChartState: vi.fn(),
    }

    fetchDashboard.mockRejectedValueOnce(new Error('summary offline')).mockResolvedValue({ data: { monthlyIncome: 100 } } as any)
    getComparison.mockResolvedValueOnce({ data: { summary: { plannedNet: 1000 } } } as any)
      .mockRejectedValueOnce(new Error('comparison offline'))
      .mockResolvedValueOnce({ data: { summary: { plannedNet: 1000 } } } as any)

    await Promise.all([methods.fetchOverviewCoreSnapshot.call(context), methods.fetchBudgetComparison.call(context)])
    expect(context.dashboardLoadFailed).toBe(true)
    expect(context.budgetComparisonState).toBe('ready')
    expect(context.dashboardLoading).toBe(false)
    expect(context.budgetComparisonLoading).toBe(false)

    await Promise.all([methods.fetchOverviewCoreSnapshot.call(context), methods.fetchBudgetComparison.call(context)])
    expect(context.dashboardLoadFailed).toBe(false)
    expect(context.dashboardSummary.monthlyIncome).toBe(100)
    expect(context.budgetComparisonState).toBe('error')
    expect(context.budgetComparison).toBeNull()

    await methods.fetchBudgetComparison.call(context)
    expect(context.budgetComparisonState).toBe('ready')
    expect(context.budgetComparison.summary.plannedNet).toBe(1000)
    expect(fetchChartData).toHaveBeenCalledTimes(2)
  })
})
