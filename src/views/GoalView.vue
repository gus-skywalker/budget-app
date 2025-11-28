<template>
    <section class="goal-view">
        <FinancialGoal />

        <div class="ai-grid">
            <SavingsPlanForm />
            <AutoCategorizeForm />
        </div>
    </section>
</template>

<script>
import FinancialGoal from '@/components/FinancialGoal.vue'
import SavingsPlanForm from '@/components/ai/SavingsPlanForm.vue'
import AutoCategorizeForm from '@/components/ai/AutoCategorizeForm.vue'

export default {
    name: 'GoalView',
    components: {
        FinancialGoal,
        SavingsPlanForm,
        AutoCategorizeForm
    }
}
</script>

<style scoped>
.goal-view {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.ai-grid {
    display: grid;
    gap: 1.5rem;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
}
</style>