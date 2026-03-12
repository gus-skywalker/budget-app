<template>
  <div class="under-construction">
    <div class="under-construction__icon">
      <v-icon size="48" color="#667eea">mdi-hammer-wrench</v-icon>
    </div>
    <div class="under-construction__content">
      <h3 class="under-construction__title">{{ title }}</h3>
      <p class="under-construction__message">{{ message }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  message: string
}>()
</script>

<style scoped>
.under-construction {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  border-radius: 16px;
  background: rgba(102, 126, 234, 0.08);
  border: 1px dashed rgba(102, 126, 234, 0.4);
}

.v-theme--dark .under-construction {
  background: rgba(102, 126, 234, 0.14);
  border-color: rgba(102, 126, 234, 0.5);
}

.under-construction__icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: rgba(102, 126, 234, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
}

.v-theme--dark .under-construction__icon {
  background: rgba(102, 126, 234, 0.25);
}

.under-construction__title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a1a1a;
}

.v-theme--dark .under-construction__title {
  color: #ffffff;
}

.under-construction__message {
  margin: 6px 0 0;
  color: #666;
}

.v-theme--dark .under-construction__message {
  color: #b0b0b0;
}
</style>
