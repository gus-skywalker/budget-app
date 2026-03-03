<template>
  <div class="company-settings">
    <v-alert
      v-if="!currentCompanyId"
      type="info"
      variant="tonal"
      border="start"
      class="mb-4"
    >
      Você ainda não selecionou uma empresa. Use o menu lateral para criar ou escolher uma.
    </v-alert>

    <template v-else>
      <v-alert
        v-if="!canManageCompany"
        type="warning"
        variant="tonal"
        border="start"
        class="mb-4"
      >
        Apenas administradores podem alterar dados da empresa, convidar membros ou excluir a organização.
      </v-alert>

      <v-row dense>
        <v-col cols="12" md="6">
          <v-card class="modern-card">
            <div class="card-header">
              <h3 class="card-title">
                <v-icon color="primary" class="mr-2">mdi-office-building-cog</v-icon>
                Informações da Empresa
              </h3>
              <p class="card-description">
                Atualize nome e descrição que serão exibidos para todos os membros.
              </p>
            </div>
            <v-card-text>
              <v-form ref="companyFormRef" @submit.prevent="updateCompany">
                <v-text-field
                  v-model="companyForm.companyName"
                  label="Nome da empresa"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-office-building"
                  :disabled="formLoading || !canManageCompany"
                  :rules="[requiredRule]"
                  class="mb-4"
                />
                <v-textarea
                  v-model="companyForm.description"
                  label="Descrição"
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
                  Salvar alterações
                </v-btn>
              </v-form>
            </v-card-text>
          </v-card>

          <v-card v-if="canManageCompany" class="modern-card mt-6">
            <div class="card-header">
              <h3 class="card-title">
                <v-icon color="primary" class="mr-2">mdi-account-plus</v-icon>
                Convidar membros
              </h3>
              <p class="card-description">
                Envie convites por e-mail para adicionar novos usuários com a role adequada.
              </p>
            </div>
            <v-card-text>
              <v-form ref="inviteFormRef" @submit.prevent="sendInvite">
                <v-text-field
                  v-model="inviteForm.email"
                  label="E-mail do convidado"
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
                  label="Permissão"
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
                  Enviar convite
                </v-btn>
              </v-form>

              <v-divider class="my-4" />

              <div class="section-title">Convites pendentes</div>
              <v-alert
                v-if="!invitesAvailable"
                type="info"
                variant="tonal"
                class="mt-2"
              >
                Convites indisponíveis no momento.
              </v-alert>
              <v-alert
                v-else-if="!invites.length"
                type="info"
                variant="tonal"
                class="mt-2"
              >
                Nenhum convite pendente.
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
                Membros atuais
              </h3>
              <p class="card-description">
                Lista de usuários associados à empresa e suas permissões.
              </p>
            </div>
            <v-card-text>
              <v-alert
                v-if="!members.length"
                type="info"
                variant="tonal"
              >
                Nenhum membro encontrado.
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
                Zona de perigo
              </h3>
              <p class="card-description">
                Excluir a empresa remove todas as informações associadas. Esta ação não pode ser desfeita.
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
                Excluir empresa
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <v-dialog v-model="deleteDialog" max-width="520">
      <v-card>
        <v-card-title class="text-h6">Confirmar exclusão</v-card-title>
        <v-card-text>
          <p class="mb-4">
            Tem certeza? Digite <strong>{{ companyNameForDelete }}</strong> para confirmar.
          </p>
          <v-text-field
            v-model="deleteConfirm"
            label="Nome da empresa"
            variant="outlined"
            density="comfortable"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="closeDeleteDialog">Cancelar</v-btn>
          <v-btn
            color="error"
            variant="elevated"
            :disabled="deleteConfirm !== companyNameForDelete"
            :loading="deleteLoading"
            @click="deleteCompany"
          >
            Excluir
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
          Ver planos Premium
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import CompanyService from '@/services/CompanyService'
import InviteService from '@/services/InviteService'
import { useUserStore } from '@/plugins/userStore'
import { getFreePlanLimitType, parseApiError } from '@/utils/errorHandler'

const userStore = useUserStore()
const router = useRouter()

const currentCompanyId = computed(() => userStore.getCurrentCompanyId)
const canManageCompany = computed(() => userStore.isTenantAdmin)

const companyFormRef = ref()
const companyForm = ref({ companyName: '', description: '' })
const formLoading = ref(false)
const savingCompany = ref(false)

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
  { label: 'Administrador', value: 'ROLE_ADMIN' },
  { label: 'Membro (edição)', value: 'ROLE_MEMBER' },
  { label: 'Somente leitura', value: 'ROLE_VIEWER' }
]

const requiredRule = (v: string) => !!v || 'Campo obrigatório'
const emailRule = (v: string) => /.+@.+\..+/.test(v) || 'E-mail inválido'

const showSnackbar = (message: string, color: 'success' | 'error' | 'info' = 'success') => {
  snackbar.value = { show: true, message, color }
}

const goToUpgrade = () => {
  upgradeSnackbar.value = false
  router.push({ name: 'choose-plan', query: { plan: 'BUSINESS_ANNUAL' } })
}

const resetCompanyUiState = () => {
  companyForm.value = { companyName: '', description: '' }
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
    const name = companyRes?.data?.companyName || ''
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
    showSnackbar('Informações atualizadas')
  } catch (error) {
    showSnackbar(parseApiError(error), 'error')
  } finally {
    savingCompany.value = false
  }
}

const sendInvite = async () => {
  if (!currentCompanyId.value) return
  if (!invitesAvailable.value) {
    showSnackbar('Convites indisponíveis no momento', 'info')
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
    showSnackbar('Convite enviado')
  } catch (error) {
    showSnackbar(parseApiError(error), 'error')
    const limitType = getFreePlanLimitType(error)
    if (limitType === 'member') {
      upgradeMessage.value = 'Você atingiu o limite do plano gratuito para membros.'
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
    showSnackbar('Convites indisponíveis no momento', 'info')
  }
}

const cancelInvite = async (inviteId: string) => {
  if (!currentCompanyId.value) return
  if (!invitesAvailable.value) {
    showSnackbar('Convites indisponíveis no momento', 'info')
    return
  }
  try {
    await InviteService.cancelInvite(currentCompanyId.value, inviteId)
    await loadInvites()
    showSnackbar('Convite cancelado', 'info')
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

    try {
      await userStore.clearCompanySelection()
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
    showSnackbar('Empresa excluída', 'info')

    const hasOtherCompanies = (nextCompanies?.length || 0) > 0
    router.push(hasOtherCompanies ? '/select-company' : '/dashboard')
  } catch (error) {
    showSnackbar(parseApiError(error), 'error')
  } finally {
    deleteLoading.value = false
  }
}

const getRoleLabel = (role: string) => {
  const normalized = (role || '').toUpperCase()
  const labels: Record<string, string> = {
    ROLE_ADMIN: 'Administrador',
    ROLE_OWNER: 'Proprietário',
    ROLE_MEMBER: 'Colaborador',
    ROLE_VIEWER: 'Visualizador',
    ROLE_USER: 'Usuário',
    ROLE_CLIENT: 'Gestor',
    OAUTH2_USER: 'Usuário OAuth2'
  }
  if (labels[normalized]) {
    return labels[normalized]
  }
  // Retrocompatibilidade com dados antigos
  const legacyLabels: Record<string, string> = {
    admin: 'Administrador',
    member: 'Usuário',
    viewer: 'Visualizador',
    user: 'Usuário'
  }
  return legacyLabels[role] || role
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
