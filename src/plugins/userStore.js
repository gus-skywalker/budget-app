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
            refreshToken: null,
            auth: false,
            user: {},
            currentCompany: null, // { companyId, companyName, role }
            companies: [] // Array de empresas do usuário
        };
    },
    getters: {
        getUser: (state) => state.user,
        isAuthenticated: (state) => state.auth,
        getToken: (state) => state.token,
        getRefreshToken: (state) => state.refreshToken,
        getCurrentCompany: (state) => state.currentCompany,
        getCompanies: (state) => state.companies,
        getUserRole: (state) => state.currentCompany?.role || null,
        hasMultipleCompanies: (state) => state.companies?.length > 1
    },
    actions: {
        setToken(value) {
            this.token = value;
            this.saveState();
        },
        setRefreshToken(value) {
            this.refreshToken = value;
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
        setCompanies(companies) {
            this.companies = companies || [];
            this.saveState();
        },
        setCurrentCompany(companyId, role, companyName = null) {
            // Encontra a empresa na lista ou cria objeto básico
            const company = this.companies?.find(c => c.companyId === companyId) || {};
            
            this.currentCompany = {
                companyId,
                role,
                companyName: companyName || company.companyName || company.name || 'Empresa'
            };
            this.saveState();
        },
        clearCurrentCompany() {
            this.currentCompany = null;
            this.saveState();
        },
        resetUser() {
            this.setToken(null);
            this.setRefreshToken(null);
            this.setAuth(false);
            this.setUser({});
            this.setCompanies([]);
            this.clearCurrentCompany();
            this.saveState();
        },
        saveState() {
            // Salva o estado atual no sessionStorage
            const state = {
                token: this.token,
                refreshToken: this.refreshToken,
                auth: this.auth,
                user: this.user,
                currentCompany: this.currentCompany,
                companies: this.companies
            };
            sessionStorage.setItem('userStore', JSON.stringify(state));
        }
    }
});
