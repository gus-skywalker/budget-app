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
  userRoles?: string[]
  companies?: Array<{
    companyId: string
    companyName?: string
    role: string
  }>
  companyId?: string  // Só presente após selecionar empresa
  userRole?: string   // Só presente após selecionar empresa
  role?: string       // Alternativa para userRole
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
  userRole?: string[]
  createdAt?: string
  token: string
  refreshToken: string
  companyId: string | null
  companies: Array<{
    companyId: string
    companyName: string
    role: string
  }>
}

declare module './i18n' {
  const i18n: any;
  export default i18n;
}
