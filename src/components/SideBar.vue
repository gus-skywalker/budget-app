<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from 'vuetify'
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
const showLogoutDialog = ref(false)

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

// Método para abrir o diálogo de confirmação de logout
const confirmLogout = () => {
  showLogoutDialog.value = true
}

// Método para cancelar o logout
const cancelLogout = () => {
  showLogoutDialog.value = false
}

// Função para redirecionar os usuários para a página de login OAuth2
function redirectToOAuth2LoginPage() {
  const authUrl = `${import.meta.env.VITE_API_BASE_URL}/login`
  window.location.href = authUrl;
}

const availableLanguages = [
  { text: 'English', value: 'en' },
  { text: 'Português', value: 'pt' },
];

// Função para alternar o tema
function toggleTheme() {
  const currentTheme = theme.global.current.value.dark ? 'light' : 'dark'
  theme.global.name.value = currentTheme
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
  router.push({ name: 'settings' })
}
</script>

<template>
  <v-navigation-drawer app :expand-on-hover="expandOnHover" rail ref="drawer" permanent>
    <v-list v-if="user">
      <v-list-item :prepend-avatar="userAvatar" :subtitle="user.email" :title="user.username"
        @click="navigateToAccountAdmin"></v-list-item>
      <v-list-item @click="confirmLogout" :title="$t('sidebar.logout')" prepend-icon="mdi-logout"></v-list-item>
    </v-list>
    <v-list v-else>
      <v-btn @click="redirectToOAuth2LoginPage">{{ $t('sidebar.login_oauth2') }}</v-btn>
    </v-list>

    <v-divider></v-divider>

    <v-list density="compact" nav>
      <v-list-item prepend-icon="mdi-view-dashboard" :title="$t('sidebar.dashboard')"
        :to="{ name: 'dashboard' }"></v-list-item>
      <v-list-item prepend-icon="mdi-currency-usd" :title="$t('sidebar.budget')" :to="{ name: 'budget' }"></v-list-item>
      <v-list-item prepend-icon="mdi-account-group" :title="$t('sidebar.groups')" :to="{ name: 'group' }"></v-list-item>
      <v-list-item prepend-icon="mdi-bullseye-arrow" :title="$t('sidebar.goals')"
        :to="{ name: 'financialgoal' }"></v-list-item>
      <v-list-item prepend-icon="mdi-home" :title="$t('sidebar.home')" :to="{ name: 'home' }"></v-list-item>
      <v-list-item prepend-icon="mdi-file-chart" :title="$t('sidebar.report')" :to="{ name: 'report' }"></v-list-item>
    </v-list>

    <v-divider></v-divider>

    <v-switch @click="toggleTheme" :label="$t('sidebar.toggle_theme')"></v-switch>

    <div class="notification-icon" @click="toggleNotifications">
      <v-badge :content="notifications.length" color="red" overlap>
        <v-icon>mdi-bell</v-icon>
      </v-badge>
    </div>
  </v-navigation-drawer>

  <!-- Diálogo de confirmação de logout -->
  <v-dialog v-model="showLogoutDialog" max-width="400">
    <v-card>
      <v-card-title class="headline">
        {{ $t('sidebar.logout_confirmation_title') }}
      </v-card-title>
      <v-card-text>
        {{ $t('sidebar.logout_confirmation_message') }}
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="grey" text @click="cancelLogout">
          {{ $t('sidebar.cancel') }}
        </v-btn>
        <v-btn color="red" text @click="logoutUser">
          {{ $t('sidebar.confirm') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
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

.language-select {
  max-width: 120px;
  font-size: 0.9rem;
}
</style>
