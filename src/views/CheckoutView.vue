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
                                        {{ planDetails.price }}
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
import PaymentService from '@/services/PaymentService';

export default {
    name: 'CheckoutView',
    setup() {
        const route = useRoute();
        const router = useRouter();
        const userStore = useUserStore();
        
        const loading = ref(true);
        const error = ref(null);
        
        const planDetails = computed(() => {
            const plan = route.query.plan;
            if (plan === 'MONTHLY') {
                return {
                    name: 'Plano Mensal',
                    price: 'R$ 29,00 / mês'
                };
            } else if (plan === 'ANNUAL') {
                return {
                    name: 'Plano Anual',
                    price: 'R$ 299,00 / ano'
                };
            }
            return null;
        });

        const initializeCheckout = async () => {
            try {
                const plan = route.query.plan;
                if (!plan) {
                    throw new Error('Nenhum plano selecionado');
                }

                const user = userStore.user;
                if (!user) {
                    router.push({ name: 'login' });
                    throw new Error('Usuário não autenticado');
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

                // Redireciona para o Stripe Checkout
                window.location.href = response.data.checkoutUrl;
            } catch (err) {
                error.value = err.response?.data?.error || err.message;
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
            planDetails,
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