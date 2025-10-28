// src/views/ChoosePlan.vue
<template>
    <v-container id="color-setup">
        <!-- Seção de Planos -->
        <section id="plans" class="section plans-section">
            <h2>Escolha o Seu Plano</h2>
            <div class="plans-container">
                <!-- Plano Mensal -->
                <div class="plan-item">
                    <h3>Plano Mensal</h3>
                    <p class="price">R$ 29,00 / mês</p>
                    <p>Comece com a nossa plataforma gratuitamente e, após 30 dias, continue com o plano mensal.</p>
                    <ul class="plan-benefits">
                        <li>Acesso ilimitado aos recursos</li>
                        <li>Suporte ao cliente padrão</li>
                        <li>Atualizações mensais</li>
                    </ul>
                    <button class="btn btn-primary cta-btn" @click.prevent="redirectToCheckout('MONTHLY')">
                        Assine Mensalmente
                    </button>
                </div>

                <!-- Plano Anual -->
                <div class="plan-item">
                    <h3>Plano Anual</h3>
                    <p class="price">R$ 299,00 / ano</p>
                    <p>Aproveite o plano anual com um desconto especial.</p>
                    <ul class="plan-benefits">
                        <li>Acesso ilimitado aos recursos</li>
                        <li>Suporte premium ao cliente</li>
                        <li>Economia de R$ 49,00 por ano</li>
                        <li>Atualizações mensais e melhorias exclusivas</li>
                    </ul>
                    <button class="btn btn-primary cta-btn" @click.prevent="redirectToCheckout('ANNUAL')">
                        Assine Anualmente
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
import PaymentService from '@/services/PaymentService'

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
            selectedPlan: null
        };
    },
    computed: {
        isAuthenticated() {
            return this.$store?.state?.auth?.user != null;
        }
    },
    methods: {
        async redirectToCheckout(plan) {
            try {
                this.selectedPlan = plan;
                
                if (!this.isAuthenticated) {
                    // Salva o plano selecionado no localStorage
                    localStorage.setItem('selectedPlan', plan);
                    // Redireciona para login com query param
                    this.$router.push({
                        name: 'login',
                        query: { 
                            redirect: '/choose-plan',
                            plan: plan
                        }
                    });
                    return;
                }

                // Se já está autenticado, continua com o checkout
                await this.processCheckout(plan);
            } catch (error) {
                this.handleError(error);
            }
        },

        async processCheckout(plan) {
            try {
                const user = this.$store.state.auth.user;
                if (!user?.id || !user?.name || !user?.email) {
                    throw new Error('Informações do usuário incompletas');
                }

                const customerRequest = {
                    userId: user.id,
                    userName: user.name,
                    email: user.email,
                    plan: plan
                };

                const response = await PaymentService.createCheckoutSession(customerRequest);
                
                if (!response.data?.checkoutUrl) {
                    throw new Error('URL de checkout não recebida do servidor');
                }
                
                window.location.href = response.data.checkoutUrl;
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