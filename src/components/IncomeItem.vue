<template>
  <v-list-item class="income-item" @click="handleSelect">
    <v-row align="center">
      <v-col cols="9" md="8">
        <v-list-item-title>
          {{ income.description }}
        </v-list-item-title>
        <div class="income-meta-line">
          <span class="income-date-text">{{ income.date }}</span>
          <span v-if="income.openFinance" class="income-meta-tag">· {{ $t('incomeItem.open_finance') }}</span>
          <span v-if="income.visibilityScope === 'PRIVATE'" class="income-meta-tag">· {{ visibilityScopeLabel }}</span>
          <v-chip v-if="income.reconciliationStatus" :color="reconciliationColor" size="x-small" variant="tonal" class="ml-1">{{ reconciliationLabel }}</v-chip>
        </div>
        <div v-if="income.reconciliationConflictId" class="conflict-resolution-row">
          <v-btn
            size="x-small"
            variant="outlined"
            color="#667eea"
            :loading="resolvingAction === 'keep-existing'"
            :disabled="Boolean(resolvingAction)"
            @click.stop="$emit('resolveConflict', { income, action: 'keep-existing' })"
          >
            {{ $t('incomeItem.keep_existing') }}
          </v-btn>
          <v-btn
            size="x-small"
            variant="tonal"
            color="#667eea"
            :loading="resolvingAction === 'create-new'"
            :disabled="Boolean(resolvingAction)"
            @click.stop="$emit('resolveConflict', { income, action: 'create-new' })"
          >
            {{ $t('incomeItem.create_new') }}
          </v-btn>
        </div>
        <v-chip
          v-if="income.isRecurring"
          color="blue"
          dark
          size="small"
          class="mt-1"
        >
          {{ $t('incomeItem.recurring_income') }}
        </v-chip>
      </v-col>
      <v-col cols="3" md="4" class="d-flex flex-column align-end income-actions">
        <span class="income-amount-text">{{ income.amount }}</span>
        <div class="d-flex align-center">
          <v-btn
            v-if="income.visibilityScope === 'WORKSPACE'"
            x-small
            icon
            height="32px"
            width="32px"
            class="mr-1"
            @click.stop="$emit('openComments', income)"
          >
            <v-icon size="16">mdi-comment-text-outline</v-icon>
          </v-btn>
          <v-btn
            x-small
            icon
            height="32px"
            width="32px"
            @click.stop="handleToggleRecurring"
            class="mr-1"
          >
            <v-icon size="16">{{ income.isRecurring ? 'mdi-star-outline' : 'mdi-star' }}</v-icon>
          </v-btn>
          <v-btn
            x-small
            icon
            height="32px"
            width="32px"
            color="red"
            @click.stop="$emit('deleteIncome', income)"
          >
            <v-icon size="16">mdi-delete</v-icon>
          </v-btn>
        </div>
      </v-col>
    </v-row>

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
  emits: ['toggle-recurring', 'deleteIncome', 'select', 'resolveConflict', 'openComments'],
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
      return '#667eea'
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

.income-actions .v-btn {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
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
  margin: 8px 0 4px;
}

.income-meta-line {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 2px;
}

.income-date-text {
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.5);
}

.income-meta-tag {
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.45);
}

.income-amount-text {
  font-weight: 600;
  font-size: 0.9rem;
  white-space: nowrap;
  margin-bottom: 4px;
}

.v-theme--dark .income-date-text,
.v-theme--dark .income-meta-tag {
  color: rgba(255, 255, 255, 0.5);
}
</style>
