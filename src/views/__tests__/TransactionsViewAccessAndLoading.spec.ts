import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/services/IncomeService', () => ({
  default: { fetchMonthlyIncomes: vi.fn() },
}))
vi.mock('@/services/ExpenseService', () => ({
  default: { fetchMonthlyExpenses: vi.fn() },
}))

import IncomeService from '@/services/IncomeService'
import ExpenseService from '@/services/ExpenseService'
import FinancialReadService from '@/services/FinancialReadService'
import TransactionsView from '@/views/TransactionsView.vue'

const methods = (TransactionsView as any).methods

const listContext = () => ({
  selectedIncomeMonth: 10,
  selectedIncomeYear: 2026,
  selectedExpenseMonth: 10,
  selectedExpenseYear: 2026,
  incomePagination: { limit: 20, offset: 0, total: 0 },
  expensePagination: { limit: 20, offset: 0, total: 0 },
  incomeListRequestId: 0,
  expenseListRequestId: 0,
  isLoadingIncomes: false,
  isLoadingExpenses: false,
  incomesLoadFailed: false,
  expensesLoadFailed: false,
  monthlyIncomes: [],
  monthlyExpenses: [],
  openFinanceConflicts: [],
  routeExpenseCategoryId: null,
  routeExpenseUncategorized: false,
  routeExpenseDay: null,
  routeExpenseReportScope: null,
  normalizeCollection: (page: any) => page.content || [],
  enrichIncomeWithConflict: (item: any) => item,
  enrichExpenseWithConflict: (item: any) => item,
  loadSharedExpenseAgreements: vi.fn().mockResolvedValue(undefined),
})

describe('TransactionsView access and list loading', () => {
  beforeEach(() => vi.clearAllMocks())

  it('does not open a writing form for a read-only workspace', () => {
    const context: any = {
      canWriteCurrentWorkspace: false,
      closeTransactionDetails: vi.fn(),
      formMode: 'expense',
      showFormDrawer: false,
    }

    methods.openFormDrawer.call(context, 'income')

    expect(context.showFormDrawer).toBe(false)
    expect(context.closeTransactionDetails).not.toHaveBeenCalled()
  })

  it('keeps a failed income request distinct from an empty month and recovers on retry', async () => {
    const context: any = listContext()
    vi.mocked(IncomeService.fetchMonthlyIncomes)
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce({ data: { content: [{ id: 'income-1' }], total: 1, limit: 20, offset: 0 } } as any)
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    await methods.fetchMonthlyIncomes.call(context)
    expect(context.incomesLoadFailed).toBe(true)
    expect(context.isLoadingIncomes).toBe(false)
    expect(context.monthlyIncomes).toEqual([])

    await methods.fetchMonthlyIncomes.call(context)
    expect(context.incomesLoadFailed).toBe(false)
    expect(context.monthlyIncomes).toEqual([{ id: 'income-1' }])
    expect(context.incomePagination.total).toBe(1)
    errorSpy.mockRestore()
  })

  it('ignores an older expense response after the displayed month changes', async () => {
    const context: any = listContext()
    let resolveFirst: (value: any) => void = () => {}
    vi.mocked(ExpenseService.fetchMonthlyExpenses)
      .mockImplementationOnce(() => new Promise((resolve) => { resolveFirst = resolve }) as any)
      .mockResolvedValueOnce({ data: { content: [{ id: 'new-month' }], total: 1, limit: 20, offset: 0 } } as any)

    const first = methods.fetchMonthlyExpenses.call(context)
    context.selectedExpenseMonth = 11
    await methods.fetchMonthlyExpenses.call(context)
    resolveFirst({ data: { content: [{ id: 'old-month' }], total: 1, limit: 20, offset: 0 } })
    await first

    expect(context.monthlyExpenses).toEqual([{ id: 'new-month' }])
    expect(context.expensesLoadFailed).toBe(false)
    expect(context.isLoadingExpenses).toBe(false)
  })

  it('marks period totals unavailable on failure and restores them after retry', async () => {
    const context: any = {
      activeTab: 'income',
      selectedIncomeMonth: 10,
      selectedIncomeYear: 2026,
      transactionSummaryRequestId: 0,
      transactionSummaryLoadFailed: false,
      isLoadingTransactionSummary: false,
      monthlyTransactionSummary: { incomeAmount: 0, expenseAmount: 0, netAmount: 0 },
      monthlyForecastSummary: { incomeAmount: 0, expenseAmount: 0, netAmount: 0 },
    }
    const response = { data: { incomeAmount: 100, expenseAmount: 20, netAmount: 80 } }
    const fetchSpy = vi.spyOn(FinancialReadService, 'fetchTransactionPeriodSummary')
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(response as any)
      .mockResolvedValueOnce(response as any)
      .mockResolvedValueOnce(response as any)
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    await methods.fetchMonthlyTransactionSummary.call(context)
    expect(context.transactionSummaryLoadFailed).toBe(true)
    expect(context.isLoadingTransactionSummary).toBe(false)

    await methods.fetchMonthlyTransactionSummary.call(context)
    expect(context.transactionSummaryLoadFailed).toBe(false)
    expect(context.monthlyTransactionSummary).toEqual({ incomeAmount: 100, expenseAmount: 20, netAmount: 80 })
    fetchSpy.mockRestore()
    errorSpy.mockRestore()
  })
})
