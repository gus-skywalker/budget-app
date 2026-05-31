<template>
  <v-dialog v-model="isOpen" max-width="720">
    <v-card>
      <v-card-title class="agreement-title">
        <span>{{ t('sharedExpenseAgreement.title') }}</span>
        <v-chip size="small" variant="tonal" color="#667eea">
          {{ formatCurrency(transactionAmount) }}
        </v-chip>
      </v-card-title>

      <v-card-text>
        <div class="agreement-stepper" role="tablist" :aria-label="t('sharedExpenseAgreement.stepsLabel')">
          <v-btn
            v-for="item in localizedSteps"
            :key="item.value"
            size="small"
            :variant="step === item.value ? 'flat' : 'tonal'"
            :color="step === item.value ? '#667eea' : undefined"
            @click="step = item.value"
          >
            <v-icon start size="16">{{ item.icon }}</v-icon>
            {{ item.label }}
          </v-btn>
        </div>

        <v-window v-model="step" class="agreement-window">
          <v-window-item :value="1">
            <div class="agreement-section">
              <v-text-field
                v-model.trim="participantDraft"
                :label="t('sharedExpenseAgreement.participantEmail')"
                type="email"
                variant="outlined"
                density="comfortable"
                :rules="emailRules"
                autocomplete="email"
                @keyup.enter="addParticipant"
              >
                <template #append-inner>
                  <v-btn
                    icon
                    size="small"
                    variant="text"
                    :disabled="!draftEmailIsValid"
                    :title="t('sharedExpenseAgreement.addParticipant')"
                    @click.stop="addParticipant"
                  >
                    <v-icon size="18">mdi-plus</v-icon>
                  </v-btn>
                </template>
              </v-text-field>
              <div v-if="form.participants.length" class="agreement-participants">
                <v-chip
                  v-for="participant in form.participants"
                  :key="participant.email"
                  closable
                  color="#0f766e"
                  variant="tonal"
                  @click:close="removeParticipant(participant.email)"
                >
                  <v-icon start size="14">mdi-email-outline</v-icon>
                  {{ participant.email }}
                </v-chip>
              </div>
              <v-text-field
                v-model.trim="form.title"
                :label="t('sharedExpenseAgreement.agreementName')"
                variant="outlined"
                density="comfortable"
              />
              <v-textarea
                v-model.trim="form.notes"
                :label="t('sharedExpenseAgreement.notes')"
                variant="outlined"
                density="comfortable"
                rows="2"
                auto-grow
              />
            </div>
          </v-window-item>

          <v-window-item :value="2">
            <div class="agreement-section">
              <v-btn-toggle
                v-model="form.splitType"
                class="agreement-toggle"
                density="comfortable"
                mandatory
                divided
              >
                <v-btn value="EQUAL_SPLIT">
                  <v-icon start size="16">mdi-call-split</v-icon>
                  {{ t('sharedExpenseAgreement.split.equal') }}
                </v-btn>
                <v-btn value="FIXED_AMOUNT">
                  <v-icon start size="16">mdi-currency-brl</v-icon>
                  {{ t('sharedExpenseAgreement.split.fixed') }}
                </v-btn>
                <v-btn value="PERCENTAGE">
                  <v-icon start size="16">mdi-percent-outline</v-icon>
                  {{ t('sharedExpenseAgreement.split.percentage') }}
                </v-btn>
              </v-btn-toggle>

              <div class="agreement-grid">
                <v-select
                  v-model="form.paymentMode"
                  :items="paymentModes"
                  :label="t('sharedExpenseAgreement.paymentMode')"
                  variant="outlined"
                  density="comfortable"
                />
              </div>

              <div class="agreement-participant-shares">
                <div
                  v-for="participant in form.participants"
                  :key="participant.email"
                  class="agreement-participant-share"
                >
                  <span>{{ participant.email }}</span>
                  <strong v-if="form.splitType === 'EQUAL_SPLIT'">
                    {{ formatCurrency(participantShareAmount(participant)) }}
                  </strong>
                  <v-text-field
                    v-else-if="form.splitType === 'FIXED_AMOUNT'"
                    v-model.number="participant.sharedAmount"
                    :label="t('sharedExpenseAgreement.sharedAmount')"
                    type="number"
                    min="0"
                    step="0.01"
                    prefix="R$"
                    variant="outlined"
                    density="compact"
                    hide-details
                  />
                  <v-text-field
                    v-else
                    v-model.number="participant.percentage"
                    :label="t('sharedExpenseAgreement.percentage')"
                    type="number"
                    min="1"
                    max="100"
                    step="0.01"
                    suffix="%"
                    variant="outlined"
                    density="compact"
                    hide-details
                  />
                </div>
              </div>

              <div class="agreement-preview">
                <span>{{ t('sharedExpenseAgreement.resolvedShare') }}</span>
                <strong>{{ formatCurrency(resolvedSharedAmount) }}</strong>
              </div>
            </div>
          </v-window-item>

          <v-window-item :value="3">
            <div class="agreement-section">
              <div class="agreement-grid">
                <v-text-field
                  v-model="form.dueDate"
                  :label="t('sharedExpenseAgreement.firstDueDate')"
                  type="date"
                  variant="outlined"
                  density="comfortable"
                />
                <v-text-field
                  v-model.number="form.reminderDaysBefore"
                  :label="t('sharedExpenseAgreement.remindBefore')"
                  type="number"
                  min="0"
                  max="30"
                  :suffix="t('sharedExpenseAgreement.daysSuffix')"
                  variant="outlined"
                  density="comfortable"
                />
                <v-text-field
                  v-model.number="form.installmentCount"
                  :label="t('sharedExpenseAgreement.installments')"
                  type="number"
                  min="1"
                  max="48"
                  variant="outlined"
                  density="comfortable"
                />
              </div>

              <div class="agreement-obligations">
                <div
                  v-for="item in installmentPreview"
                  :key="item.installmentNumber"
                  class="agreement-obligation"
                >
                  <span>{{ item.installmentNumber }}/{{ installmentPreview.length }}</span>
                  <strong>{{ formatCurrency(item.amount) }}</strong>
                  <small>{{ item.dueDate || t('sharedExpenseAgreement.noDueDate') }}</small>
                </div>
              </div>
            </div>
          </v-window-item>
        </v-window>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="close">{{ t('common.cancel') }}</v-btn>
        <v-btn v-if="step > 1" variant="text" @click="step -= 1">{{ t('sharedExpenseAgreement.back') }}</v-btn>
        <v-btn v-if="step < 3" color="#667eea" :disabled="!canContinue" @click="step += 1">
          {{ t('sharedExpenseAgreement.continue') }}
        </v-btn>
        <v-btn
          v-else
          color="#667eea"
          :loading="submitting"
          :disabled="!canSubmit"
          @click="submit"
        >
          {{ isEditing ? t('sharedExpenseAgreement.save') : t('sharedExpenseAgreement.create') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import SharedExpenseAgreementService, {
  type SharedExpenseAgreement,
  type SharedExpensePaymentMode,
  type SharedExpenseSplitType,
} from '@/services/SharedExpenseAgreementService'

const { locale, t } = useI18n()

const props = defineProps<{
  modelValue: boolean
  expense: {
    id: string
    amount: number | string
    description?: string
    date?: string
  }
  agreement?: SharedExpenseAgreement | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  created: [agreement: SharedExpenseAgreement]
  updated: [agreement: SharedExpenseAgreement]
  error: [error: unknown]
}>()

const steps = [
  { value: 1, labelKey: 'sharedExpenseAgreement.steps.participant', icon: 'mdi-account-heart-outline' },
  { value: 2, labelKey: 'sharedExpenseAgreement.steps.split', icon: 'mdi-scale-balance' },
  { value: 3, labelKey: 'sharedExpenseAgreement.steps.tracking', icon: 'mdi-bell-check-outline' },
]

const localizedSteps = computed(() => steps.map((item) => ({
  ...item,
  label: t(item.labelKey),
})))

const paymentModes = computed<Array<{ title: string; value: SharedExpensePaymentMode }>>(() => [
  { title: t('sharedExpenseAgreement.paymentModes.pixReimbursement'), value: 'PIX_REIMBURSEMENT' },
  { title: t('sharedExpenseAgreement.paymentModes.debit'), value: 'DEBIT' },
  { title: t('sharedExpenseAgreement.paymentModes.creditCard'), value: 'CREDIT_CARD' },
  { title: t('sharedExpenseAgreement.paymentModes.other'), value: 'OTHER' },
])

const step = ref(1)
const submitting = ref(false)
const participantDraft = ref('')
const hydrating = ref(false)

interface LocalParticipant {
  email: string
  sharedAmount: number | null
  percentage: number | null
}

const form = reactive({
  participants: [] as LocalParticipant[],
  title: '',
  notes: '',
  splitType: 'EQUAL_SPLIT' as SharedExpenseSplitType,
  paymentMode: 'PIX_REIMBURSEMENT' as SharedExpensePaymentMode,
  installmentCount: 1,
  dueDate: '',
  reminderDaysBefore: 2,
})

const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

const transactionAmount = computed(() => toNumber(props.expense?.amount))
const isEditing = computed(() => Boolean(props.agreement?.id))

const resolvedSharedAmount = computed(() => {
  return roundMoney(form.participants.reduce((sum, participant) => {
    return sum + participantShareAmount(participant)
  }, 0))
})

const draftEmailIsValid = computed(() => isEmailValid(participantDraft.value))
const hasParticipants = computed(() => form.participants.length > 0)
const amountIsValid = computed(() => resolvedSharedAmount.value > 0 && resolvedSharedAmount.value <= transactionAmount.value)
const installmentCount = computed(() => Math.max(1, Math.min(48, Number(form.installmentCount || 1))))

const canContinue = computed(() => {
  if (step.value === 1) return hasParticipants.value
  if (step.value === 2) return amountIsValid.value
  return true
})

const canSubmit = computed(() => {
  return hasParticipants.value
    && amountIsValid.value
    && installmentCount.value > 0
    && Number(form.reminderDaysBefore || 0) >= 0
    && !submitting.value
})

const emailRules = [
  () => hasParticipants.value || !!participantDraft.value || t('sharedExpenseAgreement.validation.participantsRequired'),
  (value: string) => !value || isEmailValid(value) || t('sharedExpenseAgreement.validation.emailInvalid'),
]

const installmentPreview = computed(() => {
  const count = installmentCount.value
  const amount = resolvedSharedAmount.value
  const base = Math.floor((amount / count) * 100) / 100
  const remainder = roundMoney(amount - base * count)

  return Array.from({ length: count }, (_, index) => ({
    installmentNumber: index + 1,
    amount: roundMoney(base + (index === 0 ? remainder : 0)),
    dueDate: installmentDueDate(form.dueDate, index, form.paymentMode),
  }))
})

watch(() => props.modelValue, (value) => {
  if (value) {
    hydrateForm()
  }
})

watch(() => form.splitType, (newSplitType, oldSplitType) => {
  if (hydrating.value) return
  convertParticipantShares(newSplitType, oldSplitType)
})

watch(() => props.agreement?.id, () => {
  if (props.modelValue) {
    hydrateForm()
  }
})

const hydrateForm = () => {
  if (props.agreement) {
    resetFormFromAgreement(props.agreement)
    return
  }
  resetForm()
}

const resetForm = () => {
  hydrating.value = true
  step.value = 1
  participantDraft.value = ''
  form.participants = []
  form.title = defaultTitle()
  form.notes = ''
  form.splitType = 'EQUAL_SPLIT'
  form.paymentMode = 'PIX_REIMBURSEMENT'
  form.installmentCount = 1
  form.dueDate = props.expense?.date || new Date().toISOString().slice(0, 10)
  form.reminderDaysBefore = 2
  hydrating.value = false
}

const resetFormFromAgreement = (agreement: SharedExpenseAgreement) => {
  hydrating.value = true
  step.value = 1
  participantDraft.value = ''
  form.participants = (agreement.participants || []).map((participant) => ({
    email: String(participant.email || '').trim().toLowerCase(),
    sharedAmount: toNumber(participant.sharedAmount),
    percentage: participant.percentage == null ? null : toNumber(participant.percentage),
  })).filter((participant) => Boolean(participant.email))
  form.title = agreement.title || defaultTitle()
  form.notes = agreement.notes || ''
  form.splitType = resolveAgreementSplitType(agreement, form.participants)
  form.paymentMode = agreement.paymentMode || 'PIX_REIMBURSEMENT'
  form.installmentCount = Number(agreement.installmentCount || 1)
  form.dueDate = agreement.dueDate || props.expense?.date || new Date().toISOString().slice(0, 10)
  form.reminderDaysBefore = Number(agreement.obligations?.[0]?.reminderDaysBefore ?? 2)
  hydrating.value = false
}

const resolveAgreementSplitType = (
  agreement: SharedExpenseAgreement,
  participants: LocalParticipant[],
): SharedExpenseSplitType => {
  const savedSplitType = agreement.splitType || 'EQUAL_SPLIT'
  if (savedSplitType !== 'EQUAL_SPLIT' || !participants.length) {
    return savedSplitType
  }

  const equalShare = roundMoney(transactionAmount.value / (participants.length + 1))
  const matchesEqualSplit = participants.every((participant) => {
    return Math.abs(roundMoney(Number(participant.sharedAmount || 0)) - equalShare) < 0.01
  })

  return matchesEqualSplit ? 'EQUAL_SPLIT' : 'FIXED_AMOUNT'
}

const close = () => {
  isOpen.value = false
}

const addParticipant = () => {
  const email = participantDraft.value.trim().toLowerCase()
  if (!isEmailValid(email)) return
  const exists = form.participants.some((participant) => participant.email === email)
  if (exists) {
    participantDraft.value = ''
    return
  }

  form.participants.push({
    email,
    sharedAmount: defaultParticipantAmount(),
    percentage: defaultParticipantPercentage(),
  })
  participantDraft.value = ''
  rebalanceParticipantShares()
}

const removeParticipant = (email: string) => {
  form.participants = form.participants.filter((participant) => participant.email !== email)
  rebalanceParticipantShares()
}

const convertParticipantShares = (
  newSplitType: SharedExpenseSplitType,
  oldSplitType: SharedExpenseSplitType | undefined,
) => {
  if (!form.participants.length) return

  form.participants = form.participants.map((participant) => {
    if (newSplitType === 'FIXED_AMOUNT') {
      return {
        ...participant,
        sharedAmount: resolveAmountForSplitChange(participant, oldSplitType),
      }
    }

    if (newSplitType === 'PERCENTAGE') {
      return {
        ...participant,
        percentage: resolvePercentageForSplitChange(participant, oldSplitType),
      }
    }

    return {
      ...participant,
      sharedAmount: defaultParticipantAmount(),
      percentage: defaultParticipantPercentage(),
    }
  })
}

const resolveAmountForSplitChange = (
  participant: LocalParticipant,
  oldSplitType: SharedExpenseSplitType | undefined,
) => {
  if (oldSplitType === 'PERCENTAGE') {
    return amountFromPercentage(participant.percentage)
  }
  if (oldSplitType === 'EQUAL_SPLIT') {
    return defaultParticipantAmount()
  }
  return roundMoney(Number(participant.sharedAmount || 0) || defaultParticipantAmount())
}

const resolvePercentageForSplitChange = (
  participant: LocalParticipant,
  oldSplitType: SharedExpenseSplitType | undefined,
) => {
  if (oldSplitType === 'FIXED_AMOUNT') {
    return percentageFromAmount(participant.sharedAmount)
  }
  if (oldSplitType === 'EQUAL_SPLIT') {
    return defaultParticipantPercentage()
  }
  return roundPercent(Number(participant.percentage || 0) || defaultParticipantPercentage())
}

const rebalanceParticipantShares = () => {
  if (!form.participants.length) return
  const amount = defaultParticipantAmount()
  const percentage = defaultParticipantPercentage()
  form.participants = form.participants.map((participant) => ({
    ...participant,
    sharedAmount: form.splitType === 'FIXED_AMOUNT' ? amount : participant.sharedAmount,
    percentage: form.splitType === 'PERCENTAGE' ? percentage : participant.percentage,
  }))
}

const defaultParticipantAmount = () => roundMoney(transactionAmount.value / (form.participants.length + 1))
const defaultParticipantPercentage = () => roundMoney(100 / (form.participants.length + 1))
const amountFromPercentage = (percentage: number | null | undefined) => {
  return roundMoney(transactionAmount.value * (Number(percentage || 0) / 100))
}
const percentageFromAmount = (amount: number | null | undefined) => {
  if (transactionAmount.value <= 0) return 0
  return roundPercent((Number(amount || 0) / transactionAmount.value) * 100)
}

const participantShareAmount = (participant: LocalParticipant) => {
  if (form.splitType === 'EQUAL_SPLIT') {
    return roundMoney(transactionAmount.value / (form.participants.length + 1))
  }
  if (form.splitType === 'PERCENTAGE') {
    return amountFromPercentage(participant.percentage)
  }
  return roundMoney(Number(participant.sharedAmount || 0))
}

const submit = async () => {
  if (!canSubmit.value) return
  submitting.value = true
  try {
    const payload = {
      transactionId: props.expense.id,
      counterpartyEmail: form.participants[0]?.email ?? null,
      participants: form.participants.map((participant) => ({
        email: participant.email,
        sharedAmount: form.splitType === 'FIXED_AMOUNT' ? participantShareAmount(participant) : null,
        percentage: form.splitType === 'PERCENTAGE' ? Number(participant.percentage || 0) : null,
      })),
      splitType: form.splitType,
      sharedAmount: null,
      percentage: null,
      paymentMode: form.paymentMode,
      installmentCount: installmentCount.value,
      dueDate: form.dueDate || null,
      reminderDaysBefore: Number(form.reminderDaysBefore || 0),
      title: form.title || defaultTitle(),
      notes: form.notes || null,
    }
    const response = isEditing.value && props.agreement?.id
      ? await SharedExpenseAgreementService.update(props.agreement.id, payload)
      : await SharedExpenseAgreementService.create(payload)
    if (isEditing.value) {
      emit('updated', response.data)
    } else {
      emit('created', response.data)
    }
    close()
  } catch (error) {
    emit('error', error)
  } finally {
    submitting.value = false
  }
}

const defaultTitle = () => {
  const description = String(props.expense?.description || '').trim()
  return description
    ? t('sharedExpenseAgreement.defaultTitleWithDescription', { description })
    : t('sharedExpenseAgreement.title')
}

const toNumber = (value: number | string | null | undefined) => {
  if (typeof value === 'number') return Number.isFinite(value) ? Math.abs(value) : 0
  const normalized = String(value || '0')
    .replace(/[^\d,.-]/g, '')
    .replace(/\.(?=\d{3}(?:\D|$))/g, '')
    .replace(',', '.')
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? Math.abs(parsed) : 0
}

const roundMoney = (value: number) => Math.round((Number(value) || 0) * 100) / 100
const roundPercent = (value: number) => Math.round((Number(value) || 0) * 10000) / 10000

const isEmailValid = (value: string) => /.+@.+\..+/.test(String(value || '').trim())

const formatCurrency = (value: number | string) => new Intl.NumberFormat(formattingLocale.value, {
  style: 'currency',
  currency: 'BRL',
}).format(toNumber(value))

const formattingLocale = computed(() => {
  if (locale.value === 'en') return 'en-US'
  if (locale.value === 'fr') return 'fr-FR'
  if (locale.value === 'es') return 'es-ES'
  return 'pt-BR'
})

const installmentDueDate = (firstDueDate: string, index: number, paymentMode: SharedExpensePaymentMode) => {
  if (!firstDueDate) return ''
  if (paymentMode !== 'CREDIT_CARD') return firstDueDate
  const [year, month, day] = firstDueDate.split('-').map(Number)
  if (!year || !month || !day) return firstDueDate
  const date = new Date(year, month - 1 + index, day)
  return date.toISOString().slice(0, 10)
}
</script>

<style scoped>
.agreement-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.agreement-stepper {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 18px;
}

.agreement-window {
  min-height: 280px;
  padding-top: 14px;
  overflow: visible;
}

.agreement-window :deep(.v-window__container),
.agreement-window :deep(.v-window-item) {
  overflow: visible;
}

.agreement-section {
  display: grid;
  gap: 14px;
  padding-top: 4px;
}

.agreement-participants {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: -6px;
}

.agreement-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.agreement-toggle {
  align-self: start;
  flex-wrap: wrap;
}

.agreement-preview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border: 1px solid rgba(102, 126, 234, 0.16);
  background: rgba(102, 126, 234, 0.06);
  border-radius: 8px;
  padding: 12px 14px;
}

.agreement-preview span,
.agreement-obligation small {
  color: #64748b;
}

.agreement-participant-shares {
  display: grid;
  gap: 8px;
}

.agreement-participant-share {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(180px, 240px);
  align-items: center;
  gap: 12px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 8px;
  padding: 10px 12px;
}

.agreement-participant-share span {
  min-width: 0;
  overflow-wrap: anywhere;
  color: #475569;
}

.agreement-participant-share strong {
  text-align: right;
}

.agreement-obligations {
  display: grid;
  gap: 8px;
  max-height: 220px;
  overflow: auto;
}

.agreement-obligation {
  display: grid;
  grid-template-columns: 48px 1fr auto;
  align-items: center;
  gap: 12px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 8px;
  padding: 10px 12px;
}

.v-theme--dark .agreement-preview span,
.v-theme--dark .agreement-obligation small,
.v-theme--dark .agreement-participant-share span {
  color: #cbd5e1;
}

@media (max-width: 640px) {
  .agreement-grid {
    grid-template-columns: 1fr;
  }

  .agreement-participant-share {
    grid-template-columns: 1fr;
  }

  .agreement-participant-share strong {
    text-align: left;
  }

  .agreement-obligation {
    grid-template-columns: 40px 1fr;
  }

  .agreement-obligation small {
    grid-column: 1 / -1;
  }
}
</style>
