import axiosInterceptor from './axiosInterceptor'
import FinancialReadService, { getMonthDateRange } from './FinancialReadService'
import {
  normalizeTransactionVisibilityScope,
  toTransactionVisibilityScopeRequest,
  type TransactionAttachmentListItem,
  type TransactionRequest,
  type TransactionView,
} from '@/types/financialRead'

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/expenses`

const toPositiveAmount = (value: unknown) => {
  const amount = Number(value)
  if (Number.isNaN(amount)) {
    return 0
  }
  return Math.abs(amount)
}

const toPaymentMethodId = (value: unknown) =>
  typeof value === 'number' && Number.isFinite(value) ? value : null

const toCategoryObject = (transaction: TransactionView) => {
  const categoryName = transaction.categoryName ?? transaction.category ?? null
  const categoryCode = transaction.categoryCode ?? categoryName
  if (!categoryName && !transaction.categoryId) {
    return null
  }
  return {
    id: transaction.categoryId ?? null,
    code: categoryCode,
    name: categoryName,
    displayColor: transaction.categoryDisplayColor ?? null,
    displayIcon: transaction.categoryDisplayIcon ?? null,
  }
}

const mapAttachmentToLegacy = (attachment: TransactionAttachmentListItem) => ({
  id: attachment.id,
  fileName: attachment.fileName,
  name: attachment.fileName,
  fileType: null,
  fileData: null,
  createdAt: attachment.createdAt,
})

const mapTransactionToExpense = (transaction: TransactionView) => ({
  id: transaction.id,
  date: transaction.date,
  amount: Math.abs(transaction.amount),
  description: transaction.description,
  category: toCategoryObject(transaction),
  categoryId: transaction.categoryId ?? null,
  categorizationSource: transaction.categorizationSource ?? null,
  categorizationReason: transaction.categorizationReason ?? null,
  categorizationRuleId: transaction.categorizationRuleId ?? null,
  categorizedAt: transaction.categorizedAt ?? null,
  categorizedByUserId: transaction.categorizedByUserId ?? null,
  paymentMethod: transaction.paymentMethodId ?? transaction.paymentMethodName ?? null,
  paymentMethodId: transaction.paymentMethodId ?? null,
  paymentMethodName: transaction.paymentMethodName ?? null,
  users: [],
  attachments: [],
  group: null,
  groupId: null,
  status: transaction.status,
  source: transaction.source ?? null,
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

async function toExpenseTransactionRequest(data: any): Promise<TransactionRequest> {
  const accountId = await FinancialReadService.resolveAccountId(data?.accountId ?? null)

  return {
    transactionDate: data?.date,
    description: data?.description ?? '',
    source: 'MANUAL',
    status: 'POSTED',
    entries: [
      {
        accountId,
        direction: 'OUTFLOW',
        amount: toPositiveAmount(data?.amount),
        categoryId: data?.category ?? null,
        paymentMethodId: toPaymentMethodId(data?.paymentMethod),
        paymentMethodName: data?.paymentMethodName ?? null,
        categorizationSource: data?.categorizationSource ?? null,
        categorizationReason: data?.categorizationReason ?? null,
        categorizationRuleId: data?.categorizationRuleId ?? null,
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
    const payload = await toExpenseTransactionRequest(data)
    return FinancialReadService.createTransaction(payload)
  },
  async uploadAttachment(expenseId: string, formData: FormData, config: any = {}): Promise<any> {
    const files = formData.getAll('files')
    const uploads = files.map((file) => {
      const payload = new FormData()
      payload.append('file', file as Blob)
      payload.append('kind', 'PROOF_OF_PAYMENT')
      return FinancialReadService.uploadTransactionAttachment(expenseId, payload, config)
    })
    return Promise.all(uploads)
  },
  async listAttachments(expenseId: string): Promise<any> {
    const list = await FinancialReadService.listTransactionAttachments(expenseId)
    return {
      data: (list.data || []).map(mapAttachmentToLegacy),
    }
  },
  removeAttachment(expenseId: string, attachmentId: string): Promise<any> {
    return FinancialReadService.removeTransactionAttachment(expenseId, attachmentId)
  },
  downloadAttachment(expenseId: string, attachmentId: string): Promise<any> {
    return FinancialReadService.downloadTransactionAttachment(expenseId, attachmentId)
  },
  async update(id: string, data: any): Promise<any> {
    const payload = await toExpenseTransactionRequest(data)
    return FinancialReadService.updateTransaction(id, payload)
  },
  delete(id: string): Promise<any> {
    return FinancialReadService.deleteTransaction(id)
  },
  fetchMonthlyExpenses(
    monthNumber: number,
    year: number,
    pagination: { limit?: number; offset?: number; categoryId?: number; uncategorized?: boolean } = {}
  ): Promise<any> {
    const { fromDate, toDate } = getMonthDateRange(monthNumber, year)

    return FinancialReadService.fetchTransactionsByDirection({
      direction: 'OUTFLOW',
      fromDate,
      toDate,
      categoryId: pagination.categoryId,
      uncategorized: pagination.uncategorized,
      limit: pagination.limit,
      offset: pagination.offset,
    }).then((page) => ({
      data: {
        ...page,
        items: page.items.map(mapTransactionToExpense),
      },
    }))
  },
}
