<template>
  <div class="cb-page decision-start" :class="{ 'decision-start--light': !theme.global.current.value.dark }">
    <div class="cb-container decision-start__container">
      <nav class="decision-start__nav" :aria-label="t('decisionJourney.navigation')">
        <router-link :to="{ name: 'decisions' }"><v-icon size="18" aria-hidden="true">mdi-arrow-left</v-icon> {{ t('decisionJourney.back') }}</router-link>
        <span class="decision-start__eyebrow">{{ t('decisionJourney.eyebrow') }}</span>
      </nav>
      <page-header :title="t('decisionJourney.title')" :meta="t('decisionJourney.subtitle')" />
      <p class="decision-start__promise"><v-icon size="18" aria-hidden="true">mdi-shield-check-outline</v-icon>{{ t('decisionJourney.promise') }}</p>
      <p v-if="!userStore.canWrite" class="decision-start__notice" role="status">{{ t('decisionJourney.readOnly') }}</p>

      <section :aria-label="t('decisionJourney.choices')" class="decision-start__choices">
        <button v-for="intent in primaryIntents" :key="intent.id" type="button"
          :data-intent="intent.id" class="intent-card" :class="{ 'intent-card--featured': intent.id === 'monthly-change' }"
          :aria-disabled="Boolean(blockedReason(intent))" :aria-describedby="`intent-${intent.id}-description`"
          @click="choose(intent)">
          <span class="intent-card__top"><v-icon class="intent-card__icon" size="28" aria-hidden="true">{{ intent.icon }}</v-icon><v-icon size="22" aria-hidden="true">{{ blockedReason(intent) ? 'mdi-lock-outline' : 'mdi-arrow-top-right' }}</v-icon></span>
          <span class="intent-card__title">{{ t(intentKey(intent, 'title')) }}</span>
          <span :id="`intent-${intent.id}-description`" class="intent-card__description">{{ t(intentKey(intent, 'description')) }}</span>
          <span class="intent-card__action">{{ t(blockedReason(intent) || 'decisionJourney.continue') }}<v-icon v-if="!blockedReason(intent)" size="18" aria-hidden="true">mdi-arrow-right</v-icon></span>
        </button>
      </section>
      <div v-if="userStore.canWrite" class="decision-start__access" aria-live="polite" :aria-busy="accessState === 'loading'">
        <p v-if="accessState === 'loading'">{{ t('decisionJourney.checking') }}</p>
        <template v-else-if="accessState === 'error'">
          <p>{{ t('decisionJourney.accessError') }}</p>
          <v-btn variant="text" class="decision-start__retry" @click="loadAccess">{{ t('decisionJourney.retry') }}</v-btn>
        </template>
        <p v-else-if="accessState === 'denied'">{{ t('decisionJourney.unavailable') }}</p>
      </div>
      <section class="decision-start__support" aria-labelledby="decision-support-title">
        <h2 id="decision-support-title">{{ t('decisionJourney.supportTitle') }}</h2>
        <div class="decision-start__support-links">
          <router-link v-for="intent in supportIntents" :key="intent.id" :to="decisionDestination(intent.id)" :data-intent="intent.id" class="support-link">
            <v-icon size="24" aria-hidden="true">{{ intent.icon }}</v-icon>
            <span><strong>{{ t(intentKey(intent, 'title')) }}</strong><span>{{ t(intentKey(intent, 'description')) }}</span></span>
            <v-icon size="20" aria-hidden="true">mdi-arrow-right</v-icon>
          </router-link>
        </div>
      </section>
      <p class="decision-start__footer">{{ t('decisionJourney.footer') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onScopeDispose, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useTheme } from 'vuetify'
import PageHeader from '@/components/PageHeader.vue'
import { useUserStore } from '@/plugins/userStore'
import BillingOrchestrationService from '@/services/BillingOrchestrationService'
import { advancedDecisionAccess, decisionDestination, decisionIntents, intentKey, type DecisionIntent } from '@/utils/decisionJourney'

const { t } = useI18n()
const router = useRouter()
const theme = useTheme()
const userStore = useUserStore()
const primaryIntents = decisionIntents.filter(intent => intent.group === 'primary')
const supportIntents = decisionIntents.filter(intent => intent.group === 'support')
const accessState = ref<'loading' | 'allowed' | 'denied' | 'error'>('loading')
let generation = 0

async function loadAccess() {
  const request = ++generation
  accessState.value = 'loading'
  const workspaceId = userStore.getCurrentWorkspaceId
  if (!workspaceId || !userStore.isAuthenticated) { accessState.value = 'error'; return }
  try {
    const { data } = await BillingOrchestrationService.getBillingSummary(workspaceId)
    if (generation !== request) return
    const allowed = advancedDecisionAccess(data)
    accessState.value = allowed === null ? 'error' : allowed ? 'allowed' : 'denied'
  } catch {
    if (generation === request) accessState.value = 'error'
  }
}
function blockedReason(intent: DecisionIntent) {
  if (intent.requiresWrite && !userStore.canWrite) return 'decisionJourney.noPermission'
  if (!intent.advanced || accessState.value === 'allowed') return ''
  return accessState.value === 'loading' ? 'decisionJourney.checking'
    : accessState.value === 'denied' ? 'decisionJourney.planUnavailable' : 'decisionJourney.accessUnknown'
}
function choose(intent: DecisionIntent) {
  if (blockedReason(intent)) return
  // ED-01 initializes the session in the destination builder, not on this screen.
  void router.push(decisionDestination(intent.id))
}
watch(() => [userStore.getCurrentWorkspaceId, userStore.getUser?.id, userStore.isAuthenticated], loadAccess, { immediate: true, flush: 'sync' })
onScopeDispose(() => { generation++ })
</script>

<style scoped>
.decision-start { --journey-bg: var(--cb-page-bg); --journey-surface: var(--cb-surface); --journey-ink: var(--cb-ink); --journey-muted: var(--cb-ink-secondary); --journey-line: var(--cb-border); --journey-action: var(--cb-primary); --journey-on-action: #0e1117; --journey-highlight: var(--cb-surface-accent); background: var(--journey-bg); color: var(--journey-ink); min-height: 100%; }
.decision-start--light { --journey-bg: #fafbf7; --journey-surface: #fff; --journey-ink: #18372b; --journey-muted: #50645b; --journey-line: #ccd7ce; --journey-action: #10cc83; --journey-on-action: #18372b; --journey-highlight: #edfa58; }
.decision-start__container { max-width: 1120px; padding-top: 16px; padding-bottom: 32px; }
.decision-start__nav { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 44px; flex-wrap: wrap; }
.decision-start__nav a { color: var(--journey-muted); text-decoration: none; font-size: .9rem; }
.decision-start__eyebrow { background: var(--journey-highlight); padding: 6px 12px; border-radius: 6px; font-size: .75rem; font-weight: 750; letter-spacing: .08em; text-transform: uppercase; }
.decision-start :deep(.cb-page-header__title) { color: var(--journey-ink); font-size: clamp(2rem, 4vw, 3.4rem); max-width: 750px; line-height: 1.12; letter-spacing: -.045em; }
.decision-start :deep(.cb-page-header__meta) { color: var(--journey-muted); font-size: 1.05rem; max-width: 650px; margin-top: 18px; line-height: 1.6; }
.decision-start__promise { display: flex; align-items: flex-start; gap: 8px; color: var(--journey-muted); font-size: .85rem; margin: 18px 0 30px; }
.decision-start .v-icon { color: inherit; background: transparent; }
.decision-start__choices { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
.intent-card { display: flex; flex-direction: column; text-align: left; background: var(--journey-surface); color: var(--journey-ink); border: 1px solid var(--journey-line); border-radius: 20px; padding: 26px; min-width: 0; }
.intent-card__top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 30px; }
.decision-start .intent-card__icon { padding: 26px; border-radius: 16px; background: var(--journey-highlight); }
.intent-card--featured .intent-card__icon, .intent-card--featured .intent-card__action { background: var(--journey-action); color: var(--journey-on-action); }
.intent-card__title { font-size: 1.35rem; font-weight: 750; line-height: 1.25; margin-bottom: 12px; }
.intent-card__description { color: var(--journey-muted); font-size: .94rem; line-height: 1.6; margin-bottom: 26px; }
.intent-card__action { margin-top: auto; min-height: 44px; display: flex; align-items: center; justify-content: space-between; gap: 8px; border-radius: 10px; padding: 10px 12px; font-size: .9rem; font-weight: 700; }
.intent-card[aria-disabled='true'] { cursor: not-allowed; border-style: dashed; }
.intent-card[aria-disabled='true'] .intent-card__action { background: var(--journey-highlight); color: var(--journey-ink); }
.intent-card:not([aria-disabled='true']):hover { border-color: var(--journey-ink); }
.decision-start :is(button, a):focus-visible { outline: 3px solid var(--journey-ink); outline-offset: 4px; }
.decision-start__notice { padding: 16px; border: 1px solid var(--journey-line); border-radius: 12px; margin-bottom: 20px; }
.decision-start__access { color: var(--journey-muted); font-size: .85rem; margin-top: 16px; }
.decision-start__retry { color: var(--journey-ink); text-decoration: underline; }
.decision-start__support { border-top: 1px solid var(--journey-line); margin-top: 38px; padding-top: 28px; }
.decision-start__support h2 { font-size: 1rem; font-weight: 650; margin-bottom: 18px; }
.decision-start__support-links { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 22px; }
.support-link { display: flex; align-items: center; gap: 14px; padding: 14px 0; color: var(--journey-ink); text-decoration: none; }
.support-link > span { flex: 1; min-width: 0; }
.support-link strong, .support-link span span { display: block; }
.support-link span span { color: var(--journey-muted); font-size: .85rem; margin-top: 6px; }
.support-link:hover strong { text-decoration: underline; }
.decision-start__footer { font-size: .8rem; color: var(--journey-muted); margin-top: 34px; }
@media (max-width: 760px) { .decision-start__choices, .decision-start__support-links { grid-template-columns: 1fr; } .decision-start__nav { margin-bottom: 28px; } .intent-card { padding: 22px; } .intent-card__top { margin-bottom: 18px; } }
</style>
