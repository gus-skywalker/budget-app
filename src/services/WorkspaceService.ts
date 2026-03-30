import axiosInterceptor from './axiosInterceptor'
import type { CompanyCreateRequest } from '@/types/CompanyCreateRequest'

const rawAuthBase = String(import.meta.env.VITE_AUTH_URL || '').replace(/\/+$/, '')

const normalizedAuthRoot = rawAuthBase
  .replace(/\/api\/auth$/, '')
  .replace(/\/auth$/, '')
  .replace(/\/api$/, '')

const AUTH_WORKSPACES_URL = `${normalizedAuthRoot}/api/companies`
const AUTH_URL = `${normalizedAuthRoot}/api/auth`
const BUDGET_WORKSPACES_URL = `${import.meta.env.VITE_API_BASE_URL}/companies`

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const isEventualConsistencyStatus = (status?: number) => status === 403 || status === 404
const isRetryableStatus = (status?: number) =>
  status == null || status === 403 || status === 404 || status === 408 || status === 409 || status === 425 || status === 429 || status >= 500

const authSelectWorkspaceEndpoint = `${AUTH_URL}/select-workspace`
const authClearWorkspaceEndpoint = `${AUTH_URL}/clear-workspace`

const WorkspaceService = {
  /**
   * Criar novo workspace.
   *
   * Observacao semantica:
   * o backend ainda expõe o recurso como `company`, mas no produto isso ja
   * significa o workspace colaborativo do usuario.
   *
   * 1) POST budget-api /companies
   * 2) Seleção do workspace é feita separadamente via userStore.selectWorkspace(workspaceId)
   */
  async create(payload: CompanyCreateRequest, correlationId?: string): Promise<any> {
    const enrichedPayload = { ...payload, correlationId }
    const created = await axiosInterceptor.post(BUDGET_WORKSPACES_URL, enrichedPayload)
    return {
      createdCompany: created?.data || null
    }
  },

  // Compat transport: budget-api ainda usa `company/companyId` em parte das rotas.

  /**
   * Listar workspaces do usuário.
   * GET /companies
   */
  getAll(): Promise<any> {
    return axiosInterceptor.get(AUTH_WORKSPACES_URL)
  },

  /**
   * Obter detalhes do workspace.
   */
  getDetails(workspaceId: string): Promise<any> {
    return axiosInterceptor.get(`${BUDGET_WORKSPACES_URL}/${workspaceId}`)
  },

  getWorkspaceDetails(workspaceId: string): Promise<any> {
    return this.getDetails(workspaceId)
  },

  /**
   * Atualizar informacoes do workspace.
   */
  update(workspaceId: string, payload: { companyName?: string; description?: string }): Promise<any> {
    return axiosInterceptor.put(`${BUDGET_WORKSPACES_URL}/${workspaceId}`, {
      name: payload.companyName,
      description: payload.description
    })
  },

  updateWorkspace(workspaceId: string, payload: { companyName?: string; description?: string }): Promise<any> {
    return this.update(workspaceId, payload)
  },

  /**
   * Selecionar workspace ativo.
   *
   * O frontend já usa o endpoint canônico `/select-workspace`.
   */
  selectWorkspace(workspaceId: string): Promise<any> {
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

        const isEventual = isEventualConsistencyStatus(status)
        await wait((isEventual ? 250 : 150) * attempt)
      }

      throw lastError
    }

    return run()
  },

  selectCompany(companyId: string): Promise<any> {
    return this.selectWorkspace(companyId)
  },

  /**
   * Limpar workspace ativo (voltar ao modo pessoal).
   * POST /api/auth/clear-workspace
   */
  clearWorkspace(): Promise<any> {
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

  clearCompany(): Promise<any> {
    return this.clearWorkspace()
  },

  /**
   * Listar membros do workspace.
   * GET /companies/{companyId}/members
   */
  listMembers(workspaceId: string): Promise<any> {
    return axiosInterceptor.get(`${BUDGET_WORKSPACES_URL}/${workspaceId}/members`)
  },

  listWorkspaceMembers(workspaceId: string): Promise<any> {
    return this.listMembers(workspaceId)
  },

  /**
   * Remover workspace definitivamente.
   */
  deleteWorkspace(workspaceId: string): Promise<any> {
    return axiosInterceptor.delete(`${BUDGET_WORKSPACES_URL}/${workspaceId}`)
  },

  deleteCompany(companyId: string): Promise<any> {
    return this.deleteWorkspace(companyId)
  }
}

export default WorkspaceService
