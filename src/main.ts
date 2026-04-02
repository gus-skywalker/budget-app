import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import './assets/styles.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import i18n from './i18n'
import { createPinia } from 'pinia'
import { useUserStore } from './plugins/userStore'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

// Restore persisted auth/workspace context before the router evaluates guards.
const userStore = useUserStore(pinia)
userStore.loadState()
if (userStore.isAuthenticated) {
  userStore.hydrateWorkspaceDetailsFromBudget().catch(() => {
    // Best-effort hydration; app should continue even if workspace details fail.
  })
}

app.use(router)
app.use(i18n)
app.use(vuetify)

app.mount('#app')
