<template>
  <v-container>
    <h1>{{ $t('accounting.title') }}</h1>
    <v-row>
      <!-- Coluna Esquerda: Formulários de Entrada -->
      <v-col cols="12" md="6">
        <!-- Seção de Entradas -->
        <v-card class="section">
          <v-card-title>
            <h2>{{ $t('income.title') }}</h2>
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" sm="6" md="6">
                <v-text-field :label="$t('common.date')" type="date" v-model="income.date"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="6">
                <v-text-field :label="$t('common.amount')" type="number" v-model="income.amount" :rules="[
                  (value) => !!value || $t('validation.required', { field: $t('common.amount') }),
                  (value) => /^\d+(\.\d{1,2})?$/.test(value) || $t('validation.invalid_currency')
                ]"></v-text-field>
              </v-col>
              <v-col cols="12" md="12">
                <v-text-field :label="$t('common.description')" v-model="income.description"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="6">
                <v-select :label="$t('common.payment_method')" v-model="income.paymentMethod" :items="paymentMethods"
                  item-title="name" item-value="id"></v-select>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" @click="saveIncome">{{ $t('income.save') }}</v-btn>
          </v-card-actions>
        </v-card>

        <!-- Lista de Entradas Mensais -->
        <v-card class="section">
          <v-card-title>
            <h2>{{ $t('income.monthly_title') }}</h2>
          </v-card-title>
          <v-card-text>
            <v-row align="center">
              <v-col cols="9" md="9">
                <v-select :label="$t('common.select_month')" v-model="selectedIncomeMonth"
                  @update:model-value="fetchMonthlyIncomes" :items="months" item-title="name"
                  item-value="value"></v-select>
              </v-col>
              <v-col cols="3" md="3">
                <v-select :label="$t('common.year')" v-model="selectedIncomeYear"
                  @update:model-value="fetchMonthlyIncomes" :items="years" class="year-select"></v-select>
              </v-col>
            </v-row>
            <v-divider class="my-4"></v-divider>
            <v-list v-if="monthlyIncomes.length" class="box-size-list">
              <income-item v-for="(income, index) in monthlyIncomes" :key="index" :income="income"
                @toggle-recurring="toggleRecurring" @deleteIncome="deleteIncome"></income-item>
            </v-list>
            <v-alert v-else color="primary" type="info">
              {{ $t('income.no_entries') }}
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Coluna Direita: Listas de Entrada e Débitos -->
      <v-col cols="12" md="6">
        <!-- Seção de Débitos -->
        <v-card class="section">
          <v-card-title>
            <h2>{{ $t('expense.title') }}</h2>
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" sm="6" md="6">
                <v-text-field :label="$t('common.date')" type="date" v-model="expense.date"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="6">
                <v-text-field :label="$t('common.amount')" type="number" v-model="expense.amount" :rules="[
                  (value) => !!value || $t('validation.required', { field: $t('common.amount') }),
                  (value) => /^\d+(\.\d{1,2})?$/.test(value) || $t('validation.invalid_currency')
                ]"></v-text-field>
              </v-col>
              <v-col cols="12" md="12">
                <v-text-field :label="$t('common.description')" v-model="expense.description"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="6">
                <v-select :label="$t('common.category')" v-model="expense.category" :items="categories"
                  item-title="name" item-value="id">
                  <template #item="{ item, props }">
                    <v-list-item v-bind="props">
                      <template #prepend>
                        <v-icon :icon="categoryIcons[item.raw.code]" class="mr-2"></v-icon>
                      </template>
                    </v-list-item>
                  </template>

                  <!-- Slot para personalizar o item selecionado -->
                  <template #selection="{ item, props }">
                    <v-chip v-bind="props" class="ma-1" small>
                      <v-icon left :icon="categoryIcons[item.raw.code]"></v-icon>
                      {{ item.raw.name }}
                    </v-chip>
                  </template>

                </v-select>
              </v-col>
              <v-col cols="12" sm="6" md="6">
                <v-select :label="$t('common.payment_method')" v-model="expense.paymentMethod" :items="paymentMethods"
                  item-title="name" item-value="id"></v-select>
              </v-col>
              <v-col cols="12" md="12">
                <v-select :label="$t('common.select_group')" v-model="selectedGroup" :items="groups" item-title="name"
                  item-value="id" @update:model-value="fetchGroupMembers"></v-select>
                <v-select :label="$t('expense.share_with_group')" v-model="expense.selectedUsers" :items="users"
                  item-title="name" item-value="id" multiple></v-select>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" @click="saveExpense">{{ $t('expense.save') }}</v-btn>
          </v-card-actions>
        </v-card>

        <!-- Lista de Débitos Mensais -->
        <v-card class="section">
          <v-card-title>
            <h2>{{ $t('expense.monthly_title') }}</h2>
          </v-card-title>
          <v-card-text>
            <v-row align="center">
              <v-col cols="9" md="9">
                <v-select :label="$t('common.select_month')" v-model="selectedExpenseMonth"
                  @update:model-value="fetchMonthlyExpenses" :items="months" item-title="name"
                  item-value="value"></v-select>
              </v-col>
              <v-col cols="3" md="3">
                <v-select :label="$t('common.year')" v-model="selectedExpenseYear"
                  @update:model-value="fetchMonthlyExpenses" :items="years"></v-select>
              </v-col>
            </v-row>
            <v-divider class="my-4"></v-divider>
            <v-list v-if="monthlyExpenses.length" class="box-size-list">
              <expense-item v-for="(expense, index) in monthlyExpenses" :key="index" :expense="expense"
                @attachFiles="handleAttachFiles" @removeAttachment="handleRemoveAttachment"
                @sendReminder="handleSendReminder" @shareExpense="handleShareExpense"
                @deleteExpense="deleteExpense"></expense-item>
            </v-list>
            <v-alert v-else color="primary" type="info">
              {{ $t('expense.no_entries') }}
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
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
      selectedLanguage: 'pt',
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
      monthlyIncomes: []
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
    }
  },
  methods: {
    fetchCategories() {
      DataService.fetchCategories(this.selectedLanguage)
        .then((response) => {
          this.categories = response.data.map((category) => ({
            id: category.id,
            code: category.code,
            name: category.name
          }))
          console.log(this.categories);
        })
        .catch((error) => {
          console.error('Error fetching categories:', error)
        })
    },
    fetchPaymentMethods() {
      DataService.fetchPaymentMethods(this.selectedLanguage)
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
      const monthNumber = this.selectedIncomeMonth
      const yearNumber = this.selectedIncomeYear
      if (monthNumber !== null) {
        IncomeService.fetchMonthlyIncomes(monthNumber, yearNumber)
          .then((response) => {
            this.monthlyIncomes = response.data
          })
          .catch((error) => {
            console.error('Error fetching monthly incomes:', error)
          })
      } else {
        console.error('Invalid month selected')
      }
    },
    saveIncome() {
      IncomeService.create(this.income)
        .then((response) => {
          console.log('Income saved successfully:', response.data)
          this.resetIncomeForm()
        })
        .catch((error) => {
          console.error('Error saving income:', error)
        })
    },
    saveExpense() {
      ExpenseService.create(this.expense)
        .then((response) => {
          console.log('Expense saved successfully:', response.data)
          this.resetExpenseForm()
        })
        .catch((error) => {
          console.error('Error saving expense:', error)
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
        category: null,
        paymentMethod: null
      }
    },
    resetExpenseForm() {
      this.expense = {
        date: '',
        amount: 0.0,
        description: '',
        paymentMethod: null
      }
    },
    toggleRecurring({ income, months }) {
      console.log('Toggled income:', income)
      console.log('Recurrence months:', months)
      IncomeService.toggleRecurring(income.id, months)
        .then((response) => {
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
          .then((response) => {
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
          .then((response) => {
            const expenseIndex = this.monthlyExpenses.findIndex((item) => item.id === expense.id)
            if (incomeIndex !== -1) {
              this.monthlyExpenses.splice(expenseIndex, 1)
            }
          })
          .catch((error) => {
            console.error('Failed to delete expense:', error)
          })
      }
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
      const monthNumber = this.selectedExpenseMonth
      const yearNumber = this.selectedExpenseYear
      if (monthNumber !== null) {
        console.log('Fetching expenses for month:', monthNumber)
        ExpenseService.fetchMonthlyExpenses(monthNumber, yearNumber)
          .then((response) => {
            console.log(response)
            this.monthlyExpenses = response.data
          })
          .catch((error) => {
            console.error('Error fetching monthly expenses:', error)
          })
      } else {
        console.error('Invalid month selected')
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
        user: {
          email: userStore.getUser.email,
          name: userStore.getUser.username,
        },
        expense: alertData.expense,
        daysBefore: alertData.daysBefore,
        isRecurring: alertData.isRecurring,
        recurrenceInterval: alertData.recurrenceInterval,
        recurrenceEndDate: alertData.recurrenceEndDate,
      };

      // Enviar o alerta
      await NotificationService.scheduleExpenseAlert(alarmData)
        .then(() => {
          console.log('Alerta criado com sucesso');
        })
        .catch((error) => {
          console.error('Erro ao criar o alerta:', error);
        });
      console.log(`Lembrete enviado para a despesa: ${alertData.expense.description}`);
    },
  }
}
</script>

<style scoped>
/* Adicione margem à direita para separar as colunas */
.section {
  margin-bottom: 20px;
}

.year-select {
  min-width: 100px;
  /* Garante espaço suficiente para os anos */
}

/* Estilo para as listas de entradas e despesas */
.list-container {
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 10px;
}

.box-size-list {
  max-height: 300px;
  /* Define a altura máxima da lista */
  overflow-y: auto;
  /* Adiciona rolagem vertical se necessário */
}

/* Estilo para os itens das listas */
.list-item {
  margin-bottom: 8px;
}

/* ----- */

/* Estilo geral para diminuir o tamanho das fontes */
.v-text-field,
.v-select,
.v-btn {
  font-size: 14px;
  /* Tamanho da fonte menor */
  height: 36px;
  /* Altura reduzida dos campos de entrada */
}

/* Ajusta o título dos cards para um tamanho de fonte menor */
.v-card-title h2,
.v-card-title h1 {
  font-size: 18px;
}

/* Ajusta o espaçamento interno (padding) nos inputs */
.v-input__control {
  padding: 6px 12px;
  /* Reduzindo o padding */
}

/* Tamanho reduzido para os botões */
.v-btn {
  height: 36px;
  min-width: 100px;
  /* Largura mínima */
  font-size: 14px;
  /* Reduzindo a fonte */
}

/* Ajuste para as listas */
.v-list {
  max-height: 250px;
  /* Ajustando a altura máxima */
  overflow-y: auto;
  /* Rolagem para o conteúdo da lista */
  font-size: 14px;
  /* Diminuindo o tamanho da fonte da lista */
}

/* Margens menores para os cartões */
.v-card {
  margin-bottom: 16px;
  /* Menor espaçamento entre os cards */
}

/* Reduzindo o tamanho dos campos de texto e seleção */
.v-text-field,
.v-select {
  min-height: 36px;
  /* Ajustando a altura mínima dos campos */
  margin-bottom: 16px;
  /* Adiciona um espaçamento entre os selects */
}

.v-select.multiple {
  height: auto;
  /* Ajusta a altura quando há múltiplas opções */
}

/* Estilo responsivo para melhorar a exibição em telas menores */
@media (max-width: 600px) {
  .section {
    margin-bottom: 10px;
  }

  .v-text-field,
  .v-select {
    font-size: 12px;
    /* Reduz ainda mais o tamanho da fonte em telas pequenas */
  }

  .v-btn {
    font-size: 12px;
    /* Botões menores em dispositivos móveis */
    min-width: 80px;
    /* Menor largura mínima */
  }
}
</style>
