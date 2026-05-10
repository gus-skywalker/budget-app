import type { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import {
  getDevQuickAccessWorkspaceDetails,
  isDevQuickAccessEnabled,
  listDevQuickAccessWorkspaces
} from '@/utils/devQuickAccess'

const budgetApiBaseUrl = String(import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '')

const buildUrl = (url?: string, baseURL?: string) => {
  const resolvedBase = String(baseURL || budgetApiBaseUrl || 'http://localhost').replace(/\/+$/, '')
  return new URL(String(url || ''), `${resolvedBase}/`)
}

const isAbsoluteUrl = (url?: string) => /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(String(url || ''))

export const isBudgetApiRequest = (config: AxiosRequestConfig): boolean => {
  if (!isDevQuickAccessEnabled()) return false

  const rawUrl = String(config.url || '')
  if (!rawUrl) return false

  if (isAbsoluteUrl(rawUrl)) {
    return rawUrl.startsWith(budgetApiBaseUrl)
  }

  return true
}

const createBillingSummaryResponse = (workspaceId?: string) => {
  const workspaces = listDevQuickAccessWorkspaces()
  return {
    workspaceId: workspaceId || workspaces[0]?.workspaceId || null,
    hasPremiumAccess: false,
    hasPlanAccess: false,
    subscriptionStatus: 'NONE',
    currentPlanTier: 'FREE',
    currentBillingCycle: 'MONTHLY',
    currentPlanId: undefined,
    trialEndsAt: undefined,
    nextBillingDate: undefined,
    paymentProviderReachable: false,
    subscriptionDataSource: 'LOCAL_FALLBACK',
    workspaceQuota: {
      hasBillingAccount: false,
      activeWorkspaceCount: workspaces.length,
      activeCollaborativeWorkspaceCount: workspaces.length,
      activePersonalWorkspaceCount: 0
    },
    checkedAt: new Date().toISOString()
  }
}

const todayIso = () => new Date().toISOString().split('T')[0]

const daysAgoIso = (days: number) => {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString().split('T')[0]
}

const openFinanceAccount = () => ({
  id: 'dev-of-account-nubank-1',
  name: 'Nubank - Conta PJ',
  institution: 'Nubank',
  institutionName: 'Nubank',
  institutionKey: 'nubank',
  bankCode: '260',
  balance: 8420.35,
  currency: 'BRL',
  provider: 'OPEN_FINANCE',
  accountType: 'CHECKING',
  type: 'CHECKING'
})

const devTransactions = () => {
  const account = openFinanceAccount()
  return [
    {
      id: 'dev-of-tx-1',
      date: todayIso(),
      description: 'Recebimento PIX Cliente Alpha',
      amount: 3250,
      direction: 'INFLOW',
      category: 'Receitas',
      accountId: account.id,
      accountName: account.name,
      status: 'POSTED',
      visibilityScope: 'WORKSPACE',
      source: 'OPEN_FINANCE',
      openFinance: true,
      openFinanceRawStatus: 'POSTED',
      openFinanceBankCategoryId: 'pix-received',
      reconciliationStatus: 'MATCHED',
      reconciliationMatchedBy: 'DEV_MOCK',
      reconciliationConflictReason: null
    },
    {
      id: 'dev-of-tx-2',
      date: daysAgoIso(2),
      description: 'Pagamento fornecedor infraestrutura',
      amount: 780.45,
      direction: 'OUTFLOW',
      category: 'Operacional',
      accountId: account.id,
      accountName: account.name,
      status: 'POSTED',
      visibilityScope: 'WORKSPACE',
      source: 'OPEN_FINANCE',
      openFinance: true,
      openFinanceRawStatus: 'POSTED',
      openFinanceBankCategoryId: 'supplier-payment',
      reconciliationStatus: 'PENDING_REVIEW',
      reconciliationMatchedBy: null,
      reconciliationConflictReason: null
    },
    {
      id: 'dev-of-tx-3',
      date: daysAgoIso(5),
      description: 'Assinatura software financeiro',
      amount: 129.9,
      direction: 'OUTFLOW',
      category: 'Software',
      accountId: account.id,
      accountName: account.name,
      status: 'POSTED',
      visibilityScope: 'WORKSPACE',
      source: 'OPEN_FINANCE',
      openFinance: true,
      openFinanceRawStatus: 'POSTED',
      openFinanceBankCategoryId: 'software',
      reconciliationStatus: 'MATCHED',
      reconciliationMatchedBy: 'DEV_MOCK',
      reconciliationConflictReason: null
    },
    {
      id: 'dev-of-tx-4',
      date: daysAgoIso(8),
      description: 'Tarifa pacote de serviços',
      amount: 42.5,
      direction: 'OUTFLOW',
      category: 'Tarifas bancárias',
      accountId: account.id,
      accountName: account.name,
      status: 'POSTED',
      visibilityScope: 'WORKSPACE',
      source: 'OPEN_FINANCE',
      openFinance: true,
      openFinanceRawStatus: 'POSTED',
      openFinanceBankCategoryId: 'bank-fee',
      reconciliationStatus: 'MATCHED',
      reconciliationMatchedBy: 'DEV_MOCK',
      reconciliationConflictReason: null
    }
  ]
}

const filterTransactions = (config: AxiosRequestConfig) => {
  const fromDate = String(config.params?.fromDate || '')
  const toDate = String(config.params?.toDate || '')
  const accountId = String(config.params?.accountId || '')

  return devTransactions().filter((transaction) => {
    if (fromDate && transaction.date < fromDate) return false
    if (toDate && transaction.date > toDate) return false
    if (accountId && transaction.accountId !== accountId) return false
    return true
  })
}

const createPagedTransactionsResponse = (config: AxiosRequestConfig) => {
  const limit = Number(config.params?.limit || 20)
  const offset = Number(config.params?.offset || 0)
  const items = filterTransactions(config)

  return {
    items: items.slice(offset, offset + limit),
    total: items.length,
    limit,
    offset
  }
}

const createDashboardResponse = () => {
  const transactions = devTransactions()
  return {
    totalBalance: openFinanceAccount().balance,
    monthlyIncome: transactions
      .filter((transaction) => transaction.direction === 'INFLOW')
      .reduce((total, transaction) => total + transaction.amount, 0),
    monthlyExpenses: transactions
      .filter((transaction) => transaction.direction === 'OUTFLOW')
      .reduce((total, transaction) => total + transaction.amount, 0),
    recentTransactions: transactions,
    topCategories: ['Operacional', 'Software', 'Tarifas bancárias']
  }
}

const createMonthOverviewResponse = () => ({
  totalIncome: 3250,
  totalExpense: 952.85
})

const createDashboardChartResponse = () => ({
  labels: [daysAgoIso(8), daysAgoIso(5), daysAgoIso(2), todayIso()],
  datasets: [
    { label: 'Income', data: [0, 0, 0, 3250] },
    { label: 'Expenses', data: [42.5, 129.9, 780.45, 0] }
  ]
})

const createObservabilitySummary = () => ({
  pendingSyncCount: 0,
  lastSyncAt: null,
  lastSuccessfulSyncAt: null,
  lastFailedSyncAt: null,
  connectedInstitutions: 0,
  conflictsOpen: 0,
  connectedAccounts: 1,
  importedTransactions: devTransactions().length,
  categoryMappings: 0,
  openConflicts: 0,
  accountsAtRateLimitToday: 0,
  lastSyncedAt: new Date().toISOString(),
  lastSyncFrom: daysAgoIso(30),
  lastSyncTo: todayIso(),
  lastSyncTrigger: 'MANUAL'
})

const createOpenFinanceSyncResponse = () => ({
  from: daysAgoIso(30),
  to: todayIso(),
  accountsCreated: 1,
  accountsUpdated: 1,
  transactionsCreated: devTransactions().length,
  transactionsUpdated: 0,
  limitsUpserted: 0,
  metadataUpserted: 1,
  accountsSkippedDueToRateLimit: 0,
  reconciliationConflicts: 0
})

const createOpenFinanceSyncExecutionResponse = () => ({
  status: 'EXECUTED',
  reason: null,
  lastSyncAt: new Date().toISOString(),
  nextAvailableAt: null,
  remainingQuota: 9,
  result: createOpenFinanceSyncResponse()
})

const createOpenFinanceSyncHistory = () => {
  const sync = createOpenFinanceSyncResponse()
  return [{
    id: 'dev-of-sync-1',
    syncFrom: sync.from,
    syncTo: sync.to,
    accountsCreated: sync.accountsCreated,
    accountsUpdated: sync.accountsUpdated,
    transactionsCreated: sync.transactionsCreated,
    transactionsUpdated: sync.transactionsUpdated,
    limitsUpserted: sync.limitsUpserted,
    metadataUpserted: sync.metadataUpserted,
    accountsSkippedDueToRateLimit: sync.accountsSkippedDueToRateLimit,
    reconciliationConflicts: sync.reconciliationConflicts,
    trigger: 'MANUAL',
    status: 'SUCCESS',
    errorSummary: null,
    createdAt: new Date().toISOString()
  }]
}

const readJsonBody = (data: unknown) => {
  if (!data) return {}
  if (typeof data === 'string') {
    try {
      return JSON.parse(data)
    } catch {
      return {}
    }
  }
  return typeof data === 'object' ? data as Record<string, any> : {}
}

const maskDocument = (value: unknown) => {
  const digits = String(value || '').replace(/\D/g, '')
  return digits ? `${'*'.repeat(Math.max(0, digits.length - 4))}${digits.slice(-4)}` : null
}

const maskAccount = (value: unknown) => {
  const digits = String(value || '').replace(/\D/g, '')
  return digits ? `****${digits.slice(-4)}` : null
}

const createOpenFinanceConnection = (payload: Record<string, any> = {}) => {
  const now = new Date().toISOString()
  const institutionName = String(payload.institutionName || 'Nubank')
  const institutionKey = String(payload.institutionKey || 'nubank')

  return {
    id: `dev-open-finance-${institutionKey}`,
    provider: 'DEV_MOCK',
    institutionKey,
    institutionName,
    bankCode: String(payload.bankCode || '260'),
    status: 'CONNECTED',
    accessScope: 'ACCOUNTS_TRANSACTIONS',
    sharingPolicy: 'WORKSPACE',
    consentStatus: 'AUTHORIZED_READY',
    payerDocumentType: payload.payerDocumentType || 'CNPJ',
    payerName: payload.payerName || 'Empresa de teste',
    payerDocumentMasked: maskDocument(payload.payerDocument),
    accountNumberMasked: maskAccount(payload.accountNumber),
    displayName: payload.displayName || institutionName,
    connectedByUserId: null,
    connectedByRole: null,
    authorizationLink: null,
    authorizationLinkExpiresAt: null,
    lastProviderStatus: 'AUTHORIZED',
    lastProviderStatusCheckedAt: now,
    openfinanceId: null,
    openfinanceLink: null,
    statementType: payload.statementType || 'BANK',
    cardNumber: payload.cardNumber || null,
    linkedAccountsCount: 1,
    lastErrorSummary: null,
    connectedAt: now,
    readyForSyncAt: now,
    lastSyncedAt: null,
    lastSyncFrom: null,
    lastSyncTo: null
  }
}

const createAccount = () => openFinanceAccount()

const buildDataForRequest = (config: AxiosRequestConfig) => {
  const url = buildUrl(config.url, config.baseURL)
  const path = url.pathname
  const method = String(config.method || 'get').toLowerCase()

  if (path === '/billing/access') {
    return createBillingSummaryResponse(String(config.params?.workspaceId || ''))
  }

  if (path.startsWith('/billing/operations/')) {
    return {
      messageId: path.split('/').pop() || 'dev-message-id',
      messageType: 'DEV_MOCK',
      messageVersion: '1',
      correlationId: 'dev-correlation-id',
      status: 'DISPATCHED',
      attempts: 1,
      lastError: null,
      redirectUrl: null,
      resolvedCurrency: 'BRL',
      resolvedPriceId: null
    }
  }

  if (path.startsWith('/billing/subscriptions/')) {
    return {
      messageId: 'dev-message-id',
      correlationId: 'dev-correlation-id',
      status: 'ACCEPTED'
    }
  }

  if (path === '/notifications') {
    return []
  }

  if (path.startsWith('/notifications/')) {
    return { success: true }
  }

  if (path === '/activity') {
    return []
  }

  if (path === '/accounts') {
    return method === 'get' ? [createAccount()] : createAccount()
  }

  if (path.startsWith('/accounts/')) {
    return createAccount()
  }

  if (path === '/transactions') {
    return createPagedTransactionsResponse(config)
  }

  if (path.startsWith('/transactions/') && path.endsWith('/attachments')) {
    return []
  }

  if (path.startsWith('/transactions/') && path.includes('/attachments/') && path.endsWith('/download')) {
    return new Blob([], { type: 'application/octet-stream' })
  }

  if (path.startsWith('/transactions/') && path.endsWith('/comments')) {
    return method === 'post'
      ? {
          id: `dev-comment-${Date.now()}`,
          body: String((config.data as any)?.body || ''),
          createdAt: new Date().toISOString()
        }
      : []
  }

  if (path.startsWith('/transactions/')) {
    const transaction = devTransactions().find((item) => item.id === path.split('/')[2])
    if (transaction) return transaction

    return {
      id: path.split('/')[2] || 'dev-transaction',
      amount: 0,
      description: 'Mock transaction',
      direction: 'OUTCOME',
      occurredOn: new Date().toISOString().split('T')[0]
    }
  }

  if (path === '/dashboard') {
    return createDashboardResponse()
  }

  if (path === '/dashboard/chart') {
    return createDashboardChartResponse()
  }

  if (path === '/dashboard/overview') {
    return createMonthOverviewResponse()
  }

  if (path === '/categories' || path === '/categories/translated') {
    return []
  }

  if (path === '/payment-methods/translated') {
    return []
  }

  if (path.startsWith('/open-finance/observability/summary')) {
    return createObservabilitySummary()
  }

  if (path === '/open-finance/connections') {
    return method === 'post'
      ? createOpenFinanceConnection(readJsonBody(config.data))
      : [createOpenFinanceConnection()]
  }

  if (path.startsWith('/open-finance/connections/')) {
    if (path.endsWith('/sync')) {
      return createOpenFinanceSyncExecutionResponse()
    }

    return createOpenFinanceConnection(readJsonBody(config.data))
  }

  if (path.startsWith('/open-finance/sync/history')) {
    return createOpenFinanceSyncHistory()
  }

  if (path === '/open-finance/sync') {
    return createOpenFinanceSyncResponse()
  }

  if (
    path.startsWith('/open-finance/categories') ||
    path.startsWith('/open-finance/category-mappings') ||
    path.startsWith('/open-finance/reconciliation/conflicts')
  ) {
    return []
  }

  if (path.startsWith('/open-finance/')) {
    return { success: true }
  }

  if (path === '/financial-goals') {
    return []
  }

  if (path.startsWith('/financial-goals/suggest-goals')) {
    return []
  }

  if (path.startsWith('/financial-goals/')) {
    return { success: true }
  }

  if (path === '/workspaces') {
    return listDevQuickAccessWorkspaces()
  }

  if (path.startsWith('/workspaces/') && path.endsWith('/members')) {
    return []
  }

  if (path.startsWith('/workspaces/')) {
    const workspaceId = path.split('/')[2]
    return getDevQuickAccessWorkspaceDetails(workspaceId) || { workspaceId, workspaceName: workspaceId }
  }

  if (method === 'get') {
    return []
  }

  return { success: true }
}

export const buildBudgetApiMockResponse = async (
  config: InternalAxiosRequestConfig
): Promise<AxiosResponse> => ({
  data: buildDataForRequest(config),
  status: 200,
  statusText: 'OK',
  headers: {
    'x-dev-quick-access': 'budget-api-mock'
  },
  config
})
