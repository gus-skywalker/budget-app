<template>
  <div class="create-company-container">
    <v-container>
      <v-row justify="center">
        <v-col cols="12" sm="8" md="6">
          <v-card class="elevation-12 pa-6">
            <v-card-title class="headline text-center mb-6">
              <v-icon large color="primary" class="mr-2">mdi-office-building</v-icon>
              Criar sua Empresa
            </v-card-title>
            
            <v-card-text>
              <p class="text-body-1 mb-6 text-center">
                Para começar a usar o CoBudget, você precisa criar uma empresa. 
                Como administrador, você poderá convidar outros usuários para colaborar.
              </p>
              
              <v-form ref="form" v-model="valid" @submit.prevent="createCompany">
                <v-text-field
                  v-model="companyName"
                  :rules="companyNameRules"
                  label="Nome da Empresa"
                  placeholder="Ex: Minha Empresa Ltda"
                  outlined
                  required
                  :loading="loading"
                  prepend-inner-icon="mdi-domain"
                />


                <v-select
                  v-model="country"
                  :items="countryOptions"
                  :rules="countryRules"
                  label="País de registro"
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
                  label="Descrição (Opcional)"
                  placeholder="Descreva brevemente sua empresa..."
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
                Criar Empresa
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
  </div>
</template>

<script setup lang="ts">
import { createMessageId } from '@/utils/messageId'
import { computed } from 'vue'
// Lista simplificada de países (pode ser expandida ou internacionalizada)
const countryOptions = [
  { code: 'BR', label: 'Brasil' },
  { code: 'US', label: 'Estados Unidos' },
  { code: 'AR', label: 'Argentina' },
  { code: 'PT', label: 'Portugal' },
  { code: 'ES', label: 'Espanha' },
  { code: 'MX', label: 'México' },
  { code: 'DE', label: 'Alemanha' },
  { code: 'FR', label: 'França' },
  { code: 'CL', label: 'Chile' },
  { code: 'CO', label: 'Colômbia' },
  { code: 'PE', label: 'Peru' },
  { code: 'UK', label: 'Reino Unido' },
  { code: 'IT', label: 'Itália' },
  { code: 'CA', label: 'Canadá' },
  { code: 'OTHER', label: 'Outro' }
]

const country = ref('BR')

const countryRules = [
  (v: string) => !!v || 'Selecione o país de registro'
]
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/plugins/userStore'
import CompanyService from '@/services/CompanyService'
import { getOrCreateCorrelationId } from '@/utils/correlation'
import { parseApiError } from '@/utils/errorHandler'

const router = useRouter()
const userStore = useUserStore()

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


// Validation rules
const companyNameRules = [
  (v: string) => !!v || 'Nome da empresa é obrigatório',
  (v: string) => (v && v.length >= 2) || 'Nome deve ter pelo menos 2 caracteres',
  (v: string) => (v && v.length <= 100) || 'Nome deve ter no máximo 100 caracteres'
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
    default: return 'Número de identificação fiscal';
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
    default: return 'Digite o número fiscal';
  }
})

const legalDocumentRules = [
  (v: string) => !!v || `${legalDocumentLabel.value} é obrigatório`,
  (v: string) => {
    switch (country.value) {
      case 'BR':
        return /^\d{14}$/.test(v) || 'CNPJ deve ter 14 dígitos';
      case 'US':
        return /^\d{9}$/.test(v) || 'EIN deve ter 9 dígitos';
      case 'AR':
        return /^\d{11}$/.test(v) || 'CUIT deve ter 11 dígitos';
      case 'PT':
      case 'ES':
        return /^\d{9}$/.test(v) || 'NIF deve ter 9 dígitos';
      case 'MX':
        return /^[A-Z0-9]{12,13}$/.test(v) || 'RFC deve ter 12 ou 13 caracteres';
      case 'DE':
      case 'FR':
      case 'UK':
      case 'IT':
        return v.length >= 8 && v.length <= 15 || 'VAT deve ter entre 8 e 15 caracteres';
      case 'CL':
        return /^\d{7,8}-[\dkK]$/.test(v) || 'RUT deve ter formato 12345678-9';
      case 'CO':
        return /^\d{9,10}$/.test(v) || 'NIT deve ter 9 ou 10 dígitos';
      case 'PE':
        return /^\d{11}$/.test(v) || 'RUC deve ter 11 dígitos';
      case 'CA':
        return /^\d{9}$/.test(v) || 'BN deve ter 9 dígitos';
      default:
        return v.length >= 4 || 'Número fiscal inválido';
    }
  }
]

const descriptionRules = [
  (v: string) => !v || v.length <= 200 || 'Descrição deve ter no máximo 200 caracteres'
]

const showSnackbar = (message: string, color: string = 'success') => {
  snackbarMessage.value = message
  snackbarColor.value = color
  snackbar.value = true
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

    // Create company (budget-api) + enrich token (auth-api)
    const result = await CompanyService.create(payload, correlationId)
    const tokens = result?.tokens

    showSnackbar('Empresa criada com sucesso!', 'success')
    // Limpa o messageId da sessão após sucesso
    sessionStorage.removeItem(messageKey)

    if (tokens?.accessToken) {
      userStore.setToken(tokens.accessToken)
      ;(userStore as any).syncFromToken?.(tokens.accessToken)
      userStore.setAuth(true)
    }
    if (tokens?.refreshToken) {
      userStore.setRefreshToken(tokens.refreshToken)
    }

    // Redirect to dashboard
    setTimeout(() => {
      router.push('/dashboard')
    }, 1500)

  } catch (error) {
    console.error('Error creating company:', error)
    const errorMessage = parseApiError(error)
    showSnackbar(errorMessage, 'error')
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