import { describe, expect, it } from 'vitest'

import {
  buildStripePriceMatrix,
  getLegacyStripePriceEnvKey,
  getStripePriceEnvKey,
  listRequiredStripePriceEnvKeys
} from '@/utils/billingCatalog'

describe('billingCatalog backend compatibility', () => {
  it('maps each plan to the canonical backend-compatible env key', () => {
    expect(getStripePriceEnvKey('MONTHLY', 'BRL')).toBe('VITE_STRIPE_PRICE_STARTER_MONTHLY')
    expect(getStripePriceEnvKey('ANNUAL', 'USD')).toBe('VITE_STRIPE_PRICE_STARTER_ANNUAL')
    expect(getStripePriceEnvKey('BUSINESS_MONTHLY', 'EUR')).toBe('VITE_STRIPE_PRICE_TEAM_MONTHLY')
    expect(getStripePriceEnvKey('BUSINESS_ANNUAL', 'BRL')).toBe('VITE_STRIPE_PRICE_TEAM_ANNUAL')
  })

  it('keeps legacy env key helper available for migration', () => {
    expect(getLegacyStripePriceEnvKey('MONTHLY', 'BRL')).toBe('VITE_STRIPE_PRICE_MONTHLY_BRL')
    expect(getLegacyStripePriceEnvKey('BUSINESS_ANNUAL', 'EUR')).toBe(
      'VITE_STRIPE_PRICE_BUSINESS_ANNUAL_EUR'
    )
  })

  it('lists only canonical required keys', () => {
    expect(listRequiredStripePriceEnvKeys()).toEqual([
      'VITE_STRIPE_PRICE_STARTER_MONTHLY',
      'VITE_STRIPE_PRICE_STARTER_ANNUAL',
      'VITE_STRIPE_PRICE_TEAM_MONTHLY',
      'VITE_STRIPE_PRICE_TEAM_ANNUAL'
    ])
  })

  it('returns a per-currency matrix pointing to canonical keys', () => {
    const matrix = buildStripePriceMatrix()

    expect(matrix.MONTHLY.BRL).toBe('VITE_STRIPE_PRICE_STARTER_MONTHLY')
    expect(matrix.MONTHLY.USD).toBe('VITE_STRIPE_PRICE_STARTER_MONTHLY')
    expect(matrix.BUSINESS_MONTHLY.EUR).toBe('VITE_STRIPE_PRICE_TEAM_MONTHLY')
    expect(matrix.BUSINESS_ANNUAL.BRL).toBe('VITE_STRIPE_PRICE_TEAM_ANNUAL')
  })
})

