<template>
    <v-list-item>
        <v-row align="center">
            <v-col>
                <v-list-item-title>
                    {{ income.description }}
                </v-list-item-title>
                <v-list-item-subtitle>
                    R$ {{ income.amount }} - Data: {{ income.date }}
                </v-list-item-subtitle>
            </v-col>
            <v-col class="d-flex justify-end">
                <v-chip v-if="income.isRecurring" color="blue" dark>Renda Recorrente</v-chip>
                <v-btn x-small icon height="35px" width="35px" @click="this.$emit('toggle-recurring', this.income)"
                    color="primary" class="mr-2">
                    <v-icon>{{ income.isRecurring ? 'mdi-star-outline' : 'mdi-star' }}</v-icon>
                </v-btn>
                <v-btn x-small icon height="35px" width="35px" color="red" @click="$emit('deleteIncome', income)">
                    <v-icon>mdi-delete</v-icon>
                </v-btn>
            </v-col>
        </v-row>
    </v-list-item>
</template>

<script>
export default {
    name: 'IncomeItem',
    props: {
        income: Object
    },
}
</script>
<style>
.v-btn {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
}
</style>