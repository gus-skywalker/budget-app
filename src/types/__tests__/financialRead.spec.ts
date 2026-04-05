import { describe, expect, it } from 'vitest'
import {
  normalizeTransactionVisibilityScope,
  toTransactionVisibilityScopeRequest,
} from '@/types/financialRead'

describe('financialRead visibility normalization', () => {
  it('normalizes missing or shared scope to WORKSPACE', () => {
    expect(normalizeTransactionVisibilityScope('WORKSPACE')).toBe('WORKSPACE')
    expect(normalizeTransactionVisibilityScope(undefined)).toBe('WORKSPACE')
    expect(normalizeTransactionVisibilityScope(null)).toBe('WORKSPACE')
  })

  it('preserves PRIVATE and emits canonical WORKSPACE for shared requests', () => {
    expect(normalizeTransactionVisibilityScope('PRIVATE')).toBe('PRIVATE')
    expect(toTransactionVisibilityScopeRequest('PRIVATE')).toBe('PRIVATE')
    expect(toTransactionVisibilityScopeRequest('WORKSPACE')).toBe('WORKSPACE')
  })
})

