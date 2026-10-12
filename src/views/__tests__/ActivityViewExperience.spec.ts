import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ActivityView from '@/views/ActivityView.vue'

const { list, push } = vi.hoisted(() => ({ list: vi.fn(), push: vi.fn() }))

vi.mock('@/services/ActivityService', () => ({ default: { list } }))
vi.mock('vue-router', () => ({ useRouter: () => ({ push }) }))
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key: string) => key, locale: { value: 'pt' } }) }))
vi.mock('@/components/PageHeader.vue', () => ({ default: { template: '<header><slot name="actions" /></header>' } }))

const mountView = () => mount(ActivityView, { global: { stubs: {
  VBtn: { emits: ['click'], template: '<button @click="$emit(\'click\')"><slot /></button>' },
  VChip: { emits: ['click'], template: '<button @click="$emit(\'click\')"><slot /></button>' },
  VIcon: { template: '<span><slot /></span>' },
} } })

describe('ActivityView experience states', () => {
  beforeEach(() => { list.mockReset(); push.mockReset() })

  it('shows a retryable error instead of a false empty state', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    list.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce({ data: [] })
    const wrapper = mountView()
    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toContain('activity.load_error')
    expect(wrapper.text()).not.toContain('overview.activity_empty')

    await wrapper.get('[role="alert"] button').trigger('click')
    await flushPromises()
    expect(list).toHaveBeenCalledTimes(2)
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('overview.activity_empty')
    vi.restoreAllMocks()
  })

  it('does not offer a broken scenario link without an entity id', async () => {
    list.mockResolvedValue({ data: [{ id: 'event-1', eventType: 'SCENARIO_CREATED', title: 'Cenário',
      relatedEntityType: 'SCENARIO', createdAt: '2026-10-11T10:00:00Z' }] })
    const wrapper = mountView()
    await flushPromises()

    expect(wrapper.text()).toContain('Cenário')
    expect(wrapper.text()).not.toContain('overview.activity_open')
  })
})
