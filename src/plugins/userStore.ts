// src/plugins/userStore.ts
import { defineStore } from 'pinia'
import CompanyService from '@/services/CompanyService'

/**
 * Decode JWT token without external libraries
 */
function decodeJWT(token: string): any {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format')
    }
    const payload = parts[1]
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decoded)
  } catch (error) {
    console.error('Error decoding JWT:', error)
    return null
  }
}

const TENANT_ADMIN_ROLES = ['ROLE_OWNER', 'ROLE_ADMIN']
const TENANT_WRITE_ROLES = ['ROLE_OWNER', 'ROLE_ADMIN', 'ROLE_MEMBER']

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

type State = {
  token: string | null
  refreshToken: string | null
  auth: boolean
  user: User
  currentCompanyId: string | null
  tenantRole: string | null
  language: string
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
    language: 'PT'
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
    getApiLanguage: (state): string => {
      const lang = state.language.toLowerCase()
      return ['pt', 'en', 'fr'].includes(lang) ? lang : 'pt'
    }
  },

  actions: {
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
      this.user.companies = companies
      this.saveState()
    },

    clearCurrentCompany() {
      this.currentCompanyId = null
      this.tenantRole = null
      this.saveState()
    },

    clearTenantContext() {
      this.clearCurrentCompany()
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
      localStorage.setItem('userStore', JSON.stringify({
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
      const saved = localStorage.getItem('userStore')
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
        this.user.companies = companiesClaim.map((company: Company) => ({
          companyId: company.companyId,
          companyName: company.companyName,
          role: company.role ?? null
        }))
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

      this.saveState()
    },

    /**
     * Handle signin response from backend
     * Implements B2B multi-tenant flow decision logic
     */
    handleSigninResponse(response: any) {
      const accessToken = response.access_token || response.token || response.accessToken
      const refreshToken = response.refresh_token || response.refreshToken

      if (accessToken) {
        this.token = accessToken
        this.auth = true
      }
      if (refreshToken) {
        this.refreshToken = refreshToken
      }

      const userLanguage = response.language || this.language || 'PT'
      this.language = userLanguage

      this.setUser({
        id: response.id,
        username: response.username,
        email: response.email,
        language: userLanguage,
        companies: response.companies || this.user.companies || []
      })

      if (accessToken) {
        this.syncFromToken(accessToken)
      }

      const companyId = response.companyId || this.currentCompanyId
      const tenantRole = response.tenantRole || this.tenantRole

      if (companyId && tenantRole) {
        const selectedCompany = this.user.companies?.find((c: Company) => c.companyId === companyId)
        this.setCurrentCompany(companyId, tenantRole, selectedCompany?.companyName)
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
        const { accessToken, refreshToken, tenantRole } = response.data

        if (accessToken) {
          this.token = accessToken
          this.syncFromToken(accessToken)
        }

        if (refreshToken) {
          this.refreshToken = refreshToken
        }

        const decoded = accessToken ? decodeJWT(accessToken) : null
        const resolvedRole = tenantRole || decoded?.tenantRole || decoded?.userRole || decoded?.role
        const companyName = this.user.companies?.find((c: Company) => c.companyId === (decoded?.companyId || companyId))?.companyName

        this.setCurrentCompany(decoded?.companyId || companyId, resolvedRole, companyName)

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
        return true
      } catch (error) {
        console.error('Error clearing company selection:', error)
        throw error
      }
    },

    /**
     * Create company after login and handle token scoping
     */
    async createCompanyAfterLogin(companyId: string) {
      try {
        await this.selectCompany(companyId)
        return true
      } catch (error) {
        console.error('Error setting up company after creation:', error)
        throw error
      }
    },

    /**
     * Logout and clear all state
     */
    logout() {
      this.resetUser()
      localStorage.removeItem('userStore')
    }
  }
})