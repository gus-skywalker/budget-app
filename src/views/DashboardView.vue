<template>
    <div>
        <!-- Overview Section -->
        <div class="section">
            <h2>Overview</h2>
            <div>Total Income: {{ totalIncome }}</div>
            <div>Total Expenses: {{ totalExpenses }}</div>
            <div>Savings: {{ savings }}</div>
        </div>

        <!-- Trends Over Time -->
        <div class="section">
            <h2>Trends Over Time</h2>
            <div class="dropdown">
                <label for="chart-type-select">Select Chart Type:</label>
                <select id="chart-type-select" v-model="chartType" @change="updateCharts">
                    <option value="line">Line Chart</option>
                    <option value="bar">Bar Chart</option>
                </select>
            </div>
            <!-- Dropdown for Expense Categories -->
            <div class="dropdown">
                <label for="category-select">Select Expense Category:</label>
                <select id="category-select" v-model="selectedCategory" @change="updateCharts">
                    <option value="">All Categories</option>
                    <option v-for="category in expenseCategories" :key="category.id" :value="category.id">{{
                        category.name }}</option>
                </select>
            </div>
            <!-- Charts -->
            <div class="chart-container">
                <div class="chart">
                    <canvas ref="trendsChart"></canvas>
                </div>
            </div>
        </div>

        <!-- Budget Tracker -->
        <div class="section">
            <h2>Budget Tracker</h2>
            <!-- Display budget for different expense categories -->
        </div>

        <!-- Financial Goals -->
        <div class="section">
            <h2>Financial Goals</h2>
            <!-- Display Financial Goals -->
            <div v-if="financialGoals.length">
                <div v-for="goal in financialGoals" :key="goal.id">
                    <div>{{ goal.name }}</div>
                    <div>Target Amount: ${{ goal.targetAmount }}</div>
                    <div>Deadline: {{ goal.deadline }}</div>
                    <div>Progress: {{ calculateProgress(goal) }}%</div>
                    <!-- Visual indicator for progress -->
                    <div class="progress-bar" :style="{ width: calculateProgress(goal) + '%' }"></div>
                </div>
            </div>
            <div v-else>
                <p>No financial goals found.</p>
            </div>
        </div>

    </div>
</template>

<script>
import Chart from 'chart.js/auto';

export default {
    data() {
        return {
            // Mock data for demonstration
            chart: null,
            totalIncome: 5000,
            totalExpenses: 3000,
            savings: 2000,
            chartType: 'bar', // Initially set to line chart
            selectedCategory: '', // Initially no category selected
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
                console.log(this.chart);
                this.chart.destroy();
            }
            this.createChart();
            // Fetch income and expenses data for the selected category from the backend API
            // Update the data for the chart based on the selected category
            // Redraw the chart with the updated data and selected chart type

        },
        // Fetch financial goals (simulated)
        fetchFinancialGoals() {
            // Simulate fetching financial goals (replace with actual API requests)
            this.financialGoals = [
                { id: 1, name: 'Car Purchase', targetAmount: 20000, deadline: '2024-12-31', currentAmount: 15000 },
                { id: 2, name: 'House Down Payment', targetAmount: 50000, deadline: '2025-06-30', currentAmount: 25000 }
                // Add more financial goals as needed
            ];
        },
        // Calculate progress towards a specific financial goal
        calculateProgress(goal) {
            // Calculate progress percentage based on current and target amounts
            const progressPercentage = (goal.currentAmount / goal.targetAmount) * 100;
            // Return progress percentage (rounded to two decimal places)
            return progressPercentage.toFixed(2);
        }
    }
}
</script>

<style scoped>
.section {
    margin-bottom: 30px;
}
</style>