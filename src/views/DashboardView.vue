<template>
  <v-container>
    <!-- Overview Section -->
    <v-card class="section">
      <v-card-title>
        <v-row align="center" justify="space-between" style="width: 100%;">
          <v-col cols="auto">
            <h2>{{ $t('overview.title') }}</h2>
          </v-col>
          <v-col cols="auto" class="text-right">
            <div style="font-size: 2em;">{{ monthName }}</div>
            <div style="font-size: 0.8em;">{{ day }}/{{ month }}/{{ year }}</div>
          </v-col>
        </v-row>
      </v-card-title>
      <v-card-text>
        <div>{{ $t('overview.total_income') }}: {{ overview.totalIncome }}</div>
        <div>{{ $t('overview.total_expenses') }}: {{ overview.totalExpense }}</div>
        <div>{{ $t('overview.savings') }}: {{ overview.savings }}</div>
      </v-card-text>
    </v-card>


    <!-- Trends Over Time -->
    <v-card class="section">
      <v-card-title>
        <h2>{{ $t('trends.title') }}</h2>
      </v-card-title>
      <v-card-text>
        <v-row align="center">
          <v-col cols="12" md="6" lg="4">
            <v-select :label="$t('trends.select_chart_type')" outlined v-model="chartType" :items="chartTypes"
              @update:modelValue="updateCharts"></v-select>
          </v-col>
          <v-col cols="12" md="6" lg="4">
            <v-select :label="$t('trends.select_time_period')" outlined v-model="selectedTimePeriod"
              :items="timePeriods" @update:modelValue="updateCharts"></v-select>
          </v-col>
          <v-col cols="12" md="6" lg="4">
            <v-select :label="$t('trends.select_expense_category')" outlined v-model="selectedCategory"
              :items="expenseCategories" item-title="name" item-value="code"
              @update:modelValue="updateCharts"></v-select>
          </v-col>
        </v-row>
        <v-divider class="my-4"></v-divider>
        <div class="chart-container">
          <canvas ref="trendsChart"></canvas>
        </div>
      </v-card-text>
    </v-card>

    <!-- Budget Tracker -->
    <v-card class="section">
      <v-card-title>
        <h2>{{ $t('budget_tracker.title') }}</h2>
      </v-card-title>
      <!-- Display budget for different expense categories -->
    </v-card>

    <!-- Financial Goals -->
    <v-card class="section">
      <v-card-title>
        <h2>{{ $t('financial_goals.title') }}</h2>
      </v-card-title>
      <v-card-text>
        <v-row v-if="financialGoals.length">
          <v-col cols="12" md="6" lg="4" v-for="goal in financialGoals" :key="goal.id">
            <v-card>
              <v-card-title>{{ goal.name }}</v-card-title>
              <v-card-text>
                <div>{{ $t('financial_goals.target_amount') }}: ${{ goal.targetAmount }}</div>
                <div>{{ $t('financial_goals.deadline') }}: {{ goal.deadline }}</div>
                <div>{{ $t('financial_goals.progress') }}: {{ goal.progress }}%</div>
                <!-- Visual indicator for progress -->
                <v-progress-linear :model-value="goal.progress" color="blue" height="7"></v-progress-linear>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
        <v-alert v-else type="info">
          {{ $t('financial_goals.no_goals') }}
        </v-alert>
      </v-card-text>
    </v-card>
  </v-container>
</template>


<script>
import { Chart, registerables } from 'chart.js/auto'
import moment from 'moment'
import DataService from '@/services/DataService'
import FinancialGoalService from '@/services/FinancialGoalService';
import 'chartjs-adapter-moment'

Chart.register(...registerables)

export default {
  data() {
    const today = new Date();
    return {
      chart: null,
      overview: {
        totalIncome: 0.0,
        totalExpense: 0.0,
        savings: 0.0,
      },
      selectedTimePeriod: '3m',
      selectedCategory: null,
      isYearly: false,
      expenseCategories: [],
      selectedLanguage: 'en',
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
    this.fetchMonthOverview()
    this.createChart()
    this.fetchFinancialGoals()
  },
  methods: {
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
    fetchCategories() {
      DataService.fetchCategories(this.selectedLanguage)
        .then((response) => {
          this.expenseCategories = response.data.map((category) => ({
            id: category.id,
            code: category.code,
            name: category.name
          }))
        })
        .catch((error) => {
          console.error('Error fetching categories:', error)
        });
    },
    fetchMonthOverview() {
      DataService.fetchMonthOverview()
        .then(response => {
          this.overview = response.data;
        })
        .catch((error) => {
          console.error('Error fetching month overview:', error)
        });;
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
.section {
  margin-bottom: 30px;
}

.chart-container {
  position: relative;
  height: 400px;
}
</style>
