<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDisplay, useTheme } from 'vuetify'
import { useUserStore } from '@/plugins/userStore'
import type { Notification } from '@/services/NotificationService'

// Import props and emits
const props = defineProps<{
  notifications: Notification[]
}>()

const emit = defineEmits(['accept', 'decline', 'toggle-notifications-popup'])

const router = useRouter()
const theme = useTheme()
const userStore = useUserStore()

var expandOnHover = true;
// const isMobile = ref('')
// let mql
// const display = useDisplay()
onMounted(() => {
  console.log(window.innerWidth)
  if (window.innerWidth < 780) {
    console.log(window.screen.width)
    expandOnHover = false;
  }
})

// onMounted(() => {
//   mql = window.matchMedia('(max-width: 1024px)')
//   isMobile.value = mql.matches
//   mql.addEventListener('change', handleMqlChange)
// })

// onUnmounted(() => {
//   mql.removeEventListener('change', handleMqlChange)
// })


// Computed property para acessar o usuário da store
const user = computed(() => userStore.getUser)

const userAvatar = computed(() => user.value?.avatar || '/favicon.ico')

// Método para fazer logout do usuário
const logoutUser = () => {
  userStore.resetUser()
  router.push('/login')
}

// Função para redirecionar os usuários para a página de login OAuth2
function redirectToOAuth2LoginPage() {
  const authUrl = `${import.meta.env.VITE_API_BASE_URL}/login`
  window.location.href = authUrl;
}

// Função para alternar o tema
function toggleTheme() {
  const isLightTheme = computed(() => theme.global.name.value === 'light')
  theme.global.name.value = isLightTheme.value ? 'dark' : 'light'
}

// Função para alternar a exibição das notificações
function toggleNotifications() {
  emit('toggle-notifications-popup', true)
}

// Função para aceitar a notificação
function accept(notificationId: number) {
  emit('accept', notificationId)
}

// Função para declinar a notificação
function decline(notificationId: number) {
  emit('decline', notificationId)
}

function navigateToAccountAdmin() {
  router.push({ name: 'account-admin' })
}
</script>

<template>
  <v-navigation-drawer app :expand-on-hover="expandOnHover" rail ref="drawer" permanent>
    <v-list v-if="user">
      <v-list-item :prepend-avatar="userAvatar" :subtitle="user.email" :title="user.username"
        @click="navigateToAccountAdmin"></v-list-item>
      <v-list-item @click="logoutUser" title="Logout" prepend-icon="mdi-logout"></v-list-item>
    </v-list>
    <v-list v-else>
      <v-btn @click="redirectToOAuth2LoginPage">Login with OAuth2</v-btn>
    </v-list>

    <v-divider></v-divider>

    <v-list density="compact" nav>
      <v-list-item prepend-icon="mdi-view-dashboard" title="Dashboard" :to="{ name: 'dashboard' }"></v-list-item>
      <v-list-item prepend-icon="mdi-currency-usd" title="Budget" :to="{ name: 'budget' }"></v-list-item>
      <v-list-item prepend-icon="mdi-account-group" title="Groups" :to="{ name: 'group' }"></v-list-item>
      <v-list-item prepend-icon="mdi-bullseye-arrow" title="Goals" :to="{ name: 'goal' }"></v-list-item>
      <v-list-item prepend-icon="mdi-home" title="Home" :to="{ name: 'home' }"></v-list-item>
    </v-list>

    <v-divider></v-divider>

    <v-switch @click="toggleTheme">Toggle</v-switch>

    <div class="notification-icon" @click="toggleNotifications">
      <v-badge :content="notifications.length" color="red" overlap>
        <v-icon>mdi-bell</v-icon>
      </v-badge>
    </div>

  </v-navigation-drawer>
</template>

<style scoped>
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
