import { afterAll, describe, expect, it } from 'vitest'
import { config, shallowMount } from '@vue/test-utils'
import ExpenseItem from '@/components/ExpenseItem.vue'
import IncomeItem from '@/components/IncomeItem.vue'

const options = {
  global: { mocks: { $t: (key: string) => key } },
}

const originalRenderStubDefaultSlot = config.global.renderStubDefaultSlot
config.global.renderStubDefaultSlot = true
afterAll(() => { config.global.renderStubDefaultSlot = originalRenderStubDefaultSlot })

describe('transaction rows in a read-only workspace', () => {
  it('keeps expense information visible without write controls', () => {
    const wrapper = shallowMount(ExpenseItem, {
      ...options,
      props: {
        canWrite: false,
        expense: { id: 'expense-1', description: 'Groceries', amount: '100', date: '2026-10-04', visibilityScope: 'WORKSPACE', reconciliationConflictId: 'conflict-1' },
      },
    })

    expect(wrapper.text()).toContain('Groceries')
    expect(wrapper.find('.expense-actions').exists()).toBe(false)
    expect(wrapper.find('.conflict-resolution-row').exists()).toBe(false)
  })

  it('keeps income information visible without write controls', () => {
    const wrapper = shallowMount(IncomeItem, {
      ...options,
      props: {
        canWrite: false,
        income: { id: 'income-1', description: 'Salary', amount: '100', date: '2026-10-04', visibilityScope: 'WORKSPACE', reconciliationConflictId: 'conflict-1' },
      },
    })

    expect(wrapper.text()).toContain('Salary')
    expect(wrapper.find('.income-btn-group').exists()).toBe(false)
    expect(wrapper.find('.conflict-resolution-row').exists()).toBe(false)
  })
})
