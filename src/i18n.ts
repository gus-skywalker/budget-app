import { createI18n } from 'vue-i18n'
import en from './assets/locales/en.json'
import pt from './assets/locales/pt.json'
import fr from './assets/locales/fr.json'
import { useUserStore } from './plugins/userStore'

type Locale = 'pt' | 'en' | 'fr'

const messages: Record<Locale, any> = { en, pt, fr }

/**
 * Mapeamento de códigos de idioma do backend (UPPERCASE) para i18n (lowercase)
 */
const languageMap: Record<string, Locale> = {
  'PT': 'pt',
  'EN': 'en',
  'FR': 'fr',
  'ES': 'pt', // Fallback para português (suporte parcial)
  'DE': 'pt'  // Fallback para português (suporte parcial)
}

/**
 * Obtém o locale inicial baseado no userStore ou navegador
 */
function getInitialLocale(): Locale {
  try {
    const userStore = useUserStore()
    const userLanguage = userStore.getLanguage
    return languageMap[userLanguage] || 'pt'
  } catch {
    // Se userStore não estiver disponível, usa português
    return 'pt'
  }
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
  const locale: Locale = languageMap[userLanguage] || 'pt'
  i18n.global.locale.value = locale
}

export default i18n
