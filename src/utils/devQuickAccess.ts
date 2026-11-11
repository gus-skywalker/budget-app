import type { WorkspaceCreateRequest } from '@/types/WorkspaceCreateRequest'

const STORAGE_KEY = 'devQuickAccessState'

export type DevQuickAccessScenario = 'no-workspace' | 'single-workspace' | 'multiple-workspaces'

export interface DevQuickAccessWorkspace {
  workspaceId: string
  workspaceName: string
  role?: string | null
  description?: string
  country?: string
  legalDocument?: string | null
}

interface DevQuickAccessState {
  scenario: DevQuickAccessScenario
  workspaces: DevQuickAccessWorkspace[]
}

const isWorkspace = (value: unknown): value is DevQuickAccessWorkspace => {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Record<string, unknown>
  return typeof candidate.workspaceId === 'string' && typeof candidate.workspaceName === 'string'
}

const readState = (): DevQuickAccessState | null => {
  if (!import.meta.env.DEV) return null

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as Partial<DevQuickAccessState>
    const scenario = parsed?.scenario
    const workspaces = Array.isArray(parsed?.workspaces) ? parsed.workspaces.filter(isWorkspace) : []

    if (
      scenario !== 'no-workspace' &&
      scenario !== 'single-workspace' &&
      scenario !== 'multiple-workspaces'
    ) {
      return null
    }

    return {
      scenario,
      workspaces
    }
  } catch {
    return null
  }
}

const persistState = (state: DevQuickAccessState) => {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export const activateDevQuickAccess = (scenario: DevQuickAccessScenario, workspaces: DevQuickAccessWorkspace[]) => {
  if (!import.meta.env.DEV) return

  persistState({
    scenario,
    workspaces
  })
}

export const clearDevQuickAccess = () => {
  sessionStorage.removeItem(STORAGE_KEY)
}

export const isDevQuickAccessEnabled = (): boolean => Boolean(readState())

export const listDevQuickAccessWorkspaces = (): DevQuickAccessWorkspace[] => readState()?.workspaces || []

export const createDevQuickAccessWorkspace = (payload: WorkspaceCreateRequest): DevQuickAccessWorkspace => {
  const state = readState()

  const createdWorkspace: DevQuickAccessWorkspace = {
    workspaceId: `dev-workspace-${Date.now()}`,
    workspaceName: String(payload.name || 'Workspace de teste'),
    role: 'ROLE_ADMIN',
    description: payload.description,
    country: payload.country,
    legalDocument: payload.legalDocument ?? null
  }

  persistState({
    scenario: 'single-workspace',
    workspaces: [...(state?.workspaces || []), createdWorkspace]
  })

  return createdWorkspace
}

export const getDevQuickAccessWorkspace = (workspaceId: string): DevQuickAccessWorkspace | null =>
  listDevQuickAccessWorkspaces().find((workspace) => workspace.workspaceId === workspaceId) || null

export const getDevQuickAccessWorkspaceDetails = (workspaceId: string) => {
  const workspace = getDevQuickAccessWorkspace(workspaceId)
  if (!workspace) return null

  return {
    workspaceId: workspace.workspaceId,
    workspaceName: workspace.workspaceName,
    name: workspace.workspaceName,
    title: workspace.workspaceName,
    description: workspace.description,
    country: workspace.country,
    legalDocument: workspace.legalDocument
  }
}

export const selectDevQuickAccessWorkspace = (workspaceId: string) => {
  const workspace = getDevQuickAccessWorkspace(workspaceId)
  if (!workspace) {
    throw new Error(`Workspace not found in dev quick access: ${workspaceId}`)
  }

  return {
    message: 'Workspace selected in dev quick access mode',
    accessToken: `dev.quick-access.workspace.${workspaceId}`,
    workspaceId,
    tenantRole: workspace.role ?? 'ROLE_MEMBER'
  }
}

export const clearDevQuickAccessWorkspaceSelection = () => ({
  message: 'Workspace cleared in dev quick access mode',
  accessToken: 'dev.quick-access.personal',
  workspaceId: null,
  tenantRole: null
})