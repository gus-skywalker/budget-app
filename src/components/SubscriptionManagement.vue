<template>
    <v-container>
        <v-row>
            <v-col cols="12" md="6">
                <h2>Gerenciamento de Assinatura</h2>
                <p><strong>Plano atual:</strong> {{ currentPlanText }}</p>
                <p><strong>Status:</strong> {{ subscriptionStatus }}</p>

                <v-radio-group v-model="selectedPlan" :mandatory="false">
                    <v-radio label="Plano Mensal - R$29,90" value="monthly"></v-radio>
                    <v-radio label="Plano Anual - R$299,00" value="annual"></v-radio>
                </v-radio-group>

                <v-btn v-if="subscriptionStatus === 'trialing'" @click="startCheckoutSession">
                    Iniciar Assinatura
                </v-btn>

                <v-btn v-else-if="subscriptionStatus === 'active'" @click="openBillingPortal">
                    Gerenciar Assinatura no Portal
                </v-btn>

                <v-btn v-else-if="subscriptionStatus === 'canceled'" color="primary" @click="startCheckoutSession">
                    Renovar Assinatura
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
const subscriptionStatus = ref('');
const customerId = ref('');
const selectedPlan = ref(''); // Para atualizar o plano

// Obter o texto do plano atual
const currentPlanText = computed(() => {
    if (currentPlan.value === 'monthly') return 'Mensal - R$29,90/mês';
    if (currentPlan.value === 'annual') return 'Anual - R$299,00/ano';
    return 'Gratuito';
});

// Função para carregar o plano e status da assinatura do usuário
const loadSubscriptionDetails = async () => {
    try {
        const response = await PaymentService.loadSubscriptionDetails(props.user.id);
        currentPlan.value = response.data.plan;
        subscriptionStatus.value = response.data.status;
        customerId.value = response.data.customerId;
    } catch (error) {
        console.error('Erro ao carregar detalhes da assinatura:', error);
    }
};

const startCheckoutSession = async () => {
    try {
        const response = await PaymentService.createCheckoutSession({
            userId: props.user.id,
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
        const response = await PaymentService.openBillingPortal(customerId);
        window.location.href = response.data.portalUrl;
    } catch (error) {
        console.error('Erro ao abrir o portal de faturamento:', error);
        alert('Não foi possível acessar o portal de faturamento. Tente novamente mais tarde.');
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