<template>
  <div class="create-company-container">
    <v-container>
      <v-row justify="center">
        <v-col cols="12" sm="8" md="6">
          <v-card class="elevation-12 pa-6">
            <v-card-title class="headline text-center mb-6">
              <v-icon large color="primary" class="mr-2">mdi-office-building</v-icon>
              {{ t('create_company.title') }}
            </v-card-title>

            <v-card-text>
              <p class="text-body-1 mb-6 text-center">
                {{ t('create_company.description') }}
              </p>

              <v-form ref="form" v-model="valid" @submit.prevent="createCompany">
                <v-text-field
                  v-model="companyName"
                  :rules="companyNameRules"
                  :label="t('create_company.workspace_name')"
                  :placeholder="t('create_company.workspace_placeholder')"
                  outlined
                  required
                  :loading="loading"
                  prepend-inner-icon="mdi-domain"
                />


                <v-select
                  v-model="country"
                  :items="countryOptions"
                  :rules="countryRules"
                  :label="t('create_company.country_label')"
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
                  :label="t('create_company.description_optional')"
                  :placeholder="t('create_company.description_placeholder')"
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
                @click="createCompany"
                class="px-8"
              >
                <v-icon left>mdi-plus</v-icon>
                {{ t('create_company.create_button') }}
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
          {{ t('create_company.view_premium_plans') }}
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
import CompanyService from '@/services/CompanyService'
import OnboardingOrchestrator from '@/services/OnboardingOrchestrator'
import { getOrCreateCorrelationId } from '@/utils/correlation'
import { getFreePlanLimitType, parseApiError } from '@/utils/errorHandler'

const { t } = useI18n()
// Lista simplificada de países (pode ser expandida ou internacionalizada)
const countryOptions = computed(() => [
  { code: 'BR', label: t('create_company.countries.br') },
  { code: 'US', label: t('create_company.countries.us') },
  { code: 'AR', label: t('create_company.countries.ar') },
  { code: 'PT', label: t('create_company.countries.pt') },
  { code: 'ES', label: t('create_company.countries.es') },
  { code: 'MX', label: t('create_company.countries.mx') },
  { code: 'DE', label: t('create_company.countries.de') },
  { code: 'FR', label: t('create_company.countries.fr') },
  { code: 'CL', label: t('create_company.countries.cl') },
  { code: 'CO', label: t('create_company.countries.co') },
  { code: 'PE', label: t('create_company.countries.pe') },
  { code: 'UK', label: t('create_company.countries.uk') },
  { code: 'IT', label: t('create_company.countries.it') },
  { code: 'CA', label: t('create_company.countries.ca') },
  { code: 'OTHER', label: t('create_company.countries.other') }
])

const country = ref('BR')

const countryRules = [
  (v: string) => !!v || t('create_company.country_required')
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
const companyName = ref('')
const description = ref('')
const legalDocument = ref('')

// Snackbar state
const snackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('success')
const upgradeSnackbar = ref(false)
const upgradeMessage = ref('')


// Validation rules
const companyNameRules = [
  (v: string) => !!v || t('create_company.workspace_name_required'),
  (v: string) => (v && v.length >= 2) || t('create_company.workspace_name_min'),
  (v: string) => (v && v.length <= 100) || t('create_company.workspace_name_max')
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
    default: return t('create_company.tax_id_generic');
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
    default: return t('create_company.tax_id_placeholder_generic');
  }
})

const legalDocumentRules = [
  (v: string) => !!v || t('create_company.legal_document_required', { label: legalDocumentLabel.value }),
  (v: string) => {
    switch (country.value) {
      case 'BR':
        return /^\d{14}$/.test(v) || t('create_company.legal_document_cnpj');
      case 'US':
        return /^\d{9}$/.test(v) || t('create_company.legal_document_ein');
      case 'AR':
        return /^\d{11}$/.test(v) || t('create_company.legal_document_cuit');
      case 'PT':
      case 'ES':
        return /^\d{9}$/.test(v) || t('create_company.legal_document_nif');
      case 'MX':
        return /^[A-Z0-9]{12,13}$/.test(v) || t('create_company.legal_document_rfc');
      case 'DE':
      case 'FR':
      case 'UK':
      case 'IT':
        return v.length >= 8 && v.length <= 15 || t('create_company.legal_document_vat');
      case 'CL':
        return /^\d{7,8}-[\dkK]$/.test(v) || t('create_company.legal_document_rut');
      case 'CO':
        return /^\d{9,10}$/.test(v) || t('create_company.legal_document_nit');
      case 'PE':
        return /^\d{11}$/.test(v) || t('create_company.legal_document_ruc');
      case 'CA':
        return /^\d{9}$/.test(v) || t('create_company.legal_document_bn');
      default:
        return v.length >= 4 || t('create_company.legal_document_invalid');
    }
  }
]

const descriptionRules = [
  (v: string) => !v || v.length <= 200 || t('create_company.description_max')
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
const createCompany = async () => {
  if (!form.value?.validate()) return

  try {
    loading.value = true

    // Gera correlationId para rastreabilidade cross-service
    const correlationId = getOrCreateCorrelationId('companyCorrelationId')

    // Garante idempotência: messageId persistente por sessão/ação
    const messageKey = `createCompany.messageId:${companyName.value}:${country.value}`
    let messageId = sessionStorage.getItem(messageKey)
    if (!messageId) {
      messageId = createMessageId()
      sessionStorage.setItem(messageKey, messageId)
    }
    const payload = {
      name: companyName.value,
      description: description.value,
      legalDocument: legalDocument.value,
      country: country.value,
      messageId
    }

    // 1) Create company in budget-api
    const result = await CompanyService.create(payload, correlationId)

    const createdCompany = result?.createdCompany
    const companyId = createdCompany?.companyId ?? createdCompany?.id
    if (!companyId) {
      throw new Error('Resposta de criação sem companyId')
    }

    // 2) Select tenant in auth-api (with retry/fallback handled by CompanyService.selectCompany)
    try {
      await userStore.selectCompany(String(companyId))
    } catch (selectError) {
      console.warn('Company criada, mas seleção automática falhou. Redirecionando para select-company.', selectError)
      showSnackbar(t('create_company.created_select_company'), 'warning')
      sessionStorage.removeItem(messageKey)
      setTimeout(() => {
        router.push({ name: 'select-company', query: { redirect: redirectTarget.value } })
      }, 1200)
      return
    }

    // 3) Refresh company list in store immediately (avoids requiring logout/login)
    try {
      const companiesRes = await CompanyService.getAll()
      const companies = Array.isArray(companiesRes?.data) ? companiesRes.data : []
      if (companies.length) {
        userStore.setCompanies(companies)
        await userStore.hydrateCompanyDetailsFromBudget(companies.map((company: any) => String(company.companyId)).filter(Boolean))
      }
    } catch (e) {
      console.warn('Não foi possível atualizar lista de empresas imediatamente.', e)
    }

    showSnackbar(t('create_company.created_success'), 'success')
    // Limpa o messageId da sessão após sucesso
    sessionStorage.removeItem(messageKey)

    // Redirect to dashboard
    setTimeout(() => {
      router.push({ path: redirectTarget.value })
    }, 1500)

  } catch (error) {
    console.error('Error creating company:', error)
    const errorMessage = parseApiError(error)
    showSnackbar(errorMessage, 'error')
    const limitType = getFreePlanLimitType(error)
    if (limitType === 'company') {
      upgradeMessage.value = t('create_company.upgrade_limit_company')
      upgradeSnackbar.value = true
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.create-company-container {
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
