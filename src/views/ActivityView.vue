<template>
  <div class="activity-page">
    <v-container class="modern-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">{{ $t('overview.activity_title') }}</h1>
          <p class="page-subtitle">{{ $t('activity.subtitle') }}</p>
        </div>
        <v-btn variant="text" color="#667eea" @click="$router.push('/dashboard')">
          <v-icon start>mdi-arrow-left</v-icon>
          {{ $t('activity.back_to_dashboard') }}
        </v-btn>
      </div>

      <div class="modern-card">
        <div class="card-content">
          <div class="scope-badge-row">
            <v-chip size="small" color="#667eea" variant="outlined">
              <v-icon start size="14">mdi-account-group-outline</v-icon>
              {{ $t('overview.activity_badge') }}
            </v-chip>
            <span class="scope-badge-note">{{ $t('overview.activity_scope_note') }}</span>
          </div>

          <div class="activity-filters">
            <v-chip
              v-for="filter in activityFilters"
              :key="filter.value"
              size="small"
              :variant="selectedFilter === filter.value ? 'flat' : 'outlined'"
              :color="selectedFilter === filter.value ? '#667eea' : undefined"
              @click="selectedFilter = filter.value"
            >
              {{ filter.title }}
            </v-chip>
          </div>

          <div v-if="loading" class="empty-state">
            <p>{{ $t('overview.activity_loading') }}</p>
          </div>

          <div v-else-if="filteredActivity.length" class="activity-feed">
            <div
              v-for="event in filteredActivity"
              :key="event.id"
              class="activity-row"
            >
              <div class="activity-row__icon">
                <v-icon :color="activityAccent(event).color">{{ activityAccent(event).icon }}</v-icon>
              </div>
              <div class="activity-row__content">
                <div class="activity-row__header">
                  <strong>{{ event.title || $t('overview.activity_fallback_title') }}</strong>
                  <span class="activity-row__time">{{ formatActivityTime(event.createdAt) }}</span>
                </div>
                <p class="activity-row__description">{{ event.description || $t('overview.activity_fallback_description') }}</p>
                <div class="activity-row__meta">
                  <span>{{ actorLabel(event.actorUserId) }}</span>
                  <v-btn
                    v-if="activityRoute(event)"
                    size="x-small"
                    variant="text"
                    color="#667eea"
                    @click="openActivity(event)"
                  >
                    <v-icon start size="14">mdi-open-in-new</v-icon>
                    {{ $t('overview.activity_open') }}
                  </v-btn>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="empty-state">
            <p>{{ selectedFilter === 'all' ? $t('overview.activity_empty') : $t('overview.activity_empty_filtered') }}</p>
          </div>
        </div>
      </div>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import ActivityService, { type CompanyActivityEvent } from '@/services/ActivityService'

const { t, locale } = useI18n()
const router = useRouter()

const loading = ref(false)
const recentActivity = ref<CompanyActivityEvent[]>([])
const selectedFilter = ref<'all' | 'transactions' | 'scenarios' | 'decisions'>('all')

const activityFilters = computed<Array<{ title: string; value: 'all' | 'transactions' | 'scenarios' | 'decisions' }>>(() => [
  { title: t('overview.activity_filter_all'), value: 'all' },
  { title: t('overview.activity_filter_transactions'), value: 'transactions' },
  { title: t('overview.activity_filter_scenarios'), value: 'scenarios' },
  { title: t('overview.activity_filter_decisions'), value: 'decisions' },
])

const filteredActivity = computed(() => {
  if (selectedFilter.value === 'all') return recentActivity.value
  return recentActivity.value.filter((event) => activityFilterKey(event) === selectedFilter.value)
})

const getLocaleForFormatting = () => {
  if (locale.value === 'en') return 'en-US'
  if (locale.value === 'fr') return 'fr-FR'
  if (locale.value === 'es') return 'es-ES'
  return 'pt-BR'
}

const loadActivity = async () => {
  loading.value = true
  try {
    const { data } = await ActivityService.list(30)
    recentActivity.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Error loading activity feed:', error)
    recentActivity.value = []
  } finally {
    loading.value = false
  }
}

const activityFilterKey = (event: CompanyActivityEvent) => {
  const type = String(event?.eventType || '')
  if (type.startsWith('TRANSACTION_SHARED_')) return 'transactions'
  if (type.startsWith('SCENARIO_')) return 'scenarios'
  if (type.startsWith('DECISION_')) return 'decisions'
  return 'all'
}

const activityAccent = (event: CompanyActivityEvent) => {
  const type = String(event?.eventType || '')
  if (type.startsWith('TRANSACTION_SHARED_')) return { icon: 'mdi-swap-horizontal-bold', color: '#667eea' }
  if (type.startsWith('SCENARIO_')) return { icon: 'mdi-chart-timeline-variant', color: '#7c3aed' }
  if (type.startsWith('DECISION_')) return { icon: 'mdi-gavel', color: '#ea580c' }
  return { icon: 'mdi-bell-outline', color: '#64748b' }
}

const actorLabel = (actorUserId?: string) => {
  if (!actorUserId) return t('overview.activity_actor_system')
  const raw = String(actorUserId)
  const label = raw.includes('@') ? raw.split('@')[0] : raw
  return t('overview.activity_actor_label', { actor: label })
}

const formatActivityTime = (value?: string) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat(getLocaleForFormatting(), {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}

const activityRoute = (event: CompanyActivityEvent) => {
  const relatedType = String(event?.relatedEntityType || '')
  if (relatedType === 'TRANSACTION') return '/budget'
  if (relatedType === 'SCENARIO') return '/planning/scenarios'
  if (relatedType === 'DECISION') return '/decisions'
  return null
}

const openActivity = async (event: CompanyActivityEvent) => {
  const path = activityRoute(event)
  if (!path) return
  if (path === '/budget') {
    await router.push({ path, query: { visibility: 'company' } })
    return
  }
  if (path === '/planning/scenarios' && event?.relatedEntityId) {
    await router.push({ path, query: { scenarios: event.relatedEntityId } })
    return
  }
  await router.push(path)
}

onMounted(loadActivity)
</script>

<style scoped>
.activity-page {
  min-height: 100vh;
  background: linear-gradient(135deg, rgba(245, 247, 250, 1) 0%, rgba(232, 234, 240, 1) 100%);
  padding: 32px 0;
}

.v-theme--dark .activity-page {
  background: linear-gradient(135deg, rgba(30, 30, 30, 1) 0%, rgba(20, 20, 20, 1) 100%);
}

.modern-container {
  max-width: 1200px;
  padding-left: 16px;
  padding-right: 16px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}

.page-title {
  font-size: 2.2rem;
  font-weight: 700;
  margin: 0 0 8px;
  color: #1a1a1a;
}

.page-subtitle {
  margin: 0;
  color: #64748b;
  font-size: 1rem;
}

.modern-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.v-theme--dark .modern-card {
  background: #2a2a2a;
  border-color: rgba(255, 255, 255, 0.1);
}

.card-content {
  padding: 24px;
}

.scope-badge-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.scope-badge-note,
.activity-row__time,
.activity-row__meta,
.activity-row__description {
  color: #64748b;
}

.activity-filters {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin: 14px 0 18px;
}

.activity-feed {
  display: grid;
  gap: 14px;
}

.activity-row {
  display: grid;
  grid-template-columns: 40px 1fr;
  gap: 12px;
  align-items: flex-start;
  padding: 14px 0;
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
}

.activity-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.activity-row__icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: rgba(102, 126, 234, 0.08);
}

.activity-row__content {
  display: grid;
  gap: 6px;
}

.activity-row__header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  color: #0f172a;
}

.activity-row__description {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.45;
}

.activity-row__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  font-size: 0.86rem;
}

.empty-state {
  display: grid;
  gap: 8px;
  justify-items: center;
  text-align: center;
  padding: 32px 18px;
  border-radius: 14px;
  background: rgba(248, 250, 252, 0.7);
  border: 1px dashed rgba(148, 163, 184, 0.35);
  color: #64748b;
}

.v-theme--dark .page-title,
.v-theme--dark .activity-row__header {
  color: #ffffff;
}

.v-theme--dark .page-subtitle,
.v-theme--dark .scope-badge-note,
.v-theme--dark .activity-row__time,
.v-theme--dark .activity-row__meta,
.v-theme--dark .activity-row__description,
.v-theme--dark .empty-state {
  color: #cbd5e1;
}
</style>
