<template>
  <div class="cb-page">
    <div class="cb-container">
      <page-header :title="t('report_view.title')" :meta="t('report_view.subtitle')" />

      <div class="cb-scope-note">
        <v-icon size="14" color="var(--cb-ink-muted)">mdi-account-group-outline</v-icon>
        <span>{{ t('transactionVisibility.reportScopeNote') }}</span>
      </div>

      <report-generator
        :initial-report-type="initialReportType"
        :initial-start-date="initialStartDate"
        :initial-end-date="initialEndDate"
        :initial-category-filter="initialCategoryFilter"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import ReportGenerator from '@/components/ReportGenerator.vue'
import PageHeader from '@/components/PageHeader.vue'

const { t } = useI18n()
const route = useRoute()

const initialReportType = computed(() =>
  typeof route.query?.reportType === 'string' ? route.query.reportType : 'expenses'
)
const initialStartDate = computed(() =>
  typeof route.query?.startDate === 'string' ? route.query.startDate : null
)
const initialEndDate = computed(() =>
  typeof route.query?.endDate === 'string' ? route.query.endDate : null
)
const initialCategoryFilter = computed(() =>
  typeof route.query?.category === 'string' ? route.query.category : null
)
</script>

<style scoped>
.cb-scope-note {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: .82rem;
  color: var(--cb-ink-muted);
  margin-bottom: 20px;
}
</style>
