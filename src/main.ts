import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import './assets/styles.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import i18n, { updateI18nLocale } from './i18n'
import { createPinia } from 'pinia'
import { useUserStore } from './plugins/userStore'
import AuthService from './services/AuthService'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

const userStore = useUserStore(pinia)

async function restoreSession() {
  // Restore persisted auth/workspace context before the router evaluates guards.
  userStore.loadState()
  updateI18nLocale(userStore.getLanguage || 'PT')

  const logoutBootstrapMarker = sessionStorage.getItem('auth.logout.skipBootstrap')
  if (logoutBootstrapMarker) {
    sessionStorage.removeItem('auth.logout.skipBootstrap')
    return
  }

  if (!userStore.isAuthenticated) {
    try {
      const bootstrap = await AuthService.bootstrapSession()
      const accessToken = bootstrap?.data?.accessToken
      if (accessToken) {
        userStore.setToken(accessToken)
        userStore.setAuth(true)
        userStore.syncFromToken(accessToken)

        const userInfo = await AuthService.userTokenInfo()
        const userLanguage = userInfo?.data?.language || userStore.getLanguage || 'PT'
        userStore.setUser({
          id: userInfo?.data?.id,
          username: userInfo?.data?.username,
          email: userInfo?.data?.email,
          language: userLanguage,
          authProvider: userInfo?.data?.authProvider,
          isFederatedAccount: userInfo?.data?.isFederatedAccount,
          workspaces: userStore.getWorkspaces
        })
        updateI18nLocale(userLanguage)
      }
    } catch {
      // Silent bootstrap failure is expected when there is no valid refresh cookie.
    }
  }

  if (userStore.isAuthenticated) {
    updateI18nLocale(userStore.getLanguage || userStore.getUser?.language || 'PT')
    await userStore.reconcileWorkspaceContext()
    userStore.hydrateWorkspaceDetailsFromBudget().catch(() => {
      // Best-effort hydration; app should continue even if workspace details fail.
    })
  }
}

await restoreSession()

app.use(router)
app.use(i18n)
app.use(vuetify)

app.mount('#app')
