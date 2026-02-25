<template>
    <v-container>
        <v-row justify="center">
            <v-col cols="12" sm="8" md="6">
                <v-card class="elevation-12">
                    <v-card-title class="text-center">
                        Finalizando sua Assinatura
                    </v-card-title>

                    <v-card-text>
                        <div v-if="loading" class="text-center py-4">
                            <v-progress-circular
                                indeterminate
                                color="primary"
                                size="64"
                            ></v-progress-circular>
                            <div class="mt-4">Preparando seu checkout...</div>
                        </div>

                        <v-alert
                            v-if="accepted && !error"
                            type="info"
                            class="mt-4"
                        >
                            Solicitação enviada com sucesso.
                            <div v-if="operationStatus" class="mt-2">
                                Status: {{ operationStatus.status }}
                            </div>
                        </v-alert>

                        <v-alert
                            v-if="error"
                            type="error"
                            class="mt-4"
                            closable
                        >
                            {{ error }}
                        </v-alert>

                        <div v-if="planDetails" class="mt-4">
                            <h3 class="text-h6 mb-4">Resumo do Plano</h3>
                            <v-list>
                                <v-list-item>
                                    <v-list-item-title>
                                        {{ planDetails.name }}
                                    </v-list-item-title>
                                    <v-list-item-subtitle>
                                        {{ planDetails.displayPrice }}
                                    </v-list-item-subtitle>
                                </v-list-item>
                            </v-list>
                        </div>
                    </v-card-text>

                    <v-card-actions class="justify-center pb-6" v-if="error">
                        <v-btn
                            color="primary"
                            @click="initializeCheckout"
                            :loading="loading"
                        >
                            Tentar Novamente
                        </v-btn>
                        <v-btn
                            text
                            @click="$router.push({ name: 'choose-plan' })"
                            class="ml-2"
                        >
                            Voltar para Planos
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/plugins/userStore';
import { PLAN_DETAILS } from '@/constants/plans';
import { getOrCreateCorrelationId } from '@/utils/correlation'
import { createMessageId } from '@/utils/messageId'
import BillingOrchestrationService from '@/services/BillingOrchestrationService'

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

        const planDetails = computed(() => {
            const planId = route.query.plan;
            return planId && PLAN_DETAILS[planId] ? PLAN_DETAILS[planId] : null;
        });

        const pollOperation = async (messageId) => {
            const startedAt = Date.now()
            const timeoutMs = 30000
            const intervalMs = 1500

            while (Date.now() - startedAt < timeoutMs) {
                const resp = await BillingOrchestrationService.getOperationStatus(messageId)
                operationStatus.value = resp.data

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
                    throw new Error('Nenhum plano selecionado');
                }

                const user = userStore.user;
                if (!user?.id) {
                    router.push({ name: 'login' });
                    throw new Error('Usuário não autenticado');
                }

                const correlationId = route.query.correlationId ||
                    getOrCreateCorrelationId('billingCorrelationId')

                const subjectType = route.query.subjectType
                const subjectId = route.query.subjectId

                if (!subjectType || !subjectId) {
                    throw new Error('Parâmetros de billing ausentes (subjectType/subjectId)');
                }

                // Idempotency: keep a stable messageId for retries on this page.
                const storageKey = `billing.start.messageId:${correlationId}:${subjectType}:${subjectId}:${plan}`
                const existingMessageId = sessionStorage.getItem(storageKey)
                const messageId = existingMessageId || createMessageId()
                if (!existingMessageId) sessionStorage.setItem(storageKey, messageId)

                await BillingOrchestrationService.startSubscription({
                    plan: String(plan),
                    actor: String(user.id),
                    subjectType: String(subjectType),
                    subjectId: String(subjectId),
                    correlationId: String(correlationId),
                    messageId
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
            operationStatus,
            initializeCheckout
        };
    }
};
</script>

<style scoped>
.error-message {
    color: #ff5252;
    text-align: center;
    margin-top: 1rem;
}
</style>