import type { Ref } from 'vue'
import { useUserStore } from '@/plugins/userStore'

// This file exists only to prove Pinia typings are inferred from userStore.ts.
// It is compiled by `vue-tsc` and should never be imported at runtime.

const store = useUserStore()

// Basic getter type expectations
const token: string | null = store.getToken
const refreshToken: string | null = store.getRefreshToken
const isAuth: boolean = store.isAuthenticated
const companies = store.getCompanies
const workspaces = store.getWorkspaces
const workspaceId: string | null = store.getCurrentWorkspaceId

// Action expectations
store.setPreferredPersonal()
store.setPreferredTenant('company-1')
store.setPreferredWorkspace('workspace-1')
store.setCurrentCompany('company-1', 'ROLE_OWNER', 'ACME')
store.setCurrentWorkspace('workspace-1', 'ROLE_OWNER', 'ACME Workspace')
store.updateWorkspaceName('workspace-1', 'Renamed Workspace')
store.clearCurrentWorkspace()
store.setCurrentWorkspace('workspace-1', 'ROLE_OWNER', 'Workspace')
store.clearCurrentCompany()
store.clearCurrentWorkspace()

// @ts-expect-error - companyId must be string
store.setPreferredTenant(123)

// Ensure companies is an array-like
const firstCompanyId: string | undefined = companies[0]?.companyId
const firstWorkspaceId: string | undefined = workspaces[0]?.companyId

// This is just to ensure vue types are resolvable in this compilation unit
const maybeVueRef: Ref<string> | undefined = undefined
void maybeVueRef
void token
void refreshToken
void isAuth
void firstCompanyId
void firstWorkspaceId
void workspaceId
