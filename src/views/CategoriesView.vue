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
          <v-btn
            v-if="activeTab === 'categories'"
            class="modern-btn gradient-btn"
            @click="startCreateCategory"
          >
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

      <section class="modern-card tabs-shell">
        <div class="tabs-shell__header">
          <v-tabs v-model="activeTab" color="#667eea" class="categories-tabs">
            <v-tab value="categories">Categorias</v-tab>
            <v-tab value="tags">Tags</v-tab>
            <v-tab value="automations">Automações</v-tab>
          </v-tabs>
        </div>

        <div v-if="activeTab === 'categories'" class="tabs-shell__content">
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

          <section class="insight-band">
            <div class="insight-band__headline">
              <div class="insight-band__copy">
                <span class="eyebrow">Hub de classificação</span>
                <h2>Taxonomia pronta para budget, IA e cenários</h2>
                <p>
                  Organize o catálogo do workspace, resolva mappings Open Finance e prepare a base que alimenta classificação,
                  orçamento e simulações.
                </p>
              </div>
              <div class="insight-band__meta">
                <div class="meta-chip">
                  <span>{{ mappedBankCategoriesCount }}</span>
                  <small>mappings resolvidos</small>
                </div>
                <div class="meta-chip">
                  <span>{{ filteredCategories.length }}</span>
                  <small>categorias visíveis</small>
                </div>
              </div>
            </div>
          </section>

          <div class="content-grid">
            <section class="modern-card surface-card">
              <div class="surface-card__header">
                <div>
                  <h3 class="surface-card__title">Catálogo de categorias</h3>
                  <p class="surface-card__subtitle">Ajuste o vocabulário financeiro do workspace e acompanhe o vínculo com o Open Finance.</p>
                </div>
              </div>

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

              <div v-else-if="filteredCategories.length" class="category-list">
                <article
                  v-for="category in filteredCategories"
                  :key="`${category.id}-${category.code}`"
                  class="category-row"
                >
                  <div class="category-row__main">
                    <div class="category-row__identity">
                      <div class="category-avatar" :class="{ 'category-avatar--custom': category.systemDefined === false }">
                        <v-icon size="18">{{ category.systemDefined ? 'mdi-shape-outline' : 'mdi-pencil-outline' }}</v-icon>
                      </div>
                      <div>
                        <div class="category-row__name">{{ category.name }}</div>
                        <div class="category-row__code">{{ category.code }}</div>
                      </div>
                    </div>

                    <div class="category-row__badges">
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
                      size="small"
                      variant="outlined"
                      color="#667eea"
                      class="mapping-chip"
                    >
                      <span>{{ bankCategoryLabel(mapping.bankCategoryId) }}</span>
                      <button
                        class="mapping-chip__remove"
                        type="button"
                        :disabled="busyBankCategoryId === mapping.bankCategoryId"
                        @click="removeMapping(mapping.bankCategoryId)"
                      >
                        <v-icon size="14">mdi-close</v-icon>
                      </button>
                    </v-chip>
                  </div>

                  <div class="category-row__actions">
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
                </article>
              </div>

              <div v-else class="empty-state">
                <v-icon size="48" color="#667eea" class="mb-3">mdi-shape-off</v-icon>
                <p class="empty-message">Nenhuma categoria encontrada para esse filtro.</p>
              </div>
            </section>

            <section class="modern-card surface-card">
              <div class="surface-card__header">
                <div>
                  <h3 class="surface-card__title">Mappings Open Finance</h3>
                  <p class="surface-card__subtitle">Resolva aqui o vínculo entre categorias bancárias e o catálogo interno do workspace.</p>
                </div>
              </div>

              <div v-if="unmappedBankCategories.length" class="mapping-queue">
                <article v-for="bankCategory in unmappedBankCategories" :key="bankCategory.id" class="mapping-queue__row">
                  <div>
                    <div class="mapping-queue__name">{{ bankCategory.name || bankCategory.id }}</div>
                    <div class="mapping-queue__meta">
                      {{ bankCategory.parentId ? `Parent: ${bankCategory.parentId}` : 'Categoria sincronizada sem parentId' }}
                    </div>
                  </div>

                  <div class="mapping-queue__controls">
                    <v-select
                      v-model="mappingSelections[bankCategory.id]"
                      :items="mappingOptions"
                      item-title="label"
                      item-value="value"
                      label="Mapear para"
                      density="comfortable"
                      variant="outlined"
                      class="mapping-select"
                      hide-details
                    />
                    <v-btn
                      class="modern-btn gradient-btn"
                      :loading="busyBankCategoryId === bankCategory.id"
                      :disabled="!mappingSelections[bankCategory.id]"
                      @click="saveMapping(bankCategory.id)"
                    >
                      Mapear
                    </v-btn>
                  </div>
                </article>
              </div>

              <div v-else class="empty-state compact-empty">
                <v-icon size="44" color="#667eea" class="mb-3">mdi-check-circle-outline</v-icon>
                <p class="empty-message">Nenhuma categoria bancária pendente de mapping.</p>
              </div>

              <div class="mapping-footer">
                <v-btn variant="text" color="#667eea" @click="goToOpenFinanceSettings">
                  Abrir conexões Open Finance
                </v-btn>
              </div>
            </section>
          </div>
        </div>

        <div v-else-if="activeTab === 'tags'" class="tabs-shell__content">
          <section class="placeholder-state">
            <div class="placeholder-state__icon">
              <v-icon size="56">mdi-tag-outline</v-icon>
            </div>
            <h2>Tags virão na próxima fase</h2>
            <p>
              Vamos usar esta aba para classificação transversal, filtros e agrupamentos que não devem virar categoria contábil.
            </p>
          </section>
        </div>

        <div v-else class="tabs-shell__content">
          <section class="placeholder-state">
            <div class="placeholder-state__icon">
              <v-icon size="56">mdi-tune-variant</v-icon>
            </div>
            <h2>Automações virão na próxima fase</h2>
            <p>
              Aqui ficarão regras explícitas do tipo “SE descrição contém X, ENTÃO definir categoria Y”, sempre com rastreabilidade.
            </p>
          </section>
        </div>
      </section>
    </v-container>

    <v-navigation-drawer
      v-model="editorDrawer"
      location="right"
      temporary
      width="460"
      class="category-drawer"
    >
      <div class="drawer-shell">
        <div class="drawer-shell__header">
          <div>
            <h2>{{ editingCategoryId ? 'Editar categoria' : 'Nova categoria' }}</h2>
            <p>Organize o catálogo do workspace com uma taxonomia consistente para budget, IA e cenários.</p>
          </div>
          <v-btn icon variant="text" @click="closeEditor">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>

        <div class="drawer-shell__body">
          <section class="drawer-section">
            <span class="drawer-section__label">Estrutura</span>
            <div class="type-toggle">
              <button
                type="button"
                class="type-toggle__option"
                :class="{ 'type-toggle__option--active': editorDirection === 'EXPENSE' }"
                @click="editorDirection = 'EXPENSE'"
              >
                <v-icon size="18">mdi-arrow-up</v-icon>
                Despesa
              </button>
              <button
                type="button"
                class="type-toggle__option"
                :class="{ 'type-toggle__option--active': editorDirection === 'INCOME' }"
                @click="editorDirection = 'INCOME'"
              >
                <v-icon size="18">mdi-arrow-down</v-icon>
                Receita
              </button>
            </div>

            <v-text-field
              v-model="editorName"
              label="Nome"
              placeholder="Ex: Marketing, Receita recorrente"
              variant="outlined"
              density="comfortable"
              color="#667eea"
              class="modern-input"
            />

            <v-text-field
              v-model="editorCode"
              label="Código"
              hint="Use um identificador estável, ex: marketing_recorrente"
              persistent-hint
              variant="outlined"
              density="comfortable"
              color="#667eea"
              class="modern-input"
            />
          </section>

          <section class="drawer-section drawer-section--muted">
            <span class="drawer-section__label">Próximas fases previstas</span>
            <div class="future-grid">
              <div class="future-card">
                <strong>Subcategorias</strong>
                <span>Hierarquia pai/filha para navegação e consolidação.</span>
              </div>
              <div class="future-card">
                <strong>Ícone e cor</strong>
                <span>Identidade visual para facilitar leitura rápida na lista.</span>
              </div>
              <div class="future-card">
                <strong>Limites</strong>
                <span>Vínculo com orçamento mensal por categoria.</span>
              </div>
              <div class="future-card">
                <strong>Automações</strong>
                <span>Regras explícitas para classificação recorrente.</span>
              </div>
            </div>
          </section>
        </div>

        <div class="drawer-shell__footer">
          <v-btn variant="text" @click="closeEditor">Cancelar</v-btn>
          <v-btn class="modern-btn gradient-btn" :loading="savingCategory" @click="saveCategory">
            {{ editingCategoryId ? 'Salvar ajustes' : 'Criar categoria' }}
          </v-btn>
        </div>
      </div>
    </v-navigation-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import DataService from '@/services/DataService'
import OpenFinanceService from '@/services/OpenFinanceService'
import type { OpenFinanceBankCategory, OpenFinanceCategoryMapping } from '@/types/openFinance'

type CategoriesTab = 'categories' | 'tags' | 'automations'
type CategoryDirection = 'EXPENSE' | 'INCOME'

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

interface MappingOption {
  label: string
  value: number
}

const { locale, t } = useI18n()
const router = useRouter()

const activeTab = ref<CategoriesTab>('categories')
const categories = ref<CategoryItem[]>([])
const bankCategories = ref<OpenFinanceBankCategory[]>([])
const bankMappings = ref<OpenFinanceCategoryMapping[]>([])
const loading = ref(false)
const search = ref('')
const showMappedOnly = ref(false)
const showInactiveCustom = ref(false)
const editorDrawer = ref(false)
const editorName = ref('')
const editorCode = ref('')
const editorDirection = ref<CategoryDirection>('EXPENSE')
const editingCategoryId = ref<number | null>(null)
const savingCategory = ref(false)
const deactivatingCategoryId = ref<number | null>(null)
const busyBankCategoryId = ref<string | null>(null)
const mappingSelections = ref<Record<string, number | null>>({})
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

const mappingOptions = computed<MappingOption[]>(() =>
  categoriesWithMappings.value
    .filter((category) => category.active !== false)
    .map((category) => ({
      label: `${category.name} (${category.code})`,
      value: category.id as number,
    })),
)

const systemCategoriesCount = computed(() => categories.value.filter((category) => category.systemDefined !== false).length)
const customCategoriesCount = computed(() => categories.value.filter((category) => category.systemDefined === false).length)
const inactiveCustomCategoriesCount = computed(() => categories.value.filter((category) => category.systemDefined === false && category.active === false).length)
const mappedBankCategoriesCount = computed(() => bankMappings.value.length)

const unmappedBankCategories = computed(() => {
  const mappedIds = new Set(bankMappings.value.map((mapping) => mapping.bankCategoryId))
  return bankCategories.value.filter((category) => !mappedIds.has(category.id))
})

const bankCategoryLabel = (bankCategoryId: string) => {
  const bankCategory = bankCategories.value.find((item) => item.id === bankCategoryId)
  return bankCategory?.name || bankCategoryId
}

const buildSuggestedCode = (name: string) =>
  String(name || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')

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
    const categoriesResponse = await DataService.listCategories()

    categories.value = normalizeCategoriesPayload(categoriesResponse.data)
      .map(mapApiCategory)
      .filter((category): category is CategoryItem => Boolean(category))

    const [bankCategoriesResult, mappingsResult] = await Promise.allSettled([
      OpenFinanceService.listBankCategories(),
      OpenFinanceService.listCategoryMappings(),
    ])

    if (bankCategoriesResult.status === 'fulfilled') {
      bankCategories.value = Array.isArray(bankCategoriesResult.value.data) ? bankCategoriesResult.value.data : []
    } else {
      bankCategories.value = []
      console.warn('Open Finance categories unavailable for CategoriesView:', bankCategoriesResult.reason)
    }

    if (mappingsResult.status === 'fulfilled') {
      bankMappings.value = Array.isArray(mappingsResult.value.data) ? mappingsResult.value.data : []
    } else {
      bankMappings.value = []
      console.warn('Open Finance category mappings unavailable for CategoriesView:', mappingsResult.reason)
    }
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
  editorDirection.value = 'EXPENSE'
  editorDrawer.value = true
}

const startEditCategory = (category: CategoryItem) => {
  editingCategoryId.value = category.id
  editorName.value = category.name
  editorCode.value = category.code
  editorDirection.value = category.code.includes('income') || category.code.includes('revenue') ? 'INCOME' : 'EXPENSE'
  editorDrawer.value = true
}

const closeEditor = () => {
  editorDrawer.value = false
  editingCategoryId.value = null
  editorName.value = ''
  editorCode.value = ''
  editorDirection.value = 'EXPENSE'
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

const saveMapping = async (bankCategoryId: string) => {
  const categoryId = mappingSelections.value[bankCategoryId]
  if (!categoryId) {
    return
  }

  busyBankCategoryId.value = bankCategoryId
  try {
    await OpenFinanceService.upsertCategoryMapping(bankCategoryId, categoryId, true)
    feedback.value = {
      type: 'success',
      message: 'Mapping Open Finance atualizado com sucesso.',
    }
    mappingSelections.value = { ...mappingSelections.value, [bankCategoryId]: null }
    await fetchCategories()
  } catch (error: any) {
    feedback.value = {
      type: 'error',
      message: error?.response?.data?.message || 'Não foi possível salvar o mapping.',
    }
  } finally {
    busyBankCategoryId.value = null
  }
}

const removeMapping = async (bankCategoryId: string) => {
  busyBankCategoryId.value = bankCategoryId
  try {
    await OpenFinanceService.deleteCategoryMapping(bankCategoryId, false)
    feedback.value = {
      type: 'success',
      message: 'Mapping Open Finance removido com sucesso.',
    }
    await fetchCategories()
  } catch (error: any) {
    feedback.value = {
      type: 'error',
      message: error?.response?.data?.message || 'Não foi possível remover o mapping.',
    }
  } finally {
    busyBankCategoryId.value = null
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

watch(editorName, (value) => {
  if (editingCategoryId.value || editorCode.value.trim().length > 0) {
    return
  }
  editorCode.value = buildSuggestedCode(value)
})

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
  max-width: 1440px;
  padding-left: 16px;
  padding-right: 16px;
}

.page-header {
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
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
  color: #667085;
  font-size: 1rem;
  max-width: 720px;
}

.modern-btn {
  border-radius: 10px;
  text-transform: none;
  font-weight: 600;
  letter-spacing: 0;
}

.gradient-btn {
  background: linear-gradient(135deg, #667eea 0%, #5a67d8 100%);
  color: #ffffff;
  box-shadow: 0 10px 24px rgba(102, 126, 234, 0.25);
}

.tabs-shell {
  overflow: hidden;
}

.tabs-shell__header {
  border-bottom: 1px solid rgba(148, 163, 184, 0.18);
}

.tabs-shell__content {
  padding: 24px;
}

.categories-tabs :deep(.v-tab) {
  text-transform: none;
  letter-spacing: 0;
  min-width: 120px;
  font-weight: 600;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.75);
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 8px;
  padding: 18px 20px;
}

.v-theme--dark .stat-card {
  background: rgba(30, 41, 59, 0.65);
  border-color: rgba(148, 163, 184, 0.18);
}

.stat-card--warning {
  border-color: rgba(245, 158, 11, 0.38);
}

.stat-card__label {
  color: #667085;
  font-size: 0.9rem;
  margin-bottom: 8px;
}

.stat-card__value {
  color: #111827;
  font-size: 2rem;
  font-weight: 700;
}

.v-theme--dark .stat-card__value {
  color: #f8fafc;
}

.insight-band {
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 8px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.85), rgba(248, 250, 252, 0.95));
  padding: 24px;
  margin-bottom: 24px;
}

.v-theme--dark .insight-band {
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.88), rgba(30, 41, 59, 0.9));
}

.insight-band__headline {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  align-items: flex-start;
}

.eyebrow {
  display: inline-block;
  font-size: 0.8rem;
  font-weight: 700;
  color: #667eea;
  text-transform: uppercase;
  margin-bottom: 10px;
}

.insight-band__copy h2 {
  margin: 0 0 10px;
  font-size: 1.7rem;
  color: #111827;
}

.v-theme--dark .insight-band__copy h2 {
  color: #f8fafc;
}

.insight-band__copy p {
  margin: 0;
  color: #667085;
  max-width: 780px;
}

.insight-band__meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(140px, 1fr));
  gap: 12px;
  min-width: 320px;
}

.meta-chip {
  border: 1px solid rgba(102, 126, 234, 0.18);
  border-radius: 8px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.85);
}

.v-theme--dark .meta-chip {
  background: rgba(30, 41, 59, 0.75);
}

.meta-chip span {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
}

.v-theme--dark .meta-chip span {
  color: #f8fafc;
}

.meta-chip small {
  color: #667085;
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(360px, 0.9fr);
  gap: 24px;
}

.surface-card {
  padding: 24px;
}

.surface-card__header {
  margin-bottom: 20px;
}

.surface-card__title {
  margin: 0 0 6px;
  font-size: 1.25rem;
  color: #111827;
}

.v-theme--dark .surface-card__title {
  color: #f8fafc;
}

.surface-card__subtitle {
  margin: 0;
  color: #667085;
}

.filters-row {
  display: grid;
  grid-template-columns: minmax(240px, 1fr) auto auto;
  gap: 16px;
  align-items: center;
  margin-bottom: 20px;
}

.modern-input {
  min-width: 0;
}

.loading-state,
.empty-state,
.placeholder-state {
  min-height: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.compact-empty {
  min-height: 180px;
}

.empty-message,
.placeholder-state p {
  color: #667085;
  max-width: 460px;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.category-row {
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 8px;
  padding: 18px;
  background: rgba(255, 255, 255, 0.88);
}

.v-theme--dark .category-row {
  background: rgba(15, 23, 42, 0.72);
}

.category-row__main {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}

.category-row__identity {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.category-avatar {
  width: 42px;
  height: 42px;
  border-radius: 8px;
  background: rgba(102, 126, 234, 0.12);
  color: #667eea;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.category-avatar--custom {
  background: rgba(102, 126, 234, 0.18);
}

.category-row__name {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
}

.v-theme--dark .category-row__name {
  color: #f8fafc;
}

.category-row__code {
  font-size: 0.9rem;
  color: #667085;
}

.category-row__badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
}

.mapping-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 14px 0 0;
}

.mapping-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.mapping-chip__remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  background: transparent;
  color: inherit;
  padding: 0;
  cursor: pointer;
}

.mapping-chip__remove:disabled {
  cursor: default;
  opacity: 0.5;
}

.category-row__actions {
  display: flex;
  gap: 8px;
  margin-top: 14px;
  justify-content: flex-end;
}

.mapping-queue {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.mapping-queue__row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 360px);
  gap: 16px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 8px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.88);
}

.v-theme--dark .mapping-queue__row {
  background: rgba(15, 23, 42, 0.72);
}

.mapping-queue__name {
  font-weight: 600;
  color: #111827;
}

.v-theme--dark .mapping-queue__name {
  color: #f8fafc;
}

.mapping-queue__meta {
  margin-top: 6px;
  color: #667085;
  font-size: 0.92rem;
}

.mapping-queue__controls {
  display: flex;
  gap: 10px;
  align-items: center;
}

.mapping-select {
  flex: 1;
}

.mapping-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.placeholder-state__icon {
  width: 84px;
  height: 84px;
  border-radius: 999px;
  background: rgba(102, 126, 234, 0.12);
  color: #667eea;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 18px;
}

.placeholder-state h2 {
  margin: 0 0 10px;
  color: #111827;
}

.v-theme--dark .placeholder-state h2 {
  color: #f8fafc;
}

.category-drawer :deep(.v-navigation-drawer__content) {
  background: #ffffff;
}

.v-theme--dark .category-drawer :deep(.v-navigation-drawer__content) {
  background: #0f172a;
}

.drawer-shell {
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.drawer-shell__header,
.drawer-shell__footer {
  padding: 24px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.16);
}

.drawer-shell__footer {
  border-bottom: 0;
  border-top: 1px solid rgba(148, 163, 184, 0.16);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: auto;
}

.drawer-shell__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.drawer-shell__header h2 {
  margin: 0 0 8px;
  color: #111827;
  font-size: 1.9rem;
}

.v-theme--dark .drawer-shell__header h2 {
  color: #f8fafc;
}

.drawer-shell__header p {
  margin: 0;
  color: #667085;
}

.drawer-shell__body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.drawer-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.drawer-section--muted {
  padding-top: 8px;
}

.drawer-section__label {
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #667eea;
}

.type-toggle {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.type-toggle__option {
  min-height: 54px;
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  background: rgba(248, 250, 252, 0.92);
  color: #667085;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.type-toggle__option--active {
  background: linear-gradient(135deg, #667eea 0%, #5a67d8 100%);
  color: #ffffff;
  border-color: rgba(102, 126, 234, 0.35);
  box-shadow: 0 10px 24px rgba(102, 126, 234, 0.2);
}

.future-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.future-card {
  border: 1px dashed rgba(148, 163, 184, 0.28);
  border-radius: 8px;
  padding: 16px;
  background: rgba(248, 250, 252, 0.72);
}

.v-theme--dark .future-card {
  background: rgba(30, 41, 59, 0.5);
}

.future-card strong {
  display: block;
  color: #111827;
  margin-bottom: 6px;
}

.v-theme--dark .future-card strong {
  color: #f8fafc;
}

.future-card span {
  color: #667085;
  font-size: 0.92rem;
}

@media (max-width: 1180px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .insight-band__headline {
    flex-direction: column;
  }

  .insight-band__meta {
    min-width: 0;
    width: 100%;
  }
}

@media (max-width: 900px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .filters-row {
    grid-template-columns: 1fr;
  }

  .mapping-queue__row {
    grid-template-columns: 1fr;
  }

  .mapping-queue__controls {
    flex-direction: column;
    align-items: stretch;
  }

  .future-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .tabs-shell__content,
  .surface-card,
  .drawer-shell__header,
  .drawer-shell__body,
  .drawer-shell__footer {
    padding-left: 16px;
    padding-right: 16px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .category-row__main {
    flex-direction: column;
  }

  .category-row__badges,
  .category-row__actions {
    justify-content: flex-start;
  }
}
</style>
