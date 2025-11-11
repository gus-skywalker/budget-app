<template>
  <div class="financial-goal-container">
    <v-container class="modern-container">
      <v-row>
        <v-col>
          <div class="modern-card main-card">
            <div class="card-header">
              <h2 class="card-title">
                <v-icon color="#667eea" class="mr-2">mdi-bullseye-arrow</v-icon>
                {{ $t('financial_goals.title') }}
              </h2>
            </div>
            <div class="card-content">
              <!-- Formulário para adicionar ou editar metas -->
              <v-form v-if="isAddingOrEditing" @submit.prevent="submitGoalForm" ref="formRef" class="goal-form">
                <v-text-field 
                  :label="$t('financial_goals.goal_name')" 
                  v-model="goalForm.name" 
                  :rules="[requiredRule]"
                  required 
                  variant="outlined"
                  density="comfortable"
                  color="#667eea"
                  class="modern-input mb-4"
                ></v-text-field>

                <v-select 
                  :label="$t('financial_goals.category')" 
                  v-model="goalForm.category" 
                  :items="categories"
                  item-title="name" 
                  item-value="code" 
                  :rules="[requiredRule]" 
                  @change="onCategoryChange"
                  variant="outlined"
                  density="comfortable"
                  color="#667eea"
                  class="modern-input mb-4"
                ></v-select>

                <v-text-field 
                  :label="$t('financial_goals.target_amount')" 
                  v-model="goalForm.targetAmount"
                  :rules="[requiredRule, positiveNumberRule]" 
                  @input="suggestDeadline" 
                  type="number" 
                  required
                  variant="outlined"
                  density="comfortable"
                  color="#667eea"
                  class="modern-input mb-4"
                ></v-text-field>

                <v-text-field 
                  :label="$t('financial_goals.initial_amount')" 
                  v-model="goalForm.initialAmount"
                  :rules="[positiveNumberRule]" 
                  @input="suggestDeadline" 
                  type="number"
                  variant="outlined"
                  density="comfortable"
                  color="#667eea"
                  class="modern-input mb-4"
                ></v-text-field>

                <v-text-field 
                  :label="$t('financial_goals.contribution_frequency')"
                  v-model="goalForm.contributionFrequency" 
                  :rules="[positiveNumberRule]" 
                  @input="suggestDeadline"
                  type="number"
                  variant="outlined"
                  density="comfortable"
                  color="#667eea"
                  class="modern-input mb-4"
                ></v-text-field>

                <v-select 
                  :label="$t('financial_goals.periodicity')" 
                  v-model="goalForm.periodicity"
                  :items="['weekly', 'monthly']" 
                  :rules="[requiredRule]" 
                  @change="suggestDeadline"
                  variant="outlined"
                  density="comfortable"
                  color="#667eea"
                  class="modern-input mb-4"
                ></v-select>

                <v-text-field 
                  :label="$t('financial_goals.deadline')" 
                  v-model="goalForm.deadline"
                  :rules="[futureDateRule]" 
                  type="date"
                  variant="outlined"
                  density="comfortable"
                  color="#667eea"
                  class="modern-input mb-4"
                ></v-text-field>

                <v-row justify="center" class="mb-4">
                  <v-col cols="auto">
                    <v-btn 
                      type="submit" 
                      color="primary"
                      class="modern-btn gradient-btn"
                      size="large"
                    >
                      <v-icon left>{{ isEditing ? 'mdi-check' : 'mdi-plus' }}</v-icon>
                      {{ isEditing ? $t('financial_goals.update') : $t('financial_goals.add') }}
                    </v-btn>
                  </v-col>
                  <v-col cols="auto">
                    <v-btn 
                      type="button" 
                      @click="cancelEdit" 
                      color="secondary"
                      variant="outlined"
                      class="modern-btn"
                      size="large"
                    >
                      <v-icon left>mdi-close</v-icon>
                      {{ $t('common.cancel') }}
                    </v-btn>
                  </v-col>
                </v-row>

                <v-divider class="my-4"></v-divider>
              </v-form>

              <!-- Botão para adicionar uma nova meta -->
              <v-btn 
                v-if="!isAddingOrEditing" 
                @click="addNewGoal" 
                color="primary"
                class="modern-btn gradient-btn mt-4"
                size="large"
                block
              >
                <v-icon left>mdi-plus-circle</v-icon>
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
              <div v-else class="empty-state">
                <v-icon size="64" color="#667eea" class="mb-4">mdi-bullseye-arrow</v-icon>
                <p class="empty-message">{{ $t('financial_goals.no_goals') }}</p>
              </div>

              <!-- Seção para inserir visão geral do mês e buscar sugestões -->
              <div class="modern-card suggestions-card mt-5">
                <div class="card-header">
                  <h3 class="card-title">
                    <v-icon color="#667eea" class="mr-2">mdi-lightbulb</v-icon>
                    {{ $t('financial_goals.suggested_goals_title') }}
                  </h3>
                </div>
                <div class="card-content">
                  <v-form @submit.prevent="fetchSuggestions">
                    <v-row>
                      <v-col cols="12" md="6">
                        <v-text-field 
                          :label="$t('financial_goals.total_income')" 
                          v-model.number="monthOverview.totalIncome"
                          type="number" 
                          variant="outlined"
                          density="comfortable"
                          color="#667eea"
                          class="modern-input"
                          required
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-text-field 
                          :label="$t('financial_goals.total_expense')" 
                          v-model.number="monthOverview.totalExpense"
                          type="number" 
                          variant="outlined"
                          density="comfortable"
                          color="#667eea"
                          class="modern-input"
                          required
                        ></v-text-field>
                      </v-col>
                    </v-row>
                    <v-btn 
                      type="submit" 
                      color="secondary"
                      class="modern-btn gradient-btn"
                      size="large"
                    >
                      <v-icon left>mdi-lightbulb</v-icon>
                      {{ $t('financial_goals.get_suggestions') }}
                    </v-btn>
                  </v-form>

                  <!-- Lista de metas sugeridas -->
                  <v-list v-if="suggestedGoals.length" class="mt-4 suggestions-list">
                    <div v-for="suggestion in suggestedGoals" :key="suggestion.id" class="suggestion-item">
                      <v-row align="center">
                        <v-col>
                          <div class="suggestion-name">{{ suggestion.name }}</div>
                          <div class="suggestion-details">
                            {{ $t('financial_goals.target_amount_label') }}: ${{ suggestion.targetAmount }} |
                            {{ $t('financial_goals.deadline_label') }}: {{ formatDate(suggestion.deadline) }}
                          </div>
                          <div class="progress-section mt-2">
                            <v-progress-linear :value="suggestion.progress" color="#667eea" height="8"></v-progress-linear>
                            <div class="progress-text">{{ $t('financial_goals.progress') }}: {{ suggestion.progress }}%</div>
                          </div>
                          <v-alert v-if="!suggestion.feasible" type="warning" density="compact" class="mt-2">
                            {{ $t('financial_goals.not_feasible') }}
                          </v-alert>
                        </v-col>
                        <v-col cols="auto">
                          <v-btn 
                            color="success" 
                            @click="acceptSuggestedGoal(suggestion)"
                            class="modern-btn"
                          >
                            <v-icon left>mdi-check</v-icon>
                            {{ $t('financial_goals.accept') }}
                          </v-btn>
                        </v-col>
                      </v-row>
                      <v-divider class="my-3"></v-divider>
                    </div>
                  </v-list>
                  <div v-else-if="suggestedGoalsFetched" class="empty-state">
                    <p class="empty-message">{{ $t('financial_goals.no_suggestions') }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
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
      selectedLanguage: this.$i18n?.locale || 'pt',
      monthOverview: {
        totalIncome: 0,
        totalExpense: 0
      },
    };
  },
  watch: {
    '$i18n.locale'(newLocale) {
      if (newLocale && newLocale !== this.selectedLanguage) {
        this.selectedLanguage = newLocale;
        this.fetchCategories();
      }
    }
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
      const language = this.$i18n?.locale || this.selectedLanguage || 'pt';
      this.selectedLanguage = language;
      DataService.fetchCategories(language)
        .then((response) => {
          this.categories = response.data.map((category) => {
            const translationKey = `categories.${category.code}`;
            const translatedName = this.$t(translationKey);
            const isTranslated = translatedName !== translationKey;
            return {
              id: category.id,
              code: category.code,
              name: isTranslated ? translatedName : category.name,
            };
          });
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
.financial-goal-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8eaf0 100%);
  padding: 32px 0;
}

.v-theme--dark .financial-goal-container {
  background: linear-gradient(135deg, #1e1e1e 0%, #141414 100%);
}

.modern-container {
  max-width: 1400px;
  padding-left: 16px;
  padding-right: 16px;
}

@media (min-width: 600px) {
  .modern-container {
    padding-left: 24px;
    padding-right: 24px;
  }
}

/* Modern Cards */
.modern-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.v-theme--dark .modern-card {
  background: #2a2a2a;
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.modern-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.v-theme--dark .modern-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
}

.card-header {
  padding: 20px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(102, 126, 234, 0.03);
}

.v-theme--dark .card-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(102, 126, 234, 0.08);
}

.card-title {
  font-size: 1.35rem;
  font-weight: 600;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  margin: 0;
}

.v-theme--dark .card-title {
  color: #ffffff;
}

.card-content {
  padding: 24px;
}

/* Form Styles */
.modern-input :deep(.v-field) {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.modern-input :deep(.v-field--focused) {
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* Buttons */
.modern-btn {
  border-radius: 8px;
  text-transform: none;
  font-weight: 600;
  letter-spacing: 0.3px;
  transition: all 0.3s ease;
}

.gradient-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  color: white !important;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.gradient-btn:hover {
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  transform: translateY(-2px);
}

/* Goals List */
.goal-item {
  padding: 20px;
  background: rgba(102, 126, 234, 0.03);
  border-radius: 12px;
  margin-bottom: 16px;
  border: 1px solid rgba(102, 126, 234, 0.1);
  transition: all 0.3s ease;
}

.goal-item:hover {
  background: rgba(102, 126, 234, 0.06);
  border-color: rgba(102, 126, 234, 0.2);
  transform: translateX(4px);
}

/* Progress Section */
.progress-section {
  margin-top: 12px;
}

.progress-text {
  font-size: 0.9rem;
  color: #666;
  margin-top: 8px;
  font-weight: 600;
}

.v-theme--dark .progress-text {
  color: #b0b0b0;
}

/* Suggestions */
.suggestions-card {
  background: rgba(255, 193, 7, 0.05);
  border: 1px solid rgba(255, 193, 7, 0.2);
}

.suggestions-list {
  background: transparent;
  padding: 0;
}

.suggestion-item {
  padding: 16px;
  background: white;
  border-radius: 12px;
  margin-bottom: 12px;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.v-theme--dark .suggestion-item {
  background: #2a2a2a;
  border-color: rgba(255, 255, 255, 0.1);
}

.suggestion-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.v-theme--dark .suggestion-name {
  color: #ffffff;
}

.suggestion-details {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 8px;
}

.v-theme--dark .suggestion-details {
  color: #b0b0b0;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-message {
  font-size: 1rem;
  color: #666;
  margin: 0;
}

/* Responsive */
@media (max-width: 960px) {
  .card-content {
    padding: 20px;
  }
}

@media (max-width: 600px) {
  .financial-goal-container {
    padding: 20px 0;
  }

  .card-header {
    padding: 16px 20px;
  }

  .card-title {
    font-size: 1.2rem;
  }

  .card-content {
    padding: 16px;
  }

  .goal-item {
    padding: 16px;
  }
}
</style>
