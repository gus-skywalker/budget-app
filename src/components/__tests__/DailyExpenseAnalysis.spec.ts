import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import DailyExpenseAnalysis from '@/components/DailyExpenseAnalysis.vue'

const messages: Record<string, string> = {
  'expense.daily_report_title': 'Gastos diários',
  'expense.daily_report_window_total': 'Últimos 7 dias • {total}',
  'expense.daily_report_total_window': 'Total da janela',
  'expense.daily_report_average': 'Média diária',
  'expense.daily_report_highest': 'Maior gasto',
  'expense.daily_report_highest_mark': 'Maior',
  'expense.daily_report_expand': 'Ver análise',
  'expense.daily_report_collapse': 'Recolher',
  'expense.daily_report_clear_day': 'Limpar dia',
  'expense.daily_report_transaction_count': '{count} transação(ões)',
  'expense.daily_report_day_aria': '{date}: {total}, {count} transação(ões). {highest}',
  'expense.daily_report_chart_label': 'Gastos por dia nos últimos 7 dias',
  'expense.daily_report_metrics_label': 'Resumo dos gastos diários',
  'expense.daily_report_loading': 'Carregando gastos diários…',
  'expense.daily_report_error': 'Não foi possível carregar os gastos diários.',
  'expense.daily_report_retry': 'Tentar novamente',
  'expense.daily_report_empty': 'Nenhum gasto nos últimos 7 dias.',
}

const translate = (key: string, params: Record<string, unknown> = {}) => {
  let text = messages[key] || key
  Object.entries(params).forEach(([name, value]) => {
    text = text.replace(`{${name}}`, String(value))
  })
  return text
}

const sevenDays = [
  { date: '2026-07-20', total: 0, count: 0 },
  { date: '2026-07-21', total: 90, count: 2 },
  { date: '2026-07-22', total: 1250000.75, count: 8 },
  { date: '2026-07-23', total: 45, count: 1 },
  { date: '2026-07-24', total: 300, count: 3 },
  { date: '2026-07-25', total: 18, count: 1 },
  { date: '2026-07-26', total: 76, count: 2 },
]

const mountAnalysis = (props: Record<string, unknown> = {}) => mount(DailyExpenseAnalysis, {
  props: { rows: sevenDays, ...props },
  global: {
    mocks: {
      $t: translate,
      $i18n: { locale: 'pt' },
    },
  },
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('DailyExpenseAnalysis', () => {
  it('renders a fixed seven-day comparison with totals and a visible highest day', () => {
    const wrapper = mountAnalysis()

    expect(wrapper.findAll('.daily-analysis__day')).toHaveLength(7)
    expect(wrapper.text()).toContain('R$ 1.250.529,75')
    expect(wrapper.text()).toContain('R$ 178.647,11')
    expect(wrapper.get('.daily-analysis__day--highest').text()).toContain('Maior')
    expect(wrapper.get('.daily-analysis__day--highest').attributes('aria-label')).toContain('R$ 1.250.000,75')
  })

  it('applies and clears an evident selected-day state', async () => {
    const wrapper = mountAnalysis({ selectedDate: '2026-07-24' })
    const selected = wrapper.get('.daily-analysis__day--selected')

    expect(selected.element.tagName).toBe('BUTTON')
    expect(selected.attributes('aria-pressed')).toBe('true')
    await wrapper.findAll('.daily-analysis__day')[1].trigger('click')
    expect(wrapper.emitted('select-date')?.[0]).toEqual(['2026-07-21'])

    await wrapper.get('.daily-analysis__clear').trigger('click')
    expect(wrapper.emitted('clear-date')).toHaveLength(1)
  })

  it('starts collapsed on mobile and exposes the compact summary before expanding', async () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }))
    const wrapper = mountAnalysis()

    expect(wrapper.find('#daily-analysis-content').exists()).toBe(false)
    expect(wrapper.text()).toContain('Últimos 7 dias')
    expect(wrapper.get('.daily-analysis__toggle').attributes('aria-expanded')).toBe('false')

    await wrapper.get('.daily-analysis__toggle').trigger('click')
    expect(wrapper.find('#daily-analysis-content').exists()).toBe(true)
  })

  it('handles no spend, one day, loading and retryable error states', async () => {
    const empty = mountAnalysis({ rows: sevenDays.map((day) => ({ ...day, total: 0, count: 0 })) })
    expect(empty.text()).toContain('Nenhum gasto nos últimos 7 dias.')
    expect(empty.find('.daily-analysis__chart').exists()).toBe(false)

    const oneDay = mountAnalysis({ rows: [{ date: '2026-07-26', total: 42, count: 1 }] })
    expect(oneDay.findAll('.daily-analysis__day')).toHaveLength(1)

    const loading = mountAnalysis({ loading: true })
    expect(loading.get('[role="status"]').text()).toContain('Carregando')

    const error = mountAnalysis({ error: true })
    await error.get('.daily-analysis__state--error button').trigger('click')
    expect(error.emitted('retry')).toHaveLength(1)
  })
})
