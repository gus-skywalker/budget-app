import { createRouter, createWebHistory } from 'vue-router'
import LandingPage from '@/views/LandingPage.vue'
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
      name: 'landing',
      component: LandingPage,
    },
    {
      path: '/home',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true }
    },
    {
      path: '/about',
      name: 'about',
      component: AboutView,
      meta: { requiresAuth: true }
    },
    {
      path: '/budget',
      name: 'budget',
      component: BudgetView,
      meta: { requiresAuth: true }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/account-admin',
      name: 'account-admin',
      component: AccountAdmin,
      meta: { requiresAuth: true }
    },
    {
      path: '/oauth2/redirect',
      name: 'oauth2redirect',
      component: OAuth2Redirect,
    }
  ]
})

// router.beforeEach((to, from, next) => {
//   const userStore = useUserStore()
//   const isAuthenticated = userStore.isAuthenticated
//   console.log(isAuthenticated)
//   if (!isAuthenticated && to.name !== 'login' && to.name !== 'oauth2redirect') {
//     next({ name: 'login' })
//   } else if (isAuthenticated && (to.name === 'login' || to.name === 'oauth2redirect')) {
//     next({ name: 'home' })
//   } else {
//     next()
//   }
// })

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const isAuthenticated = userStore.isAuthenticated

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login' })
  } else if (isAuthenticated && (to.name === 'login' || to.name === 'oauth2redirect')) {
    next({ name: 'dashboard' })
  } else {
    next()
  }
})

export default router
