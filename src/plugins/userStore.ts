// src/plugins/userStore.ts
import { defineStore } from 'pinia'

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
  companies?: Company[]
}

type State = {
  token: string | null
  refreshToken: string | null
  auth: boolean
  user: User
  currentCompanyId: string | null
  currentRole: string | null
}

export const useUserStore = defineStore({
  id: 'userStore',
  
  state: (): State => ({
    token: null,
    refreshToken: null,
    auth: false,
    user: {},
    currentCompanyId: null,
    currentRole: null
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
    isAdmin: (state): boolean => state.currentRole === 'admin'
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
      this.user = user
      this.saveState()
    },

    setCurrentCompany(companyId: string, role: string) {
      this.currentCompanyId = companyId
      this.currentRole = role
      this.saveState()
    },

    setCompanies(companies: Company[]) {
      this.user.companies = companies
      this.saveState()
    },

    resetUser() {
      this.token = null
      this.refreshToken = null
      this.auth = false
      this.user = {}
      this.currentCompanyId = null
      this.currentRole = null
      this.saveState()
    },

    saveState() {
      sessionStorage.setItem('userStore', JSON.stringify({
        token: this.token,
        refreshToken: this.refreshToken,
        auth: this.auth,
        user: this.user,
        currentCompanyId: this.currentCompanyId,
        currentRole: this.currentRole
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
        this.currentRole = state.currentRole
      }
    }
  }
})