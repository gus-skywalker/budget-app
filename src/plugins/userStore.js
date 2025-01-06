// src/plugins/userStore.ts
import { defineStore } from 'pinia';
export const useUserStore = defineStore('userStore', {
    state: () => {
        // Tenta carregar o estado do sessionStorage
        const storedState = sessionStorage.getItem('userStore');
        if (storedState) {
            return JSON.parse(storedState);
        }
        // Estado padrão se nada estiver armazenado
        return {
            token: null,
            auth: false,
            user: {}
        };
    },
    getters: {
        getUser: (state) => state.user,
        isAuthenticated: (state) => state.auth,
        getToken: (state) => state.token
    },
    actions: {
        setToken(value) {
            this.token = value;
            this.saveState();
        },
        setAuth(value) {
            this.auth = value;
            this.saveState();
        },
        setUser(value) {
            this.user = value;
            this.saveState();
        },
        resetUser() {
            this.setToken(null);
            this.setAuth(false);
            this.setUser({});
            this.saveState();
        },
        saveState() {
            // Salva o estado atual no sessionStorage
            const state = {
                token: this.token,
                auth: this.auth,
                user: this.user
            };
            sessionStorage.setItem('userStore', JSON.stringify(state));
        }
    }
});
