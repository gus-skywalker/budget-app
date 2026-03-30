import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '@/plugins/userStore'

// Mock WorkspaceService
vi.mock('@/services/WorkspaceService', () => ({
  default: {
    selectCompany: vi.fn(),
    selectWorkspace: vi.fn(),
    clearCompany: vi.fn(),
    clearWorkspace: vi.fn()
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
      expect(store.refreshToken).toBeNull()
      expect(store.auth).toBe(false)
      expect(store.currentCompanyId).toBeNull()
      expect(store.getCurrentWorkspaceId).toBeNull()
      expect(store.isWorkspaceMode).toBe(false)
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
        companyId: 'company-456',
        tenantRole: 'ROLE_ADMIN',
        user_language: 'EN',
        companies: [
          { companyId: 'company-456', companyName: 'Test Corp', role: 'ROLE_ADMIN' }
        ]
      }
      
      const encodedPayload = btoa(JSON.stringify(payload))
      const mockToken = `header.${encodedPayload}.signature`
      
      store.syncFromToken(mockToken)

      expect(store.currentCompanyId).toBe('company-456')
      expect(store.getCurrentWorkspaceId).toBe('company-456')
      expect(store.tenantRole).toBe('ROLE_ADMIN')
      expect(store.language).toBe('EN')
      expect(store.user.companies).toEqual(payload.companies)
    })

    it('should handle invalid JWT gracefully', () => {
      const store = useUserStore()
      
      // Invalid token format
      store.syncFromToken('invalid.token')
      
      // Should not crash and should not update state
      expect(store.currentCompanyId).toBeNull()
      expect(store.getCurrentWorkspaceId).toBeNull()
    })
  })

  describe('handleSigninResponse', () => {
    it('should process signin response with no companies', () => {
      const store = useUserStore()
      
      const response = {
        id: 'user123',
        username: 'John Doe',
        email: 'john@example.com',
        language: 'PT',
        accessToken: 'header.eyJ1c2VyX2lkIjoiMTIzIn0.signature',
        refreshToken: 'refresh123',
        companyId: null,
        companies: []
      }
      
      const result = store.handleSigninResponse(response)
      
      expect(store.auth).toBe(true)
      expect(store.user.email).toBe('john@example.com')
      expect(store.language).toBe('PT')
      expect(result.hasCompanies).toBe(false)
      expect(result.companyPreselected).toBe(false)
    })

    it('should process signin response with multiple workspaces', () => {
      const store = useUserStore()
      
      const companies = [
        { companyId: 'comp1', companyName: 'Company 1', role: 'ROLE_ADMIN' },
        { companyId: 'comp2', companyName: 'Company 2', role: 'ROLE_USER' }
      ]
      
      // Create token with companies in payload
      const payload = {
        user_id: '123',
        companies: companies
      }
      const encodedPayload = btoa(JSON.stringify(payload))
      const mockToken = `header.${encodedPayload}.signature`
      
      const response = {
        id: 'user123',
        username: 'John Doe',
        email: 'john@example.com',
        language: 'EN',
        accessToken: mockToken,
        refreshToken: 'refresh123',
        companyId: null,
        companies
      }
      
      const result = store.handleSigninResponse(response)
      
      expect(result.hasCompanies).toBe(true)
      expect(result.hasMultipleCompanies).toBe(true)
      expect(result.companyPreselected).toBe(false)
      expect(store.user.companies).toEqual(companies)
    })

    it('should process signin response with a preselected workspace', () => {
      const store = useUserStore()
      
      const companies = [
        { companyId: 'comp1', companyName: 'Company 1', role: 'ROLE_ADMIN' }
      ]
      
      const payload = {
        user_id: '123',
        companyId: 'comp1',
        userRole: 'ROLE_ADMIN'
      }
      const encodedPayload = btoa(JSON.stringify(payload))
      const mockToken = `header.${encodedPayload}.signature`
      
      const response = {
        id: 'user123',
        username: 'John Doe',
        email: 'john@example.com',
        language: 'PT',
        accessToken: mockToken,
        refreshToken: 'refresh123',
        companyId: 'comp1',
        companies
      }
      
      const result = store.handleSigninResponse(response)
      
      expect(result.companyPreselected).toBe(true)
      expect(store.currentCompanyId).toBe('comp1')
      expect(store.tenantRole).toBe('ROLE_ADMIN')
    })
  })

  describe('Token Management', () => {
    it('should set and persist tokens', () => {
      const store = useUserStore()
      
      store.setToken('access123')
      store.setRefreshToken('refresh456')
      
      expect(store.token).toBe('access123')
      expect(store.refreshToken).toBe('refresh456')
      
      // Check persistence
      const saved = sessionStorage.getItem('userStore')
      expect(saved).toBeTruthy()
      const parsed = JSON.parse(saved!)
      expect(parsed.token).toBe('access123')
      expect(parsed.refreshToken).toBe('refresh456')
    })

    it('should load state from session storage', () => {
      const state = {
        token: 'saved-token',
        refreshToken: 'saved-refresh',
        auth: true,
        user: { id: '123', email: 'test@test.com' },
        currentCompanyId: 'comp-123',
        tenantRole: 'ROLE_ADMIN',
        language: 'EN'
      }
      
      sessionStorage.setItem('userStore', JSON.stringify(state))
      
      const store = useUserStore()
      store.loadState()
      
      expect(store.token).toBe('saved-token')
      expect(store.currentCompanyId).toBe('comp-123')
      expect(store.tenantRole).toBe('ROLE_ADMIN')
      expect(store.language).toBe('EN')
    })

    it('should load preferred context from localStorage', () => {
      localStorage.setItem('userPreference', JSON.stringify({
        preferredMode: 'tenant',
        preferredCompanyId: 'comp-pref'
      }))

      const store = useUserStore()
      store.loadState()

      expect(store.getPreferredMode).toBe('tenant')
      expect(store.getPreferredCompanyId).toBe('comp-pref')
      expect(store.getPreferredWorkspaceId).toBe('comp-pref')
    })
  })

  describe('Workspace Aliases', () => {
    it('should set current workspace correctly through the legacy company state', () => {
      const store = useUserStore()
      
      store.setCurrentCompany('comp-456', 'ROLE_USER', 'Test Company')
      
      expect(store.currentCompanyId).toBe('comp-456')
      expect(store.getCurrentWorkspaceId).toBe('comp-456')
      expect(store.tenantRole).toBe('ROLE_USER')
    })

    it('should set current workspace correctly via alias', () => {
      const store = useUserStore()

      store.setCurrentWorkspace('comp-789', 'ROLE_ADMIN', 'Workspace X')

      expect(store.currentCompanyId).toBe('comp-789')
      expect(store.getCurrentWorkspaceId).toBe('comp-789')
      expect(store.tenantRole).toBe('ROLE_ADMIN')
    })

    it('should update workspace name via alias', () => {
      const store = useUserStore()

      store.user.companies = [
        { companyId: 'comp-789', companyName: 'Old Name', role: 'ROLE_ADMIN' }
      ]

      store.updateWorkspaceName('comp-789', 'New Workspace Name')

      expect(store.user.companies[0].companyName).toBe('New Workspace Name')
    })

    it('should clear current workspace via alias', () => {
      const store = useUserStore()

      store.setCurrentWorkspace('comp-789', 'ROLE_ADMIN', 'Workspace X')
      store.clearCurrentWorkspace()

      expect(store.currentCompanyId).toBeNull()
      expect(store.getCurrentWorkspaceId).toBeNull()
      expect(store.tenantRole).toBeNull()
    })

    it('should detect multiple workspaces', () => {
      const store = useUserStore()
      
      store.user.companies = [
        { companyId: 'comp1', role: 'ROLE_ADMIN' },
        { companyId: 'comp2', role: 'ROLE_USER' }
      ]
      
      expect(store.hasMultipleCompanies).toBe(true)
    })

    it('should identify admin role', () => {
      const store = useUserStore()
      
      store.tenantRole = 'role_admin'
      expect(store.isAdmin).toBe(true)
      
      store.tenantRole = 'ROLE_USER'
      expect(store.isAdmin).toBe(false)
    })
  })

  describe('selectCompany (legacy transport)', () => {
    it('should call the API and update the active workspace state', async () => {
      const store = useUserStore()
      const WorkspaceService = (await import('@/services/WorkspaceService')).default
      
      const payload = {
        user_id: '123',
        companyId: 'new-company',
        userRole: 'ROLE_USER'
      }
      const encodedPayload = btoa(JSON.stringify(payload))
      const newToken = `header.${encodedPayload}.signature`
      
      vi.mocked(WorkspaceService.selectWorkspace).mockResolvedValue({
        data: {
          accessToken: newToken,
          refreshToken: 'new-refresh',
          tenantRole: 'ROLE_USER'
        }
      })
      
      store.user.companies = [
        { companyId: 'new-company', companyName: 'New Corp', role: 'ROLE_USER' }
      ]
      
      await store.selectCompany('new-company')
      
      expect(store.token).toBe(newToken)
      expect(store.refreshToken).toBe('new-refresh')
      expect(store.currentCompanyId).toBe('new-company')
      expect(store.getCurrentWorkspaceId).toBe('new-company')
      expect(store.tenantRole).toBe('ROLE_USER')
    })
  })

  describe('selectWorkspace', () => {
    it('should delegate to the legacy transport and update the active workspace state', async () => {
      const store = useUserStore()
      const WorkspaceService = (await import('@/services/WorkspaceService')).default

      const payload = {
        user_id: '123',
        companyId: 'workspace-1',
        userRole: 'ROLE_ADMIN'
      }
      const encodedPayload = btoa(JSON.stringify(payload))
      const newToken = `header.${encodedPayload}.signature`

      vi.mocked(WorkspaceService.selectWorkspace).mockResolvedValue({
        data: {
          accessToken: newToken,
          refreshToken: 'new-refresh',
          tenantRole: 'ROLE_ADMIN'
        }
      })

      store.user.companies = [
        { companyId: 'workspace-1', companyName: 'Workspace 1', role: 'ROLE_ADMIN' }
      ]

      await store.selectWorkspace('workspace-1')

      expect(store.currentCompanyId).toBe('workspace-1')
      expect(store.getCurrentWorkspaceId).toBe('workspace-1')
      expect(store.tenantRole).toBe('ROLE_ADMIN')
    })
  })

  describe('clearWorkspaceSelection', () => {
    it('should delegate to the legacy transport and clear the active workspace state', async () => {
      const store = useUserStore()
      const WorkspaceService = (await import('@/services/WorkspaceService')).default

      const payload = {
        user_id: '123'
      }
      const encodedPayload = btoa(JSON.stringify(payload))
      const newToken = `header.${encodedPayload}.signature`

      vi.mocked(WorkspaceService.clearWorkspace).mockResolvedValue({
        data: {
          accessToken: newToken,
          refreshToken: 'new-refresh'
        }
      })

      store.setCurrentWorkspace('workspace-1', 'ROLE_ADMIN', 'Workspace 1')

      await store.clearWorkspaceSelection()

      expect(store.currentCompanyId).toBeNull()
      expect(store.getCurrentWorkspaceId).toBeNull()
      expect(store.tenantRole).toBeNull()
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

  describe('Logout', () => {
    it('should clear all state', () => {
      const store = useUserStore()
      
      store.token = 'token'
      store.refreshToken = 'refresh'
      store.auth = true
      store.currentCompanyId = 'comp-123'
      store.saveState()
      
      store.logout()
      
      expect(store.token).toBeNull()
      expect(store.refreshToken).toBeNull()
      expect(store.auth).toBe(false)
      expect(store.currentCompanyId).toBeNull()
      expect(store.getCurrentWorkspaceId).toBeNull()
      expect(sessionStorage.getItem('userStore')).toBeNull()
    })
  })
})
