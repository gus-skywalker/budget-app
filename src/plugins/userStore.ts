// src/plugins/userStore.ts
import { defineStore } from 'pinia'

interface User {
  id?: string
  username?: string
  email?: string
  avatar?: string
}

type State = {
  token: string | null
  refreshToken: string | null
  auth: boolean
  user: User
}

export const useUserStore = defineStore({
  id: 'user',
  
  state: (): State => {
    // Tenta carregar do sessionStorage (igual na versão anterior)
    const saved = sessionStorage.getItem('userStore')
    if (saved) {
      return JSON.parse(saved)
    }
    // Estado padrão
    return {
      token: null,
      refreshToken: null,
      auth: false,
      user: {}
    }
  },

  getters: {
    getUser: (state): User => state.user,
    isAuthenticated: (state): boolean => state.auth,
    getToken: (state): string | null => state.token,
    getRefreshToken: (state): string | null => state.refreshToken
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

    resetUser() {
      this.token = null
      this.refreshToken = null
      this.auth = false
      this.user = {}
      this.saveState()
    },

    saveState() {
      sessionStorage.setItem('userStore', JSON.stringify({
        token: this.token,
        refreshToken: this.refreshToken,
        auth: this.auth,
        user: this.user
      }))
    },

    // Método opcional para recarregar manualmente se necessário
    loadState() {
      const saved = sessionStorage.getItem('userStore')
      if (saved) {
        const state = JSON.parse(saved)
        this.token = state.token
        this.refreshToken = state.refreshToken || null // compatibilidade com versão anterior
        this.auth = state.auth
        this.user = state.user
      }
    }
  }
})