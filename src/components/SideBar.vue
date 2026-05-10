<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTheme } from 'vuetify'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/plugins/userStore'
import WorkspaceSwitcher from '@/components/WorkspaceSwitcher.vue'
import type { RouteLocationRaw } from 'vue-router'

const router = useRouter()
const route = useRoute()
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

const checkMobile = () => {
  const width = window.innerWidth
  isMobile.value = width < 780
  expandOnHover.value = !isMobile.value
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

const user = computed(() => userStore.getUser)
const userAvatar = computed(() => user.value?.avatar || '/favicon.ico')

const logoutUser = async () => {
  showLogoutDialog.value = false
  await userStore.logout()
  await router.push('/login')
}

const confirmLogout = () => {
  showLogoutDialog.value = true
}

const cancelLogout = () => {
  showLogoutDialog.value = false
}

function redirectToOAuth2LoginPage() {
  const authUrl = `${import.meta.env.VITE_API_BASE_URL}/login`
  window.location.href = authUrl
}

function toggleTheme() {
  const currentTheme = theme.global.current.value.dark ? 'light' : 'dark'
  theme.global.name.value = currentTheme
}

function navigateToAccountAdmin() {
  router.push({ name: 'settings' })
}

const mainNavSections = computed<NavSection[]>(() => [
  {
    key: 'decision',
    title: t('sidebar.sections.decisions'),
    items: [
      {
        key: 'decisions',
        title: t('sidebar.decisions'),
        icon: 'mdi-lightbulb-outline',
        to: { name: 'decisions' },
        primary: true,
        disabled: false
      },
      {
        key: 'insights',
        title: t('sidebar.insights'),
        icon: 'mdi-brain',
        to: { name: 'insights' },
        disabled: false
      },
      {
        key: 'activity',
        title: t('sidebar.activity'),
        icon: 'mdi-timeline-text-outline',
        to: { name: 'activity' },
        disabled: false
      },
      {
        key: 'blog-app',
        title: 'Blog',
        icon: 'mdi-post-outline',
        to: { name: 'blog-app' },
        disabled: false
      }
    ]
  },
  {
    key: 'financials',
    title: t('sidebar.sections.financials'),
    items: [
      {
        key: 'overview',
        title: t('sidebar.overview'),
        icon: 'mdi-view-dashboard',
        to: { name: 'dashboard' },
        disabled: false
      },
      {
        key: 'transactions',
        title: t('sidebar.transactions'),
        icon: 'mdi-swap-horizontal',
        to: { name: 'budget' },
        disabled: false
      },
      {
        key: 'accounts',
        title: t('sidebar.accounts'),
        icon: 'mdi-bank-outline',
        to: { name: 'accounts' },
        disabled: false
      },
      {
        key: 'categories',
        title: t('sidebar.categories'),
        icon: 'mdi-shape-outline',
        to: { name: 'categories' },
        disabled: false
      }
    ]
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
        disabled: false
      },
      {
        key: 'planning-scenarios',
        title: t('sidebar.planning_scenarios'),
        icon: 'mdi-layers-triple-outline',
        to: { name: 'planning-scenarios' },
        disabled: false
      },
      {
        key: 'planning-goals',
        title: t('sidebar.planning_goals'),
        icon: 'mdi-bullseye-arrow',
        to: { name: 'planning-goals' },
        disabled: false
      }
    ]
  }
])

const settingsItems = computed<NavItem[]>(() => [
  {
    key: 'settings',
    title: t('sidebar.settings'),
    icon: 'mdi-cog-outline',
    to: { name: 'settings' },
    disabled: false
  },
  {
    key: 'workspace',
    title: t('sidebar.workspace.label'),
    icon: 'mdi-briefcase-outline',
    to: userStore.hasMultipleWorkspaces ? { name: 'select-workspace' } : undefined,
    disabled: !userStore.hasMultipleWorkspaces
  }
])

const legalItems = computed<NavItem[]>(() => [
  {
    key: 'privacy-policy',
    title: t('sidebar.legal.privacy_policy'),
    icon: 'mdi-shield-account-outline',
    to: { name: 'privacy-policy' },
    disabled: false
  },
  {
    key: 'terms-of-use',
    title: t('sidebar.legal.terms_of_service'),
    icon: 'mdi-file-document-outline',
    to: { name: 'terms-of-use' },
    disabled: false
  },
  {
    key: 'cookie-policy',
    title: t('sidebar.legal.cookie_policy'),
    icon: 'mdi-cookie-outline',
    to: { name: 'cookie-policy' },
    disabled: false
  }
])

function isItemActive(item: NavItem): boolean {
  if (!item.to) return false
  const target = router.resolve(item.to)
  return target.name === route.name
}
</script>

<template>
  <v-navigation-drawer app :expand-on-hover="expandOnHover" :rail="true" permanent ref="drawer">
    <v-list v-if="user">
      <v-list-item
        :prepend-avatar="userAvatar"
        :subtitle="user.email"
        :title="user.username"
        @click="navigateToAccountAdmin"
      ></v-list-item>
    </v-list>
    <v-list v-else>
      <v-btn @click="redirectToOAuth2LoginPage">{{ $t('sidebar.login_oauth2') }}</v-btn>
    </v-list>

    <v-divider></v-divider>

    <div class="workspace-switcher-wrapper">
      <WorkspaceSwitcher />
    </div>

    <v-list class="sidebar-main-list" density="compact" nav>
      <template v-for="section in mainNavSections" :key="section.key">
        <v-list-subheader class="sidebar-section">{{ section.title }}</v-list-subheader>
        <v-tooltip v-for="item in section.items" :key="item.key" :text="item.title" location="end">
          <template v-slot:activator="{ props }">
            <v-list-item
              v-bind="props"
              :prepend-icon="item.icon"
              :title="item.title"
              :to="item.to"
              :disabled="item.disabled"
              :active="isItemActive(item)"
              :class="{
                'primary-nav-item': item.primary,
                'active-nav-item': isItemActive(item)
              }"
            ></v-list-item>
          </template>
        </v-tooltip>
        <v-divider class="section-divider"></v-divider>
      </template>
    </v-list>

    <v-spacer></v-spacer>

    <div class="sidebar-settings">
      <v-list density="compact" nav>
        <v-list-subheader class="sidebar-section">{{
          $t('sidebar.sections.settings')
        }}</v-list-subheader>
        <v-tooltip v-for="item in settingsItems" :key="item.key" :text="item.title" location="end">
          <template v-slot:activator="{ props }">
            <v-list-item
              v-bind="props"
              :prepend-icon="item.icon"
              :title="item.title"
              :to="item.to"
              :disabled="item.disabled"
              :active="isItemActive(item)"
              :class="{ 'active-nav-item': isItemActive(item) }"
            ></v-list-item>
          </template>
        </v-tooltip>
        <v-list-group value="legal" prepend-icon="mdi-scale-balance">
          <template v-slot:activator="{ props }">
            <v-list-item v-bind="props" :title="$t('sidebar.legal.title')"></v-list-item>
          </template>
          <v-tooltip v-for="item in legalItems" :key="item.key" :text="item.title" location="end">
            <template v-slot:activator="{ props }">
              <v-list-item
                v-bind="props"
                :prepend-icon="item.icon"
                :title="item.title"
                :to="item.to"
                :active="isItemActive(item)"
                :class="{ 'active-nav-item': isItemActive(item) }"
              ></v-list-item>
            </template>
          </v-tooltip>
        </v-list-group>
      </v-list>

      <v-divider></v-divider>

      <v-tooltip :text="$t('sidebar.toggle_theme')" location="end">
        <template v-slot:activator="{ props }">
          <v-switch
            v-bind="props"
            @click="toggleTheme"
            hide-details
            class="ml-4 mt-2 sidebar-theme-toggle"
          >
            <template v-slot:prepend>
              <v-icon>{{
                theme.global.current.value.dark ? 'mdi-weather-night' : 'mdi-weather-sunny'
              }}</v-icon>
            </template>
          </v-switch>
        </template>
      </v-tooltip>

      <v-tooltip :text="$t('sidebar.logout')" location="end">
        <template v-slot:activator="{ props }">
          <v-list density="compact" nav>
            <v-list-item
              v-bind="props"
              @click="confirmLogout"
              :title="$t('sidebar.logout')"
              prepend-icon="mdi-logout"
            ></v-list-item>
          </v-list>
        </template>
      </v-tooltip>
    </div>
  </v-navigation-drawer>

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
.sidebar-main-list {
  padding-bottom: 4px;
}

.section-divider {
  margin: 8px 14px 10px;
  opacity: 0.35;
}

.sidebar-settings {
  padding-bottom: 8px;
}

.sidebar-theme-toggle {
  margin-bottom: 6px;
}

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

.active-nav-item {
  border-radius: 10px;
  transition:
    background-color 0.18s ease,
    border-color 0.18s ease;
}

.active-nav-item.v-list-item--active {
  background: rgba(79, 70, 229, 0.1);
}

.v-theme--dark .active-nav-item.v-list-item--active {
  background: rgba(99, 102, 241, 0.2);
}

.primary-nav-item {
  background: rgba(79, 70, 229, 0.12);
  border: 1px solid rgba(79, 70, 229, 0.28);
  border-radius: 10px;
  margin: 2px 6px;
}

.primary-nav-item:hover {
  background: rgba(79, 70, 229, 0.16);
}

.v-theme--dark .primary-nav-item {
  background: rgba(99, 102, 241, 0.22);
  border-color: rgba(129, 140, 248, 0.4);
}

.workspace-switcher-wrapper {
  padding: 12px 16px;
}

.workspace-switcher-wrapper :deep(.workspace-switcher-btn) {
  width: 100%;
  justify-content: flex-start;
}

.language-select {
  max-width: 120px;
  font-size: 0.9rem;
}
</style>
