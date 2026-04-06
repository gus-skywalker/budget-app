<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from 'vuetify'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/plugins/userStore'
import type { Notification } from '@/services/NotificationService'
import WorkspaceSwitcher from '@/components/WorkspaceSwitcher.vue'
import type { RouteLocationRaw } from 'vue-router'

// Import props and emits
const props = defineProps<{
  notifications: Notification[]
}>()

const notifications = computed(() => props.notifications)

const emit = defineEmits(['toggle-notifications-popup'])

const router = useRouter()
const theme = useTheme()
const { t } = useI18n()
const userStore = useUserStore()
const showLogoutDialog = ref(false)
const expandOnHover = ref(true)
const isMobile = ref(false)

type NavItem = {
  key: string
  title: string
  icon: string
  to?: RouteLocationRaw
  disabled: boolean
  primary?: boolean
}

type NavSection = {
  key: string
  title: string
  items: NavItem[]
}

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

// Função para alternar o tema
function toggleTheme() {
  const currentTheme = theme.global.current.value.dark ? 'light' : 'dark'
  theme.global.name.value = currentTheme
}

// Função para alternar a exibição das notificações
function toggleNotifications() {
  emit('toggle-notifications-popup', true)
}

function navigateToAccountAdmin() {
  router.push({ name: 'settings' })
}

const navSections = computed<NavSection[]>(() => [
  {
    key: 'decisions',
    title: t('sidebar.sections.decisions'),
    items: [
      {
        key: 'decisions',
        title: t('sidebar.decisions'),
        icon: 'mdi-lightbulb-outline',
        to: { name: 'decisions' },
        primary: true,
        disabled: false,
      },
      {
        key: 'insights',
        title: t('sidebar.insights'),
        icon: 'mdi-brain',
        to: { name: 'insights' },
        disabled: false,
      },
      {
        key: 'activity',
        title: t('sidebar.activity'),
        icon: 'mdi-timeline-text-outline',
        to: { name: 'activity' },
        disabled: false,
      },
    ],
  },
  {
    key: 'planning',
    title: t('sidebar.sections.planning'),
    items: [
      {
        key: 'planning-budget',
        title: t('sidebar.planning_budget'),
        icon: 'mdi-wallet-outline',
        to: { name: 'planning-budget' },
        disabled: false,
      },
      {
        key: 'planning-scenarios',
        title: t('sidebar.planning_scenarios'),
        icon: 'mdi-layers-triple-outline',
        to: { name: 'planning-scenarios' },
        disabled: false,
      },
      {
        key: 'planning-goals',
        title: t('sidebar.planning_goals'),
        icon: 'mdi-bullseye-arrow',
        to: { name: 'planning-goals' },
        disabled: false,
      },
    ],
  },
  {
    key: 'dashboard',
    title: t('sidebar.sections.overview'),
    items: [
      {
        key: 'overview',
        title: t('sidebar.overview'),
        icon: 'mdi-view-dashboard',
        to: { name: 'dashboard' },
        disabled: false,
      },
      {
        key: 'cashflow',
        title: t('sidebar.cashflow'),
        icon: 'mdi-chart-areaspline',
        to: { name: 'cashflow' },
        disabled: false,
      },
      {
        key: 'report',
        title: t('sidebar.report'),
        icon: 'mdi-file-chart',
        to: { name: 'report' },
        disabled: false,
      },
    ],
  },
  {
    key: 'system',
    title: t('sidebar.sections.system'),
    items: [
      {
        key: 'workspace-personal',
        title: t('sidebar.workspace.personal_finance'),
        icon: 'mdi-briefcase-outline',
        disabled: true,
        to: undefined,
      },
      {
        key: 'home',
        title: t('sidebar.home'),
        icon: 'mdi-home',
        to: { name: 'home' },
        disabled: false,
      },
      {
        key: 'transactions',
        title: t('sidebar.transactions'),
        icon: 'mdi-swap-horizontal',
        to: { name: 'budget' },
        disabled: false,
      },
      {
        key: 'accounts',
        title: t('sidebar.accounts'),
        icon: 'mdi-bank-outline',
        to: { name: 'accounts' },
        disabled: false,
      },
      {
        key: 'categories',
        title: t('sidebar.categories'),
        icon: 'mdi-shape-outline',
        to: { name: 'categories' },
        disabled: false,
      },
      {
        key: 'settings',
        title: t('sidebar.settings'),
        icon: 'mdi-cog-outline',
        to: { name: 'settings' },
        disabled: false,
      },
    ],
  },
])
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

    <div class="workspace-switcher-wrapper">
      <WorkspaceSwitcher />
    </div>

    <v-list density="compact" nav>
      <template v-for="section in navSections" :key="section.key">
        <v-list-subheader class="sidebar-section">{{ section.title }}</v-list-subheader>
        <template v-for="item in section.items" :key="item.key">
          <template v-if="isMobile">
            <v-tooltip :text="item.title" location="end">
              <template v-slot:activator="{ props }">
                <v-list-item
                  v-bind="props"
                  :prepend-icon="item.icon"
                  :title="item.title"
                  :class="{ 'primary-nav-item': item.primary }"
                  v-if="item.to"
                  :to="item.to"
                  :disabled="item.disabled"
                ></v-list-item>
                <v-list-item
                  v-bind="props"
                  :prepend-icon="item.icon"
                  :title="item.title"
                  :class="{ 'primary-nav-item': item.primary }"
                  v-else
                  :disabled="item.disabled"
                ></v-list-item>
              </template>
            </v-tooltip>
          </template>
          <template v-else>
            <v-list-item
              :prepend-icon="item.icon"
              :title="item.title"
              :class="{ 'primary-nav-item': item.primary }"
              v-if="item.to"
              :to="item.to"
              :disabled="item.disabled"
            ></v-list-item>
            <v-list-item
              :prepend-icon="item.icon"
              :title="item.title"
              :class="{ 'primary-nav-item': item.primary }"
              v-else
              :disabled="item.disabled"
            ></v-list-item>
          </template>
        </template>
      </template>
    </v-list>

    <v-divider></v-divider>

    <v-tooltip :text="$t('sidebar.toggle_theme_tooltip')" location="end">
      <template v-slot:activator="{ props }">
        <v-switch v-bind="props" @click="toggleTheme" hide-details class="ml-4 mt-2">
          <template v-slot:prepend>
            <v-icon>{{ theme.global.current.value.dark ? 'mdi-weather-night' : 'mdi-weather-sunny' }}</v-icon>
          </template>
        </v-switch>
      </template>
    </v-tooltip>

    <v-tooltip :text="$t('sidebar.notifications_tooltip')" location="end">
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
.sidebar-section {
  margin-top: 8px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(0, 0, 0, 0.5);
}

.v-theme--dark .sidebar-section {
  color: rgba(255, 255, 255, 0.5);
}

.primary-nav-item {
  background: rgba(79, 70, 229, 0.12);
  border: 1px solid rgba(79, 70, 229, 0.28);
  border-radius: 10px;
  margin: 2px 6px;
}

.v-theme--dark .primary-nav-item {
  background: rgba(99, 102, 241, 0.22);
  border-color: rgba(129, 140, 248, 0.4);
}
</style>


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

.workspace-switcher-wrapper {
  padding: 12px 16px;
}

.workspace-switcher-wrapper :deep(.workspace-switcher-btn) {
  width: 100%;
  justify-content: flex-start;
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
