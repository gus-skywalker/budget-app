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

export const useUserStore = defineStore('user', {
  state: (): State => {
    const saved = sessionStorage.getItem('userStore')
    if (saved) {
      const parsed = JSON.parse(saved)
      // Garante que refreshToken existe no estado salvo
      return {
        token: parsed.token || null,
        refreshToken: parsed.refreshToken || null, // ✅ Garante que não seja undefined
        auth: parsed.auth || false,
        user: parsed.user || {}
      }
    }
    return {
      token: null,
      refreshToken: null, // ✅ Inicializa como null, não undefined
      auth: false,
      user: {}
    }
  },

  getters: {
    getUser: (state) => state.user,
    isAuthenticated: (state) => state.auth,
    getToken: (state) => state.token,
    getRefreshToken: (state) => state.refreshToken
  },

  actions: {
    setToken(token: string | null) {
      this.token = token
      this.saveState()
    },

    setRefreshToken(refreshToken: string | null) {
      this.refreshToken = refreshToken
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
      // Garante que undefined vire null antes de salvar
      const stateToSave = {
        token: this.token,
        refreshToken: this.refreshToken === undefined ? null : this.refreshToken,
        auth: this.auth,
        user: this.user
      }
      sessionStorage.setItem('userStore', JSON.stringify(stateToSave))
    }
  }
})