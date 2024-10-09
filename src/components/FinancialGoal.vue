<template>
  <v-container>
    <v-row>
      <v-col>
        <v-card class="pa-5">
          <v-card-title>
            <h2>Objetivos Financeiros</h2>
          </v-card-title>
          <v-card-text>
            <v-form v-if="isAddingOrEditing" @submit.prevent="submitGoalForm">
              <v-text-field label="Goal Name" v-model="goalForm.name" required outlined class="mb-4"></v-text-field>

              <v-text-field label="Target Amount" v-model="goalForm.targetAmount" type="number" required outlined
                class="mb-4"></v-text-field>

              <v-text-field label="Deadline" v-model="goalForm.deadline" type="date" required outlined
                class="mb-4"></v-text-field>

              <!-- Centralizar os botões em uma linha -->
              <v-row justify="center" class="mb-4">
                <v-col cols="auto">
                  <v-btn type="submit" color="primary">
                    {{ isEditing ? 'Atualiza' : 'Adiciona' }}
                  </v-btn>
                </v-col>
                <v-col cols="auto">
                  <v-btn type="button" @click="cancelEdit" color="secondary">
                    Cancela
                  </v-btn>
                </v-col>
              </v-row>

              <!-- Adiciona um divisor logo após os botões -->
              <v-divider></v-divider>
            </v-form>

            <!-- Botão para adicionar uma nova meta quando não estiver editando ou adicionando -->
            <v-btn v-if="!isAddingOrEditing" @click="addNewGoal" color="primary" class="mt-4">
              Novo Objetivo
            </v-btn>

            <!-- Lista de objetivos financeiros -->
            <v-list v-if="financialGoals.length" class="mt-4">
              <v-list-item v-for="goal in financialGoals" :key="goal.id" class="goal-item">
                <v-row align="center" class="w-200">
                  <v-col>
                    <v-list-item-title>{{ goal.name }}</v-list-item-title>
                    <v-list-item-subtitle>
                      Quantidade Almejada: ${{ goal.targetAmount }} | Data Limite: {{ goal.deadline }}
                    </v-list-item-subtitle>
                  </v-col>
                  <v-col class="d-flex justify-end">
                    <v-btn @click="editGoal(goal)" icon>
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn @click="deleteGoal(goal)" icon>
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
                <v-divider></v-divider>
              </v-list-item>
            </v-list>

            <!-- Alerta para quando não houver metas -->
            <v-alert v-else color="primary" type="info" class="mt-4"> Nenhum objetivo financeiro encontrado. </v-alert>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      financialGoals: [],
      isAddingOrEditing: false,
      isEditing: false,
      goalForm: {
        name: '',
        targetAmount: 0,
        deadline: ''
      },
      editedGoalId: null
    }
  },
  methods: {
    addNewGoal() {
      this.isAddingOrEditing = true
      this.isEditing = false
      this.goalForm = { name: '', targetAmount: 0, deadline: '' }
    },
    editGoal(goal) {
      this.isAddingOrEditing = true
      this.isEditing = true
      this.editedGoalId = goal.id

      this.goalForm = {
        name: goal.name,
        targetAmount: goal.targetAmount,
        deadline: goal.deadline
      }
    },
    cancelEdit() {
      this.isAddingOrEditing = false
      this.isEditing = false
      this.goalForm = { name: '', targetAmount: 0, deadline: '' }
    },
    submitGoalForm() {
      if (this.isEditing) {
        const editedGoalIndex = this.financialGoals.findIndex(
          (goal) => goal.id === this.editedGoalId
        )
        if (editedGoalIndex !== -1) {
          this.financialGoals[editedGoalIndex] = {
            ...this.financialGoals[editedGoalIndex],
            name: this.goalForm.name,
            targetAmount: this.goalForm.targetAmount,
            deadline: this.goalForm.deadline
          }
        }
      } else {
        const newGoal = {
          id: this.financialGoals.length + 1,
          name: this.goalForm.name,
          targetAmount: this.goalForm.targetAmount,
          deadline: this.goalForm.deadline
        }
        this.financialGoals.push(newGoal)
      }
      this.cancelEdit()
    },
    deleteGoal(goal) {
      if (confirm('Are you sure you want to delete this goal?')) {
        const goalIndex = this.financialGoals.findIndex((g) => g.id === goal.id)
        if (goalIndex !== -1) {
          this.financialGoals.splice(goalIndex, 1)
        }
      }
    },
    fetchFinancialGoals() {
      this.financialGoals = [
        { id: 1, name: 'Goal 1', targetAmount: 1000, deadline: '2024-12-31' },
        { id: 2, name: 'Goal 2', targetAmount: 2000, deadline: '2024-12-31' },
        { id: 3, name: 'Goal 3', targetAmount: 3000, deadline: '2024-12-31' }
      ]
    }
  },
  mounted() {
    this.fetchFinancialGoals()
  }
}
</script>

<style scoped></style>
