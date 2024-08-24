import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import AboutView from '@/views/AboutView.vue'
import BudgetView from '@/views/BudgetView.vue'
import DashboardView from '@/views/DashboardView.vue'
import LoginView from '@/views/LoginView.vue'
import AccountAdmin from '@/views/AccountAdmin.vue'
import OAuth2Redirect from '@/views/OAuth2Redirect.vue'
import { useUserStore } from '@/plugins/userStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/about',
      name: 'about',
      component: AboutView
    },
    {
      path: '/budget',
      name: 'budget',
      component: BudgetView
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    { path: '/account-admin', name: 'account-admin', component: AccountAdmin },
    {
      path: '/oauth2/redirect',
      name: 'oauth2redirect',
      component: OAuth2Redirect
    }
  ]
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const isAuthenticated = userStore.isAuthenticated
  console.log(isAuthenticated)
  if (!isAuthenticated && to.name !== 'login' && to.name !== 'oauth2redirect') {
    next({ name: 'login' })
  } else if (isAuthenticated && (to.name === 'login' || to.name === 'oauth2redirect')) {
    next({ name: 'home' })
  } else {
    next()
  }
})

export default router
