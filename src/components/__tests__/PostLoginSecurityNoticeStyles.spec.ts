import { describe, expect, it } from 'vitest'
import { compileStyle, parse } from '@vue/compiler-sfc'
import source from '@/components/PostLoginSecurityNotice.vue?raw'

describe('PostLoginSecurityNotice dark styles', () => {
  it('keeps the notice colors scoped instead of recoloring every dark component', () => {
    const { descriptor } = parse(source)
    const style = descriptor.styles[0]
    expect(style).toBeDefined()

    const { code, errors } = compileStyle({
      source: style.content,
      filename: 'PostLoginSecurityNotice.vue',
      id: 'security-notice-test',
      scoped: true,
    })

    expect(errors).toEqual([])
    expect(code).toContain('.v-theme--dark .security-notice__icon')
    expect(code).not.toMatch(/(?:^|})\s*\.v-theme--dark\s*\{/m)
  })
})
