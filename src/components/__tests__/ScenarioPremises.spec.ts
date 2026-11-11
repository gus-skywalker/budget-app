import { afterEach, describe, expect, it, vi } from 'vitest'
import { enableAutoUnmount, shallowMount } from '@vue/test-utils'
import { nextTick, reactive, ref } from 'vue'
import ScenarioChangeCard from '@/components/ScenarioChangeCard.vue'
import ScenarioAdvancedFields from '@/components/ScenarioAdvancedFields.vue'
import ScenarioDeltaSummary from '@/components/ScenarioDeltaSummary.vue'
import { buildScenarioPayload, buildSimulationPayload, createAdjustment, mapDeltasToSimpleAdjustments, type ScenarioWizardSnapshot } from '@/utils/scenarioWizard'
import type { ScenarioDeltaType, ScenarioTemporalType } from '@/services/ScenarioService'

enableAutoUnmount(afterEach)
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key: string) => key, locale: ref('pt') }) }))
vi.mock('@/i18n', () => ({ default: { global: { locale: { value: 'pt' } } } }))
const fieldStub = { props: ['prefix'], template: '<div />' }
const options = { global: { stubs: { 'v-select': fieldStub, 'v-text-field': fieldStub, 'v-icon': true } } }
const draft = (): ScenarioWizardSnapshot => ({ scenarioName: 'Meu teste', months: 6, currentScenarioId: null,
  adjustments: [createAdjustment()], scenarioLines: [] })

function mountCard(adjustment = createAdjustment()) {
  const state = reactive(adjustment)
  const listeners = Object.fromEntries(Object.keys(state).map(key => [`onUpdate:${key}`, (value: unknown) => {
    (state as unknown as Record<string, unknown>)[key] = value
  }]))
  // Optional originalDeltaType is not necessarily present on a newly created adjustment.
  listeners['onUpdate:originalDeltaType'] = (value: unknown) => { state.originalDeltaType = value as ScenarioDeltaType | undefined }
  return { state, wrapper: shallowMount(ScenarioChangeCard, { ...options, props: { adjustment: state, ...listeners } }) }
}

describe('guided premises preserve financial inputs', () => {
  for (const type of ['EXPENSE_REDUCTION', 'INCOME_REDUCTION', 'PERCENT_EXPENSE_REDUCTION', 'PERCENT_INCOME_REDUCTION'] as const) {
    for (const temporalType of ['SINGLE', 'ONGOING', 'FIXED_PERIOD'] as const) {
      it(`round-trips ${type} / ${temporalType} without editing hidden controls`, async () => {
        const delta = { label: 'Original', type, amount: 12, temporalType, startMonthOffset: 2,
          ...(type.startsWith('PERCENT_') ? { percentage: 12 } : {}),
          ...(temporalType === 'FIXED_PERIOD' ? { endMonthOffset: 4 } : {}) }
        const { wrapper, state } = mountCard(mapDeltasToSimpleAdjustments([delta])[0])
        expect((wrapper.vm as any).kind).toBe(type.includes('EXPENSE') ? 'reduceExpense' : 'reduceIncome')
        await wrapper.find('details').trigger('toggle')
        await wrapper.find('details').trigger('toggle')
        const snapshot = { ...draft(), adjustments: [state] }
        expect(buildScenarioPayload(snapshot).deltas[0]).toEqual(expect.objectContaining(delta))
        expect(wrapper.emitted('update:valueMode')).toBeUndefined()
      })
    }
  }

  it('creates a real expense reduction and clears that operation when explicitly changed', async () => {
    const { wrapper, state } = mountCard()
    const vm = wrapper.vm as any
    vm.updateKind('reduceExpense')
    await nextTick()
    vm.updateAmount(200)
    expect(buildScenarioPayload({ ...draft(), adjustments: [state] }).deltas[0]).toMatchObject({ type: 'EXPENSE_REDUCTION', amount: 200 })
    vm.updateKind('expense')
    expect(buildScenarioPayload({ ...draft(), adjustments: [state] }).deltas[0].type).toBe('MONTHLY_EXPENSE')
  })

  it('requires reentry on an explicit unit switch, never interpreting money as percent or vice versa', async () => {
    const { wrapper, state } = mountCard(createAdjustment({ amount: 200, monthlyChange: 200, originalDeltaType: 'EXPENSE_REDUCTION', flow: 'INCOME' }))
    const vm = wrapper.vm as any
    vm.updateValueMode('PERCENTAGE')
    await nextTick()
    expect(state).toMatchObject({ valueMode: 'PERCENTAGE', originalDeltaType: 'PERCENT_EXPENSE_REDUCTION', amount: 0, percentage: 0, monthlyChange: 0, oneTimeChange: 0 })
    expect(buildScenarioPayload({ ...draft(), adjustments: [state] }).deltas).toEqual([])
    vm.updateAmount(10)
    expect(buildScenarioPayload({ ...draft(), adjustments: [state] }).deltas[0]).toMatchObject({ type: 'PERCENT_EXPENSE_REDUCTION', percentage: 10 })
    vm.updateValueMode('AMOUNT')
    await nextTick()
    expect(state).toMatchObject({ valueMode: 'AMOUNT', originalDeltaType: 'EXPENSE_REDUCTION', amount: 0, percentage: 0 })
    expect(buildScenarioPayload({ ...draft(), adjustments: [state] }).deltas).toEqual([])
  })

  it('keeps fixed periods valid when their start is moved after their old end', async () => {
    const { wrapper, state } = mountCard(createAdjustment({ temporalType: 'FIXED_PERIOD', amount: 50, startMonthOffset: 1, endMonthOffset: 2 }))
    ;(wrapper.vm as any).updateStartMonth(4)
    await nextTick()
    expect(state.endMonthOffset).toBe(4)
    expect(buildScenarioPayload({ ...draft(), adjustments: [state] }).deltas[0]).toMatchObject({ startMonthOffset: 4, endMonthOffset: 4 })
    ;(wrapper.vm as any).updateTemporalType('SINGLE' as ScenarioTemporalType)
    expect(buildScenarioPayload({ ...draft(), adjustments: [state] }).deltas[0]).toMatchObject({ type: 'ONE_TIME_EXPENSE', temporalType: 'SINGLE', amount: 50, endMonthOffset: undefined })
  })

  it('preserves advanced fields on collapse and keeps line deltas out of the save payload', async () => {
    const snapshot = draft()
    snapshot.scenarioLines = [{ category: 'Casa', type: 'EXPENSE', originalAmount: 500, adjustedAmount: 400 }]
    const before = JSON.stringify(snapshot)
    const wrapper = shallowMount(ScenarioAdvancedFields, { ...options, props: { snapshot } })
    await wrapper.find('details').trigger('toggle')
    await wrapper.find('details').trigger('toggle')
    expect(JSON.stringify(snapshot)).toBe(before)
    expect(buildScenarioPayload(snapshot).deltas).toEqual([])
    const preview = buildSimulationPayload(snapshot)
    expect(preview.deltas).toEqual([{ label: 'Baseline adjustment: Casa', type: 'MONTHLY_INCOME', amount: 100, startMonthOffset: 0 }])
    expect(preview.lineAdjustments).toEqual(buildScenarioPayload(snapshot).lineAdjustments)
    expect(mapDeltasToSimpleAdjustments(preview.deltas)[0].amount).toBe(0)
    const summary = shallowMount(ScenarioDeltaSummary, { props: { delta: preview.deltas[0] } })
    expect(summary.text()).toContain('decisionJourney.form.lineIncrease')
    expect(summary.text()).not.toContain('Baseline adjustment:')
    expect(summary.text()).not.toContain('decisionJourney.form.income')
  })
})
