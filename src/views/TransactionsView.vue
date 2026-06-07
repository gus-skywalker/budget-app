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
            {{ $t('transactions.add_expense') || $t('expense.save') }}
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
          </div>
          <div style="display:flex;gap:8px">
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

      <!-- Transaction List Card -->
      <div class="cb-card">

        <!-- EXPENSE LIST -->
        <template v-if="activeTab === 'expense'">
          <v-list v-if="!isLoadingExpenses && filteredMonthlyExpenses.length" class="pa-0">
            <expense-item
              v-for="(item, index) in filteredMonthlyExpenses"
              :key="index"
              :expense="item"
              :alert-settings="alertSettings"
              :resolving-action="resolvingConflictId === item.reconciliationConflictId ? resolvingConflictAction : null"
              :ai-suggesting="aiSuggestingExpenseId === item.id"
              :has-suggestion-ready="Boolean(getStoredExpenseSuggestion(item.id))"
              :suggestion-details="getExpenseSuggestionDetails(item)"
              :is-applying-suggestion="applyingExpenseSuggestionId === item.id"
              @attachFiles="handleAttachFiles"
              @removeAttachment="handleRemoveAttachment"
              @downloadAttachment="handleDownloadAttachment"
              @sendReminder="handleSendReminder"
              @shareExpense="handleShareExpense"
              @agreementCreated="handleSharedAgreementCreated"
              @agreementUpdated="handleSharedAgreementUpdated"
              @agreementError="handleSharedAgreementError"
              @resolveConflict="handleResolveExpenseConflict"
              @suggestCategory="handleSuggestExpenseCategoryInline"
              @applySuggestion="applyStoredExpenseSuggestionInline"
              @openComments="openTransactionComments"
              @deleteExpense="deleteExpense"
              @togglePlanningExclusion="toggleExpensePlanningExclusion"
              @select="startEditingExpense"
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
              @select="startEditingIncome"
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
                    <template #prepend><v-icon :icon="categoryIcons[item.raw.code]" class="mr-2" /></template>
                  </v-list-item>
                </template>
                <template #selection="{ item, props }">
                  <v-chip v-bind="props" class="ma-1" small><v-icon left :icon="categoryIcons[item.raw.code]" />{{ item.raw.name }}</v-chip>
                </template>
              </v-select>
            </v-col>
            <v-col cols="12" sm="6">
              <v-select :label="$t('common.payment_method')" v-model="expense.paymentMethod" :items="paymentMethods" item-title="name" item-value="id" variant="outlined" density="comfortable" color="var(--cb-primary)" class="modern-input" />
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
      @update:visible="handleCommentsDialogVisibility"
      @submit="submitTransactionComment"
    />
  </div>
</template>

<script>
import IncomeItem from '../components/IncomeItem.vue'
import ExpenseItem from '../components/ExpenseItem.vue'
import TransactionCommentsDialog from '@/components/TransactionCommentsDialog.vue'
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
      isBatchSuggestingExpenseCategories: false,
      isApplyingBatchExpenseSuggestions: false,
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
      alertSettings: null,
      // --- drawer & tab state ---
      showFormDrawer: false,
      formMode: 'expense',
      activeTab: 'expense',
    }
  },
  computed: {
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
    uncategorizedSuggestionCount() {
      return this.uncategorizedExpenses.filter((expense) => Boolean(this.getStoredExpenseSuggestion(expense.id))).length
    },
    canApplyBatchExpenseSuggestions() {
      return this.uncategorizedExpenses.some((expense) => Boolean(this.getStoredExpenseSuggestion(expense.id)?.suggestedCategory?.id))
    },
    hasActiveExpenseDrillDown() {
      return Boolean(this.routeExpenseAccountId || this.routeExpenseCategory || this.expenseListFilter === 'open-finance')
    },
    activeExpenseCategoryName() {
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
    this.fetchAlertSettings();
    this.fetchOpenFinanceConflicts();
    this.fetchMonthlyIncomes();
    this.fetchMonthlyExpenses();
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
  },
  methods: {
    // --- drawer helpers ---
    openFormDrawer(mode) {
      this.formMode = mode || 'expense'
      this.showFormDrawer = true
    },
    closeFormDrawer() {
      this.showFormDrawer = false
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
        const matchesCategory = this.routeExpenseCategory
          ? item?.category === this.routeExpenseCategory
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

      return {
        date: normalizedDate,
        amount,
        description,
        category: categoryId,
        paymentMethod: paymentMethodId,
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
    getExpenseSuggestionDetails(expense) {
      const suggestion = this.getStoredExpenseSuggestion(expense?.id)
      const suggestedCategory = suggestion?.suggestedCategory
      if (!suggestedCategory?.id) {
        return null
      }

      const confidence = Number(suggestedCategory.confidence || 0)
      return {
        categoryName: this.translateCategoryLabel(suggestedCategory),
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
            this.showToast(this.$t('expense.ai_no_suggestion'), 'info')
            return
          }
          this.expenseCategorySuggestion = suggestion
        })
        .catch((error) => {
          console.error('Error suggesting expense category:', error)
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
          this.showToast(this.$t('expense.ai_suggestion_failed'), 'error')
        })
        .finally(() => {
          this.aiSuggestingExpenseId = null
        })
    },
    suggestUncategorizedExpensesInBatch() {
      if (!this.canUseAi) {
        this.showToast(this.$t('expense.ai_premium_locked'), 'info')
        this.$router.push({ name: 'choose-plan', query: { feature: 'ai' } })
        return
      }
      const candidates = this.uncategorizedExpenses
        .filter((expense) => expense?.description)
        .map((expense) => ({
          expenseId: expense.id,
          description: expense.description,
          amount: Number(expense.amount || 0),
          paymentMethodId: expense.paymentMethodId ?? this.resolvePaymentMethodId(expense.paymentMethod) ?? undefined,
          bankCategoryId: expense.openFinanceBankCategoryId ?? undefined,
        }))

      if (!candidates.length) {
        this.showToast(this.$t('expense.ai_no_pending_uncategorized'), 'info')
        return
      }

      this.isBatchSuggestingExpenseCategories = true
      AiService.autoCategorize({ expenses: candidates })
        .then(({ data }) => {
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

          if (!storedCount) {
            this.showToast(this.$t('expense.ai_no_suggestion'), 'info')
            return
          }

          this.showToast(this.$t('expense.ai_queue_suggestions_ready', { count: storedCount }), 'success')
        })
        .catch((error) => {
          console.error('Error suggesting uncategorized expenses in batch:', error)
          this.showToast(this.$t('expense.ai_suggestion_failed'), 'error')
        })
        .finally(() => {
          this.isBatchSuggestingExpenseCategories = false
        })
    },
    async applyBatchExpenseSuggestions() {
      const candidates = this.uncategorizedExpenses
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
            selectedUsers: [],
            accountId: expense.accountId ?? null,
          })
          appliedCount += 1
        }

        this.batchExpenseCategorySuggestions = {}
        this.showToast(this.$t('expense.ai_queue_apply_success', { count: appliedCount }), 'success')
        await this.fetchMonthlyExpenses()
      } catch (error) {
        console.error('Error applying batch expense suggestions:', error)
        this.showToast(this.$t('expense.ai_queue_apply_failed'), 'error')
      } finally {
        this.isApplyingBatchExpenseSuggestions = false
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
          selectedUsers: Array.isArray(expense.users) ? expense.users.map((user) => user.id ?? user.userId).filter(Boolean) : [],
          accountId: expense.accountId ?? null,
        })

        this.clearStoredExpenseSuggestion(expense.id)
        this.showToast(this.$t('expense.ai_feedback_accepted'), 'success')
        await this.fetchMonthlyExpenses()
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
            displayName: `${account.name} • ${account.provider} • ${account.currency}`
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
    fetchAlertSettings() {
      NotificationService.getAlertSettings()
        .then((response) => {
          this.alertSettings = response.data || null
        })
        .catch((error) => {
          console.error('Erro ao buscar configurações de alerta:', error)
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
        return ExpenseService.fetchMonthlyExpenses(monthNumber, yearNumber, this.expensePagination)
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
      ExpenseService.uploadAttachment(expenseId, files)
        .then((response) => {
          this.applyExpenseAttachments(expenseId, response?.data)
          this.showToast('Anexo salvo.', 'success')
        })
        .catch((error) => {
          console.error('Erro ao anexar arquivos:', error)
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
          const uploadResponse = await ExpenseService.uploadAttachment(expense.id, formData)
          this.applyExpenseAttachments(expense.id, uploadResponse?.data)
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
    },
    handleSharedAgreementError({ error }) {
      console.error('Erro ao criar combinado de divisão:', error)
      this.showToast('Falha ao criar combinado de divisão.', 'error')
    },
    handleRemoveAttachment({ expenseId, attachmentId }) {
      ExpenseService.removeAttachment(expenseId, attachmentId)
        .then(() => {
          const expenseIndex = this.monthlyExpenses.findIndex((item) => item.id === expenseId)
          if (expenseIndex !== -1) {
            const currentAttachments = Array.isArray(this.monthlyExpenses[expenseIndex].attachments)
              ? this.monthlyExpenses[expenseIndex].attachments
              : []
            this.monthlyExpenses[expenseIndex] = {
              ...this.monthlyExpenses[expenseIndex],
              attachments: currentAttachments.filter((attachment) => attachment.id !== attachmentId),
            }
          }
        })
        .catch(error => {
          console.error('Erro ao remover o anexo:', error)
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
    async handleSendReminder(alertData) {
      const userStore = useUserStore();

      const alarmData = {
        user: userStore.getUser,
        expense: alertData.expense,
        daysBefore: alertData.daysBefore,
        isRecurring: alertData.isRecurring,
        recurrenceInterval: alertData.recurrenceInterval,
        recurrenceEndDate: alertData.recurrenceEndDate,
      };

      try {

        if (alertData.expense.alerts && alertData.expense.alerts.length > 0) {

          await NotificationService.updateExpenseAlert(alarmData);
        } else {

          await NotificationService.scheduleExpenseAlert(alarmData);
        }
      } catch (error) {
        console.error('Erro ao processar o alerta:', error);
      }
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
.modern-input {
  margin-bottom: 4px;
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
