<template>
  <v-dialog v-model="visible" width="400">
    <v-card>
      <v-card-title class="headline">Notificações</v-card-title>
      <v-card-text>
        <v-list>
          <v-list-item v-for="notification in notifications" :key="notification.id">
            <v-list-item-title>{{ notification.message }}</v-list-item-title>
            <v-list-item-action>
              <v-btn icon @click="accept(notification.id)">
                <v-icon>mdi-check</v-icon>
              </v-btn>
              <v-btn icon @click="decline(notification.id)">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </v-list-item-action>
          </v-list-item>
        </v-list>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" @click="close">Fechar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Notification } from '@/services/NotificationService'

const props = defineProps<{
  visible: boolean
  notifications: Notification[]
}>()

const emit = defineEmits(['update:visible', 'accept', 'decline'])

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
  console.log(notifications)
  visible.value = false
}

function accept(notificationId: string) {
  emit('accept', notificationId)
}

function decline(notificationId: string) {
  emit('decline', notificationId)
}
</script>
