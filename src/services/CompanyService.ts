import axiosInterceptor from './axiosInterceptor'
import type { CompanyCreateRequest } from '@/types/CompanyCreateRequest'
const rawAuthBase = String(import.meta.env.VITE_AUTH_URL || '').replace(/\/+$/, '')

const normalizedAuthRoot = rawAuthBase
  .replace(/\/api\/auth$/, '')
  .replace(/\/auth$/, '')
  .replace(/\/api$/, '')

const AUTH_COMPANIES_URL = `${normalizedAuthRoot}/api/companies`
const AUTH_URL = `${normalizedAuthRoot}/api/auth`
const BUDGET_COMPANIES_URL = `${import.meta.env.VITE_API_BASE_URL}/companies`

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const isEventualConsistencyStatus = (status?: number) => status === 403 || status === 404
const isRetryableStatus = (status?: number) =>
  status == null || status === 403 || status === 404 || status === 408 || status === 409 || status === 425 || status === 429 || status >= 500

const authSelectCompanyEndpoint = `${AUTH_URL}/select-company`
const authClearCompanyEndpoint = `${AUTH_URL}/clear-company`

export default {
  /**
   * Criar nova empresa (canônico)
   * 1) POST budget-api /companies
   * 2) Seleção de tenant é feita separadamente via userStore.selectCompany(companyId)
   */
  async create(payload: CompanyCreateRequest, correlationId?: string): Promise<any> {
    // Inclui correlationId no payload, não mais no header
    const enrichedPayload = { ...payload, correlationId };
    const created = await axiosInterceptor.post(BUDGET_COMPANIES_URL, enrichedPayload)
    return {
      createdCompany: created?.data || null
    }
  },

  // --- endpoints abaixo ainda vivem no auth-api (compat). Podemos migrar depois.

  /**
   * Listar empresas do usuário
   * GET /companies
   */
  getAll(): Promise<any> {
    return axiosInterceptor.get(AUTH_COMPANIES_URL)
  },

  /**
   * Obter detalhes da empresa atual
   */
  getDetails(companyId: string): Promise<any> {
    return axiosInterceptor.get(`${BUDGET_COMPANIES_URL}/${companyId}`)
  },

  /**
   * Atualizar informações da empresa
   */
  update(companyId: string, payload: { companyName?: string; description?: string }): Promise<any> {
    return axiosInterceptor.put(`${BUDGET_COMPANIES_URL}/${companyId}`, {
      name: payload.companyName,
      description: payload.description
    })
  },

  /**
   * Selecionar empresa ativa
   * POST /api/auth/select-company
   * Retorna novos tokens (accessToken e refreshToken)
   */
  selectCompany(companyId: string): Promise<any> {
    const maxAttempts = 8
    let lastError: any = null

    const run = async () => {
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          return await axiosInterceptor.post(authSelectCompanyEndpoint, { companyId })
        } catch (error: any) {
          lastError = error
        }

        const status = lastError?.response?.status
        const shouldRetry = isRetryableStatus(status)
        if (!shouldRetry || attempt === maxAttempts) {
          break
        }

        // Eventual consistency após criação de company + membership async no auth.
        const isEventual = isEventualConsistencyStatus(status)
        await wait((isEventual ? 250 : 150) * attempt)
      }

      throw lastError
    }

    return run()
  },

  /**
   * Limpar empresa ativa (voltar ao modo pessoal)
   * POST /api/auth/clear-company
   */
  clearCompany(): Promise<any> {
    const run = async () => {
      let lastError: any = null
      const maxAttempts = 3
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          return await axiosInterceptor.post(authClearCompanyEndpoint)
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
   * Listar membros da empresa (canônico)
   * GET /companies/{companyId}/members
   */
  listMembers(companyId: string): Promise<any> {
    return axiosInterceptor.get(`${BUDGET_COMPANIES_URL}/${companyId}/members`)
  },

  /**
   * Remover empresa definitivamente
   */
  deleteCompany(companyId: string): Promise<any> {
    return axiosInterceptor.delete(`${BUDGET_COMPANIES_URL}/${companyId}`)
  }
}
