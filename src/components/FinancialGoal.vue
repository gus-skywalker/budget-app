<template>
    <!-- Financial Goals Section -->
    <div class="section">
        <h2>Financial Goals</h2>

        <!-- Form to Add/Edit Financial Goals -->
        <form v-if="isAddingOrEditing" @submit.prevent="submitGoalForm">
            <!-- Input fields for goal details -->
            <input type="text" v-model="goalForm.name" placeholder="Goal Name" required>
            <input type="number" v-model="goalForm.targetAmount" placeholder="Target Amount" required>
            <input type="date" v-model="goalForm.deadline" required>
            <!-- Submit button -->
            <button type="submit">{{ isEditing ? 'Update Goal' : 'Add Goal' }}</button>
            <!-- Cancel button to exit edit mode -->
            <button type="button" @click="cancelEdit">Cancel</button>
        </form>

        <!-- Button to Add New Financial Goal -->
        <button v-if="!isAddingOrEditing" @click="addNewGoal">Add New Goal</button>

        <!-- Display Financial Goals -->
        <div v-if="financialGoals.length">
            <div v-for="goal in financialGoals" :key="goal.id">
                <div>{{ goal.name }}</div>
                <div>Target Amount: ${{ goal.targetAmount }}</div>
                <div>Deadline: {{ goal.deadline }}</div>
                <!-- Edit and Delete buttons -->
                <button @click="editGoal(goal)">Edit</button>
                <button @click="deleteGoal(goal)">Delete</button>
            </div>
        </div>
        <div v-else>
            <p>No financial goals found.</p>
        </div>
    </div>

</template>

<script>
export default {
    data() {
        return {
            // Other data properties...
            financialGoals: [], // Array to store financial goals
            isAddingOrEditing: false, // Flag to indicate if adding/editing mode is active
            isEditing: false, // Flag to indicate if editing mode is active
            goalForm: { // Object to store form data
                name: '',
                targetAmount: 0,
                deadline: ''
            },
            editedGoalId: null // ID of the goal being edited
        };
    },
    methods: {
        // Add New Goal
        addNewGoal() {
            this.isAddingOrEditing = true;
            this.isEditing = false;
            this.goalForm = { name: '', targetAmount: 0, deadline: '' };
        },
        // Edit Goal
        editGoal(goal) {
            this.isAddingOrEditing = true;
            this.isEditing = true;
            this.editedGoalId = goal.id;
            // Populate form with goal details
            this.goalForm = { name: goal.name, targetAmount: goal.targetAmount, deadline: goal.deadline };
        },
        // Cancel Edit
        cancelEdit() {
            this.isAddingOrEditing = false;
            this.isEditing = false;
            this.goalForm = { name: '', targetAmount: 0, deadline: '' };
        },
        // Submit Goal Form
        submitGoalForm() {
            if (this.isEditing) {
                // Update existing goal
                const editedGoalIndex = this.financialGoals.findIndex(goal => goal.id === this.editedGoalId);
                if (editedGoalIndex !== -1) {
                    // Update goal in the array
                    this.financialGoals[editedGoalIndex] = {
                        ...this.financialGoals[editedGoalIndex],
                        name: this.goalForm.name,
                        targetAmount: this.goalForm.targetAmount,
                        deadline: this.goalForm.deadline
                    };
                }
            } else {
                // Add new goal
                const newGoal = {
                    id: this.financialGoals.length + 1, // Generate a unique ID (for simulation)
                    name: this.goalForm.name,
                    targetAmount: this.goalForm.targetAmount,
                    deadline: this.goalForm.deadline
                };
                // Add new goal to the array
                this.financialGoals.push(newGoal);
            }
            // Reset form and flags
            this.cancelEdit();
        },
        // Delete Goal
        deleteGoal(goal) {
            // Confirm deletion with user
            if (confirm('Are you sure you want to delete this goal?')) {
                // Find index of goal in the array
                const goalIndex = this.financialGoals.findIndex(g => g.id === goal.id);
                if (goalIndex !== -1) {
                    // Remove goal from the array
                    this.financialGoals.splice(goalIndex, 1);
                }
            }
        },
        // Fetch financial goals from the backend API
        fetchFinancialGoals() {
            // Simulate fetching financial goals (for demonstration)
            // You can replace this with actual API requests in the future
            this.financialGoals = [
                { id: 1, name: 'Goal 1', targetAmount: 1000, deadline: '2024-12-31' },
                { id: 2, name: 'Goal 2', targetAmount: 2000, deadline: '2024-12-31' },
                { id: 3, name: 'Goal 3', targetAmount: 3000, deadline: '2024-12-31' }
            ];
        }
    },
    mounted() {
        // Fetch financial goals when the component is mounted
        this.fetchFinancialGoals();
    }
}
</script>
<style scoped>
.section {
    margin-bottom: 20px;
}
</style>