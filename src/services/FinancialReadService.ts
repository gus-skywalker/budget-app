import axiosInterceptor from './axiosInterceptor'
import type {
  AccountView,
  DashboardView,
  PagedResponse,
  TransactionAttachmentListItem,
  TransactionCommentView,
  TransactionDirection,
  TransactionDailySummaryResponse,
  TransactionPeriodSummaryResponse,
  TransactionPlanningExclusionRequest,
  TransactionQueryParams,
  TransactionRequest,
  TransactionView,
} from '@/types/financialRead'

const API_URL = `${import.meta.env.VITE_API_BASE_URL}`
const DEFAULT_LIMIT = 20
const MAX_LIMIT = 200
export const NO_FINANCIAL_ACCOUNT_ERROR_MESSAGE = 'No financial account available to register transaction'

let accountsCache: AccountView[] | null = null

const clampLimit = (value?: number) => {
  if (!value || Number.isNaN(value)) {
    return DEFAULT_LIMIT
  }

  return Math.min(Math.max(Math.trunc(value), 1), MAX_LIMIT)
}

const clampOffset = (value?: number) => {
  if (!value || Number.isNaN(value) || value < 0) {
    return 0
  }

  return Math.trunc(value)
}

const buildTransactionParams = (params: TransactionQueryParams = {}) => ({
  ...(params.fromDate ? { fromDate: params.fromDate } : {}),
  ...(params.toDate ? { toDate: params.toDate } : {}),
  ...(params.accountId ? { accountId: params.accountId } : {}),
  ...(params.direction ? { direction: params.direction } : {}),
  ...(params.categoryId !== undefined ? { categoryId: params.categoryId } : {}),
  ...(params.uncategorized !== undefined ? { uncategorized: params.uncategorized } : {}),
  ...(params.excludedFromPlanning !== undefined ? { excludedFromPlanning: params.excludedFromPlanning } : {}),
  ...(params.visibilityScope ? { visibilityScope: params.visibilityScope } : {}),
  ...(params.reportScope ? { reportScope: params.reportScope } : {}),
  ...(params.periodMonth ? { periodMonth: params.periodMonth } : {}),
  ...(params.periodYear ? { periodYear: params.periodYear } : {}),
  limit: clampLimit(params.limit),
  offset: clampOffset(params.offset),
})

const buildTransactionFilterParams = (params: TransactionQueryParams = {}) => {
  const { limit: _limit, offset: _offset, ...filters } = buildTransactionParams(params)
  return filters
}

export const getMonthDateRange = (month: number, year: number) => {
  const fromDate = new Date(year, month - 1, 1)
  const toDate = new Date(year, month, 0)

  const toIsoDate = (value: Date) => value.toISOString().split('T')[0]

  return {
    fromDate: toIsoDate(fromDate),
    toDate: toIsoDate(toDate),
  }
}

async function fetchTransactionsByDirection({
  direction,
  ...params
}: TransactionQueryParams & { direction: TransactionDirection }): Promise<PagedResponse<TransactionView>> {
  const requestedLimit = clampLimit(params.limit)
  const requestedOffset = clampOffset(params.offset)
  const scanLimit = MAX_LIMIT
  let scanOffset = 0
  let filteredTotal = 0
  const collectedItems: TransactionView[] = []

  while (true) {
    const response = await axiosInterceptor.get<PagedResponse<TransactionView>>(`${API_URL}/transactions`, {
      params: buildTransactionParams({
        ...params,
        limit: scanLimit,
        offset: scanOffset,
      }),
    })

    const page = response.data
    const directionalItems = (page.items || []).filter((item) => item.direction === direction)
    const skipOnCurrentPage = Math.max(requestedOffset - filteredTotal, 0)

    filteredTotal += directionalItems.length

    if (skipOnCurrentPage < directionalItems.length && collectedItems.length < requestedLimit) {
      const remaining = requestedLimit - collectedItems.length
      collectedItems.push(...directionalItems.slice(skipOnCurrentPage, skipOnCurrentPage + remaining))
    }

    scanOffset += page.items.length

    if (scanOffset >= page.total || page.items.length === 0) {
      break
    }
  }

  return {
    items: collectedItems,
    total: filteredTotal,
    limit: requestedLimit,
    offset: requestedOffset,
  }
}

async function resolveAccountId(preferredAccountId?: string | null): Promise<string> {
  if (preferredAccountId) {
    return preferredAccountId
  }

  if (!accountsCache || accountsCache.length === 0) {
    const response = await axiosInterceptor.get<AccountView[]>(`${API_URL}/accounts`)
    accountsCache = response.data || []
  }

  const firstAccountId = accountsCache[0]?.id
  if (!firstAccountId) {
    throw new Error(NO_FINANCIAL_ACCOUNT_ERROR_MESSAGE)
  }
  return firstAccountId
}

export default {
  fetchAccounts() {
    return axiosInterceptor.get<AccountView[]>(`${API_URL}/accounts`).then((response) => {
      accountsCache = response.data || []
      return response
    })
  },

  fetchAccount(id: string) {
    return axiosInterceptor.get<AccountView>(`${API_URL}/accounts/${id}`).then((response) => {
      const current = accountsCache || []
      const withoutCurrent = current.filter((account) => account.id !== response.data.id)
      accountsCache = [...withoutCurrent, response.data]
      return response
    })
  },

  fetchTransactions(params: TransactionQueryParams = {}) {
    return axiosInterceptor.get<PagedResponse<TransactionView>>(`${API_URL}/transactions`, {
      params: buildTransactionParams(params),
    })
  },

  fetchTransaction(id: string) {
    return axiosInterceptor.get<TransactionView>(`${API_URL}/transactions/${id}`)
  },

  fetchTransactionDailySummary(params: TransactionQueryParams = {}) {
    return axiosInterceptor.get<TransactionDailySummaryResponse>(`${API_URL}/transactions/daily-summary`, {
      params: buildTransactionFilterParams(params),
    })
  },

  fetchTransactionPeriodSummary(params: TransactionQueryParams = {}) {
    return axiosInterceptor.get<TransactionPeriodSummaryResponse>(`${API_URL}/transactions/summary`, {
      params: buildTransactionFilterParams(params),
    })
  },

  createTransaction(payload: TransactionRequest) {
    return axiosInterceptor.post<TransactionView>(`${API_URL}/transactions`, payload)
  },

  updateTransaction(id: string, payload: TransactionRequest) {
    return axiosInterceptor.put<TransactionView>(`${API_URL}/transactions/${id}`, payload)
  },

  deleteTransaction(id: string) {
    return axiosInterceptor.delete(`${API_URL}/transactions/${id}`)
  },

  setPlanningExclusion(id: string, payload: TransactionPlanningExclusionRequest) {
    return axiosInterceptor.put<TransactionView>(`${API_URL}/transactions/${id}/planning-exclusion`, payload)
  },

  listTransactionAttachments(transactionId: string) {
    return axiosInterceptor.get<TransactionAttachmentListItem[]>(`${API_URL}/transactions/${transactionId}/attachments`)
  },

  uploadTransactionAttachment(transactionId: string, formData: FormData, config?: object) {
    return axiosInterceptor.post(`${API_URL}/transactions/${transactionId}/attachments`, formData, config)
  },

  removeTransactionAttachment(transactionId: string, attachmentId: string) {
    return axiosInterceptor.delete(`${API_URL}/transactions/${transactionId}/attachments/${attachmentId}`)
  },

  listTransactionComments(transactionId: string) {
    return axiosInterceptor.get<TransactionCommentView[]>(`${API_URL}/transactions/${transactionId}/comments`)
  },

  addTransactionComment(transactionId: string, body: string) {
    return axiosInterceptor.post<TransactionCommentView>(`${API_URL}/transactions/${transactionId}/comments`, { body })
  },

  downloadTransactionAttachment(transactionId: string, attachmentId: string) {
    return axiosInterceptor.get(`${API_URL}/transactions/${transactionId}/attachments/${attachmentId}/download`, {
      responseType: 'blob',
    })
  },

  fetchDashboard() {
    return axiosInterceptor.get<DashboardView>(`${API_URL}/dashboard`)
  },

  fetchTransactionsByDirection,
  resolveAccountId,
}
