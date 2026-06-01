<template>
  <main class="shared-with-me-page">
    <header class="shared-header">
      <div>
        <span class="section-kicker">{{ t('sharedWithMe.kicker') }}</span>
        <h1>{{ t('sharedWithMe.title') }}</h1>
        <p>{{ t('sharedWithMe.subtitle') }}</p>
      </div>
      <v-btn
        icon
        variant="text"
        :title="t('sharedWithMe.refresh')"
        :loading="loading"
        @click="loadReceivedAgreements"
      >
        <v-icon>mdi-refresh</v-icon>
      </v-btn>
    </header>

    <section v-if="loading" class="shared-state">
      <v-progress-circular indeterminate color="var(--cb-primary)" />
    </section>

    <section v-else-if="errorMessage" class="shared-state shared-state--error">
      <v-icon size="34">mdi-alert-circle-outline</v-icon>
      <p>{{ errorMessage }}</p>
      <v-btn color="var(--cb-primary)" variant="tonal" @click="loadReceivedAgreements">
        {{ t('sharedWithMe.tryAgain') }}
      </v-btn>
    </section>

    <section v-else-if="!agreements.length" class="shared-state">
      <v-icon size="42">mdi-handshake-outline</v-icon>
      <h2>{{ t('sharedWithMe.emptyTitle') }}</h2>
      <p>{{ t('sharedWithMe.emptyText') }}</p>
    </section>

    <section v-else class="agreement-list" aria-live="polite">
      <article v-for="agreement in agreements" :key="agreement.id" class="agreement-item">
        <div class="agreement-main">
          <div>
            <div class="agreement-title-row">
              <v-icon size="20">mdi-handshake-outline</v-icon>
              <h2>{{ agreement.title }}</h2>
            </div>
            <p class="agreement-meta">
              {{ participantSummary(agreement) }} · {{ paymentModeLabel(agreement.paymentMode) }}
            </p>
          </div>
          <strong>{{ formatCurrency(myShare(agreement)) }}</strong>
        </div>

        <div class="agreement-details">
          <div>
            <span>{{ t('sharedWithMe.total') }}</span>
            <strong>{{ formatCurrency(agreement.totalAmount) }}</strong>
          </div>
          <div>
            <span>{{ t('sharedWithMe.firstDueDate') }}</span>
            <strong>{{ agreement.dueDate || t('sharedExpenseAgreement.noDueDate') }}</strong>
          </div>
          <div>
            <span>{{ t('sharedWithMe.installments') }}</span>
            <strong>{{ agreement.installmentCount || 1 }}</strong>
          </div>
        </div>

        <div class="obligation-list">
          <div
            v-for="obligation in myObligations(agreement)"
            :key="obligation.id"
            class="obligation-row"
          >
            <span>{{ t('sharedWithMe.installment', { number: obligation.installmentNumber }) }}</span>
            <strong>{{ formatCurrency(obligation.amount) }}</strong>
            <small>{{ obligation.dueDate || t('sharedExpenseAgreement.noDueDate') }}</small>
          </div>
        </div>
      </article>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/plugins/userStore'
import SharedExpenseAgreementService, {
  type SharedExpenseAgreement,
  type SharedExpenseObligation,
  type SharedExpensePaymentMode,
} from '@/services/SharedExpenseAgreementService'

const { locale, t } = useI18n()
const userStore = useUserStore()
const agreements = ref<SharedExpenseAgreement[]>([])
const loading = ref(false)
const errorMessage = ref('')

const currentUserEmail = computed(() => String(userStore.getUser?.email || '').trim().toLowerCase())
const currentUserId = computed(() => {
  const user = userStore.getUser as { userId?: string; id?: string } | null
  return String(user?.userId || user?.id || '').trim()
})

onMounted(() => {
  loadReceivedAgreements()
})

const loadReceivedAgreements = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    const response = await SharedExpenseAgreementService.listReceived()
    agreements.value = Array.isArray(response.data) ? response.data : []
  } catch (error) {
    console.error('Erro ao carregar combinados recebidos:', error)
    errorMessage.value = t('sharedWithMe.loadError')
  } finally {
    loading.value = false
  }
}

const myParticipant = (agreement: SharedExpenseAgreement) => {
  const participants = Array.isArray(agreement.participants) ? agreement.participants : []
  return participants.find((participant) => {
    const userId = String(participant.userId || '').trim()
    const email = String(participant.email || '').trim().toLowerCase()
    return (currentUserId.value && userId === currentUserId.value)
      || (currentUserEmail.value && email === currentUserEmail.value)
  }) || participants[0]
}

const myShare = (agreement: SharedExpenseAgreement) => myParticipant(agreement)?.sharedAmount || agreement.sharedAmount

const myObligations = (agreement: SharedExpenseAgreement): SharedExpenseObligation[] => {
  const participant = myParticipant(agreement)
  const obligations = Array.isArray(agreement.obligations) ? agreement.obligations : []
  if (!participant?.id) return obligations
  return obligations.filter((obligation) => obligation.participantId === participant.id)
}

const participantSummary = (agreement: SharedExpenseAgreement) => {
  const participant = myParticipant(agreement)
  return participant?.email || participant?.displayName || t('sharedWithMe.you')
}

const paymentModeLabel = (mode: SharedExpensePaymentMode) => {
  const key = {
    PIX_REIMBURSEMENT: 'pixReimbursement',
    DEBIT: 'debit',
    CREDIT_CARD: 'creditCard',
    OTHER: 'other',
  }[mode]
  return t(`sharedExpenseAgreement.paymentModes.${key}`)
}

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

const toNumber = (value: number | string | null | undefined) => {
  const number = Number(value || 0)
  return Number.isFinite(number) ? Math.abs(number) : 0
}
</script>

<style scoped>
.shared-with-me-page {
  display: grid;
  gap: 18px;
  padding: 28px;
}

.shared-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}

.section-kicker {
  display: inline-block;
  margin-bottom: 6px;
  color: var(--cb-primary);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.shared-header h1 {
  margin: 0;
  font-size: 28px;
  line-height: 1.2;
}

.shared-header p,
.agreement-meta,
.shared-state p {
  margin: 6px 0 0;
  color: var(--cb-ink-muted);
}

.agreement-list {
  display: grid;
  gap: 12px;
}

.agreement-item {
  display: grid;
  gap: 14px;
  border: 1px solid var(--cb-border-card);
  background: var(--cb-surface-soft);
  border-radius: 8px;
  padding: 16px;
}

.agreement-main,
.agreement-details,
.obligation-row,
.agreement-title-row {
  display: flex;
  align-items: center;
}

.agreement-main {
  justify-content: space-between;
  gap: 16px;
}

.agreement-title-row {
  gap: 8px;
}

.agreement-title-row h2 {
  margin: 0;
  font-size: 18px;
  line-height: 1.25;
}

.agreement-main > strong {
  font-size: 20px;
  white-space: nowrap;
}

.agreement-details {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.agreement-details div,
.obligation-row {
  background: var(--cb-surface);
  border-radius: 8px;
  padding: 10px 12px;
}

.agreement-details span,
.obligation-row small {
  color: var(--cb-ink-muted);
  font-size: 13px;
}

.agreement-details div {
  display: grid;
  gap: 4px;
}

.obligation-list {
  display: grid;
  gap: 8px;
}

.obligation-row {
  justify-content: space-between;
  gap: 10px;
}

.shared-state {
  display: grid;
  place-items: center;
  gap: 10px;
  min-height: 260px;
  text-align: center;
  color: var(--cb-ink-muted);
}

.shared-state h2 {
  margin: 0;
  color: var(--cb-ink);
}

.shared-state--error {
  color: #b91c1c;
}

@media (max-width: 760px) {
  .shared-with-me-page {
    padding: 18px;
  }

  .shared-header,
  .agreement-main {
    align-items: stretch;
    flex-direction: column;
  }

  .agreement-details {
    grid-template-columns: 1fr;
  }
}
</style>
