import axiosInterceptor from './axiosInterceptor'

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/companies`

const WorkspaceInviteService = {
  /**
   * Enviar convite para um workspace.
   *
   * O contrato HTTP ainda usa `/companies/:companyId`, mas `companyId` aqui ja
   * representa semanticamente o workspace alvo.
   *
   * POST /companies/:companyId/invites
   */
  inviteWorkspaceUser(workspaceId: string, email: string, role: string): Promise<any> {
    return axiosInterceptor.post(
      `${API_URL}/${workspaceId}/invites`,
      { email, tenantRole: role },
      { timeout: 15000 }
    )
  },

  inviteUser(companyId: string, email: string, role: string): Promise<any> {
    return this.inviteWorkspaceUser(companyId, email, role)
  },

  /**
   * Listar convites pendentes do workspace.
   * GET /companies/:companyId/invites
   */
  async listWorkspaceInvites(workspaceId: string): Promise<any[]> {
    const response = await axiosInterceptor.get(`${API_URL}/${workspaceId}/invites`, { timeout: 15000 })
    const invites = Array.isArray(response.data) ? response.data : []
    return invites.map((invite: any) => ({
      ...invite,
      workspaceId: invite?.workspaceId || invite?.companyId,
      role: invite?.role || invite?.tenantRole || invite?.invitedTenantRole,
      createdAt: invite?.createdAt || invite?.created_at
    }))
  },

  listInvites(companyId: string): Promise<any[]> {
    return this.listWorkspaceInvites(companyId)
  },

  /**
   * Cancelar convite
   * DELETE /companies/:companyId/invites/:inviteId
   */
  cancelWorkspaceInvite(workspaceId: string, inviteId: string): Promise<any> {
    return axiosInterceptor.delete(`${API_URL}/${workspaceId}/invites/${inviteId}`, { timeout: 15000 })
  },

  cancelInvite(companyId: string, inviteId: string): Promise<any> {
    return this.cancelWorkspaceInvite(companyId, inviteId)
  },

  /**
   * (Opcional) Associar um grupo a um convite de workspace.
   * POST /companies/:companyId/invites/:inviteId/attach-group
   */
  attachGroup(workspaceId: string, inviteId: string, groupId: number): Promise<any> {
    return axiosInterceptor.post(
      `${API_URL}/${workspaceId}/invites/${inviteId}/attach-group`,
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

export default WorkspaceInviteService
