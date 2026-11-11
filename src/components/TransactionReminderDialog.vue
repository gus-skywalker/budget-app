<template>
  <v-dialog
    :model-value="modelValue"
    max-width="520px"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card class="transaction-reminder-dialog">
      <v-card-title class="transaction-reminder-dialog__title">
        {{ $t('transactionReminder.title') }}
      </v-card-title>
      <v-card-subtitle v-if="transaction?.description" class="transaction-reminder-dialog__subtitle">
        {{ transaction.description }}
      </v-card-subtitle>
      <v-divider />

      <v-card-text>
        <div v-if="state?.status === 'loading'" class="transaction-reminder-dialog__state">
          <v-progress-circular indeterminate color="var(--cb-primary)" size="28" />
          <span>{{ $t('transactionReminder.loading') }}</span>
        </div>

        <v-alert
          v-else-if="state?.status === 'error'"
          type="error"
          variant="tonal"
          density="comfortable"
        >
          <div class="transaction-reminder-dialog__alert">
            <span>{{ state.error || $t('transactionReminder.load_error') }}</span>
            <v-btn size="small" variant="text" color="error" @click="$emit('retry')">
              {{ $t('common.retry') }}
            </v-btn>
          </div>
        </v-alert>

        <template v-else>
          <p class="transaction-reminder-dialog__summary">
            {{ summaryLabel }}
          </p>

          <v-text-field
            v-model="localAlertDate"
            type="datetime-local"
            :label="$t('transactionReminder.alert_date')"
            variant="outlined"
            density="comfortable"
            color="var(--cb-primary)"
          />

          <div class="transaction-reminder-dialog__methods">
            <div class="transaction-reminder-dialog__methods-label">
              {{ $t('transactionReminder.methods') }}
            </div>
            <v-checkbox
              v-model="selectedMethods"
              value="INTERNAL"
              density="compact"
              hide-details
              :label="$t('transactionReminder.method_internal')"
            />
            <v-checkbox
              v-model="selectedMethods"
              value="EMAIL"
              density="compact"
              hide-details
              :label="$t('transactionReminder.method_email')"
            />
            <v-checkbox
              v-model="selectedMethods"
              value="SMS"
              density="compact"
              hide-details
              :label="$t('transactionReminder.method_sms')"
            />
          </div>

          <v-alert
            v-if="formError"
            type="warning"
            variant="tonal"
            density="compact"
            class="mt-3"
          >
            {{ formError }}
          </v-alert>
        </template>
      </v-card-text>

      <v-card-actions>
        <v-btn
          v-if="state?.status === 'loaded'"
          variant="text"
          color="error"
          :loading="deleting"
          :disabled="saving || deleting"
          @click="$emit('remove')"
        >
          {{ $t('transactionReminder.remove') }}
        </v-btn>
        <v-spacer />
        <v-btn variant="text" :disabled="saving || deleting" @click="$emit('update:modelValue', false)">
          {{ $t('common.cancel') }}
        </v-btn>
        <v-btn
          color="var(--cb-primary)"
          variant="flat"
          :loading="saving"
          :disabled="!canSubmit || deleting || state?.status === 'loading' || state?.status === 'error'"
          @click="submit"
        >
          {{ $t('common.save') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
const toDatetimeLocal = (value) => {
  if (!value) {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(9, 0, 0, 0)
    return new Date(tomorrow.getTime() - tomorrow.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16)
  }
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return String(value).slice(0, 16)
  }
  return new Date(parsed.getTime() - parsed.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16)
}

export default {
  name: 'TransactionReminderDialog',
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    transaction: {
      type: Object,
      default: null,
    },
    state: {
      type: Object,
      default: () => ({ status: 'notLoaded', reminder: null, error: null }),
    },
    saving: {
      type: Boolean,
      default: false,
    },
    deleting: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue', 'save', 'remove', 'retry'],
  data() {
    return {
      localAlertDate: toDatetimeLocal(null),
      selectedMethods: ['INTERNAL'],
      formError: '',
    }
  },
  computed: {
    summaryLabel() {
      if (this.state?.status === 'loaded' && this.state?.reminder?.alertDate) {
        return this.$t('transactionReminder.configured', {
          date: this.formatReminderDate(this.state.reminder.alertDate),
        })
      }
      return this.$t('transactionReminder.empty')
    },
    canSubmit() {
      return Boolean(this.localAlertDate) && this.selectedMethods.length > 0
    },
  },
  watch: {
    modelValue: {
      immediate: true,
      handler(value) {
        if (value) {
          this.syncFormFromState()
        }
      },
    },
    state: {
      deep: true,
      handler() {
        if (this.modelValue) {
          this.syncFormFromState()
        }
      },
    },
  },
  methods: {
    syncFormFromState() {
      this.formError = ''
      const reminder = this.state?.reminder
      this.localAlertDate = toDatetimeLocal(reminder?.alertDate)
      this.selectedMethods = Array.isArray(reminder?.methods) && reminder.methods.length
        ? [...reminder.methods]
        : ['INTERNAL']
    },
    submit() {
      this.formError = ''
      if (!this.localAlertDate) {
        this.formError = this.$t('transactionReminder.alert_date_required')
        return
      }
      if (!this.selectedMethods.length) {
        this.formError = this.$t('transactionReminder.methods_required')
        return
      }
      const alertDate = new Date(this.localAlertDate).toISOString()
      this.$emit('save', {
        transactionId: this.transaction?.id,
        alertDate,
        methods: this.selectedMethods,
      })
    },
    formatReminderDate(value) {
      const parsed = new Date(value)
      if (Number.isNaN(parsed.getTime())) return value
      return new Intl.DateTimeFormat(this.formattingLocale(), {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(parsed)
    },
    formattingLocale() {
      const locale = this.$i18n?.locale || 'pt'
      if (locale === 'en') return 'en-US'
      if (locale === 'fr') return 'fr-FR'
      if (locale === 'es') return 'es-ES'
      return 'pt-BR'
    },
  },
}
</script>

<style scoped>
.transaction-reminder-dialog__title {
  font-family: var(--cb-font-heading);
  font-weight: 700;
}

.transaction-reminder-dialog__subtitle {
  color: var(--cb-ink-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.transaction-reminder-dialog__state {
  align-items: center;
  color: var(--cb-ink-muted);
  display: flex;
  gap: 12px;
  min-height: 84px;
}

.transaction-reminder-dialog__summary {
  color: var(--cb-ink);
  font-weight: 600;
  margin: 0 0 16px;
}

.transaction-reminder-dialog__methods {
  border: 1px solid rgba(23, 32, 51, 0.1);
  border-radius: 8px;
  padding: 10px 12px;
}

.transaction-reminder-dialog__methods-label {
  color: var(--cb-ink-muted);
  font-size: 0.78rem;
  font-weight: 700;
  margin-bottom: 4px;
  text-transform: uppercase;
}

.transaction-reminder-dialog__alert {
  align-items: center;
  display: flex;
  gap: 8px;
  justify-content: space-between;
}
</style>
