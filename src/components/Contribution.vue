<template>
    <v-form @submit.prevent="submitContribution" class="contribution-form">
        <div class="contribution-form__grid">
            <v-text-field
                :label="$t('financial_goals.amount')"
                v-model="contributionForm.amount"
                type="number"
                required
                variant="outlined"
                density="comfortable"
                color="var(--cb-primary)"
            ></v-text-field>
            <v-text-field
                :label="$t('financial_goals.description_optional')"
                v-model="contributionForm.description"
                variant="outlined"
                density="comfortable"
                color="var(--cb-primary)"
            ></v-text-field>
        </div>
        <v-btn type="submit" color="primary" class="contribution-form__button">
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
.contribution-form {
    margin-top: 16px;
}

.contribution-form__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 12px;
}

.contribution-form__button {
    margin-top: 8px;
    text-transform: none;
    font-weight: 600;
}
</style>
