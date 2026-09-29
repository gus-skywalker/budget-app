<template>
  <section class="trust-context" :class="{ 'trust-context--compact': compact }" :aria-labelledby="titleId">
    <div class="trust-context__intro">
      <div class="trust-context__icon">
        <v-icon size="20">mdi-shield-check-outline</v-icon>
      </div>
      <div>
        <p class="trust-context__eyebrow">{{ t('trustContext.eyebrow') }}</p>
        <h3 :id="titleId">{{ content.title }}</h3>
        <p class="trust-context__summary">{{ content.summary }}</p>
      </div>
    </div>

    <div class="trust-context__badges" :aria-label="t('trustContext.commitments_label')">
      <v-chip size="small" variant="tonal" color="success" prepend-icon="mdi-eye-outline">{{ t('trustContext.badges.read_only') }}</v-chip>
      <v-chip size="small" variant="tonal" color="primary" prepend-icon="mdi-bank-transfer-out">{{ t('trustContext.badges.no_money_movement') }}</v-chip>
      <v-chip size="small" variant="tonal" color="secondary" prepend-icon="mdi-shield-account-outline">{{ t('trustContext.badges.user_control') }}</v-chip>
    </div>

    <div v-if="!compact" class="trust-context__details">
      <article class="trust-context__column trust-context__column--access">
        <v-icon size="19">mdi-eye-check-outline</v-icon>
        <div>
          <strong>{{ t('trustContext.details.accesses') }}</strong>
          <p>{{ content.accesses }}</p>
        </div>
      </article>
      <article class="trust-context__column trust-context__column--no-access">
        <v-icon size="19">mdi-close-circle-outline</v-icon>
        <div>
          <strong>{{ t('trustContext.details.does_not_access') }}</strong>
          <p>{{ content.doesNotAccess }}</p>
        </div>
      </article>
      <article class="trust-context__column trust-context__column--control">
        <v-icon size="19">mdi-account-cog-outline</v-icon>
        <div>
          <strong>{{ t('trustContext.details.control') }}</strong>
          <p>{{ content.control }}</p>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

type TrustContext = 'banking' | 'workspace' | 'import'

const props = withDefaults(defineProps<{
  context?: TrustContext
  compact?: boolean
}>(), {
  context: 'banking',
  compact: false,
})

const { t } = useI18n()

const copyKeys: Record<TrustContext, { title: string; summary: string; accesses: string; doesNotAccess: string; control: string }> = {
  banking: {
    title: 'trustContext.contexts.banking.title',
    summary: 'trustContext.contexts.banking.summary',
    accesses: 'trustContext.contexts.banking.accesses',
    doesNotAccess: 'trustContext.contexts.banking.does_not_access',
    control: 'trustContext.contexts.banking.control',
  },
  workspace: {
    title: 'trustContext.contexts.workspace.title',
    summary: 'trustContext.contexts.workspace.summary',
    accesses: 'trustContext.contexts.workspace.accesses',
    doesNotAccess: 'trustContext.contexts.workspace.does_not_access',
    control: 'trustContext.contexts.workspace.control',
  },
  import: {
    title: 'trustContext.contexts.import.title',
    summary: 'trustContext.contexts.import.summary',
    accesses: 'trustContext.contexts.import.accesses',
    doesNotAccess: 'trustContext.contexts.import.does_not_access',
    control: 'trustContext.contexts.import.control',
  },
}

const content = computed(() => {
  const keys = copyKeys[props.context]
  return {
    title: t(keys.title),
    summary: t(keys.summary),
    accesses: t(keys.accesses),
    doesNotAccess: t(keys.doesNotAccess),
    control: t(keys.control),
  }
})
const titleId = computed(() => `trust-context-${props.context}`)
</script>

<style scoped>
.trust-context{display:grid;gap:18px;padding:22px;border:1px solid color-mix(in srgb,var(--cb-primary,#205f63) 20%,#d8dce5);border-radius:16px;background:linear-gradient(135deg,color-mix(in srgb,var(--cb-primary,#205f63) 7%,#fff),#fff);color:var(--cb-ink,#1f2937)}.trust-context__intro{display:flex;align-items:flex-start;gap:12px}.trust-context__icon{display:grid;place-items:center;flex:0 0 auto;width:40px;height:40px;border-radius:12px;background:color-mix(in srgb,var(--cb-primary,#205f63) 13%,#fff);color:var(--cb-primary,#205f63)}.trust-context__eyebrow{margin:0 0 3px;font-size:.72rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--cb-primary,#205f63)}.trust-context h3{margin:0;font-size:1.05rem;line-height:1.35}.trust-context__summary{margin:4px 0 0;color:var(--cb-text-muted,#64748b);line-height:1.5}.trust-context__badges{display:flex;flex-wrap:wrap;gap:8px}.trust-context__details{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.trust-context__column{display:flex;align-items:flex-start;gap:9px;padding:14px;border:1px solid rgba(100,116,139,.15);border-radius:12px;background:rgba(255,255,255,.72)}.trust-context__column--access{color:#16744a}.trust-context__column--no-access{color:#a54242}.trust-context__column--control{color:var(--cb-primary,#205f63)}.trust-context__column strong{display:block;color:var(--cb-ink,#1f2937);font-size:.86rem}.trust-context__column p{margin:4px 0 0;color:var(--cb-text-muted,#64748b);font-size:.83rem;line-height:1.45}.trust-context--compact{gap:12px;padding:16px}.trust-context--compact .trust-context__icon{width:34px;height:34px;border-radius:10px}.trust-context--compact h3{font-size:.98rem}.trust-context--compact .trust-context__summary{font-size:.9rem}@media(max-width:760px){.trust-context__details{grid-template-columns:1fr}.trust-context__badges .v-chip{max-width:100%}}
</style>
