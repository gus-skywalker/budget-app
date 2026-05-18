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
    list: vi.fn(),
    getCurrent: vi.fn(),
    getSuggestions: vi.fn(),
    generateBaseline: vi.fn(),
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
    budgetServiceMock.list
      .mockResolvedValueOnce({
        data: [],
      })
      .mockResolvedValueOnce({
        data: [
          {
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
        ],
      })
    budgetServiceMock.getSuggestions.mockResolvedValue({
      data: {
        workspaceId: '11111111-1111-1111-1111-111111111111',
        month: 5,
        year: 2026,
        suggestedIncome: 20000,
        suggestedExpense: 4000,
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
    expect(wrapper.text()).toContain('Create baseline')
    expect(budgetServiceMock.getSuggestions).toHaveBeenCalledTimes(1)

    const generateButton = wrapper.findAll('button').find((btn) => btn.text().includes('Generate Suggested Budget'))
    expect(generateButton).toBeTruthy()
    await generateButton!.trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Suggested Budget')
    expect(budgetServiceMock.getSuggestions).toHaveBeenCalledTimes(2)

    const numberInputs = wrapper.findAll('input[type="number"]')
    expect(numberInputs.length).toBeGreaterThan(0)

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
    budgetServiceMock.list
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({
        data: [
          {
            id: 'manual-budget-1',
            workspaceId: '11111111-1111-1111-1111-111111111111',
            periodMonth: 5,
            periodYear: 2026,
            status: 'ACTIVE',
            totalIncome: 9000,
            totalExpense: 0,
            net: 9000,
            lines: [{ id: 'line-1', category: 'Manual net baseline', type: 'INCOME', plannedAmount: 9000 }],
          },
        ],
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

    const manualButton = wrapper.findAll('button').find((btn) => btn.text().includes('Create Manually'))
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
    budgetServiceMock.list
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({
        data: [
          {
            id: 'manual-budget-1',
            workspaceId: '11111111-1111-1111-1111-111111111111',
            periodMonth: 5,
            periodYear: 2026,
            status: 'ACTIVE',
            totalIncome: 0,
            totalExpense: 1200,
            net: -1200,
            lines: [{ id: 'line-1', category: 'Manual net baseline', type: 'EXPENSE', plannedAmount: 1200 }],
          },
        ],
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

    const manualButton = wrapper.findAll('button').find((btn) => btn.text().includes('Create Manually'))
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

  it('shows the OpenFinance baseline source even when no suggestion lines are available', async () => {
    budgetServiceMock.list.mockResolvedValue({
      data: [
        {
          id: 'manual-budget-1',
          workspaceId: '11111111-1111-1111-1111-111111111111',
          periodMonth: 5,
          periodYear: 2026,
          status: 'ACTIVE',
          totalIncome: 5000,
          totalExpense: 0,
          net: 5000,
          lines: [{ id: 'line-1', category: 'Manual net baseline', type: 'INCOME', plannedAmount: 5000 }],
        },
      ],
    })
    budgetServiceMock.getSuggestions.mockResolvedValue({
      data: {
        workspaceId: '11111111-1111-1111-1111-111111111111',
        month: 5,
        year: 2026,
        suggestedIncome: 0,
        suggestedExpense: 0,
        net: 0,
        lines: [],
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

    expect(wrapper.text()).toContain('Real baseline from OpenFinance')
    expect(wrapper.text()).toContain('No editable suggestions are ready yet')
    const generateButton = wrapper.findAll('button').find((btn) => btn.text().includes('Generate Real Baseline'))
    expect(generateButton?.attributes('disabled')).toBeUndefined()
  })

  it('generates a consolidated OpenFinance baseline through the dedicated endpoint', async () => {
    budgetServiceMock.list
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({
        data: [
          {
            id: 'of-budget-1',
            workspaceId: '11111111-1111-1111-1111-111111111111',
            periodMonth: 5,
            periodYear: 2026,
            status: 'ACTIVE',
            totalIncome: 10000,
            totalExpense: 3000,
            net: 7000,
            lines: [
              { id: 'line-1', category: 'OpenFinance Aggregated Expense', type: 'EXPENSE', plannedAmount: 3000 },
              { id: 'line-2', category: 'OpenFinance Aggregated Income', type: 'INCOME', plannedAmount: 10000 },
            ],
          },
        ],
      })
    budgetServiceMock.getSuggestions.mockResolvedValue({
      data: {
        workspaceId: '11111111-1111-1111-1111-111111111111',
        month: 5,
        year: 2026,
        suggestedIncome: 0,
        suggestedExpense: 0,
        net: 0,
        lines: [],
      },
    })
    budgetServiceMock.generateBaseline.mockResolvedValue({
      data: {
        budgetId: 'of-budget-1',
        month: 5,
        year: 2026,
        incomeTotal: 10000,
        expenseTotal: 3000,
        netAmount: 7000,
        source: 'OPEN_FINANCE_AGGREGATED',
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

    const generateBaselineButton = wrapper.findAll('button').find((btn) => btn.text().includes('Generate Real Baseline'))
    expect(generateBaselineButton).toBeTruthy()
    await generateBaselineButton!.trigger('click')
    await flushPromises()

    expect(budgetServiceMock.generateBaseline).toHaveBeenCalledTimes(1)
    expect(wrapper.text()).toContain('OpenFinance baseline activated.')
    expect(wrapper.text()).toContain('OpenFinance consolidated baseline')
  })
})
