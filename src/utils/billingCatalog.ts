import type { PlanId } from '@/constants/plans'
import type { SupportedCurrency } from '@/utils/pricing'

export type BillingCatalogPlanId = PlanId
export type BillingCatalogCurrency = SupportedCurrency

export const BILLING_CATALOG_PLANS: BillingCatalogPlanId[] = [
  'MONTHLY',
  'ANNUAL',
  'BUSINESS_MONTHLY',
  'BUSINESS_ANNUAL'
]

export const BILLING_CATALOG_CURRENCIES: BillingCatalogCurrency[] = ['BRL', 'USD', 'EUR']

const BACKEND_STRIPE_PRICE_ENV_KEY_BY_PLAN: Record<BillingCatalogPlanId, string> = {
  MONTHLY: 'VITE_STRIPE_PRICE_STARTER_MONTHLY',
  ANNUAL: 'VITE_STRIPE_PRICE_STARTER_ANNUAL',
  BUSINESS_MONTHLY: 'VITE_STRIPE_PRICE_TEAM_MONTHLY',
  BUSINESS_ANNUAL: 'VITE_STRIPE_PRICE_TEAM_ANNUAL'
}

export const getStripePriceEnvKey = (
  plan: BillingCatalogPlanId,
  _currency?: BillingCatalogCurrency
): string => BACKEND_STRIPE_PRICE_ENV_KEY_BY_PLAN[plan]

export const getLegacyStripePriceEnvKey = (
  plan: BillingCatalogPlanId,
  currency: BillingCatalogCurrency
): string => `VITE_STRIPE_PRICE_${plan}_${currency}`

export const listRequiredStripePriceEnvKeys = (): string[] =>
  BILLING_CATALOG_PLANS.map((plan) => getStripePriceEnvKey(plan))

export const listLegacyStripePriceEnvKeys = (): string[] =>
  BILLING_CATALOG_PLANS.flatMap((plan) =>
    BILLING_CATALOG_CURRENCIES.map((currency) => getLegacyStripePriceEnvKey(plan, currency))
  )

export interface BillingCatalogResolution {
  plan: BillingCatalogPlanId
  currency: BillingCatalogCurrency
  stripePriceEnvKey: string
  legacyStripePriceEnvKey: string
}

export interface BillingCatalogEnvTemplateEntry extends BillingCatalogResolution {
  exampleValue: string
  line: string
  legacyLine: string
}

export const buildExpectedBillingCatalog = (): BillingCatalogResolution[] =>
  BILLING_CATALOG_PLANS.flatMap((plan) =>
    BILLING_CATALOG_CURRENCIES.map((currency) => ({
      plan,
      currency,
      stripePriceEnvKey: getStripePriceEnvKey(plan, currency),
      legacyStripePriceEnvKey: getLegacyStripePriceEnvKey(plan, currency)
    }))
  )

export const buildBillingEnvTemplate = (): BillingCatalogEnvTemplateEntry[] =>
  buildExpectedBillingCatalog().map((entry) => {
    const canonicalExampleValue = `price_${entry.plan.toLowerCase()}_xxxx`
    const legacyExampleValue = `price_${entry.plan.toLowerCase()}_${entry.currency.toLowerCase()}_xxxx`

    return {
      ...entry,
      exampleValue: canonicalExampleValue,
      line: `${entry.stripePriceEnvKey}=${canonicalExampleValue}`,
      legacyLine: `${entry.legacyStripePriceEnvKey}=${legacyExampleValue}`
    }
  })

export const buildBillingEnvTemplateText = (): string => {
  const canonicalLines = BILLING_CATALOG_PLANS.map(
    (plan) => `${getStripePriceEnvKey(plan)}=price_${plan.toLowerCase()}_xxxx`
  )
  const legacyLines = buildBillingEnvTemplate().map((entry) => entry.legacyLine)

  return [
    '# Canonical keys (backend-compatible)',
    ...canonicalLines,
    '',
    '# Legacy keys (temporary fallback)',
    ...legacyLines
  ].join('\n')
}

export const buildStripePriceMatrix = (): Record<BillingCatalogPlanId, Record<BillingCatalogCurrency, string>> => {
  return BILLING_CATALOG_PLANS.reduce((acc, plan) => {
    acc[plan] = BILLING_CATALOG_CURRENCIES.reduce((currencyAcc, currency) => {
      // Matrix remains by currency, but each plan now resolves to a canonical backend-compatible env key.
      currencyAcc[currency] = getStripePriceEnvKey(plan, currency)
      return currencyAcc
    }, {} as Record<BillingCatalogCurrency, string>)
    return acc
  }, {} as Record<BillingCatalogPlanId, Record<BillingCatalogCurrency, string>>)
}
