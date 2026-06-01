// src/components/SubscriptionManagement.vue
<template>
  <v-row>
    <v-col cols="12" lg="10">
      <!-- Card do Plano Atual -->
      <div class="cb-card mb-6">
        <div class="cb-card__header">
          <h2 class="cb-card__title">
            <v-icon color="var(--cb-primary)" class="mr-2">mdi-crown</v-icon>
            {{ t('subscription_management.current_plan') }}
          </h2>
          <p class="card-description">{{ t('subscription_management.title') }}</p>
        </div>
        <div class="cb-card__body">
          <v-alert type="info" variant="tonal" class="mb-4">
            {{ t('subscription_management.global_billing_notice') }}
          </v-alert>
          <div class="subscription-overview">
            <div class="subscription-info-grid">
              <div class="info-item">
                <div class="info-label">
                  <v-icon size="20" color="var(--cb-primary)">mdi-package-variant</v-icon>
                  {{ t('subscription_management.plan_label') }}
                </div>
                <div class="info-value">{{ currentPlanText }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">
                  <v-icon size="20" color="var(--cb-primary)">mdi-check-circle</v-icon>
                  {{ t('subscription_management.status') }}
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
            <v-alert
              v-if="isTrialing"
              type="info"
              variant="tonal"
              class="trial-alert mt-4"
            >
              <div class="trial-alert__title">{{ t('subscription_management.trial_active_title') }}</div>
              <div>
                {{ trialStatusMessage }}
              </div>
            </v-alert>
            <v-alert
              v-if="paymentSyncDegraded"
              type="warning"
              variant="tonal"
              class="trial-alert mt-4"
            >
              <div class="trial-alert__title">{{ t('subscription_management.payment_sync_unavailable_title') }}</div>
              <div>
                {{ t('subscription_management.payment_sync_unavailable_body') }}
              </div>
            </v-alert>
            <div v-if="hasWorkspaceQuota && workspaceQuota" class="workspace-quota mt-4">
              <div class="workspace-quota__header">
                <div class="trial-alert__title">{{ t('subscription_management.workspace_quota_title') }}</div>
                <div class="workspace-quota__description">
                  {{ t('subscription_management.workspace_quota_description') }}
                </div>
              </div>
              <v-alert
                v-if="!workspaceQuota.hasBillingAccount"
                type="info"
                variant="tonal"
                class="mt-3"
              >
                <div class="trial-alert__title">{{ t('subscription_management.workspace_quota_unlinked_title') }}</div>
                <div>
                  {{ t('subscription_management.workspace_quota_unlinked_body') }}
                </div>
              </v-alert>
              <div class="subscription-info-grid mt-4">
                <div class="info-item">
                  <div class="info-label">
                    <v-icon size="20" color="var(--cb-primary)">mdi-view-grid</v-icon>
                    {{ t('subscription_management.active_workspaces_label') }}
                  </div>
                  <div class="info-value">{{ workspaceQuota.activeWorkspaceCount }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">
                    <v-icon size="20" color="var(--cb-primary)">mdi-account-multiple</v-icon>
                    {{ t('subscription_management.collaborative_workspaces_label') }}
                  </div>
                  <div class="info-value">{{ workspaceQuota.activeCollaborativeWorkspaceCount }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">
                    <v-icon size="20" color="var(--cb-primary)">mdi-account</v-icon>
                    {{ t('subscription_management.personal_workspaces_label') }}
                  </div>
                  <div class="info-value">{{ workspaceQuota.activePersonalWorkspaceCount }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Card de Mudança de Plano -->
      <div class="cb-card mb-6">
        <div class="cb-card__header">
          <div class="cb-card__header card-header-row">
            <div>
              <h2 class="cb-card__title">
                <v-icon color="var(--cb-primary)" class="mr-2">mdi-swap-horizontal</v-icon>
                {{ t('subscription_management.change_plan_title') }}
              </h2>
              <p class="card-description">{{ t('subscription_management.change_plan_instructions') }}</p>
            </div>
            <v-btn
              variant="text"
              size="small"
              color="var(--cb-primary)"
              class="details-btn"
              @click="openPlanDetails"
            >
              <v-icon start size="small">mdi-information-outline</v-icon>
              {{ t('subscription_management.details') }}
            </v-btn>
          </div>
        </div>
        <div class="cb-card__body">
          <v-radio-group v-model="selectedPlan" class="plan-radio-group">
            <div v-if="isTenantMode" class="plan-group-label">{{ t('subscription_management.starter_group') }}</div>
            <div class="plan-option" :class="{ 'disabled': currentPlan === 'MONTHLY' }">
              <v-radio 
                :label="t('subscription_management.starter_monthly_name')"
                value="MONTHLY"
                :disabled="currentPlan === 'MONTHLY'"
                color="var(--cb-primary)"
              >
                <template v-slot:label>
                  <div class="plan-label">
                    <div class="plan-name">
                      <v-icon class="mr-2">mdi-calendar-month</v-icon>
                      {{ t('subscription_management.starter_monthly_name') }}
                    </div>
                    <div class="plan-price">{{ formatPlanPrice(plans.MONTHLY) }}</div>
                    <div class="plan-description">{{ t('subscription_management.billed_monthly') }}</div>
                  </div>
                </template>
              </v-radio>
              <v-chip 
                v-if="currentPlan === 'MONTHLY'" 
                size="small" 
                color="var(--cb-primary)"
                class="current-badge"
              >
                {{ t('subscription_management.current') }}
              </v-chip>
            </div>
            <v-divider class="my-4"></v-divider>
            <div class="plan-option" :class="{ 'disabled': currentPlan === 'ANNUAL' }">
              <v-radio 
                :label="t('subscription_management.starter_annual_name')"
                value="ANNUAL"
                :disabled="currentPlan === 'ANNUAL'"
                color="var(--cb-primary)"
              >
                <template v-slot:label>
                  <div class="plan-label">
                      <div class="plan-name">
                        <v-icon class="mr-2">mdi-calendar-check</v-icon>
                        {{ t('subscription_management.starter_annual_name') }}
                      <v-chip size="x-small" color="success" class="ml-2">{{ t('subscription_management.save_badge') }}</v-chip>
                      </div>
                    <div class="plan-price">{{ formatPlanPrice(plans.ANNUAL) }}</div>
                    <div class="plan-description">
                      <span class="plan-strike">{{ t('subscription_management.from_year', { amount: formatAmount(annualOriginal(plans.MONTHLY.amount)) }) }}</span>
                      <span class="plan-badge">{{ t('subscription_management.save_percent', { percent: discountPercent(plans.MONTHLY.amount, plans.ANNUAL.amount) }) }}</span>
                    </div>
                    <div class="plan-description">{{ t('subscription_management.per_month_billed_annually', { amount: formatAmount(plans.ANNUAL.amount / 12) }) }}</div>
                  </div>
                </template>
              </v-radio>
              <v-chip 
                v-if="currentPlan === 'ANNUAL'" 
                size="small" 
                color="var(--cb-primary)"
                class="current-badge"
              >
                {{ t('subscription_management.current') }}
              </v-chip>
            </div>

            <template v-if="isTenantMode">
              <v-divider class="my-6"></v-divider>
              <div class="plan-group-label">{{ t('subscription_management.team_group') }}</div>
              <div class="plan-option" :class="{ 'disabled': currentPlan === 'BUSINESS_MONTHLY' }">
                <v-radio 
                  :label="t('subscription_management.team_monthly_name')" 
                  value="BUSINESS_MONTHLY"
                  :disabled="currentPlan === 'BUSINESS_MONTHLY'"
                  color="var(--cb-primary)"
                >
                  <template v-slot:label>
                    <div class="plan-label">
                      <div class="plan-name">
                        <v-icon class="mr-2">mdi-domain</v-icon>
                        {{ t('subscription_management.team_monthly_name') }}
                      </div>
                      <div class="plan-price">{{ formatPlanPrice(plans.BUSINESS_MONTHLY) }}</div>
                      <div class="plan-description">{{ t('subscription_management.billed_monthly') }}</div>
                    </div>
                  </template>
                </v-radio>
                <v-chip 
                  v-if="currentPlan === 'BUSINESS_MONTHLY'" 
                  size="small" 
                  color="var(--cb-primary)"
                  class="current-badge"
                >
                  {{ t('subscription_management.current') }}
                </v-chip>
              </div>
              <v-divider class="my-4"></v-divider>
              <div class="plan-option" :class="{ 'disabled': currentPlan === 'BUSINESS_ANNUAL' }">
                <v-radio 
                  :label="t('subscription_management.team_annual_name')" 
                  value="BUSINESS_ANNUAL"
                  :disabled="currentPlan === 'BUSINESS_ANNUAL'"
                  color="var(--cb-primary)"
                >
                  <template v-slot:label>
                    <div class="plan-label">
                      <div class="plan-name">
                        <v-icon class="mr-2">mdi-domain</v-icon>
                        {{ t('subscription_management.team_annual_name') }}
                        <v-chip size="x-small" color="success" class="ml-2">{{ t('subscription_management.save_badge') }}</v-chip>
                      </div>
                      <div class="plan-price">{{ formatPlanPrice(plans.BUSINESS_ANNUAL) }}</div>
                      <div class="plan-description">
                        <span class="plan-strike">{{ t('subscription_management.from_year', { amount: formatAmount(annualOriginal(plans.BUSINESS_MONTHLY.amount)) }) }}</span>
                        <span class="plan-badge">{{ t('subscription_management.save_percent', { percent: discountPercent(plans.BUSINESS_MONTHLY.amount, plans.BUSINESS_ANNUAL.amount) }) }}</span>
                      </div>
                      <div class="plan-description">{{ t('subscription_management.per_month_billed_annually', { amount: formatAmount(plans.BUSINESS_ANNUAL.amount / 12) }) }}</div>
                    </div>
                  </template>
                </v-radio>
                <v-chip 
                  v-if="currentPlan === 'BUSINESS_ANNUAL'" 
                  size="small" 
                  color="var(--cb-primary)"
                  class="current-badge"
                >
                  {{ t('subscription_management.current') }}
                </v-chip>
              </div>
            </template>
          </v-radio-group>

          <div class="action-buttons">
            <!-- Botão de mudança de plano -->
            <v-btn 
              v-if="selectedPlan && currentPlan !== selectedPlan" 
              @click="handlePlanChange"
              color="var(--cb-primary)" class="mb-3"
              size="large"
              block
              :disabled="paymentSyncDegraded"
            >
              <v-icon left>mdi-swap-horizontal</v-icon>
              {{ changePlanActionText }}
            </v-btn>

            <!-- Botão para desselecionar e voltar -->
            <v-btn 
              v-if="selectedPlan && currentPlan !== selectedPlan" 
              @click="selectedPlan = currentPlan"
              variant="text"
              color="var(--cb-primary)"
              class="mb-3"
              size="large"
              block
            >
              <v-icon left>mdi-close</v-icon>
              {{ t('subscription_management.cancel_change') }}
            </v-btn>

            <!-- Botão para gerenciar assinatura (sempre visível se não houver mudança pendente) -->
            <v-btn 
              v-if="(!selectedPlan || currentPlan === selectedPlan) && isPremium"
              @click="openBillingPortal"
              variant="outlined"
              color="var(--cb-primary)"
             
              size="large"
              block
              :disabled="paymentSyncDegraded"
            >
              <v-icon left>mdi-cog</v-icon>
              {{ t('subscription_management.manage_subscription') }}
            </v-btn>
          </div>
        </div>
      </div>

      <v-dialog v-model="showPlanDetails" max-width="720">
        <v-card class="details-card">
          <v-card-title class="details-title">
            {{ t('subscription_management.plan_details_title') }}
          </v-card-title>
          <v-card-text>
            <div class="details-grid">
              <div class="details-col">
                <div class="details-tag starter-tag">{{ t('subscription_management.starter_group') }}</div>
                <div class="details-price">
                  <div class="details-price-row">{{ t('subscription_management.monthly_label') }}: {{ formatPlanPrice(plans.MONTHLY) }}</div>
                  <div class="details-price-row">
                    {{ t('subscription_management.annual_label') }}: {{ formatPlanPrice(plans.ANNUAL) }}
                    <span class="plan-strike ml-1">{{ t('subscription_management.from_year', { amount: formatAmount(annualOriginal(plans.MONTHLY.amount)) }) }}</span>
                    <span class="plan-badge ml-2">{{ t('subscription_management.save_percent', { percent: discountPercent(plans.MONTHLY.amount, plans.ANNUAL.amount) }) }}</span>
                  </div>
                </div>
                <ul class="details-list">
                  <li>{{ t('subscription_management.starter_feature_1') }}</li>
                  <li>{{ t('subscription_management.starter_feature_2') }}</li>
                  <li>{{ t('subscription_management.starter_feature_3') }}</li>
                  <li>{{ t('subscription_management.starter_feature_4') }}</li>
                  <li>{{ t('subscription_management.starter_feature_5') }}</li>
                </ul>
              </div>
              <div class="details-col">
                <div class="details-tag team-tag">{{ t('subscription_management.team_group') }}</div>
                <div class="details-price">
                  <div class="details-price-row">{{ t('subscription_management.monthly_label') }}: {{ formatPlanPrice(plans.BUSINESS_MONTHLY) }}</div>
                  <div class="details-price-row">
                    {{ t('subscription_management.annual_label') }}: {{ formatPlanPrice(plans.BUSINESS_ANNUAL) }}
                    <span class="plan-strike ml-1">{{ t('subscription_management.from_year', { amount: formatAmount(annualOriginal(plans.BUSINESS_MONTHLY.amount)) }) }}</span>
                    <span class="plan-badge ml-2">{{ t('subscription_management.save_percent', { percent: discountPercent(plans.BUSINESS_MONTHLY.amount, plans.BUSINESS_ANNUAL.amount) }) }}</span>
                  </div>
                </div>
                <ul class="details-list">
                  <li>{{ t('subscription_management.team_feature_1') }}</li>
                  <li>{{ t('subscription_management.team_feature_2') }}</li>
                  <li>{{ t('subscription_management.team_feature_3') }}</li>
                  <li>{{ t('subscription_management.team_feature_4') }}</li>
                  <li>{{ t('subscription_management.team_feature_5') }}</li>
                  <li>{{ t('subscription_management.team_feature_6') }}</li>
                </ul>
              </div>
            </div>
          </v-card-text>
          <v-card-actions class="justify-end">
            <v-btn variant="text" color="var(--cb-primary)" @click="showPlanDetails = false">
              {{ t('common.close') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Card de Cancelamento -->
      <div v-if="subscriptionStatus === 'ACTIVE' || subscriptionStatus === 'TRIALING'" class="cb-card cancel-card">
        <div class="cb-card__header">
          <h2 class="cb-card__title">
            <v-icon color="#f44336" class="mr-2">mdi-alert-circle</v-icon>
            {{ t('subscription_management.danger_zone_title') }}
          </h2>
          <p class="card-description">{{ t('subscription_management.danger_zone_desc') }}</p>
        </div>
        <div class="cb-card__body">
          <div class="cancel-section">
            <div class="cancel-info">
              <div class="cancel-label">{{ t('subscription_management.cancel_subscription_label') }}</div>
              <div class="cancel-hint">{{ t('subscription_management.cancel_subscription_hint') }}</div>
            </div>
            <v-btn 
              @click="cancelSubscription"
              color="error"
              variant="outlined"
             
              :disabled="paymentSyncDegraded"
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
import {
  requireActiveWorkspaceContext,
  resolveAnyWorkspaceContext,
  saveBillingCheckoutContext,
} from '@/services/BillingWorkspaceContext'
import { createCorrelationId } from '@/utils/correlation'
import { PLAN_DETAILS, type PlanId } from '@/constants/plans';
import { buildBillingPricingContext, formatConvertedPriceFromBRL, resolvePricingCurrency } from '@/utils/pricing'
import { createMessageId } from '@/utils/messageId'

// Provide typed translation function for template (instead of relying on this.$t)
const { t, locale } = useI18n()

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
type BillingAccessWorkspaceQuota = {
  hasBillingAccount: boolean
  activeWorkspaceCount: number
  activeCollaborativeWorkspaceCount: number
  activePersonalWorkspaceCount: number
}

const currentPlan = ref<MaybePlanId>('');
const currentPlanTier = ref<PlanTier>('');
const currentBillingCycle = ref<BillingCycleUi>('');
const subscriptionStatus = ref('');
const trialEndsAt = ref('');
const nextBillingDate = ref('');
const paymentProviderReachable = ref(true);
const subscriptionDataSource = ref<'LOCAL' | 'PAYMENT_API' | 'LOCAL_FALLBACK'>('LOCAL');
const workspaceQuota = ref<BillingAccessWorkspaceQuota | null>(null)
const billingAccountId = ref<string | null>(null)
const selectedPlan = ref<MaybePlanId>(''); // Para atualizar o plano
const hasPremiumAccess = ref(false);
const lastLoadedPlan = ref<MaybePlanId>('');
const showPlanDetails = ref(false);

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

const getPricingCurrency = () => {
  const browserLocale = typeof navigator !== 'undefined' ? navigator.language : null
  return resolvePricingCurrency({
    locale: locale.value,
    browserLocale
  })
}

const getBillingContext = () => buildBillingPricingContext({
  uiLocale: locale.value,
  browserLocale: typeof navigator !== 'undefined' ? navigator.language : null
})

const formatAmount = (amount: number) => formatConvertedPriceFromBRL({
  amountInBRL: amount,
  targetCurrency: getPricingCurrency(),
  uiLocale: locale.value
});

const formatPlanPrice = (plan: { amount: number; billingPeriod: 'month' | 'year' }) => {
  const periodLabel = t(plan.billingPeriod === 'year' ? 'landingPage.plans.perYear' : 'landingPage.plans.perMonth')
  return `${formatAmount(plan.amount)} / ${periodLabel}`
}
const annualOriginal = (monthlyAmount: number) => monthlyAmount * 12;
const discountPercent = (monthlyAmount: number, annualAmount: number) => {
  if (!monthlyAmount || !annualAmount) return '0%';
  const full = monthlyAmount * 12;
  const pct = Math.round(((full - annualAmount) / full) * 100);
  return `${pct}%`;
};

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
  return `${t(`subscription_management.tiers.${tier.toLowerCase()}`)} ${t(`subscription_management.cycles.${cycle.toLowerCase()}`)}`;
};

const mapTierToLabel = (tier: Exclude<PlanTier, ''>) => {
  return t(`subscription_management.tiers.${tier.toLowerCase()}`)
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
    return t('subscription_management.tiers.free');
});

const selectedPlanText = computed(() => {
  if (isPlanId(selectedPlan.value)) {
    return mapTierCycleToLabel(mapPlanIdToTier(selectedPlan.value), mapPlanIdToCycle(selectedPlan.value));
  }
  return '';
});

const statusText = computed(() => {
    switch (subscriptionStatus.value) {
        case 'TRIALING':
      return t('subscription_management.statuses.trialing');
        case 'ACTIVE':
      return t('subscription_management.statuses.active');
        case 'INCOMPLETE':
      return t('subscription_management.statuses.incomplete');
        case 'PAST_DUE':
      return t('subscription_management.statuses.past_due');
        case 'CANCELED':
      return t('subscription_management.statuses.canceled');
        case 'NONE':
        default:
      return t('subscription_management.statuses.inactive');
    }
});

const statusColor = computed(() => {
    switch (subscriptionStatus.value) {
        case 'TRIALING':
            return 'info';
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
        case 'TRIALING':
            return 'mdi-timer-sand';
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
  return hasPremiumAccess.value || subscriptionStatus.value === 'ACTIVE' || subscriptionStatus.value === 'TRIALING';
});

const isTrialing = computed(() => subscriptionStatus.value === 'TRIALING');
const paymentSyncDegraded = computed(() => subscriptionDataSource.value === 'LOCAL_FALLBACK' || !paymentProviderReachable.value);
const hasWorkspaceQuota = computed(() => Boolean(workspaceQuota.value))

const formatDateTime = (value: string) => {
  if (!value) return ''
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return ''
  const localeMap: Record<string, string> = {
    en: 'en-US',
    pt: 'pt-BR',
    es: 'es-ES',
    fr: 'fr-FR'
  }
  const resolvedLocale = localeMap[String(locale.value || 'pt')] || 'pt-BR'
  return new Intl.DateTimeFormat(resolvedLocale, {
    dateStyle: 'medium'
  }).format(parsed)
}

const trialStatusMessage = computed(() => {
  if (trialEndsAt.value) {
    return t('subscription_management.trial_active_until', {
      date: formatDateTime(trialEndsAt.value)
    })
  }
  if (nextBillingDate.value) {
    return t('subscription_management.trial_billing_after', {
      date: formatDateTime(nextBillingDate.value)
    })
  }
  return t('subscription_management.trial_active_generic')
})

const changePlanActionText = computed(() => {
  const base = t('subscription_management.change_to', { plan: selectedPlanText.value });
  if (!isPremium.value) {
    return base;
  }
  return `${base} (Portal)`;
});

const loadSubscriptionDetails = async () => {
  try {
    const workspaceContext = resolveAnyWorkspaceContext(userStore)
    if (!actorUserId.value || !workspaceContext) {
      return
    }

    const access = await BillingOrchestrationService.getBillingSummary(workspaceContext.workspaceId)
    billingAccountId.value = access.data?.billingAccountId || null
    hasPremiumAccess.value = Boolean(access.data?.hasPremiumAccess)
    const resolvedStatus = access.data?.subscriptionStatus || (access.data?.hasPremiumAccess ? 'ACTIVE' : 'NONE')
    subscriptionStatus.value = String(resolvedStatus).toUpperCase()
    trialEndsAt.value = String(access.data?.trialEndsAt || '')
    nextBillingDate.value = String(access.data?.nextBillingDate || '')
    paymentProviderReachable.value = access.data?.paymentProviderReachable !== false
    subscriptionDataSource.value = access.data?.subscriptionDataSource || 'LOCAL'
    workspaceQuota.value = access.data?.workspaceQuota
      ? {
          hasBillingAccount: Boolean(access.data.workspaceQuota.hasBillingAccount),
          activeWorkspaceCount: Number(access.data.workspaceQuota.activeWorkspaceCount || 0),
          activeCollaborativeWorkspaceCount: Number(access.data.workspaceQuota.activeCollaborativeWorkspaceCount || 0),
          activePersonalWorkspaceCount: Number(access.data.workspaceQuota.activePersonalWorkspaceCount || 0)
        }
      : null

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
    workspaceQuota.value = null
    console.error(t('subscription_management.error_load_details'), error);
  }
};

const handlePlanChange = async () => {
  if (paymentSyncDegraded.value) {
    alert(t('subscription_management.payment_sync_actions_disabled'))
    return
  }
  if (!isPlanId(selectedPlan.value)) {
    alert(t('subscription_management.error_invalid_plan'));
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
      alert(t('subscription_management.error_checkout_later'))
      return
    }

    if (!isPlanId(selectedPlan.value)) {
      alert(t('subscription_management.error_invalid_plan'))
      return
    }

    const correlationId = createCorrelationId()

    const plan = String(selectedPlan.value)
    const workspaceContext = requireActiveWorkspaceContext(userStore)

    const decisionResp = await BillingDecisionService.decide(
      {
        plan,
        actor: actorUserId.value,
        billingAccountId: billingAccountId.value,
        ...getBillingContext()
      },
      correlationId
    )

    const decision = decisionResp.data

    if (decision.action === 'NOOP_ALREADY_PREMIUM') {
      alert(t('subscription_management.already_premium'))
      await loadSubscriptionDetails()
      return
    }

    saveBillingCheckoutContext({
      workspaceId: workspaceContext.workspaceId,
      workspaceName: workspaceContext.workspaceName,
      billingAccountId: decision.billingAccountId || billingAccountId.value,
      plan,
      correlationId: decision.correlationId || correlationId,
    })

    await router.push({
      name: 'checkout',
      query: {
        plan,
        correlationId: decision.correlationId || correlationId
      }
    })
  } catch (error) {
    console.error(t('subscription_management.error_start_checkout'), error);
    alert(t('subscription_management.error_checkout_later'));
  }
};

// Função para abrir o portal de faturamento
const openBillingPortal = async (targetPlan?: PlanId) => {
  try {
    if (!actorUserId.value) {
      alert(t('subscription_management.error_portal_later'))
      return
    }
    if (paymentSyncDegraded.value) {
      alert(t('subscription_management.payment_sync_actions_disabled'))
      return
    }

    const correlationId = createCorrelationId()

    const workspaceContext = requireActiveWorkspaceContext(userStore)

    const storageKey = `billing.portal.messageId:${correlationId}:${workspaceContext.workspaceId}`
    const existingMessageId = sessionStorage.getItem(storageKey)
    const messageId = existingMessageId || createMessageId()
    if (!existingMessageId) sessionStorage.setItem(storageKey, messageId)

    const returnUrl = `${window.location.origin}/settings`

    const payload: any = {
      actor: actorUserId.value,
      billingAccountId: billingAccountId.value,
      correlationId,
      messageId,
      returnUrl,
      ...getBillingContext()
    }
    if (targetPlan && isPlanId(targetPlan)) {
      payload.targetPlan = targetPlan
    }

    const accepted = await BillingOrchestrationService.openPortal(payload)

    const opMessageId = accepted.data?.messageId || messageId
    const portalResult = await pollPortalUrl(opMessageId)
    if (portalResult.url) {
      window.location.href = portalResult.url
      return
    }

    const errorMsg = portalResult.lastError
      ? t('subscription_management.portal_unavailable', { error: portalResult.lastError })
      : t('subscription_management.portal_preparing')
    alert(errorMsg)
  } catch (error) {
    console.error(t('subscription_management.error_request_portal'), error)
    const apiError = (error as any)?.response?.data?.error
    alert(apiError ? t('subscription_management.error_open_portal', { error: apiError }) : t('subscription_management.error_portal_later'))
  }
};

const openPlanDetails = () => {
  showPlanDetails.value = true;
  try {
    const workspaceContext = resolveAnyWorkspaceContext(userStore)
    window.dispatchEvent(
      new CustomEvent('billing:plan-details-opened', {
        detail: {
          workspaceId: workspaceContext?.workspaceId || null,
          currentPlan: currentPlan.value || currentPlanTier.value || 'FREE'
        }
      })
    );
  } catch (e) {
    // no-op
  }
};

const pollPortalUrl = async (
  messageId: string,
  maxAttempts = 20,
  delayMs = 1000
): Promise<{ url: string | null; lastError: string | null }> => {
  let lastError: string | null = null
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      const statusResp = await BillingOrchestrationService.getOperationStatus(messageId)
      const url = statusResp.data?.redirectUrl
      if (url) {
        return { url, lastError: null }
      }
      if (statusResp.data?.status === 'FAILED') {
        lastError = statusResp.data?.lastError || lastError
        return { url: null, lastError }
      }
    } catch (error) {
      const apiError = (error as any)?.response?.data?.error
      if (apiError) {
        lastError = apiError
      }
    }
    await new Promise((resolve) => setTimeout(resolve, delayMs))
  }
  return { url: null, lastError }
}

// Função para cancelar a assinatura
const cancelSubscription = async () => {
  try {
    if (!actorUserId.value) {
      alert(t('subscription_management.error_cancel_later'))
      return
    }
    if (paymentSyncDegraded.value) {
      alert(t('subscription_management.payment_sync_actions_disabled'))
      return
    }

    const confirmed = confirm(t('subscription_management.cancel_confirm'));
    if (!confirmed) return;

    const correlationId = createCorrelationId()

    const workspaceContext = requireActiveWorkspaceContext(userStore)

    const storageKey = `billing.cancel.messageId:${correlationId}:${workspaceContext.workspaceId}`
    const existingMessageId = sessionStorage.getItem(storageKey)
    const messageId = existingMessageId || createMessageId()
    if (!existingMessageId) sessionStorage.setItem(storageKey, messageId)

    await BillingOrchestrationService.cancelSubscription({
      actor: actorUserId.value,
      billingAccountId: billingAccountId.value,
      correlationId,
      messageId
    })

    alert(t('subscription_management.cancel_requested'))
    await loadSubscriptionDetails()
  } catch (error) {
    console.error(t('subscription_management.error_cancel_request'), error)
    alert(t('subscription_management.error_cancel_later'))
  }
};

const shouldLoad = computed(() => {
  return Boolean(actorUserId.value && resolveAnyWorkspaceContext(userStore));
});

onMounted(() => {
  if (shouldLoad.value) {
    loadSubscriptionDetails();
  }
});

watch(
  () => [actorUserId.value, userStore.getCurrentWorkspaceId, isTenantMode.value],
  () => {
    if (shouldLoad.value) {
      loadSubscriptionDetails();
    }
  }
);
</script>

<style scoped>
.card-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.card-description {
  color: var(--cb-ink-muted);
  margin: 8px 0 0;
  font-size: 0.95rem;
}

/* Subscription Overview */
.subscription-overview {
  background: var(--cb-surface-soft);
  border-radius: 12px;
  padding: 20px;
}

.workspace-quota__description {
  margin-top: 6px;
  color: var(--cb-ink-muted);
  font-size: 0.9rem;
}

.subscription-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
}

.info-item  { display: flex; flex-direction: column; gap: 8px; }
.info-label { font-size: 0.875rem; color: var(--cb-ink-muted); font-weight: 500; display: flex; align-items: center; gap: 6px; }
.info-value { font-size: 1.25rem; font-weight: 600; color: var(--cb-ink); }

/* Plan Options */
.plan-radio-group { margin-top: 8px; }

.plan-option {
  padding: 16px;
  border-radius: 12px;
  background: color-mix(in srgb, var(--cb-primary) 3%, transparent);
  transition: all 0.3s ease;
  position: relative;
}

.plan-option:hover:not(.disabled) {
  background: color-mix(in srgb, var(--cb-primary) 8%, transparent);
  transform: translateX(4px);
}

.plan-option.disabled {
  opacity: 0.6;
  background: rgba(0, 0, 0, 0.02);
}

.plan-label   { display: flex; flex-direction: column; gap: 4px; width: 100%; }
.plan-name    { font-size: 1.1rem; font-weight: 600; color: var(--cb-ink); display: flex; align-items: center; }
.plan-price   { font-size: 1.5rem; font-weight: 700; color: var(--cb-primary); margin-top: 4px; }
.plan-description { font-size: 0.875rem; color: var(--cb-ink-muted); }

.plan-strike { text-decoration: line-through; color: #9aa5b1; margin-right: 6px; }

.plan-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #0f6b3f;
  background: rgba(34, 197, 94, 0.16);
}

.plan-group-label {
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #7a7a7a;
  margin: 8px 0 12px;
}

.current-badge { position: absolute; top: 16px; right: 16px; }

/* Details panel */
.details-card  { border-radius: 16px; }
.details-title { font-weight: 600; }
.details-grid  { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; }
.details-col   { background: #f8f9fb; border-radius: 12px; padding: 16px; }

.details-tag {
  display: inline-flex;
  align-items: center;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 4px 8px;
  border-radius: 8px;
  margin-bottom: 10px;
}

.starter-tag  { background: rgba(243, 156, 18, 0.15); color: #b06a0c; }
.team-tag     { background: rgba(142, 68, 173, 0.15); color: #5b2c6f; }
.details-price { font-size: 0.95rem; color: #334155; margin-bottom: 10px; }
.details-price-row + .details-price-row { margin-top: 6px; }
.details-list  { list-style: none; padding: 0; margin: 0; color: #475569; font-size: 0.9rem; }
.details-list li + li { margin-top: 6px; }
.details-btn   { white-space: nowrap; }

/* Action Buttons */
.action-buttons { margin-top: 24px; }

/* Cancel Card */
.cancel-card  { border: 2px solid rgba(244, 67, 54, 0.2); }

.cancel-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.cancel-info  { flex: 1; min-width: 250px; }
.cancel-label { font-size: 1.1rem; font-weight: 600; color: #f44336; margin-bottom: 4px; }
.cancel-hint  { font-size: 0.875rem; color: var(--cb-ink-muted); }

/* Responsive */
@media (max-width: 600px) {
  .subscription-info-grid { grid-template-columns: 1fr; }
  .plan-price             { font-size: 1.25rem; }
  .cancel-section         { flex-direction: column; align-items: stretch; }
  .current-badge          { position: static; margin-top: 8px; align-self: flex-start; }
}
</style>
