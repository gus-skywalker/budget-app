<template>
  <div class="dashboard-container">
    <v-container class="modern-container">
      <div class="dashboard-header">
        <div class="welcome-section">
          <h1 class="page-title">{{ $t('overview.title') }}</h1>
          <p class="page-subtitle">{{ $t('overview.subtitle') }}</p>
        </div>
        <div class="date-badge">
          <div class="month-name">{{ monthName }}</div>
          <div class="full-date">{{ day }}/{{ month }}/{{ year }}</div>
        </div>
      </div>

      <div class="headline-card">
        <v-icon color="#667eea">mdi-lightbulb-outline</v-icon>
        <span>{{ headlineMessage }}</span>
      </div>

      <div class="scope-badge-row">
        <v-chip size="small" color="#667eea" variant="outlined">
          <v-icon start size="14">mdi-account-group-outline</v-icon>
          {{ $t('transactionVisibility.dashboardBadge') }}
        </v-chip>
      </div>

      <v-alert
        v-if="openFinanceConflictCount > 0"
        type="warning"
        variant="tonal"
        class="conflict-banner"
      >
        {{ $t('overview.open_finance_conflicts', { count: openFinanceConflictCount }) }}
      </v-alert>

      <div v-if="openFinanceObservabilitySummary" class="open-finance-overview">
        <div class="overview-pill">
          <span class="overview-pill__label">{{ $t('overview.open_finance_label') }}</span>
          <span class="overview-pill__value">{{ $t('overview.open_finance_accounts', { count: openFinanceObservabilitySummary.connectedAccounts }) }}</span>
        </div>
        <div class="overview-pill">
          <span class="overview-pill__label">{{ $t('overview.imported_label') }}</span>
          <span class="overview-pill__value">{{ openFinanceObservabilitySummary.importedTransactions }}</span>
        </div>
        <div class="overview-pill">
          <span class="overview-pill__label">{{ $t('overview.mappings_label') }}</span>
          <span class="overview-pill__value">{{ openFinanceObservabilitySummary.categoryMappings }}</span>
        </div>
        <div class="overview-pill" :class="{ 'overview-pill--warning': openFinanceObservabilitySummary.accountsAtRateLimitToday > 0 }">
          <span class="overview-pill__label">{{ $t('overview.rate_limit_today') }}</span>
          <span class="overview-pill__value">{{ openFinanceObservabilitySummary.accountsAtRateLimitToday }}</span>
        </div>
        <div v-if="openFinanceObservabilitySummary.lastSyncTrigger" class="overview-pill">
          <span class="overview-pill__label">{{ $t('overview.last_sync') }}</span>
          <span class="overview-pill__value">
            {{ openFinanceObservabilitySummary.lastSyncTrigger === 'AUTOMATIC' ? $t('overview.sync_automatic') : $t('overview.sync_manual') }}
          </span>
          <span
            v-if="openFinanceObservabilitySummary.lastSyncTo"
            class="overview-pill__label"
          >
            {{ formatDate(openFinanceObservabilitySummary.lastSyncTo) }}
          </span>
        </div>
      </div>

      <!-- Activity section removida do dashboard. Acesse pelo menu lateral. -->

      <!-- Trends Over Time -->
      <div class="modern-card trends-section">
        <div class="card-header">
          <h2 class="card-title">
            <v-icon color="#667eea" class="mr-2">mdi-chart-line</v-icon>
            {{ $t('trends.title') }}
          </h2>
        </div>
        <div class="card-content">
          <v-row align="center" class="filters-row">
            <v-col cols="12" md="6" lg="4">
              <v-select
                :label="$t('trends.select_chart_type')"
                variant="outlined"
                v-model="chartType"
                :items="chartTypes"
                @update:modelValue="updateCharts"
                class="modern-select"
                color="#667eea"
              ></v-select>
            </v-col>
            <v-col cols="12" md="6" lg="4">
              <v-select
                :label="$t('trends.select_time_period')"
                variant="outlined"
                v-model="selectedTimePeriod"
                :items="timePeriods"
                @update:modelValue="updateCharts"
                class="modern-select"
                color="#667eea"
              ></v-select>
            </v-col>
            <v-col cols="12" md="6" lg="4">
              <v-select
                :label="$t('trends.select_expense_category')"
                variant="outlined"
                v-model="selectedCategory"
                :items="expenseCategories"
                item-title="name"
                item-value="code"
                clearable
                @update:modelValue="updateCharts"
                class="modern-select"
                color="#667eea"
              ></v-select>
            </v-col>
          </v-row>
          <div class="chart-wrapper">
            <canvas ref="trendsChart"></canvas>
          </div>
        </div>
      </div>

      <section class="section-block">
        <div class="section-header">
          <h2 class="section-title">{{ $t('overview.snapshot_title') }}</h2>
        </div>
        <v-row class="overview-cards">
          <v-col cols="12" md="3">
            <div class="stat-card savings-card stat-card--clickable" @click="openAccountDrillDown()">
              <div class="stat-icon">
                <v-icon size="40" color="white">mdi-piggy-bank</v-icon>
              </div>
              <div class="stat-content">
                <div class="stat-label">{{ $t('overview.snapshot_balance') }}</div>
                <div class="stat-value">{{ formatCurrency(dashboardSummary.totalBalance) }}</div>
              </div>
            </div>
          </v-col>
          <v-col cols="12" md="3">
            <div class="stat-card income-card">
              <div class="stat-icon">
                <v-icon size="40" color="white">mdi-trending-up</v-icon>
              </div>
              <div class="stat-content">
                <div class="stat-label">{{ $t('overview.snapshot_income') }}</div>
                <div class="stat-value">{{ formatCurrency(dashboardSummary.monthlyIncome) }}</div>
              </div>
            </div>
          </v-col>
          <v-col cols="12" md="3">
            <div class="stat-card expense-card stat-card--clickable" @click="openCategoryDrillDown()">
              <div class="stat-icon">
                <v-icon size="40" color="white">mdi-trending-down</v-icon>
              </div>
              <div class="stat-content">
                <div class="stat-label">{{ $t('overview.snapshot_expenses') }}</div>
                <div class="stat-value">{{ formatCurrency(dashboardSummary.monthlyExpenses) }}</div>
              </div>
            </div>
          </v-col>
          <v-col cols="12" md="3">
            <div class="stat-card cashflow-card">
              <div class="stat-icon">
                <v-icon size="40" color="white">mdi-chart-areaspline</v-icon>
              </div>
              <div class="stat-content">
                <div class="stat-label">{{ $t('overview.snapshot_net') }}</div>
                <div class="stat-value">{{ formatCurrency(netMonthlyCashflow) }}</div>
              </div>
            </div>
          </v-col>
        </v-row>
      </section>

      <section class="section-block">
        <div class="section-header">
          <h2 class="section-title">{{ $t('overview.cashflow_decision_title') }}</h2>
          <v-btn size="small" variant="text" @click="openCashflowView">
            <v-icon start>mdi-open-in-new</v-icon>
            {{ $t('overview.view_cashflow') }}
          </v-btn>
        </div>
        <div v-if="hasCashflowDecisionData" class="projection-grid">
          <div class="projection-card">
            <div class="projection-label">{{ $t('overview.cashflow_decision_status') }}</div>
            <div class="decision-chip" :class="decisionChipClass">
              {{ cashflowDecisionLabel }}
            </div>
          </div>
          <div class="projection-card">
            <div class="projection-label">{{ $t('overview.cashflow_available_for_goals') }}</div>
            <div class="projection-value">{{ formatCurrency(cashflowDecisionData.availableForGoals) }}</div>
          </div>
          <div class="projection-card">
            <div class="projection-label">{{ $t('overview.cashflow_required_adjustment') }}</div>
            <div class="projection-value">{{ formatCurrency(cashflowDecisionData.requiredMonthlyAdjustment) }}</div>
          </div>
          <div class="projection-card">
            <div class="projection-label">{{ $t('overview.cashflow_goals_impact') }}</div>
            <div class="projection-value">{{ cashflowGoalsImpactLabel }}</div>
          </div>
        </div>
        <div v-if="hasCashflowDecisionData && cashflowDecisionSummary" class="insight-pill mt-4">
          <v-icon size="18" color="#667eea">mdi-lightbulb-outline</v-icon>
          <span>{{ cashflowDecisionSummary }}</span>
        </div>
        <div v-if="hasCashflowDecisionContext" class="cashflow-action-grid mt-4">
          <div v-if="cashflowPrimaryDriver" class="projection-card">
            <div class="projection-label">{{ $t('overview.cashflow_primary_driver') }}</div>
            <div class="projection-context">{{ cashflowPrimaryDriver }}</div>
          </div>
          <div v-if="cashflowRecommendedAction" class="projection-card">
            <div class="projection-label">{{ $t('overview.cashflow_recommended_action') }}</div>
            <div class="projection-context">{{ cashflowRecommendedAction }}</div>
            <div v-if="cashflowRecommendedActionAmount > 0" class="projection-value">
              {{ formatCurrency(cashflowRecommendedActionAmount) }}
            </div>
          </div>
          <div v-if="cashflowOpportunityMessage" class="projection-card">
            <div class="projection-label">{{ $t('overview.cashflow_opportunity') }}</div>
            <div class="projection-context">{{ cashflowOpportunityMessage }}</div>
          </div>
        </div>
        <div v-if="hasCreditCardPredictionContext" class="cashflow-action-grid mt-4">
          <div v-if="creditCardPendingAmount > 0" class="projection-card projection-card--warning">
            <div class="projection-label">{{ $t('overview.credit_card_pending_title') }}</div>
            <div class="projection-value">{{ formatCurrency(creditCardPendingAmount) }}</div>
            <div class="projection-context">{{ creditCardPendingMessage }}</div>
          </div>
          <div v-if="creditCardRecurringAverage > 0" class="projection-card">
            <div class="projection-label">{{ $t('overview.credit_card_recurring_title') }}</div>
            <div class="projection-value">{{ formatCurrency(creditCardRecurringAverage) }}</div>
            <div class="projection-context">{{ creditCardRecurringMessage }}</div>
          </div>
          <div v-if="creditCardShareValue > 0" class="projection-card">
            <div class="projection-label">{{ $t('overview.credit_card_share_title') }}</div>
            <div class="projection-value">{{ creditCardShareLabel }}</div>
            <div class="projection-context">{{ creditCardShareMessage }}</div>
          </div>
        </div>
        <div v-else class="projection-placeholder">
          <p>{{ $t('overview.cashflow_decision_placeholder') }}</p>
        </div>
      </section>

      <v-row class="two-column-grid">
        <v-col cols="12" lg="6">
          <div class="modern-card">
            <div class="card-header">
              <h2 class="card-title">
                <v-icon color="#667eea" class="mr-2">mdi-speedometer</v-icon>
                {{ $t('overview.momentum_title') }}
              </h2>
            </div>
            <div class="card-content">
              <div v-if="hasMomentumData" class="bar-compare">
                <div class="bar-row">
                  <span>{{ $t('overview.momentum_current') }}</span>
                  <div class="bar-track">
                    <div class="bar-fill negative" :style="{ width: momentumCurrentWidth }"></div>
                  </div>
                  <span>{{ formatCurrency(dashboardSummary.monthlyExpenses) }}</span>
                </div>
                <div class="bar-row">
                  <span>{{ $t('overview.momentum_previous') }}</span>
                  <div class="bar-track">
                    <div class="bar-fill neutral" :style="{ width: momentumPreviousWidth }"></div>
                  </div>
                  <span>{{ formatCurrency(previousMonthExpenses) }}</span>
                </div>
                <p class="context-message">{{ momentumMessage }}</p>
              </div>
              <div v-else class="empty-state">
                <p class="empty-message">{{ $t('overview.momentum_placeholder') }}</p>
              </div>
            </div>
          </div>
        </v-col>
        <v-col cols="12" lg="6">
          <div class="modern-card">
            <div class="card-header">
              <h2 class="card-title">
                <v-icon color="#667eea" class="mr-2">mdi-scale-balance</v-icon>
                {{ $t('overview.money_flow_title') }}
              </h2>
            </div>
            <div class="card-content">
              <div class="bar-compare">
                <div class="bar-row">
                  <span>{{ $t('overview.money_flow_income') }}</span>
                  <div class="bar-track">
                    <div class="bar-fill positive" :style="{ width: incomeBarWidth }"></div>
                  </div>
                  <span>{{ formatCurrency(dashboardSummary.monthlyIncome) }}</span>
                </div>
                <div class="bar-row">
                  <span>{{ $t('overview.money_flow_expenses') }}</span>
                  <div class="bar-track">
                    <div class="bar-fill negative" :style="{ width: expenseBarWidth }"></div>
                  </div>
                  <span>{{ formatCurrency(dashboardSummary.monthlyExpenses) }}</span>
                </div>
              </div>
              <p class="context-message">{{ moneyFlowMessage }}</p>
            </div>
          </div>
        </v-col>
      </v-row>

      <v-row class="two-column-grid">
        <v-col cols="12" lg="6">
          <div class="modern-card">
            <div class="card-header">
              <h2 class="card-title">
                <v-icon color="#667eea" class="mr-2">mdi-shape-outline</v-icon>
                {{ $t('overview.top_categories_title') }}
              </h2>
              <v-btn size="small" variant="text" @click="openExpenseReport()">
                <v-icon start>mdi-file-chart-outline</v-icon>
                {{ $t('overview.view_report') }}
              </v-btn>
            </div>
            <div class="card-content">
              <div v-if="topCategoriesDisplay.length" class="categories-list">
                <div
                  v-for="category in topCategoriesDisplay"
                  :key="category"
                  class="category-row category-row--clickable"
                  @click="openCategoryDrillDown(category)"
                >
                  <v-icon size="18" color="#667eea">mdi-tag-outline</v-icon>
                  <span>{{ category }}</span>
                  <v-btn
                    icon
                    size="x-small"
                    variant="text"
                    @click.stop="openExpenseReport(category)"
                  >
                    <v-icon size="18" color="#667eea">mdi-file-chart-outline</v-icon>
                  </v-btn>
                  <v-icon size="18" color="#9e9e9e">mdi-trending-neutral</v-icon>
                </div>
              </div>
              <div v-else class="empty-state">
                <p class="empty-message">{{ $t('overview.no_top_categories') }}</p>
              </div>
            </div>
          </div>
        </v-col>
        <v-col cols="12" lg="6">
          <div class="modern-card">
            <div class="card-header">
              <h2 class="card-title">
                <v-icon color="#667eea" class="mr-2">mdi-calendar-alert</v-icon>
                {{ $t('overview.upcoming_title') }}
              </h2>
            </div>
            <div class="card-content">
              <div v-if="upcomingExpenses.length" class="upcoming-list">
                <div v-for="expense in upcomingExpensesDisplay" :key="expense.title" class="upcoming-row">
                  <div>
                    <div class="upcoming-title">{{ expense.title }}</div>
                    <div class="upcoming-date">{{ expense.dueDate }}</div>
                  </div>
                  <div class="upcoming-amount">{{ formatCurrency(expense.amount) }}</div>
                </div>
              </div>
              <div v-else class="empty-state">
                <p class="empty-message">{{ $t('overview.upcoming_placeholder') }}</p>
              </div>
            </div>
          </div>
        </v-col>
      </v-row>

      <section class="section-block">
        <div class="section-header">
          <h2 class="section-title">{{ $t('overview.goals_at_risk_title') }}</h2>
          <v-btn size="small" variant="text" @click="openGoalsView">
            <v-icon start>mdi-open-in-new</v-icon>
            {{ $t('overview.view_goals') }}
          </v-btn>
        </div>
        <div v-if="goalsAtRisk.length" class="goals-grid">
          <div v-for="goal in goalsAtRisk" :key="goal.id" class="goal-card">
            <div class="goal-header">
              <h3 class="goal-name">{{ goal.name }}</h3>
            </div>
            <div class="goal-details">
              <div class="goal-info">
                <span class="info-label">{{ $t('overview.goal_remaining') }}</span>
                <span class="info-value">{{ formatCurrency(goal.remainingAmount) }}</span>
              </div>
              <div class="goal-info">
                <span class="info-label">{{ $t('overview.goal_monthly_suggestion') }}</span>
                <span class="info-value">{{ formatCurrency(goal.suggestedContributionAmount) }}</span>
              </div>
              <div class="goal-info">
                <span class="info-label">{{ $t('overview.goal_deadline') }}</span>
                <span class="info-value">{{ $t('overview.goal_months_remaining', { count: goal.monthsRemaining || 0 }) }}</span>
              </div>
              <div class="progress-section">
                <div class="progress-header">
                  <span class="info-label">{{ $t('overview.goal_pace') }}</span>
                  <v-chip size="small" color="warning" variant="tonal">
                    {{ paceStatusLabel(goal.paceStatus) }}
                  </v-chip>
                </div>
                <p class="context-message">{{ goal.insightMessage }}</p>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="projection-placeholder">
          <p>{{ $t('overview.no_goals_at_risk') }}</p>
        </div>
      </section>

      <section class="section-block">
        <div class="section-header">
          <h2 class="section-title">{{ $t('overview.goals_ahead_title') }}</h2>
          <v-btn size="small" variant="text" @click="openGoalsView">
            <v-icon start>mdi-open-in-new</v-icon>
            {{ $t('overview.view_goals') }}
          </v-btn>
        </div>
        <div v-if="goalOpportunities.length" class="goals-grid">
          <div v-for="goal in goalOpportunities" :key="goal.id" class="goal-card">
            <div class="goal-header">
              <h3 class="goal-name">{{ goal.name }}</h3>
            </div>
            <div class="goal-details">
              <div class="goal-info">
                <span class="info-label">{{ $t('overview.goal_remaining') }}</span>
                <span class="info-value">{{ formatCurrency(goal.remainingAmount) }}</span>
              </div>
              <div class="goal-info">
                <span class="info-label">{{ $t('overview.goal_monthly_suggestion') }}</span>
                <span class="info-value">{{ formatCurrency(goal.suggestedContributionAmount) }}</span>
              </div>
              <div class="goal-info">
                <span class="info-label">{{ $t('overview.goal_deadline') }}</span>
                <span class="info-value">{{ $t('overview.goal_months_remaining', { count: goal.monthsRemaining || 0 }) }}</span>
              </div>
              <div class="progress-section">
                <div class="progress-header">
                  <span class="info-label">{{ $t('overview.goal_pace') }}</span>
                  <v-chip size="small" color="success" variant="tonal">
                    {{ paceStatusLabel(goal.paceStatus) }}
                  </v-chip>
                </div>
                <p class="context-message">{{ goal.insightMessage }}</p>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="projection-placeholder">
          <p>{{ $t('overview.no_goals_ahead') }}</p>
        </div>
      </section>

      <section class="section-block">
        <div class="section-header">
          <h2 class="section-title">{{ $t('overview.projection_title') }}</h2>
        </div>
        <div v-if="hasProjectionData" class="projection-grid">
          <div class="projection-card">
            <div class="projection-label">{{ $t('overview.projection_3m') }}</div>
            <div class="projection-value">{{ formatCurrency(projectedBalanceForMonths(3)) }}</div>
          </div>
          <div class="projection-card">
            <div class="projection-label">{{ $t('overview.projection_6m') }}</div>
            <div class="projection-value">{{ formatCurrency(projectedBalanceForMonths(6)) }}</div>
          </div>
          <div class="projection-card">
            <div class="projection-label">{{ $t('overview.projection_12m') }}</div>
            <div class="projection-value">{{ formatCurrency(projectedBalanceForMonths(12)) }}</div>
          </div>
        </div>
        <div v-if="hasProjectionData && projectionContextMessage" class="insight-pill mt-4">
          <v-icon size="18" color="#667eea">mdi-chart-timeline-variant</v-icon>
          <span>{{ projectionContextMessage }}</span>
        </div>
        <div v-else class="projection-placeholder">
          <p>{{ $t('overview.projection_placeholder') }}</p>
        </div>
      </section>

      <section class="section-block">
        <div class="section-header">
          <h2 class="section-title">Insights</h2>
        </div>
        <div v-if="financialInsightsLoading" class="projection-placeholder">
          <p>Loading insights...</p>
        </div>
        <div v-else-if="hasRuleBasedInsights" class="insights-grid">
          <div v-for="insight in financialInsights" :key="`${insight.type}-${insight.message}`" class="insight-pill">
            <v-icon size="18" :color="insightColor(insight.type)">{{ insightIcon(insight.type) }}</v-icon>
            <span :class="insightMessageClass(insight.type)">{{ insight.message }}</span>
          </div>
        </div>
        <div v-else class="projection-placeholder">
          <p>No insights yet</p>
        </div>
      </section>

      <section class="section-block">
        <div class="section-header">
          <h2 class="section-title">{{ $t('overview.decisions_title') }}</h2>
        </div>
        <div v-if="hasDecisions" class="decisions-grid">
          <div
            v-for="decision in overviewDecisions"
            :key="decision.title"
            class="decision-card"
            :class="decision.cardClass"
          >
            <div class="decision-card__header">
              <h3 class="decision-card__title">{{ decision.title }}</h3>
              <v-chip size="x-small" variant="tonal" color="#667eea">{{ decision.status }}</v-chip>
            </div>
            <p class="decision-card__description">{{ decision.description }}</p>
            <div class="decision-card__meta">{{ decision.impact }}</div>
          </div>
        </div>
        <div v-else class="projection-placeholder">
          <p>{{ $t('overview.decisions_placeholder') }}</p>
        </div>
      </section>

      <section class="section-block">
        <div class="section-header">
          <h2 class="section-title">Impact of Decisions</h2>
          <v-btn size="small" variant="text" @click="$router.push('/decisions')">
            <v-icon start>mdi-open-in-new</v-icon>
            Decisions
          </v-btn>
        </div>
        <div v-if="approvedDecisionCards.length" class="decisions-grid">
          <div v-for="decision in approvedDecisionCards" :key="decision.id" class="decision-card decision-card--opportunity">
            <div class="decision-card__header">
              <h3 class="decision-card__title">{{ decision.title }}</h3>
              <v-chip size="x-small" variant="tonal" color="success">APPROVED</v-chip>
            </div>
            <p class="decision-card__description">{{ decision.scenarioLabel }}</p>
            <div class="decision-card__meta">{{ decision.impactLabel }}</div>
          </div>
        </div>
        <div v-else class="projection-placeholder">
          <p>No approved decisions yet. Turn scenarios into team decisions.</p>
        </div>
        <div class="insight-pill mt-4">
          <v-icon size="18" color="#667eea">mdi-chart-line</v-icon>
          <span>{{ approvedImpactSummary }}</span>
        </div>
      </section>

      <section class="section-block">
        <div class="section-header">
          <h2 class="section-title">Planned vs Actual</h2>
        </div>

        <div v-if="budgetComparisonLoading" class="projection-placeholder">
          <p>Loading planned vs actual...</p>
        </div>

        <template v-else-if="budgetComparisonState === 'no-budget'">
          <div class="projection-placeholder">
            <p>Create a plan to start tracking performance</p>
          </div>
        </template>

        <template v-else-if="budgetComparison">
          <div class="projection-grid">
            <div class="projection-card">
              <div class="projection-label">Planned Net</div>
              <div class="projection-value">{{ formatCurrency(budgetComparison.summary.plannedNet) }}</div>
            </div>
            <div class="projection-card">
              <div class="projection-label">Actual Net</div>
              <div class="projection-value">{{ formatCurrency(budgetComparison.summary.actualNet) }}</div>
            </div>
            <div class="projection-card">
              <div class="projection-label">Difference</div>
              <div class="projection-value" :class="budgetComparison.summary.netDelta < 0 ? 'delta-negative' : 'delta-positive'">
                {{ formatCurrency(budgetComparison.summary.netDelta) }}
              </div>
            </div>
          </div>

          <div class="insight-pill mt-4">
            <v-icon size="18" :color="budgetComparison.summary.netDelta < 0 ? '#ef4444' : '#16a34a'">mdi-information-outline</v-icon>
            <span>{{ comparisonInsightText }}</span>
          </div>

          <div v-if="!hasComparisonActivity" class="projection-placeholder mt-4">
            <p>No activity yet this month</p>
          </div>
          <div v-else class="comparison-table-wrap mt-4">
            <v-table density="comfortable">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Planned</th>
                  <th>Actual</th>
                  <th>Delta</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="line in displayedComparisonLines" :key="`${line.type}-${line.category}`">
                  <td>
                    {{ line.category }}
                    <span class="line-type ml-1">{{ line.type }}</span>
                  </td>
                  <td>{{ formatCurrency(line.planned) }}</td>
                  <td>{{ formatCurrency(line.actual) }}</td>
                  <td :class="line.delta < 0 ? 'delta-negative' : 'delta-positive'">{{ formatCurrency(line.delta) }}</td>
                  <td>
                    <v-chip size="x-small" variant="tonal" :color="comparisonStatusColor(line.status)">
                      {{ line.status }}
                    </v-chip>
                  </td>
                </tr>
              </tbody>
            </v-table>

            <div class="comparison-actions">
              <v-btn
                v-if="sortedComparisonLines.length > 5"
                variant="text"
                color="#667eea"
                @click="showAllComparisonLines = !showAllComparisonLines"
              >
                {{ showAllComparisonLines ? 'Show Top 5' : 'View All' }}
              </v-btn>
            </div>
          </div>
        </template>
      </section>
    </v-container>

    <v-dialog v-model="drillDownDialog" max-width="960">
      <v-card class="modern-dialog-card">
        <v-card-title class="dialog-header">
          <v-icon color="#667eea" class="mr-2">
            {{ drillDownMode === 'account' ? 'mdi-bank-outline' : 'mdi-shape-outline' }}
          </v-icon>
          <span class="headline">{{ drillDownTitle }}</span>
        </v-card-title>
        <v-card-text class="dialog-content">
          <div class="drilldown-summary">
            <div class="overview-pill">
              <span class="overview-pill__label">Transações</span>
              <span class="overview-pill__value">{{ drillDownTransactions.length }}</span>
            </div>
            <div class="overview-pill">
              <span class="overview-pill__label">Volume</span>
              <span class="overview-pill__value">{{ formatCurrency(drillDownTotalAmount) }}</span>
            </div>
          </div>

          <div v-if="drillDownMode === 'category'" class="transactions-list">
            <div
              v-for="transaction in drillDownTransactions"
              :key="transaction.id"
              class="transaction-row"
            >
              <div>
                <div class="upcoming-title">{{ transaction.description }}</div>
                <div class="upcoming-date">
                  {{ formatTransactionDate(transaction.date) }} • {{ transaction.accountName || 'Sem conta' }}
                </div>
              </div>
              <div class="transaction-row__amount">
                {{ formatCurrency(Math.abs(transaction.amount)) }}
              </div>
            </div>
          </div>

          <div v-else class="transactions-list">
            <div
              v-for="item in accountDrillDownGroups"
              :key="item.accountId"
              class="transaction-row transaction-row--stacked"
            >
              <div>
                <div class="upcoming-title">{{ item.accountName }}</div>
                <div class="upcoming-date">{{ item.transactionCount }} transação(ões) no período</div>
              </div>
              <div class="transaction-row__amount">
                {{ formatCurrency(item.totalAmount) }}
              </div>
            </div>
          </div>

          <div v-if="!drillDownTransactions.length" class="empty-state">
            <p class="empty-message">Nenhum dado encontrado para esse recorte.</p>
          </div>
        </v-card-text>
        <v-card-actions class="dialog-actions">
          <v-spacer />
          <v-btn variant="text" @click="drillDownDialog = false">Fechar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>


<script>
import { Chart, registerables } from 'chart.js/auto'
import moment from 'moment'
import DataService from '@/services/DataService'
import FinancialReadService from '@/services/FinancialReadService'
import FinancialGoalService from '@/services/FinancialGoalService'
import OpenFinanceService from '@/services/OpenFinanceService'
import AiService from '@/services/aiService'
import ActivityService from '@/services/ActivityService'
import ScenarioService from '@/services/ScenarioService'
import DecisionService from '@/services/DecisionService'
import BudgetService from '@/services/BudgetService'
import BillingOrchestrationService from '@/services/BillingOrchestrationService'
import { resolveAnyWorkspaceContext } from '@/services/BillingWorkspaceContext'
import { useUserStore } from '@/plugins/userStore'
import 'chartjs-adapter-moment'

Chart.register(...registerables)

export default {
  name: 'DashboardView',
  computed: {
    netMonthlyCashflow() {
      return Number(this.dashboardSummary.monthlyIncome || 0) - Number(this.dashboardSummary.monthlyExpenses || 0)
    },
    comparisonInsightText() {
      const netDelta = Number(this.budgetComparison?.summary?.netDelta || 0)
      if (netDelta < 0) {
        return "You're spending more than planned"
      }
      if (netDelta > 0) {
        return "You're outperforming your plan"
      }
      return 'You are on plan this month'
    },
    sortedComparisonLines() {
      const lines = Array.isArray(this.budgetComparison?.lines) ? this.budgetComparison.lines : []
      return [...lines].sort((left, right) => Math.abs(Number(right.delta || 0)) - Math.abs(Number(left.delta || 0)))
    },
    displayedComparisonLines() {
      return this.showAllComparisonLines ? this.sortedComparisonLines : this.sortedComparisonLines.slice(0, 5)
    },
    hasComparisonActivity() {
      const summary = this.budgetComparison?.summary
      if (!summary) return false
      return Number(summary.actualIncome || 0) !== 0 || Number(summary.actualExpense || 0) !== 0
    },
    hasData() {
      return (
        Number(this.dashboardSummary.totalBalance || 0) !== 0 ||
        Number(this.dashboardSummary.monthlyIncome || 0) !== 0 ||
        Number(this.dashboardSummary.monthlyExpenses || 0) !== 0
      )
    },
    headlineMessage() {
      if (!this.hasData) {
        return this.$t('overview.headline_placeholder')
      }

      if (this.cashflowDecisionData?.decisionStatus === 'ACTION_NEEDED') {
        return this.$t('overview.headline_action_needed', {
          amount: this.formatCurrency(this.cashflowDecisionData.requiredMonthlyAdjustment || 0),
        })
      }

      if (this.goalsAtRisk.length > 0) {
        return this.$t('overview.headline_goal_risk', {
          goal: this.goalsAtRisk[0]?.name || this.$t('overview.goal_generic_label'),
        })
      }

      if (this.topCategoriesDisplay.length > 0) {
        return this.$t('overview.headline_category_attention', {
          category: this.topCategoriesDisplay[0],
        })
      }

      if (this.netMonthlyCashflow >= 0) {
        return this.$t('overview.headline_positive', {
          amount: this.formatCurrency(this.netMonthlyCashflow),
        })
      }

      return this.$t('overview.headline_negative', {
        amount: this.formatCurrency(Math.abs(this.netMonthlyCashflow)),
      })
    },
    previousMonthExpenses() {
      const value = this.dashboardSummary.previousMonthExpenses
      const numeric = Number(value)
      return Number.isFinite(numeric) ? numeric : null
    },
    hasMomentumData() {
      return Number.isFinite(this.previousMonthExpenses) && this.previousMonthExpenses !== null
    },
    momentumMessage() {
      if (!this.hasMomentumData) {
        return ''
      }
      const current = Number(this.dashboardSummary.monthlyExpenses || 0)
      const previous = Number(this.previousMonthExpenses || 0)
      if (current === previous) {
        return this.$t('overview.momentum_flat')
      }
      if (current < previous) {
        return this.$t('overview.momentum_down')
      }
      return this.$t('overview.momentum_up')
    },
    momentumCurrentWidth() {
      if (!this.hasMomentumData) return '0%'
      const current = Number(this.dashboardSummary.monthlyExpenses || 0)
      const previous = Number(this.previousMonthExpenses || 0)
      const max = Math.max(current, previous, 1)
      return `${(current / max) * 100}%`
    },
    momentumPreviousWidth() {
      if (!this.hasMomentumData) return '0%'
      const current = Number(this.dashboardSummary.monthlyExpenses || 0)
      const previous = Number(this.previousMonthExpenses || 0)
      const max = Math.max(current, previous, 1)
      return `${(previous / max) * 100}%`
    },
    incomeBarWidth() {
      const income = Number(this.dashboardSummary.monthlyIncome || 0)
      const expenses = Number(this.dashboardSummary.monthlyExpenses || 0)
      const max = Math.max(income, expenses, 1)
      return `${(income / max) * 100}%`
    },
    expenseBarWidth() {
      const income = Number(this.dashboardSummary.monthlyIncome || 0)
      const expenses = Number(this.dashboardSummary.monthlyExpenses || 0)
      const max = Math.max(income, expenses, 1)
      return `${(expenses / max) * 100}%`
    },
    moneyFlowMessage() {
      if (!this.hasData) {
        return this.$t('overview.money_flow_placeholder')
      }
      if (this.netMonthlyCashflow >= 0) {
        return this.$t('overview.money_flow_positive')
      }
      return this.$t('overview.money_flow_negative')
    },
    hasProjectionData() {
      return this.hasData
    },
    firstProjectionRiskMonth() {
      if (this.cashflowDecisionData?.nextRiskMonth) {
        return this.cashflowDecisionData.nextRiskMonth
      }
      const forecast = Array.isArray(this.cashflowDecisionData?.forecast) ? this.cashflowDecisionData.forecast : []
      return forecast.find((item) => item?.status === 'deficit')?.month || null
    },
    projectionContextMessage() {
      if (this.firstProjectionRiskMonth) {
        return this.$t('overview.projection_risk_month', { month: this.firstProjectionRiskMonth })
      }
      if (this.cashflowDecisionData?.decisionStatus === 'ACTION_NEEDED') {
        return this.$t('overview.projection_action_needed')
      }
      if (this.cashflowDecisionData?.decisionStatus === 'WATCH') {
        return this.$t('overview.projection_watch')
      }
      if (this.cashflowDecisionData?.decisionStatus === 'STABLE') {
        return this.$t('overview.projection_stable')
      }
      return ''
    },
    topCategoriesDisplay() {
      if (Array.isArray(this.dashboardSummary.topCategories) && this.dashboardSummary.topCategories.length) {
        return this.dashboardSummary.topCategories
      }

      const categoryCounts = new Map()
      this.monthTransactions
        .filter((transaction) => transaction?.direction === 'OUTFLOW' && transaction?.category)
        .forEach((transaction) => {
          const key = String(transaction.category).trim()
          if (!key) return
          categoryCounts.set(key, (categoryCounts.get(key) || 0) + 1)
        })

      return Array.from(categoryCounts.entries())
        .sort((left, right) => right[1] - left[1])
        .slice(0, 5)
        .map(([category]) => category)
    },
    // activityFilters e filteredRecentActivity removidos pois Activity não está mais no dashboard
    upcomingExpensesDisplay() {
      return Array.isArray(this.upcomingExpenses) ? this.upcomingExpenses.slice(0, 5) : []
    },
    cashflowDecisionData() {
      if (this.cashflowInsightsSummary?.decisionStatus) {
        return this.cashflowInsightsSummary
      }
      if (!this.hasData) {
        return null
      }
      return {
        decisionStatus: this.netMonthlyCashflow < 0 ? 'ACTION_NEEDED' : (this.goalsAtRisk.length ? 'WATCH' : 'STABLE'),
        availableForGoals: Math.max(this.netMonthlyCashflow, 0),
        requiredMonthlyAdjustment: Math.max(this.netMonthlyCashflow * -1, 0),
        goalsAtRiskCount: this.goalsAtRisk.length,
        goalsOnTrackCount: this.goalOpportunities.length,
        insights: [this.cashflowFallbackSummary],
      }
    },
    hasCashflowDecisionData() {
      return Boolean(this.cashflowDecisionData?.decisionStatus)
    },
    hasCashflowDecisionContext() {
      return Boolean(this.cashflowPrimaryDriver || this.cashflowRecommendedAction || this.cashflowOpportunityMessage)
    },
    hasRuleBasedInsights() {
      return this.financialInsights.length > 0
    },
    hasDecisions() {
      return this.overviewDecisions.length > 0
    },
    approvedImpactSummary() {
      const amount = this.formatCurrency(this.approvedDecisionImpactTotal || 0)
      const direction = Number(this.approvedDecisionImpactTotal || 0) < 0 ? 'reduced' : 'increased'
      return `Approved decisions ${direction} net by ${amount} this month`
    },
    overviewInsights() {
      const insights = []

      if (this.hasMomentumData) {
        insights.push(this.momentumMessage)
      }

      if (this.hasCashflowDecisionData && this.cashflowDecisionSummary) {
        insights.push(this.cashflowDecisionSummary)
      }

      if (this.cashflowPrimaryDriver && this.cashflowPrimaryDriver !== this.cashflowDecisionSummary) {
        insights.push(this.cashflowPrimaryDriver)
      }

      if (this.topCategoriesDisplay.length > 0) {
        insights.push(this.$t('overview.top_category_signal', { category: this.topCategoriesDisplay[0] }))
      }

      if (this.goalsAtRisk.length > 0) {
        insights.push(this.$t('overview.goals_risk_signal', { count: this.goalsAtRisk.length }))
      } else if (this.goalOpportunities.length > 0) {
        insights.push(this.$t('overview.goals_opportunity_signal', { count: this.goalOpportunities.length }))
      }

      if (this.cashflowOpportunityMessage) {
        insights.push(this.cashflowOpportunityMessage)
      }

      return insights
        .filter((text) => Boolean(text && String(text).trim()))
        .slice(0, 4)
    },
    overviewDecisions() {
      const decisions = []

      if (this.cashflowDecisionData?.decisionStatus === 'ACTION_NEEDED') {
        decisions.push({
          severity: 'critical',
          title: this.$t('overview.decision_adjust_cashflow_title'),
          description: this.cashflowRecommendedAction || this.cashflowPrimaryDriver || this.$t('overview.decision_adjust_cashflow_desc'),
          impact: this.$t('overview.decision_adjust_cashflow_impact', {
            amount: this.formatCurrency(this.cashflowRecommendedActionAmount || this.cashflowDecisionData.requiredMonthlyAdjustment || 0),
          }),
          status: this.$t('overview.decision_status_priority'),
          cardClass: 'decision-card--critical',
        })
      }

      if (this.goalsAtRisk.length > 0) {
        const primaryGoal = this.goalsAtRisk[0]
        decisions.push({
          severity: 'high',
          title: this.$t('overview.decision_review_goal_title', { goal: primaryGoal.name }),
          description: primaryGoal.insightMessage || this.$t('overview.decision_review_goal_desc'),
          impact: this.$t('overview.decision_review_goal_impact', {
            amount: this.formatCurrency(primaryGoal.suggestedContributionAmount || 0),
          }),
          status: this.$t('overview.decision_status_review'),
          cardClass: 'decision-card--high',
        })
      }

      if (this.topCategoriesDisplay.length > 0) {
        decisions.push({
          severity: 'medium',
          title: this.$t('overview.decision_investigate_category_title', { category: this.topCategoriesDisplay[0] }),
          description: this.$t('overview.decision_investigate_category_desc'),
          impact: this.$t('overview.decision_investigate_category_impact'),
          status: this.$t('overview.decision_status_suggested'),
          cardClass: 'decision-card--medium',
        })
      }

      if (this.goalOpportunities.length > 0) {
        const firstGoal = this.goalOpportunities[0]
        decisions.push({
          severity: 'opportunity',
          title: this.$t('overview.decision_accelerate_goal_title', { goal: firstGoal.name }),
          description: firstGoal.insightMessage || this.$t('overview.decision_accelerate_goal_desc'),
          impact: this.$t('overview.decision_accelerate_goal_impact', {
            amount: this.formatCurrency(firstGoal.suggestedContributionAmount || 0),
          }),
          status: this.$t('overview.decision_status_opportunity'),
          cardClass: 'decision-card--opportunity',
        })
      }

      const priority = {
        critical: 0,
        high: 1,
        medium: 2,
        opportunity: 3,
      }

      return decisions
        .sort((left, right) => priority[left.severity] - priority[right.severity])
        .slice(0, 3)
    },
    cashflowDecisionLabel() {
      const status = this.cashflowDecisionData?.decisionStatus
      if (status === 'ACTION_NEEDED') return this.$t('overview.cashflow_decision_action_needed')
      if (status === 'WATCH') return this.$t('overview.cashflow_decision_watch')
      if (status === 'STABLE') return this.$t('overview.cashflow_decision_stable')
      return this.$t('overview.cashflow_decision_no_data')
    },
    decisionChipClass() {
      const status = this.cashflowDecisionData?.decisionStatus
      if (status === 'ACTION_NEEDED') return 'decision-chip--danger'
      if (status === 'WATCH') return 'decision-chip--warning'
      return 'decision-chip--success'
    },
    cashflowGoalsImpactLabel() {
      const atRisk = Number(this.cashflowDecisionData?.goalsAtRiskCount || 0)
      const onTrack = Number(this.cashflowDecisionData?.goalsOnTrackCount || 0)
      if (atRisk > 0) {
        return this.$t('overview.cashflow_goals_at_risk', { count: atRisk })
      }
      if (onTrack > 0) {
        return this.$t('overview.cashflow_goals_on_track', { count: onTrack })
      }
      return this.$t('overview.cashflow_goals_none')
    },
    cashflowDecisionSummary() {
      const insights = Array.isArray(this.cashflowDecisionData?.insights) ? this.cashflowDecisionData.insights : []
      return insights.find((item) => item && item.trim()) || ''
    },
    cashflowPrimaryDriver() {
      return this.cashflowDecisionData?.primaryDriver || this.cashflowFallbackPrimaryDriver
    },
    cashflowRecommendedAction() {
      return this.cashflowDecisionData?.recommendedAction || this.cashflowFallbackRecommendedAction
    },
    cashflowRecommendedActionAmount() {
      return Number(this.cashflowDecisionData?.recommendedActionAmount || this.cashflowDecisionData?.requiredMonthlyAdjustment || 0)
    },
    cashflowOpportunityMessage() {
      return this.cashflowDecisionData?.opportunityMessage || this.cashflowFallbackOpportunity
    },
    creditCardShareValue() {
      return Number(this.expensePredictionSummary?.creditCardShare || 0)
    },
    creditCardShareLabel() {
      return `${Math.round(this.creditCardShareValue * 100)}%`
    },
    creditCardRecurringAverage() {
      return Number(this.expensePredictionSummary?.recurringCreditCardAverage || 0)
    },
    creditCardPendingAmount() {
      return Number(this.expensePredictionSummary?.pendingCreditCardAmount || 0)
    },
    hasCreditCardPredictionContext() {
      return this.creditCardPendingAmount > 0 || this.creditCardRecurringAverage > 0 || this.creditCardShareValue > 0
    },
    creditCardPendingMessage() {
      return this.$t('overview.credit_card_pending_message', {
        amount: this.formatCurrency(this.creditCardPendingAmount),
      })
    },
    creditCardRecurringMessage() {
      return this.$t('overview.credit_card_recurring_message', {
        count: Number(this.expensePredictionSummary?.recurringCreditCardCount || 0),
        amount: this.formatCurrency(this.creditCardRecurringAverage),
      })
    },
    creditCardShareMessage() {
      return this.$t('overview.credit_card_share_message', {
        share: this.creditCardShareLabel,
      })
    },
    cashflowFallbackSummary() {
      if (this.netMonthlyCashflow < 0) {
        return this.$t('overview.cashflow_fallback_negative', {
          amount: this.formatCurrency(Math.abs(this.netMonthlyCashflow)),
        })
      }
      if (this.goalsAtRisk.length > 0) {
        return this.$t('overview.cashflow_fallback_watch', { count: this.goalsAtRisk.length })
      }
      return this.$t('overview.cashflow_fallback_positive', {
        amount: this.formatCurrency(this.netMonthlyCashflow),
      })
    },
    cashflowFallbackPrimaryDriver() {
      if (this.netMonthlyCashflow < 0) {
        return this.$t('overview.cashflow_primary_driver_negative', {
          amount: this.formatCurrency(Math.abs(this.netMonthlyCashflow)),
        })
      }
      if (this.goalsAtRisk.length > 0) {
        return this.$t('overview.cashflow_primary_driver_goal', {
          goal: this.goalsAtRisk[0]?.name || this.$t('overview.goal_generic_label'),
        })
      }
      return ''
    },
    cashflowFallbackRecommendedAction() {
      if (this.netMonthlyCashflow < 0) {
        return this.$t('overview.cashflow_recommended_action_negative')
      }
      if (this.goalsAtRisk.length > 0) {
        return this.$t('overview.cashflow_recommended_action_goal')
      }
      if (this.netMonthlyCashflow > 0) {
        return this.$t('overview.cashflow_recommended_action_positive')
      }
      return ''
    },
    cashflowFallbackOpportunity() {
      if (this.goalOpportunities.length > 0 && this.netMonthlyCashflow > 0) {
        return this.$t('overview.cashflow_opportunity_goal', {
          goal: this.goalOpportunities[0]?.name || this.$t('overview.goal_generic_label'),
          amount: this.formatCurrency(this.netMonthlyCashflow),
        })
      }
      if (this.netMonthlyCashflow > 0) {
        return this.$t('overview.cashflow_opportunity_positive', {
          amount: this.formatCurrency(this.netMonthlyCashflow),
        })
      }
      return ''
    },
    drillDownTransactions() {
      const items = Array.isArray(this.monthTransactions) ? this.monthTransactions : []
      if (this.drillDownMode === 'category') {
        return items.filter((transaction) => {
          if (!this.drillDownCategory) {
            return transaction.direction === 'OUTFLOW'
          }
          return transaction.direction === 'OUTFLOW' && transaction.category === this.drillDownCategory
        })
      }

      if (this.drillDownAccountId) {
        return items.filter((transaction) => transaction.accountId === this.drillDownAccountId)
      }

      return items.filter((transaction) => Boolean(transaction.accountId))
    },
    drillDownTotalAmount() {
      return this.drillDownTransactions.reduce((total, transaction) => total + Math.abs(Number(transaction.amount || 0)), 0)
    },
    drillDownTitle() {
      if (this.drillDownMode === 'category') {
        return this.drillDownCategory
          ? `Despesas da categoria ${this.drillDownCategory}`
          : 'Despesas por categoria'
      }

      if (this.drillDownAccountId) {
        const account = this.accounts.find((item) => item.id === this.drillDownAccountId)
        return account ? `Conta ${account.name}` : 'Saldo por conta'
      }

      return 'Saldo por conta'
    },
    accountDrillDownGroups() {
      const items = this.drillDownTransactions
      const grouped = new Map()

      items.forEach((transaction) => {
        const key = transaction.accountId || 'unknown'
        const current = grouped.get(key) || {
          accountId: key,
          accountName: transaction.accountName || 'Sem conta',
          totalAmount: 0,
          transactionCount: 0,
        }
        current.totalAmount += Math.abs(Number(transaction.amount || 0))
        current.transactionCount += 1
        grouped.set(key, current)
      })

      return Array.from(grouped.values()).sort((left, right) => right.totalAmount - left.totalAmount)
    },
    currentWorkspaceId() {
      // When workspace changes, vue-router may reuse the component instance. We watch this to refresh data.
      return useUserStore().currentWorkspaceId
    },
  },
  data() {
    const today = new Date();
    return {
      chart: null,
      refreshing: false,
      requestTokens: {},
      dashboardLoading: false,
      dashboardSummary: {
        totalBalance: 0,
        monthlyIncome: 0,
        monthlyExpenses: 0,
        topCategories: [],
      },
      accounts: [],
      monthTransactions: [],
      drillDownDialog: false,
      drillDownMode: 'category',
      drillDownCategory: null,
      drillDownAccountId: null,
      openFinanceObservabilitySummary: null,
      openFinanceConflictCount: 0,
      activityLoading: false,
      // recentActivity e selectedActivityFilter removidos pois Activity não está mais no dashboard
      goalsAtRisk: [],
      goalOpportunities: [],
      upcomingExpenses: [],
      approvedDecisionCards: [],
      approvedDecisionImpactTotal: 0,
      financialInsights: [],
      financialInsightsLoading: false,
      budgetComparison: null,
      budgetComparisonLoading: false,
      budgetComparisonState: 'idle',
      showAllComparisonLines: false,
      hasPremiumAccess: false,
      cashflowInsightsSummary: null,
      expensePredictionSummary: null,
      selectedTimePeriod: '3m',
      selectedCategory: '',
      isYearly: false,
      expenseCategories: [],
      selectedLanguage: this.i18n$?.locale || 'en',
      day: today.getDate(),
      month: today.getMonth() + 1,
      year: today.getFullYear(),
      monthName: this.getMonthName(today.getMonth()),
      chartType: 'line',
      chartTypes: [
        { title: 'Line Chart', value: 'line' },
        { title: 'Bar Chart', value: 'bar' }
      ],
      timePeriods: [
        { title: 'Last 3 Months', value: '3m' },
        { title: 'Last 6 Months', value: '6m' },
        { title: 'Last 12 Months', value: '12m' },
        { title: 'Annual 2020', value: '2020' },
        { title: 'Annual 2021', value: '2021' },
        { title: 'Annual 2022', value: '2022' },
        { title: 'Annual 2023', value: '2023' }
      ],
      chartData: {
        labels: [],
        datasets: [
          {
            label: 'Income',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
            data: []
          },
          {
            label: 'Expenses',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1,
            data: []
          }
        ]
      }
    }
  },
  mounted() {
    this.refreshDashboard('mounted')
  },
  activated() {
    // When cached via <KeepAlive>, refresh in the background without wiping the current UI.
    this.refreshDashboard('activated')
  },
  deactivated() {
    // KeepAlive preserves component state, but we rebuild the chart when returning
    // to avoid reusing a stale canvas context after multiple navigations.
    if (this.chart) {
      this.chart.destroy()
      this.chart = null
    }
  },
  watch: {
    '$i18n.locale'(newLocale) {
      if (newLocale && newLocale !== this.selectedLanguage) {
        this.selectedLanguage = newLocale
        this.fetchCategories()
      }
    },
    '$route.query.refresh'() {
      this.refreshDashboard('route-refresh')
    },
    currentWorkspaceId(next, prev) {
      if (next && next !== prev) {
        this.refreshDashboard('workspace-change')
      }
    },
  },
  methods: {
    beginRequest(key) {
      const next = Number(this.requestTokens?.[key] || 0) + 1
      this.requestTokens[key] = next
      return next
    },
    isLatestRequest(key, token) {
      return Number(this.requestTokens?.[key] || 0) === Number(token || 0)
    },
    async refreshDashboard(reason = 'manual') {
      const refreshToken = this.beginRequest('refreshDashboard')
      this.refreshing = true

      await Promise.allSettled([
        this.fetchOverviewCoreSnapshot(),
        this.fetchAccounts(),
        this.fetchMonthTransactions(),
        this.fetchOpenFinanceConflicts(),
        this.fetchOpenFinanceObservabilitySummary(),
        this.fetchRecentActivity(),
        this.fetchPremiumFeatureSummaries(),
        this.fetchDecisionImpact(),
        this.fetchFinancialInsights(),
        this.fetchBudgetComparison(),
        this.fetchGoalsAtRisk(),
        this.fetchCategories(),
      ])

      if (!this.isLatestRequest('refreshDashboard', refreshToken)) {
        return
      }
      this.refreshing = false
    },
    getLocaleForFormatting() {
      const locale = this.$i18n?.locale || 'pt'
      if (locale === 'en') return 'en-US'
      if (locale === 'fr') return 'fr-FR'
      if (locale === 'es') return 'es-ES'
      return 'pt-BR'
    },
    formatCurrency(value, currency = null) {
      const resolvedCurrency = currency || 'BRL'
      return Number(value || 0).toLocaleString(this.getLocaleForFormatting(), {
        style: 'currency',
        currency: resolvedCurrency,
      })
    },
    getScenarioNetDelta(scenario) {
      if (Array.isArray(scenario?.lines) && scenario.lines.length) {
        return scenario.lines.reduce((total, line) => {
          const delta = Number(line?.delta || 0)
          const type = String(line?.type || '')
          return type === 'INCOME' ? total + delta : total - delta
        }, 0)
      }
      return Number(scenario?.scenarioMonthlyImpact || 0)
    },
    fetchDecisionImpact() {
      const requestToken = this.beginRequest('decisionImpact')
      return Promise.all([DecisionService.list(), ScenarioService.list()])
        .then(([decisionsResponse, scenariosResponse]) => {
          if (!this.isLatestRequest('decisionImpact', requestToken)) return
          const decisions = Array.isArray(decisionsResponse?.data) ? decisionsResponse.data : []
          const scenarios = Array.isArray(scenariosResponse?.data) ? scenariosResponse.data : []
          const scenarioById = new Map(scenarios.map((scenario) => [scenario.id, scenario]))
          const approved = decisions.filter((decision) => decision?.status === 'APPROVED')

          this.approvedDecisionCards = approved.map((decision) => {
            const scenario = scenarioById.get(decision.scenarioId)
            const impact = this.getScenarioNetDelta(scenario)
            return {
              id: decision.id,
              title: decision.title || 'Decision',
              scenarioLabel: scenario?.name ? `Scenario: ${scenario.name}` : 'Scenario linked',
              impact,
              impactLabel: `Net impact: ${impact >= 0 ? '+' : '-'}${this.formatCurrency(Math.abs(impact))}`,
            }
          })

          this.approvedDecisionImpactTotal = this.approvedDecisionCards.reduce(
            (total, card) => total + Number(card.impact || 0),
            0
          )
        })
        .catch((error) => {
          console.error('Error fetching approved decision impact:', error)
          if (!this.isLatestRequest('decisionImpact', requestToken)) return
          this.approvedDecisionCards = []
          this.approvedDecisionImpactTotal = 0
        })
    },
    insightColor(type) {
      if (type === 'WARNING') return '#ef4444'
      if (type === 'POSITIVE') return '#16a34a'
      return '#2563eb'
    },
    insightIcon(type) {
      if (type === 'WARNING') return 'mdi-alert-circle-outline'
      if (type === 'POSITIVE') return 'mdi-check-circle-outline'
      return 'mdi-information-outline'
    },
    insightMessageClass(type) {
      if (type === 'WARNING') return 'insight-text--warning'
      if (type === 'POSITIVE') return 'insight-text--positive'
      return 'insight-text--info'
    },
    fetchFinancialInsights() {
      const requestToken = this.beginRequest('financialInsights')
      this.financialInsightsLoading = true
      return BudgetService.getInsights(this.month, this.year)
        .then((response) => {
          if (!this.isLatestRequest('financialInsights', requestToken)) return
          const insights = Array.isArray(response?.data?.insights) ? response.data.insights : []
          this.financialInsights = insights.slice(0, 5)
        })
        .catch((error) => {
          console.error('Error fetching financial insights:', error)
          if (!this.isLatestRequest('financialInsights', requestToken)) return
          this.financialInsights = []
        })
        .finally(() => {
          if (!this.isLatestRequest('financialInsights', requestToken)) return
          this.financialInsightsLoading = false
        })
    },
    comparisonStatusColor(status) {
      if (status === 'OK') return 'success'
      return 'error'
    },
    fetchBudgetComparison() {
      const requestToken = this.beginRequest('budgetComparison')
      this.budgetComparisonLoading = true
      this.budgetComparisonState = 'idle'
      this.showAllComparisonLines = false
      return BudgetService.getComparison(this.month, this.year)
        .then((response) => {
          if (!this.isLatestRequest('budgetComparison', requestToken)) return
          this.budgetComparison = response.data
          this.budgetComparisonState = 'ready'
        })
        .catch((error) => {
          if (error?.response?.status === 404) {
            if (!this.isLatestRequest('budgetComparison', requestToken)) return
            this.budgetComparison = null
            this.budgetComparisonState = 'no-budget'
            return
          }
          console.error('Error fetching budget comparison:', error)
          if (!this.isLatestRequest('budgetComparison', requestToken)) return
          this.budgetComparison = null
          this.budgetComparisonState = 'error'
        })
        .finally(() => {
          if (!this.isLatestRequest('budgetComparison', requestToken)) return
          this.budgetComparisonLoading = false
        })
    },
    getMonthName(monthIndex) {
      const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      return monthNames[monthIndex];
    },
    isCurrentOverviewContext(workspaceId, selectedTimePeriod, selectedCategory) {
      const currentWorkspaceId = this.currentWorkspaceId || null
      const currentCategory = this.selectedCategory || ''
      return (
        currentWorkspaceId === (workspaceId || null) &&
        this.selectedTimePeriod === selectedTimePeriod &&
        currentCategory === (selectedCategory || '')
      )
    },
    isCurrentWorkspaceContext(workspaceId) {
      const currentWorkspaceId = this.currentWorkspaceId || null
      return currentWorkspaceId === (workspaceId || null)
    },
    unwrapDashboardSummaryPayload(payload) {
      if (!payload || typeof payload !== 'object') return {}
      const direct = payload
      const candidates = [direct.data, direct.summary, direct.dashboard, direct.payload]
      for (const candidate of candidates) {
        if (candidate && typeof candidate === 'object') {
          return candidate
        }
      }
      return direct
    },
    normalizeDashboardSummary(payload) {
      const base = this.unwrapDashboardSummaryPayload(payload)
      const readNumber = (...values) => {
        for (const value of values) {
          const numeric = Number(value)
          if (Number.isFinite(numeric)) {
            return numeric
          }
        }
        return 0
      }
      return {
        ...base,
        totalBalance: readNumber(base.totalBalance, base.total_balance),
        monthlyIncome: readNumber(base.monthlyIncome, base.monthly_income),
        monthlyExpenses: readNumber(base.monthlyExpenses, base.monthly_expenses),
        topCategories: Array.isArray(base.topCategories) ? base.topCategories : [],
      }
    },
    summaryHasMaterialData(summary = null) {
      const target = summary && typeof summary === 'object' ? summary : this.dashboardSummary
      return (
        Number(target?.totalBalance || 0) !== 0 ||
        Number(target?.monthlyIncome || 0) !== 0 ||
        Number(target?.monthlyExpenses || 0) !== 0
      )
    },
    deriveSummaryFromLocalReadModels() {
      const derivedBalance = (Array.isArray(this.accounts) ? this.accounts : []).reduce(
        (total, account) => total + Number(account?.balance || 0),
        0
      )
      const txs = Array.isArray(this.monthTransactions) ? this.monthTransactions : []
      const derivedIncome = txs
        .filter((transaction) => String(transaction?.direction || '').toUpperCase() === 'INFLOW')
        .reduce((total, transaction) => total + Number(transaction?.amount || 0), 0)
      const derivedExpenses = txs
        .filter((transaction) => String(transaction?.direction || '').toUpperCase() === 'OUTFLOW')
        .reduce((total, transaction) => total + Math.abs(Number(transaction?.amount || 0)), 0)

      return {
        totalBalance: Number(derivedBalance || 0),
        monthlyIncome: Number(derivedIncome || 0),
        monthlyExpenses: Number(derivedExpenses || 0),
      }
    },
    reconcileDashboardSummaryFromLocalReadModels() {
      if (this.summaryHasMaterialData()) {
        return
      }
      const derived = this.deriveSummaryFromLocalReadModels()
      if (!this.summaryHasMaterialData(derived)) {
        return
      }
      this.dashboardSummary = {
        ...this.dashboardSummary,
        totalBalance: derived.totalBalance,
        monthlyIncome: derived.monthlyIncome,
        monthlyExpenses: derived.monthlyExpenses,
      }
    },
    buildChartState(rawData, selectedTimePeriod) {
      const safeData = rawData && typeof rawData === 'object' ? rawData : {}
      const rawLabels = Array.isArray(safeData.labels) ? safeData.labels : []
      const rawDatasets = Array.isArray(safeData.datasets) ? safeData.datasets : []
      const incomePoints = Array.isArray(rawDatasets[0]?.data) ? rawDatasets[0].data : []
      const expensePoints = Array.isArray(rawDatasets[1]?.data) ? rawDatasets[1].data : []
      const isYearly = !String(selectedTimePeriod || '').includes('m')
      const labels = isYearly
        ? rawLabels
        : rawLabels.map((label) => moment(label, ['YYYY-MM', 'MM-YYYY']).toISOString())

      return {
        isYearly,
        chartData: {
          labels,
          datasets: [
            {
              label: 'Income',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
              data: incomePoints,
            },
            {
              label: 'Expenses',
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 1,
              data: expensePoints,
            },
          ],
        },
      }
    },
    applyChartState(nextChartState) {
      if (!nextChartState) return
      this.isYearly = Boolean(nextChartState.isYearly)
      this.chartData = nextChartState.chartData
      this.createChart()
    },
    fetchOverviewCoreSnapshot() {
      const requestToken = this.beginRequest('overviewCore')
      this.dashboardLoading = true
      const workspaceId = this.currentWorkspaceId || null
      const selectedTimePeriod = this.selectedTimePeriod
      const selectedCategory = this.selectedCategory || ''

      return Promise.all([
        FinancialReadService.fetchDashboard(),
        DataService.fetchChartData(selectedTimePeriod, selectedCategory),
      ])
        .then(([summaryResponse, chartResponse]) => {
          if (!this.isLatestRequest('overviewCore', requestToken)) return

          if (this.isCurrentWorkspaceContext(workspaceId)) {
            this.dashboardSummary = this.normalizeDashboardSummary(summaryResponse?.data)
            this.reconcileDashboardSummaryFromLocalReadModels()
          }

          if (this.isCurrentOverviewContext(workspaceId, selectedTimePeriod, selectedCategory)) {
            const nextChartState = this.buildChartState(chartResponse?.data, selectedTimePeriod)
            this.applyChartState(nextChartState)
          }
        })
        .catch((error) => {
          console.error('Error fetching overview core snapshot:', error)
        })
        .finally(() => {
          if (!this.isLatestRequest('overviewCore', requestToken)) return
          this.dashboardLoading = false
        })
    },
    fetchAccounts() {
      const requestToken = this.beginRequest('accounts')
      return FinancialReadService.fetchAccounts()
        .then((response) => {
          if (!this.isLatestRequest('accounts', requestToken)) return
          this.accounts = Array.isArray(response?.data) ? response.data : []
          this.reconcileDashboardSummaryFromLocalReadModels()
        })
        .catch((error) => {
          console.error('Error fetching accounts:', error)
          if (!this.isLatestRequest('accounts', requestToken)) return
          this.accounts = []
          this.reconcileDashboardSummaryFromLocalReadModels()
        })
    },
    fetchMonthTransactions() {
      const requestToken = this.beginRequest('monthTransactions')
      const currentMonth = new Date()
      const fromDate = moment(currentMonth).startOf('month').format('YYYY-MM-DD')
      const toDate = moment(currentMonth).endOf('month').format('YYYY-MM-DD')

      return FinancialReadService.fetchTransactions({
        fromDate,
        toDate,
        limit: 200,
        offset: 0,
      })
        .then((response) => {
          if (!this.isLatestRequest('monthTransactions', requestToken)) return
          this.monthTransactions = Array.isArray(response?.data?.items) ? response.data.items : []
          this.reconcileDashboardSummaryFromLocalReadModels()
        })
        .catch((error) => {
          console.error('Error fetching month transactions:', error)
          if (!this.isLatestRequest('monthTransactions', requestToken)) return
          this.monthTransactions = []
          this.reconcileDashboardSummaryFromLocalReadModels()
        })
    },
    fetchOpenFinanceConflicts() {
      const requestToken = this.beginRequest('openFinanceConflicts')
      return OpenFinanceService.listReconciliationConflicts()
        .then((response) => {
          if (!this.isLatestRequest('openFinanceConflicts', requestToken)) return
          this.openFinanceConflictCount = Array.isArray(response?.data) ? response.data.length : 0
        })
        .catch((error) => {
          console.error('Error fetching Open Finance conflicts:', error)
          if (!this.isLatestRequest('openFinanceConflicts', requestToken)) return
          this.openFinanceConflictCount = 0
        })
    },
    fetchOpenFinanceObservabilitySummary() {
      const requestToken = this.beginRequest('openFinanceObservability')
      return OpenFinanceService.getObservabilitySummary()
        .then((response) => {
          if (!this.isLatestRequest('openFinanceObservability', requestToken)) return
          this.openFinanceObservabilitySummary = response.data || null
        })
        .catch((error) => {
          console.error('Error fetching Open Finance observability summary:', error)
          if (!this.isLatestRequest('openFinanceObservability', requestToken)) return
          this.openFinanceObservabilitySummary = null
        })
    },
    fetchRecentActivity() {
      const requestToken = this.beginRequest('recentActivity')
      this.activityLoading = true
      return ActivityService.list(8)
        .then((response) => {
          if (!this.isLatestRequest('recentActivity', requestToken)) return
          this.recentActivity = Array.isArray(response?.data) ? response.data : []
        })
        .catch((error) => {
          console.error('Error fetching recent activity:', error)
          if (!this.isLatestRequest('recentActivity', requestToken)) return
          this.recentActivity = []
        })
        .finally(() => {
          if (!this.isLatestRequest('recentActivity', requestToken)) return
          this.activityLoading = false
        })
    },
    resolveBillingWorkspaceContext() {
      const userStore = useUserStore()
      return resolveAnyWorkspaceContext(userStore)
    },
    async fetchPremiumFeatureSummaries() {
      const requestToken = this.beginRequest('premiumFeatureSummaries')
      const workspaceContext = this.resolveBillingWorkspaceContext()
      if (!workspaceContext) {
        if (!this.isLatestRequest('premiumFeatureSummaries', requestToken)) return
        this.hasPremiumAccess = false
        this.cashflowInsightsSummary = null
        this.expensePredictionSummary = null
        return
      }

      try {
        const response = await BillingOrchestrationService.getBillingSummary(workspaceContext.workspaceId)
        if (!this.isLatestRequest('premiumFeatureSummaries', requestToken)) return
        this.hasPremiumAccess = Boolean(response?.data?.hasPremiumAccess)
      } catch (error) {
        console.error('Error checking premium access:', error)
        if (!this.isLatestRequest('premiumFeatureSummaries', requestToken)) return
        this.hasPremiumAccess = false
      }

      if (!this.hasPremiumAccess) {
        if (!this.isLatestRequest('premiumFeatureSummaries', requestToken)) return
        this.cashflowInsightsSummary = null
        this.expensePredictionSummary = null
        return
      }

      this.fetchCashflowInsightsSummary()
      this.fetchExpensePredictionSummary()
    },
    activityTitle(event) {
      return event?.title || this.$t('overview.activity_fallback_title')
    },
    activityDescription(event) {
      return event?.description || this.$t('overview.activity_fallback_description')
    },
    activityActorLabel(actorUserId) {
      if (!actorUserId) {
        return this.$t('overview.activity_actor_system')
      }
      const raw = String(actorUserId)
      const label = raw.includes('@') ? raw.split('@')[0] : raw
      return this.$t('overview.activity_actor_label', { actor: label })
    },
    activityAccent(event) {
      const type = String(event?.eventType || '')
      if (type.startsWith('TRANSACTION_SHARED_')) return { icon: 'mdi-swap-horizontal-bold', color: '#667eea' }
      if (type.startsWith('SCENARIO_')) return { icon: 'mdi-chart-timeline-variant', color: '#7c3aed' }
      if (type.startsWith('DECISION_')) return { icon: 'mdi-gavel', color: '#ea580c' }
      return { icon: 'mdi-bell-outline', color: '#64748b' }
    },
    activityFilterKey(event) {
      const type = String(event?.eventType || '')
      if (type.startsWith('TRANSACTION_SHARED_')) return 'transactions'
      if (type.startsWith('SCENARIO_')) return 'scenarios'
      if (type.startsWith('DECISION_')) return 'decisions'
      return 'all'
    },
    activityRoute(event) {
      const relatedType = String(event?.relatedEntityType || '')
      if (relatedType === 'TRANSACTION') return '/budget'
      if (relatedType === 'SCENARIO') return '/planning/scenarios/:id'
      if (relatedType === 'DECISION') return '/decisions'
      return null
    },
    openActivity(event) {
      const path = this.activityRoute(event)
      if (!path) return
      if (path === '/budget') {
        this.$router.push({ path, query: { visibility: 'workspace' } })
        return
      }
      if (path === '/planning/scenarios/:id' && event?.relatedEntityId) {
        this.$router.push({ name: 'planning-scenarios-result', params: { id: event.relatedEntityId } })
        return
      }
      this.$router.push(path)
    },
    formatActivityTime(value) {
      if (!value) return ''
      const date = new Date(value)
      if (Number.isNaN(date.getTime())) return ''
      return new Intl.DateTimeFormat(this.getLocaleForFormatting(), {
        dateStyle: 'short',
        timeStyle: 'short',
      }).format(date)
    },
    fetchCashflowInsightsSummary() {
      AiService.getCashflowInsights({ months: 6 })
        .then((response) => {
          this.cashflowInsightsSummary = response?.data || null
        })
        .catch((error) => {
          console.error('Error fetching cashflow insights summary:', error)
          this.cashflowInsightsSummary = null
        })
    },
    fetchExpensePredictionSummary() {
      AiService.predictMonthlyExpenses({ forecastMonths: 3 })
        .then((response) => {
          this.expensePredictionSummary = response?.data || null
        })
        .catch((error) => {
          console.error('Error fetching expense prediction summary:', error)
          this.expensePredictionSummary = null
        })
    },
    fetchGoalsAtRisk() {
      FinancialGoalService.fetchFinancialGoals()
        .then((response) => {
          const goals = Array.isArray(response?.data) ? response.data : []
          this.goalsAtRisk = goals
            .filter((goal) => goal?.paceStatus === 'AT_RISK')
            .sort((left, right) => Number(right?.remainingAmount || 0) - Number(left?.remainingAmount || 0))
            .slice(0, 3)
          this.goalOpportunities = goals
            .filter((goal) => goal?.paceStatus === 'AHEAD')
            .sort((left, right) => Number(left?.remainingAmount || 0) - Number(right?.remainingAmount || 0))
            .slice(0, 3)
        })
        .catch((error) => {
          console.error('Error fetching goals at risk:', error)
          this.goalsAtRisk = []
          this.goalOpportunities = []
        })
    },
    openGoalsView() {
      this.$router.push({ path: '/planning/goals' })
    },
    openCashflowView() {
      this.$router.push({ path: '/cashflow' })
    },
    createChart() {
      const trendsCtx = this.$refs.trendsChart?.getContext?.('2d')
      if (!trendsCtx) {
        return
      }
      if (this.chart) {
        this.chart.destroy()
      }
      this.chart = new Chart(trendsCtx, {
        type: this.chartType,
        data: this.chartData,
        options: {
          responsive: true,
          scales: {
            x: {
              type: 'time',
              time: {
                unit: this.isYearly ? 'year' : 'month',
                displayFormats: {
                  year: 'YYYY',
                  month: 'MM-YYYY'
                },
                tooltipFormat: 'DD/MM/YYYY'
              },
              ticks: {
                source: 'labels'
              }
            },
            y: {
              beginAtZero: true
            }
          }
        }
      })
    },
    updateCharts() {
      this.fetchChartData()
    },
    normalizeTranslatedCollection(payload) {
      if (Array.isArray(payload)) return payload
      if (!payload || typeof payload !== 'object') return []

      const candidates = [payload.data, payload.items, payload.content, payload.results, payload.list]
      for (const candidate of candidates) {
        if (Array.isArray(candidate)) return candidate
      }

      return []
    },
    fetchCategories() {
      const requestToken = this.beginRequest('categories')
      const language = this.$i18n?.locale || this.selectedLanguage || 'en'
      this.selectedLanguage = language
      return DataService.fetchCategories(language)
        .then((response) => {
          if (!this.isLatestRequest('categories', requestToken)) return
          const categories = this.normalizeTranslatedCollection(response?.data)
          this.expenseCategories = categories
            .map((category) => {
            const code = String(category?.code || '').trim()
            const id = category?.id ?? null
            if (!code || id === null || id === undefined) {
              return null
            }
            const translationKey = `categories.${code}`
            const translatedName = this.$t(translationKey)
            const isTranslated = translatedName !== translationKey
            return {
              id,
              code,
              name: isTranslated ? translatedName : (category?.name || code)
            }
          })
            .filter((category) => Boolean(category))
          this.expenseCategories.unshift({
            id: 'all',
            code: '',
            name: this.$t('trends.all_categories'),
          })
        })
        .catch((error) => {
          console.error('Error fetching categories:', error)
        });
    },
    fetchChartData() {
      const requestToken = this.beginRequest('chartData')
      const workspaceId = this.currentWorkspaceId || null
      const selectedTimePeriod = this.selectedTimePeriod
      const selectedCategory = this.selectedCategory || ''
      return DataService.fetchChartData(selectedTimePeriod, selectedCategory)
        .then((response) => {
          if (!this.isLatestRequest('chartData', requestToken)) return
          if (!this.isCurrentOverviewContext(workspaceId, selectedTimePeriod, selectedCategory)) return
          const nextChartState = this.buildChartState(response?.data, selectedTimePeriod)
          this.applyChartState(nextChartState)
        })
        .catch((error) => {
          console.error('Error fetching chart data:', error)
        })
    },
    formatTransactionDate(value) {
      if (!value) return '-'
      return moment(value).format('DD/MM/YYYY')
    },
    openCategoryDrillDown(category = null) {
      this.$router.push({
        name: 'budget',
        query: {
          month: String(new Date().getMonth() + 1),
          year: String(new Date().getFullYear()),
          ...(category ? { category } : {}),
          focus: 'expenses',
        },
      })
    },
    openAccountDrillDown(accountId = null) {
      this.$router.push({
        name: 'budget',
        query: {
          month: String(new Date().getMonth() + 1),
          year: String(new Date().getFullYear()),
          ...(accountId ? { accountId } : {}),
          focus: 'expenses',
        },
      })
    },
    openExpenseReport(category = null) {
      const currentMonth = moment()
      this.$router.push({
        name: 'report',
        query: {
          reportType: 'expenses',
          startDate: currentMonth.startOf('month').format('YYYY-MM-DD'),
          endDate: currentMonth.endOf('month').format('YYYY-MM-DD'),
          ...(category ? { category } : {}),
        },
      })
    },
    projectBalance(months) {
      const net = this.netMonthlyCashflow
      return Number(this.dashboardSummary.totalBalance || 0) + net * months
    },
    projectedBalanceForMonths(months) {
      const forecast = Array.isArray(this.cashflowDecisionData?.forecast) ? this.cashflowDecisionData.forecast : []
      const item = forecast.find((entry, index) => index === months - 1)
      if (item && Number.isFinite(Number(item.projectedBalance))) {
        return Number(item.projectedBalance)
      }
      return this.projectBalance(months)
    },
    paceStatusLabel(status) {
      if (status === 'AT_RISK') return this.$t('overview.goal_pace_at_risk')
      if (status === 'AHEAD') return this.$t('overview.goal_pace_ahead')
      if (status === 'ON_TRACK') return this.$t('overview.goal_pace_on_track')
      return this.$t('overview.goal_pace_no_data')
    }
  }
}
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background: linear-gradient(135deg, 
    rgba(245, 247, 250, 1) 0%, 
    rgba(232, 234, 240, 1) 100%);
  padding: 32px 0;
}

.v-theme--dark .dashboard-container {
  background: linear-gradient(135deg, 
    rgba(30, 30, 30, 1) 0%, 
    rgba(20, 20, 20, 1) 100%);
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

/* Header Section */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  padding: 0 8px;
  flex-wrap: wrap;
  gap: 20px;
}

.comparison-table-wrap {
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 12px;
  overflow: hidden;
}

.comparison-actions {
  display: flex;
  justify-content: flex-end;
  padding: 8px 12px;
  border-top: 1px solid rgba(148, 163, 184, 0.12);
}

.line-type {
  font-size: 0.72rem;
  color: #64748b;
  text-transform: uppercase;
}

.delta-positive {
  color: #15803d;
}

.delta-negative {
  color: #dc2626;
}

.welcome-section .page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.v-theme--dark .welcome-section .page-title {
  color: #ffffff;
}

.welcome-section .page-subtitle {
  font-size: 1.1rem;
  color: #666;
  margin: 0;
}

.v-theme--dark .welcome-section .page-subtitle {
  color: #b0b0b0;
}

.date-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 16px 28px;
  border-radius: 12px;
  color: white;
  text-align: center;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.date-badge .month-name {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 4px;
}

.date-badge .full-date {
  font-size: 0.95rem;
  opacity: 0.95;
}

.headline-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  margin-bottom: 32px;
  border-radius: 14px;
  background: rgba(102, 126, 234, 0.12);
  color: #1a1a1a;
  font-weight: 600;
}

.scope-badge-row {
  margin: 12px 0 0;
}

.scope-badge-note {
  color: #64748b;
  font-size: 0.92rem;
}

.activity-feed {
  display: grid;
  gap: 14px;
}

.activity-filters {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin: 14px 0 18px;
}

.activity-row {
  display: grid;
  grid-template-columns: 40px 1fr;
  gap: 12px;
  align-items: flex-start;
  padding: 14px 0;
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
}

.activity-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.activity-row__icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: rgba(102, 126, 234, 0.08);
}

.activity-row__content {
  display: grid;
  gap: 6px;
}

.activity-row__header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  color: #0f172a;
}

.activity-row__time {
  color: #64748b;
  font-size: 0.85rem;
}

.activity-row__description {
  margin: 0;
  color: #475569;
  font-size: 0.95rem;
  line-height: 1.45;
}

.activity-row__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  color: #64748b;
  font-size: 0.86rem;
}

.v-theme--dark .headline-card {
  background: rgba(102, 126, 234, 0.2);
  color: #ffffff;
}

.v-theme--dark .scope-badge-note,
.v-theme--dark .activity-row__time,
.v-theme--dark .activity-row__meta,
.v-theme--dark .activity-row__description {
  color: #cbd5e1;
}

.v-theme--dark .activity-row__header {
  color: #ffffff;
}

/* Overview Cards */
.overview-cards {
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
  height: 100%;
}

.stat-card--clickable,
.account-card--clickable,
.category-row--clickable {
  cursor: pointer;
}

.stat-card--clickable:hover,
.account-card--clickable:hover,
.category-row--clickable:hover {
  transform: translateY(-2px);
  transition: transform 0.2s ease;
}

.v-theme--dark .stat-card {
  background: #2a2a2a;
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.v-theme--dark .stat-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.income-card .stat-icon {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}

.expense-card .stat-icon {
  background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%);
}

.savings-card .stat-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 8px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.cashflow-card .stat-icon {
  background: linear-gradient(135deg, #00b09b 0%, #96c93d 100%);
}

.runway-card .stat-icon {
  background: linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%);
}

.two-column-grid {
  margin-bottom: 32px;
}

.bar-compare {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.bar-row {
  display: grid;
  grid-template-columns: 140px 1fr 120px;
  align-items: center;
  gap: 12px;
  font-size: 0.9rem;
  color: #666;
}

.v-theme--dark .bar-row {
  color: #b0b0b0;
}

.bar-track {
  width: 100%;
  height: 10px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.v-theme--dark .bar-track {
  background: rgba(255, 255, 255, 0.15);
}

.bar-fill {
  height: 100%;
  border-radius: 999px;
}

.bar-fill.positive {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}

.bar-fill.negative {
  background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%);
}

.bar-fill.neutral {
  background: linear-gradient(135deg, #9e9e9e 0%, #bdbdbd 100%);
}

.context-message {
  margin: 8px 0 0;
  font-size: 0.9rem;
  color: #4a4a4a;
}

.v-theme--dark .context-message {
  color: #c2c2c2;
}

.categories-list,
.upcoming-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.category-row,
.upcoming-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  background: rgba(102, 126, 234, 0.06);
  font-weight: 600;
  color: #1a1a1a;
}

.v-theme--dark .category-row,
.v-theme--dark .upcoming-row {
  background: rgba(102, 126, 234, 0.18);
  color: #ffffff;
}

.category-row span {
  flex: 1;
  margin-left: 8px;
}

.upcoming-title {
  font-weight: 600;
}

.upcoming-date {
  font-size: 0.85rem;
  color: #666;
}

.v-theme--dark .upcoming-date {
  color: #b0b0b0;
}

.upcoming-amount {
  font-weight: 700;
  color: #667eea;
}

.projection-placeholder {
  padding: 18px;
  border-radius: 12px;
  background: rgba(102, 126, 234, 0.08);
  color: #4a4a4a;
  font-weight: 600;
}

.v-theme--dark .projection-placeholder {
  background: rgba(102, 126, 234, 0.2);
  color: #ffffff;
}

.section-block {
  margin-bottom: 40px;
}

.section-header {
  margin-bottom: 16px;
}

.section-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
}

.v-theme--dark .section-title {
  color: #ffffff;
}

.projection-grid {
  margin-top: 8px;
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.projection-card {
  background: white;
  border-radius: 14px;
  padding: 20px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

.v-theme--dark .projection-card {
  background: #2a2a2a;
  border-color: rgba(255, 255, 255, 0.1);
}

.projection-card--warning {
  background: rgba(245, 158, 11, 0.08);
  border-color: rgba(245, 158, 11, 0.18);
}

.v-theme--dark .projection-card--warning {
  background: rgba(245, 158, 11, 0.16);
  border-color: rgba(245, 158, 11, 0.24);
}

.projection-label {
  font-size: 0.9rem;
  color: #666;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.v-theme--dark .projection-label {
  color: #b0b0b0;
}

.projection-value {
  font-size: 1.6rem;
  font-weight: 700;
  color: #667eea;
}

.decision-chip {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 0.95rem;
}

.decision-chip--success {
  background: #dcfce7;
  color: #15803d;
}

.decision-chip--warning {
  background: #fef3c7;
  color: #b45309;
}

.decision-chip--danger {
  background: #fee2e2;
  color: #b91c1c;
}

.insights-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 24px;
}

.insight-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 999px;
  background: rgba(102, 126, 234, 0.12);
  color: #1a1a1a;
  font-weight: 600;
  font-size: 0.9rem;
}

.v-theme--dark .insight-pill {
  background: rgba(102, 126, 234, 0.2);
  color: #ffffff;
}

.decisions-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
}

.decision-card {
  border-radius: 14px;
  padding: 18px;
  background: rgba(102, 126, 234, 0.05);
  border: 1px solid rgba(102, 126, 234, 0.12);
}

.decision-card--critical {
  background: rgba(239, 68, 68, 0.08);
  border-color: rgba(239, 68, 68, 0.18);
}

.decision-card--high {
  background: rgba(245, 158, 11, 0.08);
  border-color: rgba(245, 158, 11, 0.18);
}

.decision-card--medium {
  background: rgba(102, 126, 234, 0.05);
}

.decision-card--opportunity {
  background: rgba(34, 197, 94, 0.08);
  border-color: rgba(34, 197, 94, 0.18);
}

.v-theme--dark .decision-card {
  background: rgba(102, 126, 234, 0.14);
  border-color: rgba(102, 126, 234, 0.2);
}

.v-theme--dark .decision-card--critical {
  background: rgba(239, 68, 68, 0.16);
  border-color: rgba(239, 68, 68, 0.24);
}

.v-theme--dark .decision-card--high {
  background: rgba(245, 158, 11, 0.16);
  border-color: rgba(245, 158, 11, 0.24);
}

.v-theme--dark .decision-card--opportunity {
  background: rgba(34, 197, 94, 0.16);
  border-color: rgba(34, 197, 94, 0.24);
}

.decision-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.decision-card__title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 600;
  color: #1a1a1a;
}


.v-theme--dark .decision-card__title {
  color: #ffffff;
}

.decision-card__description {
  margin: 0 0 10px;
  color: #666;
  font-size: 0.95rem;
}

.v-theme--dark .decision-card__description {
  color: #b0b0b0;
}

.decision-card__meta {
  font-size: 0.9rem;
  color: #4a4a4a;
}

.v-theme--dark .decision-card__meta {
  color: #c2c2c2;
}

.accounts-grid,
.goals-grid,
.transactions-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.account-card {
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 14px;
  padding: 18px;
  background: rgba(102, 126, 234, 0.04);
}

.v-theme--dark .account-card {
  border-color: rgba(255, 255, 255, 0.08);
  background: rgba(102, 126, 234, 0.08);
}

.account-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.account-card__title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  color: #1a1a1a;
}

.v-theme--dark .account-card__title {
  color: #ffffff;
}

.account-card__subtitle {
  margin: 4px 0 0;
  color: #666;
  font-size: 0.9rem;
}

.v-theme--dark .account-card__subtitle {
  color: #b0b0b0;
}

.account-card__balance {
  font-size: 1.35rem;
  font-weight: 700;
  color: #667eea;
}

.drilldown-summary {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.transaction-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 14px 16px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  background: rgba(102, 126, 234, 0.04);
}

.transaction-row--stacked {
  background: rgba(17, 153, 142, 0.05);
}

.transaction-row__amount {
  font-weight: 700;
  color: #1a1a1a;
}

.v-theme--dark .transaction-row {
  border-color: rgba(255, 255, 255, 0.08);
  background: rgba(102, 126, 234, 0.08);
}

.v-theme--dark .transaction-row--stacked {
  background: rgba(17, 153, 142, 0.12);
}

.v-theme--dark .transaction-row__amount {
  color: #ffffff;
}

.transaction-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.v-theme--dark .transaction-row {
  border-bottom-color: rgba(255, 255, 255, 0.08);
}

.transaction-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.transaction-row__main {
  min-width: 0;
}

.transaction-row__title {
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 6px;
}

.v-theme--dark .transaction-row__title {
  color: #ffffff;
}

.transaction-row__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 0.88rem;
}

.v-theme--dark .transaction-row__meta {
  color: #b0b0b0;
}

.transaction-row__amount {
  font-size: 1rem;
  font-weight: 700;
  white-space: nowrap;
}

.transaction-row__amount.is-positive {
  color: #11998e;
}

.transaction-row__amount.is-negative {
  color: #eb3349;
}

.top-categories-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.top-category-chip {
  font-weight: 600;
}

.compact-empty-state,
.compact-loading-state {
  min-height: 180px;
}

.v-theme--dark .stat-label {
  color: #b0b0b0;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
}

.v-theme--dark .stat-value {
  color: #ffffff;
}

/* Modern Cards */
.modern-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 32px;
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
  padding: 24px 28px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(102, 126, 234, 0.03);
}

.v-theme--dark .card-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(102, 126, 234, 0.08);
}

.card-title {
  font-size: 1.5rem;
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
  padding: 28px;
}

/* AI Insights */
.ai-insights {
  display: flex;
  flex-direction: column;
  gap: 32px;
  margin-bottom: 40px;
}

.ai-grid {
  display: grid;
  gap: 24px;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
}

.ai-hero-card,
.ai-card-wrapper {
  width: 100%;
}

.ai-hero-card :deep(.ai-card),
.ai-card-wrapper :deep(.ai-card) {
  height: 100%;
}

/* Filters Row */
.filters-row {
  margin-bottom: 24px;
}

.modern-select {
  background: rgba(255, 255, 255, 0.92);
}

.modern-select :deep(.v-field) {
  background: rgba(255, 255, 255, 0.92);
  border-radius: 12px;
}

.v-theme--dark .modern-select {
  background: transparent;
}

.v-theme--dark .modern-select :deep(.v-field) {
  background: rgba(17, 24, 39, 0.88);
  border: 1px solid rgba(148, 163, 184, 0.18);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.02);
}

.v-theme--dark .modern-select :deep(.v-field__input),
.v-theme--dark .modern-select :deep(.v-label),
.v-theme--dark .modern-select :deep(.v-select__selection-text),
.v-theme--dark .modern-select :deep(.v-icon) {
  color: #e5eefc;
}

/* Chart Wrapper */
.chart-wrapper {
  position: relative;
  height: 400px;
  background: white;
  border-radius: 12px;
  padding: 20px;
}

.v-theme--dark .chart-wrapper {
  background: #1e1e1e;
}

/* Goal Cards */
.goal-card {
  background: white;
  border-radius: 12px;
  border: 2px solid rgba(102, 126, 234, 0.1);
  padding: 20px;
  transition: all 0.3s ease;
  height: 100%;
}

.v-theme--dark .goal-card {
  background: #2a2a2a;
  border-color: rgba(102, 126, 234, 0.2);
}

.goal-card:hover {
  border-color: rgba(102, 126, 234, 0.3);
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.15);
}

.goal-header {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.v-theme--dark .goal-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.goal-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.v-theme--dark .goal-name {
  color: #ffffff;
}

.goal-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.goal-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
}

.v-theme--dark .info-label {
  color: #b0b0b0;
}

.info-value {
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
}

.v-theme--dark .info-value {
  color: #ffffff;
}

.progress-section {
  margin-top: 16px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.progress-label {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
}

.v-theme--dark .progress-label {
  color: #b0b0b0;
}

.progress-percentage {
  font-size: 1.1rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.progress-bar-container {
  width: 100%;
  height: 10px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 10px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  transition: width 0.6s ease;
  animation: progressAnimation 1s ease-out;
}

@keyframes progressAnimation {
  from {
    width: 0;
  }
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-message {
  font-size: 1.1rem;
  color: #666;
  margin: 0;
}

.v-theme--dark .empty-message {
  color: #b0b0b0;
}

.conflict-banner {
  margin: 16px 0 24px;
}

.open-finance-overview {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 24px;
}

.overview-pill {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 150px;
  padding: 12px 16px;
  border-radius: 14px;
  border: 1px solid rgba(102, 126, 234, 0.14);
  background: rgba(102, 126, 234, 0.04);
}

.overview-pill--warning {
  border-color: rgba(255, 152, 0, 0.3);
  background: rgba(255, 152, 0, 0.08);
}

.overview-pill__label {
  font-size: 0.85rem;
  color: #666;
}

.overview-pill__value {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1a1a1a;
}

.v-theme--dark .overview-pill {
  border-color: rgba(102, 126, 234, 0.22);
  background: rgba(102, 126, 234, 0.08);
}

.v-theme--dark .overview-pill--warning {
  border-color: rgba(255, 152, 0, 0.4);
  background: rgba(255, 152, 0, 0.12);
}

.v-theme--dark .overview-pill__label {
  color: #b0b0b0;
}

.v-theme--dark .overview-pill__value {
  color: #ffffff;
}

/* Responsive */
@media (max-width: 960px) {
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .ai-insights {
    gap: 24px;
  }

  .date-badge {
    width: 100%;
  }

  .welcome-section .page-title {
    font-size: 2rem;
  }

  .stat-value {
    font-size: 1.75rem;
  }
}

@media (max-width: 600px) {
  .dashboard-container {
    padding: 20px 0;
  }

  .bar-row {
    grid-template-columns: 1fr;
    text-align: left;
  }

  .bar-row span:last-child {
    justify-self: flex-start;
  }

  .welcome-section .page-title {
    font-size: 1.75rem;
  }

  .card-header {
    padding: 20px;
  }

  .card-content {
    padding: 20px;
  }

  .chart-wrapper {
    height: 300px;
    padding: 12px;
  }

  .stat-card {
    padding: 20px;
  }

  .stat-icon {
    width: 56px;
    height: 56px;
  }

  .stat-value {
    font-size: 1.5rem;
  }
}
</style>
