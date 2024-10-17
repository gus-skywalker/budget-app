<template>
    <v-card class="mt-4">
        <v-card-title>Adicionar Contribuição</v-card-title>
        <v-card-text>
            <v-form @submit.prevent="submitContribution">
                <v-text-field label="Valor da Contribuição" v-model="contributionAmount" type="number" outlined required
                    class="mb-4"></v-text-field>

                <v-btn type="submit" color="primary">Adicionar Contribuição</v-btn>
            </v-form>
        </v-card-text>
    </v-card>
</template>

<script>
export default {
    props: {
        goal: {
            type: Object,
            required: true,
        },
    },
    data() {
        return {
            contributionAmount: 0,
        };
    },
    methods: {
        submitContribution() {
            if (this.contributionAmount > 0) {
                // Emitir evento com a contribuição para o componente pai
                this.$emit('contribution-added', parseFloat(this.contributionAmount), this.goal.id);

                // Resetar campo de contribuição
                this.contributionAmount = 0;
            } else {
                alert('Por favor, insira um valor válido para a contribuição.');
            }
        },
    },
};
</script>

<style scoped>
/* Estilos personalizados para o componente de contribuição */
</style>