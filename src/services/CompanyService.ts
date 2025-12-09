import axiosInterceptor from './axiosInterceptor'

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/companies`
const AUTH_URL = `${import.meta.env.VITE_AUTH_URL}/auth`

export default {
  /**
   * Criar nova empresa
   * POST /companies
   */
  create(companyName: string): Promise<any> {
    return axiosInterceptor.post(API_URL, { companyName })
  },

  /**
   * Listar empresas do usuário
   * GET /companies
   */
  getAll(): Promise<any> {
    return axiosInterceptor.get(API_URL)
  },

  /**
   * Selecionar empresa ativa
   * POST /auth/select-company
   * Retorna novos tokens (accessToken e refreshToken)
   */
  selectCompany(companyId: string): Promise<any> {
    return axiosInterceptor.post(`${AUTH_URL}/select-company`, { companyId })
  }
}
