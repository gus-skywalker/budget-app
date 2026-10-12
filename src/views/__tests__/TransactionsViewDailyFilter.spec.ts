import { afterEach, describe, expect, it, vi } from 'vitest'
import TransactionsView from '@/views/TransactionsView.vue'

const methods = (TransactionsView as any).methods
const computed = (TransactionsView as any).computed

describe('TransactionsView daily filter route integration', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('persists a selected day with the active month and existing filters', () => {
    const replace = vi.fn()
    methods.selectExpenseDay.call({
      selectedExpenseMonth: 7,
      selectedExpenseYear: 2026,
      $route: { query: { accountId: 'account-1' } },
      $router: { replace },
    }, '2026-07-25')

    expect(replace).toHaveBeenCalledWith({
      name: 'transactions',
      query: {
        accountId: 'account-1',
        month: '7',
        year: '2026',
        day: '2026-07-25',
      },
    })
  })

  it('removes a selected day when navigating to another expense month', () => {
    const replace = vi.fn()
    const context = {
      activeTab: 'expense',
      selectedExpenseMonth: 7,
      selectedExpenseYear: 2026,
      $route: { query: { month: '7', year: '2026', day: '2026-07-25', uncategorized: '1' } },
      $router: { replace },
    }

    methods.goToNextMonth.call(context)

    expect(context.selectedExpenseMonth).toBe(8)
    expect(replace).toHaveBeenCalledWith({
      name: 'transactions',
      query: { month: '8', year: '2026', uncategorized: '1' },
    })
  })

  it('represents the last seven calendar days and fills days without movement', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 6, 26, 12, 0, 0))

    const rows = computed.dailyConsumptionRows.call({
      selectedExpenseMonth: 7,
      selectedExpenseYear: 2026,
      dailyExpenseSummary: [
        { date: '2026-07-22', expenseAmount: 129.9, transactionCount: 2 },
        { date: '2026-07-26', expenseAmount: 35, transactionCount: 1 },
      ],
    })

    expect(rows).toHaveLength(7)
    expect(rows.map((row: any) => row.date)).toEqual([
      '2026-07-20',
      '2026-07-21',
      '2026-07-22',
      '2026-07-23',
      '2026-07-24',
      '2026-07-25',
      '2026-07-26',
    ])
    expect(rows[0]).toMatchObject({ total: 0, count: 0 })
    expect(rows[2]).toMatchObject({ total: 129.9, count: 2 })
  })

  it('renders the canonical aggregate instead of the loaded list page in the summary strip', () => {
    const summary = { incomeAmount: 900, expenseAmount: 640, netAmount: 260 }
    const monthlyIncomeTotal = computed.monthlyIncomeTotal.call({ monthlyTransactionSummary: summary })
    const monthlyExpenseTotal = computed.monthlyExpenseTotal.call({ monthlyTransactionSummary: summary })
    const monthlyNetTotal = computed.monthlyNetTotal.call({ monthlyTransactionSummary: summary })
    const items = computed.transactionSummaryItems.call({
      monthlyIncomeTotal,
      monthlyExpenseTotal,
      monthlyNetTotal,
      $i18n: { locale: 'pt' },
      $t: (key: string) => key,
    })

    expect(items[0].value).toContain('900')
    expect(items[2].value).toContain('640')
    expect(items[4].value).toContain('260')
  })

  it('keeps income and expense scope filters independent', () => {
    const context = {
      monthlyIncomes: [{ id: 1, visibility: 'PRIVATE' }],
      monthlyExpenses: [{ id: 2, visibility: 'WORKSPACE_SHARED' }],
      incomeListFilter: 'private',
      expenseListFilter: 'workspace',
      applyTransactionFilter: vi.fn((items: unknown[]) => items),
      applyExpenseDrillDown: vi.fn((items: unknown[]) => items),
    }

    computed.filteredMonthlyIncomes.call(context)
    computed.filteredMonthlyExpenses.call(context)

    expect(context.applyTransactionFilter).toHaveBeenNthCalledWith(1, context.monthlyIncomes, 'private')
    expect(context.applyTransactionFilter).toHaveBeenNthCalledWith(2, context.monthlyExpenses, 'workspace')
  })

  it('keeps manually selected scopes when only the route month changes', () => {
    const context: any = {
      selectedExpenseMonth: 10,
      selectedExpenseYear: 2026,
      incomeListFilter: 'workspace',
      expenseListFilter: 'private',
      hadRouteScopeFilter: false,
      $route: { query: { month: '11', year: '2026' } },
    }

    methods.applyBudgetQueryFilters.call(context)

    expect(context.selectedExpenseMonth).toBe(11)
    expect(context.incomeListFilter).toBe('workspace')
    expect(context.expenseListFilter).toBe('private')
  })

  it('applies explicit deep-link scope and clears it when removed', () => {
    const context: any = {
      selectedExpenseMonth: 10,
      selectedExpenseYear: 2026,
      incomeListFilter: 'all',
      expenseListFilter: 'all',
      hadRouteScopeFilter: false,
      $route: { query: { month: '10', year: '2026', visibility: 'private' } },
    }

    methods.applyBudgetQueryFilters.call(context)
    expect(context.incomeListFilter).toBe('private')
    expect(context.expenseListFilter).toBe('private')
    expect(context.hadRouteScopeFilter).toBe(true)

    context.$route.query = { month: '10', year: '2026' }
    methods.applyBudgetQueryFilters.call(context)
    expect(context.incomeListFilter).toBe('all')
    expect(context.expenseListFilter).toBe('all')
  })

  it('lets a manual scope replace the scope inherited from a deep link', () => {
    const replace = vi.fn()
    const context: any = {
      selectedExpenseMonth: 10,
      selectedExpenseYear: 2026,
      incomeListFilter: 'all',
      expenseListFilter: 'all',
      hadRouteScopeFilter: false,
      $route: { query: { month: '10', year: '2026', visibility: 'private' } },
      $router: { replace },
    }

    methods.applyBudgetQueryFilters.call(context)
    methods.selectListFilter.call(context, 'expense', 'workspace')
    expect(replace).toHaveBeenCalledWith({ name: 'transactions', query: { month: '10', year: '2026' } })

    context.$route.query = { month: '11', year: '2026' }
    methods.applyBudgetQueryFilters.call(context)
    expect(context.expenseListFilter).toBe('workspace')
  })

  it('resets only the selected list page when its scope changes', () => {
    const resetIncomePaginationAndFetch = vi.fn()
    const resetExpensePaginationAndFetch = vi.fn()
    const context: any = {
      incomeListFilter: 'all',
      expenseListFilter: 'all',
      hadRouteScopeFilter: false,
      resetIncomePaginationAndFetch,
      resetExpensePaginationAndFetch,
    }

    methods.selectListFilter.call(context, 'expense', 'private')
    expect(context.expenseListFilter).toBe('private')
    expect(resetExpensePaginationAndFetch).toHaveBeenCalledOnce()
    expect(resetIncomePaginationAndFetch).not.toHaveBeenCalled()

    methods.selectListFilter.call(context, 'income', 'workspace')
    expect(context.incomeListFilter).toBe('workspace')
    expect(resetIncomePaginationAndFetch).toHaveBeenCalledOnce()
  })

  it('advances and reverses pagination within the active list only', () => {
    const fetchMonthlyExpenses = vi.fn()
    const fetchMonthlyIncomes = vi.fn()
    const context: any = {
      expensePagination: { limit: 20, offset: 0, total: 42 },
      incomePagination: { limit: 20, offset: 0, total: 21 },
      canGoToNextExpensePage: true,
      canGoToPreviousExpensePage: true,
      canGoToNextIncomePage: true,
      fetchMonthlyExpenses,
      fetchMonthlyIncomes,
    }

    methods.goToNextExpensePage.call(context)
    expect(context.expensePagination.offset).toBe(20)
    expect(context.incomePagination.offset).toBe(0)
    expect(fetchMonthlyExpenses).toHaveBeenCalledOnce()

    methods.goToPreviousExpensePage.call(context)
    expect(context.expensePagination.offset).toBe(0)

    methods.goToNextIncomePage.call(context)
    expect(context.incomePagination.offset).toBe(20)
    expect(fetchMonthlyIncomes).toHaveBeenCalledOnce()
  })
})
