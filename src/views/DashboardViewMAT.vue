<template>
    <v-container>
        <!-- Overview Section -->
        <v-card class="section">
            <v-card-title>
                <h2>Overview</h2>
            </v-card-title>
            <v-card-text>
                <div>Total Income: {{ totalIncome }}</div>
                <div>Total Expenses: {{ totalExpenses }}</div>
                <div>Savings: {{ savings }}</div>
            </v-card-text>
        </v-card>

        <!-- Trends Over Time -->
        <v-card class="section">
            <v-card-title>
                <h2>Trends Over Time</h2>
            </v-card-title>
            <v-card-text>
                <v-row align="center">
                    <v-col cols="12" md="6" lg="4">
                        <v-select v-model="chartType" :items="chartTypes" label="Select Chart Type" outlined
                            @change="updateCharts"></v-select>
                    </v-col>
                    <v-col cols="12" md="6" lg="4">
                        <v-select v-model="selectedCategory" :items="expenseCategories" label="Select Expense Category"
                            outlined @change="updateCharts"></v-select>
                    </v-col>
                </v-row>
                <v-divider class="my-4"></v-divider>
                <div class="chart-container">
                    <canvas ref="trendsChart"></canvas>
                </div>
            </v-card-text>
        </v-card>

        <!-- Budget Tracker -->
        <v-card class="section">
            <v-card-title>
                <h2>Budget Tracker</h2>
            </v-card-title>
            <!-- Display budget for different expense categories -->
        </v-card>

        <!-- Financial Goals -->
        <v-card class="section">
            <v-card-title>
                <h2>Financial Goals</h2>
            </v-card-title>
            <v-card-text>
                <v-row v-if="financialGoals.length">
                    <v-col cols="12" md="6" lg="4" v-for="goal in financialGoals" :key="goal.id">
                        <v-card>
                            <v-card-title>{{ goal.name }}</v-card-title>
                            <v-card-text>
                                <div>Target Amount: ${{ goal.targetAmount }}</div>
                                <div>Deadline: {{ goal.deadline }}</div>
                                <div>Progress: {{ calculateProgress(goal) }}%</div>
                                <!-- Visual indicator for progress -->
                                <v-progress-linear :value="calculateProgress(goal)"></v-progress-linear>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>
                <v-alert v-else type="info">
                    No financial goals found.
                </v-alert>
            </v-card-text>
        </v-card>

    </v-container>
</template>

<script>
import Chart from 'chart.js/auto';

export default {
    data() {
        return {
            chart: null,
            totalIncome: 5000,
            totalExpenses: 3000,
            savings: 2000,
            chartType: 'line',
            chartTypes: [
                { title: 'Line Chart', value: 'line' },
                { title: 'Bar Chart', value: 'bar' }
            ],
            selectedCategory: '',
            expenseCategories: [],
            financialGoals: [],
        };
    },
    mounted() {
        this.createChart();
        this.fetchFinancialGoals();
    },
    methods: {
        createChart() {
            const trendsCtx = this.$refs.trendsChart.getContext('2d');
            this.chart = new Chart(trendsCtx, {
                type: this.chartType,
                data: {
                    labels: ['January', 'February', 'March', 'April', 'May', 'June'],
                    datasets: [
                        {
                            label: 'Income',
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 1,
                            data: [2000, 2200, 2500, 2300, 2400, 2600]
                        },
                        {
                            label: 'Expenses',
                            backgroundColor: 'rgba(255, 99, 132, 0.2)',
                            borderColor: 'rgba(255, 99, 132, 1)',
                            borderWidth: 1,
                            data: [1500, 1700, 1800, 1600, 1700, 1900]
                        }
                    ]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        },
        updateCharts() {
            if (this.chart) {
                console.log(this.chart)
                this.chart.destroy();
            }
            this.createChart();
        },
        fetchFinancialGoals() {
            this.financialGoals = [
                { id: 1, name: 'Car Purchase', targetAmount: 20000, deadline: '2024-12-31', currentAmount: 15000 },
                { id: 2, name: 'House Down Payment', targetAmount: 50000, deadline: '2025-06-30', currentAmount: 25000 }
            ];
        },
        calculateProgress(goal) {
            const progressPercentage = (goal.currentAmount / goal.targetAmount) * 100;
            return progressPercentage.toFixed(2);
        }
    }
}
</script>

<style scoped>
.section {
    margin-bottom: 30px;
}

.chart-container {
    position: relative;
    height: 400px;
}
</style>