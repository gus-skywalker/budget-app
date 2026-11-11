import { createI18n } from 'vue-i18n'
import en from './assets/locales/en.json'
import pt from './assets/locales/pt.json'
import fr from './assets/locales/fr.json'
import es from './assets/locales/es.json'
import landingPageMessages from './assets/locales/modules/landingPage'
import contentExperienceMessages from './assets/locales/modules/contentExperience'
import { useUserStore } from './plugins/userStore'
import { toUiLocale, type UiLocale } from './utils/languageUtils'

type Locale = UiLocale

const messages: Record<Locale, any> = {
  en: { ...en, ...landingPageMessages.en, ...contentExperienceMessages.en },
  pt: { ...pt, ...landingPageMessages.pt, ...contentExperienceMessages.pt },
  fr: { ...fr, ...landingPageMessages.fr, ...contentExperienceMessages.fr },
  es: { ...es, ...landingPageMessages.es, ...contentExperienceMessages.es }
}

/**
 * Obtém o locale inicial baseado no userStore ou navegador
 */
function getInitialLocale(): Locale {
  try {
    const userStore = useUserStore()
    const userLanguage = userStore.getLanguage
    if (userLanguage) {
      return toUiLocale(userLanguage)
    }
  } catch {
    // Ignore store errors and fallback to browser below.
  }

  return toUiLocale(typeof navigator !== 'undefined' ? navigator.language : null)
}

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: getInitialLocale(),
  fallbackLocale: 'pt',
  messages
})

/**
 * Atualiza o locale do i18n baseado no idioma do usuário
 * @param userLanguage - Idioma do usuário em UPPERCASE (PT, EN, FR, ES, DE)
 */
export function updateI18nLocale(userLanguage: string) {
  const locale: Locale = toUiLocale(userLanguage)
  i18n.global.locale.value = locale
}

export default i18n
