<template>
  <div class="categories-page">
    <v-container class="modern-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">{{ $t('categories_page.title') }}</h1>
          <p class="page-subtitle">{{ $t('categories_page.subtitle') }}</p>
        </div>
        <div class="page-header__actions">
          <v-btn class="modern-btn" variant="outlined" color="#667eea" @click="goToOpenFinanceSettings">
            <v-icon start>mdi-bank-outline</v-icon>
            Open Finance
          </v-btn>
          <v-btn class="modern-btn gradient-btn" @click="startCreateCategory">
            <v-icon start>mdi-plus</v-icon>
            Nova categoria
          </v-btn>
        </div>
      </div>

      <v-alert
        v-if="feedback.message"
        :type="feedback.type"
        variant="tonal"
        class="mb-4"
      >
        {{ feedback.message }}
      </v-alert>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-card__label">Categorias padrão</div>
          <div class="stat-card__value">{{ systemCategoriesCount }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__label">Categorias customizadas</div>
          <div class="stat-card__value">{{ customCategoriesCount }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__label">Customizadas inativas</div>
          <div class="stat-card__value">{{ inactiveCustomCategoriesCount }}</div>
        </div>
        <div class="stat-card" :class="{ 'stat-card--warning': unmappedBankCategories.length > 0 }">
          <div class="stat-card__label">Pendências Open Finance</div>
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
            <v-switch
              v-model="showInactiveCustom"
              color="#667eea"
              hide-details
              label="Mostrar customizadas inativas"
            />
          </div>

          <div v-if="loading" class="loading-state">
            <v-progress-circular indeterminate color="#667eea" size="40" />
          </div>

          <div v-else-if="filteredCategories.length" class="categories-grid">
            <div v-for="category in filteredCategories" :key="`${category.id}-${category.code}`" class="category-card">
              <div class="category-card__header">
                <div>
                  <div class="category-card__name">{{ category.name }}</div>
                  <div class="category-card__code">{{ category.code }}</div>
                </div>
                <div class="category-card__badges">
                  <v-chip size="small" variant="tonal" :color="category.systemDefined ? 'default' : 'primary'">
                    {{ category.systemDefined ? 'Padrão' : 'Customizada' }}
                  </v-chip>
                  <v-chip
                    v-if="category.bankMappings.length"
                    size="small"
                    variant="tonal"
                    color="success"
                  >
                    {{ category.bankMappings.length }} mapping(s)
                  </v-chip>
                  <v-chip
                    v-if="category.active === false"
                    size="small"
                    variant="tonal"
                    color="warning"
                  >
                    Inativa
                  </v-chip>
                </div>
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

              <div class="category-card__actions">
                <v-btn
                  v-if="!category.systemDefined && category.active !== false"
                  size="small"
                  variant="text"
                  color="#667eea"
                  @click="startEditCategory(category)"
                >
                  Editar
                </v-btn>
                <v-btn
                  v-if="!category.systemDefined && category.active !== false"
                  size="small"
                  variant="text"
                  color="warning"
                  :loading="deactivatingCategoryId === category.id"
                  @click="deactivateCategory(category)"
                >
                  Desativar
                </v-btn>
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

    <v-dialog v-model="editorDialog" max-width="560">
      <v-card class="modern-dialog-card">
        <v-card-title class="dialog-header">
          <v-icon color="#667eea" class="mr-2">mdi-pencil-outline</v-icon>
          <span class="headline">{{ editingCategoryId ? 'Editar categoria' : 'Nova categoria' }}</span>
        </v-card-title>
        <v-card-text class="dialog-content">
          <v-text-field
            v-model="editorName"
            label="Nome"
            variant="outlined"
            density="comfortable"
            color="#667eea"
            class="modern-input mb-3"
          />
          <v-text-field
            v-model="editorCode"
            label="Código"
            hint="Use um identificador estável, ex: lazer_premium"
            persistent-hint
            variant="outlined"
            density="comfortable"
            color="#667eea"
            class="modern-input"
          />
        </v-card-text>
        <v-card-actions class="dialog-actions">
          <v-spacer />
          <v-btn variant="text" @click="closeEditor">Cancelar</v-btn>
          <v-btn class="modern-btn gradient-btn" :loading="savingCategory" @click="saveCategory">
            Salvar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
  systemDefined?: boolean
  active?: boolean
}

interface ApiCategoryItem {
  id?: number | null
  code?: string
  name?: string
  systemDefined?: boolean
  active?: boolean
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
const showInactiveCustom = ref(false)
const editorDialog = ref(false)
const editorName = ref('')
const editorCode = ref('')
const editingCategoryId = ref<number | null>(null)
const savingCategory = ref(false)
const deactivatingCategoryId = ref<number | null>(null)
const feedback = ref<{ type: 'success' | 'error'; message: string }>({
  type: 'success',
  message: '',
})

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
    const matchesInactive = category.systemDefined || category.active !== false || showInactiveCustom.value
    return matchesSearch && matchesMapped && matchesInactive
  })
})

const systemCategoriesCount = computed(() => categories.value.filter((category) => category.systemDefined !== false).length)
const customCategoriesCount = computed(() => categories.value.filter((category) => category.systemDefined === false).length)
const inactiveCustomCategoriesCount = computed(() => categories.value.filter((category) => category.systemDefined === false && category.active === false).length)

const unmappedBankCategories = computed(() => {
  const mappedIds = new Set(bankMappings.value.map((mapping) => mapping.bankCategoryId))
  return bankCategories.value.filter((category) => !mappedIds.has(category.id))
})

const bankCategoryLabel = (bankCategoryId: string) => {
  const bankCategory = bankCategories.value.find((item) => item.id === bankCategoryId)
  return bankCategory?.name || bankCategoryId
}

const mapApiCategory = (category: ApiCategoryItem): CategoryItem | null => {
  const code = String(category.code || '').trim()
  const fallbackName = String(category.name || code).trim()
  if (!code) {
    return null
  }
  const isSystemDefined = category.systemDefined !== false
  const translationKey = `categories.${code}`
  const translatedName = t(translationKey)
  const isTranslated = translatedName !== translationKey
  return {
    id: typeof category.id === 'number' ? category.id : null,
    code,
    name: isSystemDefined && isTranslated ? translatedName : fallbackName,
    systemDefined: isSystemDefined,
    active: category.active !== false,
  }
}

const fetchCategories = async () => {
  loading.value = true
  try {
    const [categoriesResponse, bankCategoriesResponse, mappingsResponse] = await Promise.all([
      DataService.listCategories(),
      OpenFinanceService.listBankCategories(),
      OpenFinanceService.listCategoryMappings(),
    ])

    categories.value = normalizeCategoriesPayload(categoriesResponse.data)
      .map(mapApiCategory)
      .filter((category): category is CategoryItem => Boolean(category))

    bankCategories.value = Array.isArray(bankCategoriesResponse.data) ? bankCategoriesResponse.data : []
    bankMappings.value = Array.isArray(mappingsResponse.data) ? mappingsResponse.data : []
  } catch (error) {
    console.error('Erro ao carregar categorias:', error)
    feedback.value = {
      type: 'error',
      message: 'Não foi possível carregar as categorias.',
    }
  } finally {
    loading.value = false
  }
}

const startCreateCategory = () => {
  editingCategoryId.value = null
  editorName.value = ''
  editorCode.value = ''
  editorDialog.value = true
}

const startEditCategory = (category: CategoryItem) => {
  editingCategoryId.value = category.id
  editorName.value = category.name
  editorCode.value = category.code
  editorDialog.value = true
}

const closeEditor = () => {
  editorDialog.value = false
  editingCategoryId.value = null
  editorName.value = ''
  editorCode.value = ''
}

const saveCategory = async () => {
  if (!editorName.value.trim() || !editorCode.value.trim()) {
    feedback.value = {
      type: 'error',
      message: 'Nome e código são obrigatórios.',
    }
    return
  }

  savingCategory.value = true
  try {
    const payload = {
      name: editorName.value.trim(),
      code: editorCode.value.trim(),
    }

    if (editingCategoryId.value) {
      await DataService.updateCategory(editingCategoryId.value, payload)
      feedback.value = {
        type: 'success',
        message: 'Categoria atualizada com sucesso.',
      }
    } else {
      await DataService.createCategory(payload)
      feedback.value = {
        type: 'success',
        message: 'Categoria criada com sucesso.',
      }
    }

    closeEditor()
    await fetchCategories()
  } catch (error: any) {
    feedback.value = {
      type: 'error',
      message: error?.response?.data?.message || 'Não foi possível salvar a categoria.',
    }
  } finally {
    savingCategory.value = false
  }
}

const deactivateCategory = async (category: CategoryItem) => {
  if (!category.id) {
    return
  }

  deactivatingCategoryId.value = category.id
  try {
    await DataService.deactivateCategory(category.id)
    feedback.value = {
      type: 'success',
      message: 'Categoria desativada com sucesso.',
    }
    await fetchCategories()
  } catch (error: any) {
    feedback.value = {
      type: 'error',
      message: error?.response?.data?.message || 'Não foi possível desativar a categoria.',
    }
  } finally {
    deactivatingCategoryId.value = null
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

.page-header__actions {
  display: flex;
  gap: 12px;
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
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
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

.category-card__badges,
.mapping-tags,
.category-card__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.mapping-tags {
  margin-top: 12px;
}

.category-card__actions {
  margin-top: 14px;
  justify-content: flex-end;
}

.empty-message {
  color: #666;
  margin: 0;
}

.v-theme--dark .empty-message {
  color: #b0b0b0;
}
</style>
