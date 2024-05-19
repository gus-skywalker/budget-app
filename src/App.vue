<script setup lang="ts">
import { RouterView } from 'vue-router'
import HomeView from './views/HomeView.vue';
import SideBar from './components/SideBar.vue';
</script>

<template>
  Hello world!
  <v-app>
    <SideBar></SideBar>
    <v-main>
      <RouterView />
    </v-main>
  </v-app>
  <RouterView />
</template>

<style scoped></style>
