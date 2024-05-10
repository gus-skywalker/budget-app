<template>
    <div>
        <FinancialGoal />

        <h1>Entrada de Dados</h1>

        <!-- Seção de Entradas -->
        <div class="section">
            <h2>Entradas</h2>
            <label>Data:</label>
            <input type="date" v-model="income.date">
            <label>Valor:</label>
            <input type="number" v-model="income.amount">
            <label>Descrição:</label>
            <input type="text" v-model="income.description">
            <label>Categoria:</label>
            <select v-model="income.category">
                <option v-for="category in categories" :key="category.id" :value="category">{{ category.name }}</option>
            </select>
            <label>Método de Pagamento:</label>
            <select v-model="income.paymentMethod">
                <option v-for="paymentMethod in paymentMethods" :key="paymentMethod.id" :value="paymentMethod">{{
                    paymentMethod.name }}</option>
            </select>
            <button @click="saveIncome">Salvar Entrada</button>
        </div>

        <!-- Seção de Débitos -->
        <div class="section">
            <h2>Débitos</h2>
            <label>Data:</label>
            <input type="date" v-model="expense.date">
            <label>Valor:</label>
            <input type="number" v-model="expense.amount">
            <label>Descrição:</label>
            <input type="text" v-model="expense.description">
            <label>Método de Pagamento:</label>
            <select v-model="expense.paymentMethod">
                <option v-for="paymentMethod in paymentMethods" :key="paymentMethod.id" :value="paymentMethod">{{
                    paymentMethod.name }}</option>
            </select>
            <button @click="saveExpense">Salvar Débito</button>
        </div>

        <!-- Lista de Débitos Mensais -->
        <div class="section">
            <h2>Débitos Mensais</h2>
            <label>Selecione o Mês:</label>
            <select v-model="selectedMonth" @change="fetchMonthlyExpenses">
                <option v-for="(month, index) in months" :key="index" :value="month">{{ month }}</option>
            </select>
            <ul v-if="monthlyExpenses.length">
                <li v-for="(expense, index) in monthlyExpenses" :key="index">
                    {{ expense.date }} - {{ expense.description }} - R$ {{ expense.amount }}
                </li>
            </ul>
            <p v-else>Nenhum débito encontrado para este mês.</p>
        </div>
    </div>
</template>

<script>
import FinancialGoal from '../components/FinancialGoal.vue'
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
            monthlyExpenses: []
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
        saveIncome() {
            axios.post('/api/incomes', this.income)
                .then(response => {
                    console.log('Income saved successfully:', response.data);
                    // Limpar os campos após o salvamento, se necessário
                })
                .catch(error => {
                    console.error('Error saving income:', error);
                });
        },
        saveExpense() {
            axios.post('/api/expenses', this.expense)
                .then(response => {
                    console.log('Expense saved successfully:', response.data);
                    // Limpar os campos após o salvamento, se necessário
                })
                .catch(error => {
                    console.error('Error saving expense:', error);
                });
        }
    }
}
</script>

<style scoped>
.section {
    margin-bottom: 20px;
}
</style>
