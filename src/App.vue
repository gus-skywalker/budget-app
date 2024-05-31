<script setup lang="ts">
import { RouterView } from 'vue-router'
import SideBar from './components/SideBar.vue'
import LoginView from './views/LoginView.vue'
import { useStore } from 'vuex'
import { computed } from 'vue';

// Access the Vuex store
const store = useStore()

// Computed property to check if the user is authenticated
const isAuthenticated = computed(() => store.state.auth)
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
