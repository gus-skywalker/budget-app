<template>
    <v-container id="checkout-page" fluid class="checkout-page">
        <section class="checkout-shell">
            <div class="shell checkout-grid">
                <div class="checkout-main card-surface">
                    <div class="section-tag">{{ t('checkout.secure_tag') }}</div>
                    <h1>{{ t('checkout.title') }}</h1>
                    <p class="checkout-lead">
                        {{ t('checkout.lead') }}
                    </p>

                    <div v-if="loading" class="status-panel status-panel-loading">
                        <v-progress-circular
                            indeterminate
                            color="#205f63"
                            size="56"
                        ></v-progress-circular>
                        <div>
                            <strong>{{ t('checkout.loading_title') }}</strong>
                            <p>{{ t('checkout.loading_message') }}</p>
                        </div>
                    </div>

                    <div v-else-if="accepted && !error" class="status-panel status-panel-success">
                        <div class="status-icon">
                            <v-icon size="22">mdi-check-circle</v-icon>
                        </div>
                        <div>
                            <strong>{{ t('checkout.success_title') }}</strong>
                            <p>{{ t('checkout.success_message') }}</p>
                            <div v-if="operationStatus" class="status-badge">
                                {{ t('checkout.status_label') }}: {{ operationStatus.status }}
                            </div>
                        </div>
                    </div>

                    <div v-if="error" class="status-panel status-panel-error">
                        <div class="status-icon">
                            <v-icon size="22">mdi-alert-circle-outline</v-icon>
                        </div>
                        <div>
                            <strong>{{ t('checkout.error_title') }}</strong>
                            <p>{{ error }}</p>
                        </div>
                    </div>

                    <div v-if="planDetails" class="plan-summary">
                        <div class="summary-header">
                            <div>
                                <span class="summary-label">{{ t('checkout.plan_summary') }}</span>
                                <h2>{{ planDetails.name }}</h2>
                            </div>
                            <div class="summary-price">{{ formattedPlanPrice }}</div>
                        </div>
                        <div v-if="formattedPromoPrice && promotionClaim" class="promo-summary">
                            <v-chip color="var(--cb-accent)" variant="tonal" size="small">
                                {{ t('checkout.promo_badge', { percent: promotionClaim.discountPercent }) }}
                            </v-chip>
                            <p>
                                {{ t('checkout.promo_summary', {
                                    amount: formattedPromoPrice,
                                    percent: promotionClaim.discountPercent,
                                }) }}
                            </p>
                        </div>

                        <div class="summary-meta">
                            <div class="meta-card">
                                <div class="meta-icon icon-contrast">
                                    <v-icon size="18">mdi-credit-card-outline</v-icon>
                                </div>
                                <div>
                                    <strong>{{ t('checkout.secure_payment_title') }}</strong>
                                    <p>{{ t('checkout.secure_payment_message') }}</p>
                                </div>
                            </div>

                            <div class="meta-card">
                                <div class="meta-icon icon-warm">
                                    <v-icon size="18">mdi-refresh</v-icon>
                                </div>
                                <div>
                                    <strong>{{ t('checkout.plan_change_title') }}</strong>
                                    <p>{{ t('checkout.plan_change_message') }}</p>
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
                            {{ t('checkout.retry') }}
                        </button>
                        <button
                            class="btn btn-secondary"
                            @click="$router.push({ name: 'choose-plan' })"
                        >
                            {{ t('checkout.back_to_plans') }}
                        </button>
                    </div>
                </div>

                <aside class="checkout-side">
                    <div class="side-card side-card-highlight">
                        <div class="section-tag section-tag-soft">{{ t('checkout.next_steps') }}</div>
                        <ul class="checklist">
                            <li>
                                <div class="meta-icon icon-contrast">
                                    <v-icon size="18">mdi-check-decagram-outline</v-icon>
                                </div>
                                <span>{{ t('checkout.step_context') }}</span>
                            </li>
                            <li>
                                <div class="meta-icon icon-contrast">
                                    <v-icon size="18">mdi-progress-clock</v-icon>
                                </div>
                                <span>{{ t('checkout.step_billing') }}</span>
                            </li>
                            <li>
                                <div class="meta-icon icon-contrast">
                                    <v-icon size="18">mdi-open-in-new</v-icon>
                                </div>
                                <span>{{ t('checkout.step_redirect') }}</span>
                            </li>
                        </ul>
                    </div>

                    <div class="side-card">
                        <div class="section-tag section-tag-soft">{{ t('checkout.trust') }}</div>
                        <div class="trust-note">
                            <div class="meta-icon icon-warm">
                                <v-icon size="18">mdi-shield-lock-outline</v-icon>
                            </div>
                            <div>
                                <strong>{{ t('checkout.protected_payment_title') }}</strong>
                                <p>{{ t('checkout.protected_payment_message') }}</p>
                            </div>
                        </div>
                        <div class="trust-note">
                            <div class="meta-icon icon-contrast">
                                <v-icon size="18">mdi-office-building-outline</v-icon>
                            </div>
                            <div>
                                <strong>{{ t('checkout.context_flow_title') }}</strong>
                                <p>{{ t('checkout.context_flow_message') }}</p>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </section>

        <v-dialog v-model="promotionDialogOpen" max-width="560" persistent>
            <v-card class="promo-dialog">
                <v-card-title class="promo-dialog__title">
                    <v-icon color="var(--cb-accent)" class="mr-2">mdi-ticket-percent-outline</v-icon>
                    {{ t('checkout.promo_dialog_title') }}
                </v-card-title>
                <v-card-text class="promo-dialog__content">
                    <p class="promo-dialog__lead">
                        {{ t('checkout.promo_dialog_lead', { percent: promotionClaim?.discountPercent || 30 }) }}
                    </p>
                    <div class="promo-dialog__highlight">
                        <p>{{ t('checkout.promo_dialog_body') }}</p>
                    </div>
                </v-card-text>
                <v-card-actions class="promo-dialog__actions">
                    <v-spacer />
                    <v-btn variant="text" @click="promotionDialogOpen = false">
                        {{ t('common.close') }}
                    </v-btn>
                    <v-btn color="var(--cb-primary)" variant="flat" @click="continueCheckout">
                        {{ t('checkout.promo_continue') }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useUserStore } from '@/plugins/userStore';
import { PLAN_DETAILS } from '@/constants/plans';
import { createCorrelationId } from '@/utils/correlation'
import { createMessageId } from '@/utils/messageId'
import { buildBillingPricingContext, formatConvertedPriceFromBRL } from '@/utils/pricing'
import BillingOrchestrationService from '@/services/BillingOrchestrationService'
import BillingDecisionService from '@/services/BillingDecisionService'
import BillingPromotionService from '@/services/BillingPromotionService'
import { parseApiError } from '@/utils/errorHandler'
import {
    clearBillingCheckoutContext,
    readBillingCheckoutContext,
    resolveAnyWorkspaceContext,
    saveBillingCheckoutContext,
} from '@/services/BillingWorkspaceContext'

export default {
    name: 'CheckoutView',
    setup() {
        const route = useRoute();
        const router = useRouter();
        const userStore = useUserStore();
        const { t } = useI18n();

        const loading = ref(true);
        const error = ref(null);
        const accepted = ref(false)
        const operationStatus = ref(null)
        const promotionDialogOpen = ref(false)
        const promotionClaim = ref(null)
        const pendingCheckoutContext = ref(null)
        const promoFlowStarted = ref(false)
        const checkoutContext = computed(() => readBillingCheckoutContext())

        const readSelectedPlanFallback = () => {
            if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
                return ''
            }

            const storedPlan = window.localStorage.getItem('selectedPlan')
            return typeof storedPlan === 'string' ? storedPlan.trim() : ''
        }

        const resolveSelectedPlan = () => {
            const queryPlan = typeof route.query.plan === 'string' ? route.query.plan.trim() : ''
            if (queryPlan) return queryPlan
            const storedPlan = checkoutContext.value?.plan ? String(checkoutContext.value.plan).trim() : ''
            if (storedPlan) return storedPlan
            const fallbackPlan = readSelectedPlanFallback()
            if (fallbackPlan) return fallbackPlan
            return ''
        }

        const getBillingContext = () => buildBillingPricingContext({
            uiLocale: String(route.query.uiLocale || userStore.language || '').toLowerCase() || null,
            browserLocale: typeof navigator !== 'undefined' ? navigator.language : null,
            countryCode: typeof route.query.countryCode === 'string' ? route.query.countryCode : null
        })

        const planDetails = computed(() => {
            const planId = resolveSelectedPlan()
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
            const suffix = planDetails.value.billingPeriod === 'year' ? t('checkout.period_year') : t('checkout.period_month')
            return `${amount} / ${suffix}`
        })

        const formattedPromoPrice = computed(() => {
            if (!planDetails.value || !promotionClaim.value?.discountPercent) return null
            const discount = Number(promotionClaim.value.discountPercent || 0)
            const discountedAmount = Math.round(planDetails.value.amount * (100 - discount) / 100)
            const billing = getBillingContext()
            return formatConvertedPriceFromBRL({
                amountInBRL: discountedAmount,
                targetCurrency: billing.preferredCurrency,
                uiLocale: billing.uiLocale
            })
        })

        const pollOperation = async (messageId) => {
            const startedAt = Date.now()
            const timeoutMs = 30000
            const intervalMs = 1500
            const notFoundGraceMs = 10000

            while (Date.now() - startedAt < timeoutMs) {
                try {
                    const resp = await BillingOrchestrationService.getOperationStatus(messageId)
                    operationStatus.value = resp.data

                    const redirectUrl = resp.data.redirectUrl
                    if (redirectUrl) {
                        window.location.href = redirectUrl
                        return
                    }

                    if (resp.data.status === 'FAILED') {
                        throw new Error(t('checkout.billing_command_failed'))
                    }

                    if (resp.data.status === 'DISPATCHED') {
                        return
                    }
                } catch (pollError) {
                    const statusCode = pollError?.response?.status
                    const errorMessage = pollError?.response?.data?.error
                    if (statusCode === 404 || errorMessage === 'operation not found') {
                        if (Date.now() - startedAt < notFoundGraceMs) {
                            await new Promise(resolve => setTimeout(resolve, intervalMs))
                            continue
                        }
                        throw new Error(t('checkout.billing_command_failed'))
                    }
                    throw pollError
                }

                await new Promise(resolve => setTimeout(resolve, intervalMs))
            }
        }

        const startSubscriptionDispatch = async () => {
            if (!pendingCheckoutContext.value) {
                throw new Error(t('checkout.billing_command_failed'))
            }

            const messageId = createMessageId()
            const payload = pendingCheckoutContext.value

            await BillingOrchestrationService.startSubscription({
                plan: String(payload.plan),
                actor: String(payload.actor),
                billingAccountId: payload.billingAccountId || null,
                workspaceId: payload.workspaceId || null,
                correlationId: String(payload.correlationId),
                messageId,
                promotionClaimId: payload.promotionClaimId || null,
                promotionCampaignKey: payload.promotionCampaignKey || null,
                promotionDiscountPercent: payload.promotionDiscountPercent ?? null,
                ...getBillingContext()
            })

            accepted.value = true
            await pollOperation(messageId)
        }

        const initializeCheckout = async () => {
            loading.value = true
            error.value = null
            accepted.value = false
            promotionDialogOpen.value = false
            promotionClaim.value = null
            pendingCheckoutContext.value = null

            try {
                const plan = resolveSelectedPlan()
                if (!plan) {
                    error.value = t('checkout.no_plan_selected')
                    router.replace({ name: 'choose-plan' })
                    return
                }

                const user = userStore.user;
                if (!user?.id) {
                    router.push({ name: 'login' });
                    return
                }

                const correlationId = createCorrelationId()
                const workspaceContext = resolveAnyWorkspaceContext(userStore)
                const workspaceId = workspaceContext?.workspaceId || null
                const workspaceName = workspaceContext?.workspaceName || null

                const storedCheckoutContext = checkoutContext.value
                if (
                    storedCheckoutContext?.promotionClaimId ||
                    storedCheckoutContext?.promotionCampaignKey ||
                    storedCheckoutContext?.promotionDiscountPercent != null
                ) {
                    saveBillingCheckoutContext({
                        plan: String(plan),
                        workspaceId: storedCheckoutContext.workspaceId ?? workspaceId,
                        workspaceName: storedCheckoutContext.workspaceName ?? workspaceName,
                        billingAccountId: storedCheckoutContext.billingAccountId ?? null,
                        correlationId,
                    })
                }

                const decisionResp = await BillingDecisionService.decide(
                    {
                        plan: String(plan),
                        actor: String(user.id),
                        billingAccountId: readBillingCheckoutContext()?.billingAccountId || null,
                        workspaceId,
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
                    workspaceId,
                    workspaceName,
                    billingAccountId: decision.billingAccountId || null,
                    correlationId: String(decision.correlationId || correlationId),
                })

                pendingCheckoutContext.value = {
                    plan: String(plan),
                    actor: String(user.id),
                    billingAccountId: decision.billingAccountId || null,
                    correlationId: String(decision.correlationId || correlationId),
                    workspaceId,
                }

                try {
                    const promoResponse = await BillingPromotionService.claim({
                        workspaceId,
                        billingAccountId: decision.billingAccountId || null,
                        plan: String(plan),
                        actor: String(user.id),
                        correlationId: String(decision.correlationId || correlationId),
                    })

                    promotionClaim.value = promoResponse.data
                    if (pendingCheckoutContext.value) {
                        pendingCheckoutContext.value.promotionClaimId = promoResponse.data.claimId
                        pendingCheckoutContext.value.promotionCampaignKey = 'launch-30-15'
                        pendingCheckoutContext.value.promotionDiscountPercent = promoResponse.data.discountPercent || null
                    }
                    saveBillingCheckoutContext({
                        plan: String(plan),
                        workspaceId,
                        workspaceName,
                        billingAccountId: decision.billingAccountId || null,
                        promotionClaimId: promoResponse.data.claimId,
                        promotionCampaignKey: 'launch-30-15',
                        promotionDiscountPercent: promoResponse.data.discountPercent || null,
                        correlationId: String(decision.correlationId || correlationId),
                    })
                    promotionDialogOpen.value = true
                    loading.value = false
                    return
                } catch (promoError) {
                    console.warn('Promotion claim unavailable, continuing checkout without discount', promoError)
                }

                await startSubscriptionDispatch()

            } catch (err) {
                error.value = parseApiError(err, t('checkout.billing_command_failed'));
                console.error('Erro ao iniciar checkout:', err);
            } finally {
                loading.value = false;
            }
        };

        onMounted(() => {
            initializeCheckout();
        });

        const continueCheckout = async () => {
            promotionDialogOpen.value = false
            loading.value = true
            error.value = null
            try {
                await startSubscriptionDispatch()
            } catch (err) {
                error.value = parseApiError(err, t('checkout.billing_command_failed'))
            } finally {
                loading.value = false
            }
        }

        return {
            loading,
            error,
            accepted,
            planDetails,
            formattedPlanPrice,
            formattedPromoPrice,
            operationStatus,
            initializeCheckout,
            continueCheckout,
            promotionDialogOpen,
            promotionClaim,
            t
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

.promo-summary {
    margin-top: 16px;
    padding: 16px;
    border-radius: 20px;
    background: rgba(32, 95, 99, 0.08);
    border: 1px solid rgba(32, 95, 99, 0.12);
    color: var(--ink);
}

.promo-summary p {
    margin-top: 10px;
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

.promo-dialog {
    border-radius: 24px;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(242, 236, 227, 0.92) 100%);
}

.promo-dialog__title {
    display: flex;
    align-items: center;
    gap: 10px;
    padding-top: 24px;
    padding-bottom: 12px;
}

.promo-dialog__content {
    padding-top: 0;
}

.promo-dialog__lead {
    font-size: 1rem;
    color: var(--ink);
}

.promo-dialog__highlight {
    margin-top: 14px;
    padding: 16px;
    border-radius: 18px;
    background: rgba(32, 95, 99, 0.08);
}

.promo-dialog__actions {
    padding: 12px 24px 24px;
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
