import axiosInterceptor from './axiosInterceptor'

const AUTH_COMPANIES_URL = `${import.meta.env.VITE_AUTH_URL}/companies`
const AUTH_URL = `${import.meta.env.VITE_AUTH_URL}/auth`

export default {
  /**
   * Criar nova empresa
   * POST /companies
   */
  create(companyName: string, description?: string): Promise<any> {
    const payload: any = { companyName }
    if (description) {
      payload.description = description
    }
    return axiosInterceptor.post(AUTH_COMPANIES_URL, payload)
  },

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
    return axiosInterceptor.get(`${AUTH_COMPANIES_URL}/${companyId}`)
  },

  /**
   * Atualizar informações da empresa
   */
  update(companyId: string, payload: { companyName?: string; description?: string }): Promise<any> {
    return axiosInterceptor.put(`${AUTH_COMPANIES_URL}/${companyId}`, payload)
  },

  /**
   * Listar membros da empresa
   */
  listMembers(companyId: string): Promise<any> {
    return axiosInterceptor.get(`${AUTH_COMPANIES_URL}/${companyId}/members`)
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
   * Remover empresa definitivamente
   */
  deleteCompany(companyId: string): Promise<any> {
    return axiosInterceptor.delete(`${AUTH_COMPANIES_URL}/${companyId}`)
  }
}
