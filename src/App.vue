<!-- App.vue -->
<script setup lang="ts">
import { RouterView } from 'vue-router'
import { ref, onMounted, onUnmounted, computed } from 'vue'
import SideBar from './components/SideBar.vue'
import NotificationPopup from '@/components/NotificationPopup.vue'
import PrivacyControls from '@/components/compliance/PrivacyControls.vue'
import { useUserStore } from '@/plugins/userStore'
import NotificationService from '@/services/NotificationService'
import type { Notification } from '@/services/NotificationService'

// Access the Pinia store
const userStore = useUserStore()

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
  NotificationService.accept(notificationId).then(() => {
    notifications.value = notifications.value.filter((n) => n.id !== notificationId)
  })
}

// Função para declinar a notificação
function decline(notificationId: number) {
  NotificationService.decline(notificationId).then(() => {
    notifications.value = notifications.value.filter((n) => n.id !== notificationId)
  })
}

// Função para fazer polling de notificações
function pollNotifications() {
  if (isAuthenticated.value) {
    NotificationService.getNotifications()
      .then((response) => {
        console.log('Response data:', response.data)
        notifications.value = response.data.map((notification) => ({
          id: notification.id,
          destinationUser: notification.destinationUser,
          message: notification.message,
          status: notification.status
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
    <SideBar v-if="isAuthenticated" :notifications="notifications" @accept="accept" @decline="decline"
      @toggle-notifications-popup="toggleNotificationsPopup" />
    <v-main :class="{ 'main-content': true, 'main-content-authenticated': isAuthenticated }">
      <RouterView />
    </v-main>
    <NotificationPopup :visible="showNotificationsPopup" :notifications="notifications"
      @close="toggleNotificationsPopup" @accept="accept" @decline="decline" />
    <PrivacyControls />
  </v-app>
</template>

<style scoped>
.main-content {
  padding: 0;
  min-height: 100vh;
}

.main-content-authenticated {
  /* Adiciona margem à esquerda quando o sidebar está visível */
  margin-left: 0;
}

/* Para telas maiores, o sidebar fica fixo */
@media (min-width: 1280px) {
  .main-content-authenticated {
    margin-left: 56px; /* Largura do sidebar em rail mode */
  }
}
</style>

<style>
/* Permitir que cada página controle seu próprio background */
.v-application__wrap {
  min-height: 100vh;
}
</style>
