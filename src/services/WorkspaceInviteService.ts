import axiosInterceptor from './axiosInterceptor'

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/workspaces`
const isPendingInvite = (status: unknown): boolean => String(status || '').toUpperCase() === 'PENDING'

export default {
  /**
   * Enviar convite para usuário
   * POST /workspaces/:workspaceId/invites
   */
  inviteUser(workspaceId: string, email: string, role: string): Promise<any> {
    return axiosInterceptor.post(
      `${API_URL}/${workspaceId}/invites`,
      { email, tenantRole: role },
      { timeout: 15000 }
    )
  },

  /**
   * Listar convites pendentes do workspace
   * GET /workspaces/:workspaceId/invites
   */
  async listInvites(workspaceId: string): Promise<any[]> {
    const response = await axiosInterceptor.get(`${API_URL}/${workspaceId}/invites`, { timeout: 15000 })
    const invites = Array.isArray(response.data) ? response.data : []
    return invites
      .map((invite: any) => ({
        ...invite,
        workspaceId: invite?.workspaceId || invite?.companyId,
        role: invite?.role || invite?.tenantRole || invite?.invitedTenantRole,
        createdAt: invite?.createdAt || invite?.created_at,
        status: String(invite?.status || '').toUpperCase()
      }))
      .filter((invite: any) => isPendingInvite(invite?.status))
  },

  /**
   * Cancelar convite
   * DELETE /workspaces/:workspaceId/invites/:inviteId
   */
  cancelInvite(workspaceId: string, inviteId: string): Promise<any> {
    return axiosInterceptor.delete(`${API_URL}/${workspaceId}/invites/${inviteId}`, { timeout: 15000 })
  },

  /**
   * Aceitar convite por token
   * POST /invites/accept?token=...
   */
  acceptInvite(token: string): Promise<any> {
    return axiosInterceptor.post(
      `${import.meta.env.VITE_API_BASE_URL}/invites/accept`,
      null,
      {
        params: { token },
        timeout: 15000
      }
    )
  },

  /**
   * Recusar convite por token
   * POST /invites/decline?token=...
   */
  declineInvite(token: string): Promise<any> {
    return axiosInterceptor.post(
      `${import.meta.env.VITE_API_BASE_URL}/invites/decline`,
      null,
      {
        params: { token },
        timeout: 15000
      }
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
        return { valid: false, requiresAuth: true }
      }
      throw err
    }
  }
}
