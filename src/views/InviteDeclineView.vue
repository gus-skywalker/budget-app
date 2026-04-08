<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import WorkspaceInviteService from '@/services/WorkspaceInviteService'

const route = useRoute()
const loading = ref(true)
const done = ref(false)
const errorMessage = ref('')

const token = computed(() => String(route.query.token || '').trim())

async function processInviteDecline() {
  if (!token.value) {
    errorMessage.value = 'Invite token not found.'
    loading.value = false
    return
  }
  try {
    await WorkspaceInviteService.declineInvite(token.value)
    done.value = true
  } catch (error: any) {
    errorMessage.value = error?.response?.data?.error || error?.response?.data || 'Could not decline invitation.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  processInviteDecline()
})
</script>

<template>
  <v-container class="fill-height d-flex align-center justify-center">
    <v-card class="pa-6" max-width="560" width="100%">
      <div class="text-h5 font-weight-bold mb-2">Workspace invitation</div>
      <div class="text-body-2 text-medium-emphasis mb-6">
        Invitation response
      </div>

      <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />

      <v-alert
        v-else-if="done"
        type="info"
        variant="tonal"
        class="mb-4"
      >
        Invitation declined.
      </v-alert>

      <v-alert
        v-else
        type="error"
        variant="tonal"
        class="mb-4"
      >
        {{ errorMessage }}
      </v-alert>
    </v-card>
  </v-container>
</template>
