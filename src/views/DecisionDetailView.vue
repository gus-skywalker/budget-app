<template>
  <div class="decision-detail-page">
    <v-container class="modern-container">
      <div v-if="loading" class="empty-state">
        <v-icon color="#94a3b8" size="28">mdi-timer-sand</v-icon>
        <p>Carregando decisão...</p>
      </div>
      <div v-else-if="error" class="empty-state empty-state--error">
        <v-icon color="#ef4444" size="28">mdi-alert-circle-outline</v-icon>
        <p>{{ error }}</p>
      </div>
      <div v-else-if="decision" class="decision-detail">
        <h1 class="page-title">{{ decision.title }}</h1>
        <p class="status">Status: {{ decision.status }}</p>
        <div class="impact">
          <span>Impacto mensal: <strong>{{ formatCurrency(decision.impact.monthlyImpact) }}</strong></span>
          <span>Saldo final projetado: <strong>{{ formatCurrency(decision.impact.projectedFinalBalance) }}</strong></span>
          <span>Mês de risco: <strong>{{ formatRiskMonth(decision.impact.firstRiskMonth) }}</strong></span>
        </div>
        <div class="summary">
          <p>{{ decision.summary.message }}</p>
        </div>
        <div class="votes">
          <span>Aprovações: {{ decision.votes.approvals }}</span>
          <span>Rejeições: {{ decision.votes.rejections }}</span>
        </div>
        <div class="justifications">
          <h3>Justificativas</h3>
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
import DecisionService, { type PublicDecision } from '@/services/DecisionService'

const route = useRoute()
const loading = ref(true)
const error = ref('')
const decision = ref<PublicDecision | null>(null)

function formatCurrency(value: number | null | undefined): string {
  const amount = Number(value || 0)
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2
  }).format(amount)
}

function formatRiskMonth(value?: string | null): string {
  if (!value) return 'Sem risco imediato'
  const [year, month] = value.split('-')
  const parsed = new Date(Number(year), Number(month) - 1, 1)
  if (Number.isNaN(parsed.getTime())) return value
  return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(parsed)
}

async function loadDecision() {
  loading.value = true
  error.value = ''
  decision.value = null
  const decisionId = String(route.params.id || '')
  if (!decisionId) {
    error.value = 'Decisão não encontrada.'
    loading.value = false
    return
  }
  try {
    // Para simplificar, reutiliza o endpoint público
    const response = await DecisionService.getPublicDecision(decisionId)
    decision.value = response.data
  } catch (e) {
    error.value = 'Erro ao carregar decisão.'
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

