// src/components/SubscriptionManagement.vue
<template>
  <v-row>
    <v-col cols="12" lg="10">
      <!-- Card do Plano Atual -->
      <div class="modern-card mb-6">
        <div class="card-header">
          <h2 class="card-title">
            <v-icon color="#667eea" class="mr-2">mdi-crown</v-icon>
            {{ t('subscription_management.current_plan') }}
          </h2>
          <p class="card-description">{{ t('subscription_management.title') }}</p>
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
          <p class="card-description">{{ t('subscription_management.change_plan_instructions') }}</p>
        </div>
        <div class="card-content">
          <v-radio-group v-model="selectedPlan" class="plan-radio-group">
            <div v-if="isTenantMode" class="plan-group-label">STARTER</div>
            <div class="plan-option" :class="{ 'disabled': currentPlan === 'MONTHLY' }">
              <v-radio 
                label="STARTER Mensal"
                value="MONTHLY"
                :disabled="currentPlan === 'MONTHLY'"
                color="#667eea"
              >
                <template v-slot:label>
                  <div class="plan-label">
                    <div class="plan-name">
                      <v-icon class="mr-2">mdi-calendar-month</v-icon>
                      STARTER Mensal
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
                label="STARTER Anual"
                value="ANNUAL"
                :disabled="currentPlan === 'ANNUAL'"
                color="#667eea"
              >
                <template v-slot:label>
                  <div class="plan-label">
                    <div class="plan-name">
                      <v-icon class="mr-2">mdi-calendar-check</v-icon>
                      STARTER Anual
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

            <template v-if="isTenantMode">
              <v-divider class="my-6"></v-divider>
              <div class="plan-group-label">TEAM</div>
              <div class="plan-option" :class="{ 'disabled': currentPlan === 'BUSINESS_MONTHLY' }">
                <v-radio 
                  label="TEAM Mensal" 
                  value="BUSINESS_MONTHLY"
                  :disabled="currentPlan === 'BUSINESS_MONTHLY'"
                  color="#667eea"
                >
                  <template v-slot:label>
                    <div class="plan-label">
                      <div class="plan-name">
                        <v-icon class="mr-2">mdi-domain</v-icon>
                        TEAM Mensal
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
                  label="TEAM Anual" 
                  value="BUSINESS_ANNUAL"
                  :disabled="currentPlan === 'BUSINESS_ANNUAL'"
                  color="#667eea"
                >
                  <template v-slot:label>
                    <div class="plan-label">
                      <div class="plan-name">
                        <v-icon class="mr-2">mdi-domain</v-icon>
                        TEAM Anual
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
          </v-radio-group>

          <div class="action-buttons">
            <!-- Botão de mudança de plano -->
            <v-btn 
              v-if="selectedPlan && currentPlan !== selectedPlan" 
              @click="handlePlanChange"
              class="modern-btn gradient-btn mb-3"
              size="large"
              block
            >
              <v-icon left>mdi-swap-horizontal</v-icon>
              {{ changePlanActionText }}
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
              {{ t('subscription_management.manage_subscription') }}
            </v-btn>
          </div>
        </div>
      </div>

      <!-- Card de Cancelamento -->
      <div v-if="subscriptionStatus === 'ACTIVE'" class="modern-card cancel-card">
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
              {{ t('subscription_management.cancel_subscription') }}
            </v-btn>
          </div>
        </div>
      </div>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import BillingDecisionService from '@/services/BillingDecisionService'
import BillingOrchestrationService from '@/services/BillingOrchestrationService'
import { createCorrelationId } from '@/utils/correlation'
import { PLAN_DETAILS, formatPlanAmount, type PlanId } from '@/constants/plans';
import { createMessageId } from '@/utils/messageId'

// Provide typed translation function for template (instead of relying on this.$t)
const { t } = useI18n()

interface User {
    id?: string;
    username?: string;
    email?: string;
    avatar?: string;
}

import { useUserStore } from '@/plugins/userStore';

const props = defineProps<{ user: User }>();
const userStore = useUserStore();
const router = useRouter()
const isTenantMode = computed(() => userStore.isTenantMode);
const actorUserId = computed(() => String(props.user.id || userStore.user?.id || ''))

// Estado da assinatura e plano selecionado
type MaybePlanId = PlanId | '';
type PlanTier = 'FREE' | 'STARTER' | 'TEAM' | '';
type BillingCycleUi = 'MONTHLY' | 'ANNUAL' | '';

const currentPlan = ref<MaybePlanId>('');
const currentPlanTier = ref<PlanTier>('');
const currentBillingCycle = ref<BillingCycleUi>('');
const subscriptionStatus = ref('');
const selectedPlan = ref<MaybePlanId>(''); // Para atualizar o plano
const hasPremiumAccess = ref(false);
const lastLoadedPlan = ref<MaybePlanId>('');

const plans = PLAN_DETAILS;

const isPlanId = (value: string | null | undefined): value is PlanId => {
  return (
    value === 'MONTHLY' ||
    value === 'ANNUAL' ||
    value === 'BUSINESS_MONTHLY' ||
    value === 'BUSINESS_ANNUAL'
  );
};

const isPlanTier = (value: string | null | undefined): value is Exclude<PlanTier, ''> => {
  return value === 'FREE' || value === 'STARTER' || value === 'TEAM';
};

const isBillingCycle = (value: string | null | undefined): value is Exclude<BillingCycleUi, ''> => {
  return value === 'MONTHLY' || value === 'ANNUAL';
};

const formatAmount = (amount: number) => formatPlanAmount(amount);

const mapPlanIdToTier = (planId: PlanId): Exclude<PlanTier, ''> => {
  return planId === 'BUSINESS_MONTHLY' || planId === 'BUSINESS_ANNUAL' ? 'TEAM' : 'STARTER';
};

const mapPlanIdToCycle = (planId: PlanId): Exclude<BillingCycleUi, ''> => {
  return planId === 'BUSINESS_ANNUAL' || planId === 'ANNUAL' ? 'ANNUAL' : 'MONTHLY';
};

const mapTierCycleToPlanId = (tier: Exclude<PlanTier, ''>, cycle: Exclude<BillingCycleUi, ''>): PlanId => {
  if (tier === 'TEAM') {
    return cycle === 'ANNUAL' ? 'BUSINESS_ANNUAL' : 'BUSINESS_MONTHLY';
  }
  return cycle === 'ANNUAL' ? 'ANNUAL' : 'MONTHLY';
};

const mapTierCycleToLabel = (tier: Exclude<PlanTier, ''>, cycle: Exclude<BillingCycleUi, ''>) => {
  return `${tier} ${cycle === 'ANNUAL' ? 'Anual' : 'Mensal'}`;
};

const mapTierToLabel = (tier: Exclude<PlanTier, ''>) => {
  if (tier === 'FREE') {
    return 'Gratuito';
  }
  return tier;
};

// Obter o texto do plano atual
const currentPlanText = computed(() => {
    if (isPlanId(currentPlan.value)) {
        return mapTierCycleToLabel(mapPlanIdToTier(currentPlan.value), mapPlanIdToCycle(currentPlan.value));
    }
    if (isPlanTier(currentPlanTier.value) && isBillingCycle(currentBillingCycle.value)) {
      return mapTierCycleToLabel(currentPlanTier.value, currentBillingCycle.value);
    }
    if (isPlanTier(currentPlanTier.value)) {
      return mapTierToLabel(currentPlanTier.value);
    }
    return 'Gratuito';
});

const selectedPlanText = computed(() => {
    if (isPlanId(selectedPlan.value)) {
        return plans[selectedPlan.value].name;
    }
    return '';
});

const statusText = computed(() => {
    switch (subscriptionStatus.value) {
        case 'ACTIVE':
            return 'Ativa';
        case 'INCOMPLETE':
            return 'Pagamento pendente';
        case 'PAST_DUE':
            return 'Pagamento em atraso';
        case 'CANCELED':
            return 'Cancelada';
        case 'NONE':
        default:
            return 'Inativa';
    }
});

const statusColor = computed(() => {
    switch (subscriptionStatus.value) {
        case 'ACTIVE':
            return 'success';
        case 'INCOMPLETE':
            return 'info';
        case 'PAST_DUE':
            return 'warning';
        case 'CANCELED':
            return 'grey';
        default:
            return 'grey';
    }
});

const statusIcon = computed(() => {
    switch (subscriptionStatus.value) {
        case 'ACTIVE':
            return 'mdi-check-circle';
        case 'INCOMPLETE':
            return 'mdi-clock-outline';
        case 'PAST_DUE':
            return 'mdi-alert-circle';
        case 'CANCELED':
            return 'mdi-close-circle';
        default:
            return 'mdi-close-circle';
    }
});

const isPremium = computed(() => {
  return hasPremiumAccess.value || subscriptionStatus.value === 'ACTIVE';
});

const changePlanActionText = computed(() => {
  const base = t('subscription_management.change_to', { plan: selectedPlanText.value });
  if (!isPremium.value) {
    return base;
  }
  return `${base} (Portal)`;
});

const loadSubscriptionDetails = async () => {
  try {
    if (!actorUserId.value) {
      return
    }

    const subjectType = (isTenantMode.value && userStore.currentCompanyId) ? 'COMPANY' : 'USER'
    const subjectId = subjectType === 'COMPANY' ? String(userStore.currentCompanyId) : actorUserId.value

    const access = await BillingOrchestrationService.getPremiumAccess(subjectType as any, subjectId)
    hasPremiumAccess.value = Boolean(access.data?.hasPremiumAccess)
    const resolvedStatus = access.data?.subscriptionStatus || (access.data?.hasPremiumAccess ? 'ACTIVE' : 'NONE')
    subscriptionStatus.value = String(resolvedStatus).toUpperCase()

    const rawPlanId = (access.data as any)?.currentPlanId
      || (access.data as any)?.planId
      || (access.data as any)?.plan
      || (access.data as any)?.planType
    if (isPlanId(rawPlanId)) {
      currentPlan.value = rawPlanId
      currentPlanTier.value = mapPlanIdToTier(rawPlanId)
      currentBillingCycle.value = mapPlanIdToCycle(rawPlanId)
      const shouldResetSelection = selectedPlan.value === '' || selectedPlan.value === lastLoadedPlan.value
      if (shouldResetSelection) {
        selectedPlan.value = currentPlan.value
      }
      lastLoadedPlan.value = currentPlan.value
      return
    }

    currentPlanTier.value = isPlanTier(access.data?.currentPlanTier)
      ? access.data.currentPlanTier
      : ''
    currentBillingCycle.value = isBillingCycle(access.data?.currentBillingCycle)
      ? access.data.currentBillingCycle
      : ''

    if (isPlanTier(currentPlanTier.value) && currentPlanTier.value !== 'FREE' && isBillingCycle(currentBillingCycle.value)) {
      currentPlan.value = mapTierCycleToPlanId(currentPlanTier.value, currentBillingCycle.value)
    } else {
      currentPlan.value = ''
    }

    const shouldResetSelection = selectedPlan.value === '' || selectedPlan.value === lastLoadedPlan.value
    if (shouldResetSelection) {
      selectedPlan.value = currentPlan.value
    }
    lastLoadedPlan.value = currentPlan.value
  } catch (error) {
    console.error('Erro ao carregar detalhes da assinatura:', error);
  }
};

const handlePlanChange = async () => {
  if (!isPlanId(selectedPlan.value)) {
    alert('Plano inválido');
    return;
  }
  if (isPremium.value) {
    await openBillingPortal(selectedPlan.value);
    return;
  }
  await startCheckoutSession();
};

const startCheckoutSession = async () => {
  try {
    if (!actorUserId.value) {
      throw new Error('Usuário não autenticado')
    }

    if (!isPlanId(selectedPlan.value)) {
      throw new Error('Plano inválido')
    }

    const correlationId = createCorrelationId()

    const plan = String(selectedPlan.value)
    const isBusinessPlan = plan.startsWith('BUSINESS_')
    const companyId = userStore.currentCompanyId

    const subjectType = (isTenantMode.value && companyId) ? 'COMPANY' : 'USER'
    const subjectId = subjectType === 'COMPANY' ? String(companyId) : actorUserId.value

    // ADR-001/004: do not call payment-api; do not send PII.
    const decisionResp = await BillingDecisionService.decide(
      {
        plan,
        actor: actorUserId.value,
        subjectType,
        subjectId,
        userId: subjectType === 'USER' ? actorUserId.value : null,
        companyId: subjectType === 'COMPANY' ? String(companyId) : null
      },
      correlationId
    )

    const decision = decisionResp.data

    if (decision.action === 'NOOP_ALREADY_PREMIUM') {
      alert('Você já possui acesso premium.')
      return
    }

    await router.push({
      name: 'checkout',
      query: {
        plan,
        subjectType: decision.subjectType,
        subjectId: decision.subjectId,
        correlationId: decision.correlationId || correlationId
      }
    })
  } catch (error) {
    console.error('Erro ao iniciar sessão de checkout:', error);
    alert('Não foi possível iniciar o checkout. Tente novamente mais tarde.');
  }
};

// Função para abrir o portal de faturamento
const openBillingPortal = async (targetPlan?: PlanId) => {
  try {
    if (!actorUserId.value) throw new Error('Usuário não autenticado')

    const correlationId = createCorrelationId()

    // Prefer company if tenant mode has company selected; else user.
    const subjectType = (isTenantMode.value && userStore.currentCompanyId) ? 'COMPANY' : 'USER'
    const subjectId = subjectType === 'COMPANY' ? String(userStore.currentCompanyId) : actorUserId.value

    const storageKey = `billing.portal.messageId:${correlationId}:${subjectType}:${subjectId}`
    const existingMessageId = sessionStorage.getItem(storageKey)
    const messageId = existingMessageId || createMessageId()
    if (!existingMessageId) sessionStorage.setItem(storageKey, messageId)

    const returnUrl = `${window.location.origin}/#/settings`

    const accepted = await BillingOrchestrationService.openPortal({
      actor: actorUserId.value,
      subjectType: subjectType as any,
      subjectId,
      correlationId,
      messageId,
      returnUrl,
      targetPlan
    })

    const opMessageId = accepted.data?.messageId || messageId
    const portalUrl = await pollPortalUrl(opMessageId)
    if (portalUrl) {
      window.location.href = portalUrl
      return
    }

    alert('Solicitação enviada. O portal de billing ainda está sendo preparado.')
  } catch (error) {
    console.error('Erro ao solicitar portal de faturamento:', error)
    alert('Não foi possível solicitar o portal de faturamento. Tente novamente mais tarde.')
  }
};

const pollPortalUrl = async (messageId: string, maxAttempts = 20, delayMs = 1000): Promise<string | null> => {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      const statusResp = await BillingOrchestrationService.getOperationStatus(messageId)
      const url = statusResp.data?.checkoutUrl
      if (url) {
        return url
      }
      if (statusResp.data?.status === 'FAILED') {
        return null
      }
    } catch (error) {
      // ignore transient errors while polling
    }
    await new Promise((resolve) => setTimeout(resolve, delayMs))
  }
  return null
}

// Função para cancelar a assinatura
const cancelSubscription = async () => {
  try {
    if (!actorUserId.value) throw new Error('Usuário não autenticado')

    const confirmed = confirm('Tem certeza de que deseja cancelar sua assinatura?');
    if (!confirmed) return;

    const correlationId = createCorrelationId()

    const subjectType = (isTenantMode.value && userStore.currentCompanyId) ? 'COMPANY' : 'USER'
    const subjectId = subjectType === 'COMPANY' ? String(userStore.currentCompanyId) : actorUserId.value

    const storageKey = `billing.cancel.messageId:${correlationId}:${subjectType}:${subjectId}`
    const existingMessageId = sessionStorage.getItem(storageKey)
    const messageId = existingMessageId || createMessageId()
    if (!existingMessageId) sessionStorage.setItem(storageKey, messageId)

    await BillingOrchestrationService.cancelSubscription({
      actor: actorUserId.value,
      subjectType: subjectType as any,
      subjectId,
      correlationId,
      messageId
    })

    alert('Solicitação de cancelamento enviada. Você manterá acesso até o final do período vigente (quando aplicável).')
    await loadSubscriptionDetails()
  } catch (error) {
    console.error('Erro ao solicitar cancelamento:', error)
    alert('Não foi possível cancelar a assinatura. Tente novamente mais tarde.')
  }
};

const shouldLoad = computed(() => {
  if (!actorUserId.value) {
    return false;
  }
  if (isTenantMode.value && !userStore.currentCompanyId) {
    return false;
  }
  return true;
});

onMounted(() => {
  if (shouldLoad.value) {
    loadSubscriptionDetails();
  }
});

watch(
  () => [actorUserId.value, userStore.currentCompanyId, isTenantMode.value],
  () => {
    if (shouldLoad.value) {
      loadSubscriptionDetails();
    }
  }
);
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

.plan-group-label {
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #7a7a7a;
  margin: 8px 0 12px;
}

.v-theme--dark .plan-group-label {
  color: #b9b9b9;
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
