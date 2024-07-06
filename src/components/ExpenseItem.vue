<template>
    <v-list-item>
        <v-row align="center" class="w-100">
            <v-col cols="9">
                <v-list-item-title>
                    {{ expense.description }}
                </v-list-item-title>
                <v-list-item-subtitle>
                    R$ {{ expense.amount }} - Data: {{ expense.date }}
                </v-list-item-subtitle>
                <v-list-item-subtitle v-if="expense.category">
                    Categoria: {{ expense.category.name }}
                </v-list-item-subtitle>
                <v-list-item-subtitle v-if="expense.users && expense.users.length">
                    Compartilhado com:
                    <v-chip v-for="user in expense.users" :key="user.userId" class="mr-2">
                        {{ user.name }}
                    </v-chip>
                </v-list-item-subtitle>
            </v-col>
            <v-col cols="3" class="d-flex justify-end">
                <v-btn x-small icon height="35px" width="35px" @click="shareExpense(expense)" color="primary"
                    class="mr-2">
                    <v-icon>mdi-share-variant</v-icon>
                </v-btn>
                <v-btn x-small icon height="35px" width="35px" color="red" @click="$emit('deleteExpense', expense)">
                    <v-icon>mdi-delete</v-icon>
                </v-btn>
            </v-col>
        </v-row>
    </v-list-item>
</template>

<script>
export default {
    name: 'ExpenseItem',
    props: {
        expense: Object
    },
    methods: {
        shareExpense(expense) {
            console.info('Logica de compartilhamento');
            this.$emit('shareExpense', expense);
        }
    }
}
</script>

<style>
.v-btn {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
}
</style>
