<script setup lang="ts">
import { RouterView } from 'vue-router';
import { ref, onMounted, onUnmounted, computed } from 'vue';
import SideBar from './components/SideBar.vue';
import NotificationPopup from '@/components/NotificationPopup.vue';
import { useUserStore } from '@/plugins/userStore';
import NotificationService from '@/services/NotificationService';
import type { Notification } from '@/services/NotificationService';

// Access the Pinia store
const userStore = useUserStore();

// Estado das notificações
const notifications = ref<Notification[]>([]);
const showNotificationsPopup = ref(false);

// Computed property to check if the user is authenticated
const isAuthenticated = computed(() => userStore.isAuthenticated);

// Função para alternar a exibição das notificações
function toggleNotificationsPopup() {
  showNotificationsPopup.value = !showNotificationsPopup.value;
}

// Função para aceitar a notificação
function accept(notificationId: number) {
  NotificationService.accept(notificationId)
    .then(() => {
      notifications.value = notifications.value.filter(n => n.id !== notificationId);
    });
}

// Função para declinar a notificação
function decline(notificationId: number) {
  NotificationService.decline(notificationId)
    .then(() => {
      notifications.value = notifications.value.filter(n => n.id !== notificationId);
    });
}

// Função para fazer polling de notificações
function pollNotifications() {
  if (isAuthenticated.value) {
    NotificationService.getNotifications()
      .then(response => {
        console.log('Response data:', response.data);
        notifications.value = response.data.map(notification => ({
          id: notification.id,
          destinationUser: notification.destinationUser,
          message: notification.message,
          status: notification.status
        }));
        if (notifications.value.length > 0) {
          showNotificationsPopup.value = true;
        }
      })
      .catch((error: any) => {
        console.error('Erro ao buscar notificações:', error);
      });
  }
}

let pollingInterval: any;

onMounted(() => {
  // Iniciar polling
  pollNotifications();
  pollingInterval = setInterval(pollNotifications, 5000);  // Polling a cada 5 segundos
});

onUnmounted(() => {
  // Limpar o intervalo de polling
  if (pollingInterval) {
    clearInterval(pollingInterval);
  }
});
</script>

<template>
  <v-app>
    <SideBar :notifications="notifications" @accept="accept" @decline="decline"
      @toggle-notifications-popup="toggleNotificationsPopup" />
    <v-main class="main-content">
      <RouterView />
    </v-main>
    <NotificationPopup :visible="showNotificationsPopup" :notifications="notifications"
      @close="toggleNotificationsPopup" @accept="accept" @decline="decline" />
  </v-app>
</template>

<style scoped>
.main-content {
  /* margin-left: 200px; */
  padding: 100px;
}
</style>
