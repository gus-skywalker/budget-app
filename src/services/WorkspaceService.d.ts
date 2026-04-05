import type { WorkspaceCreateRequest } from '../types/WorkspaceCreateRequest'

export interface Workspace {
  workspaceId: string
  workspaceName: string
  role?: string | null
}

export interface WorkspaceSummary {
  workspaceId: string
  workspaceName: string
  role?: string | null
}

export interface CreateWorkspaceResponse {
  message?: string
  workspaceId: string
  workspaceName: string
}

export interface SelectWorkspaceResponse {
  message?: string
  accessToken: string
  workspaceId?: string | null
  tenantRole?: string | null
}

declare const WorkspaceService: {
  create(payload: WorkspaceCreateRequest, correlationId?: string): Promise<{ createdWorkspace: any }>
  getAll(): Promise<{ data: WorkspaceSummary[] }>
  getDetails(workspaceId: string): Promise<{ data: any }>
  update(workspaceId: string, payload: { workspaceName?: string; description?: string }): Promise<{ data: any }>
  listMembers(workspaceId: string): Promise<{ data: any[] }>
  selectWorkspace(workspaceId: string): Promise<{ data: SelectWorkspaceResponse }>
  clearWorkspace(): Promise<{ data: SelectWorkspaceResponse }>
  deleteWorkspace(workspaceId: string): Promise<{ data: { message: string } }>
}

export default WorkspaceService
