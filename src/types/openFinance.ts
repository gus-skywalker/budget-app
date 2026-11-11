export interface OpenFinanceSyncRequest {
  connectionId?: string
  from: string
  to: string
  providerProtocolId?: string | null
}

export interface OpenFinanceStartConnectionRequest {
  holderId?: string | null
  institutionKey: string
  institutionName?: string
  bankCode: string
  payerDocument?: string | null
  payerDocumentType?: 'CPF' | 'CNPJ' | null
  payerName?: string | null
  displayName?: string | null
  agency?: string | null
  agencyDigit?: string | null
  accountNumber?: string | null
  accountNumberDigit?: string | null
  accountType?: string | null
  statementType: 'BANK' | 'CREDIT_CARD'
  cardNumber?: string | null
  street?: string | null
  neighborhood?: string | null
  addressNumber?: string | null
  addressComplement?: string | null
  city?: string | null
  state?: string | null
  zipcode?: string | null
  email?: string | null
}

export interface OpenFinanceHolder {
  id: string
  provider?: string | null
  documentType: 'CPF' | 'CNPJ'
  documentMasked?: string | null
  name: string
  email?: string | null
  phone?: string | null
  street?: string | null
  neighborhood?: string | null
  addressNumber?: string | null
  addressComplement?: string | null
  city?: string | null
  state?: string | null
  zipcode?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

export interface OpenFinanceHolderRequest {
  documentType: 'CPF' | 'CNPJ'
  documentNumber?: string | null
  name: string
  email?: string | null
  phone?: string | null
  street?: string | null
  neighborhood?: string | null
  addressNumber?: string | null
  addressComplement?: string | null
  city?: string | null
  state?: string | null
  zipcode?: string | null
}

export interface OpenFinanceHolderLookupRequest {
  documentType: 'CPF' | 'CNPJ'
  documentNumber: string
}

export interface OpenFinanceHolderLookupResponse {
  holder: OpenFinanceHolder | null
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
  providerProtocolId?: string | null
  processing?: boolean
  providerStatus?: string | null
  providerReason?: string | null
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
  lastSyncTrigger: 'MANUAL' | 'AUTOMATIC' | null
}

export interface OpenFinanceConnection {
  id: string
  provider: string | null
  holderId?: string | null
  institutionKey: string
  institutionName: string
  bankCode?: string | null
  status: 'NOT_CONNECTED' | 'PENDING_CONSENT' | 'CONNECTED' | 'ERROR'
  accessScope: string | null
  sharingPolicy: string | null
  planningSharingLevel?: 'PRIVATE' | 'PLANNING_IMPACT_ONLY' | 'PERSONAL_SHARED' | null
  consentStatus: string | null
  payerDocumentType: 'CPF' | 'CNPJ' | null
  payerName?: string | null
  payerDocumentMasked?: string | null
  accountNumberMasked?: string | null
  displayName: string | null
  connectedByUserId: string | null
  connectedByRole: string | null
  authorizationLink?: string | null
  authorizationLinkExpiresAt?: string | null
  lastProviderStatus?: string | null
  lastProviderStatusCheckedAt?: string | null
  openfinanceId: string | null
  openfinanceLink: string | null
  statementType: 'BANK' | 'CREDIT_CARD' | null
  cardNumber: string | null
  linkedAccountsCount: number
  lastErrorSummary: string | null
  connectedAt: string | null
  readyForSyncAt: string | null
  lastSyncedAt: string | null
  lastSyncFrom: string | null
  lastSyncTo: string | null
}

export interface OpenFinanceCreditCard {
  cardNumber: string | null
  additionalCards: string | null
  availableCreditLimit: string | null
  creditLimit: string | null
}

export interface OpenFinanceSyncExecutionResponse {
  status: string
  reason: string | null
  lastSyncAt: string | null
  nextAvailableAt: string | null
  remainingQuota: number | null
  providerProtocolId?: string | null
  providerStatus?: string | null
  providerReason?: string | null
  result: OpenFinanceSyncResponse | null
}

export interface OpenFinanceSyncHistoryItem {
  id: string
  connectionId?: string | null
  connectionDisplayName?: string | null
  institutionName?: string | null
  accountNumberMasked?: string | null
  payerDocumentType?: 'CPF' | 'CNPJ' | null
  syncFrom: string
  syncTo: string
  fetchedCount?: number
  accountsCreated: number
  accountsUpdated: number
  transactionsCreated: number
  transactionsUpdated: number
  providerDuplicateCount?: number
  localDuplicateCount?: number
  limitsUpserted: number
  metadataUpserted: number
  accountsSkippedDueToRateLimit: number
  reconciliationConflicts: number
  trigger: 'MANUAL' | 'AUTOMATIC'
  status: 'SUCCESS' | 'PROCESSING' | 'FAILED'
  errorCategory?: string | null
  errorSummary: string | null
  providerProtocolId?: string | null
  startedAt?: string | null
  finishedAt?: string | null
  durationMs?: number | null
  createdAt: string
}
