<template>
  <div class="dashboard-container">
    <v-container class="modern-container">
      <!-- Header com Boas-vindas -->
      <div class="dashboard-header">
        <div class="welcome-section">
          <h1 class="page-title">{{ $t('overview.title') }}</h1>
          <p class="page-subtitle">Visão geral das suas finanças</p>
        </div>
        <div class="date-badge">
          <div class="month-name">{{ monthName }}</div>
          <div class="full-date">{{ day }}/{{ month }}/{{ year }}</div>
        </div>
      </div>

      <!-- Overview Section - Cards Modernos -->
      <v-row class="overview-cards">
        <v-col cols="12" md="4">
          <div class="stat-card income-card">
            <div class="stat-icon">
              <v-icon size="40" color="white">mdi-trending-up</v-icon>
            </div>
            <div class="stat-content">
              <div class="stat-label">{{ $t('overview.total_income') }}</div>
              <div class="stat-value">{{ formatCurrency(dashboardSummary.monthlyIncome) }}</div>
            </div>
          </div>
        </v-col>
        <v-col cols="12" md="4">
          <div class="stat-card expense-card">
            <div class="stat-icon">
              <v-icon size="40" color="white">mdi-trending-down</v-icon>
            </div>
            <div class="stat-content">
              <div class="stat-label">{{ $t('overview.total_expenses') }}</div>
              <div class="stat-value">{{ formatCurrency(dashboardSummary.monthlyExpenses) }}</div>
            </div>
          </div>
        </v-col>
        <v-col cols="12" md="4">
          <div class="stat-card savings-card">
            <div class="stat-icon">
              <v-icon size="40" color="white">mdi-piggy-bank</v-icon>
            </div>
            <div class="stat-content">
              <div class="stat-label">{{ $t('overview.total_balance') }}</div>
              <div class="stat-value">{{ formatCurrency(dashboardSummary.totalBalance) }}</div>
            </div>
          </div>
        </v-col>
      </v-row>

      <v-row class="finance-read-grid">
        <v-col cols="12" lg="5">
          <div class="modern-card accounts-section">
            <div class="card-header">
              <h2 class="card-title">
                <v-icon color="#667eea" class="mr-2">mdi-bank-outline</v-icon>
                {{ $t('overview.accounts') }}
              </h2>
            </div>
            <div class="card-content">
              <div v-if="accountsLoading" class="loading-state compact-loading-state">
                <v-progress-circular indeterminate color="#667eea" size="40"></v-progress-circular>
              </div>
              <div v-else-if="accounts.length" class="accounts-grid">
                <div v-for="account in accounts" :key="account.id" class="account-card">
                  <div class="account-card__header">
                    <div>
                      <h3 class="account-card__title">{{ account.name }}</h3>
                      <p class="account-card__subtitle">{{ account.provider }} • {{ account.accountType }}</p>
                    </div>
                    <v-chip size="small" variant="tonal" color="#667eea">{{ account.currency }}</v-chip>
                  </div>
                  <div class="account-card__balance">{{ formatCurrency(account.balance, account.currency) }}</div>
                </div>
              </div>
              <div v-else class="empty-state compact-empty-state">
                <v-icon size="48" color="#667eea" class="mb-3">mdi-bank-off-outline</v-icon>
                <p class="empty-message">{{ $t('overview.no_accounts') }}</p>
              </div>
            </div>
          </div>
        </v-col>

        <v-col cols="12" lg="7">
          <div class="modern-card transactions-section">
            <div class="card-header">
              <h2 class="card-title">
                <v-icon color="#667eea" class="mr-2">mdi-swap-horizontal</v-icon>
                {{ $t('overview.recent_transactions') }}
              </h2>
            </div>
            <div class="card-content">
              <div v-if="dashboardLoading" class="loading-state compact-loading-state">
                <v-progress-circular indeterminate color="#667eea" size="40"></v-progress-circular>
              </div>
              <div v-else-if="dashboardSummary.recentTransactions.length" class="transactions-list">
                <div
                  v-for="transaction in dashboardSummary.recentTransactions"
                  :key="transaction.id"
                  class="transaction-row"
                >
                  <div class="transaction-row__main">
                    <div class="transaction-row__title">{{ transaction.description }}</div>
                    <div class="transaction-row__meta">
                      <span>{{ formatDisplayDate(transaction.date) }}</span>
                      <span>{{ transaction.accountName || '—' }}</span>
                      <span>{{ transaction.category || '—' }}</span>
                      <v-chip size="x-small" variant="outlined">{{ transaction.status }}</v-chip>
                    </div>
                  </div>
                  <div :class="['transaction-row__amount', transaction.direction === 'INFLOW' ? 'is-positive' : 'is-negative']">
                    {{ formatCurrency(transaction.amount, resolveTransactionCurrency(transaction.accountId)) }}
                  </div>
                </div>
              </div>
              <div v-else class="empty-state compact-empty-state">
                <v-icon size="48" color="#667eea" class="mb-3">mdi-swap-horizontal-off</v-icon>
                <p class="empty-message">{{ $t('overview.no_recent_transactions') }}</p>
              </div>
            </div>
          </div>

          <div class="modern-card top-categories-section">
            <div class="card-header">
              <h2 class="card-title">
                <v-icon color="#667eea" class="mr-2">mdi-shape-outline</v-icon>
                {{ $t('overview.top_categories') }}
              </h2>
            </div>
            <div class="card-content">
              <div v-if="dashboardSummary.topCategories.length" class="top-categories-list">
                <v-chip
                  v-for="category in dashboardSummary.topCategories"
                  :key="category"
                  color="#667eea"
                  variant="tonal"
                  class="top-category-chip"
                >
                  {{ category }}
                </v-chip>
              </div>
              <div v-else class="empty-state compact-empty-state">
                <v-icon size="48" color="#667eea" class="mb-3">mdi-shape-off</v-icon>
                <p class="empty-message">{{ $t('overview.no_top_categories') }}</p>
              </div>
            </div>
          </div>
        </v-col>
      </v-row>

      <!-- AI Insights -->
      <section class="ai-insights">
        <div class="ai-hero-card">
          <CashflowDashboard />
        </div>
        <div class="ai-grid">
          <div class="ai-card-wrapper">
            <MonthlyExpensesPrediction />
          </div>
          <div class="ai-card-wrapper">
            <AnomalyDetectionTable />
          </div>
        </div>
      </section>


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

      <!-- Budget Tracker -->
      <div class="modern-card budget-tracker-section">
        <div class="card-header">
          <h2 class="card-title">
            <v-icon color="#667eea" class="mr-2">mdi-wallet</v-icon>
            {{ $t('budget_tracker.title') }}
          </h2>
        </div>
        <!-- Display budget for different expense categories -->
      </div>

      <!-- Financial Goals -->
      <div class="modern-card goals-section">
        <div class="card-header">
          <h2 class="card-title">
            <v-icon color="#667eea" class="mr-2">mdi-bullseye-arrow</v-icon>
            {{ $t('financial_goals.title') }}
          </h2>
        </div>
        <div class="card-content">
          <v-row v-if="financialGoals.length">
            <v-col cols="12" md="6" lg="4" v-for="goal in financialGoals" :key="goal.id">
              <div class="goal-card">
                <div class="goal-header">
                  <h3 class="goal-name">{{ goal.name }}</h3>
                </div>
                <div class="goal-details">
                  <div class="goal-info">
                    <span class="info-label">{{ $t('financial_goals.target_amount') }}</span>
                    <span class="info-value">${{ goal.targetAmount }}</span>
                  </div>
                  <div class="goal-info">
                    <span class="info-label">{{ $t('financial_goals.deadline') }}</span>
                    <span class="info-value">{{ goal.deadline }}</span>
                  </div>
                  <div class="progress-section">
                    <div class="progress-header">
                      <span class="progress-label">{{ $t('financial_goals.progress') }}</span>
                      <span class="progress-percentage">{{ goal.progress }}%</span>
                    </div>
                    <div class="progress-bar-container">
                      <div class="progress-bar" :style="{ width: goal.progress + '%' }"></div>
                    </div>
                  </div>
                </div>
              </div>
            </v-col>
          </v-row>
          <div v-else class="empty-state">
            <v-icon size="64" color="#667eea" class="mb-4">mdi-bullseye-arrow</v-icon>
            <p class="empty-message">{{ $t('financial_goals.no_goals') }}</p>
          </div>
        </div>
      </div>
    </v-container>
  </div>
</template>


<script>
import { Chart, registerables } from 'chart.js/auto'
import moment from 'moment'
import DataService from '@/services/DataService'
import FinancialReadService from '@/services/FinancialReadService'
import FinancialGoalService from '@/services/FinancialGoalService';
import CashflowDashboard from '@/components/ai/CashflowDashboard.vue'
import MonthlyExpensesPrediction from '@/components/ai/MonthlyExpensesPrediction.vue'
import AnomalyDetectionTable from '@/components/ai/AnomalyDetectionTable.vue'
import 'chartjs-adapter-moment'

Chart.register(...registerables)

export default {
  components: {
    CashflowDashboard,
    MonthlyExpensesPrediction,
    AnomalyDetectionTable
  },
  data() {
    const today = new Date();
    return {
      chart: null,
      dashboardLoading: false,
      accountsLoading: false,
      dashboardSummary: {
        totalBalance: 0,
        monthlyIncome: 0,
        monthlyExpenses: 0,
        recentTransactions: [],
        topCategories: [],
      },
      accounts: [],
      selectedTimePeriod: '3m',
      selectedCategory: null,
      isYearly: false,
      expenseCategories: [],
      selectedLanguage: this.i18n$?.locale || 'en',
      financialGoals: [],

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
    this.fetchCategories()
    this.fetchDashboardSummary()
    this.fetchAccounts()
    this.createChart()
    this.fetchFinancialGoals()
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
      return 'pt-BR'
    },
    formatCurrency(value, currency = null) {
      const resolvedCurrency = currency || this.accounts[0]?.currency || 'BRL'
      return Number(value || 0).toLocaleString(this.getLocaleForFormatting(), {
        style: 'currency',
        currency: resolvedCurrency,
      })
    },
    formatDisplayDate(value) {
      if (!value) {
        return '—'
      }

      return new Date(`${value}T00:00:00`).toLocaleDateString(this.getLocaleForFormatting())
    },
    resolveTransactionCurrency(accountId) {
      const account = this.accounts.find((item) => item.id === accountId)
      return account?.currency || this.accounts[0]?.currency || 'BRL'
    },
    getMonthName(monthIndex) {
      const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      return monthNames[monthIndex];
    },
    createChart() {
      const trendsCtx = this.$refs.trendsChart.getContext('2d')
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
                source: 'labels' // Usar as labels fornecidas para escalas
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
      this.accountsLoading = true
      FinancialReadService.fetchAccounts()
        .then((response) => {
          this.accounts = response.data
        })
        .catch((error) => {
          console.error('Error fetching accounts:', error)
        })
        .finally(() => {
          this.accountsLoading = false
        })
    },
    fetchCategories() {
      const language = this.$i18n?.locale || this.selectedLanguage || 'en'
      this.selectedLanguage = language
      DataService.fetchCategories(language)
        .then((response) => {
          this.expenseCategories = response.data.map((category) => {
            const translationKey = `categories.${category.code}`
            const translatedName = this.$t(translationKey)
            const isTranslated = translatedName !== translationKey
            return {
              id: category.id,
              code: category.code,
              name: isTranslated ? translatedName : category.name
            }
          })
        })
        .catch((error) => {
          console.error('Error fetching categories:', error)
        });
    },
    fetchFinancialGoals() {
      FinancialGoalService.fetchFinancialGoals()
        .then((response) => {
          this.financialGoals = response.data;
        })
        .catch((error) => {
          console.error('Erro ao buscar metas financeiras:', error);
        });
    },
    fetchChartData() {
      DataService.fetchChartData(this.selectedTimePeriod, this.selectedCategory)
        .then((response) => {
          const rawData = response.data
          console.log(rawData)

          if (this.selectedTimePeriod.includes('m')) {
            this.isYearly = false
            // Lógica para períodos flexíveis
            this.chartData.labels = rawData.labels.map((label) =>
              moment(label, 'MM-YYYY').toISOString()
            )
            this.chartData.datasets[0].data = rawData.datasets[0].data
            this.chartData.datasets[1].data = rawData.datasets[1].data
          } else {
            this.isYearly = true
            // Lógica para períodos anuais
            this.chartData.labels = rawData.labels
            this.chartData.datasets[0].data = rawData.datasets[0].data
            this.chartData.datasets[1].data = rawData.datasets[1].data
          }

          this.createChart()
        })
        .catch((error) => {
          console.error('Error fetching chart data:', error)
        })
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

/* Overview Cards */
.overview-cards {
  margin-bottom: 40px;
}

.finance-read-grid {
  margin-bottom: 40px;
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

.accounts-grid,
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
  text-transform: uppercase;
  letter-spacing: 0.5px;
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
