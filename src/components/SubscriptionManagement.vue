<template>
    <v-container>
        <v-row>
            <v-col cols="12" md="6">
                <h2>{{ $t('subscription_management.title') }}</h2>
                <p><strong>{{ $t('subscription_management.current_plan') }}:</strong> {{ currentPlanText }}</p>
                <p><strong>{{ $t('subscription_management.status') }}:</strong> {{ statusText }}</p>

                <p>{{ $t('subscription_management.change_plan_instructions') }}</p>

                <v-radio-group v-model="selectedPlan">
                    <v-radio :label="$t('subscription_management.plans.monthly')" value="MONTHLY"
                        :disabled="currentPlan === 'MONTHLY'"></v-radio>
                    <v-radio :label="$t('subscription_management.plans.annual')" value="ANNUAL"
                        :disabled="currentPlan === 'ANNUAL'"></v-radio>
                </v-radio-group>

                <!-- Mudar plano pelo backend (Checkout) -->
                <v-btn v-if="selectedPlan && currentPlan !== selectedPlan" @click="startCheckoutSession">
                    {{ $t('subscription_management.change_to', { plan: selectedPlanText }) }}
                </v-btn>

                <!-- Acesso ao portal Stripe -->
                <v-btn v-else @click="openBillingPortal">
                    {{ $t('subscription_management.manage_subscription') }}
                </v-btn>

                <!-- Botão de Cancelar Assinatura -->
                <v-btn v-if="subscriptionStatus === 'active'" color="error" @click="cancelSubscription">
                    {{ $t('subscription_management.cancel_subscription') }}
                </v-btn>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import PaymentService from '@/services/PaymentService';

interface User {
    id?: string;
    username?: string;
    email?: string;
    avatar?: string;
}

// Recebe o objeto `user` como propriedade
const props = defineProps<{ user: User }>();

// Estado da assinatura e plano selecionado
const currentPlan = ref('');
const subscriptionId = ref('');
const subscriptionStatus = ref('');
const customerId = ref('');
const selectedPlan = ref(''); // Para atualizar o plano

// Obter o texto do plano atual
const currentPlanText = computed(() => {
    if (currentPlan.value === 'MONTHLY') return 'Mensal - R$27,50/mês';
    if (currentPlan.value === 'ANNUAL') return 'Anual - R$330,00/ano';
    return 'Gratuito';
});

const selectedPlanText = computed(() => {
    if (selectedPlan.value === 'MONTHLY') return 'Plano Mensal - R$27,50';
    if (selectedPlan.value === 'ANNUAL') return 'Plano Anual - R$330,00';
    return '';
});

const statusText = computed(() => {
    switch (subscriptionStatus.value) {
        case 'ACTIVE':
            return 'Ativa';
        case 'TRIALING':
            return 'Período de Teste';
        case 'CANCELED':
            return 'Cancelada ao Final do Período';
        default:
            return 'Inativa';
    }
});

// Função para carregar o plano e status da assinatura do usuário
const loadSubscriptionDetails = async () => {
    try {
        const response = await PaymentService.loadSubscriptionDetails(props.user.id);
        currentPlan.value = response.data.plan;
        subscriptionStatus.value = response.data.status;
        customerId.value = response.data.customerId;
        subscriptionId.value = response.data.subscriptionId;
    } catch (error) {
        console.error('Erro ao carregar detalhes da assinatura:', error);
    }
};

const startCheckoutSession = async () => {
    try {
        const response = await PaymentService.createCheckoutSession({
            userId: props.user.id,
            customerId: customerId.value,
            subscriptionId: subscriptionId.value,
            plan: selectedPlan.value,
        });
        window.location.href = response.data.checkoutUrl;
    } catch (error) {
        console.error('Erro ao iniciar sessão de checkout:', error);
        alert('Não foi possível iniciar o checkout. Tente novamente mais tarde.');
    }
};

// Função para abrir o portal de faturamento
const openBillingPortal = async () => {
    try {
        const response = await PaymentService.openBillingPortal({
            customerId: customerId.value,
        });
        window.location.href = response.data.portalUrl;
    } catch (error) {
        console.error('Erro ao abrir o portal de faturamento:', error);
        alert('Não foi possível acessar o portal de faturamento. Tente novamente mais tarde.');
    }
};

// Função para cancelar a assinatura
const cancelSubscription = async () => {
    try {
        const confirmed = confirm('Tem certeza de que deseja cancelar sua assinatura?');
        if (!confirmed) {
            return;
        }

        await PaymentService.cancelSubscription(subscriptionId.value);

        alert('Sua assinatura foi cancelada com sucesso. Você continuará a ter acesso até o fim do período já pago.');
        // Recarrega os detalhes da assinatura para atualizar o status na interface
        await loadSubscriptionDetails();
    } catch (error) {
        console.error('Erro ao cancelar a assinatura:', error);
        alert('Não foi possível cancelar a assinatura. Tente novamente mais tarde.');
    }
};

// Carregar detalhes da assinatura ao montar o componente
onMounted(() => {
    loadSubscriptionDetails();
});
</script>

<style scoped>
/* Estilos específicos para o componente de assinatura */
</style>