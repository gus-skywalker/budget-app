export interface WorkspaceMembership {
  companyId: string
  workspaceId?: string
  companyName?: string
  role?: string | null
}

export type CompanyMembership = WorkspaceMembership

export interface WorkspaceSelection {
  workspaceId?: string | null
  companyId?: string | null
  tenantRole?: string | null
}
