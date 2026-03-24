<template>
  <v-dialog v-model="visible" width="400">
    <v-card>
      <v-card-title class="headline">{{ $t('notification_popup.title') }}</v-card-title>
      <v-card-text>
        <div v-if="!notifications.length" class="notification-empty-state">
          <v-icon color="#94a3b8" size="28">mdi-bell-outline</v-icon>
          <p>{{ $t('notification_popup.empty') }}</p>
        </div>
        <v-list v-else class="notification-list">
          <v-list-item v-for="notification in notifications" :key="notification.id">
            <template #prepend>
              <v-avatar size="34" :color="notificationAccent(notification).background">
                <v-icon :color="notificationAccent(notification).iconColor" size="18">
                  {{ notificationAccent(notification).icon }}
                </v-icon>
              </v-avatar>
            </template>
            <div class="notification-content">
              <div class="notification-header">
                <v-list-item-title>{{ $t(notificationTitle(notification)) }}</v-list-item-title>
                <v-chip
                  v-if="notificationContextLabel(notification)"
                  size="x-small"
                  variant="tonal"
                  color="#667eea"
                >
                  {{ $t(notificationContextLabel(notification)) }}
                </v-chip>
              </div>
              <p class="notification-message">{{ notification.message }}</p>
              <div class="notification-actions">
                <v-btn
                  v-if="notificationPrimaryAction(notification)"
                  size="small"
                  variant="tonal"
                  color="#667eea"
                  @click="openNotification(notification)"
                >
                  <v-icon start>{{ notificationPrimaryAction(notification)?.icon }}</v-icon>
                  {{ $t(notificationPrimaryAction(notification)?.label || 'notification_popup.open_budget') }}
                </v-btn>
                <v-btn size="small" variant="text" color="#16a34a" @click="accept(notification.id)">
                  <v-icon start>mdi-check</v-icon>
                  {{ $t('notification_popup.mark_done') }}
                </v-btn>
                <v-btn size="small" variant="text" color="#64748b" @click="decline(notification.id)">
                  <v-icon start>mdi-close</v-icon>
                  {{ $t('notification_popup.dismiss') }}
                </v-btn>
              </div>
            </div>
          </v-list-item>
        </v-list>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" @click="close">{{ $t('notification_popup.close') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import type { Notification } from '@/services/NotificationService'

const props = defineProps<{
  visible: boolean
  notifications: Notification[]
}>()

const emit = defineEmits(['update:visible', 'accept', 'decline'])
const router = useRouter()

const visible = ref(props.visible)
const notifications = ref(props.notifications)

watch(
  () => props.visible,
  (newVal) => {
    visible.value = newVal
  }
)

watch(
  () => visible.value,
  (newVal) => {
    emit('update:visible', newVal)
  }
)

watch(
  () => props.notifications,
  (newNotifications) => {
    notifications.value = newNotifications
  }
)

function close() {
  visible.value = false
}

function accept(notificationId: string) {
  emit('accept', notificationId)
}

function decline(notificationId: string) {
  emit('decline', notificationId)
}

function notificationTitle(notification: Notification) {
  if (notification.relatedEntityId?.startsWith('transaction-share:create:')) return 'notification_popup.shared_transaction_created_title'
  if (notification.relatedEntityId?.startsWith('transaction-share:update:')) return 'notification_popup.shared_transaction_updated_title'
  if (notification.relatedEntityId?.startsWith('transaction-share:delete:')) return 'notification_popup.shared_transaction_deleted_title'
  if (notification.relatedEntityId?.startsWith('transaction-share:comment:')) return 'notification_popup.shared_transaction_comment_title'
  if (notification.relatedEntityId?.startsWith('transaction-share:')) return 'notification_popup.shared_transaction_title'
  if (notification.relatedEntityId?.startsWith('cashflow:')) return 'notification_popup.cashflow_signal_title'
  if (notification.relatedEntityId?.startsWith('goal-risk:')) return 'notification_popup.goal_signal_title'
  return 'notification_popup.generic_title'
}

function notificationContextLabel(notification: Notification) {
  if (notification.relatedEntityId?.startsWith('transaction-share:')) return 'notification_popup.shared_context_label'
  if (notification.relatedEntityId?.startsWith('cashflow:') || notification.relatedEntityId?.startsWith('goal-risk:')) {
    return 'notification_popup.decision_context_label'
  }
  return ''
}

function notificationAccent(notification: Notification) {
  if (notification.relatedEntityId?.startsWith('transaction-share:create:')) {
    return { icon: 'mdi-swap-horizontal-bold', background: '#eef2ff', iconColor: '#667eea' }
  }
  if (notification.relatedEntityId?.startsWith('transaction-share:update:')) {
    return { icon: 'mdi-pencil-circle-outline', background: '#eff6ff', iconColor: '#2563eb' }
  }
  if (notification.relatedEntityId?.startsWith('transaction-share:delete:')) {
    return { icon: 'mdi-trash-can-outline', background: '#fff7ed', iconColor: '#ea580c' }
  }
  if (notification.relatedEntityId?.startsWith('transaction-share:comment:')) {
    return { icon: 'mdi-comment-text-outline', background: '#ecfeff', iconColor: '#0891b2' }
  }
  if (notification.relatedEntityId?.startsWith('cashflow:')) {
    return { icon: 'mdi-chart-line', background: '#eff6ff', iconColor: '#2563eb' }
  }
  if (notification.relatedEntityId?.startsWith('goal-risk:')) {
    return { icon: 'mdi-flag-outline', background: '#fff7ed', iconColor: '#ea580c' }
  }
  return { icon: 'mdi-bell-outline', background: '#f1f5f9', iconColor: '#64748b' }
}

function notificationPrimaryAction(notification: Notification) {
  if (notification.relatedEntityId?.startsWith('transaction-share:')) {
    return { label: 'notification_popup.open_budget', icon: 'mdi-wallet-outline' }
  }
  if (notification.relatedEntityId?.startsWith('cashflow:')) {
    return { label: 'notification_popup.open_cashflow', icon: 'mdi-chart-areaspline' }
  }
  if (notification.relatedEntityId?.startsWith('goal-risk:')) {
    return { label: 'notification_popup.open_goals', icon: 'mdi-flag-checkered' }
  }
  return null
}

async function openNotification(notification: Notification) {
  if (notification.relatedEntityId?.startsWith('transaction-share:')) {
    await router.push('/budget')
    accept(notification.id)
    return
  }
  if (notification.relatedEntityId?.startsWith('cashflow:')) {
    await router.push('/cashflow')
    accept(notification.id)
    return
  }
  if (notification.relatedEntityId?.startsWith('goal-risk:')) {
    await router.push('/goals')
    accept(notification.id)
  }
}
</script>

<style scoped>
.notification-list {
  display: grid;
  gap: 10px;
}

.notification-content {
  display: grid;
  gap: 6px;
  width: 100%;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.notification-message {
  margin: 0;
  color: #475569;
  font-size: 0.92rem;
}

.notification-actions {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.notification-empty-state {
  display: grid;
  place-items: center;
  gap: 8px;
  padding: 12px 0;
  text-align: center;
  color: #64748b;
}

.v-theme--dark .notification-message,
.v-theme--dark .notification-empty-state {
  color: #cbd5e1;
}
</style>
