<template>
    <section class="goal-view">
        <FinancialGoal />

        <div class="ai-grid">
            <SavingsPlanForm />
        </div>
    </section>
</template>

<script>
import FinancialGoal from '@/components/FinancialGoal.vue'
import SavingsPlanForm from '@/components/ai/SavingsPlanForm.vue'

export default {
    name: 'GoalView',
    components: {
        FinancialGoal,
        SavingsPlanForm
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

<style>
.v-theme--dark .goal-view .ai-grid .ai-card {
    background: #111827;
    color: #e5eefb;
    border: 1px solid rgba(148, 163, 184, 0.22);
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.28);
}

.v-theme--dark .goal-view .ai-grid .ai-card h2,
.v-theme--dark .goal-view .ai-grid .ai-card h3,
.v-theme--dark .goal-view .ai-grid .ai-card h4,
.v-theme--dark .goal-view .ai-grid .ai-card h5,
.v-theme--dark .goal-view .ai-grid .ai-card p,
.v-theme--dark .goal-view .ai-grid .ai-card label,
.v-theme--dark .goal-view .ai-grid .ai-card li,
.v-theme--dark .goal-view .ai-grid .ai-card strong {
    color: inherit;
}

.v-theme--dark .goal-view .ai-grid select,
.v-theme--dark .goal-view .ai-grid input,
.v-theme--dark .goal-view .ai-grid textarea {
    background: #0f172a;
    color: #f8fafc;
    border: 1px solid rgba(148, 163, 184, 0.28);
}

.v-theme--dark .goal-view .ai-grid select option {
    background: #0f172a;
    color: #f8fafc;
}
</style>
