<template>
  <v-list-item class="income-item" @click="handleSelect">
    <v-row align="center">
      <v-col cols="9" md="8">
        <v-list-item-title>
          {{ income.description }}
        </v-list-item-title>
        <v-list-item-subtitle>
          {{ $t('incomeItem.amount') }} {{ income.amount }} - {{ $t('incomeItem.date') }}: {{ income.date }}
        </v-list-item-subtitle>
        <div v-if="income.openFinance || income.reconciliationStatus" class="status-row">
          <v-chip
            v-if="income.openFinance"
            color="#667eea"
            size="small"
            variant="tonal"
            class="mt-1"
          >
            {{ $t('incomeItem.open_finance') }}
          </v-chip>
          <v-chip
            v-if="income.reconciliationStatus"
            :color="reconciliationColor"
            size="small"
            variant="tonal"
            class="mt-1"
          >
            {{ reconciliationLabel }}
          </v-chip>
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
      <v-col cols="3" md="4" class="d-flex justify-end align-center income-actions">
        <v-btn
          x-small
          icon
          height="32px"
          width="32px"
          @click.stop="handleToggleRecurring"
          color="primary"
          class="mr-2"
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
  emits: ['toggle-recurring', 'deleteIncome', 'select', 'resolveConflict'],
  data() {
    return {
      recurrenceDialog: false,
      selectedMonths: 1,
      monthsOptions: [1, 3, 6, 12] // opções de meses
    }
  },
  computed: {
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
  gap: 6px;
  margin-top: 6px;
}

.conflict-resolution-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 8px 0 4px;
}
</style>
