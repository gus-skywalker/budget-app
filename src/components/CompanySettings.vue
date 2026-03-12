<template>
  <div class="company-settings">
    <template v-if="!currentCompanyId">
      <v-row dense>
        <v-col cols="12" md="7" lg="6">
          <v-card class="modern-card">
            <div class="card-header">
              <h3 class="card-title">
                <v-icon color="primary" class="mr-2">mdi-office-building-plus</v-icon>
                {{ $t('companySettings.create_new_company') }}
              </h3>
              <p class="card-description">
                {{ $t('companySettings.create_new_company_desc') }}
              </p>
            </div>
            <v-card-text>
              <v-form ref="createCompanyFormRef" @submit.prevent="createCompany">
                <v-text-field
                  v-model="createCompanyForm.name"
                  :label="$t('companySettings.company_name')"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-office-building"
                  :rules="[requiredRule]"
                  :disabled="creatingCompany"
                  class="mb-4"
                />
                <v-text-field
                  v-model="createCompanyForm.legalDocument"
                  :label="$t('companySettings.legal_document')"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-card-account-details"
                  :rules="[requiredRule]"
                  :disabled="creatingCompany"
                  class="mb-4"
                />
                <v-select
                  v-model="createCompanyForm.country"
                  :items="countryOptions"
                  item-title="label"
                  item-value="value"
                  :label="$t('companySettings.country')"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-earth"
                  :rules="[requiredRule]"
                  :disabled="creatingCompany"
                  class="mb-4"
                />
                <v-textarea
                  v-model="createCompanyForm.description"
                  :label="$t('companySettings.description')"
                  variant="outlined"
                  density="comfortable"
                  auto-grow
                  rows="3"
                  prepend-inner-icon="mdi-text"
                  :disabled="creatingCompany"
                />
                <v-btn
                  type="submit"
                  color="primary"
                  class="mt-4"
                  block
                  :loading="creatingCompany"
                  :disabled="creatingCompany"
                >
                  <v-icon left>mdi-check-circle</v-icon>
                  {{ $t('companySettings.create_company') }}
                </v-btn>
              </v-form>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="5" lg="4">
          <v-alert type="info" variant="tonal" border="start" class="mb-4">
            {{ $t('companySettings.personal_mode_alert') }}
          </v-alert>
          <v-btn
            color="primary"
            variant="tonal"
            block
            @click="goToSelectCompany"
          >
            <v-icon left>mdi-swap-horizontal</v-icon>
            {{ $t('companySettings.select_existing_company') }}
          </v-btn>
        </v-col>
      </v-row>
    </template>

    <template v-else>
      <v-alert
        v-if="!canManageCompany"
        type="warning"
        variant="tonal"
        border="start"
        class="mb-4"
      >
        {{ $t('companySettings.only_admin_alert') }}
      </v-alert>

      <v-row dense>
        <v-col cols="12" md="6">
          <v-card class="modern-card">
            <div class="card-header">
              <h3 class="card-title">
                <v-icon color="primary" class="mr-2">mdi-office-building-cog</v-icon>
                {{ $t('companySettings.company_info') }}
              </h3>
              <p class="card-description">
                {{ $t('companySettings.company_info_desc') }}
              </p>
            </div>
            <v-card-text>
              <v-form ref="companyFormRef" @submit.prevent="updateCompany">
                <v-text-field
                  v-model="companyForm.companyName"
                  :label="$t('companySettings.company_name')"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-office-building"
                  :disabled="formLoading || !canManageCompany"
                  :rules="[requiredRule]"
                  class="mb-4"
                />
                <v-textarea
                  v-model="companyForm.description"
                  :label="$t('companySettings.description')"
                  variant="outlined"
                  density="comfortable"
                  auto-grow
                  rows="3"
                  prepend-inner-icon="mdi-text"
                  :disabled="formLoading || !canManageCompany"
                />
                <v-btn
                  v-if="canManageCompany"
                  type="submit"
                  color="primary"
                  class="mt-4"
                  :loading="savingCompany"
                  :disabled="formLoading"
                  block
                >
                  <v-icon left>mdi-content-save</v-icon>
                  {{ $t('companySettings.save_changes') }}
                </v-btn>
              </v-form>
            </v-card-text>
          </v-card>

          <v-card v-if="canManageCompany" class="modern-card mt-6">
            <div class="card-header">
              <h3 class="card-title">
                <v-icon color="primary" class="mr-2">mdi-account-plus</v-icon>
                {{ $t('companySettings.invite_members') }}
              </h3>
              <p class="card-description">
                {{ $t('companySettings.invite_members_desc') }}
              </p>
            </div>
            <v-card-text>
              <v-form ref="inviteFormRef" @submit.prevent="sendInvite">
                <v-text-field
                  v-model="inviteForm.email"
                  :label="$t('companySettings.invite_email')"
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
                  :label="$t('companySettings.permission')"
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
                  {{ $t('companySettings.send_invite') }}
                </v-btn>
              </v-form>

              <v-divider class="my-4" />

              <div class="section-title">{{ $t('companySettings.pending_invites') }}</div>
              <v-alert
                v-if="!invitesAvailable"
                type="info"
                variant="tonal"
                class="mt-2"
              >
                {{ $t('companySettings.invites_unavailable') }}
              </v-alert>
              <v-alert
                v-else-if="!invites.length"
                type="info"
                variant="tonal"
                class="mt-2"
              >
                {{ $t('companySettings.no_pending_invites') }}
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
          <v-card v-if="canManageCompany" class="modern-card">
            <div class="card-header">
              <h3 class="card-title">
                <v-icon color="primary" class="mr-2">mdi-account-multiple</v-icon>
                {{ $t('companySettings.current_members') }}
              </h3>
              <p class="card-description">
                {{ $t('companySettings.current_members_desc') }}
              </p>
            </div>
            <v-card-text>
              <v-alert
                v-if="!members.length"
                type="info"
                variant="tonal"
              >
                {{ $t('companySettings.no_members') }}
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

          <v-card v-if="canManageCompany" class="modern-card mt-6 danger-card">
            <div class="card-header">
              <h3 class="card-title danger-title">
                <v-icon color="error" class="mr-2">mdi-alert</v-icon>
                {{ $t('companySettings.danger_zone') }}
              </h3>
              <p class="card-description">
                {{ $t('companySettings.danger_zone_desc') }}
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
                {{ $t('companySettings.delete_company') }}
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <v-dialog v-model="deleteDialog" max-width="520">
      <v-card>
        <v-card-title class="text-h6">{{ $t('companySettings.confirm_delete_title') }}</v-card-title>
        <v-card-text>
          <p class="mb-4" v-html="$t('companySettings.confirm_delete_desc', { company: companyNameForDelete })"></p>
          <v-text-field
            v-model="deleteConfirm"
            :label="$t('companySettings.company_name')"
            variant="outlined"
            density="comfortable"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="closeDeleteDialog">{{ $t('companySettings.cancel') }}</v-btn>
          <v-btn
            color="error"
            variant="elevated"
            :disabled="deleteConfirm !== companyNameForDelete"
            :loading="deleteLoading"
            @click="deleteCompany"
          >
            {{ $t('companySettings.confirm') }}
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
          {{ $t('companySettings.view_premium_plans') }}
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import CompanyService from '@/services/CompanyService'
import InviteService from '@/services/InviteService'
import { useUserStore } from '@/plugins/userStore'
import { getFreePlanLimitType, parseApiError } from '@/utils/errorHandler'
import { getOrCreateCorrelationId } from '@/utils/correlation'
import { createMessageId } from '@/utils/messageId'

const userStore = useUserStore()
const router = useRouter()

const currentCompanyId = computed(() => userStore.getCurrentCompanyId)
const canManageCompany = computed(() => userStore.isTenantAdmin)

const companyFormRef = ref()
const companyForm = ref({ companyName: '', description: '' })
const formLoading = ref(false)
const savingCompany = ref(false)
const createCompanyFormRef = ref()
const createCompanyForm = ref({
  name: '',
  legalDocument: '',
  country: 'BR',
  description: ''
})
const creatingCompany = ref(false)

const companyNameForDelete = ref('')

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
  { label: t('companySettings.roles.ROLE_ADMIN'), value: 'ROLE_ADMIN' },
  { label: t('companySettings.roles.ROLE_MEMBER'), value: 'ROLE_MEMBER' },
  { label: t('companySettings.roles.ROLE_VIEWER'), value: 'ROLE_VIEWER' }
]

const countryOptions = [
  { label: t('companySettings.countries.br'), value: 'BR' },
  { label: t('companySettings.countries.us'), value: 'US' },
  { label: t('companySettings.countries.pt'), value: 'PT' },
  { label: t('companySettings.countries.es'), value: 'ES' },
  { label: t('companySettings.countries.fr'), value: 'FR' }
]

const requiredRule = (v: string) => !!v || t('companySettings.required_field')
const emailRule = (v: string) => /.+@.+\..+/.test(v) || t('companySettings.invalid_email')

const showSnackbar = (message: string, color: 'success' | 'error' | 'info' = 'success') => {
  snackbar.value = { show: true, message, color }
}

const goToUpgrade = () => {
  upgradeSnackbar.value = false
  router.push({ name: 'choose-plan', query: { plan: 'BUSINESS_ANNUAL' } })
}

const goToSelectCompany = () => {
  router.push({ name: 'select-company', query: { redirect: '/settings' } })
}

const resetCompanyUiState = () => {
  companyForm.value = { companyName: '', description: '' }
  createCompanyForm.value = { name: '', legalDocument: '', country: 'BR', description: '' }
  companyNameForDelete.value = ''
  members.value = []
  invites.value = []
  closeDeleteDialog()
}

const loadCompanyDetails = async () => {
  if (!currentCompanyId.value) return
  formLoading.value = true
  try {
    const companyRes = await CompanyService.getDetails(currentCompanyId.value)
    const name = companyRes?.data?.companyName || companyRes?.data?.name || ''
    const description = companyRes?.data?.description || ''
    companyForm.value.companyName = name
    companyForm.value.description = description
    companyNameForDelete.value = name
  } catch (error) {
    showSnackbar(parseApiError(error), 'error')
  } finally {
    formLoading.value = false
  }
}

const loadMembersAndInvites = async () => {
  if (!currentCompanyId.value) return
  try {
    const [membersResult, invitesResult] = await Promise.allSettled([
      CompanyService.listMembers(currentCompanyId.value),
      InviteService.listInvites(currentCompanyId.value)
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

const createCompany = async () => {
  const form = createCompanyFormRef.value as any
  if (form) {
    const result = await form.validate()
    const valid = typeof result === 'boolean' ? result : result?.valid
    if (!valid) return
  }

  creatingCompany.value = true
  try {
    const correlationId = getOrCreateCorrelationId('companyCorrelationId')
    const messageKey = `settings.createCompany.messageId:${createCompanyForm.value.name}:${createCompanyForm.value.country}`
    let messageId = sessionStorage.getItem(messageKey)
    if (!messageId) {
      messageId = createMessageId()
      sessionStorage.setItem(messageKey, messageId)
    }

    const payload = {
      name: createCompanyForm.value.name.trim(),
      description: createCompanyForm.value.description?.trim() || '',
      legalDocument: createCompanyForm.value.legalDocument.trim(),
      country: createCompanyForm.value.country,
      messageId
    }

    const result = await CompanyService.create(payload as any, correlationId)
    const createdCompany = result?.createdCompany
    const companyId = createdCompany?.companyId ?? createdCompany?.id
    if (!companyId) {
      throw new Error('Resposta de criação sem companyId')
    }

    await userStore.selectCompany(String(companyId))

    try {
      const companiesRes = await CompanyService.getAll()
      const companies = Array.isArray(companiesRes?.data) ? companiesRes.data : []
      userStore.setCompanies(companies)
      await userStore.hydrateCompanyDetailsFromBudget(
        companies.map((company: any) => String(company.companyId)).filter(Boolean)
      )
    } catch {
      // best effort: tenant já selecionada
    }

    sessionStorage.removeItem(messageKey)
    createCompanyForm.value = {
      name: '',
      legalDocument: '',
      country: 'BR',
      description: ''
    }
    showSnackbar(t('companySettings.success_company_created'))
  } catch (error) {
    showSnackbar(parseApiError(error), 'error')
    const limitType = getFreePlanLimitType(error)
    if (limitType === 'company') {
      upgradeMessage.value = t('companySettings.upgrade_limit_company')
      upgradeSnackbar.value = true
    }
  } finally {
    creatingCompany.value = false
  }
}

const updateCompany = async () => {
  if (!currentCompanyId.value) return
  const form = companyFormRef.value as any
  if (form) {
    const result = await form.validate()
    const valid = typeof result === 'boolean' ? result : result?.valid
    if (!valid) return
  }
  savingCompany.value = true
  try {
    await CompanyService.update(currentCompanyId.value, {
      companyName: companyForm.value.companyName,
      description: companyForm.value.description
    })

    companyNameForDelete.value = companyForm.value.companyName
    userStore.updateCompanyName(currentCompanyId.value, companyForm.value.companyName)
    showSnackbar(t('companySettings.success_company_updated'))
  } catch (error) {
    showSnackbar(parseApiError(error), 'error')
  } finally {
    savingCompany.value = false
  }
}

const sendInvite = async () => {
  if (!currentCompanyId.value) return
  if (!invitesAvailable.value) {
    showSnackbar(t('companySettings.invites_unavailable'), 'info')
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
    await InviteService.inviteUser(currentCompanyId.value, inviteForm.value.email, inviteForm.value.role)
    inviteForm.value.email = ''
    inviteForm.value.role = 'ROLE_MEMBER'
    await loadInvites()
    showSnackbar(t('companySettings.success_invite_sent_generic'))
  } catch (error) {
    showSnackbar(parseApiError(error), 'error')
    const limitType = getFreePlanLimitType(error)
    if (limitType === 'member') {
      upgradeMessage.value = t('companySettings.upgrade_limit_member')
      upgradeSnackbar.value = true
    }
  } finally {
    inviteLoading.value = false
  }
}

const loadInvites = async () => {
  if (!currentCompanyId.value) return
  if (!invitesAvailable.value) return
  try {
    invites.value = await InviteService.listInvites(currentCompanyId.value)
  } catch (error) {
    invitesAvailable.value = false
    invites.value = []
    showSnackbar(t('companySettings.invites_unavailable'), 'info')
  }
}

const cancelInvite = async (inviteId: string) => {
  if (!currentCompanyId.value) return
  if (!invitesAvailable.value) {
    showSnackbar(t('companySettings.invites_unavailable'), 'info')
    return
  }
  try {
    await InviteService.cancelInvite(currentCompanyId.value, inviteId)
    await loadInvites()
    showSnackbar(t('companySettings.success_cancel_invite'), 'info')
  } catch (error) {
    showSnackbar(parseApiError(error), 'error')
  }
}

const closeDeleteDialog = () => {
  deleteDialog.value = false
  deleteConfirm.value = ''
}

const deleteCompany = async () => {
  if (!currentCompanyId.value) return
  if (deleteConfirm.value !== companyNameForDelete.value) return
  const deletedCompanyId = currentCompanyId.value
  deleteLoading.value = true
  try {
    await CompanyService.deleteCompany(deletedCompanyId)

    // Limpa seleção de empresa e força atualização do usuário
    try {
      await userStore.clearCompanySelection()
      // Após limpar, força reload do usuário para garantir que companyId foi limpo
      await userStore.tryRefreshToken()
      // Alternativa: pode-se chamar um endpoint /users/me para garantir contexto atualizado
    } catch {
      userStore.logout()
      router.push('/login')
      return
    }

    let nextCompanies: Array<{ companyId: string; companyName?: string; role?: string | null }> = []
    try {
      const companiesRes = await CompanyService.getAll()
      nextCompanies = (companiesRes?.data || []) as Array<{ companyId: string; companyName?: string; role?: string | null }>
      userStore.setCompanies(nextCompanies)
    } catch {
      // fallback to local state if refresh fails
      nextCompanies = ((userStore.getCompanies || []) as any[]).filter((c: any) => c?.companyId !== deletedCompanyId)
      userStore.setCompanies(nextCompanies)
    }

    closeDeleteDialog()
    showSnackbar(t('companySettings.success_delete'), 'info')

    const hasOtherCompanies = (nextCompanies?.length || 0) > 0
    // Força reload do contexto do usuário para garantir que companyId não está mais presente
    if (!hasOtherCompanies) {
      // Se não há mais empresas, redireciona para onboarding/criação
      userStore.setCurrentCompany(null)
      router.push('/create-company')
    } else {
      // Se há outras empresas, força seleção
      router.push('/select-company')
    }
  } catch (error) {
    showSnackbar(parseApiError(error), 'error')
  } finally {
    deleteLoading.value = false
  }
}

const getRoleLabel = (role: string) => {
  const normalized = (role || '').toUpperCase()
  if (t(`companySettings.roles.${normalized}`) !== `companySettings.roles.${normalized}`) {
    return t(`companySettings.roles.${normalized}`)
  }
  if (t(`companySettings.roles.${role}`) !== `companySettings.roles.${role}`) {
    return t(`companySettings.roles.${role}`)
  }
  return role
}

watch([currentCompanyId, canManageCompany], async ([companyId, canManage]) => {
  resetCompanyUiState()
  if (!companyId) return

  await loadCompanyDetails()
  if (canManage) {
    await loadMembersAndInvites()
  }
}, { immediate: true })
</script>

<style scoped>
.company-settings {
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
