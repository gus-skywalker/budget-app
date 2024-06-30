<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useTheme } from 'vuetify';
import { useUserStore } from '@/plugins/userStore';  // Importe a store de Pinia

const router = useRouter();
const theme = useTheme();
const userStore = useUserStore();  // Use a store de Pinia

interface Notification {
    id: number;
    user: {
        id: number;
        username: string;
        email: string;
        avatar: string;
    };
    message: string;
    status: string;
}


// Estado das notificações
const notifications = ref<Notification[]>([]);
const showNotifications = ref(false);

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

// Função para alternar a exibição das notificações
function toggleNotifications() {
    showNotifications.value = !showNotifications.value;
}

// Função para aceitar a notificação
function accept(notificationId: any) {
    fetch(`/api/notifications/${notificationId}/accept`, { method: 'PUT' })
        .then(() => {
            notifications.value = notifications.value.filter(n => n.id !== notificationId);
        });
}

// Função para declinar a notificação
function decline(notificationId: any) {
    fetch(`/api/notifications/${notificationId}/decline`, { method: 'PUT' })
        .then(() => {
            notifications.value = notifications.value.filter(n => n.id !== notificationId);
        });
}

// Configuração do WebSocket
let socket: WebSocket;
const reconnectInterval = 5000;  // Intervalo de reconexão de 5 segundos
let reconnectTimeout: any;

onMounted(() => {
    const connectWebSocket = () => {
        const userId = userStore.getUser.id;
        if (!userId) return;

        socket = new WebSocket(`ws://localhost:8080/notifications?userId=${userId}`);

        socket.onmessage = (event) => {
            const notification = JSON.parse(event.data);
            console.log(notification);
            notifications.value.push(notification);
        };

        socket.onclose = () => {
            console.log('WebSocket connection closed, attempting to reconnect...');
            reconnectTimeout = setTimeout(connectWebSocket, reconnectInterval);
        };

        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    };

    connectWebSocket();
});

onUnmounted(() => {
    if (socket) {
        socket.close();
    }
    if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
    }
});
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

        <v-switch @click="toggleTheme">Toggle</v-switch>

        <!-- Notification Bell Icon -->
        <div class="notification-icon" @click="toggleNotifications">
            <v-badge :content="notifications.length" color="red" overlap>
                <v-icon>mdi-bell</v-icon>
            </v-badge>
        </div>

        <!-- Notification Dropdown -->
        <div v-if="showNotifications" class="notification-dropdown">
            <ul>
                <li v-for="notification in notifications" :key="notification.id">
                    {{ notification.message }}
                    <button @click="accept(notification.id)">Accept</button>
                    <button @click="decline(notification.id)">Decline</button>
                </li>
            </ul>
        </div>
    </v-navigation-drawer>
</template>

<style scoped>
/* Add any necessary styles here */
.notification-icon {
    cursor: pointer;
    position: relative;
}

.notification-dropdown {
    position: absolute;
    top: 50px;
    right: 0;
    background: white;
    border: 1px solid #ccc;
    z-index: 1000;
}
</style>
