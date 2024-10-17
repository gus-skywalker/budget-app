import { createRouter, createWebHistory } from 'vue-router'
import LandingPage from '@/views/LandingPage.vue'
import HomeView from '@/views/HomeView.vue'
import AboutView from '@/views/AboutView.vue'
import BudgetView from '@/views/BudgetView.vue'
import DashboardView from '@/views/DashboardView.vue'
import LoginView from '@/views/LoginView.vue'
import AccountAdmin from '@/views/AccountAdmin.vue'
import OAuth2Redirect from '@/views/OAuth2Redirect.vue'
import PrivacyPolicy from '@/components/compliance/PrivacyPolicy.vue'
import TermsOfUse from '@/components/compliance/TermsOfUse.vue'
import CookiePolicy from '@/components/compliance/CookiePolicy.vue'
import ForgotPassword from '@/views/ForgotPassword.vue'
import ResetPassword from '@/views/ResetPassword.vue'
import { useUserStore } from '@/plugins/userStore'
import GroupView from '@/views/GroupView.vue'
import GoalView from '@/views/GoalView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: LandingPage
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
      path: '/group',
      name: 'group',
      component: GroupView,
      meta: { requiresAuth: true }
    },
    {
      path: '/financialgoal',
      name: 'financialgoal',
      component: GoalView,
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
      path: '/forgot-password',
      name: 'forgot-password',
      component: ForgotPassword
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: ResetPassword
    },
    {
      path: '/oauth2/redirect',
      name: 'oauth2redirect',
      component: OAuth2Redirect
    },
    {
      path: '/privacy-policy',
      name: 'PrivacyPolicy',
      component: PrivacyPolicy
    },
    {
      path: '/terms-of-use',
      name: 'TermsOfUse',
      component: TermsOfUse
    },
    {
      path: '/cookie-policy',
      name: 'CookiePolicy',
      component: CookiePolicy
    }
  ]
})

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
