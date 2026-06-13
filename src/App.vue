<!-- App.vue -->
<script setup lang="ts">
import { RouterView, useRoute, useRouter } from 'vue-router'
import { KeepAlive } from 'vue'
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import SideBar from './components/SideBar.vue'
import ContextBadge from '@/components/ContextBadge.vue'
import OnboardingStatusBanner from '@/components/OnboardingStatusBanner.vue'
import NotificationBellDropdown from '@/components/NotificationBellDropdown.vue'
import PrivacyControls from '@/components/compliance/PrivacyControls.vue'
import { useUserStore } from '@/plugins/userStore'
import NotificationService from '@/services/NotificationService'
import type { Notification } from '@/services/NotificationService'

// Access the Pinia store
const userStore = useUserStore()
const route = useRoute()
const router = useRouter()
const focusedOnboardingRoutes = new Set([
  'create-workspace',
  'select-workspace',
  'choose-plan',
  'checkout'
])

// Estado das notificações
const notifications = ref<Notification[]>([])
const showNotificationsPopup = ref(false)
const unreadCount = ref(0)
const workspaceViewEpoch = ref(0)

// Computed property to check if the user is authenticated
const isAuthenticated = computed(() => userStore.isAuthenticated)
const currentWorkspaceId = computed(() => userStore.getCurrentWorkspaceId)
const showFocusedOnboardingChrome = computed(
  () => !focusedOnboardingRoutes.has(String(route.name || ''))
)
const hideAppChrome = computed(() => Boolean(route.meta?.hideAppChrome))
const workspaceScopedViewKey = computed(() => {
  const routeKey = String(route.name || route.path || 'view')
  const workspaceKey = currentWorkspaceId.value || 'personal'
  return `${routeKey}:${workspaceKey}:${workspaceViewEpoch.value}`
})

// Função para fazer polling de notificações
function pollNotifications() {
  if (isAuthenticated.value) {
    NotificationService.getNotifications()
      .then((response) => {
        const items = Array.isArray(response.data) ? response.data : []
        notifications.value = items as Notification[]
      })
      .catch((error: any) => {
        console.error('Erro ao buscar notificações:', error)
      })
    NotificationService.getUnreadCount()
      .then((response) => {
        unreadCount.value = Number(response?.data?.unreadCount || 0)
      })
      .catch((error: any) => {
        console.error('Erro ao buscar total de não lidas:', error)
      })
  }
}

async function openNotification(notification: Notification) {
  const notificationId = String(notification.id)
  if (!notification.read) {
    try {
      await NotificationService.markAsRead(notificationId)
      notifications.value = notifications.value.map((item) => {
        if (String(item.id) === notificationId) {
          return { ...item, read: true }
        }
        return item
      })
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error)
    }
  }

  const notificationTarget = extractNotificationTarget(notification)
  if (notificationTarget?.workspaceId) {
    try {
      await userStore.selectWorkspace(notificationTarget.workspaceId)
    } catch (error) {
      console.error('Erro ao selecionar workspace da notificação:', error)
    }
  }

  if (notificationTarget?.path) {
    await router.push(notificationTarget.path)
    showNotificationsPopup.value = false
    return
  }

  const decisionId = extractDecisionId(notification)
  if (decisionId) {
    await router.push({ name: 'decision-detail', params: { id: decisionId } })
  } else {
    await router.push({ name: 'decisions' })
  }
  showNotificationsPopup.value = false
}

function extractDecisionId(notification: Notification): string | null {
  if (notification.metadata) {
    try {
      const parsed = JSON.parse(notification.metadata)
      if (parsed && typeof parsed.decisionId === 'string' && parsed.decisionId.trim().length > 0) {
        return parsed.decisionId
      }
    } catch (error) {
      console.error('Erro ao interpretar metadata da notificação:', error)
    }
  }
  const relatedEntity = (notification as any).relatedEntityId
  if (typeof relatedEntity === 'string' && relatedEntity.includes(':')) {
    const lastToken = relatedEntity.split(':').pop()
    if (lastToken && lastToken.trim().length > 0) {
      return lastToken
    }
  }
  return null
}

function extractNotificationTarget(
  notification: Notification
): { path: string | null; workspaceId: string | null } | null {
  if (!notification.metadata) return null
  try {
    const parsed = JSON.parse(notification.metadata)
    const path =
      typeof parsed?.targetPath === 'string' && parsed.targetPath.trim().length > 0
        ? parsed.targetPath.trim()
        : null
    const workspaceId =
      typeof parsed?.targetWorkspaceId === 'string' && parsed.targetWorkspaceId.trim().length > 0
        ? parsed.targetWorkspaceId.trim()
        : typeof parsed?.workspaceId === 'string' && parsed.workspaceId.trim().length > 0
          ? parsed.workspaceId.trim()
          : null
    if (!path && !workspaceId) return null
    return { path, workspaceId }
  } catch (error) {
    console.error('Erro ao interpretar target da notificação:', error)
    return null
  }
}

let pollingInterval: any

onMounted(() => {
  // Iniciar polling
  pollNotifications()
  pollingInterval = setInterval(pollNotifications, 180000) // Polling a cada 3 minutos
})

watch(currentWorkspaceId, (nextWorkspaceId, previousWorkspaceId) => {
  if (nextWorkspaceId === previousWorkspaceId) return
  workspaceViewEpoch.value += 1
  notifications.value = []
  unreadCount.value = 0
  pollNotifications()
})

onUnmounted(() => {
  // Limpar o intervalo de polling
  if (pollingInterval) {
    clearInterval(pollingInterval)
  }
})
</script>

<template>
  <v-app>
    <SideBar v-if="isAuthenticated && !hideAppChrome" />
    <v-main>
      <div
        v-if="isAuthenticated && showFocusedOnboardingChrome && !hideAppChrome"
        class="global-context-container"
      >
        <NotificationBellDropdown
          v-model="showNotificationsPopup"
          :notifications="notifications"
          :unread-count="unreadCount"
          @notification-click="openNotification"
        />
        <ContextBadge />
      </div>
      <OnboardingStatusBanner
        v-if="isAuthenticated && showFocusedOnboardingChrome && !hideAppChrome"
      />
      <RouterView v-slot="{ Component, route: viewRoute }">
        <KeepAlive include="DashboardView">
          <component
            :is="Component"
            v-if="viewRoute.meta?.keepAlive"
            :key="workspaceScopedViewKey"
          />
        </KeepAlive>
        <component
          :is="Component"
          v-if="!viewRoute.meta?.keepAlive"
          :key="workspaceScopedViewKey"
        />
      </RouterView>
    </v-main>
    <PrivacyControls />
  </v-app>
</template>

<style scoped>
.global-context-container {
  position: sticky;
  top: 8px;
  z-index: 5;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  padding: 8px 16px 0 16px;
  min-width: 0;
  flex-wrap: wrap;
}

@media (max-width: 600px) {
  .global-context-container {
    gap: 4px;
    padding: 8px 12px 0 12px;
  }
}
</style>

<style>
/* Permitir que cada página controle seu próprio background */
.v-application__wrap {
  min-height: 100vh;
}
</style>
