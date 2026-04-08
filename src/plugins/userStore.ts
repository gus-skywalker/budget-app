/**
 * Token Refresh Flow
 *
 * - When an API call fails due to expired access token (401), call userStore.tryRefreshToken().
 * - If tryRefreshToken() succeeds, retry the original request.
 * - Refresh token is kept in HttpOnly cookie and never exposed to client JavaScript.
 * - If tryRefreshToken() fails (cookie expired/invalid), user is logged out automatically.
 * - This ensures seamless session renewal and only logs out when both tokens are invalid.
 */
// src/plugins/userStore.ts
import { defineStore } from 'pinia'
import WorkspaceService from '@/services/WorkspaceService'
import AuthService from '@/services/AuthService'

let refreshTimer: number | null = null

/**
 * Decode JWT token without external libraries
 */
function decodeJWT(token: string): any {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      console.error('Error decoding JWT:', new Error('Invalid JWT format'))
      return null
    }
    const payload = parts[1]
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
    const decoded = atob(padded)

    // JWT payload is UTF-8 JSON; atob returns a binary string.
    // Try to decode as UTF-8 safely; fallback to plain JSON parse.
    try {
      const utf8 = decodeURIComponent(
        Array.from(decoded)
          .map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, '0')}`)
          .join('')
      )
      return JSON.parse(utf8)
    } catch {
      return JSON.parse(decoded)
    }
  } catch (error) {
    console.error('Error decoding JWT:', error)
    return null
  }
}

const TENANT_ADMIN_ROLES = ['ROLE_OWNER', 'ROLE_ADMIN']
const TENANT_WRITE_ROLES = ['ROLE_OWNER', 'ROLE_ADMIN', 'ROLE_MEMBER']
const hasWorkspaceName = (value?: string) => Boolean(value && value.trim().length > 0)

type Workspace = {
  workspaceId: string
  workspaceName?: string
  role?: string | null
}

interface User {
  id?: string
  username?: string
  email?: string
  avatar?: string
  language?: string
  workspaces?: Workspace[]
  userRoles?: string[]
}

interface WorkspaceClaim {
  workspaceId: string
  workspaceName?: string
  role?: string | null
}

const workspaceIdOf = (workspace?: Partial<Workspace> | null): string =>
  String(workspace?.workspaceId ?? '')

const workspaceNameOf = (workspace?: Partial<Workspace> | null): string | undefined =>
  workspace?.workspaceName

const workspaceRoleOf = (workspace?: Partial<Workspace> | null): string | null =>
  workspace?.role ?? null

const normalizeWorkspace = (workspace: WorkspaceClaim): Workspace => {
  const workspaceId = workspace.workspaceId ?? ''
  const workspaceName = workspace.workspaceName
  return {
    workspaceId,
    workspaceName,
    role: workspace.role ?? null
  }
}

function mergeWorkspaces(incoming: Workspace[], existing: Workspace[] = []): Workspace[] {
  const existingById = new Map(existing.map((workspace) => [workspaceIdOf(workspace), workspace]))
  return incoming.map((workspace) => {
    const id = workspaceIdOf(workspace)
    const previous = existingById.get(id)
    const workspaceName = hasWorkspaceName(workspaceNameOf(workspace))
      ? workspaceNameOf(workspace)
      : workspaceNameOf(previous)

    return {
      workspaceId: id,
      workspaceName,
      role: workspace.role ?? previous?.role ?? null,
    }
  })
}

function getMissingWorkspaceNameIds(workspaces: Workspace[] = []): string[] {
  return workspaces
    .filter((workspace) => Boolean(workspaceIdOf(workspace)) && !hasWorkspaceName(workspaceNameOf(workspace)))
    .map((workspace) => workspaceIdOf(workspace))
}

function findWorkspaceById(workspaces: Workspace[] = [], workspaceId?: string | null): Workspace | null {
  if (!workspaceId) return null
  return workspaces.find((workspace) => workspaceIdOf(workspace) === workspaceId) ?? null
}

type State = {
  token: string | null
  auth: boolean
  user: User
  currentWorkspaceId: string | null
  tenantRole: string | null
  language: string
  preferredMode: 'personal' | 'tenant' | null
  preferredWorkspaceId: string | null
  refreshInFlight: boolean
}

export const useUserStore = defineStore({
  id: 'userStore',
  
  state: (): State => ({
    token: null,
    auth: false,
    user: {},
    currentWorkspaceId: null,
    tenantRole: null,
    language: 'PT',
    preferredMode: null,
    preferredWorkspaceId: null,
    refreshInFlight: false,
  }),

  getters: {
    getUser: (state): User => state.user,
    isAuthenticated: (state): boolean => state.auth,
    getToken: (state): string | null => state.token,
    getCurrentWorkspaceId: (state): string | null => state.currentWorkspaceId,
    getCurrentRole: (state): string | null => state.tenantRole,
    getTenantRole: (state): string | null => state.tenantRole,
    getWorkspaces: (state): Workspace[] => state.user.workspaces || [],
    getUserRoles: (state): string[] => state.user.userRoles || [],
    hasMultipleWorkspaces: (state): boolean => (state.user.workspaces?.length || 0) > 1,
    isAdmin: (state): boolean => TENANT_ADMIN_ROLES.includes((state.tenantRole || '').toUpperCase()),
    isPersonalMode: (state): boolean => !state.currentWorkspaceId,
    isTenantMode: (state): boolean => Boolean(state.currentWorkspaceId && state.tenantRole),
    isTenantAdmin: (state): boolean => TENANT_ADMIN_ROLES.includes((state.tenantRole || '').toUpperCase()),
    canWrite: (state): boolean => TENANT_WRITE_ROLES.includes((state.tenantRole || '').toUpperCase()),
    getLanguage: (state): string => state.language,
    getPreferredMode: (state): 'personal' | 'tenant' | null => state.preferredMode,
    getPreferredWorkspaceId: (state): string | null => state.preferredWorkspaceId,
    getApiLanguage: (state): string => {
      const lang = state.language.toLowerCase()
      return ['pt', 'en', 'fr'].includes(lang) ? lang : 'pt'
    },
  },

  actions: {
    savePreference() {
      localStorage.setItem(
        'userPreference',
        JSON.stringify({
          preferredMode: this.preferredMode,
          preferredWorkspaceId: this.preferredWorkspaceId
        })
      )
    },

    loadPreference() {
      try {
        const raw = localStorage.getItem('userPreference')
        if (!raw) return
        const parsed = JSON.parse(raw)
        const mode = parsed?.preferredMode
        const workspaceId = parsed?.preferredWorkspaceId

        if (mode === 'personal' || mode === 'tenant' || mode === null) {
          this.preferredMode = mode
        }
        if (typeof workspaceId === 'string' || workspaceId === null) {
          this.preferredWorkspaceId = workspaceId
        }
      } catch {
        // ignore
      }
    },

    setPreferredPersonal() {
      this.preferredMode = 'personal'
      this.preferredWorkspaceId = null
      this.savePreference()
    },

    setPreferredWorkspace(workspaceId: string) {
      this.preferredMode = 'tenant'
      this.preferredWorkspaceId = workspaceId
      this.savePreference()
    },

    setToken(token: string | null) {
      this.token = token
      this.scheduleAccessTokenRefresh(token)
      this.saveState()
    },

    setAuth(value: boolean) {
      this.auth = value
      this.saveState()
    },

    setUser(user: User) {
      const hasIncomingWorkspaces = Object.prototype.hasOwnProperty.call(user, 'workspaces')
      const incomingWorkspaces = hasIncomingWorkspaces
        ? (user.workspaces || []).map((workspace) => normalizeWorkspace(workspace as WorkspaceClaim))
        : null
      const mergedWorkspaces = incomingWorkspaces === null
        ? (this.getWorkspaces || [])
        : mergeWorkspaces(incomingWorkspaces, this.getWorkspaces || [])
      const nextUser: User = {
        ...this.user,
        ...user,
        workspaces: mergedWorkspaces
      }
      this.user = nextUser
      if (nextUser.language) {
        this.language = nextUser.language
      }
      this.saveState()
    },

    setLanguage(language: string) {
      this.language = language
      this.saveState()
    },

    setCurrentWorkspace(workspaceId: string | null, role?: string | null, workspaceName?: string) {
      this.currentWorkspaceId = workspaceId
      const matchingWorkspace = workspaceId ? findWorkspaceById(this.getWorkspaces || [], workspaceId) : null
      this.tenantRole = role || workspaceRoleOf(matchingWorkspace)

      if (workspaceId && workspaceName) {
        const workspaces = this.getWorkspaces || []
        const workspace = workspaces.find((item: Workspace) => workspaceIdOf(item) === workspaceId)
        if (workspace && !workspaceNameOf(workspace)) {
          workspace.workspaceName = workspaceName
        }
        this.user.workspaces = workspaces
      }
      this.saveState()
    },

    setWorkspaces(workspaces: Workspace[]) {
      const merged = mergeWorkspaces((workspaces || []).map((workspace) => normalizeWorkspace(workspace as WorkspaceClaim)), this.getWorkspaces || [])
      this.user.workspaces = merged
      this.saveState()
      const missingNames = getMissingWorkspaceNameIds(merged)
      if (missingNames.length && this.token) {
        void this.hydrateWorkspaceDetailsFromBudget(missingNames)
      }
    },

    updateWorkspaceName(workspaceId: string, workspaceName: string) {
      const workspaces = [...(this.getWorkspaces || [])]
      if (!workspaces.length || !workspaceId) return
      const workspace = workspaces.find((item: Workspace) => workspaceIdOf(item) === workspaceId)
      if (!workspace) return
      workspace.workspaceName = workspaceName
      this.user.workspaces = workspaces
      this.saveState()
    },

    clearCurrentWorkspace() {
      this.currentWorkspaceId = null
      this.tenantRole = null
      this.saveState()
    },

    resetUser() {
      this.clearRefreshTimer()
      this.token = null
      this.auth = false
      this.user = {}
      this.currentWorkspaceId = null
      this.tenantRole = null
      this.language = 'PT'
      this.refreshInFlight = false
      this.saveState()
    },

    saveState() {
      sessionStorage.setItem('userStore', JSON.stringify({
        token: this.token,
        auth: this.auth,
        user: this.user,
        currentWorkspaceId: this.currentWorkspaceId,
        tenantRole: this.tenantRole,
        language: this.language
      }))
    },

    loadState() {
      const saved = sessionStorage.getItem('userStore')
      if (saved) {
        try {
          const state = JSON.parse(saved)
          this.token = state.token
          this.auth = state.auth
          this.user = {
            ...(state.user || {}),
            workspaces: (state.user?.workspaces || []).map((workspace: WorkspaceClaim) => normalizeWorkspace(workspace))
          }
          this.currentWorkspaceId = state.currentWorkspaceId ?? null
          this.tenantRole = state.tenantRole
          this.language = state.language || 'PT'

          if (this.currentWorkspaceId && !this.tenantRole) {
            this.tenantRole = workspaceRoleOf(findWorkspaceById(this.user.workspaces || [], this.currentWorkspaceId))
          }
        } catch {
          sessionStorage.removeItem('userStore')
        }
      }

      // Preference is intentionally stored in localStorage (survives sessions)
      this.loadPreference()

      if (this.token) {
        this.scheduleAccessTokenRefresh(this.token)
      }
    },

    /**
     * Decode JWT and sync state from token claims
     */
    syncFromToken(token: string) {
      const decoded = decodeJWT(token)
      if (!decoded) return

      this.scheduleAccessTokenRefresh(token)

      if (decoded.user_id) {
        this.user.id = decoded.user_id
      }

      if (decoded.user_email) {
        this.user.email = decoded.user_email
      }

      if (decoded.user_fullname) {
        this.user.username = decoded.user_fullname
      }

      if (decoded.user_language) {
        this.language = decoded.user_language
        this.user.language = decoded.user_language
      }

      const workspacesClaim = Array.isArray(decoded.workspaces) ? decoded.workspaces : []
      if (workspacesClaim.length) {
        this.setWorkspaces(workspacesClaim.map((workspace: WorkspaceClaim) => normalizeWorkspace(workspace)))
      }

      if (decoded.userRoles) {
        if (Array.isArray(decoded.userRoles)) {
          this.user.userRoles = decoded.userRoles
        } else if (typeof decoded.userRoles === 'string') {
          this.user.userRoles = decoded.userRoles.split(' ').filter(Boolean)
        }
      }

      if (decoded.workspaceId) {
        this.currentWorkspaceId = decoded.workspaceId
      } else {
        this.currentWorkspaceId = null
      }

      if (decoded.tenantRole || decoded.userRole || decoded.role) {
        this.tenantRole = decoded.tenantRole || decoded.userRole || decoded.role
      } else if (decoded.workspaceId) {
        this.tenantRole = workspaceRoleOf(findWorkspaceById(this.getWorkspaces || [], decoded.workspaceId))
      } else if (!decoded.workspaceId) {
        this.tenantRole = null
      }

      // Only update preference when token is explicitly tenant-scoped.
      if (this.getCurrentWorkspaceId) {
        this.setPreferredWorkspace(this.getCurrentWorkspaceId)
      }

      this.saveState()
    },

    clearRefreshTimer() {
      if (refreshTimer) {
        clearTimeout(refreshTimer)
        refreshTimer = null
      }
    },

    scheduleAccessTokenRefresh(token: string | null) {
      this.clearRefreshTimer()
      if (!token) return

      const decoded = decodeJWT(token)
      const expSeconds = decoded?.exp
      if (!expSeconds || typeof expSeconds !== 'number') {
        return
      }

      const expiresAtMs = expSeconds * 1000
      const refreshAtMs = expiresAtMs - 60_000
      const delayMs = Math.max(5_000, refreshAtMs - Date.now())

      refreshTimer = window.setTimeout(async () => {
        await this.tryRefreshToken()
      }, delayMs)
    },

    async hydrateWorkspaceDetailsFromBudget(workspaceIds?: string[]) {
      const targetIds = (workspaceIds && workspaceIds.length
        ? workspaceIds
        : [
            ...(this.getWorkspaces || []).map((workspace: Workspace) => workspaceIdOf(workspace)),
            ...(this.getCurrentWorkspaceId ? [this.getCurrentWorkspaceId] : [])
          ]).filter(Boolean) as string[]

      const uniqueIds = Array.from(new Set(targetIds))
      if (!uniqueIds.length) return

      const byId = new Map<string, Workspace>((this.getWorkspaces || []).map((workspace: Workspace) => [workspaceIdOf(workspace), { ...workspace }]))

      await Promise.all(
        uniqueIds.map(async (workspaceId) => {
          const existing = byId.get(workspaceId)
          if (existing?.workspaceName && existing.workspaceName.trim().length > 0) {
            return
          }

          try {
            const response = await WorkspaceService.getDetails(workspaceId)
            const workspaceName =
              response?.data?.workspaceName ||
              response?.data?.name ||
              response?.data?.title ||
              null

            if (!workspaceName) return

            byId.set(workspaceId, {
              workspaceId,
              workspaceName: String(workspaceName),
              role: existing?.role ?? null,
            })
          } catch {
            console.warn('Could not hydrate workspace details from budget-api for workspaceId=', workspaceId)
          }
        })
      )

      const workspaces = Array.from(byId.values())
      this.user.workspaces = workspaces
      this.saveState()
    },

    /**
     * Handle signin response from backend
     * Implements B2B multi-tenant flow decision logic
     */
    handleSigninResponse(response: any) {
      const accessToken = response?.accessToken

      if (!accessToken) {
        console.error('Invalid signin response: missing accessToken', response)
      }

      if (accessToken) {
        this.token = accessToken
        this.auth = true
      }

      const userLanguage = response.language || this.language || 'PT'
      this.language = userLanguage

      const responseUserRoles = response?.userRoles ?? response?.userRole
      const normalizedUserRoles: string[] | undefined = Array.isArray(responseUserRoles)
        ? responseUserRoles
        : typeof responseUserRoles === 'string'
          ? responseUserRoles.split(' ').filter(Boolean)
          : undefined

      this.setUser({
        id: response.id,
        username: response.username,
        email: response.email,
        language: userLanguage,
        workspaces: (response.workspaces || this.user.workspaces || []).map((workspace: WorkspaceClaim) => normalizeWorkspace(workspace)),
        userRoles: normalizedUserRoles
      })

      if (accessToken) {
        this.syncFromToken(accessToken)
      }

      const workspaceId = response.workspaceId || this.getCurrentWorkspaceId
      const tenantRole = response.tenantRole || this.tenantRole

      if (workspaceId && tenantRole) {
        const selectedWorkspace = this.getWorkspaces?.find((workspace: Workspace) => workspaceIdOf(workspace) === workspaceId)
        this.setCurrentWorkspace(workspaceId, tenantRole, workspaceNameOf(selectedWorkspace))
        this.setPreferredWorkspace(workspaceId)
      }

      const workspaces = this.getWorkspaces || []

      return {
        hasWorkspaces: workspaces.length > 0,
        hasMultipleWorkspaces: workspaces.length > 1,
        workspacePreselected: Boolean(workspaceId && tenantRole),
        workspaces
      }
    },

    async selectWorkspace(workspaceId: string) {
      try {
        const response = await WorkspaceService.selectWorkspace(workspaceId)
        const { accessToken, tenantRole, workspaceId: resolvedWorkspaceId } = response.data

        if (accessToken) {
          this.token = accessToken
          this.syncFromToken(accessToken)
        }

        const decoded = accessToken ? decodeJWT(accessToken) : null
        const resolvedRole = tenantRole || decoded?.tenantRole
        const effectiveWorkspaceId = resolvedWorkspaceId || decoded?.workspaceId || workspaceId
        const workspaceName = this.getWorkspaces?.find((workspace: Workspace) => workspaceIdOf(workspace) === effectiveWorkspaceId)?.workspaceName

        this.setCurrentWorkspace(effectiveWorkspaceId, resolvedRole, workspaceName)
        this.setPreferredWorkspace(effectiveWorkspaceId)
        await this.hydrateWorkspaceDetailsFromBudget([effectiveWorkspaceId])

        return true
      } catch (error) {
        console.error('Error selecting workspace:', error)
        throw error
      }
    },

    async clearWorkspaceSelection() {
      try {
        const response = await WorkspaceService.clearWorkspace()
        const { accessToken } = response.data

        if (accessToken) {
          this.token = accessToken
          this.syncFromToken(accessToken)
        }

        this.clearCurrentWorkspace()
        this.setPreferredPersonal()
        return true
      } catch (error) {
        console.error('Error clearing workspace selection:', error)
        throw error
      }
    },


    /**
     * Attempt to refresh access token using refresh token
     * Returns true if successful, false if refresh fails
     */
    async tryRefreshToken() {
      if (this.refreshInFlight) {
        return true
      }
      this.refreshInFlight = true
      try {
        const previousWorkspaceId = this.currentWorkspaceId
        const previousTenantRole = this.tenantRole
        const previousWorkspace = previousWorkspaceId
          ? (this.getWorkspaces || []).find((workspace: Workspace) => workspaceIdOf(workspace) === previousWorkspaceId)
          : null

        const response = await AuthService.refreshToken()
        const { accessToken } = response.data
        if (accessToken) {
          this.token = accessToken
          this.syncFromToken(accessToken)

          if (previousWorkspaceId && !this.currentWorkspaceId) {
            this.setCurrentWorkspace(
              previousWorkspaceId,
              previousWorkspace?.role ?? previousTenantRole ?? null,
              previousWorkspace?.workspaceName
            )
          } else if (this.currentWorkspaceId && !this.tenantRole) {
            const currentWorkspace = (this.getWorkspaces || []).find(
              (workspace: Workspace) => workspaceIdOf(workspace) === this.currentWorkspaceId
            )
            if (currentWorkspace?.role || previousTenantRole) {
              this.tenantRole = currentWorkspace?.role ?? previousTenantRole ?? null
              this.saveState()
            }
          }

          await this.hydrateWorkspaceDetailsFromBudget()
        } else {
          return false
        }
        this.auth = true
        this.saveState()
        return true
      } catch (error: any) {
        const status = error?.response?.status
        const body = error?.response?.data
        console.warn('[auth] refresh failed', { status, body })
        this.logout()
        return false
      } finally {
        this.refreshInFlight = false
      }
    },

    /**
     * Logout and clear all state
     */
    logout() {
      this.resetUser()
      sessionStorage.removeItem('userStore')
    }
  }
})
