import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { enableAutoUnmount, mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { reactive, ref } from 'vue'
import InsightsView from '@/views/InsightsView.vue'

enableAutoUnmount(afterEach)

const { scenarioService, routerPush, routerReplace } = vi.hoisted(() => ({
  scenarioService: { list: vi.fn(), simulate: vi.fn() },
  routerPush: vi.fn(),
  routerReplace: vi.fn(),
}))

const route = reactive({ query: {} as Record<string, string> })

vi.mock('@/services/ScenarioService', () => ({ default: scenarioService }))
vi.mock('vue-router', () => ({ useRoute: () => route, useRouter: () => ({ push: routerPush, replace: routerReplace }) }))
vi.mock('vue-i18n', () => ({ useI18n: () => ({ locale: ref('pt'), t: (key: string, params?: Record<string, unknown>) => params ? `${key} ${JSON.stringify(params)}` : key }) }))

const vuetify = createVuetify({ components, directives })
const flushPromises = async () => {
  await Promise.resolve()
  await new Promise((resolve) => setTimeout(resolve, 0))
}

const scenario = {
  id: 'scenario-1', name: 'Curso de teste', months: 6,
  deltas: [{ type: 'MONTHLY_EXPENSE', label: 'Curso', amount: 100, startMonthOffset: 0 }],
}
const simulation = {
  decisionStatus: 'STABLE', projectedFinalBalance: 5400, scenarioMonthlyImpact: -100,
  firstRiskMonth: null, impactedGoalsCount: 0, availableForGoals: 900, impactedGoalNames: [],
}

const mountInsights = () => mount(InsightsView, { global: { plugins: [vuetify] } })

describe('InsightsView guided signals', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.localStorage.clear()
    route.query = {}
    scenarioService.list.mockResolvedValue({ data: [scenario] })
    scenarioService.simulate.mockResolvedValue({ data: simulation })
    routerReplace.mockResolvedValue(undefined)
    routerPush.mockResolvedValue(undefined)
  })

  it('puts an actionable spending signal before stable context and explains simulation provenance', async () => {
    const wrapper = mountInsights()
    await flushPromises()

    expect(wrapper.find('h1').text()).toBe('insights.title')
    expect(wrapper.find('.insights-origin').text()).toContain('insights.simulation_scope')
    expect(wrapper.find('.cb-insight-card--lead h2').text()).toBe('insights.spending_pressure_title')
    expect(wrapper.find('.cb-insight-card--lead .cb-insight-card__provenance').text()).toContain('insights.source_spending_changes')
    expect(wrapper.findAll('.insights-additional article')).toHaveLength(2)
    expect(wrapper.find('.cb-page-header__actions').exists()).toBe(false)
    expect(routerReplace).toHaveBeenCalledWith({ query: { scenarios: 'scenario-1' } })
  })

  it('sends saved percentage, duration, budget and changed lines without mutating or persisting derived deltas', async () => {
    const saved = {
      ...scenario,
      budgetId: 'budget-1',
      deltas: [{
        type: 'PERCENT_EXPENSE_REDUCTION', label: 'Redução temporária', amount: 400,
        percentage: 12.5, temporalType: 'FIXED_PERIOD', startMonthOffset: 2, endMonthOffset: 5,
      }],
      lines: [
        { id: 'income', category: 'Salário', type: 'INCOME', originalAmount: 1000, adjustedAmount: 1100, delta: 100 },
        { id: 'expense', category: 'Aluguel', type: 'EXPENSE', originalAmount: 500, adjustedAmount: 450, delta: -50 },
        { id: 'same', category: 'Lazer', type: 'EXPENSE', originalAmount: 200, adjustedAmount: 200, delta: 0 },
      ],
    }
    const original = JSON.stringify(saved)
    scenarioService.list.mockResolvedValue({ data: [saved] })
    mountInsights()
    await flushPromises()

    expect(JSON.parse(JSON.stringify(scenarioService.simulate.mock.calls[0][0]))).toEqual({
      id: 'scenario-1', budgetId: 'budget-1', name: 'Curso de teste', months: 6,
      deltas: [
        saved.deltas[0],
        { label: 'planning.scenarios.baseline_adjustment_label {"category":"Salário"}', type: 'MONTHLY_INCOME', amount: 100, startMonthOffset: 0 },
        { label: 'planning.scenarios.baseline_adjustment_label {"category":"Aluguel"}', type: 'MONTHLY_INCOME', amount: 50, startMonthOffset: 0 },
      ],
    })
    expect(scenarioService.simulate.mock.calls[0][0]).not.toHaveProperty('lineAdjustments')
    expect(JSON.stringify(saved)).toBe(original)
  })

  it('shows a risk signal first and opens its exact scenario', async () => {
    scenarioService.simulate.mockResolvedValue({ data: { ...simulation, decisionStatus: 'ACTION_NEEDED', firstRiskMonth: '2026-12' } })
    const wrapper = mountInsights()
    await flushPromises()

    expect(wrapper.find('.cb-insight-card--lead h2').text()).toBe('insights.cash_pressure_title')
    await wrapper.find('.cb-insight-card--lead button').trigger('click')
    expect(routerPush).toHaveBeenCalledWith({ name: 'planning-scenarios-result', params: { id: scenario.id } })
  })

  it('does not call WATCH or NO_DATA stable', async () => {
    scenarioService.simulate.mockResolvedValueOnce({ data: { ...simulation, decisionStatus: 'WATCH' } })
    const watchWrapper = mountInsights()
    await flushPromises()
    expect(watchWrapper.text()).toContain('insights.cash_watch_title')
    expect(watchWrapper.text()).not.toContain('insights.cash_stability_title')
    watchWrapper.unmount()

    scenarioService.simulate.mockResolvedValueOnce({ data: { ...simulation, decisionStatus: 'NO_DATA' } })
    const noDataWrapper = mountInsights()
    await flushPromises()
    expect(noDataWrapper.find('.cb-insight-card--lead h2').text()).toBe('insights.data_missing_title')
    expect(noDataWrapper.text()).not.toContain('insights.goals_room_title')
  })

  it('offers one clear continuation when there are no scenarios', async () => {
    scenarioService.list.mockResolvedValue({ data: [] })
    const wrapper = mountInsights()
    await flushPromises()
    expect(wrapper.find('.insights-empty-state h2').text()).toBe('insights.empty_title')
    await wrapper.find('.insights-empty-state button').trigger('click')
    expect(routerPush).toHaveBeenCalledWith({ name: 'planning-scenarios' })
  })

  it('keeps network failure and access denial separate from an empty list', async () => {
    scenarioService.list.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce({ data: [scenario] })
    const wrapper = mountInsights()
    await flushPromises()
    expect(wrapper.find('[role="alert"]').text()).toContain('insights.load_error')
    expect(wrapper.find('.insights-empty-state').exists()).toBe(false)
    await wrapper.find('[role="alert"] button').trigger('click')
    await flushPromises()
    expect(wrapper.find('.cb-insight-card--lead').exists()).toBe(true)
    wrapper.unmount()

    scenarioService.list.mockRejectedValueOnce({ response: { status: 403 } })
    const deniedWrapper = mountInsights()
    await flushPromises()
    expect(deniedWrapper.find('[role="alert"]').text()).toContain('insights.access_denied')
    expect(deniedWrapper.find('[role="alert"] button').exists()).toBe(false)
    expect(deniedWrapper.find('.insights-empty-state').exists()).toBe(false)
  })

  it('does not turn a missing projected balance into a false zero', async () => {
    scenarioService.simulate.mockResolvedValue({ data: { ...simulation, projectedFinalBalance: null } })
    const wrapper = mountInsights()
    await flushPromises()

    expect(wrapper.find('[role="alert"]').text()).toContain('insights.load_error')
    expect(wrapper.text()).not.toContain('insights.cash_stability_title')
  })
})
