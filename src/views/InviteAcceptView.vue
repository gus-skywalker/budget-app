<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/plugins/userStore'
import WorkspaceInviteService from '@/services/WorkspaceInviteService'
import WorkspaceService from '@/services/WorkspaceService'
import OnboardingOrchestrator from '@/services/OnboardingOrchestrator'
import {
  clearInviteAcceptanceContext,
  readInviteAcceptanceToken,
  saveInviteAcceptanceContext
} from '@/utils/inviteAcceptanceContext'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const loading = ref(true)
const done = ref(false)
const errorMessage = ref('')
const acceptedWorkspaceId = ref('')

const token = computed(() => String(route.query.token || readInviteAcceptanceToken() || '').trim())
const inviteRedirectPath = computed(() => token.value ? `/invite/accept?token=${encodeURIComponent(token.value)}` : '/invite/accept')
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function syncWorkspacesAfterAccept() {
  const maxAttempts = 8
  let lastError: unknown = null

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const workspacesRes = await WorkspaceService.getAll()
      const workspaces = Array.isArray(workspacesRes?.data) ? workspacesRes.data : []
      userStore.setWorkspaces(workspaces as any)

      if (!workspaces.length) {
        await wait(250 * attempt)
        continue
      }

      const matchingAcceptedWorkspace = acceptedWorkspaceId.value
        ? workspaces.find((workspace: any) => String(workspace?.workspaceId || '').trim() === acceptedWorkspaceId.value)
        : null

      const targetWorkspaceId = String(
        matchingAcceptedWorkspace?.workspaceId
        || (workspaces.length === 1 ? workspaces[0]?.workspaceId : '')
        || ''
      ).trim()

      if (targetWorkspaceId && !userStore.isTenantMode) {
        await userStore.selectWorkspace(targetWorkspaceId)
      }

      return
    } catch (error) {
      lastError = error
      await wait(250 * attempt)
    }
  }

  console.warn('Could not refresh workspace membership after invite acceptance.', lastError)
}

async function processInviteAccept() {
  if (!token.value) {
    errorMessage.value = 'Invite token not found. Open the original invitation link from your email so CoBudget can identify the workspace.'
    clearInviteAcceptanceContext()
    loading.value = false
    return
  }
  try {
    saveInviteAcceptanceContext({
      token: token.value,
      redirect: inviteRedirectPath.value
    })

    const inviteValidation = await WorkspaceInviteService.validateInvite(token.value)
    const inviteStatus = String(inviteValidation?.status || '').toUpperCase()
    const isRecoverable = !inviteStatus || inviteStatus === 'PENDING' || inviteStatus === 'ACCEPTED'

    if (!inviteValidation?.valid || !isRecoverable) {
      errorMessage.value = 'This invitation is invalid, expired, or no longer pending.'
      clearInviteAcceptanceContext()
      return
    }

    saveInviteAcceptanceContext({
      token: token.value,
      redirect: inviteRedirectPath.value,
      invitedEmail: String(inviteValidation?.email || '').trim() || null
    })

    const requiresAuth = inviteValidation?.requiresAuth !== false
    if (requiresAuth && !userStore.isAuthenticated) {
      router.replace({
        name: 'login',
        query: {
          redirect: inviteRedirectPath.value
        }
      })
      return
    }

    const acceptResponse = await WorkspaceInviteService.acceptInvite(token.value)
    const membershipMaterialized = acceptResponse?.data?.membershipMaterialized !== false
    if (!membershipMaterialized) {
      throw new Error('Invite accepted, but workspace membership is not available yet.')
    }
    acceptedWorkspaceId.value = String(acceptResponse?.data?.workspaceId || '').trim()
    const acceptedRole = String(acceptResponse?.data?.tenantRole || '').trim() || null
    const acceptedWorkspaceName = String(acceptResponse?.data?.workspaceName || '').trim()
    if (acceptedWorkspaceId.value) {
      const existingWorkspaces = [...(userStore.getWorkspaces || [])]
      const index = existingWorkspaces.findIndex((workspace: any) => String(workspace?.workspaceId || '').trim() === acceptedWorkspaceId.value)
      const acceptedWorkspace = {
        workspaceId: acceptedWorkspaceId.value,
        workspaceName: acceptedWorkspaceName || undefined,
        role: acceptedRole
      }

      if (index >= 0) {
        existingWorkspaces[index] = {
          ...existingWorkspaces[index],
          ...acceptedWorkspace
        }
      } else {
        existingWorkspaces.push(acceptedWorkspace)
      }

      userStore.setWorkspaces(existingWorkspaces as any)
      if (acceptedRole) {
        userStore.setCurrentWorkspace(acceptedWorkspaceId.value, acceptedRole, acceptedWorkspaceName || undefined)
        userStore.setPreferredWorkspace(acceptedWorkspaceId.value)
      }
    }
    await syncWorkspacesAfterAccept()
    clearInviteAcceptanceContext()
    done.value = true
  } catch (error: any) {
    const status = Number(error?.response?.status || 0)
    if (status === 401) {
      router.replace({
        name: 'login',
        query: {
          redirect: inviteRedirectPath.value
        }
      })
      return
    }
    if (status === 403) {
      errorMessage.value = 'This invitation belongs to a different account. Sign in with the invited email.'
      return
    }
    errorMessage.value = error?.response?.data?.error || error?.response?.data || 'Could not accept invitation.'
  } finally {
    loading.value = false
  }
}

async function goToDecisions() {
  const onboarding = await OnboardingOrchestrator.resolvePostAuthRoute({
    router,
    userStore,
    redirect: '/decisions',
    defaultRedirect: '/decisions'
  })
  router.push(onboarding.route)
}

onMounted(() => {
  processInviteAccept()
})
</script>

<template>
  <v-container class="fill-height d-flex align-center justify-center">
    <v-card class="pa-6" max-width="560" width="100%">
      <div class="text-h5 font-weight-bold mb-2">Workspace invitation</div>
      <div class="text-body-2 text-medium-emphasis mb-6">
        Accept your invite and continue to the decision workspace.
      </div>

      <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />

      <v-alert
        v-else-if="done"
        type="success"
        variant="tonal"
        class="mb-4"
      >
        Invitation accepted successfully.
      </v-alert>

      <v-alert
        v-else
        type="error"
        variant="tonal"
        class="mb-4"
      >
        {{ errorMessage }}
      </v-alert>

      <v-btn
        v-if="done"
        color="primary"
        block
        @click="goToDecisions"
      >
        Go to Decisions
      </v-btn>
    </v-card>
  </v-container>
</template>
