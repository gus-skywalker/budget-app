<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useTheme } from 'vuetify';
import { useUserStore } from '@/plugins/userStore';  // Importe a store de Pinia

const router = useRouter();
const theme = useTheme();
const userStore = useUserStore();  // Use a store de Pinia

// Computed property para acessar o usuário da store
const user = computed(() => userStore.getUser);

// Método para fazer logout do usuário
const logoutUser = () => {
    userStore.resetUser();  // Use o método da store de Pinia
    router.push('/login');
}

// Função para redirecionar os usuários para a página de login OAuth2
function redirectToOAuth2LoginPage() {
    // Substitua 'oauth2_login_url' pelo URL real da sua página de login OAuth2
    window.location.href = 'http://localhost:9000/login';
}

// Função para alternar o tema
function toggleTheme(): void {
    const isLightTheme = computed(() => theme.global.name.value === 'light');
    theme.global.name.value = isLightTheme.value ? 'dark' : 'light';
}
</script>

<template>
    <v-navigation-drawer app expand-on-hover rail>
        <v-list v-if="user">
            <v-list-item :prepend-avatar="user.avatar" :subtitle="user.email" :title="user.username"></v-list-item>
            <v-list-item @click="logoutUser" title="Logout" prepend-icon="mdi-logout"></v-list-item>
        </v-list>
        <v-list v-else>
            <!-- Instead of directly logging in, redirect users to the OAuth2 login page -->
            <v-btn @click="redirectToOAuth2LoginPage">Login with OAuth2</v-btn>
        </v-list>

        <v-divider></v-divider>

        <v-list density="compact" nav>
            <v-list-item prepend-icon="mdi-home" title="Home" :to="{ name: 'home' }"></v-list-item>
            <v-list-item prepend-icon="mdi-currency-usd" title="Budget" :to="{ name: 'budget' }"></v-list-item>
            <v-list-item prepend-icon="mdi-view-dashboard" title="Dashboard" :to="{ name: 'dashboard' }"></v-list-item>
            <v-list-item prepend-icon="mdi-information" title="About" :to="{ name: 'about' }"></v-list-item>
        </v-list>

        <v-divider></v-divider>

        <v-switch @click="toggleTheme" label="Dark Mode">Toggle</v-switch>
    </v-navigation-drawer>
</template>

<style scoped>
/* Add any necessary styles here */
</style>
