import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { ref } from 'vue'
import DebtScenarioBuilderView from '@/views/DebtScenarioBuilderView.vue'

const { routerPush, scenarioServiceMock, budgetServiceMock } = vi.hoisted(() => ({
  routerPush: vi.fn(),
  scenarioServiceMock: {
    simulate: vi.fn(),
    list: vi.fn(),
  },
  budgetServiceMock: {
    getCurrent: vi.fn(),
  },
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: routerPush,
  }),
  useRoute: () => ({
    params: {},
    query: {},
  }),
}))

vi.mock('@/services/ScenarioService', () => ({
  default: scenarioServiceMock,
  DEBT_PAYMENT_SCENARIO_TYPE: 'DEBT_PAYMENT_DECISION',
}))

vi.mock('@/services/BudgetService', () => ({
  default: budgetServiceMock,
}))

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    locale: ref('pt'),
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

describe('DebtScenarioBuilderView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()
    budgetServiceMock.getCurrent.mockResolvedValue({ status: 204, data: null })
    scenarioServiceMock.list.mockResolvedValue({ data: [] })
    scenarioServiceMock.simulate.mockResolvedValue({
      data: {
        scenarioName: 'Debt choice',
        scenarioType: 'DEBT_PAYMENT_DECISION',
        sourceType: 'MANUAL_TYPED',
        scenarioMonthlyImpact: -1144.82,
        summary: 'Bridge credit is cheaper if repaid fast, but installments are safer.',
        debtComparison: {
          cheapestOption: 'Bridge credit',
          safestOption: 'Installment card',
          recommendedOption: 'Installment card',
          recommendationReason: 'Installment card is safer.',
          tradeOffSummary: 'Installment card is safer.',
          warnings: ['Bridge credit: This option becomes risky if the expected cash does not arrive on time.'],
          options: [],
        },
      },
    })
  })

  it('validates required debt fields and supports adding/removing options', async () => {
    const wrapper = mount(DebtScenarioBuilderView, {
      global: {
        plugins: [vuetify],
      },
    })

    await flushPromises()
    expect(wrapper.text()).toContain('Option 1')
    expect(wrapper.text()).toContain('Option 2')

    const addButton = wrapper.findAll('button').find((button) => button.text().includes('Add option'))
    expect(addButton).toBeTruthy()
    await addButton!.trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('Option 3')

    const compareButton = wrapper.findAll('button').find((button) => button.text().includes('Compare options'))
    expect(compareButton).toBeTruthy()
    await compareButton!.trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('Title is required.')

    const removeButtons = wrapper.findAll('button').filter((button) => button.html().includes('mdi-delete-outline'))
    expect(removeButtons.length).toBeGreaterThan(0)
    await removeButtons[0].trigger('click')
    await flushPromises()
    expect(wrapper.text()).not.toContain('Option 3')
  })
})
