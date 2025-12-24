// src/components/SubscriptionManagement.vue
<template>
  <v-row>
    <v-col cols="12" lg="10">
      <!-- Card do Plano Atual -->
      <div class="modern-card mb-6">
        <div class="card-header">
          <h2 class="card-title">
            <v-icon color="#667eea" class="mr-2">mdi-crown</v-icon>
            {{ $t('subscription_management.current_plan') }}
          </h2>
          <p class="card-description">{{ $t('subscription_management.title') }}</p>
        </div>
        <div class="card-content">
          <div class="subscription-overview">
            <div class="subscription-info-grid">
              <div class="info-item">
                <div class="info-label">
                  <v-icon size="20" color="#667eea">mdi-package-variant</v-icon>
                  Plano
                </div>
                <div class="info-value">{{ currentPlanText }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">
                  <v-icon size="20" color="#667eea">mdi-check-circle</v-icon>
                  Status
                </div>
                <div class="info-value">
                  <v-chip 
                    :color="statusColor" 
                    size="small"
                    variant="flat"
                  >
                    <v-icon start size="small">{{ statusIcon }}</v-icon>
                    {{ statusText }}
                  </v-chip>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Card de Mudança de Plano -->
      <div class="modern-card mb-6">
        <div class="card-header">
          <h2 class="card-title">
            <v-icon color="#667eea" class="mr-2">mdi-swap-horizontal</v-icon>
            Alterar Plano
          </h2>
          <p class="card-description">{{ $t('subscription_management.change_plan_instructions') }}</p>
        </div>
        <div class="card-content">
          <v-radio-group v-model="selectedPlan" class="plan-radio-group">
            <template v-if="isTenantMode">
              <div class="plan-option" :class="{ 'disabled': currentPlan === 'BUSINESS_MONTHLY' }">
                <v-radio 
                  label="Plano Empresarial Mensal" 
                  value="BUSINESS_MONTHLY"
                  :disabled="currentPlan === 'BUSINESS_MONTHLY'"
                  color="#667eea"
                >
                  <template v-slot:label>
                    <div class="plan-label">
                      <div class="plan-name">
                        <v-icon class="mr-2">mdi-domain</v-icon>
                        Empresarial Mensal
                      </div>
                      <div class="plan-price">{{ plans.BUSINESS_MONTHLY.displayPrice }}</div>
                      <div class="plan-description">Cobrado mensalmente</div>
                    </div>
                  </template>
                </v-radio>
                <v-chip 
                  v-if="currentPlan === 'BUSINESS_MONTHLY'" 
                  size="small" 
                  color="#667eea"
                  class="current-badge"
                >
                  Atual
                </v-chip>
              </div>
              <v-divider class="my-4"></v-divider>
              <div class="plan-option" :class="{ 'disabled': currentPlan === 'BUSINESS_ANNUAL' }">
                <v-radio 
                  label="Plano Empresarial Anual" 
                  value="BUSINESS_ANNUAL"
                  :disabled="currentPlan === 'BUSINESS_ANNUAL'"
                  color="#667eea"
                >
                  <template v-slot:label>
                    <div class="plan-label">
                      <div class="plan-name">
                        <v-icon class="mr-2">mdi-domain"</v-icon>
                        Empresarial Anual
                        <v-chip size="x-small" color="success" class="ml-2">Economize</v-chip>
                      </div>
                      <div class="plan-price">{{ plans.BUSINESS_ANNUAL.displayPrice }}</div>
                      <div class="plan-description">Cobrado anualmente</div>
                    </div>
                  </template>
                </v-radio>
                <v-chip 
                  v-if="currentPlan === 'BUSINESS_ANNUAL'" 
                  size="small" 
                  color="#667eea"
                  class="current-badge"
                >
                  Atual
                </v-chip>
              </div>
            </template>
            <template v-else>
              <div class="plan-option" :class="{ 'disabled': currentPlan === 'MONTHLY' }">
                <v-radio 
                  :label="$t('subscription_management.plans.monthly')" 
                  value="MONTHLY"
                  :disabled="currentPlan === 'MONTHLY'"
                  color="#667eea"
                >
                  <template v-slot:label>
                    <div class="plan-label">
                      <div class="plan-name">
                        <v-icon class="mr-2">mdi-calendar-month</v-icon>
                        Plano Mensal
                      </div>
                      <div class="plan-price">{{ plans.MONTHLY.displayPrice }}</div>
                      <div class="plan-description">Cobrado mensalmente</div>
                    </div>
                  </template>
                </v-radio>
                <v-chip 
                  v-if="currentPlan === 'MONTHLY'" 
                  size="small" 
                  color="#667eea"
                  class="current-badge"
                >
                  Atual
                </v-chip>
              </div>
              <v-divider class="my-4"></v-divider>
              <div class="plan-option" :class="{ 'disabled': currentPlan === 'ANNUAL' }">
                <v-radio 
                  :label="$t('subscription_management.plans.annual')" 
                  value="ANNUAL"
                  :disabled="currentPlan === 'ANNUAL'"
                  color="#667eea"
                >
                  <template v-slot:label>
                    <div class="plan-label">
                      <div class="plan-name">
                        <v-icon class="mr-2">mdi-calendar-check</v-icon>
                        Plano Anual
                        <v-chip size="x-small" color="success" class="ml-2">Economize 17%</v-chip>
                      </div>
                      <div class="plan-price">{{ plans.ANNUAL.displayPrice }}</div>
                      <div class="plan-description">{{ formatAmount(plans.MONTHLY.amount) }}/mês (cobrado anualmente)</div>
                    </div>
                  </template>
                </v-radio>
                <v-chip 
                  v-if="currentPlan === 'ANNUAL'" 
                  size="small" 
                  color="#667eea"
                  class="current-badge"
                >
                  Atual
                </v-chip>
              </div>
            </template>
          </v-radio-group>

          <div class="action-buttons">
            <!-- Botão de mudança de plano -->
            <v-btn 
              v-if="selectedPlan && currentPlan !== selectedPlan" 
              @click="startCheckoutSession"
              class="modern-btn gradient-btn mb-3"
              size="large"
              block
            >
              <v-icon left>mdi-swap-horizontal</v-icon>
              {{ $t('subscription_management.change_to', { plan: selectedPlanText }) }}
            </v-btn>

            <!-- Botão para desselecionar e voltar -->
            <v-btn 
              v-if="selectedPlan && currentPlan !== selectedPlan" 
              @click="selectedPlan = currentPlan"
              variant="text"
              color="#667eea"
              class="modern-btn mb-3"
              size="large"
              block
            >
              <v-icon left>mdi-close</v-icon>
              Cancelar Mudança
            </v-btn>

            <!-- Botão para gerenciar assinatura (sempre visível se não houver mudança pendente) -->
            <v-btn 
              v-if="!selectedPlan || currentPlan === selectedPlan"
              @click="openBillingPortal"
              variant="outlined"
              color="#667eea"
              class="modern-btn"
              size="large"
              block
            >
              <v-icon left>mdi-cog</v-icon>
              {{ $t('subscription_management.manage_subscription') }}
            </v-btn>
          </div>
        </div>
      </div>

      <!-- Card de Cancelamento -->
      <div v-if="subscriptionStatus === 'active'" class="modern-card cancel-card">
        <div class="card-header">
          <h2 class="card-title">
            <v-icon color="#f44336" class="mr-2">mdi-alert-circle</v-icon>
            Zona de Perigo
          </h2>
          <p class="card-description">Ações irreversíveis da sua assinatura</p>
        </div>
        <div class="card-content">
          <div class="cancel-section">
            <div class="cancel-info">
              <div class="cancel-label">Cancelar Assinatura</div>
              <div class="cancel-hint">Você perderá acesso aos recursos premium ao final do período atual</div>
            </div>
            <v-btn 
              @click="cancelSubscription"
              color="error"
              variant="outlined"
              class="modern-btn"
            >
              <v-icon left>mdi-close-circle</v-icon>
              {{ $t('subscription_management.cancel_subscription') }}
            </v-btn>
          </div>
        </div>
      </div>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import PaymentService from '@/services/PaymentService';
import { PLAN_DETAILS, formatPlanAmount, type PlanId } from '@/constants/plans';

interface User {
    id?: string;
    username?: string;
    email?: string;
    avatar?: string;
}

import { useUserStore } from '@/plugins/userStore';
const props = defineProps<{ user: User }>();
const userStore = useUserStore();
const isTenantMode = userStore.isTenantMode;

// Estado da assinatura e plano selecionado
type MaybePlanId = PlanId | '';

const currentPlan = ref<MaybePlanId>('');
const subscriptionId = ref('');
const subscriptionStatus = ref('');
const customerId = ref('');
const selectedPlan = ref<MaybePlanId>(''); // Para atualizar o plano

const plans = PLAN_DETAILS;

const isPlanId = (value: string | null | undefined): value is PlanId => {
  return value === 'MONTHLY' || value === 'ANNUAL';
};

const formatAmount = (amount: number) => formatPlanAmount(amount);

// Obter o texto do plano atual
const currentPlanText = computed(() => {
    if (isPlanId(currentPlan.value)) {
        return plans[currentPlan.value].planDisplay;
    }
    return 'Gratuito';
});

const selectedPlanText = computed(() => {
    if (isPlanId(selectedPlan.value)) {
        return `Plano ${plans[selectedPlan.value].planDisplay}`;
    }
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

const statusColor = computed(() => {
    switch (subscriptionStatus.value) {
        case 'ACTIVE':
            return 'success';
        case 'TRIALING':
            return 'info';
        case 'CANCELED':
            return 'warning';
        default:
            return 'grey';
    }
});

const statusIcon = computed(() => {
    switch (subscriptionStatus.value) {
        case 'ACTIVE':
            return 'mdi-check-circle';
        case 'TRIALING':
            return 'mdi-clock-outline';
        case 'CANCELED':
            return 'mdi-alert-circle';
        default:
            return 'mdi-close-circle';
    }
});

// Função para carregar o plano e status da assinatura do usuário
const loadSubscriptionDetails = async () => {
  try {
    if (!props.user.id) {
      console.error('User ID is required to load subscription details');
      return;
    }
    let response;
    if (isTenantMode && userStore.currentCompanyId) {
      // Carrega assinatura empresarial
      response = await PaymentService.loadSubscriptionDetails(userStore.currentCompanyId);
    } else {
      // Carrega assinatura pessoal
      response = await PaymentService.loadSubscriptionDetails(props.user.id);
    }
    currentPlan.value = response.data.plan;
    subscriptionStatus.value = response.data.status;
    customerId.value = response.data.customerId;
    subscriptionId.value = response.data.subscriptionId;
    selectedPlan.value = response.data.plan;
  } catch (error) {
    console.error('Erro ao carregar detalhes da assinatura:', error);
  }
};

const startCheckoutSession = async () => {
  try {
    let payload;
    if (isTenantMode && userStore.currentCompanyId) {
      payload = {
        companyId: userStore.currentCompanyId,
        customerId: customerId.value,
        subscriptionId: subscriptionId.value,
        plan: selectedPlan.value,
      };
    } else {
      payload = {
        userId: props.user.id,
        customerId: customerId.value,
        subscriptionId: subscriptionId.value,
        plan: selectedPlan.value,
      };
    }
    const response = await PaymentService.createCheckoutSession(payload);
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
        window.open(response.data.portalUrl, '_blank');
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
/* Modern Cards */
.modern-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  overflow: hidden;
}

.v-theme--dark .modern-card {
  background: #2a2a2a;
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.modern-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.v-theme--dark .modern-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
}

.card-header {
  padding: 24px 24px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.v-theme--dark .card-header {
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

.card-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
  display: flex;
  align-items: center;
}

.v-theme--dark .card-title {
  color: #ffffff;
}

.card-description {
  color: #666;
  margin: 8px 0 0;
  font-size: 0.95rem;
}

.v-theme--dark .card-description {
  color: #b0b0b0;
}

.card-content {
  padding: 24px;
}

/* Subscription Overview */
.subscription-overview {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  border-radius: 12px;
  padding: 20px;
}

.v-theme--dark .subscription-overview {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
}

.subscription-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-label {
  font-size: 0.875rem;
  color: #666;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}

.v-theme--dark .info-label {
  color: #b0b0b0;
}

.info-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
}

.v-theme--dark .info-value {
  color: #ffffff;
}

/* Plan Options */
.plan-radio-group {
  margin-top: 8px;
}

.plan-option {
  padding: 16px;
  border-radius: 12px;
  background: rgba(102, 126, 234, 0.03);
  transition: all 0.3s ease;
  position: relative;
}

.v-theme--dark .plan-option {
  background: rgba(102, 126, 234, 0.08);
}

.plan-option:hover:not(.disabled) {
  background: rgba(102, 126, 234, 0.08);
  transform: translateX(4px);
}

.v-theme--dark .plan-option:hover:not(.disabled) {
  background: rgba(102, 126, 234, 0.15);
}

.plan-option.disabled {
  opacity: 0.6;
  background: rgba(0, 0, 0, 0.02);
}

.v-theme--dark .plan-option.disabled {
  background: rgba(255, 255, 255, 0.02);
}

.plan-label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
}

.plan-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a1a1a;
  display: flex;
  align-items: center;
}

.v-theme--dark .plan-name {
  color: #ffffff;
}

.plan-price {
  font-size: 1.5rem;
  font-weight: 700;
  color: #667eea;
  margin-top: 4px;
}

.plan-description {
  font-size: 0.875rem;
  color: #666;
}

.v-theme--dark .plan-description {
  color: #b0b0b0;
}

.current-badge {
  position: absolute;
  top: 16px;
  right: 16px;
}

/* Action Buttons */
.action-buttons {
  margin-top: 24px;
}

.modern-btn {
  text-transform: none;
  font-weight: 600;
  letter-spacing: 0.5px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.gradient-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  color: white !important;
}

.gradient-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

/* Cancel Card */
.cancel-card {
  border: 2px solid rgba(244, 67, 54, 0.2);
}

.v-theme--dark .cancel-card {
  border-color: rgba(244, 67, 54, 0.3);
}

.cancel-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.cancel-info {
  flex: 1;
  min-width: 250px;
}

.cancel-label {
  font-size: 1.1rem;
  font-weight: 600;
  color: #f44336;
  margin-bottom: 4px;
}

.cancel-hint {
  font-size: 0.875rem;
  color: #666;
}

.v-theme--dark .cancel-hint {
  color: #b0b0b0;
}

/* Responsive */
@media (max-width: 600px) {
  .card-header,
  .card-content {
    padding: 16px;
  }

  .subscription-info-grid {
    grid-template-columns: 1fr;
  }

  .plan-price {
    font-size: 1.25rem;
  }

  .cancel-section {
    flex-direction: column;
    align-items: stretch;
  }

  .current-badge {
    position: static;
    margin-top: 8px;
    align-self: flex-start;
  }
}
</style>