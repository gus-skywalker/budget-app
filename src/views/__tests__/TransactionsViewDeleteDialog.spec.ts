import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/services/ExpenseService', () => ({
  default: { delete: vi.fn(), create: vi.fn(), update: vi.fn() },
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

  it('allows category-only edits to an Open Finance expense without a payment method', async () => {
    vi.mocked(ExpenseService.update).mockResolvedValue({})
    const payload = { category: 7, paymentMethod: null }
    const context: any = {
      expense: {
        date: '2026-09-04',
        amount: '121.76',
        category: 7,
        paymentMethod: null,
        paymentMethodName: null,
        openFinance: true,
      },
      isEditingExpense: true,
      editingExpenseId: 'open-finance-expense-1',
      normalizeDate: vi.fn().mockReturnValue('2026-09-04'),
      resolveCategoryId: vi.fn().mockReturnValue(7),
      resolvePaymentMethodId: vi.fn().mockReturnValue(null),
      ensureAccountSelected: vi.fn().mockReturnValue(true),
      buildExpensePayload: vi.fn().mockReturnValue(payload),
      handleExpenseSuggestionFeedback: vi.fn().mockReturnValue(null),
      resetExpenseForm: vi.fn(),
      fetchMonthlyExpenses: vi.fn(),
      fetchMonthlyTransactionSummary: vi.fn(),
      showToast: vi.fn(),
      $t: (key: string) => key,
    }

    methods.saveExpense.call(context)
    await Promise.resolve()
    await Promise.resolve()

    expect(ExpenseService.update).toHaveBeenCalledWith('open-finance-expense-1', payload)
    expect(context.showToast).toHaveBeenCalledWith('expense.updated_successfully', 'success')
    expect(context.showToast).not.toHaveBeenCalledWith('validation.required', 'warning')
  })
})
