<template>
  <v-container>
    <v-row>
      <v-col>
        <v-card class="pa-5">
          <v-card-title>
            <h2>{{ $t('financial_goals.title') }}</h2>
          </v-card-title>
          <v-card-text>
            <!-- Formulário para adicionar ou editar metas -->
            <v-form v-if="isAddingOrEditing" @submit.prevent="submitGoalForm">
              <v-text-field :label="$t('financial_goals.goal_name')" v-model="goalForm.name" required outlined
                class="mb-4"></v-text-field>

              <!-- Campo de Categoria -->
              <v-select :label="$t('financial_goals.category')" v-model="goalForm.category" :items="categories"
                item-title="name" item-value="code" @update:modelValue="onCategoryChange" outlined
                class="mb-4"></v-select>

              <v-text-field :label="$t('financial_goals.target_amount')" v-model="goalForm.targetAmount"
                @update:modelValue="suggestDeadline" type="number" required outlined class="mb-4"></v-text-field>

              <v-text-field :label="$t('financial_goals.initial_amount')" v-model="goalForm.initialAmount"
                @update:modelValue="suggestDeadline" type="number" outlined class="mb-4"></v-text-field>

              <v-text-field :label="$t('financial_goals.contribution_frequency')"
                v-model="goalForm.contributionFrequency" @update:modelValue="suggestDeadline" type="number" outlined
                class="mb-4"></v-text-field>

              <v-select :label="$t('financial_goals.periodicity')" v-model="goalForm.periodicity"
                :items="['weekly', 'monthly']" @update:modelValue="suggestDeadline" outlined class="mb-4"></v-select>

              <!-- Data Limite (preenchida automaticamente) -->
              <v-text-field :label="$t('financial_goals.deadline')" v-model="goalForm.deadline" type="date" readonly
                outlined class="mb-4"></v-text-field>

              <v-row justify="center" class="mb-4">
                <v-col cols="auto">
                  <v-btn type="submit" color="primary">
                    {{ isEditing ? $t('financial_goals.update') : $t('financial_goals.add') }}
                  </v-btn>
                </v-col>
                <v-col cols="auto">
                  <v-btn type="button" @click="cancelEdit" color="secondary">
                    {{ $t('common.cancel') }}
                  </v-btn>
                </v-col>
              </v-row>

              <v-divider></v-divider>
            </v-form>

            <!-- Botão para adicionar uma nova meta -->
            <v-btn v-if="!isAddingOrEditing" @click="addNewGoal" color="primary" class="mt-4">
              {{ $t('financial_goals.new_goal') }}
            </v-btn>

            <!-- Lista de objetivos financeiros -->
            <v-list v-if="financialGoals.length" class="mt-4">
              <v-list-item v-for="goal in financialGoals" :key="goal.id" class="goal-item">
                <v-row align="center" class="w-200">
                  <v-col>
                    <v-list-item-title>{{ goal.name }}</v-list-item-title>
                    <v-list-item-subtitle>
                      {{ $t('financial_goals.target_amount_label') }}: ${{ goal.targetAmount }} |
                      {{ $t('financial_goals.deadline_label') }}: {{ goal.deadline }}
                    </v-list-item-subtitle>
                    <!-- Progresso da meta -->
                    <v-progress-linear :value="calculateProgress(goal)"></v-progress-linear>
                    <div>{{ $t('financial_goals.progress') }}: {{ calculateProgress(goal) }}%</div>

                    <!-- Adicionar uma seção para o histórico de contribuições -->
                    <v-row v-if="selectedGoalContributions.length">
                      <v-col>
                        <h3>{{ $t('financial_goals.contribution_history') }}</h3>
                        <v-list>
                          <v-list-item v-for="contribution in selectedGoalContributions" :key="contribution.id">
                            <v-list-item-title>
                              {{ $t('financial_goals.amount') }}: ${{ contribution.amount }}
                            </v-list-item-title>
                            <v-list-item-subtitle>
                              {{ $t('financial_goals.date') }}: {{ contribution.date }}
                            </v-list-item-subtitle>
                            <v-list-item-action>
                              <v-btn icon @click="deleteContribution(contribution.id)">
                                <v-icon>mdi-delete</v-icon>
                              </v-btn>
                            </v-list-item-action>
                          </v-list-item>
                        </v-list>
                      </v-col>
                    </v-row>

                    <!-- Adicionar contribuição -->
                    <ContributionComponent :goal="goal" @contribution-added="handleContributionAdded" />

                    <!-- Exibir se a meta é viável ou não -->
                    <v-alert v-if="!isGoalFeasible(goal)" type="warning">
                      {{ $t('financial_goals.not_feasible') }}
                    </v-alert>
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
            <v-alert v-else color="primary" type="info" class="mt-4">
              {{ $t('financial_goals.no_goals') }}
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import FinancialGoalService from '@/services/FinancialGoalService';
import ContributionComponent from '@/components/Contribution.vue';
import DataService from '@/services/DataService';

export default {
  components: {
    ContributionComponent
  },
  data() {
    return {
      financialGoals: [],
      selectedGoal: null,
      selectedGoalContributions: [],
      isAddingOrEditing: false,
      isEditing: false,
      goalForm: {
        name: '',
        targetAmount: 0,
        initialAmount: 0,
        deadline: '',
        contributionFrequency: 0,
        periodicity: 'monthly',
        category: ''
      },
      editedGoalId: null,
      categories: [],
      selectedLanguage: 'pt',
    };
  },
  methods: {
    addNewGoal() {
      this.isAddingOrEditing = true;
      this.isEditing = false;
      this.goalForm = {
        name: '',
        targetAmount: 0,
        initialAmount: 0,
        deadline: '',
        contributionFrequency: 0,
        periodicity: 'monthly',
        category: ''
      };
    },
    editGoal(goal) {
      this.isAddingOrEditing = true;
      this.isEditing = true;
      this.editedGoalId = goal.id;

      this.goalForm = {
        name: goal.name,
        targetAmount: goal.targetAmount,
        initialAmount: goal.initialAmount || 0,
        deadline: goal.deadline,
        contributionFrequency: goal.contributionFrequency || 0,
        periodicity: goal.periodicity || 'monthly',
        category: goal.category || ''
      };
    },
    cancelEdit() {
      this.isAddingOrEditing = false;
      this.isEditing = false;
      this.goalForm = {
        name: '',
        targetAmount: 0,
        initialAmount: 0,
        deadline: '',
        contributionFrequency: 0,
        periodicity: 'monthly',
        category: ''
      };
    },
    submitGoalForm() {
      if (this.isEditing) {
        DataService.updateFinancialGoal(this.editedGoalId, this.goalForm)
          .then(() => {
            this.fetchFinancialGoals();
            this.cancelEdit();
          })
          .catch((error) => {
            console.error('Erro ao atualizar meta financeira:', error);
          });
      } else {
        DataService.createFinancialGoal(this.goalForm)
          .then(() => {
            this.fetchFinancialGoals();
            this.cancelEdit();
          })
          .catch((error) => {
            console.error('Erro ao criar meta financeira:', error);
          });
      }
    },
    deleteGoal(goal) {
      if (confirm('Tem certeza que deseja excluir este objetivo?')) {
        DataService.deleteFinancialGoal(goal.id)
          .then(() => {
            this.fetchFinancialGoals();
          })
          .catch((error) => {
            console.error('Erro ao excluir meta financeira:', error);
          });
      }
    },
    fetchContributions() {
      // Simulação de chamada ao back-end para buscar contribuições do objetivo selecionado
      // FinancialGoalService.fetchContributions(this.selectedGoal.id).then((response) => {
      //   this.selectedGoalContributions = response.data;
      // });
      const mockContributions = [
        {
          id: 1,
          amount: 200,
          date: '2024-10-01',
          description: 'Contribuição inicial'
        },
        {
          id: 2,
          amount: 150,
          date: '2024-10-15',
          description: 'Contribuição mensal'
        }
      ];

      // Simulando um retorno assíncrono como se fosse uma resposta de uma API
      return new Promise((resolve) => {
        setTimeout(() => {
          this.selectedGoalContributions = mockContributions;
          resolve(mockContributions);
        }, 500); // Simula um pequeno atraso na resposta, como se fosse uma chamada real
      });
    },
    deleteContribution(contributionId) {
      if (confirm('Tem certeza que deseja excluir esta contribuição?')) {
        FinancialGoalService.deleteContribution(contributionId).then(() => {
          this.fetchContributions();
        }).catch((error) => {
          console.error('Erro ao excluir contribuição:', error);
        });
      }
    },
    calculateProgress(goal) {
      const totalSaved = goal.initialAmount || 0;
      const progressPercentage = (totalSaved / goal.targetAmount) * 100;
      return progressPercentage.toFixed(2);
    },
    handleContributionAdded(contribution, goalId) {
      const goal = this.financialGoals.find(g => g.id === goalId);
      if (goal) {
        goal.initialAmount += contribution; // Adiciona a contribuição ao valor inicial
        this.calculateProgress(goal); // Atualiza o progresso
      }
    },
    isGoalFeasible(goal) {
      const totalSaved = goal.initialAmount || 0;
      const remainingAmount = goal.targetAmount - totalSaved;
      const deadline = new Date(goal.deadline);
      const today = new Date();
      const weeksRemaining = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24 * 7));

      let contributionsNeeded;
      if (goal.periodicity === 'weekly') {
        contributionsNeeded = remainingAmount / weeksRemaining;
      } else if (goal.periodicity === 'monthly') {
        const monthsRemaining = Math.ceil(weeksRemaining / 4);
        contributionsNeeded = remainingAmount / monthsRemaining;
      }

      return contributionsNeeded <= goal.contributionFrequency;
    },
    checkGoalDeadlines() {
      const today = new Date();
      this.financialGoals.forEach((goal) => {
        const deadline = new Date(goal.deadline);
        const daysRemaining = (deadline - today) / (1000 * 60 * 60 * 24);

        if (daysRemaining <= 7 && this.calculateProgress(goal) < 100) {
          alert(`Atenção! O prazo para atingir o objetivo "${goal.name}" está se aproximando e você ainda não atingiu a meta.`);
        }
      });
    },
    fetchFinancialGoals() {
      FinancialGoalService.fetchFinancialGoals().then((response) => {
        this.financialGoals = response.data;
        // Atualizar progresso de cada meta
        this.financialGoals.forEach((goal) => {
          this.autoUpdateProgress(goal);
        });
      }).catch((error) => {
        console.error('Erro ao buscar metas financeiras:', error);
      });
    },
    fetchCategories() {
      DataService.fetchCategories(this.selectedLanguage).then((response) => {
        this.categories = response.data.map((category) => ({
          id: category.id,
          code: category.code,
          name: category.name
        }));
      }).catch((error) => {
        console.error('Erro ao buscar categorias:', error);
      });
    },
    onCategoryChange(categoryCode) {
      console.log(categoryCode);
      if (categoryCode) {
        const suggestions = {
          'carro': 20000,
          'casa': 50000,
          'viagem': 5000,
          'fundo_emergencia': 10000,
          // Adicione outras categorias conforme necessário
        };
        this.goalForm.targetAmount = suggestions[categoryCode] || 0;
        this.suggestDeadline();
      }
    },
    suggestDeadline() {
      const remainingAmount = this.goalForm.targetAmount - (this.goalForm.initialAmount || 0);
      const contributionFrequency = this.goalForm.contributionFrequency;
      const periodicity = this.goalForm.periodicity;

      let periodsRequired = 0;

      if (periodicity === 'monthly' && contributionFrequency > 0) {
        periodsRequired = Math.ceil(remainingAmount / contributionFrequency);
        const suggestedDate = new Date();
        suggestedDate.setMonth(suggestedDate.getMonth() + periodsRequired);
        this.goalForm.deadline = suggestedDate.toISOString().substr(0, 10);
      } else if (periodicity === 'weekly' && contributionFrequency > 0) {
        periodsRequired = Math.ceil(remainingAmount / contributionFrequency);
        const suggestedDate = new Date();
        suggestedDate.setDate(suggestedDate.getDate() + periodsRequired * 7);
        this.goalForm.deadline = suggestedDate.toISOString().substr(0, 10);
      } else {
        this.goalForm.deadline = '';
      }
    },
    autoUpdateProgress(goal) {
      FinancialGoalService.fetchTransactions().then((response) => {
        const transactions = response.data;
        const relevantTransactions = transactions.filter(
          (transaction) => transaction.categoryCode === goal.category && transaction.type === 'income'
        );
        const totalContributions = relevantTransactions.reduce(
          (total, transaction) => total + transaction.amount,
          0
        );
        goal.initialAmount = totalContributions;
      }).catch((error) => {
        console.error('Erro ao buscar transações:', error);
      });
    },
    suggestGoalsBasedOnIncome() {
      DataService.fetchMonthOverview().then((response) => {
        const income = response.data.totalIncome;
        const expenses = response.data.totalExpense;
        const disposableIncome = income - expenses;

        const suggestedGoals = [];

        if (disposableIncome > 1000) {
          suggestedGoals.push({
            id: this.financialGoals.length + 1,
            name: 'Fundo de Emergência',
            targetAmount: disposableIncome * 6,
            initialAmount: 0,
            deadline: '',
            contributionFrequency: disposableIncome * 0.2,
            periodicity: 'monthly',
            category: 'fundo_emergencia',
          });
        } else {
          suggestedGoals.push({
            id: this.financialGoals.length + 1,
            name: 'Poupança Mensal',
            targetAmount: disposableIncome * 3,
            initialAmount: 0,
            deadline: '',
            contributionFrequency: disposableIncome * 0.1,
            periodicity: 'monthly',
            category: 'poupanca_mensal',
          });
        }

        this.financialGoals = [...this.financialGoals, ...suggestedGoals];

        // Atualizar data limite e progresso das metas sugeridas
        this.financialGoals.forEach((goal) => {
          this.suggestDeadlineForGoal(goal);
          this.autoUpdateProgress(goal);
        });
      }).catch((error) => {
        console.error('Erro ao buscar overview:', error);
      });
    },
    suggestDeadlineForGoal(goal) {
      const remainingAmount = goal.targetAmount - (goal.initialAmount || 0);
      const contributionFrequency = goal.contributionFrequency;
      const periodicity = goal.periodicity;

      let periodsRequired = 0;

      if (periodicity === 'monthly' && contributionFrequency > 0) {
        periodsRequired = Math.ceil(remainingAmount / contributionFrequency);
        const suggestedDate = new Date();
        suggestedDate.setMonth(suggestedDate.getMonth() + periodsRequired);
        goal.deadline = suggestedDate.toISOString().substr(0, 10);
      } else if (periodicity === 'weekly' && contributionFrequency > 0) {
        periodsRequired = Math.ceil(remainingAmount / contributionFrequency);
        const suggestedDate = new Date();
        suggestedDate.setDate(suggestedDate.getDate() + periodsRequired * 7);
        goal.deadline = suggestedDate.toISOString().substr(0, 10);
      } else {
        goal.deadline = '';
      }
    },
  },
  mounted() {
    this.fetchCategories();
    this.fetchFinancialGoals();
    this.checkGoalDeadlines();
    this.suggestGoalsBasedOnIncome();
    this.fetchContributions();
  },
};
</script>

<style scoped>
.section {
  margin-bottom: 30px;
}
</style>
