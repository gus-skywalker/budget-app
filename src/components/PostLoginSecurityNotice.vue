<template>
  <section v-if="visible" class="security-notice-shell" :aria-label="t('postLoginSecurity.eyebrow')">
    <article class="security-notice">
      <div class="security-notice__icon" aria-hidden="true">
        <v-icon size="22">mdi-shield-lock-outline</v-icon>
      </div>

      <div class="security-notice__content">
        <p class="security-notice__eyebrow">{{ t('postLoginSecurity.eyebrow') }}</p>
        <h2>{{ t('postLoginSecurity.title') }}</h2>
        <p class="security-notice__description">{{ t('postLoginSecurity.description') }}</p>

        <div class="security-notice__badges" :aria-label="t('postLoginSecurity.commitments_label')">
          <v-chip size="small" variant="tonal" color="success" prepend-icon="mdi-lock-check-outline">
            {{ t('postLoginSecurity.badges.encryption_2fa') }}
          </v-chip>
          <v-chip size="small" variant="tonal" color="primary" prepend-icon="mdi-account-key-outline">
            {{ t('postLoginSecurity.badges.role_permissions') }}
          </v-chip>
          <v-chip size="small" variant="tonal" color="secondary" prepend-icon="mdi-link-variant-off">
            {{ t('postLoginSecurity.badges.revocable_consent') }}
          </v-chip>
        </div>

        <nav class="security-notice__legal" :aria-label="t('postLoginSecurity.legal_links_label')">
          <span>{{ t('postLoginSecurity.legal_intro') }}</span>
          <router-link :to="{ name: 'privacy-policy' }">{{ t('footer.privacy_policy') }}</router-link>
          <router-link :to="{ name: 'terms-of-use' }">{{ t('footer.terms_of_use') }}</router-link>
          <router-link :to="{ name: 'cookie-policy' }">{{ t('footer.cookie_policy') }}</router-link>
        </nav>
      </div>

      <v-btn
        icon="mdi-close"
        size="small"
        variant="text"
        class="security-notice__close"
        :aria-label="t('postLoginSecurity.dismiss')"
        @click="dismiss"
      />
    </article>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/plugins/userStore'

const { t } = useI18n()
const userStore = useUserStore()
const visible = ref(false)
const userKey = computed(() => String(userStore.getUser?.id || 'authenticated-user'))
const storageKey = computed(() => `cobudget.postLoginSecurityNotice.dismissed:${userKey.value}`)

const syncVisibility = () => {
  visible.value = sessionStorage.getItem(storageKey.value) !== '1'
}

const dismiss = () => {
  sessionStorage.setItem(storageKey.value, '1')
  visible.value = false
}

onMounted(syncVisibility)
watch(userKey, syncVisibility)
</script>

<style scoped>
.security-notice-shell{padding:12px 16px 0}.security-notice{position:relative;display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:14px;align-items:start;max-width:1180px;margin:0 auto;padding:18px 20px;border:1px solid color-mix(in srgb,var(--cb-primary,#205f63) 22%,#d8dce5);border-radius:18px;background:linear-gradient(135deg,color-mix(in srgb,var(--cb-primary,#205f63) 8%,#fff),#fff);box-shadow:0 12px 26px rgba(23,32,51,.06)}.security-notice__icon{display:grid;place-items:center;width:42px;height:42px;border-radius:13px;background:color-mix(in srgb,var(--cb-primary,#205f63) 14%,#fff);color:var(--cb-primary,#205f63)}.security-notice__eyebrow{margin:0 0 3px;color:var(--cb-primary,#205f63);font-size:.72rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase}.security-notice h2{margin:0;color:var(--cb-ink,#172033);font-size:1.1rem;line-height:1.35}.security-notice__description{max-width:90ch;margin:5px 0 0;color:var(--cb-text-muted,#596579);font-size:.93rem;line-height:1.55}.security-notice__badges{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}.security-notice__legal{display:flex;align-items:center;flex-wrap:wrap;gap:6px 12px;margin-top:12px;color:var(--cb-text-muted,#596579);font-size:.86rem}.security-notice__legal a{color:var(--cb-primary,#205f63);font-weight:700;text-decoration:none}.security-notice__legal a:hover{text-decoration:underline}.security-notice__close{margin:-4px -6px 0 0;color:var(--cb-text-muted,#596579)}:global(.v-theme--dark) .security-notice{background:linear-gradient(135deg,rgba(23,63,75,.92),rgba(15,23,42,.96));border-color:rgba(148,163,184,.2)}:global(.v-theme--dark) .security-notice__icon{background:rgba(125,211,252,.12);color:#9ddcfb}:global(.v-theme--dark) .security-notice h2{color:#f8fafc}:global(.v-theme--dark) .security-notice__description,:global(.v-theme--dark) .security-notice__legal{color:#cbd5e1}:global(.v-theme--dark) .security-notice__legal a{color:#9ddcfb}@media(max-width:640px){.security-notice-shell{padding:10px 12px 0}.security-notice{grid-template-columns:auto minmax(0,1fr);padding:16px;border-radius:16px}.security-notice__close{position:absolute;top:10px;right:10px}.security-notice__content{padding-right:22px}.security-notice__badges .v-chip{max-width:100%}.security-notice__legal{align-items:flex-start;flex-direction:column;gap:8px}}
</style>
