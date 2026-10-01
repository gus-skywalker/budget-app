import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, enableAutoUnmount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { ref, reactive } from 'vue'
import ScenarioResultView from '@/views/ScenarioResultView.vue'
import { beginJourneySession, readJourneySession } from '@/utils/decisionJourneySession'

enableAutoUnmount(afterEach)
const context = { userId: 'user-1', workspaceId: 'workspace-1' }
const userStoreMock = reactive({ canWrite: true, isAuthenticated: true, getUser: { id: context.userId }, getCurrentWorkspaceId: context.workspaceId })
const routeState = reactive({ params: { id: 'preview' }, query: { simulatedAt: '123' } })

const { routerPush, routerReplace, scenarioServiceMock, decisionServiceMock, budgetServiceMock } = vi.hoisted(() => ({
  routerPush: vi.fn(),
  routerReplace: vi.fn(),
  scenarioServiceMock: {
    save: vi.fn(),
    list: vi.fn(),
    simulate: vi.fn(),
  },
  decisionServiceMock: {
    list: vi.fn(),
    createFromScenario: vi.fn(),
  },
  budgetServiceMock: {
    getCurrent: vi.fn(),
  },
}))

vi.mock('vue-router', () => ({
  createRouter: () => ({
    beforeEach: vi.fn(),
    afterEach: vi.fn(),
    push: routerPush,
    replace: routerReplace,
  }),
  createWebHistory: () => ({}),
  useRouter: () => ({
    push: routerPush,
    replace: routerReplace,
    back: vi.fn(),
  }),
  useRoute: () => routeState,
}))

vi.mock('@/services/ScenarioService', () => ({
  default: scenarioServiceMock,
  DEBT_PAYMENT_SCENARIO_TYPE: 'DEBT_PAYMENT_DECISION',
}))

vi.mock('@/services/DecisionService', () => ({
  default: decisionServiceMock,
}))

vi.mock('@/services/BudgetService', () => ({
  default: budgetServiceMock,
}))

vi.mock('@/plugins/userStore', () => ({
  useUserStore: () => userStoreMock,
}))

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    locale: ref('en'),
    t: (key: string) => {
      const messages: Record<string, string> = {
        'contentExperience.planning.scenarioResult.cheapestOption': 'Cheapest option',
        'contentExperience.planning.scenarioResult.recommendedOption': 'Recommended option',
        'contentExperience.planning.scenarioResult.forecastDetails': 'Projection rows',
        'decisionJourney.result.monthlyDetails': 'Projection rows',
        'decisionJourney.result.sourceBudget': 'Budget',
        'decisionJourney.result.sourceChange': 'Scenario change',
        'contentExperience.planning.scenarioResult.saveAndCreateDecision': 'Save and create decision',
        'planning.scenarios.table_month': 'Month',
        'planning.scenarios.table_baseline_flow': 'Baseline income / expense',
        'planning.scenarios.table_scenario_flow': 'Scenario income / expense',
        'planning.scenarios.table_baseline': 'Baseline balance',
        'planning.scenarios.table_scenario': 'Scenario balance',
        'planning.scenarios.table_delta': 'Impact',
        'planning.scenarios.table_sources': 'Sources',
        'planning.scenarios.source_confirmed': 'Budget',
        'planning.scenarios.source_scenario_change': 'Scenario change',
      }
      return messages[key] || key
    },
  }),
  createI18n: () => ({
    global: {
      t: (key: string) => key,
    },
  }),
}))

const vuetify = createVuetify({ components, directives })

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (!(globalThis as any).ResizeObserver) {
  ;(globalThis as any).ResizeObserver = ResizeObserverMock
}

const flushPromises = async () => {
  await Promise.resolve()
  await new Promise((resolve) => setTimeout(resolve, 0))
}

describe('ScenarioResultView debt scenario', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()
    userStoreMock.getCurrentWorkspaceId = context.workspaceId
    userStoreMock.getUser.id = context.userId
    userStoreMock.isAuthenticated = true
    routeState.params.id = 'preview'
    beginJourneySession(context, 'MANUAL_TYPED')
    scenarioServiceMock.save.mockResolvedValue({ data: { id: 'scenario-debt-1', name: 'Debt choice' } })
    decisionServiceMock.createFromScenario.mockResolvedValue({ data: { id: 'decision-1' } })
    decisionServiceMock.list.mockResolvedValue({ data: [] })
    budgetServiceMock.getCurrent.mockResolvedValue({ status: 204, data: null })

    sessionStorage.setItem(
      'planning-debt-scenario-wizard-v1',
      JSON.stringify({
        scenarioType: 'DEBT_PAYMENT_DECISION',
        sourceType: 'MANUAL_TYPED',
        scenarioName: 'Debt choice',
        currentScenarioId: null,
        budgetId: 'budget-1',
        debtInput: {
          title: 'Debt choice',
          totalAmount: 8153.88,
          availableCash: 5000,
          options: [
            { name: 'Installment card', type: 'INSTALLMENT', financedAmount: 3153.88, installments: 3, totalInstallmentAmount: 3434.46, iofAmount: 27.85, liquidityCertainty: 'CERTAIN' },
            { name: 'Bridge credit', type: 'SHORT_TERM_CREDIT', financedAmount: 3153.88, expectedPayoffDays: 10, monthlyInterestRate: 2.5, liquidityCertainty: 'UNCERTAIN' },
          ],
        },
      }),
    )

    sessionStorage.setItem(
      'planning-scenario-latest-result',
      JSON.stringify({
        sessionId: readJourneySession(context)!.sessionId,
        scenarioId: 'preview',
        result: {
          scenarioName: 'Debt choice',
          scenarioType: 'DEBT_PAYMENT_DECISION',
          sourceType: 'MANUAL_TYPED',
          months: 1,
          currentBalance: 5000,
          baselineMonthlyNet: 0,
          scenarioMonthlyImpact: -1144.82,
          projectedFinalBalance: 1565.54,
          decisionStatus: 'WATCH',
          availableForGoals: 0,
          impactedGoalsCount: 0,
          summary: 'Bridge credit is cheaper if paid quickly, but installments are safer because the cost is fixed.',
          forecast: [],
          impactedGoalNames: [],
          debtComparison: {
            cheapestOption: 'Bridge credit',
            safestOption: 'Installment card',
            recommendedOption: 'Installment card',
            recommendationReason: 'Installment card is safer.',
            tradeOffSummary: 'Bridge credit is cheaper if paid quickly, but installments are safer because the cost is fixed.',
            warnings: ['Bridge credit: This option becomes risky if the expected cash does not arrive on time.'],
            options: [
              {
                name: 'Installment card',
                totalPaid: 3434.46,
                totalExtraCost: 280.58,
                monthlyImpact: 1144.82,
                riskLevel: 'LOW',
                predictabilityLevel: 'HIGH',
                explanation: 'Fixed and predictable.',
              },
              {
                name: 'Bridge credit',
                totalPaid: 3232.71,
                totalExtraCost: 78.83,
                monthlyImpact: 3232.71,
                riskLevel: 'HIGH',
                predictabilityLevel: 'LOW',
                explanation: 'Cheaper only if repaid fast.',
                warning: 'This option becomes risky if the expected cash does not arrive on time.',
              },
            ],
          },
        },
      }),
    )
  })

  it('renders debt comparison and creates a decision from the saved scenario flow', async () => {
    const wrapper = mount(ScenarioResultView, {
      global: {
        plugins: [vuetify],
        mocks: {
          $t: (key: string) => key,
        },
      },
    })

    await flushPromises()
    expect(wrapper.text()).toContain('Cheapest option')
    expect(wrapper.text()).toContain('Bridge credit')
    expect(wrapper.text()).toContain('Recommended option')
    expect(wrapper.text()).toContain('Installment card')
    expect(wrapper.text()).not.toContain('Projection rows')
    expect(wrapper.text()).not.toContain('planning.scenarios.final_balance')

    const createDecisionButton = wrapper.findAll('button').find((button) => button.text().includes('Save and create decision'))
    expect(createDecisionButton).toBeTruthy()
    await createDecisionButton!.trigger('click')
    await flushPromises()

    expect(scenarioServiceMock.save).toHaveBeenCalledTimes(1)
    expect(decisionServiceMock.createFromScenario).toHaveBeenCalledWith('scenario-debt-1')
    expect(routerPush).toHaveBeenCalled()
  })

  it('renders projection rows instead of legacy forecast rows for budget scenarios', async () => {
    sessionStorage.clear()
    beginJourneySession(context, 'BUDGET_BASED')
    sessionStorage.setItem('planning-scenario-wizard-v3', JSON.stringify({
      scenarioName: 'Budget change', months: 2, currentScenarioId: null, budgetId: 'budget-1',
      adjustments: [], scenarioLines: [],
    }))
    sessionStorage.setItem(
      'planning-scenario-latest-result',
      JSON.stringify({
        sessionId: readJourneySession(context)!.sessionId,
        scenarioId: 'preview',
        result: {
          scenarioName: 'Budget change',
          sourceType: 'BUDGET_BASED',
          months: 2,
          currentBalance: 1000,
          baselineMonthlyNet: 600,
          scenarioMonthlyImpact: -150,
          projectedFinalBalance: 1900,
          decisionStatus: 'WATCH',
          availableForGoals: 450,
          impactedGoalsCount: 0,
          summary: 'Watch the expense ramp.',
          forecast: [
            {
              month: '2026-07',
              baselineProjectedBalance: 1600,
              scenarioProjectedBalance: 1450,
              deltaImpact: -150,
              status: 'surplus',
            },
          ],
          projection: [
            {
              period: '2026-07',
              baselineIncome: 4000,
              baselineExpense: 3400,
              baselineBalance: 1600,
              scenarioIncome: 4000,
              scenarioExpense: 3550,
              scenarioBalance: 1450,
              changeImpact: -150,
              sources: ['CONFIRMED', 'SCENARIO_CHANGE'],
            },
          ],
          impactedGoalNames: [],
        },
      }),
    )

    const wrapper = mount(ScenarioResultView, {
      global: {
        plugins: [vuetify],
        mocks: {
          $t: (key: string) => key,
        },
      },
    })

    await flushPromises()
    expect(wrapper.text()).toContain('Projection rows')

    const projectionTitle = wrapper.find('[data-testid="result-months"] summary')
    expect(projectionTitle.exists()).toBe(true)
    expect(wrapper.find('[data-testid="result-months"]').attributes('open')).toBeUndefined()
    await projectionTitle.trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('2026-07')
    expect(wrapper.text()).toContain('Budget')
    expect(wrapper.text()).toContain('Scenario change')
    expect(wrapper.text()).toContain('R$4,000.00 / R$3,400.00')
  })

  it('saves a budget preview with the budget draft even when an old debt draft coexists', async () => {
    const debtDraft = sessionStorage.getItem('planning-debt-scenario-wizard-v1')!
    const cached = JSON.parse(sessionStorage.getItem('planning-scenario-latest-result')!)
    const session = beginJourneySession(context, 'BUDGET_BASED')
    sessionStorage.setItem('planning-debt-scenario-wizard-v1', debtDraft)
    sessionStorage.setItem('planning-scenario-wizard-v3', JSON.stringify({
      scenarioName: 'Monthly expense', months: 6, currentScenarioId: null, budgetId: 'budget-monthly',
      adjustments: [{ id: 'change', flow: 'EXPENSE', amount: 120, temporalType: 'ONGOING', valueMode: 'AMOUNT' }], scenarioLines: [],
    }))
    cached.sessionId = session.sessionId
    cached.result.sourceType = 'BUDGET_BASED'
    cached.result.scenarioType = undefined
    cached.result.debtComparison = null
    sessionStorage.setItem('planning-scenario-latest-result', JSON.stringify(cached))
    const wrapper = mount(ScenarioResultView, { global: { plugins: [vuetify] } })
    await flushPromises()
    await wrapper.findAll('button').find(b => b.text().includes('Save and create decision'))!.trigger('click')
    await flushPromises()
    expect(scenarioServiceMock.save.mock.calls[0][0]).toMatchObject({ sourceType: 'BUDGET_BASED', budgetId: 'budget-monthly' })
    expect(scenarioServiceMock.save.mock.calls[0][0]).not.toHaveProperty('debtInput')
  })

  it('saves a debt preview without using an old budget draft', async () => {
    sessionStorage.setItem('planning-scenario-wizard-v3', JSON.stringify({ scenarioName: 'Wrong budget', currentScenarioId: 'old-budget-scenario', adjustments: [], scenarioLines: [] }))
    const wrapper = mount(ScenarioResultView, { global: { plugins: [vuetify] } })
    await flushPromises()
    await wrapper.findAll('button').find(b => b.text().includes('Save and create decision'))!.trigger('click')
    await flushPromises()
    expect(scenarioServiceMock.save.mock.calls[0][0]).toMatchObject({ sourceType: 'MANUAL_TYPED', debtInput: { title: 'Debt choice' } })
    expect(scenarioServiceMock.save.mock.calls[0][0].id).toBeUndefined()
  })

  it.each(['other-workspace', 'other-user'])('hides mounted data after switching to %s', async (change) => {
    const wrapper = mount(ScenarioResultView, { global: { plugins: [vuetify] } })
    await flushPromises()
    expect(wrapper.text()).toContain('Bridge credit')
    if (change === 'other-workspace') userStoreMock.getCurrentWorkspaceId = 'workspace-2'
    else userStoreMock.getUser.id = 'user-2'
    await flushPromises()
    expect(wrapper.text()).not.toContain('Bridge credit')
    expect(wrapper.find('.empty-results').exists()).toBe(true)
    expect(scenarioServiceMock.save).not.toHaveBeenCalled()
  })

  it('does not create a decision in the next workspace when an earlier save resolves', async () => {
    let finishSave!: (value: unknown) => void
    scenarioServiceMock.save.mockImplementation(() => new Promise(resolve => { finishSave = resolve }))
    const wrapper = mount(ScenarioResultView, { global: { plugins: [vuetify] } })
    await flushPromises()
    await wrapper.findAll('button').find(b => b.text().includes('Save and create decision'))!.trigger('click')
    userStoreMock.getCurrentWorkspaceId = 'workspace-2'
    finishSave({ data: { id: 'saved-in-old-workspace', name: 'Debt choice' } })
    await flushPromises()
    expect(decisionServiceMock.createFromScenario).not.toHaveBeenCalled()
    expect(routerPush).not.toHaveBeenCalled()
    expect(wrapper.text()).not.toContain('Bridge credit')
  })

  it.each(['missing-session', 'corrupt-result', 'missing-draft'])('offers a way out for %s instead of borrowing data', async (failure) => {
    if (failure === 'missing-session') sessionStorage.removeItem('planning-decision-session-v1')
    if (failure === 'corrupt-result') sessionStorage.setItem('planning-scenario-latest-result', '{broken')
    if (failure === 'missing-draft') sessionStorage.removeItem('planning-debt-scenario-wizard-v1')
    const wrapper = mount(ScenarioResultView, { global: { plugins: [vuetify] } })
    await flushPromises()
    expect(wrapper.find('.empty-results button').exists()).toBe(true)
    expect(wrapper.text()).not.toContain('Bridge credit')
    expect(scenarioServiceMock.list).not.toHaveBeenCalled()
  })

  it('rehydrates a saved debt scenario from the API without a local draft', async () => {
    const debtInput = JSON.parse(sessionStorage.getItem('planning-debt-scenario-wizard-v1')!).debtInput
    const result = JSON.parse(sessionStorage.getItem('planning-scenario-latest-result')!).result
    sessionStorage.clear()
    routeState.params.id = 'saved-debt'
    scenarioServiceMock.list.mockResolvedValue({ data: [{ ...result, id: 'saved-debt', name: 'Saved debt', debtInput, deltas: [] }] })
    const wrapper = mount(ScenarioResultView, { global: { plugins: [vuetify] } })
    await flushPromises()
    expect(wrapper.text()).toContain('Bridge credit')
    expect(budgetServiceMock.getCurrent).not.toHaveBeenCalled()
  })

  it('opens incomplete saved results without automatic simulation or invented evidence', async () => {
    sessionStorage.clear()
    routeState.params.id = 'partial'
    scenarioServiceMock.list.mockResolvedValue({ data: [{ id: 'partial', name: 'Partial history', months: null, deltas: [], projectedFinalBalance: 500 }] })
    const wrapper = mount(ScenarioResultView, { global: { plugins: [vuetify] } })
    await flushPromises()
    expect(wrapper.find('[data-origin="saved"]').exists()).toBe(true)
    const model = (wrapper.vm as any).presentation
    expect(model.months).toBeNull()
    expect(model.initialBalance.value).toBeNull()
    expect(model.availableForGoals.value).toBeNull()
    expect(model.riskKnown).toBe(false)
    expect(scenarioServiceMock.simulate).not.toHaveBeenCalled()
    expect(scenarioServiceMock.save).not.toHaveBeenCalled()
  })

  it('marks requested recalculation as live and preserves its returned horizon', async () => {
    sessionStorage.clear()
    routeState.params.id = 'partial'
    scenarioServiceMock.list.mockResolvedValue({ data: [{ id: 'partial', name: 'History', months: 6, deltas: [] }] })
    scenarioServiceMock.simulate.mockResolvedValue({ data: { sourceType: 'BUDGET_BASED', months: 3, scenarioMonthlyImpact: -50, decisionStatus: 'WATCH', forecast: [], impactedGoalNames: [] } })
    const wrapper = mount(ScenarioResultView, { global: { plugins: [vuetify] } })
    await flushPromises()
    expect(scenarioServiceMock.simulate).not.toHaveBeenCalled()
    await (wrapper.vm as any).recalculateResult()
    await flushPromises()
    expect((wrapper.vm as any).presentation).toMatchObject({ origin: 'live', recalculated: true, months: 3 })
    expect(scenarioServiceMock.simulate).toHaveBeenCalledTimes(1)
    expect(scenarioServiceMock.save).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('decisionJourney.result.recalculated')
  })

  it('still shows historical evidence when the current plan cannot be loaded', async () => {
    sessionStorage.clear()
    routeState.params.id = 'history'
    scenarioServiceMock.list.mockResolvedValue({ data: [{ id: 'history', name: 'Historical evidence', deltas: [], scenarioMonthlyImpact: -25, decisionStatus: 'WATCH' }] })
    budgetServiceMock.getCurrent.mockRejectedValueOnce(new Error('unavailable'))
    const wrapper = mount(ScenarioResultView, { global: { plugins: [vuetify] } })
    await flushPromises()
    expect(wrapper.text()).toContain('Historical evidence')
    expect((wrapper.vm as any).presentation.impact.value).toBe(-25)
    expect((wrapper.vm as any).snapshot.currentScenarioId).toBe('history')
    expect(scenarioServiceMock.simulate).not.toHaveBeenCalled()
  })

  it('blocks result actions until the saved assumptions finish loading', async () => {
    sessionStorage.clear()
    routeState.params.id = 'pending'
    scenarioServiceMock.list.mockResolvedValue({ data: [{ id: 'pending', name: 'Pending plan', deltas: [], scenarioMonthlyImpact: 25 }] })
    let finish!: (value: unknown) => void
    budgetServiceMock.getCurrent.mockImplementationOnce(() => new Promise(resolve => { finish = resolve }))
    const wrapper = mount(ScenarioResultView, { global: { plugins: [vuetify] } })
    await flushPromises()
    expect(wrapper.text()).toContain('Pending plan')
    expect((wrapper.vm as any).isLoading).toBe(true)
    await (wrapper.vm as any).recalculateResult()
    await (wrapper.vm as any).saveScenario()
    expect(scenarioServiceMock.simulate).not.toHaveBeenCalled()
    expect(scenarioServiceMock.save).not.toHaveBeenCalled()
    finish({ status: 204, data: null })
    await flushPromises()
    expect((wrapper.vm as any).isLoading).toBe(false)
  })
})
