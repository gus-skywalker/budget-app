// src/services/InviteService.d.ts

export type CompanyRole = 'ROLE_OWNER' | 'ROLE_ADMIN' | 'ROLE_MEMBER' | 'ROLE_VIEWER' | string

export interface InviteRequest {
  email: string
  role: CompanyRole
}

export interface Invite {
  /** Canonical id (contract target) */
  id?: string
  /** Legacy/server variant (tolerated by UI) */
  inviteId?: string

  companyId: string
  email: string
  role: CompanyRole

  status?: 'pending' | 'accepted' | 'declined' | 'cancelled' | 'expired' | string
  createdAt?: string
}

export interface ValidateInviteResponse {
  valid: boolean
  companyId?: string
  email?: string
  role?: CompanyRole
  /** optional metadata */
  reason?: string
}

declare const InviteService: {
  inviteUser(companyId: string, email: string, role: CompanyRole): Promise<{ data: Invite | any }>
  listInvites(companyId: string): Promise<Invite[]>
  cancelInvite(companyId: string, inviteId: string): Promise<any>
  validateInvite(token: string): Promise<ValidateInviteResponse | any>
}

export default InviteService

