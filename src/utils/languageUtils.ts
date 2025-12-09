/**
 * Utilitários para gerenciamento de idiomas
 * Conforme contrato da API: https://aka.ms/language-contract
 */

export type Language = 'PT' | 'EN' | 'FR' | 'ES' | 'DE'
export type ApiLanguage = 'pt' | 'en' | 'fr'

/**
 * Idiomas com suporte completo no backend (Auth + Budget API)
 */
export const FULLY_SUPPORTED_LANGUAGES: Language[] = ['PT', 'EN', 'FR']

/**
 * Idiomas com suporte parcial (apenas Auth Service)
 */
export const PARTIALLY_SUPPORTED_LANGUAGES: Language[] = ['ES', 'DE']

/**
 * Todos os idiomas disponíveis
 */
export const ALL_LANGUAGES: Language[] = [
  ...FULLY_SUPPORTED_LANGUAGES,
  ...PARTIALLY_SUPPORTED_LANGUAGES
]

/**
 * Mapeamento de códigos de idioma para nomes legíveis
 */
export const LANGUAGE_NAMES: Record<Language, string> = {
  PT: 'Português',
  EN: 'English',
  FR: 'Français',
  ES: 'Español',
  DE: 'Deutsch'
}

/**
 * Converte idioma do usuário (UPPERCASE) para formato de API (lowercase)
 * Implementa fallback para idiomas não totalmente suportados
 * 
 * @param userLanguage - Idioma do usuário em UPPERCASE (PT, EN, FR, ES, DE)
 * @returns Idioma em lowercase para usar em chamadas de API (pt, en, fr)
 * 
 * @example
 * getApiLanguage('PT') // 'pt'
 * getApiLanguage('EN') // 'en'
 * getApiLanguage('ES') // 'pt' (fallback - suporte parcial)
 * getApiLanguage('DE') // 'pt' (fallback - suporte parcial)
 */
export function getApiLanguage(userLanguage: string): ApiLanguage {
  const lang = userLanguage.toUpperCase() as Language
  
  // Se é um idioma totalmente suportado, retorna em lowercase
  if (FULLY_SUPPORTED_LANGUAGES.includes(lang)) {
    return lang.toLowerCase() as ApiLanguage
  }
  
  // Fallback para português se idioma não for totalmente suportado
  return 'pt'
}

/**
 * Verifica se um idioma tem suporte completo (Auth + Budget API)
 * 
 * @param language - Código do idioma
 * @returns true se o idioma tem suporte completo
 */
export function isFullySupported(language: string): boolean {
  const lang = language.toUpperCase() as Language
  return FULLY_SUPPORTED_LANGUAGES.includes(lang)
}

/**
 * Verifica se um idioma tem suporte parcial (apenas Auth Service)
 * 
 * @param language - Código do idioma
 * @returns true se o idioma tem apenas suporte parcial
 */
export function isPartiallySupported(language: string): boolean {
  const lang = language.toUpperCase() as Language
  return PARTIALLY_SUPPORTED_LANGUAGES.includes(lang)
}

/**
 * Retorna o nome legível de um idioma
 * 
 * @param language - Código do idioma
 * @returns Nome do idioma em sua própria língua
 */
export function getLanguageName(language: string): string {
  const lang = language.toUpperCase() as Language
  return LANGUAGE_NAMES[lang] || 'Português'
}

/**
 * Valida se um código de idioma é válido
 * 
 * @param language - Código do idioma
 * @returns true se o idioma é válido
 */
export function isValidLanguage(language: string): boolean {
  const lang = language.toUpperCase() as Language
  return ALL_LANGUAGES.includes(lang)
}
