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

const createPagedTransactionsResponse = (config: AxiosRequestConfig) => ({
  items: [],
  total: 0,
  limit: Number(config.params?.limit || 20),
  offset: Number(config.params?.offset || 0)
})

const createDashboardResponse = () => ({
  totalBalance: 0,
  monthlyIncome: 0,
  monthlyExpense: 0,
  balanceTrend: [],
  expenseByCategory: [],
  incomeByCategory: []
})

const createObservabilitySummary = () => ({
  pendingSyncCount: 0,
  lastSyncAt: null,
  lastSuccessfulSyncAt: null,
  lastFailedSyncAt: null,
  connectedInstitutions: 0,
  conflictsOpen: 0
})

const createAccount = () => ({
  id: 'dev-account-1',
  name: 'Mock Account',
  institution: 'Mock Bank',
  balance: 0,
  currency: 'BRL',
  type: 'CHECKING'
})

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
    return {
      id: path.split('/')[2] || 'dev-transaction',
      amount: 0,
      description: 'Mock transaction',
      direction: 'OUTCOME',
      occurredOn: new Date().toISOString().split('T')[0]
    }
  }

  if (path === '/dashboard' || path === '/dashboard/overview') {
    return createDashboardResponse()
  }

  if (path === '/dashboard/chart') {
    return []
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

  if (
    path.startsWith('/open-finance/connections') ||
    path.startsWith('/open-finance/categories') ||
    path.startsWith('/open-finance/category-mappings') ||
    path.startsWith('/open-finance/reconciliation/conflicts') ||
    path.startsWith('/open-finance/sync/history')
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