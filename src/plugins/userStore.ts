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

interface Company {
  companyId: string
  companyName?: string
  role: string
}

interface User {
  id?: string
  username?: string
  email?: string
  avatar?: string
  language?: string
  companies?: Company[]
}

type State = {
  token: string | null
  refreshToken: string | null
  personalToken: string | null
  personalRefreshToken: string | null
  auth: boolean
  user: User
  currentCompanyId: string | null
  currentRole: string | null
  language: string
}

export const useUserStore = defineStore({
  id: 'userStore',
  
  state: (): State => ({
    token: null,
    refreshToken: null,
    personalToken: null,
    personalRefreshToken: null,
    auth: false,
    user: {},
    currentCompanyId: null,
    currentRole: null,
    language: 'PT'
  }),

  getters: {
    getUser: (state): User => state.user,
    isAuthenticated: (state): boolean => state.auth,
    getToken: (state): string | null => state.token,
    getRefreshToken: (state): string | null => state.refreshToken,
    getCurrentCompanyId: (state): string | null => state.currentCompanyId,
    getCurrentRole: (state): string | null => state.currentRole,
    getCompanies: (state): Company[] => state.user.companies || [],
    hasMultipleCompanies: (state): boolean => (state.user.companies?.length || 0) > 1,
    isAdmin: (state): boolean => {
      const role = (state.currentRole || '').toUpperCase()
      return ['ROLE_ADMIN', 'ROLE_CLIENT', 'ROLE_OWNER'].includes(role)
    },
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

    setPersonalTokens(token: string | null, refresh: string | null) {
      this.personalToken = token
      this.personalRefreshToken = refresh
      this.saveState()
    },

    setAuth(value: boolean) {
      this.auth = value
      this.saveState()
    },

    setUser(user: User) {
      this.user = user
      if (user.language) {
        this.language = user.language
      }
      this.saveState()
    },

    setLanguage(language: string) {
      this.language = language
      this.saveState()
    },

    setCurrentCompany(companyId: string, role: string, companyName?: string) {
      this.currentCompanyId = companyId
      this.currentRole = role
      // Atualiza o nome da empresa no array companies se fornecido
      if (companyName && this.user.companies) {
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
      this.currentRole = null
      this.saveState()
    },

    resetUser() {
      this.token = null
      this.refreshToken = null
      this.personalToken = null
      this.personalRefreshToken = null
      this.auth = false
      this.user = {}
      this.currentCompanyId = null
      this.currentRole = null
      this.language = 'PT'
      this.saveState()
    },

    saveState() {
      localStorage.setItem('userStore', JSON.stringify({
        token: this.token,
        refreshToken: this.refreshToken,
        personalToken: this.personalToken,
        personalRefreshToken: this.personalRefreshToken,
        auth: this.auth,
        user: this.user,
        currentCompanyId: this.currentCompanyId,
        currentRole: this.currentRole,
        language: this.language
      }))
    },

    loadState() {
      const saved = localStorage.getItem('userStore')
      if (saved) {
        const state = JSON.parse(saved)
        this.token = state.token
        this.refreshToken = state.refreshToken
        this.personalToken = state.personalToken
        this.personalRefreshToken = state.personalRefreshToken
        this.auth = state.auth
        this.user = state.user
        this.currentCompanyId = state.currentCompanyId
        this.currentRole = state.currentRole
        this.language = state.language || 'PT'
      }
    },

    /**
     * Decode JWT and sync state from token claims
     */
    syncFromToken(token: string) {
      const decoded = decodeJWT(token)
      if (!decoded) return

      // Extract companies from JWT if present
      if (decoded.companies && Array.isArray(decoded.companies)) {
        this.user.companies = decoded.companies
      }

      // Extract companyId and userRole if present (after select-company)
      if (decoded.companyId) {
        this.currentCompanyId = decoded.companyId
      }
      
      if (decoded.userRole || decoded.role) {
        this.currentRole = decoded.userRole || decoded.role
      }

      // Extract language if present
      if (decoded.user_language) {
        this.language = decoded.user_language
      }

      this.saveState()
    },

    /**
     * Handle signin response from backend
     * Implements B2B multi-tenant flow decision logic
     */
    handleSigninResponse(response: any) {
      const { id, username, email, language, companyId, companies } = response
      
      // Handle both OAuth2 and custom token formats
      const accessToken = response.access_token || response.token || response.accessToken
      const refreshToken = response.refresh_token || response.refreshToken
      
      // Set user data
      this.user = {
        id,
        username,
        email,
        language: language || 'PT',
        companies: companies || []
      }
      
      // Set tokens
      this.token = accessToken
      this.refreshToken = refreshToken
      this.setPersonalTokens(accessToken, refreshToken)
      this.auth = true
      this.language = language || 'PT'
      
      // Sync from token to extract additional claims
      if (accessToken) {
        this.syncFromToken(accessToken)
      }
      
      // If companyId is already set in response, update current company
      if (companyId) {
        const decoded = decodeJWT(accessToken)
        const userRole = decoded?.userRole || decoded?.role
        const selectedCompany = companies?.find((c: Company) => c.companyId === companyId)
        this.setCurrentCompany(companyId, userRole, selectedCompany?.companyName)
      }
      
      this.saveState()
      
      return {
        hasCompanies: (companies?.length || 0) > 0,
        hasMultipleCompanies: (companies?.length || 0) > 1,
        companyPreselected: !!companyId,
        companies: companies || []
      }
    },

    /**
     * Select company and update tokens
     * Calls backend API and replaces tokens
     */
    async selectCompany(companyId: string) {
      try {
        const response = await CompanyService.selectCompany(companyId)
        const { accessToken, refreshToken, userRole } = response.data
        
        // Replace tokens with new company-scoped tokens
        this.token = accessToken
        this.refreshToken = refreshToken
        
        // Decode new token to extract claims
        const decoded = decodeJWT(accessToken)
        const role = userRole || decoded?.userRole || decoded?.role
        const companyName = this.user.companies?.find((c: Company) => c.companyId === companyId)?.companyName
        
        // Update current company
        this.setCurrentCompany(companyId, role, companyName)
        
        // Sync any other claims from token
        this.syncFromToken(accessToken)
        
        return true
      } catch (error) {
        console.error('Error selecting company:', error)
        throw error
      }
    },

    /**
     * Create company after login and handle token scoping
     */
    async createCompanyAfterLogin(companyId: string) {
      try {
        // Call select-company to get company-scoped tokens
        const response = await CompanyService.selectCompany(companyId)
        const { accessToken, refreshToken, userRole } = response.data
        
        // Replace tokens with new company-scoped tokens
        this.token = accessToken
        this.refreshToken = refreshToken
        
        // Decode new token to extract claims
        const decoded = decodeJWT(accessToken)
        const role = userRole || decoded?.userRole || decoded?.role
        
        // Update current company
        this.setCurrentCompany(companyId, role)
        
        // Sync any other claims from token
        this.syncFromToken(accessToken)
        
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