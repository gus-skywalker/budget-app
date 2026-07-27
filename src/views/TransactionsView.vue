<template>
  <div class="cb-page">
    <div class="cb-container">

      <!-- Page Header with Summary Strip -->
      <page-header
        :title="$t('sidebar.transactions')"
        :period="activeMonthLabel"
        :summary-items="transactionSummaryItems"
      >
        <template #actions>
          <v-btn
            size="small"
            variant="tonal"
            color="var(--cb-ink-secondary)"
            style="text-transform:none;font-weight:600;letter-spacing:0"
            @click="openFormDrawer('income')"
          >
            <v-icon start size="14">mdi-trending-up</v-icon>
            {{ $t('income.save') }}
          </v-btn>
          <v-btn
            size="small"
            class="cb-btn-primary"
            @click="openFormDrawer('expense')"
          >
            <v-icon start size="14">mdi-plus</v-icon>
            {{ $t('transactions.add_expense') }}
          </v-btn>
        </template>
      </page-header>

      <!-- Alert: Open Finance conflicts -->
      <alert-strip
        v-if="openFinanceConflicts.length > 0"
        variant="warning"
        :title="$t('overview.open_finance_conflicts', { count: openFinanceConflicts.length })"
      >
        <template #actions>
          <v-btn
            size="x-small"
            variant="text"
            color="var(--cb-warning)"
            style="text-transform:none"
            @click="activeTab = 'expense'; expenseListFilter = 'conflicts'"
          >
            {{ $t('common.resolve') || 'Resolver' }}
          </v-btn>
        </template>
      </alert-strip>

      <!-- Filter Bar: Tabs + Month Nav + Filter Chips -->
      <div class="cb-filter-bar">
        <div class="cb-filter-chips">
          <!-- Tab: Despesas -->
          <button
            class="cb-chip"
            :class="{ 'cb-chip--active': activeTab === 'expense' }"
            @click="activeTab = 'expense'"
          >
            <v-icon size="12" start>mdi-trending-down</v-icon>
            {{ $t('expense.title') }}
          </button>
          <!-- Tab: Receitas -->
          <button
            class="cb-chip"
            :class="{ 'cb-chip--active': activeTab === 'income' }"
            @click="activeTab = 'income'"
          >
            <v-icon size="12" start>mdi-trending-up</v-icon>
            {{ $t('income.title') }}
          </button>

          <div style="width:1px;height:20px;background:rgba(23,32,51,.12);margin:0 4px;align-self:center"></div>

          <!-- Expense filters -->
          <template v-if="activeTab === 'expense'">
            <button class="cb-chip" :class="{ 'cb-chip--active': expenseListFilter === 'all' }" @click="expenseListFilter = 'all'">{{ $t('transactionVisibility.filters.all') }}</button>
            <button class="cb-chip" :class="{ 'cb-chip--active': expenseListFilter === 'workspace' }" @click="expenseListFilter = 'workspace'">{{ $t('transactionVisibility.filters.workspace') }}</button>
            <button class="cb-chip" :class="{ 'cb-chip--active': expenseListFilter === 'private' }" @click="expenseListFilter = 'private'">{{ $t('transactionVisibility.filters.private') }}</button>
            <button class="cb-chip" :class="{ 'cb-chip--active': expenseListFilter === 'open-finance' }" @click="expenseListFilter = 'open-finance'">{{ $t('transactions.filters.open_finance') }}</button>
            <button class="cb-chip" :class="{ 'cb-chip--active': expenseListFilter === 'uncategorized' }" @click="expenseListFilter = 'uncategorized'">{{ $t('expense.uncategorized_only') }}</button>
            <button
              v-if="openFinanceConflicts.length > 0"
              class="cb-chip cb-chip--warning"
              :class="{ 'cb-chip--active': expenseListFilter === 'conflicts' }"
              @click="expenseListFilter = 'conflicts'"
            >
              {{ $t('transactions.filters.conflicts') }} ({{ openFinanceConflicts.length }})
            </button>
          </template>

          <!-- Income filters -->
          <template v-else>
            <button class="cb-chip" :class="{ 'cb-chip--active': incomeListFilter === 'all' }" @click="incomeListFilter = 'all'">{{ $t('transactionVisibility.filters.all') }}</button>
            <button class="cb-chip" :class="{ 'cb-chip--active': incomeListFilter === 'workspace' }" @click="incomeListFilter = 'workspace'">{{ $t('transactionVisibility.filters.workspace') }}</button>
            <button class="cb-chip" :class="{ 'cb-chip--active': incomeListFilter === 'private' }" @click="incomeListFilter = 'private'">{{ $t('transactionVisibility.filters.private') }}</button>
            <button class="cb-chip" :class="{ 'cb-chip--active': incomeListFilter === 'open-finance' }" @click="incomeListFilter = 'open-finance'">{{ $t('transactions.filters.open_finance') }}</button>
            <button
              v-if="openFinanceConflicts.length > 0"
              class="cb-chip cb-chip--warning"
              :class="{ 'cb-chip--active': incomeListFilter === 'conflicts' }"
              @click="incomeListFilter = 'conflicts'"
            >
              {{ $t('transactions.filters.conflicts') }} ({{ openFinanceConflicts.length }})
            </button>
          </template>
        </div>

        <!-- Month Nav -->
        <div class="cb-month-nav">
          <v-btn icon size="x-small" variant="text" @click="goToPrevMonth">
            <v-icon size="16">mdi-chevron-left</v-icon>
          </v-btn>
          <span class="cb-month-nav__label">{{ activeMonthLabel }}</span>
          <v-btn icon size="x-small" variant="text" @click="goToNextMonth">
            <v-icon size="16">mdi-chevron-right</v-icon>
          </v-btn>
        </div>
      </div>

      <!-- Expense Drill-Down Banner -->
      <div
        v-if="hasActiveExpenseDrillDown && activeTab === 'expense'"
        class="cb-alert-strip cb-alert-strip--info"
        style="margin-bottom:12px"
      >
        <div class="cb-alert-strip__icon">
          <v-icon size="16" color="var(--cb-accent)">mdi-tune-vertical</v-icon>
        </div>
        <div class="cb-alert-strip__body">
          <p class="cb-alert-strip__desc">
            {{ $t('transactions.applied_filter') }}:
            <strong v-if="activeExpenseCategoryName">{{ activeExpenseCategoryName }}</strong>
            <strong v-if="activeExpenseCategoryName && activeExpenseAccountName"> · </strong>
            <strong v-if="activeExpenseAccountName">{{ activeExpenseAccountName }}</strong>
            <strong v-if="(activeExpenseCategoryName || activeExpenseAccountName) && activeExpenseFilterLabel"> · </strong>
            <strong v-if="activeExpenseFilterLabel">{{ activeExpenseFilterLabel }}</strong>
          </p>
        </div>
        <div class="cb-alert-strip__actions">
          <v-btn size="x-small" variant="text" @click="clearExpenseDrillDown">{{ $t('common.clear') }}</v-btn>
        </div>
      </div>

      <!-- AI Batch Queue (expenses only, when uncategorized exist) -->
      <div v-if="activeTab === 'expense' && uncategorizedExpenses.length" class="cb-card" style="margin-bottom:12px">
        <div class="cb-card__body" style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">
          <div>
            <div class="cb-card__title" style="margin-bottom:2px">{{ $t('expense.ai_queue_title') }}</div>
            <div style="font-size:.8rem;color:var(--cb-ink-muted)">
              {{ $t('expense.ai_queue_summary', { total: uncategorizedExpenses.length, suggested: uncategorizedSuggestionCount }) }}
            </div>
            <div v-if="uncategorizedOpenFinanceExpenses.length" class="open-finance-ai-summary">
              {{ $t('expense.open_finance_ai_queue_summary', { total: uncategorizedOpenFinanceExpenses.length }) }}
            </div>
            <div v-if="openFinanceCategorizationResult" class="open-finance-ai-result">
              {{ openFinanceCategorizationSummary }}
            </div>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <v-btn
              v-if="uncategorizedOpenFinanceExpenses.length"
              size="small"
              class="cb-btn-primary"
              :loading="isAutoClassifyingOpenFinance"
              :disabled="!canUseAi || isBatchSuggestingExpenseCategories || isApplyingBatchExpenseSuggestions"
              @click="classifyOpenFinanceExpensesInBatch"
            >
              <v-icon start size="14">mdi-bank-transfer</v-icon>
              {{ $t('expense.open_finance_ai_classify') }}
            </v-btn>
            <v-btn size="small" variant="tonal" color="var(--cb-accent)" :loading="isBatchSuggestingExpenseCategories" :disabled="!canUseAi" @click="suggestUncategorizedExpensesInBatch">
              <v-icon start size="14">mdi-brain</v-icon>
              {{ $t('expense.ai_queue_suggest') }}
            </v-btn>
            <v-btn size="small" color="var(--cb-accent)" :disabled="!canApplyBatchExpenseSuggestions" :loading="isApplyingBatchExpenseSuggestions" @click="applyBatchExpenseSuggestions">
              <v-icon start size="14">mdi-check-decagram</v-icon>
              {{ $t('expense.ai_queue_apply') }}
            </v-btn>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'expense'" class="daily-consumption-report">
        <div class="daily-consumption-report__header">
          <div>
            <div class="cb-card__title">{{ $t('expense.daily_report_title') }}</div>
            <p>{{ $t('expense.daily_report_summary', dailyConsumptionSummary) }}</p>
          </div>
          <div class="daily-consumption-report__total">
            <span>{{ $t('expense.daily_report_total') }}</span>
            <strong>{{ formatMoney(dailyConsumptionSummary.total) }}</strong>
          </div>
        </div>
        <div v-if="dailyConsumptionRows.length" class="daily-consumption-report__rows">
          <div
            v-for="row in dailyConsumptionRows"
            :key="row.date"
            class="daily-consumption-report__row"
          >
            <span class="daily-consumption-report__date">{{ formatDailyReportDate(row.date) }}</span>
            <span class="daily-consumption-report__category">{{ row.topCategoryLabel }}</span>
            <span class="daily-consumption-report__meta">
              {{ $t('expense.daily_report_row_meta', { count: row.count, openFinance: row.openFinanceCount }) }}
            </span>
            <strong>{{ formatMoney(row.total) }}</strong>
          </div>
        </div>
        <p v-else class="daily-consumption-report__empty">{{ $t('expense.daily_report_empty') }}</p>
      </div>

      <!-- Transaction List Card -->
      <div class="cb-card">

        <!-- EXPENSE LIST -->
        <template v-if="activeTab === 'expense'">
          <v-list v-if="!isLoadingExpenses && filteredMonthlyExpenses.length" class="pa-0">
            <expense-item
              v-for="(item, index) in filteredMonthlyExpenses"
              :key="index"
              :expense="item"
              :reminder-state="reminderStateFor(item)"
              :resolving-action="resolvingConflictId === item.reconciliationConflictId ? resolvingConflictAction : null"
              :ai-suggesting="aiSuggestingExpenseId === item.id"
              :has-suggestion-ready="Boolean(getStoredExpenseSuggestion(item.id))"
              :suggestion-details="getExpenseSuggestionDetails(item)"
              :is-applying-suggestion="applyingExpenseSuggestionId === item.id"
              @openReminder="openTransactionReminder"
              @openAttachments="openTransactionAttachments"
              @agreementCreated="handleSharedAgreementCreated"
              @agreementUpdated="handleSharedAgreementUpdated"
              @agreementError="handleSharedAgreementError"
              @resolveConflict="handleResolveExpenseConflict"
              @suggestCategory="handleSuggestExpenseCategoryInline"
              @applySuggestion="applyStoredExpenseSuggestionInline"
              @openComments="openTransactionComments"
              @deleteExpense="deleteExpense"
              @togglePlanningExclusion="toggleExpensePlanningExclusion"
              @select="openTransactionDetails('expense', item)"
            />
          </v-list>
          <div v-else-if="!isLoadingExpenses" style="padding:40px 24px;text-align:center">
            <v-icon size="40" color="var(--cb-ink-disabled)" style="display:block;margin:0 auto 12px">mdi-receipt-text-outline</v-icon>
            <p style="font-family:var(--cb-font-heading);font-size:.925rem;font-weight:600;color:var(--cb-ink);margin:0 0 8px">{{ expenseEmptyMessage }}</p>
            <v-btn size="small" class="cb-btn-primary mt-2" @click="openFormDrawer('expense')">
              <v-icon start size="14">mdi-plus</v-icon>{{ $t('expense.save') }}
            </v-btn>
          </div>
          <div v-else style="padding:40px 24px;text-align:center">
            <v-progress-circular indeterminate color="var(--cb-primary)" size="32" />
          </div>
          <div v-if="expensePagination.total > expensePagination.limit" class="cb-tx-pagination">
            <span class="cb-tx-pagination__label">{{ expenseRangeLabel }}</span>
            <div style="display:flex;gap:2px">
              <v-btn icon size="x-small" variant="text" :disabled="!canGoToPreviousExpensePage" @click="goToPreviousExpensePage"><v-icon>mdi-chevron-left</v-icon></v-btn>
              <v-btn icon size="x-small" variant="text" :disabled="!canGoToNextExpensePage" @click="goToNextExpensePage"><v-icon>mdi-chevron-right</v-icon></v-btn>
            </div>
          </div>
        </template>

        <!-- INCOME LIST -->
        <template v-else>
          <v-list v-if="!isLoadingIncomes && filteredMonthlyIncomes.length" class="pa-0">
            <income-item
              v-for="(item, index) in filteredMonthlyIncomes"
              :key="index"
              :income="item"
              :resolving-action="resolvingConflictId === item.reconciliationConflictId ? resolvingConflictAction : null"
              @toggle-recurring="toggleRecurring"
              @deleteIncome="deleteIncome"
              @togglePlanningExclusion="toggleIncomePlanningExclusion"
              @resolveConflict="handleResolveIncomeConflict"
              @openComments="openTransactionComments"
              @select="openTransactionDetails('income', item)"
            />
          </v-list>
          <div v-else-if="!isLoadingIncomes" style="padding:40px 24px;text-align:center">
            <v-icon size="40" color="var(--cb-ink-disabled)" style="display:block;margin:0 auto 12px">mdi-cash-plus</v-icon>
            <p style="font-family:var(--cb-font-heading);font-size:.925rem;font-weight:600;color:var(--cb-ink);margin:0 0 8px">{{ incomeEmptyMessage }}</p>
            <v-btn size="small" class="cb-btn-primary mt-2" @click="openFormDrawer('income')">
              <v-icon start size="14">mdi-plus</v-icon>{{ $t('income.save') }}
            </v-btn>
          </div>
          <div v-else style="padding:40px 24px;text-align:center">
            <v-progress-circular indeterminate color="var(--cb-primary)" size="32" />
          </div>
          <div v-if="incomePagination.total > incomePagination.limit" class="cb-tx-pagination">
            <span class="cb-tx-pagination__label">{{ incomeRangeLabel }}</span>
            <div style="display:flex;gap:2px">
              <v-btn icon size="x-small" variant="text" :disabled="!canGoToPreviousIncomePage" @click="goToPreviousIncomePage"><v-icon>mdi-chevron-left</v-icon></v-btn>
              <v-btn icon size="x-small" variant="text" :disabled="!canGoToNextIncomePage" @click="goToNextIncomePage"><v-icon>mdi-chevron-right</v-icon></v-btn>
            </div>
          </div>
        </template>

      </div><!-- end list card -->

    </div><!-- end cb-container -->

    <!-- DETAILS DRAWER (right side slide-over) -->
    <v-navigation-drawer
      v-model="transactionDetailsPanel.show"
      location="right"
      :width="440"
      temporary
      class="transaction-details-drawer"
    >
      <div v-if="selectedTransactionDetails" class="transaction-details-panel">
        <div class="transaction-details-panel__header">
          <div class="transaction-details-panel__title-group">
            <span class="transaction-details-panel__eyebrow">
              {{ transactionTypeLabel(transactionDetailsPanel.type) }}
            </span>
            <h2>{{ selectedTransactionDetails.description }}</h2>
            <span class="transaction-details-panel__date">{{ formatDetailsDate(selectedTransactionDetails.date) }}</span>
          </div>
          <v-btn icon size="small" variant="text" @click="closeTransactionDetails">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>

        <div class="transaction-details-panel__amount">
          {{ formatTransactionAmount(selectedTransactionDetails) }}
        </div>

        <div class="transaction-details-panel__actions">
          <v-btn size="small" class="cb-btn-primary" @click="editSelectedTransaction">
            <v-icon start size="14">mdi-pencil-outline</v-icon>
            {{ $t('transactions.details.edit') }}
          </v-btn>
        </div>

        <section class="transaction-details-section">
          <span class="transaction-details-section__label">{{ $t('transactions.details.summary') }}</span>
          <div class="transaction-details-grid">
            <div v-if="transactionDetailsPanel.type === 'expense'" class="transaction-details-field">
              <span>{{ $t('common.category') }}</span>
              <strong>
                <v-icon
                  v-if="transactionCategoryIcon(selectedTransactionDetails)"
                  size="15"
                  :color="transactionCategoryColor(selectedTransactionDetails)"
                >
                  {{ transactionCategoryIcon(selectedTransactionDetails) }}
                </v-icon>
                {{ transactionCategoryLabel(selectedTransactionDetails) }}
              </strong>
            </div>
            <div class="transaction-details-field">
              <span>{{ $t('common.payment_method') }}</span>
              <strong>{{ transactionPaymentMethodLabel(selectedTransactionDetails) }}</strong>
            </div>
            <div class="transaction-details-field">
              <span>{{ $t('transactionVisibility.label') }}</span>
              <strong>{{ transactionVisibilityLabel(selectedTransactionDetails) }}</strong>
            </div>
            <div class="transaction-details-field">
              <span>{{ $t('transactions.details.planning') }}</span>
              <strong>{{ transactionPlanningLabel(selectedTransactionDetails) }}</strong>
            </div>
          </div>
        </section>

        <section v-if="hasTransactionCollaboration(selectedTransactionDetails)" class="transaction-details-section">
          <span class="transaction-details-section__label">{{ $t('transactions.details.collaboration_tracking') }}</span>
          <div class="transaction-details-list">
            <div v-if="canShowTransactionComments(selectedTransactionDetails)" class="transaction-details-list__row transaction-details-list__row--action">
              <div>
                <span>{{ $t('transactions.details.comments') }}</span>
                <strong>{{ transactionCommentsStatusLabel(selectedTransactionDetails) }}</strong>
              </div>
              <v-btn
                size="x-small"
                variant="tonal"
                color="var(--cb-primary)"
                @click="openSelectedTransactionComments"
              >
                {{ $t('transactions.details.open') }}
              </v-btn>
            </div>
            <div v-if="canShowTransactionAgreements(selectedTransactionDetails)" class="transaction-details-list__row transaction-details-list__row--action">
              <div>
                <span>{{ transactionAgreementTitle(selectedTransactionDetails) }}</span>
                <strong>{{ transactionAgreementStatusLabel(selectedTransactionDetails) }}</strong>
              </div>
              <v-btn
                size="x-small"
                variant="tonal"
                color="var(--cb-primary)"
                @click="handleTransactionAgreementAction(selectedTransactionDetails)"
              >
                {{ transactionAgreementActionLabel(selectedTransactionDetails) }}
              </v-btn>
            </div>
            <div v-if="canShowTransactionAttachments(selectedTransactionDetails)" class="transaction-details-list__row transaction-details-list__row--action">
              <div>
                <span>{{ $t('transactions.details.attachments') }}</span>
                <strong>{{ transactionAttachmentStatusLabel(selectedTransactionDetails) }}</strong>
              </div>
              <v-btn
                size="x-small"
                variant="tonal"
                color="var(--cb-primary)"
                :loading="transactionAttachmentStatus(selectedTransactionDetails) === 'loading'"
                @click="handleTransactionAttachmentAction(selectedTransactionDetails)"
              >
                {{ transactionAttachmentActionLabel(selectedTransactionDetails) }}
              </v-btn>
            </div>
            <div v-if="canShowTransactionReminder(selectedTransactionDetails)" class="transaction-details-list__row transaction-details-list__row--action">
              <div>
                <span>{{ $t('transactions.details.personal_reminder') }}</span>
                <strong>{{ transactionReminderStatusLabel(selectedTransactionDetails) }}</strong>
              </div>
              <v-btn
                v-if="transactionReminderStatus(selectedTransactionDetails) !== 'loading'"
                size="x-small"
                variant="tonal"
                color="var(--cb-primary)"
                @click="handleTransactionReminderAction(selectedTransactionDetails)"
              >
                {{ transactionReminderActionLabel(selectedTransactionDetails) }}
              </v-btn>
            </div>
            <shared-expense-agreement-visibility
              v-if="transactionAgreementVisibilityOpen && transactionAgreements(selectedTransactionDetails).length"
              :agreements="transactionAgreements(selectedTransactionDetails)"
            />
          </div>
        </section>

        <section v-if="transactionDetailsPanel.type === 'expense'" class="transaction-details-section">
          <span class="transaction-details-section__label">{{ $t('transactions.details.categorization') }}</span>
          <div class="transaction-details-list">
            <div class="transaction-details-list__row">
              <span>{{ $t('transactions.details.source') }}</span>
              <strong>{{ categorizationSourceLabel(selectedTransactionDetails.categorizationSource) }}</strong>
            </div>
            <div v-if="shouldShowCategorizationReason(selectedTransactionDetails.categorizationReason)" class="transaction-details-list__row">
              <span>{{ $t('transactions.details.reason') }}</span>
              <strong>{{ selectedTransactionDetails.categorizationReason }}</strong>
            </div>
            <div v-if="selectedTransactionDetails.categorizedAt" class="transaction-details-list__row">
              <span>{{ $t('transactions.details.categorized_at') }}</span>
              <strong>{{ formatDetailsDateTime(selectedTransactionDetails.categorizedAt) }}</strong>
            </div>
          </div>
        </section>

        <section class="transaction-details-section">
          <span class="transaction-details-section__label">{{ $t('transactions.details.financial_origin') }}</span>
          <div class="transaction-details-list">
            <div class="transaction-details-list__row">
              <span>{{ $t('transactions.details.origin') }}</span>
              <strong>{{ transactionOriginLabel(selectedTransactionDetails) }}</strong>
            </div>
            <div v-if="selectedTransactionDetails.openFinanceDocumentType" class="transaction-details-list__row">
              <span>{{ $t('transactions.details.source_type') }}</span>
              <strong>{{ transactionDocumentTypeLabel(selectedTransactionDetails) }}</strong>
            </div>
            <div v-if="selectedTransactionDetails.openFinanceSharingLabel" class="transaction-details-list__row">
              <span>{{ $t('transactions.details.sharing') }}</span>
              <strong>{{ selectedTransactionDetails.openFinanceSharingLabel }}</strong>
            </div>
            <p v-if="selectedTransactionDetails.openFinanceSharingNote" class="transaction-details-note">
              {{ selectedTransactionDetails.openFinanceSharingNote }}
            </p>
          </div>
        </section>

        <section
          v-if="selectedTransactionDetails.reconciliationStatus || selectedTransactionDetails.reconciliationConflictReason"
          class="transaction-details-section"
        >
          <span class="transaction-details-section__label">{{ $t('transactions.details.reconciliation') }}</span>
          <div class="transaction-details-list">
            <div v-if="selectedTransactionDetails.reconciliationStatus" class="transaction-details-list__row">
              <span>{{ $t('transactions.details.status') }}</span>
              <strong>{{ transactionReconciliationLabel(selectedTransactionDetails) }}</strong>
            </div>
            <div v-if="selectedTransactionDetails.reconciliationConflictReason" class="transaction-details-list__row">
              <span>{{ $t('transactions.details.conflict_reason') }}</span>
              <strong>{{ selectedTransactionDetails.reconciliationConflictReason }}</strong>
            </div>
          </div>
        </section>
      </div>
    </v-navigation-drawer>

    <!-- FORM DRAWER (right side slide-over) -->
    <v-navigation-drawer
      v-model="showFormDrawer"
      location="right"
      :width="400"
      temporary
    >
      <div class="cb-drawer-header">
        <h2 class="cb-drawer-title">
          {{ formMode === 'income' ? $t('income.title') : $t('expense.title') }}
          <span
            v-if="(formMode === 'income' && isEditingIncome) || (formMode === 'expense' && isEditingExpense)"
            style="font-weight:400;font-size:.82em;color:var(--cb-ink-muted);margin-left:6px"
          >— editando</span>
        </h2>
        <v-btn icon size="small" variant="text" @click="closeFormDrawer">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>
      <div class="cb-drawer-body">

        <!-- INCOME FORM -->
        <template v-if="formMode === 'income'">
          <v-row>
            <v-col cols="12" sm="6">
              <v-text-field :label="$t('common.date')" type="date" v-model="income.date" variant="outlined" density="comfortable" color="var(--cb-accent)" class="modern-input" />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field :label="$t('common.amount')" type="text" inputmode="decimal" :model-value="income.amount" @update:model-value="onIncomeAmountInput" variant="outlined" density="comfortable" color="var(--cb-accent)" class="modern-input" :rules="[requiredAmount, validCurrencyFormat]" />
            </v-col>
            <v-col cols="12">
              <v-text-field :label="$t('common.description')" v-model="income.description" variant="outlined" density="comfortable" color="var(--cb-accent)" class="modern-input" />
            </v-col>
            <v-col cols="12">
              <v-select :label="$t('common.payment_method')" v-model="income.paymentMethod" :items="paymentMethods" item-title="name" item-value="id" variant="outlined" density="comfortable" color="var(--cb-accent)" class="modern-input" />
              <div v-if="shouldShowOpenFinancePaymentFallback(income)" class="open-finance-field-note">
                {{ openFinancePaymentMethodLabel(income) }}
              </div>
            </v-col>
            <v-col cols="12">
              <v-select :label="$t('transactionVisibility.label')" v-model="income.visibilityScope" :items="localizedTransactionVisibilityOptions" item-title="title" item-value="value" variant="outlined" density="comfortable" color="var(--cb-accent)" class="modern-input" :hint="transactionVisibilityHint(income.visibilityScope)" persistent-hint />
            </v-col>
            <v-col cols="12">
              <v-select :label="$t('common.account')" v-model="income.accountId" :items="financialAccounts" item-title="displayName" item-value="id" variant="outlined" density="comfortable" color="var(--cb-accent)" class="modern-input" :disabled="isLoadingFinancialAccounts || !financialAccounts.length" :hint="financialAccountsHint" persistent-hint />
            </v-col>
          </v-row>
          <v-btn color="var(--cb-accent)" @click="saveIncome" size="large" block style="text-transform:none;font-weight:600;letter-spacing:0;margin-top:8px">
            <v-icon start size="16">mdi-content-save</v-icon>
            {{ isEditingIncome ? $t('income.update') : $t('income.save') }}
          </v-btn>
          <v-btn v-if="isEditingIncome" variant="tonal" color="grey" size="large" block style="text-transform:none;margin-top:8px" @click="cancelIncomeEdit">
            <v-icon start size="16">mdi-cancel</v-icon>{{ $t('common.cancel_edit') }}
          </v-btn>
        </template>

        <!-- EXPENSE FORM -->
        <template v-else>
          <v-row>
            <v-col cols="12" sm="6">
              <v-text-field :label="$t('common.date')" type="date" v-model="expense.date" variant="outlined" density="comfortable" color="var(--cb-primary)" class="modern-input" />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field :label="$t('common.amount')" type="text" inputmode="decimal" :model-value="expense.amount" @update:model-value="onExpenseAmountInput" variant="outlined" density="comfortable" color="var(--cb-primary)" class="modern-input" :rules="[requiredAmount, validCurrencyFormat]" />
            </v-col>
            <v-col cols="12">
              <v-text-field :label="$t('common.description')" v-model="expense.description" variant="outlined" density="comfortable" color="var(--cb-primary)" class="modern-input" />
            </v-col>
            <v-col cols="12" sm="6">
              <v-select :label="$t('common.category')" v-model="expense.category" :items="categories" item-title="name" item-value="id" variant="outlined" density="comfortable" color="var(--cb-primary)" class="modern-input">
                <template #item="{ item, props }">
                  <v-list-item v-bind="props">
                    <template #prepend><v-icon :icon="resolveCategoryIcon(item.raw)" :color="resolveCategoryColor(item.raw)" class="mr-2" /></template>
                  </v-list-item>
                </template>
                <template #selection="{ item, props }">
                  <v-chip v-bind="props" class="ma-1" small><v-icon left :icon="resolveCategoryIcon(item.raw)" :color="resolveCategoryColor(item.raw)" />{{ item.raw.name }}</v-chip>
                </template>
              </v-select>
            </v-col>
            <v-col cols="12" sm="6">
              <v-select :label="$t('common.payment_method')" v-model="expense.paymentMethod" :items="paymentMethods" item-title="name" item-value="id" variant="outlined" density="comfortable" color="var(--cb-primary)" class="modern-input" />
              <div v-if="shouldShowOpenFinancePaymentFallback(expense)" class="open-finance-field-note">
                {{ openFinancePaymentMethodLabel(expense) }}
              </div>
            </v-col>
            <v-col cols="12">
              <div class="ai-category-row">
                <v-btn variant="tonal" color="var(--cb-accent)" :loading="isSuggestingExpenseCategory" :disabled="!canSuggestExpenseCategory" @click="suggestExpenseCategory" size="small">
                  <v-icon start size="14">mdi-brain</v-icon>{{ $t('expense.ai_suggest_category') }}
                </v-btn>
                <span v-if="expenseCategorySuggestion" class="ai-category-row__meta">
                  {{ expenseCategorySuggestionSourceLabel(expenseCategorySuggestion.source) }} · {{ Math.round((expenseCategorySuggestion.suggestedCategory?.confidence || 0) * 100) }}%
                </span>
              </div>
              <v-alert v-if="expenseCategorySuggestion" type="info" variant="tonal" density="comfortable" class="mt-3">
                <div class="ai-category-suggestion">
                  <div><strong>{{ $t('expense.ai_suggested_category') }}:</strong> {{ expenseCategorySuggestion.suggestedCategory?.name }}</div>
                  <div v-if="expenseCategoryReasoningLabel(expenseCategorySuggestion)" class="ai-category-suggestion__reasoning">{{ expenseCategoryReasoningLabel(expenseCategorySuggestion) }}</div>
                  <div class="ai-category-suggestion__actions">
                    <v-btn size="small" color="var(--cb-accent)" variant="outlined" @click="applyExpenseCategorySuggestion">{{ $t('expense.ai_apply_suggestion') }}</v-btn>
                    <v-btn size="small" variant="text" @click="dismissExpenseCategorySuggestion">{{ $t('common.close') }}</v-btn>
                  </div>
                </div>
              </v-alert>
            </v-col>
            <v-col cols="12" sm="6">
              <v-select :label="$t('common.account')" v-model="expense.accountId" :items="financialAccounts" item-title="displayName" item-value="id" variant="outlined" density="comfortable" color="var(--cb-primary)" class="modern-input" :disabled="isLoadingFinancialAccounts || !financialAccounts.length" :hint="financialAccountsHint" persistent-hint />
            </v-col>
            <v-col cols="12" sm="6">
              <v-select :label="$t('transactionVisibility.label')" v-model="expense.visibilityScope" :items="localizedTransactionVisibilityOptions" item-title="title" item-value="value" variant="outlined" density="comfortable" color="var(--cb-primary)" class="modern-input" :hint="transactionVisibilityHint(expense.visibilityScope)" persistent-hint />
            </v-col>
          </v-row>
          <v-btn color="var(--cb-primary)" @click="saveExpense" size="large" block style="text-transform:none;font-weight:600;letter-spacing:0;margin-top:8px">
            <v-icon start size="16">mdi-content-save</v-icon>
            {{ isEditingExpense ? $t('expense.update') : $t('expense.save') }}
          </v-btn>
          <v-btn v-if="isEditingExpense" variant="tonal" color="grey" size="large" block style="text-transform:none;margin-top:8px" @click="cancelExpenseEdit">
            <v-icon start size="16">mdi-cancel</v-icon>{{ $t('common.cancel_edit') }}
          </v-btn>
        </template>

      </div>
    </v-navigation-drawer>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000" top class="modern-snackbar">
      {{ snackbar.text }}
      <template #actions>
        <v-btn color="white" variant="text" @click="snackbar.show = false">{{ $t('common.close') }}</v-btn>
      </template>
    </v-snackbar>
    <TransactionCommentsDialog
      :visible="transactionCommentsDialog.show"
      :loading="transactionCommentsDialog.loading"
      :submitting="transactionCommentsDialog.submitting"
      :comments="transactionCommentsDialog.comments"
      :transaction-description="transactionCommentsDialog.transactionDescription"
      :current-user-id="currentUserId"
      :author-directory="transactionCommentAuthorDirectory"
      @update:visible="handleCommentsDialogVisibility"
      @submit="submitTransactionComment"
    />
    <TransactionAttachmentsDialog
      v-if="transactionAttachmentsDialog.expense"
      v-model="transactionAttachmentsDialog.show"
      :transaction="transactionAttachmentsDialog.expense"
      :attachments="activeAttachmentState.attachments"
      :status="activeAttachmentState.status"
      @upload="handleAttachFiles"
      @download="handleDownloadAttachment"
      @remove="handleRemoveAttachment"
      @share="handleShareExpense"
      @retry="reloadActiveTransactionAttachments"
    />
    <TransactionReminderDialog
      v-if="transactionReminderDialog.expense"
      v-model="transactionReminderDialog.show"
      :transaction="transactionReminderDialog.expense"
      :state="activeReminderState"
      :saving="transactionReminderDialog.saving"
      :deleting="transactionReminderDialog.deleting"
      @save="saveTransactionReminder"
      @remove="deleteTransactionReminder"
      @retry="reloadActiveTransactionReminder"
    />
    <SharedExpenseAgreementDialog
      v-if="transactionAgreementDialog.expense"
      v-model="transactionAgreementDialog.show"
      :expense="transactionAgreementDialog.expense"
      :agreement="transactionAgreementDialog.agreement"
      @created="handlePanelSharedAgreementCreated"
      @updated="handlePanelSharedAgreementUpdated"
      @error="handlePanelSharedAgreementError"
    />
  </div>
</template>

<script>
import IncomeItem from '../components/IncomeItem.vue'
import ExpenseItem from '../components/ExpenseItem.vue'
import TransactionCommentsDialog from '@/components/TransactionCommentsDialog.vue'
import TransactionAttachmentsDialog from '@/components/TransactionAttachmentsDialog.vue'
import TransactionReminderDialog from '@/components/TransactionReminderDialog.vue'
import SharedExpenseAgreementDialog from '@/components/SharedExpenseAgreementDialog.vue'
import SharedExpenseAgreementVisibility from '@/components/SharedExpenseAgreementVisibility.vue'
import IncomeService from '@/services/IncomeService'
import ExpenseService from '@/services/ExpenseService'
import OpenFinanceService from '@/services/OpenFinanceService'
import DataService from '@/services/DataService'
import AiService from '@/services/aiService'
import BillingOrchestrationService from '@/services/BillingOrchestrationService'
import FinancialReadService, { NO_FINANCIAL_ACCOUNT_ERROR_MESSAGE } from '@/services/FinancialReadService'
import NotificationService from '@/services/NotificationService'
import SharedExpenseAgreementService from '@/services/SharedExpenseAgreementService'
import UsersService from '@/services/UsersService'
import WorkspaceService from '@/services/WorkspaceService'
import { useUserStore } from '@/plugins/userStore'
import PageHeader from '@/components/PageHeader.vue'
import AlertStrip from '@/components/AlertStrip.vue'

const toLocalISODate = (date = new Date()) => {
  const timeOffset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - timeOffset).toISOString().split('T')[0]
}
const sanitizeCurrencyInput = (rawValue) => {
  if (rawValue === null || rawValue === undefined) {
    return ''
  }

  const stringValue = String(rawValue)
  if (!stringValue) {
    return ''
  }

  const filtered = stringValue.replace(/[^\d.,]/g, '')
  if (!filtered) {
    return ''
  }

  const lastComma = filtered.lastIndexOf(',')
  const lastDot = filtered.lastIndexOf('.')
  const decimalIndex = Math.max(lastComma, lastDot)
  const decimalSeparator = decimalIndex === lastComma ? ',' : '.'

  if (decimalIndex === -1) {
    const integer = filtered.replace(/\D/g, '')
    return integer.replace(/^0+(?=\d)/, '')
  }

  const integerRaw = filtered.slice(0, decimalIndex).replace(/\D/g, '')
  let integerPart = integerRaw.replace(/^0+(?=\d)/, '')
  let decimalPart = filtered.slice(decimalIndex + 1).replace(/\D/g, '').slice(0, 2)

  if (!integerPart && decimalPart) {
    integerPart = '0'
  }

  if (!integerPart && !decimalPart) {
    return ''
  }

  let sanitized = integerPart

  if (decimalPart || filtered.endsWith(decimalSeparator)) {
    sanitized += decimalSeparator
    sanitized += decimalPart
  }

  return sanitized
}

const parseCurrencyToNumber = (value) => {
  if (value === null || value === undefined) {
    return null
  }

  if (typeof value === 'number') {
    return Number.isNaN(value) ? null : value
  }

  const sanitized = sanitizeCurrencyInput(value)
  if (!sanitized && sanitized !== '0') {
    return null
  }

  const lastComma = sanitized.lastIndexOf(',')
  const lastDot = sanitized.lastIndexOf('.')
  const decimalIndex = Math.max(lastComma, lastDot)

  if (decimalIndex === -1) {
    const integerPart = sanitized.replace(/\D/g, '')
    if (!integerPart) {
      return null
    }
    return Number(integerPart)
  }

  const integerPart = sanitized.slice(0, decimalIndex).replace(/\D/g, '') || '0'
  const decimalPart = sanitized.slice(decimalIndex + 1).replace(/\D/g, '').padEnd(2, '0')
  const numericString = `${integerPart}.${decimalPart}`
  const parsed = Number(numericString)
  return Number.isNaN(parsed) ? null : parsed
}

const formatCurrencyForInput = (value) => {
  if (value === null || value === undefined || value === '') {
    return '0'
  }

  if (typeof value === 'number') {
    const fixed = value.toFixed(2)
    const [integerPart, decimalPart] = fixed.split('.')
    if (decimalPart === '00') {
      return sanitizeCurrencyInput(integerPart) || '0'
    }
    return sanitizeCurrencyInput(`${integerPart}.${decimalPart}`) || '0'
  }

  return sanitizeCurrencyInput(String(value)) || '0'
}

export default {
  components: {
    IncomeItem,
    ExpenseItem,
    TransactionCommentsDialog,
    TransactionAttachmentsDialog,
    TransactionReminderDialog,
    SharedExpenseAgreementDialog,
    SharedExpenseAgreementVisibility,
    PageHeader,
    AlertStrip,
  },
  data() {
    // const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 2026 - 2020 + 1 }, (v, i) => 2020 + i);
    const currentDate = new Date()
    const today = toLocalISODate(currentDate)
    const currentMonth = currentDate.getMonth() + 1
    const currentYear = currentDate.getFullYear()

    return {
      income: {
        date: today,
        amount: '0',
        description: '',
        paymentMethod: null,
        paymentMethodName: null,
        openFinance: false,
        isRecurring: false,
        accountId: null,
        visibilityScope: 'WORKSPACE',
      },
      expense: {
        date: today,
        amount: '0',
        description: '',
        category: null,
        paymentMethod: null,
        paymentMethodName: null,
        openFinance: false,
        selectedUsers: [],
        accountId: null,
        openFinanceBankCategoryId: null,
        visibilityScope: 'WORKSPACE',
      },
      categoryIcons: {
        groceries: 'mdi-cart',
        utilities: 'mdi-lightbulb',
        transportation: 'mdi-bus',
        entertainment: 'mdi-movie',
        healthcare: 'mdi-heart-pulse',
        education: 'mdi-school',
        dining_out: 'mdi-silverware',
        travel: 'mdi-airplane',
        clothing: 'mdi-tshirt-crew',
        home_maintenance: 'mdi-home',
        gifts: 'mdi-gift',
        charity: 'mdi-hand-heart',
        subscriptions: 'mdi-receipt',
        miscellaneous: 'mdi-dots-horizontal',
      },
      categories: [],
      paymentMethods: [],
      financialAccounts: [],
      openFinanceConnections: [],
      isLoadingFinancialAccounts: false,
      selectedIncomeMonth: currentMonth,
      selectedExpenseMonth: currentMonth,
      selectedIncomeYear: currentYear,
      selectedExpenseYear: currentYear,
        selectedLanguage: this.$i18n?.locale || 'pt',
      users: [],
      transactionVisibilityOptions: [
        { titleKey: 'transactionVisibility.workspace', value: 'WORKSPACE' },
        { titleKey: 'transactionVisibility.private', value: 'PRIVATE' },
      ],
      openFinanceConflicts: [],
      billingSummary: null,
      resolvingConflictId: null,
      resolvingConflictAction: null,
      routeExpenseAccountId: null,
      routeExpenseCategory: null,
      routeExpenseCategoryId: null,
      routeExpenseUncategorized: false,
      months: [
        { titleKey: 'common.months.january', value: 1 },
        { titleKey: 'common.months.february', value: 2 },
        { titleKey: 'common.months.march', value: 3 },
        { titleKey: 'common.months.april', value: 4 },
        { titleKey: 'common.months.may', value: 5 },
        { titleKey: 'common.months.june', value: 6 },
        { titleKey: 'common.months.july', value: 7 },
        { titleKey: 'common.months.august', value: 8 },
        { titleKey: 'common.months.september', value: 9 },
        { titleKey: 'common.months.october', value: 10 },
        { titleKey: 'common.months.november', value: 11 },
        { titleKey: 'common.months.december', value: 12 }
      ],
      years,
      monthlyExpenses: [],
      dailyReportExpenses: [],
      monthlyIncomes: [],
      incomePagination: {
        limit: 20,
        offset: 0,
        total: 0,
      },
      expensePagination: {
        limit: 20,
        offset: 0,
        total: 0,
      },
      isLoadingIncomes: false,
      isLoadingExpenses: false,
      incomeListFilter: 'all',
      expenseListFilter: 'all',
      isEditingIncome: false,
      editingIncomeId: null,
      isEditingExpense: false,
      editingExpenseId: null,
      editingExpenseOriginal: null,
      isSuggestingExpenseCategory: false,
      aiSuggestingExpenseId: null,
      applyingExpenseSuggestionId: null,
      expenseCategorySuggestion: null,
      batchExpenseCategorySuggestions: {},
      openFinanceCategorizationResult: null,
      isBatchSuggestingExpenseCategories: false,
      isApplyingBatchExpenseSuggestions: false,
      isAutoClassifyingOpenFinance: false,
      snackbar: {
        show: false,
        text: '',
        color: 'success',
      },
      transactionCommentsDialog: {
        show: false,
        loading: false,
        submitting: false,
        transactionId: null,
        transactionDescription: '',
        comments: [],
      },
      transactionDetailsPanel: {
        show: false,
        type: null,
        transaction: null,
      },
      transactionAgreementDialog: {
        show: false,
        expense: null,
        agreement: null,
      },
      transactionAgreementVisibilityOpen: false,
      transactionAttachmentsDialog: {
        show: false,
        expense: null,
      },
      attachmentStateByTransactionId: {},
      transactionReminderDialog: {
        show: false,
        expense: null,
        saving: false,
        deleting: false,
      },
      reminderStateByTransactionId: {},
      // --- drawer & tab state ---
      showFormDrawer: false,
      formMode: 'expense',
      activeTab: 'expense',
    }
  },
  computed: {
    selectedTransactionDetails() {
      return this.transactionDetailsPanel.transaction
    },
    currentUserId() {
      const userStore = useUserStore()
      return userStore.getUser?.id ? String(userStore.getUser.id) : ''
    },
    transactionCommentAuthorDirectory() {
      return (this.users || []).map((user) => ({
        id: user.id,
        name: user.name,
      }))
    },
    activeAttachmentState() {
      return this.attachmentStateFor(this.transactionAttachmentsDialog.expense)
    },
    activeReminderState() {
      return this.reminderStateFor(this.transactionReminderDialog.expense)
    },
    financialAccountsHint() {
      return this.financialAccounts.length
        ? this.$t('common.account_hint')
        : this.$t('validation.account_required')
    },
    localizedTransactionVisibilityOptions() {
      return this.transactionVisibilityOptions.map((option) => ({
        value: option.value,
        title: this.$t(option.titleKey),
      }))
    },
    localizedMonths() {
      return this.months.map((month) => ({
        value: month.value,
        name: this.$t(month.titleKey),
      }))
    },
    canGoToPreviousIncomePage() {
      return this.incomePagination.offset > 0
    },
    canGoToNextIncomePage() {
      return this.incomePagination.offset + this.incomePagination.limit < this.incomePagination.total
    },
    canGoToPreviousExpensePage() {
      return this.expensePagination.offset > 0
    },
    canGoToNextExpensePage() {
      return this.expensePagination.offset + this.expensePagination.limit < this.expensePagination.total
    },
    incomeRangeLabel() {
      if (!this.incomePagination.total) {
        return '0 / 0'
      }

      const start = this.incomePagination.offset + 1
      const end = Math.min(this.incomePagination.offset + this.incomePagination.limit, this.incomePagination.total)
      return `${start}-${end} / ${this.incomePagination.total}`
    },
    expenseRangeLabel() {
      if (!this.expensePagination.total) {
        return '0 / 0'
      }

      const start = this.expensePagination.offset + 1
      const end = Math.min(this.expensePagination.offset + this.expensePagination.limit, this.expensePagination.total)
      return `${start}-${end} / ${this.expensePagination.total}`
    },
    filteredMonthlyIncomes() {
      return this.applyTransactionFilter(this.monthlyIncomes, this.incomeListFilter)
    },
    filteredMonthlyExpenses() {
      const filteredItems = this.applyExpenseDrillDown(this.applyTransactionFilter(this.monthlyExpenses, this.expenseListFilter))
      if (this.expenseListFilter !== 'uncategorized') {
        return filteredItems
      }

      return [...filteredItems].sort((left, right) => {
        const leftSuggestion = this.getStoredExpenseSuggestion(left.id)
        const rightSuggestion = this.getStoredExpenseSuggestion(right.id)
        const leftHasSuggestion = Boolean(leftSuggestion)
        const rightHasSuggestion = Boolean(rightSuggestion)
        if (leftHasSuggestion === rightHasSuggestion) {
          if (!leftHasSuggestion) {
            return 0
          }

          const leftConfidence = Number(leftSuggestion?.suggestedCategory?.confidence || 0)
          const rightConfidence = Number(rightSuggestion?.suggestedCategory?.confidence || 0)
          return rightConfidence - leftConfidence
        }
        return leftHasSuggestion ? -1 : 1
      })
    },
    uncategorizedExpenses() {
      return this.monthlyExpenses.filter((expense) => !expense?.category)
    },
    uncategorizedOpenFinanceExpenses() {
      return this.uncategorizedExpenses.filter((expense) => this.isOpenFinanceTransaction(expense))
    },
    uncategorizedSuggestionCount() {
      return this.uncategorizedExpenses.filter((expense) => Boolean(this.getStoredExpenseSuggestion(expense.id))).length
    },
    canApplyBatchExpenseSuggestions() {
      return this.uncategorizedExpenses.some((expense) => Boolean(this.getStoredExpenseSuggestion(expense.id)?.suggestedCategory?.id))
    },
    openFinanceCategorizationSummary() {
      const result = this.openFinanceCategorizationResult
      if (!result) {
        return ''
      }
      return this.$t('expense.open_finance_ai_result_summary', {
        candidates: Number(result.candidates || 0),
        applied: Number(result.applied || 0),
        noSuggestion: Number(result.noSuggestion || 0),
        skipped: Number(result.skipped || 0),
      })
    },
    hasActiveExpenseDrillDown() {
      return Boolean(this.routeExpenseAccountId || this.routeExpenseCategory || this.routeExpenseUncategorized || this.expenseListFilter === 'open-finance')
    },
    activeExpenseCategoryName() {
      if (this.routeExpenseUncategorized) {
        return this.$t('expenseItem.uncategorized')
      }
      if (!this.routeExpenseCategory) {
        return null
      }
      const category = this.categories.find((item) => item.name === this.routeExpenseCategory || item.code === this.routeExpenseCategory)
      return category?.name || this.routeExpenseCategory
    },
    activeExpenseAccountName() {
      if (!this.routeExpenseAccountId) {
        return null
      }
      const account = this.financialAccounts.find((item) => item.id === this.routeExpenseAccountId)
      return account?.displayName || account?.name || this.routeExpenseAccountId
    },
    activeExpenseFilterLabel() {
      if (this.expenseListFilter === 'open-finance') {
        return this.$t('transactions.filters.open_finance_only')
      }
      if (this.expenseListFilter === 'workspace') {
        return this.$t('transactionVisibility.filters.workspace')
      }
      if (this.expenseListFilter === 'private') {
        return this.$t('transactionVisibility.filters.private')
      }
      return null
    },
    openFinanceConflictMap() {
      return this.openFinanceConflicts.reduce((accumulator, conflict) => {
        if (conflict?.existingTransactionId) {
          accumulator[conflict.existingTransactionId] = conflict
        }
        return accumulator
      }, {})
    },
    incomeEmptyMessage() {
      if (this.incomeListFilter === 'all') {
        return this.$t('income.no_entries')
      }
      if (this.incomeListFilter === 'open-finance') {
        return this.$t('transactions.empty.open_finance_income')
      }
      if (this.incomeListFilter === 'workspace') {
        return this.$t('transactionVisibility.empty.workspaceIncome')
      }
      if (this.incomeListFilter === 'private') {
        return this.$t('transactionVisibility.empty.privateIncome')
      }
      return this.$t('transactions.empty.income_conflicts')
    },
    expenseEmptyMessage() {
      if (this.expenseListFilter === 'all') {
        return this.$t('expense.no_entries')
      }
      if (this.expenseListFilter === 'open-finance') {
        return this.$t('transactions.empty.open_finance_expense')
      }
      if (this.expenseListFilter === 'workspace') {
        return this.$t('transactionVisibility.empty.workspaceExpense')
      }
      if (this.expenseListFilter === 'private') {
        return this.$t('transactionVisibility.empty.privateExpense')
      }
      if (this.expenseListFilter === 'uncategorized') {
        return this.$t('expense.no_uncategorized_entries')
      }
      return this.$t('transactions.empty.expense_conflicts')
    },
    canSuggestExpenseCategory() {
      return this.canUseAi && Boolean(String(this.expense.description || '').trim()) && parseCurrencyToNumber(this.expense.amount) !== null
    },
    currentWorkspaceId() {
      const userStore = useUserStore()
      return userStore.getCurrentWorkspaceId || userStore.getPreferredWorkspaceId || userStore.getWorkspaces?.[0]?.workspaceId || ''
    },
    canUseConnectedFinance() {
      const capabilities = this.billingSummary?.capabilities
      if (!capabilities) return false
      if (typeof capabilities.connectedFinanceEnabled === 'boolean') return capabilities.connectedFinanceEnabled
      return Boolean(capabilities.advancedToolsEnabled || this.billingSummary?.hasPremiumAccess)
    },
    canUseAi() {
      const capabilities = this.billingSummary?.capabilities
      if (!capabilities) return false
      if (typeof capabilities.aiEnabled === 'boolean') return capabilities.aiEnabled
      return Boolean(this.billingSummary?.hasPremiumAccess)
    },
    // --- summary strip ---
    monthlyIncomeTotal() {
      return this.monthlyIncomes.reduce((sum, t) => sum + (Number(t.amount) || 0), 0)
    },
    monthlyExpenseTotal() {
      return this.monthlyExpenses.reduce((sum, t) => sum + (Number(t.amount) || 0), 0)
    },
    dailyConsumptionRows() {
      const rowsByDate = new Map()
      const source = this.dailyReportExpenses.length ? this.dailyReportExpenses : this.monthlyExpenses

      source.forEach((expense) => {
        const date = this.normalizeDate(expense?.date)
        if (!date) return

        const current = rowsByDate.get(date) || {
          date,
          total: 0,
          count: 0,
          openFinanceCount: 0,
          categories: new Map(),
        }
        const amount = Math.abs(Number(expense?.amount || 0))
        const categoryLabel = this.transactionCategoryLabel(expense)
        current.total += amount
        current.count += 1
        if (this.isOpenFinanceTransaction(expense)) {
          current.openFinanceCount += 1
        }
        current.categories.set(categoryLabel, (current.categories.get(categoryLabel) || 0) + amount)
        rowsByDate.set(date, current)
      })

      return Array.from(rowsByDate.values())
        .map((row) => {
          const [topCategoryLabel] = Array.from(row.categories.entries())
            .sort((left, right) => right[1] - left[1])[0] || [this.$t('expenseItem.uncategorized')]
          return {
            date: row.date,
            total: row.total,
            count: row.count,
            openFinanceCount: row.openFinanceCount,
            topCategoryLabel,
          }
        })
        .sort((left, right) => right.date.localeCompare(left.date))
    },
    dailyConsumptionSummary() {
      const rows = this.dailyConsumptionRows
      const total = rows.reduce((sum, row) => sum + row.total, 0)
      const openFinanceTotal = (this.dailyReportExpenses.length ? this.dailyReportExpenses : this.monthlyExpenses)
        .filter((expense) => this.isOpenFinanceTransaction(expense))
        .reduce((sum, expense) => sum + Math.abs(Number(expense?.amount || 0)), 0)
      return {
        total,
        days: rows.length,
        average: rows.length ? total / rows.length : 0,
        openFinance: openFinanceTotal,
        averageFormatted: this.formatMoney(rows.length ? total / rows.length : 0),
        openFinanceFormatted: this.formatMoney(openFinanceTotal),
      }
    },
    transactionSummaryItems() {
      const locale = this.$i18n?.locale || 'pt-BR'
      const currency = 'BRL'
      const fmt = (v) => Number(v || 0).toLocaleString(locale === 'pt' ? 'pt-BR' : locale, { style: 'currency', currency })
      const net = this.monthlyIncomeTotal - this.monthlyExpenseTotal
      return [
        { label: this.$t('income.title'), value: fmt(this.monthlyIncomeTotal), valueClass: 'cb-summary-item__value--positive' },
        { divider: true },
        { label: this.$t('expense.title'), value: fmt(this.monthlyExpenseTotal), valueClass: 'cb-summary-item__value--negative' },
        { divider: true },
        { label: this.$t('overview.snapshot_net'), value: fmt(net), valueClass: net >= 0 ? 'cb-summary-item__value--positive' : 'cb-summary-item__value--negative' },
      ]
    },
    activeMonthLabel() {
      const month = this.activeTab === 'income' ? this.selectedIncomeMonth : this.selectedExpenseMonth
      const year  = this.activeTab === 'income' ? this.selectedIncomeYear  : this.selectedExpenseYear
      const months = this.localizedMonths
      const found = months.find((m) => m.value === month)
      return found ? `${found.name} ${year}` : `${month}/${year}`
    },
  },
  async mounted() {
    await this.loadBillingCapabilities();
    this.applyBudgetQueryFilters();
    this.fetchCategories();
    this.fetchPaymentMethods();
    this.fetchFinancialAccounts();
    this.fetchOpenFinanceConnections();
    this.fetchShareableUsers();
    this.fetchOpenFinanceConflicts();
    this.fetchMonthlyIncomes();
    this.fetchMonthlyExpenses();
    this.fetchDailyConsumptionExpenses();
  },
  watch: {
    '$i18n.locale'(newLocale) {
      if (newLocale && newLocale !== this.selectedLanguage) {
        this.selectedLanguage = newLocale
        this.fetchCategories()
        this.fetchPaymentMethods()
      }
    },
    '$route.query': {
      handler() {
        if (this.$route?.name !== 'transactions') {
          return
        }
        this.applyBudgetQueryFilters()
        this.resetExpensePaginationAndFetch()
      },
      deep: true,
    },
    selectedExpenseMonth() {
      this.openFinanceCategorizationResult = null
    },
    selectedExpenseYear() {
      this.openFinanceCategorizationResult = null
    },
  },
  methods: {
    // --- drawer helpers ---
    openFormDrawer(mode) {
      this.closeTransactionDetails()
      this.formMode = mode || 'expense'
      this.showFormDrawer = true
    },
    closeFormDrawer() {
      this.showFormDrawer = false
    },
    openTransactionDetails(type, transaction) {
      if (!transaction) return
      this.showFormDrawer = false
      this.transactionAgreementVisibilityOpen = false
      this.transactionDetailsPanel = {
        show: true,
        type,
        transaction,
      }
    },
    closeTransactionDetails() {
      this.transactionDetailsPanel.show = false
    },
    editSelectedTransaction() {
      const transaction = this.selectedTransactionDetails
      const type = this.transactionDetailsPanel.type
      if (!transaction) return
      this.closeTransactionDetails()
      if (type === 'income') {
        this.startEditingIncome(transaction)
      } else {
        this.startEditingExpense(transaction)
      }
    },
    openSelectedTransactionComments() {
      const transaction = this.selectedTransactionDetails
      if (!transaction) return
      this.openTransactionComments(transaction)
    },
    canShowTransactionComments(transaction) {
      return transaction?.visibilityScope === 'WORKSPACE'
    },
    transactionCommentsStatusLabel(transaction) {
      if (!this.canShowTransactionComments(transaction)) {
        return this.$t('transactions.details.comments_unavailable')
      }
      return this.$t('transactions.details.comments_available')
    },
    hasTransactionCollaboration(transaction) {
      return this.canShowTransactionComments(transaction)
        || this.canShowTransactionAgreements(transaction)
        || this.canShowTransactionAttachments(transaction)
        || this.canShowTransactionReminder(transaction)
    },
    canShowTransactionAttachments(transaction) {
      return this.transactionDetailsPanel.type === 'expense' && Boolean(transaction?.id)
    },
    canShowTransactionReminder(transaction) {
      return this.transactionDetailsPanel.type === 'expense' && Boolean(transaction?.id)
    },
    emptyAttachmentState() {
      return {
        status: 'notLoaded',
        attachments: [],
        error: null,
      }
    },
    attachmentStateFor(transaction) {
      if (!transaction?.id) return this.emptyAttachmentState()
      return this.attachmentStateByTransactionId[transaction.id] || this.emptyAttachmentState()
    },
    setAttachmentState(transactionId, patch) {
      if (!transactionId) return
      const previous = this.attachmentStateByTransactionId[transactionId] || this.emptyAttachmentState()
      this.attachmentStateByTransactionId = {
        ...this.attachmentStateByTransactionId,
        [transactionId]: {
          ...previous,
          ...patch,
        },
      }
    },
    emptyReminderState() {
      return {
        status: 'notLoaded',
        reminder: null,
        error: null,
      }
    },
    reminderStateFor(transaction) {
      if (!transaction?.id) return this.emptyReminderState()
      return this.reminderStateByTransactionId[transaction.id] || this.emptyReminderState()
    },
    setReminderState(transactionId, patch) {
      if (!transactionId) return
      const previous = this.reminderStateByTransactionId[transactionId] || this.emptyReminderState()
      this.reminderStateByTransactionId = {
        ...this.reminderStateByTransactionId,
        [transactionId]: {
          ...previous,
          ...patch,
        },
      }
    },
    transactionAttachmentStatus(transaction) {
      return this.attachmentStateFor(transaction).status
    },
    transactionAttachments(transaction) {
      return this.attachmentStateFor(transaction).attachments
    },
    transactionAttachmentStatusLabel(transaction) {
      const state = this.attachmentStateFor(transaction)
      if (state.status === 'loading') return this.$t('transactions.details.attachments_loading')
      if (state.status === 'error') return this.$t('transactions.details.attachments_error')
      if (state.status === 'notLoaded') return this.$t('transactions.details.attachments_not_loaded')
      const count = state.attachments.length
      if (!count) return this.$t('transactions.details.no_attachments')
      return this.$t('transactions.details.attachments_count', { count })
    },
    transactionAttachmentActionLabel(transaction) {
      const state = this.attachmentStateFor(transaction)
      if (state.status === 'error') return this.$t('transactions.details.retry')
      if (state.status === 'notLoaded') return this.$t('transactions.details.view_attachments')
      if (state.status === 'loaded' && !state.attachments.length) return this.$t('transactions.details.add')
      return this.$t('transactions.details.view')
    },
    handleTransactionAttachmentAction(transaction) {
      this.openTransactionAttachments(transaction)
    },
    transactionReminderStatus(transaction) {
      return this.reminderStateFor(transaction).status
    },
    transactionReminderStatusLabel(transaction) {
      const state = this.reminderStateFor(transaction)
      if (state.status === 'loading') return this.$t('transactions.details.reminder_loading')
      if (state.status === 'error') return this.$t('transactions.details.reminder_error')
      if (state.status === 'notLoaded') return this.$t('transactions.details.reminder_not_loaded')
      if (state.status === 'empty') return this.$t('transactions.details.no_reminder')
      if (state.status === 'loaded' && state.reminder?.alertDate) {
        return this.$t('transactions.details.reminder_configured', {
          date: this.formatDetailsDateTime(state.reminder.alertDate),
        })
      }
      return this.$t('transactions.details.no_reminder')
    },
    transactionReminderActionLabel(transaction) {
      const state = this.reminderStateFor(transaction)
      if (state.status === 'error') return this.$t('transactions.details.retry')
      if (state.status === 'empty') return this.$t('transactions.details.create')
      if (state.status === 'loaded') return this.$t('transactions.details.edit')
      return this.$t('transactions.details.view')
    },
    handleTransactionReminderAction(transaction) {
      const state = this.reminderStateFor(transaction)
      if (state.status === 'error') {
        this.loadTransactionReminder(transaction.id).catch(() => {})
        return
      }
      this.openTransactionReminder(transaction)
    },
    canShowTransactionAgreements(transaction) {
      return this.transactionDetailsPanel.type === 'expense' && Boolean(transaction?.id)
    },
    transactionAgreements(transaction) {
      return Array.isArray(transaction?.sharedAgreements) ? transaction.sharedAgreements : []
    },
    activeTransactionAgreements(transaction) {
      return this.transactionAgreements(transaction).filter((agreement) => !['CANCELLED', 'DECLINED'].includes(String(agreement?.status || '').toUpperCase()))
    },
    transactionAgreementTitle(transaction) {
      const count = this.activeTransactionAgreements(transaction).length
      return count > 1 ? this.$t('transactions.details.agreements') : this.$t('transactions.details.agreement')
    },
    transactionAgreementParticipantCount(agreement) {
      const participants = Array.isArray(agreement?.participants) ? agreement.participants : []
      if (participants.length) {
        const uniqueKeys = new Set(participants.map((participant) => (
          participant?.id || participant?.userId || participant?.email || participant?.displayName
        )).filter(Boolean))
        return uniqueKeys.size || participants.length
      }
      return agreement?.counterpartyEmail ? 1 : 0
    },
    transactionAgreementStatusLabel(transaction) {
      const agreements = this.activeTransactionAgreements(transaction)
      if (!agreements.length) {
        return this.$t('transactions.details.no_agreement')
      }
      if (agreements.length > 1) {
        return this.$t('transactions.details.agreements_active', { count: agreements.length })
      }
      const participants = this.transactionAgreementParticipantCount(agreements[0])
      if (participants > 0) {
        return this.$t('transactions.details.agreement_with_participants', { count: participants })
      }
      return this.$t('transactions.details.agreement_defined')
    },
    transactionAgreementActionLabel(transaction) {
      const agreements = this.activeTransactionAgreements(transaction)
      if (!agreements.length) return this.$t('transactions.details.create')
      if (agreements.length > 1) return this.$t('transactions.details.view')
      return this.$t('transactions.details.open')
    },
    handleTransactionAgreementAction(transaction) {
      const agreements = this.activeTransactionAgreements(transaction)
      if (agreements.length > 1) {
        this.transactionAgreementVisibilityOpen = !this.transactionAgreementVisibilityOpen
        return
      }
      this.openSelectedTransactionAgreementDialog(transaction, agreements[0] || null)
    },
    openSelectedTransactionAgreementDialog(transaction, agreement = null) {
      if (!transaction?.id) return
      this.transactionAgreementDialog = {
        show: true,
        expense: transaction,
        agreement,
      }
    },
    openTransactionAttachments(expense) {
      if (!expense?.id) return
      const currentExpense = this.findMonthlyExpenseById(expense.id) || expense
      this.transactionAttachmentsDialog = {
        show: true,
        expense: currentExpense,
      }
      this.loadTransactionAttachments(expense.id).catch(() => {})
    },
    openTransactionReminder(expense) {
      if (!expense?.id) return
      const currentExpense = this.findMonthlyExpenseById(expense.id) || expense
      const currentState = this.reminderStateFor(currentExpense)
      this.transactionReminderDialog = {
        show: true,
        expense: currentExpense,
        saving: false,
        deleting: false,
      }
      if (currentState.status === 'notLoaded') {
        this.loadTransactionReminder(expense.id).catch(() => {})
      }
    },
    reloadActiveTransactionReminder() {
      const expenseId = this.transactionReminderDialog.expense?.id
      if (!expenseId) return
      this.loadTransactionReminder(expenseId).catch(() => {})
    },
    loadTransactionReminder(expenseId) {
      if (!expenseId) return Promise.resolve()
      this.setReminderState(expenseId, { status: 'loading', error: null })
      return NotificationService.getTransactionReminder(expenseId)
        .then((response) => {
          if (response?.status === 204 || !response?.data) {
            this.setReminderState(expenseId, { status: 'empty', reminder: null, error: null })
            return
          }
          this.setReminderState(expenseId, { status: 'loaded', reminder: response.data, error: null })
        })
        .catch((error) => {
          console.error('Erro ao carregar lembrete:', error)
          this.setReminderState(expenseId, {
            status: 'error',
            reminder: null,
            error: this.$t('transactionReminder.load_error'),
          })
          throw error
        })
    },
    saveTransactionReminder(payload) {
      const transactionId = payload?.transactionId || this.transactionReminderDialog.expense?.id
      if (!transactionId) return
      this.transactionReminderDialog.saving = true
      NotificationService.upsertTransactionReminder(transactionId, {
        alertDate: payload.alertDate,
        methods: payload.methods,
      })
        .then((response) => {
          this.setReminderState(transactionId, {
            status: 'loaded',
            reminder: response.data,
            error: null,
          })
          this.transactionReminderDialog.show = false
          this.showToast(this.$t('transactionReminder.save_success'), 'success')
        })
        .catch((error) => {
          console.error('Erro ao salvar lembrete:', error)
          this.setReminderState(transactionId, {
            status: 'error',
            reminder: this.reminderStateByTransactionId[transactionId]?.reminder || null,
            error: this.$t('transactionReminder.save_error'),
          })
          this.showToast(this.$t('transactionReminder.save_error'), 'error')
        })
        .finally(() => {
          this.transactionReminderDialog.saving = false
        })
    },
    deleteTransactionReminder() {
      const transactionId = this.transactionReminderDialog.expense?.id
      if (!transactionId) return
      this.transactionReminderDialog.deleting = true
      NotificationService.deleteTransactionReminder(transactionId)
        .then(() => {
          this.setReminderState(transactionId, { status: 'empty', reminder: null, error: null })
          this.transactionReminderDialog.show = false
          this.showToast(this.$t('transactionReminder.remove_success'), 'success')
        })
        .catch((error) => {
          console.error('Erro ao remover lembrete:', error)
          this.showToast(this.$t('transactionReminder.remove_error'), 'error')
        })
        .finally(() => {
          this.transactionReminderDialog.deleting = false
        })
    },
    reloadActiveTransactionAttachments() {
      const expenseId = this.transactionAttachmentsDialog.expense?.id
      if (!expenseId) return
      this.loadTransactionAttachments(expenseId).catch(() => {})
    },
    loadTransactionAttachments(expenseId) {
      if (!expenseId) return Promise.resolve()
      this.setAttachmentState(expenseId, { status: 'loading', error: null })
      return ExpenseService.listAttachments(expenseId)
        .then((response) => {
          const attachments = Array.isArray(response?.data) ? response.data : []
          this.setAttachmentState(expenseId, {
            status: 'loaded',
            attachments,
            error: null,
          })
          this.applyExpenseAttachments(expenseId, attachments)
        })
        .catch((error) => {
          console.error('Erro ao carregar anexos:', error)
          this.setAttachmentState(expenseId, {
            status: 'error',
            error,
          })
          this.showToast(this.$t('transactionAttachments.load_error'), 'error')
          throw error
        })
    },
    transactionTypeLabel(type) {
      return type === 'income'
        ? this.$t('transactions.details.transaction_type_income')
        : this.$t('transactions.details.transaction_type_expense')
    },
    transactionCategoryObject(transaction) {
      const category = transaction?.category
      if (category && typeof category === 'object') {
        return category
      }

      const categoryId = transaction?.categoryId ?? category
      if (categoryId !== null && categoryId !== undefined && categoryId !== '') {
        const matched = this.categories.find((item) => String(item.id) === String(categoryId))
        if (matched) return matched
      }

      if (transaction?.categoryName || transaction?.categoryCode) {
        return {
          name: transaction.categoryName,
          code: transaction.categoryCode,
          displayIcon: transaction.categoryDisplayIcon,
          displayColor: transaction.categoryDisplayColor,
        }
      }

      return null
    },
    transactionCategoryLabel(transaction) {
      const category = this.transactionCategoryObject(transaction)
      return category ? this.translateCategoryLabel(category) : this.$t('expenseItem.uncategorized')
    },
    transactionCategoryIcon(transaction) {
      const category = this.transactionCategoryObject(transaction)
      if (!category) return ''
      return category.displayIcon || this.categoryIcons?.[category.code] || 'mdi-shape-outline'
    },
    transactionCategoryColor(transaction) {
      const category = this.transactionCategoryObject(transaction)
      return category?.displayColor || 'var(--cb-primary)'
    },
    transactionPaymentMethodLabel(transaction) {
      if (transaction?.paymentMethodName) {
        return transaction.paymentMethodName
      }
      const paymentMethod = transaction?.paymentMethod
      if (paymentMethod && typeof paymentMethod === 'object') {
        return paymentMethod.name || this.$t('transactions.details.not_informed')
      }
      if (paymentMethod && typeof paymentMethod === 'string' && Number.isNaN(Number(paymentMethod))) {
        return paymentMethod
      }
      if (this.isOpenFinanceTransaction(transaction)) {
        return this.openFinancePaymentMethodLabel(transaction)
      }
      return this.$t('transactions.details.not_informed')
    },
    transactionVisibilityLabel(transaction) {
      return transaction?.visibilityScope === 'PRIVATE'
        ? this.$t('transactionVisibility.private')
        : this.$t('transactionVisibility.workspace')
    },
    transactionPlanningLabel(transaction) {
      if (transaction?.excludedFromPlanning) {
        return this.$t('transactions.details.planning_excluded')
      }
      if (transaction?.openFinanceSharingTone === 'planning-only') {
        return this.$t('transactions.details.planning_only')
      }
      return this.$t('transactions.details.planning_included')
    },
    transactionOriginLabel(transaction) {
      if (this.isOpenFinanceTransaction(transaction)) {
        return this.$t('transactions.details.open_finance_source')
      }
      const source = this.normalizedTransactionSource(transaction)
      if (source === 'MANUAL') {
        return this.$t('transactions.details.manual_source')
      }
      return this.$t('transactions.details.origin_not_registered')
    },
    transactionDocumentTypeLabel(transaction) {
      const documentType = String(transaction?.openFinanceDocumentType || '').toUpperCase()
      if (documentType === 'CNPJ') return this.$t('transactions.details.document_business')
      if (documentType === 'CPF') return this.$t('transactions.details.document_personal')
      return this.$t('transactions.details.not_informed')
    },
    categorizationSourceLabel(source) {
      const normalized = String(source || 'UNKNOWN').toUpperCase()
      const key = `transactions.details.categorization_sources.${normalized}`
      const translated = this.$t(key)
      return translated !== key ? translated : this.$t('transactions.details.categorization_sources.UNKNOWN')
    },
    shouldShowCategorizationReason(reason) {
      const value = String(reason || '').trim()
      if (!value) return false
      const normalized = value.toLowerCase()
      const technicalPatterns = [
        /^[A-Z0-9_:-]+$/,
        /exception|stacktrace|localhost|connection refused|processingexception/i,
        /ai_service|fallback|provider|protocol|rawstatus/i,
        /^\{.*\}$/,
      ]
      return !technicalPatterns.some((pattern) => pattern.test(value) || pattern.test(normalized))
    },
    normalizedTransactionSource(transaction) {
      return String(transaction?.source || '').trim().toUpperCase()
    },
    isOpenFinanceTransaction(transaction) {
      const source = this.normalizedTransactionSource(transaction)
      return source === 'OPEN_FINANCE' || Boolean(transaction?.openFinance)
    },
    transactionCurrency(transaction) {
      if (transaction?.currency) return transaction.currency
      const account = this.financialAccounts.find((item) => item.id === transaction?.accountId)
      return account?.currency || 'BRL'
    },
    getDetailsLocaleCode() {
      const uiLocale = this.$i18n?.locale || 'pt'
      const localeMap = {
        pt: 'pt-BR',
        en: 'en-US',
        es: 'es-ES',
        fr: 'fr-FR',
      }
      return localeMap[uiLocale] || 'pt-BR'
    },
    formatTransactionAmount(transaction) {
      const rawAmount = transaction?.amount
      if (typeof rawAmount === 'string' && rawAmount.trim() && Number.isNaN(Number(rawAmount))) {
        return rawAmount
      }
      const amount = Number(rawAmount)
      if (!Number.isFinite(amount)) {
        return this.$t('transactions.details.not_informed')
      }
      return new Intl.NumberFormat(this.getDetailsLocaleCode(), {
        style: 'currency',
        currency: this.transactionCurrency(transaction),
      }).format(Math.abs(amount))
    },
    formatMoney(amount, currency = 'BRL') {
      const numericAmount = Number(amount || 0)
      return new Intl.NumberFormat(this.getDetailsLocaleCode(), {
        style: 'currency',
        currency,
      }).format(Math.abs(numericAmount))
    },
    formatDailyReportDate(value) {
      const date = this.parseDetailsDate(value)
      if (!date) return value || ''
      return new Intl.DateTimeFormat(this.getDetailsLocaleCode(), {
        day: '2-digit',
        month: 'short',
        weekday: 'short',
      }).format(date)
    },
    transactionReconciliationLabel(transaction) {
      const status = transaction?.reconciliationStatus
      if (!status) return this.$t('transactions.details.not_informed')
      const base = this.transactionDetailsPanel.type === 'income' ? 'incomeItem' : 'expenseItem'
      const key = `${base}.reconciliation.${status}`
      const translated = this.$t(key)
      return translated !== key ? translated : this.$t('transactions.details.status_review_needed')
    },
    parseDetailsDate(value) {
      if (!value) return null
      if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const date = new Date(`${value}T00:00:00`)
        return Number.isNaN(date.getTime()) ? null : date
      }
      const date = new Date(value)
      return Number.isNaN(date.getTime()) ? null : date
    },
    formatDetailsDate(value) {
      const date = this.parseDetailsDate(value)
      if (!date) return value || this.$t('transactions.details.not_informed')
      return new Intl.DateTimeFormat(this.getDetailsLocaleCode(), {
        dateStyle: 'medium',
      }).format(date)
    },
    formatDetailsDateTime(value) {
      if (!value) return this.$t('transactions.details.not_informed')
      const date = this.parseDetailsDate(value)
      if (!date) return value
      return new Intl.DateTimeFormat(this.getDetailsLocaleCode(), {
        dateStyle: 'short',
        timeStyle: 'short',
      }).format(date)
    },
    // --- month navigation ---
    goToPrevMonth() {
      if (this.activeTab === 'income') {
        if (this.selectedIncomeMonth === 1) { this.selectedIncomeMonth = 12; this.selectedIncomeYear -= 1 }
        else { this.selectedIncomeMonth -= 1 }
        this.resetIncomePaginationAndFetch()
      } else {
        if (this.selectedExpenseMonth === 1) { this.selectedExpenseMonth = 12; this.selectedExpenseYear -= 1 }
        else { this.selectedExpenseMonth -= 1 }
        this.resetExpensePaginationAndFetch()
      }
    },
    goToNextMonth() {
      if (this.activeTab === 'income') {
        if (this.selectedIncomeMonth === 12) { this.selectedIncomeMonth = 1; this.selectedIncomeYear += 1 }
        else { this.selectedIncomeMonth += 1 }
        this.resetIncomePaginationAndFetch()
      } else {
        if (this.selectedExpenseMonth === 12) { this.selectedExpenseMonth = 1; this.selectedExpenseYear += 1 }
        else { this.selectedExpenseMonth += 1 }
        this.resetExpensePaginationAndFetch()
      }
    },
    applyTransactionFilter(items, filter) {
      if (!Array.isArray(items)) {
        return []
      }
      if (filter === 'open-finance') {
        return items.filter((item) => Boolean(item?.openFinance))
      }
      if (filter === 'workspace') {
        return items.filter((item) => (item?.visibilityScope || 'WORKSPACE') === 'WORKSPACE')
      }
      if (filter === 'private') {
        return items.filter((item) => item?.visibilityScope === 'PRIVATE')
      }
      if (filter === 'conflicts') {
        return items.filter((item) => item?.reconciliationStatus === 'CONFLICT_DUPLICATE')
      }
      if (filter === 'uncategorized') {
        return items.filter((item) => !item?.category)
      }
      return items
    },
    applyExpenseDrillDown(items) {
      if (!Array.isArray(items)) {
        return []
      }

      return items.filter((item) => {
        const category = item?.category
        const categoryCandidates = [item?.categoryId, category?.id, category?.code, category?.name]
          .filter((value) => value !== null && value !== undefined)
          .map(String)
        const matchesCategory = this.routeExpenseUncategorized
          ? !category && !item?.categoryId
          : this.routeExpenseCategory
            ? categoryCandidates.includes(String(this.routeExpenseCategory))
            : true
        const matchesAccount = this.routeExpenseAccountId
          ? item?.accountId === this.routeExpenseAccountId
          : true
        return matchesCategory && matchesAccount
      })
    },
    applyBudgetQueryFilters() {
      const query = this.$route?.query || {}
      const month = Number(query.month)
      const year = Number(query.year)
      const normalizedVisibility = typeof query.visibility === 'string'
        ? String(query.visibility).trim().toLowerCase()
        : null

      if (Number.isInteger(month) && month >= 1 && month <= 12) {
        this.selectedExpenseMonth = month
      }

      if (Number.isInteger(year) && year >= 2000 && year <= 2100) {
        this.selectedExpenseYear = year
      }

      this.routeExpenseAccountId = typeof query.accountId === 'string' ? query.accountId : null
      this.routeExpenseCategory = typeof query.category === 'string' ? query.category : null
      const categoryId = Number(query.categoryId)
      this.routeExpenseCategoryId = Number.isInteger(categoryId) && categoryId > 0 ? categoryId : null
      this.routeExpenseUncategorized = query.uncategorized === '1'
      if (query.openFinance === '1') {
        this.incomeListFilter = 'open-finance'
        this.expenseListFilter = 'open-finance'
        return
      }

      if (normalizedVisibility === 'workspace') {
        this.incomeListFilter = 'workspace'
        this.expenseListFilter = 'workspace'
        return
      }

      if (normalizedVisibility === 'private') {
        this.incomeListFilter = 'private'
        this.expenseListFilter = 'private'
        return
      }

      this.incomeListFilter = 'all'
      this.expenseListFilter = 'all'
    },
    clearExpenseDrillDown() {
      this.$router.replace({
        name: 'transactions',
        query: {
          month: String(this.selectedExpenseMonth),
          year: String(this.selectedExpenseYear),
        },
      })
    },
    transactionVisibilityHint(scope) {
      if (scope === 'PRIVATE') {
        return this.$t('transactionVisibility.hintPrivate')
      }
      return this.$t('transactionVisibility.hintWorkspace')
    },
    enrichExpenseWithConflict(expense) {
      const conflict = this.openFinanceConflictMap[expense?.id]
      return this.decorateTransactionOpenFinanceContext({
        ...expense,
        reconciliationConflictId: conflict?.id ?? null,
        reconciliationConflictReason: expense?.reconciliationConflictReason || conflict?.conflictReason || null,
      })
    },
    enrichIncomeWithConflict(income) {
      const conflict = this.openFinanceConflictMap[income?.id]
      return this.decorateTransactionOpenFinanceContext({
        ...income,
        reconciliationConflictId: conflict?.id ?? null,
        reconciliationConflictReason: income?.reconciliationConflictReason || conflict?.conflictReason || null,
      })
    },
    isOwnerOrAdminRole() {
      const userStore = useUserStore()
      const role = String(userStore.getCurrentRole || '').toUpperCase()
      return role === 'ROLE_OWNER' || role === 'ROLE_ADMIN'
    },
    accountMatchesOpenFinanceConnection(account, connection) {
      if (!account || !connection) {
        return false
      }

      const bankCode = String(account.bankCode || '').trim()
      if (bankCode && connection.bankCode && bankCode === connection.bankCode) return true

      const institutionKey = String(account.institutionKey || '').trim()
      if (institutionKey && connection.institutionKey && institutionKey === connection.institutionKey) return true

      const institutionName = String(account.institutionName || '').trim()
      if (institutionName && connection.institutionName && institutionName === connection.institutionName) return true

      const accountName = String(account.name || account.displayName || '')
      const displayName = String(connection.displayName || '').trim()
      if (displayName && accountName === displayName) return true

      const connectionName = String(connection.institutionName || '').trim()
      return Boolean(connectionName && accountName.startsWith(`${connectionName} - `))
    },
    findOpenFinanceConnectionForTransaction(transaction) {
      if (!transaction?.openFinance) {
        return null
      }

      const account = this.financialAccounts.find((item) => item.id === transaction.accountId)
      if (account) {
        const matched = this.openFinanceConnections.find((connection) =>
          this.accountMatchesOpenFinanceConnection(account, connection)
        )
        if (matched) return matched
      }

      const accountName = String(transaction.accountName || '').trim()
      if (accountName) {
        const matchedByName = this.openFinanceConnections.find((connection) => {
          const displayName = String(connection.displayName || '').trim()
          const institutionName = String(connection.institutionName || '').trim()
          return (displayName && displayName === accountName)
            || (institutionName && accountName.startsWith(`${institutionName} - `))
        })
        if (matchedByName) return matchedByName
      }

      return null
    },
    decorateTransactionOpenFinanceContext(transaction) {
      if (!transaction?.openFinance) {
        return transaction
      }

      const connection = this.findOpenFinanceConnectionForTransaction(transaction)
      if (!connection) {
        return {
          ...transaction,
          openFinanceDocumentType: null,
          openFinanceSharingLabel: this.$t('transactions.open_finance_shared_label'),
          openFinanceSharingTone: 'default',
          openFinanceSharingNote: this.$t('transactions.open_finance_shared_note'),
        }
      }

      if (connection.payerDocumentType === 'CNPJ') {
        return {
          ...transaction,
          openFinanceDocumentType: 'CNPJ',
          openFinanceSharingLabel: this.$t('transactions.open_finance_business_shared_label'),
          openFinanceSharingTone: 'shared',
          openFinanceSharingNote: this.$t('transactions.open_finance_business_shared_note'),
        }
      }

      const level = connection.planningSharingLevel || connection.sharingPolicy
      if (level === 'PERSONAL_SHARED') {
        return {
          ...transaction,
          openFinanceDocumentType: 'CPF',
          openFinanceSharingLabel: this.$t('transactions.open_finance_personal_admin_label'),
          openFinanceSharingTone: 'admin-shared',
          openFinanceSharingNote: this.isOwnerOrAdminRole()
            ? this.$t('transactions.open_finance_personal_admin_note')
            : this.$t('transactions.open_finance_personal_admin_restricted_note'),
        }
      }

      if (level === 'PLANNING_IMPACT_ONLY') {
        return {
          ...transaction,
          openFinanceDocumentType: 'CPF',
          openFinanceSharingLabel: this.$t('transactions.open_finance_planning_only_label'),
          openFinanceSharingTone: 'planning-only',
          openFinanceSharingNote: this.$t('transactions.open_finance_planning_only_note'),
        }
      }

      return {
        ...transaction,
        openFinanceDocumentType: 'CPF',
        openFinanceSharingLabel: this.$t('transactions.open_finance_private_label'),
        openFinanceSharingTone: 'private',
        openFinanceSharingNote: this.$t('transactions.open_finance_private_note'),
      }
    },
    applyOpenFinanceContextToCollections() {
      this.monthlyIncomes = this.monthlyIncomes.map((income) => this.decorateTransactionOpenFinanceContext(income))
      this.monthlyExpenses = this.monthlyExpenses.map((expense) => this.decorateTransactionOpenFinanceContext(expense))
    },
    normalizeCollection(payload) {
      if (Array.isArray(payload)) return payload
      if (!payload || typeof payload !== 'object') return []

      const candidates = [payload.data, payload.items, payload.content, payload.results, payload.list]
      for (const candidate of candidates) {
        if (Array.isArray(candidate)) return candidate
      }

      return [payload]
    },
    normalizeDate(value) {
      if (!value) {
        return null
      }

      if (value instanceof Date) {
        return value.toISOString().split('T')[0]
      }

      if (typeof value === 'string') {
        const trimmed = value.trim()
        if (!trimmed) {
          return null
        }

        if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
          return trimmed
        }

        const parsed = new Date(trimmed)
        if (!Number.isNaN(parsed.getTime())) {
          return parsed.toISOString().split('T')[0]
        }

        return null
      }

      return null
    },
    buildIncomePayload({ normalizedDate, paymentMethodId, amount }) {
      const { description, isRecurring, accountId, visibilityScope } = this.income
      return {
        date: normalizedDate,
        amount,
        description,
        paymentMethod: paymentMethodId,
        paymentMethodName: this.income.paymentMethodName ?? null,
        isRecurring,
        accountId,
        visibilityScope,
      }
    },
    buildExpensePayload({ normalizedDate, categoryId, paymentMethodId, amount }) {
      const {
        description,
        selectedUsers = [],
        accountId,
        visibilityScope,
      } = this.expense

      const sanitizedSelectedUsers = Array.isArray(selectedUsers) ? [...selectedUsers] : []
      const categorizationMetadata = this.categorizationMetadataForCategory(categoryId)

      return {
        date: normalizedDate,
        amount,
        description,
        category: categoryId,
        paymentMethod: paymentMethodId,
        paymentMethodName: this.expense.paymentMethodName ?? null,
        ...categorizationMetadata,
        selectedUsers: sanitizedSelectedUsers,
        accountId,
        visibilityScope,
      }
    },
    expenseCategorySuggestionSourceLabel(source) {
      if (source === 'BANK_MAPPING') return this.$t('expense.ai_source_bank_mapping')
      if (source === 'HISTORY') return this.$t('expense.ai_source_history')
      if (source === 'DOMAIN_ALIAS') return this.$t('expense.ai_source_domain_alias')
      if (source === 'AI_FALLBACK') return this.$t('expense.ai_source_fallback')
      return this.$t('expense.ai_source_generic')
    },
    translateCategoryLabel(category) {
      if (!category) {
        return ''
      }

      const categoryCode = String(category.code || '').trim()
      if (!categoryCode) {
        return category.name || ''
      }

      const translationKey = `categories.${categoryCode}`
      const translated = this.$t(translationKey)
      return translated !== translationKey ? translated : (category.name || categoryCode)
    },
    resolveCategoryIcon(category) {
      return category?.displayIcon || this.categoryIcons?.[category?.code] || 'mdi-shape-outline'
    },
    resolveCategoryColor(category) {
      return category?.displayColor || 'var(--cb-primary)'
    },
    shouldShowOpenFinancePaymentFallback(transaction) {
      return Boolean(transaction?.openFinance && !transaction?.paymentMethod)
    },
    openFinancePaymentMethodLabel(transaction) {
      return transaction?.paymentMethodName || this.$t('transactions.payment_method_not_informed_open_finance')
    },
    categorizationMetadataForCategory(categoryId) {
      const suggestion = this.resolveActiveExpenseSuggestion()
      if (!suggestion?.suggestedCategory?.id || Number(suggestion.suggestedCategory.id) !== Number(categoryId)) {
        return {}
      }
      return this.categorizationMetadataFromSuggestion(suggestion)
    },
    categorizationMetadataFromSuggestion(suggestion) {
      const source = this.normalizeAcceptedCategorizationSource(suggestion?.source)
      if (!source) {
        return {}
      }
      return {
        categorizationSource: source,
        categorizationReason: suggestion?.reasoning || null,
        categorizationRuleId: null,
      }
    },
    normalizeAcceptedCategorizationSource(source) {
      const normalized = String(source || '').trim().toUpperCase()
      if (normalized === 'HISTORY' || normalized === 'DOMAIN_ALIAS') {
        return normalized
      }
      if (normalized === 'AI' || normalized === 'AI_FALLBACK') {
        return 'AI'
      }
      return null
    },
    getExpenseSuggestionDetails(expense) {
      const suggestion = this.getStoredExpenseSuggestion(expense?.id)
      const suggestedCategory = suggestion?.suggestedCategory
      if (!suggestedCategory?.id) {
        return null
      }

      const category = this.categories.find((item) => item.id === suggestedCategory.id)
        || this.categories.find((item) => item.code && item.code === suggestedCategory.code)
        || suggestedCategory
      const confidence = Number(suggestedCategory.confidence || 0)
      return {
        categoryName: this.translateCategoryLabel(category),
        categoryIcon: this.resolveCategoryIcon(category),
        categoryColor: this.resolveCategoryColor(category),
        sourceLabel: this.expenseCategorySuggestionSourceLabel(suggestion.source),
        confidenceLabel: Number.isFinite(confidence) && confidence > 0
          ? this.$t('expense.ai_confidence_short', { value: Math.round(confidence * 100) })
          : null,
        reasoningLabel: this.expenseCategoryReasoningLabel(suggestion),
      }
    },
    expenseCategoryReasoningLabel(suggestion) {
      const source = String(suggestion?.source || '').trim()
      const reasoning = String(suggestion?.reasoning || '').trim().toLowerCase()

      if (source === 'BANK_MAPPING') return this.$t('expense.ai_reason_bank_mapping')
      if (reasoning.includes('recent categorized expenses')) return this.$t('expense.ai_reason_recent_history')
      if (reasoning.includes('confirmed manually')) return this.$t('expense.ai_reason_manual_feedback')
      if (reasoning.includes('repeated categorized expenses')) return this.$t('expense.ai_reason_repeated_history')
      if (reasoning.includes('exact description')) return this.$t('expense.ai_reason_exact_match')
      if (reasoning.includes('similar description')) return this.$t('expense.ai_reason_similar_match')
      if (reasoning.includes('recurring terms')) return this.$t('expense.ai_reason_recurring_terms')
      if (source === 'DOMAIN_ALIAS') return this.$t('expense.ai_reason_domain_alias')
      return reasoning ? this.$t('expense.ai_reason_history_generic') : ''
    },
    isWeakCategorySuggestion(suggestion) {
      const confidence = Number(suggestion?.suggestedCategory?.confidence || 0)
      const reasoning = String(suggestion?.reasoning || '').trim().toLowerCase()
      const source = suggestion?.source
      return source === 'AI_FALLBACK' && (confidence <= 0.5 || reasoning === 'model-error')
    },
    getStoredExpenseSuggestion(expenseId) {
      if (!expenseId) {
        return null
      }
      return this.batchExpenseCategorySuggestions?.[expenseId] ?? null
    },
    clearStoredExpenseSuggestion(expenseId) {
      if (!expenseId || !this.batchExpenseCategorySuggestions?.[expenseId]) {
        return
      }
      const nextSuggestions = { ...this.batchExpenseCategorySuggestions }
      delete nextSuggestions[expenseId]
      this.batchExpenseCategorySuggestions = nextSuggestions
    },
    resolveActiveExpenseSuggestion() {
      if (this.expenseCategorySuggestion?.suggestedCategory?.id) {
        return this.expenseCategorySuggestion
      }
      if (this.editingExpenseId) {
        return this.getStoredExpenseSuggestion(this.editingExpenseId)
      }
      return null
    },
    handleExpenseSuggestionFeedback(savedCategoryId) {
      const suggestion = this.resolveActiveExpenseSuggestion()
      const expenseId = this.editingExpenseId
      if (!suggestion?.suggestedCategory?.id || !expenseId) {
        return null
      }

      const suggestedCategoryId = Number(suggestion.suggestedCategory.id)
      this.clearStoredExpenseSuggestion(expenseId)
      return savedCategoryId === suggestedCategoryId
        ? this.$t('expense.ai_feedback_accepted')
        : this.$t('expense.ai_feedback_adjusted')
    },
    isAiServiceUnavailableResponse(data) {
      return data?.reason === 'AI_SERVICE_UNAVAILABLE'
    },
    isAiServiceUnavailableError(error) {
      return error?.response?.status === 503 || error?.response?.data?.reason === 'AI_SERVICE_UNAVAILABLE'
    },
    showAiServiceUnavailableToast() {
      this.showToast(this.$t('expense.ai_service_unavailable'), 'warning')
    },
    suggestExpenseCategory() {
      if (!this.canUseAi) {
        this.showToast(this.$t('expense.ai_premium_locked'), 'info')
        this.$router.push({ name: 'choose-plan', query: { feature: 'ai' } })
        return
      }
      const parsedAmount = parseCurrencyToNumber(this.expense.amount)
      const description = String(this.expense.description || '').trim()
      if (!description || parsedAmount === null) {
        this.showToast(this.$t('expense.ai_missing_context'), 'warning')
        return
      }

      this.isSuggestingExpenseCategory = true
      this.expenseCategorySuggestion = null

      AiService.autoCategorize({
        expenses: [
          {
            expenseId: this.isEditingExpense && this.editingExpenseId ? this.editingExpenseId : undefined,
            description,
            amount: parsedAmount,
            paymentMethodId: this.resolvePaymentMethodId(this.expense.paymentMethod) ?? undefined,
            bankCategoryId: this.expense.openFinanceBankCategoryId ?? undefined,
          }
        ]
      })
        .then(({ data }) => {
          const suggestion = Array.isArray(data?.suggestions) ? data.suggestions[0] : null
          if (!suggestion?.suggestedCategory || this.isWeakCategorySuggestion(suggestion)) {
            if (this.isAiServiceUnavailableResponse(data)) {
              this.showAiServiceUnavailableToast()
              return
            }
            this.showToast(this.$t('expense.ai_no_suggestion'), 'info')
            return
          }
          this.expenseCategorySuggestion = suggestion
        })
        .catch((error) => {
          console.error('Error suggesting expense category:', error)
          if (this.isAiServiceUnavailableError(error)) {
            this.showAiServiceUnavailableToast()
            return
          }
          this.showToast(this.$t('expense.ai_suggestion_failed'), 'error')
        })
        .finally(() => {
          this.isSuggestingExpenseCategory = false
        })
    },
    applyExpenseCategorySuggestion() {
      if (!this.expenseCategorySuggestion?.suggestedCategory?.id) {
        return
      }
      this.expense.category = this.expenseCategorySuggestion.suggestedCategory.id
      this.showToast(this.$t('expense.ai_suggestion_applied'), 'success')
    },
    dismissExpenseCategorySuggestion() {
      this.expenseCategorySuggestion = null
    },
    handleSuggestExpenseCategoryInline(expense) {
      if (!this.canUseAi) {
        this.showToast(this.$t('expense.ai_premium_locked'), 'info')
        this.$router.push({ name: 'choose-plan', query: { feature: 'ai' } })
        return
      }
      if (!expense?.description) {
        this.showToast(this.$t('expense.ai_missing_context'), 'warning')
        return
      }

      this.aiSuggestingExpenseId = expense.id
      AiService.autoCategorize({
        expenses: [
          {
            expenseId: expense.id,
            description: expense.description,
            amount: Number(expense.amount || 0),
            paymentMethodId: expense.paymentMethodId ?? this.resolvePaymentMethodId(expense.paymentMethod) ?? undefined,
            bankCategoryId: expense.openFinanceBankCategoryId ?? undefined,
          }
        ]
      })
        .then(({ data }) => {
          const suggestion = Array.isArray(data?.suggestions) ? data.suggestions[0] : null
          const suggestedCategoryId = suggestion?.suggestedCategory?.id
          if (!suggestedCategoryId || this.isWeakCategorySuggestion(suggestion)) {
            if (this.isAiServiceUnavailableResponse(data)) {
              this.showAiServiceUnavailableToast()
              return
            }
            this.showToast(this.$t('expense.ai_no_suggestion'), 'info')
            return
          }
          this.batchExpenseCategorySuggestions = {
            ...this.batchExpenseCategorySuggestions,
            [expense.id]: suggestion,
          }

          const category = this.categories.find((item) => item.id === suggestedCategoryId)
          if (!category) {
            this.showToast(this.$t('expense.ai_no_suggestion'), 'info')
            return
          }

          this.startEditingExpense(expense)
          this.expense.category = category.id
          this.expenseCategorySuggestion = suggestion
          this.showToast(this.$t('expense.ai_suggestion_applied'), 'success')
        })
        .catch((error) => {
          console.error('Error suggesting inline expense category:', error)
          if (this.isAiServiceUnavailableError(error)) {
            this.showAiServiceUnavailableToast()
            return
          }
          this.showToast(this.$t('expense.ai_suggestion_failed'), 'error')
        })
        .finally(() => {
          this.aiSuggestingExpenseId = null
        })
    },
    buildAutoCategorizeCandidates(expenses) {
      return (Array.isArray(expenses) ? expenses : [])
        .filter((expense) => expense?.description)
        .map((expense) => ({
          expenseId: expense.id,
          description: expense.description,
          amount: Number(expense.amount || 0),
          paymentMethodId: expense.paymentMethodId ?? this.resolvePaymentMethodId(expense.paymentMethod) ?? undefined,
          bankCategoryId: expense.openFinanceBankCategoryId ?? undefined,
        }))
    },
    storeBatchExpenseSuggestions(data) {
      const suggestions = Array.isArray(data?.suggestions) ? data.suggestions : []
      const nextSuggestions = { ...this.batchExpenseCategorySuggestions }
      let storedCount = 0

      suggestions.forEach((suggestion) => {
        if (!suggestion?.expenseId || !suggestion?.suggestedCategory?.id || this.isWeakCategorySuggestion(suggestion)) {
          return
        }
        nextSuggestions[suggestion.expenseId] = suggestion
        storedCount += 1
      })

      this.batchExpenseCategorySuggestions = nextSuggestions
      return storedCount
    },
    async suggestExpensesInBatch(expenses, { showSuccess = true } = {}) {
      if (!this.canUseAi) {
        this.showToast(this.$t('expense.ai_premium_locked'), 'info')
        this.$router.push({ name: 'choose-plan', query: { feature: 'ai' } })
        return 0
      }
      const candidates = this.buildAutoCategorizeCandidates(expenses)

      if (!candidates.length) {
        this.showToast(this.$t('expense.ai_no_pending_uncategorized'), 'info')
        return 0
      }

      this.isBatchSuggestingExpenseCategories = true
      try {
        const { data } = await AiService.autoCategorize({ expenses: candidates })
        const storedCount = this.storeBatchExpenseSuggestions(data)

        if (!storedCount) {
          if (this.isAiServiceUnavailableResponse(data)) {
            this.showAiServiceUnavailableToast()
            return 0
          }
          this.showToast(this.$t('expense.ai_no_suggestion'), 'info')
          return 0
        }

        if (showSuccess) {
          this.showToast(this.$t('expense.ai_queue_suggestions_ready', { count: storedCount }), 'success')
        }
        return storedCount
      } catch (error) {
        console.error('Error suggesting uncategorized expenses in batch:', error)
        if (this.isAiServiceUnavailableError(error)) {
          this.showAiServiceUnavailableToast()
          return 0
        }
        this.showToast(this.$t('expense.ai_suggestion_failed'), 'error')
        return 0
      } finally {
        this.isBatchSuggestingExpenseCategories = false
      }
    },
    suggestUncategorizedExpensesInBatch() {
      return this.suggestExpensesInBatch(this.uncategorizedExpenses)
    },
    async applyBatchExpenseSuggestions(expenses = this.uncategorizedExpenses, { clearAllSuggestions = true } = {}) {
      const candidates = (Array.isArray(expenses) ? expenses : [])
        .map((expense) => ({ expense, suggestion: this.getStoredExpenseSuggestion(expense.id) }))
        .filter(({ suggestion }) => Boolean(suggestion?.suggestedCategory?.id))

      if (!candidates.length) {
        this.showToast(this.$t('expense.ai_no_pending_uncategorized'), 'info')
        return
      }

      this.isApplyingBatchExpenseSuggestions = true
      let appliedCount = 0

      try {
        for (const { expense, suggestion } of candidates) {
          await ExpenseService.update(expense.id, {
            date: this.normalizeDate(expense.date),
            amount: Number(expense.amount || 0),
            description: expense.description,
            category: suggestion.suggestedCategory.id,
            paymentMethod: expense.paymentMethodId ?? this.resolvePaymentMethodId(expense.paymentMethod) ?? null,
            paymentMethodName: expense.paymentMethodName ?? null,
            ...this.categorizationMetadataFromSuggestion(suggestion),
            selectedUsers: [],
            accountId: expense.accountId ?? null,
          })
          appliedCount += 1
        }

        if (clearAllSuggestions) {
          this.batchExpenseCategorySuggestions = {}
        } else {
          candidates.forEach(({ expense }) => this.clearStoredExpenseSuggestion(expense.id))
        }
        this.showToast(this.$t('expense.ai_queue_apply_success', { count: appliedCount }), 'success')
        await this.fetchMonthlyExpenses()
        await this.fetchDailyConsumptionExpenses()
      } catch (error) {
        console.error('Error applying batch expense suggestions:', error)
        this.showToast(this.$t('expense.ai_queue_apply_failed'), 'error')
      } finally {
        this.isApplyingBatchExpenseSuggestions = false
      }
    },
    async classifyOpenFinanceExpensesInBatch() {
      if (!this.uncategorizedOpenFinanceExpenses.length) {
        this.showToast(this.$t('expense.ai_no_pending_uncategorized'), 'info')
        return
      }
      if (!this.canUseAi) {
        this.showToast(this.$t('expense.ai_premium_locked'), 'info')
        this.$router.push({ name: 'choose-plan', query: { feature: 'ai' } })
        return
      }

      this.isAutoClassifyingOpenFinance = true
      try {
        const { data } = await AiService.applyOpenFinanceCategorization({
          month: this.selectedExpenseMonth,
          year: this.selectedExpenseYear,
          limit: 1000,
        })
        this.openFinanceCategorizationResult = data || null
        if (this.isAiServiceUnavailableResponse(data)) {
          this.showAiServiceUnavailableToast()
        }
        const appliedCount = Number(data?.applied || 0)
        if (!appliedCount) {
          this.showToast(this.openFinanceCategorizationSummary || this.$t('expense.ai_no_suggestion'), 'info')
          return
        }
        this.batchExpenseCategorySuggestions = {}
        this.showToast(this.openFinanceCategorizationSummary, 'success')
        await this.fetchMonthlyExpenses()
        await this.fetchDailyConsumptionExpenses()
      } catch (error) {
        console.error('Error applying Open Finance categorization:', error)
        if (this.isAiServiceUnavailableError(error)) {
          this.showAiServiceUnavailableToast()
          return
        }
        this.showToast(this.$t('expense.ai_queue_apply_failed'), 'error')
      } finally {
        this.isAutoClassifyingOpenFinance = false
      }
    },
    async applyStoredExpenseSuggestionInline(expense) {
      const suggestion = this.getStoredExpenseSuggestion(expense?.id)
      const suggestedCategoryId = suggestion?.suggestedCategory?.id

      if (!expense?.id || !suggestedCategoryId) {
        this.showToast(this.$t('expense.ai_no_suggestion'), 'info')
        return
      }

      this.applyingExpenseSuggestionId = expense.id

      try {
        await ExpenseService.update(expense.id, {
          date: this.normalizeDate(expense.date),
          amount: Number(expense.amount || 0),
          description: expense.description,
          category: suggestedCategoryId,
          paymentMethod: expense.paymentMethodId ?? this.resolvePaymentMethodId(expense.paymentMethod) ?? null,
          paymentMethodName: expense.paymentMethodName ?? null,
          ...this.categorizationMetadataFromSuggestion(suggestion),
          selectedUsers: Array.isArray(expense.users) ? expense.users.map((user) => user.id ?? user.userId).filter(Boolean) : [],
          accountId: expense.accountId ?? null,
        })

        this.clearStoredExpenseSuggestion(expense.id)
        this.showToast(this.$t('expense.ai_feedback_accepted'), 'success')
        await this.fetchMonthlyExpenses()
        await this.fetchDailyConsumptionExpenses()
      } catch (error) {
        console.error('Error applying inline expense suggestion:', error)
        this.showToast(this.$t('expense.ai_queue_apply_failed'), 'error')
      } finally {
        this.applyingExpenseSuggestionId = null
      }
    },
        resolvePaymentMethodId(value) {
          const logAndReturn = (resolved) => resolved

          if (value === null || value === undefined) {
            return logAndReturn(null)
          }

          if (typeof value === 'number') {
            return logAndReturn(value)
          }

          if (typeof value === 'string') {
            const numericValue = Number(value)
            if (!Number.isNaN(numericValue)) {
              const numericMatch = this.paymentMethods.find((method) => method.id === numericValue)
              if (numericMatch) {
                return logAndReturn(numericMatch.id)
              }
            }

            const stringMatch = this.paymentMethods.find(
              (method) => method.code === value || method.name === value
            )
            return logAndReturn(stringMatch ? stringMatch.id : null)
          }

          if (typeof value === 'object') {
            if (value.id !== undefined && value.id !== null) {
              return logAndReturn(value.id)
            }
            if (value.code) {
              const codeMatch = this.paymentMethods.find((method) => method.code === value.code)
              if (codeMatch) {
                return logAndReturn(codeMatch.id)
              }
            }
            if (value.name) {
              const nameMatch = this.paymentMethods.find((method) => method.name === value.name)
              if (nameMatch) {
                return logAndReturn(nameMatch.id)
              }
            }
          }

          return logAndReturn(null)
        },
        resolveCategoryId(value) {
          const logAndReturn = (resolved) => resolved

          if (value === null || value === undefined) {
            return logAndReturn(null)
          }

          if (typeof value === 'number') {
            return logAndReturn(value)
          }

          if (typeof value === 'string') {
            const numericValue = Number(value)
            if (!Number.isNaN(numericValue)) {
              const numericMatch = this.categories.find((category) => category.id === numericValue)
              if (numericMatch) {
                return logAndReturn(numericMatch.id)
              }
            }

            const stringMatch = this.categories.find(
              (category) => category.code === value || category.name === value
            )
            return logAndReturn(stringMatch ? stringMatch.id : null)
          }

          if (typeof value === 'object') {
            if (value.id !== undefined && value.id !== null) {
              return logAndReturn(value.id)
            }
            if (value.code) {
              const codeMatch = this.categories.find((category) => category.code === value.code)
              if (codeMatch) {
                return logAndReturn(codeMatch.id)
              }
            }
            if (value.name) {
              const nameMatch = this.categories.find((category) => category.name === value.name)
              if (nameMatch) {
                return logAndReturn(nameMatch.id)
              }
            }
          }

          return logAndReturn(null)
        },
    fetchCategories() {
      DataService.listCategories()
        .then((response) => {
          const categories = this.normalizeCollection(response?.data)
          this.categories = categories
            .map((category) => {
              const code = String(category?.code || '').trim()
              const id = category?.id ?? null
              const isActive = category?.active !== false
              const isSystemDefined = category?.systemDefined !== false
              if (!code || id === null || id === undefined) {
                return null
              }
              if (!isActive) {
                return null
              }

              const translationKey = `categories.${code}`
              const translatedName = this.$t(translationKey)
              const isTranslated = translatedName !== translationKey
              return {
                id,
                code,
                name: isSystemDefined && isTranslated ? translatedName : (category?.name || code)
              }
            })
            .filter((category) => Boolean(category))
        })
        .catch((error) => {
          console.error('Error fetching categories:', error)
        })
    },
    fetchPaymentMethods() {
      const language = this.$i18n?.locale || this.selectedLanguage || 'pt'
      this.selectedLanguage = language
      DataService.fetchPaymentMethods(language)
        .then((response) => {
          const paymentMethods = this.normalizeCollection(response?.data)
          this.paymentMethods = paymentMethods
            .map((method) => {
              const id = method?.id ?? null
              const code = String(method?.code || '').trim()
              const name = String(method?.name || code || '').trim()

              if (id === null || id === undefined || !code || !name) {
                return null
              }

              return {
                id,
                code,
                name
              }
            })
            .filter((method) => Boolean(method))
        })
        .catch((error) => {
          console.error('Error fetching payment methods:', error)
        })
    },
    getDefaultFinancialAccountId() {
      return this.financialAccounts[0]?.id ?? null
    },
    applyDefaultFinancialAccount() {
      const defaultAccountId = this.getDefaultFinancialAccountId()
      if (!defaultAccountId) {
        return
      }

      if (!this.income.accountId) {
        this.income.accountId = defaultAccountId
      }

      if (!this.expense.accountId) {
        this.expense.accountId = defaultAccountId
      }
    },
    loadBillingCapabilities() {
      const workspaceId = this.currentWorkspaceId
      if (!workspaceId) {
        this.billingSummary = null
        return Promise.resolve()
      }
      return BillingOrchestrationService.getBillingSummary(workspaceId)
        .then((response) => {
          this.billingSummary = response?.data || null
        })
        .catch((error) => {
          console.error('Erro ao carregar capacidades do plano:', error)
          this.billingSummary = null
        })
    },
    fetchFinancialAccounts() {
      this.isLoadingFinancialAccounts = true
      FinancialReadService.fetchAccounts()
        .then((response) => {
          this.financialAccounts = (response.data || []).map((account) => ({
            ...account,
            displayName: [account.name, account.currency].filter(Boolean).join(' • ')
          }))
          this.applyDefaultFinancialAccount()
          this.applyOpenFinanceContextToCollections()
        })
        .catch((error) => {
          console.error('Error fetching financial accounts:', error)
          this.financialAccounts = []
        })
        .finally(() => {
          this.isLoadingFinancialAccounts = false
        })
    },
    fetchOpenFinanceConnections() {
      if (!this.canUseConnectedFinance) {
        this.openFinanceConnections = []
        this.applyOpenFinanceContextToCollections()
        return Promise.resolve()
      }
      return OpenFinanceService.listConnections()
        .then((response) => {
          this.openFinanceConnections = Array.isArray(response?.data) ? response.data : []
          this.applyOpenFinanceContextToCollections()
        })
        .catch((error) => {
          console.error('Erro ao buscar conexões Open Finance:', error)
          this.openFinanceConnections = []
        })
    },
    ensureAccountSelected(target) {
      const defaultAccountId = this.getDefaultFinancialAccountId()
      const selectedAccountId = target.accountId || defaultAccountId

      if (!selectedAccountId) {
        this.showToast(this.$t('validation.account_required'), 'warning')
        return false
      }

      target.accountId = selectedAccountId
      return true
    },
    fetchShareableUsers() {
      const userStore = useUserStore()
      const workspaceId = userStore.getCurrentWorkspaceId
      const isTenantMode = userStore.isTenantMode

      if (!(isTenantMode && workspaceId)) {
        this.users = []
        return
      }

      WorkspaceService.listMembers(workspaceId)
        .then((response) => {
          const members = this.normalizeCollection(response?.data)
          this.users = members
            .map((member) => {
              const id = member?.userId ?? member?.id ?? member?.email ?? null
              if (!id) return null
              return {
                id,
                name: member?.name ?? member?.fullName ?? member?.email ?? String(id),
                email: member?.email ?? ''
              }
            })
            .filter((member) => Boolean(member))
        })
        .catch((error) => {
          console.error('Erro ao buscar membros do workspace:', error)
          this.users = []
        })
    },
    fetchOpenFinanceConflicts() {
      if (!this.canUseConnectedFinance) {
        this.openFinanceConflicts = []
        this.monthlyIncomes = this.monthlyIncomes.map((income) => this.enrichIncomeWithConflict(income))
        this.monthlyExpenses = this.monthlyExpenses.map((expense) => this.enrichExpenseWithConflict(expense))
        return Promise.resolve()
      }
      return OpenFinanceService.listReconciliationConflicts()
        .then((response) => {
          this.openFinanceConflicts = Array.isArray(response?.data) ? response.data : []
          this.monthlyIncomes = this.monthlyIncomes.map((income) => this.enrichIncomeWithConflict(income))
          this.monthlyExpenses = this.monthlyExpenses.map((expense) => this.enrichExpenseWithConflict(expense))
        })
        .catch((error) => {
          console.error('Erro ao buscar conflitos Open Finance:', error)
          this.openFinanceConflicts = []
        })
    },
    resetIncomePaginationAndFetch() {
      this.incomePagination.offset = 0
      this.fetchMonthlyIncomes()
    },
    resetExpensePaginationAndFetch() {
      this.expensePagination.offset = 0
      this.fetchMonthlyExpenses()
      this.fetchDailyConsumptionExpenses()
    },
    goToPreviousIncomePage() {
      if (!this.canGoToPreviousIncomePage) {
        return
      }

      this.incomePagination.offset = Math.max(this.incomePagination.offset - this.incomePagination.limit, 0)
      this.fetchMonthlyIncomes()
    },
    goToNextIncomePage() {
      if (!this.canGoToNextIncomePage) {
        return
      }

      this.incomePagination.offset += this.incomePagination.limit
      this.fetchMonthlyIncomes()
    },
    goToPreviousExpensePage() {
      if (!this.canGoToPreviousExpensePage) {
        return
      }

      this.expensePagination.offset = Math.max(this.expensePagination.offset - this.expensePagination.limit, 0)
      this.fetchMonthlyExpenses()
    },
    goToNextExpensePage() {
      if (!this.canGoToNextExpensePage) {
        return
      }

      this.expensePagination.offset += this.expensePagination.limit
      this.fetchMonthlyExpenses()
    },
    fetchMonthlyIncomes() {
      const monthNumber = this.selectedIncomeMonth;
      const yearNumber = this.selectedIncomeYear;
      if (monthNumber !== null) {
        this.isLoadingIncomes = true;
        return IncomeService.fetchMonthlyIncomes(monthNumber, yearNumber, this.incomePagination)
          .then((response) => {
            const page = response?.data || {}
            this.monthlyIncomes = this.normalizeCollection(page).map((income) => this.enrichIncomeWithConflict(income));
            this.incomePagination.total = Number(page.total ?? this.monthlyIncomes.length)
            this.incomePagination.limit = Number(page.limit ?? this.incomePagination.limit)
            this.incomePagination.offset = Number(page.offset ?? this.incomePagination.offset)
          })
          .catch((error) => {
            console.error('Error fetching monthly incomes:', error);
          })
          .finally(() => {
            this.isLoadingIncomes = false;
          });
      }
      return Promise.resolve()
    },
    saveIncome() {
      const normalizedDate = this.normalizeDate(this.income.date)
      if (!normalizedDate) {
        this.showToast(this.$t('validation.required', { field: this.$t('common.date') }), 'warning')
        return
      }

      const parsedAmount = parseCurrencyToNumber(this.income.amount)
      if (parsedAmount === null) {
        this.showToast(this.$t('validation.invalid_currency'), 'warning')
        return
      }

      const paymentMethodId = this.resolvePaymentMethodId(this.income.paymentMethod)
      if (!paymentMethodId) {
        this.showToast(this.$t('validation.required', { field: this.$t('common.payment_method') }), 'warning')
        return
      }

      if (!this.ensureAccountSelected(this.income)) {
        return
      }

      const isEditing = this.isEditingIncome && this.editingIncomeId

      const payload = this.buildIncomePayload({
        normalizedDate,
        paymentMethodId,
        amount: parsedAmount
      })

      const request = isEditing
        ? IncomeService.update(this.editingIncomeId, payload)
        : IncomeService.create(payload)

      request
        .then(() => {
          if (isEditing) {
            this.showToast(this.$t('income.updated_successfully'), 'success')
          } else {
            this.showToast(this.$t('income.saved_successfully'), 'success')
          }
          this.resetIncomeForm()
          this.fetchMonthlyIncomes()
        })
        .catch((error) => {
          console.error('Error saving income:', error)
          if (error?.response) {
            console.error('[TransactionsView] saveIncome response error', error.response.data)
          }
          if (error?.message === NO_FINANCIAL_ACCOUNT_ERROR_MESSAGE) {
            this.showToast(this.$t('validation.account_required'), 'warning')
            return
          }
          const message = isEditing ? this.$t('income.update_failed') : this.$t('income.save_failed')
          this.showToast(message, 'error')
        })
    },
    saveExpense() {
      const normalizedDate = this.normalizeDate(this.expense.date)
      if (!normalizedDate) {
        this.showToast(this.$t('validation.required', { field: this.$t('common.date') }), 'warning')
        return
      }

      const categoryId = this.resolveCategoryId(this.expense.category)
      if (!categoryId) {
        this.showToast(this.$t('validation.required', { field: this.$t('common.category') }), 'warning')
        return
      }

      const paymentMethodId = this.resolvePaymentMethodId(this.expense.paymentMethod)
      if (!paymentMethodId) {
        this.showToast(this.$t('validation.required', { field: this.$t('common.payment_method') }), 'warning')
        return
      }

      const parsedAmount = parseCurrencyToNumber(this.expense.amount)
      if (parsedAmount === null) {
        this.showToast(this.$t('validation.invalid_currency'), 'warning')
        return
      }

      if (!this.ensureAccountSelected(this.expense)) {
        return
      }

      const isEditing = this.isEditingExpense && this.editingExpenseId
      const payload = this.buildExpensePayload({
        normalizedDate,
        categoryId,
        paymentMethodId,
        amount: parsedAmount
      })

      const request = isEditing
        ? ExpenseService.update(this.editingExpenseId, payload)
        : ExpenseService.create(payload)

      request
        .then(() => {
          if (isEditing) {
            const feedbackMessage = this.handleExpenseSuggestionFeedback(categoryId)
            this.showToast(feedbackMessage || this.$t('expense.updated_successfully'), 'success')
          } else {
            this.showToast(this.$t('expense.saved_successfully'), 'success')
          }
          this.resetExpenseForm()
          this.fetchMonthlyExpenses()
        })
        .catch((error) => {
          console.error('Error saving expense:', error)
          if (error?.response) {
            console.error('[TransactionsView] saveExpense response error', error.response.data)
          }
          if (error?.message === NO_FINANCIAL_ACCOUNT_ERROR_MESSAGE) {
            this.showToast(this.$t('validation.account_required'), 'warning')
            return
          }
          const message = isEditing ? this.$t('expense.update_failed') : this.$t('expense.save_failed')
          this.showToast(message, 'error')
        })
    },
    notifyUsers(expense) {
      this.selectedUsers.forEach((userId) => {
        UsersService.notifyUser(userId, expense)
          .then((response) => {
            console.log(response)
            console.log(`User ${userId} notified successfully`)
          })
          .catch((error) => {
            console.error(`Error notifying user ${userId}:`, error)
          })
      })
    },
    resetIncomeForm() {
      this.income = {
        date: toLocalISODate(),
        amount: '0',
        description: '',
        paymentMethod: null,
        paymentMethodName: null,
        openFinance: false,
        isRecurring: false,
        accountId: this.getDefaultFinancialAccountId(),
        visibilityScope: 'WORKSPACE',
      }
      this.isEditingIncome = false
      this.editingIncomeId = null
      this.showFormDrawer = false
    },
    resetExpenseForm() {
      this.expense = {
        date: toLocalISODate(),
        amount: '0',
        description: '',
        category: null,
        paymentMethod: null,
        paymentMethodName: null,
        openFinance: false,
        selectedUsers: [],
        accountId: this.getDefaultFinancialAccountId(),
        openFinanceBankCategoryId: null,
        visibilityScope: 'WORKSPACE',
      }
      this.isEditingExpense = false
      this.editingExpenseId = null
      this.editingExpenseOriginal = null
      this.expenseCategorySuggestion = null
      this.showFormDrawer = false
    },
    toggleRecurring({ income, months }) {
      IncomeService.toggleRecurring(income.id, months)
      .then(() => {
          const incomeIndex = this.monthlyIncomes.findIndex((item) => item.id === income.id)
          if (incomeIndex !== -1) {
            this.monthlyIncomes[incomeIndex].isRecurring =
              !this.monthlyIncomes[incomeIndex].isRecurring
          }
        })
        .catch((error) => {
          console.error('Failed to toggle recurring status:', error)
        })
    },
    deleteIncome(income) {
      if (confirm('Are you sure you want to delete this income?')) {
        IncomeService.delete(income.id)
          .then(() => {
            const incomeIndex = this.monthlyIncomes.findIndex((item) => item.id === income.id)
            if (incomeIndex !== -1) {
              this.monthlyIncomes.splice(incomeIndex, 1)
            }
          })
          .catch((error) => {
            console.error('Failed to delete income:', error)
          })
      }
    },
    toggleIncomePlanningExclusion(income) {
      this.togglePlanningExclusionForTransaction(income, 'income')
    },
    deleteExpense(expense) {
      if (confirm('Are you sure you want to delete this expense?')) {
        ExpenseService.delete(expense.id)
          .then(() => {
            const nextSuggestions = { ...this.batchExpenseCategorySuggestions }
            delete nextSuggestions[expense.id]
            this.batchExpenseCategorySuggestions = nextSuggestions
            const expenseIndex = this.monthlyExpenses.findIndex((item) => item.id === expense.id)
            if (expenseIndex !== -1) {
              this.monthlyExpenses.splice(expenseIndex, 1)
            }
          })
          .catch((error) => {
            console.error('Failed to delete expense:', error)
          })
      }
    },
    toggleExpensePlanningExclusion(expense) {
      this.togglePlanningExclusionForTransaction(expense, 'expense')
    },
    togglePlanningExclusionForTransaction(transaction, kind) {
      if (!transaction?.id || !transaction?.openFinance) {
        return
      }

      const nextExcludedState = !Boolean(transaction.excludedFromPlanning)
      const confirmMessage = nextExcludedState
        ? this.$t('transactionPlanning.confirmExclude')
        : this.$t('transactionPlanning.confirmRestore')

      if (!confirm(confirmMessage)) {
        return
      }

      FinancialReadService.setPlanningExclusion(transaction.id, {
        excludedFromPlanning: nextExcludedState,
      })
        .then(({ data }) => {
          this.syncPlanningExclusionState(kind, transaction.id, Boolean(data?.excludedFromPlanning))
          this.showToast(
            nextExcludedState
              ? this.$t('transactionPlanning.excludeSuccess')
              : this.$t('transactionPlanning.restoreSuccess'),
            'success'
          )
        })
        .catch((error) => {
          console.error('Failed to update planning exclusion:', error)
          const responseMessage = typeof error?.response?.data === 'string' ? error.response.data : ''
          this.showToast(responseMessage || this.$t('transactionPlanning.updateError'), 'error')
        })
    },
    syncPlanningExclusionState(kind, transactionId, excludedFromPlanning) {
      const targetList = kind === 'income' ? this.monthlyIncomes : this.monthlyExpenses
      const transaction = targetList.find((item) => item.id === transactionId)
      if (transaction) {
        transaction.excludedFromPlanning = excludedFromPlanning
      }

      if (kind === 'expense' && this.editingExpenseId === transactionId) {
        this.expense.excludedFromPlanning = excludedFromPlanning
      }
    },
    handleCommentsDialogVisibility(value) {
      this.transactionCommentsDialog.show = value
      if (!value) {
        this.transactionCommentsDialog.transactionId = null
        this.transactionCommentsDialog.transactionDescription = ''
        this.transactionCommentsDialog.comments = []
      }
    },
    openTransactionComments(transaction) {
      if (!transaction?.id || transaction.visibilityScope !== 'WORKSPACE') {
        return
      }
      this.transactionCommentsDialog.show = true
      this.transactionCommentsDialog.transactionId = transaction.id
      this.transactionCommentsDialog.transactionDescription = transaction.description || ''
      this.loadTransactionComments(transaction.id)
    },
    loadTransactionComments(transactionId) {
      this.transactionCommentsDialog.loading = true
      FinancialReadService.listTransactionComments(transactionId)
        .then((response) => {
          this.transactionCommentsDialog.comments = Array.isArray(response?.data) ? response.data : []
        })
        .catch((error) => {
          console.error('Error loading transaction comments:', error)
          this.transactionCommentsDialog.comments = []
          this.showToast(this.$t('transactionComments.loadError'), 'error')
        })
        .finally(() => {
          this.transactionCommentsDialog.loading = false
        })
    },
    submitTransactionComment(body) {
      const transactionId = this.transactionCommentsDialog.transactionId
      if (!transactionId || !body?.trim()) {
        return
      }
      this.transactionCommentsDialog.submitting = true
      FinancialReadService.addTransactionComment(transactionId, body)
        .then(() => {
          this.showToast(this.$t('transactionComments.submitSuccess'), 'success')
          this.loadTransactionComments(transactionId)
        })
        .catch((error) => {
          console.error('Error adding transaction comment:', error)
          this.showToast(this.$t('transactionComments.submitError'), 'error')
        })
        .finally(() => {
          this.transactionCommentsDialog.submitting = false
        })
    },
    startEditingIncome(income) {
      this.formMode = 'income'
      this.showFormDrawer = true
      this.isEditingIncome = true
      this.editingIncomeId = income.id
      this.income = {
        date: this.normalizeDate(income.date),
        amount: formatCurrencyForInput(income.amount),
        description: income.description,
        paymentMethod: this.resolvePaymentMethodId(
          income.paymentMethod ?? income.paymentMethodId ?? null
        ),
        paymentMethodName: income.paymentMethodName ?? null,
        openFinance: income.openFinance ?? false,
        isRecurring: income.isRecurring ?? false,
        accountId: income.accountId ?? null,
        visibilityScope: income.visibilityScope ?? 'WORKSPACE',
      }
    },
    cancelIncomeEdit() {
      this.resetIncomeForm()
    },
    startEditingExpense(expense) {
      this.formMode = 'expense'
      this.showFormDrawer = true
      try {
        this.editingExpenseOriginal = JSON.parse(JSON.stringify(expense))
      } catch (parseError) {
        console.warn('[TransactionsView] Failed to snapshot original expense, falling back to shallow copy.', parseError)
        this.editingExpenseOriginal = { ...expense }
      }

      this.isEditingExpense = true
      this.editingExpenseId = expense.id

      this.expense = {
        date: this.normalizeDate(expense.date),
        amount: formatCurrencyForInput(expense.amount),
        description: expense.description,
        category: this.resolveCategoryId(expense.category ?? expense.categoryId ?? null),
        paymentMethod: this.resolvePaymentMethodId(
          expense.paymentMethod ?? expense.paymentMethodId ?? null
        ),
        paymentMethodName: expense.paymentMethodName ?? null,
        openFinance: expense.openFinance ?? false,
        selectedUsers: Array.isArray(expense.users)
          ? expense.users.map((user) => user.userId ?? user.id ?? user)
          : [],
        accountId: expense.accountId ?? null,
        openFinanceBankCategoryId: expense.openFinanceBankCategoryId ?? null,
        visibilityScope: expense.visibilityScope ?? 'WORKSPACE',
      }
      this.expenseCategorySuggestion = null

      if (Array.isArray(expense.users) && expense.users.length) {
        this.users = expense.users.map((user) => ({
          id: user.userId ?? user.id ?? user,
          name: user.name ?? user.email ?? (user.userId ?? user),
          email: user.email ?? null
        }))
      } else {
        this.users = []
      }
    },
    cancelExpenseEdit() {
      this.resetExpenseForm()
    },
    // fetchMonthlyNubankBill() {
    //     const monthNumber = this.selectedExpenseMonth;
    //     BankService.fetchMonthlyNubankBill(monthNumber, 2024)
    //         .then(response => {
    //             console.log(response);
    //             this.transformExpenses(response.data.bill.line_items);
    //         })
    //         .catch(error => {
    //             console.error('Error fetching monthly expenses:', error);
    //         });
    // },
    // transformExpenses(lineItems) {
    //     this.monthlyExpenses = lineItems.map(item => {
    //         return {
    //             date: item.post_date,
    //             amount: (item.amount / 100).toFixed(2),
    //             description: item.title,
    //             category: item.category
    //         };
    //     });
    // },

    fetchMonthlyExpenses() {
      const monthNumber = this.selectedExpenseMonth;
      const yearNumber = this.selectedExpenseYear;
      if (monthNumber !== null) {
        this.isLoadingExpenses = true;
        return ExpenseService.fetchMonthlyExpenses(monthNumber, yearNumber, {
          ...this.expensePagination,
          categoryId: this.routeExpenseCategoryId || undefined,
          uncategorized: this.routeExpenseUncategorized || undefined,
        })
          .then((response) => {
            const page = response?.data || {}
            this.monthlyExpenses = this.normalizeCollection(page).map((expense) => this.enrichExpenseWithConflict(expense));
            this.expensePagination.total = Number(page.total ?? this.monthlyExpenses.length)
            this.expensePagination.limit = Number(page.limit ?? this.expensePagination.limit)
            this.expensePagination.offset = Number(page.offset ?? this.expensePagination.offset)
            return this.loadSharedExpenseAgreements()
          })
          .catch((error) => {
            console.error('Error fetching monthly expenses:', error);
          })
          .finally(() => {
            this.isLoadingExpenses = false;
          });
      }
      return Promise.resolve()
    },
    fetchDailyConsumptionExpenses() {
      const monthNumber = this.selectedExpenseMonth
      const yearNumber = this.selectedExpenseYear
      if (monthNumber === null) {
        this.dailyReportExpenses = []
        return Promise.resolve()
      }

      return ExpenseService.fetchMonthlyExpenses(monthNumber, yearNumber, { limit: 1000, offset: 0 })
        .then((response) => {
          const page = response?.data || {}
          this.dailyReportExpenses = this.normalizeCollection(page).map((expense) => this.enrichExpenseWithConflict(expense))
        })
        .catch((error) => {
          console.error('Error fetching daily consumption expenses:', error)
          this.dailyReportExpenses = []
        })
    },
    loadSharedExpenseAgreements() {
      if (!this.monthlyExpenses.length) {
        return Promise.resolve()
      }

      return SharedExpenseAgreementService.list()
        .then((response) => {
          const agreements = Array.isArray(response?.data) ? response.data : []
          const agreementsByTransaction = agreements.reduce((acc, agreement) => {
            const transactionId = agreement?.transactionId
            if (!transactionId) return acc
            if (!acc[transactionId]) {
              acc[transactionId] = []
            }
            acc[transactionId].push(agreement)
            return acc
          }, {})

          this.monthlyExpenses = this.monthlyExpenses.map((expense) => ({
            ...expense,
            sharedAgreements: agreementsByTransaction[expense.id] || [],
          }))
        })
        .catch((error) => {
          console.error('Erro ao carregar combinados de divisão:', error)
        })
    },
    handleResolveExpenseConflict({ expense, action }) {
      if (!this.canUseConnectedFinance) {
        this.showToast(this.$t('categories_page.connected_finance_locked'), 'info')
        this.$router.push({ name: 'choose-plan', query: { feature: 'connected-finance' } })
        return
      }
      const conflictId = expense?.reconciliationConflictId
      if (!conflictId) {
        this.showToast('Conflito Open Finance não encontrado para esta despesa.', 'warning')
        return
      }

      this.resolvingConflictId = conflictId
      this.resolvingConflictAction = action

      const request = action === 'keep-existing'
        ? OpenFinanceService.resolveKeepExisting(conflictId)
        : OpenFinanceService.resolveCreateNew(conflictId)

      request
        .then(() => Promise.all([
          this.fetchOpenFinanceConflicts(),
          this.fetchMonthlyExpenses(),
        ]))
        .then(() => {
          this.showToast('Conflito Open Finance resolvido.', 'success')
        })
        .catch((error) => {
          console.error('Erro ao resolver conflito Open Finance:', error)
          this.showToast('Falha ao resolver conflito Open Finance.', 'error')
        })
        .finally(() => {
          this.resolvingConflictId = null
          this.resolvingConflictAction = null
        })
    },
    handleResolveIncomeConflict({ income, action }) {
      if (!this.canUseConnectedFinance) {
        this.showToast(this.$t('categories_page.connected_finance_locked'), 'info')
        this.$router.push({ name: 'choose-plan', query: { feature: 'connected-finance' } })
        return
      }
      const conflictId = income?.reconciliationConflictId
      if (!conflictId) {
        this.showToast('Conflito Open Finance não encontrado para esta receita.', 'warning')
        return
      }

      this.resolvingConflictId = conflictId
      this.resolvingConflictAction = action

      const request = action === 'keep-existing'
        ? OpenFinanceService.resolveKeepExisting(conflictId)
        : OpenFinanceService.resolveCreateNew(conflictId)

      request
        .then(() => Promise.all([
          this.fetchOpenFinanceConflicts(),
          this.fetchMonthlyIncomes(),
        ]))
        .then(() => {
          this.showToast('Conflito Open Finance resolvido.', 'success')
        })
        .catch((error) => {
          console.error('Erro ao resolver conflito Open Finance:', error)
          this.showToast('Falha ao resolver conflito Open Finance.', 'error')
        })
        .finally(() => {
          this.resolvingConflictId = null
          this.resolvingConflictAction = null
        })
    },
    handleAttachFiles({ expense, files }) {
      const expenseId = expense.id
      this.setAttachmentState(expenseId, { status: 'loading', error: null })
      ExpenseService.uploadAttachment(expenseId, files)
        .then(() => this.loadTransactionAttachments(expenseId))
        .then(() => {
          this.showToast('Anexo salvo.', 'success')
        })
        .catch((error) => {
          console.error('Erro ao anexar arquivos:', error)
          this.setAttachmentState(expenseId, { status: 'error', error })
          this.showToast('Falha ao anexar arquivo.', 'error')
        })
    },
    async handleShareExpense({ expense, email, files = [] }) {
      const userStore = useUserStore();

      if (!email) {
        console.warn('Email não informado');
        return;
      }

      const filesToUpload = Array.isArray(files)
        ? files.filter((file) => file instanceof File)
        : []

      if (filesToUpload.length) {
        const formData = new FormData()
        filesToUpload.forEach((file) => {
          formData.append('files', file)
        })

        try {
          await ExpenseService.uploadAttachment(expense.id, formData)
          await this.loadTransactionAttachments(expense.id)
        } catch (error) {
          console.error('Erro ao anexar arquivos antes de compartilhar:', error)
          this.showToast('Falha ao anexar arquivo antes do envio.', 'error')
          return
        }
      }

      const emailData = {
        user: {
          email: userStore.getUser.email,
          name: userStore.getUser.username,
        },
        expense: expense,
        destinationEmail: email,
      };

      NotificationService.sendTransactionShareEmail(emailData)
        .then((response) => {
          const attachmentCount = response?.data?.attachmentCount ?? 0
          this.showToast(`Email enviado com ${attachmentCount} anexo(s).`, 'success')
        })
        .catch((error) => {
          console.error('Erro ao enviar o email:', error);
          this.showToast('Falha ao enviar email.', 'error')
        });
    },
    applyExpenseAttachments(expenseId, attachments) {
      const updatedAttachments = Array.isArray(attachments) ? attachments : []
      const expenseIndex = this.monthlyExpenses.findIndex((item) => item.id === expenseId)
      if (expenseIndex !== -1) {
        this.monthlyExpenses[expenseIndex] = {
          ...this.monthlyExpenses[expenseIndex],
          attachments: updatedAttachments,
        }
      }
      this.syncSelectedTransactionAttachmentState(expenseId)
    },
    handleSharedAgreementCreated({ expense, agreement }) {
      const expenseId = expense?.id || agreement?.transactionId
      if (!expenseId || !agreement) {
        return
      }

      const expenseIndex = this.monthlyExpenses.findIndex((item) => item.id === expenseId)
      if (expenseIndex !== -1) {
        const currentAgreements = Array.isArray(this.monthlyExpenses[expenseIndex].sharedAgreements)
          ? this.monthlyExpenses[expenseIndex].sharedAgreements
          : []
        const exists = currentAgreements.some((item) => item.id === agreement.id)
        this.monthlyExpenses[expenseIndex] = {
          ...this.monthlyExpenses[expenseIndex],
          sharedAgreements: exists
            ? currentAgreements.map((item) => (item.id === agreement.id ? agreement : item))
            : [agreement, ...currentAgreements],
        }
      }

      const emailStatus = agreement?.emailDeliveryStatus
      const emailCount = Number(agreement?.emailDeliveryCount || 0)
      if (emailStatus === 'SENT') {
        this.showToast(`Combinado criado e email enviado para ${emailCount} participante(s).`, 'success')
      } else if (emailStatus === 'PARTIAL') {
        this.showToast(`Combinado criado, mas alguns emails falharam. Enviados: ${emailCount}.`, 'warning')
      } else if (emailStatus === 'FAILED') {
        this.showToast('Combinado criado, mas o envio dos emails falhou.', 'warning')
      } else {
        this.showToast('Combinado de divisão criado.', 'success')
      }
      this.syncSelectedTransactionAgreementState(expenseId)
    },
    handleSharedAgreementUpdated({ expense, agreement }) {
      const expenseId = expense?.id || agreement?.transactionId
      if (!expenseId || !agreement) {
        return
      }

      const expenseIndex = this.monthlyExpenses.findIndex((item) => item.id === expenseId)
      if (expenseIndex !== -1) {
        const currentAgreements = Array.isArray(this.monthlyExpenses[expenseIndex].sharedAgreements)
          ? this.monthlyExpenses[expenseIndex].sharedAgreements
          : []
        const exists = currentAgreements.some((item) => item.id === agreement.id)
        this.monthlyExpenses[expenseIndex] = {
          ...this.monthlyExpenses[expenseIndex],
          sharedAgreements: exists
            ? currentAgreements.map((item) => (item.id === agreement.id ? agreement : item))
            : [agreement, ...currentAgreements],
        }
      }

      const emailStatus = agreement?.emailDeliveryStatus
      const emailCount = Number(agreement?.emailDeliveryCount || 0)
      if (emailStatus === 'SENT') {
        this.showToast(`Combinado atualizado e email enviado para ${emailCount} participante(s).`, 'success')
      } else if (emailStatus === 'PARTIAL') {
        this.showToast(`Combinado atualizado, mas alguns emails falharam. Enviados: ${emailCount}.`, 'warning')
      } else if (emailStatus === 'FAILED') {
        this.showToast('Combinado atualizado, mas o envio dos emails falhou.', 'warning')
      } else {
        this.showToast('Combinado de divisão atualizado.', 'success')
      }
      this.syncSelectedTransactionAgreementState(expenseId)
    },
    handleSharedAgreementError({ error }) {
      console.error('Erro ao criar combinado de divisão:', error)
      this.showToast('Falha ao criar combinado de divisão.', 'error')
    },
    handlePanelSharedAgreementCreated(agreement) {
      const expense = this.transactionAgreementDialog.expense
      this.handleSharedAgreementCreated({ expense, agreement })
      const updatedExpense = this.findMonthlyExpenseById(expense?.id || agreement?.transactionId)
      this.transactionAgreementDialog = {
        show: true,
        expense: updatedExpense || expense,
        agreement,
      }
      this.transactionAgreementVisibilityOpen = true
    },
    handlePanelSharedAgreementUpdated(agreement) {
      const expense = this.transactionAgreementDialog.expense
      this.handleSharedAgreementUpdated({ expense, agreement })
      const updatedExpense = this.findMonthlyExpenseById(expense?.id || agreement?.transactionId)
      this.transactionAgreementDialog = {
        show: true,
        expense: updatedExpense || expense,
        agreement,
      }
      this.transactionAgreementVisibilityOpen = true
    },
    handlePanelSharedAgreementError(error) {
      this.handleSharedAgreementError({ error })
    },
    findMonthlyExpenseById(expenseId) {
      if (!expenseId) return null
      return this.monthlyExpenses.find((item) => item.id === expenseId) || null
    },
    syncSelectedTransactionAgreementState(expenseId) {
      const updatedExpense = this.findMonthlyExpenseById(expenseId)
      if (!updatedExpense) return
      if (this.transactionDetailsPanel.transaction?.id === expenseId) {
        this.transactionDetailsPanel.transaction = updatedExpense
      }
      if (this.transactionAgreementDialog.expense?.id === expenseId) {
        this.transactionAgreementDialog.expense = updatedExpense
      }
    },
    syncSelectedTransactionAttachmentState(expenseId) {
      const updatedExpense = this.findMonthlyExpenseById(expenseId)
      if (!updatedExpense) return
      if (this.transactionDetailsPanel.transaction?.id === expenseId) {
        this.transactionDetailsPanel.transaction = updatedExpense
      }
      if (this.transactionAttachmentsDialog.expense?.id === expenseId) {
        this.transactionAttachmentsDialog.expense = updatedExpense
      }
    },
    handleRemoveAttachment({ expenseId, attachmentId }) {
      this.setAttachmentState(expenseId, { status: 'loading', error: null })
      ExpenseService.removeAttachment(expenseId, attachmentId)
        .then(() => this.loadTransactionAttachments(expenseId))
        .then(() => {
          this.showToast(this.$t('transactionAttachments.remove_success'), 'success')
        })
        .catch(error => {
          console.error('Erro ao remover o anexo:', error)
          this.setAttachmentState(expenseId, { status: 'error', error })
          this.showToast(this.$t('transactionAttachments.remove_error'), 'error')
        })
    },
    handleDownloadAttachment({ expenseId, attachmentId, fileName }) {
      ExpenseService.downloadAttachment(expenseId, attachmentId)
        .then((response) => {
          const blob = response?.data
          if (!blob) {
            throw new Error('Arquivo nao encontrado no download')
          }

          const disposition = response?.headers?.['content-disposition'] || ''
          const fileNameFromHeader = disposition
            .split(';')
            .map((part) => part.trim())
            .find((part) => part.toLowerCase().startsWith('filename='))
            ?.split('=')[1]
            ?.replace(/^"|"$/g, '')

          const resolvedFileName = fileNameFromHeader || fileName || 'attachment'
          const url = window.URL.createObjectURL(blob)
          const anchor = document.createElement('a')
          anchor.href = url
          anchor.download = resolvedFileName
          document.body.appendChild(anchor)
          anchor.click()
          anchor.remove()
          window.URL.revokeObjectURL(url)
        })
        .catch((error) => {
          console.error('Erro ao baixar o anexo:', error)
          this.showToast('Falha ao baixar anexo', 'error')
        })
    },
    showToast(message, color = 'success') {
      this.snackbar.text = message;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },
    onIncomeAmountInput(value) {
      this.income.amount = sanitizeCurrencyInput(value)
    },
    onExpenseAmountInput(value) {
      this.expense.amount = sanitizeCurrencyInput(value)
    },
    requiredAmount(value) {
      return !!sanitizeCurrencyInput(value) || this.$t('validation.required', { field: this.$t('common.amount') })
    },
    validCurrencyFormat(value) {
      return parseCurrencyToNumber(value) !== null || this.$t('validation.invalid_currency')
    }
  }
}
</script>

<style scoped>
/* ── Form inputs ───────────────────────── */
.transaction-details-drawer {
  max-width: 100vw;
}

.transaction-details-drawer :deep(.v-navigation-drawer__content) {
  background: var(--cb-surface);
}

.transaction-details-panel {
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-height: 100%;
  padding: 22px;
}

.transaction-details-panel__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.transaction-details-panel__title-group {
  min-width: 0;
}

.transaction-details-panel__eyebrow {
  color: var(--cb-ink-muted);
  display: block;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  margin-bottom: 6px;
  text-transform: uppercase;
}

.transaction-details-panel__header h2 {
  color: var(--cb-ink);
  font-family: var(--cb-font-heading);
  font-size: 1.15rem;
  line-height: 1.25;
  margin: 0;
  overflow-wrap: anywhere;
}

.transaction-details-panel__date {
  color: var(--cb-ink-muted);
  display: inline-block;
  font-size: 0.82rem;
  margin-top: 6px;
}

.transaction-details-panel__amount {
  color: var(--cb-ink);
  font-family: var(--cb-font-heading);
  font-size: 1.45rem;
  font-weight: 850;
  line-height: 1.2;
  overflow-wrap: anywhere;
}

.transaction-details-panel__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.transaction-details-section {
  border-top: 1px solid rgba(23, 32, 51, 0.08);
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 16px;
}

.transaction-details-section__label {
  color: var(--cb-ink-muted);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.transaction-details-grid {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.transaction-details-field,
.transaction-details-list__row {
  background: rgba(23, 32, 51, 0.035);
  border: 1px solid rgba(23, 32, 51, 0.06);
  border-radius: 8px;
  padding: 10px;
}

.transaction-details-field span,
.transaction-details-list__row span {
  color: var(--cb-ink-muted);
  display: block;
  font-size: 0.72rem;
  font-weight: 700;
  margin-bottom: 4px;
}

.transaction-details-field strong,
.transaction-details-list__row strong {
  align-items: center;
  color: var(--cb-ink);
  display: inline-flex;
  gap: 6px;
  font-size: 0.88rem;
  font-weight: 750;
  line-height: 1.35;
  max-width: 100%;
  min-width: 0;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.transaction-details-list__row--action {
  align-items: center;
  display: flex;
  gap: 12px;
  justify-content: space-between;
}

.transaction-details-list__row--action > div {
  min-width: 0;
}

.transaction-details-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.transaction-details-note {
  background: rgba(23, 32, 51, 0.035);
  border-radius: 8px;
  color: var(--cb-ink-secondary);
  font-size: 0.82rem;
  line-height: 1.45;
  margin: 0;
  padding: 10px;
}

@media (max-width: 560px) {
  .transaction-details-drawer {
    width: 100vw !important;
  }

  .transaction-details-grid {
    grid-template-columns: 1fr;
  }

  .transaction-details-panel {
    padding: 18px;
  }

  .transaction-details-list__row--action {
    align-items: flex-start;
    flex-direction: column;
  }
}

.modern-input {
  margin-bottom: 4px;
}

.open-finance-field-note {
  color: var(--cb-ink-muted);
  font-size: 0.82rem;
  line-height: 1.35;
  margin: -2px 0 4px;
}

.modern-input :deep(.v-field) {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.modern-input :deep(.v-field--focused) {
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--cb-primary) 10%, transparent);
}

/* ── Snackbar ───────────────────────────── */
.modern-snackbar {
  border-radius: 8px;
}

.open-finance-ai-summary {
  margin-top: 4px;
  font-size: 0.78rem;
  color: var(--cb-accent);
}

.open-finance-ai-result {
  margin-top: 6px;
  font-size: 0.78rem;
  color: var(--cb-ink-muted);
}

.daily-consumption-report {
  background: var(--cb-surface-card);
  border: 1px solid var(--cb-border-card);
  border-radius: 8px;
  box-shadow: var(--cb-shadow-soft);
  margin-bottom: 12px;
  padding: 16px;
}

.daily-consumption-report__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
}

.daily-consumption-report__header p {
  color: var(--cb-ink-muted);
  font-size: 0.84rem;
  margin: 4px 0 0;
}

.daily-consumption-report__total {
  text-align: right;
  min-width: 148px;
}

.daily-consumption-report__total span {
  display: block;
  color: var(--cb-ink-muted);
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
}

.daily-consumption-report__total strong {
  color: var(--cb-ink);
  font-family: var(--cb-font-heading);
  font-size: 1.1rem;
}

.daily-consumption-report__rows {
  display: grid;
  gap: 6px;
}

.daily-consumption-report__row {
  align-items: center;
  background: color-mix(in srgb, var(--cb-surface-card) 92%, var(--cb-accent));
  border: 1px solid var(--cb-border-soft);
  border-radius: 8px;
  color: var(--cb-ink);
  cursor: default;
  display: grid;
  gap: 10px;
  grid-template-columns: minmax(92px, 0.9fr) minmax(120px, 1.2fr) minmax(150px, 1fr) minmax(96px, auto);
  padding: 10px 12px;
  text-align: left;
  width: 100%;
}

.daily-consumption-report__date,
.daily-consumption-report__row strong {
  font-family: var(--cb-font-heading);
  font-weight: 700;
}

.daily-consumption-report__category,
.daily-consumption-report__meta {
  color: var(--cb-ink-muted);
  font-size: 0.82rem;
  min-width: 0;
}

.daily-consumption-report__category {
  color: var(--cb-ink-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.daily-consumption-report__row strong {
  text-align: right;
}

.daily-consumption-report__empty {
  color: var(--cb-ink-muted);
  font-size: 0.88rem;
  margin: 0;
}

@media (max-width: 720px) {
  .daily-consumption-report__header {
    flex-direction: column;
  }

  .daily-consumption-report__total {
    text-align: left;
  }

  .daily-consumption-report__row {
    grid-template-columns: 1fr;
  }

  .daily-consumption-report__row strong {
    text-align: left;
  }
}

/* ── AI category suggestions ───────────── */
.ai-category-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.ai-category-row__meta {
  font-size: 0.9rem;
  color: var(--cb-ink-muted);
}

.ai-category-suggestion {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ai-category-suggestion__reasoning {
  color: var(--cb-ink-secondary);
}

.ai-category-suggestion__actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
</style>
