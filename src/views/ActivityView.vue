<template>
  <div class="cb-page">
    <div class="cb-container">
      <page-header :title="t('overview.activity_title')" :meta="t('activity.subtitle')">
        <template #actions>
          <v-btn variant="text" color="var(--cb-primary)" @click="$router.push('/dashboard')">
            <v-icon start>mdi-arrow-left</v-icon>
            {{ t('activity.back_to_dashboard') }}
          </v-btn>
        </template>
      </page-header>

      <div class="cb-card">
        <div class="cb-card__body">
          <div class="cb-scope-note">
            <v-icon size="14" color="var(--cb-ink-muted)">mdi-account-group-outline</v-icon>
            <span>{{ t('overview.activity_badge') }} — {{ t('overview.activity_scope_note') }}</span>
          </div>

          <div class="activity-filters">
            <v-chip
              v-for="filter in activityFilters"
              :key="filter.value"
              size="small"
              :variant="selectedFilter === filter.value ? 'flat' : 'outlined'"
              :color="selectedFilter === filter.value ? 'var(--cb-primary)' : undefined"
              @click="selectedFilter = filter.value"
            >
              {{ filter.title }}
            </v-chip>
          </div>

          <div v-if="loading" class="cb-empty-state">
            <p>{{ t('overview.activity_loading') }}</p>
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
                  <strong>{{ event.title || t('overview.activity_fallback_title') }}</strong>
                  <span class="activity-row__time">{{ formatActivityTime(event.createdAt) }}</span>
                </div>
                <p class="activity-row__description">{{ event.description || t('overview.activity_fallback_description') }}</p>
                <div class="activity-row__meta">
                  <span>{{ actorLabel(event.actorUserId) }}</span>
                  <v-btn
                    v-if="activityRoute(event)"
                    size="x-small"
                    variant="text"
                    color="var(--cb-primary)"
                    @click="openActivity(event)"
                  >
                    <v-icon start size="14">mdi-open-in-new</v-icon>
                    {{ t('overview.activity_open') }}
                  </v-btn>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="cb-empty-state">
            <v-icon size="40" color="var(--cb-ink-muted)">mdi-calendar-blank-outline</v-icon>
            <p>{{ selectedFilter === 'all' ? t('overview.activity_empty') : t('overview.activity_empty_filtered') }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import ActivityService, { type WorkspaceActivityEvent } from '@/services/ActivityService'
import PageHeader from '@/components/PageHeader.vue'

const { t, locale } = useI18n()
const router = useRouter()

const loading = ref(false)
const recentActivity = ref<WorkspaceActivityEvent[]>([])
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

const activityFilterKey = (event: WorkspaceActivityEvent) => {
  const type = String(event?.eventType || '')
  if (type.startsWith('TRANSACTION_SHARED_')) return 'transactions'
  if (type.startsWith('SCENARIO_')) return 'scenarios'
  if (type.startsWith('DECISION_')) return 'decisions'
  return 'all'
}

const activityAccent = (event: WorkspaceActivityEvent) => {
  const type = String(event?.eventType || '')
  if (type.startsWith('TRANSACTION_SHARED_')) return { icon: 'mdi-swap-horizontal-bold', color: 'var(--cb-primary)' }
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

const activityRoute = (event: WorkspaceActivityEvent) => {
  const relatedType = String(event?.relatedEntityType || '')
  if (relatedType === 'TRANSACTION') return '/transactions'
  if (relatedType === 'SCENARIO') return '/planning/scenarios/:id'
  if (relatedType === 'DECISION') return '/decisions'
  return null
}

const openActivity = async (event: WorkspaceActivityEvent) => {
  const path = activityRoute(event)
  if (!path) return
  if (path === '/transactions') {
    await router.push({ path, query: { visibility: 'workspace' } })
    return
  }
  if (path === '/planning/scenarios/:id' && event?.relatedEntityId) {
    await router.push({ name: 'planning-scenarios-result', params: { id: event.relatedEntityId } })
    return
  }
  await router.push(path)
}

onMounted(loadActivity)
</script>

<style scoped>
.cb-scope-note {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: .82rem;
  color: var(--cb-ink-muted);
  margin-bottom: 16px;
}

.activity-filters {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 18px;
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
  border-bottom: 1px solid var(--cb-border-card);
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
  background: color-mix(in srgb, var(--cb-primary) 8%, transparent);
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
  color: var(--cb-ink);
}

.activity-row__time,
.activity-row__meta,
.activity-row__description {
  color: var(--cb-ink-muted);
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
</style>
