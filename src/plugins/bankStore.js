// plugins/bankStore.ts
import { defineStore } from 'pinia';
export const useBankStore = defineStore({
    id: 'bankStore',
    state: () => ({
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
        setNubankToken(token) {
            this.nubankToken = token;
        },
        setBBToken(token) {
            this.bbToken = token;
        },
        setOtherBankToken(token) {
            this.otherBankToken = token;
        },
        clearTokens() {
            this.nubankToken = null;
            this.bbToken = null;
            this.otherBankToken = null;
        }
    }
});
