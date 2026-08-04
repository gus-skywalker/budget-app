import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/services/ExpenseService', () => ({
  default: { delete: vi.fn() },
}))

import ExpenseService from '@/services/ExpenseService'
import TransactionsView from '@/views/TransactionsView.vue'

const methods = (TransactionsView as any).methods

describe('TransactionsView delete dialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('closes the dialog after a successful transaction deletion', async () => {
    vi.mocked(ExpenseService.delete).mockResolvedValue({})
    const context: any = {
      deleteTransactionDialog: {
        show: true,
        transaction: { id: 'expense-1', description: 'Lunch' },
        kind: 'expense',
        deleting: false,
      },
      monthlyExpenses: [{ id: 'expense-1' }, { id: 'expense-2' }],
      monthlyIncomes: [],
      batchExpenseCategorySuggestions: { 'expense-1': { id: 'suggestion-1' } },
      fetchMonthlyTransactionSummary: vi.fn(),
      showToast: vi.fn(),
      $t: (key: string) => key,
      closeDeleteTransactionDialog: methods.closeDeleteTransactionDialog,
    }

    await methods.confirmDeleteTransaction.call(context)

    expect(ExpenseService.delete).toHaveBeenCalledWith('expense-1')
    expect(context.monthlyExpenses).toEqual([{ id: 'expense-2' }])
    expect(context.deleteTransactionDialog).toEqual({
      show: false,
      transaction: null,
      kind: null,
      deleting: false,
    })
    expect(context.showToast).toHaveBeenCalledWith('transactions.delete_dialog.success', 'success')
  })
})
