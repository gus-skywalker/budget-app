import axiosInterceptor from './axiosInterceptor'
import FinancialReadService, { getMonthDateRange } from './FinancialReadService'
import {
  normalizeTransactionVisibilityScope,
  toTransactionVisibilityScopeRequest,
  type TransactionRequest,
  type TransactionView,
} from '@/types/financialRead'

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/incomes`

const toPositiveAmount = (value: unknown) => {
  const amount = Number(value)
  if (Number.isNaN(amount)) {
    return 0
  }
  return Math.abs(amount)
}

const toPaymentMethodId = (value: unknown) =>
  typeof value === 'number' && Number.isFinite(value) ? value : null

const mapTransactionToIncome = (transaction: TransactionView) => ({
  id: transaction.id,
  date: transaction.date,
  amount: Math.abs(transaction.amount),
  description: transaction.description,
  paymentMethod: transaction.paymentMethodId ?? transaction.paymentMethodName ?? null,
  paymentMethodId: transaction.paymentMethodId ?? null,
  paymentMethodName: transaction.paymentMethodName ?? null,
  isRecurring: false,
  status: transaction.status,
  source: transaction.source ?? 'MANUAL',
  accountId: transaction.accountId,
  accountName: transaction.accountName,
  openFinance: transaction.openFinance ?? false,
  excludedFromPlanning: transaction.excludedFromPlanning ?? false,
  openFinanceRawStatus: transaction.openFinanceRawStatus ?? null,
  openFinanceBankCategoryId: transaction.openFinanceBankCategoryId ?? null,
  reconciliationStatus: transaction.reconciliationStatus ?? null,
  reconciliationMatchedBy: transaction.reconciliationMatchedBy ?? null,
  reconciliationConflictReason: transaction.reconciliationConflictReason ?? null,
  visibilityScope: normalizeTransactionVisibilityScope(transaction.visibilityScope),
})

async function toIncomeTransactionRequest(data: any): Promise<TransactionRequest> {
  const accountId = await FinancialReadService.resolveAccountId(data?.accountId ?? null)

  return {
    transactionDate: data?.date,
    description: data?.description ?? '',
    source: 'MANUAL',
    status: 'POSTED',
    entries: [
      {
        accountId,
        direction: 'INFLOW',
        amount: toPositiveAmount(data?.amount),
        categoryId: null,
        paymentMethodId: toPaymentMethodId(data?.paymentMethod),
        paymentMethodName: data?.paymentMethodName ?? null,
      },
    ],
    visibilityScope: toTransactionVisibilityScopeRequest(data?.visibilityScope),
  }
}

export default {
  getAll(): Promise<any> {
    return axiosInterceptor.get(API_URL)
  },
  get(id: string): Promise<any> {
    return axiosInterceptor.get(`${API_URL}/${id}`)
  },
  async create(data: any): Promise<any> {
    const payload = await toIncomeTransactionRequest(data)
    return FinancialReadService.createTransaction(payload)
  },
  async update(id: string, data: any): Promise<any> {
    const payload = await toIncomeTransactionRequest(data)
    return FinancialReadService.updateTransaction(id, payload)
  },
  delete(id: string): Promise<any> {
    return FinancialReadService.deleteTransaction(id)
  },
  fetchMonthlyIncomes(month: number, year: number, pagination: { limit?: number; offset?: number } = {}): Promise<any> {
    const { fromDate, toDate } = getMonthDateRange(month, year)

    return FinancialReadService.fetchTransactionsByDirection({
      direction: 'INFLOW',
      fromDate,
      toDate,
      limit: pagination.limit,
      offset: pagination.offset,
    }).then((page) => ({
      data: {
        ...page,
        items: page.items.map(mapTransactionToIncome),
      },
    }))
  },
  toggleRecurring(id: string, months: number): Promise<any> {
    // Recurrence is not modeled in transaction API; keep UI flow by returning a resolved promise.
    return Promise.resolve({ data: { id, months } })
  },
}
