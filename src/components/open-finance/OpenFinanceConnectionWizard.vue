<template>
  <v-dialog v-model="isOpen" max-width="880" persistent>
    <v-card class="of-wizard">
      <v-card-title class="of-wizard__header">
        <div>
          <div class="of-wizard__eyebrow">Open Finance</div>
          <h3>{{ t('openFinance.wizard.add_connection') }}</h3>
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
          <h4>{{ t('openFinance.wizard.choose_bank') }}</h4>
          <v-text-field
            v-model="institutionQuery"
            prepend-inner-icon="mdi-magnify"
            :label="t('openFinance.wizard.search_bank')"
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
          <h4>{{ t('openFinance.wizard.holder_type_title') }}</h4>
          <div class="of-choice-grid">
            <button type="button" class="of-choice" :class="{ 'of-choice--selected': holderType === 'CPF' }" @click="selectHolderType('CPF')">
              <v-icon>mdi-account-outline</v-icon>
              <strong>{{ t('openFinance.wizard.individual') }}</strong>
              <span>{{ t('openFinance.wizard.individual_description') }}</span>
            </button>
            <button type="button" class="of-choice" :class="{ 'of-choice--selected': holderType === 'CNPJ' }" @click="selectHolderType('CNPJ')">
              <v-icon>mdi-domain</v-icon>
              <strong>{{ t('openFinance.wizard.company') }}</strong>
              <span>{{ t('openFinance.wizard.company_description') }}</span>
            </button>
          </div>
        </section>

        <section v-else-if="step === 'holderLookup'" class="of-step-panel">
          <h4>{{ holderType === 'CPF' ? t('openFinance.wizard.enter_cpf') : t('openFinance.wizard.enter_cnpj') }}</h4>
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
                  <span class="of-holder-card__eyebrow">{{ t('openFinance.wizard.existing_holder_found') }}</span>
                  <strong>{{ lookupHolderResult.name }}</strong>
                  <span>{{ lookupHolderResult.documentType }} {{ lookupHolderResult.documentMasked || maskedHolderDocument }}</span>
                  <span v-if="lookupHolderResult.email">{{ lookupHolderResult.email }}</span>
                  <span v-if="lookupHolderResult.city || lookupHolderResult.state">{{ [lookupHolderResult.city, lookupHolderResult.state].filter(Boolean).join(' - ') }}</span>
                </div>
                <div class="of-holder-card__actions">
                  <v-btn size="small" color="#667eea" variant="tonal" @click="lookupHolderResult && continueWithHolder(lookupHolderResult)">
                    {{ t('openFinance.wizard.continue_with_data') }}
                  </v-btn>
                  <v-btn size="small" variant="text" @click="lookupHolderResult && editHolder(lookupHolderResult)">
                    {{ t('openFinance.wizard.update_data') }}
                  </v-btn>
                  <v-btn size="small" variant="text" color="warning" @click="useAnotherHolderDocument">
                    {{ t('openFinance.wizard.use_another_document', { document: holderType }) }}
                  </v-btn>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section v-else-if="step === 'payer'" class="of-step-panel">
          <h4>{{ holderMode === 'update' ? t('openFinance.wizard.update_holder_data') : t('openFinance.wizard.holder_data') }}</h4>
          <div class="of-form-grid">
            <v-text-field
              :model-value="maskedHolderDocument"
              :label="holderType === 'CPF' ? 'CPF' : 'CNPJ'"
              variant="outlined"
              density="comfortable"
              color="#667eea"
              readonly
            />
            <v-text-field v-model="payerName" :label="holderType === 'CPF' ? t('openFinance.wizard.full_name') : t('openFinance.wizard.company_name')" variant="outlined" density="comfortable" color="#667eea" />
            <v-text-field v-model="holderEmail" :label="t('openFinance.wizard.email')" type="email" variant="outlined" density="comfortable" color="#667eea" />
            <v-text-field v-model="holderPhone" :label="t('openFinance.wizard.optional_phone')" variant="outlined" density="comfortable" color="#667eea" />
            <v-text-field
              v-model="zipcode"
              :label="t('openFinance.wizard.zipcode')"
              variant="outlined"
              density="comfortable"
              color="#667eea"
              :loading="cepLookupLoading"
              :hint="cepLookupHint"
              persistent-hint
              @blur="prepareZipcodeAutofill"
            />
            <v-text-field v-model="street" :label="t('openFinance.wizard.street')" variant="outlined" density="comfortable" color="#667eea" />
            <v-text-field v-model="addressNumber" :label="t('openFinance.wizard.address_number')" variant="outlined" density="comfortable" color="#667eea" />
            <v-text-field v-model="addressComplement" :label="t('openFinance.wizard.address_complement')" variant="outlined" density="comfortable" color="#667eea" />
            <v-text-field v-model="neighborhood" :label="t('openFinance.wizard.neighborhood')" variant="outlined" density="comfortable" color="#667eea" />
            <v-text-field v-model="city" :label="t('openFinance.wizard.city')" variant="outlined" density="comfortable" color="#667eea" />
            <v-text-field v-model="state" :label="t('openFinance.wizard.state')" variant="outlined" density="comfortable" color="#667eea" maxlength="2" />
          </div>
        </section>

        <section v-else-if="step === 'account'" class="of-step-panel">
          <h4>{{ t('openFinance.wizard.account_data_title') }}</h4>
          <div class="of-form-grid">
            <v-text-field v-model="agency" :label="t('openFinance.wizard.agency')" variant="outlined" density="comfortable" color="#667eea" maxlength="8" inputmode="numeric" @update:model-value="agency = onlyDigits(String($event)).slice(0, 8)" />
            <v-text-field v-model="agencyDigit" :label="t('openFinance.wizard.optional_agency_digit')" variant="outlined" density="comfortable" color="#667eea" maxlength="2" @update:model-value="agencyDigit = sanitizeDigit(String($event), 2)" />
            <v-text-field v-model="accountNumber" :label="t('openFinance.wizard.account')" variant="outlined" density="comfortable" color="#667eea" maxlength="20" inputmode="numeric" @update:model-value="accountNumber = onlyDigits(String($event)).slice(0, 20)" />
            <v-text-field v-model="accountNumberDigit" :label="t('openFinance.wizard.account_digit')" variant="outlined" density="comfortable" color="#667eea" maxlength="2" @update:model-value="accountNumberDigit = sanitizeDigit(String($event), 2)" />
            <v-text-field v-model="displayName" :label="t('openFinance.wizard.display_name')" variant="outlined" density="comfortable" color="#667eea" class="of-form-grid__wide" />
            <v-select
              v-model="statementType"
              :items="statementTypeOptions"
              item-title="label"
              item-value="value"
              :label="t('openFinance.wizard.initial_statement_type')"
              variant="outlined"
              density="comfortable"
              color="#667eea"
            />
            <v-text-field
              v-if="statementType === 'CREDIT_CARD'"
              v-model="cardNumber"
              :label="t('openFinance.wizard.card_last_digits')"
              variant="outlined"
              density="comfortable"
              color="#667eea"
              maxlength="4"
              inputmode="numeric"
              @update:model-value="cardNumber = onlyDigits(String($event)).slice(0, 4)"
            />
            <div v-if="statementType === 'CREDIT_CARD' && (creditCardsLoading || creditCardOptions.length)" class="of-card-options of-form-grid__wide">
              <span>{{ creditCardsLoading ? t('openFinance.wizard.loading_credit_cards') : t('openFinance.wizard.credit_cards_found') }}</span>
              <div class="of-card-options__chips">
                <v-chip
                  v-for="option in creditCardOptions"
                  :key="option"
                  size="small"
                  variant="tonal"
                  color="#667eea"
                  @click="cardNumber = option"
                >
                  {{ option }}
                </v-chip>
              </div>
            </div>
          </div>
        </section>

        <section v-else-if="step === 'review'" class="of-step-panel">
          <h4>{{ t('openFinance.wizard.review_sharing') }}</h4>
          <div class="of-review">
            <div><span>{{ t('openFinance.wizard.bank') }}</span><strong>{{ selectedInstitution?.institutionName }}</strong></div>
            <div><span>{{ t('openFinance.wizard.holder') }}</span><strong>{{ selectedHolder?.name || payerName }}</strong></div>
            <div><span>{{ t('openFinance.wizard.document') }}</span><strong>{{ selectedHolder?.documentMasked || maskedHolderDocument }}</strong></div>
            <div><span>{{ t('openFinance.wizard.account') }}</span><strong>{{ maskedAccount }}</strong></div>
            <div><span>{{ t('openFinance.wizard.visibility') }}</span><strong>{{ holderType === 'CPF' ? t('openFinance.wizard.private_to_holder') : t('openFinance.wizard.workspace_organizational') }}</strong></div>
          </div>
          <div class="of-permissions">
            <v-chip size="small" variant="tonal">{{ t('openFinance.wizard.permission_balances') }}</v-chip>
            <v-chip size="small" variant="tonal">{{ t('openFinance.wizard.permission_statements') }}</v-chip>
            <v-chip size="small" variant="tonal">{{ t('openFinance.wizard.permission_account_identification') }}</v-chip>
          </div>
          <v-alert type="info" variant="tonal" class="mt-4">
            {{ t('openFinance.panel.security_note') }}
          </v-alert>
        </section>

        <section v-else class="of-step-panel of-status-panel">
          <v-icon size="46" color="#667eea">mdi-bank-transfer-out</v-icon>
          <h4>{{ t('openFinance.wizard.authorization_in_progress') }}</h4>
          <p>{{ t('openFinance.wizard.authorization_in_progress_description') }}</p>
          <v-btn v-if="authorizationLink" color="#667eea" variant="tonal" @click="openAuthorizationLink">
            <v-icon start>mdi-open-in-new</v-icon>
            {{ t('openFinance.wizard.open_authorization') }}
          </v-btn>
        </section>
      </v-card-text>

      <v-card-actions class="of-wizard__actions">
        <v-btn variant="text" @click="previousStep" :disabled="stepIndex === 0 || submitting">{{ t('common.back') }}</v-btn>
        <v-spacer />
        <v-btn variant="text" @click="close" :disabled="submitting">{{ t('common.cancel') }}</v-btn>
        <v-btn class="gradient-btn" :loading="submitting" @click="advance">
          {{ step === 'review' ? t('openFinance.wizard.continue_to_bank') : step === 'authorization' || step === 'status' ? t('openFinance.wizard.finish') : t('openFinance.wizard.continue') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import OpenFinanceService from '@/services/OpenFinanceService'
import WorkspaceService from '@/services/WorkspaceService'
import BrasilApiService, { isValidCep, isValidCnpj, isValidCpf, onlyDigits, type BrasilApiCnpj } from '@/services/BrasilApiService'
import { useUserStore } from '@/plugins/userStore'
import { extractOpenFinanceErrorMessage } from '@/utils/openFinanceErrors'
import type { OpenFinanceConnection, OpenFinanceCreditCard, OpenFinanceHolder, OpenFinanceHolderRequest, OpenFinanceStartConnectionRequest } from '@/types/openFinance'
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
const { t } = useI18n()

const steps = computed<Array<{ value: Step; label: string }>>(() => [
  { value: 'holderType', label: t('openFinance.wizard.steps.holder') },
  { value: 'holderLookup', label: t('openFinance.wizard.steps.document') },
  { value: 'payer', label: t('openFinance.wizard.steps.data') },
  { value: 'institution', label: t('openFinance.wizard.steps.bank') },
  { value: 'account', label: t('openFinance.wizard.steps.account') },
  { value: 'review', label: t('openFinance.wizard.steps.review') },
  { value: 'authorization', label: t('openFinance.wizard.steps.authorization') },
])

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
const linkedCreditCards = ref<OpenFinanceCreditCard[]>([])
const creditCardsLoading = ref(false)
const authorizationLink = ref('')
const submitting = ref(false)
const errorMessage = ref('')
const failedLogos = ref<Record<string, boolean>>({})
const cepLookupLoading = ref(false)
const cepLookupMessage = ref('')
const cnpjLookupLoading = ref(false)
const cnpjLookupMessage = ref('')
const cnpjCompany = ref<BrasilApiCnpj | null>(null)
const statementTypeOptions = computed(() => [
  { label: t('openFinance.wizard.bank_current_account'), value: 'BANK' },
  { label: t('openFinance.wizard.credit_card'), value: 'CREDIT_CARD' },
])

const stepIndex = computed(() => steps.value.findIndex((item) => item.value === step.value))
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
const cepLookupHint = computed(() => cepLookupMessage.value || t('openFinance.wizard.cep_hint'))
const holderLookupHint = computed(() => {
  if (holdersLoading.value) return t('openFinance.wizard.searching_holder')
  if (holderType.value === 'CNPJ' && cnpjLookupMessage.value) return cnpjLookupMessage.value
  if (holderType.value === 'CNPJ' && cnpjCompany.value?.razao_social) return t('openFinance.wizard.cnpj_validated', { name: cnpjCompany.value.razao_social })
  if (lookupHolderResult.value) return t('openFinance.wizard.reuse_holder_hint')
  return holderType.value === 'CPF' ? t('openFinance.wizard.cpf_lookup_hint') : t('openFinance.wizard.cnpj_lookup_hint')
})
const creditCardOptions = computed(() => {
  const values = new Set<string>()
  linkedCreditCards.value.forEach((card) => {
    const add = (value?: string | null) => {
      const digits = onlyDigits(value || '').slice(-4)
      if (digits.length === 4) values.add(digits)
    }
    add(card.cardNumber)
    String(card.additionalCards || '').split(',').forEach(add)
  })
  return Array.from(values)
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
  linkedCreditCards.value = []
  creditCardsLoading.value = false
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
  step.value = steps.value[stepIndex.value - 1].value
}

const selectHolderType = (type: 'CPF' | 'CNPJ') => {
  errorMessage.value = ''
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
  step.value = steps.value[stepIndex.value + 1].value
  if (step.value === 'account' && statementType.value === 'CREDIT_CARD') {
    void loadLinkedCreditCards()
  }
}

const validateStep = () => {
  if (step.value === 'institution' && !selectedInstitution.value) return t('openFinance.wizard.validation.choose_bank')
  if (step.value === 'holderLookup') {
    if (!digitsOnly(holderDocument.value)) return holderType.value === 'CPF' ? t('openFinance.wizard.validation.enter_cpf') : t('openFinance.wizard.validation.enter_cnpj')
    if (holderType.value === 'CPF' && !isValidCpf(holderDocument.value)) return t('openFinance.wizard.validation.valid_cpf')
    if (holderType.value === 'CNPJ' && !isValidCnpj(holderDocument.value)) return t('openFinance.wizard.validation.valid_cnpj')
  }
  if (step.value === 'payer') {
    if (!payerName.value.trim()) return holderType.value === 'CPF' ? t('openFinance.wizard.validation.full_name') : t('openFinance.wizard.validation.company_name')
    if (holderEmail.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(holderEmail.value.trim())) return t('openFinance.wizard.validation.valid_email')
    if (!isValidCep(zipcode.value)) return t('openFinance.wizard.validation.valid_cep')
    if (!street.value.trim()) return t('openFinance.wizard.validation.street')
    if (!addressNumber.value.trim()) return t('openFinance.wizard.validation.address_number')
    if (!city.value.trim() || !state.value.trim()) return t('openFinance.wizard.validation.city_state')
  }
  if (step.value === 'account') {
    if (!agency.value.trim()) return t('openFinance.wizard.validation.agency')
    if (!accountNumber.value.trim()) return t('openFinance.wizard.validation.account')
    if (statementType.value === 'CREDIT_CARD' && digitsOnly(cardNumber.value).length !== 4) return t('openFinance.wizard.validation.card_last_digits')
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
    errorMessage.value = extractErrorMessage(error, t('openFinance.wizard.error.lookup_holder'))
  } finally {
    holdersLoading.value = false
  }
}

const continueWithHolder = async (holder: OpenFinanceHolder) => {
  selectedHolder.value = holder
  holderDocumentRequiredForConnection.value = false
  errorMessage.value = ''
  await hydrateReusableHolderData(holder)
  if (!holderHasProviderStartData(holder)) {
    holderMode.value = 'update'
    errorMessage.value = t('openFinance.wizard.validation.update_holder_data_required')
    return
  }
  holderMode.value = 'reuse'
  errorMessage.value = ''
  step.value = 'institution'
}

const editHolder = async (holder: OpenFinanceHolder) => {
  selectedHolder.value = holder
  holderMode.value = 'update'
  holderDocumentRequiredForConnection.value = false
  errorMessage.value = ''
  await hydrateReusableHolderData(holder)
  step.value = 'payer'
}

const useAnotherHolderDocument = () => {
  errorMessage.value = ''
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
    errorMessage.value = extractErrorMessage(error, t('openFinance.wizard.error.save_holder'))
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
    errorMessage.value = t('openFinance.wizard.validation.confirm_holder')
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
    emit('feedback', { type: 'success', message: t('openFinance.wizard.feedback.connection_created') })
    if (authorizationLink.value) openAuthorizationLink(authorizationWindow)
    else authorizationWindow?.close()
    step.value = 'authorization'
  } catch (error: any) {
    authorizationWindow?.close()
    errorMessage.value = extractErrorMessage(error, t('openFinance.wizard.error.start_connection'))
  } finally {
    submitting.value = false
  }
}

const loadLinkedCreditCards = async () => {
  if (!selectedHolder.value?.id || !selectedInstitution.value || creditCardsLoading.value) return
  creditCardsLoading.value = true
  try {
    const connectionsResponse = await OpenFinanceService.listConnections()
    const source = (connectionsResponse.data || []).find((connection: OpenFinanceConnection) =>
      connection.status === 'CONNECTED' &&
      connection.statementType === 'BANK' &&
      connection.holderId === selectedHolder.value?.id &&
      connection.institutionKey === selectedInstitution.value?.institutionKey
    )
    if (!source) {
      linkedCreditCards.value = []
      return
    }
    const cardsResponse = await OpenFinanceService.listCreditCards(source.id)
    linkedCreditCards.value = cardsResponse.data || []
  } catch {
    linkedCreditCards.value = []
  } finally {
    creditCardsLoading.value = false
  }
}

watch([statementType, selectedInstitution, selectedHolder], () => {
  linkedCreditCards.value = []
  if (step.value === 'account' && statementType.value === 'CREDIT_CARD') {
    void loadLinkedCreditCards()
  }
})

const openAuthorizationPlaceholder = () => {
  const target = window.open('about:blank', '_blank')
  if (!target) return null
  target.document.write(`<!doctype html><title>Open Finance</title><p>${t('openFinance.wizard.preparing_authorization')}</p>`)
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

const hydrateReusableHolderData = async (holder: OpenFinanceHolder) => {
  applyHolderData(holder)
  if (holderType.value === 'CPF') {
    const user = userStore.getUser || {}
    if (!payerName.value && user.username) payerName.value = user.username
    if (!holderEmail.value && user.email) holderEmail.value = user.email
    return
  }
  if (holderType.value === 'CNPJ') {
    await prepareCnpjAutofill({ preserveExisting: true })
  }
}

const holderHasProviderStartData = (holder: OpenFinanceHolder) => (
  Boolean((payerName.value || holder.name)?.trim()) &&
  isValidCep(zipcode.value || holder.zipcode || '') &&
  Boolean((street.value || holder.street)?.trim()) &&
  Boolean((addressNumber.value || holder.addressNumber)?.trim()) &&
  Boolean((city.value || holder.city)?.trim()) &&
  Boolean((state.value || holder.state)?.trim())
)

const applyCompanyData = (company: BrasilApiCnpj, preserveExisting = false) => {
  const companyName = company.razao_social || company.nome_fantasia || ''
  const companyCep = company.cep ? String(company.cep).padStart(8, '0') : ''
  const assign = (current: { value: string }, next?: string | null) => {
    if (!next) return
    if (!preserveExisting || !current.value) current.value = next
  }

  assign(payerName, companyName)
  assign(zipcode, companyCep)
  assign(street, company.logradouro)
  assign(addressNumber, company.numero)
  assign(addressComplement, company.complemento)
  assign(neighborhood, company.bairro)
  assign(city, company.municipio)
  assign(state, company.uf)
}

const prepareHolderDocument = async () => {
  if (holderType.value === 'CNPJ') {
    await prepareCnpjAutofill()
    return
  }
  holderDocument.value = onlyDigits(holderDocument.value)
}

const onHolderDocumentInput = (value: string) => {
  errorMessage.value = ''
  holderDocument.value = onlyDigits(String(value)).slice(0, holderType.value === 'CPF' ? 11 : 14)
  selectedHolder.value = null
  holderMode.value = 'none'
  lookupHolderResult.value = null
}

const prepareCnpjAutofill = async (options: { preserveExisting?: boolean } = {}) => {
  if (holderType.value !== 'CNPJ') return

  cnpjLookupMessage.value = ''
  cnpjCompany.value = null
  const cnpj = onlyDigits(holderDocument.value)
  if (!cnpj) return
  if (!isValidCnpj(cnpj)) {
    cnpjLookupMessage.value = t('openFinance.wizard.validation.invalid_cnpj')
    return
  }

  cnpjLookupLoading.value = true
  try {
    const response = await BrasilApiService.getCnpj(cnpj)
    cnpjCompany.value = response.data
    holderDocument.value = cnpj
    applyCompanyData(response.data, Boolean(options.preserveExisting))
  } catch (error: any) {
    cnpjLookupMessage.value = error?.response?.data?.message || error?.message || t('openFinance.wizard.error.validate_cnpj')
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
    cepLookupMessage.value = t('openFinance.wizard.validation.cep_digits')
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
    cepLookupMessage.value = error?.response?.data?.message || error?.message || t('openFinance.wizard.error.lookup_cep')
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

.of-card-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: #64748b;
  font-size: 0.9rem;
}

.of-card-options__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
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
