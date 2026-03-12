<template>
  <div class="categories-page">
    <v-container class="modern-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">{{ $t('categories_page.title') }}</h1>
          <p class="page-subtitle">{{ $t('categories_page.subtitle') }}</p>
        </div>
      </div>

      <div class="modern-card">
        <div class="card-header">
          <h2 class="card-title">
            <v-icon color="#667eea" class="mr-2">mdi-shape-outline</v-icon>
            {{ $t('categories_page.list_title') }}
          </h2>
        </div>
        <div class="card-content">
          <div v-if="loading" class="loading-state">
            <v-progress-circular indeterminate color="#667eea" size="40" />
          </div>
          <div v-else-if="categories.length" class="categories-grid">
            <div v-for="category in categories" :key="category.code" class="category-chip">
              <v-icon size="18" color="#667eea">mdi-tag-outline</v-icon>
              <span>{{ category.name }}</span>
            </div>
          </div>
          <div v-else class="empty-state">
            <v-icon size="48" color="#667eea" class="mb-3">mdi-shape-off</v-icon>
            <p class="empty-message">{{ $t('categories_page.empty') }}</p>
          </div>
        </div>
      </div>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import DataService from '@/services/DataService'

interface CategoryItem {
  code: string
  name: string
}

interface ApiCategoryItem {
  code?: string
  name?: string
}

const { locale, t } = useI18n()

const categories = ref<CategoryItem[]>([])
const loading = ref(false)

const normalizeCategoriesPayload = (payload: unknown): ApiCategoryItem[] => {
  if (Array.isArray(payload)) return payload as ApiCategoryItem[]
  if (payload && typeof payload === 'object') {
    const candidate = (payload as { data?: unknown }).data
    if (Array.isArray(candidate)) return candidate as ApiCategoryItem[]
  }
  return []
}

const fetchCategories = async () => {
  loading.value = true
  try {
    const response = await DataService.fetchCategories(locale.value || 'pt')
    categories.value = normalizeCategoriesPayload(response.data).map((category: ApiCategoryItem) => {
      const code = String(category.code || '').trim()
      const fallbackName = String(category.name || code).trim()
      if (!code) {
        return null
      }
      const translationKey = `categories.${code}`
      const translatedName = t(translationKey)
      const isTranslated = translatedName !== translationKey
      return {
        code,
        name: isTranslated ? translatedName : fallbackName,
      }
    }).filter((category): category is CategoryItem => Boolean(category))
  } catch (error) {
    console.error('Erro ao carregar categorias:', error)
  } finally {
    loading.value = false
  }
}

onMounted(fetchCategories)

watch(locale, () => {
  fetchCategories()
})
</script>

<style scoped>
.categories-page {
  min-height: 100vh;
  background: linear-gradient(135deg, rgba(245, 247, 250, 1) 0%, rgba(232, 234, 240, 1) 100%);
  padding: 32px 0;
}

.v-theme--dark .categories-page {
  background: linear-gradient(135deg, rgba(30, 30, 30, 1) 0%, rgba(20, 20, 20, 1) 100%);
}

.modern-container {
  max-width: 1400px;
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

.loading-state,
.empty-state {
  min-height: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.categories-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

.category-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  border-radius: 12px;
  background: rgba(102, 126, 234, 0.08);
  font-weight: 600;
  color: #1a1a1a;
}

.v-theme--dark .category-chip {
  background: rgba(102, 126, 234, 0.18);
  color: #ffffff;
}

.empty-message {
  color: #666;
  margin: 0;
}

.v-theme--dark .empty-message {
  color: #b0b0b0;
}
</style>
