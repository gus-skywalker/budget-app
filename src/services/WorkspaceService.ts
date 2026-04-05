import axiosInterceptor from './axiosInterceptor'
import type { WorkspaceCreateRequest } from '../types/WorkspaceCreateRequest'
import {
  clearDevQuickAccessWorkspaceSelection,
  createDevQuickAccessWorkspace,
  getDevQuickAccessWorkspaceDetails,
  isDevQuickAccessEnabled,
  listDevQuickAccessWorkspaces,
  selectDevQuickAccessWorkspace
} from '@/utils/devQuickAccess'
const rawAuthBase = String(import.meta.env.VITE_AUTH_URL || '').replace(/\/+$/, '')

const normalizedAuthRoot = rawAuthBase
  .replace(/\/api\/auth$/, '')
  .replace(/\/auth$/, '')
  .replace(/\/api$/, '')

const AUTH_WORKSPACES_URL = `${normalizedAuthRoot}/api/workspaces`
const AUTH_URL = `${normalizedAuthRoot}/api/auth`
const BUDGET_WORKSPACES_URL = `${import.meta.env.VITE_API_BASE_URL}/workspaces`

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const isEventualConsistencyStatus = (status?: number) => status === 403 || status === 404
const isRetryableStatus = (status?: number) =>
  status == null || status === 403 || status === 404 || status === 408 || status === 409 || status === 425 || status === 429 || status >= 500

const authSelectWorkspaceEndpoint = `${AUTH_URL}/select-workspace`
const authClearWorkspaceEndpoint = `${AUTH_URL}/clear-workspace`

export default {
  /**
   * Criar novo workspace
   * 1) POST budget-api /workspaces
   * 2) Seleção de tenant é feita separadamente via userStore.selectWorkspace(workspaceId)
   */
  async create(payload: WorkspaceCreateRequest, correlationId?: string): Promise<any> {
    if (isDevQuickAccessEnabled()) {
      return {
        createdWorkspace: createDevQuickAccessWorkspace(payload)
      }
    }

    // Inclui correlationId no payload, não mais no header
    const enrichedPayload = { ...payload, correlationId }
    const created = await axiosInterceptor.post(BUDGET_WORKSPACES_URL, enrichedPayload)
    return {
      createdWorkspace: created?.data || null
    }
  },

  // --- endpoints abaixo ainda vivem no auth-api (compat). Podemos migrar depois.

  /**
   * Listar workspaces do usuário
   * GET /api/workspaces
   */
  getAll(): Promise<any> {
    if (isDevQuickAccessEnabled()) {
      return Promise.resolve({
        data: listDevQuickAccessWorkspaces()
      })
    }

    return axiosInterceptor.get(AUTH_WORKSPACES_URL)
  },

  /**
   * Obter detalhes do workspace atual
   */
  getDetails(workspaceId: string): Promise<any> {
    if (isDevQuickAccessEnabled()) {
      return Promise.resolve({
        data: getDevQuickAccessWorkspaceDetails(workspaceId)
      })
    }

    return axiosInterceptor.get(`${BUDGET_WORKSPACES_URL}/${workspaceId}`)
  },

  /**
   * Atualizar informações do workspace
   */
  update(workspaceId: string, payload: { workspaceName?: string; description?: string }): Promise<any> {
    return axiosInterceptor.put(`${BUDGET_WORKSPACES_URL}/${workspaceId}`, {
      name: payload.workspaceName,
      description: payload.description
    })
  },

  /**
   * Selecionar workspace ativo
   * POST /api/auth/select-workspace
   * Retorna novos tokens (accessToken e refreshToken)
   */
  selectWorkspace(workspaceId: string): Promise<any> {
    if (isDevQuickAccessEnabled()) {
      return Promise.resolve({
        data: selectDevQuickAccessWorkspace(workspaceId)
      })
    }

    const maxAttempts = 8
    let lastError: any = null

    const run = async () => {
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          return await axiosInterceptor.post(authSelectWorkspaceEndpoint, { workspaceId })
        } catch (error: any) {
          lastError = error
        }

        const status = lastError?.response?.status
        const shouldRetry = isRetryableStatus(status)
        if (!shouldRetry || attempt === maxAttempts) {
          break
        }

        // Eventual consistency após criação de workspace + membership async no auth.
        const isEventual = isEventualConsistencyStatus(status)
        await wait((isEventual ? 250 : 150) * attempt)
      }

      throw lastError
    }

    return run()
  },

  /**
   * Limpar workspace ativo (voltar ao modo pessoal)
   * POST /api/auth/clear-workspace
   */
  clearWorkspace(): Promise<any> {
    if (isDevQuickAccessEnabled()) {
      return Promise.resolve({
        data: clearDevQuickAccessWorkspaceSelection()
      })
    }

    const run = async () => {
      let lastError: any = null
      const maxAttempts = 3
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          return await axiosInterceptor.post(authClearWorkspaceEndpoint)
        } catch (error: any) {
          lastError = error
        }
        const status = lastError?.response?.status
        if (!isRetryableStatus(status) || attempt === maxAttempts) {
          break
        }
        await wait(150 * attempt)
      }
      throw lastError
    }

    return run()
  },

  /**
   * Listar membros do workspace
   * GET /workspaces/{workspaceId}/members
   */
  listMembers(workspaceId: string): Promise<any> {
    return axiosInterceptor.get(`${BUDGET_WORKSPACES_URL}/${workspaceId}/members`)
  },

  /**
   * Remover workspace definitivamente
   */
  deleteWorkspace(workspaceId: string): Promise<any> {
    return axiosInterceptor.delete(`${BUDGET_WORKSPACES_URL}/${workspaceId}`)
  }
}
