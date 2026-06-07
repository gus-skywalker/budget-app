<template>
  <div class="financial-goal-shell">
    <div class="cb-container">
          <div class="cb-card">
            <div class="cb-card__header">
              <h2 class="cb-card__title">
                <v-icon color="var(--cb-primary)" class="mr-2">mdi-bullseye-arrow</v-icon>
                {{ $t('financial_goals.title') }}
              </h2>
            </div>
            <div class="cb-card__body">
              <v-alert
                type="info"
                variant="tonal"
                class="mb-4"
                border="start"
              >
                <div class="goal-tip">
                  <div>
                    <strong>{{ $t('financial_goals.tip_title') }}</strong>
                    <div>{{ $t('financial_goals.tip_body') }}</div>
                  </div>
                  <v-btn
                    variant="outlined"
                    color="var(--cb-primary)"
                    class="goal-tip__button"
                    @click="goToConnections"
                  >
                    <v-icon start>mdi-bank-outline</v-icon>
                    {{ $t('financial_goals.tip_cta') }}
                  </v-btn>
                </div>
              </v-alert>

              <div class="cb-card suggestions-card">
                <div class="cb-card__header">
                  <h3 class="cb-card__title">
                    <v-icon color="var(--cb-primary)" class="mr-2">mdi-lightbulb</v-icon>
                    {{ $t('financial_goals.suggested_goals_title') }}
                  </h3>
                </div>
                <div class="cb-card__body">
                  <p class="suggestions-helper">
                    {{ $t('financial_goals.suggested_goals_helper') }}
                  </p>
                  <v-alert
                    type="info"
                    variant="tonal"
                    density="comfortable"
                    class="mb-4"
                  >
                    {{ $t('financial_goals.suggested_goals_note') }}
                  </v-alert>
                  <v-form @submit.prevent="fetchSuggestions">
                    <v-row>
                      <v-col cols="12" md="6">
                        <v-text-field 
                          :label="$t('financial_goals.total_income')" 
                          v-model.number="monthOverview.totalIncome"
                          type="number" 
                          variant="outlined"
                          density="comfortable"
                          color="var(--cb-primary)"
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
                          color="var(--cb-primary)"
                          class="modern-input"
                          required
                        ></v-text-field>
                      </v-col>
                    </v-row>
                    <div class="goal-insight-grid mb-4">
                      <div class="goal-insight-chip">
                        <span class="goal-insight-chip__label">{{ $t('financial_goals.available_monthly_space') }}</span>
                        <span class="goal-insight-chip__value">{{ formatCurrency(disposableIncome) }}</span>
                      </div>
                      <div class="goal-insight-chip">
                        <span class="goal-insight-chip__label">{{ $t('financial_goals.suggested_goals_mode') }}</span>
                        <span class="goal-insight-chip__value">{{ $t('financial_goals.suggested_goals_mode_manual') }}</span>
                      </div>
                    </div>
                    <v-btn 
                      type="submit" 
                      color="var(--cb-primary)"
                      size="large"
                      :disabled="!canFetchSuggestions"
                    >
                      <v-icon left>mdi-lightbulb</v-icon>
                      {{ $t('financial_goals.get_suggestions') }}
                    </v-btn>
                  </v-form>

                  <div v-if="suggestedGoals.length" class="mt-4 suggestions-grid">
                    <div class="suggestions-ranking-note">
                      <v-icon size="16" color="var(--cb-primary)">mdi-information-outline</v-icon>
                      <span>{{ $t('financial_goals.suggested_goals_ranking_note') }}</span>
                    </div>
                    <article
                      v-for="suggestion in rankedSuggestedGoals"
                      :key="suggestion.name"
                      class="suggestion-item"
                    >
                      <div class="suggestion-item__top">
                        <div class="suggestion-item__title-group">
                          <div class="suggestion-icon">
                            <v-icon color="var(--cb-primary)">{{ suggestedGoalIcon(suggestion) }}</v-icon>
                          </div>
                          <div class="suggestion-item__headline">
                            <div class="suggestion-name">{{ suggestion.name }}</div>
                            <div class="suggestion-details">
                              {{ $t('financial_goals.target_amount_label') }}: {{ formatCurrency(suggestion.targetAmount) }}
                            </div>
                          </div>
                        </div>
                        <div class="suggestion-badge">
                          <v-icon size="16">mdi-star-four-points-outline</v-icon>
                          {{
                            isTopSuggestedGoal(suggestion)
                              ? $t('financial_goals.suggested_goals_best_badge')
                              : $t('financial_goals.suggested_goals_badge')
                          }}
                        </div>
                      </div>

                      <div class="goal-insight-grid mt-3">
                        <div class="goal-insight-chip">
                          <span class="goal-insight-chip__label">{{ $t('financial_goals.goal_monthly_suggestion') }}</span>
                          <span class="goal-insight-chip__value">{{ $t('financial_goals.amount_per_month', { amount: formatCurrency(suggestion.suggestedContributionAmount || 0) }) }}</span>
                        </div>
                        <div class="goal-insight-chip">
                          <span class="goal-insight-chip__label">{{ $t('financial_goals.goal_months_left') }}</span>
                          <span class="goal-insight-chip__value">{{ $t('financial_goals.months_count', { count: suggestion.monthsRemaining || 0 }) }}</span>
                        </div>
                        <div class="goal-insight-chip">
                          <span class="goal-insight-chip__label">{{ $t('financial_goals.deadline_label') }}</span>
                          <span class="goal-insight-chip__value">{{ formatDate(suggestion.deadline) }}</span>
                        </div>
                      </div>

                      <div class="suggestion-note mt-3">
                        {{ suggestedGoalMessage(suggestion) }}
                      </div>

                      <div class="suggestion-footer">
                        <span class="suggestion-footer__text">{{ $t('financial_goals.suggested_goals_footer') }}</span>
                        <v-btn 
                          color="success" 
                          @click="acceptSuggestedGoal(suggestion)"
                         
                        >
                          <v-icon left>mdi-check</v-icon>
                          {{ $t('financial_goals.create_suggested_goal') }}
                        </v-btn>
                      </div>
                    </article>
                  </div>
                  <div v-else-if="suggestedGoalsFetched" class="empty-state">
                    <p class="empty-message">{{ $t('financial_goals.no_suggestions') }}</p>
                  </div>
                </div>
              </div>

              <!-- Formulário para adicionar ou editar metas -->
              <v-form v-if="isAddingOrEditing" @submit.prevent="submitGoalForm" ref="formRef" class="goal-form">
                <v-text-field 
                  :label="$t('financial_goals.goal_name')" 
                  v-model="goalForm.name" 
                  :rules="[requiredRule]"
                  required 
                  variant="outlined"
                  density="comfortable"
                  color="var(--cb-primary)"
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
                  :loading="isLoadingCategories"
                  :disabled="isLoadingCategories || !categories.length"
                  :no-data-text="$t('financial_goals.categories_unavailable')"
                  variant="outlined"
                  density="comfortable"
                  color="var(--cb-primary)"
                  class="modern-input mb-4"
                ></v-select>

                <div class="goal-ai-row mb-4">
                  <v-btn
                    variant="tonal"
                    color="var(--cb-primary)"
                    :loading="isSuggestingGoalCategory"
                    :disabled="!canSuggestGoalCategory"
                    @click="suggestGoalCategory"
                  >
                    <v-icon start>{{ canUseAi ? 'mdi-brain' : 'mdi-lock-outline' }}</v-icon>
                    {{ canUseAi ? $t('financial_goals.ai_suggest_category') : $t('financial_goals.ai_upgrade_cta') }}
                  </v-btn>
                  <span v-if="goalCategorySuggestion" class="goal-ai-row__meta">
                    {{ goalCategorySuggestionSourceLabel(goalCategorySuggestion.source) }}
                    • {{ Math.round((goalCategorySuggestion.suggestedCategory?.confidence || 0) * 100) }}%
                  </span>
                </div>

                <v-alert
                  v-if="goalCategorySuggestion"
                  type="info"
                  variant="tonal"
                  density="comfortable"
                  class="mb-4"
                >
                  <div class="goal-ai-suggestion">
                    <div>
                      <strong>{{ $t('financial_goals.ai_suggested_category') }}:</strong>
                      {{ goalCategorySuggestion.suggestedCategory?.name }}
                    </div>
                    <div v-if="goalCategoryReasoningLabel(goalCategorySuggestion)" class="goal-ai-suggestion__reasoning">
                      {{ goalCategoryReasoningLabel(goalCategorySuggestion) }}
                    </div>
                    <div class="goal-ai-suggestion__actions">
                      <v-btn
                        size="small"
                        color="var(--cb-primary)"
                        variant="outlined"
                        @click="applyGoalCategorySuggestion"
                      >
                        {{ $t('financial_goals.ai_apply_suggestion') }}
                      </v-btn>
                      <v-btn
                        size="small"
                        variant="text"
                        @click="dismissGoalCategorySuggestion"
                      >
                        {{ $t('common.close') }}
                      </v-btn>
                    </div>
                  </div>
                </v-alert>

                <v-text-field 
                  :label="$t('financial_goals.target_amount')" 
                  v-model="goalForm.targetAmount"
                  :rules="[requiredRule, positiveNumberRule]" 
                  type="number" 
                  required
                  variant="outlined"
                  density="comfortable"
                  color="var(--cb-primary)"
                  class="modern-input mb-4"
                ></v-text-field>

                <v-text-field 
                  :label="$t('financial_goals.initial_amount')" 
                  v-model="goalForm.initialAmount"
                  :rules="[positiveNumberRule]" 
                  type="number"
                  variant="outlined"
                  density="comfortable"
                  color="var(--cb-primary)"
                  class="modern-input mb-4"
                ></v-text-field>

                <v-text-field 
                  :label="$t('financial_goals.deadline')" 
                  v-model="goalForm.deadline"
                  :rules="[futureDateRule]" 
                  type="date"
                  variant="outlined"
                  density="comfortable"
                  color="var(--cb-primary)"
                  class="modern-input mb-4"
                ></v-text-field>

                <v-alert type="info" variant="tonal" class="mb-4">
                  {{ planningHint() }}
                </v-alert>

                <v-expansion-panels variant="accordion" class="goal-advanced-panel mb-4">
                  <v-expansion-panel>
                    <v-expansion-panel-title>
                      {{ $t('financial_goals.advanced_planning') }}
                    </v-expansion-panel-title>
                    <v-expansion-panel-text>
                      <v-text-field 
                        :label="$t('financial_goals.contribution_frequency')"
                        v-model="goalForm.contributionFrequency" 
                        :rules="[positiveNumberRule]" 
                        type="number"
                        variant="outlined"
                        density="comfortable"
                        color="var(--cb-primary)"
                        class="modern-input mb-4"
                      ></v-text-field>

                      <v-select 
                        :label="$t('financial_goals.periodicity')" 
                        v-model="goalForm.periodicity"
                        :items="['weekly', 'monthly']" 
                        variant="outlined"
                        density="comfortable"
                        color="var(--cb-primary)"
                        class="modern-input"
                      ></v-select>
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                </v-expansion-panels>

                <v-row justify="center" class="mb-4">
                  <v-col cols="auto">
                    <v-btn 
                      type="submit" 
                      color="var(--cb-primary)"
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
              <div v-if="!isAddingOrEditing" class="goal-template-section mt-4">
                <div class="goal-template-section__header">
                  <h3 class="goal-template-section__title">{{ $t('financial_goals.templates_title') }}</h3>
                  <p class="goal-template-section__subtitle">{{ $t('financial_goals.templates_subtitle') }}</p>
                </div>
                <div class="goal-template-grid">
                  <button
                    v-for="template in goalTemplates()"
                    :key="template.key"
                    type="button"
                    class="goal-template-card"
                    @click="startFromTemplate(template)"
                  >
                    <v-icon color="var(--cb-primary)" size="26">{{ template.icon }}</v-icon>
                    <div class="goal-template-card__title">{{ template.title }}</div>
                    <div class="goal-template-card__description">{{ template.description }}</div>
                  </button>
                </div>
              </div>

              <v-btn 
                v-if="!isAddingOrEditing" 
                @click="addNewGoal" 
                color="var(--cb-primary)"
                size="large"
                block
              >
                <v-icon left>mdi-plus-circle</v-icon>
                {{ $t('financial_goals.new_goal') }}
              </v-btn>

            <!-- Lista de objetivos financeiros -->
              <v-list v-if="financialGoals.length" class="mt-4">
              <v-list-item v-for="goal in financialGoals" :key="goal.id" :id="`goal-${goal.id}`" class="goal-item">
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

                    <div class="goal-insight-grid">
                      <div class="goal-insight-chip">
                        <span class="goal-insight-chip__label">{{ $t('financial_goals.remaining_amount') }}</span>
                        <span class="goal-insight-chip__value">{{ formatCurrency(goal.remainingAmount || 0) }}</span>
                      </div>
                      <div class="goal-insight-chip">
                        <span class="goal-insight-chip__label">{{ $t('financial_goals.goal_months_left') }}</span>
                        <span class="goal-insight-chip__value">{{ $t('financial_goals.months_count', { count: goal.monthsRemaining || 0 }) }}</span>
                      </div>
                      <div class="goal-insight-chip">
                        <span class="goal-insight-chip__label">{{ $t('financial_goals.goal_monthly_suggestion') }}</span>
                        <span class="goal-insight-chip__value">{{ $t('financial_goals.amount_per_month', { amount: formatCurrency(goal.suggestedContributionAmount || 0) }) }}</span>
                      </div>
                      <div class="goal-insight-chip" :class="paceStatusClass(goal.paceStatus)">
                        <span class="goal-insight-chip__label">{{ $t('financial_goals.pace') }}</span>
                        <span class="goal-insight-chip__value">{{ paceStatusLabel(goal.paceStatus) }}</span>
                      </div>
                    </div>

                    <v-alert
                      v-if="goal.insightMessage"
                      variant="tonal"
                      density="comfortable"
                      class="goal-insight-alert"
                      :type="goal.paceStatus === 'AT_RISK' ? 'warning' : 'info'"
                    >
                      {{ goal.insightMessage }}
                    </v-alert>

                    <div v-if="goal.plannedContributionMessage" class="goal-planned-message">
                      {{ goal.plannedContributionMessage }}
                    </div>

                    <!-- Histórico de contribuições -->
                    <v-row v-if="goal.contributions?.length">
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

                  </v-col>
                  <v-col class="d-flex justify-end">
                    <v-btn @click="editGoal(goal)" icon variant="text" class="goal-action-btn goal-action-btn--edit">
                      <v-icon size="15">mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn @click="deleteGoal(goal)" icon variant="text" class="goal-action-btn goal-action-btn--delete">
                      <v-icon size="15">mdi-delete</v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
                <v-divider></v-divider>
              </v-list-item>
            </v-list>

              <!-- Alerta para quando não houver metas -->
              <div v-else class="empty-state">
                <v-icon size="64" color="var(--cb-primary)" class="mb-4">mdi-bullseye-arrow</v-icon>
                <p class="empty-message">{{ $t('financial_goals.no_goals') }}</p>
                <p class="empty-submessage">{{ $t('financial_goals.empty_state_tip') }}</p>
                <v-btn
                  variant="outlined"
                  color="var(--cb-primary)"
                  class="mt-4"
                  @click="goToConnections"
                >
                  <v-icon left>mdi-bank-outline</v-icon>
                  {{ $t('financial_goals.tip_cta') }}
                </v-btn>
              </div>
            </div>
          </div>
    </div>

    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      timeout="3500"
      location="top right"
    >
      {{ snackbar.message }}
      <template #actions>
        <v-btn variant="text" @click="snackbar.show = false">
          {{ $t('common.close') }}
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
import FinancialGoalService from '@/services/FinancialGoalService';
import ContributionComponent from '@/components/Contribution.vue';
import DataService from '@/services/DataService';
import AiService from '@/services/aiService';
import BillingOrchestrationService from '@/services/BillingOrchestrationService';
import { useUserStore } from '@/plugins/userStore';

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
      isLoadingCategories: false,
      selectedLanguage: this.$i18n?.locale || 'pt',
      monthOverview: {
        totalIncome: 0,
        totalExpense: 0
      },
      isSuggestingGoalCategory: false,
      goalCategorySuggestion: null,
      billingSummary: null,
      snackbar: {
        show: false,
        message: '',
        color: 'success',
      },
    };
  },
  watch: {
    '$i18n.locale'(newLocale) {
      if (newLocale && newLocale !== this.selectedLanguage) {
        this.selectedLanguage = newLocale;
        this.fetchCategories();
      }
    },
    'goalForm.name'() {
      this.goalCategorySuggestion = null;
    },
  },
  computed: {
    currentWorkspaceId() {
      const userStore = useUserStore();
      return userStore.getCurrentWorkspaceId || userStore.getPreferredWorkspaceId || userStore.getWorkspaces?.[0]?.workspaceId || '';
    },
    canUseAi() {
      const capabilities = this.billingSummary?.capabilities;
      if (!capabilities) return false;
      if (typeof capabilities.aiEnabled === 'boolean') return capabilities.aiEnabled;
      return Boolean(this.billingSummary?.hasPremiumAccess);
    },
    canSuggestGoalCategory() {
      return this.canUseAi && Boolean(String(this.goalForm.name || '').trim());
    },
    disposableIncome() {
      const income = Number(this.monthOverview.totalIncome || 0);
      const expense = Number(this.monthOverview.totalExpense || 0);
      return Math.max(0, income - expense);
    },
    canFetchSuggestions() {
      return Number(this.monthOverview.totalIncome || 0) > 0;
    },
    rankedSuggestedGoals() {
      const monthlyRoom = this.disposableIncome;
      return [...this.suggestedGoals].sort((left, right) => {
        // O ranking no frontend não decide quais metas existem; ele só ordena a vitrine.
        // Priorizamos a sugestão que parece mais "acionável agora":
        // 1) cabe no espaço mensal informado;
        // 2) usa uma fatia relevante, mas não exagerada, da folga;
        // 3) em empate, mostramos a que pede menor aporte absoluto.
        const leftScore = this.suggestedGoalFitScore(left, monthlyRoom);
        const rightScore = this.suggestedGoalFitScore(right, monthlyRoom);
        if (leftScore !== rightScore) {
          return rightScore - leftScore;
        }

        const leftContribution = Number(left?.suggestedContributionAmount || 0);
        const rightContribution = Number(right?.suggestedContributionAmount || 0);
        return leftContribution - rightContribution;
      });
    },
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
      this.goalCategorySuggestion = null;
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
    goalTemplates() {
      return [
        {
          key: 'travel',
          icon: 'mdi-airplane',
          title: this.$t('financial_goals.templates.travel.title'),
          description: this.$t('financial_goals.templates.travel.description'),
          form: {
            name: this.$t('financial_goals.templates.travel.prefill_name'),
            category: 'viagem',
            targetAmount: 5000,
            initialAmount: 0,
            deadline: this.addMonthsToToday(8),
            contributionFrequency: 0,
            periodicity: 'monthly',
          },
        },
        {
          key: 'emergency',
          icon: 'mdi-shield-check-outline',
          title: this.$t('financial_goals.templates.emergency.title'),
          description: this.$t('financial_goals.templates.emergency.description'),
          form: {
            name: this.$t('financial_goals.templates.emergency.prefill_name'),
            category: 'fundo_emergencia',
            targetAmount: 10000,
            initialAmount: 0,
            deadline: this.addMonthsToToday(12),
            contributionFrequency: 0,
            periodicity: 'monthly',
          },
        },
        {
          key: 'notebook',
          icon: 'mdi-laptop',
          title: this.$t('financial_goals.templates.notebook.title'),
          description: this.$t('financial_goals.templates.notebook.description'),
          form: {
            name: this.$t('financial_goals.templates.notebook.prefill_name'),
            category: 'tecnologia',
            targetAmount: 12000,
            initialAmount: 0,
            deadline: this.addMonthsToToday(6),
            contributionFrequency: 0,
            periodicity: 'monthly',
          },
        },
        {
          key: 'car',
          icon: 'mdi-car-outline',
          title: this.$t('financial_goals.templates.car.title'),
          description: this.$t('financial_goals.templates.car.description'),
          form: {
            name: this.$t('financial_goals.templates.car.prefill_name'),
            category: 'carro',
            targetAmount: 200000,
            initialAmount: 0,
            deadline: this.addMonthsToToday(12),
            contributionFrequency: 0,
            periodicity: 'monthly',
          },
        },
      ];
    },
    startFromTemplate(template) {
      this.addNewGoal();
      const resolvedCategory = this.resolveTemplateCategory(template.form.category);
      this.goalForm = {
        ...this.goalForm,
        ...template.form,
        category: resolvedCategory,
      };
    },
    editGoal(goal) {
      this.isAddingOrEditing = true;
      this.isEditing = true;
      this.editedGoalId = goal.id;
      this.goalCategorySuggestion = null;

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
      this.goalCategorySuggestion = null;
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
      if (confirm(this.$t('financial_goals.confirm_delete_goal'))) {
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
      if (confirm(this.$t('financial_goals.confirm_delete_contribution'))) {
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
      const payload = {
        name: suggestion.name,
        category: suggestion.category,
        targetAmount: suggestion.targetAmount,
        initialAmount: suggestion.initialAmount || 0,
        deadline: suggestion.deadline,
        contributionFrequency: suggestion.contributionFrequency || 0,
        periodicity: suggestion.periodicity || 'monthly',
      };

      FinancialGoalService.createFinancialGoal(payload)
        .then((response) => {
          const createdGoal = response?.data;
          this.fetchFinancialGoals();
          this.suggestedGoals = this.suggestedGoals.filter(goal => goal.name !== suggestion.name);
          if (this.suggestedGoals.length === 0) {
            this.suggestedGoalsFetched = true;
          }
          this.showSnackbar(this.$t('financial_goals.suggested_goal_created'), 'success');
          if (createdGoal?.id) {
            this.scrollToGoal(createdGoal.id);
          }
        })
        .catch((error) => {
          console.error('Erro ao aceitar meta sugerida:', error);
          this.showSnackbar(this.$t('financial_goals.suggested_goal_create_error'), 'error');
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
    fetchMonthOverview() {
      DataService.fetchMonthOverview()
        .then((response) => {
          const data = response?.data || {};
          this.monthOverview = {
            totalIncome: Number(data.totalIncome || 0),
            totalExpense: Number(data.totalExpense || 0),
          };
        })
        .catch((error) => {
          console.error('Erro ao buscar visão geral do mês:', error);
        });
    },
    loadBillingCapabilities() {
      const workspaceId = this.currentWorkspaceId;
      if (!workspaceId) {
        this.billingSummary = null;
        return Promise.resolve();
      }
      return BillingOrchestrationService.getBillingSummary(workspaceId)
        .then((response) => {
          this.billingSummary = response?.data || null;
        })
        .catch((error) => {
          console.error('Erro ao carregar capacidades do plano:', error);
          this.billingSummary = null;
        });
    },
    normalizeTranslatedCollection(payload) {
      if (Array.isArray(payload)) return payload;
      if (!payload || typeof payload !== 'object') return [];

      const candidates = [payload.data, payload.items, payload.content, payload.results, payload.list];
      for (const candidate of candidates) {
        if (Array.isArray(candidate)) return candidate;
      }

      return [];
    },
    fetchCategories() {
      this.isLoadingCategories = true;
      const language = this.$i18n?.locale || this.selectedLanguage || 'pt';
      Promise.all([
        DataService.listCategories(),
        DataService.fetchCategories(language),
      ])
        .then(([listResponse, translatedResponse]) => {
          const categories = this.normalizeTranslatedCollection(listResponse?.data);
          const translatedCategories = this.normalizeTranslatedCollection(translatedResponse?.data);
          const translatedNamesByCode = translatedCategories.reduce((accumulator, category) => {
            const code = String(category?.code || '').trim();
            if (code) {
              accumulator[code] = category?.name || code;
            }
            return accumulator;
          }, {});

          const normalizedCategories = categories
            .map((category) => {
              const code = String(category?.code || '').trim();
              const id = category?.id ?? null;
              const isActive = category?.active !== false;
              const isSystemDefined = category?.systemDefined !== false;
              if (!code || id === null || id === undefined || !isActive) {
                return null;
              }
              const translationKey = `categories.${code}`;
              const translatedName = this.$t(translationKey);
              const isTranslated = translatedName !== translationKey;
              const resolvedName = translatedNamesByCode[code]
                || (isSystemDefined && isTranslated ? translatedName : null)
                || category?.name
                || code;
              return {
                id,
                code,
                name: resolvedName,
              };
            })
            .filter((category) => Boolean(category));

          if (normalizedCategories.length) {
            this.categories = normalizedCategories;
            return;
          }

          this.categories = translatedCategories
            .map((category) => {
              const code = String(category?.code || '').trim();
              const id = category?.id ?? null;
              if (!code || id === null || id === undefined) {
                return null;
              }
              return {
                id,
                code,
                name: category?.name || code,
              };
            })
            .filter((category) => Boolean(category));
        })
        .catch((error) => {
          console.error('Erro ao buscar categorias:', error);
          this.categories = [];
        })
        .finally(() => {
          this.isLoadingCategories = false;
        });
    },
    onCategoryChange(categoryCode) {
      if (categoryCode) {
        this.goalCategorySuggestion = null;
        const suggestions = {
          'carro': 20000,
          'casa': 50000,
          'viagem': 5000,
          'fundo_emergencia': 10000,
          // Adicione outras categorias conforme necessário
        };
        this.goalForm.targetAmount = suggestions[categoryCode] || 0;
      }
    },
    goalCategorySuggestionSourceLabel(source) {
      if (source === 'BANK_MAPPING') return this.$t('financial_goals.ai_source_bank_mapping');
      if (source === 'HISTORY') return this.$t('financial_goals.ai_source_history');
      if (source === 'DOMAIN_ALIAS') return this.$t('financial_goals.ai_source_domain_alias');
      if (source === 'AI_FALLBACK') return this.$t('financial_goals.ai_source_fallback');
      return this.$t('financial_goals.ai_source_generic');
    },
    goalCategoryReasoningLabel(suggestion) {
      const source = String(suggestion?.source || '').trim();
      const reasoning = String(suggestion?.reasoning || '').trim().toLowerCase();

      if (source === 'BANK_MAPPING') return this.$t('financial_goals.ai_reason_bank_mapping');
      if (reasoning.includes('recent categorized expenses')) return this.$t('financial_goals.ai_reason_recent_history');
      if (reasoning.includes('confirmed manually')) return this.$t('financial_goals.ai_reason_manual_feedback');
      if (reasoning.includes('repeated categorized expenses')) return this.$t('financial_goals.ai_reason_repeated_history');
      if (reasoning.includes('exact description')) return this.$t('financial_goals.ai_reason_exact_match');
      if (reasoning.includes('similar description')) return this.$t('financial_goals.ai_reason_similar_match');
      if (reasoning.includes('recurring terms')) return this.$t('financial_goals.ai_reason_recurring_terms');
      if (source === 'DOMAIN_ALIAS') return this.$t('financial_goals.ai_reason_domain_alias');
      return reasoning ? this.$t('financial_goals.ai_reason_history_generic') : '';
    },
    isWeakGoalCategorySuggestion(suggestion) {
      const confidence = Number(suggestion?.suggestedCategory?.confidence || 0);
      const reasoning = String(suggestion?.reasoning || '').trim().toLowerCase();
      const source = suggestion?.source;
      return source === 'AI_FALLBACK' && (confidence <= 0.5 || reasoning === 'model-error');
    },
    suggestGoalCategory() {
      if (!this.canUseAi) {
        this.showSnackbar(this.$t('financial_goals.ai_premium_locked'), 'info');
        this.$router.push({ name: 'choose-plan', query: { feature: 'ai' } });
        return;
      }
      const description = String(this.goalForm.name || '').trim();
      if (!description) {
        return;
      }

      this.isSuggestingGoalCategory = true;
      this.goalCategorySuggestion = null;

      AiService.autoCategorize({
        expenses: [
          {
            description,
            amount: Number(this.goalForm.targetAmount || 1),
          },
        ],
      })
        .then(({ data }) => {
          const suggestion = Array.isArray(data?.suggestions) ? data.suggestions[0] : null;
          if (!suggestion?.suggestedCategory || this.isWeakGoalCategorySuggestion(suggestion)) {
            return;
          }
          this.goalCategorySuggestion = suggestion;
        })
        .catch((error) => {
          console.error('Erro ao sugerir categoria da meta:', error);
        })
        .finally(() => {
          this.isSuggestingGoalCategory = false;
        });
    },
    applyGoalCategorySuggestion() {
      const code = this.goalCategorySuggestion?.suggestedCategory?.code;
      if (!code) {
        return;
      }

      const matchingCategory = this.categories.find((category) => category.code === code);
      if (matchingCategory) {
        this.goalForm.category = matchingCategory.code;
      }
    },
    dismissGoalCategorySuggestion() {
      this.goalCategorySuggestion = null;
    },
    planningHint() {
      const targetAmount = Number(this.goalForm.targetAmount || 0);
      const initialAmount = Number(this.goalForm.initialAmount || 0);
      const monthsRemaining = this.calculateMonthsRemaining(this.goalForm.deadline);

      if (!targetAmount || !monthsRemaining) {
        return this.$t('financial_goals.planning_hint_default');
      }

      const remainingAmount = Math.max(0, targetAmount - initialAmount);
      if (!remainingAmount) {
        return this.$t('financial_goals.planning_hint_goal_reached');
      }

      return this.$t('financial_goals.planning_hint_suggestion', {
        amount: this.formatCurrency(remainingAmount / monthsRemaining),
      });
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
    calculateMonthsRemaining(deadline) {
      if (!deadline) {
        return 0;
      }
      const today = new Date();
      const targetDate = new Date(deadline);
      const diffInMilliseconds = targetDate.getTime() - today.getTime();
      if (diffInMilliseconds <= 0) {
        return 0;
      }
      return Math.max(1, Math.ceil(diffInMilliseconds / (1000 * 60 * 60 * 24 * 30)));
    },
    addMonthsToToday(months) {
      const date = new Date();
      date.setMonth(date.getMonth() + months);
      return date.toISOString().substr(0, 10);
    },
    resolveTemplateCategory(preferredCode) {
      if (!preferredCode) {
        return '';
      }
      const exactMatch = this.categories.find((category) => category.code === preferredCode);
      if (exactMatch) {
        return exactMatch.code;
      }
      const fallbackByName = this.categories.find((category) =>
        String(category.name || '').toLowerCase().includes(String(preferredCode).toLowerCase())
      );
      return fallbackByName?.code || '';
    },
    checkGoalDeadlines() {
      const today = new Date();
      this.financialGoals.forEach((goal) => {
        const deadline = new Date(goal.deadline);
        const daysRemaining = (deadline - today) / (1000 * 60 * 60 * 24);

        if (daysRemaining <= 7 && goal.progress < 100) {
          alert(this.$t('financial_goals.deadline_alert', { goal: goal.name }));
        }
      });
    },
    getCurrentMonthOverview() {
      return {
        totalIncome: this.monthOverview.totalIncome,
        totalExpense: this.monthOverview.totalExpense
      };
    },
    fetchSuggestions() {
      const overview = this.getCurrentMonthOverview();
      if (!this.canFetchSuggestions) {
        this.suggestedGoals = [];
        this.suggestedGoalsFetched = true;
        return;
      }
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
      return new Date(dateStr).toLocaleDateString(this.getFormattingLocale(), options);
    },
    formatCurrency(value) {
      return new Intl.NumberFormat(this.getFormattingLocale(), {
        style: 'currency',
        currency: 'BRL'
      }).format(Number(value || 0));
    },
    getFormattingLocale() {
      const locale = this.$i18n?.locale || 'pt';
      if (locale === 'en') return 'en-US';
      if (locale === 'fr') return 'fr-FR';
      if (locale === 'es') return 'es-ES';
      return 'pt-BR';
    },
    suggestedGoalMessage(suggestion) {
      const amount = this.formatCurrency(suggestion?.suggestedContributionAmount || 0);
      const months = suggestion?.monthsRemaining || 0;
      return this.$t('financial_goals.suggested_goals_result_message', {
        amount,
        months,
      });
    },
    suggestedGoalIcon(suggestion) {
      const category = String(suggestion?.category || '').toLowerCase();
      const name = String(suggestion?.name || '').toLowerCase();
      if (category.includes('viagem') || name.includes('viagem') || name.includes('travel')) return 'mdi-airplane';
      if (category.includes('fundo_emergencia') || name.includes('emerg') || name.includes('reserve')) return 'mdi-shield-check-outline';
      if (category.includes('tecnologia') || name.includes('notebook') || name.includes('laptop')) return 'mdi-laptop';
      if (category.includes('carro') || name.includes('carro') || name.includes('car')) return 'mdi-car-outline';
      return 'mdi-bullseye-arrow';
    },
    suggestedGoalFitScore(suggestion, monthlyRoom) {
      const contribution = Number(suggestion?.suggestedContributionAmount || 0);
      if (contribution <= 0 && monthlyRoom <= 0) {
        return 1;
      }
      if (contribution <= 0) {
        return 0;
      }

      if (monthlyRoom <= 0) {
        return 0;
      }

      if (contribution <= monthlyRoom) {
        // "Sweet spot" de vitrine: algo que use entre ~25% e ~45% da folga mensal.
        // Abaixo disso tende a parecer tímido demais; acima disso começa a competir
        // demais com o restante da vida financeira do usuário.
        const usageRatio = contribution / monthlyRoom;
        const targetRatio = 0.35;
        const distanceFromTarget = Math.abs(usageRatio - targetRatio);
        return 100 + Math.max(0, 1 - distanceFromTarget);
      }

      // Se a sugestão não cabe na folga mensal, ela ainda pode aparecer,
      // mas com penalização forte para ficar atrás das opções mais viáveis.
      const overflowRatio = (contribution - monthlyRoom) / contribution;
      return Math.max(0, 10 - overflowRatio);
    },
    isTopSuggestedGoal(suggestion) {
      const firstSuggestion = this.rankedSuggestedGoals[0];
      return Boolean(firstSuggestion && firstSuggestion.name === suggestion?.name);
    },
    paceStatusLabel(status) {
      if (status === 'AHEAD') return this.$t('financial_goals.pace_ahead');
      if (status === 'AT_RISK') return this.$t('financial_goals.pace_at_risk');
      if (status === 'ON_TRACK') return this.$t('financial_goals.pace_on_track');
      return this.$t('financial_goals.pace_no_data');
    },
    paceStatusClass(status) {
      return {
        'goal-insight-chip--ahead': status === 'AHEAD',
        'goal-insight-chip--risk': status === 'AT_RISK',
        'goal-insight-chip--track': status === 'ON_TRACK',
      };
    },
    goToConnections() {
      this.$router.push({
        path: '/settings',
        query: {
          tab: 'connections',
        },
      });
    },
    showSnackbar(message, color = 'success') {
      this.snackbar.message = message;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },
    scrollToGoal(goalId) {
      this.$nextTick(() => {
        const element = document.getElementById(`goal-${goalId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    }
  },
  mounted() {
    this.loadBillingCapabilities();
    this.fetchCategories();
    this.fetchFinancialGoals();
    this.fetchMonthOverview();
  },
}
</script>

<style scoped>
.financial-goal-shell {
  padding: 0;
}

.suggestions-helper {
  margin: 0 0 16px;
  color: var(--cb-ink-muted);
}

/* ── cb-card overrides for this component ────────────────────────────────── */
.cb-card__body {
  padding: 24px;
}

@media (max-width: 960px) { .cb-card__body { padding: 20px; } }
@media (max-width: 600px) { .cb-card__body { padding: 16px; } }

/* ── Modern input focus glow ──────────────────────────────────────────────── */
.modern-input :deep(.v-field) {
  border-radius: 8px;
}

.modern-input :deep(.v-field--focused) {
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--cb-primary) 12%, transparent);
}

/* ── Goal items ───────────────────────────────────────────────────────────── */
.goal-item {
  padding: 20px;
  background: color-mix(in srgb, var(--cb-primary) 4%, transparent);
  border-radius: 12px;
  margin-bottom: 16px;
  border: 1px solid color-mix(in srgb, var(--cb-primary) 10%, transparent);
  transition: all 0.3s ease;
}

.goal-item:hover {
  background: color-mix(in srgb, var(--cb-primary) 7%, transparent);
  border-color: color-mix(in srgb, var(--cb-primary) 18%, transparent);
}

.goal-item .goal-action-btn {
  min-width: 36px !important;
  width: 36px !important;
  height: 36px !important;
  padding: 0 !important;
  border-radius: 6px !important;
  color: rgba(15, 23, 42, 0.46) !important;
  transition: color 0.18s ease, background-color 0.18s ease;
}

.goal-item .goal-action-btn .v-icon { font-size: 18px !important; }
.goal-item .goal-action-btn--edit .v-icon  { color: rgba(59, 130, 246, 0.74) !important; }
.goal-item .goal-action-btn--delete .v-icon { color: rgba(239, 68, 68, 0.74) !important; }
.goal-item .goal-action-btn:hover { background-color: rgba(15, 23, 42, 0.04) !important; }
.goal-item .goal-action-btn--edit:hover  .v-icon { color: rgba(59, 130, 246, 0.92) !important; }
.goal-item .goal-action-btn--delete:hover .v-icon { color: rgba(239, 68, 68, 0.95) !important; }
.goal-item .goal-action-btn--delete:hover { background-color: rgba(239, 68, 68, 0.08) !important; }

/* ── Progress ─────────────────────────────────────────────────────────────── */
.progress-text {
  font-size: 0.9rem;
  color: var(--cb-ink-muted);
  margin-top: 8px;
  font-weight: 600;
}

/* ── Insight chips ───────────────────────────────────────────────────────── */
.goal-insight-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 10px;
  margin-top: 14px;
}

.goal-insight-chip {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 10px 12px;
  border-radius: 10px;
  background: var(--cb-surface-soft);
  border: 1px solid var(--cb-border-card);
}

.goal-insight-chip__label { font-size: 0.77rem; color: var(--cb-ink-muted); }
.goal-insight-chip__value { font-size: 0.92rem; font-weight: 700; color: var(--cb-ink); }

.goal-insight-chip--ahead { background: rgba(32, 95, 99, 0.08); border-color: rgba(32, 95, 99, 0.18); }
.goal-insight-chip--track { background: rgba(59, 130, 246, 0.08); border-color: rgba(59, 130, 246, 0.16); }
.goal-insight-chip--risk  { background: rgba(217, 119, 6, 0.08); border-color: rgba(217, 119, 6, 0.2); }

.goal-insight-alert   { margin-top: 14px; }
.goal-advanced-panel  { border-radius: 12px; overflow: hidden; }

.goal-planned-message {
  margin-top: 10px;
  font-size: 0.92rem;
  color: var(--cb-ink-muted);
}

/* ── Tip banner ───────────────────────────────────────────────────────────── */
.goal-tip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.goal-tip__button { flex-shrink: 0; }

/* ── Template section ────────────────────────────────────────────────────── */
.goal-template-section__header { margin-bottom: 12px; }

.goal-template-section__title {
  font-size: 1.05rem;
  font-weight: 700;
  margin: 0 0 4px;
  color: var(--cb-ink);
}

.goal-template-section__subtitle {
  margin: 0;
  color: var(--cb-ink-muted);
  font-size: 0.94rem;
}

.goal-template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}

.goal-template-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  width: 100%;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid color-mix(in srgb, var(--cb-primary) 14%, transparent);
  background: color-mix(in srgb, var(--cb-primary) 4%, transparent);
  text-align: left;
  transition: all 0.2s ease;
}

.goal-template-card:hover {
  transform: translateY(-2px);
  border-color: color-mix(in srgb, var(--cb-primary) 26%, transparent);
  box-shadow: 0 8px 20px color-mix(in srgb, var(--cb-primary) 10%, transparent);
}

.goal-template-card__title       { font-weight: 700; color: var(--cb-ink); }
.goal-template-card__description { font-size: 0.92rem; color: var(--cb-ink-muted); }

/* ── Suggestions card ────────────────────────────────────────────────────── */
.suggestions-card {
  background: rgba(255, 193, 7, 0.04);
  border: 1px solid rgba(255, 193, 7, 0.18);
}

.suggestions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 14px;
}

.suggestions-ranking-note {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 2px 2px;
  color: var(--cb-ink-muted);
  font-size: 0.88rem;
}

.suggestion-item {
  padding: 16px;
  background: var(--cb-surface);
  border-radius: 12px;
  border: 1px solid var(--cb-border-card);
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 100%;
}

.suggestion-item__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.suggestion-item__title-group {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-width: 0;
  flex: 1;
}

.suggestion-item__headline {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.suggestion-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--cb-primary) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--cb-primary) 14%, transparent);
  flex-shrink: 0;
}

.suggestion-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 9px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--cb-primary) 10%, transparent);
  color: var(--cb-primary);
  font-size: 0.74rem;
  font-weight: 700;
  white-space: nowrap;
}

.suggestion-name {
  font-size: 1.02rem;
  font-weight: 600;
  color: var(--cb-ink);
  line-height: 1.2;
  word-break: break-word;
}

.suggestion-details {
  font-size: 0.86rem;
  color: var(--cb-ink-muted);
  line-height: 1.35;
  word-break: break-word;
}

.suggestion-note {
  padding: 10px 12px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--cb-accent) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--cb-accent) 14%, transparent);
  color: var(--cb-accent);
  font-size: 0.88rem;
  line-height: 1.45;
}

.suggestion-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: auto;
}

.suggestion-footer__text { font-size: 0.84rem; color: var(--cb-ink-muted); }

/* ── Empty state ─────────────────────────────────────────────────────────── */
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-message    { font-size: 1rem; color: var(--cb-ink-muted); margin: 0; }
.empty-submessage { margin-top: 12px; color: var(--cb-ink-muted); font-size: 0.95rem; }

/* ── AI row ──────────────────────────────────────────────────────────────── */
.goal-ai-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.goal-ai-row__meta           { font-size: 0.9rem; color: var(--cb-ink-muted); }
.goal-ai-suggestion          { display: flex; flex-direction: column; gap: 8px; }
.goal-ai-suggestion__reasoning { color: var(--cb-ink-secondary); }

.goal-ai-suggestion__actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* ── Responsive ──────────────────────────────────────────────────────────── */
@media (max-width: 760px) {
  .goal-tip { flex-direction: column; align-items: flex-start; }
}

@media (max-width: 600px) {
  .suggestion-item__top,
  .suggestion-footer { flex-direction: column; align-items: flex-start; }
  .suggestion-badge  { white-space: normal; }
}
</style>
