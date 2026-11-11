import type { WorkspaceMembership } from '@/types/workspace'

export type WorkspaceRole = 'ROLE_OWNER' | 'ROLE_ADMIN' | 'ROLE_MEMBER' | 'ROLE_VIEWER' | string
export type CompanyRole = WorkspaceRole

export interface WorkspaceInviteRequest {
  email: string
  role: WorkspaceRole
}

export interface WorkspaceInvite {
  id?: string
  inviteId?: string
  workspaceId: string
  /** @deprecated legacy compatibility alias */
  companyId?: string
  email: string
  role: WorkspaceRole
  status?: 'pending' | 'accepted' | 'declined' | 'cancelled' | 'expired' | string
  createdAt?: string
}

export interface ValidateWorkspaceInviteResponse {
  valid: boolean
  requiresAuth?: boolean
  workspaceId?: string
  /** @deprecated legacy compatibility alias */
  companyId?: string
  email?: string
  tenantRole?: WorkspaceRole
  status?: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'CANCELED' | 'EXPIRED' | string
  role?: WorkspaceRole
  workspace?: WorkspaceMembership
  reason?: string
}

declare const WorkspaceInviteService: {
  inviteWorkspaceUser(workspaceId: string, email: string, role: WorkspaceRole): Promise<{ data: WorkspaceInvite | any }>
  inviteUser(workspaceId: string, email: string, role: WorkspaceRole): Promise<{ data: WorkspaceInvite | any }>
  listWorkspaceInvites(workspaceId: string): Promise<WorkspaceInvite[]>
  listInvites(workspaceId: string): Promise<WorkspaceInvite[]>
  cancelWorkspaceInvite(workspaceId: string, inviteId: string): Promise<any>
  cancelInvite(workspaceId: string, inviteId: string): Promise<any>
  acceptInvite(token: string): Promise<any>
  declineInvite(token: string): Promise<any>
  validateInvite(token: string): Promise<ValidateWorkspaceInviteResponse | any>
}

export default WorkspaceInviteService
