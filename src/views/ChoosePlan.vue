// src/views/ChoosePlan.vue
<template>
    <v-container id="color-setup">
        <!-- Seção de Planos -->
                        <section id="plans" class="section plans-section">
                                <h2>{{ $t('choosePlan.title') }}</h2>
                                <p class="plans-subtitle">
                                    {{ $t('choosePlan.subtitle') }}
                                </p>

                        <section class="section ai-value" style="background: #f7f7ff; border-radius: 12px; padding: 24px 16px; margin-bottom: 32px;">
                            <h3 style="text-align:center; color:var(--purple); margin-bottom:8px;">{{ $t('choosePlan.ai_title') }}</h3>
                            <p style="text-align:center; max-width:600px; margin:0 auto 0; color:var(--dark-gray); font-size:16px;">
                                {{ $t('choosePlan.ai_desc') }}<br>
                                <span style="display:block; margin-top:12px; text-align:left; max-width:400px; margin-left:auto; margin-right:auto;">
                                    • {{ $t('choosePlan.ai_feature_1') }}<br>
                                    • {{ $t('choosePlan.ai_feature_2') }}<br>
                                    • {{ $t('choosePlan.ai_feature_3') }}<br>
                                    • {{ $t('choosePlan.ai_feature_4') }}
                                </span>
                            </p>
                        </section>

                                                <div class="plans-grid">
                                <!-- Plano STARTER -->
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

                                    <ul class="plan-benefits">
                                        <li><span class="check">✓</span> {{ $t('choosePlan.starter_feature_1') }}</li>
                                        <li><span class="check">✓</span> {{ $t('choosePlan.starter_feature_2') }}</li>
                                        <li><span class="check">✓</span> {{ $t('choosePlan.starter_feature_3') }}</li>
                                        <li><span class="check">✓</span> {{ $t('choosePlan.starter_feature_4') }}</li>
                                        <li><span class="check">✓</span> {{ $t('choosePlan.starter_feature_5') }}</li>
                                    </ul>

                                    <div class="plan-cta">
                                        <button class="btn btn-outline starter-outline" @click.prevent="redirectToCheckout('MONTHLY')">
                                            {{ $t('choosePlan.monthly_short') }}
                                        </button>
                                        <button class="btn btn-solid starter-solid" @click.prevent="redirectToCheckout('ANNUAL')">
                                            {{ $t('choosePlan.annual_short_discount') }}
                                        </button>
                                    </div>
                                </article>

                                <!-- Plano TEAM -->
                                <article class="plan-card team">
                                    <div class="plan-ribbon">{{ $t('choosePlan.best_offer') }}</div>
                                    <div class="plan-head">
                                        <span class="plan-tag team-tag">{{ $t('choosePlan.team_tag') }}</span>
                                        <h3>{{ $t('choosePlan.team_name') }}</h3>
                                        <p class="plan-subtitle">{{ $t('choosePlan.team_subtitle') }}</p>
                                    </div>

                                    <div class="price-stack">
                                        <div class="price-row">
                                            <span class="price-label">{{ $t('choosePlan.monthly_label') }}</span>
                                            <span class="price-amount">{{ formatPlanPrice(planDetails.BUSINESS_MONTHLY) }}</span>
                                        </div>
                                        <div class="price-row annual">
                                            <span class="price-label">{{ $t('choosePlan.annual_label') }}</span>
                                            <span class="price-strike">{{ $t('choosePlan.from_price', { amount: formatAmount(annualOriginal(planDetails.BUSINESS_MONTHLY.amount)) }) }}</span>
                                            <span class="price-amount">{{ formatPlanPrice(planDetails.BUSINESS_ANNUAL) }}</span>
                                            <span class="price-badge">{{ $t('choosePlan.save_percent', { percent: discountPercent(planDetails.BUSINESS_MONTHLY.amount, planDetails.BUSINESS_ANNUAL.amount) }) }}</span>
                                            <span class="price-note">{{ $t('choosePlan.equals_month', { amount: formatAmount(planDetails.BUSINESS_ANNUAL.amount / 12) }) }}</span>
                                        </div>
                                    </div>

                                    <ul class="plan-benefits">
                                        <li><span class="check">✓</span> {{ $t('choosePlan.team_feature_1') }}</li>
                                        <li><span class="check">✓</span> {{ $t('choosePlan.team_feature_2') }}</li>
                                        <li><span class="check">✓</span> {{ $t('choosePlan.team_feature_3') }}</li>
                                        <li><span class="check">✓</span> {{ $t('choosePlan.team_feature_4') }}</li>
                                        <li><span class="check">✓</span> {{ $t('choosePlan.team_feature_5') }}</li>
                                        <li><span class="check">✓</span> {{ $t('choosePlan.team_feature_6') }}</li>
                                    </ul>

                                    <div class="plan-cta">
                                        <button class="btn btn-outline team-outline" @click.prevent="handleTeamClick('BUSINESS_MONTHLY')">
                                            {{ $t('choosePlan.monthly_short') }}
                                        </button>
                                        <button class="btn btn-solid team-solid" @click.prevent="handleTeamClick('BUSINESS_ANNUAL')">
                                            {{ $t('choosePlan.annual_short_discount') }}
                                        </button>
                                    </div>
                                </article>
                        </div>
        </section>

        <!-- FAQ reutilizável -->
        <FAQ :faqs="faqs" />

        <!-- Política de Cancelamento -->
        <section class="section cancellation-policy">
            <h2>{{ $t('choosePlan.cancellation_title') }}</h2>
            <p>
                {{ $t('choosePlan.cancellation_text') }}
            </p>
        </section>

        <!-- Segurança no Pagamento -->
        <section class="section payment-security">
            <h2>{{ $t('choosePlan.payment_security_title') }}</h2>
            <p>
                {{ $t('choosePlan.payment_security_text') }}
            </p>
        </section>
    </v-container>
</template>

<script>
import FAQ from '@/components/FAQ.vue';
import BillingDecisionService from '@/services/BillingDecisionService'
import OnboardingOrchestrator from '@/services/OnboardingOrchestrator'
import { createCorrelationId } from '@/utils/correlation'
import { PLAN_DETAILS } from '@/constants/plans';
import { formatConvertedPriceFromBRL, resolvePricingCurrency } from '@/utils/pricing'
import { useUserStore } from '@/plugins/userStore';

export default {
    name: "ChoosePlan",
    components: {
        FAQ,
    },
    data() {
        return {
            faqs: [
                // Perguntas específicas do ChoosePlan
                { question: 'choosePlanFaq.q1', answer: 'choosePlanFaq.a1' },
                { question: 'choosePlanFaq.q2', answer: 'choosePlanFaq.a2' },
                { question: 'choosePlanFaq.q3', answer: 'choosePlanFaq.a3' },
                { question: 'choosePlanFaq.q4', answer: 'choosePlanFaq.a4' },
                { question: 'choosePlanFaq.q5', answer: 'choosePlanFaq.a5' },
                // Perguntas gerais do sistema
                { question: 'faq.q1', answer: 'faq.a1' },
                { question: 'faq.q2', answer: 'faq.a2' },
                { question: 'faq.q3', answer: 'faq.a3' },
                { question: 'faq.q4', answer: 'faq.a4' },
            ],
            selectedPlan: null,
            planDetails: PLAN_DETAILS,
            isTenantMode: false,
        };
    },
    computed: {
        isAuthenticated() {
            try {
                const userStore = useUserStore();
                return userStore.isAuthenticated;
            } catch (e) {
                return false;
            }
        }
    },
    mounted() {
        // Detecta modo tenant via Pinia
        try {
            const userStore = useUserStore()
            this.isTenantMode = userStore.isTenantMode
            const preselectedPlan = this.$route?.query?.plan
            if (typeof preselectedPlan === 'string' && preselectedPlan.trim()) {
                this.redirectToCheckout(preselectedPlan.trim())
            }
        } catch (e) {
            this.isTenantMode = false
        }
    },
    methods: {
        async redirectToCheckout(plan) {
            try {
                this.selectedPlan = plan;
                if (!this.isAuthenticated) {
                    localStorage.setItem('selectedPlan', plan);
                    const redirect = OnboardingOrchestrator.buildRedirectPath('/choose-plan', { plan })
                    this.$router.push({
                        name: 'login',
                        query: {
                            redirect
                        }
                    });
                    return;
                }
                await this.processCheckout(plan);
            } catch (error) {
                this.handleError(error);
            }
        },

        handleTeamClick(plan) {
            const userStore = useUserStore()
            if (!this.isAuthenticated) {
                alert(this.$t('choosePlan.error_login_team'));
                const redirect = OnboardingOrchestrator.buildRedirectPath('/choose-plan', { plan })
                this.$router.push({ name: 'login', query: { redirect } })
                return
            }
            if (!userStore.currentCompanyId) {
                alert(this.$t('choosePlan.error_select_company_team'));
                const redirect = OnboardingOrchestrator.buildRedirectPath('/choose-plan', { plan })
                this.$router.push({ name: 'select-company', query: { redirect } })
                return;
            }
            this.redirectToCheckout(plan);
        },

        async processCheckout(plan) {
            try {
                const userStore = useUserStore();
                const user = userStore.user;

                if (!user?.id) {
                    throw new Error(this.$t('choosePlan.error_user_not_authenticated'));
                }

                const correlationId = createCorrelationId()

                const isTeamPlan = String(plan).startsWith('BUSINESS_');
                const companyId = userStore.currentCompanyId;
                if (isTeamPlan && !companyId) {
                    throw new Error(this.$t('choosePlan.error_select_company_team'));
                }

                // IMPORTANT (ADR-001/004): FE must NOT call payment-api and must NOT send PII.
                // Decide subject based on plan + tenant context.
                const subjectType = (isTeamPlan && userStore.isTenantMode && companyId) ? 'COMPANY' : 'USER'
                const subjectId = subjectType === 'COMPANY' ? String(companyId) : String(user.id)

                const decisionResp = await BillingDecisionService.decide(
                    {
                        plan: String(plan),
                        actor: String(user.id),
                        subjectType,
                        subjectId,
                        // backward compatible fields
                        userId: subjectType === 'USER' ? String(user.id) : null,
                        companyId: subjectType === 'COMPANY' ? String(companyId) : null
                    },
                    correlationId
                )

                const decision = decisionResp.data

                if (decision.action === 'NOOP_ALREADY_PREMIUM') {
                    this.$router.push({ name: 'dashboard' })
                    return
                }

                if (decision.action !== 'START_SUBSCRIPTION') {
                    throw new Error(this.$t('choosePlan.error_unexpected_billing_action'));
                }

                this.$router.push({
                    name: 'checkout',
                    query: {
                        plan: String(plan),
                        subjectType: decision.subjectType,
                        subjectId: decision.subjectId,
                        correlationId: decision.correlationId || correlationId
                    }
                })
            } catch (error) {
                this.handleError(error);
            }
        },

        handleError(error) {
            console.error("Erro no processo de checkout:", error);
            const errorMessage = error.response?.data?.error || 
                               error.message || 
                               this.$t('choosePlan.error_continue_process');
            
            if (this.$vuetify) {
                this.$vuetify.notify({
                    type: 'error',
                    text: errorMessage
                });
            } else {
                alert(errorMessage);
            }
        },
        formatAmount(amount) {
            const browserLocale = typeof navigator !== 'undefined' ? navigator.language : null
            return formatConvertedPriceFromBRL({
                amountInBRL: amount,
                targetCurrency: resolvePricingCurrency({
                    locale: this.$i18n?.locale,
                    browserLocale
                }),
                uiLocale: this.$i18n?.locale
            })
        },
        formatPlanPrice(plan) {
            return `${this.formatAmount(plan.amount)} / ${this.$t(plan.billingPeriod === 'year' ? 'landingPage.plans.perYear' : 'landingPage.plans.perMonth')}`
        },
        annualOriginal(monthlyAmount) {
            return monthlyAmount * 12;
        },
        discountPercent(monthlyAmount, annualAmount) {
            if (!monthlyAmount || !annualAmount) return '0%';
            const full = monthlyAmount * 12;
            const pct = Math.round(((full - annualAmount) / full) * 100);
            return `${pct}%`;
        }
    },
};
</script>

<style scoped>
#color-setup {
    --orange: #f39c12;
    --dark-orange: #e67e22;
    --yellow: #f1c40f;
    --purple: #8e44ad;
    --dark-purple: #5b2c6f;
    --white: #ffffff;
    --light-gray: #f8f9f9;
    --dark-gray: #2c3e50;
}

/* Estilos para a seção de planos */
.plans-section {
    background-color: var(--white);
    padding: 60px 40px;
    text-align: center;
}

.plans-subtitle {
    text-align: center;
    max-width: 600px;
    margin: 16px auto 32px;
    color: var(--dark-gray);
    font-size: 18px;
}

.plans-grid {
    display: flex;
    justify-content: center;
    gap: 20px;
    flex-wrap: wrap;
}

.plan-card {
    width: min(520px, 100%);
    background-color: #ffffff;
    padding: 28px 24px;
    border-radius: 16px;
    text-align: left;
    border: 1px solid rgba(0, 0, 0, 0.06);
    box-shadow: 0 8px 28px rgba(15, 23, 42, 0.06);
    position: relative;
}

.plan-card.team {
    border: 2px solid rgba(142, 68, 173, 0.35);
    background: linear-gradient(180deg, #f8f4ff 0%, #ffffff 80%);
}

.plan-head h3 {
    font-size: 28px;
    color: var(--dark-gray);
    margin: 8px 0 6px;
}

.plan-subtitle {
    font-size: 15px;
    color: #54616f;
}

.plan-tag {
    display: inline-flex;
    align-items: center;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 6px 10px;
    border-radius: 8px;
}

.starter-tag {
    background: rgba(243, 156, 18, 0.15);
    color: #b06a0c;
}

.team-tag {
    background: rgba(142, 68, 173, 0.15);
    color: #5b2c6f;
}

.plan-ribbon {
    position: absolute;
    top: -16px;
    right: 20px;
    background: var(--yellow);
    color: var(--dark-purple);
    padding: 6px 14px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 700;
    box-shadow: 0 6px 16px rgba(241, 196, 15, 0.25);
}

.price-stack {
    margin: 18px 0 20px;
    display: grid;
    gap: 14px;
}

.price-row {
    display: grid;
    gap: 6px;
    padding: 12px 14px;
    border-radius: 12px;
    background: #f7f8fb;
}

.price-row.annual {
    background: #ffffff;
    border: 1px dashed rgba(0, 0, 0, 0.08);
}

.price-label {
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #7b8794;
}

.price-amount {
    font-size: 26px;
    font-weight: 700;
    color: var(--dark-gray);
}

.price-strike {
    font-size: 13px;
    color: #9aa5b1;
    text-decoration: line-through;
}

.price-badge {
    display: inline-flex;
    width: fit-content;
    padding: 4px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 700;
    color: #0f6b3f;
    background: rgba(34, 197, 94, 0.16);
}

.price-note {
    font-size: 12px;
    color: #7b8794;
}

.plan-benefits {
    list-style-type: none;
    padding: 0;
    margin: 20px 0;
    color: var(--dark-gray);
    font-size: 14px;
}

.plan-benefits li {
    margin: 5px 0;
    display: flex;
    align-items: flex-start;
    gap: 8px;
}

.check {
    color: #22c55e;
    font-weight: 700;
}

.plan-cta {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 12px;
    margin-top: 16px;
}

.btn {
    padding: 12px 18px;
    border-radius: 10px;
    font-weight: 700;
    border: 2px solid transparent;
    cursor: pointer;
}

.btn-outline {
    background: transparent;
}

.btn-solid {
    color: #ffffff;
}

.starter-outline {
    border-color: #f39c12;
    color: #b06a0c;
}

.starter-solid {
    background: #f39c12;
}

.team-outline {
    border-color: var(--purple);
    color: var(--purple);
}

.team-solid {
    background: var(--purple);
}

.btn-solid:hover,
.btn-outline:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 18px rgba(15, 23, 42, 0.12);
}

/* Estilos das Informações de Avaliação, FAQ e Cancelamento */
.trial-info,
.faq-section,
.cancellation-policy,
.payment-security {
    padding: 40px 20px;
    background-color: var(--white);
    text-align: center;
}

.trial-info h2,
.faq-section h2,
.cancellation-policy h2,
.payment-security h2 {
    color: var(--dark-gray);
    font-size: 28px;
    margin-bottom: 20px;
}

.trial-info p,
.faq-section p,
.cancellation-policy p,
.payment-security p {
    color: var(--dark-gray);
    font-size: 16px;
    line-height: 1.6;
}

/* FAQ Item */
.faq-item {
    margin-bottom: 20px;
    text-align: left;
    max-width: 800px;
    margin: 0 auto;
}

.faq-item h3 {
    color: var(--dark-gray);
    font-size: 20px;
    margin-bottom: 5px;
}

.faq-item p {
    font-size: 16px;
    color: var(--dark-gray);
}
</style>
