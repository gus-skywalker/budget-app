import { describe, it, expect, beforeEach, vi } from 'vitest'
import { config, mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { ref } from 'vue'
import PlanningBudgetView from '@/views/PlanningBudgetView.vue'

const { routerPush, budgetServiceMock, openFinanceServiceMock, billingOrchestrationServiceMock } = vi.hoisted(() => ({
  routerPush: vi.fn(),
  budgetServiceMock: {
    list: vi.fn(),
    getCurrent: vi.fn(),
    getSuggestions: vi.fn(),
    generateBaseline: vi.fn(),
    createFromSuggestion: vi.fn(),
    create: vi.fn(),
    addLine: vi.fn(),
    deleteBudget: vi.fn(),
    activate: vi.fn(),
  },
  openFinanceServiceMock: {
    listConnections: vi.fn(),
  },
  billingOrchestrationServiceMock: {
    getBillingSummary: vi.fn(),
  },
}))

vi.mock('vue-router', () => ({
  createRouter: () => ({
    beforeEach: vi.fn(),
    afterEach: vi.fn(),
    push: routerPush,
  }),
  createWebHistory: () => ({}),
  useRouter: () => ({
    push: routerPush,
  }),
}))

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    locale: ref('pt'),
    t: (key: string, params?: Record<string, unknown>) => {
      const messages: Record<string, string> = {
        'planning.budget.create_baseline': 'Create baseline',
        'planning.budget.suggested_from_transactions': 'Suggested budget from transactions',
        'planning.budget.generate_suggested_budget': 'Generate Suggested Budget',
        'planning.budget.suggested_budget': 'Suggested Budget',
        'planning.budget.activate_this_plan': 'Activate This Plan',
        'planning.budget.suggested_budget_activated': 'Budget activated from recent financial activity.',
        'planning.budget.real_baseline_openfinance': 'Real baseline from OpenFinance',
        'planning.budget.generate_real_baseline': 'Generate Real Baseline',
        'planning.budget.generate_real_no_data': 'There is an OpenFinance connection, but no visible posted totals for this period or recent average yet.',
        'planning.budget.generate_real_no_connection': 'No shared/synced OpenFinance connection is available to generate the real baseline.',
        'planning.budget.generate_real_sharing_disabled': 'OpenFinance planning sharing is currently disabled.',
        'planning.budget.real_baseline_activated': 'OpenFinance baseline activated.',
        'planning.budget.source_openfinance': 'OpenFinance baseline',
        'planning.budget.title_openfinance_baseline': 'OpenFinance consolidated baseline',
        'planning.budget.active_baseline_snapshot': 'This OpenFinance baseline is a saved monthly snapshot.',
        'planning.budget.active_baseline_sharing_disabled': 'OpenFinance planning sharing is currently disabled. This baseline remains available as the last saved snapshot, but new recalculations from this source are blocked until planning impact sharing is enabled again.',
        'planning.budget.suggestion_message_unavailable': 'No editable suggestions are ready yet',
        'planning.budget.suggestion_message_synced_no_data': 'There is an OpenFinance connection, but no visible posted transactions yet to build editable suggestions.',
        'planning.budget.consolidated_message_ready': 'Create the official planning baseline as a forecast monthly net.',
        'planning.budget.consolidated_message_connect': 'Connect or sync OpenFinance to create a real baseline from aggregated totals.',
        'planning.budget.consolidated_message_sharing_disabled': 'OpenFinance planning sharing is currently disabled.',
        'planning.budget.create_manually': 'Create Manually',
        'planning.budget.activate_quick_baseline': 'Activate Quick Baseline',
        'planning.budget.use_detailed_budget': 'Use Detailed Budget',
        'planning.budget.activate_detailed_budget': 'Activate Detailed Budget',
        'planning.budget.add_line': 'Add Line',
        'planning.budget.default_income_category': 'Income',
        'planning.budget.default_expense_category': 'Operations',
        'planning.budget.set_active': 'Set Active',
        'planning.budget.delete_baseline': 'Delete baseline',
        'planning.budget.delete_baseline_confirm_title': 'Delete baseline?',
        'planning.budget.delete_baseline_confirm_message': 'This version will no longer appear.',
        'planning.budget.baseline_deleted': 'Baseline deleted.',
        'planning.budget.delete_baseline_error': 'Could not delete baseline.',
      }
      return messages[key] || (params ? `${key} ${JSON.stringify(params)}` : key)
    },
  }),
  createI18n: () => ({
    global: {
      t: (key: string) => key,
    },
  }),
}))

vi.mock('@/services/BudgetService', () => ({
  default: budgetServiceMock,
}))

vi.mock('@/services/OpenFinanceService', () => ({
  default: openFinanceServiceMock,
}))

vi.mock('@/services/BillingOrchestrationService', () => ({
  default: billingOrchestrationServiceMock,
}))

vi.mock('@/plugins/userStore', () => ({
  useUserStore: () => ({
    isTenantAdmin: true,
    getCurrentWorkspaceId: '11111111-1111-1111-1111-111111111111',
    getPreferredWorkspaceId: '11111111-1111-1111-1111-111111111111',
    getWorkspaces: [{ workspaceId: '11111111-1111-1111-1111-111111111111' }],
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

if (!(globalThis as any).visualViewport) {
  ;(globalThis as any).visualViewport = {
    width: 1024,
    height: 768,
    offsetLeft: 0,
    offsetTop: 0,
    scale: 1,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }
}

config.global.stubs = {
  VNavigationDrawer: {
    props: ['modelValue'],
    template: '<aside v-if="modelValue"><slot /></aside>',
  },
  VDialog: {
    props: ['modelValue'],
    template: '<section v-if="modelValue"><slot /></section>',
  },
}

const flushPromises = async () => {
  await Promise.resolve()
  await new Promise((resolve) => setTimeout(resolve, 0))
}

describe('PlanningBudgetView suggestion flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    openFinanceServiceMock.listConnections.mockResolvedValue({ data: [] })
    billingOrchestrationServiceMock.getBillingSummary.mockResolvedValue({
      data: {
        hasPremiumAccess: true,
        capabilities: {
          planningIntelligenceEnabled: true,
          connectedFinanceEnabled: true,
          advancedToolsEnabled: true,
        },
      },
    })
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
    expect(wrapper.text()).toContain('Suggested budget from transactions')
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

  it('includes newly added detailed manual lines in the saved baseline totals', async () => {
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
            totalIncome: 3000,
            totalExpense: 1500,
            net: 1500,
            lines: [
              { id: 'line-1', category: 'Income', type: 'INCOME', plannedAmount: 3000 },
              { id: 'line-2', category: 'Operations', type: 'EXPENSE', plannedAmount: 1000 },
              { id: 'line-3', category: 'Operations', type: 'EXPENSE', plannedAmount: 500 },
            ],
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
    budgetServiceMock.create.mockResolvedValue({ data: { id: 'manual-budget-1' } })
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

    const detailedButton = wrapper.findAll('button').find((btn) => btn.text().includes('Use Detailed Budget'))
    expect(detailedButton).toBeTruthy()
    await detailedButton!.trigger('click')
    await flushPromises()

    let numberInputs = wrapper.findAll('input[type="number"]')
    await numberInputs[0].setValue('3000')
    await numberInputs[1].setValue('1000')
    await flushPromises()

    const addLineButton = wrapper.findAll('button').find((btn) => btn.text().includes('Add Line'))
    expect(addLineButton).toBeTruthy()
    await addLineButton!.trigger('click')
    await flushPromises()

    numberInputs = wrapper.findAll('input[type="number"]')
    await numberInputs[2].setValue('500')
    await flushPromises()

    const activateButton = wrapper.findAll('button').find((btn) => btn.text().includes('Activate Detailed Budget'))
    expect(activateButton).toBeTruthy()
    await activateButton!.trigger('click')
    await flushPromises()

    expect(budgetServiceMock.addLine).toHaveBeenCalledTimes(3)
    expect(budgetServiceMock.addLine).toHaveBeenNthCalledWith(1, 'manual-budget-1', {
      category: 'Income',
      type: 'INCOME',
      plannedAmount: 3000,
    })
    expect(budgetServiceMock.addLine).toHaveBeenNthCalledWith(2, 'manual-budget-1', {
      category: 'Operations',
      type: 'EXPENSE',
      plannedAmount: 1000,
    })
    expect(budgetServiceMock.addLine).toHaveBeenNthCalledWith(3, 'manual-budget-1', {
      category: 'Operations',
      type: 'EXPENSE',
      plannedAmount: 500,
    })
    expect(wrapper.text()).toContain('R$ 1.500,00')
  })

  it('opens editable suggestion lines when the API returns aggregate totals without category lines', async () => {
    budgetServiceMock.list.mockResolvedValue({ data: [] })
    budgetServiceMock.getSuggestions.mockResolvedValue({
      data: {
        workspaceId: '11111111-1111-1111-1111-111111111111',
        month: 5,
        year: 2026,
        suggestedIncome: 3000,
        suggestedExpense: 1500,
        net: 1500,
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

    const generateButton = wrapper.findAll('button').find((btn) => btn.text().includes('Generate Suggested Budget'))
    expect(generateButton).toBeTruthy()
    await generateButton!.trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Suggested Budget')
    expect(wrapper.text()).toContain('Income')
    expect(wrapper.text()).toContain('Operations')
    expect(wrapper.text()).not.toContain('planning.budget.generate_suggestion_no_data')
  })

  it('deletes an available inactive baseline from the list', async () => {
    const activeBudget = {
      id: 'active-budget-1',
      workspaceId: '11111111-1111-1111-1111-111111111111',
      periodMonth: 5,
      periodYear: 2026,
      status: 'ACTIVE',
      totalIncome: 5000,
      totalExpense: 0,
      net: 5000,
      lines: [{ id: 'line-1', category: 'Manual net baseline', type: 'INCOME', plannedAmount: 5000 }],
    }
    const inactiveBudget = {
      id: 'inactive-budget-1',
      workspaceId: '11111111-1111-1111-1111-111111111111',
      periodMonth: 5,
      periodYear: 2026,
      status: 'DRAFT',
      totalIncome: 3000,
      totalExpense: 1000,
      net: 2000,
      lines: [
        { id: 'line-2', category: 'Income', type: 'INCOME', plannedAmount: 3000 },
        { id: 'line-3', category: 'Operations', type: 'EXPENSE', plannedAmount: 1000 },
      ],
    }
    budgetServiceMock.list
      .mockResolvedValueOnce({ data: [activeBudget, inactiveBudget] })
      .mockResolvedValueOnce({ data: [activeBudget] })
    budgetServiceMock.getSuggestions.mockResolvedValue({
      data: {
        workspaceId: '11111111-1111-1111-1111-111111111111',
        month: 5,
        year: 2026,
        lines: [],
      },
    })
    budgetServiceMock.deleteBudget.mockResolvedValue({ status: 204 })

    const wrapper = mount(PlanningBudgetView, {
      global: {
        plugins: [vuetify],
        mocks: {
          $t: (key: string) => key,
        },
      },
    })

    await flushPromises()

    expect(wrapper.text()).toContain('R$ 2.000,00')
    const deleteButton = wrapper.findAll('button').find((btn) => btn.attributes('aria-label') === 'Delete baseline')
    expect(deleteButton).toBeTruthy()
    await deleteButton!.trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Delete baseline?')
    expect(budgetServiceMock.deleteBudget).not.toHaveBeenCalled()

    const confirmButton = wrapper.findAll('button').find((btn) => btn.text().includes('Delete baseline'))
    expect(confirmButton).toBeTruthy()
    await confirmButton!.trigger('click')
    await flushPromises()

    expect(budgetServiceMock.deleteBudget).toHaveBeenCalledWith('inactive-budget-1')
    expect(wrapper.text()).toContain('Baseline deleted.')
    expect(wrapper.text()).not.toContain('R$ 2.000,00')
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
    expect(wrapper.text()).toContain('This OpenFinance baseline is a saved monthly snapshot.')
  })

  it('explains that an existing OpenFinance baseline remains as a snapshot when planning sharing is disabled', async () => {
    budgetServiceMock.list.mockResolvedValue({
      data: [
        {
          id: 'of-budget-1',
          workspaceId: '11111111-1111-1111-1111-111111111111',
          periodMonth: 5,
          periodYear: 2026,
          status: 'ACTIVE',
          totalIncome: 1319.45,
          totalExpense: 1394.16,
          net: -74.71,
          lines: [
            { id: 'line-1', category: 'OpenFinance Aggregated Expense', type: 'EXPENSE', plannedAmount: 1394.16 },
            { id: 'line-2', category: 'OpenFinance Aggregated Income', type: 'INCOME', plannedAmount: 1319.45 },
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
    openFinanceServiceMock.listConnections.mockResolvedValue({
      data: [
        {
          id: 'connection-1',
          provider: 'TECNOSPEED',
          institutionKey: 'nubank',
          institutionName: 'Nubank',
          status: 'CONNECTED',
          accessScope: 'RESTRICTED',
          sharingPolicy: 'PRIVATE_ONLY',
          planningSharingLevel: 'PRIVATE',
          consentStatus: 'AUTHORIZED_READY',
          payerDocumentType: 'CPF',
          displayName: 'Nubank',
          connectedByUserId: 'owner-1',
          connectedByRole: 'ROLE_OWNER',
          openfinanceId: 'of-1',
          openfinanceLink: null,
          statementType: 'BANK',
          cardNumber: null,
          linkedAccountsCount: 1,
          lastErrorSummary: null,
          connectedAt: null,
          readyForSyncAt: null,
          lastSyncedAt: null,
          lastSyncFrom: null,
          lastSyncTo: null,
        },
      ],
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

    expect(wrapper.text()).toContain('This baseline remains available as the last saved snapshot')
    expect(wrapper.text()).toContain('planning impact sharing is enabled again')
    expect(wrapper.text()).toContain('OpenFinance planning sharing is currently disabled')
  })

  it('treats CNPJ shared OpenFinance connections as planning-visible', async () => {
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
    openFinanceServiceMock.listConnections.mockResolvedValue({
      data: [
        {
          id: 'connection-cnpj-1',
          provider: 'TECNOSPEED',
          institutionKey: 'nubank',
          institutionName: 'Nubank',
          status: 'CONNECTED',
          accessScope: 'WORKSPACE_SHARED',
          sharingPolicy: 'BUSINESS_SHARED',
          planningSharingLevel: null,
          consentStatus: 'AUTHORIZED_READY',
          payerDocumentType: 'CNPJ',
          displayName: 'Nubank',
          connectedByUserId: 'owner-1',
          connectedByRole: 'ROLE_OWNER',
          openfinanceId: 'of-1',
          openfinanceLink: null,
          statementType: 'BANK',
          cardNumber: null,
          linkedAccountsCount: 1,
          lastErrorSummary: null,
          connectedAt: null,
          readyForSyncAt: null,
          lastSyncedAt: null,
          lastSyncFrom: null,
          lastSyncTo: null,
        },
      ],
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
    expect(wrapper.text()).toContain('forecast monthly net')
    expect(wrapper.text()).not.toContain('OpenFinance planning sharing is currently disabled')
  })
})
