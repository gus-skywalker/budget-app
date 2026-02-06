import axiosInterceptor from './axiosInterceptor'

const AUTH_COMPANIES_URL = `${import.meta.env.VITE_AUTH_URL}/companies`
const AUTH_URL = `${import.meta.env.VITE_AUTH_URL}/auth`
const BUDGET_COMPANIES_URL = `${import.meta.env.VITE_API_BASE_URL}/companies`

export default {
  /**
   * Criar nova empresa (canônico)
   * 1) POST budget-api /companies
   * 2) POST auth-api /auth/select-company (retorna novos tokens)
   */
  async create(companyName: string, description?: string): Promise<any> {
    const payload: any = { name: companyName }
    if (description) {
      payload.description = description
    }

    // 1) cria no budget-api (source of truth)
    const created = await axiosInterceptor.post(BUDGET_COMPANIES_URL, payload)

    // tenta inferir companyId do response (contract: created.data.companyId ou created.data.id)
    const companyId = created?.data?.companyId ?? created?.data?.id
    if (!companyId) {
      return created
    }

    // 2) seleciona company no auth-api para enriquecer JWT
    const tokens = await axiosInterceptor.post(`${AUTH_URL}/select-company`, { companyId })

    return {
      createdCompany: created.data,
      tokens: tokens.data
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
   * POST /auth/select-company
   * Retorna novos tokens (accessToken e refreshToken)
   */
  selectCompany(companyId: string): Promise<any> {
    return axiosInterceptor.post(`${AUTH_URL}/select-company`, { companyId })
  },

  /**
   * Limpar empresa ativa (voltar ao modo pessoal)
   * POST /auth/clear-company
   */
  clearCompany(): Promise<any> {
    return axiosInterceptor.post(`${AUTH_URL}/clear-company`)
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
