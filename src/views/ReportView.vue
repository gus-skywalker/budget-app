<template>
  <div class="cb-page experience-page experience-page--reports">
    <div class="cb-container">
      <page-header :title="t('report_view.title')" :meta="t('report_view.subtitle')" />

      <div class="cb-scope-note">
        <v-icon size="14" color="var(--cb-ink-muted)">mdi-account-group-outline</v-icon>
        <span>{{ t('transactionVisibility.reportScopeNote') }}</span>
      </div>

      <report-analytics-panel />

      <details class="report-export" :open="hasReportQuery ? true : undefined">
        <summary class="report-export__summary">
          <span class="report-export__icon"><v-icon size="22">mdi-file-chart-outline</v-icon></span>
          <span class="report-export__copy">
            <strong>{{ t('report_view.export_title') }}</strong>
            <small>{{ t('report_view.export_description') }}</small>
          </span>
          <v-icon class="report-export__chevron" size="22">mdi-chevron-down</v-icon>
        </summary>
        <report-generator
          :initial-report-type="initialReportType"
          :initial-start-date="initialStartDate"
          :initial-end-date="initialEndDate"
          :initial-category-filter="initialCategoryFilter"
        />
      </details>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import ReportAnalyticsPanel from '@/components/ReportAnalyticsPanel.vue'
import ReportGenerator from '@/components/ReportGenerator.vue'
import PageHeader from '@/components/PageHeader.vue'

const { t } = useI18n()
const route = useRoute()
const hasReportQuery = computed(() => ['reportType', 'startDate', 'endDate', 'category']
  .some((key) => typeof route.query?.[key] === 'string'))

const initialReportType = computed(() =>
  typeof route.query?.reportType === 'string' ? route.query.reportType : 'expenses'
)
const initialStartDate = computed(() =>
  typeof route.query?.startDate === 'string' ? route.query.startDate : undefined
)
const initialEndDate = computed(() =>
  typeof route.query?.endDate === 'string' ? route.query.endDate : undefined
)
const initialCategoryFilter = computed(() =>
  typeof route.query?.category === 'string' ? route.query.category : undefined
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
.report-export { margin-top: 24px; border: 1px solid var(--cb-border-card); border-radius: 18px; background: var(--cb-surface-card); box-shadow: var(--cb-shadow-soft); }
.report-export__summary { display: flex; align-items: center; gap: 16px; padding: 22px; cursor: pointer; list-style: none; }
.report-export__summary::-webkit-details-marker { display: none; }
.report-export__icon { display: grid; place-items: center; flex: 0 0 44px; width: 44px; height: 44px; border-radius: 12px; background: var(--cb-primary-bg); color: var(--cb-accent); }
.report-export__copy { display: grid; gap: 4px; flex: 1; }
.report-export__copy strong { color: var(--cb-ink); font-size: 1.1rem; }
.report-export__copy small { color: var(--cb-ink-secondary); line-height: 1.4; }
.report-export__chevron { transition: transform .2s ease; }
.report-export[open] .report-export__chevron { transform: rotate(180deg); }
.report-export :deep(.report-generator-wrapper) { min-height: 0; padding: 0 0 24px; background: transparent; }
.report-export :deep(.report-generator-wrapper > .cb-container) { box-sizing: border-box; width: 100%; max-width: none; padding: 0; }
.report-export :deep(.report-generator-wrapper .cb-card) { box-shadow: none; }
</style>
