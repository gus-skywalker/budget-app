import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import SharedWithMeView from '@/views/SharedWithMeView.vue'

const { listReceived } = vi.hoisted(() => ({ listReceived: vi.fn() }))
vi.mock('@/services/SharedExpenseAgreementService', () => ({ default: { listReceived } }))
vi.mock('@/plugins/userStore', () => ({ useUserStore: () => ({ getUser: { id: 'me', email: 'me@example.test' } }) }))
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key: string) => key, locale: { value: 'pt' } }) }))

const mountView = () => mount(SharedWithMeView, { global: { stubs: {
  VBtn: { emits: ['click'], template: '<button @click="$emit(\'click\')"><slot /></button>' },
  VIcon: { template: '<span><slot /></span>' },
  VProgressCircular: { template: '<span />' },
} } })

const agreement = {
  id: 'agreement-1', title: 'Compra compartilhada', totalAmount: 100, sharedAmount: 70,
  paymentMode: 'DEBIT', installmentCount: 1,
  participants: [{ id: 'other', userId: 'other-user', email: 'other@example.test', sharedAmount: 70 }],
  obligations: [{ id: 'other-obligation', participantId: 'other', installmentNumber: 1, amount: 70 }],
}

describe('SharedWithMeView identity and recovery', () => {
  beforeEach(() => listReceived.mockReset())

  it('does not label another participant share or obligations as mine', async () => {
    listReceived.mockResolvedValue({ data: [agreement] })
    const wrapper = mountView()
    await flushPromises()

    expect(wrapper.text()).toContain('sharedWithMe.participantUnknown')
    expect(wrapper.find('.agreement-main > strong').exists()).toBe(false)
    expect(wrapper.find('.obligation-list').exists()).toBe(false)
    expect(wrapper.text()).toContain('Compra compartilhada')
  })

  it('shows only the matching participant obligations', async () => {
    listReceived.mockResolvedValue({ data: [{ ...agreement,
      participants: [...agreement.participants, { id: 'mine', userId: 'me', email: 'me@example.test', sharedAmount: 30 }],
      obligations: [...agreement.obligations, { id: 'mine-obligation', participantId: 'mine', installmentNumber: 2, amount: 30 }],
    }] })
    const wrapper = mountView()
    await flushPromises()

    expect(wrapper.find('.agreement-main > strong').text()).toContain('30')
    expect(wrapper.findAll('.obligation-row')).toHaveLength(1)
    expect(wrapper.find('.obligation-row').text()).toContain('30')
  })

  it('retries an error without showing a false empty state', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    listReceived.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce({ data: [] })
    const wrapper = mountView()
    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toContain('sharedWithMe.loadError')
    await wrapper.get('[role="alert"] button').trigger('click')
    await flushPromises()
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('sharedWithMe.emptyTitle')
    vi.restoreAllMocks()
  })
})
