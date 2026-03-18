export interface AccountView {
  id: string
  name: string
  provider: string
  accountType: string
  currency: string
  balance: number
}

export type TransactionDirection = 'INFLOW' | 'OUTFLOW'
export type TransactionSource = 'MANUAL' | 'OPEN_FINANCE' | 'SYSTEM'
export type TransactionStatus = 'PENDING' | 'POSTED' | 'CANCELLED'

export interface TransactionView {
  id: string
  date: string
  description: string
  amount: number
  direction: TransactionDirection
  category: string | null
  accountId: string | null
  accountName: string | null
  status: string
  source?: TransactionSource
  openFinance?: boolean
  openFinanceRawStatus?: string | null
  openFinanceBankCategoryId?: string | null
  reconciliationStatus?: string | null
  reconciliationMatchedBy?: string | null
  reconciliationConflictReason?: string | null
}

export interface LedgerEntryRequest {
  accountId: string
  direction: TransactionDirection
  amount: number
  categoryId?: number | null
}

export interface TransactionRequest {
  transactionDate: string
  description: string
  source?: TransactionSource
  status?: TransactionStatus
  externalId?: string | null
  entries: LedgerEntryRequest[]
}

export interface TransactionAttachmentListItem {
  id: string
  fileName: string
  kind: string | null
  sizeBytes: number
  createdAt: string
}

export interface DashboardView {
  totalBalance: number
  monthlyIncome: number
  monthlyExpenses: number
  recentTransactions: TransactionView[]
  topCategories: string[]
}

export interface PagedResponse<T> {
  items: T[]
  total: number
  limit: number
  offset: number
}

export interface TransactionQueryParams {
  fromDate?: string
  toDate?: string
  accountId?: string
  limit?: number
  offset?: number
}
