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
            <v-form v-if="isAddingOrEditing" @submit.prevent="submitGoalForm" ref="formRef">
              <v-text-field :label="$t('financial_goals.goal_name')" v-model="goalForm.name" :rules="[requiredRule]"
                required outlined class="mb-4"></v-text-field>

              <v-select :label="$t('financial_goals.category')" v-model="goalForm.category" :items="categories"
                item-title="name" item-value="code" :rules="[requiredRule]" @change="onCategoryChange" outlined
                class="mb-4"></v-select>

              <v-text-field :label="$t('financial_goals.target_amount')" v-model="goalForm.targetAmount"
                :rules="[requiredRule, positiveNumberRule]" @input="suggestDeadline" type="number" required outlined
                class="mb-4"></v-text-field>

              <v-text-field :label="$t('financial_goals.initial_amount')" v-model="goalForm.initialAmount"
                :rules="[positiveNumberRule]" @input="suggestDeadline" type="number" outlined
                class="mb-4"></v-text-field>

              <v-text-field :label="$t('financial_goals.contribution_frequency')"
                v-model="goalForm.contributionFrequency" :rules="[positiveNumberRule]" @input="suggestDeadline"
                type="number" outlined class="mb-4"></v-text-field>

              <v-select :label="$t('financial_goals.periodicity')" v-model="goalForm.periodicity"
                :items="['weekly', 'monthly']" :rules="[requiredRule]" @change="suggestDeadline" outlined
                class="mb-4"></v-select>

              <v-text-field :label="$t('financial_goals.deadline')" v-model="goalForm.deadline"
                :rules="[futureDateRule]" type="date" outlined class="mb-4"></v-text-field>

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
                      {{ $t('financial_goals.target_amount') }}: ${{ goal.targetAmount }} |
                      {{ $t('financial_goals.deadline_label') }}: {{ formatDate(goal.deadline) }}
                    </v-list-item-subtitle>
                    <!-- Progresso da meta -->
                    <v-progress-linear :model-value="goal.progress" color="green" height="10"
                      rounded></v-progress-linear>
                    <div>{{ $t('financial_goals.progress') }}: {{ goal.progress }}%</div>

                    <!-- Histórico de contribuições -->
                    <v-row>
                      <v-col>
                        <h3>{{ $t('financial_goals.contribution_history') }}</h3>
                        <v-list>
                          <v-list-item v-for="contribution in goal.contributions" :key="contribution.id">
                            <v-list-item-title>
                              {{ $t('financial_goals.amount') }}: ${{ contribution.amount }}
                            </v-list-item-title>
                            <v-list-item-subtitle>
                              {{ $t('financial_goals.date') }}: {{ formatDate(contribution.date) }}
                            </v-list-item-subtitle>
                            <v-list-item-action>
                              <v-btn icon @click="deleteContribution(contribution.id, goal.id)">
                                <v-icon>mdi-delete</v-icon>
                              </v-btn>
                            </v-list-item-action>
                          </v-list-item>
                        </v-list>
                      </v-col>
                    </v-row>

                    <!-- Adicionar contribuição -->
                    <ContributionComponent :goal="goal" @contribution-added="fetchFinancialGoals" />

                    <!-- Exibir se a meta é viável ou não -->
                    <v-alert v-if="!goal.feasible" type="warning">
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
            <!-- Seção para inserir visão geral do mês e buscar sugestões -->
            <v-card class="pa-5 mt-5">
              <v-card-title>
                <h3>{{ $t('financial_goals.suggested_goals_title') }}</h3>
              </v-card-title>
              <v-card-text>
                <v-form @submit.prevent="fetchSuggestions">
                  <v-text-field :label="$t('financial_goals.total_income')" v-model.number="monthOverview.totalIncome"
                    type="number" required outlined class="mb-4"></v-text-field>
                  <v-text-field :label="$t('financial_goals.total_expense')" v-model.number="monthOverview.totalExpense"
                    type="number" required outlined class="mb-4"></v-text-field>
                  <v-btn type="submit" color="secondary">
                    {{ $t('financial_goals.get_suggestions') }}
                  </v-btn>
                </v-form>

                <!-- Lista de metas sugeridas -->
                <v-list v-if="suggestedGoals.length" class="mt-4">
                  <v-list-item v-for="suggestion in suggestedGoals" :key="suggestion.id" class="suggestion-item">
                    <v-row align="center">
                      <v-col>
                        <v-list-item-title>{{ suggestion.name }}</v-list-item-title>
                        <v-list-item-subtitle>
                          {{ $t('financial_goals.target_amount_label') }}: ${{ suggestion.targetAmount }} |
                          {{ $t('financial_goals.deadline_label') }}: {{ formatDate(suggestion.deadline) }}
                        </v-list-item-subtitle>
                        <v-progress-linear :value="suggestion.progress" color="green"></v-progress-linear>
                        <div>{{ $t('financial_goals.progress') }}: {{ suggestion.progress }}%</div>
                        <v-alert v-if="!suggestion.feasible" type="warning">
                          {{ $t('financial_goals.not_feasible') }}
                        </v-alert>
                      </v-col>
                      <v-col class="d-flex justify-end">
                        <v-btn color="success" @click="acceptSuggestedGoal(suggestion)">
                          {{ $t('financial_goals.accept') }}
                        </v-btn>
                      </v-col>
                    </v-row>
                    <v-divider></v-divider>
                  </v-list-item>
                </v-list>
                <v-alert v-else-if="suggestedGoalsFetched" type="info" class="mt-4">
                  {{ $t('financial_goals.no_suggestions') }}
                </v-alert>
              </v-card-text>
            </v-card>
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
    ContributionComponent,
  },
  data() {
    return {
      financialGoals: [],
      suggestedGoals: [],
      suggestedGoalsFetched: false, // Para controlar a exibição do alerta de ausência de sugestões
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
      monthOverview: {
        totalIncome: 0,
        totalExpense: 0
      },
    };
  },
  methods: {
    requiredRule(value) {
      return !!value || this.$t('validation.required');
    },
    positiveNumberRule(value) {
      return value >= 0 || this.$t('validation.positive_number');
    },
    futureDateRule(value) {
      const today = new Date().toISOString().split('T')[0];
      return !value || value >= today || this.$t('validation.future_date');
    },
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
      const isFormValid = this.$refs.formRef.validate();
      if (!isFormValid) return;

      if (this.isEditing) {
        FinancialGoalService.updateFinancialGoal(this.editedGoalId, this.goalForm)
          .then(() => {
            this.fetchFinancialGoals();
            this.cancelEdit();
          })
          .catch((error) => {
            console.error('Erro ao atualizar meta financeira:', error);
          });
      } else {
        FinancialGoalService.createFinancialGoal(this.goalForm)
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
        FinancialGoalService.deleteFinancialGoal(goal.id)
          .then(() => {
            this.fetchFinancialGoals();
          })
          .catch((error) => {
            console.error('Erro ao excluir meta financeira:', error);
          });
      }
    },
    deleteContribution(contributionId, goalId) {
      if (confirm('Tem certeza que deseja excluir esta contribuição?')) {
        FinancialGoalService.deleteContribution(goalId, contributionId)
          .then(() => {
            this.fetchFinancialGoals();
          })
          .catch((error) => {
            console.error('Erro ao excluir contribuição:', error);
          });
      }
    },
    addContribution(goalId, contributionData) {
      FinancialGoalService.addContribution(goalId, contributionData)
        .then(() => {
          this.fetchFinancialGoals();
        })
        .catch((error) => {
          console.error('Erro ao adicionar contribuição:', error);
        });
    },
    acceptSuggestedGoal(suggestion) {
      FinancialGoalService.createFinancialGoal(suggestion)
        .then(() => {
          this.fetchFinancialGoals();
          this.suggestedGoals = this.suggestedGoals.filter(goal => goal.id !== suggestion.id);
          if (this.suggestedGoals.length === 0) {
            this.suggestedGoalsFetched = true;
          }
        })
        .catch((error) => {
          console.error('Erro ao aceitar meta sugerida:', error);
        });
    },
    fetchFinancialGoals() {
      FinancialGoalService.fetchFinancialGoals()
        .then((response) => {
          this.financialGoals = response.data;
          this.checkGoalDeadlines();
        })
        .catch((error) => {
          console.error('Erro ao buscar metas financeiras:', error);
        });
    },
    fetchSuggestedGoals(overview) {
      FinancialGoalService.suggestGoalsBasedOnIncome(overview)
        .then((response) => {
          this.suggestedGoals = response.data;
          this.suggestedGoalsFetched = false;
        })
        .catch((error) => {
          console.error('Erro ao buscar metas sugeridas:', error);
          this.suggestedGoalsFetched = true;
        });
    },
    fetchCategories() {
      DataService.fetchCategories(this.selectedLanguage)
        .then((response) => {
          this.categories = response.data.map((category) => ({
            id: category.id,
            code: category.code,
            name: category.name
          }));
        })
        .catch((error) => {
          console.error('Erro ao buscar categorias:', error);
        });
    },
    onCategoryChange(categoryCode) {
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
      const targetAmount = this.goalForm.targetAmount || 0; // Garante um valor numérico
      const initialAmount = this.goalForm.initialAmount || 0; // Garante um valor numérico
      const remainingAmount = Math.max(0, targetAmount - initialAmount); // Impede valores negativos
      const contributionFrequency = this.goalForm.contributionFrequency || 0; // Garante um valor numérico
      const periodicity = this.goalForm.periodicity;

      if (contributionFrequency <= 0 || remainingAmount <= 0) {
        // Data padrão em caso de valores inválidos
        const fallbackDate = new Date();
        fallbackDate.setDate(fallbackDate.getDate() + 1);
        this.goalForm.deadline = fallbackDate.toISOString().substr(0, 10);
        return;
      }

      let periodsRequired = Math.ceil(remainingAmount / contributionFrequency);
      const suggestedDate = new Date();

      if (periodicity === 'monthly') {
        suggestedDate.setMonth(suggestedDate.getMonth() + periodsRequired);
      } else if (periodicity === 'weekly') {
        suggestedDate.setDate(suggestedDate.getDate() + periodsRequired * 7);
      } else {
        this.goalForm.deadline = '';
        return;
      }

      this.goalForm.deadline = suggestedDate.toISOString().substr(0, 10);
    },
    checkGoalDeadlines() {
      const today = new Date();
      this.financialGoals.forEach((goal) => {
        const deadline = new Date(goal.deadline);
        const daysRemaining = (deadline - today) / (1000 * 60 * 60 * 24);

        if (daysRemaining <= 7 && goal.progress < 100) {
          alert(`Atenção! O prazo para atingir o objetivo "${goal.name}" está se aproximando e você ainda não atingiu a meta.`);
        }
      });
    },
    getCurrentMonthOverview() {
      // Implemente a lógica para obter a visão geral do mês atual
      // Pode ser uma chamada para um serviço ou utilizar dados já disponíveis
      // Exemplo:
      // Aqui, por simplicidade, assumimos que os dados estão no componente
      return {
        totalIncome: this.monthOverview.totalIncome,
        totalExpense: this.monthOverview.totalExpense
      };
    },
    fetchSuggestions() {
      const overview = this.getCurrentMonthOverview();
      FinancialGoalService.suggestGoalsBasedOnIncome(overview)
        .then((response) => {
          this.suggestedGoals = response.data;
          this.suggestedGoalsFetched = this.suggestedGoals.length === 0;
        })
        .catch((error) => {
          console.error('Erro ao buscar metas sugeridas:', error);
          this.suggestedGoalsFetched = true;
        });
    },
    formatDate(dateStr) {
      const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
      return new Date(dateStr).toLocaleDateString('pt-BR', options);
    }
  },
  mounted() {
    this.fetchCategories();
    this.fetchFinancialGoals();
    // Remover chamadas de contribuições diretas, pois elas são agora gerenciadas dentro das metas
  },
}
</script>


<style scoped>
.section {
  margin-bottom: 30px;
}
</style>
