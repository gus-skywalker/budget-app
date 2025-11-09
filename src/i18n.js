import { createI18n } from 'vue-i18n'
import en from './assets/locales/en.json'
import pt from './assets/locales/pt.json'

const messages = { en, pt }

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: 'pt',
  fallbackLocale: 'pt',
  messages
})

export default i18n
