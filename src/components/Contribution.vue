<template>
    <v-form @submit.prevent="submitContribution">
        <v-text-field :label="$t('financial_goals.amount')" v-model="contributionForm.amount" type="number" required
            outlined class="mb-4"></v-text-field>
        <v-text-field :label="$t('financial_goals.description')" v-model="contributionForm.description" outlined
            class="mb-4"></v-text-field>
        <v-btn type="submit" color="primary">
            {{ $t('financial_goals.add_contribution') }}
        </v-btn>
    </v-form>
</template>

<script>
import FinancialGoalService from '@/services/FinancialGoalService';

export default {
    props: {
        goal: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            contributionForm: {
                amount: 0,
                description: '',
                // Não precisa passar o financialGoal no payload, pois o goalId está na URL
                date: new Date().toISOString().substr(0, 10) // "YYYY-MM-DD"
            }
        };
    },
    methods: {
        submitContribution() {
            // Extraia o goalId do prop
            const goalId = this.goal.id;

            const contributionData = {
                amount: this.contributionForm.amount,
                description: this.contributionForm.description,
                date: this.contributionForm.date
            };

            FinancialGoalService.addContribution(goalId, contributionData)
                .then(() => {
                    this.$emit('contribution-added');
                    // Resetar o formulário
                    this.contributionForm = {
                        amount: 0,
                        description: '',
                        date: new Date().toISOString().substr(0, 10)
                    };
                })
                .catch((error) => {
                    console.error('Erro ao adicionar contribuição:', error);
                });
        }
    }
}
</script>

<style scoped>
/* Estilos específicos, se necessário */
</style>