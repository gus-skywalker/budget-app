<template>
  <v-menu
    :model-value="modelValue"
    location="bottom end"
    :close-on-content-click="false"
    max-width="420"
    min-width="360"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <template #activator="{ props }">
      <v-btn
        icon
        variant="text"
        class="notification-bell"
        v-bind="props"
      >
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

    <v-card class="notification-card">
      <v-card-title class="notification-title">
        Notifications
      </v-card-title>
      <v-divider />
      <v-list v-if="latestNotifications.length" density="comfortable" class="notification-list">
        <v-list-item
          v-for="notification in latestNotifications"
          :key="String(notification.id)"
          :class="notification.read ? 'notification-read' : 'notification-unread'"
          @click="emit('notification-click', notification)"
        >
          <v-list-item-title class="notification-message">
            {{ notification.message || notification.title || 'New update' }}
          </v-list-item-title>
          <v-list-item-subtitle class="notification-meta">
            <span>{{ normalizeType(notification.type) }}</span>
            <span>{{ formatTimestamp(notification.createdAt) }}</span>
          </v-list-item-subtitle>
        </v-list-item>
      </v-list>
      <div v-else class="notification-empty">
        No notifications yet
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue'
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
  if (normalized === 'decision_created') return 'new decision'
  if (normalized === 'vote_added') return 'new vote'
  if (normalized === 'comment_added') return 'new comment'
  if (normalized === 'decision_applied') return 'decision applied'
  if (normalized === 'workspace_welcome') return 'workspace welcome'
  if (normalized === 'workspace_exited') return 'workspace exit'
  if (normalized === 'invite_accepted') return 'invite accepted'
  if (normalized === 'invite_declined') return 'invite declined'
  if (normalized === 'invite_expired') return 'invite expired'
  return 'workspace update'
}

function formatTimestamp(value?: string): string {
  if (!value) return 'now'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'now'
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}
</script>

<style scoped>
.notification-bell {
  color: #0f172a;
}

.notification-card {
  border: 1px solid #e2e8f0;
}

.notification-title {
  font-size: 0.95rem;
  font-weight: 700;
}

.notification-list {
  max-height: 420px;
  overflow-y: auto;
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
  padding: 16px;
  color: #64748b;
  font-size: 0.9rem;
}
</style>
