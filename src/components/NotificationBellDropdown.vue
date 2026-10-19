<template>
  <v-menu
    :model-value="modelValue"
    location="bottom end"
    :close-on-content-click="false"
    max-width="420"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <template #activator="{ props }">
      <v-btn icon variant="text" class="notification-bell" :aria-label="t('notifications.title')" v-bind="props">
        <v-badge
          :model-value="unreadCount > 0"
          :content="unreadCount > 99 ? '99+' : unreadCount"
          color="error"
          offset-x="2"
          offset-y="2"
        >
          <v-icon>mdi-bell-outline</v-icon>
        </v-badge>
      </v-btn>
    </template>

    <v-card class="notification-card" elevation="0">
      <v-card-title class="notification-title">
        <span class="notification-title__accent" aria-hidden="true"></span>
        {{ t('notifications.title') }}
      </v-card-title>
      <v-list v-if="latestNotifications.length" density="comfortable" class="notification-list">
        <v-list-item
          v-for="notification in latestNotifications"
          :key="String(notification.id)"
          :class="notification.read ? 'notification-read' : 'notification-unread'"
          @click="emit('notification-click', notification)"
        >
          <v-list-item-title class="notification-message">
            {{ notification.message || notification.title || t('notifications.fallback_title') }}
          </v-list-item-title>
          <v-list-item-subtitle class="notification-meta">
            <span>{{ normalizeType(notification.type) }}</span>
            <span>{{ formatTimestamp(notification.createdAt) }}</span>
          </v-list-item-subtitle>
        </v-list-item>
      </v-list>
      <div v-else class="notification-empty">
        <span class="notification-empty__illustration" aria-hidden="true"><span></span></span>
        <span>{{ t('notifications.empty') }}</span>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Notification } from '@/services/NotificationService'

const props = defineProps<{
  modelValue: boolean
  notifications: Notification[]
  unreadCount: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'notification-click', notification: Notification): void
}>()

const { locale, t } = useI18n()

const formattingLocale = computed(() => {
  if (locale.value === 'en') return 'en-US'
  if (locale.value === 'fr') return 'fr-FR'
  if (locale.value === 'es') return 'es-ES'
  return 'pt-BR'
})

const latestNotifications = computed(() => {
  return [...(props.notifications || [])]
    .sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return bTime - aTime
    })
    .slice(0, 10)
})

function normalizeType(type?: string): string {
  const normalized = String(type || '')
    .trim()
    .toLowerCase()
  if (normalized === 'decision_created') return t('notifications.types.decision_created')
  if (normalized === 'vote_added') return t('notifications.types.vote_added')
  if (normalized === 'comment_added') return t('notifications.types.comment_added')
  if (normalized === 'decision_applied') return t('notifications.types.decision_applied')
  if (normalized === 'workspace_welcome') return t('notifications.types.workspace_welcome')
  if (normalized === 'workspace_exited') return t('notifications.types.workspace_exited')
  if (normalized === 'invite_accepted') return t('notifications.types.invite_accepted')
  if (normalized === 'invite_declined') return t('notifications.types.invite_declined')
  if (normalized === 'invite_expired') return t('notifications.types.invite_expired')
  return t('notifications.types.workspace_update')
}

function formatTimestamp(value?: string): string {
  if (!value) return t('notifications.now')
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return t('notifications.now')
  return new Intl.DateTimeFormat(formattingLocale.value, {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}
</script>

<style scoped>
.notification-bell {
  color: var(--cb-ink);
}

.notification-bell:focus-visible {
  outline: 3px solid var(--cb-ink);
  outline-offset: 3px;
}

.notification-card {
  border: 1px solid var(--cb-border-card, #ccd7ce);
  border-radius: 18px !important;
  width: min(380px, calc(100vw - 32px));
  max-width: calc(100vw - 32px);
  overflow: hidden;
  box-shadow: 0 16px 38px rgba(17, 43, 31, .14) !important;
}

.notification-title {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px 20px;
  border-bottom: 1px solid var(--cb-border-card, #ccd7ce);
  font-size: 1.05rem;
  font-weight: 750;
  line-height: 1.3;
}

.notification-title__accent {
  display: block;
  flex: 0 0 8px;
  width: 8px;
  height: 24px;
  border-radius: 4px;
  background: #10cc83;
}

.notification-list {
  max-height: 360px;
  overflow-y: auto;
  padding: 8px;
}

.notification-list :deep(.v-list-item) {
  border-radius: 12px;
  margin-bottom: 4px;
  padding: 12px;
}

.notification-unread { background: rgba(16, 204, 131, .08); }

.notification-list :deep(.v-list-item:hover) { background: rgba(16, 204, 131, .12); }

.notification-list :deep(.v-list-item-subtitle) { opacity: 1; }

.notification-list :deep(.v-list-item-title) { white-space: normal; }

.notification-list :deep(.v-list-item__content) { min-width: 0; }

.notification-list :deep(.v-list-item) { cursor: pointer; }

.notification-list :deep(.v-list-item:focus-visible) {
  outline: 3px solid #18372b;
  outline-offset: -2px;
}

.notification-message {
  font-size: 0.92rem;
  line-height: 1.35;
}

.notification-meta {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 0.75rem;
}

.notification-unread .notification-message {
  font-weight: 700;
}

.notification-read .notification-message {
  font-weight: 400;
}

.notification-empty {
  display: grid;
  justify-items: center;
  gap: 14px;
  padding: 28px 20px 32px;
  color: var(--cb-ink-secondary, #50645b);
  font-size: .93rem;
  text-align: center;
  line-height: 1.4;
}

.notification-empty__illustration {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border-radius: 16px;
  background: #e7f8ed;
}

.notification-empty__illustration > span {
  width: 15px;
  height: 15px;
  border: 4px solid #246c51;
  border-radius: 50%;
  box-shadow: 0 0 0 5px #edfa58;
}

:global(.v-theme--dark .notification-title__accent) { background: var(--cb-primary, #10cc83); }

:global(.v-theme--dark .notification-empty__illustration) {
  background: var(--cb-surface-soft, #273645);
}

:global(.v-theme--dark .notification-empty__illustration > span) {
  border-color: var(--cb-primary, #10cc83);
  box-shadow: 0 0 0 5px var(--cb-surface, #18242e);
}

@media (max-width: 600px) {
  .notification-card {
    width: min(360px, calc(100vw - 24px));
    max-width: calc(100vw - 24px);
  }

  .notification-meta {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 430px) {
  .notification-card {
    width: min(320px, calc(100vw - 20px));
    max-width: calc(100vw - 20px);
  }
}
</style>
