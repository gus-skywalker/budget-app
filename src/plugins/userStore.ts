/**
 * Token Refresh Flow
 *
 * - When an API call fails due to expired access token (401), call userStore.tryRefreshToken().
 * - If tryRefreshToken() succeeds, retry the original request.
 * - If tryRefreshToken() fails (refresh token expired/invalid), user is logged out automatically.
 * - This ensures seamless session renewal and only logs out when both tokens are invalid.
 */
// src/plugins/userStore.ts
import { defineStore } from 'pinia'
import CompanyService from '@/services/CompanyService'
import AuthService from '@/services/AuthService'

/**
 * Decode JWT token without external libraries
 */
function decodeJWT(token: string): any {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      console.error('Error decoding JWT:', new Error('Invalid JWT format'))
      return null
    }
    const payload = parts[1]
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
    const decoded = atob(padded)

    // JWT payload is UTF-8 JSON; atob returns a binary string.
    // Try to decode as UTF-8 safely; fallback to plain JSON parse.
    try {
      const utf8 = decodeURIComponent(
        Array.from(decoded)
          .map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, '0')}`)
          .join('')
      )
      return JSON.parse(utf8)
    } catch {
      return JSON.parse(decoded)
    }
  } catch (error) {
    console.error('Error decoding JWT:', error)
    return null
  }
}

const TENANT_ADMIN_ROLES = ['ROLE_OWNER', 'ROLE_ADMIN']
const TENANT_WRITE_ROLES = ['ROLE_OWNER', 'ROLE_ADMIN', 'ROLE_MEMBER']
const hasCompanyName = (value?: string) => Boolean(value && value.trim().length > 0)

interface Company {
  companyId: string
  companyName?: string
  role?: string | null
}

interface User {
  id?: string
  username?: string
  email?: string
  avatar?: string
  language?: string
  companies?: Company[]
  userRoles?: string[]
}

function mergeCompanies(incoming: Company[], existing: Company[] = []): Company[] {
  const existingById = new Map(existing.map((company) => [company.companyId, company]))
  return incoming.map((company) => {
    const previous = existingById.get(company.companyId)
    return {
      companyId: company.companyId,
      role: company.role ?? previous?.role ?? null,
      companyName: hasCompanyName(company.companyName) ? company.companyName : previous?.companyName
    }
  })
}

function getMissingCompanyNameIds(companies: Company[] = []): string[] {
  return companies
    .filter((company) => Boolean(company.companyId) && !hasCompanyName(company.companyName))
    .map((company) => company.companyId)
}

type State = {
  token: string | null
  refreshToken: string | null
  auth: boolean
  user: User
  currentCompanyId: string | null
  tenantRole: string | null
  language: string
  preferredMode: 'personal' | 'tenant' | null
  preferredCompanyId: string | null
}

export const useUserStore = defineStore({
  id: 'userStore',
  
  state: (): State => ({
    token: null,
    refreshToken: null,
    auth: false,
    user: {},
    currentCompanyId: null,
    tenantRole: null,
    language: 'PT',
    preferredMode: null,
    preferredCompanyId: null
  }),

  getters: {
    getUser: (state): User => state.user,
    isAuthenticated: (state): boolean => state.auth,
    getToken: (state): string | null => state.token,
    getRefreshToken: (state): string | null => state.refreshToken,
    getCurrentCompanyId: (state): string | null => state.currentCompanyId,
    getCurrentRole: (state): string | null => state.tenantRole,
    getTenantRole: (state): string | null => state.tenantRole,
    getCompanies: (state): Company[] => state.user.companies || [],
    getUserRoles: (state): string[] => state.user.userRoles || [],
    hasMultipleCompanies: (state): boolean => (state.user.companies?.length || 0) > 1,
    isAdmin: (state): boolean => TENANT_ADMIN_ROLES.includes((state.tenantRole || '').toUpperCase()),
    isPersonalMode: (state): boolean => !state.currentCompanyId,
    isTenantMode: (state): boolean => Boolean(state.currentCompanyId && state.tenantRole),
    isTenantAdmin: (state): boolean => TENANT_ADMIN_ROLES.includes((state.tenantRole || '').toUpperCase()),
    canWrite: (state): boolean => TENANT_WRITE_ROLES.includes((state.tenantRole || '').toUpperCase()),
    getLanguage: (state): string => state.language,
    getPreferredMode: (state): 'personal' | 'tenant' | null => state.preferredMode,
    getPreferredCompanyId: (state): string | null => state.preferredCompanyId,
    getApiLanguage: (state): string => {
      const lang = state.language.toLowerCase()
      return ['pt', 'en', 'fr'].includes(lang) ? lang : 'pt'
    }
  },

  actions: {
    savePreference() {
      localStorage.setItem(
        'userPreference',
        JSON.stringify({
          preferredMode: this.preferredMode,
          preferredCompanyId: this.preferredCompanyId
        })
      )
    },

    loadPreference() {
      try {
        const raw = localStorage.getItem('userPreference')
        if (!raw) return
        const parsed = JSON.parse(raw)
        const mode = parsed?.preferredMode
        const companyId = parsed?.preferredCompanyId

        if (mode === 'personal' || mode === 'tenant' || mode === null) {
          this.preferredMode = mode
        }
        if (typeof companyId === 'string' || companyId === null) {
          this.preferredCompanyId = companyId
        }
      } catch {
        // ignore
      }
    },

    setPreferredPersonal() {
      this.preferredMode = 'personal'
      this.preferredCompanyId = null
      this.savePreference()
    },

    setPreferredTenant(companyId: string) {
      this.preferredMode = 'tenant'
      this.preferredCompanyId = companyId
      this.savePreference()
    },

    setToken(token: string | null) {
      this.token = token
      this.saveState()
    },

    setRefreshToken(token: string | null) {
      this.refreshToken = token
      this.saveState()
    },

    setAuth(value: boolean) {
      this.auth = value
      this.saveState()
    },

    setUser(user: User) {
      const nextUser: User = {
        ...this.user,
        ...user,
        companies: user.companies ?? this.user.companies
      }
      this.user = nextUser
      if (nextUser.language) {
        this.language = nextUser.language
      }
      this.saveState()
    },

    setLanguage(language: string) {
      this.language = language
      this.saveState()
    },

    setCurrentCompany(companyId: string | null, role?: string | null, companyName?: string) {
      this.currentCompanyId = companyId
      this.tenantRole = role || null

      if (companyId && companyName && this.user.companies) {
        const company = this.user.companies.find(c => c.companyId === companyId)
        if (company && !company.companyName) {
          company.companyName = companyName
        }
      }
      this.saveState()
    },

    setCompanies(companies: Company[]) {
      const merged = mergeCompanies(companies || [], this.user.companies || [])
      this.user.companies = merged
      this.saveState()
      const missingNames = getMissingCompanyNameIds(merged)
      if (missingNames.length && this.token) {
        void this.hydrateCompanyDetailsFromBudget(missingNames)
      }
    },

    updateCompanyName(companyId: string, companyName: string) {
      const companies = this.user.companies
      if (!companies || !companyId) return
      const company = companies.find((c) => c.companyId === companyId)
      if (!company) return
      company.companyName = companyName
      this.saveState()
    },

    clearCurrentCompany() {
      this.currentCompanyId = null
      this.tenantRole = null
      this.saveState()
    },

    resetUser() {
      this.token = null
      this.refreshToken = null
      this.auth = false
      this.user = {}
      this.currentCompanyId = null
      this.tenantRole = null
      this.language = 'PT'
      this.saveState()
    },

    saveState() {
      sessionStorage.setItem('userStore', JSON.stringify({
        token: this.token,
        refreshToken: this.refreshToken,
        auth: this.auth,
        user: this.user,
        currentCompanyId: this.currentCompanyId,
        tenantRole: this.tenantRole,
        language: this.language
      }))
    },

    loadState() {
      const saved = sessionStorage.getItem('userStore')
      if (saved) {
        const state = JSON.parse(saved)
        this.token = state.token
        this.refreshToken = state.refreshToken
        this.auth = state.auth
        this.user = state.user
        this.currentCompanyId = state.currentCompanyId
        this.tenantRole = state.tenantRole
        this.language = state.language || 'PT'
      }

      // Preference is intentionally stored in localStorage (survives sessions)
      this.loadPreference()
    },

    /**
     * Decode JWT and sync state from token claims
     */
    syncFromToken(token: string) {
      const decoded = decodeJWT(token)
      if (!decoded) return

      if (decoded.user_id) {
        this.user.id = decoded.user_id
      }

      if (decoded.user_email) {
        this.user.email = decoded.user_email
      }

      if (decoded.user_fullname) {
        this.user.username = decoded.user_fullname
      }

      if (decoded.user_language) {
        this.language = decoded.user_language
        this.user.language = decoded.user_language
      }

      const companiesClaim = Array.isArray(decoded.companies) ? decoded.companies : []
      if (companiesClaim.length) {
        this.setCompanies(companiesClaim.map((company: Company) => ({
          companyId: company.companyId,
          companyName: company.companyName,
          role: company.role ?? null
        })))
      }

      if (decoded.userRoles) {
        if (Array.isArray(decoded.userRoles)) {
          this.user.userRoles = decoded.userRoles
        } else if (typeof decoded.userRoles === 'string') {
          this.user.userRoles = decoded.userRoles.split(' ').filter(Boolean)
        }
      }

      if (decoded.companyId) {
        this.currentCompanyId = decoded.companyId
      } else {
        this.currentCompanyId = null
      }

      if (decoded.tenantRole || decoded.userRole || decoded.role) {
        this.tenantRole = decoded.tenantRole || decoded.userRole || decoded.role
      } else if (!decoded.companyId) {
        this.tenantRole = null
      }

      // Only update preference when token is explicitly tenant-scoped.
      if (this.currentCompanyId) {
        this.setPreferredTenant(this.currentCompanyId)
      }

      this.saveState()
    },

    async hydrateCompanyDetailsFromBudget(companyIds?: string[]) {
      const targetIds = (companyIds && companyIds.length
        ? companyIds
        : [
            ...(this.user.companies || []).map((c) => c.companyId),
            ...(this.currentCompanyId ? [this.currentCompanyId] : [])
          ]).filter(Boolean) as string[]

      const uniqueIds = Array.from(new Set(targetIds))
      if (!uniqueIds.length) return

      const byId = new Map((this.user.companies || []).map((c) => [c.companyId, { ...c }]))

      await Promise.all(
        uniqueIds.map(async (companyId) => {
          const existing = byId.get(companyId)
          if (existing?.companyName && existing.companyName.trim().length > 0) {
            return
          }

          try {
            const response = await CompanyService.getDetails(companyId)
            const companyName =
              response?.data?.companyName ||
              response?.data?.name ||
              response?.data?.title ||
              null

            if (!companyName) return

            byId.set(companyId, {
              companyId,
              role: existing?.role ?? null,
              companyName: String(companyName)
            })
          } catch {
            // Best effort only: company details may be unavailable for some IDs.
            console.warn('Could not hydrate company details from budget-api for companyId=', companyId)
          }
        })
      )

      this.user.companies = Array.from(byId.values())
      this.saveState()
    },

    /**
     * Handle signin response from backend
     * Implements B2B multi-tenant flow decision logic
     */
    handleSigninResponse(response: any) {
      const accessToken = response?.accessToken
      const refreshToken = response?.refreshToken

      if (!accessToken || !refreshToken) {
        console.error('Invalid signin response: missing accessToken/refreshToken', response)
      }

      if (accessToken) {
        this.token = accessToken
        this.auth = true
      }
      if (refreshToken) {
        this.refreshToken = refreshToken
      }

      const userLanguage = response.language || this.language || 'PT'
      this.language = userLanguage

      const responseUserRoles = response?.userRoles ?? response?.userRole
      const normalizedUserRoles: string[] | undefined = Array.isArray(responseUserRoles)
        ? responseUserRoles
        : typeof responseUserRoles === 'string'
          ? responseUserRoles.split(' ').filter(Boolean)
          : undefined

      this.setUser({
        id: response.id,
        username: response.username,
        email: response.email,
        language: userLanguage,
        companies: response.companies || this.user.companies || [],
        userRoles: normalizedUserRoles
      })

      if (accessToken) {
        this.syncFromToken(accessToken)
      }

      const companyId = response.companyId || this.currentCompanyId
      const tenantRole = response.tenantRole || this.tenantRole

      if (companyId && tenantRole) {
        const selectedCompany = this.user.companies?.find((c: Company) => c.companyId === companyId)
        this.setCurrentCompany(companyId, tenantRole, selectedCompany?.companyName)
        this.setPreferredTenant(companyId)
      }

      const companies = this.user.companies || []

      return {
        hasCompanies: companies.length > 0,
        hasMultipleCompanies: companies.length > 1,
        companyPreselected: Boolean(companyId && tenantRole),
        companies
      }
    },

    /**
     * Select company and update tokens
     * Calls backend API and replaces tokens
     */
    async selectCompany(companyId: string) {
      try {
        const response = await CompanyService.selectCompany(companyId)
        const { accessToken, refreshToken, tenantRole, companyId: resolvedCompanyId } = response.data

        if (accessToken) {
          this.token = accessToken
          this.syncFromToken(accessToken)
        }

        if (refreshToken) {
          this.refreshToken = refreshToken
        }

        const decoded = accessToken ? decodeJWT(accessToken) : null
        const resolvedRole = tenantRole || decoded?.tenantRole
        const effectiveCompanyId = resolvedCompanyId || decoded?.companyId || companyId
        const companyName = this.user.companies?.find((c: Company) => c.companyId === effectiveCompanyId)?.companyName

        this.setCurrentCompany(effectiveCompanyId, resolvedRole, companyName)
        this.setPreferredTenant(effectiveCompanyId)
        await this.hydrateCompanyDetailsFromBudget([effectiveCompanyId])

        return true
      } catch (error) {
        console.error('Error selecting company:', error)
        throw error
      }
    },

    async clearCompanySelection() {
      try {
        const response = await CompanyService.clearCompany()
        const { accessToken, refreshToken } = response.data

        if (accessToken) {
          this.token = accessToken
          this.syncFromToken(accessToken)
        }

        if (refreshToken) {
          this.refreshToken = refreshToken
        }

        this.clearCurrentCompany()
        this.setPreferredPersonal()
        return true
      } catch (error) {
        console.error('Error clearing company selection:', error)
        throw error
      }
    },

    /**
     * Attempt to refresh access token using refresh token
     * Returns true if successful, false if refresh fails
     */
    async tryRefreshToken() {
      if (!this.refreshToken) return false
      try {
        const response = await AuthService.refreshToken(this.refreshToken)
        const { accessToken, refreshToken } = response.data
        if (accessToken) {
          this.token = accessToken
          this.syncFromToken(accessToken)
          await this.hydrateCompanyDetailsFromBudget()
        }
        if (refreshToken) {
          this.refreshToken = refreshToken
        }
        this.auth = true
        this.saveState()
        return true
      } catch (error) {
        this.logout()
        return false
      }
    },

    /**
     * Logout and clear all state
     */
    logout() {
      this.resetUser()
      sessionStorage.removeItem('userStore')
    }
  }
})
