import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
import { reactive, ref } from 'vue'
import CashflowView from '@/views/CashflowView.vue'
import CashflowDashboard from '@/components/ai/CashflowDashboard.vue'

enableAutoUnmount(afterEach)

const { billingMock, financialReadMock, aiMock, routerPush } = vi.hoisted(() => ({
  billingMock: { getBillingSummary: vi.fn() },
  financialReadMock: { fetchTransactionPeriodSummary: vi.fn() },
  aiMock: { predictMonthlyExpenses: vi.fn(), getCashflowProjection: vi.fn(), getCashflowInsights: vi.fn() },
  routerPush: vi.fn(),
}))

const store = reactive({
  getCurrentWorkspaceId: 'cashflow-workspace',
  getPreferredWorkspaceId: 'cashflow-workspace',
  getWorkspaces: [{ workspaceId: 'cashflow-workspace' }],
})

vi.mock('@/plugins/userStore', () => ({ useUserStore: () => store }))
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: routerPush }),
  createRouter: () => ({ beforeEach: vi.fn(), afterEach: vi.fn(), push: routerPush }),
  createWebHistory: () => ({}),
}))
vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key, locale: ref('pt') }),
  createI18n: () => ({ global: { t: (key: string) => key } }),
}))
vi.mock('@/services/BillingOrchestrationService', () => ({ default: billingMock }))
vi.mock('@/services/FinancialReadService', () => ({ default: financialReadMock }))
vi.mock('@/services/aiService', () => ({ default: aiMock }))

const basicSummary = {
  currency: 'BRL', incomeAmount: 3000, expenseAmount: 2000, netAmount: 1000,
  incomeTransactionCount: 1, expenseTransactionCount: 1,
}

const plan = (projection: boolean, advanced: boolean, ai = false) => ({
  data: { capabilities: { planningIntelligenceEnabled: projection, advancedCashflowEnabled: advanced,
    aiEnabled: ai, advancedToolsEnabled: false } },
})

const mountView = () => mount(CashflowView, {
  global: {
    stubs: {
      PageHeader: true,
      PlanTierBadge: { props: ['tier'], template: '<span class="tier-badge">{{ tier }}</span>' },
      CashflowDashboard: { props: ['enabled', 'advanced'], template: '<div class="cashflow-dashboard" :data-enabled="enabled" :data-advanced="advanced" />' },
      MonthlyExpensesPrediction: true,
      AnomalyDetectionTable: true,
      RouterLink: { template: '<a><slot /></a>' },
      VIcon: true,
    },
  },
})

beforeEach(() => {
  vi.clearAllMocks()
  financialReadMock.fetchTransactionPeriodSummary.mockResolvedValue({ data: basicSummary })
  aiMock.predictMonthlyExpenses.mockResolvedValue({ data: null })
})

describe('Cashflow plan tiers', () => {
  it('shows actual shared monthly flow on Free while the projection is locked', async () => {
    billingMock.getBillingSummary.mockResolvedValue(plan(false, false))
    const wrapper = mountView()
    await flushPromises()

    expect(financialReadMock.fetchTransactionPeriodSummary).toHaveBeenCalledWith(expect.objectContaining({ reportScope: 'WORKSPACE_SHARED' }))
    expect(wrapper.find('.cashflow-basic__metrics').text()).toContain('R$')
    expect(wrapper.find('.cashflow-dashboard').attributes('data-enabled')).toBe('false')
    expect(wrapper.find('.tier-badge').text()).toBe('STARTER')
  })

  it('enables deterministic projection on Starter and reserves advanced context for Team', async () => {
    billingMock.getBillingSummary.mockResolvedValue(plan(true, false, true))
    const starter = mountView()
    await flushPromises()
    expect(starter.find('.cashflow-dashboard').attributes()).toMatchObject({ 'data-enabled': 'true', 'data-advanced': 'false' })
    expect(starter.find('.cashflow-team-teaser .tier-badge').text()).toBe('TEAM')

    billingMock.getBillingSummary.mockResolvedValue(plan(true, true, true))
    const team = mountView()
    await flushPromises()
    expect(team.find('.cashflow-dashboard').attributes()).toMatchObject({ 'data-enabled': 'true', 'data-advanced': 'true' })
    expect(team.find('.cashflow-team-teaser').exists()).toBe(false)
  })

  it('distinguishes an empty month from a loading failure', async () => {
    billingMock.getBillingSummary.mockResolvedValue(plan(false, false))
    financialReadMock.fetchTransactionPeriodSummary.mockResolvedValueOnce({ data: {
      ...basicSummary, incomeAmount: 0, expenseAmount: 0, netAmount: 0,
      incomeTransactionCount: 0, expenseTransactionCount: 0,
    } })
    const empty = mountView()
    await flushPromises()
    expect(empty.text()).toContain('cashflow.basic_empty')
    expect(empty.text()).not.toContain('cashflow.basic_error')

    financialReadMock.fetchTransactionPeriodSummary.mockRejectedValueOnce(new Error('offline'))
    const failed = mountView()
    await flushPromises()
    expect(failed.text()).toContain('cashflow.basic_error')
    expect(failed.text()).not.toContain('cashflow.basic_empty')
  })
})

describe('Cashflow projection requests', () => {
  const mountDashboard = (advanced: boolean) => mount(CashflowDashboard, { props: { enabled: true, advanced } })

  it('calls the Starter projection endpoint without rendering Team-only cards', async () => {
    aiMock.getCashflowProjection.mockResolvedValue({ data: {
      historyFrom: '2026-05-01', historyThrough: '2026-11-03', historicalNetAmount: 1000,
      averageMonthlyNet: 200, decisionStatus: 'STABLE', forecast: [{ month: '2026-12',
        predictedIncome: 3000, predictedExpenses: 2000, projectedBalance: 2000, status: 'surplus' }],
    } })
    const wrapper = mountDashboard(false)
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(aiMock.getCashflowProjection).toHaveBeenCalledWith({ months: 6 })
    expect(aiMock.getCashflowInsights).not.toHaveBeenCalled()
    expect(wrapper.find('.cashflow-source-period').exists()).toBe(true)
    expect(wrapper.find('.decision-cards').exists()).toBe(false)
    expect(wrapper.findAll('tbody tr')).toHaveLength(1)
  })

  it('calls the Team endpoint and shows no false stable forecast when there is no history', async () => {
    aiMock.getCashflowInsights.mockResolvedValue({ data: {
      currentBalance: 0, averageMonthlyBalance: 0, decisionStatus: 'NO_DATA', forecast: [], insights: [],
    } })
    const wrapper = mountDashboard(true)
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(aiMock.getCashflowInsights).toHaveBeenCalledWith({ months: 6 })
    expect(wrapper.find('.cashflow-no-data').exists()).toBe(true)
    expect(wrapper.find('.metrics').exists()).toBe(false)
  })
})
