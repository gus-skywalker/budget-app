<!-- App.vue -->
<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import { ref, onMounted, onUnmounted, computed } from 'vue'
import SideBar from './components/SideBar.vue'
import ContextBadge from '@/components/ContextBadge.vue'
import OnboardingStatusBanner from '@/components/OnboardingStatusBanner.vue'
import NotificationPopup from '@/components/NotificationPopup.vue'
import PrivacyControls from '@/components/compliance/PrivacyControls.vue'
import { useUserStore } from '@/plugins/userStore'
import NotificationService from '@/services/NotificationService'
import type { Notification } from '@/services/NotificationService'

// Access the Pinia store
const userStore = useUserStore()
const route = useRoute()
const routeViewKey = computed(() => route.path)

// Estado das notificações
const notifications = ref<Notification[]>([])
const showNotificationsPopup = ref(false)

// Computed property to check if the user is authenticated
const isAuthenticated = computed(() => userStore.isAuthenticated)

// Função para alternar a exibição das notificações
function toggleNotificationsPopup() {
  showNotificationsPopup.value = !showNotificationsPopup.value
}

// Função para aceitar a notificação
function accept(notificationId: number) {
  NotificationService.accept(String(notificationId)).then(() => {
    notifications.value = notifications.value.filter((n) => n.id !== String(notificationId))
  })
}

// Função para declinar a notificação
function decline(notificationId: number) {
  NotificationService.decline(String(notificationId)).then(() => {
    notifications.value = notifications.value.filter((n) => n.id !== String(notificationId))
  })
}

// Função para fazer polling de notificações
function pollNotifications() {
  if (isAuthenticated.value) {
    NotificationService.getNotifications()
      .then((response) => {
        const items = Array.isArray(response.data) ? response.data : []
        notifications.value = items.map((notification: Notification) => ({
          id: notification.id,
          destinationUser: notification.destinationUser,
          message: notification.message,
          status: notification.status,
          relatedEntityId: notification.relatedEntityId
        }))
        if (notifications.value.length > 0) {
          showNotificationsPopup.value = true
        }
      })
      .catch((error: any) => {
        console.error('Erro ao buscar notificações:', error)
      })
  }
}

let pollingInterval: any

onMounted(() => {
  // Iniciar polling
  pollNotifications()
  pollingInterval = setInterval(pollNotifications, 9000) // Polling a cada 5 segundos
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
    <SideBar v-if="isAuthenticated" :notifications="notifications"
      @toggle-notifications-popup="toggleNotificationsPopup" />
    <v-main>
      <div v-if="isAuthenticated" class="global-context-container">
        <ContextBadge />
      </div>
      <OnboardingStatusBanner v-if="isAuthenticated" />
      <RouterView :key="routeViewKey" />
    </v-main>
    <NotificationPopup :visible="showNotificationsPopup" :notifications="notifications"
      @close="toggleNotificationsPopup" @accept="accept" @decline="decline" />
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
  padding: 8px 16px 0 16px;
}
</style>

<style>
/* Permitir que cada página controle seu próprio background */
.v-application__wrap {
  min-height: 100vh;
}
</style>
