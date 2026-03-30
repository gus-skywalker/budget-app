<template>
  <div class="workspace-settings">
    <template v-if="!currentWorkspaceId">
      <v-row dense>
        <v-col cols="12" md="7" lg="6">
          <v-card class="modern-card">
            <div class="card-header">
              <h3 class="card-title">
                <v-icon color="primary" class="mr-2">mdi-office-building-plus</v-icon>
                {{ $t('workspaceSettings.create_new_company') }}
              </h3>
              <p class="card-description">
                {{ $t('workspaceSettings.create_new_company_desc') }}
              </p>
            </div>
            <v-card-text>
              <v-form ref="createWorkspaceFormRef" @submit.prevent="createWorkspace">
                <v-text-field
                  v-model="createWorkspaceForm.name"
                  :label="$t('workspaceSettings.company_name')"
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
                  {{ $t('workspaceSettings.create_company') }}
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
            {{ $t('workspaceSettings.select_existing_company') }}
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
                {{ $t('workspaceSettings.company_info') }}
              </h3>
              <p class="card-description">
                {{ $t('workspaceSettings.company_info_desc') }}
              </p>
            </div>
            <v-card-text>
              <v-form ref="workspaceFormRef" @submit.prevent="updateWorkspace">
                <v-text-field
                  v-model="workspaceForm.companyName"
                  :label="$t('workspaceSettings.company_name')"
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
                {{ $t('workspaceSettings.delete_company') }}
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
          <p class="mb-4" v-html="$t('workspaceSettings.confirm_delete_desc', { company: workspaceNameForDelete })"></p>
          <v-text-field
            v-model="deleteConfirm"
            :label="$t('workspaceSettings.company_name')"
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
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import WorkspaceService from '@/services/WorkspaceService'
import WorkspaceInviteService from '@/services/WorkspaceInviteService'
import { useUserStore } from '@/plugins/userStore'
import { getFreePlanLimitType, parseApiError } from '@/utils/errorHandler'
import { getOrCreateCorrelationId } from '@/utils/correlation'
import { createMessageId } from '@/utils/messageId'

const { t } = useI18n()
const userStore = useUserStore()
const router = useRouter()

const currentWorkspaceId = computed(() => userStore.getCurrentWorkspaceId)
const canManageWorkspace = computed(() => userStore.isTenantAdmin)

const workspaceFormRef = ref()
const workspaceForm = ref({ companyName: '', description: '' })
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

const deleteDialog = ref(false)
const deleteConfirm = ref('')
const deleteLoading = ref(false)

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
  workspaceForm.value = { companyName: '', description: '' }
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
    const workspaceRes = await WorkspaceService.getWorkspaceDetails(currentWorkspaceId.value)
    const name = workspaceRes?.data?.companyName || workspaceRes?.data?.name || ''
    const description = workspaceRes?.data?.description || ''
    workspaceForm.value.companyName = name
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
      WorkspaceService.listWorkspaceMembers(currentWorkspaceId.value),
      WorkspaceInviteService.listWorkspaceInvites(currentWorkspaceId.value)
    ])

    members.value = membersResult.status === 'fulfilled' ? (membersResult.value?.data || []) : []

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

const createWorkspace = async () => {
  const form = createWorkspaceFormRef.value as any
  if (form) {
    const result = await form.validate()
    const valid = typeof result === 'boolean' ? result : result?.valid
    if (!valid) return
  }

  creatingWorkspace.value = true
  try {
    const correlationId = getOrCreateCorrelationId('companyCorrelationId')
    const messageKey = `settings.createCompany.messageId:${createWorkspaceForm.value.name}:${createWorkspaceForm.value.country}`
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
    const createdWorkspace = result?.createdCompany
    const workspaceId = createdWorkspace?.companyId ?? createdWorkspace?.id
    if (!workspaceId) {
      throw new Error('Resposta de criação sem companyId')
    }

    await userStore.selectWorkspace(String(workspaceId))

    try {
      const companiesRes = await WorkspaceService.getAll()
      const companies = Array.isArray(companiesRes?.data) ? companiesRes.data : []
      userStore.setCompanies(companies)
      await userStore.hydrateCompanyDetailsFromBudget(
        companies.map((workspace: any) => String(workspace.companyId)).filter(Boolean)
      )
    } catch {
      // best effort
    }

    sessionStorage.removeItem(messageKey)
    createWorkspaceForm.value = {
      name: '',
      legalDocument: '',
      country: 'BR',
      description: ''
    }
    showSnackbar(t('workspaceSettings.success_company_created'))
  } catch (error) {
    showSnackbar(parseApiError(error), 'error')
    const limitType = getFreePlanLimitType(error)
    if (limitType === 'company') {
      upgradeMessage.value = t('workspaceSettings.upgrade_limit_company')
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
    await WorkspaceService.updateWorkspace(currentWorkspaceId.value, {
      companyName: workspaceForm.value.companyName,
      description: workspaceForm.value.description
    })

    workspaceNameForDelete.value = workspaceForm.value.companyName
    userStore.updateWorkspaceName(currentWorkspaceId.value, workspaceForm.value.companyName)
    showSnackbar(t('workspaceSettings.success_company_updated'))
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
    await WorkspaceInviteService.inviteWorkspaceUser(currentWorkspaceId.value, inviteForm.value.email, inviteForm.value.role)
    inviteForm.value.email = ''
    inviteForm.value.role = 'ROLE_MEMBER'
    await loadInvites()
    showSnackbar(t('workspaceSettings.success_invite_sent_generic'))
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
  if (!currentWorkspaceId.value || !invitesAvailable.value) return
  try {
    invites.value = await WorkspaceInviteService.listWorkspaceInvites(currentWorkspaceId.value)
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
    await WorkspaceInviteService.cancelWorkspaceInvite(currentWorkspaceId.value, inviteId)
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

const deleteWorkspace = async () => {
  if (!currentWorkspaceId.value) return
  if (deleteConfirm.value !== workspaceNameForDelete.value) return
  const deletedWorkspaceId = currentWorkspaceId.value
  deleteLoading.value = true
  try {
    await WorkspaceService.deleteWorkspace(deletedWorkspaceId)

    try {
      await userStore.clearWorkspaceSelection()
      await userStore.tryRefreshToken()
    } catch {
      userStore.logout()
      router.push('/login')
      return
    }

    let nextCompanies: Array<{ companyId: string; companyName?: string; role?: string | null }> = []
    try {
      const companiesRes = await WorkspaceService.getAll()
      nextCompanies = (companiesRes?.data || []) as Array<{ companyId: string; companyName?: string; role?: string | null }>
      userStore.setCompanies(nextCompanies)
    } catch {
      nextCompanies = ((userStore.getCompanies || []) as any[]).filter((workspace: any) => workspace?.companyId !== deletedWorkspaceId)
      userStore.setCompanies(nextCompanies)
    }

    closeDeleteDialog()
    showSnackbar(t('workspaceSettings.success_delete'), 'info')

    const hasOtherCompanies = (nextCompanies?.length || 0) > 0
    if (!hasOtherCompanies) {
      userStore.clearCurrentWorkspace()
      router.push('/create-workspace')
    } else {
      router.push('/select-workspace')
    }
  } catch (error) {
    showSnackbar(parseApiError(error), 'error')
  } finally {
    deleteLoading.value = false
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
  resetWorkspaceUiState()
  if (!workspaceId) return

  await loadWorkspaceDetails()
  if (canManage) {
    await loadMembersAndInvites()
  }
}, { immediate: true })
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
