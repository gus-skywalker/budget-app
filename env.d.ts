/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_AUTH_URL: string
  readonly VITE_PAYMENT_URL: string

  readonly VITE_STRIPE_PRICE_STARTER_MONTHLY?: string
  readonly VITE_STRIPE_PRICE_STARTER_ANNUAL?: string
  readonly VITE_STRIPE_PRICE_TEAM_MONTHLY?: string
  readonly VITE_STRIPE_PRICE_TEAM_ANNUAL?: string

  // Legacy fallback keys (plan + currency)
  readonly VITE_STRIPE_PRICE_MONTHLY_BRL?: string
  readonly VITE_STRIPE_PRICE_MONTHLY_USD?: string
  readonly VITE_STRIPE_PRICE_MONTHLY_EUR?: string
  readonly VITE_STRIPE_PRICE_ANNUAL_BRL?: string
  readonly VITE_STRIPE_PRICE_ANNUAL_USD?: string
  readonly VITE_STRIPE_PRICE_ANNUAL_EUR?: string
  readonly VITE_STRIPE_PRICE_BUSINESS_MONTHLY_BRL?: string
  readonly VITE_STRIPE_PRICE_BUSINESS_MONTHLY_USD?: string
  readonly VITE_STRIPE_PRICE_BUSINESS_MONTHLY_EUR?: string
  readonly VITE_STRIPE_PRICE_BUSINESS_ANNUAL_BRL?: string
  readonly VITE_STRIPE_PRICE_BUSINESS_ANNUAL_USD?: string
  readonly VITE_STRIPE_PRICE_BUSINESS_ANNUAL_EUR?: string

  readonly VITE_FX_BRL_USD?: string
  readonly VITE_FX_BRL_EUR?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

export {}
