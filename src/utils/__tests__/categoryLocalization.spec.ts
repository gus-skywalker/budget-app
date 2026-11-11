import { describe, expect, it, vi } from 'vitest'
import { localizeCategory } from '@/utils/categoryLocalization'

const messages: Record<string, string> = {
  'categories.travel': 'Viagens',
  'reportAnalytics.uncategorized': 'Sem categoria',
  'reportAnalytics.customCategory': 'Categoria personalizada',
  'reportAnalytics.unknownCategory': 'Categoria padrão sem tradução',
}

const options = (onMissingCode = vi.fn()) => ({
  translate: (key: string) => messages[key] || key,
  hasTranslation: (key: string) => Object.prototype.hasOwnProperty.call(messages, key),
  onMissingCode,
})

describe('categoryLocalization', () => {
  it('localizes a standard category from its stable code', () => {
    expect(localizeCategory({ categoryId: 1, categoryCode: 'TRAVEL', categoryName: 'Travel', systemDefined: true }, options()))
      .toBe('Viagens')
  })

  it('preserves the workspace name for a custom category', () => {
    expect(localizeCategory({ categoryId: 2, categoryCode: 'family_project', categoryName: 'Projeto da família', systemDefined: false }, options()))
      .toBe('Projeto da família')
  })

  it('uses an observable controlled fallback for an unknown standard code', () => {
    const onMissingCode = vi.fn()
    expect(localizeCategory({ categoryId: 3, categoryCode: 'new_standard', categoryName: 'New Standard', systemDefined: true }, options(onMissingCode)))
      .toBe('Categoria padrão sem tradução')
    expect(onMissingCode).toHaveBeenCalledWith('new_standard')
  })

  it('labels an absent category as uncategorized', () => {
    expect(localizeCategory(null, options())).toBe('Sem categoria')
  })
})
