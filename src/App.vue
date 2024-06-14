<script setup lang="ts">
import { RouterView } from 'vue-router'
import SideBar from './components/SideBar.vue'
import { useUserStore } from '@/plugins/userStore'
// import { useStore } from 'vuex'
import { computed } from 'vue';

// Access the Vuex store
const userStore = useUserStore()

// Computed property to check if the user is authenticated
const isAuthenticated = computed(() => userStore.isAuthenticated)
</script>
<template>
  <v-app>
    <SideBar v-if="isAuthenticated" />
    <v-main class="main-content">
      <RouterView />
    </v-main>
  </v-app>
</template>

<style scoped>
.main-content {
  /* margin-left: 200px; */
  padding: 100px;
}
</style>
