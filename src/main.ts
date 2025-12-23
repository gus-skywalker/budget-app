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

app.use(router)
app.use(pinia)
app.use(i18n)
app.use(vuetify)

// Initialize user store
const userStore = useUserStore()
userStore.loadState()

app.mount('#app')
