declare const InviteService: {
  inviteUser(companyId: string, email: string, role: string): Promise<any>
  listInvites(companyId: string): Promise<any[]>
  cancelInvite(companyId: string, inviteId: string): Promise<any>
  validateInvite(token: string): Promise<any>
}

export default InviteService
