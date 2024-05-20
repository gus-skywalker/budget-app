<template>
    <v-container>
        <v-row>
            <v-col>
                <v-card class="pa-5">
                    <v-card-title>
                        <h2>Financial Goals</h2>
                    </v-card-title>

                    <v-card-text>
                        <!-- Form to Add/Edit Financial Goals -->
                        <v-form v-if="isAddingOrEditing" @submit.prevent="submitGoalForm">
                            <v-text-field label="Goal Name" v-model="goalForm.name" required outlined
                                class="mb-4"></v-text-field>

                            <v-text-field label="Target Amount" v-model="goalForm.targetAmount" type="number" required
                                outlined class="mb-4"></v-text-field>

                            <v-text-field label="Deadline" v-model="goalForm.deadline" type="date" required outlined
                                class="mb-4"></v-text-field>

                            <!-- Submit and Cancel buttons -->
                            <v-btn type="submit" color="primary" class="mr-4">
                                {{ isEditing ? 'Update Goal' : 'Add Goal' }}
                            </v-btn>
                            <v-btn type="button" @click="cancelEdit" color="secondary">
                                Cancel
                            </v-btn>
                        </v-form>

                        <!-- Button to Add New Financial Goal -->
                        <v-btn v-if="!isAddingOrEditing" @click="addNewGoal" color="primary" class="mt-4">
                            Add New Goal
                        </v-btn>

                        <!-- Display Financial Goals -->
                        <v-list v-if="financialGoals.length" class="mt-4">
                            <v-list-item v-for="goal in financialGoals" :key="goal.id" class="goal-item">
                                <v-row align="center" class="w-200">
                                    <v-col>
                                        <v-list-item-title>{{ goal.name }}</v-list-item-title>
                                        <v-list-item-subtitle>
                                            Target Amount: ${{ goal.targetAmount }} | Deadline: {{ goal.deadline }}
                                        </v-list-item-subtitle>
                                    </v-col>
                                    <v-col class="d-flex justify-end">
                                        <v-btn @click="editGoal(goal)" icon>
                                            <v-icon>mdi-pencil</v-icon>
                                        </v-btn>
                                        <v-btn @click="deleteGoal(goal)" icon>
                                            <v-icon>mdi-delete</v-icon>
                                        </v-btn>
                                    </v-col>
                                </v-row>
                                <v-divider></v-divider>
                            </v-list-item>
                        </v-list>
                        <v-alert v-else type="info" class="mt-4">
                            No financial goals found.
                        </v-alert>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
export default {
    data() {
        return {
            financialGoals: [], // Array to store financial goals
            isAddingOrEditing: false, // Flag to indicate if adding/editing mode is active
            isEditing: false, // Flag to indicate if editing mode is active
            goalForm: {
                name: '',
                targetAmount: 0,
                deadline: '',
            },
            editedGoalId: null, // ID of the goal being edited
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
            this.goalForm = {
                name: goal.name,
                targetAmount: goal.targetAmount,
                deadline: goal.deadline,
            };
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
                const editedGoalIndex = this.financialGoals.findIndex(
                    (goal) => goal.id === this.editedGoalId
                );
                if (editedGoalIndex !== -1) {
                    // Update goal in the array
                    this.financialGoals[editedGoalIndex] = {
                        ...this.financialGoals[editedGoalIndex],
                        name: this.goalForm.name,
                        targetAmount: this.goalForm.targetAmount,
                        deadline: this.goalForm.deadline,
                    };
                }
            } else {
                // Add new goal
                const newGoal = {
                    id: this.financialGoals.length + 1, // Generate a unique ID (for simulation)
                    name: this.goalForm.name,
                    targetAmount: this.goalForm.targetAmount,
                    deadline: this.goalForm.deadline,
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
                const goalIndex = this.financialGoals.findIndex((g) => g.id === goal.id);
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
                { id: 3, name: 'Goal 3', targetAmount: 3000, deadline: '2024-12-31' },
            ];
        },
    },
    mounted() {
        // Fetch financial goals when the component is mounted
        this.fetchFinancialGoals();
    },
};
</script>

<style scoped>
.goal-item {
    /* display: flex;
    justify-content: space-between;
    align-items: center; */
}
</style>