import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import PlanOfferCard from '@/components/PlanOfferCard.vue'
import pt from '@/assets/locales/pt.json'

describe('PlanOfferCard', () => {
  it.each([
    { tier: 'casa' as const, regular: '55,00', first: '40,15', annual: '550,00', monthlyId: 'MONTHLY', annualId: 'ANNUAL' },
    { tier: 'team' as const, regular: '149,00', first: '108,77', annual: '1.490,00', monthlyId: 'BUSINESS_MONTHLY', annualId: 'BUSINESS_ANNUAL' },
  ])('keeps $tier monthly promotion separate from the annual purchase', async ({ tier, regular, first, annual, monthlyId, annualId }) => {
    const wrapper = mount(PlanOfferCard, {
      props: { tier },
      global: {
        plugins: [createI18n({ legacy: false, locale: 'pt', messages: { pt } })],
        stubs: { VIcon: true },
      },
    })

    expect(wrapper.get('.plan-offer__price').text()).toContain(regular)
    const offer = wrapper.get('.plan-offer__promotion').text()
    expect(offer).toContain('Na primeira assinatura')
    expect(offer).toContain(first)
    expect(offer).toContain(regular)
    expect(wrapper.get('.plan-offer__price').text()).toContain('/ mês')
    expect(offer.indexOf('30 dias grátis')).toBeLessThan(offer.indexOf(first))
    expect(offer.indexOf(first)).toBeLessThan(offer.indexOf(regular))
    expect(wrapper.get('details').attributes('open')).toBeUndefined()
    expect(wrapper.get('details').text()).toContain(`Cobrança anual de R$ ${annual}`)
    expect(wrapper.get('details').text()).toContain('não se aplica ao anual')

    await wrapper.get('.plan-offer__primary').trigger('click')
    await wrapper.get('.plan-offer__secondary').trigger('click')
    expect(wrapper.emitted('select')).toEqual([[monthlyId], [annualId]])
  })
})
