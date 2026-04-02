import type { Ref } from 'vue'
import { useUserStore } from '@/plugins/userStore'

// This file exists only to prove Pinia typings are inferred from userStore.ts.
// It is compiled by `vue-tsc` and should never be imported at runtime.

const store = useUserStore()

// Basic getter type expectations
const token: string | null = store.getToken
const refreshToken: string | null = store.getRefreshToken
const isAuth: boolean = store.isAuthenticated
const workspaces = store.getWorkspaces

// Action expectations
store.setPreferredPersonal()
store.setPreferredWorkspace('workspace-1')
store.setCurrentWorkspace('workspace-1', 'ROLE_OWNER', 'ACME')
store.clearCurrentWorkspace()

// @ts-expect-error - workspaceId must be string
store.setPreferredWorkspace(123)

// Ensure workspaces is an array-like
const firstWorkspaceId: string | undefined = workspaces[0]?.workspaceId

// This is just to ensure vue types are resolvable in this compilation unit
const maybeVueRef: Ref<string> | undefined = undefined
void maybeVueRef
void token
void refreshToken
void isAuth
void firstWorkspaceId

