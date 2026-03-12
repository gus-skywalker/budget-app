import { createI18n } from 'vue-i18n'
import en from './assets/locales/en.json'
import pt from './assets/locales/pt.json'
import fr from './assets/locales/fr.json'
import es from './assets/locales/es.json'
import landingPageMessages from './assets/locales/modules/landingPage'
import { useUserStore } from './plugins/userStore'

type Locale = 'pt' | 'en' | 'fr' | 'es'

const messages: Record<Locale, any> = {
  en: { ...en, ...landingPageMessages.en },
  pt: { ...pt, ...landingPageMessages.pt },
  fr: { ...fr, ...landingPageMessages.fr },
  es: { ...es, ...landingPageMessages.es }
}

/**
 * Mapeamento de códigos de idioma do backend (UPPERCASE) para i18n (lowercase)
 */
const languageMap: Record<string, Locale> = {
  'PT': 'pt',
  'EN': 'en',
  'FR': 'fr',
  'ES': 'es',  // Español agora com suporte completo
  'DE': 'pt'   // Fallback para português (suporte parcial)
}

const resolveLocale = (raw?: string | null): Locale | null => {
  if (!raw) {
    return null
  }

  const normalized = String(raw).trim()
  if (!normalized) {
    return null
  }

  const base = normalized.split(/[-_]/)[0]?.toUpperCase()
  if (!base) {
    return null
  }

  return languageMap[base] || null
}

/**
 * Obtém o locale inicial baseado no userStore ou navegador
 */
function getInitialLocale(): Locale {
  try {
    const userStore = useUserStore()
    const userLanguage = userStore.getLanguage
    const resolvedUserLocale = resolveLocale(userLanguage)
    if (resolvedUserLocale) {
      return resolvedUserLocale
    }
  } catch {
    // Ignore store errors and fallback to browser below.
  }

  const browserLocale = resolveLocale(typeof navigator !== 'undefined' ? navigator.language : null)
  return browserLocale || 'pt'
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
  const locale: Locale = resolveLocale(userLanguage) || 'pt'
  i18n.global.locale.value = locale
}

export default i18n
