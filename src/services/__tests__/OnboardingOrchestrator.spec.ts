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
    isTenantMode: false,
    getPreferredCompanyId: null,
    getCurrentCompanyId: null,
    selectCompany: vi.fn(async () => {}),
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

  it('routes to create-company when authenticated user has no companies', async () => {
    const result = await OnboardingOrchestrator.resolvePostAuthRoute(
      makeOptions({
        plan: 'BUSINESS_ANNUAL',
        redirect: '/choose-plan'
      })
    )

    expect(result.state).toBe('COMPANY_REQUIRED')
    expect(result.route).toEqual({
      name: 'create-company',
      query: { redirect: '/choose-plan?plan=BUSINESS_ANNUAL' }
    })
  })

  it('auto-selects single company and proceeds to target route', async () => {
    const userStore = createUserStoreMock({
      getCompanies: [{ companyId: 'company-1' }],
      isTenantMode: false,
      getCurrentCompanyId: null
    })
    const selectCompany = vi.fn(async (companyId: string) => {
      userStore.isTenantMode = true
      userStore.getCurrentCompanyId = companyId
    })
    userStore.selectCompany = selectCompany

    const result = await OnboardingOrchestrator.resolvePostAuthRoute(
      makeOptions({
        router: createRouterMock(true),
        userStore,
        redirect: '/dashboard'
      })
    )

    expect(result.state).toBe('READY')
    expect(result.route).toEqual({ path: '/dashboard' })
    expect(selectCompany).toHaveBeenCalledWith('company-1')
  })

  it('requires explicit company selection for business plan when tenant is not selected', async () => {
    const userStore = createUserStoreMock({
      getCompanies: [{ companyId: 'company-a' }, { companyId: 'company-b' }],
      isTenantMode: false
    })

    const result = await OnboardingOrchestrator.resolvePostAuthRoute(
      makeOptions({
        userStore,
        redirect: '/choose-plan',
        plan: 'BUSINESS_MONTHLY'
      })
    )

    expect(result.state).toBe('COMPANY_SELECTION_REQUIRED')
    expect(result.route).toEqual({
      name: 'select-company',
      query: { redirect: '/choose-plan?plan=BUSINESS_MONTHLY' }
    })
  })

  it('resolves banner state to company required when no company exists', () => {
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
      name: 'create-company',
      query: { redirect: '/dashboard' }
    })
  })

  it('resolves banner state to company selection for business checkout without tenant context', () => {
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
      name: 'select-company',
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
