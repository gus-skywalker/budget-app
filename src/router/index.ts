import { createRouter, createWebHistory } from 'vue-router'
import LandingPage from '@/views/LandingPage.vue'
import HomeView from '@/views/HomeView.vue'
import AboutView from '@/views/AboutView.vue'
import BudgetView from '@/views/BudgetView.vue'
import DashboardView from '@/views/DashboardView.vue'
import LoginView from '@/views/LoginView.vue'
import SettingsView from '@/views/SettingsView.vue'
import OAuth2Redirect from '@/views/redirect_url/OAuth2Redirect.vue'
import PrivacyPolicy from '@/components/compliance/PrivacyPolicy.vue'
import TermsOfUse from '@/components/compliance/TermsOfUse.vue'
import CookiePolicy from '@/components/compliance/CookiePolicy.vue'
import ForgotPassword from '@/views/ForgotPassword.vue'
import ResetPassword from '@/views/ResetPassword.vue'
import { useUserStore } from '@/plugins/userStore'
import GroupView from '@/views/GroupView.vue'
import GoalView from '@/views/GoalView.vue'
import StripeSuccess from '@/views/redirect_url/StripeSuccess.vue'
import StripeCancel from '@/views/redirect_url/StripeCancel.vue'
import ChoosePlan from '@/views/ChoosePlan.vue'
import ReportView from '@/views/ReportView.vue'

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
      path: '/report',
      name: 'report',
      component: ReportView,
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/create-company',
      name: 'create-company',
      component: () => import('@/views/CreateCompanyView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView,
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
      path: '/choose-plan',
      name: 'choose-plan',
      component: ChoosePlan
    },
    {
      path: '/subscription/success',
      name: 'payment-gateway-success',
      component: StripeSuccess
    },
    {
      path: '/subscription/cancel',
      name: 'payment-gateway-cancel',
      component: StripeCancel
    },
    {
      path: '/privacy-policy',
      name: 'privacy-policy',
      component: PrivacyPolicy
    },
    {
      path: '/terms-of-use',
      name: 'terms-of-use',
      component: TermsOfUse
    },
    {
      path: '/cookie-policy',
      name: 'cookie-policy',
      component: CookiePolicy
    },
    {
      path: '/checkout',
      name: 'checkout',
      component: () => import('@/views/CheckoutView.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const isAuthenticated = userStore.isAuthenticated

  // Se requer autenticação e usuário não está autenticado
  if (to.meta.requiresAuth && !isAuthenticated) {
    // Salva os query params para redirecionamento após login
    const query = { ...to.query }
    if (to.path !== '/login') {
      query.redirect = to.path
    }
    next({ 
      name: 'login',
      query: query
    })
    return
  }

  // Check admin role requirement
  if (to.meta.requiresAdmin && isAuthenticated) {
    const currentRole = (userStore.getCurrentRole || '').toUpperCase()
    const adminRoles = ['ROLE_ADMIN', 'ROLE_CLIENT', 'ROLE_OWNER']
    if (!adminRoles.includes(currentRole)) {
      // Redirect to dashboard if not admin
      next({ name: 'dashboard' })
      return
    }
  }

  // Se usuário está autenticado e tenta acessar login/oauth
  if (isAuthenticated && (to.name === 'login' || to.name === 'oauth2redirect')) {
    // Se há um redirecionamento especificado, use-o
    const redirect = to.query.redirect || '/dashboard'
    const query = { ...to.query }
    delete query.redirect // Remove redirect da query
    next({ 
      path: redirect as string,
      query: query
    })
    return
  }

  // Se está indo para choose-plan e tem plano no localStorage
  if (to.name === 'choose-plan' && localStorage.getItem('selectedPlan')) {
    const plan = localStorage.getItem('selectedPlan')
    localStorage.removeItem('selectedPlan') // Limpa o storage
    if (isAuthenticated) {
      next({
        name: 'checkout',
        query: { plan: plan }
      })
      return
    }
  }

  next()
})

export default router
