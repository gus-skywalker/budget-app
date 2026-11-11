<template>
  <div class="plan-offer">
    <div class="plan-offer__heading">
      <span class="plan-offer__tag">{{ t(`launchOffer.${tier}.tag`) }}</span>
      <h3>{{ t(`launchOffer.${tier}.name`) }}</h3>
      <p class="plan-offer__headline">{{ t(`launchOffer.${tier}.headline`) }}</p>
      <p class="plan-offer__description">{{ t(`launchOffer.${tier}.description`) }}</p>
    </div>

    <p class="plan-offer__price">
      <strong>{{ formatAmount(monthly.amount) }}</strong>
      <span>/ {{ t('launchOffer.perMonth') }}</span>
    </p>

    <section class="plan-offer__promotion" :aria-label="t('launchOffer.promotionLabel')">
      <span class="plan-offer__badge">{{ t('launchOffer.badge', { percent: TEAM_LAUNCH_OFFER.discountPercent }) }}</span>
      <i18n-t keypath="launchOffer.sequence" tag="p" scope="global">
        <template #trial><strong>{{ t('launchOffer.trial') }}</strong></template>
        <template #first><strong>{{ formatAmount(firstPaidAmount) }}</strong></template>
        <template #regular><strong>{{ formatAmount(monthly.amount) }}</strong></template>
      </i18n-t>
    </section>

    <ul class="plan-offer__benefits">
      <li v-for="index in 4" :key="index">
        <v-icon size="18" aria-hidden="true">mdi-check-circle</v-icon>
        <span>{{ t(`launchOffer.${tier}.benefit${index}`) }}</span>
      </li>
    </ul>

    <div class="plan-offer__actions">
      <button class="plan-offer__primary" type="button" @click="emit('select', monthly.id)">
        {{ t(`launchOffer.${tier}.cta`) }}
      </button>
      <p class="plan-offer__conditions">{{ t('launchOffer.conditions') }}</p>

      <details class="plan-offer__annual">
        <summary>{{ t('launchOffer.annualOption') }}</summary>
        <div class="plan-offer__annual-content">
          <strong>{{ formatAmount(annual.amount) }} / {{ t('launchOffer.perYear') }}</strong>
          <p>{{ t('launchOffer.annualBilling', { amount: formatAmount(annual.amount), equivalent: formatAmount(annual.amount / 12) }) }}</p>
          <p>{{ t('launchOffer.annualExclusion', { percent: TEAM_LAUNCH_OFFER.discountPercent }) }}</p>
          <button class="plan-offer__secondary" type="button" @click="emit('select', annual.id)">
            {{ t(`launchOffer.${tier}.annualCta`) }}
          </button>
        </div>
      </details>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { PLAN_DETAILS, type PlanId } from '@/constants/plans'
import { TEAM_LAUNCH_OFFER } from '@/constants/teamLaunchOffer'
import { formatConvertedPriceFromBRL, resolvePricingCurrency } from '@/utils/pricing'

const props = defineProps<{ tier: 'casa' | 'team' }>()
const emit = defineEmits<{ select: [plan: PlanId] }>()
const { t, locale } = useI18n({ useScope: 'global' })
const monthly = computed(() => PLAN_DETAILS[props.tier === 'casa' ? 'MONTHLY' : 'BUSINESS_MONTHLY'])
const annual = computed(() => PLAN_DETAILS[props.tier === 'casa' ? 'ANNUAL' : 'BUSINESS_ANNUAL'])
const firstPaidAmount = computed(() => Math.round(monthly.value.amount * (100 - TEAM_LAUNCH_OFFER.discountPercent)) / 100)
const formatAmount = (amount: number) => formatConvertedPriceFromBRL({
  amountInBRL: amount,
  targetCurrency: resolvePricingCurrency({
    locale: locale.value,
    browserLocale: typeof navigator !== 'undefined' ? navigator.language : null,
  }),
  uiLocale: locale.value,
})
</script>

<style scoped>
.plan-offer {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 22px;
  min-width: 0;
  color: #172033;
}
.plan-offer p, .plan-offer h3 { margin: 0; }
.plan-offer__heading { display: grid; gap: 12px; }
.plan-offer__tag {
  width: fit-content;
  padding: 7px 12px;
  border-radius: 99px;
  background: rgba(32, 95, 99, 0.1);
  color: #173f4b;
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
}
.plan-offer h3 { font-size: 1.5rem; font-weight: 800; }
.plan-offer .plan-offer__headline { font-size: 1.15rem; font-weight: 700; line-height: 1.4; }
.plan-offer .plan-offer__description { color: #536177; line-height: 1.6; }
.plan-offer__price { display: flex; flex-wrap: wrap; align-items: baseline; gap: 6px; }
.plan-offer__price strong { font-size: clamp(1.8rem, 3vw, 2.35rem); line-height: 1.2; }
.plan-offer__price span { font-size: 1rem; color: #536177; }
.plan-offer__promotion {
  display: grid;
  gap: 12px;
  padding: 20px;
  border-radius: 18px;
  background: linear-gradient(135deg, #153f45, #1f646a);
  color: #fffdf7;
}
.plan-offer__promotion p { color: #fffdf7; font-size: 0.95rem; line-height: 1.65; }
.plan-offer .plan-offer__badge { color: #ffe2a0; font-size: 0.8rem; font-weight: 800; }
.plan-offer__benefits { display: grid; gap: 14px; padding: 0; margin: 0; list-style: none; }
.plan-offer__benefits li { display: flex; align-items: flex-start; gap: 10px; line-height: 1.55; }
.plan-offer__benefits .v-icon { flex-shrink: 0; margin-top: 3px; color: #205f63; }
.plan-offer__actions { display: grid; gap: 12px; margin-top: auto; padding-top: 6px; }
.plan-offer__primary, .plan-offer__secondary {
  width: 100%;
  min-height: 48px;
  padding: 12px 18px;
  border: 1px solid transparent;
  border-radius: 99px;
  font: inherit;
  font-weight: 700;
  line-height: 1.4;
  cursor: pointer;
}
.plan-offer__primary { color: #fff; background: linear-gradient(135deg, #a74616, #bc5620); }
.plan-offer__secondary { color: #173f4b; background: transparent; border-color: #8aafb0; }
.plan-offer__primary:focus-visible, .plan-offer__secondary:focus-visible, summary:focus-visible {
  outline: 3px solid #205f63;
  outline-offset: 4px;
}
.plan-offer .plan-offer__conditions { color: #536177; font-size: 0.8rem; line-height: 1.5; text-align: center; }
.plan-offer__annual { border-top: 1px solid rgba(32, 95, 99, 0.2); padding-top: 16px; }
.plan-offer__annual summary { color: #173f4b; font-weight: 700; cursor: pointer; }
.plan-offer__annual-content { display: grid; gap: 12px; padding-top: 16px; }
.plan-offer__annual-content p { font-size: 0.85rem; color: #536177; line-height: 1.5; }
</style>
