import axiosInterceptor from './axiosInterceptor'

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/companies`

export default {
  /**
   * Enviar convite para usuário
   * POST /companies/:companyId/invites
   */
  inviteUser(companyId: string, email: string, role: string): Promise<any> {
    return axiosInterceptor.post(
      `${API_URL}/${companyId}/invites`,
      { email, tenantRole: role },
      { timeout: 15000 }
    )
  },

  /**
   * Listar convites pendentes da empresa
   * GET /companies/:companyId/invites
   */
  async listInvites(companyId: string): Promise<any[]> {
    const response = await axiosInterceptor.get(`${API_URL}/${companyId}/invites`, { timeout: 15000 })
    const invites = Array.isArray(response.data) ? response.data : []
    return invites.map((invite: any) => ({
      ...invite,
      role: invite?.role || invite?.tenantRole || invite?.invitedTenantRole,
      createdAt: invite?.createdAt || invite?.created_at
    }))
  },

  /**
   * Cancelar convite
   * DELETE /companies/:companyId/invites/:inviteId
   */
  cancelInvite(companyId: string, inviteId: string): Promise<any> {
    return axiosInterceptor.delete(`${API_URL}/${companyId}/invites/${inviteId}`, { timeout: 15000 })
  },

  /**
   * (Opcional) Associar um group/workspace a um convite
   * POST /companies/:companyId/invites/:inviteId/attach-group
   */
  attachGroup(companyId: string, inviteId: string, groupId: number): Promise<any> {
    return axiosInterceptor.post(
      `${API_URL}/${companyId}/invites/${inviteId}/attach-group`,
      { groupId },
      { timeout: 15000 }
    )
  },

  /**
   * Validar token de convite
   * GET /invites/validate/:token
   *
   * Contrato: token inexistente => 404 { valid:false }
   */
  async validateInvite(token: string): Promise<any> {
    try {
      const response = await axiosInterceptor.get(
        `${import.meta.env.VITE_API_BASE_URL}/invites/validate/${token}`,
        { timeout: 15000 }
      )
      return response.data
    } catch (err: any) {
      if (err?.response?.status === 404) {
        return { valid: false }
      }
      throw err
    }
  }
}
