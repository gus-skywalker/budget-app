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
  companyId: string
  workspaceId?: string
  email: string
  role: WorkspaceRole
  status?: 'pending' | 'accepted' | 'declined' | 'cancelled' | 'expired' | string
  createdAt?: string
}

export interface ValidateWorkspaceInviteResponse {
  valid: boolean
  companyId?: string
  workspaceId?: string
  email?: string
  role?: WorkspaceRole
  workspace?: WorkspaceMembership
  reason?: string
}

declare const WorkspaceInviteService: {
  inviteWorkspaceUser(workspaceId: string, email: string, role: WorkspaceRole): Promise<{ data: WorkspaceInvite | any }>
  inviteUser(companyId: string, email: string, role: WorkspaceRole): Promise<{ data: WorkspaceInvite | any }>
  listWorkspaceInvites(workspaceId: string): Promise<WorkspaceInvite[]>
  listInvites(companyId: string): Promise<WorkspaceInvite[]>
  cancelWorkspaceInvite(workspaceId: string, inviteId: string): Promise<any>
  cancelInvite(companyId: string, inviteId: string): Promise<any>
  validateInvite(token: string): Promise<ValidateWorkspaceInviteResponse | any>
}

export default WorkspaceInviteService
