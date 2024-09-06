// src/plugins/userStore.ts
import { defineStore } from 'pinia'

interface User {
  id?: number
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
  state: (): State => ({
    token: null,
    auth: false,
    user: {}
  }),
  getters: {
    getUser: (state) => state.user,
    isAuthenticated: (state) => state.auth,
    getToken: (state) => state.token
  },
  actions: {
    setToken(value: string | null) {
      this.token = value
    },
    setAuth(value: boolean) {
      this.auth = value
    },
    setUser(value: User) {
      this.user = value
    },
    resetUser() {
      this.setToken(null)
      this.setAuth(false)
      this.setUser({})
    }
  }
})
