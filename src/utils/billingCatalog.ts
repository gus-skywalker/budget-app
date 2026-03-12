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

export const getStripePriceEnvKey = (
  plan: BillingCatalogPlanId,
  currency: BillingCatalogCurrency
): string => `VITE_STRIPE_PRICE_${plan}_${currency}`

export const listRequiredStripePriceEnvKeys = (): string[] =>
  BILLING_CATALOG_PLANS.flatMap((plan) =>
    BILLING_CATALOG_CURRENCIES.map((currency) => getStripePriceEnvKey(plan, currency))
  )

export interface BillingCatalogResolution {
  plan: BillingCatalogPlanId
  currency: BillingCatalogCurrency
  stripePriceEnvKey: string
}

export const buildExpectedBillingCatalog = (): BillingCatalogResolution[] =>
  BILLING_CATALOG_PLANS.flatMap((plan) =>
    BILLING_CATALOG_CURRENCIES.map((currency) => ({
      plan,
      currency,
      stripePriceEnvKey: getStripePriceEnvKey(plan, currency)
    }))
  )
