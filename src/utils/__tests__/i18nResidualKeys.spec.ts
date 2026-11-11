import { describe, expect, it } from 'vitest'
import pt from '@/assets/locales/pt.json'
import en from '@/assets/locales/en.json'
import es from '@/assets/locales/es.json'
import fr from '@/assets/locales/fr.json'
import contentExperienceMessages from '@/assets/locales/modules/contentExperience'

describe('EV-08 residual interface translations', () => {
  it('keeps retry, account fallback, goal entitlement and download available in all four languages', () => {
    for (const [language, messages] of Object.entries({ pt, en, es, fr })) {
      expect(messages.common.retry, `${language}: common.retry`).toBeTruthy()
      expect(messages.accounts.account_type_unavailable, `${language}: accounts.account_type_unavailable`).toBeTruthy()
      expect(messages.financial_goals.ai_upgrade_cta, `${language}: financial_goals.ai_upgrade_cta`).toBeTruthy()
      expect(messages.financial_goals.ai_premium_locked, `${language}: financial_goals.ai_premium_locked`).toBeTruthy()
      const moduleMessages = contentExperienceMessages[language as keyof typeof contentExperienceMessages]
      expect(moduleMessages.contentExperience.common.download, `${language}: contentExperience.common.download`).toBeTruthy()
    }
  })
})
