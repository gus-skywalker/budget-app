import { describe, it, expect, vi } from 'vitest'
import OnboardingOrchestrator, {
  resolveOnboardingTargetPath,
  resolveOnboardingBannerState,
  type ResolvePostAuthRouteOptions
} from '@/services/OnboardingOrchestrator'

const createRouterMock = (requiresWorkspace: boolean = false) =>
  ({
    resolve: vi.fn(() => ({
      matched: [{ meta: requiresWorkspace ? { requiresWorkspace: true } : {} }]
    }))
  }) as any

const createUserStoreMock = (overrides: Record<string, any> = {}) =>
  ({
    getCompanies: [],
    isWorkspaceMode: false,
    getPreferredWorkspaceId: null,
    getCurrentWorkspaceId: null,
    selectWorkspace: vi.fn(async () => {}),
    ...overrides
  }) as any

const makeOptions = (overrides: Partial<ResolvePostAuthRouteOptions> = {}): ResolvePostAuthRouteOptions => ({
  router: createRouterMock(false),
  userStore: createUserStoreMock(),
  ...overrides
})

describe('OnboardingOrchestrator', () => {
  it('combines redirect + plan into canonical target', () => {
    const target = resolveOnboardingTargetPath({
      redirect: '/choose-plan',
      plan: 'BUSINESS_MONTHLY'
    })

    expect(target).toBe('/choose-plan?plan=BUSINESS_MONTHLY')
  })

  it('falls back to default redirect for invalid external redirect', () => {
    const target = resolveOnboardingTargetPath({
      redirect: 'https://malicious.example/path',
      defaultRedirect: '/dashboard'
    })

    expect(target).toBe('/dashboard')
  })

  it('routes to create-workspace when authenticated user has no workspaces', async () => {
    const result = await OnboardingOrchestrator.resolvePostAuthRoute(
      makeOptions({
        plan: 'BUSINESS_ANNUAL',
        redirect: '/choose-plan'
      })
    )

    expect(result.state).toBe('COMPANY_REQUIRED')
    expect(result.route).toEqual({
      name: 'create-workspace',
      query: { redirect: '/choose-plan?plan=BUSINESS_ANNUAL' }
    })
  })

  it('auto-selects a single workspace and proceeds to target route', async () => {
    const userStore = createUserStoreMock({
      getCompanies: [{ companyId: 'company-1' }],
      isWorkspaceMode: false,
      getCurrentWorkspaceId: null
    })
    const selectWorkspace = vi.fn(async (workspaceId: string) => {
      userStore.isWorkspaceMode = true
      userStore.getCurrentWorkspaceId = workspaceId
    })
    userStore.selectWorkspace = selectWorkspace

    const result = await OnboardingOrchestrator.resolvePostAuthRoute(
      makeOptions({
        router: createRouterMock(true),
        userStore,
        redirect: '/dashboard'
      })
    )

    expect(result.state).toBe('READY')
    expect(result.route).toEqual({ path: '/dashboard' })
    expect(selectWorkspace).toHaveBeenCalledWith('company-1')
  })

  it('allows business plan checkout to proceed without an active workspace', async () => {
    const userStore = createUserStoreMock({
      getCompanies: [{ companyId: 'company-a' }, { companyId: 'company-b' }],
      isWorkspaceMode: false
    })

    const result = await OnboardingOrchestrator.resolvePostAuthRoute(
      makeOptions({
        userStore,
        redirect: '/choose-plan',
        plan: 'BUSINESS_MONTHLY'
      })
    )

    expect(result.state).toBe('READY')
    expect(result.route).toEqual({ path: '/choose-plan?plan=BUSINESS_MONTHLY' })
  })

  it('resolves banner state to workspace required when no workspace exists', () => {
    const banner = resolveOnboardingBannerState({
      isAuthenticated: true,
      hasCompanies: false,
      isTenantMode: false,
      currentPath: '/dashboard',
      currentQuery: {},
      requiresWorkspace: true
    })

    expect(banner.visible).toBe(true)
    expect(banner.phase).toBe('COMPANY_REQUIRED')
    expect(banner.ctaRoute).toEqual({
      name: 'create-workspace',
      query: { redirect: '/dashboard' }
    })
  })

  it('resolves banner state to workspace selection for business checkout without workspace context', () => {
    const banner = resolveOnboardingBannerState({
      isAuthenticated: true,
      hasCompanies: true,
      isTenantMode: false,
      currentPath: '/choose-plan',
      currentQuery: { plan: 'BUSINESS_MONTHLY' }
    })

    expect(banner.visible).toBe(true)
    expect(banner.phase).toBe('COMPANY_SELECTION_REQUIRED')
    expect(banner.ctaRoute).toEqual({
      name: 'select-workspace',
      query: { redirect: '/choose-plan?plan=BUSINESS_MONTHLY' }
    })
  })

  it('hides banner when onboarding state is ready', () => {
    const banner = resolveOnboardingBannerState({
      isAuthenticated: true,
      hasCompanies: true,
      isTenantMode: true,
      currentPath: '/dashboard',
      currentQuery: {},
      requiresWorkspace: true
    })

    expect(banner.visible).toBe(false)
    expect(banner.phase).toBe('READY')
  })
})
