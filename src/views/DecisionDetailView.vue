<template>
  <div class="decision-detail-page">
    <v-container class="modern-container">
      <div v-if="loading" class="empty-state">
        <v-icon color="#94a3b8" size="28">mdi-timer-sand</v-icon>
        <p>{{ t('decisionDetail.loading') }}</p>
      </div>
      <div v-else-if="error" class="empty-state empty-state--error">
        <v-icon color="#ef4444" size="28">mdi-alert-circle-outline</v-icon>
        <p>{{ error }}</p>
      </div>
      <div v-else-if="decision" class="decision-detail">
        <h1 class="page-title">{{ decision.title }}</h1>
        <p class="status">{{ t('decisionDetail.status_label', { status: decision.status }) }}</p>
        <div class="impact">
          <span>{{ t('decisionDetail.monthly_impact') }}: <strong>{{ formatCurrency(decision.impact.monthlyImpact) }}</strong></span>
          <span>{{ t('decisionDetail.projected_final_balance') }}: <strong>{{ formatCurrency(decision.impact.projectedFinalBalance) }}</strong></span>
          <span>{{ t('decisionDetail.risk_month') }}: <strong>{{ formatRiskMonth(decision.impact.firstRiskMonth) }}</strong></span>
        </div>
        <div class="summary">
          <p>{{ decision.summary.message }}</p>
        </div>
        <div class="votes">
          <span>{{ t('decisionDetail.approvals') }}: {{ decision.votes.approvals }}</span>
          <span>{{ t('decisionDetail.rejections') }}: {{ decision.votes.rejections }}</span>
        </div>
        <div class="justifications">
          <h3>{{ t('decisionDetail.justifications') }}</h3>
          <ul>
            <li v-for="(item, idx) in decision.justifications" :key="idx">
              <span :class="item.type === 'APPROVE' ? 'approve' : 'reject'">
                {{ item.type === 'APPROVE' ? '✔' : '✖' }}
              </span>
              <span>{{ item.message }}</span>
            </li>
          </ul>
        </div>
      </div>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import DecisionService, { type PublicDecision } from '@/services/DecisionService'

const route = useRoute()
const { t, locale } = useI18n()
const loading = ref(true)
const error = ref('')
const decision = ref<PublicDecision | null>(null)

function formatCurrency(value: number | null | undefined): string {
  const amount = Number(value || 0)
  return new Intl.NumberFormat(getLocaleForFormatting(), {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2
  }).format(amount)
}

function formatRiskMonth(value?: string | null): string {
  if (!value) return t('decisionDetail.no_immediate_risk')
  const [year, month] = value.split('-')
  const parsed = new Date(Number(year), Number(month) - 1, 1)
  if (Number.isNaN(parsed.getTime())) return value
  return new Intl.DateTimeFormat(getLocaleForFormatting(), { month: 'long', year: 'numeric' }).format(parsed)
}

function getLocaleForFormatting(): string {
  if (locale.value === 'en') return 'en-US'
  if (locale.value === 'fr') return 'fr-FR'
  if (locale.value === 'es') return 'es-ES'
  return 'pt-BR'
}

async function loadDecision() {
  loading.value = true
  error.value = ''
  decision.value = null
  const decisionId = String(route.params.id || '')
  if (!decisionId) {
    error.value = t('decisionDetail.not_found')
    loading.value = false
    return
  }
  try {
    const response = await DecisionService.getPublicDecision(decisionId)
    decision.value = response.data
  } catch (e) {
    error.value = t('decisionDetail.load_error')
  } finally {
    loading.value = false
  }
}

onMounted(loadDecision)
</script>

<style scoped>
.decision-detail-page {
  min-height: 100vh;
  background: #f8fafc;
  padding: 32px 0;
}
.page-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 8px;
}
.status {
  color: #475569;
  font-weight: 600;
  margin-bottom: 16px;
}
.impact span {
  display: block;
  margin-bottom: 4px;
}
.summary {
  margin: 16px 0;
}
.votes {
  margin-bottom: 16px;
}
.justifications ul {
  list-style: none;
  padding: 0;
}
.justifications li {
  margin-bottom: 6px;
}
.approve {
  color: #15803d;
  margin-right: 6px;
}
.reject {
  color: #b91c1c;
  margin-right: 6px;
}
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #64748b;
  padding: 40px 16px;
  text-align: center;
}
.empty-state--error {
  color: #b91c1c;
}
</style>
