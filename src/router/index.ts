import { createRouter, createWebHistory } from 'vue-router'
import LandingPage from '@/views/LandingPage.vue'
import BlogView from '@/views/BlogView.vue'
import BlogArticleView from '@/views/BlogArticleView.vue'
import PlaybookHire from '@/components/playbooks/PlaybookHire.vue'
import PlaybookPayNowOrInstallments from '@/components/playbooks/PlaybookPayNowOrInstallments.vue'
import HomeView from '@/views/HomeView.vue'
import WelcomeView from '@/views/WelcomeView.vue'
import BudgetView from '@/views/BudgetView.vue'
import DashboardView from '@/views/DashboardView.vue'
import LoginView from '@/views/LoginView.vue'
import SettingsView from '@/views/SettingsView.vue'
import AccountsView from '@/views/AccountsView.vue'
import CategoriesView from '@/views/CategoriesView.vue'
import CashflowView from '@/views/CashflowView.vue'
import PlanningBudgetView from '@/views/PlanningBudgetView.vue'
import ScenariosHubView from '@/views/ScenariosHubView.vue'
import ScenarioBuilderView from '@/views/ScenarioBuilderView.vue'
import ScenarioResultView from '@/views/ScenarioResultView.vue'
import ScenarioEditorView from '@/views/ScenarioEditorView.vue'
import DecisionsView from '@/views/DecisionsView.vue'
import PublicDecisionView from '@/views/PublicDecisionView.vue'
import InsightsView from '@/views/InsightsView.vue'
import ActivityView from '@/views/ActivityView.vue'
import OAuth2Redirect from '@/views/redirect_url/OAuth2Redirect.vue'
import PrivacyPolicy from '@/components/compliance/PrivacyPolicy.vue'
import TermsOfUse from '@/components/compliance/TermsOfUse.vue'
import CookiePolicy from '@/components/compliance/CookiePolicy.vue'
import ForgotPassword from '@/views/ForgotPassword.vue'
import ResetPassword from '@/views/ResetPassword.vue'
import VerifyEmailView from '@/views/VerifyEmailView.vue'
import { useUserStore } from '@/plugins/userStore'
import GoalView from '@/views/GoalView.vue'
import StripeSuccess from '@/views/redirect_url/StripeSuccess.vue'
import StripeCancel from '@/views/redirect_url/StripeCancel.vue'
import ChoosePlan from '@/views/ChoosePlan.vue'
import ReportView from '@/views/ReportView.vue'
import InviteAcceptView from '@/views/InviteAcceptView.vue'
import InviteDeclineView from '@/views/InviteDeclineView.vue'
import { readInviteAcceptanceRedirect } from '@/utils/inviteAcceptanceContext'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // PRINCIPAIS DO DOMÍNIO
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true, requiresWorkspace: true, keepAlive: true }
    },
    {
      path: '/budget',
      name: 'budget',
      component: BudgetView,
      meta: { requiresAuth: true, requiresWorkspace: true }
    },
    {
      path: '/accounts',
      name: 'accounts',
      component: AccountsView,
      meta: { requiresAuth: true, requiresWorkspace: true }
    },
    {
      path: '/cashflow',
      name: 'cashflow',
      component: CashflowView,
      meta: { requiresAuth: true, requiresWorkspace: true }
    },
    {
      path: '/report',
      name: 'report',
      component: ReportView,
      meta: { requiresAuth: true, requiresWorkspace: true }
    },
    {
      path: '/financialgoal',
      name: 'financialgoal',
      component: GoalView,
      meta: { requiresAuth: true, requiresWorkspace: true }
    },
    // PLANEJAMENTO E ANÁLISE
    {
      path: '/planning/budget',
      name: 'planning-budget',
      component: PlanningBudgetView,
      meta: { requiresAuth: true, requiresWorkspace: true }
    },
    {
      path: '/planning/scenarios',
      name: 'planning-scenarios',
      component: ScenariosHubView,
      meta: { requiresAuth: true, requiresWorkspace: true }
    },
    {
      path: '/planning/scenarios/new',
      name: 'planning-scenarios-new',
      component: ScenarioBuilderView,
      meta: { requiresAuth: true, requiresWorkspace: true }
    },
    {
      path: '/planning/scenarios/debt/new',
      name: 'planning-scenarios-debt-new',
      component: () => import('@/views/DebtScenarioBuilderView.vue'),
      meta: { requiresAuth: true, requiresWorkspace: true }
    },
    {
      path: '/planning/scenarios/:id/edit',
      name: 'planning-scenarios-edit',
      component: ScenarioEditorView,
      meta: { requiresAuth: true, requiresWorkspace: true }
    },
    {
      path: '/planning/scenarios/debt/:id/edit',
      name: 'planning-scenarios-debt-edit',
      component: () => import('@/views/DebtScenarioBuilderView.vue'),
      meta: { requiresAuth: true, requiresWorkspace: true }
    },
    {
      path: '/planning/scenarios/:id',
      name: 'planning-scenarios-result',
      component: ScenarioResultView,
      meta: { requiresAuth: true, requiresWorkspace: true }
    },
    {
      path: '/planning/goals',
      name: 'planning-goals',
      component: GoalView,
      meta: { requiresAuth: true, requiresWorkspace: true }
    },
    {
      path: '/decisions',
      name: 'decisions',
      component: DecisionsView,
      meta: { requiresAuth: true, requiresWorkspace: true }
    },
    {
      path: '/decision/:id',
      name: 'decision-detail',
      component: () => import('@/views/DecisionDetailView.vue'),
      meta: { requiresAuth: true, requiresWorkspace: true }
    },
    {
      path: '/decision/:id/public',
      name: 'public-decision',
      component: PublicDecisionView,
      meta: { hideAppChrome: true }
    },
    {
      path: '/invite/accept',
      name: 'invite-accept',
      component: InviteAcceptView,
      meta: { hideAppChrome: true }
    },
    {
      path: '/invite/decline',
      name: 'invite-decline',
      component: InviteDeclineView,
      meta: { hideAppChrome: true }
    },
    {
      path: '/insights',
      name: 'insights',
      component: InsightsView,
      meta: { requiresAuth: true, requiresWorkspace: true }
    },
    {
      path: '/activity',
      name: 'activity',
      component: ActivityView,
      meta: { requiresAuth: true, requiresWorkspace: true }
    },
    // CATEGORIAS
    {
      path: '/categories',
      name: 'categories',
      component: CategoriesView,
      meta: { requiresAuth: true, requiresWorkspace: true }
    },
    // SECUNDÁRIAS E AUTENTICAÇÃO
    {
      path: '/',
      name: 'landing',
      component: LandingPage
    },
    {
      path: '/landing',
      name: 'landing-alias',
      component: LandingPage
    },
    {
      path: '/blog',
      name: 'blog',
      component: BlogView
    },
    {
      path: '/blog/articles/:slug',
      name: 'blog-article',
      component: BlogArticleView
    },
    {
      path: '/app/blog',
      name: 'blog-app',
      component: BlogView,
      meta: { requiresAuth: true, requiresWorkspace: true }
    },
    {
      path: '/app/blog/articles/:slug',
      name: 'blog-app-article',
      component: BlogArticleView,
      meta: { requiresAuth: true, requiresWorkspace: true }
    },
    {
      path: '/app/blog/playbooks/hire',
      name: 'blog-playbook-hire',
      component: PlaybookHire,
      meta: { requiresAuth: true, requiresWorkspace: true }
    },
    {
      path: '/app/blog/playbooks/pay-now-or-installments',
      name: 'blog-playbook-pay-now-or-installments',
      component: PlaybookPayNowOrInstallments,
      meta: { requiresAuth: true, requiresWorkspace: true }
    },
    {
      path: '/home',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true, requiresWorkspace: true }
    },
    {
      path: '/welcome',
      name: 'welcome',
      component: WelcomeView,
      meta: { requiresAuth: true, requiresWorkspace: true }
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/create-workspace',
      name: 'create-workspace',
      component: () => import('@/views/CreateWorkspaceView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView,
      meta: { requiresAuth: true, requiresWorkspace: true }
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
      path: '/verify-email',
      name: 'verify-email',
      component: VerifyEmailView
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
      meta: { requiresAuth: true, requiresWorkspace: true }
    },
    {
      path: '/select-workspace',
      name: 'select-workspace',
      component: () => import('@/views/SelectWorkspaceView.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const isAuthenticated = userStore.isAuthenticated
  const workspaces = userStore.getWorkspaces || []
  const hasWorkspaces = workspaces.length > 0
  const pendingInviteRedirect = isAuthenticated ? readInviteAcceptanceRedirect() : null

  if (
    pendingInviteRedirect
    && to.name === 'create-workspace'
    && !String(to.fullPath || '').startsWith(pendingInviteRedirect)
  ) {
    next({ path: pendingInviteRedirect })
    return
  }

  if (to.name === 'landing' && isAuthenticated) {
    if (!hasWorkspaces) {
      next({ name: 'create-workspace', query: { redirect: '/decisions' } })
      return
    }
    if (!userStore.isTenantMode) {
      next({ name: 'select-workspace', query: { redirect: '/decisions' } })
      return
    }
    next({ name: 'decisions' })
    return
  }

  // Se requer autenticação e usuário não está autenticado
  if (to.meta.requiresAuth && !isAuthenticated) {
    // Salva os query params para redirecionamento após login
    const query = { ...to.query }
    if (to.path !== '/login') {
      query.redirect = to.fullPath
    }
    next({
      name: 'login',
      query: query
    })
    return
  }

  if (isAuthenticated && to.name === 'select-workspace' && !hasWorkspaces) {
    next({
      name: 'create-workspace',
      query: { redirect: (to.query.redirect as string) || '/decisions' }
    })
    return
  }

  // Workspace context is mandatory for main app flows.
  if (to.meta.requiresWorkspace && isAuthenticated) {
    if (!hasWorkspaces) {
      next({ name: 'create-workspace', query: { redirect: to.fullPath } })
      return
    }
    if (!userStore.isTenantMode) {
      next({ name: 'select-workspace', query: { redirect: to.fullPath } })
      return
    }
  }

  // Check admin role requirement
  if (to.meta.requiresAdmin && isAuthenticated) {
    if (!userStore.isTenantAdmin) {
      next({ name: 'decisions' })
      return
    }
  }

  // Ensure tenant context where required
  if (to.meta.requiresTenant && isAuthenticated) {
    if (!userStore.isTenantMode) {
      const hasWorkspacesForTenant = (userStore.getWorkspaces?.length || 0) > 0
      if (hasWorkspacesForTenant) {
        next({ name: 'select-workspace', query: { redirect: to.fullPath } })
      } else {
        next({ name: 'create-workspace', query: { redirect: to.fullPath } })
      }
      return
    }
  }

  // Se usuário está autenticado e tenta acessar login/oauth
  if (isAuthenticated && (to.name === 'login' || to.name === 'oauth2redirect')) {
    // Se há um redirecionamento especificado, use-o
    const redirect = to.query.redirect || '/decisions'
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
        name: 'choose-plan',
        query: { plan: plan }
      })
      return
    }
  }

  next()
})

export default router
