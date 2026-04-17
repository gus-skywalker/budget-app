import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '@/plugins/userStore'

vi.mock('@/services/WorkspaceService', () => ({
  default: {
    getDetails: vi.fn()
  }
}))

vi.mock('@/services/AuthService', () => ({
  default: {
    refreshToken: vi.fn()
  }
}))

describe('UserStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    sessionStorage.clear()
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const store = useUserStore()
      expect(store.token).toBeNull()
      expect(store.auth).toBe(false)
      expect(store.currentWorkspaceId).toBeNull()
      expect(store.tenantRole).toBeNull()
      expect(store.language).toBe('PT')
    })
  })

  describe('JWT Decoding', () => {
    it('should decode and sync from token correctly', () => {
      const store = useUserStore()
      
      // Create a mock JWT token with base64 encoded payload
      const payload = {
        user_id: '123',
        workspaceId: 'workspace-456',
        tenantRole: 'ROLE_ADMIN',
        user_language: 'EN',
        workspaces: [
          { workspaceId: 'workspace-456', workspaceName: 'Test Workspace', role: 'ROLE_ADMIN' }
        ]
      }
      
      const encodedPayload = btoa(JSON.stringify(payload))
      const mockToken = `header.${encodedPayload}.signature`
      
      store.syncFromToken(mockToken)
      
      expect(store.currentWorkspaceId).toBe('workspace-456')
      expect(store.tenantRole).toBe('ROLE_ADMIN')
      expect(store.language).toBe('EN')
      expect(store.user.workspaces).toEqual([
        { workspaceId: 'workspace-456', workspaceName: 'Test Workspace', role: 'ROLE_ADMIN' }
      ])
    })

    it('should handle invalid JWT gracefully', () => {
      const store = useUserStore()
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      // Invalid token format
      store.syncFromToken('invalid.token')
      
      // Should not crash and should not update state
      expect(store.currentWorkspaceId).toBeNull()
      expect(consoleErrorSpy).toHaveBeenCalled()
      consoleErrorSpy.mockRestore()
    })
  })

  describe('handleSigninResponse', () => {
    it('should process signin response with no workspaces', () => {
      const store = useUserStore()
      
      const response = {
        id: 'user123',
        username: 'John Doe',
        email: 'john@example.com',
        language: 'PT',
        accessToken: 'header.eyJ1c2VyX2lkIjoiMTIzIn0.signature',
        workspaceId: null,
        workspaces: []
      }
      
      const result = store.handleSigninResponse(response)
      
      expect(store.auth).toBe(true)
      expect(store.user.email).toBe('john@example.com')
      expect(store.language).toBe('PT')
      expect(result.hasWorkspaces).toBe(false)
      expect(result.workspacePreselected).toBe(false)
    })

    it('should process signin response with multiple workspaces', () => {
      const store = useUserStore()
      
      const workspaces = [
        { workspaceId: 'comp1', workspaceName: 'Company 1', role: 'ROLE_ADMIN' },
        { workspaceId: 'comp2', workspaceName: 'Company 2', role: 'ROLE_USER' }
      ]
      
      // Create token with workspaces in payload
      const payload = {
        user_id: '123',
        workspaces
      }
      const encodedPayload = btoa(JSON.stringify(payload))
      const mockToken = `header.${encodedPayload}.signature`
      
      const response = {
        id: 'user123',
        username: 'John Doe',
        email: 'john@example.com',
        language: 'EN',
        accessToken: mockToken,
        workspaceId: null,
        workspaces
      }
      
      const result = store.handleSigninResponse(response)
      
      expect(result.hasWorkspaces).toBe(true)
      expect(result.hasMultipleWorkspaces).toBe(true)
      expect(result.workspacePreselected).toBe(false)
      expect(store.user.workspaces).toEqual([
        { workspaceId: 'comp1', workspaceName: 'Company 1', role: 'ROLE_ADMIN' },
        { workspaceId: 'comp2', workspaceName: 'Company 2', role: 'ROLE_USER' }
      ])
    })

    it('should process signin response with preselected workspace', () => {
      const store = useUserStore()
      
      const workspaces = [
        { workspaceId: 'comp1', workspaceName: 'Company 1', role: 'ROLE_ADMIN' }
      ]
      
      const payload = {
        user_id: '123',
        workspaceId: 'comp1',
        tenantRole: 'ROLE_ADMIN'
      }
      const encodedPayload = btoa(JSON.stringify(payload))
      const mockToken = `header.${encodedPayload}.signature`
      
      const response = {
        id: 'user123',
        username: 'John Doe',
        email: 'john@example.com',
        language: 'PT',
        accessToken: mockToken,
        workspaceId: 'comp1',
        workspaces
      }
      
      const result = store.handleSigninResponse(response)
      
      expect(result.workspacePreselected).toBe(true)
      expect(store.currentWorkspaceId).toBe('comp1')
      expect(store.tenantRole).toBe('ROLE_ADMIN')
    })
  })

  describe('Token Management', () => {
    it('should set and persist access token', () => {
      const store = useUserStore()
      
      store.setToken('access123')
      
      expect(store.token).toBe('access123')
      
      // Check persistence
      const saved = sessionStorage.getItem('userStore')
      expect(saved).toBeTruthy()
      const parsed = JSON.parse(saved!)
      expect(parsed.token).toBe('access123')
    })

    it('should load state from session storage', () => {
      const state = {
        token: 'saved-token',
        auth: true,
        user: { id: '123', email: 'test@test.com' },
        currentWorkspaceId: 'comp-123',
        tenantRole: 'ROLE_ADMIN',
        language: 'EN'
      }
      
      sessionStorage.setItem('userStore', JSON.stringify(state))
      
      const store = useUserStore()
      store.loadState()
      
      expect(store.token).toBe('saved-token')
      expect(store.currentWorkspaceId).toBe('comp-123')
      expect(store.tenantRole).toBe('ROLE_ADMIN')
      expect(store.language).toBe('EN')
    })

    it('should restore tenant role from stored workspace when session omits tenantRole', () => {
      const state = {
        token: 'saved-token',
        auth: true,
        user: {
          id: '123',
          email: 'test@test.com',
          workspaces: [
            { workspaceId: 'comp-123', workspaceName: 'Workspace 123', role: 'ROLE_OWNER' }
          ]
        },
        currentWorkspaceId: 'comp-123',
        tenantRole: null,
        language: 'EN'
      }

      sessionStorage.setItem('userStore', JSON.stringify(state))

      const store = useUserStore()
      store.loadState()

      expect(store.currentWorkspaceId).toBe('comp-123')
      expect(store.tenantRole).toBe('ROLE_OWNER')
      expect(store.isTenantMode).toBe(true)
    })

    it('should load preferred context from localStorage', () => {
      localStorage.setItem('userPreference', JSON.stringify({
        preferredMode: 'tenant',
        preferredWorkspaceId: 'comp-pref'
      }))

      const store = useUserStore()
      store.loadState()

      expect(store.getPreferredMode).toBe('tenant')
      expect(store.getPreferredWorkspaceId).toBe('comp-pref')
    })
  })

  describe('Workspace Management', () => {
    it('should set current workspace correctly', () => {
      const store = useUserStore()
      
      store.setCurrentWorkspace('comp-456', 'ROLE_USER', 'Test Company')

      expect(store.currentWorkspaceId).toBe('comp-456')
      expect(store.tenantRole).toBe('ROLE_USER')
    })

    it('should preserve existing workspaces when setUser updates profile-only fields', () => {
      const store = useUserStore()

      store.user.workspaces = [
        { workspaceId: 'comp-456', workspaceName: 'Test Company', role: 'ROLE_USER' }
      ]

      store.setUser({
        id: '123',
        username: 'Updated User',
        email: 'updated@example.com'
      })

      expect(store.user.workspaces).toEqual([
        { workspaceId: 'comp-456', workspaceName: 'Test Company', role: 'ROLE_USER' }
      ])
      expect(store.user.username).toBe('Updated User')
      expect(store.user.email).toBe('updated@example.com')
    })

    it('should allow explicit empty workspaces to clear the workspace list', () => {
      const store = useUserStore()

      store.user.workspaces = [
        { workspaceId: 'comp-456', workspaceName: 'Test Company', role: 'ROLE_USER' }
      ]

      store.setUser({
        id: '123',
        workspaces: []
      })

      expect(store.user.workspaces).toEqual([])
    })

    it('should detect multiple workspaces', () => {
      const store = useUserStore()
      
      store.user.workspaces = [
        { workspaceId: 'comp1', role: 'ROLE_ADMIN' },
        { workspaceId: 'comp2', role: 'ROLE_USER' }
      ]
      
      expect(store.hasMultipleWorkspaces).toBe(true)
    })

    it('should identify admin role', () => {
      const store = useUserStore()
      
      store.tenantRole = 'role_admin'
      expect(store.isAdmin).toBe(true)
      
      store.tenantRole = 'ROLE_USER'
      expect(store.isAdmin).toBe(false)
    })
  })

  describe('selectWorkspace', () => {
    it('should update workspace selection locally using stored workspace list', async () => {
      const store = useUserStore()
      store.token = 'header.eyJ1c2VyX2lkIjoiMTIzIn0.signature'
      store.user.workspaces = [
        { workspaceId: 'new-workspace', workspaceName: 'New Workspace', role: 'ROLE_USER' }
      ]

      await store.selectWorkspace('new-workspace')

      expect(store.token).toBe('header.eyJ1c2VyX2lkIjoiMTIzIn0.signature')
      expect(store.currentWorkspaceId).toBe('new-workspace')
      expect(store.tenantRole).toBe('ROLE_USER')
    })
  })

  describe('Language Handling', () => {
    it('should return correct API language format', () => {
      const store = useUserStore()
      
      store.language = 'PT'
      expect(store.getApiLanguage).toBe('pt')
      
      store.language = 'EN'
      expect(store.getApiLanguage).toBe('en')
      
      store.language = 'ES'
      expect(store.getApiLanguage).toBe('pt') // Fallback
    })
  })

  describe('Token Refresh', () => {
    it('should preserve selected workspace context when refreshed token response is not workspace-scoped', async () => {
      const store = useUserStore()
      const AuthService = (await import('@/services/AuthService')).default
      const WorkspaceService = (await import('@/services/WorkspaceService')).default

      store.auth = true
      store.user.workspaces = [
        { workspaceId: 'ws-1', workspaceName: 'Workspace 1', role: 'ROLE_OWNER' }
      ]
      store.setCurrentWorkspace('ws-1', 'ROLE_OWNER', 'Workspace 1')

      const payload = {
        user_id: '123',
        user_email: 'john@example.com',
        user_language: 'EN',
        workspaces: [
          { workspaceId: 'ws-1', workspaceName: '', role: 'ROLE_OWNER' }
        ]
      }
      const encodedPayload = btoa(JSON.stringify(payload))
      const refreshedToken = `header.${encodedPayload}.signature`

      vi.mocked(AuthService.refreshToken).mockResolvedValue({
        data: {
          accessToken: refreshedToken
        }
      })
      vi.mocked(WorkspaceService.getDetails).mockResolvedValue({
        data: {
          workspaceId: 'ws-1',
          name: 'Workspace 1'
        }
      })

      const refreshed = await store.tryRefreshToken()

      expect(refreshed).toBe(true)
      expect(store.token).toBe(refreshedToken)
      expect(store.currentWorkspaceId).toBe('ws-1')
      expect(store.tenantRole).toBe('ROLE_OWNER')
      expect(store.getWorkspaces[0]).toEqual({
        workspaceId: 'ws-1',
        workspaceName: 'Workspace 1',
        role: 'ROLE_OWNER'
      })
    })
  })

  describe('Logout', () => {
    it('should clear all state', () => {
      const store = useUserStore()
      
      store.token = 'token'
      store.auth = true
      store.currentWorkspaceId = 'comp-123'
      store.saveState()
      
      store.logout()
      
      expect(store.token).toBeNull()
      expect(store.auth).toBe(false)
      expect(store.currentWorkspaceId).toBeNull()
      expect(sessionStorage.getItem('userStore')).toBeNull()
    })
  })
})
