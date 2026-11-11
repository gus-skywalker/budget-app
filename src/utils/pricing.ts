export type SupportedCurrency = 'BRL' | 'USD' | 'EUR'

export interface BillingPricingContext {
  preferredCurrency: SupportedCurrency
  countryCode: string | null
  browserLocale: string | null
  uiLocale: string | null
}

type ExchangeRateMap = Record<SupportedCurrency, number>

const DEFAULT_BRL_BASE_RATES: ExchangeRateMap = {
  BRL: 1,
  USD: 0.2,
  EUR: 0.18
}

const COUNTRY_TO_CURRENCY: Record<string, SupportedCurrency> = {
  BR: 'BRL',
  US: 'USD',
  CA: 'USD',
  MX: 'USD',
  AR: 'USD',
  CL: 'USD',
  CO: 'USD',
  PE: 'USD',
  GB: 'EUR',
  IE: 'EUR',
  PT: 'EUR',
  ES: 'EUR',
  FR: 'EUR',
  DE: 'EUR',
  IT: 'EUR',
  NL: 'EUR',
  BE: 'EUR',
  LU: 'EUR'
}

const LOCALE_TO_COUNTRY: Record<string, string> = {
  pt: 'BR',
  en: 'US',
  es: 'ES',
  fr: 'FR'
}

const toNumberOrFallback = (value: unknown, fallback: number): number => {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

const getExchangeRatesFromEnv = (): ExchangeRateMap => ({
  BRL: 1,
  USD: toNumberOrFallback(import.meta.env.VITE_FX_BRL_USD, DEFAULT_BRL_BASE_RATES.USD),
  EUR: toNumberOrFallback(import.meta.env.VITE_FX_BRL_EUR, DEFAULT_BRL_BASE_RATES.EUR)
})

const normalizeLocale = (value: string | null | undefined): string =>
  String(value || '').trim().toLowerCase()

const normalizeCountry = (value: string | null | undefined): string =>
  String(value || '').trim().slice(0, 2).toUpperCase()

export const detectCountryFromLocale = (locale: string | null | undefined): string | null => {
  const normalized = normalizeLocale(locale)
  if (!normalized) return null

  const parts = normalized.split(/[-_]/)
  if (parts.length > 1) {
    const region = normalizeCountry(parts[1])
    if (region) return region
  }

  const language = parts[0]
  return LOCALE_TO_COUNTRY[language] || null
}

export const resolveCurrencyByCountry = (countryCode: string | null | undefined): SupportedCurrency => {
  const country = normalizeCountry(countryCode)
  if (!country) return 'BRL'
  return COUNTRY_TO_CURRENCY[country] || 'USD'
}

export const resolvePricingCurrency = (params: {
  locale?: string | null
  browserLocale?: string | null
  countryCode?: string | null
}): SupportedCurrency => {
  const explicitCountry = normalizeCountry(params.countryCode)
  if (explicitCountry) return resolveCurrencyByCountry(explicitCountry)

  const countryFromLocale = detectCountryFromLocale(params.locale)
  if (countryFromLocale) return resolveCurrencyByCountry(countryFromLocale)

  const countryFromBrowser = detectCountryFromLocale(params.browserLocale)
  if (countryFromBrowser) return resolveCurrencyByCountry(countryFromBrowser)

  return 'BRL'
}

export const resolveFormattingLocale = (params: {
  uiLocale?: string | null
  currency: SupportedCurrency
}): string => {
  const locale = normalizeLocale(params.uiLocale)
  if (locale.startsWith('pt')) return 'pt-BR'
  if (locale.startsWith('en')) return 'en-US'
  if (locale.startsWith('es')) return 'es-ES'
  if (locale.startsWith('fr')) return 'fr-FR'

  if (params.currency === 'USD') return 'en-US'
  if (params.currency === 'EUR') return 'fr-FR'
  return 'pt-BR'
}

export const convertFromBRL = (amountInBRL: number, targetCurrency: SupportedCurrency): number => {
  const rates = getExchangeRatesFromEnv()
  const amount = Number(amountInBRL || 0)
  return amount * rates[targetCurrency]
}

export const formatConvertedPriceFromBRL = (params: {
  amountInBRL: number
  targetCurrency: SupportedCurrency
  uiLocale?: string | null
}): string => {
  const convertedAmount = convertFromBRL(params.amountInBRL, params.targetCurrency)
  const locale = resolveFormattingLocale({ uiLocale: params.uiLocale, currency: params.targetCurrency })

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: params.targetCurrency
  }).format(convertedAmount)
}

export const buildBillingPricingContext = (params: {
  uiLocale?: string | null
  browserLocale?: string | null
  countryCode?: string | null
}): BillingPricingContext => {
  const countryCode = normalizeCountry(params.countryCode)
    || detectCountryFromLocale(params.uiLocale)
    || detectCountryFromLocale(params.browserLocale)
    || null

  return {
    preferredCurrency: resolvePricingCurrency({
      locale: params.uiLocale,
      browserLocale: params.browserLocale,
      countryCode
    }),
    countryCode,
    browserLocale: params.browserLocale || null,
    uiLocale: params.uiLocale || null
  }
}
