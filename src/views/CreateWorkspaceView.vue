<template>
  <div id="create-workspace-page">
    <section class="workspace-hero">
      <div class="shell hero-grid">
        <div class="hero-copy">
          <span class="eyebrow">{{ t('createWorkspace.workspace_first_badge') }}</span>
          <h1>{{ t('createWorkspace.title') }}</h1>
          <p class="hero-subtitle">{{ t('createWorkspace.description') }}</p>

          <div class="hero-notes">
            <article class="note-card">
              <div class="icon-chip icon-chip-contrast">
                <v-icon size="20">mdi-rocket-launch-outline</v-icon>
              </div>
              <div>
                <strong>{{ t('createWorkspace.workspace_first_note_title') }}</strong>
                <p>{{ t('createWorkspace.workspace_first_note_body') }}</p>
              </div>
            </article>

            <article class="note-card">
              <div class="icon-chip icon-chip-warm">
                <v-icon size="20">mdi-file-document-outline</v-icon>
              </div>
              <div>
                <strong>{{ legalDocumentLabel }}</strong>
                <p>{{ t('createWorkspace.legal_document_optional_hint') }}</p>
              </div>
            </article>

            <v-alert
              v-if="reachedWorkspaceLimit"
              type="warning"
              variant="tonal"
              class="limit-alert"
            >
              {{ t('createWorkspace.upgrade_limit_workspace') }}
            </v-alert>
          </div>
        </div>

        <div class="hero-side">
          <v-card class="workspace-card">
            <v-card-title class="card-title-row">
              <div>
                <span class="section-kicker">{{ t('createWorkspace.workspace_name') }}</span>
                <h2>{{ t('createWorkspace.title') }}</h2>
              </div>
              <div class="icon-chip icon-chip-soft">
                <v-icon size="22">mdi-office-building-plus-outline</v-icon>
              </div>
            </v-card-title>

            <v-card-text>
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
                  prepend-inner-icon="mdi-file-document-outline"
                  class="mb-2"
                  :hint="t('createWorkspace.legal_document_optional_hint')"
                  persistent-hint
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

            <v-card-actions class="justify-center action-row">
              <v-btn
                color="primary"
                size="large"
                :disabled="!valid || loading || isLoadingPlanAccess || reachedWorkspaceLimit"
                :loading="loading || isLoadingPlanAccess"
                @click="createWorkspace"
                class="cta-button"
              >
                <v-icon left>mdi-plus</v-icon>
                {{ reachedWorkspaceLimit ? t('createWorkspace.reached_limit_button') : t('createWorkspace.create_button') }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </div>
      </div>
    </section>

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
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/plugins/userStore'
import WorkspaceService from '@/services/WorkspaceService'
import OnboardingOrchestrator from '@/services/OnboardingOrchestrator'
import BillingOrchestrationService from '@/services/BillingOrchestrationService'
import { resolveAnyWorkspaceContext } from '@/services/BillingWorkspaceContext'
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
const currentWorkspaceCount = computed(() => userStore.getWorkspaces?.length || 0)
const currentPlanTier = ref<'FREE' | 'STARTER' | 'TEAM' | null>(null)
const isLoadingPlanAccess = ref(false)
const redirectTarget = computed(() =>
  OnboardingOrchestrator.resolveOnboardingTargetPath({
    redirect: route.query.redirect,
    plan: route.query.plan,
    defaultRedirect: '/dashboard'
  })
)
const reachedWorkspaceLimit = computed(() => currentPlanTier.value === 'FREE' && currentWorkspaceCount.value >= 1)

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
  (v: string) => {
    if (!v || !v.trim()) return true

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

const loadPlanAccess = async () => {
  const workspaceContext = resolveAnyWorkspaceContext(userStore)
  if (!workspaceContext) {
    currentPlanTier.value = 'FREE'
    return
  }

  try {
    isLoadingPlanAccess.value = true
    const access = await BillingOrchestrationService.getBillingSummary(workspaceContext.workspaceId)
    const tier = String(access.data?.currentPlanTier || '').toUpperCase()
    if (tier === 'FREE' || tier === 'STARTER' || tier === 'TEAM') {
      currentPlanTier.value = tier
      return
    }

    currentPlanTier.value = access.data?.hasPlanAccess ? 'STARTER' : 'FREE'
  } catch (error) {
    console.warn('Nao foi possivel carregar o plano atual para validacao de workspace.', error)
  } finally {
    isLoadingPlanAccess.value = false
  }
}

onMounted(() => {
  void loadPlanAccess()
})

const createWorkspace = async () => {
  if (loading.value) return

  if (reachedWorkspaceLimit.value) {
    upgradeMessage.value = t('createWorkspace.upgrade_limit_workspace')
    upgradeSnackbar.value = true
    return
  }

  if (isLoadingPlanAccess.value) return

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
      legalDocument: legalDocument.value.trim() || undefined,
      country: country.value,
      messageId
    }

    // 1) Create workspace in budget-api
    const result = await WorkspaceService.create(payload, correlationId)

    const createdWorkspace = result?.createdWorkspace
    const workspaceId = createdWorkspace?.workspaceId ?? createdWorkspace?.id
    if (!workspaceId) {
      showSnackbar('Resposta de criação sem workspaceId', 'error')
      sessionStorage.removeItem(messageKey)
      return
    }

    // 2) Refresh workspace list in store immediately (before selecting)
    try {
      const workspacesRes = await WorkspaceService.getAll()
      const workspaces = Array.isArray(workspacesRes?.data) ? [...workspacesRes.data] : []
      const createdWorkspaceId = String(workspaceId)
      const createdWorkspaceIndex = workspaces.findIndex((workspace: any) => String(workspace?.workspaceId) === createdWorkspaceId)
      if (createdWorkspaceIndex === -1) {
        // Eventual consistency guard: ensure the just-created workspace is selectable right away.
        workspaces.push({
          workspaceId: createdWorkspaceId,
          workspaceName: createdWorkspace?.workspaceName || workspaceName.value,
          role: createdWorkspace?.role || 'ROLE_OWNER'
        })
      } else {
        // Keep role/name usable for immediate selection even if auth projection is eventually consistent.
        const candidate = workspaces[createdWorkspaceIndex] || {}
        workspaces[createdWorkspaceIndex] = {
          ...candidate,
          workspaceId: createdWorkspaceId,
          workspaceName: candidate.workspaceName || createdWorkspace?.workspaceName || workspaceName.value,
          role: candidate.role || createdWorkspace?.role || 'ROLE_OWNER'
        }
      }
      userStore.setWorkspaces(workspaces)
      await userStore.hydrateWorkspaceDetailsFromBudget(workspaces.map((workspace: any) => String(workspace.workspaceId)).filter(Boolean))
    } catch (e) {
      console.warn('Não foi possível atualizar lista de workspaces imediatamente.', e)
    }

    // 3) Select active workspace locally (tenant context now flows via X-Workspace-Id header)
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
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&family=Source+Sans+3:wght@400;500;600;700&display=swap');

#create-workspace-page {
  --ink: #172033;
  --ink-soft: #536177;
  --line: rgba(23, 32, 51, 0.12);
  --brand: #b6551f;
  --brand-strong: #8e4318;
  --accent: #205f63;
  --accent-strong: #173f4b;
  --surface: rgba(255, 255, 255, 0.9);
  --shadow: 0 16px 34px rgba(23, 32, 51, 0.08);
  background:
    radial-gradient(circle at top left, rgba(32, 95, 99, 0.08), transparent 28%),
    radial-gradient(circle at 85% 10%, rgba(182, 85, 31, 0.08), transparent 20%),
    linear-gradient(180deg, #fbf8f2 0%, #f8f4ed 52%, #fdfaf5 100%);
  color: var(--ink);
  font-family: 'Source Sans 3', sans-serif;
  min-height: 100vh;
}

#create-workspace-page :deep(*) {
  box-sizing: border-box;
}

#create-workspace-page :deep(.v-icon) {
  color: inherit;
}

.shell {
  width: min(1180px, calc(100vw - 32px));
  margin: 0 auto;
}

.workspace-hero {
  padding: 72px 0 44px;
}

.hero-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.02fr) minmax(0, 0.98fr);
  gap: 28px;
  align-items: start;
}

.eyebrow,
.section-kicker {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 8px 14px;
  font-family: 'Manrope', sans-serif;
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  background: rgba(32, 95, 99, 0.1);
  color: var(--accent-strong);
}

h1,
h2,
.cta-button {
  font-family: 'Manrope', sans-serif;
}

h1 {
  margin: 16px 0 14px;
  font-size: clamp(2.5rem, 4.5vw, 4.2rem);
  line-height: 0.98;
  letter-spacing: -0.05em;
}

h2 {
  margin: 10px 0 0;
  font-size: clamp(1.5rem, 2.4vw, 2.3rem);
  line-height: 1.05;
  letter-spacing: -0.04em;
}

.hero-subtitle,
.note-card p {
  color: var(--ink-soft);
  font-size: 1.12rem;
  line-height: 1.65;
}

.hero-notes {
  display: grid;
  gap: 18px;
  margin-top: 28px;
}

.note-card,
.workspace-card {
  border: 1px solid var(--line);
  background: var(--surface);
  box-shadow: var(--shadow);
  backdrop-filter: blur(10px);
}

.note-card {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 14px;
  border-radius: 24px;
  padding: 18px 20px;
}

.note-card strong {
  display: block;
  margin-bottom: 6px;
  font-family: 'Manrope', sans-serif;
  font-size: 1rem;
}

.icon-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 14px;
}

.icon-chip-contrast {
  background: rgba(32, 95, 99, 0.12);
  color: var(--accent-strong);
}

.icon-chip-warm {
  background: rgba(182, 85, 31, 0.12);
  color: var(--brand-strong);
}

.icon-chip-soft {
  background: rgba(23, 32, 51, 0.06);
  color: var(--ink);
}

.workspace-card {
  border-radius: 28px;
  overflow: hidden;
}

.card-title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 28px 28px 0;
}

.workspace-card :deep(.v-card-text) {
  padding: 22px 28px 8px;
}

.workspace-card :deep(.v-field) {
  border-radius: 16px;
}

.action-row {
  padding: 0 28px 28px;
}

.cta-button {
  min-width: 220px;
  border-radius: 999px;
  text-transform: none;
  letter-spacing: 0;
  font-weight: 700;
}

.limit-alert {
  border-radius: 18px;
}

@media (max-width: 960px) {
  .hero-grid {
    grid-template-columns: 1fr;
  }

  .workspace-hero {
    padding: 42px 0 28px;
  }
}

@media (max-width: 640px) {
  .shell {
    width: min(100vw - 24px, 1180px);
  }

  .card-title-row,
  .workspace-card :deep(.v-card-text),
  .action-row {
    padding-left: 18px;
    padding-right: 18px;
  }

  .note-card {
    padding: 16px;
  }
}

.v-theme--dark #create-workspace-page {
  --ink: #f8fafc;
  --ink-soft: #cbd5e1;
  --line: rgba(148, 163, 184, 0.18);
  --surface: rgba(17, 24, 39, 0.9);
  --shadow: 0 20px 40px rgba(0, 0, 0, 0.28);
  background:
    radial-gradient(circle at top left, rgba(32, 95, 99, 0.18), transparent 28%),
    radial-gradient(circle at 85% 10%, rgba(182, 85, 31, 0.16), transparent 20%),
    linear-gradient(180deg, #141414 0%, #181818 52%, #101010 100%);
}

.v-theme--dark #create-workspace-page .eyebrow,
.v-theme--dark #create-workspace-page .section-kicker {
  background: rgba(125, 211, 252, 0.12);
  color: #c7ecff;
}

.v-theme--dark #create-workspace-page .icon-chip-soft {
  background: rgba(148, 163, 184, 0.14);
  color: #f8fafc;
}

.v-theme--dark #create-workspace-page .icon-chip-contrast {
  background: rgba(32, 95, 99, 0.18);
  color: #b9f3f2;
}

.v-theme--dark #create-workspace-page .icon-chip-warm {
  background: rgba(182, 85, 31, 0.18);
  color: #ffd0b8;
}

.v-theme--dark #create-workspace-page .workspace-card :deep(.v-field) {
  background: rgba(15, 23, 42, 0.78);
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.v-theme--dark #create-workspace-page .workspace-card :deep(.v-field__input),
.v-theme--dark #create-workspace-page .workspace-card :deep(.v-label),
.v-theme--dark #create-workspace-page .workspace-card :deep(.v-select__selection-text),
.v-theme--dark #create-workspace-page .workspace-card :deep(.v-icon),
.v-theme--dark #create-workspace-page .workspace-card :deep(textarea) {
  color: #f8fafc;
}

.v-theme--dark #create-workspace-page .workspace-card :deep(.v-messages__message),
.v-theme--dark #create-workspace-page .workspace-card :deep(.v-counter),
.v-theme--dark #create-workspace-page .workspace-card :deep(.v-field__hint) {
  color: #cbd5e1;
}

.v-theme--dark #create-workspace-page .workspace-card :deep(.v-field__outline) {
  --v-field-border-opacity: 0;
}
</style>
