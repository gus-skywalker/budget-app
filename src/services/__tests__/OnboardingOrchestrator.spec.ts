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
    getWorkspaces: [],
    isTenantMode: false,
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

    expect(result.state).toBe('WORKSPACE_REQUIRED')
    expect(result.route).toEqual({
      name: 'create-workspace',
      query: { redirect: '/choose-plan?plan=BUSINESS_ANNUAL' }
    })
  })

  it('auto-selects single workspace and proceeds to target route', async () => {
    const userStore = createUserStoreMock({
      getWorkspaces: [{ workspaceId: 'workspace-1' }],
      isTenantMode: false,
      getCurrentWorkspaceId: null
    })
    const selectWorkspace = vi.fn(async (workspaceId: string) => {
      userStore.isTenantMode = true
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
    expect(selectWorkspace).toHaveBeenCalledWith('workspace-1')
  })

  it('allows checkout to proceed without tenant context', async () => {
    const userStore = createUserStoreMock({
      getWorkspaces: [{ workspaceId: 'workspace-a' }, { workspaceId: 'workspace-b' }],
      isTenantMode: false
    })

    const result = await OnboardingOrchestrator.resolvePostAuthRoute(
      makeOptions({
        userStore,
        redirect: '/checkout',
        plan: 'BUSINESS_MONTHLY'
      })
    )

    expect(result.state).toBe('READY')
    expect(result.route).toEqual({ path: '/checkout?plan=BUSINESS_MONTHLY' })
  })

  it('requires workspace selection while choosing a business plan', async () => {
    const userStore = createUserStoreMock({
      getWorkspaces: [{ workspaceId: 'workspace-a' }, { workspaceId: 'workspace-b' }],
      isTenantMode: false
    })

    const result = await OnboardingOrchestrator.resolvePostAuthRoute(
      makeOptions({
        userStore,
        redirect: '/choose-plan',
        plan: 'BUSINESS_MONTHLY'
      })
    )

    expect(result.state).toBe('WORKSPACE_SELECTION_REQUIRED')
    expect(result.route).toEqual({
      name: 'select-workspace',
      query: { redirect: '/choose-plan?plan=BUSINESS_MONTHLY' }
    })
  })

  it('resolves banner state to workspace required when no workspace exists', () => {
    const banner = resolveOnboardingBannerState({
      isAuthenticated: true,
      hasWorkspaces: false,
      isTenantMode: false,
      currentPath: '/dashboard',
      currentQuery: {},
      requiresWorkspace: true
    })

    expect(banner.visible).toBe(true)
    expect(banner.phase).toBe('WORKSPACE_REQUIRED')
    expect(banner.ctaRoute).toEqual({
      name: 'create-workspace',
      query: { redirect: '/dashboard' }
    })
  })

  it('keeps checkout banner ready without requiring workspace context', () => {
    const banner = resolveOnboardingBannerState({
      isAuthenticated: true,
      hasWorkspaces: true,
      isTenantMode: false,
      currentPath: '/checkout',
      currentQuery: { plan: 'BUSINESS_MONTHLY' }
    })

    expect(banner.visible).toBe(false)
    expect(banner.phase).toBe('READY')
  })

  it('hides banner when onboarding state is ready', () => {
    const banner = resolveOnboardingBannerState({
      isAuthenticated: true,
      hasWorkspaces: true,
      isTenantMode: true,
      currentPath: '/dashboard',
      currentQuery: {},
      requiresWorkspace: true
    })

    expect(banner.visible).toBe(false)
    expect(banner.phase).toBe('READY')
  })
})
