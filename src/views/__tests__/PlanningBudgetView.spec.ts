import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { ref } from 'vue'
import PlanningBudgetView from '@/views/PlanningBudgetView.vue'

const { routerPush, budgetServiceMock } = vi.hoisted(() => ({
  routerPush: vi.fn(),
  budgetServiceMock: {
    getCurrent: vi.fn(),
    getSuggestions: vi.fn(),
    createFromSuggestion: vi.fn(),
    create: vi.fn(),
    addLine: vi.fn(),
    activate: vi.fn(),
  },
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: routerPush,
  }),
}))

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    locale: ref('pt'),
  }),
}))

vi.mock('@/services/BudgetService', () => ({
  default: budgetServiceMock,
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

describe('PlanningBudgetView suggestion flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('supports no active budget -> generate suggestion -> edit -> activate this plan', async () => {
    budgetServiceMock.getCurrent
      .mockResolvedValueOnce({
        status: 204,
        data: null,
      })
      .mockResolvedValueOnce({
        status: 200,
        data: {
          id: 'budget-draft-1',
          workspaceId: '11111111-1111-1111-1111-111111111111',
          periodMonth: 5,
          periodYear: 2026,
          status: 'ACTIVE',
          totalIncome: 20000,
          totalExpense: 4500,
          net: 15500,
          lines: [
            { id: 'line-1', category: 'Revenue', type: 'INCOME', plannedAmount: 20000 },
            { id: 'line-2', category: 'Marketing', type: 'EXPENSE', plannedAmount: 4500 },
          ],
        },
      })
    budgetServiceMock.getSuggestions.mockResolvedValue({
      data: {
        workspaceId: '11111111-1111-1111-1111-111111111111',
        month: 5,
        year: 2026,
        suggestedIncome: 20000,
        suggestedExpense: 12000,
        net: 8000,
        lookbackMonths: 3,
        lines: [
          { category: 'Revenue', type: 'INCOME', suggestedAmount: 20000, confidence: 'HIGH' },
          { category: 'Marketing', type: 'EXPENSE', suggestedAmount: 4000, confidence: 'MEDIUM' },
        ],
      },
    })
    budgetServiceMock.createFromSuggestion.mockResolvedValue({
      data: {
        id: 'budget-draft-1',
        workspaceId: '11111111-1111-1111-1111-111111111111',
        periodMonth: 5,
        periodYear: 2026,
        status: 'DRAFT',
        totalIncome: 20000,
        totalExpense: 4500,
        net: 15500,
        lines: [
          { id: 'line-1', category: 'Revenue', type: 'INCOME', plannedAmount: 20000 },
          { id: 'line-2', category: 'Marketing', type: 'EXPENSE', plannedAmount: 4500 },
        ],
      },
    })
    budgetServiceMock.activate.mockResolvedValue({
      data: {
        id: 'budget-draft-1',
        status: 'ACTIVE',
      },
    })

    const wrapper = mount(PlanningBudgetView, {
      global: {
        plugins: [vuetify],
        mocks: {
          $t: (key: string) => key,
        },
      },
    })

    await flushPromises()
    expect(wrapper.text()).toContain('Start from your real data')
    expect(budgetServiceMock.getSuggestions).toHaveBeenCalledTimes(1)

    const generateButton = wrapper.findAll('button').find((btn) => btn.text().includes('Generate Suggested Budget'))
    expect(generateButton).toBeTruthy()
    await generateButton!.trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Suggested Budget')
    expect(budgetServiceMock.getSuggestions).toHaveBeenCalledTimes(2)

    const numberInputs = wrapper.findAll('input[type="number"]')
    expect(numberInputs.length).toBeGreaterThan(0)

    // Update the marketing suggestion from 4000 to 4500
    const expenseInput = numberInputs[numberInputs.length - 1]
    await expenseInput.setValue('4500')
    await flushPromises()

    const usePlanButton = wrapper.findAll('button').find((btn) => btn.text().includes('Activate This Plan'))
    expect(usePlanButton).toBeTruthy()
    await usePlanButton!.trigger('click')
    await flushPromises()

    expect(budgetServiceMock.createFromSuggestion).toHaveBeenCalledTimes(1)
    expect(budgetServiceMock.createFromSuggestion).toHaveBeenCalledWith({
      month: 5,
      year: 2026,
      lines: [
        { category: 'Revenue', type: 'INCOME', suggestedAmount: 20000, confidence: 'HIGH' },
        { category: 'Marketing', type: 'EXPENSE', suggestedAmount: 4500, confidence: 'MEDIUM' },
      ],
    })

    expect(budgetServiceMock.activate).toHaveBeenCalledWith('budget-draft-1')
    expect(wrapper.text()).toContain('Budget activated from recent financial activity.')
    expect(routerPush).not.toHaveBeenCalled()
  })

  it('creates a quick manual baseline as one synthetic budget line', async () => {
    budgetServiceMock.getCurrent.mockResolvedValue({
      status: 204,
      data: null,
    })
    budgetServiceMock.getSuggestions.mockResolvedValue({
      data: {
        workspaceId: '11111111-1111-1111-1111-111111111111',
        month: 5,
        year: 2026,
        lines: [],
      },
    })
    budgetServiceMock.create.mockResolvedValue({
      data: {
        id: 'manual-budget-1',
      },
    })
    budgetServiceMock.addLine.mockResolvedValue({ data: {} })
    budgetServiceMock.activate.mockResolvedValue({ data: { id: 'manual-budget-1', status: 'ACTIVE' } })

    const wrapper = mount(PlanningBudgetView, {
      global: {
        plugins: [vuetify],
        mocks: {
          $t: (key: string) => key,
        },
      },
    })

    await flushPromises()

    const manualButton = wrapper.findAll('button').find((btn) => btn.text().includes('Create Budget Manually'))
    expect(manualButton).toBeTruthy()
    await manualButton!.trigger('click')
    await flushPromises()

    const numberInputs = wrapper.findAll('input[type="number"]')
    expect(numberInputs.length).toBeGreaterThan(0)
    await numberInputs[0].setValue('9000')
    await flushPromises()

    const activateButton = wrapper.findAll('button').find((btn) => btn.text().includes('Activate Quick Baseline'))
    expect(activateButton).toBeTruthy()
    await activateButton!.trigger('click')
    await flushPromises()

    expect(budgetServiceMock.create).toHaveBeenCalledWith({
      periodMonth: expect.any(Number),
      periodYear: expect.any(Number),
      status: 'DRAFT',
    })
    expect(budgetServiceMock.addLine).toHaveBeenCalledWith('manual-budget-1', {
      category: 'Manual net baseline',
      type: 'INCOME',
      plannedAmount: 9000,
    })
    expect(budgetServiceMock.addLine).not.toHaveBeenCalledWith(
      'manual-budget-1',
      expect.objectContaining({ plannedAmount: 0 }),
    )
    expect(budgetServiceMock.activate).toHaveBeenCalledWith('manual-budget-1')
  })

  it('creates a quick manual shortfall baseline as an expense line', async () => {
    budgetServiceMock.getCurrent.mockResolvedValue({
      status: 204,
      data: null,
    })
    budgetServiceMock.getSuggestions.mockResolvedValue({
      data: {
        workspaceId: '11111111-1111-1111-1111-111111111111',
        month: 5,
        year: 2026,
        lines: [],
      },
    })
    budgetServiceMock.create.mockResolvedValue({
      data: {
        id: 'manual-budget-1',
      },
    })
    budgetServiceMock.addLine.mockResolvedValue({ data: {} })
    budgetServiceMock.activate.mockResolvedValue({ data: { id: 'manual-budget-1', status: 'ACTIVE' } })

    const wrapper = mount(PlanningBudgetView, {
      global: {
        plugins: [vuetify],
        mocks: {
          $t: (key: string) => key,
        },
      },
    })

    await flushPromises()

    const manualButton = wrapper.findAll('button').find((btn) => btn.text().includes('Create Budget Manually'))
    expect(manualButton).toBeTruthy()
    await manualButton!.trigger('click')
    await flushPromises()

    const numberInputs = wrapper.findAll('input[type="number"]')
    expect(numberInputs.length).toBeGreaterThan(0)
    await numberInputs[0].setValue('-1200')
    await flushPromises()

    const activateButton = wrapper.findAll('button').find((btn) => btn.text().includes('Activate Quick Baseline'))
    expect(activateButton).toBeTruthy()
    await activateButton!.trigger('click')
    await flushPromises()

    expect(budgetServiceMock.addLine).toHaveBeenCalledWith('manual-budget-1', {
      category: 'Manual net baseline',
      type: 'EXPENSE',
      plannedAmount: 1200,
    })
    expect(budgetServiceMock.activate).toHaveBeenCalledWith('manual-budget-1')
  })
})
