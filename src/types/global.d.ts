// src/types/global.d.ts
import type { WorkspaceMembership } from './workspace'

// Language Types
export type Language = 'PT' | 'EN' | 'FR' | 'ES' | 'DE'
export type ApiLanguage = 'pt' | 'en' | 'fr'

// JWT Claims Interface
export interface JWTClaims {
  sub: string
  user_id: string
  user_email: string
  user_fullname?: string
  user_language?: Language
  userRoles?: string[] | string
  companies?: WorkspaceMembership[]
  workspaceId?: string // Alias semântico futuro para companyId
  companyId?: string  // Só presente após selecionar empresa
  tenantRole?: string // Role canônica do tenant ativo
  userRole?: string   // Retrocompatibilidade
  role?: string       // Retrocompatibilidade
  picture?: string    // Em login OAuth2
  exp?: number
  iat?: number
}

// Login Response Interface
export interface LoginResponse {
  id: string
  username: string
  email: string
  language: Language
  tenantRole?: string | null
  userRole?: string[]
  userRoles?: string[]
  createdAt?: string
  accessToken: string
  refreshToken: string
  workspaceId?: string | null
  companyId: string | null
  companies: WorkspaceMembership[]
}

declare module './i18n' {
  const i18n: any;
  export default i18n;
}
