<template>
  <div class="budget-container">
    <v-container class="modern-container">
      <!-- Header -->
      <div class="budget-header">
        <h1 class="page-title">{{ $t('budget.title') }}</h1>
        <p class="page-subtitle">Gerencie suas receitas e despesas</p>
      </div>

      <v-row>
        <!-- Coluna Esquerda: Formulários de Entrada -->
      <v-col cols="12" md="6">
        <!-- Seção de Entradas -->
        <div class="modern-card income-section">
          <div class="card-header">
            <h2 class="card-title">
              <v-icon color="#11998e" class="mr-2">mdi-trending-up</v-icon>
              {{ $t('income.title') }}
            </h2>
          </div>
          <div class="card-content">
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field 
                  :label="$t('common.date')" 
                  type="date" 
                  v-model="income.date"
                  variant="outlined"
                  density="comfortable"
                  color="#667eea"
                  class="modern-input"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field 
                  :label="$t('common.amount')" 
                  type="text"
                  inputmode="decimal"
                  :model-value="income.amount"
                  @update:model-value="onIncomeAmountInput"
                  variant="outlined"
                  density="comfortable"
                  color="#667eea"
                  class="modern-input"
                  :rules="[
                    requiredAmount,
                    validCurrencyFormat
                  ]"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field 
                  :label="$t('common.description')" 
                  v-model="income.description"
                  variant="outlined"
                  density="comfortable"
                  color="#667eea"
                  class="modern-input"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-select 
                  :label="$t('common.payment_method')" 
                  v-model="income.paymentMethod" 
                  :items="paymentMethods"
                  item-title="name" 
                  item-value="id"
                  variant="outlined"
                  density="comfortable"
                  color="#667eea"
                  class="modern-input"
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-select
                  :label="$t('common.account')"
                  v-model="income.accountId"
                  :items="financialAccounts"
                  item-title="displayName"
                  item-value="id"
                  variant="outlined"
                  density="comfortable"
                  color="#667eea"
                  class="modern-input"
                  :disabled="isLoadingFinancialAccounts || !financialAccounts.length"
                  :hint="financialAccountsHint"
                  persistent-hint
                ></v-select>
              </v-col>
            </v-row>
            <v-btn 
              color="primary" 
              @click="saveIncome"
              class="modern-btn gradient-btn mt-2"
              size="large"
              block
            >
              <v-icon left>mdi-content-save</v-icon>
              {{ isEditingIncome ? $t('income.update') : $t('income.save') }}
            </v-btn>
            <v-btn
              v-if="isEditingIncome"
              class="modern-btn mt-2"
              variant="tonal"
              color="grey"
              size="large"
              block
              @click="cancelIncomeEdit"
            >
              <v-icon left>mdi-cancel</v-icon>
              {{ $t('common.cancel_edit') }}
            </v-btn>
          </div>
        </div>

        <!-- Lista de Entradas Mensais -->
        <div class="modern-card income-list-section">
          <div class="card-header">
            <h2 class="card-title">
              <v-icon color="#11998e" class="mr-2">mdi-format-list-bulleted</v-icon>
              {{ $t('income.monthly_title') }}
            </h2>
          </div>
          <div class="card-content">
            <v-row align="center" class="mb-4">
              <v-col cols="8">
                <v-select 
                  :label="$t('common.select_month')" 
                  v-model="selectedIncomeMonth"
                  @update:model-value="resetIncomePaginationAndFetch" 
                  :items="months" 
                  item-title="name"
                  item-value="value"
                  variant="outlined"
                  density="comfortable"
                  color="#667eea"
                  class="modern-input"
                ></v-select>
              </v-col>
              <v-col cols="4">
                <v-select 
                  :label="$t('common.year')" 
                  v-model="selectedIncomeYear"
                  @update:model-value="resetIncomePaginationAndFetch" 
                  :items="years"
                  variant="outlined"
                  density="comfortable"
                  color="#667eea"
                  class="modern-input"
                ></v-select>
              </v-col>
            </v-row>
            <div v-if="hasActiveExpenseDrillDown" class="budget-drilldown-banner">
              <div class="budget-drilldown-banner__content">
                <v-icon color="#667eea">mdi-tune-vertical</v-icon>
                <span>
                  Filtro aplicado:
                  <strong v-if="activeExpenseCategoryName">{{ activeExpenseCategoryName }}</strong>
                  <strong v-if="activeExpenseCategoryName && activeExpenseAccountName"> • </strong>
                  <strong v-if="activeExpenseAccountName">{{ activeExpenseAccountName }}</strong>
                  <strong v-if="(activeExpenseCategoryName || activeExpenseAccountName) && activeExpenseFilterLabel"> • </strong>
                  <strong v-if="activeExpenseFilterLabel">{{ activeExpenseFilterLabel }}</strong>
                </span>
              </div>
              <v-btn size="small" variant="text" @click="clearExpenseDrillDown">Limpar</v-btn>
            </div>
            <div class="transaction-filter-row">
              <v-chip-group v-model="incomeListFilter" mandatory selected-class="filter-chip-selected">
                <v-chip size="small" value="all" variant="outlined">Todas</v-chip>
                <v-chip size="small" value="open-finance" variant="outlined">Open Finance</v-chip>
                <v-chip size="small" value="conflicts" variant="outlined">Conflitos</v-chip>
              </v-chip-group>
            </div>
            <div class="list-wrapper">
              <v-list v-if="!isLoadingIncomes && filteredMonthlyIncomes.length" class="modern-list">
                <income-item 
                  v-for="(income, index) in filteredMonthlyIncomes" 
                  :key="index" 
                  :income="income"
                  :resolving-action="resolvingConflictId === income.reconciliationConflictId ? resolvingConflictAction : null"
                  @toggle-recurring="toggleRecurring" 
                  @deleteIncome="deleteIncome"
                  @resolveConflict="handleResolveIncomeConflict"
                  @select="startEditingIncome"
                ></income-item>
              </v-list>
              <div v-else-if="!isLoadingIncomes" class="empty-state">
                <v-icon size="48" color="#667eea" class="mb-3">mdi-inbox</v-icon>
                <p class="empty-message">{{ incomeEmptyMessage }}</p>
              </div>
              <div v-else class="loading-state">
                <v-progress-circular indeterminate color="#667eea" size="48"></v-progress-circular>
              </div>
            </div>
            <div v-if="incomePagination.total > incomePagination.limit" class="pagination-row">
              <span class="pagination-label">{{ incomeRangeLabel }}</span>
              <div class="pagination-actions">
                <v-btn
                  icon
                  size="small"
                  variant="text"
                  :disabled="!canGoToPreviousIncomePage"
                  @click="goToPreviousIncomePage"
                >
                  <v-icon>mdi-chevron-left</v-icon>
                </v-btn>
                <v-btn
                  icon
                  size="small"
                  variant="text"
                  :disabled="!canGoToNextIncomePage"
                  @click="goToNextIncomePage"
                >
                  <v-icon>mdi-chevron-right</v-icon>
                </v-btn>
              </div>
            </div>
          </div>
        </div>
      </v-col>

      <!-- Coluna Direita: Listas de Entrada e Débitos -->
      <v-col cols="12" md="6">
        <!-- Seção de Débitos -->
        <div class="modern-card expense-section">
          <div class="card-header">
            <h2 class="card-title">
              <v-icon color="#eb3349" class="mr-2">mdi-trending-down</v-icon>
              {{ $t('expense.title') }}
            </h2>
          </div>
          <div class="card-content">
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field 
                  :label="$t('common.date')" 
                  type="date" 
                  v-model="expense.date"
                  variant="outlined"
                  density="comfortable"
                  color="#667eea"
                  class="modern-input"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field 
                  :label="$t('common.amount')" 
                  type="text"
                  inputmode="decimal"
                  :model-value="expense.amount"
                  @update:model-value="onExpenseAmountInput"
                  variant="outlined"
                  density="comfortable"
                  color="#667eea"
                  class="modern-input"
                  :rules="[
                    requiredAmount,
                    validCurrencyFormat
                  ]"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field 
                  :label="$t('common.description')" 
                  v-model="expense.description"
                  variant="outlined"
                  density="comfortable"
                  color="#667eea"
                  class="modern-input"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-select 
                  :label="$t('common.category')" 
                  v-model="expense.category" 
                  :items="categories"
                  item-title="name" 
                  item-value="id"
                  variant="outlined"
                  density="comfortable"
                  color="#667eea"
                  class="modern-input"
                >
                  <template #item="{ item, props }">
                    <v-list-item v-bind="props">
                      <template #prepend>
                        <v-icon :icon="categoryIcons[item.raw.code]" class="mr-2"></v-icon>
                      </template>
                    </v-list-item>
                  </template>
                  <template #selection="{ item, props }">
                    <v-chip v-bind="props" class="ma-1" small>
                      <v-icon left :icon="categoryIcons[item.raw.code]"></v-icon>
                      {{ item.raw.name }}
                    </v-chip>
                  </template>
                </v-select>
              </v-col>
              <v-col cols="12" sm="6">
                <v-select 
                  :label="$t('common.payment_method')" 
                  v-model="expense.paymentMethod" 
                  :items="paymentMethods"
                  item-title="name" 
                  item-value="id"
                  variant="outlined"
                  density="comfortable"
                  color="#667eea"
                  class="modern-input"
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6">
                <v-select
                  :label="$t('common.account')"
                  v-model="expense.accountId"
                  :items="financialAccounts"
                  item-title="displayName"
                  item-value="id"
                  variant="outlined"
                  density="comfortable"
                  color="#667eea"
                  class="modern-input"
                  :disabled="isLoadingFinancialAccounts || !financialAccounts.length"
                  :hint="financialAccountsHint"
                  persistent-hint
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-select 
                  :label="$t('expense.share_with_members')" 
                  v-model="expense.selectedUsers" 
                  :items="users"
                  item-title="name" 
                  item-value="id" 
                  multiple
                  variant="outlined"
                  density="comfortable"
                  color="#667eea"
                  class="modern-input"
                  :disabled="!users.length"
                ></v-select>
              </v-col>
            </v-row>
            <v-btn 
              color="primary" 
              @click="saveExpense"
              class="modern-btn gradient-btn mt-2"
              size="large"
              block
            >
              <v-icon left>mdi-content-save</v-icon>
              {{ isEditingExpense ? $t('expense.update') : $t('expense.save') }}
            </v-btn>
            <v-btn
              v-if="isEditingExpense"
              class="modern-btn mt-2"
              variant="tonal"
              color="grey"
              size="large"
              block
              @click="cancelExpenseEdit"
            >
              <v-icon left>mdi-cancel</v-icon>
              {{ $t('common.cancel_edit') }}
            </v-btn>
          </div>
        </div>

        <!-- Lista de Débitos Mensais -->
        <div class="modern-card expense-list-section">
          <div class="card-header">
            <h2 class="card-title">
              <v-icon color="#eb3349" class="mr-2">mdi-format-list-bulleted</v-icon>
              {{ $t('expense.monthly_title') }}
            </h2>
          </div>
          <div class="card-content">
            <v-row align="center" class="mb-4">
              <v-col cols="8">
                <v-select 
                  :label="$t('common.select_month')" 
                  v-model="selectedExpenseMonth"
                  @update:model-value="resetExpensePaginationAndFetch" 
                  :items="months" 
                  item-title="name"
                  item-value="value"
                  variant="outlined"
                  density="comfortable"
                  color="#667eea"
                  class="modern-input"
                ></v-select>
              </v-col>
              <v-col cols="4">
                <v-select 
                  :label="$t('common.year')" 
                  v-model="selectedExpenseYear"
                  @update:model-value="resetExpensePaginationAndFetch" 
                  :items="years"
                  variant="outlined"
                  density="comfortable"
                  color="#667eea"
                  class="modern-input"
                ></v-select>
              </v-col>
            </v-row>
            <div class="transaction-filter-row">
              <v-chip-group v-model="expenseListFilter" mandatory selected-class="filter-chip-selected">
                <v-chip size="small" value="all" variant="outlined">Todas</v-chip>
                <v-chip size="small" value="open-finance" variant="outlined">Open Finance</v-chip>
                <v-chip size="small" value="conflicts" variant="outlined">Conflitos</v-chip>
              </v-chip-group>
            </div>
            <div class="list-wrapper">
              <v-list v-if="!isLoadingExpenses && filteredMonthlyExpenses.length" class="modern-list">
                <expense-item 
                  v-for="(expense, index) in filteredMonthlyExpenses" 
                  :key="index" 
                  :expense="expense"
                  :alert-settings="alertSettings"
                  :resolving-action="resolvingConflictId === expense.reconciliationConflictId ? resolvingConflictAction : null"
                  @attachFiles="handleAttachFiles" 
                  @removeAttachment="handleRemoveAttachment"
                  @downloadAttachment="handleDownloadAttachment"
                  @sendReminder="handleSendReminder"
                  @shareExpense="handleShareExpense"
                  @resolveConflict="handleResolveExpenseConflict"
                  @deleteExpense="deleteExpense"
                  @select="startEditingExpense"
                ></expense-item>
              </v-list>
              <div v-else-if="!isLoadingExpenses" class="empty-state">
                <v-icon size="48" color="#667eea" class="mb-3">mdi-inbox</v-icon>
                <p class="empty-message">{{ expenseEmptyMessage }}</p>
              </div>
              <div v-else class="loading-state">
                <v-progress-circular indeterminate color="#667eea" size="48"></v-progress-circular>
              </div>
            </div>
            <div v-if="expensePagination.total > expensePagination.limit" class="pagination-row">
              <span class="pagination-label">{{ expenseRangeLabel }}</span>
              <div class="pagination-actions">
                <v-btn
                  icon
                  size="small"
                  variant="text"
                  :disabled="!canGoToPreviousExpensePage"
                  @click="goToPreviousExpensePage"
                >
                  <v-icon>mdi-chevron-left</v-icon>
                </v-btn>
                <v-btn
                  icon
                  size="small"
                  variant="text"
                  :disabled="!canGoToNextExpensePage"
                  @click="goToNextExpensePage"
                >
                  <v-icon>mdi-chevron-right</v-icon>
                </v-btn>
              </div>
            </div>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Snackbar -->
    <v-snackbar 
      v-model="snackbar.show" 
      :color="snackbar.color" 
      timeout="3000" 
      top
      class="modern-snackbar"
    >
      {{ snackbar.text }}
      <template #actions>
        <v-btn color="white" variant="text" @click="snackbar.show = false">
          {{ $t('common.close') }}
        </v-btn>
      </template>
    </v-snackbar>
    </v-container>
  </div>
</template>

<script>
import IncomeItem from '../components/IncomeItem.vue'
import ExpenseItem from '../components/ExpenseItem.vue'
import IncomeService from '@/services/IncomeService'
import ExpenseService from '@/services/ExpenseService'
import OpenFinanceService from '@/services/OpenFinanceService'
import DataService from '@/services/DataService'
import FinancialReadService, { NO_FINANCIAL_ACCOUNT_ERROR_MESSAGE } from '@/services/FinancialReadService'
import UsersService from '@/services/UsersService'
import CompanyService from '@/services/CompanyService'
import NotificationService from '@/services/NotificationService'
import { useUserStore } from '@/plugins/userStore'

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
      },
      expense: {
        date: today,
        amount: '0',
        description: '',
        category: null,
        paymentMethod: null,
        selectedUsers: [],
        accountId: null,
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
      isLoadingFinancialAccounts: false,
      selectedIncomeMonth: currentMonth,
      selectedExpenseMonth: currentMonth,
      selectedIncomeYear: currentYear,
      selectedExpenseYear: currentYear,
        selectedLanguage: this.$i18n?.locale || 'pt',
      users: [],
      openFinanceConflicts: [],
      resolvingConflictId: null,
      resolvingConflictAction: null,
      routeExpenseAccountId: null,
      routeExpenseCategory: null,
      months: [
        { name: 'Janeiro', value: 1 },
        { name: 'Fevereiro', value: 2 },
        { name: 'Março', value: 3 },
        { name: 'Abril', value: 4 },
        { name: 'Maio', value: 5 },
        { name: 'Junho', value: 6 },
        { name: 'Julho', value: 7 },
        { name: 'Agosto', value: 8 },
        { name: 'Setembro', value: 9 },
        { name: 'Outubro', value: 10 },
        { name: 'Novembro', value: 11 },
        { name: 'Dezembro', value: 12 }
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
      snackbar: {
        show: false,
        text: '',
        color: 'success',
      },
      alertSettings: null,
    }
  },
  computed: {
    financialAccountsHint() {
      return this.financialAccounts.length
        ? this.$t('common.account_hint')
        : this.$t('validation.account_required')
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
      return this.applyExpenseDrillDown(this.applyTransactionFilter(this.monthlyExpenses, this.expenseListFilter))
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
      return this.expenseListFilter === 'open-finance' ? 'Somente Open Finance' : null
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
        return 'Nenhuma entrada Open Finance neste período.'
      }
      return 'Nenhum conflito de reconciliação em entradas neste período.'
    },
    expenseEmptyMessage() {
      if (this.expenseListFilter === 'all') {
        return this.$t('expense.no_entries')
      }
      if (this.expenseListFilter === 'open-finance') {
        return 'Nenhuma despesa Open Finance neste período.'
      }
      return 'Nenhum conflito de reconciliação em despesas neste período.'
    },
  },
  mounted() {
    this.applyBudgetQueryFilters();
    this.fetchCategories();
    this.fetchPaymentMethods();
    this.fetchFinancialAccounts();
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
        this.applyBudgetQueryFilters()
        this.resetExpensePaginationAndFetch()
      },
      deep: true,
    },
  },
  methods: {
    applyTransactionFilter(items, filter) {
      if (!Array.isArray(items)) {
        return []
      }
      if (filter === 'open-finance') {
        return items.filter((item) => Boolean(item?.openFinance))
      }
      if (filter === 'conflicts') {
        return items.filter((item) => item?.reconciliationStatus === 'CONFLICT_DUPLICATE')
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

      if (Number.isInteger(month) && month >= 1 && month <= 12) {
        this.selectedExpenseMonth = month
      }

      if (Number.isInteger(year) && year >= 2000 && year <= 2100) {
        this.selectedExpenseYear = year
      }

      this.routeExpenseAccountId = typeof query.accountId === 'string' ? query.accountId : null
      this.routeExpenseCategory = typeof query.category === 'string' ? query.category : null
      this.expenseListFilter = query.openFinance === '1' ? 'open-finance' : 'all'
    },
    clearExpenseDrillDown() {
      this.$router.replace({
        name: 'budget',
        query: {
          month: String(this.selectedExpenseMonth),
          year: String(this.selectedExpenseYear),
        },
      })
    },
    enrichExpenseWithConflict(expense) {
      const conflict = this.openFinanceConflictMap[expense?.id]
      return {
        ...expense,
        reconciliationConflictId: conflict?.id ?? null,
        reconciliationConflictReason: expense?.reconciliationConflictReason || conflict?.conflictReason || null,
      }
    },
    enrichIncomeWithConflict(income) {
      const conflict = this.openFinanceConflictMap[income?.id]
      return {
        ...income,
        reconciliationConflictId: conflict?.id ?? null,
        reconciliationConflictReason: income?.reconciliationConflictReason || conflict?.conflictReason || null,
      }
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
      const { description, isRecurring, accountId } = this.income
      return {
        date: normalizedDate,
        amount,
        description,
        paymentMethod: paymentMethodId,
        isRecurring,
        accountId,
      }
    },
    buildExpensePayload({ normalizedDate, categoryId, paymentMethodId, amount }) {
      const {
        description,
        selectedUsers = [],
        accountId,
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
      }
    },
        resolvePaymentMethodId(value) {
          const logAndReturn = (resolved) => {
            console.debug('[BudgetView] resolvePaymentMethodId', { input: value, resolved })
            return resolved
          }

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
          const logAndReturn = (resolved) => {
            console.debug('[BudgetView] resolveCategoryId', { input: value, resolved })
            return resolved
          }

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
      const language = this.$i18n?.locale || this.selectedLanguage || 'pt'
      this.selectedLanguage = language
      DataService.fetchCategories(language)
        .then((response) => {
          const categories = this.normalizeCollection(response?.data)
          this.categories = categories
            .map((category) => {
              const code = String(category?.code || '').trim()
              const id = category?.id ?? null
              if (!code || id === null || id === undefined) {
                return null
              }

              const translationKey = `categories.${code}`
            const translatedName = this.$t(translationKey)
            const isTranslated = translatedName !== translationKey
              return {
                id,
                code,
                name: isTranslated ? translatedName : (category?.name || code)
              }
            })
            .filter((category) => Boolean(category))
          console.log(this.categories);
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
    fetchFinancialAccounts() {
      this.isLoadingFinancialAccounts = true
      FinancialReadService.fetchAccounts()
        .then((response) => {
          this.financialAccounts = (response.data || []).map((account) => ({
            ...account,
            displayName: `${account.name} • ${account.provider} • ${account.currency}`
          }))
          this.applyDefaultFinancialAccount()
        })
        .catch((error) => {
          console.error('Error fetching financial accounts:', error)
          this.financialAccounts = []
        })
        .finally(() => {
          this.isLoadingFinancialAccounts = false
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
      const companyId = userStore.getCurrentCompanyId
      const isTenantMode = userStore.isTenantMode

      if (!(isTenantMode && companyId)) {
        this.users = []
        return
      }

      CompanyService.listMembers(companyId)
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
          console.error('Erro ao buscar membros da empresa:', error)
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

      console.info('[BudgetView] saveIncome', {
        isEditing,
        id: this.editingIncomeId,
        payload
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
            console.error('[BudgetView] saveIncome response error', error.response.data)
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

      console.info('[BudgetView] saveExpense', {
        isEditing,
        id: this.editingExpenseId,
        payload
      })

      const request = isEditing
        ? ExpenseService.update(this.editingExpenseId, payload)
        : ExpenseService.create(payload)

      request
        .then(() => {
          if (isEditing) {
            this.showToast(this.$t('expense.updated_successfully'), 'success')
          } else {
            this.showToast(this.$t('expense.saved_successfully'), 'success')
          }
          this.resetExpenseForm()
          this.fetchMonthlyExpenses()
        })
        .catch((error) => {
          console.error('Error saving expense:', error)
          if (error?.response) {
            console.error('[BudgetView] saveExpense response error', error.response.data)
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
      }
      this.isEditingIncome = false
      this.editingIncomeId = null
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
      }
      this.isEditingExpense = false
      this.editingExpenseId = null
      this.editingExpenseOriginal = null
    },
    toggleRecurring({ income, months }) {
      console.log('Toggled income:', income)
      console.log('Recurrence months:', months)
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
    deleteExpense(expense) {
      if (confirm('Are you sure you want to delete this expense?')) {
        ExpenseService.delete(expense.id)
          .then(() => {
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
    startEditingIncome(income) {
      console.debug('[BudgetView] startEditingIncome', income)
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
      }
    },
    cancelIncomeEdit() {
      this.resetIncomeForm()
    },
    startEditingExpense(expense) {
      console.debug('[BudgetView] startEditingExpense', expense)
      try {
        this.editingExpenseOriginal = JSON.parse(JSON.stringify(expense))
      } catch (parseError) {
        console.warn('[BudgetView] Failed to snapshot original expense, falling back to shallow copy.', parseError)
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
      }

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
    handleResolveExpenseConflict({ expense, action }) {
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
      ExpenseService.uploadAttachment(expenseId, files, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const total = progressEvent.total || 1
          const progress = Math.round((progressEvent.loaded * 100) / total)
          console.log('Upload Progress: ' + progress + '%')
        },
      })
        .then((response) => {
          console.log('Arquivos anexados com sucesso')
          const updatedAttachments = Array.isArray(response?.data) ? response.data : []
          const expenseIndex = this.monthlyExpenses.findIndex((item) => item.id === expenseId)
          if (expenseIndex !== -1) {
            this.monthlyExpenses[expenseIndex] = {
              ...this.monthlyExpenses[expenseIndex],
              attachments: updatedAttachments,
            }
          }
        })
        .catch((error) => {
          console.error('Erro ao anexar arquivos:', error)
        })
    },
    handleShareExpense({ expense, email }) {
      const userStore = useUserStore();

      if (!email) {
        console.warn('Email não informado');
        return;
      }

      // Preparar os dados para o e-mail
      const emailData = {
        user: {
          email: userStore.getUser.email,
          name: userStore.getUser.username,
        },
        expense: expense,
        destinationEmail: email,
      };

      // Enviar o e-mail
      NotificationService.sendEmailWithAttachment(emailData)
        .then(() => {
          console.log('Email enviado com sucesso');
        })
        .catch((error) => {
          console.error('Erro ao enviar o email:', error);
        });
    },
    handleRemoveAttachment({ expenseId, attachmentId }) {
      ExpenseService.removeAttachment(expenseId, attachmentId)
        .then(() => {
          console.log('Anexo removido com sucesso.')
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

      console.log(alertData.isRecurring);
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
          console.log('Alerta atualizado com sucesso');
        } else {

          await NotificationService.scheduleExpenseAlert(alarmData);
          console.log('Alerta criado com sucesso');
        }
      } catch (error) {
        console.error('Erro ao processar o alerta:', error);
      }
      console.log(`Lembrete processado para a despesa: ${alertData.expense.description}`);
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
.budget-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8eaf0 100%);
  padding: 32px 0;
}

.v-theme--dark .budget-container {
  background: linear-gradient(135deg, #1e1e1e 0%, #141414 100%);
}

.modern-container {
  max-width: 1400px;
  padding-left: 16px;
  padding-right: 16px;
}

@media (min-width: 600px) {
  .modern-container {
    padding-left: 24px;
    padding-right: 24px;
  }
}

/* Header */
.budget-header {
  margin-bottom: 32px;
  padding: 0 8px;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.v-theme--dark .page-title {
  color: #ffffff;
}

.page-subtitle {
  font-size: 1.1rem;
  color: #666;
  margin: 0;
}

.v-theme--dark .page-subtitle {
  color: #b0b0b0;
}

/* Modern Cards */
.modern-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.v-theme--dark .modern-card {
  background: #2a2a2a;
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.modern-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.v-theme--dark .modern-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
}

.budget-drilldown-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  background: rgba(102, 126, 234, 0.08);
  border: 1px solid rgba(102, 126, 234, 0.18);
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.budget-drilldown-banner__content {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #334155;
}

.v-theme--dark .budget-drilldown-banner {
  background: rgba(102, 126, 234, 0.12);
  border-color: rgba(148, 163, 184, 0.28);
}

.v-theme--dark .budget-drilldown-banner__content {
  color: #e2e8f0;
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
  font-size: 1.35rem;
  font-weight: 600;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  margin: 0;
}

.v-theme--dark .card-title {
  color: #ffffff;
}

.card-content {
  padding: 24px;
}

/* Inputs Modernos */
.modern-input {
  margin-bottom: 4px;
}

.modern-input :deep(.v-field) {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.modern-input :deep(.v-field--focused) {
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* Botões Modernos */
.modern-btn {
  border-radius: 8px;
  text-transform: none;
  font-weight: 600;
  letter-spacing: 0.3px;
  transition: all 0.3s ease;
}

.gradient-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  color: white !important;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.gradient-btn:hover {
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  transform: translateY(-2px);
}

/* List Wrapper */
.list-wrapper {
  min-height: 200px;
  max-height: 400px;
  overflow-y: auto;
  border-radius: 8px;
  background: rgba(102, 126, 234, 0.02);
  padding: 8px;
}

.list-wrapper::-webkit-scrollbar {
  width: 8px;
}

.list-wrapper::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

.list-wrapper::-webkit-scrollbar-thumb {
  background: rgba(102, 126, 234, 0.3);
  border-radius: 4px;
}

.list-wrapper::-webkit-scrollbar-thumb:hover {
  background: rgba(102, 126, 234, 0.5);
}

.modern-list {
  background: transparent;
  padding: 0;
}

.transaction-filter-row {
  margin-bottom: 12px;
}

.filter-chip-selected {
  background: rgba(102, 126, 234, 0.14) !important;
  color: #667eea !important;
}

.pagination-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 16px;
}

.pagination-label {
  font-size: 0.9rem;
  color: #666;
}

.v-theme--dark .pagination-label {
  color: #b0b0b0;
}

.pagination-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-message {
  font-size: 1rem;
  color: #666;
  margin: 0;
}

.v-theme--dark .empty-message {
  color: #b0b0b0;
}

/* Loading State */
.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 20px;
}

/* Section Specific Colors */
.income-section .card-header {
  background: rgba(17, 153, 142, 0.05);
}

.expense-section .card-header {
  background: rgba(235, 51, 73, 0.05);
}

/* Snackbar */
.modern-snackbar {
  border-radius: 8px;
}

/* Responsive */
@media (max-width: 960px) {
  .budget-header {
    margin-bottom: 24px;
  }

  .page-title {
    font-size: 2rem;
  }

  .card-content {
    padding: 20px;
  }
}

@media (max-width: 600px) {
  .budget-container {
    padding: 20px 0;
  }

  .page-title {
    font-size: 1.75rem;
  }

  .page-subtitle {
    font-size: 1rem;
  }

  .card-header {
    padding: 16px 20px;
  }

  .card-title {
    font-size: 1.2rem;
  }

  .card-content {
    padding: 16px;
  }

  .list-wrapper {
    max-height: 300px;
  }
}
</style>
