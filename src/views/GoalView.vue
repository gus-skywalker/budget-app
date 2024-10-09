<template>
    <FinancialGoal />
</template>

<script>
import FinancialGoal from '@/components/FinancialGoal.vue'

export default {
    name: 'GoalView',
    components: {
        FinancialGoal
    },
    data() {
        return {

        }
    }
};
</script>

<style scoped>
.section {
    margin-bottom: 16px;
}
</style>