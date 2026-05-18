import axiosInterceptor from './axiosInterceptor'
import type {
  OpenFinanceBankCategory,
  OpenFinanceCategoryMapping,
  OpenFinanceConnection,
  OpenFinanceConflict,
  OpenFinanceHolder,
  OpenFinanceHolderLookupRequest,
  OpenFinanceHolderLookupResponse,
  OpenFinanceHolderRequest,
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

const devHolders: OpenFinanceHolder[] = []

const buildDevConnection = (payload: OpenFinanceStartConnectionRequest): OpenFinanceConnection => {
  const now = new Date().toISOString()
  return {
    id: `dev-open-finance-${payload.institutionKey}-${Date.now()}`,
    provider: 'DEV_MOCK',
    holderId: payload.holderId || null,
    institutionKey: payload.institutionKey,
    institutionName: payload.institutionName || payload.institutionKey,
    bankCode: payload.bankCode,
    status: 'CONNECTED',
    accessScope: 'ACCOUNTS_TRANSACTIONS',
    sharingPolicy: 'PRIVATE_ONLY',
    planningSharingLevel: 'PRIVATE',
    consentStatus: 'AUTHORIZED_READY',
    payerDocumentType: payload.payerDocumentType || null,
    payerName: payload.payerName || null,
    payerDocumentMasked: maskDocument(payload.payerDocument || ''),
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

const todayIso = () => new Date().toISOString().split('T')[0]

const daysAgoIso = (days: number) => {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString().split('T')[0]
}

const buildDevSyncResponse = (payload?: Partial<OpenFinanceSyncRequest>): OpenFinanceSyncResponse => ({
  from: payload?.from || daysAgoIso(30),
  to: payload?.to || todayIso(),
  accountsCreated: 1,
  accountsUpdated: 1,
  transactionsCreated: 4,
  transactionsUpdated: 0,
  limitsUpserted: 0,
  metadataUpserted: 1,
  accountsSkippedDueToRateLimit: 0,
  reconciliationConflicts: 0,
  providerProtocolId: 'dev-protocol-001',
  processing: false,
  providerStatus: null,
  providerReason: null,
})

const buildDevSyncExecutionResponse = (payload?: Partial<OpenFinanceSyncRequest>): OpenFinanceSyncExecutionResponse => ({
  status: 'EXECUTED',
  reason: null,
  lastSyncAt: new Date().toISOString(),
  nextAvailableAt: null,
  remainingQuota: 9,
  providerProtocolId: 'dev-protocol-001',
  providerStatus: null,
  providerReason: null,
  result: buildDevSyncResponse(payload),
})

const buildDevSyncHistory = (limit = 10): OpenFinanceSyncHistoryItem[] => {
  const sync = buildDevSyncResponse()
  const item: OpenFinanceSyncHistoryItem = {
    id: 'dev-of-sync-success',
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
    providerProtocolId: sync.providerProtocolId,
    createdAt: new Date().toISOString(),
  }
  return [item].slice(0, limit)
}

const shouldUseDevSyncFallback = (items: OpenFinanceSyncHistoryItem[]) => {
  if (!import.meta.env.DEV) return false
  if (!items.length) return true
  return items.every((item) => item.status === 'FAILED' && isTechnicalOpenFinanceError(item.errorSummary || ''))
}

export default {
  async sync(payload: OpenFinanceSyncRequest): Promise<any> {
    try {
      return await axiosInterceptor.post<OpenFinanceSyncResponse>(`${API_URL}/sync`, payload)
    } catch (error: any) {
      const rawMessage = error?.response?.data?.message || error?.response?.data || error?.message
      if (import.meta.env.DEV && isTechnicalOpenFinanceError(rawMessage)) {
        return {
          data: buildDevSyncResponse(payload),
          status: 200,
          statusText: 'OK',
          headers: { 'x-open-finance-dev-fallback': 'true' },
          config: error?.config,
        }
      }
      throw error
    }
  },

  listConnections(): Promise<any> {
    return axiosInterceptor.get<OpenFinanceConnection[]>(`${API_URL}/connections`).then((response) => ({
      ...response,
      data: (response.data || []).map((connection) => ({
        ...connection,
        lastErrorSummary: connection.lastErrorSummary
          ? sanitizeOpenFinanceMessage(connection.lastErrorSummary, 'Falha técnica no provedor de Open Finance. Tente sincronizar novamente mais tarde.')
          : connection.lastErrorSummary,
      })),
    }))
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

  listHolders(documentType: 'CPF' | 'CNPJ'): Promise<any> {
    if (import.meta.env.DEV && !API_URL) {
      return Promise.resolve({ data: devHolders.filter((holder) => holder.documentType === documentType) })
    }
    return axiosInterceptor.get<OpenFinanceHolder[]>(`${API_URL}/holders`, {
      params: { documentType },
    })
  },

  lookupHolder(payload: OpenFinanceHolderLookupRequest): Promise<any> {
    if (import.meta.env.DEV && !API_URL) {
      return Promise.resolve({
        data: {
          holder: null,
        },
      })
    }
    return axiosInterceptor.post<OpenFinanceHolderLookupResponse>(`${API_URL}/holders/lookup`, payload)
  },

  createHolder(payload: OpenFinanceHolderRequest): Promise<any> {
    if (import.meta.env.DEV && !API_URL) {
      const holder: OpenFinanceHolder = {
        id: `dev-holder-${Date.now()}`,
        provider: 'DEV_MOCK',
        documentType: payload.documentType,
        documentMasked: maskDocument(payload.documentNumber || ''),
        name: payload.name,
        email: payload.email || null,
        phone: payload.phone || null,
        street: payload.street || null,
        neighborhood: payload.neighborhood || null,
        addressNumber: payload.addressNumber || null,
        addressComplement: payload.addressComplement || null,
        city: payload.city || null,
        state: payload.state || null,
        zipcode: payload.zipcode || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      devHolders.push(holder)
      return Promise.resolve({ data: holder })
    }
    return axiosInterceptor.post<OpenFinanceHolder>(`${API_URL}/holders`, payload)
  },

  updateHolder(holderId: string, payload: OpenFinanceHolderRequest): Promise<any> {
    if (import.meta.env.DEV && !API_URL) {
      const index = devHolders.findIndex((holder) => holder.id === holderId)
      if (index >= 0) {
        devHolders[index] = {
          ...devHolders[index],
          name: payload.name,
          email: payload.email || null,
          phone: payload.phone || null,
          street: payload.street || null,
          neighborhood: payload.neighborhood || null,
          addressNumber: payload.addressNumber || null,
          addressComplement: payload.addressComplement || null,
          city: payload.city || null,
          state: payload.state || null,
          zipcode: payload.zipcode || null,
          updatedAt: new Date().toISOString(),
        }
      }
      return Promise.resolve({ data: devHolders[index] })
    }
    return axiosInterceptor.put<OpenFinanceHolder>(`${API_URL}/holders/${encodeURIComponent(holderId)}`, payload)
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

  updatePlanningSharing(connectionId: string, sharingLevel: 'PRIVATE' | 'PLANNING_IMPACT_ONLY' | 'PERSONAL_SHARED') {
    return axiosInterceptor.patch<OpenFinanceConnection>(`${API_URL}/connections/${connectionId}/planning-sharing`, {
      sharingLevel,
    })
  },

  async syncConnection(connectionId: string, payload: OpenFinanceSyncRequest): Promise<any> {
    try {
      return await axiosInterceptor.post<OpenFinanceSyncExecutionResponse>(`${API_URL}/connections/${connectionId}/sync`, payload)
    } catch (error: any) {
      const rawMessage = error?.response?.data?.message || error?.response?.data || error?.message
      if (import.meta.env.DEV && isTechnicalOpenFinanceError(rawMessage)) {
        return {
          data: buildDevSyncExecutionResponse(payload),
          status: 200,
          statusText: 'OK',
          headers: { 'x-open-finance-dev-fallback': 'true' },
          config: error?.config,
        }
      }
      throw error
    }
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
    }).then((response) => {
      const items = response.data || []
      const data = shouldUseDevSyncFallback(items)
        ? buildDevSyncHistory(limit)
        : items.map((item) => ({
        ...item,
        errorSummary: item.errorSummary
          ? sanitizeOpenFinanceMessage(item.errorSummary, 'Falha técnica no provedor de Open Finance. Tente sincronizar novamente mais tarde.')
          : item.errorSummary,
      }))

      return { ...response, data }
    }).catch((error: any) => {
      const rawMessage = error?.response?.data?.message || error?.response?.data || error?.message
      if (import.meta.env.DEV && isTechnicalOpenFinanceError(rawMessage)) {
        return {
          data: buildDevSyncHistory(limit),
          status: 200,
          statusText: 'OK',
          headers: { 'x-open-finance-dev-fallback': 'true' },
          config: error?.config,
        }
      }
      throw error
    })
  },

  resolveKeepExisting(conflictId: string) {
    return axiosInterceptor.post<OpenFinanceConflict>(`${API_URL}/reconciliation/conflicts/${conflictId}/resolve/keep-existing`)
  },

  resolveCreateNew(conflictId: string) {
    return axiosInterceptor.post<OpenFinanceConflict>(`${API_URL}/reconciliation/conflicts/${conflictId}/resolve/create-new`)
  }
}
