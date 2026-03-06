// src/views/ChoosePlan.vue
<template>
    <v-container id="color-setup">
        <!-- Seção de Planos -->
                <section id="plans" class="section plans-section">
                        <h2>Escolha o nível de inteligência financeira que você precisa.</h2>
                        <p style="text-align:center; max-width:600px; margin:16px auto 32px; color:var(--dark-gray); font-size:18px;">
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

                                                <div class="plans-container">
                                <!-- Planos Individuais -->
                                <div class="plan-item individual-plan" style="border-top: 4px solid #f39c12;">
                                    <span class="plan-label" style="background:#f39c12; color:#fff; padding:2px 10px; border-radius:6px; font-size:13px; font-weight:600; margin-bottom:8px; display:inline-block;">Individual</span>
                                    <h3>Plano Mensal</h3>
                                    <p class="price">{{ planDetails.MONTHLY.displayPrice }}</p>
                                    <p>Comece com a nossa plataforma gratuitamente e, após 30 dias, continue com o plano mensal.</p>
                                    <ul class="plan-benefits">
                                        <li>Orçamento compartilhado</li>
                                        <li>Metas financeiras</li>
                                        <li>Simulação de cenários</li>
                                        <li>IA Financial Copilot <span style="color:var(--purple); font-weight:600;">(planos Premium)</span></li>
                                    </ul>
                                    <button class="btn btn-primary cta-btn" @click.prevent="redirectToCheckout('MONTHLY')">
                                        Assine Mensalmente
                                    </button>
                                </div>
                                <div class="plan-item individual-plan" style="border-top: 4px solid #f39c12;">
                                    <span class="plan-label" style="background:#f39c12; color:#fff; padding:2px 10px; border-radius:6px; font-size:13px; font-weight:600; margin-bottom:8px; display:inline-block;">Individual</span>
                                    <h3>Plano Anual</h3>
                                    <p class="price">{{ planDetails.ANNUAL.displayPrice }}</p>
                                    <p>Aproveite o plano anual com um desconto especial.</p>
                                    <ul class="plan-benefits">
                                        <li>Orçamento compartilhado</li>
                                        <li>Metas financeiras</li>
                                        <li>Simulação de cenários</li>
                                        <li>IA Financial Copilot <span style="color:var(--purple); font-weight:600;">(planos Premium)</span></li>
                                    </ul>
                                    <button class="btn btn-primary cta-btn" @click.prevent="redirectToCheckout('ANNUAL')">
                                        Assine Anualmente
                                    </button>
                                </div>
                                <!-- Planos Empresariais -->
                                <div class="plan-item business-plan" style="border-top: 4px solid var(--purple); background: #f7f3fa;">
                                    <span class="plan-label" style="background:var(--purple); color:#fff; padding:2px 10px; border-radius:6px; font-size:13px; font-weight:600; margin-bottom:8px; display:inline-block;">Empresarial</span>
                                    <h3>Plano Empresarial Mensal</h3>
                                    <p class="price" style="color:var(--purple); font-weight:700;">{{ planDetails.BUSINESS_MONTHLY.displayPrice }}</p>
                                    <p>Ideal para empresas que buscam flexibilidade mensal.</p>
                                    <ul class="plan-benefits">
                                        <li>Gestão multiusuário</li>
                                        <li>Relatórios avançados</li>
                                        <li>Simulação estratégica</li>
                                        <li><span style="color:var(--purple); font-weight:600;">IA Financial Copilot avançada</span></li>
                                        <li>Suporte prioritário</li>
                                    </ul>
                                    <button class="btn btn-primary cta-btn" style="background:var(--purple); border:none;" @click.prevent="handleBusinessClick('BUSINESS_MONTHLY')">
                                        Assinar Empresarial Mensal
                                    </button>
                                </div>
                                <div class="plan-item business-plan" style="border-top: 4px solid var(--purple); background: #f7f3fa;">
                                    <span class="plan-label" style="background:var(--purple); color:#fff; padding:2px 10px; border-radius:6px; font-size:13px; font-weight:600; margin-bottom:8px; display:inline-block;">Empresarial</span>
                                    <h3>Plano Empresarial Anual</h3>
                                    <p class="price" style="color:var(--purple); font-weight:700;">{{ planDetails.BUSINESS_ANNUAL.displayPrice }}</p>
                                    <p>Economize com o plano anual para sua empresa.</p>
                                    <ul class="plan-benefits">
                                        <li>Gestão multiusuário</li>
                                        <li>Relatórios avançados</li>
                                        <li>Simulação estratégica</li>
                                        <li><span style="color:var(--purple); font-weight:600;">IA Financial Copilot avançada</span></li>
                                        <li>Suporte prioritário</li>
                                    </ul>
                                    <button class="btn btn-primary cta-btn" style="background:var(--purple); border:none;" @click.prevent="handleBusinessClick('BUSINESS_ANNUAL')">
                                        Assinar Empresarial Anual
                                    </button>
                                </div>
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
import { getOrCreateCorrelationId } from '@/utils/correlation'
import { PLAN_DETAILS } from '@/constants/plans';
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
                    this.$router.push({
                        name: 'login',
                        query: {
                            redirect: '/choose-plan',
                            plan: plan
                        }
                    });
                    return;
                }
                await this.processCheckout(plan);
            } catch (error) {
                this.handleError(error);
            }
        },

        handleBusinessClick(plan) {
            const userStore = useUserStore()
            if (!this.isAuthenticated) {
                alert('Faça login para contratar um plano empresarial.');
                this.$router.push({ name: 'login', query: { redirect: '/choose-plan', plan } })
                return
            }
            if (!userStore.currentCompanyId) {
                alert('Selecione ou crie uma empresa antes de contratar um plano empresarial.');
                this.$router.push({ name: 'select-company', query: { redirect: '/choose-plan', plan } })
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

                const correlationId = getOrCreateCorrelationId('billingCorrelationId')

                const isBusinessPlan = String(plan).startsWith('BUSINESS_');
                const companyId = userStore.currentCompanyId;
                if (isBusinessPlan && !companyId) {
                    throw new Error('Selecione uma empresa para contratar um plano BUSINESS.');
                }

                // IMPORTANT (ADR-001/004): FE must NOT call payment-api and must NOT send PII.
                // Decide subject based on plan + tenant context.
                const subjectType = (isBusinessPlan && userStore.isTenantMode && companyId) ? 'COMPANY' : 'USER'
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

.plans-container {
    display: flex;
    justify-content: center;
    gap: 20px;
    flex-wrap: wrap;
}

.plan-item {
    width: 45%;
    background-color: var(--light-gray);
    padding: 20px;
    border-radius: 10px;
    text-align: center;
}

.plan-item h3 {
    font-size: 24px;
    color: var(--dark-gray);
}

.plan-item .price {
    font-size: 32px;
    color: var(--orange);
    margin: 10px 0;
}

.plan-item p {
    font-size: 16px;
    color: var(--dark-gray);
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
}

.cta-btn {
    background-color: var(--orange);
    color: var(--white);
    padding: 12px 24px;
    border-radius: 5px;
    margin-top: 20px;
}

.cta-btn:hover {
    background-color: var(--dark-orange);
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
