import type { RouteLocationRaw, Router } from 'vue-router'
import type { useUserStore } from '@/plugins/userStore'

type UserStore = ReturnType<typeof useUserStore>

const DEFAULT_REDIRECT = '/dashboard'
const ABSOLUTE_URL_PATTERN = /^[a-zA-Z][a-zA-Z\d+\-.]*:/

export type OnboardingState =
  | 'WORKSPACE_REQUIRED'
  | 'WORKSPACE_SELECTION_REQUIRED'
  | 'READY'
  | 'READY_BILLING_DECISION'

export type OnboardingBannerPhase =
  | 'AUTH_REQUIRED'
  | 'WORKSPACE_REQUIRED'
  | 'WORKSPACE_SELECTION_REQUIRED'
  | 'BILLING_PLAN_REQUIRED'
  | 'READY'

export interface ResolvePostAuthRouteOptions {
  router: Router
  userStore: UserStore
  redirect?: unknown
  plan?: unknown
  defaultRedirect?: string
  autoSelectPreferredWorkspace?: boolean
}

export interface OnboardingResolution {
  state: OnboardingState
  route: RouteLocationRaw
  targetPath: string
  selectedWorkspaceId?: string
}

export interface OnboardingBannerInput {
  isAuthenticated: boolean
  hasWorkspaces: boolean
  isTenantMode: boolean
  currentPath: string
  currentQuery?: Record<string, unknown>
  requiresWorkspace?: boolean
  requiresTenant?: boolean
}

export interface OnboardingBannerState {
  visible: boolean
  phase: OnboardingBannerPhase
  title: string
  description: string
  progress: number
  targetPath: string
  ctaLabel?: string
  ctaRoute?: RouteLocationRaw
  steps: {
    auth: boolean
    workspace: boolean
    billing: boolean
  }
}

const normalizeString = (value: unknown): string | null => {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length ? trimmed : null
}

const readQueryString = (query: Record<string, unknown> | undefined, key: string): string | null => {
  if (!query || !(key in query)) return null
  const value = query[key]
  if (Array.isArray(value)) return normalizeString(value[0])
  return normalizeString(value)
}

const sanitizeRedirectPath = (candidate: unknown, fallback: string): string => {
  const raw = normalizeString(candidate) || fallback
  if (!raw.startsWith('/')) return fallback
  if (raw.startsWith('//')) return fallback
  if (ABSOLUTE_URL_PATTERN.test(raw)) return fallback
  return raw
}

const isBusinessPlan = (plan: string | null): boolean =>
  Boolean(plan && plan.toUpperCase().startsWith('BUSINESS_'))

const parseLocalPath = (path: string): URL => new URL(path, 'http://cobudget.local')

const toPathWithQuery = (url: URL): string => `${url.pathname}${url.search}${url.hash}`

export const buildRedirectPath = (path: string, query?: Record<string, unknown>): string => {
  const safePath = sanitizeRedirectPath(path, '/')
  if (!query || !Object.keys(query).length) return safePath

  const url = parseLocalPath(safePath)
  Object.entries(query).forEach(([key, rawValue]) => {
    const value = normalizeString(rawValue)
    if (!value) return
    url.searchParams.set(key, value)
  })
  return toPathWithQuery(url)
}

export const resolveOnboardingTargetPath = (options: {
  redirect?: unknown
  plan?: unknown
  defaultRedirect?: string
}): string => {
  const fallback = options.defaultRedirect || DEFAULT_REDIRECT
  const baseTarget = sanitizeRedirectPath(options.redirect, fallback)
  const plan = normalizeString(options.plan)
  if (!plan) return baseTarget

  const url = parseLocalPath(baseTarget)
  if (!url.searchParams.get('plan')) {
    url.searchParams.set('plan', plan)
  }
  return toPathWithQuery(url)
}

const routeRequiresWorkspace = (router: Router, targetPath: string): boolean => {
  const resolved = router.resolve(targetPath)
  return resolved.matched.some((record) => Boolean(record.meta?.requiresWorkspace || record.meta?.requiresTenant))
}

const targetRequiresBusinessTenant = (targetPath: string): boolean => {
  const url = parseLocalPath(targetPath)
  const path = url.pathname
  const plan = url.searchParams.get('plan')
  if (!isBusinessPlan(plan)) return false
  return path === '/choose-plan' || path === '/checkout'
}

const createWorkspaceRoute = (targetPath: string): RouteLocationRaw => ({
  name: 'create-workspace',
  query: { redirect: targetPath }
})

const selectWorkspaceRoute = (targetPath: string): RouteLocationRaw => ({
  name: 'select-workspace',
  query: { redirect: targetPath }
})

export const resolvePostAuthRoute = async (
  options: ResolvePostAuthRouteOptions
): Promise<OnboardingResolution> => {
  const targetPath = resolveOnboardingTargetPath({
    redirect: options.redirect,
    plan: options.plan,
    defaultRedirect: options.defaultRedirect
  })

  const { router, userStore } = options
  const workspaces = userStore.getWorkspaces || []
  const hasWorkspaces = workspaces.length > 0
  const requiresWorkspace = routeRequiresWorkspace(router, targetPath)
  const requiresBusinessTenant = targetRequiresBusinessTenant(targetPath)
  const requiresTenantContext = requiresWorkspace || requiresBusinessTenant

  if (!hasWorkspaces) {
    return {
      state: 'WORKSPACE_REQUIRED',
      route: createWorkspaceRoute(targetPath),
      targetPath
    }
  }

  if (!userStore.isTenantMode) {
    const preferredWorkspaceId = userStore.getPreferredWorkspaceId
    const canAutoSelectPreferred = options.autoSelectPreferredWorkspace ?? true
    const preferredIsAvailable =
      typeof preferredWorkspaceId === 'string' &&
      workspaces.some((workspace) => workspace.workspaceId === preferredWorkspaceId)

    const autoSelectWorkspaceId =
      workspaces.length === 1
        ? workspaces[0].workspaceId
        : canAutoSelectPreferred && preferredIsAvailable
          ? String(preferredWorkspaceId)
          : null

    if (autoSelectWorkspaceId) {
      try {
        await userStore.selectWorkspace(autoSelectWorkspaceId)
      } catch {
        // Fallback is deterministic routing to explicit workspace selection.
      }
    }

    if (!userStore.isTenantMode && requiresTenantContext) {
      return {
        state: 'WORKSPACE_SELECTION_REQUIRED',
        route: selectWorkspaceRoute(targetPath),
        targetPath
      }
    }
  }

  return {
    state: requiresBusinessTenant ? 'READY_BILLING_DECISION' : 'READY',
    route: { path: targetPath },
    targetPath,
    selectedWorkspaceId: userStore.getCurrentWorkspaceId || undefined
  }
}

export const resolveOnboardingBannerState = (input: OnboardingBannerInput): OnboardingBannerState => {
  const targetPath = buildRedirectPath(input.currentPath, input.currentQuery)
  const isBillingRoute = input.currentPath === '/choose-plan' || input.currentPath === '/checkout'
  const plan = readQueryString(input.currentQuery, 'plan')
  const requiresBusinessTenant = isBillingRoute && isBusinessPlan(plan)
  const requiresTenantContext = Boolean(input.requiresWorkspace || input.requiresTenant || requiresBusinessTenant)

  const steps = {
    auth: input.isAuthenticated,
    workspace: input.hasWorkspaces && (!requiresTenantContext || input.isTenantMode),
    billing: !isBillingRoute || Boolean(plan)
  }
  const progress = [steps.auth, steps.workspace, steps.billing].filter(Boolean).length

  if (!input.isAuthenticated) {
    return {
      visible: false,
      phase: 'AUTH_REQUIRED',
      title: 'Autenticação necessária',
      description: 'Faça login para continuar o onboarding.',
      progress,
      targetPath,
      ctaLabel: 'Fazer login',
      ctaRoute: { name: 'login', query: { redirect: targetPath } },
      steps
    }
  }

  if (!input.hasWorkspaces) {
    return {
      visible: true,
      phase: 'WORKSPACE_REQUIRED',
      title: 'Passo 1 de 3: crie seu workspace',
      description: 'Você precisa criar um workspace para começar a operar no CoBudget.',
      progress,
      targetPath,
      ctaLabel: 'Criar workspace',
      ctaRoute: createWorkspaceRoute(targetPath),
      steps
    }
  }

  if (!input.isTenantMode && requiresTenantContext) {
    return {
      visible: true,
      phase: 'WORKSPACE_SELECTION_REQUIRED',
      title: 'Passo 2 de 3: selecione o workspace ativo',
      description: 'Este fluxo exige contexto de workspace ativo para continuar.',
      progress,
      targetPath,
      ctaLabel: 'Selecionar workspace',
      ctaRoute: selectWorkspaceRoute(targetPath),
      steps
    }
  }

  if (isBillingRoute && !plan) {
    return {
      visible: true,
      phase: 'BILLING_PLAN_REQUIRED',
      title: 'Passo 3 de 3: escolha um plano',
      description: 'Selecione um plano para continuar o fluxo de assinatura.',
      progress,
      targetPath,
      ctaLabel: 'Escolher plano',
      ctaRoute: { name: 'choose-plan' },
      steps
    }
  }

  return {
    visible: false,
    phase: 'READY',
    title: 'Onboarding concluído',
    description: 'Seu contexto está pronto para uso.',
    progress,
    targetPath,
    steps
  }
}

export default {
  buildRedirectPath,
  resolveOnboardingTargetPath,
  resolvePostAuthRoute,
  resolveOnboardingBannerState
}
