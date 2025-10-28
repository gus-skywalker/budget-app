<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6">
        <v-card class="elevation-2">
          <v-card-text class="text-center">
            <v-icon
              size="64"
              color="success"
              class="mb-4"
            >
              mdi-check-circle
            </v-icon>
            
            <h2 class="text-h4 mb-4">Pagamento realizado com sucesso!</h2>
            
            <p class="text-body-1 mb-4">
              Obrigado por se inscrever. Seus dados de pagamento foram processados com sucesso.
            </p>

            <v-progress-circular
              v-if="loading"
              indeterminate
              color="primary"
            ></v-progress-circular>

            <v-alert
              v-if="error"
              type="error"
              class="mb-4"
            >
              {{ error }}
            </v-alert>

            <v-alert
              v-if="subscriptionDetails"
              type="success"
              class="mb-4"
            >
              Sua assinatura está ativa!
            </v-alert>
          </v-card-text>

          <v-card-actions class="justify-center pb-6">
            <v-btn
              color="primary"
              @click="goToDashboard"
              :loading="loading"
            >
              Ir para o Dashboard
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { useUserStore } from '@/plugins/userStore';
import PaymentService from '@/services/PaymentService';

export default {
  name: 'StripeSuccess',
  
  data() {
    return {
      sessionId: '',
      loading: true,
      error: null,
      subscriptionDetails: null
    }
  },

  async created() {
    try {
      // Extrair o session_id da URL de sucesso
      this.sessionId = new URLSearchParams(window.location.search).get('session_id');
      
      // Verificar os detalhes da assinatura
      await this.checkSubscriptionStatus();
    } catch (error) {
      console.error('Erro ao verificar status da assinatura:', error);
      this.error = 'Não foi possível verificar o status da sua assinatura. Por favor, contate o suporte.';
    } finally {
      this.loading = false;
    }
  },

  methods: {
    async checkSubscriptionStatus() {
      try {
        const userStore = useUserStore();
        const userId = userStore.user?.id;

        if (!userId) {
          throw new Error('Usuário não identificado');
        }

        // Aguarda alguns segundos para dar tempo do webhook processar
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Verifica o status da assinatura
        const response = await PaymentService.loadSubscriptionDetails(userId);
        this.subscriptionDetails = response.data;

        if (!this.subscriptionDetails) {
          throw new Error('Não foi possível encontrar os detalhes da assinatura');
        }
      } catch (error) {
        throw error;
      }
    },

    goToDashboard() {
      this.$router.push({ name: 'dashboard' });
    }
  }
}
</script>
