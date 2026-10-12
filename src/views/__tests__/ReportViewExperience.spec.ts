import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ReportView from '@/views/ReportView.vue'
import ReportGenerator from '@/components/ReportGenerator.vue'

const routeState = vi.hoisted(() => ({ query: {} as Record<string, string> }))

vi.mock('vue-router', () => ({ useRoute: () => ({ query: routeState.query }) }))
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key: string) => key }) }))
vi.mock('@/components/PageHeader.vue', () => ({ default: { name: 'PageHeader', template: '<header />' } }))
vi.mock('@/components/ReportAnalyticsPanel.vue', () => ({ default: { name: 'ReportAnalyticsPanel', template: '<section class="analytics-stub" />' } }))
vi.mock('@/components/ReportGenerator.vue', () => ({ default: {
  name: 'ReportGenerator',
  props: ['initialReportType', 'initialStartDate', 'initialEndDate', 'initialCategoryFilter'],
  template: '<div class="generator-stub" />',
} }))

const mountView = () => mount(ReportView, { global: { stubs: { VIcon: true } } })

describe('ReportView guided export', () => {
  beforeEach(() => { routeState.query = {} })

  it('keeps detailed export optional on the default route', () => {
    const wrapper = mountView()
    expect(wrapper.find('.analytics-stub').exists()).toBe(true)
    expect((wrapper.get('.report-export').element as HTMLDetailsElement).open).toBe(false)
  })

  it('opens export automatically when a report deep link supplies filters', () => {
    routeState.query = { reportType: 'expenses', startDate: '2026-10-01', endDate: '2026-10-31', category: '7' }
    const wrapper = mountView()
    expect((wrapper.get('.report-export').element as HTMLDetailsElement).open).toBe(true)
    expect(wrapper.getComponent(ReportGenerator).props()).toEqual(expect.objectContaining({
      initialReportType: 'expenses',
      initialStartDate: '2026-10-01',
      initialEndDate: '2026-10-31',
      initialCategoryFilter: '7',
    }))
  })
})
