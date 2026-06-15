<template>
  <v-container id="choose-plan-page" fluid class="choose-plan-page">
    <section class="plan-hero">
      <div class="shell hero-grid">
        <div class="hero-copy">
          <span class="eyebrow">{{ $t('landingPage.auth.signupNow') }}</span>
          <h1>{{ $t('choosePlan.title') }}</h1>
          <p class="hero-subtitle">{{ $t('choosePlan.subtitle') }}</p>

          <div class="hero-notes">
            <article class="note-card">
              <div class="icon-chip icon-chip-contrast">
                <v-icon size="20">mdi-brain</v-icon>
              </div>
              <div>
                <strong>{{ $t('choosePlan.ai_title') }}</strong>
                <p>{{ $t('choosePlan.ai_desc') }}</p>
              </div>
            </article>

            <article class="note-card">
              <div class="icon-chip icon-chip-warm">
                <v-icon size="20">mdi-shield-lock-outline</v-icon>
              </div>
              <div>
                <strong>{{ $t('choosePlan.payment_security_title') }}</strong>
                <p>{{ $t('choosePlan.payment_security_text') }}</p>
              </div>
            </article>
          </div>
        </div>

        <div class="hero-side">
          <div class="ai-summary-card">
            <div class="summary-head">
              <span class="summary-tag">{{ $t('landingPage.ai.title') }}</span>
              <h2>{{ $t('choosePlan.ai_title') }}</h2>
            </div>

            <ul class="feature-list feature-list-ai">
              <li v-for="item in aiFeatures" :key="item.labelKey">
                <div class="icon-chip icon-chip-contrast icon-chip-small">
                  <v-icon size="18">{{ item.icon }}</v-icon>
                </div>
                <span>{{ $t(item.labelKey) }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <section v-if="promotion?.campaignKey" class="section-block promo-section">
      <div class="shell">
        <div class="promo-banner">
          <div>
            <span class="section-kicker">{{ $t('choosePlan.promo_kicker') }}</span>
            <h2>{{ promotion.name }}</h2>
            <p>{{ promotion.description }}</p>
          </div>
          <div class="promo-stats">
            <strong>{{ promotion.remainingClaims }} / {{ promotion.maxClaims }}</strong>
            <span>{{ $t('choosePlan.promo_remaining') }}</span>
          </div>
        </div>
      </div>
    </section>

    <section id="plans" class="plans-section section-block">
      <div class="shell">
        <div class="section-heading">
          <span class="section-kicker">{{ $t('choosePlan.best_offer') }}</span>
          <h2>{{ $t('choosePlan.title') }}</h2>
          <p>{{ $t('choosePlan.subtitle') }}</p>
        </div>

        <div class="plans-grid">
          <article class="plan-card free">
            <div class="plan-head">
              <span class="plan-tag free-tag">{{ $t('choosePlan.free_tag') }}</span>
              <h3>{{ $t('choosePlan.free_name') }}</h3>
              <p class="plan-subtitle">{{ $t('choosePlan.free_subtitle') }}</p>
            </div>

            <div class="price-stack">
              <div class="price-row free-price">
                <span class="price-label">{{ $t('choosePlan.free_price_label') }}</span>
                <span class="price-amount">{{ $t('choosePlan.free_price') }}</span>
              </div>
            </div>

            <ul class="feature-list">
              <li v-for="item in freeFeatures" :key="item.labelKey">
                <div class="icon-chip icon-chip-contrast icon-chip-small">
                  <v-icon size="18">{{ item.icon }}</v-icon>
                </div>
                <span>{{ $t(item.labelKey) }}</span>
              </li>
            </ul>

            <div class="plan-cta">
              <button class="btn btn-outline free-outline" type="button" @click.prevent="goToApp">
                {{ $t('choosePlan.free_cta') }}
              </button>
            </div>
          </article>

          <article class="plan-card starter">
            <div class="plan-head">
              <span class="plan-tag starter-tag">{{ $t('choosePlan.starter_tag') }}</span>
              <h3>{{ $t('choosePlan.starter_name') }}</h3>
              <p class="plan-subtitle">{{ $t('choosePlan.starter_subtitle') }}</p>
            </div>

            <div class="price-stack">
              <div class="price-row">
                <span class="price-label">{{ $t('choosePlan.monthly_label') }}</span>
                <span class="price-amount">{{ formatPlanPrice(planDetails.MONTHLY) }}</span>
              </div>
              <div class="price-row annual">
                <span class="price-label">{{ $t('choosePlan.annual_label') }}</span>
                <span class="price-strike">{{ $t('choosePlan.from_price', { amount: formatAmount(annualOriginal(planDetails.MONTHLY.amount)) }) }}</span>
                <span class="price-amount">{{ formatPlanPrice(planDetails.ANNUAL) }}</span>
                <span class="price-badge">{{ $t('choosePlan.save_percent', { percent: discountPercent(planDetails.MONTHLY.amount, planDetails.ANNUAL.amount) }) }}</span>
                <span class="price-note">{{ $t('choosePlan.equals_month', { amount: formatAmount(planDetails.ANNUAL.amount / 12) }) }}</span>
              </div>
            </div>

            <ul class="feature-list">
              <li v-for="item in starterFeatures" :key="item.labelKey">
                <div class="icon-chip icon-chip-contrast icon-chip-small">
                  <v-icon size="18">{{ item.icon }}</v-icon>
                </div>
                <span>{{ $t(item.labelKey) }}</span>
              </li>
            </ul>

            <div class="plan-cta">
              <button class="btn btn-outline starter-outline" type="button" @click.prevent="redirectToCheckout('MONTHLY')">
                {{ $t('choosePlan.monthly_short') }}
              </button>
              <button class="btn btn-solid starter-solid" type="button" @click.prevent="redirectToCheckout('ANNUAL')">
                {{ $t('choosePlan.annual_short_discount') }}
              </button>
            </div>
          </article>

          <article class="plan-card team">
            <div class="plan-ribbon">{{ $t('choosePlan.best_offer') }}</div>
            <div class="plan-head">
              <span class="plan-tag team-tag">{{ $t('choosePlan.team_tag') }}</span>
              <h3>{{ $t('choosePlan.team_name') }}</h3>
              <p class="plan-subtitle">{{ $t('choosePlan.team_subtitle') }}</p>
            </div>

            <div class="price-stack">
              <div class="price-row team-highlight">
                <span class="price-label">{{ $t('choosePlan.monthly_label') }}</span>
                <span class="price-amount">{{ formatPlanPrice(planDetails.BUSINESS_MONTHLY) }}</span>
              </div>
              <div class="price-row annual team-annual">
                <span class="price-label">{{ $t('choosePlan.annual_label') }}</span>
                <span class="price-strike">{{ $t('choosePlan.from_price', { amount: formatAmount(annualOriginal(planDetails.BUSINESS_MONTHLY.amount)) }) }}</span>
                <span class="price-amount">{{ formatPlanPrice(planDetails.BUSINESS_ANNUAL) }}</span>
                <span class="price-badge">{{ $t('choosePlan.save_percent', { percent: discountPercent(planDetails.BUSINESS_MONTHLY.amount, planDetails.BUSINESS_ANNUAL.amount) }) }}</span>
                <span class="price-note">{{ $t('choosePlan.equals_month', { amount: formatAmount(planDetails.BUSINESS_ANNUAL.amount / 12) }) }}</span>
              </div>
            </div>

            <ul class="feature-list">
              <li v-for="item in teamFeatures" :key="item.labelKey">
                <div class="icon-chip icon-chip-contrast icon-chip-small">
                  <v-icon size="18">{{ item.icon }}</v-icon>
                </div>
                <span>{{ $t(item.labelKey) }}</span>
              </li>
            </ul>

            <div class="plan-cta">
              <button class="btn btn-outline team-outline" type="button" @click.prevent="redirectToCheckout('BUSINESS_MONTHLY')">
                {{ $t('choosePlan.monthly_short') }}
              </button>
              <button class="btn btn-solid team-solid" type="button" @click.prevent="redirectToCheckout('BUSINESS_ANNUAL')">
                {{ $t('choosePlan.annual_short_discount') }}
              </button>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section class="section-block trust-section">
      <div class="shell trust-grid">
        <article class="trust-card">
          <div class="icon-chip icon-chip-warm">
            <v-icon size="20">mdi-backup-restore</v-icon>
          </div>
          <div>
            <h3>{{ $t('choosePlan.cancellation_title') }}</h3>
            <p>{{ $t('choosePlan.cancellation_text') }}</p>
          </div>
        </article>

        <article class="trust-card">
          <div class="icon-chip icon-chip-contrast">
            <v-icon size="20">mdi-lock-check-outline</v-icon>
          </div>
          <div>
            <h3>{{ $t('choosePlan.payment_security_title') }}</h3>
            <p>{{ $t('choosePlan.payment_security_text') }}</p>
          </div>
        </article>
      </div>
    </section>

    <section class="section-block faq-wrapper">
      <div class="shell faq-shell">
        <FAQ :faqs="faqs" />
      </div>
    </section>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="4000">
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<script>
import FAQ from '@/components/FAQ.vue'
import OnboardingOrchestrator from '@/services/OnboardingOrchestrator'
import BillingPromotionService from '@/services/BillingPromotionService'
import { PLAN_DETAILS } from '@/constants/plans'
import { formatConvertedPriceFromBRL, resolvePricingCurrency } from '@/utils/pricing'
import { useUserStore } from '@/plugins/userStore'
import { parseApiError } from '@/utils/errorHandler'

export default {
  name: 'ChoosePlan',
  components: {
    FAQ,
  },
  data() {
    return {
      faqs: [
        { question: 'choosePlanFaq.q1', answer: 'choosePlanFaq.a1' },
        { question: 'choosePlanFaq.q2', answer: 'choosePlanFaq.a2' },
        { question: 'choosePlanFaq.q3', answer: 'choosePlanFaq.a3' },
        { question: 'choosePlanFaq.q4', answer: 'choosePlanFaq.a4' },
        { question: 'choosePlanFaq.q5', answer: 'choosePlanFaq.a5' },
        { question: 'faq.q1', answer: 'faq.a1' },
        { question: 'faq.q2', answer: 'faq.a2' },
        { question: 'faq.q3', answer: 'faq.a3' },
        { question: 'faq.q4', answer: 'faq.a4' },
        { question: 'faq.q5', answer: 'faq.a5' },
        { question: 'faq.q6', answer: 'faq.a6' },
        { question: 'faq.q7', answer: 'faq.a7' },
      ],
      selectedPlan: null,
      planDetails: PLAN_DETAILS,
      promotion: null,
      promotionLoading: false,
      snackbar: {
        show: false,
        message: '',
        color: 'error',
      },
      aiFeatures: [
        { icon: 'mdi-chart-box-outline', labelKey: 'choosePlan.ai_feature_1' },
        { icon: 'mdi-bell-alert-outline', labelKey: 'choosePlan.ai_feature_2' },
        { icon: 'mdi-piggy-bank-outline', labelKey: 'choosePlan.ai_feature_3' },
        { icon: 'mdi-tag-multiple-outline', labelKey: 'choosePlan.ai_feature_4' },
      ],
      freeFeatures: [
        { icon: 'mdi-briefcase-outline', labelKey: 'choosePlan.free_feature_1' },
        { icon: 'mdi-account-outline', labelKey: 'choosePlan.free_feature_2' },
        { icon: 'mdi-shape-outline', labelKey: 'choosePlan.free_feature_3' },
        { icon: 'mdi-chart-timeline-variant', labelKey: 'choosePlan.free_feature_4' },
        { icon: 'mdi-lightbulb-on-outline', labelKey: 'choosePlan.free_feature_5' },
      ],
      starterFeatures: [
        { icon: 'mdi-account-group-outline', labelKey: 'choosePlan.starter_feature_1' },
        { icon: 'mdi-view-dashboard-outline', labelKey: 'choosePlan.starter_feature_2' },
        { icon: 'mdi-calendar-range-outline', labelKey: 'choosePlan.starter_feature_3' },
        { icon: 'mdi-flag-checkered', labelKey: 'choosePlan.starter_feature_4' },
        { icon: 'mdi-chart-timeline-variant', labelKey: 'choosePlan.starter_feature_5' },
      ],
      teamFeatures: [
        { icon: 'mdi-account-multiple-outline', labelKey: 'choosePlan.team_feature_1' },
        { icon: 'mdi-brain', labelKey: 'choosePlan.team_feature_2' },
        { icon: 'mdi-source-branch', labelKey: 'choosePlan.team_feature_3' },
        { icon: 'mdi-finance', labelKey: 'choosePlan.team_feature_4' },
        { icon: 'mdi-handshake-outline', labelKey: 'choosePlan.team_feature_5' },
        { icon: 'mdi-forum-outline', labelKey: 'choosePlan.team_feature_6' },
      ],
    }
  },
  computed: {
    isAuthenticated() {
      try {
        const userStore = useUserStore()
        return userStore.isAuthenticated
      } catch (e) {
        return false
      }
    },
  },
  mounted() {
    const preselectedPlan = this.$route?.query?.plan
    if (typeof preselectedPlan === 'string' && preselectedPlan.trim()) {
      this.redirectToCheckout(preselectedPlan.trim())
      return
    }
    this.loadPromotion()
  },
  methods: {
    async loadPromotion() {
      try {
        this.promotionLoading = true
        const response = await BillingPromotionService.getCurrent(null, null)
        this.promotion = response.data || null
      } catch (error) {
        console.warn('No active promotion data available', error)
      } finally {
        this.promotionLoading = false
      }
    },
    async redirectToCheckout(plan) {
      try {
        this.selectedPlan = plan
        if (!this.isAuthenticated) {
          localStorage.setItem('selectedPlan', plan)
          const redirect = OnboardingOrchestrator.buildRedirectPath('/choose-plan', { plan })
          this.$router.push({
            name: 'login',
            query: {
              redirect,
            },
          })
          return
        }
        const userStore = useUserStore()
        const resolution = await OnboardingOrchestrator.resolvePostAuthRoute({
          router: this.$router,
          userStore,
          redirect: '/checkout',
          plan: String(plan),
        })

        await this.$router.push(resolution.route)
      } catch (error) {
        this.handleError(error)
      }
    },

    goToApp() {
      if (this.isAuthenticated) {
        this.$router.push({ name: 'dashboard' })
        return
      }
      this.$router.push({ name: 'login', query: { signup: 'true' } })
    },

    handleError(error) {
      console.error('Erro no processo de checkout:', error)
      const errorMessage = parseApiError(error, this.$t('choosePlan.error_continue_process'))

      if (this.$vuetify) {
        this.$vuetify.notify({
          type: 'error',
          text: errorMessage,
        })
      } else {
        this.snackbar = {
          show: true,
          message: errorMessage,
          color: 'error',
        }
      }
    },
    formatAmount(amount) {
      const browserLocale = typeof navigator !== 'undefined' ? navigator.language : null
      return formatConvertedPriceFromBRL({
        amountInBRL: amount,
        targetCurrency: resolvePricingCurrency({
          locale: this.$i18n?.locale,
          browserLocale,
        }),
        uiLocale: this.$i18n?.locale,
      })
    },
    formatPlanPrice(plan) {
      return `${this.formatAmount(plan.amount)} / ${this.$t(plan.billingPeriod === 'year' ? 'landingPage.plans.perYear' : 'landingPage.plans.perMonth')}`
    },
    annualOriginal(monthlyAmount) {
      return monthlyAmount * 12
    },
    discountPercent(monthlyAmount, annualAmount) {
      if (!monthlyAmount || !annualAmount) return '0%'
      const full = monthlyAmount * 12
      const pct = Math.round(((full - annualAmount) / full) * 100)
      return `${pct}%`
    },
  },
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&family=Source+Sans+3:wght@400;500;600;700&display=swap');

#choose-plan-page {
  --ink: #172033;
  --ink-soft: #536177;
  --line: rgba(23, 32, 51, 0.12);
  --brand: #b6551f;
  --brand-strong: #8e4318;
  --accent: #205f63;
  --accent-strong: #173f4b;
  --shadow: 0 16px 34px rgba(23, 32, 51, 0.08);
  --shadow-soft: 0 10px 22px rgba(23, 32, 51, 0.05);
  background:
    radial-gradient(circle at top left, rgba(32, 95, 99, 0.08), transparent 28%),
    radial-gradient(circle at 85% 10%, rgba(182, 85, 31, 0.08), transparent 20%),
    linear-gradient(180deg, #fbf8f2 0%, #f8f4ed 52%, #fdfaf5 100%);
  color: var(--ink);
  font-family: 'Source Sans 3', sans-serif;
  max-width: none !important;
  padding: 0 !important;
}

#choose-plan-page :deep(*) {
  box-sizing: border-box;
}

#choose-plan-page :deep(.v-icon) {
  color: inherit;
}

.shell {
  width: min(1180px, calc(100vw - 32px));
  margin: 0 auto;
}

.section-block {
  padding: 84px 0;
}

.plan-hero {
  padding: 72px 0 44px;
}

.promo-section {
  padding-top: 0;
}

.promo-banner {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 20px;
  align-items: center;
  padding: 24px 28px;
  border-radius: 24px;
  border: 1px solid rgba(32, 95, 99, 0.12);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(245, 240, 232, 0.95));
  box-shadow: var(--shadow-soft);
}

.promo-banner h2 {
  margin-top: 8px;
  margin-bottom: 8px;
}

.promo-banner p {
  max-width: 68ch;
}

.promo-stats {
  display: grid;
  gap: 6px;
  justify-items: end;
  min-width: 160px;
  padding: 16px 18px;
  border-radius: 18px;
  background: rgba(32, 95, 99, 0.08);
  color: var(--accent-strong);
  text-align: right;
}

.promo-stats strong {
  font-size: 1.7rem;
  line-height: 1;
}

.promo-stats span {
  color: var(--ink-soft);
  font-weight: 600;
}

.hero-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
  gap: 28px;
  align-items: start;
}

.eyebrow,
.section-kicker,
.summary-tag {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 8px 14px;
  font-family: 'Manrope', sans-serif;
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.eyebrow,
.section-kicker {
  background: rgba(32, 95, 99, 0.1);
  color: var(--accent-strong);
}

.summary-tag {
  background: rgba(32, 95, 99, 0.1);
  color: var(--accent-strong);
}

h1,
h2,
h3,
.price-amount,
.plan-tag,
.plan-ribbon,
.btn {
  font-family: 'Manrope', sans-serif;
}

h1 {
  margin: 16px 0 14px;
  font-size: clamp(2.5rem, 4.5vw, 4.4rem);
  line-height: 0.98;
  letter-spacing: -0.05em;
}

h2 {
  margin: 0 0 12px;
  font-size: clamp(1.9rem, 3vw, 3rem);
  line-height: 1.02;
  letter-spacing: -0.04em;
}

h3 {
  margin: 0;
  font-size: 1.3rem;
}

p {
  margin: 0;
  color: var(--ink-soft);
  font-size: 1.05rem;
  line-height: 1.65;
}

.hero-subtitle,
.section-heading p {
  max-width: 60ch;
  font-size: 1.18rem;
}

.hero-notes,
.trust-grid,
.plans-grid {
  display: grid;
  gap: 20px;
}

.hero-notes {
  margin-top: 28px;
}

.note-card,
.plan-card,
.trust-card,
.ai-summary-card,
.faq-shell {
  border-radius: 28px;
  border: 1px solid var(--line);
  box-shadow: var(--shadow-soft);
}

.note-card,
.trust-card {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 16px;
  padding: 22px;
  background: rgba(255, 255, 255, 0.88);
}

.hero-side {
  position: sticky;
  top: 24px;
}

.ai-summary-card {
  padding: 26px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.92) 0%, rgba(242, 236, 227, 0.82) 100%);
  color: var(--ink);
  box-shadow: var(--shadow-soft);
}

.ai-summary-card p,
.ai-summary-card span,
.ai-summary-card h2 {
  color: inherit;
}

.summary-head {
  display: grid;
  gap: 12px;
  margin-bottom: 22px;
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 14px;
}

.feature-list li {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 12px;
  align-items: start;
}

.feature-list-ai li {
  padding: 14px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(23, 32, 51, 0.08);
}

.plans-section {
  padding-top: 28px;
}

.section-heading {
  text-align: center;
  display: grid;
  justify-items: center;
  gap: 12px;
  margin-bottom: 34px;
}

.plans-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: stretch;
}

.plan-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 28px;
  background: #fff;
}

.plan-card.starter {
  background: linear-gradient(180deg, #fff 0%, #fcf5ec 100%);
}

.plan-card.free {
  background: linear-gradient(180deg, #fff 0%, #f7faf8 100%);
}

.plan-card.team {
  background: linear-gradient(180deg, #fbf7ef 0%, #f4ece2 100%);
  color: var(--ink);
  border-color: rgba(32, 95, 99, 0.14);
  box-shadow: var(--shadow);
}

.plan-card.team p,
.plan-card.team span,
.plan-card.team h3,
.plan-card.team li {
  color: inherit;
}

.plan-head {
  display: grid;
  gap: 10px;
}

.plan-tag {
  display: inline-flex;
  width: fit-content;
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.starter-tag {
  background: rgba(182, 85, 31, 0.12);
  color: var(--brand-strong);
}

.free-tag {
  background: rgba(32, 95, 99, 0.1);
  color: var(--accent-strong);
}

.team-tag {
  background: rgba(32, 95, 99, 0.12);
  color: var(--accent-strong);
}

.plan-ribbon {
  position: absolute;
  top: 18px;
  right: 18px;
  padding: 8px 12px;
  border-radius: 999px;
  background: #f2c76d;
  color: #3d2a10;
  font-size: 0.8rem;
  font-weight: 800;
}

.plan-subtitle {
  min-height: 52px;
}

.price-stack {
  display: grid;
  gap: 14px;
}

.price-row {
  display: grid;
  gap: 6px;
  padding: 14px 16px;
  border-radius: 18px;
  background: rgba(23, 32, 51, 0.04);
}

.price-row.annual {
  border: 1px dashed rgba(23, 32, 51, 0.12);
  background: rgba(255, 255, 255, 0.8);
}

.free-price {
  min-height: 118px;
  align-content: center;
}

.team-highlight,
.team-annual {
  background: rgba(255, 255, 255, 0.72);
  border-color: rgba(23, 32, 51, 0.1);
}

.price-label {
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.price-amount {
  font-size: 1.72rem;
  line-height: 1.1;
}

.price-strike,
.price-note {
  font-size: 0.88rem;
}

.price-strike {
  text-decoration: line-through;
}

.price-badge {
  display: inline-flex;
  width: fit-content;
  padding: 5px 10px;
  border-radius: 999px;
  background: rgba(34, 197, 94, 0.16);
  color: #11653a;
  font-size: 0.8rem;
  font-weight: 800;
}

.plan-card.team .price-badge {
  background: rgba(32, 95, 99, 0.12);
  color: var(--accent-strong);
}

.plan-cta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: auto;
}

.btn {
  min-height: 50px;
  padding: 0 18px;
  border-radius: 999px;
  border: 1px solid transparent;
  font-size: 0.95rem;
  font-weight: 800;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
}

.btn:hover {
  transform: translateY(-1px);
}

.btn-outline {
  background: transparent;
}

.btn-solid {
  color: #fff;
}

.starter-outline {
  border-color: rgba(182, 85, 31, 0.28);
  color: var(--brand-strong);
}

.free-outline {
  grid-column: 1 / -1;
  border-color: rgba(32, 95, 99, 0.22);
  color: var(--accent-strong);
}

.starter-solid {
  background: linear-gradient(135deg, var(--brand) 0%, #d16b31 100%);
}

.team-outline {
  border-color: rgba(32, 95, 99, 0.22);
  color: var(--accent-strong);
}

.team-solid {
  background: linear-gradient(135deg, #205f63 0%, #2d7b7d 100%);
  color: #fff;
}

.trust-section {
  padding-top: 0;
}

.trust-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.faq-wrapper {
  padding-top: 0;
}

.faq-shell {
  overflow: hidden;
  background: rgba(255, 255, 255, 0.82);
}

.icon-chip {
  width: 44px;
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  background: rgba(182, 85, 31, 0.1);
  color: var(--brand-strong);
}

.icon-chip-small {
  width: 34px;
  height: 34px;
  border-radius: 12px;
}

.icon-chip-dark {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
}

.icon-chip-warm {
  background: rgba(217, 141, 44, 0.14);
  color: #8c4f10;
}

.icon-chip-contrast {
  background: rgba(32, 95, 99, 0.12);
  color: var(--accent-strong);
}

@media (max-width: 1080px) {
  .hero-grid,
  .plans-grid,
  .trust-grid {
    grid-template-columns: 1fr;
  }

  .hero-side {
    position: static;
  }
}

@media (max-width: 760px) {
  .shell {
    width: min(100vw - 24px, 100%);
  }

  .plan-hero,
  .section-block {
    padding: 68px 0;
  }

  h1 {
    font-size: clamp(2.2rem, 12vw, 3.2rem);
  }

  h2 {
    font-size: clamp(1.8rem, 9vw, 2.5rem);
  }

  .plan-card,
  .note-card,
  .trust-card,
  .ai-summary-card {
    border-radius: 22px;
    padding: 20px;
  }

  .plan-cta {
    grid-template-columns: 1fr;
  }

  .promo-banner {
    grid-template-columns: 1fr;
    padding: 20px;
  }

  .promo-stats {
    justify-items: start;
    text-align: left;
    min-width: 0;
  }
}
</style>
