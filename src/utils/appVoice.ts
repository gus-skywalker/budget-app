import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/plugins/userStore'
import { type AppVoice, normalizeAppVoice } from '@/utils/appVoiceTypes'

type VoiceLocale = 'pt' | 'en'
type VoiceCatalog = Partial<Record<VoiceLocale, Partial<Record<AppVoice, Record<string, string>>>>>

const formatTemplate = (template: string, params?: Record<string, unknown>): string => {
  if (!params) return template
  return template.replace(/\{([^}]+)\}/g, (_, key) => String(params[key] ?? `{${key}}`))
}

const catalog: VoiceCatalog = {
  pt: {
    warm: {
      'scenarioResult.monthlyImpact': 'Mudança mensal recorrente',
      'scenarioResult.projectionBasisLabel': 'Como essa conta anda no tempo',
      'scenarioResult.forecastExplainer':
        'Cada mês soma a folga esperada e aplica a mudança do cenário. O saldo cresce ou diminui nessa caminhada.',
      'scenarioResult.summary.watch':
        'Ainda fica positivo, mas aperta {count} meta(s). A primeira a sentir é {goal}.',
      'scenarioResult.summary.stable':
        'O caminho segue saudável: depois da mudança, entram {scenarioNet} por mês no plano.',
      'scenarioResult.summary.actionNeeded':
        'Aqui acende atenção: a projeção pode entrar no vermelho até {riskMonth}.',
      'scenarioResult.advisorSpeech.watch':
        'Vamos olhar com calma. Seu baseline é {baseline} por mês. Esse cenário muda o caixa em {impact} por mês, então o líquido projetado fica em {scenarioNet} por mês. No fim de {months} meses, o saldo fica em {finalBalance}. Ainda fica positivo, mas {count} meta(s) ficam mais apertadas, começando por {goal}.',
      'scenarioResult.advisorSpeech.stable':
        'Boa. Seu plano parte de {baseline} por mês. Com esse cenário, o líquido projetado fica em {scenarioNet} por mês. Em {months} meses, o saldo final estimado é {finalBalance}. A decisão parece sustentável dentro desse horizonte.',
      'scenarioResult.advisorSpeech.actionNeeded':
        'Atenção aqui. O baseline é {baseline} por mês, mas esse cenário adiciona um impacto de {impact} por mês. O líquido projetado vira {scenarioNet} por mês e pode levar o caixa para risco até {riskMonth}. Vale revisar antes de decidir.'
    },
    nordeste: {
      'scenarioResult.monthlyImpact': 'Mudança todo mês',
      'scenarioResult.projectionBasisLabel': 'Conta no compasso do tempo',
      'scenarioResult.forecastExplainer':
        'Aqui a conta é mês a mês: entra a folga prevista, sai o impacto do cenário, e a gente vê onde o caixa chega.',
      'scenarioResult.summary.watch':
        'Dá pra seguir, mas num é pra vacilar: {count} meta(s) ficam mais apertadas, começando por {goal}.',
      'scenarioResult.summary.stable':
        'Tá no caminho: com esse cenário, o caixa ainda soma {scenarioNet} por mês.',
      'scenarioResult.summary.actionNeeded':
        'Opa, aqui pede cuidado: desse jeito pode faltar caixa até {riskMonth}.',
      'scenarioResult.advisorSpeech.watch':
        'Oxente, bora ver essa conta direitinho. Todo mês a base traz {baseline}. Esse cenário puxa {impact}, aí sobra {scenarioNet} por mês. Em {months} meses, o caixa projetado chega em {finalBalance}. Dá pra seguir, mas {goal} vai sentir um aperreio.',
      'scenarioResult.advisorSpeech.stable':
        'A conta tá de pé. Entra {baseline} por mês, o cenário ajusta {impact}, e ainda fica {scenarioNet} por mês no caixa. No fim de {months} meses, a projeção chega em {finalBalance}.',
      'scenarioResult.advisorSpeech.actionNeeded':
        'Opa, segura um pouquinho. A base é {baseline} por mês, mas o cenário mexe {impact}. O líquido fica {scenarioNet} por mês e pode faltar caixa até {riskMonth}. Melhor ajeitar antes de bater o martelo.'
    },
    gaucho: {
      'scenarioResult.monthlyImpact': 'Impacto mensal firme',
      'scenarioResult.projectionBasisLabel': 'Conta na linha',
      'scenarioResult.forecastExplainer':
        'A tabela mostra o acumulado mês a mês. O baseline entra, o cenário pesa, e o saldo final aparece sem rodeio.',
      'scenarioResult.summary.watch':
        'Fecha positivo, mas com aperto: {count} meta(s) sentem pressão, primeiro {goal}.',
      'scenarioResult.summary.stable':
        'Tá redondo: mesmo com a mudança, o plano ainda soma {scenarioNet} por mês.',
      'scenarioResult.summary.actionNeeded':
        'Bah, atenção aqui: a projeção pode ficar negativa até {riskMonth}.',
      'scenarioResult.advisorSpeech.watch':
        'Conta reta. Tu tens {baseline} por mês de baseline. Esse cenário mexe {impact} por mês, então sobra {scenarioNet} por mês. Fecha {months} meses com {finalBalance}. Positivo, mas {goal} fica mais apertada.',
      'scenarioResult.advisorSpeech.stable':
        'Tá redondo. O baseline é {baseline} por mês, o cenário muda {impact}, e o líquido projetado fica {scenarioNet}. Em {months} meses, o saldo estimado é {finalBalance}.',
      'scenarioResult.advisorSpeech.actionNeeded':
        'Bah, aqui tem que cuidar. O baseline é {baseline} por mês, mas o cenário pesa {impact}. O líquido vira {scenarioNet} por mês e pode entrar em risco até {riskMonth}.'
    },
    carioca_funk: {
      'scenarioResult.monthlyImpact': 'Batida mensal no caixa',
      'scenarioResult.projectionBasisLabel': 'Visão do corre',
      'scenarioResult.forecastExplainer':
        'É mês a mês no ritmo: entra o baseline, entra a mudança, e a projeção mostra se o caixa sustenta o plano.',
      'scenarioResult.summary.watch':
        'Ainda fica no positivo, mas o corre aperta {count} meta(s). A primeira na pressão é {goal}.',
      'scenarioResult.summary.stable':
        'Segue no positivo: com esse cenário, o caixa ainda manda {scenarioNet} por mês.',
      'scenarioResult.summary.actionNeeded':
        'Alerta no corre: desse jeito o caixa pode virar negativo até {riskMonth}.',
      'scenarioResult.advisorSpeech.watch':
        'Olha o corre. Teu plano entra com {baseline} por mês. Esse cenário bate {impact} no caixa, então ainda sobra {scenarioNet} por mês. Em {months} meses, a projeção fecha em {finalBalance}. Não quebrou, mas {goal} já sentiu o grave.',
      'scenarioResult.advisorSpeech.stable':
        'Boa. O plano entra com {baseline} por mês, o cenário muda {impact}, e o caixa ainda manda {scenarioNet} por mês. Em {months} meses, a projeção fica em {finalBalance}.',
      'scenarioResult.advisorSpeech.actionNeeded':
        'Alerta no corre. A base é {baseline} por mês, mas esse cenário joga {impact} no caixa. O líquido vira {scenarioNet} por mês e pode ficar negativo até {riskMonth}. Melhor recalibrar.'
    },
    founder: {
      'scenarioResult.monthlyImpact': 'Recurring cashflow delta',
      'scenarioResult.projectionBasisLabel': 'Runway math',
      'scenarioResult.forecastExplainer':
        'Each month compounds the baseline and the recurring delta, so the table shows runway movement over time.',
      'scenarioResult.summary.watch':
        'Cash stays positive, but {count} goal(s) lose room, starting with {goal}.',
      'scenarioResult.summary.stable':
        'Runway remains healthy: after this move, projected net is {scenarioNet} per month.',
      'scenarioResult.summary.actionNeeded':
        'This move threatens runway: projected cash may go negative by {riskMonth}.',
      'scenarioResult.advisorSpeech.watch':
        'Runway check. Baseline is {baseline} per month. This move changes cashflow by {impact} per month, leaving projected net at {scenarioNet}. After {months} months, projected balance is {finalBalance}. Cash stays positive, but {goal} loses room.',
      'scenarioResult.advisorSpeech.stable':
        'Runway looks healthy. Baseline is {baseline} per month, this move changes cashflow by {impact}, and projected net becomes {scenarioNet}. After {months} months, projected balance is {finalBalance}.',
      'scenarioResult.advisorSpeech.actionNeeded':
        'Runway warning. Baseline is {baseline} per month, but this move changes cashflow by {impact}. Projected net becomes {scenarioNet}, and cash may go negative by {riskMonth}.'
    }
  },
  en: {
    warm: {
      'scenarioResult.monthlyImpact': 'Recurring monthly change',
      'scenarioResult.projectionBasisLabel': 'How this moves over time',
      'scenarioResult.forecastExplainer':
        'Each month adds the expected baseline and applies the scenario change, so the balance moves step by step.',
      'scenarioResult.advisorSpeech.watch':
        'Let’s read this calmly. Your monthly baseline is {baseline}. This scenario changes cashflow by {impact}, so projected net becomes {scenarioNet} per month. After {months} months, projected balance is {finalBalance}. It stays positive, but {goal} gets tighter.',
      'scenarioResult.advisorSpeech.stable':
        'This looks steady. Monthly baseline is {baseline}, the scenario changes cashflow by {impact}, and projected net becomes {scenarioNet}. After {months} months, projected balance is {finalBalance}.',
      'scenarioResult.advisorSpeech.actionNeeded':
        'This needs attention. Monthly baseline is {baseline}, but this scenario changes cashflow by {impact}. Projected net becomes {scenarioNet}, and cash may go negative by {riskMonth}.'
    },
    founder: {
      'scenarioResult.monthlyImpact': 'Recurring cashflow delta',
      'scenarioResult.projectionBasisLabel': 'Runway math',
      'scenarioResult.forecastExplainer':
        'Each month compounds the baseline and the recurring delta, so the table shows runway movement over time.',
      'scenarioResult.advisorSpeech.watch':
        'Runway check. Baseline is {baseline} per month. This move changes cashflow by {impact} per month, leaving projected net at {scenarioNet}. After {months} months, projected balance is {finalBalance}. Cash stays positive, but {goal} loses room.',
      'scenarioResult.advisorSpeech.stable':
        'Runway looks healthy. Baseline is {baseline} per month, this move changes cashflow by {impact}, and projected net becomes {scenarioNet}. After {months} months, projected balance is {finalBalance}.',
      'scenarioResult.advisorSpeech.actionNeeded':
        'Runway warning. Baseline is {baseline} per month, but this move changes cashflow by {impact}. Projected net becomes {scenarioNet}, and cash may go negative by {riskMonth}.'
    }
  }
}

export function useAppVoice() {
  const { t, locale } = useI18n()
  const userStore = useUserStore()

  const appVoice = computed(() => normalizeAppVoice(userStore.getAppVoice))
  const voiceLocale = computed<VoiceLocale>(() => (String(locale.value).startsWith('en') ? 'en' : 'pt'))

  const resolveVoiceText = (key: string): string | null =>
    catalog[voiceLocale.value]?.[appVoice.value]?.[key] || null

  const tVoice = (key: string, fallbackKey: string, params?: Record<string, unknown>): string => {
    const voiceText = appVoice.value === 'default' ? null : resolveVoiceText(key)
    if (voiceText) return formatTemplate(voiceText, params)
    return t(fallbackKey, params || {})
  }

  return {
    appVoice,
    tVoice,
    resolveVoiceText
  }
}
