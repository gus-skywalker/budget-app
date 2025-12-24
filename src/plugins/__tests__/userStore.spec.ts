import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '@/plugins/userStore'

// Mock CompanyService
vi.mock('@/services/CompanyService', () => ({
  default: {
    selectCompany: vi.fn()
  }
}))

describe('UserStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const store = useUserStore()
      expect(store.token).toBeNull()
      expect(store.refreshToken).toBeNull()
      expect(store.auth).toBe(false)
      expect(store.currentCompanyId).toBeNull()
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
        token: 'header.eyJ1c2VyX2lkIjoiMTIzIn0.signature',
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

    it('should process signin response with multiple companies', () => {
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
        token: mockToken,
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

    it('should process signin response with preselected company', () => {
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
        token: mockToken,
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
      const saved = localStorage.getItem('userStore')
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
      
      localStorage.setItem('userStore', JSON.stringify(state))
      
      const store = useUserStore()
      store.loadState()
      
      expect(store.token).toBe('saved-token')
      expect(store.currentCompanyId).toBe('comp-123')
      expect(store.tenantRole).toBe('ROLE_ADMIN')
      expect(store.language).toBe('EN')
    })
  })

  describe('Company Management', () => {
    it('should set current company correctly', () => {
      const store = useUserStore()
      
      store.setCurrentCompany('comp-456', 'ROLE_USER', 'Test Company')
      
      expect(store.currentCompanyId).toBe('comp-456')
      expect(store.tenantRole).toBe('ROLE_USER')
    })

    it('should detect multiple companies', () => {
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

  describe('selectCompany', () => {
    it('should call API and update state', async () => {
      const store = useUserStore()
      const CompanyService = (await import('@/services/CompanyService')).default
      
      const payload = {
        user_id: '123',
        companyId: 'new-company',
        userRole: 'ROLE_USER'
      }
      const encodedPayload = btoa(JSON.stringify(payload))
      const newToken = `header.${encodedPayload}.signature`
      
      vi.mocked(CompanyService.selectCompany).mockResolvedValue({
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
      expect(localStorage.getItem('userStore')).toBeNull()
    })
  })
})
