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

      <v-alert
        v-if="openFinanceConflictCount > 0"
        type="warning"
        variant="tonal"
        class="conflict-banner"
      >
        Existem {{ openFinanceConflictCount }} conflito(s) Open Finance pendente(s) de revisão.
      </v-alert>

      <div v-if="openFinanceObservabilitySummary" class="open-finance-overview">
        <div class="overview-pill">
          <span class="overview-pill__label">Open Finance</span>
          <span class="overview-pill__value">{{ openFinanceObservabilitySummary.connectedAccounts }} contas</span>
        </div>
        <div class="overview-pill">
          <span class="overview-pill__label">Importadas</span>
          <span class="overview-pill__value">{{ openFinanceObservabilitySummary.importedTransactions }}</span>
        </div>
        <div class="overview-pill">
          <span class="overview-pill__label">Mappings</span>
          <span class="overview-pill__value">{{ openFinanceObservabilitySummary.categoryMappings }}</span>
        </div>
        <div class="overview-pill" :class="{ 'overview-pill--warning': openFinanceObservabilitySummary.accountsAtRateLimitToday > 0 }">
          <span class="overview-pill__label">Rate limit hoje</span>
          <span class="overview-pill__value">{{ openFinanceObservabilitySummary.accountsAtRateLimitToday }}</span>
        </div>
        <div v-if="openFinanceObservabilitySummary.lastSyncTrigger" class="overview-pill">
          <span class="overview-pill__label">Última sync</span>
          <span class="overview-pill__value">
            {{ openFinanceObservabilitySummary.lastSyncTrigger === 'AUTOMATIC' ? 'Automática' : 'Manual' }}
          </span>
          <span
            v-if="openFinanceObservabilitySummary.lastSyncTo"
            class="overview-pill__label"
          >
            {{ formatDate(openFinanceObservabilitySummary.lastSyncTo) }}
          </span>
        </div>
      </div>

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
                Relatório
              </v-btn>
            </div>
            <div class="card-content">
              <div v-if="dashboardSummary.topCategories.length" class="categories-list">
                <div
                  v-for="category in dashboardSummary.topCategories"
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
                <div v-for="expense in upcomingExpenses" :key="expense.title" class="upcoming-row">
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
          <h2 class="section-title">Metas em risco</h2>
          <v-btn size="small" variant="text" @click="openGoalsView">
            <v-icon start>mdi-open-in-new</v-icon>
            Ver metas
          </v-btn>
        </div>
        <div v-if="goalsAtRisk.length" class="goals-grid">
          <div v-for="goal in goalsAtRisk" :key="goal.id" class="goal-card">
            <div class="goal-header">
              <h3 class="goal-name">{{ goal.name }}</h3>
            </div>
            <div class="goal-details">
              <div class="goal-info">
                <span class="info-label">Falta</span>
                <span class="info-value">{{ formatCurrency(goal.remainingAmount) }}</span>
              </div>
              <div class="goal-info">
                <span class="info-label">Sugestão mensal</span>
                <span class="info-value">{{ formatCurrency(goal.suggestedContributionAmount) }}</span>
              </div>
              <div class="goal-info">
                <span class="info-label">Prazo</span>
                <span class="info-value">{{ goal.monthsRemaining || 0 }} mês(es)</span>
              </div>
              <div class="progress-section">
                <div class="progress-header">
                  <span class="info-label">Ritmo</span>
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
          <p>Nenhuma meta em risco no momento.</p>
        </div>
      </section>

      <section class="section-block">
        <div class="section-header">
          <h2 class="section-title">Metas com folga</h2>
          <v-btn size="small" variant="text" @click="openGoalsView">
            <v-icon start>mdi-open-in-new</v-icon>
            Ver metas
          </v-btn>
        </div>
        <div v-if="goalOpportunities.length" class="goals-grid">
          <div v-for="goal in goalOpportunities" :key="goal.id" class="goal-card">
            <div class="goal-header">
              <h3 class="goal-name">{{ goal.name }}</h3>
            </div>
            <div class="goal-details">
              <div class="goal-info">
                <span class="info-label">Falta</span>
                <span class="info-value">{{ formatCurrency(goal.remainingAmount) }}</span>
              </div>
              <div class="goal-info">
                <span class="info-label">Sugestão mensal</span>
                <span class="info-value">{{ formatCurrency(goal.suggestedContributionAmount) }}</span>
              </div>
              <div class="goal-info">
                <span class="info-label">Prazo</span>
                <span class="info-value">{{ goal.monthsRemaining || 0 }} mês(es)</span>
              </div>
              <div class="progress-section">
                <div class="progress-header">
                  <span class="info-label">Ritmo</span>
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
          <p>Nenhuma meta adiantada ainda.</p>
        </div>
      </section>

      <section class="section-block">
        <div class="section-header">
          <h2 class="section-title">{{ $t('overview.projection_title') }}</h2>
        </div>
        <div v-if="hasProjectionData" class="projection-grid">
          <div class="projection-card">
            <div class="projection-label">{{ $t('overview.projection_3m') }}</div>
            <div class="projection-value">{{ formatCurrency(projectBalance(3)) }}</div>
          </div>
          <div class="projection-card">
            <div class="projection-label">{{ $t('overview.projection_6m') }}</div>
            <div class="projection-value">{{ formatCurrency(projectBalance(6)) }}</div>
          </div>
          <div class="projection-card">
            <div class="projection-label">{{ $t('overview.projection_12m') }}</div>
            <div class="projection-value">{{ formatCurrency(projectBalance(12)) }}</div>
          </div>
        </div>
        <div v-else class="projection-placeholder">
          <p>{{ $t('overview.projection_placeholder') }}</p>
        </div>
      </section>

      <section class="section-block">
        <div class="section-header">
          <h2 class="section-title">{{ $t('overview.insights_title') }}</h2>
        </div>
        <div v-if="hasInsights" class="insights-grid">
          <div v-for="insight in overviewInsights" :key="insight" class="insight-pill">
            <v-icon size="18" color="#667eea">mdi-lightbulb-outline</v-icon>
            <span>{{ insight }}</span>
          </div>
        </div>
        <div v-else class="projection-placeholder">
          <p>{{ $t('overview.insights_placeholder') }}</p>
        </div>
      </section>

      <section class="section-block">
        <div class="section-header">
          <h2 class="section-title">{{ $t('overview.decisions_title') }}</h2>
        </div>
        <div v-if="hasDecisions" class="decisions-grid">
          <div v-for="decision in overviewDecisions" :key="decision.title" class="decision-card">
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
import 'chartjs-adapter-moment'

Chart.register(...registerables)

export default {
  computed: {
    netMonthlyCashflow() {
      return Number(this.dashboardSummary.monthlyIncome || 0) - Number(this.dashboardSummary.monthlyExpenses || 0)
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
    hasInsights() {
      return this.hasData
    },
    hasDecisions() {
      return this.hasData
    },
    overviewInsights() {
      return [
        this.$t('overview.insight_1'),
        this.$t('overview.insight_2'),
        this.$t('overview.insight_3'),
      ]
    },
    overviewDecisions() {
      return [
        {
          title: this.$t('overview.decision_1_title'),
          description: this.$t('overview.decision_1_desc'),
          impact: this.$t('overview.decision_1_impact'),
          status: this.$t('overview.decision_status_pending'),
        },
        {
          title: this.$t('overview.decision_2_title'),
          description: this.$t('overview.decision_2_desc'),
          impact: this.$t('overview.decision_2_impact'),
          status: this.$t('overview.decision_status_review'),
        },
        {
          title: this.$t('overview.decision_3_title'),
          description: this.$t('overview.decision_3_desc'),
          impact: this.$t('overview.decision_3_impact'),
          status: this.$t('overview.decision_status_suggested'),
        },
      ]
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
  },
  data() {
    const today = new Date();
    return {
      chart: null,
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
      goalsAtRisk: [],
      goalOpportunities: [],
      upcomingExpenses: [],
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
    this.fetchDashboardSummary()
    this.fetchAccounts()
    this.fetchMonthTransactions()
    this.fetchOpenFinanceConflicts()
    this.fetchOpenFinanceObservabilitySummary()
    this.fetchGoalsAtRisk()
    this.fetchCategories()
    this.createChart()
    this.fetchChartData()
  },
  watch: {
    '$i18n.locale'(newLocale) {
      if (newLocale && newLocale !== this.selectedLanguage) {
        this.selectedLanguage = newLocale
        this.fetchCategories()
      }
    }
  },
  methods: {
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
    getMonthName(monthIndex) {
      const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      return monthNames[monthIndex];
    },
    fetchDashboardSummary() {
      this.dashboardLoading = true
      FinancialReadService.fetchDashboard()
        .then((response) => {
          this.dashboardSummary = response.data
        })
        .catch((error) => {
          console.error('Error fetching dashboard summary:', error)
        })
        .finally(() => {
          this.dashboardLoading = false
        })
    },
    fetchAccounts() {
      FinancialReadService.fetchAccounts()
        .then((response) => {
          this.accounts = Array.isArray(response?.data) ? response.data : []
        })
        .catch((error) => {
          console.error('Error fetching accounts:', error)
          this.accounts = []
        })
    },
    fetchMonthTransactions() {
      const currentMonth = new Date()
      const fromDate = moment(currentMonth).startOf('month').format('YYYY-MM-DD')
      const toDate = moment(currentMonth).endOf('month').format('YYYY-MM-DD')

      FinancialReadService.fetchTransactions({
        fromDate,
        toDate,
        limit: 200,
        offset: 0,
      })
        .then((response) => {
          this.monthTransactions = Array.isArray(response?.data?.items) ? response.data.items : []
        })
        .catch((error) => {
          console.error('Error fetching month transactions:', error)
          this.monthTransactions = []
        })
    },
    fetchOpenFinanceConflicts() {
      OpenFinanceService.listReconciliationConflicts()
        .then((response) => {
          this.openFinanceConflictCount = Array.isArray(response?.data) ? response.data.length : 0
        })
        .catch((error) => {
          console.error('Error fetching Open Finance conflicts:', error)
          this.openFinanceConflictCount = 0
        })
    },
    fetchOpenFinanceObservabilitySummary() {
      OpenFinanceService.getObservabilitySummary()
        .then((response) => {
          this.openFinanceObservabilitySummary = response.data || null
        })
        .catch((error) => {
          console.error('Error fetching Open Finance observability summary:', error)
          this.openFinanceObservabilitySummary = null
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
    createChart() {
      const trendsCtx = this.$refs.trendsChart?.getContext?.('2d')
      if (!trendsCtx) {
        return
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
      if (this.chart) {
        this.chart.destroy()
      }
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
      const language = this.$i18n?.locale || this.selectedLanguage || 'en'
      this.selectedLanguage = language
      DataService.fetchCategories(language)
        .then((response) => {
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
      DataService.fetchChartData(this.selectedTimePeriod, this.selectedCategory)
        .then((response) => {
          const rawData = response.data

          if (this.selectedTimePeriod.includes('m')) {
            this.isYearly = false
            this.chartData.labels = rawData.labels.map((label) =>
              moment(label, ['YYYY-MM', 'MM-YYYY']).toISOString()
            )
            this.chartData.datasets[0].data = rawData.datasets[0].data
            this.chartData.datasets[1].data = rawData.datasets[1].data
          } else {
            this.isYearly = true
            this.chartData.labels = rawData.labels
            this.chartData.datasets[0].data = rawData.datasets[0].data
            this.chartData.datasets[1].data = rawData.datasets[1].data
          }

          this.createChart()
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
    paceStatusLabel(status) {
      if (status === 'AT_RISK') return 'Em risco'
      if (status === 'AHEAD') return 'Adiantado'
      if (status === 'ON_TRACK') return 'No ritmo'
      return 'Sem dados'
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

.v-theme--dark .headline-card {
  background: rgba(102, 126, 234, 0.2);
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

.v-theme--dark .decision-card {
  background: rgba(102, 126, 234, 0.14);
  border-color: rgba(102, 126, 234, 0.2);
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
  background: rgb(var(--v-theme-surface));
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
