<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
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
const expandOnHover = ref(true)
const isMobile = ref(false)

// Função para verificar se é mobile
const checkMobile = () => {
  const width = window.innerWidth
  isMobile.value = width < 780
  expandOnHover.value = !isMobile.value
  console.log('Width:', width, 'isMobile:', isMobile.value, 'expandOnHover:', expandOnHover.value)
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
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
  <v-navigation-drawer 
    app 
    :expand-on-hover="expandOnHover" 
    :rail="true"
    permanent
    ref="drawer"
  >
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
      <v-tooltip text="Dashboard" location="end">
        <template v-slot:activator="{ props }">
          <v-list-item v-bind="props" prepend-icon="mdi-view-dashboard" :title="$t('sidebar.dashboard')"
            :to="{ name: 'dashboard' }"></v-list-item>
        </template>
      </v-tooltip>

      <v-tooltip text="Orçamento" location="end">
        <template v-slot:activator="{ props }">
          <v-list-item v-bind="props" prepend-icon="mdi-currency-usd" :title="$t('sidebar.budget')" 
            :to="{ name: 'budget' }"></v-list-item>
        </template>
      </v-tooltip>

      <v-tooltip text="Grupos" location="end">
        <template v-slot:activator="{ props }">
          <v-list-item v-bind="props" prepend-icon="mdi-account-group" :title="$t('sidebar.groups')" 
            :to="{ name: 'group' }"></v-list-item>
        </template>
      </v-tooltip>

      <v-tooltip text="Metas Financeiras" location="end">
        <template v-slot:activator="{ props }">
          <v-list-item v-bind="props" prepend-icon="mdi-bullseye-arrow" :title="$t('sidebar.goals')"
            :to="{ name: 'financialgoal' }"></v-list-item>
        </template>
      </v-tooltip>

      <v-tooltip text="Relatórios" location="end">
        <template v-slot:activator="{ props }">
          <v-list-item v-bind="props" prepend-icon="mdi-file-chart" :title="$t('sidebar.report')" 
            :to="{ name: 'report' }"></v-list-item>
        </template>
      </v-tooltip>

      <v-tooltip text="Início" location="end">
        <template v-slot:activator="{ props }">
          <v-list-item v-bind="props" prepend-icon="mdi-home" :title="$t('sidebar.home')" 
            :to="{ name: 'home' }"></v-list-item>
        </template>
      </v-tooltip>
    </v-list>

    <v-divider></v-divider>

    <v-tooltip text="Alternar Tema" location="end">
      <template v-slot:activator="{ props }">
        <v-switch v-bind="props" @click="toggleTheme" hide-details class="ml-4 mt-2">
          <template v-slot:prepend>
            <v-icon>{{ theme.global.current.value.dark ? 'mdi-weather-night' : 'mdi-weather-sunny' }}</v-icon>
          </template>
        </v-switch>
      </template>
    </v-tooltip>

    <v-tooltip text="Notificações" location="end">
      <template v-slot:activator="{ props }">
        <div v-bind="props" class="notification-icon" @click="toggleNotifications">
          <v-badge :content="notifications.length" color="red" overlap>
            <v-icon>mdi-bell</v-icon>
          </v-badge>
        </div>
      </template>
    </v-tooltip>
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
        <v-btn color="grey" variant="text" @click="cancelLogout">
          {{ $t('sidebar.cancel') }}
        </v-btn>
        <v-btn color="red" variant="text" @click="logoutUser">
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
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  margin: 8px 0;
  width: 56px; /* Largura fixa do rail */
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
