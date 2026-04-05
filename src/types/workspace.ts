export interface WorkspaceMembership {
  workspaceId: string
  workspaceName?: string
  role?: string | null

  /** @deprecated legacy compatibility alias */
  companyId?: string
  /** @deprecated legacy compatibility alias */
  companyName?: string
}

export type CompanyMembership = WorkspaceMembership

export interface WorkspaceSelection {
  workspaceId?: string | null
  tenantRole?: string | null

  /** @deprecated legacy compatibility alias */
  companyId?: string | null
}
