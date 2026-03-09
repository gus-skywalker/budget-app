import axiosInterceptor from './axiosInterceptor'
import FinancialReadService, { getMonthDateRange } from './FinancialReadService'
import type { TransactionAttachmentListItem, TransactionRequest, TransactionView } from '@/types/financialRead'

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/expenses`

const toPositiveAmount = (value: unknown) => {
  const amount = Number(value)
  if (Number.isNaN(amount)) {
    return 0
  }
  return Math.abs(amount)
}

const toCategoryObject = (categoryName: string | null) => {
  if (!categoryName) {
    return null
  }
  return {
    id: null,
    code: categoryName,
    name: categoryName,
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
  category: toCategoryObject(transaction.category),
  categoryId: null,
  paymentMethod: null,
  paymentMethodId: null,
  users: [],
  attachments: [],
  alerts: [],
  group: null,
  groupId: null,
  status: transaction.status,
  accountId: transaction.accountId,
  accountName: transaction.accountName,
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
      },
    ],
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
      payload.append('kind', 'RECEIPT')
      return FinancialReadService.uploadTransactionAttachment(expenseId, payload, config)
    })
    await Promise.all(uploads)

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
    pagination: { limit?: number; offset?: number } = {}
  ): Promise<any> {
    const { fromDate, toDate } = getMonthDateRange(monthNumber, year)

    return FinancialReadService.fetchTransactionsByDirection({
      direction: 'OUTFLOW',
      fromDate,
      toDate,
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
