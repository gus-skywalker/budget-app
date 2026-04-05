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
import BillingOrchestrationService from '@/services/BillingOrchestrationService';
import {
  clearBillingCheckoutContext,
  readBillingCheckoutContext,
  resolveAnyWorkspaceContext,
} from '@/services/BillingWorkspaceContext'

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
    resolveWorkspaceContext() {
      const savedContext = readBillingCheckoutContext()
      if (savedContext?.workspaceId) {
        return savedContext
      }

      const userStore = useUserStore();
      const workspaceContext = resolveAnyWorkspaceContext(userStore)
      if (!workspaceContext) {
        throw new Error('Workspace não identificado');
      }

      return workspaceContext
    },

    async checkSubscriptionStatus() {
      const { workspaceId } = this.resolveWorkspaceContext()

      // Poll budget-api until webhook projection becomes premium=true.
      const startedAt = Date.now();
      const timeoutMs = 45000;
      const intervalMs = 2000;

      while (Date.now() - startedAt < timeoutMs) {
        const response = await BillingOrchestrationService.getBillingSummary(workspaceId);
        if (response.data?.hasPremiumAccess) {
          this.subscriptionDetails = response.data;
          clearBillingCheckoutContext()
          return;
        }
        await new Promise(resolve => setTimeout(resolve, intervalMs));
      }

      throw new Error('Assinatura ainda não foi ativada. Tente novamente em instantes.');
    },

    goToDashboard() {
      this.$router.push({ name: 'dashboard' });
    }
  }
}
</script>
