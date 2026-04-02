<template>
  <div class="create-workspace-container">
    <v-container>
      <v-row justify="center">
        <v-col cols="12" sm="8" md="6">
          <v-card class="elevation-12 pa-6">
            <v-card-title class="headline text-center mb-6">
              <v-icon large color="primary" class="mr-2">mdi-office-building</v-icon>
              {{ t('createWorkspace.title') }}
            </v-card-title>

            <v-card-text>
              <p class="text-body-1 mb-6 text-center">
                {{ t('createWorkspace.description') }}
              </p>

              <v-form ref="form" v-model="valid" @submit.prevent="createWorkspace">
                <v-text-field
                  v-model="workspaceName"
                  :rules="workspaceNameRules"
                  :label="t('createWorkspace.workspace_name')"
                  :placeholder="t('createWorkspace.workspace_placeholder')"
                  outlined
                  required
                  :loading="loading"
                  prepend-inner-icon="mdi-domain"
                />


                <v-select
                  v-model="country"
                  :items="countryOptions"
                  :rules="countryRules"
                  :label="t('createWorkspace.country_label')"
                  item-title="label"
                  item-value="code"
                  outlined
                  required
                  class="mb-2"
                  prepend-inner-icon="mdi-earth"
                />



                <v-text-field
                  v-model="legalDocument"
                  :rules="legalDocumentRules"
                  :label="legalDocumentLabel"
                  :placeholder="legalDocumentPlaceholder"
                  outlined
                  required
                  prepend-inner-icon="mdi-file-document-outline"
                  class="mb-2"
                />

                <v-textarea
                  v-model="description"
                  :label="t('createWorkspace.description_optional')"
                  :placeholder="t('createWorkspace.description_placeholder')"
                  outlined
                  rows="3"
                  counter="200"
                  :rules="descriptionRules"
                />
              </v-form>
            </v-card-text>

            <v-card-actions class="justify-center">
              <v-btn
                color="primary"
                size="large"
                :disabled="!valid"
                :loading="loading"
                @click="createWorkspace"
                class="px-8"
              >
                <v-icon left>mdi-plus</v-icon>
                {{ t('createWorkspace.create_button') }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Success/Error Snackbar -->
    <v-snackbar
      v-model="snackbar"
      :color="snackbarColor"
      :timeout="4000"
      location="top"
    >
      {{ snackbarMessage }}
    </v-snackbar>

    <v-snackbar
      v-model="upgradeSnackbar"
      color="warning"
      :timeout="8000"
      location="top"
    >
      {{ upgradeMessage }}
      <template #actions>
        <v-btn variant="text" color="white" @click="goToUpgrade">
          {{ t('createWorkspace.view_premium_plans') }}
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { createMessageId } from '@/utils/messageId'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/plugins/userStore'
import WorkspaceService from '@/services/WorkspaceService'
import OnboardingOrchestrator from '@/services/OnboardingOrchestrator'
import { getOrCreateCorrelationId } from '@/utils/correlation'
import { getFreePlanLimitType, parseApiError } from '@/utils/errorHandler'

const { t } = useI18n()
// Lista simplificada de países (pode ser expandida ou internacionalizada)
const countryOptions = computed(() => [
  { code: 'BR', label: t('createWorkspace.countries.br') },
  { code: 'US', label: t('createWorkspace.countries.us') },
  { code: 'AR', label: t('createWorkspace.countries.ar') },
  { code: 'PT', label: t('createWorkspace.countries.pt') },
  { code: 'ES', label: t('createWorkspace.countries.es') },
  { code: 'MX', label: t('createWorkspace.countries.mx') },
  { code: 'DE', label: t('createWorkspace.countries.de') },
  { code: 'FR', label: t('createWorkspace.countries.fr') },
  { code: 'CL', label: t('createWorkspace.countries.cl') },
  { code: 'CO', label: t('createWorkspace.countries.co') },
  { code: 'PE', label: t('createWorkspace.countries.pe') },
  { code: 'UK', label: t('createWorkspace.countries.uk') },
  { code: 'IT', label: t('createWorkspace.countries.it') },
  { code: 'CA', label: t('createWorkspace.countries.ca') },
  { code: 'OTHER', label: t('createWorkspace.countries.other') }
])

const country = ref('BR')

const countryRules = [
  (v: string) => !!v || t('createWorkspace.country_required')
]

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const redirectTarget = computed(() =>
  OnboardingOrchestrator.resolveOnboardingTargetPath({
    redirect: route.query.redirect,
    plan: route.query.plan,
    defaultRedirect: '/dashboard'
  })
)

const form = ref<any>(null)
const valid = ref(false)
const loading = ref(false)
const workspaceName = ref('')
const description = ref('')
const legalDocument = ref('')

// Snackbar state
const snackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('success')
const upgradeSnackbar = ref(false)
const upgradeMessage = ref('')


// Validation rules
const workspaceNameRules = [
  (v: string) => !!v || t('createWorkspace.workspace_name_required'),
  (v: string) => (v && v.length >= 2) || t('createWorkspace.workspace_name_min'),
  (v: string) => (v && v.length <= 100) || t('createWorkspace.workspace_name_max')
]


const legalDocumentLabel = computed(() => {
  switch (country.value) {
    case 'BR': return 'CNPJ';
    case 'US': return 'EIN';
    case 'AR': return 'CUIT';
    case 'PT': return 'NIF';
    case 'ES': return 'NIF';
    case 'MX': return 'RFC';
    case 'DE': return 'USt-IdNr (VAT)';
    case 'FR': return 'TVA (VAT)';
    case 'CL': return 'RUT';
    case 'CO': return 'NIT';
    case 'PE': return 'RUC';
    case 'UK': return 'VAT';
    case 'IT': return 'VAT';
    case 'CA': return 'BN';
    default: return t('createWorkspace.tax_id_generic');
  }
})

const legalDocumentPlaceholder = computed(() => {
  switch (country.value) {
    case 'BR': return 'Digite o CNPJ (14 dígitos)';
    case 'US': return 'Digite o EIN (9 dígitos)';
    case 'AR': return 'Digite o CUIT';
    case 'PT': return 'Digite o NIF';
    case 'ES': return 'Digite o NIF';
    case 'MX': return 'Digite o RFC';
    case 'DE': return 'Digite o VAT';
    case 'FR': return 'Digite o VAT';
    case 'CL': return 'Digite o RUT';
    case 'CO': return 'Digite o NIT';
    case 'PE': return 'Digite o RUC';
    case 'UK': return 'Digite o VAT';
    case 'IT': return 'Digite o VAT';
    case 'CA': return 'Digite o BN';
    default: return t('createWorkspace.tax_id_placeholder_generic');
  }
})

const legalDocumentRules = [
  (v: string) => !!v || t('createWorkspace.legal_document_required', { label: legalDocumentLabel.value }),
  (v: string) => {
    switch (country.value) {
      case 'BR':
        return /^\d{14}$/.test(v) || t('createWorkspace.legal_document_cnpj');
      case 'US':
        return /^\d{9}$/.test(v) || t('createWorkspace.legal_document_ein');
      case 'AR':
        return /^\d{11}$/.test(v) || t('createWorkspace.legal_document_cuit');
      case 'PT':
      case 'ES':
        return /^\d{9}$/.test(v) || t('createWorkspace.legal_document_nif');
      case 'MX':
        return /^[A-Z0-9]{12,13}$/.test(v) || t('createWorkspace.legal_document_rfc');
      case 'DE':
      case 'FR':
      case 'UK':
      case 'IT':
        return v.length >= 8 && v.length <= 15 || t('createWorkspace.legal_document_vat');
      case 'CL':
        return /^\d{7,8}-[\dkK]$/.test(v) || t('createWorkspace.legal_document_rut');
      case 'CO':
        return /^\d{9,10}$/.test(v) || t('createWorkspace.legal_document_nit');
      case 'PE':
        return /^\d{11}$/.test(v) || t('createWorkspace.legal_document_ruc');
      case 'CA':
        return /^\d{9}$/.test(v) || t('createWorkspace.legal_document_bn');
      default:
        return v.length >= 4 || t('createWorkspace.legal_document_invalid');
    }
  }
]

const descriptionRules = [
  (v: string) => !v || v.length <= 200 || t('createWorkspace.description_max')
]

const showSnackbar = (message: string, color: string = 'success') => {
  snackbarMessage.value = message
  snackbarColor.value = color
  snackbar.value = true
}

const goToUpgrade = () => {
  upgradeSnackbar.value = false
  router.push({ name: 'choose-plan', query: { plan: 'BUSINESS_ANNUAL' } })
}
const createWorkspace = async () => {
  if (!form.value?.validate()) return

  try {
    loading.value = true

    // Gera correlationId para rastreabilidade cross-service
    const correlationId = getOrCreateCorrelationId('workspaceCorrelationId')

    const messageKey = `createWorkspace.messageId:${workspaceName.value}:${country.value}`
    let messageId = sessionStorage.getItem(messageKey)
    if (!messageId) {
      messageId = createMessageId()
      sessionStorage.setItem(messageKey, messageId)
    }
    const payload = {
      name: workspaceName.value,
      description: description.value,
      legalDocument: legalDocument.value,
      country: country.value,
      messageId
    }

    // 1) Create workspace in budget-api
    const result = await WorkspaceService.create(payload, correlationId)

    const createdWorkspace = result?.createdWorkspace
    const workspaceId = createdWorkspace?.workspaceId ?? createdWorkspace?.id
    if (!workspaceId) {
      throw new Error('Resposta de criação sem workspaceId')
    }

    // 2) Select tenant in auth-api (with retry/fallback handled by WorkspaceService.selectWorkspace)
    try {
      await userStore.selectWorkspace(String(workspaceId))
    } catch (selectError) {
      console.warn('Workspace criado, mas seleção automática falhou. Redirecionando para select-workspace.', selectError)
      showSnackbar(t('createWorkspace.created_select_workspace'), 'warning')
      sessionStorage.removeItem(messageKey)
      setTimeout(() => {
        router.push({ name: 'select-workspace', query: { redirect: redirectTarget.value } })
      }, 1200)
      return
    }

    // 3) Refresh workspace list in store immediately
    try {
      const workspacesRes = await WorkspaceService.getAll()
      const workspaces = Array.isArray(workspacesRes?.data) ? workspacesRes.data : []
      if (workspaces.length) {
        userStore.setWorkspaces(workspaces)
        await userStore.hydrateWorkspaceDetailsFromBudget(workspaces.map((workspace: any) => String(workspace.workspaceId)).filter(Boolean))
      }
    } catch (e) {
      console.warn('Não foi possível atualizar lista de workspaces imediatamente.', e)
    }

    showSnackbar(t('createWorkspace.created_success'), 'success')
    // Limpa o messageId da sessão após sucesso
    sessionStorage.removeItem(messageKey)

    // Redirect to dashboard
    setTimeout(() => {
      router.push({ path: redirectTarget.value })
    }, 1500)

  } catch (error) {
    console.error('Error creating workspace:', error)
    const errorMessage = parseApiError(error)
    showSnackbar(errorMessage, 'error')
    const limitType = getFreePlanLimitType(error)
    if (limitType === 'workspace') {
      upgradeMessage.value = t('createWorkspace.upgrade_limit_workspace')
      upgradeSnackbar.value = true
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.create-workspace-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

:deep(.v-card) {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

.headline {
  color: #2c3e50;
  font-weight: 600;
}
</style>
