<template>
  <div class="cb-page">
    <div class="cb-container">
      <page-header :title="$t('categories_page.title')" :meta="$t('categories_page.subtitle')">
        <template #actions>
          <v-btn variant="outlined" color="var(--cb-primary)" @click="goToOpenFinanceSettings">
            <v-icon start>{{ canUseConnectedFinance ? 'mdi-bank-outline' : 'mdi-lock-outline' }}</v-icon>
            {{ canUseConnectedFinance ? $t('categories_page.open_finance') : $t('categories_page.open_finance_upgrade_cta') }}
          </v-btn>
          <v-btn
            v-if="activeTab === 'categories'"
            color="var(--cb-primary)"
            @click="startCreateCategory"
          >
            <v-icon start>mdi-plus</v-icon>
            {{ $t('categories_page.new_category') }}
          </v-btn>
          <v-btn
            v-else-if="activeTab === 'tags'"
            color="var(--cb-primary)"
            @click="startCreateTag"
          >
            <v-icon start>mdi-plus</v-icon>
            {{ $t('categories_page.new_tag') }}
          </v-btn>
          <v-btn
            v-else
            color="var(--cb-primary)"
            @click="startCreateAutomation"
          >
            <v-icon start>mdi-plus</v-icon>
            {{ $t('categories_page.create_automation') }}
          </v-btn>
        </template>
      </page-header>

      <v-alert
        v-if="feedback.message"
        :type="feedback.type"
        variant="tonal"
        class="mb-4"
      >
        {{ feedback.message }}
      </v-alert>

      <section class="cb-card tabs-shell">
        <div class="tabs-shell__header">
          <v-tabs v-model="activeTab" color="var(--cb-primary)" class="categories-tabs">
            <v-tab value="categories">{{ $t('categories_page.tabs.categories') }}</v-tab>
            <v-tab value="tags">{{ $t('categories_page.tabs.tags') }}</v-tab>
            <v-tab value="automations">{{ $t('categories_page.tabs.automations') }}</v-tab>
          </v-tabs>
        </div>

        <div v-if="activeTab === 'categories'" class="tabs-shell__content">
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-card__label">{{ $t('categories_page.stats.system_categories') }}</div>
              <div class="stat-card__value">{{ systemCategoriesCount }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-card__label">{{ $t('categories_page.stats.custom_categories') }}</div>
              <div class="stat-card__value">{{ customCategoriesCount }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-card__label">{{ $t('categories_page.stats.inactive_custom_categories') }}</div>
              <div class="stat-card__value">{{ inactiveCustomCategoriesCount }}</div>
            </div>
            <div class="stat-card" :class="{ 'stat-card--warning': unmappedBankCategories.length > 0 }">
              <div class="stat-card__label">{{ $t('categories_page.stats.open_finance_pending') }}</div>
              <div class="stat-card__value">{{ unmappedBankCategories.length }}</div>
            </div>
          </div>

          <section class="insight-band">
            <div class="insight-band__headline">
              <div class="insight-band__copy">
                <span class="eyebrow">{{ $t('categories_page.category_insight.eyebrow') }}</span>
                <h2>{{ $t('categories_page.category_insight.title') }}</h2>
                <p>
                  {{ $t('categories_page.category_insight.description') }}
                </p>
              </div>
              <div class="insight-band__meta">
                <div class="meta-chip">
                  <span>{{ mappedBankCategoriesCount }}</span>
                  <small>{{ $t('categories_page.resolved_mappings') }}</small>
                </div>
                <div class="meta-chip">
                  <span>{{ filteredCategories.length }}</span>
                  <small>{{ $t('categories_page.visible_categories') }}</small>
                </div>
              </div>
            </div>
          </section>

          <div class="content-grid">
            <section class="cb-card surface-card">
              <div class="surface-card__header">
                <div>
                  <h3 class="surface-card__title">{{ $t('categories_page.category_catalog_title') }}</h3>
                  <p class="surface-card__subtitle">{{ $t('categories_page.category_catalog_subtitle') }}</p>
                </div>
              </div>

              <div class="filters-row">
                <v-text-field
                  v-model="search"
                  :label="$t('categories_page.search_category')"
                  prepend-inner-icon="mdi-magnify"
                  variant="outlined"
                  density="comfortable"
                  color="var(--cb-primary)"
                  class="modern-input"
                  hide-details
                />
                <v-switch
                  v-model="showMappedOnly"
                  color="var(--cb-primary)"
                  hide-details
                  :label="$t('categories_page.mapped_only')"
                />
                <v-switch
                  v-model="showInactiveCustom"
                  color="var(--cb-primary)"
                  hide-details
                  :label="$t('categories_page.show_inactive_custom')"
                />
              </div>

              <div v-if="loading" class="loading-state">
                <v-progress-circular indeterminate color="var(--cb-primary)" size="40" />
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
                          <span v-if="category.parentCategoryName">· {{ $t('categories_page.child_of', { name: category.parentCategoryName }) }}</span>
                        </div>
                      </div>
                    </div>

                    <div class="category-row__badges">
                      <v-chip size="small" variant="tonal" :color="category.type === 'INCOME' ? 'success' : 'warning'">
                        {{ category.type === 'INCOME' ? $t('categories_page.income') : $t('categories_page.expense') }}
                      </v-chip>
                      <v-chip size="small" variant="tonal" :color="category.systemDefined ? 'default' : 'primary'">
                        {{ category.systemDefined ? $t('categories_page.system_defined') : $t('categories_page.custom') }}
                      </v-chip>
                      <v-chip
                        v-if="category.bankMappings.length"
                        size="small"
                        variant="tonal"
                        color="success"
                      >
                        {{ $t('categories_page.mappings_count', { count: category.bankMappings.length }) }}
                      </v-chip>
                      <v-chip
                        v-if="category.active === false"
                        size="small"
                        variant="tonal"
                        color="warning"
                      >
                        {{ $t('categories_page.inactive') }}
                      </v-chip>
                    </div>
                  </div>

                  <div v-if="category.bankMappings.length" class="mapping-tags">
                    <v-chip
                      v-for="mapping in category.bankMappings"
                      :key="mapping.bankCategoryId"
                      size="small"
                      variant="outlined"
                      color="var(--cb-primary)"
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
                      color="var(--cb-primary)"
                      @click="startEditCategory(category)"
                    >
                      {{ $t('common.edit') }}
                    </v-btn>
                    <v-btn
                      v-if="!category.systemDefined && category.active !== false"
                      size="small"
                      variant="text"
                      color="warning"
                      :loading="deactivatingCategoryId === category.id"
                      @click="deactivateCategory(category)"
                    >
                      {{ $t('categories_page.deactivate') }}
                    </v-btn>
                    <v-btn
                      v-if="!category.systemDefined && category.active === false"
                      size="small"
                      variant="text"
                      color="success"
                      :loading="activatingCategoryId === category.id"
                      @click="activateCategory(category)"
                    >
                      {{ $t('categories_page.activate') }}
                    </v-btn>
                  </div>
                </article>
              </div>

              <div v-else class="empty-state">
                <v-icon size="48" color="var(--cb-primary)" class="mb-3">mdi-shape-off</v-icon>
                <p class="empty-message">{{ $t('categories_page.empty_categories_filter') }}</p>
              </div>
            </section>

            <section class="cb-card surface-card">
              <div class="surface-card__header">
                <div>
                  <h3 class="surface-card__title">{{ $t('categories_page.open_finance_mappings_title') }}</h3>
                  <p class="surface-card__subtitle">{{ $t('categories_page.open_finance_mappings_subtitle') }}</p>
                </div>
              </div>

              <v-alert
                v-if="!canUseConnectedFinance"
                type="info"
                variant="tonal"
                class="mb-4"
              >
                <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">
                  <span>{{ $t('categories_page.connected_finance_locked') }}</span>
                  <v-btn size="small" variant="tonal" color="var(--cb-accent)" @click="goToOpenFinanceSettings">
                    <v-icon start size="14">mdi-lock-open-outline</v-icon>
                    {{ $t('categories_page.open_finance_upgrade_cta') }}
                  </v-btn>
                </div>
              </v-alert>

              <div v-else-if="unmappedBankCategories.length" class="mapping-queue">
                <article v-for="bankCategory in unmappedBankCategories" :key="bankCategory.id" class="mapping-queue__row">
                  <div>
                    <div class="mapping-queue__name">{{ bankCategory.name || bankCategory.id }}</div>
                    <div class="mapping-queue__meta">
                      {{ bankCategory.parentId ? $t('categories_page.parent_id', { id: bankCategory.parentId }) : $t('categories_page.synced_without_parent') }}
                    </div>
                  </div>

                  <div class="mapping-queue__controls">
                    <v-select
                      v-model="mappingSelections[bankCategory.id]"
                      :items="mappingOptions"
                      item-title="label"
                      item-value="value"
                      :label="$t('categories_page.map_to')"
                      density="comfortable"
                      variant="outlined"
                      class="mapping-select"
                      hide-details
                    />
                    <v-btn
                     
                      :loading="busyBankCategoryId === bankCategory.id"
                      :disabled="!mappingSelections[bankCategory.id]"
                      @click="saveMapping(bankCategory.id)"
                    >
                      {{ $t('categories_page.map') }}
                    </v-btn>
                  </div>
                </article>
              </div>

              <div v-else class="empty-state compact-empty">
                <v-icon size="44" color="var(--cb-primary)" class="mb-3">mdi-check-circle-outline</v-icon>
                <p class="empty-message">{{ $t('categories_page.no_pending_bank_categories') }}</p>
              </div>

              <div class="mapping-footer">
                <v-btn variant="text" color="var(--cb-primary)" @click="goToOpenFinanceSettings">
                  {{ $t('categories_page.open_finance_connections') }}
                </v-btn>
              </div>
            </section>
          </div>
        </div>

        <div v-else-if="activeTab === 'tags'" class="tabs-shell__content">
          <div class="stats-grid stats-grid--tags">
            <div class="stat-card">
              <div class="stat-card__label">{{ $t('categories_page.stats.active_tags') }}</div>
              <div class="stat-card__value">{{ activeTagsCount }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-card__label">{{ $t('categories_page.stats.inactive_tags') }}</div>
              <div class="stat-card__value">{{ inactiveTagsCount }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-card__label">{{ $t('categories_page.stats.total_tags') }}</div>
              <div class="stat-card__value">{{ tags.length }}</div>
            </div>
          </div>

          <section class="insight-band">
            <div class="insight-band__headline">
              <div class="insight-band__copy">
                <span class="eyebrow">{{ $t('categories_page.tag_insight.eyebrow') }}</span>
                <h2>{{ $t('categories_page.tag_insight.title') }}</h2>
                <p>
                  {{ $t('categories_page.tag_insight.description') }}
                </p>
              </div>
              <div class="insight-band__meta insight-band__meta--single">
                <div class="meta-chip">
                  <span>{{ visibleTags.length }}</span>
                  <small>{{ $t('categories_page.visible_tags') }}</small>
                </div>
              </div>
            </div>
          </section>

          <section class="cb-card surface-card">
            <div class="surface-card__header">
              <div>
                <h3 class="surface-card__title">{{ $t('categories_page.tag_catalog_title') }}</h3>
                <p class="surface-card__subtitle">{{ $t('categories_page.tag_catalog_subtitle') }}</p>
              </div>
            </div>

            <div class="filters-row filters-row--tags">
              <v-text-field
                v-model="tagSearch"
                :label="$t('categories_page.search_tag')"
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                density="comfortable"
                color="var(--cb-primary)"
                class="modern-input"
                hide-details
              />
              <v-switch
                v-model="showInactiveTags"
                color="var(--cb-primary)"
                hide-details
                :label="$t('categories_page.show_inactive')"
              />
            </div>

            <div v-if="loadingTags" class="loading-state">
              <v-progress-circular indeterminate color="var(--cb-primary)" size="40" />
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
                    {{ tag.active === false ? $t('categories_page.inactive') : $t('categories_page.active') }}
                  </v-chip>
                </div>

                <div class="tag-card__actions">
                  <v-btn size="small" variant="text" color="var(--cb-primary)" @click="startEditTag(tag)">
                    {{ $t('common.edit') }}
                  </v-btn>
                  <v-btn
                    v-if="tag.active !== false"
                    size="small"
                    variant="text"
                    color="warning"
                    :loading="deactivatingTagId === tag.id"
                    @click="deactivateTag(tag)"
                  >
                    {{ $t('categories_page.deactivate') }}
                  </v-btn>
                  <v-btn
                    v-if="tag.active === false"
                    size="small"
                    variant="text"
                    color="success"
                    :loading="activatingTagId === tag.id"
                    @click="activateTag(tag)"
                  >
                    {{ $t('categories_page.activate') }}
                  </v-btn>
                </div>
              </article>
            </div>

            <div v-else class="empty-state compact-empty">
              <v-icon size="44" color="var(--cb-primary)" class="mb-3">mdi-tag-off-outline</v-icon>
              <p class="empty-message">{{ $t('categories_page.empty_tags_filter') }}</p>
            </div>
          </section>
        </div>

        <div v-else class="tabs-shell__content">
          <div class="stats-grid stats-grid--tags">
            <div class="stat-card">
              <div class="stat-card__label">{{ $t('categories_page.stats.active_rules') }}</div>
              <div class="stat-card__value">{{ activeAutomationsCount }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-card__label">{{ $t('categories_page.stats.inactive_rules') }}</div>
              <div class="stat-card__value">{{ inactiveAutomationsCount }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-card__label">{{ $t('categories_page.stats.total_automations') }}</div>
              <div class="stat-card__value">{{ automations.length }}</div>
            </div>
          </div>

          <section class="insight-band">
            <div class="insight-band__headline">
              <div class="insight-band__copy">
                <span class="eyebrow">{{ $t('categories_page.automation_insight.eyebrow') }}</span>
                <h2>{{ $t('categories_page.automation_insight.title') }}</h2>
                <p>
                  {{ $t('categories_page.automation_insight.description') }}
                </p>
              </div>
              <div class="insight-band__meta insight-band__meta--single">
                <div class="meta-chip">
                  <span>{{ visibleAutomations.length }}</span>
                  <small>{{ $t('categories_page.visible_rules') }}</small>
                </div>
              </div>
            </div>
          </section>

          <section class="cb-card surface-card">
            <div class="surface-card__header">
              <div>
                <h3 class="surface-card__title">{{ $t('categories_page.automation_catalog_title') }}</h3>
                <p class="surface-card__subtitle">{{ $t('categories_page.automation_catalog_subtitle') }}</p>
              </div>
            </div>

            <div class="filters-row filters-row--tags">
              <v-text-field
                v-model="automationSearch"
                :label="$t('categories_page.search_automation')"
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                density="comfortable"
                color="var(--cb-primary)"
                class="modern-input"
                hide-details
              />
              <v-switch
                v-model="showInactiveAutomations"
                color="var(--cb-primary)"
                hide-details
                :label="$t('categories_page.show_inactive')"
              />
            </div>

            <div v-if="loadingAutomations" class="loading-state">
              <v-progress-circular indeterminate color="var(--cb-primary)" size="40" />
            </div>

            <div v-else-if="visibleAutomations.length" class="automation-list">
              <article v-for="automation in visibleAutomations" :key="automation.id" class="automation-card">
                <div class="automation-card__main">
                  <div>
                    <div class="automation-card__title">{{ automation.name }}</div>
                    <div class="automation-card__rule">
                      {{ $t('categories_page.rule_if_description') }} {{ automation.matchOperator === 'EXACT' ? $t('categories_page.operator_exact') : $t('categories_page.operator_contains') }}
                      <strong>"{{ automation.matchValue }}"</strong>
                      {{ $t('categories_page.rule_then_categorize_as') }}
                      <strong>{{ automationCategoryName(automation) }}</strong>
                    </div>
                  </div>

                  <div class="category-row__badges">
                    <v-chip size="small" variant="tonal" color="primary">
                      {{ automation.overwriteExistingCategory ? $t('categories_page.reclassifies') : $t('categories_page.only_uncategorized') }}
                    </v-chip>
                    <v-chip
                      size="small"
                      variant="tonal"
                      :color="automation.active === false ? 'warning' : 'success'"
                    >
                      {{ automation.active === false ? $t('categories_page.inactive') : $t('categories_page.active') }}
                    </v-chip>
                  </div>
                </div>

                <div class="automation-card__actions">
                  <v-btn
                    size="small"
                    variant="outlined"
                    color="var(--cb-primary)"
                    :loading="previewingAutomationId === automation.id"
                    :disabled="automation.active === false"
                    @click="previewAutomation(automation)"
                  >
                    {{ $t('categories_page.preview') }}
                  </v-btn>
                  <v-btn
                    size="small"
                    variant="outlined"
                    color="var(--cb-primary)"
                    :loading="applyingAutomationId === automation.id"
                    :disabled="automation.active === false"
                    @click="applyAutomation(automation)"
                  >
                    {{ $t('categories_page.apply_now') }}
                  </v-btn>
                  <v-btn size="small" variant="text" color="var(--cb-primary)" @click="startEditAutomation(automation)">
                    {{ $t('common.edit') }}
                  </v-btn>
                  <v-btn
                    v-if="automation.active !== false"
                    size="small"
                    variant="text"
                    color="warning"
                    :loading="deactivatingAutomationId === automation.id"
                    @click="deactivateAutomation(automation)"
                  >
                    {{ $t('categories_page.deactivate') }}
                  </v-btn>
                  <v-btn
                    v-if="automation.active === false"
                    size="small"
                    variant="text"
                    color="success"
                    :loading="activatingAutomationId === automation.id"
                    @click="activateAutomation(automation)"
                  >
                    {{ $t('categories_page.activate') }}
                  </v-btn>
                </div>

                <div v-if="automationPreviews[automation.id]" class="automation-preview-panel">
                  <div class="automation-preview-panel__summary">
                    {{
                      $t('categories_page.automation_preview_summary', {
                        candidates: automationPreviews[automation.id].candidates,
                        evaluated: automationPreviews[automation.id].evaluated,
                      })
                    }}
                  </div>
                  <div v-if="automationPreviews[automation.id].examples.length" class="automation-preview-panel__examples">
                    <div
                      v-for="example in automationPreviews[automation.id].examples"
                      :key="`${example.transactionId}-${example.suggestedCategoryId}`"
                      class="automation-preview-example"
                    >
                      <div>
                        <strong>{{ example.description }}</strong>
                        <span>{{ example.reason }}</span>
                      </div>
                      <v-chip size="small" variant="tonal" color="primary">
                        {{ automationPreviewCategoryName(example.suggestedCategoryId) }}
                      </v-chip>
                    </div>
                  </div>
                  <p v-else class="automation-preview-panel__empty">
                    {{ $t('categories_page.automation_preview_empty') }}
                  </p>
                </div>
              </article>
            </div>

            <div v-else class="empty-state compact-empty">
              <v-icon size="44" color="var(--cb-primary)" class="mb-3">mdi-tune-variant</v-icon>
              <p class="empty-message">{{ $t('categories_page.empty_automations_filter') }}</p>
            </div>
          </section>
        </div>
      </section>
    </div>

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
            <h2>{{ editingCategoryId ? $t('categories_page.edit_category') : $t('categories_page.new_category') }}</h2>
            <p>{{ $t('categories_page.category_drawer_description') }}</p>
          </div>
          <v-btn icon variant="text" @click="closeEditor">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>

        <div class="drawer-shell__body">
          <section class="drawer-section">
            <span class="drawer-section__label">{{ $t('categories_page.structure') }}</span>
            <div class="type-toggle">
              <button
                type="button"
                class="type-toggle__option"
                :class="{ 'type-toggle__option--active': editorDirection === 'EXPENSE' }"
                @click="editorDirection = 'EXPENSE'"
              >
                <v-icon size="18">mdi-arrow-up</v-icon>
                {{ $t('categories_page.expense') }}
              </button>
              <button
                type="button"
                class="type-toggle__option"
                :class="{ 'type-toggle__option--active': editorDirection === 'INCOME' }"
                @click="editorDirection = 'INCOME'"
              >
                <v-icon size="18">mdi-arrow-down</v-icon>
                {{ $t('categories_page.income') }}
              </button>
            </div>

            <v-text-field
              v-model="editorName"
              :label="$t('categories_page.name')"
              :placeholder="$t('categories_page.category_name_placeholder')"
              variant="outlined"
              density="comfortable"
              color="var(--cb-primary)"
              class="modern-input"
            />

            <v-text-field
              v-model="editorCode"
              :label="$t('categories_page.code')"
              :hint="$t('categories_page.code_hint')"
              persistent-hint
              variant="outlined"
              density="comfortable"
              color="var(--cb-primary)"
              class="modern-input"
            />

            <v-select
              v-model="editorParentCategoryId"
              :items="parentCategoryOptions"
              item-title="label"
              item-value="value"
              :label="$t('categories_page.parent_category')"
              :placeholder="$t('categories_page.no_parent_category')"
              clearable
              variant="outlined"
              density="comfortable"
              color="var(--cb-primary)"
              class="modern-input"
            />
          </section>

          <section class="drawer-section">
            <span class="drawer-section__label">{{ $t('categories_page.visual_identity') }}</span>
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
                <strong>{{ editorName || $t('categories_page.category_preview') }}</strong>
                <span>{{ editorDirection === 'INCOME' ? $t('categories_page.income') : $t('categories_page.expense') }}</span>
              </div>
            </div>
          </section>
        </div>

        <div class="drawer-shell__footer">
          <v-btn variant="text" @click="closeEditor">{{ $t('common.cancel') }}</v-btn>
          <v-btn :loading="savingCategory" @click="saveCategory">
            {{ editingCategoryId ? $t('categories_page.save_adjustments') : $t('categories_page.create_category') }}
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
            <h2>{{ editingTagId ? $t('categories_page.edit_tag') : $t('categories_page.new_tag') }}</h2>
            <p>{{ $t('categories_page.tag_drawer_description') }}</p>
          </div>
          <v-btn icon variant="text" @click="closeTagEditor">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>

        <div class="drawer-shell__body">
          <section class="drawer-section">
            <span class="drawer-section__label">{{ $t('categories_page.tag_identity') }}</span>
            <v-text-field
              v-model="tagEditorName"
              :label="$t('categories_page.name')"
              :placeholder="$t('categories_page.tag_name_placeholder')"
              variant="outlined"
              density="comfortable"
              color="var(--cb-primary)"
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
                <span>{{ tagEditorName || $t('categories_page.tag_preview') }}</span>
              </div>
            </div>
          </section>
        </div>

        <div class="drawer-shell__footer">
          <v-btn variant="text" @click="closeTagEditor">{{ $t('common.cancel') }}</v-btn>
          <v-btn :loading="savingTag" @click="saveTag">
            {{ editingTagId ? $t('categories_page.save_tag') : $t('categories_page.create_tag') }}
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
            <h2>{{ editingAutomationId ? $t('categories_page.edit_automation') : $t('categories_page.new_automation') }}</h2>
            <p>{{ $t('categories_page.automation_drawer_description') }}</p>
          </div>
          <v-btn icon variant="text" @click="closeAutomationEditor">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>

        <div class="drawer-shell__body">
          <section class="drawer-section">
            <span class="drawer-section__label">{{ $t('categories_page.rule') }}</span>
            <v-text-field
              v-model="automationEditorName"
              :label="$t('categories_page.rule_name')"
              :placeholder="$t('categories_page.rule_name_placeholder')"
              variant="outlined"
              density="comfortable"
              color="var(--cb-primary)"
              class="modern-input"
            />

            <div class="automation-condition-grid">
              <v-select
                v-model="automationEditorOperator"
                :items="automationOperatorOptions"
                item-title="label"
                item-value="value"
                :label="$t('categories_page.operator')"
                variant="outlined"
                density="comfortable"
                color="var(--cb-primary)"
                class="modern-input"
              />
              <v-text-field
                v-model="automationEditorMatchValue"
                :label="$t('categories_page.description_text')"
                :placeholder="$t('categories_page.description_text_placeholder')"
                variant="outlined"
                density="comfortable"
                color="var(--cb-primary)"
                class="modern-input"
              />
            </div>

            <v-select
              v-model="automationEditorCategoryId"
              :items="automationCategoryOptions"
              item-title="label"
              item-value="value"
              :label="$t('categories_page.target_category')"
              variant="outlined"
              density="comfortable"
              color="var(--cb-primary)"
              class="modern-input"
            />

            <div class="preview-card">
              <div class="placeholder-state__icon automation-preview__icon">
                <v-icon size="28">mdi-tune-variant</v-icon>
              </div>
              <div>
                <strong>{{ automationEditorName || $t('categories_page.automation_preview') }}</strong>
                <span>
                  {{ $t('categories_page.rule_if_description') }} {{ automationEditorOperator === 'EXACT' ? $t('categories_page.operator_exact') : $t('categories_page.operator_contains') }}
                  "{{ automationEditorMatchValue || '...' }}" {{ $t('categories_page.rule_then_categorize_as') }}
                  {{ selectedAutomationCategoryLabel }}
                </span>
              </div>
            </div>
          </section>
        </div>

        <div class="drawer-shell__footer">
          <v-btn variant="text" @click="closeAutomationEditor">{{ $t('common.cancel') }}</v-btn>
          <v-btn :loading="savingAutomation" @click="saveAutomation">
            {{ editingAutomationId ? $t('categories_page.save_automation') : $t('categories_page.create_automation') }}
          </v-btn>
        </div>
      </div>
    </v-navigation-drawer>
  </div>
</template>

<script setup lang="ts">
import PageHeader from '@/components/PageHeader.vue'
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import DataService from '@/services/DataService'
import OpenFinanceService from '@/services/OpenFinanceService'
import BillingOrchestrationService, { type BillingSummaryResponse } from '@/services/BillingOrchestrationService'
import { useUserStore } from '@/plugins/userStore'
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

interface AutomationPreviewExample {
  transactionId: string
  description: string
  amount?: number | string | null
  date?: string | null
  currentCategoryId?: number | null
  suggestedCategoryId: number
  reason?: string | null
}

interface AutomationPreview {
  ruleId: number
  evaluated: number
  candidates: number
  examples: AutomationPreviewExample[]
}

const { locale, t } = useI18n()
const router = useRouter()
const userStore = useUserStore()

const activeTab = ref<CategoriesTab>('categories')
const categories = ref<CategoryItem[]>([])
const tags = ref<TagItem[]>([])
const automations = ref<AutomationItem[]>([])
const bankCategories = ref<OpenFinanceBankCategory[]>([])
const bankMappings = ref<OpenFinanceCategoryMapping[]>([])
const billingSummary = ref<BillingSummaryResponse | null>(null)
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
const activatingCategoryId = ref<number | null>(null)
const editingTagId = ref<number | null>(null)
const tagEditorName = ref('')
const tagEditorColor = ref<string | null>('#667EEA')
const savingTag = ref(false)
const deactivatingTagId = ref<number | null>(null)
const activatingTagId = ref<number | null>(null)
const editingAutomationId = ref<number | null>(null)
const automationEditorName = ref('')
const automationEditorOperator = ref<AutomationOperator>('CONTAINS')
const automationEditorMatchValue = ref('')
const automationEditorCategoryId = ref<number | null>(null)
const automationEditorOverwrite = ref(false)
const savingAutomation = ref(false)
const deactivatingAutomationId = ref<number | null>(null)
const activatingAutomationId = ref<number | null>(null)
const applyingAutomationId = ref<number | null>(null)
const previewingAutomationId = ref<number | null>(null)
const automationPreviews = ref<Record<number, AutomationPreview>>({})
const busyBankCategoryId = ref<string | null>(null)
const mappingSelections = ref<Record<string, number | null>>({})
const feedback = ref<{ type: 'success' | 'error'; message: string }>({
  type: 'success',
  message: '',
})

const currentWorkspaceId = computed(() =>
  userStore.getCurrentWorkspaceId || userStore.getPreferredWorkspaceId || userStore.getWorkspaces[0]?.workspaceId || ''
)
const canUseConnectedFinance = computed(() => {
  const capabilities = billingSummary.value?.capabilities
  if (!capabilities) return false
  if (typeof capabilities.connectedFinanceEnabled === 'boolean') return capabilities.connectedFinanceEnabled
  return Boolean(capabilities.advancedToolsEnabled || billingSummary.value?.hasPremiumAccess)
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

const automationOperatorOptions = computed(() => [
  { label: t('categories_page.operator_contains'), value: 'CONTAINS' },
  { label: t('categories_page.operator_exact'), value: 'EXACT' },
])

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
    overwriteExistingCategory: false,
    active: automation.active !== false,
  }
}

const mapApiAutomationPreview = (payload: any): AutomationPreview => ({
  ruleId: Number(payload?.ruleId || 0),
  evaluated: Number(payload?.evaluated || 0),
  candidates: Number(payload?.candidates || 0),
  examples: Array.isArray(payload?.examples)
    ? payload.examples
      .map((example: any): AutomationPreviewExample | null => {
        const transactionId = String(example?.transactionId || '').trim()
        const description = String(example?.description || '').trim()
        const suggestedCategoryId = Number(example?.suggestedCategoryId)
        if (!transactionId || !description || !Number.isFinite(suggestedCategoryId)) {
          return null
        }
        return {
          transactionId,
          description,
          amount: example?.amount ?? null,
          date: typeof example?.date === 'string' ? example.date : null,
          currentCategoryId: typeof example?.currentCategoryId === 'number' ? example.currentCategoryId : null,
          suggestedCategoryId,
          reason: typeof example?.reason === 'string' ? example.reason : null,
        }
      })
      .filter((example: AutomationPreviewExample | null): example is AutomationPreviewExample => Boolean(example))
    : [],
})

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
  return selected?.label || t('categories_page.selected_category_fallback')
})

const automationCategoryName = (automation: AutomationItem) =>
  categoriesWithMappings.value.find((category) => category.id === automation.targetCategoryId)?.name
    || automation.targetCategoryName
    || 'Categoria selecionada'

const automationPreviewCategoryName = (categoryId: number) =>
  categoriesWithMappings.value.find((category) => category.id === categoryId)?.name
    || t('categories_page.selected_category_fallback')

const fetchCategories = async () => {
  loading.value = true
  try {
    const categoriesResponse = await DataService.listCategories()

    categories.value = normalizeCategoriesPayload(categoriesResponse.data)
      .map(mapApiCategory)
      .filter((category): category is CategoryItem => Boolean(category))

    if (!canUseConnectedFinance.value) {
      bankCategories.value = []
      bankMappings.value = []
      mappingSelections.value = {}
      return
    }

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
      message: t('categories_page.load_categories_error'),
    }
  } finally {
    loading.value = false
  }
}

const loadBillingCapabilities = async () => {
  const workspaceId = currentWorkspaceId.value
  if (!workspaceId) {
    billingSummary.value = null
    return
  }
  try {
    const { data } = await BillingOrchestrationService.getBillingSummary(workspaceId)
    billingSummary.value = data || null
  } catch (error) {
    console.error('Erro ao carregar capacidades do plano:', error)
    billingSummary.value = null
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
      message: t('categories_page.load_tags_error'),
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
    automationPreviews.value = {}
  } catch (error) {
    console.error('Erro ao carregar automações:', error)
    feedback.value = {
      type: 'error',
      message: t('categories_page.load_automations_error'),
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
  automationEditorOverwrite.value = false
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
      message: t('categories_page.category_required_fields'),
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
        message: t('categories_page.category_update_success'),
      }
    } else {
      await DataService.createCategory(payload)
      feedback.value = {
        type: 'success',
        message: t('categories_page.category_create_success'),
      }
    }

    closeEditor()
    await fetchCategories()
  } catch (error: any) {
    feedback.value = {
      type: 'error',
      message: error?.response?.data?.message || t('categories_page.category_save_error'),
    }
  } finally {
    savingCategory.value = false
  }
}

const saveTag = async () => {
  if (!tagEditorName.value.trim()) {
    feedback.value = {
      type: 'error',
      message: t('categories_page.tag_required_fields'),
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
        message: t('categories_page.tag_update_success'),
      }
    } else {
      await DataService.createTag(payload)
      feedback.value = {
        type: 'success',
        message: t('categories_page.tag_create_success'),
      }
    }

    closeTagEditor()
    await fetchTags()
  } catch (error: any) {
    feedback.value = {
      type: 'error',
      message: error?.response?.data?.message || t('categories_page.tag_save_error'),
    }
  } finally {
    savingTag.value = false
  }
}

const saveAutomation = async () => {
  if (!automationEditorName.value.trim() || !automationEditorMatchValue.value.trim() || !automationEditorCategoryId.value) {
    feedback.value = {
      type: 'error',
      message: t('categories_page.automation_required_fields'),
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
      overwriteExistingCategory: false,
    }

    if (editingAutomationId.value) {
      await DataService.updateCategoryAutomation(editingAutomationId.value, payload)
      feedback.value = {
        type: 'success',
        message: t('categories_page.automation_update_success'),
      }
    } else {
      await DataService.createCategoryAutomation(payload)
      feedback.value = {
        type: 'success',
        message: t('categories_page.automation_create_success'),
      }
    }

    closeAutomationEditor()
    await fetchAutomations()
  } catch (error: any) {
    feedback.value = {
      type: 'error',
      message: error?.response?.data?.message || t('categories_page.automation_save_error'),
    }
  } finally {
    savingAutomation.value = false
  }
}

const saveMapping = async (bankCategoryId: string) => {
  if (!canUseConnectedFinance.value) {
    feedback.value = {
      type: 'error',
      message: t('categories_page.connected_finance_locked'),
    }
    goToOpenFinanceSettings()
    return
  }
  const categoryId = mappingSelections.value[bankCategoryId]
  if (!categoryId) {
    return
  }

  busyBankCategoryId.value = bankCategoryId
  try {
    await OpenFinanceService.upsertCategoryMapping(bankCategoryId, categoryId, true)
    feedback.value = {
      type: 'success',
      message: t('categories_page.mapping_update_success'),
    }
    mappingSelections.value = { ...mappingSelections.value, [bankCategoryId]: null }
    await fetchCategories()
  } catch (error: any) {
    feedback.value = {
      type: 'error',
      message: error?.response?.data?.message || t('categories_page.mapping_save_error'),
    }
  } finally {
    busyBankCategoryId.value = null
  }
}

const removeMapping = async (bankCategoryId: string) => {
  if (!canUseConnectedFinance.value) {
    feedback.value = {
      type: 'error',
      message: t('categories_page.connected_finance_locked'),
    }
    goToOpenFinanceSettings()
    return
  }
  busyBankCategoryId.value = bankCategoryId
  try {
    await OpenFinanceService.deleteCategoryMapping(bankCategoryId, false)
    feedback.value = {
      type: 'success',
      message: t('categories_page.mapping_remove_success'),
    }
    await fetchCategories()
  } catch (error: any) {
    feedback.value = {
      type: 'error',
      message: error?.response?.data?.message || t('categories_page.mapping_remove_error'),
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
      message: t('categories_page.category_deactivate_success'),
    }
    await fetchCategories()
  } catch (error: any) {
    feedback.value = {
      type: 'error',
      message: error?.response?.data?.message || t('categories_page.category_deactivate_error'),
    }
  } finally {
    deactivatingCategoryId.value = null
  }
}

const activateCategory = async (category: CategoryItem) => {
  if (!category.id) {
    return
  }

  activatingCategoryId.value = category.id
  try {
    await DataService.activateCategory(category.id)
    feedback.value = {
      type: 'success',
      message: t('categories_page.category_activate_success'),
    }
    await fetchCategories()
  } catch (error: any) {
    feedback.value = {
      type: 'error',
      message: error?.response?.data?.message || t('categories_page.category_activate_error'),
    }
  } finally {
    activatingCategoryId.value = null
  }
}

const deactivateTag = async (tag: TagItem) => {
  deactivatingTagId.value = tag.id
  try {
    await DataService.deactivateTag(tag.id)
    feedback.value = {
      type: 'success',
      message: t('categories_page.tag_deactivate_success'),
    }
    await fetchTags()
  } catch (error: any) {
    feedback.value = {
      type: 'error',
      message: error?.response?.data?.message || t('categories_page.tag_deactivate_error'),
    }
  } finally {
    deactivatingTagId.value = null
  }
}

const activateTag = async (tag: TagItem) => {
  activatingTagId.value = tag.id
  try {
    await DataService.activateTag(tag.id)
    feedback.value = {
      type: 'success',
      message: t('categories_page.tag_activate_success'),
    }
    await fetchTags()
  } catch (error: any) {
    feedback.value = {
      type: 'error',
      message: error?.response?.data?.message || t('categories_page.tag_activate_error'),
    }
  } finally {
    activatingTagId.value = null
  }
}

const deactivateAutomation = async (automation: AutomationItem) => {
  deactivatingAutomationId.value = automation.id
  try {
    await DataService.deactivateCategoryAutomation(automation.id)
    feedback.value = {
      type: 'success',
      message: t('categories_page.automation_deactivate_success'),
    }
    await fetchAutomations()
  } catch (error: any) {
    feedback.value = {
      type: 'error',
      message: error?.response?.data?.message || t('categories_page.automation_deactivate_error'),
    }
  } finally {
    deactivatingAutomationId.value = null
  }
}

const activateAutomation = async (automation: AutomationItem) => {
  activatingAutomationId.value = automation.id
  try {
    await DataService.activateCategoryAutomation(automation.id)
    feedback.value = {
      type: 'success',
      message: t('categories_page.automation_activate_success'),
    }
    await fetchAutomations()
  } catch (error: any) {
    feedback.value = {
      type: 'error',
      message: error?.response?.data?.message || t('categories_page.automation_activate_error'),
    }
  } finally {
    activatingAutomationId.value = null
  }
}

const previewAutomation = async (automation: AutomationItem) => {
  previewingAutomationId.value = automation.id
  try {
    const response = await DataService.previewCategoryAutomation(automation.id)
    automationPreviews.value = {
      ...automationPreviews.value,
      [automation.id]: mapApiAutomationPreview(response?.data),
    }
  } catch (error: any) {
    feedback.value = {
      type: 'error',
      message: error?.response?.data?.message || t('categories_page.automation_preview_error'),
    }
  } finally {
    previewingAutomationId.value = null
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
      message: t('categories_page.automation_apply_success', { transactions: affectedTransactions, entries: affectedEntries }),
    }
  } catch (error: any) {
    feedback.value = {
      type: 'error',
      message: error?.response?.data?.message || t('categories_page.automation_apply_error'),
    }
  } finally {
    applyingAutomationId.value = null
  }
}

const goToOpenFinanceSettings = () => {
  if (!canUseConnectedFinance.value) {
    router.push({ name: 'choose-plan', query: { feature: 'connected-finance' } })
    return
  }
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
  await loadBillingCapabilities()
  await Promise.all([fetchCategories(), fetchTags(), fetchAutomations()])
})

watch(locale, () => {
  fetchCategories()
  fetchAutomations()
})
</script>

<style scoped>
/* ── Tabs shell ──────────────────────────────────────────────────────────── */
.tabs-shell { overflow: hidden; }

.tabs-shell__header {
  border-bottom: 1px solid var(--cb-border);
}

.tabs-shell__content { padding: 24px; }

.categories-tabs :deep(.v-tab) {
  text-transform: none;
  letter-spacing: 0;
  min-width: 120px;
  font-weight: 600;
}

/* ── Stats grid ──────────────────────────────────────────────────────────── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stats-grid--tags { grid-template-columns: repeat(3, minmax(0, 1fr)); }

.stat-card {
  background: var(--cb-surface);
  border: 1px solid var(--cb-border-card);
  border-radius: 8px;
  padding: 18px 20px;
}

.stat-card--warning { border-color: rgba(217, 119, 6, 0.38); }
.stat-card__label   { color: var(--cb-ink-muted); font-size: 0.9rem; margin-bottom: 8px; }
.stat-card__value   { color: var(--cb-ink); font-size: 2rem; font-weight: 700; }

/* ── Insight band ────────────────────────────────────────────────────────── */
.insight-band {
  border: 1px solid var(--cb-border-card);
  border-radius: 8px;
  background: var(--cb-surface-soft);
  padding: 24px;
  margin-bottom: 24px;
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
  color: var(--cb-primary);
  text-transform: uppercase;
  margin-bottom: 10px;
}

.insight-band__copy h2 { margin: 0 0 10px; font-size: 1.7rem; color: var(--cb-ink); }
.insight-band__copy p  { margin: 0; color: var(--cb-ink-muted); max-width: 780px; }

.insight-band__meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(140px, 1fr));
  gap: 12px;
  min-width: 320px;
}

.insight-band__meta--single { grid-template-columns: 1fr; min-width: 160px; }

.meta-chip {
  border: 1px solid var(--cb-border-card);
  border-radius: 8px;
  padding: 16px;
  background: var(--cb-surface);
}

.meta-chip span  { display: block; font-size: 1.5rem; font-weight: 700; color: var(--cb-ink); }
.meta-chip small { color: var(--cb-ink-muted); }

/* ── Content grid ────────────────────────────────────────────────────────── */
.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(320px, 1fr);
  gap: 24px;
}

/* ── Surface cards ───────────────────────────────────────────────────────── */
.surface-card { padding: 24px; }
.surface-card__header { margin-bottom: 20px; }
.surface-card__title  { margin: 0 0 6px; font-size: 1.25rem; color: var(--cb-ink); }
.surface-card__subtitle { margin: 0; color: var(--cb-ink-muted); }

/* ── Filters ─────────────────────────────────────────────────────────────── */
.filters-row {
  display: grid;
  grid-template-columns: minmax(240px, 1fr) auto auto;
  gap: 16px;
  align-items: center;
  margin-bottom: 20px;
}

.filters-row--tags { grid-template-columns: minmax(240px, 1fr) auto; }
.modern-input { min-width: 0; }

/* ── States ──────────────────────────────────────────────────────────────── */
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

.compact-empty { min-height: 180px; }
.empty-message,
.placeholder-state p { color: var(--cb-ink-muted); max-width: 460px; }

/* ── Category rows ───────────────────────────────────────────────────────── */
.category-list { display: flex; flex-direction: column; gap: 14px; }

.category-row {
  border: 1px solid var(--cb-border-card);
  border-radius: 8px;
  padding: 18px;
  background: var(--cb-surface);
}

.category-row--child { margin-left: 28px; border-style: dashed; }

.category-row__main {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}

.category-row__identity { display: flex; align-items: center; gap: 14px; min-width: 0; }

.category-avatar {
  width: 42px;
  height: 42px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--cb-primary) 12%, transparent);
  color: var(--cb-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.category-avatar--custom {
  background: color-mix(in srgb, var(--cb-primary) 18%, transparent);
}

.category-row__name { font-size: 1rem; font-weight: 600; color: var(--cb-ink); }
.category-row__code { font-size: 0.9rem; color: var(--cb-ink-muted); }

.category-row__badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
}

.mapping-tags  { display: flex; flex-wrap: wrap; gap: 8px; margin: 14px 0 0; }
.mapping-chip  { display: inline-flex; align-items: center; gap: 6px; }

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

.mapping-chip__remove:disabled { cursor: default; opacity: 0.5; }

.category-row__actions { display: flex; gap: 8px; margin-top: 14px; justify-content: flex-end; }

/* ── Mapping queue ───────────────────────────────────────────────────────── */
.mapping-queue { display: flex; flex-direction: column; gap: 14px; }

.mapping-queue__row {
  display: flex;
  flex-direction: column;
  gap: 16px;
  border: 1px solid var(--cb-border-card);
  border-radius: 8px;
  padding: 16px;
  background: var(--cb-surface);
}

.mapping-queue__name     { font-weight: 600; color: var(--cb-ink); }
.mapping-queue__meta     { margin-top: 6px; color: var(--cb-ink-muted); font-size: 0.92rem; }
.mapping-queue__controls {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
}
.mapping-select          { min-width: 0; }
.mapping-footer          { display: flex; justify-content: flex-end; margin-top: 16px; }

/* ── Tag grid ────────────────────────────────────────────────────────────── */
.tag-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }

.tag-card {
  border: 1px solid var(--cb-border-card);
  border-radius: 8px;
  padding: 18px;
  background: var(--cb-surface);
}

.tag-card__main,
.tag-card__actions { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.tag-card__actions { margin-top: 14px; justify-content: flex-end; }

.tag-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: 999px;
  padding: 10px 14px;
  font-weight: 600;
}

/* ── Automation list ─────────────────────────────────────────────────────── */
.automation-list { display: flex; flex-direction: column; gap: 16px; }

.automation-card {
  border: 1px solid var(--cb-border-card);
  border-radius: 8px;
  padding: 18px;
  background: var(--cb-surface);
}

.automation-card__main {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}

.automation-card__title   { font-size: 1rem; font-weight: 700; color: var(--cb-ink); margin-bottom: 6px; }
.automation-card__rule    { color: var(--cb-ink-muted); line-height: 1.5; }

.automation-card__actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 14px;
  flex-wrap: wrap;
}

.automation-preview-panel {
  border: 1px solid var(--cb-border-card);
  border-radius: 8px;
  background: var(--cb-surface-soft);
  margin-top: 16px;
  padding: 14px;
}

.automation-preview-panel__summary {
  color: var(--cb-ink);
  font-weight: 700;
  margin-bottom: 12px;
}

.automation-preview-panel__examples {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.automation-preview-example {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border: 1px solid var(--cb-border-card);
  border-radius: 8px;
  background: var(--cb-surface);
  padding: 12px;
}

.automation-preview-example strong {
  display: block;
  color: var(--cb-ink);
  font-size: 0.95rem;
}

.automation-preview-example span,
.automation-preview-panel__empty {
  color: var(--cb-ink-muted);
  font-size: 0.88rem;
}

.automation-preview-panel__empty { margin: 0; }

.automation-condition-grid {
  display: grid;
  grid-template-columns: minmax(150px, 0.8fr) minmax(0, 1.2fr);
  gap: 12px;
}

.automation-preview__icon { width: 56px; height: 56px; min-height: 56px; margin-bottom: 0; }

/* ── Placeholder state ───────────────────────────────────────────────────── */
.placeholder-state__icon {
  width: 84px;
  height: 84px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--cb-primary) 10%, transparent);
  color: var(--cb-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 18px;
}

.placeholder-state h2 { margin: 0 0 10px; color: var(--cb-ink); }

/* ── Drawer ──────────────────────────────────────────────────────────────── */
.category-drawer :deep(.v-navigation-drawer__content) {
  background: var(--cb-surface);
}

.drawer-shell { min-height: 100%; display: flex; flex-direction: column; }

.drawer-shell__header,
.drawer-shell__footer {
  padding: 24px;
  border-bottom: 1px solid var(--cb-border);
}

.drawer-shell__footer {
  border-bottom: 0;
  border-top: 1px solid var(--cb-border);
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

.drawer-shell__header h2 { margin: 0 0 8px; color: var(--cb-ink); font-size: 1.9rem; }
.drawer-shell__header p  { margin: 0; color: var(--cb-ink-muted); }

.drawer-shell__body { padding: 24px; display: flex; flex-direction: column; gap: 24px; }

.drawer-section       { display: flex; flex-direction: column; gap: 16px; }
.drawer-section--muted { padding-top: 8px; }

.drawer-section__label {
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--cb-primary);
}

/* ── Type toggle ─────────────────────────────────────────────────────────── */
.type-toggle {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.type-toggle__option {
  min-height: 54px;
  border-radius: 8px;
  border: 1px solid var(--cb-border);
  background: var(--cb-surface-soft);
  color: var(--cb-ink-muted);
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.type-toggle__option--active {
  background: var(--cb-primary);
  color: #ffffff;
  border-color: color-mix(in srgb, var(--cb-primary) 35%, transparent);
  box-shadow: 0 4px 14px color-mix(in srgb, var(--cb-primary) 22%, transparent);
}

/* ── Icon + color pickers ────────────────────────────────────────────────── */
.icon-grid  { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }

.icon-option {
  min-height: 52px;
  border-radius: 8px;
  border: 1px solid var(--cb-border);
  background: var(--cb-surface-soft);
  color: var(--cb-ink-muted);
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-option--active {
  border-color: color-mix(in srgb, var(--cb-primary) 40%, transparent);
  color: var(--cb-primary);
  box-shadow: 0 4px 14px color-mix(in srgb, var(--cb-primary) 10%, transparent);
}

.color-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }

.color-option {
  min-height: 44px;
  border-radius: 999px;
  border: 3px solid transparent;
  display: flex;
  align-items: center;
  justify-content: center;
}

.color-option--active { border-color: var(--cb-ink); }

/* ── Preview card ────────────────────────────────────────────────────────── */
.preview-card {
  display: flex;
  align-items: center;
  gap: 14px;
  border: 1px solid var(--cb-border-card);
  border-radius: 8px;
  padding: 16px;
  background: var(--cb-surface-soft);
}

.preview-card strong { display: block; color: var(--cb-ink); }
.preview-card span   { color: var(--cb-ink-muted); font-size: 0.92rem; }

/* ── Responsive ──────────────────────────────────────────────────────────── */
@media (max-width: 1180px) {
  .content-grid             { grid-template-columns: 1fr; }
  .tag-grid                 { grid-template-columns: 1fr; }
  .automation-card__main    { flex-direction: column; }
  .insight-band__headline   { flex-direction: column; }
  .insight-band__meta       { min-width: 0; width: 100%; }
}

@media (max-width: 900px) {
  .stats-grid                 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .filters-row,
  .filters-row--tags          { grid-template-columns: 1fr; }
  .mapping-queue__controls    { grid-template-columns: 1fr; }
  .automation-condition-grid  { grid-template-columns: 1fr; }
}

@media (max-width: 640px) {
  .tabs-shell__content,
  .surface-card,
  .drawer-shell__header,
  .drawer-shell__body,
  .drawer-shell__footer { padding-left: 16px; padding-right: 16px; }

  .stats-grid                  { grid-template-columns: 1fr; }
  .category-row__main          { flex-direction: column; }
  .category-row--child         { margin-left: 0; }
  .category-row__badges,
  .category-row__actions       { justify-content: flex-start; }
}
</style>
