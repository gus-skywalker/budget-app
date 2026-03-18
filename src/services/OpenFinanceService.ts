import axiosInterceptor from './axiosInterceptor'
import type {
  OpenFinanceBankCategory,
  OpenFinanceCategoryMapping,
  OpenFinanceConnection,
  OpenFinanceConflict,
  OpenFinanceObservabilitySummary,
  OpenFinanceSyncHistoryItem,
  OpenFinanceSyncRequest,
  OpenFinanceSyncResponse,
} from '@/types/openFinance'

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/open-finance`

export default {
  sync(payload: OpenFinanceSyncRequest) {
    return axiosInterceptor.post<OpenFinanceSyncResponse>(`${API_URL}/sync`, payload)
  },

  listConnections() {
    return axiosInterceptor.get<OpenFinanceConnection[]>(`${API_URL}/connections`)
  },

  startConnection(institutionKey: string) {
    return axiosInterceptor.post<OpenFinanceConnection>(`${API_URL}/connections`, { institutionKey })
  },

  confirmConsent(institutionKey: string) {
    return axiosInterceptor.post<OpenFinanceConnection>(`${API_URL}/connections/${encodeURIComponent(institutionKey)}/confirm-consent`)
  },

  disconnectConnection(institutionKey: string) {
    return axiosInterceptor.delete<OpenFinanceConnection>(`${API_URL}/connections/${encodeURIComponent(institutionKey)}`)
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

  listSyncHistory(limit = 10) {
    return axiosInterceptor.get<OpenFinanceSyncHistoryItem[]>(`${API_URL}/sync/history`, {
      params: { limit },
    })
  },

  resolveKeepExisting(conflictId: string) {
    return axiosInterceptor.post<OpenFinanceConflict>(`${API_URL}/reconciliation/conflicts/${conflictId}/resolve/keep-existing`)
  },

  resolveCreateNew(conflictId: string) {
    return axiosInterceptor.post<OpenFinanceConflict>(`${API_URL}/reconciliation/conflicts/${conflictId}/resolve/create-new`)
  }
}
