<template>
  <div class="public-decision-page">
    <header class="public-header">
      <h1 class="logo">CoBudget</h1>
      <p class="tagline">{{ t('publicDecision.tagline') }}</p>
    </header>

    <main class="public-content">
      <section v-if="loading" class="state-card">
        <p>{{ t('publicDecision.loading') }}</p>
      </section>

      <section v-else-if="notFound" class="state-card">
        <h2>{{ t('publicDecision.not_found_title') }}</h2>
        <p>{{ t('publicDecision.not_found_message') }}</p>
      </section>

      <template v-else-if="decision">
        <section class="title-section">
          <h2>{{ decision.title }}</h2>
          <p class="status">{{ decision.status }}</p>
        </section>

        <section class="impact-card">
          <div class="impact-label">{{ t('publicDecision.monthly_impact') }}</div>
          <div class="impact-value" :class="impactClass">{{ formatCurrency(decision.impact.monthlyImpact) }}</div>
          <div class="impact-meta">
            <span>{{ t('publicDecision.projected_final_balance') }}: <strong>{{ formatCurrency(decision.impact.projectedFinalBalance) }}</strong></span>
            <span>{{ t('publicDecision.first_risk_month') }}: <strong>{{ formatRiskMonth(decision.impact.firstRiskMonth) }}</strong></span>
          </div>
        </section>

        <section class="summary-card">
          <p>{{ decision.summary.message }}</p>
        </section>

        <section class="votes-card">
          <h3>{{ t('publicDecision.votes') }}</h3>
          <p>{{ t('publicDecision.votes_summary', { approvals: decision.votes.approvals, rejections: decision.votes.rejections }) }}</p>
        </section>

        <section class="reasoning-card">
          <h3>{{ t('publicDecision.team_reasoning') }}</h3>
          <ul v-if="decision.justifications.length" class="reasoning-list">
            <li v-for="(item, index) in decision.justifications" :key="`${item.type}-${index}`">
              <span class="reasoning-type" :class="item.type === 'APPROVE' ? 'approve' : 'reject'">
                {{ item.type === 'APPROVE' ? '✔' : '✖' }}
              </span>
              <span>{{ item.message }}</span>
            </li>
          </ul>
          <p v-else>{{ t('publicDecision.no_justifications') }}</p>
        </section>

        <section class="cta-card">
          <h3>{{ t('publicDecision.cta_title') }}</h3>
          <v-btn color="#0ea5e9" size="large" rounded="xl" @click="goToSignup">{{ t('publicDecision.cta_button') }}</v-btn>
        </section>
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import DecisionService, { type PublicDecision } from '@/services/DecisionService'

const route = useRoute()
const router = useRouter()
const { locale, t } = useI18n()

const loading = ref(true)
const notFound = ref(false)
const decision = ref<PublicDecision | null>(null)

const formattingLocale = computed(() => {
  if (locale.value === 'en') return 'en-US'
  if (locale.value === 'fr') return 'fr-FR'
  if (locale.value === 'es') return 'es-ES'
  return 'pt-BR'
})

const impactClass = computed(() => {
  const value = decision.value?.impact?.monthlyImpact ?? 0
  if (value > 0) return 'positive'
  if (value < 0) return 'negative'
  return 'neutral'
})

function formatCurrency(value: number | null | undefined): string {
  const amount = Number(value || 0)
  return new Intl.NumberFormat(formattingLocale.value, {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2
  }).format(amount)
}

function formatRiskMonth(value?: string | null): string {
  if (!value) return t('publicDecision.no_immediate_risk')
  const [year, month] = value.split('-')
  const parsed = new Date(Number(year), Number(month) - 1, 1)
  if (Number.isNaN(parsed.getTime())) return value
  return new Intl.DateTimeFormat(formattingLocale.value, { month: 'long', year: 'numeric' }).format(parsed)
}

async function loadPublicDecision() {
  loading.value = true
  notFound.value = false
  decision.value = null
  const decisionId = String(route.params.id || '')
  if (!decisionId) {
    notFound.value = true
    loading.value = false
    return
  }
  try {
    const response = await DecisionService.getPublicDecision(decisionId)
    decision.value = response.data
  } catch (error: any) {
    notFound.value = true
  } finally {
    loading.value = false
  }
}

function goToSignup() {
  router.push({ path: '/login', query: { signup: 'true' } })
}

watch(() => route.params.id, loadPublicDecision)
onMounted(loadPublicDecision)
</script>

<style scoped>
.public-decision-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at 12% 12%, rgba(14, 165, 233, 0.12), transparent 38%),
    radial-gradient(circle at 88% 10%, rgba(34, 197, 94, 0.12), transparent 34%),
    #f8fafc;
  color: #0f172a;
  padding: 24px 16px 48px;
}

.public-header {
  text-align: center;
  margin-bottom: 24px;
}

.logo {
  margin: 0;
  font-size: 1.8rem;
  letter-spacing: 0.02em;
}

.tagline {
  margin: 6px 0 0;
  color: #475569;
}

.public-content {
  max-width: 760px;
  margin: 0 auto;
  display: grid;
  gap: 14px;
}

.state-card,
.title-section,
.impact-card,
.summary-card,
.votes-card,
.reasoning-card,
.cta-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 18px;
}

.title-section {
  text-align: center;
}

.title-section h2 {
  margin: 0;
  font-size: 2rem;
}

.status {
  margin-top: 6px;
  color: #475569;
  font-weight: 600;
}

.impact-label {
  color: #64748b;
  font-size: 0.9rem;
}

.impact-value {
  margin-top: 8px;
  font-size: 2.4rem;
  font-weight: 800;
}

.impact-value.positive {
  color: #15803d;
}

.impact-value.negative {
  color: #b91c1c;
}

.impact-value.neutral {
  color: #475569;
}

.impact-meta {
  margin-top: 10px;
  display: grid;
  gap: 4px;
  color: #334155;
}

.summary-card p {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 600;
}

.votes-card h3,
.reasoning-card h3,
.cta-card h3 {
  margin: 0 0 8px;
}

.votes-card p {
  margin: 0;
}

.reasoning-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 10px;
}

.reasoning-list li {
  display: grid;
  grid-template-columns: 24px 1fr;
  gap: 8px;
  align-items: start;
}

.reasoning-type.approve {
  color: #15803d;
}

.reasoning-type.reject {
  color: #b91c1c;
}

.cta-card {
  text-align: center;
}

@media (max-width: 720px) {
  .title-section h2 {
    font-size: 1.6rem;
  }

  .impact-value {
    font-size: 1.9rem;
  }
}
</style>
