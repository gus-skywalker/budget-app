import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import InviteAcceptView from '@/views/InviteAcceptView.vue'

const {
  routeMock,
  routerReplace,
  userStoreMock,
  workspaceInviteServiceMock,
  workspaceServiceMock,
} = vi.hoisted(() => ({
  routeMock: {
    query: {
      token: 'invite-token',
    },
  },
  routerReplace: vi.fn(),
  userStoreMock: {
    isAuthenticated: true,
    isTenantMode: true,
    getWorkspaces: [
      { workspaceId: 'old-workspace', workspaceName: 'Old Workspace', role: 'ROLE_OWNER' },
    ],
    setWorkspaces: vi.fn((workspaces: any[]) => {
      userStoreMock.getWorkspaces = workspaces
    }),
    setCurrentWorkspace: vi.fn((workspaceId: string, role?: string | null, workspaceName?: string) => {
      userStoreMock.currentWorkspaceId = workspaceId
      userStoreMock.tenantRole = role
      userStoreMock.workspaceName = workspaceName
      userStoreMock.isTenantMode = Boolean(workspaceId && role)
    }),
    setPreferredWorkspace: vi.fn(),
    selectWorkspace: vi.fn(async (workspaceId: string) => {
      const workspace = userStoreMock.getWorkspaces.find((item: any) => item.workspaceId === workspaceId)
      userStoreMock.currentWorkspaceId = workspaceId
      userStoreMock.tenantRole = workspace?.role || null
      userStoreMock.isTenantMode = Boolean(workspaceId && workspace?.role)
    }),
    currentWorkspaceId: 'old-workspace',
    tenantRole: 'ROLE_OWNER',
    workspaceName: 'Old Workspace',
  } as any,
  workspaceInviteServiceMock: {
    validateInvite: vi.fn(),
    acceptInvite: vi.fn(),
  },
  workspaceServiceMock: {
    getAll: vi.fn(),
  },
}))

vi.mock('vue-router', () => ({
  useRoute: () => routeMock,
  useRouter: () => ({
    replace: routerReplace,
    push: vi.fn(),
  }),
}))

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('@/plugins/userStore', () => ({
  useUserStore: () => userStoreMock,
}))

vi.mock('@/services/WorkspaceInviteService', () => ({
  default: workspaceInviteServiceMock,
}))

vi.mock('@/services/WorkspaceService', () => ({
  default: workspaceServiceMock,
}))

vi.mock('@/services/OnboardingOrchestrator', () => ({
  default: {
    resolvePostAuthRoute: vi.fn(async () => ({ route: { path: '/decisions' } })),
  },
}))

const flushPromises = async () => {
  await Promise.resolve()
  await new Promise((resolve) => setTimeout(resolve, 0))
}

describe('InviteAcceptView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()
    routeMock.query.token = 'invite-token'
    userStoreMock.isAuthenticated = true
    userStoreMock.isTenantMode = true
    userStoreMock.currentWorkspaceId = 'old-workspace'
    userStoreMock.tenantRole = 'ROLE_OWNER'
    userStoreMock.workspaceName = 'Old Workspace'
    userStoreMock.getWorkspaces = [
      { workspaceId: 'old-workspace', workspaceName: 'Old Workspace', role: 'ROLE_OWNER' },
    ]
    workspaceInviteServiceMock.validateInvite.mockResolvedValue({
      valid: true,
      requiresAuth: true,
      status: 'PENDING',
      email: 'lesmonades@gmail.com',
    })
    workspaceInviteServiceMock.acceptInvite.mockResolvedValue({
      data: {
        status: 'ACCEPTED',
        workspaceId: 'invited-workspace',
        workspaceName: 'Invited Workspace',
        tenantRole: 'ROLE_MEMBER',
        membershipMaterialized: true,
      },
    })
    workspaceServiceMock.getAll.mockResolvedValue({
      data: [
        { workspaceId: 'old-workspace', workspaceName: 'Old Workspace', role: 'ROLE_OWNER' },
      ],
    })
  })

  it('keeps and selects the accepted workspace when the current session already has another workspace', async () => {
    mount(InviteAcceptView, {
      global: {
        stubs: {
          VAlert: { template: '<div><slot /></div>' },
          VBtn: { template: '<button><slot /></button>' },
          VCard: { template: '<section><slot /></section>' },
          VContainer: { template: '<main><slot /></main>' },
          VProgressLinear: { template: '<div />' },
        },
      },
    })

    await flushPromises()
    await flushPromises()

    expect(userStoreMock.setWorkspaces).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ workspaceId: 'invited-workspace', role: 'ROLE_MEMBER' }),
      ])
    )
    expect(userStoreMock.selectWorkspace).toHaveBeenCalledWith('invited-workspace')
    expect(userStoreMock.selectWorkspace).not.toHaveBeenCalledWith('old-workspace')
    expect(userStoreMock.currentWorkspaceId).toBe('invited-workspace')
  })
})
