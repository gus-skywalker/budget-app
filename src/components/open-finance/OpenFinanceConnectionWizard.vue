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
          <h4>Quem é o titular da conta?</h4>
          <div class="of-choice-grid">
            <button type="button" class="of-choice" :class="{ 'of-choice--selected': holderType === 'CPF' }" @click="selectHolderType('CPF')">
              <v-icon>mdi-account-outline</v-icon>
              <strong>Pessoa física</strong>
              <span>Conta vinculada a um CPF.</span>
            </button>
            <button type="button" class="of-choice" :class="{ 'of-choice--selected': holderType === 'CNPJ' }" @click="selectHolderType('CNPJ')">
              <v-icon>mdi-domain</v-icon>
              <strong>Pessoa jurídica</strong>
              <span>Conta vinculada a um CNPJ.</span>
            </button>
          </div>
        </section>

        <section v-else-if="step === 'holderLookup'" class="of-step-panel">
          <h4>{{ holderType === 'CPF' ? 'Informe o CPF do titular.' : 'Informe o CNPJ do titular.' }}</h4>
          <div class="of-holder-lookup">
            <v-text-field
              v-model="holderDocument"
              :label="holderType === 'CPF' ? 'CPF' : 'CNPJ'"
              variant="outlined"
              density="comfortable"
              color="#667eea"
              :loading="holdersLoading || cnpjLookupLoading"
              :hint="holderLookupHint"
              persistent-hint
              @update:model-value="onHolderDocumentInput"
              @blur="prepareHolderDocument"
            />

            <div v-if="lookupHolderResult" class="of-holder-results">
              <article class="of-holder-card">
                <div>
                  <span class="of-holder-card__eyebrow">Encontramos um titular já cadastrado</span>
                  <strong>{{ lookupHolderResult.name }}</strong>
                  <span>{{ lookupHolderResult.documentType }} {{ lookupHolderResult.documentMasked || maskedHolderDocument }}</span>
                  <span v-if="lookupHolderResult.email">{{ lookupHolderResult.email }}</span>
                  <span v-if="lookupHolderResult.city || lookupHolderResult.state">{{ [lookupHolderResult.city, lookupHolderResult.state].filter(Boolean).join(' - ') }}</span>
                </div>
                <div class="of-holder-card__actions">
                  <v-btn size="small" color="#667eea" variant="tonal" @click="lookupHolderResult && continueWithHolder(lookupHolderResult)">
                    Continuar com estes dados
                  </v-btn>
                  <v-btn size="small" variant="text" @click="lookupHolderResult && editHolder(lookupHolderResult)">
                    Atualizar dados
                  </v-btn>
                  <v-btn size="small" variant="text" color="warning" @click="useAnotherHolderDocument">
                    Usar outro {{ holderType }}
                  </v-btn>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section v-else-if="step === 'payer'" class="of-step-panel">
          <h4>{{ holderMode === 'update' ? 'Atualizar dados do titular' : 'Dados do titular' }}</h4>
          <div class="of-form-grid">
            <v-text-field
              :model-value="maskedHolderDocument"
              :label="holderType === 'CPF' ? 'CPF' : 'CNPJ'"
              variant="outlined"
              density="comfortable"
              color="#667eea"
              readonly
            />
            <v-text-field v-model="payerName" :label="holderType === 'CPF' ? 'Nome completo' : 'Razão social'" variant="outlined" density="comfortable" color="#667eea" />
            <v-text-field v-model="holderEmail" label="E-mail" type="email" variant="outlined" density="comfortable" color="#667eea" />
            <v-text-field v-model="holderPhone" label="Telefone opcional" variant="outlined" density="comfortable" color="#667eea" />
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
            <v-text-field v-model="street" label="Endereço" variant="outlined" density="comfortable" color="#667eea" />
            <v-text-field v-model="addressNumber" label="Número" variant="outlined" density="comfortable" color="#667eea" />
            <v-text-field v-model="addressComplement" label="Complemento" variant="outlined" density="comfortable" color="#667eea" />
            <v-text-field v-model="neighborhood" label="Bairro" variant="outlined" density="comfortable" color="#667eea" />
            <v-text-field v-model="city" label="Cidade" variant="outlined" density="comfortable" color="#667eea" />
            <v-text-field v-model="state" label="Estado" variant="outlined" density="comfortable" color="#667eea" maxlength="2" />
          </div>
        </section>

        <section v-else-if="step === 'account'" class="of-step-panel">
          <h4>Informe os dados da conta para que possamos preparar a autorização com o banco.</h4>
          <div class="of-form-grid">
            <v-text-field v-model="agency" label="Agência" variant="outlined" density="comfortable" color="#667eea" maxlength="8" inputmode="numeric" @update:model-value="agency = onlyDigits(String($event)).slice(0, 8)" />
            <v-text-field v-model="agencyDigit" label="Dígito da agência opcional" variant="outlined" density="comfortable" color="#667eea" maxlength="2" @update:model-value="agencyDigit = sanitizeDigit(String($event), 2)" />
            <v-text-field v-model="accountNumber" label="Conta" variant="outlined" density="comfortable" color="#667eea" maxlength="20" inputmode="numeric" @update:model-value="accountNumber = onlyDigits(String($event)).slice(0, 20)" />
            <v-text-field v-model="accountNumberDigit" label="Dígito da conta" variant="outlined" density="comfortable" color="#667eea" maxlength="2" @update:model-value="accountNumberDigit = sanitizeDigit(String($event), 2)" />
            <v-text-field v-model="displayName" label="Nome de exibição" variant="outlined" density="comfortable" color="#667eea" class="of-form-grid__wide" />
            <v-select
              v-model="statementType"
              :items="statementTypeOptions"
              item-title="label"
              item-value="value"
              label="Tipo de extrato inicial"
              variant="outlined"
              density="comfortable"
              color="#667eea"
            />
            <v-text-field
              v-if="statementType === 'CREDIT_CARD'"
              v-model="cardNumber"
              label="Últimos dígitos do cartão"
              variant="outlined"
              density="comfortable"
              color="#667eea"
              maxlength="4"
              inputmode="numeric"
              @update:model-value="cardNumber = onlyDigits(String($event)).slice(0, 4)"
            />
          </div>
        </section>

        <section v-else-if="step === 'review'" class="of-step-panel">
          <h4>Revise o compartilhamento.</h4>
          <div class="of-review">
            <div><span>Banco</span><strong>{{ selectedInstitution?.institutionName }}</strong></div>
            <div><span>Titular</span><strong>{{ selectedHolder?.name || payerName }}</strong></div>
            <div><span>Documento</span><strong>{{ selectedHolder?.documentMasked || maskedHolderDocument }}</strong></div>
            <div><span>Conta</span><strong>{{ maskedAccount }}</strong></div>
            <div><span>Visibilidade</span><strong>{{ holderType === 'CPF' ? 'Privada para o titular' : 'Organizacional do workspace' }}</strong></div>
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
import BrasilApiService, { isValidCep, isValidCnpj, isValidCpf, onlyDigits, type BrasilApiCnpj } from '@/services/BrasilApiService'
import { useUserStore } from '@/plugins/userStore'
import { extractOpenFinanceErrorMessage } from '@/utils/openFinanceErrors'
import type { OpenFinanceConnection, OpenFinanceHolder, OpenFinanceHolderRequest, OpenFinanceStartConnectionRequest } from '@/types/openFinance'
import { bankLogoPath, genericBankLogo, openFinanceInstitutions, type OpenFinanceInstitutionOption } from '@/data/openFinanceInstitutions'

type Step = 'holderType' | 'holderLookup' | 'payer' | 'institution' | 'account' | 'review' | 'authorization' | 'status'
type HolderMode = 'none' | 'create' | 'update' | 'reuse'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  created: [connection: OpenFinanceConnection]
  feedback: [payload: { type: 'success' | 'error' | 'info'; message: string }]
}>()
const userStore = useUserStore()

const steps: Array<{ value: Step; label: string }> = [
  { value: 'holderType', label: 'Titular' },
  { value: 'holderLookup', label: 'Documento' },
  { value: 'payer', label: 'Dados' },
  { value: 'institution', label: 'Banco' },
  { value: 'account', label: 'Conta' },
  { value: 'review', label: 'Revisão' },
  { value: 'authorization', label: 'Autorização' },
]

const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

const step = ref<Step>('holderType')
const institutionQuery = ref('')
const selectedInstitution = ref<OpenFinanceInstitutionOption | null>(null)
const holderType = ref<'CPF' | 'CNPJ'>('CPF')
const holderDocument = ref('')
const holdersLoading = ref(false)
const lookupHolderResult = ref<OpenFinanceHolder | null>(null)
const selectedHolder = ref<OpenFinanceHolder | null>(null)
const holderMode = ref<HolderMode>('none')
const holderDocumentRequiredForConnection = ref(false)
const payerName = ref('')
const holderEmail = ref('')
const holderPhone = ref('')
const zipcode = ref('')
const street = ref('')
const addressNumber = ref('')
const addressComplement = ref('')
const neighborhood = ref('')
const city = ref('')
const state = ref('')
const agency = ref('')
const agencyDigit = ref('')
const accountNumber = ref('')
const accountNumberDigit = ref('')
const displayName = ref('')
const statementType = ref<'BANK' | 'CREDIT_CARD'>('BANK')
const cardNumber = ref('')
const authorizationLink = ref('')
const submitting = ref(false)
const errorMessage = ref('')
const failedLogos = ref<Record<string, boolean>>({})
const cepLookupLoading = ref(false)
const cepLookupMessage = ref('')
const cnpjLookupLoading = ref(false)
const cnpjLookupMessage = ref('')
const cnpjCompany = ref<BrasilApiCnpj | null>(null)
const statementTypeOptions = [
  { label: 'Conta corrente bancária', value: 'BANK' },
  { label: 'Cartão de crédito', value: 'CREDIT_CARD' },
]

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

const maskedHolderDocument = computed(() => maskDocument(holderDocument.value))
const maskedAccount = computed(() => maskAccount(accountNumber.value))
const cepLookupHint = computed(() => cepLookupMessage.value || 'Preenche bairro, cidade e UF pelo CEP.')
const holderLookupHint = computed(() => {
  if (holdersLoading.value) return 'Buscando titular cadastrado...'
  if (holderType.value === 'CNPJ' && cnpjLookupMessage.value) return cnpjLookupMessage.value
  if (holderType.value === 'CNPJ' && cnpjCompany.value?.razao_social) return `CNPJ validado: ${cnpjCompany.value.razao_social}`
  if (lookupHolderResult.value) return 'Você pode reutilizar dados já cadastrados.'
  return holderType.value === 'CPF' ? 'Digite o CPF para buscar um titular cadastrado.' : 'Digite o CNPJ para buscar um titular cadastrado.'
})

watch(() => props.modelValue, (open) => {
  if (open) {
    reset()
    void prepareWorkspaceCompanyAutofill()
  }
})

const reset = () => {
  step.value = 'holderType'
  institutionQuery.value = ''
  selectedInstitution.value = null
  holderType.value = 'CPF'
  holderDocument.value = ''
  lookupHolderResult.value = null
  selectedHolder.value = null
  holderMode.value = 'none'
  holderDocumentRequiredForConnection.value = false
  payerName.value = ''
  holderEmail.value = ''
  holderPhone.value = ''
  zipcode.value = ''
  street.value = ''
  addressNumber.value = ''
  addressComplement.value = ''
  neighborhood.value = ''
  city.value = ''
  state.value = ''
  agency.value = ''
  agencyDigit.value = ''
  accountNumber.value = ''
  accountNumberDigit.value = ''
  displayName.value = ''
  statementType.value = 'BANK'
  cardNumber.value = ''
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
  if (step.value === 'institution' && holderMode.value === 'reuse') {
    step.value = 'holderLookup'
    return
  }
  step.value = steps[stepIndex.value - 1].value
}

const selectHolderType = (type: 'CPF' | 'CNPJ') => {
  holderType.value = type
  holderDocument.value = ''
  lookupHolderResult.value = null
  selectedHolder.value = null
  holderMode.value = 'none'
  holderDocumentRequiredForConnection.value = false
  clearHolderForm()
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
  if (step.value === 'holderLookup') {
    await resolveHolderDocument()
    return
  }
  if (step.value === 'payer') {
    await persistHolderData()
    return
  }
  if (step.value === 'review') {
    await submit(openAuthorizationPlaceholder())
    return
  }
  step.value = steps[stepIndex.value + 1].value
}

const validateStep = () => {
  if (step.value === 'institution' && !selectedInstitution.value) return 'Escolha o banco que deseja conectar.'
  if (step.value === 'holderLookup') {
    if (!digitsOnly(holderDocument.value)) return holderType.value === 'CPF' ? 'Informe o CPF.' : 'Informe o CNPJ.'
    if (holderType.value === 'CPF' && !isValidCpf(holderDocument.value)) return 'Informe um CPF válido.'
    if (holderType.value === 'CNPJ' && !isValidCnpj(holderDocument.value)) return 'Informe um CNPJ válido.'
  }
  if (step.value === 'payer') {
    if (!payerName.value.trim()) return holderType.value === 'CPF' ? 'Informe o nome completo.' : 'Informe a razão social.'
    if (holderEmail.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(holderEmail.value.trim())) return 'Informe um e-mail válido.'
    if (!isValidCep(zipcode.value)) return 'Informe um CEP válido.'
    if (!street.value.trim()) return 'Informe o endereço.'
    if (!addressNumber.value.trim()) return 'Informe o número.'
    if (!city.value.trim() || !state.value.trim()) return 'Informe cidade e UF.'
  }
  if (step.value === 'account') {
    if (!agency.value.trim()) return 'Informe a agência.'
    if (!accountNumber.value.trim()) return 'Informe a conta.'
    if (statementType.value === 'CREDIT_CARD' && digitsOnly(cardNumber.value).length !== 4) return 'Informe os 4 últimos dígitos do cartão.'
  }
  return ''
}

const resolveHolderDocument = async () => {
  holdersLoading.value = true
  try {
    await prepareHolderDocument()
    const response = await OpenFinanceService.lookupHolder({
      documentType: holderType.value,
      documentNumber: digitsOnly(holderDocument.value),
    })
    lookupHolderResult.value = response.data?.holder || null
    if (lookupHolderResult.value) {
      selectedHolder.value = null
      holderMode.value = 'reuse'
      return
    }
    holderMode.value = 'create'
    selectedHolder.value = null
    hydrateHolderFormFromDocument()
    step.value = 'payer'
  } catch (error: any) {
    errorMessage.value = extractErrorMessage(error, 'Não foi possível buscar titulares cadastrados.')
  } finally {
    holdersLoading.value = false
  }
}

const continueWithHolder = (holder: OpenFinanceHolder) => {
  selectedHolder.value = holder
  holderMode.value = 'reuse'
  holderDocumentRequiredForConnection.value = false
  applyHolderData(holder)
  step.value = 'institution'
}

const editHolder = (holder: OpenFinanceHolder) => {
  selectedHolder.value = holder
  holderMode.value = 'update'
  holderDocumentRequiredForConnection.value = false
  applyHolderData(holder)
  step.value = 'payer'
}

const useAnotherHolderDocument = () => {
  holderDocument.value = ''
  selectedHolder.value = null
  holderMode.value = 'none'
  holderDocumentRequiredForConnection.value = false
  lookupHolderResult.value = null
  clearHolderForm()
}

const persistHolderData = async () => {
  submitting.value = true
  try {
    const payload = holderPayload()
    const creatingHolder = !(selectedHolder.value?.id && holderMode.value === 'update')
    const response = selectedHolder.value?.id && holderMode.value === 'update'
      ? await OpenFinanceService.updateHolder(selectedHolder.value.id, payload)
      : await OpenFinanceService.createHolder(payload)
    selectedHolder.value = response.data
    holderDocumentRequiredForConnection.value = creatingHolder
    holderMode.value = 'reuse'
    step.value = 'institution'
  } catch (error: any) {
    errorMessage.value = extractErrorMessage(error, 'Não foi possível salvar os dados do titular.')
  } finally {
    submitting.value = false
  }
}

const holderPayload = (): OpenFinanceHolderRequest => ({
  documentType: holderType.value,
  documentNumber: digitsOnly(holderDocument.value),
  name: payerName.value.trim(),
  email: sanitizeText(holderEmail.value, 255) || null,
  phone: sanitizeText(holderPhone.value, 40) || null,
  zipcode: digitsOnly(zipcode.value),
  street: sanitizeText(street.value, 120),
  addressNumber: sanitizeText(addressNumber.value, 20),
  addressComplement: sanitizeText(addressComplement.value, 80) || null,
  neighborhood: sanitizeText(neighborhood.value, 120),
  state: state.value.trim().toUpperCase(),
  city: sanitizeText(city.value, 120),
})

const submit = async (authorizationWindow?: Window | null) => {
  if (!selectedInstitution.value) return
  if (!selectedHolder.value?.id) {
    errorMessage.value = 'Confirme os dados do titular antes de continuar.'
    return
  }
  submitting.value = true
  try {
    const payload: OpenFinanceStartConnectionRequest = {
      holderId: selectedHolder.value.id,
      institutionKey: selectedInstitution.value.institutionKey,
      institutionName: selectedInstitution.value.institutionName,
      bankCode: selectedInstitution.value.bankCode,
      zipcode: digitsOnly(zipcode.value),
      street: sanitizeText(street.value, 120),
      addressNumber: sanitizeText(addressNumber.value, 20),
      addressComplement: sanitizeText(addressComplement.value, 80) || null,
      neighborhood: sanitizeText(neighborhood.value, 120),
      state: state.value.trim().toUpperCase(),
      city: sanitizeText(city.value, 120),
      agency: onlyDigits(agency.value).slice(0, 8),
      agencyDigit: sanitizeDigit(agencyDigit.value, 2) || null,
      accountNumber: digitsOnly(accountNumber.value).slice(0, 20),
      accountNumberDigit: sanitizeDigit(accountNumberDigit.value, 2) || null,
      displayName: sanitizeText(displayName.value, 80) || selectedInstitution.value.institutionName,
      statementType: statementType.value,
      cardNumber: statementType.value === 'CREDIT_CARD' ? digitsOnly(cardNumber.value) : null,
      email: sanitizeText(holderEmail.value, 255) || null,
    }
    if (holderDocumentRequiredForConnection.value) {
      payload.payerDocumentType = holderType.value
      payload.payerDocument = digitsOnly(holderDocument.value)
      payload.payerName = (selectedHolder.value.name || payerName.value).trim()
    }
    const response = await OpenFinanceService.startConnection(payload)
    authorizationLink.value = response.data.authorizationLink || response.data.openfinanceLink || ''
    emit('created', response.data)
    emit('feedback', { type: 'success', message: 'Conexão criada. Continue a autorização no ambiente seguro do banco.' })
    if (authorizationLink.value) openAuthorizationLink(authorizationWindow)
    else authorizationWindow?.close()
    step.value = 'authorization'
  } catch (error: any) {
    authorizationWindow?.close()
    errorMessage.value = extractErrorMessage(error, 'Não foi possível iniciar a conexão Open Finance.')
  } finally {
    submitting.value = false
  }
}

const openAuthorizationPlaceholder = () => {
  const target = window.open('about:blank', '_blank')
  if (!target) return null
  target.document.write('<!doctype html><title>Open Finance</title><p>Preparando autorizacao Open Finance...</p>')
  target.document.close()
  return target
}

const openAuthorizationLink = (targetWindow?: Window | null) => {
  if (!authorizationLink.value) return
  if (targetWindow && !targetWindow.closed) {
    targetWindow.location.href = authorizationLink.value
    targetWindow.opener = null
    return
  }
  window.open(authorizationLink.value, '_blank', 'noopener,noreferrer')
}

const clearHolderForm = () => {
  payerName.value = ''
  holderEmail.value = ''
  holderPhone.value = ''
  zipcode.value = ''
  street.value = ''
  addressNumber.value = ''
  addressComplement.value = ''
  neighborhood.value = ''
  city.value = ''
  state.value = ''
  cepLookupMessage.value = ''
  cnpjLookupMessage.value = ''
  cnpjCompany.value = null
}

const hydrateHolderFormFromDocument = () => {
  clearHolderForm()
  if (holderType.value === 'CNPJ' && cnpjCompany.value) {
    applyCompanyData(cnpjCompany.value)
  }
}

const applyHolderData = (holder: OpenFinanceHolder) => {
  payerName.value = holder.name || ''
  holderEmail.value = holder.email || ''
  holderPhone.value = holder.phone || ''
  zipcode.value = holder.zipcode || ''
  street.value = holder.street || ''
  addressNumber.value = holder.addressNumber || ''
  addressComplement.value = holder.addressComplement || ''
  neighborhood.value = holder.neighborhood || ''
  city.value = holder.city || ''
  state.value = holder.state || ''
}

const applyCompanyData = (company: BrasilApiCnpj) => {
  const companyName = company.razao_social || company.nome_fantasia || ''
  const companyCep = company.cep ? String(company.cep).padStart(8, '0') : ''

  if (companyName) payerName.value = companyName
  if (companyCep) zipcode.value = companyCep
  if (company.logradouro) street.value = company.logradouro
  if (company.numero) addressNumber.value = company.numero
  if (company.complemento) addressComplement.value = company.complemento
  if (company.bairro) neighborhood.value = company.bairro
  if (company.municipio) city.value = company.municipio
  if (company.uf) state.value = company.uf
}

const prepareHolderDocument = async () => {
  if (holderType.value === 'CNPJ') {
    await prepareCnpjAutofill()
    return
  }
  holderDocument.value = onlyDigits(holderDocument.value)
}

const onHolderDocumentInput = (value: string) => {
  holderDocument.value = onlyDigits(String(value)).slice(0, holderType.value === 'CPF' ? 11 : 14)
  selectedHolder.value = null
  holderMode.value = 'none'
  lookupHolderResult.value = null
}

const prepareCnpjAutofill = async () => {
  if (holderType.value !== 'CNPJ') return

  cnpjLookupMessage.value = ''
  cnpjCompany.value = null
  const cnpj = onlyDigits(holderDocument.value)
  if (!cnpj) return
  if (!isValidCnpj(cnpj)) {
    cnpjLookupMessage.value = 'CNPJ inválido.'
    return
  }

  cnpjLookupLoading.value = true
  try {
    const response = await BrasilApiService.getCnpj(cnpj)
    cnpjCompany.value = response.data
    holderDocument.value = cnpj
    applyCompanyData(response.data)
  } catch (error: any) {
    cnpjLookupMessage.value = error?.response?.data?.message || error?.message || 'Não foi possível validar o CNPJ agora.'
  } finally {
    cnpjLookupLoading.value = false
  }
}

const prepareWorkspaceCompanyAutofill = async () => {
  const workspaceId = userStore.getCurrentWorkspaceId
  if (!workspaceId || holderDocument.value) return

  try {
    const response = await WorkspaceService.getDetails(workspaceId)
    const legalDocument = response?.data?.legalDocument
    const country = String(response?.data?.country || '').toUpperCase()
    const cnpj = onlyDigits(legalDocument)
    if (country && country !== 'BR') return
    if (!isValidCnpj(cnpj)) return

    holderType.value = 'CNPJ'
    holderDocument.value = cnpj
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
    if (response.data.street) street.value = response.data.street
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
const sanitizeDigit = (value: string | null | undefined, maxLength: number) => (
  String(value || '').replace(/[^0-9A-Za-z]/g, '').toUpperCase().slice(0, maxLength)
)
const sanitizeText = (value: string | null | undefined, maxLength: number) => (
  String(value || '').replace(/[<>;]/g, '').trim().slice(0, maxLength)
)
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
  extractOpenFinanceErrorMessage(error, fallback)
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

.of-holder-lookup {
  display: grid;
  gap: 14px;
}

.of-holder-results {
  display: grid;
  gap: 12px;
}

.of-holder-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 16px;
  align-items: start;
  padding: 14px;
  border: 1px solid rgba(102, 126, 234, 0.24);
  border-radius: 8px;
  background: #f8fafc;
}

.of-holder-card strong,
.of-holder-card span {
  display: block;
}

.of-holder-card strong {
  margin-top: 4px;
  color: #1f2937;
}

.of-holder-card span {
  color: #64748b;
  font-size: 0.88rem;
}

.of-holder-card__eyebrow {
  color: #667eea !important;
  font-size: 0.76rem !important;
  font-weight: 700;
  text-transform: uppercase;
}

.of-holder-card__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
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

  .of-holder-card {
    grid-template-columns: 1fr;
  }

  .of-holder-card__actions {
    justify-content: flex-start;
  }
}
</style>
