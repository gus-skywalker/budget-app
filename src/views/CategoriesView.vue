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
          <v-btn
            v-else-if="activeTab === 'tags'"
            class="modern-btn gradient-btn"
            @click="startCreateTag"
          >
            <v-icon start>mdi-plus</v-icon>
            Nova tag
          </v-btn>
          <v-btn
            v-else
            class="modern-btn gradient-btn"
            @click="startCreateAutomation"
          >
            <v-icon start>mdi-plus</v-icon>
            Criar automação
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
                  :class="{ 'category-row--child': category.isChild }"
                >
                  <div class="category-row__main">
                    <div class="category-row__identity">
                      <div
                        class="category-avatar"
                        :class="{ 'category-avatar--custom': category.systemDefined === false }"
                        :style="{ backgroundColor: `${category.displayColor || '#667EEA'}22`, color: category.displayColor || '#667EEA' }"
                      >
                        <v-icon size="18">{{ category.displayIcon || (category.systemDefined ? 'mdi-shape-outline' : 'mdi-pencil-outline') }}</v-icon>
                      </div>
                      <div>
                        <div class="category-row__name">{{ category.name }}</div>
                        <div class="category-row__code">
                          {{ category.code }}
                          <span v-if="category.parentCategoryName">· filha de {{ category.parentCategoryName }}</span>
                        </div>
                      </div>
                    </div>

                    <div class="category-row__badges">
                      <v-chip size="small" variant="tonal" :color="category.type === 'INCOME' ? 'success' : 'warning'">
                        {{ category.type === 'INCOME' ? 'Receita' : 'Despesa' }}
                      </v-chip>
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
          <div class="stats-grid stats-grid--tags">
            <div class="stat-card">
              <div class="stat-card__label">Tags ativas</div>
              <div class="stat-card__value">{{ activeTagsCount }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-card__label">Tags inativas</div>
              <div class="stat-card__value">{{ inactiveTagsCount }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-card__label">Total de tags</div>
              <div class="stat-card__value">{{ tags.length }}</div>
            </div>
          </div>

          <section class="insight-band">
            <div class="insight-band__headline">
              <div class="insight-band__copy">
                <span class="eyebrow">Classificação transversal</span>
                <h2>Tags para contexto, filtros e agrupamentos futuros</h2>
                <p>
                  Use tags para sinalizar temas como viagem, reembolso ou recorrência, sem transformar tudo em categoria contábil.
                </p>
              </div>
              <div class="insight-band__meta insight-band__meta--single">
                <div class="meta-chip">
                  <span>{{ visibleTags.length }}</span>
                  <small>tags visíveis</small>
                </div>
              </div>
            </div>
          </section>

          <section class="modern-card surface-card">
            <div class="surface-card__header">
              <div>
                <h3 class="surface-card__title">Catálogo de tags</h3>
                <p class="surface-card__subtitle">Mantenha um vocabulário transversal para relatórios, filtros e automações futuras.</p>
              </div>
            </div>

            <div class="filters-row filters-row--tags">
              <v-text-field
                v-model="tagSearch"
                label="Buscar tag"
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                density="comfortable"
                color="#667eea"
                class="modern-input"
                hide-details
              />
              <v-switch
                v-model="showInactiveTags"
                color="#667eea"
                hide-details
                label="Mostrar inativas"
              />
            </div>

            <div v-if="loadingTags" class="loading-state">
              <v-progress-circular indeterminate color="#667eea" size="40" />
            </div>

            <div v-else-if="visibleTags.length" class="tag-grid">
              <article v-for="tag in visibleTags" :key="tag.id" class="tag-card">
                <div class="tag-card__main">
                  <div class="tag-pill" :style="{ backgroundColor: `${tag.displayColor || '#667EEA'}22`, color: tag.displayColor || '#667EEA' }">
                    <v-icon size="16">mdi-tag-outline</v-icon>
                    <span>{{ tag.name }}</span>
                  </div>
                  <v-chip
                    size="small"
                    variant="tonal"
                    :color="tag.active === false ? 'warning' : 'success'"
                  >
                    {{ tag.active === false ? 'Inativa' : 'Ativa' }}
                  </v-chip>
                </div>

                <div class="tag-card__actions">
                  <v-btn size="small" variant="text" color="#667eea" @click="startEditTag(tag)">
                    Editar
                  </v-btn>
                  <v-btn
                    v-if="tag.active !== false"
                    size="small"
                    variant="text"
                    color="warning"
                    :loading="deactivatingTagId === tag.id"
                    @click="deactivateTag(tag)"
                  >
                    Desativar
                  </v-btn>
                </div>
              </article>
            </div>

            <div v-else class="empty-state compact-empty">
              <v-icon size="44" color="#667eea" class="mb-3">mdi-tag-off-outline</v-icon>
              <p class="empty-message">Nenhuma tag encontrada para esse filtro.</p>
            </div>
          </section>
        </div>

        <div v-else class="tabs-shell__content">
          <div class="stats-grid stats-grid--tags">
            <div class="stat-card">
              <div class="stat-card__label">Regras ativas</div>
              <div class="stat-card__value">{{ activeAutomationsCount }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-card__label">Regras inativas</div>
              <div class="stat-card__value">{{ inactiveAutomationsCount }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-card__label">Total de automações</div>
              <div class="stat-card__value">{{ automations.length }}</div>
            </div>
          </div>

          <section class="insight-band">
            <div class="insight-band__headline">
              <div class="insight-band__copy">
                <span class="eyebrow">Regras explícitas</span>
                <h2>Automatize categorização sem depender da IA para tudo</h2>
                <p>
                  Defina regras do tipo “SE descrição contém X, ENTÃO categorizar como Y” e aplique agora nas transações acessíveis do workspace.
                </p>
              </div>
              <div class="insight-band__meta insight-band__meta--single">
                <div class="meta-chip">
                  <span>{{ visibleAutomations.length }}</span>
                  <small>regras visíveis</small>
                </div>
              </div>
            </div>
          </section>

          <section class="modern-card surface-card">
            <div class="surface-card__header">
              <div>
                <h3 class="surface-card__title">Catálogo de automações</h3>
                <p class="surface-card__subtitle">Começamos com regras por descrição, auditáveis e fáceis de revisar.</p>
              </div>
            </div>

            <div class="filters-row filters-row--tags">
              <v-text-field
                v-model="automationSearch"
                label="Buscar automação"
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                density="comfortable"
                color="#667eea"
                class="modern-input"
                hide-details
              />
              <v-switch
                v-model="showInactiveAutomations"
                color="#667eea"
                hide-details
                label="Mostrar inativas"
              />
            </div>

            <div v-if="loadingAutomations" class="loading-state">
              <v-progress-circular indeterminate color="#667eea" size="40" />
            </div>

            <div v-else-if="visibleAutomations.length" class="automation-list">
              <article v-for="automation in visibleAutomations" :key="automation.id" class="automation-card">
                <div class="automation-card__main">
                  <div>
                    <div class="automation-card__title">{{ automation.name }}</div>
                    <div class="automation-card__rule">
                      SE descrição {{ automation.matchOperator === 'EXACT' ? 'é exatamente' : 'contém' }}
                      <strong>"{{ automation.matchValue }}"</strong>
                      ENTÃO categorizar como
                      <strong>{{ automationCategoryName(automation) }}</strong>
                    </div>
                  </div>

                  <div class="category-row__badges">
                    <v-chip size="small" variant="tonal" color="primary">
                      {{ automation.overwriteExistingCategory ? 'Reclassifica' : 'Só sem categoria' }}
                    </v-chip>
                    <v-chip
                      size="small"
                      variant="tonal"
                      :color="automation.active === false ? 'warning' : 'success'"
                    >
                      {{ automation.active === false ? 'Inativa' : 'Ativa' }}
                    </v-chip>
                  </div>
                </div>

                <div class="automation-card__actions">
                  <v-btn
                    size="small"
                    variant="outlined"
                    color="#667eea"
                    :loading="applyingAutomationId === automation.id"
                    :disabled="automation.active === false"
                    @click="applyAutomation(automation)"
                  >
                    Aplicar agora
                  </v-btn>
                  <v-btn size="small" variant="text" color="#667eea" @click="startEditAutomation(automation)">
                    Editar
                  </v-btn>
                  <v-btn
                    v-if="automation.active !== false"
                    size="small"
                    variant="text"
                    color="warning"
                    :loading="deactivatingAutomationId === automation.id"
                    @click="deactivateAutomation(automation)"
                  >
                    Desativar
                  </v-btn>
                </div>
              </article>
            </div>

            <div v-else class="empty-state compact-empty">
              <v-icon size="44" color="#667eea" class="mb-3">mdi-tune-variant</v-icon>
              <p class="empty-message">Nenhuma automação encontrada para esse filtro.</p>
            </div>
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

            <v-select
              v-model="editorParentCategoryId"
              :items="parentCategoryOptions"
              item-title="label"
              item-value="value"
              label="Categoria pai"
              placeholder="Nenhuma (categoria principal)"
              clearable
              variant="outlined"
              density="comfortable"
              color="#667eea"
              class="modern-input"
            />
          </section>

          <section class="drawer-section">
            <span class="drawer-section__label">Identidade visual</span>
            <div class="icon-grid">
              <button
                v-for="icon in categoryIconOptions"
                :key="icon"
                type="button"
                class="icon-option"
                :class="{ 'icon-option--active': editorDisplayIcon === icon }"
                @click="editorDisplayIcon = icon"
              >
                <v-icon>{{ icon }}</v-icon>
              </button>
            </div>

            <div class="color-grid">
              <button
                v-for="color in categoryColorOptions"
                :key="color"
                type="button"
                class="color-option"
                :class="{ 'color-option--active': editorDisplayColor === color }"
                :style="{ backgroundColor: color }"
                @click="editorDisplayColor = color"
              >
                <v-icon v-if="editorDisplayColor === color" color="white" size="18">mdi-check</v-icon>
              </button>
            </div>

            <div class="preview-card">
              <div
                class="category-avatar"
                :style="{ backgroundColor: `${editorDisplayColor || '#667EEA'}22`, color: editorDisplayColor || '#667EEA' }"
              >
                <v-icon size="18">{{ editorDisplayIcon || 'mdi-shape-outline' }}</v-icon>
              </div>
              <div>
                <strong>{{ editorName || 'Prévia da categoria' }}</strong>
                <span>{{ editorDirection === 'INCOME' ? 'Receita' : 'Despesa' }}</span>
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

    <v-navigation-drawer
      v-model="tagDrawer"
      location="right"
      temporary
      width="420"
      class="category-drawer"
    >
      <div class="drawer-shell">
        <div class="drawer-shell__header">
          <div>
            <h2>{{ editingTagId ? 'Editar tag' : 'Nova tag' }}</h2>
            <p>Crie rótulos transversais para contexto, filtros e automações futuras.</p>
          </div>
          <v-btn icon variant="text" @click="closeTagEditor">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>

        <div class="drawer-shell__body">
          <section class="drawer-section">
            <span class="drawer-section__label">Identidade da tag</span>
            <v-text-field
              v-model="tagEditorName"
              label="Nome"
              placeholder="Ex: Reembolso, Viagem, Empresa"
              variant="outlined"
              density="comfortable"
              color="#667eea"
              class="modern-input"
            />

            <div class="color-grid">
              <button
                v-for="color in categoryColorOptions"
                :key="`tag-${color}`"
                type="button"
                class="color-option"
                :class="{ 'color-option--active': tagEditorColor === color }"
                :style="{ backgroundColor: color }"
                @click="tagEditorColor = color"
              >
                <v-icon v-if="tagEditorColor === color" color="white" size="18">mdi-check</v-icon>
              </button>
            </div>

            <div class="preview-card">
              <div class="tag-pill" :style="{ backgroundColor: `${tagEditorColor || '#667EEA'}22`, color: tagEditorColor || '#667EEA' }">
                <v-icon size="16">mdi-tag-outline</v-icon>
                <span>{{ tagEditorName || 'Prévia da tag' }}</span>
              </div>
            </div>
          </section>
        </div>

        <div class="drawer-shell__footer">
          <v-btn variant="text" @click="closeTagEditor">Cancelar</v-btn>
          <v-btn class="modern-btn gradient-btn" :loading="savingTag" @click="saveTag">
            {{ editingTagId ? 'Salvar tag' : 'Criar tag' }}
          </v-btn>
        </div>
      </div>
    </v-navigation-drawer>

    <v-navigation-drawer
      v-model="automationDrawer"
      location="right"
      temporary
      width="460"
      class="category-drawer"
    >
      <div class="drawer-shell">
        <div class="drawer-shell__header">
          <div>
            <h2>{{ editingAutomationId ? 'Editar automação' : 'Nova automação' }}</h2>
            <p>Crie uma regra explícita para categorizar transações por descrição e aplique no histórico quando fizer sentido.</p>
          </div>
          <v-btn icon variant="text" @click="closeAutomationEditor">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>

        <div class="drawer-shell__body">
          <section class="drawer-section">
            <span class="drawer-section__label">Regra</span>
            <v-text-field
              v-model="automationEditorName"
              label="Nome da regra"
              placeholder="Ex: Uber => Transporte"
              variant="outlined"
              density="comfortable"
              color="#667eea"
              class="modern-input"
            />

            <div class="automation-condition-grid">
              <v-select
                v-model="automationEditorOperator"
                :items="automationOperatorOptions"
                item-title="label"
                item-value="value"
                label="Operador"
                variant="outlined"
                density="comfortable"
                color="#667eea"
                class="modern-input"
              />
              <v-text-field
                v-model="automationEditorMatchValue"
                label="Texto da descrição"
                placeholder="Ex: uber"
                variant="outlined"
                density="comfortable"
                color="#667eea"
                class="modern-input"
              />
            </div>

            <v-select
              v-model="automationEditorCategoryId"
              :items="automationCategoryOptions"
              item-title="label"
              item-value="value"
              label="Categoria de destino"
              variant="outlined"
              density="comfortable"
              color="#667eea"
              class="modern-input"
            />

            <v-switch
              v-model="automationEditorOverwrite"
              color="#667eea"
              hide-details
              label="Reclassificar entradas que já têm categoria"
            />

            <div class="preview-card">
              <div class="placeholder-state__icon automation-preview__icon">
                <v-icon size="28">mdi-tune-variant</v-icon>
              </div>
              <div>
                <strong>{{ automationEditorName || 'Prévia da automação' }}</strong>
                <span>
                  SE descrição {{ automationEditorOperator === 'EXACT' ? 'é exatamente' : 'contém' }}
                  "{{ automationEditorMatchValue || '...' }}" ENTÃO categorizar como
                  {{ selectedAutomationCategoryLabel }}
                </span>
              </div>
            </div>
          </section>
        </div>

        <div class="drawer-shell__footer">
          <v-btn variant="text" @click="closeAutomationEditor">Cancelar</v-btn>
          <v-btn class="modern-btn gradient-btn" :loading="savingAutomation" @click="saveAutomation">
            {{ editingAutomationId ? 'Salvar automação' : 'Criar automação' }}
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
  type?: CategoryDirection
  parentCategoryId?: number | null
  displayColor?: string | null
  displayIcon?: string | null
}

interface ApiCategoryItem {
  id?: number | null
  code?: string
  name?: string
  systemDefined?: boolean
  active?: boolean
  type?: string
  parentCategoryId?: number | null
  displayColor?: string | null
  displayIcon?: string | null
}

interface CategoryWithMappings extends CategoryItem {
  bankMappings: OpenFinanceCategoryMapping[]
  parentCategoryName?: string | null
  isChild: boolean
}

interface MappingOption {
  label: string
  value: number
}

interface TagItem {
  id: number
  name: string
  displayColor?: string | null
  active?: boolean
}

interface ApiTagItem {
  id?: number
  name?: string
  displayColor?: string | null
  active?: boolean
}

type AutomationOperator = 'CONTAINS' | 'EXACT'

interface AutomationItem {
  id: number
  name: string
  matchOperator: AutomationOperator
  matchValue: string
  targetCategoryId: number
  targetCategoryName?: string | null
  overwriteExistingCategory?: boolean
  active?: boolean
}

interface ApiAutomationItem {
  id?: number
  name?: string
  matchOperator?: string
  matchValue?: string
  targetCategoryId?: number
  targetCategoryName?: string | null
  overwriteExistingCategory?: boolean
  active?: boolean
}

const { locale, t } = useI18n()
const router = useRouter()

const activeTab = ref<CategoriesTab>('categories')
const categories = ref<CategoryItem[]>([])
const tags = ref<TagItem[]>([])
const automations = ref<AutomationItem[]>([])
const bankCategories = ref<OpenFinanceBankCategory[]>([])
const bankMappings = ref<OpenFinanceCategoryMapping[]>([])
const loading = ref(false)
const loadingTags = ref(false)
const loadingAutomations = ref(false)
const search = ref('')
const tagSearch = ref('')
const automationSearch = ref('')
const showMappedOnly = ref(false)
const showInactiveCustom = ref(false)
const showInactiveTags = ref(false)
const showInactiveAutomations = ref(false)
const editorDrawer = ref(false)
const tagDrawer = ref(false)
const automationDrawer = ref(false)
const editorName = ref('')
const editorCode = ref('')
const editorDirection = ref<CategoryDirection>('EXPENSE')
const editorParentCategoryId = ref<number | null>(null)
const editorDisplayColor = ref<string | null>('#667EEA')
const editorDisplayIcon = ref<string | null>('mdi-shape-outline')
const editingCategoryId = ref<number | null>(null)
const savingCategory = ref(false)
const deactivatingCategoryId = ref<number | null>(null)
const editingTagId = ref<number | null>(null)
const tagEditorName = ref('')
const tagEditorColor = ref<string | null>('#667EEA')
const savingTag = ref(false)
const deactivatingTagId = ref<number | null>(null)
const editingAutomationId = ref<number | null>(null)
const automationEditorName = ref('')
const automationEditorOperator = ref<AutomationOperator>('CONTAINS')
const automationEditorMatchValue = ref('')
const automationEditorCategoryId = ref<number | null>(null)
const automationEditorOverwrite = ref(false)
const savingAutomation = ref(false)
const deactivatingAutomationId = ref<number | null>(null)
const applyingAutomationId = ref<number | null>(null)
const busyBankCategoryId = ref<string | null>(null)
const mappingSelections = ref<Record<string, number | null>>({})
const feedback = ref<{ type: 'success' | 'error'; message: string }>({
  type: 'success',
  message: '',
})

const categoryColorOptions = [
  '#667EEA',
  '#0EA5E9',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
  '#14B8A6',
]

const categoryIconOptions = [
  'mdi-shape-outline',
  'mdi-cart-outline',
  'mdi-bullhorn-outline',
  'mdi-home-outline',
  'mdi-car-outline',
  'mdi-heart-pulse',
  'mdi-school-outline',
  'mdi-cash-plus',
]

const automationOperatorOptions = [
  { label: 'contém', value: 'CONTAINS' },
  { label: 'é exatamente', value: 'EXACT' },
]

const normalizeCategoriesPayload = (payload: unknown): ApiCategoryItem[] => {
  if (Array.isArray(payload)) return payload as ApiCategoryItem[]
  if (payload && typeof payload === 'object') {
    const candidate = (payload as { data?: unknown }).data
    if (Array.isArray(candidate)) return candidate as ApiCategoryItem[]
  }
  return []
}

const categoriesWithMappings = computed<CategoryWithMappings[]>(() =>
  categories.value
    .map((category) => {
      const parent = category.parentCategoryId != null
        ? categories.value.find((candidate) => candidate.id === category.parentCategoryId)
        : null
      return {
        ...category,
        bankMappings: bankMappings.value.filter((mapping) => mapping.categoryId === category.id),
        parentCategoryName: parent?.name || null,
        isChild: category.parentCategoryId != null,
      }
    })
    .sort((left, right) => {
      const leftRoot = left.parentCategoryId ?? left.id ?? 0
      const rightRoot = right.parentCategoryId ?? right.id ?? 0
      if (leftRoot !== rightRoot) return leftRoot - rightRoot
      if (left.isChild !== right.isChild) return left.isChild ? 1 : -1
      return left.name.localeCompare(right.name)
    }),
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

const activeTagsCount = computed(() => tags.value.filter((tag) => tag.active !== false).length)
const inactiveTagsCount = computed(() => tags.value.filter((tag) => tag.active === false).length)
const visibleTags = computed(() => {
  const term = tagSearch.value.trim().toLowerCase()
  return tags.value.filter((tag) => {
    const matchesSearch = !term || tag.name.toLowerCase().includes(term)
    const matchesActive = tag.active !== false || showInactiveTags.value
    return matchesSearch && matchesActive
  })
})

const activeAutomationsCount = computed(() => automations.value.filter((automation) => automation.active !== false).length)
const inactiveAutomationsCount = computed(() => automations.value.filter((automation) => automation.active === false).length)
const visibleAutomations = computed(() => {
  const term = automationSearch.value.trim().toLowerCase()
  return automations.value.filter((automation) => {
    const haystack = `${automation.name} ${automation.matchValue} ${automation.targetCategoryName || ''}`.toLowerCase()
    const matchesSearch = !term || haystack.includes(term)
    const matchesActive = automation.active !== false || showInactiveAutomations.value
    return matchesSearch && matchesActive
  })
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
      type: String(category.type || 'EXPENSE').toUpperCase() === 'INCOME' ? 'INCOME' : 'EXPENSE',
      parentCategoryId: typeof category.parentCategoryId === 'number' ? category.parentCategoryId : null,
      displayColor: typeof category.displayColor === 'string' ? category.displayColor : null,
      displayIcon: typeof category.displayIcon === 'string' ? category.displayIcon : null,
    }
}

const mapApiTag = (tag: ApiTagItem): TagItem | null => {
  const name = String(tag.name || '').trim()
  const id = typeof tag.id === 'number' ? tag.id : null
  if (!name || id == null) {
    return null
  }
  return {
    id,
    name,
    displayColor: typeof tag.displayColor === 'string' ? tag.displayColor : '#667EEA',
    active: tag.active !== false,
  }
}

const mapApiAutomation = (automation: ApiAutomationItem): AutomationItem | null => {
  const id = typeof automation.id === 'number' ? automation.id : null
  const name = String(automation.name || '').trim()
  const matchValue = String(automation.matchValue || '').trim()
  const targetCategoryId = typeof automation.targetCategoryId === 'number' ? automation.targetCategoryId : null
  if (id == null || !name || !matchValue || targetCategoryId == null) {
    return null
  }
  return {
    id,
    name,
    matchOperator: String(automation.matchOperator || 'CONTAINS').toUpperCase() === 'EXACT' ? 'EXACT' : 'CONTAINS',
    matchValue,
    targetCategoryId,
    targetCategoryName: typeof automation.targetCategoryName === 'string' ? automation.targetCategoryName : null,
    overwriteExistingCategory: automation.overwriteExistingCategory === true,
    active: automation.active !== false,
  }
}

const parentCategoryOptions = computed(() =>
  categoriesWithMappings.value
    .filter((category) =>
      category.active !== false &&
      category.type === editorDirection.value &&
      !category.isChild &&
      category.id !== editingCategoryId.value
    )
    .map((category) => ({
      label: `${category.name} (${category.code})`,
      value: category.id as number,
    })),
)

const automationCategoryOptions = computed(() =>
  categoriesWithMappings.value
    .filter((category) => category.active !== false)
    .map((category) => ({
      label: `${category.name} (${category.code})`,
      value: category.id as number,
    })),
)

const selectedAutomationCategoryLabel = computed(() => {
  const selected = automationCategoryOptions.value.find((option) => option.value === automationEditorCategoryId.value)
  return selected?.label || 'a categoria escolhida'
})

const automationCategoryName = (automation: AutomationItem) =>
  categoriesWithMappings.value.find((category) => category.id === automation.targetCategoryId)?.name
    || automation.targetCategoryName
    || 'Categoria selecionada'

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

const fetchTags = async () => {
  loadingTags.value = true
  try {
    const tagsResponse = await DataService.listTags()
    const payload: ApiTagItem[] = Array.isArray(tagsResponse.data) ? tagsResponse.data : []
    tags.value = payload.map(mapApiTag).filter((tag): tag is TagItem => Boolean(tag))
  } catch (error) {
    console.error('Erro ao carregar tags:', error)
    feedback.value = {
      type: 'error',
      message: 'Não foi possível carregar as tags.',
    }
  } finally {
    loadingTags.value = false
  }
}

const fetchAutomations = async () => {
  loadingAutomations.value = true
  try {
    const automationsResponse = await DataService.listCategoryAutomations()
    const payload: ApiAutomationItem[] = Array.isArray(automationsResponse.data) ? automationsResponse.data : []
    automations.value = payload.map(mapApiAutomation).filter((automation): automation is AutomationItem => Boolean(automation))
  } catch (error) {
    console.error('Erro ao carregar automações:', error)
    feedback.value = {
      type: 'error',
      message: 'Não foi possível carregar as automações.',
    }
  } finally {
    loadingAutomations.value = false
  }
}

const startCreateCategory = () => {
  editingCategoryId.value = null
  editorName.value = ''
  editorCode.value = ''
  editorDirection.value = 'EXPENSE'
  editorParentCategoryId.value = null
  editorDisplayColor.value = '#667EEA'
  editorDisplayIcon.value = 'mdi-shape-outline'
  editorDrawer.value = true
}

const startEditCategory = (category: CategoryItem) => {
  editingCategoryId.value = category.id
  editorName.value = category.name
  editorCode.value = category.code
  editorDirection.value = category.type || 'EXPENSE'
  editorParentCategoryId.value = category.parentCategoryId ?? null
  editorDisplayColor.value = category.displayColor || '#667EEA'
  editorDisplayIcon.value = category.displayIcon || 'mdi-shape-outline'
  editorDrawer.value = true
}

const closeEditor = () => {
  editorDrawer.value = false
  editingCategoryId.value = null
  editorName.value = ''
  editorCode.value = ''
  editorDirection.value = 'EXPENSE'
  editorParentCategoryId.value = null
  editorDisplayColor.value = '#667EEA'
  editorDisplayIcon.value = 'mdi-shape-outline'
}

const startCreateTag = () => {
  editingTagId.value = null
  tagEditorName.value = ''
  tagEditorColor.value = '#667EEA'
  tagDrawer.value = true
}

const startEditTag = (tag: TagItem) => {
  editingTagId.value = tag.id
  tagEditorName.value = tag.name
  tagEditorColor.value = tag.displayColor || '#667EEA'
  tagDrawer.value = true
}

const closeTagEditor = () => {
  editingTagId.value = null
  tagEditorName.value = ''
  tagEditorColor.value = '#667EEA'
  tagDrawer.value = false
}

const startCreateAutomation = () => {
  editingAutomationId.value = null
  automationEditorName.value = ''
  automationEditorOperator.value = 'CONTAINS'
  automationEditorMatchValue.value = ''
  automationEditorCategoryId.value = null
  automationEditorOverwrite.value = false
  automationDrawer.value = true
}

const startEditAutomation = (automation: AutomationItem) => {
  editingAutomationId.value = automation.id
  automationEditorName.value = automation.name
  automationEditorOperator.value = automation.matchOperator
  automationEditorMatchValue.value = automation.matchValue
  automationEditorCategoryId.value = automation.targetCategoryId
  automationEditorOverwrite.value = automation.overwriteExistingCategory === true
  automationDrawer.value = true
}

const closeAutomationEditor = () => {
  editingAutomationId.value = null
  automationEditorName.value = ''
  automationEditorOperator.value = 'CONTAINS'
  automationEditorMatchValue.value = ''
  automationEditorCategoryId.value = null
  automationEditorOverwrite.value = false
  automationDrawer.value = false
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
      type: editorDirection.value,
      parentCategoryId: editorParentCategoryId.value,
      displayColor: editorDisplayColor.value,
      displayIcon: editorDisplayIcon.value,
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

const saveTag = async () => {
  if (!tagEditorName.value.trim()) {
    feedback.value = {
      type: 'error',
      message: 'Nome da tag é obrigatório.',
    }
    return
  }

  savingTag.value = true
  try {
    const payload = {
      name: tagEditorName.value.trim(),
      displayColor: tagEditorColor.value,
    }

    if (editingTagId.value) {
      await DataService.updateTag(editingTagId.value, payload)
      feedback.value = {
        type: 'success',
        message: 'Tag atualizada com sucesso.',
      }
    } else {
      await DataService.createTag(payload)
      feedback.value = {
        type: 'success',
        message: 'Tag criada com sucesso.',
      }
    }

    closeTagEditor()
    await fetchTags()
  } catch (error: any) {
    feedback.value = {
      type: 'error',
      message: error?.response?.data?.message || 'Não foi possível salvar a tag.',
    }
  } finally {
    savingTag.value = false
  }
}

const saveAutomation = async () => {
  if (!automationEditorName.value.trim() || !automationEditorMatchValue.value.trim() || !automationEditorCategoryId.value) {
    feedback.value = {
      type: 'error',
      message: 'Nome, condição e categoria são obrigatórios na automação.',
    }
    return
  }

  savingAutomation.value = true
  try {
    const payload = {
      name: automationEditorName.value.trim(),
      matchOperator: automationEditorOperator.value,
      matchValue: automationEditorMatchValue.value.trim(),
      targetCategoryId: automationEditorCategoryId.value,
      overwriteExistingCategory: automationEditorOverwrite.value,
    }

    if (editingAutomationId.value) {
      await DataService.updateCategoryAutomation(editingAutomationId.value, payload)
      feedback.value = {
        type: 'success',
        message: 'Automação atualizada com sucesso.',
      }
    } else {
      await DataService.createCategoryAutomation(payload)
      feedback.value = {
        type: 'success',
        message: 'Automação criada com sucesso.',
      }
    }

    closeAutomationEditor()
    await fetchAutomations()
  } catch (error: any) {
    feedback.value = {
      type: 'error',
      message: error?.response?.data?.message || 'Não foi possível salvar a automação.',
    }
  } finally {
    savingAutomation.value = false
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

const deactivateTag = async (tag: TagItem) => {
  deactivatingTagId.value = tag.id
  try {
    await DataService.deactivateTag(tag.id)
    feedback.value = {
      type: 'success',
      message: 'Tag desativada com sucesso.',
    }
    await fetchTags()
  } catch (error: any) {
    feedback.value = {
      type: 'error',
      message: error?.response?.data?.message || 'Não foi possível desativar a tag.',
    }
  } finally {
    deactivatingTagId.value = null
  }
}

const deactivateAutomation = async (automation: AutomationItem) => {
  deactivatingAutomationId.value = automation.id
  try {
    await DataService.deactivateCategoryAutomation(automation.id)
    feedback.value = {
      type: 'success',
      message: 'Automação desativada com sucesso.',
    }
    await fetchAutomations()
  } catch (error: any) {
    feedback.value = {
      type: 'error',
      message: error?.response?.data?.message || 'Não foi possível desativar a automação.',
    }
  } finally {
    deactivatingAutomationId.value = null
  }
}

const applyAutomation = async (automation: AutomationItem) => {
  applyingAutomationId.value = automation.id
  try {
    const response = await DataService.applyCategoryAutomation(automation.id)
    const affectedTransactions = Number(response?.data?.affectedTransactions || 0)
    const affectedEntries = Number(response?.data?.affectedEntries || 0)
    feedback.value = {
      type: 'success',
      message: `Automação aplicada: ${affectedTransactions} transação(ões) e ${affectedEntries} lançamento(s) atualizados.`,
    }
  } catch (error: any) {
    feedback.value = {
      type: 'error',
      message: error?.response?.data?.message || 'Não foi possível aplicar a automação.',
    }
  } finally {
    applyingAutomationId.value = null
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

watch(editorDirection, () => {
  if (editorParentCategoryId.value == null) {
    return
  }
  const stillValid = parentCategoryOptions.value.some((option) => option.value === editorParentCategoryId.value)
  if (!stillValid) {
    editorParentCategoryId.value = null
  }
})

onMounted(async () => {
  await Promise.all([fetchCategories(), fetchTags(), fetchAutomations()])
})

watch(locale, () => {
  fetchCategories()
  fetchAutomations()
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

.stats-grid--tags {
  grid-template-columns: repeat(3, minmax(0, 1fr));
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

.category-row--child {
  margin-left: 28px;
  border-style: dashed;
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

.filters-row--tags {
  grid-template-columns: minmax(240px, 1fr) auto;
}

.tag-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.tag-card {
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 8px;
  padding: 18px;
  background: rgba(255, 255, 255, 0.88);
}

.v-theme--dark .tag-card {
  background: rgba(15, 23, 42, 0.72);
}

.tag-card__main,
.tag-card__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.tag-card__actions {
  margin-top: 14px;
  justify-content: flex-end;
}

.tag-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: 999px;
  padding: 10px 14px;
  font-weight: 600;
}

.automation-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.automation-card {
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 8px;
  padding: 18px;
  background: rgba(255, 255, 255, 0.88);
}

.v-theme--dark .automation-card {
  background: rgba(15, 23, 42, 0.72);
}

.automation-card__main {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}

.automation-card__title {
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 6px;
}

.v-theme--dark .automation-card__title {
  color: #f8fafc;
}

.automation-card__rule {
  color: #667085;
  line-height: 1.5;
}

.automation-card__actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 14px;
  flex-wrap: wrap;
}

.automation-condition-grid {
  display: grid;
  grid-template-columns: minmax(150px, 0.8fr) minmax(0, 1.2fr);
  gap: 12px;
}

.automation-preview__icon {
  width: 56px;
  height: 56px;
  min-height: 56px;
  margin-bottom: 0;
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

.icon-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.icon-option {
  min-height: 52px;
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  background: rgba(248, 250, 252, 0.92);
  color: #667085;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-option--active {
  border-color: rgba(102, 126, 234, 0.4);
  color: #667eea;
  box-shadow: 0 10px 24px rgba(102, 126, 234, 0.12);
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.color-option {
  min-height: 44px;
  border-radius: 999px;
  border: 3px solid transparent;
  display: flex;
  align-items: center;
  justify-content: center;
}

.color-option--active {
  border-color: #111827;
}

.preview-card {
  display: flex;
  align-items: center;
  gap: 14px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 8px;
  padding: 16px;
  background: rgba(248, 250, 252, 0.72);
}

.v-theme--dark .preview-card {
  background: rgba(30, 41, 59, 0.5);
}

.preview-card strong {
  display: block;
  color: #111827;
}

.v-theme--dark .preview-card strong {
  color: #f8fafc;
}

.preview-card span {
  color: #667085;
  font-size: 0.92rem;
}

@media (max-width: 1180px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .tag-grid {
    grid-template-columns: 1fr;
  }

  .automation-card__main {
    flex-direction: column;
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

  .filters-row--tags {
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

  .icon-grid,
  .color-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .automation-condition-grid {
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

  .category-row--child {
    margin-left: 0;
  }

  .category-row__badges,
  .category-row__actions {
    justify-content: flex-start;
  }
}
</style>
