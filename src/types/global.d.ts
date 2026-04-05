// src/types/global.d.ts

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
  workspaces?: Array<{
    workspaceId: string
    workspaceName?: string
    role?: string | null
  }>
  workspaceId?: string
  tenantRole?: string
  userRole?: string
  role?: string
  picture?: string
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
  workspaceId: string | null
  workspaces: Array<{
    workspaceId: string
    workspaceName: string
    role?: string | null
  }>
}

declare module './i18n' {
  const i18n: any;
  export default i18n;
}
