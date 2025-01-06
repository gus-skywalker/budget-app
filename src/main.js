import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';
import './assets/styles.css';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import vuetify from './plugins/vuetify';
import i18n from './i18n';
// import store from './plugins/store'
import { createPinia } from 'pinia';
const app = createApp(App);
const pinia = createPinia();
app.use(router);
app.use(pinia);
// app.use(store)
app.use(i18n);
app.use(vuetify);
app.mount('#app');
