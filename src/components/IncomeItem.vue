<template>
  <v-list-item class="income-item" @click="handleSelect">
    <div class="income-item-layout">
      <div class="income-content">
        <div class="income-primary-row">
          <v-list-item-title class="income-description">
            {{ income.description }}
          </v-list-item-title>
          <span class="income-amount-text">{{ income.amount }}</span>
        </div>

        <div
          v-if="income.isRecurring || income.reconciliationStatus || income.excludedFromPlanning"
          class="income-status-row"
        >
          <v-chip
            v-if="income.isRecurring"
            color="blue"
            dark
            size="small"
            variant="tonal"
          >
            {{ $t('incomeItem.recurring_income') }}
          </v-chip>
          <v-chip
            v-if="income.reconciliationStatus"
            :color="reconciliationColor"
            size="small"
            variant="tonal"
          >
            {{ reconciliationLabel }}
          </v-chip>
          <v-chip
            v-if="income.excludedFromPlanning"
            size="small"
            color="warning"
            variant="tonal"
          >
            {{ $t('incomeItem.excludedFromPlanning') }}
          </v-chip>
        </div>

        <div class="income-meta-line">
          <span class="income-date-text">{{ income.date }}</span>
          <span v-if="income.openFinance" class="income-meta-tag income-meta-tag--origin">{{ $t('incomeItem.open_finance') }}</span>
          <span v-if="income.visibilityScope === 'PRIVATE'" class="income-meta-tag">{{ visibilityScopeLabel }}</span>
          <span v-if="paymentMethodLabel" class="income-meta-tag">{{ paymentMethodLabel }}</span>
        </div>

        <div v-if="income.openFinance && income.openFinanceSharingLabel" class="of-sharing-row income-detail-row">
          <v-chip size="x-small" variant="tonal" :color="openFinanceSharingColor">
            {{ income.openFinanceSharingLabel }}
          </v-chip>
        </div>
        <div v-if="income.reconciliationConflictId" class="conflict-resolution-row income-detail-row">
          <v-btn
            size="x-small"
            variant="outlined"
            color="var(--cb-primary)"
            :loading="resolvingAction === 'keep-existing'"
            :disabled="Boolean(resolvingAction)"
            @click.stop="$emit('resolveConflict', { income, action: 'keep-existing' })"
          >
            {{ $t('incomeItem.keep_existing') }}
          </v-btn>
          <v-btn
            size="x-small"
            variant="tonal"
            color="var(--cb-primary)"
            :loading="resolvingAction === 'create-new'"
            :disabled="Boolean(resolvingAction)"
            @click.stop="$emit('resolveConflict', { income, action: 'create-new' })"
          >
            {{ $t('incomeItem.create_new') }}
          </v-btn>
        </div>
      </div>

      <div class="income-btn-group">
        <v-btn
          v-if="income.visibilityScope === 'WORKSPACE'"
          icon
          size="x-small"
          variant="text"
          class="income-action-btn income-action-btn--share"
          @click.stop="$emit('openComments', income)"
        >
          <v-icon size="15">mdi-comment-text-outline</v-icon>
        </v-btn>
        <v-btn
          icon
          size="x-small"
          variant="text"
          class="income-action-btn income-action-btn--timer"
          @click.stop="handleToggleRecurring"
        >
          <v-icon size="15">{{ income.isRecurring ? 'mdi-star-outline' : 'mdi-star' }}</v-icon>
        </v-btn>
        <v-btn
          v-if="income.openFinance"
          icon
          size="x-small"
          variant="text"
          class="income-action-btn income-action-btn--planning"
          :title="income.excludedFromPlanning ? $t('incomeItem.restorePlanning') : $t('incomeItem.excludeFromPlanning')"
          @click.stop="$emit('togglePlanningExclusion', income)"
        >
          <v-icon size="15">{{ income.excludedFromPlanning ? 'mdi-plus-circle-outline' : 'mdi-minus-circle-outline' }}</v-icon>
        </v-btn>
        <v-btn
          v-else
          icon
          size="x-small"
          variant="text"
          class="income-action-btn income-action-btn--delete"
          @click.stop="$emit('deleteIncome', income)"
        >
          <v-icon size="15">mdi-delete</v-icon>
        </v-btn>
      </div>
    </div>

    <!-- Diálogo para escolher a quantidade de meses -->
    <v-dialog v-model="recurrenceDialog" persistent max-width="400px">
      <v-card>
        <v-card-title>{{ $t('incomeItem.choose_months') }}</v-card-title>
        <v-card-text>
          <v-select v-model="selectedMonths" :items="monthsOptions" :label="$t('incomeItem.month_count')" dense></v-select>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="closeRecurrenceDialog">{{ $t('common.cancel') }}</v-btn>
          <v-btn color="blue darken-1" text @click="confirmRecurrence">{{ $t('common.confirm') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-list-item>
</template>

<script>
export default {
  name: 'IncomeItem',
  props: {
    income: Object,
    resolvingAction: {
      type: String,
      default: null
    }
  },
  emits: ['toggle-recurring', 'deleteIncome', 'togglePlanningExclusion', 'select', 'resolveConflict', 'openComments'],
  data() {
    return {
      recurrenceDialog: false,
      selectedMonths: 1,
      monthsOptions: [1, 3, 6, 12] // opções de meses
    }
  },
  computed: {
    visibilityScopeLabel() {
      const scope = this.income?.visibilityScope === 'PRIVATE' ? 'private' : 'workspace'
      return this.$t(`transactionVisibility.${scope}`)
    },
    reconciliationLabel() {
      const status = this.income?.reconciliationStatus
      if (!status) return ''
      const key = `incomeItem.reconciliation.${status}`
      const translated = this.$t(key)
      return translated !== key ? translated : status
    },
    reconciliationColor() {
      const status = this.income?.reconciliationStatus
      if (status === 'CONFLICT_DUPLICATE') return 'warning'
      if (status === 'MATCHED_AND_CANCELLED') return 'error'
      return 'var(--cb-primary)'
    },
    openFinanceSharingColor() {
      const tone = this.income?.openFinanceSharingTone
      if (tone === 'shared') return 'success'
      if (tone === 'admin-shared') return 'info'
      if (tone === 'planning-only') return 'warning'
      if (tone === 'private') return 'grey'
      return 'var(--cb-primary)'
    },
    paymentMethodLabel() {
      if (this.income?.paymentMethodName) {
        return this.income.paymentMethodName
      }
      const paymentMethod = this.income?.paymentMethod
      if (paymentMethod && typeof paymentMethod === 'object') {
        return paymentMethod.name || ''
      }
      if (paymentMethod && typeof paymentMethod === 'string' && Number.isNaN(Number(paymentMethod))) {
        return paymentMethod
      }
      if (this.income?.openFinance && !this.income?.paymentMethodId) {
        return this.$t('transactions.payment_method_not_informed_open_finance')
      }
      return ''
    }
  },
  methods: {
    handleToggleRecurring() {
      if (this.income.isRecurring) {
        // Se já é recorrente, apenas alterna o status
        this.$emit('toggle-recurring', { income: this.income, months: 0 })
      } else {
        // Se não é recorrente, abre o diálogo para definir a recorrência
        this.recurrenceDialog = true
      }
    },
    handleSelect(event) {
      if (event?.defaultPrevented) {
        return
      }
      this.$emit('select', this.income)
    },
    closeRecurrenceDialog() {
      this.recurrenceDialog = false
    },
    confirmRecurrence() {
      this.$emit('toggle-recurring', { income: this.income, months: this.selectedMonths })
      this.closeRecurrenceDialog()
    }
  }
}
</script>

<style scoped>
.income-item {
  cursor: pointer;
}

.income-item-layout {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
}

.income-content {
  flex: 1 1 auto;
  min-width: 0;
}

.income-primary-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
}

.income-description {
  min-width: 0;
  color: var(--cb-ink);
  font-family: var(--cb-font-heading);
  font-size: 0.95rem;
  font-weight: 700;
  line-height: 1.35;
  white-space: normal;
}

.income-status-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
}

.income-btn-group {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex: 0 0 auto;
  flex-wrap: wrap;
  gap: 4px;
  max-width: 104px;
  margin-top: 2px;
  opacity: 0.38;
  transition: opacity 0.2s ease;
}

.income-item:hover .income-btn-group,
.income-item:focus-within .income-btn-group {
  opacity: 0.95;
}

.income-action-btn {
  min-width: 30px !important;
  width: 30px !important;
  height: 30px !important;
  border-radius: 8px !important;
  color: rgba(15, 23, 42, 0.46) !important;
  transition:
    color 0.18s ease,
    background-color 0.18s ease,
    opacity 0.18s ease;
}

.income-action-btn .v-icon {
  line-height: 30px;
  font-size: 16px !important;
  transition: color 0.18s ease;
}

.income-action-btn--share .v-icon {
  color: rgba(59, 130, 246, 0.74) !important;
}

.income-action-btn--timer .v-icon {
  color: rgba(249, 115, 22, 0.74) !important;
}

.income-action-btn--planning .v-icon {
  color: rgba(139, 92, 246, 0.74) !important;
}

.income-action-btn--delete .v-icon {
  color: rgba(239, 68, 68, 0.74) !important;
}

.income-action-btn:hover {
  color: rgba(15, 23, 42, 0.66) !important;
  background-color: rgba(15, 23, 42, 0.04) !important;
}

.income-action-btn:hover .v-icon {
  opacity: 1;
}

.income-action-btn--share:hover .v-icon {
  color: rgba(59, 130, 246, 0.92) !important;
}

.income-action-btn--timer:hover .v-icon {
  color: rgba(249, 115, 22, 0.92) !important;
}

.income-action-btn--planning:hover .v-icon {
  color: rgba(139, 92, 246, 0.92) !important;
}

.income-action-btn--delete:hover {
  background-color: rgba(198, 40, 40, 0.08) !important;
}

.income-action-btn--delete:hover .v-icon {
  color: rgba(239, 68, 68, 0.95) !important;
}

@media (max-width: 600px) {
  .income-btn-group {
    opacity: 1;
  }
}

.status-row {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 2px;
}

.conflict-resolution-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0;
}

.income-meta-line {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
}

.of-sharing-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 0;
}

.of-sharing-note {
  font-size: 0.76rem;
  color: rgba(0, 0, 0, 0.52);
  line-height: 1.4;
}

.income-date-text {
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.5);
}

.income-meta-tag {
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.45);
}

.income-meta-tag--origin {
  color: rgba(0, 0, 0, 0.36);
  font-weight: 500;
}

.income-meta-tag::before {
  content: '·';
  margin-right: 6px;
  color: rgba(0, 0, 0, 0.32);
}

.income-amount-text {
  color: var(--cb-ink);
  flex: 0 0 auto;
  font-family: var(--cb-font-heading);
  font-weight: 800;
  font-size: 0.98rem;
  line-height: 1.35;
  white-space: nowrap;
  text-align: right;
}

.income-detail-row {
  margin-top: 8px;
}

.v-theme--dark .income-date-text,
.v-theme--dark .income-meta-tag {
  color: rgba(255, 255, 255, 0.5);
}

.v-theme--dark .income-meta-tag::before {
  color: rgba(255, 255, 255, 0.32);
}

.v-theme--dark .of-sharing-note {
  color: rgba(255, 255, 255, 0.64);
}

@media (max-width: 600px) {
  .income-item-layout {
    flex-wrap: wrap;
    gap: 8px;
  }

  .income-primary-row {
    align-items: flex-start;
    gap: 10px;
  }

  .income-btn-group {
    width: 100%;
    max-width: none;
    justify-content: flex-start;
    margin-left: 0;
    margin-top: 4px;
    opacity: 0.72;
  }
}
</style>
