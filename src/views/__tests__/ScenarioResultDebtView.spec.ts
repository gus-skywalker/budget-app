import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { ref } from 'vue'
import ScenarioResultView from '@/views/ScenarioResultView.vue'

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
  useRouter: () => ({
    push: routerPush,
    replace: routerReplace,
    back: vi.fn(),
  }),
  useRoute: () => ({
    params: { id: 'preview' },
    query: { simulatedAt: '123' },
  }),
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

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    locale: ref('pt'),
    t: (key: string) => key,
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
    expect(wrapper.text()).not.toContain('Forecast details')
    expect(wrapper.text()).not.toContain('planning.scenarios.final_balance')

    const createDecisionButton = wrapper.findAll('button').find((button) => button.text().includes('Save and create decision'))
    expect(createDecisionButton).toBeTruthy()
    await createDecisionButton!.trigger('click')
    await flushPromises()

    expect(scenarioServiceMock.save).toHaveBeenCalledTimes(1)
    expect(decisionServiceMock.createFromScenario).toHaveBeenCalledWith('scenario-debt-1')
    expect(routerPush).toHaveBeenCalled()
  })
})
