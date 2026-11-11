import { afterEach, describe, expect, it, vi } from 'vitest'
import { enableAutoUnmount, flushPromises, shallowMount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import PublicDecisionView from '@/views/PublicDecisionView.vue'
import DecisionDetailView from '@/views/DecisionDetailView.vue'
import pt from '@/assets/locales/pt.json'

enableAutoUnmount(afterEach)
const { getPublicDecision } = vi.hoisted(() => ({ getPublicDecision: vi.fn() }))
vi.mock('@/services/DecisionService', () => ({ default: { getPublicDecision } }))
vi.mock('vue-router', () => ({ useRoute: () => ({ params: { id: 'public-id' } }), useRouter: () => ({ push: vi.fn() }) }))

for (const view of [PublicDecisionView, DecisionDetailView]) {
  describe(`${view.__name} public lifecycle`, () => {
    it.each(['OPEN', 'APPROVED', 'REJECTED'])('loads only the public DTO and labels %s without claiming application', async status => {
      getPublicDecision.mockReset().mockResolvedValue({ data: { decisionId: 'public-id', title: 'Escolha', status,
        impact: { monthlyImpact: -50, projectedFinalBalance: 1000, firstRiskMonth: null },
        summary: { message: 'Resumo público' }, votes: { approvals: 1, rejections: 0 }, justifications: [],
      } })
      const wrapper = shallowMount(view, { global: { plugins: [createI18n({ legacy: false, locale: 'pt', messages: { pt } }), createVuetify({ components })] } })
      await flushPromises()
      expect(getPublicDecision).toHaveBeenCalledExactlyOnceWith('public-id')
      expect(wrapper.text()).toContain(pt.decisionJourney.continuation[status === 'OPEN' ? 'open' : status === 'APPROVED' ? 'approved' : 'rejected'])
      expect(wrapper.text()).toContain(pt.decisionJourney.continuation.publicHelp)
      expect(wrapper.text()).not.toContain('Aplicada ao plano')
      expect(wrapper.text()).not.toMatch(/6 meses|seis meses|plano-base/i)
    })
    it('does not show a lifecycle claim when public loading fails', async () => {
      getPublicDecision.mockReset().mockRejectedValue({ response: { status: 404 } })
      const wrapper = shallowMount(view, { global: { plugins: [createI18n({ legacy: false, locale: 'pt', messages: { pt } }), createVuetify({ components })] } })
      await flushPromises()
      expect(wrapper.text()).not.toContain(pt.decisionJourney.continuation.approved)
      expect(wrapper.text()).not.toContain(pt.decisionJourney.continuation.publicHelp)
    })
  })
}
