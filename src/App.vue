<script setup lang="ts">
import { RouterView } from 'vue-router'
import SideBar from './components/SideBar.vue';
</script>

<template>
  Hello world!
  <v-app>
    <SideBar></SideBar>
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
