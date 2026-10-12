import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import PlanTierBadge from '@/components/PlanTierBadge.vue'

vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key: string) => key }) }))

const render = (tier: 'STARTER' | 'TEAM') => mount(PlanTierBadge, {
  props: { tier },
  global: { stubs: { VIcon: { template: '<span aria-hidden="true"><slot /></span>' } } },
})

describe('PlanTierBadge', () => {
  it('labels a Starter Casa feature without inventing a Pro tier', () => {
    const badge = render('STARTER')
    expect(badge.text()).toContain('STARTER')
    expect(badge.attributes('aria-label')).toBe('planTierBadge.requiresStarter')
  })

  it('labels a Team-only feature', () => {
    const badge = render('TEAM')
    expect(badge.text()).toContain('TEAM')
    expect(badge.attributes('aria-label')).toBe('planTierBadge.requiresTeam')
  })
})
