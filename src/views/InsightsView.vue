<template>
  <div class="insights-page">
    <v-container class="modern-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">{{ $t('insights.title') }}</h1>
          <p class="page-subtitle">{{ $t('insights.subtitle') }}</p>
        </div>
      </div>

      <div class="modern-card">
        <div class="card-header">
          <h2 class="card-title">
            <v-icon color="#667eea" class="mr-2">mdi-brain</v-icon>
            {{ $t('insights.list_title') }}
          </h2>
        </div>
        <div class="card-content">
          <div class="insights-grid">
            <div v-for="insight in insights" :key="insight.title" class="insight-card">
              <div class="insight-card__header">
                <v-icon color="#667eea">mdi-alert-circle-outline</v-icon>
                <h3 class="insight-card__title">{{ insight.title }}</h3>
              </div>
              <p class="insight-card__description">{{ insight.description }}</p>
            </div>
          </div>
          <div class="construction-note">
            <UnderConstructionPanel
              :title="$t('placeholders.title')"
              :message="$t('placeholders.coffee')"
            />
          </div>
        </div>
      </div>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import UnderConstructionPanel from '@/components/UnderConstructionPanel.vue'

const { t } = useI18n()

const insights = computed(() => [
  {
    title: t('insights.sample_1_title'),
    description: t('insights.sample_1_desc'),
  },
  {
    title: t('insights.sample_2_title'),
    description: t('insights.sample_2_desc'),
  },
  {
    title: t('insights.sample_3_title'),
    description: t('insights.sample_3_desc'),
  },
])
</script>

<style scoped>
.insights-page {
  min-height: 100vh;
  background: linear-gradient(135deg, rgba(245, 247, 250, 1) 0%, rgba(232, 234, 240, 1) 100%);
  padding: 32px 0;
}

.v-theme--dark .insights-page {
  background: linear-gradient(135deg, rgba(30, 30, 30, 1) 0%, rgba(20, 20, 20, 1) 100%);
}

.modern-container {
  max-width: 1200px;
  padding-left: 16px;
  padding-right: 16px;
}

.page-header {
  margin-bottom: 32px;
}

.page-title {
  font-size: 2.2rem;
  font-weight: 700;
  margin: 0 0 8px;
  color: #1a1a1a;
}

.v-theme--dark .page-title {
  color: #ffffff;
}

.page-subtitle {
  margin: 0;
  color: #666;
  font-size: 1rem;
}

.v-theme--dark .page-subtitle {
  color: #b0b0b0;
}

.modern-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.v-theme--dark .modern-card {
  background: #2a2a2a;
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.card-header {
  padding: 20px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(102, 126, 234, 0.03);
}

.v-theme--dark .card-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(102, 126, 234, 0.08);
}

.card-title {
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  color: #1a1a1a;
}

.v-theme--dark .card-title {
  color: #ffffff;
}

.card-content {
  padding: 24px;
}

.insights-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
}

.insight-card {
  border-radius: 14px;
  padding: 18px;
  background: rgba(102, 126, 234, 0.05);
  border: 1px solid rgba(102, 126, 234, 0.12);
}

.v-theme--dark .insight-card {
  background: rgba(102, 126, 234, 0.14);
  border-color: rgba(102, 126, 234, 0.2);
}

.insight-card__header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.insight-card__title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 600;
  color: #1a1a1a;
}

.v-theme--dark .insight-card__title {
  color: #ffffff;
}

.insight-card__description {
  margin: 0;
  color: #666;
  font-size: 0.95rem;
}

.v-theme--dark .insight-card__description {
  color: #b0b0b0;
}

.construction-note {
  margin-top: 24px;
}
</style>
