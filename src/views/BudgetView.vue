<template>
  <v-container>
    <h1>Entrada de Dados</h1>
    <v-row>
      <!-- Coluna Esquerda: Formulários de Entrada -->
      <v-col cols="12" md="6">
        <!-- Seção de Entradas -->
        <v-card class="section">
          <v-card-title>
            <h2>Entradas</h2>
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" sm="6" md="6">
                <v-text-field label="Data" type="date" v-model="income.date"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="6">
                <v-text-field label="Valor" type="number" v-model="income.amount" :rules="[
                  (value) => !!value || 'Valor é obrigatório',
                  (value) => /^\d+(\.\d{1,2})?$/.test(value) || 'Formato de moeda inválido'
                ]"></v-text-field>
              </v-col>
              <v-col cols="12" md="12">
                <v-text-field label="Descrição" v-model="income.description"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="6">
                <v-select label="Método de Pagamento" v-model="income.paymentMethod" :items="paymentMethods"
                  item-title="name" item-value="id"></v-select>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" @click="saveIncome">Salvar Entrada</v-btn>
          </v-card-actions>
        </v-card>

        <!-- Seção de Débitos -->
        <v-card class="section">
          <v-card-title>
            <h2>Débitos</h2>
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" sm="6" md="6">
                <v-text-field label="Data" type="date" v-model="expense.date"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="6">
                <v-text-field label="Valor" type="number" v-model="expense.amount" :rules="[
                  (value) => !!value || 'Valor é obrigatório',
                  (value) => /^\d+(\.\d{1,2})?$/.test(value) || 'Formato de moeda inválido'
                ]"></v-text-field>
              </v-col>
              <v-col cols="12" md="12">
                <v-text-field label="Descrição" v-model="expense.description"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="6">
                <v-select label="Categoria" v-model="expense.category" :items="categories" item-title="name"
                  item-value="id"></v-select>
              </v-col>
              <v-col cols="12" sm="6" md="6">
                <v-select label="Método de Pagamento" v-model="expense.paymentMethod" :items="paymentMethods"
                  item-title="name" item-value="id"></v-select>
              </v-col>
              <v-col cols="12" md="12">
                <v-select label="Selecione o Grupo" v-model="selectedGroup" :items="groups" item-title="name"
                  item-value="id" @update:model-value="fetchGroupMembers"></v-select>
                <v-select label="Compartilhar com Usuários do Grupo" v-model="expense.selectedUsers" :items="users"
                  item-title="name" item-value="id" multiple></v-select>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" @click="saveExpense">Salvar Débito</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- Coluna Direita: Listas de Entradas e Débitos -->
      <v-col cols="12" md="6">
        <!-- Lista de Entradas Mensais -->
        <v-card class="section">
          <v-card-title>
            <h2>Entradas Mensais</h2>
          </v-card-title>
          <v-card-text>
            <v-row align="center">
              <v-col cols="9" md="9">
                <v-select label="Selecione o Mês" v-model="selectedIncomeMonth"
                  @update:model-value="fetchMonthlyIncomes" :items="months" item-title="name"
                  item-value="value"></v-select>
              </v-col>
              <v-col cols="3" md="3">
                <v-select label="Selecione o Ano" v-model="selectedIncomeYear" @update:model-value="fetchMonthlyIncomes"
                  :items="years"></v-select>
              </v-col>
            </v-row>
            <v-divider class="my-4"></v-divider>
            <v-list v-if="monthlyIncomes.length" class="box-size-list">
              <income-item v-for="(income, index) in monthlyIncomes" :key="index" :income="income"
                @toggle-recurring="toggleRecurring" @deleteIncome="deleteIncome"></income-item>
            </v-list>
            <v-alert v-else color="primary" type="info"> Nenhuma entrada encontrada para este mês. </v-alert>
          </v-card-text>
        </v-card>

        <!-- Lista de Débitos Mensais -->
        <v-card class="section">
          <v-card-title>
            <h2>Débitos Mensais</h2>
          </v-card-title>
          <v-card-text>
            <v-row align="center">
              <v-col cols="9" md="9">
                <v-select label="Selecione o Mês" v-model="selectedExpenseMonth"
                  @update:model-value="fetchMonthlyExpenses" :items="months" item-title="name"
                  item-value="value"></v-select>
              </v-col>
              <v-col cols="3" md="3">
                <v-select label="Selecione o Ano" v-model="selectedExpenseYear"
                  @update:model-value="fetchMonthlyExpenses" :items="years"></v-select>
              </v-col>
            </v-row>
            <v-divider class="my-4"></v-divider>
            <v-list v-if="monthlyExpenses.length" class="box-size-list">
              <expense-item v-for="(expense, index) in monthlyExpenses" :key="index" :expense="expense"
                @shareExpense="handleShareExpenseWithAttachment" @deleteExpense="deleteExpense"></expense-item>
            </v-list>
            <v-alert v-else color="primary" type="info"> Nenhum débito encontrado para este mês. </v-alert>
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
    this.fetchCategories()
    this.fetchPaymentMethods()
    // this.fetchUsers();
    this.fetchGroups()
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
    handleShareExpense({ expense, email }) {
      const userStore = useUserStore()

      NotificationService.sendEmail({
        user: {
          email: userStore.getUser.email,
          name: userStore.getUser.username
        },
        expense: {
          amount: expense.amount
        },
        destinationEmail: email
      })
        .then(() => {
          console.log('Email sent successfully')
        })
        .catch((error) => {
          console.error('Failed to send email:', error)
        })
    },
    handleShareExpenseWithAttachment({ expense, email, files }) {
      const userStore = useUserStore()
      const expenseId = expense.id;

      console.log(email);
      console.log(expense);
      console.log(files);
      if (!email || files.length === 0) {
        console.warn('Email ou arquivos não informados');
        return;
      }

      const formData = new FormData();
      files.forEach((files) => {
        formData.append('files', files);
      });

      const expenseJson = {
        user: {
          email: userStore.getUser.email,
          name: userStore.getUser.username
        },
        expense: {
          amount: expense.amount,
          description: expense.description,
          date: expense.date,
          category: expense.category ? expense.category.name : null
        },
        destinationEmail: email
      };

      formData.append('expenseData', expenseJson);

      if (files > 0) {
        ExpenseService.uploadAttachment(expenseId, formData)
          .then(() => {
            console.log('Dados enviados com sucesso');
          })
          .catch((error) => {
            console.error('Erro ao enviar dados:', error);
          });
      }

      NotificationService.sendEmailWithAttachment(expenseJson)
        .then(() => {
          console.log('Email enviados com sucesso');
        })
        .catch((error) => {
          console.error('Erro ao enviar o email:', error);
        });
    }
  }
}
</script>

<style scoped>
/* Adicione margem à direita para separar as colunas */
.section {
  margin-bottom: 20px;
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

/* Ajuste para o espaçamento entre as colunas em telas pequenas */
@media (max-width: 600px) {
  .section {
    margin-bottom: 10px;
  }
}
</style>
