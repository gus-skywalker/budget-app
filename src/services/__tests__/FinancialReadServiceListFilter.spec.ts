import { afterEach, describe, expect, it, vi } from 'vitest'
import axiosInterceptor from '@/services/axiosInterceptor'
import FinancialReadService from '@/services/FinancialReadService'
import { matchesExpenseRouteScope, matchesTransactionListScope } from '@/utils/transactionListScope'
import type { TransactionView } from '@/types/financialRead'

const transaction = (id: string, direction: 'INFLOW' | 'OUTFLOW', visibilityScope: 'PRIVATE' | 'WORKSPACE'): TransactionView => ({
  id,
  date: '2026-10-04',
  description: id,
  amount: 10,
  direction,
  category: null,
  accountId: 'account-1',
  accountName: 'Account',
  status: 'POSTED',
  visibilityScope,
})

describe('filtered transaction pagination', () => {
  afterEach(() => vi.restoreAllMocks())

  it('filters before applying the requested page offset', async () => {
    const items = [
      transaction('other-direction', 'OUTFLOW', 'PRIVATE'),
      transaction('private-1', 'INFLOW', 'PRIVATE'),
      transaction('workspace', 'INFLOW', 'WORKSPACE'),
      transaction('private-2', 'INFLOW', 'PRIVATE'),
    ]
    const get = vi.spyOn(axiosInterceptor, 'get').mockResolvedValue({ data: { items, total: items.length } } as never)

    const page = await FinancialReadService.fetchTransactionsByDirection({
      direction: 'INFLOW',
      fromDate: '2026-10-01',
      toDate: '2026-10-31',
      clientFilter: (item) => matchesTransactionListScope(item, 'private'),
      limit: 1,
      offset: 1,
    })

    expect(page.items.map((item) => item.id)).toEqual(['private-2'])
    expect(page.total).toBe(2)
    expect(page.offset).toBe(1)
    expect(get.mock.calls[0][1]?.params).not.toHaveProperty('clientFilter')
  })

  it('combines conflict and drill-down matching without losing mapped conflicts', () => {
    const expense = { ...transaction('expense-1', 'OUTFLOW', 'WORKSPACE'), categoryId: 7, categoryName: 'Food' }
    expect(matchesTransactionListScope(expense, 'conflicts', ['expense-1'])).toBe(true)
    expect(matchesExpenseRouteScope(expense, { accountId: 'account-1', category: 'Food' })).toBe(true)
    expect(matchesExpenseRouteScope(expense, { accountId: 'other', category: 'Food' })).toBe(false)
  })
})
