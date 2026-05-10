import axiosInterceptor from './axiosInterceptor'
import type {
  OpenFinanceBankCategory,
  OpenFinanceCategoryMapping,
  OpenFinanceConnection,
  OpenFinanceConflict,
  OpenFinanceObservabilitySummary,
  OpenFinanceStartConnectionRequest,
  OpenFinanceSyncExecutionResponse,
  OpenFinanceSyncHistoryItem,
  OpenFinanceSyncRequest,
  OpenFinanceSyncResponse,
} from '@/types/openFinance'
import { extractOpenFinanceErrorMessage, isTechnicalOpenFinanceError, sanitizeOpenFinanceMessage } from '@/utils/openFinanceErrors'

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/open-finance`

const maskDocument = (value: string) => {
  const digits = String(value || '').replace(/\D/g, '')
  return digits ? `${'*'.repeat(Math.max(0, digits.length - 4))}${digits.slice(-4)}` : null
}

const maskAccount = (value?: string | null) => {
  const digits = String(value || '').replace(/\D/g, '')
  return digits ? `****${digits.slice(-4)}` : null
}

const buildDevConnection = (payload: OpenFinanceStartConnectionRequest): OpenFinanceConnection => {
  const now = new Date().toISOString()
  return {
    id: `dev-open-finance-${payload.institutionKey}-${Date.now()}`,
    provider: 'DEV_MOCK',
    institutionKey: payload.institutionKey,
    institutionName: payload.institutionName || payload.institutionKey,
    bankCode: payload.bankCode,
    status: 'CONNECTED',
    accessScope: 'ACCOUNTS_TRANSACTIONS',
    sharingPolicy: 'WORKSPACE',
    consentStatus: 'AUTHORIZED_READY',
    payerDocumentType: payload.payerDocumentType,
    payerName: payload.payerName,
    payerDocumentMasked: maskDocument(payload.payerDocument),
    accountNumberMasked: maskAccount(payload.accountNumber),
    displayName: payload.displayName || payload.institutionName || payload.institutionKey,
    connectedByUserId: null,
    connectedByRole: null,
    authorizationLink: null,
    authorizationLinkExpiresAt: null,
    lastProviderStatus: 'AUTHORIZED',
    lastProviderStatusCheckedAt: now,
    openfinanceId: null,
    openfinanceLink: null,
    statementType: payload.statementType,
    cardNumber: payload.cardNumber || null,
    linkedAccountsCount: 1,
    lastErrorSummary: null,
    connectedAt: now,
    readyForSyncAt: now,
    lastSyncedAt: null,
    lastSyncFrom: null,
    lastSyncTo: null,
  }
}

export default {
  sync(payload: OpenFinanceSyncRequest) {
    return axiosInterceptor.post<OpenFinanceSyncResponse>(`${API_URL}/sync`, payload)
  },

  listConnections() {
    return axiosInterceptor.get<OpenFinanceConnection[]>(`${API_URL}/connections`)
  },

  async startConnection(payload: OpenFinanceStartConnectionRequest): Promise<any> {
    try {
      return await axiosInterceptor.post<OpenFinanceConnection>(`${API_URL}/connections`, payload)
    } catch (error: any) {
      const message = extractOpenFinanceErrorMessage(error, '')
      const rawMessage = error?.response?.data?.message || error?.response?.data || error?.message
      if (import.meta.env.DEV && (isTechnicalOpenFinanceError(rawMessage) || !message)) {
        return {
          data: buildDevConnection(payload),
          status: 200,
          statusText: 'OK',
          headers: { 'x-open-finance-dev-fallback': 'true' },
          config: error?.config,
        }
      }
      throw error
    }
  },

  confirmConsent(institutionKey: string) {
    return axiosInterceptor.post<OpenFinanceConnection>(`${API_URL}/connections/${encodeURIComponent(institutionKey)}/confirm-consent`)
  },

  refreshConnectionStatus(connectionId: string) {
    return axiosInterceptor.post<OpenFinanceConnection>(`${API_URL}/connections/${connectionId}/refresh-status`)
  },

  retryAuthorization(connectionId: string) {
    return axiosInterceptor.post<OpenFinanceConnection>(`${API_URL}/connections/${connectionId}/retry-authorization`)
  },

  syncConnection(connectionId: string, payload: OpenFinanceSyncRequest) {
    return axiosInterceptor.post<OpenFinanceSyncExecutionResponse>(`${API_URL}/connections/${connectionId}/sync`, payload)
  },

  disconnectConnection(connectionId: string) {
    return axiosInterceptor.delete<OpenFinanceConnection>(`${API_URL}/connections/${encodeURIComponent(connectionId)}`)
  },

  listBankCategories() {
    return axiosInterceptor.get<OpenFinanceBankCategory[]>(`${API_URL}/categories`)
  },

  listCategoryMappings() {
    return axiosInterceptor.get<OpenFinanceCategoryMapping[]>(`${API_URL}/category-mappings`)
  },

  upsertCategoryMapping(bankCategoryId: string, categoryId: number, reprocessExistingTransactions = false) {
    return axiosInterceptor.put<OpenFinanceCategoryMapping>(`${API_URL}/category-mappings`, {
      bankCategoryId,
      categoryId,
      reprocessExistingTransactions,
    })
  },

  deleteCategoryMapping(bankCategoryId: string, reprocessExistingTransactions = false) {
    return axiosInterceptor.delete(`${API_URL}/category-mappings/${encodeURIComponent(bankCategoryId)}`, {
      params: {
        reprocessExistingTransactions,
      },
    })
  },

  listReconciliationConflicts() {
    return axiosInterceptor.get<OpenFinanceConflict[]>(`${API_URL}/reconciliation/conflicts`)
  },

  getObservabilitySummary() {
    return axiosInterceptor.get<OpenFinanceObservabilitySummary>(`${API_URL}/observability/summary`)
  },

  listSyncHistory(limit = 10): Promise<any> {
    return axiosInterceptor.get<OpenFinanceSyncHistoryItem[]>(`${API_URL}/sync/history`, {
      params: { limit },
    }).then((response) => ({
      ...response,
      data: (response.data || []).map((item) => ({
        ...item,
        errorSummary: item.errorSummary
          ? sanitizeOpenFinanceMessage(item.errorSummary, 'Falha técnica no provedor de Open Finance. Tente sincronizar novamente mais tarde.')
          : item.errorSummary,
      })),
    }))
  },

  resolveKeepExisting(conflictId: string) {
    return axiosInterceptor.post<OpenFinanceConflict>(`${API_URL}/reconciliation/conflicts/${conflictId}/resolve/keep-existing`)
  },

  resolveCreateNew(conflictId: string) {
    return axiosInterceptor.post<OpenFinanceConflict>(`${API_URL}/reconciliation/conflicts/${conflictId}/resolve/create-new`)
  }
}
