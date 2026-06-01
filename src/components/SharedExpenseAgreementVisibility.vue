<template>
  <div v-if="agreements.length" class="agreement-visibility">
    <div
      v-for="agreement in agreements"
      :key="agreement.id"
      class="agreement-visibility__item"
    >
      <div class="agreement-visibility__header">
        <div>
          <strong>{{ agreement.title }}</strong>
          <span>{{ agreementSubtitle(agreement) }}</span>
        </div>
        <v-chip size="x-small" :color="deliveryColor(agreement.emailDeliveryStatus)" variant="tonal">
          <v-icon start size="13">{{ deliveryIcon(agreement.emailDeliveryStatus) }}</v-icon>
          {{ deliveryLabel(agreement) }}
        </v-chip>
      </div>

      <div class="agreement-visibility__participants">
        <div
          v-for="participant in normalizedParticipants(agreement)"
          :key="participantKey(participant)"
          class="agreement-visibility__participant"
        >
          <div class="agreement-visibility__person">
            <v-icon size="16">mdi-account-outline</v-icon>
            <span>{{ participantLabel(participant) }}</span>
          </div>
          <strong>{{ formatCurrency(participant.sharedAmount) }}</strong>
          <small>{{ participantObligationLabel(agreement, participant.id) }}</small>
        </div>
      </div>

      <div v-if="agreement.emailDeliveryErrors?.length" class="agreement-visibility__errors">
        <v-icon size="15">mdi-alert-circle-outline</v-icon>
        <span>{{ agreement.emailDeliveryErrors.join('; ') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type {
  SharedExpenseAgreement,
  SharedExpenseParticipant,
  SharedExpenseObligation,
} from '@/services/SharedExpenseAgreementService'

const props = defineProps<{
  agreements: SharedExpenseAgreement[]
}>()

const { locale, t } = useI18n()

const agreements = computed(() => Array.isArray(props.agreements) ? props.agreements : [])

const normalizedParticipants = (agreement: SharedExpenseAgreement): SharedExpenseParticipant[] => {
  if (Array.isArray(agreement.participants) && agreement.participants.length) {
    return agreement.participants
  }
  if (agreement.counterpartyEmail) {
    return [{
      id: `${agreement.id}:legacy`,
      agreementId: agreement.id,
      email: agreement.counterpartyEmail,
      sharedAmount: agreement.sharedAmount,
    }]
  }
  return []
}

const agreementSubtitle = (agreement: SharedExpenseAgreement) => {
  const count = normalizedParticipants(agreement).length
  const total = formatCurrency(agreement.sharedAmount)
  const installments = Number(agreement.installmentCount || 1)
  const installmentLabel = installments > 1
    ? t('sharedExpenseAgreement.visibility.installmentsCount', { count: installments })
    : t('sharedExpenseAgreement.visibility.singleInstallment')
  return t('sharedExpenseAgreement.visibility.subtitle', { count, total, installments: installmentLabel })
}

const participantLabel = (participant: SharedExpenseParticipant) => {
  return participant.displayName || participant.email || participant.userId || t('sharedExpenseAgreement.visibility.participant')
}

const participantKey = (participant: SharedExpenseParticipant) => {
  return String(participant.id || participant.email || participant.userId || 'participant')
}

const participantObligationLabel = (agreement: SharedExpenseAgreement, participantId?: string | null) => {
  const obligations = participantObligations(agreement, participantId)
  if (!obligations.length) {
    return t('sharedExpenseAgreement.visibility.noObligations')
  }
  const next = obligations.find((item) => ['PENDING', 'REMINDED', 'PAID_REPORTED'].includes(item.status)) || obligations[0]
  return t('sharedExpenseAgreement.visibility.nextDue', {
    installment: `${next.installmentNumber}/${obligations.length}`,
    dueDate: next.dueDate || t('sharedExpenseAgreement.noDueDate'),
  })
}

const participantObligations = (agreement: SharedExpenseAgreement, participantId?: string | null): SharedExpenseObligation[] => {
  const obligations = Array.isArray(agreement.obligations) ? agreement.obligations : []
  if (!participantId) return obligations
  return obligations.filter((obligation) => obligation.participantId === participantId)
}

const deliveryLabel = (agreement: SharedExpenseAgreement) => {
  const status = agreement.emailDeliveryStatus || 'NOT_ATTEMPTED'
  if (status === 'SENT') {
    return t('sharedExpenseAgreement.visibility.delivery.sent', { count: agreement.emailDeliveryCount || 0 })
  }
  if (status === 'PARTIAL') {
    return t('sharedExpenseAgreement.visibility.delivery.partial', { count: agreement.emailDeliveryCount || 0 })
  }
  return t(`sharedExpenseAgreement.visibility.delivery.${status.toLowerCase()}`)
}

const deliveryColor = (status?: string) => {
  if (status === 'SENT') return 'success'
  if (status === 'PARTIAL') return 'warning'
  if (status === 'FAILED') return 'error'
  if (status === 'SKIPPED') return 'grey'
  return 'var(--cb-primary)'
}

const deliveryIcon = (status?: string) => {
  if (status === 'SENT') return 'mdi-email-check-outline'
  if (status === 'PARTIAL') return 'mdi-email-alert-outline'
  if (status === 'FAILED') return 'mdi-email-remove-outline'
  if (status === 'SKIPPED') return 'mdi-email-off-outline'
  return 'mdi-email-outline'
}

const formattingLocale = computed(() => {
  if (locale.value === 'en') return 'en-US'
  if (locale.value === 'fr') return 'fr-FR'
  if (locale.value === 'es') return 'es-ES'
  return 'pt-BR'
})

const formatCurrency = (value: number | string | null | undefined) => {
  const number = Number(value || 0)
  return new Intl.NumberFormat(formattingLocale.value, {
    style: 'currency',
    currency: 'BRL',
  }).format(Number.isFinite(number) ? number : 0)
}
</script>

<style scoped>
.agreement-visibility {
  display: grid;
  gap: 8px;
  margin-top: 8px;
}

.agreement-visibility__item {
  border: 1px solid rgba(15, 118, 110, 0.14);
  background: rgba(15, 118, 110, 0.04);
  border-radius: 8px;
  padding: 10px;
}

.agreement-visibility__header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 8px;
}

.agreement-visibility__header div {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.agreement-visibility__header strong {
  font-size: 0.86rem;
  color: #172033;
  overflow-wrap: anywhere;
}

.agreement-visibility__header span,
.agreement-visibility__participant small {
  color: #64748b;
  font-size: 0.76rem;
}

.agreement-visibility__participants {
  display: grid;
  gap: 6px;
}

.agreement-visibility__participant {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 6px 12px;
  align-items: center;
  background: rgba(255, 255, 255, 0.72);
  border-radius: 7px;
  padding: 8px 10px;
}

.agreement-visibility__participant small {
  grid-column: 1 / -1;
}

.agreement-visibility__person {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  color: #334155;
}

.agreement-visibility__person span {
  overflow-wrap: anywhere;
}

.agreement-visibility__errors {
  display: flex;
  gap: 6px;
  color: #b42318;
  font-size: 0.76rem;
  margin-top: 8px;
}

.v-theme--dark .agreement-visibility__header strong,
.v-theme--dark .agreement-visibility__person {
  color: #e2e8f0;
}

.v-theme--dark .agreement-visibility__header span,
.v-theme--dark .agreement-visibility__participant small {
  color: #cbd5e1;
}

.v-theme--dark .agreement-visibility__participant {
  background: rgba(15, 23, 42, 0.42);
}
</style>
