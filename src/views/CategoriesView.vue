<template>
  <div class="categories-page">
    <v-container class="modern-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">{{ $t('categories_page.title') }}</h1>
          <p class="page-subtitle">{{ $t('categories_page.subtitle') }}</p>
        </div>
        <v-btn class="modern-btn" variant="outlined" color="#667eea" @click="goToOpenFinanceSettings">
          <v-icon start>mdi-bank-outline</v-icon>
          Open Finance
        </v-btn>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-card__label">Categorias internas</div>
          <div class="stat-card__value">{{ categories.length }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__label">Categorias bancárias mapeadas</div>
          <div class="stat-card__value">{{ mappedBankCategoriesCount }}</div>
        </div>
        <div class="stat-card" :class="{ 'stat-card--warning': unmappedBankCategories.length > 0 }">
          <div class="stat-card__label">Categorias bancárias pendentes</div>
          <div class="stat-card__value">{{ unmappedBankCategories.length }}</div>
        </div>
      </div>

      <div class="modern-card">
        <div class="card-header">
          <h2 class="card-title">
            <v-icon color="#667eea" class="mr-2">mdi-shape-outline</v-icon>
            Catálogo de categorias
          </h2>
        </div>
        <div class="card-content">
          <div class="filters-row">
            <v-text-field
              v-model="search"
              label="Buscar categoria"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="comfortable"
              color="#667eea"
              class="modern-input"
              hide-details
            />
            <v-switch
              v-model="showMappedOnly"
              color="#667eea"
              hide-details
              label="Somente com mapping bancário"
            />
          </div>

          <div v-if="loading" class="loading-state">
            <v-progress-circular indeterminate color="#667eea" size="40" />
          </div>

          <div v-else-if="filteredCategories.length" class="categories-grid">
            <div v-for="category in filteredCategories" :key="category.code" class="category-card">
              <div class="category-card__header">
                <div>
                  <div class="category-card__name">{{ category.name }}</div>
                  <div class="category-card__code">{{ category.code }}</div>
                </div>
                <v-chip
                  size="small"
                  variant="tonal"
                  :color="category.bankMappings.length ? 'success' : 'default'"
                >
                  {{ category.bankMappings.length ? `${category.bankMappings.length} mapping(s)` : 'Sem mapping' }}
                </v-chip>
              </div>

              <div v-if="category.bankMappings.length" class="mapping-tags">
                <v-chip
                  v-for="mapping in category.bankMappings"
                  :key="mapping.bankCategoryId"
                  size="x-small"
                  variant="outlined"
                  color="#667eea"
                >
                  {{ bankCategoryLabel(mapping.bankCategoryId) }}
                </v-chip>
              </div>
            </div>
          </div>

          <div v-else class="empty-state">
            <v-icon size="48" color="#667eea" class="mb-3">mdi-shape-off</v-icon>
            <p class="empty-message">Nenhuma categoria encontrada para esse filtro.</p>
          </div>
        </div>
      </div>

      <div class="modern-card">
        <div class="card-header">
          <h2 class="card-title">
            <v-icon color="#667eea" class="mr-2">mdi-alert-circle-outline</v-icon>
            Pendências de Open Finance
          </h2>
        </div>
        <div class="card-content">
          <div v-if="unmappedBankCategories.length" class="pending-grid">
            <div v-for="bankCategory in unmappedBankCategories" :key="bankCategory.id" class="pending-card">
              <div>
                <div class="pending-card__name">{{ bankCategory.name || bankCategory.id }}</div>
                <div class="pending-card__meta">
                  {{ bankCategory.parentId ? `Parent: ${bankCategory.parentId}` : 'Sem parentId' }}
                </div>
              </div>
              <v-btn size="small" variant="text" color="#667eea" @click="goToOpenFinanceSettings">
                Mapear
              </v-btn>
            </div>
          </div>
          <div v-else class="empty-state">
            <v-icon size="48" color="#667eea" class="mb-3">mdi-check-circle-outline</v-icon>
            <p class="empty-message">Nenhuma categoria bancária pendente de mapping.</p>
          </div>
        </div>
      </div>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import DataService from '@/services/DataService'
import OpenFinanceService from '@/services/OpenFinanceService'
import type { OpenFinanceBankCategory, OpenFinanceCategoryMapping } from '@/types/openFinance'

interface CategoryItem {
  id: number | null
  code: string
  name: string
}

interface ApiCategoryItem {
  id?: number | null
  code?: string
  name?: string
}

interface CategoryWithMappings extends CategoryItem {
  bankMappings: OpenFinanceCategoryMapping[]
}

const { locale, t } = useI18n()
const router = useRouter()

const categories = ref<CategoryItem[]>([])
const bankCategories = ref<OpenFinanceBankCategory[]>([])
const bankMappings = ref<OpenFinanceCategoryMapping[]>([])
const loading = ref(false)
const search = ref('')
const showMappedOnly = ref(false)

const normalizeCategoriesPayload = (payload: unknown): ApiCategoryItem[] => {
  if (Array.isArray(payload)) return payload as ApiCategoryItem[]
  if (payload && typeof payload === 'object') {
    const candidate = (payload as { data?: unknown }).data
    if (Array.isArray(candidate)) return candidate as ApiCategoryItem[]
  }
  return []
}

const categoriesWithMappings = computed<CategoryWithMappings[]>(() =>
  categories.value.map((category) => ({
    ...category,
    bankMappings: bankMappings.value.filter((mapping) => mapping.categoryId === category.id),
  })),
)

const filteredCategories = computed(() => {
  const term = search.value.trim().toLowerCase()
  return categoriesWithMappings.value.filter((category) => {
    const matchesSearch =
      !term ||
      category.name.toLowerCase().includes(term) ||
      category.code.toLowerCase().includes(term)
    const matchesMapped = !showMappedOnly.value || category.bankMappings.length > 0
    return matchesSearch && matchesMapped
  })
})

const mappedBankCategoriesCount = computed(() => bankMappings.value.length)

const unmappedBankCategories = computed(() => {
  const mappedIds = new Set(bankMappings.value.map((mapping) => mapping.bankCategoryId))
  return bankCategories.value.filter((category) => !mappedIds.has(category.id))
})

const bankCategoryLabel = (bankCategoryId: string) => {
  const bankCategory = bankCategories.value.find((item) => item.id === bankCategoryId)
  return bankCategory?.name || bankCategoryId
}

const fetchCategories = async () => {
  loading.value = true
  try {
    const [categoriesResponse, bankCategoriesResponse, mappingsResponse] = await Promise.all([
      DataService.fetchCategories(locale.value || 'pt'),
      OpenFinanceService.listBankCategories(),
      OpenFinanceService.listCategoryMappings(),
    ])

    categories.value = normalizeCategoriesPayload(categoriesResponse.data)
      .map((category: ApiCategoryItem) => {
        const code = String(category.code || '').trim()
        const fallbackName = String(category.name || code).trim()
        if (!code) {
          return null
        }
        const translationKey = `categories.${code}`
        const translatedName = t(translationKey)
        const isTranslated = translatedName !== translationKey
        return {
          id: typeof category.id === 'number' ? category.id : null,
          code,
          name: isTranslated ? translatedName : fallbackName,
        }
      })
      .filter((category): category is CategoryItem => Boolean(category))

    bankCategories.value = Array.isArray(bankCategoriesResponse.data) ? bankCategoriesResponse.data : []
    bankMappings.value = Array.isArray(mappingsResponse.data) ? mappingsResponse.data : []
  } catch (error) {
    console.error('Erro ao carregar categorias:', error)
  } finally {
    loading.value = false
  }
}

const goToOpenFinanceSettings = () => {
  router.push({ name: 'settings', query: { tab: 'connections' } })
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.stat-card--warning {
  border-color: rgba(245, 158, 11, 0.35);
}

.v-theme--dark .stat-card {
  background: #2a2a2a;
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.stat-card__label {
  font-size: 0.95rem;
  color: #64748b;
  margin-bottom: 8px;
}

.stat-card__value {
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
}

.v-theme--dark .stat-card__label {
  color: #94a3b8;
}

.v-theme--dark .stat-card__value {
  color: #ffffff;
}

.modern-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
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

.filters-row {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.modern-input {
  min-width: 280px;
  flex: 1;
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

.categories-grid,
.pending-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
}

.category-card,
.pending-card {
  border-radius: 14px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  padding: 16px;
  background: rgba(102, 126, 234, 0.05);
}

.v-theme--dark .category-card,
.v-theme--dark .pending-card {
  border-color: rgba(255, 255, 255, 0.08);
  background: rgba(102, 126, 234, 0.08);
}

.category-card__header,
.pending-card {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}

.category-card__name,
.pending-card__name {
  font-size: 1rem;
  font-weight: 700;
  color: #1a1a1a;
}

.v-theme--dark .category-card__name,
.v-theme--dark .pending-card__name {
  color: #ffffff;
}

.category-card__code,
.pending-card__meta {
  color: #64748b;
  font-size: 0.85rem;
  margin-top: 4px;
}

.v-theme--dark .category-card__code,
.v-theme--dark .pending-card__meta {
  color: #94a3b8;
}

.mapping-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.empty-message {
  color: #666;
  margin: 0;
}

.v-theme--dark .empty-message {
  color: #b0b0b0;
}
</style>
