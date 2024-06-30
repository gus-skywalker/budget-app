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
                                <v-text-field label="Valor" type="number" v-model="income.amount"
                                    :rules="[value => !!value || 'Valor é obrigatório', value => /^\d+(\.\d{1,2})?$/.test(value) || 'Formato de moeda inválido']"></v-text-field>
                            </v-col>
                            <v-col cols="12" md="12">
                                <v-text-field label="Descrição" v-model="income.description"></v-text-field>
                            </v-col>
                            <v-col cols="12" sm="6" md="6">
                                <v-select label="Método de Pagamento" v-model="income.paymentMethod"
                                    :items="paymentMethods" item-title="name" item-value="id"></v-select>
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
                                <v-text-field label="Valor" type="number" v-model="expense.amount"
                                    :rules="[value => !!value || 'Valor é obrigatório', value => /^\d+(\.\d{1,2})?$/.test(value) || 'Formato de moeda inválido']"></v-text-field>
                            </v-col>
                            <v-col cols="12" md="12">
                                <v-text-field label="Descrição" v-model="expense.description"></v-text-field>
                            </v-col>
                            <v-col cols="12" sm="6" md="6">
                                <v-select label="Categoria" v-model="expense.category" :items="categories"
                                    item-title="name" item-value="id"></v-select>
                            </v-col>
                            <v-col cols="12" sm="6" md="6">
                                <v-select label="Método de Pagamento" v-model="expense.paymentMethod"
                                    :items="paymentMethods" item-title="name" item-value="id"></v-select>
                            </v-col>
                            <v-col cols="12" md="12">
                                <v-select label="Compartilhar com Usuários" v-model="selectedUsers" :items="users"
                                    item-title="username" item-value="id" multiple></v-select>
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
                            <v-col cols="12" md="12">
                                <v-select label="Selecione o Mês" v-model="selectedIncomeMonth"
                                    @update:model-value="fetchMonthlyIncomes" :items="months" item-title="name"
                                    item-value="value"></v-select>
                            </v-col>
                        </v-row>
                        <v-divider class="my-4"></v-divider>
                        <v-list v-if="monthlyIncomes.length">
                            <income-item v-for="(income, index) in monthlyIncomes" :key="index" :income="income"
                                @toggle-recurring="toggleRecurring" @deleteIncome="deleteIncome"></income-item>
                        </v-list>
                        <v-alert v-else type="info">
                            Nenhuma entrada encontrada para este mês.
                        </v-alert>
                    </v-card-text>
                </v-card>

                <!-- Lista de Débitos Mensais -->
                <v-card class="section">
                    <v-card-title>
                        <h2>Débitos Mensais</h2>
                    </v-card-title>
                    <v-card-text>
                        <v-row align="center">
                            <v-col cols="12" md="12">
                                <v-select label="Selecione o Mês" v-model="selectedExpenseMonth"
                                    @update:model-value="fetchMonthlyNubankBill" :items="months" item-title="name"
                                    item-value="value"></v-select>
                            </v-col>
                        </v-row>
                        <v-divider class="my-4"></v-divider>
                        <v-list v-if="monthlyExpenses.length">
                            <v-list-item v-for="(expense, index) in monthlyExpenses" :key="index">
                                <v-list-item-title>{{ expense.date }} - R$ {{ expense.amount }} - {{ expense.description
                                    }}</v-list-item-title>
                            </v-list-item>
                        </v-list>
                        <v-alert v-else type="info">
                            Nenhum débito encontrado para este mês.
                        </v-alert>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>

    <GroupManagement />
    <FinancialGoal />

</template>


<script>
import GroupManagement from '../components/GroupManagement.vue'
import FinancialGoal from '../components/FinancialGoal.vue'
import IncomeItem from '../components/IncomeItem.vue'
import IncomeService from '@/services/IncomeService'
import ExpenseService from '@/services/ExpenseService'
import DataService from '@/services/DataService'
import UsersService from '@/services/UsersService'

export default {
    components: {
        FinancialGoal,
        IncomeItem,
        GroupManagement
    },
    data() {
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
                paymentMethod: null
            },
            categories: [],
            paymentMethods: [],
            selectedIncomeMonth: null,
            selectedExpenseMonth: null,
            selectedLanguage: 'pt',
            selectedUsers: [],
            users: [],
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
            monthlyExpenses: [],
            monthlyIncomes: [],
        };
    },
    mounted() {
        this.fetchCategories();
        this.fetchPaymentMethods();
        this.fetchUsers();
    },
    methods: {
        fetchCategories() {
            DataService.fetchCategories(this.selectedLanguage)
                .then(response => {
                    this.categories = response.data.map(category => ({
                        id: category.id,
                        code: category.code,
                        name: category.name
                    }));
                })
                .catch(error => {
                    console.error('Error fetching categories:', error);
                });
        },
        fetchPaymentMethods() {
            DataService.fetchPaymentMethods(this.selectedLanguage)
                .then(response => {
                    this.paymentMethods = response.data.map(method => ({
                        id: method.id,
                        code: method.code,
                        name: method.name
                    }));
                })
                .catch(error => {
                    console.error('Error fetching payment methods:', error);
                });
        },
        fetchUsers() {
            UsersService.fetchUsers()
                .then(response => {
                    this.users = response.data.map(user => ({
                        id: user.id,
                        username: user.username
                    }));
                })
                .catch(error => {
                    console.error('Error fetching users:', error);
                });
        },
        fetchMonthlyIncomes() {
            const monthNumber = this.selectedIncomeMonth;
            if (monthNumber !== null) {
                console.log('Fetching incomes for month:', monthNumber);
                IncomeService.fetchMonthlyIncomes(monthNumber)
                    .then(response => {
                        this.monthlyIncomes = response.data;
                    })
                    .catch(error => {
                        console.error('Error fetching monthly incomes:', error);
                    });
            } else {
                console.error('Invalid month selected');
            }
        },
        fetchMonthlyExpenses() {
            const monthNumber = this.selectedExpenseMonth;
            if (monthNumber !== null) {
                console.log('Fetching expenses for month:', monthNumber);
                ExpenseService.fetchMonthlyExpenses(monthNumber)
                    .then(response => {
                        console.log(response);
                        this.monthlyExpenses = response.data;
                    })
                    .catch(error => {
                        console.error('Error fetching monthly expenses:', error);
                    });
            } else {
                console.error('Invalid month selected');
            }
        },
        saveIncome() {
            IncomeService.create(this.income)
                .then(response => {
                    console.log('Income saved successfully:', response.data);
                    this.resetIncomeForm();
                })
                .catch(error => {
                    console.error('Error saving income:', error);
                });
        },
        saveExpense() {
            ExpenseService.create(this.expense)
                .then(response => {
                    console.log('Expense saved successfully:', response.data);
                    this.resetExpenseForm();
                })
                .catch(error => {
                    console.error('Error saving expense:', error);
                });
        },
        notifyUsers(expense) {
            this.selectedUsers.forEach(userId => {
                UsersService.notifyUser(userId, expense)
                    .then(response => {
                        console.log(response);
                        console.log(`User ${userId} notified successfully`);
                    })
                    .catch(error => {
                        console.error(`Error notifying user ${userId}:`, error);
                    });
            });
        },
        resetIncomeForm() {
            this.income = {
                date: '',
                amount: 0,
                description: '',
                category: null,
                paymentMethod: null
            };
        },
        resetExpenseForm() {
            this.expense = {
                date: '',
                amount: 0,
                description: '',
                paymentMethod: null
            };
        },
        toggleRecurring(income) {
            const incomeIndex = this.monthlyIncomes.findIndex(item => item.id === income.id);
            if (incomeIndex !== -1) {
                this.monthlyIncomes[incomeIndex].isRecurring = !this.monthlyIncomes[incomeIndex].isRecurring;
            }
        },
        deleteIncome(income) {
            if (confirm('Are you sure you want to delete this income?')) {
                const incomeIndex = this.monthlyIncomes.findIndex((item) => item.id === income.id);
                if (incomeIndex !== -1) {
                    this.monthlyIncomes.splice(incomeIndex, 1);
                }
            }
        },
        fetchMonthlyNubankBill() {
            const monthNumber = this.selectedExpenseMonth;
            DataService.fetchMonthlyNubankBill(2024, monthNumber)
                .then(response => {
                    console.log(response);
                    this.transformExpenses(response.data.bill.line_items);
                })
                .catch(error => {
                    console.error('Error fetching monthly expenses:', error);
                });
        },
        transformExpenses(lineItems) {
            this.monthlyExpenses = lineItems.map(item => {
                return {
                    date: item.post_date,
                    amount: (item.amount / 100).toFixed(2),
                    description: item.title,
                    category: item.category
                };
            });
        },
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
