import type { CompanyCreateRequest } from '@/types/CompanyCreateRequest'
import type { WorkspaceMembership } from '@/types/workspace'

export type Workspace = WorkspaceMembership
export type Company = WorkspaceMembership

export interface CreateWorkspaceResponse {
  message: string
  /** Legacy transport field; semantic meaning is workspaceId */
  companyId: string
  workspaceId?: string
  companyName: string
}

export interface SelectWorkspaceResponse {
  message?: string
  accessToken: string
  refreshToken: string
  /** Legacy transport field; semantic meaning is workspaceId */
  companyId?: string | null
  workspaceId?: string | null
  tenantRole?: string | null
}

declare const WorkspaceService: {
  create(payload: CompanyCreateRequest, correlationId?: string): Promise<{ createdCompany: any }>
  getAll(): Promise<{ data: Workspace[] }>
  getDetails(workspaceId: string): Promise<{ data: any }>
  getWorkspaceDetails(workspaceId: string): Promise<{ data: any }>
  update(workspaceId: string, payload: { companyName?: string; description?: string }): Promise<{ data: any }>
  updateWorkspace(workspaceId: string, payload: { companyName?: string; description?: string }): Promise<{ data: any }>
  listMembers(workspaceId: string): Promise<{ data: any[] }>
  listWorkspaceMembers(workspaceId: string): Promise<{ data: any[] }>
  selectWorkspace(workspaceId: string): Promise<{ data: SelectWorkspaceResponse }>
  selectCompany(companyId: string): Promise<{ data: SelectWorkspaceResponse }>
  clearWorkspace(): Promise<{ data: SelectWorkspaceResponse }>
  clearCompany(): Promise<{ data: SelectWorkspaceResponse }>
  deleteWorkspace(workspaceId: string): Promise<{ data: { message: string } }>
  deleteCompany(companyId: string): Promise<{ data: { message: string } }>
}

export default WorkspaceService
