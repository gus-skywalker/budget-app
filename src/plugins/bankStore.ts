// plugins/bankStore.ts

import { defineStore } from 'pinia'

interface BankState {
  nubankToken: string | null
  bbToken: string | null
  otherBankToken: string | null
}

export const useBankStore = defineStore({
  id: 'bankStore',
  state: (): BankState => ({
    nubankToken: null,
    bbToken: null,
    otherBankToken: null
  }),
  getters: {
    getNubankToken: (state) => state.nubankToken,
    getBbToken: (state) => state.bbToken,
    getOtherBankToken: (state) => state.otherBankToken
  },
  actions: {
    setNubankToken(token: string | null) {
      this.nubankToken = token
    },
    setBBToken(token: string | null) {
      this.bbToken = token
    },
    setOtherBankToken(token: string | null) {
      this.otherBankToken = token
    },
    clearTokens() {
      this.nubankToken = null
      this.bbToken = null
      this.otherBankToken = null
    }
  }
})
