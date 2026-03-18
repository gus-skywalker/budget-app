export interface OpenFinanceSyncRequest {
  from: string
  to: string
}

export interface OpenFinanceSyncResponse {
  from: string
  to: string
  accountsCreated: number
  accountsUpdated: number
  transactionsCreated: number
  transactionsUpdated: number
  limitsUpserted: number
  metadataUpserted: number
  accountsSkippedDueToRateLimit: number
  reconciliationConflicts: number
}

export interface OpenFinanceConflict {
  id: string
  existingTransactionId: string
  resolvedTransactionId: string | null
  remoteTransactionId: string
  accountExternalId: string
  description: string
  transactionDate: string
  amount: number
  rawStatus: string | null
  bankCategoryId: string | null
  conflictReason: string | null
  status: 'OPEN' | 'RESOLVED_KEEP_EXISTING' | 'RESOLVED_CREATE_NEW'
  createdAt: string
}

export interface OpenFinanceBankCategory {
  id: string
  name: string
  parentId: string | null
}

export interface OpenFinanceCategoryMapping {
  id: string
  bankCategoryId: string
  categoryId: number
  updatedAt: string
}

export interface OpenFinanceObservabilitySummary {
  connectedAccounts: number
  importedTransactions: number
  categoryMappings: number
  openConflicts: number
  accountsAtRateLimitToday: number
  lastSyncedAt: string | null
  lastSyncFrom: string | null
  lastSyncTo: string | null
}

export interface OpenFinanceConnection {
  id: string
  institutionKey: string
  institutionName: string
  status: 'NOT_CONNECTED' | 'PENDING_CONSENT' | 'CONNECTED' | 'ERROR'
  linkedAccountsCount: number
  lastErrorSummary: string | null
  connectedAt: string | null
  lastSyncedAt: string | null
  lastSyncFrom: string | null
  lastSyncTo: string | null
}

export interface OpenFinanceSyncHistoryItem {
  id: string
  syncFrom: string
  syncTo: string
  accountsCreated: number
  accountsUpdated: number
  transactionsCreated: number
  transactionsUpdated: number
  limitsUpserted: number
  metadataUpserted: number
  accountsSkippedDueToRateLimit: number
  reconciliationConflicts: number
  status: 'SUCCESS' | 'FAILED'
  errorSummary: string | null
  createdAt: string
}
