<template>
  <div class="scenario-change-card">
    <div class="scenario-change-card__top">
      <v-text-field
        :model-value="adjustment.label ?? ''"
        @update:model-value="$emit('update:label', $event)"
        label="Label (optional)"
        variant="outlined"
        density="comfortable"
        hide-details="auto"
        class="change-label"
        :style="{ borderRadius: '8px' }"
      />

      <button class="remove-btn" type="button" @click="$emit('remove')" aria-label="Remove change">
        <v-icon size="20">mdi-delete-outline</v-icon>
      </button>
    </div>

    <div class="segmented-control">
      <button
        v-for="option in ['INCOME', 'EXPENSE']"
        :key="option"
        :class="['segment', { active: adjustment.flow === option }]"
        @click="$emit('update:flow', option)"
        type="button"
      >
        {{ option.charAt(0) + option.slice(1).toLowerCase() }}
      </button>
    </div>

    <div class="change-inputs">
      <v-text-field
        :model-value="adjustment.monthlyChange"
        @update:model-value="$emit('update:monthlyChange', $event)"
        label="Monthly change"
        type="number"
        min="0"
        variant="outlined"
        density="comfortable"
        hide-details="auto"
        class="change-input"
        :style="{ borderRadius: '8px' }"
      />
      <v-text-field
        :model-value="adjustment.oneTimeChange"
        @update:model-value="$emit('update:oneTimeChange', $event)"
        label="One-time change"
        type="number"
        min="0"
        variant="outlined"
        density="comfortable"
        hide-details="auto"
        class="change-input"
        :style="{ borderRadius: '8px' }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  adjustment: {
    label?: string
    flow: 'INCOME' | 'EXPENSE'
    monthlyChange: number
    oneTimeChange: number
  }
}>()
defineEmits([
  'update:label',
  'update:flow',
  'update:monthlyChange',
  'update:oneTimeChange',
  'remove'
])
</script>

<style scoped>
.scenario-change-card {
  border: 1px solid rgba(15, 23, 42, 0.12);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
  background: rgb(var(--v-theme-surface), #181c24);
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.scenario-change-card__top {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.change-label {
  flex: 1 1 auto;
  min-width: 0;
}

.segmented-control {
  display: flex;
  border-radius: 8px;
  overflow: hidden;
  border: 1.5px solid #a3aed6;
  margin-bottom: 0;
  width: 100%;
  background: rgb(var(--v-theme-surface), #181c24);
}

.segment {
  flex: 1;
  padding: 8px 0;
  background: transparent;
  border: none;
  color: #cbd5e1;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s;
  outline: none;
  border-right: 1.5px solid #a3aed6;
}
.segment:last-child {
  border-right: none;
}
.segment:not(.active) {
  background: transparent;
  color: #cbd5e1;
}
.segment.active {
  background: #667eea;
  color: #fff;
}

.change-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
@media (max-width: 600px) {
  .change-inputs {
    grid-template-columns: 1fr;
  }
}

.remove-btn {
  background: none;
  border: none;
  color: #b91c1c;
  border-radius: 10px;
  padding: 8px;
  cursor: pointer;
  transition: background 0.15s;
  flex: 0 0 auto;
}
.remove-btn:hover {
  background: #fef2f2;
}

@media (max-width: 600px) {
  .scenario-change-card {
    padding: 14px;
    gap: 14px;
  }

  .scenario-change-card__top {
    flex-direction: column;
    align-items: stretch;
  }

  .remove-btn {
    align-self: flex-end;
  }
}
</style>
