import axiosInterceptor from './axiosInterceptor'
import type { WorkspaceCreateRequest } from '../types/WorkspaceCreateRequest'
import {
  createDevQuickAccessWorkspace,
  getDevQuickAccessWorkspaceDetails,
  isDevQuickAccessEnabled,
  listDevQuickAccessWorkspaces
} from '@/utils/devQuickAccess'
const rawAuthBase = String(import.meta.env.VITE_AUTH_URL || '').replace(/\/+$/, '')

const normalizedAuthRoot = rawAuthBase
  .replace(/\/api\/auth$/, '')
  .replace(/\/auth$/, '')
  .replace(/\/api$/, '')

const AUTH_WORKSPACES_URL = `${normalizedAuthRoot}/api/workspaces`
const BUDGET_WORKSPACES_URL = `${import.meta.env.VITE_API_BASE_URL}/workspaces`

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
