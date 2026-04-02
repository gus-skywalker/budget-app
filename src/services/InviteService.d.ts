// src/services/InviteService.d.ts

export type WorkspaceRole = 'ROLE_OWNER' | 'ROLE_ADMIN' | 'ROLE_MEMBER' | 'ROLE_VIEWER' | string

export interface InviteRequest {
  email: string
  role: WorkspaceRole
}

export interface Invite {
  id?: string
  inviteId?: string
  workspaceId: string
  email: string
  role: WorkspaceRole
  status?: 'pending' | 'accepted' | 'declined' | 'cancelled' | 'expired' | string
  createdAt?: string
}

export interface ValidateInviteResponse {
  valid: boolean
  workspaceId?: string
  email?: string
  role?: WorkspaceRole
  reason?: string
}

declare const InviteService: {
  inviteUser(workspaceId: string, email: string, role: WorkspaceRole): Promise<{ data: Invite | any }>
  listInvites(workspaceId: string): Promise<Invite[]>
  cancelInvite(workspaceId: string, inviteId: string): Promise<any>
  validateInvite(token: string): Promise<ValidateInviteResponse | any >
}

export default InviteService
