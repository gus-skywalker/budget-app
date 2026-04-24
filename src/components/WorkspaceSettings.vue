<template>
  <div class="workspace-settings">
    <template v-if="!currentWorkspaceId">
      <v-row dense>
        <v-col cols="12" md="7" lg="6">
          <v-card class="modern-card">
            <div class="card-header">
              <h3 class="card-title">
                <v-icon color="primary" class="mr-2">mdi-office-building-plus</v-icon>
                {{ $t('workspaceSettings.create_new_workspace') }}
              </h3>
              <p class="card-description">
                {{ $t('workspaceSettings.create_new_workspace_desc') }}
              </p>
            </div>
            <v-card-text>
              <v-form ref="createWorkspaceFormRef" @submit.prevent="createWorkspace">
                <v-text-field
                  v-model="createWorkspaceForm.name"
                  :label="$t('workspaceSettings.workspace_name')"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-office-building"
                  :rules="[requiredRule]"
                  :disabled="creatingWorkspace"
                  class="mb-4"
                />
                <v-text-field
                  v-model="createWorkspaceForm.legalDocument"
                  :label="$t('workspaceSettings.legal_document')"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-card-account-details"
                  :rules="[requiredRule]"
                  :disabled="creatingWorkspace"
                  class="mb-4"
                />
                <v-select
                  v-model="createWorkspaceForm.country"
                  :items="countryOptions"
                  item-title="label"
                  item-value="value"
                  :label="$t('workspaceSettings.country')"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-earth"
                  :rules="[requiredRule]"
                  :disabled="creatingWorkspace"
                  class="mb-4"
                />
                <v-textarea
                  v-model="createWorkspaceForm.description"
                  :label="$t('workspaceSettings.description')"
                  variant="outlined"
                  density="comfortable"
                  auto-grow
                  rows="3"
                  prepend-inner-icon="mdi-text"
                  :disabled="creatingWorkspace"
                />
                <v-btn
                  type="submit"
                  color="primary"
                  class="mt-4"
                  block
                  :loading="creatingWorkspace"
                  :disabled="creatingWorkspace"
                >
                  <v-icon left>mdi-check-circle</v-icon>
                  {{ $t('workspaceSettings.create_workspace') }}
                </v-btn>
              </v-form>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="5" lg="4">
          <v-alert type="info" variant="tonal" border="start" class="mb-4">
            {{ $t('workspaceSettings.personal_mode_alert') }}
          </v-alert>
          <v-btn
            color="primary"
            variant="tonal"
            block
            @click="goToSelectWorkspace"
          >
            <v-icon left>mdi-swap-horizontal</v-icon>
            {{ $t('workspaceSettings.select_existing_workspace') }}
          </v-btn>
        </v-col>
      </v-row>
    </template>

    <template v-else>
      <v-alert
        v-if="!canManageWorkspace"
        type="warning"
        variant="tonal"
        border="start"
        class="mb-4"
      >
        {{ $t('workspaceSettings.only_admin_alert') }}
      </v-alert>

      <v-row dense>
        <v-col cols="12" md="6">
          <v-card class="modern-card">
            <div class="card-header">
              <h3 class="card-title">
                <v-icon color="primary" class="mr-2">mdi-office-building-cog</v-icon>
                {{ $t('workspaceSettings.workspace_info') }}
              </h3>
              <p class="card-description">
                {{ $t('workspaceSettings.workspace_info_desc') }}
              </p>
            </div>
            <v-card-text>
              <v-form ref="workspaceFormRef" @submit.prevent="updateWorkspace">
                <v-text-field
                  v-model="workspaceForm.workspaceName"
                  :label="$t('workspaceSettings.workspace_name')"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-office-building"
                  :disabled="formLoading || !canManageWorkspace"
                  :rules="[requiredRule]"
                  class="mb-4"
                />
                <v-textarea
                  v-model="workspaceForm.description"
                  :label="$t('workspaceSettings.description')"
                  variant="outlined"
                  density="comfortable"
                  auto-grow
                  rows="3"
                  prepend-inner-icon="mdi-text"
                  :disabled="formLoading || !canManageWorkspace"
                />
                <v-btn
                  v-if="canManageWorkspace"
                  type="submit"
                  color="primary"
                  class="mt-4"
                  :loading="savingWorkspace"
                  :disabled="formLoading"
                  block
                >
                  <v-icon left>mdi-content-save</v-icon>
                  {{ $t('workspaceSettings.save_changes') }}
                </v-btn>
              </v-form>
            </v-card-text>
          </v-card>

          <v-card v-if="canManageWorkspace" class="modern-card mt-6">
            <div class="card-header">
              <h3 class="card-title">
                <v-icon color="primary" class="mr-2">mdi-account-plus</v-icon>
                {{ $t('workspaceSettings.invite_members') }}
              </h3>
              <p class="card-description">
                {{ $t('workspaceSettings.invite_members_desc') }}
              </p>
            </div>
            <v-card-text>
              <v-form ref="inviteFormRef" @submit.prevent="sendInvite">
                <v-text-field
                  v-model="inviteForm.email"
                  :label="$t('workspaceSettings.invite_email')"
                  prepend-inner-icon="mdi-email"
                  type="email"
                  variant="outlined"
                  class="mb-3"
                  :rules="[requiredRule, emailRule]"
                  :disabled="inviteLoading"
                />
                <v-select
                  v-model="inviteForm.role"
                  :items="roleOptions"
                  :label="$t('workspaceSettings.permission')"
                  item-title="label"
                  item-value="value"
                  prepend-inner-icon="mdi-shield-account"
                  variant="outlined"
                  :disabled="inviteLoading"
                  class="mb-4"
                />
                <v-btn
                  type="submit"
                  color="primary"
                  block
                  :loading="inviteLoading"
                >
                  <v-icon left>mdi-send</v-icon>
                  {{ $t('workspaceSettings.send_invite') }}
                </v-btn>
              </v-form>

              <v-divider class="my-4" />

              <div class="section-title">{{ $t('workspaceSettings.pending_invites') }}</div>
              <v-alert
                v-if="!invitesAvailable"
                type="info"
                variant="tonal"
                class="mt-2"
              >
                {{ $t('workspaceSettings.invites_unavailable') }}
              </v-alert>
              <v-alert
                v-else-if="!invites.length"
                type="info"
                variant="tonal"
                class="mt-2"
              >
                {{ $t('workspaceSettings.no_pending_invites') }}
              </v-alert>
              <v-list v-else density="comfortable">
                <v-list-item
                  v-for="invite in invites"
                  :key="invite.id"
                >
                  <v-list-item-title>{{ invite.email }}</v-list-item-title>
                  <v-list-item-subtitle>{{ getRoleLabel(invite.role) }}</v-list-item-subtitle>
                  <template #append>
                    <v-btn icon variant="text" color="error" @click="cancelInvite(invite.id)">
                      <v-icon>mdi-close-circle</v-icon>
                    </v-btn>
                  </template>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card class="modern-card">
            <div class="card-header">
              <h3 class="card-title">
                <v-icon color="primary" class="mr-2">mdi-account-check</v-icon>
                {{ $t('workspaceSettings.your_membership') }}
              </h3>
              <p class="card-description">
                {{ $t('workspaceSettings.your_membership_desc') }}
              </p>
            </div>
            <v-card-text>
              <div class="d-flex align-center justify-space-between flex-wrap ga-3 mb-4">
                <div>
                  <div class="section-title">{{ workspaceNameForDelete || $t('workspaceSettings.workspace_name') }}</div>
                  <div class="text-medium-emphasis">{{ $t('workspaceSettings.current_access_label') }}</div>
                </div>
                <v-chip size="small" color="primary" variant="tonal">
                  {{ currentRoleLabel }}
                </v-chip>
              </div>

              <v-alert
                v-if="isCurrentOwner"
                type="info"
                variant="tonal"
                class="mb-4"
              >
                {{ $t('workspaceSettings.leave_workspace_owner_hint') }}
              </v-alert>
              <v-alert
                v-else
                type="info"
                variant="tonal"
                class="mb-4"
              >
                {{ $t('workspaceSettings.leave_workspace_hint') }}
              </v-alert>

              <v-btn
                color="warning"
                variant="outlined"
                block
                :loading="leaveLoading"
                @click="leaveDialog = true"
              >
                <v-icon left>mdi-exit-to-app</v-icon>
                {{ $t('workspaceSettings.leave_workspace') }}
              </v-btn>
            </v-card-text>
          </v-card>

          <v-card v-if="canManageWorkspace" class="modern-card">
            <div class="card-header">
              <h3 class="card-title">
                <v-icon color="primary" class="mr-2">mdi-account-multiple</v-icon>
                {{ $t('workspaceSettings.current_members') }}
              </h3>
              <p class="card-description">
                {{ $t('workspaceSettings.current_members_desc') }}
              </p>
            </div>
            <v-card-text>
              <v-alert
                v-if="!members.length"
                type="info"
                variant="tonal"
              >
                {{ $t('workspaceSettings.no_members') }}
              </v-alert>
              <v-list v-else density="compact">
                <v-list-item
                  v-for="member in members"
                  :key="member.id"
                >
                  <template #prepend>
                    <v-avatar color="primary" class="mr-3">
                      {{ member.username?.charAt(0)?.toUpperCase() || 'U' }}
                    </v-avatar>
                  </template>
                  <v-list-item-title>{{ member.username || member.email }}</v-list-item-title>
                  <v-list-item-subtitle>{{ member.email }}</v-list-item-subtitle>
                  <template #append>
                    <v-chip size="small" color="primary" variant="tonal">
                      {{ getRoleLabel(member.role) }}
                    </v-chip>
                  </template>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>

          <v-card v-if="canManageWorkspace" class="modern-card mt-6 danger-card">
            <div class="card-header">
              <h3 class="card-title danger-title">
                <v-icon color="error" class="mr-2">mdi-alert</v-icon>
                {{ $t('workspaceSettings.danger_zone') }}
              </h3>
              <p class="card-description">
                {{ $t('workspaceSettings.danger_zone_desc') }}
              </p>
            </div>
            <v-card-text>
              <v-btn
                color="error"
                variant="outlined"
                block
                @click="deleteDialog = true"
              >
                <v-icon left>mdi-delete</v-icon>
                {{ $t('workspaceSettings.delete_workspace') }}
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <v-dialog v-model="deleteDialog" max-width="520">
      <v-card>
        <v-card-title class="text-h6">{{ $t('workspaceSettings.confirm_delete_title') }}</v-card-title>
        <v-card-text>
          <p class="mb-4" v-html="$t('workspaceSettings.confirm_delete_desc', { workspace: workspaceNameForDelete })"></p>
          <v-text-field
            v-model="deleteConfirm"
            :label="$t('workspaceSettings.workspace_name')"
            variant="outlined"
            density="comfortable"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="closeDeleteDialog">{{ $t('workspaceSettings.cancel') }}</v-btn>
          <v-btn
            color="error"
            variant="elevated"
            :disabled="deleteConfirm !== workspaceNameForDelete"
            :loading="deleteLoading"
            @click="deleteWorkspace"
          >
            {{ $t('workspaceSettings.confirm') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="leaveDialog" max-width="520">
      <v-card>
        <v-card-title class="text-h6">{{ $t('workspaceSettings.confirm_leave_title') }}</v-card-title>
        <v-card-text>
          <p class="mb-0" v-html="$t('workspaceSettings.confirm_leave_desc', { workspace: workspaceNameForDelete || 'workspace' })"></p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="closeLeaveDialog">{{ $t('workspaceSettings.cancel') }}</v-btn>
          <v-btn
            color="warning"
            variant="elevated"
            :loading="leaveLoading"
            @click="leaveWorkspace"
          >
            {{ $t('workspaceSettings.confirm_leave_action') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="4000">
      {{ snackbar.message }}
    </v-snackbar>

    <v-snackbar v-model="upgradeSnackbar" color="warning" timeout="8000">
      {{ upgradeMessage }}
      <template #actions>
        <v-btn variant="text" color="white" @click="goToUpgrade">
          {{ $t('workspaceSettings.view_premium_plans') }}
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import WorkspaceService from '@/services/WorkspaceService'
import WorkspaceInviteService from '@/services/WorkspaceInviteService'
import { useUserStore } from '@/plugins/userStore'
import { getFreePlanLimitType, parseApiError } from '@/utils/errorHandler'
import { getOrCreateCorrelationId } from '@/utils/correlation'
import { createMessageId } from '@/utils/messageId'

const userStore = useUserStore()
const router = useRouter()

const currentWorkspaceId = computed(() => userStore.getCurrentWorkspaceId)
const canManageWorkspace = computed(() => userStore.isTenantAdmin)
const currentRole = computed(() => userStore.getCurrentRole)
const isCurrentOwner = computed(() => String(currentRole.value || '').toUpperCase() === 'ROLE_OWNER')
const currentRoleLabel = computed(() => getRoleLabel(String(currentRole.value || 'ROLE_MEMBER')))

const workspaceFormRef = ref()
const workspaceForm = ref({ workspaceName: '', description: '' })
const formLoading = ref(false)
const savingWorkspace = ref(false)
const createWorkspaceFormRef = ref()
const createWorkspaceForm = ref({
  name: '',
  legalDocument: '',
  country: 'BR',
  description: ''
})
const creatingWorkspace = ref(false)

const workspaceNameForDelete = ref('')

const inviteFormRef = ref()
const inviteForm = ref({ email: '', role: 'ROLE_MEMBER' })
const inviteLoading = ref(false)

const members = ref<any[]>([])
const invites = ref<any[]>([])
const invitesAvailable = ref(true)
let membersAndInvitesPollingTimer: number | null = null

const deleteDialog = ref(false)
const deleteConfirm = ref('')
const deleteLoading = ref(false)
const leaveDialog = ref(false)
const leaveLoading = ref(false)

const snackbar = ref({ show: false, message: '', color: 'success' as 'success' | 'error' | 'info' })
const upgradeSnackbar = ref(false)
const upgradeMessage = ref('')

const roleOptions = [
  { label: t('workspaceSettings.roles.ROLE_ADMIN'), value: 'ROLE_ADMIN' },
  { label: t('workspaceSettings.roles.ROLE_MEMBER'), value: 'ROLE_MEMBER' },
  { label: t('workspaceSettings.roles.ROLE_VIEWER'), value: 'ROLE_VIEWER' }
]

const countryOptions = [
  { label: t('workspaceSettings.countries.br'), value: 'BR' },
  { label: t('workspaceSettings.countries.us'), value: 'US' },
  { label: t('workspaceSettings.countries.pt'), value: 'PT' },
  { label: t('workspaceSettings.countries.es'), value: 'ES' },
  { label: t('workspaceSettings.countries.fr'), value: 'FR' }
]

const requiredRule = (v: string) => !!v || t('workspaceSettings.required_field')
const emailRule = (v: string) => /.+@.+\..+/.test(v) || t('workspaceSettings.invalid_email')

const showSnackbar = (message: string, color: 'success' | 'error' | 'info' = 'success') => {
  snackbar.value = { show: true, message, color }
}

const goToUpgrade = () => {
  upgradeSnackbar.value = false
  router.push({ name: 'choose-plan', query: { plan: 'BUSINESS_ANNUAL' } })
}

const goToSelectWorkspace = () => {
  router.push({ name: 'select-workspace', query: { redirect: '/settings' } })
}

const resetWorkspaceUiState = () => {
  workspaceForm.value = { workspaceName: '', description: '' }
  createWorkspaceForm.value = { name: '', legalDocument: '', country: 'BR', description: '' }
  workspaceNameForDelete.value = ''
  members.value = []
  invites.value = []
  closeDeleteDialog()
}

const loadWorkspaceDetails = async () => {
  if (!currentWorkspaceId.value) return
  formLoading.value = true
  try {
    const workspaceRes = await WorkspaceService.getDetails(currentWorkspaceId.value)
    const name = workspaceRes?.data?.workspaceName || workspaceRes?.data?.name || ''
    const description = workspaceRes?.data?.description || ''
    workspaceForm.value.workspaceName = name
    workspaceForm.value.description = description
    workspaceNameForDelete.value = name
  } catch (error) {
    showSnackbar(parseApiError(error), 'error')
  } finally {
    formLoading.value = false
  }
}

const loadMembersAndInvites = async () => {
  if (!currentWorkspaceId.value) return
  try {
    const [membersResult, invitesResult] = await Promise.allSettled([
      WorkspaceService.listMembers(currentWorkspaceId.value),
      WorkspaceInviteService.listInvites(currentWorkspaceId.value)
    ])

    if (membersResult.status === 'fulfilled') {
      members.value = membersResult.value?.data || []
    } else {
      members.value = []
    }

    if (invitesResult.status === 'fulfilled') {
      invites.value = invitesResult.value || []
      invitesAvailable.value = true
    } else {
      invites.value = []
      invitesAvailable.value = false
    }
  } catch (error) {
    showSnackbar(parseApiError(error), 'error')
  }
}

const stopMembersAndInvitesPolling = () => {
  if (membersAndInvitesPollingTimer) {
    window.clearInterval(membersAndInvitesPollingTimer)
    membersAndInvitesPollingTimer = null
  }
}

const startMembersAndInvitesPolling = () => {
  stopMembersAndInvitesPolling()
  if (!currentWorkspaceId.value || !canManageWorkspace.value) return
  membersAndInvitesPollingTimer = window.setInterval(async () => {
    if (!currentWorkspaceId.value || !canManageWorkspace.value) {
      stopMembersAndInvitesPolling()
      return
    }
    await loadMembersAndInvites()
  }, 8000)
}

const createWorkspace = async () => {
  if (creatingWorkspace.value) return

  const form = createWorkspaceFormRef.value as any
  if (form) {
    const result = await form.validate()
    const valid = typeof result === 'boolean' ? result : result?.valid
    if (!valid) return
  }

  creatingWorkspace.value = true
  try {
    const correlationId = getOrCreateCorrelationId('workspaceCorrelationId')
    const messageKey = `settings.createWorkspace.messageId:${createWorkspaceForm.value.name}:${createWorkspaceForm.value.country}`
    let messageId = sessionStorage.getItem(messageKey)
    if (!messageId) {
      messageId = createMessageId()
      sessionStorage.setItem(messageKey, messageId)
    }

    const payload = {
      name: createWorkspaceForm.value.name.trim(),
      description: createWorkspaceForm.value.description?.trim() || '',
      legalDocument: createWorkspaceForm.value.legalDocument.trim(),
      country: createWorkspaceForm.value.country,
      messageId
    }

    const result = await WorkspaceService.create(payload as any, correlationId)
    const createdWorkspace = result?.createdWorkspace
    const workspaceId = createdWorkspace?.workspaceId ?? createdWorkspace?.id
    if (!workspaceId) {
      throw new Error('Resposta de criação sem workspaceId')
    }

    try {
      const workspacesRes = await WorkspaceService.getAll()
      const workspaces = Array.isArray(workspacesRes?.data) ? [...workspacesRes.data] : []
      const createdWorkspaceId = String(workspaceId)
      const createdWorkspaceIndex = workspaces.findIndex((workspace: any) => String(workspace?.workspaceId) === createdWorkspaceId)
      if (createdWorkspaceIndex === -1) {
        workspaces.push({
          workspaceId: createdWorkspaceId,
          workspaceName: createdWorkspace?.workspaceName || payload.name,
          role: createdWorkspace?.role || 'ROLE_OWNER'
        })
      } else {
        const candidate = workspaces[createdWorkspaceIndex] || {}
        workspaces[createdWorkspaceIndex] = {
          ...candidate,
          workspaceId: createdWorkspaceId,
          workspaceName: candidate.workspaceName || createdWorkspace?.workspaceName || payload.name,
          role: candidate.role || createdWorkspace?.role || 'ROLE_OWNER'
        }
      }
      userStore.setWorkspaces(workspaces)
      await userStore.hydrateWorkspaceDetailsFromBudget(
        workspaces.map((workspace: any) => String(workspace.workspaceId)).filter(Boolean)
      )
    } catch {
      // best effort: seleção ainda segue com fallback local
    }

    await userStore.selectWorkspace(String(workspaceId))

    sessionStorage.removeItem(messageKey)
    createWorkspaceForm.value = {
      name: '',
      legalDocument: '',
      country: 'BR',
      description: ''
    }
    showSnackbar(t('workspaceSettings.success_workspace_created'))
  } catch (error) {
    showSnackbar(parseApiError(error), 'error')
    const limitType = getFreePlanLimitType(error)
    if (limitType === 'workspace') {
      upgradeMessage.value = t('workspaceSettings.upgrade_limit_workspace')
      upgradeSnackbar.value = true
    }
  } finally {
    creatingWorkspace.value = false
  }
}

const updateWorkspace = async () => {
  if (!currentWorkspaceId.value) return
  const form = workspaceFormRef.value as any
  if (form) {
    const result = await form.validate()
    const valid = typeof result === 'boolean' ? result : result?.valid
    if (!valid) return
  }
  savingWorkspace.value = true
  try {
    await WorkspaceService.update(currentWorkspaceId.value, {
      workspaceName: workspaceForm.value.workspaceName,
      description: workspaceForm.value.description
    })

    workspaceNameForDelete.value = workspaceForm.value.workspaceName
    userStore.updateWorkspaceName(currentWorkspaceId.value, workspaceForm.value.workspaceName)
    showSnackbar(t('workspaceSettings.success_workspace_updated'))
  } catch (error) {
    showSnackbar(parseApiError(error), 'error')
  } finally {
    savingWorkspace.value = false
  }
}

const sendInvite = async () => {
  if (!currentWorkspaceId.value) return
  if (!invitesAvailable.value) {
    showSnackbar(t('workspaceSettings.invites_unavailable'), 'info')
    return
  }
  const form = inviteFormRef.value as any
  if (form) {
    const result = await form.validate()
    const valid = typeof result === 'boolean' ? result : result?.valid
    if (!valid) return
  }
  inviteLoading.value = true
  try {
    const inviteEmail = inviteForm.value.email
    const response = await WorkspaceInviteService.inviteUser(currentWorkspaceId.value, inviteEmail, inviteForm.value.role)
    inviteForm.value.email = ''
    inviteForm.value.role = 'ROLE_MEMBER'
    await nextTick()
    ;(inviteFormRef.value as any)?.resetValidation?.()
    await loadInvites()
    const backendMessage = response?.data?.message
    showSnackbar(backendMessage || `${t('workspaceSettings.success_invite_sent_generic')} (${inviteEmail})`)
  } catch (error) {
    showSnackbar(parseApiError(error), 'error')
    const limitType = getFreePlanLimitType(error)
    if (limitType === 'member') {
      upgradeMessage.value = t('workspaceSettings.upgrade_limit_member')
      upgradeSnackbar.value = true
    }
  } finally {
    inviteLoading.value = false
  }
}

const loadInvites = async () => {
  if (!currentWorkspaceId.value) return
  if (!invitesAvailable.value) return
  try {
    invites.value = await WorkspaceInviteService.listInvites(currentWorkspaceId.value)
  } catch (error) {
    invitesAvailable.value = false
    invites.value = []
    showSnackbar(t('workspaceSettings.invites_unavailable'), 'info')
  }
}

const cancelInvite = async (inviteId: string) => {
  if (!currentWorkspaceId.value) return
  if (!invitesAvailable.value) {
    showSnackbar(t('workspaceSettings.invites_unavailable'), 'info')
    return
  }
  try {
    await WorkspaceInviteService.cancelInvite(currentWorkspaceId.value, inviteId)
    invites.value = invites.value.filter((invite: any) => String(invite?.id) !== String(inviteId))
    await loadInvites()
    showSnackbar(t('workspaceSettings.success_cancel_invite'), 'info')
  } catch (error) {
    showSnackbar(parseApiError(error), 'error')
  }
}

const closeDeleteDialog = () => {
  deleteDialog.value = false
  deleteConfirm.value = ''
}

const closeLeaveDialog = () => {
  leaveDialog.value = false
}

const deleteWorkspace = async () => {
  if (!currentWorkspaceId.value) return
  if (deleteConfirm.value !== workspaceNameForDelete.value) return
  const deletedWorkspaceId = currentWorkspaceId.value
  deleteLoading.value = true
  try {
    await WorkspaceService.deleteWorkspace(deletedWorkspaceId)

    // Limpa seleção de empresa e força atualização do usuário
    try {
      await userStore.clearWorkspaceSelection()
      // Após limpar, força reload do usuário para garantir que o contexto ativo foi limpo
      await userStore.tryRefreshToken()
      // Alternativa: pode-se chamar um endpoint /users/me para garantir contexto atualizado
    } catch {
      userStore.logout()
      router.push('/login')
      return
    }

    let nextWorkspaces: Array<{ workspaceId?: string; workspaceName?: string; role?: string | null }> = []
    try {
      const workspacesRes = await WorkspaceService.getAll()
      nextWorkspaces = (workspacesRes?.data || []) as Array<{ workspaceId?: string; workspaceName?: string; role?: string | null }>
      userStore.setWorkspaces(nextWorkspaces as any)
    } catch {
      // fallback to local state if refresh fails
      nextWorkspaces = ((userStore.getWorkspaces || []) as any[]).filter((workspace: any) => workspace?.workspaceId !== deletedWorkspaceId)
      userStore.setWorkspaces(nextWorkspaces as any)
    }

    closeDeleteDialog()
    showSnackbar(t('workspaceSettings.success_delete'), 'info')

    const hasOtherWorkspaces = (nextWorkspaces?.length || 0) > 0
    if (!hasOtherWorkspaces) {
      // Se não há mais workspaces, redireciona para onboarding/criação
      userStore.setCurrentWorkspace(null)
      router.push('/create-workspace')
    } else {
      // Se há outros workspaces, força seleção
      router.push('/select-workspace')
    }
  } catch (error) {
    showSnackbar(parseApiError(error), 'error')
  } finally {
    deleteLoading.value = false
  }
}

const leaveWorkspace = async () => {
  if (!currentWorkspaceId.value) return
  const previousWorkspaceId = currentWorkspaceId.value
  leaveLoading.value = true
  try {
    await WorkspaceService.leaveWorkspace(previousWorkspaceId)

    let nextWorkspaces: Array<{ workspaceId?: string; workspaceName?: string; role?: string | null }> = []
    try {
      const workspacesRes = await WorkspaceService.getAll()
      nextWorkspaces = (workspacesRes?.data || []) as Array<{ workspaceId?: string; workspaceName?: string; role?: string | null }>
    } catch {
      nextWorkspaces = ((userStore.getWorkspaces || []) as any[]).filter(
        (workspace: any) => workspace?.workspaceId !== previousWorkspaceId
      )
    }

    userStore.setWorkspaces(nextWorkspaces as any)
    closeLeaveDialog()
    showSnackbar(t('workspaceSettings.success_leave'), 'info')

    if (!nextWorkspaces.length) {
      await userStore.clearWorkspaceSelection()
      await router.replace({ name: 'settings', query: { tab: 'workspace' } })
      return
    }

    if (nextWorkspaces.length === 1) {
      await userStore.selectWorkspace(String(nextWorkspaces[0]?.workspaceId || ''))
      await router.replace({ name: 'settings', query: { tab: 'workspace' } })
      return
    }

    userStore.clearCurrentWorkspace()
    await router.push({ name: 'select-workspace', query: { redirect: '/settings?tab=workspace' } })
  } catch (error) {
    showSnackbar(parseApiError(error), 'error')
  } finally {
    leaveLoading.value = false
  }
}

const getRoleLabel = (role: string) => {
  const normalized = (role || '').toUpperCase()
  if (t(`workspaceSettings.roles.${normalized}`) !== `workspaceSettings.roles.${normalized}`) {
    return t(`workspaceSettings.roles.${normalized}`)
  }
  if (t(`workspaceSettings.roles.${role}`) !== `workspaceSettings.roles.${role}`) {
    return t(`workspaceSettings.roles.${role}`)
  }
  return role
}

watch([currentWorkspaceId, canManageWorkspace], async ([workspaceId, canManage]) => {
  stopMembersAndInvitesPolling()
  resetWorkspaceUiState()
  if (!workspaceId) return

  await loadWorkspaceDetails()
  if (canManage) {
    await loadMembersAndInvites()
    startMembersAndInvitesPolling()
  }
}, { immediate: true })

onUnmounted(() => {
  stopMembersAndInvitesPolling()
})
</script>

<style scoped>
.workspace-settings {
  width: 100%;
}

.modern-card {
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.card-header {
  padding: 20px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.card-title {
  display: flex;
  align-items: center;
  font-weight: 600;
  margin: 0;
}

.card-description {
  margin: 8px 0 0;
  color: #6b7280;
}

.section-title {
  font-weight: 600;
  margin-bottom: 8px;
}

.danger-card {
  border-color: rgba(244, 67, 54, 0.25);
}

.danger-title {
  color: #d32f2f;
}
</style>
