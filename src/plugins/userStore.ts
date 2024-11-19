// src/plugins/userStore.ts
import { defineStore } from 'pinia'

interface User {
  id?: string
  username?: string
  email?: string
  avatar?: string
}

interface State {
  token: string | null
  auth: boolean
  user: User
}

export const useUserStore = defineStore('userStore', {
  state: (): State => {
    // Tenta carregar o estado do sessionStorage
    const storedState = sessionStorage.getItem('userStore')
    if (storedState) {
      return JSON.parse(storedState)
    }
    // Estado padrão se nada estiver armazenado
    return {
      token: null,
      auth: false,
      user: {}
    }
  },
  getters: {
    getUser: (state) => state.user,
    isAuthenticated: (state) => state.auth,
    getToken: (state) => state.token
  },
  actions: {
    setToken(value: string | null) {
      this.token = value
      this.saveState()
    },
    setAuth(value: boolean) {
      this.auth = value
      this.saveState()
    },
    setUser(value: User) {
      this.user = value
      this.saveState()
    },
    resetUser() {
      this.setToken(null)
      this.setAuth(false)
      this.setUser({})
      this.saveState()
    },
    saveState() {
      // Salva o estado atual no sessionStorage
      const state = {
        token: this.token,
        auth: this.auth,
        user: this.user
      }
      sessionStorage.setItem('userStore', JSON.stringify(state))
    }
  }
})
