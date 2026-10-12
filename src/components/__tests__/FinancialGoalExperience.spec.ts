import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, enableAutoUnmount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { reactive } from 'vue'
import FinancialGoal from '@/components/FinancialGoal.vue'

enableAutoUnmount(afterEach)

const { goals, data, billing } = vi.hoisted(() => ({
  goals: {
    fetchFinancialGoals: vi.fn(),
    createFinancialGoal: vi.fn(),
    updateFinancialGoal: vi.fn(),
    deleteFinancialGoal: vi.fn(),
    addContribution: vi.fn(),
    deleteContribution: vi.fn(),
    suggestGoalsBasedOnIncome: vi.fn(),
  },
  data: { fetchMonthOverview: vi.fn(), listCategories: vi.fn(), fetchCategories: vi.fn() },
  billing: { getBillingSummary: vi.fn() },
}))

const store = reactive({ canWrite: true, getCurrentWorkspaceId: 'workspace-1', getPreferredWorkspaceId: 'workspace-1', getWorkspaces: [] })

vi.mock('@/services/FinancialGoalService', () => ({ default: goals }))
vi.mock('@/services/DataService', () => ({ default: data }))
vi.mock('@/services/BillingOrchestrationService', () => ({ default: billing }))
vi.mock('@/services/aiService', () => ({ default: { autoCategorize: vi.fn() } }))
vi.mock('@/plugins/userStore', () => ({ useUserStore: () => store }))

const vuetify = createVuetify({ components, directives })
const flushPromises = async () => {
  await Promise.resolve()
  await new Promise((resolve) => setTimeout(resolve, 0))
}

const goal = {
  id: 'goal-1', name: 'Reserva de viagem', targetAmount: 5000, remainingAmount: 3500,
  progress: 30, deadline: '2026-12-31', monthsRemaining: 3, suggestedContributionAmount: 1200,
  paceStatus: 'AT_RISK', insightMessage: 'Os aportes atuais estão abaixo do necessário.',
  contributions: [{ id: 'contribution-1', amount: 1500, date: '2026-09-01' }],
}

const mountGoals = () => mount(FinancialGoal, {
  global: {
    plugins: [vuetify],
    mocks: { $t: (key: string, params?: Record<string, unknown>) => params ? `${key} ${JSON.stringify(params)}` : key, $i18n: { locale: 'pt' }, $router: { push: vi.fn() } },
    stubs: { ContributionComponent: { template: '<div class="contribution-form-stub" />' } },
  },
})

describe('FinancialGoal guided experience', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    store.canWrite = true
    store.getCurrentWorkspaceId = 'workspace-1'
    goals.fetchFinancialGoals.mockResolvedValue({ data: [] })
    data.fetchMonthOverview.mockResolvedValue({ data: { totalIncome: 0, totalExpense: 0 } })
    data.listCategories.mockResolvedValue({ data: [] })
    data.fetchCategories.mockResolvedValue({ data: [] })
    billing.getBillingSummary.mockResolvedValue({ data: { capabilities: {} } })
  })

  it('shows one primary creation path and keeps suggestions optional in an empty workspace', async () => {
    const wrapper = mountGoals()
    await flushPromises()

    expect(wrapper.find('h1').text()).toBe('financial_goals.title')
    expect(wrapper.find('.goal-empty-intro').text()).toContain('financial_goals.empty_title')
    expect(wrapper.findAll('button').filter((button) => button.text().includes('financial_goals.new_goal'))).toHaveLength(1)
    expect(wrapper.find('.goal-ideas-toggle').attributes('aria-expanded')).toBe('false')
    expect(wrapper.find('#goal-ideas-content').attributes('style')).toContain('display: none')

    await wrapper.find('.goal-ideas-toggle').trigger('click')
    await flushPromises()
    expect(wrapper.find('.goal-ideas-toggle').attributes('aria-expanded')).toBe('true')
    expect(wrapper.find('#goal-ideas-content').attributes('style')).not.toContain('display: none')
  })

  it('places the saved target, progress, deadline and risk reason before optional actions', async () => {
    goals.fetchFinancialGoals.mockResolvedValue({ data: [goal] })
    const wrapper = mountGoals()
    await flushPromises()

    const card = wrapper.find('.goal-item')
    expect(card.find('h3').text()).toBe('Reserva de viagem')
    expect(card.find('.goal-item__target').text()).toContain('R$ 5.000,00')
    expect(card.find('.goal-item__progress-heading').text()).toContain('30%')
    expect(card.find('.goal-item__insight').text()).toContain(goal.insightMessage)
    expect(card.find('.goal-item__insight').text()).toContain('financial_goals.risk_reason')
    expect(card.find('.goal-item__details summary').text()).toContain('financial_goals.contribution_history')
    expect(card.findAll('.goal-action-btn')).toHaveLength(2)
  })

  it('does not present missing progress or remaining amount as zero', async () => {
    goals.fetchFinancialGoals.mockResolvedValue({ data: [{ ...goal, progress: null, remainingAmount: null }] })
    const wrapper = mountGoals()
    await flushPromises()

    const card = wrapper.find('.goal-item')
    expect(card.find('.goal-item__progress-heading').text()).toContain('financial_goals.not_available')
    expect(card.find('.v-progress-linear').exists()).toBe(false)
    expect(card.find('.goal-insight-chip__label').text()).not.toContain('financial_goals.remaining_amount')
  })

  it('keeps a failed load separate from an empty workspace and recovers on retry', async () => {
    goals.fetchFinancialGoals.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce({ data: [goal] })
    const wrapper = mountGoals()
    await flushPromises()
    expect(wrapper.find('[role="alert"]').text()).toContain('financial_goals.load_error')
    expect(wrapper.find('.goal-empty-intro').exists()).toBe(false)

    await wrapper.find('[role="alert"] button').trigger('click')
    await flushPromises()
    expect(wrapper.find('.goal-item').exists()).toBe(true)
  })

  it('does not interpret a malformed response as an empty goal list', async () => {
    goals.fetchFinancialGoals.mockResolvedValue({ data: { unexpected: true } })
    const wrapper = mountGoals()
    await flushPromises()

    expect(wrapper.find('[role="alert"]').text()).toContain('financial_goals.load_error')
    expect(wrapper.find('.goal-empty-intro').exists()).toBe(false)
  })

  it('keeps goal details readable without exposing writes in a read-only workspace', async () => {
    store.canWrite = false
    goals.fetchFinancialGoals.mockResolvedValue({ data: [goal] })
    const wrapper = mountGoals()
    await flushPromises()

    expect(wrapper.find('.goal-item').text()).toContain('Reserva de viagem')
    expect(wrapper.find('.goal-item__actions').exists()).toBe(false)
    expect(wrapper.find('.contribution-form-stub').exists()).toBe(false)
    expect(wrapper.findAll('button').some((button) => button.text().includes('financial_goals.new_goal'))).toBe(false)
    await (wrapper.vm as any).acceptSuggestedGoal({ name: 'Unexpected' })
    expect(goals.createFinancialGoal).not.toHaveBeenCalled()
  })
})
