import { afterEach, describe, expect, it, vi } from 'vitest'
import ExpenseService from '@/services/ExpenseService'
import FinancialReadService from '@/services/FinancialReadService'

describe('ExpenseService daily analysis integration', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('uses the canonical transaction date range to filter the list by a selected day', async () => {
    const fetchTransactions = vi.spyOn(FinancialReadService, 'fetchTransactionsByDirection')
      .mockResolvedValue({ items: [], total: 0, limit: 20, offset: 0 })

    await ExpenseService.fetchMonthlyExpenses(7, 2026, {
      day: '2026-07-24',
      limit: 20,
      offset: 0,
    })

    expect(fetchTransactions).toHaveBeenCalledWith(expect.objectContaining({
      direction: 'OUTFLOW',
      fromDate: '2026-07-24',
      toDate: '2026-07-24',
      limit: 20,
      offset: 0,
    }))
  })

  it('preserves a report scope when Transactions receives a report drill-down handoff', async () => {
    const fetchTransactions = vi.spyOn(FinancialReadService, 'fetchTransactionsByDirection')
      .mockResolvedValue({ items: [], total: 0, limit: 20, offset: 0 })

    await ExpenseService.fetchMonthlyExpenses(7, 2026, {
      reportScope: 'WORKSPACE_SHARED',
    })

    expect(fetchTransactions).toHaveBeenCalledWith(expect.objectContaining({
      reportScope: 'WORKSPACE_SHARED',
    }))
  })

  it('loads only aggregated daily values for the selected monthly period', async () => {
    const fetchSummary = vi.spyOn(FinancialReadService, 'fetchTransactionDailySummary')
      .mockResolvedValue({ data: { days: [] } } as never)

    await ExpenseService.fetchDailyExpenseSummary(7, 2026, {
      accountId: '2712bb2c-66c7-4f36-a1fb-3c016646b4ab',
      categoryId: 7,
      uncategorized: false,
    })

    expect(fetchSummary).toHaveBeenCalledWith({
      fromDate: '2026-07-01',
      toDate: '2026-07-31',
      accountId: '2712bb2c-66c7-4f36-a1fb-3c016646b4ab',
      categoryId: 7,
      uncategorized: false,
    })
  })
})
