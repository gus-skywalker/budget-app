import { describe, expect, it } from 'vitest'
import {
  normalizeTransactionVisibilityScope,
  toTransactionVisibilityScopeRequest,
} from '@/types/financialRead'

describe('financialRead visibility normalization', () => {
  it('normalizes legacy COMPANY and missing scope to WORKSPACE', () => {
    expect(normalizeTransactionVisibilityScope('COMPANY')).toBe('WORKSPACE')
    expect(normalizeTransactionVisibilityScope(undefined)).toBe('WORKSPACE')
    expect(normalizeTransactionVisibilityScope(null)).toBe('WORKSPACE')
  })

  it('preserves PRIVATE and emits canonical WORKSPACE for shared requests', () => {
    expect(normalizeTransactionVisibilityScope('PRIVATE')).toBe('PRIVATE')
    expect(toTransactionVisibilityScopeRequest('PRIVATE')).toBe('PRIVATE')
    expect(toTransactionVisibilityScopeRequest('COMPANY')).toBe('WORKSPACE')
    expect(toTransactionVisibilityScopeRequest('WORKSPACE')).toBe('WORKSPACE')
  })
})

