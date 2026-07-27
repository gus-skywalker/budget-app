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
})
