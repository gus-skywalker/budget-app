import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import store from './plugins/store'

const app = createApp(App)

app.use(router)
app.use(store)
app.use(vuetify)
app.mount('#app')
