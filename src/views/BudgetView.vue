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
                  type="number" 
                  v-model="income.amount" 
                  variant="outlined"
                  density="comfortable"
                  color="#667eea"
                  class="modern-input"
                  :rules="[
                    (value) => !!value || $t('validation.required', { field: $t('common.amount') }),
                    (value) => /^\d+(\.\d{1,2})?$/.test(value) || $t('validation.invalid_currency')
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
                  @update:model-value="fetchMonthlyIncomes" 
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
                  @update:model-value="fetchMonthlyIncomes" 
                  :items="years"
                  variant="outlined"
                  density="comfortable"
                  color="#667eea"
                  class="modern-input"
                ></v-select>
              </v-col>
            </v-row>
            <div class="list-wrapper">
              <v-list v-if="!isLoadingIncomes && monthlyIncomes.length" class="modern-list">
                <income-item 
                  v-for="(income, index) in monthlyIncomes" 
                  :key="index" 
                  :income="income"
                  @toggle-recurring="toggleRecurring" 
                  @deleteIncome="deleteIncome"
                  @select="startEditingIncome"
                ></income-item>
              </v-list>
              <div v-else-if="!isLoadingIncomes" class="empty-state">
                <v-icon size="48" color="#667eea" class="mb-3">mdi-inbox</v-icon>
                <p class="empty-message">{{ $t('income.no_entries') }}</p>
              </div>
              <div v-else class="loading-state">
                <v-progress-circular indeterminate color="#667eea" size="48"></v-progress-circular>
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
                  type="number" 
                  v-model="expense.amount"
                  variant="outlined"
                  density="comfortable"
                  color="#667eea"
                  class="modern-input"
                  :rules="[
                    (value) => !!value || $t('validation.required', { field: $t('common.amount') }),
                    (value) => /^\d+(\.\d{1,2})?$/.test(value) || $t('validation.invalid_currency')
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
              <v-col cols="12">
                <v-select 
                  :label="$t('common.select_group')" 
                  v-model="selectedGroup" 
                  :items="groups" 
                  item-title="name"
                  item-value="id" 
                  @update:model-value="fetchGroupMembers"
                  variant="outlined"
                  density="comfortable"
                  color="#667eea"
                  class="modern-input"
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-select 
                  :label="$t('expense.share_with_group')" 
                  v-model="expense.selectedUsers" 
                  :items="users"
                  item-title="name" 
                  item-value="id" 
                  multiple
                  variant="outlined"
                  density="comfortable"
                  color="#667eea"
                  class="modern-input"
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
                  @update:model-value="fetchMonthlyExpenses" 
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
                  @update:model-value="fetchMonthlyExpenses" 
                  :items="years"
                  variant="outlined"
                  density="comfortable"
                  color="#667eea"
                  class="modern-input"
                ></v-select>
              </v-col>
            </v-row>
            <div class="list-wrapper">
              <v-list v-if="!isLoadingExpenses && monthlyExpenses.length" class="modern-list">
                <expense-item 
                  v-for="(expense, index) in monthlyExpenses" 
                  :key="index" 
                  :expense="expense"
                  @attachFiles="handleAttachFiles" 
                  @removeAttachment="handleRemoveAttachment"
                  @sendReminder="handleSendReminder" 
                  @shareExpense="handleShareExpense"
                  @deleteExpense="deleteExpense"
                  @select="startEditingExpense"
                ></expense-item>
              </v-list>
              <div v-else-if="!isLoadingExpenses" class="empty-state">
                <v-icon size="48" color="#667eea" class="mb-3">mdi-inbox</v-icon>
                <p class="empty-message">{{ $t('expense.no_entries') }}</p>
              </div>
              <div v-else class="loading-state">
                <v-progress-circular indeterminate color="#667eea" size="48"></v-progress-circular>
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
import DataService from '@/services/DataService'
import UsersService from '@/services/UsersService'
import GroupService from '@/services/GroupService'
import NotificationService from '@/services/NotificationService'
import { useUserStore } from '@/plugins/userStore'

export default {
  components: {
    IncomeItem,
    ExpenseItem,
  },
  data() {
    // const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 2026 - 2020 + 1 }, (v, i) => 2020 + i);

    return {
      income: {
        date: '',
        amount: 0,
        description: '',
        paymentMethod: null,
        isRecurring: false
      },
      expense: {
        date: '',
        amount: 0,
        description: '',
        category: null,
        paymentMethod: null,
        selectedUsers: []
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
      selectedIncomeMonth: null,
      selectedExpenseMonth: null,
      selectedIncomeYear: new Date().getFullYear(),
      selectedExpenseYear: new Date().getFullYear(),
  selectedLanguage: this.$i18n?.locale || 'pt',
      groups: [],
      selectedGroup: null,
      users: [],
      isLoadingMembers: false,
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
      isLoadingIncomes: false,
      isLoadingExpenses: false,
      isEditingIncome: false,
      editingIncomeId: null,
      isEditingExpense: false,
      editingExpenseId: null,
      editingExpenseOriginal: null,
      previousSelectedGroup: undefined,
      snackbar: {
        show: false,
        text: '',
        color: 'success',
      },
    }
  },
  mounted() {
    this.fetchCategories();
    this.fetchPaymentMethods();
    // this.fetchUsers();
    this.fetchGroups();
  },
  watch: {
    selectedGroup(newGroup, oldGroup) {
      if (newGroup !== oldGroup) {
        this.fetchGroupMembers()
      }
    },
    '$i18n.locale'(newLocale) {
      if (newLocale && newLocale !== this.selectedLanguage) {
        this.selectedLanguage = newLocale
        this.fetchCategories()
        this.fetchPaymentMethods()
      }
    }
  },
  methods: {
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
    buildIncomePayload({ normalizedDate, paymentMethodId, isEditing }) {
      const { amount, description, isRecurring } = this.income

      const payload = {
        date: normalizedDate,
        amount,
        description,
        isRecurring,
        paymentMethodId,
        paymentMethod: this.createReferenceObject(paymentMethodId)
      }

      if (isEditing) {
        payload.id = this.editingIncomeId
      }

      return payload
    },
    buildExpensePayload({ normalizedDate, categoryId, paymentMethodId, isEditing }) {
      const {
        amount,
        description,
        selectedUsers = []
      } = this.expense

      const sanitizedSelectedUsers = Array.isArray(selectedUsers) ? [...selectedUsers] : []
      const groupId = this.selectedGroup ?? this.editingExpenseOriginal?.groupId ?? null

      if (isEditing) {
        const payload = {
          id: this.editingExpenseId,
          date: normalizedDate,
          amount,
          description,
          category: this.createReferenceObject(categoryId),
          paymentMethod: this.createReferenceObject(paymentMethodId),
          selectedUsers: sanitizedSelectedUsers
        }

        if (groupId) {
          payload.group = this.createReferenceObject(groupId)
        }

        return payload
      }

      const payload = {
        date: normalizedDate,
        amount,
        description,
        category: categoryId,
        paymentMethod: paymentMethodId,
        selectedUsers: sanitizedSelectedUsers
      }

      if (groupId) {
        payload.groupId = groupId
      }

      return payload
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
        createReferenceObject(id) {
          if (id === null || id === undefined) {
            return null
          }
          return { id }
        },
    fetchCategories() {
      const language = this.$i18n?.locale || this.selectedLanguage || 'pt'
      this.selectedLanguage = language
      DataService.fetchCategories(language)
        .then((response) => {
          this.categories = response.data.map((category) => {
            const translationKey = `categories.${category.code}`
            const translatedName = this.$t(translationKey)
            const isTranslated = translatedName !== translationKey
            return {
              id: category.id,
              code: category.code,
              name: isTranslated ? translatedName : category.name
            }
          })
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
          this.paymentMethods = response.data.map((method) => ({
            id: method.id,
            code: method.code,
            name: method.name
          }))
        })
        .catch((error) => {
          console.error('Error fetching payment methods:', error)
        })
    },
    fetchGroups() {
      GroupService.fetchGroups()
        .then((response) => {
          console.log(response.data)
          this.groups = response.data.map((group) => ({
            id: group.id,
            name: group.name,
            description: group.description,
            ownerId: group.ownerId,
            createdDate: group.createdDate
          }))
        })
        .catch((error) => {
          console.error('Erro ao buscar grupos:', error)
        })
    },
    fetchGroupMembers() {
      if (this.selectedGroup) {
        this.isLoadingMembers = true
        GroupService.fetchGroupMembers(this.selectedGroup)
          .then((response) => {
            console.log(response.data)
            this.users = response.data.map((member) => ({
              id: member.userId,
              name: member.name,
              email: member.email
            }))
          })
          .catch((error) => {
            console.error('Erro ao buscar membros do grupo:', error)
          })
          .finally(() => {
            this.isLoadingMembers = false
          })
      } else {
        this.users = []
      }
    },
    fetchMonthlyIncomes() {
      const monthNumber = this.selectedIncomeMonth;
      const yearNumber = this.selectedIncomeYear;
      if (monthNumber !== null) {
        this.isLoadingIncomes = true;
        IncomeService.fetchMonthlyIncomes(monthNumber, yearNumber)
          .then((response) => {
            this.monthlyIncomes = response.data;
          })
          .catch((error) => {
            console.error('Error fetching monthly incomes:', error);
          })
          .finally(() => {
            this.isLoadingIncomes = false;
          });
      }
    },
    saveIncome() {
      const normalizedDate = this.normalizeDate(this.income.date)
      if (!normalizedDate) {
        this.showToast(this.$t('validation.required', { field: this.$t('common.date') }), 'warning')
        return
      }

      const paymentMethodId = this.resolvePaymentMethodId(this.income.paymentMethod)
      if (!paymentMethodId) {
        this.showToast(this.$t('validation.required', { field: this.$t('common.payment_method') }), 'warning')
        return
      }

      const isEditing = this.isEditingIncome && this.editingIncomeId

      const payload = this.buildIncomePayload({
        normalizedDate,
        paymentMethodId,
        isEditing
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

      const isEditing = this.isEditingExpense && this.editingExpenseId
      const payload = this.buildExpensePayload({
        normalizedDate,
        categoryId,
        paymentMethodId,
        isEditing
      })

      console.info('[BudgetView] saveExpense', {
        isEditing,
        id: this.editingExpenseId,
        payload,
        selectedGroup: this.selectedGroup
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
        date: '',
        amount: 0.0,
        description: '',
        paymentMethod: null,
        isRecurring: false
      }
      this.isEditingIncome = false
      this.editingIncomeId = null
    },
    resetExpenseForm() {
      this.expense = {
        date: '',
        amount: 0.0,
        description: '',
        category: null,
        paymentMethod: null,
        selectedUsers: []
      }
      this.isEditingExpense = false
      this.editingExpenseId = null
      this.editingExpenseOriginal = null
      if (this.previousSelectedGroup !== undefined) {
        const shouldFetchMembers = this.selectedGroup !== this.previousSelectedGroup
        this.selectedGroup = this.previousSelectedGroup
        this.previousSelectedGroup = undefined
        if (!shouldFetchMembers && !this.selectedGroup) {
          this.users = []
        }
      }
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
        amount: income.amount,
        description: income.description,
        paymentMethod: this.resolvePaymentMethodId(
          income.paymentMethod ?? income.paymentMethodId ?? null
        ),
        isRecurring: income.isRecurring ?? false
      }
    },
    cancelIncomeEdit() {
      this.resetIncomeForm()
    },
    startEditingExpense(expense) {
      console.debug('[BudgetView] startEditingExpense', expense)
      if (!this.isEditingExpense) {
        this.previousSelectedGroup = this.selectedGroup
      }

      try {
        this.editingExpenseOriginal = JSON.parse(JSON.stringify(expense))
      } catch (parseError) {
        console.warn('[BudgetView] Failed to snapshot original expense, falling back to shallow copy.', parseError)
        this.editingExpenseOriginal = { ...expense }
      }

      this.isEditingExpense = true
      this.editingExpenseId = expense.id

      const groupId = expense.group?.id ?? expense.groupId ?? null
      this.selectedGroup = groupId

      this.expense = {
        date: this.normalizeDate(expense.date),
        amount: expense.amount,
        description: expense.description,
        category: this.resolveCategoryId(expense.category ?? expense.categoryId ?? null),
        paymentMethod: this.resolvePaymentMethodId(
          expense.paymentMethod ?? expense.paymentMethodId ?? null
        ),
        selectedUsers: Array.isArray(expense.users)
          ? expense.users.map((user) => user.userId ?? user.id ?? user)
          : []
      }

      if (!groupId) {
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
        ExpenseService.fetchMonthlyExpenses(monthNumber, yearNumber)
          .then((response) => {
            this.monthlyExpenses = response.data;
          })
          .catch((error) => {
            console.error('Error fetching monthly expenses:', error);
          })
          .finally(() => {
            this.isLoadingExpenses = false;
          });
      }
    },
    handleAttachFiles({ expense, files }) {
      // Faça a chamada à API para salvar os arquivos
      const expenseId = expense.id;
      ExpenseService.uploadAttachment(expenseId, files, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          let progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          console.log("Upload Progress: " + progress + "%");
        },
      })
        .then(() => {
          console.log('Arquivos anexados com sucesso');
          // Atualize a lista de anexos da despesa, se necessário
          // Por exemplo, você pode recarregar a despesa ou atualizar o estado local
        })
        .catch((error) => {
          console.error('Erro ao anexar arquivos:', error);
        });
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
          console.log('Anexo removido com sucesso.');
          // Atualize a lista de despesas ou faça outras ações necessárias
        })
        .catch(error => {
          console.error('Erro ao remover o anexo:', error);
        });
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
