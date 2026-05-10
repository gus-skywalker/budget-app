<template>
  <v-dialog v-model="isOpen" max-width="880" persistent>
    <v-card class="of-wizard">
      <v-card-title class="of-wizard__header">
        <div>
          <div class="of-wizard__eyebrow">Open Finance</div>
          <h3>Adicionar conexão</h3>
        </div>
        <v-btn icon="mdi-close" variant="text" @click="close" />
      </v-card-title>

      <v-card-text>
        <div class="of-steps">
          <div
            v-for="(item, index) in steps"
            :key="item.value"
            class="of-step"
            :class="{ 'of-step--active': item.value === step, 'of-step--done': stepIndex > index }"
          >
            <span>{{ index + 1 }}</span>
            <strong>{{ item.label }}</strong>
          </div>
        </div>

        <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4">
          {{ errorMessage }}
        </v-alert>

        <section v-if="step === 'institution'" class="of-step-panel">
          <h4>Escolha o banco que deseja conectar.</h4>
          <v-text-field
            v-model="institutionQuery"
            prepend-inner-icon="mdi-magnify"
            label="Buscar banco"
            variant="outlined"
            density="comfortable"
            color="#667eea"
            hide-details
            class="mb-4"
          />
          <div class="of-bank-grid">
            <button
              v-for="institution in filteredInstitutions"
              :key="institution.institutionKey"
              type="button"
              class="of-bank-option"
              :class="{ 'of-bank-option--selected': selectedInstitution?.institutionKey === institution.institutionKey }"
              @click="selectedInstitution = institution"
            >
              <span class="of-bank-mark">
                <img
                  v-if="logoFor(institution)"
                  :src="logoFor(institution)"
                  :alt="institution.institutionName"
                  @error="markLogoAsFailed(institution.institutionKey)"
                >
                <span v-else>{{ initials(institution.institutionName) }}</span>
              </span>
              <span class="of-bank-name">{{ institution.institutionName }}</span>
              <span class="of-bank-code">{{ institution.bankCode }}</span>
              <span class="of-bank-badges">
                <v-chip v-if="institution.supportsPf" size="x-small" variant="tonal">PF</v-chip>
                <v-chip v-if="institution.supportsPj" size="x-small" variant="tonal">PJ</v-chip>
              </span>
            </button>
          </div>
        </section>

        <section v-else-if="step === 'holderType'" class="of-step-panel">
          <h4>Essa informação ajuda a preparar a autorização corretamente.</h4>
          <div class="of-choice-grid">
            <button type="button" class="of-choice" :class="{ 'of-choice--selected': holderType === 'CPF' }" @click="selectHolderType('CPF')">
              <v-icon>mdi-account-outline</v-icon>
              <strong>Pessoa física</strong>
              <span>Use CPF e nome completo do titular.</span>
            </button>
            <button type="button" class="of-choice" :class="{ 'of-choice--selected': holderType === 'CNPJ' }" @click="selectHolderType('CNPJ')">
              <v-icon>mdi-domain</v-icon>
              <strong>Empresa</strong>
              <span>Use CNPJ e razão social do pagador.</span>
            </button>
          </div>
        </section>

        <section v-else-if="step === 'payer'" class="of-step-panel">
          <h4>{{ holderType === 'CPF' ? 'Dados do titular' : 'Dados da empresa' }}</h4>
          <div class="of-form-grid">
            <v-text-field v-model="payerName" :label="holderType === 'CPF' ? 'Nome completo' : 'Razão social'" variant="outlined" density="comfortable" color="#667eea" />
            <v-text-field
              v-model="payerDocument"
              :label="holderType === 'CPF' ? 'CPF' : 'CNPJ'"
              variant="outlined"
              density="comfortable"
              color="#667eea"
              :loading="cnpjLookupLoading"
              :hint="cnpjLookupHint"
              persistent-hint
              @blur="prepareCnpjAutofill"
            />
            <v-text-field
              v-model="zipcode"
              label="CEP"
              variant="outlined"
              density="comfortable"
              color="#667eea"
              :loading="cepLookupLoading"
              :hint="cepLookupHint"
              persistent-hint
              @blur="prepareZipcodeAutofill"
            />
            <v-text-field v-model="addressNumber" label="Número" variant="outlined" density="comfortable" color="#667eea" />
            <v-text-field v-model="neighborhood" label="Bairro" variant="outlined" density="comfortable" color="#667eea" />
            <v-text-field v-model="city" label="Cidade" variant="outlined" density="comfortable" color="#667eea" />
            <v-text-field v-model="state" label="Estado" variant="outlined" density="comfortable" color="#667eea" maxlength="2" />
          </div>
        </section>

        <section v-else-if="step === 'account'" class="of-step-panel">
          <h4>Informe os dados da conta para que possamos preparar a autorização com o banco.</h4>
          <div class="of-form-grid">
            <v-text-field v-model="agency" label="Agência" variant="outlined" density="comfortable" color="#667eea" />
            <v-text-field v-model="agencyDigit" label="Dígito da agência opcional" variant="outlined" density="comfortable" color="#667eea" />
            <v-text-field v-model="accountNumber" label="Conta" variant="outlined" density="comfortable" color="#667eea" />
            <v-text-field v-model="accountNumberDigit" label="Dígito da conta" variant="outlined" density="comfortable" color="#667eea" />
            <v-text-field v-model="displayName" label="Nome de exibição" variant="outlined" density="comfortable" color="#667eea" class="of-form-grid__wide" />
          </div>
        </section>

        <section v-else-if="step === 'review'" class="of-step-panel">
          <h4>Revise o compartilhamento.</h4>
          <div class="of-review">
            <div><span>Banco</span><strong>{{ selectedInstitution?.institutionName }}</strong></div>
            <div><span>Titular</span><strong>{{ payerName }}</strong></div>
            <div><span>Documento</span><strong>{{ maskedDocument }}</strong></div>
            <div><span>Conta</span><strong>{{ maskedAccount }}</strong></div>
            <div><span>Visibilidade</span><strong>Compartilhada com este workspace</strong></div>
          </div>
          <div class="of-permissions">
            <v-chip size="small" variant="tonal">saldos</v-chip>
            <v-chip size="small" variant="tonal">extratos</v-chip>
            <v-chip size="small" variant="tonal">identificação da conta</v-chip>
          </div>
          <v-alert type="info" variant="tonal" class="mt-4">
            Você será redirecionado ao banco para autorizar o compartilhamento. O CoBudget não acessa sua senha.
          </v-alert>
        </section>

        <section v-else class="of-step-panel of-status-panel">
          <v-icon size="46" color="#667eea">mdi-bank-transfer-out</v-icon>
          <h4>Autorização em andamento</h4>
          <p>Finalize no ambiente seguro do banco e volte para acompanhar o status da conexão.</p>
          <v-btn v-if="authorizationLink" color="#667eea" variant="tonal" @click="openAuthorizationLink">
            <v-icon start>mdi-open-in-new</v-icon>
            Abrir autorização
          </v-btn>
        </section>
      </v-card-text>

      <v-card-actions class="of-wizard__actions">
        <v-btn variant="text" @click="previousStep" :disabled="stepIndex === 0 || submitting">Voltar</v-btn>
        <v-spacer />
        <v-btn variant="text" @click="close" :disabled="submitting">Cancelar</v-btn>
        <v-btn class="gradient-btn" :loading="submitting" @click="advance">
          {{ step === 'review' ? 'Continuar para o banco' : step === 'authorization' || step === 'status' ? 'Concluir' : 'Continuar' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import OpenFinanceService from '@/services/OpenFinanceService'
import WorkspaceService from '@/services/WorkspaceService'
import BrasilApiService, { isValidCep, isValidCnpj, onlyDigits, type BrasilApiCnpj } from '@/services/BrasilApiService'
import { useUserStore } from '@/plugins/userStore'
import type { OpenFinanceConnection, OpenFinanceStartConnectionRequest } from '@/types/openFinance'
import { bankLogoPath, genericBankLogo, openFinanceInstitutions, type OpenFinanceInstitutionOption } from '@/data/openFinanceInstitutions'

type Step = 'institution' | 'holderType' | 'payer' | 'account' | 'review' | 'authorization' | 'status'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  created: [connection: OpenFinanceConnection]
  feedback: [payload: { type: 'success' | 'error' | 'info'; message: string }]
}>()
const userStore = useUserStore()

const steps: Array<{ value: Step; label: string }> = [
  { value: 'institution', label: 'Banco' },
  { value: 'holderType', label: 'Titular' },
  { value: 'payer', label: 'Pagador' },
  { value: 'account', label: 'Conta' },
  { value: 'review', label: 'Revisão' },
  { value: 'authorization', label: 'Autorização' },
]

const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

const step = ref<Step>('institution')
const institutionQuery = ref('')
const selectedInstitution = ref<OpenFinanceInstitutionOption | null>(null)
const holderType = ref<'CPF' | 'CNPJ'>('CPF')
const payerName = ref('')
const payerDocument = ref('')
const zipcode = ref('')
const addressNumber = ref('')
const neighborhood = ref('')
const city = ref('')
const state = ref('')
const agency = ref('')
const agencyDigit = ref('')
const accountNumber = ref('')
const accountNumberDigit = ref('')
const displayName = ref('')
const authorizationLink = ref('')
const submitting = ref(false)
const errorMessage = ref('')
const failedLogos = ref<Record<string, boolean>>({})
const cepLookupLoading = ref(false)
const cepLookupMessage = ref('')
const cnpjLookupLoading = ref(false)
const cnpjLookupMessage = ref('')
const cnpjCompany = ref<BrasilApiCnpj | null>(null)

const stepIndex = computed(() => steps.findIndex((item) => item.value === step.value))
const filteredInstitutions = computed(() => {
  const query = normalize(institutionQuery.value)
  if (!query) return openFinanceInstitutions
  return openFinanceInstitutions.filter((item) =>
    normalize(item.institutionName).includes(query) ||
    normalize(item.bankCode).includes(query) ||
    normalize(item.institutionKey).includes(query)
  )
})

const maskedDocument = computed(() => maskDocument(payerDocument.value))
const maskedAccount = computed(() => maskAccount(accountNumber.value))
const cepLookupHint = computed(() => cepLookupMessage.value || 'Preenche bairro, cidade e UF pelo CEP.')
const cnpjLookupHint = computed(() => {
  if (holderType.value !== 'CNPJ') return ''
  if (cnpjLookupMessage.value) return cnpjLookupMessage.value
  if (cnpjCompany.value?.razao_social) return `CNPJ validado: ${cnpjCompany.value.razao_social}`
  return 'Valida e preenche razão social/endereço pelo CNPJ.'
})

watch(() => props.modelValue, (open) => {
  if (open) {
    reset()
    void prepareWorkspaceCompanyAutofill()
  }
})

const reset = () => {
  step.value = 'institution'
  institutionQuery.value = ''
  selectedInstitution.value = null
  holderType.value = 'CPF'
  payerName.value = ''
  payerDocument.value = ''
  zipcode.value = ''
  addressNumber.value = ''
  neighborhood.value = ''
  city.value = ''
  state.value = ''
  agency.value = ''
  agencyDigit.value = ''
  accountNumber.value = ''
  accountNumberDigit.value = ''
  displayName.value = ''
  authorizationLink.value = ''
  errorMessage.value = ''
  cepLookupMessage.value = ''
  cnpjLookupMessage.value = ''
  cnpjCompany.value = null
}

const close = () => {
  isOpen.value = false
}

const previousStep = () => {
  if (stepIndex.value <= 0) return
  step.value = steps[stepIndex.value - 1].value
}

const selectHolderType = (type: 'CPF' | 'CNPJ') => {
  holderType.value = type
  if (type === 'CNPJ') {
    void prepareWorkspaceCompanyAutofill()
  }
}

const advance = async () => {
  errorMessage.value = ''
  if (step.value === 'authorization' || step.value === 'status') {
    close()
    return
  }
  const validation = validateStep()
  if (validation) {
    errorMessage.value = validation
    return
  }
  if (step.value === 'review') {
    await submit()
    return
  }
  step.value = steps[stepIndex.value + 1].value
}

const validateStep = () => {
  if (step.value === 'institution' && !selectedInstitution.value) return 'Escolha o banco que deseja conectar.'
  if (step.value === 'payer') {
    if (!payerName.value.trim()) return holderType.value === 'CPF' ? 'Informe o nome completo.' : 'Informe a razão social.'
    if (!digitsOnly(payerDocument.value)) return holderType.value === 'CPF' ? 'Informe o CPF.' : 'Informe o CNPJ.'
    if (holderType.value === 'CNPJ' && !isValidCnpj(payerDocument.value)) return 'Informe um CNPJ válido.'
    if (!isValidCep(zipcode.value)) return 'Informe um CEP válido.'
    if (!addressNumber.value.trim()) return 'Informe o número.'
    if (!city.value.trim() || !state.value.trim()) return 'Informe cidade e UF.'
  }
  if (step.value === 'account') {
    if (!agency.value.trim()) return 'Informe a agência.'
    if (!accountNumber.value.trim()) return 'Informe a conta.'
  }
  return ''
}

const submit = async () => {
  if (!selectedInstitution.value) return
  submitting.value = true
  try {
    const payload: OpenFinanceStartConnectionRequest = {
      institutionKey: selectedInstitution.value.institutionKey,
      institutionName: selectedInstitution.value.institutionName,
      bankCode: selectedInstitution.value.bankCode,
      payerDocumentType: holderType.value,
      payerDocument: digitsOnly(payerDocument.value),
      payerName: payerName.value.trim(),
      zipcode: digitsOnly(zipcode.value),
      addressNumber: addressNumber.value.trim(),
      neighborhood: neighborhood.value.trim(),
      state: state.value.trim().toUpperCase(),
      city: city.value.trim(),
      agency: agency.value.trim(),
      agencyDigit: optionalText(agencyDigit.value),
      accountNumber: digitsOnly(accountNumber.value),
      accountNumberDigit: optionalText(accountNumberDigit.value),
      displayName: optionalText(displayName.value) || selectedInstitution.value.institutionName,
      statementType: 'BANK',
    }
    const response = await OpenFinanceService.startConnection(payload)
    authorizationLink.value = response.data.authorizationLink || response.data.openfinanceLink || ''
    emit('created', response.data)
    emit('feedback', { type: 'success', message: 'Conexão criada. Continue a autorização no ambiente seguro do banco.' })
    if (authorizationLink.value) openAuthorizationLink()
    step.value = 'authorization'
  } catch (error: any) {
    errorMessage.value = extractErrorMessage(error, 'Não foi possível iniciar a conexão Open Finance.')
  } finally {
    submitting.value = false
  }
}

const openAuthorizationLink = () => {
  if (!authorizationLink.value) return
  window.open(authorizationLink.value, '_blank', 'noopener,noreferrer')
}

const applyCompanyData = (company: BrasilApiCnpj) => {
  const companyName = company.razao_social || company.nome_fantasia || ''
  const companyCep = company.cep ? String(company.cep).padStart(8, '0') : ''

  if (companyName) payerName.value = companyName
  if (companyCep) zipcode.value = companyCep
  if (company.numero) addressNumber.value = company.numero
  if (company.bairro) neighborhood.value = company.bairro
  if (company.municipio) city.value = company.municipio
  if (company.uf) state.value = company.uf
}

const prepareCnpjAutofill = async () => {
  if (holderType.value !== 'CNPJ') return

  cnpjLookupMessage.value = ''
  cnpjCompany.value = null
  const cnpj = onlyDigits(payerDocument.value)
  if (!cnpj) return
  if (!isValidCnpj(cnpj)) {
    cnpjLookupMessage.value = 'CNPJ inválido.'
    return
  }

  cnpjLookupLoading.value = true
  try {
    const response = await BrasilApiService.getCnpj(cnpj)
    cnpjCompany.value = response.data
    payerDocument.value = cnpj
    applyCompanyData(response.data)
  } catch (error: any) {
    cnpjLookupMessage.value = error?.response?.data?.message || error?.message || 'Não foi possível validar o CNPJ agora.'
  } finally {
    cnpjLookupLoading.value = false
  }
}

const prepareWorkspaceCompanyAutofill = async () => {
  const workspaceId = userStore.getCurrentWorkspaceId
  if (!workspaceId || payerDocument.value) return

  try {
    const response = await WorkspaceService.getDetails(workspaceId)
    const legalDocument = response?.data?.legalDocument
    const country = String(response?.data?.country || '').toUpperCase()
    const cnpj = onlyDigits(legalDocument)
    if (country && country !== 'BR') return
    if (!isValidCnpj(cnpj)) return

    holderType.value = 'CNPJ'
    payerDocument.value = cnpj
    await prepareCnpjAutofill()
  } catch {
    // Workspace CNPJ autofill is opportunistic; manual input remains the source of truth.
  }
}

const prepareZipcodeAutofill = async () => {
  cepLookupMessage.value = ''
  const cep = onlyDigits(zipcode.value)
  if (!cep) return
  if (!isValidCep(cep)) {
    cepLookupMessage.value = 'CEP deve conter 8 dígitos.'
    return
  }

  cepLookupLoading.value = true
  try {
    const response = await BrasilApiService.getCep(cep)
    zipcode.value = response.data.cep || cep
    if (response.data.neighborhood) neighborhood.value = response.data.neighborhood
    if (response.data.city) city.value = response.data.city
    if (response.data.state) state.value = response.data.state
  } catch (error: any) {
    cepLookupMessage.value = error?.response?.data?.message || error?.message || 'Não foi possível buscar o CEP agora.'
  } finally {
    cepLookupLoading.value = false
  }
}

const logoFor = (institution: OpenFinanceInstitutionOption) => {
  if (failedLogos.value[institution.institutionKey]) return genericBankLogo
  return bankLogoPath(institution.bankCode, institution.institutionKey, institution.institutionName)
}

const markLogoAsFailed = (institutionKey: string) => {
  failedLogos.value = { ...failedLogos.value, [institutionKey]: true }
}

const initials = (value: string) => value.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
const digitsOnly = (value: string | null | undefined) => String(value || '').replace(/\D/g, '')
const optionalText = (value: string | null | undefined) => {
  const text = String(value || '').trim()
  return text || undefined
}
const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
const maskDocument = (value: string) => {
  const digits = digitsOnly(value)
  if (!digits) return '-'
  return `${'*'.repeat(Math.max(0, digits.length - 4))}${digits.slice(-4)}`
}
const maskAccount = (value: string) => {
  const digits = digitsOnly(value)
  if (!digits) return '-'
  return `****${digits.slice(-4)}`
}
const extractErrorMessage = (error: any, fallback: string) => (
  error?.response?.data?.message ||
  (typeof error?.response?.data === 'string' ? error.response.data : null) ||
  fallback
)
</script>

<style scoped>
.of-wizard {
  border-radius: 14px;
}

.of-wizard__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22px 24px 10px;
}

.of-wizard__header h3 {
  margin: 2px 0 0;
  font-size: 1.25rem;
}

.of-wizard__eyebrow {
  color: #667eea;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
}

.of-steps {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 8px;
  margin-bottom: 22px;
}

.of-step {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6b7280;
  font-size: 0.8rem;
}

.of-step span {
  display: inline-grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border: 1px solid rgba(102, 126, 234, 0.25);
  border-radius: 50%;
}

.of-step--active,
.of-step--done {
  color: #334155;
}

.of-step--active span,
.of-step--done span {
  color: white;
  background: #667eea;
  border-color: #667eea;
}

.of-step-panel h4 {
  margin: 0 0 16px;
  font-size: 1.05rem;
}

.of-bank-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
}

.of-bank-option,
.of-choice {
  border: 1px solid rgba(100, 116, 139, 0.18);
  background: white;
  border-radius: 8px;
  padding: 14px;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.of-bank-option--selected,
.of-choice--selected {
  border-color: #667eea;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.14);
}

.of-bank-mark {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 8px;
  background: #f1f5f9;
  font-weight: 700;
  overflow: hidden;
}

.of-bank-mark img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.of-bank-name,
.of-bank-code,
.of-bank-badges {
  display: block;
  margin-top: 8px;
}

.of-bank-name {
  font-weight: 700;
}

.of-bank-code {
  color: #64748b;
  font-size: 0.83rem;
}

.of-bank-badges {
  display: flex;
  gap: 6px;
}

.of-choice-grid,
.of-form-grid,
.of-review {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.of-choice {
  min-height: 130px;
}

.of-choice span,
.of-review span {
  display: block;
  color: #64748b;
  font-size: 0.88rem;
}

.of-choice strong,
.of-review strong {
  display: block;
  margin-top: 6px;
}

.of-form-grid__wide {
  grid-column: 1 / -1;
}

.of-review > div {
  border: 1px solid rgba(100, 116, 139, 0.16);
  border-radius: 8px;
  padding: 12px;
}

.of-permissions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}

.of-status-panel {
  display: grid;
  justify-items: center;
  text-align: center;
  gap: 12px;
  padding: 24px 0;
}

.of-wizard__actions {
  padding: 14px 24px 22px;
}

.gradient-btn {
  color: white;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

@media (max-width: 760px) {
  .of-steps {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .of-choice-grid,
  .of-form-grid,
  .of-review {
    grid-template-columns: 1fr;
  }
}
</style>
