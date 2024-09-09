<template>
  <v-list-item>
    <v-row align="center">
      <v-col>
        <v-list-item-title>
          {{ income.description }}
        </v-list-item-title>
        <v-list-item-subtitle>
          R$ {{ income.amount }} - Data: {{ income.date }}
        </v-list-item-subtitle>
      </v-col>
      <v-col class="d-flex justify-end">
        <v-chip v-if="income.isRecurring" color="blue" dark>Renda Recorrente</v-chip>
        <v-btn
          x-small
          icon
          height="35px"
          width="35px"
          @click="handleToggleRecurring"
          color="primary"
          class="mr-2"
        >
          <v-icon>{{ income.isRecurring ? 'mdi-star-outline' : 'mdi-star' }}</v-icon>
        </v-btn>
        <v-btn
          x-small
          icon
          height="35px"
          width="35px"
          color="red"
          @click="$emit('deleteIncome', income)"
        >
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </v-col>
    </v-row>

    <!-- Diálogo para escolher a quantidade de meses -->
    <v-dialog v-model="recurrenceDialog" persistent max-width="400px">
      <v-card>
        <v-card-title>Escolha a quantidade de meses</v-card-title>
        <v-card-text>
          <v-select
            v-model="selectedMonths"
            :items="monthsOptions"
            label="Quantidade de meses"
            dense
          ></v-select>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="closeRecurrenceDialog">Cancelar</v-btn>
          <v-btn color="blue darken-1" text @click="confirmRecurrence">Confirmar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-list-item>
</template>

<script>
export default {
  name: 'IncomeItem',
  props: {
    income: Object
  },
  data() {
    return {
      recurrenceDialog: false,
      selectedMonths: 1,
      monthsOptions: [1, 3, 6, 12] // opções de meses
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

<style>
.v-btn {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
}
</style>
