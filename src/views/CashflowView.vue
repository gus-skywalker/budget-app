<template>
  <div class="cashflow-page">
    <v-container class="modern-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">{{ $t('cashflow.title') }}</h1>
          <p class="page-subtitle">{{ $t('cashflow.subtitle') }}</p>
        </div>
      </div>

      <div class="modern-card">
        <div class="card-header">
          <h2 class="card-title">
            <v-icon color="#667eea" class="mr-2">mdi-chart-areaspline</v-icon>
            {{ $t('cashflow.flow_title') }}
          </h2>
        </div>
        <div class="card-content">
          <CashflowDashboard />
        </div>
      </div>

      <div class="modern-card">
        <div class="card-header">
          <div class="insights-header">
            <h2 class="card-title">
              <v-icon color="#667eea" class="mr-2">mdi-brain</v-icon>
              {{ $t('cashflow.insights_title') }}
            </h2>
            <span class="experimental-badge">{{ $t('cashflow.experimental_badge') }}</span>
          </div>
        </div>
        <div class="card-content">
          <p class="experimental-note">{{ $t('cashflow.experimental_note') }}</p>
          <div class="insights-grid">
            <MonthlyExpensesPrediction />
            <AnomalyDetectionTable />
          </div>
        </div>
      </div>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import CashflowDashboard from '@/components/ai/CashflowDashboard.vue'
import MonthlyExpensesPrediction from '@/components/ai/MonthlyExpensesPrediction.vue'
import AnomalyDetectionTable from '@/components/ai/AnomalyDetectionTable.vue'
</script>

<style scoped>
.cashflow-page {
  min-height: 100vh;
  background: linear-gradient(135deg, rgba(245, 247, 250, 1) 0%, rgba(232, 234, 240, 1) 100%);
  padding: 32px 0;
}

.v-theme--dark .cashflow-page {
  background: linear-gradient(135deg, rgba(30, 30, 30, 1) 0%, rgba(20, 20, 20, 1) 100%);
}

.modern-container {
  max-width: 1400px;
  padding-left: 16px;
  padding-right: 16px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 12px;
}

.page-title {
  font-size: 2.2rem;
  font-weight: 700;
  margin: 0 0 8px;
  color: #1a1a1a;
}

.v-theme--dark .page-title {
  color: #ffffff;
}

.page-subtitle {
  margin: 0;
  color: #666;
  font-size: 1rem;
}

.v-theme--dark .page-subtitle {
  color: #b0b0b0;
}

.modern-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 32px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.v-theme--dark .modern-card {
  background: #2a2a2a;
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
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
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  color: #1a1a1a;
}

.v-theme--dark .card-title {
  color: #ffffff;
}

.card-content {
  padding: 24px;
}

.insights-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.experimental-badge {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0.3rem 0.8rem;
  background: rgba(245, 158, 11, 0.12);
  color: #b45309;
  font-size: 0.82rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.v-theme--dark .experimental-badge {
  background: rgba(245, 158, 11, 0.18);
  color: #fbbf24;
}

.experimental-note {
  margin: 0 0 16px;
  color: #64748b;
  font-size: 0.95rem;
}

.v-theme--dark .experimental-note {
  color: #cbd5e1;
}

.insights-grid {
  display: grid;
  gap: 24px;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
}
</style>
