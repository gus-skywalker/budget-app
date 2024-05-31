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
                                <v-select label="Categoria" v-model="income.category" :items="categories"
                                    item-text="name" item-value="id"></v-select>
                            </v-col>
                            <v-col cols="12" sm="6" md="6">
                                <v-select label="Método de Pagamento" v-model="income.paymentMethod"
                                    :items="paymentMethods" item-text="name" item-value="id"></v-select>
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
                            <v-col cols="12" md="12">
                                <v-select label="Método de Pagamento" v-model="expense.paymentMethod"
                                    :items="paymentMethods" item-text="name" item-value="id"></v-select>
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
                                <v-select label="Selecione o Mês" v-model="selectedMonth" @change="fetchMonthlyIncomes"
                                    :items="months"></v-select>
                            </v-col>
                        </v-row>
                        <v-divider class="my-4"></v-divider>
                        <v-list v-if="monthlyIncomes.length">
                            <v-list-item v-for="(income, index) in monthlyIncomes" :key="index">
                                <v-list-item-content>
                                    <v-list-item-title>{{ income.date }} - {{ income.description }} - R$ {{
                                        income.amount }}</v-list-item-title>
                                </v-list-item-content>
                            </v-list-item>
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
                                <v-select label="Selecione o Mês" v-model="selectedMonth" @change="fetchMonthlyExpenses"
                                    :items="months"></v-select>
                            </v-col>
                        </v-row>
                        <v-divider class="my-4"></v-divider>
                        <v-list v-if="monthlyExpenses.length">
                            <v-list-item v-for="(expense, index) in monthlyExpenses" :key="index">
                                <v-list-item-content>
                                    <v-list-item-title>{{ expense.date }} - {{ expense.description }} - R$ {{
                                        expense.amount }}</v-list-item-title>
                                </v-list-item-content>
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
    <FinancialGoal />
</template>


<script>
import FinancialGoal from '../components/FinancialGoal.vue'
import IncomeService from '@/services/IncomeService'
import ExpenseService from '@/services/ExpenseService'
import axios from 'axios'

export default {
    components: {
        FinancialGoal
    },
    data() {
        return {
            income: {
                date: '',
                amount: 0,
                description: '',
                category: null,
                paymentMethod: null
            },
            expense: {
                date: '',
                amount: 0,
                description: '',
                paymentMethod: null
            },
            categories: [],
            paymentMethods: [],
            selectedMonth: '',
            months: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
            monthlyExpenses: [],
            monthlyIncomes: [],
        };
    },
    mounted() {
        this.fetchCategories();
        this.fetchPaymentMethods();
    },
    methods: {
        fetchCategories() {
            axios.get('/api/categories')
                .then(response => {
                    this.categories = response.data;
                })
                .catch(error => {
                    console.error('Error fetching categories:', error);
                });
        },
        fetchPaymentMethods() {
            axios.get('/api/payment-methods')
                .then(response => {
                    this.paymentMethods = response.data;
                })
                .catch(error => {
                    console.error('Error fetching payment methods:', error);
                });
        },
        fetchMonthlyExpenses() {
            axios.get(`/api/expenses/monthly?month=${this.selectedMonth}`)
                .then(response => {
                    this.monthlyExpenses = response.data;
                })
                .catch(error => {
                    console.error('Error fetching monthly expenses:', error);
                });
        },
        fetchMonthlyIncomes() {
            axios.get(`/api/incomes/monthly?month=${this.selectedMonth}`)
                .then(response => {
                    this.monthlyIncomes = response.data;
                })
                .catch(error => {
                    console.error('Error fetching monthly incomes:', error);
                });
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
