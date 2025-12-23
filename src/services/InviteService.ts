import axiosInterceptor from './axiosInterceptor'

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/companies`

export default {
  /**
   * Enviar convite para usuário
   * POST /companies/:companyId/invite
   */
  inviteUser(companyId: string, email: string, role: string): Promise<any> {
    return axiosInterceptor.post(`${API_URL}/${companyId}/invite`, { email, role })
  },

  /**
   * Listar convites pendentes da empresa
   * GET /companies/:companyId/invites
   */
  async listInvites(companyId: string): Promise<any[]> {
    const response = await axiosInterceptor.get(`${API_URL}/${companyId}/invites`)
    return response.data
  },

  /**
   * Cancelar convite
   * DELETE /companies/:companyId/invites/:inviteId
   */
  cancelInvite(companyId: string, inviteId: string): Promise<any> {
    return axiosInterceptor.delete(`${API_URL}/${companyId}/invites/${inviteId}`)
  },

  /**
   * Validar token de convite
   * GET /invites/validate/:token
   */
  async validateInvite(token: string): Promise<any> {
    const response = await axiosInterceptor.get(`${import.meta.env.VITE_API_BASE_URL}/invites/validate/${token}`)
    return response.data
  }
}
