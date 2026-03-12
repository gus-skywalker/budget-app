// src/views/ChoosePlan.vue
<template>
    <v-container id="color-setup">
        <!-- Seção de Planos -->
                        <section id="plans" class="section plans-section">
                                <h2>Escolha o plano ideal para o seu time.</h2>
                                <p class="plans-subtitle">
                                    Comece organizando suas finanças e evolua para decisões assistidas por inteligência artificial.
                                </p>

                        <section class="section ai-value" style="background: #f7f7ff; border-radius: 12px; padding: 24px 16px; margin-bottom: 32px;">
                            <h3 style="text-align:center; color:var(--purple); margin-bottom:8px;">IA Financial Copilot incluída nos planos Premium</h3>
                            <p style="text-align:center; max-width:600px; margin:0 auto 0; color:var(--dark-gray); font-size:16px;">
                                O CoBudget Premium desbloqueia recursos avançados de inteligência financeira:<br>
                                <span style="display:block; margin-top:12px; text-align:left; max-width:400px; margin-left:auto; margin-right:auto;">
                                    • Previsão de despesas futuras<br>
                                    • Detecção automática de gastos anormais<br>
                                    • Recomendações inteligentes de economia<br>
                                    • Categorização automática de transações
                                </span>
                            </p>
                        </section>

                                                <div class="plans-grid">
                                <!-- Plano STARTER -->
                                <article class="plan-card starter">
                                    <div class="plan-head">
                                        <span class="plan-tag starter-tag">Starter</span>
                                        <h3>Starter</h3>
                                        <p class="plan-subtitle">Para pequenos times começando o planejamento financeiro colaborativo.</p>
                                    </div>

                                    <div class="price-stack">
                                        <div class="price-row">
                                            <span class="price-label">Mensal</span>
                                            <span class="price-amount">{{ planDetails.MONTHLY.displayPrice }}</span>
                                        </div>
                                        <div class="price-row annual">
                                            <span class="price-label">Anual</span>
                                            <span class="price-strike">De {{ formatAmount(annualOriginal(planDetails.MONTHLY.amount)) }}</span>
                                            <span class="price-amount">{{ planDetails.ANNUAL.displayPrice }}</span>
                                            <span class="price-badge">Economize {{ discountPercent(planDetails.MONTHLY.amount, planDetails.ANNUAL.amount) }}</span>
                                            <span class="price-note">Equivale a {{ formatAmount(planDetails.ANNUAL.amount / 12) }}/mês</span>
                                        </div>
                                    </div>

                                    <ul class="plan-benefits">
                                        <li><span class="check">✓</span> até 4 membros</li>
                                        <li><span class="check">✓</span> workspace financeiro compartilhado</li>
                                        <li><span class="check">✓</span> planejamento de orçamento</li>
                                        <li><span class="check">✓</span> metas financeiras</li>
                                        <li><span class="check">✓</span> simulação básica de cenários</li>
                                    </ul>

                                    <div class="plan-cta">
                                        <button class="btn btn-outline starter-outline" @click.prevent="redirectToCheckout('MONTHLY')">
                                            Mensal
                                        </button>
                                        <button class="btn btn-solid starter-solid" @click.prevent="redirectToCheckout('ANNUAL')">
                                            Anual -20%
                                        </button>
                                    </div>
                                </article>

                                <!-- Plano TEAM -->
                                <article class="plan-card team">
                                    <div class="plan-ribbon">Melhor oferta</div>
                                    <div class="plan-head">
                                        <span class="plan-tag team-tag">Team</span>
                                        <h3>Team</h3>
                                        <p class="plan-subtitle">Para startups que precisam tomar decisões financeiras com mais inteligência.</p>
                                    </div>

                                    <div class="price-stack">
                                        <div class="price-row">
                                            <span class="price-label">Mensal</span>
                                            <span class="price-amount">{{ planDetails.BUSINESS_MONTHLY.displayPrice }}</span>
                                        </div>
                                        <div class="price-row annual">
                                            <span class="price-label">Anual</span>
                                            <span class="price-strike">De {{ formatAmount(annualOriginal(planDetails.BUSINESS_MONTHLY.amount)) }}</span>
                                            <span class="price-amount">{{ planDetails.BUSINESS_ANNUAL.displayPrice }}</span>
                                            <span class="price-badge">Economize {{ discountPercent(planDetails.BUSINESS_MONTHLY.amount, planDetails.BUSINESS_ANNUAL.amount) }}</span>
                                            <span class="price-note">Equivale a {{ formatAmount(planDetails.BUSINESS_ANNUAL.amount / 12) }}/mês</span>
                                        </div>
                                    </div>

                                    <ul class="plan-benefits">
                                        <li><span class="check">✓</span> até 10 membros</li>
                                        <li><span class="check">✓</span> IA Financial Copilot</li>
                                        <li><span class="check">✓</span> simulação de cenários</li>
                                        <li><span class="check">✓</span> previsão financeira</li>
                                        <li><span class="check">✓</span> decisões financeiras colaborativas</li>
                                        <li><span class="check">✓</span> colaboração entre membros</li>
                                    </ul>

                                    <div class="plan-cta">
                                        <button class="btn btn-outline team-outline" @click.prevent="handleTeamClick('BUSINESS_MONTHLY')">
                                            Mensal
                                        </button>
                                        <button class="btn btn-solid team-solid" @click.prevent="handleTeamClick('BUSINESS_ANNUAL')">
                                            Anual -20%
                                        </button>
                                    </div>
                                </article>
                        </div>
        </section>

        <!-- FAQ reutilizável -->
        <FAQ :faqs="faqs" />

        <!-- Política de Cancelamento -->
        <section class="section cancellation-policy">
            <h2>Política de Cancelamento</h2>
            <p>
                Cancelar sua assinatura é simples. Durante o período de avaliação, você pode cancelar sem custos.
                Após a cobrança, você pode cancelar para evitar futuras renovações, mas o valor pago não será
                reembolsado.
            </p>
        </section>

        <!-- Segurança no Pagamento -->
        <section class="section payment-security">
            <h2>Segurança e Privacidade no Pagamento</h2>
            <p>
                Seus pagamentos são processados com segurança através do Stripe. Não armazenamos suas informações de
                pagamento e garantimos uma experiência segura com a mais alta tecnologia de criptografia.
            </p>
        </section>
    </v-container>
</template>

<script>
import FAQ from '@/components/FAQ.vue';
import BillingDecisionService from '@/services/BillingDecisionService'
import OnboardingOrchestrator from '@/services/OnboardingOrchestrator'
import { createCorrelationId } from '@/utils/correlation'
import { PLAN_DETAILS, formatPlanAmount } from '@/constants/plans';
import { useUserStore } from '@/plugins/userStore';

export default {
    name: "ChoosePlan",
    components: {
        FAQ,
    },
    data() {
        return {
            faqs: [
                {
                    question: "Como funciona o período de avaliação gratuita?",
                    answer: "O período de avaliação é de 30 dias, durante o qual você pode acessar todos os recursos da plataforma sem custo. Ao final, você poderá escolher um plano de assinatura para continuar.",
                },
                {
                    question: "Posso cancelar a assinatura antes do fim da avaliação?",
                    answer: "Sim, você pode cancelar a qualquer momento durante o período de avaliação sem custos.",
                },
                {
                    question: "O que acontece se eu não escolher um plano após a avaliação gratuita?",
                    answer: "Se você não escolher um plano ao final da avaliação gratuita, seu acesso aos recursos premium será suspenso. Você poderá continuar com o plano gratuito ou optar por um plano pago a qualquer momento.",
                },
                {
                    question: "Como posso mudar meu plano depois de escolher?",
                    answer: "Você pode atualizar ou reduzir seu plano a qualquer momento através da página de configurações da sua conta.",
                },
                {
                    question: "Meu pagamento é seguro?",
                    answer: "Sim, todos os pagamentos são processados com segurança através do Stripe, utilizando criptografia de última geração.",
                },
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
                alert('Faça login para contratar um plano TEAM.');
                const redirect = OnboardingOrchestrator.buildRedirectPath('/choose-plan', { plan })
                this.$router.push({ name: 'login', query: { redirect } })
                return
            }
            if (!userStore.currentCompanyId) {
                alert('Selecione ou crie uma empresa antes de contratar um plano TEAM.');
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
                    throw new Error('Usuário não autenticado');
                }

                const correlationId = createCorrelationId()

                const isTeamPlan = String(plan).startsWith('BUSINESS_');
                const companyId = userStore.currentCompanyId;
                if (isTeamPlan && !companyId) {
                    throw new Error('Selecione uma empresa para contratar um plano TEAM.');
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
                    throw new Error('Ação de billing inesperada');
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
                               'Não foi possível continuar com o processo';
            
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
            return formatPlanAmount(amount);
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
