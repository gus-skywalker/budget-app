import { describe, expect, it } from 'vitest'
import { presentDecisionResult, savedResultEvidence, decisionResultNarrative, type ResultEvidence } from '@/utils/decisionResultPresentation'
import pt from '@/assets/locales/pt.json'
import type { SavedScenario } from '@/services/ScenarioService'

const translate = (key: string, params: Record<string, string | number> = {}) => {
  const message = key.split('.').reduce((value: any, part) => value[part], pt) as string
  return message.replace(/\{(\w+)\}/g, (_, name) => String(params[name]))
}
const money = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const narrative = (input: ResultEvidence, origin: 'live' | 'saved' | 'legacy' = 'live') => decisionResultNarrative(presentDecisionResult(input, origin), translate, money)

describe('decision result risk evidence', () => {
  it('distinguishes an omitted risk field from an explicit null', () => {
    expect(presentDecisionResult({ decisionStatus: 'STABLE' }, 'saved').riskKnown).toBe(false)
    expect(presentDecisionResult({ decisionStatus: 'STABLE', firstRiskMonth: null }, 'live').riskKnown).toBe(true)
  })

  it('does not accept an inherited property as evidence supplied by the result', () => {
    const result = Object.assign(Object.create({ firstRiskMonth: null }), { decisionStatus: 'STABLE' })
    expect(presentDecisionResult(result, 'saved').riskKnown).toBe(false)
  })

  it('does not claim known risk for NO_DATA or an invalid field', () => {
    expect(presentDecisionResult({ decisionStatus: 'NO_DATA', firstRiskMonth: null }, 'live').riskKnown).toBe(false)
    expect(presentDecisionResult({ decisionStatus: 'STABLE', firstRiskMonth: '' }, 'live').riskKnown).toBe(false)
  })
})

describe('result presentation without financial recomputation', () => {
  it.each([
    { impact: -100, monthly: [-600, 0], label: 'a menos' },
    { impact: 200, monthly: [200, 200], label: 'a mais' },
  ])('keeps the returned average distinct from per-month changes: $impact', ({ impact, monthly, label }) => {
    const input: ResultEvidence = { sourceType: 'BUDGET_BASED', decisionStatus: 'STABLE', months: 6,
      scenarioMonthlyImpact: impact, projectedFinalBalance: 4321,
      projection: monthly.map((amount, index) => ({ period: `2026-${10 + index}`, changeImpact: amount,
        baselineIncome: 5000, baselineExpense: 3000, baselineBalance: 1000, scenarioIncome: 5000, scenarioExpense: 3200, scenarioBalance: 800, sources: ['CONFIRMED', 'SCENARIO_CHANGE'] })) }
    const original = JSON.stringify(input)
    const model = presentDecisionResult(input, 'live')
    expect(model.impact).toEqual({ value: impact, source: 'live' })
    expect(model.rows.map(row => row.changeImpact)).toEqual(monthly)
    expect(model.months).toBe(6) // Never infer horizon from row count.
    expect(model.finalBalance.value).toBe(4321) // Never rebuild the accumulated balance.
    expect(narrative(input).headline).toContain(label)
    expect(narrative(input).summary).toContain('não uma parcela')
    expect(JSON.stringify(input)).toBe(original)
  })

  it('keeps missing saved metrics absent and does not derive goal money from final balance', () => {
    const input = savedResultEvidence({ id: 'old', name: 'Antigo', months: null, projectedFinalBalance: 1200, deltas: [] })
    const model = presentDecisionResult(input, 'saved')
    expect(model.months).toBeNull()
    for (const field of [model.impact, model.initialBalance, model.baseline, model.availableForGoals, model.goalsCount]) {
      expect(field).toEqual({ value: null, source: null })
    }
    expect(model.riskKnown).toBe(false)
    expect(model.finalBalance.value).toBe(1200)
    expect(narrative(input, 'saved').speech).toContain('período total não foi informado')
    expect(narrative(input, 'saved').speech).not.toContain(money(0))
  })

  it('keeps legitimate zeros and rejects null, NaN, infinity and coercible strings', () => {
    expect(presentDecisionResult({ currentBalance: 0 }, 'live').initialBalance).toEqual({ value: 0, source: 'live' })
    for (const value of [null, undefined, NaN, Infinity, '0', '']) {
      const model = presentDecisionResult({ currentBalance: value } as ResultEvidence, 'live')
      expect(model.initialBalance.value).toBeNull()
    }
  })

  it('does not announce NO_DATA as success or promote its default zero to an estimate', () => {
    const copy = narrative({ decisionStatus: 'NO_DATA', scenarioMonthlyImpact: 0, projectedFinalBalance: 0, firstRiskMonth: null })
    expect(copy.headline).toContain('faltam dados')
    expect(copy.final).toContain('Não há dados suficientes')
    expect(copy.speech).not.toContain('sem mudança')
    expect(copy.speech).not.toContain(money(0))
    expect(presentDecisionResult({}, 'saved').tone).toBe('unknown')
  })

  it('explains a negative balance and preserves the exact risk month only when supplied', () => {
    const copy = narrative({ decisionStatus: 'ACTION_NEEDED', scenarioMonthlyImpact: -100, projectedFinalBalance: -300, firstRiskMonth: '2026-12' })
    expect(copy.final).toContain(`faltariam ${money(300)}`)
    expect(copy.risk).toContain('2026-12')
    expect(copy.risk).toContain('Primeiro mês')
    const missing = narrative({ decisionStatus: 'ACTION_NEEDED', projectedFinalBalance: -300 })
    expect(missing.risk).toContain('não está disponível')
    expect(missing.risk).not.toContain('2026')
  })

  it('preserves legacy forecast numbers without inventing monthly flows or sources', () => {
    const saved: SavedScenario = { id: 'legacy', name: 'Histórico', deltas: [], forecast: [
      { month: '2025-07', baselineProjectedBalance: 123, scenarioProjectedBalance: -456, deltaImpact: -25, status: 'deficit' },
    ] }
    const model = presentDecisionResult(savedResultEvidence(saved), 'legacy')
    expect(model.origin).toBe('legacy')
    expect(model.months).toBeNull()
    expect(model.rows[0]).toMatchObject({ period: '2025-07', baselineBalance: 123, scenarioBalance: -456, changeImpact: -25, baselineIncome: null, scenarioExpense: null, sources: [], legacy: true })
    expect(model.finalBalance.value).toBeNull()
  })

  it('does not fill incomplete projection rows with zeros or calendar dates', () => {
    const model = presentDecisionResult({ projection: [{ changeImpact: 0 }] } as ResultEvidence, 'saved')
    expect(model.rows[0]).toMatchObject({ period: null, baselineBalance: null, scenarioBalance: null, baselineIncome: null, changeImpact: 0 })
  })

  it('separates debt comparison from budget average and uses the same statements for speech', () => {
    const model = presentDecisionResult({ sourceType: 'MANUAL_TYPED', scenarioMonthlyImpact: -99,
      debtComparison: { tradeOffSummary: 'Uma opção custa menos, outra tem custo previsível.' } } as ResultEvidence, 'live')
    const copy = decisionResultNarrative(model, translate, money)
    expect(copy.headline).toContain('formas de pagar')
    expect(copy.speech).toContain(copy.summary)
    expect(copy.speech).toContain(copy.impactHelp)
    expect(copy.speech).not.toContain('Em média')
    expect(copy.speech).not.toContain(money(99))
  })

  it('marks explicit recalculation without relabeling it as saved history', () => {
    const model = presentDecisionResult({ decisionStatus: 'WATCH', scenarioMonthlyImpact: -50 }, 'live', true)
    const copy = decisionResultNarrative(model, translate, money)
    expect(copy.origin).toContain('recálculo solicitado')
    expect(copy.speech).toBe([copy.origin, copy.headline, copy.summary, copy.horizon, copy.status, copy.risk, copy.final, copy.caution].join(' '))
  })
})
