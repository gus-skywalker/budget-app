<template>
    <v-container id="checkout-page" fluid class="checkout-page">
        <section class="checkout-shell">
            <div class="shell checkout-grid">
                <div class="checkout-main card-surface">
                    <div class="section-tag">Checkout seguro</div>
                    <h1>Finalizando sua assinatura</h1>
                    <p class="checkout-lead">
                        Estamos preparando a sessão segura de pagamento para concluir sua assinatura com o menor atrito possível.
                    </p>

                    <div v-if="loading" class="status-panel status-panel-loading">
                        <v-progress-circular
                            indeterminate
                            color="#205f63"
                            size="56"
                        ></v-progress-circular>
                        <div>
                            <strong>Preparando seu checkout...</strong>
                            <p>Validando plano, contexto de cobrança e redirecionamento seguro.</p>
                        </div>
                    </div>

                    <div v-else-if="accepted && !error" class="status-panel status-panel-success">
                        <div class="status-icon">
                            <v-icon size="22">mdi-check-circle</v-icon>
                        </div>
                        <div>
                            <strong>Solicitação enviada com sucesso.</strong>
                            <p>Você será redirecionado assim que a sessão de pagamento estiver pronta.</p>
                            <div v-if="operationStatus" class="status-badge">
                                Status: {{ operationStatus.status }}
                            </div>
                        </div>
                    </div>

                    <div v-if="error" class="status-panel status-panel-error">
                        <div class="status-icon">
                            <v-icon size="22">mdi-alert-circle-outline</v-icon>
                        </div>
                        <div>
                            <strong>Não foi possível iniciar o checkout.</strong>
                            <p>{{ error }}</p>
                        </div>
                    </div>

                    <div v-if="planDetails" class="plan-summary">
                        <div class="summary-header">
                            <div>
                                <span class="summary-label">Resumo do plano</span>
                                <h2>{{ planDetails.name }}</h2>
                            </div>
                            <div class="summary-price">{{ formattedPlanPrice }}</div>
                        </div>

                        <div class="summary-meta">
                            <div class="meta-card">
                                <div class="meta-icon icon-contrast">
                                    <v-icon size="18">mdi-credit-card-outline</v-icon>
                                </div>
                                <div>
                                    <strong>Pagamento seguro</strong>
                                    <p>Fluxo protegido e redirecionamento externo da sessão de cobrança.</p>
                                </div>
                            </div>

                            <div class="meta-card">
                                <div class="meta-icon icon-warm">
                                    <v-icon size="18">mdi-refresh</v-icon>
                                </div>
                                <div>
                                    <strong>Alteração futura simples</strong>
                                    <p>Você poderá revisar ou trocar o plano depois nas configurações.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div v-if="error" class="checkout-actions">
                        <button
                            class="btn btn-primary"
                            @click="initializeCheckout"
                            :disabled="loading"
                        >
                            Tentar novamente
                        </button>
                        <button
                            class="btn btn-secondary"
                            @click="$router.push({ name: 'choose-plan' })"
                        >
                            Voltar para planos
                        </button>
                    </div>
                </div>

                <aside class="checkout-side">
                    <div class="side-card side-card-highlight">
                        <div class="section-tag section-tag-soft">Próximos passos</div>
                        <ul class="checklist">
                            <li>
                                <div class="meta-icon icon-contrast">
                                    <v-icon size="18">mdi-check-decagram-outline</v-icon>
                                </div>
                                <span>Confirmamos o contexto do plano e do workspace.</span>
                            </li>
                            <li>
                                <div class="meta-icon icon-contrast">
                                    <v-icon size="18">mdi-progress-clock</v-icon>
                                </div>
                                <span>Solicitamos a sessão de cobrança ao backend de billing.</span>
                            </li>
                            <li>
                                <div class="meta-icon icon-contrast">
                                    <v-icon size="18">mdi-open-in-new</v-icon>
                                </div>
                                <span>Você será redirecionado automaticamente quando a sessão estiver pronta.</span>
                            </li>
                        </ul>
                    </div>

                    <div class="side-card">
                        <div class="section-tag section-tag-soft">Confiança</div>
                        <div class="trust-note">
                            <div class="meta-icon icon-warm">
                                <v-icon size="18">mdi-shield-lock-outline</v-icon>
                            </div>
                            <div>
                                <strong>Pagamento com proteção</strong>
                                <p>Não armazenamos dados sensíveis de pagamento nesta tela.</p>
                            </div>
                        </div>
                        <div class="trust-note">
                            <div class="meta-icon icon-contrast">
                                <v-icon size="18">mdi-office-building-outline</v-icon>
                            </div>
                            <div>
                                <strong>Fluxo alinhado ao seu contexto</strong>
                                <p>Planos TEAM respeitam empresa e permissões antes de seguir para cobrança.</p>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </section>
    </v-container>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/plugins/userStore';
import { PLAN_DETAILS } from '@/constants/plans';
import { createCorrelationId } from '@/utils/correlation'
import { createMessageId } from '@/utils/messageId'
import { buildBillingPricingContext, formatConvertedPriceFromBRL } from '@/utils/pricing'
import BillingOrchestrationService from '@/services/BillingOrchestrationService'
import BillingDecisionService from '@/services/BillingDecisionService'
import {
    clearBillingCheckoutContext,
    readBillingCheckoutContext,
    requireActiveWorkspaceContext,
    saveBillingCheckoutContext,
} from '@/services/BillingWorkspaceContext'

export default {
    name: 'CheckoutView',
    setup() {
        const route = useRoute();
        const router = useRouter();
        const userStore = useUserStore();

        const loading = ref(true);
        const error = ref(null);
        const accepted = ref(false)
        const operationStatus = ref(null)

        const getBillingContext = () => buildBillingPricingContext({
            uiLocale: String(route.query.uiLocale || userStore.language || '').toLowerCase() || null,
            browserLocale: typeof navigator !== 'undefined' ? navigator.language : null,
            countryCode: typeof route.query.countryCode === 'string' ? route.query.countryCode : null
        })

        const planDetails = computed(() => {
            const planId = route.query.plan;
            return planId && PLAN_DETAILS[planId] ? PLAN_DETAILS[planId] : null;
        });

        const formattedPlanPrice = computed(() => {
            if (!planDetails.value) return null
            const billing = getBillingContext()
            const amount = formatConvertedPriceFromBRL({
                amountInBRL: planDetails.value.amount,
                targetCurrency: billing.preferredCurrency,
                uiLocale: billing.uiLocale
            })
            const suffix = planDetails.value.billingPeriod === 'year' ? 'year' : 'month'
            return `${amount} / ${suffix}`
        })

        const pollOperation = async (messageId) => {
            const startedAt = Date.now()
            const timeoutMs = 30000
            const intervalMs = 1500

            while (Date.now() - startedAt < timeoutMs) {
                const resp = await BillingOrchestrationService.getOperationStatus(messageId)
                operationStatus.value = resp.data

                const redirectUrl = resp.data.redirectUrl
                if (redirectUrl) {
                    window.location.href = redirectUrl
                    return
                }

                if (resp.data.status === 'FAILED') {
                    throw new Error(resp.data.lastError || 'Falha ao processar comando de billing')
                }

                if (resp.data.status === 'DISPATCHED') {
                    return
                }

                await new Promise(resolve => setTimeout(resolve, intervalMs))
            }
        }

        const initializeCheckout = async () => {
            loading.value = true
            error.value = null
            accepted.value = false

            try {
                const plan = route.query.plan;
                if (!plan) {
                    error.value = 'Nenhum plano selecionado';
                    return
                }

                const user = userStore.user;
                if (!user?.id) {
                    router.push({ name: 'login' });
                    return
                }

                const correlationId = createCorrelationId()
                const workspaceContext = requireActiveWorkspaceContext(userStore)

                const decisionResp = await BillingDecisionService.decide(
                    {
                        plan: String(plan),
                        actor: String(user.id),
                        billingAccountId: readBillingCheckoutContext()?.billingAccountId || null,
                        ...getBillingContext()
                    },
                    correlationId
                )

                const decision = decisionResp.data
                if (decision.action === 'NOOP_ALREADY_PREMIUM') {
                    clearBillingCheckoutContext()
                    router.push({ name: 'dashboard' })
                    return
                }

                saveBillingCheckoutContext({
                    plan: String(plan),
                    workspaceId: workspaceContext.workspaceId,
                    workspaceName: workspaceContext.workspaceName,
                    billingAccountId: decision.billingAccountId || null,
                    correlationId: String(decision.correlationId || correlationId),
                })

                // New checkout attempt must use a fresh command id.
                // Reusing messageId can return stale/expired checkout URLs from old operations.
                const messageId = createMessageId()

                await BillingOrchestrationService.startSubscription({
                    plan: String(plan),
                    actor: String(user.id),
                    billingAccountId: decision.billingAccountId || null,
                    correlationId: String(decision.correlationId || correlationId),
                    messageId,
                    ...getBillingContext()
                })

                accepted.value = true

                // Best-effort polling for dispatcher progress (doesn't assume checkoutUrl exists yet)
                await pollOperation(messageId)

            } catch (err) {
                error.value = err?.response?.data?.error || err?.message || String(err);
                console.error('Erro ao iniciar checkout:', err);
            } finally {
                loading.value = false;
            }
        };

        onMounted(() => {
            initializeCheckout();
        });

        return {
            loading,
            error,
            accepted,
            planDetails,
            formattedPlanPrice,
            operationStatus,
            initializeCheckout
        };
    }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&family=Source+Sans+3:wght@400;500;600;700&display=swap');

#checkout-page {
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
    min-height: 100vh;
    padding: 0 !important;
}

#checkout-page :deep(*) {
    box-sizing: border-box;
}

#checkout-page :deep(.v-icon) {
    color: inherit;
}

.checkout-shell {
    padding: 72px 0;
}

.shell {
    width: min(1100px, calc(100vw - 32px));
    margin: 0 auto;
}

.checkout-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.1fr) minmax(320px, 0.72fr);
    gap: 22px;
    align-items: start;
}

.card-surface,
.side-card,
.meta-card,
.status-panel {
    border-radius: 28px;
    border: 1px solid var(--line);
    box-shadow: var(--shadow-soft);
}

.checkout-main {
    padding: 30px;
    background: rgba(255, 255, 255, 0.88);
}

.section-tag {
    display: inline-flex;
    align-items: center;
    border-radius: 999px;
    padding: 8px 14px;
    background: rgba(32, 95, 99, 0.1);
    color: var(--accent-strong);
    font-family: 'Manrope', sans-serif;
    font-size: 0.82rem;
    font-weight: 800;
    letter-spacing: 0.05em;
    text-transform: uppercase;
}

.section-tag-soft {
    background: rgba(255, 255, 255, 0.72);
}

h1,
h2,
strong,
.summary-price,
.btn {
    font-family: 'Manrope', sans-serif;
}

h1 {
    margin: 18px 0 14px;
    font-size: clamp(2.2rem, 4vw, 3.6rem);
    line-height: 1;
    letter-spacing: -0.05em;
}

h2 {
    margin: 0;
    font-size: 1.5rem;
    line-height: 1.08;
}

p {
    margin: 0;
    color: var(--ink-soft);
    line-height: 1.65;
    font-size: 1rem;
}

.checkout-lead {
    max-width: 58ch;
    font-size: 1.1rem;
}

.status-panel {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 16px;
    align-items: center;
    margin-top: 24px;
    padding: 20px;
    background: rgba(255, 255, 255, 0.9);
}

.status-panel-loading {
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.92) 0%, rgba(242, 236, 227, 0.68) 100%);
}

.status-panel-success {
    background: rgba(32, 95, 99, 0.08);
}

.status-panel-error {
    background: rgba(182, 85, 31, 0.08);
}

.status-icon,
.meta-icon {
    width: 42px;
    height: 42px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 14px;
}

.status-icon {
    background: rgba(255, 255, 255, 0.82);
    color: var(--accent-strong);
}

.status-badge {
    display: inline-flex;
    margin-top: 10px;
    padding: 6px 10px;
    border-radius: 999px;
    background: rgba(32, 95, 99, 0.12);
    color: var(--accent-strong);
    font-family: 'Manrope', sans-serif;
    font-size: 0.82rem;
    font-weight: 700;
}

.plan-summary {
    margin-top: 24px;
    padding-top: 24px;
    border-top: 1px solid rgba(23, 32, 51, 0.08);
}

.summary-header {
    display: flex;
    justify-content: space-between;
    gap: 20px;
    align-items: end;
}

.summary-label {
    display: inline-block;
    margin-bottom: 8px;
    color: var(--ink-soft);
    font-size: 0.88rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.summary-price {
    font-size: 1.22rem;
    font-weight: 800;
    color: var(--brand-strong);
}

.summary-meta {
    display: grid;
    gap: 14px;
    margin-top: 20px;
}

.meta-card,
.trust-note {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 14px;
    align-items: start;
}

.meta-card {
    padding: 16px;
    background: rgba(255, 255, 255, 0.84);
}

.checkout-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 24px;
}

.btn {
    min-height: 48px;
    padding: 0 22px;
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

.btn-primary {
    background: linear-gradient(135deg, var(--brand) 0%, #d16b31 100%);
    color: #fff;
    box-shadow: 0 10px 18px rgba(182, 85, 31, 0.16);
}

.btn-secondary {
    background: transparent;
    border-color: rgba(32, 95, 99, 0.22);
    color: var(--accent-strong);
}

.checkout-side {
    display: grid;
    gap: 18px;
}

.side-card {
    padding: 22px;
    background: rgba(255, 255, 255, 0.82);
}

.side-card-highlight {
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.92) 0%, rgba(242, 236, 227, 0.82) 100%);
}

.checklist {
    list-style: none;
    padding: 0;
    margin: 16px 0 0;
    display: grid;
    gap: 14px;
}

.checklist li,
.trust-note {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 12px;
    align-items: start;
}

.trust-note + .trust-note {
    margin-top: 14px;
}

.icon-contrast {
    background: rgba(32, 95, 99, 0.12);
    color: var(--accent-strong);
}

.icon-warm {
    background: rgba(182, 85, 31, 0.12);
    color: var(--brand-strong);
}

@media (max-width: 980px) {
    .checkout-grid {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 760px) {
    .checkout-shell {
        padding: 56px 0;
    }

    .shell {
        width: min(100vw - 24px, 100%);
    }

    .checkout-main,
    .side-card,
    .meta-card,
    .status-panel {
        border-radius: 22px;
    }

    .checkout-main,
    .side-card {
        padding: 20px;
    }

    .summary-header {
        flex-direction: column;
        align-items: start;
    }

    .checkout-actions {
        flex-direction: column;
    }
}
</style>
